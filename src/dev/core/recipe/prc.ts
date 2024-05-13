namespace PRCRecipe {
    type ReactionRecipe = {
        input: ItemInstance,
        output: ItemInstance,
        liqIn: LiquidInstance,
        gasIn: LiquidInstance,
        liqOut?: LiquidInstance,
        time: number,
        energyReq: number
    }
    export let recipes: ReactionRecipe[] = []
    export function add(recipe: ReactionRecipe) {
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