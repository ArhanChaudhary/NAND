use super::ScreenInitMessage;
use crate::builtins::hardware;
use crate::builtins::utils::{js_api, sync_cell};
use std::cell::SyncUnsafeCell;
use wasm_bindgen::prelude::*;

static IN_SCREEN_RENDERING_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
static STOP_SCREEN_RENDERING_LOOP: SyncUnsafeCell<bool> = SyncUnsafeCell::new(false);
static SCREEN_RENDERER_CLOSURE: sync_cell::SyncLazyCell<Closure<dyn Fn()>> =
    sync_cell::SyncLazyCell::new(|| Closure::new(renderer));

pub fn init(screen_init_message: ScreenInitMessage) {
    let ctx = js_api::get_context_with_context_options(
        screen_init_message.offscreen_canvas.0,
        "2d",
        js_api::CanvasContextOptions {
            alpha: false,
            desynchronized: true,
        },
    );
    hardware::CTX.get_or_init(|| ctx);
}

fn renderer() {
    if unsafe { *STOP_SCREEN_RENDERING_LOOP.get() } {
        unsafe {
            *STOP_SCREEN_RENDERING_LOOP.get() = false;
            *IN_SCREEN_RENDERING_LOOP.get() = false;
        }
    } else {
        js_api::request_animation_frame(SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref());
    }
    hardware::render();
}

pub fn try_start_rendering() {
    if unsafe { !*IN_SCREEN_RENDERING_LOOP.get() } {
        unsafe {
            *IN_SCREEN_RENDERING_LOOP.get() = true;
        }
        js_api::request_animation_frame(SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref());
    }
}

pub fn try_stop_rendering() {
    unsafe {
        if *IN_SCREEN_RENDERING_LOOP.get() {
            *STOP_SCREEN_RENDERING_LOOP.get() = true;
        }
    }
}
