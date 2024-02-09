use crate::builtins::{
    hardware::{nand_calls, render, OffscreenCanvasRenderingContext2d, CTX, PRESSED_KEY},
    memory::{RAM16K_MEMORY, SCREEN_MEMORY},
};
use js_sys::Uint16Array;
use serde::{Deserialize, Serialize};
use std::{cell::LazyCell, collections::VecDeque};
use wasm_bindgen::prelude::*;
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas, WorkerGlobalScope};

#[derive(Deserialize)]
struct ReceivedWorkerMessage {
    action: String,
}

#[derive(Serialize)]
pub struct EmitHardwareInfoMessage {
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
    pressed_key: u16,
}

#[derive(Serialize)]
struct CanvasContextOptions {
    alpha: bool,
    desynchronized: bool,
}

static mut STOP_RENDERING_LOOP: bool = false;
static mut CURRENTLY_RENDERING: bool = false;
static mut RENDERER_CLOSURE: LazyCell<Closure<dyn Fn()>> = LazyCell::new(|| Closure::new(renderer));

pub static mut PREV_SEC_TOTALS: VecDeque<f64> = VecDeque::new();
pub static mut EMIT_INTERVAL_STEP_TOTAL: usize = 0;
static mut PREV_EMIT: Option<f64> = None;
static mut EMIT_INTERVAL: Option<i32> = None;
static mut EMIT_INFO_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(emit_info));
const EMIT_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;

#[wasm_bindgen(js_name = screenHandleMessage)]
pub fn screen_handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    match received_worker_message.action.as_str() {
        "startRendering" => start_rendering(),
        "stopRendering" => stop_rendering(),
        _ => unreachable!(),
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

fn renderer() {
    if unsafe { STOP_RENDERING_LOOP } {
        unsafe {
            STOP_RENDERING_LOOP = false;
        }
    } else {
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .request_animation_frame(unsafe { RENDERER_CLOSURE.as_ref().unchecked_ref() });
    }
    render();
}

fn start_rendering() {
    // We need this sort of locking mechanism because of the case of resetAndStart
    // *sometimes* we want to start rendering, and sometimes we don't want to do
    // anything because it's already rendering. So, instead of moving the logic
    // to prevent double rendering to the app logic, we can just do it here to
    // make it such that it still works even if multiple startRendering messages
    // are sent
    if unsafe { CURRENTLY_RENDERING } {
        return;
    }
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
        CURRENTLY_RENDERING = true;
        EMIT_INTERVAL = Some(emit_interval);
        PREV_EMIT = Some(prev_emit);
    }
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .request_animation_frame(unsafe { RENDERER_CLOSURE.as_ref().unchecked_ref() });
}

fn stop_rendering() {
    if unsafe { !CURRENTLY_RENDERING } {
        return;
    }
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .clear_interval_with_handle(unsafe { EMIT_INTERVAL.unwrap() });
    unsafe {
        STOP_RENDERING_LOOP = true;
        CURRENTLY_RENDERING = false;
        EMIT_INTERVAL = None;
        EMIT_INTERVAL_STEP_TOTAL = 0;
    }
    emit_info();
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
            EMIT_INTERVAL_STEP_TOTAL as f64 / (current_emit - PREV_EMIT.unwrap()) * 1000.0,
        );
        PREV_EMIT = Some(current_emit);
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
