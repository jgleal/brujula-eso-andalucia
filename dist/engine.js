export const mean = values => { const a=values.filter(x=>typeof x==='number'&&Number.isFinite(x));return a.length?a.reduce((s,v)=>s+v,0)/a.length:null; };
export const round = v => v===null?null:Math.round((v+Number.EPSILON)*100)/100;
export function entriesFor(state,subject,code,period='course'){
 const grades=state.grades[subject]?.[code]||{};
 const entries=p=>{const value=grades[p];return typeof value==='number'?[{value,label:'Valoración anterior',date:'',id:'legacy-'+p,period:p}]:(value||[]).map(e=>({...e,period:p}));};
 if(period!=='course')return entries(period);
 const final=entries('final');return final.length?final:['1','2','3'].flatMap(entries);
}
export function criterionValue(state,subject,code,period='course'){
 return mean(entriesFor(state,subject,code,period).map(e=>e.value));
}
export function appendGrade(state,subject,code,period,value,label='',date=''){
 if(!['1','2','3','final'].includes(period)||!Number.isFinite(value)||value<0||value>10)throw Error('Nota o evaluación inválida.');
 state.grades[subject]??={};state.grades[subject][code]??={};
 const current=entriesFor(state,subject,code,period).map(({period,...e})=>e);
 if(current.length>=500)throw Error('Máximo de 500 notas por criterio y evaluación.');
 state.grades[subject][code][period]=[...current,{id:crypto.randomUUID(),value,label,date}];
}
export function summarize(subject,state,period='course',overrides={}){
 const values=subject.criteria.map(c=>({ ...c,value:Object.hasOwn(overrides,c.code)?overrides[c.code]:criterionValue(state,subject.id,c.code,period) }));
 const groups=[...new Set(values.map(c=>c.competency))].map(id=>{const all=values.filter(c=>c.competency===id);return {id,value:mean(all.map(c=>c.value)),done:all.filter(c=>c.value!==null).length,total:all.length};});
 const value=state.method==='criteria'?mean(values.map(c=>c.value)):mean(groups.map(c=>c.value));
 return {value,values,groups,done:values.filter(c=>c.value!==null).length,total:values.length,complete:values.length>0&&values.every(c=>c.value!==null)};
}
export function remainingTarget(subject,state,period,target){
 const current=summarize(subject,state,period);
 if(current.complete||!current.total)return null;
 const missing=current.values.filter(c=>c.value===null);
 const low=summarize(subject,state,period,Object.fromEntries(missing.map(c=>[c.code,0]))).value;
 const high=summarize(subject,state,period,Object.fromEntries(missing.map(c=>[c.code,10]))).value;
 return {needed:(target-low)/(high-low)*10,low,high,count:missing.length};
}
export function validateState(s,catalog){
 if(!s||s.version!==1||!['competencies','criteria'].includes(s.method)||!['fr','alt'].includes(s.language)||typeof s.year!=='string'||s.year.length>20||typeof s.atedu!=='string'||s.atedu.length>10000||!s.grades||typeof s.grades!=='object'||Array.isArray(s.grades))throw Error('Formato de copia no compatible.');
 const allowed=new Map(catalog.map(x=>[x.id,new Set(x.criteria.map(c=>c.code))]));
 for(const [sid,cs] of Object.entries(s.grades)){
  if(!allowed.has(sid)||!cs||typeof cs!=='object'||Array.isArray(cs))throw Error('Materia desconocida en la copia.');
  for(const [code,ps] of Object.entries(cs)){
   if(!allowed.get(sid).has(code)||!ps||typeof ps!=='object'||Array.isArray(ps))throw Error('Criterio desconocido en la copia.');
   for(const [p,v] of Object.entries(ps))if(!['1','2','3','final'].includes(p)||typeof v!=='number'||!Number.isFinite(v)||v<0||v>10)throw Error('La copia contiene una nota inválida.');
  }
 }
 return {version:1,year:s.year,method:s.method,language:s.language,atedu:s.atedu,grades:s.grades};
}
export function parseBulk(text,subject){
 const lines=text.trim().split(/[;\n]+/).map(x=>x.trim()).filter(Boolean);
 const results=[];
 for(const line of lines){
  const m=line.match(/^(?:[A-Z]+\.[1-4]\.)?(\d{1,2}\.\d{1,2})\.?\s*[:=\t ]\s*(\d+(?:[.,]\d+)?)\s*$/i);
  if(!m)throw Error('No entiendo «'+line+'». Usa el formato 1.1: 7,5.');
  const code=m[1],value=Number(m[2].replace(',','.'));
  if(!subject.criteria.some(c=>c.code===code))throw Error('El criterio '+code+' no existe en esta materia.');
  if(value<0||value>10)throw Error('Las notas deben estar entre 0 y 10.');
  results.push({code,value});
 }
 if(!results.length)throw Error('Pega al menos un criterio y su nota.');
 return results;
}
