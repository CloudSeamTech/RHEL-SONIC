import test from 'node:test';
import assert from 'node:assert/strict';
import { preparationLessonIds } from '../app/course-roadmap.ts';
import { deploymentGroups, wazuhLessons } from '../app/wazuh-lessons.ts';
import { dashboardModel } from '../lib/dashboard-model.ts';
import { decodeProgress } from '../lib/progress-model.ts';
import { lessons } from '../app/course.ts';
import { wazuhWalkthroughs } from '../app/wazuh-walkthroughs.ts';

test('every deployment lesson supplies ordered location, action, outcome and evidence cards', () => {
  for (const lesson of wazuhLessons) {
    assert.ok(lesson.walkthrough.length >= 4, lesson.id);
    for (const step of lesson.walkthrough) {
      assert.ok(step.where && step.actions.length && step.expected, lesson.id);
    }
    assert.match(lesson.walkthrough.at(-1).title, /Save evidence/);
  }
});
test('FIM baseline scan is a separate checkpoint before the modification command', () => {
  const steps = wazuhWalkthroughs['wazuh-event-v4'];
  const restart = steps.findIndex((s) =>
    s.command?.includes('systemctl restart'),
  );
  const modify = steps.findIndex((s) => s.command?.includes('>>'));
  assert.ok(restart >= 0 && modify > restart);
  assert.match(steps[restart].expected, /initial scan has completed/);
  assert.ok(!steps[restart].command.includes('>>'));
});
test('rollback choices and firewall persistence have explicit separate checkpoints', () => {
  const recovery = wazuhWalkthroughs['wazuh-recover-v4'];
  const choice = recovery.findIndex((s) =>
    s.title.startsWith('Choose your recovery branch'),
  );
  const removal = recovery.findIndex((s) => s.command?.includes('dnf remove'));
  assert.ok(choice >= 0 && choice < removal);
  assert.match(recovery[removal].title, /Branch A only/);
  const web = wazuhWalkthroughs['wazuh-dashboard-v4'];
  assert.ok(
    web.findIndex((s) => s.title === 'Save only the tested HTTPS rule') >
      web.findIndex((s) => s.title === 'Sign in and inspect the application'),
  );
});
test('existing completed preparation continues into Wazuh without awarding new credit', () => {
  const saved = JSON.stringify({
    version: 2,
    completed: preparationLessonIds,
    previousEdition: [1],
  });
  const restored = decodeProgress(
    saved,
    null,
    lessons.map((l) => l.id),
  );
  const model = dashboardModel(restored.completed);
  assert.equal(model.overall.count, 30);
  assert.equal(model.overall.total, 40);
  assert.equal(model.next.id, deploymentGroups.central[0]);
  assert.equal(model.stages.find((s) => s.id === 'central').percent, 0);
  assert.ok(!restored.completed.some((id) => id.endsWith('-v4')));
});
test('deployment acceptance precedes fault, recovery and closure', () => {
  const ids = wazuhLessons.map((l) => l.id);
  assert.deepEqual(ids, Object.values(deploymentGroups).flat());
  assert.ok(ids.indexOf('wazuh-event-v4') < ids.indexOf('wazuh-fault-v4'));
  assert.equal(ids.at(-1), 'wazuh-close-v4');
  const get = (id) => wazuhLessons.find((l) => l.id === id);
  assert.match(get('wazuh-agent-v4').command, /localpkg_gpgcheck=1/);
  assert.match(get('wazuh-fault-v4').command, /127\.0\.0\.1/);
  assert.match(get('wazuh-recover-v4').verify, /enrollment/);
  assert.match(get('wazuh-close-v4').answer, /does not|No\./);
});
