/**
 * Screen-level labels only. Never rewrite the authored steps or their hashes:
 * the picture coverage registry refers to the original source instructions.
 */
const commandLabels: [RegExp, string][] = [
  [/^\$\w+\s*=/, 'Set and check the PowerShell variables for this lab'],
  [/^Get-Command\b/i, 'Verify the administration tools are installed'],
  [/^Get-Content\b/i, 'Read the selected file without changing it'],
  [/^Get-Service\b/i, 'Check the service state before changing anything'],
  [/^Get-FileHash\b/i, 'Calculate and compare the file checksum'],
  [/^Get-ComputerInfo\b/i, 'Confirm the guest operating-system version'],
  [/^Get-ADDomain\b/i, 'Confirm the Active Directory domain identity'],
  [/^Resolve-DnsName\b/i, 'Check the DNS records the system needs'],
  [/^Test-NetConnection\b/i, 'Test network reachability to the specified port'],
  [/^Get-Item\b/i, 'Inspect the selected file or resource'],
  [/^New-Item\b/i, 'Create the specific practice folder or file'],
  [/^Test-Path\b/i, 'Confirm a practice path exists before using it'],
  [/^Set-Location\b/i, 'Switch to the intended working folder'],
  [/^ssh -V/, 'Check the locally installed SSH version'],
  [/^ssh-keygen\b/i, 'Create or inspect the SSH key pair safely'],
  [/^ssh\b/i, 'Connect to the selected Linux host using SSH'],
  [/^scp\b/i, 'Copy the practice file over SSH'],
  [/^sftp\b/i, 'Open a secure file-transfer session'],
  [/^whoami\b/i, 'Verify the signed-in Linux identity'],
  [/^hostname\b/i, 'Verify the target server before proceeding'],
  [/^hostnamectl\b/i, 'Inspect Linux host configuration'],
  [/^ip (addr|route)\b/i, 'Read the Linux network configuration'],
  [/^df -h\b/i, 'Check available filesystem capacity'],
  [/^df -i\b/i, 'Check whether filesystem inodes are available'],
  [/^lsblk\b/i, 'Identify block devices without changing disks'],
  [/^findmnt\b/i, 'Check which filesystem is mounted at each path'],
  [/^systemctl\b/i, 'Inspect the relevant Linux service or unit'],
  [/^journalctl\b/i, 'Read service journal entries for evidence'],
  [/^dnf\b/i, 'Inspect or manage software from configured repositories'],
  [/^rpm\b/i, 'Inspect installed RPM package information'],
  [/^getenforce\b/i, 'Confirm SELinux enforcement mode'],
  [/^az\b/i, 'Review the Azure CLI command before running it'],
  [/^curl\b/i, 'Download and inspect the specified remote artifact'],
  [/^sudo\b/i, 'Review the privileged Linux command and its target'],
  [/^echo\b/i, 'Display the selected test value'],
];

export function readableStepTitle(title: string, actions: string[], command?: string): string {
  if (/^Website step \d+$/i.test(title)) {
    const first = (actions[0] || '').trim().replace(/\s+/g, ' ');
    if (first) {
      // Keep the named control or destination, but avoid copying the entire
      // paragraph into a sidebar or collapsed-step header.
      const phrase = first.split(/[.;]\s/)[0].trim();
      return phrase.length > 85 ? phrase.slice(0, 82).trimEnd() + '…' : phrase;
    }
  }
  if (/^Command \d+: read, type, then check$/i.test(title)) {
    const lines = (command || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    const first = lines[0] || '';
    const match = commandLabels.find(([test]) => test.test(first));
    if (match) return match[1];
    const token = first.match(/^[A-Za-z][\w-]*/)?.[0];
    if (token) return 'Understand and run ' + token + ' on the named system';
    return 'Read the next commands and compare actual output';
  }
  return title;
}
