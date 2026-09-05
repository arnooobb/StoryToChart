const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={structuredClone};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/core.js','utf8'),ctx);
test('new documents have no invented chart title and keep it through JSON',()=>{
 const d=ctx.ChartCore.empty();assert.equal(d.title,'');
 assert.equal(ctx.ChartCore.validate(JSON.parse(JSON.stringify(d))).title,'');
});
test('parsing a report leaves the title for the user to name',()=>{
 assert.equal(ctx.ChartCore.parse('AAA1 paid HK$8,000 to BBB1.').title,'');
});
