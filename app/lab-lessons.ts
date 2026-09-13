import { lessonTime } from './course-timing.ts';
import type { Lesson } from './course';
import { workplaceRecovery } from './workplace-recovery.ts';
export const labLessons: Lesson[] = [
  {
    id: 'two-host-plan-v3',
    phase: '02 · Plan the continuous lab',
    title: 'Plan the manager and endpoint as one change',
    time: lessonTime('two-host-plan-v3'),
    scenario:
      'The assignment now has one outcome: a centrally managed endpoint that checks in successfully. Keep the existing rhel9-lab-01 VM as the endpoint; do not discard Milestone 2 work.',
    objective:
      'Approve a two-VM inventory, sizing, addresses, cost, and acceptance criteria before building the second system.',
    why: 'The transferable ePO-like skill is managing the complete server/agent change. Wazuh and Trellix ePO are not technically identical. In this lab the central VM will run the Wazuh manager, indexer, and dashboard together, not the manager daemon alone.',
    change:
      'Record a two-host plan. No resources are created by these variables. Wazuh software installation remains the next implementation milestone.',
    shell: 'Windows · PowerShell',
    command:
      '$EndpointVm = "rhel9-lab-01"\n$ManagerVm = "rhel9-manager-01"\n$VmUser = "rexuser"\n$EndpointVm, $ManagerVm, $VmUser',
    args: [
      '$EndpointVm reuses the existing VM name and its work. $ManagerVm names a different Azure VM for the central components.',
      '$VmUser is the named RHEL administrator on both VMs. Separate server host keys still apply even if the same approved lab account key is authorized on both.',
      'The comma-separated expression prints the plan; it does not create a machine or enroll an agent. In a new PowerShell session, restore the saved ResourceGroup, SshDirectory, KeyPath, and PublicKeyPath variables from the retained Windows/key lessons before manager creation. Use the original private-key path; do not generate a replacement for an existing endpoint.',
    ],
    portal: [
      'Retain the endpoint budget and add a separate manager line. Current Wazuh all-in-one guidance for 1–25 agents recommends 4 vCPU, 8 GiB RAM, and 50 GB storage. Choose a supported x64 RHEL 9 image and a region-available size meeting at least that recommendation; the image’s OS disk can be larger. Do not copy the small endpoint size to the manager.',
      'Budget two OS disks, two NICs, and, for this direct-SSH lab, two Standard public IPv4 addresses. Reuse the one VNet/subnet. Review actual regional compute/RHEL software and storage/IP charges; short lab runtime and deallocation control compute cost. No extra gateway, load balancer, or paid monitoring workspace is needed.',
      'Record each VM’s role, actual public administration IP, private application IP, disk IDs, NSG association, and host fingerprint separately. Keep Azure private IP allocation stable using the NIC’s Azure IP configuration where needed; never hard-code guest networking.',
      'Plan a source /32 SSH rule on each NIC NSG. Later, manager dashboard TCP 443 will be restricted to your current workstation public IP; agent events TCP 1514 and enrollment TCP 1515 use the manager’s private IP and endpoint source. Do not expose the indexer/API publicly or open application ports yet. NSG default VNet allowances still require review.',
    ],
    expected:
      'Two distinct host roles, a reviewed combined budget, and one continuous change record. Neither Wazuh component is installed yet.',
    verify:
      'Confirm the central host has adequate CPU/RAM/storage, RHEL 9 is supported by the selected stable release, and the plan does not depend on a third Linux VM. A successful future change requires dashboard check-in and useful logs, not just two Running Azure statuses.',
    trouble:
      'Undersizing central components can look like agent failure. Swapping public and private addresses can put traffic on the wrong path. Lost role labels invite installing the wrong component on the wrong VM.',
    methodology: [
      'Identify the host role before every command.',
      'Compare proposed size and release to current official requirements and actual regional prices.',
      'If capacity or policy blocks the plan, review an approved equivalent with the owner instead of selecting a large default or abandoning the existing endpoint.',
    ],
    rollback:
      'Retain the endpoint and its key. Approve spending before adding the manager. Deallocate both when pausing; disks/IPs and later snapshots still cost money. Infrastructure cleanup is separate from agent uninstall.',
    challenge:
      'Why is a small endpoint-sized VM not automatically enough for the centralized server?',
    answer:
      'The central host also indexes and displays event data. Its CPU, RAM, and storage needs differ from an agent’s. Size by the supported central-component workload.',
    vsphere:
      'Azure VM ≈ vSphere VM; an Azure image is conceptually like a deployment template. Neither comparison guarantees identical configuration, licensing, networking, or lifecycle behavior.',
    visual: 'architecture',
    sources: ['wazuh', 'wazuhQuickstart', 'pricing', 'cost'],
  },
  {
    id: 'build-storage-v3',
    phase: '03 · VM build choices',
    title: 'Plan disks and mount points during the build',
    time: lessonTime('build-storage-v3'),
    scenario:
      'You are preparing the VM creation forms. Make sensible disk choices now without turning the deployment lab into an advanced storage course.',
    objective:
      'Distinguish disk, partition, filesystem, and mount point; document the image layout and any required separate mounts before final creation.',
    why: 'A disk is a block device; partitions divide it; a filesystem organizes files; a mount point attaches a filesystem to the directory tree. Separate /var, /var/log, /var/log/audit, /home, or /tmp mounts can bound growth and support policy options, but they must fit the workload and actual applicable STIG requirements.',
    change:
      'Build planning only. Use the official image’s working partition layout for this main lab. Standard Azure marketplace VM creation chooses disk size/type but does not offer an arbitrary Linux partition editor. No live OS repartitioning is required.',
    shell: 'Windows · PowerShell · record the disk plan',
    command:
      '$EndpointDiskPlan = "Image layout; Standard SSD OS disk; no extra data disk"\n$ManagerDiskPlan = "Image layout; Standard SSD OS disk; at least image minimum and Wazuh capacity"\n$EndpointDiskPlan, $ManagerDiskPlan',
    args: [
      'These descriptive strings are change-record inputs, not Azure disk commands. The final expression prints them.',
      'OS disk means persistent managed storage holding RHEL. Temporary/resource disks are not durable storage for installers, logs, or recovery evidence.',
      'A path such as /var/log is only a separate filesystem if a mount actually exists there. Merely creating a directory does not reserve separate capacity.',
    ],
    portal: [
      'Open the endpoint VM wizard’s Basics and Disks pages to review image, size, and storage. Do not submit final Create until the following SSH-key and public-key authorization tasks are done. Repeat this review for the manager with its larger supported sizing.',
      'Use a Standard SSD managed OS disk at or above the image minimum. The central host also needs the documented Wazuh space plus room for RHEL, updates, and lab logs. Keep one OS disk per VM for the simplest supported training path.',
      'If an enterprise partition layout is mandatory, obtain an approved prebuilt RHEL image or use an approved installer/image-building workflow before provisioning. In a vSphere installer this may be configurable during OS installation. Do not shrink or repartition the running Azure OS disk to imitate a checklist.',
      'Record which mounts are image-provided, which are only directories, and why advanced LVM or additional disks are deferred. The post-login storage check will verify the actual result. STIG-minded planning is not a compliance claim.',
    ],
    expected:
      'A documented storage decision that supports the main deployment scenario without extra disks or unsafe partition edits.',
    verify:
      'Read the final disk type, capacity, and selected image before submission. Record exceptions to an enterprise mount-point policy rather than claiming the default image satisfies it.',
    trouble:
      'A 64-GiB disk does not imply 64 GiB free. A separate directory is not necessarily a mount. Applying noexec or restrictive mount options blindly can break software deployment.',
    methodology: [
      'Compare disk capacity, partition layout, and mounted filesystem capacity as distinct layers.',
      'Check actual requirements against image capabilities.',
      'Resolve mandatory build-layout differences with an approved image before installation, leaving advanced LVM for the later deep dive.',
    ],
    rollback:
      'Before deployment, revise the plan. After useful data exists, disk changes require protected data and a tested recovery procedure. Do not delete an existing Milestone 2 endpoint because its default layout differs from an example.',
    challenge:
      'Does /var/log existing prove logs are isolated on their own filesystem?',
    answer:
      'No. findmnt later shows the filesystem that contains the path; a directory alone is not a separate mount.',
    vsphere:
      'Azure managed disk ≈ the virtual-disk/VMDK concept. A vSphere template or OS installer may define partitions differently; the Azure VM wizard is not equivalent to interactive RHEL disk partitioning.',
    sources: ['rhel', 'azure', 'wazuhQuickstart'],
  },
  {
    id: 'manager-vm-v3',
    phase: '05 · Two RHEL systems',
    title: 'Create the second VM without losing the endpoint',
    time: lessonTime('manager-vm-v3'),
    scenario:
      'The endpoint is provisioned using the retained SSH-key workflow. Create the separate central host with its own network identity and adequate resources.',
    objective:
      'Provision rhel9-manager-01 as RHEL 9 with rexuser, then record both actual administration and application addresses.',
    why: 'An agent reports to a separate central service. Reusing the endpoint as the manager would hide the network and role-boundary skills this scenario is meant to practice.',
    change:
      'One additional VM, managed OS disk, NIC, public IP, and dedicated NSG. No Wazuh install yet. Retain rhel9-lab-01 unchanged.',
    shell: 'Windows · PowerShell · after reading Azure inventory',
    command:
      '$EndpointPublicIp = "REPLACE_WITH_ENDPOINT_PUBLIC_IPV4"\n$EndpointPrivateIp = "REPLACE_WITH_ENDPOINT_PRIVATE_IPV4"\n$ManagerPublicIp = "REPLACE_WITH_MANAGER_PUBLIC_IPV4"\n$ManagerPrivateIp = "REPLACE_WITH_MANAGER_PRIVATE_IPV4"\n$VmAddress = $EndpointPublicIp',
    args: [
      'Replace each value with the corresponding actual VM/NIC address, not a sample. Public addresses are for workstation SSH; private addresses will carry agent-to-manager traffic.',
      '$VmAddress remains an alias for the endpoint so the preserved first-login lessons still work. For a manager session, explicitly select $ManagerPublicIp instead.',
      'The private/public distinction is independent of the rexuser account and SSH key; the variables only identify destinations.',
    ],
    portal: [
      'Create nsg-rhel9-manager in the existing group/region. Repeat the earlier inbound-rule recipe exactly: source your current public IPv4/32, source ports *, destination Any, destination TCP 22, Allow, priority 300. Name it Allow-SSH-rexuser-workstation. Do not create a broad SSH rule.',
      'Repeat the endpoint VM creation recipe using name rhel9-manager-01, official RHEL 9 x64 image, rexuser, and the existing Windows .pub key. Use the reviewed manager size of at least 4 vCPU/8 GiB and sufficient OS disk capacity. Keep existing VNet/subnet, select the new manager NSG on the NIC, and create its own Standard public IPv4.',
      'Check Review + create for the exact host role and cost, then submit. Record both VMs’ public/private IPs, NICs, disks, and associations. To keep the manager address stable, open its NIC → IP configurations → current private IPv4 configuration; if approved, switch allocation to Static retaining its currently assigned valid address and save. Do not change the guest IP manually.',
      'Set Auto-shutdown on both VMs and inspect effective NSG rules on both NICs. Do not add dashboard or enrollment exposure yet. The later installation lesson will apply and verify only the necessary application rules.',
    ],
    expected:
      'Two distinct RHEL VMs with rexuser authorized. The central VM has enough resources for the forthcoming all-in-one installation.',
    verify:
      'Keep separate inventory rows. Verify the manager’s /32 SSH source and sizing, and confirm the endpoint still exists. Use the following trust/login checks for each host, comparing each distinct host fingerprint.',
    trouble:
      'A reused VM name or address can hide the fact that you never created a second host. Copying an NSG rule with an outdated home IP blocks access. Defaults can accidentally attach the endpoint’s NSG or an unrestricted new one.',
    methodology: [
      'Check resource IDs and roles, not only display names.',
      'Inspect each NIC association and actual effective rule.',
      'Resolve partial deployment errors without repeating creation blindly; inspect any remaining billable disk/IP resources.',
    ],
    rollback:
      'If the new empty manager is wrong, review and remove only its own resources or correct its plan. Do not remove the group containing the working endpoint. A later private-IP change is an application configuration change and must be tracked.',
    challenge: 'Which manager address should the endpoint eventually use?',
    answer:
      'Its verified private address on the lab network, or a DNS name resolving to it. The public IP is the workstation administration path in this design.',
    vsphere:
      'A second vSphere VM needs its own identity and network settings too. NSG is an access-control concept, not a direct vSphere feature; workplace enforcement may be physical firewalls, NSX, or guest firewalls.',
    sources: ['azure', 'nsg', 'wazuhQuickstart'],
  },

  {
    id: 'storage-verify-v3',
    phase: '06 · Verify the built systems',
    title: 'Verify the storage you actually built',
    time: lessonTime('storage-verify-v3'),
    scenario:
      'RHEL is running. Verify its layout now, as a build acceptance check, before file transfer and Wazuh deployment.',
    objective:
      'Inspect devices, filesystem mounts, free bytes, and free inodes on each VM without changing partitions.',
    why: 'Free gigabytes do not guarantee the filesystem can create more files: inodes hold file metadata. A disk, a partition, a filesystem, and the directory using it may report different sizes and names.',
    change:
      'Read-only checks on the endpoint first; repeat on the manager with a clearly labeled record. No LVM administration or repartitioning.',
    shell: 'RHEL 9 · Bash · rexuser',
    command: 'lsblk\nfindmnt\ndf -h\ndf -i',
    args: [
      'lsblk lists block devices in a tree. TYPE distinguishes disks, partitions, and mapped devices; SIZE is device capacity; MOUNTPOINTS identifies mounted use where available. Loop or temporary devices are not automatically your OS disk.',
      'findmnt lists mounted filesystems, their source devices, target directories, filesystem types, and options. Without arguments it shows the mount tree; it does not mount anything.',
      'df reports mounted filesystem usage. -h means human-readable byte units. Filesystems such as tmpfs are memory-backed and are not Azure managed disks.',
      'df -i reports inode totals, use, and availability instead of bytes. A filesystem can run out of inodes even when byte capacity remains.',
      'No path argument means these commands inspect the overall current view. Device names can differ between VMs; do not paste a sample disk name into a destructive command.',
    ],
    expected:
      'Device and mount inventories plus byte/inode usage for both hosts. Image-provided mount layouts may differ; record actual values.',
    verify:
      'Trace / from findmnt to its block device in lsblk, then compare available bytes/inodes in df. Record whether /var/log is its own mount or part of /. Confirm capacity meets the manager plan and no temporary disk holds intended persistent data.',
    trouble:
      'A larger Azure disk does not guarantee a larger guest filesystem. Overlay/memory mounts can obscure the view. Do not infer a filesystem is missing simply because an example uses a different device name.',
    methodology: [
      'Compare device size, partition size, then mounted filesystem size.',
      'Check which filesystem contains the path of interest.',
      'Document a provisioning mismatch and resolve it through the approved build process; advanced LVM expansion is not a prerequisite to this main lab.',
    ],
    rollback:
      'Nothing changes. If you later resize or repartition, take a separate protected-data checkpoint and validate recovery first. Keep this output for the post-install comparison.',
    challenge:
      'There is space in df -h but file creation fails. What other resource could be exhausted?',
    answer:
      'Inodes. df -i checks them. Also consider permissions, quotas, and read-only mounts instead of assuming disk capacity is the only cause.',
    vsphere:
      'An increased virtual disk/VMDK size and an increased guest filesystem are separate changes, just as with an Azure managed disk. Verify inside the guest after either platform’s provisioning.',
    sources: ['rhel'],
  },
  {
    id: 'paired-access-v3',
    phase: '06 · Verify the built systems',
    title: 'Prove rexuser access to both hosts',
    time: lessonTime('paired-access-v3'),
    scenario:
      'The original login lessons proved endpoint access. A two-host deployment needs an equally trustworthy manager session.',
    objective:
      'Repeat the retained host-trust and first-login checks on the manager and distinguish the two sessions before any installation.',
    why: 'Installing the right package on the wrong host is still a failed change. Your prompt, public address, private address, and host fingerprint together establish the target.',
    change:
      'Open a manager SSH session. Its independently verified host key is added to Windows known_hosts on first use. Keep the private account key on Windows.',
    shell: 'Windows · PowerShell',
    command:
      'Test-NetConnection -ComputerName $ManagerPublicIp -Port 22\nssh -i "$KeyPath" -o IdentitiesOnly=yes "rexuser@$ManagerPublicIp"',
    args: [
      'Test-NetConnection -ComputerName targets the manager’s actual public IP. -Port 22 tests TCP SSH reachability, not authentication.',
      'Before ssh, repeat the earlier Azure Run Command host-fingerprint procedure on the manager VM. Its fingerprint is different from the endpoint’s; compare like algorithm to like algorithm.',
      'ssh -i selects the local private identity file. -o IdentitiesOnly=yes avoids unrelated offered identities. rexuser@ requests the named account on the manager destination.',
      'A passphrase prompt unlocks the local private key. A server fingerprint prompt must match the manager’s trusted inventory, not the endpoint or account-key fingerprint.',
    ],
    followup: {
      shell: 'Manager · RHEL Bash · after verified login',
      command: 'whoami\nhostname\nip addr',
      args: [
        'whoami confirms rexuser; no arguments are required.',
        'hostname prints the guest hostname. Compare it to the manager build record rather than assuming it matches the Azure label automatically.',
        'ip addr shows the guest NIC/private address. Match it to the manager inventory. Repeat the earlier OS/kernel, sudo, home, and storage verification tasks on this host and label their evidence separately.',
      ],
    },
    expected:
      'A verified rexuser shell on the manager, with a different host identity/private address from the endpoint.',
    verify:
      'The change record must contain separate successful access, sudo, OS, storage, and network observations for both VMs. Keep $VmAddress and $EndpointPublicIp pointing to the endpoint for the file-transfer lessons.',
    trouble:
      'An old $VmAddress can silently target the wrong role. Home public IP changes can block either NSG. If the displayed host fingerprint changes unexpectedly, stop and investigate rather than clearing all trust records.',
    methodology: [
      'Check the explicit destination variable and Azure resource identity.',
      'Check reachability, then independent host trust, then rexuser authorization.',
      'Compare all outputs to the role-specific record before making a privileged change.',
    ],
    rollback:
      'exit ends this manager session; it does not stop the VM. Retain verified known_hosts entries and deallocate both VMs when pausing.',
    challenge:
      'If both hosts accept the same account key, are their host fingerprints interchangeable?',
    answer:
      'No. Client authorization and server identity use different keys. Verify each server independently.',
    vsphere:
      'Separate console/SSH sessions and role-labeled evidence matter equally with two vSphere VMs. A shared template does not make their running identities interchangeable.',
    sources: ['keys', 'rhel'],
  },
  {
    id: 'test-file-v3',
    phase: '07 · Deliver a harmless artifact',
    title: 'Create a harmless Windows test file',
    time: lessonTime('test-file-v3'),
    scenario:
      'Before handling a real security installer, practice delivery with harmless text and a known checksum.',
    objective:
      'Create a lab text file in your Windows profile and record its SHA-256 digest.',
    why: 'A hash lets you compare bytes across computers. It proves equality to a trusted reference, not that a file is safe or from an authentic vendor.',
    change:
      'Create one new local text file. The existence guard prevents this exercise from overwriting a previous file.',
    shell: 'Windows · PowerShell',
    command:
      '$TestFile = "$env:USERPROFILE\\rexuser-transfer-v3.txt"\nif (-not (Test-Path -LiteralPath $TestFile)) {\n  Set-Content -LiteralPath $TestFile -Value "Harmless rexuser transfer practice." -Encoding ascii\n}\nGet-FileHash -LiteralPath $TestFile -Algorithm SHA256',
    args: [
      '$TestFile is an explicit local file path under the Windows profile; it is not the SSH key path.',
      'if executes the braced block only when its condition is true. -not negates Test-Path; -LiteralPath selects the exact path. An existing file is left unchanged: inspect it before reusing it.',
      'Set-Content writes the supplied -Value. -Encoding ascii makes this simple English text predictable across Windows versions; its newline is part of the hashed bytes.',
      'Get-FileHash reads the file and -Algorithm SHA256 selects SHA-256. Record the complete hexadecimal Hash value; letter case does not affect digest comparison.',
    ],
    expected:
      'A harmless text file and one SHA-256 digest. No RHEL files or packages change.',
    verify:
      'Open the file locally and verify it contains only the intended harmless text. Record the filename, hash, and purpose in the change record; no private key or secret is part of the exercise.',
    trouble:
      'An existing file may contain different text. A different newline or encoding changes the hash even when text looks identical. A wrong profile path can place the file somewhere unexpected.',
    methodology: [
      'Inspect the exact local file and path.',
      'Check contents and encoding before transfer.',
      'Keep the original digest; if bytes intentionally change, record a new baseline rather than explaining away a mismatch.',
    ],
    rollback:
      'Remove only this known harmless file through File Explorer when the exercise is closed, after keeping required evidence. Do not delete the .ssh directory or key.',
    challenge: 'Does a SHA-256 match prove an installer is trustworthy?',
    answer:
      'Only if the reference itself is authentic, and even then it verifies integrity rather than every safety property. Vendor signatures and an approved source remain important.',
    vsphere:
      'The workstation staging and checksum habit is identical when the destination runs on vSphere; the hypervisor does not change the artifact-trust problem.',
    sources: ['windows'],
  },
  {
    id: 'scp-test-v3',
    phase: '07 · Deliver a harmless artifact',
    title: 'Copy the test file with SCP',
    time: lessonTime('scp-test-v3'),
    scenario:
      'The endpoint is reachable as rexuser and you have a known harmless local file. Practice a direct secure copy to that account’s home.',
    objective:
      'Transfer the test file without elevating privileges or copying private-key material.',
    why: 'An administrator stages a file in a writable account location, verifies it, and only later installs with approved privilege. SCP does not grant root access or install software.',
    change:
      'Copy the test file into /home/rexuser on the endpoint. Check the destination first with your existing SSH session; if a same-named file exists, inspect it before allowing replacement.',
    shell: 'Windows · PowerShell',
    command:
      'scp -i "$KeyPath" "$TestFile" "rexuser@${EndpointPublicIp}:/home/rexuser/rexuser-transfer-v3.txt"',
    args: [
      'scp is the secure-copy client. -i selects the Windows private identity file for authentication; the key is used, not copied.',
      '$TestFile is the source file on Windows. The final argument is the destination. Argument order establishes transfer direction.',
      'rexuser@ selects the remote account; ${EndpointPublicIp} delimits the PowerShell variable before the colon. The colon separates remote host from remote path.',
      '/home/rexuser/rexuser-transfer-v3.txt is an absolute Linux destination. Quotes protect paths from spaces and preserve each argument.',
      'SCP normally uses SSH TCP 22. Do not confuse its uppercase -P for an alternate port with SSH’s lowercase -p; no alternate port is needed here.',
    ],
    expected:
      'SCP reports a completed transfer and returns to PowerShell without a nonzero failure. The received file should belong to rexuser.',
    verify:
      'Do not declare success from the progress bar alone. Use the next RHEL task to inspect file type, ownership, and SHA-256 against the Windows digest.',
    trouble:
      'Permission denied may mean authentication or destination write access; read the full error. Local path errors happen before transfer. A stale endpoint IP or changed workstation source IP can break reachability.',
    methodology: [
      'Check source path and explicit endpoint destination.',
      'Reuse the established transport/host-key/account checks.',
      'If authentication succeeds but writing fails, choose rexuser’s verified home staging path; do not use chmod 777 or log in as root.',
    ],
    rollback:
      'An overwritten remote file is not automatically recoverable, hence the pre-copy name check. This exercise uses a harmless dedicated filename; remove only that verified test artifact after evidence is saved.',
    challenge:
      'Which argument tells SCP what to copy, and which says where it goes?',
    answer:
      'The local $TestFile is the source; rexuser@host:/home/rexuser/... is the destination. Reversing them changes direction.',
    vsphere:
      'SCP behaves the same to a vSphere guest. Firewall/routing access to that guest may be supplied by different infrastructure.',
    sources: ['windows', 'keys'],
  },
  {
    id: 'verify-transfer-v3',
    phase: '07 · Deliver a harmless artifact',
    title: 'Verify the delivered file on RHEL',
    time: lessonTime('verify-transfer-v3'),
    scenario:
      'SCP finished. Verify what arrived before treating the delivery as successful.',
    objective:
      'Locate the file, identify its content type, read its owner/mode, and compare its digest to Windows.',
    why: 'An installer-looking filename can be HTML from a failed download, an archive, or a script. File type and integrity are separate from ownership and execute permission.',
    change:
      'Read the harmless file only. No executable permission or installation is needed for text.',
    shell: 'Endpoint · RHEL Bash · rexuser',
    command:
      'pwd\nls -l /home/rexuser/rexuser-transfer-v3.txt\nfile /home/rexuser/rexuser-transfer-v3.txt\nsha256sum /home/rexuser/rexuser-transfer-v3.txt',
    args: [
      'pwd shows the current directory. The following absolute paths work regardless of that directory.',
      'ls -l gives a long listing for this exact file. Read the type/mode, owner, group, size, and name. The owner should be rexuser; the group depends on the account’s actual primary group.',
      'In a mode such as -rw-r--r--, the first character is the file type, then owner/group/other permission triplets. r is read, w is write, and x is execute; actual defaults depend on umask. Do not change them just to match an example.',
      'file inspects content signatures to describe the type; this file should be text. An extension alone does not prove type.',
      'sha256sum calculates SHA-256 and prints digest plus path. Compare all digest characters to Windows Get-FileHash; uppercase/lowercase hexadecimal are equivalent.',
    ],
    expected:
      'A regular text file owned by rexuser and a SHA-256 matching Windows. No execute bit is necessary.',
    verify:
      'Record the observed type, owner, mode, size, and digest. If file is missing on a minimal image, record the missing utility, arrange an approved OS-repository utility installation, document that change, and repeat; do not skip verification silently.',
    trouble:
      'A missing file can be a wrong host/path. Digest differences can indicate a different source, truncated transfer, encoding changes, or later edits. Permissions that allow writing are not evidence of trusted content.',
    methodology: [
      'Confirm endpoint hostname/account and absolute destination.',
      'Compare size and type, then the complete digest.',
      'For mismatch, preserve evidence and re-copy the known source after checking the destination. Do not execute, rename, or chmod a mismatching installer to make it work.',
    ],
    rollback:
      'Only read operations occur. Remove only the known harmless file at cleanup, retaining required evidence. If a real artifact was overwritten, restore its approved previous version rather than assuming SCP can undo it.',
    challenge: 'Why not add chmod +x to this verification sequence?',
    answer:
      'It is text, not a program we intend to execute. Permission changes neither identify file type nor install software.',
    vsphere:
      'Guest ownership, permissions, and hashes are Linux properties whether the underlying VM is in Azure or vSphere.',
    sources: ['rhel'],
  },
  {
    id: 'sftp-test-v3',
    phase: '07 · Deliver a harmless artifact',
    title: 'Practice an interactive SFTP delivery',
    time: lessonTime('sftp-test-v3'),
    scenario:
      'Now deliver the same harmless bytes interactively under a different filename, while keeping local and remote paths distinct.',
    objective:
      'Use SFTP’s interactive prompt and verify the second copy without privileged access.',
    why: 'SFTP is useful when browsing and transferring multiple artifacts. Its commands are not PowerShell or a full Linux shell; knowing the current environment prevents mistakes.',
    change:
      'Open an SFTP session and upload one additional harmless file. Check that the distinct destination name is not already in use before uploading.',
    shell: 'Windows · PowerShell',
    command:
      'Set-Location -LiteralPath $env:USERPROFILE\nsftp -i "$KeyPath" "rexuser@$EndpointPublicIp"',
    args: [
      'Set-Location changes the Windows working directory. -LiteralPath uses the exact profile directory so the relative source filename is known.',
      'sftp starts an interactive transfer client. -i uses the retained local private identity for authentication, never transfer. rexuser@ selects the endpoint account.',
      'Verify the same endpoint host key already trusted for SSH/SCP. A new unexpected fingerprint is a reason to stop.',
    ],
    followup: {
      shell: 'SFTP prompt · sftp> · run one command at a time',
      command:
        'lpwd\npwd\nls -l\nput rexuser-transfer-v3.txt /home/rexuser/rexuser-transfer-sftp-v3.txt\nls -l /home/rexuser/rexuser-transfer-sftp-v3.txt\nbye',
      args: [
        'lpwd prints the local Windows directory; pwd prints the remote directory. The l prefix distinguishes local operations here.',
        'ls -l lists remote directory details. Inspect for the destination name before put; if it exists, stop and review because put may overwrite it.',
        'put uploads the local first argument to the remote second argument. The two filenames intentionally differ to retain the SCP copy.',
        'The second ls -l inspects the exact remote file. bye exits SFTP and returns to PowerShell; it does not deallocate the VM.',
        'After exiting, reconnect with the already-taught SSH command and repeat file and sha256sum using /home/rexuser/rexuser-transfer-sftp-v3.txt. Those tools run in the RHEL shell, not at sftp>.',
      ],
    },
    expected:
      'A second remote text file with the same bytes as the original, and a return to Windows after bye.',
    verify:
      'Compare the new remote digest to the original Windows digest. Record which commands ran locally, in SFTP, and inside the RHEL shell.',
    trouble:
      'Trying sha256sum at sftp> fails because SFTP is not a general shell. A local file-not-found error often means the local working directory differs. A remote denial is not fixed by making the local file executable.',
    methodology: [
      'Identify the current prompt before interpreting the error.',
      'Use lpwd for the local source and pwd/ls for the remote destination.',
      'Recheck the exact account, path, and permissions; retest with only the harmless file.',
    ],
    rollback:
      'Close with bye. Later cleanup removes only the two identified test files, not the account home or key material.',
    challenge:
      'At sftp>, which command tells you where the Windows client is looking for its source file?',
    answer: 'lpwd. pwd refers to the remote directory.',
    vsphere:
      'Interactive transfer works the same with a vSphere guest; guest permissions and SSH trust remain independent of hypervisor access.',
    sources: ['windows', 'keys'],
  },
  {
    id: 'installer-types-v3',
    phase: '08 · Prepare the software change',
    title: 'Match the installation method to the artifact',
    time: lessonTime('installer-types-v3'),
    scenario:
      'The harmless transfer worked. A real delivery can be a script, RPM, archive, or repository instruction; choose a method only after inspection and approval.',
    objective:
      'Understand common installer forms without executing any untrusted installer or installing Wazuh prematurely.',
    why: 'chmod +x changes an execution permission; it is not a universal Linux installation procedure. Packages track files and dependencies; scripts may make arbitrary changes; extraction merely unpacks an archive.',
    change:
      'Conceptual review only. The commented examples below are not this lab’s actual installer. Do not remove the comments or execute placeholders. Actual release selection and vendor verification belong to the next Wazuh milestone.',
    shell: 'Reference examples · commented, do not execute',
    command:
      '# Reviewed shell script, two alternative invocation methods:\n# chmod u+x ./script.sh\n# ./script.sh\n# OR: bash ./script.sh\n# Reviewed local RPM:\n# sudo dnf install ./package.rpm\n# Inspect archive before extraction:\n# tar -tzf archive.tar.gz\n# tar -xzf archive.tar.gz\n# Approved repository package:\n# sudo dnf install package-name',
    args: [
      '# makes each example a shell comment. These placeholders demonstrate methods; they are not a request to install anything now.',
      'chmod changes permission bits. u+x adds execute permission for the owner only. ./script.sh uses ./ to mean a file in the current directory, not one found through PATH. Review contents, source, integrity, and required interpreter before execution.',
      'bash ./script.sh is an alternative that asks Bash to read the script; it normally needs read permission rather than an execute bit. It does not make a malicious script safe, and not every .sh file is meant for Bash.',
      'sudo requests privileged execution. dnf install ./package.rpm installs a local RPM and resolves dependencies through configured repositories; ./ distinguishes the local file from a repository package name. Review package signature/source and the transaction before confirming.',
      'tar handles archives. -t lists members, -x extracts, -z processes gzip compression, and -f says the next argument is the archive filename. Use listing before extraction and an empty staging directory; untrusted paths, links, or overwrite targets need review. Extraction alone does not install software.',
      'Repository-based dnf install package-name selects a named package from enabled repositories. Trust the repository and package signatures, inspect the proposed transaction, and record the exact installed version.',
    ],
    expected:
      'You can explain the correct method and inspection requirements for each artifact type without changing system state.',
    verify:
      'Explain how you would first use file, hash/signature verification, and vendor instructions. Identify which actions merely inspect, which extract, which change permissions, and which actually execute/install.',
    trouble:
      'A download may be an error page; a matching extension can mislead. A root-run script can change files outside package tracking. A tarball may contain source code instead of a ready installer.',
    methodology: [
      'Establish trusted source, actual type, and integrity.',
      'Read vendor requirements and review what privilege/actions are needed.',
      'Select the type-appropriate method only after the baseline and rollback checkpoint, not by habitually adding execute permission.',
    ],
    rollback:
      'An RPM removal does not necessarily remove all generated data/configuration. A script may have no reliable uninstall. Archive extraction can overwrite files. Plan the actual reverse change and retain backups before execution.',
    challenge:
      'Why does tar -xzf not necessarily mean the application is installed?',
    answer:
      'It only extracts archive contents. Further vendor-specific configuration, build, or installation might be required.',
    vsphere:
      'Installer format and rollback behavior are guest-software concerns; a VM snapshot can complement but cannot replace understanding what the installer changes.',
    sources: ['rhel'],
  },
  {
    id: 'software-inventory-v3',
    phase: '08 · Prepare the software change',
    title: 'Record what is installed before asking what changed',
    time: lessonTime('software-inventory-v3'),
    scenario:
      'Before the Wazuh change, capture package, process, and service inventories so the post-install investigation has a trustworthy comparison.',
    objective:
      'Learn how to discover installed services without being handed a product-specific service name.',
    why: '“Installed”, “loaded”, “running”, and “enabled at boot” are different states. A package may add more than one service. Evidence from package files and systemd is stronger than guessing from the product name.',
    change:
      'Read-only inventories. Save outputs with hostname/time in the approved change record for each host; do not restart or enable unknown services.',
    shell: 'RHEL 9 · Bash · rexuser · each host separately',
    command:
      'rpm -qa\nsystemctl list-units --type=service --all\nsystemctl list-unit-files --type=service\nps -ef',
    args: [
      'rpm queries the package database. -q means query and -a means all installed packages; rpm -qa provides names/versions for before/after comparison.',
      'systemctl list-units lists loaded units. --type=service filters to service units; --all includes inactive loaded units, but does not mean every installed unit file.',
      'systemctl list-unit-files --type=service lists installed service unit files and their enablement state. Enabled means configured for startup, not necessarily running now.',
      'ps shows processes. -e selects all processes and -f a full-format listing including UID, PID, PPID, start/time information, and command. A process list alone does not establish application health.',
    ],
    followup: {
      shell: 'Post-install discovery recipe · commented placeholders only',
      command:
        '# Compare the recorded inventories after installation.\n# rpm -ql ACTUAL_PACKAGE\n# systemctl status ACTUAL_UNIT --no-pager\n# journalctl -u ACTUAL_UNIT -n 50 --no-pager\n# sudo dnf history info ACTUAL_TRANSACTION_ID',
      args: [
        'These examples are intentionally comments until a later installation provides actual names. No Wazuh unit name is supplied here.',
        'rpm -ql queries (-q) the file list (-l) of a discovered package. Look for .service files in systemd unit directories and configuration/log paths.',
        'systemctl status inspects the discovered unit. --no-pager prints directly rather than opening an interactive pager; running status does not guarantee check-in.',
        'journalctl -u filters by the discovered unit; -n 50 limits output to the latest 50 entries; --no-pager prints directly. Use sudo only when policy requires it to read system logs.',
        'dnf history info identifies what the actual package transaction changed. sudo supplies needed privilege. The ID must come from the recorded transaction, not a guess; history undo is not automatically a complete application rollback.',
      ],
    },
    expected:
      'A labeled pre-change inventory for both hosts and a discovery plan based on package/unit differences.',
    verify:
      'Distinguish currently running services from installed unit files. After the future install, compare inventories, query the actual new package’s file list, inspect the discovered unit, then verify enablement, process, logs, and end-to-end function.',
    trouble:
      'A unit can be installed but inactive, loaded from a generated file, or named differently from the package. Looking only at running units can miss a failed or never-started service.',
    methodology: [
      'Start with package/transaction evidence to establish what was installed.',
      'Use package file lists and unit-file inventory to find actual service names.',
      'Inspect status and logs before making startup changes; correlate process evidence with the correct unit.',
    ],
    rollback:
      'No service changes here. During later removal, inspect the actual transaction, residual config/data, and leftover units; compare restored package/service/system health to this baseline.',
    challenge: 'Why run both list-units and list-unit-files?',
    answer:
      'The first shows loaded runtime units; the second inventories installed unit files and startup state. They are complementary views.',
    vsphere:
      'vCenter power state cannot tell you whether a guest application service is installed, healthy, or checking in. Guest inventory and logs are still required.',
    sources: ['rhel'],
  },
  {
    id: 'rollback-gate-v3',
    workplaceWalkthrough: workplaceRecovery,
    phase: '08 · Prepare the software change',
    title: 'Checkpoint: what is your rollback plan?',
    time: lessonTime('rollback-gate-v3'),
    scenario:
      'File delivery and baseline checks are complete. Before installing any central components or endpoint agent, define how you will recover if risk increases.',
    objective:
      'Produce an approved, testable rollback plan for both hosts and identify the recovery artifacts before the installation window.',
    why: 'A snapshot is useful recovery material but not automatically a complete enterprise backup strategy. Azure managed-disk snapshots omit VM memory and network configuration; vSphere snapshots depend on their base disks. Templates/images are provisioning sources, not current application backups.',
    change:
      'Prepare a recovery checkpoint. An approved Azure disk snapshot creates billable storage; do not create it without the recorded cost/retention decision. No Wazuh installer is run in this task.',
    shell: 'RHEL 9 · Bash · rexuser · label each host',
    command: 'hostname\ndate -Is\nsystemctl --failed --no-pager',
    args: [
      'hostname identifies the guest being checkpointed. date -Is emits an ISO-style timestamp at seconds precision; record timezone so evidence can be correlated.',
      'systemctl --failed lists failed loaded units; --no-pager avoids an interactive pager. Capture existing failures so a later rollback is compared with reality.',
      'Retain the earlier package/service/storage/network inventories and the Windows file digest. These commands add identity/time/failure context; they are not a backup by themselves.',
    ],
    portal: [
      'Before any installer, write: change scope; exact selected release/artifact; hosts; expected effects; required access; pre-change evidence; recovery owner; time limit; rollback trigger; restore steps; validation; retention. The actual selected Wazuh release and vendor removal procedure must be filled in at the next milestone before execution, not invented here.',
      'For this fresh lab, an approved cold OS-disk checkpoint is simple: close work and deallocate the target VM; confirm Stopped (deallocated). In the actual managed OS disk’s page choose Create snapshot. Record subscription/group/region, source disk ID, snapshot name/time, and supported Standard/incremental choice. Review price and Create. Wait for successful completion and repeat for the other VM if its change is in scope. Snapshot every required data disk too if the design has acquired one.',
      'Record Azure VM/NIC/NSG/IP settings separately. Define the restore path with the owner: create a compatible managed disk from the snapshot, then either use the supported OS-disk swap on the deallocated original VM or restore a separate isolated test VM. Confirm generation, security/encryption compatibility, permissions, quota, bootability, and cost before choosing. Do not perform a destructive disk swap during this preparation task.',
      'Before the real change, validate recovery feasibility with the owner; a restore rehearsal on an isolated clone is stronger than “snapshot succeeded”. Any extra recovery-test VM must be explicitly budgeted and retired after evidence. Start the original VMs, recheck addresses and rexuser SSH, and note the checkpoint age. If meaningful state changes, refresh the recovery plan.',
      'Plan agent uninstall and manager-side de-registration as distinct actions. Package removal may leave config, logs, enrollment keys, repository files, or systemd overrides. Inspect transaction effects, preserve evidence, remove only documented lab-owned residue, and validate SSH, failed units, disk/mount health, networking, and expected application state after rollback. Never recursively erase an application directory as a universal uninstall.',
    ],
    expected:
      'A documented recovery decision and, where approved, verified snapshot IDs plus a compatible restore path. No installer is allowed to proceed with an unknown rollback owner, unfilled release/removal plan, or unverified recovery access.',
    verify:
      'Use the three decision branches below. Distinguish agent-only removal from restoring the central server. Define how a restored endpoint’s enrollment will be reconciled with the manager so stale or duplicate identities do not masquerade as success.',
    trouble:
      'A disk snapshot is not an application-consistent multi-disk backup by default. A restore can lose post-checkpoint data. Snapshot creation success alone does not prove restore permissions, disk compatibility, or boot success.',
    methodology: [
      'CHANGE WORKS → validate the full outcome → document evidence → close.',
      'CHANGE FAILS BUT IS FIXABLE → diagnose within the approved time/risk limit → make one justified change → retest.',
      'CHANGE FAILS AND RISK IS INCREASING → stop → execute approved rollback → validate restored state → document remaining impact.',
    ],
    rollback:
      'This is the pre-install go/no-go gate. Retain checkpoints until validation and retention approval; remove only the exact reviewed recovery artifacts afterward. A vSphere revert discards later changes too, while snapshot consolidation/deletion is not a revert. Enterprise backups add retention, independent copies, application consistency, and tested recovery beyond a temporary checkpoint.',
    challenge: 'Is “we have a snapshot” a complete rollback plan?',
    answer:
      'No. You also need scope, consistency, access, compatibility, restore steps, time/data-loss limits, validation, enrollment reconciliation, ownership, and retention. Do not begin the software change until the actual plan is approved.',
    vsphere:
      'Azure disk snapshot ≈ point-in-time recovery concept, not a one-to-one vSphere VM snapshot. vSphere snapshots are dependent deltas; a template provisions new VMs; an enterprise backup strategy protects and restores data under defined objectives.',
    sources: [
      'azureSnapshots',
      'vsphereSnapshots',
      'veeamPowerShell',
      'cost',
      'rhel',
    ],
  },
];
