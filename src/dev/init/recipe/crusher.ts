Callback.addCallback("PreLoaded", function () {
    //#Bio Fuel

    // sapling
    CrusherRecipe.add({
        input: { id: VanillaBlockID.sapling, count: 1, data: -1 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })
    // leaf
    CrusherRecipe.add({
        input: { id: VanillaBlockID.leaves, count: 1, data: -1 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.leaves2, count: 1, data: -1 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })
    // flower
    CrusherRecipe.add({
        input: { id: VanillaBlockID.red_flower, count: 1, data: -1 },
        output: { id: ItemID.bioFuel, count: 5, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.yellow_flower, count: 1, data: -1 },
        output: { id: ItemID.bioFuel, count: 5, data: 0 },
    })
    // food
    let food1 = [VanillaItemID.baked_potato, VanillaItemID.bread, VanillaItemID.cookie] // 7
    food1.forEach(function (item) {
        CrusherRecipe.add({
            input: { id: item, count: 1, data: 0 },
            output: { id: ItemID.bioFuel, count: 7, data: 0 },
        })
    })

    let food2 = [VanillaBlockID.beetroot, VanillaItemID.carrot, VanillaBlockID.carved_pumpkin, VanillaItemID.cocoa_beans, VanillaItemID.melon_slice, VanillaItemID.mushroom_stew, VanillaItemID.potato, VanillaItemID.pumpkin, VanillaBlockID.sea_pickle, VanillaBlockID.wheat] // 5 VanillaBlockID.pumpkin,
    food2.forEach(function (item) {
        CrusherRecipe.add({
            input: { id: item, count: 1, data: 0 },
            output: { id: ItemID.bioFuel, count: 5, data: 0 },
        })
    })
    CrusherRecipe.add({
        input: { id: VanillaItemID.sweet_berries, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })

    CrusherRecipe.add({
        input: { id: VanillaItemID.dried_kelp, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })

    CrusherRecipe.add({
        input: { id: VanillaBlockID.dried_kelp_block, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 4, data: 0 },
    })

    CrusherRecipe.add({
        input: { id: VanillaBlockID.cake, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 8, data: 0 },
    })

    CrusherRecipe.add({
        input: { id: VanillaItemID.pumpkin_pie, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 8, data: 0 },
    })
    // seed
    let seeds = [VanillaItemID.beetroot_seeds, VanillaItemID.melon_seeds, VanillaItemID.pumpkin_seeds, VanillaItemID.wheat_seeds] // 2
    seeds.forEach(function (item) {
        CrusherRecipe.add({
            input: { id: item, count: 1, data: 0 },
            output: { id: ItemID.bioFuel, count: 2, data: 0 },
        })
    })
    // grass ?
    CrusherRecipe.add({
        input: { id: VanillaBlockID.grass, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.nether_sprouts, count: 1, data: -1 },
        output: { id: ItemID.bioFuel, count: 4, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.seagrass, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.vine, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 4, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.twisting_vines, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 4, data: 0 },
    })
    // mushroom 
    let mushroom = [VanillaBlockID.brown_mushroom, VanillaBlockID.red_mushroom, VanillaBlockID.warped_fungus, VanillaBlockID.warped_roots, VanillaBlockID.crimson_fungus, VanillaBlockID.crimson_roots, VanillaBlockID.shroomlight] // 5
    mushroom.forEach(function (item) {
        CrusherRecipe.add({
            input: { id: item, count: 1, data: 0 },
            output: { id: ItemID.bioFuel, count: 5, data: 0 },
        })
    })
    let mushroom_block = [VanillaBlockID.brown_mushroom_block, VanillaBlockID.red_mushroom_block] // 7
    mushroom_block.forEach(function (item) {
        CrusherRecipe.add({
            input: { id: item, count: 1, data: 0 },
            output: { id: ItemID.bioFuel, count: 7, data: 0 },
        })
    })
    // other
    CrusherRecipe.add({
        input: { id: VanillaItemID.sugar_cane, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 4, data: 0 },
    });
    CrusherRecipe.add({
        input: { id: VanillaBlockID.cactus, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 4, data: 0 },
    });
    CrusherRecipe.add({
        input: { id: VanillaBlockID.hay_block, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 7, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.kelp, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 2, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.waterlily, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 5, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.nether_wart, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 5, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.nether_wart_block, count: 1, data: 0 },
        output: { id: ItemID.bioFuel, count: 7, data: 0 },
    })
    //# Ingot => Dust
    MaterialRegistry.ingotData.forEach(function (item) {
        CrusherRecipe.add({
            input: { id: ItemID["ingot" + item], count: 1, data: 0 },
            output: { id: ItemID["dust" + item], count: 1, data: 0 },
        })
    })
    //# Stone
    CrusherRecipe.add({
        input: { id: VanillaBlockID.stone, count: 1, data: -1 },
        output: { id: VanillaBlockID.cobblestone, count: 1, data: 0 },
    })
    //# Other
    CrusherRecipe.add({
        input: { id: VanillaItemID.flint, count: 1, data: 0 },
        output: { id: VanillaItemID.gunpowder, count: 1, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.gravel, count: 1, data: 0 },
        output: { id: VanillaBlockID.sand, count: 1, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.cobblestone, count: 1, data: 0 },
        output: { id: VanillaBlockID.gravel, count: 1, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.soul_soil, count: 1, data: 0 },
        output: { id: VanillaBlockID.soul_sand, count: 1, data: 0 },
    })
    CrusherRecipe.add({
        input: { id: VanillaBlockID.wool, count: 1, data: -1 },
        output: { id: VanillaItemID.string, count: 1, data: 0 },
    })

})