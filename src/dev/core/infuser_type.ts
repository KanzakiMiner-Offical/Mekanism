namespace Infuser_Type {
   export let types: string[] = [];
   export let item_type: { [key: number]: { type: string, value: number } } = {}
   export function registerType(id: string, texture?: string, needPerfix: boolean = false) {
      let textures = []
      textures.push(texture || id)
      let type = needPerfix ? `infuser_${id}` : id
      LiquidRegistry.registerLiquid(type, `Infuser ${id}`, textures)
      types.push(type)
   }
   export function registerItem(type: string, id: number, value: number) {
      if (isExist(type)) registerType(type)
      item_type[id] = { type: type, value: value }
   }
   export function isExist(type: string) {
      return types.indexOf(type) != -1;
   }
   export function isInfuserType(item: ItemInstance | ItemInstance) {
      return !!item_type[item.id]
   }

   export function getTypeFromItem(id: number) {
      return item_type[id]
   }
}

Infuser_Type.registerType("redstone", "infuser_redstone")
Infuser_Type.registerType("coal", "infuser_coal")
Infuser_Type.registerType("diamond", "infuser_diamond")
Infuser_Type.registerType("fungi", "fungi")

Infuser_Type.registerItem("infuser_coal", VanillaItemID.coal, 10)
Infuser_Type.registerItem("infuser_coal", VanillaItemID.charcoal, 10)
Infuser_Type.registerItem("infuser_redstone", VanillaItemID.redstone, 10)
Infuser_Type.registerItem("infuser_diamond", VanillaItemID.diamond, 10)
Infuser_Type.registerItem("infuser_gold", VanillaItemID.gold_ingot, 10)

Infuser_Type.registerItem("infuser_coal", ItemID.dustCoal, 10)
Infuser_Type.registerItem("infuser_coal", ItemID.dustCharcoal, 10)
Infuser_Type.registerItem("infuser_gold", ItemID.dustGold, 10)
Infuser_Type.registerItem("infuser_diamond", ItemID.dustDiamond, 10)

Infuser_Type.registerItem("infuser_coal", VanillaBlockID.coal_block, 90)
Infuser_Type.registerItem("infuser_redstone", VanillaBlockID.redstone_block, 90)
Infuser_Type.registerItem("infuser_diamond", VanillaBlockID.diamond_block, 90)

Infuser_Type.registerItem("infuser_coal", ItemID.enrichedCoal, 80)
Infuser_Type.registerItem("infuser_redstone", ItemID.enrichedRedstone, 80)
Infuser_Type.registerItem("infuser_diamond", ItemID.enrichedDiamond, 80)
Infuser_Type.registerItem("infuser_gold", ItemID.enrichedGold, 80)
Infuser_Type.registerItem("infuser_tin", ItemID.enrichedTin, 80)
Infuser_Type.registerItem("infuser_obsidian", ItemID.enrichedObsidian, 80)

// Fungi
let mushroom: number[] = [VanillaBlockID.warped_fungus, VanillaBlockID.crimson_fungus, VanillaBlockID.red_mushroom, VanillaBlockID.brown_mushroom]
mushroom.forEach(function (item) {
   Infuser_Type.registerItem("fungi", item, 10)
})