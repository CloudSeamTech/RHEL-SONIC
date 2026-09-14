import type { Lesson } from './course.ts';
import type { WalkthroughStep } from './wazuh-walkthroughs.ts';

const windows =
  'Your own Windows computer · Windows Terminal → PowerShell · normal user';
const manager = 'Wazuh manager · connected RHEL Bash session · rexuser';

export const sshPermissionHelp: WalkthroughStep[] = [
  {
    title: 'Read the error before choosing a fix',
    where: windows,
    actions: [
      'UNPROTECTED PRIVATE KEY FILE, permissions are too open, or Load key: bad permissions means Windows SSH rejected the local private-key file. Use the key-permission steps below for that error.',
      'Connection timed out means start with the VM power state, correct IP, inbound TCP 22 rule and network route. Connection refused usually means the destination was reached but no service accepted the port, or a device actively rejected it. Changing key permissions will not fix those problems.',
      'Permission denied (publickey) by itself has several possible causes: wrong account, wrong key, missing authorized public key, server permissions or server policy. Check the actual VM build record. Do not guess another username or open SSH to everyone.',
      'A host fingerprint prompt is a separate check. Compare it with the fingerprint obtained through the earlier Azure Run Command lesson before accepting. A changed or unfamiliar fingerprint is not permission to type yes automatically.',
    ],
    expected:
      'You have identified the exact error and chosen the matching troubleshooting branch.',
  },
  {
    title: 'Find your Windows account, computer name and exact key file',
    where: windows,
    actions: [
      'Run whoami to see the signed-in Windows account. $env:COMPUTERNAME shows the computer’s name, not the processor model. Windows uses a SID, a stable account number, to identify the account even if its display name changes.',
      'At the path prompt, enter the full path to the private key you already use. Do not include extra quote characters in the answer. The commands quote the variable for you, so spaces in a folder name are handled.',
      'The private key may end in .pem or have no extension. Do not select its .pub partner. Never paste the key’s contents into the course or a support ticket.',
    ],
    command:
      'whoami\n$env:COMPUTERNAME\n$SonicUserSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value\n$SonicUserSid\n$SonicKey = Read-Host "Full path to your existing private key"\nif (-not (Test-Path -LiteralPath $SonicKey -PathType Leaf)) { throw "File not found: stop" }\n$SonicKey = (Resolve-Path -LiteralPath $SonicKey).Path',
    expected:
      'The Windows account and key path are correct. No permission has changed.',
  },
  {
    title: 'Inspect the owner and who can read the key',
    where: windows,
    actions: [
      'icacls lists the file’s permission entries. R means read, W means write, M means modify, F means full control, and I means inherited from the parent folder. Inheritance means a file receives permissions from its folder.',
      'Get-Acl shows the owner and a table of entries. Allow gives access; Deny blocks access. Check the file itself and its parent folder. Removing inheritance does not remove permissions that were added directly to the file.',
      'For your personal client key, use your own account as owner and restrict access to that account under workplace policy. Reading is enough for SSH to use it. Other ordinary users or shared groups should not read it. Do not copy Windows SSH server authorized_keys permission recipes onto this personal private key.',
      'If the owner is another account, the file is centrally managed, or access is denied, stop and ask the Windows administrator to repair this exact file. Do not take ownership of a folder tree. If elevation is required, reopen PowerShell with Run as administrator under the intended identity and recheck whoami first.',
      'Keep keys under %USERPROFILE%\\.ssh, outside OneDrive and the repository. If this key is in a synced/shared folder, arrange a move to that local folder while preserving working access. After moving it, repeat the path-selection and inspection cards with its new path before continuing. Moving it does not erase older shared or cloud copies; replace an exposed key through your normal key-rotation process.',
    ],
    command:
      'icacls "$SonicKey"\n$SonicKeyFolder = [System.IO.Path]::GetDirectoryName($SonicKey)\nicacls "$SonicKeyFolder"\n(Get-Acl -LiteralPath $SonicKey).Owner\n(Get-Acl -LiteralPath $SonicKey).Access | Select-Object IdentityReference, FileSystemRights, AccessControlType, IsInherited',
    expected:
      'You know the owner, your account SID and the exact unwanted entries before changing anything.',
  },
  {
    title: 'Save the current permissions before editing',
    where: windows,
    actions: [
      'This saves permission information, not the private-key contents. Keep the backup path in your local notes. /save saves the file’s access list; it is not a backup of the key and does not save its owner.',
      'Push-Location temporarily opens the key’s parent folder so the saved filename can be restored to the same folder later. Pop-Location returns to your previous folder.',
      'If saving fails, stop. Do not continue with an unknown recovery path.',
    ],
    command:
      '$SonicAclFolder = Join-Path $env:LOCALAPPDATA "SONIC"\nNew-Item -ItemType Directory -Path $SonicAclFolder -Force | Out-Null\n$SonicAclBackup = Join-Path $SonicAclFolder ("key-acl-" + [guid]::NewGuid().ToString() + ".txt")\n$SonicKeyName = [System.IO.Path]::GetFileName($SonicKey)\nPush-Location -LiteralPath $SonicKeyFolder\nicacls "$SonicKeyName" /save "$SonicAclBackup"\n$SonicAclSaved = $LASTEXITCODE\nPop-Location\nif ($SonicAclSaved -ne 0) { throw "ACL backup failed: stop" }\n$SonicAclBackup',
    expected:
      'The permission backup was saved successfully and its path is recorded.',
  },
  {
    title: 'Give your own account read access, then remove inherited entries',
    where: windows,
    actions: [
      'Use this only for the personally owned key checked above. Run one line at a time. /grant:r replaces the explicit Allow entry for this SID only. It does not remove other users, groups or Deny entries.',
      'The * tells icacls that the value is a numeric SID. R gives read access. Adding your explicit entry first avoids removing your only inherited access.',
      '/inheritance:r turns off inheritance and removes inherited entries from this file. It does not touch every file in the folder. Stop on any error.',
    ],
    command:
      'icacls "$SonicKey" /grant:r "*${SonicUserSid}:(R)"\nif ($LASTEXITCODE -ne 0) { throw "Grant failed: stop" }\nicacls "$SonicKey" /inheritance:r\nif ($LASTEXITCODE -ne 0) { throw "Inheritance change failed: stop" }\nicacls "$SonicKey"',
    expected:
      'Your explicit read entry exists. Review any remaining explicit entries in the next step.',
  },
  {
    title: 'Remove only a confirmed unwanted explicit entry',
    where: windows,
    actions: [
      'If the permission list still shows an unwanted account or group, copy its exact SID from the error or identify it with the Windows administrator. Do not enter your own SID. Do not remove entries from a whole folder tree.',
      'S-1-5-32 identifies the Windows BUILTIN domain; it is not a universal name for every built-in group. Use the exact offending entry shown for your file. Do not copy another person’s account SID from a screenshot.',
      'The command below removes entries for the chosen SID only. Run it once per reviewed unwanted entry, then inspect the list again. If the remaining entries are unclear or policy-managed, use the administrator rather than guessing.',
      'GUI alternative: File Explorer → the exact key → right-click → Properties → Security → Advanced. Check Owner. Select only an unwanted permission entry → Remove. Keep your account’s Read entry → Apply → OK. Inspect again. Do not reset the whole folder.',
      'Do not use /reset as the normal fix: it replaces the file’s permissions with inherited defaults and can make the key readable by others again.',
    ],
    command:
      '$SonicRemoveSid = Read-Host "Exact SID of ONE confirmed unwanted entry"\nif ($SonicRemoveSid -eq $SonicUserSid -or $SonicRemoveSid -notmatch "^S-1-[0-9-]+$") { throw "Invalid or current-user SID: stop" }\nicacls "$SonicKey" /remove "*$SonicRemoveSid"\nif ($LASTEXITCODE -ne 0) { throw "Removal failed: stop" }\nicacls "$SonicKey"',
    expected:
      'Only the intended personal-key access remains. No shared group or unrelated user can read the key.',
  },
  {
    title: 'Try SSH again with the recorded Linux username',
    where: windows,
    actions: [
      'Enter the VM’s current public IP and the Linux username from its creation record. This course uses rexuser. If your own VM was created with a different name, use the verified name—not a guess based on the error.',
      'Keep the path in quotes. -i selects this private key; IdentitiesOnly=yes prevents SSH from trying unrelated keys. Verify any host fingerprint against trusted notes. A passphrase prompt unlocks the local key; it is not an Azure password prompt.',
      'If the too-open warning is gone but Permission denied remains, the local file fix worked and another check is needed. Verify the selected public key was installed for the recorded Linux account, then inspect that account’s server-side SSH settings through the approved recovery route. Do not disable host checking or switch usernames blindly.',
    ],
    command:
      '$SonicVmAddress = Read-Host "VM public IP from Azure"\n$SonicVmUser = Read-Host "Linux username from the VM build record"\nssh -i "$SonicKey" -o IdentitiesOnly=yes "$SonicVmUser@$SonicVmAddress"',
    expected:
      'The local key warning is gone. A successful Linux login is verified separately with whoami and hostname.',
  },
  {
    title: 'If a permission edit goes wrong, restore the saved access list',
    where: windows,
    actions: [
      'This is a recovery branch, not a routine step after a successful repair. Use the exact same parent folder and saved ACL file. If you reopened PowerShell, enter their recorded paths again first.',
      'Restoring the old access list may also restore the original too-open problem. It returns you to the saved state so you can diagnose safely; it does not promise SSH will work. It does not restore an owner change.',
      'If you can no longer read or manage the file, ask the Windows administrator to restore the saved access list for this exact file. Do not reset permissions recursively on your profile or .ssh directory.',
    ],
    command:
      'icacls "$SonicKeyFolder" /restore "$SonicAclBackup"\nif ($LASTEXITCODE -ne 0) { throw "Restore failed: ask the Windows administrator" }\nicacls "$SonicKey"',
    expected:
      'The saved access list is restored, or the exact restore error is recorded for the administrator.',
  },
];

