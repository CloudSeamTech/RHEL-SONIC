import {
  welcomeFor,
  type LessonWelcome as Welcome,
} from '@/lib/lesson-welcome';
import './lesson-welcome.css';

export function LessonWelcome({
  lessonId,
  content,
}: {
  lessonId?: string;
  content?: Welcome;
}) {
  const welcome = content ?? (lessonId ? welcomeFor(lessonId) : undefined);
  if (!welcome) return null;
  return (
    <section className="teacher-welcome" aria-label="Let’s get ready">
      <span className="eyebrow">LET’S GET READY</span>
      <p className="teacher-intro">{welcome.welcome}</p>
      <h3>Here’s what you’ll need</h3>
      <ul>
        {welcome.needs.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p className="teacher-first">
        <strong>Start here: </strong>
        {welcome.firstMove}
      </p>
      <details>
        <summary>Why are we doing this?</summary>
        <p>{welcome.why}</p>
      </details>
      <p className="teacher-reassurance">{welcome.reassurance}</p>
    </section>
  );
}
