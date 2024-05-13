importLib("energylib", "*");
importLib("ToolType", "*"); 

var LOAD_WORLD = 0;

var render = new ICRender.Model();
var energyJ = EnergyTypeRegistry.assureEnergyType("J", 0.5);
var EU = EnergyTypeRegistry.assureEnergyType("Eu", 1);
var Ewater = EnergyTypeRegistry.assureEnergyType("Wa", 0);
var RF = EnergyTypeRegistry.assureEnergyType("RF", 0.25);

var ChargeItemRegistry = {
	chargeData: {},
	
	registerItem: function(item, energy, level, preventUncharge, EPD, isTool){
		Item.setMaxDamage(item, energy + 1);
		this.chargeData[item] = {
			type: "normal",
			id: item,
			level: level || 0,
			maxDamage: energy + 1,
			maxCharge: energy,
			preventUncharge: preventUncharge,
			isTool: isTool
		};
	},
	
	registerFlashItem: function(item, energy, level){
		this.chargeData[item] = {
			type: "flash",
			id: item,
			level: level || 0,
			energy: energy,
		};
	},
	
	getItemData: function(id){
		return this.chargeData[id];
	},
	
	isFlashStorage: function(id){
		var data = this.getItemData(id);
		return data && data.type == "flash";
	},
	
	getEnergyFrom: function(item, amount, level, getFromAll){
		if(item.id==ItemID.debugItem){
			return amount;
		}
		
		level = level || 0;
		var data = this.getItemData(item.id);
		if(!data || data.level > level || !getFromAll && data.preventUncharge){
			return 0;
		}
		if(data.type == "flash"){
			if(amount < 1){
				return 0;
			}
			item.count--;
			if(item.count < 1){
				item.id = item.data = 0;
			}
			return data.energy;
		}
		if(item.data < 1){
			item.data = 1;
		}
		
		var energyGot = Math.min(amount, data.maxDamage - item.data);
		item.data += energyGot;
		return energyGot;
	},
	
	addEnergyTo: function(item, energy, transf, level){
		level = level || 0;
		var data = this.getItemData(item.id);
		if(!data || data.type == "flash" || data.level > level){
			return 0;
		}
		
		var energyAdd = Math.min(item.data - 1, transf);
		if(energy >= energyAdd){
			item.data -= energyAdd;
			return energyAdd;
		}
		return 0;
	},
	
	getEnergyStored: function(item){
		var data = this.getItemData(item.id);
		if(!data){
			return 0;
		}
		return data.maxDamage - item.data;
	}
}
var RECIPE_FUNC_TRANSPORT_ENERGY = function(api, field, result){
    var energy = 0;
    for(var i in field){
        if(!ChargeItemRegistry.isFlashStorage(field[i].id)){
            energy += ChargeItemRegistry.getEnergyFrom(field[i], 10000000, 3);
        }
        api.decreaseFieldSlot(i);
    }
    ChargeItemRegistry.addEnergyTo(result, energy, energy, 3);
}
function RecipeMachine(Slot, id, energy, energy_consumption, progress, work_time, resultSlot, idr, datar, coutr)
{
    if (Slot.id == id)
        {
            if(energy >= energy_consumption){
                    energy -= energy_consumption;
                    progress += 1/work_time;
                    
                }
                if(progress >= 1){                  
                    Slot.count--;
                    resultSlot.id = idr;
                    resultSlot.data = datar;
                    resultSlot.count += coutr;
                    this.container.validateAll();
                    progress = 0;
                    
                }
        }
}



 

var TILE_RENDERER_CONNECTION_GROUP = "ic-wire";
var TILE_RENDERER_CONNECTION_GROUP_FUEL = "ic-wire_fuel";
var FLUID_PIPE_CONNECTION_MACHINE = "bc-fluid";
var PIPE_BLOCK_WIDTH = 0.25;
var FLUID_PIPE_CONNECTION_ANY = "bc-fluid-pipe-any";
var FLUID_PIPE_CONNECTION_STONE = "bc-fluid-pipe-stone";
var FLUID_PIPE_CONNECTION_COBBLE = "bc-fluid-pipe-cobble";
var FLUID_PIPE_CONNECTION_SANDSTONE = "bc-fluid-pipe-sandstone";
var BLOCK_TYPE_LIQUID_PIPE = Block.createSpecialType({
	base: 20,
	renderlayer: 3
}, "bc-liquid-pipe");
var CABLE_BLOCK_WIDTH = 0.25;
var FURNACE_FUEL_MAP = {
    5: 300,
    6: 100,
    17: 300,
    263: 1600,
    280: 100,
    268: 200,
    269: 200,
    270: 200,
    271: 200,
    85: 300,
    107: 300,
    134: 300,
    135: 300,
    158: 150,
    162: 300,
    163: 300,
    164: 300,
    184: 300,
    185: 300,
    186: 300,
    187: 300,
    53: 300,
    54: 300,
    58: 300
};
var GUI_BAR_STANDARD_SCALE = 3.2;
//Функции и переменные
var BLOCK_TYPE_ORE = Block.createSpecialType({
    base: 1,
    destroytime: 4
}, "ore");

var OreGenerator = {        
    genOreNormal: function(x, y, z, ore){
        for(var xx = -1; xx < 2; xx++){
            for(var yy = -1; yy < 2; yy++){
                for(var zz = -1; zz < 2; zz++){
                    var d = Math.sqrt(xx*xx + yy*yy + zz*zz);
                    var r = 1.5 - Math.random()/2;
                    if(d < r){GenerationUtils.setLockedBlock(x+xx, y+yy, z+zz);}
                }
            }
        }
    },
    genOreSmall: function(x, y, z, ore){
        for(var xx = 0; xx < 2; xx++){
            for(var yy = 0; yy < 2; yy++){
                for(var zz = 0; zz < 2; zz++){
                    var d = Math.sqrt(xx*xx + yy*yy + zz*zz);
                    var r = 2 - Math.random()*2;
                    if(d < r){GenerationUtils.setLockedBlock(x+xx, y+yy, z+zz);}
                }
            }
        }
    },
    genOreTiny: function(x, y, z, maxCount){
        GenerationUtils.setLockedBlock(x,y,z);
        for(var i = 1; i < random(1, maxCount); i++){
            GenerationUtils.setLockedBlock(x+random(-1,1), y+random(-1,1), z+random(-1,1));
        }
    }
}

var MachineRegistry = {
	machineIDs: {},

	isMachine: function(id){
		return this.machineIDs[id];
	},

	register: function(id, prototype){
		// register render
		ICRender.getGroup("ic-wire").add(id, -1);
		// register ID
		this.machineIDs[id] = true;
		// setup energy value
		if (prototype.defaultValues) {
            prototype.defaultValues.energy = 0;
            prototype.defaultValues.fuel = 0;
            prototype.defaultValues.fuelmax = 0;
             prototype.defaultValues.out = 0;  
        } else {
            prototype.defaultValues = {
                 energy: 0,
                fuel: 0,
                fuelmax: 0,
                out: 0     
            };
        }
		// copy functions
		if(!prototype.getEnergyStorage){
			prototype.getEnergyStorage = function(){
				return 0;
			};
		}
		/*
		Prototype.click = function(id, count, data, coords){
			if(id==ItemID.wrench || id==ItemID.electricWrench){
				return true;
			}
		}
		*/
		
		ToolAPI.registerBlockMaterial(id, "stone");
		Block.setDestroyTime(id, 3);
		TileEntity.registerPrototype(id, prototype);
		 EnergyTileRegistry.addEnergyTypeForId(id, energyJ);				
        EnergyTileRegistry.addEnergyTypeForId(id, EU);
        EnergyTileRegistry.addEnergyTypeForId(id, RF);
	},

	
	
	basicEnergyReceiveFunc: function(type, src){
		var energyNeed = this.getEnergyStorage() - this.data.energy;
		this.data.energy += src.getAll(energyNeed);
	}
}




function setupWireRender(id, width, groupName, preventSelfAdd) {
    var render = new ICRender.Model();
    BlockRenderer.setStaticICRender(id, 0, render);
   
    var boxes = [
        {side: [1, 0, 0], box: [0.5 + width / 2, 0.5 - width / 2, 0.5 - width / 2, 1, 0.5 + width / 2, 0.5 + width / 2]},
        {side: [-1, 0, 0], box: [0, 0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2]},
        {side: [0, 1, 0], box: [0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2, 1, 0.5 + width / 2]},
        {side: [0, -1, 0], box: [0.5 - width / 2, 0, 0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2]},
        {side: [0, 0, 1], box: [0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, 1]},
        {side: [0, 0, -1], box: [0.5 - width / 2, 0.5 - width / 2, 0, 0.5 + width / 2, 0.5 + width / 2, 0.5 - width / 2]},
    ]
   
    var group = ICRender.getGroup(groupName);
    if (!preventSelfAdd) {
        group.add(id, -1);
    }
   
    for (var i in boxes) {
        var box = boxes[i];
       
        var model = BlockRenderer.createModel();
        model.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5], id, 0);
       
        render.addEntry(model).asCondition(box.side[0], box.side[1], box.side[2], group, 0);
    }
   
    var model = BlockRenderer.createModel();
    model.addBox(0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, id, 0);
    render.addEntry(model);
    
    width = Math.max(width, 0.5);
    Block.setBlockShape(id, {x: 0.5 - width/2, y: 0.5 - width/2, z: 0.5 - width/2}, {x: 0.5 + width/2, y: 0.5 + width/2, z: 0.5 + width/2});
}

function setupBlockAsWire(id) {
	energyJ.registerWire(id);
	RF.registerWire(id);
}


//--------------------------------------------------------------------------------------------
//--ПЕРЕВОД
  //ПРЕДМЕТЫ
Translation.addTranslation("crush osmium", {ru: "Осмий"});
Translation.addTranslation("ingot osmium", {ru: "Осмиевый слиток"});
Translation.addTranslation("crush copper", {ru: "Медь"});
Translation.addTranslation("copper ingot", {ru: "Медный слиток"});
Translation.addTranslation("crush tin", {ru: "Олово"});
Translation.addTranslation("tin ingot", {ru: "Оловянный слиток"});
Translation.addTranslation("Enriched Iron", {ru: "Обогощённое железо"});
Translation.addTranslation("Steel Dust", {ru: "Стальная пыль"});
Translation.addTranslation("Steel Ingot", {ru: "Стальной слиток"});
Translation.addTranslation("BasicControl Circuit", {ru: "Базовая схема управления"});
Translation.addTranslation("Bio Fuel", {ru: "Биотопливо"});
Translation.addTranslation("Copper Dust", {ru: "Медная пыль"});
Translation.addTranslation("Diamond Dust", {ru: "Алмазная пыль"});
Translation.addTranslation("Gold Dust", {ru: "Золотая пыль"});
Translation.addTranslation("Iron Dust", {ru: "Железная пыль"});
Translation.addTranslation("Obsidian Dust", {ru: "Обсидиановая пыль"});
Translation.addTranslation("Tin Dust", {ru: "Оловянная пыль"});
Translation.addTranslation("Solar Panel", {ru: "Солнечная панель"});
Translation.addTranslation("Enriched Alloy", {ru: "Обогащённый сплав"});
Translation.addTranslation("Osmium Dust", {ru: "Осмиевая пыль"});
Translation.addTranslation("Energy Tablet", {ru: "Энергетический планшет"});
Translation.addTranslation("AdvancedControl Circuit", {ru: "Продвинутая схема управления"});
Translation.addTranslation("RefinedObsidian Dust", {ru: "Пыль очищенного обсидианна"});
Translation.addTranslation("Obsidian Ingot", {ru: "Обсидиановый слиток"});
Translation.addTranslation("Glowstone Ingot", {ru: "Слиток светящегося камня"});
Translation.addTranslation("Electrolytic Core", {ru: "Электролитическое ядро"});

//БЛОКИ
Translation.addTranslation("U CB", {ru: "Базовый универсальный провод"});
Translation.addTranslation("U CA", {ru: "Продвинутый универсальный провод"});
Translation.addTranslation("Osmium Block", {ru: "Осмий Блок"});
Translation.addTranslation("Osmium Ore", {ru: "Осмиевая руда"});
Translation.addTranslation("Copper Ore", {ru: "Медная руда"});
Translation.addTranslation("Copper Block", {ru: "Медный Блок"});
Translation.addTranslation("Tin Ore", {ru: "Оловянная руда"});
Translation.addTranslation("Tin Block", {ru: "Оловянный Блок"});
Translation.addTranslation("Heat Generator", {ru: "Тепловой генератор"});
Translation.addTranslation("Metallurgic Infuser", {ru: "Металургический наполнитель"});
Translation.addTranslation("Steel Casing", {ru: "Стальной корпус"});
Translation.addTranslation("macerator", {ru: "Дробитель"});
Translation.addTranslation("Solar Generator", {ru: "Солнечный генератор"});
Translation.addTranslation("Osmium Compressor", {ru: "Осмиевый компрессор"});
Translation.addTranslation("Refined Obsidian", {ru: "Обсидиановый блок"});
Translation.addTranslation("Enrichment Chambe", {ru: "Камера обогащения"});
Translation.addTranslation("Coal Block", {ru: "Угольный блок"});
Translation.addTranslation("Steel Block", {ru: "Стальной блок"});
Translation.addTranslation("Refined Glowstone", {ru: "Очищенный светящийся камень"});
Translation.addTranslation("Energized Smelter", {ru: "Электричекая плавильня"});
Translation.addTranslation("Bio Generator", {ru: "Биогенератор"});
Translation.addTranslation("BasicSmelting Factory", {ru: "(Базовый) Плавящая фабрика"});
Translation.addTranslation("Pump", {ru: "Помпа"});
//--------------------------------------------------------------------------------------------
//--ПРЕДМЕТЫ
IDRegistry.genItemID("ingotosmium");
Item.createItem("ingotosmium", "ingot osmium", {name: "OsmiumIngot", meta: 0}, {}); 
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(BlockID.OsmiumOre, ItemID.ingotosmium, 0);
});
Recipes.addShapeless({id: ItemID.ingotosmium, count: 9, data: 0}, [{id: BlockID.OsmiumBlock, data: 0}]);
IDRegistry.genItemID("copperingot");
Item.createItem("copperingot", "copper ingot", {name: "CopperIngot", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(BlockID.CopperOre, ItemID.copperingot, 0);
});
Recipes.addShapeless({id: ItemID.copperingot, count: 9, data: 0}, [{id: BlockID.CopperBlock, data: 0}]);

IDRegistry.genItemID("tiningot");
Item.createItem("tiningot", "tin ingot", {name: "TinIngot", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(BlockID.TinOre, ItemID.tiningot, 0);
});
Recipes.addShapeless({id: ItemID.tiningot, count: 9, data: 0}, [{id: BlockID.TinBlock, data: 0}]);
IDRegistry.genItemID("EnrichedIron");
Item.createItem("EnrichedIron", "Enriched Iron", {name: "EnrichedIron", meta: 0}, {});
IDRegistry.genItemID("SteelDust");
Item.createItem("SteelDust", "Steel Dust", {name: "SteelDust", meta: 0}, {});

Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.SteelDust, ItemID.SteelIngot, 0);
 
});


