import Tokenizer, { TokenType, SymbolToken, KeywordToken } from "./tokenizer";
import SymbolTable from "./symboltable";
import VMWriter from "./vmwriter";
import { NameError, SyntaxError, ReferenceError } from "./exceptions";

const VarType = [
  KeywordToken.INT,
  KeywordToken.CHAR,
  KeywordToken.BOOLEAN,
  TokenType.IDENTIFIER,
] as (string | TokenType)[];

const OPS = [
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
  private className = "";
  private subroutineName = "";
  private subroutineNames: string[] = [];
  private subroutineCalls: { name: string }[] = [];
  private subroutineType = "";
  private subroutineReturnType = "";
  private lastStatementIsReturn = false;
  private labelCounter = 0;

  constructor(fileData: { fileName: string; file: string[] }) {
    this.fileName = fileData.fileName;
    this.tokenizer = new Tokenizer(fileData.file);
    this.vmwriter = new VMWriter();
    this.symbolTable = new SymbolTable();
    this.tokenizer.advance();
  }

  public getOut(): { fileName: string; VMCode: string[] } {
    return {
      fileName: this.fileName,
      VMCode: this.vmwriter.getOut(),
    };
  }

  private syntaxError(
    expectedToken: string | TokenType | (string | TokenType)[],
    info?: string
  ): SyntaxError {
    return new SyntaxError(
      this.fileName,
      this.tokenizer.line(),
      this.tokenizer.lineNumber(),
      this.tokenizer.lineIndex(),
      expectedToken,
      info
    );
  }

  private nameError(expectedToken: string, message: string): NameError {
    return new NameError(
      this.fileName,
      this.tokenizer.line(),
      this.tokenizer.lineNumber(),
      this.tokenizer.lineIndex(),
      expectedToken,
      message
    );
  }

  private referenceError(
    message: string,
    line?: string,
    lineNumber?: number,
    lineIndex?: number
  ): ReferenceError {
    return new ReferenceError(
      this.fileName,
      line || this.tokenizer.line(),
      lineNumber || this.tokenizer.lineNumber(),
      lineIndex || this.tokenizer.lineIndex(),
      message
    );
  }

  private define(type: string, kind: string): void {
    if (!this.symbolTable.define(this.tokenizer.token(), type, kind))
      throw this.referenceError(
        `variable '${this.tokenizer.token()}' can only be declared once`
      );
  }

  private validateVar(
    token: string,
    line?: string,
    lineNumber?: number,
    lineIndex?: number
  ): void {
    const kind = this.symbolTable.kindOf(token) as string;
    if (kind === null)
      throw this.referenceError(
        `variable '${token}' was never declared`,
        line,
        lineNumber,
        lineIndex
      );
    if (kind === "this" && this.subroutineType === KeywordToken.FUNCTION)
      throw this.referenceError(
        `field variable '${token}' cannot be used in a function`,
        line,
        lineNumber,
        lineIndex
      );
  }

  private assertToken(
    expectedToken: string | TokenType | (string | TokenType)[]
  ): void {
    if (typeof expectedToken === "string") {
      if (this.tokenizer.token() !== expectedToken)
        throw this.syntaxError(expectedToken);
    } else if (Array.isArray(expectedToken)) {
      if (
        !expectedToken.includes(this.tokenizer.token()) &&
        !expectedToken.includes(this.tokenizer.tokenType())
      )
        throw this.syntaxError(expectedToken);
    } else if (expectedToken in TokenType) {
      if (this.tokenizer.tokenType() !== expectedToken)
        throw this.syntaxError(expectedToken);
    }
    this.tokenizer.advance();
  }

  public compileClass(): void {
    this.assertToken(KeywordToken.CLASS);
    this.className = this.tokenizer.token();
    if (this.className !== this.fileName)
      throw this.nameError(this.fileName, "class name must match file name");
    this.assertToken(TokenType.IDENTIFIER);
    this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);

    while (
      [KeywordToken.FIELD, KeywordToken.STATIC].includes(
        this.tokenizer.token() as KeywordToken
      )
    ) {
      this.compileClassVarDec();
    }

    while (
      [
        KeywordToken.CONSTRUCTOR,
        KeywordToken.METHOD,
        KeywordToken.FUNCTION,
      ].includes(this.tokenizer.token() as KeywordToken)
    ) {
      this.compileSubroutine();
    }

    this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
    for (const call of this.subroutineCalls) {
      if (!this.subroutineNames.includes(call.name)) {
      }
      // throw new SyntaxError();
    }
  }

  private compileClassVarDec(): void {
    let kind!: string;
    switch (this.tokenizer.token()) {
      case KeywordToken.FIELD:
        kind = "this";
        break;
      case KeywordToken.STATIC:
        kind = "static";
        break;
      default:
        throw this.syntaxError([KeywordToken.FIELD, KeywordToken.STATIC]);
    }
    this.tokenizer.advance();
    const type = this.tokenizer.token();
    this.assertToken(VarType);
    this.define(type, kind);
    this.assertToken(TokenType.IDENTIFIER);

    while (this.tokenizer.token() === SymbolToken.COMMA) {
      this.tokenizer.advance();
      this.define(type, kind);
      this.assertToken(TokenType.IDENTIFIER);
    }

    this.assertToken(SymbolToken.SEMICOLON);
  }

  private compileSubroutine(): void {
    this.subroutineType = this.tokenizer.token();
    this.symbolTable.startSubroutine(this.subroutineType);
    this.assertToken([
      KeywordToken.CONSTRUCTOR,
      KeywordToken.FUNCTION,
      KeywordToken.METHOD,
    ]);
    this.subroutineReturnType = this.tokenizer.token();
    this.assertToken([KeywordToken.VOID, ...VarType]);
    if (
      this.subroutineType === KeywordToken.CONSTRUCTOR &&
      this.subroutineReturnType !== this.className
    )
      throw this.nameError(
        this.className,
        "constructor return type must be its class"
      );
    this.subroutineName = this.tokenizer.token();
    this.assertToken(TokenType.IDENTIFIER);
    if (this.subroutineNames.includes(this.subroutineName))
      throw this.referenceError(
        `subroutine '${this.subroutineName}' can only be declared once`
      );
    this.subroutineNames.push(this.subroutineName);
    this.assertToken(SymbolToken.OPENING_PARENTHESIS);
    this.compileParameterList();
    this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
    this.assertToken(SymbolToken.OPENING_CURLY_BRACKET);
    this.lastStatementIsReturn = false;
    this.compileSubroutineBody();
    if (!this.lastStatementIsReturn) {
      if (this.subroutineType === KeywordToken.CONSTRUCTOR) {
        this.vmwriter.writePush("pointer", 0);
      } else {
        if (this.subroutineReturnType !== KeywordToken.VOID)
          throw this.syntaxError(KeywordToken.RETURN);
        this.vmwriter.writePush("constant", 0);
      }
      this.vmwriter.writeReturn();
    }
    this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
  }

  private compileParameterList(): void {
    if (
      VarType.includes(this.tokenizer.token()) ||
      VarType.includes(this.tokenizer.tokenType())
    ) {
      const type = this.tokenizer.token();
      this.assertToken(VarType);
      this.define(type, "argument");
      this.assertToken(TokenType.IDENTIFIER);
      while (this.tokenizer.token() === SymbolToken.COMMA) {
        this.tokenizer.advance();
        const type = this.tokenizer.token();
        this.assertToken(VarType);
        this.define(type, "argument");
        this.assertToken(TokenType.IDENTIFIER);
      }
    }
  }

  private compileSubroutineBody(): void {
    while (this.tokenizer.token() === KeywordToken.VAR) {
      this.compileVarDec();
    }

    this.vmwriter.writeFunction(
      `${this.className}.${this.subroutineName}`,
      this.symbolTable.count("local")
    );
    switch (this.subroutineType) {
      case KeywordToken.CONSTRUCTOR:
        if (this.symbolTable.count("this") === 0) break;
        this.vmwriter.writePush("constant", this.symbolTable.count("this"));
        this.vmwriter.writeCall("Memory.alloc", 1);
        this.vmwriter.writePop("pointer", 0);
        break;
      case KeywordToken.METHOD:
        this.vmwriter.writePush("argument", 0);
        this.vmwriter.writePop("pointer", 0);
        break;
    }

    this.compileStatements();
  }

  private compileVarDec(): void {
    this.assertToken(KeywordToken.VAR);
    const type = this.tokenizer.token();
    // TODO: check if identifier type is a class
    this.assertToken(VarType);
    this.define(type, "local");
    this.assertToken(TokenType.IDENTIFIER);

    while (this.tokenizer.token() === SymbolToken.COMMA) {
      this.tokenizer.advance();
      this.define(type, "local");
      this.assertToken(TokenType.IDENTIFIER);
    }

    this.assertToken(SymbolToken.SEMICOLON);
  }

  private compileStatements(): void {
    while (this.compileStatement()) {}
  }

  private compileStatement(): boolean {
    switch (this.tokenizer.token()) {
      case KeywordToken.LET:
      case KeywordToken.IF:
      case KeywordToken.WHILE:
      case KeywordToken.DO:
        if (this.lastStatementIsReturn)
          throw this.syntaxError(
            SymbolToken.CLOSING_CURLY_BRACKET,
            "return must be the last statement in a subroutine"
          );
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
        return false;
    }
    return true;
  }

  private compileSubroutineCall(
    prevToken: string,
    line: string,
    lineNumber: number,
    lineIndex: number
  ): void {
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
          throw this.syntaxError(
            SymbolToken.PERIOD,
            "class functions cannot call instance methods"
          );
        this.vmwriter.writePush("pointer", 0);
        nArgs = this.compileExpressionList();
        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
        this.vmwriter.writeCall(`${this.className}.${prevToken}`, nArgs + 1);
        break;
      case SymbolToken.PERIOD:
        // TODO: check if class has subroutine
        if (prevTokenType !== null) {
          this.validateVar(prevToken, line, lineNumber, lineIndex);
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
        this.vmwriter.writeCall(
          `${subroutineClass}.${subroutineMethod}`,
          nArgs
        );
        break;
      default:
        throw this.syntaxError([SymbolToken.OPENING_PARENTHESIS, SymbolToken.PERIOD]);
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

  private compileDo(): void {
    this.assertToken(KeywordToken.DO);
    const prevToken = this.tokenizer.token();
    const prevLine = this.tokenizer.line();
    const prevLineNumber = this.tokenizer.lineNumber();
    const prevLineIndex = this.tokenizer.lineIndex();
    this.assertToken(TokenType.IDENTIFIER);
    this.compileSubroutineCall(
      prevToken,
      prevLine,
      prevLineNumber,
      prevLineIndex
    );
    this.assertToken(SymbolToken.SEMICOLON);
    this.vmwriter.writePop("temp", 0);
  }

  private compileLet(): void {
    this.assertToken(KeywordToken.LET);
    this.validateVar(this.tokenizer.token());
    const kind = this.symbolTable.kindOf(this.tokenizer.token()) as string;
    const index = this.symbolTable.indexOf(this.tokenizer.token()) as number;
    this.assertToken(TokenType.IDENTIFIER);
    switch (this.tokenizer.token()) {
      case SymbolToken.OPENING_BRACKET:
        this.vmwriter.writePush(kind, index);
        this.compileArrayAccess();
        this.assertToken(SymbolToken.EQUAL);
        this.compileExpression();
        this.vmwriter.writePop("temp", 0);
        this.vmwriter.writePop("pointer", 1);
        this.vmwriter.writePush("temp", 0);
        this.vmwriter.writePop("that", 0);
        break;
      case SymbolToken.EQUAL:
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
    this.vmwriter.writeLabel("WHILE_ITER" + l1);
    this.compileExpression();
    this.vmwriter.writeArithmetic(SymbolToken.NOT);
    this.vmwriter.writeIf("WHILE_BREAKER" + l2);
    this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
    if (this.tokenizer.token() === SymbolToken.OPENING_CURLY_BRACKET) {
      this.tokenizer.advance();
      this.compileStatements();
      this.vmwriter.writeGoto("WHILE_ITER" + l1);
      this.vmwriter.writeLabel("WHILE_BREAKER" + l2);
      this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
    } else {
      this.compileStatement();
      this.vmwriter.writeGoto("WHILE_ITER" + l1);
      this.vmwriter.writeLabel("WHILE_BREAKER" + l2);
    }
  }

  private compileReturn(): void {
    this.assertToken(KeywordToken.RETURN);
    if (this.tokenizer.token() === SymbolToken.SEMICOLON) {
      if (this.subroutineReturnType !== KeywordToken.VOID)
        throw this.syntaxError(
          "",
          `subroutine must return type '${this.subroutineReturnType}'`
        );
      this.tokenizer.advance();
      this.vmwriter.writePush("constant", 0);
    } else {
      if (this.subroutineReturnType === KeywordToken.VOID)
        throw this.syntaxError(
          SymbolToken.SEMICOLON,
          "void subroutine cannot have a return value"
        );
      if (this.subroutineType === KeywordToken.CONSTRUCTOR) {
        if (this.tokenizer.token() !== KeywordToken.THIS)
          throw this.syntaxError(
            KeywordToken.THIS,
            "constructors can only return 'this'"
          );
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
    this.assertToken(KeywordToken.IF);
    this.assertToken(SymbolToken.OPENING_PARENTHESIS);
    this.compileExpression();
    this.vmwriter.writeArithmetic(SymbolToken.NOT);
    this.vmwriter.writeIf("FALSE_CASE" + l1);
    this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
    if (this.tokenizer.token() === SymbolToken.OPENING_CURLY_BRACKET) {
      this.tokenizer.advance();
      this.compileStatements();
      this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
    } else {
      this.compileStatement();
    }
    const returnInIfBlock = this.lastStatementIsReturn;
    this.lastStatementIsReturn = false;
    if (this.tokenizer.token() === KeywordToken.ELSE) {
      const l2 = this.labelCounter++;
      this.tokenizer.advance();
      if (this.tokenizer.token() === SymbolToken.OPENING_CURLY_BRACKET) {
        this.tokenizer.advance();
        this.vmwriter.writeGoto("TRUE_CASE" + l2);
        this.vmwriter.writeLabel("FALSE_CASE" + l1);
        this.compileStatements();
        this.vmwriter.writeLabel("TRUE_CASE" + l2);
        this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
      } else {
        this.vmwriter.writeGoto("TRUE_CASE" + l2);
        this.vmwriter.writeLabel("FALSE_CASE" + l1);
        this.compileStatement();
        this.vmwriter.writeLabel("TRUE_CASE" + l2);
      }
      this.lastStatementIsReturn &&= returnInIfBlock;
    } else {
      this.vmwriter.writeLabel("FALSE_CASE" + l1);
    }
  }

  private compileExpression(): void {
    this.compileTerm();
    const op = this.tokenizer.token() as SymbolToken;
    if (OPS.includes(op)) {
      this.tokenizer.advance();
      this.compileExpression();
      this.vmwriter.writeArithmetic(op);
    }
  }

  private compileTerm(): void {
    switch (this.tokenizer.tokenType()) {
      case TokenType.INT_CONST:
        if (Number(this.tokenizer.token()) >= 32768) {
          throw this.syntaxError("32767 or less", "integer literal is too large");
        }
        this.vmwriter.writePush("constant", this.tokenizer.token());
        this.assertToken(TokenType.INT_CONST);
        break;
      case TokenType.STRING_CONST:
        this.vmwriter.writePush("constant", this.tokenizer.token().length);
        for (let i = 0; i < this.tokenizer.token().length; i += 2) {
          this.vmwriter.writePush(
            "constant",
            this.tokenizer.token().charCodeAt(i) |
              (this.tokenizer.token().charCodeAt(i + 1) << 7)
          );
        }
        this.vmwriter.writeCall(
          "String.newWithStr",
          Math.ceil(this.tokenizer.token().length / 2) + 1
        );
        this.assertToken(TokenType.STRING_CONST);
        break;
      case TokenType.KEYWORD:
        switch (this.tokenizer.token()) {
          case KeywordToken.TRUE:
            this.vmwriter.writePush("constant", 1);
            this.vmwriter.writeArithmetic(SymbolToken.SUBTRACT, false);
            this.tokenizer.advance();
            break;
          case KeywordToken.FALSE:
          case KeywordToken.NULL:
            this.vmwriter.writePush("constant", 0);
            this.tokenizer.advance();
            break;
          case KeywordToken.THIS:
            if (this.subroutineType === KeywordToken.FUNCTION)
              throw this.referenceError("functions cannot reference 'this'");
            this.vmwriter.writePush("pointer", 0);
            this.tokenizer.advance();
            break;
          case KeywordToken.ARGUMENTS:
            this.vmwriter.writePush("pointer", -1);
            if (this.subroutineType === KeywordToken.METHOD) {
              this.vmwriter.writePush("constant", 1);
              this.vmwriter.writeArithmetic(SymbolToken.ADD);
            }
            this.tokenizer.advance();
            if (this.tokenizer.token() === SymbolToken.OPENING_BRACKET) {
              this.compileArrayAccess();
              this.vmwriter.writePop("pointer", 1);
              this.vmwriter.writePush("that", 0);
            }
            break;
          default:
            throw this.syntaxError([
              KeywordToken.TRUE,
              KeywordToken.FALSE,
              KeywordToken.NULL,
              KeywordToken.THIS,
            ]);
        }
        break;
      case TokenType.IDENTIFIER:
        const prevToken = this.tokenizer.token();
        const prevTokenKind = this.symbolTable.kindOf(prevToken) as string;
        const prevTokenIndex = this.symbolTable.indexOf(prevToken) as number;
        const prevLine = this.tokenizer.line();
        const prevLineNumber = this.tokenizer.lineNumber();
        const prevLineIndex = this.tokenizer.lineIndex();
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
            this.validateVar(
              prevToken,
              prevLine,
              prevLineNumber,
              prevLineIndex
            );
            this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
            this.compileArrayAccess();
            this.vmwriter.writePop("pointer", 1);
            this.vmwriter.writePush("that", 0);
            break;
          case SymbolToken.OPENING_PARENTHESIS:
          case SymbolToken.PERIOD:
            this.compileSubroutineCall(
              prevToken,
              prevLine,
              prevLineNumber,
              prevLineIndex
            );
            break;
          default:
            this.validateVar(
              prevToken,
              prevLine,
              prevLineNumber,
              prevLineIndex
            );
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
            throw this.syntaxError([
              SymbolToken.NOT,
              SymbolToken.SUBTRACT,
              SymbolToken.OPENING_PARENTHESIS,
            ]);
        }
        break;
    }
  }

  private compileArrayAccess(): void {
    this.tokenizer.advance();
    this.compileExpression();
    this.vmwriter.writeArithmetic(SymbolToken.ADD);
    this.assertToken(SymbolToken.CLOSING_BRACKET);
    while (this.tokenizer.token() === SymbolToken.OPENING_BRACKET) {
      this.vmwriter.writePop("pointer", 1);
      this.vmwriter.writePush("that", 0);

      this.tokenizer.advance();
      this.compileExpression();
      this.vmwriter.writeArithmetic(SymbolToken.ADD);
      this.assertToken(SymbolToken.CLOSING_BRACKET);
    }
  }
}
