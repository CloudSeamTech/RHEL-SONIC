/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element, react/react-compiler -- Load saved local notes after hydration; no lab operations execute here. */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { GuidedLab as Guide } from '@/lib/guided-lab';
import screenshotCatalog from '@/content/migration/lab-screenshots.json';
import { InstructionScreenshots } from '../instruction-screenshots';
import './guided-lab.css';

export function GuidedLab({
  guide,
  lessonId,
}: {
  guide: Guide;
  lessonId: string;
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
  function select(next: number) {
    setIndex(next);
    setCopied(false);
    requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }));
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
          <h2>Follow along in your own lab</h2>
        </div>
        <span>
          {checked.length} / {guide.steps.length} steps checked
        </span>
      </header>
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
          <div className="guided-action">
            <b>Do this</b>
            <p>{step.action}</p>
          </div>
          {step.command && (
            <section className="guided-command">
              <header>
                <span>COMMAND · RUN ONLY IN THE NAMED SHELL</span>
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
                  {copied ? 'Copied' : 'Copy command'}
                </button>
              </header>
              <pre>
                <code>{step.command}</code>
              </pre>
              <p>
                The command is not executed by this page. Read the target and
                explanation in this step first.
              </p>
            </section>
          )}
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
          <InstructionScreenshots stepId={`${lessonId}:guided:${index + 1}`} />
          <section className="guided-expected">
            <b>What you should see</b>
            <p>{step.expect}</p>
          </section>
          <details className="guided-trouble">
            <summary>My screen is different / it did not work</summary>
            <p>{step.trouble}</p>
          </details>
          <div className="guided-evidence">
            <b>Capture your evidence</b>
            <p>{step.evidence}</p>
            <small>
              Use Win + Shift + S on your host to capture the VM screen. Keep
              screenshots in your own lab folder; do not include passwords,
              tokens, or product keys.
            </small>
          </div>
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
