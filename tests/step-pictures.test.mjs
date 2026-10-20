import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { smallActions } from '../lib/beginner-directions.ts';
const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const coverage = read('content/screenshots/coverage.json');
const registry = read('content/screenshots/step-pictures.json');
test('Every actual instruction, including help variants, has its own fresh picture', () => {
  assert.equal(registry.pictures.length, coverage.steps.length);
  const ids = new Set(registry.pictures.map((p) => p.stepId));
  assert.equal(ids.size, coverage.steps.length);
  for (const step of coverage.steps) {
    const picture = registry.pictures.find((p) => p.stepId === step.stepId);
    assert.ok(picture, step.stepId);
    assert.equal(
      picture.instructionHash,
      step.instructionHash,
      `Stale picture: ${step.stepId}`,
    );
    const svg = fs.readFileSync('public' + picture.src, 'utf8');
    assert.equal(
      createHash('sha256').update(svg).digest('hex'),
      picture.fileHash,
    );
    assert.match(svg, /ILLUSTRATED STEP MAP/);
    assert.match(svg, /NOT A LIVE SCREENSHOT OR RESULT/);
    assert.doesNotMatch(svg, /<script|<foreignObject|href=|onload=/);
  }
  assert.equal(
    registry.pictures.filter((p) => p.stepId.startsWith('alma-')).length,
    72,
  );
});
test('Small actions retain paths, decimals, and every instruction', () => {
  assert.deepEqual(
    smallActions('Open C:\\Lab\\notes.txt. Select Next. Check 192.168.77.10.'),
    ['Open C:\\Lab\\notes.txt.', 'Select Next.', 'Check 192.168.77.10.'],
  );
  assert.deepEqual(smallActions('Use .\\setup.exe /auto upgrade. Wait.'), [
    'Use .\\setup.exe /auto upgrade.',
    'Wait.',
  ]);
});
