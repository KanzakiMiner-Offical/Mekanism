
BlockRegistry.createBlock("enrichmentChamber", [
    { name: "Enrichment Chamber", texture: [["enrichBottom", 0], ["enrichTop", 0], ["enrichBack", 0], ["enrichFront", 0], ["enrichLeft", 0], ["enrichRight", 0]] }]);
BlockRegistry.setBlockMaterial(BlockID.enrichmentChamber, "stone", 1);

TileRenderer.setHandAndUiModel(BlockID.enrichmentChamber, 0, [["enrichBottom", 0], ["enrichTop", 0], ["enrichBack", 0], ["enrichFront", 0], ["enrichLeft", 0], ["enrichRight", 0]])
TileRenderer.setStandardModelWithRotation(BlockID.enrichmentChamber, 2, [["enrichBottom", 0], ["enrichTop", 0], ["enrichBack", 0], ["enrichFront", 0], ["enrichLeft", 0], ["enrichRight", 0]])
TileRenderer.registerModelWithRotation(BlockID.enrichmentChamber, 2, [["enrichBottom", 0], ["enrichTop", 0], ["enrichBack", 0], ["enrichFront_active", 0], ["enrichLeft", 0], ["enrichRight", 0]])

TileRenderer.setRotationFunction(BlockID.enrichmentChamber)

let guiEnrichmentChamber = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Enrichment Chamber" } },
        inventory: { standard: true },
        background: { standard: true }
    },
    drawing: [{ type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
    { type: "bitmap", x: 630, y: 230, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE },
    { type: "bitmap", x: 538, y: 230, bitmap: "GuiArrowUP", scale: GUI_BAR_STANDARD_SCALE }],

    elements: {
        "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
        "progressScale": { type: "scale", x: 633, y: 233, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE },
        "slotEnergy": { type: "slot", x: 520, y: 283 },
        "slotInput": { type: "slot", x: 520, y: 165 },
        "slotResult": { type: "slot", x: 750, y: 195, size: 100 }

    }
});

namespace Machine {
    export class EnrichmentChamber extends ConfigMachine {
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
            return guiEnrichmentChamber
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
                if (name == "slotInput") return true
                return false;
            });
        }

        onTick() {
            this.useUpgrade();
            let slotInput = this.container.getSlot("slotInput")
            let recipe = EnrichRecipe.get(slotInput);
            let newActive = false;
            if (recipe) {
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
                    }
                    // } else {
                    //    // Error_Log[OUTPUT ERROR]
                }
            } else if (!slotInput.id) {
                this.data.progress = 0
            }

            this.container.setScale("progressScale", this.data.progress / this.processTime || 0);
            this.container.setScale("energyScale", this.getRelativeEnergy());
            this.container.sendChanges();
        }

        getEnergyStorage(): number {
            return this.energyStorage;
        }
    }
    MachineRegistry.registerPrototype(BlockID.enrichmentChamber, new EnrichmentChamber())
}