import { wazuhLessons, wazuhSources } from './wazuh-lessons.ts';
import type { WalkthroughStep } from './wazuh-walkthroughs.ts';
import { lessonTime } from './course-timing.ts';
import { labLessons } from './lab-lessons.ts';
import { lessonOrder } from './course-roadmap.ts';
import { nsgWalkthrough } from './nsg-walkthrough.ts';
export { modules, primaryFlow } from './course-roadmap.ts';
export type Lesson = {
  walkthrough?: WalkthroughStep[];
  workplaceWalkthrough?: WalkthroughStep[];
  id: string;
  phase: string;
  title: string;
  time: string;
  scenario: string;
  objective: string;
  why: string;
  change: string;
  shell: string;
  command: string;
  args: string[];
  portal?: string[];
  expected: string;
  verify: string;
  trouble: string;
  methodology: string[];
  rollback: string;
  challenge: string;
  answer: string;
  visual?: 'keys' | 'architecture' | 'protocols';
  sources: string[];
  vsphere?: string;
  followup?: { shell: string; command: string; args: string[] };
};
export const adminAccount = 'rexuser';
export const changeMethod = [
  'Baseline',
  'Plan',
  'Backup / snapshot',
  'Change',
  'Verify',
  'Troubleshoot',
  'Validate',
  'Rollback if necessary',
  'Document',
];
export const sources: Record<string, { title: string; url: string }> = {
  ...wazuhSources,
  veeamPowerShell: {
    title:
      'Veeam · Backup & Replication PowerShell reference (select your version)',
    url: 'https://helpcenter.veeam.com/docs/vbr/powershell/veeam_psreference.html',
  },
  resourceGroups: {
    title: 'Microsoft · Resource groups, lifecycle and scope',
    url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview',
  },
  windows: {
    title: 'Microsoft · Windows OpenSSH key management',
    url: 'https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_keymanagement',
  },
  azure: {
    title: 'Microsoft · Create a Linux VM in the portal',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal',
  },
  network: {
    title: 'Microsoft · Virtual networks',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-network/quickstart-create-virtual-network',
  },
  nsg: {
    title: 'Microsoft · Network security groups',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview',
  },
  cost: {
    title: 'Microsoft · VM power states and billing',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/states-billing',
  },
  pricing: {
    title: 'Azure · Pricing calculator',
    url: 'https://azure.microsoft.com/en-us/pricing/calculator/',
  },
  keys: {
    title: 'Microsoft · SSH keys and host fingerprints',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/linux/mac-create-ssh-keys',
  },
  rhel: {
    title: 'Red Hat · RHEL 9 basic system settings',
    url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index',
  },
  fips: {
    title: 'Red Hat · Cryptographic policies',
    url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/security_hardening/using-the-system-wide-cryptographic-policies_security-hardening',
  },
  wazuh: {
    title: 'Wazuh · Agent and central-component architecture',
    url: 'https://documentation.wazuh.com/current/getting-started/architecture.html',
  },
};
const foundationLessons: Lesson[] = [
  {
    id: 'assignment-v2',
    phase: '01 · Windows workstation',
    title: 'Receive the assignment & plan the change',
    time: lessonTime('assignment-v2'),
    scenario:
      'You are at your Windows administrative workstation. No lab VM exists. Your assignment is to create one small RHEL 9 server in an approved Azure subscription, administer it as rexuser, and leave evidence that access and recovery work.',
    objective:
      'Define scope, record an empty baseline, and prepare a change record before creating billable resources.',
    why: 'Administrators are accountable for the target, purpose, impact, cost, and recovery path. A named Linux account ties work to an identity; sudo makes privilege deliberate. Your Windows sign-in and Azure identity are separate from rexuser.',
    change:
      'Only session variables on Windows. No VM, account, Azure resource, or package changes. Keep this PowerShell window open; variables disappear when the session closes.',
    shell: 'Windows · PowerShell',
    command:
      '$VmUser = "rexuser"\n$ResourceGroup = "rg-rhel9-lab"\n$VmName = "rhel9-lab-01"\n$VmUser, $ResourceGroup, $VmName',
    args: [
      '$ begins a PowerShell variable name; = assigns the value on its right. These are local notes, not Azure provisioning commands.',
      '$VmUser is the RHEL administrator account we will create: rexuser. It is not the Windows username or tenant identity.',
      '$ResourceGroup names the planned Azure lifecycle container. $VmName names the first VM. Quoted text is a string; the comma-separated final expression displays the three strings.',
    ],
    expected:
      'PowerShell prints rexuser, rg-rhel9-lab, and rhel9-lab-01. Azure remains unchanged.',
    verify:
      'Create a plain-text change record in an approved local folder: purpose; date/time; tenant/subscription; owner; resource names; region; budget; recovery contact; baseline (VM does not exist); proposed change; acceptance checks; rollback trigger; evidence. Leave unknown facts blank until verified. Never record private keys or passphrases.',
    trouble:
      'Existing resources with these names may belong to someone else. Do not overwrite them. Missing approval or recovery access is a reason to stop before deployment.',
    methodology: [
      'Separate facts from assumptions.',
      'Confirm who owns the subscription and who can recover a VM through Azure if SSH fails.',
      'Define acceptance: named account, verified server identity, RHEL 9, sudo capability, baseline evidence, and a deallocated VM at session end.',
    ],
    rollback:
      'There is nothing to restore yet. A snapshot is not possible or useful before a VM exists; document that decision. Before later destructive changes, choose a backup or snapshot and a tested restore plan. Skipping because no recoverable state exists is different from forgetting recovery.',
    challenge:
      'Name two reasons to stop before Create even if you know how to deploy a VM.',
    answer:
      'Unverified subscription or budget, unclear ownership, conflicting resource names, or no recovery access. Technical ability is only part of a controlled change.',
    sources: ['azure', 'cost'],
  },
  {
    id: 'windows-tools-v2',
    phase: '01 · Windows workstation',
    title: 'Check the tools & distinguish the protocols',
    time: lessonTime('windows-tools-v2'),
    scenario:
      'Before building anything in Azure, check that Windows can operate a remote shell and later transfer files securely.',
    objective:
      'Find OpenSSH tools and distinguish remote operation from file transfer.',
    why: 'An enterprise installer often arrives at a workstation first. SSH operates a remote shell, SCP copies files, and SFTP provides interactive file transfer. All can use SSH authentication, but moving a file does not install it.',
    change:
      'Read-only client checks. Installing a missing OpenSSH Client is a separate approved Windows change; do not install the Windows SSH server.',
    shell: 'Windows · PowerShell',
    command: 'Get-Command ssh, scp, sftp, ssh-keygen\nssh -V',
    args: [
      'Get-Command looks up how PowerShell resolves each command. Commas separate the four names; inspect each result because one tool can be missing while others exist.',
      'ssh remotely operates a server. scp securely copies files. sftp starts interactive secure file transfer. ssh-keygen creates or inspects SSH keys.',
      'Uppercase -V prints the SSH client version and exits. Case matters: lowercase flags can mean something different.',
      'Check the executable path, commonly C:\\Windows\\System32\\OpenSSH, against your approved installation. This is a Windows path, not a RHEL path.',
    ],
    expected:
      'Four executable locations and an OpenSSH version. Nothing connects to Azure.',
    verify:
      'If a tool is missing, add OpenSSH Client through Windows Settings → Optional features, with workstation-administrator authorization if required. Reopen PowerShell, repeat the checks, and restore task-one variables.',
    trouble:
      '“Not recognized” means an executable/PATH issue, not a RHEL firewall. Multiple installations can select an unexpected client. SFTP is not FTP over TLS; it uses SSH. Modern scp may use SFTP underneath.',
    methodology: [
      'Identify the missing command and expected installation.',
      'Check Windows Optional features and PATH with the workstation administrator.',
      'Repeat the local lookup before investigating a server that does not yet exist.',
    ],
    rollback:
      'These checks change nothing. Record any optional-feature installation; do not remove an existing client used by other workflows.',
    challenge:
      'Which tool fits a service check, a direct installer copy, and interactive browsing of a remote upload directory?',
    answer:
      'SSH, SCP, and SFTP respectively. None grants permissions beyond the authenticated account.',
    visual: 'protocols',
    sources: ['windows'],
  },
  {
    id: 'azure-scope-v2',
    phase: '02 · Azure foundations',
    title: 'Choose the tenant, subscription & spending boundary',
    time: lessonTime('azure-scope-v2'),
    scenario:
      'Your Azure identity may have access to multiple directories and subscriptions. You must select the approved lab scope before creating anything.',
    objective:
      'Verify authorization and billing scope; estimate one modest RHEL VM.',
    why: 'A tenant is an identity directory. A subscription is a resource and billing boundary. A resource group organizes resources inside it. Signing in is not the same as having permission to create resources.',
    change:
      'Portal context and a cost plan. An optional budget alert is a notification, not a spending cap. The course app does not provision Azure resources automatically.',
    shell: 'Windows · PowerShell · record verified selections',
    command:
      '$SubscriptionId = "REPLACE_WITH_APPROVED_SUBSCRIPTION_ID"\n$Region = "REPLACE_WITH_APPROVED_REGION"\n$SubscriptionId, $Region',
    args: [
      'Replace both placeholder strings with verified values. $SubscriptionId means the subscription ID, not its tenant ID.',
      '$Region records the Azure region; keep this lab in one approved region.',
      'These assignments and the final print expression do not create resources. Azure CLI and Azure PowerShell modules are not required for this portal-led lab.',
    ],
    portal: [
      'Open https://portal.azure.com and complete normal sign-in/MFA. Use the directory/subscription control (often Portal settings → Directories + subscriptions) to select the approved directory. Search Subscriptions and open the approved subscription.',
      'Record name, ID, tenant, region, and cost owner. Use Access control (IAM) → View my access. Have the owner confirm permission to create the lab resources and use VM Run Command for recovery; do not grant yourself extra access.',
      'Use Azure Pricing Calculator and the VM-form estimate. Compare one pay-as-you-go RHEL 9 x64 VM, initially a burstable 2-vCPU/4-GiB size such as B2s where available, an image-sized Standard SSD OS disk, and one Standard public IPv4 address. Rates and SKUs vary; no fixed price or free-tier eligibility is assumed.',
      'Review Cost Management + Billing → Cost analysis and, if authorized, Budgets. Record a spending limit and session duration; configure alerts if appropriate. Alerts can lag and do not stop spend. Keep organization-mandated security services.',
    ],
    expected:
      'A verified subscription and estimate including compute/RHEL software, disk, public IP, and possible outbound data charges.',
    verify:
      'Read the selected subscription before each creation form. Resource groups, basic VNets, and NSGs have no standalone base charge. VM, storage, IP, and optional services can incur charges. Do not add Bastion, NAT Gateway, a load balancer, paid log workspace, backups, or a second VM now.',
    trouble:
      'Filters, RBAC, quotas, capacity, policies, or marketplace access can block creation. A small VM is not necessarily free, and a guest OS shutdown can leave compute billable.',
    methodology: [
      'Check identity and scope first, then RBAC, then quota/policy errors.',
      'Record exact validation errors; do not switch subscriptions or choose an expensive default to bypass them.',
      'If public SSH is prohibited, use an existing approved private route; do not buy a gateway or bypass policy for this lab.',
    ],
    rollback:
      'Correct wrong portal context before proceeding. No infrastructure exists. Keep approved budget alerts. Deallocation stops compute usage but not every resource charge.',
    challenge: 'Does a budget alert guarantee the lab stops at that amount?',
    answer:
      'No. Alerts report thresholds and can lag. Deallocation, cleanup, and actual-cost review are separate responsibilities.',
    sources: ['cost', 'pricing', 'azure'],
  },
  {
    id: 'resource-group-v2',
    phase: '02 · Azure foundations',
    title: 'Create the lab resource group',
    time: lessonTime('resource-group-v2'),
    scenario:
      'The subscription is approved. Give the new lab resources a clearly owned container so they can be found and retired together.',
    objective:
      'Create rg-rhel9-lab as the dedicated home for this lab’s resources and record ownership and purpose.',
    why: 'For this lab, one dedicated resource group is the recommended default: both VMs, their NICs, disks, public IPs, VNet and NSGs share an owner and lifecycle. Keeping them together simplifies inventory, scoped access, cost review and eventual cleanup. Grouping does not reduce resource prices or create network connectivity; a resource group is a management scope, not a network boundary.',
    change:
      'Create one empty resource group. Its region stores group metadata; resource regions are still chosen separately.',
    shell: 'Windows · PowerShell · confirm the planned name',
    command: '$ResourceGroup = "rg-rhel9-lab"\n$ResourceGroup',
    args: [
      '$ResourceGroup holds the exact name to enter in the portal. The next line displays it; neither line creates a group.',
      'The rg- prefix is a naming convention, not a command or permission.',
    ],
    portal: [
      'Search Resource groups → Create. Select the verified subscription, enter rg-rhel9-lab, and choose the approved region.',
      'Add tags such as purpose = rhel9-refresher and owner = your approved owner identifier. Tags are searchable metadata, not access-control rules. Avoid sensitive values.',
      'Review + create, inspect scope and spelling, then Create. Open the group and record its resource ID and empty inventory.',
      'For each later Create form, select the same subscription and the existing rg-rhel9-lab in Resource group. Do not choose Create new each time. Check the group again on Review + create, including related NICs, disks and public IPs.',
      'Keep unrelated or production resources out of this disposable lab group. Use separate groups when resources have different owners, access policies or retirement dates—for example, a shared network or recovery copies that must outlive the lab. Record any deliberate exception and its resource ID.',
      'Temporary lab snapshots can use this group while the lab exists. Recovery copies intended to survive group deletion belong in a separately managed recovery scope. Before eventual cleanup, inspect the entire resource list: deleting a populated group targets its contained resources, including snapshots. It is not the same as stopping the VMs.',
      'Resource-group tags do not automatically propagate to resources. Apply required owner/purpose tags on each resource’s Tags page too. After provisioning, return to Resource groups → rg-rhel9-lab → Resources to check the inventory; review costs at this scope when cost data is available.',
    ],
    expected: 'One empty group in the intended subscription; no VM is running.',
    verify:
      'Compare subscription ID and group name to the change record. The resource list should be empty; existing contents require an ownership check.',
    trouble:
      'Duplicate names can reveal someone else’s group. AuthorizationFailed or policy denial needs the owner, not another random scope.',
    methodology: [
      'Read the exact scope named in the error.',
      'Inspect any existing group’s tags and ownership without modifying it.',
      'Have the owner resolve permission or agree on a unique name; use any approved name change consistently.',
    ],
    rollback:
      'An accidentally created empty lab-only group can be removed after confirming its identity and empty inventory. Deleting a populated resource group is destructive and not a routine troubleshooting step.',
    challenge:
      'Why use one group for this lab, when would you split resources out, and does the group make the VMs communicate?',
    answer:
      'One lab group makes related resources easier to find, review and retire together. Split out shared resources or recovery copies with a longer lifecycle. Group membership does not provide connectivity: VNet/subnet placement, routes, NSGs and guest firewalls still determine communication.',
    sources: ['azure', 'resourceGroups'],
  },
  {
    id: 'network-plan-v2',
    phase: '02 · Azure foundations',
    title: 'Build one VNet and one subnet',
    time: lessonTime('network-plan-v2'),
    scenario:
      'The lab group exists but there is no server. Give the future VM a private network location.',
    objective:
      'Create vnet-rhel9-lab and snet-rhel9-lab; understand the address ranges before using an IP.',
    why: 'A VNet defines private address space; a subnet divides it. For this lab, your workstation reaches a public IP mapped to the VM NIC while RHEL sees a private IP. Those addresses have different jobs.',
    change:
      'Create VNet 10.0.0.0/16 and subnet 10.0.1.0/24 if they do not overlap networks the lab must reach. No gateway or VM is created.',
    shell: 'Windows · PowerShell · planning values',
    command:
      '$VnetName = "vnet-rhel9-lab"\n$SubnetName = "snet-rhel9-lab"\n$VnetCidr = "10.0.0.0/16"\n$SubnetCidr = "10.0.1.0/24"\n$VnetCidr, $SubnetCidr',
    args: [
      'The name variables document portal selections. CIDR strings describe ranges, not a host to SSH to.',
      '/16 fixes 16 leading network bits; /24 fixes 24. The /24 subnet sits inside the /16 VNet. A larger prefix number means a smaller range.',
      '10.0.1.0/24 contains 256 addresses before reservations. Azure reserves the first four and last subnet addresses; do not manually assign the subnet address or gateway to the VM.',
      'These commands print a plan only. Example 10.0.1.10 is not guaranteed to become the VM address.',
    ],
    portal: [
      'Search Virtual networks → Create. Select the verified subscription, rg-rhel9-lab, name vnet-rhel9-lab, and approved region.',
      'In IP addresses, use IPv4 space 10.0.0.0/16. Edit/replace the default subnet with snet-rhel9-lab at 10.0.1.0/24. Leave no unnecessary additional subnets.',
      'Keep Azure-provided DNS and standard routing. Do not add Bastion, Azure Firewall, VPN/NAT Gateway, peering, or paid DDoS options for this isolated lab; retain organization-mandated controls. We will use an explicit VM public IP rather than rely on implicit default outbound access.',
      'Review ranges, then Create. Open Subnets and confirm the intended subnet. Portal labels can change; compare actual configuration to the plan.',
    ],
    expected:
      'One VNet and one subnet, with Azure-managed address allocation and DNS. No compute charge has begun.',
    verify:
      'Record CIDRs, region, and access route. A private address is not reachable from an ordinary home internet connection. Use the forthcoming public IP unless an existing approved VPN/private route is available.',
    trouble:
      'Overlapping ranges cause ambiguous routing when VPN/peering is introduced. A network in the wrong region can prevent VM attachment. A default route alone is not proof of outbound internet translation.',
    methodology: [
      'Compare subnet membership and region first.',
      'Check intended routes and overlaps before editing address space.',
      'For policy-restricted private networks, obtain the existing inbound and outbound connection plan from the owner; do not add billable network appliances just for the tutorial.',
    ],
    rollback:
      'Before NICs exist, correct an empty incorrect subnet/VNet after dependency review. Once a VM attaches, changing or deleting the subnet is disruptive and needs a separate plan.',
    challenge: 'Why not copy example address 10.0.1.10 directly into SSH?',
    answer:
      'Your assigned IP may differ, and a private IP needs a private route. Read the actual NIC inventory and choose a destination reachable from Windows.',
    visual: 'architecture',
    sources: ['network'],
  },
  {
    id: 'nsg-v2',
    phase: '02 · Azure foundations',
    title: 'Limit the SSH entry point',
    time: lessonTime('nsg-v2'),
    scenario:
      'A public IP will provide lab access without buying a gateway. Prepare a restrictive rule before exposing the VM.',
    objective:
      'Create nsg-rhel9-lab with a TCP 22 allowance from your current public IPv4 used for outbound connections only.',
    why: 'An NSG filters Azure traffic. It is separate from Linux firewalld and SELinux. You need reachability and authentication; an allow rule supplies neither a username nor a key.',
    change:
      'Create one NSG and a source-restricted inbound rule. VM NIC association happens during provisioning. No Wazuh ports are opened.',
    shell: 'Windows · PowerShell · record the approved source',
    command:
      '$AdminSourceCidr = "REPLACE_WITH_YOUR_PUBLIC_IPV4/32"\n$AdminSourceCidr',
    args: [
      'Replace the entire placeholder with your verified public IPv4 used for outbound connections followed by /32. $AdminSourceCidr records that planned rule value.',
      '/32 selects one IPv4 address; it is not a port. A Windows LAN address like 192.168.x.x usually is not the public source Azure receives.',
      'Use your organization’s approved IP-check method or Azure My IP, confirming the VPN/proxy path. This command records a value; it does not discover or authorize the source.',
    ],
    portal: [
      'Search Network security groups → Create. Use rg-rhel9-lab, the approved region, and nsg-rhel9-lab. Create and open it.',
      'Inbound security rules → Add: Source = IP Addresses; Source CIDR = your public IPv4/32; Source port ranges = *; Destination = Any; Service = Custom; Destination port ranges = 22; Protocol = TCP; Action = Allow; Priority = 300; Name = Allow-SSH-rexuser-workstation.',
      'Review and Add. No Any-source SSH rule. Source port * is appropriate because the Windows client chooses a temporary source port; destination 22 identifies the server’s SSH listener.',
      'Inspect all rules. Lower priority numbers are evaluated first. Defaults include virtual-network allowances; this is restricted internet SSH, not isolation from every future VNet resource. Keep this dedicated lab VNet unpeered.',
    ],
    expected:
      'The NSG contains one custom source-specific allowance plus Azure defaults. It is not attached yet.',
    verify:
      'Check /32 source, TCP destination 22, Allow, priority 300, and no broader custom SSH rule. Destination Any is bounded by NSG association; attach it only to the intended lab NIC later.',
    trouble:
      'My IP may reflect a browser proxy while SSH follows another route. A changing public IP breaks access. Traffic must pass both subnet and NIC NSGs if both exist; an earlier deny can override this allow.',
    methodology: [
      'Check the actual source and association, not just the existence of a rule.',
      'Inspect effective rules and routes.',
      'If your public address changes, record the old value, update only the source /32, and retest. Never use 0.0.0.0/0 as a diagnostic shortcut.',
    ],
    rollback:
      'Before association there is no live traffic change. For later edits, record previous values and retain Azure recovery access. Restore only the previous specific rule if needed; do not delete all NSG rules.',
    challenge:
      'Why is Source port * acceptable while Source IP Any is not intended?',
    answer:
      'The client’s ephemeral source port is unpredictable, but its public address can be restricted. These are different packet fields.',
    sources: ['nsg'],
  },
  {
    id: 'key-concept-v2',
    phase: '03 · SSH identity',
    title: 'Understand which key belongs where',
    time: lessonTime('key-concept-v2'),
    scenario:
      'The network is prepared. Understand what you will hand to Azure and what must stay on Windows before authorizing access.',
    objective:
      'Distinguish the private identity, public partner, server authorized_keys, and server host keys.',
    why: 'In plain language the private key proves “I am rexuser.” More precisely, it proves possession of a key the server has authorized for rexuser. Its filename or comment cannot grant an account. The server never needs your private key.',
    change:
      'Calculate local paths only. No key exists yet unless you made one previously. Later, only the public key goes into the Azure VM form.',
    shell: 'Windows · PowerShell',
    command:
      '$SshDirectory = "$env:USERPROFILE\\.ssh"\n$KeyPath = "$SshDirectory\\rexuser_ed25519"\n$PublicKeyPath = "$KeyPath.pub"\n$KeyPath, $PublicKeyPath',
    args: [
      '$env:USERPROFILE expands to the current Windows account’s home. Double quotes expand variables in a path. Your Windows account name need not be rexuser.',
      '~/.ssh is shorthand for a .ssh directory beneath your home. PowerShell commands here use the explicit profile path to avoid ambiguity.',
      '$KeyPath names the private identity file rexuser_ed25519, with no .pub. It holds cryptographic material used by the client to prove identity.',
      '$PublicKeyPath appends .pub and contains the matching public key. This is the half you supply to Azure.',
      'On RHEL, ~ means the logged-in Linux account’s home, normally /home/rexuser. ~/.ssh/authorized_keys lists public keys authorized for that account. It is on a different computer from the Windows .ssh folder.',
    ],
    expected:
      'Two Windows paths print, one ending in .pub. They are names, not proof that the files exist.',
    verify:
      'Use the diagram to locate the secret. Explain authorized_keys (who may access this account) versus Windows known_hosts (which server identities this client trusts).',
    trouble:
      'If a file begins “BEGIN OPENSSH PRIVATE KEY”, you opened the secret, not the public line. The server’s host public key also is not the public key for your rexuser account.',
    methodology: [
      'Identify the machine and account whose home a path refers to.',
      'Check purpose and suffix before copying any content.',
      'For suspected private-key exposure, establish another approved access path, generate a replacement pair, authorize/test it, and revoke the exposed public entry. Deleting a leaked local file does not revoke it.',
    ],
    rollback:
      'No files change here. Later key rotation needs another confirmed access path and targeted revocation; do not overwrite all of authorized_keys.',
    challenge:
      'Can you delete the private key once Azure accepts its public partner?',
    answer:
      'No. Windows still needs it to authenticate. Azure and RHEL cannot reconstruct the private half from the public half.',
    visual: 'keys',
    sources: ['windows', 'keys'],
  },
  {
    id: 'key-create-v2',
    phase: '03 · SSH identity',
    title: 'Create and inspect the rexuser key pair',
    time: lessonTime('key-create-v2'),
    scenario:
      'You understand the ownership boundary. Create the local credential before provisioning the VM.',
    objective:
      'Create a passphrase-protected Ed25519 pair without overwriting an existing identity.',
    why: 'A dedicated key limits accidental reuse. Its passphrase protects the private file at rest; it is not a Linux password and is not sent to RHEL.',
    change:
      'Create .ssh if needed and two local files. This branch assumes standard non-FIPS RHEL 9. Ed25519 is not permitted in FIPS mode; do not disable FIPS or weaken crypto policy. If FIPS is required, stop and obtain an owner-approved RSA key procedure instead.',
    shell: 'Windows · PowerShell',
    command:
      'New-Item -ItemType Directory -Path $SshDirectory -Force\nTest-Path -LiteralPath $KeyPath\nTest-Path -LiteralPath $PublicKeyPath\n# Continue only if BOTH checks are False.\nssh-keygen -t ed25519 -f "$KeyPath" -C "rexuser-rhel9-lab"\nssh-keygen -l -f "$PublicKeyPath"\nGet-Content -LiteralPath $PublicKeyPath',
    args: [
      'New-Item creates an item; -ItemType Directory chooses a folder. -Path selects .ssh. -Force tolerates an existing directory, not permission to overwrite a key.',
      'Test-Path -LiteralPath checks the exact path without wildcard interpretation. If either file exists, stop generation and verify that pair and its ownership, or choose an explicitly approved new filename.',
      '# is a PowerShell comment. The decision gate is not an automatic guard: run these lines one at a time.',
      'ssh-keygen -t ed25519 chooses the algorithm, whose key size is fixed; no -b is needed. -f chooses the private output path; the tool adds .pub for its public partner.',
      '-C adds metadata, not authorization. Enter a unique passphrase twice at the prompts; input may not echo. If an overwrite prompt appears, answer n and stop.',
      'ssh-keygen -l lists a fingerprint; -f selects the public file. The SHA256 fingerprint is a short comparison identifier, not the public key data.',
      'Get-Content -LiteralPath reads only the public file. Its single line begins ssh-ed25519, followed by encoded data and a comment. Never copy the file without .pub.',
    ],
    expected:
      'Two files, a public SHA256 fingerprint, and one public-key line. No Azure account changes yet.',
    verify:
      'Record only the public fingerprint. Inspect Windows Properties → Security on the private file: access should be limited to your identity and approved system/administrative principals, not Everyone or a team share. Keep the key outside shared/synced team folders and never put it in a ticket.',
    trouble:
      'Overwriting an existing identity can destroy access. A lost passphrase cannot be recovered from the public key. A FIPS policy can reject Ed25519 even when Azure accepts the format.',
    methodology: [
      'Separate local path/permission errors from cryptographic-policy rejection.',
      'Confirm filenames, both existence checks, and approved Windows permissions.',
      'For FIPS requirements, change the approved key plan with the owner; do not change server policy to fit the tutorial.',
    ],
    rollback:
      'Before authorization, an unused new pair can be retired under local policy. After authorization, first establish another working identity, remove only this public entry on the server, then retire the file. Keep this working pair for subsequent labs.',
    challenge:
      'Would renaming another key to rexuser_ed25519 grant rexuser access?',
    answer:
      'No. The server verifies the cryptographic key authorized for that account, not the filename or comment.',
    sources: ['windows', 'keys', 'fips'],
  },
  {
    id: 'vm-provision-v2',
    phase: '04 · Provision RHEL',
    title: 'Provision the small RHEL 9 VM as rexuser',
    time: lessonTime('vm-provision-v2'),
    scenario:
      'The group, subnet, NSG, and Windows key pair are ready. Now create the first server with a reviewed configuration.',
    objective:
      'Create rhel9-lab-01, authorize the public key for rexuser, and inspect the resulting inventory.',
    why: 'Provisioning defines identity, storage, exposure, and cost before login. Defaults are not your change plan. This small command-line VM is not a sizing recommendation for a later Wazuh manager.',
    change:
      'Create one billable VM, managed OS disk, NIC, and Standard public IPv4. Initialize rexuser with public-key authorization. No Wazuh, data disk, or second VM.',
    shell: 'Windows · PowerShell · public key only',
    command: '$VmUser = "rexuser"\nGet-Content -LiteralPath $PublicKeyPath',
    args: [
      '$VmUser is explicitly rexuser; enter that exact account rather than a suggested username.',
      'Get-Content -LiteralPath reads the previously prepared .pub file. Copy the full public-key line, not the fingerprint or private identity.',
    ],
    portal: [
      'Virtual machines → Create → Azure virtual machine. Basics: verified subscription; existing rg-rhel9-lab; name rhel9-lab-01; approved region; single instance with no redundant infrastructure. Do not use Spot: eviction is unnecessary complexity here.',
      'Choose an official Red Hat-published RHEL 9 x64 Gen2 pay-as-you-go image, not another major version, a community image, or a pre-hardened/FIPS image. Record exact publisher/offer/version and software price. Keep compatible Trusted Launch protections where offered; Trusted Launch is separate from guest FIPS mode. Do not claim BYOS/Hybrid Benefit without owner-confirmed licensing.',
      'Compare a small supported burstable size around 2 vCPU / 4 GiB, for example B2s if available. Review the live cost. Under Administrator account: SSH public key, Username rexuser, Use existing public key, then paste the public line. Select no automatically generated public inbound-port rule on Basics.',
      'Disks: one Standard SSD managed OS disk at the image-supported default/minimum size (commonly 64 GiB; verify your image); no data disks. Networking: existing vnet-rhel9-lab and snet-rhel9-lab; one new Standard static public IPv4; Advanced NIC network security group → existing nsg-rhel9-lab. No additional broad SSH rule, load balancer, Bastion, or NAT Gateway.',
      'Keep the VM agent and managed boot diagnostics for recovery. Avoid optional paid backups, workspaces, and monitoring extensions unless policy requires them. No custom installation script. Configure Auto-shutdown at a sensible time and time zone, or do so immediately after deployment if the wizard does not offer it.',
      'Review + create: reread image, cost, rexuser, existing public-key source, disk, NIC NSG, and resource list. Then Create. Wait for success and Go to resource. Record NIC, disk, public/private IPs, image, size, and resource IDs. Verify Auto-shutdown under Operations.',
    ],
    expected:
      'One running RHEL VM plus NIC, OS disk, and public IP. Provisioning creates rexuser and its public authorization, normally /home/rexuser/.ssh/authorized_keys.',
    verify:
      'Compare deployment outputs and Overview to the plan. Under Networking confirm the actual NIC NSG association and effective source-restricted rule. Check for unexpected disks, VMs, gateways, or workspaces. Provisioning success is not yet proof of login.',
    trouble:
      'Terms, quota, regional capacity, policy, and malformed keys can fail deployment. Partial failures may leave billable resources. Do not work around an incorrect account by substituting another username in SSH; correct the fresh lab through the approved recovery/provisioning path.',
    methodology: [
      'Read the failed deployment operation and exact resource/error.',
      'Compare the failing field to the plan; distinguish capacity/quota from invalid key data.',
      'Inventory partial resources before retrying; reuse or remove only reviewed lab leftovers instead of creating repeated copies.',
    ],
    rollback:
      'Before useful data exists, an incorrect VM can be rebuilt after review. Preserve group/network/key where appropriate and check whether disks/IPs remain. Once valuable state exists, rebuild is no substitute for backup/restore.',
    challenge: 'What if the wizard asks you to download a new private key?',
    answer:
      'The key source is probably Generate new key pair. Return to the account settings and choose your existing public key. The private key in this workflow already stays on Windows.',
    sources: ['azure', 'keys', 'pricing'],
  },
  {
    id: 'reachability-v2',
    phase: '05 · Establish trust',
    title: 'Test the path from Windows',
    time: lessonTime('reachability-v2'),
    scenario:
      'Azure reports the new VM is running. You need evidence that this workstation can reach its SSH listener.',
    objective:
      'Choose the actual reachable VM address and test TCP 22 before diagnosing authentication.',
    why: 'Networking and identity fail differently. A TCP check isolates routing/NSG/listener issues from key and account problems.',
    change:
      'Set a local destination variable and send a TCP probe. No server configuration changes.',
    shell: 'Windows · PowerShell',
    command:
      '$VmAddress = "REPLACE_WITH_ACTUAL_VM_PUBLIC_IPV4"\nTest-NetConnection -ComputerName $VmAddress -Port 22 -InformationLevel Detailed',
    args: [
      'Copy the actual public IPv4 from this VM’s Azure Overview. For an approved private route only, substitute its verified private IP. $VmAddress is a destination, not the workstation’s public source IP used in the NSG.',
      'Test-NetConnection performs Windows network diagnostics. -ComputerName accepts the IP or DNS name to probe.',
      '-Port 22 selects the standard SSH TCP port. -InformationLevel Detailed displays the resolved target, source/interface, and test outcome.',
    ],
    expected:
      'TcpTestSucceeded : True. Ping can fail while TCP succeeds because ICMP and TCP are separate traffic types.',
    verify:
      'Compare RemoteAddress to the VM inventory and inspect TcpTestSucceeded. True proves a reachable TCP listener, not the server’s cryptographic identity or permission to log in.',
    trouble:
      'Timeout suggests a dropped/blocked path or stopped VM. Refused connections suggest a reached host without the expected listener or an active reject. DNS lookup failures are different again.',
    methodology: [
      'Confirm this VM is Running and the destination is current.',
      'Check your public source address ending in /32, NIC/subnet NSG associations, effective rules, VPN, and routing.',
      'If the Azure path is correct, have the recovery owner inspect sshd and the guest firewall through Run Command/console. Do not disable firewalls or SELinux. Retest after one explained change.',
    ],
    rollback:
      'The probe is read-only. For a temporary approved NSG correction, record prior values and restore them if the change does not achieve the expected result. Keep an independent Azure recovery path.',
    challenge:
      'Does TcpTestSucceeded : True mean your public key is authorized?',
    answer:
      'No. It only establishes transport reachability. Account authorization and server trust are separate checks in the next tasks.',
    sources: ['nsg', 'keys'],
  },
  {
    id: 'host-trust-v2',
    phase: '05 · Establish trust',
    title: 'Obtain the server fingerprint independently',
    time: lessonTime('host-trust-v2'),
    scenario:
      'The SSH port responds, but you have not trusted that server. Get the expected host fingerprint from Azure before accepting the SSH prompt.',
    objective:
      'Record the RHEL server’s public host-key fingerprint through a trusted control-plane path.',
    why: 'Your private account key identifies you to the server. A separate host key identifies the server to you. Accepting an unknown fingerprint without comparison skips the second half of that trust relationship.',
    change:
      'Run a read-only fingerprint command through Azure VM Run Command. This recovery mechanism runs under the VM agent’s privileged context; it is a specific exception, not a routine root login. Normal administration will use rexuser and sudo.',
    shell: 'Azure VM · Run Command → RunShellScript',
    command: 'ssh-keygen -l -f /etc/ssh/ssh_host_ed25519_key.pub',
    args: [
      'ssh-keygen can inspect keys as well as create them. -l lists the fingerprint instead of generating a key. -f selects the file.',
      '/ is the Linux filesystem root. /etc holds system configuration; /etc/ssh holds SSH configuration and host keys.',
      'ssh_host_ed25519_key.pub is this server’s public Ed25519 host key, not rexuser’s public key and not a private file. The .pub suffix matters.',
    ],
    portal: [
      'Open the exact VM recorded earlier → Operations → Run command → RunShellScript (search the VM menu if labels differ). Confirm VM name, resource group, and subscription.',
      'Paste only the displayed read-only command and Run. Record the complete SHA256 fingerprint and algorithm from successful output. If your role cannot run it, ask the recovery owner to obtain this fingerprint through an established trusted channel.',
      'If that host-key file does not exist, have the owner list the fingerprint of the actual offered RSA or ECDSA host public key using the same -l -f options and its verified .pub path. Never guess a fingerprint, use an untrusted SSH scan as your only proof, or enable weak algorithms.',
    ],
    expected:
      'A key size, SHA256 fingerprint, optional comment, and algorithm. Record the exact SHA256 value; do not use the account-key fingerprint from the Windows task.',
    verify:
      'Confirm Run Command succeeded on the intended VM. In the next SSH prompt compare the same algorithm and full fingerprint character for character. If no trusted fingerprint is available, stop at the connection prompt.',
    trouble:
      'Run Command depends on Azure permission, the VM agent, and a working platform channel. Failure is not proof that SSH itself is broken. A different fingerprint may mean a wrong VM or legitimate rebuild, but cannot be assumed harmless.',
    methodology: [
      'Separate Azure authorization failure from VM agent unavailability or missing host-key file.',
      'Confirm the VM resource identity and boot/agent status.',
      'Use the established recovery owner/channel to obtain the matching host fingerprint. Investigate mismatches before accepting trust.',
    ],
    rollback:
      'Reading a public fingerprint changes no SSH configuration. Do not rotate host keys or clear known_hosts as a diagnostic shortcut. A planned rebuild requires documenting the new verified host identity.',
    challenge:
      'Can you compare this fingerprint to the public rexuser key you generated on Windows?',
    answer:
      'No. They identify different keys: a server host versus a client credential. Compare this host fingerprint only with the matching SSH server prompt.',
    sources: ['keys'],
  },
  {
    id: 'first-ssh-v2',
    phase: '05 · Establish trust',
    title: 'Make the first SSH connection as rexuser',
    time: lessonTime('first-ssh-v2'),
    scenario:
      'TCP 22 is reachable and you have the expected host fingerprint. Authenticate from Windows using the private key that stayed there.',
    objective:
      'Open an encrypted session as rexuser and understand each part of the authentication exchange.',
    why: 'A successful login should be explainable: the network delivered packets, the host identity matched, and the server accepted a signature from a key authorized for rexuser. Knowing the sequence makes troubleshooting precise.',
    change:
      'Open a remote session. Accepting a verified first-use host prompt adds the host identity to Windows ~/.ssh/known_hosts. No package or service is installed.',
    shell: 'Windows · PowerShell → RHEL SSH session',
    command:
      '$VmUser = "rexuser"\nssh -i "$KeyPath" -o IdentitiesOnly=yes "$VmUser@$VmAddress"',
    args: [
      'ssh is the local secure-shell client. -i selects an identity file: the Windows private key at $KeyPath, normally ~/.ssh/rexuser_ed25519 under the Windows profile.',
      'Double quotes protect paths containing spaces and expand variables. The private key stays on Windows; SSH sends a cryptographic proof, not that file.',
      '-o introduces an SSH configuration option. IdentitiesOnly=yes limits offered identities to explicitly configured identity files, avoiding unrelated SSH-agent identities.',
      '$VmUser expands to rexuser, the named account created on RHEL. @ separates the requested account from the destination. $VmAddress expands to the actual reachable VM IP, not a sample address.',
      'SSH uses TCP 22 by default. During key exchange the server proves its host identity. After you verify it, your client signs session-bound authentication data using the private key; the server verifies that signature against a public key authorized for rexuser.',
      'If prompted, compare the full server SHA256 fingerprint and algorithm to the independently obtained value before typing yes. The private-key passphrase unlocks the local key; it is not sent as a Linux password.',
    ],
    expected:
      'After verified trust and key authentication, you see a RHEL shell prompt, normally containing rexuser and the host. This is now a Linux shell, so do not paste PowerShell variables into it.',
    verify:
      'Confirm the prompt changed, then use the next task’s identity checks. A prompt is a useful clue, but it can be customized; commands will provide stronger evidence.',
    trouble:
      'Permission denied (publickey) points to account/key authorization, not usually NSG. “Identity file not accessible” is a local path error. “REMOTE HOST IDENTIFICATION HAS CHANGED” requires investigation, not automatic known_hosts deletion.',
    methodology: [
      'Classify the failure: local file, TCP path, host trust, or account authentication.',
      'For key rejection, compare rexuser, private-key path, and the public key entered at provisioning. Ask the recovery owner to check rexuser authorization and permissions without transferring your private key.',
      'For a host mismatch, confirm the VM was rebuilt through trusted inventory and compare the new fingerprint. Only then make a targeted trust-record update under the approved procedure.',
    ],
    rollback:
      'exit closes the session without changing services. Keep known_hosts as a trust record. Do not enable password login or root login to work around a rejected key.',
    challenge: 'Why does the server not need a copy of your private key?',
    answer:
      'It verifies a signature using the matching authorized public key. Only the client needs the private half to create that proof; the server must never receive it.',
    visual: 'keys',
    sources: ['keys', 'windows'],
  },
  {
    id: 'identity-v2',
    phase: '06 · RHEL orientation',
    title: 'Verify identity and available privilege',
    time: lessonTime('identity-v2'),
    scenario:
      'You reached a Linux prompt. First establish who is executing commands and what privilege that account can request.',
    objective:
      'Verify rexuser, its numeric/group identity, and sudo authorization without switching to a root shell.',
    why: 'Linux permissions depend on numeric identities and group membership, not merely a friendly prompt. sudo policy is a separate control; group membership alone is not proof of permission.',
    change:
      'Read identity and sudo policy. sudo may authenticate and update its local credential timestamp; no account or group is edited.',
    shell: 'RHEL 9 · Bash · rexuser',
    command: 'whoami\nid\nsudo -l',
    args: [
      'whoami prints the effective username of this shell. No arguments are needed; expect rexuser.',
      'id reports the current UID (numeric user ID), primary GID (group ID), and supplementary groups. With no account argument it inspects the current process identity; do not assume specific numbers.',
      'sudo requests an operation under policy-controlled privileges. -l (lowercase L) lists what you may run rather than starting a root shell. root is the special UID 0 account; it is not our normal login.',
      'If sudo requests a password, that is the Linux account password, not the SSH-key passphrase. A key-provisioned Azure administrator often has passwordless sudo; verify actual policy instead of assuming it.',
    ],
    expected:
      'whoami returns rexuser. id lists its UID/GID/groups. sudo -l lists permitted commands, possibly a NOPASSWD rule.',
    verify:
      'Record the actual identity, group memberships, and sudo scope. If NOPASSWD is broad, document that this is the lab provisioning policy, not automatically the right enterprise policy. Stay in the rexuser shell.',
    trouble:
      'Wrong identity means you may be in the wrong session. Being in wheel can be relevant on RHEL but does not guarantee the current sudo policy. A password prompt with no known Linux password requires the owner’s provisioning review.',
    methodology: [
      'Stop privileged work if whoami is not rexuser.',
      'Compare the connection target and account to the change record.',
      'For sudo denial, give the recovery owner the exact result and request the intended scoped permission. Do not edit sudoers blindly, guess passwords, or log in as root.',
    ],
    rollback:
      'Read-only checks need no policy rollback. If permissions are later changed, baseline the policy, validate syntax through the approved sudo workflow, and retain a second access path before testing.',
    challenge: 'Why run both id and sudo -l?',
    answer:
      'id explains the identity and groups used for ordinary access checks. sudo -l explains the privilege policy. They answer different questions.',
    sources: ['rhel'],
  },
  {
    id: 'host-os-v2',
    phase: '06 · RHEL orientation',
    title: 'Identify the host, release & running kernel',
    time: lessonTime('host-os-v2'),
    scenario:
      'Identity is correct. Before changing software, confirm which system image and kernel you actually reached.',
    objective:
      'Connect hostname, operating-system release, and running kernel to the Azure inventory.',
    why: 'A kernel version is not the same as a distribution release. Package support and troubleshooting depend on both. Names can be customized, so use multiple independent signals.',
    change:
      'Read host metadata only. Do not rename, upgrade, or reboot the VM.',
    shell: 'RHEL 9 · Bash · rexuser',
    command: 'hostname\nhostnamectl\ncat /etc/redhat-release\nuname -r',
    args: [
      'hostname with no arguments prints the current hostname; adding arguments could change behavior, so use the read-only form.',
      'hostnamectl with no subcommand displays systemd’s host metadata, including OS and kernel. It can manage hostnames with other subcommands, but none is used here.',
      'cat displays file contents. /etc/redhat-release is an absolute path under the system configuration directory and contains the human-readable Red Hat release.',
      'uname reports kernel/system information. -r selects the running kernel release, including vendor build suffixes; it does not query every installed kernel package.',
    ],
    expected:
      'A hostname consistent with the provisioned VM, Red Hat Enterprise Linux release 9.x, and a RHEL kernel build. Exact minor versions and suffixes vary.',
    verify:
      'Compare the outputs with the VM image and name recorded in Azure. Record both the RHEL release and running kernel. Do not copy a textbook version into your baseline.',
    trouble:
      'Unexpected OS can mean a wrong image or wrong destination. A hostname differing from the Azure display name is possible; investigate rather than instantly renaming it.',
    methodology: [
      'Compare the SSH destination against Azure public/private IP inventory.',
      'Check the image publisher and major release in deployment details.',
      'If the image is wrong, stop this lab and correct the fresh provisioning plan with the owner before creating useful data.',
    ],
    rollback:
      'These commands do not change host state. Rebuilding an incorrect empty lab is a provisioning correction; once data exists, recover it before replacing the VM.',
    challenge: 'Does uname -r tell you which RHEL major release you installed?',
    answer:
      'Not reliably by itself. Read /etc/redhat-release or hostnamectl for the distribution, and uname -r for the currently running kernel.',
    sources: ['rhel'],
  },
  {
    id: 'guest-network-v2',
    phase: '06 · RHEL orientation',
    title: 'Read addresses and routes inside RHEL',
    time: lessonTime('guest-network-v2'),
    scenario:
      'SSH works, but you need to understand the guest’s network view before later agent connectivity work.',
    objective:
      'Identify the NIC address and default route without changing Azure-managed networking.',
    why: 'A server can be reachable over SSH while unable to reach a future manager or repository. Address assignment, route selection, DNS, firewall rules, and service listening state are distinct layers.',
    change:
      'Read the kernel’s interface/address and route information only. Do not set static guest addresses or replace Azure routes.',
    shell: 'RHEL 9 · Bash · rexuser',
    command: 'ip addr\nip route',
    args: [
      'ip is the Linux networking inspection/configuration tool. addr selects address information; without add/delete/change it displays interfaces and assigned addresses.',
      'lo is the loopback interface; 127.0.0.1 refers to this host itself. Other names such as eth0 or ens* identify NICs; do not assume a specific name.',
      'An inet address such as 10.0.1.x/24 is the guest’s private IPv4 with its prefix. inet6 denotes IPv6. MAC addresses are link-layer identifiers, not destination IPs for this exercise.',
      'ip route displays the IPv4 routing table by default. default is the fallback route, via names the next-hop gateway, dev names the interface, and src is a preferred source where shown. More-specific routes take precedence.',
    ],
    expected:
      'A private IPv4 inside the chosen subnet and an appropriate Azure gateway/default route. The public IPv4 normally does not appear on the guest NIC because Azure maps it outside the guest.',
    verify:
      'Compare the private IP and prefix with Azure NIC → IP configurations and your subnet plan. Record the interface and default next hop. A route alone does not prove DNS or successful outbound communication; those will receive dedicated labs.',
    trouble:
      'Expecting the public IP in ip addr can lead to harmful manual changes. A wrong subnet or missing default route needs investigation; SSH success proves only the path supporting the current session.',
    methodology: [
      'Start with interface/address, then connected and default routes.',
      'Compare to Azure NIC/subnet configuration, then effective routing/NSGs.',
      'Preserve the working session and collect evidence through the recovery owner before changing network configuration. Do not hard-code gateway settings from an example.',
    ],
    rollback:
      'No networking changes here. Future route/firewall changes require saved prior state, a recovery channel, one-change-at-a-time testing, and a rollback trigger if access is lost.',
    challenge:
      'Why can Windows connect to a public IPv4 that ip addr does not show?',
    answer:
      'Azure’s network layer maps the public IP to the NIC’s private address. The guest normally knows its private address, not that external mapping.',
    sources: ['network', 'rhel'],
  },
  {
    id: 'home-files-v2',
    phase: '06 · RHEL orientation',
    title: 'Orient yourself in the home directory',
    time: lessonTime('home-files-v2'),
    scenario:
      'You know the host and account. Now understand the working directory and the server-side public-key file without changing permissions.',
    objective:
      'Inspect rexuser’s home, recognize hidden files and permissions, and compare the authorized public-key fingerprint.',
    why: 'Relative paths depend on where your shell is standing. Hidden files are a naming convention, not security. Understanding ownership before chmod/chown prevents accidental exposure or loss of access.',
    change:
      'Read directory metadata and public-key fingerprints only. No private key should be present on RHEL.',
    shell: 'RHEL 9 · Bash · rexuser',
    command: 'pwd\nls -la\nssh-keygen -l -f ~/.ssh/authorized_keys',
    args: [
      'pwd prints the present working directory. A fresh rexuser login normally starts in /home/rexuser, but verify rather than assume.',
      'ls lists directory entries; without a path it lists the current directory. -la combines -l (long details) and -a (all entries, including dotfiles).',
      'Long output includes file type/permission bits, link count, owner, group, size, timestamp, and name. A leading d indicates a directory; . means this directory and .. means its parent.',
      'A filename starting with . is hidden from ordinary ls. The .ssh directory is normally visible with -a. Hidden does not mean encrypted or inaccessible.',
      'ssh-keygen -l displays public-key fingerprints; -f selects ~/.ssh/authorized_keys. Bash expands ~ to rexuser’s home, normally /home/rexuser. This file is a list of authorized public keys, not the private file from Windows.',
    ],
    expected:
      'The current path, a long home-directory listing, and the fingerprint of the public key Azure authorized for rexuser. If multiple keys are intentionally authorized, multiple entries may appear.',
    verify:
      'Compare the authorized fingerprint to the public-account-key fingerprint recorded on Windows, not to the server-host fingerprint. Confirm the home belongs to rexuser. Record unexpected additional keys for owner review. Do not paste public inventory into public channels unnecessarily.',
    trouble:
      'A surprising pwd can mean you changed directories earlier. Missing .ssh in ordinary ls is not evidence it is absent. Permission errors or unexpected key entries require review, not chmod 777 or overwriting authorized_keys.',
    methodology: [
      'Identify the machine, account, and absolute path first.',
      'Compare expected versus actual owner and visibility using the long listing.',
      'For missing/incorrect authorized keys, preserve the current session and ask the recovery owner for a targeted repair. Do not transfer the private file as a fix.',
    ],
    rollback:
      'All commands are read-only. Later ownership/permission labs will first record original modes and owners, make a scoped change, and verify a second login before closing the first.',
    challenge: 'What does ~ mean on Windows versus inside your RHEL session?',
    answer:
      'It refers to a home directory on the machine interpreting it. The Windows private key and RHEL authorized_keys are in different homes on different machines, even though both use .ssh.',
    sources: ['keys', 'rhel'],
  },
  {
    id: 'baseline-v2',
    phase: '07 · Baseline & handoff',
    title: 'Capture the baseline and plan the next change',
    time: lessonTime('baseline-v2'),
    scenario:
      'Access is verified. Capture a small operational baseline before later storage and security-agent work.',
    objective:
      'Record SSH service health, SELinux mode, root capacity, and the intended recovery method. Understand the future manager/agent relationship without installing it.',
    why: 'A baseline separates pre-existing conditions from change-induced faults. Wazuh’s centralized management relationship is an educational analogy to platforms such as Trellix ePO, not a claim that their architecture, agents, protocols, or capabilities are technically identical.',
    change:
      'Read service/security/storage state only. Reserve the current RHEL VM for later agent practice; a separate RHEL 9 Wazuh Manager is planned, not deployed. Validate supported versions and sizing when that milestone begins.',
    shell: 'RHEL 9 · Bash · rexuser',
    command: 'systemctl is-active sshd\ngetenforce\ndf -h /\nsudo -v',
    args: [
      'systemctl queries/manages systemd. is-active asks about the sshd service and does not start/restart it. active is a useful signal, not an end-to-end health guarantee.',
      'getenforce takes no arguments and reports SELinux’s current mode. Enforcing means policy is enforced; Permissive logs denials without enforcing; Disabled means SELinux is off.',
      'df reports filesystem space. -h uses human-readable units. / selects the filesystem containing the Linux root directory, not the root user’s home directory. This checks capacity, not inode availability or partition layout.',
      'sudo -v validates or refreshes sudo authorization without launching an administrative command. It may prompt for the Linux password under actual policy. Continue to use rexuser with sudo for specific privileged operations, not routine root shells.',
    ],
    expected:
      'sshd active, normally SELinux Enforcing, a root-space report, and successful sudo validation if the provisioned policy permits it. Record deviations honestly.',
    verify:
      'Append actual values with date/time to the change record. Record the Azure resource inventory, verified host/account fingerprints, RHEL release/kernel, IP/route, and sudo scope. The future workflow is obtain installer → transfer → inspect → install → identify/verify service → verify network → inspect logs → troubleshoot → confirm centralized check-in.',
    trouble:
      'SELinux Permissive/Disabled or low space needs owner review. An active service can still fail a real task. A snapshot cannot restore your Windows private key, and a VM disk snapshot does not automatically preserve all Azure networking or application consistency.',
    methodology: [
      'Compare actual observations with the predeclared acceptance checks.',
      'Record existing deviations before attempting remediation.',
      'For later risky changes, define backup scope and retention, application-consistency needs, exact restore procedure, recovery access, and post-restore tests. Choose rollback triggers before modifying state.',
    ],
    rollback:
      'This milestone adds no agent software. Do not take a paid snapshot merely to tick a box; there is no application state yet. Before the next storage change, protect recoverable state and test the restore plan. A destructive partition edit needs more than a screenshot of settings. Keep recovery assets until post-change validation passes, then retire them under the retention plan.',
    challenge:
      'If systemctl says active, what still needs testing in a later Wazuh lab?',
    answer:
      'Actual manager reachability, enrollment, centralized check-in, expected event flow, and relevant logs. Process state alone is not a successful business outcome.',
    visual: 'architecture',
    sources: ['rhel', 'wazuh', 'cost'],
  },
  {
    id: 'deallocate-v2',
    phase: '07 · Baseline & handoff',
    title: 'Close the session and deallocate the lab',
    time: lessonTime('deallocate-v2'),
    scenario:
      'You have finished today’s lab. Leave a documented, recoverable environment without paying for an idle running VM.',
    objective:
      'Exit SSH, stop/deallocate through Azure, verify the actual power state, and record how to resume.',
    why: 'Closing SSH is not shutting down a server. Shutting down inside RHEL can leave Azure hardware allocated and billable. Deallocation releases compute allocation, while disks, public IPs, snapshots/backups, and other retained resources can still cost money.',
    change:
      'Close the rexuser shell and deallocate the VM through Azure. Preserve the OS disk, public key authorization, and Windows private key for the next milestone; do not delete the lab.',
    shell: 'RHEL 9 · Bash → Windows PowerShell',
    command: 'exit',
    args: [
      'exit with no arguments ends the current shell. In this SSH session it normally closes the connection and returns to Windows. It does not power off or deallocate Azure compute.',
      'Use Azure’s Stop control afterward and verify Stopped (deallocated). Do not substitute a guest shutdown and assume billing stopped.',
    ],
    portal: [
      'Save the non-secret evidence and close any work, then run exit in the rexuser SSH shell. Confirm the Windows prompt returns.',
      'Azure Portal → the exact rhel9-lab-01 VM → Overview → Stop. Read the deallocation confirmation and confirm the intended VM. Wait for the transition to finish; refresh until the power state is Stopped (deallocated).',
      'Check Auto-shutdown time/time zone and treat it as a fallback, not proof that today’s VM stopped. In Cost Management review resource-level usage when it becomes available; cost reporting can lag.',
      'To resume later: open the same VM → Start; wait for Running, recheck public/private IPs and your current source /32, then repeat the TCP and verified SSH checks using the retained private key. Do not generate a new pair just because the VM was stopped.',
    ],
    expected:
      'The SSH session ends and Azure explicitly reports Stopped (deallocated). Disk contents and the account’s public authorization persist. Retained resources may still bill.',
    verify:
      'Record the power state, timestamp, retained billable resources, next review time, and resume steps. Provisioning state Succeeded is different from power state Deallocated. If only Stopped appears, investigate before leaving.',
    trouble:
      'Auto-shutdown time-zone errors leave VMs running. A canceled Stop or missing deallocation permission leaves cost exposure. Restart may encounter capacity constraints. The old source /32 can become invalid when your workstation network changes.',
    methodology: [
      'Check the correct resource and its current power state.',
      'Inspect Activity log for failed/canceled Stop operations; ask the owner to deallocate if your role cannot.',
      'On resume, verify addresses and transport before authentication. For eventual retirement, inventory exact lab dependencies and retention requirements before any deletion.',
    ],
    rollback:
      'Deallocation is reversible with Start, subject to capacity. Data on temporary disks is not durable; keep future work on managed disks with appropriate backup. Do not delete the group or disk as a way to finish this session. Eventual deletion is a separate destructive cleanup after confirming nothing must be retained.',
    challenge:
      'You closed SSH and Azure says Stopped. Have you demonstrated that compute billing ended?',
    answer:
      'No. Confirm Stopped (deallocated). Even then, retained disks and public IPs can still incur charges; document and review those separately.',
    sources: ['cost'],
  },
];

