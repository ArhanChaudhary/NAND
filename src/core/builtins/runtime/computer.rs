use crate::architecture::ticktock;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = ticktockFor)]
pub fn ticktock_for(count: u16) {
    for _ in 0..count {
        ticktock();
    }
}
