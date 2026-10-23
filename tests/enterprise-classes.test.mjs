import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {learningPathways,pathwayLessons,lessonSequenceFor} from '../app/learning-pathways.ts';
import {mecmCourse,wsusCourse,guidedCourseHref} from '../lib/guided-courses.ts';
import {normalizeNessusProgress,canVerifyNessusLesson} from '../lib/nessus-progress.ts';
import refs from '../content/enterprise/references.json' with {type:'json'};
import core from '../content/screenshots/interface-references.json' with {type:'json'};

test('AD, WSUS, MECM and IIS have independent classes without duplicate lesson IDs',()=>{
 const all=learningPathways.flatMap(pathwayLessons);assert.equal(new Set(all.map(l=>l.id)).size,all.length);
 const ids=id=>pathwayLessons(learningPathways.find(p=>p.id===id)).map(l=>l.id);
 assert.deepEqual(ids('active-directory'),['lab-04','lab-07','lab-05']);
 assert.ok(ids('wsus').includes('lab-13'));assert.ok(ids('mecm').includes('mecm-01'));
 assert.ok(ids('windows').every(id=>!id.startsWith('mecm-')&&id!=='lab-13'&&id!=='lab-04'&&id!=='lab-07'));
 assert.ok(lessonSequenceFor('mecm-01').every(l=>ids('mecm').includes(l.id)));
 assert.ok(lessonSequenceFor('lab-13').every(l=>ids('wsus').includes(l.id)));
});
test('operations lessons have actionable steps, attributed images and evidence-gated verification',()=>{
 const assets=new Map([...refs,...core.assets].map(a=>[a.id,a]));
 for(const course of [mecmCourse,wsusCourse]){
  assert.equal(guidedCourseHref(course.id),course===mecmCourse?'/mecm':'/wsus');
  for(const lesson of course.lessons){
   assert.ok(lesson.steps.length>=3&&lesson.pass&&lesson.exercise&&lesson.quiz.length>=2);
   for(const s of lesson.steps){assert.ok(s.where&&s.actions.length>=3&&s.expected&&s.sources.length);assert.equal(s.screenshot.status,'reference');const a=assets.get(s.screenshot.assetId);assert.ok(a,lesson.id+':'+s.title);assert.equal(createHash('sha256').update(fs.readFileSync('public'+a.src)).digest('hex'),a.sha256);}
   const progress=normalizeNessusProgress({version:1,checked:[...lesson.steps.map((_,i)=>`${lesson.id}:step:${i}`),`${lesson.id}:exercise`],verified:[],answers:{[lesson.id]:lesson.quiz.map(q=>q.answer)}});
   assert.equal(canVerifyNessusLesson(lesson.id,progress),true);progress.checked.pop();assert.equal(canVerifyNessusLesson(lesson.id,progress),false);
  }
 }
});
test('deployment and compliance exercises constrain the first change to a disposable pilot',()=>{
 const app=mecmCourse.lessons.find(l=>l.id==='mecm-ops-app');assert.match(JSON.stringify(app),/Purpose = Available/);assert.match(JSON.stringify(app),/LAB-Pilot-Devices/);assert.match(JSON.stringify(app),/Uninstall/);
 const compliance=mecmCourse.lessons.find(l=>l.id==='mecm-ops-compliance');assert.match(JSON.stringify(compliance),/remediation disabled/);
 assert.match(wsusCourse.prerequisite,/standalone/);assert.match(JSON.stringify(wsusCourse),/does not uninstall an update/);
});
