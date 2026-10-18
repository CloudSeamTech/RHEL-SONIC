'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, CircleSlash, Copy, Play, Plug, RotateCcw, Square, TerminalSquare } from 'lucide-react';
import { classifyCommand, commandHelp, helpFor, type CommandRisk } from '@/lib/lab-terminal/command-help';
import {
  companionWebSocketUrl,
  isLoopbackHostname,
  type ClientMessage,
  type ServerMessage,
  type ShellCapability,
  type ShellId,
} from '@/lib/lab-terminal/protocol';
import './lab-terminal.css';

const shells: { id: ShellId; label: string; location: string }[] = [
  { id: 'windows-powershell', label: 'Windows PowerShell', location: 'Your Windows workstation' },
  { id: 'azure-cli', label: 'Azure CLI in PowerShell', location: 'Windows PowerShell with installed Azure CLI' },
  { id: 'wsl-rocky', label: 'Rocky Linux / WSL', location: 'An actually installed WSL distribution' },
];

const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`, 'g');
const stripAnsi = (value: string) => value
  .replace(ansiPattern, '')
  .replace(/\r(?!\n)/g, '\n')
  .split('\n')
  .filter((line) => !/FromBase64String|__SONIC_EXIT__|base64 --decode/.test(line))
  .join('\n');

const riskText: Record<CommandRisk, string> = {
  'read-only': 'READ ONLY',
  'changes-local': 'CHANGES THIS COMPUTER',
  'changes-cloud': 'MAY CHANGE AZURE',
  destructive: 'DESTRUCTIVE / HIGH RISK',
};

export function LabTerminal() {
  const loopback = typeof window !== 'undefined' && isLoopbackHostname(window.location.hostname);
  const [selected, setSelected] = useState<ShellId>('windows-powershell');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'copy' | 'disconnected' | 'connecting' | 'ready' | 'running' | 'error'>('copy');
  const [message, setMessage] = useState('Hosted SONIC cannot execute commands on your computer. Use copy/help mode, or run SONIC and the companion locally.');
  const [capabilities, setCapabilities] = useState<ShellCapability[]>([]);
  const [distro, setDistro] = useState('');
  const [output, setOutput] = useState('');
  const [command, setCommand] = useState('');
  const [pending, setPending] = useState<{ command: string; risk: CommandRisk } | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const selectedCapability = capabilities.find((item) => item.id === selected);
  const examples = commandHelp.filter((item) => item.shellId === selected);
  const contextualHelp = useMemo(() => helpFor(selected, command), [selected, command]);

  useEffect(() => {
    const localReady = window.setTimeout(() => {
      if (loopback) {
        setStatus('disconnected');
        setMessage('Companion not connected. No command has run.');
      }
    }, 0);
    return () => {
      window.clearTimeout(localReady);
      socket.current?.close();
    };
  }, [loopback]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  const send = (value: ClientMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(value));
  };

  const disconnect = (reason = 'Disconnected. No command is running.') => {
    socket.current?.close();
    socket.current = null;
    setStatus(loopback ? 'disconnected' : 'copy');
    setMessage(reason);
  };

  const connect = () => {
    const url = companionWebSocketUrl(window.location.hostname);
    if (!url || token.trim().length < 32) {
      setStatus('error');
      setMessage('Paste the one-time token printed by the local companion. It is kept only in this page memory.');
      return;
    }
    socket.current?.close();
    setOutput('');
    setStatus('connecting');
    setMessage('Connecting to the loopback-only companion…');
    const nextSocket = new WebSocket(url);
    socket.current = nextSocket;
    nextSocket.onopen = () => nextSocket.send(JSON.stringify({ type: 'authenticate', token: token.trim(), protocol: 1 } satisfies ClientMessage));
    nextSocket.onmessage = (event) => {
      const response = JSON.parse(event.data) as ServerMessage;
      if (response.type === 'authenticated') {
        setCapabilities(response.shells);
        const capability = response.shells.find((item) => item.id === selected);
        if (!capability?.available) {
          setStatus('error');
          setMessage(capability?.detail ?? 'This shell was not reported by the companion.');
          return;
        }
        const requestedDistro = selected === 'wsl-rocky' ? distro || capability.distros?.[0] : undefined;
        if (requestedDistro) setDistro(requestedDistro);
        nextSocket.send(JSON.stringify({ type: 'open', shellId: selected, columns: 110, rows: 34, distro: requestedDistro } satisfies ClientMessage));
      } else if (response.type === 'opened') {
        setStatus('ready');
        setMessage('LIVE LOCAL SESSION · actual output and exit state come from your computer.');
      } else if (response.type === 'output') {
        setOutput((current) => (current + stripAnsi(response.data)).slice(-120_000));
      } else if (response.type === 'command-exit') {
        setOutput((current) => `${current}\n[exit code ${response.exitCode}]\n`);
        setStatus('ready');
        setMessage(`Command completed with real exit code ${response.exitCode}.`);
      } else if (response.type === 'exit') {
        setOutput((current) => `${current}\n[process exited with code ${String(response.exitCode)}]\n`);
        setStatus('ready');
        setMessage(`Shell exited with code ${String(response.exitCode)}.`);
      } else if (response.type === 'error') {
        setStatus('error');
        setMessage(`${response.code}: ${response.message}`);
      }
    };
    nextSocket.onerror = () => { setStatus('error'); setMessage('The localhost companion could not be reached or rejected the connection. Nothing was executed.'); };
    nextSocket.onclose = () => { socket.current = null; setStatus((current) => current === 'copy' ? current : 'disconnected'); };
  };

  const changeShell = (shellId: ShellId) => {
    disconnect('Shell changed. Reconnect explicitly to start the selected local session.');
    setSelected(shellId);
    setOutput('');
    setPending(null);
  };

  const execute = (value: string) => {
    if (!value.trim() || status !== 'ready') return;
    setOutput((current) => `${current}\n> ${value}\n`);
    send({ type: 'run', command: value });
    setStatus('running');
    setMessage('Command is running locally. Output below is streamed from the real process.');
    setCommand('');
    setPending(null);
  };

  const requestExecution = () => {
    const risk = classifyCommand(command);
    if (risk === 'read-only') execute(command);
    else setPending({ command, risk });
  };

  return (
    <section className="lab-terminal-experience">
      <header className="terminal-titlebar">
        <div><span className="eyebrow">OPT-IN / LOCAL USER CONTEXT</span><h1>LAB TERMINAL</h1><p>Real commands only when the authenticated Windows companion is running on this same computer.</p></div>
        <span className={`terminal-state state-${status}`}><i />{status === 'copy' ? 'HOSTED · COPY / HELP' : status === 'ready' ? 'LOCAL · CONNECTED' : status.toUpperCase()}</span>
      </header>
      <aside className="terminal-safety">
        <ShieldIcon /><div><b>NO PUBLIC REMOTE SHELL</b><p>The companion binds to 127.0.0.1, requires a one-time token and approved browser origin, runs as your current user, and never elevates privileges. Terminal content is not logged by the companion.</p></div>
      </aside>
      <nav className="terminal-tabs" aria-label="Terminal shells">
        {shells.map((shell) => <button key={shell.id} className={selected === shell.id ? 'selected' : ''} onClick={() => changeShell(shell.id)}><TerminalSquare size={16} /><span>{shell.label}<small>{shell.location}</small></span>{capabilities.length > 0 && <i className={capabilities.find((item) => item.id === shell.id)?.available ? 'available' : 'unavailable'} />}</button>)}
      </nav>
      <div className="terminal-layout">
        <section className="terminal-console">
          <header><span>{shells.find((item) => item.id === selected)?.label}</span><div>{status === 'ready' && <button onClick={() => send({ type: 'cancel' })}><Square size={13} /> Ctrl+C / cancel</button>}<button onClick={() => { setOutput(''); }}><RotateCcw size={13} /> Clear display</button></div></header>
          {status === 'copy' ? (
            <div className="copy-mode"><CircleSlash size={35} /><h2>LOCAL EXECUTION IS OFF</h2><p>This hosted page cannot reach your PowerShell, Azure CLI, or WSL. Nothing shown below is fake terminal output.</p><p>Copy an approved command, read its explanation, and run it in the named shell—or use the documented local companion.</p></div>
          ) : (
            <pre ref={outputRef} className="terminal-output" aria-live="polite">{output || 'No output yet. Connect, then run an approved command.\n'}</pre>
          )}
          <div className="terminal-input-row">
            <span>&gt;</span>
            <textarea value={command} onChange={(event) => setCommand(event.target.value)} placeholder={status === 'ready' ? 'Type a command. Enter is sent only when you choose Run.' : status === 'running' ? 'Type a response only if the running command is prompting.' : 'Connect the local companion to enable input.'} disabled={status !== 'ready' && status !== 'running'} rows={2} />
            {status === 'running' ? <button disabled={!command} onClick={() => { send({ type: 'input', data: `${command}\r` }); setCommand(''); }}><Play size={14} /> Send reply</button> : <button disabled={status !== 'ready' || !command.trim()} onClick={requestExecution}><Play size={14} fill="currentColor" /> Run</button>}
          </div>
        </section>
        <aside className="terminal-guide">
          <section><span className="eyebrow">CURRENT STATE</span><p>{message}</p></section>
          {loopback && status !== 'ready' && status !== 'connecting' && <section className="connect-panel"><label htmlFor="companion-token">One-time companion token</label><input id="companion-token" type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste token; never stored" />{selected === 'wsl-rocky' && selectedCapability?.distros?.length ? <label>Installed WSL distribution<select value={distro} onChange={(event) => setDistro(event.target.value)}>{selectedCapability.distros.map((name) => <option key={name}>{name}</option>)}</select></label> : null}<button onClick={connect}><Plug size={14} /> Connect locally</button></section>}
          <section><span className="eyebrow">QUESTION</span><p>{contextualHelp?.question ?? 'What fact will this command prove, and is this the correct shell?'}</p></section>
          <section><span className="eyebrow">COMMAND ANATOMY</span>{contextualHelp ? <ul>{contextualHelp.explanation.map((line) => <li key={line}>{line}</li>)}</ul> : <p>Choose an approved example below or read the current lesson before executing.</p>}</section>
          <section><span className="eyebrow">STATE IMPACT</span><strong className={`risk risk-${classifyCommand(command)}`}>{riskText[classifyCommand(command)]}</strong></section>
        </aside>
      </div>
      {pending && <section className="risk-gate" role="alertdialog" aria-modal="true"><AlertTriangle size={28} /><div><span className="eyebrow">EXPLICIT CHANGE CONFIRMATION</span><h2>{riskText[pending.risk]}</h2><p>SONIC detected a command that may change state. Confirm the named account/subscription, expected cost or impact, pass check, and rollback before sending it.</p><pre>{pending.command}</pre><div><button onClick={() => setPending(null)}>Cancel</button><button className="confirm-risk" onClick={() => execute(pending.command)}><Check size={14} /> I reviewed the target and rollback · Run</button></div></div></section>}
      <section className="terminal-examples"><header><span className="eyebrow">SAFE STARTING COMMANDS</span><p>Examples are help cards, not simulated output.</p></header><div>{examples.map((example) => <article key={example.command}><span>{riskText[example.risk]}</span><code>{example.command}</code><p>{example.question}</p><button onClick={async () => { setCommand(example.command); if (status !== 'ready') await navigator.clipboard.writeText(example.command); }}><Copy size={13} />{status === 'ready' ? 'Load command' : 'Copy command'}</button></article>)}</div></section>
    </section>
  );
}

function ShieldIcon() {
  return <span className="terminal-shield" aria-hidden="true"><Check size={18} /></span>;
}
