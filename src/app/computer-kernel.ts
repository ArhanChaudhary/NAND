import runtimeInit, { kernelHandleMessage } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  kernelHandleMessage(e.data);
  self.onmessage = (e) => kernelHandleMessage(e.data);
  self.postMessage({ action: "ready" });
};
