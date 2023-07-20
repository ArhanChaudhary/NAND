import fs, { WriteStream } from "fs";
import { NANDException } from "../core/exceptions";

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
    
    public writeArithmetic(command: string, sub: boolean = true): void {
        switch (command) {
            case '+':
                this.write('add');
                break;
            case '-':
                if (sub) {
                    this.write('sub');
                } else {
                    this.write('neg');
                }
                break;
            case '&':
                this.write('and');
                break;
            case '|':
                this.write('or');
                break;
            case '<':
                this.write('lt');
                break;
            case '>':
                this.write('gt');
                break;
            case '=':
                this.write('eq');
                break;
            case '~':
                this.write('not');
                break;
            case '*':
                this.writeCall('Math.multiply', 2);
                break;
            case '/':
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