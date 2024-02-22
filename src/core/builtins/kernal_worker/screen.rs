use crate::builtins::{hardware, js_helpers};
use std::cell::SyncUnsafeCell;
use wasm_bindgen::prelude::*;
use web_sys::OffscreenCanvas;

static IN_SCREEN_RENDERING_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
static STOP_SCREEN_RENDERING_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
static SCREEN_RENDERER_CLOSURE: js_helpers::SyncLazyCell<Closure<dyn Fn()>> =
    js_helpers::SyncLazyCell::new(|| Closure::new(renderer));

#[wasm_bindgen(js_name = screenInit)]
pub fn init(offscreen_canvas: OffscreenCanvas) {
    let ctx = js_helpers::get_context_with_context_options(
        offscreen_canvas,
        "2d",
        js_helpers::CanvasContextOptions {
            alpha: false,
            desynchronized: true,
        },
    );
    unsafe {
        *hardware::CTX.get() = Some(ctx);
    }
}

fn renderer() {
    if unsafe { *STOP_SCREEN_RENDERING_LOOP.get() } {
        unsafe {
            *STOP_SCREEN_RENDERING_LOOP.get() = false;
            *IN_SCREEN_RENDERING_LOOP.get() = false;
        }
    } else {
        js_helpers::request_animation_frame(SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref());
    }
    hardware::render();
}

pub fn try_start_rendering() {
    if unsafe { !*IN_SCREEN_RENDERING_LOOP.get() } {
        unsafe {
            *IN_SCREEN_RENDERING_LOOP.get() = true;
        }
        js_helpers::request_animation_frame(SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref());
    }
}

pub fn try_stop_rendering() {
    unsafe {
        if *IN_SCREEN_RENDERING_LOOP.get() {
            *STOP_SCREEN_RENDERING_LOOP.get() = true;
        }
    }
}
