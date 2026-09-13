export function SessionGuide({ location }: { location: string }) {
  let help =
    'Use the computer and app named above. Read the steps before typing. If the step changes computers or apps, switch to that place first.';
  if (/reference|commented/i.test(location)) {
    help =
      'These are reading examples. Do not paste them into a terminal. Replace placeholders only when a later step tells you to run the real command.';
  } else if (/sftp.*prompt/i.test(location)) {
    help =
      'Use the SFTP connection you opened from your Windows computer. The prompt must say sftp>. These are file-transfer commands, not Linux or PowerShell commands. Type bye and press Enter when told to leave SFTP.';
  } else if (/Run Command|RunShellScript/i.test(location)) {
    help =
      'On your Windows computer, open the Azure website. Open the VM named in this lesson → Run command → RunShellScript. This box runs commands on that VM; it is not your Windows PowerShell tab.';
  } else if (/Veeam/i.test(location)) {
    help =
      'Use the approved work computer with the Veeam console installed. Open its Veeam PowerShell session as described in the steps. Your home PowerShell tab and the RHEL terminal do not provide these backup commands.';
  } else if (/PowerShell.*→.*RHEL|Bash.*→.*Windows/i.test(location)) {
    help =
      'This lesson switches between Windows and Linux. Start in the app named by the first step. A prompt beginning with PS is PowerShell on Windows; after SSH connects, commands run on the remote RHEL machine. Follow the switch instructions before continuing.';
  } else if (/PowerShell/i.test(location)) {
    help =
      'On your own Windows computer: click Start → type Windows Terminal → open it → click the down arrow beside + → select PowerShell or Windows PowerShell. If Terminal is missing, open Windows PowerShell from Start. Use a normal window unless the step specifically says Run as administrator. Look for PS and a Windows folder path. Do not use Azure Cloud Shell or a RHEL SSH tab.';
  } else if (
    /Bash|SSH session|RHEL/i.test(location) &&
    !/browser|portal|website/i.test(location)
  ) {
    help =
      'Use the SSH connection to the RHEL machine named above. Opening Windows Terminal alone does not connect you to Linux. Complete the earlier SSH login steps first. In the connected tab, run whoami and hostname; compare the account and machine name with this step before continuing.';
  } else if (/portal|browser|website/i.test(location)) {
    help =
      'Use the web browser on your Windows computer. Open the website named in this step, sign in if asked, and follow the clicks. Do not paste button names or click instructions into PowerShell.';
  }
  return (
    <p className="terminal-hint">
      <strong>Before you start: </strong>
      {help}
    </p>
  );
}
