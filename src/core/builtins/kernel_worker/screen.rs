use super::ScreenInitMessage;
use crate::builtins::hardware;
use crate::builtins::utils::{js_api, sync_cell};
use wasm_bindgen::prelude::*;

static mut IN_SCREEN_RENDERING_LOOP: bool = false;
static mut STOP_SCREEN_RENDERING_LOOP: bool = false;
static SCREEN_RENDERER_CLOSURE: sync_cell::SyncLazyCell<Closure<dyn Fn()>> =
    sync_cell::SyncLazyCell::new(|| Closure::new(renderer));

pub fn init(screen_init_message: ScreenInitMessage) {
    hardware::CTX.get_or_init(|| {
        screen_init_message
            .offscreen_canvas
            .get_context_with_context_options(
                "2d",
                js_api::CanvasContextOptions {
                    desynchronized: false,
                },
            )
    });
}

fn renderer() {
    if unsafe { STOP_SCREEN_RENDERING_LOOP } {
        unsafe {
            STOP_SCREEN_RENDERING_LOOP = false;
            IN_SCREEN_RENDERING_LOOP = false;
        }
    } else {
        js_api::request_animation_frame(SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref());
    }
    hardware::render();
}

pub fn try_start_rendering() {
    if unsafe { !IN_SCREEN_RENDERING_LOOP } {
        unsafe {
            IN_SCREEN_RENDERING_LOOP = true;
        }
        js_api::request_animation_frame(SCREEN_RENDERER_CLOSURE.as_ref().unchecked_ref());
    }
}

pub fn try_stop_rendering() {
    unsafe {
        if IN_SCREEN_RENDERING_LOOP {
            STOP_SCREEN_RENDERING_LOOP = true;
        }
    }
}
