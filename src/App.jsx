import React, { useEffect, useMemo, useRef, useState } from "react";

const PRESETS = {
  identity: {
    label: "Identity",
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    divisor: 1,
    bias: 0,
    description:
      "Keeps the image unchanged. This is useful as a baseline to understand what convolution does when only the center pixel matters.",
    concept: "The center value is 1 and all neighbors are 0, so output pixel = original center pixel.",
  },
  blur: {
    label: "Box Blur",
    kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    divisor: 9,
    bias: 0,
    description:
      "Smooths the image by averaging each pixel with its neighbors. This removes noise and high-frequency details.",
    concept: "All 9 neighboring pixels contribute equally, so sharp changes become smoother.",
  },
  sharpen: {
    label: "Sharpen",
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    divisor: 1,
    bias: 0,
    description:
      "Emphasizes edges and details. It strengthens the center pixel and subtracts surrounding pixels.",
    concept: "Sharpening is like original image + high-frequency detail extracted from the image.",
  },
  vertical: {
    label: "Vertical Edges",
    kernel: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
    divisor: 1,
    bias: 128,
    description:
      "Detects vertical edges by comparing the left side of a region with the right side.",
    concept: "If right pixels are much brighter than left pixels, the response becomes large.",
  },
  horizontal: {
    label: "Horizontal Edges",
    kernel: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    divisor: 1,
    bias: 128,
    description:
      "Detects horizontal edges by comparing the top side of a region with the bottom side.",
    concept: "If bottom pixels are much brighter than top pixels, the response becomes large.",
  },
  outline: {
    label: "All-direction Edges",
    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    divisor: 1,
    bias: 128,
    description:
      "Highlights sudden changes in all directions. This is useful for boundary and contour visualization.",
    concept: "The center pixel is compared against all 8 neighboring pixels.",
  },
  emboss: {
    label: "Emboss",
    kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    divisor: 1,
    bias: 128,
    description:
      "Creates a raised 3D-like texture effect by emphasizing diagonal intensity changes.",
    concept: "Negative weights on one diagonal and positive weights on the other create a relief effect.",
  },
};

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

