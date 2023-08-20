import * as wasm from "core";

wasm.load_rom(prompt().split('\n'))
// const offscreen = document.querySelector('canvas').transferControlToOffscreen();
// const screen = new Worker('screen.js');
// screen.postMessage(offscreen, [offscreen]);

let ctx = document.querySelector('canvas').getContext('2d');
ctx.fillStyle = 'black';
function computer() {
    for (let i = 0; i < 100000; i++) {
        wasm.ticktock();
    }
    wasm.render(ctx);
    // screen.postMessage(wasm.render);
    setTimeout(computer, 0);
}
computer();

let prev;
document.addEventListener('keydown', e => {
    let keyValue = {
        'Enter': 128,
        'Backspace': 129,
        'ArrowLeft': 130,
        'ArrowUp': 131,
        'ArrowRight': 132,
        'ArrowDown': 133,
        'Delete': 139,
        'Escape': 140,
        'F1': 141,
        'F2': 142,
        'F3': 143,
        'F4': 144,
        'F5': 145,
        'F6': 146,
        'F7': 147,
        'F8': 148,
        'F9': 149,
        'F10': 150,
        'F11': 151,
        'F12': 152,
    }[e.key];
    if (!keyValue)
        keyValue = e.key.charCodeAt(0);
    if (keyValue !== prev && prev !== 0) {
        keyValue = 0;
    }
    prev = keyValue;
    wasm.keyboard(true, keyValue);
});

document.addEventListener('keyup', e => {
    prev = 0;
    wasm.keyboard(true, 0);
});