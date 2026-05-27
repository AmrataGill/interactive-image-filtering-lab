export function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

export function applyConvolution(imageData, kernel, divisor, bias, absoluteResponse, grayscaleOutput) {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const out = output.data;
  const safeDivisor = divisor === 0 ? 1 : divisor;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const srcIndex = (py * width + px) * 4;
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          const weight = Number(kernel[kernelIndex]) || 0;

          r += data[srcIndex] * weight;
          g += data[srcIndex + 1] * weight;
          b += data[srcIndex + 2] * weight;
        }
      }

      r /= safeDivisor;
      g /= safeDivisor;
      b /= safeDivisor;

      if (absoluteResponse) {
        r = Math.abs(r);
        g = Math.abs(g);
        b = Math.abs(b);
      }

      r += bias;
      g += bias;
      b += bias;

      const outIndex = (y * width + x) * 4;

      if (grayscaleOutput) {
        const gray = clamp(0.299 * r + 0.587 * g + 0.114 * b);
        out[outIndex] = gray;
        out[outIndex + 1] = gray;
        out[outIndex + 2] = gray;
      } else {
        out[outIndex] = clamp(r);
        out[outIndex + 1] = clamp(g);
        out[outIndex + 2] = clamp(b);
      }

      out[outIndex + 3] = data[outIndex + 3];
    }
  }

  return output;
}

export function getBrightnessPatch(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const values = [];

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const px = Math.min(canvas.width - 1, Math.max(0, x + dx));
      const py = Math.min(canvas.height - 1, Math.max(0, y + dy));
      const index = (py * canvas.width + px) * 4;
      const brightness = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
      values.push(brightness);
    }
  }

  return { x, y, values };
}
