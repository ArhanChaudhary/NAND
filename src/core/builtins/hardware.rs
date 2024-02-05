use super::{
    bit_manipulation::nbit16,
    memory::{ROM32K_MEMORY, SCREEN_MEMORY},
};
use crate::architecture::ticktock;
use js_sys::{Array, Uint8ClampedArray, WebAssembly};
use wasm_bindgen::prelude::*;

// -----------------------------------------------

// NAND + 🦀 + 🕸️ = ❤️
#[allow(non_snake_case)]
pub fn NAND(a: bool, b: bool) -> bool {
    unsafe { NAND_CALLS += 1 };
    !(a && b) // for science!!
}

//      ┌─────┐
// A ->─┤     │
//      │ NAND├─>─ Q
// B ->─┤     │
//      └─────┘

// -----------------------------------------------

pub static mut NAND_CALLS: u64 = 0;
#[wasm_bindgen(js_name=NANDCalls)]
pub fn nand_calls() -> u64 {
    unsafe { NAND_CALLS }
}

#[wasm_bindgen(js_name=resetNANDCalls)]
pub fn reset_nand_calls() {
    unsafe { NAND_CALLS = 0 };
}

pub static mut CLOCK: bool = false;
pub fn tick() {
    unsafe { CLOCK = true };
}

pub fn tock() {
    unsafe { CLOCK = false };
}

#[wasm_bindgen(js_name=loadROM)]
pub fn load_rom(in_: JsValue) {
    Array::from(&in_).for_each(&mut |v, i, _| {
        unsafe {
            ROM32K_MEMORY[i as usize] = u16::from_str_radix(&v.as_string().unwrap(), 2).unwrap()
        };
    });
}

static mut CURRENT_KEY: u16 = 0;
#[wasm_bindgen]
pub fn keyboard(in_: u16, load: bool) -> u16 {
    if load {
        unsafe { CURRENT_KEY = in_ };
        in_
    } else {
        unsafe { CURRENT_KEY }
    }
}

#[wasm_bindgen]
extern "C" {
    pub type ImageData;

    #[wasm_bindgen(constructor)]
    fn js_new(data: &Uint8ClampedArray, width: usize, height: usize) -> ImageData;
}

const SCREEN_WIDTH: usize = 512;
const SCREEN_HEIGHT: usize = 256;

const GREEN_COLOR_R: u8 = 177;
const GREEN_COLOR_G: u8 = 247;
const GREEN_COLOR_B: u8 = 121;

const GREEN_COLOR_DATA: u32 =
    (GREEN_COLOR_R as u32) | (GREEN_COLOR_G as u32) << 8 | (GREEN_COLOR_B as u32) << 16 | 255 << 24;

// I've tried out two separate algorithms to render the screen; here's a benchmark between
// the two algorithms for my future reference.

// The current algorithm comfortably hovers at an average of around 0.28ms per blit. The
// second algorithm on the `alternative-screen-rendering-algorithm` branch performs at
// around 0.05ms per blit on empty screens, but at around 2.11ms per blit on the largest
// Square in the `Square` example program.

// Currently, I have no plans to switch between these two algorithms as
// 1) the magic number for when to switch would be vastly different across different
// platforms
// 2) It wouldn't do anything because the current algorithm is already fast enough to draw
// every frame (and optimizing in this case doesn't do anything because the actual computer
// runs on another web worker)
// Still, this is nice to note for future me.
#[wasm_bindgen]
pub fn render() -> ImageData {
    let mut pixel_data: [u32; SCREEN_WIDTH * SCREEN_HEIGHT] = [0; SCREEN_WIDTH * SCREEN_HEIGHT];
    for (i, &word16) in unsafe { SCREEN_MEMORY.iter().enumerate() } {
        let y = i / (SCREEN_WIDTH / 16) * SCREEN_WIDTH;
        for j in 0..16 {
            if nbit16(word16, j) {
                let x = ((i * 16) + j as usize) % SCREEN_WIDTH;
                pixel_data[y + x] = GREEN_COLOR_DATA;
            }
        }
    }
    let base = pixel_data.as_ptr() as u32;
    let len = (pixel_data.len() * 4) as u32;
    let sliced_pixel_data = Uint8ClampedArray::new(
        &wasm_bindgen::memory()
            .unchecked_into::<WebAssembly::Memory>()
            .buffer(),
    )
    .slice(base, base + len);
    ImageData::js_new(&sliced_pixel_data, SCREEN_WIDTH, SCREEN_HEIGHT)
}

#[wasm_bindgen(js_name=ticktockFor)]
pub fn ticktock_for(count: u16) {
    for _ in 0..count {
        ticktock();
    }
}
