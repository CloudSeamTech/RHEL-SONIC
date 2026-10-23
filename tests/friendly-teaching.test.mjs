import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { lessons as linux } from '../app/course.ts';
import migration from '../content/migration/migration-lessons.generated.json' with { type: 'json' };
import alma from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { welcomeFor, lessonWelcomes } from '../lib/lesson-welcome.ts';
import { nessusCourses } from '../lib/nessus-curriculum.ts';
import { maintenanceCourse } from '../lib/guided-courses.ts';
import {
  lessonSequenceFor,
  learningPathways,
  pathwayLessons,
} from '../app/learning-pathways.ts';
import references from '../content/azure/maintenance-references.json' with { type: 'json' };
import contract from '../content/teaching/nessus-command-contract.json' with { type: 'json' };

test('all97 original classes have a reviewed welcome, concrete kit and first action', () => {
  const all = [...linux, ...migration.lessons, ...alma.lessons];
  assert.equal(all.length, 97);
  assert.deepEqual(
    new Set(Object.keys(lessonWelcomes)),
    new Set(all.map((l) => l.id)),
  );
  for (const lesson of all) {
    const welcome = welcomeFor(lesson.id);
    for (const field of ['welcome', 'why', 'firstMove', 'reassurance'])
      assert.ok(welcome[field]?.trim(), `${lesson.id}:${field}`);
    assert.ok(welcome.needs.length >= 2, lesson.id);
  }
  assert.match(welcomeFor('lab-04-vmware').firstMove, /VMware/);
  assert.match(welcomeFor('lab-04', true).firstMove, /Server Manager/);
  assert.doesNotMatch(
    welcomeFor('lab-04', true).firstMove,
    /New Virtual Machine/,
  );
});
test('the copy rewrite preserves every Nessus command and includes concrete preparation for43 lessons', () => {
  const actual = new Map();
  for (const course of nessusCourses) {
    assert.ok(course.supplies.length >= 4);
    assert.doesNotMatch(
      course.prerequisite,
      /A host able to run|No dedicated live lab/,
    );
    for (const lesson of course.lessons) {
      assert.ok(lesson.needs.length > 0, lesson.id);
      lesson.steps.forEach((step, i) =>
        actual.set(
          `${lesson.id}:${i + 1}`,
          createHash('sha256')
            .update(step.command ?? '')
            .digest('hex'),
        ),
      );
    }
  }
  assert.equal(actual.size, 108);
  for (const item of contract)
    assert.equal(actual.get(item.stepId), item.sha256, item.stepId);
});
test('Azure maintenance is separate from migration pagination and all real pictures exist with provenance', () => {
  const azure = learningPathways.find((p) => p.id === 'azure-operations');
  const maintenance = pathwayLessons(azure).filter(
    (l) => l.source === 'azure-lab',
  );
  assert.equal(maintenance.length, 10);
  assert.deepEqual(
    lessonSequenceFor(maintenance[0].id).map((l) => l.id),
    maintenance.map((l) => l.id),
  );
  assert.ok(lessonSequenceFor('lab-04').every((l) => l.source !== 'azure-lab'));
  const assets = new Map(references.map((a) => [a.id, a]));
  let pictured = 0,
    missing = 0;
  for (const lesson of maintenanceCourse.lessons) {
    assert.ok(lesson.needs.length >= 2);
    for (const step of lesson.steps) {
      if (step.screenshot.status === 'reference') {
        const a = assets.get(step.screenshot.assetId);
        assert.ok(a, step.title);
        assert.ok(a.source && a.credit && a.note);
        assert.equal(
          createHash('sha256')
            .update(fs.readFileSync('public' + a.src))
            .digest('hex'),
          a.sha256,
        );
        pictured++;
      } else {
        assert.equal(step.screenshot.status, 'capture-needed');
        assert.ok(step.screenshot.instructions);
        missing++;
      }
    }
  }
  assert.equal(pictured, 14);
  assert.equal(missing, 16);
});
