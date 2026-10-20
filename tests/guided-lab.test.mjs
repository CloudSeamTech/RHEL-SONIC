import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseGuidedLab, referenceBody } from '../lib/guided-lab.ts';
import catalog from '../content/migration/migration-lessons.generated.json' with { type: 'json' };
import images from '../content/migration/lab-screenshots.json' with { type: 'json' };
import { lessons as linux } from '../app/course.ts';

const guides = catalog.lessons.map((lesson) => ({
  lesson,
  guide: parseGuidedLab(lesson.body),
}));
test('every authored migration class has actionable steps, context, checks, and recovery', () => {
  assert.equal(guides.length, 45);
  for (const { lesson, guide } of guides) {
    assert.ok(guide && guide.steps.length, lesson.id);
    for (const key of ['where', 'before', 'pass', 'rollback'])
      assert.ok(guide[key], `${lesson.id}: ${key}`);
    for (const step of guide.steps) {
      for (const key of ['title', 'action', 'expect', 'trouble', 'evidence'])
        assert.ok(step[key], `${lesson.id}: ${key}`);
      assert.doesNotMatch(
        step.command,
        /\*\*(COMMAND|SCREENSHOTS|DO|EXPECT)\*\*/,
      );
    }
    assert.ok(referenceBody(lesson.body).includes(`# ${lesson.title}`));
    assert.ok(
      lesson.body.split('').every((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 || [9, 10, 13].includes(code);
      }),
    );
  }
});
test('Server 2019 source and new Azure upgrade have distinct identities and correct order', async () => {
  const build = guides.find((item) => item.lesson.id === 'lab-04').guide;
  assert.ok(
    build.steps.some((step) =>
      step.action.includes('Windows Server 2019 Standard (Desktop Experience)'),
    ),
  );
  assert.ok(
    build.steps.some((step) =>
      step.action.includes(
        'Windows Server 2016 for both forest and domain functional levels',
      ),
    ),
  );
  const upgrade = guides.find((item) => item.lesson.id === 'upgrade-01').guide;
  assert.match(upgrade.where, /APP02/);
  const all = upgrade.steps
    .map((step) => step.action + '\n' + step.command)
    .join('\n');
  assert.match(all, /server2022Upgrade/);
  assert.match(all, /WindowsServerUpgrade/);
  assert.match(all, /\.\\setup\.exe \/auto upgrade \/dynamicupdate disable/);
  assert.match(upgrade.before, /LAB 17/);
  assert.match(upgrade.rollback, /not.*DC|Never.*DC/i);
  const source = await readFile(
    new URL('../lib/migration-progress.ts', import.meta.url),
    'utf8',
  );
  assert.match(source, /sonic-agency-azure-migration-v1/);
});
test('all referenced screenshot assets exist with explicit provenance and version caveats', async () => {
  assert.equal(new Set(images.map((image) => image.id)).size, images.length);
  for (const image of images) {
    assert.match(image.src, /^\/lab-screenshots\/[a-z0-9-]+\.(png|jpg|gif)$/);
    assert.ok(
      image.source.startsWith('https://') &&
        image.credit &&
        image.note &&
        image.alt,
    );
    await access(resolve('public', image.src.slice(1)));
  }
  for (const { guide } of guides)
    for (const step of guide.steps)
      for (const id of step.screenshots)
        assert.ok(
          images.some((image) => image.id === id),
          id,
        );
});
test('coverage includes every class, alternative walkthrough, and help step without counting references as actual captures', async () => {
  const report = JSON.parse(
    await readFile(
      new URL('../content/screenshots/coverage.json', import.meta.url),
      'utf8',
    ),
  );
  const expected =
    guides.reduce((sum, item) => sum + item.guide.steps.length, 0) +
    linux.reduce(
      (sum, lesson) =>
        sum +
        (lesson.walkthrough?.length ?? 0) +
        (lesson.workplaceWalkthrough?.length ?? 0) +
        (lesson.helpSections ?? []).reduce((n, h) => n + h.steps.length, 0),
      0,
    );
  assert.equal(report.steps.length, expected);
  assert.equal(new Set(report.steps.map((step) => step.stepId)).size, expected);
  assert.equal(report.summary.lessons, catalog.lessons.length + linux.length);
  for (const step of report.steps) {
    assert.match(step.instructionHash, /^[a-f0-9]{64}$/);
    assert.ok(
      step.expectedFilename.includes(step.instructionHash.slice(0, 10)),
    );
    if (step.referenceIds.length && step.status !== 'reviewed-capture')
      assert.equal(step.status, 'reference-only');
  }
});

test('copied guided commands decode workbook markup without breaking Windows paths', () => {
  const sample = parseGuidedLab(
    '## Guided walkthrough\n**WHERE** lab\n### Step 01: Copy\n**DO** Copy\n**EXPECT** Compare\n**IF STUCK** Stop\n**COMMAND**\n> Get-Service MSSQLSERVER \\# on SQL01\n> Get-ADComputer MECM01\\$\n> Get-Item C:\\inetpub\\wwwroot',
  );
  assert.equal(
    sample.steps[0].command,
    'Get-Service MSSQLSERVER # on SQL01\nGet-ADComputer MECM01$\nGet-Item C:\\inetpub\\wwwroot',
  );
});
