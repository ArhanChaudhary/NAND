import computer_init, { render as computer_render } from "core";

// this seemingly redundant postMessage is necessary because new Worker() is
// is asynchronous, and we need to wait for the worker to fully load
self.postMessage({ action: "loaded" });

let ctx: OffscreenCanvasRenderingContext2D;
// serves as the initialize_worker function, but we need e
self.onmessage = async (e) => {
  await computer_init(e.data.wasm_module, e.data.wasm_memory);
  ctx = e.data.canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });

  self.onmessage = (e) => {
    switch (e.data.action) {
      case "startRendering":
        startRendering();
        break;
      case "stopRendering":
        stopRendering();
        break;
    }
  };

  self.postMessage({ action: "ready" });
};

let stopRenderingLoop = false;
function renderer() {
  if (stopRenderingLoop) {
    stopRenderingLoop = false;
  } else {
    requestAnimationFrame(renderer);
  }
  ctx.putImageData(computer_render(), 0, 0);
}

// We need this sort of locking mechanism because of the case of resetAndStart
// *sometimes* we want to start rendering, and sometimes we don't want to do
// anything because it's already rendering. So, instead of moving the logic
// to prevent double rendering to the app logic, we can just do it here to
// make it such that it still works even if multiple startRendering messages
// are sent
let currentlyRendering = false;
function startRendering() {
  if (!currentlyRendering) {
    requestAnimationFrame(renderer);
    currentlyRendering = true;
  }
}

function stopRendering() {
  if (currentlyRendering) {
    stopRenderingLoop = true;
    currentlyRendering = false;
  }
}
