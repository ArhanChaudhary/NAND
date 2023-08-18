import * as wasm from "core";
wasm.init();

window.loadROM = wasm.load_rom;
window.step = wasm.step;
window.getRAM = wasm.get_ram;