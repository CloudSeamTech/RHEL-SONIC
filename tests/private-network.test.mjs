import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import catalog from '../content/migration/migration-lessons.generated.json' with {type:'json'};
import {migrationCurriculum} from '../app/migration-curriculum.ts';
import {parseGuidedLab} from '../lib/guided-lab.ts';

test('VMnet2 lab uses the requested private /24 with fixed DC addresses and no gateway',()=>{
 const network=catalog.lessons.find(l=>l.id==='lab-03').body;
 assert.match(network,/10\.50\.0\.10/);assert.match(network,/10\.50\.0\.11/);
 assert.match(network,/Host-only/);assert.match(network,/255\.255\.255\.0/);
 assert.match(network,/Clear Use local DHCP/);assert.match(network,/Default gateway blank/);
 for(const id of ['lab-04','lab-07']){
  const body=catalog.lessons.find(l=>l.id===id).body;
  assert.match(body,/Custom: Specific virtual network and VMnet2 \(Host-only\)/);
  assert.match(body,/leave Default gateway blank/);
  assert.doesNotMatch(body,/gateway = the NAT/);
 }
 assert.doesNotMatch(JSON.stringify(catalog),/192\.168\.77\.|AG-DC0[12]/);
});
test('DC02 guest preparation proves two-way reachability before AD promotion',()=>{
 const guest=migrationCurriculum.find(l=>l.id==='lab-07-windows');
 const guide=parseGuidedLab(guest.body);const proof=guide.steps.at(-1);
 assert.match(proof.action,/On DC01 run ipconfig and then ping 10\.50\.0\.11/);
 assert.match(proof.command,/ping 10\.50\.0\.10/);
 assert.match(proof.action,/-RemoteAddress 10\.50\.0\.0\/24/);
 assert.match(proof.action,/Keep Windows Firewall on/);
 assert.match(proof.expect,/not AD replication/);
});
test('host-only instructions keep updates and Azure routing as explicit separate prerequisites',()=>{
 const dc=catalog.lessons.find(l=>l.id==='lab-04').body;
 assert.match(dc,/temporarily change its single adapter to NAT/);
 assert.match(dc,/Before AD promotion\/domain join/);
 assert.match(dc,/return the adapter to Custom VMnet2/);
 const vpn=catalog.lessons.find(l=>l.id==='lab-16').body;
 assert.match(vpn,/separately planned router\/VPN appliance/);
});