IDRegistry.genItemID("SteelIngot");
Item.createItem("SteelIngot", "Steel Ingot", {name: "SteelIngot", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.SteelDust, ItemID.SteelIngot, 0);
});
IDRegistry.genItemID("BasicControlCircuit");
Item.createItem("BasicControlCircuit", "BasicControl Circuit", {name: "BasicControlCircuit", meta: 0}, {});
IDRegistry.genItemID("CopperDust");
Item.createItem("CopperDust", "Copper Dust", {name: "CopperDust", meta: 0}, {});
IDRegistry.genItemID("BioFuel");
Item.createItem("BioFuel", "Bio Fuel", {name: "BioFuel", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.SteelDust, ItemID.SteelIngot, 0);
});
IDRegistry.genItemID("DiamondDust");
Item.createItem("DiamondDust", "Diamond Dust", {name: "DiamondDust", meta: 0}, {});
IDRegistry.genItemID("DiamondDust");
Item.createItem("DiamondDust", "Diamond Dust", {name: "DiamondDust", meta: 0}, {});
IDRegistry.genItemID("GoldDust");
Item.createItem("GoldDust", "Gold Dust", {name: "GoldDust", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.GoldDust, 266, 0);
});
IDRegistry.genItemID("IronDust");
Item.createItem("IronDust", "Iron Dust", {name: "IronDust", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.IronDust, 265, 0);
});
IDRegistry.genItemID("ObsidianDust");
Item.createItem("ObsidianDust", "Obsidian Dust", {name: "ObsidianDust", meta: 0}, {});
IDRegistry.genItemID("TinDust");
Item.createItem("TinDust", "Tin Dust", {name: "TinDust", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.TinDust, ItemID.tiningot, 0);
});
IDRegistry.genItemID("SolarPanel");
Item.createItem("SolarPanel", "Solar Panel", {name: "SolarPanel", meta: 0}, {});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SolarPanel, count: 1, data: 0}, [

     "ggg",

     "rsr",

     "ooo"

     ], ['g', 20, 0, 'r', 331, 0, 'o', ItemID.ingotosmium, 0, 's', ItemID.EnrichedAlloy, 0]);});
IDRegistry.genItemID("EnrichedAlloy");
Item.createItem("EnrichedAlloy", "Enriched Alloy", {name: "EnrichedAlloy", meta: 0}, {});
IDRegistry.genItemID("OsmiumDust");
Item.createItem("OsmiumDust", "Osmium Dust", {name: "OsmiumDust", meta: 0}, {});
Callback.addCallback("PostLoaded", function () {
Recipes.addFurnace(ItemID.OsmiumDust, ItemID.ingotosmium, 0);
});
IDRegistry.genItemID("EnergyTablet");
Item.createItem("EnergyTablet", "Energy Tablet", {name: "EnergyTablet", meta: 0}, {stack: 1});
ChargeItemRegistry.registerItem(ItemID.EnergyTablet, 1000000, 2);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.EnergyTablet, count: 1, data: Item.getMaxDamage(ItemID.EnergyTablet)}, [
        "rgr",
        "sgs",
        "rgr"
        ], ['s', ItemID.EnrichedAlloy, 0, 'g', 266, 0, 'r', 331, 0]);});
IDRegistry.genItemID("AdvancedControlCircuit");
Item.createItem("AdvancedControlCircuit", "AdvancedControl Circuit", {name: "AdvancedControlCircuit", meta: 0}, {});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.AdvancedControlCircuit, count: 1, data: 0}, [

     "gbg",

     "   ",

     "   "

     ], ['g', ItemID.EnrichedAlloy, 0, 'b', ItemID.BasicControlCircuit, 0]);});
IDRegistry.genItemID("RefinedObsidianDust");
Item.createItem("RefinedObsidianDust", "RefinedObsidian Dust", {name: "RefinedObsidianDust", meta: 0}, {});
IDRegistry.genItemID("ObsidianIngot");
Item.createItem("ObsidianIngot", "Obsidian Ingot", {name: "ObsidianIngot", meta: 0}, {});
IDRegistry.genItemID("GlowstoneIngot");
Item.createItem("GlowstoneIngot", "Glowstone Ingot", {name: "GlowstoneIngot", meta: 0}, {});
IDRegistry.genItemID("ElectrolyticCore");
Item.createItem("ElectrolyticCore", "Electrolytic Core", {name: "ElectrolyticCore", meta: 0}, {});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.ElectrolyticCore, count: 1, data: 0}, [

     "sos",

     "isg",

     "sos"

     ], ['s', ItemID.EnrichedAlloy, 0, 'o', ItemID.OsmiumDust, 0, 'i', ItemID.IronDust, 0, 'g', ItemID.GoldDust, 0]);});
IDRegistry.genItemID("Substrate");
Item.createItem("Substrate", "Субстрат", {name: "Substrate", meta: 0}, {});
IDRegistry.genItemID("HDPEPellet");
Item.createItem("HDPEPellet", "Шарик полиэтилена НД", {name: "HDPEPellet", meta: 0}, {});
IDRegistry.genItemID("HDPESheet");
Item.createItem("HDPESheet", "Лист полиэтилена НД", {name: "HDPESheet", meta: 0}, {});
IDRegistry.genItemID("ReinforcedAlloy");
Item.createItem("ReinforcedAlloy", "Укреплённый сплав", {name: "ReinforcedAlloy", meta: 0}, {});
IDRegistry.genItemID("BronzeIngot");
Item.createItem("BronzeIngot", "Бронзовый слиток", {name: "BronzeIngot", meta: 0}, {});
IDRegistry.genItemID("AtomicAlloy");
Item.createItem("AtomicAlloy", "Атомный сплав", {name: "AtomicAlloy", meta: 0}, {});
IDRegistry.genItemID("TeleportationCore");
Item.createItem("TeleportationCore", "Ядро телепортации", {name: "TeleportationCore", meta: 0}, {});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.TeleportationCore, count: 1, data: 0}, [

     "lal",

     "gdg",

     "lal"

     ], ['l', 351, 3, 'a', ItemID.AtomicAlloy, 0, 'g', 266, 0, 'd', 264, 0]);});
	 	 IDRegistry.genItemID("EliteControlCircuit");
Item.createItem("EliteControlCircuit", "Элитная схема управления", {name: "EliteControlCircuit", meta: 0}, {});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.EliteControlCircuit, count: 1, data: 0}, [

     "sas",

     "   ",

     "   "

     ], ['s', ItemID.ReinforcedAlloy, 0, 'a', ItemID.AdvancedControlCircuit, 0]);});
IDRegistry.genItemID("UltimateControlCircuit");
Item.createItem("UltimateControlCircuit", "Совершенная схема управления", {name: "UltimateControlCircuit", meta: 0}, {});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.UltimateControlCircuit, count: 1, data: 0}, [

     "sas",

     "   ",

     "   "

     ], ['s', ItemID.AtomicAlloy, 0, 'a', ItemID.EliteControlCircuit, 0]);});

//--------------------------------------------------------------------------------------------
//--БЛОКИ
  //РУДА ОСМИЯ
Block.setPrototype("OsmiumOre", {
    type: Block.TYPE_BASE,

    getVariations: function () {
        return [{name: "Osmium Ore", texture: [["OsmiumOre", 0]], inCreative: true}];
    },

    getDrop: function () {
      return [[BlockID.OsmiumOre, 1, 0]];
    },

    getMaterial: function (a) {
        return "stone";
    },

    getDestroyLevel: function (a) {
        return 1;
    }

});

  //БЛОК ОСМИЯ
IDRegistry.genBlockID("OsmiumBlock");
Block.createBlock("OsmiumBlock", [
    {name: "Osmium Block", texture: [["OsmiumBlock", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.OsmiumBlock, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', ItemID.ingotosmium, 0]);});
   //Динамический реверзуар
IDRegistry.genBlockID("DynamicTank");
Block.createBlock("DynamicTank", [
    {name: "Динамический реверзуар", texture: [["DynamicTank", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.DynamicTank, count: 1, data: 0}, [

     " s ",

     "sws",

     " s "

     ], ['s', ItemID.SteelIngot, 0, 'w', 325, 0]);});
  //МЕДНАЯ РУДА
Block.setPrototype("CopperOre", {
    type: Block.TYPE_BASE,

    getVariations: function () {
        return [{name: "Copper Ore", texture: [["CopperOre", 0]], inCreative: true}];
    },

    getDrop: function () {
      return [[BlockID.CopperOre, 1, 0]];
    },

    getMaterial: function (a) {
        return "stone";
    },

    getDestroyLevel: function (a) {
        return 1;
    }

});

  //МЕДНЫЙ БЛОК
IDRegistry.genBlockID("CopperBlock");
Block.createBlock("CopperBlock", [
    {name: "Copper Block", texture: [["CopperBlock", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.CopperBlock, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', ItemID.copperingot, 0]);});

  //ОЛОВЯННАЯ РУДА
Block.setPrototype("TinOre", {
    type: Block.TYPE_BASE,

    getVariations: function () {
        return [{name: "Tin Ore", texture: [["TinOre", 0]], inCreative: true}];
    },

    getDrop: function () {
      return [[BlockID.TinOre, 1, 0]];
    },

    getMaterial: function (a) {
        return "stone";
    },

    getDestroyLevel: function (a) {
        return 1;
    }

});

  //ОЛОВЯННЫЙ БЛОК
  IDRegistry.genBlockID("TinBlock");
Block.createBlock("TinBlock", [
    {name: "Tin Block", texture: [["TinBlock", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.TinBlock, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', ItemID.tiningot, 0]);});
//--Механизмы     
     //Тепловой генератор
	 var MODE_HEADGENERATOR = 0;
	 var CLICK_TIME = 1;
	 if (CLICK_TIME > 0)
	 {
		 CLICK_TIME -= 0.01;
	 }
IDRegistry.genBlockID("HeatGenerator");
Block.createBlock("HeatGenerator", [
{name: "Heat Generator", texture: [["HGC", 0], ["HGT", 0], ["HGB", 0], ["HGF", 0], ["HGR1", 0], ["HGR", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.HeatGenerator);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.HeatGenerator, count: 1, data: 0}, [
     "iii",
     "wow",
     "cfc"
], ['i', 265, 0, 'w', 5, 0, 'o', ItemID.ingotosmium, 0, 'c', ItemID.copperingot, 0, 'f', 61, 0]);});
var guiHeatGenerator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Heat Generator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 530, y: 150, bitmap: "BigFuelBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
  
    ],
    
    elements: {
        "fuelScale": {type: "scale", x: 530 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "LavaScale", overlay: "OverBGFuel", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE}, scale: GUI_BAR_STANDARD_SCALE},
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
        "slotEnergy": {type: "slot", x: 780, y: 200},
        "slotFuel": {type: "slot", x: 441, y: 200},
        "textInfo1": {type: "text", x: 600, y: 330, width: 300, height: 30, text: "0/"},
		
"textInfo2": {type: "text", x: 600, y: 360, width: 300, height: 30, text: "25000 mB"},

    }
});




MachineRegistry.register(BlockID.HeatGenerator, {
    defaultValues: {
       
        energymax: 160000,
        inSound: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiHeatGenerator;
    },
    
    getTransportSlots: function(){
        return {input: ["slotFuel"]};
    },
        
    isGenerator: function() {
        return true;
    },
    
    tick: function(){
		
        
		
		
		
        this.data.fuelmax = 25000;
        var energySlot = this.container.getSlot("slotEnergy");
       this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), this.data.energy, 200, 2);
        var fuelSlot = this.container.getSlot("slotFuel");
        if (fuelSlot.id > 0 && this.data.fuel <= this.data.fuelmax && LOAD_WORLD == 1){
            var fuel = FURNACE_FUEL_MAP[fuelSlot.id];
            if (fuel){
                fuelSlot.count--;
                this.container.validateSlot("slotFuel");
                this.data.fuel += 100;
            }
            if (LiquidRegistry.getItemLiquid(fuelSlot.id, fuelSlot.data) == "lava"){
                var empty = LiquidRegistry.getEmptyItem(fuelSlot.id, fuelSlot.data);
                fuelSlot.id = empty.id;
                fuelSlot.data = empty.data;
                this.data.fuel += 1000;
            }
        }        
        if (this.data.fuel >= 1 && this.data.energy < this.data.energymax)
        {
            if (this.data.inSound == 0)
            {
                this.data.inSound = 1;
            }
           
            this.data.energy += 70,42;
            this.data.fuel -= 10;
        }
        this.container.setText("textInfo1", this.data.fuel + "/");
        this.container.setScale("fuelScale", this.data.fuel / this.data.fuelmax);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        if (this.data.inSound == 1)
        {                    
              this.data.inSound = 2;
        }
          if (this.data.fuel == 0 &&  this.data.inSound != 0)
          {
             
              this.data.inSound = 0;
          }
        
    },
    energyTick: function(type, src){
        var output = Math.min(32, this.data.energy);
        this.data.energy += src.add(output) - output;
    }

});


//Металургический наполнитель
IDRegistry.genBlockID("MetallurgicInfuser");
Block.createBlock("MetallurgicInfuser", [
{name: "Metallurgic Infuser", texture: [["MID", 0], ["MIT", 0], ["MIB", 0], ["MIF", 0], ["MIR1", 0], ["MIR", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.MetallurgicInfuser);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.MetallurgicInfuser, count: 1, data: 0}, [
     "ifi",
     "ror",
     "ifi"
     ], ['i', 265, 0, 'r', 331, 0, 'o', ItemID.ingotosmium, 0, 'f', 61, 0]);});





var guiMetallurgicInfuser = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Metallurgic Infuser"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 350, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 555, y: 245, bitmap: "GuiProgress", scale: GUI_BAR_STANDARD_SCALE},
        
    ],
    
    elements: {
        "fuelScale": {type: "scale", x: 350 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleCoal", scale: GUI_BAR_STANDARD_SCALE},
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
        "progressScale": {type: "scale", x: 555, y: 245, direction: 0, value: 0, bitmap: "GuiProgressScale", scale: GUI_BAR_STANDARD_SCALE},
        "slotEnergy": {type: "slot", x: 820, y: 150},
        "slotFuel": {type: "slot", x: 380, y: 150},
        "slotInput": {type: "slot", x: 480, y: 220},
        "slotResult": {type: "slot", x: 720, y: 220},
    }
});




MachineRegistry.register(BlockID.MetallurgicInfuser, {
    defaultValues: {
        //FUELType 0-Null, 1-Coal, 2-Redstone, 3-Diamond, 4-Tin, 5-Obsidian
       
        fueltype: 0,
       
        energymax: 20000,
        energy_consumption: 30,
        work_time: 300,
        progress: 0,
        inSound: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiMetallurgicInfuser;
    },
    
    getTransportSlots: function(){
        return {input: ["slotInput"], output: ["slotResult"]};
    },
    
    setDefaultValues: function(){
        this.data.energymax = this.defaultValues.energymax;
        this.data.energy_consumption = this.defaultValues.energy_consumption;
        this.data.work_time = this.defaultValues.work_time;
    },
        
    
    tick: function(){
        this.data.fuelmax = 1000;
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy");              
        var fuelSlot = this.container.getSlot("slotFuel");
        var inSlot = this.container.getSlot("slotInput");
        var resultSlot = this.container.getSlot("slotResult");
        if (inSlot.id == 0)
        {
            this.data.progress = 0;
        }
        if (this.data.progress > 0)
        {
            if (this.data.inSound == 0){      
            this.data.inSound = 2;
        }
        }
    if (this.data.progress >= 1 && this.data.inSound == 2)
        {
           
            this.data.inSound = 0;
        }
        if (this.data.fueltype == 1) {
            if (inSlot.id == 265 && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.EnrichedIron;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
                
        }
            if (inSlot.id == ItemID.EnrichedIron && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.SteelDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        }
        if (this.data.fueltype == 2) {
            if (inSlot.id == ItemID.ingotosmium && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.BasicControlCircuit;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 265 && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.EnrichedAlloy;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        }
         if (this.data.fueltype == 3) {
             if (inSlot.id == ItemID.ObsidianDust && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.RefinedObsidianDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
         }
       
        if (fuelSlot.id == 263){
            if(this.data.fueltype == 0){
                 this.data.fueltype = 1;  
             } 
             if (this.data.fuel < this.data.fuelmax && this.data.fueltype == 1){
                fuelSlot.count--;
                this.container.validateSlot("slotFuel");                
                this.data.fuel += 10;                      
        }   
        }
		if (fuelSlot.id == ItemID.TinDust){
            if(this.data.fueltype == 0){
                 this.data.fueltype = 4;  
             } 
             if (this.data.fuel < this.data.fuelmax && this.data.fueltype == 4){
                fuelSlot.count--;
                this.container.validateSlot("slotFuel");                
                this.data.fuel += 10;                      
        }   
        }
		if (fuelSlot.id == ItemID.ObsidianDust){
            if(this.data.fueltype == 0){
                 this.data.fueltype = 5;  
             } 
             if (this.data.fuel < this.data.fuelmax && this.data.fueltype == 5){
                fuelSlot.count--;
                this.container.validateSlot("slotFuel");                
                this.data.fuel += 10;                      
        }   
        }
        if (fuelSlot.id == 331){
            if (this.data.fueltype == 0){
            this.data.fueltype = 2;
        }   
        if (this.data.fuel < this.data.fuelmax && this.data.fueltype == 2){
                fuelSlot.count--;
                this.container.validateSlot("slotFuel");                
                this.data.fuel += 10;                      
        }   
        }
        if (fuelSlot.id == ItemID.DiamondDust){
            if(this.data.fueltype == 0){
                this.data.fueltype = 3;  
             } 
            if (this.data.fuel < this.data.fuelmax && this.data.fueltype == 3){
                fuelSlot.count--;
                this.container.validateSlot("slotFuel");                
                this.data.fuel += 10;                      
        }   
        }
        if (this.data.fuel <= 0){
            this.data.fueltype = 0;
        }
            
        if (this.data.fueltype == 1){
            
           if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleCoal";
            }   
        
           
        }
        if (this.data.fueltype == 2){
            
            if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleRed";
            } 
            
        }
        if (this.data.fueltype == 3){
            
           if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleBlue";
            }   
        
           
        }
		if (this.data.fueltype == 4){
            
           if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleTin";
            }   
        
           
        }
		if (this.data.fueltype == 5){
            
           if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleObsidian";
            }   
        
           
        }
		 if (this.data.fueltype == 3) {
			 if (inSlot.id == ItemID.EnrichedAlloy && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.ReinforcedAlloy;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
		 }
          
        
		 }  
		 if (this.data.fueltype == 4) {
			 if (inSlot.id == ItemID.copperingot && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.BronzeIngot;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
		 }
          
        
		 } 
		 if (this.data.fueltype == 5) {
			 if (inSlot.id == ItemID.ReinforcedAlloy && this.data.fuel >= 10){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                    
                }
                if(this.data.progress >= 1){
                    this.data.fuel -= 10;
                    inSlot.count--;
                    resultSlot.id = ItemID.AtomicAlloy;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
		 }
          
        
		 } 
		 this.container.setScale("fuelScale", this.data.fuel / this.data.fuelmax);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("progressScale", this.data.progress);
		this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
    },
    
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc

});


//ДРОБИТЕЛЬ
IDRegistry.genBlockID("Macerator");
Block.createBlockWithRotation("Macerator", [
{name: "macerator", texture: [["SteelCasing", 0], ["CrusherTop", 0], ["CrusherBack", 0], ["CrusherFront", 0], ["CrusherLeft", 0], ["CrusherRight", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.Macerator);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.Macerator, count: 1, data: 0}, [
     "rbr",
     "lsl",
     "rbr"
     ], ['b', ItemID.BasicControlCircuit, 0, 'r', 331, 0, 's', BlockID.SteelCasing, 0, 'l', 325, 10]);});
     
    var guiMacerator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Macerator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 565, y: 190, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 500, y: 190, bitmap: "GuiArrowUP", scale: GUI_BAR_STANDARD_SCALE},
        
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
        "slotEnergy": {type: "slot", x: 480, y: 240},
        "slotInput": {type: "slot", x: 480, y: 120},
        "slotResult": {type: "slot", x: 680, y: 150, size: 100},
        "progressScale": {type: "scale", x: 568, y: 193, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE},
    }
});




MachineRegistry.register(BlockID.Macerator, {
    defaultValues: {        
        energymax: 160000,
        energy_consumption: 20,
        work_time: 250,
        progress: 0,
        inSound: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiMacerator;
    },
      
    getTransportSlots: function(){
        return {input: ["slotInput"], output: ["slotResult"]};
    },    
    
    tick: function(){
        this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2); 
        var energySlot = this.container.getSlot("slotEnergy");               
        var inSlot = this.container.getSlot("slotInput");
        var resultSlot = this.container.getSlot("slotResult");
        if (inSlot.id == 0)
        {
            this.data.progress = 0;
        }
        if (this.data.progress > 0)
        {
            if (this.data.inSound == 0){
            
            this.data.inSound = 2;
        }
        }
    if (this.data.progress >= 1 && this.data.inSound == 2)
        {
           
            this.data.inSound = 0;
        }
        if (inSlot.id == 35)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 287;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 98)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 98;
                    resultSlot.data = 2;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 13)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 12;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 318)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 289;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 4)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 13;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 24)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 12;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
         if (inSlot.id == 1)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 4;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        
        if (inSlot.id == ItemID.ingotosmium)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.OsmiumDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 6)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 266)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.GoldDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 295)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 260)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 360)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == ItemID.copperingot)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.CopperDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 361)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == ItemID.tiningot)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.TinDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 32)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
        if (inSlot.id == 391)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
        if (inSlot.id == 296)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
        if (inSlot.id == 392)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
        if (inSlot.id == 86)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 6;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }  
        if (inSlot.id == 297)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }  
        if (inSlot.id == 264)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.DiamondDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }    
        if (inSlot.id == 265)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.IronDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
        if (inSlot.id == 338)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
           if (inSlot.id == 367)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }    
            if (inSlot.id == 362)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.BioFuel;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }    
        if (inSlot.id == ItemID.SteelIngot)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.SteelDust;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }    
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("progressScale", this.data.progress);
    },
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc

});

