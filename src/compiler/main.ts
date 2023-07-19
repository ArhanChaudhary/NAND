import Engine from "./engine";
import fs from "fs";

let path: string = process.argv[process.argv.length - 1];
if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
}

let files: string[];
if (path.endsWith('.jack')) {
    files = [path];
} else {
    files = fs.readdirSync(path).map(file => `${path}/${file}`);
}
files.forEach(file => {
    if (!file.endsWith('.jack')) return;
    new Engine(file).compileClass();
});