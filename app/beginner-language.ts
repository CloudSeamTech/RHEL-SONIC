import type { Lesson } from './course.ts';

// These short introductions are the main lesson text. Keep the exact commands,
// safety gates and vendor references in the lesson itself.
type Introduction = [goal: string, why: string, change: string];
const introductions: Record<string, Introduction> = {
  'assignment-v2': [
    'Make a notebook for the lab and write down the names you will use.',
    'Good notes help you avoid changing the wrong computer. They also tell you what to fix if something goes wrong.',
    'Write down a plan. The PowerShell lines only remember names in this window; they do not create anything in Azure.',
  ],
  'windows-tools-v2': [
    'Check that your Windows computer has the four tools used in this course.',
    'SSH lets you type commands on another computer. SCP copies a file. SFTP lets you browse and copy files. ssh-keygen makes or checks keys used to sign in.',
    'Check the tools on Windows. You are not connecting to Linux yet.',
  ],
  'azure-scope-v2': [
    'Choose the right Azure account and subscription, then set a spending plan.',
    'A subscription is the account that pays for Azure resources. Choosing the wrong one can put the lab and its charges in the wrong place.',
    'Look at your Azure account and prices. Record the choices before creating a VM.',
  ],
  'two-host-plan-v3': [
    'Plan two Linux computers: the manager and the endpoint.',
    'The manager receives security information. The endpoint sends it. The manager needs more memory and processing power, so the two computers should not use the same size just because that is easier.',
    'Add both computers and their expected costs to your notes. Do not create the second computer yet.',
  ],
  'resource-group-v2': [
    'Create one resource group named rg-rhel9-lab for this lab.',
    'A resource group keeps related Azure resources together. That makes them easier to find and review. Deleting the group can delete everything in it, so keep work systems out of it.',
    'Create the empty group. Choose this same group in later lab forms. Keep recovery copies elsewhere if they must survive deleting the lab.',
  ],
  'network-plan-v2': [
    'Create a private Azure network and one smaller section inside it.',
    'A virtual network, or VNet, lets the lab computers communicate. A subnet is a smaller address range inside that network.',
    'Create vnet-rhel9-lab with subnet snet-rhel9-lab. The PowerShell lines write down the names and address ranges; the website clicks create them.',
  ],
  'build-storage-v3': [
    'Choose where each computer will store its operating system and files.',
    'A disk holds data. A partition is a section of a disk. A filesystem organizes files. A mount point is the Linux folder where that storage appears.',
    'Review disk choices in the VM form. Do not click the final Create button until you have completed the key lessons.',
  ],
  'key-concept-v2': [
    'Learn which SSH key stays on Windows and which part can go to Linux.',
    'The private key stays on your Windows computer. The public key can be placed on Linux. They work together to prove it is you without sending your private key.',
    'Choose file paths under your own Windows .ssh folder. This step does not create a key yet.',
  ],
  'key-create-v2': [
    'Create a new SSH key pair and protect the private key with a passphrase.',
    'A passphrase helps protect your private key if someone gets a copy of the file. Never overwrite a key you already use to sign in.',
    'Create two files on Windows only after checking that neither filename is already in use.',
  ],
  'vm-provision-v2': [
    'Create the endpoint Linux VM and give rexuser your public key.',
    'A VM is a computer provided by Azure. The public key tells that computer which key is allowed to sign in as rexuser.',
    'Create rhel9-lab-01 with its disk and network connection. Paste only the .pub key. Keep an existing working endpoint instead of creating a duplicate.',
  ],
  'manager-vm-v3': [
    'Create the manager Linux VM and record both computers separately.',
    'The manager runs the central Wazuh tools. Separate names and notes help you install them on the right computer.',
    'Create rhel9-manager-01, its own SSH rule and its own public IP. Reuse the lab network and your existing public key.',
  ],
  'reachability-v2': [
    'Check whether your Windows computer can reach SSH on the VM.',
    'Reaching port 22 and signing in are two different checks. First test the connection. Then test your username and key.',
    'Send a connection test to the VM. This does not install anything or change a firewall rule.',
  ],
  'host-trust-v2': [
    'Get the VM’s SSH fingerprint from Azure before your first SSH login.',
    'A fingerprint is a short value that helps identify a key. Checking the server’s fingerprint helps you avoid connecting to the wrong computer.',
    'Read the VM’s public host-key fingerprint using Azure Run Command. Save it beside that VM’s name.',
  ],
  'first-ssh-v2': [
    'Sign in to the endpoint as rexuser using your Windows private key.',
    'SSH protects the connection. You check the server’s identity, and the server checks whether your key is allowed to use the account.',
    'Open a connection from Windows to RHEL. After sign-in, commands in this tab run on RHEL until you type exit.',
  ],
  'identity-v2': [
    'Check your Linux username and whether you may use administrator commands.',
    'Before changing a system, make sure you are using the right account. sudo lets an allowed user run a particular command with extra permissions.',
    'Read your account and permission information. You do not need to become root or change any permissions.',
  ],
  'host-os-v2': [
    'Check the computer name, RHEL version and running kernel version.',
    'The kernel is the core part of Linux that works with the hardware. Its version is different from the RHEL release number. Record both. Wazuh does not generally require the manager and agent to use identical kernels. Some optional features and kernel modules have their own requirements; check those before installing them.',
    'Read system information. Do not update or restart Linux in this step.',
  ],
  'guest-network-v2': [
    'Find the private IP address and the route Linux uses to reach other networks.',
    'The public IP you use from home and the private IP shown inside Linux are different. Checking both prevents you from using the wrong address.',
    'Read the network settings. Do not change the IP address inside Linux.',
  ],
  'home-files-v2': [
    'Find your Linux home folder and inspect the public key allowed to sign in.',
    'Your home folder holds your account’s files. Names beginning with a dot are hidden from a normal file listing; .ssh is one of these folders.',
    'List files and read the public-key fingerprint. Do not display or copy a private key.',
  ],
  'storage-verify-v3': [
    'Check each VM’s disks, folders and free space.',
    'A computer can run out of disk space or run out of room to track more files. Check both before installing software.',
    'Read storage information on each VM. Do not format, resize or remove a disk.',
  ],
  'paired-access-v3': [
    'Sign in to the manager and prove you can tell the two Linux computers apart.',
    'The same username and private key can work on both VMs. That does not mean they are the same computer.',
    'Open a separate manager connection. Check its name and private IP before doing any work there.',
  ],
  'test-file-v3': [
    'Make a harmless text file on Windows and calculate its checksum.',
    'A checksum is a value calculated from a file’s contents. You can compare it after copying the file to check that the contents stayed the same.',
    'Create a small practice file in your Windows profile. Do not use your SSH key as a practice file.',
  ],
  'scp-test-v3': [
    'Copy the practice file from Windows to the endpoint with SCP.',
    'Copying a file and installing software are separate actions. Practice copying something harmless first.',
    'Upload the text file into rexuser’s home folder. Your private key proves your identity; it is not the file being uploaded.',
  ],
  'verify-transfer-v3': [
    'Check the file that arrived on Linux and compare its checksum with Windows.',
    'A completed copy message is only the first check. You also need the right file, in the right folder, with the same contents.',
    'Read the received file’s details and checksum. Do not run it as a program.',
  ],
  'sftp-test-v3': [
    'Copy the same practice file using SFTP’s file-transfer prompt.',
    'SFTP has its own commands. Its prompt is different from PowerShell and from a Linux command prompt.',
    'Upload a second copy under a new filename, then check its checksum from a Linux SSH session.',
  ],
  'installer-types-v3': [
    'Learn the difference between a script, an RPM package and an archive.',
    'A filename does not tell you everything about a download. chmod +x is not a universal installation step: it changes a file permission, not whether software is installed. Different file types need different checks and installation steps.',
    'Read examples only. These placeholder commands are not an instruction to install software now.',
  ],
  'software-inventory-v3': [
    'Make a list of installed software and services on each VM.',
    'A service is a program that can keep running in the background. A before-and-after list helps you see what an installation changed.',
    'Read package, service and running-program lists. Do not remove or stop anything.',
  ],
  'baseline-v2': [
    'Write down the working state of Linux before installing Wazuh.',
    'A baseline is your record of what worked before a change. You will compare later results with this record.',
    'Check SSH, Linux security settings and disk space. Choose how you would recover before moving on.',
  ],
  'rollback-gate-v3': [
    'Write down what to back up and how to undo the next change.',
    'A rollback means returning to a known working state. Having a snapshot is not enough: you must know what it contains and how to restore it.',
    'Record the recovery plan and create the approved recovery copies. Do not install Wazuh until the plan is ready.',
  ],
  'deallocate-v2': [
    'Stop both Azure VMs properly when you finish the session.',
    'Closing SSH does not stop a VM. Stopped (deallocated) means Azure has released its running compute resources. Disks and other saved resources can still cost money.',
    'Close your connections and use Azure Stop for each VM. Keep the resources needed to continue later.',
  ],
  'wazuh-release-v4': [
    'Check the Wazuh version, computer size and recovery plan before installing.',
    'Software has requirements. Checking them first avoids an installation that cannot run on your computer.',
    'Read the requirements and compare them with the actual manager VM. Stop if they do not match.',
  ],
  'wazuh-central-v4': [
    'Install the three central Wazuh parts on the manager VM.',
    'The manager receives information, the indexer stores and searches it, and the dashboard shows it in your browser.',
    'Check the official installer, then install it on the manager. Protect the passwords and certificates it creates.',
  ],
  'wazuh-dashboard-v4': [
    'Check that Wazuh is running and open its dashboard from Windows.',
    'An installed program may not be running. Check its services and the network connection before trying to sign in.',
    'Allow the required dashboard connection from your public address, then check the website’s certificate and sign in.',
  ],
  'wazuh-artifact-v4': [
    'Check the Wazuh agent download before installing it.',
    'A matching checksum checks the file’s contents. A valid signature also checks that the package was signed by the trusted publisher.',
    'Download to Windows, check it, copy it to the endpoint, and check it again. Do not install yet.',
  ],
  'wazuh-agent-v4': [
    'Install the agent on the endpoint and tell it where the manager is.',
    'The agent is the small program that sends information from a monitored computer to Wazuh.',
    'Install the checked package on the endpoint. Use the manager’s private IP for the connection between the VMs.',
  ],
  'wazuh-checkin-v4': [
    'Match the endpoint in Linux with its entry in the Wazuh dashboard.',
    'A green status beside the wrong computer does not prove your endpoint is connected. Compare its name, ID and recent activity.',
    'Read the endpoint and manager results and compare them with the dashboard.',
  ],
  'wazuh-event-v4': [
    'Change a harmless file and find that change in Wazuh.',
    'Seeing the event proves that information traveled from the endpoint to the dashboard.',
    'Create a practice file, let Wazuh scan it, then change one line. Do not edit a real system file for this test.',
  ],
  'wazuh-fault-v4': [
    'Practice finding a deliberately wrong manager address.',
    'A service can be running while its connection is broken. The error messages help you find the real problem.',
    'On the lab endpoint only, change the manager address as instructed. Diagnose it, restore the correct value and test again.',
  ],
  'wazuh-recover-v4': [
    'Use the chosen rollback plan and check that Linux works afterward.',
    'Removing a package may leave settings behind. Restoring a disk can also remove newer data. Choose the right recovery method before starting.',
    'Follow one recovery branch: remove the agent, or restore the approved disk copy. Then check the complete result.',
  ],
  'wazuh-close-v4': [
    'Save the results and stop both VMs when you are finished.',
    'Clear notes show what worked, what failed and what still needs attention. Stopping both VMs avoids leaving one running by mistake.',
    'Record the final state, protect the recovery copies you still need, and check both Azure power states.',
  ],
};

