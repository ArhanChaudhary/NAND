import { KeywordToken, TokenType, SymbolToken } from "./tokenizer";

function tokenStringToTypeString(tokenString: string): string | null {
  if (Object.values<string>(KeywordToken).includes(tokenString)) {
    return tokenTypeToString(TokenType.KEYWORD);
  }
  if (Object.values<string>(SymbolToken).includes(tokenString)) {
    return tokenTypeToString(TokenType.SYMBOL);
  }
  return "token";
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

function expectedTokenToString(tokenTypeOrString: string | TokenType): string {
  if (typeof tokenTypeOrString === "string") {
    return `'${tokenTypeOrString}'`;
  }
  return tokenTypeToString(tokenTypeOrString);
}

function joinExpectedTokensWithOr(arr: (string | TokenType)[]): string {
  if (arr.length === 0) {
    return "";
  }
  if (arr.length === 1) {
    return expectedTokenToString(arr[0]);
  }
  if (arr.length === 2) {
    return `${expectedTokenToString(arr[0])} or ${expectedTokenToString(
      arr[1]
    )}`;
  }
  return `${arr
    .slice(0, -1)
    .map(expectedTokenToString)
    .join(", ")}, or ${expectedTokenToString(arr.slice(-1)[0])}`;
}

export abstract class CompilerError {
  protected fileName: string;
  protected line: string;
  protected lineNumber: number;
  protected lineIndex: number;
  protected message!: string;
  private errorType: string;

  constructor(
    fileName: string,
    line: string,
    lineNumber: number,
    lineIndex: number,
    errorType: string
  ) {
    this.fileName = fileName;
    this.line = line;
    this.lineNumber = lineNumber;
    // Math.max can lead to confusing error messages if on new lines
    // but i dont care
    this.lineIndex = Math.max(lineIndex, 1);
    this.errorType = errorType;
  }

  public toString(): string {
    return `
  ${this.line}
  ${" ".repeat(this.lineIndex - 1)}^
${this.errorType}: ${this.message}
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
    super(fileName, line, lineNumber, lineIndex, "SyntaxError");
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
      return `${tokenStringToTypeString(expectedToken)} '${expectedToken}'`;
    }
    if (Array.isArray(expectedToken)) {
      return `token ${joinExpectedTokensWithOr(expectedToken)}`;
    }
    if (expectedToken in TokenType) {
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
    super(fileName, line, lineNumber, lineIndex, "NameError");
    this.message = `${message} (expected ${tokenStringToTypeString(
      expectedName
    )} '${expectedName}')`;
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
    super(fileName, line, lineNumber, lineIndex, "ReferenceError");
    this.message = message;
  }
}

export class BroadCompilerError extends CompilerError {
  constructor(activeTab: string, private stringified: string) {
    super(activeTab, "", 1, 1, "BroadCompilerError");
    this.stringified = stringified;
  }

  public toString(): string {
    return this.stringified;
  }
}
