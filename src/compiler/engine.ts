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

    constructor(file: string) {
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
    }
    
    private compileSubroutine(): void {
        this.symbolTable.startSubroutine();
        this.assertToken(['constructor', 'function', 'method']);
        this.assertToken(['void', ...varType], 'class');
        this.assertToken(TokenType.IDENTIFIER, 'subroutine', true);
        this.assertToken('(');
        this.compileParameterList();
        this.assertToken(')');
        this.compileSubroutineBody();
    }
    
    private compileParameterList(): void {
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
    }

    private compileSubroutineBody(): void {
        this.assertToken('{');

        while (this.tokenizer.token() === 'var') {
            this.compileVarDec();
        }

        this.compileStatements();
        this.assertToken('}');
    }
    
    private compileVarDec(): void {
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
    }
    
    private compileLet(): void {
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
    }
    
    private compileWhile(): void {
        this.assertToken('while');
        this.assertToken('(');
        this.compileExpression();
        this.assertToken(')');
        this.assertToken('{');
        this.compileStatements();
        this.assertToken('}');
    }
    
    private compileReturn(): void {
        this.assertToken('return');
        if (this.tokenizer.token() !== ';') {
            this.compileExpression();
        }
        this.assertToken(';');
    }
    
    private compileIf(): void {
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
    }
    
    private compileExpression(): void {
        this.compileTerm();
        while (ops.includes(this.tokenizer.token())) {
            this.assertToken(ops);
            this.compileTerm();
        }
    }
    
    private compileTerm(): void {
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
    }

    private compileExpressionList(): void {
        if (this.tokenizer.token() !== ')') {
            this.compileExpression();
            while (this.tokenizer.token() === ',') {
                this.assertToken(',');
                this.compileExpression();
            }
        }
    }
}