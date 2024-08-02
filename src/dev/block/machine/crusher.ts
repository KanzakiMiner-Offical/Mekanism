BlockRegistry.createBlock("mekCrusher", [
    { name: "Crusher", texture: [["crusherBottom", 0], ["crusherTop", 0], ["crusherBack", 0], ["crusherFront", 0], ["crusherSide", 0], ["crusherSide", 0]], inCreative: true }], "machine");

BlockRegistry.setBlockMaterial(BlockID.mekCrusher, "stone", 1);

TileRenderer.setHandAndUiModel(BlockID.mekCrusher, 0, [["crusherBottom", 0], ["crusherTop", 0], ["crusherBack", 0], ["crusherFront", 0], ["crusherSide", 0], ["crusherSide", 0]])
TileRenderer.setStandardModelWithRotation(BlockID.mekCrusher, 2, [["crusherBottom", 0], ["crusherTop", 0], ["crusherBack", 0], ["crusherFront", 0], ["crusherSide", 0], ["crusherSide", 0]])
TileRenderer.registerModelWithRotation(BlockID.mekCrusher, 2, [["crusherBottom", 0], ["crusherTop_active", 0], ["crusherBack", 0], ["crusherFront", 0], ["crusherSide", 0], ["crusherSide", 0]])

TileRenderer.setRotationFunction(BlockID.mekCrusher)

var guiCrusher = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Crusher" } },
        inventory: { standard: true },
        background: { standard: true }
    },
    drawing: [
        { type: "bitmap", x: 565, y: 190, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 500, y: 190, bitmap: "GuiArrowUP", scale: GUI_BAR_STANDARD_SCALE },

    ],
    elements: {
        "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
        "slotEnergy": { type: "slot", x: 480, y: 240 },
        "slotInput": { type: "slot", x: 480, y: 120 },
        "slotResult": { type: "slot", x: 680, y: 150, size: 100 },
        "progressScale": { type: "scale", x: 568, y: 193, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE },
    }
});

Callback.addCallback("PreLoaded", function () {
    Recipes.addShaped({ id: BlockID.mekCrusher, count: 1, data: 0 }, [
        "rbr",
        "lsl",
        "rbr"
    ], ['b', ItemID.circuitAdvanced, 0, 'r', 331, 0, 's', BlockID.steelCasing, 0, 'l', 325, 10]);
});

namespace Machine {
    export class Crusher extends ConfigMachine {
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
            return guiCrusher
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
                if (name == "slotInput") return CrusherRecipe.isValidInput(new ItemStack(id, amount, data))
                return false;
            });
        }

        onTick() {
            this.useUpgrade();
            let slotInput = this.container.getSlot("slotInput")
            let recipe = CrusherRecipe.get(slotInput);
            let newActive = false;
            Game.message(!!recipe + '');
            if (recipe) {
                let slotResult = this.container.getSlot("slotResult")
                if ((slotResult.id == recipe.output.id && (slotResult.data == recipe.output.data || recipe.output.data == -1) && slotResult.count <= Item.getMaxStack(slotResult.id) - recipe.output.count) || !slotResult.id) {
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
                    }
                    // } else {
                    //    // Error_Log[OUTPUT ERROR]
                }
            } else if (!slotInput.id) {
                this.data.progress = 0
            }

            this.setActive(newActive)
            this.container.setScale("progressScale", this.data.progress / this.processTime || 0);
            this.container.setScale("energyScale", this.getRelativeEnergy());
            this.container.sendChanges();
        }

        getEnergyStorage(): number {
            return this.energyStorage;
        }
    }
    MachineRegistry.registerPrototype(BlockID.mekCrusher, new Crusher())
}