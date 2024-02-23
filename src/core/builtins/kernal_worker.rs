use super::hardware;
use serde::Deserialize;
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
            screen::try_start_rendering();
            hardware_info::try_start_emitting();
        }
        "partialStop" => {
            screen::try_stop_rendering();
            hardware_info::emit();
            hardware_info::try_stop_emitting();
        }
        "resetAndPartialStart" => {
            runtime::reset_blocking_and_partial_start(
                received_worker_message.machine_code.unwrap(),
            );
            screen::try_start_rendering();
            hardware_info::try_reset_emitting();
            hardware_info::try_start_emitting();
        }
        "stopAndReset" => {
            runtime::try_stop_and_reset_blocking();
            screen::try_stop_rendering();
            hardware_info::reset_emitting();
            hardware_info::emit_default();
            hardware_info::try_stop_emitting();
        }
        "stop" => {
            runtime::try_stop();
            screen::try_stop_rendering();
            hardware_info::try_stop_emitting();
        }
        "keyboard" => {
            hardware::keyboard(received_worker_message.key.unwrap(), true);
        }
        "speed" => {
            runtime::speed(received_worker_message.speed_percentage.unwrap());
        }
        _ => {
            unreachable!()
        }
    }
}
