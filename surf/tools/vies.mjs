// Teste de viés e de segurança do motor do SURF DNA.
// Uso: node surf/tools/vies.mjs [--url http://localhost:8000] [--n 3000] [--seed 12345] [--dump saida.json] [--html outra-versao.html]
// Precisa do site servido na raiz do repositório (python3 -m http.server 8000).
// Sorteia perfis válidos do questionário (semente fixa, mulberry32), roda compute() de surf/index.html
// e imprime: tipos no 1º e no top 3, litros por kg por nível, contagem de pódios incoerentes
// e o resultado do "Ver um exemplo pronto". Com --dump, grava pódio, litros e medidas de cada perfil
// (serve para provar que uma refatoração não mudou o resultado). Com --html, usa outra versão de surf/index.html
// no lugar da servida (para comparar antes e depois sem trocar o arquivo).
import {createRequire} from 'module';
import {execSync} from 'child_process';
import fs from 'fs';
const req=createRequire(import.meta.url);
let pw;try{pw=req('playwright')}catch(e){pw=createRequire(execSync('npm root -g').toString().trim()+'/')('playwright')}
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const BASE=arg('url','http://localhost:8000').replace(/\/$/,''),N=+arg('n',3000),SEED=+arg('seed',12345),DUMP=arg('dump',null),HTML=arg('html',null);

const b=await pw.chromium.launch();const p=await b.newPage();
const erros=[];p.on('pageerror',e=>erros.push(String(e)));
// expõe o motor (o script da página fica dentro de uma função) sem mudar o arquivo publicado
await p.route('**/surf/**',async rt=>{
  const u=rt.request().url();if(!/\/surf\/(index\.html)?(\?.*)?$/.test(u))return rt.continue();
  const resp=await rt.fetch();let t=HTML?fs.readFileSync(HTML,'utf8'):await resp.text();
  const fim='\n})();\n</script>';const i=t.indexOf(fim);
  if(i<0)throw new Error('Não achei o fim do script principal');
  t=t.slice(0,i)+'\nwindow.__S={A,Q,compute,rankAll,ARCH,EXAMPLE,get ondaAcima(){return typeof ondaAcima==="function"?ondaAcima:null}};'+t.slice(i);
  rt.fulfill({response:resp,body:t,headers:{...resp.headers(),'content-type':'text/html; charset=utf-8'}});
});
await p.goto(BASE+'/surf/index.html');await p.waitForFunction(()=>window.__S);

const res=await p.evaluate(({N,SEED})=>{
  const {A,Q,compute,rankAll,EXAMPLE}=window.__S;const OA=window.__S.ondaAcima;
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const R=mulberry32(SEED),ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const limpa=()=>Object.keys(A).forEach(k=>delete A[k]);
  const resumo=r=>({lvl:r.lvl,peso:r.peso,tam:r.a.tam,uso:r.a.uso,onde:r.a.onde,foam:r.a.foam,muda:r.a.muda,
    fins:r.fins.map(f=>({k:f.k,fit:f.fit,vol:f.vol})),d:[r.d.L,r.d.W,r.d.T,r.d.V],conf:r.conf,
    aviso:OA?!!OA(r):null,rank:rankAll(r).map(x=>x.k)});
  const out=[];
  for(let n=0;n<N;n++){limpa();
    // sorteia todas as perguntas sempre na mesma ordem (a sequência não depende das condições) e depois aplica as condições
    const T={};
    for(const q of Q){
      if(q.type==='number'){T[q.id]=String(q.id==='peso'?ri(45,110):ri(150,200));continue}
      if(q.type==='rate'){const o={};['rem','est','vel','man','ctl','tol'].forEach(x=>o[x]=ri(1,10));T[q.id]=o;continue}
      if(q.type==='board'){const v={ft:String(ri(5,9)),in:String(ri(0,11)),l:String(ri(22,80))};if(R()<.5)T[q.id]=v;continue}
      const opts=q.o.map(x=>x[0]);
      if(q.multi){const s=opts.filter(()=>R()<(q.id==='dor'?.15:.4));if(s.length||!q.opt)T[q.id]=s.length?s:[opts[0]];continue}
      T[q.id]=opts[ri(0,opts.length-1)];
    }
    for(const q of Q){if(q.cond&&!q.cond())continue;if(T[q.id]!==undefined)A[q.id]=T[q.id]}
    out.push(resumo(compute()));
  }
  limpa();Object.assign(A,JSON.parse(JSON.stringify(EXAMPLE)));const ex=compute();limpa();
  return {out,ex:{tipo:window.__S.ARCH[ex.k].n,fit:ex.fins[0].fit,V:ex.d.V,L:ex.d.L,pod:ex.fins.map(f=>f.k)}};
},{N,SEED});
await b.close();
if(erros.length){console.error('Erros de JS na página:',erros);process.exitCode=1}
const r=res.out;
if(DUMP)fs.writeFileSync(DUMP,JSON.stringify(res));

