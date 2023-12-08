import VMTranslator from "./main";
import fs from "fs";

let path = process.argv[process.argv.length - 1].replace(/\/$/, "");

let inputFiles: Array<{ fileName: string; file: string[] }>;
let outputFile: string;
if (path.endsWith(".vm")) {
  inputFiles = [
    {
      fileName: path.split("/").pop().replace(/\.vm$/, ""),
      file: fs.readFileSync(path, "utf-8").split("\n"),
    },
  ];
  outputFile = path.replace(/\.vm$/, ".asm");
} else {
  const files = fs
    .readdirSync(path)
    .filter((fileName: string) => fileName.endsWith(".vm"));
  inputFiles = files.map((fileName: string) => ({
    fileName: fileName.replace(/\.vm$/, ""),
    file: fs.readFileSync(`${path}/${fileName}`, "utf-8").split("\n"),
  }));
  outputFile = `${path}/${path.split("/").pop()}.asm`;
}

const out = VMTranslator(inputFiles);
fs.writeFileSync(outputFile, out.join("\n"));
