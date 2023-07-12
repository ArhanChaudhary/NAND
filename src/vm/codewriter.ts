import fs, { WriteStream } from 'fs';
import NANDException from '../core/exceptions';

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

    private write(out: string[]): void {
        this.fileStream.write(`${out.join('\n')}\n`);
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

            '(PUSH_STATE) // push state during call',
            '@R15',
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
            
            // goto R15
            '@R15',
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
            '@SP // if-goto ${label}',
            'AM=M-1',
            'D=M',
            `@${this.currentFunction}$${label}`,
            'D;JNE',
        ]);
    }

    public writeCall(functionName: string, numArgs: number): void {
        const l1 = CodeWriter.labelCount++;
        const l2 = CodeWriter.labelCount++;
        const out: string[] = [
            // push return address
            `@RETURN_ADDR${l1} // call ${functionName} ${numArgs}`,
            'D=A',
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',

            // push lcl, arg, this, that
            '@AFTER_PUSH_STATE' + l2,
            'D=A',
            '@PUSH_STATE',
            '0;JMP',
            // SP is stored in D after PUSH_STATE finishes
            `(AFTER_PUSH_STATE${l2})`,

            // reposition arg
            '@' + numArgs,
            'D=D-A',
            '@5',
            'D=D-A',
            '@ARG',
            'M=D',
            '@' + functionName,
            '0;JMP',
            `(RETURN_ADDR${l1})`,
        ];
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
            out.push(...[
                '@SP',
                'A=M',
            ]);
            for (let k = 0; k < numLocals - 1; k++) {
                out.push(...[
                    'M=0',
                    'A=A+1'
                ]);
            }
            out.push(...[
                'M=0',
                'AD=A+1',
                '@SP',
                'M=D'
            ]);
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

    static segmentMemoryMap: { [segment: string]: string } = {
        'local': '@LCL',
        'argument': '@ARG',
        'this': '@THIS',
        'that': '@THAT',
        'pointer': '@3',
        'temp': '@5',
    }

    public writePush(segment: string, index: number): void {
        let out: string[];
        switch (segment) {
            // sets D to the value that needs to be pushed
            case 'constant':
                out = [
                    '@' + index,
                    'D=A',
                ];
                break;
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                out = [
                    CodeWriter.segmentMemoryMap[segment],
                    'D=M',
                    '@' + index,
                    'A=A+D',
                    'D=M',
                ];
                break;
            case 'pointer':
            case 'temp':
                out = [
                    CodeWriter.segmentMemoryMap[segment],
                    'D=A',
                    '@' + index,
                    'A=A+D',
                    'D=M',
                ];
                break;
            case 'static':
                out = [
                    `@${this.fileName}.${index}`,
                    'D=M',
                ];
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
        out[0] += ` // push ${segment} ${index}`;
        this.write(out);
    }

    public writePop(segment: string, index: number): void {
        let out: string[];
        switch (segment) {
            // sets D to the RAM index dest
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                out = [
                    '@' + index,
                    'D=A',
                    CodeWriter.segmentMemoryMap[segment],
                    'D=D+M',
                ];
                break;
            case 'pointer':
            case 'temp':
                out = [
                    '@' + index,
                    'D=A',
                    CodeWriter.segmentMemoryMap[segment],
                    'D=D+A',
                ];
                break;
            case 'static':
                out = [
                    `@${this.fileName}.${index}`,
                    'D=A',
                ];
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
        out[0] += ` // pop ${segment} ${index}`;
        this.write(out);
    }

    public close(): void {
        this.fileStream.close();
    }
}