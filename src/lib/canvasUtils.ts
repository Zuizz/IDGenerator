/**
 * Canvas utility functions for drawing the ID badge.
 */

export interface PhotoTransform {
  zoom: number;    // default 1.0 (range 0.8 to 2.5)
  offsetX: number; // % offset (-50 to 50)
  offsetY: number; // % offset (-50 to 50)
}

/**
 * Draws an image onto the canvas with smart face-biased cover effect & zoom/pan controls.
 * The image is face-cropped to fill the target rectangle without stretching.
 */
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  transform: PhotoTransform = { zoom: 1, offsetX: 0, offsetY: 0 }
): void {
  const zoom = Math.max(0.5, transform.zoom || 1);
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const boxAspect = w / h;

  let sw: number, sh: number;

  if (imgAspect > boxAspect) {
    // Image is wider than box
    sh = img.naturalHeight / zoom;
    sw = sh * boxAspect;
  } else {
    // Image is taller than box
    sw = img.naturalWidth / zoom;
    sh = sw / boxAspect;
  }

  // Smart Face Bias: For portrait photos, default to top 25% bias (where faces reside)
  const defaultYBias = imgAspect < 0.95 ? 0.25 : 0.5;

  const maxSx = Math.max(0, img.naturalWidth - sw);
  const maxSy = Math.max(0, img.naturalHeight - sh);

  const baseSx = maxSx * 0.5;
  const baseSy = maxSy * defaultYBias;

  // Apply user offsets (-50 to +50 range)
  const userSx = baseSx + (transform.offsetX / 100) * (img.naturalWidth / 2);
  const userSy = baseSy + (transform.offsetY / 100) * (img.naturalHeight / 2);

  const sx = Math.max(0, Math.min(maxSx, userSx));
  const sy = Math.max(0, Math.min(maxSy, userSy));

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Draws text that wraps within a maximum width.
 * Returns the Y position after the last line.
 */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Loads an image from a URL and returns a promise that resolves
 * when the image is fully loaded.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Converts a canvas DataURL to a Blob.
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
