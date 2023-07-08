import fs, { WriteStream } from 'fs';
import NANDException from '../core/exceptions';
import { CommandType } from './parser';

export default class CodeWriter {
    private fileStream: WriteStream;
    static labelCount: number = 0;

    constructor(file: string) {
        this.fileStream = fs.createWriteStream(file.replace(".vm", ".asm"));
    }

    public writeArithmetic(command: string): void {
        
        const out: Array<string> | undefined = {
            'add': [
                '// add',
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M+D',
            ],
            'sub': [
                '// sub',
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M-D',
            ],
            'neg': [
                '// neg',
                '@SP',
                'A=M-1',
                'M=-M',
            ],
            'eq': [
                '// eq',
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
                '(FALSE_' + CodeWriter.labelCount + ')',
            ],
            'gt': [
                '// gt',
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
                '(FALSE_' + CodeWriter.labelCount + ')',
            ],
            'lt': [
                '// lt',
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
                '(FALSE_' + CodeWriter.labelCount + ')',
            ],
            'and': [
                '// and',
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M&D',
            ],
            'or': [
                '// or',
                '@SP',
                'AM=M-1',
                'D=M',
                'A=A-1',
                'M=M|D',
            ],
            'not': [
                '// not',
                '@SP',
                'A=M-1',
                'M=!M',
            ],
        }[command];
        if (out === undefined)
            throw new NANDException("Invalid vm command: " + command);
        if (['eq', 'gt', 'lt'].includes(command)) {
            CodeWriter.labelCount++;
        }
        this.fileStream.write(out.join('\n') + '\n\n');
    }

    public writePushPop(command: CommandType, segment: string, index: number): void {
        let out: Array<string>;
        switch (command) {
            case CommandType.C_PUSH:
                switch (segment) {
                    case 'constant':
                        out = [
                            '// push constant ' + index,
                            '@' + index,
                            'D=A',
                            '@SP',
                            'AM=M+1',
                            'A=A-1',
                            'M=D',
                        ];
                        break;
                    default:
                        throw new NANDException("Invalid vm command segment: " + command);
                }
                break;
            default:
                throw new NANDException("Invalid vm command type: " + command);
        }
        this.fileStream.write(out.join('\n') + '\n\n');
    }

    public close(): void {
        this.fileStream.close();
    }
}