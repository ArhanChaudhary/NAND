<script lang="ts" context="module">
  import { KeywordToken, SymbolToken } from "../compiler/tokenizer";
  const escapeInRegex = ["(", ")", "[", "]", ".", "+", "*", "/", "|"];
  const TypeTokens = escapeRegexList([
    KeywordToken.INT,
    KeywordToken.BOOLEAN,
    KeywordToken.CHAR,
    KeywordToken.VOID,
    KeywordToken.THIS,
    KeywordToken.TRUE,
    KeywordToken.FALSE,
    KeywordToken.NULL,
  ]);
  const KeywordTokens = escapeRegexList([
    KeywordToken.METHOD,
    KeywordToken.FUNCTION,
    KeywordToken.CONSTRUCTOR,
    KeywordToken.VAR,
    KeywordToken.STATIC,
    KeywordToken.FIELD,
    KeywordToken.LET,
    KeywordToken.DO,
    KeywordToken.IF,
    KeywordToken.ELSE,
    KeywordToken.WHILE,
    KeywordToken.RETURN,
    KeywordToken.ARGUMENTS,
  ]);
  const SymbolTokens_Red = [
    SymbolToken.ADD,
    SymbolToken.SUBTRACT,
    SymbolToken.MULTIPLY,
    SymbolToken.DIVIDE,
    SymbolToken.AND,
    SymbolToken.OR,
    SymbolToken.LESS_THAN,
    SymbolToken.GREATER_THAN,
    SymbolToken.EQUAL,
    SymbolToken.NOT,
  ];
  const SymbolTokens_DarkBlue = [
    SymbolToken.OPENING_PARENTHESIS,
    SymbolToken.CLOSING_PARENTHESIS,
    SymbolToken.OPENING_CURLY_BRACKET,
    SymbolToken.CLOSING_CURLY_BRACKET,
  ];
  const SymbolTokens_Purple = [
    SymbolToken.OPENING_BRACKET,
    SymbolToken.CLOSING_BRACKET,
  ];
  const SymbolTokens = escapeRegexList(
    SymbolTokens_Red.concat(SymbolTokens_DarkBlue).concat(SymbolTokens_Purple)
  );
  function escapeRegexList(list: any[]) {
    return list.reduce((acc: string[], symbol: string) => {
      if (escapeInRegex.includes(symbol)) {
        acc.push(`\\${symbol}`);
      } else {
        acc.push(symbol);
      }
      return acc;
    }, []);
  }
</script>

