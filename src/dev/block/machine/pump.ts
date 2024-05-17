BlockRegistry.createBlock("electricPump", [
    { name: "Electric Pump", texture: [["steel_casing", 0]] }]);

BlockRegistry.setBlockMaterial(BlockID.electricPump, "stone", 1);
TileRenderer.setRotationFunction(BlockID["electricPump"]);

(function () {
    let mesh: RenderMesh, model: BlockRenderer.Model, render: ICRender.Model;
    for (let i = 0; i < 4; i++) {
        mesh = new RenderMesh();
        model = new BlockRenderer.Model(mesh);
        render = new ICRender.Model();
        mesh.setBlockTexture("electric_pump", 0);
        mesh.importFromFile(__dir__ + "resources/res/models/electricPump_" + i + ".obj", "obj", null);
        render.addEntry(model);
        BlockRenderer.setStaticICRender(BlockID.electricPump, i, render);
        ItemModel.getFor(BlockID.electricPump, i).setModel(render);
    }
})();

let guiPump = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Pump" } },
        inventory: { standard: true },
        background: { standard: true }
    },

    drawing: [
        { type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 400, y: 88, bitmap: "BigFuelBG", scale: GUI_SCALE },
    ],

    elements: {
        "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
        "liquidScale": { type: "scale", x: 400, y: 88, direction: 1, bitmap: "BigFuelBG", overlay: "OverBGFuel", scale: GUI_SCALE },
        "slotLiquid1": { type: "slot", x: 400 + 91 * GUI_SCALE, y: 50 + 12 * GUI_SCALE },
        "slotLiquid2": { type: "slot", x: 400 + 91 * GUI_SCALE, y: 50 + 39 * GUI_SCALE },

    }
});

namespace Machine {
    export class ElectricPump extends ConfigMachine {
        defaultValues = {
            energy: 0,
            progress: 0
        }
        defaultEnergyStorage = 20000;
        defaultEnergyConsume = 20;
        energyStorage: number;
        energyConsume: number;
        speed: number;
        processTime = 200;
        liquidTank: BlockEngine.LiquidTank;

        upgrades = ["speed", "energy"]

        getScreenByName(screenName: string, container: ItemContainer): UI.IWindow {
            return guiPump
        }

        useUpgrade(): UpgradesAPI.UpgradeSet {
            let upgrades = UpgradesAPI.useUpgrade(this);
            this.energyConsume = upgrades.getEnergyUsage(this.defaultEnergyConsume);
            this.energyStorage = upgrades.getEnergyCapacity(this.defaultEnergyStorage);
            this.speed = upgrades.getSpeedMultiplier();
            return upgrades;
        }

        setupContainer(): void {
            this.liquidTank = this.addLiquidTank("fluid", 10000, ["water"]);
            StorageInterface.setGlobalValidatePolicy(this.container, (name, id, amount, data) => {
                if (name.startsWith("slotUpgrade")) return UpgradesAPI.isValidUpgrade(id, this)
                if (name == "slotLiquid1") return true
                return false;
            });
        }

        onTick() {
            this.useUpgrade();
            let newActive = false;
            this.pumpLiquid()
            let slot1 = this.container.getSlot("slotLiquid1");
            let slot2 = this.container.getSlot("slotLiquid2");
            this.liquidTank.addLiquidToItem(slot1, slot2);
            this.liquidTank.updateUiScale("liquidScale");
            this.container.setScale("progressScale", this.data.progress / this.processTime || 0);
            this.container.setScale("energyScale", this.getRelativeEnergy());
            this.container.sendChanges();
        }
        tickReq(): number {
            let speedUp = this.speed || 0;
            let tick_need = 10 * Math.pow(UpgradesAPI.EnergyMultiplier, -(speedUp) / 8)
            return Math.floor(tick_need) //floor(10*max -x/8)
        }

        calcAmount(): number {
            let baseTick = 10
            let baseAmount = 100
            return Math.floor(baseTick / this.tickReq() * baseAmount)
        }

        checkLiquid(): boolean {
            return this.region.getBlock(this.x, this.y - 1, this.z).id == VanillaBlockID.water
        }
        pumpLiquid(): void {
            let newActive = false;

            if (this.y > 0 && this.liquidTank.getAmount("water") <= 10000 - this.calcAmount() && this.data.energy >= this.energyConsume && this.checkLiquid()) {
                this.data.progress++;
            }
            if (this.data.progress >= this.tickReq()) {
                this.liquidTank.addLiquid("water", this.calcAmount())
                this.data.progress = 0
            }
            this.setActive(newActive);
        }

        getEnergyStorage(): number {
            return this.energyStorage;
        }

        canReceiveEnergy(side: number, type: string): boolean {
            return
        }
    }
    MachineRegistry.registerPrototype(BlockID.electricPump, new ElectricPump())

    MachineRegistry.createStorageInterface(BlockID.electricPump, {
        // slots: {
        // 	"slot1": {input: true},
        // 	"slot2": {output: true}
        // },
        // isValidInput: (item: ItemInstance) => {
        // 	return !!LiquidItemRegistry.getFullItem(item.id, item.data, "water")
        // },
        canReceiveLiquid: function (liquid: string, side: number): boolean {
            return side === EBlockSide.UP
        }
    });
}