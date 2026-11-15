#!/usr/bin/env node
/* Casos-guia do RACKET DNA (rodada 15): perfis reais ou típicos com regras do que pode e do que nunca pode aparecer.
   Uso: node racket/tools/casos-guia.mjs [--base git:origin/main] [--top 3] [--json saida.json]
   Lê docs/racket/dados/casos-guia.json. Cada regra vale para cada raquete do top N (padrão 3):
   pesoMin/pesoMax (g sem corda), cabecaMin/cabecaMax (pol²), swMax, raMax, marcasProibidas, proibidos (trecho do nome).
   Sai com código 1 se algum caso falhar na versão atual. Diferente da regressão (que só mostra o que mudou),
   aqui o critério é se o resultado faz sentido para a pessoa. */
import {createRequire} from 'module';import fs from 'fs';import path from 'path';import url from 'url';import http from 'http';import {execSync} from 'child_process';
const {chromium}=createRequire(import.meta.url)('playwright');
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null};
const TOP=+(opt('--top')||3);
const lerHtml=v=>v.startsWith('git:')?execSync(`git show ${v.slice(4)}:racket/index.html`,{cwd:raiz,maxBuffer:64<<20}).toString():fs.readFileSync(path.resolve(raiz,v),'utf8');
const {casos}=JSON.parse(fs.readFileSync(path.join(raiz,'docs/racket/dados/casos-guia.json'),'utf8'));

async function rodar(html){
  const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/racket/'||u==='/racket/index.html'){s.writeHead(200,{'content-type':'text/html; charset=utf-8'});return s.end(html)}
    const f=path.join(raiz,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(raiz)||!fs.existsSync(f)){s.writeHead(404);return s.end()}s.end(fs.readFileSync(f))});
  await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const pg=await b.newPage();
  await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g|facebook|googletag/,r=>r.abort());
  await pg.goto(`http://localhost:${srv.address().port}/racket/?teste`);await pg.waitForFunction(()=>window.__RK);
  const out=await pg.evaluate(({casos,TOP})=>{const H=window.__RK,{A,RK,compute}=H;
    const set=a=>{Object.keys(A).forEach(k=>delete A[k]);let x=JSON.parse(JSON.stringify(a));
      if(x.cur&&!['none','other'].includes(x.cur)&&isNaN(+x.cur)){const i=RK.findIndex(r=>r.name===x.cur);if(i<0)throw new Error('raquete atual não encontrada: '+x.cur);x.cur=String(i)}
      if(H.cleanAnswers)x=H.cleanAnswers(x);Object.assign(A,x)};
    return casos.map(c=>{set(c.exemplo?H.EXAMPLE:c.a);const R=compute();
      return {id:c.id,tw:R.tw,top:R.ranked.slice(0,TOP).map(x=>({name:x.r.name,brand:x.r.brand,wt:x.r.wt,head:x.r.head,sw:x.r.sw,ra:x.r.ra,fit:x.fit}))}})},{casos,TOP});
  await b.close();srv.close();return out;
}
function checar(c,res){
  const R=c.regras||{},falhas=[];
  for(const r of res.top){const n=`${r.name} (${r.wt} g, ${r.head} pol², SW ${r.sw}, RA ${r.ra})`;
    if(R.pesoMax!=null&&r.wt>R.pesoMax)falhas.push(`${n}: peso acima de ${R.pesoMax} g`);
    if(R.pesoMin!=null&&r.wt<R.pesoMin)falhas.push(`${n}: peso abaixo de ${R.pesoMin} g`);
    if(R.cabecaMin!=null&&r.head<R.cabecaMin)falhas.push(`${n}: cabeça menor que ${R.cabecaMin}`);
    if(R.cabecaMax!=null&&r.head>R.cabecaMax)falhas.push(`${n}: cabeça maior que ${R.cabecaMax}`);
    if(R.swMax!=null&&r.sw>R.swMax)falhas.push(`${n}: swingweight acima de ${R.swMax}`);
    if(R.raMax!=null&&r.ra>R.raMax)falhas.push(`${n}: rigidez acima de ${R.raMax}`);
    if((R.marcasProibidas||[]).includes(r.brand))falhas.push(`${n}: marca ${r.brand} não pode aparecer`);
    for(const p of R.proibidos||[])if(r.name.includes(p))falhas.push(`${n}: não pode aparecer`)}
  return falhas;
}
const N=await rodar(fs.readFileSync(path.join(raiz,'racket/index.html'),'utf8'));
const M=opt('--base')?await rodar(lerHtml(opt('--base'))):null;
let ok=0,okM=0;const linhas=[];
console.log(`RACKET DNA · casos-guia · ${casos.length} casos · regras no top ${TOP}\n`);
for(const c of casos){const r=N.find(x=>x.id===c.id),f=checar(c,r),m=M&&M.find(x=>x.id===c.id),fm=m?checar(c,m):null;
  if(!f.length)ok++;if(fm&&!fm.length)okM++;
  linhas.push({id:c.id,ok:!f.length,falhas:f,top:r.top,base:m&&{ok:!fm.length,falhas:fm,top:m.top}});
  console.log(`${f.length?'FALHA':'ok   '} ${c.id} · peso ideal ${r.tw} g${m?` · base: ${fm.length?'FALHA':'ok'} (${m.tw} g)`:''}\n      ${c.desc}\n      nova: ${r.top.map(x=>`${x.name} ${x.wt} g`).join(' · ')}${m?`\n      base: ${m.top.map(x=>`${x.name} ${x.wt} g`).join(' · ')}`:''}`);
  f.forEach(x=>console.log('      ✗ '+x));
}
console.log(`\nResultado: ${ok}/${casos.length} ok${M?` · base ${okM}/${casos.length}`:''}`);
if(opt('--json'))fs.writeFileSync(opt('--json'),JSON.stringify(linhas,null,1));
process.exitCode=ok===casos.length?0:1;
