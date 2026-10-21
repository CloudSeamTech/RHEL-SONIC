# Nessus training / website validation

Reviewed October 21, 2026. Feature branch: `curriculum/nessus-training-courses`.

## Implemented

- Three separate navigable courses: AlmaLinux9 installation (14 lessons/45 steps), Windows Server2022 installation (11/22), and scan administration (18/41).
- 43 lessons, 108 numbered steps, 86 multiple-choice questions. Each lesson includes what/why, exact actions, expected observations, command/settings explanations, best practices, common mistakes, troubleshooting, exercise and pass checks.
- Reused existing console/sidebar, black segmented UI, typography and accent palette. All existing course IDs/routes remain. Nessus classes use `/nessus/linux`, `/nessus/windows` and `/nessus/scanning` plus lesson hashes.
- Separate versioned browser progress; lesson verification requires all step checks, exercise evidence check and correct quiz answers. Removing prerequisites invalidates credit. No passwords, licenses or reports are stored in progress.
- Every step includes a clearly labeled screenshot-capture placeholder with specific context and official source links. Zero real Nessus screenshots are claimed. Inventory and capture checklist: `docs/nessus/`.
- Verified 10.12.5 manual-plugin signature requirement, supported OS/architecture, own HTTPS server/no IIS, source-limited management firewall, scoped scan credentials, edition-dependent templates/exports, separate scanner plus two targets, evidence-based remediation/rescan and compliance boundaries.

## Checks completed

- `npx tsc --noEmit`: passed.
- `npm test`: passed (application and local companion suites, including new curriculum completeness, isolation and progress integrity tests).
- `npm run build`: passed; includes all Nessus routes.
- `npm run nessus:captures`: 43 lessons/108 steps, 108 capture placeholders, zero reviewed captures.
- `npm run screenshots:interfaces-check`: existing 803-step reference inventory still passes independently.
- Browser: visited all 43 lessons, selected all 108 steps, checked correct titles and capture panels, and observed zero page errors. Verified correct quiz/step/exercise gating, persistence after reload, invalidation after unchecking, exact clipboard text, dashboard pathway availability and original VMware/Alma readers.
- Desktop1440px and phone390px screenshots inspected; no horizontal phone overflow. Six review PNGs show the implemented website, not captures of Nessus.

## Manual limitations

No authorized live Nessus lab or supplied installers/license contents were accessed. OS/Nessus installation, activation, plugin initialization and signed feed import, TLS import, target credential validation, scans, actual findings, remediation and rescans require instructor validation using the actual authorized environment. Every one of the108 screenshot placeholders still requires a genuine capture and review. Source reuse permission must be confirmed before embedding vendor images. A private license file does not establish offline eligibility or supply a plugin signature. License-limited alternatives and honestly blocked exercises do not claim successful live execution.

The pull request is for review. It has not been merged into the GitHub base branch.
