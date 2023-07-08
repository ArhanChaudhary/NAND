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
        case CommandType.C_PUSH:   
            break;    
    }
}
codeWriter.close();