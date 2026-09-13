import { preparationLessonIds } from '../app/course-roadmap.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, modules } from '../app/course.ts';
import { lessonTimings, timingFor, stageTime } from '../app/course-timing.ts';
const ids = lessons.map((lesson) => lesson.id);
test('every implemented lesson has valid separate active, reading and wait estimates', () => {
  assert.deepEqual(Object.keys(lessonTimings).sort(), [...ids].sort());
  for (const value of Object.values(lessonTimings)) {
    for (const range of Object.values(value)) {
      assert.ok(range.every(Number.isInteger));
      assert.ok(range[0] >= 0 && range[1] >= range[0]);
    }
    assert.ok(value.handsOn[0] > 0);
  }
  assert.deepEqual(timingFor(preparationLessonIds).handsOn, [120, 180]);
  assert.deepEqual(timingFor(preparationLessonIds).waiting, [11, 25]);
});
test('remaining estimates exclude completed lessons and cannot double count', () => {
  assert.deepEqual(
    timingFor([...ids, ids[0]], new Set([ids[0]])).handsOn,
    [189, 285],
  );
  assert.deepEqual(timingFor(ids, new Set(ids)).handsOn, [0, 0]);
  assert.throws(() => timingFor(['unknown']), /Missing lesson timing/);
});
test('stage estimates share the same source and planned stages have no fabricated duration', () => {
  for (const stage of modules) {
    if (stage.lessonIds.length)
      assert.equal(stage.time, stageTime(stage.lessonIds));
    else assert.doesNotMatch(stage.time, /\d+\s*(min|hour)/);
  }
});
