'use client';

import { useState, type ReactNode } from 'react';
import { SessionGuide } from './session-guide';
import { smallActions } from '@/lib/beginner-directions';
import { InstructionScreenshots } from './instruction-screenshots';
import type { WalkthroughStep } from './wazuh-walkthroughs';
import {
  Activity,
  Check,
  Copy,
  Monitor,
  Network,
  Server,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from 'lucide-react';

export function SonicMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="sonic-mark"
    >
      <path d="M9 3h14l7 13-7 13H9L2 16 9 3Z" stroke="currentColor" />
      <path d="m10 11 5 5-5 5m8 0h5" stroke="currentColor" strokeWidth="2" />
      <path d="M23 3h-7M2 16l3-5" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export function SonicCallout({
  kind = 'note',
  title,
  children,
}: {
  kind?: 'note' | 'check' | 'verify' | 'tip' | 'warning';
  title?: string;
  children: ReactNode;
}) {
  const Icon =
    kind === 'verify' || kind === 'check'
      ? ShieldCheck
      : kind === 'warning'
        ? TriangleAlert
        : Activity;
  return (
    <aside className={`sonic-readout sonic-readout--${kind}`}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <h3>{title ?? `SONIC ${kind.toUpperCase()}`}</h3>
        <div className="sonic-readout-copy">{children}</div>
      </div>
    </aside>
  );
}

export function ConsoleArchitecture() {
  return (
    <figure
      className="console-architecture"
      aria-label="Planned lab architecture, not live system status"
    >
      <figcaption>
        <span>TOPOLOGY / 01</span>
        <span>LAB DESIGN</span>
      </figcaption>
      <div className="console-node">
        <Monitor />
        <div>
          <strong>WINDOWS</strong>
          <span>Administrative workstation</span>
        </div>
        <span className="node-index">01</span>
      </div>
      <div className="console-link">
        <span />
        SSH / TCP 22 · TO BOTH HOSTS
      </div>
      <div className="console-network">
        <div className="console-network-label">
          <Network size={16} /> AZURE VNET <span>PRIVATE NETWORK</span>
        </div>
        <div className="console-node">
          <Server />
          <div>
            <strong>RHEL MANAGER</strong>
            <span>rhel9-manager-01</span>
          </div>
          <span className="node-index">02</span>
        </div>
        <div className="console-link future-link">
          ↕ &nbsp; MANAGER / AGENT · PRIVATE
        </div>
        <div className="console-node">
          <Terminal />
          <div>
            <strong>RHEL ENDPOINT</strong>
            <span>rhel9-lab-01 · rexuser</span>
          </div>
          <span className="node-index">03</span>
        </div>
      </div>
      <p>Architecture reference. Course progress is not live system status.</p>
    </figure>
  );
}

// Presentation only: quoted labels and existing click paths are emphasized;
// the lesson's instructions, values, and ordering are not rewritten.
function InstructionText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(
          /(“[^”]+”|"[^"]+"|\b(?:Virtual networks|IP addresses|Subnets|Review ranges|Create|Azure-provided DNS|vnet-rhel9-lab|snet-rhel9-lab|rg-rhel9-lab)\b|10\.0\.[01]\.0\/\d+)/g,
        )
        .map((part, i) =>
          i % 2 ? (
            <strong className="click-target" key={i}>
              {part}
            </strong>
          ) : (
            part
          ),
        )}
    </>
  );
}

export function ClickPath({
  steps,
  title,
  context = 'AZURE PORTAL',
}: {
  steps: string[];
  title: string;
  context?: string;
}) {
  return (
    <section
      className="sonic-click-path"
      aria-label={`${context} guided procedure`}
    >
      <header>
        <span className="eyebrow">CLICK PATH</span>
        <h3>
          {context} {'//'} {title}
        </h3>
      </header>
      <ol>
        {steps.map((step, i) => (
          <li key={step}>
            <span className="click-step-number" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p>
              <InstructionText text={step} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SonicTerminal({
  shell,
  command,
  expected,
}: {
  shell: string;
  command: string;
  expected: string;
}) {
  const [message, setMessage] = useState('');
  return (
    <section
      className="sonic-terminal"
      aria-label="Command and expected result"
    >
      <header>
        <Terminal size={17} aria-hidden="true" />
        <div>
          <span>COMMAND / NAMED SESSION</span>
          <strong>{shell}</strong>
        </div>
        <button
          type="button"
          aria-label="Copy command"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setMessage('Copied');
            } catch {
              setMessage(
                'Copy unavailable. Select the commands and copy manually.',
              );
            }
          }}
        >
          {message === 'Copied' ? <Check size={15} /> : <Copy size={15} />}
          <span>{message === 'Copied' ? 'Copied' : 'Copy'}</span>
        </button>
      </header>
      <pre aria-label="Scrollable command">
        <code>{command}</code>
      </pre>
      <div className="terminal-output">
        <span>EXPECTED RESULT / REFERENCE</span>
        <p>{expected}</p>
      </div>
      <output aria-live="polite">{message}</output>
    </section>
  );
}

export function CommandBreakdown({ arguments: args }: { arguments: string[] }) {
  return (
    <details className="sonic-breakdown" open>
      <summary>
        COMMAND BREAKDOWN <span>{args.length} explanations</span>
      </summary>
      <ol>
        {args.map((argument, i) => (
          <li key={argument}>
            <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <p>{argument}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function SonicWalkthrough({
  steps,
  lessonId,
  variant = 'guided',
}: {
  steps: WalkthroughStep[];
  lessonId?: string;
  variant?: string;
}) {
  return (
    <section
      className="sonic-walkthrough"
      aria-label="Step-by-step walkthrough"
    >
      <h3>DO THIS IN ORDER · ONE STEP AT A TIME</h3>
      <p>
        Open the first step, do the action in your own lab, and check the outcome.
        Expand the next step only when ready. Commands are examples and do not
        run on this website.
      </p>
      <ol>
        {steps.map((step, index) => (
          <li key={`${variant}-${index}-${step.title}`}>
            <details className="sonic-action-panel" open={index === 0}>
              <summary>
                <span>STEP {String(index + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
              </summary>
              <div className="sonic-action-body">
                <p className="walkthrough-location">WHERE TO WORK: {step.where}</p>
                <details className="sonic-action-assist">
                  <summary>How to open the correct terminal or application</summary>
                  <SessionGuide location={step.where} />
                </details>
                <b className="sonic-action-label">DO THIS NOW · IN YOUR LAB</b>
            <ol>
              {step.actions.flatMap(smallActions).map((action, actionIndex) => (
                <li key={`${actionIndex}-${action}`}>{action}</li>
              ))}
            </ol>
            {lessonId && (
              <details className="sonic-action-assist sonic-action-visual">
                <summary>See the picture for this step</summary>
                <InstructionScreenshots
                  stepId={`${lessonId}:${variant}:${index + 1}`}
                />
              </details>
            )}
            {step.command && (
              <SonicTerminal
                shell={step.where}
                command={step.command}
                expected={step.expected}
              />
            )}
            {!step.command && (
              <p className="walkthrough-check">
                <strong>CHECK THE RESULT BEFORE CONTINUING</strong>
                <br />
                {step.expected}
              </p>
            )}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
