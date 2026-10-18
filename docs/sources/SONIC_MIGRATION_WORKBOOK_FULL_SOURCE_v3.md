HANDS-ON / BEGINNER LEVEL

FROM HOME LAB  
TO CLOUD MIGRATION

A click-by-click migration worksheet: Active Directory, WSUS, SQL Server, MECM and Azure

VMware Workstation Pro • Windows Server • SQL Server • Configuration Manager • Azure

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>THE MISSION</strong></p>
<p>Pretend a small agency is moving into a bigger enterprise domain. Build the old agency, build a new destination domain, move one test server safely, then explore how to repeat the process in Azure.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

For beginners: every click, the reason it matters, a PASS CHECK, troubleshooting, and space for notes. Start local; pay for Azure only when ready.

## What you will be able to do

**\[ \]** Build and verify two on-prem domain controllers and an application server.

**\[ \]** Create a separate destination Active Directory forest (not merely a DNS zone).

**\[ \]** Back up and import a test Group Policy, and move a member server into the new domain.

\[ \] Build SQL Server, create a test database, back it up to .bak, restore it, and explain what does NOT carry over.

## Your lab promises

\[ \] Build an MECM (Configuration Manager) primary site on its own server connected to a supported SQL Server instance.

**\[ \]** No real DoD information, systems, credentials, or production networks.

**\[ \]** No exposing Active Directory, RDP, LDAP, or SMB ports to the public internet.

\[ \] Start local and cheap; in Azure, use budgets, timed lab sessions, deallocation, and cleanup.

Version 3.0 \| October 15, 2026 \| Independent learning lab, NOT an official DISA or production implementation guide.

LAB 00 / START HERE

# Pick your training route

The complete course has a working local path and a separate Azure extension. You can succeed even before you spend money in Azure.

| **Route**               | **Machines**                            | **You finish with**                                                 |
|-------------------------|-----------------------------------------|---------------------------------------------------------------------|
| Core (recommended)      | AG-DC01, DEST-DC01, APP01 (3 local VMs) | Two distinct domains, test GPO transfer, member-server domain move. |
| Agency replica (add-on) | Add AG-DC02 (4 local VMs)               | Real same-domain AD replication practice.                           |
| Patching (add-on)       | Add WSUS01 (5 local VMs)                | Understand patch-server dependency and WSUS sizing.                 |
| Azure extension         | Azure AZ-DC01 (+ approved private VPN)  | Separate AD domain in Azure and a planned cloud cutover.            |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IMPORTANT DISTINCTION</strong></p>
<p>A domain controller is not just a new VM and a public DNS zone. A Windows AD forest is created by installing AD DS and promoting a server. Your existing public cloudscene.tech zone does not automatically create ad.cloudscene.tech as an AD domain.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

UPDATED LEARNING PATH - SQL/MECM labs follow Lab 13; optional HA-01 through HA-05 follow AZ-03:

\[ \] Original Labs 01-07: network, agency.test, two DCs, test users, APP01.

\[ \] Original Labs 08-12: destination.test, GPO, member-server move, rollback.

\[ \] Original Lab 13: WSUS01; then new SQL-01 through SQL-05 and MECM-01 through MECM-05.

\[ \] New MOVE-01 through MOVE-04: understand a SQL .bak move vs. MECM site/hierarchy migration.

\[ \] Original Labs 14-17: Azure portal, DNS, private connectivity, migration wave.

\[ \] New AZ-01 through AZ-03: low-cost Azure SQL restore, validation and safe shutdown.

\[ \] Optional HA-01 to HA-05: SQL01 + SQL02 Windows cluster, Azure cloud witness, verification, and safe test.

\[ \] Original Labs 18-20 + new FIELD-01: interview handoff, troubleshooting, cleanup.

**Your available desktop RAM (GB)** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Your lab date** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Your Azure monthly cost ceiling** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 01 / DIAGRAM + TERMS

# Understand the map

First understand what each computer represents. You are building a tiny version of a real migration.

| **OLD AGENCY / SOURCE**                 | **NEW ENTERPRISE / DESTINATION**                          |
|-----------------------------------------|-----------------------------------------------------------|
| AG-DC01 \| agency.test \| 192.168.77.10 | DEST-DC01 \| destination.test \| 192.168.77.40            |
| AG-DC02 (optional) \| 192.168.77.11     | AZ-DC01 (later) \| ad.cloudscene.tech \| Azure private IP |
| APP01 \| 192.168.77.30 \| IIS website   | APP01 after domain change: destination.test               |
| WSUS01 (optional) \| 192.168.77.50      | Your cloud deployment is a separate, later exercise       |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IMAGINE TWO SCHOOLS</strong></p>
<p>The agency domain is the old school. The destination domain is the new school. Moving a computer is like changing the school it belongs to. Its old school record does not magically become a new record. You prepare identities, rules, and access in the new school.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Forest =** A separate Active Directory identity system with its own domain controllers and directory database.

**OU =** An organizational folder for users/computers; useful for organizing and linking Group Policies.

**GPO =** A set of rules Windows applies to users or computers (for example, a test login notice).

**DNS =** The phone book that finds the right domain controller or service by name.

**Trust =** An approved way for two forests to recognize identities; it does not copy user accounts.

**NAT / VMnet =** A private practice network in VMware; NAT lets VMs share outbound internet access without publishing their private addresses.

**/24 =** Short way to write subnet mask 255.255.255.0.

**Snapshot =** A save point for a VM so you can recover from a lab mistake (not a substitute for a full production backup).

**Cutover =** The planned switch from an old service/domain to a new one.

**Rollback =** Your tested way to return to the original working state if cutover fails.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>We will first prove that the two forests really are separate. Then we will deliberately move only APP01. We never try to turn an agency DC into a destination DC.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

LAB 02 / WORKSTATION

# Prepare your laptop and downloads

You need the right installer and enough resources before doing any domain work.

**\[ \]** On your Windows desktop, open https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2025

**\[ \]** Register if Microsoft asks. Choose the 64-bit ISO and download it to a folder such as C:\LabISOs.

**\[ \]** VMware Workstation Pro: open it and confirm you can create a Windows Server 64-bit guest.

**\[ \]** Choose Windows Server with Desktop Experience during OS installation. GUI-based lessons will not match Server Core.

**\[ \]** Budget for RAM: 4 GB per small DC and 4 GB for APP01 as a starting lab allocation; 16 GB of free host RAM is helpful for three VMs, and 32 GB total host RAM is more comfortable.

**\[ \]** Reserve disk capacity: approximately 55–65 GB virtual disk per VM (thin provisioned); WSUS needs substantially more if you sync content.

**\[ \]** Keep all ISO files and VMware VM folders out of your regular work or classified environments.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EVAL RULE</strong></p>
<p>Microsoft states the Windows Server 2025 evaluation expires after 180 days. Activate the evaluation over the internet within the first 10 days to avoid automatic shutdown. The evaluation is for testing, not production use.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**PASS CHECK** Your ISO downloaded; VMware Workstation Pro opens; you have sufficient free storage.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If the VMware installer cannot boot from the ISO, confirm the ISO path, the guest firmware settings, hardware virtualization in BIOS/UEFI, and whether another hypervisor is interfering.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**ISO filename** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Free RAM / free disk** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 03 / NETWORKING

# Build one safe VMware network

Every local VM needs to communicate, but none of the AD services should be exposed to the internet.

**\[ \]** In VMware Workstation Pro, open Edit \> Virtual Network Editor. Choose Change Settings if shown.

**\[ \]** Pick an unused custom VMnet (for example VMnet2) and choose NAT. If you already use VMnet2 for something important, choose another unused VMnet.

**\[ \]** Set the subnet IP to 192.168.77.0 and mask to 255.255.255.0. Confirm the NAT gateway address shown by VMware; often it ends in .2, but use your actual value.

**\[ \]** Open DHCP Settings. Ensure its address pool does NOT include the static lab addresses .10, .11, .30, .40, and .50. Adjust the DHCP range if needed.

**\[ \]** Create a VM network adapter in each VM connected to that SAME custom NAT VMnet. Do not bridge to a real office or managed network.

**\[ \]** For each Windows VM: press Win+R, type ncpa.cpl, right-click Ethernet \> Properties \> Internet Protocol Version 4 \> Properties. Use the static addresses from the next table.

| **Server**     | **IP / mask**     | **Preferred DNS**       | **Gateway**             |
|----------------|-------------------|-------------------------|-------------------------|
| AG-DC01        | 192.168.77.10 /24 | 192.168.77.10           | Your VMware NAT gateway |
| AG-DC02        | 192.168.77.11 /24 | 192.168.77.10 initially | Your VMware NAT gateway |
| APP01          | 192.168.77.30 /24 | 192.168.77.10           | Your VMware NAT gateway |
| DEST-DC01      | 192.168.77.40 /24 | 192.168.77.40           | Your VMware NAT gateway |
| WSUS01 (later) | 192.168.77.50 /24 | 192.168.77.10           | Your VMware NAT gateway |

> ipconfig /all  
> ping 192.168.77.10

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>The computers can talk to each other on this private lab network. DNS tells the agency members to ask AG-DC01 about agency.test. Later, the destination domain has its own DNS authority.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If your real VMnet uses a different subnet, record that subnet and change ALL example IPs consistently. Do not reuse an existing home, VPN, Azure, or corporate subnet.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Actual VMnet number / NAT gateway** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 04 / FIRST DOMAIN CONTROLLER

# Make AG-DC01: the agency begins

Create the first Windows server, then make it the owner of the agency.test forest.

**\[ \]** VMware: File \> New Virtual Machine \> Typical \> Installer disc image file (ISO). Pick the Windows Server ISO.

**\[ \]** Choose Windows Server 2025 Standard (Desktop Experience), if offered. Select 2 vCPUs, 4 GB RAM, ~60 GB thin disk, and your custom NAT VMnet.

**\[ \]** Install Windows. Set a strong local Administrator password and keep it securely outside the workbook.

**\[ \]** In the VM: right-click Start \> System \> Rename this PC (advanced), or run sysdm.cpl \> Computer Name \> Change. Name it AG-DC01. Restart.

**\[ \]** Set the static IP to 192.168.77.10, subnet mask 255.255.255.0, VMware gateway, and preferred DNS 192.168.77.10.

**\[ \]** Open Server Manager \> Manage \> Add Roles and Features \> Role-based or feature-based installation \> select AG-DC01 \> Active Directory Domain Services. Install.

**\[ \]** In Server Manager, select the flag notification \> Promote this server to a domain controller \> Add a new forest.

**\[ \]** Root domain name: agency.test. Enable DNS server and Global Catalog. Set a strong DSRM password. Continue through prerequisite checks and select Install.

