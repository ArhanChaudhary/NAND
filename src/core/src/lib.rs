use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn nand(a: bool, b: bool) -> bool {
    !(a && b)
}
