'use client';
export function LabStepNav({
  titles,
  current,
  completed = [],
  onChoose,
}: {
  titles: string[];
  current: number;
  completed?: number[];
  onChoose: (index: number) => void;
}) {
  return (
    <nav className="lab-step-nav" aria-label="Lab steps">
      <h2>In this lab</h2>
      <p>Jump to a step to review it.</p>
      <ol>
        {titles.map((title, index) => (
          <li key={index}>
            <button
              type="button"
              aria-current={current === index ? 'step' : undefined}
              onClick={() => onChoose(index)}
            >
              <span>{completed.includes(index) ? '✓' : index + 1}</span>
              <span>{title}</span>
              {completed.includes(index) && (
                <small className="sr-only">Completed</small>
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
