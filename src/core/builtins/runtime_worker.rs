use super::hardware;
use super::utils::{js_api, sync_cell, ALL_STEPS_PER_LOOP};
use crate::architecture;
use serde::Serialize;
use std::{ptr, thread};
use wasm_bindgen::prelude::*;

pub static mut IN_RUNTIME_LOOP: bool = false;
static DELAYED_IN_RUNTIME_LOOP_FALSE: sync_cell::SyncLazyCell<Closure<dyn Fn()>> =
    sync_cell::SyncLazyCell::new(|| {
        Closure::new(|| unsafe {
            IN_RUNTIME_LOOP = false;
        })
    });

pub static mut EMIT_INTERVAL_STEP_TOTAL: usize = 0;

// TODO: I would REALLY like to use atomics or a better form of synchronization
// here but I am hesitant because I don't want to a open a can of worms not worth
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
pub static mut LOADING_NEW_PROGRAM: bool = false;
pub static mut STOP_RUNTIME_LOOP: bool = false;
pub static mut READY_TO_LOAD_NEW_PROGRAM: bool = false;

pub static mut STEPS_PER_LOOP: usize = ALL_STEPS_PER_LOOP[ALL_STEPS_PER_LOOP.len() - 1];

#[derive(Serialize)]
#[serde(tag = "action", rename = "sendPartialStopMessage")]
pub struct SendPartialStopMessage {}

#[wasm_bindgen(js_name = tryStartRuntime)]
pub fn try_start() {
    unsafe {
        if IN_RUNTIME_LOOP {
            return;
        }
        IN_RUNTIME_LOOP = true;
    }
    loop {
        unsafe {
            if LOADING_NEW_PROGRAM {
                READY_TO_LOAD_NEW_PROGRAM = true;
                while ptr::read_volatile(ptr::addr_of!(LOADING_NEW_PROGRAM)) {}
            }
        }
        for _ in 0..unsafe { STEPS_PER_LOOP } {
            architecture::ticktock();
        }
        unsafe {
            EMIT_INTERVAL_STEP_TOTAL += STEPS_PER_LOOP;
        }
        if ALL_STEPS_PER_LOOP[ALL_STEPS_PER_LOOP.len() - 1] != unsafe { STEPS_PER_LOOP } {
            thread::sleep(std::time::Duration::from_micros(
                (110_000
                    - 110_000 * unsafe { STEPS_PER_LOOP }
                        / ALL_STEPS_PER_LOOP[ALL_STEPS_PER_LOOP.len() - 1]) as u64,
            ));
        }
        if hardware::keyboard(0, false) == 32767 {
            // This is still needed even though present in architecture::reset
            // or else pressing start again doesn't work because it wasnt reset.
            // use this instead of hardware::keyboard because CLOCK is false
            unsafe {
                hardware::PRESSED_KEY = 0;
            }
            js_api::post_worker_message(SendPartialStopMessage {});
            break;
        }
        unsafe {
            if STOP_RUNTIME_LOOP {
                STOP_RUNTIME_LOOP = false;
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
