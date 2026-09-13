export type WalkthroughStep = {
  title: string;
  where: string;
  actions: string[];
  command?: string;
  expected: string;
};
const manager = 'RHEL manager · Bash · rexuser';
const endpoint = 'RHEL endpoint · Bash · rexuser';
const portal = 'Windows workstation · Azure Portal';
const dashboard = 'Windows workstation · Wazuh dashboard';
const step = (
  title: string,
  where: string,
  actions: string[],
  expected: string,
  command?: string,
): WalkthroughStep => ({ title, where, actions, expected, command });
const identity = (host: string, where: string) =>
  step(
    'Confirm the terminal before doing anything else',
    where,
    [
      `Select the SSH tab for ${host}. Run each line separately. whoami prints your account; hostname prints the guest name; pwd prints the current directory.`,
      `Continue only when the first two results are rexuser and ${host}. If either differs, stop and select the correct tab. A sudo password prompt uses the configured local account credential; typed characters are hidden. Do not assume it is your Azure password.`,
    ],
    `You are rexuser on ${host}; record this host beside the lesson evidence.`,
    'whoami\nhostname\npwd',
  );
const editor =
  'Use vi explicitly so the keystrokes match: press Esc, type / followed by the search text, then Enter. Press n for the next match. Move with arrow keys. Press i to insert, edit only the specified text, then Esc and :wq followed by Enter to save. To abandon an incorrect edit, Esc then :q! and Enter. Do not paste XML into Bash.';
const evidence = (items: string) =>
  step(
    'Save evidence before marking this lesson verified',
    'Windows workstation · your lab notes',
    [
      `Record ${items}. Include the host and date/time.`,
      'Capture only the relevant result area. Exclude credentials, private keys, enrollment keys and secret-bearing logs. Compare your result with the expected result; if it differs, use the troubleshooting section below and leave the lesson unverified.',
    ],
    'Your notes contain the actual observation and enough context to distinguish it from example output.',
  );
