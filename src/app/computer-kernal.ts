import runtimeInit, { kernalHandleMessage, screenInit } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  screenInit(e.data.offscreenCanvas);
  self.onmessage = (e) => kernalHandleMessage(e.data);
  self.postMessage({ action: "ready" });
};
