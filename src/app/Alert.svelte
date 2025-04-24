<script lang="ts">
  export let showAlert: boolean;
  export const alignTop = true;
</script>

<div id="overlay" class:alignTop>
  <div id="wrapper">
    <slot />

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="exit" on:click={() => (showAlert = false)}>✖</div>
  </div>
</div>

<style lang="scss">
  #overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    &.alignTop {
      align-items: flex-start;
      padding-top: 40px;
    }

    #wrapper {
      position: relative;
      width: min(calc(100% - 40px), 700px);
      padding: 15px;
      background-color: hsl(220, 10%, 5%);
      border-radius: 15px;
      border: 4px solid hsl(0, 0%, 70%);
      box-shadow: 0 0 30px 5px black;

      #exit {
        position: absolute;
        aspect-ratio: 1;
        top: 10px;
        right: 20px;
        font-size: 50px;
        cursor: pointer;
      }

      :global(> :first-child) {
        margin-top: 10px;
      }

      :global(> :nth-last-child(2)) {
        margin-bottom: 10px;
      }

      :global(:not(h1)) {
        font-size: 15px;
      }
    }
  }
</style>
