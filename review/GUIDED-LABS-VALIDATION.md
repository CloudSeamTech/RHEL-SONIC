# Guided lab revision validation

- 45 Windows/AD/SQL/Azure/migration classes now have structured one-action-at-a-time walkthroughs with location, prerequisites, expected results, troubleshooting, evidence, and rollback.
- All 85 classes across both curricula have a mapped key-workflow illustration. Nine generated/adapted sheets are explicitly labeled as illustrations; related classes reuse the relevant sheet. This is not a claim of 731 authentic per-step captures.
- Windows builds use VMware Workstation Pro and Windows Server 2019 Desktop Experience. APP01's test workload is transferred to a separately provisioned Azure APP02 Server 2019 member server before the new upgrade-01 exercise upgrades APP02 to 2022. This is workload migration, not whole-VM rehosting.
- Existing route IDs and verification progress remain intact. upgrade-01 has its own ID. Guided step notes are stored separately from lesson verification.
- Passed npm test, TypeScript, production build, and focused lint for the new guide UI/parser audit tests. Repository-wide lint retains existing console/navigation warnings.
- Browser checks cover reference and illustrated image dialogs, saved step notes, separate next-step state, lesson switching, the Azure media command, four representative core guides, and no horizontal overflow at 390px. See adjacent JSON reports and actual application screenshots.
- Commands and enterprise workflows have not been executed against real VMware, Windows/SQL/MECM, or Azure infrastructure in this environment. Vendor references and illustrations do not count as target-lab execution evidence.
