import CodeWriter from "./codewriter";
import Parser, { CommandType } from "./parser";
import fs from "fs";

let path: string = process.argv[process.argv.length - 1];
if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
}

let files: string[];
let codeWriter: CodeWriter;
if (path.endsWith('.vm')) {
    files = [path];
    codeWriter = new CodeWriter(path.substring(0, path.length - 3) + '.asm');
} else {
    files = fs.readdirSync(path);
    const tmp = path.split('/');
    codeWriter = new CodeWriter(`${path}/${tmp[tmp.length - 1]}.asm`);
}
codeWriter.writeInit();
files.forEach(file => {
    if (!file.endsWith('.vm')) return;

    const tmp = file.split('/');
    let fileName = tmp[tmp.length - 1];
    fileName = fileName.substring(0, fileName.indexOf('.'));
    codeWriter.setFileName(fileName);
    const parser: Parser = new Parser(path + '/' + file);
    while (parser.advance()) {
        switch (parser.commandType()) {
            case CommandType.C_ARITHMETIC:
                codeWriter.writeArithmetic(parser.arg1());
                break;
            case CommandType.C_POP:
                codeWriter.writePop(parser.arg1(), parser.arg2());
                break;
            case CommandType.C_PUSH:
                codeWriter.writePush(parser.arg1(), parser.arg2());
                break;
            case CommandType.C_LABEL:
                codeWriter.writeLabel(parser.arg1());
                break;
            case CommandType.C_GOTO:
                codeWriter.writeGoto(parser.arg1());
                break;
            case CommandType.C_IF:
                codeWriter.writeIf(parser.arg1());
                break;
            case CommandType.C_FUNCTION:
                codeWriter.writeFunction(parser.arg1(), parser.arg2());
                break;
            case CommandType.C_RETURN:
                codeWriter.writeReturn();
                break;
            case CommandType.C_CALL:
                codeWriter.writeCall(parser.arg1(), parser.arg2());
                break;
        }
    }
});
codeWriter.close();