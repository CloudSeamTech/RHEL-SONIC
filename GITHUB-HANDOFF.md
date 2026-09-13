# SONIC work-access handoff

The confirmed destination is [CloudSeamTech/RHEL-SONIC](https://github.com/CloudSeamTech/RHEL-SONIC). Browser hosting remains a separate delivery step. Source handoff uses a reviewed checkout of that repository; local hosting credentials are excluded.

On a work machine with GitHub CLI installed and organization access, clone into a new directory using `gh repo clone CloudSeamTech/RHEL-SONIC`. With Git alone, use `git clone https://github.com/CloudSeamTech/RHEL-SONIC.git`. These commands retrieve what has been pushed; they do not upload this local course. Do not clone over the existing authoring folder.

## Before the first push

1. Finish and review the course delivery plan. Run the application tests, lint and production build. Check the learner flow in the browser.
2. Create or select the organization-owned repository with the workplace-approved visibility. Give colleagues access through the appropriate organization team; do not make a private course public merely to avoid sign-in.
3. Review the exact files to stage. Exclude private keys, credentials, real inventories, unredacted evidence, local caches, environment files and `.openai` hosting metadata. `.gitignore` helps prevent accidental staging; it is not a secrets scan and does not remove already tracked secrets.
4. Initialize Git only after the destination is known. Stage reviewed files explicitly, inspect the staged diff, commit, add the confirmed remote, then push. Do not use an unreviewed blanket add of this folder, which also contains reference images.
5. From the work machine, sign in through the approved GitHub organization/SSO flow, open the repository, and confirm the README and course source are accessible. Use the approved development environment if running locally.

## Browser access is a separate deployment

This application uses Vinext and a Worker runtime. A GitHub repository by itself does not serve the interactive course, and GitHub Pages is not a drop-in deployment for this runtime. Choose a compatible host and workplace-approved authentication, then document the course URL in the repository README. Verify that URL from the work network.

Progress currently lives in browser local storage. Opening the course at work, on another browser, or on another origin does not automatically carry over home progress. Account-based synchronization would be a separate feature.

## Acceptance evidence

- Confirmed repository URL and visibility; colleague access verified.
- Clean reviewed source commit, passing checks, and no private operational data.
- If hosting is requested: authenticated course URL tested from work.
- Progress-storage behavior explained to learners.
