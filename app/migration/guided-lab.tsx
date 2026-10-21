/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element, react/react-compiler -- Load saved local notes after hydration; no lab operations execute here. */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { GuidedLab as Guide } from '@/lib/guided-lab';
import { BeginnerActions, BeginnerWords } from '../beginner-actions';
import { InstructionScreenshots } from '../instruction-screenshots';
import './guided-lab.css';

export function GuidedLab({
  guide,
  lessonId,
  screenshotLessonId = lessonId,
  stepOffset = 0,
}: {
  guide: Guide;
  lessonId: string;
  screenshotLessonId?: string;
  stepOffset?: number;
}) {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const storageKey = `sonic-guided-workstation2019-v1:${lessonId}${stepOffset ? `:part-${stepOffset}` : ''}`;
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
          <h2>Let’s do this together</h2>
        </div>
        <span>
          {checked.length} / {guide.steps.length} steps checked
        </span>
      </header>
      <p className="guided-start-hint">
        Use your own computer or practice VM. Read one small action, try it,
        then check your screen. You can stop and come back.
      </p>
      <BeginnerWords />
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
              Step {n + 1}: {item.title}
            </option>
          ))}
        </select>
      </label>
      <div className="guided-workspace">
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
              {item.title}
            </button>
          ))}
        </nav>
        <article
          ref={panel}
          tabIndex={-1}
          className="guided-step"
          aria-label={`Step ${index + 1}`}
        >
          <div className="guided-step-number">
            STEP {index + 1} OF {guide.steps.length}
          </div>
          <h3>{step.title}</h3>
          <InstructionScreenshots stepId={`${screenshotLessonId}:guided:${index + stepOffset + 1}`} />
          <div className="guided-action">
            <b>Try these small actions</b>
            <BeginnerActions text={step.action} />
          </div>
          {step.command && (
            <section className="guided-command">
              <header>
                <span>TYPE IN THE TERMINAL NAMED ABOVE</span>
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
            </section>
          )}
          <section className="guided-expected">
            <b>Check: does your screen match this?</b>
            <p>{step.expect}</p>
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
            I checked this result in my lab
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
              Next step →
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
      <details className="guided-rollback">
        <summary>Stop / rollback plan</summary>
        <p>{guide.rollback}</p>
      </details>
      <output aria-live="polite">{notice}</output>
    </section>
  );
}
