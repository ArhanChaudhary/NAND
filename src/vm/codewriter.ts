import fs, { WriteStream } from 'fs';
import NANDException from '../core/exceptions';

export default class CodeWriter {
    private fileStream: WriteStream;
    static labelCount: number = 0;

    constructor(file: string) {
        this.fileStream = fs.createWriteStream(file.replace(".vm", ".asm"));
    }

    public writeArithmetic(command: string): void {
        
        const out: Array<string> | undefined = {
            'add': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M+D',
            ],
            'sub': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M-D',
            ],
            'neg': [
                '@SP',
                'A=M-1',
                'M=-M',
            ],
            'eq': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'D=M-D',
                'M=0',
                '@FALSE_' + CodeWriter.labelCount,
                'D;JNE',
                '@SP',
                'A=M-1',
                'M=-1',
                '(FALSE_' + CodeWriter.labelCount++ + ')',
            ],
            'gt': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'D=M-D',
                'M=0',
                '@FALSE_' + CodeWriter.labelCount,
                'D;JLE',
                '@SP',
                'A=M-1',
                'M=-1',
                '(FALSE_' + CodeWriter.labelCount++ + ')',
            ],
            'lt': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'D=M-D',
                'M=0',
                '@FALSE_' + CodeWriter.labelCount,
                'D;JGE',
                '@SP',
                'A=M-1',
                'M=-1',
                '(FALSE_' + CodeWriter.labelCount++ + ')',
            ],
            'and': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M&D',
            ],
            'or': [
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M|D',
            ],
            'not': [
                '@SP',
                'A=M-1',
                'M=!M',
            ],
        }[command];
        if (out === undefined)
            throw new NANDException("Invalid vm command: " + command);
        this.fileStream.write(out.join('\n'));
    }

    public writePushPop(command: string, segment: string, index: number): void {

    }

    public close(): void {
        this.fileStream.close();
    }
}