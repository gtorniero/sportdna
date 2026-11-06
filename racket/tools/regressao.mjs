#!/usr/bin/env node
/* Regressão do motor do RACKET DNA (rodada 12: dor atual × histórico, degrau dos 60 anos, neutralidade de evidência).
   Uso: node racket/tools/regressao.mjs [--base git:origin/main | --base arquivo.html] [--cand arquivo.html] [--json saida.json] [--atualizar]
   - Roda os MESMOS perfis fixos (gerados aqui, deterministas) na versão candidata (racket/index.html) e, se pedido, na base.
   - Catálogo e desempate fixos: o motor ordena pelo score bruto inteiro e, no empate, pela ordem do CATALOG.
   - Testes (falham com código 1):
     T1  histórico forte = histórico leve (mesmas notas em todas as raquetes)
     T2  histórico não aciona regra de dor atual (zona de rigidez, aviso, corda)
     T3  código antigo contraditório ("já tive" + "em tratamento"): marcado para revisão, sem regra de dor forte
     T4  dor forte HOJE mantém as regras de dor forte
     T5  dor leve hoje: sem regra de dor forte
     T6  sem degrau de idade: 59, 60 e 61 anos dão as mesmas notas
     T7  força baixa continua penalizando raquete de 310 g ou mais; força média não
     T8  review isolada (uma família de fonte) não muda nenhuma nota
     T9  uma família dissidente não apaga um sinal corroborado por duas
     T10 nenhuma aprovação vem de uma família só
     T11 ausência de review não penaliza
     T12 snapshot: top 3 de cada perfil igual ao registrado em docs/racket/dados/regressao/esperado.json (--atualizar regrava)
     T13 proveniência dos dados de reviews: elegível só com página aberta, sem transferir geração, autoria da conferência
   - Relatórios (não falham): remoção de fonte (sem TW, sem sites da rodada 1, sem EVID) e base × candidata.
   Simulação não é validação de qualidade: estes testes só garantem que as regras fazem o que dizem. */
import {createRequire} from 'module';import fs from 'fs';import path from 'path';import url from 'url';import http from 'http';import {execSync} from 'child_process';
const {chromium}=createRequire(import.meta.url)('playwright');
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null};const flag=k=>args.includes(k);
const ESPERADO=path.join(raiz,'docs/racket/dados/regressao/esperado.json');

/* ---------- perfis fixos ---------- */
const IDADES=[54,55,56,59,60,61];
const DOR={
  D0_nunca:{arm:'no'},
  /* forma antiga (códigos salvos antes da rodada 12): intensidade e limitação também para "já tive" */
  D1_passado_leve_antigo:{arm:'past',joint:['elbow'],pain:'1',lim:'0'},
  D2_passado_forte_antigo:{arm:'past',joint:['elbow'],pain:'3',lim:'0'},
  D3_passado_tratamento_antigo:{arm:'past',joint:['elbow'],pain:'3',lim:'3'},
  D4_hoje_leve:{arm:'now',joint:['elbow'],pain:'1',lim:'0'},
  D5_hoje_forte:{arm:'now',joint:['elbow'],pain:'3',lim:'0'},
  D6_hoje_forte_tratamento:{arm:'now',joint:['elbow'],pain:'3',lim:'3'},
  /* forma nova: histórico com perguntas próprias */
  D7_passado_forte:{arm:'past',joint:['elbow'],painPast:'3',painAgo:'2y'},
  D8_passado_leve:{arm:'past',joint:['elbow'],painPast:'1',painAgo:'2y'}
};
const CAP={
  K1_ini_fraco:{lvl:'beg',str:'low',cond:'1',years:'0'},
  K2_int_medio:{lvl:'int',str:'mid',cond:'2',years:'3',swing:'mid',spin:'mid'},
  K3_av_forte:{lvl:'adv',str:'high',cond:'3',years:'10',swing:'full',spin:'high',string:'?',tens:'?'},
  K4_av_muito_forte:{lvl:'adv',str:'vhigh',cond:'3',years:'10',swing:'full',spin:'high',string:'?',tens:'?',height:'190',weight:'90',opp:'heavy'}
};
const BASE={height:'175',weight:'75',freq:'2',serve:'safe',style:['all'],opp:'mix',miss:'short',cur:'none',why:'broken',want:[],restr:'3m',imp:'yes',budget:'99999'};
const PERFIS=[];
for(const a of IDADES)for(const [dk,dv] of Object.entries(DOR))for(const [kk,kv] of Object.entries(CAP))PERFIS.push({id:`${a}|${dk}|${kk}`,a:{...BASE,...kv,...dv,age:String(a)}});
/* casos concretos da rodada anterior (input completo) */
PERFIS.push({id:'caso_idade_60_av_muito_forte_sem_dor',a:{age:'60',height:'190',weight:'90',str:'vhigh',cond:'3',arm:'no',lvl:'adv',years:'10',freq:'2',swing:'full',spin:'high',serve:'safe',style:['all'],opp:'heavy',miss:'short',cur:'none',why:'broken',want:[],string:'?',tens:'?',restr:'3m',imp:'yes',budget:'99999'}});
PERFIS.push({id:'caso_dor_59_av_forte_historico_forte',a:{age:'59',height:'175',weight:'75',str:'high',cond:'3',arm:'past',joint:['elbow'],pain:'3',lim:'0',lvl:'adv',years:'10',freq:'2',swing:'full',spin:'high',serve:'safe',style:['all'],opp:'mix',miss:'short',cur:'none',why:'broken',want:[],string:'?',tens:'?',restr:'3m',imp:'yes',budget:'99999'}});