**\[ \]** Let the server reboot; sign in with the new domain account (for example AGENCY\Administrator).

> hostname  
> ipconfig /all  
> Get-ADDomain \| Select-Object DNSRoot,NetBIOSName

**PASS CHECK** hostname = AG-DC01; the Active Directory domain DNS root shows agency.test.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>You have created an Active Directory forest, not merely typed a name into a public DNS zone. The AD DS installation creates the directory and publishes service records in its DNS.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If Get-ADDomain is unrecognized, launch Windows PowerShell as Administrator on the DC and ensure AD DS/RSAT modules are installed. If promotion fails, inspect prerequisite errors, DNS/IP settings, and System event logs.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Forest name / screenshot path** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 05 / IDENTITY + RULES

# Create test users, OUs, and a GPO

Give the agency realistic things to migrate. Use only fake people and fake data.

**\[ \]** On AG-DC01 open Server Manager \> Tools \> Active Directory Users and Computers.

**\[ \]** Right-click agency.test \> New \> Organizational Unit. Create an OU named Operations. Create an OU named Security too.

**\[ \]** Right-click Operations \> New \> User. Make user test.analyst, set a strong temporary password, and optionally require password change at next logon.

**\[ \]** Right-click Operations \> New \> Group. Create group GG-Operations. Add test.analyst as a member.

**\[ \]** Open Server Manager \> Tools \> Group Policy Management. Expand Forest \> Domains \> agency.test.

**\[ \]** Right-click the Operations OU \> Create a GPO in this domain, and Link it here. Name: LAB-Operations-Banner.

**\[ \]** Right-click LAB-Operations-Banner \> Edit \> Computer Configuration \> Policies \> Windows Settings \> Security Settings \> Local Policies \> Security Options.

**\[ \]** Set Interactive logon: Message title for users attempting to log on = AGENCY LAB. Set Interactive logon: Message text for users attempting to log on = This is a practice environment.

**\[ \]** Close the editor. The GPO must remain linked to the Operations OU so that an Operations computer can receive it.

> Get-ADUser test.analyst  
> Get-GPO -Name "LAB-Operations-Banner"

**PASS CHECK** You see both OUs, the test user, GG-Operations, and the named GPO.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>A GPO linked to a particular OU applies to the objects in that OU, subject to filtering and inheritance. We chose a visible harmless login notice so we can prove policies survived the move.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If you do not see Group Policy Management, add the Group Policy Management feature through Server Manager &gt; Add Roles and Features &gt; Features.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Your test user / GPO** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 06 / APPLICATION

# Make APP01: the server that will move

APP01 is a normal domain member, not a domain controller. We will install a tiny website to test.

**\[ \]** VMware: create another Windows Server Desktop Experience VM named APP01, 2 vCPUs, 4 GB RAM, ~60 GB thin disk, on your lab NAT VMnet.

**\[ \]** Set its IP to 192.168.77.30/24, gateway to your NAT address, and preferred DNS to 192.168.77.10 (AG-DC01).

**\[ \]** Open Windows PowerShell as Administrator. Run the DNS and network checks below.

**\[ \]** Press Win+R \> sysdm.cpl \> Computer Name \> Change \> Domain, enter agency.test. Provide authorized agency.test admin credentials. Restart.

**\[ \]** On AG-DC01 \> Active Directory Users and Computers, find APP01 in Computers and move the computer object into the Operations OU.

**\[ \]** On APP01 open elevated Windows PowerShell and install IIS using the command below.

**\[ \]** Create a simple practice home page at C:\inetpub\wwwroot\index.html. Run gpupdate /force and reboot if requested.

**\[ \]** Open http://localhost on APP01. You should see your custom webpage.

> nslookup agency.test 192.168.77.10  
> Test-NetConnection 192.168.77.10 -Port 53  
> Install-WindowsFeature Web-Server -IncludeManagementTools  
> Set-Content C:\inetpub\wwwroot\index.html "\<h1\>Agency app is alive\</h1\>"  
> gpupdate /force  
> gpresult /r /scope computer

**PASS CHECK** APP01 belongs to agency.test; localhost website works; gpresult lists LAB-Operations-Banner as applied.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>A domain member has its own application and local data. Moving it to another domain is different from migrating a domain controller or copying Active Directory.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If domain join fails, verify APP01 DNS points to AG-DC01, not to your home router or 8.8.8.8. Use nslookup -type=SRV _ldap._tcp.dc._msdcs.agency.test 192.168.77.10.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**APP01 IPv4 / domain / website result** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 07 / OPTIONAL REPLICA

# Add AG-DC02: copy the same domain

This exercise demonstrates AD replication. Unlike a new destination forest, AG-DC02 stays in the agency.test domain.

**\[ \]** Create AG-DC02 (Windows Server Desktop Experience) on the same lab network. Name it AG-DC02.

**\[ \]** Assign 192.168.77.11/24; preferred DNS 192.168.77.10; VMware NAT gateway.

**\[ \]** Open sysdm.cpl \> Computer Name \> Change \> Domain, enter agency.test. Restart.

**\[ \]** In Server Manager \> Manage \> Add Roles and Features, install Active Directory Domain Services.

**\[ \]** Select Promote this server to a domain controller \> Add a domain controller to an existing domain. Choose agency.test.

**\[ \]** Use authorized domain admin credentials, enable DNS, choose Global Catalog, and finish the promotion.

**\[ \]** After reboot, open PowerShell as Administrator on either DC and run the commands below.

**\[ \]** Confirm the Operations OU, test.analyst, and GPO appear when you connect the admin consoles to AG-DC02.

> repadmin /replsummary  
> dcdiag /test:dns  
> Get-ADDomainController -Filter \* \| Select-Object HostName,IPv4Address

**PASS CHECK** Two DC names appear; replication shows no persistent errors; user/GPO objects match.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>Within one AD forest/domain, directory objects replicate to additional DCs. That is NOT how you transfer identities into a different forest, such as destination.test or a DISA-provided domain.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If replication fails, inspect both DNS settings, time synchronization, firewall rules, and Event Viewer &gt; Directory Service / DFS Replication.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Replication summary** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 08 / SECOND FOREST

# Create DEST-DC01: the NEW enterprise

Build the other school. Its directory must remain completely separate from agency.test.

**\[ \]** Create a new Windows Server Desktop Experience VM named DEST-DC01. Use 2 vCPUs, 4 GB RAM, ~60 GB thin disk, same lab NAT VMnet.

**\[ \]** Set static IP 192.168.77.40/24, preferred DNS 192.168.77.40, gateway to your NAT address.

**\[ \]** In Server Manager \> Manage \> Add Roles and Features, install Active Directory Domain Services.

**\[ \]** Select Promote this server to a domain controller \> Add a new forest. Enter destination.test.

**\[ \]** Enable DNS, keep Global Catalog selected, and configure a strong DSRM password. Complete promotion and restart.

**\[ \]** Open AD Users and Computers. Verify the tree shows destination.test, not agency.test.

**\[ \]** Create an Operations OU. Create a \*new\* test.analyst account and GG-Operations group in destination.test. Record the domain in which you created each.

> Get-ADDomain \| Select-Object DNSRoot  
> Get-ADUser test.analyst \| Select-Object Name,SID

**PASS CHECK** DEST-DC01 shows destination.test; the account SID differs from agency.test's test.analyst SID.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>Same username does not mean same identity. Separate domains generate different security identifiers. Real migrations require a plan for group mappings, service accounts, permissions, and user profiles.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>Do not join DEST-DC01 to agency.test first. If you accidentally promoted into the wrong forest, revert to a clean pre-promotion VM snapshot and build the intended separate forest again.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Destination forest / sample SID ending** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 09 / DNS + OPTIONAL TRUST

# Teach the forests to find each other

For a cross-forest lab, each DC must resolve the other forest. You can transfer GPO backups without a trust.

**\[ \]** On AG-DC01, open Server Manager \> Tools \> DNS. Expand AG-DC01.

**\[ \]** Right-click Conditional Forwarders \> New Conditional Forwarder. DNS domain: destination.test. Master server IP: 192.168.77.40. Select OK.

**\[ \]** On DEST-DC01, open DNS \> Conditional Forwarders \> New Conditional Forwarder. DNS domain: agency.test. Master server IP: 192.168.77.10.

**\[ \]** On both DCs run nslookup with the other domain name and its explicit local DNS server.

**\[ \]** For a trust exercise ONLY, after name resolution works: open Active Directory Domains and Trusts \> right-click the root domain \> Properties \> Trusts \> New Trust.

**\[ \]** Enter the other forest name and review the wizard. For a local-only lab you may configure a two-way forest trust with controlled test credentials, then validate it in both directions. Skip this step if you only intend to import GPO backups and rejoin one server.

> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.destination.test 192.168.77.10  
> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.agency.test 192.168.77.40

**PASS CHECK** Each query returns an SRV record for the opposite forest; trust is optional, not a prerequisite for the rest of the exercises.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>Conditional forwarding is like telling one school secretary which phonebook to ask for the other school. A trust adds controlled authentication paths; it does not migrate directory objects.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If the SRV query times out, check the server IPs, DNS Server role, conditional forwarder entries, and TCP/UDP 53 on the private lab network. If trust fails, check supported AD ports and time skew.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**DNS query results / trust used?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 10 / POLICY MIGRATION

# Export and import your test GPO

This lesson is the answer to “How do I move the agency’s Group Policies into a different domain?”

**\[ \]** On AG-DC01 open Group Policy Management. Expand agency.test \> Group Policy Objects.

**\[ \]** Right-click LAB-Operations-Banner \> Back Up. Choose a folder like C:\GPOBackups. Give the backup a description.

**\[ \]** Copy the completed GPO backup folder onto DEST-DC01 using an approved local lab method (for example, a temporary VMware shared folder). Keep all files within each backup folder.

**\[ \]** On DEST-DC01 open Group Policy Management. Expand destination.test \> Group Policy Objects.

**\[ \]** Right-click Group Policy Objects \> New. Create LAB-Operations-Banner-Dest.

**\[ \]** Right-click that new GPO \> Import Settings \> Next. Back up the empty GPO if prompted, then browse to the transferred GPO backup folder.

**\[ \]** Choose LAB-Operations-Banner. For our simple banner the wizard should not need domain-specific security principal mappings. Finish importing.

**\[ \]** Right-click the Operations OU in destination.test \> Link an Existing GPO \> LAB-Operations-Banner-Dest.

**\[ \]** Open the destination GPO and confirm the login title and message are present.

> Get-GPO -Name "LAB-Operations-Banner-Dest" -Domain destination.test

