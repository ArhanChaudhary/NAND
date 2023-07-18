import fs, { WriteStream } from 'fs';
import { NANDException } from '../core/exceptions';

export default class CodeWriter {
    private fileStream: WriteStream;
    private fileName: string = '';
    private currentFunction: string = '';
    static labelCount: number = 0;

    constructor(file: string) {
        this.fileStream = fs.createWriteStream(file);
    }

    // needed for segregating a static segment for each vm file
    public setFileName(file: string) {
        this.fileName = file;
    }

    private firstWrite: boolean = true;
    private write(out: string[]): void {
        if (this.firstWrite)
            this.fileStream.write(out.join('\n'));
        else
            this.fileStream.write('\n' + out.join('\n'));
        this.firstWrite = false;            
    }
    
    public writeInit(): void {
        this.write([
            '@256 // init',
            'D=A',
            '@SP',
            'M=D',
            '@AFTER_SETUP',
            '0;JMP',

            '(DO_RETURN) // return',
            // store LCL-1 (where the stored THAT is) in R14
            '@LCL',
            'D=M-1',
            '@R13',
            'M=D',

            // store return address in R15
            // NOTE: this is necessary because methods without arguments
            // have ARG pointed at the return value address, meaning it
            // will be overriden. (i had to find that out the hard way :V)
            '@4',
            'A=D-A',
            'D=M',
            '@R14',
            'M=D',

            // store the returned word at ARG[0]
            '@SP',
            'A=M-1',
            'D=M',
            '@ARG',
            'A=M',
            'M=D',

            // restore sp
            'D=A',
            '@SP',
            'M=D+1',

            // restore that
            '@R13',
            'A=M',
            'D=M',
            '@THAT',
            'M=D',

            // restore this
            '@R13',
            'AM=M-1',
            'D=M',
            '@THIS',
            'M=D',

            // restore arg
            '@R13',
            'AM=M-1',
            'D=M',
            '@ARG',
            'M=D',

            // restore lcl
            '@R13',
            'A=M-1',
            'D=M',
            '@LCL',
            'M=D',
            
            // goto ret
            '@R14',
            'A=M',
            '0;JMP',

            '(DO_CALL) // push state and goto functionName',
            // push return address
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',

            // push lcl
            '@LCL',
            'D=M',
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',

            // push arg
            '@ARG',
            'D=M',
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',

            // push this
            '@THIS',
            'D=M',
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',

            // push that
            '@THAT',
            'D=M',
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',

            // reposition lcl and store SP in D
            '@SP',
            'D=M',
            '@LCL',
            'M=D',

            // load numArgs into A
            '@R14',
            'A=M',

            // arg = SP - numArgs - 5
            'D=D-A',
            '@5',
            'D=D-A',
            '@ARG',
            'M=D',

            // goto R13 (functionName)
            '@R13',
            'A=M',
            '0;JMP',

            '(DO_LT) // lt',
            '@R15',
            'M=D',
            // lt logic
            '@SP',
            'AM=M-1',
            'D=M',
            'A=A-1',
            'D=M-D',
            'M=0',
            '@LT_FALSE',
            'D;JGE',
            '@SP',
            'A=M-1',
            'M=-1',
            '(LT_FALSE)',

            // goto R15
            '@R15',
            'A=M',
            '0;JMP',

            '(DO_EQ) // eq',
            '@R15',
            'M=D',
            // eq logic
            '@SP',
            'AM=M-1',
            'D=M',
            'A=A-1',
            'D=M-D',
            'M=0',
            '@EQ_FALSE',
            'D;JNE',
            '@SP',
            'A=M-1',
            'M=-1',
            '(EQ_FALSE)',

            // goto R15
            '@R15',
            'A=M',
            '0;JMP',

            '(DO_GT) // gt',
            '@R15',
            'M=D',
            // gt logic
            '@SP',
            'AM=M-1',
            'D=M',
            'A=A-1',
            'D=M-D',
            'M=0',
            '@GT_FALSE',
            'D;JLE',
            '@SP',
            'A=M-1',
            'M=-1',
            '(GT_FALSE)',

            // goto R15
            '@R15',
            'A=M',
            '0;JMP',

            '(AFTER_SETUP)',
        ]);
        this.writeCall('Sys.init', 0);
    }

    public writeLabel(label: string): void {
        this.write([
            `(${this.currentFunction}$${label}) // label ${label}`
        ]);
    }

    public writeGoto(label: string): void {
        this.write([
            `@${this.currentFunction}$${label} // goto ${label}`,
            '0;JMP'
        ]);
    }

    public writeIf(label: string): void {
        this.write([
            `@SP // if-goto ${label}`,
            'AM=M-1',
            'D=M',
            `@${this.currentFunction}$${label}`,
            'D;JNE',
        ]);
    }

    public writeCall(functionName: string, numArgs: number): void {
        const out: string[] = [
            // save functionName rom address in R13
            `@${functionName} // call ${functionName} ${numArgs}`,
            'D=A',
            '@R13',
            'M=D',
        ];
        // save numArgs in R14
        if (numArgs === 0 || numArgs === 1) {
            out.push(...[
                '@R14',
                'M=' + numArgs,
            ]);
        } else {
            out.push(...[
                '@' + numArgs,
                'D=A',
                '@R14',
                'M=D',
            ]);
        }
        out.push(...[
            // do call
            '@CALL_RETURN_ADDR' + CodeWriter.labelCount,
            'D=A',
            '@DO_CALL',
            '0;JMP',
            `(CALL_RETURN_ADDR${CodeWriter.labelCount++})`,
        ]);
        this.write(out);
    }

