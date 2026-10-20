import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function commandExists(command, args = ['--version']) {
  try {
    await execFileAsync(command, args, { windowsHide: true, timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}

async function azureCliAvailable(powershell) {
  if (!powershell) return false;
  try {
    await execFileAsync(
      powershell,
      ['-NoLogo', '-NoProfile', '-Command', 'Get-Command az -ErrorAction Stop | Out-Null'],
      { windowsHide: true, timeout: 8000 },
    );
    return true;
  } catch {
    return false;
  }
}

export async function listWslDistros() {
  if (process.platform !== 'win32') return [];
  try {
    const { stdout } = await execFileAsync('wsl.exe', ['--list', '--quiet'], {
      windowsHide: true,
      timeout: 10000,
      encoding: 'utf8',
    });
    return stdout
      .replaceAll('\u0000', '')
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function shellCapabilities() {
  const powershell = process.platform === 'win32'
    ? (await commandExists('pwsh.exe')) ? 'pwsh.exe' : 'powershell.exe'
    : (await commandExists('pwsh')) ? 'pwsh' : null;
  const azure = process.platform === 'win32'
    ? await azureCliAvailable(powershell)
    : await commandExists('az', ['version']);
  const distros = await listWslDistros();
  return [
    { id: 'windows-powershell', label: 'Windows PowerShell', available: Boolean(powershell), detail: powershell ? `Runs ${powershell} as the current Windows user.` : 'PowerShell was not found.', executable: powershell, args: ['-NoLogo'] },
    { id: 'azure-cli', label: 'Azure CLI in Windows PowerShell', available: Boolean(powershell && azure), detail: azure ? 'Runs the installed Azure CLI inside the current-user PowerShell session.' : 'Azure CLI was not found in the PowerShell environment.', executable: powershell, args: ['-NoLogo'] },
    { id: 'wsl-rocky', label: 'Linux through WSL', available: distros.length > 0, detail: distros.length ? 'Choose one of the distributions reported by WSL.' : 'No WSL distribution could be enumerated.', executable: 'wsl.exe', args: [], distros },
  ];
}

export function spawnSpec(capability, requestedDistro) {
  if (!capability?.available || !capability.executable) throw new Error('Requested shell is not available.');
  if (capability.id === 'wsl-rocky') {
    if (!requestedDistro || !capability.distros.includes(requestedDistro)) throw new Error('Requested WSL distribution is not installed.');
    return { file: 'wsl.exe', args: ['--distribution', requestedDistro] };
  }
  return { file: capability.executable, args: capability.args };
}
