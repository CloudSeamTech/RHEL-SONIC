'use client';
import { LabOverview } from '../lab-overview';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LessonWelcome } from '../lesson-welcome';
import { MaintenanceRehearsal } from '../azure-operations/maintenance-rehearsal';
import { SecurityBudget } from '../security/security-budget';
import { CourseScreenshot } from '../course-screenshot';
import { guidedCourses, guidedCourseHref } from '@/lib/guided-courses';
import { ConsoleReaderShell } from '../console-reader-shell';
import {
  nessusCourses,
  type NessusLesson,
  type NessusStep,
} from '@/lib/nessus-curriculum';
import {
  canVerifyNessusLesson,
  nessusSnapshot,
  nessusServerSnapshot,
  subscribeNessus,
  updateNessusProgress,
  type NessusProgress,
} from '@/lib/nessus-progress';
import '../alma/alma.css';
import '../migration/guided-lab.css';
import './nessus.css';

function CommandExample({ step }: { step: NessusStep }) {
  const [notice, setNotice] = useState('');
  return (
    <>
      {step.command && (
        <section className="guided-command">
          <header>
            <span>YOUR COMMAND · COPY IT WHEN YOU’RE READY</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(step.command!);
                  setNotice('Copied');
                } catch {
                  setNotice('Select the command text to copy it manually.');
                }
              }}
            >
              Copy command
            </button>
          </header>
          <pre>
            <code>{step.command}</code>
          </pre>
          <output aria-live="polite">{notice}</output>
        </section>
      )}
      {step.breakdown.length > 0 && (
        <details className="nessus-explanation teaching-callout" open>
          <summary>Understand these commands and settings</summary>
          <dl className="nessus-breakdown">
            {step.breakdown.map((item, i) => (
              <div key={i}>
                <dt>
                  <code>{item.term}</code>
                </dt>
                <dd>{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </>
  );
}

function KnowledgeCheck({
  lesson,
  progress,
  save,
}: {
  lesson: NessusLesson;
  progress: NessusProgress;
  save: (update: (current: NessusProgress) => NessusProgress) => void;
}) {
  const [draft, setAnswers] = useState<number[] | null>(null);
  const answers =
    draft ?? progress.answers[lesson.id] ?? lesson.quiz.map(() => -1);
  const [submitted, setSubmitted] = useState(false);
  const showFeedback =
    submitted || (draft === null && Boolean(progress.answers[lesson.id]));
  const answered =
    answers.length === lesson.quiz.length &&
    answers.every((answer) => answer >= 0);
  const allCorrect = lesson.quiz.every(
    (question, index) => answers[index] === question.answer,
  );
  return (
    <section className="nessus-quiz" aria-label="Knowledge check">
      <h2>Knowledge check</h2>
      <p>Try these before continuing. You can look back and try again.</p>
      {lesson.quiz.map((question, index) => (
        <fieldset key={index}>
          <legend>
            {index + 1}. {question.question}
          </legend>
          {question.options.map((option, answer) => (
            <label key={answer}>
              <input
                type="radio"
                name={`${lesson.id}-question-${index}`}
                value={answer}
                checked={answers[index] === answer}
                onChange={() => {
                  setAnswers(
                    answers.map((value, i) => (i === index ? answer : value)),
                  );
                  setSubmitted(false);
                  // Invalidate a saved pass when an answer changes.
                  save((current) => ({
                    ...current,
                    answers: { ...current.answers, [lesson.id]: [] },
                    verified: current.verified.filter((id) => id !== lesson.id),
                  }));
                }}
              />
              {option}
            </label>
          ))}
          {showFeedback && (
            <p
              className={
                answers[index] === question.answer
                  ? 'console-green'
                  : 'console-amber'
              }
            >
              {answers[index] === question.answer ? 'Correct. ' : 'Try again. '}
              {question.explanation}
            </p>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        disabled={!answered}
        onClick={() => {
          setSubmitted(true);
          save((current) => ({
            ...current,
            answers: { ...current.answers, [lesson.id]: answers },
          }));
        }}
      >
        Check my answers
      </button>
      <p role="status">
        {showFeedback
          ? allCorrect
            ? 'You’ve got it. When your lab checks are finished too, you can mark this lesson complete.'
            : 'You’re close. Have another look at the explanation, then try again.'
          : 'Pick an answer for each question. It’s fine to look back at the lesson.'}
      </p>
    </section>
  );
}

function LessonReader({
  lesson,
  progress,
  save,
}: {
  lesson: NessusLesson;
  progress: NessusProgress;
  save: (update: (current: NessusProgress) => NessusProgress) => void;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const resumeStep = () => {
      const current = JSON.parse(nessusSnapshot()) as NessusProgress;
      const next = lesson.steps.findIndex((_, i) => !current.checked.includes(`${lesson.id}:step:${i}`));
      setIndex(next < 0 ? 0 : next);
    };
    resumeStep();
    window.addEventListener('storage', resumeStep);
    return () => window.removeEventListener('storage', resumeStep);
  }, [lesson.id, lesson.steps]);
  const panel = useRef<HTMLElement>(null);
  const step = lesson.steps[index];
  const stepKey = `${lesson.id}:step:${index}`;
  const check = (key: string) =>
    save((current) => ({
      ...current,
      checked: current.checked.includes(key)
        ? current.checked.filter((id) => id !== key)
        : [...current.checked, key],
    }));
  const choose = (next: number) => {
    setIndex(next);
    requestAnimationFrame(() => {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  };
  return (
    <article className="nessus-lesson">
      <section className="guided-lab" aria-label="Guided walkthrough">
        <header className="guided-heading">
          <h2>Let’s do this together</h2>
          <span>
            {
              lesson.steps.filter((_, i) =>
                progress.checked.includes(`${lesson.id}:step:${i}`),
              ).length
            }
            /{lesson.steps.length} steps checked
          </span>
        </header>
        <progress value={lesson.steps.filter((_, i) => progress.checked.includes(`${lesson.id}:step:${i}`)).length} max={lesson.steps.length} aria-label="Lab step completion" />
        <p>
          Let’s take one small step at a time. Try it on the computer named
          below, then check what happened. You can go back whenever you need to.
        </p>
        <label className="guided-step-picker">
          Choose a step
          <select
            value={index}
            onChange={(event) => choose(Number(event.target.value))}
          >
            {lesson.steps.map((item, i) => (
              <option key={i} value={i}>
                Step {i + 1}: {item.title}
              </option>
            ))}
          </select>
        </label>
        <div className="guided-workspace">
          <section
            ref={panel}
            className="guided-step"
            tabIndex={-1}
            aria-label={`Step ${index + 1}`}
          >
            <div className="guided-step-number">
              STEP {index + 1} OF {lesson.steps.length}
            </div>
            <h3>{step.title}</h3>
            <div className="guided-step-content">
            <div className="nessus-location">
              <b>WHERE TO WORK</b>
              <p>{step.where}</p>
            </div>
            <section className="guided-action">
              <h4>Let’s try it</h4>
              <ol>
                {step.actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ol>
            </section>
            <CommandExample key={`${lesson.id}:${index}`} step={step} />
            <section className="guided-expected">
              <h4>What you should see</h4>
              <p>{step.expected}</p>
              <small>
                Expected observation, not recorded output from your environment.
              </small>
            </section>
            <details className="nessus-explanation">
              <summary>Official reference for this step</summary>
              {step.sources.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  {url.replace('https://docs.tenable.com/', 'Tenable / ')} ↗
                </a>
              ))}
            </details>
            <label className="guided-check">
              <input
                type="checkbox"
                checked={progress.checked.includes(stepKey)}
                onChange={() => check(stepKey)}
              />
              I checked this result in my own lab
            </label>
            <nav className="guided-pagination" aria-label="Step navigation">
              <button disabled={index === 0} onClick={() => choose(index - 1)}>
                ← Previous step
              </button>
              <button
                disabled={index === lesson.steps.length - 1}
                onClick={() => choose(index + 1)}
              >
                Next step →
              </button>
            </nav>
            </div>
            <div className="guided-visuals"><CourseScreenshot screenshot={step.screenshot} /></div>
          </section>
        </div>
      </section>
      <div className="nessus-advice">
        <details className="nessus-explanation">
          <summary>Best practices</summary>
          <ul>
            {lesson.bestPractices.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
        <details className="nessus-explanation">
          <summary>Common mistakes</summary>
          <ul>
            {lesson.commonMistakes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
        <details className="nessus-explanation">
          <summary>Troubleshooting · my screen is different</summary>
          {lesson.troubleshooting.map((item, i) => (
            <section key={i}>
              <h3>{item.problem}</h3>
              <p>{item.fix}</p>
            </section>
          ))}
        </details>
      </div>
      <section className="nessus-exercise">
        <span className="eyebrow">YOUR TURN / PRACTICAL EXERCISE</span>
        <h2>Show what you can do</h2>
        <p>{lesson.exercise}</p>
        <h3>Pass check</h3>
        <p>{lesson.pass}</p>
        <label className="guided-check">
          <input
            type="checkbox"
            checked={progress.checked.includes(`${lesson.id}:exercise`)}
            onChange={() => check(`${lesson.id}:exercise`)}
          />
          I completed the exercise and saved my own evidence privately
        </label>
      </section>
      <KnowledgeCheck
        key={lesson.id}
        lesson={lesson}
        progress={progress}
        save={save}
      />
      <section className="alma-verify">
        <h2>Finished? Verify this lesson</h2>
        <p>
          Check every step, finish the exercise, and pass the knowledge check.
          Progress is self-reported. Signed-in learners can save it to their connected academy account.
        </p>
        <button
          type="button"
          disabled={!canVerifyNessusLesson(lesson.id, progress)}
          aria-pressed={progress.verified.includes(lesson.id)}
          onClick={() =>
            save((current) => ({
              ...current,
              verified: current.verified.includes(lesson.id)
                ? current.verified.filter((id) => id !== lesson.id)
                : [...current.verified, lesson.id],
            }))
          }
        >
          {progress.verified.includes(lesson.id)
            ? '✓ Lesson verified · undo'
            : 'Verify lesson complete'}
        </button>
      </section>
    </article>
  );
}

export function NessusAcademy({ courseId }: { courseId: string }) {
  const course = guidedCourses.find((item) => item.id === courseId)!;
  const isEnterprise = ['mecm-operations', 'wsus-operations'].includes(course.id);
  const isLandingZone = course.id === 'azure-landing-zone';
  const isMaintenance = course.id === 'azure-maintenance';
  const isHelpdesk = course.id === 'iis-helpdesk';
  const isSecurity = course.id === 'budget-cloud-security';
  const relatedCourses = isEnterprise || isLandingZone || isMaintenance || isHelpdesk || isSecurity ? [course] : nessusCourses;
  const [id, setId] = useState(course.lessons[0].id);
  const [notice, setNotice] = useState('');
  const progress = JSON.parse(
    useSyncExternalStore(subscribeNessus, nessusSnapshot, nessusServerSnapshot),
  ) as NessusProgress;
  useEffect(() => {
    const sync = () => {
      const requested = new URLSearchParams(location.hash.slice(1)).get(
        'lesson',
      );
      setId(
        course.lessons.find((lesson) => lesson.id === requested)?.id ??
          course.lessons[0].id,
      );
      setNotice('');
    };
    const frame = requestAnimationFrame(sync);
    window.addEventListener('hashchange', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', sync);
    };
  }, [course]);
  const lesson =
    course.lessons.find((item) => item.id === id) ?? course.lessons[0];
  const index = course.lessons.indexOf(lesson);
  const done = course.lessons.filter((item) =>
    progress.verified.includes(item.id),
  ).length;
  function save(update: (current: NessusProgress) => NessusProgress) {
    setNotice(
      updateNessusProgress(update)
        ? ''
        : 'Browser storage is unavailable. Your latest check could not be saved. Enable local storage to keep progress.',
    );
  }
  return (
    <ConsoleReaderShell
      lessonId={lesson.id}
      tools={<a href="/migration#view=terminal">Lab terminal</a>}
    >
      <main className="alma-reader nessus-reader">
        <nav
          className={
            'nessus-course-switcher' + (isEnterprise || isLandingZone || isMaintenance || isHelpdesk || isSecurity ? ' single-course' : '')
          }
          aria-label={
            isEnterprise ? course.title : isLandingZone ? 'Azure landing zone course' : isSecurity ? 'Cloud security course' : isMaintenance ? 'Azure maintenance course' : isHelpdesk ? 'IIS help desk course' : 'Nessus courses'
          }
        >
          {relatedCourses.map((item, i) => (
            <a
              key={item.id}
              href={guidedCourseHref(item.id)}
              aria-current={item.id === course.id ? 'page' : undefined}
            >
              <small>CLASS {String(i + 1).padStart(2, '0')}</small>
              {item.title}
            </a>
          ))}
        </nav>
        <header className="alma-header">
          <span className="eyebrow">
            {isEnterprise ? course.title.toUpperCase() : isLandingZone ? 'YOUR FIRST AZURE LANDING ZONE' : isSecurity ? 'CLOUD AND ENDPOINT SECURITY' : isMaintenance ? 'AZURE SERVER MAINTENANCE' : isHelpdesk ? 'IIS / CLOUDSEAM HELP DESK' : 'NESSUS 10.12.5'} /
            LESSON {index + 1} OF {course.lessons.length}
          </span>
          <p>{course.title}</p>
          {isEnterprise && <p><a href={course.id === 'mecm-operations' ? '/migration#lesson=mecm-01' : '/migration#lesson=lab-13'}>Need the installation first? Open this class’s install lab →</a></p>}
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <small>
            {course.baseline} · {done}/{course.lessons.length} lessons
            self-verified
          </small>
        </header>
        <LabOverview summary={lesson.what === lesson.description ? undefined : lesson.what} steps={lesson.steps.map(item => item.title)} outcome={lesson.pass} />
        <LessonWelcome
          showIntro={false}
          content={{
            welcome: index === 0 ? course.prerequisite : lesson.what,
            why: lesson.why,
            needs: (index === 0 ? course.supplies : lesson.needs) ??
              course.supplies ?? [
                'Keep your practice computers and the previous lesson’s notes nearby.',
              ],
            firstMove: lesson.steps[0].actions[0],
            reassurance:
              'You don’t have to remember every setting. Keep the instructions beside your screen, and take one small action at a time.',
          }}
        />
        <details className="guided-reference alma-course-index">
          <summary>Choose a lesson · follow this order</summary>
          {course.lessons.map((item, i) => (
            <a
              key={item.id}
              href={`#lesson=${item.id}`}
              aria-current={item.id === lesson.id ? 'page' : undefined}
            >
              {progress.verified.includes(item.id)
                ? '✓'
                : String(i + 1).padStart(2, '0')}{' '}
              · {item.title}
            </a>
          ))}
        </details>
        <output className="nessus-storage-notice" aria-live="polite">
          {notice}
        </output>
        {isMaintenance &&
          [
            'azure-maint-plan',
            'azure-maint-rolling',
            'azure-maint-rollback',
          ].includes(lesson.id) && (
            <MaintenanceRehearsal key={`practice-${lesson.id}`} />
          )}
        {isSecurity && ['sec-plan','sec-cost','sec-vdi-license'].includes(lesson.id) && <SecurityBudget />}
        <LessonReader
          key={lesson.id}
          lesson={lesson}
          progress={progress}
          save={save}
        />
        <nav className="alma-pagination" aria-label="Lesson navigation">
          {index > 0 && (
            <a href={`#lesson=${course.lessons[index - 1].id}`}>
              ← {course.lessons[index - 1].title}
            </a>
          )}
          {index < course.lessons.length - 1 && (
            <a href={`#lesson=${course.lessons[index + 1].id}`}>
              {course.lessons[index + 1].title} →
            </a>
          )}
        </nav>
        <details className="guided-reference alma-sources">
          <summary>References and a note for instructors</summary>
          <p>
            We’ve checked the written steps against the official references
            below. Real interfaces can change, so compare your version and
            subscription or license with the lesson before making a change.
            Original interface references show real controls. Action diagrams are
            labeled as illustrations; remaining capture gaps use checklists. These pages have been tested, but an
            instructor still needs to test installation, updates, scans and
            recovery in a real practice lab.
          </p>
          {course.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              {source.title} ↗
            </a>
          ))}
        </details>
      </main>
    </ConsoleReaderShell>
  );
}
