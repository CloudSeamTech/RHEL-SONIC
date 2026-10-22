import { explainStep } from '@/lib/step-coaching';

/** Readable technical teaching note; supplemental, not a replacement for commands. */
export function StepTeachingNotes({
  lessonId,
  title,
  action,
  expected,
  command,
}: {
  lessonId: string;
  title: string;
  action: string;
  expected: string;
  command?: string;
}) {
  const note = explainStep({ lessonId, title, action, expected, command });
  return (
    <section className="coaching-brief" aria-label="Meaning of this step">
      <p>
        <strong>Here’s why:</strong> {note.reason}
      </p>
      <p>
        <strong>What this does:</strong> {note.impact}
      </p>
      {note.commandNotes.length > 0 && (
        <details className="coaching-command">
          <summary>What the command and its options mean</summary>
          <ul>
            {note.commandNotes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
