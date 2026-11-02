const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'seo.config.json')));
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[];
 for(const theme of ['light','dark']){
  const ctx=await b.newContext({viewport:{width:390,height:900},colorScheme:theme});const p=await ctx.newPage();
  for(const route of ['', 'guias/surf/','guias/racket/','guias/run/','blog/',config.routes['a-prancha-16'],config.routes['a-prancha-17'],config.routes['a-prancha-15'],'surf/','racket/','run/','ferramentas/litragem/']){
   await p.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:8000/sportdna-release/')+route,{waitUntil:'networkidle'});
   await p.addScriptTag({path:process.env.AXE_PATH||'/tmp/sportdna-axe.min.js'});
   const r=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))}});
   results.push({route,theme,...r});
  }await ctx.close();
 }await b.close();fs.writeFileSync(path.join(root,'docs/seo/axe-results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results.map(r=>({route:r.route,theme:r.theme,violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.length})),incomplete:r.incomplete})),null,2));
 if(results.some(r=>r.violations.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
