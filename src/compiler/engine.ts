import { SyntaxException } from "../core/exceptions";
import Tokenizer, { TokenType, SymbolToken, KeywordToken } from "./tokenizer";
import SymbolTable from "./symboltable";
import VMWriter from "./vmwriter";

const varType = [
    KeywordToken.INT as string,
    KeywordToken.CHAR as string,
    KeywordToken.BOOLEAN as string,
    TokenType.IDENTIFIER,
];

const ops = [
    SymbolToken.ADD,
    SymbolToken.SUBTRACT,
    SymbolToken.MULTIPLY,
    SymbolToken.DIVIDE,
    SymbolToken.AND,
    SymbolToken.OR,
    SymbolToken.LESS_THAN,
    SymbolToken.GREATER_THAN,
    SymbolToken.EQUAL,
];

export default class Engine {
    private vmwriter: VMWriter;
    private tokenizer: Tokenizer;
    private symbolTable: SymbolTable;

    private fileName: string;
    private className = '';
    private subroutineName = '';
    private subroutineNames: string[] = [];
    private subroutineCalls: { name: string }[] = [];
    private subroutineType = '';
    private subroutineReturnType = '';
    private lastStatementIsReturn = false;
    private labelCounter = 0;

    constructor(file: string) {
        const tmp = file.split('/');
        this.fileName = tmp[tmp.length - 1];
        this.fileName = this.fileName.substring(0, this.fileName.indexOf('.'));
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
        this.assertToken(KeywordToken.CLASS);
        this.className = this.tokenizer.token();
        if (this.className !== this.fileName)
            throw new SyntaxException();
        this.assertToken(TokenType.IDENTIFIER);
        this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);

        while ([KeywordToken.FIELD, KeywordToken.STATIC].includes(this.tokenizer.token() as KeywordToken)) {
            this.compileClassVarDec();
        }

        while ([KeywordToken.CONSTRUCTOR, KeywordToken.METHOD, KeywordToken.FUNCTION].includes(this.tokenizer.token() as KeywordToken)) {
            this.compileSubroutine();
        }

        if (this.tokenizer.token() !== SymbolToken.CLOSING_CURLY_BRACKET)
            throw new SyntaxException();
        if (this.tokenizer.advance()) {
            throw new SyntaxException();
        }

