import test from 'node:test';
import assert from 'node:assert/strict';
import { isProgressKey, parseCompleted } from '../lib/academy-tracking.ts';
test('cloud sync allows only the academy progress namespace', () => {
  for (const key of [
    'sonic-alma-desktop-v1',
    'wazuh-foundations-v2',
    'sonic-guided-workstation2019-v1:lab-04:part-21',
  ])
    assert.equal(isProgressKey(key), true);
  for (const key of [
    'password',
    'token',
    'sonic-academy-active-account',
    'sonic-guided-workstation2019-v1:<script>',
  ])
    assert.equal(isProgressKey(key), false);
});
test('dashboard completion combines all readers without inventing or duplicating progress', () => {
  const records = {
    'wazuh-foundations-v2': JSON.stringify({
      version: 2,
      completed: ['linux-one', 'linux-one'],
    }),
    'sonic-agency-azure-migration-v1': JSON.stringify({
      version: 1,
      completed: ['lab-00'],
    }),
    'sonic-alma-desktop-v1': '["alma-plan"]',
    'sonic-academy-nessus-v1': JSON.stringify({
      version: 1,
      verified: ['mecm-ops-app'],
      checked: ['mecm-ops-app:step:0'],
    }),
    'sonic-academy-bookmarks-v1': '["bookmarked-only"]',
  };
  assert.deepEqual(
    new Set(parseCompleted(records)),
    new Set(['linux-one', 'lab-00', 'alma-plan', 'mecm-ops-app']),
  );
  assert.deepEqual(parseCompleted({ 'wazuh-foundations-v2': 'broken' }), []);
  assert.deepEqual(
    parseCompleted({
      'wazuh-foundations-v2': '{"version":99,"completed":["linux-one"]}',
    }),
    [],
  );
});
