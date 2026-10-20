import test from 'node:test';
import assert from 'node:assert/strict';
import course from '../content/alma/desktop-lessons.json' with { type: 'json' };
import {
  almaSnapshot,
  toggleAlmaLesson,
  almaProgressKey,
} from '../lib/alma-progress.ts';
import { lessonSequenceFor } from '../app/learning-pathways.ts';

test('Alma classes keep storage and shell-context decisions explicit', () => {
  assert.equal(course.lessons.length, 12);
  for (const lesson of course.lessons) {
    assert.ok(
      lesson.description &&
        lesson.guide.before &&
        lesson.guide.pass &&
        lesson.guide.rollback,
    );
    assert.ok(lesson.guide.steps.length >= 5);
    for (const step of lesson.guide.steps) {
      assert.ok(
        step.title &&
          step.action &&
          step.expect &&
          step.trouble &&
          step.evidence,
      );
      assert.doesNotMatch(
        step.command,
        /\b(mkfs|wipefs|pvcreate|lvextend|parted)\b/,
      );
    }
  }
  const storage = course.lessons.find((x) => x.id === 'alma-wd-drive');
  const text = JSON.stringify(storage);
  assert.match(text, /model, serial/i);
  assert.match(text, /does not enlarge/);
  assert.match(text, /do NOT choose Format|do not.*format/i);
  assert.match(text, /empty.*practice disk/i);
  assert.match(text, /nofail/);
  const terminal = JSON.stringify(
    course.lessons.find((x) => x.id === 'alma-real-terminal'),
  );
  assert.match(terminal, /NOT your VMware VM/);
  assert.match(terminal, /fingerprint/);
  assert.match(terminal, /Get-Date/);
  assert.deepEqual(
    lessonSequenceFor('alma-wd-drive').map((x) => x.id),
    course.lessons.map((x) => x.id),
  );
});

test('Alma verification rejects foreign IDs and tolerates corrupted or unavailable storage', () => {
  const oldStorage = globalThis.localStorage;
  const oldWindow = globalThis.window;
  const values = new Map();
  const target = new EventTarget();
  let notifications = 0;
  target.addEventListener('sonic-alma-progress', () => notifications++);
  try {
    globalThis.window = target;
    globalThis.localStorage = {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
    };
    values.set(almaProgressKey, '{broken');
    assert.equal(almaSnapshot(), '[]');
    assert.equal(toggleAlmaLesson('lab-04'), false);
    assert.equal(toggleAlmaLesson('alma-install'), true);
    assert.deepEqual(JSON.parse(almaSnapshot()), ['alma-install']);
    values.set(
      almaProgressKey,
      JSON.stringify(['alma-install', 'lab-04', 'alma-install']),
    );
    assert.deepEqual(JSON.parse(almaSnapshot()), ['alma-install']);
    assert.equal(toggleAlmaLesson('alma-install'), true);
    assert.equal(almaSnapshot(), '[]');
    assert.equal(notifications, 2);
    globalThis.localStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    };
    assert.equal(almaSnapshot(), '[]');
    assert.equal(toggleAlmaLesson('alma-install'), false);
  } finally {
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
  }
});
