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
            codeWriter.writePushPop(CommandType.C_POP, parser.arg1(), parser.arg2());
            break;
        case CommandType.C_PUSH:
            codeWriter.writePushPop(CommandType.C_PUSH, parser.arg1(), parser.arg2());
            break;
    }
}
codeWriter.close();