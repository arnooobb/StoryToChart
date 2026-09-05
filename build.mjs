import fs from 'node:fs';
const css=fs.readFileSync('src/style.css','utf8');
const licence=fs.readFileSync('vendor/ELK-LICENSE.md','utf8');
const scripts=['vendor/elk.bundled.js','src/core.js','src/sample.js','src/layout.js','src/app.js'].map(p=>'<script>\n'+fs.readFileSync(p,'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>').join('\n');
const html=fs.readFileSync('src/shell.html','utf8').replace('<!--STYLE-->','<style id="app-style">'+css+'</style>').replace('<!--SCRIPTS-->',()=>'<script type="text/plain" id="elk-licence">'+licence.replace(/<\/script/gi,'<\\/script')+'</script>\n'+scripts);
fs.writeFileSync('index.html',html);console.log(`Built index.html (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB), no external assets.`);
