import type { Lesson } from './course.ts';
import type { WalkthroughStep } from './wazuh-walkthroughs.ts';

const windows =
  'Your Windows computer · Windows Terminal → PowerShell · normal user';
const portal = 'Your Windows computer · browser → https://portal.azure.com';
const endpoint =
  'Endpoint rhel9-lab-01 · connected SSH tab · RHEL Bash as rexuser';
const card = (
  title: string,
  where: string,
  actions: string[],
  expected: string,
  command?: string,
): WalkthroughStep => ({
  title,
  where,
  actions,
  expected,
  ...(command ? { command } : {}),
});

const keyPaths =
  '$SshDirectory = Join-Path $env:USERPROFILE ".ssh"\n$KeyPath = Join-Path $SshDirectory "rexuser_ed25519"\n$PublicKeyPath = "$KeyPath.pub"';

const keyCreation: WalkthroughStep[] = [
  card(
    'Choose the local folder for your key',
    windows,
    [
      'Use your own Windows computer. The folder is under your Windows user profile, not inside Documents, OneDrive or the GitHub project.',
      'Run the three lines one at a time. Join-Path joins a folder and filename. $env:USERPROFILE is your Windows user folder. The private file has no .pub ending; its public partner ends in .pub.',
      'This course uses a normal, non-FIPS RHEL image. If your workplace requires FIPS cryptography, use its approved key procedure instead; do not disable that requirement.',
    ],
    'The paths are stored in this PowerShell tab. No key has been created yet.',
    keyPaths,
  ),
  card(
    'Create the folder and check for existing keys',
    windows,
    [
      'New-Item creates a folder. -Force allows the folder to already exist. It does not give permission to replace a key.',
      'Run both Test-Path lines. False means that exact file does not exist. If either result is True, STOP. Keep the existing key and verify its ownership before deciding to reuse it. Do not run the next card over an existing key.',
    ],
    'Both file checks must say False before you generate a new pair.',
    'New-Item -ItemType Directory -Path $SshDirectory -Force\nTest-Path -LiteralPath $KeyPath\nTest-Path -LiteralPath $PublicKeyPath',
  ),
  card(
    'Generate the pair only after both checks say False',
    windows,
    [
      'ssh-keygen makes the key pair. -t ed25519 chooses the key type. -f chooses the private filename; the tool adds .pub for the public file. -C adds a label.',
      'At Enter passphrase, type a strong passphrase and press Enter. Type it again when asked. You may see no characters while typing; that is normal. Keep it in your approved password manager.',
      'If asked whether to overwrite a file, type n and press Enter, then stop. That means the previous file check needs to be repeated.',
    ],
    'The tool reports that it saved a private key and a public key at the two planned paths.',
    'ssh-keygen -t ed25519 -f "$KeyPath" -C "rexuser-rhel9-lab"',
  ),
  card(
    'Read only the public key and its fingerprint',
    windows,
    [
      'The first line prints a SHA256 fingerprint, which is a short value you can compare later. -l lists the fingerprint and -f selects the file.',
      'The second line displays the public key. It should start with ssh-ed25519. This public line is what you will paste into Azure. Never display or upload the private file without .pub.',
    ],
    'You have the public fingerprint and public-key line. Save the fingerprint in your lab notes.',
    'ssh-keygen -l -f "$PublicKeyPath"\nGet-Content -LiteralPath $PublicKeyPath',
  ),
  card(
    'Check where the private key is stored',
    'Your Windows computer · File Explorer',
    [
      'Open File Explorer. Click the address bar, type %USERPROFILE%\\.ssh and press Enter. Find rexuser_ed25519.',
      'Right-click the private file → Properties → Security. Check that access is limited to your account and the system/administrators allowed by workplace policy. If you see Everyone or a shared team group, ask the Windows administrator to correct access before using the key.',
      'Keep the key here for later lessons. Do not move it into OneDrive, a shared folder, an email, a ticket or GitHub.',
    ],
    'The private file remains on your Windows computer with restricted access.',
  ),
];

