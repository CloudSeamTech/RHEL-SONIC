import type { Lesson } from './course.ts';
import { lessonTime } from './course-timing.ts';
import { wazuhWalkthroughs } from './wazuh-walkthroughs.ts';

// Course instructions only: SONIC never executes these commands on a host.
export const deploymentGroups = {
  central: ['wazuh-release-v4', 'wazuh-central-v4', 'wazuh-dashboard-v4'],
  agent: ['wazuh-artifact-v4', 'wazuh-agent-v4'],
  checkin: ['wazuh-checkin-v4', 'wazuh-event-v4'],
  fault: ['wazuh-fault-v4'],
  recover: ['wazuh-recover-v4', 'wazuh-close-v4'],
};
export const wazuhSources = {
  wazuhRegistrationRemoval: {
    title: 'Wazuh · Remove an agent using the CLI',
    url: 'https://documentation.wazuh.com/current/user-manual/agent/agent-management/remove-agents/remove.html',
  },
  azureDiskSwap: {
    title: 'Microsoft · Linux recovery and OS-disk swap',
    url: 'https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-recovery-disks-portal-linux',
  },
  wazuhQuickstart: {
    title: 'Wazuh · Central quickstart and requirements',
    url: 'https://documentation.wazuh.com/current/quickstart.html',
  },
  wazuhReleases: {
    title: 'Wazuh · Stable release notes',
    url: 'https://documentation.wazuh.com/current/release-notes/index.html',
  },
  wazuhPackages: {
    title: 'Wazuh · Official packages and digests',
    url: 'https://documentation.wazuh.com/current/installation-guide/packages-list.html',
  },
  wazuhLinux: {
    title: 'Wazuh · Linux agent installation',
    url: 'https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-linux.html',
  },
  wazuhVariables: {
    title: 'Wazuh · Linux deployment variables',
    url: 'https://documentation.wazuh.com/current/user-manual/agent/agent-enrollment/deployment-variables/deployment-variables-linux.html',
  },
  wazuhFim: {
    title: 'Wazuh · File integrity monitoring settings',
    url: 'https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/basic-settings.html',
  },
  wazuhRemove: {
    title: 'Wazuh · Agent removal',
    url: 'https://documentation.wazuh.com/current/installation-guide/uninstalling-wazuh/agent.html',
  },
};

