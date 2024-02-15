use crate::builtins::hardware::{self, OffscreenCanvasRenderingContext2d};
use serde::Serialize;
use std::cell::LazyCell;
use wasm_bindgen::{closure::Closure, prelude::*};
use web_sys::{DedicatedWorkerGlobalScope, OffscreenCanvas};

static mut IN_SCREEN_RENDERING_LOOP: bool = false;
static mut STOP_SCREEN_RENDERING_LOOP: bool = false;
static mut SCREEN_RENDERER_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(renderer));

#[derive(Serialize)]
struct CanvasContextOptions {
    alpha: bool,
    desynchronized: bool,
}

#[wasm_bindgen(js_name = kernalScreenInit)]
pub fn init(offscreen_canvas: OffscreenCanvas) {
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
    unsafe { hardware::CTX = Some(ctx) };
}

fn renderer() {
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
    hardware::render();
}

pub fn start_rendering() {
    if unsafe { !IN_SCREEN_RENDERING_LOOP } {
        unsafe {
            IN_SCREEN_RENDERING_LOOP = true;
        }
        let _ = js_sys::global()
            .unchecked_into::<DedicatedWorkerGlobalScope>()
            .request_animation_frame(unsafe { SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref() });
    }
}

pub fn stop_rendering() {
    unsafe {
        if IN_SCREEN_RENDERING_LOOP {
            STOP_SCREEN_RENDERING_LOOP = true;
        }
    }
}
