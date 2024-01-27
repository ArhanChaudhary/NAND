use super::hardware::CLOCK;
use wasm_bindgen::prelude::*;

static mut PC_DFFOUT: u16 = 0;
pub fn pcregister(in_: u16) -> u16 {
    // NOTE: load is always true
    if unsafe { CLOCK } {
        let out = unsafe { PC_DFFOUT };
        unsafe { PC_DFFOUT = in_ };
        // this *should* return in_, but from my experiments thusfar I haven't
        // been able to find an implementation that works in a simpler way than
        // what we currently have
        out
    } else {
        unsafe { PC_DFFOUT }
    }
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

pub static mut ROM32K_MEMORY: [u16; 32768] = [0; 32768];
pub fn rom32k(address: u16) -> u16 {
    unsafe { ROM32K_MEMORY[address as usize] }
}

pub static mut SCREEN_MEMORY: [u16; 8192] = [0; 8192];
pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { SCREEN_MEMORY[address as usize] };
    if load && unsafe { CLOCK } {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}
