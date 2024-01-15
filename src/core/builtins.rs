use js_sys::{Array, Uint8ClampedArray, WebAssembly};
use wasm_bindgen::prelude::*;

static mut NAND_CALLS: u64 = 0;
#[allow(non_snake_case)]
pub fn NAND(a: bool, b: bool) -> bool {
    unsafe { NAND_CALLS += 1 };
    !(a && b)
}

#[wasm_bindgen(js_name=NANDCalls)]
pub fn nand_calls() -> u64 {
    unsafe { NAND_CALLS }
}

#[wasm_bindgen(js_name=resetNANDCalls)]
pub fn reset_nand_calls() {
    unsafe { NAND_CALLS = 0 };
}

static mut CLOCK: bool = false;
pub fn tick() {
    unsafe { CLOCK = true };
}

pub fn tock() {
    unsafe { CLOCK = false };
}

pub fn bool_from_u16(n: u16) -> bool {
    n != 0
}

pub fn u16_from_bool(b: bool) -> u16 {
    u16::from(b)
}

pub fn nbit16(n: u16, i: u8) -> bool {
    bool_from_u16((n >> i) & 1)
}

pub fn nbit16_0(n: u16) -> bool {
    bool_from_u16(n & 1)
}

fn placebit16(b: bool, i: u8) -> u16 {
    u16_from_bool(b) << i
}

fn placebit16_0(b: bool) -> u16 {
    u16_from_bool(b)
}

#[allow(clippy::too_many_arguments)]
pub fn word16_16(
    a: bool,
    b: bool,
    c: bool,
    d: bool,
    e: bool,
    f: bool,
    g: bool,
    h: bool,
    i: bool,
    j: bool,
    k: bool,
    l: bool,
    m: bool,
    n: bool,
    o: bool,
    p: bool,
) -> u16 {
    placebit16_0(a)
        | placebit16(b, 1)
        | placebit16(c, 2)
        | placebit16(d, 3)
        | placebit16(e, 4)
        | placebit16(f, 5)
        | placebit16(g, 6)
        | placebit16(h, 7)
        | placebit16(i, 8)
        | placebit16(j, 9)
        | placebit16(k, 10)
        | placebit16(l, 11)
        | placebit16(m, 12)
        | placebit16(n, 13)
        | placebit16(o, 14)
        | placebit16(p, 15)
}

pub fn slice16_0to12(n: u16) -> u16 {
    n & 8191
}

pub fn slice16_0to13(n: u16) -> u16 {
    n & 16383
}

pub fn slice16_0to14(n: u16) -> u16 {
    n & 32767
}

static mut PC_DFFOUT: u16 = 0;

pub fn pc_reg(in_: u16) -> u16 {
    let out = unsafe { PC_DFFOUT };
    // NOTE: load is always true
    if unsafe { CLOCK } {
        unsafe { PC_DFFOUT = in_ };
    }
    out
}

static mut DREGISTER_DFFOUT: u16 = 0;

pub fn dregister(in_: u16, load: bool) -> u16 {
    if load && unsafe { CLOCK } {
        unsafe { DREGISTER_DFFOUT = in_ };
        in_
    } else {
        unsafe { DREGISTER_DFFOUT }
    }
}

static mut AREGISTER_DFFOUT: u16 = 0;

pub fn aregister(in_: u16, load: bool) -> u16 {
    if load && unsafe { CLOCK } {
        unsafe { AREGISTER_DFFOUT = in_ };
        in_
    } else {
        unsafe { AREGISTER_DFFOUT }
    }
}

static mut RAM16K_MEMORY: [u16; 16384] = [0; 16384];

pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { RAM16K_MEMORY[address as usize] };
    if load && unsafe { CLOCK } {
        unsafe { RAM16K_MEMORY[address as usize] = in_ };
    }
    out
}

#[wasm_bindgen(js_name=getRAM)]
pub fn get_ram() -> Vec<u16> {
    unsafe { RAM16K_MEMORY.to_vec() }
}

static mut CURRENT_KEY: u16 = 0;
#[wasm_bindgen]
pub fn keyboard(in_: u16, load: bool) -> u16 {
    if load {
        unsafe { CURRENT_KEY = in_ };
    }
    unsafe { CURRENT_KEY }
}

static mut ROM32K_MEMORY: [u16; 32768] = [0; 32768];

pub fn rom32k(address: u16) -> u16 {
    unsafe { ROM32K_MEMORY[address as usize] }
}

#[wasm_bindgen(js_name=loadROM)]
pub fn load_rom(in_: JsValue) {
    Array::from(&in_).for_each(&mut |v, i, _| {
        unsafe {
            ROM32K_MEMORY[i as usize] = u16::from_str_radix(&v.as_string().unwrap(), 2).unwrap()
        };
    });
}

static mut SCREEN_MEMORY: [u16; 8192] = [0; 8192];

pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { SCREEN_MEMORY[address as usize] };
    if load && unsafe { CLOCK } {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}

mod screen {
    use super::*;

    const SCREEN_WIDTH: usize = 512;
    const SCREEN_HEIGHT: usize = 256;

    const GREEN_COLOR_R: u8 = 177;
    const GREEN_COLOR_G: u8 = 247;
    const GREEN_COLOR_B: u8 = 121;

    const GREEN_COLOR_DATA: u32 = (GREEN_COLOR_R as u32)
        | (GREEN_COLOR_G as u32) << 8
        | (GREEN_COLOR_B as u32) << 16
        | 255 << 24;

    #[wasm_bindgen]
    extern "C" {
        pub type ImageData;

        #[wasm_bindgen(constructor, catch)]
        fn new(data: &Uint8ClampedArray, width: usize, height: usize)
            -> Result<ImageData, JsValue>;
    }

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
        ImageData::new(&sliced_pixel_data, SCREEN_WIDTH, SCREEN_HEIGHT).unwrap()
    }
}