const tasks: Omit<Lesson, 'time'>[] = [
  {
    id: 'wazuh-release-v4',
    phase: '09 · Wazuh central deployment',
    title: 'Approve the release and recovery checkpoint',
    scenario:
      'Both RHEL hosts are prepared. Reopen the change record before installing security software.',
    objective:
      'Record the supported release, host identity, sizing, trusted artifact source and usable recovery checkpoint.',
    why: 'A moving download URL is not a version pin. The exact package versions and reviewed installer digest make the change auditable.',
    change:
      'Read-only readiness checks. Do not install until every entry criterion passes.',
    shell: 'Bash · rhel9-manager-01 · rexuser',
    command:
      'hostname\ncat /etc/redhat-release\nuname -m\nnproc\nfree -h\ndf -h / /var\ntimedatectl\nsystemctl --failed --no-pager',
    args: [
      'hostname identifies the target; cat reads the distribution release; uname -m reports CPU architecture. Run on the manager, not the endpoint.',
      'nproc reports available processing units; free -h and df -h show human-readable memory and filesystem capacity. Include /var because the indexer stores growing data there.',
      'timedatectl checks clock synchronization. systemctl --failed reports existing failures; --no-pager returns output directly. Compare all results with the saved baseline.',
    ],
    portal: [
      'Resume both VMs if deallocated. Verify their current public/private addresses and SSH fingerprints against the retained evidence; do not blindly replace known_hosts.',
      'Open the official release notes and Quickstart. Reviewed baseline: stable 4.14.7, listed 29 July 2026, checked 12 September 2026. RHEL 9 is listed; the small all-in-one recommendation is 4 vCPU, 8 GiB RAM and 50 GB storage. Recheck current support, release notes and actual free space before execution; stop if the chosen release differs from the reviewed plan.',
      'Revalidate the rollback-gate lesson: exact disks, snapshot IDs, restore permissions, retention/cost decision and maximum outage. Preserve the baseline outside the guest. A missing or untested recovery path is a no-go.',
    ],
    expected:
      'A dated change record binds the manager to the reviewed stable release and a recoverable baseline.',
    verify:
      'Explain which host receives all central components, which receives only the agent, and how a failed installation will be restored.',
    trouble:
      'Wrong host, undersized VM, stale public IP, unavailable RHEL repositories, incompatible release or missing recovery evidence.',
    methodology: [
      'Confirm host and distribution first.',
      'Compare capacity and clock with requirements; check Azure sizing and disk costs before changing resources.',
      'Resolve support/repository/recovery gaps before downloading or executing an installer.',
    ],
    rollback:
      'No package changes yet. If readiness fails, leave the baseline intact and revise the change record.',
    challenge:
      'Does a successful snapshot creation guarantee a usable rollback?',
    answer:
      'No. Restore rights, consistency, disk compatibility, networking and validation must also be established.',
    sources: ['wazuhQuickstart', 'wazuhReleases', 'azureSnapshots'],
  },
  {
    id: 'wazuh-central-v4',
    phase: '09 · Wazuh central deployment',
    title: 'Inspect and install the central components',
    scenario:
      'The change is approved. Download the assistant into a private working directory and inspect it before privilege escalation.',
    objective:
      'Install manager, indexer and dashboard together on rhel9-manager-01 and protect the generated secrets.',
    why: 'Separating download, inspection and execution lets you reject error pages, unexpected versions or unreviewed changes.',
    change:
      'The approved assistant installs packages, services, configuration, certificates and credentials on the manager.',
    shell: 'Bash · rhel9-manager-01 · rexuser',
    command:
      'umask 077\nmkdir -p ~/sonic-wazuh\ncd ~/sonic-wazuh\ncurl --fail --show-error --location --output wazuh-install.sh https://packages.wazuh.com/4.14/wazuh-install.sh\nfile wazuh-install.sh\nsha256sum wazuh-install.sh\nless wazuh-install.sh',
    args: [
      'umask 077 restricts newly created files to your account; mkdir -p creates the workspace if absent; cd selects it.',
      'curl --fail rejects HTTP errors, --show-error reports failures, --location follows redirects and --output names the saved file. Verify the final source remains the approved vendor endpoint.',
      'file checks that the download is a shell script. sha256sum records its exact content; a locally computed hash alone does not prove vendor authenticity. Inspect published integrity evidence if available and record the HTTPS source/review decision.',
      'less opens the script without executing it; press q to exit. Review its version selection and options. The /4.14 URL can change; reconcile its selected patch release with the change record before proceeding.',
    ],
    portal: [
      'Compare the script with the official installation method and approved release. Stop on an unexpected version or HTML/error content. Do not pipe a download into sudo bash.',
      'Execute the follow-up only after the release and recovery gate passes. Keep the SSH session open and allow installation to finish; do not blindly rerun on partial failure.',
      'Store the generated admin credential and installation archive in approved restricted storage. Do not paste passwords or private keys into SONIC, screenshots or tickets. Record the installed package versions and disable the Wazuh repository after installation as directed by the official Quickstart, so upgrades are deliberate.',
    ],
    followup: {
      shell: 'Bash · rhel9-manager-01 · approved installation',
      command:
        'cd ~/sonic-wazuh\nsudo bash ./wazuh-install.sh -a\nsudo chmod 600 ./wazuh-install-files.tar\nrpm -q wazuh-manager wazuh-indexer wazuh-dashboard filebeat',
      args: [
        'sudo runs the reviewed local script with administrator privileges; -a selects the all-in-one deployment. This changes only the central host.',
        'chmod 600 limits archive access to its owner. Preserve ownership and store an approved protected copy; the archive contains secrets.',
        'rpm -q queries installed versions. Compare all central Wazuh versions against the approved patch release; Filebeat has its own version scheme.',
      ],
    },
    expected:
      'The assistant reports success and the package query identifies the selected central release. No endpoint enrollment is implied.',
    verify:
      'Record installer digest, installed versions and protected credential location without exposing the secrets.',
    trouble:
      'Repository/DNS failures, inadequate memory/disk, interrupted installation or unexpected package versions.',
    methodology: [
      'Read /var/log/wazuh-install.log locally and redact credentials before sharing.',
      'Check disk, memory, DNS, time and repository access; compare the first error with the saved baseline.',
      'Stop at the approved time limit. Preserve evidence before recovery; do not use overwrite options to hide a partial failure.',
    ],
    rollback:
      'Use the approved pre-install disk restore when required. The vendor uninstall option removes central data and is not an equivalent backup restore; never run it casually against a populated manager.',
    challenge:
      'Why record both the installer hash and installed package versions?',
    answer:
      'The hash identifies the reviewed script; package versions identify what it actually installed. Neither replaces the other.',
    sources: ['wazuhQuickstart', 'wazuhReleases'],
  },
  {
    id: 'wazuh-dashboard-v4',
    phase: '09 · Wazuh central deployment',
    title: 'Discover services and validate dashboard access',
    scenario:
      'Installation has finished. Prove application readiness from package, unit, socket and browser evidence.',
    objective:
      'Discover the central services and open HTTPS only from the approved workstation.',
    why: 'Installed, enabled, running and usable are separate states. A login page alone does not prove the indexing pipeline works.',
    change:
      'Inspect services; add only the approved HTTPS access rule if it is missing.',
    shell: 'Bash · rhel9-manager-01 · rexuser',
    command:
      'rpm -ql wazuh-manager wazuh-indexer wazuh-dashboard filebeat | grep -E "(systemd|\\.service$)"\nsystemctl list-unit-files --type=service --no-pager\nsudo systemctl status wazuh-manager wazuh-indexer wazuh-dashboard filebeat --no-pager\nsudo ss -lntp',
    args: [
      'rpm -ql lists installed package files. grep -E selects unit-related paths; cross-check the discovered names before querying them.',
      'list-unit-files shows installed startup definitions. status shows current runtime state; an enabled unit can still be failed.',
      'ss -lntp lists listening numeric TCP sockets and their processes. Confirm the dashboard listener; do not expose indexer/API ports publicly.',
    ],
    portal: [
      'Azure Portal → manager VM → Networking → inspect NIC and subnet effective NSG rules. Permit inbound TCP 443 only from the current workstation public IPv4 /32 to this manager; retain restricted SSH. Never use Any/Internet as the source for lab administration.',
      'Inspect the active guest-firewall zone before changes. If it blocks HTTPS, add only the same approved source/port restriction and validate runtime/permanent behavior. Do not disable firewalld or SELinux.',
      'Open https:// followed by the manager public address or approved DNS name in the Windows browser. The assistant uses its own certificate: compare its fingerprint with the certificate on the trusted SSH session before approving a lab exception. Use the actual certificate path configured in /etc/wazuh-dashboard/opensearch_dashboards.yml and openssl x509 -in PATH -noout -fingerprint -sha256. Do not bypass a mismatch.',
      'Log in using the protected generated credential. Check application/API connectivity and an empty/new agent inventory. Record success without capturing credentials.',
    ],
    expected:
      'Central units are healthy, the restricted workstation can authenticate, and the UI communicates with the central services.',
    verify:
      'Correlate unit status, socket ownership and authenticated dashboard evidence. Agent check-in is a later acceptance check.',
    trouble:
      'Inactive unit, incorrect effective NSG, stale public address, certificate mismatch or API/indexer connectivity error.',
    methodology: [
      'Start with the failed unit and sudo journalctl -u UNIT -b --no-pager; use its discovered name.',
      'Then inspect listener, effective Azure rules and active guest-firewall zone.',
      'Investigate certificate identity and application logs; preserve the narrow access policy.',
    ],
    rollback:
      'Remove only the new rule if access exposure is wrong. Recover the central host from its approved checkpoint if the install cannot be repaired within limits.',
    challenge: 'Does active (running) prove an agent is sending events?',
    answer:
      'No. It proves a service state; agent identity, current connection and a correlated event are separate evidence.',
    sources: ['wazuhQuickstart', 'nsg', 'rhel'],
  },
  {
    id: 'wazuh-artifact-v4',
    phase: '10 · Endpoint agent',
    title: 'Verify the endpoint RPM before installation',
    scenario:
      'The manager is healthy. Prepare the real endpoint artifact using the file-verification skills already practiced.',
    objective:
      'Identify a compatible signed RPM, verify vendor integrity and inspect its metadata and file list.',
    why: 'A transferred file is not automatically trustworthy. The agent version must not exceed the manager version.',
    change:
      'Download and inspect only. Import a signing key only after checking its approved fingerprint.',
    shell: 'Bash · rhel9-lab-01 · rexuser',
    command:
      'hostname\nuname -m\numask 077\nmkdir -p ~/sonic-wazuh\ncd ~/sonic-wazuh\n# Set RPM_URL to the exact HTTPS RPM link copied from the official packages list.\nread -r -p "Approved RPM URL: " RPM_URL\ncurl --fail --show-error --location --output wazuh-agent.rpm "$RPM_URL"\nfile wazuh-agent.rpm\nsha512sum wazuh-agent.rpm\nrpm -qip wazuh-agent.rpm\nrpm -qlp wazuh-agent.rpm\nrpm -K wazuh-agent.rpm',
    args: [
      'Confirm the endpoint and architecture before selecting an RPM. read -r captures the reviewed URL without interpreting backslashes; quoted variables remain a single argument.',
      'sha512sum is compared with the vendor SHA-512 link for that exact RPM, not another architecture or version. A matching self-generated hash only proves transfer consistency.',
      'rpm -qip queries package information; -qlp lists payload paths without installing. rpm -K verifies signatures/digests; NOKEY is not successful signature verification.',
    ],
    portal: [
      'Use the official packages list, select the RHEL-compatible RPM matching uname -m and the installed manager release. The reviewed stable baseline is 4.14.7; do not select a beta or a newer agent than the manager.',
      'Copy the exact vendor SHA-512 value and compare every character. If you instead download on Windows and SCP the RPM, compare its hash before and after transfer, then still perform vendor digest/signature verification on RHEL.',
      'Obtain the Wazuh signing key from https://packages.wazuh.com/key/GPG-KEY-WAZUH. Inspect its fingerprint with gpg --show-keys --with-fingerprint and compare with an independently approved vendor/key record before sudo rpm --import on that saved key. Rerun rpm -K; stop on BAD, NOT OK or NOKEY. A key fetched beside a package is not independent trust evidence.',
      'Inspect the payload and planned dependency transaction. Refresh the endpoint recovery checkpoint immediately before installation; manager setup may have changed the environment since the earlier baseline.',
    ],
    expected:
      'Correct architecture/version, matching vendor digest and a trusted valid RPM signature; package and service paths recorded.',
    verify:
      'Explain why chmod +x is not an RPM installation step and why NOKEY must be resolved.',
    trouble:
      'Wrong architecture, HTML download, altered digest, untrusted signing key or incompatible manager/agent versions.',
    methodology: [
      'Check source, filename, file type and version first.',
      'Compare the exact vendor digest, then establish the signing-key trust chain.',
      'Reject the artifact on any mismatch; obtain the correct package without bypassing checks.',
    ],
    rollback:
      'No agent installed yet. Keep the verified baseline and discard only the rejected downloaded artifact after recording the cause.',
    challenge:
      'Can identical Windows and Linux hashes prove vendor authenticity?',
    answer:
      'They prove unchanged transfer. Vendor integrity and trusted signing-key verification establish a separate trust check.',
    sources: ['wazuhPackages', 'wazuhLinux', 'wazuhVariables'],
  },
  {
    id: 'wazuh-agent-v4',
    phase: '10 · Endpoint agent',
    title: 'Install, discover and connect the agent',
    scenario:
      'The verified RPM is ready and the endpoint recovery gate passes. Configure private communication to the manager.',
    objective:
      'Install the reviewed RPM, discover its unit and establish the intended manager destination.',
    why: 'The public management address is for Windows administration. The agent uses the manager private address inside the VNet.',
    change:
      'Install the agent and enable its service; permit only endpoint-to-manager private communication.',
    shell: 'Bash · rhel9-lab-01 · rexuser',
    command:
      'cd ~/sonic-wazuh\nread -r -p "Recorded manager private IP: " MANAGER_PRIVATE_IP\nsudo env WAZUH_MANAGER="$MANAGER_PRIVATE_IP" WAZUH_AGENT_NAME="rhel9-lab-01" dnf --setopt=localpkg_gpgcheck=1 install ./wazuh-agent.rpm\nrpm -q wazuh-agent\nrpm -ql wazuh-agent | grep -E "(systemd|\\.service$|ossec.conf$)"\nsystemctl list-unit-files --type=service --no-pager',
    args: [
      'The manager address comes from the verified Azure NIC record, never an example IP. sudo env supplies deployment variables to the privileged DNF transaction.',
      'dnf install resolves dependencies and asks for confirmation. localpkg_gpgcheck=1 requires signature verification for this local RPM too. Review the transaction; do not use -y or bypass signature checks.',
      'rpm -q records the version; -ql reveals the real configuration and unit paths. Confirm wazuh-agent.service from evidence before the follow-up.',
    ],
    portal: [
      'Before starting: inspect the actual manager configuration. Default agent event traffic is TCP 1514 and enrollment TCP 1515. Restrict manager ingress to the endpoint private IP /32 on those configured ports; inspect effective NSGs on both NICs/subnets and the active guest-firewall zone. Default Azure VNet rules may already allow broader access, so an added narrow allow alone does not remove that access.',
      'In /var/ossec/etc/ossec.conf inspect the client/server address and enrollment settings. Reconcile any deployment-variable result with the recorded private manager IP. Use the chosen release enrollment policy; if password/certificate authentication is configured, obtain the approved secret/trust material through protected storage, never a public rule or command-history password.',
      'Check time, routing and manager listeners. Do not open the indexer/API or agent ports to Internet, and do not enroll the manager as this endpoint.',
    ],
    followup: {
      shell: 'Bash · rhel9-lab-01 · after unit and configuration verification',
      command:
        'sudo systemctl daemon-reload\nsudo systemctl enable --now wazuh-agent\nsudo systemctl status wazuh-agent --no-pager\nsudo tail -n 60 /var/ossec/logs/ossec.log',
      args: [
        'daemon-reload makes systemd reread unit definitions. enable --now both enables boot startup and starts the discovered service.',
        'status confirms runtime state. tail -n 60 shows recent application messages, including enrollment/connection failures; redact any sensitive values before sharing.',
      ],
    },
    expected:
      'The reviewed agent package is installed; the discovered unit is enabled/running and logs identify the intended private manager.',
    verify:
      'Record the actual unit, version, private destination and enrollment outcome. Do not mark dashboard check-in complete here.',
    trouble:
      'Dependency/signature failure, incorrect private IP, duplicate agent name, rejected enrollment or blocked configured TCP ports.',
    methodology: [
      'Inspect package and service status before network changes.',
      'Compare configuration, route, ports, effective NSG and guest firewall in that order.',
      'Read both endpoint and manager logs for enrollment trust/identity errors; do not delete an existing agent identity blindly.',
    ],
    rollback:
      'Stop the new agent if it affects the host. Use the recovery lesson to inspect removal and restore the approved endpoint baseline; reconcile any created manager record.',
    challenge: 'Why is a successful TCP connection insufficient?',
    answer:
      'It tests transport only. Enrollment, authenticated identity and fresh event delivery must also pass.',
    sources: ['wazuhLinux', 'wazuhVariables', 'nsg'],
  },
  {
    id: 'wazuh-checkin-v4',
    phase: '11 · End-to-end validation',
    title: 'Correlate the endpoint with its dashboard record',
    scenario:
      'The agent process runs. Confirm that the manager sees this exact endpoint now.',
    objective:
      'Match guest identity, agent ID, version and recent connection evidence across both hosts and the dashboard.',
    why: 'A stale record or another host with a similar name can make a broken deployment look complete.',
    change: 'Read-only connection and identity checks.',
    shell: 'Bash · rhel9-lab-01 · rexuser',
    command:
      'hostname\ndate -Is\nrpm -q wazuh-agent\nsudo systemctl is-active wazuh-agent\nsudo tail -n 50 /var/ossec/logs/ossec.log',
    args: [
      'hostname, date and rpm bind the observation to the current guest/time/version.',
      'is-active reports runtime state but does not prove check-in; compare recent application connection messages with the central record.',
    ],
    followup: {
      shell: 'Bash · rhel9-manager-01 · rexuser',
      command:
        'sudo /var/ossec/bin/agent_control -l\nsudo tail -n 50 /var/ossec/logs/ossec.log',
      args: [
        'agent_control -l lists known agents and their states. Match the endpoint name and assigned ID; manager ID 000 is not the endpoint.',
        'Read central messages for the same time window and identity. Never copy client.keys into a report.',
      ],
    },
    portal: [
      'Open the authenticated Wazuh dashboard → agent/endpoint inventory. Select rhel9-lab-01; record its assigned agent ID, version and current connection information.',
      'Compare guest hostname and time with the record and manager CLI. Refresh the view and choose the current time range. Allow documented status-update delay; a historic active status is not sufficient.',
      'Resolve stale/duplicate identity through the documented enrollment process. Preserve evidence and confirm ownership before removing any manager record.',
    ],
    expected:
      'One intended endpoint identity has consistent recent connection evidence across all three views.',
    verify:
      'Capture redacted identity/time evidence; proceed to the harmless-event task for full pipeline proof.',
    trouble:
      'Stale UI filter, time skew, duplicate name, wrong manager or enrolled-but-disconnected agent.',
    methodology: [
      'Match exact agent ID and host first.',
      'Inspect clock, endpoint logs and central logs.',
      'Refresh current dashboard filters and verify the indexer/API path before assuming the agent failed.',
    ],
    rollback:
      'Read-only. If identity is wrong, stop and correct the enrollment under the change plan without deleting unrelated records.',
    challenge: 'Why not accept the manager record with ID 000?',
    answer:
      'It represents the local manager, not proof that the remote RHEL endpoint connected.',
    sources: ['wazuh', 'wazuhLinux'],
  },
  {
    id: 'wazuh-event-v4',
    phase: '11 · End-to-end validation',
    title: 'Prove delivery with a harmless file change',
    scenario:
      'The endpoint is connected. Use a dedicated test directory to verify collection, analysis, indexing and display.',
    objective:
      'Produce one known file-integrity event and correlate path, agent ID and timestamp in the dashboard.',
    why: 'A real controlled event proves more than a green connection indicator without generating an attack.',
    change:
      'Add a narrowly scoped FIM directory to the agent configuration and modify a harmless local text file.',
    shell: 'Bash · rhel9-lab-01 · rexuser',
    command:
      'mkdir -p ~/sonic-fim\nprintf "baseline\\n" > ~/sonic-fim/probe.txt\nsudo cp -an /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.sonic-before-fim\nsudoedit /var/ossec/etc/ossec.conf',
    args: [
      'Create the directory before restarting the agent; realtime monitoring requires it to exist. printf writes only the dedicated test file; retain any earlier test evidence first.',
      'cp -a preserves metadata; -n avoids overwriting an existing checkpoint. Confirm the checkpoint belongs to this change before relying on it.',
      'sudoedit opens a temporary editable copy and installs it with privilege. Within the existing syscheck block add: <directories realtime="yes">/home/rexuser/sonic-fim</directories>. Confirm the actual home path first; do not replace unrelated settings or add duplicate syscheck blocks.',
    ],
    portal: [
      'Save the one-line configuration addition. Check the configured path and ensure syscheck is not disabled. Run sudo systemctl restart wazuh-agent, then sudo tail -n 80 /var/ossec/logs/ossec.log in the endpoint Bash session. Confirm no configuration errors and wait for completion of the initial scan before the follow-up.',
      'Only after the initial baseline scan completes, run the follow-up append. Record its timestamp and digest.',
      'Dashboard → File integrity monitoring (or the equivalent module in the installed release) → filter by the recorded agent ID, probe.txt path and current time range. Find the modification event; compare its time and path with the endpoint evidence.',
    ],
    followup: {
      shell: 'Bash · rhel9-lab-01 · after the initial FIM scan completes',
      command:
        'date -Is\nprintf "SONIC verification change\\n" >> ~/sonic-fim/probe.txt\nsha256sum ~/sonic-fim/probe.txt',
      args: [
        'Complete the guided configuration/restart/initial-scan checkpoint first. date -Is records the time of your controlled modification.',
        '>> appends to the dedicated test file; sha256sum records its resulting content.',
      ],
    },
    expected:
      'A fresh file-modification event for the intended endpoint and probe path appears in the current dashboard window.',
    verify:
      'Record agent ID, path, event timestamp and observed rule/message. Do not invent an event count or require a hard-coded rule ID.',
    trouble:
      'Directory did not exist at startup, disabled syscheck, invalid config, baseline not complete, stale time filter or an indexing failure.',
    methodology: [
      'Verify path and exact syscheck entry, then inspect agent startup/scan logs.',
      'Confirm current connection and look for the event in manager alerts before diagnosing the dashboard.',
      'Inspect Filebeat/indexer logs if central alert evidence exists but the UI is missing it.',
    ],
    rollback:
      'Restore the saved pre-FIM configuration only if it is still the correct baseline; preserve other approved edits. Restart and verify. Remove only the dedicated test directory after retaining evidence.',
    challenge: 'Why modify the file after the initial scan?',
    answer:
      'The initial scan establishes baseline metadata; the later known change gives an unambiguous modification to correlate.',
    sources: ['wazuhFim'],
  },
  {
    id: 'wazuh-fault-v4',
    phase: '12 · Controlled troubleshooting',
    title: 'Diagnose a deliberately wrong manager address',
    scenario:
      'The full pipeline works. In this isolated lab, introduce one reversible configuration fault with a short time limit.',
    objective:
      'Explain the difference between a running service and a connected agent, then restore the known-good destination.',
    why: 'A controlled single-variable fault teaches evidence-based diagnosis without weakening security controls.',
    change:
      'Temporarily point only the agent event-server address to loopback, then restore its saved working value.',
    shell: 'Bash · rhel9-lab-01 · rexuser',
    command:
      'sudo cp -an /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.sonic-working\nsudoedit /var/ossec/etc/ossec.conf\n# Change only client > server > address to 127.0.0.1 for this isolated endpoint.\nsudo systemctl restart wazuh-agent\nsudo systemctl status wazuh-agent --no-pager\nsudo tail -n 80 /var/ossec/logs/ossec.log',
    args: [
      'Confirm the saved working copy exists and belongs to the current healthy configuration; never overwrite your only known-good copy.',
      '127.0.0.1 is this endpoint itself, not an arbitrary third-party host. Verify no local manager is listening there. Do not change enrollment settings or touch the real manager.',
      'Restart applies the deliberate event destination error. The unit may remain running while logs show failed communication. Record actual behavior and timestamp.',
    ],
    portal: [
      'Record healthy check-in and set a five-minute diagnosis limit before the fault. Restrict this exercise to the owned lab endpoint; retain the SSH session.',
      'Work the ordered diagnosis: installed package → discovered service → status → journal/application logs → configured private destination → route → port/listener → effective Azure NSG → guest firewall → SELinux/audit evidence → application/enrollment settings → central identity.',
      'Explain the evidence that implicates the wrong address. Do not disable SELinux/firewalld, open public ports, or reinstall the agent to conceal a configuration fault.',
      'Use sudoedit to restore only the original manager address from the saved working copy. Restart the agent; confirm fresh connection and repeat the harmless file append/event correlation. Dashboard disconnection can lag, so capture logs even if the badge has not changed yet.',
    ],
    expected:
      'Evidence distinguishes runtime health from failed connection; the original private address restores current event delivery.',
    verify:
      'Record symptom, hypothesis, proving evidence, minimal correction and fresh post-fix event. Do not mark complete while the wrong address remains.',
    trouble:
      'Backup is stale, more than one setting changed, dashboard status delay or an unrelated manager outage.',
    methodology: [
      'Check the one changed setting against the saved copy.',
      'Stop at five minutes or increasing risk and restore the known-good value.',
      'Revalidate both connection and fresh event delivery; document unresolved exceptions.',
    ],
    rollback:
      'Restore the known-good agent configuration and restart. If that does not recover, stop the experiment and follow the approved endpoint recovery plan.',
    challenge:
      'Should an active service with failed check-in trigger an immediate reinstall?',
    answer:
      'No. First correlate logs and configuration; here the wrong event-server address is the isolated cause.',
    sources: ['wazuhLinux', 'wazuhVariables', 'rhel'],
  },
  {
    id: 'wazuh-recover-v4',
    phase: '13 · Recovery and closure',
    title: 'Restore and validate the approved endpoint baseline',
    scenario:
      'The fault has been corrected. Practice the rollback branch in the disposable lab under the recorded recovery plan.',
    objective:
      'Remove the intended agent or restore the approved disk checkpoint, then verify the complete guest baseline.',
    why: 'Package removal may leave configuration, keys, logs and central registration. Recovery must account for all of them.',
    change:
      'Approved endpoint rollback; this task deliberately ends monitoring on the endpoint. The manager remains available for evidence review.',
    shell: 'Bash · rhel9-lab-01 · rexuser',
    command:
      'rpm -q wazuh-agent\nsudo systemctl stop wazuh-agent\nsudo dnf remove wazuh-agent\nrpm -q wazuh-agent\nsystemctl list-unit-files --type=service --no-pager\nsudo ls -ld /var/ossec /var/ossec/etc',
    args: [
      'Record package and enrollment evidence first. stop ends agent activity; dnf remove asks for confirmation—review the exact removal/dependency set before accepting.',
      'After removal, rpm should report the agent is not installed. Inspect residual directories and unit definitions rather than assuming complete cleanup. A missing directory is expected if the package removed it.',
      'Do not recursively delete /var/ossec as a generic cleanup step. It contains keys/configuration and is also used on the manager; confirm host and ownership before any approved residual cleanup.',
    ],
    portal: [
      'Choose and record the approved branch before execution: inspected package removal for a clean lab rollback, or a cold disk restore when removal cannot recreate the required baseline. Retain redacted evidence and protected recovery material first.',
      'For disk restore: follow the earlier rollback-gate plan. Deallocate the endpoint, create a compatible managed disk from its recorded snapshot, and use the supported OS-disk swap or replacement-VM procedure. Review disk generation, zone, encryption, NIC/IP and boot compatibility. Keep the displaced disk until validation and retention approval.',
      'On the manager, identify the exact endpoint agent ID from earlier evidence. Remove only that lab-owned enrollment record using the documented agent administration procedure if the endpoint is intentionally retired. Never remove ID 000 or another endpoint. A restored enrolled image may contain old keys; reconcile registration rather than running duplicate clones.',
      'Validate rexuser SSH with trusted fingerprint evidence, OS/version, packages/services, failed units, storage/mounts, routes/DNS, effective NSG, guest firewall and SELinux against the pre-change baseline. A disk swap may change identity evidence—verify through the trusted console rather than blindly accepting a new host key.',
    ],
    expected:
      'The intended endpoint baseline is restored, monitoring/enrollment state matches the chosen rollback branch, and residual exceptions are documented.',
    verify:
      'Show guest access and baseline comparisons, exact central enrollment disposition, retained recovery disk/snapshot IDs and any remaining differences.',
    trouble:
      'Unexpected dependency removal, leftover service override, wrong snapshot/disk, failed boot, stale identity or unrecorded network changes.',
    methodology: [
      'Stop on unexpected removal scope; decline the DNF transaction.',
      'For failed restore, preserve both disks and inspect Azure boot diagnostics/console with the owner.',
      'Compare the full baseline and reconcile enrollment; do not call rollback successful based only on a booted VM.',
    ],
    rollback:
      'If this recovery attempt fails, use the retained compatible disk/checkpoint and the approved owner-assisted restore path. Do not delete displaced disks or snapshots while diagnosis is open.',
    challenge: 'Why can uninstall success still leave rollback incomplete?',
    answer:
      'Configuration, identities, firewall rules, data and central enrollment may remain; the required baseline, not the package command exit code, defines success.',
    sources: [
      'wazuhRemove',
      'wazuhRegistrationRemoval',
      'azureDiskSwap',
      'azureSnapshots',
      'rhel',
    ],
  },
  {
    id: 'wazuh-close-v4',
    phase: '13 · Recovery and closure',
    title: 'Close the change with evidence and cost control',
    scenario:
      'Deployment, event delivery, the controlled fault and rollback have been exercised. Close the record honestly.',
    objective:
      'Document the observed outcome, remaining risks, recovery retention and the power state of both VMs.',
    why: 'A repeatable operational handoff records what actually happened, including whether monitoring was intentionally removed during rollback.',
    change:
      'Document and, after retention approval, deallocate the two lab VMs. Stored disks and snapshots can still incur charges.',
    shell: 'Bash · each RHEL host · rexuser',
    command:
      'hostname\ndate -Is\nsystemctl --failed --no-pager\ndf -h\nfindmnt',
    args: [
      'Run separately on each host and label the evidence. hostname/date bind the final checks to a system and time.',
      'Failed units, capacity and mounts are compared with the accepted baseline. These are observations, not a claim that all services are healthy.',
    ],
    portal: [
      'Record: approved and installed versions; artifact trust/digests; actual unit names; private ports; endpoint ID; fresh event evidence; deliberate fault; root cause; correction; rollback branch; final validation and unresolved differences. Exclude passwords/private keys.',
      'State the final operating mode explicitly: endpoint restored without agent, or re-enrolled after a separate approved reinstall. Course completion does not imply currently live monitoring.',
      'Azure Portal → each VM → Stop → confirm Stopped (deallocated). Record both power states. Review retained disks, snapshots, public IPs and other chargeable resources against the approved retention plan; deallocation is not deletion and does not stop every charge.',
      'Keep only the approved recovery copies for their retention period. Obtain the recorded owner decision before removing recovery artifacts; document the exact resource IDs.',
    ],
    expected:
      'A complete redacted change record, validated final lab state and documented resource/retention costs.',
    verify:
      'Another administrator can explain and reproduce the deployment and recovery decisions from your evidence.',
    trouble:
      'Missing timestamps, secrets in evidence, unvalidated rollback or only one VM deallocated.',
    methodology: [
      'Audit the record against every verification step.',
      'Redact secrets and resolve missing evidence.',
      'Confirm both Azure states and retained resources before closing.',
    ],
    rollback:
      'Documentation does not alter the host baseline. Restart only the intended VM when more evidence is required and recheck its current addresses.',
    challenge: 'Does 100% course completion mean the lab is still monitoring?',
    answer:
      'No. It records self-verified exercises; the final rollback and deallocation may intentionally stop monitoring.',
    sources: ['cost', 'wazuhRemove'],
  },
];
export const wazuhLessons: Lesson[] = tasks.map((task) => ({
  ...task,
  walkthrough: wazuhWalkthroughs[task.id],
  time: lessonTime(task.id),
}));
