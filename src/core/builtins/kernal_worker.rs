use super::utils::js_api::DeserializeableOffscreenCanvas;
use serde::de::{MapAccess, Visitor};
use serde::{Deserialize, Deserializer};
use std::fmt;
use wasm_bindgen::prelude::*;

mod hardware_info;
mod runtime;
mod screen;

#[wasm_bindgen(js_name = kernalHandleMessage)]
pub fn handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    match received_worker_message {
        ReceivedWorkerMessage::ScreenInit(screen_init_message) => {
            screen::init(screen_init_message);
        }
        ReceivedWorkerMessage::PartialStart => {
            screen::try_start_rendering();
            hardware_info::try_start_emitting();
        }
        ReceivedWorkerMessage::PartialStop => {
            screen::try_stop_rendering();
            hardware_info::emit();
            hardware_info::try_stop_emitting();
        }
        ReceivedWorkerMessage::ResetAndPartialStart(reset_and_partial_start_message) => {
            runtime::reset_blocking_and_partial_start(reset_and_partial_start_message);
            screen::try_start_rendering();
            hardware_info::try_reset_emitting();
            hardware_info::try_start_emitting();
        }
        ReceivedWorkerMessage::StopAndReset => {
            runtime::try_stop_and_reset_blocking();
            screen::try_stop_rendering();
            hardware_info::reset_emitting();
            hardware_info::emit_default();
            hardware_info::try_stop_emitting();
        }
        ReceivedWorkerMessage::Stop => {
            runtime::try_stop();
            screen::try_stop_rendering();
            hardware_info::try_stop_emitting();
        }
        ReceivedWorkerMessage::Keyboard(keyboard_message) => {
            runtime::keyboard(keyboard_message);
        }
        ReceivedWorkerMessage::Speed(speed_message) => {
            runtime::speed(speed_message);
        }
    }
}

enum ReceivedWorkerMessage {
    ScreenInit(ScreenInitMessage),
    PartialStart,
    PartialStop,
    ResetAndPartialStart(ResetAndPartialStartMessage),
    StopAndReset,
    Stop,
    Keyboard(KeyboardMessage),
    Speed(SpeedMessage),
}

struct ReceivedWorkerMessageVisitor;
impl<'de> Visitor<'de> for ReceivedWorkerMessageVisitor {
    type Value = ReceivedWorkerMessage;

    fn expecting(&self, _: &mut fmt::Formatter) -> fmt::Result {
        unreachable!()
    }

    fn visit_map<M>(self, mut map: M) -> Result<ReceivedWorkerMessage, M::Error>
    where
        M: MapAccess<'de>,
    {
        map.next_key::<String>()?.unwrap();
        let action: String = map.next_value()?;
        let _ = map.next_key::<String>();
        Ok(match action.as_str() {
            "screenInit" => ReceivedWorkerMessage::ScreenInit(ScreenInitMessage {
                offscreen_canvas: map.next_value()?,
            }),
            "partialStart" => ReceivedWorkerMessage::PartialStart,
            "partialStop" => ReceivedWorkerMessage::PartialStop,
            "resetAndPartialStart" => {
                ReceivedWorkerMessage::ResetAndPartialStart(ResetAndPartialStartMessage {
                    machine_code: map.next_value()?,
                })
            }
            "stopAndReset" => ReceivedWorkerMessage::StopAndReset,
            "stop" => ReceivedWorkerMessage::Stop,
            "keyboard" => ReceivedWorkerMessage::Keyboard(KeyboardMessage {
                key: map.next_value()?,
            }),
            "speed" => ReceivedWorkerMessage::Speed(SpeedMessage {
                speed_percentage: map.next_value()?,
            }),
            _ => unreachable!(),
        })
    }
}

impl<'de> Deserialize<'de> for ReceivedWorkerMessage {
    fn deserialize<D>(deserializer: D) -> Result<ReceivedWorkerMessage, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_map(ReceivedWorkerMessageVisitor)
    }
}

pub struct ScreenInitMessage {
    offscreen_canvas: DeserializeableOffscreenCanvas,
}

pub struct ResetAndPartialStartMessage {
    machine_code: Vec<String>,
}

pub struct KeyboardMessage {
    key: u16,
}

pub struct SpeedMessage {
    speed_percentage: u16,
}
