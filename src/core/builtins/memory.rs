use super::hardware::CLOCK;

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

pub const RAM16K_MEMORY_LEN: usize = 16384;
pub static mut RAM16K_MEMORY: [u16; RAM16K_MEMORY_LEN] = [0; RAM16K_MEMORY_LEN];
pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { RAM16K_MEMORY[address as usize] };
    if load && unsafe { CLOCK } {
        unsafe { RAM16K_MEMORY[address as usize] = in_ };
    }
    out
}

const ROM32K_MEMORY_LEN: usize = 32768;
pub static mut ROM32K_MEMORY: [u16; ROM32K_MEMORY_LEN] = [0; ROM32K_MEMORY_LEN];
pub fn rom32k(address: u16) -> u16 {
    unsafe { ROM32K_MEMORY[address as usize] }
}

pub const SCREEN_MEMORY_LEN: usize = 8192;
pub static mut SCREEN_MEMORY: [u16; SCREEN_MEMORY_LEN] = [0; SCREEN_MEMORY_LEN];
pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { SCREEN_MEMORY[address as usize] };
    if load && unsafe { CLOCK } {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}
