<script>
  import CodeEditor from "./CodeEditor.svelte";
  import CodeEditorTabs from "./CodeEditorTabs.svelte";
</script>

<div id="ide">
  <CodeEditorTabs />
  <CodeEditor />
</div>

<style lang="scss">
  #ide {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex-grow: 1;
    height: 100%;
  }
</style>
