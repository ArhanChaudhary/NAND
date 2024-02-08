use super::{
    bit_manipulation::nbit16,
    memory::{ROM32K_MEMORY, SCREEN_MEMORY},
};
use js_sys::{Uint8ClampedArray, WebAssembly};
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

static mut NAND_CALLS: u64 = 0;
pub fn nand_calls() -> u64 {
    unsafe { NAND_CALLS }
}

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

pub fn load_rom(in_: Vec<String>) {
    for (i, v) in in_.into_iter().enumerate() {
        unsafe {
            ROM32K_MEMORY[i] = u16::from_str_radix(v.as_str(), 2).unwrap();
        }
    }
}

static mut CURRENT_KEY: u16 = 0;
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
    type ImageData;
    pub type OffscreenCanvasRenderingContext2d;

    #[wasm_bindgen(constructor)]
    fn new_with_uint8_clamped_array_and_width_and_height(
        data: &Uint8ClampedArray,
        width: usize,
        height: usize,
    ) -> ImageData;

    #[wasm_bindgen(method, js_name = putImageData)]
    fn put_image_data(
        this: &OffscreenCanvasRenderingContext2d,
        imagedata: &ImageData,
        dx: usize,
        dy: usize,
    );
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
pub static mut CTX: Option<OffscreenCanvasRenderingContext2d> = None;

pub fn render() {
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
    let image_data = ImageData::new_with_uint8_clamped_array_and_width_and_height(
        &sliced_pixel_data,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
    );
    unsafe {
        CTX.as_ref()
            .unwrap_unchecked()
            .put_image_data(&image_data, 0, 0);
    }
}