**PASS CHECK** The destination GPO exists, contains the test banner, and is linked to the destination Operations OU.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>A GPO imported across forests brings the selected policy SETTINGS, but not its original OU links or security filtering. Real policies may need a migration table for old domain group names and UNC paths.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If Import Settings does not find the backup, verify you copied the backup folder including its manifest and GUID folder. Re-run Back Up and retry. Do not copy SYSVOL folders by hand.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Backup location / destination GPO** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 11 / CUTOVER DAY

# Move APP01 to the new domain

Now perform one controlled cross-domain server move. Keep the old domain running and prove that the application still works.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>STOP HERE BEFORE CHANGING MEMBERSHIP</strong></p>
<p>Take a powered-off VMware snapshot of APP01 (or an independent VM backup). Make a note of its old domain, IP, IIS page, account permissions, and how to sign in with the LOCAL Administrator after leaving agency.test.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**\[ \]** On APP01, record the starting state using the commands below. Save results as a plain-text migration log.

**\[ \]** Confirm the IIS webpage is still available at http://localhost.

**\[ \]** Create/verify a local Administrator login on APP01 and test that you know its credentials. Keep a working VMware console session.

**\[ \]** On APP01, open sysdm.cpl \> Computer Name \> Change \> Workgroup. Enter LAB-TEMP. Supply agency admin credentials if asked; reboot.

**\[ \]** Log in with APP01\Administrator (local). Change APP01 DNS from 192.168.77.10 to 192.168.77.40 in the IPv4 adapter settings. Keep its own IP as 192.168.77.30.

**\[ \]** Run nslookup destination.test 192.168.77.40 and the destination AD SRV record check from Lesson 9.

**\[ \]** Open sysdm.cpl \> Computer Name \> Change \> Domain. Enter destination.test. Provide destination domain join credentials; reboot.

**\[ \]** On DEST-DC01, find APP01 in Active Directory Users and Computers and move the computer account into destination.test \> Operations.

**\[ \]** On APP01, run gpupdate /force and gpresult /r /scope computer. Open the website again. Check the logon notice.

> hostname  
> (Get-CimInstance Win32_ComputerSystem).Domain  
> Get-Service W3SVC  
> Test-NetConnection 192.168.77.40 -Port 53  
> gpupdate /force  
> gpresult /r /scope computer

**PASS CHECK** APP01 now belongs to destination.test; the website works; destination GPO is applied; old DCs remain intact.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>We changed the COMPUTER identity and DNS first, then verified the application. Notice that reinstalling or copying the whole VM was not necessary to practice a domain rejoin. This does not automatically transfer user profiles or access control lists.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If the new join fails, use local Administrator, verify network route and DNS, check time sync, and review System logs. Do NOT delete the old agency forest to force a migration.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Before-domain / after-domain / PASS?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 12 / RECOVERY

# Test rollback and record the result

A real migration engineer needs a recovery path, not only a success screenshot.

**\[ \]** Capture evidence: hostname, new domain, IP configuration, applied GPO name, and successful local IIS page.

**\[ \]** Stop and imagine the destination app failed. State the rollback trigger: for example, DNS/domain join failure, app 500 error, or a broken service account.

**\[ \]** If you need rollback, power off APP01 and revert to its PRE-CUTOVER snapshot. Do not roll back domain controllers as your recovery technique.

**\[ \]** Power on APP01. Confirm the old agency domain, DNS, GPO, and website are back as expected.

**\[ \]** If you are continuing to the Azure extension, keep the rollback APP01 snapshot so you can practice a second migration from agency.test later.

**\[ \]** Write a change ticket note stating what you changed, what worked, what failed, and whether you rolled back.

> (Get-CimInstance Win32_ComputerSystem).Domain  
> ipconfig /all  
> gpresult /r /scope computer  
> Get-Service W3SVC

**PASS CHECK** You can show both a valid cutover checklist and an actual rollback verification.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>Snapshots of an isolated test MEMBER server are practical for this exercise. Rolling back a domain controller snapshot is not the same thing and can introduce serious directory consistency issues; use supported AD backup/recovery methods.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Rollback trigger** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Last known-good snapshot name** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Outcome / fix / what you learned** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 13 / PATCHING

# Optional: build a WSUS server

WSUS is a separate server role. Treat it as an application dependency, not as something that must automatically move into the cloud.

**\[ \]** Create WSUS01 (Windows Server) on the agency.test lab network; set IP 192.168.77.50 and DNS 192.168.77.10.

**\[ \]** Join WSUS01 to agency.test and restart.

**\[ \]** In Server Manager \> Manage \> Add Roles and Features, select Windows Server Update Services. Review prerequisites and choose a local content directory on a volume with generous free space.

**\[ \]** Install the role and complete the post-installation tasks. Open the WSUS console.

**\[ \]** Do NOT immediately synchronize every product and classification. First review upstream update source, proxy/internet requirements, storage, and cleanup.

**\[ \]** Create a worksheet entry identifying which clients use WSUS and what GPO setting configures the intranet update service.

**\[ \]** For the “migration plan,” decide whether to preserve WSUS, rebuild it, or use an approved destination patching service.

**PASS CHECK** You can explain the WSUS role, its data/content requirements, client targeting, and why it is not automatically migrated with an AD trust.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>Enterprise cloud teams often standardize patching at the destination. You should discover policy, approval, download, bandwidth, and compliance dependencies BEFORE choosing a tool.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>WSUS can consume a lot of disk and download bandwidth. Skip synchronization in a resource-limited home lab; the architecture lesson still counts.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**WSUS update source / disk plan** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

NEW / ROUTE MAP / HOW ALL THE PARTS FIT

# See the whole migration before touching a server

Picture five school buildings. AD is the student directory; WSUS is the update library; SQL is the filing cabinet; MECM is the school office that tracks computers. They depend on each other.

| **Build order** | **Machine**       | **Suggested lab IP** | **Its job**                                                      |
|-----------------|-------------------|----------------------|------------------------------------------------------------------|
| 1               | AG-DC01 / AG-DC02 | 192.168.77.10 / .11  | AD domain agency.test; DNS, accounts, GPO                        |
| 2               | WSUS01            | 192.168.77.50        | Windows update service; later add MECM software update point     |
| 3               | SQL01             | 192.168.77.60        | SQL Server database engine; MECM database + separate PracticeDB  |
| 4               | MECM01            | 192.168.77.70        | Configuration Manager site server, management/distribution roles |
| 5               | APP01             | 192.168.77.30        | IIS member server and client to test migration                   |
| 6               | DEST-DC01         | 192.168.77.40        | Separate destination.test forest for identity migration practice |
| 7               | AZ-SQL01 (later)  | 10.90.x.x            | Azure SQL Server VM; practice .bak restore                       |

Only turn on what you need. For MECM to run: AG-DC01 + SQL01 + MECM01 must be on; add WSUS01 for update lessons. A second DC adds redundancy, not a new forest.

MECM and SQL Server can technically share a server for a lab, but we deliberately separate them so you learn dependency mapping. This requires more RAM and is NOT a tiny laptop lab.

**PASS CHECK** You can draw this dependency arrow: MECM01 -\> SQL01 (site database), MECM01 -\> AD/DNS, MECM software update point -\> WSUS01.

SQL-01 / DOWNLOADS + SIZING

# Choose the right SQL and MECM installers

We are building TWO kinds of databases: a practice database we own, and a special Configuration Manager site database that MECM owns.

\[ \] Find your Windows Server evaluation installer from Microsoft Evaluation Center; reuse your Windows Server ISO in VMware.

\[ \] Download SQL Server 2022 Evaluation (a full Database Engine edition), or another currently supported full SQL edition allowed by the evaluation terms.

\[ \] SQL Server 2025 can work with Configuration Manager version 2603 or later. Choose SQL Server 2022 for a straightforward compatible beginner lab; record both exact versions.

\[ \] Download SQL Server Management Studio (SSMS) separately. Think: SQL Server is the engine; SSMS is the remote control.

\[ \] Download Microsoft Configuration Manager current-branch evaluation from Microsoft Evaluation Center and record its build/version. Verify the current evaluation conditions in the download terms.

\[ \] Read the Configuration Manager Windows ADK compatibility page before downloading ADK/WinPE add-on; do NOT automatically choose the newest ADK.

\[ \] Estimate memory: DC01 4 GB, DC02 4 GB, WSUS01 4+ GB, SQL01 12-16 GB, MECM01 12-16 GB; host also needs RAM. 48-64 GB host RAM is a practical target for concurrent use.

\[ \] Choose thin-provisioned VM disks but keep ample actual storage space for SQL data and MECM content. Avoid synchronizing full WSUS catalogs during first exercise.

**PASS CHECK** You have installer filenames, SQL version, MECM version, host RAM, and a storage plan written down.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

SQL-02 / NEW WINDOWS VM

# Create SQL01 and join agency.test

We must build the computer first. It is not SQL until SQL Server software is installed.

\[ \] In VMware: File \> New Virtual Machine \> Typical \> pick Windows Server ISO \> Desktop Experience.

\[ \] Give this VM name SQL01, 2-4 vCPUs, lab-sized RAM (begin around 12 GB if you can), and a disk sized for Windows plus SQL data/backups.

\[ \] Attach the same isolated VMware VMnet network used by AG-DC01. NEVER bridge into a work or classified network.

\[ \] After Windows installation, rename it SQL01 and reboot. Set fixed IP 192.168.77.60/24, correct VMware gateway, DNS 192.168.77.10.

\[ \] On SQL01 run nslookup agency.test and ping AG-DC01 by name; ICMP may be blocked, so DNS is the important first check.

\[ \] Windows \> Settings \> System \> About \> Rename this PC (advanced) \> Change \> Domain: agency.test. Enter lab domain join credentials; restart.

> hostname  
> (Get-CimInstance Win32_ComputerSystem).Domain  
> ipconfig /all  
> Resolve-DnsName AG-DC01.agency.test

**PASS CHECK** SQL01 is a MEMBER of agency.test and resolves AG-DC01 correctly. It is NOT a DC.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

SQL-03 / SET UP SQL ENGINE

# Install SQL Server correctly on SQL01

SQL Server is the filing cabinet. We will configure its lock, doors and labels before any application uses it.

\[ \] Sign into SQL01 with your authorized lab domain admin/setup account and launch SQL Server Setup as administrator.

\[ \] Select Installation \> New SQL Server stand-alone installation. Choose your Evaluation licensing option; accept terms.

\[ \] Feature Selection: enable Database Engine Services. Keep features minimal; SQL Reporting Services is optional and separate.

\[ \] Instance Configuration: select Default instance (MSSQLSERVER); write that choice down. A named instance is fine but needs extra connection details.

\[ \] Database Engine Configuration \> Server Configuration \> Collation: specify SQL_Latin1_General_CP1_CI_AS. This matters for MECM.

\[ \] Authentication: Windows Authentication mode; click Add Current User for a setup administrator. Do not use a weak SQL sa password.

