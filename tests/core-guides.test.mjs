import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lessons } from '../app/course.ts';
const read = (p) =>
  JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));
const guides = read('../content/screenshots/core-guides.json');
const alma = read('../content/alma/desktop-lessons.json');
const migration = read('../content/migration/migration-lessons.generated.json');
test('Every actual class has a relevant, explicitly illustrated core guide', () => {
  const all = [...lessons, ...migration.lessons, ...alma.lessons];
  assert.equal(guides.lessons.length, all.length);
  assert.equal(new Set(guides.lessons.map((x) => x.lessonId)).size, all.length);
  for (const lesson of all) {
    const entry = guides.lessons.find((x) => x.lessonId === lesson.id);
    assert.ok(entry, lesson.id);
    assert.ok(entry.focus.length > 10);
    for (const id of entry.guideIds) {
      const asset = guides.assets.find((x) => x.id === id);
      assert.ok(asset, id);
      assert.equal(asset.kind, 'illustrated');
      assert.match(asset.provenance, /not .*capture/i);
      assert.ok(
        fs.statSync(new URL('../public' + asset.src, import.meta.url)).size >
          1000,
      );
    }
  }
  assert.deepEqual(
    guides.lessons.find((x) => x.lessonId === 'upgrade-01').guideIds,
    ['azure'],
  );
  assert.deepEqual(
    guides.lessons.find((x) => x.lessonId === 'wazuh-agent-v4').guideIds,
    ['wazuh'],
  );
  assert.deepEqual(
    guides.lessons.find((x) => x.lessonId === 'sql-05').guideIds,
    ['sql'],
  );
  assert.deepEqual(
    guides.lessons.find((x) => x.lessonId === 'lab-07').guideIds,
    ['windows'],
  );
});
