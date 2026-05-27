export function LearningPanel({ preset }) {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>Why this filter works</h2>
        <p>The explanation changes when students pick a filter.</p>
      </div>

      <article className="lesson-card blue">
        <h3>{preset.label}</h3>
        <p>{preset.description}</p>
      </article>

      <article className="lesson-card yellow">
        <h3>Student intuition</h3>
        <p>{preset.concept}</p>
      </article>

      <p className="rule-card">
        Rule of thumb: averaging values blur, a strong center sharpens, and
        negative-to-positive patterns detect edges.
      </p>
    </section>
  );
}
