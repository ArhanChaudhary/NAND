export enum CommandType {
  C_ARITHMETIC = 0,
  C_PUSH = 1,
  C_POP = 2,
  C_LABEL = 3,
  C_GOTO = 4,
  C_IF = 5,
  C_FUNCTION = 6,
  C_RETURN = 7,
  C_CALL = 8,
}

export default class Parser {
  constructor(private inputStream: string[]) {}
  private inputStreamIndex = 0;
  private currentCommand = "";

  public advance(): boolean {
    const line: string | undefined = this.inputStream[this.inputStreamIndex++];
    if (line === undefined) return false;
    if (line === "") return this.advance();
    this.currentCommand = line;
    const comment = this.currentCommand.indexOf("//");
    if (comment !== -1)
      this.currentCommand = this.currentCommand.substring(0, comment);
    this.currentCommand = this.currentCommand.trim().replace(/ {2,}/, " ");
    if (!this.currentCommand) return this.advance();
    return true;
  }

  public commandType(): CommandType {
    const mapping = {
      push: CommandType.C_PUSH,
      pop: CommandType.C_POP,
      label: CommandType.C_LABEL,
      goto: CommandType.C_GOTO,
      if: CommandType.C_IF,
      function: CommandType.C_FUNCTION,
      return: CommandType.C_RETURN,
      call: CommandType.C_CALL,
    };
    for (const key in mapping) {
      if (this.currentCommand.startsWith(key)) {
        return (mapping as any)[key];
      }
    }
    return CommandType.C_ARITHMETIC;
  }

  public arg1(): string {
    return this.currentCommand.split(" ")[1] || this.currentCommand;
  }

  public arg2(): number {
    return +this.currentCommand.split(" ")[2];
  }
}
