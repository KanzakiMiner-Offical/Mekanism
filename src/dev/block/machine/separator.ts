BlockRegistry.createBlock("electrolyticSeparator", [
    { name: "Electrolytic Separator", texture: [["ESD", 0], ["EST", 0], ["ESB", 0], ["ESF", 0], ["ESR", 0], ["ESL", 0]], inCreative: true }], "machine");

BlockRegistry.setBlockMaterial(BlockID.electrolyticSeparator, "stone", 1);

MekModel.setInventoryModel(new ItemStack(BlockID["electrolyticSeparator"], 1, 0), "separator/electrolytic_separator", "separator/electrolytic_separator", {
    translate: [0.25, 0, 0], scale: [1, 1, 1], invertV: false, noRebuild: false
}, [0, 0, 0])
MekModel.setHandModel(new ItemStack(BlockID["electrolyticSeparator"], 1, 0), "separator/electrolytic_separator", "separator/electrolytic_separator", {
    translate: [0.25, 0, 0], scale: [1, 1, 1], invertV: false, noRebuild: false
})


MekModel.registerModelWithRotation(BlockID["electrolyticSeparator"], "resources/res/models/separator/electrolytic_separator", "electrolytic_separator")


let guiElectrolyticSeparator = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Electrolytic Separator" } },
        inventory: { standard: true },
        background: { standard: true }
    },

    drawing: [
        { type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 330, y: 150, bitmap: "MediumFuelBG", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 550, y: 180, bitmap: "SmallFuelBG", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 710, y: 180, bitmap: "SmallFuelBG", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 640, y: 210, bitmap: "GuiProgressD", scale: GUI_BAR_STANDARD_SCALE },
    ],

    elements: {
        "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
        "liquidScale": { type: "scale", x: 330 + GUI_BAR_STANDARD_SCALE, y: 151 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "WaterMediumScale", overlay: "OverMediumFuelBG", overlayOffset: { x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE }, scale: GUI_BAR_STANDARD_SCALE },
        "gasScale1": { type: "scale", x: 550 + GUI_BAR_STANDARD_SCALE, y: 180 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "WaterSmallScale", overlay: "OverSmallFuelBG", overlayOffset: { x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE }, scale: GUI_BAR_STANDARD_SCALE },
        "gasScale2": { type: "scale", x: 710 + GUI_BAR_STANDARD_SCALE, y: 180 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "WaterSmallScale", overlay: "OverSmallFuelBG", overlayOffset: { x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE }, scale: GUI_BAR_STANDARD_SCALE },
        "slotEnergy": { type: "slot", x: 880, y: 200 },
        "slotLiquid": { type: "slot", x: 400, y: 200 },
        "slotGas1": { type: "slot", x: 550, y: 290 },
        "slotGas2": { type: "slot", x: 710, y: 290 },
        "progressScale": { type: "scale", x: 640, y: 210, direction: 3, value: 0, bitmap: "GuiProgressDS", scale: GUI_BAR_STANDARD_SCALE },
        "textGas1": {
            type: "text", font: { size: 20, color: Color.YELLOW }, x: 550 + GUI_BAR_STANDARD_SCALE, y: 50, width: 100, height: 30, text: "", clicker: {
                onClick: function (_, container: ItemContainer) {
                    container.sendEvent("switchMode", { tank: "left" })
                }
            }
        },
        "textGas2": {
            type: "text", font: { size: 20, color: Color.YELLOW }, x: 710 + GUI_BAR_STANDARD_SCALE, y: 50, width: 100, height: 30, text: "", clicker: {
                onClick: function (_, container: ItemContainer) {
                    container.sendEvent("switchMode", { tank: "right" })
                }
            }
        },
    }
});


namespace Machine {
    export class ElectrolyticSeparator extends ConfigMachine {
        defaultValues = {
            energy: 0,
            progress: 0,
            mode: {
                left: 0,
                right: 0
            }
        }
        defaultEnergyStorage = 20000;
        defaultEnergyConsume = 400;
        defaultSpeed = 1;
        energyStorage: number;
        energyConsume: number;
        speed: number;
        processTime = 200;
        liquidTank: BlockEngine.LiquidTank;
        gasTank1: BlockEngine.LiquidTank;
        gasTank2: BlockEngine.LiquidTank;

        upgrades = ["speed", "energy"]

        getScreenByName(screenName: string, container: ItemContainer): UI.IWindow {
            return guiElectrolyticSeparator
        }

