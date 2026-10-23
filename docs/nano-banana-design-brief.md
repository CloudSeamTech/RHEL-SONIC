# SONIC-Academy: Adobe Firefly / Nano Banana 2 design brief

Business: Cloud Seam Technologies, Delaware. Product: SONIC-Academy. Visual brand: CloudSeamTech.

Use the current dashboard screenshot and `public/academy-hero.png` as references. Keep the existing cloud/server illustration consistent rather than generating a different brand in every image.

Palette: main cream #E3D8C4; light panels #EDE4D8; sidebar purple #211A31; purple accent #674199; orange #E7975F; text #292929; white #FFFFFF. Do not change the full website palette or add purple body text.

## How we use the results

1. Generate/export in the owner’s Adobe Firefly account. In Generate images, open the Model picker and select Partner models → Gemini 3.1 (w/ Nano Banana 2) when available to the account. This export workflow needs no Google API connection.
2. Review candidates before adding them to the site. Pick one consistent treatment.
3. Check actual alpha transparency, cropping, contrast and small-screen legibility. If needed, use Adobe Express Remove background, set Background to No fill, and download Transparent PNG. A checkerboard painted into an image is not transparency.
4. Store approved, optimized assets locally in `public/`; record the source/model and the approval date in an asset note. Avoid runtime image-generation calls.
5. Build all real headings, controls and navigation in HTML/CSS. A generated dashboard picture is a design reference, not a working application.
6. Keep actual vendor screenshots attributed. Any generated interface must say “Training illustration — not a live screenshot.” Check every illustrated command/setting against the lesson.

## Prompt: four matching pathway illustrations

“Using the attached CloudSeamTech cloud/server illustration as the style reference, create a consistent set of four separate educational pathway illustrations: Windows System Administration, Azure Cloud Engineering, Cyber Analyst, and Linux System Administration. Soft dimensional forms, clean silhouettes, restrained purple and orange highlights, charcoal hardware, white highlights. No scenery, text, badges, invented vendor logos or tiny interface details. Each illustration must be recognizable at 128 pixels and fit comfortably within a square with 15% clear space around it. Use one consistent light direction and camera angle. Export individual images at 1024×1024. Use a plain contrasting background if true alpha export is unavailable; background removal and alpha verification happen separately.”

## Prompt: refine the existing hero artwork

“Refine the attached cloud-and-server artwork for SONIC-Academy. Preserve its recognizable composition, lavender cloud, orange-lit server racks and zipper. Improve clean edges and remove stray colored pixels outside the silhouette. Keep the entire object visible with comfortable clear space; do not crop any server, cloud or zipper. No words, gradients outside the object, backdrop, frame or scenery. Prepare one isolated high-resolution image; export with a real transparent alpha channel if supported, otherwise a plain contrasting background for subsequent background removal.”

## Prompt: a dashboard design concept

“Use the attached working SONIC-Academy dashboard as the controlling reference. Propose a polished design concept using cream #E3D8C4, panels #EDE4D8, sidebar #211A31, restrained purple #674199 and orange #E7975F, body text #292929 and white highlights. Preserve a left navigation rail with Dashboard, Learning Paths, All Courses, Start Your Lab, My Bookmarks and Troubleshooting. Maintain large readable headings, generous spacing, a compact search bar, avatar, learning progress and resume card. Keep the cloud artwork fully contained. No duplicated classroom lists, tiny text, overlapping labels, fake live security statistics, dark grey teaching panels or decorative background scenery. The result is a visual concept only; implementation and responsive/accessibility checks will be done in code.”

## Optional API workflow later

The owner uses Adobe Firefly. There is no direct Firefly connection in this workspace. Use approved image exports first. Any later Adobe Firefly Services or Google API workflow needs its own supported model/entitlement check and configured project; do not assume an Adobe application subscription includes a separate API service. Store any API credential in server-side environment configuration, never browser code or GitHub. Restrict generation to an authenticated admin workflow, set usage limits, and require asset review. Students should receive approved static assets rather than invoking the model on page load.

Official guides:
- https://helpx.adobe.com/firefly/web/work-with-images/generate-images/generate-images-using-gemini.html
- https://helpx.adobe.com/express/web/image-creation-and-editing/edit-images/remove-background.html
