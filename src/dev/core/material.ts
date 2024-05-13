namespace MaterialRegistry {
    export let oreName: string[] = []
    export let ingotData: string[] = []
    export let dustData: string[] = []


    export function registerIngot(id: string) {
        let name = "item.mekanism.ingot_" + id // item.mekanism.ingot_
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("ingot" + _id, { name: name, icon: "ingot_" + id });
    }

    export function registerNugget(id: string, disabledRecipe: boolean = false) {
        let name = "item.mekanism.nugget" + id;
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("nugget" + _id, { name: name, icon: "nugget_" + id });
        if (!disabledRecipe) {
            Recipes.addShaped({ id: ItemID["ingot" + _id], count: 1, data: 0 }, [
                "fff",
                "fff",
                "fff",
            ], ['f', ItemID["nugget" + _id], 0]);
            Recipes.addShapeless({ id: ItemID["nugget" + _id], count: 9, data: 0 }, [{ id: ItemID["ingot" + _id], data: 0 }]);
        }
    }

    export function registerDust(id: string) {
        let name = "item.mekanism.dust_" + id
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("dust" + _id, { name: name, icon: "dust_" + id });
    }

    // raw, shard, crystal, clump, dirty dust not ready

    export function registerOre(id: string, time: number, level: number) {
        class BlockOre extends BlockBase {
            constructor(id: string, time: number, miningLevel: number) {
                let _id = "ore" + id.charAt(0).toUpperCase() + id.slice(1);
                super(_id, "ore");
                const name = "block.mekanism." + id + "_ore"; //  block.mekanism.lead_ore
                const textureName = id = "_ore";
                this.addVariation(name, [[textureName, 0]], true);
                this.setBlockMaterial("stone", miningLevel);
                this.setDestroyTime(time)
            }
        }
        BlockRegistry.registerBlock(new BlockOre(id, time, level));
    }

    export function registerStorage(id: string, time: number, level: number) {
        class BlockResource extends BlockBase {
            constructor(id: string, time: number, miningLevel: number) {
                let _id = "block" + id.charAt(0).toUpperCase() + id.slice(1);
                super(_id, "stone");
                const name = "block.mekanism.block_" + id // block.mekanism.block_
                const textureName = "block_" + id
                this.addVariation(name, [[textureName, 0]], true);
                this.setBlockMaterial("stone", miningLevel);
                this.setDestroyTime(time)
            }
        }
        BlockRegistry.registerBlock(new BlockResource(id, time, level));
    }

    export function registerResource(id: string, level: number, time: number) {
        if (id.indexOf("_") > -1) {
            let i = id.indexOf("_");
            id = id.slice(0, i + 1) + id.charAt(i + 1).toUpperCase() + id.slice(i + 2)
            id = id.split('_').join('');
        }
        oreName.push(id);
        ingotData.push(id);
        dustData.push(id)
        registerOre(id, time, level);
        registerDust(id);
        registerIngot(id);
        registerNugget(id, false);
        registerStorage(id, time, level);
    }

    export function registerAlloy(id: string, level: number, time: number, disabledFurnace: boolean = false) {
        if (id.indexOf("_") > -1) {
            let i = id.indexOf("_");
            id = id.slice(0, i + 1) + id.charAt(i + 1).toUpperCase() + id.slice(i + 2)
            id = id.split('_').join('');
        }
        if (!disabledFurnace) dustData.push(id)
        ingotData.push(id);
        registerIngot(id);
        registerNugget(id, false);
        registerDust(id)
        registerStorage(id, time, level);
    }

    export function addBlockRecipe() {
        for (let id of ingotData) {
            let _id = id.charAt(0).toUpperCase() + id.slice(1);
            Recipes.addShaped({ id: BlockID["block" + _id], count: 1, data: 0 }, [
                "fff",
                "fff",
                "fff",
            ], ['f', ItemID["ingot" + _id], 0]);
            Recipes.addShapeless({ id: ItemID["ingot" + _id], count: 9, data: 0 }, [{ id: BlockID["block" + _id], data: 0 }]);
        }
    }

    export function cookDust() {
        for (let id of dustData) {
            let _id = id.charAt(0).toUpperCase() + id.slice(1);
            Recipes.addFurnace(ItemID["dust" + _id], 0, ItemID["ingot" + _id], 0)
        }
    }
}

Callback.addCallback("PreLoaded", function () {
    MaterialRegistry.addBlockRecipe();
    MaterialRegistry.cookDust();
});