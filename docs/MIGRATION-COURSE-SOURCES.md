# Agency-to-Azure migration course sources

Reviewed: 2026-10-18 (America/New_York)

## Authoritative handoff sources

- `docs/sources/SONIC_CODEX_START_HERE_v5.md` — implementation contract read
  before changes.
- `docs/sources/SONIC_MIGRATION_WORKBOOK_FULL_SOURCE_v3.md` — authoritative
  lesson source. `tools/generate-migration-catalog.mjs` preserves all 44
  retained lesson sections plus the new UPGRADE-01 exercise, their headings, order and source-line ranges in
  `content/migration/migration-lessons.generated.json`.

The generated catalog is an application delivery format, not a second editorial
source. Update the approved workbook source and regenerate; do not maintain a
separate paraphrased copy of the lessons.

## Current vendor sources checked for implementation decisions

- Microsoft Learn, WSL basic commands:
  https://learn.microsoft.com/windows/wsl/reference
  (`wsl --list --verbose`, `--quiet`, and `--distribution` behavior).
- Microsoft Learn, install Azure CLI:
  https://learn.microsoft.com/cli/azure/install-azure-cli/
  (`az version`, Windows availability, and Azure CLI shell contexts).
- Microsoft Learn, Azure CLI on Windows:
  https://learn.microsoft.com/cli/azure/install-azure-cli-windows
  (PowerShell support and Windows install behavior).
- Microsoft Learn, Azure Government CLI:
  https://learn.microsoft.com/azure/azure-government/documentation-government-get-started-connect-with-cli
  (`AzureUSGovernment` selection and the absence of portal Cloud Shell in Azure
  Government).
- Microsoft Learn, Azure Migrate support matrix:
  https://learn.microsoft.com/azure/migrate/migrate-support-matrix
  (supported assessment/migration scenarios are source-dependent and must be
  checked before selecting a migration tool).
- Microsoft Learn, Configuration Manager SQL support:
  https://learn.microsoft.com/mem/configmgr/core/plan-design/configs/support-for-sql-server-versions
  (current supported SQL versions and compatibility-level requirements).
- Microsoft node-pty README and API declarations:
  https://github.com/microsoft/node-pty/blob/main/README.md
  (Windows ConPTY support and PTY lifecycle).

## Validation boundary

The source workbook includes environment-dependent software versions, portal
labels, prices, regions, quotas and licensing choices. SONIC labels these as
live checks and does not invent tenant values. Before a learner changes Azure,
SQL, MECM, Windows Server, VMware, Wazuh or RHEL systems, the selected product
version and official vendor documentation must be rechecked.

## Guided Server 2019 / Workstation revision

The workbook now includes per-step guided sections and the new Azure APP02 Server 2019 to Server 2022 member-server upgrade. Windows Server baseline, Workstation-vs-vSphere distinction, license restrictions, and Azure-specific upgrade media were checked against:

- https://www.microsoft.com/evalcenter/evaluate-windows-server-2019
- https://knowledge.broadcom.com/external/article/315434/create-virtual-machines-in-vmware-workst.html
- https://learn.microsoft.com/en-us/windows-server/get-started/install-upgrade-migrate
- https://learn.microsoft.com/en-us/azure/virtual-machines/windows-in-place-upgrade
- https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-

Reference image provenance is in public/lab-screenshots/ATTRIBUTION.md. These images are not captures of the target lab. Per-step coverage across all 85 lessons is tracked separately; see docs/screenshots/README.md. All 85 classes have a key workflow illustration under the user-approved adapted illustration scope; these sheets are not screenshots of every step. Exact target-lab screenshots remain a separate optional capture inventory. The local environment cannot execute Workstation, Windows Server, SQL, MECM, or the Azure upgrade; the authored commands are not represented as lab-tested.