export const wazuhWalkthroughs: Record<string, WalkthroughStep[]> = {
  'wazuh-release-v4': [
    step(
      'Open the two VMs and record their addresses',
      portal,
      [
        'Sign in to portal.azure.com. In the search bar enter Virtual machines; select the matching service. Open rhel9-manager-01 and check its subscription and resource group against your assignment.',
        'On Overview, if the VM is stopped, select Start. Wait until its status is Running. Copy its public IP to your notes as MANAGER_PUBLIC_IP.',
        'Open Networking → Network settings, select the network interface, then IP configurations. Open the primary IP configuration and record its private address as MANAGER_PRIVATE_IP. Do not substitute the public address.',
        'Repeat for rhel9-lab-01, recording ENDPOINT_PUBLIC_IP and ENDPOINT_PRIVATE_IP. Keep separate rows for both hosts. If the portal labels differ, use the VM menu search for Networking or the NIC resource link.',
      ],
      'Both VMs are running and four addresses are recorded under the correct host names.',
    ),
    step(
      'Reconnect using your existing private key',
      'Windows workstation · PowerShell',
      [
        'Open Windows Terminal → the dropdown beside + → Windows PowerShell. At the first prompt paste the full path of your existing private key, without adding quote characters; at the second paste the manager public IP you just recorded.',
        'Read-Host collects your values; $SonicKey and $SonicHost store them for this tab. ssh -i selects the private key, and rexuser@ identifies the remote account. The quotes keep a key path containing spaces together.',
        'If SSH reports an unexpected host-key change, stop. In Azure, open the VM → Run command → RunShellScript and run ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub. Compare that trusted-console fingerprint with SSH and your retained record before resolving known_hosts. Do not accept a mismatch.',
      ],
      'A Bash prompt opens on the manager. Keep this tab; open a second PowerShell tab and repeat with the endpoint public IP.',
      '$SonicKey = Read-Host "Full path to your existing SSH private key"\n$SonicHost = Read-Host "Recorded VM public IP"\nssh -i "$SonicKey" "rexuser@$SonicHost"',
    ),
    identity('rhel9-manager-01', manager),
    step(
      'Check operating system, capacity and time',
      manager,
      [
        'cat reads the release file; uname -m prints architecture; nproc prints available CPU units. Confirm the selected stable release supports this OS and architecture.',
        'free -h shows memory in readable units. df -h / /var shows available filesystem space; shared filesystems may appear twice. timedatectl shows clock synchronization. systemctl --failed --no-pager lists failures without opening a pager.',
        'Compare the official Quickstart recommendation for 1–25 agents: 4 vCPU, 8 GiB memory and 50 GB storage for its stated retention scenario. Do not equate a 50 GB disk with 50 GB free space. If undersized, stop and return to the VM sizing/storage lesson.',
      ],
      'RHEL 9, a supported architecture, sufficient resources and synchronized time match the change record; pre-existing failures are explained.',
      'cat /etc/redhat-release\nuname -m\nnproc\nfree -h\ndf -h / /var\ntimedatectl\nsystemctl --failed --no-pager',
    ),
    step(
      'Fill in the release and recovery record',
      'Windows workstation · browser and lab notes',
      [
        'Open the release-notes and Quickstart links at the bottom. Record the release number, release date, supported RHEL version, artifact URL and today’s review date. This course was reviewed against 4.14.7; if current documentation differs, stop and reconcile the change before installing.',
        'Open Azure Snapshots from the search bar. Select each retained pre-install snapshot and record its resource ID, source disk and successful provisioning state. Compare it with the VM → Disks → OS disk resource ID. Include any application data disks.',
        'Write the rollback trigger, time limit, owner, compatible replacement-disk plan, restore permissions and validation checks. Confirm the snapshot predates the installation. If a required snapshot is missing, return to “Checkpoint: what is your rollback plan?” and complete it first.',
      ],
      'The release is selected and the recovery record refers to the actual disks of both hosts, not just a snapshot name.',
    ),
    evidence(
      'both host identities, addresses, readiness results, selected release and recovery resource IDs',
    ),
  ],
  'wazuh-central-v4': [
    identity('rhel9-manager-01', manager),
    step(
      'Create a private download directory',
      manager,
      [
        'umask 077 restricts new files to your account. mkdir -p creates the directory if missing; cd enters it. Keep this Bash tab open for the following steps.',
      ],
      'pwd ends in /home/rexuser/sonic-wazuh.',
      'umask 077\nmkdir -p ~/sonic-wazuh\ncd ~/sonic-wazuh\npwd',
    ),
    step(
      'Download without running the installer',
      manager,
      [
        'curl retrieves the file; --fail rejects HTTP errors, --show-error displays failures, --location follows redirects and --output chooses the filename.',
        'If curl fails, stop. Check DNS/repository connectivity; do not execute an older file left in this directory.',
      ],
      'The command returns successfully; the file exists locally. Nothing has been installed.',
      'curl --fail --show-error --location --output wazuh-install.sh https://packages.wazuh.com/4.14/wazuh-install.sh',
    ),
    step(
      'Inspect type, digest and version selection',
      manager,
      [
        'file should identify shell-script text, not HTML. sha256sum records these exact bytes; compare vendor integrity evidence if supplied. A locally calculated digest is not independent proof of authenticity.',
        'less opens the script. Use /wazuh_version then Enter to search; inspect the actual version assignment and installation options. Press q to exit. Compare with the release record. The /4.14 URL can serve a newer patch, so stop on disagreement.',
      ],
      'Script content, source and selected patch release have been reviewed and recorded.',
      'file wazuh-install.sh\nsha256sum wazuh-install.sh\nless wazuh-install.sh',
    ),
    step(
      'Run the approved all-in-one installation',
      manager,
      [
        'Confirm the preceding release/recovery gate and manager hostname before copying this command.',
        'sudo grants the installer privileges. bash executes the reviewed local file; -a selects all central components on this host. Do not run this on the endpoint.',
        'Wait for the installation result. Do not close the SSH tab or rerun an interrupted installation blindly. This passive wait is separate from hands-on time.',
      ],
      'The assistant reports successful installation and generated access credentials. If it reports failure, stop and inspect /var/log/wazuh-install.log locally.',
      'sudo bash ./wazuh-install.sh -a',
    ),
    step(
      'Protect credentials and verify installed versions',
      manager,
      [
        'chmod 600 limits the archive to its owner. rpm -q reports installed package versions; the three central Wazuh components must match the approved release. Filebeat uses its own version scheme.',
        'Save the generated admin credential in your approved password manager. Keep the archive protected; do not put it in a public share. Do not capture credential output in screenshots.',
      ],
      'Versions match the record and the archive is not readable by other users.',
      'sudo chmod 600 ./wazuh-install-files.tar\nsudo ls -l ./wazuh-install-files.tar\nrpm -q wazuh-manager wazuh-indexer wazuh-dashboard filebeat',
    ),
    step(
      'Prevent an accidental Wazuh upgrade',
      manager,
      [
        'First inspect the repository file. If it does not exist at this path, stop and identify the actual repo file; do not create an unrelated one.',
        'Copy a metadata-preserving checkpoint using cp -a -n; -n avoids replacing an earlier backup. sed -i edits the file in place and changes an exact enabled=1 line to enabled=0. The final grep shows the enabled settings. This affects only the Wazuh repo, not RHEL repositories.',
      ],
      'The Wazuh repository section shows enabled=0; the backup remains available for a deliberately approved upgrade.',
      'sudo cat /etc/yum.repos.d/wazuh.repo\nsudo cp -an /etc/yum.repos.d/wazuh.repo /etc/yum.repos.d/wazuh.repo.sonic-before-disable\nsudo sed -i "s/^enabled=1/enabled=0/" /etc/yum.repos.d/wazuh.repo\nsudo grep -n "enabled=" /etc/yum.repos.d/wazuh.repo',
    ),
    evidence(
      'installer digest, installed versions, repository state and the protected credential location—not the credentials',
    ),
  ],
  'wazuh-dashboard-v4': [
    identity('rhel9-manager-01', manager),
    step(
      'Discover units from installed packages',
      manager,
      [
        'rpm -ql lists package-owned paths. The pipe sends them to grep -E, whose expression selects systemd/service paths. Compare the results with list-unit-files before using the expected unit names in the next step.',
      ],
      'The actual unit definitions are identified, including the expected manager, indexer, dashboard and Filebeat units.',
      'rpm -ql wazuh-manager wazuh-indexer wazuh-dashboard filebeat | grep -E "(systemd|\\.service$)"\nsystemctl list-unit-files --type=service --no-pager',
    ),
    step(
      'Check service state and listeners',
      manager,
      [
        'status reports runtime state; --no-pager avoids interactive scrolling. ss -lntp lists listening TCP sockets with numeric addresses and owning processes.',
        'If a unit fails, run sudo journalctl -u followed by that exact unit name and --since "10 minutes ago" --no-pager. Read the earliest relevant error before changing network rules.',
      ],
      'Expected services are active and the dashboard is listening on its configured HTTPS port, normally 443.',
      'sudo systemctl status wazuh-manager wazuh-indexer wazuh-dashboard filebeat --no-pager\nsudo ss -lntp',
    ),
    step(
      'Add narrowly scoped Azure HTTPS access',
      portal,
      [
        'Use the workstation’s current public egress IPv4 from your restricted-SSH record; verify it is still current. Write it with /32. This is not the workstation’s private LAN address.',
        'Open manager VM → Networking → Network settings → its NSG → Inbound security rules → Add. Set Source to IP Addresses, Source IP to that workstation /32, Source port ranges to *, Destination to the manager private IP, Service to Custom, Destination port to 443, Protocol TCP, Action Allow.',
        'Choose an unused priority that precedes a blocking rule; lower numbers take precedence. Name the rule sonic-dashboard-workstation and select Add. Record the priority. Check NIC and subnet effective rules; preserve SSH and investigate any existing broad allow rather than assuming this rule removes it.',
      ],
      'Effective rules permit the workstation’s HTTPS traffic without adding Internet-wide application access.',
    ),
    step(
      'Inspect the guest firewall before testing',
      manager,
      [
        'is-active checks whether firewalld runs. If inactive, record that state; do not enable it blindly during installation. If active, the next command identifies the zone attached to the manager NIC.',
        'Run sudo firewall-cmd --zone= followed by the actual zone and --list-all. Compare existing services, ports and rich rules. If HTTPS is blocked, use the source-restricted rule procedure in the next card; otherwise skip that change.',
      ],
      'The active zone and relevant allow rules are known.',
      'systemctl is-active firewalld\nsudo firewall-cmd --get-active-zones',
    ),
    step(
      'If required, allow the workstation in the active zone',
      manager,
      [
        'Only use this card when firewalld is active and the earlier check showed the rule missing. Enter the exact zone and workstation /32 at the prompts.',
        'The rich rule accepts IPv4 TCP 443 from that source. Apply it at runtime first, test HTTPS in the browser, then run the permanent line only after the test succeeds. --permanent stores the same rule for future starts; do not reload unrelated rules.',
        'To undo this specific addition, rerun the two add-rich-rule commands with remove-rich-rule in place of add-rich-rule, using the same variables.',
      ],
      'The runtime rule is added. Test the browser and save it only at the later persistence checkpoint.',
      'read -r -p "Active zone: " SONIC_ZONE\nread -r -p "Workstation public IPv4/32: " SONIC_SOURCE\nSONIC_RULE="rule family=ipv4 source address=$SONIC_SOURCE port port=443 protocol=tcp accept"\nsudo firewall-cmd --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_RULE"',
    ),
    step(
      'Compare the dashboard certificate',
      manager,
      [
        'Read the configured server.ssl.certificate path. At the prompt paste that path without its YAML quote characters. openssl x509 reads that certificate; -noout omits certificate content and -fingerprint -sha256 prints its SHA-256 identity.',
        'In Windows, open https:// plus the manager public IP. On a certificate warning, inspect the certificate details and SHA-256 fingerprint. Compare with the trusted SSH result. Approve a lab exception only when it is the intended certificate; a mismatch is a stop condition.',
      ],
      'The browser certificate matches the certificate configured on this manager.',
      'sudo grep -n "server.ssl.certificate" /etc/wazuh-dashboard/opensearch_dashboards.yml\nread -r -p "Configured certificate path: " SONIC_CERT\nsudo openssl x509 -in "$SONIC_CERT" -noout -fingerprint -sha256',
    ),
    step(
      'Sign in and inspect the application',
      dashboard,
      [
        'Enter admin and the credential stored after installation; select Log in. Do not use the Linux rexuser password unless that is separately configured—which this lab does not do.',
        'Wait for the application to load. Open the navigation menu and agent/endpoint inventory. Check for API/indexer errors. A new manager can have no remote agents yet; that is expected at this stage.',
      ],
      'An authenticated dashboard loads without central-connection errors. No endpoint check-in is claimed yet.',
    ),
    step(
      'Save only the tested HTTPS rule',
      manager,
      [
        'Skip this card if you did not add a runtime rule. Return to the same manager Bash tab, where SONIC_ZONE and SONIC_RULE still hold the reviewed values. After browser authentication succeeds, save that exact rule permanently. If the tab was closed, re-enter and inspect the original values before running this command.',
        '--permanent saves the rule for future firewalld starts. --list-rich-rules shows the saved rules; compare with the runtime rule and source restriction.',
      ],
      'The tested source-restricted rule is saved without reloading unrelated firewall settings.',
      'sudo firewall-cmd --permanent --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_RULE"\nsudo firewall-cmd --permanent --zone="$SONIC_ZONE" --list-rich-rules',
    ),
    evidence(
      'discovered units, healthy status, HTTPS rule scope and authenticated dashboard view with no secrets',
    ),
  ],
  'wazuh-artifact-v4': [
    identity('rhel9-lab-01', endpoint),
    step(
      'Select the exact compatible RPM',
      'Windows workstation · official packages list',
      [
        'Run uname -m in the endpoint tab and record x86_64 or aarch64. Open the Packages reference below; locate the Linux RPM row matching that architecture.',
        'Compare its version with the installed manager version from the previous lesson. Select the same reviewed release; an agent must not be newer than its manager. Copy the RPM link and open its sha512 link in another tab. Record the full vendor digest, filename and version.',
      ],
      'You have the correct architecture’s HTTPS RPM URL and its separate vendor SHA-512 value.',
    ),
    step(
      'Download and validate on Windows before transfer',
      'Windows workstation · PowerShell',
      [
        'Open Windows Terminal → PowerShell. Create a staging folder under your local profile. Paste the exact official RPM URL and the separate vendor SHA-512 value at the prompts. The digest must contain 128 hexadecimal characters; paste only the digest, not the filename.',
        'Invoke-WebRequest downloads without executing the RPM. Get-FileHash calculates SHA-512 over the downloaded bytes. The comparison ignores hexadecimal letter case. Stop on an exception: check filename, release, architecture and algorithm, then download again from the official source. Never change the expected digest to make a failed check pass.',
        'A vendor checksum checks against published bytes; it does not replace the signing-key and RPM signature checks below. Keep the digest in your change record.',
      ],
      'VENDOR SHA-512 MATCH appears before you transfer anything.',
      '$SonicStage = Join-Path $env:USERPROFILE "sonic-artifacts"\nNew-Item -ItemType Directory -Force -Path $SonicStage | Out-Null\n$SonicRpm = Join-Path $SonicStage "wazuh-agent.rpm"\n$SonicUrl = Read-Host "Exact official HTTPS RPM URL"\n$SonicExpected = (Read-Host "Vendor SHA-512 digest only").Trim()\nif ($SonicUrl -notmatch "^https://packages\\.wazuh\\.com/") { throw "Use the official package URL" }\nif ($SonicExpected -notmatch "^[0-9a-fA-F]{128}$") { throw "Invalid SHA-512 value" }\nInvoke-WebRequest -Uri $SonicUrl -OutFile $SonicRpm\n$SonicActual = (Get-FileHash -LiteralPath $SonicRpm -Algorithm SHA512).Hash\nif ($SonicActual -ine $SonicExpected) { throw "CHECKSUM MISMATCH: do not transfer or install" }\nWrite-Output "VENDOR SHA-512 MATCH"\n$SonicActual',
    ),
    step(
      'Prepare the destination directory',
      endpoint,
      [
        'In the already verified endpoint SSH session, confirm hostname and create the staging directory. umask 077 restricts newly created files and directories to your account. Do not use the manager session.',
      ],
      '/home/rexuser/sonic-wazuh exists on the endpoint.',
      'hostname\numask 077\nmkdir -p ~/sonic-wazuh\ncd ~/sonic-wazuh',
    ),
    step(
      'Transfer the validated RPM using your local key',
      'Windows workstation · the same PowerShell tab used for download',
      [
        'Enter the endpoint public IPv4 from Azure, then the full path to the private key already stored under your local .ssh folder. Do not copy that key to a VM. The endpoint SSH rule must allow TCP 22 only from your current home public IPv4 /32.',
        'scp -i selects your identity file. The destination uses rexuser and the prepared directory. Verify the host fingerprint using the earlier trust lesson if prompted; a changed fingerprint is a stop condition. Enter the key passphrase when requested.',
        'Wait for a successful transfer. A nonzero exit code stops this card. For an SFTP alternative, use the earlier SFTP lesson with this same RPM and destination; perform the identical post-transfer checksum and signature gates.',
      ],
      'SCP completes successfully; the RPM is staged, not installed.',
      '$SonicEndpoint = Read-Host "Endpoint public IPv4"\n$SonicKey = Read-Host "Full local private-key path under your .ssh folder"\nscp -i "$SonicKey" "$SonicRpm" "rexuser@${SonicEndpoint}:/home/rexuser/sonic-wazuh/wazuh-agent.rpm"\nif ($LASTEXITCODE -ne 0) { throw "Transfer failed: stop" }',
    ),
    step(
      'Compare the vendor digest and inspect the package',
      endpoint,
      [
        'Run cd first because a new SSH session may start in your home directory. Compare the entire sha512sum value with BOTH the Windows $SonicActual value and the vendor SHA-512 tab. All three must match. Stop on any mismatch; do not install or substitute SHA-256 for SHA-512.',
        'rpm -qip reports package metadata without installation. rpm -qlp lists payload paths; note the configuration and service files. A shell executable bit is irrelevant to installing an RPM.',
      ],
      'Digest, version, architecture and expected payload agree with your record.',
      'cd ~/sonic-wazuh\nfile wazuh-agent.rpm\nsha512sum wazuh-agent.rpm\nrpm -qip wazuh-agent.rpm\nrpm -qlp wazuh-agent.rpm',
    ),
    step(
      'Establish trust in the signing key',
      endpoint,
      [
        'Download the public vendor key. gpg --show-keys --with-fingerprint prints its identity without importing it into RPM. If gpg is missing, use command -v gpg to confirm and have the lab owner approve installing the RHEL gnupg2 package before continuing.',
        'Compare the full fingerprint with the vendor key record independently approved by the lab owner. A hash and key fetched from the same location are not independent trust. If you do not have that record, stop here and obtain it; do not invent or skip the comparison.',
        'Only after the comparison passes, import this saved public key with sudo rpm --import ./GPG-KEY-WAZUH, then run rpm -K ./wazuh-agent.rpm.',
      ],
      'Signature and digests verify successfully. NOKEY, BAD or NOT OK means do not install.',
      'curl --fail --show-error --location --output GPG-KEY-WAZUH https://packages.wazuh.com/key/GPG-KEY-WAZUH\ngpg --show-keys --with-fingerprint ./GPG-KEY-WAZUH',
    ),
    evidence(
      'RPM filename/version/architecture, vendor digest comparison, approved signing-key fingerprint and successful rpm -K result',
    ),
  ],
  'wazuh-agent-v4': [
    identity('rhel9-lab-01', endpoint),
    step(
      'Recheck the endpoint checkpoint and private path',
      portal,
      [
        'Confirm the pre-agent snapshot resource ID still matches the endpoint disk and your recovery record. Do not use the manager snapshot for endpoint recovery.',
        'Open the manager NIC’s effective security rules. For the default enrollment/event settings, allow TCP 1515 and 1514 from ENDPOINT_PRIVATE_IP/32 to MANAGER_PRIVATE_IP. Use the same NSG Add form described in the dashboard lesson, with Custom service, those destination ports, TCP and a reviewed unused priority. Do not use the public IPs.',
        'Inspect both NIC/subnet effective rules; default VNet rules may already allow traffic. Add only missing rules and record their names. Keep API/indexer private.',
      ],
      'Recovery is current and the endpoint-to-manager private TCP path is understood.',
    ),
    step(
      'Check manager listeners and guest-firewall rules',
      manager,
      [
        'Check for the configured TCP 1514/1515 listeners. If absent, inspect manager status/logs rather than opening more ports.',
        'If firewalld is active, use its active zone and --list-all as in the dashboard lesson. For a missing rule, reuse the tested rich-rule procedure with source ENDPOINT_PRIVATE_IP/32 and port 1514; repeat for 1515. Retain the source restriction and validate runtime before permanence.',
      ],
      'The manager listens on the intended private-communication ports and the active firewall permits this endpoint only as designed.',
      'sudo ss -lntp\nsystemctl is-active firewalld\nsudo firewall-cmd --get-active-zones',
    ),
    step(
      'If missing: add endpoint-only guest-firewall rules',
      manager,
      [
        'Skip if firewalld is inactive or the intended rules already exist. Enter the manager NIC active zone and the recorded endpoint private IPv4 followed by /32. Do not enter the manager address as the source.',
        'Each rich rule accepts one TCP destination port from that endpoint. The quoted variables keep the rule together as a single argument. These commands add runtime rules only; existing broad allows still need review.',
      ],
      'Runtime rules permit the endpoint to reach default event/enrollment ports without an Internet-wide allowance.',
      'read -r -p "Manager active zone: " SONIC_ZONE\nread -r -p "Endpoint private IPv4/32: " SONIC_ENDPOINT_SOURCE\nSONIC_EVENT_RULE="rule family=ipv4 source address=$SONIC_ENDPOINT_SOURCE port port=1514 protocol=tcp accept"\nSONIC_ENROLL_RULE="rule family=ipv4 source address=$SONIC_ENDPOINT_SOURCE port port=1515 protocol=tcp accept"\nsudo firewall-cmd --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_EVENT_RULE"\nsudo firewall-cmd --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_ENROLL_RULE"',
    ),
    step(
      'Preview and approve the package transaction',
      endpoint,
      [
        'Return to the endpoint tab and verified artifact directory. Repeat rpm -K; stop unless signatures/digests are valid.',
        'Enter the recorded manager private IP at the prompt. sudo env passes deployment settings to the privileged package transaction. localpkg_gpgcheck=1 requires checking this local RPM too.',
        'Review the package/version, dependencies and download size. If they match the approved change, enter y at DNF’s confirmation prompt. Otherwise enter n and investigate. Do not add --nogpgcheck or -y.',
      ],
      'DNF finishes successfully with the reviewed agent version.',
      'cd ~/sonic-wazuh\nrpm -K ./wazuh-agent.rpm\nread -r -p "Recorded manager private IP: " MANAGER_PRIVATE_IP\nsudo env WAZUH_MANAGER="$MANAGER_PRIVATE_IP" WAZUH_AGENT_NAME="rhel9-lab-01" dnf --setopt=localpkg_gpgcheck=1 install ./wazuh-agent.rpm',
    ),
    step(
      'Discover the installed configuration and service',
      endpoint,
      [
        'Query the version, inspect package-owned service paths and list installed unit definitions. Confirm wazuh-agent.service is actually present before using its name.',
        'Open the configuration read-only using sudo less /var/ossec/etc/ossec.conf. Search /<client> then /<address>; verify the event destination is the manager private IP. Press q to exit. Verify enrollment settings match the lab policy; do not print enrollment keys.',
      ],
      'The installed version, unit and private manager destination match the plan.',
      'rpm -q wazuh-agent\nrpm -ql wazuh-agent | grep -E "(systemd|\\.service$|ossec.conf$)"\nsystemctl list-unit-files --type=service --no-pager',
    ),
    step(
      'Start the discovered agent service',
      endpoint,
      [
        'daemon-reload rereads unit definitions. enable --now enables boot startup and starts the agent. status shows runtime state; tail -n 60 shows the last 60 application-log lines.',
        'For a lab using default enrollment, expect registration/connection messages. If the manager requires an enrollment password or certificate policy, stop on rejection and obtain the matching protected enrollment configuration from the owner. Do not weaken the manager policy to finish the lesson.',
      ],
      'The agent is active and recent logs identify the intended manager; check-in still needs independent validation.',
      'sudo systemctl daemon-reload\nsudo systemctl enable --now wazuh-agent\nsudo systemctl status wazuh-agent --no-pager\nsudo tail -n 60 /var/ossec/logs/ossec.log',
    ),
    step(
      'Save the private rules after connection succeeds',
      manager,
      [
        'Only after successful endpoint connection, return to the same manager Bash tab. If you added runtime rules in this lesson, save the same rules permanently. Skip this card if no rules were added.',
        'To reverse your additions, replace add-rich-rule with remove-rich-rule for the exact runtime and permanent rules. Preserve required access until the retirement/recovery decision.',
      ],
      'Tested runtime and permanent rules match the recorded private endpoint scope.',
      'sudo firewall-cmd --permanent --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_EVENT_RULE"\nsudo firewall-cmd --permanent --zone="$SONIC_ZONE" --add-rich-rule="$SONIC_ENROLL_RULE"\nsudo firewall-cmd --permanent --zone="$SONIC_ZONE" --list-rich-rules',
    ),
    evidence(
      'installed RPM version, discovered unit, private destination, scoped rules and redacted enrollment outcome',
    ),
  ],
  'wazuh-checkin-v4': [
    identity('rhel9-lab-01', endpoint),
    step(
      'Record current endpoint evidence',
      endpoint,
      [
        'date -Is records a timezone-bearing timestamp. rpm -q records the installed version; is-active reports the service state. tail shows recent application messages, which must be correlated with that time.',
        'Write down the actual hostname and timestamp before switching tabs.',
      ],
      'You have current endpoint identity and connection evidence.',
      'date -Is\nrpm -q wazuh-agent\nsudo systemctl is-active wazuh-agent\nsudo tail -n 50 /var/ossec/logs/ossec.log',
    ),
    step(
      'Find the endpoint on the manager',
      manager,
      [
        'Select the manager SSH tab and confirm hostname. agent_control -l lists enrolled agents. Find rhel9-lab-01 and record its ID and state.',
        'ID 000 is the manager, not the endpoint. If a duplicate name or unexpected ID appears, stop and compare prior registration evidence before removing anything.',
      ],
      'The intended remote endpoint ID is identified and its current state agrees with endpoint logs.',
      'hostname\nsudo /var/ossec/bin/agent_control -l\nsudo tail -n 50 /var/ossec/logs/ossec.log',
    ),
    step(
      'Match the same record in the dashboard',
      dashboard,
      [
        'Sign in, open the navigation menu and select Agents management → Summary (or the installed release’s agent inventory). Search for rhel9-lab-01 in the inventory search field.',
        'Open that record. Compare agent ID, name, OS and version with your terminal notes. Refresh the page and inspect its connection state/current information.',
        'If the record is missing, clear the name filter and search by the exact ID. If still missing, inspect manager logs. Never count an unrelated active row as success.',
      ],
      'The same endpoint identity is present in all three views. A historic connected record alone is not accepted.',
    ),
    evidence(
      'endpoint hostname, agent ID, version, timestamp and matching manager/dashboard observations',
    ),
  ],
  'wazuh-event-v4': [
    identity('rhel9-lab-01', endpoint),
    step(
      'Create the harmless baseline file',
      endpoint,
      [
        'printf writes only the lab probe file; > replaces its contents. If the file already contains evidence you need, save it before this reset. The directory must exist before the agent restarts. Confirm HOME is /home/rexuser before using the XML path below.',
      ],
      'The dedicated directory exists and probe.txt contains baseline.',
      'printf "%s\\n" "$HOME"\nmkdir -p ~/sonic-fim\nprintf "baseline\\n" > ~/sonic-fim/probe.txt\ncat ~/sonic-fim/probe.txt',
    ),
    step(
      'Back up the configuration',
      endpoint,
      [
        'cp -a preserves metadata and -n refuses to replace an existing checkpoint. ls -l shows the checkpoint; if it already existed, compare its date and content with the intended pre-FIM baseline. Stop if stale; preserve it under another reviewed name before taking a new checkpoint.',
      ],
      'A known pre-FIM configuration copy is retained with restricted permissions.',
      'sudo cp -an /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.sonic-before-fim\nsudo ls -l /var/ossec/etc/ossec.conf.sonic-before-fim',
    ),
    step(
      'Add one monitored directory in the editor',
      endpoint,
      [
        editor,
        'Search for <syscheck>. Within that existing block, insert exactly: <directories realtime="yes">/home/rexuser/sonic-fim</directories>. Keep existing entries and confirm <disabled> is no in that block. Do not create a second syscheck block.',
        'Save with Esc, :wq, Enter. The following grep locates the added line for review; grep -n prints line numbers. It is not a full XML syntax validator.',
      ],
      'Exactly one lab-directory entry appears inside the existing enabled syscheck configuration.',
      'sudo env SUDO_EDITOR=vi sudoedit /var/ossec/etc/ossec.conf\nsudo grep -n "sonic-fim" /var/ossec/etc/ossec.conf',
    ),
    step(
      'Restart and wait for the initial scan',
      endpoint,
      [
        'restart reloads the edited configuration. Check status and the application log. If a configuration error appears, stop, correct it or restore the saved baseline, then retry.',
        'Wait for the initial FIM/syscheck scan to finish before going to the next card. Rerun the tail command to see fresh messages; do not assume a fixed delay is sufficient.',
      ],
      'The agent is active and the initial scan has completed without configuration errors.',
      'sudo systemctl restart wazuh-agent\nsudo systemctl status wazuh-agent --no-pager\nsudo tail -n 80 /var/ossec/logs/ossec.log',
    ),
    step(
      'Make a change after the baseline',
      endpoint,
      [
        'Record time, then append one harmless line with >>. sha256sum records the resulting content. This separate card must not run before the baseline-scan checkpoint.',
      ],
      'The probe file has changed after the completed initial scan, with a known timestamp and digest.',
      'date -Is\nprintf "SONIC verification change\\n" >> ~/sonic-fim/probe.txt\nsha256sum ~/sonic-fim/probe.txt',
    ),
    step(
      'Locate the modification event',
      dashboard,
      [
        'Open navigation → Endpoint security → File integrity monitoring. Choose the Events view where available. Set the time picker to Last 15 minutes and select Refresh.',
        'Filter for the exact endpoint agent ID using Add filter → agent.id → is → your recorded ID → Save. Add syscheck.path → is → /home/rexuser/sonic-fim/probe.txt. If the release uses a different navigation label, locate its File integrity monitoring module before applying these event-field filters.',
        'Expand the matching event and compare timestamp, path and agent ID. Record its observed message/rule, not a promised rule number. If empty, widen only the time range, confirm the endpoint connection, and inspect the manager alert log before blaming the dashboard.',
      ],
      'A fresh modification for your probe path is visible and attributable to your endpoint.',
    ),
    evidence(
      'event timestamp, agent ID, probe path, observed rule/message and local file digest',
    ),
  ],
  'wazuh-fault-v4': [
    identity('rhel9-lab-01', endpoint),
    step(
      'Save the working configuration and set a limit',
      endpoint,
      [
        'Confirm the preceding event lesson passed. Set a five-minute timer and keep the SSH tab open. cp -an preserves a working copy without overwriting an older checkpoint; verify the saved copy is current before editing.',
        'ss -lnt lists local listening TCP ports. Confirm this endpoint has no local manager on 1514 before using loopback as the deliberately wrong destination.',
      ],
      'A known-good config is retained and the fault remains confined to this isolated endpoint.',
      'sudo cp -an /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.sonic-working\nsudo ls -l /var/ossec/etc/ossec.conf.sonic-working\nss -lnt',
    ),
    step(
      'Change exactly one destination',
      endpoint,
      [
        editor,
        'Search for <client>, then locate its <server> block and <address>. Record the current manager private IP. Replace only that event-server address with 127.0.0.1. Leave enrollment settings, port and protocol unchanged. Save and exit.',
      ],
      'Only the event destination now points to this endpoint’s loopback address.',
      'sudo env SUDO_EDITOR=vi sudoedit /var/ossec/etc/ossec.conf',
    ),
    step(
      'Observe failure before trying to fix it',
      endpoint,
      [
        'Restart to apply the intentional fault. status may still show active while the application cannot connect. Read the recent log and record the failed destination and timestamp.',
        'journalctl -u selects the unit; --since narrows the observation window. If the five-minute limit expires, go straight to restoration.',
      ],
      'Logs demonstrate failed communication to the wrong destination; do not wait for a dashboard badge to catch up.',
      'sudo systemctl restart wazuh-agent\nsudo systemctl status wazuh-agent --no-pager\nsudo tail -n 80 /var/ossec/logs/ossec.log\nsudo journalctl -u wazuh-agent --since "5 minutes ago" --no-pager',
    ),
    step(
      'Prove the cause with a focused comparison',
      endpoint,
      [
        'diff -u compares the saved and current files with context. Its exit status 1 means differences were found, not that comparison failed. Inspect locally; do not publish unrelated secret-bearing configuration.',
        'The intended difference is one address. Because it explains the observed destination, restore it first. Do not reinstall or change firewall/SELinux settings.',
      ],
      'The one changed manager address explains the connection failure.',
      'sudo diff -u /var/ossec/etc/ossec.conf.sonic-working /var/ossec/etc/ossec.conf',
    ),
    step(
      'Restore the private manager address',
      endpoint,
      [
        editor,
        'Replace 127.0.0.1 in that same client/server address with the original private IP from the working copy. Save and exit. Run diff again; for this one-change exercise it should print no differences.',
        'Restart and read fresh log messages. If communication does not recover, stop the experiment and use the ordered troubleshooting section; do not extend the fault indefinitely.',
      ],
      'The known-good configuration is restored and current connection messages return.',
      'sudo env SUDO_EDITOR=vi sudoedit /var/ossec/etc/ossec.conf\nsudo diff -u /var/ossec/etc/ossec.conf.sonic-working /var/ossec/etc/ossec.conf\nsudo systemctl restart wazuh-agent\nsudo tail -n 60 /var/ossec/logs/ossec.log',
    ),
    step(
      'Prove recovery with a new event',
      endpoint,
      [
        'Append a new recovery marker and note its time. In the dashboard, reuse the agent.id and syscheck.path filters from the previous lesson, refresh Last 15 minutes and find this later modification.',
      ],
      'Fresh event delivery works after restoration; an old event does not count.',
      'date -Is\nprintf "SONIC recovered\\n" >> ~/sonic-fim/probe.txt\nsha256sum ~/sonic-fim/probe.txt',
    ),
    evidence(
      'before/fault/after timestamps, the proving address difference, minimal correction and new recovery event',
    ),
  ],
  'wazuh-recover-v4': [
    identity('rhel9-lab-01', endpoint),
    step(
      'Choose your recovery branch before executing commands',
      'Windows workstation · lab change record',
      [
        'Use branch A (package removal) to retire this lab agent while retaining the running guest. Use branch B (disk restore) only when your approved pre-install snapshot restore is the required baseline. Do not perform both automatically.',
        'Record endpoint hostname, agent ID, snapshot/disk IDs and the selected branch. Preserve redacted evidence and protected recovery material. This exercise intentionally stops monitoring; it is not a simulated click in SONIC.',
      ],
      'Exactly one recovery branch is selected and its evidence/retention requirements are understood.',
    ),
    step(
      'Branch A only: remove the reviewed agent package',
      endpoint,
      [
        'Skip this card for disk restore. Stop the agent, then inspect DNF’s removal list. Enter y only if the proposed removal matches the approved endpoint-agent scope; otherwise enter n.',
        'After removal, rpm should report not installed. list-unit-files shows any remaining definitions. ls reports residual directories or “No such file or directory”; either outcome must be recorded.',
        'Do not delete /var/ossec recursively. Retain remaining keys/configuration under restricted permissions until the owner approves exact cleanup; never use this endpoint procedure on the manager.',
      ],
      'The package is absent; residual files and units are recorded rather than silently discarded.',
      'sudo systemctl stop wazuh-agent\nsudo dnf remove wazuh-agent\nrpm -q wazuh-agent\nsystemctl list-unit-files --type=service --no-pager\nsudo ls -ld /var/ossec /var/ossec/etc',
    ),
    step(
      'Branch B only: create the recovery disk',
      portal,
      [
        'Skip this card for package removal. Search Virtual machines → rhel9-lab-01 → Stop. Wait for Stopped (deallocated). Record the current OS disk resource ID from Disks.',
        'Search Snapshots → select the exact approved endpoint pre-install snapshot → Create disk. Enter a distinct recovery disk name and the recorded subscription/resource group/region. Match the original VM’s disk compatibility, zone and encryption requirements; review cost and Create.',
        'Wait for deployment success. Open the new disk and record its resource ID. If the source snapshot, OS type, generation or encryption is wrong, stop before swapping. Do not delete the old OS disk.',
      ],
      'A compatible managed recovery disk exists from the intended endpoint snapshot.',
    ),
    step(
      'Branch B only: swap and start the endpoint',
      portal,
      [
        'Open the deallocated endpoint VM → Disks → Swap OS disk. Choose the newly created recovery disk. Type the VM name when asked to confirm, then select OK.',
        'If the intended disk is absent from the list, stop and check region/compatibility rather than choosing another disk. After success, return to Overview → Start and wait for Running.',
        'Record the current public IP and reconnect from PowerShell with the retained SSH key. Verify the fingerprint against trusted-console evidence if it changed. Keep the displaced disk until recovery validation passes.',
      ],
      'The endpoint boots from the recovery disk and rexuser access is verified.',
    ),
    step(
      'Remove only the retired endpoint registration',
      manager,
      [
        'Confirm the manager hostname. manage_agents -l lists agent identities. Match the exact ID with the endpoint evidence; never remove ID 000.',
        'Start the interactive manager tool. At its menu choose R to remove an agent; enter the exact endpoint ID; read the displayed name/address and confirm only if they match the intentionally retired endpoint. Choose Q to quit. Menu wording can vary; use the displayed remove/quit options.',
        'This branch expects a pre-agent snapshot or removed agent. If a restored disk is already enrolled and monitoring is meant to continue, do not remove that record; reconcile the restored identity with the owner instead.',
      ],
      'The manager registration state matches the chosen rollback outcome; unrelated agents remain.',
      'hostname\nsudo /var/ossec/bin/manage_agents -l\nsudo /var/ossec/bin/manage_agents',
    ),
    step(
      'Validate the restored guest against its baseline',
      endpoint,
      [
        'Check account/host first. Compare failed units, mounts, capacity, routes and SELinux with the saved pre-change values. Missing Wazuh is expected for this pre-agent rollback, not a new fault.',
        'Compare Azure NIC/NSG rules with the saved record. Remove only lab-created agent-specific rules if they are no longer needed; select the exact named rule → Delete → confirm its scope. Keep restricted SSH access.',
        'Record residual differences explicitly. A successful boot or package removal alone does not finish this check.',
      ],
      'The baseline comparisons and central registration disposition are documented.',
      'whoami\nhostname\ncat /etc/redhat-release\nrpm -q wazuh-agent\nsystemctl --failed --no-pager\nfindmnt\ndf -h\nip route\ngetenforce',
    ),
    evidence(
      'chosen recovery branch, baseline comparisons, endpoint enrollment disposition, retained disk/snapshot IDs and residual exceptions',
    ),
  ],
  'wazuh-close-v4': [
    step(
      'Complete the change record',
      'Windows workstation · lab notes',
      [
        'Create these headings: Scope; Hosts; Versions and artifact trust; Configuration changes; Successful event evidence; Fault and root cause; Recovery branch; Final state; Exceptions; Retention and costs.',
        'Under each heading paste your redacted observations from the earlier lessons. Include actual timestamps and resource/agent IDs. State whether the endpoint agent is removed, restored pre-install, or subsequently re-enrolled; do not simply write “healthy.”',
      ],
      'Each acceptance result has evidence and the final monitoring state is explicit.',
    ),
    step(
      'Check both hosts before shutdown',
      'Both RHEL SSH tabs · Bash · rexuser',
      [
        'Run this block separately in each host tab. Label each result with hostname/date. Compare failed units, mounts and capacity with the recorded baseline.',
        'If an unexplained failure remains, record it as an open exception and keep the change open. Do not conceal it by marking every lesson complete.',
      ],
      'Both hosts have a documented final observation.',
      'hostname\ndate -Is\nsystemctl --failed --no-pager\ndf -h\nfindmnt',
    ),
    step(
      'Deallocate the endpoint and manager',
      portal,
      [
        'Save your work and type exit in each SSH tab to close its remote session.',
        'Search Virtual machines → select rhel9-lab-01 → Stop → confirm. Wait for Stopped (deallocated). Repeat for rhel9-manager-01 and confirm its state independently.',
        'Capture the VM list showing both states, without credentials or unnecessary account details. A guest shutdown alone may leave allocated resources.',
      ],
      'Both VMs show Stopped (deallocated).',
    ),
    step(
      'Review retained resources and hand off',
      portal,
      [
        'Open the lab resource group → Resources. List retained OS/data disks, snapshots, public IPs and other billable resources in your notes. Deallocation does not delete them or eliminate all charges.',
        'For each recovery artifact record its resource ID, retention end date and owner decision. Keep it while any rollback issue is unresolved. Do not delete resources merely to make the list empty.',
        'Review your notes for passwords, private keys and secret-bearing logs; remove those from the shared copy. Mark the lesson verified only after the final state and open exceptions are accurately recorded.',
      ],
      'The handoff explains the lab outcome, retained costs and recovery responsibilities.',
    ),
    evidence(
      'final state of each host, both deallocated statuses, resource-retention decisions and redacted change record',
    ),
  ],
};
