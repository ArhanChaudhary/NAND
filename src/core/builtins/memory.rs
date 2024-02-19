use super::hardware;

static mut PC_DFF_OUT: u16 = 0;
pub fn pc_register(in_: u16) -> u16 {
    // NOTE: load is always true
    if unsafe { hardware::CLOCK } {
        let out = unsafe { PC_DFF_OUT };
        unsafe {
            PC_DFF_OUT = in_;
        }
        // this *should* return in_, but from my experiments thusfar I haven't
        // been able to find an implementation that works in a simpler way than
        // what we currently have
        out
    } else {
        unsafe { PC_DFF_OUT }
    }
}

static mut DREGISTER_DFF_OUT: u16 = 0;
pub fn d_register(in_: u16, load: bool) -> u16 {
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            DREGISTER_DFF_OUT = in_;
        }
        in_
    } else {
        unsafe { DREGISTER_DFF_OUT }
    }
}

static mut AREGISTER_DFF_OUT: u16 = 0;
pub fn a_register(in_: u16, load: bool) -> u16 {
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            AREGISTER_DFF_OUT = in_;
        }
        in_
    } else {
        unsafe { AREGISTER_DFF_OUT }
    }
}

pub static mut RAM16K_MEMORY: [u16; 16384] = [0; 16384];
pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { RAM16K_MEMORY[address as usize] };
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            RAM16K_MEMORY[address as usize] = in_;
        }
    }
    out
}

pub static mut ROM32K_MEMORY: [u16; 32768] = [0; 32768];
pub fn rom32k(pc: u16) -> u16 {
    unsafe { ROM32K_MEMORY[pc as usize] }
}

pub static mut SCREEN_MEMORY: [u16; 8192] = [0; 8192];
pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { SCREEN_MEMORY[address as usize] };
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            SCREEN_MEMORY[address as usize] = in_;
        }
    }
    out
}
