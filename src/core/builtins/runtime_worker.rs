use super::{hardware, worker_helpers};
use crate::architecture;
use serde::Serialize;
use std::cell::LazyCell;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(tag = "action", rename = "stoppedRuntime")]
pub struct StoppedRuntimeMessage {}

// I would REALLY like to use atomics here but from profiling
// i32.atomic instructions are orders of magnitude slower than
// i32.load and i32.store. For now this will have to do because
// this module is the most performance critical part of the app.
// Useful reference: https://stackoverflow.com/a/47722736/12230735
pub static mut IN_RUNTIME_LOOP: bool = false;
pub static mut STOP_RUNTIME_LOOP: bool = false;
pub static mut LOADING_NEW_PROGRAM: bool = false;
pub static mut READY_TO_LOAD_NEW_PROGRAM: bool = false;
pub static mut EMIT_INTERVAL_STEP_TOTAL: usize = 0;

// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
pub const MAX_STEPS_PER_LOOP: usize = 30_000;
pub const MIN_STEPS_PER_LOOP: usize = 1;
pub static mut STEPS_PER_LOOP: usize = MAX_STEPS_PER_LOOP;

static mut DELAYED_IN_RUNTIME_LOOP_FALSE: LazyCell<Closure<dyn Fn()>> = LazyCell::new(|| {
    Closure::new(|| unsafe {
        IN_RUNTIME_LOOP = false;
    })
});

#[wasm_bindgen(js_name = tryStartRuntime)]
pub fn try_start() {
    unsafe {
        if IN_RUNTIME_LOOP {
            return;
        }
        IN_RUNTIME_LOOP = true;
    }
    loop {
        if std::hint::black_box(unsafe { LOADING_NEW_PROGRAM }) {
            unsafe {
                READY_TO_LOAD_NEW_PROGRAM = true;
            }
            while std::hint::black_box(unsafe { LOADING_NEW_PROGRAM }) {}
        }
        for _ in 0..unsafe { STEPS_PER_LOOP } {
            architecture::ticktock();
        }
        unsafe {
            EMIT_INTERVAL_STEP_TOTAL += STEPS_PER_LOOP;
        }
        if unsafe { hardware::PRESSED_KEY } == 32767 {
            // TODO: remmove?
            unsafe {
                hardware::PRESSED_KEY = 0;
            }
            worker_helpers::post_worker_message(StoppedRuntimeMessage {});
            break;
        }
        if unsafe { STOP_RUNTIME_LOOP } {
            unsafe {
                STOP_RUNTIME_LOOP = false;
            }
            break;
        }
    }

    // NEEDED because if another message while this loop is running it won't
    // actually run immediately and guard clause return and will instead be put
    // in js's job queue and run AFTER the loop is over!! which will cause the
    // queued messages to happen after IN_RUNTIME_LOOP is set to false
    worker_helpers::set_timeout_with_callback_and_timeout(
        unsafe { DELAYED_IN_RUNTIME_LOOP_FALSE.as_ref().unchecked_ref() },
        0,
    );
}
