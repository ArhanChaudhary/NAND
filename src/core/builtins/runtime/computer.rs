use crate::{
    architecture::{self, ticktock},
    builtins::hardware::{keyboard, load_rom, nand_calls},
};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use wasm_bindgen::prelude::*;
use web_sys::{DedicatedWorkerGlobalScope, WorkerGlobalScope};

#[derive(Deserialize)]
struct MessageData {
    action: String,
    machineCode: Option<Vec<String>>,
    key: Option<u16>,
    speedPercentage: Option<u16>,
}

#[wasm_bindgen]
pub fn computer_handle_message(data: JsValue) {
    let data: MessageData = serde_wasm_bindgen::from_value(data).unwrap();
    match data.action.as_str() {
        "loadROM" => {
            load_rom(data.machineCode.unwrap());
        }
        "start" => {
            start();
        }
        "reset" => {
            reset();
        }
        "resetAndStart" => {
            reset_and_start(data.machineCode.unwrap());
        }
        "keyboard" => {
            keyboard(data.key.unwrap(), true);
        }
        "stop" => {
            stop();
        }
        "speed" => {
            speed(data.speedPercentage.unwrap());
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

const EMIT_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;
static mut PREV_SEC_TOTALS: VecDeque<f64> = VecDeque::new();
static mut PREV_EMIT: Option<f64> = None;
static mut EMIT_INTERVAL: Option<i32> = None;
static mut RUNNER_INTERVAL: Option<i32> = None;
static mut EMIT_INTERVAL_TOTAL: f64 = 0.0;

fn runner() {
    unsafe {
        // Testing here has shown that a busy loop is actually the exact same speed
        // as setInterval(runner, 0)! This was a bit surprising to me, and I suspect
        // this is due to v8 optimizations. Imagine how cool it would have been if
        // this entire web worker ran on a busy loop and state was shared through
        // SharedArrayBuffer. I can't really complain, though, as that probably
        // would have been hell to implement lol
        for _ in 0..STEP {
            ticktock();
        }
        EMIT_INTERVAL_TOTAL += STEP as f64;
        if keyboard(0, false) == 32767 {
            keyboard(0, true);
            stop();
        }
    }
}
fn start() {
    unsafe {
        if EMIT_INTERVAL.is_some() {
            return;
        }
        let emit_info_closure = Closure::<dyn Fn()>::new(emit_info);
        EMIT_INTERVAL = Some(
            js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .set_interval_with_callback_and_timeout_and_arguments_0(
                    emit_info_closure.as_ref().unchecked_ref(),
                    EMIT_INTERVAL_DELAY as i32,
                )
                .unwrap(),
        );
        emit_info_closure.forget();

        let runner_closure = Closure::<dyn Fn()>::new(runner);
        RUNNER_INTERVAL = Some(
            js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .set_interval_with_callback_and_timeout_and_arguments_0(
                    runner_closure.as_ref().unchecked_ref(),
                    0,
                )
                .unwrap(),
        );
        runner_closure.forget();

        // worker startup is slow and the very first emit will be significantly slower
        // than the following ones. So, we want to sort of nudge the first emit closer
        // closer to a higher value. A higher value happens if prevEmit and
        // currentEmit are closer together, so we first create the interval to make
        // the comparsion happen sooner and then we defined prevEmit as late as
        // possible, after runner()
        PREV_EMIT = Some(
            js_sys::global()
                .dyn_into::<WorkerGlobalScope>()
                .unwrap()
                .performance()
                .unwrap()
                .now(),
        );
    }
}

fn reset() {
    unsafe {
        if PREV_EMIT.is_none() {
            return;
        }
        if EMIT_INTERVAL.is_some() {
            js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .clear_interval_with_handle(RUNNER_INTERVAL.unwrap());
            RUNNER_INTERVAL = None;
            js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .clear_interval_with_handle(EMIT_INTERVAL.unwrap());
            EMIT_INTERVAL = None;
            EMIT_INTERVAL_TOTAL = 0.0;
        }
    }
    architecture::reset();
    unsafe {
        PREV_SEC_TOTALS.clear();
    }
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(
            &serde_wasm_bindgen::to_value(&EmitInfoMessage {
                action: "emitInfo",
                hz: 0.0,
                NANDCalls: 0,
            })
            .unwrap(),
        );
}

fn reset_and_start(machine_code: Vec<String>) {
    if unsafe { PREV_EMIT.is_some() } {
        unsafe {
            EMIT_INTERVAL_TOTAL = 0.0;
            PREV_SEC_TOTALS.clear();
        }
        architecture::reset();
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .post_message(
                &serde_wasm_bindgen::to_value(&EmitInfoMessage {
                    action: "emitInfo",
                    hz: 0.0,
                    NANDCalls: 0,
                })
                .unwrap(),
            );
    }
    load_rom(machine_code);
    start();
}

#[derive(Serialize)]
struct StopMessage {
    action: &'static str,
}
fn stop() {
    unsafe {
        if EMIT_INTERVAL.is_none() {
            return;
        }
        js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .clear_interval_with_handle(RUNNER_INTERVAL.unwrap());
        RUNNER_INTERVAL = None;
    }
    emit_info();

    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .clear_interval_with_handle(unsafe { EMIT_INTERVAL.unwrap() });
    unsafe {
        // EMIT_INTERVAL.unwrap()._closure.forget();
        EMIT_INTERVAL = None;
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

#[allow(non_snake_case)]
#[derive(Serialize)]
struct EmitInfoMessage {
    action: &'static str,
    hz: f64,
    NANDCalls: u64,
}

fn emit_info() {
    let current_emit = js_sys::global()
        .dyn_into::<WorkerGlobalScope>()
        .unwrap()
        .performance()
        .unwrap()
        .now();
    unsafe {
        let sec_total = EMIT_INTERVAL_TOTAL / (current_emit - PREV_EMIT.unwrap()) * 1000.0;
        if PREV_SEC_TOTALS.len() == (1000 * PREV_SEC_TOTAL_AVG_TIME) / EMIT_INTERVAL_DELAY {
            PREV_SEC_TOTALS.pop_front();
        }
        PREV_SEC_TOTALS.push_back(sec_total);
        PREV_EMIT = Some(current_emit);
        EMIT_INTERVAL_TOTAL = 0.0;
    };
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(
            &serde_wasm_bindgen::to_value(&EmitInfoMessage {
                action: "emitInfo",
                hz: unsafe { PREV_SEC_TOTALS.iter().sum::<f64>() / PREV_SEC_TOTALS.len() as f64 },
                NANDCalls: nand_calls(),
            })
            .unwrap(),
        );
}
