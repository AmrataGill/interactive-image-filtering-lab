export function PresetCards({ presets, selectedPreset, onPresetChange }) {
  return (
    <section className="panel">
      <div className="step-heading">
        <span>2</span>
        <div>
          <h2>Select a filter</h2>
          <p>Each preset teaches one common image-processing idea.</p>
        </div>
      </div>

      <div className="preset-grid">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            className={`preset-card ${selectedPreset === key ? "selected" : ""}`}
            onClick={() => onPresetChange(key)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.summary}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
