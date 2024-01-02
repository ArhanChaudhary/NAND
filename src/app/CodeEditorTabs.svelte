<div id="tabs">
  <span class="tab">Test</span><span class="tab">Test2</span>
</div>

<style lang="scss">
  #tabs {
    white-space: nowrap;
    overflow-x: scroll;
    position: relative;
    min-height: 30px;
    background-color: hsl(222, 17%, 25%);
    box-shadow: 0 0 9px -4px black;
  }

  .tab {
    margin-right: 4px;
    cursor: pointer;
    padding: 0 10px;
    display: inline-flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: hsl(222, 17%, 33%);

    &::after {
      margin-left: 9px;
      content: "\00d7";
      font-size: 15px;
      display: inline-block;
    }
  }
</style>