\[ \] Configure service accounts per current Microsoft guidance. Configure SQL memory after install so it cannot starve Windows; MECM primary site DB requires enough memory.

\[ \] Finish setup; use SQL Server Configuration Manager \> SQL Server Network Configuration \> Protocols for MSSQLSERVER \> TCP/IP \> Enabled.

\[ \] For the simple lab, choose a fixed TCP port 1433 under TCP/IP IPAll, clear dynamic port, restart SQL Server (MSSQLSERVER). Document before changing anything.

\[ \] On SQL01, use Windows Defender Firewall with Advanced Security \> Inbound Rules \> New Rule \> Port \> TCP 1433 \> Allow \> scope to MECM01 (192.168.77.70) / authorized management IPs ONLY.

\[ \] Do NOT allow public or entire-internet connections to TCP 1433; keep SQL inside private networks.

> Get-Service MSSQLSERVER  
> Test-NetConnection SQL01.agency.test -Port 1433

**PASS CHECK** SQL engine service Running; correct collation selected; TCP connectivity works from MECM01 later (not necessarily from other hosts).

**WATCH OUT** When setup uses a separate remote SQL host, MECM needs special site-server computer account permissions, described in MECM-02. Do not treat an arbitrary .bak as a supported MECM site recovery.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

SQL-04 / SSMS + FAKE DATA

# Use SSMS to create a database you understand

Think of SSMS as a filing-cabinet window. The SQL database lives on SQL01 even when you open SSMS on another computer.

\[ \] On SQL01 install SSMS from the Microsoft website. Open SQL Server Management Studio.

\[ \] Connect to Server: Server type = Database Engine; Server name = SQL01 or SQL01.agency.test; Authentication = Windows Authentication; Connect.

\[ \] Expand Databases. Open New Query. Paste the practice script below. It creates only FAKE records and never touches MECM tables.

> CREATE DATABASE AgencyHelpdesk;  
> GO  
> USE AgencyHelpdesk;  
> GO  
> CREATE TABLE dbo.Tickets (  
> TicketID INT PRIMARY KEY,  
> Summary NVARCHAR(100) NOT NULL,  
> Status NVARCHAR(20) NOT NULL  
> );  
> INSERT INTO dbo.Tickets VALUES  
> (101, 'Printer not working', 'Open'),  
> (102, 'VPN help', 'Closed');  
> SELECT \* FROM dbo.Tickets;

\[ \] Click Execute (or F5). Verify Messages says commands completed and Results shows two tickets. Refresh Databases and find AgencyHelpdesk.

\[ \] Practice SELECT with WHERE Status = Open; screenshot your query and result.

> USE AgencyHelpdesk;  
> SELECT TicketID, Summary, Status FROM dbo.Tickets;

**PASS CHECK** Two fake rows visible. You can explain DB = the binder, table = one sheet, rows = entries, SSMS = management tool.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

SQL-05 / .BAK AND RESTORE

# Make a real backup and restore it

This is the same side-by-side idea you heard about when SQL 2017 moved to SQL 2022. A .bak is a database backup, not a whole Windows VM or complete SQL instance.

\[ \] In File Explorer on SQL01 make C:\SQLBackups; ensure the SQL Server service account has access.

\[ \] SSMS \> Databases \> AgencyHelpdesk \> right-click \> Tasks \> Back Up. Backup type Full; Destination Disk; Add C:\SQLBackups\AgencyHelpdesk_full.bak.

\[ \] Click OK. Confirm backup completed successfully. File Explorer: verify file exists and is not zero bytes.

\[ \] In SSMS choose New Query, then RESTORE VERIFYONLY to test whether the backup set is readable.

> RESTORE VERIFYONLY  
> FROM DISK = 'C:\SQLBackups\AgencyHelpdesk_full.bak';

\[ \] Now practice restoring a COPY on SQL01 without overwriting original: SSMS \> Databases \> Restore Database \> Device \> ... choose .bak \> Destination: AgencyHelpdesk_RestoreTest.

\[ \] On the Files page choose Relocate all files to folder (or give new physical file paths) so the restored MDF/LDF do not overwrite originals.

\[ \] After restore succeeds run SELECT against AgencyHelpdesk_RestoreTest. You should see the same two rows.

> SELECT name, state_desc FROM sys.databases;  
> SELECT \* FROM AgencyHelpdesk_RestoreTest.dbo.Tickets;

**PASS CHECK** Original AgencyHelpdesk and AgencyHelpdesk_RestoreTest coexist; .bak file exists and passes VERIFYONLY.

**WATCH OUT** A database .bak restores database contents and schema; it does NOT automatically migrate SQL logins, SQL Agent jobs, linked servers, server settings, service accounts, certificates or app connection strings.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MECM-01 / MAKE THE SITE SERVER

# Create MECM01 and prepare Windows roles

Configuration Manager / MECM is the school office: it knows which computers exist and which software and updates they need. It stores much of that information in SQL01.

\[ \] VMware \> File \> New VM \> Windows Server Desktop Experience; name MECM01; fixed lab IP 192.168.77.70; DNS 192.168.77.10; allocate about 12-16 GB RAM if possible.

\[ \] Join MECM01 to agency.test, restart, and confirm domain name/DNS connectivity.

\[ \] Open Server Manager \> Manage \> Add Roles and Features; review current Configuration Manager site prerequisites for IIS, BITS, .NET, RDC and other required components for your selected version.

\[ \] Install the correct supported Windows ADK plus Windows PE add-on, if you plan to use operating-system deployment. Cross-check the current ADK support matrix first.

\[ \] Create folders on MECM01: C:\CMPrereqs for prerequisite downloads, C:\CMSource for setup sources, and a spacious content library folder as needed.

\[ \] Verify MECM01 can contact SQL01 on the SQL TCP port from PowerShell. DNS and firewall must permit it.

> hostname  
> (Get-CimInstance Win32_ComputerSystem).Domain  
> Resolve-DnsName SQL01.agency.test  
> Test-NetConnection SQL01.agency.test -Port 1433

**PASS CHECK** MECM01 is domain-joined; SQL01 resolves; Test-NetConnection reports TcpTestSucceeded = True.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MECM-02 / AD + SQL PERMISSIONS

# Allow MECM01 to talk to Active Directory and SQL

A computer can be domain-joined and still be denied database access. We must give the proper identity permission.

\[ \] On AG-DC01, open Server Manager \> Tools \> ADSI Edit. This is the advanced AD editor; use ONLY in this disposable training forest.

\[ \] In ADSI Edit \> Connect to Default naming context \> DC=agency,DC=test \> CN=System. Right-click System \> New \> Object \> Container, name it System Management.

\[ \] Right-click CN=System Management \> Properties \> Security \> Add agency\MECM01\$ (select Computers); grant Full Control with inheritance to descendants for site publishing.

\[ \] Optionally extend the lab AD schema using ConfigMgr media \SMSSETUP\BIN\X64\extadsch.exe as a Schema Admin; BACK UP AD system state first. Schema extension is a separate, forest-wide, difficult-to-reverse change.

\[ \] On SQL01: Computer Management \> Local Users and Groups \> Groups \> Administrators \> Add agency\MECM01\$ (site-server computer account), as required for this remote site-system setup.

\[ \] SSMS on SQL01 \> Security \> Logins \> New Login \> agency\MECM01\$ \> Server Roles \> sysadmin. This high privilege is required by Configuration Manager; apply only to the isolated lab SQL instance.

\[ \] Ensure the account RUNNING MECM Setup is local Administrator on MECM01 and SQL01, and SQL sysadmin on the instance (per Microsoft requirements).

\[ \] On MECM01 test name resolution and SQL connectivity again. Confirm SQL01 Windows firewall permits TCP 1433 ONLY from MECM01 and authorized admin hosts.

> Test-NetConnection SQL01.agency.test -Port 1433  
> \# In SSMS on SQL01 check Security \> Logins for AGENCY\MECM01\$

**PASS CHECK** You can explain two access paths: MECM01 -\> SQL01 TCP and MECM01 computer identity -\> SQL Server permissions.

**WATCH OUT** Do not repeat sysadmin grants, ADSI changes, or schema extension inside a government tenant without change approval and the official design/permissions review.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MECM-03 / SETUP WIZARD

# Install a stand-alone primary site (evaluation)

Use the graphical Setup Wizard and verify every prerequisite. We are NOT installing an enterprise central administration site for five lab VMs.

\[ \] On MECM01, mount the official Configuration Manager evaluation media. Run splash.hta or the documented setup entry point and choose Install; follow setup.exe wizard.

\[ \] Select Install a Configuration Manager primary site. For a small lab choose Use typical installation options only if that path correctly matches your remote SQL layout; otherwise Custom setup options.

\[ \] Product Key page: Evaluation. Accept product terms. Download prerequisite files to C:\CMPrereqs (internet connection needed) or use predownloaded files.

\[ \] Site settings: Site code LAB (three characters); Site name Agency Lab; installation folder on MECM01. Choose stand-alone primary site.

\[ \] Database Information: SQL Server FQDN SQL01.agency.test; default instance (leave name blank); database by default CM_LAB; Service Broker port 4022.

\[ \] SMS Provider: MECM01.agency.test. On client communication choose HTTPS/enhanced HTTP design appropriate for your isolated lab; do NOT expose HTTP roles to the internet.

\[ \] Management Point and Distribution Point: MECM01.agency.test for small lab. Use required certificates/communication options for your chosen version.

\[ \] Run Prerequisite Checker. STOP if red errors appear. Resolve missing Windows features, ADK, permissions, SQL collation, port or network issues before installing.

\[ \] Begin install. Watch the setup progress and logs, including C:\ConfigMgrSetup.log or logs shown by the wizard. This can take a while.

\[ \] When done, open Configuration Manager Console \> Administration \> Site Configuration \> Sites. Confirm site LAB appears.

**PASS CHECK** The console opens successfully and SQL01 SSMS \> Databases contains CM_LAB. You never manually created CM_LAB!

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MECM-04 / A REAL MANAGED DEVICE

# Add a client and test the SQL dependency

The office needs a student. An MECM site with no client is like a tracking system with nothing to track.

\[ \] On MECM01 \> Administration \> Hierarchy Configuration \> Boundaries, add the LAB subnet 192.168.77.0/24 or your actual VMnet IP range.

\[ \] Create a Boundary Group (example LAB-BG), add that boundary, and associate site assignment LAB and the distribution/management server as appropriate.

\[ \] On APP01 (a lab member server), install the Configuration Manager client using the approved client push/setup method documented for your version. For example, an authorized manual install from \MECM01\SMS_LAB\Client uses ccmsetup.exe with site parameters.

