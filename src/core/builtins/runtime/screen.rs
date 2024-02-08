use crate::builtins::hardware::{nand_calls, render, OffscreenCanvasRenderingContext2d, CTX};
use serde::{Deserialize, Serialize};
use std::{cell::LazyCell, collections::VecDeque};
use wasm_bindgen::prelude::*;
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas, WorkerGlobalScope};

#[derive(Serialize)]
struct CanvasContextOptions {
    alpha: bool,
    desynchronized: bool,
}

#[derive(Serialize)]
pub struct EmitInfoMessage {
    action: &'static str,
    hz: f64,
    #[serde(rename = "NANDCalls")]
    nand_calls: u64,
}

impl Default for EmitInfoMessage {
    fn default() -> Self {
        EmitInfoMessage {
            action: "emitInfo",
            hz: 0.0,
            nand_calls: 0,
        }
    }
}

#[derive(Deserialize)]
struct MessageData {
    action: String,
}

#[wasm_bindgen(js_name = screenHandleMessage)]
pub fn screen_handle_message(message: JsValue) {
    let message_data: MessageData = serde_wasm_bindgen::from_value(message).unwrap();
    match message_data.action.as_str() {
        "startRendering" => start_rendering(),
        "stopRendering" => stop_rendering(),
        _ => unreachable!(),
    }
}

static mut STOP_RENDERING_LOOP: bool = false;
static mut CURRENTLY_RENDERING: bool = false;
static mut RENDERER_CLOSURE: LazyCell<Closure<dyn Fn()>> = LazyCell::new(|| Closure::new(renderer));

pub(crate) static mut PREV_EMIT: Option<f64> = None;
pub(crate) static mut PREV_SEC_TOTALS: VecDeque<f64> = VecDeque::new();
pub(crate) static mut EMIT_INTERVAL_TOTAL: usize = 0;
static mut EMIT_INTERVAL: Option<i32> = None;
static mut EMIT_INFO_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(emit_info));
const EMIT_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;

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
    unsafe {
        CURRENTLY_RENDERING = true;
        EMIT_INTERVAL = Some(
            js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .set_interval_with_callback_and_timeout_and_arguments_0(
                    EMIT_INFO_CLOSURE.as_ref().unchecked_ref(),
                    EMIT_INTERVAL_DELAY as i32,
                )
                .unwrap(),
        );
        PREV_EMIT = Some(
            js_sys::global()
                .dyn_into::<WorkerGlobalScope>()
                .unwrap()
                .performance()
                .unwrap()
                .now(),
        );
    }
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .request_animation_frame(unsafe { RENDERER_CLOSURE.as_ref().unchecked_ref() });
}

fn stop_rendering() {
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .clear_interval_with_handle(unsafe { EMIT_INTERVAL.unwrap() });
    unsafe {
        if CURRENTLY_RENDERING {
            STOP_RENDERING_LOOP = true;
            CURRENTLY_RENDERING = false;
        }
        EMIT_INTERVAL = None;
        EMIT_INTERVAL_TOTAL = 0;
    }
    emit_info();
}

fn emit_info() {
    let current_emit = js_sys::global()
        .dyn_into::<WorkerGlobalScope>()
        .unwrap()
        .performance()
        .unwrap()
        .now();
    unsafe {
        let sec_total = EMIT_INTERVAL_TOTAL as f64 / (current_emit - PREV_EMIT.unwrap()) * 1000.0;
        if PREV_SEC_TOTALS.len() == (1000 * PREV_SEC_TOTAL_AVG_TIME) / EMIT_INTERVAL_DELAY {
            PREV_SEC_TOTALS.pop_front();
        }
        PREV_SEC_TOTALS.push_back(sec_total);
        PREV_EMIT = Some(current_emit);
        EMIT_INTERVAL_TOTAL = 0;
    };
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(
            &serde_wasm_bindgen::to_value(&EmitInfoMessage {
                action: "emitInfo",
                hz: unsafe { PREV_SEC_TOTALS.iter().sum::<f64>() / PREV_SEC_TOTALS.len() as f64 },
                nand_calls: nand_calls(),
            })
            .unwrap(),
        );
}
