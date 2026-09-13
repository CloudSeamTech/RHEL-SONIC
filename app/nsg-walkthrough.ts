import type { WalkthroughStep } from './wazuh-walkthroughs.ts';

export const nsgWalkthrough: WalkthroughStep[] = [
  {
    title: 'Start on your own Windows computer',
    where: 'Your Windows computer at home · web browser',
    actions: [
      'Use the Windows computer you will use to connect to the lab. Open your browser and go to https://portal.azure.com. Sign in with the Azure account used in the earlier lessons.',
      'You will create the rule by clicking in the Azure website. PowerShell will only help you write down one value. You do not need Azure Cloud Shell, an administrator PowerShell window, or a connection to RHEL for this lesson.',
      'An NSG, short for Network Security Group, is a list of network traffic rules. Inbound means coming into the Azure VM. Outbound means leaving it. Your connection leaves your Windows computer and arrives at the VM, so the VM needs an INBOUND rule.',
      'SSH is the secure connection you will use to type commands on Linux from Windows. Port 22 is the numbered connection point SSH normally uses. This rule lets your home connection reach that point. You still need the correct username and SSH key to sign in.',
    ],
    expected:
      'The Azure website is open on your own Windows computer. You know why this is an inbound rule.',
  },
  {
    title: 'Create the empty list of network rules',
    where: 'Your Windows computer · Azure website',
    actions: [
      'Click the search box at the top of the Azure page. Type Network security groups. Click Network security groups in the results. Click Create.',
      'For Subscription, select the subscription recorded earlier. For Resource group, select rg-rhel9-lab. For Name, type nsg-rhel9-lab. For Region, choose the same region as your lab network.',
      'Click Review + create. Read the names once more. Click Create. Wait for the completion message, then click Go to resource. If that button is missing, search Network security groups again and click nsg-rhel9-lab.',
      'If nsg-rhel9-lab already exists from your earlier work, open it and inspect it instead of creating another one.',
    ],
    expected:
      'The page for nsg-rhel9-lab is open. You have not connected it to a VM yet.',
  },
  {
    title: 'Find the public address of your home connection',
    where: 'Your Windows computer · Azure website · nsg-rhel9-lab',
    actions: [
      'On the left of the NSG page, click Inbound security rules. Click Add. In Source, select My IP address. Read the address Azure fills in. Write down the IPv4 address: four groups of numbers separated by dots. Do not click Add yet.',
      'This public address is what Azure sees when your computer connects over the internet. It is usually the address of your home router’s internet connection. It is not the private address shown by ipconfig, and it is not the Azure VM’s address.',
      'If you are using a VPN or browser proxy, the browser and SSH may use different public addresses. Use the approved network instructions to confirm the address SSH will use. Do not guess or turn off a required workplace VPN.',
      'Add /32 after the address. Here /32 means “this one IPv4 address.” If Azure already included /32, keep it once. Do not use the example address from another lesson.',
    ],
    expected:
      'You have your current public IPv4 followed by /32. The new rule is still unsaved.',
  },
  {
    title: 'Open PowerShell on your Windows computer and save that value',
    where:
      'Your own Windows computer · Windows Terminal → PowerShell · normal user',
    actions: [
      'Click Windows Start. Type Windows Terminal and open it. Click the small down arrow next to the + tab button, then choose Windows PowerShell or PowerShell. If Windows Terminal is not installed, click Start, type Windows PowerShell, and open that app normally.',
      'Look for a prompt beginning with PS and a Windows folder, such as PS C:\\Users\\YourName>. You are on your own computer. Do not type these lines at a Linux prompt, at sftp>, or in Azure Cloud Shell.',
      'Run the first line below and press Enter. PowerShell asks you to type your public IPv4 followed by /32. Type the value you just wrote down and press Enter. Then run the second line.',
      '$AdminSourceCidr is a named box in PowerShell memory. Read-Host asks you for text and puts your answer in that box. The second line displays it so you can check it. These lines do not create a rule or change Azure. If you close this tab, the value is forgotten; your written notes are the lasting record.',
    ],
    command:
      '$AdminSourceCidr = Read-Host "Type your current public IPv4 followed by /32"\n$AdminSourceCidr',
    expected:
      'PowerShell prints the exact address you entered, ending in /32. Check it against Azure before continuing.',
  },
  {
    title: 'Fill in who can connect',
    where:
      'Your Windows computer · return to the Azure Add inbound security rule form',
    actions: [
      'Set Source to IP Addresses. In Source IP addresses/CIDR ranges, enter the public IPv4/32 you just checked. “Source” means where the connection starts. CIDR is Azure’s name for the address format with /32.',
      'Set Source port ranges to *. Windows chooses a temporary outgoing port for each connection, so leave this field as *. This does not allow every source IP address; the address field above still restricts who can connect.',
      'Set Destination to Any. This means the destination covered by this NSG when you attach it to the intended VM network card later. Keep this NSG for that lab VM. Set Service to Custom.',
    ],
    expected:
      'The source address is your current public IPv4/32. Source port is *. Destination is Any. Service is Custom.',
  },
  {
    title: 'Fill in what connection is allowed and save',
    where: 'Your Windows computer · same Azure rule form',
    actions: [
      'In Destination port ranges, type 22. Set Protocol to TCP. TCP is the type of network connection SSH uses. Set Action to Allow.',
      'Set Priority to 300. Azure checks lower numbers first. If 300 is already used, inspect the existing rule before choosing an unused number and record your choice. Do not overwrite an unrelated rule.',
      'In Name, type Allow-SSH-rexuser-workstation. Read each field again, then click Add. Wait for the new rule to appear in Inbound security rules.',
      'Do not add an outbound rule in this step. Do not add Wazuh ports yet. Keep the Azure default rules; this lesson adds one rule for SSH from your public address.',
    ],
    expected:
      'The new inbound rule is listed with your source /32, destination port 22, TCP and Allow.',
  },
  {
    title: 'Check your work and write down how to fix it later',
    where: 'Your Windows computer · Azure website and your lab notes',
    actions: [
      'Click the rule you created and compare its fields with the previous steps. Check that no other custom rule allows SSH from Any or 0.0.0.0/0. Those values could allow connections from anywhere on the internet.',
      'Write down the NSG name, rule name, source address, port and priority. The NSG is not attached yet; the VM creation lesson will select it for the VM network card, also called a NIC. Later, repeat these steps for the manager’s separate NSG.',
      'If your home public IP changes later, sign in to Azure, open this NSG → Inbound security rules → this rule. Record the old value, change only the source to your new verified IPv4/32, and click Save. Test SSH again. Do not change the source to Any to make a connection work.',
      'If a later edit breaks access, compare it with your saved notes and restore the last correct specific value. Keep Azure website access available while testing. Do not delete the whole NSG to fix one rule.',
    ],
    expected:
      'Your notes match the saved rule. You understand that a successful rule creation is not yet a successful SSH login.',
  },
];
