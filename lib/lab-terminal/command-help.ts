import type { ShellId } from './protocol';

export type CommandRisk = 'read-only' | 'changes-local' | 'changes-cloud' | 'destructive';

export type CommandHelp = {
  shellId: ShellId;
  command: string;
  question: string;
  explanation: string[];
  risk: CommandRisk;
};

export const commandHelp: CommandHelp[] = [
  {
    shellId: 'windows-powershell',
    command: 'Get-Date',
    question: 'Is this a real PowerShell session, and what time does Windows report?',
    explanation: ['Get is the PowerShell verb for reading information.', 'Date is the time/date object being requested.'],
    risk: 'read-only',
  },
  {
    shellId: 'azure-cli',
    command: 'az version',
    question: 'Which Azure CLI version is actually installed on this Windows workstation?',
    explanation: ['az starts Azure CLI inside Windows PowerShell.', 'version reads installed client and extension versions; it does not change Azure.'],
    risk: 'read-only',
  },
  {
    shellId: 'azure-cli',
    command: 'az account show',
    question: 'Which Azure subscription and tenant would receive a later command?',
    explanation: ['account selects Azure account context.', 'show reads the current context. Review it before any create/update/delete operation.'],
    risk: 'read-only',
  },
  {
    shellId: 'wsl-rocky',
    command: 'cat /etc/os-release',
    question: 'Which Linux distribution is this WSL shell actually running?',
    explanation: ['cat reads the named text file.', '/etc/os-release is the standard operating-system identity file.'],
    risk: 'read-only',
  },
];

export function classifyCommand(command: string): CommandRisk {
  const value = command.trim().toLowerCase();
  if (!value) return 'read-only';
  if (/\b(rm\s+-rf|remove-item\s+.*-recurse|format-|clear-disk|diskpart|shutdown|stop-computer)\b/.test(value)) return 'destructive';
  if (/\baz\s+[^\r\n]*(create|delete|update|set|start|stop|restart|deallocate|role assignment)\b/.test(value)) return 'changes-cloud';
  if (/\b(new-|set-|remove-|install-|uninstall-|mkdir|touch|mv|cp|dnf\s+(install|remove|upgrade))\b/.test(value)) return 'changes-local';
  return 'read-only';
}

export function helpFor(shellId: ShellId, command: string) {
  return commandHelp.find(
    (item) => item.shellId === shellId && item.command.toLowerCase() === command.trim().toLowerCase(),
  );
}
