import Parser, { CommandType } from "./parser";
import Code from "./code";
import SymbolTable from "./symboltable";
import { BroadCompilerError } from "../compiler/exceptions";

export class BaseAssemblerError extends BroadCompilerError {}

export class AssemblerError extends BaseAssemblerError {
  constructor(message: string) {
    super("", message);
  }
}

class ProgramTooBigError extends BaseAssemblerError {
  constructor(length: number) {
    super(
      "Main",
      `Program of ROM length ${length} > 32767 too large to load into memory`
    );
  }
}

export default function assembler(
  inputStream: string[]
): string[] | BaseAssemblerError {
  const symbolTable = new SymbolTable();
  symbolTable.addEntry("SP", 0);
  symbolTable.addEntry("LCL", 1);
  symbolTable.addEntry("ARG", 2);
  symbolTable.addEntry("THIS", 3);
  symbolTable.addEntry("THAT", 4);
  for (let r = 0; r < 16; r++) {
    symbolTable.addEntry(`R${r}`, r);
  }
  symbolTable.addEntry("SCREEN", 16384);
  symbolTable.addEntry("KBD", 24576);
  let parser = new Parser(inputStream);
  let ROMAddress = 0;
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

  parser = new Parser(inputStream);
  const out = new Array<string>();
  let RAMAddress = 16;
  while (parser.advance()) {
    switch (parser.commandType()) {
      case CommandType.A_COMMAND: {
        let raw: number;
        const symbol = parser.symbol();
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
        out.push(`0${`0000000000000000${raw.toString(2)}`.slice(-15)}`);
        break;
      }
      case CommandType.C_COMMAND: {
        try {
          out.push(
            `111${Code.comp(parser.comp())}${Code.dest(
              parser.dest()
            )}${Code.jump(parser.jump())}`
          );
        } catch (err: any) {
          if (err instanceof AssemblerError) {
            return err;
          }
          return new AssemblerError(
            `VM translator has crashed with an internal error (this is a bug):\n\n${err.toString()}`
          );
        }
        break;
      }
    }
  }
  if (out.length > 32768) {
    return new ProgramTooBigError(out.length);
  }
  return out;
}