\[ \] Check the Windows Control Panel \> Configuration Manager applet on APP01, then Actions and assigned site; verify client is healthy and assigned LAB.

\[ \] On MECM01 console \> Assets and Compliance \> Devices, find APP01, see active/client status and new inventory.

\[ \] In SSMS on SQL01, refresh databases; confirm CM_LAB is online. Do NOT make manual inserts/deletes in CM_LAB.

\[ \] For dependency proof (lab only), pause MECM-related work and stop SQL Server briefly on SQL01. Observe MECM console/database connectivity errors, then START the SQL service immediately.

> Get-Service MSSQLSERVER \# on SQL01  
> Get-Service CcmExec \# on APP01 if client installed

**PASS CHECK** APP01 is visible as a managed client and returns after SQL restarts. You can explain that MECM uses a LIVE SQL database, not a one-time .bak.

**WATCH OUT** Client install arguments and server-role permissions vary by version. For production use change controls and approved deployment methods; a server can appear in inventory before all features function.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MECM-05 / WSUS + SUP

# Connect MECM to the separate WSUS01 server

WSUS is the update catalog. MECM is the manager that approves and targets update deployments. MECM Software Update Point (SUP) is the connector.

\[ \] Confirm WSUS01 already has the WSUS role installed (original Lab 13) and is joined to agency.test with proper DNS.

\[ \] On WSUS01 open IIS Manager and check whether WSUS Administration is listening on HTTP 8530 or HTTPS 8531; record actual configured ports.

\[ \] Install WSUS Administration Console/components on MECM01 as required by your ConfigMgr version. Make sure MECM01 can talk to WSUS01 and SQL01.

\[ \] MECM console \> Administration \> Site Configuration \> Servers and Site System Roles \> Add Site System Server \> WSUS01.agency.test.

\[ \] Add Software Update Point role, select lab-appropriate HTTPS/security settings and WSUS ports; use the correct port values for the existing WSUS install.

\[ \] Use Administration \> Site Configuration \> Sites \> Configure Site Components \> Software Update Point to choose narrow products/classifications, for example a limited Windows category, and a safe sync schedule.

\[ \] Monitor Monitoring \> Software Update Point Synchronization Status and review WCM.log and wsyncmgr.log on the site server if sync fails.

\[ \] Avoid downloading every update. A tiny demo can prove architecture with minimal or no package content; use a limited pilot client for deployment.

**PASS CHECK** WSUS01 has a SUP role in ConfigMgr; MECM shows configuration/sync status; you know the update workflow and disk impact.

**WATCH OUT** Do not configure the same clients with conflicting stand-alone WSUS GPO and Configuration Manager update policies. Production SUP usually needs TLS, certificates and approved patching design.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MOVE-01 / COMPARE MIGRATION METHODS

# You do not move every server the same way

Here is the secret to cloud migration interviews: inventory one system at a time, identify its dependencies, and choose a supported migration method.

| **System**         | **Common supported strategy**                                                                                                | **Big thing to check**                                            |
|--------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| Domain controllers | Create additional DC in same forest then replicate; for NEW forest rebuild identity/migrate objects through approved process | DNS, SYSVOL, GPO, trusts, identity, FSMO                          |
| WSUS01             | Rebuild or redesign; optionally move supported WSUS DB/content with planned restore                                          | Products, update catalog, clients, approvals, content             |
| SQL01 (user DB)    | New SQL Azure VM + .bak backup / restore                                                                                     | SQL version, logins, jobs, permissions, DB users                  |
| MECM01 with CM_LAB | Same site move requires a supported site server/site DB process; new target hierarchy requires side-by-side migration jobs   | Cannot simply restore a .bak to new forest and declare site moved |
| APP01              | Rebuild/migrate VM or app, test login and dependencies; rejoin target domain when approved                                   | Service account, DNS, SQL string, certificates, GPO               |

\[ \] Inventory name/IP/OS/CPU/RAM/disks, AD domain, SQL instance, applications, service accounts, certificates, ports and backup status.

\[ \] Draw arrows: APP01 -\> MECM management service; MECM01 -\> SQL01; MECM SUP -\> WSUS01; every domain-joined server -\> AD DNS/DC.

\[ \] Pick one cutover and rollback point PER service. Never shut down all original services before testing a pilot.

**PASS CHECK** You can describe why SQL user database restore and Configuration Manager site recovery are different tasks.

MOVE-02 / SQL TO AZURE

# .bak migration: the portable practice database

Azure is the new building. We will move ONLY our practice database first, then prove that it still opens. This lab does not migrate the whole MECM site.

\[ \] On local SQL01: SSMS \> right-click AgencyHelpdesk \> Tasks \> Back Up \> Full to C:\SQLBackups\AgencyHelpdesk_Azure.bak. Verify with RESTORE VERIFYONLY.

\[ \] Before cutover: identify every app that writes to it. Since this is a test database with no writes, no downtime is needed; for a real app use a change window, final backup and consistency checks.

\[ \] Azure portal \> Resource groups \> choose lab group \> Create a VNet subnet for application/SQL. Do not overlap your VMware 192.168.77.0/24.

\[ \] Create an Azure Windows Server VM named AZ-SQL01 on a private subnet; access it via an approved secure management path (VPN/Bastion), not an open public RDP rule.

\[ \] Install the SAME or NEWER supported SQL Server version on AZ-SQL01 and SSMS; for a practice user database SQL Developer is an option for nonproduction if its terms allow. MECM site DB needs its own compatible licensed edition.

\[ \] Azure portal \> Storage accounts \> Create a short-lived LAB staging account/container; keep anonymous blob access disabled and restrict network access as appropriate.

\[ \] Upload AgencyHelpdesk_Azure.bak to staging through the portal/storage tools using appropriate auth. Download the blob on AZ-SQL01 using an authenticated transfer; avoid embedding storage keys in scripts.

\[ \] On AZ-SQL01 open SSMS \> Connect \> Databases \> Restore Database \> Device \> ... choose downloaded .bak \> set database name AgencyHelpdesk \> Files \> relocate files if needed \> OK.

\[ \] Run SELECT and compare row count/data with SQL01; create required destination login/permissions for your practice app separately; change app connection string only after test.

\[ \] Retest backups and connectivity after cutover. When finished deallocate AZ-SQL01, then remove unneeded staging files and temporary access grants.

> SELECT name, state_desc FROM sys.databases;  
> SELECT COUNT(\*) AS TicketCount FROM AgencyHelpdesk.dbo.Tickets;

**PASS CHECK** Both local and Azure servers return two fake tickets. Explain why a .bak does not move Windows settings, SQL Agent jobs, logins, or MECM site configuration.

**WATCH OUT** For a real production database, version compatibility, encryption keys (TDE), SQL logins/SIDs, full/diff/log backup chain, RPO/RTO and application cutover require separate planning.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MOVE-03 / MECM SITE TO AZURE

# Different mission: preserving or replacing MECM

A Configuration Manager site is not a normal customer database. Its database belongs to the site and is tied to names, roles, certificates and clients.

PATH A - SAME SITE / SAME DOMAIN: ask the team whether they are relocating an existing Configuration Manager site, site database or remote role. For example, SQL location changes can use Configuration Manager Setup site-maintenance options. Site server recovery has hostname/FQDN and version requirements. Do NOT guess.

\[ \] MECM console \> Administration \> Site Configuration \> Sites. Record site code LAB and version; list site system roles, client count, packages and distribution points.

\[ \] MECM console \> Administration \> Site Configuration \> Servers and Site System Roles. Write down which server hosts MP, DP, SUP, site server and SMS Provider.

\[ \] Enable and complete the supported Backup Site Server maintenance task and archive supporting content. Test recovery planning; a casual SQL .bak alone is not a site migration plan.

\[ \] For moving only SQL to Azure in the SAME supported forest/site scenario, review Microsoft ConfigMgr SQL database location change/setup maintenance guidance and validate latency, permissions, DB compatibility, certificates, firewall and DNS BEFORE change.

PATH B - NEW DESTINATION FOREST / NEW MECM HIERARCHY: this most closely resembles migrating an acquired agency into a DISA-managed identity environment.

\[ \] Create a NEW target-domain MECM primary site and target SQL instance, with its own site code. Make sure the required domain/trust and network connectivity is approved.

\[ \] In the new MECM console \> Administration \> Migration \> Source Hierarchy, configure supported old hierarchy connection and credentials; gather data from source site.

\[ \] Use migration jobs for supported collections and objects. Recreate or configure destination roles, update clients/site assignment, test packages and software updates. Not all settings move automatically.

\[ \] Do NOT attempt to join the existing MECM01 to an unrelated destination forest and assume CM_LAB, service identities and management roles will keep working.

**PASS CHECK** You can explain SAME hierarchy maintenance vs NEW hierarchy migration to the interviewer, and identify why either requires a pilot and rollback.

**WATCH OUT** Lab can fully exercise Path B only with a SECOND MECM site + SECOND SQL instance + supported connectivity/credentials, which is expensive. First practice planning the exact clicks; execute when your workstation/tenant budget allows.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MOVE-04 / DOMAIN CHANGE

# What changes when an organization enters a new domain?

An existing domain controller cannot simply be joined to the destination domain. You migrate identities and computers using a plan, while apps often need to be reconfigured for new accounts.

\[ \] Write down current domain = agency.test and destination = destination.test (or approved mock Azure domain). Keep both AD systems available during transition.

\[ \] Create new users/groups/OUs and permitted GPOs in destination forest. Use Group Policy Migration Table if account/group references differ.

\[ \] Check which MECM01 services, SQL permissions and clients refer to AGENCY users/groups; those need mapping to destination identities.

\[ \] Move only APP01 first: backup app, validate destination DNS/credentials, change domain in System Properties, reboot, apply new GPO, verify application.

\[ \] After APP01 is healthy, run approved MECM client migration/reassignment workflow on it. Never re-home your only DC first.

**PASS CHECK** You can explain: DCs manage identity; member servers join domains; data/services and permissions need separate checks.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

AZ-01 / SPEND LESS

# Azure cost worksheet: one cloud VM at a time

You can learn the on-prem build at home. Cloud VMs consume money per powered-on hour, plus some resources keep charging after shutdown.

\[ \] Before deploying: Azure portal \> Subscriptions \> select your subscription \> Cost Management \> Budgets. Set a monthly budget and email alerts; alerts do NOT auto-stop spending.

\[ \] Estimate actual VM size/region/disk/storage/SQL licensing with Azure Pricing Calculator BEFORE creating resources.

\[ \] Azure portal \> Virtual Machines \> AZ-SQL01 \> Auto-shutdown \> On and select your end-of-lab time. Confirm timezone/email notification.

\[ \] Use a single AZ-SQL01 at first. Defer Azure AD DCs, WSUS and MECM until your local simulation is complete and you can pay for combined uptime.

