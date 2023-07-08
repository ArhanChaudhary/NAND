import nReadlines from 'n-readlines';

export enum CommandType {
    C_ARITHMETIC,
    C_PUSH,
    C_POP
}

export class Parser {
    private fileStream: nReadlines;
    private currentCommand: string = '';

    constructor(file: string) {
        this.fileStream = new nReadlines(file);
    }

    public advance(): boolean {
        let line: Buffer | boolean = this.fileStream.next();
        if (!line)
            return false
        this.currentCommand = line.toString('ascii').trim().replace(/ {2,}/, ' ');
        const comment: number = this.currentCommand.indexOf("//");
        if (comment !== -1)
            this.currentCommand = this.currentCommand.substring(0, comment);
        if (!this.currentCommand)
            return this.advance();
        return true;
    }

    public commandType(): CommandType {
        if (this.currentCommand.startsWith('pu'))
            return CommandType.C_PUSH;
        if (this.currentCommand.startsWith('po'))
            return CommandType.C_POP;
        return CommandType.C_ARITHMETIC;
    }

    public arg1(): string {
        return this.currentCommand.split(' ')[1] || this.currentCommand;
    }

    public arg2(): number {
        return +this.currentCommand.split(' ')[2];
    }
}