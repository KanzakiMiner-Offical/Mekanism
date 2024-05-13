interface IUpgrades {
   type: string;
   getSpeedMultiplier?(item: ItemInstance, machine: TileEntity): number;
   getEnergyEfficiency?(item: ItemInstance, machine: TileEntity): number;
   muteMachine?(item: ItemInstance, machine: TileEntity): boolean

   onTick?(item: ItemInstance, machinse: TileEntity): void;
}

const SpeedMultiplier = [1, 1.33, 1.78, 2.37, 3.16, 4.22, 5.62, 7.5, 10.0] // ((Math.pow(1*(1+ 0.33), 3)))
namespace UpgradesAPI {
   export let EnergyMultiplier = 10.0;
   let data = {};

   export function getUpgrade(id: number): IUpgrades {
      return data[id];
   }

   export function isUpgrade(id: number): boolean {
      return !!data[id];
   }

   export function isValidUpgrade(id: number, machine: TileEntity): boolean {
      const upgrade = getUpgrade(id);
      const validUpgrade = machine["upgrades"];
      if (upgrade && (!validUpgrade || validUpgrade.indexOf(upgrade.type) != -1)) {
         return true;
      }
      return false;
   }

   export function registerUpgrade(id: number, upgrade: IUpgrades): void {
      data[id] = upgrade;
   }

   export function useUpgrade(machine: TileEntity): UpgradeSet {
      return new UpgradeSet(machine);
   }

   export class UpgradeSet {
      speedModifier: number;
      energyModifier: number;

      constructor(protected tileEntity: TileEntity) {
         this.resetRates();
         this.useUpgrade();
      }

      resetRates(): void {
         this.speedModifier = 1;
         this.energyModifier = 1
      }

      useUpgrade(): void {
         const container = this.tileEntity.container;
         for (let slotName in container.slots) {
            if (slotName.match(/Upgrade/)) {
               const slot = container.getSlot(slotName);
               const upgrade = getUpgrade(slot.id);
               if (upgrade && this.isValidUpgrade(upgrade)) {
                  this.executeUprade(upgrade, slot);
               }
            }
         }
      }

      isValidUpgrade(upgrade: IUpgrades): boolean {
         const validUpgrade = this.tileEntity["upgrades"];
         return (!validUpgrade || validUpgrade.indexOf(upgrade.type) != -1);
      }

      executeUprade(upgrade: IUpgrades, stack: ItemInstance) {
         if (upgrade.type == "speed") {
            this.speedModifier = stack.count;
         }
         if (upgrade.type == "energy") {
            this.energyModifier = stack.count
         }
         if ("onTick" in upgrade) {
            upgrade.onTick(stack, this.tileEntity);
         }
      }
      // get data from Tile Entity

      getEnergyUsage(defaultUse: number): number {
         let powerUse = defaultUse * Math.pow(UpgradesAPI.EnergyMultiplier, (2 * this.speedModifier - this.energyModifier) / 8)
         return powerUse
      }

      getEnergyCapacity(defaultEnergyCapacity: number): number { // MaxEnergy = DefaultEnergy x pow(UpgradeMultiplier, EnergyUpgrades/8)
         const energyCapacity = Math.floor(defaultEnergyCapacity * Math.pow(UpgradesAPI.EnergyMultiplier, this.energyModifier / 8));
         const tileData = this.tileEntity.data;
         tileData.energy = Math.min(tileData.energy, energyCapacity);
         return energyCapacity;
      }

      getSpeed(defaultSpeed: number): number {
         return defaultSpeed * SpeedMultiplier[this.speedModifier]
      }
      
      getSpeedMultiplier(): number {
         return this.speedModifier
      }

   }
}