    public writeReturn(): void {
        this.write([
            '@DO_RETURN // return',
            '0;JMP',
        ]);
    }

    public writeFunction(functionName: string, numLocals: number): void {
        // this could possibly lead to an issue where procedural code after
        // a function is still given the function label. However, this doesn't
        // seem to be possible or at least of issue in NAND's implementation.
        // Sys.init calls everything as functions, and it itself won't have
        // any complicated return logic, so for now let's ignore but be aware
        // of it
        this.currentFunction = functionName;

        const out: string[] = [
            `(${functionName}) // function ${functionName} ${numLocals}`,
        ];
        if (numLocals) {
            if (numLocals === 1) {
                this.write(out);
                this.writePush('constant', 0);
                return;
            } else if (numLocals === 2) {
                out.push(...[
                    '@SP',
                    'A=M',
                    'M=0',
                    'A=A+1',
                    'M=0',
                    'D=A+1',
                    '@SP',
                    'M=D',
                ]);
            } else {
                out.push(...[
                    '@' + numLocals,
                    'D=A',
                    `(${functionName}_INIT_LOOP)`,
                    '@SP',
                    'AM=M+1',
                    'A=A-1',
                    'M=0',
                    'D=D-1',
                    `@${functionName}_INIT_LOOP`,
                    'D;JGT',
                ])
            }
        }
        this.write(out);
    }

    public writeArithmetic(command: string): void {
        let out: string[];
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
                    `@AFTER_DO_${command.toUpperCase()}${CodeWriter.labelCount}`,
                    'D=A',
                    '@DO_' + command.toUpperCase(),
                    '0;JMP',
                    `(AFTER_DO_${command.toUpperCase()}${CodeWriter.labelCount++})`,
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
        out[0] += ` // ${command}`;
        this.write(out);
    }

    static segmentMemoryMap = {
        'local': '@LCL',
        'argument': '@ARG',
        'this': '@THIS',
        'that': '@THAT',
        'pointer': 3,
        'temp': 5,
    }

    public writePush(segment: string, index: number): void {
        let out: string[];
        switch (segment) {
            // sets D to the value that needs to be pushed
            case 'constant':
                if (index === 0 || index === 1) {
                    out = [];
                } else {
                    out = [
                        '@' + index,
                        'D=A',
                    ];
                }
                break;
            case 'pointer':
            case 'temp':
                out = [
                    `@R${index + CodeWriter.segmentMemoryMap[segment]}`,
                    'D=M',
                ];
                break;
            case 'static':
                out = [
                    `@${this.fileName}.${index}`,
                    'D=M',
                ];
                break;
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                if (index === 0) {
                    out = [
                        CodeWriter.segmentMemoryMap[segment],
                        'A=M',
                        'D=M',
                    ];
                } else if (index === 1) {
                    out = [
                        CodeWriter.segmentMemoryMap[segment],
                        'A=M+1',
                        'D=M',
                    ];
                } else if (index === 2) {
                    out = [
                        CodeWriter.segmentMemoryMap[segment],
                        'A=M+1',
                        'A=A+1',
                        'D=M',
                    ];
                } else {
                    out = [
                        CodeWriter.segmentMemoryMap[segment],
                        'D=M',
                        '@' + index,
                        'A=A+D',
                        'D=M',
                    ];
                }
                break;
            default:
                throw new NANDException(`Invalid vm command segment: push ${segment} ${index}`);
        }
        out.push(...[
            '@SP',
            'AM=M+1',
            'A=A-1',
        ]);
        if (segment === 'constant' && (index === 0 || index === 1)) {
            out.push('M=' + index);
        } else {
            out.push('M=D');
        }
        out[0] += ` // push ${segment} ${index}`;
        this.write(out);
    }

    public writePop(segment: string, index: number): void {
        const out: string[] = [
            '@SP',
            'AM=M-1',
            'D=M',
        ];
        switch (segment) {
            case 'pointer':
            case 'temp':
                out.push(`@R${CodeWriter.segmentMemoryMap[segment] + index}`);
                break;
            case 'static':
                out.push(`@${this.fileName}.${index}`);
                break;
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                out.push(CodeWriter.segmentMemoryMap[segment]);
                if (index === 0) {
                    out.push('A=M');
                } else if (index <= 8) {
                    out.push('A=M+1');
                    for (let i = 0; i < index - 1; i++) {
                        out.push('A=A+1');
                    }
                } else {
                    this.write([
                        // stores RAM index dest in R13
                        `@${index} // pop ${segment} ${index}`,
                        'D=A',
                        CodeWriter.segmentMemoryMap[segment],
                        'D=D+M',
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
                    return;
                }
                break;
            default:
                throw new NANDException(`Invalid vm command segment: pop ${segment} ${index}`);
        }
        out.push('M=D');
        out[0] += ` // pop ${segment} ${index}`;
        this.write(out);
    }

    public close(): void {
        this.fileStream.close();
    }
}