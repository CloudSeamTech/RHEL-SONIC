# SONIC-Academy learner accounts

The connected Sites deployment uses managed Sign in with ChatGPT and a D1 database. The existing audience remains unchanged. Identity comes from Sites dispatch; the app never derives identity from request bodies, stores passwords, or implements its own OAuth flow. Writes include an expected-account binding, compared with the verified identity, so an old tab cannot save into a newly signed-in account.

## Stored records

- A display name keyed to the authenticated site-scoped user ID.
- Existing course, lesson-check, quiz and bookmark records under that same user ID.
- The latest opening time for each visited lesson.

The dashboard calculates counts from the existing curriculum and the learner's saved records. Verification remains self-reported evidence, not a certificate or proof that a server was changed.

## Guest and account progress

Guests keep progress in browser storage. Signing in loads account progress without silently importing a shared browser's guest records. The Profile page provides an explicit import. Course changes save immediately when possible, retry after failures, and retain a local outbox for interrupted saves. A cloud-save error remains visible in the profile status. Concurrent offline changes use the last saved record; this is not a collaborative conflict-resolution system.

## Deployment

The Sites-only `.openai/hosting.json` declares `"d1": "DB"`. Drizzle schema is in `db/schema.ts`; generated schema-only migrations and metadata are in `drizzle/`. Run `npm run db:generate` for later schema changes. Do not edit an applied migration. Sites applies packaged migrations when publishing.

The public Vercel mirror deliberately maps `lib/academy-db.ts` to `lib/academy-db-vercel.ts`. It supports guest learning but does not trust Sites identity headers or claim account storage is connected. Enabling accounts there requires a separately provisioned identity/database provider; this deployment does not create one or assume credentials. The Profile page explains the distinction and links to the connected academy.

For local testing, the Sites Vite plugin provides its documented local sign-in simulation during development. Production Worker tests used local D1 and simulated platform headers for test identities, never real learner credentials. This does not verify a real user's sign-in session.

## Screenshot coverage

Existing attributed interface references and clearly labeled illustrated action maps are retained. The visual redesign does not turn diagrams or partial vendor references into exact live-lab captures. The existing screenshot inventories continue to identify gaps.

## Local regression test

With the local D1 schema applied and a preview running at `http://127.0.0.1:3011`, run `npm run test:academy-api`. The tool checks actual database persistence, per-user isolation, expected-account matching, anonymous write denial, origin checks and input validation. It rejects non-local URLs and uses synthetic identities only in the local preview.
