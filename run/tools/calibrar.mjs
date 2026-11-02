// Calibração do motor do RUN DNA contra casos de especialistas.
// Uso: node run/tools/calibrar.mjs docs/tenis/dados/casos.json [--ajustar]
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
fs.writeFileSync(tmp,html.slice(0,j)+'window.__T={engine,M,PESOS};\n'+html.slice(j));
const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+tmp);fs.unlinkSync(tmp);
const r=await p.evaluate(({casos,ajustar})=>{
  const {engine,M,PESOS}=window.__T;
  const idx=(v,m,d)=>v==null?d:(m[v]??d);
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
    a.orc=brl==null?5:brl<=400?0:brl<=700?1:brl<=1000?2:brl<=1500?3:4;
    // ajustes de leitura do caso pelo nome da categoria do guia (o perfil da fonte vem incompleto)
    const cat=(c.categoria_original||'').toLowerCase();
    a.pares=0;
    if(/carbon|racing|race|racer|super ?shoe|marathon racer|prova|competi/.test(cat)){a.tempo=4;a.pace=4;a.km=Math.max(a.km,3);a.treino=2;a.pares=1;if(f.objetivo==null)a.obj=/5k|10k|5 km|10 km/.test(cat)?1:3}
    else if(/tempo|speed|interval|uptempo|5k|10k|ritmo/.test(cat)){a.tempo=Math.max(a.tempo,3);a.pace=Math.max(a.pace,3);a.treino=2;if(f.objetivo==null)a.obj=1}
    // "daily running/daily trainer" é corredor comum, não uso casual (no app, "dia a dia" é correr e usar fora da corrida)
    if(f.objetivo==='dia_a_dia'&&!/casual|walk|lifestyle|all.day|work|trabalho|caminhada/.test(cat))a.obj=2;
    // guias "até US$ 100": os especialistas indicam tênis de entrada
    if(f.orcamento_usd!=null&&f.orcamento_usd<=110)a.orc=0;
    if(f.orcamento_usd==null&&f.orcamento_brl==null&&/budget|cheap|barat|under \$|até r\$|custo.benef/.test(cat))a.orc=/r\$ ?(3|4)\d\d/.test(cat)?0:1;
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
  if(!ajustar)return {antes,diag,n:usar.length,descartados:casos.length-usar.length};
  // validação cruzada em 3 partes: uma mudança só entra se melhorar o total e pelo menos 2 das 3 partes, sem piorar nenhuma em mais de 0,01.
  // Pesos de saúde e encaixe não caem abaixo da metade do valor atual (não trocamos segurança por acerto).
  const SAUDE=['naoBase','naoExtra','naoMax','pesadoLeve','dropAqu','torcMacio','estNeutro','dropCalc','largoBom','largoRuim'];
  const chaves=Object.keys(PESOS).filter(k=>!['cat1','cat2','cat2Peq','orcPor150','orcAbaixoPor','evidAlvo','notaN'].includes(k));
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
},{casos,ajustar:flags.includes('--ajustar')});
console.log(JSON.stringify(r,null,1));await b.close();
