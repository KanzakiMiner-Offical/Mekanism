namespace MaterialRegistry {
    export let oreName: string[] = []
    export let ingotData: string[] = []
    export let dustData: string[] = []


    export function registerIngot(id: string, texture?: string) {
        texture = texture || id
        let name = "item.mekanism.ingot_" + id // item.mekanism.ingot_
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("ingot" + _id, { name: name, icon: "ingot_" + texture });
    }

    export function registerNugget(id: string, disabledRecipe: boolean = false, texture?: string) {
        texture = texture || id
        let name = "item.mekanism.nugget" + id;
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("nugget" + _id, { name: name, icon: "nugget_" + texture });
        if (!disabledRecipe) {
            Recipes.addShaped({ id: ItemID["ingot" + _id], count: 1, data: 0 }, [
                "fff",
                "fff",
                "fff",
            ], ['f', ItemID["nugget" + _id], 0]);
            Recipes.addShapeless({ id: ItemID["nugget" + _id], count: 9, data: 0 }, [{ id: ItemID["ingot" + _id], data: 0 }]);
        }
    }

    export function registerDust(id: string, texture?: string) {
        texture = texture || id
        let name = "item.mekanism.dust_" + id
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("dust" + _id, { name: name, icon: "dust_" + texture });
    }

    // raw, shard, crystal, clump, dirty dust not ready

    export function registerOre(id: string, time: number, level: number) {
        class BlockOre extends BlockBase {
            constructor(id: string, time: number, miningLevel: number) {
                let _id = "ore" + id.charAt(0).toUpperCase() + id.slice(1);
                super(_id, "ore");
                let name = "block.mekanism." + id + "_ore"; //  block.mekanism.lead_ore
                let textureName = id = "_ore";
                this.addVariation(name, [[textureName, 0]], true);
                this.setBlockMaterial("stone", miningLevel);
                this.setDestroyTime(time)
            }
        }
        BlockRegistry.registerBlock(new BlockOre(id, time, level));
    }

    export function registerStorage(id: string, time: number, level: number, texture?: string) {
        texture = texture || id
        class BlockResource extends BlockBase {
            constructor(id: string, time: number, miningLevel: number) {
                let _id = "block" + id.charAt(0).toUpperCase() + id.slice(1);
                super(_id, "stone");
                let name = "block.mekanism.block_" + id // block.mekanism.block_
                let textureName = "block_" + texture
                this.addVariation(name, [[textureName, 0]], true);
                this.setBlockMaterial("stone", miningLevel);
                this.setDestroyTime(time)
            }
        }
        BlockRegistry.registerBlock(new BlockResource(id, time, level));
    }

    export function registerResource(id: string, level: number, time: number) {
        oreName.push(id);
        ingotData.push(id);
        dustData.push(id)
        registerOre(id, time, level);
        registerDust(id);
        registerIngot(id);
        registerNugget(id, false);
        registerStorage(id, time, level);
    }

    export function registerAlloy(id: string, level: number, time: number, disabledFurnace: boolean = false, disabledDust: boolean = false) {
        let old_id = id
        if (id.indexOf("_") > -1) {
            let i = id.indexOf("_");
            id = id.slice(0, i + 1) + id.charAt(i + 1).toUpperCase() + id.slice(i + 2)
            id = id.split('_').join('');
        }
        if (!disabledFurnace) dustData.push(id)
        ingotData.push(id);
        registerIngot(id, old_id);
        registerNugget(id, false, old_id);
        if (!disabledDust) registerDust(id, old_id)
        registerStorage(id, time, level, old_id);
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
            if (!id) return;
            let _id = id.charAt(0).toUpperCase() + id.slice(1);
            Recipes.addFurnace(ItemID["dust" + _id], 0, ItemID["ingot" + _id], 0)
        }
    }
}