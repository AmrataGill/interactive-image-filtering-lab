export function ImageComparison({
  originalCanvasRef,
  resultCanvasRef,
  split,
  setSplit,
  onInspectPatch,
  onDownload,
}) {
  const originalWidth = split === 0 ? 100 : 10000 / split;

  return (
    <section className="panel result-panel">
      <div className="section-title with-action">
        <div>
          <h2>Live before and after</h2>
          <p>Move the slider. Click the original side to inspect a pixel patch.</p>
        </div>
        <button className="primary-button" onClick={onDownload}>
          Download result
        </button>
      </div>

      <label className="comparison-slider">
        <span>Original</span>
        <input
          type="range"
          min="0"
          max="100"
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          aria-label="Before and after comparison"
        />
        <span>Filtered</span>
      </label>

      <div className="comparison-frame">
        <canvas ref={resultCanvasRef} className="result-canvas" />
        <div className="original-layer" style={{ width: `${split}%` }}>
          <canvas
            ref={originalCanvasRef}
            onClick={onInspectPatch}
            className="original-canvas"
            style={{ width: `${originalWidth}%` }}
          />
        </div>
        <div className="split-handle" style={{ left: `${split}%` }} />
      </div>
    </section>
  );
}
