# SONIC-Academy screenshot references

The original inventory covers **803 instructional steps**. After retiring misleading Windows 7 guest images, **742 steps** retain sourced interface references and **61 steps** have an explicit interface-capture gap. Every original step still has a labeled action diagram. The historical source library contains **148 image assets**; unused images are not counted as step coverage. Images are reused when steps use the same interface. These are partial interface references, not exact screenshots of every click or successful output. No dedicated training lab was available; no reviewed target-lab captures have been claimed.

Each image includes its source, platform, credit, and version/value differences. Commands and course values remain authoritative. Diagrams are optional and labeled separately; they do not count as screenshots. `npm run screenshots:interfaces` validates sources, file hashes, instruction hashes and per-step associations. The stricter `npm run screenshots:interfaces-check` fails while the 61 gaps remain. `npm run screenshots:targets-check` separately requires exact target-lab captures and remains incomplete.

The retired references are `workstation-4`, `workstation-6`, `workstation-14` and `workstation-15`. They are genuine Workstation 17 screenshots, but their ISO paths, VM names, disk recommendations or summaries describe a Windows 7 guest. They must not appear as directions for this Windows 10 host / Server 2019 lab. Their original files remain for provenance. The generator excludes them; the audit records missing screenshots instead of counting diagrams. Retained neutral wizard/CPU/memory controls are not claimed as verified Windows 10 captures. The Workstation About dialog and VM Network Adapter settings also need matching captures; an unrelated menu or NAT gateway dialog does not demonstrate those controls. No matching live Windows training host was available for new captures.

VMware/server builds now have three separate reader pages: VMware VM creation, Windows Server 2019 installation, and the server-role/domain lab. Their screenshot IDs continue to refer to the unchanged original instructional inventory. Shared combined class illustrations are excluded from these split pages. Existing role lesson URLs are retained; added setup pages use `-vmware` and `-windows` suffixes.

The remaining inventory below describes the original capture plan and earlier illustration stage, for provenance. Its historical image counts do not describe the current sourced reference coverage.

# Curriculum visual guides and capture inventory

## Pictures inside every step

Every one of the 803 instructional actions now has its own always-visible illustrated step map. This includes all 72 AlmaLinux actions and the other curricula’s guided, workplace and troubleshooting steps. These are diagrams, not newly captured software screenshots. They show context, numbered small actions, command examples when applicable, and the expected observation. See [STEP-PICTURES.md](../STEP-PICTURES.md) and run `npm run pictures:check`. Existing vendor references remain alongside their relevant steps.

## Class-level core illustrations

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
