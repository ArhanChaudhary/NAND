import runtime_init, { screen_handle_message, screen_init } from "core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtime_init(e.data.wasm_module, e.data.wasm_memory);
  screen_init(
    e.data.canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    })
  );
  self.onmessage = (e) => screen_handle_message(e.data.action);
  self.postMessage({ action: "ready" });
};