        for (const call of this.subroutineCalls) {
            if (!this.subroutineNames.includes(call.name))
                throw new SyntaxException();
        }
        this.vmwriter.close();
    }
    
    private compileClassVarDec(): void {
        let kind: string;
        switch (this.tokenizer.token()) {
            case KeywordToken.FIELD:
                kind = 'this';
                break;
            case KeywordToken.STATIC:
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

        while (this.tokenizer.token() === SymbolToken.COMMA) {
            this.tokenizer.advance();
            this.symbolTable.define(this.tokenizer.token(), type, kind);
            this.assertToken(TokenType.IDENTIFIER);
        }

        this.assertToken(SymbolToken.SEMICOLON);
    }
    
    private compileSubroutine(): void {
        this.subroutineType = this.tokenizer.token();
        this.symbolTable.startSubroutine(this.subroutineType);
        this.assertToken([KeywordToken.CONSTRUCTOR, KeywordToken.FUNCTION, KeywordToken.METHOD]);
        this.subroutineReturnType = this.tokenizer.token();
        this.assertToken([KeywordToken.VOID, ...varType]);
        if (this.subroutineType === KeywordToken.CONSTRUCTOR && this.subroutineReturnType !== this.className)
            throw new SyntaxException();
        this.subroutineName = this.tokenizer.token();
        this.assertToken(TokenType.IDENTIFIER);
        if (this.subroutineNames.includes(this.subroutineName))
            throw new SyntaxException();
        this.subroutineNames.push(this.subroutineName);
        this.assertToken(SymbolToken.OPENING_PARENTHESIS);
        this.compileParameterList();
        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
        this.lastStatementIsReturn = false;
        this.compileSubroutineBody();
        if (!this.lastStatementIsReturn) {
            if (this.subroutineType === KeywordToken.CONSTRUCTOR) {
                this.vmwriter.writePush('pointer', 0);
            } else {
                if (this.subroutineReturnType !== KeywordToken.VOID)
                    throw new SyntaxException();
                this.vmwriter.writePush('constant', 0);
            }
            this.vmwriter.writeReturn();
        }
    }
    
    private compileParameterList(): void {
        if (varType.includes(this.tokenizer.token()) || varType.includes(this.tokenizer.tokenType())) {
            const type = this.tokenizer.token();
            this.assertToken(varType);
            this.symbolTable.define(this.tokenizer.token(), type, 'argument');
            this.assertToken(TokenType.IDENTIFIER);
            while (this.tokenizer.token() === SymbolToken.COMMA) {
                this.tokenizer.advance();
                const type = this.tokenizer.token();
                this.assertToken(varType);
                this.symbolTable.define(this.tokenizer.token(), type, 'argument');
                this.assertToken(TokenType.IDENTIFIER);
            }
        }
    }

    private compileSubroutineBody(): void {
        this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);

        while (this.tokenizer.token() === KeywordToken.VAR) {
            this.compileVarDec();
        }

        this.vmwriter.writeFunction(`${this.className}.${this.subroutineName}`, this.symbolTable.count('local'));
        switch (this.subroutineType) {
            case KeywordToken.CONSTRUCTOR:
                this.vmwriter.writePush('constant', this.symbolTable.count('this'));
                this.vmwriter.writeCall('Memory.alloc', 1);
                this.vmwriter.writePop('pointer', 0);
                break;
            case KeywordToken.METHOD:
                this.vmwriter.writePush('argument', 0);
                this.vmwriter.writePop('pointer', 0);
                break;
        }

        this.compileStatements();
        this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
    }
    
    private compileVarDec(): void {
        this.assertToken(KeywordToken.VAR);
        const type = this.tokenizer.token();
        // TODO: check if identifier type is a class
        this.assertToken(varType);
        this.symbolTable.define(this.tokenizer.token(), type, 'local');
        this.assertToken(TokenType.IDENTIFIER);

        while (this.tokenizer.token() === SymbolToken.COMMA) {
            this.tokenizer.advance();
            this.symbolTable.define(this.tokenizer.token(), type, 'local');
            this.assertToken(TokenType.IDENTIFIER);
        }

        this.assertToken(SymbolToken.SEMICOLON);
    }
    
    private compileStatements(): void {
        outer: while (true) {
            switch (this.tokenizer.token()) {
                case KeywordToken.LET:
                case KeywordToken.IF:
                case KeywordToken.WHILE:
                case KeywordToken.DO:
                    if (this.lastStatementIsReturn)
                        throw new SyntaxException();
                    switch (this.tokenizer.token()) {
                        case KeywordToken.LET:
                            this.compileLet();
                            break;
                        case KeywordToken.IF:
                            this.compileIf();
                            break;
                        case KeywordToken.WHILE:
                            this.compileWhile();
                            break;
                        case KeywordToken.DO:
                            this.compileDo();
                            break;
                    }
                    break;
                case KeywordToken.RETURN:
                    this.lastStatementIsReturn = true;
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
            case SymbolToken.OPENING_PARENTHESIS:
                this.subroutineCalls.push({ name: prevToken });
                this.tokenizer.advance();
                if (this.subroutineType === KeywordToken.FUNCTION)
                    throw new SyntaxException();
                this.vmwriter.writePush('pointer', 0);
                nArgs = this.compileExpressionList();
                this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
                this.vmwriter.writeCall(`${this.className}.${prevToken}`, nArgs + 1);
                break;
            case SymbolToken.PERIOD:
                // TODO: check if class has subroutine
                if (prevTokenType !== null) {
                    subroutineClass = prevTokenType;
                } else {
                    subroutineClass = prevToken;
                }
                this.tokenizer.advance();
                subroutineMethod = this.tokenizer.token();
                this.assertToken(TokenType.IDENTIFIER);
                this.assertToken(SymbolToken.OPENING_PARENTHESIS);
                if (prevTokenType !== null) {
                    this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                    nArgs = 1;
                }
                nArgs += this.compileExpressionList();
                this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
                this.vmwriter.writeCall(`${subroutineClass}.${subroutineMethod}`, nArgs);
                break;
            default:
                throw new SyntaxException();
        }
    }
    
    private compileDo(): void {
        this.assertToken(KeywordToken.DO);
        const prevToken = this.tokenizer.token();
        this.assertToken(TokenType.IDENTIFIER);
        this.compileSubroutineCall(prevToken);
        this.assertToken(SymbolToken.SEMICOLON);
        this.vmwriter.writePop('temp', 0);
    }
    
    private compileLet(): void {
        this.assertToken(KeywordToken.LET);
        const kind = this.symbolTable.kindOf(this.tokenizer.token()) as string;
        if (kind === null || kind === 'this' && this.subroutineType === KeywordToken.FUNCTION)
            throw new SyntaxException();
        const index = this.symbolTable.indexOf(this.tokenizer.token()) as number;
        this.assertToken(TokenType.IDENTIFIER);
        switch (this.tokenizer.token()) {
            case SymbolToken.OPENING_BRACKET:
                this.vmwriter.writePush(kind, index);

                this.tokenizer.advance();
                this.compileExpression();
                this.vmwriter.writeArithmetic(SymbolToken.ADD);
                this.assertToken(SymbolToken.CLOSING_BRACKET);
                while (this.tokenizer.token() === SymbolToken.OPENING_BRACKET) {
                    this.vmwriter.writePop('pointer', 1);
                    this.vmwriter.writePush('that', 0);

                    this.tokenizer.advance();
                    this.compileExpression();
                    this.vmwriter.writeArithmetic(SymbolToken.ADD);
                    this.assertToken(SymbolToken.CLOSING_BRACKET);
                }
                this.assertToken('=');
                this.compileExpression();
                this.vmwriter.writePop('temp', 0);
                this.vmwriter.writePop('pointer', 1);
                this.vmwriter.writePush('temp', 0);
                this.vmwriter.writePop('that', 0);
                break;
            case '=':
                this.tokenizer.advance();
                this.compileExpression();
                this.vmwriter.writePop(kind, index);
                break;
        }
        this.assertToken(SymbolToken.SEMICOLON);
    }
    
    private compileWhile(): void {
        const l1 = this.labelCounter++;
        const l2 = this.labelCounter++;
        this.assertToken(KeywordToken.WHILE);
        this.assertToken(SymbolToken.OPENING_PARENTHESIS);
        this.vmwriter.writeLabel('WHILE_ITER' + l1);
        this.compileExpression();
        this.vmwriter.writeArithmetic(SymbolToken.NOT);
        this.vmwriter.writeIf('WHILE_BREAKER' + l2);
        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
        this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);
        this.compileStatements();
        this.vmwriter.writeGoto('WHILE_ITER' + l1);
        this.vmwriter.writeLabel('WHILE_BREAKER' + l2);
        this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
    }
    
    private compileReturn(): void {
        this.assertToken(KeywordToken.RETURN);
        if (this.tokenizer.token() === SymbolToken.SEMICOLON) {
            if (this.subroutineReturnType !== KeywordToken.VOID)
                throw new SyntaxException();
            this.tokenizer.advance();
            this.vmwriter.writePush('constant', 0);
        } else {
            if (this.subroutineReturnType === KeywordToken.VOID)
                throw new SyntaxException();
            if (this.subroutineType === 'constructor') {
                if (this.tokenizer.token() !== KeywordToken.THIS)
                    throw new SyntaxException();
                this.compileTerm();
            } else {
                this.compileExpression();
            }
            this.assertToken(SymbolToken.SEMICOLON); 
        }
        this.vmwriter.writeReturn();
    }
    
    private compileIf(): void {
        const l1 = this.labelCounter++;
        this.assertToken('if');
        this.assertToken(SymbolToken.OPENING_PARENTHESIS);
        this.compileExpression();
        this.vmwriter.writeArithmetic(SymbolToken.NOT);
        this.vmwriter.writeIf('FALSE_CASE' + l1);
        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
        this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);
        this.compileStatements();
        const returnInIfBlock = this.lastStatementIsReturn;
        this.lastStatementIsReturn = false;
        this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);

        if (this.tokenizer.token() === 'else') {
            const l2 = this.labelCounter++;
            this.tokenizer.advance();
            this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);
            this.vmwriter.writeGoto('TRUE_CASE' + l2);
            this.vmwriter.writeLabel('FALSE_CASE' + l1);
            this.compileStatements();
            this.lastStatementIsReturn &&= returnInIfBlock;
            this.vmwriter.writeLabel('TRUE_CASE' + l2);
            this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
        } else {
            this.vmwriter.writeLabel('FALSE_CASE' + l1);
        }
    }

    private compileExpression(): void {
        this.compileTerm();
        const op = this.tokenizer.token() as SymbolToken;
        if (ops.includes(op)) {
            this.tokenizer.advance();
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
                    case KeywordToken.TRUE:
                        this.vmwriter.writePush('constant', 1);
                        this.vmwriter.writeArithmetic(SymbolToken.SUBTRACT, false);
                        break;
                    case KeywordToken.FALSE:
                    case KeywordToken.NULL:
                        this.vmwriter.writePush('constant', 0);
                        break;
                    case KeywordToken.THIS:
                        if (this.subroutineType === KeywordToken.FUNCTION)
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
                    case SymbolToken.OPENING_BRACKET:
                        if (prevTokenKind === null || prevTokenKind === 'this' && this.subroutineType === KeywordToken.FUNCTION)
                            throw new SyntaxException();
                        this.vmwriter.writePush(prevTokenKind, prevTokenIndex);

                        this.tokenizer.advance();
                        this.compileExpression();
                        this.vmwriter.writeArithmetic(SymbolToken.ADD);
                        this.assertToken(SymbolToken.CLOSING_BRACKET);
                        while (this.tokenizer.token() === SymbolToken.OPENING_BRACKET) {
                            this.vmwriter.writePop('pointer', 1);
                            this.vmwriter.writePush('that', 0);

                            this.tokenizer.advance();
                            this.compileExpression();
                            this.vmwriter.writeArithmetic(SymbolToken.ADD);
                            this.assertToken(SymbolToken.CLOSING_BRACKET);
                        }
                        this.vmwriter.writePop('pointer', 1);
                        this.vmwriter.writePush('that', 0);
                        break;
                    case SymbolToken.OPENING_PARENTHESIS:
                    case SymbolToken.PERIOD:
                        this.compileSubroutineCall(prevToken);
                        break;
                    default:
                        if (prevTokenKind === null || prevTokenKind === 'this' && this.subroutineType === KeywordToken.FUNCTION)
                            throw new SyntaxException();
                        this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
                }
                break;
            case TokenType.SYMBOL:
                switch (this.tokenizer.token()) {
                    case SymbolToken.NOT:
                        this.tokenizer.advance();
                        this.compileTerm();
                        this.vmwriter.writeArithmetic(SymbolToken.NOT);
                        break;
                    case SymbolToken.SUBTRACT:
                        this.tokenizer.advance();
                        this.compileTerm();
                        this.vmwriter.writeArithmetic(SymbolToken.SUBTRACT, false);
                        break;
                    case SymbolToken.OPENING_PARENTHESIS:
                        this.tokenizer.advance();
                        this.compileExpression();
                        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
                        break;
                    default:
                        throw new SyntaxException();
                } 
                break;
        }
    }

    private compileExpressionList(): number {
        let nArgs = 0;
        if (this.tokenizer.token() !== SymbolToken.CLOSING_PARENTHESIS) {
            this.compileExpression();
            nArgs++;
            while (this.tokenizer.token() === SymbolToken.COMMA) {
                this.tokenizer.advance();
                this.compileExpression();
                nArgs++;
            }
        }
        return nArgs;
    }
}