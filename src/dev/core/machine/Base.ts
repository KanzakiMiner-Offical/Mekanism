/// <reference path="IWrench.ts" />
namespace Machine {
   export let { ClientSide, NetworkEvent, ContainerEvent } = BlockEngine.Decorators;
   export abstract class MachineBase
      extends TileEntityBase
      implements IWrench {
      upgrades?: string[];
      defaultDrop?: number;
      //configData = {};

      onInit(): void {
         this.networkData.putInt("blockId", this.blockID);
         this.networkData.putInt("facing", this.getFacing());
         this.networkData.sendChanges();
         this.setupContainer();
         delete this.liquidStorage;
      }

      setupContainer(): void { }

      addLiquidTank(name: string, limit: number, liquids?: string[]) {
         let tank = new BlockEngine.LiquidTank(this, name, limit, liquids);
         let liquid = this.liquidStorage.getLiquidStored();
         if (liquid) {
            let amount = this.liquidStorage.getLiquid(liquid, tank.getLimit() / 1000);
            tank.addLiquid(liquid, Math.round(amount * 1000));
         }
         return tank;
      }

      addGasTank(name: string, limit: number, gass?: string[]) {
         let tank = new BlockEngine.GasTank(this, name, limit, gass);
         let gas = this.liquidStorage.getLiquidStored();
         if (gas.includes("_gas")) {
            let amount = this.liquidStorage.getLiquid(gas, tank.getLimit() / 1000);
            tank.addGas(gas, Math.round(amount * 1000));
         }
         return tank;
      }

      canRotate(side: number): boolean {
         return false;
      }

      onItemUse(coords: Callback.ItemUseCoordinates, item: ItemStack, player: number): boolean {
         let side = coords.side;
         if (Entity.getSneaking(player)) {
            side ^= 1;
         }
         if (this.canRotate(side) && MekTool.isUseableWrench(item, 1)) {
            MekTool.rotateMachine(this, side, item, player);
            return true;
         }
         return false;
      }

      setActive(isActive: boolean): void {
         if (this.networkData.getBoolean("active") !== isActive) {
            this.networkData.putBoolean("active", isActive);
            this.networkData.sendChanges();
         }
      }

      isActive(): boolean {
         return this.networkData.getBoolean("active")
      }

      @ClientSide
      renderModel(): void {
         if (this.networkData.getBoolean("active")) {
            let blockId = Network.serverToLocalId(this.networkData.getInt("blockId"));
            let facing = this.networkData.getInt("facing");
            TileRenderer.mapAtCoords(this.x, this.y, this.z, blockId, facing);
         } else {
            BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
         }
      }

      clientLoad(): void {
         this.renderModel();
         this.networkData.addOnDataChangedListener((data, isExternal) => {
            this.renderModel();
         });
      }

      clientUnload(): void {
         BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
      }

      getFacing(): number {
         return this.blockSource.getBlockData(this.x, this.y, this.z);
      }

      setFacing(side: number): boolean {
         if (this.getFacing() != side) {
            this.blockSource.setBlock(this.x, this.y, this.z, this.blockID, side);
            this.networkData.putInt("blockData", side);
            this.networkData.sendChanges();
            return true;
         }
         return false;
      }

      decreaseSlot(slot: ItemContainerSlot, count: number): void {
         slot.count -= count;
         slot.markDirty();
         slot.validate();
      }

      destroyBlock(coords: Callback.ItemUseCoordinates, player: number): void {
         let _region = BlockSource.getDefaultForActor(player);
         let extra = new ItemExtraData();
         extra.putSerializable("container", this.container);
         let slots = this.container.slots;
         for (let i in slots)
            this.container.clearSlot(i);

         _region.spawnDroppedItem(coords.x, coords.y, coords.z,
            this.blockID, 1, 0, extra)
      }

      getDefaultDrop(): number {
         return this.defaultDrop ?? this.blockID;
      }

      adjustDrop(item: ItemInstance): ItemInstance {
         return item;
      }

      destroyWithWrench(coords: Vector, player: number): void {
         let _region = BlockSource.getDefaultForActor(player);
         let extra = new ItemExtraData();
         extra.putSerializable("container", this.container);
         let slots = this.container.slots;
         for (let i in slots)
            this.container.clearSlot(i);

         _region.spawnDroppedItem(coords.x, coords.y, coords.z,
            this.blockID, 1, 0, extra)
      }

   }
}