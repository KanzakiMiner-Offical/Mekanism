interface GasInstance {
    gas: string,
    amount: number;
}

namespace GasRegister {
    let gases = {}
    export function registerGas(key: string, name: string, canCondenser: boolean, uiTextures: string[], modelTextures?: string[]) {
        if (canCondenser) {
            let liquidTexture = `${key}_liquid`
            LiquidRegistry.registerLiquid(key, `${name} Liquid`, [liquidTexture], modelTextures)
        }
        if (key.includes("_gen")) key = `${key}_gas`
        LiquidRegistry.registerLiquid(key, name, uiTextures, modelTextures);
        gases[key] = {
            name: name,
            textures: uiTextures,
            modelTextures: modelTextures || null,
            conderser: canCondenser
        }

    }

    export function getGasData(key: string) {
        return gases[key]
    }

    export function getLiquidUITexture(key: string, width: number, height: number): string {
        return LiquidRegistry.getLiquidUITexture(key, width, height);
    }
}