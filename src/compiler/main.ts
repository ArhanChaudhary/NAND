import Engine from "./engine";
import fs from "fs";

let path = process.argv[process.argv.length - 1];
if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
}

let inputFiles: Array<{fileName: string, file: string[]}>;
if (path.endsWith('.jack')) {
    inputFiles = [{
        fileName: path.split('/').pop().replace('.jack', ''),
        file: fs.readFileSync(path, 'utf-8').split('\n')
    }];
} else {
    const files = fs.readdirSync(path).filter(fileName => fileName.endsWith('.jack'));
    inputFiles = files.map(fileName => ({
        fileName: fileName.replace('.jack', ''),
        file: fs.readFileSync(`${path}/${fileName}`, 'utf-8').split('\n')
    }));
}

let out: Array<{fileName: string, file: string[]}> = [];
inputFiles.forEach(fileData => {
    try {
        const engine = new Engine(fileData);
        engine.compileClass();
        out.push(engine.getOut());
    } catch (err: any) {
        console.log(err.toString());
    }
});
// Engine.postValidation();
out.forEach(fileData => {
    if (path.includes('.jack')) {
        fs.writeFileSync(path.replace('.jack', '.vm'), fileData.file.join('\n'));
    } else {
        fs.writeFileSync(`${path}/${fileData.fileName}.vm`, fileData.file.join('\n'));
    }
});
