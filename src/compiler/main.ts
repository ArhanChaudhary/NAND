import { CompilerError } from "./exceptions";
import Engine from "./engine";

export default function compiler(
  inputFiles: Array<{ fileName: string; file: string[] }>
): Array<{ fileName: string; VMCode: string[] }> | CompilerError {
  let out: Array<{ fileName: string; VMCode: string[] }> = [];
  for (let fileData of inputFiles) {
    try {
      const engine = new Engine(fileData);
      engine.compileClass();
      out.push(engine.getOut());
    } catch (err: any) {
      Engine.cleanup();
      return err as CompilerError;
    }
  }
  let postValidationError = Engine.postValidation();
  Engine.cleanup();
  if (postValidationError === null) {
    return out;
  } else {
    return postValidationError;
  }
}
