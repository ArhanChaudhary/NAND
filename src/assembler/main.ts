import { Parser, CommandType } from "./parser";
import { Code } from "./code";
import { SymbolTable } from "./symboltable";
import fs from "fs";

const file = '../projects/06/rect/Rect.asm';

const symbolTable = new SymbolTable();
symbolTable.addEntry('SP', 0);
symbolTable.addEntry('LCL', 1);
symbolTable.addEntry('ARG', 2);
symbolTable.addEntry('THIS', 3);
symbolTable.addEntry('THAT', 4);
for (let r = 0; r < 16; r++) {
    symbolTable.addEntry(`R${r}`, r);
}
symbolTable.addEntry('SCREEN', 16384);
symbolTable.addEntry('KBD', 24576);
let parser: Parser = new Parser(file);
let ROMAddress: number = 0;
while (parser.advance()) {
    switch (parser.commandType()) {
        case CommandType.A_COMMAND:
        case CommandType.C_COMMAND:
            ROMAddress++;
            break;
        case CommandType.L_COMMAND:
            symbolTable.addEntry(parser.symbol(), ROMAddress);
            break;
    }
}

parser = new Parser(file);
const out: Array<string> = [];
let RAMAddress: number = 16;
while (parser.advance()) {
    switch (parser.commandType()) {
        case CommandType.A_COMMAND: {
            let raw: number;
            const symbol: string = parser.symbol();
            if (parser.AIsNumber()) {
                raw = +symbol;
            } else if (symbolTable.contains(symbol)) {
                // If already in table, then this is a ROM symbol (label)
                // or an already-added RAM symbol
                raw = symbolTable.getAddress(symbol);
            } else {
                // If not, this represents a new variable in the RAM
                raw = RAMAddress;
                symbolTable.addEntry(symbol, RAMAddress++);
            }
            out.push(`0${
                ('0000000000000000' + raw.toString(2)).slice(-15)
            }`);
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