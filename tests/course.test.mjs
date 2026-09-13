import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeProgress } from '../lib/progress-model.ts';
import {
  lessons,
  modules,
  sources,
  retainedMilestone2Ids,
  primaryFlow,
} from '../app/course.ts';
const ids = lessons.map((lesson) => lesson.id);
test('retains earlier verified work without marking new provisioning tasks complete', () => {
  assert.deepEqual(decodeProgress(null, '[0,2,5]', ids), {
    version: 2,
    completed: [],
    previousEdition: [0, 2, 5],
  });
});
test('stable identifiers survive lesson reordering and reject retired/unknown entries', () => {
  const raw = JSON.stringify({
    version: 2,
    completed: [ids[0], ids[4], ids[0], 'retired', 2],
    previousEdition: [1, 1, 9],
  });
  assert.deepEqual(decodeProgress(raw, null, [...ids].reverse()), {
    version: 2,
    completed: [ids[0], ids[4]],
    previousEdition: [1],
  });
});
test('malformed progress does not crash or award completion', () => {
  assert.deepEqual(decodeProgress('{broken', '[0,"1",-1,6,2.5,null]', ids), {
    version: 2,
    completed: [],
    previousEdition: [0],
  });
  assert.deepEqual(
    decodeProgress('{"version":2,"completed":{}}', null, ids).completed,
    [],
  );
});
test('new progress is authoritative while preserved legacy evidence round-trips', () => {
  const state = { version: 2, completed: [ids[7]], previousEdition: [0, 1] };
  assert.deepEqual(
    decodeProgress(JSON.stringify(state), '[0,1,2,3,4,5]', ids),
    state,
  );
  assert.deepEqual(
    decodeProgress(JSON.stringify({ ...state, completed: [] }), null, ids)
      .previousEdition,
    [0, 1],
  );
});
test('every available lesson has the complete teaching contract and resolvable references', () => {
  assert.equal(new Set(ids).size, lessons.length);
  assert.equal(lessons.length, 40);
  for (const lesson of lessons) {
    for (const field of [
      'scenario',
      'objective',
      'why',
      'change',
      'command',
      'expected',
      'verify',
      'trouble',
      'rollback',
      'challenge',
      'answer',
    ])
      assert.ok(lesson[field]?.trim(), `${lesson.id}: ${field}`);
    assert.ok(lesson.args.length >= 1);
    assert.ok(lesson.methodology.length >= 3);
    assert.ok(lesson.sources.length >= 1);
    for (const source of lesson.sources)
      assert.ok(sources[source]?.url.startsWith('https://'));
  }
  assert.equal(modules.length, 14);
});
test('lab starts before provisioning, standardizes rexuser, and preparation never installs Wazuh', () => {
  const text = JSON.stringify(lessons);
  assert.match(lessons[0].scenario, /No lab VM exists/);
  assert.doesNotMatch(text, /azureuser|linuxadmin|student@|admin@/i);
  assert.ok(ids.indexOf('key-create-v2') < ids.indexOf('vm-provision-v2'));
  assert.ok(ids.indexOf('host-trust-v2') < ids.indexOf('first-ssh-v2'));
  assert.doesNotMatch(
    lessons
      .filter((l) => !l.id.endsWith('-v4'))
      .flatMap((l) => [l.command, l.followup?.command ?? ''])
      .join('\n')
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n'),
    /(?:dnf|yum).*install|scp .*rexuser_ed25519/,
  );
  assert.equal(lessons.at(-1).id, 'wazuh-close-v4');
});
test('first-login commands stay in logically separate orientation tasks', () => {
  const commands = Object.fromEntries(lessons.map((l) => [l.id, l.command]));
  assert.match(commands['identity-v2'], /whoami\nid\nsudo -l/);
  assert.match(
    commands['host-os-v2'],
    /hostname\nhostnamectl\ncat \/etc\/redhat-release\nuname -r/,
  );
  assert.match(commands['guest-network-v2'], /ip addr\nip route/);
  assert.match(commands['home-files-v2'], /pwd\nls -la/);
});