// Explanations for short read-only commands. Interactive changes have their own
// cards instead of being split into an unsafe paste-and-run sequence.
const explanations: [RegExp, string, string][] = [
  [
    /^\$\w+\s*=/,
    'This saves a value in the current PowerShell tab. It does not create an Azure resource. Replace any REPLACE_WITH text with the real value from your notes before running it.',
    'Usually no output appears. The value is now available in this tab.',
  ],
  [
    /^\$\w+(,|$)/,
    'This displays the values you saved. Read them and compare them with your lab notes.',
    'The values match your intended lab names or recorded addresses.',
  ],
  [
    /^Get-Command/,
    'Get-Command checks whether Windows can find each named tool. Commas separate the tool names.',
    'You see a result for ssh, scp, sftp and ssh-keygen. If one is missing, complete the missing-tool steps below.',
  ],
  [
    /^ssh -V$/,
    'The capital V asks SSH to show its version. This does not connect to a server.',
    'An OpenSSH version is displayed.',
  ],
  [
    /^whoami$/,
    'This prints the account you are using on Linux.',
    'The result is rexuser. Stop if you are using a different account.',
  ],
  [
    /^id$/,
    'This shows your user number and the groups your account belongs to. Groups help control permissions.',
    'The line includes rexuser. Save the actual group names instead of trying to copy an example.',
  ],
  [
    /^sudo -l$/,
    'sudo -l lists the administrator commands your account is allowed to use. If asked for a password, use the configured Linux account password, not your Azure password. Typed characters may be hidden.',
    'You see your allowed commands or a clear permission error. Do not change permissions to hide an error.',
  ],
  [
    /^hostname$/,
    'This prints the Linux computer name. Compare it with the VM you intended to use.',
    'The name agrees with that VM’s recorded guest name. Stop if you are on the wrong computer.',
  ],
  [
    /^hostnamectl$/,
    'This shows the computer name and more system details. Running it without extra options only reads information.',
    'The host information matches your lab record.',
  ],
  [
    /^cat \/etc\/redhat-release$/,
    'cat displays a file. This file records the Red Hat release installed on this computer.',
    'The output identifies Red Hat Enterprise Linux 9. Record the full release number.',
  ],
  [
    /^uname -r$/,
    'uname reports system information. -r asks for the kernel version running now.',
    'A kernel version appears. Record it exactly; it is not the same as the RHEL release number.',
  ],
  [
    /^ip addr$/,
    'ip addr lists network connections and their addresses. Look for the active connection and the inet IPv4 line.',
    'The private address matches the one recorded for this VM in Azure. It normally differs from the public IP used from home.',
  ],
  [
    /^ip route$/,
    'This shows where Linux sends network traffic. The line beginning default is the route used when no more specific route matches.',
    'A default route and the expected private network appear. Record them; do not edit them here.',
  ],
  [
    /^pwd$/,
    'pwd prints the folder you are currently in.',
    'A Linux folder path appears. At a new rexuser login it is normally /home/rexuser.',
  ],
  [
    /^ls -la$/,
    'ls lists files. -l shows details; -a includes hidden names that begin with a dot.',
    'You can see the files in your current folder, including hidden ones.',
  ],
  [
    /^lsblk$/,
    'This lists disks and their sections in a tree. Read the names, sizes and mount points.',
    'The storage matches your VM disk plan. Do not assume disk names will match a screenshot.',
  ],
  [
    /^findmnt$/,
    'This shows which storage is attached to each Linux folder.',
    'You can find the root folder / and record what backs it. A directory is not necessarily a separate disk.',
  ],
  [
    /^df -h/,
    'df checks filesystem space. -h uses readable sizes. If / follows it, only the root filesystem is requested.',
    'Read the available space and percentage used. Compare them with the installation’s storage needs.',
  ],
  [
    /^df -i$/,
    'This checks inodes: the records Linux uses to track files. These can run out even when some disk space remains.',
    'Free inodes remain. Record the percentage used.',
  ],
  [
    /^rpm -qa$/,
    'rpm reads package information. -q means query and -a means all installed packages.',
    'A package list appears. Save it as the before-installation record.',
  ],
  [
    /^systemctl list-units/,
    'This lists service units and their current state. --all also includes inactive units. A unit is something the service manager tracks.',
    'A table shows service names and states. Press q if the output opens in a full-screen viewer.',
  ],
  [
    /^systemctl list-unit-files/,
    'This lists installed service definitions. It is different from listing only running services.',
    'You can see installed service names and whether they are enabled to start. Press q if needed to leave the viewer.',
  ],
  [
    /^ps -ef$/,
    'ps lists running programs. -e includes all processes; -f adds details such as the user and command.',
    'A process list appears. A process ID is a temporary number, not a package version.',
  ],
  [
    /^systemctl is-active sshd$/,
    'This asks whether the SSH server service is currently running.',
    'The result should be active for the working SSH service. Investigate a different result before changing software.',
  ],
  [
    /^getenforce$/,
    'This reads SELinux’s current mode. SELinux is a Linux security control.',
    'Record the actual mode. Do not disable SELinux to make an exercise pass.',
  ],
  [
    /^sudo -v$/,
    'This checks your sudo access without running an installation. A password prompt may appear; typing can be hidden.',
    'The command returns without an error if your account is allowed.',
  ],
  [
    /^date -Is$/,
    'This prints the date, time and time-zone offset in a consistent format.',
    'Record the timestamp next to your results.',
  ],
  [
    /^systemctl --failed/,
    'This lists failed system services. --no-pager keeps the result in the normal terminal.',
    'Record any failed services. An empty list means no failed units were reported at this time.',
  ],
  [
    /^exit$/,
    'Type exit inside the SSH session to disconnect from Linux. It does not turn off the VM.',
    'The Windows PowerShell prompt returns. Stop the VM separately in Azure when instructed.',
  ],
];