//ПРОВОДА

 //Солнечный генератор
var time = 0;


Block.setPrototype("SolarGenerator",{
    type: Block.TYPE_BASE,

    getVariations: function(){
        return [
		    {name: "Solar Generator", texture: [["SPC", 0], ["SPT", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0]], inCreative: false},		
            {name: "sgbottom", texture: [["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0]]},
			{name: "sgstick", texture: [["SPS", 0], ["SPS", 0], ["SPS", 0], ["SPS", 0], ["SPS", 0]]}
			];
    }

});

Block.registerDropFunction("SolarGenerator", function(coords, blockID, blockData){
		return [[ItemID.item_sg, 1, 0]]
});

IDRegistry.genItemID("item_sg");
Item.createItem("item_sg", "Solar Generator", {name: "item_sg", meta: 0});

Item.registerUseFunction("item_sg", function(coords, item, block){
	var place = coords.relative;
	if(GenerationUtils.isTransparentBlock(World.getBlockID(place.x, place.y, place.z))){
		World.setBlock(place.x, place.y, place.z, BlockID.SolarGenerator);
		World.addTileEntity(place.x, place.y+1, place.z);
		Player.setCarriedItem(item.id, item.count - 1, item.data);
	}
});

Block.setBlockShape(BlockID.SolarGenerator, {x: 0, y: 0, z: 0}, {x: 0.8, y: 0.7, z: 0.8});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.item_sg, count: 1, data: 0}, [
     "ppp",
     "sis",
     "oto"
     ], ['p', ItemID.SolarPanel, 0, 's', ItemID.EnrichedAlloy, 0, 'i', 265, 0, 'o', ItemID.OsmiumDust, 0, 't', ItemID.EnergyTablet, -1]);});
     
    
	 
	  BlockRenderer.addRenderCallback(BlockID.SolarGenerator, function(api, coords) {
            api.renderBoxId(coords.x, coords.y, coords.z, 0.1, 0, 0.1, (0.1 + 0.8), (0 + 0.1), (0.8 + 0.1), BlockID.SolarGenerator, 1);
			
			api.renderBoxId(coords.x, coords.y, coords.z, 0.3, 0.1, 0.3, (0.3 + 0.4), (0.1 + 0.1), (0.3 + 0.4), BlockID.SolarGenerator, 1);
			api.renderBoxId(coords.x, coords.y, coords.z, 0.4, 0.2, 0.4, (0.4 + 0.2), (0.2 + 0.4), (0.4 + 0.2), BlockID.SolarGenerator, 2);
			api.renderBoxId(coords.x, coords.y, coords.z, 0.3, 0.3, 0.3, (0.3 + 0.4), (0.3 + 0.1), (0.3 + 0.4), BlockID.SolarGenerator, 1);
			api.renderBoxId(coords.x, coords.y, coords.z, 0.3, 0.5, 0.3, (0.3 + 0.4), (0.5 + 0.1), (0.3 + 0.4), BlockID.SolarGenerator, 1);
			api.renderBoxId(coords.x, coords.y, coords.z, 0.1, 0.6, 0.1, (0.1 + 0.8), (0.6 + 0.1), (0.1 + 0.8), BlockID.SolarGenerator, 1);
			api.renderBoxId(coords.x, coords.y, coords.z, 0, 0.7, 0, (0 + 1), (0.7 + 0.1), (0 + 1), BlockID.SolarGenerator, 0);    
			
        });

        BlockRenderer.enableCustomRender(BlockID.SolarGenerator);
    

var guiSolarGenerator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Solar Generator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 400, y: 225, bitmap: "dnslot", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 500, y: 180, bitmap: "TextPanel", scale: 4},  
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
        "slotEnergy": {type: "slot", x: 880, y: 220}, 
        "light":  {type: "image", x: 404 + GUI_BAR_STANDARD_SCALE, y: 227 + GUI_BAR_STANDARD_SCALE, bitmap: "isNight", scale: GUI_BAR_STANDARD_SCALE},     
        "textInfo1": {type: "text", x: 510, y: 190, width: 300, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
        "textInfo2": {type: "text", x: 600, y: 190, width: 300, height: 30, text: "kJ", font: {color: android.graphics.Color.GREEN}},
        "textInfo3": {type: "text", x: 510, y: 230, width: 300, height: 30, text: "Солнце:", font: {color: android.graphics.Color.GREEN}},
        "textInfo4": {type: "text", x: 510, y: 270, width: 300, height: 30, text: "Выход: 100J/t", font: {color: android.graphics.Color.GREEN}}
    }
});




MachineRegistry.register(BlockID.SolarGenerator, {
    defaultValues: {        
        energymax: 96000,
        isday: 0       
        
    },
    
   
    
    getGuiScreen: function(){
        return guiSolarGenerator;
    },
        
    isGenerator: function() {
        return true;
    },
    
    tick: function(){
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
        this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), this.data.energy, 200, 2);
        if(World.getLightLevel(this.x, this.y + 1, this.z) == 15){
            if(this.data.energy < this.data.energymax){
            this.data.energy += 100;
			time = 1;
        }
            this.data.isday = 1;
        }
        else
        {
			time = 0;
            this.data.isday = 0;
        }
      if (this.data.isday == 0)
        {
           if(content){ 
               content.elements["light"].bitmap = "isNight";
            }
        
           this.container.setText("textInfo3", "Солнце: false");
        }
       if (this.data.isday == 1)
       {
            if(content){ 
                content.elements["light"].bitmap = "isDay";
            }
       this.container.setText("textInfo3", "Солнце: true");
        }
       
      
      this.container.setText("textInfo1", this.data.energy / 1000);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        
    },
    energyTick: function(type, src){
        
        
        var output = Math.min(100, this.data.energy);
        this.data.energy += src.add(output) - output;
    }
	


});


//Осмиевый компрессор
 IDRegistry.genBlockID("OsmiumCompressor");
Block.createBlockWithRotation("OsmiumCompressor", [
{name: "Osmium Compressor", texture: [["OsmiumCompressorBottom", 0], ["OsmiumCompressorTop", 0], ["OsmiumCompressorBack", 0], ["OsmiumCompressorFront", 0], ["OsmiumCompressorLeft", 0], ["OsmiumCompressorRight", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.OsmiumCompressor);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.OsmiumCompressor, count: 1, data: 0}, [
     "sps",
     "vcv",
     "sps"
     ], ['v', 325, 0, 's', ItemID.EnrichedAlloy, 0, 'p', ItemID.AdvancedControlCircuit, 0, 'c', BlockID.SteelCasing, 0]);});

var guiOsmiumCompressor = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Osmium Compressor"}},
        inventory: {standart: true}, 
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 565, y: 220, bitmap: "FuelSlotMin", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 630, y: 230, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE},     
     ],
    
    elements: {
    "osmiumScale": {type: "scale", x: 565 + GUI_BAR_STANDARD_SCALE, y: 220 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "OsmiumScroll", scale: GUI_BAR_STANDARD_SCALE},
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"progressScale": {type: "scale", x:633, y: 233, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE},
         "slotEnergy": {type: "slot", x: 455, y: 215},
"slotFuel": {type: "slot", x: 550, y: 275},
"slotInput": {type: "slot", x: 550, y: 155},
"slotResult": {type: "slot", x: 750, y: 195, size: 100}
        
    }
});




MachineRegistry.register(BlockID.OsmiumCompressor, {
    defaultValues: {
        
        energymax: 40000,
        energy_consumption: 20,
        work_time: 250,
        progress: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiOsmiumCompressor;
    },
        
      getTransportSlots: function(){
        return {input: ["slotInput"], output: ["slotResult"]};
    },
    
    tick: function(){
		this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
        this.data.fuelmax = 200;
        var energySlot = this.container.getSlot("slotEnergy");
         var inSlot = this.container.getSlot("slotInput");
        var resultSlot = this.container.getSlot("slotResult");
       
        var fuelSlot = this.container.getSlot("slotFuel");
        if (inSlot.id == 0)
        {
            this.data.progress = 0;
        }
        if (fuelSlot.id == ItemID.ingotosmium && this.data.fuel < this.data.fuelmax)
        {
            fuelSlot.count--;
            this.data.fuel += 200; 
              this.container.validateAll();			
        }
        if (inSlot.id == ItemID.RefinedObsidianDust && this.data.fuel == 200)
        {
            
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){   
                    this.data.fuel -= 200;               
                    inSlot.count--;
                    resultSlot.id = ItemID.ObsidianIngot;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 348 && this.data.fuel == 200)
        {
            
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){   
                    this.data.fuel -= 200;               
                    inSlot.count--;
                    resultSlot.id = ItemID.GlowstoneIngot;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        this.container.setScale("progressScale", this.data.progress);
        this.container.setScale("osmiumScale", this.data.fuel / this.data.fuelmax);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        
    },
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc
    

});


//Камера обогащения
 IDRegistry.genBlockID("EnrichmentChambe");
Block.createBlock("EnrichmentChambe", [
{name: "Enrichment Chambe", texture: [["EnrichmentChamberBottom", 0], ["EnrichmentChamberTop", 0], ["EnrichmentChamberBack", 0], ["EnrichmentChamberFront", 0], ["EnrichmentChamberLeft", 0], ["EnrichmentChamberRight", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.EnrichmentChambe);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.EnrichmentChambe, count: 1, data: 0}, [
     "rpr",
     "ici",
     "rpr"
     ], ['r', 331, 0, 'i', 265, 0, 'p', ItemID.BasicControlCircuit, 0, 'c', BlockID.SteelCasing, 0]);});
     
    var guiEnrichmentChambe = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Enrichment Chambe"}},
        inventory: {standart: true}, 
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 630, y: 230, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE},
     {type: "bitmap", x: 538, y: 230, bitmap: "GuiArrowUP", scale: GUI_BAR_STANDARD_SCALE},    
     ],
    
    elements: {
    
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
        "progressScale": {type: "scale", x:633, y: 233, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE},
        "slotEnergy": {type: "slot", x: 520, y: 283},

           "slotInput": {type: "slot", x: 520, y: 165},
          "slotResult": {type: "slot", x: 750, y: 195, size: 100}
        
    }
});




