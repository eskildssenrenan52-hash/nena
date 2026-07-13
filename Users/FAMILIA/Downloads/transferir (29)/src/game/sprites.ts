// Load a sprite sheet and strip its magenta background at load time.
// Returns an HTMLCanvasElement usable as a Pixi texture source.

export interface LoadedSheet {
  canvas: HTMLCanvasElement;
  frameW: number; // pixels per frame in the source image
  frameH: number;
  cols: number;
  rows: number;
}

export async function loadSheet(url: string, cols = 4, rows = 4): Promise<LoadedSheet> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    // Key out magenta / near-magenta.
    if (r > 200 && b > 200 && g < 90) {
      px[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  return {
    canvas,
    frameW: img.width / cols,
    frameH: img.height / rows,
    cols,
    rows,
  };
}

export async function loadTileset(url: string): Promise<LoadedSheet> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });

  const cols = 4;
  const rows = 4;
  const normalizedTileSize = 32;
  const srcCellW = img.width / cols;
  const srcCellH = img.height / rows;
  const insetX = Math.max(1, Math.round(srcCellW * 0.0125));
  const insetY = Math.max(1, Math.round(srcCellH * 0.0125));

  const canvas = document.createElement("canvas");
  canvas.width = normalizedTileSize * cols;
  canvas.height = normalizedTileSize * rows;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = col * srcCellW + insetX;
      const sy = row * srcCellH + insetY;
      const sw = srcCellW - insetX * 2;
      const sh = srcCellH - insetY * 2;
      const dx = col * normalizedTileSize;
      const dy = row * normalizedTileSize;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, normalizedTileSize, normalizedTileSize);
    }
  }

  return { canvas, frameW: normalizedTileSize, frameH: normalizedTileSize, cols, rows };
}