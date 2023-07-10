import fs, { WriteStream } from 'fs';
import NANDException from '../core/exceptions';
import { CommandType } from './parser';

export default class CodeWriter {
    private fileStream: WriteStream;
    private fileName: string;
    static labelCount: number = 0;

    constructor(file: string) {
        const tmp = file.split('/');
        this.fileName = tmp[tmp.length - 1];
        this.fileName = this.fileName.substring(0, this.fileName.indexOf('.'));
        this.fileStream = fs.createWriteStream(file.replace(".vm", ".asm"));
        // this.writeInit();
    }
    
    // private writeInit(): void {
    //     bootstrap code
    //     this.fileStream.write('// sp init\n@256\nD=A\n@SP\nM=D\n\n');
    //     // call sys init
    // }

    public writeLabel(label: string): void {

    }

    public writeGoto(label: string): void {

    }

    public writeIf(label: string): void {

    }

    public writeCall(functionName: string, numArgs: number): void {

    }

    public writeReturn(): void {

    }

    public writeFunction(functionName: string, numLocals: number) {

    }

    static branchCommandMap: { [command: string]: string } = {
        'eq': 'JNE',
        'gt': 'JLE',
        'lt': 'JGE',
    }

    public writeArithmetic(command: string): void {
        let out: Array<string>;
        switch (command) {
            case 'add':
                out = [
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M+D',
                ];
                break;
            case 'sub':
                out = [
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M-D',
                ];
                break;
            case 'neg':
                out = [
                    '@SP',
                    'A=M-1',
                    'M=-M',
                ];
                break;
            case 'eq':
            case 'gt':
            case 'lt':
                out = [
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'D=M-D',
                    'M=0',
                    '@FALSE_' + CodeWriter.labelCount,
                    'D;' + CodeWriter.branchCommandMap[command],
                    '@SP',
                    'A=M-1',
                    'M=-1',
                    '(FALSE_' + CodeWriter.labelCount++ + ')',
                ];
                break;
            case 'and':
                out = [
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M&D',
                ];
                break;
            case 'or':
                out = [
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M|D',
                ];
                break;
            case 'not':
                out = [
                    '@SP',
                    'A=M-1',
                    'M=!M',
                ];
                break;
            default:
                throw new NANDException("Invalid vm command: " + command);
        }
        this.fileStream.write(`// ${command}\n${out.join('\n')}\n\n`);
    }

    static segmentMemoryMap: { [segment: string]: string } = {
        'local': '@LCL',
        'argument': '@ARG',
        'this': '@THIS',
        'that': '@THAT',
        'pointer': '@3',
        'temp': '@5',
    }

    public writePush(segment: string, index: number): void {
        let out: Array<string> = [`// push ${segment} ${index}`];
            switch (segment) {
                // sets D to the value that needs to be pushed
                case 'constant':
                out.push(...[
                        '@' + index,
                        'D=A',
                ]);
                    break;
                case 'local':
                case 'argument':
                case 'this':
                case 'that':
                out.push(...[
                        CodeWriter.segmentMemoryMap[segment],
                        'D=M',
                        '@' + index,
                        'A=A+D',
                        'D=M',
                ]);
                    break;
                case 'pointer':
                case 'temp':
                out.push(...[
                        CodeWriter.segmentMemoryMap[segment],
                        'D=A',
                        '@' + index,
                        'A=A+D',
                        'D=M',
                ]);
                    break;
                case 'static':
                out.push(...[
                        `@${this.fileName}.${index}`,
                        'D=M',
                ]);
                    break;
                default:
                throw new NANDException(`Invalid vm command segment: push ${segment} ${index}`);
            }
            out.push(...[
                '@SP',
                'AM=M+1',
                'A=A-1',
                'M=D',
            ]);
        this.fileStream.write(`${out.join('\n')}\n\n`);
    }

    public writePop(segment: string, index: number): void {
        let out: Array<string> = [`// pop ${segment} ${index}`];
            switch (segment) {
                // sets D to the RAM index dest
                case 'local':
                case 'argument':
                case 'this':
                case 'that':
                out.push(...[
                        '@' + index,
                        'D=A',
                        CodeWriter.segmentMemoryMap[segment],
                        'D=D+M',
                ]);
                    break;
                case 'pointer':
                case 'temp':
                out.push(...[
                        '@' + index,
                        'D=A',
                        CodeWriter.segmentMemoryMap[segment],
                        'D=D+A',
                ]);
                    break;
                case 'static':
                out.push(...[
                        `@${this.fileName}.${index}`,
                        'D=A',
                ]);
                    break;
                default:
                throw new NANDException(`Invalid vm command segment: pop ${segment} ${index}`);
            }
            out.push(...[
                // stores RAM index dest in R13
                '@R13',
                'M=D',

                // pops stack and stores it in D
                '@SP',
                'AM=M-1',
                'D=M',

                // store D in the address of the value of R13
                '@R13',
                'A=M',
                'M=D',
            ]);
        this.fileStream.write(`${out.join('\n')}\n\n`);
    }

    public close(): void {
        this.fileStream.close();
    }
}