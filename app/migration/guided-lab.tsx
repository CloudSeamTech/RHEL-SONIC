/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element, react/react-compiler -- Load saved local notes after hydration; no lab operations execute here. */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { GuidedLab as Guide } from '@/lib/guided-lab';
import screenshotCatalog from '@/content/migration/lab-screenshots.json';
import { BeginnerActions, BeginnerWords } from '../beginner-actions';
import { productionPracticeFor } from '@/lib/lab-production-practice';
import { explainStep } from '@/lib/step-coaching';
import { checkTeachingFor } from '@/lib/reference-check-teaching';
import { InstructionScreenshots } from '../instruction-screenshots';
import './guided-lab.css';

export function GuidedLab({
  guide,
  lessonId,
  purpose,
}: {
  guide: Guide;
  lessonId: string;
  purpose?: string;
}) {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [enlarged, setEnlarged] = useState<
    (typeof screenshotCatalog)[number] | null
  >(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLElement>(null);
  const storageKey = `sonic-guided-workstation2019-v1:${lessonId}`;
  // Synchronize saved lab notes after hydration; this does not execute a lab step.
  useEffect(() => {
    setIndex(0);
    setCopied(false);
    setNotice('');
    setChecked([]);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (Array.isArray(saved))
        setChecked(
          saved.filter(
            (value): value is number =>
              Number.isInteger(value) &&
              value >= 0 &&
              value < guide.steps.length,
          ),
        );
    } catch {
      setNotice('Step checks are kept for this visit only.');
    }
  }, [storageKey, guide.steps.length]);
  const step = guide.steps[index];
  const clarity = checkTeachingFor(lessonId, index + 1);
  const currentTitle = clarity?.title ?? step.title;
  const currentAction = clarity?.action ?? step.action;
  const coaching = explainStep({ lessonId, title: currentTitle, action: currentAction, command: step.command, expected: step.expect });
  function select(next: number) {
    setIndex(next);
    setCopied(false);
    requestAnimationFrame(() => {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }
  function toggle() {
    const next = checked.includes(index)
      ? checked.filter((value) => value !== index)
      : [...checked, index];
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setNotice('Step checks are kept for this visit only.');
    }
  }
  return (
    <section className="guided-lab" aria-label="Guided lab walkthrough">
      <header className="guided-heading">
        <div>
          <span className="eyebrow">GUIDED LAB / ONE STEP AT A TIME</span>
          <h2>Follow one clear step at a time</h2>
        </div>
        <span>
          {checked.length} / {guide.steps.length} steps checked
        </span>
      </header>
      <p className="guided-start-hint">
        Follow the action below on your practice system. Check the actual result
        before continuing. These instructions do not run commands for you.
      </p>
      {purpose && (
        <section className="guided-purpose">
          <b>WHAT WE ARE BUILDING · WHY IT MATTERS</b>
          <p>{purpose}</p>
        </section>
      )}

      <dl className="guided-context">
        <div>
          <dt>WHERE TO WORK</dt>
          <dd>{guide.where}</dd>
        </div>
        <div>
          <dt>BEFORE YOU START</dt>
          <dd>{guide.before}</dd>
        </div>
      </dl>
      <label className="guided-step-picker">
        Choose a step
        <select
          value={index}
          onChange={(event) => select(Number(event.target.value))}
        >
          {guide.steps.map((item, n) => (
            <option key={n} value={n}>
              Step {n + 1}: {checkTeachingFor(lessonId, n + 1)?.title ?? item.title}
            </option>
          ))}
        </select>
      </label>
      <div className="guided-workspace">
        <details className="guided-step-navigation">
          <summary>Jump to a different step · {guide.steps.length} steps</summary>
          <nav className="guided-step-list" aria-label="Walkthrough steps">
          {guide.steps.map((item, n) => (
            <button
              key={`${n}-${item.title}`}
              onClick={() => select(n)}
              aria-current={n === index ? 'step' : undefined}
            >
              <span>
                {checked.includes(n) ? '✓' : String(n + 1).padStart(2, '0')}
              </span>
              {checkTeachingFor(lessonId, n + 1)?.title ?? item.title}
            </button>
          ))}
          </nav>
        </details>
        <article
          ref={panel}
          tabIndex={-1}
          className="guided-step"
          aria-label={`Step ${index + 1}`}
        >
          <div className="guided-step-number">
            STEP {index + 1} OF {guide.steps.length}
          </div>
          <h3>{currentTitle}</h3>
          <p className="coaching-why"><strong>WHY THIS STEP:</strong> {coaching.reason}</p>
          <div className="guided-action">
            <b>DO THIS NOW · IN YOUR PRACTICE LAB</b>
            <BeginnerActions text={currentAction} />
          </div>
          <p className="coaching-effect"><strong>WHAT THIS CHANGES OR CHECKS:</strong> {coaching.impact}</p>
          {step.command && (
            <section className="guided-command">
              <header>
                <span>COMMAND · USE THE WORKSPACE LISTED ABOVE</span>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(step.command);
                      setCopied(true);
                    } catch {
                      setNotice('Select the command and copy it manually.');
                    }
                  }}
                >
                  {copied ? 'Copied ✓' : 'Copy command block'}
                </button>
              </header>
              <pre>
                <code>{step.command}</code>
              </pre>
              <p>
                Copying does not run a command. Paste it into the app named in
                this step. Read the whole block first; some lines belong
                together.
              </p>
              {coaching.commandNotes.length > 0 && (
                <details className="coaching-command">
                  <summary>Understand this command and its options</summary>
                  <ul>{coaching.commandNotes.map((note) => <li key={note}>{note}</li>)}</ul>
                </details>
              )}
            </section>
          )}
          <section className="guided-expected">
            <b>CHECK THE RESULT · DID IT WORK?</b>
            <p>{step.expect}</p>
          </section>
          <section className="guided-production" aria-label="How this differs in production">
            <b>HOW THIS WORKS IN PRODUCTION</b>
            <p>{productionPracticeFor(lessonId)}</p>
            <small>Compare with real-world practice; do not run lab commands against company systems without approval.</small>
          </section>
          <section className="guided-visuals" aria-label="Pictures and screen references for this step">
            <h4 className="guided-visuals-heading">Pictures and screen references for this step</h4>
            <InstructionScreenshots stepId={`${lessonId}:guided:${index + 1}`} />
          {step.screenshots.map((id) => {
            const shot = screenshotCatalog.find((item) => item.id === id);
            return shot ? (
              <figure className="guided-screenshot" key={id}>
                <button
                  className="guided-image-button"
                  aria-label={`Enlarge screenshot: ${shot.alt}`}
                  onClick={() => {
                    setEnlarged(shot);
                    dialog.current?.showModal();
                  }}
                >
                  <img src={shot.src} alt={shot.alt} loading="lazy" />
                </button>
                <figcaption>
                  <strong>Reference screenshot · click to enlarge</strong>
                  <p>{shot.note}</p>
                  <a href={shot.source} target="_blank" rel="noreferrer">
                    {shot.credit}
                  </a>
                </figcaption>
              </figure>
            ) : null;
          })}
          </section>
          <details className="guided-trouble">
            <summary>My screen is different / it did not work</summary>
            <p>{step.trouble}</p>
          </details>
          <details className="guided-evidence">
            <summary>Save a picture or note of your result</summary>
            <p>{step.evidence}</p>
            <small>
              Use Win + Shift + S on your host to capture the VM screen. Keep
              screenshots in your own lab folder; do not include passwords,
              tokens, or product keys.
            </small>
          </details>
          <label className="guided-check">
            <input
              type="checkbox"
              checked={checked.includes(index)}
              onChange={toggle}
            />{' '}
            I verified this result on my practice system
          </label>
          <nav
            className="guided-pagination"
            aria-label="Walkthrough pagination"
          >
            <button disabled={index === 0} onClick={() => select(index - 1)}>
              ← Previous step
            </button>
            <button
              disabled={index === guide.steps.length - 1}
              onClick={() => select(index + 1)}
            >
              Continue to next step →
            </button>
          </nav>
        </article>
      </div>
      <section className="guided-final">
        <b>Final pass check</b>
        <p>{guide.pass}</p>
        <p>
          Step checks are your notes, not proof that a server changed. Use the
          lesson’s existing verification control only after your evidence
          passes.
        </p>
      </section>
      <details className="guided-reference guided-extra-help">
        <summary>Need extra help? Computer terms and explanations</summary>
        <BeginnerWords />
      </details>
      <details className="guided-rollback">
        <summary>Stop / rollback plan</summary>
        <p>{guide.rollback}</p>
      </details>
      <output aria-live="polite">{notice}</output>
      <dialog
        ref={dialog}
        className="guided-image-dialog"
        onClose={() => setEnlarged(null)}
      >
        <button autoFocus onClick={() => dialog.current?.close()}>
          Close screenshot ×
        </button>
        {enlarged && (
          <>
            <img src={enlarged.src} alt={enlarged.alt} />
            <p>{enlarged.note}</p>
            <a href={enlarged.source} target="_blank" rel="noreferrer">
              {enlarged.credit}
            </a>
          </>
        )}
      </dialog>
    </section>
  );
}
