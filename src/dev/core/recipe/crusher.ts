namespace CrusherRecipe {
    type CrushRecipe = {
        input: ItemInstance,
        output: ItemInstance
    }
    export let recipes: CrushRecipe[] = []
    export function add(recipe: CrushRecipe) {
        if (!recipe.input) return;
        recipes.push(recipe);
        return;
    }
    export function get(input: ItemInstance) {
        for (let recipe of recipes) {
            if (recipe.input == input) {
                return recipe
            }
        }
        return null
    }
    export function isValidInput(item: ItemInstance): boolean {
        return !!get(item)
    }
}