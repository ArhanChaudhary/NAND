use crate::builtins::{hardware, js_helpers, memory, runtime_worker};
use js_sys::Uint16Array;
use serde::Serialize;
use std::{cell::SyncUnsafeCell, collections::VecDeque};
use wasm_bindgen::{closure::Closure, JsCast};

static EMIT_HARDWARE_INFO_INTERVAL: SyncUnsafeCell<Option<i32>> = SyncUnsafeCell::new(None);
static EMIT_HARDWARE_INFO_CLOSURE: js_helpers::SyncLazyCell<Closure<dyn Fn()>> =
    js_helpers::SyncLazyCell::new(|| Closure::new(emit));

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

static PREV_SEC_TOTALS: SyncUnsafeCell<VecDeque<f64>> = SyncUnsafeCell::new(VecDeque::new());
static PREV_EMIT_HARDWARE_INFO_TIMESTAMP: SyncUnsafeCell<Option<f64>> = SyncUnsafeCell::new(None);
static EMIT_MEMORY_COUNTER: SyncUnsafeCell<usize> = SyncUnsafeCell::new(0);
const EMIT_HARDWARE_INFO_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;

pub fn try_start_emitting() {
    if unsafe { (*EMIT_HARDWARE_INFO_INTERVAL.get()).is_some() } {
        return;
    }
    let emit_hardware_info_interval = js_helpers::set_interval_with_callback_and_timeout(
        EMIT_HARDWARE_INFO_CLOSURE.as_ref().unchecked_ref(),
        EMIT_HARDWARE_INFO_INTERVAL_DELAY as i32,
    );
    let performance_now = js_helpers::performance_now();
    unsafe {
        *EMIT_HARDWARE_INFO_INTERVAL.get() = Some(emit_hardware_info_interval);
        *PREV_EMIT_HARDWARE_INFO_TIMESTAMP.get() = Some(performance_now);
    }
}

pub fn try_reset_emitting() {
    if unsafe { (*EMIT_HARDWARE_INFO_INTERVAL.get()).is_some() } {
        reset_emitting();
    }
}

pub fn reset_emitting() {
    unsafe {
        *runtime_worker::EMIT_INTERVAL_STEP_TOTAL.get() = 0;
        (*PREV_SEC_TOTALS.get()).clear();
    }
}

pub fn try_stop_emitting() {
    if let Some(emit_info_interval) = unsafe { (*EMIT_HARDWARE_INFO_INTERVAL.get()).take() } {
        js_helpers::clear_interval_with_handle(emit_info_interval);
    }
}

pub fn emit_default() {
    js_helpers::post_worker_message(HardwareInfoMessage::default());
}

pub fn emit() {
    let current_emit = js_helpers::performance_now();
    unsafe {
        if (*PREV_SEC_TOTALS.get()).len()
            == (1000 * PREV_SEC_TOTAL_AVG_TIME) / EMIT_HARDWARE_INFO_INTERVAL_DELAY
        {
            (*PREV_SEC_TOTALS.get()).pop_front();
        }
        (*PREV_SEC_TOTALS.get()).push_back(
            *runtime_worker::EMIT_INTERVAL_STEP_TOTAL.get() as f64
                / (current_emit - (*PREV_EMIT_HARDWARE_INFO_TIMESTAMP.get()).unwrap())
                * 1000.0,
        );
        *PREV_EMIT_HARDWARE_INFO_TIMESTAMP.get() = Some(current_emit);
        *runtime_worker::EMIT_INTERVAL_STEP_TOTAL.get() = 0;
    };
    js_helpers::post_worker_message(HardwareInfoMessage {
        hz: unsafe {
            (*PREV_SEC_TOTALS.get()).iter().sum::<f64>() / (*PREV_SEC_TOTALS.get()).len() as f64
        },
        nand_calls: hardware::nand_calls(),
    });
    if unsafe { *EMIT_MEMORY_COUNTER.get() } == 1000 / EMIT_HARDWARE_INFO_INTERVAL_DELAY {
        unsafe {
            *EMIT_MEMORY_COUNTER.get() = 0;
        }
        js_helpers::post_worker_message(MemoryMessage {
            ram_memory: unsafe { Uint16Array::view((*memory::RAM16K_MEMORY.get()).as_slice()) },
            screen_memory: unsafe { Uint16Array::view((*memory::SCREEN_MEMORY.get()).as_slice()) },
            pressed_key: unsafe { *hardware::PRESSED_KEY.get() },
        });
    } else {
        unsafe {
            *EMIT_MEMORY_COUNTER.get() += 1;
        }
    };
}
