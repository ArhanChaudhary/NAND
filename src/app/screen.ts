import computer_init, { render as computer_render } from "core";

// this seemingly redundant postMessage is necessary because new Worker() is
// is asynchronous, and we need to wait for the worker to fully load
self.postMessage({ action: "loaded" });

let ctx: OffscreenCanvasRenderingContext2D;
// servers as the initialize_worker function, but we need e
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
    // self.requestAnimationFrame(render);
    setTimeout(renderer, 16);
  }
  ctx.putImageData(computer_render(), 0, 0);
}

function startRendering() {
  // self.requestAnimationFrame(render);
  setTimeout(renderer, 16);
}

function stopRendering() {
  stopRenderingLoop = true;
}
