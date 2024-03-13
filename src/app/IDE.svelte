<script>
  import CodeEditor from "./CodeEditor.svelte";
  import CodeEditorTabs from "./CodeEditorTabs.svelte";
  import wrapIcon from "/wrap.svg?raw";

  let wrap = true;
</script>

<div id="ide">
  <CodeEditorTabs />
  <CodeEditor {wrap} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="wrap-icon" on:click={() => (wrap = !wrap)}>
    {@html wrapIcon}
  </div>
</div>

<style lang="scss">
  #ide {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex-grow: 1;
    height: 100%;
    position: relative;

    #wrap-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      cursor: pointer;
      top: 30px;
      right: 0;
      width: 40px;
      height: 35px;
      background-color: hsl(222, 20%, 63%);

      :global(path) {
        color: hsl(0, 0%, 0%);
      }

      &:active {
        background-color: hsl(222, 17%, 55%);
      }
    }
  }
</style>
