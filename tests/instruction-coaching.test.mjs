import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { explainStep } from '../lib/step-coaching.ts';
import { readableStepTitle } from '../lib/lesson-headings.ts';
import { checkTeachingFor, clarifiedChecks } from '../lib/reference-check-teaching.ts';
import { productionPracticeFor } from '../lib/lab-production-practice.ts';

const coverage = JSON.parse(readFileSync('content/screenshots/coverage.json', 'utf8'));

test('each of the 803 original learning actions receives a contextual, non-generic explanation', () => {
  assert.equal(coverage.steps.length, 803);
  for (const step of coverage.steps) {
    const notes = explainStep({
      lessonId: step.lessonId,
      title: step.title,
      action: step.actions,
      command: step.command,
      expected: step.expected,
    });
    assert.ok(notes.specific, step.stepId + ' needs source-specific teaching');
    assert.ok(notes.reason.length >= 55, step.stepId + ' why');
    assert.ok(notes.impact.length >= 70, step.stepId + ' effect');
    assert.ok(Array.isArray(notes.commandNotes));
  }
});

test('production instructions are specific for all 97 courses', () => {
  const ids = new Set(coverage.steps.map((step) => step.lessonId));
  assert.equal(ids.size, 97);
  for (const id of ids) {
    const note = productionPracticeFor(id);
    assert.ok(note.length > 110, id);
    assert.doesNotMatch(note, /^In production, confirm the system owner/, id);
    assert.doesNotMatch(note, /disable SELinux to make/i);
  }
  assert.match(productionPracticeFor('sql-05'), /restore tests/i);
  assert.match(productionPracticeFor('upgrade-01'), /in-place Windows Server upgrade/i);
});

test('twelve generic workbook reference checks have precise original-command-aware text', () => {
  const list = Object.entries(clarifiedChecks);
  assert.equal(list.length, 12);
  for (const [ref, improvement] of list) {
    const [lessonId, n] = ref.split(':');
    assert.deepEqual(checkTeachingFor(lessonId, Number(n)), improvement);
    assert.ok(improvement.title.length > 30, ref);
    assert.ok(improvement.action.length > 120, ref);
    assert.doesNotMatch(improvement.title, /Run the reference check/i);
  }
});

test('Linux walkthrough command and website labels are task-oriented', () => {
  assert.equal(
    readableStepTitle('Command 1: read, type, then check', ['This lists all Linux disks.'], 'lsblk'),
    'Identify block devices without changing disks',
  );
  assert.match(
    readableStepTitle('Website step 1', ['Open Virtual Machines in the Azure portal. Choose Create.']),
    /^Open Virtual Machines/,
  );
  assert.equal(readableStepTitle('Confirm identity', ['Check the host.'], 'hostname'), 'Confirm identity');
});

test('the authored screenshot registry remains unchanged and links to all lesson steps', () => {
  const ids = new Set(coverage.steps.map(step => step.stepId));
  assert.equal(ids.size, coverage.steps.length);
  assert.equal(coverage.summary.lessons, 97);
});
