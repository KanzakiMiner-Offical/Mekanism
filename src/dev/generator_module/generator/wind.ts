// not ready not
namespace Machine {
class WindGenerator extends TileEntityBase {
    //please create generator class and extend 
    private static readonly PIVOT_POINT: Vector //please write your pivot coords here
    private static readonly MODEL_NAME: string //please create and use your model name, i can't find 
    private static readonly ROTATE_SPEED: number //please write your speed, smaller that 1, for example 0.05 
    private defineRotate(): Vector {
        let rotation_coords: Vector;
        const data = this.blockSource.getBlockData(this.x, this.y, this.z)
        switch(data) {
            //you need validate data and set need rotate in radians
        };
        return rotation_coords;
    }
    clientLoad(): void {
        const blades = this["blades"] = new Animation.Base(this.x + WindGenerator.PIVOT_POINT.x, this.y + WindGenerator.PIVOT_POINT.y, this.z + WindGenerator.PIVOT_POINT.z);
        const mesh = new RenderMesh();
        mesh.importFromFile(__dir__ + "resources/assets/model/" + WindGenerator.MODEL_NAME, "obj", {
            scale: [5, 5, 5], //please write your scale
            translate: [0.5, 0.5, 0.5], //please write your translate data if it need
            invertV: false,
            noRebuild: false
        });
        const rotation = this.defineRotate();
        mesh.rotate(rotation.x, rotation.y, rotation.z);
        blades.describe({mesh, skin: WindGenerator.MODEL_NAME});
        blades.load();
    };
    clientUnload(): void {
        const blades = this["blades"]
        blades && blades.destroy();
    };
    destroy(): boolean {
        const blades = this["blades"]
        blades && blades.destroy();
        return false;
    };
    @BlockEngine.Decorators.NetworkEvent(Side.Client)
    protected rotate() {
        const blades = this["blades"] as Animation.Base;
        blades.load()
        blades && blades.transform().rotate(/*please validate rotation using information of block data if you want to use data for it*/, 0.05, 0, 0);
    };
}
}