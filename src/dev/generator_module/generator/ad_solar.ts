// // not ready not
// BlockRegistry.createBlock("windGeneratorMek", [
//     { name: "Wind Generator", texture: [["steel_casing", 0]] }]);

// BlockRegistry.setBlockMaterial(BlockID.windGeneratorMek, "stone", 1);

// MekModel.setInventoryModel(new ItemStack(BlockID["windGeneratorMek"], 1, 0), "item/wind_generator_item", "wind_generator/wind_generator_item", {
//     translate: [0.25, 0, 0.5], scale: [1.50, 1.50, 1.50], invertV: false, noRebuild: false
// }, [0, 0, 0])
// MekModel.setHandModel(new ItemStack(BlockID["windGeneratorMek"], 1, 0), "item/wind_generator_item", "wind_generator/wind_generator_item", {
//     translate: [0.25, 0, 0], scale: [2.5, 2.5, 2.5], invertV: false, noRebuild: false
// })


// MekModel.registerModelWithRotation(BlockID["windGeneratorMek"], "resources/res/models/wind/wind_base")


/*
 * ```js 
 * texture: [
 *   ["название1", индекс1], // bottom (Y: -1)
 *   ["название2", индекс2], // top (Y: +1)
 *   ["название3", индекс3], // back (X: -1) West
 *   ["название4", индекс4], // front (X: +1) East
 *   ["название5", индекс5], // left (Z: -1) North
 *   ["название6", индекс6]  // right (Z: +1) South
 * ]
 * ```
 */

namespace Machine {
    export class AdvanceSolarGenerator extends SolarGenerator {
        solarChecks: SolarCheck[];

        canExtractEnergy(side: number, type: string): boolean {
            switch (this.region.getBlockData(this.x, this.y, this.z)) {
                case 3:
                case 0:
                    return side == EBlockSide.NORTH;                    
                case 3:
                    return side == EBlockSide.SOUTH;                    
                case 4:
                    return side == EBlockSide.WEST;                    
                case 5:
                    return side == EBlockSide.EAST;                    
                default:
                    return side == EBlockSide.DOWN;                    
            }
        }

        getEnergyStorage(): number {
            return jToRF(200000)
        }

        override recheckSettings() {
            if (this.region == null) {
                return;
            }
            let solarCheck = new AdvancedSolarCheck(this.region, new Vector3(this.x, this.y + 2, this.z));
            let totalPeak = solarCheck.getPeakMultiplier();
            for (let i = 0; i < 8; i++) {
                if (i < 3) {
                    this.solarChecks[i] = new AdvancedSolarCheck(this.region, new Vector3(this.x - 1, this.y + 2, this.z + (i - 1)));
                } else if (i == 3) {
                    this.solarChecks[i] = new AdvancedSolarCheck(this.region, new Vector3(this.x, this.y + 2, this.z - 1))
                } else if (i == 4) {
                    this.solarChecks[i] = new AdvancedSolarCheck(this.region, new Vector3(this.x, this.y + 2, this.z + 1))
                } else {
                    this.solarChecks[i] = new AdvancedSolarCheck(this.region, new Vector3(this.x + 1, this.y + 2, this.z + (i - 6)));
                }
                totalPeak += this.solarChecks[i].getPeakMultiplier();
            }
            this.updateMaxOutputRaw(300 * (totalPeak / 9));
        }

        override checkCanSeeSun() {
            if (this.solarCheck == null) {
                //Note: We assume if solarCheck is null then solarChecks will be filled with null, and if it isn't
                // then it won't be as they get initialized at the same time
                return false;
            }
            //Allow attempting to recheck each position, and mark that we can see the sun if at least one position can
            this.solarCheck.recheckCanSeeSun();
            let count = this.solarCheck.isSeeSun() ? 1 : 0;
            for (let check of this.solarChecks) {
                check.recheckCanSeeSun();
                if (check.isSeeSun()) {
                    count++;
                }
            }
            //Mark that our solar generator can "see" the sun if at least five of the nine positions
            // are able to see the sun
            return count > 4;
        }

        override getProduction() {
            if (this.region == null || this.solarCheck == null) {
                //Note: We assume if solarCheck is null then this.solarChecks will be filled with null, and if it isn't
                // then it won't be as they get initialized at the same time
                return 0
            }
            let brightness = this.getBrightnessMultiplier();
            //Calculate the generation multiplier of all the solar panels together
            // any part that can't see the sun will contribute zero to the multiplier,
            // and then we take the average across all to see how much to multiply by
            let generationMultiplier = this.solarCheck.getGenerationMultiplier();
            for (let check of this.solarChecks) {
                generationMultiplier += check.getGenerationMultiplier();
            }
            generationMultiplier /= this.solarChecks.length + 1;
            //Production is a function of the peak possible output in this biome and sun's current brightness
            return 300 * (brightness * generationMultiplier);
        }

        override onTick(): void {
            return super.onTick()
        }
    }
}

class AdvancedSolarCheck extends SolarCheck {
    private recheckFrequency: number;
    private lastCheckedSun: number;

    constructor(world: WorldRegion, pos: Vector) {
        super(world, pos);
        //Recheck between every 10-30 ticks, to not end up checking each position each tick
        this.recheckFrequency = MathHelper.clamp(Math.floor(Math.random() * 10), 10, 30)

    }

    public override recheckCanSeeSun() {
        if (!this.world.canSeeSky(this.pos.x, this.pos.y, this.pos.z) || this.world.getLightLevel(this.pos.x, this.pos.y, this.pos.z) <= 4) {
            this.canSeeSun = false;
            return;
        }
        let time = World.getWorldTime();
        if (time < this.lastCheckedSun + this.recheckFrequency) {
            return;
        }
        this.lastCheckedSun = time;
        // if (world.getFluidState(pos).isEmpty()) {
        //     //If the top isn't fluid logged we can just quickly check if the top can see the sun
        //     canSeeSun = world.canSeeSky(pos);
        // } else {
        let above = new Vector3(this.pos.x, this.pos.y, this.pos.z);
        if (this.world.canSeeSky(above)) {
            //If the spot above can see the sun, check to make sure we can see through the block there
            this.canSeeSun = this.world.getLightLevel(this.pos.x, this.pos.y, this.pos.z) >= 15
        } else {
            this.canSeeSun = false;
        }
    }

}