namespace GasRegister {
    export let gases = [];
    export let liquids = []
    export function registerGas(key: string, name: string, canCondenser: boolean, uiTextures: string[], modelTextures: string[] = []) {
        if (canCondenser) {
            let liquidTexture = `${key}_liquid`
            LiquidRegistry.registerLiquid(liquidTexture, `${name} Liquid`, [liquidTexture], modelTextures);
            liquids.push(liquidTexture)
        }
        if (!key.includes("gen")) {
            key = `${key}_gas`
            name = `${name} Gas`
        }
        LiquidRegistry.registerLiquid(key, name, uiTextures, modelTextures);
        gases.push(key)

    }
}