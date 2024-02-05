import computer_init, {
  handle_message as screen_handle_message,
  init as screen_init,
} from "core";

// this seemingly redundant postMessage is necessary because new Worker() is
// is asynchronous, and we need to wait for the worker to fully load
self.postMessage({ action: "loaded" });

// serves as the initialize_worker function, but we need e
self.onmessage = async (e) => {
  await computer_init(e.data.wasm_module, e.data.wasm_memory);
  screen_init(
    e.data.canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    })
  );
  self.onmessage = (e) => screen_handle_message(e.data.action);
  self.postMessage({ action: "ready" });
};
