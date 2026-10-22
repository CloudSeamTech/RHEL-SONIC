export function LabOverview({ summary, steps, outcome }: { summary?: string; steps: string[]; outcome: string }) {
  return <section className="lab-overview" aria-label="What you will do in this lab">
    <h2>What you’ll do in this lab</h2>
    {summary && <p>{summary}</p>}
    <details>
      <summary>Your plan · {steps.length} steps in order</summary>
      <ol>{steps.map((title, i) => <li key={i}>{title}</li>)}</ol>
    </details>
    <aside className="teaching-callout"><h3>You’re finished when…</h3><p>{outcome}</p></aside>
    <p>Start with step 1. Follow its actions, compare your result with “What you should see,” then move to the next step. If your result is different, use the help in that step before continuing.</p>
  </section>;
}
