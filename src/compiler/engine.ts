import fs, { WriteStream } from "fs";
import nReadlines from "n-readlines";
import NANDException from "../core/exceptions";

export default class Engine {
    private currentToken: string = '';
    private inputStream: nReadlines;
    private outputStream: WriteStream;

    constructor(file: string) {
        this.inputStream = new nReadlines(file);
        this.outputStream = fs.createWriteStream(file.substring(0, file.length - 5) + '.xml');
        this.outputStream.write('<tokens>');
    }

    private firstWrite: boolean = true;
    public write(out: string): void {
        if (this.firstWrite)
            this.outputStream.write(out);
        else
            this.outputStream.write('\n' + out);
        this.firstWrite = false;            
    }

    public writeXML(tag: string, data: string): void {
        switch (data) {
            case '<':
                data = '&lt;';
                break;
            case '>':
                data = '&gt;';
                break;
            case '"':
                data = '&quot;';
                break;
            case '&':
                data = '&amp;';
                break;
        }
        this.write(`<${tag}> ${data} </${tag}>`);
    }

    public advance(): boolean {
        let line: Buffer | boolean = this.inputStream.next();
        if (!line)
            return false
        this.currentToken = line.toString('ascii').trim().replace(/ {2,}/, ' ');
        if (!this.currentToken)
            return this.advance();
        return true;
    }

    public compileClass(): void {

    }
    
    public compileClassVarDev(): void {

    }
    
    public compileSubroutine(): void {

    }
    
    public compileParameterList(): void {

    }
    
    public compileVarDec(): void {

    }
    
    public compileStatements(): void {

    }
    
    public compileDo(): void {

    }
    
    public compileLet(): void {

    }
    
    public compileWhile(): void {

    }
    
    public compileReturn(): void {

    }
    
    public compileIf(): void {

    }
    
    public compileExpression(): void {

    }
    
    public compileTerm(): void {

    }

    public compileExpressionList(): void {

    }
}