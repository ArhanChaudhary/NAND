use super::hardware;
use super::utils::{js_api, sync_cell};
use crate::architecture;
use serde::Serialize;
use std::cell::SyncUnsafeCell;
use std::{ptr, thread};
use wasm_bindgen::prelude::*;

static IN_RUNTIME_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
static DELAYED_IN_RUNTIME_LOOP_FALSE: sync_cell::SyncLazyCell<Closure<dyn Fn()>> =
    sync_cell::SyncLazyCell::new(|| {
        Closure::new(|| unsafe {
            *IN_RUNTIME_LOOP.get() = false;
        })
    });
pub fn in_runtime_loop() -> bool {
    unsafe { *IN_RUNTIME_LOOP.get() }
}
pub fn in_runtime_loop_volatile() -> bool {
    unsafe { ptr::read_volatile(IN_RUNTIME_LOOP.get()) }
}

static EMIT_INTERVAL_STEP_TOTAL: SyncUnsafeCell<usize> = SyncUnsafeCell::new(0);
pub fn emit_interval_step_total() -> usize {
    unsafe { *EMIT_INTERVAL_STEP_TOTAL.get() }
}

// TODO: I would REALLY like to use atomics or a better form of synchronization
// here but I am hesitant because I don't want to a open a worms not worth
// opening because of the cutting edge nature of wasm32-unknown-unknown.

// It's clear that this is possible, but with how much overhead, and is this even
// faster enough to matter at all? I don't know, and it's frankly a bit overwhelming.
// So, I've opted to take the easy way out with a spin loop. I'm not happy about
// it, but I know in the back of my head that this probably doesn't make a difference
// at the end of the day.

// References for the future:
// https://github.com/rust-lang/rust/commit/72958acd57fb32e0f8027c0d7e76c9a0c7f155d2
// https://github.com/WebAssembly/threads/blob/main/proposals/threads/Overview.md
// https://docs.rs/crossbeam/0.8.0/crossbeam/
// https://docs.rs/parking_lot/0.11.1/parking_lot/
// https://rustwasm.github.io/wasm-bindgen/reference/js-promises-and-rust-futures.html
// https://github.com/wasm-rs/shared-channel/blob/master/src/spsc.rs
pub static STOP_RUNTIME_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
pub static LOADING_NEW_PROGRAM: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
pub static READY_TO_LOAD_NEW_PROGRAM: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);

// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
pub const MAX_STEPS_PER_LOOP: usize = 30_000;
pub const MIN_STEPS_PER_LOOP: usize = 1;
pub static STEPS_PER_LOOP: SyncUnsafeCell<usize> = SyncUnsafeCell::new(MAX_STEPS_PER_LOOP);

#[derive(Serialize)]
#[serde(tag = "action", rename = "stoppedRuntime")]
pub struct StoppedRuntimeMessage {}

#[wasm_bindgen(js_name = tryStartRuntime)]
pub fn try_start() {
    unsafe {
        if *IN_RUNTIME_LOOP.get() {
            return;
        }
        *IN_RUNTIME_LOOP.get() = true;
    }
    loop {
        let steps_per_loop = unsafe { *STEPS_PER_LOOP.get() };
        unsafe {
            if *LOADING_NEW_PROGRAM.get() {
                *READY_TO_LOAD_NEW_PROGRAM.get() = true;
                while ptr::read_volatile(LOADING_NEW_PROGRAM.get()) {}
            }
        }
        for _ in 0..steps_per_loop {
            architecture::ticktock();
        }
        unsafe {
            *EMIT_INTERVAL_STEP_TOTAL.get() += steps_per_loop;
        }
        if MAX_STEPS_PER_LOOP != steps_per_loop {
            thread::sleep(std::time::Duration::from_nanos(
                ((MAX_STEPS_PER_LOOP - steps_per_loop) * 300) as u64,
            ));
        }
        if hardware::keyboard(0, false) == 32767 {
            // This is still needed even though present in architecture::reset
            // or else pressing start again doesn't work because it wasnt reset.
            hardware::keyboard(0, true);
            js_api::post_worker_message(StoppedRuntimeMessage {});
            break;
        }
        unsafe {
            if *STOP_RUNTIME_LOOP.get() {
                *STOP_RUNTIME_LOOP.get() = false;
                break;
            }
        }
    }

    // NEEDED because if another message while this loop is running it won't
    // actually run immediately and guard clause return and will instead be put
    // in js's job queue and run AFTER the loop is over!! which will cause the
    // queued messages to happen after IN_RUNTIME_LOOP is set to false
    js_api::set_timeout_with_callback_and_timeout(
        DELAYED_IN_RUNTIME_LOOP_FALSE.as_ref().unchecked_ref(),
        0,
    );
}
