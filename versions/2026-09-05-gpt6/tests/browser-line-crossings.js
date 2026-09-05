return await (async()=>{
while(ChartApp.busy)await new Promise(r=>setTimeout(r,30));
const results=[],check=(ok,name)=>{results.push({name,pass:!!ok});if(!ok)throw Error(name);};
await ChartApp.replaceDocument(structuredClone(Sample.document));
const facts=JSON.stringify(ChartApp.document.graph),positions=JSON.stringify(ChartApp.document.layout.nodes);
for(const style of ['adaptive','orthogonal','straight','curved']){
 const d=structuredClone(ChartApp.document);d.visual.routing=style;await ChartApp.replaceDocument(d);
 const g=ChartApp.geometry,masked=g.routes.filter(r=>r.gaps.length);
 check(masked.length>0,style+' has visible breaks for remaining crossings');
 check(document.querySelectorAll('.edge-path[mask]').length===masked.length,style+' applies every line mask');
 check(JSON.stringify(ChartApp.document.layout.nodes)===positions&&JSON.stringify(ChartApp.document.graph)===facts,style+' preserves positions and facts');
 const svg=ChartApp.exportSVG(),xml=new DOMParser().parseFromString(svg,'image/svg+xml');
 check(!xml.querySelector('parsererror')&&xml.querySelectorAll('mask').length===masked.length,style+' exports valid line masks');
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),img=new Image();
 try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});check(img.width>0,style+' masked SVG renders for PNG export');}finally{URL.revokeObjectURL(url);}
}
await ChartApp.replaceDocument(structuredClone(Sample.document));
return results;
})()