\[ \] Do NOT leave VPN Gateway, Azure Bastion, public IP resources, storage snapshots, backup vaults or managed disks running without checking cost; some charge even while VMs are off.

\[ \] When done: Azure portal \> Virtual Machines \> select VM \> Stop and wait for status Stopped (deallocated). Shutting down inside Windows may NOT deallocate VM billing.

\[ \] Delete unneeded temporary VMs/disks/IPs after copying your sample backups off. Use resource group cleanup only after checking it contains nothing you need.

\[ \] Record starting balance/cost, ending balance/cost, and whether all resource group items have been removed.

**PASS CHECK** Your Azure VM is Stopped (deallocated) or deleted, and you have checked storage, public IP and network service charges separately.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

AZ-02 / AZURE IS NOT WORKSTATION

# Choose a migration tool that supports your source

The VMware Workstation lab is not automatically a supported VMware vSphere appliance environment. For work, tools depend on the real source hypervisor.

\[ \] Ask: is the customer using vCenter/ESXi, Hyper-V, physical servers, or another cloud? Write down hypervisor versions and credentials.

\[ \] In a real vSphere environment, Azure Migrate can discover and assess VMs with its appliance; agentless replication requires supported vCenter/ESXi prerequisites.

\[ \] In VMware Workstation Pro home lab, DO NOT assume the same vCenter-driven Azure Migrate workflow works. Learn with portable SQL .bak, build destination Azure VM, then compare with documented agent-based/physical server migration options.

\[ \] For SQL user DB choose database-aware backup/restore rather than entire VM replication if the training objective is maintaining DB settings/consistency.

\[ \] For a domain controller, build new additional DC in the same domain/forest and replicate, or use an identity migration strategy if moving to a NEW forest. Do not clone domain controllers casually.

\[ \] For MECM, confirm SQL and site/hierarchy support and configuration before any VM replication. Plan a supported service-aware migration.

**PASS CHECK** Given each source (Workstation, vSphere, physical), you choose a method with a stated support assumption.

AZ-03 / FULL WAVE CAPSTONE

# The pretend enterprise cutover plan

Now you can talk like a cloud engineer coming into a migration halfway through. Your job is to understand the environment BEFORE you change it.

| **Order** | **Action**                   | **You must be able to show**                                                      |
|-----------|------------------------------|-----------------------------------------------------------------------------------|
| 1         | Discover inventory           | DCs, SQL, WSUS, MECM, APP01, service accounts, dependencies                       |
| 2         | Build destination foundation | Azure subscription/tenant, VNet, NSG, DNS, identity, private admin access, budget |
| 3         | Migrate identity safely      | Decide same forest extension vs new forest; pilot GPO and sign-in                 |
| 4         | Migrate SQL user DB          | Full .bak, verify, copy, restore, queries, permissions, app test                  |
| 5         | Migrate app + patch roles    | App connection strings, WSUS/SUP redesign, approved MECM hierarchy migration      |
| 6         | Cut over in waves            | Approval, final backup, switch app/config/DNS, monitor, rollback ready            |
| 7         | Prove + shut down            | Screenshots, log evidence, backups, closure and Azure deallocation                |

\[ \] Fill in the project handoff card: current phase / completed tasks / blockers / what still runs on-prem / identity plan / data plan / next milestone.

\[ \] Perform a staged rehearsal on the fake AgencyHelpdesk user database. If it fails, restore local service and document why.

\[ \] Explain data vs server: Azure Migrate can move a VM in a supported environment; .bak moves a database; AD replication shares a forest; ConfigMgr migration jobs move supported site data.

**PASS CHECK** You can say confidently what is moving, what must be rebuilt, and how you know the change worked.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

HA-01 / OPTIONAL SQL HIGH AVAILABILITY

# Two SQL servers + one cloud witness: the idea

IMAGINE THREE REFEREES. SQL01 and SQL02 are two students voting about whether the cluster can run. The Azure cloud witness is the referee with the third vote. It does NOT run SQL, hold your database, or replace a backup.

| **PART**            | **WHAT IT DOES**                                                  | **IS IT A SQL SERVER?** |
|---------------------|-------------------------------------------------------------------|-------------------------|
| SQL01               | SQL database replica - primary during normal operation            | Yes                     |
| SQL02               | SQL database replica - secondary; may take over                   | Yes                     |
| Azure cloud witness | Small Azure Blob object that helps cluster quorum voting          | No                      |
| SQL listener        | Stable name that clients use to reach the active database replica | No                      |

\[ \] Say aloud: SQL01 + SQL02 + Cloud Witness = three possible quorum votes; majority generally allows the cluster to remain online. Dynamic quorum/witness can adjust votes.

\[ \] Explain: WSFC quorum controls whether the cluster is allowed to run. SQL Always On Availability Groups (AG) synchronize the user databases and manage which replica is primary.

\[ \] Remember: the witness does not automatically make SQL02 ready. AG replicas must be healthy/synchronized and configured for automatic failover, and app clients must connect through a correctly configured listener.

\[ \] Our MECM01 application still needs its own HA design. For the MECM SITE DATABASE, confirm ConfigMgr compatibility and SQL Enterprise licensing/requirements before using an AG.

ONE-LINE MAP: MECM01 -\> SQL AG LISTENER -\> SQL01 (primary) \<-\> SQL02 (secondary). Both SQL VMs also talk to one Cloud Witness stored in Azure Storage.

WHY THIS MATTERS In a real migration, a two-node cluster can be a cost-conscious design. A three-node cluster is NOT required simply to get a third quorum vote.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

HA-02 / PLAN + PREPARE

# Before you click Create: prepare two SQL nodes

This optional chapter starts AFTER you understand your one-server SQL backup/restore exercise. It is a separate, more advanced test. Building the witness alone is cheaper than running two SQL VMs, so prepare the design locally first.

\[ \] Confirm SQL01 and SQL02 are separate Windows Server VMs, joined to the SAME destination AD domain, with reliable DNS and correct time synchronization.

\[ \] If deploying in Azure, plan two private SQL VMs. Use separate availability zones where supported; Microsoft recommends separate subnets for a multi-subnet SQL AG to avoid a load balancer for the listener.

\[ \] Give each VM its own SQL instance and data storage. AG replicates databases; it is not a shared data disk. Check edition/version support (MECM site DB AG requires a supported SQL Enterprise edition).

\[ \] Ensure both VMs can reach the domain controllers and each other over approved ports. No public RDP, SMB, SQL port 1433 or cluster ports. Use private access/Bastion and least-privilege rules.

\[ \] On BOTH Windows SQL VMs: Server Manager \> Manage \> Add Roles and Features \> Features \> Failover Clustering \> Add Features \> Install.

\[ \] PowerShell alternative on both: run the command below in Windows PowerShell as Administrator.

Install-WindowsFeature Failover-Clustering -IncludeManagementTools

\[ \] Run a cluster validation in Server Manager \> Tools \> Failover Cluster Manager \> Validate Configuration; supply SQL01 and SQL02. Review all failed tests, not just the pass count.

Test-Cluster -Node SQL01,SQL02 -Include "Inventory","Network","System Configuration"

\[ \] With the cluster prerequisites and chosen Azure address plan verified, use Failover Cluster Manager \> Create Cluster. Add SQL01 and SQL02 and name the cluster; follow the Azure SQL AG tutorial for valid multi-subnet cluster name/IP settings. Do NOT blindly copy on-prem cluster virtual IP instructions.

\[ \] Check that Failover Cluster Manager shows BOTH nodes Online. Stop if you see cluster validation errors, AD/DNS name conflicts, or an unsupported network layout.

Get-ClusterNode \| Format-Table Name,State,NodeWeight,DynamicWeight

NOTE A Windows cluster is a prerequisite; a cloud witness is attached to an EXISTING WSFC. The witness does not create SQL Always On, and joining a cluster alone does not replicate a database.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

HA-03 / AZURE PORTAL

# Create the witness storage account (no third VM)

Think of the storage account as a tiny locked ballot box in Azure. The cluster stores a small blob there so it can safely break ties. The name below is an EXAMPLE, not a guaranteed available storage account name.

\[ \] Open https://portal.azure.com \> check that you are in the intended tenant and subscription \> search for Storage accounts \> select + Create.

\[ \] Basics: choose your LAB resource group and preferred Azure region. Enter a globally unique lowercase account name, for example labwitness12345 (your actual name will differ).

\[ \] Choose Standard performance and General-purpose v2 / StorageV2. For replication choose LRS for a same-zone lab; consider ZRS for a cluster spread across availability zones, when available and appropriate to your design.

\[ \] Review Advanced / Configuration: Require secure transfer = enabled, minimum TLS 1.2 or higher, and Allow storage account key access = enabled IF permitted by your organization, because this witness workflow needs account keys. If policy blocks shared keys, STOP and request an approved alternative or exemption; do not weaken a production policy.

\[ \] Review Networking: BOTH SQL VMs must be able to reach the Blob service on outbound HTTPS TCP 443. Follow your environment’s approved public/private storage connectivity design; never expose the SQL servers publicly. Check network rules before disabling public access.

\[ \] Select Review + create \> Create. Wait for deployment success; open the new Storage account \> Security + networking \> Access keys \> Show keys.

\[ \] Copy the storage account NAME and one key into your temporary secure password manager for setup; do NOT paste it into a ticket, workbook, email, screenshot, script or Git repo.

\[ \] Do not manually make a witness container. Windows Failover Clustering creates an msft-cloud-witness container/blob automatically after successful setup.

TEST NETWORK PATH FROM BOTH SQL VMs (commercial Azure example):

Test-NetConnection \<accountname\>.blob.core.windows.net -Port 443  
netsh winhttp show proxy

AZURE GOVERNMENT Storage endpoints differ (typically .core.usgovcloudapi.net). For the real DoD environment, verify the sovereign-cloud endpoint and approved network path before configuring a witness.

WHY THIS MATTERS The account persists after VM deallocation. The witness is inexpensive, but it is not free, and storage/network resources can continue accruing charges.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

HA-04 / CLUSTER MANAGER

# Tell Windows: use my Azure cloud witness

Now that you already have SQL01 + SQL02 in a healthy Windows Failover Cluster AND the storage account exists, connect the witness. This step takes place on ONE cluster node, not inside SSMS.

\[ \] Remote into SQL01 using your private management path. Open Server Manager \> Tools \> Failover Cluster Manager.

\[ \] On the left, select the cluster you built (for example SQLCLUS01). On the right: Actions \> More Actions \> Configure Cluster Quorum Settings.

\[ \] Click Next. Under Select Quorum Configuration Option, choose Select the quorum witness \> Next.

\[ \] Under Select Quorum Witness, choose Configure a cloud witness \> Next.

