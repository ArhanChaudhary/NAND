import runtimeInit, { screenHandleMessage, screenInit } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasm_module, e.data.wasm_memory);
  screenInit(e.data.canvas);
  self.onmessage = (e) => screenHandleMessage(e.data);
  self.postMessage({ action: "ready" });
};
