/// <reference path="base.ts" />

class SpeedUpgrade extends UpgradeModule
implements ItemBehavior {
   type = "speed";

   constructor() {
      super("mekSpeedUpgrade", "speed", "speed");
      this.setMaxStack(8)
   }
   onNameOverride(item: ItemInstance, name: string): string {
      return name
   }
}

ItemRegistry.registerItem(new SpeedUpgrade())