return await (async()=>{
while(ChartApp.busy)await new Promise(r=>setTimeout(r,30));
const results=[];const check=(ok,name)=>{results.push({name,pass:!!ok});if(!ok)throw Error(name);};
await ChartApp.replaceDocument(structuredClone(Sample.document));const facts=JSON.stringify(ChartApp.document.graph);const positions=JSON.stringify(ChartApp.document.layout.nodes);
const bundle=ChartApp.geometry.routes.find(e=>e.entries?.some(x=>x.id==='cash-hck'));check(bundle?.entries.length===2,'cash and Rolex share one line');
const node=[...document.querySelectorAll('.graph-edge')].find(n=>n.dataset.edge===bundle.id);check(!!node,'shared line rendered once');node.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0}));check(document.querySelector('#inspector-title').textContent==='Transactions','line opens transaction list');
document.querySelector('[data-bundle-entry="cash-hck"]').click();check(document.querySelector('#inspect-form input[name=amount]').value==='120000','individual transaction opens');
document.querySelector('#inspect-form input[name=amount]').value='125000';document.querySelector('#inspect-form').requestSubmit();check(ChartApp.document.graph.relationships.find(e=>e.id==='cash-hck').amount===125000,'individual cash amount updates');check(ChartApp.document.graph.relationships.find(e=>e.id==='watch').amount===undefined,'watch retains unknown value');check(ChartApp.geometry.routes.filter(e=>e.entries?.some(x=>x.id==='cash-hck')).length===1,'edited transaction stays bundled');check(JSON.stringify(ChartApp.document.layout.nodes)===positions,'transaction edit does not move entities');
ChartApp.undo();check(JSON.stringify(ChartApp.document.graph)===facts,'undo restores transaction facts');
const current=ChartApp.geometry.routes.find(e=>e.entries?.some(x=>x.id==='watch'));const label=[...document.querySelectorAll('.edge-label')].find(n=>n.dataset.edge===current.id);check(label.textContent.includes('Cash benefit')&&label.textContent.includes('Rolex watch'),'one label contains both transaction entries');
label.querySelector('[data-edge="watch"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0}));check(document.querySelector('#inspect-form input[name=label]').value==='Rolex watch','click label entry edits the correct transaction');
document.querySelector('#delete-item').click();document.querySelector('#modal-submit').click();check(!ChartApp.document.graph.relationships.some(e=>e.id==='watch'),'only selected transaction is deleted');check(ChartApp.geometry.routes.some(e=>e.id==='cash-hck'&&!e.entries),'remaining transaction becomes a single line');ChartApp.undo();
const svg=ChartApp.exportSVG();check(!new DOMParser().parseFromString(svg,'image/svg+xml').querySelector('parsererror'),'bundled SVG is valid');check(svg.includes('Cash benefit')&&svg.includes('Rolex watch'),'SVG preserves both entries');
await ChartApp.replaceDocument(structuredClone(Sample.document));return results;
})()
