BlockRegistry.createBlock("metallurgicInfuser", [
   { name: "Metallurgic Infuser", texture: [["MID", 0], ["MIT", 0], ["MIB", 0], ["MIF", 0], ["MIR1", 0], ["MIR", 0]], inCreative: true }]);

BlockRegistry.setBlockMaterial(BlockID.metallurgicInfuser, "stone", 1);

// TileRenderer.setHandAndUiModel(BlockID.metallurgicInfuser, 0, [["MID", 0], ["MIT", 0], ["MIB", 0], ["MIF", 0], ["MIR1", 0], ["MIR", 0]])
// TileRenderer.setStandardModelWithRotation(BlockID.metallurgicInfuser, 2, [["MID", 0], ["MIT", 0], ["MIB", 0], ["MIF", 0], ["MIR1", 0], ["MIR", 0]])
// TileRenderer.registerModelWithRotation(BlockID.metallurgicInfuser, 2, [["MID", 0], ["MIT", 0], ["MIB", 0], ["MIF", 0], ["MIR1", 0], ["MIR", 0]])

// TileRenderer.setRotationFunction(BlockID.metallurgicInfuser)

(function () {
   const mesh = new RenderMesh();
   mesh.importFromFile(
      __dir__ + "resources/res/model/" + "metallurgic_infuser" + ".obj",
      "obj",
      null
   );
   ItemModel.getForWithFallback(BlockID["metallurgicInfuser"], 0).setModel(
      mesh,
      "res/terrain-atlas/model/item/metallurgic_infuser"
   )
})();

let GuiMetallurgicInfuser = new UI.Window({
   location: { x: 0, y: 0, width: 1000, height: UI.getScreenHeight() },
   drawing: [
      { type: "background", color: Color.argb(90, 0, 0, 0) },
      { type: "bitmap", x: 350, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
      { type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
      { type: "bitmap", x: 555, y: 245, bitmap: "GuiProgress", scale: GUI_BAR_STANDARD_SCALE },
   ],
   elements: (() => {
      const offset = (UI.getScreenHeight() - 415) / 2;
      const elems = {
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
      } as UI.ElementSet;
      for (let i = 9; i < 36; i++) elems[`slotInv${i}`] = { type: "invSlot", x: 296.5 + (i % 9) * 45, y: offset + 207 + Math.floor((i - 9) / 9) * 45, index: i, size: 47 }
      for (let i = 0; i < 9; i++) elems[`slotInv${i}`] = { type: "invSlot", x: 296.5 + i * 45, y: offset + 352, index: i, size: 47 }
      return elems;
   })()
});
GuiMetallurgicInfuser.setInventoryNeeded(true);
GuiMetallurgicInfuser.setCloseOnBackPressed(true);


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
         return GuiMetallurgicInfuser
      }

      useUpgrade(): UpgradesAPI.UpgradeSet {
         let upgrades = UpgradesAPI.useUpgrade(this);
         this.energyConsume = upgrades.getEnergyUsage(this.defaultEnergyConsume);
         this.energyStorage = upgrades.getEnergyCapacity(this.defaultEnergyStorage);
         this.speed = upgrades.getSpeed(this.defaultSpeed)
         return upgrades;
      }

      setupContainer(): void {

         this.infuserTank = this.addLiquidTank("infuser_tank", 10000, ["infuser_coal", "infuser_redstone"])

         StorageInterface.setGlobalValidatePolicy(this.container, (name, id, amount, data) => {
            if (name.startsWith("slotUpgrade")) return UpgradesAPI.isValidUpgrade(id, this)
            if (name == "slotInput")
               return InfuserRecipe.isValidInput(new ItemStack(id, amount, data), this.infuserTank.getLiquidStored())
            if (name.startsWith("slotFuel")) return Infuser_Type.isInfuserType(new ItemStack(id, amount, data))
            if (name == "slotEnergy") return ChargeItemRegistry.isValidStorage(id, "Rf", 1);
            return false;
         });
      }


      initFuel() {
         let fuelSlot = this.container.getSlot("slotFuel")
         let fuel = Infuser_Type.getTypeFromItem(fuelSlot.id)
         // check storage
         if (this.infuserTank.getLiquidStored() != fuel.type) {
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
            if ((slotResult.id == recipe.output.id && slotResult.data == recipe.output.data || 0 && slotResult.count <= Item.getMaxStack(slotResult.id) - recipe.output.count) || !slotResult.id) {
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
         let taken_amount = this.infuserTank.isEmpty() ? this.infuserTank.getLiquid(this.infuserTank.getAmount(this.infuserTank.getLiquidStored())) : 0
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
