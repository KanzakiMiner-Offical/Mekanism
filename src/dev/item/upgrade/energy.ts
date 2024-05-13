/// <reference path="base.ts" />

class EnergyUpgrade extends UpgradeModule
    implements ItemBehavior {
    type = "energy";

    constructor() {
        super("mekEnergyUpgrade", "energy", "energy");
        this.setMaxStack(8)
    }
    onNameOverride(item: ItemInstance, name: string): string {
        return name
    }
}

ItemRegistry.registerItem(new EnergyUpgrade())