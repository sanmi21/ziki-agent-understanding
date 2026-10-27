export const STORAGE_KEY = 'ziki-understanding-demo-v1';
export const checks = ['goal', 'scope', 'evidence'];
export function initialState() {
  return {phase:'request', version:1, corrections:[], confirmed:[], approvedVersion:null};
}
export function canConfirm(state) {
  return state.phase === 'revised' && checks.every(check => state.confirmed.includes(check));
}
export function transition(state, action) {
  switch(action.type) {
    case 'correct': {
      const text = String(action.text || '').trim().slice(0,1000);
      if(text.length < 8) return state;
      return {...state, phase:'rechecking', confirmed:[], approvedVersion:null,
        corrections:[...state.corrections,{text,kind:['scope','evidence','constraint'].includes(action.kind)?action.kind:'constraint'}]};
    }
    case 'recheck':
      return state.phase === 'rechecking' ? {...state,phase:'revised',version:state.version+1,confirmed:[],approvedVersion:null} : state;
    case 'check':
      if(state.phase !== 'revised' || !checks.includes(action.name)) return state;
      return {...state,confirmed:action.checked ? [...new Set([...state.confirmed,action.name])] : state.confirmed.filter(name=>name!==action.name)};
    case 'agree': return canConfirm(state) ? {...state,phase:'agreed'} : state;
    case 'approve': return state.phase === 'agreed' ? {...state,phase:'working',approvedVersion:state.version} : state;
    case 'complete': return state.phase === 'working' && state.approvedVersion === state.version ? {...state,phase:'delivered'} : state;
    case 'reopen': return state.phase === 'delivered' ? {...state,phase:'rechecking',confirmed:[],approvedVersion:null} : state;
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
    if(['agreed','working','delivered'].includes(saved.phase) && !checks.every(item=>saved.confirmed.includes(item))) return initialState();
    return {phase:saved.phase,version:saved.version,corrections:saved.corrections,confirmed:[...new Set(saved.confirmed)],approvedVersion:saved.approvedVersion===saved.version?saved.version:null};
  } catch {return initialState();}
}
