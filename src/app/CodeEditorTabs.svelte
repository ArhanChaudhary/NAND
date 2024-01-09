<script lang="ts">
  import { IDEContext, activeTabName } from "./stores";
  import { flip } from "svelte/animate";
  let componentRoot: HTMLDivElement;
  function tabShouldBeActive(tabName: string, activeTabName: string | null) {
    let ret = tabName === activeTabName;
    if (ret) {
      setTimeout(() => {
        let activeTab = componentRoot.querySelector(".tab.active");
        if (activeTab) {
          activeTab.scrollIntoView({
            behavior: "instant",
          });
        }
      });
    }
    return ret;
  }
  function tabClick(tabName: string) {
    $activeTabName = tabName;
  }
  function tabAdd() {
    let fileName: string;
    while (true) {
      fileName = prompt("Enter file name")!;
      if (!fileName) {
      } else if ($IDEContext.some((file) => file.fileName === fileName)) {
        alert("File name already exists");
      } else {
        break;
      }
    }
    $IDEContext.unshift({
      fileName,
      file: `class ${fileName} {\n\n}\n`.split("\n"),
    });
    $IDEContext = $IDEContext;
    tabClick(fileName);
  }
  function tabDelete(tabName: string) {
    if (!confirm(`Are you sure you want to delete ${tabName}?`)) return;
    if (tabName === $activeTabName) {
      const tabNames = $IDEContext.map((file) => file.fileName);
      let index = tabNames.indexOf(tabName) + 1;
      if (index === $IDEContext.length) {
        tabClick(tabNames[index - 2]);
      } else {
        tabClick(tabNames[index]);
      }
    }
    $IDEContext = $IDEContext.filter((file) => file.fileName !== tabName);
  }

  const dragTabDuration = 300;
  let draggingTabName: string | null;
  let animatingTabNames = new Set();
  function tabDragStart(tabName: string) {
    draggingTabName = tabName;
  }
  function tabDragEnd() {
    draggingTabName = null;
  }
  function swapDraggingTabWith(tabName: string) {
    if (draggingTabName === tabName || animatingTabNames.has(tabName)) return;
    animatingTabNames.add(tabName);
    setTimeout(() => {
      animatingTabNames.delete(tabName);
    }, dragTabDuration);
    const draggingTabIndex = $IDEContext.findIndex(
      (file) => file.fileName === draggingTabName
    );
    const swapWithTabIndex = $IDEContext.findIndex(
      (file) => file.fileName === tabName
    );
    $IDEContext[draggingTabIndex] = $IDEContext.splice(
      swapWithTabIndex,
      1,
      $IDEContext[draggingTabIndex]
    )[0];
  }
</script>

<div id="tabs" bind:this={componentRoot}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#each $IDEContext.map((file) => file.fileName) as tabName (tabName)}
    <span
      class="tab"
      class:active={tabShouldBeActive(tabName, $activeTabName)}
      on:click|self={() => tabClick(tabName)}
      role="button"
      tabindex="0"
      draggable="true"
      animate:flip={{ duration: dragTabDuration }}
      on:dragstart={() => tabDragStart(tabName)}
      on:dragend={tabDragEnd}
      on:dragenter={() => swapDraggingTabWith(tabName)}
      on:dragover|preventDefault
    >
      {tabName}
      <span
        class="tab-delete"
        on:click={() => tabDelete(tabName)}
        role="button"
        tabindex="0"
        aria-label="Delete Tab"
      >
        &#10005;
      </span>
    </span>
  {/each}<!-- svelte-ignore a11y-click-events-have-key-events --><span
    id="tab-add"
    class="tab"
    on:click={tabAdd}
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
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
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
      color: white;
      background-color: hsl(222, 19%, 52%);
      margin-right: 5px;
    }
  }
</style>
