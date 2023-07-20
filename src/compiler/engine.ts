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

    private className: string = '';
    private subroutineName: string = '';
    private subroutineType: string = '';
    private labelCounter: number = 0;

    constructor(file: string) {
        // todo: test if file name equals class name
        this.tokenizer = new Tokenizer(file);
        this.vmwriter = new VMWriter(file);
        this.symbolTable = new SymbolTable();
        this.tokenizer.advance();
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
        // this.compileTerminal(identifierType, undefined, undefined, beingDefined);
        if (!this.tokenizer.advance()) {
            throw new SyntaxException();
        }
    }

    private compileTerminal(identifierType: string | undefined = undefined, tokenOverride: string | undefined = undefined, tokenTypeOverride: TokenType | undefined = undefined, beingDefined: boolean = false): void {
        // const token: string = tokenOverride || this.tokenizer.token();
        // switch (tokenTypeOverride || this.tokenizer.tokenType()) {
        //     case TokenType.KEYWORD:
        //         this.writeClosedXML('keyword', token);
        //         break;
        //     case TokenType.SYMBOL:
        //         this.writeClosedXML('symbol', token);
        //         break;
        //     case TokenType.IDENTIFIER:
        //         this.writeClosedXML('identifier', `${identifierType || this.symbolTable.kindOf(token)} ${this.symbolTable.indexOf(token)} ${beingDefined}`);
        //         break;
        //     case TokenType.INT_CONST:
        //         this.writeClosedXML('integerConstant', token);
        //         break;
        //     case TokenType.STRING_CONST:
        //         this.writeClosedXML('stringConstant', token);
        //         break;
        // }
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
        this.compileTerminal();
        if (this.tokenizer.advance()) {
            throw new SyntaxException();
        }
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
        const type: string = this.tokenizer.token();
        this.assertToken(varType, 'class');
        this.symbolTable.define(this.tokenizer.token(), type, kind);
        this.assertToken(TokenType.IDENTIFIER, undefined, true);

        while (this.tokenizer.token() === ',') {
            this.assertToken(',');
            this.symbolTable.define(this.tokenizer.token(), type, kind);
            this.assertToken(TokenType.IDENTIFIER, undefined, true);
        }

        this.assertToken(';');
    }
    
    private compileSubroutine(): void {
        this.symbolTable.startSubroutine();
        this.subroutineType = this.tokenizer.token();
        this.assertToken(['constructor', 'function', 'method']);
        this.assertToken(['void', ...varType], 'class');
        this.subroutineName = this.tokenizer.token();
        this.assertToken(TokenType.IDENTIFIER, 'subroutine', true);
        this.assertToken('(');
        this.compileParameterList();
        this.assertToken(')');
        this.compileSubroutineBody();
    }
    
    private compileParameterList(): void {
        if (varType.includes(this.tokenizer.token()) || varType.includes(this.tokenizer.tokenType())) {
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
    }

    private compileSubroutineBody(): void {
        this.assertToken('{');

        while (this.tokenizer.token() === 'var') {
            this.compileVarDec();
        }

        this.vmwriter.writeFunction(`${this.className}.${this.subroutineName}`, this.symbolTable.count('local'));
        switch (this.subroutineType ) {
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
        this.assertToken(varType, 'class');
        this.symbolTable.define(this.tokenizer.token(), type, 'local');
        this.assertToken(TokenType.IDENTIFIER, undefined, true);

        while (this.tokenizer.token() === ',') {
            this.assertToken(',');
            this.symbolTable.define(this.tokenizer.token(), type, 'local');
            this.assertToken(TokenType.IDENTIFIER, undefined, true);
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
    
    private compileDo(): void {
        this.assertToken('do');

        if (this.tokenizer.tokenType() !== TokenType.IDENTIFIER)
            throw new SyntaxException();
        const prevToken = this.tokenizer.token();
        const prevTokenKind = this.symbolTable.kindOf(prevToken) as string;
        const prevTokenType = this.symbolTable.typeOf(prevToken) as string;
        const prevTokenIndex = this.symbolTable.indexOf(prevToken) as number;
        this.tokenizer.advance();
        let nArgs: number = 0;
        let subroutineClass: string | null;
        let subroutineMethod: string;
        switch (this.tokenizer.token()) {
            case '(':
                // this.compileTerminal('subroutine', prevToken, prevTokenType);
                this.assertToken('(');
                switch (this.subroutineType) {
                    case 'function':
                        throw new SyntaxException();
                    case 'constructor':
                        this.vmwriter.writePush('pointer', 0);
                        break;
                    case 'method':
                        this.vmwriter.writePush('argument', 0);
                        break;
                }
                nArgs = this.compileExpressionList();
                this.assertToken(')');
                this.vmwriter.writeCall(`${this.className}.${prevToken}`, nArgs + 1);
                break;
            case '.':
                if (prevTokenType === null) {
                    subroutineClass = prevToken;
                } else {
                    subroutineClass = prevTokenType;
                }
                this.assertToken('.');
                subroutineMethod = this.tokenizer.token();
                this.assertToken(TokenType.IDENTIFIER, 'subroutine');
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
        this.assertToken(';');
        this.vmwriter.writePop('temp', 0);
    }
    
    private compileLet(): void {
        this.assertToken('let');
        const kind = this.symbolTable.kindOf(this.tokenizer.token()) as string;
        const index = this.symbolTable.indexOf(this.tokenizer.token()) as number;
        this.assertToken(TokenType.IDENTIFIER, undefined, true);

        if (this.tokenizer.token() === '[') {
            this.assertToken('[');
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
        const l1: number = this.labelCounter++;
        const l2: number = this.labelCounter++;
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
            this.assertToken(';');
            this.vmwriter.writePush('constant', 0);
        } else {
            this.compileExpression();
            this.assertToken(';');
        }
        this.vmwriter.writeReturn();
        
    }
    
    private compileIf(): void {
        const l1: number = this.labelCounter++;
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
            const l2: number = this.labelCounter++;
            this.assertToken('else');
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
                        switch (this.subroutineType) {
                            case 'function':
                                throw new SyntaxException();
                            case 'constructor':
                                this.vmwriter.writePush('pointer', 0);
                                break;
                            case 'method':
                                this.vmwriter.writePush('argument', 0);
                                break;
                        }
                        break;
                    default:
                        throw new SyntaxException();
                }
                this.tokenizer.advance();
                break;
            case TokenType.IDENTIFIER:
                const prevToken = this.tokenizer.token();
                const prevTokenKind = this.symbolTable.kindOf(prevToken) as string;
                const prevTokenType = this.symbolTable.typeOf(prevToken) as string;
                const prevTokenIndex = this.symbolTable.indexOf(prevToken) as number;
                this.tokenizer.advance();
                let nArgs: number = 0;
                let subroutineClass: string | null;
                let subroutineMethod: string;
                switch (this.tokenizer.token()) {
                    /**
                    varName
                    varName[expression]
                    subroutineName(expressionList)
                    className.subroutineName(expressionList)
                    varName.subroutineName(expressionList)
                     */
                    case '[':
                        // this.compileTerminal(undefined, prevToken, prevTokenType);
                        if (prevTokenKind === null) {
                            throw new SyntaxException();
                        }
                        this.assertToken('[');
                        this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                        this.compileExpression();
                        this.vmwriter.writeArithmetic('+');
                        this.vmwriter.writePop('pointer', 1);
                        this.vmwriter.writePush('that', 0);
                        this.assertToken(']');
                        break;
                    case '(':
                        // this.compileTerminal('subroutine', prevToken, prevTokenType);
                        this.assertToken('(');
                        nArgs = this.compileExpressionList();
                        this.assertToken(')');
                        this.vmwriter.writeCall(`${this.className}.${prevToken}`, nArgs);
                        break;
                    case '.':
                        if (prevTokenType === null) {
                            subroutineClass = prevToken;
                        } else {
                            subroutineClass = prevTokenType;
                        }
                        this.assertToken('.');
                        subroutineMethod = this.tokenizer.token();
                        this.assertToken(TokenType.IDENTIFIER, 'subroutine');
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
                        // this.compileTerminal(undefined, prevToken, prevTokenType);
                        if (prevTokenKind === null) {
                            throw new SyntaxException();
                        }
                        this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                }
                break;
            case TokenType.SYMBOL:
                switch (this.tokenizer.token()) {
                    case '~':
                        this.assertToken('~');
                        this.compileTerm();
                        this.vmwriter.writeArithmetic('~');
                        break;
                    case '-':
                        this.assertToken('-');
                        this.compileTerm();
                        this.vmwriter.writeArithmetic('-', false);
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
    }

    private compileExpressionList(): number {
        let nArgs: number = 0;
        if (this.tokenizer.token() !== ')') {
            this.compileExpression();
            nArgs++;
            while (this.tokenizer.token() === ',') {
                this.assertToken(',');
                this.compileExpression();
                nArgs++;
            }
        }
        return nArgs;
    }
}