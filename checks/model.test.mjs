import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialState,transition,normalizeRegion,targetFor,agentInput,pinsFor,restoreState,TARGETS} from '../dist/model.js';
const create=(s=initialState(),extra={})=>transition(s,{type:'create',text:'Add space above this button.',region:TARGETS[3],versionId:'original',...extra});
const receive=s=>transition(s,{type:'receive',id:s.threads[0].id});
const answer=s=>transition(s,{type:'answer',id:s.threads[0].id,text:'Only this area; preserve everything else.'});
const revise=s=>transition(s,{type:'revise',id:s.threads[0].id});
const ready=()=>revise(answer(receive(create())));

test('selection coordinates stay inside the image even at its edges',()=>{
 const r=normalizeRegion({x:-.2,y:.99,w:1.5,h:.2});assert.equal(r.x,0);assert.ok(r.x+r.w<=1);assert.ok(r.y+r.h<=1);
});
test('invalid coordinates are rejected',()=>{for(const r of [null,{}, {x:NaN,y:0,w:1,h:1},{x:0,y:0,w:Infinity,h:1}])assert.equal(normalizeRegion(r),null);});
test('click-sized selections are visible and have a meaningful nearest target',()=>{const r=normalizeRegion({x:.75,y:.8,w:0,h:0});assert.equal(r.w,.02);assert.equal(targetFor(r).id,'button');});
test('empty feedback and unknown image versions cannot create threads',()=>{const s=initialState();for(const text of ['', '  ', 'ok'])assert.equal(create(s,{text}),s);assert.equal(create(s,{versionId:'missing'}),s);});
test('human feedback and agent input share the exact region, note and source version',()=>{const s=create();const input=agentInput(s,'feedback-1');assert.equal(input.feedback,s.threads[0].text);assert.deepEqual(input.region,s.threads[0].region);assert.equal(input.imageVersion,'original');assert.equal(input.threadId,s.threads[0].id);assert.equal(input.scope,null);});
test('selections are copied so external changes do not move the pin',()=>{const region={x:.1,y:.2,w:.3,h:.2};const s=create(initialState(),{region});region.x=.8;assert.equal(s.threads[0].region.x,.1);});
test('the agent asks before a revision can be produced',()=>{const s=create();assert.equal(revise(s),s);assert.equal(answer(s),s);assert.equal(receive(s).threads[0].phase,'question');});
test('human direction becomes part of the agent context',()=>{const s=answer(receive(create()));assert.equal(s.threads[0].phase,'working');assert.equal(agentInput(s,'feedback-1').scope,'Only this area; preserve everything else.');});
test('empty clarifications do not advance work',()=>{const s=receive(create());assert.equal(transition(s,{type:'answer',id:'feedback-1',text:' '}),s);});
test('sample revision creates a new image version without changing source pixels or pins',()=>{const s=ready();assert.equal(s.versions.length,2);assert.deepEqual(s.versions[0].changes,{});assert.equal(s.versions[1].changes.button,1);assert.equal(s.threads[0].versionId,'original');assert.equal(s.threads[0].revisionId,'revision-1');assert.equal(pinsFor(s,'original').length,1);assert.equal(pinsFor(s,'revision-1').length,0);});
test('different selected areas produce different preset spacing changes',()=>{const s=revise(answer(receive(create(initialState(),{region:TARGETS[0]}))));assert.equal(s.versions[1].changes.heading,1);assert.equal(s.versions[1].changes.button,undefined);});
test('only a feedback thread with a revision can be resolved',()=>{let s=create();assert.equal(transition(s,{type:'resolve',id:'feedback-1'}),s);s=ready();assert.equal(transition(s,{type:'resolve',id:'feedback-1'}).threads[0].phase,'resolved');});
test('reopening retains source and revision history and requires another exchange',()=>{const s=transition(ready(),{type:'resolve',id:'feedback-1'});const r=transition(s,{type:'reopen',id:'feedback-1',text:'Please increase that gap further.'});assert.equal(r.threads[0].phase,'sent');assert.equal(r.threads[0].versionId,'original');assert.equal(r.threads[0].revisionId,'revision-1');assert.equal(r.threads[0].scope,null);const second=revise(answer(receive(r)));assert.equal(second.versions[2].parentId,'revision-1');assert.equal(second.versions[2].changes.button,2);});
test('feedback on a revision remains pinned to that revision',()=>{const s=create(ready(),{versionId:'revision-1',region:TARGETS[0]});assert.equal(pinsFor(s,'revision-1')[0].id,'feedback-2');assert.equal(pinsFor(s,'original').length,1);});
test('editing unreviewed feedback keeps its pin and requests a fresh agent response',()=>{const s=receive(create());const r=transition(s,{type:'edit',id:'feedback-1',text:'Keep the button but add a larger gap.'});assert.equal(r.threads[0].phase,'sent');assert.equal(r.threads[0].messages.length,1);assert.deepEqual(r.threads[0].region,s.threads[0].region);});
test('deleting one pending note leaves other threads intact and never reuses IDs',()=>{const s=create(create());const r=transition(s,{type:'delete',id:'feedback-1'});assert.equal(r.threads.length,1);assert.equal(create(r).threads.at(-1).id,'feedback-3');assert.equal(transition(ready(),{type:'delete',id:'feedback-1'}).threads.length,1);});
test('transitions do not mutate prior state',()=>{const s=create();const snapshot=JSON.stringify(s);receive(s);assert.equal(JSON.stringify(s),snapshot);});
test('valid source versions and conversations restore across reloads',()=>{for(const s of [initialState(),create(),receive(create()),answer(receive(create())),ready(),transition(ready(),{type:'resolve',id:'feedback-1'})])assert.deepEqual(restoreState(JSON.stringify(s)),s);});
test('invalid storage, dangling image references and duplicate IDs reset safely',()=>{assert.deepEqual(restoreState('broken'),initialState());const s=ready();s.threads[0].versionId='missing';assert.deepEqual(restoreState(s),initialState());const d=create();d.threads.push({...d.threads[0]});assert.deepEqual(restoreState(d),initialState());});
test('injected target names and invalid saved regions are not trusted',()=>{const s=create();s.threads[0].targetLabel='<script>';assert.deepEqual(restoreState(s),initialState());const r=create();r.threads[0].region.x=5;assert.deepEqual(restoreState(r),initialState());});
test('reset returns a clean demo',()=>{assert.deepEqual(transition(ready(),{type:'reset'}),initialState());});
test('deployment still serves the existing static output without dependencies',async()=>{const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));assert.equal(config.outputDirectory,'dist');for(const file of ['index.html','styles.css','app.js','model.js','logo.svg'])assert.ok((await readFile(new URL('../dist/'+file,import.meta.url),'utf8')).length);});

test('allowing surrounding layout changes creates a different revision from area-only feedback',()=>{const s=receive(create());const area=revise(transition(s,{type:'answer',id:'feedback-1',text:'Only this area.',mode:'area'}));const layout=revise(transition(s,{type:'answer',id:'feedback-1',text:'Adjust surrounding layout too.',mode:'layout'}));assert.deepEqual(area.versions[1].changes,{button:1});assert.deepEqual(layout.versions[1].changes,{button:1,fields:1});});
