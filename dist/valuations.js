// Normalize legacy values without losing zeros; reject malformed imported histories.
export function validateEntries(raw){
 const rows=typeof raw==='number'?[{id:'legacy',value:raw,label:'Valoración anterior',date:''}]:raw;
 if(!Array.isArray(rows)||rows.length>500)throw Error('Historial de notas inválido.');
 const ids=new Set();
 return rows.map(e=>{
  if(!e||typeof e!=='object'||typeof e.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(e.id)||ids.has(e.id)||typeof e.value!=='number'||!Number.isFinite(e.value)||e.value<0||e.value>10||typeof e.label!=='string'||e.label.length>150||typeof e.date!=='string'||(e.date!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||Number.isNaN(Date.parse(e.date))||new Date(e.date).toISOString().slice(0,10)!==e.date)))throw Error('La copia contiene una valoración inválida.');
  ids.add(e.id);return {id:e.id,value:e.value,label:e.label,date:e.date};
 });
}
