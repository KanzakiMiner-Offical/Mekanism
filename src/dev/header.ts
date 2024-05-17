IMPORT("EnergyNet");
IMPORT("ChargeItem");
IMPORT("flags");
IMPORT("StorageInterface");
IMPORT("TileRender");
IMPORT("BlockEngine")

let startTime = Debug.sysTime();

const J = EnergyTypeRegistry.assureEnergyType("J", 0.1);
const EU = EnergyTypeRegistry.assureEnergyType("Eu", 1);
const RF = EnergyTypeRegistry.assureEnergyType("RF", 0.25);

const Color = android.graphics.Color;
const JString = java.lang.String;
const Integer = java.lang.Integer;
const Random = java.util.Random;
const File = java.io.File;
type HashMap<K, V> = java.util.HashMap<K, V>;
type UIElement = com.zhekasmirnov.innercore.api.mod.ui.elements.UIElement;

function jToRF(j: number) {
    return j / 2.5
}
// const TILE_RENDERER_CONNECTION_GROUP = "ic-wire";
// const TILE_RENDERER_CONNECTION_GROUP_FUEL = "ic-wire_fuel";
// const FLUID_PIPE_CONNECTION_MACHINE = "bc-fluid";
// const PIPE_BLOCK_WIDTH = 0.25;
// const FLUID_PIPE_CONNECTION_ANY = "bc-fluid-pipe-any";
// const FLUID_PIPE_CONNECTION_STONE = "bc-fluid-pipe-stone";
// const FLUID_PIPE_CONNECTION_COBBLE = "bc-fluid-pipe-cobble";
// const FLUID_PIPE_CONNECTION_SANDSTONE = "bc-fluid-pipe-sandstone";
// const BLOCK_TYPE_LIQUID_PIPE = Block.createSpecialType({
// 	base: 20,
// 	renderlayer: 3
// }, "bc-liquid-pipe");
const CABLE_BLOCK_WIDTH = 0.25;
const GUI_BAR_STANDARD_SCALE = 3.2;
const GUI_SCALE = 3.2;

interface LiquidInstance {
    liquid: string,
    amount: number;
}

// RECIPE VIEWER SUPPORT
let RV: RecipeViewerAPI;

enum TankMode {
    "IDLE" = 0, // 100 %
    "DUMPING_EXCESS" = 1, // 90 %
    "DUMPING" = 2, // 0 %
}