const BaseTex = {
    infuser_type: "infuser_type",
    liquid: "liquid",
    heat: "heat",
    mek_dir_source: "resources/res/texture_source/",
    mek_dir_result_item: "resources/res/items-opaque/",
    mek_dir_result_gui: "gui/gui/"
} as const;

const ScaleTexture = {
    infuser: { width: 16, height: 160 },
    liquid: { width: 16, height: 512 },
    heat: { width: 16, height: 512 },
}

function createTexure(path: string, texture: string, color_rgb: [number, number, number], scale: { width: number, height: number }, output_dir: string, output_texture: string) {
    TextureWorker.createTextureWithOverlaysModDir({
        bitmap: { width: scale.width, height: scale.height },
        overlays: [
            { path: path, name: texture, color: color_rgb }
        ],
        result: { path: output_dir, name: output_texture }
    })
}

const InfuserType: { key: string, hex: string }[] = [
    { key: "redstone", hex: "#ff0000" },
    { key: "coal", hex: "#1a1a1a" },
    { key: "diamond", hex: "#00ffff" },
    { key: "obsidian", hex: "#57099a" },
    { key: "tin", hex: "#edf4ff" },
    { key: "gold", hex: "#fff700" }
];

InfuserType.forEach(type => {
    createTexure(BaseTex.mek_dir_source, BaseTex.infuser_type, hex2rgb(type.hex), ScaleTexture.infuser, BaseTex.mek_dir_result_gui, `infuser_${type.key}`)
})

const GasType: { key: string, hex: string }[] = [
    { key: "hydrogen", hex: "#ffffff" },
    { key: "oxygen", hex: "#6ce2ff" },
    { key: "chlorine", hex: "#cfe800" },
    { key: "sulfur_dioxide", hex: "#a99d90" },
    { key: "sulfur_trioxide", hex: "#ce6c6c" },
    // fluid
    { key: "sodium", hex: "#e9fef4" },
    { key: "heater_sodium", hex: "#d19469" },

    { key: "sulfuric_acid", hex: "#82802b" },
    { key: "hydrogen_chloride", hex: "#a8f1e9" },
    { key: "ethene", hex: "#eaccf9" },

    { key: "lithium", hex: "#eba400" },
    { key: "hydrofluoric_acid", hex: "#c6c7bd" },
    { key: "uranium_oxide", hex: "#e1f573" },
    { key: "uranium_hexafluoride", hex: "#809960" }
];
GasType.forEach(type => {
    createTexure(BaseTex.mek_dir_source, BaseTex.liquid, hex2rgb(type.hex), ScaleTexture.liquid, BaseTex.mek_dir_result_gui, `${type.key}_gas`)
    createTexure(BaseTex.mek_dir_source, BaseTex.liquid, hex2rgb(type.hex), ScaleTexture.liquid, BaseTex.mek_dir_result_gui, `${type.key}_liquid`)
})

// FileUtil.getListOfFiles(`${__dir__}/resources/res/animated_items/`, "png").forEach(file => {
//     const fileName = new JavaString(file.getName()).replaceFirst("[.][^.]+$", "");
//     IAHelper.convertTexture("resources/res/animated_items/", fileName, "resources/res/items-opaque/", fileName);
// });
