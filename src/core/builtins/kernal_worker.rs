use super::runtime_worker::{StopRuntimeMessage, IN_RUNTIME_LOOP};
use crate::builtins::hardware::PRESSED_KEY;
use serde::Deserialize;
use std::hint::unreachable_unchecked;
use wasm_bindgen::prelude::*;
use web_sys::DedicatedWorkerGlobalScope;

pub mod runtime;
mod hardware_info;
mod screen;

#[derive(Deserialize)]
struct ReceivedWorkerMessage {
    action: String,
    #[serde(rename = "speedPercentage")]
    speed_percentage: Option<u16>,
    key: Option<u16>,
    #[serde(rename = "machineCode")]
    machine_code: Option<Vec<String>>,
}

#[wasm_bindgen(js_name = screenAndEmitHandleMessage)]
pub fn handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    match received_worker_message.action.as_str() {
        "startRenderingScreen" => {
            screen::start_rendering_screen();
            hardware_info::start_emitting_info();
        }
        "stopRenderingScreen" => {
            screen::stop_rendering_screen();
            hardware_info::stop_emitting_info();
            hardware_info::emit_info();
        }
        "computerResetAndStart" => {
            runtime::computer_reset_and_start(received_worker_message.machine_code.unwrap());
            screen::start_rendering_screen();
            hardware_info::reset_and_start_emitting_info();
            hardware_info::start_emitting_info();
        }
        "computerReset" => {
            runtime::computer_reset();
            screen::stop_rendering_screen();
            hardware_info::reset_and_start_emitting_info();
            hardware_info::stop_emitting_info();
            hardware_info::emit_info();
        }
        "computerStop" => {
            runtime::computer_stop();
            screen::stop_rendering_screen();
            hardware_info::stop_emitting_info();
            if unsafe { IN_RUNTIME_LOOP } {
                hardware_info::emit_info();
            }
            let _ = js_sys::global()
                .unchecked_into::<DedicatedWorkerGlobalScope>()
                .post_message(
                    &serde_wasm_bindgen::to_value(&StopRuntimeMessage { action: "stopping" })
                        .unwrap(),
                );
        }
        "computerKeyboard" => unsafe {
            PRESSED_KEY = received_worker_message.key.unwrap();
        },
        "computerSpeed" => {
            runtime::computer_speed(received_worker_message.speed_percentage.unwrap());
        }
        _ => unsafe {
            unreachable_unchecked();
        },
    }
}
