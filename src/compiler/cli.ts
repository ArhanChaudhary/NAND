import compiler from "./main";
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
    const files = fs.readdirSync(path).filter((fileName: string) => fileName.endsWith('.jack'));
    inputFiles = files.map((fileName: string) => ({
        fileName: fileName.replace('.jack', ''),
        file: fs.readFileSync(`${path}/${fileName}`, 'utf-8').split('\n')
    }));
}

const out = compiler(inputFiles);
out.forEach(fileData => {
    if (path.includes('.jack')) {
        fs.writeFileSync(path.replace('.jack', '.vm'), fileData.file.join('\n'));
    } else {
        fs.writeFileSync(`${path}/${fileData.fileName}.vm`, fileData.file.join('\n'));
    }
});