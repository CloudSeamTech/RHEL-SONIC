/** Break prose into smaller reading units without changing paths, decimals, or commands. */
export function smallActions(value: string): string[] {
  return value
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((line) => line.trim())
    .filter(Boolean);
}
export const everydayWords = [
  ['VM', 'A practice computer that runs inside your real computer.'],
  [
    'Host',
    'The real computer running VMware. A remote host can also mean the computer you connect to.',
  ],
  ['Guest', 'The practice computer running inside VMware.'],
  ['Terminal', 'An app where you type commands and read the computer’s reply.'],
  [
    'sudo',
    'Run one Linux command with administrator permission. Read it first.',
  ],
  [
    'Mount',
    'Make a drive’s files available in a folder. This does not erase the drive.',
  ],
  [
    'Format',
    'Create a new filesystem. This erases existing data on the selected volume.',
  ],
  [
    'Repository',
    'A software source your package manager uses to find apps and updates.',
  ],
  ['DNS', 'The service that finds a computer’s IP address from its name.'],
  ['IP address', 'A network address used to reach a computer.'],
  [
    'Domain controller (DC)',
    'A Windows server that checks domain accounts and shares domain information.',
  ],
  [
    'Active Directory (AD)',
    'A directory of accounts, computers, and rules for a Windows domain.',
  ],
  [
    'GPO',
    'A set of Windows settings that can apply to chosen users or computers.',
  ],
  [
    'ISO',
    'A file containing an installation disc, which you can attach to a VM.',
  ],
  [
    'Backup',
    'A separate copy you can use to recover your files. Test that it restores.',
  ],
  ['Partition', 'A section of a disk that can hold a filesystem.'],
  ['UUID', 'A long identifier used to recognize a particular filesystem.'],
  ['DNF', 'AlmaLinux’s tool for installing and updating system software.'],
  [
    'Flatpak',
    'A way to install desktop apps with their own runtimes and permissions.',
  ],
  [
    'Proton',
    'A Steam compatibility tool that lets some Windows games run on Linux.',
  ],
  ['Verify', 'Check your own result before saying the task is finished.'],
] as const;
