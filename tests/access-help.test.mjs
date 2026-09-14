import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../app/course.ts';
import {
  sshPermissionHelp,
  dashboardSubnetHelp,
} from '../app/access-troubleshooting.ts';

test('SSH help is available where learners create keys and connect', () => {
  for (const id of ['key-create-v2', 'first-ssh-v2', 'paired-access-v3']) {
    assert.ok(
      lessons
        .find((l) => l.id === id)
        .helpSections?.some((s) => s.steps === sshPermissionHelp),
    );
  }
  const commands = sshPermissionHelp.map((s) => s.command ?? '').join('\n');
  assert.doesNotMatch(
    commands,
    /\/reset|\/T\b|azureuser|Rdmsv|4\.148\.240\.153/i,
  );
  assert.ok(commands.indexOf('/save') < commands.indexOf('/grant:r'));
  assert.ok(commands.includes('/restore'));
});

test('subnet access is checked before permanent firewall changes', () => {
  const testClients = dashboardSubnetHelp.findIndex((s) =>
    s.title.includes('test from real clients'),
  );
  const save = dashboardSubnetHelp.findIndex(
    (s) =>
      s.command?.includes('--permanent') &&
      s.command?.includes('--add-rich-rule'),
  );
  assert.ok(testClients >= 0 && save > testClients);
  assert.match(
    dashboardSubnetHelp[0].actions.join(' '),
    /port group is not itself an IP subnet/,
  );
  assert.match(
    dashboardSubnetHelp[1].actions.join(' '),
    /does not cancel a broader Allow/,
  );
});
