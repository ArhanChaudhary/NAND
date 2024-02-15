use crate::{
    architecture,
    builtins::{hardware, runtime_worker},
};

pub fn reset_and_stop() {
    if unsafe { runtime_worker::IN_RUNTIME_LOOP } {
        unsafe {
            runtime_worker::STOP_RUNTIME_LOOP = true;
        }
        while std::hint::black_box(unsafe { runtime_worker::IN_RUNTIME_LOOP }) {}
    }
    architecture::reset();
}

pub fn reset(machine_code: Vec<String>) {
    let to_load = machine_code
        .into_iter()
        .map(|v| u16::from_str_radix(v.as_str(), 2).unwrap())
        .collect::<Vec<u16>>();
    unsafe {
        runtime_worker::LOAD_NEW_PROGRAM = true;
    }
    while !std::hint::black_box(unsafe { runtime_worker::READY_TO_LOAD_NEW_PROGRAM }) {}
    hardware::load_rom(to_load);
    architecture::reset();
    unsafe {
        runtime_worker::LOAD_NEW_PROGRAM = false;
        runtime_worker::READY_TO_LOAD_NEW_PROGRAM = false;
    }
    // let _ = js_sys::global()
    //     .unchecked_into::<DedicatedWorkerGlobalScope>()
    //     .post_message(&serde_wasm_bindgen::to_value(&EmitHardwareInfoMessage::default()).unwrap());
}

pub fn computer_stop() {
    if unsafe { runtime_worker::IN_RUNTIME_LOOP } {
        unsafe {
            runtime_worker::STOP_RUNTIME_LOOP = true;
        }
    }
}

pub fn computer_speed(speed_percentage: u16) {
    let min_log_value = (runtime_worker::MIN_STEPS_PER_LOOP as f64).log10();
    let max_log_value = (runtime_worker::MAX_STEPS_PER_LOOP as f64).log10();
    let log_scaled_value =
        min_log_value + (speed_percentage as f64 / 100.0) * (max_log_value - min_log_value);
    unsafe {
        runtime_worker::STEPS_PER_LOOP = 10.0_f64.powf(log_scaled_value) as usize;
    }
}
