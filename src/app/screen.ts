async function initialize() {
  let ctx: OffscreenCanvasRenderingContext2D;
  let firstDrawn = false;
  self.addEventListener('message', function(e) {
    if (!ctx) {
      ctx = e.data.getContext('2d');
      ctx.fillStyle = 'black';
      return;
    }
    ctx.clearRect(0, 0, 512, 256);
    for (let i = 0; i < e.data.length; i++) {
      const word16 = e.data[i];
      for (let j = 0; j < 16; j++) {
        if ((word16 >> j) & 1) {
          if (!firstDrawn) {
            firstDrawn = true;
            self.postMessage('firstDrawn');
          }
          const x = ((i * 16) + j) % 512;
          const y = Math.floor(i / 32);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  self.postMessage('ready');
}

initialize();