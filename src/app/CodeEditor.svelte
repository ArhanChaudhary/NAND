<div id="code-editor" spellcheck="false" contenteditable="true">
  <div></div>
</div>

<style lang="scss">
  #code-editor {
    background-color: hsl(222, 17%, 18%);
    height: 100%;
    outline: 0;
    padding: 15px;
    padding-left: 50px;
    overflow-y: scroll;
    scrollbar-width: none;
    counter-reset: line;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    div {
      padding: 3px 0;
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
