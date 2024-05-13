namespace MachineRegistry {
   const machineIDs = {}

   export function isMachine(id: number): boolean {
      return !!machineIDs[id];
   }

   export function registerPrototype(id: number, Prototype: TileEntity.TileEntityPrototype) {
      // setup legacy prototypes
      if (!(Prototype instanceof Machine.MachineBase)) {
         const BasePrototype = Machine.MachineBase.prototype;
         Prototype.id = id;
         Prototype.getDefaultDrop ??= BasePrototype.getDefaultDrop;
         Prototype.adjustDrop ??= BasePrototype.adjustDrop;
         Prototype.destroyWithWrench ??= BasePrototype.destroyWithWrench
         Prototype.setActive ??= function(isActive: boolean) {
            if (this.data.isActive != isActive) {
               this.data.isActive = isActive;
               TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (isActive ? 4 : 0));
            }
         }
         Prototype.activate ??= function() {
            this.setActive(true);
         }
         Prototype.deactivate ??= function() {
            this.setActive(false);
         }
      }

      // register prototype
      machineIDs[id] = true;
      TileEntity.registerPrototype(id, Prototype);
      //setMachineDrop(id, Prototype.defaultDrop);
      BlockRegistry.setBlockMaterial(id, "stone")
      if (Prototype instanceof Machine.ProgressingMachine) {
         // wire connection
         ICRender.getGroup("rf-wire").add(id, -1);
         // register for energy net
         EnergyTileRegistry.addEnergyTypeForId(id, RF);
      }
   }

   export function createStorageInterface(blockID: number, descriptor: StorageDescriptor) {
      descriptor.liquidUnitRatio = 0.001;
      descriptor.getInputTank ??= function() {
         return this.tileEntity.liquidTank;
      }
      descriptor.getOutputTank ??= function() {
         return this.tileEntity.liquidTank;
      }
      descriptor.canReceiveLiquid ??= function(liquid: string) {
         return this.getInputTank().isValidLiquid(liquid);
      }
      descriptor.canTransportLiquid ??= () => true;
      StorageInterface.createInterface(blockID, descriptor);
   }

   export function createMachineStorageInterface(blockID: number, descriptor: StorageDescriptor) {
      // descriptor.slots["slotAugment1"] = {
      //    input: false
      // }
      // descriptor.slots["slotAugment2"] = {
      //    input: false
      // }
      // descriptor.slots["slotAugment3"] = {
      //    input: false
      // }
      StorageInterface.createInterface(blockID, descriptor);
   }
   /*
     export function setStoragePlaceFunction(blockID: string | number, hasVerticalRotation ? : boolean) {
       Block.registerPlaceFunction(blockID, function(coords, item, block, player, blockSource) {
         const region = new WorldRegion(blockSource);
         const place = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
         const rotation = TileRenderer.getBlockRotation(player, hasVerticalRotation);
         region.setBlock(place, item.id, rotation);
         const tile = region.addTileEntity(place);
         if (item.extra) {
           tile.data.energy = item.extra.getInt("energy");
         }
       });
     }
   */
   export function setStoragePlaceFunction(blockID: string | number, hasVerticalRotation ? : boolean) {
      Block.registerPlaceFunction(blockID, function(coords, item, block, player, blockSource) {
         const region = new WorldRegion(blockSource);
         const place = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
         const rotation = TileRenderer.getBlockRotation(player, hasVerticalRotation);
         region.setBlock(place, item.id, rotation);
         const tile = region.addTileEntity(place);
         if (item.extra) {
            if (item.extra.getInt("energy"))
               tile.data.energy = item.extra.getInt("energy");
            tile.container = item.extra.getSerializable("container");
         }
      });
   }

   export function getThermalMachineID() {
      let machine_id = [];
      for (let key in machineIDs) {
         let input = key.split(":");
         machine_id.push(input[0]);
      }
      return machine_id
   }

   export function setMachineDrop(blockID: string | number, dropID ? : number) {
      dropID ??= Block.getNumericId(blockID);
      BlockRegistry.registerDrop(blockID, function(coords, blockID, blockData, level) {
         const drop = [];
         if (level >= ToolAPI.getBlockDestroyLevel(blockID)) {
            drop.push([dropID, 1, 0]);
         }
         return drop;
      });
   }

   export function fillTankOnClick(tank: BlockEngine.LiquidTank, item: ItemInstance, playerUid: number): boolean {
      const liquid = tank.getLiquidStored();
      const empty = LiquidItemRegistry.getEmptyItem(item.id, item.data);
      if (empty && (!liquid && tank.isValidLiquid(empty.liquid) || empty.liquid == liquid) && !tank.isFull()) {
         const player = new PlayerEntity(playerUid);
         const liquidLimit = tank.getLimit();
         const storedAmount = tank.getAmount(liquid);
         const count = Math.min(item.count, Math.floor((liquidLimit - storedAmount) / empty.amount));
         if (count > 0) {
            tank.addLiquid(empty.liquid, empty.amount * count);
            player.addItemToInventory(new ItemStack(empty.id, count, empty.data));
            item.count -= count;
            player.setCarriedItem(item);
         }
         else if (item.count == 1 && empty.storage) {
            const amount = Math.min(liquidLimit - storedAmount, empty.amount);
            tank.addLiquid(empty.liquid, amount);
            item.data += amount;
            player.setCarriedItem(item);
         }
         return true;
      }
      return false;
   }

   export function updateGuiHeader(gui: any, text: string): void {
      const header = gui.getWindow("header");
      header.contentProvider.drawing[2].text = Translation.translate(text);
   }
}

BlockRegistry.createBlockType("machine", {
   extends: "stone",
   destroyTime: 3
});

BlockRegistry.createBlockType("other-machine", {
   extends: "machine",
   solid: false
 });