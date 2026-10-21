/**
 * Teaching note, not an operational runbook. Each note contrasts the simulated
 * or disposable learning environment with a controlled production change.
 * Keep the source lessons and their prerequisites/rollback instructions intact.
 */
const practices: Record<string, string> = {
  'lab-00': 'In production, define the business outcome, system owner, scope, risk, and rollback before choosing tools. Keep experiments in an approved isolated lab.',
  'lab-01': 'Maintain a reviewed inventory of server roles, DNS dependencies, trust boundaries, and data flows. Confirm the diagram against the real environment before a change.',
  'lab-02': 'Use approved, supported Windows installation media; record versions, licenses, hashes, and lifecycle dates before provisioning.',
  'lab-03': 'Isolate disposable practice networks. Production VLANs, routing, firewall rules, and address plans require network-owner approval and documented security controls.',
  'lab-04': 'A production domain controller needs an approved AD/DNS design, fixed address plan, monitored health, reliable time, and tested system-state recovery. Promote it only during an approved change.',
  'lab-05': 'Test a GPO against a small test OU before broad linking; review security filtering, resultant policy, and a documented rollback. Avoid changing domain-wide defaults casually.',
  'lab-06': 'Use an approved domain-join process and least-privilege accounts. Validate DNS, application identity, GPO impact, and the IIS service after joining.',
  'lab-07': 'Monitor domain controller replication, DNS, SYSVOL, and time synchronization; do not treat a successful promotion screen as proof of directory health.',
  'lab-08': 'A new production forest requires identity governance, namespace planning, secure DNS, backup design, and a documented trust/migration strategy before any cutover.',
  'lab-09': 'Change inter-forest DNS only after owners agree on zones, resolvers, routing, and security boundaries; validate name resolution in both directions.',
  'lab-10': 'Back up and document GPOs, test migrated settings in a limited scope, and validate security filtering and resulting policy before broad rollout.',
  'lab-11': 'A production domain move requires an application dependency inventory, tested authentication, service-account validation, scheduled downtime, and a rehearsed rollback.',
  'lab-12': 'Document a supported recovery plan and test it in isolation. Do not casually restore snapshots of production domain controllers.',
  'lab-13': 'Deploy WSUS with approved update rings, storage, cleanup, TLS, and patch-maintenance procedures. Test updates on pilot systems before broad release.',
  'lab-14': 'Use a cost-approved landing zone, least-privilege access, encryption, private networking, tagging, logging, and a backup plan before creating cloud workloads.',
  'lab-15': 'Treat cloud domain controllers as critical identity infrastructure: review site topology, private DNS, secure connectivity, backups, and replication before promotion.',
  'lab-16': 'Validate private connectivity, DNS, routing, identity, and network controls from both ends. Do not expose administrative ports broadly as a shortcut.',
  'lab-17': 'Rehearse migration with dependency mapping, supported tooling, backups, performance checks, a change window, acceptance testing, and a rollback decision.',
  'lab-18': 'Summarize the real cutover sequence, responsible owners, pass/fail criteria, evidence, communication plan, and rollback gates in the handoff.',
  'lab-19': 'Troubleshoot from recorded evidence and the last known good state. Avoid disabling security controls or changing multiple variables at once.',
  'lab-20': 'Confirm retention obligations, capture final evidence, then deallocate or remove only approved resources; check that costs stop after cleanup.',
  'sql-01': 'Select a supported SQL Server edition/version with approved licensing, patching, TLS, service-account and upgrade requirements before installation.',
  'sql-02': 'Build the SQL host to a hardened baseline with least-privilege service accounts, documented storage, backups, monitoring, and access controls.',
  'sql-03': 'Configure separate data/log locations where appropriate, restricted service accounts, secure connectivity, patch levels, and baseline monitoring.',
  'sql-04': 'Use a disposable test database here. Production schema changes require source control, access review, deployment scripts, rollback, and test data privacy.',
  'sql-05': 'Production backups must follow recovery objectives, encryption, retention, off-host storage, and scheduled restore tests. A .bak file alone does not prove recovery.',
  'ha-01': 'Treat quorum and database availability as separate design questions. Specify failure domains and recovery requirements before choosing a cluster design.',
  'ha-02': 'Build supported, identically patched cluster nodes with validated DNS, accounts, storage/network paths, and tested single-node recovery.',
  'ha-03': 'Protect the witness storage account with least privilege, network controls, logging, and a recovery owner; it is not a replacement for SQL backups.',
  'ha-04': 'Validate clustering prerequisites and failure domains before quorum changes; get a change window and a documented backout plan.',
  'ha-05': 'Test failover and quorum in an approved nonproduction window first; record client impact, recovery timing, and alerting.',
  'az-01': 'Apply budgets, alerts, tagging, least privilege, and an approved shutdown plan before provisioning cloud resources.',
  'az-02': 'Check tool compatibility, source hypervisor support, data consistency, licensing, and vendor guidance before planning any migration.',
  'az-03': 'Rehearse a cutover with backups, owners, go/no-go checks, validation, communication, and clearly defined rollback criteria.',
  'move-01': 'Choose migration methods workload by workload. Inventory dependencies and support boundaries rather than assuming every server can be moved the same way.',
  'move-02': 'Protect the source SQL database, use an approved encrypted transfer, restore to a separate target, validate users/jobs/app connections, and preserve rollback.',
  'move-03': 'Inventory site roles, clients, SQL dependencies, supported coexistence, and recovery requirements before deciding whether MECM should move or be rebuilt.',
  'move-04': 'Document identity, DNS, service-account, certificate, and application impacts; test permission and sign-in paths before migrating.',
  'field-01': 'Gather evidence from owners before touching production: current state, dependencies, maintenance approvals, backups, monitoring, and rollback authority.',
  'mecm-01': 'Validate supported ConfigMgr prerequisites, site placement, domain integration, service identities, and backup design before installation.',
  'mecm-02': 'Grant only required AD and SQL permissions; document service identities and validate connectivity without using domain-admin rights by default.',
  'mecm-03': 'Use a supported baseline, review prerequisite checks, and plan SQL, PKI, content, and site recovery before production installation.',
  'mecm-04': 'Pilot client deployment and policy in a limited device collection before broad rollout; verify communications and remediation paths.',
  'mecm-05': 'Use controlled software update rings, WSUS/SUP health monitoring, maintenance windows, and rollback procedures for updates.',
  'alma-plan': 'For managed endpoints, verify application compatibility, inventory, encryption, EDR, backups, and support before changing the installed operating system.',
  'alma-install': 'Validate signed installation media and device compatibility. Use a test VM or approved build workflow before provisioning a corporate workstation.',
  'alma-first-login': 'Apply your organization’s workstation baseline for updates, encryption, accessibility, privacy, approved accounts, and endpoint security.',
  'alma-terminal': 'Test commands as an unprivileged account, read help and output first, and use least-privilege sudo only for approved system changes.',
  'alma-files': 'Protect sensitive files with least privilege and backup; avoid broad permission changes to solve individual access errors.',
  'alma-apps': 'Install software only from approved repositories with patch and licensing controls; verify provenance before using third-party packages.',
  'alma-games': 'Keep gaming tools off enterprise endpoints unless explicitly approved; test compatibility and graphics drivers on a personal or isolated machine.',
  'alma-network': 'Coordinate DNS, firewall, printing, and sharing changes with the network/security owners; verify exposure before enabling new services.',
  'alma-wd-drive': 'Confirm disk identity and backups before partitioning or formatting. Never run destructive storage steps against an unidentified or production disk.',
  'alma-backup': 'Align backups to recovery objectives, use protected storage, monitor job results, and periodically test a complete restore.',
  'alma-troubleshoot': 'Record symptoms, collect relevant logs, and change one variable at a time; do not disable SELinux or firewall controls just to make an error disappear.',
  'alma-real-terminal': 'Use audited, approved remote access with least privilege and host-key verification. Do not expose a local lab companion or shell service to public networks.',
};

export function productionPracticeFor(lessonId: string): string {
  return (
    practices[lessonId] ??
    'In production, confirm the system owner, approval, change scope, backup, least privilege, monitoring, verification, and rollback before applying an equivalent change. Lab commands are not automatically approved for company systems.'
  );
}
