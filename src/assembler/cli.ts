import assembler from "./main";
import fs from "fs";

let path = process.argv[process.argv.length - 1].replace(/\/$/, "");

if (!path.endsWith(".asm")) {
  path = `${path}/${path.split("/").pop()}.asm`;
}

const inputFile = fs.readFileSync(path, "utf-8").split("\n");
const outputFile = path.replace(/\.asm$/, ".hack");
const out = assembler(inputFile);
fs.writeFileSync(outputFile, out.join("\n"));