const KEYS=['soft','long','longp','minimal','mid','evo','fish','grov','twin','softp','short','step','gun'];
const pct=(x,t)=>(100*x/t).toFixed(1)+'%';
const top1=k=>r.filter(x=>x.fins[0].k===k).length,top3=k=>r.filter(x=>x.fins.some(f=>f.k===k)).length;
console.log(`SURF DNA · ${N} perfis · semente ${SEED}\n`);
console.log('Tipo       1º lugar        no top 3');
for(const k of KEYS)console.log(`${k.padEnd(9)} ${String(top1(k)).padStart(5)} ${pct(top1(k),N).padStart(6)}   ${String(top3(k)).padStart(5)} ${pct(top3(k),N).padStart(6)}`);
const nunca=KEYS.filter(k=>!top3(k));console.log('Nunca no top 3:',nunca.length?nunca.join(', '):'nenhum');

const med=v=>{v=[...v].sort((a,b)=>a-b);return v.length?v[Math.floor(v.length/2)]:NaN};
console.log('\nLitros por kg do 1º lugar, por nível (mín · mediana · máx · perfis)');
const NV=['Primeiras Ondas','Já Fica de Pé','Intermediário','Interm. Avançado','Avançado'];
for(let l=0;l<5;l++){const v=r.filter(x=>x.lvl===l).map(x=>x.fins[0].vol/x.peso);if(v.length)console.log(`${l} ${NV[l].padEnd(17)} ${Math.min(...v).toFixed(2)} · ${med(v).toFixed(2)} · ${Math.max(...v).toFixed(2)} · ${v.length}`)}

const pod=x=>x.fins.map(f=>f.k),has=(x,ks)=>pod(x).some(k=>ks.includes(k));
// onda grande: só no mar e fora de "para dias pequenos" (onde a regra não vale)
const mar=x=>x.onde!==1&&x.uso!==1;
// onda acima do que o nível costuma aguentar: Primeiras Ondas ≥ 1 m, Já Fica de Pé ≥ 1,5 m, Intermediário > 2,5 m
const acima=x=>(x.lvl===0&&x.tam>=2)||(x.lvl===1&&x.tam>=3)||(x.lvl===2&&x.tam===4);
const M=[
  ['A  Nível ≤ 1 com pranchinha, step-up ou gun em 1º',x=>x.lvl<=1&&['short','step','gun'].includes(pod(x)[0])],
  ['A2 Nível ≤ 1 com pranchinha, step-up ou gun no pódio',x=>x.lvl<=1&&has(x,['short','step','gun'])],
  ['B  Onda > 2,5 m, avançado, mar: 1º não é gun nem step-up',x=>x.tam===4&&x.lvl>=3&&mar(x)&&!['gun','step'].includes(pod(x)[0])],
  ['B2 Onda > 2,5 m, avançado, mar: sem gun e step-up no pódio',x=>x.tam===4&&x.lvl>=3&&mar(x)&&!(pod(x).includes('gun')&&pod(x).includes('step'))],
  ['B3 Onda > 2,5 m, avançado, mar: fish ou longboard em 1º',x=>x.tam===4&&x.lvl>=3&&mar(x)&&['fish','long','longp'].includes(pod(x)[0])],
  ['B4 Dias grandes, onda ≥ 1,5 m, nível ≥ 2: long, mid, fish ou groveler em 1º',x=>x.uso===2&&x.tam>=3&&x.lvl>=2&&['long','longp','minimal','mid','fish','grov'].includes(pod(x)[0])],
  ['C  Onda acima do nível (perfis)',acima],
  ['C2 Onda acima do nível sem aviso no relatório',x=>acima(x)&&!x.aviso],
  ['D  Pediu soft e o pódio não tem soft',x=>x.foam===1&&!has(x,['soft','softp'])],
  ['E  Primeiras Ondas com 1º abaixo de 0,7 L/kg',x=>x.lvl===0&&x.fins[0].vol/x.peso<0.7],
  ['F  Pranchinha em 1º acima de 6\'4" (76 pol.)',x=>pod(x)[0]==='short'&&x.d[0]>76.5],
  ['G  Pranchinha, biquilha, groveler ou fish em 1º acima de 0,6 L/kg',x=>['short','twin','grov','fish'].includes(pod(x)[0])&&x.fins[0].vol/x.peso>0.6],
];
console.log('\nPódios incoerentes');
for(const [n,f] of M){const c=r.filter(f).length;console.log(`${n.padEnd(76)} ${String(c).padStart(5)} ${pct(c,N).padStart(6)}`)}
const e=res.ex;console.log(`\nExemplo pronto: ${e.tipo} ${e.fit}% · ${e.V.toFixed(1)} L · ${e.L.toFixed(1)} pol. · pódio ${e.pod.join(', ')}`);
