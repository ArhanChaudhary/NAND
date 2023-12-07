import VMTranslator from './main';
import fs from 'fs';

let path = process.argv[process.argv.length - 1];
if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
}

let inputFiles: Array<{fileName: string, file: string[]}>;
if (path.endsWith('.vm')) {
    inputFiles = [{
        fileName: path.split('/').pop().replace('.vm', ''),
        file: fs.readFileSync(path, 'utf-8').split('\n')
    }];
} else {
    const files = fs.readdirSync(path).filter((fileName: string) => fileName.endsWith('.vm'));
    inputFiles = files.map((fileName: string) => ({
        fileName: fileName.replace('.vm', ''),
        file: fs.readFileSync(`${path}/${fileName}`, 'utf-8').split('\n')
    }));
}

const out = VMTranslator(inputFiles);
let outputFile: string;
if (path.includes('.vm')) {
    outputFile = path.replace('.vm', '.asm');
} else {
    outputFile = `${path}/${path.split('/').pop()}.asm`;
}
fs.writeFileSync(outputFile, out.join('\n'));