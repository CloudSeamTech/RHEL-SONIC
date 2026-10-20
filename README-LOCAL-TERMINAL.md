# SONIC local LAB TERMINAL

The hosted Cloudflare Worker cannot and must not execute commands on a learner's
computer. It displays copy/help cards only. Live execution is an explicit local
workflow with two separately started processes:

1. Run SONIC locally from the repository root.
2. Run the local companion from `local-companion/`.
3. Paste the companion's one-time token into the LAB TERMINAL. The token remains
   in page memory and is not placed in a URL or browser storage.

## Prerequisites

- Windows 10 1809+ or Windows 11 for ConPTY-backed terminal sessions.
- Node.js 22.13 or later.
- PowerShell (`pwsh.exe` preferred; Windows PowerShell is the fallback).
- Azure CLI installed on Windows for the Azure CLI tab.
- WSL only for the Linux tab. SONIC enumerates the distributions actually
  returned by `wsl.exe --list --quiet`; it does not assume `RLCPlus-9` exists.

## Install and run

From the repository root:

```powershell
npm ci
npm run dev
```

In a second PowerShell window:

```powershell
Set-Location .\local-companion
npm install
npm start
```

Open the local URL printed by SONIC, select **Agency-to-Azure Migration → LAB
TERMINAL**, paste the one-time token printed by the companion, choose a tab,
and select **Connect locally**.

The companion binds only to `127.0.0.1:43127`. The browser must also be loaded
from `localhost`, `127.0.0.1`, or IPv6 loopback before the UI offers live mode.

## Shell tabs

- **Windows PowerShell** starts an allowlisted PowerShell executable under the
  current Windows account.
- **Azure CLI in Windows PowerShell** starts the same PowerShell environment
  only when `az version` proves Azure CLI is installed. The learner still must
  authenticate and verify cloud/subscription context.
- **Linux / WSL** starts only a selected distro returned by WSL discovery.
  SONIC does not install, unregister, or rename WSL distributions.

## What was tested in this development environment

The automated suite validates protocol, loopback/origin/token security,
capability discovery and command-risk behavior. A real authenticated companion
session ran `Get-Date` through a Windows ConPTY and returned real output. Azure
CLI was present, but the managed test environment denied access to the user's
`.azure` profile, so `az version` through the companion was **not** claimed as a
passing integration test. WSL enumeration also returned access denied, so a
live Rocky Linux session was **not** claimed as tested. Run the remaining
acceptance commands below on the actual learner workstation:

```text
Windows PowerShell: Get-Date
Azure CLI tab:      az version
WSL tab:            cat /etc/os-release
```

Real output and exit status must appear. If a capability is missing, the tab
must remain unavailable; it must never display canned success output.

## Stop the companion

Press `Ctrl+C` in the companion PowerShell window. Active child terminals are
terminated. Closing the browser socket also terminates its PTY session.

## AlmaLinux in VMware

The WSL selector does not attach to VMware. Use GNOME Terminal inside the AlmaLinux guest for its actual Bash results. For remote access, enable sshd intentionally in the guest, allow SSH only on the required private firewall zone, verify the ED25519 host-key fingerprint from the VM console, then connect with Windows OpenSSH using the actual username and guest IP. NAT does not require a public port forward for host-to-guest access.

The SONIC text panel can relay simple prompts; it is not a full-screen terminal emulator. Native PowerShell/OpenSSH is recommended for full interactive SSH, editors, and terminal games. The AlmaLinux desktop pathway includes a guided real-terminal class. The hosted URL stays copy/help mode; do not weaken origin/token checks to connect it directly to a local shell.
