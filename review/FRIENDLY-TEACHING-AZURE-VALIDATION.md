# Friendly teaching and Azure maintenance

Reviewed October 21, 2026. Branch `curriculum/friendly-teaching-azure-maintenance`, based on the existing Nessus feature branch. No GitHub branch is merged.

## Learner changes

- 97 original classes have reviewed, individually authored welcomes:45 Windows/AD/SQL/Azure/migration,40 Linux/RHEL/Wazuh and 12 AlmaLinux desktop.
- All43 Nessus lessons and 108 step action sets rewritten in a patient teaching voice, with concrete supplies and per-lesson preparation. Exact command strings, IDs, order, quiz answers and source URLs retained. A command hash contract guards this preservation.
- All150 primary curriculum classes now open with a friendly explanation, specific preparation and a first action. Original detailed guidance remains available. This is not a claim that every older technical reference paragraph was rewritten.
- Shared prompts, explanations and quiz feedback are more approachable. Dense runtime/privacy limitations moved out of the learner’s main preparation box.
- Ten new Azure lessons,30 steps and 20 questions cover pilots, baselines, Backup/restore testing, snapshots, assessment, Windows/RHEL updates, serial rollout, failed-update decisions and recovery.
- The maintenance board is an explicit simulation: protected pilots first, one active change at a time, stop on failed health checks, recovery and revised pilot validation before proceeding.

## Verification

TypeScript, application and companion tests, and production builds pass in both the GitHub feature checkout and the preserved hosted checkout. Existing 803-step interface-reference checks also pass in hosting. New tests verify all 97 welcome IDs, unchanged 108 Nessus commands, correct Azure navigation and screenshot provenance, pilot/wave gates, serial changes, and failure/recovery semantics.

Browser review visits all 150 classes, selects all 30 maintenance steps, loads all 14 real reference steps, exercises failure/restore/revised pilot/next-wave gating, and checks390 px mobile layout. No page errors or horizontal phone overflow. Additional hosted checks retain the earlier split VMware/Windows/server-role routes and their appropriate first application.

Review PNGs show the actual implemented website, not the user's Azure tenant or Nessus scanner.

## Remaining lab and image work

Fourteen Azure steps use genuine interface references; sixteen still need a capture. Ten new original Microsoft screenshots and four existing references retain attribution, hashes and version/value caveats. Older source UI banners and sample names/results are explained in captions; they are not live tenant results. All108 Nessus steps still have explicit capture placeholders.

No real Azure patch, reboot, drain, snapshot, backup, restore, disk swap or application/data validation was executed. These require the actual supported VMs, subscription access, update sources, costs, backup consistency, compatible disks/encryption and application owners. A practice-board pass or website verification is not proof that a real maintenance or recovery succeeded.

The hosted console keeps its previous separate VMware/Windows/role pages and real-interface references. It receives the same new Azure/Nessus teaching content and phase-specific welcomes without replacing those prior features. The PR preserves the current source branch’s newer teaching/readability work.
