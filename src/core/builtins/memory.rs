use super::hardware;
use std::cell::SyncUnsafeCell;

static PC_DFF_OUT: SyncUnsafeCell<u16> = SyncUnsafeCell::new(0);
pub fn pc_register(in_: u16) -> u16 {
    // NOTE: load is always true
    if unsafe { *hardware::CLOCK.get() } {
        let out = unsafe { *PC_DFF_OUT.get() };
        unsafe {
            *PC_DFF_OUT.get() = in_;
        }
        // this *should* return in_, but from my experiments thusfar I haven't
        // been able to find an implementation that works in a simpler way than
        // what we currently have
        out
    } else {
        unsafe { *PC_DFF_OUT.get() }
    }
}

static DREGISTER_DFF_OUT: SyncUnsafeCell<u16> = SyncUnsafeCell::new(0);
pub fn d_register(in_: u16, load: bool) -> u16 {
    if load && unsafe { *hardware::CLOCK.get() } {
        unsafe {
            *DREGISTER_DFF_OUT.get() = in_;
        }
        in_
    } else {
        unsafe { *DREGISTER_DFF_OUT.get() }
    }
}

static AREGISTER_DFF_OUT: SyncUnsafeCell<u16> = SyncUnsafeCell::new(0);
pub fn a_register(in_: u16, load: bool) -> u16 {
    if load && unsafe { *hardware::CLOCK.get() } {
        unsafe {
            *AREGISTER_DFF_OUT.get() = in_;
        }
        in_
    } else {
        unsafe { *AREGISTER_DFF_OUT.get() }
    }
}

pub static RAM16K_MEMORY: SyncUnsafeCell<[u16; 16384]> = SyncUnsafeCell::new([0; 16384]);
pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { *(RAM16K_MEMORY.get() as *mut u16).add(address as usize) };
    if load && unsafe { *hardware::CLOCK.get() } {
        unsafe {
            *(RAM16K_MEMORY.get() as *mut u16).add(address as usize) = in_;
        }
    }
    out
}

pub static ROM32K_MEMORY: SyncUnsafeCell<[u16; 32768]> = SyncUnsafeCell::new([0; 32768]);
pub fn rom32k(pc: u16) -> u16 {
    unsafe { *(ROM32K_MEMORY.get() as *mut u16).add(pc as usize) }
}

pub static SCREEN_MEMORY: SyncUnsafeCell<[u16; 8192]> = SyncUnsafeCell::new([0; 8192]);
pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
    let out = unsafe { *(SCREEN_MEMORY.get() as *mut u16).add(address as usize) };
    if load && unsafe { *hardware::CLOCK.get() } {
        unsafe { *(SCREEN_MEMORY.get() as *mut u16).add(address as usize) = in_ };
    }
    out
}
