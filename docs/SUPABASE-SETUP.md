# Connect SONIC-Academy to Supabase, Google, and GitHub

## What is working today

The public academy at https://cloudseam.tech currently saves guest progress in
browser storage. The original connected academy uses managed ChatGPT sign-in and
Cloudflare D1. These are separate account systems.

**This is an owner setup guide, not a claim that Google/GitHub sign-in is live.**
No Supabase project, OAuth application, credentials, database migration, or paid
resource has been provisioned by this change. The application integration in
step 6 still needs implementation after the project configuration is available.
Do not enable customer sign-in until the end-to-end checks below pass.

## 1. Create the Supabase project

1. Open https://supabase.com/dashboard and sign in to your owner account.
2. Choose **New project**, select your organization, and name it `SONIC-Academy`.
3. Select a region close to your learners. Choose the Free plan for the pilot if
   its current limits fit; review production availability, backups, pausing,
   quotas, and pricing before accepting paying customers.
4. Generate a database password and store it in your password manager. Do not
   paste it into chat or GitHub. Wait until the project is ready.
5. In **Project Settings → API / API Keys**, find the project URL and publishable
   key. Dashboard labels may vary. A legacy `anon` key can also be used with RLS.
   Keep any secret/service-role key private and out of browser code.

**Why:** Supabase Auth manages identities; its Postgres database holds profiles
and learning records. SONIC-Academy never needs a student's Google/GitHub password.

## 2. Set the website return address

In **Authentication → URL Configuration**, set:

| Setting | Value |
| --- | --- |
| Site URL | `https://cloudseam.tech` |
| Allowed redirect URL | `https://cloudseam.tech/auth/callback` |

Use the canonical domain rather than `www`, since `www` redirects to it.
Register local development callbacks separately when needed, using the actual
local port. Do not broadly allow every Vercel preview domain in production.

There are **two different callbacks**:

- Google/GitHub returns to Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`.
- Supabase returns to the academy: `https://cloudseam.tech/auth/callback`.

Copy the provider callback from Supabase; do not literally enter `<project-ref>`.
The academy callback route is proposed and still needs the implementation in step 6.

## 3. Enable Google sign-in (including Gmail accounts)

1. Open https://console.cloud.google.com/ and create/select the academy's project.
2. Open **Google Auth Platform** (older UI: **APIs & Services → OAuth consent screen**).
3. Configure **Branding** with the academy name, logo, homepage, and an actively
   monitored support email. The planned `support@cloudseam.tech` mailbox is not
   confirmed active yet; do not promise delivery there until it is tested.
4. Choose **External** audience so students outside your organization can sign in.
   While in Testing, add your test users. Publish the app for public access and
   complete any domain/branding verification Google requires before launch.
5. Configure only identity scopes: `openid`, email, and profile. Gmail mailbox
   access is unnecessary; "Sign in with Google" does not mean reading email.
6. Under **Clients**, create an **OAuth client → Web application**.
7. Add **Authorized JavaScript origin** `https://cloudseam.tech`.
8. Add the exact Supabase callback from step 2 as **Authorized redirect URI**.
9. Copy the client ID and client secret directly into Supabase:
   **Authentication → Sign In / Providers → Google**. Enable and save it.

**Why:** Google checks the student’s identity, then Supabase creates a stable
account ID. Contact email is not an authorization key.

## 4. Enable GitHub sign-in

1. In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set **Application name** to `SONIC-Academy`.
3. Set **Homepage URL** to `https://cloudseam.tech`.
4. Set **Authorization callback URL** to the exact **Supabase** callback from step 2.
5. Register the application and generate a client secret.
6. Enter the ID and secret directly in Supabase:
   **Authentication → Sign In / Providers → GitHub**. Enable and save it.
7. Request only basic identity/email access. Students do not need to grant
   repository write access or organization administration to take a course.

## 5. Create the learning tables

In the new Supabase project, open **SQL Editor → New query**. Review and run
[`db/supabase/001_academy_accounts.sql`](../db/supabase/001_academy_accounts.sql)
**once**, in the intended new database. It creates:

| Table | Stores | Who may write |
| --- | --- | --- |
| `auth.users` | Provider identities, managed by Supabase | Supabase Auth |
| `academy_profiles` | Display name, contact email, optional phone | That signed-in user |
| `academy_memberships` | Free/Apex entitlement | Trusted administration/billing only |
| `academy_progress` | Existing progress-key payloads and bookmarks | That signed-in user |
| `academy_activity` | Recently opened lesson IDs | That signed-in user |

