import assembler, { BaseAssemblerError } from "./main";
import fs from "node:fs";

let path = process.argv[process.argv.length - 1].replace(/\/$/, "");

if (!path.endsWith(".asm")) {
  path = `${path}/${path.split("/").pop()}.asm`;
}

const inputFile = fs.readFileSync(path, "utf-8").split("\n");
const outputFile = path.replace(/\.asm$/, ".hack");
const out = assembler(inputFile);
if (out instanceof BaseAssemblerError) {
  throw out;
}
fs.writeFileSync(outputFile, out.join("\n"));
