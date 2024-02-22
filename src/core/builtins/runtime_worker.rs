use super::{hardware, js_helpers};
use crate::architecture;
use serde::Serialize;
use std::cell::{LazyCell, SyncUnsafeCell};
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(tag = "action", rename = "stoppedRuntime")]
pub struct StoppedRuntimeMessage {}

// I would REALLY like to use atomics here but from profiling
// i32.atomic instructions are orders of magnitude slower than
// i32.load and i32.store. For now this will have to do because
// this module is the most performance critical part of the app.
// Useful reference: https://stackoverflow.com/a/47722736/12230735
pub static IN_RUNTIME_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
pub static STOP_RUNTIME_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
pub static LOADING_NEW_PROGRAM: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
pub static READY_TO_LOAD_NEW_PROGRAM: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
pub static EMIT_INTERVAL_STEP_TOTAL: SyncUnsafeCell<usize> = SyncUnsafeCell::new(0);

// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
pub const MAX_STEPS_PER_LOOP: usize = 30_000;
pub const MIN_STEPS_PER_LOOP: usize = 1;
pub static STEPS_PER_LOOP: SyncUnsafeCell<usize> = SyncUnsafeCell::new(MAX_STEPS_PER_LOOP);

static mut DELAYED_IN_RUNTIME_LOOP_FALSE: LazyCell<Closure<dyn Fn()>> = LazyCell::new(|| {
    Closure::new(|| unsafe {
        *IN_RUNTIME_LOOP.get() = false;
    })
});

#[wasm_bindgen(js_name = tryStartRuntime)]
pub fn try_start() {
    unsafe {
        if *IN_RUNTIME_LOOP.get() {
            return;
        }
        *IN_RUNTIME_LOOP.get() = true;
    }
    loop {
        if std::hint::black_box(unsafe { *LOADING_NEW_PROGRAM.get() }) {
            unsafe {
                *READY_TO_LOAD_NEW_PROGRAM.get() = true;
            }
            while std::hint::black_box(unsafe { *LOADING_NEW_PROGRAM.get() }) {}
        }
        for _ in 0..unsafe { *STEPS_PER_LOOP.get() } {
            architecture::ticktock();
        }
        unsafe {
            *EMIT_INTERVAL_STEP_TOTAL.get() += *STEPS_PER_LOOP.get();
        }
        if hardware::keyboard(0, false) == 32767 {
            // TODO: remmove?
            hardware::keyboard(0, true);
            js_helpers::post_worker_message(StoppedRuntimeMessage {});
            break;
        }
        if unsafe { *STOP_RUNTIME_LOOP.get() } {
            unsafe {
                *STOP_RUNTIME_LOOP.get() = false;
            }
            break;
        }
    }

    // NEEDED because if another message while this loop is running it won't
    // actually run immediately and guard clause return and will instead be put
    // in js's job queue and run AFTER the loop is over!! which will cause the
    // queued messages to happen after IN_RUNTIME_LOOP is set to false
    js_helpers::set_timeout_with_callback_and_timeout(
        unsafe { DELAYED_IN_RUNTIME_LOOP_FALSE.as_ref().unchecked_ref() },
        0,
    );
}
