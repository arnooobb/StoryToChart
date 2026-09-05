const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={console,structuredClone};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/core.js','utf8'),ctx);
const parse=text=>ctx.ChartCore.parse(text);
const entity=(d,name)=>d.graph.entities.find(n=>n.name===name);

test('titles and explicit works-for wording produce an employment fact',()=>{
 const source='Mr. Chan works for Blue Sky Engineering Ltd.';
 const d=parse(source),r=d.graph.relationships[0];
 assert.equal(entity(d,'Mr. Chan').type,'person');
 assert.equal(entity(d,'Blue Sky Engineering Ltd').type,'company');
 assert.equal(r.source,'Mr. Chan');assert.equal(r.target,'Blue Sky Engineering Ltd');
 assert.equal(r.type,'employment');assert.equal(r.sourceText,source);
});

test('letter-only codes work as entities while common capitalised words do not',()=>{
 const d=parse('ABC paid HK$8,000 to XYZ. THE report said AND was present.');
 assert.ok(d.graph.relationships.some(r=>r.source==='ABC'&&r.target==='XYZ'&&r.amount===8000));
 assert.ok(!d.graph.entities.some(n=>['THE','AND'].includes(n.id)));
});

test('additional company endings are classified as companies',()=>{
 for(const suffix of ['Inc','Corporation','Corp','LLC']){
  const d=parse(`Dr. Lee works for Harbour Systems ${suffix}.`);
  assert.equal(entity(d,`Harbour Systems ${suffix}`).type,'company',suffix);
 }
});

test('only parenthesised marked names are extracted from quotation marks',()=>{
 const d=parse('("Amy Ho") works for KTL. （「李志強」） owns Jade Harbour Restaurant. AAA1 said "do not pay" to BBB1.');
 assert.ok(entity(d,'Amy Ho'));assert.ok(entity(d,'李志強'));
 assert.ok(!entity(d,'do not pay'));
});

test('explicit acronym aliases create one entity without overlapping duplicates',()=>{
 const d=parse('North Star Limited (NSL) paid HK$5,000 to David Wong.');
 assert.equal(d.graph.entities.filter(n=>n.id==='NSL'||n.name==='North Star Limited').length,1);
 assert.ok(!entity(d,'Star Limited'));
 assert.ok(d.graph.relationships.some(r=>r.source==='NSL'&&r.target==='David Wong'));
});

test('abbreviation dots and decimal amounts do not split a relationship sentence',()=>{
 const source='Dr. Lee awarded a HK$1.2 million contract to Blue Sky Engineering Ltd.';
 const d=parse(source),r=d.graph.relationships.find(x=>x.type==='contract');
 assert.equal(d.extraction.sentences,1);assert.equal(r.amount,1200000);
 assert.equal(r.sourceText,source);
});

test('supported payment remains while an unsupported witness clause is flagged',()=>{
 const source='AAA1 paid HK$8,000 to BBB1, witnessed by CCC1.';
 const d=parse(source);
 assert.equal(d.graph.relationships.length,1);
 assert.equal(d.graph.relationships[0].source,'AAA1');assert.equal(d.graph.relationships[0].target,'BBB1');
 assert.equal(d.graph.relationships[0].amount,8000);assert.equal(d.graph.relationships[0].sourceText,source);
 assert.ok(d.extraction.warnings.includes(source));
});

test('detected entities retain their exact source spelling for review',()=>{
 const d=parse('Dr. Chan works for Blue Sky Engineering Limited.');
 assert.equal(entity(d,'Dr. Chan').sourceText,'Dr. Chan');
 assert.equal(entity(d,'Blue Sky Engineering Limited').sourceText,'Blue Sky Engineering Limited');
});

test('award wording uses the explicit recipient and passive agent',()=>{
 const active='AAA awarded a contract to BBB with CCC as witness.';
 const a=parse(active),ar=a.graph.relationships.find(r=>r.type==='contract');
 assert.equal(ar.source,'AAA');assert.equal(ar.target,'BBB');
 assert.ok(a.extraction.warnings.includes(active));
 const passive='BBB was awarded a contract by AAA.';
 const p=parse(passive),pr=p.graph.relationships.find(r=>r.type==='contract');
 assert.equal(pr.source,'AAA');assert.equal(pr.target,'BBB');
});

test('company abbreviations do not split a continuing payment sentence',()=>{
 const source='Blue Sky Ltd. paid HK$8,000 to Mary Chan.';
 const d=parse(source),r=d.graph.relationships.find(x=>x.type==='payment');
 assert.equal(d.extraction.sentences,1);assert.equal(r.source,'Blue Sky Ltd');
 assert.equal(r.target,'Mary Chan');assert.equal(r.amount,8000);assert.equal(r.sourceText,source);
});

test('supported facts still warn about an unsupported trailing action',()=>{
 const source='AAA paid HK$8,000 to BBB and threatened CCC.';
 const d=parse(source),r=d.graph.relationships.find(x=>x.type==='payment');
 assert.equal(r.source,'AAA');assert.equal(r.target,'BBB');
 assert.ok(d.extraction.warnings.includes(source));
 assert.ok(!d.graph.relationships.some(x=>x.source==='AAA'&&x.target==='CCC'));
});

test('codes inside a longer company name do not become duplicate people',()=>{
 const d=parse('ABC Trading Limited paid HK$8,000 to Mary Chan.');
 assert.equal(d.graph.entities.filter(n=>n.id==='ABC').length,0);
 assert.equal(d.graph.entities.length,2);
 assert.equal(d.graph.relationships[0].source,'ABC Trading Limited');
});

test('marked names protect interior abbreviation dots',()=>{
 const text='("ABC Co. Ltd") paid HK$8,000 to ("Mary Chan").';
 const d=parse(text);
 assert.equal(d.graph.relationships.length,1);
 assert.equal(d.graph.relationships[0].source,'ABC Co. Ltd');
 assert.equal(d.graph.relationships[0].target,'Mary Chan');
 assert.equal(d.graph.relationships[0].sourceText,text);
});

test('partial warnings do not depend on recognising the unsupported verb',()=>{
 const text='AAA paid HK$8,000 to BBB and inspected the tender file.';
 const d=parse(text);assert.equal(d.graph.relationships.length,1);
 assert.ok(d.extraction.warnings.includes(text));
});

test('job titles and currency abbreviations are not entity codes',()=>{
 const d=parse('The CEO said VAT and HKD were discussed.');
 assert.ok(!d.graph.entities.some(n=>['CEO','VAT','HKD'].includes(n.id)));
});