const vocabulary: [RegExp, string, string][] = [
  [
    /\bVM\b|virtual machine/i,
    'VM',
    'A virtual machine: a computer running inside a larger computer or cloud service.',
  ],
  [
    /tenant|subscription/i,
    'Tenant and subscription',
    'A tenant holds an organization’s accounts. A subscription holds Azure resources and their billing.',
  ],
  [
    /\bNIC\b|network interface/i,
    'NIC',
    'The VM’s network connection, like a network card.',
  ],
  [
    /\bNSG\b/i,
    'NSG',
    'An Azure list of rules that allows or blocks network traffic.',
  ],
  [
    /\bCIDR\b|\/32|\/24|\/16/,
    'Address range',
    '/32 means one IPv4 address. A /24 or /16 describes a larger group of addresses. Use the exact range named in the lesson.',
  ],
  [
    /\bSSH\b/i,
    'SSH',
    'A protected connection used to type commands on another computer.',
  ],
  [
    /fingerprint/i,
    'Fingerprint',
    'A short value used to compare and identify a key. The server’s key identifies the server; your account key identifies you.',
  ],
  [
    /\bsudo\b|privilege/i,
    'sudo',
    'Run one command with extra permissions, when your account is allowed to do so.',
  ],
  [
    /kernel/i,
    'Kernel',
    'The core of Linux that works with memory, devices and running programs.',
  ],
  [
    /mount|filesystem|partition|inode/i,
    'Linux storage',
    'A disk holds data. A partition is a disk section. A filesystem organizes files. A mount point is the folder where that storage appears. An inode stores information about a file.',
  ],
  [
    /checksum|digest|hash|SHA-/i,
    'Checksum, hash and digest',
    'Names for a value calculated from file contents. Compare the same algorithm on both copies, such as SHA-256 with SHA-256.',
  ],
  [
    /\bRPM\b|package/i,
    'Package',
    'Software bundled for installation. RPM is a package format used by RHEL. dnf installs packages and the other software they need.',
  ],
  [
    /artifact/i,
    'Artifact',
    'A file you are working with, such as an installer, script or package.',
  ],
  [
    /service|systemd/i,
    'Service',
    'A program managed in the background. systemctl is the Linux tool used here to check and control services.',
  ],
  [
    /baseline|rollback|checkpoint/i,
    'Baseline and rollback',
    'The baseline records the starting state. Rollback is the planned way to return to a working state after a failed change.',
  ],
  [
    /snapshot/i,
    'Snapshot',
    'A saved point in time. A vSphere snapshot depends on the VM’s disks and is not a separate backup.',
  ],
  [
    /SELinux|firewalld/i,
    'Linux security tools',
    'firewalld controls network access inside Linux. SELinux limits what programs may access. They are separate from Azure NSG rules.',
  ],
  [
    /enroll|agent/i,
    'Agent enrollment',
    'Registering the monitored computer with its Wazuh manager.',
  ],
  [
    /certificate|HTTPS/i,
    'Certificate and HTTPS',
    'A certificate helps identify a website or service. HTTPS protects the browser connection; check the certificate as the lesson explains.',
  ],
];

export function beginnerTerms(
  lesson: Lesson,
): { term: string; meaning: string }[] {
  const text = JSON.stringify(lesson);
  return vocabulary
    .filter(([pattern]) => pattern.test(text))
    .map(([, term, meaning]) => ({ term, meaning }));
}

export function beginnerIntroduction(lesson: Lesson): Lesson {
  const intro = introductions[lesson.id];
  if (!intro) return lesson; // The NSG lesson already has a full plain-language rewrite.
  return { ...lesson, objective: intro[0], why: intro[1], change: intro[2] };
}
