import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardModel, labMilestones } from '../lib/dashboard-model.ts';
import { lessons, modules } from '../app/course.ts';

test('new learners start at the first incomplete task and planned stages have no percentage', () => {
  const model = dashboardModel([]);
  assert.equal(model.next.id, lessons[0].id);
  assert.equal(model.following.id, lessons[1].id);
  assert.equal(model.overall.percent, 0);
  assert.equal(model.stages.length, modules.length);
  for (const stage of model.stages) {
    assert.equal(stage.percent, stage.lessonIds.length ? 0 : null);
    assert.equal(
      stage.state,
      stage.lessonIds.length ? 'not-started' : 'planned',
    );
  }
});
test('sparse completions use actual stage membership without duplicate or invalid credit', () => {
  const transfer = modules.find((stage) => stage.id === 'transfer');
  const ids = [...modules[0].lessonIds, ...transfer.lessonIds.slice(0, 2)];
  const model = dashboardModel([...ids, ids[0], 'invalid']);
  assert.equal(model.stages[0].percent, 100);
  assert.equal(model.stages[0].state, 'completed');
  assert.equal(model.stages[1].percent, 50);
  assert.equal(model.stages[1].state, 'in-progress');
  assert.equal(model.overall.count, ids.length);
  assert.equal(
    model.overall.percent,
    Math.round((ids.length / lessons.length) * 100),
  );
  assert.equal(model.next.id, transfer.lessonIds[2]);
  assert.equal(model.stage.id, 'transfer');
});
test('all available tasks completed never awards future deep-dive credit', () => {
  const model = dashboardModel(lessons.map((lesson) => lesson.id));
  assert.equal(model.overall.percent, 100);
  assert.equal(model.next, undefined);
  assert.equal(model.following, undefined);
  assert.equal(model.stage, undefined);
  assert.equal(
    model.milestones.find((task) => task.title === 'Install Wazuh').state,
    'completed',
  );
  assert.ok(
    model.stages
      .filter((stage) => !stage.total)
      .every((stage) => stage.percent === null && stage.state === 'planned'),
  );
});
test('readiness groups resolve only existing lesson IDs and roadmap stages', () => {
  for (const milestone of labMilestones) {
    assert.ok(modules.some((stage) => stage.id === milestone.stage));
    for (const id of milestone.ids)
      assert.ok(lessons.some((lesson) => lesson.id === id));
  }
});
