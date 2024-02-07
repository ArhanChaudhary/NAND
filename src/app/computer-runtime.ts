import runtimeInit, { computerHandleMessage } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasm_module, e.data.wasm_memory);
  self.onmessage = (e) => computerHandleMessage(e.data);
  self.postMessage({ action: "ready" });
};
