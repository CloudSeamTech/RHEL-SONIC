import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../content/migration/migration-lessons.generated.json' with {type:'json'};
import { migrationCurriculum, migrationParts } from '../app/migration-curriculum.ts';
import { parseGuidedLab } from '../lib/guided-lab.ts';

test('server builds have separate VMware, Windows and role pages with no lost steps', () => {
  for (const id of ['lab-04','lab-06','lab-07','lab-08','sql-02']) {
    const original = parseGuidedLab(catalog.lessons.find(x=>x.id===id).body);
    const parts = migrationParts(id).map(key=>migrationCurriculum.find(x=>x.id===key));
    const guides = parts.map(x=>parseGuidedLab(x.body));
    assert.deepEqual(guides.flatMap(x=>x.steps), original.steps);
    assert.equal(guides[0].steps.length,10);
    assert.equal(guides[1].steps.length,11);
    assert.ok(!guides[0].steps.some(x=>/AD DS|promotion/.test(x.title)));
    assert.ok(!guides[2].steps.some(x=>/VM wizard|Typical|Windows Setup/.test(x.title)));
    assert.deepEqual(parts.map(x=>x.stepOffset),[0,10,21]);
    assert.ok(parts.every(x=>x.screenshotLessonId===id));
    assert.equal(parts[2].id,id);
  }
});