MachineRegistry.register(BlockID.EnrichmentChambe, {
    defaultValues: {
       
        energymax: 40000,
        energy_consumption: 20,
        work_time: 250,
        progress: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiEnrichmentChambe;
    },
        
    getTransportSlots: function(){
        return {input: ["slotInput"], output: ["slotResult"]};
    },
    
    tick: function(){
        var energySlot = this.container.getSlot("slotEnergy");
        var inSlot = this.container.getSlot("slotInput");
        var resultSlot = this.container.getSlot("slotResult");
        this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
        if (inSlot.id == 0)
        {
            this.data.progress = 0;
        }
        
        this.container.setScale("progressScale", this.data.progress);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        if (inSlot.id == 49)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.ObsidianDust;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == ItemID.HDPEPellet && inSlot.count >= 3)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count -= 3;
                    resultSlot.id = ItemID.HDPESheet;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
        if (inSlot.id == 82)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 337;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
        if (inSlot.id == 12)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 13;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }  
           if (inSlot.id == 98)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 98;
                    resultSlot.data = 3;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
           if (inSlot.id == 48)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 4;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }  
          if (inSlot.id == 13)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 4;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
          if (inSlot.id == BlockID.TinOre)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.TinDust;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }   
          if (inSlot.id == BlockID.OsmiumOre)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.OsmiumDust;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
          if (inSlot.id == BlockID.CopperOre)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.CopperDust;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
           if (inSlot.id == 15)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.IronDust;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        } 
            if (inSlot.id == ItemID.DiamondDust)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 264;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 14)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = ItemID.GoldDust;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 289)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 318;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 21)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 351;
                    resultSlot.data = 4;
                    resultSlot.count += 12;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 153)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 406;
                    resultSlot.data = 0;
                    resultSlot.count += 6;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 56)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 264;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 16)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 263;
                    resultSlot.data = 0;
                    resultSlot.count += 2;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 73)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 331;
                    resultSlot.data = 0;
                    resultSlot.count += 12;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 1)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 98;
                    resultSlot.data = 2;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
            if (inSlot.id == 89)
        {
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    
                }
                if(this.data.progress >= 1){                  
                    inSlot.count--;
                    resultSlot.id = 348;
                    resultSlot.data = 0;
                    resultSlot.count += 4;
                    this.container.validateAll();
                    this.data.progress = 0;
                    
                }
        }
    },
        
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc
    

});


IDRegistry.genBlockID("RefinedObsidian");
Block.createBlock("RefinedObsidian", [
    {name: "Refined Obsidian", texture: [["RefinedObsidian", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.RefinedObsidian, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', ItemID.OsdidianIngot, 0]);});
     
 IDRegistry.genBlockID("CoalBlock");
Block.createBlock("CoalBlock", [
    {name: "Coal Block", texture: [["CoalBlock", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.CoalBlock, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', 263, 1]);});
     
IDRegistry.genBlockID("SteelBlock");
Block.createBlock("SteelBlock", [
    {name: "Steel Block", texture: [["SteelBlock", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.SteelBlock, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', ItemID.SteelIngot, 0]);});
var BLOCK_TYPE_LIGHT = Block.createSpecialType({ 

    lightlevel: 15,

     lightopacity: 0

});    
     IDRegistry.genBlockID("RefinedGlowstone");
Block.createBlock("RefinedGlowstone", [
    {name: "Refined Glowstone", texture: [["RefinedGlowstone", 0]], inCreative: true,}],
BLOCK_TYPE_LIGHT);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.RefinedGlowstone, count: 1, data: 0}, [

     "sss",

     "sss",

     "sss"

     ], ['s', ItemID.GlowstoneIngot, 0]);});
     
     
     
     
     
     
     
     IDRegistry.genBlockID("PlasticBlack");
Block.createBlock("PlasticBlack", [
    {name: "Чёрный пластиковый блок", texture: [["overlay_black", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticBlack, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 0]);});
     
     IDRegistry.genBlockID("PlasticGreen");
Block.createBlock("PlasticGreen", [
    {name: "Зелёный пластиковый блок", texture: [["overlay_darkGreen", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticGreen, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 2]);});
     
     IDRegistry.genBlockID("PlasticBrown");
Block.createBlock("PlasticBrown", [
    {name: "Коричневый пластиковый блок", texture: [["overlay_brown", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticBrown, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 3]);});
     
      IDRegistry.genBlockID("PlasticBlue");
Block.createBlock("PlasticBlue", [
    {name: "Синий пластиковый блок", texture: [["overlay_darkBlue", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticBlue, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 4]);});
     
      IDRegistry.genBlockID("PlasticPurple");
Block.createBlock("PlasticPurple", [
    {name: "Фиолетовый пластиковый блок", texture: [["overlay_purple", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticPurple, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 5]);});
     
       IDRegistry.genBlockID("PlasticDarkG");
Block.createBlock("PlasticDarkG", [
    {name: "Тёмно-голубой пластиковый блок", texture: [["overlay_darkAqua", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticPurple, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 6]);});
     
      IDRegistry.genBlockID("PlasticLGray");
Block.createBlock("PlasticLGray", [
    {name: "Светло-серый пластиковый блок", texture: [["overlay_grey", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticLGray, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 7]);});
     
      IDRegistry.genBlockID("PlasticGray");
Block.createBlock("PlasticGray", [
    {name: "Серый пластиковый блок", texture: [["overlay_darkGrey", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticGray, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 8]);});
     
     IDRegistry.genBlockID("PlasticPink");
Block.createBlock("PlasticPink", [
    {name: "Розовый пластиковый блок", texture: [["overlay_pink", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticPink, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 9]);});
     
      IDRegistry.genBlockID("PlasticLGreen");
Block.createBlock("PlasticLGreen", [
    {name: "Светло-зелёный пластиковый блок", texture: [["overlay_brightGreen", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticLGreen, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 10]);});
     
      IDRegistry.genBlockID("PlasticYellow");
Block.createBlock("PlasticYellow", [
    {name: "Жёлтый пластиковый блок", texture: [["overlay_yellow", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticYellow, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 11]);});
     
     IDRegistry.genBlockID("PlasticLAure");
Block.createBlock("PlasticLAure", [
    {name: "Светло-голубой пластиковый блок", texture: [["overlay_aqua", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticLAure, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 12]);});
     
     IDRegistry.genBlockID("PlasticPurpure");
Block.createBlock("PlasticPurpure", [
    {name: "Пурпурный пластиковый блок", texture: [["overlay_indigo", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticPurpure, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 13]);});
     
      IDRegistry.genBlockID("PlasticOrange");
Block.createBlock("PlasticOrange", [
    {name: "Оранжевый пластиковый блок", texture: [["overlay_orange", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticOrange, count: 1, data: 0}, [

     "sss",

     "sts",

     "sss"

     ], ['s', ItemID.HDPESheet, 0, 't', 351, 14]);});
     
     IDRegistry.genBlockID("PlasticWhite");
Block.createBlock("PlasticWhite", [
    {name: "Белый пластиковый блок", texture: [["overlay_white", 0]], inCreative: true}
]);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PlasticWhite, count: 1, data: 0}, [

     "sss",

     "s s",

     "sss"

     ], ['s', ItemID.HDPESheet, 0]);});
     
     
     
     
     
     
     
     
 
     //Электрическай плавильня
 IDRegistry.genBlockID("EnergizedSmelter");
Block.createBlockWithRotation("EnergizedSmelter", [
{name: "Energized Smelter", texture: [["EnergizedSmelterBottom", 0], ["EnergizedSmelterTop", 0], ["EnergizedSmelterBack", 0], ["EnergizedSmelterFront", 0], ["EnergizedSmelterLeft", 0], ["EnergizedSmelterRight", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.EnergizedSmelter);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.EnergizedSmelter, count: 1, data: 0}, [
     "rbr",
     "vcv",
     "rbr"
     ], ['v', 20, 0, 'r', 331, 0, 'b', ItemID.BasicControlCircuit, 0, 'c', BlockID.SteelCasing, 0]);});

var guiEnergizedSmelter = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Energized Smelter"}},
        inventory: {standart: true}, 
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
     {type: "bitmap", x: 538, y: 230, bitmap: "GuiArrowUP", scale: GUI_BAR_STANDARD_SCALE},    
    {type: "bitmap", x: 630, y: 230, bitmap: "GuiProgressC", scale: GUI_BAR_STANDARD_SCALE},     
     ],
    
    elements: {
    
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"progressScale": {type: "scale", x:633, y: 233, direction: 0, value: 0, bitmap: "GuiProgressCScale", scale: GUI_BAR_STANDARD_SCALE},
"slotEnergy": {type: "slot", x: 525, y: 275},

"slotInput": {type: "slot", x: 525, y: 155},
"slotResult": {type: "slot", x: 750, y: 195, size: 100}
        
    }
});




MachineRegistry.register(BlockID.EnergizedSmelter, {
    defaultValues: {       
        energymax: 40000,
        energy_consumption: 20,
        work_time: 250,
        progress: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiEnergizedSmelter;
    },
        
     getTransportSlots: function(){
        return {input: ["slotInput"], output: ["slotResult"]};
    },
    
    tick: function(){
        var energySlot = this.container.getSlot("slotEnergy");
         var inSlot = this.container.getSlot("slotInput");
		 this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
        if (inSlot.id == 0)
        {
            this.data.progress = 0;
        }
        var result = Recipes.getFurnaceRecipeResult(inSlot.id, "iron");
        if(result){
            var resultSlot = this.container.getSlot("slotResult");
            if(resultSlot.id == result.id && resultSlot.data == result.data && resultSlot.count < 64 || resultSlot.id == 0){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                }
                if(this.data.progress >= 1){
                    inSlot.count--;
                    resultSlot.id = result.id;
                    resultSlot.data = result.data;
                    resultSlot.count++;
                    this.container.validateAll();
                    this.data.progress = 0;
                }
            }
        }
        else {
            this.data.progress = 0;
        }
       
        
        this.container.setScale("progressScale", this.data.progress);
      
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        
    },
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc
    

});



 IDRegistry.genBlockID("BioGenerator");
Block.createBlock("BioGenerator", [
{name: "Bio Generator", texture: [["BGD", 0], ["BGT", 0], ["BGB", 0], ["BGF", 0], ["BGR", 0], ["BGR", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.BioGenerator);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.BioGenerator, count: 1, data: 0}, [
     "rsr",
     "bcb",
     "isi"
     ], ['r', 331, 0, 's', ItemID.EnrichedAlloy, 0, 'i', 265, 0, 'b', ItemID.BioFuel, 0, 'c', ItemID.BasicControlCircuit, 0]);});




     var guiBioGenerator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Bio Generator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 350, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 500, y: 180, bitmap: "TextPanel", scale: 4},  
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"fuelScale": {type: "scale", x: 350 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"slotEnergy": {type: "slot", x: 880, y: 190}, 
"slotFuel": {type: "slot", x: 400, y: 190},      
"textInfo1": {type: "text", x: 510, y: 190, width: 200, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
"textInfo2": {type: "text", x: 610, y: 190, width: 200, height: 30, text: "kJ", font: {color: android.graphics.Color.GREEN}},
"textInfo3": {type: "text", x: 510, y: 230, width: 200, height: 30, text: "Биотопливо:", font: {color: android.graphics.Color.GREEN}},
"textInfo5": {type: "text", x: 680, y: 230, width: 200, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
"textInfo4": {type: "text", x: 510, y: 270, width: 200, height: 30, text: "Выход: 700J/t", font: {color: android.graphics.Color.GREEN}}
    }
});




MachineRegistry.register(BlockID.BioGenerator, {
    defaultValues: {       
        energymax: 160000,
        biofuel: 0,
        biofuelmax: 24000      
        
    },
    
   
    
    getGuiScreen: function(){
        return guiBioGenerator;
    },
        
    isGenerator: function() {
        return true;
    },
    
    getTransportSlots: function(){
        return {input: ["slotFuel"]};
    },
    
    tick: function(){
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
        var fuelSlot = this.container.getSlot("slotFuel"); 
        this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), this.data.energy, 200, 2); 
        if (fuelSlot.id == ItemID.BioFuel && this.data.biofuel < this.data.biofuelmax)
        {
            this.data.biofuel += 200;
            fuelSlot.count--;
            this.container.validateAll();
        }
        if (this.data.biofuel > 0 && this.data.energy < this.data.energymax)
        {
            this.data.energy += 350;
            this.data.biofuel--;
        }
      
       
       
      
      this.container.setText("textInfo1", this.data.energy / 1000);
      this.container.setText("textInfo5", this.data.biofuel);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("fuelScale", this.data.biofuel / this.data.biofuelmax);
        
    },
    energyTick: function(type, src){
        
        var output = Math.min(350, this.data.energy);
        this.data.energy += src.add(output) - output;
    }

});

     //Базовая плавильная фабрика
 IDRegistry.genBlockID("BasicSmeltingFactory");
Block.createBlockWithRotation("BasicSmeltingFactory", [
{name: "BasicSmelting Factory", texture: [["EnergizedSmelterBottom", 0], ["BasicSmeltingFactoryTop", 0], ["BasicSmeltingFactoryBack", 0], ["BasicSmeltingFactoryFront", 0], ["BasicSmeltingFactoryLeft", 0], ["BasicSmeltingFactoryRight", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.EnergizedSmelter);
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.BasicSmeltingFactory, count: 1, data: 0}, [
     "rbr",
     "ici",
     "rbr"
     ], ['i', 265, 0, 'r', 331, 0, 'b', ItemID.BasicControlCircuit, 0, 'c', BlockID.EnergizedSmelter, 0]);});

var guiBasicSmeltingFactory = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Basic Smelting Factory"}},
        inventory: {standart: true}, 
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 499, y: 200, bitmap: "ScaleBGDown", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 599, y: 200, bitmap: "ScaleBGDown", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 679, y: 200, bitmap: "ScaleBGDown", scale: GUI_BAR_STANDARD_SCALE},
        
     ],
    
    elements: {
    
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"progressScale1": {type: "scale", x:499, y: 200, direction: 3, value: 0, bitmap: "ScaleDown", scale: GUI_BAR_STANDARD_SCALE},
"progressScale2": {type: "scale", x:599, y: 200, direction: 3, value: 0, bitmap: "ScaleDown", scale: GUI_BAR_STANDARD_SCALE},
"progressScale3": {type: "scale", x:679, y: 200, direction: 3, value: 0, bitmap: "ScaleDown", scale: GUI_BAR_STANDARD_SCALE},
"slotEnergy": {type: "slot", x: 385, y: 130},
"slotInput1": {type: "slot", x: 485, y: 130},
"slotInput2": {type: "slot", x: 585, y: 130},
"slotInput3": {type: "slot", x: 665, y: 130},
"slotResult1": {type: "slot", x: 485, y: 300},
"slotResult2": {type: "slot", x: 585, y: 300},
"slotResult3": {type: "slot", x: 665, y: 300}
       
    }
});




MachineRegistry.register(BlockID.BasicSmeltingFactory, {
    defaultValues: {       
        energymax: 60000,
        energy_consumption: 30,
        work_time: 250,
        progress1: 0,
        progress2: 0,
        progress3: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiBasicSmeltingFactory;
    },
        
     getTransportSlots: function(){
         return {input: ["slotInput1", "slotInput2", "slotInput3" ], output: ["slotResult1", "slotResult2", "slotResult3"]};
    },
    
    tick: function(){
        var energySlot = this.container.getSlot("slotEnergy");
        var inSlot1 = this.container.getSlot("slotInput1");
        var inSlot2 = this.container.getSlot("slotInput2");
        var inSlot3 = this.container.getSlot("slotInput3");
        
        var result1 = Recipes.getFurnaceRecipeResult(inSlot1.id, "iron");
        var result2 = Recipes.getFurnaceRecipeResult(inSlot2.id, "iron");
        var result3 = Recipes.getFurnaceRecipeResult(inSlot3.id, "iron");
        if (inSlot1.id == 0)
        {
            this.data.progress1 = 0;
        }
        if (inSlot2.id == 0)
        {
            this.data.progress2 = 0;
        }
        if (inSlot3.id == 0)
        {
            this.data.progress3 = 0;
        }
        if(result1){
            var resultSlot1 = this.container.getSlot("slotResult1");
            if(resultSlot1.id == result1.id && resultSlot1.data == result1.data && resultSlot1.count < 64 || resultSlot1.id == 0){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress1 += 1/this.data.work_time;
                }
                if(this.data.progress1 >= 1){
                    inSlot1.count--;
                    resultSlot1.id = result1.id;
                    resultSlot1.data = result1.data;
                    resultSlot1.count++;
                    this.container.validateAll();
                    this.data.progress1 = 0;
                }
            }
        }
        else {
            this.data.progress1 = 0;
        }
        if(result2){
            var resultSlot2 = this.container.getSlot("slotResult2");
            if(resultSlot2.id == result2.id && resultSlot2.data == result2.data && resultSlot2.count < 64 || resultSlot2.id == 0){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress2 += 1/this.data.work_time;
                }
                if(this.data.progress2 >= 1){
                    inSlot2.count--;
                    resultSlot2.id = result2.id;
                    resultSlot2.data = result2.data;
                    resultSlot2.count++;
                    this.container.validateAll();
                    this.data.progress2 = 0;
                }
            }
        }
        else {
            this.data.progress2 = 0;
        }
        if(result3){
            var resultSlot3 = this.container.getSlot("slotResult3");
            if(resultSlot3.id == result3.id && resultSlot3.data == result3.data && resultSlot3.count < 64 || resultSlot3.id == 0){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress3 += 1/this.data.work_time;
                }
                if(this.data.progress3 >= 1){
                    inSlot3.count--;
                    resultSlot3.id = result3.id;
                    resultSlot3.data = result3.data;
                    resultSlot3.count++;
                    this.container.validateAll();
                    this.data.progress3 = 0;
                }
            }
        }
        else {
            this.data.progress3 = 0;
        }
        this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
        
        this.container.setScale("progressScale1", this.data.progress1);
        this.container.setScale("progressScale2", this.data.progress2);
        this.container.setScale("progressScale3", this.data.progress3);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        
    },
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc
    

});
  



//ЖИДКОСТИ
IDRegistry.genItemID("HydB");
Item.createItem("HydB", "Ведро с водородом", {name: "325_Hyd", meta: 0}, {stack: 1}); 
LiquidRegistry.registerLiquid("Hyd", "Водород", [["LiquidHydrogen", 0]]); 
LiquidRegistry.registerItem("Hyd", {id: 325, data: 0}, {id: ItemID.HydB, data: 0});

IDRegistry.genItemID("OxyB");
Item.createItem("OxyB", "Ведро с кислородом", {name: "325_Oxy", meta: 0}, {stack: 1}); 
LiquidRegistry.registerLiquid("Oxy", "Кислород", [["LiquidOxygen", 0]]); 
LiquidRegistry.registerItem("Oxy", {id: 325, data: 0}, {id: ItemID.OxyB, data: 0});

IDRegistry.genItemID("EleB");
Item.createItem("EleB", "Ведро с этиленом", {name: "325_Ele", meta: 0}, {stack: 1}); 
LiquidRegistry.registerLiquid("Ele", "Этилен", [["Ethene", 0]]); 
LiquidRegistry.registerItem("Ele", {id: 325, data: 0}, {id: ItemID.EleB, data: 0});

IDRegistry.genItemID("GEleB");
Item.createItem("GEleB", "Ведро с жидким этиленом", {name: "325_Ele", meta: 0}, {stack: 1}); 
LiquidRegistry.registerLiquid("GEle", "Жидкий этилен", [["Ethene", 0]]); 
LiquidRegistry.registerItem("GEle", {id: 325, data: 0}, {id: ItemID.GEleB, data: 0});



 //Электролитический сепаратор
     IDRegistry.genBlockID("ElectrolyticSeparator");
Block.createBlock("ElectrolyticSeparator", [
{name: "Электролитический сепаратор", texture: [["ESD", 0], ["EST", 0], ["ESB", 0], ["ESF", 0], ["ESR", 0], ["ESL", 0]], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.ElectrolyticSeparator);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.ElectrolyticSeparator, count: 1, data: 0}, [
     "iri",
     "scs",
     "iri"
     ], ['c', ItemID.ElectrolyticCore, 0, 's', ItemID.EnrichedAlloy, 0, 'i', 265, 0, 'r', 331, 0]);});
    
    
    
    var guiElectrolyticSeparator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Electrolytic Separator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 330, y: 150, bitmap: "MediumFuelBG", scale: GUI_BAR_STANDARD_SCALE},
     {type: "bitmap", x: 550, y: 180, bitmap: "SmallFuelBG", scale: GUI_BAR_STANDARD_SCALE},
      {type: "bitmap", x: 710, y: 180, bitmap: "SmallFuelBG", scale: GUI_BAR_STANDARD_SCALE},
      {type: "bitmap", x: 640, y: 210, bitmap: "GuiProgressD", scale: GUI_BAR_STANDARD_SCALE},
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"fuelScale": {type: "scale", x: 330 + GUI_BAR_STANDARD_SCALE, y: 151 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "_liquid_water_texture", overlay: "OverMediumFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"fuelScale1": {type: "scale", x: 550 + GUI_BAR_STANDARD_SCALE, y: 180 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleHydrogen", overlay: "OverSmallFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"fuelScale2": {type: "scale", x: 710 + GUI_BAR_STANDARD_SCALE, y: 180 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleOxygen", overlay: "OverSmallFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"slotEnergy": {type: "slot", x: 880, y: 200},
"slotFuel": {type: "slot", x: 400, y: 200}, 
"slotResult1": {type: "slot", x: 550, y: 290},
"slotResult2": {type: "slot", x: 710, y: 290}, 
"progressScale": {type: "scale", x:640, y: 210, direction: 3, value: 0, bitmap: "GuiProgressDS", scale: GUI_BAR_STANDARD_SCALE},

    }
});



MachineRegistry.register(BlockID.ElectrolyticSeparator, {
    defaultValues: { 
        // 1- HYD, OXY
        // 1- Water
        f1: 0,
        f2: 0,
        energymax: 160000,      
        fuelmodeR: 0,
        fuelmode: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiElectrolyticSeparator;
    },
    
        
    
    getTransportSlots: function(){
        return {input: ["slotFuel"]};
    },
    
    tick: function(type, src){
        
        this.data.fuelmax = 24000;  
        
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
        var fuelSlot = this.container.getSlot("slotFuel"); 
        var resultSlot1 = this.container.getSlot("slotResult1"); 
        var resultSlot2 = this.container.getSlot("slotResult2"); 
        this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);   
                                      
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("fuelScale", this.data.fuel / this.data.fuelmax);
         this.container.setScale("fuelScale1", this.data.f1 / 2400);
          this.container.setScale("fuelScale2", this.data.f2 / 2400);
          if (resultSlot1.id == 325 && this.data.f1 >= 1000)
          {
              resultSlot1.id = ItemID.HydB;
              this.data.f1 -= 1000;
              this.container.validateAll();
          }
          if (resultSlot2.id == 325 && this.data.f2 >= 1000)
          {
              resultSlot2.id = ItemID.OxyB;
              this.data.f2 -= 1000;
              this.container.validateAll();
          }
          if (fuelSlot.id == 325 && fuelSlot.data == 8) 
        {
            this.data.fuelmode = 1;
            if (this.data.fuelmode == 0 || this.data.fuelmode == 1){
            
            if (this.data.fuelmode == 1){
            fuelSlot.id = 325;
            fuelSlot.data = 0;
            this.data.fuel += 1000;
            this.container.validateAll();
        }
        }
        }
        if (this.data.fuel > 4 && this.data.energy >= 1000 && this.data.fuelmode == 1 && this.data.f1 < 2400 && this.data.f2 < 2400)
        {
            this.data.fuelmodeR = 1;
            this.data.f1 += 2;
            this.data.f2 += 1;
            this.data.energy -= 1000;
            this.data.fuel -= 4;
            if(content){ 
               content.elements["fuelScale1"].bitmap = "ScaleHydrogen";
               content.elements["fuelScale2"].bitmap = "ScaleOxygen";
            }
        }
        if (this.data.fuel <= 0)
        {
            this.data.fuelmode = 0;
        }
        if (this.data.f1 == 0 && this.data.f2 == 0)
        {
            this.data.fuelmodeR = 0;
        }
        
    },
    energyTick: MachineRegistry.basicEnergyReceiveFunc,
    
 
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
}); 
//Базовый газовый балон
IDRegistry.genBlockID("BasicGazTank");
Block.createBlock("BasicGazTank", [
 {name: "(Базовый) Газовый балон", texture: [["TankD", 0], ["TankTB", 0], ["TankC", 0], ["TankF", 0], ["TankC", 0], ["TankC", 0]], inCreative: true}]);
Block.setBlockShape(BlockID.BasicGazTank, {x: 0.2, y: 0, z: 0.2}, {x: 0.8, y: 1, z: 0.8});




Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.BasicGazTank, count: 1, data: 0}, [
     "ror",
     "o o",
     "ror"
     ], ['r', 331, 0, 'o', ItemID.ingotosmium, 0]);});
