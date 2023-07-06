import { Parser, CommandType } from "./parser";
import { Code } from "./code";
import fs from "fs";

const file = '../projects/06/rect/RectL.asm';

const parser = new Parser(file);
const out: Array<string> = [];
while (parser.advance()) {
    switch (parser.commandType()) {
        case CommandType.A_COMMAND: {
            const bin = (+parser.symbol()).toString(2);
            out.push('0' + ('0000000000000000' + bin).slice(-15));
            break;
        }
        case CommandType.C_COMMAND: {
            out.push(`111${
                Code.comp(parser.comp())
            }${
                Code.dest(parser.dest())
            }${
                Code.jump(parser.jump())
            }`);
            break;
        }
    }
}
fs.writeFileSync(file.replace(".asm", ".hack"), out.join('\n'));