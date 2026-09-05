/* Deterministic macro/micro layout, obstacle-aware routing and measurable scoring. */
(function(root){
'use strict';
const C=ChartCore,W=190,H=68,GAP=72;
const centre=n=>({x:n.x+n.width/2,y:n.y+n.height/2});
const overlap=(a,b,p=0)=>a.x<b.x+b.width+p&&a.x+a.width+p>b.x&&a.y<b.y+b.height+p&&a.y+a.height+p>b.y;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const inflate=(r,p)=>({...r,x:r.x-p,y:r.y-p,width:r.width+2*p,height:r.height+2*p});
function segmentHits(a,b,r){
 let t0=0,t1=1;const dx=b.x-a.x,dy=b.y-a.y;
 for(const [p,q] of [[-dx,a.x-r.x],[dx,r.x+r.width-a.x],[-dy,a.y-r.y],[dy,r.y+r.height-a.y]]){if(Math.abs(p)<1e-8){if(q<=0)return false;}else{const t=q/p;if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);if(t0>=t1)return false;}}
 return t1>0&&t0<1;
}
// Crossing breaks are a visual fallback when fixed positions prevent a detour.
// Count the underlying conflicts honestly; a break never changes the graph facts.
function crossingGaps(routes){
 const gaps=routes.map(()=>[]),safe=(r,p)=>distance(p,r.points[0])>30&&distance(p,r.points.at(-1))>30;
 for(let k=0;k<routes.length;k++)for(let l=0;l<k;l++){
  const r=routes[k],t=routes[l];
  for(let i=1;i<r.points.length;i++)for(let j=1;j<t.points.length;j++){
   const a=r.points[i-1],b=r.points[i],c=t.points[j-1],d=t.points[j],dx=b.x-a.x,dy=b.y-a.y,ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex;
   if(Math.abs(den)<.01)continue;
   const u=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,v=((c.x-a.x)*dy-(c.y-a.y)*dx)/den;
   if(u<-.0001||u>1.0001||v<-.0001||v>1.0001)continue;
   const p={x:a.x+u*dx,y:a.y+u*dy,radius:10},index=safe(r,p)?k:safe(t,p)?l:-1;
   if(index>=0&&!gaps[index].some(q=>distance(p,q)<1))gaps[index].push(p);
  }
 }
 return gaps;
}
// Narrow barriers prevent crossings, touching elbows and shared tracks. Only the
// short landing at a genuinely shared entity is allowed to meet another line.
function lineBarriers(e,r){
 const shared=id=>id===e.source||id===e.target,ps=r.points,out=[];
 for(let i=1;i<ps.length;i++){
  let a=ps[i-1],b=ps[i],length=distance(a,b);if(!length)continue;
  const start=i===1&&shared(r.source)?Math.min(40,length):0,end=i===ps.length-1&&shared(r.target)?Math.min(40,length):0;
  if(start+end>=length)continue;
  const dx=(b.x-a.x)/length,dy=(b.y-a.y)/length;
  b={x:b.x-dx*end,y:b.y-dy*end};a={x:a.x+dx*start,y:a.y+dy*start};
  const steps=Math.abs(dx*dy)>.001?Math.ceil(distance(a,b)/24):1;
  for(let j=0;j<steps;j++){const c={x:a.x+(b.x-a.x)*j/steps,y:a.y+(b.y-a.y)*j/steps},d={x:a.x+(b.x-a.x)*(j+1)/steps,y:a.y+(b.y-a.y)*(j+1)/steps};out.push(inflate({x:Math.min(c.x,d.x),y:Math.min(c.y,d.y),width:Math.abs(c.x-d.x),height:Math.abs(c.y-d.y)},5));}
 }
 return out;
}
function lineConflicts(e,points,existing){let hits=0;for(const r of existing){const barriers=lineBarriers(e,r);if(points.some((p,i)=>i&&barriers.some(b=>segmentHits(points[i-1],p,b))))hits++;}return hits;}
function simplify(ps){const out=[];for(const p of ps){if(out.length&&distance(p,out.at(-1))<0.1)continue;while(out.length>1&&Math.abs((out.at(-1).x-out.at(-2).x)*(p.y-out.at(-1).y)-(out.at(-1).y-out.at(-2).y)*(p.x-out.at(-1).x))<.1)out.pop();out.push(p);}return out;}
function extent(nodes){if(!nodes.length)return {x:0,y:0,width:500,height:400};const x=Math.min(...nodes.map(n=>n.x)),y=Math.min(...nodes.map(n=>n.y));return {x,y,width:Math.max(...nodes.map(n=>n.x+n.width))-x,height:Math.max(...nodes.map(n=>n.y+n.height))-y};}
function projection(d){
 if(d.layout.mode==='timeline'){
  const events=[...d.graph.events].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
  return {nodes:events.map(e=>({id:'@event:'+e.id,eventId:e.id,name:e.title,type:'event',role:C.dateLabel(e.date),date:e.date,certainty:e.certainty})),edges:events.slice(1).map((e,i)=>({id:'@sequence:'+i,source:'@event:'+events[i].id,target:'@event:'+e.id,label:'',type:'sequence',directed:true,certainty:'reported'})),groups:[]};
 }
 let edges=d.graph.relationships;
 if(d.layout.mode==='flow')edges=edges.filter(e=>C.moneyTypes.includes(e.type));
 else if(d.visual.scope==='key')edges=edges.filter(e=>C.moneyTypes.includes(e.type)||['cover','cover-companies','advice','witness','slc-owner'].includes(e.id)||e.type==='family'||(d.visual.revealedLinks||[]).includes(e.id));
 edges=bundleTransactions(edges);
 let nodes=d.graph.entities;
 if(d.layout.mode==='flow'||d.visual.scope==='key'){const used=new Set(edges.flatMap(e=>[e.source,e.target]));nodes=nodes.filter(n=>used.has(n.id)||(d.visual.revealed||[]).includes(n.id));}
 const groups=d.layout.mode==='hierarchy'?[]:d.graph.groups.filter(g=>nodes.some(n=>n.group===g.id));
 const collapsed=new Set(groups.filter(g=>d.layout.mode==='group'?!d.layout.groups[g.id]?.expandedInGroupMode:d.layout.groups[g.id]?.collapsed).map(g=>g.id));const lookup=new Map(nodes.map(n=>[n.id,n]));
 if(collapsed.size){const mapId=id=>collapsed.has(lookup.get(id)?.group)?'@group:'+lookup.get(id).group:id;edges=edges.map(e=>({...e,source:mapId(e.source),target:mapId(e.target)})).filter(e=>e.source!==e.target);nodes=nodes.filter(n=>!collapsed.has(n.group));for(const id of collapsed){const g=groups.find(g=>g.id===id);nodes.push({id:'@group:'+id,group:id,collapsed:true,name:g.name,type:'organisation',role:`${d.graph.entities.filter(n=>n.group===id).length} entities`});}}
 return {nodes,edges,groups};
}
// Orthogonal visibility search used only when simple paths hit obstacles.
function gridRoute(a,b,obstacles){
 const corridor={x:Math.min(a.x,b.x)-180,y:Math.min(a.y,b.y)-180,width:Math.abs(a.x-b.x)+360,height:Math.abs(a.y-b.y)+360};obstacles=obstacles.filter(r=>overlap(r,corridor));
 const xs=[a.x,b.x],ys=[a.y,b.y];for(const r of obstacles){xs.push(r.x-12,r.x+r.width+12);ys.push(r.y-12,r.y+r.height+12);}
 const X=[...new Set(xs)].sort((a,b)=>a-b),Y=[...new Set(ys)].sort((a,b)=>a-b);const nx=X.length,ny=Y.length,N=nx*ny;
 const start=Y.indexOf(a.y)*nx+X.indexOf(a.x),end=Y.indexOf(b.y)*nx+X.indexOf(b.x);const pos=i=>({x:X[i%nx],y:Y[Math.floor(i/nx)]});
 const invalid=new Uint8Array(N);for(let i=0;i<N;i++){const p=pos(i);if(obstacles.some(r=>p.x>r.x&&p.x<r.x+r.width&&p.y>r.y&&p.y<r.y+r.height))invalid[i]=1;}
 const costs=new Map([[start*3,0]]),prev=new Map(),heap=[];
 const push=v=>{heap.push(v);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=v[0])break;heap[i]=heap[p];i=p;}heap[i]=v;};
 const pop=()=>{const top=heap[0],v=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(v[0]<=heap[c][0])break;heap[i]=heap[c];i=c;}heap[i]=v;}return top;};
 push([0,start*3,0]);let found,visits=0;const blocked=new Map();
 while(heap.length&&visits++<18000){const [priority,key,cost]=pop();if(cost>costs.get(key))continue;const i=Math.floor(key/3),dir=key%3;if(i===end){found=key;break;}const ix=i%nx,iy=Math.floor(i/nx);for(const [j,nd]of [[ix>0?i-1:-1,1],[ix+1<nx?i+1:-1,1],[iy>0?i-nx:-1,2],[iy+1<ny?i+nx:-1,2]]){if(j<0||invalid[j])continue;const p=pos(i),q=pos(j);const edgeKey=i<j?i+':'+j:j+':'+i;if(!blocked.has(edgeKey))blocked.set(edgeKey,obstacles.some(r=>segmentHits(p,q,r)));if(blocked.get(edgeKey))continue;const c=cost+distance(p,q)+(dir&&dir!==nd?38:0),k=j*3+nd;if(c<(costs.get(k)??Infinity)){costs.set(k,c);prev.set(k,key);push([c+Math.abs(q.x-b.x)+Math.abs(q.y-b.y),k,c]);}}}
 if(found===undefined)return null;const ps=[];while(found!==undefined){ps.push(pos(Math.floor(found/3)));found=prev.get(found);}return simplify(ps.reverse());
}
// Ports reserve a perpendicular landing and clearance around the whole endpoint box.
function route(e,nodes,existing=[],style='adaptive',parallel=0,landingBlockers=[]){
 const source=nodes.find(n=>n.id===e.source),target=nodes.find(n=>n.id===e.target);if(!source||!target)return {points:[]};
 const clearance=14,landing=28,gap=2;
 function ports(n){const c=centre(n),ox=Math.max(-n.width/2+20,Math.min(n.width/2-20,parallel*10)),oy=Math.max(-n.height/2+20,Math.min(n.height/2-20,parallel*10));
  const used=existing.flatMap(r=>r.source===n.id?[r.points[0]]:r.target===n.id?[r.points.at(-1)]:[]).filter(Boolean);
  return [[n.x+n.width,c.y+oy,1,0],[n.x,c.y+oy,-1,0],[c.x+ox,n.y+n.height,0,1],[c.x+ox,n.y,0,-1]].map(([x,y,dx,dy])=>{
   const limit=(dx?n.height:n.width)/2-12,origin=dx?c.y:c.x;
   const offsets=[dx?oy:ox,0,-14,14,-24,24,-40,40,-60,60].filter(v=>Math.abs(v)<=limit);
   const offset=offsets.find(v=>!used.some(p=>distance(p,{x:dx?x+dx*gap:origin+v,y:dy?y+dy*gap:origin+v})<11));
   if(offset!==undefined){if(dx)y=origin+offset;else x=origin+offset;}
   return {tip:{x:x+dx*gap,y:y+dy*gap},exit:{x:x+dx*landing,y:y+dy*landing}};
  });
 }
 const sa=ports(source),tb=ports(target),obstacles=nodes.map(n=>inflate(n,n.edgeId?2:clearance));
 const tracks=existing.map(r=>lineBarriers(e,r)),barriers=tracks.flat();
 let best=null,bestCost=Infinity,bestCross=Infinity,fallback=null,fallbackCost=Infinity;
 const inspect=(middle,p,q)=>{
  middle=simplify(middle);const ps=simplify([p.tip,...middle,q.tip]);
  // Test landing segments against everything except their own endpoint.
  let hits=0;for(const n of nodes){const obstacle=inflate(n,n.edgeId?2:clearance);if(n.id!==source.id&&segmentHits(p.tip,p.exit,obstacle))hits++;if(n.id!==target.id&&segmentHits(q.exit,q.tip,obstacle))hits++;}
  for(const label of landingBlockers){const obstacle=inflate(label,6);if(segmentHits(p.tip,p.exit,obstacle)||segmentHits(q.exit,q.tip,obstacle))hits++;}
  for(let i=1;i<middle.length;i++)for(const obstacle of obstacles)if(segmentHits(middle[i-1],middle[i],obstacle))hits++;
  // A route may not immediately double back over either reserved landing.
  if(middle.length>1){const next=middle[1],prev=middle.at(-2);if((next.x-p.exit.x)*(p.exit.x-p.tip.x)+(next.y-p.exit.y)*(p.exit.y-p.tip.y)<-.01)hits++;if((prev.x-q.exit.x)*(q.exit.x-q.tip.x)+(prev.y-q.exit.y)*(q.exit.y-q.tip.y)<-.01)hits++;}
  let length=0;for(let i=1;i<ps.length;i++)length+=distance(ps[i-1],ps[i]);
  const cross=hits?0:tracks.filter(track=>ps.some((p,i)=>i&&track.some(b=>segmentHits(ps[i-1],p,b)))).length,cost=length+(ps.length-2)*34+cross*100000;
  if(cost+hits*1e8<fallbackCost){fallbackCost=cost+hits*1e8;fallback=ps;}
  if(!hits&&cost<bestCost){bestCost=cost;best=ps;bestCross=cross;}

 };
 const pairs=sa.flatMap(p=>tb.map(q=>({p,q,length:distance(p.exit,q.exit)}))).sort((a,b)=>a.length-b.length);
 for(const {p,q}of pairs){if(source===target&&distance(p.tip,q.tip)<1)continue;const a=p.exit,b=q.exit,mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  if(source!==target&&(style!=='orthogonal'||Math.abs(a.x-b.x)<.01||Math.abs(a.y-b.y)<.01))inspect([a,b],p,q);
  inspect([a,{x:a.x,y:b.y},b],p,q);inspect([a,{x:b.x,y:a.y},b],p,q);
  inspect([a,{x:mx,y:a.y},{x:mx,y:b.y},b],p,q);inspect([a,{x:a.x,y:my},{x:b.x,y:my},b],p,q);
 }
 // Try outside lanes before the more expensive visibility search.
 if(bestCross>0&&barriers.length){const b=extent([...obstacles,...barriers]);for(const {p,q}of pairs){const a=p.exit,z=q.exit;for(const x of [b.x-24,b.x+b.width+24])inspect([a,{x,y:a.y},{x,y:z.y},z],p,q);for(const y of [b.y-24,b.y+b.height+24])inspect([a,{x:a.x,y},{x:z.x,y},z],p,q);}}
 if(bestCross>0)for(const {p,q}of pairs.slice(0,4)){if(source===target&&distance(p.tip,q.tip)<1)continue;
  if(barriers.some(b=>segmentHits(p.tip,p.exit,b)||segmentHits(q.exit,q.tip,b)))continue;
  const middle=gridRoute(p.exit,q.exit,[...obstacles,...barriers]);if(middle)inspect(middle,p,q);if(bestCross===0)break;
 }
 if(!best)for(const {p,q}of pairs){if(source===target&&distance(p.tip,q.tip)<1)continue;const middle=gridRoute(p.exit,q.exit,obstacles);if(middle)inspect(middle,p,q);if(best)break;}

 return {points:best||fallback||[],blocked:!best,curve:style==='curved'};
}
function bundleTransactions(edges){
 const buckets=new Map();for(const e of edges){if(!C.moneyTypes.includes(e.type))continue;const key=JSON.stringify([e.source,e.target,e.directed!==false]);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(e);}
 const emitted=new Set();return edges.flatMap(e=>{if(!C.moneyTypes.includes(e.type))return [e];const key=JSON.stringify([e.source,e.target,e.directed!==false]),entries=buckets.get(key);if(entries.length===1)return [e];if(emitted.has(key))return [];emitted.add(key);const statuses=new Set(entries.map(x=>x.certainty));return [{id:'@transactions:'+entries[0].id,source:e.source,target:e.target,directed:e.directed!==false,type:'transaction',label:entries.length+' transactions',certainty:statuses.size===1?e.certainty:'mixed',entries:[...entries].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.id.localeCompare(b.id))}];});
}
function labelRows(e){
 if(!e.entries){const amount=C.money(e);return [e.label,amount,e.date?C.dateLabel(e.date):''].filter(Boolean).map(text=>({text,kind:amount&&text===amount?'amount':'text',certainty:e.certainty}));}
 const rows=[];for(const entry of e.entries){const status=entry.certainty.charAt(0).toUpperCase()+entry.certainty.slice(1);rows.push({text:entry.label+' · '+status,entryId:entry.id,kind:'entry-title',certainty:entry.certainty});const details=[C.money(entry),entry.date?C.dateLabel(entry.date):''].filter(Boolean).join(' · ');if(details)rows.push({text:details,entryId:entry.id,kind:entry.amount!=null?'amount':'text',certainty:entry.certainty});}
 return rows;
}
function edgeText(e){return labelRows(e).map(r=>r.text);}
function labelFor(e,r,nodes,placed,routes){
 if(!e.label||!r.points.length)return null;
 const rows=labelRows(e),lines=rows.map(r=>r.text),width=Math.min(e.entries?300:230,Math.max(74,...lines.map(s=>s.length*6.4+20))),height=lines.length*18+12;
 let best,bestCost=Infinity;const segments=r.points.slice(1).map((p,i)=>({a:r.points[i],b:p,length:distance(r.points[i],p)})).sort((a,b)=>b.length-a.length);
 for(const s of segments)for(const t of [.5,.3,.7])for(const shift of [0,-25,25,-50,50,-85,85]){
  const horizontal=Math.abs(s.b.x-s.a.x)>=Math.abs(s.b.y-s.a.y),cx=s.a.x+(s.b.x-s.a.x)*t,cy=s.a.y+(s.b.y-s.a.y)*t;
  const box={x:cx-width/2+(horizontal?0:shift),y:cy-height/2+(horizontal?shift:0),width,height,lines,rows,anchor:{x:cx,y:cy}};
  let cost=Math.abs(shift)*.5+Math.abs(t-.5)*10;
  cost+=nodes.filter(n=>overlap(box,n,9)).length*100000;
  cost+=placed.filter(n=>overlap(box,n,7)).length*40000;
  for(const other of routes){if(other===r)continue;for(let i=1;i<other.points.length;i++)if(segmentHits(other.points[i-1],other.points[i],inflate(box,2)))cost+=350;}
  if(cost<bestCost){bestCost=cost;best=box;}
 }
 if(bestCost>=40000&&best){
  const origin={x:best.anchor.x,y:best.anchor.y};
  outer:for(let radius=35;radius<=420;radius+=28)for(let angle=0;angle<16;angle++){
   const cx=origin.x+Math.cos(angle*Math.PI/8)*radius,cy=origin.y+Math.sin(angle*Math.PI/8)*radius;
   const box={x:cx-width/2,y:cy-height/2,width,height,lines,rows,anchor:origin};
   if(nodes.some(n=>overlap(box,n,10))||placed.some(n=>overlap(box,n,8)))continue;
   best=box;break outer;
  }
 }
 return best;
}
function score(nodes,routes,labels,groups=[]){
 const m={nodeOverlaps:0,labelOverlaps:0,edgeNodeHits:0,edgeLabelHits:0,crossings:0,bends:0,length:0,groupOverlaps:0};
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(overlap(nodes[i],nodes[j],6))m.nodeOverlaps++;
 for(let i=0;i<labels.length;i++){for(let j=i+1;j<labels.length;j++)if(overlap(labels[i],labels[j],3))m.labelOverlaps++;for(const n of nodes)if(overlap(labels[i],n,3))m.labelOverlaps++;}
 for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(overlap(groups[i],groups[j],4))m.groupOverlaps++;
 for(let k=0;k<routes.length;k++){const r=routes[k];m.bends+=Math.max(0,r.points.length-2);for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i];m.length+=distance(a,b);for(const n of nodes)if(n.id!==r.source&&n.id!==r.target&&segmentHits(a,b,n))m.edgeNodeHits++;for(const l of labels)if(l.edgeId!==r.id&&segmentHits(a,b,l))m.edgeLabelHits++;}m.crossings+=lineConflicts(r,r.points,routes.slice(k+1));}

 const b=extent([...nodes,...labels,...groups]);m.area=Math.round(b.width*b.height);m.cost=Math.round(m.nodeOverlaps*1e7+m.edgeNodeHits*1e6+m.labelOverlaps*50000+m.groupOverlaps*500000+m.edgeLabelHits*600+m.crossings*900+m.bends*16+m.length*.12+m.area*.0018+Math.abs(b.width/b.height-1.65)*1000+Math.max(b.width/1450,b.height/850)*9000);return m;
}
function groupBoxes(d,p,positions){return p.groups.filter(g=>!p.nodes.some(n=>n.group===g.id&&n.collapsed)).map(g=>{const members=p.nodes.filter(n=>n.group===g.id).map(n=>({...n,width:W,height:H,...positions[n.id]}));const b=extent(members);return {...g,x:b.x-26,y:b.y-58,width:b.width+52,height:b.height+84};});}
function geometry(d,positions){const p=projection(d),nodes=p.nodes.map(n=>({...n,width:W,height:H,...positions[n.id]})).filter(n=>Number.isFinite(n.x));const groups=groupBoxes(d,p,positions),headers=groups.map(g=>({id:'header:'+g.id,x:g.x,y:g.y,width:g.width,height:38}));
 const sorted=[...p.edges].sort((a,b)=>(C.moneyTypes.includes(b.type)?1:0)-(C.moneyTypes.includes(a.type)?1:0)||a.id.localeCompare(b.id));const routes=[],seen=new Map();for(const e of sorted){const key=[e.source,e.target].sort().join('|'),index=seen.get(key)||0;seen.set(key,index+1);const parallel=index===0?0:Math.ceil(index/2)*(index%2?1:-1);routes.push({...e,...route(e,[...nodes,...headers],routes,d.visual.routing,parallel),parallel});}
 const landings=routes.flatMap(r=>[false,true].map(start=>{const tip=start?r.points[0]:r.points.at(-1),next=start?r.points[1]:r.points.at(-2);if(!tip||!next)return null;const length=distance(tip,next)||1,end={x:tip.x+(next.x-tip.x)*Math.min(30,length)/length,y:tip.y+(next.y-tip.y)*Math.min(30,length)/length};return inflate({x:Math.min(tip.x,end.x),y:Math.min(tip.y,end.y),width:Math.abs(tip.x-end.x),height:Math.abs(tip.y-end.y)},8);})).filter(Boolean);
 const labels=[];if(d.visual.labels)for(const r of routes){const l=labelFor(r,r,[...nodes,...headers,...landings],labels,routes);if(l){l.edgeId=r.id;labels.push(l);r.labelBox=l;}}
 // Recheck both labels and connectors after label placement.
 for(const r of routes){const others=labels.filter(l=>l.edgeId!==r.id);if(!lineConflicts(r,r.points,routes.filter(x=>x!==r))&&!r.points.some((p,i)=>i&&others.some(l=>segmentHits(r.points[i-1],p,inflate(l,3)))))continue;
  const routed=route(r,[...nodes,...headers,...others.map(l=>({...l,id:'label:'+l.edgeId}))],routes.filter(x=>x!==r),d.visual.routing,r.parallel||0,r.labelBox?[r.labelBox]:[]);
  if(!routed.blocked){r.points=routed.points;r.blocked=false;r.curve=routed.curve;}
 }
 for(const r of routes){const l=r.labelBox;if(!l)continue;const c=centre(l);let nearest,dist=Infinity;
  for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((c.x-a.x)*dx+(c.y-a.y)*dy)/(dx*dx+dy*dy||1))),q={x:a.x+t*dx,y:a.y+t*dy};if(distance(q,c)<dist){dist=distance(q,c);nearest=q;}}if(nearest)l.anchor=nearest;
 }
 const gaps=crossingGaps(routes);routes.forEach((r,i)=>r.gaps=gaps[i]);
 return {nodes,groups,routes,labels,metrics:score(nodes,routes,labels,groups),bounds:inflate(extent([...nodes,...groups,...labels,...routes.flatMap(r=>r.points.map(p=>({...p,width:0,height:0})))]),38)};
}
let elk;
async function layered(nodes,edges,direction='RIGHT',seed=1,space=70){
 elk ||= new root.ELK();const result=await elk.layout({id:'root',layoutOptions:{'elk.algorithm':'layered','elk.direction':direction,'elk.randomSeed':String(seed),'elk.spacing.nodeNode':String(space),'elk.layered.spacing.nodeNodeBetweenLayers':String(space+80),'elk.layered.crossingMinimization.strategy':'LAYER_SWEEP','elk.layered.considerModelOrder.strategy':'NODES_AND_EDGES','elk.edgeRouting':'ORTHOGONAL','elk.padding':'[top=0,left=0,bottom=0,right=0]'},children:nodes.map(n=>({id:n.id,width:n.width||W,height:n.height||H})),edges:edges.filter(e=>e.source!==e.target).map(e=>({id:e.id,sources:[e.source],targets:[e.target]}))});return Object.fromEntries(result.children.map(n=>[n.id,{x:n.x,y:n.y,width:n.width,height:n.height,pinned:false}]));
}
function resolveOverlaps(positions,nodes,fixed){
 const sorted=[...nodes].sort((a,b)=>Number(fixed.has(b.id))-Number(fixed.has(a.id)));const placed=[];
 for(const n of sorted){const p=positions[n.id];if(!p)continue;if(!fixed.has(n.id)){let tries=0;while(placed.some(q=>overlap(p,q,24))&&tries++<1000)p.y+=H+36;}placed.push(p);}
}
function packGroups(blocks,edges,columns,reverse=false){
 const degree=new Map(blocks.map(b=>[b.id,0]));for(const e of edges){degree.set(e.source,(degree.get(e.source)||0)+1);degree.set(e.target,(degree.get(e.target)||0)+1);}
 const order=[...blocks].sort((a,b)=>degree.get(b.id)-degree.get(a.id)||a.id.localeCompare(b.id));if(reverse)order.reverse();
 function place(list){const pos={};let y=40;for(let i=0;i<list.length;i+=columns){const row=list.slice(i,i+columns),height=Math.max(...row.map(b=>b.height));let x=40;for(const b of row){pos[b.id]={x,y:y+(height-b.height)/2};x+=b.width+115;}y+=height+95;}return pos;}
 const cost=list=>{const ps=place(list);let v=0;for(const e of edges)v+=distance(centre({...blocks.find(b=>b.id===e.source),...ps[e.source]}),centre({...blocks.find(b=>b.id===e.target),...ps[e.target]}));return v;};
 let best=cost(order);for(let pass=0;pass<3;pass++)for(let i=0;i<order.length;i++)for(let j=i+1;j<order.length;j++){[order[i],order[j]]=[order[j],order[i]];const c=cost(order);if(c<best)best=c;else [order[i],order[j]]=[order[j],order[i]];}
 return place(order);
}
async function candidates(d,p){
 if(d.layout.mode==='timeline')return [1,2,3].map(columns=>{const pos={};const cols=columns===1?3:columns===2?4:2;p.nodes.forEach((n,i)=>{pos[n.id]={x:(i%cols)*390,y:Math.floor(i/cols)*210,width:310,height:116,pinned:false};});return {name:`Chronological · ${cols} columns`,positions:pos};});
 if(d.layout.mode==='hierarchy')return Promise.all(['DOWN','RIGHT','DOWN'].map(async(dir,i)=>({name:`Layered ${dir.toLowerCase()} ${i+1}`,positions:await layered(p.nodes,p.edges,dir,i+1,60+i*35)})));
 const membership=new Map(p.nodes.map(n=>[n.id,n.group&&p.groups.some(g=>g.id===n.group)?n.group:'ungrouped:'+n.id]));
 const blocks=[];for(const id of new Set(membership.values())){const members=p.nodes.filter(n=>membership.get(n.id)===id);const internal=p.edges.filter(e=>members.some(n=>n.id===e.source)&&members.some(n=>n.id===e.target));
  let local;if(members.length===1)local={[members[0].id]:{x:0,y:0,width:W,height:H,pinned:false}};
  else {
   const elkLocal=await layered(members,internal,d.layout.mode==='flow'?'RIGHT':'DOWN',1,50);
   const degree=id=>p.edges.filter(e=>e.source===id||e.target===id).length;
   const ordered=[...members].sort((a,b)=>degree(b.id)-degree(a.id)||elkLocal[a.id].y-elkLocal[b.id].y||a.id.localeCompare(b.id));
   const cols=members.length>3?2:1;local={};
   ordered.forEach((n,i)=>local[n.id]={x:(i%cols)*(W+90),y:Math.floor(i/cols)*(H+66),width:W,height:H,pinned:false});
  }
  // Pack disconnected routine members compactly; ELK handles connected internal topology.
  const b=extent(Object.values(local));blocks.push({id,width:b.width+52,height:b.height+84,local,members});
 }
 const macroEdges=p.edges.filter(e=>membership.get(e.source)!==membership.get(e.target)).map((e,i)=>({id:'macro'+i,source:membership.get(e.source),target:membership.get(e.target)}));
 const macros=[{name:'Compact groups · three columns',p:packGroups(blocks,macroEdges,3)},{name:'Compact groups · four columns',p:packGroups(blocks,macroEdges,4,true)}];
 macros.push({name:'Layered groups · left to right',p:await layered(blocks,macroEdges,'RIGHT',2,100)});
 macros.push({name:'Layered groups · top to bottom',p:await layered(blocks,macroEdges,'DOWN',3,90)});
 return macros.map(m=>{const positions={};for(const b of blocks)for(const n of b.members)positions[n.id]={...b.local[n.id],x:b.local[n.id].x+m.p[b.id].x+26,y:b.local[n.id].y+m.p[b.id].y+58};return {name:m.name,positions};});
}
async function generate(d,opts={}){
 const p=projection(d);if(!p.nodes.length)return {positions:C.clone(d.layout.nodes),...geometry(d,{}),candidates:[],chosen:'Empty chart'};
 if(opts.group){const members=p.nodes.filter(n=>n.group===opts.group),ids=new Set(members.map(n=>n.id)),edges=p.edges.filter(e=>ids.has(e.source)&&ids.has(e.target));if(!members.length)throw Error('This group has no visible members.');const local=await layered(members,edges,'DOWN');const positions=C.clone(d.layout.nodes);const anchor=extent(members.map(n=>({...n,width:W,height:H,...positions[n.id]})));for(const n of members)if(!positions[n.id]?.pinned)positions[n.id]={...local[n.id],x:local[n.id].x+anchor.x,y:local[n.id].y+anchor.y};const fixed=new Set(p.nodes.filter(n=>!ids.has(n.id)||positions[n.id]?.pinned).map(n=>n.id));resolveOverlaps(positions,p.nodes,fixed);return {positions,...geometry(d,positions),candidates:[],chosen:'Selected group only'};}
 const cs=await candidates(d,p),results=[];const pinned=p.nodes.filter(n=>d.layout.nodes[n.id]?.pinned);
 for(const candidate of cs){const positions={...C.clone(d.layout.nodes),...candidate.positions};if(pinned.length){const first=pinned[0],old=d.layout.nodes[first.id],fresh=positions[first.id],dx=old.x-fresh.x,dy=old.y-fresh.y;for(const n of p.nodes){positions[n.id].x+=dx;positions[n.id].y+=dy;}for(const n of pinned)positions[n.id]={width:W,height:H,...C.clone(d.layout.nodes[n.id])};}
  resolveOverlaps(positions,p.nodes,new Set(pinned.map(n=>n.id)));const geo=geometry(d,positions);
  if(d.layout.mode==='flow'){let backwards=0;for(const r of geo.routes){const a=positions[r.source],b=positions[r.target];if(b.x<a.x)backwards++;}geo.metrics.backwards=backwards;geo.metrics.cost+=backwards*3000;}
  results.push({positions,...geo,name:candidate.name});
 }
 results.sort((a,b)=>a.metrics.cost-b.metrics.cost);const best=results[0];return {...best,chosen:best.name,candidates:results.map(r=>({name:r.name,...r.metrics}))};
}
root.ChartLayout={W,H,projection,generate,geometry,route,score,crossingGaps,segmentHits,overlap,extent,centre,edgeText};
})(globalThis);