test('all Milestone 2 completion IDs remain valid after reorder without awarding new work', () => {
  assert.equal(retainedMilestone2Ids.length, 18);
  const oldState = JSON.stringify({
    version: 2,
    completed: retainedMilestone2Ids,
    previousEdition: [0, 1],
  });
  const restored = decodeProgress(oldState, null, ids);
  assert.deepEqual(restored.completed, retainedMilestone2Ids);
  assert.equal(restored.completed.filter((id) => id.endsWith('-v3')).length, 0);
  assert.deepEqual(restored.previousEdition, [0, 1]);
  assert.ok(
    ids.every(
      (id) => id.endsWith('-v2') || id.endsWith('-v3') || id.endsWith('-v4'),
    ),
  );
});
test('ready stages partition available tasks and planned deployment never counts as completed', () => {
  const ready = modules.filter((stage) => stage.lessonIds.length);
  assert.equal(ready.length, 8);
  assert.deepEqual(
    ready.flatMap((stage) => stage.lessonIds),
    ids,
  );
  assert.equal(
    new Set(ready.flatMap((stage) => stage.lessonIds)).size,
    ids.length,
  );
  for (const stage of modules.filter((stage) => !stage.lessonIds.length))
    assert.equal(stage.lessonIds.length, 0);
  assert.equal(primaryFlow.length, 22);
});
test('storage is in build acceptance; delivery and rollback precede planned installations', () => {
  assert.ok(ids.indexOf('build-storage-v3') < ids.indexOf('vm-provision-v2'));
  assert.ok(ids.indexOf('manager-vm-v3') < ids.indexOf('paired-access-v3'));
  assert.ok(ids.indexOf('verify-transfer-v3') < ids.indexOf('baseline-v2'));
  assert.ok(ids.indexOf('baseline-v2') < ids.indexOf('rollback-gate-v3'));
  assert.ok(
    modules.findIndex((stage) => stage.id === 'prechange') <
      modules.findIndex((stage) => stage.id === 'central'),
  );
  assert.ok(
    modules.findIndex((stage) => stage.id === 'recover') <
      modules.findIndex((stage) => stage.id === 'storage-deep'),
  );
  const indexOfFirstLater = modules.findIndex((stage) => stage.later);
  assert.ok(modules.slice(indexOfFirstLater).every((stage) => stage.later));
});
test('transfers use a harmless file and verify content, ownership, and cross-host digest', () => {
  const get = (id) => lessons.find((lesson) => lesson.id === id);
  assert.match(get('test-file-v3').command, /Get-FileHash.*SHA256/);
  assert.match(get('scp-test-v3').command, /scp -i.*rexuser@/);
  assert.match(
    get('verify-transfer-v3').command,
    /pwd\nls -l.*\nfile .*\nsha256sum /,
  );
  assert.match(get('sftp-test-v3').followup.command, /lpwd\npwd\nls -l\nput /);
  assert.match(
    get('storage-verify-v3').command,
    /lsblk\nfindmnt\ndf -h\ndf -i/,
  );
  for (const lesson of lessons.filter((item) => item.followup)) {
    assert.ok(lesson.followup.shell);
    assert.ok(lesson.followup.args.length);
  }
});
test('installer examples cannot be mistaken for live Wazuh instructions', () => {
  const examples = lessons.find((lesson) => lesson.id === 'installer-types-v3');
  assert.ok(examples.command.split('\n').every((line) => line.startsWith('#')));
  assert.match(examples.why, /not a universal/);
  const fault = modules.find((stage) => stage.id === 'fault').plan.join('\n');
  assert.match(fault, /1\. Installed\?/);
  assert.match(fault, /12\. Central registration\?/);
  assert.match(fault, /do not default to disabling SELinux/);
});
