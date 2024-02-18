use crate::builtins::{
    hardware,
    worker_helpers::{self, CanvasContextOptions},
};
use std::cell::LazyCell;
use wasm_bindgen::{closure::Closure, prelude::*};
use web_sys::OffscreenCanvas;

static mut IN_SCREEN_RENDERING_LOOP: bool = false;
static mut STOP_SCREEN_RENDERING_LOOP: bool = false;
static mut SCREEN_RENDERER_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(renderer));

#[wasm_bindgen(js_name = kernalScreenInit)]
pub fn init(offscreen_canvas: OffscreenCanvas) {
    let ctx = worker_helpers::get_context_with_context_options(
        offscreen_canvas,
        "2d",
        CanvasContextOptions {
            alpha: false,
            desynchronized: true,
        },
    );
    unsafe { hardware::CTX = Some(ctx) };
}

fn renderer() {
    if unsafe { STOP_SCREEN_RENDERING_LOOP } {
        unsafe {
            STOP_SCREEN_RENDERING_LOOP = false;
            IN_SCREEN_RENDERING_LOOP = false;
        }
    } else {
        worker_helpers::request_animation_frame(unsafe {
            SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref()
        });
    }
    hardware::render();
}

pub fn start_rendering() {
    if unsafe { !IN_SCREEN_RENDERING_LOOP } {
        unsafe {
            IN_SCREEN_RENDERING_LOOP = true;
        }
        worker_helpers::request_animation_frame(unsafe {
            SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref()
        });
    }
}

pub fn stop_rendering() {
    unsafe {
        if IN_SCREEN_RENDERING_LOOP {
            STOP_SCREEN_RENDERING_LOOP = true;
        }
    }
}
