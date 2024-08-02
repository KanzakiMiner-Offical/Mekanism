BlockRegistry.createBlock("metallurgicInfuser", [
   { name: "Metallurgic Infuser", texture: [["MID", 0], ["MIT", 0], ["MIB", 0], ["MIF", 0], ["MIR1", 0], ["MIR", 0]], inCreative: true }], "machine");

BlockRegistry.setBlockMaterial(BlockID.metallurgicInfuser, "stone", 1);

MekModel.setInventoryModel(new ItemStack(BlockID["metallurgicInfuser"], 1, 0), "infuser/metallurgic_infuser", "infuser/metallurgic_infuser", {
   translate: [0, 0, 0], scale: [1, 1, 1], invertV: false, noRebuild: false
}, [0, 0, 0])
MekModel.setHandModel(new ItemStack(BlockID["metallurgicInfuser"], 1, 0), "infuser/metallurgic_infuser", "infuser/metallurgic_infuser", {
   translate: [0, 0, 0], scale: [1, 1, 1], invertV: false, noRebuild: false
})


MekModel.registerModelWithRotation(BlockID["metallurgicInfuser"], "resources/res/models/infuser/metallurgic_infuser", "metallurgic_infuser")


Callback.addCallback("PreLoaded", function () {
   Recipes.addShaped({ id: BlockID.metallurgicInfuser, count: 1, data: 0 },
      ["ese",
         "pgp",
         "ese"],
      ['e', VanillaItemID.iron_ingot, 0, 's', VanillaBlockID.furnace, 0, 'p', VanillaItemID.redstone, 0, 'g', ItemID.ingotOsmium, 0])
})

