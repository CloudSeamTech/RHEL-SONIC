# Cloud and Endpoint Security on a Budget

Reader: `/security`. Sidebar: Microsoft Azure → 03 / Endpoint Security on a Budget; optional section 04 / Optional Licensed Cloud VDI.

Fifteen classes, 48 steps: 12 local/Arc/security operations classes and three separately gated licensed VDI classes. Every step has a visual: 20 use original vendor interface references and 28 original labeled teaching diagrams. Diagrams are not screenshots. Source URLs, credits, scope/version caveats and asset hashes live in content/security/references.json and public/security/ATTRIBUTION.md.

## Cost and scope contract

The learner's $25 monthly goal is not a fee, prepaid package or hard spending cap. The free baseline uses existing VMware hardware, validly licensed guests and Wazuh. Hardware, power and storage still have real costs. The Microsoft path requires an active Azure subscription and an accepted current Defender plan quote or eligible trial; no eligibility or free trial reset is promised.

Arc does not rehost the server. Defender for Servers Plan 1 is a separate metered server entitlement and is not a client Windows/AVD license. The documented portal path is Defender for Cloud → Environment settings → exact lab subscription → Defender plans → Servers On → Change plans → Plan 1 → Confirm → Save. The switch can default to Plan 2. The introductory lab requires a dedicated subscription containing only intended servers; a new resource group does not limit a subscription-wide plan. Selective resource-level deployment requires its own reviewed design.

Foundational CSPM is the free posture tier; the paid Defender CSPM switch and other workload plans remain separate. No Enable all shortcut. Inventory includes existing/future eligible servers, resource overrides, Policy assignments and any older workspace settings. The course avoids tenant-wide direct onboarding for a single-machine pilot.

VM deallocation, Arc heartbeat state, storage/logging, fixed user licenses, trial conversion and delayed invoices have distinct billing lifecycles. Cleanup includes effective plan state, overrides/policies, appropriate offboarding, actual resource inventory and external license cancellations. A tag does not stop a VM; a budget alert does not guarantee timely intervention or shut down spending. The cost worksheet is browser-only arithmetic using learner-entered rates, not an Azure connection, quote or bill.

## Learning contract

Wazuh is not a feature-for-feature MDE replacement. Discovery, Arc Connected, Antivirus mode and EDR sensor health are separate checks. Detection exercises use only the current vendor-approved test on an authorized pilot. Isolation requires supported features and an independent recovery console; no domain controllers or monitoring manager are isolation targets.

The optional cloud VDI branch uses one licensed personal Entra-joined Windows 11 host, not an unlicensed RDP workaround or an always-on fleet. The learner verifies actual Windows/AVD and client-protection entitlements, total cost and trial expiry before creating anything. A server plan does not cover the client host. No Entra Domain Services, paid VPN gateway, FSLogix share or Intune dependency is silently added to the beginner design.

All current Microsoft and Wazuh source links are in the course. Real interfaces and plan features can change. No Azure resource, plan, license or subscription was created/activated by this website or this content publication. Real installation, billing, alerts, isolation/recovery and VDI provisioning need authorized hands-on validation. The code checks validate the teaching application, not those live outcomes.
