import fs, { WriteStream } from "fs";
import nReadlines from "n-readlines";
import NANDException from "../core/exceptions";
import Tokenizer, { TokenType } from "./tokenizer";

export default class Engine {
    private tokenizer: Tokenizer;
    private outputStream: WriteStream;
    private indent: number = 0;

    constructor(file: string, tokenizer: Tokenizer) {
        this.tokenizer = tokenizer;
        this.outputStream = fs.createWriteStream(file.substring(0, file.length - 5) + '.xml');
        this.tokenizer.advance();
    }

    private firstWrite: boolean = true;
    private write(out: string): void {
        out = '  '.repeat(this.indent) + out;
        if (this.firstWrite)
            this.outputStream.write(out);
        else
            this.outputStream.write('\n' + out);
        this.firstWrite = false;
    }

    private writeClosedXML(tag: string, data: string): void {
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

    private compileToken(): void {
        switch (this.tokenizer.tokenType()) {
            case TokenType.KEYWORD:
                this.writeClosedXML('keyword', this.tokenizer.token());
                break;
            case TokenType.SYMBOL:
                this.writeClosedXML('symbol', this.tokenizer.token());
                break;
            case TokenType.IDENTIFIER:
                this.writeClosedXML('identifier', this.tokenizer.token());
                break;
            case TokenType.INT_CONST:
                this.writeClosedXML('integerConstant', this.tokenizer.token());
                break;
            case TokenType.STRING_CONST:
                this.writeClosedXML('stringConstant', this.tokenizer.token());
                break;
        }
    }

    public compileClass(): void {
        this.write('<class>');
        this.indent++;
        do {
            this.compileToken();
            if (this.tokenizer.token() === '{') {
                this.tokenizer.advance();
                break;
            }
        } while (this.tokenizer.advance());

        do {
            if (!['field', 'static'].includes(this.tokenizer.token()))
                break;
            this.compileClassVarDev();
        } while (this.tokenizer.advance());
        // while (this.tokenizer.advance()) {
        //     if (['constructor', 'method', 'function'].includes(this.tokenizer.token()))
        //         break;
        //     this.compileSubroutine();
        // }
        this.indent--;
        if (this.tokenizer.token() !== '}' || this.indent !== 0) {
            throw new NANDException();
        }
        if (this.tokenizer.advance()) {
            throw new NANDException();
        }
        this.write('</class>');
    }
    
    private compileClassVarDev(): void {
        this.write("<classVarDec>");
        this.indent++;
        do {
            this.compileToken();
            if (this.tokenizer.token() === ';') {
                this.tokenizer.advance();
                break;
            }
        } while (this.tokenizer.advance());
        this.indent--;
        this.write("</classVarDec>");
    }
    
    private compileSubroutine(): void {

    }
    
    private compileParameterList(): void {

    }
    
    private compileVarDec(): void {

    }
    
    private compileStatements(): void {

    }
    
    private compileDo(): void {

    }
    
    private compileLet(): void {

    }
    
    private compileWhile(): void {

    }
    
    private compileReturn(): void {

    }
    
    private compileIf(): void {

    }
    
    private compileExpression(): void {

    }
    
    private compileTerm(): void {

    }

    private compileExpressionList(): void {

    }
}