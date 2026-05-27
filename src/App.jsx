import { useMemo, useRef, useState } from "react";
import "./App.css";
import { FilterControls } from "./components/FilterControls";
import { ImageComparison } from "./components/ImageComparison";
import { LearningPanel } from "./components/LearningPanel";
import { PatchMath } from "./components/PatchMath";
import { PresetCards } from "./components/PresetCards";
import { PRESETS } from "./data/filterPresets";
import { useFilteredImage } from "./hooks/useFilteredImage";
import { createDemoImage } from "./utils/demoImage";
import { getBrightnessPatch } from "./utils/imageProcessing";

const STARTING_PRESET = "sharpen";

export default function InteractiveImageFilteringLab() {
  const originalCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(() => createDemoImage());
  const [selectedPreset, setSelectedPreset] = useState(STARTING_PRESET);
  const [kernel, setKernel] = useState(PRESETS[STARTING_PRESET].kernel.map(String));
  const [divisor, setDivisor] = useState(PRESETS[STARTING_PRESET].divisor);
  const [bias, setBias] = useState(PRESETS[STARTING_PRESET].bias);
  const [absoluteResponse, setAbsoluteResponse] = useState(false);
  const [grayscaleOutput, setGrayscaleOutput] = useState(false);
  const [split, setSplit] = useState(50);
  const [patch, setPatch] = useState(null);

  const preset = useMemo(() => PRESETS[selectedPreset], [selectedPreset]);

  useFilteredImage({
    imageSrc,
    originalCanvasRef,
    resultCanvasRef,
    kernel,
    divisor,
    bias,
    absoluteResponse,
    grayscaleOutput,
  });

  function choosePreset(key) {
    const next = PRESETS[key];
    setSelectedPreset(key);
    setKernel(next.kernel.map(String));
    setDivisor(next.divisor);
    setBias(next.bias);
    setPatch(null);
  }

  function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setPatch(null);
    };
    reader.readAsDataURL(file);
  }

  function resetDemo() {
    setImageSrc(createDemoImage());
    setPatch(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function inspectPatch(event) {
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    setPatch(getBrightnessPatch(canvas, event));
  }

  function downloadResult() {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${preset.label.toLowerCase().replaceAll(" ", "-")}-filtered.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main className="lab-shell">
      <section className="hero-panel">
        <div>
          <h1>Interactive Image Filtering Lab</h1>
          <p className="hero-copy">
            Students can upload an image, choose a filter, edit the 3x3 kernel,
            and immediately see how each number changes the pixels.
          </p>
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="control-stack" aria-label="Filter controls">
          <section className="panel">
            <div className="step-heading">
              <span>1</span>
              <div>
                <h2>Choose an image</h2>
                <p>Start with the built-in demo or use your own picture.</p>
              </div>
            </div>

            <div className="button-row">
              <button className="primary-button" onClick={() => fileInputRef.current?.click()}>
                Upload image
              </button>
              <button className="secondary-button" onClick={resetDemo}>
                Reset demo
              </button>
              <input
                ref={fileInputRef}
                className="hidden-input"
                type="file"
                accept="image/*"
                onChange={uploadImage}
              />
            </div>
          </section>

          <PresetCards
            presets={PRESETS}
            selectedPreset={selectedPreset}
            onPresetChange={choosePreset}
          />

          <FilterControls
            kernel={kernel}
            setKernel={setKernel}
            divisor={divisor}
            setDivisor={setDivisor}
            bias={bias}
            setBias={setBias}
            absoluteResponse={absoluteResponse}
            setAbsoluteResponse={setAbsoluteResponse}
            grayscaleOutput={grayscaleOutput}
            setGrayscaleOutput={setGrayscaleOutput}
          />
        </aside>

        <section className="main-stack">
          <ImageComparison
            originalCanvasRef={originalCanvasRef}
            resultCanvasRef={resultCanvasRef}
            split={split}
            setSplit={setSplit}
            onInspectPatch={inspectPatch}
            onDownload={downloadResult}
          />

          <div className="learning-grid">
            <LearningPanel preset={preset} />
            <PatchMath patch={patch} kernel={kernel} divisor={Number(divisor)} bias={Number(bias)} />
          </div>

          <section className="panel">
            <div className="section-title">
              <h2>Mini learning challenges</h2>
              <p>Small experiments students can try after they understand the basics.</p>
            </div>

            <div className="challenge-grid">
              <article>
                <strong>Make it smoother</strong>
                <p>Use all positive values and set the divisor to their sum.</p>
              </article>
              <article>
                <strong>Find vertical edges</strong>
                <p>Compare the left column with the right column.</p>
              </article>
              <article>
                <strong>Sharpen details</strong>
                <p>Increase the center value and subtract nearby pixels.</p>
              </article>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
