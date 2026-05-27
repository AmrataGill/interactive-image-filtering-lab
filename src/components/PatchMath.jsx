import { clamp } from "../utils/imageProcessing";

export function PatchMath({ patch, kernel, divisor, bias }) {
  if (!patch) {
    return (
      <section className="panel patch-empty">
        <h2>Pixel math explorer</h2>
        <p>
          Click the original side of the image to capture a 3x3 patch. The app
          will show the values used in the convolution.
        </p>
      </section>
    );
  }

  const weighted = patch.values.map((value, index) => value * (Number(kernel[index]) || 0));
  const sum = weighted.reduce((acc, value) => acc + value, 0);
  const safeDivisor = divisor === 0 ? 1 : divisor;
  const result = clamp(sum / safeDivisor + Number(bias || 0));

  return (
    <section className="panel">
      <div className="patch-heading">
        <div>
          <h2>Pixel math explorer</h2>
          <p>
            Patch centered at x={patch.x}, y={patch.y}
          </p>
        </div>
        <strong>Output about {Math.round(result)}</strong>
      </div>

      <div className="math-columns">
        <MathGrid title="Image patch" values={patch.values} tone="neutral" />
        <MathGrid title="Kernel" values={kernel} tone="blue" />
        <MathGrid title="Patch x kernel" values={weighted} tone="yellow" />
      </div>

      <p className="rule-card">
        Multiply each nearby pixel by the matching kernel value, add the results,
        divide by the divisor, then add the bias.
      </p>
    </section>
  );
}

function MathGrid({ title, values, tone }) {
  return (
    <div>
      <p className="math-title">{title}</p>
      <div className={`math-grid ${tone}`}>
        {values.map((value, index) => (
          <span key={index}>{Math.round(Number(value))}</span>
        ))}
      </div>
    </div>
  );
}
