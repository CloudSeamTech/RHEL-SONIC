import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {helpdeskCourse} from '../lib/guided-courses.ts';
import {learningPathways,lessonSequenceFor,pathwayLessons} from '../app/learning-pathways.ts';
import {normalizeNessusProgress,canVerifyNessusLesson} from '../lib/nessus-progress.ts';
import refs from '../content/helpdesk/references.json' with {type:'json'};

test('help desk follows APP01, has a separate route and complete per-step visuals',()=>{
 const windows=learningPathways.find(p=>p.id==='windows');
 const all=pathwayLessons(windows);assert.ok(all.findIndex(l=>l.id==='lab-06')<all.findIndex(l=>l.id==='helpdesk-plan'));
 assert.equal(helpdeskCourse.lessons.length,12);
 assert.equal(helpdeskCourse.lessons.flatMap(l=>l.steps).length,36);
 const assets=new Map(refs.map(r=>[r.id,r]));
 for(const l of helpdeskCourse.lessons){
  assert.ok(l.needs.length&&l.pass&&l.exercise&&l.quiz.length);
  assert.deepEqual(lessonSequenceFor(l.id).map(x=>x.id),helpdeskCourse.lessons.map(x=>x.id));
  for(const s of l.steps){
   const a=assets.get(s.screenshot.assetId);assert.ok(a,l.id+':'+s.title);
   assert.equal(createHash('sha256').update(fs.readFileSync('public'+a.src)).digest('hex'),a.sha256);
   assert.ok(a.source.startsWith('https://')&&a.note&&a.credit);
   assert.ok(['reference','illustration'].includes(s.screenshot.status));
  }
 }
});
test('help desk verification needs evidence checks and the correct quiz, retaining existing progress shape',()=>{
 const l=helpdeskCourse.lessons[0];
 const progress=normalizeNessusProgress({version:1,checked:[...l.steps.map((_,i)=>`${l.id}:step:${i}`),`${l.id}:exercise`],verified:[],answers:{[l.id]:l.quiz.map(q=>q.answer)}});
 assert.equal(canVerifyNessusLesson(l.id,progress),true);
 progress.checked.pop();assert.equal(canVerifyNessusLesson(l.id,progress),false);
});
test('active course commands use authoritative CloudSeam primary and migration namespaces',()=>{
 for(const file of ['content/migration/migration-lessons.generated.json','app/migration-curriculum.ts','lib/reference-check-teaching.ts','app/lab-terminal/lab-terminal.tsx']){
  const s=fs.readFileSync(file,'utf8');assert.doesNotMatch(s,/agency\.test|destination\.test|cloudscene\.tech|DC=agency,DC=test/i,file);
 }
 const c=JSON.parse(fs.readFileSync('content/migration/migration-lessons.generated.json'));
 assert.match(c.lessons.find(l=>l.id==='lab-04').body,/cloudseam\.tech/);
 assert.match(c.lessons.find(l=>l.id==='lab-08').body,/migrate\.cloudseam\.tech/);
 assert.match(c.lessons.find(l=>l.id==='mecm-02').body,/DC=cloudseam,DC=tech/);
});