        useUpgrade(): UpgradesAPI.UpgradeSet {
            let upgrades = UpgradesAPI.useUpgrade(this);
            this.energyConsume = upgrades.getEnergyUsage(this.defaultEnergyConsume);
            this.energyStorage = upgrades.getEnergyCapacity(this.defaultEnergyStorage);
            this.speed = upgrades.getSpeed(this.defaultSpeed)
            return upgrades;
        }

        setupContainer(): void {
            this.liquidTank = this.addLiquidTank("fuel_tank", 24000, SeparatorRecipe.getLiqIn());
            this.gasTank1 = this.addLiquidTank("result_tank_1", 2400, SeparatorRecipe.getGasLeft());
            this.gasTank2 = this.addLiquidTank("result_tank_2", 2400, SeparatorRecipe.getGasRight());
            StorageInterface.setGlobalValidatePolicy(this.container, (name, id, amount, data) => {
                if (name.startsWith("slotUpgrade")) return UpgradesAPI.isValidUpgrade(id, this)
                if (name == "slotEnergy") return ChargeItemRegistry.isValidStorage(id, "Rf", 1);
                return false;
            });
        }

        onTick() {
            this.useUpgrade();
            let newActive = false
            let recipe = SeparatorRecipe.get(this.liquidTank.getLiquidStored(), this.liquidTank.getAmount())
            if (recipe && this.data.energy >= this.energyConsume && this.gasTank1.getAmount() <= 2400 - recipe.gasOut1.amount && this.gasTank2.getAmount() <= 2400 - recipe.gasOut2.amount) {
                this.data.energy -= this.energyConsume
                this.liquidTank.getLiquid(recipe.liqIn.amount);
                this.gasTank1.addLiquid(recipe.gasOut1.liquid, recipe.gasOut1.amount);
                this.gasTank2.addLiquid(recipe.gasOut2.liquid, recipe.gasOut2.amount);
                newActive = true
                this.liquidTank.updateUiScale("liquidScale")
            }
            this.setActive(newActive)

            this.updateTankStore("left")
            this.updateTankStore("right")
            this.liquidTank.getLiquidFromItem(this.container.getSlot("slotLiquid"), this.container.getSlot("slotLiquid"))
            this.gasTank1.addLiquidToItem(this.container.getSlot("slotGas1"), this.container.getSlot("slotGas1"))
            this.gasTank2.addLiquidToItem(this.container.getSlot("slotGas2"), this.container.getSlot("slotGas2"))

            this.dischargeSlot("slotEnergy");
            this.container.setScale("progressScale", this.data.progress / this.processTime || 0);
            this.container.setScale("energyScale", this.getRelativeEnergy());
            this.container.sendChanges();
        }

        getEnergyStorage(): number {
            return this.energyStorage;
        }

        updateTankStore(type: string): void {
            let tank = type == "left" ? this.gasTank1 : this.gasTank2
            let mode: number = this.data.mode[type]
            if (mode != TankMode.IDLE) {
                let current = tank.getLiquidStored();
                if (current != null) {
                    if (mode == TankMode.DUMPING) {
                        tank.getLiquid(tank.getAmount() / 400);
                    } else {//mode == TankMode.DUMPING_EXCESS
                        let target = Math.floor(tank.getLimit() * 0.9);
                        let stored = tank.getAmount();
                        if (target < stored) {
                            //Dump excess that we need to get to the target (capping at our eject rate for how much we can dump at once)
                            tank.getLiquid(Math.min(stored - target, 250));
                        }
                    }
                }
            }
            this.gasTank1.updateUiScale("gasScale1")
            this.gasTank2.updateUiScale("gasScale2")
        }
        @ContainerEvent(Side.Server)
        switchMode(container: ItemContainer, window: UI.Window | UI.StandartWindow | UI.StandardWindow | UI.TabbedWindow | null, windowContent: UI.WindowContent | null, eventData: { tank: string }): void {
            let mode: number = this.data.mode[eventData.tank];
            mode = (mode + 1) % 2;
            this.updateTankStore(eventData.tank);
            switch (eventData.tank) {
                case "left":
                    this.gasTank1.updateUiScale("gasScale1")
                    break;
                case "right":
                    this.gasTank2.updateUiScale("gasScale2")
                    break;
            }
        }
    }
    MachineRegistry.registerPrototype(BlockID.electrolyticSeparator, new ElectrolyticSeparator());
    StorageInterface.createInterface(BlockID.electrolyticSeparator, {
        slots: {}
    });
}
