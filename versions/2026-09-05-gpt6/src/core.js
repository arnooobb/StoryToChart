/* Story to Chart — facts, validation, deterministic parsing and history. */
(function(root){
'use strict';
const clone=x=>structuredClone(x);
const types=['person','company','organisation','account','location','object','event','other'];
const certainty=['reported','admitted','suspected','alleged','unverified'];
const moneyTypes=['payment','benefit','contract','transaction'];
function empty(){return {version:1,title:'Untitled chart',graph:{entities:[],relationships:[],groups:[],events:[],sources:[]},layout:{mode:'relationship',nodes:{},groups:{}},visual:{routing:'adaptive',labels:true,scope:'all'}};}
function validate(input){
 if(!input||typeof input!=='object')throw Error('Enter a JSON document with a graph object.');
 const d=clone(input.graph?input:{graph:input});const base=empty();
 d.version=d.version||1;if(d.version!==1)throw Error('This document version is not supported.');
 d.title=String(d.title||base.title);d.graph={...base.graph,...d.graph};
 for(const k of ['entities','relationships','groups','events','sources'])if(!Array.isArray(d.graph[k]))throw Error(`${k} must be an array.`);
 if(d.graph.entities.length>160||d.graph.relationships.length>350)throw Error('This prototype supports up to 160 entities and 350 relationships. Split a larger chart into smaller charts.');
 const checkIds=(arr,label)=>{const ids=new Set();for(const v of arr){if(!v||typeof v!=='object'||typeof v.id!=='string'||!v.id.trim()||['__proto__','constructor','prototype'].includes(v.id))throw Error(`Every ${label} needs a safe, non-empty string id.`);if(ids.has(v.id))throw Error(`Duplicate ${label} id: ${v.id}`);ids.add(v.id);}return ids;};
 const ids=checkIds(d.graph.entities,'entity'),groups=checkIds(d.graph.groups,'group');checkIds(d.graph.relationships,'relationship');checkIds(d.graph.events,'event');
 for(const n of d.graph.entities){n.name=String(n.name||n.id);n.type=types.includes(n.type)?n.type:'other';if(n.group&&!groups.has(n.group))throw Error(`Unknown group ${n.group}.`);n.role=String(n.role||'');}
 for(const e of d.graph.relationships){if(!ids.has(e.source)||!ids.has(e.target))throw Error(`Invalid endpoint on relationship ${e.id}.`);e.label=String(e.label||'Related to');e.type=String(e.type||'association');e.certainty=certainty.includes(e.certainty)?e.certainty:'unverified';e.directed=e.directed!==false;if(e.amount!==undefined&&e.amount!==null&&(!Number.isFinite(e.amount)||e.amount<0))throw Error(`Invalid amount on ${e.id}.`);}
 for(const ev of d.graph.events){ev.title=String(ev.title||'Event');ev.date=String(ev.date||'');ev.entities=Array.isArray(ev.entities)?ev.entities:[];if(ev.entities.some(id=>!ids.has(id)))throw Error(`Invalid event participant in ${ev.id}.`);}
 d.layout={...base.layout,...d.layout,nodes:{...(d.layout?.nodes||{})},groups:{...(d.layout?.groups||{})}};
 for(const [id,p] of Object.entries(d.layout.nodes)){if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>1e7||Math.abs(p.y)>1e7)throw Error(`Invalid position for ${id}.`);if(p.width!==undefined&&(!Number.isFinite(p.width)||p.width<60||p.width>1000))throw Error(`Invalid node dimensions for ${id}.`);if(p.height!==undefined&&(!Number.isFinite(p.height)||p.height<30||p.height>1000))throw Error(`Invalid node dimensions for ${id}.`);p.pinned=!!p.pinned;}
 for(const [id,g] of Object.entries(d.layout.groups))if(!g||typeof g!=='object'||['x','y'].some(k=>g[k]!==undefined&&!Number.isFinite(g[k])))throw Error(`Invalid group position for ${id}.`);
 if(!['relationship','flow','timeline','hierarchy','group','mixed'].includes(d.layout.mode))d.layout.mode='relationship';
 d.visual={...base.visual,...d.visual};if(!['adaptive','orthogonal','straight','curved'].includes(d.visual.routing))d.visual.routing='adaptive';
 return d;
}
class History{
 constructor(){this.past=[];this.future=[];}
 push(d){this.past.push(clone(d));if(this.past.length>60)this.past.shift();this.future=[];}
 undo(d){if(!this.past.length)return null;this.future.push(clone(d));return this.past.pop();}
 redo(d){if(!this.future.length)return null;this.past.push(clone(d));return this.future.pop();}
}
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dateOf(s){const m=s.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(20\d{2})\b/i);return m?`${m[2]}-${String(months.findIndex(x=>x.toLowerCase()===m[1].slice(0,3).toLowerCase())+1).padStart(2,'0')}`:(s.match(/\b20\d{2}-\d{2}(?:-\d{2})?\b/)||[])[0]||'';}
function statusOf(s){return /suspect/i.test(s)?'suspected':/alleg/i.test(s)?'alleged':/unverified|possibly|may have|might have/i.test(s)?'unverified':/admitted/i.test(s)?'admitted':'reported';}
function amountOf(s){const m=s.match(/HK\$\s*([\d,]+(?:\.\d+)?)\s*(million|m\b)?/i);return m?Number(m[1].replaceAll(',',''))*(m[2]?1e6:1):undefined;}
function money(e){if(e.amount!=null)return new Intl.NumberFormat('en-HK',{style:'currency',currency:e.currency||'HKD',maximumFractionDigits:0}).format(e.amount).replace('HK$','HK$');return '';}
function dateLabel(d){if(!d)return '';const m=d.match(/^(\d{4})-(\d{2})/);return m?`${months[+m[2]-1]} ${m[1]}`:d;}
function parse(text){
 if(!text.trim())throw Error('Paste a story or JSON to begin.');
 if(/^[\[{]/.test(text.trim())){try{return validate(JSON.parse(text));}catch(e){throw Error('JSON: '+e.message);}}
 const d=empty();d.title='Extracted report';d.graph.sources=[{id:'source-1',text,kind:'pasted text'}];
 const entities=new Map(),relations=[],warnings=[],handled=new Set();let counter=0;
 const add=(id,name=id,type='person')=>{if(!entities.has(id))entities.set(id,{id,name,type,role:''});return entities.get(id);};
 // Full names immediately preceding an acronym; restrict the phrase to capitalised words.
 const orgRE=/((?:(?:[A-Z][a-zA-Z&’'-]*|of|the|and)\s+){1,9}(?:Limited|Department|Office|Bank|Restaurant|Advisory|Services))\s*\(([A-Z]{2,8})\)/g;
 for(const m of text.matchAll(orgRE)){let name=m[1].trim().replace(/^(?:(?:of|the|and|In)\s+)+/,'');const id=m[2];const type=/Limited$/.test(name)?'company':/Restaurant$/.test(name)?'location':'organisation';add(id,name,type);}
 // Only discover ordinary names next to explicit relationship wording.
 // Full organisation names resolve to their existing acronym when supplied.
 const aliases=new Map([...entities.values()].map(n=>[n.name,n.id]));
 const fullName="[A-Z][a-zA-Z’'-]*(?:[ \\t]+[A-Z][a-zA-Z’'-]*){1,3}";
 const named=raw=>{const name=raw.trim().replace(/^(?:The|In)\s+/,'');if(aliases.has(name))return;const type=/(?:Limited|Ltd|PLC|LLP)$/.test(name)?'company':/(?:Bank|Department|Office|Services)$/.test(name)?'organisation':'person';add(name,name,type);aliases.set(name,name);};
 for(const m of text.matchAll(new RegExp('('+fullName+')(?:[ \\t]+(?:Limited|Ltd|PLC|LLP))\\b','g')))named(m[0]);
 for(const m of text.matchAll(new RegExp('('+fullName+')[ \\t]+(?:(?:allegedly|reportedly)[ \\t]+)?(?:is|was|paid|gave|handed|sent|transferred|received|met|owns|works|did|planned)\\b','g')))named(m[1]);
 for(const m of text.matchAll(new RegExp('\\b(?:to|from|by|with|of|paid|gave|handed|sent)[ \\t]+('+fullName+')','g')))named(m[1]);
 for(const m of text.matchAll(/\b[A-Z]{2,5}\d+\b/g))add(m[0]);
 for(const m of text.matchAll(/["“]([^"”]+)["”]/g))add(m[1],m[1]);
 const names=[...new Set([...entities.keys(),...aliases.keys()])].sort((a,b)=>b.length-a.length);
 const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const find=s=>{const hits=[];for(const name of names){const re=new RegExp('(?<![\\p{L}\\p{N}_])'+escapeRE(name)+'(?![\\p{L}\\p{N}_])','u'),m=re.exec(s);if(m&&!hits.some(h=>m.index>=h.index&&m.index<h.end))hits.push({id:aliases.get(name)||name,index:m.index,end:m.index+name.length});}return [...new Set(hits.sort((a,b)=>a.index-b.index).map(h=>h.id))];};
 const link=(source,target,label,type,s,i,extra={})=>{if(!source||!target||source===target)return;relations.push({id:`r${++counter}`,source,target,label,type,certainty:statusOf(s),directed:!['family','association','meeting'].includes(type),date:dateOf(s),sourceText:s,sourceId:'source-1',...extra});handled.add(i);};
 // Split only at sentence boundaries, preserving decimals and abbreviations in amounts.
 const sentences=text.split(/(?<=[.!?])\s+|;\s*|\n+(?=\s*[^:\n]+->)/);
 sentences.forEach((raw,i)=>{
  const s=raw.trim();if(!s)return;const ids=find(s),date=dateOf(s);
  const structured=s.match(/^(.+?)\s*->\s*(.+?)\s*:\s*(.+?)(?:\.$|$)/);
  if(structured){const a=structured[1].trim(),b=structured[2].trim();add(a);add(b);link(a,b,structured[3],'association',s,i);return;}
  if(date){d.graph.events.push({id:`ev${i}`,title:s.replace(/^In\s+\w+\s+\d{4}\s*/,'').slice(0,130),date,entities:ids,certainty:statusOf(s),sourceText:s});}
  // Do not turn denials, future plans or hypothetical statements into facts.
  if(/\b(?:not|never|denied|denies|planned|plans|intended|intends|will|would|if)\b|\bno evidence\b|n't\b/i.test(s)){warnings.push(s);return;}
  if((s.match(/\b(?:gave|paying|paid|handed|transferred|sent|received)\b/g)||[]).length>1){warnings.push(s);return;}
  // Role clauses, including several roles and organisations in one sentence.
  if(/\b(?:is|was) (?:the |a |an )/.test(s)&&ids.length>1){
   const subject=ids[0];const roleMatch=s.match(/\b(?:is|was) (?:the |a |an )(.+?) of /);
   if(roleMatch){let role=roleMatch[1];const relatives=role.match(/^(wife|husband|brother|sister|son|daughter|father|mother)$/);
    if(relatives){link(subject,ids[1],`${relatives[1]} of`,'family',s,i);role=(s.match(/and (?:the |a |an )(.+?) of /)||[])[1]||'';}
    for(const org of ids.filter(id=>entities.get(id).type!=='person')){if(role){link(subject,org,role,/owner|shareholder/.test(role)?'ownership':'employment',s,i);const n=entities.get(subject);n.role=role;if(!n.group)n.group=org;}}
   }
  }
  if(/owned by/.test(s)){const before=find(s.split('owned by')[0]),after=find(s.split('owned by')[1]);if(before.length&&after.length){link(after[0],before.at(-1),'Owner','ownership',s,i,{certainty:statusOf(s.split('owned by')[1].split(/,|and afterwards/)[0])});entities.get(after[0]).group=before.at(-1);}}
  const intro=s.match(/introduced (.+?) to (.+)/);if(intro){for(const who of find(intro[1]))for(const to of find(intro[2]))link(who,to,`Introduced by ${ids[0]}`,'association',s,i);}
  if(/cover bids/.test(s)){const people=ids.filter(id=>entities.get(id).type==='person');link(people[0],people[1],'Cover-bid agreement','association',s,i);}
  if(/hosted a dinner|met with/.test(s)){const people=ids.filter(id=>entities.get(id).type==='person');link(people[0],people[1],date?'Dinner · '+dateLabel(date):'Meeting','meeting',s,i,{certainty:statusOf(s.split(/and afterwards/)[0])});}
  if(/(?:gave|paying|paid|handed|transferred|sent)\b/.test(s)&&ids.length>=2){
   const verb=s.match(/\b(gave|paying|paid|handed|transferred|sent)\b/);const before=find(s.slice(0,verb.index));const after=find(s.slice(verb.index+verb[0].length));let a=before.at(-1),b=after[0];
   if(/\b(?:was|were|been|being|is)\s+(?:(?:allegedly|reportedly)\s+)?$/.test(s.slice(0,verb.index))){a=find(s.slice(verb.index).split(/\bby\b/)[1]||'')[0];b=before.at(-1);}
   if(/hosted a dinner/.test(s))a=ids[0];
   if(b){let label=/renovation/.test(s)?'Renovation benefit':/watch/.test(s)?'Watch and cash':/envelope/.test(s)?'Envelope of cash':/rebate/.test(s)?'Rebate':'Payment';const pct=(s.match(/\d+(?:\.\d+)?%/)||[])[0];if(pct)label+=' · '+pct;link(a,b,label,/benefit|watch|renovation/i.test(label)?'benefit':'payment',s,i,{amount:amountOf(s.slice(verb.index)),currency:'HKD',rate:pct||''});}
  }
  const received=s.match(/\breceived\b(.+?)\bfrom\b(.+)/);
  if(received&&(/\b(?:money|cash|payment|kickback|benefit)\b/i.test(received[1])||amountOf(received[1])!==undefined)){
   const recipient=find(s.slice(0,received.index)).at(-1),payer=find(received[2])[0];
   link(payer,recipient,'Payment','payment',s,i,{amount:amountOf(received[1]),currency:'HKD'});
  }
  const kick=s.match(/(\w+) accepted kickbacks of ([\d.]+%) from (\w+)/);if(kick)link(kick[3],kick[1],`Kickbacks · ${kick[2]}`,'payment',s,i,{rate:kick[2]});
  if(/awarded/.test(s)){const v=s.indexOf('awarded'),before=find(s.slice(0,v)),to=s.slice(v).match(/\bto\s+(\w+)/);if(to&&entities.has(to[1]))link(before[0],to[1],/quotations/.test(s)?'Quotation awards':'Contract award','contract',s,i,{amount:amountOf(s),currency:'HKD',certainty:statusOf(s.split(/,\s*and/)[0])});}
  if(/signed an acceptance certificate/.test(s)){const s0=ids[0],org=entities.get(s0)?.group;if(org)link(s0,org,'Acceptance certificate · undelivered goods','association',s,i);}
  if(/deposits/.test(s)&&ids.length){const company=ids.find(id=>entities.get(id).type==='company');if(company){const account=company+'-account';add(account,company+' account','account').group=company;link(ids[0],account,'Cash deposits · review amount','transaction',s,i,{certainty:statusOf(s.split(/,\s*and/)[0]),notes:'The text describes multiple deposits. No aggregate amount inferred.'});}}
  if(/(?:advising|advised)/.test(s)&&ids.length>=2){const adviser=find(s.split(/,\s*and/).at(-1))[0];if(adviser&&adviser!==ids[0])link(adviser,ids[0],'Advised on deposits','association',s,i);}
  if(!handled.has(i)&&s.length>12)warnings.push(s);
 });
 const orgs=[...entities.values()].filter(n=>['company','organisation','location'].includes(n.type));
 d.graph.groups=orgs.map(n=>({id:n.id,name:n.name,shortName:n.id===n.name?'':n.id}));for(const n of orgs)n.group=n.id;
 d.graph.entities=[...entities.values()];d.graph.relationships=relations;
 d.extraction={kind:'automatic',warnings,notice:'Rule-based extraction. Review every relationship and dated event against the source. Unsupported wording may be omitted.',sentences:sentences.length};
 return validate(d);
}
root.ChartCore={clone,types,certainty,moneyTypes,empty,validate,History,parse,money,dateOf,dateLabel,statusOf,amountOf};
})(globalThis);
