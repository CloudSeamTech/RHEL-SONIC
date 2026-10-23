'use client';

import { ConsoleReaderShell } from './console-reader-shell';
import './learning-console.css';

export function LearningConsole(_props: { initialPathId?: string } = {}) {
  return <ConsoleReaderShell>
    <main className="academy-home">
      <header className="academy-intro">
        <span className="eyebrow">LEARN IT · BUILD IT · CHECK IT</span>
        <h1>SONIC-Academy</h1>
        <p>Build the skills you’ll use in an IT team, one practical lab at a time.</p>
        <p>Learn to manage servers, identities, applications, updates, and cloud systems. We’ll show you where to work, what to do, why it matters, and how to check your result.</p>
      </header>
      <section className="academy-start">
        <h2>Find your class</h2>
        <ol>
          <li><strong>Choose a subject in the left sidebar.</strong> On a phone, select the menu button at the top first.</li>
          <li><strong>Open an operation.</strong> Use its arrow to reveal the labs for installation, configuration, or daily work.</li>
          <li><strong>Select a lab title.</strong> Read its summary and “Before you start” list, then begin with step 1.</li>
        </ol>
        <p>New to the lab? Start with Windows Server &amp; VMware, then Active Directory, then SQL Server. WSUS and MECM have their own classes when your foundation is ready.</p>
        <a className="console-action" href="/migration#lesson=lab-00">Start with the lab setup →</a>
      </section>
      <div className="academy-help-grid">
        <section>
          <h2>When something doesn’t work</h2>
          <p>Compare your screen with “What you should see.” Check that you’re on the named computer, then open the troubleshooting help inside that step. Keep the exact error and the time it happened.</p>
          <a href="/migration#lesson=lab-19">Practice troubleshooting a failed migration →</a>
        </section>
        <section>
          <h2>Want real terminal results?</h2>
          <p>Commands run in your own lab. Our Windows setup guide installs the tools and connects the local companion so the terminal can display real output from your PC.</p>
          <a href="/migration#view=terminal&amp;setup=1">Set up your PowerShell terminal →</a>
        </section>
        <section>
          <h2>Know when you’ve finished</h2>
          <p>Complete each action, check the actual result, and save your evidence before marking a lab verified. Your progress stays in this browser; a checkmark does not make a change on your server.</p>
        </section>
        <section>
          <h2>Keep your practice lab separate</h2>
          <p>Use the written cloudseam.tech lab plan and disposable test machines. Azure resources can cost money; review the cost and cleanup instructions before creating them.</p>
        </section>
      </div>
    </main>
  </ConsoleReaderShell>;
}
