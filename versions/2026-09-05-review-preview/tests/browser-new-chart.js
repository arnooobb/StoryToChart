return await (async()=>{
const $=s=>document.querySelector(s),results=[],check=(ok,name)=>{results.push({name,pass:!!ok});if(!ok)throw Error(name);};
const editTitle=value=>{ $('#project-title').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));$('#modal-body input[name=title]').value=value;$('#modal-form').requestSubmit(); };
check(ChartApp.document.title===''&&$('#project-title').textContent==='','opening the HTML shows a blank chart title');
check(!!$('#new-button'),'New is available in the header');
$('#new-button').click();check(!$('#modal').open&&ChartApp.document.graph.entities.length===0,'New on an untouched empty chart starts immediately');
$('#source-input').value='Unsaved report draft';$('#source-input').dispatchEvent(new Event('input',{bubbles:true}));
$('#new-button').click();check($('#modal').open,'New protects unparsed source text');$('#modal-cancel').click();
check($('#source-input').value==='Unsaved report draft','cancelling New preserves the report draft');
$('#new-button').click();$('#modal-submit').click();await Promise.resolve();
check($('#source-input').value===''&&ChartApp.document.title==='','confirmed New clears the report and title');
editTitle('My chart');check(ChartApp.document.title==='My chart','a blank title can still be named');
editTitle('');check(ChartApp.document.title===''&&!$('#modal').open,'a chart title can be cleared again');
$('#add-node').click();$('#modal-body input[name=name]').value='Unsaved person';$('#modal-form').requestSubmit();
const before=JSON.stringify(ChartApp.document);$('#new-button').click();check($('#modal').open,'New asks before discarding chart edits');$('#modal-cancel').click();
check(JSON.stringify(ChartApp.document)===before,'cancelling New preserves chart facts and positions');
$('#new-button').click();$('#modal-submit').click();await Promise.resolve();
check(ChartApp.document.graph.entities.length===0&&ChartApp.document.title==='','confirmed New produces an empty untitled chart');
check($('#undo-button').disabled&&$('#redo-button').disabled,'New clears the previous chart history');
check($('#inspector').hidden&&!$('#source-panel').hidden&&!$('#review-chart-button').offsetParent,'New restores the fresh workspace');
let filename='';const click=HTMLAnchorElement.prototype.click;
try{HTMLAnchorElement.prototype.click=function(){filename=this.download;};$('#save-button').click();}finally{HTMLAnchorElement.prototype.click=click;}
check(filename==='chart.json','blank-titled chart saves with a usable filename');
const restored=ChartCore.empty();restored.title='Saved chart';restored.graph.sources=[{id:'s',text:'Previously saved report'}];await ChartApp.replaceDocument(restored);
$('#new-button').click();check(!$('#modal').open&&$('#source-input').value==='','New does not warn for an unchanged saved document');
return results;
})()