//КРПД
IDRegistry.genBlockID("PressurizedReactionChamber");
Block.createBlock("PressurizedReactionChamber", [
{name: "КРПД", texture: [["PRCD", 0], ["PRCT", 0], ["PRCB", 0], ["PRCF", 0], ["PRCL", 0], ["PRCR", 0]], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.PressurizedReactionChamber);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.PressurizedReactionChamber, count: 1, data: 0}, [
     " s ",
     "bcb",
     "gdg"
     ], ['c', BlockID.EnrichmentChambe, 0, 's', ItemID.EnrichedAlloy, 0, 'b', ItemID.BasicControlCircuit , 0, 'g', BlockID.BasicGazTank, 0, 'd', BlockID.DynamicTank, 0]);});
     
     
     var guiPressurizedReactionChamber = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Pressurized Reaction Chamber"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 330, y: 150, bitmap: "MediumFuelBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 400, y: 150, bitmap: "MediumFuelBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 880, y: 230, bitmap: "SmallFuelBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 570, y: 215, bitmap: "GuiProgressM", scale: GUI_BAR_STANDARD_SCALE},
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
"fuelScale": {type: "scale", x: 330 + GUI_BAR_STANDARD_SCALE, y: 151 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "_liquid_water_texture", overlay: "OverMediumFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"fuelScale1": {type: "scale", x: 400 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleHydrogenBig", overlay: "OverMediumFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"fuelScale2": {type: "scale", x: 880 + GUI_BAR_STANDARD_SCALE, y: 230 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleEthene", overlay: "OverSmallFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"slotEnergy": {type: "slot", x: 880, y: 150},
"slotInput": {type: "slot", x: 480, y: 200}, 
"slotResult": {type: "slot", x: 700, y: 200},

"progressScale": {type: "scale", x:570, y: 215, direction: 0, value: 0, bitmap: "GuiProgressMS", scale: GUI_BAR_STANDARD_SCALE},

    }
});



MachineRegistry.register(BlockID.PressurizedReactionChamber, {
    defaultValues: { 
        f1: 0,
        f2: 0,
        energymax: 2000,      
        fuelmodeR: 0,
        fuelmode: 0,
         energy_consumption: 20,
        work_time: 250,
        progress: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiPressurizedReactionChamber;
    },
    
        
    
    getTransportSlots: function(){
        return {input: ["slotInput"]};
    },
    
    tick: function(type, src){
        
        this.data.fuelmax = 24000;  
        
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
       
        var inSlot = this.container.getSlot("slotInput"); 
        var resultSlot = this.container.getSlot("slotResult"); 
       this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
        if (inSlot.id == 0)
        {
            this.data.progress = 0;
        }                              
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("fuelScale", this.data.fuel / this.data.fuelmax);
        this.container.setScale("fuelScale1", this.data.f1 / 24000);
         this.container.setScale("fuelScale2", this.data.f2 / 2400);
         this.container.setScale("progressScale", this.data.progress);
         if (this.data.fuel > 0 && this.data.f1 > 0 && this.data.fuelmode == 1)
          {
              this.data.fuelmodeR = 1;
              if(inSlot.id == ItemID.BioFuel && inSlot.count >= 2){
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    this.data.fuel -= 2;
                    this.data.f1 -= 2;
                    this.data.f2 += 1;
                }
                if(this.data.progress >= 1){
                    
                    inSlot.count -= 2;
                    resultSlot.id = ItemID.Substrate;
                    resultSlot.data = 0;
                    resultSlot.count++;
                    this.container.validateAll();
                    this.data.progress = 0;
                }  
          }
        }
        if (this.data.fuel > 0 && this.data.f1 > 0 && this.data.fuelmode == 2)
        {
            this.data.fuelmodeR = 2;
            if(inSlot.id == ItemID.Substrate){
            if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    this.data.fuel -= 2;
                    this.data.f1 -= 2;
                    this.data.f2 += 1;
                }
                if(this.data.progress >= 1){
                    
                    inSlot.count--;
                    resultSlot.id = ItemID.HDPEPellet;
                    resultSlot.data = 0;
                    resultSlot.count++;
                    this.container.validateAll();
                    this.data.progress = 0;
                }  
          }
        }
        if (this.data.fuel <= 0 && this.data.f1 <= 0 && this.data.f2 <= 0)
        {
            this.data.fuelmode = 0;
            this.data.fuelmodeR = 0;
        }
        if (this.data.fuelmode == 1)
    {
        if (this.data.fuelmodeR == 1) {
         if(content){ 
               content.elements["fuelScale"].bitmap = "_liquid_water_texture";
               content.elements["fuelScale1"].bitmap = "ScaleHydrogenBig";
               content.elements["fuelScale2"].bitmap = "ScaleEthene";
            }
       }
    }
   if (this.data.fuelmode == 2)
    {
        if (this.data.fuelmodeR == 2) {
         if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleEtheneBig";
               content.elements["fuelScale1"].bitmap = "BigScaleOxygen";
               content.elements["fuelScale2"].bitmap = "ScaleOxygen";
            }
       }
    }
    },
    energyTick: MachineRegistry.basicEnergyReceiveFunc,
    
    click: function(id, count, data, coords){
        var content = this.container.getGuiContent();
        if (id == 325 && data == 8 && this.data.fuel < this.data.fuelmax)
        {
            if (this.data.fuelmode == 0)
            {
            this.data.fuelmode = 1;
            }
            if(this.data.fuelmode == 1)
            {
            this.data.fuel += 1000;
            Player.setCarriedItem(325, 1, 0);
            }
        }
        if (id == ItemID.HydB && data == 0 && this.data.f1 < 24000)
        {
            if (this.data.fuelmode == 0)
            {
            this.data.fuelmode = 1;
            }
            if(this.data.fuelmode == 1)
            {
            this.data.f1 += 1000;
            Player.setCarriedItem(325, 1, 0);
            }
        }
        if (id == 325 && this.data.f2 >= 1000)
        {
            if (this.data.fuelmodeR == 1)
            {
            this.data.f2 -= 1000;
            Player.setCarriedItem(ItemID.EleB, 1, 0);
            }
        }
    
        if (id == 325 && this.data.f2 >= 1000)
        {
            if (this.data.fuelmodeR == 2)
            {
            this.data.f2 -= 1000;
            Player.setCarriedItem(ItemID.OxyB, 1, 0);
            }
        }
    
        if (id == ItemID.GEleB && this.data.fuel < this.data.fuelmax)
        {
            if (this.data.fuelmode == 0)
            {
                this.data.fuelmode = 2;
            }
            if(this.data.fuelmode == 2)
            {
                this.data.fuel += 1000;
                Player.setCarriedItem(325, 1, 0);
            }
        }
        if (id == ItemID.OxyB && this.data.fuel < this.data.fuelmax)
        {
            if (this.data.fuelmode == 0)
            {
                this.data.fuelmode = 2;
            }
            if(this.data.fuelmode == 2)
            {
                this.data.f1 += 1000;
                Player.setCarriedItem(325, 1, 0);
            }
        }
    

      },
 
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
}); 

