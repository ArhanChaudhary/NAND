import nReadlines from 'n-readlines';

export enum CommandType {
    A_COMMAND,
    C_COMMAND,
    L_COMMAND
}

export default class Parser {
    private fileStream: nReadlines;
    private currentCommand: string = '';

    constructor(file: string) {
        this.fileStream = new nReadlines(file);
    }

    public advance(): boolean {
        let line: Buffer | boolean = this.fileStream.next();
        if (!line)
            return false
        this.currentCommand = line.toString('ascii').replace(/[ \t\r\f]/g, '');
        const comment: number = this.currentCommand.indexOf("//");
        if (comment !== -1)
            this.currentCommand = this.currentCommand.substring(0, comment);
        if (!this.currentCommand)
            return this.advance();
        return true;
    }

    public commandType(): CommandType {
        if (this.currentCommand.startsWith('@'))
            return CommandType.A_COMMAND;
        if (this.currentCommand.startsWith('('))
            return CommandType.L_COMMAND;
        return CommandType.C_COMMAND;
    }

    public symbol(): string {
        if (this.currentCommand.startsWith('@'))
            return this.currentCommand.substring(1);
        return this.currentCommand.substring(1, this.currentCommand.length - 1);
    }

    public AIsNumber(): boolean {
        return /^@\d/.test(this.currentCommand);
    }

    public dest(): string {
        return this.currentCommand.substring(0, this.currentCommand.indexOf("="));
    }

    public comp(): string {
        const tmp: number = this.currentCommand.indexOf(";");
        if (tmp === -1) {
            return this.currentCommand.substring(this.currentCommand.indexOf("=") + 1);
        }
        return this.currentCommand.substring(this.currentCommand.indexOf("=") + 1, tmp);
    }

    public jump(): string {
        const tmp: number = this.currentCommand.indexOf(";");
        if (tmp === -1)
            return '';
        return this.currentCommand.substring(tmp + 1);
    }
}