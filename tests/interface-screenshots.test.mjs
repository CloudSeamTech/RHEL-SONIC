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
    refs.steps.filter((step) => step.assetIds.length > 0).length,
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

// Never trade a truthful capture gap for a screenshot of the wrong guest OS.
test('Windows 7 guest images cannot appear in Windows 10 / Server 2019 lessons', () => {
  const excluded = ['workstation-4', 'workstation-6', 'workstation-14', 'workstation-15'];
  for (const step of refs.steps) {
    assert.ok(step.assetIds.every((id) => !excluded.includes(id)), step.stepId);
    if (!step.assetIds.length) {
      assert.equal(audit.steps.find((item) => item.stepId === step.stepId).status,
        'missing-interface-screenshot');
    }
  }
  assert.ok(refs.steps.find((step) => step.stepId === 'lab-04:guided:3').excludedAssetIds.includes('workstation-4'));
});

test('Windows host preparation never borrows unrelated Azure controls', () => {
  const rows = refs.steps.filter((step) => /^lab-0[0-3]:/.test(step.stepId));
  for (const step of rows) assert.ok(step.assetIds.every((id) => !id.startsWith('az-')), step.stepId);
  assert.deepEqual(rows.find((step) => step.stepId === 'lab-00:guided:1').assetIds, ['win-file-explorer']);
  assert.deepEqual(rows.find((step) => step.stepId === 'lab-03:guided:3').assetIds, ['vmware-network-editor']);
  assert.deepEqual(rows.find((step) => step.stepId === 'lab-03:guided:6').assetIds, []);
});
