export default class SymbolTable {
    private symbolTable: { [symbol: string]: number };
    
    constructor() {
        this.symbolTable = {};
    }

    public addEntry(symbol: string, address: number): void {
        this.symbolTable[symbol] = address;
    }

    public contains(symbol: string): boolean {
        return symbol in this.symbolTable;
    }

    public getAddress(symbol: string): number {
        return this.symbolTable[symbol];
    }
}