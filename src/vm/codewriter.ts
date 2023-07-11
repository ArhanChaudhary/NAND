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
        this.fileStream.write(`${out.join('\n')}\n\n`);
    }
    
    public writeInit(): void {
        this.write([
            '// init',
            '@256',
            'D=A',
            '@SP',
            'M=D',
        ]);
        this.writeCall('Sys.init', 0);
    }

    public writeLabel(label: string): void {
        this.write([
            `// label ${label}`,
            `(${this.currentFunction}$${label})`
        ]);
    }

    public writeGoto(label: string): void {
        this.write([
            `// goto ${label}`,
            `@${this.currentFunction}$${label}`,
            '0;JMP'
        ]);
    }

    public writeIf(label: string): void {
        this.write([
            `// if-goto ${label}`,
            '@SP',
            'AM=M-1',
            'D=M',
            `@${this.currentFunction}$${label}`,
            'D;JNE',
        ]);
    }

    public writeCall(functionName: string, numArgs: number): void {
        const out: string[] = [
            `// call ${functionName} ${numArgs}`,
            '@RETURN_ADDR' + CodeWriter.labelCount,
            'D=A',
            '@SP',
            'AM=M+1',
            'A=A-1',
            'M=D',
        ];
        for (const statePtr of [
            '@LCL',
            '@ARG',
            '@THIS',
            '@THAT',
        ]) {
            out.push(...[
                statePtr,
                'D=M',
                '@SP',
                'AM=M+1',
                'A=A-1',
                'M=D',
            ]);
        }
        out.push(...[
            // reposition lcl
            '@SP',
            'D=M',
            '@LCL',
            'M=D',

            // reposition arg
            '@' + numArgs,
            'D=D-A',
            '@5',
            'D=D-A',
            '@ARG',
            'M=D',
            '@' + functionName,
            '0;JMP',
            `(RETURN_ADDR${CodeWriter.labelCount++})`,
        ]);
        this.write(out);
    }

    public writeReturn(): void {
        this.currentFunction = '';
        this.write([
            '// return',
            // store LCL-1 (where the stored THAT is) in R14
            '@LCL',
            'D=M-1',
            '@R14',
            'M=D',

            // store return address in R15
            // NOTE: this is necessary because methods without arguments
            // have ARG pointed at the return value address, meaning it
            // will be overriden. (i had to find that out the hard way :V)
            '@4',
            'A=D-A',
            'D=M',
            '@R15',
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
            '@R14',
            'A=M',
            'D=M',
            '@THAT',
            'M=D',

            // restore this
            '@R14',
            'AM=M-1',
            'D=M',
            '@THIS',
            'M=D',

            // restore arg
            '@R14',
            'AM=M-1',
            'D=M',
            '@ARG',
            'M=D',

            // restore lcl
            '@R14',
            'A=M-1',
            'D=M',
            '@LCL',
            'M=D',
            
            // goto ret
            '@R15',
            'A=M',
            '0;JMP',
        ]);
    }

    public writeFunction(functionName: string, numLocals: number): void {
        this.currentFunction = functionName;
        const out: string[] = [
            `// function ${functionName} ${numLocals}`,
            `(${functionName})`,
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

    static branchCommandMap: { [command: string]: string } = {
        'eq': 'JNE',
        'gt': 'JLE',
        'lt': 'JGE',
    }

    public writeArithmetic(command: string): void {
        const out: string[] = [`// ${command}`];
        switch (command) {
            case 'add':
                out.push(...[
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M+D',
                ]);
                break;
            case 'sub':
                out.push(...[
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M-D',
                ]);
                break;
            case 'neg':
                out.push(...[
                    '@SP',
                    'A=M-1',
                    'M=-M',
                ]);
                break;
            case 'eq':
            case 'gt':
            case 'lt':
                out.push(...[
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
                ]);
                break;
            case 'and':
                out.push(...[
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M&D',
                ]);
                break;
            case 'or':
                out.push(...[
                    '@SP',
                    'AM=M-1',
                    'D=M',
                    'A=A-1',
                    'M=M|D',
                ]);
                break;
            case 'not':
                out.push(...[
                    '@SP',
                    'A=M-1',
                    'M=!M',
                ]);
                break;
            default:
                throw new NANDException("Invalid vm command: " + command);
        }
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
        const out: string[] = [`// push ${segment} ${index}`];
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
        this.write(out);
    }

    public writePop(segment: string, index: number): void {
        const out: string[] = [`// pop ${segment} ${index}`];
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
        this.write(out);
    }

    public close(): void {
        this.fileStream.close();
    }
}