namespace Infuser_Type {
   export let types: string[] = [];
   export let item_type: { [key: number]: { type: string, value: number } } = {}
   export function registerType(id: string, texture?: string) {
      let textures = []
      textures.push(texture || id)
      LiquidRegistry.registerLiquid(`infuser_${id}`, `Infuser ${id}`, textures)
      types.push(`infuser_${id}`)
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

Infuser_Type.registerItem("infuser_coal", VanillaItemID.coal, 10)
Infuser_Type.registerItem("infuser_redstone", VanillaItemID.redstone, 10)
Infuser_Type.registerItem("infuser_diamond", VanillaItemID.diamond, 10)


Infuser_Type.registerItem("infuser_coal", VanillaBlockID.coal_block, 90)
Infuser_Type.registerItem("infuser_redstone", VanillaBlockID.redstone_block, 90)
Infuser_Type.registerItem("infuser_diamond", VanillaBlockID.diamond_block, 90)


Infuser_Type.registerItem("infuser_coal", ItemID.enrichedCoal, 80)
Infuser_Type.registerItem("infuser_redstone", ItemID.enrichedRedstone, 80)