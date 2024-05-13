const EnderAPI = {
    MachineRegistry: MachineRegistry,
    Recipe: RecipeManager,
    UpgradesAPI: UpgradesAPI,
    Machine: Machine,
    requireGlobal: function (command: any) {
      return eval(command);
    }
  }
  
  Logger.Log(`EnderIO loading finished in ${(Debug.sysTime() - startTime)} ms`, "INFO");
  
  ModAPI.registerAPI("EnderAPI", EnderAPI);
  
  Logger.Log("EnderIO API was shared with name: EnderAPI", "API");