'use client';
import { useState } from 'react';
import {
  Monitor,
  Server,
  KeyRound,
  ShieldCheck,
  ArrowDown,
  Terminal,
  Files,
} from 'lucide-react';
const exchange = [
  {
    title: '1. Authorize the public key',
    text: 'Before login, Azure provisioning creates rexuser and places the public key in that account’s authorized_keys. The Windows private file is never uploaded.',
  },
  {
    title: '2. Verify the server',
    text: 'SSH first establishes encrypted transport and verifies the server host key. Compare its fingerprint with the one obtained independently through Azure. This is a separate key from your rexuser credential.',
  },
  {
    title: '3. Prove possession',
    text: 'Windows unlocks your private key locally using its passphrase and signs data bound to this SSH session. The private key and its passphrase do not travel to RHEL.',
  },
  {
    title: '4. Verify and open the shell',
    text: 'RHEL checks the signature against the public key authorized for rexuser. If valid and permitted by policy, it opens a rexuser session. Administrative work then uses sudo when needed.',
  },
];
export function KeyDiagram() {
  const [stage, setStage] = useState(0);
  return (
    <section
      className="key-lesson"
      aria-label="SSH key ownership and authentication"
    >
      <div className="visual-title">
        <KeyRound size={20} />
        <h3>One matching pair. Two different responsibilities.</h3>
      </div>
      <div className="key-map">
        <div className="key-machine">
          <h4>
            <Monitor size={19} />
            Windows admin workstation
          </h4>
          <div className="private-key">
            <b>PRIVATE KEY · STAYS HERE</b>
            <code>~/.ssh/rexuser_ed25519</code>
            <p>
              Never copied to the RHEL server. This file creates the proof of
              identity.
            </p>
          </div>
          <div className="public-key">
            <b>Matching public key</b>
            <code>~/.ssh/rexuser_ed25519.pub</code>
            <p>Only this public line goes into Azure’s VM creation form.</p>
          </div>
        </div>
        <div className="key-arrow">
          <ArrowDown />
          <span>Public key authorized on server</span>
        </div>
        <div className="key-machine server-key">
          <h4>
            <Server size={19} />
            RHEL 9 server
          </h4>
          <p>
            Named account: <strong>rexuser</strong>
          </p>
          <b>Authorized public keys</b>
          <code>~/.ssh/authorized_keys</code>
          <small>Normally /home/rexuser/.ssh/authorized_keys</small>
          <p>
            The server stores the public key and uses it to verify the
            authentication attempt. It does not need the private key.
          </p>
        </div>
      </div>
      <p className="key-caption">
        The private key proves “I am rexuser” by proving possession of a key
        authorized for that account. A filename or comment alone is not
        authorization. Windows ~ and RHEL ~ refer to different home directories.
      </p>
      <div
        className="exchange-steps"
        aria-label="Explore the authentication sequence"
      >
        {exchange.map((item, i) => (
          <button
            type="button"
            key={item.title}
            aria-pressed={stage === i}
            onClick={() => setStage(i)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="exchange-detail" aria-live="polite">
        <ShieldCheck size={20} />
        <p>{exchange[stage].text}</p>
      </div>
    </section>
  );
}
export function ArchitectureDiagram() {
  return (
    <section
      className="architecture-lesson"
      aria-label="Two-host Wazuh lab architecture"
    >
      <h3>Two hosts. One deployment scenario.</h3>
      <ol className="workflow-chain">
        {[
          'Windows workstation',
          'Azure tenant / portal',
          'Resource group',
          'VNet / subnet',
          'Two RHEL 9 VMs · rexuser',
          'SSH key authentication',
          'SCP/SFTP → baseline → rollback → Wazuh',
        ].map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>
      <div className="future-architecture">
        <div>
          <Server />
          <strong>RHEL 9 Wazuh Manager</strong>
          <span>rhel9-manager-01 · manager + indexer + dashboard role</span>
        </div>
        <span
          className="bidirectional"
          aria-label="Future manager and agent communication"
        >
          ↔
        </span>
        <div>
          <Monitor />
          <strong>RHEL 9 Wazuh Agent</strong>
          <span>rhel9-lab-01 · retained endpoint</span>
        </div>
      </div>
      <p>
        The manager/agent relationship models centralized administration, as
        practiced with enterprise platforms such as Trellix ePO. Wazuh and
        Trellix ePO are not technically identical. Validate supported versions
        and sizing before installation. The VM build is taught now; Wazuh
        software installation and check-in are the next milestone.
      </p>
    </section>
  );
}
export function ProtocolDiagram() {
  return (
    <section
      className="protocol-lesson"
      aria-label="SSH, SCP and SFTP comparison"
    >
      <h3>Choose the tool for the job</h3>
      <div className="protocol-grid">
        <div>
          <Terminal />
          <h4>SSH</h4>
          <b>Remotely operate the server</b>
          <p>
            Open a shell as rexuser to inspect state or run an authorized
            command.
          </p>
        </div>
        <div>
          <Files />
          <h4>SCP</h4>
          <b>Securely copy files</b>
          <p>
            Copy an approved installer from Windows to a writable location on
            RHEL. Copying is not installing.
          </p>
        </div>
        <div>
          <Files />
          <h4>SFTP</h4>
          <b>Interactive secure file transfer</b>
          <p>
            Browse remote directories and upload/download through an
            SSH-authenticated session.
          </p>
        </div>
      </div>
      <p>
        Same trust and account permissions, different jobs. Transfer commands
        are practiced now with a harmless file before any installer is run.
      </p>
    </section>
  );
}
