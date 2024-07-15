use super::hardware;

static mut PC_DFF_OUT: u16 = 0;
pub static mut PC: u16 = 0;

pub fn pc_register(in_: u16) {
    unsafe {
        // NOTE: load is always true
        if hardware::CLOCK {
            PC_DFF_OUT = in_;
        } else {
            PC = PC_DFF_OUT;
        }
    }
}

static mut D_REGISTER_DFF_OUT: u16 = 0;
pub fn d_register(in_: u16, load: bool) -> u16 {
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            D_REGISTER_DFF_OUT = in_;
        }
        in_
    } else {
        unsafe { D_REGISTER_DFF_OUT }
    }
}

static mut A_REGISTER_DFF_OUT: u16 = 0;
pub fn a_register(in_: u16, load: bool) -> u16 {
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            A_REGISTER_DFF_OUT = in_;
        }
        in_
    } else {
        unsafe { A_REGISTER_DFF_OUT }
    }
}

pub static mut RAM16K_MEMORY: [u16; 16384] = [0; 16384];
pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { *RAM16K_MEMORY.as_ptr().add(address as usize) };
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            *RAM16K_MEMORY.as_mut_ptr().add(address as usize) = in_;
        }
    }
    out
}

pub static mut ROM32K_MEMORY: [u16; 32768] = [0; 32768];
pub fn rom32k(pc: u16) -> u16 {
    unsafe { *ROM32K_MEMORY.as_ptr().add(pc as usize) }
}

pub static mut SCREEN_MEMORY: [u16; 8192] = [0; 8192];
pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { *SCREEN_MEMORY.as_ptr().add(address as usize) };
    if load && unsafe { hardware::CLOCK } {
        unsafe {
            *SCREEN_MEMORY.as_mut_ptr().add(address as usize) = in_;
        }
    }
    out
}

pub fn clear_ram() {
    unsafe {
        RAM16K_MEMORY.fill(0);
    }
}
