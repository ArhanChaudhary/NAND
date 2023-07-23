import fs, { WriteStream } from "fs";
import { NANDException } from "../core/exceptions";
import { SymbolToken } from "./tokenizer";

export default class VMWriter {
    private outputStream: WriteStream;

    constructor(file: string) {
        this.outputStream = fs.createWriteStream(file.substring(0, file.length - 5) + '.vm');
    }

    private firstWrite: boolean = true;
    public write(out: string): void {
        if (this.firstWrite)
            this.outputStream.write(out);
        else
            this.outputStream.write('\n' + out);
        this.firstWrite = false;
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
                this.write('add');
                break;
            case SymbolToken.SUBTRACT:
                if (sub) {
                    this.write('sub');
                } else {
                    this.write('neg');
                }
                break;
            case SymbolToken.AND:
                this.write('and');
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
                this.write('not');
                break;
            case SymbolToken.MULTIPLY:
                this.writeCall('Math.multiply', 2);
                break;
            case SymbolToken.DIVIDE:
                this.writeCall('Math.divide', 2);
                break;
            default:
                throw new NANDException();
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
    
    public close(): void {
        this.outputStream.close();
    }
}