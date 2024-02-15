use super::computer::{
    StopRuntimeMessage, IN_RUNTIME_LOOP, READY_TO_LOAD_NEW_PROGRAM, STOP_RUNTIME_LOOP,
};
use crate::{
    architecture,
    builtins::{
        hardware::{
            load_rom, nand_calls, render, OffscreenCanvasRenderingContext2d, CTX, PRESSED_KEY,
        },
        memory::{RAM16K_MEMORY, SCREEN_MEMORY},
    },
};
use js_sys::Uint16Array;
use serde::{Deserialize, Serialize};
use std::{cell::LazyCell, collections::VecDeque, hint::unreachable_unchecked};
use wasm_bindgen::prelude::*;
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas, WorkerGlobalScope};

#[derive(Deserialize)]
struct ReceivedWorkerMessage {
    action: String,
    #[serde(rename = "speedPercentage")]
    speed_percentage: Option<u16>,
    key: Option<u16>,
    #[serde(rename = "machineCode")]
    machine_code: Option<Vec<String>>,
}

#[derive(Serialize)]
struct EmitHardwareInfoMessage {
    action: &'static str,
    hz: f64,
    #[serde(rename = "NANDCalls")]
    nand_calls: u64,
}

impl Default for EmitHardwareInfoMessage {
    fn default() -> Self {
        Self {
            action: "emitInfo",
            hz: 0.0,
            nand_calls: 0,
        }
    }
}

#[derive(Serialize)]
struct EmitMemoryMessage {
    action: &'static str,
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "ramMemory")]
    ram_memory: Uint16Array,
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "screenMemory")]
    screen_memory: Uint16Array,
    #[serde(rename = "pressedKey")]
    pressed_key: u16,
}

#[derive(Serialize)]
struct CanvasContextOptions {
    alpha: bool,
    desynchronized: bool,
}

static mut IN_SCREEN_RENDERING_LOOP: bool = false;
static mut STOP_SCREEN_RENDERING_LOOP: bool = false;
static mut SCREEN_RENDERER_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(screen_renderer));

static mut PREV_SEC_TOTALS: VecDeque<f64> = VecDeque::new();
pub static mut EMIT_INTERVAL_STEP_TOTAL: usize = 0;
static mut PREV_EMIT_INFO_TIMESTAMP: Option<f64> = None;
static mut EMIT_INFO_INTERVAL: Option<i32> = None;
static mut EMIT_INFO_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(emit_info));
const EMIT_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;

#[wasm_bindgen(js_name = screenAndEmitHandleMessage)]
pub fn handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    match received_worker_message.action.as_str() {
        "startRenderingScreen" => {
            start_rendering_screen();
            start_emitting_info();
        }
        "stopRenderingScreen" => {
            stop_rendering_screen();
            stop_emitting_info();
            emit_info();
        }
        "computerResetAndStart" => {
            computer_reset_and_start(received_worker_message.machine_code.unwrap());
            start_rendering_screen();
            reset_and_start_emitting_info();
            start_emitting_info();
        }
        "computerReset" => {
            computer_reset();
            stop_rendering_screen();
            stop_emitting_info();
            emit_info();
        }
        "computerStop" => {
            computer_stop();
            stop_rendering_screen();
            stop_emitting_info();
            if unsafe { IN_RUNTIME_LOOP } {
                emit_info();
            }
            let _ = js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .post_message(
                    &serde_wasm_bindgen::to_value(&StopRuntimeMessage { action: "stopping" })
                        .unwrap(),
                );
        }
        "computerKeyboard" => unsafe {
            PRESSED_KEY = received_worker_message.key.unwrap();
        },
        "computerSpeed" => {
            computer_speed(received_worker_message.speed_percentage.unwrap());
        }
        _ => unsafe {
            unreachable_unchecked();
        },
    }
}

#[wasm_bindgen(js_name = screenInit)]
pub fn screen_init(offscreen_canvas: OffscreenCanvas) {
    let ctx = offscreen_canvas
        .get_context_with_context_options(
            "2d",
            &serde_wasm_bindgen::to_value(&CanvasContextOptions {
                alpha: false,
                desynchronized: true,
            })
            .unwrap(),
        )
        .unwrap()
        .unwrap()
        .unchecked_into::<OffscreenCanvasRenderingContext2d>();
    unsafe { CTX = Some(ctx) };
}

fn screen_renderer() {
    if unsafe { STOP_SCREEN_RENDERING_LOOP } {
        unsafe {
            STOP_SCREEN_RENDERING_LOOP = false;
            IN_SCREEN_RENDERING_LOOP = false;
        }
    } else {
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .request_animation_frame(unsafe { SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref() });
    }
    render();
}

