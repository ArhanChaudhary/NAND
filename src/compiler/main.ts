import { BroadCompilerError, CompilerError } from "./exceptions";
import Engine from "./engine";

export default function compiler(
  inputFiles: Array<{ fileName: string; file: string[] }>,
  postValidation: false
): { fileName: string; VMCode: string[] }[];

export default function compiler(
  inputFiles: Array<{ fileName: string; file: string[] }>,
  postValidation: true
): { fileName: string; VMCode: string[] }[] | CompilerError;

export default function compiler(
  inputFiles: Array<{ fileName: string; file: string[] }>,
  postValidation: boolean
): { fileName: string; VMCode: string[] }[] | CompilerError {
  inputFiles.sort((a, b) => {
    if (a.fileName < b.fileName) return -1;
    if (a.fileName > b.fileName) return 1;
    return 0;
  });
  let out = new Array<{ fileName: string; VMCode: string[] }>();
  for (let fileData of inputFiles) {
    try {
      const engine = new Engine(fileData);
      engine.compileClass();
      out.push(engine.getOut());
    } catch (err: any) {
      Engine.cleanup();
      if (err instanceof CompilerError) {
        return err;
      }
      return new BroadCompilerError(
        "Main",
        `Compiler has crashed with an internal error (this is a bug):\n\n${err.toString()}`
      );
    }
  }
  if (postValidation) {
    let postValidationError = Engine.postValidation();
    Engine.cleanup();
    if (postValidationError !== null) {
      return postValidationError;
    }
  } else {
    Engine.cleanup();
  }
  return out;
}
