namespace InfuserRecipe {
   export interface IInfuserRecipeWithType {
      type: string,
      input: ItemInstance,
      output: ItemInstance,
      infuser_use: number
   }
   export let recipes: { [key: string]: IInfuserRecipeWithType[] } = {};
   export function add(recipe: IInfuserRecipeWithType) {
      let RecipeArray: IInfuserRecipeWithType[] = recipes[recipe.type] || []
      RecipeArray.push(recipe)
      recipes[recipe.type] = RecipeArray;
   }
   export function get(type: string, input: ItemInstance): IInfuserRecipeWithType {
      let recipe_a = recipes[type]
      recipe_a.forEach(recipe => {
         if (recipe.input.id == input.id && recipe.input.data == input.data && input.count >= recipe.input.count) {
            return recipe
         };
      })
      return null
   }
   export function isValidInput(item: ItemInstance, type?: string): boolean {
      if (type) return !!get(type, item)
      else {
         for (let index in recipes) {
            let recipe_a = recipes[index];
            recipe_a.forEach(recipe => {
               if (recipe.input.id == item.id && recipe.input.data == item.data) {
                  return recipe
               };
            })
         }
      }
   }
}