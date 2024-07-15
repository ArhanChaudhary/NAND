use super::utils::js_api::DeserializeableOffscreenCanvas;
use super::utils::ALL_STEPS_PER_LOOP;
use super::{hardware, memory};
use crate::architecture;
use crate::builtins::runtime_worker;
use serde::de::{MapAccess, Visitor};
use serde::{Deserialize, Deserializer};
use std::{fmt, ptr};
use wasm_bindgen::prelude::*;

mod hardware_info;
mod screen;

#[wasm_bindgen(js_name = kernelHandleMessage)]
pub fn handle_message(message: JsValue) {
    let received_worker_message: ReceivedWorkerMessage =
        serde_wasm_bindgen::from_value(message).unwrap();
    ReceivedWorkerMessage::handle(received_worker_message);
}

enum ReceivedWorkerMessage {
    ScreenInit(ScreenInitMessage),
    PartialStart,
    PartialStop,
    ResetAndPartialStart(ResetMessage),
    StopAndReset,
    Step,
    Stop,
    Keyboard(KeyboardMessage),
    Speed(SpeedMessage),
    ClearRAM,
}

impl ReceivedWorkerMessage {
    pub fn handle(received_worker_message: Self) {
        match received_worker_message {
            Self::ScreenInit(screen_init_message) => {
                screen::init(screen_init_message);
            }
            Self::PartialStart => {
                screen::try_start_rendering();
                hardware_info::try_start_emitting();
            }
            Self::PartialStop => {
                screen::try_stop_rendering();
                hardware_info::update_clock_speed_and_emit();
                hardware_info::try_stop_emitting();
            }
            Self::ResetAndPartialStart(reset_message) => {
                unsafe {
                    runtime_worker::LOADING_NEW_PROGRAM = true;
                    // read_volatile is absolutely needed here to prevent the compiler from optimizing the loop away
                    // see https://godbolt.org/z/xq7P8PEj4 for the full story
                    while !ptr::read_volatile(ptr::addr_of!(
                        runtime_worker::READY_TO_LOAD_NEW_PROGRAM
                    )) {}
                }
                hardware::load_rom(reset_message.parsed_machine_code());
                architecture::reset();
                unsafe {
                    runtime_worker::LOADING_NEW_PROGRAM = false;
                    runtime_worker::READY_TO_LOAD_NEW_PROGRAM = false;
                }
                hardware_info::reset_clock_speed();
                Self::handle(Self::PartialStart);
            }
            Self::StopAndReset => {
                unsafe {
                    if runtime_worker::IN_RUNTIME_LOOP {
                        runtime_worker::STOP_RUNTIME_LOOP = true;
                        while ptr::read_volatile(ptr::addr_of!(runtime_worker::IN_RUNTIME_LOOP)) {}
                    }
                }
                architecture::reset();
                screen::try_stop_rendering();
                hardware_info::reset_clock_speed();
                hardware_info::emit_default();
                hardware_info::try_stop_emitting();
            }
            Self::Step => {
                architecture::ticktock();
                hardware_info::emit();
                hardware::render();
            }
            Self::Stop => {
                unsafe {
                    if runtime_worker::IN_RUNTIME_LOOP {
                        runtime_worker::STOP_RUNTIME_LOOP = true;
                        while ptr::read_volatile(ptr::addr_of!(runtime_worker::IN_RUNTIME_LOOP)) {}
                    }
                }
                hardware_info::update_clock_speed_and_emit();
                screen::try_stop_rendering();
                hardware_info::try_stop_emitting();
            }
            Self::Keyboard(keyboard_message) => {
                hardware::keyboard(keyboard_message.key, true);
            }
            Self::Speed(speed_message) => {
                let speed_percentage = speed_message.speed_percentage;
                if speed_percentage == 100 {
                    unsafe {
                        runtime_worker::STEPS_PER_LOOP = ALL_STEPS_PER_LOOP[10];
                    }
                } else {
                    let div = (speed_percentage as usize) / 10;
                    let lerp = (speed_percentage as usize) % 10;
                    let div_speed = ALL_STEPS_PER_LOOP[div];
                    let next_div_speed = ALL_STEPS_PER_LOOP[div + 1];
                    unsafe {
                        runtime_worker::STEPS_PER_LOOP =
                            div_speed + ((next_div_speed - div_speed) * lerp) / 10;
                    }
                };
            }
            Self::ClearRAM => {
                memory::clear_ram();
                hardware_info::emit();
            }
        }
    }
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
        let action = map.next_entry::<String, String>()?.unwrap().1;
        Ok(match action.as_str() {
            "screenInit" => ReceivedWorkerMessage::ScreenInit(ScreenInitMessage {
                offscreen_canvas: map.next_entry::<String, _>()?.unwrap().1,
            }),
            "partialStart" => ReceivedWorkerMessage::PartialStart,
            "partialStop" => ReceivedWorkerMessage::PartialStop,
            "resetAndPartialStart" => ReceivedWorkerMessage::ResetAndPartialStart(ResetMessage {
                machine_code: map.next_entry::<String, _>()?.unwrap().1,
            }),
            "stopAndReset" => ReceivedWorkerMessage::StopAndReset,
            "step" => ReceivedWorkerMessage::Step,
            "stop" => ReceivedWorkerMessage::Stop,
            "keyboard" => ReceivedWorkerMessage::Keyboard(KeyboardMessage {
                key: map.next_entry::<String, _>()?.unwrap().1,
            }),
            "speed" => ReceivedWorkerMessage::Speed(SpeedMessage {
                speed_percentage: map.next_entry::<String, _>()?.unwrap().1,
            }),
            "clearRAM" => ReceivedWorkerMessage::ClearRAM,
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

pub struct ResetMessage {
    machine_code: Vec<String>,
}

impl ResetMessage {
    pub fn parsed_machine_code(&self) -> Vec<u16> {
        self.machine_code
            .iter()
            .map(|v| u16::from_str_radix(v.as_str(), 2).unwrap())
            .collect::<Vec<u16>>()
    }
}

pub struct KeyboardMessage {
    key: u16,
}

pub struct SpeedMessage {
    speed_percentage: u16,
}
