# Curriculum visual guides and capture inventory

## Approved core illustration scope

The user approved adapting and generating the essential teaching screens rather than capturing every click. All **97 classes** now map to a relevant key-workflow illustration in `content/screenshots/core-guides.json`. Thirteen sheets cover Windows/Workstation, creating the AD forest, SQL install/backup/restore, Azure workload migration and OS upgrade, MECM dependencies, SQL quorum, RHEL commands/file verification, Wazuh agent inspection, change/recovery planning, and the AlmaLinux desktop/app/game/storage/command workflows. A worksheet illustrates planning classes; it does not pretend to be a product screenshot. Related classes reuse the relevant sheet.

The reader exposes these under **Key screens for this class · illustrated guide**, with zoom, provenance, version caveats, and class-specific focus. Every sheet is watermarked as illustrated. These are representative combined screens, not literal screenshots of all 803 actions. The written steps are authoritative. Existing original vendor references remain separately labeled. Run `npm run screenshots:core-check` to validate all-class coverage and asset availability.

## Optional exact-capture inventory

The coverage inventory contains **97 lessons and 803 instructional steps**, including the alternative workplace walkthrough and troubleshooting help steps. It is generated from the actual Windows/AD/SQL/Azure/migration guides and the existing Linux/RHEL/Wazuh walkthroughs. There are currently **53 reference-only steps, 750 steps without images, and zero reviewed captures from the target lab**. Those are coverage gaps, not completed screenshots.

`capture-checklist.csv` specifies the exact action, machine, expected result, and filename for every step. `content/screenshots/coverage.json` is its machine-readable counterpart. The filename contains an instruction hash; changing an action invalidates an old capture rather than silently reusing it.

## Capture accurate screenshots

Capture real software in an authorized dedicated lab: Workstation Pro, Server 2019 Desktop Experience on premises, SQL Server and SSMS, the Azure destination and 2019→2022 member-server upgrade, and the RHEL/Wazuh environment. Capture actual states without inventing successful output. Conceptual or planning steps can use a real completed lab worksheet rather than a fake product screen. A screenshot must illustrate the action/result it accompanies; an image of an unrelated wizard does not satisfy the requirement.

On the Windows host, after checking out this branch, open **Windows PowerShell**, change to the repository folder, and run:

```powershell
.\tools\capture-curriculum-screenshots.ps1 -LessonId lab-04
```

The script shows each step and opens Snipping Tool only when you choose C. Select the relevant VM window or portal area, return to PowerShell, and press Enter to save. It needs no administrator rights and does not connect to a VM, run lesson commands, or upload anything. Use S to skip unavailable states and Q to quit. Never change machine execution policy just to run this helper; if local policy blocks it, use the CSV filenames and Snipping Tool manually.

Review captures locally before sharing them: no passwords, tokens, product keys, private keys, real customer data, or personal desktop content. Keep the software version and target machine identifiable where appropriate. Screenshots are instructional examples, not proof that a learner completed the lab. Keep actual tutorial captures distinct from each learner’s own evidence.

## Review and import

The planned reviewed capture registry is `content/screenshots/captures.json`. It is deliberately empty until images are provided and inspected. Each reviewed entry must contain:

- `stepId` and matching full `instructionHash` from the coverage manifest;
- `src` under `/lab-screenshots/captures/`, with the exact expected PNG filename;
- SHA-256 `fileHash` of the image;
- truthful `provenance`, actual `platform`/version, `reviewedAt`, and `reviewed: true`.

Run `npm run screenshots:coverage` to refresh the inventory. Run `npm run screenshots:check` to require reviewed captures for every step. **The completeness check currently fails by design.** Existing vendor reference screenshots never count as reviewed target-lab captures. Do not turn the check green by copying unrelated images or substituting generated screenshots.

Actual target-lab screenshot coverage remains incomplete. It is separate from the approved core illustration scope described above.
