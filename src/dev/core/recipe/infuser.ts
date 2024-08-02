namespace InfuserRecipe {
   export interface IInfuserRecipeWithType {
      type: string,
      input: ItemInstance,
      output: ItemInstance,
      infuser_use: number
   }
   export let recipes: { [key: string]: IInfuserRecipeWithType[] } = {};
   export function add(recipe: IInfuserRecipeWithType) {
      let type = recipe.type
      if (!(recipe.type == "fungi" || recipe.type == "bio")) {
         type = `infuser_${recipe.type}`
      }
      if (!Infuser_Type.isExist(type)) return
      let RecipeArray: IInfuserRecipeWithType[] = recipes[type] || []
      RecipeArray.push(recipe)
      recipes[type] = RecipeArray;
   }
   export function get(type: string, input: ItemInstance): IInfuserRecipeWithType {
      let recipe_a = recipes[type]
      if (!type || !input) return
      if (!Infuser_Type.isExist(type)) return null;
      for (let recipe of recipe_a) {
         if ((recipe.input.id == input.id && (input.data == recipe.input.data || recipe.input.data == -1) && input.count >= recipe.input.count)) {
            return recipe
         };
      }
      return null
   }
   export function isValidInput(item: ItemInstance, type?: string): boolean {
      if (type) return !!get(type, item) // default
      if (!Infuser_Type.isExist(type)) return false
      else { // For Input Check
         for (let index in recipes) {
            let recipe_a = recipes[index];
            for (let recipe of recipe_a) {
               if (recipe.input.id == item.id && (item.data == recipe.input.data || recipe.input.data == -1)) {
                  return !!recipe
               };
            }
         }
      }
      return false
   }
}