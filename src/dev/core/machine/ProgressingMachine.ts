/// <reference path="Base.ts" /> 

namespace Machine {
   export abstract class ProgressingMachine extends MachineBase implements EnergyTile {
      energyNode: EnergyTileNode;
      energyTypes: object;
      basePower: number;

      defaultValues = {
         energy: 0
      };

      data: this["defaultValues"];
      //tier: number;

      getTier(): number {
         return 1;
      }
      getEnergyStorage(): number {
         return 0;
      }

      chargeSlot(slotName: string) {
         this.data.energy -= ChargeItemRegistry.addEnergyToSlot(this.container.getSlot(slotName), "Rf", this.data.energy, this.getTier());
      }

      dischargeSlot(slotName: string) {
         let amount = this.getEnergyStorage() - this.data.energy;
         this.data.energy += ChargeItemRegistry.getEnergyFromSlot(this.container.getSlot(slotName), "Rf", amount, this.getTier());
      }

      onItemUse(coords: Callback.ItemUseCoordinates, item: ItemStack, player: number): boolean {
         return super.onItemUse(coords, item, player);
      }

      energyTick(type: string, src: EnergyTileNode): void { }

      energyReceive(type: string, amount: number, voltage: number): number {
         let maxVoltage = this.basePower || 20;
         if (voltage > maxVoltage) {
            amount = Math.min(amount, maxVoltage);
         }
         let add = Math.min(amount, this.getEnergyStorage() - this.data.energy);
         this.data.energy += add;
         return add;
      }

      canReceiveEnergy(side: number, type: string): boolean {
         return true;
      }

      canExtractEnergy(side: number, type: string): boolean {
         return false;
      }

      rebuildGrid(): void {
         this.energyNode.resetConnections();
         EnergyGridBuilder.buildGridForTile(this);
      }

      getRelativeEnergy() {
         return this.data.energy / this.getEnergyStorage() || 0
      }

      isConductor(type: string): boolean {
         return false;
      }

      destroyBlock(coords: Callback.ItemUseCoordinates, player: number): void {
         let _region = BlockSource.getDefaultForActor(player);
         let extra = new ItemExtraData();
         if (this.data.energy > 0) {
            extra.putInt("energy", this.data.energy);
         }

         extra.putSerializable("container", this.container);
         let slots = this.container.slots;
         for (let i in slots)
            this.container.clearSlot(i);

         _region.spawnDroppedItem(coords.x, coords.y, coords.z,
            this.blockID, 1, 0, extra)
      }

      destroyWithWrench(coords: Vector, player: number): void {
         let _region = BlockSource.getDefaultForActor(player);
         let extra = new ItemExtraData();
         if (this.data.energy > 0) {
            extra.putInt("energy", this.data.energy);
         }
         extra.putSerializable("container", this.container);
         let slots = this.container.slots;
         for (let i in slots)
            this.container.clearSlot(i);

         _region.spawnDroppedItem(coords.x, coords.y, coords.z,
            this.blockID, 1, 0, extra)
      }

   }
}