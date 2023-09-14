import { SymbolToken } from "./tokenizer";

export default class VMWriter {
    private out: string[] = [];

    public write(out: string): void {
        this.out.push(out);
    }

    public getOut(): string[] {
        return this.out;
    }

    public writePush(segment: string, index: number | string): void {
        this.write(`push ${segment} ${index}`);
    }
    
    public writePop(segment: string, index: number): void {
        this.write(`pop ${segment} ${index}`);
    }
    
    public writeArithmetic(command: SymbolToken, sub: boolean = true): void {
        switch (command) {
            case SymbolToken.ADD:
                if (this.out[this.out.length - 1] === 'push constant 0') {
                    this.out.pop();
                } else if (this.out[this.out.length - 2] === 'push constant 0') {
                    const temp = this.out.pop();
                    this.out.pop();
                    this.write(temp);
                } else {
                    this.write('add');
                }
                break;
            case SymbolToken.SUBTRACT:
                if (sub) {
                    if (this.out[this.out.length - 1] === 'push constant 0') {
                        this.out.pop();
                    } else {
                        this.write('sub');
                    }
                } else {
                    if (this.out[this.out.length - 1] === 'neg') {
                        this.out.pop();
                    } else {
                        this.write('neg');
                    }
                }
                break;
            case SymbolToken.AND:
                if (this.out[this.out.length - 1] === 'push constant 0') {
                    const temp = this.out.pop();
                    this.out.pop();
                    this.write(temp);
                } else if (this.out[this.out.length - 2] === 'push constant 0') {
                    this.out.pop();
                } else {
                    this.write('and');
                }
                break;
            case SymbolToken.OR:
                this.write('or');
                break;
            case SymbolToken.LESS_THAN:
                this.write('lt');
                break;
            case SymbolToken.GREATER_THAN:
                this.write('gt');
                break;
            case SymbolToken.EQUAL:
                this.write('eq');
                break;
            case SymbolToken.NOT:
                if (this.out[this.out.length - 1] === 'not') {
                    this.out.pop();
                } else {
                    this.write('not');
                }
                break;
            case SymbolToken.MULTIPLY:
                this.writeCall('Math.multiply', 2);
                break;
            case SymbolToken.DIVIDE:
                this.writeCall('Math.divide', 2);
                break;
            default:
                throw new Error("Invalid command arithmetic: " + command);
        };
    }
    
    public writeLabel(label: string): void {
        this.write(`label ${label}`);
    }
    
    public writeGoto(label: string): void {
        this.write(`goto ${label}`);
    }
    
    public writeIf(label: string): void {
        this.write(`if-goto ${label}`);
    }
    
    public writeCall(name: string, nArgs: number): void {
        this.write(`call ${name} ${nArgs}`);
    }
    
    public writeFunction(name: string, nLocals: number): void {
        this.write(`function ${name} ${nLocals}`);
    }
    
    public writeReturn(): void {
        this.write('return');
    }
}