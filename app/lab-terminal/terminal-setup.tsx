'use client';

import { useState } from 'react';

function SetupCommands({ commands, windowName }: { commands: string; windowName: string }) {
  const [notice, setNotice] = useState('');
  return <div className="setup-commands">
    <p><strong>Where to paste:</strong> {windowName}, beside the <code>PS C:\…&gt;</code> prompt. Copy one line, click inside that PowerShell window, press Ctrl+V, then Enter. Wait for the prompt to return before the next line. The final <code>run dev</code> and <code>companion:start</code> commands keep running; leave those windows open.</p>
    {commands.split('\n').map((line, index) => <div className="setup-command-line" key={line}>
      <pre><code>{line}</code></pre>
      <button type="button" aria-label={`Copy command ${index + 1}: ${line}`} onClick={async () => {
        try { await navigator.clipboard.writeText(line); setNotice(`Command ${index + 1} copied. Paste it into ${windowName} and press Enter.`); }
        catch { setNotice('Copy was blocked. Select the command text, press Ctrl+C, then paste it into PowerShell with Ctrl+V.'); }
      }}>Copy line {index + 1}</button>
    </div>)}
    <p role="status" aria-live="polite">{notice}</p>
  </div>;
}


export function TerminalSetup() {
  return (
    <details className="terminal-setup guided-reference">
      <summary>Get real terminal output · start here on Windows</summary>
      <p>
        We’ll install the tools first, then connect the terminal to your own PC.
        Use your Windows 10 host, not a server VM. You don’t need an npm account
        or a paid subscription. Opening this website does not install anything.
      </p>
      <p><strong>Your workspace:</strong> Keep this guide open in your browser. The setup commands below go into the separate Windows PowerShell app on your PC, not the browser address bar or this website’s command field. You’ll use two PowerShell windows: window 1 runs the website, and window 2 runs the companion.</p>
      <p>If you opened Node.js and see only a <code>&gt;</code> prompt, close it. Open <strong>Windows PowerShell</strong> from Start instead. Do not type the <code>PS C:\…&gt;</code> prompt itself; copy only the command.</p>
      <ol>
        <li>
          <h3>Install Node.js — npm comes with it</h3>
          <p>
            Node.js runs the local app. npm downloads the packages it needs.
            You install both together; there is no separate npm installer to find.
          </p>
          <ol>
            <li>Open <a href="https://nodejs.org/en/download" target="_blank" rel="noreferrer">the official Node.js download page</a>.</li>
            <li>Choose Node.js 24 LTS and Windows Installer (.msi). Most Intel/AMD Windows PCs use x64; choose the installer matching your PC.</li>
            <li>Open the downloaded installer. Select Next, accept the license, and keep the default install folder.</li>
            <li>On Custom Setup, keep npm package manager and Add to PATH selected. PATH lets PowerShell find the commands.</li>
            <li>If offered automatic tools for native modules, leave that optional box unchecked for now. We’ll cover build tools below if they are needed.</li>
            <li>Select Install, approve the Windows prompt if you have administrator permission, then select Finish.</li>
          </ol>
          <p>Already installed? The app requires Node.js 22.13 or newer. Node.js 24 LTS is the recommended starting point for this guide.</p>
        </li>
        <li>
          <h3>Install Git for Windows</h3>
          <p>Git downloads the SONIC-Academy project from GitHub.</p>
          <ol>
            <li>Open <a href="https://git-scm.com/downloads/win" target="_blank" rel="noreferrer">the official Git for Windows download page</a> and download the installer for your PC.</li>
            <li>Run the installer. Keep the default options. If asked about PATH, choose Git from the command line and also from 3rd-party software.</li>
            <li>Select Install, then Finish. You do not need to open Git Bash or create a GitHub account for this public project.</li>
          </ol>
        </li>
        <li>
          <h3>Open a fresh PowerShell window and check the tools</h3>
          <p>
            Close PowerShell windows that were open during installation. Press
            the Windows key, type Windows PowerShell, and open it normally.
            Run each line separately:
          </p>
          <SetupCommands windowName="PowerShell window 1" commands={'node --version\nnpm.cmd --version\ngit --version'} />
          <p>
            You should see a Node version such as v24.x.x, an npm version number,
            and git version followed by a number. Your patch numbers may differ.
            If a command says it is not recognized, close and reopen PowerShell;
            if it still fails, rerun that installer and check its Add to PATH option.
          </p>
          <p>
            We use <code>npm.cmd</code> throughout this Windows guide. It runs the
            npm supplied with Node.js and avoids the common “npm.ps1 cannot be
            loaded because running scripts is disabled” message. You do not need
            to change PowerShell’s execution policy for these npm commands.
          </p>
        </li>
        <li>
          <h3>Download the app into your own user folder</h3>
          <p>In that PowerShell window, run these lines one at a time:</p>
          <SetupCommands windowName="PowerShell window 1" commands={'Set-Location $env:USERPROFILE\ngit clone --branch main https://github.com/CloudSeamTech/SONIC-Academy.git\nSet-Location .\\SONIC-Academy\nnpm.cmd ci'} />
          <p><strong>What each line does:</strong> First go to your user folder, then download the project, enter its folder, and finally install its packages. Run <code>npm.cmd ci</code> only inside the SONIC-Academy folder, where <code>package.json</code> is stored.</p>
          <p><strong>If you see ENOENT or “could not read package.json”:</strong> you are in the wrong folder. Run <code>Set-Location "$env:USERPROFILE\SONIC-Academy"</code>, then retry <code>npm.cmd ci</code>. If that folder does not exist, finish the download step first.</p>
          <p>
            Wait until the PowerShell prompt returns without an install error.
            This first download can take several minutes. If a SONIC-Academy
            folder already exists, stop rather than deleting it or cloning over
            your work. Open that existing checkout and save your changes before updating it.
          </p>
        </li>
        <li>
          <h3>Start the website locally — keep window 1 open</h3>
          <SetupCommands windowName="PowerShell window 1" commands={'npm.cmd run dev'} />
          <p>
            Look for the Local address printed by the app, usually
            <code> http://localhost:3000</code>. For this command, do not wait for the PowerShell prompt to return or paste more commands into window 1. This window stays busy serving
            the app; that is normal. Leave it open. If Windows asks about firewall
            access, do not enable public-network access for this local-only setup.
          </p>
        </li>
        <li>
          <h3>Start the companion — keep window 2 open</h3>
          <p>Open a second Windows PowerShell window. Run:</p>
          <SetupCommands windowName="PowerShell window 2" commands={'Set-Location "$env:USERPROFILE\\SONIC-Academy"\nnpm.cmd run companion:install\nnpm.cmd run companion:start'} />
          <p>
            The companion should print its local listening address and a one-time
            token. This command also keeps running; do not wait for its prompt to return. Leave this window open too. The token connects your browser to
            your PC; keep it private and never paste it into chat or GitHub.
          </p>
          <details>
            <summary>Installation failed with node-gyp, Python, or C++ errors?</summary>
            <p>
              Some PCs need tools to build the companion’s terminal package.
              First read the actual error; you do not need these extra downloads
              when installation already succeeded.
            </p>
            <ol>
              <li>Install a supported Python 3 release from <a href="https://www.python.org/downloads/windows/" target="_blank" rel="noreferrer">Python’s Windows downloads</a>. Include the Python launcher and PATH option if offered.</li>
              <li>Install <a href="https://aka.ms/vs/17/release/vs_BuildTools.exe" target="_blank" rel="noreferrer">Microsoft Visual Studio 2022 Build Tools</a>. In its installer, select Desktop development with C++ and keep its recommended MSVC and Windows SDK components.</li>
              <li>Finish installation and restart Windows if requested. Open fresh PowerShell windows and return to the project folder.</li>
              <li>Retry <code>npm.cmd run companion:install</code>, then <code>npm.cmd run companion:start</code>. Restart window 1’s local app if you closed it.</li>
            </ol>
            <p>If it still fails, keep the exact error for troubleshooting. Do not disable antivirus or broadly change execution policies to force installation.</p>
          </details>
        </li>
        <li>
          <h3>Connect from the local website</h3>
          <p>
            Open <code>http://localhost:3000/migration#view=terminal</code> in
            your browser. If window 1 printed another port, use that port instead.
            Use the localhost page for this step; the hosted website stays in copy mode.
          </p>
          <p>
            Choose Windows PowerShell, copy the one-time token from window 2 into
            the One-time companion token field, and select Connect locally. Wait
            for LOCAL · CONNECTED before trying a command.
          </p>
          <a href="http://localhost:3000/migration#view=terminal" target="_blank" rel="noreferrer">Open local terminal on this PC ↗</a>
          <p>If the page will not open, check that window 1 is still running. If connection fails, check window 2 and copy its current token again.</p>
        </li>
        <li>
          <h3>Run your first two commands</h3>
          <p>Type <code>Get-Date</code> and select Run. Then run <code>$env:COMPUTERNAME</code>.</p>
          <p>
            You should see your PC’s date and computer name from the real local
            session. The WSL tab needs an installed WSL distribution; it does not
            connect to your VMware AlmaLinux VM. For that VM, use GNOME Terminal
            directly or a verified SSH connection from native PowerShell.
          </p>
        </li>
        <li>
          <h3>Close the session when you finish</h3>
          <p>
            Select Disconnect terminal. In each PowerShell window, press Ctrl+C
            to stop its service. Keep the app and companion local; no router
            port-forwarding is needed.
          </p>
        </li>
      </ol>
      <a href="/alma#lesson=alma-real-terminal">Follow the guided real-terminal class →</a>
    </details>
  );
}
