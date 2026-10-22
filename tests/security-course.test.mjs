import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {securityCourse} from '../lib/guided-courses.ts';
import {learningPathways,lessonSequenceFor,pathwayLessons} from '../app/learning-pathways.ts';
import {normalizeNessusProgress,canVerifyNessusLesson} from '../lib/nessus-progress.ts';
import {estimateSecurityBudget} from '../lib/security-budget.ts';
import references from '../content/security/references.json' with {type:'json'};

test('security course keeps every class, separate reader and correctly labeled visual',()=>{
 assert.equal(securityCourse.lessons.length,15);
 assert.equal(securityCourse.lessons.flatMap(l=>l.steps).length,48);
 const azure=learningPathways.find(p=>p.id==='azure');
 const all=pathwayLessons(azure).filter(l=>l.source==='security-lab');
 assert.deepEqual(all.map(l=>l.id),securityCourse.lessons.map(l=>l.id));
 assert.ok(all.every(l=>l.href===`/security#lesson=${l.id}`));
 const optional=azure.sections.find(s=>s.title.includes('Optional Licensed Cloud VDI'));
 assert.equal(optional.optional,true);assert.equal(optional.lessons.length,3);
 const assets=new Map(references.map(r=>[r.id,r]));
 for(const l of securityCourse.lessons){
  assert.deepEqual(lessonSequenceFor(l.id).map(x=>x.id),all.map(x=>x.id));
  assert.ok(l.needs.length&&l.exercise&&l.pass&&l.quiz.length);
  for(const s of l.steps){const a=assets.get(s.screenshot.assetId);assert.ok(a,l.id+':'+s.title);assert.ok(a.credit&&a.note&&a.source.startsWith('https://'));assert.equal(createHash('sha256').update(fs.readFileSync('public'+a.src)).digest('hex'),a.sha256);assert.ok(['illustration','reference'].includes(s.screenshot.status));}
 }
});
test('portal activation teaches Plan 2 default, Plan 1 selection, effective scope and real verification',()=>{
 const enable=securityCourse.lessons.find(l=>l.id==='sec-defender');
 const all=enable.steps.flatMap(s=>s.actions).join(' ');
 assert.match(all,/Plan 2/);assert.match(all,/Change plans/);assert.match(all,/choose Plan 1/);assert.match(all,/Confirm/);assert.match(all,/Save/);assert.match(all,/including future additions/);
 assert.match(all,/does not license Windows 11/);
 const verify=securityCourse.lessons.find(l=>l.id==='sec-endpoint').steps.flatMap(s=>s.actions).join(' ');
 assert.match(verify,/not successful onboarding/);assert.match(verify,/corresponding test alert/);
 const cleanup=securityCourse.lessons.find(l=>l.id==='sec-cleanup').steps.flatMap(s=>s.actions).join(' ');
 assert.match(cleanup,/resource-level overrides/);assert.match(cleanup,/separately/);assert.match(cleanup,/next invoice/);
});
test('security progress cannot award a new unperformed class',()=>{
 const l=securityCourse.lessons[0];
 const p=normalizeNessusProgress({version:1,checked:[],verified:[l.id],answers:{}});
 assert.equal(p.verified.includes(l.id),false);assert.equal(canVerifyNessusLesson(l.id,p),false);
 const done=normalizeNessusProgress({version:1,checked:[...l.steps.map((_,i)=>`${l.id}:step:${i}`),`${l.id}:exercise`],verified:[],answers:{[l.id]:l.quiz.map(q=>q.answer)}});
 assert.equal(canVerifyNessusLesson(l.id,done),true);
});
test('budget worksheet requires explicit rates and includes licenses and persistent costs',()=>{
 assert.equal(estimateSecurityBudget({licenses:'',hourly:'0',hours:'0',persistent:'0',security:'0'}),null);
 assert.equal(estimateSecurityBudget({licenses:'0',hourly:'0',hours:'0',persistent:'0',security:'0'}),0);
 assert.equal(estimateSecurityBudget({licenses:'22.55',hourly:'0.10',hours:'40',persistent:'5',security:'3'}),34.55);
 assert.equal(estimateSecurityBudget({licenses:'0',hourly:'-1',hours:'40',persistent:'5',security:'3'}),null);
 assert.equal(estimateSecurityBudget({licenses:'0',hourly:'NaN',hours:'40',persistent:'5',security:'3'}),null);
});
