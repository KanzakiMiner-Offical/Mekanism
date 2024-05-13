ModAPI.addAPICallback("RecipeViewer", (api: typeof RV) => {
    RV = api;
    const RecipeType = api.RecipeType
    const Bitmap = android.graphics.Bitmap;
    class MetallurgicInfuserRecipe extends RecipeType {
        constructor() {
            super("Metallurgic Infuser", BlockID.metallurgicInfuser, {
                drawing: [
                    { type: "bitmap", x: 555, y: 245, bitmap: "GuiProgressScale", scale: GUI_BAR_STANDARD_SCALE }
                ],
                elements: {
                    input0: { type: "slot", x: 480, y: 220 },
                    output0: { type: "slot", x: 720, y: 220 },
                    inputLiq0: { width: 12, height: 108, x: 350 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE }
                }
            });
            this.setTankLimit(1000)
        }

        getAllList(): RecipePattern[] {
            const list: RecipePattern[] = [];
            for (let type in InfuserRecipe.recipes) {
                let recipes = InfuserRecipe.recipes[type];
                for (let recipe of recipes) {
                    list.push({
                        input: [recipe.input],
                        output: [recipe.output],
                        inputLiq: [{ liquid: recipe.type, amount: 1000, tips: { amount: recipe.infuser_use } }]
                    })
                }
            }
            return list;
        }
        tankTooltip(name: string, liquid: LiquidInstance, tips: {
            [key: string]: any
        }): string {
            return name + ": " + tips.amount + " mB";
        }
    }

    api.RecipeTypeRegistry.register("mek_infuser", new MetallurgicInfuserRecipe());

    class InfuserFuel extends RecipeType {
        constructor() {
            super(Translation.translate("conversion.mekanism.infusion"), BlockID.metallurgicInfuser, {
                drawing: [
                    { type: "bitmap", x: 555, y: 245, bitmap: "GuiProgressScale", scale: GUI_BAR_STANDARD_SCALE }
                ],
                elements: {
                    input0: { type: "slot", x: 480, y: 220 },
                    outputLiq0: { width: 18, height: 60, x: 750 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE }
                }
            });
            this.setTankLimit(100)
        }

        getAllList(): RecipePattern[] {
            const list: RecipePattern[] = [];
            for (let i in Infuser_Type.item_type) {
                let id = parseInt(i);
                if (id) {
                    list.push({
                        input: [{ id: id, count: 1, data: 0 }],
                        outputLiq: [{ liquid: Infuser_Type.item_type[i].type, amount: 1000, tips: { amount: Infuser_Type.item_type[i].value } }]
                    })
                }
            }
            return list;
        }
        tankTooltip(name: string, liquid: LiquidInstance, tips: {
            [key: string]: any
        }): string {
            return name + ": " + tips.amount + " mB";
        }
    }
    api.RecipeTypeRegistry.register("mek_infuser_fuel", new InfuserFuel());

});