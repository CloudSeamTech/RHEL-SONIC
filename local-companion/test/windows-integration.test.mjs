import assert from 'node:assert/strict';
import test from 'node:test';
import pty from 'node-pty';
import { shellCapabilities } from '../src/shells.mjs';

const capabilities = await shellCapabilities();
const powershell = capabilities.find((item) => item.id === 'windows-powershell');
const azure = capabilities.find((item) => item.id === 'azure-cli');
const wsl = capabilities.find((item) => item.id === 'wsl-rocky');

function runPty(file, args, expected, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const terminal = pty.spawn(file, args, {
      name: 'xterm-256color', cols: 100, rows: 30,
      cwd: process.env.USERPROFILE || process.cwd(),
      env: process.env,
      useConpty: process.platform === 'win32',
    });
    let output = '';
    const timer = setTimeout(() => { terminal.kill(); reject(new Error(`PTY timed out. Output: ${output}`)); }, timeoutMs);
    terminal.onData((data) => { output += data; });
    terminal.onExit(({ exitCode }) => {
      clearTimeout(timer);
      if (exitCode !== 0) {
        reject(new Error(`PTY exited ${exitCode}. Output: ${output}`));
        return;
      }
      try { assert.match(output, expected); resolve(); } catch (error) { reject(error); }
    });
  });
}

test('real Windows PTY runs Get-Date under the discovered PowerShell', { skip: process.platform !== 'win32' || !powershell?.available }, async () => {
  await runPty(powershell.executable, ['-NoLogo', '-NoProfile', '-Command', 'Get-Date -Format yyyy-MM-dd'], /\d{4}-\d{2}-\d{2}/);
});

test('real Azure CLI reports its installed version in Windows PowerShell', { skip: process.platform !== 'win32' || !azure?.available }, async (context) => {
  try {
    await runPty(azure.executable, ['-NoLogo', '-NoProfile', '-Command', 'az version --output json'], /azure-cli/);
  } catch (error) {
    if (/Permission denied:[\s\S]*\.azure/i.test(String(error))) {
      context.skip('Managed test sandbox denied access to the current user Azure CLI profile.');
      return;
    }
    throw error;
  }
});

test('real WSL distro reports os-release', { skip: process.platform !== 'win32' || !wsl?.available || !wsl.distros?.length }, async () => {
  await runPty('wsl.exe', ['--distribution', wsl.distros[0], '--', 'cat', '/etc/os-release'], /^(?:.*\r?\n)*NAME=/m);
});