/* ---------- execução ---------- */
const lerHtml=v=>v.startsWith('git:')?execSync(`git show ${v.slice(4)}:racket/index.html`,{cwd:raiz,maxBuffer:64<<20}).toString():fs.readFileSync(path.resolve(raiz,v),'utf8');
async function rodar(html,P=PERFIS){
  const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/racket/'||u==='/racket/index.html'){s.writeHead(200,{'content-type':'text/html; charset=utf-8'});return s.end(html)}
    const f=path.join(raiz,u.endsWith('/')?u+'index.html':u);if(!f.startsWith(raiz)||!fs.existsSync(f)){s.writeHead(404);return s.end()}s.end(fs.readFileSync(f))});
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH});const pg=await b.newPage();
  await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g/,r=>r.abort());
  await pg.goto(`http://127.0.0.1:${srv.address().port}/racket/?teste`);await pg.waitForFunction(()=>window.__RK);
  const out=await pg.evaluate(P=>{const H=window.__RK,{A,compute,RK,PESOS}=H;
    const res=P.map(pr=>{Object.keys(A).forEach(k=>delete A[k]);let a=JSON.parse(JSON.stringify(pr.a));if(H.cleanAnswers)a=H.cleanAnswers(a);Object.assign(A,a);
      const R=compute();const all={};R.all.forEach(x=>{all[x.r.id]=x.raw});
      const st=H.stringSetup?H.stringSetup(R.ranked[0].r):null;const pn=H.painNote?(H.painNote(false).match(/<strong>([^<]*)/)||[,''])[1]:null;
      const pesada=H.penalties?RK.filter(r=>r.wt>=310&&H.penalties(r,null,R.tw).out.some(o=>/^Pesada/.test(o[1]))).length:null;
      const penaltyAt = ra => H.penalties?.({...RK[0],ra},null,R.tw).p;
      return {raDelta:penaltyAt(70)-penaltyAt(66),id:pr.id,tw:R.tw,ra:R.Z.ra,top3:R.ranked.slice(0,3).map(x=>[x.r.id,x.r.name,x.raw,x.fit,x.promo?1:0]),all,
        forte:H.dorForte?H.dorForte():null,aviso:pn,corda:st?[st.s,st.steps[0][1]]:null,conflito:A.painConflito||null,pesada}});
    const fam=H.familias?RK.filter(r=>r.q).map(r=>({id:r.id,q:r.q,a:H.familias(r.id).map(f=>f.a)})):null;const nenhuma=H.familias?RK.filter(r=>!H.familias(r.id).length).map(r=>r.id):null;
    return {res,fam,nenhuma,semRev:RK.some(r=>r.semRev),semReview:PESOS.match.semReview??null,raMax:PESOS.zona.raMax}},P);
  await b.close();srv.close();return out;
}
const comEvid=(html,fn)=>{const m=html.match(/const EVID=(\{.*?\});\n/);const E=JSON.parse(m[1]);fn(E);return html.replace(m[0],'const EVID='+JSON.stringify(E)+';\n')};
const igual=(x,y)=>JSON.stringify(x.all)===JSON.stringify(y.all);

