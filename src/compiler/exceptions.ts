import { KeywordToken, TokenType, SymbolToken } from "./tokenizer";

function tokenStringToType(tokenString: string): string {
  if (Object.values<string>(KeywordToken).includes(tokenString)) {
    return tokenTypeToString(TokenType.KEYWORD);
  } else if (Object.values<string>(SymbolToken).includes(tokenString)) {
    return tokenTypeToString(TokenType.SYMBOL);
  }
  throw new Error("Invalid token string");
}

function tokenTypeToString(tokenType: TokenType): string {
  switch (tokenType) {
    case TokenType.KEYWORD:
      return "keyword";
    case TokenType.SYMBOL:
      return "symbol";
    case TokenType.IDENTIFIER:
      return "identifier";
    case TokenType.INT_CONST:
      return "integer constant";
    case TokenType.STRING_CONST:
      return "string constant";
    default:
      throw new Error("Invalid token type");
  }
}

function joinWithOr(arr: string[]): string {
  if (arr.length === 0) {
    return "";
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return `${arr[0]} or ${arr[1]}`;
  } else {
    return `${arr.slice(0, -1).join(", ")}, or ${arr.slice(-1)[0]}`;
  }
}

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
    fileName: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    expectedToken: null | string | TokenType | (string | TokenType)[],
    info?: string
  ) {
    super(fileName, line, lineNumber, lineIndex);
    if (expectedToken === null) {
      this.message = "expected token";
    } else if (expectedToken === "") {
      this.message = "unexpected token";
    } else {
      this.message = `expected ${this.expectedTokenToEnglish(expectedToken)}`;
    }
    if (info) {
      this.message += ` (${info})`;
    }
  }

  private expectedTokenToEnglish(
    expectedToken: string | TokenType | (string | TokenType)[]
  ): string {
    if (typeof expectedToken === "string") {
      return `${tokenStringToType(expectedToken)} '${expectedToken}'`;
    } else if (Array.isArray(expectedToken)) {
      return `token ${joinWithOr(expectedToken.map((i) => `'${i}'`))}`;
    } else if (expectedToken in TokenType) {
      const ret = tokenTypeToString(expectedToken);
      return "aeiou".includes(ret[0].toLowerCase()) ? `an ${ret}` : `a ${ret}`;
    }
    throw new Error("Invalid expected token");
  }
}

export class NameError extends CompilerError {
  constructor(
    fileName: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    expectedName: string,
    message: string
  ) {
    super(fileName, line, lineNumber, lineIndex);
    this.message = `${message} (expected token '${expectedName}')`;
  }
}

export class ReferenceError extends CompilerError {
  constructor(
    fileName: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    message: string
  ) {
    super(fileName, line, lineNumber, lineIndex);
    this.message = message;
  }
}

export class BroadCompilerError extends CompilerError {
  constructor(activeTab: string, private stringified: string) {
    super(activeTab, "", 1, 1);
    this.stringified = stringified;
  }

  public toString(): string {
    return this.stringified;
  }
}
