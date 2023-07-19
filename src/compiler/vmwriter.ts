import fs, { WriteStream } from "fs";

export default class VMWriter {
    private outputStream: WriteStream;

    constructor(file: string) {
        this.outputStream = fs.createWriteStream(file.substring(0, file.length - 5) + '.xml');
    }

    private firstWrite: boolean = true;
    public write(out: string): void {
        if (this.firstWrite)
            this.outputStream.write(out);
        else
            this.outputStream.write('\n' + out);
        this.firstWrite = false;
    }

    public writePush(segment: string, index: number): void {
        this.write(`push ${segment} ${index}`);
    }
    
    public writePop(segment: string, index: number): void {
        this.write(`pop ${segment} ${index}`);
    }
    
    public writeArithmetic(command: string): void {
        this.write(command);
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