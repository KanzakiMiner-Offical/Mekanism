class SteelCasing extends BlockBase {
    constructor() {
        super("steelCasing", "other-machine");
        this.addVariation("block.mekanism.steel_casing", [["steel_casing", 0]], true);
        this.setBlockMaterial("stone", 1);
        this.setDestroyTime(3);
        this.setLightOpacity(15)
    }
}
BlockRegistry.registerBlock(new SteelCasing());

Callback.addCallback("PreLoaded", function () {
    Recipes.addShaped({ id: BlockID.steelCasing, count: 1, data: 0 }, [
        "sgs",
        "gog",
        "sgs"
    ], ['s', ItemID.ingotSteel, 0, 'o', ItemID.ingotOsmium, 0, 'g', VanillaBlockID.glass, 0]);
});
