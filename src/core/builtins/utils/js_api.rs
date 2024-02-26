use crate::builtins::hardware::OffscreenCanvasRenderingContext2d;
use js_sys::Function;
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsCast;
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas};

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

#[derive(Deserialize)]
pub struct DeserializeableOffscreenCanvas(
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "offscreenCanvas")] OffscreenCanvas,
);

impl DeserializeableOffscreenCanvas {
    pub fn get_context_with_context_options(
        self,
        context_type: &str,
        context_options: CanvasContextOptions,
    ) -> OffscreenCanvasRenderingContext2d {
        self.0
            .get_context_with_context_options(
                context_type,
                &serde_wasm_bindgen::to_value(&context_options).unwrap(),
            )
            .unwrap()
            .unwrap()
            .unchecked_into()
    }
}

#[derive(Serialize)]
pub struct CanvasContextOptions {
    pub alpha: bool,
    pub desynchronized: bool,
}
