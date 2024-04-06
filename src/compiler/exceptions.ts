import { TokenType } from "./tokenizer";

abstract class CompilerError {
  protected file: string;
  protected line: string;
  protected lineNumber: number;
  protected lineIndex: number;
  protected message!: string;

  constructor(
    file: string,
    line: string,
    lineNumber: number,
    lineIndex: number
  ) {
    this.file = file;
    this.line = line;
    this.lineNumber = lineNumber;
    this.lineIndex = lineIndex;
  }

  public toString(): string {
    return `
  ${this.line}
  ${" ".repeat(this.lineIndex - 1)}^
${this.constructor.name}: ${this.message}
  at ${this.file}.jack:${this.lineNumber}:${this.lineIndex}
`;
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
