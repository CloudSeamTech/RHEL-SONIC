# SONIC-Academy / Tenable Nessus training

Three separate courses extend the existing console without replacing any course:

| Route | Course | Lessons |
| --- | --- | --- |
| `/nessus/linux` | Install Nessus 10.12.5 on AlmaLinux 9 | 14 |
| `/nessus/windows` | Install Nessus 10.12.5 on Windows Server 2022 | 11 |
| `/nessus/scanning` | Configuration, policies and vulnerability scanning | 18 |

Each lesson has plain-language what/why explanations, numbered instructions, command/settings breakdowns, expected observations, best practices, common mistakes, diagnosis, an exercise and knowledge checks. The shared console sidebar and dashboard expose all three pathways. The Nessus reader uses the existing black segmented design and typography.

## Technical baseline

Procedures were researched against Tenable's 10.12 guide and 10.12.5 release notes on October 21, 2026. Every step links to its official reference. Review the current support matrix and license entitlement before running a lab; supported minor versions, templates and exports can differ. Nessus is distinct from Tenable Security Center, and a standalone license is not an ACAS deployment or compliance authorization.

Nessus 10.12.5 requires matching signature files for manual scanner plugin imports. The filename `nessus-updates-10.12.5.tar.gz` does not establish its type, provenance, compatibility or signature. A private license file must match the scanner and supported registration route; Essentials does not support offline installation. The lessons explain these gates instead of assuming the supplied materials complete them.

Windows uses Server 2022 Desktop Experience. Nessus supplies its own HTTPS interface on TCP8834; it does not need IIS. Existing Server2019-to-Azure migration/IIS courses are preserved separately. The final scan exercise requires a separate scanner and separate AlmaLinux and Windows targets; a Nessus scanner is not its own vulnerability scan target.

## Screenshot status

Every numbered instructional step has a visible, specifically named **Screenshot capture needed** panel. These panels identify the screen to capture and link to official documentation. No genuine Nessus images with verified redistribution permission were available during this work. No fictional interfaces or successful scan results were generated. No images are claimed to come from the user's environment.

`npm run nessus:captures` produces `screenshot-inventory.json` and `capture-checklist.csv`, including course, lesson, step, context and instruction hash. These Nessus gaps are tracked separately from the earlier 803-step interface-reference inventory. Do not count placeholders as completed screenshots. Before adding images, capture them in an authorized lab, redact secrets, check the actual controls/version, confirm reuse permission where applicable and retain provenance.

## Progress and commands

Progress is local to the browser, versioned and separate from existing curricula. A lesson can be self-verified only after all step checks, the practical exercise and correct knowledge answers. Changing prerequisite checks or answers removes credit. This is a study aid, not a secure exam or automatic proof that a scanner changed.

Code-copy buttons copy text only. This site does not execute Nessus, install software, connect to a scanner, or launch network scans. Substitute approved lab addresses and local paths after reading their explanations. No license, key, password, token, report or installer needs to be uploaded to SONIC-Academy. Keep private training artifacts outside Git; `/training-private/` and common installer/license filenames are ignored as a further precaution.

## Manual validation still required

No Windows/Alma scanner installation, activation, plugin initialization, certificate import, authenticated scan, remediation or rescan has been run against a live training lab. An instructor must validate these with the actual supplied 10.12.5 installers, entitled license, matching signed feed and isolated targets. Some certificate exercises explicitly allow an honest blocked-preparation record; that is not a claim of successful certificate installation. Resolve all final readiness gates before real scans.

Review the browser screenshots and validation report in `review/` for verification of the website itself. No changes should be merged into the repository's main branch without the user's approval.
