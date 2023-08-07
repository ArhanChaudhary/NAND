import { step, loadROM, getScreen } from "./core/build/release.js"
import { updateScreen } from "./screen.js"

loadROM();
setInterval(function() {
    let now = performance.now();
    while (performance.now() - now < 750) {
        step();
    }
    updateScreen(getScreen());
}, 100);