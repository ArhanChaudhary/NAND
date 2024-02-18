use crate::builtins::{hardware, memory, runtime_worker, worker_helpers};
use js_sys::Uint16Array;
use serde::Serialize;
use std::{cell::LazyCell, collections::VecDeque};
use wasm_bindgen::{closure::Closure, JsCast};

static mut EMIT_HARDWARE_INFO_INTERVAL: Option<i32> = None;
pub static mut EMIT_HARDWARE_INFO_CLOSURE: LazyCell<Closure<dyn Fn()>> =
    LazyCell::new(|| Closure::new(emit));

#[derive(Serialize, Default)]
#[serde(tag = "action", rename = "hardwareInfo")]
struct HardwareInfoMessage {
    hz: f64,
    #[serde(rename = "NANDCalls")]
    nand_calls: u64,
}

#[derive(Serialize)]
#[serde(tag = "action", rename = "memory")]
struct MemoryMessage {
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "ramMemory")]
    ram_memory: Uint16Array,
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "screenMemory")]
    screen_memory: Uint16Array,
    #[serde(rename = "pressedKey")]
    pressed_key: u16,
}

static mut PREV_SEC_TOTALS: VecDeque<f64> = VecDeque::new();
static mut PREV_EMIT_HARDWARE_INFO_TIMESTAMP: Option<f64> = None;
static mut EMIT_MEMORY_COUNTER: usize = 0;
const EMIT_HARDWARE_INFO_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;

pub fn try_start_emitting() {
    if unsafe { EMIT_HARDWARE_INFO_INTERVAL.is_some() } {
        return;
    }
    let emit_hardware_info_interval = worker_helpers::set_interval_with_callback_and_timeout(
        unsafe { EMIT_HARDWARE_INFO_CLOSURE.as_ref().unchecked_ref() },
        EMIT_HARDWARE_INFO_INTERVAL_DELAY as i32,
    );
    let performance_now = worker_helpers::performance_now();
    unsafe {
        EMIT_HARDWARE_INFO_INTERVAL = Some(emit_hardware_info_interval);
        PREV_EMIT_HARDWARE_INFO_TIMESTAMP = Some(performance_now);
    }
}

pub fn try_reset_emitting() {
    if unsafe { EMIT_HARDWARE_INFO_INTERVAL.is_some() } {
        reset_emitting();
    }
}

pub fn reset_emitting() {
    unsafe {
        runtime_worker::EMIT_INTERVAL_STEP_TOTAL = 0;
        PREV_SEC_TOTALS.clear();
    }
}

pub fn try_stop_emitting() {
    if let Some(emit_info_interval) = unsafe { EMIT_HARDWARE_INFO_INTERVAL.take() } {
        worker_helpers::clear_interval_with_handle(emit_info_interval);
    };
}

pub fn emit_default() {
    worker_helpers::post_worker_message(HardwareInfoMessage::default());
}

pub fn emit() {
    let current_emit = worker_helpers::performance_now();
    unsafe {
        if PREV_SEC_TOTALS.len()
            == (1000 * PREV_SEC_TOTAL_AVG_TIME) / EMIT_HARDWARE_INFO_INTERVAL_DELAY
        {
            PREV_SEC_TOTALS.pop_front();
        }
        PREV_SEC_TOTALS.push_back(
            runtime_worker::EMIT_INTERVAL_STEP_TOTAL as f64
                / (current_emit - PREV_EMIT_HARDWARE_INFO_TIMESTAMP.unwrap())
                * 1000.0,
        );
        PREV_EMIT_HARDWARE_INFO_TIMESTAMP = Some(current_emit);
        runtime_worker::EMIT_INTERVAL_STEP_TOTAL = 0;
    };
    worker_helpers::post_worker_message(HardwareInfoMessage {
        hz: unsafe { PREV_SEC_TOTALS.iter().sum::<f64>() / PREV_SEC_TOTALS.len() as f64 },
        nand_calls: hardware::nand_calls(),
    });
    if unsafe { EMIT_MEMORY_COUNTER } == 1000 / EMIT_HARDWARE_INFO_INTERVAL_DELAY {
        unsafe {
            EMIT_MEMORY_COUNTER = 0;
        }
        worker_helpers::post_worker_message(MemoryMessage {
            ram_memory: unsafe { Uint16Array::view(memory::RAM16K_MEMORY.as_slice()) },
            screen_memory: unsafe { Uint16Array::view(memory::SCREEN_MEMORY.as_slice()) },
            pressed_key: unsafe { hardware::PRESSED_KEY },
        });
    } else {
        unsafe {
            EMIT_MEMORY_COUNTER += 1;
        }
    };
}
