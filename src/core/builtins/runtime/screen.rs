use crate::builtins::hardware::{render, OffscreenCanvasRenderingContext2d, CTX};
use std::{cell::RefCell, rc::Rc};
use wasm_bindgen::prelude::*;
use web_sys::DedicatedWorkerGlobalScope;

#[wasm_bindgen]
pub fn init(ctx: OffscreenCanvasRenderingContext2d) {
    unsafe { CTX = Some(ctx) };
}

#[wasm_bindgen]
pub fn handle_message(msg: String) {
    match msg.as_str() {
        "startRendering" => start_rendering(),
        "stopRendering" => stop_rendering(),
        _ => unreachable!(),
    }
}

fn request_animation_frame(f: &Closure<dyn FnMut()>) {
    let _ = js_sys::global()
        .unchecked_into::<DedicatedWorkerGlobalScope>()
        .request_animation_frame(f.as_ref().unchecked_ref());
}

static mut STOP_RENDERING_LOOP: bool = false;
static mut CURRENTLY_RENDERING: bool = false;
fn start_rendering() {
    if unsafe { CURRENTLY_RENDERING } {
        return;
    }
    unsafe {
        CURRENTLY_RENDERING = true;
    }
    // https://rustwasm.github.io/wasm-bindgen/examples/request-animation-frame.html
    let f = Rc::new(RefCell::new(None));
    let g = f.clone();

    *g.borrow_mut() = Some(Closure::new(move || {
        // We need this sort of locking mechanism because of the case of resetAndStart
        // *sometimes* we want to start rendering, and sometimes we don't want to do
        // anything because it's already rendering. So, instead of moving the logic
        // to prevent double rendering to the app logic, we can just do it here to
        // make it such that it still works even if multiple startRendering messages
        // are sent
        if unsafe { STOP_RENDERING_LOOP } {
            unsafe {
                STOP_RENDERING_LOOP = false;
            }
        } else {
            request_animation_frame(f.borrow().as_ref().unwrap());
        }
        render();
    }));
    request_animation_frame(g.borrow().as_ref().unwrap());
}

fn stop_rendering() {
    unsafe {
        if CURRENTLY_RENDERING {
            STOP_RENDERING_LOOP = true;
            CURRENTLY_RENDERING = false;
        }
    }
}
