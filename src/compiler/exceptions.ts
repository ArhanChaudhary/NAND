import { TokenType } from "./tokenizer";

export abstract class CompilerError {
  protected fileName: string;
  protected line: string;
  protected lineNumber: number;
  protected lineIndex: number;
  protected message!: string;

  constructor(
    fileName: string,
    line: string,
    lineNumber: number,
    lineIndex: number
  ) {
    this.fileName = fileName;
    this.line = line;
    this.lineNumber = lineNumber;
    this.lineIndex = lineIndex;
  }

  public toString(): string {
    return `
  ${this.line}
  ${" ".repeat(this.lineIndex - 1)}^
${this.constructor.name}: ${this.message}
  at ${this.fileName}.jack:${this.lineNumber}:${this.lineIndex}
`;
  }

  public getLineNumber() {
    return this.lineNumber;
  }

  public getFileName() {
    return this.fileName;
  }
}

export class SyntaxError extends CompilerError {
  private expectedToken: string | TokenType | (string | TokenType)[];

  constructor(
    file: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    expectedToken: string | TokenType | (string | TokenType)[],
    info?: string
  ) {
    super(file, line, lineNumber, lineIndex);
    this.expectedToken = expectedToken;
    if (this.expectedToken === "") {
      this.message = "expected token";
    } else {
      this.message = `expected token ${this.expectedTokenToEnglish()}`;
    }
    if (info) {
      this.message += ` (${info})`;
    }
  }

  private expectedTokenToEnglish(): string {
    if (typeof this.expectedToken === "string") {
      return `'${this.expectedToken}'`;
    } else if (Array.isArray(this.expectedToken)) {
      return this.expectedToken.map((i) => `'${i}'`).join(", ");
    } else if (this.expectedToken in TokenType) {
      return `'${TokenType[this.expectedToken]}'`;
    }
    return "''";
  }
}

export class NameError extends CompilerError {
  constructor(
    file: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    expectedName: string,
    message: string
  ) {
    super(file, line, lineNumber, lineIndex);
    this.message = `${message} (expected identifier ${expectedName})`;
  }
}

export class ReferenceError extends CompilerError {
  constructor(
    file: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    message: string
  ) {
    super(file, line, lineNumber, lineIndex);
    this.message = message;
  }
}
