namespace Infuser_Type {
   type Infuser_Data = { type: string, value: number }
   export let types: string[] = [];
   export let item_type: { [key: number]: Infuser_Data } = {}
   export function registerType(id: string, texture?: string, needPerfix: boolean = false) {
      let textures: string[] = []
      textures.push(texture || id)
      let type = needPerfix ? `infuser_${id}` : id
      LiquidRegistry.registerLiquid(type, `infuse_type.mekanism.${id}`, textures)
      types.push(type)
   }
   export function registerItem(type: string, id: number, value: number) {
      if (!isExist(type)) registerType(type)
      item_type[id] = { type: type, value: value }
   }
   export function isExist(type: string) {
      return types.indexOf(type) != -1;
   }

   export function getTypeFromItem(id: number): Infuser_Data {
      return item_type[id]
   }
   export function isInfuserType(item: ItemInstance) {
      return !!getTypeFromItem[item.id]
   }

}

Infuser_Type.registerType("redstone", "infuser_redstone", true)
Infuser_Type.registerType("coal", "infuser_coal", true)
Infuser_Type.registerType("diamond", "infuser_diamond", true)
Infuser_Type.registerType("gold", "infuser_gold", true)
Infuser_Type.registerType("tin", "infuser_tin", true)
Infuser_Type.registerType("obsidian", "infuser_obsidian", true)
Infuser_Type.registerType("fungi", "fungi")
Infuser_Type.registerType("bio", "bio")

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

Infuser_Type.registerItem("infuser_coal", ItemID.enrichedCarbon, 80)
Infuser_Type.registerItem("infuser_redstone", ItemID.enrichedRedstone, 80)
Infuser_Type.registerItem("infuser_diamond", ItemID.enrichedDiamond, 80)
Infuser_Type.registerItem("infuser_gold", ItemID.enrichedGold, 80)
Infuser_Type.registerItem("infuser_tin", ItemID.enrichedTin, 80)
Infuser_Type.registerItem("infuser_obsidian", ItemID.enrichedRefinedObsidian, 80)

// Fungi
let mushroom: number[] = [VanillaBlockID.warped_fungus, VanillaBlockID.crimson_fungus, VanillaBlockID.red_mushroom, VanillaBlockID.brown_mushroom]
mushroom.forEach(function (item) {
   Infuser_Type.registerItem("fungi", item, 10)
})