fn start_rendering_screen() {
    if unsafe { !IN_SCREEN_RENDERING_LOOP } {
        unsafe {
            IN_SCREEN_RENDERING_LOOP = true;
        }
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .request_animation_frame(unsafe { SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref() });
    }
}

fn stop_rendering_screen() {
    unsafe {
        if IN_SCREEN_RENDERING_LOOP {
            STOP_SCREEN_RENDERING_LOOP = true;
        }
    }
}

fn start_emitting_info() {
    let emit_interval = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .set_interval_with_callback_and_timeout_and_arguments_0(
            unsafe { EMIT_INFO_CLOSURE.as_ref().unchecked_ref() },
            EMIT_INTERVAL_DELAY as i32,
        )
        .unwrap();
    let prev_emit = js_sys::global()
        .dyn_into::<WorkerGlobalScope>()
        .unwrap()
        .performance()
        .unwrap()
        .now();
    unsafe {
        EMIT_INFO_INTERVAL = Some(emit_interval);
        PREV_EMIT_INFO_TIMESTAMP = Some(prev_emit);
    }
}

fn reset_and_start_emitting_info() {
    unsafe {
        EMIT_INTERVAL_STEP_TOTAL = 0;
        PREV_SEC_TOTALS.clear();
    }
}

fn stop_emitting_info() {
    let Some(emit_info_interval) = (unsafe { EMIT_INFO_INTERVAL }) else {
        return;
    };
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .clear_interval_with_handle(emit_info_interval);
    unsafe {
        EMIT_INFO_INTERVAL = None;
        EMIT_INTERVAL_STEP_TOTAL = 0;
    }
}

static mut SEC_COUNT: usize = 0;
fn emit_info() {
    let current_emit = js_sys::global()
        .dyn_into::<WorkerGlobalScope>()
        .unwrap()
        .performance()
        .unwrap()
        .now();
    unsafe {
        if PREV_SEC_TOTALS.len() == (1000 * PREV_SEC_TOTAL_AVG_TIME) / EMIT_INTERVAL_DELAY {
            PREV_SEC_TOTALS.pop_front();
        }
        PREV_SEC_TOTALS.push_back(
            EMIT_INTERVAL_STEP_TOTAL as f64 / (current_emit - PREV_EMIT_INFO_TIMESTAMP.unwrap())
                * 1000.0,
        );
        PREV_EMIT_INFO_TIMESTAMP = Some(current_emit);
        EMIT_INTERVAL_STEP_TOTAL = 0;
    };
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(
            &serde_wasm_bindgen::to_value(&EmitHardwareInfoMessage {
                action: "emitInfo",
                hz: unsafe { PREV_SEC_TOTALS.iter().sum::<f64>() / PREV_SEC_TOTALS.len() as f64 },
                nand_calls: nand_calls(),
            })
            .unwrap(),
        );
    if unsafe { SEC_COUNT } == 1000 / EMIT_INTERVAL_DELAY {
        unsafe {
            SEC_COUNT = 0;
        }
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .post_message(
                &serde_wasm_bindgen::to_value(&EmitMemoryMessage {
                    action: "emitMemory",
                    ram_memory: unsafe { Uint16Array::view(RAM16K_MEMORY.as_slice()) },
                    screen_memory: unsafe { Uint16Array::view(SCREEN_MEMORY.as_slice()) },
                    pressed_key: unsafe { PRESSED_KEY },
                })
                .unwrap(),
            );
    } else {
        unsafe {
            SEC_COUNT += 1;
        }
    };
}

fn computer_reset() {
    if unsafe { IN_RUNTIME_LOOP } {
        unsafe {
            STOP_RUNTIME_LOOP = true;
        }
        // TODO: figure out why this needs black_box
        while std::hint::black_box(unsafe { IN_RUNTIME_LOOP }) {}
    }
    unsafe {
        PREV_SEC_TOTALS.clear();
    }
    architecture::reset();
}

pub static mut LOAD_NEW_PROGRAM: bool = false;
fn computer_reset_and_start(machine_code: Vec<String>) {
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
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(&serde_wasm_bindgen::to_value(&EmitHardwareInfoMessage::default()).unwrap());
}

fn computer_stop() {
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

fn computer_speed(speed_percentage: u16) {
    let min_log_value = (MIN_STEPS_PER_LOOP as f64).log10();
    let max_log_value = (MAX_STEPS_PER_LOOP as f64).log10();
    let log_scaled_value =
        min_log_value + (speed_percentage as f64 / 100.0) * (max_log_value - min_log_value);
    unsafe {
        STEPS_PER_LOOP = 10.0_f64.powf(log_scaled_value) as usize;
    }
}
