mod architecture;
mod arithmetic;
mod gates;

use js_sys::Array;
use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

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
    let out = unsafe { &RAM16K_MEMORY }[address as usize];
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
pub fn keyboard(load: bool, pressed: u16) -> u16 {
    if load {
        unsafe { CURRENT_KEY = pressed };
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
    let out = unsafe { &SCREEN_MEMORY }[address as usize];
    if load && unsafe { CLOCK } {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}

#[wasm_bindgen(js_name=getScreen)]
pub fn get_screen() -> Vec<u16> {
    unsafe { SCREEN_MEMORY.to_vec() }
}

#[wasm_bindgen]
pub fn render(ctx: CanvasRenderingContext2d, screen_memory: Vec<u16>) {
    ctx.clear_rect(0.0, 0.0, 512.0, 256.0);
    for i in 0..8192u16 {
        let word16 = screen_memory[i as usize];
        let y = i / 32;
        for j in 0..16 {
            if nbit16(word16, j) {
                let x = ((i * 16) + j as u16) % 512;
                ctx.fill_rect(x as f64, y as f64, 1.0, 1.0);
            }
        }
    }
}
