import Link from 'next/link';
export function TerminalSetup() {
  return (
    <details className="terminal-setup guided-reference">
      <summary>Get real terminal output · Windows local setup</summary>
      <p>
        The hosted site supplies command help. Real execution uses SONIC running
        on your Windows PC plus its local companion. It does not run inside this
        hosted website.
      </p>
      <p><strong>First time?</strong> Follow these steps on your Windows PC. Keep both PowerShell windows open while you use the terminal.</p>
      <ol>
        <li>
          Install Git and Node.js 22.13+ with npm. Use your normal Windows
          account. In PowerShell download the current SONIC-Academy classes and start the local app:
          <pre>
            <code>
              {
                'git clone --branch main https://github.com/CloudSeamTech/SONIC-Academy.git\ncd SONIC-Academy\nnpm ci\nnpm run dev'
              }
            </code>
          </pre>
          <p>
            If you already have the repository, save existing work before
            switching branches. Leave this window open.
          </p>
        </li>
        <li>
          In a second PowerShell window, change to the same repository folder
          and start the companion:
          <pre>
            <code>{'npm run companion:install\nnpm run companion:start'}</code>
          </pre>
          <p>
            If node-pty needs compilation, follow its installation error;
            Windows may need Python and Visual Studio Build Tools with Desktop
            development with C++. Do not disable your security tools.
          </p>
        </li>
        <li>
          Open <code>http://localhost:3000/migration#view=terminal</code> (or
          the local port printed by SONIC). Choose Windows PowerShell, paste the
          companion token into the local-only field and select Connect locally.
          Keep the token private.
        </li>
        <li>
          Run <code>Get-Date</code> and <code>$env:COMPUTERNAME</code>. The
          output must come from your Windows PC. The WSL tab runs an installed
          WSL distro; it is separate from a VMware AlmaLinux VM.
        </li>
        <li>
          For AlmaLinux, use GNOME Terminal directly, or a verified SSH
          connection from Windows PowerShell. Check the guest’s host-key
          fingerprint before connecting. Use native PowerShell for full
          interactive SSH; this panel displays basic text and does not implement
          every full-screen terminal behavior.
        </li>
        <li>
          Disconnect in SONIC, then press Ctrl+C in the companion window when
          finished. Stop the local dev server separately. Keep both services
          local; do not publish a remote shell or change the companion’s origin
          checks.
        </li>
      </ol>
      <p>Once both windows are running, open the local app below. The hosted page will stay in copy mode.</p>
      <a href="http://localhost:3000/migration#view=terminal" target="_blank" rel="noreferrer">Open local terminal on this PC ↗</a>
      <p>If your app printed another port, use that address instead. If the page will not open, check that <code>npm run dev</code> is still running.</p>
      <Link href="/alma#lesson=alma-real-terminal">
        Follow the guided real-terminal class →
      </Link>
    </details>
  );
}
