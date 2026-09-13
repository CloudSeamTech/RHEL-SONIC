import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../app/course.ts';
import { beginnerTerms } from '../app/beginner-language.ts';

test('every available lesson identifies where to work and what result to check', () => {
  for (const lesson of lessons) {
    assert.ok(lesson.walkthrough?.length, lesson.id);
    for (const step of lesson.walkthrough) {
      assert.ok(
        step.where && step.expected && step.actions.length,
        `${lesson.id}: ${step.title}`,
      );
    }
    assert.ok(beginnerTerms(lesson).length, lesson.id);
  }
});

test('key generation cannot be copied together with the existence checks', () => {
  const steps = lessons.find((l) => l.id === 'key-create-v2').walkthrough;
  const check = steps.findIndex((s) => s.command?.includes('Test-Path'));
  const generate = steps.findIndex((s) => s.command?.includes('ssh-keygen -t'));
  assert.ok(check >= 0 && generate > check);
  assert.match(steps[check].actions.join(' '), /either result is True, STOP/);
  assert.doesNotMatch(steps[generate].command, /Test-Path/);
});

test('SFTP upload has a filename checkpoint and hash verification happens over SSH', () => {
  const steps = lessons.find((l) => l.id === 'sftp-test-v3').walkthrough;
  const upload = steps.findIndex((s) => s.command?.startsWith('put '));
  assert.ok(upload > 0);
  assert.match(steps[upload - 1].actions.join(' '), /already exists, stop/);
  const hash = steps.find((s) => s.command?.includes('sha256sum'));
  assert.match(hash.where, /SSH/);
  assert.doesNotMatch(hash.where, /SFTP/);
});
