// TODO: If the program’s argument is a directory name rather than a file name, the main program should process all the .vm files in this directory. In doing so, it should use a separate Parser for handling each input file and a single CodeWriter for handling the output.
import CodeWriter from "./codewriter";
import Parser, { CommandType } from "./parser";

const file = process.argv[process.argv.length - 1];

const parser: Parser = new Parser(file);
const codeWriter: CodeWriter = new CodeWriter(file);
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
codeWriter.close();