import runtimeInit, { kernalHandleMessage } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  kernalHandleMessage(e.data);
  self.onmessage = (e) => kernalHandleMessage(e.data);
  self.postMessage({ action: "ready" });
};
