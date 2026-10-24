# Connect cloudseam.tech

The public academy is live at https://cloudseam.tech/.
`www.cloudseam.tech` redirects to the apex address using HTTP 308. The fallback
address is https://sonic-academy-cloud-seam.vercel.app/.

## DNS configuration reference

1. Sign in to Cloudflare and open **cloudseam.tech → DNS → Records**.
2. Add or edit the following website records. If an existing record uses the
   same name, review its purpose before replacing it; do not delete the zone.

| Type | Name | Target | Proxy status | TTL |
| --- | --- | --- | --- | --- |
| CNAME | @ | bc30cfb8e410acd9.vercel-dns-017.com | DNS only | Auto |
| CNAME | www | bc30cfb8e410acd9.vercel-dns-017.com | DNS only | Auto |

These are the Vercel CNAME targets used for this project; Cloudflare flattens the apex CNAME.
Recheck **Vercel → Project → Settings → Domains** before changing DNS in the
future; Vercel recommendations can change. Resolve conflicting website records
only for `@` and `www`, including stale AAAA records if Vercel identifies them.
Keep mail (MX), SPF, DKIM, DMARC, verification TXT, and unrelated records intact.
Nameservers do not need to change.

3. Return to **Vercel → Project → Settings → Domains** and refresh the status.
4. Wait for both domains to show valid configuration and HTTPS readiness.
5. Open `https://cloudseam.tech/`, then a lesson such as
   `https://cloudseam.tech/migration#lesson=lab-19`.
6. Confirm `https://www.cloudseam.tech/` redirects to the apex address.

DNS propagation and certificate issuance may take time. Keep the working
Vercel address available until these checks pass. Do not change GitHub Pages
redirects to the custom address before it works.

## Accounts and email

Changing the website domain does not add public authentication, private Apex
content delivery, paid subscriptions, or a mailbox. The public Vercel mirror
currently supports guest learning; the connected Sites deployment has its own
account and progress backend. Review the subscription launch plan separately.
The planned `support@cloudseam.tech` mailbox still requires email-provider setup
and delivery testing.
