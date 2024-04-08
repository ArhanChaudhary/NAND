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
  constructor(
    file: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    expectedToken: null | string | TokenType | (string | TokenType)[],
    info?: string
  ) {
    super(file, line, lineNumber, lineIndex);
    if (expectedToken === null) {
      this.message = "expected token";
    } else if (expectedToken === "") {
      this.message = "expected end of file";
    } else {
      this.message = `expected token ${this.expectedTokenToEnglish(
        expectedToken
      )}`;
    }
    if (info) {
      this.message += ` (${info})`;
    }
  }

  private expectedTokenToEnglish(
    expectedToken: string | TokenType | (string | TokenType)[]
  ): string {
    if (typeof expectedToken === "string") {
      return `'${expectedToken}'`;
    } else if (Array.isArray(expectedToken)) {
      return expectedToken.map((i) => `'${i}'`).join(", ");
    } else if (expectedToken in TokenType) {
      return `'${TokenType[expectedToken]}'`;
    } else {
      return "''";
    }
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
