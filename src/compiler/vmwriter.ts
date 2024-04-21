import Engine from "./engine";
import { SymbolToken } from "./tokenizer";

export default class VMWriter {
  private out: string[] = [];

  public write(out: string): void {
    this.out.push(out);
  }

  public getOut(): string[] {
    return this.out;
  }

  public writePush(segment: string, index: number | string): void {
    this.write(`push ${segment} ${index}`);
  }

  public writePop(segment: string, index: number): void {
    this.write(`pop ${segment} ${index}`);
  }

  public tryWritePrecomputedConstant(
    operation: (a: number, b: number) => number
  ): boolean {
    if (
      !(
        this.out[this.out.length - 2].startsWith("push constant") &&
        this.out[this.out.length - 1].startsWith("push constant")
      )
    ) {
      return false;
    }
    const temp1 = Number(this.out.pop()!.split(" ")[2]);
    const temp2 = Number(this.out.pop()!.split(" ")[2]);
    const value = operation(temp2, temp1) & 65535;
    if (value < 32768) {
      this.writePush("constant", value);
    } else if (value === 32768) {
      this.writePush("constant", 32767);
      this.writeArithmetic(SymbolToken.NOT);
    } else {
      this.writePush("constant", 65536 - value);
      this.writeArithmetic(SymbolToken.SUBTRACT, false);
    }
    return true;
  }

  public writeArithmetic(command: SymbolToken, sub: boolean = true): void {
    switch (command) {
      case SymbolToken.ADD:
        if (this.out[this.out.length - 1] === "push constant 0") {
          this.out.pop();
        } else if (this.tryWritePrecomputedConstant((a, b) => a + b)) {
        } else {
          this.write("add");
        }
        break;
      case SymbolToken.SUBTRACT:
        if (sub) {
          if (this.out[this.out.length - 1] === "push constant 0") {
            this.out.pop();
          } else if (this.tryWritePrecomputedConstant((a, b) => a - b)) {
          } else {
            this.write("sub");
          }
        } else {
          switch (this.out[this.out.length - 1]) {
            case "neg":
              this.out.pop();
              break;
            case "push constant -1":
              this.out.pop();
              this.writePush("constant", 1);
              break;
            case "push constant 0":
              break;
            case "push constant 1":
              this.out.pop();
              this.writePush("constant", -1);
              break;
            default:
              this.write("neg");
          }
        }
        break;
      case SymbolToken.AND:
        if (this.out[this.out.length - 1] === "push constant -1") {
          this.out.pop();
        } else if (this.tryWritePrecomputedConstant((a, b) => a & b)) {
        } else {
          this.write("and");
        }
        break;
      case SymbolToken.OR:
        if (this.out[this.out.length - 1] === "push constant 0") {
          this.out.pop();
        } else if (this.tryWritePrecomputedConstant((a, b) => a | b)) {
        } else {
          this.write("or");
        }
        break;
      case SymbolToken.LESS_THAN:
        if (
          this.tryWritePrecomputedConstant((a, b) =>
            ((a - b) & 0b1000000000000000) !== 0 && a !== b ? -1 : 0
          )
        ) {
        } else {
          this.write("lt");
        }
        break;
      case SymbolToken.GREATER_THAN:
        if (
          this.tryWritePrecomputedConstant((a, b) =>
            ((a - b) & 0b1000000000000000) === 0 && a !== b ? -1 : 0
          )
        ) {
        } else {
          this.write("gt");
        }
        break;
      case SymbolToken.EQUAL:
        if (this.tryWritePrecomputedConstant((a, b) => (a === b ? -1 : 0))) {
        } else {
          this.write("eq");
        }
        break;
      case SymbolToken.NOT:
        if (this.out[this.out.length - 1] === "not") {
          this.out.pop();
        } else {
          this.write("not");
        }
        break;
      case SymbolToken.MULTIPLY:
        if (this.tryWritePrecomputedConstant((a, b) => a * b)) {
        } else {
          this.writeCall("Math.multiply", 2);
          Engine.useInternalSubroutineCall("Math", "multiply");
        }
        break;
      case SymbolToken.DIVIDE:
        if (
          this.out[this.out.length - 1] !== "push constant 0" &&
          this.tryWritePrecomputedConstant((a, b) => Math.trunc(a / b))
        ) {
        } else {
          this.writeCall("Math.divide", 2);
          Engine.useInternalSubroutineCall("Math", "divide");
        }
        break;
      default:
        throw new Error("Invalid command arithmetic: " + command);
    }
  }

  public writeLabel(label: string): void {
    this.write(`label ${label}`);
  }

  public writeGoto(label: string): void {
    this.write(`goto ${label}`);
  }

  public writeIf(label: string): void {
    this.write(`if-goto ${label}`);
  }

  public writeCall(name: string, nArgs: number): void {
    this.write(`call ${name} ${nArgs}`);
  }

  public writeFunction(name: string, nLocals: number): void {
    this.write(`function ${name} ${nLocals}`);
  }

  public writeReturn(): void {
    this.write("return");
  }
}
