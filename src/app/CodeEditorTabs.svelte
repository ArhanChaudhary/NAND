<script lang="ts">
  import { IDEContext } from "./stores";
  let tabNames = [];
  $: {
    tabNames = $IDEContext.map((file) => file.fileName);
  }
  let activeTabName = "";
  function handleTabClick(tab: string) {
    activeTabName = tab;
  }
</script>

<div id="tabs">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#each tabNames as tabName}<span
      class="tab"
      class:active={tabName === activeTabName}
      on:click={() => handleTabClick(tabName)}>{tabName}<span class="tab-close"></span></span
    >{/each}
</div>

<style lang="scss">
  #tabs {
    white-space: nowrap;
    position: relative;
    min-height: 30px;
    background-color: hsl(222, 17%, 29%);
    box-shadow: 0 0 9px -4px black;
    overflow-x: scroll;
    scrollbar-gutter: stable;
  }

  .tab {
    margin-right: 2px;
    cursor: pointer;
    padding: 0 20px;
    position: relative;
    display: inline-flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: hsl(222, 17%, 25%);
    color: hsl(0deg 0% 78%);

    &.active {
      background-color: hsl(222, 17%, 18%);
      color: inherit;
      box-shadow: 0px 6px 3px -3px hsl(222, 17%, 18%);
    }

    .tab-close::after {
      margin-left: 9px;
      content: "\00d7";
      font-size: 15px;
      display: inline-block;
    }
  }
</style>
