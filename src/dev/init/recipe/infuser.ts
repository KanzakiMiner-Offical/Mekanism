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

InfuserRecipe.add({
    type: "diamond",
    infuser_use: 10,
    input: { id: ItemID.alloyInfused, count: 1, data: 0 },
    output: { id: ItemID.alloyReinforced, count: 1, data: 0 }
})

InfuserRecipe.add({
    type: "diamond",
    infuser_use: 10,
    input: { id: ItemID.dustObsidian, count: 1, data: 0 },
    output: { id: ItemID.alloyReinforced, count: 1, data: 0 }
})
// InfuserRecipe.add({
//     type: "obsidian",
//     infuser_use: 40,
//     input: { id: ItemID.alloyReinforced, count: 1, data: 0 },
//     output: { id: ItemID.alloyAtomic, count: 1, data: 0 }
// })