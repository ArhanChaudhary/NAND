import { BroadCompilerError } from "../compiler/exceptions";
import CodeWriter from "./codewriter";
import Parser, { CommandType } from "./parser";

export class VMTranslatorError extends BroadCompilerError {
  constructor(message: string) {
    super("", message);
  }
}

export default function VMTranslator(
  VMCodes: Array<{ fileName: string; VMCode: string[] }>
): string[] | VMTranslatorError {
  VMCodes.sort((a, b) => {
    if (a.fileName < b.fileName) return -1;
    if (a.fileName > b.fileName) return 1;
    return 0;
  });
  const codeWriter = new CodeWriter();
  codeWriter.writeInit();
  for (const VMCode of VMCodes) {
    codeWriter.setFileName(VMCode.fileName);
    const parser = new Parser(VMCode.VMCode);
    while (parser.advance()) {
      try {
        switch (parser.commandType()) {
          case CommandType.C_ARITHMETIC:
            codeWriter.writeArithmetic(parser.arg1());
            break;
          case CommandType.C_POP:
            codeWriter.writePop(parser.arg1(), parser.arg2());
            break;
          case CommandType.C_PUSH:
            codeWriter.writePush(parser.arg1(), parser.arg2(), true);
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
            codeWriter.writeCall(parser.arg1(), parser.arg2(), true);
            break;
        }
      } catch (err: any) {
        if (err instanceof VMTranslatorError) {
          return err;
        }
        return new VMTranslatorError(
          `VM translator has crashed with an internal error (this is a bug):\n\n${err.toString()}`
        );
      }
    }
  }
  return codeWriter.getOut();
}