//Базовый жидкостный бак
IDRegistry.genBlockID("FuelTank");
Block.createBlock("FuelTank", [
{name: "(Базовый) Жидкостный бак", texture: [["FTT", 0], ["FTT", 0], ["FTFB", 0], ["FTFB", 0], ["FTFB", 0], ["FTFB", 0]], inCreative: true}
]);
Block.setBlockShape(BlockID.FuelTank, {x: 0.2, y: 0, z: 0.2}, {x: 0.8, y: 1, z: 0.8});


Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.FuelTank, count: 1, data: 0}, [
     "iri",
     "r r",
     "iri"
     ], ['r', 265, 0, 'i', 331, 0]);});
	

	 var guiBasicFuelTank = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Basic Fuel Tank"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 530, y: 150, bitmap: "BigFuelBG", scale: GUI_BAR_STANDARD_SCALE}
    ],
    
    elements: {
      "fuelScale": {type: "scale", x: 530 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "BigWaterScale", overlay: "OverBGFuel", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE}, scale: GUI_BAR_STANDARD_SCALE},       
      "slotOut": {type: "slot", x: 780, y: 200},
      "slotIn": {type: "slot", x: 441, y: 200}
    }
});
MachineRegistry.register(BlockID.FuelTank, {
    defaultValues: { 
	//1-Water
        fuelmode: 0,
		fuelmax: 0
		
    },
    
   init: function(){
		this.liquidStorage.setLimit("water", 8);
	},
    
    getGuiScreen: function(){
        return guiBasicFuelTank;
    },
    
        
    
    getTransportSlots: function(){
        return {input: ["slotIn"], output: ["slotOut"]};
    },
    
    tick: function(type, src){
      


        this.data.fuelmax = 24000;  
        
        var content = this.container.getGuiContent();
        
       
        var inSlot = this.container.getSlot("slotIn"); 
        var resultSlot = this.container.getSlot("slotOut"); 
        if (inSlot.id == 325 && inSlot.data == 8 && this.data.fuel < this.data.fuelmax)
		{
			if(this.data.fuelmode == 0 || this.data.fuelmode == 1)
			{
			this.data.fuelmode = 1;
			this.data.fuel += 1000;			
			inSlot.id = 325;
			inSlot.data = 0;		
			 this.container.validateAll();
			
			}
		}
         if (this.data.fuelmode == 1)
		 {
			  if(content){ 
               content.elements["fuelScale"].bitmap = "BigWaterScale";
            }
			
		 }
      
                                      
        
        this.container.setScale("fuelScale", this.data.fuel / this.data.fuelmax);         
    },
    energyTick: function(type, src){    
if (this.data.fuelmode == 1){
        var output = Math.min(200, this.data.fuel);
        this.data.fuel += src.add(output) - output;
}
    }	
}); 	 
	 
//Роторный сгуститель
IDRegistry.genBlockID("RotaryCondensentrator");
Block.createBlock("RotaryCondensentrator", [
{name: "Роторный сгуститель", texture: [["RCD", 0], ["RCT", 0], ["RCF", 0], ["RCF", 0], ["RCR", 0], ["RCR", 0]], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.RotaryCondensentrator);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.RotaryCondensentrator, count: 1, data: 0}, [
     "gbg",
     "zet",
     "gbg"
     ], ['e', ItemID.EnergyTablet, -1, 't', BlockID.FuelTank, 0, 'b', ItemID.BasicControlCircuit , 0, 'g', 20, 0, 'z', BlockID.BasicGazTank, 0]);});
     
var guiRotaryCondensentrator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Rotary Condensentrator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 800, y: 430, bitmap: "EnergyHBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 430, y: 150, bitmap: "MediumFuelBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 800, y: 150, bitmap: "MediumFuelBG", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 580, y: 225, bitmap: "GuiProgress", scale: GUI_BAR_STANDARD_SCALE},
    ],
    
    elements: {
    "energyScale": {type: "scale", x: 800 + GUI_BAR_STANDARD_SCALE, y: 430 + GUI_BAR_STANDARD_SCALE, direction: 0, value: 0, bitmap: "EnergyHScale", scale: GUI_BAR_STANDARD_SCALE},
"fuelScale": {type: "scale", x: 430 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleEtheneBig", overlay: "OverMediumFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"fuelScale1": {type: "scale", x: 800 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "ScaleEtheneBig", overlay: "OverMediumFuelBG", overlayOffset: {x: -GUI_BAR_STANDARD_SCALE, y: -GUI_BAR_STANDARD_SCALE},  scale: GUI_BAR_STANDARD_SCALE},
"slotEnergy": {type: "slot", x: 900, y: 80},
"slotInput": {type: "slot", x: 350, y: 150}, 
"slotResult": {type: "slot", x: 350, y: 280},
"slotInput1": {type: "slot", x: 900, y: 150}, 
"slotResult1": {type: "slot", x: 900, y: 280},
"progressScale": {type: "scale", x:580, y: 225, direction: 0, value: 0, bitmap: "GuiProgressScale", scale: GUI_BAR_STANDARD_SCALE},


    }
});



MachineRegistry.register(BlockID.RotaryCondensentrator, {
    defaultValues: { 
        f1: 0,
        energymax: 20000,      
        fuelmode: 0,
        energy_consumption: 20,
        work_time: 300,
        progress: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiRotaryCondensentrator;
    },
    
        
    
    getTransportSlots: function(){
        return {input: ["slotInput", "slotInput1"]};
    },
    
    tick: function(type, src){
        
        this.data.fuelmax = 24000;  
        
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
       
        var inSlot = this.container.getSlot("slotInput"); 
        var resultSlot = this.container.getSlot("slotResult"); 
         var inSlot1 = this.container.getSlot("slotInput1"); 
         var resultSlot1 = this.container.getSlot("slotResult1");
         
       this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
                                      
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("fuelScale", this.data.fuel / this.data.fuelmax);
        this.container.setScale("fuelScale1", this.data.f1 / 24000);
        this.container.setScale("progressScale", this.data.progress);
        if (this.data.fuel < this.data.fuelmax)
        {
            if(inSlot.id == ItemID.EleB){
            inSlot.id = 0;
            resultSlot.id = 325;
            resultSlot.data = 0;
            resultSlot.count = 1;
            this.data.fuel += 1000;
            this.data.fuelmode = 1;
            this.container.validateAll();
        }
        }
    if (this.data.fuelmode == 1)
    {
        if(content){ 
               content.elements["fuelScale"].bitmap = "ScaleEtheneBig";
               content.elements["fuelScale1"].bitmap = "ScaleEtheneBig";
            }
    }
       if (this.data.fuel > 2 && this.data.f1 < 24000)
       {
           if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    this.data.fuel -= 2;
                    
                }
                if(this.data.progress >= 1){
                    this.data.f1 += 200;
                    
                    
                    this.data.progress = 0;
                }  
       }
            
            if (this.data.f1 >= 1000 && inSlot1.id == 325)
            {
                
                    resultSlot1.id = ItemID.GEleB;
                    resultSlot1.data = 0;
                    resultSlot.count1 = 1;
                    inSlot1.count--;
                    this.data.f1 -= 1000;
                    this.container.validateAll();
                
            }
          
    },
    energyTick: MachineRegistry.basicEnergyReceiveFunc,
    
 
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
}); 

Block.setPrototype("AdvSolarGenerator",{
    type: Block.TYPE_BASE,

    getVariations: function(){
        return [
		    {name: "Улучшенная солнечная панель", texture: [["SPC", 0], ["SPT", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0]], inCreative: false},		
            {name: "asgbottom1", texture: [["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0]]},
			{name: "asgenergy", texture: [["ASPEC", 0], ["ASPEC", 0], ["ASPEC", 0], ["ASPE", 0], ["ASPEC", 0], ["ASPEC", 0]]},
			{name: "asgstick", texture: [["ASPSB", 0], ["ASPSB", 0], ["ASPSB", 0], ["ASPS", 0], ["ASPSB", 0], ["ASPSB", 0]]},
			{name: "asgtopblock", texture: [["ASPT", 0], ["ASPT", 0], ["ASPT", 0], ["ASPT", 0], ["ASPT", 0], ["ASPT", 0]]},
			{name: "asgtop", texture: [["SPC", 0], ["ASPP", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0], ["SPC", 0]]},
			{name: "asgstick2", texture: [["ASPSB", 0], ["ASPSB", 0], ["ASPSB", 0], ["ASPSB", 0], ["ASPSB", 0], ["ASPSB", 0]]}
			];
    }

});

Block.registerDropFunction("AdvSolarGenerator", function(coords, blockID, blockData){
		return [[ItemID.item_adv, 1, 0]]
});

IDRegistry.genItemID("item_adv");
Item.createItem("item_adv", "Улучшенная солнечная панель", {name: "item_adv", meta: 0});

Item.registerUseFunction("item_adv", function(coords, item, block){
	var place = coords.relative;
	if(GenerationUtils.isTransparentBlock(World.getBlockID(place.x, place.y, place.z))){
		World.setBlock(place.x, place.y, place.z, BlockID.AdvSolarGenerator);
		Player.setCarriedItem(item.id, item.count - 1, item.data);
	}
});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.item_adv, count: 1, data: 0}, [
     "gsg",
     "gsg",
     "iii"
     ], ['g', ItemID.item_sg, 0, 's', ItemID.EnrichedAlloy, 0, 'i', 265 , 0]);});

Block.setBlockShape(BlockID.AdvSolarGenerator, {x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1});
    /*
	 var asgrender = new TileRenderModel(BlockID.AdvSolarGenerator, 0);  
      //Bottom	 
	 asgrender.addBox(0, 0, 0, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 1});
	 //Stick
	 asgrender.addBox(0.1, 0.1, 0.1, {x: 0.8, y: 0.7, z: 0.8}, {id: BlockID.AdvSolarGenerator, data: 2});
	 asgrender.addBox(0.35, 0.8, 0.35, {x: 0.3, y: 0.2, z: 0.3}, {id: BlockID.AdvSolarGenerator, data: 3});
	 asgrender.addBox(0.35, 1, 0.35, {x: 0.3, y: 1, z: 0.3}, {id: BlockID.AdvSolarGenerator, data: 3});
	 //TOP
	 asgrender.addBox(0.25, 2, 0.25, {x: 0.5, y: 0.5, z: 0.5}, {id: BlockID.AdvSolarGenerator, data: 4});
	 asgrender.addBox(0.35, 2, 0.15, {x: 0.1, y: 0.6, z: 0.6}, {id: BlockID.AdvSolarGenerator, data: 3}); 
	 asgrender.addBox(0.55, 2, 0.15, {x: 0.1, y: 0.6, z: 0.6}, {id: BlockID.AdvSolarGenerator, data: 3}); 
	 asgrender.addBox(-0.65, 2.2, 0.45, {x: 1, y: 0.1, z: 0.1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 asgrender.addBox(0.75, 2.2, 0.45, {x: 1, y: 0.1, z: 0.1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 //Panel
	 asgrender.addBox(-0.8, 2.3, 0, {x: 0.8, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 asgrender.addBox(-0.8, 2.3, 1, {x: 0.8, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 asgrender.addBox(-0.8, 2.3, -1, {x: 0.8, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 
	 asgrender.addBox(-0.9, 2.4, 0, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 5});
	 asgrender.addBox(-0.9, 2.4, 1, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 5});
	 asgrender.addBox(-0.9, 2.4, -1, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 5});
	 
	 asgrender.addBox(1, 2.3, 0, {x: 0.8, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 asgrender.addBox(1, 2.3, 1, {x: 0.8, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 asgrender.addBox(1, 2.3, -1, {x: 0.8, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 3});
	 
	 asgrender.addBox(0.9, 2.4, 0, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 5});
	 asgrender.addBox(0.9, 2.4, 1, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 5});
	 asgrender.addBox(0.9, 2.4, -1, {x: 1, y: 0.1, z: 1}, {id: BlockID.AdvSolarGenerator, data: 5});
	 */
	BlockRenderer.addRenderCallback(BlockID.AdvSolarGenerator, function(api, coords) {
		  //Bottom
            api.renderBoxId(coords.x, coords.y, coords.z, 0, 0, 0, 1, 0.1, 1, BlockID.AdvSolarGenerator, 1);	
		//Stick
            api.renderBoxId(coords.x, coords.y, coords.z, 0.1, 0.1, 0.1, 0.9, 0.8, 0.9, BlockID.AdvSolarGenerator, 2);
			api.renderBoxId(coords.x, coords.y, coords.z, 0.35, 0.8, 0.35, 0.65, 1, 0.65, BlockID.AdvSolarGenerator, 3);
			api.renderBoxId(coords.x, coords.y, coords.z, 0.35, 1, 0.35, 0.65, 2, 0.65, BlockID.AdvSolarGenerator, 3);
			//Top
		api.renderBoxId(coords.x, coords.y, coords.z, 0.25, 2, 0.25, 0.75, 2.5, 0.75, BlockID.AdvSolarGenerator, 4);
        api.renderBoxId(coords.x, coords.y, coords.z, 0.35, 2, 0.15, 0.45, 2.6, 0.75, BlockID.AdvSolarGenerator, 6);
        api.renderBoxId(coords.x, coords.y, coords.z, 0.55, 2, 0.15, 0.65, 2.6, 0.75, BlockID.AdvSolarGenerator, 6);
        api.renderBoxId(coords.x, coords.y, coords.z, -0.65, 2.2, 0.45, 0.35, 2.3, 0.55, BlockID.AdvSolarGenerator, 6);
        api.renderBoxId(coords.x, coords.y, coords.z, 0.75, 2.2, 0.45, 1.75, 2.3, 0.55, BlockID.AdvSolarGenerator, 6);		
		//Panel
		 api.renderBoxId(coords.x, coords.y, coords.z, -0.8, 2.3, 0, 0, 2.4, 1, BlockID.AdvSolarGenerator, 6);
		 api.renderBoxId(coords.x, coords.y, coords.z, -0.8, 2.3, 1, 0, 2.4, 2, BlockID.AdvSolarGenerator, 6);
		 api.renderBoxId(coords.x, coords.y, coords.z, -0.8, 2.3, -1, 0, 2.4, 0, BlockID.AdvSolarGenerator, 6);
				  
					  		  api.renderBoxId(coords.x, coords.y, coords.z, -0.9, 2.4, 0, 0.1, 2.5, 1, BlockID.AdvSolarGenerator, 5);
							  api.renderBoxId(coords.x, coords.y, coords.z, -0.9, 2.4, 1, 0.1, 2.5, 2, BlockID.AdvSolarGenerator, 5);
	  						  api.renderBoxId(coords.x, coords.y, coords.z, -0.9, 2.4, -1, 0.1, 2.5, 0, BlockID.AdvSolarGenerator, 5);
									
	      api.renderBoxId(coords.x, coords.y, coords.z, 1, 2.3, 0, 1.8, 2.4, 1, BlockID.AdvSolarGenerator, 6);
	      api.renderBoxId(coords.x, coords.y, coords.z, 1, 2.3, 1, 1.8, 2.4, 2, BlockID.AdvSolarGenerator, 6);
	      api.renderBoxId(coords.x, coords.y, coords.z, 1, 2.3, -1, 1.8, 2.4, 0, BlockID.AdvSolarGenerator, 6);
		  
                 	      api.renderBoxId(coords.x, coords.y, coords.z, 0.9, 2.4, 0, 1.9, 2.5, 1, BlockID.AdvSolarGenerator, 5);
                 	      api.renderBoxId(coords.x, coords.y, coords.z, 0.9, 2.4, 1, 1.9, 2.5, 2, BlockID.AdvSolarGenerator, 5);
                 	      api.renderBoxId(coords.x, coords.y, coords.z, 0.9, 2.4, -1, 1.9, 2.5, 0, BlockID.AdvSolarGenerator, 5);


	});

        BlockRenderer.enableCustomRender(BlockID.AdvSolarGenerator);
	 
