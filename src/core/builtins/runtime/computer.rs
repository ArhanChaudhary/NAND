use super::screen_and_emit::{
    EmitInfoMessage, EMIT_INTERVAL_TOTAL, PREV_EMIT, PREV_SEC_TOTALS
};
use crate::{
    architecture::{self, ticktock},
    builtins::hardware::{keyboard, load_rom},
};
use serde::{Deserialize, Serialize};
use std::cell::LazyCell;
use wasm_bindgen::prelude::*;
use web_sys::DedicatedWorkerGlobalScope;

#[derive(Deserialize)]
struct MessageData {
    action: String,
    #[serde(rename = "machineCode")]
    machine_code: Option<Vec<String>>,
    key: Option<u16>,
    #[serde(rename = "speedPercentage")]
    speed_percentage: Option<u16>,
}

#[wasm_bindgen(js_name = computerHandleMessage)]
pub fn computer_handle_message(message: JsValue) {
    let message_data: MessageData = serde_wasm_bindgen::from_value(message).unwrap();
    match message_data.action.as_str() {
        "loadROM" => {
            load_rom(message_data.machine_code.unwrap());
        }
        "start" => {
            start();
        }
        "reset" => {
            reset();
        }
        "resetAndStart" => {
            reset_and_start(message_data.machine_code.unwrap());
        }
        "keyboard" => {
            keyboard(message_data.key.unwrap(), true);
        }
        "stop" => {
            stop();
        }
        "speed" => {
            speed(message_data.speed_percentage.unwrap());
        }
        _ => (),
    }
}

// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
const FASTEST_STEP: usize = 30_000;
const SLOWEST_STOP: usize = 1;
static mut STEP: usize = FASTEST_STEP;
static mut RUNNER_INTERVAL: Option<i32> = None;

fn runner() {
    // Testing here has shown that a busy loop is actually the exact same speed
    // as setInterval(runner, 0)! This was a bit surprising to me, and I suspect
    // this is due to v8 optimizations. Imagine how cool it would have been if
    // this entire web worker ran on a busy loop and state was shared through
    // SharedArrayBuffer. I can't really complain, though, as that probably
    // would have been hell to implement lol
    for _ in 0..unsafe { STEP } {
        ticktock();
    }
    unsafe {
        EMIT_INTERVAL_TOTAL += STEP;
    }
    if keyboard(0, false) == 32767 {
        keyboard(0, true);
        stop();
    }
}

static mut RUNNER_CLOSURE: LazyCell<Closure<dyn Fn()>> = LazyCell::new(|| Closure::new(runner));
fn start() {
    unsafe {
        if RUNNER_INTERVAL.is_some() {
            return;
        }
        RUNNER_INTERVAL = Some(
            js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .set_interval_with_callback_and_timeout_and_arguments_0(
                    RUNNER_CLOSURE.as_ref().unchecked_ref(),
                    0,
                )
                .unwrap(),
        );
    }
}

fn reset() {
    if unsafe { PREV_EMIT.is_none() } {
        return;
    }
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
        .post_message(&serde_wasm_bindgen::to_value(&EmitInfoMessage::default()).unwrap());
}

fn reset_and_start(machine_code: Vec<String>) {
    if unsafe { PREV_EMIT.is_some() } {
        unsafe {
            EMIT_INTERVAL_TOTAL = 0;
            PREV_SEC_TOTALS.clear();
        }
        architecture::reset();
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .post_message(&serde_wasm_bindgen::to_value(&EmitInfoMessage::default()).unwrap());
    }
    load_rom(machine_code);
    start();
}

#[derive(Serialize)]
struct StopMessage {
    action: &'static str,
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
        .post_message(&serde_wasm_bindgen::to_value(&StopMessage { action: "stopping" }).unwrap());
}

fn speed(speed_percentage: u16) {
    let min_log_value = (SLOWEST_STOP as f64).log10();
    let max_log_value = (FASTEST_STEP as f64).log10();
    let log_scaled_value =
        min_log_value + (speed_percentage as f64 / 100.0) * (max_log_value - min_log_value);
    unsafe {
        STEP = 10.0_f64.powf(log_scaled_value) as usize;
    }
}
