BlockRegistry.createBlock("pressurizedReactionChamber", [
    { name: "Pressurized Reaction Chamber", texture: [["PRCD", 0], ["PRCT", 0], ["PRCB", 0], ["PRCF", 0], ["PRCL", 0], ["PRCR", 0]], inCreative: true }]);

BlockRegistry.setBlockMaterial(BlockID.pressurizedReactionChamber, "stone", 1);
(function () {
    const mesh = new RenderMesh();
    mesh.importFromFile(
        __dir__ + "resources/res/model/" + "pressurized_reaction_chamber" + ".obj",
        "obj",
        null
    );
    ItemModel.getForWithFallback(BlockID["pressurizedReactionChamber"], 0).setModel(
        mesh,
        "res/terrain-atlas/model/item/pressurized_reaction_chamber"
    )
})();