var guiADVSolarGenerator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Advanced Solar Generator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 400, y: 225, bitmap: "dnslot", scale: GUI_BAR_STANDARD_SCALE},
    {type: "bitmap", x: 500, y: 180, bitmap: "TextPanel", scale: 4},  
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
        "slotEnergy": {type: "slot", x: 880, y: 220}, 
        "light":  {type: "image", x: 404 + GUI_BAR_STANDARD_SCALE, y: 227 + GUI_BAR_STANDARD_SCALE, bitmap: "isNight", scale: GUI_BAR_STANDARD_SCALE},     
        "textInfo1": {type: "text", x: 510, y: 190, width: 300, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
        "textInfo2": {type: "text", x: 600, y: 190, width: 300, height: 30, text: "kJ", font: {color: android.graphics.Color.GREEN}},
        "textInfo3": {type: "text", x: 510, y: 230, width: 300, height: 30, text: "Солнце:", font: {color: android.graphics.Color.GREEN}},
        "textInfo4": {type: "text", x: 510, y: 270, width: 300, height: 30, text: "Выход: 600J/t", font: {color: android.graphics.Color.GREEN}}
    }
});




MachineRegistry.register(BlockID.AdvSolarGenerator, {
    defaultValues: {        
        energymax: 200000,
        isday: 0       
        
    },
    
   
    
    getGuiScreen: function(){
        return guiADVSolarGenerator;
    },
        
    isGenerator: function() {
        return true;
    },
    
    tick: function(){
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
         this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), this.data.energy, 200, 2);
        if(World.getLightLevel(this.x, this.y + 1, this.z) == 15){
            if(this.data.energy < this.data.energymax){
            this.data.energy += 600;
			time = 1;
        }
            this.data.isday = 1;
        }
        else
        {
			time = 0;
            this.data.isday = 0;
        }
      if (this.data.isday == 0)
        {
           if(content){ 
               content.elements["light"].bitmap = "isNight";
            }
        
           this.container.setText("textInfo3", "Солнце: false");
        }
       if (this.data.isday == 1)
       {
            if(content){ 
                content.elements["light"].bitmap = "isDay";
            }
       this.container.setText("textInfo3", "Солнце: true");
        }
       
      
      this.container.setText("textInfo1", this.data.energy / 1000);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        
    },
    energyTick: function(type, src){
        
        
        var output = Math.min(600, this.data.energy);
        this.data.energy += src.add(output) - output;
    }
	


});	

var TX = 0;
var TY = 0;
var TZ = 0;
var TELEPORTER_MODE = 0;



IDRegistry.genItemID("TeleporterCoord");
Item.createItem("TeleporterCoord", "Датчик телепорта", {name: "TeleportCoord", meta: 0}, {stack: 1});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.TeleporterCoord, count: 1, data: 0}, [
     "  s",
     "obo",
     " o "
     ], ['o', ItemID.SteelIngot, 0, 's', ItemID.ingotosmium, 0, 'b', ItemID.BasicControlCircuit, 0]);});

IDRegistry.genBlockID("TeleporterFrame");
Block.createBlockWithRotation("TeleporterFrame", [
{name: "Каркас телепорта", texture: [["TeleporterFrame", 0], ["TeleporterFrame", 0], ["TeleporterFrame", 0], ["TeleporterFrame", 0], ["TeleporterFrame", 0], ["TeleporterFrame", 0],], inCreative: true}]);
	
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.TeleporterFrame, count: 1, data: 0}, [
     "ooo",
     "ogo",
     "ooo"
     ], ['o', ItemID.ObsidianIngot, 0, 'g', ItemID.GlowstoneIngot, 0]);});
	
IDRegistry.genBlockID("Teleporter");
Block.createBlockWithRotation("Teleporter", [
{name: "Телепорт", texture: [["Teleporter", 0], ["Teleporter", 0], ["Teleporter", 0], ["Teleporter", 0], ["Teleporter", 0], ["Teleporter", 0],], inCreative: true}]);
//ICRenderLib.addConnectionBlock("bc-container", BlockID.Teleporter);	

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: BlockID.Teleporter, count: 1, data: 0}, [
     "bsb",
     "scs",
     "bsb"
     ], ['b', ItemID.BasicControlCircuit, 0, 's', BlockID.SteelCasing, 0, 'c', ItemID.TeleportationCore, 0]);});

Item.registerUseFunction("TeleporterCoord", function(coords, item, block){
	if (item.id == ItemID.TeleporterCoord && TELEPORTER_MODE == 0)
	{
		Game.message("The data obtained");
		TX = coords.x;
		TY = coords.y;
		TZ = coords.z;
		TELEPORTER_MODE = 1;
	}	
});

var guiTeleporter = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Teleporter"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDARD_SCALE},
	{type: "bitmap", x: 500, y: 180, bitmap: "TextPanel", scale: 4}
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDARD_SCALE, y: 150 + GUI_BAR_STANDARD_SCALE, direction: 1, value: 0, bitmap: "GuiPowerBarScale", scale: GUI_BAR_STANDARD_SCALE},
         "slotEnergy": {type: "slot", x: 930, y: 80},  
         "Info": {type: "image", x: 350, y: 80, bitmap: "No", scale: GUI_BAR_STANDARD_SCALE},	
         "textInfo1":  {type: "text", x: 510, y: 190, width: 30, height: 30, text: "X:", font: {color: android.graphics.Color.GREEN}},
"textInfo2":  {type: "text", x: 510, y: 220, width: 30, height: 30, text: "Y:", font: {color: android.graphics.Color.GREEN}},
"textInfo3":  {type: "text", x: 510, y: 250, width: 30, height: 30, text: "Z:", font: {color: android.graphics.Color.GREEN}},

"textInfo4":  {type: "text", x: 540, y: 190, width: 30, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
"textInfo5":  {type: "text", x: 540, y: 220, width: 30, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
"textInfo6":  {type: "text", x: 540, y: 250, width: 30, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},		 		 
    }
});




MachineRegistry.register(BlockID.Teleporter, {
    defaultValues: {        
        energymax: 5000000,      
        tx: 0,
		ty: 0,
		tz: 0,
		isCorpus: 0,
		Tel: 0
    },
    
   
    
    getGuiScreen: function(){
        return guiTeleporter;
    },
        
    
    tick: function(){	
       this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);	
        var content = this.container.getGuiContent();
		if (this.data.tx == 0 && this.data.ty == 0 && this.data.tz == 0)
		{
			if(content){
			content.elements["Info"].bitmap = "No";
			}
		}
		if (this.data.isCorpus == 0 && this.data.tx > 0 && this.data.ty > 0 && this.data.tz > 0)
		{
			if(content){
			content.elements["Info"].bitmap = "NoCarkas";
			}
		}
		if (this.data.isCorpus == 1 && this.data.energy < 1000)
		{
			if(content){
			content.elements["Info"].bitmap = "NoEnergy";
			}
		}
		if (this.data.isCorpus == 1 && this.data.energy >= 1000 && this.data.tx > 0 && this.data.ty > 0 && this.data.tz > 0)
		{
			if(content){
			content.elements["Info"].bitmap = "Yes";
			this.data.Tel = 1;
			}
		}
		
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);	
         this.container.setText("textInfo4", this.data.tx);
this.container.setText("textInfo5", this.data.ty);  
this.container.setText("textInfo6", this.data.tz);  

    var c1 = World.getBlockID(this.x, this.y + 1, this.z);
     
	   
	   if (c1 == BlockID.TeleporterFrame)
	   {
		   this.data.isCorpus = 1;
	   }
    },
    
	click: function(id, count, data, coords){
		 if (id == ItemID.TeleporterCoord && TELEPORTER_MODE == 1)
		 {
			 Game.message("Data is sent");
			 this.data.tx = TX;
			 this.data.ty = TY;
			 this.data.tz = TZ;
             TX = 0;
             TY = 0;
             TZ = 0;
             TELEPORTER_MODE = 0;			 
			 
		 }
	 },
	 redstone: function(params){
          if(this.data.Tel == 1 && this.data.energy >= 1000)
		  {
			  this.data.energy -= 1000;
			  Player.setPosition(this.data.tx, this.data.ty + 3, this.data.tz);
		  }
     },
	 energyTick: MachineRegistry.basicEnergyReceiveFunc,
	 getEnergyStorage: function(){
        return this.data.energymax;
    }
});	

//БРОНЯ
IDRegistry.genItemID("obsidianHelmet");
IDRegistry.genItemID("obsidianChestplate");
IDRegistry.genItemID("obsidianLeggings");
IDRegistry.genItemID("obsidianBoots");

Item.createArmorItem("obsidianHelmet", "Обсидиановый шлем", {name: "ObsidianHelmet"}, {type: "helmet", armor: 3, durability: 550, texture: "armor/obsidian_1.png"});
Item.createArmorItem("obsidianChestplate", "Обсидиановая кисара", {name: "ObsidianChestplate"}, {type: "chestplate", armor: 8, durability: 800, texture: "armor/obsidian_1.png"});
Item.createArmorItem("obsidianLeggings", "Обсидиановые поножи", {name: "ObsidianLeggings"}, {type: "leggings", armor: 6, durability: 750, texture: "armor/obsidian_2.png"});
Item.createArmorItem("obsidianBoots", "Обсидиановые ботинки", {name: "ObsidianBoots"}, {type: "boots", armor: 3, durability: 650, texture: "armor/obsidian_1.png"});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianHelmet, count: 1, data: 0}, [
     "ooo",
     "o o",
     "   "
     ], ['o', ItemID.ObsidianIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianChestplate, count: 1, data: 0}, [
     "o o",
     "ooo",
     "ooo"
     ], ['o', ItemID.ObsidianIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianLeggings, count: 1, data: 0}, [
     "ooo",
     "o o",
     "o o"
     ], ['o', ItemID.ObsidianIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianBoots, count: 1, data: 0}, [
     "   ",
     "o o",
     "o o"
     ], ['o', ItemID.ObsidianIngot, 0]);});

   
   
IDRegistry.genItemID("lapisHelmet");
IDRegistry.genItemID("lapisChestplate");
IDRegistry.genItemID("lapisLeggings");
IDRegistry.genItemID("lapisBoots");

Item.createArmorItem("lapisHelmet", "Лазуритовый шлем", {name: "LazuliHelmet"}, {type: "helmet", armor: 3, durability: 143, texture: "armor/lazuli_1.png"});
Item.createArmorItem("lapisChestplate", "Лазуритовая кисара", {name: "LazuliChestplate"}, {type: "chestplate", armor: 8, durability: 208, texture: "armor/lazuli_1.png"});
Item.createArmorItem("lapisLeggings", "Лазуритовые поножи", {name: "LazuliLeggings"}, {type: "leggings", armor: 6, durability: 195, texture: "armor/lazuli_2.png"});
Item.createArmorItem("lapisBoots", "Лазуритовые ботинки", {name: "LazuliBoots"}, {type: "boots", armor: 3, durability: 169, texture: "armor/lazuli_1.png"});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lapisHelmet, count: 1, data: 0}, [
     "ooo",
     "o o",
     "   "
     ], ['o', 351, 4]); });
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lapisChestplate, count: 1, data: 0}, [
     "o o",
     "ooo",
     "ooo"
     ], ['o', 351, 4]); });
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lapisLeggings, count: 1, data: 0}, [
     "ooo",
     "o o",
     "o o"
     ], ['o', 351, 4]); });
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lapisBoots, count: 1, data: 0}, [
     "   ",
     "o o",
     "o o"
     ], ['o', 351, 4]);});


IDRegistry.genItemID("OsmiumHelmet");
IDRegistry.genItemID("OsmiumChestplate");
IDRegistry.genItemID("OsmiumLeggings");
IDRegistry.genItemID("OsmiumBoots");

Item.createArmorItem("OsmiumHelmet", "Осмиевый шлем", {name: "OsmiumHelmet"}, {type: "helmet", armor: 3, durability: 330, texture: "armor/osmium_1.png"});
Item.createArmorItem("OsmiumChestplate", "Осмиевая кисара", {name: "OsmiumChestplate"}, {type: "chestplate", armor: 8, durability: 480, texture: "armor/osmium_1.png"});
Item.createArmorItem("OsmiumLeggings", "Осмиевые поножи", {name: "OsmiumLeggings"}, {type: "leggings", armor: 6, durability: 450, texture: "armor/osmium_2.png"});
Item.createArmorItem("OsmiumBoots", "Осмиевые ботинки", {name: "OsmiumBoots"}, {type: "boots", armor: 3, durability: 390, texture: "armor/osmium_1.png"});


Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumHelmet, count: 1, data: 0}, [
     "ooo",
     "o o",
     "   "
     ], ['o', ItemID.ingotosmium, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumChestplate, count: 1, data: 0}, [
     "o o",
     "ooo",
     "ooo"
     ], ['o', ItemID.ingotosmium, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumLeggings, count: 1, data: 0}, [
     "ooo",
     "o o",
     "o o"
     ], ['o', ItemID.ingotosmium, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumBoots, count: 1, data: 0}, [
     "   ",
     "o o",
     "o o"
     ], ['o', ItemID.ingotosmium, 0]);});


IDRegistry.genItemID("BronzeHelmet");
IDRegistry.genItemID("BronzeChestplate");
IDRegistry.genItemID("BronzeLeggings");
IDRegistry.genItemID("BronzeBoots");

