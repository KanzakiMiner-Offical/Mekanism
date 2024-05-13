namespace FileUtil {

    export function isExist(path: string): boolean {
        return new File(path).exists();
    }

    export function readImage(path: string): Bitmap {
        const options = new BitmapFactory.Options();
        options.inScaled = false;
        return BitmapFactory.decodeFile(path, options);
    }

    export function writeImage(path: string, bitmap: Bitmap): void {
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, new FileOutputStream(path));
    }

    function readFileText(path: string): string {
        const reader = new BufferedReader(new FileReader(new File(path)));
        let text = "";
        while(true){
            const readLine = reader.readLine();
            const line = readLine;
            if(readLine != null) text += `${line}\n`;
            else {
                reader.close();
                return text;
            }
        }
    }

    export function readJSON(path: string): any {
        const textFile = readFileText(path);
        try {
            return JSON.parse(textFile) || {};
        } catch(e){ return {} }
    }

    export function getListOfFiles(path: string, extension?: string): File[] {
        const dir = new File(path);
        const list = [];
        const files = dir.listFiles();
        if(!files) return list;
        for(let i=0; i<files.length; i++){
            const file = files[i];
            if(!file.isDirectory() && (!extension || file.getName().endsWith(extension))){
                list.push(file);
            }
        }
        return list;
    }

    export function getListOfDirs(path: string): File[] {
        const dir = new File(path);
        const list = [];
        const files = dir.listFiles();
        if(!files) return list;
        for(let i=0; i<files.length; i++) {
            const file = files[i];
            if(file.isDirectory()) list.push(file);
        }
        return list;
    }

}