const cand=opt('--cand')?lerHtml(opt('--cand')):fs.readFileSync(path.join(raiz,'racket/index.html'),'utf8');
const C=await rodar(cand);const byId=Object.fromEntries(C.res.map(x=>[x.id,x]));
const T=[];const teste=(nome,ok,det='')=>{T.push({nome,ok,det});console.log(`${ok?'ok  ':'FALHA'} ${nome}${det?' · '+det:''}`)};
const get=(a,d,k)=>byId[`${a}|${d}|${k}`];
console.log(`RACKET DNA · regressão · ${PERFIS.length} perfis · catálogo ${Object.keys(C.res[0].all).length} raquetes`);
{let n=0,bad=[];for(const a of IDADES)for(const k in CAP){const g=['D1_passado_leve_antigo','D2_passado_forte_antigo','D7_passado_forte','D8_passado_leve'].map(d=>get(a,d,k));n++;if(!g.every(x=>igual(x,g[0])))bad.push(`${a}|${k}`)}
 teste('T1 histórico forte = histórico leve (forma nova e antiga)',!bad.length,`${n-bad.length}/${n} grupos${bad.length?' · falhou '+bad.slice(0,3).join(', '):''}`)}
{const L=C.res.filter(x=>/\|D(1|2|7|8)_/.test(x.id));const bad=L.filter(x=>x.forte||x.raDelta!==0||x.ra[1]!==C.raMax.nenhuma||!/^Histórico/.test(x.aviso||'')||(x.corda&&x.corda[1]===48));
 teste('T2 histórico não aciona dor atual (rigidez da zona, aviso, corda)',!bad.length,`${L.length-bad.length}/${L.length}`)}
{const L=C.res.filter(x=>/\|D3_/.test(x.id));const bad=L.filter(x=>x.forte||x.conflito!=='tratamento'||!igual(x,byId[x.id.replace('D3_passado_tratamento_antigo','D1_passado_leve_antigo')]));
 teste('T3 código antigo contraditório: marcado para revisão, regras de histórico',!bad.length,`${L.length-bad.length}/${L.length}`)}
{const L=C.res.filter(x=>/\|D(5|6)_/.test(x.id));const bad=L.filter(x=>!x.forte||x.ra[1]!==C.raMax.forte||!/Dor forte/.test(x.aviso||'')||(x.corda&&(x.corda[0]!=='Multifilamento 1,30 mm'||x.corda[1]!==48)));
 teste('T4 dor forte hoje mantém as regras de dor forte',!bad.length,`${L.length-bad.length}/${L.length}`)}
{const L=C.res.filter(x=>/\|D4_/.test(x.id));const bad=L.filter(x=>x.forte||x.ra[1]!==C.raMax.hojeCotovelo);teste('T5 dor leve hoje: sem regra de dor forte',!bad.length,`${L.length-bad.length}/${L.length}`)}
{let n=0,bad=[];for(const d in DOR)for(const k in CAP){n++;const g=[59,60,61].map(a=>get(a,d,k));if(!g.every(x=>igual(x,g[0])))bad.push(`${d}|${k}`)}
 teste('T6 sem degrau de idade: 59 = 60 = 61',!bad.length,`${n-bad.length}/${n}`)}
{const fr=C.res.filter(x=>/K1_ini_fraco/.test(x.id)),md=C.res.filter(x=>/K2_int_medio/.test(x.id));const nPesadas=Object.keys(C.res[0].all).length&&fr[0].pesada;
 teste('T7 força baixa penaliza 310 g+; força média não',fr.every(x=>x.pesada>0&&x.pesada===nPesadas)&&md.every(x=>x.pesada===0),`força baixa: ${nPesadas} raquetes penalizadas em ${fr.length} perfis; força média: 0 em ${md.length}`)}
