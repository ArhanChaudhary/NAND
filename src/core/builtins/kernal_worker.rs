use super::{runtime_worker, worker_helpers};
use crate::builtins::hardware;
use serde::Deserialize;
use std::hint::unreachable_unchecked;
use wasm_bindgen::prelude::*;

mod hardware_info;
mod runtime;
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

#[wasm_bindgen(js_name = kernalHandleMessage)]
pub fn handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    match received_worker_message.action.as_str() {
        "partialStart" => {
            screen::start_rendering();
            hardware_info::start_emitting();
        }
        "partialStop" => {
            screen::stop_rendering();
            hardware_info::stop_emitting();
            hardware_info::emit();
        }
        "reset" => {
            runtime::reset(received_worker_message.machine_code.unwrap());
            screen::start_rendering();
            hardware_info::reset();
            hardware_info::start_emitting();
        }
        "resetAndStop" => {
            runtime::reset_and_stop();
            screen::stop_rendering();
            hardware_info::reset();
            hardware_info::stop_emitting();
            hardware_info::emit();
        }
        "stop" => {
            runtime::computer_stop();
            screen::stop_rendering();
            hardware_info::stop_emitting();
            if unsafe { runtime_worker::IN_RUNTIME_LOOP } {
                hardware_info::emit();
            }
            worker_helpers::post_worker_message(runtime_worker::StopRuntimeMessage {});
        }
        "keyboard" => unsafe {
            hardware::PRESSED_KEY = received_worker_message.key.unwrap();
        },
        "speed" => {
            runtime::computer_speed(received_worker_message.speed_percentage.unwrap());
        }
        _ => unsafe {
            unreachable_unchecked();
        },
    }
}
