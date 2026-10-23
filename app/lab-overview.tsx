export function LabOverview({
  summary,
  steps,
  outcome,
}: {
  summary?: string;
  steps: string[];
  outcome: string;
}) {
  return (
    <section className="lab-overview" aria-label="What you will do in this lab">
      <h2>What you’ll do in this lab</h2>
      {summary && <p>{summary}</p>}
      <p className="lab-step-count">
        {steps.length} steps · use “In this lab” to jump to a step.
      </p>

      <aside className="teaching-callout">
        <h3>You’re finished when…</h3>
        <p>{outcome}</p>
      </aside>
    </section>
  );
}
