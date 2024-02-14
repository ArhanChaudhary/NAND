use super::screen_and_emit::{EmitHardwareInfoMessage, EMIT_INTERVAL_STEP_TOTAL, PREV_SEC_TOTALS};
use crate::{
    architecture::{self, ticktock},
    builtins::hardware::{load_rom, PRESSED_KEY},
};
use serde::{Deserialize, Serialize};
use std::{cell::LazyCell, hint::unreachable_unchecked};
use wasm_bindgen::prelude::*;
use web_sys::DedicatedWorkerGlobalScope;

#[derive(Deserialize)]
struct ReceivedWorkerMessage {
    action: String,
    #[serde(rename = "machineCode")]
    machine_code: Option<Vec<String>>,
}

#[derive(Serialize)]
struct StopRuntimeMessage {
    action: &'static str,
}

static mut RUNNER_INTERVAL: Option<i32> = None;
static mut RUNNER_CLOSURE: LazyCell<Closure<dyn Fn()>> = LazyCell::new(|| Closure::new(runner));

#[wasm_bindgen(js_name = computerHandleMessage)]
pub fn handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    match received_worker_message.action.as_str() {
        "computerStart" => {
            start();
        }
        "computerReset" => {
            reset();
        }
        "computerResetAndStart" => {
            reset_and_start(received_worker_message.machine_code.unwrap());
        }
        "computerStop" => {
            stop();
        }
        _ => unsafe { unreachable_unchecked() },
    }
}

// Unfortunately, using a setInterval instead of a setTimeout loop more than
// *halfs* the speed (~3.25mhz) only on Firefox for some reason :-( (Try it,
// profile 099c481 before and after). For another unknown reason, a setTimeout
// loop is disappointing slow (~5.5mhz) on wasm consistently across all
// browsers even compared to the js implementation prior to 099c481 (but hey,
// at least it sped up Firefox!). For now, we'll stick with a setInterval loop
// and just bear with Firefox's poor performance.
fn runner() {
    // Testing here has shown that a busy loop is actually the exact same speed
    // as setInterval(runner, 0)! This was a bit surprising to me, and I suspect
    // this is due to v8 optimizations. Imagine how cool it would have been if
    // this entire web worker ran on a busy loop and state was shared through
    // SharedArrayBuffer. I can't really complain, though, as that probably
    // would have been hell to implement lol
    for _ in 0..unsafe { STEP_PER_FRAME } {
        ticktock();
    }
    unsafe {
        EMIT_INTERVAL_STEP_TOTAL += STEP_PER_FRAME;
    }
    if unsafe { PRESSED_KEY } == 32767 {
        unsafe {
            PRESSED_KEY = 0;
        }
        stop();
    }
}

fn start() {
    if unsafe { RUNNER_INTERVAL.is_some() } {
        return;
    }
    let runner_interval = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .set_interval_with_callback_and_timeout_and_arguments_0(
            unsafe { RUNNER_CLOSURE.as_ref().unchecked_ref() },
            0,
        )
        .unwrap();
    unsafe {
        RUNNER_INTERVAL = Some(runner_interval);
    }
}

fn reset() {
    if unsafe { RUNNER_INTERVAL.is_some() } {
        js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .clear_interval_with_handle(unsafe { RUNNER_INTERVAL.unwrap() });
        unsafe {
            RUNNER_INTERVAL = None;
        }
    }
    architecture::reset();
    unsafe {
        PREV_SEC_TOTALS.clear();
    }
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(&serde_wasm_bindgen::to_value(&EmitHardwareInfoMessage::default()).unwrap());
}

fn reset_and_start(machine_code: Vec<String>) {
    unsafe {
        EMIT_INTERVAL_STEP_TOTAL = 0;
        PREV_SEC_TOTALS.clear();
    }
    architecture::reset();
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(&serde_wasm_bindgen::to_value(&EmitHardwareInfoMessage::default()).unwrap());
    load_rom(machine_code);
    start();
}

fn stop() {
    if unsafe { RUNNER_INTERVAL.is_none() } {
        return;
    }
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .clear_interval_with_handle(unsafe { RUNNER_INTERVAL.unwrap() });
    unsafe {
        RUNNER_INTERVAL = None;
    }

    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(
            &serde_wasm_bindgen::to_value(&StopRuntimeMessage { action: "stopping" }).unwrap(),
        );
}
