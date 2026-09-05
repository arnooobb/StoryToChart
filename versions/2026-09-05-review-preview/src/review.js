/* Review drafts are isolated from the live chart until Apply is chosen. */
(function(root){
'use strict';
const C=ChartCore,$=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kinds=['entities','relationships','events','passages'];
const linkTypes=['association','family','employment','ownership','meeting','communication','payment','benefit','contract','transaction'];
let draft=null,excluded=null,tab='entities',onApply=null,submitting=false;
const dialog=$('#review-dialog'),form=$('#review-form'),content=$('#review-content');
const input=(label,field,value='',type='text')=>`<label class="field"><span>${esc(label)}</span><input data-field="${field}" type="${type}" value="${esc(value)}" ${type==='number'?'min="0" step="any"':''}></label>`;
const select=(label,field,values,value)=>`<label class="field"><span>${esc(label)}</span><select data-field="${field}">${values.map(v=>{const id=typeof v==='string'?v:v.id,name=typeof v==='string'?v:v.name;return `<option value="${esc(id)}" ${id===value?'selected':''}>${esc(name)}</option>`;}).join('')}</select></label>`;
const source=(s,open)=>`<details class="review-source" ${open?'open':''}><summary>Source wording</summary><p>${esc(s||'No source excerpt recorded for this item.')}</p></details>`;
function availableEntities(){return draft.graph.entities.filter(n=>!excluded.entities.has(n.id));}
function blocked(r){return excluded.entities.has(r.source)||excluded.entities.has(r.target);}
function kept(kind,item){return !excluded[kind].has(item.id)&&(kind!=='relationships'||!blocked(item));}
function summary(){
 for(const kind of kinds){const button=$(`[data-review-tab="${kind}"]`);const count=kind==='passages'?(draft.extraction?.warnings||[]).length:draft.graph[kind].filter(v=>kept(kind,v)).length;button.querySelector('span').textContent=count;button.setAttribute('aria-selected',String(tab===kind));button.tabIndex=tab===kind?0:-1;}
 const n=availableEntities().length,r=draft.graph.relationships.filter(v=>kept('relationships',v)).length,e=draft.graph.events.filter(v=>kept('events',v)).length;
 const removed=draft.graph.entities.length+draft.graph.relationships.length+draft.graph.events.length-n-r-e;
 $('#review-selection').textContent=`Apply ${n} entities, ${r} relationships and ${e} events${removed?` · ${removed} items excluded`:''}.`;
 $('#review-apply').disabled=submitting||n===0;
}
function card(kind,item,body){
 const enabled=kind!=='relationships'||!blocked(item),include=kept(kind,item);
 return `<article class="review-card ${include?'':'review-excluded'}" data-review-kind="${kind}" data-review-id="${esc(item.id)}"><div class="review-card-head"><label><input type="checkbox" data-keep ${include?'checked':''} ${enabled?'':'disabled'}> Include</label><span>${esc(kind==='entities'?item.id:kind==='events'?item.date||'Undated event':item.label)}</span></div>${enabled?'':'<p class="review-dependent">Excluded because an endpoint entity is excluded.</p>'}<div class="review-fields">${body}</div>${source(item.sourceText,kind!=='entities')}</article>`;
}
function render(){
 summary();content.className=tab==='entities'?'review-content review-entity-grid':'review-content';content.setAttribute('aria-labelledby','review-tab-'+tab);
 if(tab==='passages'){
  const warnings=draft.extraction?.warnings||[];
  content.innerHTML=`<div class="review-passages"><h3>Check these passages against the report</h3><p>The parser could not fully interpret this wording. Correct the extracted facts here, then use + Entity or + Link on the chart for missing information. This list is not a guarantee that every omission has been detected.</p>${warnings.length?warnings.map(s=>`<blockquote>${esc(s)}</blockquote>`).join(''):'<p>No unsupported passages were flagged. Check all extracted facts before applying them.</p>'}</div>`;return;
 }
 const entities=draft.graph.entities;
 content.innerHTML=draft.graph[tab].map(item=>{
  if(tab==='entities')return card(tab,item,input('Display name','name',item.name)+select('Entity type','type',C.types,item.type)+input('Role / description','role',item.role||''));
  if(tab==='relationships'){
   const types=linkTypes.includes(item.type)?linkTypes:[...linkTypes,item.type];
   return card(tab,item,select('From','source',entities,item.source)+select('To','target',entities,item.target)+input('Relationship label','label',item.label)+select('Type','type',types,item.type)+input(`Amount (${item.currency||'HKD'}; blank if unknown)`,'amount',item.amount??'','number')+select('Evidence status','certainty',C.certainty,item.certainty)+input('Date','date',item.date||'')+`<label class="review-direction"><input type="checkbox" data-field="directed" ${item.directed?'checked':''}> Show direction arrow</label>`);
  }
  return card(tab,item,input('Event title','title',item.title)+input('Date','date',item.date||'')+select('Evidence status','certainty',C.certainty,item.certainty||'unverified')+`<fieldset class="review-participants"><legend>Participants</legend>${entities.map(n=>`<label><input type="checkbox" data-participant="${esc(n.id)}" ${(item.entities||[]).includes(n.id)?'checked':''} ${excluded.entities.has(n.id)?'disabled':''}>${esc(n.name)}${excluded.entities.has(n.id)?' (excluded)':''}</label>`).join('')}</fieldset>`);
 }).join('')||`<p class="review-empty">No ${tab} in this draft.</p>`;
}
function edited(e){
 const el=e.target,row=el.closest('[data-review-kind]');if(!row)return;
 const kind=row.dataset.reviewKind,item=draft.graph[kind].find(v=>v.id===row.dataset.reviewId);
 if(el.hasAttribute('data-keep')){if(el.checked)excluded[kind].delete(item.id);else excluded[kind].add(item.id);row.classList.toggle('review-excluded',!el.checked);summary();return;}
 if(el.hasAttribute('data-participant')){const ids=new Set(item.entities||[]);if(el.checked)ids.add(el.dataset.participant);else ids.delete(el.dataset.participant);item.entities=[...ids];return;}
 const field=el.dataset.field;if(!field)return;
 if(kind==='entities'&&field==='name'){
  const group=draft.graph.groups.find(g=>g.id===item.id&&g.id===item.group&&g.name===item.name);
  if(group)group.name=el.value;
 }
 item[field]=el.type==='checkbox'?el.checked:field==='amount'?(el.value===''?undefined:Number(el.value)):el.value;
 if(kind==='relationships'&&['source','target'].includes(field)){row.classList.toggle('review-excluded',!kept(kind,item));const keep=row.querySelector('[data-keep]');keep.disabled=blocked(item);keep.checked=kept(kind,item);summary();}
}
content.addEventListener('input',edited);
content.addEventListener('change',edited);
function close(){if(submitting)return;dialog.close();draft=null;excluded=null;onApply=null;content.innerHTML='';}
$('#review-cancel').onclick=$('#review-close').onclick=close;
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
for(const button of dialog.querySelectorAll('[data-review-tab]')){
 button.onclick=()=>{tab=button.dataset.reviewTab;render();content.scrollTop=0;};
 button.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=kinds.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;const target=$(`[data-review-tab="${kinds[next]}"]`);target.click();target.focus();};
}
form.onsubmit=async e=>{
 e.preventDefault();if(submitting)return;
 $('#review-error').textContent='';
 try{
  const next=C.clone(draft);
  next.graph.entities=next.graph.entities.filter(n=>kept('entities',n));
  if(!next.graph.entities.length)throw Error('Include at least one entity before drawing.');
  if(next.graph.entities.some(n=>!n.name.trim()))throw Error('Every included entity needs a display name.');
  const ids=new Set(next.graph.entities.map(n=>n.id));
  next.graph.relationships=next.graph.relationships.filter(r=>kept('relationships',r));
  if(next.graph.relationships.some(r=>r.source===r.target))throw Error('A relationship must connect two different entities.');
  if(next.graph.relationships.some(r=>!r.label.trim()))throw Error('Every included relationship needs a label.');
  next.graph.events=next.graph.events.filter(v=>kept('events',v)).map(v=>({...v,entities:(v.entities||[]).filter(id=>ids.has(id))}));
  // Empty automatic organisation groups should not remain as ghost boxes.
  next.graph.groups=next.graph.groups.filter(g=>next.graph.entities.some(n=>n.group===g.id)||!draft.graph.entities.some(n=>n.group===g.id));
  next.extraction={...next.extraction,reviewed:true};
  const valid=C.validate(next);submitting=true;summary();$('#review-apply').textContent='Applying…';
  await onApply(valid);
  submitting=false;close();
 }catch(err){submitting=false;$('#review-error').textContent=err.message;summary();$('#review-error').focus();}
 finally{$('#review-apply').textContent='Apply and draw';}
};
root.ChartReview={
 open(document,{onApply:apply,replacing=false}={}){
  draft=C.validate(document);excluded={entities:new Set(),relationships:new Set(),events:new Set()};onApply=apply;tab='entities';submitting=false;
  $('#review-title').textContent=replacing?'Check the new report':'Review this chart';
  $('#review-intro').textContent=replacing?'This draft will replace the current chart only when you choose Apply and draw. You can undo that change.':'Correct the facts before applying them. Existing card positions and pins will stay in place.';
  $('#review-error').textContent='';render();dialog.showModal();
 },
 get isOpen(){return dialog.open;}
};
})(globalThis);
