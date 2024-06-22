// not ready not
let guiHeatGenerator = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Heat Generator" } },
        inventory: { standard: true },
        background: { standard: true }
    },

    drawing: [
        { type: "bitmap", x: 530, y: 150, bitmap: "BigFuelBG", scale: GUI_BAR_STANDARD_SCALE },
        { type: "bitmap", x: 950, y: 150, bitmap: "BarBg", scale: GUI_BAR_STANDARD_SCALE },

    ],

    elements: {
        "fuelScale": { type: "scale", x: 530 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "BigEnergyScale", overlay: "OverBGFuel", overlayOffset: { x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE }, scale: GUI_BAR_STANDARD_SCALE },
        "energyScale": { type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE },
        "slotEnergy": { type: "slot", x: 780, y: 200 },
        "slotFuel": { type: "slot", x: 441, y: 200 },
        "textInfo1": { type: "text", x: 600, y: 330, width: 300, height: 30, text: "0/" },
        "textInfo2": { type: "text", x: 600, y: 360, width: 300, height: 30, text: "25000 mB" },

    }
});

namespace Machine {
    export class HeatGenerator extends BaseGenerator {
        defaultValues = {
            energy: 0
        };

        THERMAL_EFFICIENCY = 0.5
        MAX_PRODUCTION = 200;

        lavaTank: BlockEngine.LiquidTank;
        heatCapacitor: Machine.BasicHeatCapacitor

        getScreenByName(screenName: string, container: ItemContainer): UI.IWindow {
            return guiHeatGenerator
        }

        onInit(): void {
            this.lavaTank = this.addLiquidTank("lava", 24000, ["lava"])
            this.heatCapacitor = new Machine.BasicHeatCapacitor(10, 5, 100, this.region.getBiomeTemperatureAt(this.x, this.y, this.z))
            if (this.region.getDimension() == EDimension.NETHER) {
                this.MAX_PRODUCTION += 100
            }
            return super.onInit()
        }

        getLava(): number {
            let lava_count = 0
            if (this.region.getBlock(this.x, this.y + 1, this.z).id == VanillaBlockID.lava || VanillaBlockID.flowing_lava) {
                lava_count++
            } else if (this.region.getBlock(this.x, this.y - 1, this.z).id == VanillaBlockID.lava || VanillaBlockID.flowing_lava) {
                lava_count++
            } else if (this.region.getBlock(this.x, this.y, this.z + 1).id == VanillaBlockID.lava || VanillaBlockID.flowing_lava) {
                lava_count++
            } else if (this.region.getBlock(this.x, this.y, this.z - 1).id == VanillaBlockID.lava || VanillaBlockID.flowing_lava) {
                lava_count++
            } else if (this.region.getBlock(this.x + 1, this.y, this.z).id == VanillaBlockID.lava || VanillaBlockID.flowing_lava) {
                lava_count++
            } else if (this.region.getBlock(this.x - 1, this.y, this.z).id == VanillaBlockID.lava || VanillaBlockID.flowing_lava) {
                lava_count++
            }
            return lava_count
        }

        fillOrBurn(slot: ItemContainerSlot): void {
            if (slot.id) {
                if (LiquidItemRegistry.getItemLiquid(slot.id, slot.data) == "lava") {
                    let empty = LiquidItemRegistry.getEmptyItem(slot.id, slot.data);
                    slot.id = empty.id;
                    slot.data = empty.data;
                    this.lavaTank.addLiquid("lava", 1000)
                } else if (Recipes.getFuelBurnDuration(slot.id, slot.data) > 0) {
                    let amount = (Recipes.getFuelBurnDuration(slot.id, slot.data) * 1000) / Recipes.getFuelBurnDuration(VanillaItemID.lava_bucket, 0)
                    this.lavaTank.addLiquid("lava", amount)
                    slot.count--;
                    slot.markDirty();
                }
            }
        }


        onTick(): void {
            this.heatCapacitor.update();
            this.MAX_PRODUCTION += this.getLava() * 50;
            this.updateMaxOutputRaw(this.MAX_PRODUCTION);

            let fuelSlot = this.container.getSlot("slotFuel");
            this.fillOrBurn(fuelSlot);

            let prev = this.data.energy
            this.heatCapacitor.handleHeat(this.getBoost());
            if (this.powerNeed() > 0) {
                let fluidRate = 10
                if (this.lavaTank.getLiquid(fluidRate) == fluidRate) {
                    this.setActive(true);
                    this.heatCapacitor.handleHeat(200);
                } else {
                    this.setActive(false);
                }
            } else {
                this.setActive(false);
            }
            let loss = this.simulate();
            // let lastTransferLoss = loss.adjacentTransfer();
            // let lastEnvironmentLoss = loss.environmentTransfer();
            let producingEnergy = this.data.energy - prev

            this.heatCapacitor.update();
            this.container.setText("textInfo1", this.lavaTank.getAmount() + "/");
            this.lavaTank.updateUiScale("fuelScale")
            this.container.setScale("energyScale", this.data.energy / this.getEnergyStorage());
        }

        getEnergyStorage(): number {
            return jToRF(160000)
        }

        getBoost(): number {
            if (!this.isLoaded) {
                return 0
            }
            let boost = 0;
            let passiveLavaAmount = 50
            if (!passiveLavaAmount) {
                //If neighboring lava blocks produce no energy, don't bother checking the sides for them
                boost = 0
            } else {
                //Otherwise, calculate boost to apply from lava
                let lavaSides = this.getLava()
                // if (getBlockState().getFluidState().is(FluidTags.LAVA)) {
                //     //If the heat generator is lava-logged then add it as another side that is adjacent to lava for the heat calculations
                //     lavaSides++;
                // }
                boost = passiveLavaAmount * (lavaSides);
                if (this.region.getDimension() == EDimension.NETHER) {
                    boost += 100
                }
            }
            return boost;
        }

        simulate() {
            let ambientTemp = this.region.getBiomeTemperatureAt(this.x, this.y, this.z)
            let temp = this.heatCapacitor.storedHeat // Cant Port
            // 1 - Qc / Qh
            let carnotEfficiency = 1 - Math.min(ambientTemp, temp) / Math.max(ambientTemp, temp);
            let heatLost = this.THERMAL_EFFICIENCY * (temp - ambientTemp);
            this.heatCapacitor.handleHeat(-heatLost);
            let energyFromHeat = (Math.abs(heatLost) * carnotEfficiency);
            this.data.energy += Math.min(energyFromHeat, this.MAX_PRODUCTION)
            return Math.min(energyFromHeat, this.MAX_PRODUCTION);
        }
    }
}


