import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialState,transition,canConfirm,restoreState,checks} from '../dist/model.js';
const correct=state=>transition(state,{type:'correct',text:'Keep all fields and validation. Only change layout.',kind:'scope'});
function revised(){return transition(correct(initialState()),{type:'recheck'});}
function agreed(){let state=revised();for(const name of checks)state=transition(state,{type:'check',name,checked:true});return transition(state,{type:'agree'});}

test('original proposal cannot be authorized or completed directly',()=>{
  const state=initialState();
  for(const type of ['approve','agree','complete','recheck'])assert.equal(transition(state,{type}),state);
});
test('a correction pauses work and records the exact human direction',()=>{
  const text='Keep signup validation. Layout only.';
  const state=transition(initialState(),{type:'correct',text,kind:'scope'});
  assert.equal(state.phase,'rechecking');assert.equal(state.corrections[0].text,text);assert.equal(state.approvedVersion,null);
});
test('empty and short corrections do not advance the workflow',()=>{
  const state=initialState();for(const text of ['', '  ', 'fix'])assert.equal(transition(state,{type:'correct',text}),state);
});
test('corrections are limited and unknown kinds normalize to constraints',()=>{
  const state=transition(initialState(),{type:'correct',text:'x'.repeat(2000),kind:'approve'});
  assert.equal(state.corrections[0].text.length,1000);assert.equal(state.corrections[0].kind,'constraint');
});
test('rechecking increments the plan version and never grants approval',()=>{
  const state=revised();assert.equal(state.version,2);assert.equal(state.phase,'revised');assert.equal(state.approvedVersion,null);
});
test('all three checks are required to confirm understanding',()=>{
  let state=revised();
  for(const name of checks.slice(0,2))state=transition(state,{type:'check',name,checked:true});
  assert.equal(canConfirm(state),false);assert.equal(transition(state,{type:'agree'}),state);
  state=transition(state,{type:'check',name:'evidence',checked:true});assert.equal(canConfirm(state),true);
});
test('unchecking a constraint blocks confirmation again',()=>{
  let state=revised();for(const name of checks)state=transition(state,{type:'check',name,checked:true});
  state=transition(state,{type:'check',name:'scope',checked:false});assert.equal(canConfirm(state),false);
});
test('agreement is separate from permission to work',()=>{
  const state=agreed();assert.equal(state.phase,'agreed');assert.equal(state.approvedVersion,null);
  const approved=transition(state,{type:'approve'});assert.equal(approved.phase,'working');assert.equal(approved.approvedVersion,2);
});
test('correction of an approved plan invalidates approval and checks',()=>{
  const approved=transition(agreed(),{type:'approve'});const state=correct(approved);
  assert.equal(state.phase,'rechecking');assert.equal(state.approvedVersion,null);assert.deepEqual(state.confirmed,[]);
  assert.equal(transition(state,{type:'complete'}),state);
});
test('completion requires a current approved version',()=>{
  const approved=transition(agreed(),{type:'approve'});
  assert.equal(transition(approved,{type:'complete'}).phase,'delivered');
  const stale={...approved,approvedVersion:1};assert.equal(transition(stale,{type:'complete'}),stale);
});
test('reopening a result pauses further action and clears prior authorization',()=>{
  const done=transition(transition(agreed(),{type:'approve'}),{type:'complete'});
  const state=transition(done,{type:'reopen'});assert.equal(state.phase,'rechecking');assert.equal(state.approvedVersion,null);
});
test('repeat correction retains history and requires a new version',()=>{
  const state=transition(correct(revised()),{type:'recheck'});
  assert.equal(state.version,3);assert.equal(state.corrections.length,2);assert.equal(state.phase,'revised');
});
test('reset clears demo corrections and approvals',()=>{
  assert.deepEqual(transition(agreed(),{type:'reset'}),initialState());
});
test('valid tab state restores without changing its plan',()=>{
  const state=transition(agreed(),{type:'approve'});assert.deepEqual(restoreState(JSON.stringify(state)),state);
});
test('broken, unexpected, or stale storage resets safely',()=>{
  for(const value of ['',null,'null','{bad}',JSON.stringify({phase:'hacked'}),JSON.stringify({...agreed(),version:-1}),JSON.stringify({...agreed(),phase:'working',approvedVersion:1}),JSON.stringify({...agreed(),phase:'working',approvedVersion:2,confirmed:[]})])assert.deepEqual(restoreState(value),initialState());
});
test('public demo assets exist and Vercel serves only the static output',async()=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  for(const asset of ['app.js','styles.css','logo.svg']){assert.ok(html.includes(asset));await readFile(new URL('../dist/'+asset,import.meta.url));}
  const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));assert.equal(config.outputDirectory,'dist');assert.equal(config.buildCommand,'');
});
