export enum TokenType {
    KEYWORD,
    SYMBOL,
    IDENTIFIER,
    INT_CONST,
    STRING_CONST,
}

export enum SymbolToken {
    OPENING_CURLY_BRACKET='{',
    CLOSING_CURLY_BRACKET='}',
    OPENING_PARENTHESIS='(',
    CLOSING_PARENTHESIS=')',
    OPENING_BRACKET='[',
    CLOSING_BRACKET=']',
    PERIOD='.',
    COMMA=',',
    SEMICOLON=';',
    ADD='+',
    SUBTRACT='-',
    MULTIPLY='*',
    DIVIDE='/',
    AND='&',
    OR='|',
    LESS_THAN='<',
    GREATER_THAN='>',
    EQUAL='=',
    NOT='~',
}

export enum KeywordToken {
    CLASS='class',
    METHOD='method',
    FUNCTION='function',
    CONSTRUCTOR='constructor',
    INT='int',
    BOOLEAN='boolean',
    CHAR='char',
    VOID='void',
    VAR='var',
    STATIC='static',
    FIELD='field',
    LET='let',
    DO='do',
    IF='if',
    ELSE='else',
    WHILE='while',
    RETURN='return',
    TRUE='true',
    FALSE='false',
    NULL='null',
    THIS='this',
}

export default class Tokenizer {
    constructor(private inputStream: string[]) {}
    private inputStreamIndex = 0;
    private currentLine = '';
    private prevLineIndex = 0;
    private currentLineIndex = 0;
    private currentToken: string | null = null;
    private currentTokenType: TokenType | null = null;
    private inComment = false;

    static isLetter(char: string): boolean {
        return /[a-z]/i.test(char) || char === '_';
    }

    static isNumber(char: string): boolean {
        return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(char);
    }

    private removeComments(): void {
        let startComment = this.currentLine.indexOf("/*");
        let endComment = this.currentLine.indexOf("*/");
        if (endComment !== -1) {
            endComment += 2;
        }
        if (startComment === -1) {
            if (endComment === -1) {
                if (this.inComment) {
                    this.currentLine = '';
                    this.currentLineIndex = 0;
                    return;
                }
            } else {
                if (!this.inComment) {
                    throw new Error("Invalid end comment");
                }
                this.inComment = false;
                this.currentLine = this.currentLine.substring(endComment);
            }
        } else {
            if (endComment === -1) {
                this.currentLine = this.currentLine.substring(0, startComment);
                this.inComment = true;
            } else {
                this.currentLine = this.currentLine.substring(0, startComment) + this.currentLine.substring(endComment);
                this.removeComments();
                return;
            }
        }
        const comment = this.currentLine.indexOf("//");
        if (comment !== -1)
            this.currentLine = this.currentLine.substring(0, comment);
    }

    public advance(): boolean {
        let line: string | undefined;
        if (this.currentLine.length === this.currentLineIndex) {
            line = this.inputStream[this.inputStreamIndex++];
            if (line === undefined) {
                // without this tokens stay as their own value
                this.currentToken = '';
                return false;
            }
            this.currentLineIndex = 0;
            this.currentLine = line;
            this.removeComments();
            this.currentLine = this.currentLine.trim();
            if (this.currentLine === '')
                return this.advance();
        }
        let start = this.currentLineIndex;
        let firstIteration = true;
        this.currentToken = null;
        findToken: do {
            const char = this.currentLine[this.currentLineIndex];
            if (char === undefined) {
                break;
            }
            if (firstIteration) {
                if (char === ' ') {
                    start++;
                    continue;
                }
                this.prevLineIndex = this.currentLineIndex;
                if (Object.values<string>(SymbolToken).includes(char)) {
                    this.currentToken = char;
                    this.currentTokenType = TokenType.SYMBOL;
                    this.currentLineIndex++;
                    break;
                }
                firstIteration = false;
                if (char === '"') {
                    start++;
                    this.currentTokenType = TokenType.STRING_CONST;
                } else if (Tokenizer.isLetter(char)) {
                    this.currentTokenType = TokenType.IDENTIFIER;
                } else if (Tokenizer.isNumber(char)) {
                    this.currentTokenType = TokenType.INT_CONST;
                } else {
                    throw new Error("Unrecognized token: " + this.currentLine.substring(start, this.currentLineIndex))
                }
                continue;
            }
            switch (this.currentTokenType) {
                case TokenType.STRING_CONST:
                    if (char !== '"') {
                        break;
                    }
                    this.currentToken = this.currentLine.substring(start, this.currentLineIndex);
                    this.currentLineIndex++;
                    break findToken;
                case TokenType.IDENTIFIER:
                    if (Tokenizer.isLetter(char) || Tokenizer.isNumber(char)) {
                        break;
                    }
                    this.currentToken = this.currentLine.substring(start, this.currentLineIndex);
                    if (Object.values<string>(KeywordToken).includes(this.currentToken)) {
                        this.currentTokenType = TokenType.KEYWORD;
                    }
                    break findToken;
                case TokenType.INT_CONST:
                    if (Tokenizer.isNumber(char)) {
                        break;
                    }
                    this.currentToken = this.currentLine.substring(start, this.currentLineIndex);
                    break findToken;
                default:
                    throw new Error(`Invalid token type ${this.currentTokenType} for: ${this.currentLine.substring(start, this.currentLineIndex)}`);
            }
        } while (++this.currentLineIndex < this.currentLine.length);
        if (this.currentToken === null) {
            if (firstIteration)
                return this.advance();
            this.currentToken = this.currentLine.substring(start, this.currentLineIndex);
            if (Object.values<string>(KeywordToken).includes(this.currentToken)) {
                this.currentTokenType = TokenType.KEYWORD;
            }
        }
        return true;
    }

    public tokenType(): TokenType {
        if (this.currentTokenType === null)
            throw new Error("Null token has no type at line: " + this.currentLine);
        return this.currentTokenType;
    }

    public token(): string {
        if (this.currentToken === null)
            throw new Error("Token does not exist at line: " + this.currentLine);
        return this.currentToken;
    }

    public line(): string {
        return this.currentLine;
    }

    public lineNumber(): number {
        return this.inputStreamIndex;
    }
    
    public lineIndex(): number {
        return this.prevLineIndex + 1;
    }
}