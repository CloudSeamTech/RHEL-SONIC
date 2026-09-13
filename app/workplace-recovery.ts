import type { WalkthroughStep } from './wazuh-walkthroughs.ts';

export const workplaceRecovery: WalkthroughStep[] = [
  {
    title: 'Before anything changes: decide exactly what to back up',
    where:
      'Work administration workstation · change record and Veeam console (12 or 13)',
    actions: [
      'Start with the VM you will change: select its whole-VM backup, including the OS disk and every data disk used by the application. For a new RHEL installation, back up the clean, working VM before installing Wazuh. After successful installation and verification, create a new accepted baseline; retain the pre-change recovery point according to policy.',
      'If the change affects AD, DNS, domain membership or Group Policy, verify a recent application-aware backup of the domain controller first, including the volumes containing AD DS, SYSVOL and DNS-related state. Record domain-recovery access and the approved AD recovery procedure. A DNS export or GPO export alone cannot recover a domain controller. Do not casually revert a production domain controller snapshot.',
      'For the Wazuh central host, include its OS, configuration, certificates, enrollment material and all disks containing indexer/event data. If manager, indexer and dashboard are separate VMs, identify all of them. A live disk copy is not automatically a consistent Wazuh/indexer backup: use the application recovery procedure or a coordinated clean shutdown in an approved outage. Do not independently restore mismatched cluster members.',
      'For the RHEL endpoint or Windows client, include the OS, application data and agent configuration before agent installation, realm changes or hardening. Record its current manager association so recovery does not leave duplicate or stale enrollment. Back up only the affected systems and dependencies; an endpoint-only change does not require backing up every enterprise VM.',
      'Save a protected change record outside the changed VM: hostnames, IP/DNS settings, disk inventory, package/kernel versions, service status, relevant configuration and rollback triggers. Keep credentials, private keys and recovery passwords in approved secret storage, never in the course GitHub repository. File hashes and screenshots are evidence, not backups.',
    ],
    expected:
      'A named list of affected VMs, all required disks, dependencies and application-consistency requirements exists before a backup job is selected.',
  },
  {
    title:
      'Verify the backup scope and recovery access before taking a snapshot',
    where: 'Veeam Backup & Replication 12/13 · console',
    actions: [
      'Open Home → Jobs → Backup. Select the existing job → Edit. On Virtual Machines, confirm the exact VM is included; inspect exclusions and disk selection so required data disks are not omitted. Inspect Storage for the intended repository and retention. Use Cancel after read-only inspection; have the backup owner apply any required job changes.',
      'For a Windows domain controller, inspect Guest Processing → application-aware processing and the per-VM application settings. Confirm guest credentials and processing success in the completed session, rather than merely seeing a checked option. Windows AD processing does not make an arbitrary Linux application consistent.',
      'Check that the backup repository is outside the VM being changed, has capacity and remains reachable during recovery. Confirm the restore operator can access the backup and its encryption password independently of the affected machine/domain. Follow the workplace policy for an independent protected or immutable copy.',
      'Ask the backup owner to verify the Veeam server configuration backup too. In the main menu select Configuration Backup and inspect its latest success, repository and encryption setting. This protects backup configuration; it does not replace VM backups. Store its encryption password separately in approved storage. Do not change enterprise backup settings as part of an endpoint lesson.',
      'Run the approved VM backup using the later cards, verify the new per-VM restore point, and record a tested restore route. Only then take a short-lived vSphere snapshot immediately before the change if required. Backup first, temporary snapshot second, change third. This is a pre-change protection order, not a universal disaster-recovery restore order.',
    ],
    expected:
      'The current restore point covers the intended data, recovery access works, and application-specific restore limitations are recorded. Unknown coverage is a no-go.',
  },
  {
    title: 'At work: select the exact vSphere VM and recovery scope',
    where: 'Work administration workstation · vSphere Client',
    actions: [
      'Sign in to the approved vCenter URL. Open Menu → VMs and Templates. Select the intended RHEL VM and compare its name, folder, host and disks with the change record. Do not act on a similarly named production VM.',
      'Open Snapshots → Manage Snapshots and inspect existing checkpoints. Check datastore free space and whether a backup job is running. Coordinate the maintenance window with the backup owner; do not take or remove a checkpoint during an active backup.',
      'Record change scope, rollback trigger, maximum diagnosis time, snapshot expiry, backup restore point and validation steps. This RHEL procedure is not a domain-controller recovery procedure: AD needs application-aware/system-state recovery planning and identity consistency.',
    ],
    expected:
      'The change targets one identified RHEL VM and has an independent backup/recovery plan.',
  },
  {
    title: 'At work: create a short-lived vSphere snapshot',
    where: 'Work administration workstation · vSphere Client',
    actions: [
      'Right-click the selected VM → Snapshots → Take Snapshot. Enter a unique name containing the change ID and time, and a description of the pre-change state.',
      'For a planned cold checkpoint, shut down the guest cleanly first and confirm Powered off. Memory capture does not apply while powered off. For an approved powered-on checkpoint, decide whether memory capture is needed; it increases size/time. Filesystem quiescing requires working VMware Tools and is not automatically application-consistent backup.',
      'Select Create/OK. Watch Recent Tasks until the snapshot task succeeds, then reopen Manage Snapshots to confirm its name/time. Record the evidence before starting the change.',
      'Keep snapshots brief and remove them after validation and approval. Broadcom advises not retaining a single snapshot beyond 72 hours; workplace policy can require a shorter period. Snapshot deltas depend on base disks, so they are not standalone backups.',
    ],
    expected:
      'The intended checkpoint exists and its owner, expiry and consistency limitations are recorded.',
  },
  {
    title: 'At work: choose fix, revert or restore from backup',
    where: 'Work administration workstation · change record and vSphere Client',
    actions: [
      'If the change works, validate the application and document the result. If it fails, preserve logs and make one evidence-based correction within the agreed time. If risk grows or the time expires, stop and execute the recorded recovery branch.',
      'For an approved snapshot revert: right-click the exact VM → Snapshots → Manage Snapshots. Select the recorded pre-change checkpoint → Revert. Read the warning about losing later changes and confirm only within the approved outage/data-loss scope. Verify power state, guest access, storage and application behavior afterward.',
      'For cleanup after a successful change: select the checkpoint → Delete. Deleting merges snapshot changes; it does not restore the earlier state. Monitor the task and datastore capacity. Do not select Delete All merely to remove one checkpoint.',
      'If snapshots cannot meet the recovery requirement, use the enterprise backup restore plan. Test a recovery to an isolated destination when possible; never connect a duplicate restored identity to production by accident.',
    ],
    expected:
      'Recovery is judged by validated guest/application state, not just a completed hypervisor task.',
  },
  {
    title: 'At work: identify the Veeam product and supported commands',
    where: 'Approved Veeam administration machine · Veeam PowerShell session',
    actions: [
      'Open the Veeam console → Help → About and record the product, version and build. These command names refer to Veeam Backup & Replication VMware VM jobs; Veeam Agent jobs and other Veeam products use different cmdlets.',
      'Open the PowerShell session supplied with the installed Veeam console. Run Get-Command to discover what is available, then Get-Help for the local syntax. Do not run these in the RHEL terminal or assume ordinary Windows PowerShell already has the Veeam module.',
      'Get-VBRJob inspects VM jobs; Get-VBRBackupSession inspects execution history; Get-VBRRestorePoint inspects recovery points. Starting a job is a separate authorized operation, not proof of recovery. The exact start/restore walkthrough must match your workplace version and job type.',
    ],
    command:
      'Get-Command Get-VBRJob, Get-VBRBackupSession, Get-VBRRestorePoint, Start-VBRJob\nGet-Help Get-VBRJob -Full\nGet-Help Start-VBRJob -Full',
    expected:
      'The product/build and supported local command syntax are identified before any backup job is changed or started.',
  },
  {
    title: 'At work: inspect one existing VMware backup job',
    where: 'Veeam Backup & Replication · Veeam PowerShell session',
    actions: [
      'This example targets an existing VMware VM backup job, not a Veeam Agent policy. Verify these cmdlets in your installed version first. In the console select Home → Jobs → Backup and copy the exact approved job name.',
      'Enter that name at the prompt. Get-VBRJob retrieves jobs; Where-Object keeps only an exact name match. The count check stops an ambiguous selection. Review the returned job in the console and confirm it includes the intended VM, the correct repository, retention and application-processing settings.',
      'Get-VBRBackupSession lists history. It does not create a backup. Inspect the job session and per-VM task results in History; an old successful run is not proof of a current restore point.',
    ],
    command:
      '$SonicJobName = Read-Host "Exact approved VMware backup job name"\n$SonicJobs = @(Get-VBRJob | Where-Object { $_.Name -eq $SonicJobName })\nif ($SonicJobs.Count -ne 1) { throw "Expected exactly one job: stop" }\n$SonicJob = $SonicJobs[0]\n$SonicJob | Format-List Name, JobType\nGet-VBRBackupSession | Sort-Object CreationTime -Descending | Select-Object -First 10 JobName, CreationTime, EndTime, State, Result',
    expected:
      'One reviewed job is selected and its VM membership and recent task results are understood.',
  },
  {
    title: 'At work: run the approved backup and verify recovery evidence',
    where: 'Veeam Backup & Replication · same PowerShell session and console',
    actions: [
      'Run this separate command only after the previous selection and maintenance-window checks. Start-VBRJob starts the whole selected job, potentially including other VMs. Do not run it if the job is already running or its full scope is not approved.',
      'In the console open History → Jobs and select the new session. Wait for completion and inspect the intended VM task result. Investigate Warning or Failed; do not count a job merely starting as success.',
      'Open Home → Backups → Disk, expand the backup and locate the intended VM. Inspect its restore points and record the new timestamp, repository and retention. Arrange an isolated restore rehearsal under the workplace restore procedure; a successful backup job alone does not prove bootability or application recovery.',
      'Exact restore wizard choices depend on your Veeam version, destination and workload. Record these with the backup owner before the change; do not improvise an in-place production restore. Return to the rollback gate only when the documented recovery objective is achievable.',
    ],
    command: 'Start-VBRJob -Job $SonicJob',
    expected:
      'The intended VM has a verified new restore point and a documented, tested recovery path. No infrastructure command is executed by the course itself.',
  },
];
