# SONIC design system — locked baseline

Preserve the approved dashboard structure and the existing completion/navigation model. The command center is expressive; the lesson workspace is calm. The representative lesson is `network-plan-v2`; the user approved the design and continuation into Wazuh. The ten deployment lessons reuse this workspace treatment without changing the dashboard layout.

The authoritative final palette overrides are in `app/sonic-design-system.css`; SVG globe gradients and geometry colors are in `app/sonic-core.tsx`. Existing component styles retain layout and responsive behavior.

| Role | Treatment |
| --- | --- |
| Environment | Black `#08090b`, graphite `#101114`, dark glass |
| Information | White `#f2f3f5`, silver `#bfc2ca` |
| Instrumentation / security / rollback | Tactical red `#ca4c59` |
| Failure | Brighter red `#ff5366` plus explicit failure text or symbol; decorative red never implies an incident |
| Interaction / SSH / connectivity | Electric cyan; keep primary start/continue action obvious |
| Verification / completion | Green; derived from learner verification |
| Caution / review | Amber with descriptive text |

Approximate guidance: 60–65% black/graphite, 20% white/silver, 10% red, 5–10% cyan. Do not enforce percentages mechanically or invent telemetry.

NOTE and CHECK use quiet cyan/white; VERIFY uses green; WHY THIS MATTERS uses silver; CAUTION/TROUBLESHOOT use amber (red with explicit failure context); ROLLBACK uses red/white; vSphere uses silver/cyan; YOUR TURN uses white/cyan. Terminal headers identify the actual execution context. Never imply that rexuser is the Windows or Azure identity.

The globe uses silver continents and grid, graphite oceans/rings, red instrumentation and scanning, and selected cyan connections. It is conceptual topology, not live geographic deployment data. Preserve pause and reduced-motion support.

Course timing is editorial guidance, not measured telemetry. `app/course-timing.ts` is the single source for 30 lesson estimates, stage totals and remaining active time. Preparation totals 120–180 minutes hands-on with a functioning environment; optional reading and 11–25 minutes passive Azure waits are separate. No duration is fabricated for planned stages.
