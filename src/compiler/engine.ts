import fs, { WriteStream } from "fs";
import { SyntaxException } from "../core/exceptions";
import Tokenizer, { TokenType } from "./tokenizer";
import SymbolTable from "./symboltable";

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
    private symbolTable: SymbolTable;
    private indent: number = 0;

    constructor(file: string) {
        this.outputStream = fs.createWriteStream(file.substring(0, file.length - 5) + '.xml');
        this.tokenizer = new Tokenizer(file);
        this.symbolTable = new SymbolTable();
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

    private assertToken(expectedToken: string | TokenType | (string | TokenType)[], identifierType: string | undefined = undefined, beingDefined: boolean = false): void {
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
        this.compileTerminal(identifierType, undefined, undefined, beingDefined);
        if (!this.tokenizer.advance()) {
            throw new SyntaxException();
        }
    }

    private compileTerminal(identifierType: string | undefined = undefined, tokenOverride: string | undefined = undefined, tokenTypeOverride: TokenType | undefined = undefined, beingDefined: boolean = false): void {
        const token: string = tokenOverride || this.tokenizer.token();
        switch (tokenTypeOverride || this.tokenizer.tokenType()) {
            case TokenType.KEYWORD:
                this.writeClosedXML('keyword', token);
                break;
            case TokenType.SYMBOL:
                this.writeClosedXML('symbol', token);
                break;
            case TokenType.IDENTIFIER:
                this.writeClosedXML('identifier', `${identifierType || this.symbolTable.kindOf(token)} ${this.symbolTable.indexOf(token)} ${beingDefined}`);
                break;
            case TokenType.INT_CONST:
                this.writeClosedXML('integerConstant', token);
                break;
            case TokenType.STRING_CONST:
                this.writeClosedXML('stringConstant', token);
                break;
        }
    }

    public compileClass(): void {
        this.write('<class>');
        this.indent++;

        this.assertToken('class');
        this.assertToken(TokenType.IDENTIFIER, 'class');
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

        const kind = this.tokenizer.token();
        this.assertToken(['field', 'static']);
        const type = this.tokenizer.token();
        this.assertToken(varType, 'class');
        this.symbolTable.define(this.tokenizer.token(), type, kind);
        this.assertToken(TokenType.IDENTIFIER, undefined, true);

        while (this.tokenizer.token() === ',') {
            this.assertToken(',');
            this.symbolTable.define(this.tokenizer.token(), type, kind);
            this.assertToken(TokenType.IDENTIFIER, undefined, true);
        }

        this.assertToken(';');

        this.indent--;
        this.write('</classVarDec>');
    }
    
    private compileSubroutine(): void {
        this.write('<subroutineDec>');
        this.indent++;

        this.symbolTable.startSubroutine();
        this.assertToken(['constructor', 'function', 'method']);
        this.assertToken(['void', ...varType], 'class');
        this.assertToken(TokenType.IDENTIFIER, 'subroutine', true);
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
            const type = this.tokenizer.token();
            this.assertToken(varType, 'class');
            this.symbolTable.define(this.tokenizer.token(), type, 'argument');
            this.assertToken(TokenType.IDENTIFIER, undefined, true);
            while (this.tokenizer.token() === ',') {
                this.assertToken(',');
                const type = this.tokenizer.token();
                this.assertToken(varType, 'class');
                this.symbolTable.define(this.tokenizer.token(), type, 'argument');
                this.assertToken(TokenType.IDENTIFIER, undefined, true);
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
        const type = this.tokenizer.token();
        this.assertToken(varType, 'class');
        this.symbolTable.define(this.tokenizer.token(), type, 'var');
        this.assertToken(TokenType.IDENTIFIER, undefined, true);

        while (this.tokenizer.token() === ',') {
            this.assertToken(',');
            this.symbolTable.define(this.tokenizer.token(), type, 'var');
            this.assertToken(TokenType.IDENTIFIER, undefined, true);
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

        if (this.tokenizer.tokenType() !== TokenType.IDENTIFIER)
            throw new SyntaxException();
        const prevToken = this.tokenizer.token();
        const prevTokenType = this.tokenizer.tokenType();
        this.tokenizer.advance();
        switch (this.tokenizer.token()) {
            case '(':
                this.compileTerminal('subroutine', prevToken, prevTokenType);
                this.assertToken('(');
                this.compileExpressionList();
                this.assertToken(')');
                break;
            case '.':
                // can't find in table, must be a class
                if (this.symbolTable.kindOf(prevToken) === null) {
                    this.compileTerminal('class', prevToken, prevTokenType);
                } else {
                    this.compileTerminal(undefined, prevToken, prevTokenType);
                }
                this.assertToken('.');
                this.assertToken(TokenType.IDENTIFIER, 'subroutine');
                this.assertToken('(');
                this.compileExpressionList();
                this.assertToken(')');
                break;
            default:
                throw new SyntaxException();
        }

        this.assertToken(';');

        this.indent--;
        this.write('</doStatement>');
    }
    
    private compileLet(): void {
        this.write('<letStatement>');
        this.indent++;

        this.assertToken('let');
        this.assertToken(TokenType.IDENTIFIER, undefined, true);

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
                if (this.tokenizer.tokenType() !== TokenType.IDENTIFIER)
                    throw new SyntaxException();
                const prevToken = this.tokenizer.token();
                const prevTokenType = this.tokenizer.tokenType();
                this.tokenizer.advance();
                switch (this.tokenizer.token()) {
                    case '[':
                        this.compileTerminal(undefined, prevToken, prevTokenType);
                        this.assertToken('[');
                        this.compileExpression();
                        this.assertToken(']');
                        break;
                    case '(':
                        this.compileTerminal('subroutine', prevToken, prevTokenType);
                        this.assertToken('(');
                        this.compileExpressionList();
                        this.assertToken(')');
                        break;
                    case '.':
                        if (this.symbolTable.kindOf(prevToken) === null) {
                            this.compileTerminal('class', prevToken, prevTokenType);
                        } else {
                            this.compileTerminal(undefined, prevToken, prevTokenType);
                        }
                        this.assertToken('.');
                        this.assertToken(TokenType.IDENTIFIER, 'subroutine');
                        this.assertToken('(');
                        this.compileExpressionList();
                        this.assertToken(')');
                        break;
                    default:
                        this.compileTerminal(undefined, prevToken, prevTokenType);
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