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
     T14 resposta oculta não muda nota · T15 teto de SW (nível e ombro) com raquete conhecida de SW alto
     T16 EXAMPLE no formato novo · T17 contador público = caminhos reais = site · T18 iniciante sem número ideal único
     T22 iniciante com atual pesada · T23 mão no meio do cabo = pesada · T24 marca marginal fora do top 3 · T25 casos-guia (rodada 15) · T26 veredito da atual · T27 gerações anteriores (rodada 17) · T28 nota da atual sem critérios de compra (rodada 19)
     T19 estilo em 4 degraus (básico → completo) e compatibilidade · T20 resumo quando a raquete atual empata ou fica perto da recomendada
     T21 comparador sem placar e nas cores da marca
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
      const rot=H.penalties?RK.map(r=>H.penalties(r,null,R.tw).out.map(o=>o[1])).flat().filter(t=>/Peso de/.test(t)):[];
      return {raDelta:penaltyAt(70)-penaltyAt(66),id:pr.id,tw:R.tw,ra:R.Z.ra,zsw:R.Z.sw,rotPeso:[...new Set(rot)].slice(0,40),top3:R.ranked.slice(0,3).map(x=>[x.r.id,x.r.name,x.raw,x.fit,x.promo?1:0]),all,
        forte:H.dorForte?H.dorForte():null,aviso:pn,corda:st?[st.s,st.steps[0][1]]:null,conflito:A.painConflito||null,pesada}});
    const fam=H.familias?RK.filter(r=>r.q).map(r=>({id:r.id,q:r.q,a:H.familias(r.id).map(f=>f.a)})):null;const nenhuma=H.familias?RK.filter(r=>!H.familias(r.id).length).map(r=>r.id):null;
    const caminhos=H.contaCaminhos?H.contaCaminhos():null,ex=H.EXAMPLE?JSON.parse(JSON.stringify(H.EXAMPLE)):null;
    return {res,fam,nenhuma,caminhos,ex,semRev:RK.some(r=>r.semRev),semReview:PESOS.match.semReview??null,raMax:PESOS.zona.raMax}},P);
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

/* T14–T18 (rodada 13): respostas ocultas, teto de SW com raquete conhecida, EXAMPLE, contador público e textos do iniciante */
{const EX=[];for(const k in CAP){const a={...BASE,...CAP[k],age:'40',arm:'no'};
   EX.push({id:`limpo|${k}`,a:{...a,cur:'none'}},{id:`sujo|${k}`,a:{...a,cur:'none',issue:'late',keep:'control',feel:'heavy',curAge:'3'}},
           {id:`limpoOutra|${k}`,a:{...a,cur:'other',issue:'none'}},{id:`sujoOutra|${k}`,a:{...a,cur:'other',issue:'none',keep:'control'}})}
 /* SW alto conhecido: Pure Aero Rafa Origin (id 63, SW 371) e Percept 97H (id 140) com ombro e por nível */
 for(const [id,cur] of [['rafa','63'],['97H','140']])for(const lvl of ['beg','int','adv_int'])for(const om of [0,1])
   EX.push({id:`sw|${id}|${lvl}|${om?'ombro':'sem'}`,a:{...BASE,lvl,str:'mid',cond:'2',years:'3',swing:'mid',spin:'mid',age:'40',cur,issue:'none',keep:'none',arm:om?'now':'no',...(om?{joint:['shoulder'],pain:'1',lim:'0'}:{})}});
 const X=await rodar(cand,EX);const g=id=>X.res.find(x=>x.id===id);
 const bad=Object.keys(CAP).flatMap(k=>[igual(g('limpo|'+k),g('sujo|'+k))?null:k,igual(g('limpoOutra|'+k),g('sujoOutra|'+k))?null:k+'/outra']).filter(Boolean);
 teste('T14 resposta oculta não muda nota (perfil sujo = perfil limpo)',!bad.length,`${Object.keys(CAP).length*2} pares${bad.length?' · diferentes: '+bad.join(', '):''}`);
 const TETO={beg:312,int:320,adv_int:326},OMBRO=318;const swb=X.res.filter(x=>x.id.startsWith('sw|')).filter(x=>{const lvl=x.id.split('|')[2],cen=(x.zsw[0]+x.zsw[1])/2;return cen>TETO[lvl]||(x.id.endsWith('ombro')&&cen>OMBRO)});
 teste('T15 raquete conhecida de SW alto respeita teto de nível e de ombro',!swb.length,`${X.res.filter(x=>x.id.startsWith('sw|')).length} casos (Rafa Origin SW 371, Percept 97H)${swb.length?' · acima: '+swb.map(x=>x.id+' '+x.zsw).join(', '):''}`);}
{const ex=C.ex;const X=await rodar(cand,[{id:'ex',a:ex}]);const B=opt('--base')?await rodar(lerHtml(opt('--base')),[{id:'ex',a:ex}]):null;
 const r=X.res[0],cen=(r.zsw[0]+r.zsw[1])/2,cw=310,csw=328; /* EXAMPLE.cur é a Head Speed Pro (310 g, SW 328), definida na carga do app */
 /* rodada 15: "pesada" pede ao menos 15 g e 10 de SW abaixo da atual; o peso ideal pode mudar 1–2 g frente ao main pelo termo de corpo */
 teste('T16 EXAMPLE no formato novo mantém o efeito de "pesada" contra a raquete atual',!ex.feel&&!ex.curAge&&ex.issue==='late'&&r.tw<=cw-15&&cen<=csw-10&&(!B||Math.abs(B.res[0].tw-r.tw)<=3),`peso ideal ${r.tw} g (atual ${cw} g)${B?`, main ${B.res[0].tw} g`:''}; centro do SW ${cen} (atual ${csw})`)}
{const site=fs.readFileSync(path.join(raiz,'assets/site.js'),'utf8').match(/\["([^"]+)","perguntas"\]/);const cam=C.caminhos;
 teste('T17 contador público = caminhos reais = site',!!cam&&!!site&&site[1]===`${cam[0]} a ${cam[1]}`,`app ${cam&&cam.join(' a ')} · site ${site&&site[1]}`)}
{const L=C.res.filter(x=>/K1_ini_fraco/.test(x.id));const bad=L.filter(x=>x.rotPeso.some(t=>/ideal/.test(t)));
 teste('T18 iniciante sem referência: penalidade de peso fala em faixa, não em ideal único',!bad.length,`${L.length} perfis${bad.length?' · ex.: '+bad[0].rotPeso.find(t=>/ideal/.test(t)):''}`)}
