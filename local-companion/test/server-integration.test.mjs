import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { WebSocket } from 'ws';

const integrationPort = 43291;
const integrationToken = 'sonic-integration-token-'.padEnd(48, 'x');

function startServer() {
  const child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      SONIC_COMPANION_PORT: String(integrationPort),
      SONIC_COMPANION_TOKEN: integrationToken,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Companion startup timed out: ${output}`));
    }, 15000);
    child.stdout.on('data', (data) => {
      output += data;
      if (output.includes('Listening only on')) {
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.stderr.on('data', (data) => { output += data; });
    child.on('exit', (code) => {
      if (!output.includes('Listening only on')) {
        clearTimeout(timer);
        reject(new Error(`Companion exited ${code}: ${output}`));
      }
    });
  });
}

test('authenticated loopback WebSocket streams real PowerShell output', { skip: process.platform !== 'win32', timeout: 30000 }, async () => {
  const child = await startServer();
  try {
    await new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${integrationPort}/v1/terminal`, {
        origin: 'http://127.0.0.1:3000',
      });
      let output = '';
      const timer = setTimeout(() => {
        socket.close();
        reject(new Error(`Live output timed out: ${output}`));
      }, 20000);
      socket.on('open', () => socket.send(JSON.stringify({ type: 'authenticate', token: integrationToken, protocol: 1 })));
      socket.on('message', (payload) => {
        const message = JSON.parse(payload.toString());
        if (message.type === 'authenticated') {
          const powerShell = message.shells.find((shell) => shell.id === 'windows-powershell');
          assert.equal(powerShell.available, true);
          socket.send(JSON.stringify({ type: 'open', shellId: 'windows-powershell', columns: 100, rows: 30 }));
        } else if (message.type === 'opened') {
          socket.send(JSON.stringify({ type: 'run', command: 'Get-Date -Format yyyy-MM-dd' }));
        } else if (message.type === 'output') {
          output += message.data;
        } else if (message.type === 'command-exit') {
          if (/\d{4}-\d{2}-\d{2}/.test(output)) {
            assert.equal(message.exitCode, 0);
            clearTimeout(timer);
            socket.send(JSON.stringify({ type: 'close' }));
            socket.close();
            resolve();
          } else {
            reject(new Error(`No real date output before exit: ${output}`));
          }
        } else if (message.type === 'error') {
          clearTimeout(timer);
          reject(new Error(`${message.code}: ${message.message}`));
        }
      });
      socket.on('error', reject);
    });
  } finally {
    child.kill('SIGTERM');
  }
});

test('non-loopback browser origin is rejected before authentication', { skip: process.platform !== 'win32', timeout: 20000 }, async () => {
  const child = await startServer();
  try {
    await new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${integrationPort}/v1/terminal`, {
        origin: 'https://untrusted.example',
      });
      const timer = setTimeout(() => reject(new Error('Untrusted origin was not rejected.')), 8000);
      socket.on('unexpected-response', (_request, response) => {
        clearTimeout(timer);
        assert.equal(response.statusCode, 403);
        resolve();
      });
      socket.on('open', () => reject(new Error('Untrusted origin opened a terminal socket.')));
      socket.on('error', () => {});
    });
  } finally {
    child.kill('SIGTERM');
  }
});
