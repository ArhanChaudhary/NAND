import runtimeInit, { computerHandleMessage } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  self.onmessage = (e) => computerHandleMessage(e.data);
  self.postMessage({ action: "ready" });
};