export const dashboardSubnetHelp: WalkthroughStep[] = [
  {
    title: 'Choose one device or an approved subnet',
    where: 'Work Windows computer · network plan',
    actions: [
      'One IPv4 address uses /32, such as 192.0.2.50/32. A subnet is a range, such as 10.20.30.0/24. These are examples only. Get the real source range and approval from the network owner.',
      'A vSphere port group is not itself an IP subnet. Confirm the VLAN, subnet and routing used by the VMs attached to it. Allowing a subnet allows any device with a matching source address, not just VMs with a particular port-group name.',
      'If the manager also runs in vSphere, there is no Azure NSG on that VM. Review RHEL firewalld and the actual network/NSX firewalls. If the manager is in Azure, also review its NSGs.',
      'With private routed connectivity to Azure, use the private source range only if that range is actually preserved. With a public internet connection, Azure normally sees the company firewall’s translated public address. Use the confirmed public address or addresses, not an unreachable private range. One shared public address can represent devices outside the intended port group too.',
    ],
    expected:
      'You know the source address the manager really sees. You are changing dashboard HTTPS access only, not SSH access.',
  },
  {
    title: 'Inspect the RHEL firewall before adding a rule',
    where: manager,
    actions: [
      'Keep your working administration connection open. Run the checks below. Confirm firewalld is running and identify the active zone for dashboard traffic. A source-based zone can take precedence over an interface zone, so review both. Do not assume the zone is public.',
      'Write down existing runtime and permanent settings. Look for broad HTTPS service entries, port 443 openings, rich rules, policies, or trusted zones. Adding a narrow Allow rule does not cancel a broader Allow rule.',
    ],
    command:
      'hostname\nsudo firewall-cmd --state\nsudo firewall-cmd --get-active-zones\nsudo firewall-cmd --list-all-zones\nsudo firewall-cmd --permanent --list-all-zones',
    expected:
      'You know the correct zone and existing rules. If the firewall is not running, review the actual firewall system before proceeding.',
  },
  {
    title: 'Add one temporary HTTPS rule',
    where: manager,
    actions: [
      'At the first prompt, enter the verified zone name. At the second, choose either one actual address ending in /32 or the approved actual subnet range. Use only one choice for this change.',
      'The same command handles both choices. For example, source address="192.0.2.50/32" selects one address, while source address="10.20.30.0/24" selects that subnet. The port remains 443 and the protocol remains TCP.',
      'This first rule is runtime-only and expires after ten minutes. Do not add a public-wide source. The checks below only confirm the rule was added; they do not prove other sources are blocked.',
    ],
    command: [
      'read -r -p "Verified firewalld zone: " SONIC_ZONE',
      'read -r -p "Approved source IPv4/32 OR subnet/CIDR: " SONIC_SOURCE',
      'printf -v SONIC_HTTPS_RULE \'rule family="ipv4" source address="%s" port port="443" protocol="tcp" accept\' "$SONIC_SOURCE"',
      'sudo firewall-cmd --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_HTTPS_RULE" --timeout=10m',
      'sudo firewall-cmd --zone="$SONIC_ZONE" --query-rich-rule="$SONIC_HTTPS_RULE"',
    ].join('\n'),
    expected:
      'The rule is accepted and query returns yes. Do not continue if a command reports an error.',
  },
  {
    title: 'Match the network rule and test from real clients',
    where: 'Work Windows computer · browser and approved network console',
    actions: [
      'For an Azure manager: open Azure → the manager VM → Networking → its actual network security group → Inbound security rules. Open the existing dashboard TCP 443 rule. Save its old source in your notes. Set Source to IP Addresses and enter the actual source address/range selected above. Keep TCP 443 and Allow. Save. Do not edit the SSH rule or reuse an occupied priority for a second rule.',
      'For a vSphere manager: ask the network owner to allow the same source-to-manager TCP 443 path in the firewall or NSX policy that actually applies. A port-group setting alone is not a dashboard firewall rule.',
      'From an allowed client, open the dashboard URL and verify its certificate before sign-in. For a subnet, test more than one intended client. Also test an approved client outside the allowed range. If it can still connect, inspect the broader existing rules; the new narrow rule is not an exclusive restriction.',
      'Do not save the temporary RHEL change permanently until allowed clients work and the intended restrictions are confirmed. If it expires while you investigate, that is expected; review the result before re-adding it.',
    ],
    expected:
      'Allowed clients can reach HTTPS. An approved outside-range test confirms the intended restriction. SSH remains available.',
  },
  {
    title: 'Save the tested rule, or undo this change',
    where: manager,
    actions: [
      'Success branch: run the permanent add below only after the client tests pass. It saves this rule for future reloads/restarts. The temporary runtime rule still expires, so schedule a controlled reload from the reviewed permanent configuration and retest. Keep recovery access; a reload also discards other runtime-only changes.',
      'Failure branch: do not run the save command. Let the temporary rule expire, or remove this exact runtime rule using --remove-rich-rule="$SONIC_HTTPS_RULE" with the same zone. Restore the old source in the network/NSG rule if that was changed.',
      'To remove this saved rule later, use sudo firewall-cmd --permanent --zone="$SONIC_ZONE" --remove-rich-rule="$SONIC_HTTPS_RULE", then follow the controlled reload and test procedure. Remove only a rule added by this change. Do not remove an old working single-IP rule until the new approved access is verified.',
    ],
    command:
      'sudo firewall-cmd --permanent --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_HTTPS_RULE"\nsudo firewall-cmd --permanent --zone="$SONIC_ZONE" --query-rich-rule="$SONIC_HTTPS_RULE"',
    expected:
      'The exact approved rule is saved. The next card applies and checks the permanent configuration.',
  },
  {
    title: 'Apply the reviewed permanent rules and check again',
    where: manager,
    actions: [
      'Proceed only on the successful save branch and in the approved change window. Check the permanent configuration, then reload. Keep the console/recovery path ready.',
      'Confirm the rich rule is present again and repeat the allowed and outside-range browser tests. Record the final source range, zone and network rule. A firewall rule permits a connection; dashboard users still need their own approved sign-in access.',
    ],
    command:
      'sudo firewall-cmd --check-config\n# Continue only if configuration validation succeeds.\nsudo firewall-cmd --reload\nsudo firewall-cmd --zone="$SONIC_ZONE" --query-rich-rule="$SONIC_HTTPS_RULE"',
    expected:
      'The permanent rule is active after reload and the client tests still pass.',
  },
];

export function withAccessHelp(lesson: Lesson): Lesson {
  if (['key-create-v2', 'first-ssh-v2', 'paired-access-v3'].includes(lesson.id))
    return {
      ...lesson,
      helpSections: [
        {
          title: 'SSH blocked? Check Windows key permissions and login errors',
          steps: sshPermissionHelp,
        },
      ],
      sources: [...new Set([...lesson.sources, 'windowsAcl'])],
    };
  if (lesson.id === 'wazuh-dashboard-v4')
    return {
      ...lesson,
      helpSections: [
        {
          title: 'At work: allow one IP or a whole subnet to the dashboard',
          steps: dashboardSubnetHelp,
        },
      ],
      sources: [...new Set([...lesson.sources, 'rhelFirewall'])],
    };
  return lesson;
}
