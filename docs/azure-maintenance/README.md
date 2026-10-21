# Azure maintenance and recovery / SONIC-Academy

Open **Microsoft Azure → Update, Back Up and Recover Servers**, or `/azure-operations`.

Ten short lessons take the learner through choosing Windows/RHEL pilots, checking the healthy baseline, making a usable Azure Backup recovery point and testing a restore, consistent pre-change disk snapshots, Update Manager assessment, Windows and RHEL pilot updates, one-at-a-time rollout, failed-update decisions and isolated recovery. Each lesson includes actions, command explanations, screenshots or explicit capture gaps, checks, an exercise and questions.

The practice board is a simulation. It requires a baseline, backup/restore check and snapshot before a simulated update, holds the next wave until both pilots pass, allows only one active server change, stops on failed health checks, and requires a revised pilot test after restoring the old baseline. It does not connect to Azure, wait through an actual maintenance window or prove high availability. A real application’s drain, redundancy and observation requirements still control a real rollout.

## Pictures and lab limits

Thirty numbered steps contain **14 genuine interface references and 16 clearly labeled capture gaps**. Four existing Azure references and ten additional original Microsoft Learn images are retained with credits, source URLs, hashes and version caveats. Reference images show the source author’s names, dates and results, not the learner’s environment. An extra Create Disk reference remains available in the registry. Sixteen steps still need specific real captures; these are not counted as screenshots. See `review-inventory.json`.

No live updates, snapshots, backups, restores, disk swaps or reboots were performed in Azure. An instructor must validate the exact VM images, supported security/disk/encryption configuration, subscription permissions, update source, costs, recovery consistency and application checks in an authorized lab. Keep the actual pilot and restore evidence privately. Practice status and website completion never prove those operations succeeded.

## Technical boundaries taught

- A snapshot is a point-in-time disk object, not a complete application backup or universal VM undo button. Separately timed live disk snapshots are not automatically one consistent recovery set.
- Azure Backup protection is not ready merely because a policy was enabled. Check a successful recovery point, covered disks, actual consistency and a suitable restore test. Linux filesystem consistency is not automatically database application consistency.
- Azure Update Manager jobs/schedules do not by themselves guarantee application-aware serial maintenance. The lab updates one machine at a time with explicit health gates. Existing guest/GPO/other-manager reboot settings also matter.
- Supported Windows update removal depends on the actual update. RHEL core-package `dnf history undo/rollback` is not a supported whole-OS recovery recipe. Booting an older kernel does not restore other packages/data.
- Recovery uses the tested application-aware plan. A new Azure resource name does not remove the recovered guest’s old identity. Restore into an isolated network for rehearsal; disk swaps have compatibility requirements and do not automatically coordinate application data.

Official references are linked inside every step. Written procedures were reviewed against Microsoft Learn and Red Hat guidance; actual resource and application validation remains a lab task.
