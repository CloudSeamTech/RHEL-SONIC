# Agency-to-Azure migration course sources

Reviewed: 2026-10-18 (America/New_York)

## Authoritative handoff sources

- `docs/sources/SONIC_CODEX_START_HERE_v5.md` — implementation contract read
  before changes.
- `docs/sources/SONIC_MIGRATION_WORKBOOK_FULL_SOURCE_v3.md` — authoritative
  lesson source. `tools/generate-migration-catalog.mjs` preserves all 44
  approved lesson sections, their headings, order and source-line ranges in
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
