// Calibração do motor do RUN DNA contra casos de especialistas.
// Uso: node run/tools/calibrar.mjs docs/tenis/dados/casos.json [--ajustar] [--so=orc]
// --so=prefixo: com --ajustar, só mexe nos pesos cujo nome começa com o prefixo (ex.: orc = pesos do orçamento)
// Abre run/index.html num Chromium (Playwright), converte cada caso em respostas do questionário,
// mede acerto (um tênis indicado pelos especialistas no nosso top 3 / top 10) e, com --ajustar,
// procura pesos melhores por descida coordenada, validando em casos que ficam fora do ajuste.
import {createRequire} from 'module';
const {chromium}=createRequire(import.meta.url)('playwright');
import fs from 'fs';import path from 'path';import url from 'url';
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const [,,arqCasos,...flags]=process.argv;
const casos=JSON.parse(fs.readFileSync(arqCasos,'utf8')).casos;
const html=fs.readFileSync(path.join(raiz,'run/index.html'),'utf8');
const i=html.indexOf('const KMW=');const j=html.indexOf('\n',i)+1;
const tmp=path.join(raiz,'run/tools/.motor.html');
const h2=html.slice(0,j)+'window.__T={engine,M,PESOS,get sm(){return window.__sm}};\n'+html.slice(j);
fs.writeFileSync(tmp,h2.replace('  let ranked=M.map(m=>({m,s:sm(m)}))','  window.__sm=sm;\n  let ranked=M.map(m=>({m,s:sm(m)}))'));
const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+tmp);fs.unlinkSync(tmp);
const so=(flags.find(f=>f.startsWith('--so='))||'').slice(5);
const r=await p.evaluate(({casos,ajustar,so})=>{
  const {engine,M,PESOS}=window.__T;
  const idx=(v,m,d)=>v==null?d:(m[v]??d);
  // guia "barato" sem valor em R$: a faixa até R$ 500 (antes era R$ 400 a 700, que não existe mais)
  const ORC_BARATO=[0];
  const resp=c=>{const f=c.perfil||{};const a={};
    a.peso={leve:60,medio:72,pesado:90}[f.peso]??72;
    a.largura=idx(f.largura,{estreito:0,normal:1,largo:2},1);
    a.dor=idx(f.dor,{nenhuma:0,joelho:1,canela:2,sola_calcanhar:3,tornozelo:4,quadril_lombar:5,aquiles:6},0);
    a.pisada=idx(f.pisada,{calcanhar:0,meio:1,antepe:2},3);
    const nv=idx(f.nivel,{iniciante:0,intermediario:1,avancado:2},1);
    a.tempo=[1,2,4][nv];a.pace=[1,2,4][nv];a.km=idx(f.km_semana,{'<10':0,'10-20':1,'20-40':2,'40-60':3,'>60':4},[0,2,3][nv]);
    a.terreno=idx(f.terreno,{asfalto:0,esteira:1,terra:2,trilha_tecnica:3},0);
    a.obj=idx(f.objetivo,{comecar:0,'5_10km':1,meia:2,maratona:3,trilha:4,dia_a_dia:5},nv===0?0:2);
    if(a.terreno===3&&f.objetivo==null)a.obj=4;
    a.treino=idx(f.ritmo,{nao:0,as_vezes:1,toda_semana:2},nv===2?1:0);
    a.sens=idx(f.sensacao,{macio:0,equilibrio:1,firme:2},1);
    a.prior=idx(f.prioridade,{conforto:0,durabilidade:1,leveza:2,preco:3},0);
    a.neutro=f.desconforto_neutro===true?1:0;
    const brl=f.orcamento_brl??(f.orcamento_usd!=null?f.orcamento_usd*5.4:null);
    // faixas do app (pode marcar mais de uma): 0 até R$ 500, 1 R$ 500 a 1.000, 2 R$ 1.000 a 1.500, 3 acima de R$ 1.500 ou sem limite
    a.orc=brl==null?[3]:brl<=500?[0]:brl<=1000?[1]:brl<=1500?[2]:[3];
    // ajustes de leitura do caso pelo nome da categoria do guia (o perfil da fonte vem incompleto)
    const cat=(c.categoria_original||'').toLowerCase();
    a.pares=0;
    if(/carbon|racing|race|racer|super ?shoe|marathon racer|prova|competi/.test(cat)){a.tempo=4;a.pace=4;a.km=Math.max(a.km,3);a.treino=2;a.pares=1;if(f.objetivo==null)a.obj=/5k|10k|5 km|10 km/.test(cat)?1:3}
    else if(/tempo|speed|interval|uptempo|5k|10k|ritmo/.test(cat)){a.tempo=Math.max(a.tempo,3);a.pace=Math.max(a.pace,3);a.treino=2;if(f.objetivo==null)a.obj=1}
    // "daily running/daily trainer" é corredor comum, não uso casual (no app, "dia a dia" é correr e usar fora da corrida)
    if(f.objetivo==='dia_a_dia'&&!/casual|walk|lifestyle|all.day|work|trabalho|caminhada/.test(cat))a.obj=2;
    // guias "até US$ 100": os especialistas indicam tênis de entrada
    if(f.orcamento_usd!=null&&f.orcamento_usd<=110)a.orc=[0];
    if(f.orcamento_usd==null&&f.orcamento_brl==null&&/budget|cheap|barat|under \$|até r\$|custo.benef/.test(cat))a.orc=/r\$ ?(3|4)\d\d/.test(cat)?[0]:ORC_BARATO;
    a.calor=1;a.uso=0;return a};
  const nomes=new Set(M.map(m=>m.n));
  const usar=casos.map(c=>({c,picks:(c.recomendados||[]).map(x=>x.no_catalogo).filter(n=>n&&nomes.has(n))})).filter(x=>x.picks.length);
  const medir=L=>{let h3=0,h10=0,mrr=0;L.forEach(({c,picks})=>{const e=engine(resp(c),true);const top=e.top10.map(x=>x.m.n);
    if(picks.some(n=>top.slice(0,3).includes(n)))h3++;if(picks.some(n=>top.includes(n)))h10++;
    const rk=e.ranked.map(x=>x.m.n);const best=Math.min(...picks.map(n=>{const k=rk.indexOf(n);return k<0?999:k}));mrr+=best<999?1/(best+1):0});
    return {n:L.length,top3:h3/L.length,top10:h10/L.length,mrr:mrr/L.length}};
  // divisão fixa: 1 em cada 3 casos fica só para teste
  const treino=usar.filter((_,k)=>k%3),teste=usar.filter((_,k)=>!(k%3));
  const antes={treino:medir(treino),teste:medir(teste),todos:medir(usar)};
  // diagnóstico: o erro vem da categoria (o indicado nem está na categoria escolhida) ou da ordem dentro dela?
  const diag={catErrada:0,ordem:0,acerto3:0,porGrupo:{}};
  usar.forEach(({c,picks})=>{const e=engine(resp(c),true);const top=e.top10.slice(0,3).map(x=>x.m.n);const g=diag.porGrupo[c.grupo]=diag.porGrupo[c.grupo]||{n:0,top3:0,catErrada:0};g.n++;
    if(picks.some(n=>top.includes(n))){diag.acerto3++;g.top3++;return}
    const cats=picks.map(n=>M.find(m=>m.n===n).c);if(!cats.some(k=>k===e.c1||k===e.c2)){diag.catErrada++;g.catErrada++;(diag.ex=diag.ex||[]).push(c.grupo+' | '+c.categoria_original+' | motor '+e.c1+'/'+e.c2+' | indicados '+cats.join(','))}else diag.ordem++});
  // marcas: o que os especialistas indicam × o que o motor indica para os mesmos perfis (top 3)
  const mE={},mM={};usar.forEach(({c,picks})=>{picks.slice(0,3).forEach(n=>{const b=M.find(m=>m.n===n).b;mE[b]=(mE[b]||0)+1});engine(resp(c),true).top10.slice(0,3).forEach(x=>{mM[x.m.b]=(mM[x.m.b]||0)+1})});
  const tE=Object.values(mE).reduce((a,b)=>a+b,0),tM=Object.values(mM).reduce((a,b)=>a+b,0);
  diag.marcas=Object.keys({...mE,...mM}).map(b=>[b,+(100*(mE[b]||0)/tE).toFixed(1),+(100*(mM[b]||0)/tM).toFixed(1)]).sort((x,y)=>y[1]-x[1]);
  // fatores: no caso que erra, quanto cada fator dá a mais para o nosso 1º do que para o melhor indicado pelos especialistas
  const F={};let nf=0;usar.forEach(({c,picks})=>{const e=engine(resp(c),true);const top=e.top10.slice(0,3).map(x=>x.m.n);if(picks.some(n=>top.includes(n)))return;
    const rk=e.ranked.map(x=>x.m.n);const pk=picks.filter(n=>rk.includes(n)).sort((x,y)=>rk.indexOf(x)-rk.indexOf(y))[0];if(!pk)return;
    const sm=window.__T.sm,Cw={},Cp={};sm(e.fins[0].m,0,Cw);sm(M.find(m=>m.n===pk),0,Cp);nf++;
    new Set([...Object.keys(Cw),...Object.keys(Cp)]).forEach(k=>F[k]=(F[k]||0)+(Cw[k]||0)-(Cp[k]||0))});
  diag.fatores=Object.entries(F).map(([k,v])=>[k,+(v/nf).toFixed(2)]).sort((a,b)=>b[1]-a[1]);diag.nf=nf;
  // modelos: indicações dos especialistas × nossas (top 3) nos mesmos casos
  const qE={},qM={};usar.forEach(({c,picks})=>{picks.slice(0,3).forEach(n=>qE[n]=(qE[n]||0)+1);engine(resp(c),true).top10.slice(0,3).forEach(x=>qM[x.m.n]=(qM[x.m.n]||0)+1)});
  diag.modelos=Object.keys({...qE,...qM}).map(n=>[n,qE[n]||0,qM[n]||0]).sort((x,y)=>(y[2]-y[1])-(x[2]-x[1]));
  // por modelo sub-indicado: nos casos em que os especialistas o indicam, o que o separa do nosso 1º
  diag.porModelo={};['Puma Fast-R Nitro Elite 3','Puma Deviate Nitro 4','Puma Velocity Nitro 5','Brooks Ghost 17','Brooks Adrenaline GTS 25','Brooks Glycerin 22'].forEach(alvo=>{
    const F={};let n=0,pos=[];usar.forEach(({c,picks})=>{if(!picks.includes(alvo))return;const e=engine(resp(c),true);const sm=window.__T.sm;const Cw={},Cp={};sm(e.fins[0].m,0,Cw);const m=M.find(x=>x.n===alvo);sm(m,0,Cp);n++;
      pos.push(e.ranked.findIndex(x=>x.m===m)+1+' ('+e.c1+'/'+e.c2+', 1º '+e.fins[0].m.n+')');new Set([...Object.keys(Cw),...Object.keys(Cp)]).forEach(k=>F[k]=(F[k]||0)+(Cw[k]||0)-(Cp[k]||0))});
    diag.porModelo[alvo]={n,pos:pos.slice(0,4),fatores:Object.entries(F).map(([k,v])=>[k,+(v/n).toFixed(1)]).filter(x=>Math.abs(x[1])>=0.4).sort((a,b)=>b[1]-a[1])}});
  if(!ajustar)return {antes,diag,n:usar.length,descartados:casos.length-usar.length};
  // validação cruzada em 3 partes: uma mudança só entra se melhorar o total e pelo menos 2 das 3 partes, sem piorar nenhuma em mais de 0,01.
  // Pesos de saúde e encaixe não caem abaixo da metade do valor atual (não trocamos segurança por acerto).
  const SAUDE=['naoBase','naoExtra','naoMax','pesadoLeve','dropAqu','torcMacio','estNeutro','dropCalc','largoBom','largoRuim'];
  const chaves=so?Object.keys(PESOS).filter(k=>k.startsWith(so)):Object.keys(PESOS).filter(k=>!['cat1','orcPor150','orcAbaixoPor','evidAlvo','notaN'].includes(k));
  const partes=[0,1,2].map(q=>usar.filter((_,k)=>k%3===q));
  // além do acerto, aproxima a distribuição de marcas da dos especialistas (distância L1 entre as duas), sem regra por marca
  const desvio=L=>{const mE={},mM={};L.forEach(({c,picks})=>{picks.slice(0,3).forEach(n=>{const b=M.find(m=>m.n===n).b;mE[b]=(mE[b]||0)+1});engine(resp(c),true).top10.slice(0,3).forEach(x=>{mM[x.m.b]=(mM[x.m.b]||0)+1})});
    const tE=Object.values(mE).reduce((a,b)=>a+b,0),tM=Object.values(mM).reduce((a,b)=>a+b,0);return Object.keys({...mE,...mM}).reduce((s,b)=>s+Math.abs((mE[b]||0)/tE-(mM[b]||0)/tM),0)};
  const nota=L=>{const m=medir(L);return m.mrr+0.5*m.top3-0.1*desvio(L)};
  const base0={...PESOS};let atual=partes.map(nota);const log=[];
  for(let volta=0;volta<2;volta++)for(const k of chaves){const v0=PESOS[k];let melhorV=v0,melhorS=atual;
    for(const f of [0.5,0.75,1.33,2]){const v=v0*f;if(SAUDE.includes(k)&&v<base0[k]*0.5)continue;PESOS[k]=v;const sc=partes.map(nota);
      const ganho=sc.reduce((a,b)=>a+b,0)-melhorS.reduce((a,b)=>a+b,0),melhora=sc.filter((x,q)=>x>melhorS[q]+1e-4).length,pior=sc.some((x,q)=>x<atual[q]-0.01);
      if(ganho>0.003&&melhora>=2&&!pior){melhorV=v;melhorS=sc}}
    PESOS[k]=melhorV;if(melhorV!==v0){log.push(`${k}: ${+v0.toFixed(4)} → ${+melhorV.toFixed(4)}`);atual=melhorS}}
  return {antes,depois:{treino:medir(treino),teste:medir(teste),todos:medir(usar)},pesos:{...PESOS},log,n:usar.length,descartados:casos.length-usar.length};
},{casos,ajustar:flags.includes('--ajustar'),so});
console.log(JSON.stringify(r,null,1));await b.close();
