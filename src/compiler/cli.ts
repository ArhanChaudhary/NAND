import compiler from "./main";
import fs from "fs";

let path = process.argv[process.argv.length - 1].replace(/\/$/, "");

let inputFiles: Array<{ fileName: string; file: string[] }>;
if (path.endsWith(".jack")) {
  inputFiles = [
    {
      fileName: path
        .split("/")
        .pop()
        .replace(/\.jack$/, ""),
      file: fs.readFileSync(path, "utf-8").split("\n"),
    },
  ];
} else {
  const files = fs
    .readdirSync(path)
    .filter((fileName: string) => fileName.endsWith(".jack"));
  inputFiles = files.map((fileName: string) => ({
    fileName: fileName.replace(/\.jack$/, ""),
    file: fs.readFileSync(`${path}/${fileName}`, "utf-8").split("\n"),
  }));
}

const out = compiler(inputFiles);
out.forEach((fileData) => {
  let outputFile: string;
  if (path.endsWith(".jack")) {
    outputFile = path.replace(/\.jack$/, ".vm");
  } else {
    outputFile = `${path}/${fileData.fileName}.vm`;
  }
  fs.writeFileSync(outputFile, fileData.file.join("\n"));
});
