import runtime_init, { computer_handle_message } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtime_init(e.data.wasm_module, e.data.wasm_memory);
  self.onmessage = (e) => computer_handle_message(e.data);
  self.postMessage({ action: "ready" });
};
