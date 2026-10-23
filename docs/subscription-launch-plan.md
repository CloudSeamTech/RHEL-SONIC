# Customer accounts and subscriptions: implementation plan

## Current system

The connected Sites academy uses managed sign-in and Cloudflare D1 (`DB`). Tables: `learner_profiles`, `learner_progress`, `learner_activity`. The public Vercel mirror deliberately disables account database writes and keeps guest progress in the browser. GitHub stores application source, not the production user database.

No paid checkout, payment provider, automatic paid-tier grants, or public customer authentication has been connected. Plan labels are Free Tier, Enhanced Tier and Apex Tier. Their paid prices/features must not be invented.

Business: Cloud Seam Technologies, Delaware, United States. The owner confirms that support@cloudseam.tech is not receiving mail yet. Support pages must show that status until real delivery and replies have been tested.

## Recommended production direction

Supabase Auth + Postgres is a reasonable single account system for a public Vercel application. Stripe Checkout, Billing and Customer Portal can handle recurring subscriptions, payment methods, invoices and cancellations. Do not migrate existing accounts or enable charges merely because this document recommends them. Provision the owner's projects and use actual configuration, never stand-in checkout links.

Before moving account data: export/backup D1; preserve lesson IDs and progress payloads; map identities explicitly instead of linking accounts by an unverified email; rehearse migration and rollback. Each profile/progress/activity row needs authenticated-user ownership checks and Supabase RLS. Keep service credentials server-only. Configure and test sign-in, email verification, password reset, sign-out, expired sessions and account deletion. Use production SMTP and an appropriate database plan/backups; evaluate free-tier inactivity pausing before serving paying customers.

For billing: maintain a server-owned user-to-Stripe-customer mapping; only allowlisted price IDs; block duplicate active subscriptions; validate webhook signatures; process events idempotently; reconcile subscription state from Stripe; never grant a paid plan from a success-page URL or client-provided tier. Handle renewals, cancellations, refunds, delayed events and failed payments according to the owner's published policy. Acknowledge processing delays in the UI and offer an authenticated billing portal rather than a second purchase button.

## Decisions needed before paid enrollment

- Prices, currency, billing interval and exact features for Enhanced Tier/Apex Tier.
- Renewal/cancellation effective dates, refund rules, failed-payment/grace policy and tax treatment.
- Required legal seller/address details and purchase/privacy terms for the actual business.
- Working support mailbox with tested inbound and outbound delivery; SPF/DKIM/DMARC for the chosen provider.
- Appropriate availability, backup and recovery arrangements.

## Prelaunch checks

Test new and existing accounts, progress isolation, cross-device resume, concurrent sessions, plan upgrades/downgrades, authentication on checkout and portal sessions, duplicate clicks, declined payments, renewal failure, cancel/resubscribe, refund, webhook retries/out-of-order delivery and provider downtime. Use Stripe test mode first, then an owner-approved live validation. Display total price and renewal/refund terms before charging; never ask users to email card numbers.

## Nano Banana 2 design workflow

Use exported images for brand illustrations, pathway icons and dashboard concepts. Keep layouts, text, navigation and accessibility in application code. Store approved assets locally and optimize them; do not call an image model when a student opens a page. Maintain the academy's cream, purple, orange, black and white palette. Technical screenshots must retain real provenance; generated interfaces must be labeled illustrations/mockups. Verify actual PNG alpha rather than trusting a painted checkerboard. An API workflow requires the owner's Google project, server-side credentials, separate usage/cost limits and review before any generated asset is published.
