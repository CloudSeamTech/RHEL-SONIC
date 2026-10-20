# RHEL-SONIC engineering console

The supplied DevOps dashboard screenshot controls layout, colors, typography, and segmentation. `review/comparison.html` displays that reference beside the implemented homepage. No scenic imagery, decorative illustration, green surfaces, glass, glow, or promotional hero is part of this system.

| Role | Color |
| --- | --- |
| Main background | `#000000` |
| Sidebar | `#080808` |
| Panel surfaces | `#050505`–`#101010` |
| Selected navigation | `#1C1C1C` |
| Panel borders | `#242424` |
| Main / muted text | `#EAEAEA` / `#898989` |
| Current course / information | `#21C5DB` |
| Available / verified status | `#35D778` |
| Next task / caution | `#DFB656` |
| Workspace / metadata | `#D184AC` |
| Critical errors | `#E36878` |

Space Grotesk is the primary UI family. IBM Plex Mono is reserved for commands, logs, timestamps, and technical metadata. Colors identify individual statuses and information types; headings and panel backgrounds remain neutral.

At 1600px, the sidebar is approximately 14.4% wide. The main workspace starts with a 45px command bar, four 125px status panels, two adjacent 394px content panels, and a bottom terminal panel. Borders are 1px charcoal; corners are square. Tablet metrics form two columns and middle panels stack below 900px. Phone navigation opens as an expandable menu. Course and module lists scroll independently when needed.

`app/learning-console.tsx` and `app/learning-console.css` define the dashboard. `app/console-reader-shell.tsx` and `app/engineering-system.css` apply the same system to existing lesson readers, pathway directories, and hands-on terminals. The earlier component styles retain their structural rules, with neutral console overrides; the obsolete scenic asset and all stylesheet references to it are removed.

Counts and next tasks come from the existing curriculum and browser progress stores. Accent rules in metric panels are decorative separators, not invented progress bars. Dashboard command examples are explicitly simulations. The actual local terminal keeps its existing connection controls, authentication, and command confirmation behavior.
