// Shared annotation records drive both the human view and simulated agent input.
export const STORE_KEY='ziki-point-and-reply-v1';
export const TARGETS=[
  {id:'heading',label:'Page heading',x:.59,y:.21,w:.31,h:.13},
  {id:'social',label:'Sign-in options',x:.59,y:.37,w:.31,h:.09},
  {id:'fields',label:'Form fields',x:.59,y:.53,w:.31,h:.19},
  {id:'button',label:'Create account button',x:.59,y:.755,w:.31,h:.075},
  {id:'welcome',label:'Welcome panel',x:.05,y:.30,w:.36,h:.31},
];
export const initialState=()=>({schema:1,threads:[],versions:[{id:'original',label:'Original',parentId:null,changes:{}}],nextId:1});
export function normalizeRegion(region){
  if(!region||!['x','y','w','h'].every(k=>Number.isFinite(region[k])))return null;
  const x=Math.max(0,Math.min(.98,region.x)),y=Math.max(0,Math.min(.98,region.y));
  return {x,y,w:Math.min(1-x,Math.max(.02,region.w)),h:Math.min(1-y,Math.max(.02,region.h))};
}
export function targetFor(region){
  const cx=region.x+region.w/2,cy=region.y+region.h/2;
  return TARGETS.reduce((best,t)=>Math.hypot(cx-t.x-t.w/2,cy-t.y-t.h/2)<Math.hypot(cx-best.x-best.w/2,cy-best.y-best.h/2)?t:best,TARGETS[0]);
}
export function agentInput(state,id){
  const t=state.threads.find(t=>t.id===id);if(!t)return null;
  return {issueId:107,attachmentId:'signup-sample',imageVersion:t.versionId,latestRevision:t.revisionId||null,region:{...t.region},areaLabel:t.targetLabel,feedback:t.text,threadId:t.id,scope:t.scope||null,scopeMode:t.scopeMode||null};
}
const clean=value=>typeof value==='string'?value.trim().slice(0,1500):'';
export function transition(state,event){
  if(event.type==='reset')return initialState();
  if(event.type==='create'){
    const text=clean(event.text),region=normalizeRegion(event.region);
    if(text.length<3||!region||state.threads.length>=30||!state.versions.some(v=>v.id===event.versionId))return state;
    const target=targetFor(region),id=`feedback-${state.nextId}`;
    return {...state,nextId:state.nextId+1,threads:[...state.threads,{id,number:state.nextId,region,versionId:event.versionId,targetId:target.id,targetLabel:target.label,text,phase:'sent',scope:null,scopeMode:null,revisionId:null,messages:[{role:'human',text}]}]};
  }
  const thread=state.threads.find(t=>t.id===event.id);if(!thread)return state;
  let next={...thread},versions=state.versions;
  if(event.type==='receive'&&thread.phase==='sent'){
    next.phase='question';next.messages=[...thread.messages,{role:'agent',text:`I’ve linked your note to ${thread.targetLabel.toLowerCase()}. How much of the layout may I adjust?`}];
  }else if(event.type==='edit'&&['sent','question'].includes(thread.phase)){
    const text=clean(event.text);if(text.length<3)return state;
    next.text=text;next.messages=[{role:'human',text}];next.phase='sent';
  }else if(event.type==='answer'&&thread.phase==='question'){
    const scope=clean(event.text);if(scope.length<3)return state;
    next.scope=scope;next.scopeMode=['area','layout'].includes(event.mode)?event.mode:'custom';next.phase='working';next.messages=[...thread.messages,{role:'human',text:scope}];
  }else if(event.type==='revise'&&thread.phase==='working'){
    if(versions.length>=50)return state;
    const parent=versions.find(v=>v.id===(thread.revisionId||thread.versionId));
    const id=`revision-${versions.length}`,changes={...parent.changes};
    changes[thread.targetId]=(changes[thread.targetId]||0)+1;
    if(thread.scopeMode==='layout'){const neighbour={heading:'social',social:'heading',fields:'button',button:'fields',welcome:'heading'}[thread.targetId];changes[neighbour]=(changes[neighbour]||0)+1;}
    versions=[...versions,{id,label:`Revision ${versions.length}`,parentId:parent.id,changes,threadId:thread.id}];
    next.revisionId=id;next.phase='ready';
    next.messages=[...thread.messages,{role:'agent',text:`The sample revision is ready. It demonstrates a spacing adjustment around ${thread.targetLabel.toLowerCase()}. Compare the images against your note, then tell me if it addresses your feedback.`,revisionId:id}];
  }else if(event.type==='resolve'&&thread.phase==='ready'){
    next.phase='resolved';next.messages=[...thread.messages,{role:'human',text:'Marked this feedback resolved.'}];
  }else if(event.type==='reopen'&&['ready','resolved'].includes(thread.phase)){
    const text=clean(event.text);if(text.length<3)return state;
    next.phase='sent';next.scope=null;next.scopeMode=null;next.messages=[...thread.messages,{role:'human',text}];next.text=text;
  }else if(event.type==='delete'&&['sent','question'].includes(thread.phase)&&!thread.revisionId){
    return {...state,threads:state.threads.filter(t=>t.id!==thread.id)};
  }else return state;
  return {...state,versions,threads:state.threads.map(t=>t.id===thread.id?next:t)};
}
export function pinsFor(state,versionId){return state.threads.filter(t=>t.versionId===versionId);}
export function restoreState(raw){
  try{
    const s=typeof raw==='string'?JSON.parse(raw):raw;
    if(!s||s.schema!==1||!Array.isArray(s.threads)||!Array.isArray(s.versions)||s.threads.length>30||s.versions.length>50||!Number.isSafeInteger(s.nextId)||s.nextId<1)return initialState();
    const phases=['sent','question','working','ready','resolved'],ids=new Set();
    if(s.versions[0]?.id!=='original')return initialState();
    for(const v of s.versions){
      if(!/^(original|revision-\d+)$/.test(v.id)||ids.has(v.id)||typeof v.label!=='string'||v.label.length>40||!v.changes||typeof v.changes!=='object'||(v.parentId!==null&&!ids.has(v.parentId)))return initialState();
      if(Object.entries(v.changes).some(([k,n])=>!TARGETS.some(t=>t.id===k)||!Number.isInteger(n)||n<1||n>50))return initialState();ids.add(v.id);
    }
    const threadIds=new Set();
    for(const t of s.threads){
      const r=normalizeRegion(t.region);
      if(!/^feedback-\d+$/.test(t.id)||threadIds.has(t.id)||!Number.isInteger(t.number)||t.number<1||t.number>=s.nextId||t.id!==`feedback-${t.number}`||!r||Object.keys(r).some(k=>Math.abs(r[k]-t.region[k])>.00001)||!ids.has(t.versionId)||!phases.includes(t.phase)||!TARGETS.some(x=>x.id===t.targetId&&x.label===t.targetLabel)||clean(t.text)!==t.text||t.text.length<3||!Array.isArray(t.messages)||t.messages.length>200)return initialState();
      if(t.messages.some(m=>!['agent','human'].includes(m.role)||typeof m.text!=='string'||m.text.length>1800||(m.revisionId&&!ids.has(m.revisionId))))return initialState();
      if(t.revisionId&&!ids.has(t.revisionId))return initialState();
      if(['ready','resolved'].includes(t.phase)&&!t.revisionId)return initialState();
      if(t.scopeMode!==null&&!['area','layout','custom'].includes(t.scopeMode))return initialState();
      if(t.scope!==null&&(typeof t.scope!=='string'||t.scope.length>1500))return initialState();threadIds.add(t.id);
    }
    return s;
  }catch{return initialState();}
}