<script lang="ts">
  import { IDEContext, activeTabName, shouldResetAndStart } from "./stores";
  import { escape } from "html-escaper";
  import { tick } from "svelte";
  import { compilerError } from "./stores";

  export let wrap: boolean;
  let codeEditor: HTMLDivElement;
  let initialCodeEditorContent: string[] = [];
  $: $activeTabName, onSwitchTab();
  function onSwitchTab() {
    let activeTabNameFile = $IDEContext.find(
      (file) => file.fileName === $activeTabName
    );
    if (activeTabNameFile) {
      initialCodeEditorContent = activeTabNameFile.file;
    } else {
      initialCodeEditorContent = [];
    }
    initialCodeEditorContent = highlightSyntax(
      initialCodeEditorContent.join("\n")
    ).split("\n");
  }
  let updateContextTimeout: NodeJS.Timeout;
  function queueUpdateContext() {
    $compilerError = null; // note that $IDEContext isnt reactively updated in updateContext
    clearTimeout(updateContextTimeout);
    updateContextTimeout = setTimeout(
      requestAnimationFrame.bind(undefined, updateContext),
      100
    );
  }
  // needed because browsers really like not agreeing on how to parse
  // contenteditable (using innerText directly breaks... you guessed
  // it, Safari)
  function getTextContent(root: ChildNode): string {
    let ret = "";
    for (let i = 0; i < root.childNodes.length; i++) {
      let line = root.childNodes[i];
      if (line.nodeType === Node.TEXT_NODE) {
        ret += line.textContent;
      } else {
        ret += getTextContent(line);
        if (elementCausesLineBreak(line as Element)) {
          ret += "\n";
        }
      }
    }
    if (ret[ret.length - 1] === "\n") {
      return ret.slice(0, -1);
    } else {
      return ret;
    }
  }
  function elementCausesLineBreak(el: Element): boolean {
    return (
      el.classList.contains("line") ||
      el.tagName === "P" ||
      (el.tagName === "DIV" && el.classList.value === "")
    );
  }
  function furthest(el: Element, selector: string): Element | null {
    let ret = null;
    while (el !== null) {
      let prevSibling = el;
      while (prevSibling !== null) {
        if (prevSibling.matches(selector)) {
          ret = prevSibling;
          break;
        }
        prevSibling = prevSibling.previousElementSibling!;
      }
      el = el.parentElement!;
    }
    return ret;
  }
  const sel = window.getSelection()!;
  function updateContext() {
    let line = furthest(sel.anchorNode!.parentElement!, ".line");
    let lineNumber: number;
    let textContent = getTextContent(codeEditor);
    let absoluteLineCharacterOffset: number;
    if (line) {
      lineNumber = Array.prototype.indexOf.call(codeEditor.childNodes, line);
      absoluteLineCharacterOffset = sel.anchorOffset;
      let selChildNode = sel.anchorNode!;
      if (selChildNode.parentElement !== line) {
        selChildNode = selChildNode.parentElement!;
      }
      let selChildNodeIndex = Array.prototype.indexOf.call(
        line.childNodes,
        selChildNode
      );
      let prevSibling = line.childNodes[selChildNodeIndex - 1]!;
      while (prevSibling) {
        absoluteLineCharacterOffset += prevSibling.textContent!.length;
        prevSibling = prevSibling.previousSibling!;
      }
    }

    let activeTabContext = $IDEContext.find(
      (file) => file.fileName === $activeTabName
    );
    if (activeTabContext) {
      activeTabContext.file = textContent.split("\n");
    }
    if (!line) {
      if (document.querySelectorAll("#code-editor > div").length === 0) {
        // without this Safari can delete the entire contenteditable and all
        // of the line divs. This doesnt fully fix it but i don't care
        tick().then(() => {
          document
            .querySelectorAll("#code-editor > :not(.line)")
            .forEach((div) => {
              div.remove();
            });
          initialCodeEditorContent = [""];
        });
      }
      return;
    }
    // do not change this forEach loop, I've just lost 2 hours of my life
    // because of this
    document.querySelectorAll("#code-editor > div").forEach((div) => {
      div.remove();
    });
    initialCodeEditorContent = highlightSyntax(textContent).split("\n");
    $shouldResetAndStart = true;
    tick().then(() => {
      if (lineNumber >= codeEditor.childNodes.length) {
        lineNumber = codeEditor.childNodes.length - 1;
      }
      let line = codeEditor.childNodes[lineNumber];
      let relativeChildNode = line.childNodes[0]!;
      let relativeLineCharacterOffset = absoluteLineCharacterOffset;
      while (
        relativeChildNode.textContent!.length < relativeLineCharacterOffset
      ) {
        relativeLineCharacterOffset -= relativeChildNode.textContent!.length;
        relativeChildNode = relativeChildNode.nextSibling!;
        if (relativeChildNode === null) {
          relativeChildNode = line;
          break;
        }
      }
      if (relativeChildNode.childNodes.length > 0) {
        relativeChildNode = relativeChildNode.childNodes[0];
      }

      let range = document.createRange();
      try {
        range.setStart(relativeChildNode, relativeLineCharacterOffset);
      } catch (_) {
        range.setStart(relativeChildNode, 0);
      }
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }
  function editorKeydown(e: any) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    } else if (e.key === "Backspace" && e.target.innerText === "\n") {
      e.preventDefault();
    }
  }
  function highlightSyntax(code: string): string {
    let subroutineNames = [
      ...new Set(
        $IDEContext.flatMap((file) =>
          [
            ...file.file
              .join("\n")
              .matchAll(
                /(function|constructor|method) [_a-zA-Z][_a-zA-Z0-9]+ ([_a-zA-Z][_a-zA-Z0-9]+)\(/g
              ),
          ].map((match) => match[2])
        )
      ),
    ];
    return code.replaceAll(
      new RegExp(
        String.raw`(\/\*[\s\S]*?\*\/)|(\/\/.*)|(?<!\w)(\d+)(?!\w)|(".*?")|(${SymbolTokens.join(
          "|"
        )})|\b(${TypeTokens.concat(
          escapeRegexList($IDEContext.map((file) => file.fileName))
        ).join("|")})\b|\b(${KeywordTokens.join("|")})\b${
          subroutineNames.length
            ? String.raw`|\b(${subroutineNames.join("|")})\b`
            : ""
        }`,
        "g"
      ),
      (_, p0, p1, p2, p3, p4, p5, p6, p7) => {
        if (p0) {
          return `<span class='gray'>${p0
            .split("\n")
            .map((line: string) => (line == "" ? "<br>" : escape(line)))
            .join('</span>\n<span class="gray">')}</span>`;
        } else if (p1) {
          return `<span class='gray'>${escape(p1)}</span>`;
        } else if (p2) {
          return `<span class='purple'>${escape(p2)}</span>`;
        } else if (p3) {
          return `<span class='yellow'>${escape(p3)}</span>`;
        } else if (p4) {
          if (SymbolTokens_Red.includes(p4)) {
            return `<span class='red'>${escape(p4)}</span>`;
          } else if (SymbolTokens_DarkBlue.includes(p4)) {
            return `<span class='dark-blue'>${escape(p4)}</span>`;
          } else if (SymbolTokens_Purple.includes(p4)) {
            return `<span class='purple'>${escape(p4)}</span>`;
          }
          throw new Error("syntax highlighting failed");
        } else if (p5) {
          return `<span class='light-blue'>${escape(p5)}</span>`;
        } else if (p6) {
          return `<span class='red'>${escape(p6)}</span>`;
        } else if (p7) {
          return `<span class='green'>${escape(p7)}</span>`;
        }
        throw new Error("syntax highlighting failed");
      }
    );
  }
  function saveIDEContext() {
    localStorage.setItem("IDEContext", JSON.stringify($IDEContext));
  }
</script>

<svelte:window on:beforeunload={saveIDEContext} />
{#key $activeTabName}
  <!-- svelte-ignore missing-declaration -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="code-editor"
    spellcheck="false"
    contenteditable="true"
    on:input={queueUpdateContext}
    on:keydown|stopPropagation={editorKeydown}
    on:keyup|stopPropagation
    bind:this={codeEditor}
    class:wrap
  >
    {#key initialCodeEditorContent}
      {#each initialCodeEditorContent as line, index}
        <!-- needed or some line breaks dont render properly -->
        <!-- prettier-ignore -->
        <div class="line" class:compilerErrorLine={
          $compilerError !== null &&
            $activeTabName === $compilerError.getFileName() &&
            index === $compilerError.getLineNumber() - 1
        }>{#if line == ""}<br />{:else}{@html line}{/if}</div>
      {/each}
    {/key}
  </div>
{/key}

<style lang="scss">
  #code-editor {
    background-color: hsl(222, 17%, 18%);
    caret-color: white;
    flex-grow: 1;
    outline: 0;
    padding: 15px;
    padding-left: 50px;
    overflow-y: scroll;
    scrollbar-width: none;
    counter-reset: line;
    position: relative;
    white-space: pre;

    &.wrap {
      white-space: pre-wrap;
    }

    * {
      color: hsl(0deg 0% 78%);
    }

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .line {
      line-height: 20px;
      position: relative;

      &.compilerErrorLine {
        background-color: hsla(0, 83%, 61%, 0.25);

        &::after {
          content: "";
          background-color: inherit;
          height: 100%;
          top: 0;
          left: 100%;
          width: 100%;
          position: absolute;
        }
      }

      &::before {
        content: counter(line);
        counter-increment: line;
        color: hsl(222, 13%, 44%);
        position: absolute;
        right: calc(100% + 13px);
      }

      :global(.red) {
        color: hsl(355, 65%, 65%);
      }

      :global(.light-blue) {
        color: hsl(187, 47%, 55%);
      }

      :global(.purple) {
        color: hsl(286, 60%, 67%);
      }

      :global(.dark-blue) {
        color: hsl(205, 100%, 55%);
      }

      :global(.gray) {
        color: hsl(218, 10%, 45%);
      }

      :global(.yellow) {
        color: hsl(39, 67%, 69%);
      }

      :global(.green) {
        color: hsl(95, 38%, 62%);
      }
    }
  }
</style>
