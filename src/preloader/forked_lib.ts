namespace TextureWorker {

    export interface ITextureSource {
        path: string;
        name: string;
    }

    export interface IOverlay extends ITextureSource {
        color?: [r: number, g: number, b: number];
    }

    export interface IBitmap {
        width: number;
        height: number;
        config?: BitmapConfig;
    }

    function changeBitmapColor(bitmap: Bitmap, color: [number, number, number]): Bitmap {
        const newbmp = Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), Bitmap.Config.ARGB_8888);
        const canvas = new Canvas(newbmp);
        const paint = new Paint();
        paint.setColorFilter(new PorterDuffColorFilter(Color.rgb(color[0], color[1], color[2]), PorterDuff.Mode.MULTIPLY));
        canvas.drawBitmap(bitmap, 0, 0, paint);
        return newbmp;
    }

    function fromModDir(textureSource: ITextureSource | IOverlay): ITextureSource | IOverlay {
        if (textureSource.path.startsWith(__dir__)) return textureSource;
        return { name: textureSource.name, path: `${__dir__}/${textureSource.path}`, color: (textureSource as IOverlay).color };
    }

    function createTextureWithOverlays(args: { bitmap: IBitmap, overlays: IOverlay[], result: ITextureSource }, fallback?: boolean): Bitmap | void {
        if (FileUtil.isExist(`${args.result.path}${args.result.name}.png`)) return;
        const bmp = Bitmap.createBitmap(args.bitmap.width, args.bitmap.height, args.bitmap.config ?? Bitmap.Config.ARGB_8888);
        const cvs = new Canvas(bmp);
        args.overlays.forEach(over => {
            const tex = FileUtil.readImage(`${over.path}${over.name}.png`);
            cvs.drawBitmap(over.color ? changeBitmapColor(tex, over.color) : tex, 0, 0, null);
        });
        FileUtil.writeImage(`${args.result.path}${args.result.name}.png`, bmp);
        if (fallback) return bmp;
    }

    export function createTextureWithOverlaysModDir(args: { bitmap: IBitmap, overlays: IOverlay[], result: ITextureSource }, fallback?: boolean): Bitmap | void {
        args.result = fromModDir(args.result);
        args.overlays = args.overlays.map(fromModDir);
        return createTextureWithOverlays(args, fallback);
    }
}

namespace IAHelper {
    export function convertTexture(srcPath: string, srcName: string, resultPath: string, resultName: string): void {
        if (FileUtil.isExist(`${__dir__}/${resultPath}${resultName}_0.png`)) return;
        const anim = FileUtil.readImage(`${__dir__}/${srcPath}${srcName}.png`);
        if (anim.getHeight() % anim.getWidth() !== 0) throw new IllegalStateException("The bitmap height must be a multiple of its width!");
        for (let i = 0; i < anim.getHeight() / anim.getWidth(); i++) {
            const bmp = Bitmap.createBitmap(anim.getWidth(), anim.getWidth(), Bitmap.Config.ARGB_8888);
            for (let x = 0; x < anim.getWidth(); x++)
                for (let y = 0; y < anim.getWidth(); y++)
                    bmp.setPixel(x, y, anim.getPixel(x, y + anim.getWidth() * i));
            FileUtil.writeImage(`${__dir__}/${resultPath}${resultName}_${i}.png`, bmp);
        }
    }

}

function hex2rgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] as [number, number, number];
}