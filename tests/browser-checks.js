return await (async()=>{
const results=[];
const assert=(condition,name)=>{results.push({name,pass:!!condition});if(!condition)throw Error(name);};
const wait=async()=>{for(let i=0;i<200&&ChartApp.busy;i++)await new Promise(r=>setTimeout(r,30));assert(!ChartApp.busy,'layout completes');};
const click=s=>{const el=document.querySelector(s);if(!el)throw Error('Missing control '+s);el.click();};
const fill=(s,value)=>{const el=document.querySelector(s);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
const submit=s=>document.querySelector(s).requestSubmit();
await ChartApp.replaceDocument(structuredClone(Sample.document));await wait();
const startCount=ChartApp.document.graph.entities.length,old=JSON.stringify(ChartApp.document.layout.nodes.TSM1);
click('#add-node');fill('#modal-body input[name=name]','Browser test person');submit('#modal-form');
assert(ChartApp.document.graph.entities.length===startCount+1,'add entity');
assert(ChartApp.geometry.metrics.nodeOverlaps===0,'new entity placed without collision');
assert(JSON.stringify(ChartApp.document.layout.nodes.TSM1)===old,'adding entity preserves existing positions');
const id=ChartApp.document.graph.entities.at(-1).id;
fill('#inspect-form input[name=name]','Edited browser test');document.querySelector('#inspect-form input[name=pinned]').checked=true;submit('#inspect-form');
assert(ChartApp.document.graph.entities.at(-1).name==='Edited browser test','edit entity name');assert(ChartApp.document.layout.nodes[id].pinned,'pin entity');
click('#undo-button');assert(ChartApp.document.graph.entities.at(-1).name==='Browser test person','undo edit');click('#redo-button');assert(ChartApp.document.graph.entities.at(-1).name==='Edited browser test','redo edit');
ChartApp.select('node',id);click('#connect-item');fill('#modal-body input[name=label]','Test payment');fill('#modal-body input[name=amount]','45000');document.querySelector('#modal-body select[name=type]').value='payment';submit('#modal-form');
const e=ChartApp.document.graph.relationships.at(-1);assert(e.amount===45000&&e.type==='payment','add amount-bearing relationship');
fill('#inspect-form input[name=label]','Edited payment');submit('#inspect-form');assert(ChartApp.document.graph.relationships.at(-1).label==='Edited payment','edit relationship');
ChartApp.select('node',id);ChartApp.select('node','TSM1',true);click('#add-group');fill('#modal-body input[name=name]','Test working group');submit('#modal-form');
const group=ChartApp.document.graph.groups.at(-1);assert(ChartApp.document.graph.entities.find(n=>n.id===id).group===group.id,'group selected entities');
const coords=JSON.stringify(ChartApp.document.layout.nodes[id]);ChartApp.collapse(group.id);assert(ChartApp.geometry.nodes.some(n=>n.id==='@group:'+group.id),'collapse group');ChartApp.collapse(group.id);assert(JSON.stringify(ChartApp.document.layout.nodes[id])===coords,'expand preserves member position');
const roundTrip=JSON.stringify(ChartApp.document);await ChartApp.replaceDocument(JSON.parse(roundTrip));assert(JSON.stringify(ChartApp.document)===roundTrip,'JSON round-trip preserves facts and state');
const svg=ChartApp.exportSVG();assert(!new DOMParser().parseFromString(svg,'image/svg+xml').querySelector('parsererror'),'SVG export is valid XML');assert(svg.includes('Edited browser test'),'SVG export contains edited label');
const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});const c=document.createElement('canvas');c.width=400;c.height=300;c.getContext('2d').drawImage(img,0,0,400,300);assert(c.toDataURL('image/png').startsWith('data:image/png'),'PNG can be rendered without taint');URL.revokeObjectURL(url);
await ChartApp.replaceDocument(structuredClone(Sample.document));
for(const mode of ['flow','timeline','hierarchy','group','mixed','relationship']){click(`[data-mode="${mode}"]`);await wait();assert(ChartApp.geometry.nodes.length>0,mode+' mode renders');assert(ChartApp.geometry.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)),mode+' finite coordinates');if(mode==='flow')assert(ChartApp.geometry.routes.every(e=>ChartCore.moneyTypes.includes(e.type)),'money flow contains only financial links');if(mode==='timeline')assert(ChartApp.geometry.nodes.length===Sample.document.graph.events.length,'timeline contains every sample event');}
await ChartApp.replaceDocument(structuredClone(Sample.document));
return JSON.stringify(results);
})()