\[ \] Enter your Azure Storage account name and paste the key into the wizard. For a normal commercial Azure account leave the default endpoint; for Azure Government follow its supported endpoint guidance.

\[ \] Click Next \> review the confirmation \> Next \> Finish. Look under the cluster core resources for a Cloud Witness resource. It should report Online.

\[ \] Run PowerShell as Administrator on SQL01 to confirm. These commands READ status; they do not change the cluster.

Import-Module FailoverClusters  
Get-ClusterQuorum \| Format-List \*  
Get-ClusterNode \| Format-Table Name,State,NodeWeight,DynamicWeight  
Get-ClusterResource \| Where-Object Name -Like "\*Witness\*" \| Format-Table Name,State,ResourceType

\[ \] For your first lab, use the GUI. For reference, the matching PowerShell cmdlet is Set-ClusterQuorum, but it requires the secret account key as a string, so do NOT enter it into command history or scripts.

Set-ClusterQuorum -CloudWitness -AccountName \<StorageAccountName\> -AccessKey \<StorageAccountAccessKey\>

\[ \] If you need to rotate storage keys later, update the cluster witness to the other valid key BEFORE regenerating the original one; follow Microsoft key-rotation instructions.

PASS CHECK Get-ClusterQuorum reports a cloud witness; Failover Cluster Manager shows the witness Online. BOTH SQL01 and SQL02 still show as cluster nodes.

IF IT FAILS Check TCP 443, Blob DNS, WinHTTP proxy, correct account name/key, storage key access policy, TLS, and the correct commercial/Gov endpoint. Never deactivate company-wide security policies to make a lab command work.

WRITE IT DOWN Witness resource name / status: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

HA-05 / VERIFICATION + ROLLBACK

# Prove quorum safely, then protect your wallet

You have configured CLUSTER QUORUM. That does NOT mean your SQL database is replicated yet. To get true database failover, you must separately configure Always On AG, database FULL recovery, synchronization, listener/DNS, permissions and client retry behavior.

\[ \] Before testing: verify both nodes Online, witness Online, backups valid, SQL AG replicas healthy, listener working, and a lab application can connect to the intended primary.

\[ \] With change approval in a DISPOSABLE LAB, perform a planned AG failover using SSMS or the approved AG workflow. Do not just unplug the primary first. Watch for temporary client disconnect/reconnect.

\[ \] Re-run a read/write query against your test database by connecting via AG listener, NOT by hard-coding the SQL01 node name. Verify the primary changed and data stayed consistent.

\[ \] For quorum experiments, record what happens when the witness loses access versus when one node is unavailable. Only simulate a disruptive outage when you have a tested recovery plan.

\[ \] If the witness is Offline unexpectedly, do NOT reset SQL IPs or delete the database. Confirm TCP 443 and storage access; review Failover Clustering events before making changes.

Get-ClusterQuorum  
Get-ClusterNode \| Format-Table Name,State  
Get-ClusterLog -UseLocalTime -Destination C:\ClusterLogs

\[ \] ROLLBACK (lab only): if planned failover does not work, return the AG primary to the last verified healthy node using supported procedures, correct the fault, and rerun validation. Do not casually roll back AD domain controllers or SQL nodes from independent VM snapshots.

\[ \] COST: to stop Azure VM compute billing, stop/deallocate SQL01 and SQL02 from the Azure portal, and verify their states are Stopped (deallocated). This intentionally means your lab cluster is OFF and has no HA until restarted.

\[ \] Check remaining costs for managed disks, storage account, any gateways, load balancers, public IPs, monitoring and backups. Azure budgets/alerts do NOT automatically shut resources down.

\[ \] Before deleting the witness Storage account, confirm no running or preserved cluster still uses it. Delete test resources only when their dependencies and recovery files are documented.

| **QUESTION**                        | **QUICK ANSWER**                                                                                                   |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Can 2 SQL nodes work?               | Yes, with a witness for resilient cluster quorum.                                                                  |
| Does witness replicate my database? | No. SQL Always On Availability Groups do that.                                                                     |
| Do I need 3 SQL VMs?                | No. A cloud witness is an Azure Storage resource, not SQL03.                                                       |
| If one node fails?                  | Remaining node and witness can retain quorum; SQL failover still requires a healthy synchronized AG configuration. |
| If both SQL VMs are deallocated?    | The lab is stopped; there is no working SQL service.                                                               |

INTERVIEW ANSWER “For two SQL Server Azure VMs, I would validate and configure WSFC, use a standard Azure Storage cloud witness for quorum, and separately configure a supported SQL Always On Availability Group and listener. Then I would test planned failover, app connectivity, backups and monitoring.”

SEE OFFICIAL REFERENCES PAGE for current Microsoft WSFC, SQL AG, and MECM support guidance.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

FIELD-01 / QUESTIONS ON DAY ONE

# Joining a migration mid-project: ten questions to ask

No engineer should start changing resources until they know what is done, what is blocked, and where the source of truth lives.

\[ \] Which agency is moving, which Azure tenant/subscription/cloud is the approved target, and what is the target boundary?

\[ \] What is the migration wave plan and current phase? Can I review discovery/assessment reports?

\[ \] What is the source hypervisor (vSphere/Hyper-V/physical), Windows/SQL/ConfigMgr version, server inventory and owner?

\[ \] Are we extending their AD forest or joining a completely NEW enterprise domain? Who owns identity and DNS?

\[ \] Which app maps to which SQL database, logins and service accounts? Are there external dependencies?

\[ \] Where are runbooks, change tickets, diagrams, GPO exports, maintenance windows and rollback plans?

\[ \] What tools are approved for migration, backup, monitoring, and infrastructure as code?

\[ \] Has each Azure VNet/subnet, NSG, route table, private DNS, logging and least-privilege role been approved?

\[ \] How are CM clients, SUP/WSUS, distribution points, content and site databases handled; same site or new hierarchy?

\[ \] Who signs off on application acceptance, STIG/NIST compliance, evidence and decommissioning?

INTERVIEW EXAMPLE: "I would ask for the dependency map and the wave plan first. I would validate identity, DNS and private connectivity, then pilot a noncritical workload. For SQL, I would verify a .bak restore plus server-level settings. For Configuration Manager, I would verify whether the site is being recovered/moved or migrated into a new hierarchy. I would not cut over without app testing, backups, approvals and rollback."

**PASS CHECK** You can give a 60-second summary of the above in your own words.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

NEW / OFFICIAL REFERENCES / LOOK IT UP BEFORE YOU CLICK

# Microsoft documentation used for the expanded lessons

Links below are for technical verification. Product screens and version prerequisites may change; always use current documentation and validate changes in a disposable lab.

Configuration Manager - Setup Wizard - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/deploy/install/use-the-setup-wizard-to-install-sites

Configuration Manager - New primary site - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/deploy/install/setup-wizard-central-primary

Configuration Manager - Site database requirements - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/hierarchy/plan-for-the-site-database

Configuration Manager - SQL versions (2025 support from version 2603) - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/configs/support-for-sql-server-versions

Configuration Manager - SQL required collation - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/configs/supported-configurations-for-sql-server

Configuration Manager - Setup accounts - https://learn.microsoft.com/en-us/mem/configmgr/core/plan-design/hierarchy/accounts

Configuration Manager - ADK support matrix - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/configs/support-for-windows-adk

Configuration Manager - Software update point - https://learn.microsoft.com/en-us/mem/configmgr/sum/get-started/install-a-software-update-point

Configuration Manager - Back up the site - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/manage/backup-and-recovery

Configuration Manager - Site recovery caveats - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/manage/recover-sites

Configuration Manager - Hierarchy migration - https://learn.microsoft.com/en-us/intune/configmgr/core/migration/migrate-data-between-hierarchies

SQL Server to Azure VM migration guide - https://learn.microsoft.com/en-us/data-migration/sql-server/virtual-machines/guide

Azure Migrate vSphere support - https://learn.microsoft.com/en-us/azure/migrate/migrate-support-matrix-vmware-migration

Windows Failover Clustering - Deploy a quorum witness - https://learn.microsoft.com/en-us/windows-server/failover-clustering/deploy-quorum-witness

SQL Server Azure VMs - Multi-subnet AG tutorial - https://learn.microsoft.com/en-us/azure/azure-sql/virtual-machines/windows/availability-group-manually-configure-tutorial-multi-subnet

Configuration Manager - Availability Group site database - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/deploy/configure/configure-aoag

LAB END - Remember: fake users and data only; no public RDP, SQL, LDAP or MECM management ports; review Azure charges every session.

LAB 14 / CLOUD PORTAL

# Azure: create a safe destination plan

Now map the same ideas into the Azure subscription you already own. Do not treat Azure Public DNS as your AD server.

**\[ \]** Open https://portal.azure.com. Confirm the correct directory and subscription at the top of the portal.

**\[ \]** Search for Cost Management + Billing or open Subscriptions \> choose your subscription \> Cost Management \> Budgets.

**\[ \]** Create a monthly budget aligned to your own limit, and configure email alerts (for example 50%, 80%, 100%). IMPORTANT: alerts do not shut down resources.

**\[ \]** Search for Resource groups \> Create. Use a name such as rg-ad-migration-lab, choose an available region, and create.

**\[ \]** Search for Virtual networks \> Create. Resource group: rg-ad-migration-lab. Name: vnet-ad-migration-lab.

**\[ \]** Use address space 10.90.0.0/16 and one subnet named snet-identity, 10.90.1.0/24. Confirm the address range does not overlap your on-premises/home/VPN networks.

**\[ \]** Save and review the VNet. Write down which location and subnet you selected.

**\[ \]** Search for Azure DNS zones. Observe your existing cloudscene.tech public DNS zone, but DO NOT add public DC service records or publish private AD server IPs there.

**PASS CHECK** Budget alert exists; resource group and VNet exist; no domain controller has a public-facing DNS record.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>The Azure tenant holds subscriptions/resources. An AD DS forest is a DIFFERENT identity system hosted on Windows Server. A public DNS zone is for names that the internet can query, not for making a private AD DS domain.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If your subscription does not allow the chosen region or VM family, select another permitted region/SKU or stop and inspect policy/quota restrictions. Do not remove guardrails just to force a lab deployment.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Subscription / region / monthly budget** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 15 / CLOUD VM + AD DS

# Azure: create AZ-DC01 carefully

This is your optional cloud destination forest: ad.cloudscene.tech. It is not the same forest as local destination.test.

**\[ \]** Azure portal \> Virtual machines \> Create \> Azure virtual machine. Select rg-ad-migration-lab, an allowed region, and name AZ-DC01.

**\[ \]** Image: supported Windows Server Datacenter marketplace image, with Desktop Experience if available. Select the smallest practical supported VM size you can afford after reviewing pricing.

