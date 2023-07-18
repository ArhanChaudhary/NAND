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

    private compileTerminal(): void {
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
            this.compileTerminal();
            if (this.tokenizer.token() === '{') {
                this.tokenizer.advance();
                break;
            }
        } while (this.tokenizer.advance());

        do {
            if (!['field', 'static'].includes(this.tokenizer.token()))
                break;
            this.compileClassVarDec();
        } while (this.tokenizer.advance());

        do {
            if (!['constructor', 'method', 'function'].includes(this.tokenizer.token()))
                break;
            this.compileSubroutine();
        } while (this.tokenizer.advance());

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === '}') {
                this.tokenizer.advance();
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</class>');
    }
    
    private compileClassVarDec(): void {
        this.write('<classVarDec>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === ';') {
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</classVarDec>');
    }
    
    private compileSubroutine(): void {
        this.write('<subroutineDec>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === '(') {
                this.tokenizer.advance();
                break;
            }
        } while (this.tokenizer.advance());
        
        this.compileParameterList();
        this.compileTerminal();
        this.tokenizer.advance();

        do {
            if (this.tokenizer.token() === '{') {
                this.compileSubroutineBody();
                break;
            }
            this.compileTerminal();
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</subroutineDec>');
    }
    
    private compileParameterList(): void {
        this.write('<parameterList>');
        this.indent++;

        do {
            if (this.tokenizer.token() === ')') {
                break;
            }
            this.compileTerminal();
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</parameterList>');
    }

    private compileSubroutineBody(): void {
        this.write('<subroutineBody>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === '{') {
                this.tokenizer.advance();
                break;
            }
        } while (this.tokenizer.advance());

        do {
            if (this.tokenizer.token() !== 'var') {
                break;
            }
            this.compileVarDec();
        } while (this.tokenizer.advance());

        do {
            if (['let', 'if', 'while', 'do', 'return'].includes(this.tokenizer.token())) {
                this.compileStatements();
                break;
            }
        } while (this.tokenizer.advance());

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === '}') {
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</subroutineBody>');
    }
    
    private compileVarDec(): void {
        this.write('<varDec>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === ';') {
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</varDec>');
    }
    
    private compileStatements(): void {
        this.write('<statements>');
        this.indent++;

        outer: do {
            switch (this.tokenizer.token()) {
                case 'let':
                    this.compileLet();
                    break;
                case 'if':
                    this.compileIf();
                    break;
                case 'while':
                    this.compileWhile();
                    break;
                case 'do':
                    this.compileDo();
                    break;
                case 'return':
                    this.compileReturn();
                    break;
                default:
                    break outer;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</statements>');
    }
    
    private compileDo(): void {
        this.write('<doStatement>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === ';') {
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</doStatement>');
    }
    
    private compileLet(): void {
        this.write('<letStatement>');
        this.indent++;

        this.compileTerminal();
        this.tokenizer.advance();
        this.compileTerminal();
        this.tokenizer.advance();

        if (this.tokenizer.token() === '[') {
            this.compileTerminal();
            this.tokenizer.advance();
            this.compileExpression();
            this.compileTerminal();
            this.tokenizer.advance();
        }

        this.compileTerminal();
        this.tokenizer.advance();
        this.compileExpression();
        this.compileTerminal();

        this.indent--;
        this.write('</letStatement>');
    }
    
    private compileWhile(): void {
        this.write('<whileStatement>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === ';') {
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</whileStatement>');
    }
    
    private compileReturn(): void {
        this.write('<returnStatement>');
        this.indent++;

        do {
            this.compileTerminal();
            if (this.tokenizer.token() === ';') {
                break;
            }
        } while (this.tokenizer.advance());

        this.indent--;
        this.write('</returnStatement>');
    }
    
    private compileIf(): void {
        this.write('<ifStatement>');
        this.indent++;

        // do {
        //     this.compileTerminal();
        //     if (this.tokenizer.token() === ';') {
        //         break;
        //     }
        // } while (this.tokenizer.advance());

        this.indent--;
        this.write('</ifStatement>');
    }
    
    private compileExpression(): void {
        this.write('<expression>');
        this.indent++;

        this.compileTerm();

        this.indent--;
        this.write('</expression>');
    }
    
    private compileTerm(): void {
        this.write('<term>');
        this.indent++;

        this.compileTerminal();
        this.tokenizer.advance();

        this.indent--;
        this.write('</term>');
    }

    private compileExpressionList(): void {

    }
}