Row Level Security (RLS) compares `auth.uid()` with each row's `user_id`.
A missing membership row means Free. Students cannot edit their own tier.
Do not disable RLS to make a failed request work. Keep the service-role key out
of Vercel's public variables and student clients; it bypasses RLS.

This new schema is separate from D1. It does not migrate or delete existing data.

## 6. Connect the application (developer work still required)

From the repository folder, install the official packages:

```sh
npm install @supabase/supabase-js @supabase/ssr
```

In **Vercel → sonic-academy → Settings → Environment Variables**, add:

- `NEXT_PUBLIC_SUPABASE_URL`: the project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the publishable key.

These are public configuration values, not database passwords. Provider client
secrets belong in Supabase's provider settings. Do not upload `.env.local` or
secrets to GitHub. Vercel variables require a new deployment to take effect.

This repository uses **Vinext/Vite + Nitro**, not a stock Next.js build.
Confirm the public-variable injection and server cookie APIs with this adapter;
adding variables or copying a Next.js example alone does not connect the app.
Do not remove the existing Vercel D1 adapter or change native Sites identity
handling without replacing and testing the complete Vercel account flow.

Implement and review these pieces together:

1. A browser Supabase client and a per-request server client using the official
   SSR cookie adapter. Refresh sessions using the supported adapter flow.
2. Sign-in actions calling `supabase.auth.signInWithOAuth()` with `provider:
   'google'` or `'github'`, and `redirectTo:
   'https://cloudseam.tech/auth/callback'`. Use PKCE with the official SDK;
   do not hand-roll OAuth state or token storage.
3. `/auth/callback`: exchange the authorization code with
   `exchangeCodeForSession()`, persist the cookies, and return to `/profile`.
   Show a useful retry message if the code is invalid or consent was canceled.
   Do not accept arbitrary external `next` destinations.
4. On server requests, verify the user through Supabase Auth (`getUser()` or
   the currently recommended verified-claims method). Never trust a submitted
   user ID, editable email, localStorage tier, or an unverified session object.
5. Replace the **Vercel** `/api/learner` implementation with Supabase reads/writes
   using the verified user's token, so RLS stays active. Return the existing
   `{ accountAvailable, user, records, activity }` contract to `AcademyProvider`.
6. Preserve expected-account matching, same-origin checks, request-size limits,
   profile validation, valid lesson/progress-key checks, error reporting, and
   guest-import consent. Map JSONB payloads back to the existing record strings.
7. Upsert the learner's own profile after first sign-in; display Free when no
   membership exists. Read tiers from the protected membership table.
8. Wire profile sign-out to Supabase and preserve account isolation on account
   switches. Keep the legacy Sites backend working separately until migrated.

Do not ship active Google/GitHub buttons before all of these pieces are ready.

## 7. Test with two separate student accounts

- Google sign-in, GitHub sign-in, canceled consent, expired callback, sign-out,
  refresh, and return after closing the browser.
- Edit profile; complete a real lesson/check; save a bookmark; sign in on another
  device and verify the records return.
- Confirm account A cannot read/write account B's profile, progress, activity,
  or membership, including direct API requests and forged user IDs.
- Confirm anonymous users cannot read private tables, and student clients cannot
  grant Apex or overwrite membership rows.
- Confirm changing accounts with a stale tab cannot save to the wrong account.
- Import guest progress only after the correct user explicitly chooses it.
- Test email-hidden GitHub accounts and email changes; stable Auth user IDs remain
  the keys. Do not merge legacy accounts based only on a typed matching name.
- Check Supabase Auth logs for errors without recording tokens or authorization codes.

For legacy D1 records, export a backup and use a verified account-linking process
before copying data to new Supabase UUIDs. Guest browser progress can use the
existing explicit import after the new account flow is working.

## 8. Apex and subscriptions are a separate release

OAuth and RLS protect account records. They do **not** hide the curriculum that
currently ships in public client bundles and the public GitHub repository.
Move protected lessons to private, server-authorized delivery before selling
exclusive access. Stripe checkout/portal and verified, idempotent webhooks can
then manage Apex entitlement. Account help and billing/cancellation support
must remain available to Free users.

## Official references

- [Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub provider](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Server-side Auth](https://supabase.com/docs/guides/auth/server-side)
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)
