// not ready not

BlockRegistry.createBlock("solarGeneratorMek", [
    { name: "Solar Generator", texture: [["steel_casing", 0]] }]);

BlockRegistry.setBlockMaterial(BlockID.solarGeneratorMek, "stone", 1);

MekModel.setInventoryModel(new ItemStack(BlockID["solarGeneratorMek"], 1, 0), "solar_generator", "solar_generator", {
    translate: [0.25, 0, 0.5], scale: [1.50, 1.50, 1.50], invertV: false, noRebuild: false
}, [0, 0, -15])
MekModel.setHandModel(new ItemStack(BlockID["solarGeneratorMek"], 1, 0), "solar_generator", "solar_generator", {
    translate: [0.25, 0, 0], scale: [2.5, 2.5, 2.5], invertV: false, noRebuild: false
})


MekModel.registerModelWithRotation(BlockID["solarGeneratorMek"], "resources/res/models/solar_generator")

namespace Machine {
    export class SolarGenerator extends BaseGenerator {
        defaultValues = {
            energy: 0,
            canSeeSky: false
        };

        solarCheck: SolarCheck

        onInit(): void {
            this.data.canSeeSky = this.region.canSeeSky(this.x, this.y + 1, this.z)
            return super.onInit()
        }

        onTick(): void {
            if (this.solarCheck == null) {
                this.recheckSettings();
            }
            // ChargeItemRegistry.addEnergyToSlot()

            // Sort out if the generator can see the sun; we no longer check if it's raining here,
            // since under the new rules, we can still generate power when it's raining, albeit at a
            // significant penalty.
            let seesSun = this.checkCanSeeSun();
            if (seesSun && this.powerNeed() > 0) {
                this.setActive(true);
                let production = this.getProduction();
                this.data.energy += production
            } else {
                this.setActive(false);
            }
        }

        recheckSettings() {
            if (!this.isLoaded) {
                return;
            }
            this.solarCheck = new SolarCheck(this.region, new Vector3(this.x, this.y, this.z));
            this.updateMaxOutputRaw(30 * this.solarCheck.getPeakMultiplier());
        }

        checkCanSeeSun() {
            if (this.solarCheck) {
                return false;
            }
            this.solarCheck.recheckCanSeeSun();
            return this.solarCheck.isSeeSun();
        }

        getProduction() {
            if (!this.region || !this.solarCheck) {
                return 0
            }
            let brightness = this.getBrightnessMultiplier();
            //Production is a function of the peak possible output in this biome and sun's current brightness
            return 50 * (brightness * this.solarCheck.getGenerationMultiplier());
        }

        getBrightnessMultiplier() {
            return this.region.getLightLevel(this.x, this.y + 1, this.z)
        }

        getEnergyStorage(): number {
            return jToRF(96000)
        }
    }

    MachineRegistry.registerPrototype(BlockID.solarGeneratorMek, new SolarGenerator())
}

class SolarCheck {
    private peakMultiplier: number;
    protected pos: Vector;
    protected world: WorldRegion;
    protected canSeeSun: boolean;

    constructor(world: WorldRegion, pos: Vector) {
        this.world = world;
        this.pos = pos;
        // Consider the best temperature to be 0.8; biomes that are higher than that
        // will suffer an efficiency loss (semiconductors don't like heat); biomes that are cooler
        // get a boost. We scale the efficiency to around 30% so that it doesn't totally dominate
        let tempEff = 0.3 * (0.8 - this.world.getBiomeTemperatureAt(this.pos));

        // Treat rainfall as a proxy for humidity; any humidity works as a drag on overall efficiency.
        // As with temperature, we scale it so that it doesn't overwhelm production. Note the signedness
        // on the scaling factor. Also note that we only use rainfall as a proxy if it CAN rain; some dimensions
        // (like the End) have rainfall set, but can't actually support rain.
        let humidityEff = -0.3
        this.peakMultiplier = 1.0 + tempEff + humidityEff;
    }

    public recheckCanSeeSun() {
        this.canSeeSun = this.world.canSeeSky(this.pos.x, this.pos.y + 1, this.pos.z);
    }

    public isSeeSun() {
        return this.canSeeSun;
    }

    public getPeakMultiplier() {
        return this.peakMultiplier;
    }

    public getGenerationMultiplier() {
        if (!this.canSeeSun) {
            return 0;
        }
        if ((World.getWeather().rain > 0 || World.getWeather().thunder > 0)) {
            //If the generator is in a biome where it can rain, and it's raining penalize production by 80%
            return this.peakMultiplier * 0.2;
        }
        return this.peakMultiplier;
    }
}