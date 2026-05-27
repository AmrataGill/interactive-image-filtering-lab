import { KernelGrid } from "./KernelGrid";

export function FilterControls({
  kernel,
  setKernel,
  divisor,
  setDivisor,
  bias,
  setBias,
  absoluteResponse,
  setAbsoluteResponse,
  grayscaleOutput,
  setGrayscaleOutput,
}) {
  return (
    <section className="panel">
      <div className="step-heading">
        <span>3</span>
        <div>
          <h2>Edit the kernel</h2>
          <p>Change the numbers and watch the result update instantly.</p>
        </div>
      </div>

      <KernelGrid kernel={kernel} setKernel={setKernel} />

      <div className="number-fields">
        <label>
          Divisor
          <input type="number" value={divisor} onChange={(event) => setDivisor(event.target.value)} />
        </label>
        <label>
          Bias
          <input type="number" value={bias} onChange={(event) => setBias(event.target.value)} />
        </label>
      </div>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={absoluteResponse}
          onChange={(event) => setAbsoluteResponse(event.target.checked)}
        />
        Use absolute edge response
      </label>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={grayscaleOutput}
          onChange={(event) => setGrayscaleOutput(event.target.checked)}
        />
        Display output in grayscale
      </label>
    </section>
  );
}
