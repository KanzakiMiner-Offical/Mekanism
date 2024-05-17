const MekAPI = {
  MachineRegistry: MachineRegistry,
  ModelHelper: MekModel,
  Recipe: RecipeManager,
  UpgradesAPI: UpgradesAPI,
  Machine: Machine,
  requireGlobal: function (command: any) {
    return eval(command);
  }
}

Logger.Log(`Mekanism loading finished in ${(Debug.sysTime() - startTime)} ms`, "INFO");

ModAPI.registerAPI("MekAPI", MekAPI);

Logger.Log("Mekanism API was shared with name: MekAPI", "API");