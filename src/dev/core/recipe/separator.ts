namespace SeparatorRecipe {
    type SeparatorRecipe = {
        liqIn: LiquidInstance,
        gasOut1: GasInstance,
        gasOut2?: GasInstance,
        energyMult?: number
    }
    export let recipes: SeparatorRecipe[] = []
    export function add(recipe: SeparatorRecipe) {
        if (!recipe.liqIn) return;
        recipe.energyMult = recipe.energyMult || 1
        recipes.push(recipe);
        return;
    }
    export function get(liqIn: string, amount: number = 10) {
        for (let recipe of recipes) {
            if (recipe.liqIn.liquid == liqIn && amount >= recipe.liqIn.amount) {
                return recipe
            }
        }
        return null
    }
    export function isValidInput(liqIn: string): boolean {
        return !!get(liqIn)
    }

    export function getLiqIn(): string[] {
        let arr: string[] = []
        for (const recipe of recipes) {
            arr.push(recipe.liqIn.liquid)
        }
        return arr
    }
    export function getGasLeft(): string[] {
        let arr: string[] = []
        for (const recipe of recipes) {
            arr.push(recipe.gasOut1.gas)
        }
        return arr
    }
    export function getGasRight(): string[] {
        let arr: string[] = []
        for (const recipe of recipes) {
            arr.push(recipe.gasOut2.gas)
        }
        return arr
    }
}