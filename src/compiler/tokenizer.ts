import nReadlines from "n-readlines";
import { NANDException } from "../core/exceptions";

export enum TokenType {
    KEYWORD,
    SYMBOL,
    IDENTIFIER,
    INT_CONST,
    STRING_CONST,
}

const SymbolTokens = [
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    '.',
    ',',
    ';',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '=',
    '~',
];

const Keywords = [
    'class',
    'method',
    'function',
    'constructor',
    'int',
    'boolean',
    'char',
    'void',
    'var',
    'static',
    'field',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return',
    'true',
    'false',
    'null',
    'this',
]

const Digits = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
]

export default class Tokenizer {
    private fileStream: nReadlines;
    private currentLine = '';
    private currentLineNumber = 0;
    private currentLineIndex = 0;
    private currentToken: string | null = null;
    private currentTokenType: TokenType | null = null;
    private inComment = false;

    constructor(file: string) {
        this.fileStream = new nReadlines(file);
    }

    static isLetter(char: string): boolean {
        return /[a-z]/i.test(char) || char === '_';
    }

    static isNumber(char: string): boolean {
        return Digits.includes(char);
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
                    throw new NANDException("Invalid end comment");
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
        let line: Buffer | boolean;
        if (this.currentLine.length === this.currentLineIndex) {
            line = this.fileStream.next();
            this.currentLineNumber++;
            if (!line) {
                return false;
            }
            this.currentLineIndex = 0;
            this.currentLine = line.toString('ascii');
            this.removeComments();
            this.currentLine = this.currentLine.trim();
            if (!this.currentLine)
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
                if (SymbolTokens.includes(char)) {
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
                    throw new NANDException("Unrecognized token: " + this.currentLine.substring(start, this.currentLineIndex))
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
                    if (Keywords.includes(this.currentToken)) {
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
                    throw new NANDException(`Invalid token type ${this.currentTokenType} for: ${this.currentLine.substring(start, this.currentLineIndex)}`);
            }
        } while (++this.currentLineIndex < this.currentLine.length);
        if (this.currentToken === null) {
            return this.advance();
        }
        return true;
    }

    public tokenType(): TokenType {
        if (this.currentTokenType === null)
            throw new NANDException("Null token has no type at line: " + this.currentLine);
        return this.currentTokenType;
    }

    public token(): string {
        if (this.currentToken === null)
            throw new NANDException("Token does not exist at line: " + this.currentLine);
        return this.currentToken;
    }
}