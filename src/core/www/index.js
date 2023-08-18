import * as wasm from "core";
wasm.init();

window.loadROM = wasm.loadROM;
window.step = wasm.step;
window.getRAM = wasm.getRAM;