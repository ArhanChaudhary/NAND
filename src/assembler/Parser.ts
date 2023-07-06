import nReadlines from 'n-readlines';
import { NANDException } from '../core/exceptions';

enum CommandType {
    A_COMMAND,
    C_COMMAND,
    L_COMMAND
}

export class Parser {
    private fileStream: nReadlines;
    private currentCommand: string = '';

    constructor(file: string) {
        this.fileStream = new nReadlines(file);
    }

    public advance(): void {
        let line: Buffer | boolean = this.fileStream.next();
        if (!line)
            return
        this.currentCommand = line.toString('ascii').replace(/[ \t\r\f]/g, '');
        if (!this.currentCommand || this.currentCommand.startsWith('//')) {
            this.advance();
        }
    }

    public commandType(): CommandType {
        if (/^@\d+$/.test(this.currentCommand))
            return CommandType.A_COMMAND;
        if (/^(.+=)?.+(;.+)?$/.test(this.currentCommand))
            return CommandType.C_COMMAND;
        throw new NANDException("Invalid command syntax: " + this.currentCommand);
    }

    public symbol(): string {
        return this.currentCommand.substring(1);
    }

    public dest(): string {
        return this.currentCommand.substring(0, this.currentCommand.indexOf("="));
    }

    public comp(): string {
        const tmp: number = this.currentCommand.indexOf("=");
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

    public getFileStream(): nReadlines {
        return this.fileStream;
    }

    public getCurrentCommand(): string {
        return this.currentCommand;
    }
}