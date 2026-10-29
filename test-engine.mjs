import assert from 'node:assert/strict';
import {mean,round,summarize,criterionValue,remainingTarget,appendGrade,entriesFor,validateState,parseBulk} from './dist/engine.js';
const subject={id:'mat',criteria:[{code:'1.1',competency:1},{code:'1.2',competency:1},{code:'1.3',competency:1},{code:'2.1',competency:2}]};
const state={version:1,year:'2026/27',language:'fr',atedu:'',method:'competencies',grades:{mat:{'1.1':{'1':6},'1.2':{'1':8},'1.3':{'1':10},'2.1':{'1':4}}}};
assert.equal(summarize(subject,state).value,6);assert.equal(summarize(subject,{...state,method:'criteria'}).value,7);
assert.equal(summarize(subject,{...state,grades:{}}).value,null);
assert.equal(summarize(subject,{...state,grades:{mat:{'1.1':{'1':0}}}}).value,0);
assert.equal(summarize(subject,state,'2').value,null);
assert.equal(criterionValue({...state,grades:{mat:{'1.1':{'1':2,'2':4,'3':6,final:0}}}},'mat','1.1'),0);
const partial={...state,grades:{mat:{'1.1':{'1':6}}}};
const needed=remainingTarget(subject,partial,'course',7);assert.ok(needed.needed>=0&&needed.needed<=10);assert.equal(round(summarize(subject,partial,'course',{'1.2':needed.needed,'1.3':needed.needed,'2.1':needed.needed}).value),7);
assert.equal(remainingTarget(subject,state,'course',7),null);
assert.deepEqual(parseBulk('1.1: 7,5; 2.1=0',subject),[{code:'1.1',value:7.5},{code:'2.1',value:0}]);
assert.throws(()=>parseBulk('1.1: 11',subject));assert.equal(parseBulk('1.1: 5;1.1:6',subject).length,2);assert.throws(()=>parseBulk('7.1:5',subject));assert.throws(()=>parseBulk('',subject));
assert.deepEqual(validateState(state,[subject]),state);
assert.throws(()=>validateState({...state,grades:{mat:{'1.1':{'1':'8'}}}},[subject]));
assert.throws(()=>validateState({...state,grades:{mat:{'1.1':{'1':-1}}}},[subject]));
assert.throws(()=>validateState({...state,grades:{unknown:{}}},[subject]));
assert.equal(round(6.125),6.13);assert.equal(mean([null,0]),0);
console.log('Calculation, missing-data, zero, period precedence, targets, import validation and bulk-input checks passed.');

const history={method:'competencies',grades:{}};
appendGrade(history,'mat','1.1','1',0,'Prueba inicial','2026-10-01');
appendGrade(history,'mat','1.1','1',10,'Trabajo','2026-10-02');
assert.equal(criterionValue(history,'mat','1.1','1'),5);
appendGrade(history,'mat','1.1','2',8);
assert.equal(criterionValue(history,'mat','1.1'),6); // all three entries, not mean of 5 and 8
assert.equal(entriesFor(history,'mat','1.1','1').length,2);
appendGrade(history,'mat','1.1','final',9);
assert.equal(criterionValue(history,'mat','1.1'),9);
assert.equal(entriesFor(history,'mat','1.1','1').length,2); // final preserves evidence
history.grades.mat['1.1'].final=[];assert.equal(criterionValue(history,'mat','1.1'),6);
history.grades.mat['1.1']['1'][0].value=6;assert.equal(criterionValue(history,'mat','1.1'),8);
history.grades.mat['1.1']['1'].splice(1,1);assert.equal(criterionValue(history,'mat','1.1'),7);
history.grades.mat['1.1']={};assert.equal(criterionValue(history,'mat','1.1'),null);
assert.throws(()=>appendGrade(history,'mat','1.1','course',5));
console.log('Multiple grades, per-period and whole-course means, final overrides, editing and deletion passed.');
