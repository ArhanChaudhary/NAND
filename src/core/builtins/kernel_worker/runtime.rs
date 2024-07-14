use super::{ResetMessage, SpeedMessage};
use crate::architecture;
use crate::builtins::{hardware, runtime_worker};
use std::ptr::{self, addr_of};

pub fn reset_blocking(reset_message: ResetMessage) {
    let machine_code = reset_message
        .machine_code
        .into_iter()
        .map(|v| u16::from_str_radix(v.as_str(), 2).unwrap())
        .collect::<Vec<u16>>();
    unsafe {
        runtime_worker::LOADING_NEW_PROGRAM = true;
        // read_volatile is absolutely needed here to prevent the compiler from optimizing the loop away
        // see https://godbolt.org/z/xq7P8PEj4 for the full story
        while !ptr::read_volatile(addr_of!(runtime_worker::READY_TO_LOAD_NEW_PROGRAM)) {}
    }
    hardware::load_rom(machine_code.as_slice());
    architecture::reset();
}

pub fn try_stop_blocking() {
    unsafe {
        if runtime_worker::IN_RUNTIME_LOOP {
            runtime_worker::STOP_RUNTIME_LOOP = true;
            while ptr::read_volatile(addr_of!(runtime_worker::IN_RUNTIME_LOOP)) {}
        }
    }
}

pub const ALL_STEPS_PER_LOOP: [usize; 11] = [
    1, 10, 500, 2000, 8000, 15000, 22500, 29250, 29500, 29750, 30000,
];

pub fn speed(speed_message: SpeedMessage) {
    let speed_percentage = speed_message.speed_percentage;
    let div = (speed_percentage as usize) / 10;
    if div == 10 {
        unsafe {
            runtime_worker::STEPS_PER_LOOP = ALL_STEPS_PER_LOOP[10];
        }
    } else {
        let div_speed = ALL_STEPS_PER_LOOP[div];
        let next_div_speed = ALL_STEPS_PER_LOOP[div + 1];
        let lerp = (speed_percentage as usize) % 10;
        unsafe {
            runtime_worker::STEPS_PER_LOOP = div_speed + ((next_div_speed - div_speed) * lerp) / 10;
        }
    };
}
