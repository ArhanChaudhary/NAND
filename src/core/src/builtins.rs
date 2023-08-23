mod arithmetic;
mod gates;
mod architecture;

use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

#[allow(non_snake_case)]
pub fn NAND(a: bool, b: bool) -> bool {
    !(a && b)
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
	// TODO: this and placebit when used together can be further optimized
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

pub fn word16_16(a: bool, b: bool, c: bool, d: bool, e: bool, f: bool, g: bool, h: bool, 
        i: bool, j: bool, k: bool, l: bool, m: bool, n: bool, o: bool, p: bool) -> u16 {
	placebit16_0(a) |
    placebit16(b, 1) |
    placebit16(c, 2) |
    placebit16(d, 3) |
    placebit16(e, 4) |
    placebit16(f, 5) |
    placebit16(g, 6) |
    placebit16(h, 7) |
    placebit16(i, 8) |
    placebit16(j, 9) |
    placebit16(k, 10) |
    placebit16(l, 11) |
    placebit16(m, 12) |
    placebit16(n, 13) |
    placebit16(o, 14) |
    placebit16(p, 15)
}

pub fn slice16_0to12(n: u16) -> u16 {
	n & 8191
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
    let out = unsafe { DREGISTER_DFFOUT };
	if unsafe { CLOCK } && load {
		unsafe { DREGISTER_DFFOUT = in_ };
		return in_;
	}
	out
}

static mut AREGISTER_DFFOUT: u16 = 0;

pub fn aregister(in_: u16, load: bool) -> u16 {
	let out = unsafe { AREGISTER_DFFOUT };
	if unsafe { CLOCK } && load {
		unsafe { AREGISTER_DFFOUT = in_ };
		return in_;
	}
	out
}

static mut RAM16K_MEMORY: Vec<u16> = Vec::new();

pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
	if address >= 16384 {
		return 0;
	}
    let out = unsafe { &RAM16K_MEMORY }[address as usize];
    if unsafe { CLOCK } && load {
        unsafe { RAM16K_MEMORY[address as usize] = in_ };
    }
    out
}

static mut CURRENT_KEY: u16 = 0;
#[wasm_bindgen]
pub fn keyboard(load: bool, pressed: u16) -> u16 {
	if load {
		unsafe { CURRENT_KEY = pressed };
	}
	unsafe { CURRENT_KEY }
}

static mut ROM32K_MEMORY: Vec<u16> = Vec::new();

pub fn rom32k(address: u16) -> u16 {
	unsafe { ROM32K_MEMORY[address as usize] }
}

#[wasm_bindgen(js_name=loadROM)]
pub fn load_rom(in_: JsValue) {
	unsafe { ROM32K_MEMORY = Vec::new() };
	let arr: js_sys::Array = in_.into();
	for i in 0..arr.length() {
		let s = arr.get(i).as_string().unwrap();
		let n = u16::from_str_radix(&s, 2).unwrap();
		unsafe { ROM32K_MEMORY.push(n) };
	}
}

static mut SCREEN_MEMORY: Vec<u16> = Vec::new();

pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
	let out = unsafe { &SCREEN_MEMORY }[address as usize];
    if unsafe { CLOCK } && load {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}

#[wasm_bindgen(js_name=getScreen)]
pub fn get_screen() -> Vec<u16> {
	unsafe { SCREEN_MEMORY.clone() }
}

#[wasm_bindgen(js_name=clearScreen)]
pub fn clear_screen() {
	unsafe { SCREEN_MEMORY = vec![0; 8192] };
}

#[wasm_bindgen]
pub fn render(ctx: CanvasRenderingContext2d, screen_memory: Vec<u16>) {
	ctx.clear_rect(0.0, 0.0, 512.0, 256.0);
	for i in 0..8192u16 {
		let word16 = screen_memory[i as usize];
		for j in 0..16 {
			if nbit16(word16, j) {
				let x = ((i * 16) + j as u16) % 512;
				let y = i / 32;
				ctx.fill_rect(x as f64, y as f64, 1.0, 1.0);
			}
		}
	}
}

#[wasm_bindgen(start)]
fn init() {
	unsafe { RAM16K_MEMORY = vec![0; 16384] };
	// unsafe { ROM32K_MEMORY = vec![0; 32768] };
	unsafe { SCREEN_MEMORY = vec![0; 8192] };
}