function createDemoImage(width = 640, height = 400) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#e0f2fe");
  gradient.addColorStop(0.5, "#fef9c3");
  gradient.addColorStop(1, "#fce7f3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(70, 80, 160, 160);
  ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
  ctx.beginPath();
  ctx.arc(390, 160, 85, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(244, 63, 94, 0.9)";
  ctx.beginPath();
  ctx.moveTo(320, 310);
  ctx.lineTo(510, 275);
  ctx.lineTo(575, 365);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(70, 305);
  ctx.lineTo(230, 305);
  ctx.lineTo(230, 365);
  ctx.lineTo(70, 365);
  ctx.stroke();

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.font = "bold 30px Inter, Arial";
  ctx.fillText("Filter Lab", 72, 55);
  ctx.font = "18px Inter, Arial";
  ctx.fillText("Upload your own image or experiment with this synthetic one", 72, 390);

  return canvas.toDataURL("image/png");
}

function applyConvolution(imageData, kernel, divisor, bias, absoluteResponse, grayscaleOutput) {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const out = output.data;
  const safeDivisor = divisor === 0 ? 1 : divisor;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
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

      r = r / safeDivisor;
      g = g / safeDivisor;
      b = b / safeDivisor;

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

function KernelGrid({ kernel, setKernel }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {kernel.map((value, index) => (
        <input
          key={index}
          value={value}
          onChange={(event) => {
            const next = [...kernel];
            next[index] = event.target.value;
            setKernel(next);
          }}
          className="h-12 rounded-xl border border-slate-200 bg-white text-center text-sm font-semibold shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      ))}
    </div>
  );
}

function PatchMath({ patch, kernel, divisor, bias }) {
  if (!patch) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Click anywhere on the original image to inspect a 3×3 pixel patch and see the convolution idea numerically.
      </div>
    );
  }

  const weighted = patch.values.map((value, index) => value * (Number(kernel[index]) || 0));
  const sum = weighted.reduce((acc, value) => acc + value, 0);
  const safeDivisor = divisor === 0 ? 1 : divisor;
  const result = clamp(sum / safeDivisor + Number(bias || 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Pixel Math Explorer</h3>
          <p className="text-sm text-slate-600">Showing brightness values around x={patch.x}, y={patch.y}</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Output ≈ {Math.round(result)}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Image patch</p>
          <div className="grid grid-cols-3 gap-1">
            {patch.values.map((value, index) => (
              <div key={index} className="rounded-lg bg-slate-100 p-2 text-center text-xs font-semibold text-slate-800">
                {Math.round(value)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Kernel</p>
          <div className="grid grid-cols-3 gap-1">
            {kernel.map((value, index) => (
              <div key={index} className="rounded-lg bg-sky-50 p-2 text-center text-xs font-semibold text-sky-800">
                {value}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Patch × kernel</p>
          <div className="grid grid-cols-3 gap-1">
            {weighted.map((value, index) => (
              <div key={index} className="rounded-lg bg-amber-50 p-2 text-center text-xs font-semibold text-amber-800">
                {Math.round(value)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        Convolution multiplies each nearby pixel by the matching kernel value, adds everything, divides by the divisor, then adds bias.
      </p>
    </div>
  );
}

export default function InteractiveImageFilteringLab() {
  const originalCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("sharpen");
  const [kernel, setKernel] = useState(PRESETS.sharpen.kernel.map(String));
  const [divisor, setDivisor] = useState(PRESETS.sharpen.divisor);
  const [bias, setBias] = useState(PRESETS.sharpen.bias);
  const [absoluteResponse, setAbsoluteResponse] = useState(false);
  const [grayscaleOutput, setGrayscaleOutput] = useState(false);
  const [split, setSplit] = useState(50);
  const [patch, setPatch] = useState(null);

  const preset = useMemo(() => PRESETS[selectedPreset], [selectedPreset]);

  useEffect(() => {
    setImageSrc(createDemoImage());
  }, []);

  useEffect(() => {
    if (!imageSrc) return;
    const image = new Image();
    image.onload = () => {
      const maxWidth = 760;
      const scale = Math.min(1, maxWidth / image.width);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const originalCanvas = originalCanvasRef.current;
      const resultCanvas = resultCanvasRef.current;
      const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });
      const resultCtx = resultCanvas.getContext("2d");

      originalCanvas.width = width;
      originalCanvas.height = height;
      resultCanvas.width = width;
      resultCanvas.height = height;

      originalCtx.clearRect(0, 0, width, height);
      originalCtx.drawImage(image, 0, 0, width, height);

      const sourceData = originalCtx.getImageData(0, 0, width, height);
      const filteredData = applyConvolution(
        sourceData,
        kernel.map(Number),
        Number(divisor),
        Number(bias),
        absoluteResponse,
        grayscaleOutput
      );
      resultCtx.putImageData(filteredData, 0, 0);
    };
    image.src = imageSrc;
  }, [imageSrc, kernel, divisor, bias, absoluteResponse, grayscaleOutput]);

  function handlePresetChange(key) {
    const next = PRESETS[key];
    setSelectedPreset(key);
    setKernel(next.kernel.map(String));
    setDivisor(next.divisor);
    setBias(next.bias);
    setPatch(null);
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  }

  function handleCanvasClick(event) {
    const canvas = originalCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const values = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = Math.min(canvas.width - 1, Math.max(0, x + dx));
        const py = Math.min(canvas.height - 1, Math.max(0, y + dy));
        const index = (py * canvas.width + px) * 4;
        const brightness = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
        values.push(brightness);
      }
    }

    setPatch({ x, y, values });
  }

  function downloadResult() {
    const canvas = resultCanvasRef.current;
    const link = document.createElement("a");
    link.download = `${PRESETS[selectedPreset].label.toLowerCase().replaceAll(" ", "-")}-filtered.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr] md:items-center">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                Computer Vision Learning Tool
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Interactive Image Filtering Lab
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Upload an image, choose a convolution kernel, edit the numbers, and watch how blur, sharpening, embossing, and edge detection change the pixels.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
              <p className="text-sm uppercase tracking-widest text-slate-300">Core idea</p>
              <p className="mt-3 text-2xl font-bold">Image + Kernel = Filtered Image</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This project teaches the same intuition behind CNN filters: small matrices slide over images to detect visual patterns.
              </p>
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">1. Choose an image</h2>
              <p className="mt-1 text-sm text-slate-600">Use the sample image or upload your own.</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02]"
                >
                  Upload Image
                </button>
                <button
                  onClick={() => {
                    setImageSrc(createDemoImage());
                    setPatch(null);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset Demo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">2. Select a filter</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                      selectedPreset === key
                        ? "bg-sky-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">3. Edit the kernel</h2>
              <p className="mt-1 text-sm text-slate-600">Change the 3×3 values and observe the output.</p>
              <div className="mt-4">
                <KernelGrid kernel={kernel} setKernel={setKernel} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold text-slate-700">
                  Divisor
                  <input
                    type="number"
                    value={divisor}
                    onChange={(event) => setDivisor(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Bias
                  <input
                    type="number"
                    value={bias}
                    onChange={(event) => setBias(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={absoluteResponse}
                  onChange={(event) => setAbsoluteResponse(event.target.checked)}
                  className="h-4 w-4"
                />
                Use absolute edge response
              </label>

              <label className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={grayscaleOutput}
                  onChange={(event) => setGrayscaleOutput(event.target.checked)}
                  className="h-4 w-4"
                />
                Display output in grayscale
              </label>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Live before/after comparison</h2>
                  <p className="text-sm text-slate-600">Move the slider to compare the original image with the filtered result.</p>
                </div>
                <button
                  onClick={downloadResult}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02]"
                >
                  Download Result
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={split}
                  onChange={(event) => setSplit(Number(event.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Original</span>
                  <span>Filtered</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <canvas ref={resultCanvasRef} className="block w-full" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
                  <canvas
                    ref={originalCanvasRef}
                    onClick={handleCanvasClick}
                    className="block h-full cursor-crosshair"
                    style={{ width: `${10000 / split}%`, maxWidth: "none" }}
                  />
                </div>
                <div
                  className="absolute top-0 h-full w-1 bg-white shadow-lg"
                  style={{ left: `${split}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Tip: click on the original side of the image to inspect a local 3×3 patch.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-bold">Why this filter works</h2>
                <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sky-950">
                  <h3 className="font-bold">{preset.label}</h3>
                  <p className="mt-2 text-sm leading-6">{preset.description}</p>
                </div>
                <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-amber-950">
                  <h3 className="font-bold">Student intuition</h3>
                  <p className="mt-2 text-sm leading-6">{preset.concept}</p>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <strong>Rule of thumb:</strong> kernels with averaging values blur; center-positive and neighbor-negative kernels sharpen; negative-to-positive patterns detect edges.
                </div>
              </section>

              <PatchMath patch={patch} kernel={kernel} divisor={Number(divisor)} bias={Number(bias)} />
            </div>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">Mini learning challenge</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">Challenge 1</p>
                  <p className="mt-1 text-sm text-slate-600">Make the image smoother without changing brightness too much.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">Challenge 2</p>
                  <p className="mt-1 text-sm text-slate-600">Create a kernel that detects left-to-right brightness changes.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">Challenge 3</p>
                  <p className="mt-1 text-sm text-slate-600">Increase the center value and subtract neighbors. What happens?</p>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
