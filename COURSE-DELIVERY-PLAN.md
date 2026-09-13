# Accepted course scope and delivery order

This is course authoring only. Do not sign in to the user's Azure account, connect to their hosts, or execute instructional infrastructure commands.

Preserve the approved SONIC dashboard layout and palette. All new lessons need numbered actions, exact machine/application/account, commands and option explanations, expected results, verification, troubleshooting, rollback and redacted evidence.

1. Windows workstation and Azure scope: home public IPv4 /32, local passphrase-protected SSH keys in `%USERPROFILE%\.ssh` outside OneDrive/source control; public-key deployment and host fingerprint verification.
2. Dedicated lab resource group, VNet/subnet, scoped administration, VM sizing and disk preparation.
3. Dedicated AD DS & DNS navigation section: Windows domain controller, DNS zones, forward/reverse records, service records, users/groups and prerequisites.
4. Both RHEL hosts; dedicated Static IP / DNS / realm section: fixed Azure NIC addresses, guest DNS, names, A/PTR checks, realm enrollment, supported SSSD GPO access controls. Explain that Azure normally delivers NIC-reserved fixed addresses through DHCP; never confuse a fixed IP with DNS naming or force an unsafe guest-network configuration.
5. Windows-staged Wazuh artifacts → vendor digest/signature validation → SCP/SFTP → Linux digest comparison → approved recovery gate → central installation/dashboard → endpoint agent and event evidence.
6. Client workstation agent deployment, then hardening and compliance. Keep unavailable exercises explicitly planned until authored and validated.
7. Before changes: rollback triggers and decision limits; workplace vSphere snapshot creation, validation, reversion versus deletion/consolidation; enterprise Veeam job/restore-point verification and tested recovery. Domain controllers require AD-aware backup/recovery, not casual snapshot reversion.
8. GitHub handoff and work access after content validation: repository destination, visibility, source review and hosted-access method must be resolved. Do not publish credentials, keys, real infrastructure inventories, screenshots with sensitive information, local tool caches or hosting bypass configuration.

## Information requested

- Veeam is version 12 or 13; teach the common existing VMware backup-job workflow and verify the installed build in Help/About. Explain backup scope before commands.
- Confirmed GitHub destination: CloudSeamTech/RHEL-SONIC. Browser hosting/work access still requires deployment validation after the course is complete.

## Validation boundary

Application tests/build/browser checks verify the course software. They do not demonstrate that the learner's real Azure, AD, RHEL, Wazuh, vSphere or Veeam environment works. Never claim infrastructure execution or lab-tested commands without actual authorized evidence.