Item.createArmorItem("BronzeHelmet", "Бронзовый шлем", {name: "BronzeHelmet"}, {type: "helmet", armor: 3, durability: 385, texture: "armor/bronze_1.png"});
Item.createArmorItem("BronzeChestplate", "Бронзовая кисара", {name: "BronzeChestplate"}, {type: "chestplate", armor: 8, durability: 560, texture: "armor/bronze_1.png"});
Item.createArmorItem("BronzeLeggings", "Бронзовые поножи", {name: "BronzeLeggings"}, {type: "leggings", armor: 6, durability: 525, texture: "armor/bronze_2.png"});
Item.createArmorItem("BronzeBoots", "Бронзовые ботинки", {name: "BronzeBoots"}, {type: "boots", armor: 3, durability: 455, texture: "armor/bronze_1.png"});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeHelmet, count: 1, data: 0}, [
     "ooo",
     "o o",
     "   "
     ], ['o', ItemID.BronzeIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeChestplate, count: 1, data: 0}, [
     "o o",
     "ooo",
     "ooo"
     ], ['o', ItemID.BronzeIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeLeggings, count: 1, data: 0}, [
     "ooo",
     "o o",
     "o o"
     ], ['o', ItemID.BronzeIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeBoots, count: 1, data: 0}, [
     "   ",
     "o o",
     "o o"
     ], ['o', ItemID.BronzeIngot, 0]);});


IDRegistry.genItemID("GlowstoneHelmet");
IDRegistry.genItemID("GlowstoneChestplate");
IDRegistry.genItemID("GlowstoneLeggings");
IDRegistry.genItemID("GlowstoneBoots");

Item.createArmorItem("GlowstoneHelmet", "Шлем из светящегося камня", {name: "GlowstoneHelmet"}, {type: "helmet", armor: 3, durability: 198, texture: "armor/glowstone_1.png"});
Item.createArmorItem("GlowstoneChestplate", "Кисара  из светящегося камня", {name: "GlowstoneChestplate"}, {type: "chestplate", armor: 8, durability: 288, texture: "armor/glowstone_1.png"});
Item.createArmorItem("GlowstoneLeggings", "Поножи  из светящегося камня", {name: "GlowstoneLeggings"}, {type: "leggings", armor: 6, durability: 270, texture: "armor/glowstone_2.png"});
Item.createArmorItem("GlowstoneBoots", "Ботинки  из светящегося камня", {name: "GlowstoneBoots"}, {type: "boots", armor: 3, durability: 234, texture: "armor/glowstone_1.png"});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneHelmet, count: 1, data: 0}, [
     "ooo",
     "o o",
     "   "
     ], ['o', ItemID.GlowstoneIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneChestplate, count: 1, data: 0}, [
     "o o",
     "ooo",
     "ooo"
     ], ['o', ItemID.GlowstoneIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneLeggings, count: 1, data: 0}, [
     "ooo",
     "o o",
     "o o"
     ], ['o', ItemID.GlowstoneIngot, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneBoots, count: 1, data: 0}, [
     "   ",
     "o o",
     "o o"
     ], ['o', ItemID.GlowstoneIngot, 0]);});

IDRegistry.genItemID("SteelHelmet");
IDRegistry.genItemID("SteelChestplate");
IDRegistry.genItemID("SteelLeggings");
IDRegistry.genItemID("SteelBoots");

Item.createArmorItem("SteelHelmet", "Стальной шлем", {name: "SteelHelmet"}, {type: "helmet", armor: 3, durability: 440, texture: "armor/steel_1.png"});
Item.createArmorItem("SteelChestplate", "Стальная кисара", {name: "SteelChestplate"}, {type: "chestplate", armor: 8, durability: 640, texture: "armor/steel_1.png"});
Item.createArmorItem("SteelLeggings", "Стальные поножи", {name: "SteelLeggings"}, {type: "leggings", armor: 6, durability: 600, texture: "armor/steel_2.png"});
Item.createArmorItem("SteelBoots", "Стальные ботинки", {name: "SteelBoots"}, {type: "boots", armor: 3, durability: 520, texture: "armor/steel_1.png"});

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelHelmet, count: 1, data: 0}, [
     "ooo",
     "i i",
     "   "
     ], ['o', ItemID.SteelIngot, 0, 'i', 265, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelChestplate, count: 1, data: 0}, [
     "i i",
     "ooo",
     "ooo"
     ], ['o', ItemID.SteelIngot, 0, 'i', 265, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelLeggings, count: 1, data: 0}, [
     "ioi",
     "o o",
     "o o"
     ], ['o', ItemID.SteelIngot, 0, 'i', 265, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelBoots, count: 1, data: 0}, [
     "   ",
     "i o",
     "o i"
     ], ['o', ItemID.SteelIngot, 0, 'i', 265, 0]);});
   
//ИНСТРУМЕНТЫ

IDRegistry.genItemID("obsidianPickaxe");
Item.createItem("obsidianPickaxe", "Обсидиановая кирка", {name: "ObsidianPickaxe", meta: 0}, {stack: 1});
ToolAPI.addToolMaterial("obsidian", {durability: 2500, level: 4, efficiency: 8, damage: 4, enchantability: 18});
ToolAPI.setTool(ItemID.obsidianPickaxe, "obsidian", ToolType.pickaxe);

IDRegistry.genItemID("obsidianAxe");
Item.createItem("obsidianAxe", "Обсидиановый топор", {name: "ObsidianAxe", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.obsidianAxe, "obsidian", ToolType.axe);

IDRegistry.genItemID("obsidianShovel");
Item.createItem("obsidianShovel", "Обсидиановая лопата", {name: "ObsidianShovel", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.obsidianShovel, "obsidian", ToolType.shovel);

IDRegistry.genItemID("obsidianSword");
Item.createItem("obsidianSword", "Обсидиановый меч", {name: "ObsidianSword", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.obsidianSword, "obsidian", ToolType.sword);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianPickaxe, count: 1, data: 0}, [
     "ooo",
     " p ",
     " p "
     ], ['o', ItemID.ObsidianIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianAxe, count: 1, data: 0}, [
     "oo ",
     "op ",
     " p "
     ], ['o', ItemID.ObsidianIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianShovel, count: 1, data: 0}, [
     " o ",
     " p ",
     " p "
     ], ['o', ItemID.ObsidianIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.obsidianSword, count: 1, data: 0}, [
     " o ",
     " o ",
     " p "
     ], ['o', ItemID.ObsidianIngot, 0, 'p', 280, 0]);});

IDRegistry.genItemID("lazuliPickaxe");
Item.createItem("lazuliPickaxe", "Лазуритовая кирка", {name: "LazuliPickaxe", meta: 0}, {stack: 1});
ToolAPI.addToolMaterial("lazuli", {durability: 200, level: 3, efficiency: 6, damage: 2, enchantability: 14});
ToolAPI.setTool(ItemID.lazuliPickaxe, "lazuli", ToolType.pickaxe);

IDRegistry.genItemID("lazuliAxe");
Item.createItem("lazuliAxe", "Лазуритовый топор", {name: "LazuliAxe", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.lazuliAxe, "lazuli", ToolType.axe);

IDRegistry.genItemID("lazuliShovel");
Item.createItem("lazuliShovel", "Лазуритовая лопата", {name: "LazuliShovel", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.lazuliShovel, "lazuli", ToolType.shovel);

IDRegistry.genItemID("lazuliSword");
Item.createItem("lazuliSword", "Лазуритовый меч", {name: "LazuliSword", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.lazuliSword, "lazuli", ToolType.sword);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lazuliPickaxe, count: 1, data: 0}, [
     "ooo",
     " p ",
     " p "
     ], ['o', 351, 4, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lazuliAxe, count: 1, data: 0}, [
     "oo ",
     "op ",
     " p "
     ], ['o', 351, 4, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lazuliShovel, count: 1, data: 0}, [
     " o ",
     " p ",
     " p "
     ], ['o', 351, 4, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.lazuliSword, count: 1, data: 0}, [
     " o ",
     " o ",
     " p "
     ], ['o', 351, 4, 'p', 280, 0]);});


IDRegistry.genItemID("OsmiumPickaxe");
Item.createItem("OsmiumPickaxe", "Осмиевая кирка", {name: "OsmiumPickaxe", meta: 0}, {stack: 1});
ToolAPI.addToolMaterial("Osmium", {durability: 500, level: 3, efficiency: 6, damage: 2, enchantability: 14});
ToolAPI.setTool(ItemID.OsmiumPickaxe, "Osmium", ToolType.pickaxe);

IDRegistry.genItemID("OsmiumAxe");
Item.createItem("OsmiumAxe", "Осмиевый топор", {name: "OsmiumAxe", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.OsmiumAxe, "Osmium", ToolType.axe);

IDRegistry.genItemID("OsmiumShovel");
Item.createItem("OsmiumShovel", "Осмиевая лопата", {name: "OsmiumShovel", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.OsmiumShovel, "Osmium", ToolType.shovel);

IDRegistry.genItemID("OsmiumSword");
Item.createItem("OsmiumSword", "Осмиевый меч", {name: "OsmiumSword", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.OsmiumSword, "Osmium", ToolType.sword);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumPickaxe, count: 1, data: 0}, [
     "ooo",
     " p ",
     " p "
     ], ['o', ItemID.ingotosmium, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumAxe, count: 1, data: 0}, [
     "oo ",
     "op ",
     " p "
     ], ['o', ItemID.ingotosmium, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumShovel, count: 1, data: 0}, [
     " o ",
     " p ",
     " p "
     ], ['o', ItemID.ingotosmium, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.OsmiumSword, count: 1, data: 0}, [
     " o ",
     " o ",
     " p "
     ], ['o', ItemID.ingotosmium, 0, 'p', 280, 0]);});


IDRegistry.genItemID("BronzePickaxe");
Item.createItem("BronzePickaxe", "Бронзовая кирка", {name: "BronzePickaxe", meta: 0}, {stack: 1});
ToolAPI.addToolMaterial("Bronze", {durability: 800, level: 4, efficiency: 7, damage: 3, enchantability: 16});
ToolAPI.setTool(ItemID.BronzePickaxe, "Bronze", ToolType.pickaxe);

IDRegistry.genItemID("BronzeAxe");
Item.createItem("BronzeAxe", "Бронзовый топор", {name: "BronzeAxe", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.BronzeAxe, "Bronze", ToolType.axe);

IDRegistry.genItemID("BronzeShovel");
Item.createItem("BronzeShovel", "Бронзовая лопата", {name: "BronzeShovel", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.BronzeShovel, "Bronze", ToolType.shovel);

IDRegistry.genItemID("BronzeSword");
Item.createItem("BronzeSword", "Бронзовый меч", {name: "BronzeSword", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.BronzeSword, "Bronze", ToolType.sword);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzePickaxe, count: 1, data: 0}, [
     "ooo",
     " p ",
     " p "
     ], ['o', ItemID.BronzeIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeAxe, count: 1, data: 0}, [
     "oo ",
     "op ",
     " p "
     ], ['o', ItemID.BronzeIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeShovel, count: 1, data: 0}, [
     " o ",
     " p ",
     " p "
     ], ['o', ItemID.BronzeIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.BronzeSword, count: 1, data: 0}, [
     " o ",
     " o ",
     " p "
     ], ['o', ItemID.BronzeIngot, 0, 'p', 280, 0]);});

IDRegistry.genItemID("GlowstonePickaxe");
Item.createItem("GlowstonePickaxe", "Кирка из светящегося камня", {name: "GlowstonePickaxe", meta: 0}, {stack: 1});
ToolAPI.addToolMaterial("Glowstone", {durability: 300, level: 3, efficiency: 6, damage: 2, enchantability: 14});
ToolAPI.setTool(ItemID.GlowstonePickaxe, "Glowstone", ToolType.pickaxe);

IDRegistry.genItemID("GlowstoneAxe");
Item.createItem("GlowstoneAxe", "Топор из светящегося камня", {name: "GlowstoneAxe", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.GlowstoneAxe, "Glowstone", ToolType.axe);

IDRegistry.genItemID("GlowstoneShovel");
Item.createItem("GlowstoneShovel", "Лопата из светящегося камня", {name: "GlowstoneShovel", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.GlowstoneShovel, "Glowstone", ToolType.shovel);

IDRegistry.genItemID("GlowstoneSword");
Item.createItem("GlowstoneSword", "Меч из светящегося камня", {name: "GlowstoneSword", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.GlowstoneSword, "Glowstone", ToolType.sword);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstonePickaxe, count: 1, data: 0}, [
     "ooo",
     " p ",
     " p "
     ], ['o', ItemID.GlowstoneIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneAxe, count: 1, data: 0}, [
     "oo ",
     "op ",
     " p "
     ], ['o', ItemID.GlowstoneIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneShovel, count: 1, data: 0}, [
     " o ",
     " p ",
     " p "
     ], ['o', ItemID.GlowstoneIngot, 0, 'p', 280, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.GlowstoneSword, count: 1, data: 0}, [
     " o ",
     " o ",
     " p "
     ], ['o', ItemID.GlowstoneIngot, 0, 'p', 280, 0]);});

IDRegistry.genItemID("SteelPickaxe");
Item.createItem("SteelPickaxe", "Стальная кирка", {name: "SteelPickaxe", meta: 0}, {stack: 1});
ToolAPI.addToolMaterial("Steel", {durability: 850, level: 4, efficiency: 7, damage: 4, enchantability: 16});
ToolAPI.setTool(ItemID.SteelPickaxe, "Steel", ToolType.pickaxe);

IDRegistry.genItemID("SteelAxe");
Item.createItem("SteelAxe", "Стальной топор", {name: "SteelAxe", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.SteelAxe, "Steel", ToolType.axe);

IDRegistry.genItemID("SteelShovel");
Item.createItem("SteelShovel", "Стальная лопата", {name: "SteelShovel", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.SteelShovel, "Steel", ToolType.shovel);

IDRegistry.genItemID("SteelSword");
Item.createItem("SteelSword", "Стальной меч", {name: "SteelSword", meta: 0}, {stack: 1});
ToolAPI.setTool(ItemID.SteelSword, "Steel", ToolType.sword);

Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelPickaxe, count: 1, data: 0}, [
     "ooo",
     " p ",
     " p "
     ], ['o', ItemID.SteelIngot, 0, 'p', 265, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelAxe, count: 1, data: 0}, [
     "oo ",
     "op ",
     " p "
     ], ['o', ItemID.SteelIngot, 0, 'p', 265, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelShovel, count: 1, data: 0}, [
     " o ",
     " p ",
     " p "
     ], ['o', ItemID.SteelIngot, 0, 'p', 265, 0]);});
Callback.addCallback("PostLoaded", function(){ Recipes.addShaped({id: ItemID.SteelSword, count: 1, data: 0}, [
     " o ",
     " o ",
     " p "
     ], ['o', ItemID.SteelIngot, 0, 'p', 265, 0]);});
    
 
 






//----------------------------------------------------------------------------------------------
//--ГЕНЕРАЦИЯ
Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ){
            GenerationUtils.lockInBlock(BlockID.OsmiumOre, 0, 1, false);
            for(var i = 0; i < 10; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, 10, 64);
                OreGenerator.genOreNormal(coords.x, coords.y, coords.z);
            }
        });

Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ){
            GenerationUtils.lockInBlock(BlockID.CopperOre, 0, 1, false);
            for(var i = 0; i < 10; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, 10, 64);
                OreGenerator.genOreNormal(coords.x, coords.y, coords.z);
            }
        });

Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ){
            GenerationUtils.lockInBlock(BlockID.TinOre, 0, 1, false);
            for(var i = 0; i < 10; i++){
                var coords = GenerationUtils.randomCoords(chunkX, chunkZ, 10, 64);
                OreGenerator.genOreNormal(coords.x, coords.y, coords.z);
            }
        });   
        



        //API
ModAPI.registerAPI("APIMEK", {
    Machine: MachineRegistry,
    ChargeRegistry: ChargeItemRegistry,
    requireGlobal: function(command){
        return eval(command);
    }
});

Logger.Log("Mekanism Core API shared with name APIMEK.", "API");

Callback.addCallback("PostLoaded", function(){
         LOAD_WORLD = 1;   
});