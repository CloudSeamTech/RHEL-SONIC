import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { classifyCommand, helpFor } from '../lib/lab-terminal/command-help.ts';
import { companionWebSocketUrl, isLoopbackHostname } from '../lib/lab-terminal/protocol.ts';

test('live companion URLs exist only for loopback-hosted SONIC', () => {
  assert.equal(isLoopbackHostname('localhost'), true);
  assert.equal(isLoopbackHostname('127.0.0.1'), true);
  assert.equal(isLoopbackHostname('sonic.example.com'), false);
  assert.equal(companionWebSocketUrl('sonic.example.com'), null);
  assert.equal(companionWebSocketUrl('localhost'), 'ws://127.0.0.1:43127/v1/terminal');
});

test('command risk classification does not silently treat Azure changes as read-only', () => {
  assert.equal(classifyCommand('Get-Date'), 'read-only');
  assert.equal(classifyCommand('az account show'), 'read-only');
  assert.equal(classifyCommand('az group create --name training'), 'changes-cloud');
  assert.equal(classifyCommand('Remove-Item C:\\Lab -Recurse'), 'destructive');
  assert.equal(classifyCommand('rm -rf /tmp/training'), 'destructive');
});

test('help names the shell question and explains command tokens', () => {
  const azure = helpFor('azure-cli', 'az version');
  assert.ok(azure);
  assert.match(azure.question, /version/i);
  assert.ok(azure.explanation.length >= 2);
  assert.equal(helpFor('windows-powershell', 'az version'), undefined);
});

test('node-pty is isolated from the Worker application dependency graph', async () => {
  const root = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const companion = JSON.parse(await readFile(new URL('../local-companion/package.json', import.meta.url), 'utf8'));
  assert.equal(root.dependencies?.['node-pty'], undefined);
  assert.equal(root.devDependencies?.['node-pty'], undefined);
  assert.equal(companion.dependencies['node-pty'], '1.1.0');
});

test('local companion source contains loopback, origin, token, limits and cleanup controls', async () => {
  const security = await readFile(new URL('../local-companion/src/security.mjs', import.meta.url), 'utf8');
  const server = await readFile(new URL('../local-companion/src/server.mjs', import.meta.url), 'utf8');
  for (const evidence of ['127.0.0.1', 'isAllowedOrigin', 'timingSafeEqual', 'MAX_SESSIONS', 'MAX_INPUT_BYTES', 'IDLE_TIMEOUT_MS']) assert.match(security, new RegExp(evidence.replaceAll('.', '\\.')));
  assert.match(server, /Authentication timeout/);
  assert.match(server, /terminal\.kill\(\)/);
  assert.doesNotMatch(server, /console\.log\((message\.data|response\.data|payload|data)\)/);
});
