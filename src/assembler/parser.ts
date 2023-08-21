export enum CommandType {
    A_COMMAND,
    C_COMMAND,
    L_COMMAND
}

export default class Parser {
    constructor(private inputStream: string[]) {}
    private inputStreamIndex = 0;
    private currentCommand = '';

    public advance(): boolean {
        let line: string | undefined = this.inputStream[this.inputStreamIndex++];
        if (line === undefined)
            return false;
        if (line === '')
            return this.advance();
        this.currentCommand = line.replace(/[ \t\r\f]/g, '');
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
        const tmp = this.currentCommand.indexOf(";");
        if (tmp === -1) {
            return this.currentCommand.substring(this.currentCommand.indexOf("=") + 1);
        }
        return this.currentCommand.substring(this.currentCommand.indexOf("=") + 1, tmp);
    }

    public jump(): string {
        const tmp = this.currentCommand.indexOf(";");
        if (tmp === -1)
            return '';
        return this.currentCommand.substring(tmp + 1);
    }
}