// Keep all Milestone 2 task IDs: their original endpoint/SSH work remains valid.
// New two-host, transfer, and rollback work has distinct IDs and starts unverified.
Object.assign(sources, {
  wazuhQuickstart: {
    title: 'Wazuh · All-in-one requirements',
    url: 'https://documentation.wazuh.com/current/quickstart.html',
  },
  azureSnapshots: {
    title: 'Microsoft · Managed-disk snapshots',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/snapshot-copy-managed-disk',
  },
  vsphereSnapshots: {
    title: 'Broadcom · vSphere snapshot best practices',
    url: 'https://knowledge.broadcom.com/external/article?legacyId=1025279',
  },
});
const updates: Record<string, Partial<Lesson>> = {
  'assignment-v2': {
    scenario:
      'You are at your Windows workstation. No lab VM exists for a new learner; if you completed Milestone 2, retain rhel9-lab-01 and its evidence. The continuous assignment is to build a central security server and a separate RHEL endpoint, administer both as rexuser, deliver software, prove check-in, troubleshoot, and recover safely.',
    objective:
      'Start one change record for the full manager/agent scenario. Reuse completed endpoint work and add the new two-host planning checks.',
    vsphere:
      'Azure VM ≈ vSphere VM. Your change record should identify the exact host, owner, network and recovery path on either platform; the products are not one-to-one equivalents.',
  },
  'azure-scope-v2': {
    objective:
      'Verify the Azure identity, authorization, and billing scope. Estimate the retained endpoint first, then complete the next two-host cost plan before adding the manager.',
    verify:
      'Keep this endpoint estimate as one inventory line. Complete the following two-host plan for the manager and combined cost; the main scenario requires two Linux systems. Resource groups, basic VNets and NSGs have no standalone base charge, while compute/RHEL software, disks, IPs and recovery resources can bill.',
    vsphere:
      'Subscription/tenant identity and billing do not map directly to a vCenter folder or cluster. Translate the ownership and authorization questions, not the labels.',
  },
  'network-plan-v2': {
    vsphere:
      'A VNet/subnet is a logical network/addressing concept. vSphere connectivity may involve port groups, VLANs, NSX, and physical routing; no single vSphere object is automatically equivalent to an Azure VNet.',
  },
  'nsg-v2': {
    walkthrough: nsgWalkthrough,
    title: 'Allow SSH from your home connection',
    scenario:
      'You will use your Windows computer to connect to the RHEL lab VM. First, tell Azure which internet address is allowed to start that connection.',
    objective:
      'Create a network rule that allows SSH into the endpoint VM from your current home public IPv4 address. You will repeat this for the manager VM later.',
    why: 'A Network Security Group (NSG) is a list of rules for traffic entering or leaving a VM. This rule lets your connection reach SSH on port 22. Signing in is a separate step: you still need your username and SSH key. Linux also has its own protections, which you will learn later.',
    change:
      'Create nsg-rhel9-lab and add one inbound rule. Inbound means coming into the Azure VM. Outbound means leaving it. You will attach this NSG to the VM during the VM creation lesson.',
    shell:
      'Your Windows computer · Windows Terminal → PowerShell · normal user',
    command:
      '$AdminSourceCidr = Read-Host "Type your current public IPv4 followed by /32"\n$AdminSourceCidr',
    expected:
      'Your new inbound rule appears in nsg-rhel9-lab. It allows TCP port 22 from your current public IPv4/32. It is not attached to a VM yet.',
    verify:
      'Open the rule and check: Source = your public IPv4/32, source port = *, destination port = 22, protocol = TCP, action = Allow. Save the rule name and settings in your notes.',
    trouble:
      'If SSH fails later, your home public IP may have changed. Check the saved source address first. A VPN or proxy can also change which public address Azure sees. Check the VM’s attached rules before changing anything.',
    rollback:
      'Save the old settings before editing this rule. If an edit causes a problem, restore the last correct specific settings from your notes. Do not delete all the rules or allow every internet address.',
    challenge: 'Why do we choose Inbound security rules for the Azure VM?',
    answer:
      'Your SSH connection travels from your Windows computer into the Azure VM. It is outbound from Windows and inbound to the VM. The Azure rule controls traffic entering the VM.',
    args: [
      'Read-Host asks you to type an answer. $AdminSourceCidr stores that answer in the current PowerShell tab. Printing it lets you check for typing mistakes.',
      '/32 means one IPv4 address. It does not mean port 32. You enter port 22 in a different Azure field.',
    ],
    vsphere:
      'Azure NSG ≈ an access-control concept, not a direct vSphere feature. A workplace may enforce this with physical firewalls, NSX, or the guest firewall. Identify the actual enforcement point.',
  },
  'vm-provision-v2': {
    title: 'Submit the endpoint build with rexuser’s public key',
    change:
      'Create the endpoint VM, managed OS disk, NIC, and public IP if it does not already exist. Initialize rexuser using the existing .pub key. Keep a completed Milestone 2 endpoint instead of recreating it; the following task adds the manager VM.',
    vsphere:
      'Azure image ≈ vSphere template concept. The VM wizard applies the image’s disk layout; arbitrary guest partitioning belongs to an approved image/OS-build process, not an improvised edit to a running OS disk.',
  },
  'baseline-v2': {
    scenario:
      'Both hosts are accessible and the harmless transfer is verified. Establish the pre-change baseline immediately before the security-platform installation scenario.',
    change:
      'Read service, security, and filesystem state. Record it separately for endpoint and manager. No Wazuh installation happens in this preparation section.',
    rollback:
      'Retain this evidence and the package/unit inventories. Complete the following explicit recovery checkpoint before either Wazuh installation, and revalidate the endpoint checkpoint immediately before its agent change. No advanced storage prerequisite is inserted here.',
    vsphere:
      'Hypervisor snapshots do not replace guest baselines. Keep package, service, mount, network, and identity evidence with your Azure or vSphere recovery record.',
  },
  'deallocate-v2': {
    title: 'Pause the continuous lab without leaving compute running',
    scenario:
      'The preparation portion is complete or you are pausing between tasks. Preserve the two-host environment for the upcoming Wazuh installation window.',
    objective:
      'Close sessions and verify Stopped (deallocated) for both VMs, recording residual disk/IP/snapshot cost and the resume plan.',
    portal: [
      ...foundationLessons.find((l) => l.id === 'deallocate-v2')!.portal!,
      'Repeat the same Stop/deallocation verification for rhel9-manager-01. Keep separate power-state/timestamp records for both VMs; stopping only the endpoint leaves central compute billable. On resume, start each needed VM and recheck both administration paths and the private manager address.',
    ],
    verify:
      'Verify Stopped (deallocated) separately on endpoint and manager. Record retained disks, public IPs and snapshots, resume instructions, and the time limit for the upcoming installation. This pause is not final closure of the end-to-end lab.',
    vsphere:
      'Powering off a vSphere guest does not imply Azure-like consumption billing stops, nor does closing SSH power off either platform. Understand your workplace’s resource/cost model.',
  },
};
const phaseFor = (id: string, fallback: string) => {
  if (['assignment-v2', 'windows-tools-v2'].includes(id))
    return '01 · Windows workstation';
  if (['azure-scope-v2', 'resource-group-v2', 'network-plan-v2'].includes(id))
    return '02 · Plan the continuous lab';
  if (['nsg-v2', 'key-concept-v2', 'key-create-v2'].includes(id))
    return '04 · Restrict and authorize SSH';
  if (id === 'vm-provision-v2') return '05 · Two RHEL systems';
  if (
    [
      'reachability-v2',
      'host-trust-v2',
      'first-ssh-v2',
      'identity-v2',
      'host-os-v2',
      'guest-network-v2',
      'home-files-v2',
    ].includes(id)
  )
    return '06 · Verify the built systems';
  if (['baseline-v2', 'deallocate-v2'].includes(id))
    return '08 · Prepare the software change';
  return fallback;
};
const retained = foundationLessons.map((lesson) => ({
  ...lesson,
  ...updates[lesson.id],
  phase: phaseFor(lesson.id, lesson.phase),
}));
const byId = new Map(
  [...retained, ...labLessons, ...wazuhLessons].map((lesson) => [
    lesson.id,
    lesson,
  ]),
);
export const lessons: Lesson[] = lessonOrder.map((id) => {
  const lesson = byId.get(id);
  if (!lesson) throw new Error(`Missing curriculum task: ${id}`);
  return lesson;
});
export const retainedMilestone2Ids = foundationLessons.map(
  (lesson) => lesson.id,
);