**\[ \]** Choose a system disk that fits the operating system and budget. Select vnet-ad-migration-lab and snet-identity.

**\[ \]** Set Public inbound ports = None. Do not assign a public IP unless you have a specifically approved secure access design.

**\[ \]** Create the VM. Use your approved private administration method (for example, an already-established private VPN) to connect; a public RDP rule is NOT a shortcut for this exercise.

**\[ \]** Azure portal \> Virtual machines \> AZ-DC01 \> Networking \> Network interface \> IP configurations. Make the private address static within snet-identity using a permitted unused IP; for example 10.90.1.10.

**\[ \]** Inside the Azure Windows VM, leave IP addressing and DNS adapter settings automatic. Azure manages NIC settings. After promotion, configure the Azure VNet custom DNS server to use this DC’s Azure private IP (next step).

**\[ \]** Install AD DS with Server Manager \> Add Roles and Features and promote as Add a new forest \> ad.cloudscene.tech. Enable DNS and reboot.

**\[ \]** Azure portal \> Virtual networks \> vnet-ad-migration-lab \> DNS servers \> Custom. Add AZ-DC01 private IP and Save. Existing VMs may need DHCP lease refresh or reboot to use new DNS settings.

**\[ \]** From a VM inside the connected VNet, resolve AD SRV records and confirm AZ-DC01 responds. Keep all AD DNS zones private.

> Get-ADDomain \| Select-Object DNSRoot  
> ipconfig /all  
> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.ad.cloudscene.tech 10.90.1.10

**PASS CHECK** New cloud AD domain exists, resolves PRIVATELY, and its VM has no direct public RDP/AD exposure.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>You did not “point cloudscene.tech at a server” and magically get AD. You built a Windows Server, configured private networking, installed AD DS, and created a new forest that happens to use a subdomain of the name you own.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If connecting to AZ-DC01 requires a paid secure-access service you have not budgeted for, STOP. Finish the local domain migration path first; the Azure VM is not a prerequisite for it.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**AZ-DC01 private IP / image / machine size** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 16 / VPN / DNS / SECURITY

# Azure: the networking gate comes FIRST

To actually move an on-premises server into an Azure-hosted domain, the two networks must communicate privately.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>THIS IS NOT JUST ONE PORTAL SWITCH</strong></p>
<p>A typical site-to-site connection requires an Azure VPN gateway, an on-premises compatible VPN endpoint with appropriate public reachability, routing, and nonoverlapping subnets. VMware NAT by itself is not an on-prem VPN appliance. A home ISP using carrier-grade NAT may complicate site-to-site connectivity. Azure VPN Gateway can cost money even when idle.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**\[ \]** Write down your SOURCE subnet (192.168.77.0/24), DESTINATION VNet subnet (10.90.1.0/24), and expected routing through the VPN device.

**\[ \]** Check whether you actually have a compatible on-premises VPN endpoint/router, control of firewall/NAT, and permission to use it.

**\[ \]** Review Microsoft’s Site-to-site VPN Gateway docs, gateway sizing, and current pricing BEFORE creating a VPN gateway.

**\[ \]** If your network setup supports it, in Azure create a GatewaySubnet, Virtual network gateway, Local network gateway (your real VPN public endpoint and internal prefixes), then the IPsec/IKE connection. Configure the peer VPN device using matching values.

**\[ \]** Verify routes both ways, permitted AD ports inside the tunnel, and DNS conditional forwarding from agency.test to ad.cloudscene.tech and vice versa as required.

**\[ \]** Run nslookup for the AD SRV record across the private path and Test-NetConnection to approved destination ports. Do not publish AD ports in an Azure NSG to the internet.

**\[ \]** Do not attempt an actual cross-cloud domain join until the private connectivity and DNS tests both pass.

> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.ad.cloudscene.tech \<AGENCY-DNS-IP\>  
> Test-NetConnection \<AZ-DC01-PRIVATE-IP\> -Port 53

**PASS CHECK** VPN path and DNS tests pass OR you explicitly record “Azure cutover deferred, local course complete.”

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>A VNet is only a private network inside Azure. Your home Workstation VMs do not automatically become part of that VNet. DNS is necessary but cannot replace routing and a secure network path.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>If a DNS response shows the wrong IP, inspect the DNS server the client uses, conditional forwarders, and connectivity. Ping alone is not enough to verify DNS or Active Directory readiness.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**VPN approach / projected monthly gateway cost** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 17 / OPTIONAL CAPSTONE

# Azure: run a real migration wave

Only after the networking gate passes: do one member server at a time. Do not try to migrate the old agency domain controllers.

**\[ \]** Take a backup/snapshot of source APP01 and export a simple application inventory: hostname, IP, disk sizes, IIS page, service accounts, URL, DNS, and current domain.

**\[ \]** Decide whether this workload requires VM rehosting (actual disk/OS move) or whether you can redeploy a clean Azure VM and copy application data/configuration.

**\[ \]** For VMware Workstation Pro, do NOT assume Azure Migrate vCenter agentless discovery works: that workflow expects vCenter-managed vSphere VMs.

**\[ \]** Read the current Microsoft documentation for agent-based/physical-server-style migration and confirm whether your exact Workstation-based source and Windows edition are supported before selecting it.

**\[ \]** For a low-cost alternate hands-on: create a clean Azure APP02 VM with no public inbound ports, install IIS, securely transfer your simple test site through the VPN, and join APP02 to ad.cloudscene.tech.

**\[ \]** Validate APP02 DNS/domain membership, local test page, required authentication, GPO application, patching, and monitoring. Only then think about switching real clients to APP02.

**\[ \]** Record when you would change DNS/service endpoints for actual users, how you would freeze writes, how you would validate, and when you would invoke rollback.

**\[ \]** Delete the Azure resource group when the exercise is complete and you no longer need its resources. Confirm billing/cost analysis afterward.

**PASS CHECK** You can clearly explain the difference among VM rehosting, application rebuild, and AD domain migration.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS MATTERS</strong></p>
<p>Migrating an operating system disk is different from joining a domain. Rebuilding a simple IIS app in Azure may be a better introductory exercise than replicating a whole VMware Workstation VM.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IF IT DOES NOT WORK</strong></p>
<p>Never assume Azure Migrate is free end-to-end or that Workstation equals vSphere. Validate the support matrix and costs for your chosen migration mechanism.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Selected migration method / reason** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 18 / PROVE THE LEARNING

# Interview drill and checklist

Practice saying the process out loud. The goal is to describe a safe sequence, not merely remember tool names.

## Say this in an interview

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>30-SECOND ANSWER</strong></p>
<p>I would inventory the on-premises servers and dependencies, establish the approved Azure landing zone and private connectivity, confirm destination identity and DNS, and pilot a low-risk application. For an agency moving into a different enterprise AD forest, I would coordinate the identity and GPO migration, rejoin or replace member servers in waves, validate authentication and application behavior, and keep a rollback plan until acceptance.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

\[ \] I can explain why cloudscene.tech public DNS does not create an AD forest.

\[ \] I can distinguish extra domain controllers from a second forest.

\[ \] I can join APP01 to agency.test, then to destination.test.

\[ \] I can show a GPO backup/import and identify what did NOT transfer.

\[ \] I can explain why DNS must point to the correct domain DNS server.

\[ \] I can explain why the home Workstation VMs cannot just “talk to Azure.”

\[ \] I can describe an Azure test migration and cutover with rollback.

## Three quick practice questions

1\. Your source has two DCs and ten app servers. Do you migrate the DCs directly into a different forest? Why?

**Your answer** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

2\. The new server can resolve a public DNS name but cannot find the destination DC. What do you check first?

**Your answer** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

3\. Your GPO imported but APP01 does not show it in gpresult. What could be missing?

**Your answer** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 19 / CHEAT SHEET

# Troubleshooting decision tree

When you get stuck, follow this order. The order matters more than memorizing all the commands.

| **Symptom**                      | **First check**                                      | **Useful command**                                          |
|----------------------------------|------------------------------------------------------|-------------------------------------------------------------|
| Cannot join agency.test          | Client DNS points to agency DC; private reachability | ipconfig /all ; nslookup agency.test                        |
| Cannot join destination.test     | Client DNS points to destination DC; DNS SRV lookup  | nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.destination.test |
| Second DC not replicating        | AD replication / time / DNS                          | repadmin /replsummary ; dcdiag                              |
| GPO exists but not applied       | Correct OU link, computer object, filtering          | gpresult /r /scope computer                                 |
| Website disappeared after rejoin | IIS service, local app files, permissions            | Get-Service W3SVC ; curl.exe http://localhost               |
| Azure domain not reachable       | Private route/VPN, NSG, DNS path                     | Test-NetConnection \<IP\> -Port 53                          |
| Azure costs rising               | VM, VPN gateway, disk, IP, backups                   | Azure Cost Management \> Cost analysis                      |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>GOOD ENGINEER HABIT</strong></p>
<p>Capture the symptom, recent change, expected result, actual result, command output, and rollback decision. Do not randomly change firewalls and IP addresses until the problem disappears.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Troubleshooting notes** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

LAB 20 / FINISH

# Shut down safely + official references

Clean up your cloud resources deliberately; preserve only the lab files you want to study again.

**\[ \]** Export your notes and screenshots; keep passwords OUT of your workbook.

**\[ \]** Power off local training VMs when idle. Keep one known-good snapshot of member APP01 and document when it was taken.

**\[ \]** Azure: confirm whether any VMs, disks, public IPs, VPN gateways, or backups remain billed. Stopping a VM may leave disks and networking resources billable.

**\[ \]** If you are finished, go to Azure portal \> Resource groups \> rg-ad-migration-lab \> Delete resource group. Verify the resource list and type the requested name. This is destructive.

**\[ \]** Return to Cost Management \> Cost analysis to monitor any remaining or delayed charges.

**\[ \]** If a later lab needs Azure, rebuild from your saved worksheet rather than leaving a VPN Gateway running around the clock.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>OFFICIAL READING LIST</strong></p>
<p>Microsoft Evaluation Center: https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2025<br />
Install AD DS: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-<br />
GPO backup/import: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-backup-restore<br />
Firewall for AD: https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/config-firewall-for-ad-domains-and-trusts<br />
Azure VPN S2S: https://learn.microsoft.com/en-us/azure/vpn-gateway/design<br />
Azure Migrate VMware: https://learn.microsoft.com/en-us/azure/migrate/migrate-support-matrix-vmware-migration<br />
Azure budget alerts: https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

NOTES: The portal UI and supported migration tools may change. Follow Microsoft documentation for your actual subscription and OS. For real DoD/DoDNet projects, approved destinations, boundaries, access models, and migration tooling come from program authorities.

**Date completed / what I can now explain** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
