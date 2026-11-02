#!/usr/bin/env node
/* Testes de viés do motor do RACKET DNA.
   Uso: node racket/tools/vies.mjs [--realista] [--n 3000] [--semente 12345] [--exp nome[,nome]] [--html arquivo] [--json saida.json]
   Abre racket/index.html?teste num Chromium (Playwright), sorteia perfis válidos do questionário (mulberry32) e mede:
   marcas no 1º e no top 3 × catálogo, cobertura, contraindicações no pódio, orçamento e o exemplo pronto.
   --realista   dor no braço em ~25% dos perfis (no sorteio uniforme são 2/3)
   --exp        experimentos que isolam uma parte do motor, sem mudar o app:
                compressao (alvo sem compressão 0,6), semAprovacao (aprovação TW zerada), raNeutra (rigidez igual para todas nos índices)
   --html       outro arquivo no lugar de racket/index.html (precisa expor window.__RK com ?teste)
   --json       grava respostas e top 3 de cada perfil (para comparar duas versões)
   --pesos      JSON (texto ou arquivo) mesclado em PESOS antes de rodar, para testar uma mudança sem editar o app */
import {createRequire} from 'module';
import fs from 'fs';import path from 'path';import url from 'url';import http from 'http';
const {chromium}=createRequire(import.meta.url)('playwright');
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d};
const N=+arg('--n',3000),SEED=+arg('--semente',12345),REAL=process.argv.includes('--realista');
const EXP=(arg('--exp','')||'').split(',').filter(Boolean);
const HTML=path.resolve(arg('--html',path.join(raiz,'racket/index.html')));
const JSON_OUT=arg('--json',null);
const PES=(v=>!v?null:JSON.parse(fs.existsSync(v)?fs.readFileSync(v,'utf8'):v))(arg('--pesos',null));

