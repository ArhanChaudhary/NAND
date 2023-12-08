import Engine from "./engine";

export default function compiler(
  inputFiles: Array<{ fileName: string; file: string[] }>
): Array<{ fileName: string; file: string[] }> {
  let out: Array<{ fileName: string; file: string[] }> = [];
  inputFiles.forEach((fileData) => {
    try {
      const engine = new Engine(fileData);
      engine.compileClass();
      out.push(engine.getOut());
    } catch (err: any) {
      console.log(err.toString());
    }
  });
  // Engine.postValidation();
  return out;
}
