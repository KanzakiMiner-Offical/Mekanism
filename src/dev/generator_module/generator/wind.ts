// not ready not
BlockRegistry.createBlock("windGeneratorMek", [
    { name: "Wind Generator", texture: [["steel_casing", 0]] }]);

BlockRegistry.setBlockMaterial(BlockID.windGeneratorMek, "stone", 1);

MekModel.setInventoryModel(new ItemStack(BlockID["windGeneratorMek"], 1, 0), "item/wind_generator_item", "wind_generator/wind_generator_item", {
    translate: [0.25, 0, 0.5], scale: [1.50, 1.50, 1.50], invertV: false, noRebuild: false
}, [0, 0, -15])
MekModel.setHandModel(new ItemStack(BlockID["windGeneratorMek"], 1, 0), "item/wind_generator_item", "wind_generator/wind_generator_item", {
    translate: [0.25, 0, 0], scale: [2.5, 2.5, 2.5], invertV: false, noRebuild: false
})


MekModel.registerModelWithRotation(BlockID["windGeneratorMek"], "resources/res/models/wind/wind_base")

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

        private defineRotate(): Vector {
            const data = this.blockSource.getBlockData(this.x, this.y, this.z)
            return { x: MathHelper.degreeToRadian(MekModel.rotate[data - 2][0]), y: MathHelper.degreeToRadian(MekModel.rotate[data - 2][1]), z: MathHelper.degreeToRadian(MekModel.rotate[data - 2][2]) }
        }
        clientLoad(): void {
            // blade
            const blades = this.blades = new Animation.Base(this.x + WindGenerator.PIVOT_POINT.x, this.y + WindGenerator.PIVOT_POINT.y, this.z + WindGenerator.PIVOT_POINT.z);
            const mesh = new RenderMesh();
            mesh.importFromFile(__dir__ + "resources/res/models/wind_generator/wind_blade.obj", "obj", {
                scale: [5, 5, 5],
                translate: [0.5, 0.5, 0.5],
                invertV: false,
                noRebuild: false
            });
            const rotation = this.defineRotate();
            mesh.rotate(rotation.x, rotation.y, rotation.z);
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
        @BlockEngine.Decorators.NetworkEvent(Side.Client)
        protected rotate() {
            const data = this.blockSource.getBlockData(this.x, this.y, this.z) as number
            const blades = this.blades as Animation.Base;
            blades.load()
            switch (data) {
                case 2:
                case 3:
                    blades && blades.transform().rotate(this.getHeightSpeedRatio() / 100, 0, 0);
                    break;
                case 4:
                case 5:
                    blades && blades.transform().rotate(0, 0, this.getHeightSpeedRatio() / 100);
                    break;
            }
        };
    }
    MachineRegistry.registerPrototype(BlockID.windGeneratorMek, new WindGenerator())
}