import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const libraries=['root','alma','azure','windows'].map(name=>read(`content/screenshots/${name}-source-library.json`));
const assets=new Map();
for(const library of libraries)for(const asset of library){if(assets.has(asset.id))throw Error('Duplicate source ID: '+asset.id);assets.set(asset.id,asset);}
const rows=read('content/screenshots/coverage.json').steps;
const originalRefs=new Map(rows.filter(x=>x.referenceIds?.length).map(x=>[x.stepId,{assetIds:x.referenceIds}]));
function choose(...ids){const id=ids.find(x=>assets.has(x));if(!id)throw Error('Missing actual interface source: '+ids.join(', '));return id;}
const terminal=()=>choose('az-powershell-ssh');
const ps=()=>choose('win-powershell-tabs','az-terminal-profiles');
const notes=()=>choose('win-notepad');
const files=()=>choose('win-file-explorer');
const gedit=()=>choose('gnome-gedit');
const steam=()=> 'steam-library';
const storage=()=> 'steam-storage';
const alma={
'plan':[[notes()],['alma-desktop-overview'],[files()],['workstation-9'],['alma-settings']],
'install':[[ps()],['workstation-1','workstation-2'],['workstation-9','workstation-8'],['alma9-boot','alma9-language'],['alma9-software','alma9-disk'],['alma9-user','alma9-network'],['alma-desktop-overview','alma-terminal-desktop']],
'first-login':[['alma-settings'],['alma-settings','alma-terminal-desktop'],['alma-terminal-desktop'],['alma-terminal-desktop'],['alma-settings-menu','alma-settings'],['alma-terminal-desktop']],
 'terminal':Array.from({length:6},()=>['alma-terminal-desktop']),
 'files':[['gnome-files-home'],['gnome-files-home'],['alma-terminal-desktop'],['gnome-files-list'],['gnome-files-locations']],
 'apps':[['alma-terminal-desktop'],['alma-terminal-desktop','alma-software'],['alma-terminal-desktop'],['alma-terminal-desktop'],['alma-software','alma-terminal-desktop'],['alma-terminal-desktop']],
 'games':[[steam()],['alma-terminal-desktop'],[steam()],[steam()],['steam-proton'],[storage(),'alma-terminal-desktop']],
 'network':[['alma-settings'],['alma-terminal-desktop'],['alma-settings'],['alma-settings'],['gnome-files-locations']],
 'wd-drive':[['gnome40-disks'],['gnome40-disks','alma-terminal-desktop'],['gnome40-disks'],['gnome-files-home','alma-terminal-desktop'],['gnome40-disks'],['gnome40-disks'],['alma-terminal-desktop'],[storage(),'gnome40-disks']],
 'backup':[['gnome-files-home'],['gnome-files-locations'],['gnome-files-home','alma-terminal-desktop'],[gedit()],['workstation-15']],
 'troubleshoot':[[gedit()],['alma-terminal-desktop'],['alma-terminal-desktop'],['alma-terminal-desktop'],['alma-terminal-desktop'],[gedit()]],
 'real-terminal':[['alma-terminal-desktop',ps()],[ps()],[ps()],[ps()],['alma-terminal-desktop'],[terminal()],[ps()]]
};
const fallback=[];
function forStep(row){
 const id=row.lessonId,t=row.title.toLowerCase(),a=row.actions.toLowerCase(),w=row.where.toLowerCase(),c=row.command,text=t+' '+a;
 if(['lab-04','lab-06','lab-07','lab-08','sql-02'].includes(id) && row.step <= 21) {
  const sets=[['workstation-1'],['workstation-2'],['workstation-4'],['workstation-15'],['workstation-6'],['workstation-14'],['workstation-9','workstation-8'],['workstation-4'],['vmware-network-editor'],['workstation-15'],['win2019-install-1'],['win2019-install-1'],['win2019-install-2'],['win2019-install-3'],['win2019-install-3'],['workstation-15'],['win-update-settings'],[ps()],['win-ipv4-properties'],['win-ipv4-properties',ps()],[ps()]];
  return [sets[row.step-1], row.step<=10 ? 'VMware Workstation VM creation only; follow the written course values' : 'Windows Server installation and preparation only; source screens do not represent your lab results', 'interface-orientation'];
 }
 if(id === 'sql-03') { const sets = [ ['sql-setup-center'], ['sql-setup-center'], ['sql-setup-center'], ['sql-setup-features'], ['sql-setup-instance'], ['sql-setup-service'], ['sql-setup-engine'], [ps()], ['sql-memory'], ['sql-config-tcp'], ['win-firewall-port'] ]; return [sets[row.step-1], 'SQL2022 installation or named SSMS/Configuration Manager/firewall control', 'control-reference']; }
 if(/guest profile/.test(t)) return [['workstation-15'], 'Workstation guest operating system profile orientation', 'interface-orientation'];
 if(/patch the new|windows update/.test(text)) return [[choose('win-update-settings')], 'Windows Update settings for the guest', 'control-reference'];
 if(/ipv4|ncpa\.cpl/.test(text)) return [[choose('win-ipv4-properties')], 'Guest Ethernet IPv4 properties', 'control-reference'];
 if(/nat settings|actual nat gateway|vmnet/.test(text) && !c) return [[choose('vmware-nat-settings','vmware-network-editor')], 'Workstation NAT network editor; gateway values are examples', 'control-reference'];
 if(/check host resources/.test(t)) return [[choose('win-task-manager-performance')], 'Host Task Manager Performance; source utilization is not your host', 'control-reference'];
 if(/create the test user|create and populate the group/.test(t)) return [[choose('win-ad-user-logon')], 'Active Directory Users and Computers user/group workflow', 'interface-orientation'];
 if(/notepad|change ticket|handoff card|cutover decision|can explain|can distinguish|can describe|can join/.test(text) && !c) return [[notes()], 'Notes editor for the written question and answer', 'planning-interface'];
 if(/revert|snapshot|rollback app01/.test(text) && !c) return [['workstation-15'], 'Workstation VM context for recovery; use the supported Snapshot Manager for the written action', 'interface-orientation'];
 if(/nslookup|read\/write query/.test(text) && !c) return [[/ssms|database/.test(text) ? 'sql-new-query' : ps()], 'Named query or command interface for the written verification', 'interface-orientation'];
 if(/upstream update|synchronize every|wsus/.test(text) && !c) return [['mecm-wsus-connect'], 'WSUS update source interface', 'interface-orientation'];
 if(/adsi edit|default naming context/.test(text)) return [[choose('win-adsi-edit')], 'ADSI Edit directory tree; source distinguished names differ', 'control-reference'];
 if(/schema|extadsch/.test(text)) return [[files()], 'File Explorer for locating the supplied Configuration Manager media tool', 'interface-orientation'];
 if(/database information|configmgrsetup|migration jobs|destination roles/.test(text)) return [['mecm-site-connect','mecm-workspaces'], 'Configuration Manager site and administration console context', 'interface-orientation'];
 if(/ssms/.test(text)) return [['sql-connect','sql-new-query'], 'SSMS connection and query controls; use written database values', 'interface-orientation'];
 if(/^ha-/.test(id) && /account name|paste the key|rotate storage keys|witness/.test(text)) return [['cluster-cloud-config','az-storage-access-keys'], 'Cloud witness and Azure Storage access-key controls', 'control-reference'];
 if(/^ha-/.test(id) && /cost/.test(text)) return [['az-cost-analysis'], 'Azure Cost Analysis for remaining charges', 'control-reference'];
 if(/^ha-/.test(id)) return [['sql-connect','cluster-quorum-menu'], 'SSMS and Failover Cluster Manager for the written cluster task', 'interface-orientation'];
 if(id === 'upgrade-01') { const sets = [ ['az-vm-overview'], [ps()], ['az-server2022-keep-files'], ['az-backup-goal','az-vm-overview'], [ps()], [ps()], ['az-data-disk-attach'], [files()], ['az-server2022-keep-files','az-server2022-confirm-install'], ['az-vm-overview'], [ps()], ['az-vm-disk-pane'] ]; return [sets[row.step-1], 'Azure member-server OS upgrade: named portal or guest setup interface', 'interface-orientation']; }
 if(id.startsWith('alma-'))return [alma[id.slice(5)][row.step-1],'AlmaLinux action-specific interface selection','interface-orientation'];
 if(originalRefs.has(row.stepId))return [originalRefs.get(row.stepId).assetIds,'Existing action-specific vendor reference','control-reference'];
 if(id==='field-01'||(!c&&/worksheet|interview|who (?:is|owns|signs)|record.*(?:evidence|result)|capture evidence|write down|write.*notes|risk register|decide|choose.*route|tell.*owner/.test(text)))return [[notes()],'Notes editor for this planning/evidence action','planning-interface'];
 // Choose shells from actual execution context. A browser page is not a Linux shell.
 if(c){
  if(/^(?:\s|--[^\n]*\n)*(?:SELECT|RESTORE|BACKUP|CREATE DATABASE|USE\s|GO\s|EXEC\s)/i.test(c))return [['sql-new-query','sql-query-results'],'SSMS query editor; use written SQL, not source results','interface-orientation'];
  if((/rhel|bash|linux/.test(w)&&!/powershell/.test(w))||(/^sudo |^systemctl |^journalctl |^dnf |^rpm |^whoami\n/.test(c)&&!/windows/.test(w)))return [[terminal()],'Windows OpenSSH client with a Linux command prompt; source host/output differ','interface-orientation'];
  return [[ps()],'PowerShell command entry; use the complete written command block','interface-orientation'];
 }
 if(/open.*(?:new vm|new.*wizard)|choose typical|new virtual machine|name the vm|vmware|workstation|virtual network editor|vmnet|customize hardware|attach.*iso|set memory|cpu|processors|finish and start/.test(text)){
  if(/memory|ram/.test(t))return [['workstation-9','workstation-8'],'Workstation memory and processor controls','control-reference'];
  if(/disk/.test(t))return [['workstation-14'],'Workstation virtual disk capacity','control-reference'];
  if(/name/.test(t))return [['workstation-6'],'Workstation VM naming','control-reference'];
  if(/typical/.test(t))return [['workstation-2'],'Workstation configuration selection; choose written option','control-reference'];
  if(/iso|cd|manual/.test(t))return [['workstation-4'],'Workstation installation-media choices; source OS differs','interface-orientation'];
  return [['workstation-1','workstation-15'],'Workstation VM wizard and hardware summary','interface-orientation'];
 }
 if(/windows setup|desktop experience|clean install|blank disk|local administrator password|sign into the guest|rename windows|rename the guest/.test(text))return [[choose('win2019-install-1','win-server-roles'),choose('win2019-install-2','win-domain-join')],'Windows Server guest installation interface','interface-orientation'];
 if(/join.*domain|domain.*join|sysdm|computer name|workgroup/.test(text))return [['win-domain-join'],'System Properties domain membership','control-reference'];
 if(/conditional forward|dns manager|forward lookup|dns.*console|dns.*forward/.test(text))return [['win-dns-forwarder'],'DNS Manager conditional forwarder interface','control-reference'];
 if(/gpo|group policy|gpmc/.test(text))return [/new|create/.test(t)?['win-gpo-new','win-gpo-name']:['win-gpo-report'],'Group Policy Management console controls','interface-orientation'];
 if(/add.*(?:dc|domain controller)|replica|replication source|existing domain/.test(text))return [['win-dc-replica'],'AD DS additional domain controller wizard','control-reference'];
 if(/promot|new forest|functional level|dsrm|netbios|prerequisite/.test(text))return [['win-dc-promote','ad-forest'],'AD DS promotion/forest controls; source version/domain differs','interface-orientation'];
 if(/add roles|server manager|install.*ad ds|windows.*role|features wizard/.test(text))return [['win-server-roles'],'Server Manager Add Roles and Features','control-reference'];
 if(/sql.*setup|setup.*sql|database engine configuration|collation|sql.*installer|install.*sql server/.test(text))return [[choose('sql-setup-engine','sql-setup-features','sql-setup-center')],'SQL Server installation wizard','interface-orientation'];
 if(/restore|\.bak|backup.*database|back up.*database/.test(text)&&(/^(sql|move)-/.test(id)||text.includes('ssms')))return [[/restore/.test(t)?'sql-restore-dialog':'sql-backup-menu'],'SSMS database backup/restore controls','control-reference'];
 if(/ssms|sql server management|database|sql server/.test(text)&&/^(sql|move)-/.test(id))return [['sql-connect','sql-new-query'],'SSMS database connection/query interface','interface-orientation'];
 if(/cloud witness|quorum|failover cluster|cluster manager|validate.*cluster/.test(text))return [/key|account name|configure cloud/.test(text)?['cluster-cloud-config']:['cluster-quorum-menu','cluster-cloud-select'],'Failover Cluster Manager quorum interface','control-reference'];
 if(/wsus|software update point|sup role/.test(text))return [['mecm-wsus-connect','mecm-sup-properties'],'WSUS and Configuration Manager software-update-point controls','control-reference'];
 if(/mecm|configuration manager|primary site|site code|site server|client push|boundary group/.test(text))return [['mecm-workspaces','mecm-site-connect'],'Configuration Manager console/site navigation','interface-orientation'];
 if(/wazuh/.test(text+' '+w)){
  if(/bash|ssh/.test(w))return [[terminal()],'Linux SSH terminal for Wazuh service/configuration actions','interface-orientation'];
  if(/file integrity|fim|event|alert|file change/.test(text))return [['wazuh-fim-events'],'Wazuh File Integrity Monitoring Events','control-reference'];
  if(/api|connection/.test(text))return [['wazuh-api-connections'],'Wazuh API connection interface','control-reference'];
  if(/log/.test(text))return [['wazuh-server-logs'],'Wazuh server log viewer','control-reference'];
  return [['wazuh-agents','wazuh-agent-summary'],'Wazuh agent listing and status interface','interface-orientation'];
 }
 if(/azure|portal/.test(w)||/portal|subscription|resource group|vnet|subnet|nsg|bastion/.test(text)){
  const choices=[[/budget|cost|spend|price/,'az-budget-create'],[/delet|tear.?down|remove.*resource/,'az-resource-group-delete'],[/auto.?shutdown/,'az-vm-auto-shutdown'],[/stop|deallocat/,'az-vm-overview'],[/storage account|blob|container|witness storage/,'az-storage-create'],[/backup|restore point/,'az-backup-goal'],[/data disk|attach.*disk|upgrade media|managed disk/,'az-data-disk-attach'],[/nsg|security rule|source.*ip|allow.*ssh|inbound/,'az-nsg-add-rule'],[/dns server|custom dns/,'az-vnet-overview'],[/private.*static|ip configuration|network interface|nic/,'az-nic-ip-configurations'],[/subnet/,'az-subnet-create'],[/vnet|virtual network/,'az-vnet-create'],[/resource group/,'az-resource-group-create'],[/migrat|assessment|replicat/,'az-migrate-discovery'],[/vm|virtual machine/,'azure-project']];
  for(const [pattern,asset] of choices)if(pattern.test(text))return [[asset],'Azure Portal interface for '+asset,'interface-orientation'];
  return [['az-vm-overview'],'Azure Portal resource navigation','interface-orientation'];
 }
 if(/file explorer|copy|folder|\.iso|download|screenshot|save.*evidence|backup folder|export|import/.test(text))return [[files()],'File Explorer for file, folder or evidence handling','interface-orientation'];
 if(/powershell|command prompt|windows terminal|ssh|scp|sftp/.test(text+' '+w))return [[ps()],'Windows terminal or OpenSSH client context','interface-orientation'];
 if(/bash|rhel/.test(w))return [[terminal()],'Linux SSH command context','interface-orientation'];
 if(/users|organizational unit|active directory/.test(text))return [[choose('win-ad-users','win-server-roles')],'Windows directory-administration interface','interface-orientation'];
 fallback.push({stepId:row.stepId,title:row.title,actions:row.actions,where:row.where});return [[notes()],'Notes editor for the written decision or observation','planning-interface'];
}
const missingIds=new Set();
const mapped=rows.map(row=>{const [ids,reason,role]=forStep(row);for(const id of ids)if(!assets.has(id))missingIds.add(id);return {stepId:row.stepId,instructionHash:row.instructionHash,assetIds:[...new Set(ids)],coverage:'partial-vendor-reference',reviewed:true,referenceRole:role,selectionReason:reason};});
if(missingIds.size){fs.mkdirSync('review',{recursive:true});fs.writeFileSync('review/interface-mapping-review.json',JSON.stringify({fallback,missingIds:[...missingIds]},null,2));console.error('Pending actual sources: '+[...missingIds].join(', '));process.exit(1);}
fs.writeFileSync('content/screenshots/interface-references.json',JSON.stringify({version:2,assets:[...assets.values()],steps:mapped},null,2)+'\n');
fs.mkdirSync('review',{recursive:true});fs.writeFileSync('review/interface-mapping-review.json',JSON.stringify({fallback,assetCount:assets.size,stepCount:mapped.length},null,2)+'\n');
console.log(`Mapped ${mapped.length} steps to ${assets.size} real interface assets; ${fallback.length} notes decisions require review.`);
