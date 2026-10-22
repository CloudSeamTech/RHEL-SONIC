import fs from 'node:fs';
import { createHash } from 'node:crypto';
const courses = ['linux', 'windows', 'scanning'].map((id) =>
  JSON.parse(fs.readFileSync(`content/nessus/${id}.json`, 'utf8')),
);
const steps = courses.flatMap((course) =>
  course.lessons.flatMap((lesson) =>
    lesson.steps.map((step, index) => ({
      courseId: course.id,
      lessonId: lesson.id,
      step: index + 1,
      title: step.title,
      where: step.where,
      status: step.screenshot.status,
      captureTitle: step.screenshot.title,
      captureInstructions: step.screenshot.instructions,
      instructionHash: createHash('sha256')
        .update(
          JSON.stringify([
            step.title,
            step.actions,
            step.command,
            step.expected,
          ]),
        )
        .digest('hex'),
    })),
  ),
);
if (
  steps.some(
    (step) =>
      step.status !== 'capture-needed' ||
      !step.captureInstructions ||
      !step.where,
  )
)
  throw Error(
    'A Nessus step needs an honest screenshot capture status and specific instructions.',
  );
const summary = {
  courses: courses.length,
  lessons: courses.reduce((n, c) => n + c.lessons.length, 0),
  steps: steps.length,
  reviewedCaptures: 0,
  capturePlaceholders: steps.length,
};
fs.mkdirSync('docs/nessus', { recursive: true });
fs.writeFileSync(
  'docs/nessus/screenshot-inventory.json',
  JSON.stringify({ summary, steps }, null, 2) + '\n',
);
const columns = [
  'courseId',
  'lessonId',
  'step',
  'title',
  'where',
  'status',
  'captureTitle',
  'captureInstructions',
  'instructionHash',
];
const quote = (value) => '"' + String(value).replaceAll('"', '""') + '"';
fs.writeFileSync(
  'docs/nessus/capture-checklist.csv',
  [
    columns.join(','),
    ...steps.map((step) => columns.map((key) => quote(step[key])).join(',')),
  ].join('\n') + '\n',
);
console.log(JSON.stringify(summary, null, 2));
