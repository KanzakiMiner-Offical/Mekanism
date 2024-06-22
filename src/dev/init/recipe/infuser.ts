Callback.addCallback("PreLoaded", function () {
    // redstone
    InfuserRecipe.add({
        type: "redstone",
        infuser_use: 10,
        input: { id: VanillaItemID.redstone, count: 1, data: 0 },
        output: { id: ItemID.alloyInfused, count: 1, data: 0 }
    })

    InfuserRecipe.add({
        type: "redstone",
        infuser_use: 20,
        input: { id: ItemID.ingotOsmium, count: 1, data: 0 },
        output: { id: ItemID.circuitBasic, count: 1, data: 0 }
    })

    // coal 
    InfuserRecipe.add({
        type: "coal",
        infuser_use: 10,
        input: { id: VanillaItemID.iron_ingot, count: 1, data: 0 },
        output: { id: ItemID.enrichedIron, count: 1, data: 0 }
    })

    InfuserRecipe.add({
        type: "coal",
        infuser_use: 10,
        input: { id: ItemID.enrichedIron, count: 1, data: 0 },
        output: { id: ItemID.dustSteel, count: 1, data: 0 }
    })


    // diamond 
    InfuserRecipe.add({
        type: "diamond",
        infuser_use: 20,
        input: { id: ItemID.alloyInfused, count: 1, data: 0 },
        output: { id: ItemID.alloyReinforced, count: 1, data: 0 }
    })

    InfuserRecipe.add({
        type: "diamond",
        infuser_use: 10,
        input: { id: ItemID.dustObsidian, count: 1, data: 0 },
        output: { id: ItemID.dustRefinedObsidian, count: 1, data: 0 }
    })

    // obsidian
    InfuserRecipe.add({
        type: "obsidian",
        infuser_use: 40,
        input: { id: ItemID.alloyReinforced, count: 1, data: 0 },
        output: { id: ItemID.alloyAtomic, count: 1, data: 0 }
    })

    // Tin

    InfuserRecipe.add({
        type: "tin",
        infuser_use: 10,
        input: { id: ItemID.dustCopper, count: 3, data: 0 },
        output: { id: ItemID.dustBronze, count: 4, data: 0 }
    })

    InfuserRecipe.add({
        type: "tin",
        infuser_use: 10,
        input: { id: ItemID.ingotCopper, count: 3, data: 0 },
        output: { id: ItemID.ingotBronze, count: 4, data: 0 }
    })
    //  Fungi

    InfuserRecipe.add({
        type: "fungi",
        infuser_use: 10,
        input: { id: VanillaBlockID.crimson_nylium, count: 1, data: 0 },
        output: { id: VanillaBlockID.warped_nylium, count: 1, data: 0 }
    })

    InfuserRecipe.add({
        type: "fungi",
        infuser_use: 10,
        input: { id: VanillaBlockID.netherrack, count: 1, data: 0 },
        output: { id: VanillaBlockID.crimson_nylium, count: 1, data: 0 }
    })


    // Bio
})