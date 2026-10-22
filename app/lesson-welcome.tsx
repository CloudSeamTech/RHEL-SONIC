import {
  welcomeFor,
  type LessonWelcome as Welcome,
} from '@/lib/lesson-welcome';
import './lesson-welcome.css';

export function LessonWelcome({
  lessonId,
  content,
  showIntro = true,
}: {
  lessonId?: string;
  content?: Welcome;
  showIntro?: boolean;
}) {
  const welcome = content ?? (lessonId ? welcomeFor(lessonId) : undefined);
  if (!welcome) return null;
  return (
    <section className="teacher-welcome" aria-label="Let’s get ready">
      <span className="eyebrow">LET’S GET READY</span>
      {showIntro && <p className="teacher-intro">{welcome.welcome}</p>}
      <details className="teacher-preparation">
        <summary>Before you start · what you’ll need</summary>
        <ul>
          {welcome.needs.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        <p><strong>Your first move: </strong>{welcome.firstMove}</p>
        <p><strong>Why this matters: </strong>{welcome.why}</p>
        <p>{welcome.reassurance}</p>
      </details>
    </section>
  );
}