/* T19–T20 (rodada 14): estilo em 4 opções e resumo quando a raquete atual empata ou fica perto da recomendada */
{const X=await (async()=>{const html=cand;const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/racket/'){s.writeHead(200,{'content-type':'text/html; charset=utf-8'});return s.end(html)}const f=path.join(raiz,u);if(!fs.existsSync(f)){s.writeHead(404);return s.end()}s.end(fs.readFileSync(f))});
  await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const pg=await b.newPage();await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g|googletag|google-analytics|facebook|doubleclick/,r=>r.abort());
  await pg.goto(`http://localhost:${srv.address().port}/racket/?teste`);await pg.waitForFunction(()=>window.__RK);
  const o=await pg.evaluate(()=>{const H=window.__RK,RK=H.RK;const q=H.Q.find(x=>x.id==='style');
    const leg=[[['keep'],'keep'],[['netc'],'all'],[['net'],'all'],[['agg','all'],'all'],[['agg','net'],'all'],[['keep','cnt'],'cnt'],['net','all'],['agg','agg']].map(([v,e])=>H.cleanAnswers({style:v}).style===e);
    const r=(id,fit)=>({r:RK[id],fit});const pro=RK.find(x=>/Pro Staff 97 v14/.test(x.model)),cl=RK.find(x=>/^Clash 100 v3$/.test(x.model));
    return {opcoes:q.o.map(x=>x[0]),multi:!!q.multi,scale:JSON.stringify(q.scale||null),leg,
      duel:H.duelHTML(pro,cl,false),
      empate:H.closeRacketFit(r(pro.id,95),r(cl.id,95)),perto:H.closeRacketFit(r(pro.id,93),r(cl.id,95)),longe:H.closeRacketFit(r(pro.id,90),r(cl.id,95)),igual:H.closeRacketFit(r(pro.id,95),r(pro.id,95))}});
  await b.close();srv.close();return o})();
 teste('T19 estilo: 4 degraus do básico ao jogo completo, uma escolha, com régua; respostas antigas viram um dos 4',JSON.stringify(X.opcoes)==='["keep","cnt","agg","all"]'&&!X.multi&&X.scale==='["Mais básico","Mais avançado"]'&&X.leg.every(Boolean),`${X.opcoes.join(', ')} · compatibilidade ${X.leg.filter(Boolean).length}/${X.leg.length}`);
 teste('T21 comparador sem placar: sem "ganha em", sem contagem de vitórias, sem a cor fora da marca; com "o que muda na mão"',!/ganha em|tdots|tally|class="[^"]*\bwin\b|var\(--alt\)/.test(X.duel)&&/O que muda na mão/.test(X.duel),'Pro Staff 97 v14 × Clash 100 v3');
 teste('T20 raquete atual empatada ou perto: resumo diz que empata e o que muda na mão',/empata/.test(X.empate)&&/não precisa trocar/.test(X.empate)&&/Na mão, a Clash 100 v3 seria/.test(X.empate)&&/só 2 pontos/.test(X.perto)&&X.longe===''&&/muito parecidas/.test(X.igual),X.empate.slice(0,160)+'…')}

