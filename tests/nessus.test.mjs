import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nessusCourses,
  nessusLessons,
  nessusCourseHref,
} from '../lib/nessus-curriculum.ts';
import {
  normalizeNessusProgress,
  canVerifyNessusLesson,
} from '../lib/nessus-progress.ts';
import {
  learningPathways,
  pathwayLessons,
  lessonSequenceFor,
} from '../app/learning-pathways.ts';

test('three complete Nessus courses keep all requested topics and honest per-step screenshot status', () => {
  assert.deepEqual(
    nessusCourses.map((c) => c.lessons.length),
    [14, 11, 18],
  );
  assert.equal(new Set(nessusLessons.map((l) => l.id)).size, 43);
  for (const course of nessusCourses) {
    assert.ok(course.prerequisite && course.baseline && course.sources.length);
    const pathway = learningPathways.find((p) => p.id === course.id);
    assert.deepEqual(
      pathwayLessons(pathway).map((l) => l.id),
      course.lessons.map((l) => l.id),
    );
    for (const lesson of course.lessons) {
      for (const field of ['what', 'why', 'description', 'exercise', 'pass'])
        assert.ok(lesson[field]?.length > 20, `${lesson.id}:${field}`);
      assert.ok(
        lesson.bestPractices.length &&
          lesson.commonMistakes.length &&
          lesson.troubleshooting.length,
        lesson.id,
      );
      assert.ok(lesson.steps.length >= 2, lesson.id);
      assert.ok(lesson.quiz.length >= 2, lesson.id);
      for (const q of lesson.quiz) {
        assert.ok(q.question && q.explanation && q.options.length >= 3);
        assert.ok(
          Number.isInteger(q.answer) &&
            q.answer >= 0 &&
            q.answer < q.options.length,
        );
      }
      for (const step of lesson.steps) {
        assert.ok(
          step.where &&
            step.actions.length &&
            step.expected &&
            step.sources.length,
          lesson.id + ':' + step.title,
        );
        assert.equal(step.screenshot.status, 'capture-needed');
        assert.ok(
          step.screenshot.title && step.screenshot.instructions.length > 20,
        );
        if (step.command)
          assert.ok(step.breakdown.length, lesson.id + ':command explanation');
        for (const url of step.sources)
          assert.equal(new URL(url).protocol, 'https:');
      }
      assert.equal(
        pathwayLessons(pathway).find((l) => l.id === lesson.id).href,
        `${nessusCourseHref(course.id)}#lesson=${lesson.id}`,
      );
      assert.deepEqual(
        lessonSequenceFor(lesson.id).map((l) => l.id),
        course.lessons.map((l) => l.id),
      );
    }
  }
});

test('new Nessus courses cannot leak into the existing Windows migration next-lesson chain', () => {
  assert.ok(lessonSequenceFor('lab-04').every((l) => l.source !== 'nessus'));
});

const lesson = nessusLessons[0];
const passed = () => ({
  version: 1,
  checked: [
    ...lesson.steps.map((_, i) => `${lesson.id}:step:${i}`),
    `${lesson.id}:exercise`,
  ],
  verified: [lesson.id],
  answers: { [lesson.id]: lesson.quiz.map((q) => q.answer) },
});
test('lesson verification requires lab checks, practical evidence and correct knowledge answers', () => {
  assert.equal(
    canVerifyNessusLesson(lesson.id, {
      version: 1,
      checked: [],
      verified: [],
      answers: {},
    }),
    false,
  );
  assert.deepEqual(normalizeNessusProgress(passed()).verified, [lesson.id]);
  const unchecked = passed();
  unchecked.checked.pop();
  assert.deepEqual(normalizeNessusProgress(unchecked).verified, []);
  const wrong = passed();
  wrong.answers[lesson.id][0] =
    (lesson.quiz[0].answer + 1) % lesson.quiz[0].options.length;
  assert.deepEqual(normalizeNessusProgress(wrong).verified, []);
  assert.equal(canVerifyNessusLesson('unknown', passed()), false);
});
test('stale or corrupt browser progress grants no credit and removes duplicate/unknown checks', () => {
  for (const value of [
    null,
    [],
    {},
    'invalid',
    { version: 2, ...passed(), version: 2 },
  ])
    assert.deepEqual(normalizeNessusProgress(value).verified, []);
  const input = passed();
  input.checked.push(input.checked[0], 'not-a-step');
  input.verified.push('unknown');
  input.answers[lesson.id] = [999];
  const result = normalizeNessusProgress(input);
  assert.equal(new Set(result.checked).size, result.checked.length);
  assert.ok(!result.checked.includes('not-a-step'));
  assert.deepEqual(result.verified, []);
});
