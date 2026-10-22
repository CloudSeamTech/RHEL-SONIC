import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {landingZoneCourse,guidedCourseHref} from '../lib/guided-courses.ts';
import {learningPathways,pathwayLessons,lessonSequenceFor} from '../app/learning-pathways.ts';
import {normalizeNessusProgress,canVerifyNessusLesson} from '../lib/nessus-progress.ts';
import refs from '../content/landing-zone/references.json' with {type:'json'};

test('landing zone follows a build, data, recovery sequence with truthful visuals',()=>{
 const ids=['lz-plan','lz-group','lz-network','lz-storage','lz-data','lz-recover'];
 assert.deepEqual(landingZoneCourse.lessons.map(l=>l.id),ids);
 assert.equal(guidedCourseHref(landingZoneCourse.id),'/landing-zone');
 const links=pathwayLessons(learningPathways.find(p=>p.id==='azure')).filter(l=>l.source==='landing-zone');
 assert.deepEqual(links.map(l=>l.id),ids);
 for(const lesson of landingZoneCourse.lessons){
  assert.deepEqual(lessonSequenceFor(lesson.id).map(l=>l.id),ids);
  assert.ok(lesson.needs.length&&lesson.quiz.length&&lesson.pass&&lesson.exercise);
  for(const step of lesson.steps){
   assert.ok(step.where&&step.actions.length&&step.expected);
   const asset=refs.find(a=>a.id===step.screenshot.assetId);assert.ok(asset,step.title);
   assert.ok(['reference','illustration'].includes(step.screenshot.status));
   assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
   if(step.screenshot.status==='illustration')assert.match(asset.note,/not.*screenshot/i);
  }
 }
});
test('landing zone distinguishes learning scope, permissions, network privacy and cost controls',()=>{
 const text=JSON.stringify(landingZoneCourse);
 for(const pattern of [/not a production/,/not a hard cap/,/Storage Blob Data Contributor/,/up to 30 minutes/,/does not mean a private network endpoint/,/group tags do not automatically/,/not a separate backup/,/subscription-level Defender/])assert.match(text,pattern);
 assert.equal(landingZoneCourse.lessons.flatMap(l=>l.steps).length,21);
 const csv=readFileSync('public/landing-zone/cloudseam-inventory.csv','utf8').trim().split(/\r?\n/);
 assert.equal(csv.length,4);assert.match(csv[0],/device_name/);
});
test('landing zone progress requires checked steps, exercise and a passing quiz',()=>{
 const l=landingZoneCourse.lessons[0];
 assert.equal(canVerifyNessusLesson(l.id,normalizeNessusProgress({version:1,checked:[],verified:[l.id],answers:{}})),false);
 const progress=normalizeNessusProgress({version:1,checked:[...l.steps.map((_,i)=>`${l.id}:step:${i}`),`${l.id}:exercise`],verified:[],answers:{[l.id]:l.quiz.map(q=>q.answer)}});
 assert.equal(canVerifyNessusLesson(l.id,progress),true);
});
