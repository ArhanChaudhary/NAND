<script lang="ts">
  import { IDEContext, activeTabName, shouldResetAndStart } from "./stores";

  let codeEditorContent = [];
  $: codeEditorContent =
    $IDEContext.find((file) => file.fileName === $activeTabName)?.file ?? [];
  function updateContext(e: any) {
    $IDEContext.find((file) => file.fileName === $activeTabName).file =
      e.target.innerText.replaceAll("\n\n", "\n").split("\n");
    $shouldResetAndStart = true;
  }
  function handleEditorKeydown(e: any) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    }
  }
  function handleEditorKeyup() {}
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("IDEContext", JSON.stringify($IDEContext));
  });
</script>

{#key codeEditorContent}
  <!-- svelte-ignore missing-declaration -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="code-editor"
    spellcheck="false"
    contenteditable="true"
    on:input={updateContext}
    on:keydown|stopPropagation={handleEditorKeydown}
    on:keyup|stopPropagation={handleEditorKeyup}
  >
    {#each codeEditorContent as line}
      <!-- needed or some line breaks dont render properly -->
      <!-- prettier-ignore -->
      <div>{#if line == ""}<br />{:else}{line}{/if}</div>
    {/each}
  </div>
{/key}

<style lang="scss">
  #code-editor {
    background-color: hsl(222, 17%, 18%);
    flex-grow: 1;
    outline: 0;
    padding: 15px;
    padding-left: 50px;
    overflow-y: scroll;
    scrollbar-width: none;
    counter-reset: line;
    white-space: pre-wrap;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    div {
      line-height: 20px;
      position: relative;

      &::before {
        content: counter(line);
        counter-increment: line;
        color: hsl(222, 13%, 44%);
        position: absolute;
        right: calc(100% + 13px);
      }
    }
  }
</style>
