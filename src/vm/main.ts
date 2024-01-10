import CodeWriter from "./codewriter";
import Parser, { CommandType } from "./parser";

export default function VMTranslator(
  inputFiles: Array<{ fileName: string; VMCode: string[] }>
): string[] {
  const codeWriter = new CodeWriter();
  codeWriter.writeInit();
  inputFiles.forEach((fileData) => {
    codeWriter.setFileName(fileData.fileName);
    const parser: Parser = new Parser(fileData.VMCode);
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
  return codeWriter.getOut();
}
