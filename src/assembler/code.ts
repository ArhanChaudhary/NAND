import { AssemblerError } from "./main";

export default class Code {
  public static dest(mnemonic: string): string {
    return `${+mnemonic.includes("A")}${+mnemonic.includes(
      "D"
    )}${+mnemonic.includes("M")}`;
  }

  public static comp(mnemonic: string): string {
    let ret: string;
    let AOrM: string;
    if (mnemonic.includes("M")) {
      AOrM = "M";
      ret = "1";
    } else {
      AOrM = "A";
      ret = "0";
    }
    switch (mnemonic) {
      case "0":
        return ret + "101010";
      case "1":
        return ret + "111111";
      case "-1":
        return ret + "111010";
      case "D":
        return ret + "001100";
      case AOrM:
        return ret + "110000";
      case "!D":
        return ret + "001101";
      case "!" + AOrM:
        return ret + "110001";
      case "-D":
        return ret + "001111";
      case "-" + AOrM:
        return ret + "110011";
      case "D+1":
      case "1+D":
        return ret + "011111";
      case AOrM + "+1":
      case "1+" + AOrM:
        return ret + "110111";
      case "D-1":
        return ret + "001110";
      case AOrM + "-1":
        return ret + "110010";
      case "D+" + AOrM:
      case AOrM + "+D":
        return ret + "000010";
      case "D-" + AOrM:
        return ret + "010011";
      case AOrM + "-D":
        return ret + "000111";
      case "D&" + AOrM:
      case AOrM + "&D":
        return ret + "000000";
      case "D|" + AOrM:
      case AOrM + "|D":
        return ret + "010101";
      default:
        throw new AssemblerError("Invalid command comp: " + mnemonic);
    }
  }

  public static jump(mnemonic: string): string {
    const ret = {
      "": "000",
      JGT: "001",
      JEQ: "010",
      JGE: "011",
      JLT: "100",
      JNE: "101",
      JLE: "110",
      JMP: "111",
    }[mnemonic];
    if (ret === undefined)
      throw new AssemblerError("Invalid command jump: " + mnemonic);
    return ret;
  }
}
