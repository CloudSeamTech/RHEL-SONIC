import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import process from 'node:process';
import pty from 'node-pty';
import { WebSocketServer } from 'ws';
import {
  assertLoopbackBinding,
  IDLE_TIMEOUT_MS,
  isAllowedOrigin,
  isLoopbackAddress,
  LOOPBACK_HOST,
  matchesToken,
  MAX_INPUT_BYTES,
  MAX_SESSIONS,
  validPort,
} from './security.mjs';
import { shellCapabilities, spawnSpec } from './shells.mjs';

const host = LOOPBACK_HOST;
const port = validPort(process.env.SONIC_COMPANION_PORT);
assertLoopbackBinding(host);
const token = process.env.SONIC_COMPANION_TOKEN || randomBytes(32).toString('base64url');
const capabilities = await shellCapabilities();
const sessions = new Set();

const server = createServer((request, response) => {
  response.writeHead(404, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify({ error: 'Not found' }));
});
const sockets = new WebSocketServer({ noServer: true, maxPayload: MAX_INPUT_BYTES });

server.on('upgrade', (request, socket, head) => {
  const remote = request.socket.remoteAddress ?? '';
  const origin = request.headers.origin ?? '';
  if (request.url !== '/v1/terminal' || !isLoopbackAddress(remote) || !isAllowedOrigin(origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }
  sockets.handleUpgrade(request, socket, head, (webSocket) => sockets.emit('connection', webSocket));
});

sockets.on('connection', (webSocket) => {
  let authenticated = false;
  let terminal = null;
  let currentShellId = null;
  let commandPending = false;
  let commandOutputScan = '';
  let idleTimer = null;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => webSocket.close(1000, 'Idle timeout'), IDLE_TIMEOUT_MS);
  };
  const send = (message) => webSocket.readyState === 1 && webSocket.send(JSON.stringify(message));
  const fail = (code, message) => send({ type: 'error', code, message });
  const authTimer = setTimeout(() => webSocket.close(1008, 'Authentication timeout'), 5000);
  resetIdle();

  webSocket.on('message', (payload) => {
    resetIdle();
    let message;
    try { message = JSON.parse(payload.toString('utf8')); } catch { fail('INVALID_JSON', 'Message must be valid JSON.'); return; }
    if (!authenticated) {
      if (message.type !== 'authenticate' || message.protocol !== 1 || !matchesToken(message.token, token)) {
        webSocket.close(1008, 'Authentication failed');
        return;
      }
      authenticated = true;
      clearTimeout(authTimer);
      send({
        type: 'authenticated',
        protocol: 1,
        shells: capabilities.map(({ executable: _executable, args: _args, ...publicCapability }) => publicCapability),
      });
      return;
    }
    if (message.type === 'open') {
      if (terminal || sessions.size >= MAX_SESSIONS) { fail('SESSION_LIMIT', 'Close another terminal session first.'); return; }
      const capability = capabilities.find((item) => item.id === message.shellId);
      try {
        const spec = spawnSpec(capability, message.distro);
        terminal = pty.spawn(spec.file, spec.args, {
          name: 'xterm-256color',
          cols: Math.min(Math.max(Number(message.columns) || 100, 40), 240),
          rows: Math.min(Math.max(Number(message.rows) || 30, 10), 100),
          cwd: process.env.USERPROFILE || process.cwd(),
          env: { ...process.env, TERM: 'xterm-256color' },
          useConpty: process.platform === 'win32',
        });
        sessions.add(terminal);
        currentShellId = message.shellId;
        send({ type: 'opened', sessionId: randomUUID(), shellId: message.shellId });
        terminal.onData((data) => {
          send({ type: 'output', data });
          if (commandPending) {
            commandOutputScan = `${commandOutputScan}${data}`.slice(-1024);
            const completed = commandOutputScan.match(/__SONIC_EXIT__:(-?\d+)/);
            if (completed) {
              commandPending = false;
              commandOutputScan = '';
              send({ type: 'command-exit', exitCode: Number(completed[1]) });
            }
          }
        });
        terminal.onExit(({ exitCode, signal }) => {
          sessions.delete(terminal);
          terminal = null;
          send({ type: 'exit', exitCode, signal });
        });
      } catch (error) { fail('OPEN_FAILED', error instanceof Error ? error.message : 'Shell could not start.'); }
      return;
    }
    if (!terminal) { fail('NO_SESSION', 'Open a shell session first.'); return; }
    if (message.type === 'run' && typeof message.command === 'string') {
      if (commandPending) { fail('COMMAND_RUNNING', 'Cancel or finish the current command first.'); return; }
      const command = message.command.slice(0, MAX_INPUT_BYTES);
      const encoded = Buffer.from(command, 'utf8').toString('base64');
      commandPending = true;
      commandOutputScan = '';
      if (currentShellId === 'wsl-rocky') {
        terminal.write(`eval "$(printf '%s' '${encoded}' | base64 --decode)"; sonic_code=$?; printf '\\n__SONIC_EXIT__:%s\\n' "$sonic_code"\r`);
      } else {
        terminal.write(`$global:LASTEXITCODE=$null; & ([ScriptBlock]::Create([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encoded}')))); $sonic_ok=$?; $sonic_code=if(-not $sonic_ok){1}elseif($null -eq $LASTEXITCODE){0}else{$LASTEXITCODE}; Write-Output "__SONIC_EXIT__:$sonic_code"\r`);
      }
    }
    else if (message.type === 'input' && typeof message.data === 'string') terminal.write(message.data.slice(0, MAX_INPUT_BYTES));
    else if (message.type === 'resize') terminal.resize(Math.min(Math.max(Number(message.columns) || 100, 40), 240), Math.min(Math.max(Number(message.rows) || 30, 10), 100));
    else if (message.type === 'cancel') terminal.write('\u0003');
    else if (message.type === 'close') terminal.kill();
  });

  webSocket.on('close', () => {
    clearTimeout(authTimer);
    clearTimeout(idleTimer);
    if (terminal) { sessions.delete(terminal); terminal.kill(); terminal = null; }
  });
});

server.listen(port, host, () => {
  console.log('SONIC local terminal companion');
  console.log(`Listening only on http://${host}:${port}`);
  console.log('Run SONIC locally, open LAB TERMINAL, and paste this one-time session token:');
  console.log(token);
  console.log('Terminal input/output is streamed to the browser and is not logged by the companion.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const terminal of sessions) terminal.kill();
    server.close(() => process.exit(0));
  });
}
