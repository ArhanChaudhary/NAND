use super::{KeyboardMessage, ResetAndPartialStartMessage, SpeedMessage};
use crate::architecture;
use crate::builtins::utils::js_api;
use crate::builtins::{hardware, runtime_worker};
use std::ptr;

pub fn try_stop_and_reset_blocking() {
    if runtime_worker::in_runtime_loop() {
        unsafe {
            *runtime_worker::STOP_RUNTIME_LOOP.get() = true;
        }
        while runtime_worker::in_runtime_loop_volatile() {}
    }
    architecture::reset();
}

pub fn reset_blocking_and_partial_start(
    reset_and_partial_start_message: ResetAndPartialStartMessage,
) {
    let machine_code = reset_and_partial_start_message
        .machine_code
        .into_iter()
        .map(|v| u16::from_str_radix(v.as_str(), 2).unwrap())
        .collect::<Vec<u16>>();
    unsafe {
        *runtime_worker::LOADING_NEW_PROGRAM.get() = true;
    }
    // read_volatile is absolutely needed here to prevent the compiler from optimizing the loop away
    // see https://godbolt.org/z/xq7P8PEj4 for the full story
    while unsafe { !ptr::read_volatile(runtime_worker::READY_TO_LOAD_NEW_PROGRAM.get()) } {}
    hardware::load_rom(machine_code.as_slice());
    architecture::reset();
    unsafe {
        *runtime_worker::LOADING_NEW_PROGRAM.get() = false;
        *runtime_worker::READY_TO_LOAD_NEW_PROGRAM.get() = false;
    }
}

pub fn try_stop() {
    if runtime_worker::in_runtime_loop() {
        unsafe {
            *runtime_worker::STOP_RUNTIME_LOOP.get() = true;
        }
        js_api::post_worker_message(runtime_worker::StoppedRuntimeMessage {});
    }
}

pub fn speed(speed_message: SpeedMessage) {
    let speed_percentage = speed_message.speed_percentage;
    let min_log_value = (runtime_worker::MIN_STEPS_PER_LOOP as f64).log10();
    let max_log_value = (runtime_worker::MAX_STEPS_PER_LOOP as f64).log10();
    let log_scaled_value =
        min_log_value + (speed_percentage as f64 / 100.0) * (max_log_value - min_log_value);
    unsafe {
        *runtime_worker::STEPS_PER_LOOP.get() = 10.0_f64.powf(log_scaled_value) as usize;
    }
}

pub fn keyboard(keyboard_message: KeyboardMessage) {
    hardware::keyboard(keyboard_message.key, true);
}
