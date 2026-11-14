const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const config=JSON.parse(fs.readFileSync(path.join(ROOT,'seo.config.json'),'utf8'));
 const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8000/sportdna-release/';
 const routes=['','surf/','racket/','tenis/','blog/',config.routes['a-prancha-16'],config.routes['a-prancha-17'],config.routes['a-prancha-02'],'apps/board/','apps/racket/','apps/tenis/','ferramentas/litragem/',config.routes['melhor-raquete'],config.routes['raquete-iniciante'],config.routes['raquete-cotovelo'],config.routes['sobre'],config.routes['termos'],config.routes['como-ganhamos-dinheiro'],config.routes['contato']];
 const results=[];
 for(const width of [1280,390,320]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const route of routes){
   errors.length=0;
   const response=await page.goto(base+route,{waitUntil:'networkidle'});
   assert.equal(response.status(),200,route);
   await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>{i.loading='eager';return i.decode().catch(()=>{})}))});
   const metrics=await page.evaluate(()=>({title:document.title,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.complete||i.getAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.src),canon:document.querySelector('link[rel=canonical]')?.href}));
   assert.equal(errors.length,0,route+': '+errors.join(','));
   assert.equal(metrics.overflow,false,route+' overflow '+width);
   assert.equal(metrics.broken.length,0,route+' broken images');
   assert.ok(metrics.h1>=1,route+' heading');
   if(width===390 && ['', 'surf/',config.routes['a-prancha-16']].includes(route))await page.screenshot({path:path.join(ROOT,'docs/seo',route===''?'home-mobile.png':route==='surf/'?'surf-mobile.png':'shaper-mobile.png'),fullPage:true});
   results.push({route,width,...metrics,errors:[...errors]});
  }
  // Native navigation, reload, old links and filters.
  await page.goto(base+'?utm_source=seo-audit#a-prancha-16');await page.waitForURL(base+config.routes['a-prancha-16']+'?utm_source=seo-audit');assert.equal(new URL(page.url()).search,'?utm_source=seo-audit');
  await page.reload();assert.match(await page.locator('h1').innerText(),/Ficha para shaper/);
  await page.locator('[data-zoom="board"]').click();await page.locator('#lbImg').evaluate(i=>i.decode());assert.equal(await page.locator('#lbImg').getAttribute('src'),'../../assets/reports/board.webp');await page.keyboard.press('Escape');assert.equal(await page.locator('#lb').isVisible(),false);
  await page.setViewportSize({width:width===1280?390:1280,height:900});assert.match(await page.locator('h1').innerText(),/Ficha para shaper/);
  await page.goto(base+'blog/');await page.locator('#q').fill('shaper');assert.ok(await page.locator('#libBody .acard').count()>0);
  assert.match(await page.locator('#libBody .acard').first().getAttribute('href'),/blog\//);
  await page.locator('#libBody .acard').first().click();await page.waitForURL(/blog\/.+\//);
  await page.goBack();assert.equal(new URL(page.url()).pathname,'/sportdna-release/blog/');
  await page.goto(base+'#conceito');await page.waitForTimeout(200);assert.equal(new URL(page.url()).hash,'#conceito');
  await context.close();
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});const page=await nojs.newPage();
 for(const route of ['', 'surf/','blog/',...Object.entries(config.routes).filter(([k])=>k.startsWith('a-')).map(([,v])=>v)]){await page.goto(base+route);assert.equal(await page.locator('h1').count(),1);assert.ok((await page.locator('main').innerText()).length>100)}
 await nojs.close();await browser.close();
 fs.writeFileSync(path.join(ROOT,'docs/seo/browser-results.json'),JSON.stringify({checks:results.length,noJavaScriptPages:50,results},null,2));
 console.log(`Passed ${results.length} viewport/page checks; 50 pages readable without JavaScript; legacy links, resize, filters, reload and history passed.`);
})().catch(e=>{console.error(e);process.exit(1)});
