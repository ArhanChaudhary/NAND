import VMTranslator from "./main";
import fs from "fs";

let path = process.argv[process.argv.length - 1].replace(/\/$/, "");

let VMCodes: { fileName: string; VMCode: string[] }[];
let outputFile: string;
if (path.endsWith(".vm")) {
  VMCodes = [
    {
      fileName: path.split("/").pop()!.replace(/\.vm$/, ""),
      VMCode: fs.readFileSync(path, "utf-8").split("\n"),
    },
  ];
  outputFile = path.replace(/\.vm$/, ".asm");
} else {
  const files = fs
    .readdirSync(path)
    .filter((fileName: string) => fileName.endsWith(".vm"));
  VMCodes = files.map((fileName: string) => ({
    fileName: fileName.replace(/\.vm$/, ""),
    VMCode: fs.readFileSync(`${path}/${fileName}`, "utf-8").split("\n"),
  }));
  outputFile = `${path}/${path.split("/").pop()}.asm`;
}

const out = VMTranslator(VMCodes);
fs.writeFileSync(outputFile, out.join("\n"));
