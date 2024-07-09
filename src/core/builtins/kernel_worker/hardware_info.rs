use crate::architecture;
use crate::builtins::utils::{js_api, sync_cell};
use crate::builtins::{hardware, memory, runtime_worker};
use js_sys::Uint16Array;
use serde::Serialize;
use std::cell::SyncUnsafeCell;
use std::collections::VecDeque;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;

#[derive(Serialize, Default)]
struct HardwareInfoMessage {
    hz: f64,
    #[serde(rename = "NANDCalls")]
    nand_calls: u64,
}

#[derive(Serialize)]
struct MemoryInfoMessage {
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "ramMemory")]
    ram_memory: Uint16Array,
    #[serde(with = "serde_wasm_bindgen::preserve", rename = "screenMemory")]
    screen_memory: Uint16Array,
    #[serde(rename = "pressedKey")]
    pressed_key: u16,
    #[serde(rename = "pcRegister")]
    pc_register: u16,
    #[serde(rename = "aRegister")]
    a_register: u16,
    #[serde(rename = "dRegister")]
    d_register: u16,
}

#[derive(Serialize)]
#[serde(tag = "action", rename = "infoMessage")]
struct InfoMessage {
    #[serde(rename = "hardwareInfo")]
    hardware_info: HardwareInfoMessage,
    #[serde(rename = "memoryInfo")]
    memory_info: Option<MemoryInfoMessage>,
}

static EMIT_HARDWARE_INFO_INTERVAL: SyncUnsafeCell<Option<i32>> = SyncUnsafeCell::new(None);
static EMIT_HARDWARE_INFO_CLOSURE: sync_cell::SyncLazyCell<Closure<dyn Fn()>> =
    sync_cell::SyncLazyCell::new(|| Closure::new(emit));

static PREV_SEC_TOTALS: SyncUnsafeCell<VecDeque<f64>> = SyncUnsafeCell::new(VecDeque::new());
static PREV_EMIT_INTERVAL_STEP_TOTAL: SyncUnsafeCell<usize> = SyncUnsafeCell::new(0);
const EMIT_HARDWARE_INFO_INTERVAL_DELAY: usize = 50;
const PREV_SEC_TOTAL_AVG_TIME: usize = 1;

pub fn try_start_emitting() {
    if unsafe { (*EMIT_HARDWARE_INFO_INTERVAL.get()).is_some() } {
        return;
    }
    let emit_hardware_info_interval = js_api::set_interval_with_callback_and_timeout(
        EMIT_HARDWARE_INFO_CLOSURE.as_ref().unchecked_ref(),
        EMIT_HARDWARE_INFO_INTERVAL_DELAY as i32,
    );
    unsafe {
        *EMIT_HARDWARE_INFO_INTERVAL.get() = Some(emit_hardware_info_interval);
    }
}

pub fn try_reset_emitting() {
    if unsafe { (*EMIT_HARDWARE_INFO_INTERVAL.get()).is_some() } {
        reset_emitting();
    }
}

pub fn reset_emitting() {
    unsafe {
        *PREV_EMIT_INTERVAL_STEP_TOTAL.get() = runtime_worker::emit_interval_step_total();
        (*PREV_SEC_TOTALS.get()).clear();
    }
}

pub fn try_stop_emitting() {
    // we dont want to block here to create as little latency as possible
    if let Some(emit_info_interval) = unsafe { (*EMIT_HARDWARE_INFO_INTERVAL.get()).take() } {
        js_api::clear_interval_with_handle(emit_info_interval);
    }
}

pub fn emit_default() {
    js_api::post_worker_message(InfoMessage {
        hardware_info: HardwareInfoMessage::default(),
        memory_info: None,
    });
}

pub fn emit() {
    let emit_interval_step_total = runtime_worker::emit_interval_step_total();
    unsafe {
        if (*PREV_SEC_TOTALS.get()).len()
            == (1000 * PREV_SEC_TOTAL_AVG_TIME) / EMIT_HARDWARE_INFO_INTERVAL_DELAY
        {
            (*PREV_SEC_TOTALS.get()).pop_front();
        }
        (*PREV_SEC_TOTALS.get()).push_back(
            (emit_interval_step_total - *PREV_EMIT_INTERVAL_STEP_TOTAL.get()) as f64
                / EMIT_HARDWARE_INFO_INTERVAL_DELAY as f64
                * 1000.0,
        );
        *PREV_EMIT_INTERVAL_STEP_TOTAL.get() = emit_interval_step_total;
    };
    js_api::post_worker_message(InfoMessage {
        hardware_info: HardwareInfoMessage {
            hz: unsafe {
                (*PREV_SEC_TOTALS.get()).iter().sum::<f64>() / (*PREV_SEC_TOTALS.get()).len() as f64
            },
            nand_calls: hardware::nand_calls(),
        },
        memory_info: Some(MemoryInfoMessage {
            ram_memory: unsafe { Uint16Array::view((*memory::RAM16K_MEMORY.get()).as_slice()) },
            screen_memory: unsafe { Uint16Array::view((*memory::SCREEN_MEMORY.get()).as_slice()) },
            pressed_key: hardware::keyboard(0, false),
            a_register: memory::a_register(0, false),
            d_register: memory::d_register(0, false),
            pc_register: unsafe { *architecture::PC.get() },
        })
    });
}
