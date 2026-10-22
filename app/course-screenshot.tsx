/* Original instructional screenshots are kept intact and do not need an image optimizer. */
/* oxlint-disable next/no-img-element */
'use client';
import { useRef } from 'react';
import azureReferences from '@/content/azure/maintenance-references.json';
import helpdeskReferences from '@/content/helpdesk/references.json';
const references = [...azureReferences, ...helpdeskReferences];
import type { NessusStep } from '@/lib/nessus-curriculum';
export function CourseScreenshot({
  screenshot,
}: {
  screenshot: NessusStep['screenshot'];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const asset =
    screenshot.status !== 'capture-needed'
      ? references.find((item) => item.id === screenshot.assetId)
      : undefined;
  if (!asset)
    return (
      <section
        className="nessus-capture"
        aria-label="Screenshot capture needed"
        data-capture-status="capture-needed"
      >
        <span className="eyebrow">SCREENSHOT TO ADD · CAPTURE CHECKLIST</span>
        <h4>{screenshot.title}</h4>
        <p>{screenshot.instructions}</p>
        <small>
          We still need a real picture of this step. This checklist is not a
          screenshot. You can follow the written directions and compare your
          result with the check above.
        </small>
      </section>
    );
  return (
    <figure className="guided-screenshot" data-capture-status={screenshot.status}>
      <figcaption>
        <strong>{screenshot.title}</strong>
        <p>{screenshot.status === 'illustration' ? 'Illustrated action guide · not a screenshot' : 'Here’s the interface to look for'} · {asset.platform}</p>
      </figcaption>
      <button
        className="guided-image-button"
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Enlarge ${screenshot.status === 'illustration' ? 'action diagram' : 'screenshot'}: ${asset.title}`}
      >
        <img src={asset.src} alt={asset.title} loading="lazy" />
        <span className="picture-zoom-label">
          Click to see it more closely ↗
        </span>
      </button>
      <figcaption>
        <p>{asset.note}</p>
        <a href={asset.source} target="_blank" rel="noreferrer">
          {asset.credit} · original reference ↗
        </a>
        <small>
          {screenshot.status === 'illustration' ? 'This diagram explains the actions. Check your own machine for the actual result.' : 'This is an interface reference. Follow the written CloudSeam values; names in original images may differ.'}
        </small>
      </figcaption>
      <dialog
        ref={dialog}
        className="guided-image-dialog"
        aria-label={asset.title}
      >
        <button onClick={() => dialog.current?.close()}>Close picture ×</button>
        <div className="picture-pan-canvas">
          <img src={asset.src} alt={asset.title} />
        </div>
        <p>{asset.note}</p>
      </dialog>
    </figure>
  );
}