const simpleCommandLessons = new Set([
  'assignment-v2',
  'windows-tools-v2',
  'azure-scope-v2',
  'two-host-plan-v3',
  'resource-group-v2',
  'network-plan-v2',
  'build-storage-v3',
  'key-concept-v2',
  'manager-vm-v3',
  'identity-v2',
  'host-os-v2',
  'guest-network-v2',
  'home-files-v2',
  'storage-verify-v3',
  'software-inventory-v3',
  'baseline-v2',
  'rollback-gate-v3',
  'deallocate-v2',
]);

export function beginnerWalkthrough(lesson: Lesson): Lesson {
  if (lesson.walkthrough) return lesson;
  if (lesson.id === 'key-create-v2')
    return { ...lesson, walkthrough: keyCreation };
  if (lesson.id === 'sftp-test-v3')
    return {
      ...lesson,
      walkthrough: [
        card(
          'Get ready in Windows PowerShell',
          windows,
          [
            'Use your existing local PowerShell tab. $KeyPath must point to your private key and $EndpointPublicIp must match the endpoint public address in Azure.',
            'Run Set-Location to select your Windows user folder. The practice file rexuser-transfer-v3.txt must be there from the earlier lesson.',
          ],
          'PowerShell is in your user folder and the practice file exists.',
          'Set-Location -LiteralPath $env:USERPROFILE\nTest-Path -LiteralPath ./rexuser-transfer-v3.txt',
        ),
        card(
          'Open the SFTP connection',
          windows,
          [
            'Continue only if the file check said True. -i selects the private key used to sign in; it does not upload that key.',
            'Check any server fingerprint prompt against the endpoint fingerprint recorded earlier. Stop if it differs. Enter your key passphrase if asked.',
          ],
          'The prompt changes to sftp>. You are now in the file-transfer program.',
          'sftp -i "$KeyPath" "rexuser@$EndpointPublicIp"',
        ),
        card(
          'Check the local and remote folders',
          'SFTP prompt · sftp>',
          [
            'Run each command separately. lpwd shows the Windows folder; pwd shows the folder on Linux. ls -l lists the remote files.',
            'Look for rexuser-transfer-sftp-v3.txt. If it already exists, stop and inspect it before replacing it. The next command can overwrite that name.',
          ],
          'The Windows folder contains your source file. The remote destination name is unused.',
          'lpwd\npwd\nls -l',
        ),
        card(
          'Upload the practice file',
          'SFTP prompt · sftp>',
          [
            'put uploads a file. The first filename is on Windows; the second path is on the endpoint.',
            'Run this only after the filename check. Wait for the transfer to finish.',
          ],
          'The upload finishes without an error.',
          'put rexuser-transfer-v3.txt /home/rexuser/rexuser-transfer-sftp-v3.txt',
        ),
        card(
          'Check the uploaded name, then leave SFTP',
          'SFTP prompt · sftp>',
          [
            'ls -l shows the uploaded file’s details. Check the owner, name and size.',
            'Then type bye. This leaves SFTP and returns to Windows; it does not stop the VM.',
          ],
          'You see the new file, then the PS prompt returns.',
          'ls -l /home/rexuser/rexuser-transfer-sftp-v3.txt\nbye',
        ),
        card(
          'Reconnect with SSH to check the contents',
          windows,
          [
            'Run SSH from PowerShell. Use the same endpoint and trusted key. Do not type this at sftp>.',
          ],
          'You are signed in to the endpoint as rexuser.',
          'ssh -i "$KeyPath" -o IdentitiesOnly=yes "rexuser@$EndpointPublicIp"',
        ),
        card(
          'Compare the file with the Windows original',
          endpoint,
          [
            'Check hostname first. file should report text. sha256sum calculates the checksum.',
            'Compare every checksum character with the Windows SHA-256 recorded earlier. Letter case does not matter. Stop and investigate any mismatch.',
          ],
          'The file is text and its SHA-256 matches the Windows original.',
          'hostname\nfile /home/rexuser/rexuser-transfer-sftp-v3.txt\nsha256sum /home/rexuser/rexuser-transfer-sftp-v3.txt',
        ),
      ],
    };
  if (lesson.id === 'scp-test-v3')
    return {
      ...lesson,
      walkthrough: [
        card(
          'Check the destination before copying',
          endpoint,
          [
            'Use your existing SSH connection to the endpoint. Run hostname and confirm the right computer.',
            'The test below prints EXISTS or AVAILABLE. If it says EXISTS, stop and inspect that file before deciding to replace it. SCP can overwrite it.',
          ],
          'You are on the endpoint and the intended filename is available.',
          'hostname\nif test -e /home/rexuser/rexuser-transfer-v3.txt; then echo EXISTS; else echo AVAILABLE; fi',
        ),
        card(
          'Return to local Windows PowerShell',
          windows,
          [
            'Use your local PowerShell tab, not the connected Linux tab. $TestFile must be the text file created earlier, $KeyPath must be your local key, and $EndpointPublicIp must be the endpoint address.',
            'Display these three values. Make sure the source is the harmless text file, not the private key.',
          ],
          'The file, key path and endpoint address match your notes.',
          '$TestFile\n$KeyPath\n$EndpointPublicIp',
        ),
        card(
          'Copy the text file',
          windows,
          [
            'scp copies a file. -i chooses the key for sign-in. The next argument is the file to upload. The last argument gives the Linux user, computer and destination path.',
            'Check any fingerprint prompt against the recorded endpoint fingerprint. Enter the key passphrase if asked. Wait for completion.',
          ],
          'The transfer finishes. The next lesson checks the received contents; do not skip it.',
          lesson.command,
        ),
      ],
    };
  const steps: WalkthroughStep[] = [];
  if (/Windows.*PowerShell/.test(lesson.shell) && !/→/.test(lesson.shell)) {
    steps.push(
      card(
        'Open the correct PowerShell tab',
        windows,
        [
          'Use PowerShell on your own Windows computer. The opening instructions below each WHERE label show how to find it. These are not Azure Cloud Shell commands.',
          'If this lesson uses a variable from an earlier lesson, keep that same PowerShell tab open. A variable starts with $. If you reopened PowerShell, repeat the earlier value-setting lines using your saved notes. Never guess an address or paste REPLACE_WITH text unchanged.',
        ],
        'You see PS followed by a Windows folder path, and the values needed for this lesson are available.',
      ),
    );
  }
  const commands = simpleCommandLessons.has(lesson.id)
    ? lesson.command.split('\n').filter((line) => line.trim())
    : [lesson.command];
  const commandLocation = /^RHEL 9 · Bash · rexuser$/.test(lesson.shell)
    ? endpoint
    : lesson.shell;
  const commandCards = commands.map((command, index) => {
    const explanation = explanations.find(([pattern]) => pattern.test(command));
    return card(
      `Command ${index + 1}: read, type, then check`,
      commandLocation,
      explanation ? [explanation[1]] : lesson.args,
      explanation ? explanation[2] : lesson.expected,
      command,
    );
  });
  const clickCards = (lesson.portal ?? []).map((action, index) =>
    card(
      `Website step ${index + 1}`,
      portal,
      action.split(/(?<=[.!?])\s+(?=[A-Z])/),
      'Check the named resource and settings before the next step. If the page shows an error, stop and read it before continuing.',
    ),
  );
  // These lessons record addresses/choices that only exist after the clicks.
  if (['azure-scope-v2', 'manager-vm-v3'].includes(lesson.id))
    steps.push(...clickCards, ...commandCards);
  else steps.push(...commandCards, ...clickCards);
  if (lesson.followup)
    steps.push(
      card(
        'Switch to the next app before continuing',
        lesson.followup.shell,
        lesson.followup.args,
        lesson.expected,
        lesson.followup.command,
      ),
    );
  if (lesson.id === 'windows-tools-v2')
    steps.push(
      card(
        'If a tool is missing, add OpenSSH Client',
        'Your Windows computer · Settings',
        [
          'Click Start → Settings. Search within Settings for Optional features and open that page. Click View features or Add a feature, depending on your Windows version.',
          'Search for OpenSSH Client. Select its checkbox → Next → Add or Install. Choose Client, not OpenSSH Server. If your work computer blocks installation, ask its administrator to install it.',
          'Wait for installation to finish. Close and reopen PowerShell. Repeat Get-Command and ssh -V from the earlier cards. Re-enter any saved variables you still need.',
        ],
        'All four tools are found. If they were already present, skip this installation branch.',
      ),
    );
  steps.push(
    card(
      'Check the result and save your notes',
      lesson.shell,
      [lesson.verify],
      lesson.expected,
    ),
  );
  return { ...lesson, walkthrough: steps };
}
