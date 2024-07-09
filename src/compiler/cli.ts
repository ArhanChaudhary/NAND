import { CompilerError } from "./exceptions";
import compiler from "./main";
import fs from "fs";

let path = process.argv[process.argv.length - 1].replace(/\/$/, "");

let inputFiles: Array<{ fileName: string; file: string[] }>;
if (path.endsWith(".jack")) {
  inputFiles = [
    {
      fileName: path
        .split("/")
        .pop()!
        .replace(/\.jack$/, ""),
      file: fs.readFileSync(path, "utf-8").split("\n"),
    },
  ];
} else {
  const JackOS = fs
    .readdirSync("os")
    .filter((OSFileName: string) => OSFileName.endsWith(".jack"))
    .map((OSFileName: string) => `os/${OSFileName}`);
  const inputFileNames = fs
    .readdirSync(path)
    .filter((fileName: string) => fileName.endsWith(".jack"))
    .map((fileName: string) => `${path}/${fileName}`);
  inputFiles = inputFileNames
    .concat(
      JackOS.filter(
        (OSFileName: string) =>
          !inputFileNames.find(
            (inputFileName: string) =>
              inputFileName.split("/").pop() === OSFileName.split("/").pop()
          )
      )
    )
    .map((fileName: string) => ({
      fileName: fileName
        .split("/")
        .pop()!
        .replace(/\.jack$/, ""),
      file: fs.readFileSync(fileName, "utf-8").split("\n") as string[],
    }));
}

const out = compiler(inputFiles, true);
if (out instanceof CompilerError) {
  console.error(out.toString());
} else {
  out.forEach((fileData) => {
    let outputFile: string;
    if (path.endsWith(".jack")) {
      outputFile = path.replace(/\.jack$/, ".vm");
    } else {
      outputFile = `${path}/${fileData.fileName}.vm`;
    }
    fs.writeFileSync(outputFile, fileData.VMCode.join("\n"));
  });
}
