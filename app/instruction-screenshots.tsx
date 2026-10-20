/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element */
'use client';

import { useRef } from 'react';
import captureRegistry from '@/content/screenshots/captures.json';
import './migration/guided-lab.css';

type ReviewedCapture = {
  stepId: string;
  instructionHash: string;
  src: string;
  fileHash: string;
  provenance: string;
  platform: string;
  reviewedAt: string;
  reviewed: boolean;
};

/** Only reviewed captures are rendered. Missing images never become fake screenshots. */
export function InstructionScreenshots({ stepId }: { stepId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = (captureRegistry as ReviewedCapture[]).find(
    (capture) => capture.stepId === stepId && capture.reviewed,
  );
  if (!image) return null;
  return (
    <figure className="guided-screenshot">
      <button
        className="guided-image-button"
        aria-label={`Enlarge lab screenshot for ${stepId}`}
        onClick={() => dialog.current?.showModal()}
      >
        <img
          src={image.src}
          alt={`Reviewed ${image.platform} instructional capture for ${stepId}`}
          loading="lazy"
        />
      </button>
      <figcaption>
        <strong>Instructional screenshot · {image.platform}</strong>
        <p>{image.provenance}</p>
        <small>
          This illustrates the lab step; it does not verify your own
          environment.
        </small>
      </figcaption>
      <dialog className="guided-image-dialog" ref={dialog}>
        <button onClick={() => dialog.current?.close()}>
          Close screenshot ×
        </button>
        <img
          src={image.src}
          alt={`Reviewed ${image.platform} instructional capture for ${stepId}`}
        />
        <p>{image.provenance}</p>
      </dialog>
    </figure>
  );
}
