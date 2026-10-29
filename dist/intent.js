// Controlled sample geometry, not AI image interpretation.
export const PARTS={heading:'Page heading',social:'Sign-in options',fields:'Form fields',button:'Create account button',welcome:'Welcome panel'};
export function baseGeometry(v,id){
 const c=v.changes||{},h=Math.min(3,c.heading||0)*7,f=Math.min(2,c.fields||0)*5,b=Math.min(2,c.button||0)*14,w=Math.min(3,c.welcome||0)*7;
 return {heading:{x:570,y:123+h,w:300,h:54},social:{x:570,y:224,w:300,h:40},fields:{x:570,y:307,w:300,h:140+f},button:{x:570,y:455+b+f,w:300,h:72},welcome:{x:49,y:229+w,w:350,h:125}}[id];
}
export function geometry(v,id){return {...(v.layout?.[id]||baseGeometry(v,id))};}
export const textScale=(v,id)=>v.textScale?.[id]??1;
export function validTextScale(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([id,n])=>['heading','welcome'].includes(id)&&Number.isFinite(n)&&n>=.9&&n<=1.15&&Math.abs(n*20-Math.round(n*20))<.00001);}
export function revisionTextScale(intent,parent){return {...parent.textScale,...(intent.textScale!==undefined?{[intent.targetId]:intent.textScale}:{})};}
export function setTextScale(intent,n){return ['heading','welcome'].includes(intent.targetId)?{...intent,textScale:Math.round(Math.max(.9,Math.min(1.15,n))*20)/20}:intent;}
export function gapFor(intent){if(intent.targetId!=='button')return null;const fields=intent.sourceLayout.fields;return Math.round(intent.layout.button.y-fields.y-fields.h);}
export function setGap(intent,n){if(intent.targetId!=='button')return intent;const fields=intent.sourceLayout.fields;return adjustIntent(intent,{y:fields.y+fields.h+n});}
export function snapPosition(intent,values){const next={...values},r=intent.layout[intent.targetId],w=next.w??r.w;const lines=[intent.base.x];for(const [id,box] of Object.entries(intent.sourceLayout)){if(id!==intent.targetId)lines.push(box.x,box.x+box.w/2-w/2,box.x+box.w-w);}const nearest=lines.reduce((a,b)=>Math.abs(b-next.x)<Math.abs(a-next.x)?b:a,lines[0]);if(Number.isFinite(next.x)&&Math.abs(next.x-nearest)<=7)next.x=nearest;return adjustIntent(intent,next);}
const finiteBox=r=>r&&['x','y','w','h'].every(k=>Number.isFinite(r[k]))&&r.x>=0&&r.y>=0&&r.w>=20&&r.h>=15&&r.x+r.w<=961&&r.y+r.h<=601;
export function validLayout(layout){return !!layout&&typeof layout==='object'&&!Array.isArray(layout)&&Object.entries(layout).every(([id,r])=>PARTS[id]&&finiteBox(r));}
export function adjustIntent(intent,values){
 const base=intent.base,old=intent.layout[intent.targetId],next={...old,...values};
 next.w=intent.targetId==='button'?Math.max(280,Math.min(340,Math.round(next.w))):base.w;
 next.h=base.h;next.x=Math.max(20,Math.min(940-next.w,Math.round(next.x)));
 next.y=Math.max(intent.targetId==='button'?440:42,Math.min(intent.targetId==='button'?490:576-next.h,Math.round(next.y)));
 return {...intent,layout:{[intent.targetId]:next}};
}
export function makeIntent(v,targetId,reference){
 const base=geometry(v,targetId);
 return {sourceVersion:v.id,targetId,base,layout:{[targetId]:{...base}},protected:targetId==='fields'?['social']:['fields'],keepText:true,reference,sourceLayout:Object.fromEntries(Object.keys(PARTS).map(id=>[id,geometry(v,id)]))};
}
export function normalizeIntent(input,v){
 if(input?.textScale!==undefined&&(!['heading','welcome'].includes(input.targetId)||!validTextScale({[input.targetId]:input.textScale})))return null;
 if(!input||!PARTS[input.targetId]||input.sourceVersion!==v.id||!finiteBox(input.base)||!validLayout(input.layout)||Object.keys(input.layout).length!==1||!input.layout[input.targetId]||!Array.isArray(input.protected)||input.protected.length>4||new Set(input.protected).size!==input.protected.length||input.protected.some(id=>!PARTS[id]||id===input.targetId)||input.keepText!==true)return null;
 const expected=geometry(v,input.targetId);if(['x','y','w','h'].some(k=>Math.abs(expected[k]-input.base[k])>.01))return null;
 if(!validLayout(input.sourceLayout)||Object.keys(PARTS).some(id=>!input.sourceLayout[id]||['x','y','w','h'].some(k=>Math.abs(input.sourceLayout[id][k]-geometry(v,id)[k])>.01)))return null;
 const clamped=adjustIntent(input,{});if(['x','y','w','h'].some(k=>Math.abs(clamped.layout[input.targetId][k]-input.layout[input.targetId][k])>.01))return null;
 if(!input.reference||Object.keys(PARTS).some(id=>!finiteBox(input.reference[id])||typeof input.reference[id].text!=='string'||input.reference[id].text.length>1000))return null;
 return structuredClone(input);
}
export function intentSummary(intent){
 const r=intent.layout[intent.targetId],b=intent.base,parts=[];
 for(const [key,positive,negative] of [['x','right','left'],['y','down','up']]){const d=Math.round(r[key]-b[key]);if(d)parts.push(`${Math.abs(d)} px ${d>0?positive:negative}`);}
 const width=Math.round(r.w-b.w);if(width)parts.push(`${Math.abs(width)} px ${width>0?'wider':'narrower'}`);
 if(intent.targetId==='button')parts.push(`${gapFor(intent)} px gap above`);
 if(intent.textScale!==undefined)parts.push(`text size ${Math.round(intent.textScale*100)}%`);
 return `${PARTS[intent.targetId]}: ${parts.length?parts.join(', '):'keep this position'}. ${intent.protected.length?'Keep '+intent.protected.map(id=>PARTS[id].toLowerCase()).join(' and ')+' unchanged. ':''}Keep wording unchanged.`;
}
export function revisionLayout(intent,parent,flawed=false){
 const layout={...(parent.layout||{}),...structuredClone(intent.layout)};
 if(flawed&&intent.protected.length){const id=intent.protected[0],r=geometry(parent,id);layout[id]={...r,y:r.y+(r.y+r.h+12<590?12:-12)};}
 return layout;
}
export function modelMatches(intent,v){
 const goal=intent.layout[intent.targetId],actual=geometry(v,intent.targetId);
 return (intent.textScale===undefined||textScale(v,intent.targetId)===intent.textScale)&&['x','y','w','h'].every(k=>Math.abs(goal[k]-actual[k])<.5)&&intent.protected.every(id=>['x','y','w','h'].every(k=>Math.abs(geometry(v,id)[k]-intent.sourceLayout[id][k])<.5));
}
export function compareSnapshots(intent,actual,expectedTarget=null){
 const ref=intent.reference,target=intent.targetId,goal=intent.layout[target],base=intent.base,checks=[];
 const expect=expectedTarget||{x:ref[target].x+goal.x-base.x,y:ref[target].y+goal.y-base.y,w:target==='button'?ref[target].w+goal.w-base.w:ref[target].w,h:ref[target].h};
 if(!actual||Object.keys(PARTS).some(id=>!finiteBox(actual[id])||typeof actual[id].text!=='string'))return [{id:'measurement',pass:false,label:'Open Compare to measure the rendered preview.',parts:[]}];
 const position=Math.abs(actual[target].x-expect.x)<1&&Math.abs(actual[target].y-expect.y)<1;
 checks.push({id:'position',pass:position,label:position?'The selected part is where you showed it.':'The selected part is not in your intended position.',parts:position?[]:[target]});
 const size=Math.abs(actual[target].w-expect.w)<1&&Math.abs(actual[target].h-expect.h)<1;
 checks.push({id:'size',pass:size,label:size?'The selected part matches your intended size.':'The selected part has an unexpected size.',parts:size?[]:[target]});
 for(const id of intent.protected){const r=ref[id],a=actual[id],pass=['x','y','w','h'].every(k=>Math.abs(a[k]-r[k])<1)&&a.text===r.text;
  const delta=Math.round(a.y-r.y);checks.push({id:`protect-${id}`,pass,label:pass?`${PARTS[id]} stayed unchanged.`:`${PARTS[id]} ${delta?'moved '+Math.abs(delta)+' px '+(delta>0?'down':'up'):'changed'} despite your protection.`,parts:pass?[]:[id]});}
 const words=Object.keys(PARTS).every(id=>actual[id].text===ref[id].text);
 checks.push({id:'wording',pass:words,label:words?'Wording stayed unchanged.':'Wording changed outside this visual instruction.',parts:words?[]:Object.keys(PARTS).filter(id=>actual[id].text!==ref[id].text)});
 return checks;
}
export function measureSvg(svg){
 if(!svg)return null;
 try{const root=svg.getScreenCTM()?.inverse();if(!root)return null;const out={};
  for(const id of Object.keys(PARTS)){const node=svg.querySelector(`[data-component="${id}"]`);if(!node)return null;const box=node.getBBox(),matrix=node.getScreenCTM();if(!matrix)return null;
   const points=[[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix).matrixTransform(root));
   const xs=points.map(p=>p.x),ys=points.map(p=>p.y);out[id]={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),text:(node.textContent||'').replace(/\s+/g,' ').trim()};
  }return out;
 }catch{return null;}
}
