<script lang="ts">
  import { IDEContext, activeTabName } from "./stores";
  let tabNames = [];
  $: tabNames = $IDEContext.map((file) => file.fileName);
  $: $activeTabName,
    $IDEContext,
    (() => {
      const activeTab = document.querySelector(
        `#tabs .tab[aria-label="${$activeTabName}"]`
      );
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "instant",
        });
      }
    })();
  function handleTabClick(tabName: string) {
    $activeTabName = tabName;
  }
  function handleTabAdd() {
    let fileName: string;
    while (true) {
      fileName = prompt("Enter file name");
      if (!fileName) {
      } else if ($IDEContext.some((file) => file.fileName === fileName)) {
        alert("File name already exists");
      } else {
        break;
      }
    }
    $IDEContext.push({
      fileName,
      file: `class ${fileName} {\n\n}\n`.split("\n"),
    });
    $IDEContext = $IDEContext;
    handleTabClick(fileName);
  }
  function handleTabDelete(tabName: string) {
    if (!confirm(`Are you sure you want to delete ${tabName}?`)) return;
    if (tabName === $activeTabName) {
      let index = tabNames.indexOf(tabName) + 1;
      if (index === $IDEContext.length) {
        handleTabClick(tabNames[index - 2]);
      } else {
        handleTabClick(tabNames[index]);
      }
    }
    $IDEContext = $IDEContext.filter((file) => file.fileName !== tabName);
  }
</script>

<div id="tabs">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#each tabNames as tabName}
    <span
      class="tab"
      class:active={tabName === $activeTabName}
      on:click|self={() => handleTabClick(tabName)}
      role="button"
      tabindex="0"
      aria-label={tabName}
    >
      {tabName}
      <span
        class="tab-delete"
        on:click={() => handleTabDelete(tabName)}
        role="button"
        tabindex="0"
        aria-label="Delete Tab"
      >
        &#10005;
      </span>
    </span>
  {/each}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span
    id="tab-add"
    class="tab"
    on:click={handleTabAdd}
    role="button"
    tabindex="0"
    aria-label="Add Tab"
  >
    +
  </span>
</div>

<style lang="scss">
  #tabs {
    white-space: nowrap;
    position: relative;
    min-height: 30px;
    background-color: hsl(222, 17%, 29%);
    box-shadow: 0 0 9px -4px black;
    overflow-x: scroll;
  }

  .tab {
    margin-right: 2px;
    cursor: pointer;
    padding: 0 19px;
    position: relative;
    display: inline-flex;
    max-width: fit-content;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: hsl(222, 17%, 25%);
    scroll-margin: 30px;
    color: hsl(0deg 0% 78%);

    &.active {
      background-color: hsl(222, 17%, 18%);
      color: inherit;
      box-shadow: 0px 6px 3px -3px hsl(222, 17%, 18%);

      .tab-delete:hover {
        background-color: hsl(222, 15%, 24%);
      }
    }

    .tab-delete {
      margin-left: 6px;
      border-radius: 4px;
      width: 20px;
      font-size: 18px;
      aspect-ratio: 1;
      text-align: center;
    }

    .tab-delete:hover {
      background-color: hsl(222, 17%, 33%);
    }
  }

  #tab-add {
    background-color: hsl(222, 12%, 14%);
    margin-right: 5px;
  }
</style>
