import fs, { WriteStream } from "fs";
import { SyntaxException } from "../core/exceptions";
import Tokenizer, { TokenType } from "./tokenizer";

const varType = [
    'int',
    'char',
    'boolean',
    TokenType.IDENTIFIER,
];

const ops = [
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '=',
];

export default class Engine {
    private tokenizer: Tokenizer;
    private outputStream: WriteStream;
    private indent: number = 0;

    constructor(file: string) {
        this.outputStream = fs.createWriteStream(file.substring(0, file.length - 5) + '.xml');
        this.tokenizer = new Tokenizer(file);
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

    private assertToken(expectedToken: string | TokenType | (string | TokenType)[]): void {
        if (typeof expectedToken === 'string') {
            if (this.tokenizer.token() !== expectedToken)
                throw new SyntaxException();
        } else if (Array.isArray(expectedToken)) {
            if (!expectedToken.includes(this.tokenizer.token()) && !expectedToken.includes(this.tokenizer.tokenType()))
                throw new SyntaxException();
        } else if (expectedToken in TokenType) {
            if (this.tokenizer.tokenType() !== expectedToken)
                throw new SyntaxException();
        }
            this.compileTerminal();
            if (!this.tokenizer.advance()) {
                throw new SyntaxException();
            }
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

        this.assertToken('class');
        this.assertToken(TokenType.IDENTIFIER);
        this.assertToken('{');

        while (['field', 'static'].includes(this.tokenizer.token())) {
            this.compileClassVarDec();
        }

        while (['constructor', 'method', 'function'].includes(this.tokenizer.token())) {
            this.compileSubroutine();
        }

        if (this.tokenizer.token() !== '}')
            throw new SyntaxException();
        this.compileTerminal();
        if (this.tokenizer.advance()) {
            throw new SyntaxException();
        }

        this.indent--;
        this.write('</class>');
    }
    
    private compileClassVarDec(): void {
        this.write('<classVarDec>');
        this.indent++;

        this.assertToken(['field', 'static']);
        this.assertToken(varType);
        this.assertToken(TokenType.IDENTIFIER);

        while (this.tokenizer.token() === ',') {
            this.assertToken(',');
            this.assertToken(TokenType.IDENTIFIER);
        }

        this.assertToken(';');

        this.indent--;
        this.write('</classVarDec>');
    }
    
    private compileSubroutine(): void {
        this.write('<subroutineDec>');
        this.indent++;

        this.assertToken(['constructor', 'function', 'method']);
        this.assertToken(['void', ...varType]);
        this.assertToken(TokenType.IDENTIFIER);
        this.assertToken('(');
        this.compileParameterList();
        this.assertToken(')');
        this.compileSubroutineBody();

        this.indent--;
        this.write('</subroutineDec>');
    }
    
    private compileParameterList(): void {
        this.write('<parameterList>');
        this.indent++;

        if (varType.includes(this.tokenizer.token())) {
            this.assertToken(varType);
            this.assertToken(TokenType.IDENTIFIER);
            while (this.tokenizer.token() === ',') {
                this.assertToken(',');
                this.assertToken(varType);
                this.assertToken(TokenType.IDENTIFIER);
            }
        }

        this.indent--;
        this.write('</parameterList>');
    }

    private compileSubroutineBody(): void {
        this.write('<subroutineBody>');
        this.indent++;

        this.assertToken('{');

        while (this.tokenizer.token() === 'var') {
            this.compileVarDec();
        }

        this.compileStatements();
        this.assertToken('}');

        this.indent--;
        this.write('</subroutineBody>');
    }
    
    private compileVarDec(): void {
        this.write('<varDec>');
        this.indent++;

        this.assertToken('var');
        this.assertToken(varType);
        this.assertToken(TokenType.IDENTIFIER);

        while (this.tokenizer.token() === ',') {
            this.assertToken(',');
            this.assertToken(TokenType.IDENTIFIER);
        }

        this.assertToken(';');

        this.indent--;
        this.write('</varDec>');
    }
    
    private compileStatements(): void {
        this.write('<statements>');
        this.indent++;

        outer: while (true) {
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
        }

        this.indent--;
        this.write('</statements>');
    }
    
    private compileDo(): void {
        this.write('<doStatement>');
        this.indent++;

        this.assertToken('do');
        this.assertToken(TokenType.IDENTIFIER);
        this.compileSubroutineCall();
        this.assertToken(';');

        this.indent--;
        this.write('</doStatement>');
    }
    
    private compileLet(): void {
        this.write('<letStatement>');
        this.indent++;

        this.assertToken('let');
        this.assertToken(TokenType.IDENTIFIER);

        if (this.tokenizer.token() === '[') {
            this.assertToken('[');
            this.compileExpression();
            this.assertToken(']');
        }

        this.assertToken('=');
        this.compileExpression();
        this.assertToken(';');

        this.indent--;
        this.write('</letStatement>');
    }
    
    private compileWhile(): void {
        this.write('<whileStatement>');
        this.indent++;

        this.assertToken('while');
        this.assertToken('(');
        this.compileExpression();
        this.assertToken(')');
        this.assertToken('{');
        this.compileStatements();
        this.assertToken('}');

        this.indent--;
        this.write('</whileStatement>');
    }
    
    private compileReturn(): void {
        this.write('<returnStatement>');
        this.indent++;

        this.assertToken('return');
        if (this.tokenizer.token() !== ';') {
            this.compileExpression();
        }
        this.assertToken(';');

        this.indent--;
        this.write('</returnStatement>');
    }
    
    private compileIf(): void {
        this.write('<ifStatement>');
        this.indent++;

        this.assertToken('if');
        this.assertToken('(');
        this.compileExpression();
        this.assertToken(')');
        this.assertToken('{');
        this.compileStatements();
        this.assertToken('}');

        if (this.tokenizer.token() === 'else') {
            this.assertToken('else');
            this.assertToken('{');
            this.compileStatements();
            this.assertToken('}');
        }

        this.indent--;
        this.write('</ifStatement>');
    }
    
    private compileExpression(): void {
        this.write('<expression>');
        this.indent++;

        this.compileTerm();
        while (ops.includes(this.tokenizer.token())) {
            this.assertToken(ops);
            this.compileTerm();
        }

        this.indent--;
        this.write('</expression>');
    }
    
    private compileTerm(): void {
        this.write('<term>');
        this.indent++;

        switch (this.tokenizer.tokenType()) {
            case TokenType.INT_CONST:
                this.assertToken(TokenType.INT_CONST);
                break;
            case TokenType.STRING_CONST:
                this.assertToken(TokenType.STRING_CONST);
                break;
            case TokenType.KEYWORD:
                this.assertToken(['true', 'false', 'null', 'this']);
                break;
            case TokenType.IDENTIFIER:
                this.assertToken(TokenType.IDENTIFIER);
                switch (this.tokenizer.token()) {
                    case '[':
                        this.assertToken('[');
                        this.compileExpression();
                        this.assertToken(']');
                        break;
                    case '(':
                    case '.':
                        this.compileSubroutineCall();
                        break;
                }
                break;
            case TokenType.SYMBOL:
                switch (this.tokenizer.token()) {
                    case '~':
                    case '-':
                        this.assertToken(['-', '~']);
                        this.compileTerm();
                        break;
                    case '(':
                        this.assertToken('(');
                        this.compileExpression();
                        this.assertToken(')');
                        break;
                    default:
                        throw new SyntaxException();
                } 
                break;
        }

        this.indent--;
        this.write('</term>');
    }

    private compileSubroutineCall(): void {
        if (this.tokenizer.token() === '.') {
            this.assertToken('.');
            this.assertToken(TokenType.IDENTIFIER);
        }
        this.assertToken('(');
        this.compileExpressionList();
        this.assertToken(')');
    }

    private compileExpressionList(): void {
        this.write('<expressionList>');
        this.indent++;

        if (this.tokenizer.token() !== ')') {
            this.compileExpression();
            while (this.tokenizer.token() === ',') {
                this.assertToken(',');
                this.compileExpression();
            }
        }

        this.indent--;
        this.write('</expressionList>');
    }
}