import Engine from "./engine";

export default function compiler(
  inputFiles: Array<{ fileName: string; file: string[] }>
): Array<{ fileName: string; VMCode: string[] }> | string {
  let out: Array<{ fileName: string; VMCode: string[] }> = [];
  for (let fileData of inputFiles) {
    try {
      const engine = new Engine(fileData);
      engine.compileClass();
      out.push(engine.getOut());
    } catch (err: any) {
      return err.toString();
    }
  }
  // Engine.postValidation();
  return out;
}
