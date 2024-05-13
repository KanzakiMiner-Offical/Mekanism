class UpgradeModule extends ItemCommon
implements IUpgrades {
  type: string;
  constructor(stringID: string, name: string, type ? : string) {
    super(stringID, "".concat("item.mekanism.upgrade_", name), "".concat("upgrade_", name));
    if (type) this.type = type;
    UpgradesAPI.registerUpgrade(this.id, this);

  }
}
