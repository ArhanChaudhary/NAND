use crate::builtins::hardware::{OffscreenCanvasRenderingContext2d, CTX};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn screen_init(ctx: OffscreenCanvasRenderingContext2d) {
    unsafe { CTX = Some(ctx) };
}