let guiMetallurgicInfuser = new UI.StandardWindow({
   standard: {
      header: { text: { text: "Metallurgic Infuser" } },
      inventory: { standard: true },
      background: { standard: true }
   },

   drawing: [
      { type: "background", color: Color.argb(90, 0, 0, 0) },
      { type: "bitmap", x: 350, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
      { type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
      { type: "bitmap", x: 555, y: 245, bitmap: "GuiProgress", scale: GUI_BAR_STANDARD_SCALE },
   ],

   elements: {
      "fuelScale": { type: "scale", x: 350 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleCoal", scale: GUI_BAR_STANDARD_SCALE },
      "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
      "progressScale": { type: "scale", x: 555, y: 245, direction: 0, value: 0, bitmap: "GuiProgressScale", scale: GUI_BAR_STANDARD_SCALE },
      "slotEnergy": { type: "slot", x: 820, y: 150 },
      "slotFuel": { type: "slot", x: 380, y: 150 },
      "slotInput": { type: "slot", x: 480, y: 220 },
      "slotResult": { type: "slot", x: 720, y: 220 },
      "slotUpgrade1": { type: "slot", x: 880, y: 50 + 2 * GUI_SCALE },
      "slotUpgrade2": { type: "slot", x: 880, y: 50 + 21 * GUI_SCALE },
      "dump": {
         type: "button",
         x: 380,
         y: 300,
         bitmap: "dump",
         scale: 2.2,
         clicker: {
            onClick: function (_, container: ItemContainer) {
               container.sendEvent("dump", {})
            }
         }
      }
   }
});


namespace Machine {
   export class Infuser extends ConfigMachine {
      defaultValues = {
         energy: 0,
         progress: 0
      }
      defaultEnergyStorage = 20000;
      defaultEnergyConsume = 20;
      defaultSpeed = 1;
      energyStorage: number;
      energyConsume: number;
      speed: number;
      processTime = 200;
      infuserTank: BlockEngine.LiquidTank;

      upgrades = ["speed", "energy"]

      getScreenByName(screenName: string, container: ItemContainer): UI.IWindow {
         return guiMetallurgicInfuser
      }

      useUpgrade(): UpgradesAPI.UpgradeSet {
         let upgrades = UpgradesAPI.useUpgrade(this);
         this.energyConsume = upgrades.getEnergyUsage(this.defaultEnergyConsume);
         this.energyStorage = upgrades.getEnergyCapacity(this.defaultEnergyStorage);
         this.speed = upgrades.getSpeed(this.defaultSpeed)
         return upgrades;
      }

      setupContainer(): void {

         this.infuserTank = this.addLiquidTank("infuser_tank", 10000, Infuser_Type.types)

         StorageInterface.setGlobalValidatePolicy(this.container, (name, id, amount, data) => {
            if (name.startsWith("slotUpgrade")) return UpgradesAPI.isValidUpgrade(id, this)
            if (name == "slotInput")
               return true// InfuserRecipe.isValidInput(new ItemStack(id, amount, data))
            if (name.startsWith("slotFuel")) return Infuser_Type.isInfuserType(new ItemStack(id, amount, data))
            if (name == "slotEnergy") return ChargeItemRegistry.isValidStorage(id, "Rf", 1);
            return false;
         });
      }

      initFuel(): void {
         let fuelSlot = this.container.getSlot("slotFuel")
         let fuel = Infuser_Type.getTypeFromItem(fuelSlot.id)
         // is it fuel ?
         if (!Infuser_Type.isInfuserType(fuelSlot)) {
            return;
         }
         // check storage
         if (this.infuserTank.getLiquidStored() && this.infuserTank.getLiquidStored() != fuel.type) {
            return;
         }
         // is full ?
         if (this.infuserTank.getAmount(fuel.type) >= (10000 - fuel.value)) {
            return;
         }
         // FILL TIME
         this.infuserTank.addLiquid(fuel.type, fuel.value);
         fuelSlot.count--;
         fuelSlot.validate();
         fuelSlot.markDirty();
         this.infuserTank.updateUiScale("fuelScale");
         this.container.sendChanges();
      }
      onTick() {
         this.useUpgrade();
         this.initFuel();
         let type = this.infuserTank.getLiquidStored();
         let slotInput = this.container.getSlot("slotInput")
         let recipe = InfuserRecipe.get(type, slotInput);
         let newActive = false;
         if (recipe && this.infuserTank.getAmount(recipe.type) >= recipe.infuser_use) {
            let slotResult = this.container.getSlot("slotResult")
            if ((slotResult.id == recipe.output.id && (slotResult.data == recipe.output.data || slotResult.data == 0) && slotResult.count <= Item.getMaxStack(slotResult.id) - recipe.output.count) || slotResult.id == 0) {
               if (this.data.energy >= this.energyConsume) {
                  newActive = true;
                  this.data.progress += this.speed;
                  this.data.energy -= this.energyConsume;
                  // } else {
                  // not enough energy
               }
               if (this.data.progress >= this.processTime) {
                  slotInput.count--;
                  slotInput.markDirty();

                  slotResult.id = recipe.output.id;
                  slotResult.data = recipe.output.data;
                  slotResult.count += recipe.output.count;
                  slotResult.extra = recipe.output.extra;
                  slotResult.markDirty();

                  this.infuserTank.getLiquid(recipe.type, recipe.infuser_use);
               }
               // } else {
               //    // Error_Log[OUTPUT ERROR]
            }
         } else if (!slotInput.id) {
            this.data.progress = 0
         }
         //re-fill
         this.initFuel();
         this.setActive(newActive)

         this.dischargeSlot("slotEnergy");
         this.container.setScale("progressScale", this.data.progress / this.processTime || 0);
         this.container.setScale("energyScale", this.getRelativeEnergy());
         this.container.sendChanges();
      }

      getEnergyStorage(): number {
         return this.energyStorage;
      }

      @ContainerEvent(Side.Server)
      dump(): void {
         let taken_amount = this.infuserTank.isEmpty() ? 0 : this.infuserTank.getLiquid(this.infuserTank.getAmount(this.infuserTank.getLiquidStored()))
         if (taken_amount) this.initFuel();
         this.data.progress = 0
      }
   }
   MachineRegistry.registerPrototype(BlockID.metallurgicInfuser, new Infuser());
   StorageInterface.createInterface(BlockID.metallurgicInfuser, {
      slots: {
         "slotFuel": { input: true },
         "slotInput": { input: true },
         "slotResult": { output: true }
      }
   });
}