/* T22–T24 (rodada 15): iniciante e raquete atual pesada; marcas marginais; casos-guia */
{const X=await (async()=>{const html=cand;const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/racket/'){s.writeHead(200,{'content-type':'text/html; charset=utf-8'});return s.end(html)}const f=path.join(raiz,u);if(!fs.existsSync(f)){s.writeHead(404);return s.end()}s.end(fs.readFileSync(f))});
  await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const pg=await b.newPage();await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g|googletag|google-analytics|facebook|doubleclick/,r=>r.abort());
  await pg.goto(`http://localhost:${srv.address().port}/racket/?teste`);await pg.waitForFunction(()=>window.__RK);
  const o=await pg.evaluate(()=>{const H=window.__RK,{A,RK,compute}=H;const set=a=>{Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,H.cleanAnswers(JSON.parse(JSON.stringify(a))))};
    const mp=RK.find(r=>r.name==='Head Speed MP'),ps=RK.find(r=>r.name==='Wilson Pro Staff 97 v14');
    const B={age:'35',height:'163',weight:'60',str:'mid',cond:'2',arm:'no',lvl:'beg',years:'0',freq:'2',serve:'push',style:'keep',opp:'mix',miss:'net',why:'feel',want:[],restr:'3m',imp:'yes',budget:'99999',keep:'none'};
    const out=[];for(const cur of [mp,ps])for(const issue of ['none','late','turn','twist','depth','long','arm'])for(const hold of [undefined,'end','mid','thick','thin']){
      set({...B,cur:String(cur.id),issue,...(hold?{hold}:{})});const R=compute();out.push({id:`${cur.name}|${issue}|${hold||'-'}`,tw:R.tw,top:R.ranked.slice(0,3).map(x=>[x.r.name,x.r.wt,x.r.head,x.r.brand])})}
    set({...B,cur:String(mp.id),issue:'none',hold:'mid'});const mid=compute();set({...B,cur:String(mp.id),issue:'late'});const late=compute();
    const marg=[];for(const lvl of ['beg','int','adv_int','adv'])for(const imp of ['yes','no'])for(const want of [[],['comfort'],['control']]){set({...B,lvl,imp,want,cur:'none',swing:'mid',spin:'mid',str:'mid'});marg.push(...compute().ranked.slice(0,3).filter(x=>['ProKennex','Volkl'].includes(x.r.brand)).map(x=>x.r.name))}
    return {out,midTw:mid.tw,lateTw:late.tw,marg}});
  await b.close();srv.close();return o})();
 const ruim=X.out.filter(x=>x.tw>282||x.top.some(t=>t[1]>290||t[2]<100));
 teste('T22 iniciante com raquete atual de 300–315 g: nenhuma resposta leva o ideal acima de 282 g nem põe raquete de 290 g+ ou cabeça < 100 no top 3',!ruim.length,`${X.out.length} combinações (Speed MP e Pro Staff 97 × 7 queixas × 5 jeitos de segurar)${ruim.length?' · ex.: '+ruim[0].id+' '+ruim[0].tw+' g → '+ruim[0].top.map(t=>t[0]+' '+t[1]+' g').join(', '):''}`);
 teste('T23 mão no meio do cabo vale como "pesada"',X.midTw===X.lateTw,`meio do cabo ${X.midTw} g · "ela pesa" ${X.lateTw} g`);
 teste('T24 marca marginal no Brasil (ProKennex, Volkl) fora do top 3 em perfis típicos sem raquete',!X.marg.length,`24 perfis${X.marg.length?' · '+X.marg.join(', '):''}`)}
{let ok=true,txt='';try{const o=execSync('node racket/tools/casos-guia.mjs',{cwd:raiz,maxBuffer:16<<20}).toString();txt=(o.match(/Resultado: .*/)||[''])[0]}catch(e){ok=false;txt=((e.stdout||'').toString().match(/Resultado: .*/)||['falhou'])[0]}
 teste('T25 casos-guia (docs/racket/dados/casos-guia.json): todos ok',ok,txt)}

