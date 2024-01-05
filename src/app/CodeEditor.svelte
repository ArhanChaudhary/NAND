<script lang="ts">
  import { IDEContext, activeTabName } from "./stores";

  let codeEditorContent = [];
  $: codeEditorContent =
    $IDEContext.find((file) => file.fileName === $activeTabName)?.file ?? [];
  function updateContext(e: any) {
    $IDEContext.find((file) => file.fileName === $activeTabName).file =
      e.target.innerText.split("\n");
  }
</script>

<div
  id="code-editor"
  spellcheck="false"
  contenteditable="true"
  on:input={updateContext}
>
  {#key codeEditorContent}
    {#each codeEditorContent as line}
      <div>
        <!-- needed or some line breaks dont render properly -->
        {#if line != ""}
          {line}
        {/if}
      </div>
    {/each}
  {/key}
</div>

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
