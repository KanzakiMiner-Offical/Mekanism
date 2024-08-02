BlockRegistry.createBlock("energizedSmelter", [
    { name: "Energized Smelter", texture: [["melterBottom", 0], ["melterTop", 0], ["melterBack", 0], ["melterFront", 0], ["melterSide", 0], ["melterSide", 0]], inCreative: true }], "machine");

BlockRegistry.setBlockMaterial(BlockID.energizedSmelter, "stone", 1);

TileRenderer.setHandAndUiModel(BlockID.energizedSmelter, 0, [["melterBottom", 0], ["melterTop", 0], ["melterBack", 0], ["melterFront", 0], ["melterSide", 0], ["melterSide", 0]])
TileRenderer.setStandardModelWithRotation(BlockID.energizedSmelter, 2, [["melterBottom", 0], ["melterTop", 0], ["melterBack", 0], ["melterFront", 0], ["melterSide", 0], ["melterSide", 0]])
TileRenderer.registerModelWithRotation(BlockID.energizedSmelter, 2, [["melterBottom", 0], ["melterTop_active", 0], ["melterBack", 0], ["melterFront_active", 0], ["melterSide", 0], ["melterSide", 0]])

TileRenderer.setRotationFunction(BlockID.energizedSmelter)

let guiEnergizedSmelter = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Energized Smelter" } },
        inventory: { standard: true },
        background: { standard: true }
    },

    drawing: [
        { type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 538, y: 230, bitmap: "GuiArrowUP", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 630, y: 230, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE },
    ],

    elements: {
        "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
        "progressScale": { type: "scale", x: 633, y: 233, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE },
        "slotEnergy": { type: "slot", x: 525, y: 275 },

        "slotInput": { type: "slot", x: 525, y: 155 },
        "slotResult": { type: "slot", x: 750, y: 195, size: 100 }

    }
});


namespace Machine {
    export class Furnace extends ConfigMachine {
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

        upgrades = ["speed", "energy"]

        getScreenByName(screenName: string, container: ItemContainer): UI.IWindow {
            return guiEnergizedSmelter
        }

        useUpgrade(): UpgradesAPI.UpgradeSet {
            let upgrades = UpgradesAPI.useUpgrade(this);
            this.energyConsume = upgrades.getEnergyUsage(this.defaultEnergyConsume);
            this.energyStorage = upgrades.getEnergyCapacity(this.defaultEnergyStorage);
            this.speed = upgrades.getSpeed(this.defaultSpeed)
            return upgrades;
        }

        setupContainer(): void {
            StorageInterface.setGlobalValidatePolicy(this.container, (name, id, amount, data) => {
                if (name.startsWith("slotUpgrade")) return UpgradesAPI.isValidUpgrade(id, this)
                if (name == "slotInput")
                    return !!Recipes.getFurnaceRecipeResult(id, data, "iron")
                if (name.startsWith("slotFuel")) return Infuser_Type.isInfuserType(new ItemStack(id, amount, data))
                if (name == "slotEnergy") return ChargeItemRegistry.isValidStorage(id, "Rf", 1);
                return false;
            });
        }

        onTick() {
            this.useUpgrade();
            let slotInput = this.container.getSlot("slotInput")
            let result = Recipes.getFurnaceRecipeResult(slotInput.id, slotInput.data, "iron")
            let newActive = false;
            if (result) {
                let resultSlot = this.container.getSlot("slotResult");
                if (resultSlot.id == result.id && resultSlot.count + result.count <= 64 || !resultSlot.id) {
                    if (this.data.energy >= this.energyConsume) {
                        this.data.energy -= this.energyConsume;
                        this.data.progress += this.speed;
                        newActive = true;
                    }
                    if (this.data.progress >= this.processTime) {
                        slotInput.setSlot(slotInput.id, slotInput.count - 1, slotInput.data);
                        slotInput.validate();
                        resultSlot.setSlot(result.id, resultSlot.count + 1, result.data);
                        this.container.validateAll();
                        this.data.progress = 0;
                    }
                }
            } else {
                this.data.progress = 0;
            }
            this.setActive(newActive)

            this.dischargeSlot("slotEnergy");
            this.container.setScale("progressScale", this.data.progress / this.processTime || 0);
            this.container.setScale("energyScale", this.getRelativeEnergy());
            this.container.sendChanges();
        }

        getEnergyStorage(): number {
            return this.energyStorage;
        }
    }
    MachineRegistry.registerPrototype(BlockID.energizedSmelter, new Furnace())
}