const tipos={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/racket/'||p==='/racket/index.html'){s.writeHead(200,{'content-type':tipos['.html']});return s.end(fs.readFileSync(HTML))}
  const f=path.join(raiz,p.endsWith('/')?p+'index.html':p);if(!f.startsWith(raiz)||!fs.existsSync(f)){s.writeHead(404);return s.end()}
  s.writeHead(200,{'content-type':tipos[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
const b=await chromium.launch();const pg=await b.newPage();
await pg.goto(`http://127.0.0.1:${srv.address().port}/racket/?teste`,{waitUntil:'load'});
const out=await pg.evaluate(({N,SEED,REAL,EXP,PES})=>{
  const E=window.__RK;if(!E)throw new Error('window.__RK ausente: a página precisa expor o motor com ?teste');
  const {A,Q,RK,compute,PESOS}=E;
  const mescla=(o,m)=>{Object.keys(m).forEach(k=>{if(m[k]&&typeof m[k]==='object'&&!Array.isArray(m[k])&&o[k]&&typeof o[k]==='object')mescla(o[k],m[k]);else o[k]=m[k]})};
  if(PES)mescla(PESOS,PES);
  if(EXP.includes('compressao'))PESOS.alvo.compressao=1;
  if(EXP.includes('semAprovacao'))PESOS.placar.aprovacaoTeto=0;
  if(EXP.includes('raNeutra'))RK.forEach(r=>{r.ix=E.idx({...r,ra:63})});
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const R=mulberry32(SEED);const pick=a=>a[Math.floor(R()*a.length)];
  const perfil=()=>{
    Object.keys(A).forEach(k=>delete A[k]);
    for(const q of Q){
      if(q.if&&!q.if())continue;
      if(q.type==='step'){
        if(q.id==='age')A.age=String(R()<.05?10+Math.floor(R()*4):14+Math.floor(R()*57));
        else if(q.id==='height')A.height=String(150+Math.floor(R()*50));
        else A.weight=String(45+Math.floor(R()*65));
        continue;
      }
      if(q.type==='select'){const u=R();A.cur=u<.2?'none':u<.35?'other':String(Math.floor(R()*RK.length));continue}
      const vals=q.o.map(o=>o[0]);
      if(q.id==='arm'&&REAL){const u=R();A.arm=u<.75?'no':u<.875?'past':'now';continue}
      if(q.multi){const k=1+Math.floor(R()*q.multi);const v=vals.slice();for(let i=v.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[v[i],v[j]]=[v[j],v[i]]}A[q.id]=v.slice(0,k)}
      else A[q.id]=pick(vals);
    }
    return JSON.parse(JSON.stringify(A));
  };
  const res=[];
  for(let n=0;n<N;n++){const a=perfil();const r=compute();res.push({a,top:r.ranked.slice(0,3).map(x=>x.r.id),fit:r.ranked.slice(0,3).map(x=>x.fit)})}
  let ex=null;if(E.EXAMPLE){Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,JSON.parse(JSON.stringify(E.EXAMPLE)));const r=compute();ex=r.ranked.slice(0,3).map(x=>`${x.r.name} ${x.fit}%`)}
  const cat=RK.map(r=>({id:r.id,brand:r.brand,name:r.name,head:r.head,wt:r.wt,bal:r.bal,sw:r.sw,ra:r.ra,price:r.price,br:r.br}));
  return {res,cat,ex};
},{N,SEED,REAL,EXP,PES});
await b.close();srv.close();
if(JSON_OUT)fs.writeFileSync(JSON_OUT,JSON.stringify(out.res.map(x=>({a:x.a,top:x.top}))));

const {res,cat,ex}=out,pct=x=>(100*x).toFixed(1).replace('.',',')+'%';
console.log(`RACKET DNA · ${N} perfis · semente ${SEED}${REAL?' · amostra realista (dor ~25%)':' · sorteio uniforme'}${EXP.length?' · exp: '+EXP.join(','):''}`);
/* marcas */
const marcas=[...new Set(cat.map(r=>r.brand))];const c1={},c3={},cc={};marcas.forEach(m=>{c1[m]=c3[m]=0;cc[m]=cat.filter(r=>r.brand===m).length});
const m1=cat.map(()=>0),m3=cat.map(()=>0);
res.forEach(x=>{c1[cat[x.top[0]].brand]++;m1[x.top[0]]++;x.top.forEach(i=>{c3[cat[i].brand]++;m3[i]++})});
console.log('\nMarca        catálogo   1º     top 3');
marcas.sort((a,b)=>c3[b]-c3[a]).forEach(m=>console.log(m.padEnd(12),pct(cc[m]/cat.length).padStart(7),pct(c1[m]/N).padStart(7),pct(c3[m]/3/N).padStart(7)));
const semDor=res.filter(x=>x.a.arm==='no');if(semDor.length){const c={};semDor.forEach(x=>x.top.forEach(i=>c[cat[i].brand]=(c[cat[i].brand]||0)+1));console.log(`Top 3 sem dor no braço (${semDor.length}): `+Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([m,v])=>m+' '+pct(v/3/semDor.length)).join(' · '))}
/* cobertura */
console.log(`\nCobertura: ${m1.filter(v=>v).length} modelos já em 1º, ${m3.filter(v=>v).length} no top 3, de ${cat.length}`);
console.log('Nunca no top 3: '+(cat.filter((r,i)=>!m3[i]).map(r=>r.name).join(', ')||'nenhum'));
console.log('Mais frequentes no top 3: '+cat.map((r,i)=>[r.name,m3[i]]).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,v])=>`${n} ${pct(v/N)}`).join(' · '));
/* contraindicações */
const J=(a,k)=>a.arm&&a.arm!=='no'&&(a.joint||[]).includes(k);
const forte=a=>a.arm!=='no'&&(a.pain==='3'||a.lim==='3');
const regras=[
  /* rigidez: evidência fraca (docs/racket/ciencia.md, tema 1); conta como ressalva, não como contraindicação séria */
  ['Dor (atual ou passada) e RA ≥ 68 *',(a,r)=>a.arm!=='no'&&r.ra>=68,1],
  ['Dor hoje e RA > 65 *',(a,r)=>a.arm==='now'&&r.ra>65,1],
  ['Dor forte/tratamento e RA > 60 *',(a,r)=>forte(a)&&r.ra>60,1],
  ['Dor no braço e < 275 g',(a,r)=>a.arm!=='no'&&r.wt<275],
  ['Punho e balanço ≥ 335 mm',(a,r)=>J(a,'wrist')&&r.bal>=335],
  ['Ombro e SW ≥ 328',(a,r)=>J(a,'shoulder')&&r.sw>=328],
  ['Iniciante e cabeça ≤ 98',(a,r)=>a.lvl==='beg'&&r.head<=98],
  ['Iniciante e SW ≥ 326 ou ≥ 310 g',(a,r)=>a.lvl==='beg'&&(r.sw>=326||r.wt>=310)],
  ['Força baixa ou 60+ anos e ≥ 310 g',(a,r)=>(a.str==='low'||+a.age>=60)&&r.wt>=310],
  ['Não iniciante e cabeça ≥ 110',(a,r)=>a.lvl!=='beg'&&r.head>=110],
];
console.log('\nContraindicação                       pódios  em 1º');
regras.forEach(([n,f])=>{let p=0,u=0;res.forEach(x=>{const t=x.top.map(i=>cat[i]);if(t.some(r=>f(x.a,r)))p++;if(f(x.a,t[0]))u++});console.log(n.padEnd(38),String(p).padStart(5),String(u).padStart(6))});
const conta=rs=>{let s1=0,s2=0;res.forEach(x=>{const k=x.top.filter(i=>rs.some(([,f])=>f(x.a,cat[i]))).length;if(k)s1++;if(k>=2)s2++});return [s1,s2]};
{const [a1,a2]=conta(regras),[b1,b2]=conta(regras.filter(r=>!r[2]));
console.log(`Pódios com 1+ (todas as regras): ${a1} (${pct(a1/N)}); com 2+: ${a2} (${pct(a2/N)})`);
console.log(`Pódios com 1+ contraindicação séria (sem as de rigidez *): ${b1} (${pct(b1/N)}); com 2+: ${b2} (${pct(b2/N)})`);}
const fo=res.filter(x=>forte(x.a));console.log(`Dor forte/tratamento: ${fo.length} perfis; pódio com alguma RA > 60: ${fo.filter(x=>x.top.some(i=>cat[i].ra>60)).length}`);
const kids=res.filter(x=>+x.a.age<14).length;console.log(`Menores de 14 anos: ${kids} (recebem aviso de raquete juvenil)`);
/* orçamento */
const acima=(x,i)=>cat[i].price&&cat[i].price[0]>+x.a.budget;
const ac=res.filter(x=>acima(x,x.top[0])).length;
console.log(`\nOrçamento: 1ª acima em ${ac} (${pct(ac/N)}); pódio todo acima em ${res.filter(x=>x.top.every(i=>acima(x,i))).length}`);
['1400','1800','2200','99999'].forEach(o=>{const g=res.filter(x=>x.a.budget===o);if(!g.length)return;const a1=g.filter(x=>acima(x,x.top[0])).length,a8=g.filter(x=>cat[x.top[0]].price[0]>+o*1.08).length;console.log(`  até ${o==='99999'?'sem limite':'R$ '+o}: ${g.length} perfis, 1ª acima ${pct(a1/g.length)} (mais de 8% acima ${pct(a8/g.length)}), Match médio da 1ª ${(g.reduce((s,x)=>s+x.fit[0],0)/g.length).toFixed(1)}`)});
const imp=res.filter(x=>x.a.imp==='no');console.log(`Prefere comprar no Brasil: ${imp.length}; 1ª difícil de achar: ${imp.filter(x=>cat[x.top[0]].br==='d').length}`);
const f1=res.map(x=>x.fit[0]).sort((a,b)=>a-b);console.log(`Match da 1ª: mín ${f1[0]} · p10 ${f1[Math.floor(N*.1)]} · mediana ${f1[N>>1]} · máx ${f1[N-1]}`);
if(ex)console.log('\nExemplo pronto: '+ex.join(' · '));
