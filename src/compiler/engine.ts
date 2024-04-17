import Tokenizer, { TokenType, SymbolToken, KeywordToken } from "./tokenizer";
import SymbolTable from "./symboltable";
import VMWriter from "./vmwriter";
import {
  ReferenceError,
  CompilerError,
  BroadCompilerError,
} from "./exceptions";

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
  private subroutineType = "";
  private subroutineReturnType = "";
  private lastStatementIsReturn = false;
  private labelCounter = 0;

  static maxStaticCount = 256 - 16;
  static staticCount = 0;
  static trySubroutineCalls: {
    subroutineClass: string;
    subroutineName: string;
    missingThrowMessage: ReferenceError;
  }[] = [];
  static allSubroutineDeclarations: {
    className: string;
    subroutineName: string;
  }[] = [];
  static internalSubroutineCalls = [
    {
      subroutineClass: "Sys",
      subroutineName: "init",
      subroutineType: KeywordToken.FUNCTION,
      subroutineReturnType: KeywordToken.VOID,
      missingThrowMessageEnding: "as it is the entry point of the program",
      nArgs: 0,
      // cant set to used in vmwriter because that happens after compiling
      used: true,
    },
    {
      subroutineClass: "Memory",
      subroutineName: "alloc",
      subroutineType: KeywordToken.FUNCTION,
      subroutineReturnType: KeywordToken.INT,
      missingThrowMessageEnding:
        "as constructors internally use it to allocate memory. You should copy my implementation of this subroutine as defined in example programs.\n\nIf you do so, make sure to initialize RAM[2048] = 14334 and RAM[2049] = 16384",
      nArgs: 1,
      used: false,
    },
    {
      subroutineClass: "String",
      subroutineName: "newWithStr",
      subroutineType: KeywordToken.CONSTRUCTOR,
      subroutineReturnType: "String",
      missingThrowMessageEnding:
        "as it is internally used to represent string literals. You should copy my implementation of this subroutine as defined in example programs",
      nArgs: 1,
      used: false,
    },
    {
      subroutineClass: "Math",
      subroutineName: "multiply",
      subroutineType: KeywordToken.FUNCTION,
      subroutineReturnType: KeywordToken.INT,
      missingThrowMessageEnding:
        "as it is interally used to multiply two numbers. You should copy my implementation of this subroutine as defined in example programs",
      nArgs: 2,
      used: false,
    },
    {
      subroutineClass: "Math",
      subroutineName: "divide",
      subroutineType: KeywordToken.FUNCTION,
      subroutineReturnType: KeywordToken.INT,
      missingThrowMessageEnding:
        "as it is interally used to divide two numbers. You should copy my implementation of this subroutine as defined in example programs",
      nArgs: 2,
      used: false,
    },
  ];

  static useInternalSubroutineCall(
    subroutineClass: string,
    subroutineName: string
  ) {
    const subroutine = Engine.internalSubroutineCalls.find(
      (subroutine) =>
        subroutine.subroutineClass === subroutineClass &&
        subroutine.subroutineName === subroutineName
    );
    if (subroutine) {
      subroutine.used = true;
    } else {
      throw new Error("invalid internal subroutine call usage");
    }
  }

  constructor(fileData: { fileName: string; file: string[] }) {
    this.fileName = fileData.fileName;
    this.tokenizer = new Tokenizer(fileData);
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

  private define(type: string, kind: string): void {
    if (!this.symbolTable.define(this.tokenizer.token(), type, kind))
      throw this.tokenizer.referenceError(
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
      throw this.tokenizer.referenceError(
        `variable '${token}' was never declared`,
        line,
        lineNumber,
        lineIndex
      );
    if (kind === "this" && this.subroutineType === KeywordToken.FUNCTION)
      throw this.tokenizer.referenceError(
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
        throw this.tokenizer.syntaxError(expectedToken);
    } else if (Array.isArray(expectedToken)) {
      if (
        !expectedToken.includes(this.tokenizer.token()) &&
        !expectedToken.includes(this.tokenizer.tokenType())
      )
        throw this.tokenizer.syntaxError(expectedToken);
    } else if (expectedToken in TokenType) {
      if (this.tokenizer.tokenType() !== expectedToken)
        throw this.tokenizer.syntaxError(expectedToken);
    }
    this.tokenizer.advance();
  }

  public compileClass(): void {
    this.assertToken(KeywordToken.CLASS);
    this.className = this.tokenizer.token();
    if (this.className !== this.fileName)
      throw this.tokenizer.nameError(
        this.fileName,
        "class name must match file name"
      );
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

    if (
      [KeywordToken.FIELD, KeywordToken.STATIC].includes(
        this.tokenizer.token() as KeywordToken
      )
    ) {
      throw this.tokenizer.syntaxError(
        "",
        "all class variables must be declared before any subroutine. Move this variable declaration to the beginning of the class"
      );
    }

    this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
    if (this.tokenizer.token() !== "")
      throw this.tokenizer.syntaxError(
        "",
        "file must end after program declaration"
      );
  }

  private compileClassVarDec(): void {
    let kind!: string;
    switch (this.tokenizer.token()) {
      case KeywordToken.FIELD:
        kind = "this";
        break;
      case KeywordToken.STATIC:
        kind = "static";
        Engine.staticCount++;
        if (Engine.staticCount > Engine.maxStaticCount) {
          throw this.tokenizer.referenceError(
            `${Engine.staticCount} > ${Engine.maxStaticCount} static variables is too many to load into memory`
          );
        }
        break;
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
    if (
      this.subroutineType === KeywordToken.CONSTRUCTOR &&
      this.subroutineReturnType !== this.className
    )
      throw this.tokenizer.nameError(
        this.className,
        "constructor return type must be its class"
      );
    this.assertToken([KeywordToken.VOID, ...VarType]);
    this.subroutineName = this.tokenizer.token();
    if (this.subroutineNames.includes(this.subroutineName))
      throw this.tokenizer.referenceError(
        `subroutine '${this.subroutineName}' can only be declared once`
      );
    let internalSubroutineCall = Engine.internalSubroutineCalls.find(
      (subroutine) =>
        subroutine.subroutineClass === this.className &&
        subroutine.subroutineName === this.subroutineName
    );
    if (internalSubroutineCall) {
      if (this.subroutineType !== internalSubroutineCall.subroutineType) {
        throw this.tokenizer.nameError(
          internalSubroutineCall.subroutineType,
          `${internalSubroutineCall.subroutineClass}.${internalSubroutineCall.subroutineName} must be a class function`,
          this.tokenizer.lineIndex() -
            this.subroutineType.length -
            this.subroutineReturnType.length -
            2
        );
      }
      if (
        this.subroutineReturnType !==
        internalSubroutineCall.subroutineReturnType
      ) {
        throw this.tokenizer.nameError(
          internalSubroutineCall.subroutineReturnType,
          `${internalSubroutineCall.subroutineClass}.${internalSubroutineCall.subroutineName} has a fixed return type`,
          this.tokenizer.lineIndex() - this.subroutineReturnType.length - 1
        );
      }
    }
    this.subroutineNames.push(this.subroutineName);
    Engine.allSubroutineDeclarations.push({
      className: this.className,
      subroutineName: this.subroutineName,
    });
    this.assertToken(TokenType.IDENTIFIER);
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
          throw this.tokenizer.syntaxError(KeywordToken.RETURN);
        this.vmwriter.writePush("constant", 0);
      }
      this.vmwriter.writeReturn();
    }
    this.assertToken(SymbolToken.CLOSING_CURLY_BRACKET);
  }

  private compileParameterList(): void {
    // can lead to compiler display format issues but i dont care
    let originalLineIndex = this.tokenizer.lineIndex();
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
    let internalSubroutineCall = Engine.internalSubroutineCalls.find(
      (subroutine) =>
        subroutine.subroutineClass === this.className &&
        subroutine.subroutineName === this.subroutineName
    );
    if (
      internalSubroutineCall &&
      this.symbolTable.count("argument") !== internalSubroutineCall.nArgs
    ) {
      throw this.tokenizer.syntaxError(
        "",
        `${internalSubroutineCall.subroutineClass}.${
          internalSubroutineCall.subroutineName
        } must have exactly ${internalSubroutineCall.nArgs} argument${
          internalSubroutineCall.nArgs === 1 ? "" : "s"
        }`,
        originalLineIndex
      );
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
        if (this.symbolTable.count("this") !== 0) {
          this.vmwriter.writePush("constant", this.symbolTable.count("this"));
          this.vmwriter.writeCall("Memory.alloc", 1);
          Engine.useInternalSubroutineCall("Memory", "alloc");
          this.vmwriter.writePop("pointer", 0);
        }
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
          throw this.tokenizer.syntaxError(
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
      case KeywordToken.VAR:
        throw this.tokenizer.syntaxError(
          "",
          "all variables must be declared before the subroutine body. Move this variable declaration to the beginning of the subroutine"
        );
      default:
        if (this.tokenizer.tokenType() === TokenType.IDENTIFIER) {
          throw this.tokenizer.syntaxError(
            [
              KeywordToken.LET,
              KeywordToken.IF,
              KeywordToken.WHILE,
              KeywordToken.DO,
              KeywordToken.RETURN,
            ],
            "all statements must begin with either of these keywords"
          );
        }
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
    let subroutineClass: string;
    let subroutineName: string;
    let missingThrowMessage: ReferenceError;
    switch (this.tokenizer.token()) {
      case SymbolToken.OPENING_PARENTHESIS:
        if (this.subroutineType === KeywordToken.FUNCTION)
          throw this.tokenizer.syntaxError(
            SymbolToken.PERIOD,
            "class functions cannot call instance methods"
          );
        subroutineClass = this.className;
        subroutineName = prevToken;
        missingThrowMessage = this.tokenizer.referenceError(
          `subroutine '${subroutineName}' from class '${subroutineClass}' was never declared`,
          undefined,
          undefined,
          this.tokenizer.lineIndex() - prevToken.length
        );
        this.tokenizer.advance();
        this.vmwriter.writePush("pointer", 0);
        nArgs = this.compileExpressionList() + 1;
        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
        break;
      case SymbolToken.PERIOD:
        if (prevTokenType !== null) {
          this.validateVar(prevToken, line, lineNumber, lineIndex);
          subroutineClass = prevTokenType;
        } else {
          subroutineClass = prevToken;
        }
        this.tokenizer.advance();
        subroutineName = this.tokenizer.token();
        missingThrowMessage = this.tokenizer.referenceError(
          `subroutine '${subroutineName}' from class '${subroutineClass}' was never declared`
        );
        this.assertToken(TokenType.IDENTIFIER);
        this.assertToken(SymbolToken.OPENING_PARENTHESIS);
        if (prevTokenType !== null) {
          this.vmwriter.writePush(prevTokenKind, prevTokenIndex);
          nArgs = 1;
        }
        nArgs += this.compileExpressionList();
        this.assertToken(SymbolToken.CLOSING_PARENTHESIS);
        break;
      default:
        throw this.tokenizer.syntaxError(
          "",
          `subroutine call must be followed by '${SymbolToken.OPENING_PARENTHESIS}' or '${SymbolToken.PERIOD}'`
        );
    }
    this.vmwriter.writeCall(`${subroutineClass}.${subroutineName}`, nArgs);
    Engine.trySubroutineCalls.push({
      subroutineClass,
      subroutineName,
      missingThrowMessage,
    });
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
      default:
        throw this.tokenizer.syntaxError(
          [SymbolToken.OPENING_BRACKET, SymbolToken.EQUAL],
          "let statement must be followed by either of these symbols"
        );
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
        throw this.tokenizer.syntaxError(
          null,
          `subroutine must return type '${this.subroutineReturnType}'`
        );
      this.tokenizer.advance();
      this.vmwriter.writePush("constant", 0);
    } else {
      if (this.subroutineReturnType === KeywordToken.VOID)
        throw this.tokenizer.syntaxError(
          SymbolToken.SEMICOLON,
          "void subroutines cannot have a return value"
        );
      if (this.subroutineType === KeywordToken.CONSTRUCTOR) {
        if (this.tokenizer.token() !== KeywordToken.THIS)
          throw this.tokenizer.syntaxError(
            KeywordToken.THIS,
            `constructors can only return '${KeywordToken.THIS}'`
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
          throw this.tokenizer.syntaxError(
            "32767 or less",
            "integer literal is too large"
          );
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
        Engine.useInternalSubroutineCall("String", "newWithStr");
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
              throw this.tokenizer.referenceError(
                `class functions cannot reference '${KeywordToken.THIS}'`
              );
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
            throw this.tokenizer.syntaxError("", "keyword cannot be used here");
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
            throw this.tokenizer.syntaxError("", "symbol cannot be used here");
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

  static cleanup(): void {
    Engine.staticCount = 0;
    Engine.trySubroutineCalls = [];
    Engine.allSubroutineDeclarations = [];
    for (let internalSubroutineCall of Engine.internalSubroutineCalls) {
      if (
        internalSubroutineCall.subroutineClass !== "Sys" &&
        internalSubroutineCall.subroutineName !== "init"
      ) {
        internalSubroutineCall.used = false;
      }
    }
  }

  static postValidation(): CompilerError | null {
    let undeclaredSubroutineCall = Engine.trySubroutineCalls
      .concat(
        Engine.internalSubroutineCalls.reduce(
          (acc, curr) => {
            if (curr.used) {
              acc.push({
                subroutineClass: curr.subroutineClass,
                subroutineName: curr.subroutineName,
                missingThrowMessage: new BroadCompilerError(
                  curr.subroutineClass,
                  `subroutine '${curr.subroutineName}' from class '${curr.subroutineClass}' must be declared, ${curr.missingThrowMessageEnding}`
                ),
              });
            }
            return acc;
          },
          [] as {
            subroutineClass: string;
            subroutineName: string;
            missingThrowMessage: BroadCompilerError;
          }[]
        )
      )
      .find(
        (subroutineCall) =>
          !Engine.allSubroutineDeclarations.some(
            (subroutineDeclaration) =>
              subroutineCall.subroutineClass ===
                subroutineDeclaration.className &&
              subroutineCall.subroutineName ===
                subroutineDeclaration.subroutineName
          )
      );
    if (undeclaredSubroutineCall) {
      return undeclaredSubroutineCall.missingThrowMessage;
    } else {
      return null;
    }
  }
}
