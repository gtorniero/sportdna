const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'seo.config.json')));
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const results=[];
 for(const url of [config.siteUrl,config.siteUrl+'apps/board/','http://127.0.0.1:8000/sportdna-release/','http://127.0.0.1:8000/sportdna-release/'+config.routes['a-prancha-16']]){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});const page=await context.newPage();
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{window.lab={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
  await page.goto(url,{waitUntil:'networkidle',timeout:60000});await page.waitForTimeout(1000);
  results.push({url,...await page.evaluate(()=>({lcpMs:Math.round(window.lab.lcp),cls:window.lab.cls,fcpMs:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0),domContentLoadedMs:Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd),resources:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((n,e)=>n+e.transferSize,0)+performance.getEntriesByType('navigation')[0].transferSize}))});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(root,'docs/seo/performance-results.json'),JSON.stringify({method:'Single cold-cache Chrome lab observation per URL, 390x844, CPU x4, 150ms latency, 1.6Mbps down. Local and public hosts are different. Not field CWV, Lighthouse, INP, or a statistically comparable before/after.',results},null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
