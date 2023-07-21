import nReadlines from 'n-readlines';

export enum CommandType {
    C_ARITHMETIC,
    C_PUSH,
    C_POP,
    C_LABEL,
    C_GOTO,
    C_IF,
    C_FUNCTION,
    C_RETURN,
    C_CALL,
}

export default class Parser {
    private fileStream: nReadlines;
    private currentCommand = '';

    constructor(file: string) {
        this.fileStream = new nReadlines(file);
    }

    public advance(): boolean {
        let line: Buffer | boolean = this.fileStream.next();
        if (!line)
            return false;
        this.currentCommand = line.toString('ascii');
        const comment = this.currentCommand.indexOf("//");
        if (comment !== -1)
            this.currentCommand = this.currentCommand.substring(0, comment);
        this.currentCommand = this.currentCommand.trim().replace(/ {2,}/, ' ');
        if (!this.currentCommand)
            return this.advance();
        return true;
    }

    public commandType(): CommandType {
        let ret = {
            'pu': CommandType.C_PUSH,
            'po': CommandType.C_POP,
            'la': CommandType.C_LABEL,
            'go': CommandType.C_GOTO,
            'if': CommandType.C_IF,
            'fu': CommandType.C_FUNCTION,
            're': CommandType.C_RETURN,
            'ca': CommandType.C_CALL,
        }[this.currentCommand.substring(0, 2)];
        if (ret === undefined)
            ret = CommandType.C_ARITHMETIC;
        return ret;
    }

    public arg1(): string {
        return this.currentCommand.split(' ')[1] || this.currentCommand;
    }

    public arg2(): number {
        return +this.currentCommand.split(' ')[2];
    }
}