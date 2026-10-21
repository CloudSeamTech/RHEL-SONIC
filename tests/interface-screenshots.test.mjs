import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const refs = read('content/screenshots/interface-references.json');
const coverage = read('content/screenshots/coverage.json');
const audit = read('content/screenshots/interface-audit.json');
test('Every step is audited without counting illustrations as screenshots', () => {
  assert.equal(audit.steps.length, coverage.steps.length);
  assert.equal(
    new Set(audit.steps.map((x) => x.stepId)).size,
    coverage.steps.length,
  );
  assert.equal(audit.summary.reviewedTargetCaptures, 0);
  assert.equal(
    audit.summary.stepsWithPartialVendorReferences,
    refs.steps.length,
  );
  assert.equal(
    audit.summary.stepsWithoutInterfaceScreenshots +
      audit.summary.stepsWithPartialVendorReferences,
    coverage.steps.length,
  );
  assert.equal(
    audit.steps.find((x) => x.stepId === 'alma-wd-drive:guided:2').status,
    'partial-vendor-reference',
  );
  assert.equal(
    audit.steps.find((x) => x.stepId === 'alma-install:guided:4').status,
    'partial-vendor-reference',
  );
  for (const asset of refs.assets) {
    assert.doesNotMatch(asset.src, /illustrated-|step-pictures/);
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync('public' + asset.src))
        .digest('hex'),
      asset.sha256,
    );
    assert.ok(asset.credit && asset.source && asset.platform);
  }
  for (const ref of refs.steps) {
    assert.equal(
      coverage.steps.find((x) => x.stepId === ref.stepId).instructionHash,
      ref.instructionHash,
    );
    for (const id of ref.assetIds)
      assert.ok(refs.assets.some((x) => x.id === id));
  }
});
