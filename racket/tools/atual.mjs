#!/usr/bin/env node
/* Casos pareados com raquete atual conhecida (rodada 13) e contagem de perguntas por caminho.
   Uso: node racket/tools/atual.mjs [--base git:origin/main] [--json saida.json]
   - Para cada perfil-base com raquete conhecida, muda UMA resposta por vez ("o que manter" e "o que atrapalha")
     e compara o top 3 com o do próprio perfil-base. Catálogo e desempate fixos (ordem do CATALOG).
   - Na base (main), "o que atrapalha" só tem equivalente para "chego atrasado" (= pesada) e "treme" (= leve);
     "o que manter" não existe. Os demais aparecem como "sem equivalente".
   - Conta as perguntas visíveis (e as obrigatórias) em caminhos típicos, nas duas versões.
   Simulação não é validação: mostra o que a regra faz, não se a escolha melhora em quadra. */
import {createRequire} from 'module';import fs from 'fs';import path from 'path';import url from 'url';import http from 'http';import {execSync} from 'child_process';
const {chromium}=createRequire(import.meta.url)('playwright');
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null};
const lerHtml=v=>v.startsWith('git:')?execSync(`git show ${v.slice(4)}:racket/index.html`,{cwd:raiz,maxBuffer:64<<20}).toString():fs.readFileSync(path.resolve(raiz,v),'utf8');

const COMUM={age:'38',height:'175',weight:'75',cond:'2',arm:'no',years:'3',freq:'2',serve:'safe',style:['all'],opp:'mix',miss:'short',why:'feel',want:[],restr:'3m',imp:'yes',budget:'99999'};
const BASES=[
  {id:'int_com_Clash100v3',a:{...COMUM,lvl:'int',str:'mid',swing:'mid',spin:'mid',cur:'33'}},
  {id:'av_com_ProStaff97v14',a:{...COMUM,lvl:'adv',str:'high',cond:'3',years:'10',swing:'full',spin:'high',string:'?',tens:'?',cur:'38'}},
  {id:'ini_com_PureDriveLite',a:{...COMUM,lvl:'beg',str:'low',years:'0',cur:'6'}},
  {id:'int_dorHoje_com_PureAero',a:{...COMUM,lvl:'int',str:'mid',swing:'mid',spin:'mid',arm:'now',joint:['elbow'],pain:'2',lim:'1',cur:'1'}}
];
const KEEP=['comfort','control','maneuver','power','stability','spin'],ISSUE=['late','twist','depth','long','arm'];
const ISSUE_MAIN={none:'ok',late:'heavy',twist:'light'};
/* caminhos típicos para contar perguntas */
const CAMINHOS=[
  ['iniciante, sem dor, sem raquete',{...COMUM,lvl:'beg',str:'low',cur:'none'}],
  ['intermediário, sem dor, raquete do catálogo',{...COMUM,lvl:'int',str:'mid',swing:'mid',spin:'mid',cur:'33'}],
  ['intermediário, já teve dor, raquete fora da lista',{...COMUM,lvl:'int',str:'mid',swing:'mid',spin:'mid',cur:'other',arm:'past',joint:['elbow']}],
  ['avançado, dor hoje, raquete do catálogo',{...COMUM,lvl:'adv',str:'high',swing:'full',spin:'high',cur:'38',arm:'now',joint:['elbow']}],
  ['avançado, sem dor, sem raquete',{...COMUM,lvl:'adv',str:'high',swing:'full',spin:'high',cur:'none'}]
];

