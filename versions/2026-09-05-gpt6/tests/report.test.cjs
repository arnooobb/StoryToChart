const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={console,structuredClone};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/core.js','utf8'),ctx);
const parse=text=>ctx.ChartCore.parse(text);
test('ordinary names and a company without an acronym produce editable facts',()=>{
 const d=parse('David Wong is the director of North Star Limited. Mary Chan is the wife of David Wong. In May 2024 David Wong paid HK$80,000 to Mary Chan.');
 assert.ok(d.graph.entities.some(n=>n.name==='North Star Limited'&&n.type==='company'));
 assert.ok(d.graph.relationships.some(e=>e.source==='David Wong'&&e.target==='North Star Limited'&&e.type==='employment'));
 assert.ok(d.graph.relationships.some(e=>e.source==='Mary Chan'&&e.target==='David Wong'&&e.type==='family'));
 assert.ok(d.graph.relationships.some(e=>e.source==='David Wong'&&e.target==='Mary Chan'&&e.amount===80000&&e.date==='2024-05'));
});
test('received payments run from payer to recipient and preserve unknown values',()=>{
 const d=parse('Mary Chan received money from David Wong. Mary Chan allegedly received HK$12,000 from David Wong.');
 assert.equal(d.graph.relationships.length,2);
 assert.ok(d.graph.relationships.every(e=>e.source==='David Wong'&&e.target==='Mary Chan'));
 assert.equal(d.graph.relationships[0].amount,undefined);
 assert.equal(d.graph.relationships[1].amount,12000);
 assert.equal(d.graph.relationships[1].certainty,'alleged');
});
test('negated, planned and unresolved pronoun statements remain for review',()=>{
 for(const text of ['David Wong did not pay Mary Chan HK$8,000.','David Wong planned to pay Mary Chan HK$8,000.','In May 2024 he paid HK$8,000 to Mary Chan.']){
  const d=parse(text);assert.equal(d.graph.relationships.length,0,text);assert.ok(d.extraction.warnings.includes(text),text);
 }
});
test('dated sentences without a supported relationship still require review',()=>{
 const text='In May 2024 AAA1 reviewed the tender file.';
 const d=parse(text);assert.equal(d.graph.events.length,1);assert.ok(d.extraction.warnings.includes(text));
});
test('entity codes are matched as whole identifiers',()=>{
 const d=parse('AAA1 -> CCC1: Colleague. AAA10 paid HK$10,000 to BBB1.');
 assert.ok(d.graph.relationships.some(e=>e.source==='AAA10'&&e.target==='BBB1'&&e.amount===10000));
 assert.ok(!d.graph.relationships.some(e=>e.source==='AAA1'&&e.type==='payment'));
});
test('separate payment clauses retain their own amounts and certainty',()=>{
 const d=parse('David Wong paid HK$10,000 to Mary Chan; Peter Lee allegedly paid HK$20,000 to Mary Chan.');
 assert.equal(d.graph.relationships.length,2);
 assert.ok(d.graph.relationships.some(e=>e.source==='David Wong'&&e.amount===10000&&e.certainty==='reported'));
 assert.ok(d.graph.relationships.some(e=>e.source==='Peter Lee'&&e.amount===20000&&e.certainty==='alleged'));
});
test('passive payment wording preserves the true payer',()=>{
 const d=parse('David Wong was paid HK$8,000 by Mary Chan.');
 assert.equal(d.graph.relationships.length,1);
 assert.equal(d.graph.relationships[0].source,'Mary Chan');assert.equal(d.graph.relationships[0].target,'David Wong');
});
test('multiple payment actions in one unsplit sentence remain for review',()=>{
 const text='David Wong paid HK$10,000 to Mary Chan and Peter Lee paid HK$20,000 to Mary Chan.';
 const d=parse(text);assert.equal(d.graph.relationships.length,0);assert.ok(d.extraction.warnings.includes(text));
});
