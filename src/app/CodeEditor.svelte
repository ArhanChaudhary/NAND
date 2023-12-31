<script lang="ts" context="module">
  import { KeywordToken, SymbolToken } from "../compiler/tokenizer";
  const escapeInRegex = ["(", ")", "[", "]", ".", "+", "*", "/", "|"];
  const TypeTokens = escapeRegexList([
    KeywordToken.CLASS,
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
  import { tick } from "svelte";

  let codeEditor: HTMLDivElement;
  let initialCodeEditorContent = [];
  $: $activeTabName, onSwitchTab();
  function onSwitchTab() {
    initialCodeEditorContent = $IDEContext.find(
      (file) => file.fileName === $activeTabName
    )?.file;
    if (!initialCodeEditorContent) {
      initialCodeEditorContent = [];
    }
    initialCodeEditorContent = highlightSyntax(
      initialCodeEditorContent.join("\n")
    ).split("\n");
  }
  let updateContextTimeout: NodeJS.Timeout;
  function queueUpdateContext(e: any) {
    clearTimeout(updateContextTimeout);
    updateContextTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        updateContext(e);
      });
    }, 100);
  }
  const sel = window.getSelection();
  function updateContext(e: any) {
    let line = sel.anchorNode.parentElement.closest(".line");
    let lineNumber: number;
    let textContent = e.target.innerText.replaceAll("\n\n", "\n");
    let absoluteLineCharacterOffset: number;
    if (line) {
      lineNumber = Array.prototype.indexOf.call(codeEditor.childNodes, line);
      if (textContent === "\n") {
        textContent = "";
      }
      absoluteLineCharacterOffset = sel.anchorOffset;
      let selChildNode = sel.anchorNode;
      if (selChildNode.parentElement !== line) {
        selChildNode = selChildNode.parentElement;
      }
      let selChildNodeIndex = Array.prototype.indexOf.call(
        line.childNodes,
        selChildNode
      );
      let prevSibling = line.childNodes[selChildNodeIndex - 1];
      while (prevSibling) {
        absoluteLineCharacterOffset += prevSibling.textContent.length;
        prevSibling = prevSibling.previousSibling;
      }
    }

    let activeTabContext = $IDEContext.find((file) => file.fileName === $activeTabName);
    if (activeTabContext) {
      activeTabContext.file = textContent.split("\n");
    }
    if (!line) return;
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
      let relativeChildNode = line.childNodes[0];
      let relativeLineCharacterOffset = absoluteLineCharacterOffset;
      while (
        relativeChildNode.textContent.length < relativeLineCharacterOffset
      ) {
        relativeLineCharacterOffset -= relativeChildNode.textContent.length;
        relativeChildNode = relativeChildNode.nextSibling;
      }
      if (relativeChildNode.childNodes.length > 0) {
        relativeChildNode = relativeChildNode.childNodes[0];
      }

      let range = document.createRange();
      let sel = window.getSelection();
      range.setStart(relativeChildNode, relativeLineCharacterOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }
  function handleEditorKeydown(e: any) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    } else if (e.key === "Backspace" && e.target.innerText === "\n") {
      e.preventDefault();
    }
  }
  function handleEditorKeyup() {}
  function highlightSyntax(code: string): string {
    return code.replaceAll(
      new RegExp(
        String.raw`(\/\/.*)|(?<!\w)(\d+)(?!\w)|(".*?")|(${SymbolTokens.join(
          "|"
        )})|\b(${TypeTokens.join("|")})\b|\b(${KeywordTokens.join("|")})\b`,
        "g"
      ),
      (_, p1, p2, p3, p4, p5, p6) => {
        if (p1) {
          return `<span class='gray'>${p1}</span>`;
        } else if (p2) {
          return `<span class='purple'>${p2}</span>`;
        } else if (p3) {
          return `<span class='yellow'>${p3}</span>`;
        } else if (p4) {
          if (SymbolTokens_Red.includes(p4)) {
            return `<span class='red'>${p4}</span>`;
          } else if (SymbolTokens_DarkBlue.includes(p4)) {
            return `<span class='dark-blue'>${p4}</span>`;
          } else if (SymbolTokens_Purple.includes(p4)) {
            return `<span class='purple'>${p4}</span>`;
          }
          throw new Error("syntax highlighting failed");
        } else if (p5) {
          return `<span class='light-blue'>${p5}</span>`;
        } else if (p6) {
          return `<span class='red'>${p6}</span>`;
        }
        throw new Error("syntax highlighting failed");
      }
    );
  }
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("IDEContext", JSON.stringify($IDEContext));
  });
</script>

{#key $activeTabName}
  <!-- svelte-ignore missing-declaration -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="code-editor"
    spellcheck="false"
    contenteditable="true"
    on:input={queueUpdateContext}
    on:keydown|stopPropagation={handleEditorKeydown}
    on:keyup|stopPropagation={handleEditorKeyup}
    bind:this={codeEditor}
  >
    {#key initialCodeEditorContent}
      {#each initialCodeEditorContent as line}
        <!-- needed or some line breaks dont render properly -->
        <!-- prettier-ignore -->
        <div class="line">{#if line == ""}<br />{:else}{@html line}{/if}</div>
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
    white-space: pre-wrap;

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
    }
  }
</style>
