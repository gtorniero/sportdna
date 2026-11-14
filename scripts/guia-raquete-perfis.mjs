#!/usr/bin/env node
/* Confere as listas dos guias de compra de raquete (templates/paginas.mjs) contra o motor atual do RACKET DNA.
   Uso: node scripts/guia-raquete-perfis.mjs   (PLAYWRIGHT_MODULE e CHROME_PATH como nos testes de navegador)
   Roda cada perfil de exemplo em racket/index.html?teste, uma raquete por família, e compara com as escolhidas
   e com as faixas de peso, swingweight, cabeça e rigidez citadas no texto.
   Diferença não é erro do motor: é sinal de que o guia precisa ser atualizado (listas e RODADA). */
import {createRequire} from 'node:module';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {fileURLToPath} from 'node:url';
import {PERFIS} from '../templates/paginas.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tipos={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((q,s)=>{const p=decodeURIComponent(q.url.split('?')[0]);const f=path.join(raiz,p.endsWith('/')?p+'index.html':p);
 if(!f.startsWith(raiz)||!fs.existsSync(f)){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':tipos[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
const b=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const pg=await b.newPage();
await pg.goto(`http://127.0.0.1:${srv.address().port}/racket/?teste`,{waitUntil:'load'});
const res=await pg.evaluate(perfis=>{
 const E=window.__RK;const out={};
 for(const [k,p] of Object.entries(perfis)){
  Object.keys(E.A).forEach(x=>delete E.A[x]);Object.assign(E.A,JSON.parse(JSON.stringify(p.respostas)));
  const r=E.compute();let top=r.ranked;
  if(p.filtro?.precoMax)top=top.filter(x=>x.r.price&&x.r.price[0]<=p.filtro.precoMax);
  out[k]={nomes:top.slice(0,p.picks.length).map(x=>x.r.name),zona:{peso:r.Z.wt,sw:r.Z.sw,cabeca:r.Z.head,...(p.zona.ra?{ra:r.Z.ra}:{})}};
 }
 return out;
},PERFIS);
await b.close();srv.close();
let diff=0;
for(const [k,p] of Object.entries(PERFIS)){
 const nomes=JSON.stringify(res[k].nomes)===JSON.stringify(p.picks),zona=JSON.stringify(res[k].zona)===JSON.stringify(p.zona);if(!nomes||!zona)diff++;
 console.log(`${nomes&&zona?'ok  ':'DIFF'} ${k}: ${res[k].nomes.join(' · ')}${nomes?'':`\n     no guia: ${p.picks.join(' · ')}`}${zona?'':`\n     faixas do motor: ${JSON.stringify(res[k].zona)} · no guia: ${JSON.stringify(p.zona)}`}`);
}
if(diff){console.log(`\n${diff} perfil(is) mudaram: atualize PERFIS e RODADA em templates/paginas.mjs e rode node scripts/build-seo.mjs.`);process.exitCode=1}
