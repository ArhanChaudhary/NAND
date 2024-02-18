use super::hardware::OffscreenCanvasRenderingContext2d;
use js_sys::Function;
use serde::Serialize;
use wasm_bindgen::JsCast;
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas, WorkerGlobalScope};

pub fn post_worker_message(rust: impl Serialize) {
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .post_message(&serde_wasm_bindgen::to_value(&rust).unwrap());
}

pub fn set_interval_with_callback_and_timeout(callback: &Function, timeout: i32) -> i32 {
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .set_interval_with_callback_and_timeout_and_arguments_0(callback, timeout)
        .unwrap()
}

pub fn set_timeout_with_callback_and_timeout(callback: &Function, timeout: i32) -> i32 {
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .set_timeout_with_callback_and_timeout_and_arguments_0(callback, timeout)
        .unwrap()
}

pub fn clear_interval_with_handle(handle: i32) {
    js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .clear_interval_with_handle(handle);
}

pub fn request_animation_frame(callback: &Function) {
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .request_animation_frame(callback);
}

pub fn performance_now() -> f64 {
    js_sys::global()
        .unchecked_into::<WorkerGlobalScope>()
        .performance()
        .unwrap()
        .now()
}

#[derive(Serialize)]
pub struct CanvasContextOptions {
    pub alpha: bool,
    pub desynchronized: bool,
}

pub fn get_context_with_context_options(
    offscreen_canvas: OffscreenCanvas,
    context_id: &str,
    context_options: CanvasContextOptions,
) -> OffscreenCanvasRenderingContext2d {
    offscreen_canvas
        .get_context_with_context_options(
            context_id,
            &serde_wasm_bindgen::to_value(&context_options).unwrap(),
        )
        .unwrap()
        .unwrap()
        .unchecked_into()
}
