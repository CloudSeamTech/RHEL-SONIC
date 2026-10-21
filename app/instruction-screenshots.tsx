/* Native images preserve downloadable, full-resolution teaching assets. */
/* oxlint-disable next/no-img-element */
'use client';
import { useRef } from 'react';
import captureRegistry from '@/content/screenshots/captures.json';
import pictureRegistry from '@/content/screenshots/step-pictures.json';
import './migration/guided-lab.css';

type ReviewedCapture = {
  stepId: string;
  src: string;
  platform: string;
  provenance: string;
  reviewed: boolean;
};
const picturesByStep = new Map(
  pictureRegistry.pictures.map((picture) => [picture.stepId, picture]),
);

export function InstructionScreenshots({ stepId }: { stepId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const capture = (captureRegistry as ReviewedCapture[]).find(
    (item) => item.stepId === stepId && item.reviewed,
  );
  const picture = picturesByStep.get(stepId);
  if (!capture && !picture) return null;
  const src = capture?.src ?? picture!.src;
  const title = capture
    ? `Lab screenshot · ${capture.platform}`
    : `Picture for this step · ${picture!.title}`;
  const note =
    capture?.provenance ??
    'Illustrated step map, not a software screenshot. Follow the numbered actions and compare with your own screen. Command examples are not results.';
  return (
    <figure className="guided-screenshot step-picture" data-step-id={stepId}>
      <div className="step-picture-heading">
        <strong>
          {capture ? 'Look at this screen' : 'Look at this step picture'}
        </strong>
        <span className="step-picture-kind">
          {capture ? 'Reviewed capture' : 'Illustrated guide'}
        </span>
      </div>
      <button
        className="guided-image-button"
        aria-label={`Enlarge picture for ${stepId}`}
        onClick={() => dialog.current?.showModal()}
      >
        <img src={src} alt={title} loading="lazy" />
        <span className="picture-zoom-label">
          Tap or click to make the picture bigger ↗
        </span>
      </button>
      <figcaption>
        <small>{note}</small>
      </figcaption>
      <dialog className="guided-image-dialog" ref={dialog} aria-label={title}>
        <button onClick={() => dialog.current?.close()}>Close picture ×</button>
        <p className="picture-pan-hint">
          On a small screen, swipe the picture sideways to read it.
        </p>
        <div className="picture-pan-canvas">
          <img src={src} alt={title} />
        </div>
        <p>{note}</p>
      </dialog>
    </figure>
  );
}
