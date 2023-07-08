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
                '(FALSE_' + CodeWriter.labelCount + ')',
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
                '(FALSE_' + CodeWriter.labelCount + ')',
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
                '(FALSE_' + CodeWriter.labelCount + ')',
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
        if (['eq', 'gt', 'lt'].includes(command)) {
            CodeWriter.labelCount++;
        }
        this.fileStream.write(`// ${command}\n${out.join('\n')}\n\n`);
    }

    public writePushPop(command: CommandType, segment: string, index: number): void {
        let out: Array<string> | undefined;
        if (CommandType.C_PUSH) {
            out = {
                'constant': [
                    '@' + index,
                    'D=A',
                ],
                'local': [
                    '@LCL',
                ],
                'argument': [
                    '@ARG',
                ],
                'this': [
                    '@THIS',
                ],
                'that': [
                    '@THAT',
                ],
            }[segment];
            if (out === undefined)
                throw new NANDException("Invalid vm command segment: " + command);
            if (['local', 'argument', 'this', 'that'].includes(segment)) {
                out.push(...[
                    'D=M',
                    '@' + index,
                    'A=A+D',
                    'D=M',
                ]);
            }
            out.push(...[
                '@SP',
                'AM=M+1',
                'A=A-1',
                'M=D',
            ]);
        } else if (CommandType.C_POP) {
            out = {
                'local': [
                    '@LCL',
                ],
                'argument': [
                    '@ARG',
                ],
                'this': [
                    '@THIS',
                ],
                'that': [
                    '@THAT',
                ],
            }[segment];
            if (out === undefined)
                throw new NANDException("Invalid vm command segment: " + command);
            if (['local', 'argument', 'this', 'that'].includes(segment)) {
                out = [
                    // stores RAM index dest in R13
                    '@' + index,
                    'D=A',
                    out[0],
                    'D=D+M',
                    '@R13',
                    'M=D',

                    // pops stack and stores it in D
                    '@SP',
                    'MA=M-1',
                    'D=M',

                    // store D in the address of the value of R13
                    '@R13',
                    'A=M',
                    'M=D',
                ];
            }
        } else {
            throw new NANDException("Invalid vm command type: " + command);
        }
        this.fileStream.write(`// ${command === CommandType.C_PUSH ? 'push' : 'pop'} ${segment} ${index}\n${out.join('\n')}\n\n`);
    }

    public close(): void {
        this.fileStream.close();
    }
}