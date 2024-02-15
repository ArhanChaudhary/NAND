use crate::{
    architecture,
    builtins::{
        hardware::load_rom,
        runtime_worker::{
            IN_RUNTIME_LOOP, LOAD_NEW_PROGRAM, READY_TO_LOAD_NEW_PROGRAM, STOP_RUNTIME_LOOP,
        },
    },
};

pub fn computer_reset() {
    if unsafe { IN_RUNTIME_LOOP } {
        unsafe {
            STOP_RUNTIME_LOOP = true;
        }
        while std::hint::black_box(unsafe { IN_RUNTIME_LOOP }) {}
    }
    architecture::reset();
}

pub fn computer_reset_and_start(machine_code: Vec<String>) {
    let to_load = machine_code
        .into_iter()
        .map(|v| u16::from_str_radix(v.as_str(), 2).unwrap())
        .collect::<Vec<u16>>();
    unsafe {
        LOAD_NEW_PROGRAM = true;
    }
    while !std::hint::black_box(unsafe { READY_TO_LOAD_NEW_PROGRAM }) {}
    load_rom(to_load);
    architecture::reset();
    unsafe {
        LOAD_NEW_PROGRAM = false;
        READY_TO_LOAD_NEW_PROGRAM = false;
    }
    // let _ = js_sys::global()
    //     .unchecked_into::<DedicatedWorkerGlobalScope>()
    //     .post_message(&serde_wasm_bindgen::to_value(&EmitHardwareInfoMessage::default()).unwrap());
}

pub fn computer_stop() {
    if unsafe { IN_RUNTIME_LOOP } {
        unsafe {
            STOP_RUNTIME_LOOP = true;
        }
    }
}

// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
const MAX_STEPS_PER_LOOP: usize = 30_000;
const MIN_STEPS_PER_LOOP: usize = 1;

pub static mut STEPS_PER_LOOP: usize = MAX_STEPS_PER_LOOP;

pub fn computer_speed(speed_percentage: u16) {
    let min_log_value = (MIN_STEPS_PER_LOOP as f64).log10();
    let max_log_value = (MAX_STEPS_PER_LOOP as f64).log10();
    let log_scaled_value =
        min_log_value + (speed_percentage as f64 / 100.0) * (max_log_value - min_log_value);
    unsafe {
        STEPS_PER_LOOP = 10.0_f64.powf(log_scaled_value) as usize;
    }
}