async function rodar(html,casos){
  const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/racket/'||u==='/racket/index.html'){s.writeHead(200,{'content-type':'text/html; charset=utf-8'});return s.end(html)}
    const f=path.join(raiz,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(raiz)||!fs.existsSync(f)){s.writeHead(404);return s.end()}s.end(fs.readFileSync(f))});
  await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const pg=await b.newPage();
  await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g/,r=>r.abort());
  await pg.goto(`http://localhost:${srv.address().port}/racket/?teste`);await pg.waitForFunction(()=>window.__RK);
  const out=await pg.evaluate(({casos,CAMINHOS})=>{const H=window.__RK,{A,Q,compute}=H;
    const set=a=>{Object.keys(A).forEach(k=>delete A[k]);let x=JSON.parse(JSON.stringify(a));if(H.cleanAnswers)x=H.cleanAnswers(x);Object.assign(A,x)};
    const res=casos.map(c=>{set(c.a);const R=compute();return {id:c.id,tw:R.tw,top3:R.ranked.slice(0,3).map(x=>[x.r.id,x.r.name,x.raw])}});
    const caminhos=CAMINHOS.map(([nome,a])=>{set(a);const V=Q.filter(q=>!q.if||q.if());return {nome,visiveis:V.length,obrigatorias:V.filter(q=>!q.opt).length,ids:V.map(q=>q.id)}});
    return {res,caminhos,temKeep:Q.some(q=>q.id==='keep')}},{casos,CAMINHOS});
  await b.close();srv.close();return out;
}
const casos=[];
for(const B of BASES){
  casos.push({id:`${B.id}|base`,a:{...B.a,keep:'none',issue:'none',feel:'ok'}});
  for(const k of KEEP)casos.push({id:`${B.id}|manter=${k}`,a:{...B.a,keep:k,issue:'none',feel:'ok'}});
  for(const i of ISSUE)casos.push({id:`${B.id}|atrapalha=${i}`,a:{...B.a,keep:'none',issue:i,feel:ISSUE_MAIN[i]||'ok'}});
}
const N=await rodar(fs.readFileSync(path.join(raiz,'racket/index.html'),'utf8'),casos);
const M=opt('--base')?await rodar(lerHtml(opt('--base')),casos.map(c=>{const a={...c.a};delete a.keep;delete a.issue;return {id:c.id,a}})):null;
const nome=t=>t.map(x=>`${x[1]} (${x[2]})`).join(' · ');
console.log(`RACKET DNA · casos pareados com raquete conhecida · ${casos.length} casos (${BASES.length} perfis-base × 1 resposta por vez)`);
const linhas=[];
for(const B of BASES){
  const b=N.res.find(x=>x.id===`${B.id}|base`),mb=M&&M.res.find(x=>x.id===`${B.id}|base`);
  console.log(`\n${B.id} · peso ideal ${b.tw} g${mb?` (main ${mb.tw} g)`:''}\n  base nova: ${nome(b.top3)}${mb?`\n  base main: ${nome(mb.top3)}`:''}`);
  for(const c of N.res.filter(x=>x.id.startsWith(B.id+'|')&&!x.id.endsWith('|base'))){
    const v=c.id.split('|')[1],eq=/atrapalha=(late|twist)/.test(v),m=M&&eq?M.res.find(x=>x.id===c.id):null;
    const t1=c.top3[0][0]!==b.top3[0][0],t3=JSON.stringify(c.top3.map(x=>x[0]).sort())!==JSON.stringify(b.top3.map(x=>x[0]).sort());
    linhas.push({caso:c.id,muda1:t1,mudaTop3:t3,top3:c.top3,base:b.top3,main:m?m.top3:null});
    console.log(`  ${v.padEnd(20)} ${t1?'1º muda':'1º igual'} · ${t3?'top 3 muda':(JSON.stringify(c.top3)!==JSON.stringify(b.top3)?'só a ordem/nota':'igual')} → ${nome(c.top3)}${m?`\n  ${''.padEnd(20)} main (${eq?'equivalente':''}): ${nome(m.top3)}`:(M&&!eq?`  [main: sem equivalente]`:'')}`)}
}
console.log('\nPerguntas por caminho (visíveis / obrigatórias):');
for(const c of N.caminhos){const m=M&&M.caminhos.find(x=>x.nome===c.nome);console.log(`  ${c.nome.padEnd(50)} nova ${c.visiveis}/${c.obrigatorias}${m?` · main ${m.visiveis}/${m.obrigatorias}`:''}`)}
if(opt('--json'))fs.writeFileSync(opt('--json'),JSON.stringify({casos:linhas,caminhos:{nova:N.caminhos,main:M&&M.caminhos}},null,1));