/* T8: uma família de fonte nova, sozinha, em raquetes sem review nenhuma, com sinal positivo e com sinal negativo */
const semReview=C.nenhuma||[];
const alvo=[...semReview].filter((_,j)=>j%15===0).slice(0,12);
{const D={a:1,d:{power:1,control:1,spin:1,comfort:1,maneuver:1,stability:1}},N={a:-1,d:{power:-1,control:-1,spin:-1,comfort:-1,maneuver:-1,stability:-1}};
 const h=comEvid(cand,E=>alvo.forEach((i,j)=>{E[i]={...(E[i]||{}),['Fonte isolada de teste']:j%2?N:D}}));const X=await rodar(h);
 const dif=X.res.filter((x,j)=>!igual(x,C.res[j])).length;teste('T8 review isolada não muda nenhuma nota',dif===0,`${alvo.length} raquetes sem nenhuma fonte recebem 1 fonte isolada (+ ou −); perfis alterados: ${dif}/${X.res.length}`)}
/* T9: uma família dissidente contra um sinal corroborado */
{const cor=(C.fam||[]).filter(f=>f.a.filter(s=>s===Math.sign(f.q)).length>=2);
 const h=comEvid(cand,E=>cor.forEach(f=>{const s=-Math.sign(f.q);E[f.id]={...(E[f.id]||{}),['Fonte dissidente de teste']:{a:s,d:{}}}}));const X=await rodar(h);
 const dif=X.res.filter((x,j)=>!igual(x,C.res[j])).length;teste('T9 uma família dissidente não apaga sinal de duas',dif===0,`${cor.length} raquetes com aprovação corroborada recebem 1 fonte contrária; perfis alterados: ${dif}`)}
{const bad=(C.fam||[]).filter(f=>f.a.filter(s=>s===Math.sign(f.q)).length<2);teste('T10 nenhuma aprovação vem de uma família só',!bad.length,`${(C.fam||[]).length} raquetes com aprovação ≠ 0; todas com 2+ famílias na mesma direção`)}
teste('T11 ausência de review não penaliza',!C.semRev&&C.semReview==null,'sem match.semReview e sem r.semRev');
{const snap=C.res.map(x=>[x.id,x.top3.map(t=>t[0])]);
 if(flag('--atualizar')||!fs.existsSync(ESPERADO)){fs.mkdirSync(path.dirname(ESPERADO),{recursive:true});fs.writeFileSync(ESPERADO,JSON.stringify({gerado:'racket/tools/regressao.mjs',perfis:snap.length,top3:Object.fromEntries(snap)},null,0)+'\n');console.log('     snapshot gravado: '+path.relative(raiz,ESPERADO))}
 const E=JSON.parse(fs.readFileSync(ESPERADO,'utf8')).top3;const dif=snap.filter(([id,t])=>JSON.stringify(E[id])!==JSON.stringify(t));
 teste('T12 snapshot do top 3',!dif.length,`${snap.length-dif.length}/${snap.length} iguais${dif.length?' · primeiro diferente: '+dif[0][0]:''}`)}

/* T13: proveniência e não-transferência nos dados de reviews (docs/racket/dados/reviews/derivado/reviews.json) */
{const D=JSON.parse(fs.readFileSync(path.join(raiz,'docs/racket/dados/reviews/derivado/reviews.json'),'utf8')).registros;const bad=[];
 D.forEach(r=>{const g=String(r.geracao||'')+' '+String(r.variant_id||'');
   if(r.elegibilidade==='elegivel'&&r.base!=='pagina')bad.push('elegível sem página aberta: '+r.url_canonica);
   if(/ripstick-100-300g|prince-ripstick-review-first/.test(r.url_canonica)&&((r.catalogo_ids||[]).length||r.catalogo_provavel!=null))bad.push('Ripstick 2021 ligada ao catálogo');
   if(/conferido/.test(r.verificado_em||'')&&!/Codex/.test(r.verificado_em))bad.push('conferência sem autoria do Codex');
   if(r.elegibilidade==='elegivel'&&r.metodo_nota==='laboratorio')bad.push('laboratório como nota de quadra');
   if(r.elegibilidade==='elegivel'&&/testador individual/i.test(r.notas_evidencia||''))bad.push('testador individual elegível')});
 teste('T13 proveniência: elegível só com página aberta; geração 2021 não vai para 2025; autoria da conferência',!bad.length,`${D.length} registros${bad.length?' · '+bad.slice(0,2).join(' | '):''}`)}

