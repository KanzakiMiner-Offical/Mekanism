namespace MaterialRegistry {
    export function registerInfuserAlloy(id: string) {
        let name = "item.mekanism.alloy_" + id // item.mekanism.alloy_
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("alloy" + _id, { name: name, icon: "alloy_" + id });
    }
    export function registerCircuit(id: string) {
        let name = `item.mekanism.${id}_control_circuit` // item.mekanism.{$advanced}_control_circuit
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("circuit" + _id, { name: name, icon: `${id}_control_circuit` });
    }

    export function registerEnrich(id: string) {
        let name = "item.mekanism.enriched_" + id// item.mekanism.{$advanced}_control_circuit
        let _id = id.charAt(0).toUpperCase() + id.slice(1);
        ItemRegistry.createItem("enriched" + _id, { name: name, icon: "enriched_" + id });
    }
}
// alloy
MaterialRegistry.registerInfuserAlloy("infused")
MaterialRegistry.registerInfuserAlloy("reinforced")
MaterialRegistry.registerInfuserAlloy("atomic")
// circuit
MaterialRegistry.registerCircuit("basic")
MaterialRegistry.registerCircuit("advanced")
MaterialRegistry.registerCircuit("elite")
MaterialRegistry.registerCircuit("ultimate")
// enrich
MaterialRegistry.registerEnrich("iron") // dust
MaterialRegistry.registerEnrich("redstone")
MaterialRegistry.registerEnrich("coal")
MaterialRegistry.registerEnrich("diamond")
MaterialRegistry.registerEnrich("tin")
MaterialRegistry.registerEnrich("gold")
MaterialRegistry.registerEnrich("osidian")
//
ItemRegistry.createItem("bioFuel", {
    name: "item.mekanism.bio_fuel", icon: "bio_fuel"
})