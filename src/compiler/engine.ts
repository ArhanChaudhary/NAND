import { SyntaxException } from "../core/exceptions";
import Tokenizer, { TokenType } from "./tokenizer";
import SymbolTable from "./symboltable";
import VMWriter from "./vmwriter";

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
    private vmwriter: VMWriter;
    private tokenizer: Tokenizer;
    private symbolTable: SymbolTable;

    private className = '';
    private subroutineName = '';
    private subroutineType = '';
    private labelCounter = 0;

    constructor(file: string) {
        // todo: test if file name equals class name
        this.tokenizer = new Tokenizer(file);
        this.vmwriter = new VMWriter(file);
        this.symbolTable = new SymbolTable();
        this.tokenizer.advance();
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
        if (!this.tokenizer.advance()) {
            throw new SyntaxException();
        }
    }

    public compileClass(): void {
        this.assertToken('class');
        this.className = this.tokenizer.token();
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
        if (this.tokenizer.advance()) {
            throw new SyntaxException();
        }
        this.vmwriter.close();
    }
    
    private compileClassVarDec(): void {
        let kind: string;
        switch (this.tokenizer.token()) {
            case 'field':
                kind = 'this';
                break;
            case 'static':
                kind = 'static';
                break;
            default:
                throw new SyntaxException();
        }
        this.tokenizer.advance();
        const type = this.tokenizer.token();
        this.assertToken(varType);
        this.symbolTable.define(this.tokenizer.token(), type, kind);
        this.assertToken(TokenType.IDENTIFIER);

        while (this.tokenizer.token() === ',') {
            this.tokenizer.advance();
            this.symbolTable.define(this.tokenizer.token(), type, kind);
            this.assertToken(TokenType.IDENTIFIER);
        }

        this.assertToken(';');
    }
    
    private compileSubroutine(): void {
        this.subroutineType = this.tokenizer.token();
        this.symbolTable.startSubroutine(this.subroutineType);
        this.assertToken(['constructor', 'function', 'method']);
        this.assertToken(['void', ...varType]);
        this.subroutineName = this.tokenizer.token();
        this.assertToken(TokenType.IDENTIFIER);
        this.assertToken('(');
        this.compileParameterList();
        this.assertToken(')');
        this.compileSubroutineBody();
    }
    
    private compileParameterList(): void {
        if (varType.includes(this.tokenizer.token()) || varType.includes(this.tokenizer.tokenType())) {
            const type = this.tokenizer.token();
            this.assertToken(varType);
            this.symbolTable.define(this.tokenizer.token(), type, 'argument');
            this.assertToken(TokenType.IDENTIFIER);
            while (this.tokenizer.token() === ',') {
                this.tokenizer.advance();
                const type = this.tokenizer.token();
                this.assertToken(varType);
                this.symbolTable.define(this.tokenizer.token(), type, 'argument');
                this.assertToken(TokenType.IDENTIFIER);
            }
        }
    }

    private compileSubroutineBody(): void {
        this.assertToken('{');

        while (this.tokenizer.token() === 'var') {
            this.compileVarDec();
        }

        this.vmwriter.writeFunction(`${this.className}.${this.subroutineName}`, this.symbolTable.count('local'));
        switch (this.subroutineType) {
            case 'constructor':
                this.vmwriter.writePush('constant', this.symbolTable.count('this'));
                this.vmwriter.writeCall('Memory.alloc', 1);
                this.vmwriter.writePop('pointer', 0);
                break;
            case 'method':
                this.vmwriter.writePush('argument', 0);
                this.vmwriter.writePop('pointer', 0);
                break;
        }

        this.compileStatements();
        this.assertToken('}');
    }
    
    private compileVarDec(): void {
        this.assertToken('var');
        const type = this.tokenizer.token();
        this.assertToken(varType);
        this.symbolTable.define(this.tokenizer.token(), type, 'local');
        this.assertToken(TokenType.IDENTIFIER);

        while (this.tokenizer.token() === ',') {
            this.tokenizer.advance();
            this.symbolTable.define(this.tokenizer.token(), type, 'local');
            this.assertToken(TokenType.IDENTIFIER);
        }

        this.assertToken(';');
    }
    
    private compileStatements(): void {
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
    }

    private compileSubroutineCall(prevToken: string): void {
        const prevTokenKind = this.symbolTable.kindOf(prevToken) as string;
        const prevTokenType = this.symbolTable.typeOf(prevToken) as string;
        const prevTokenIndex = this.symbolTable.indexOf(prevToken) as number;
        let nArgs = 0;
        let subroutineClass: string | null;
        let subroutineMethod: string;
        switch (this.tokenizer.token()) {
            case '(':
                this.tokenizer.advance();
                if (this.subroutineType === 'function')
                    throw new SyntaxException();
                this.vmwriter.writePush('pointer', 0);
                nArgs = this.compileExpressionList();
                this.assertToken(')');
                this.vmwriter.writeCall(`${this.className}.${prevToken}`, nArgs + 1);
                break;
            case '.':
                if (prevTokenType !== null) {
                    subroutineClass = prevTokenType;
                } else {
                    subroutineClass = prevToken;
                }
                this.tokenizer.advance();
                subroutineMethod = this.tokenizer.token();
                this.assertToken(TokenType.IDENTIFIER);
                this.assertToken('(');
                if (prevTokenType !== null) {
                    this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                    nArgs = 1;
                }
                nArgs += this.compileExpressionList();
                this.assertToken(')');
                this.vmwriter.writeCall(`${subroutineClass}.${subroutineMethod}`, nArgs);
                break;
            default:
                throw new SyntaxException();
        }
    }
    
    private compileDo(): void {
        this.assertToken('do');
        const prevToken = this.tokenizer.token();
        this.assertToken(TokenType.IDENTIFIER);
        this.compileSubroutineCall(prevToken);
        this.assertToken(';');
        this.vmwriter.writePop('temp', 0);
    }
    
    private compileLet(): void {
        this.assertToken('let');
        const kind = this.symbolTable.kindOf(this.tokenizer.token()) as string;
        const index = this.symbolTable.indexOf(this.tokenizer.token()) as number;
        this.assertToken(TokenType.IDENTIFIER);

        if (this.tokenizer.token() === '[') {
            this.tokenizer.advance();
            this.vmwriter.writePush(kind, index);
            this.compileExpression();
            this.vmwriter.writeArithmetic('+');
            this.assertToken(']');
            this.assertToken('=');
            this.compileExpression();
            this.vmwriter.writePop('temp', 0);
            this.vmwriter.writePop('pointer', 1);
            this.vmwriter.writePush('temp', 0);
            this.vmwriter.writePop('that', 0);
            this.assertToken(';');
        } else {
            this.assertToken('=');
            this.compileExpression();
            this.assertToken(';');
            this.vmwriter.writePop(kind, index);
        }

    }
    
    private compileWhile(): void {
        const l1 = this.labelCounter++;
        const l2 = this.labelCounter++;
        this.assertToken('while');
        this.assertToken('(');
        this.vmwriter.writeLabel('WHILE_ITER' + l1);
        this.compileExpression();
        this.vmwriter.writeArithmetic('~');
        this.vmwriter.writeIf('WHILE_BREAKER' + l2);
        this.assertToken(')');
        this.assertToken('{');
        this.compileStatements();
        this.vmwriter.writeGoto('WHILE_ITER' + l1);
        this.vmwriter.writeLabel('WHILE_BREAKER' + l2);
        this.assertToken('}');
    }
    
    private compileReturn(): void {
        this.assertToken('return');
        if (this.tokenizer.token() === ';') {
            this.tokenizer.advance();
            this.vmwriter.writePush('constant', 0);
        } else {
            this.compileExpression();
            this.assertToken(';');
        }
        this.vmwriter.writeReturn();
        
    }
    
    private compileIf(): void {
        const l1 = this.labelCounter++;
        this.assertToken('if');
        this.assertToken('(');
        this.compileExpression();
        this.vmwriter.writeArithmetic('~');
        this.vmwriter.writeIf('FALSE_CASE' + l1);
        this.assertToken(')');
        this.assertToken('{');
        this.compileStatements();
        this.assertToken('}');

        if (this.tokenizer.token() === 'else') {
            const l2 = this.labelCounter++;
            this.tokenizer.advance();
            this.assertToken('{');
            this.vmwriter.writeGoto('TRUE_CASE' + l2);
            this.vmwriter.writeLabel('FALSE_CASE' + l1);
            this.compileStatements();
            this.vmwriter.writeLabel('TRUE_CASE' + l2);
            this.assertToken('}');
        } else {
            this.vmwriter.writeLabel('FALSE_CASE' + l1);
        }
    }

    private compileExpression(): void {
        this.compileTerm();
        if (ops.includes(this.tokenizer.token())) {
            const op = this.tokenizer.token();
            this.assertToken(ops);
            this.compileExpression();
            this.vmwriter.writeArithmetic(op);
        }
    }
    
    private compileTerm(): void {
        switch (this.tokenizer.tokenType()) {
            case TokenType.INT_CONST:
                this.vmwriter.writePush('constant', this.tokenizer.token());
                this.assertToken(TokenType.INT_CONST);
                break;
            case TokenType.STRING_CONST:
                this.vmwriter.writePush('constant', this.tokenizer.token().length);
                this.vmwriter.writeCall('String.new', 1);
                for (const char of this.tokenizer.token()) {
                    this.vmwriter.writePush('constant', char.charCodeAt(0));
                    this.vmwriter.writeCall('String.appendChar', 2);
                }
                this.assertToken(TokenType.STRING_CONST);
                break;
            case TokenType.KEYWORD:
                switch (this.tokenizer.token()) {
                    case 'true':
                        this.vmwriter.writePush('constant', 1);
                        this.vmwriter.writeArithmetic('-', false);
                        break;
                    case 'false':
                    case 'null':
                        this.vmwriter.writePush('constant', 0);
                        break;
                    case 'this':
                        if (this.subroutineType === 'function')
                            throw new SyntaxException();
                        this.vmwriter.writePush('pointer', 0);
                        break;
                    default:
                        throw new SyntaxException();
                }
                this.tokenizer.advance();
                break;
            case TokenType.IDENTIFIER:
                const prevToken = this.tokenizer.token();
                const prevTokenKind = this.symbolTable.kindOf(prevToken) as string;
                const prevTokenIndex = this.symbolTable.indexOf(prevToken) as number;
                this.tokenizer.advance();
                switch (this.tokenizer.token()) {
                    /**
                    varName
                    varName[expression]
                    subroutineName(expressionList)
                    className.subroutineName(expressionList)
                    varName.subroutineName(expressionList)
                     */
                    case '[':
                        if (prevTokenKind === null) {
                            throw new SyntaxException();
                        }
                        this.tokenizer.advance();
                        this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                        this.compileExpression();
                        this.vmwriter.writeArithmetic('+');
                        this.vmwriter.writePop('pointer', 1);
                        this.vmwriter.writePush('that', 0);
                        this.assertToken(']');
                        break;
                    case '(':
                    case '.':
                        this.compileSubroutineCall(prevToken);
                        break;
                    default:
                        if (prevTokenKind === null) {
                            throw new SyntaxException();
                        }
                        this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                }
                break;
            case TokenType.SYMBOL:
                switch (this.tokenizer.token()) {
                    case '~':
                        this.tokenizer.advance();
                        this.compileTerm();
                        this.vmwriter.writeArithmetic('~');
                        break;
                    case '-':
                        this.tokenizer.advance();
                        this.compileTerm();
                        this.vmwriter.writeArithmetic('-', false);
                        break;
                    case '(':
                        this.tokenizer.advance();
                        this.compileExpression();
                        this.assertToken(')');
                        break;
                    default:
                        throw new SyntaxException();
                } 
                break;
        }
    }

    private compileExpressionList(): number {
        let nArgs = 0;
        if (this.tokenizer.token() !== ')') {
            this.compileExpression();
            nArgs++;
            while (this.tokenizer.token() === ',') {
                this.tokenizer.advance();
                this.compileExpression();
                nArgs++;
            }
        }
        return nArgs;
    }
}