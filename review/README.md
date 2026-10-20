# Visual and functional review

Open `comparison.html` for the supplied reference beside the actual 1600 × 991 homepage capture. `comparison.png` is a portable image of that comparison. Dashboard tablet/mobile captures and Windows/Linux lesson, ordered pathway, and terminal captures are included.

The desktop command bar begins at y=28, metrics at y=90, middle panels at y=232 with 394px height, and terminal at y=643. The approximately 14.4% sidebar and thin charcoal panel divisions follow the reference. Metric accents are exactly cyan #21C5DB, green #35D778, amber #DFB656, and pink #D184AC. Surfaces remain neutral black. The four metric rules carry no invented percentages.

Verified in Chromium at 1600×991, 1024×900, and 390×844: no horizontal viewport overflow; expandable course navigation; selected lesson overview; SQL deep links; saved verification after reload; saved progress on the dashboard; prerequisite-based pagination; Linux deep links and return to the new dashboard. Windows lessons, Linux lessons, the ordered pathway directory, and terminal were also checked at desktop and mobile widths. No browser page errors were recorded. See `browser-verification.json`.

Validation: `npm test`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed. All 44 original migration/Windows/SQL lessons and all 40 original Linux lessons are represented exactly once in the pathway map. The existing terminal companion tests passed; no real Windows/AD/SQL/Azure lab or live companion session was executed from this Linux review environment.
