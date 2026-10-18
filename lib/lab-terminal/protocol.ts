export const terminalProtocolVersion = 1;
export const companionPort = 43127;
export const companionPath = '/v1/terminal';

export type ShellId = 'windows-powershell' | 'azure-cli' | 'wsl-rocky';
export type ClientMessage =
  | { type: 'authenticate'; token: string; protocol: 1 }
  | { type: 'open'; shellId: ShellId; columns: number; rows: number; distro?: string }
  | { type: 'run'; command: string }
  | { type: 'input'; data: string }
  | { type: 'resize'; columns: number; rows: number }
  | { type: 'cancel' }
  | { type: 'close' };

export type ServerMessage =
  | { type: 'authenticated'; protocol: 1; shells: ShellCapability[] }
  | { type: 'opened'; sessionId: string; shellId: ShellId }
  | { type: 'output'; data: string }
  | { type: 'command-exit'; exitCode: number }
  | { type: 'exit'; exitCode: number | null; signal?: number }
  | { type: 'error'; code: string; message: string };

export type ShellCapability = {
  id: ShellId;
  label: string;
  available: boolean;
  detail: string;
  distros?: string[];
};

export function isLoopbackHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

export function companionWebSocketUrl(hostname: string) {
  if (!isLoopbackHostname(hostname)) return null;
  return `ws://127.0.0.1:${companionPort}${companionPath}`;
}
