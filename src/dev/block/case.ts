BlockRegistry.createBlock("steelCasing", [
    { name: "block.mekanism.steel_casing", texture: [["steel_casing", 0]], inCreative: true }
])

Callback.addCallback("PreLoaded", function () {
    Recipes.addShaped({ id: BlockID.steelCasing, count: 1, data: 0 }, [
        "sgs",
        "gog",
        "sgs"
    ], ['s', ItemID.ingotSteel, 0, 'o', ItemID.ingotOsmium, 0, 'g', 20, 0]);
});
