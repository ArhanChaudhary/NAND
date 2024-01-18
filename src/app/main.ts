import App from "./App.svelte";
import IncompatibleBrowser from "./IncompatibleBrowser.svelte";
import { detect } from "detect-browser";

const browser = detect();
let rootComponent;
switch (browser && browser.name) {
  // case "safari":
  //   rootComponent = new IncompatibleBrowser({
  //     target: document.getElementById("app")!,
  //   });
  //   break;
  default:
    rootComponent = new App({
      target: document.getElementById("app")!,
    });
}

export default rootComponent;
