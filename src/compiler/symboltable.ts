import { NANDException } from "../core/exceptions";

type SymbolAttribute = {type: string, kind: string, index: number};
export default class SymbolTable {
    private classSymbolTable: { [name: string]: SymbolAttribute } = {};
    private subroutineSymbolTable: { [name: string]: SymbolAttribute } = {};
    private counts: { [name: string]: number } = {
        'static': 0,
        'field': 0,
        'argument': 0,
        'var': 0,
    };

    private getTable(kind: string) {
        switch (kind) {
            case 'static':
            case 'field':
                return this.classSymbolTable;
            case 'argument':
            case 'var':
                return this.subroutineSymbolTable;
            default:
                throw new NANDException("Invalid kind: "+ kind);
        }
    }

    public startSubroutine(): void {
        this.subroutineSymbolTable = {};
        this.counts.argument = 0;
        this.counts.var = 0;
    }

    public define(name: string, type: string, kind: string): void {
        this.getTable(kind)[name] = {type, kind, index: this.counts[kind]++};
    }

    public varCount(kind: string): number {
        return this.counts[kind] + 1;
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
        const symbolAttribute: SymbolAttribute | null = this.getSymbol(name);
        if (symbolAttribute === null)
            return null;
        return symbolAttribute.kind;
    }

    public typeOf(name: string): string | null {
        const symbolAttribute: SymbolAttribute | null = this.getSymbol(name);
        if (symbolAttribute === null)
            return null;
        return symbolAttribute.type;
    }

    public indexOf(name: string): number | null {
        const symbolAttribute: SymbolAttribute | null = this.getSymbol(name);
        if (symbolAttribute === null)
            return null;
        return symbolAttribute.index;
    }
}