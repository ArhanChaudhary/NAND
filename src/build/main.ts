import { execSync } from 'child_process';

function buildAllStages(inputDirectory: string) {
    execSync(`~/Desktop/nand2tetris/tools/JackCompiler.sh ${inputDirectory}`);
    // execSync(`ts-node vm/main ${inputDirectory}`);
    // execSync(`ts-node assembler/main ${inputDirectory}/${inputDirectory.split('/')[inputDirectory.split('/').length - 1]}.asm`);
    // console.log('All stages compiled successfully.');
}

let inputDirectory = process.argv[process.argv.length - 1];
if (inputDirectory[inputDirectory.length - 1] === '/') {
    inputDirectory = inputDirectory.slice(0, -1);
}
buildAllStages(inputDirectory);