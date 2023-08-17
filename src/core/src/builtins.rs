mod arithmetic;
mod gates;
mod architecture;

use wasm_bindgen::prelude::*;

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

pub fn nBit16(n: u16, i: u8) -> bool {
	// TODO: this and placebit when used together can be further optimized
	((n >> i) & 1) != 0
}

pub fn nBit16_0(n: u16) -> bool {
	(n & 1) != 0
}


fn placeBit16(b: bool, i: u8) -> u16 {
	u16::from(b) << i
}


fn placeBit16_0(b: bool) -> u16 {
	u16::from(b)
}

pub fn word16_16(a: bool, b: bool, c: bool, d: bool, e: bool, f: bool, g: bool, h: bool, 
        i: bool, j: bool, k: bool, l: bool, m: bool, n: bool, o: bool, p: bool) -> u16 {
	placeBit16_0(a) |
    placeBit16(b, 1) |
    placeBit16(c, 2) |
    placeBit16(d, 3) |
    placeBit16(e, 4) |
    placeBit16(f, 5) |
    placeBit16(g, 6) |
    placeBit16(h, 7) |
    placeBit16(i, 8) |
    placeBit16(j, 9) |
    placeBit16(k, 10) |
    placeBit16(l, 11) |
    placeBit16(m, 12) |
    placeBit16(n, 13) |
    placeBit16(o, 14) |
    placeBit16(p, 15)
}


pub fn slice16_0to12(n: u16) -> u16 {
	n & 8191
}


pub fn slice16_0to14(n: u16) -> u16 {
	n & 32767
}


pub fn slice16_13to14(n: u16) -> u16 {
	n >> 13
}

static mut PC_DFFOUT: u16 = 0;

pub fn PC_reg(in_: u16) -> u16 {
	let out = unsafe { PC_DFFOUT };
	// NOTE: load is always true
	if unsafe { CLOCK } {
		unsafe { PC_DFFOUT = in_ };
	}
	out
}

static mut DREGISTER_DFFOUT: u16 = 0;

pub fn DRegister(in_: u16, load: bool) -> u16 {
    let out = unsafe { DREGISTER_DFFOUT };
	if unsafe { CLOCK } && load {
		unsafe { DREGISTER_DFFOUT = in_ };
		return in_;
	}
	out
}

static mut AREGISTER_DFFOUT: u16 = 0;

pub fn ARegister(in_: u16, load: bool) -> u16 {
	let out = unsafe { AREGISTER_DFFOUT };
	if unsafe { CLOCK } && load {
		unsafe { AREGISTER_DFFOUT = in_ };
		return in_;
	}
	out
}

pub fn getScreen() -> [u16; 8192] {
	unsafe { SCREEN_MEMORY }
}

static mut RAM16K_MEMORY: [u16; 16384] = [0; 16384];

pub fn RAM16K(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { RAM16K_MEMORY }[address as usize];
    if unsafe { CLOCK } && load {
        unsafe { RAM16K_MEMORY[address as usize] = in_ };
    }
    out
}


pub fn ROM32K(address: u16) -> u16 {
	unsafe { ROM32K_MEMORY[address as usize] }
}

static mut SCREEN_MEMORY: [u16; 8192] = [0; 8192];

pub fn Screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { SCREEN_MEMORY }[address as usize];
    if unsafe { CLOCK } && load {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}

static mut CURRENT_KEY: u16 = 0;
#[wasm_bindgen]
pub fn Keyboard(load: bool, pressed: u16) -> u16 {
	if load {
		unsafe { CURRENT_KEY = pressed };
	}
	unsafe { CURRENT_KEY }
}

static mut ROM32K_MEMORY: Vec<u16> = Vec::new();
#[wasm_bindgen]
pub fn loadROM(in_: JsValue) {
	unsafe { ROM32K_MEMORY = serde_wasm_bindgen::from_value(in_).unwrap() };
}

// #[wasm_bindgen]
// pub fn getRAM() -> Result<JsValue, serde_wasm_bindgen::Error> {
// 	unsafe { serde_wasm_bindgen::to_value(&RAM16K_MEMORY) }
// }