/* T26 (rodada 17): veredito da raquete atual, grátis na prévia */
{const X=await (async()=>{const html=cand;const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/racket/'){s.writeHead(200,{'content-type':'text/html; charset=utf-8'});return s.end(html)}const f=path.join(raiz,u);if(!fs.existsSync(f)){s.writeHead(404);return s.end()}s.end(fs.readFileSync(f))});
  await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const pg=await b.newPage();await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g|googletag|google-analytics|facebook|doubleclick/,r=>r.abort());
  await pg.goto(`http://localhost:${srv.address().port}/racket/?teste`);await pg.waitForFunction(()=>window.__RK);
  const o=await pg.evaluate(()=>{const V=window.__RK.verdictAtual,b={fit:95},P=[[2,'x']];
    return [V({fit:93,pen:P},b).k,V({fit:95,pen:[]},b).k,V({fit:88,pen:P},b).k,V({fit:78,pen:[]},b).k,V({fit:84,pen:P},b).k,V({fit:80,pen:P},b).k,V({fit:70,pen:P},b).k]});
  const o2=await pg.evaluate(()=>{const H=window.__RK,G=H.GERACOES;const lin=t=>t.replace(/ (v\d+|20\d\d.*|\d+ª geração|7ª geração)$/,'').split(' ')[0];
    const ruins=G.filter(g=>!g.to||g.to.brand!==g.brand).map(g=>g.name);
    const c=H.cleanAnswers({cur:'none',curOld:'Babolat Pure Drive 2021'});return {n:G.length,ok:G.length>=100&&!ruins.length,ruins,limpa:!('curOld' in c)}});
  const o3=await pg.evaluate(()=>{const H=window.__RK,{A,RK,compute}=H;const set=x=>{Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,H.cleanAnswers(JSON.parse(JSON.stringify(x))))};
    const b={age:'40',height:'180',weight:'80',str:'high',cond:'2',arm:'now',joint:['elbow'],pain:'2',lim:'1',lvl:'adv_int',years:'10',freq:'2',swing:'full',spin:'mid',serve:'flat',style:'agg',opp:'mix',miss:'long',keep:'comfort',issue:'none',hold:'end',why:'feel',want:['power','spin'],string:'poly',tens:'52',restr:'3m'};
    const out=[];for(const cur of ['ProKennex Black Ace 300','Tecnifibre TFight 300S','Wilson Clash 100 v3']){const f=[];for(const imp of ['yes','no'])for(const budget of ['1400','99999']){set({...b,cur:String(RK.findIndex(r=>r.name===cur)),imp,budget});const R=compute();f.push(R.curFit.raw+'|'+(R.curFit.pen.some(p=>/no Brasil|nicho|orçamento|Avaliação fraca|^Não ganha/.test(p[1]))?'x':''))}out.push([cur,f])}return out});
  globalThis.X3=o3;
  globalThis.X2=o2;await b.close();srv.close();return o})();
 const X2=globalThis.X2;
 teste('T27 gerações anteriores: todas apontam para uma versão atual da mesma marca e linha; sem raquete, a geração antiga some',X2.ok&&X2.limpa,`${X2.n} gerações${X2.ruins.length?' · sem destino: '+X2.ruins.join(', '):''}`);
 const X3=globalThis.X3;
 teste('T28 nota bruta da atual mede só o encaixe: não muda com marca, oferta no Brasil, orçamento nem avaliação de testadores',X3.every(([,f])=>new Set(f).size===1&&!f[0].includes('x')),X3.map(([c,f])=>c+' bruta '+f[0].split('|')[0]+' ('+new Set(f).size+' valor)').join(' · '));
 teste('T26 veredito da atual (escala 1,2): aderente (89%+ e até 4 pontos), ajuste fino (82%+ e até 12, ou sem nada contra e 76%+), trocar',JSON.stringify(X)===JSON.stringify(['fica','fica','fino','fino','fino','trocar','trocar']),X.join(', '))}

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
