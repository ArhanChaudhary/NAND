import { KeywordToken } from "./tokenizer";

type SymbolAttribute = { type: string; kind: string; index: number };
export default class SymbolTable {
  private classSymbolTable: { [name: string]: SymbolAttribute } = {};
  private subroutineSymbolTable: { [name: string]: SymbolAttribute } = {};
  private counts: { [name: string]: number } = {
    static: 0,
    this: 0,
    argument: 0,
    local: 0,
  };

  public startSubroutine(subroutineType: string): void {
    this.subroutineSymbolTable = {};
    switch (subroutineType) {
      case KeywordToken.CONSTRUCTOR:
      case KeywordToken.FUNCTION:
        this.counts.argument = 0;
        break;
      case KeywordToken.METHOD:
        this.counts.argument = 1;
        break;
      default:
        throw new Error(`Invalid subroutine type: ${subroutineType}`);
    }
    this.counts.local = 0;
  }

  public define(name: string, type: string, kind: string): boolean {
    let table: { [name: string]: SymbolAttribute };
    switch (kind) {
      case "static":
      case "this":
        table = this.classSymbolTable;
        break;
      case "argument":
      case "local":
        table = this.subroutineSymbolTable;
        break;
      default:
        throw new Error(`Invalid kind: ${kind}`);
    }
    if (name in table) return false;
    table[name] = { type, kind, index: this.counts[kind]++ };
    return true;
  }

  public count(kind: string): number {
    return this.counts[kind];
  }

  private getSymbol(name: string): SymbolAttribute | null {
    if (name in this.subroutineSymbolTable) {
      return this.subroutineSymbolTable[name];
    }
    if (name in this.classSymbolTable) {
      return this.classSymbolTable[name];
    }
    return null;
  }

  public kindOf(name: string): string | null {
    const symbolAttribute = this.getSymbol(name);
    if (symbolAttribute === null) return null;
    return symbolAttribute.kind;
  }

  public typeOf(name: string): string | null {
    const symbolAttribute = this.getSymbol(name);
    if (symbolAttribute === null) return null;
    return symbolAttribute.type;
  }

  public indexOf(name: string): number | null {
    const symbolAttribute = this.getSymbol(name);
    if (symbolAttribute === null) return null;
    return symbolAttribute.index;
  }
}
