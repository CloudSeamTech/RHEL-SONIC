# CloudSeam lab naming

The authoritative primary lab AD DNS domain is **cloudseam.tech** (NetBIOS **CLOUDSEAM**). Keep AG-DC01, AG-DC02, APP01, SQL01 and existing lesson IDs/routes. Domain controllers provide private AD-integrated DNS; member servers and lab clients use those DNS servers.

The private application name is **helpdesk.cloudseam.tech**, an A record in that existing private zone pointing to APP01's actual lab address. Public website, mail and registrar records are separate. Do not change public nameservers or overwrite the zone apex to complete the help desk class. Internal clients may need explicitly maintained records for public CloudSeam services because AD DNS is authoritative internally.

Cross-forest migration exercises use a separate **migrate.cloudseam.tech** forest with NetBIOS **MIGRATE**, on DEST-DC01. Choose **Add a new forest**, not **Add a new domain to an existing forest**. The shared suffix does not create a parent/child AD trust. The existing lab uses conditional forwarding between the two private DNS namespaces; do not also create a conflicting child primary zone. If your own network uses DNS delegation instead, configure and validate it explicitly with your instructor. Verify both LDAP SRV lookups before any trust/membership operation. Forest trust remains optional for the documented GPO/rejoin exercises.

The optional separate Azure destination forest is **azure.cloudseam.tech**, not a second unrelated forest named cloudseam.tech. Cross-forest DNS forwarding must name both distinct namespaces. This is separate from rehosting a VM while retaining its existing domain membership.

These are updated fresh-build instructions. Changing a workbook does not rename an already-installed AD forest, change a live DNS server, or update stored service identities. Students with an older practice forest should use a new isolated build or a separately planned migration; do not perform an in-place forest rename by blindly replacing names.

## osTicket course

Windows Server & Active Directory → **03 / Build an IIS Help Desk** → `/helpdesk`.

Thirteen lessons, 43 steps cover plan, IIS/CGI, PHP, MariaDB, site/pool permissions, private DNS, HTTPS, installer cleanup, tickets/agents, optional authenticated mail, backup/isolated restore, logs, private Nessus scope and Azure migration baseline. The database is MariaDB, separate from the SQL Server pathway.

Baseline checked against official osTicket and PHP documentation: free self-hosted osTicket (currently 1.18.4 release line), PHP 8.4.27 minimum or newer patched 8.4 x64 NTS, maintained MariaDB 10.11 Windows release, IIS CGI and URL Rewrite. Students record actual security-patch versions rather than installing old tutorial bundles. Source links are in the course.

Every step has a visual: 16 show original interface references and 27 show explicitly labeled original action diagrams. Diagrams are **not screenshots**, and original vendor captures use their original example names. No live Windows/osTicket installation, email delivery, database restore, Nessus scan or Azure migration was executed in this workspace. Full hands-on validation and exact per-step captures remain future lab work.

## PHP security update and rollback

The October 21, 2026 PHP advisory fixes CVE-2026-109618 and CVE-2026-109619 beginning at 8.4.27 for the 8.4 branch. The preparation and fresh-install lessons now give the exact official Windows download selection, SHA-256 check and web-served runtime verification. Recheck vendor advisories for any later required security release.

After tested backup/restore, Update PHP and Recover Safely adds seven steps: inventory the actual IIS handler/runtime/INI; protect the database, files and IIS settings; stage a separate verified candidate; test an isolated restored copy; switch only the target handler/FastCGI application and restart its pool; verify the web-served version plus ticket/attachment/mail checks; and recover only to a security-approved runtime. Vulnerable previous PHP stays offline. Database restore and server-wide IIS restore are not the default response to a PHP mapping failure.

References: https://www.php.net/archive/2026.php#2026-10-21-1 and https://www.php.net/downloads.php . These instructions do not patch a student VM automatically.