/* ---------- relatórios ---------- */
const rel={};const mudou=(X,Y)=>({perfis:X.res.length,top1:X.res.filter((x,j)=>x.top3[0][0]!==Y.res[j].top3[0][0]).length,top3:X.res.filter((x,j)=>JSON.stringify(x.top3.map(t=>t[0]).sort())!==JSON.stringify(Y.res[j].top3.map(t=>t[0]).sort())).length,score:X.res.filter((x,j)=>!igual(x,Y.res[j])).length});
console.log('\nRemoção de fonte (sensibilidade, não é teste):');
for(const [nome,fn] of [['sem Tennis Warehouse (TWD)',h=>h.replace(/const TWD=\{.*?\};\n/,'const TWD={};\n')],['sem sites da rodada 1 (RV)',h=>h.replace(/const RV=\{.*?\};\n/,'const RV={};\n')],['sem EVID (fontes novas: lote 1, lote 2 e conferências)',h=>h.replace(/const EVID=\{.*?\};\n/,'const EVID={};\n')]]){
  const X=await rodar(fn(cand));rel[nome]=mudou(X,C);console.log(`  ${nome}: top 1 muda em ${rel[nome].top1}, composição do top 3 em ${rel[nome].top3}, alguma nota em ${rel[nome].score} de ${X.res.length} perfis`)}
if(opt('--base')){const B=await rodar(lerHtml(opt('--base')));rel.base=mudou(C,B);
  console.log(`\nBase (${opt('--base')}) × candidata: top 1 muda em ${rel.base.top1}, composição do top 3 em ${rel.base.top3}, alguma nota em ${rel.base.score} de ${C.res.length} perfis`);
  const grupos=[...Object.keys(DOR),'caso_'];for(const g of grupos){const J=C.res.map((x,j)=>[x,B.res[j]]).filter(([x])=>x.id.includes(g));if(!J.length)continue;
    console.log(`  ${g.padEnd(30)} top1 ${J.filter(([x,y])=>x.top3[0][0]!==y.top3[0][0]).length}/${J.length} · top3 ${J.filter(([x,y])=>JSON.stringify(x.top3.map(t=>t[0]).sort())!==JSON.stringify(y.top3.map(t=>t[0]).sort())).length}/${J.length}`)}
  for(const id of ['caso_idade_60_av_muito_forte_sem_dor','caso_dor_59_av_forte_historico_forte']){const x=byId[id],y=B.res.find(r=>r.id===id);
    console.log(`  ${id}\n    base  ${y.top3.map(t=>`${t[1]} (${t[2]})`).join(' · ')}\n    cand  ${x.top3.map(t=>`${t[1]} (${t[2]})`).join(' · ')}`)}
  rel.perfis=C.res.map((x,j)=>({id:x.id,base:B.res[j].top3,cand:x.top3}));
  rel.casos=Object.fromEntries(['caso_idade_60_av_muito_forte_sem_dor','caso_dor_59_av_forte_historico_forte'].map(id=>[id,{base:B.res.find(r=>r.id===id).top3,cand:byId[id].top3}]));}
if(opt('--json'))fs.writeFileSync(opt('--json'),JSON.stringify({testes:T,relatorios:rel,cand:C.res.map(x=>({id:x.id,top3:x.top3}))},null,1));
const f=T.filter(t=>!t.ok).length;console.log(`\n${T.length-f}/${T.length} testes ok`);process.exit(f?1:0);
