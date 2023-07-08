import fs, { WriteStream } from 'fs';
import NANDException from '../core/exceptions';

export default class CodeWriter {
    private fileStream: WriteStream;

    constructor(file: string) {
        this.fileStream = fs.createWriteStream(file.replace(".vm", ".asm"));
    }

    public writeArithmetic(command: string): void {
        
        let out: Array<string>;
        switch (command) {
            case 'add':
                // sp = sp - 1, ram[sp - 1] = ram[sp - 1] + ram[sp], M=M+D
                out = [
                    '@SP',
                    'AM=M-1',
                    'D=A',
                    'A=A-1',
                    'M=M+D',
                ]
                break;
            default:
                throw new NANDException("Invalid vm command: " + command);
        }
        this.fileStream.write(out.join('\n'));
    }

    public writePushPop(command: string, segment: string, index: number): void {

    }

    public close(): void {
        this.fileStream.close();
    }
}