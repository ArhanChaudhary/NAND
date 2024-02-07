use crate::builtins::hardware::{self, OffscreenCanvasRenderingContext2d, CTX};
use serde::{Deserialize, Serialize};
use std::cell::LazyCell;
use wasm_bindgen::prelude::*;
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas};

#[derive(Serialize)]
struct CanvasContextOptions {
    alpha: bool,
    desynchronized: bool,
}

#[wasm_bindgen]
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

#[derive(Deserialize)]
struct MessageData {
    action: String,
}

#[wasm_bindgen]
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
    hardware::render();
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
    }
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .request_animation_frame(unsafe { RENDERER_CLOSURE.as_ref().unchecked_ref() });
}

fn stop_rendering() {
    unsafe {
        if CURRENTLY_RENDERING {
            STOP_RENDERING_LOOP = true;
            CURRENTLY_RENDERING = false;
        }
    }
}
