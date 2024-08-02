// not ready not
BlockRegistry.createBlock("windGeneratorMek", [
    { name: "Wind Generator", texture: [["steel_casing", 0]], inCreative: true }]);

BlockRegistry.setBlockMaterial(BlockID.windGeneratorMek, "stone", 1);

MekModel.setInventoryModel(new ItemStack(BlockID["windGeneratorMek"], 1, 0), "wind_generator/wind_generator_item", "wind_generator/wind_generator_item", {
    translate: [0.25, 0, 0], scale: [0.5, 0.5, 0.5], invertV: false, noRebuild: false
}, [0, 0, 0])
MekModel.setHandModel(new ItemStack(BlockID["windGeneratorMek"], 1, 0), "wind_generator/wind_generator_item", "wind_generator/wind_generator_item", {
    translate: [0.25, 0, 0], scale: [0.5, 0.5, 0.5], invertV: false, noRebuild: false
})


MekModel.registerModelWithRotation(BlockID["windGeneratorMek"], "resources/res/models/wind_generator/wind_base", "wind_base")

Block.setShape(BlockID["windGeneratorMek"], 0, 0, 0, 1, 3, 1, -1)
namespace Machine {
    export class WindGenerator extends BaseGenerator {
        defaultValues = {
            energy: 0,
            currentMultiplier: 0,
            angle: 0
        };

        maxOutput = jToRF(960);
        SPEED = 32;
        //SPEED_SCALED = 256 / this.SPEED;
        maxY = 256 - 4;
        minY = 24;

        getMultiplier(): number {
            if (this.isLoaded) {
                if (this.region.canSeeSky(this.x, this.y + 4, this.z)) {
                    let minY = Math.max(this.minY, 0);
                    let maxY = Math.min(this.maxY, 256);
                    let clampedY = MathHelper.clamp(this.y + 5, minY, maxY)
                    let minG = jToRF(60);
                    let maxG = jToRF(480);
                    let slope = (maxG - minG) / (maxY - minY);
                    let toGen = (minG + slope) * (clampedY - minY);
                    return toGen / minG;
                } else if (this.region.getBlockId(this.x, this.y + 4, this.z) || this.region.getBlockId(this.x, this.y + 5, this.z)) {
                    return 0
                }
            }
            return 0;
        }
        getAngle() {
            return this.data.angle;
        }
        isBlackList(dim: number) {
            return false; // not ready
        }
        onInit(): void {
            if (this.isBlackList(this.dimension)) {
                this.setActive(false);
            }
            super.onInit()
        }
        onTick(): void {
            // Update Angle
            if (this.isActive()) {
                this.data.angle = (this.data.angle + this.getHeightSpeedRatio()) % 360;
            }

            this.sendPacket("spinBlade", { blade: this.blades, block_data: this.networkData.getInt("facing"), speed: MathHelper.degreeToRadian(this.getAngle()) })
            // If we're in a blacklisted dimension, there's nothing more to do
            if (this.isBlackList(this.dimension)) {
                return;
            }
            if (World.getThreadTime() % 20 == 0) {
                // Recalculate the current multiplier once a second
                this.data.currentMultiplier = this.getMultiplier();
                this.setActive(this.data.currentMultiplier != 0);
            }
            if (this.data.currentMultiplier != 0 && this.powerNeed() != 0) {
                this.data.energy += 60 * this.data.currentMultiplier;
            }
        }
        getHeightSpeedRatio() {
            let height = this.y + 4;
            if (!this.isLoaded) {
                //Fallback to default values, but in general this is not going to happen
                return this.SPEED * height / 384;
            }
            //Shift so that a wind generator at the min build height acts as if it was at a height of zero
            let minBuildHeight = 1
            height -= minBuildHeight;
            return this.SPEED * height / (256 - minBuildHeight);
        }

        getEnergyStorage(): number {
            return jToRF(200000)
        }

        private static readonly PIVOT_POINT = { x: 0, y: 4, z: 0 }
        private static readonly ROTATE_SPEED: number //please write your speed, smaller that 1, for example 0.05 
        blades: Animation.Base

        clientLoad(): void {
            // blade
            const blades = this.blades = new Animation.Base(this.x + WindGenerator.PIVOT_POINT.x, this.y + WindGenerator.PIVOT_POINT.y, this.z + WindGenerator.PIVOT_POINT.z);
            const mesh = new RenderMesh();
            mesh.importFromFile(__dir__ + "resources/res/models/wind_generator/wind_blade.obj", "obj", {
                scale: [1, 1, 1],
                translate: [0.5, 0.5, 0.5],
                invertV: false,
                noRebuild: false
            });
            blades.describe({ mesh: mesh, skin: "models/wind_generator/wind_blade.png" });
            blades.load();
            // base
        };
        clientUnload(): void {
            const blades = this.blades
            blades && blades.destroy();
        };
        destroy(): boolean {
            const blades = this.blades
            blades && blades.destroy();
            return false;
        };
        @NetworkEvent(Side.Client)
        protected spinBlade(data: { blade: Animation.Base, block_data: number, speed: number }) {
            // const data = this.networkData.getInt("facing")
            const blades = data.blade
            const rotation = { x: MathHelper.degreeToRadian(MekModel.rotate[data.block_data - 2][0]), y: MathHelper.degreeToRadian(MekModel.rotate[data.block_data - 2][1]), z: MathHelper.degreeToRadian(MekModel.rotate[data.block_data - 2][2]) }
            blades.load()
            switch (data.block_data) {
                case 0:
                case 2:
                case 3:
                    blades && blades.transform().rotate(data.speed / 100, rotation.y, 0);
                    break;
                case 4:
                case 5:
                    blades && blades.transform().rotate(0, rotation.y, data.speed / 100);
                    break;
            }
        };

        canExtractEnergy(side: number, type: string): boolean {
            switch (this.region.getBlockData(this.x, this.y, this.z)) {
                case 2:
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
        };
    }
    MachineRegistry.registerPrototype(BlockID.windGeneratorMek, new WindGenerator())
}