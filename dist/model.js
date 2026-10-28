export const STORAGE_KEY = 'ziki-understanding-demo-v1';
export const checks = ['goal', 'scope', 'evidence'];
export function initialState() {
  return {phase:'request', version:1, corrections:[], confirmed:[], approvedVersion:null, approvalMode:null};
}
export function canConfirm(state) {
  return state.phase === 'revised' && checks.every(check => state.confirmed.includes(check));
}
export function transition(state, action) {
  switch(action.type) {
    case 'correct': {
      const text = String(action.text || '').trim().slice(0,1000);
      if(text.length < 8) return state;
      return {...state, phase:'rechecking', confirmed:[], approvedVersion:null, approvalMode:null,
        corrections:[...state.corrections,{text,kind:['scope','evidence','constraint'].includes(action.kind)?action.kind:'constraint'}]};
    }
    case 'recheck':
      return state.phase === 'rechecking' ? {...state,phase:'revised',version:state.version+1,confirmed:[],approvedVersion:null,approvalMode:null} : state;
    case 'check':
      if(state.phase !== 'revised' || !checks.includes(action.name)) return state;
      return {...state,confirmed:action.checked ? [...new Set([...state.confirmed,action.name])] : state.confirmed.filter(name=>name!==action.name)};
    case 'agree': return canConfirm(state) ? {...state,phase:'agreed'} : state;
    case 'approve': return ['request','revised','agreed'].includes(state.phase) ? {...state,phase:'working',approvedVersion:state.version,approvalMode:state.phase==='agreed'?'reviewed':'direct'} : state;
    case 'pause': return state.phase==='working' ? transition(state,{type:'correct',kind:'scope',text:state.version===1?'Pause this plan. Removing fields and changing validation is outside the layout-only scope.':'Pause the approved work and re-evaluate the current plan against my constraints.'}) : state;
    case 'complete': return state.phase === 'working' && state.approvedVersion === state.version ? {...state,phase:'delivered'} : state;
    case 'reopen': return state.phase === 'delivered' ? transition(state,{type:'correct',kind:'evidence',text:state.version===1?'The simulated result changed signup behaviour. Re-check the layout-only goal and preserve all fields and validation.':'Please re-check the sample result and its remaining unverified behaviour before any further work.'}) : state;
    case 'reset': return initialState();
    default: return state;
  }
}
export function restoreState(value) {
  try {
    const saved=JSON.parse(value);
    if(!saved || !['request','rechecking','revised','agreed','working','delivered'].includes(saved.phase) ||
       !Number.isInteger(saved.version) || saved.version<1 || saved.version>10000 ||
       !Array.isArray(saved.corrections) || saved.corrections.length>100 ||
       !saved.corrections.every(item=>item && typeof item.text==='string' && item.text.length<=1000 && ['scope','evidence','constraint'].includes(item.kind)) ||
       !Array.isArray(saved.confirmed) || !saved.confirmed.every(item=>checks.includes(item))) return initialState();
    if(['working','delivered'].includes(saved.phase) && saved.approvedVersion!==saved.version) return initialState();
    const active=['working','delivered'].includes(saved.phase);
    const mode=saved.approvalMode ?? (active && checks.every(item=>saved.confirmed.includes(item))?'reviewed':null);
    if(![null,'direct','reviewed'].includes(mode)) return initialState();
    if(active && !mode) return initialState();
    if((saved.phase==='agreed'||(active&&mode==='reviewed')) && !checks.every(item=>saved.confirmed.includes(item))) return initialState();
    return {phase:saved.phase,version:saved.version,corrections:saved.corrections,confirmed:[...new Set(saved.confirmed)],approvedVersion:active?saved.version:null,approvalMode:active?mode:null};
  } catch {return initialState();}
}
