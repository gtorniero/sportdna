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
    a.calor=1;a.uso=0;a.pares=0;return a};
  const nomes=new Set(M.map(m=>m.n));
  const usar=casos.map(c=>({c,picks:(c.recomendados||[]).map(x=>x.no_catalogo).filter(n=>n&&nomes.has(n))})).filter(x=>x.picks.length);
  const medir=L=>{let h3=0,h10=0,mrr=0;L.forEach(({c,picks})=>{const e=engine(resp(c),true);const top=e.top10.map(x=>x.m.n);
    if(picks.some(n=>top.slice(0,3).includes(n)))h3++;if(picks.some(n=>top.includes(n)))h10++;
    const rk=e.ranked.map(x=>x.m.n);const best=Math.min(...picks.map(n=>{const k=rk.indexOf(n);return k<0?999:k}));mrr+=best<999?1/(best+1):0});
    return {n:L.length,top3:h3/L.length,top10:h10/L.length,mrr:mrr/L.length}};
  // divisão fixa: 1 em cada 3 casos fica só para teste
  const treino=usar.filter((_,k)=>k%3),teste=usar.filter((_,k)=>!(k%3));
  const antes={treino:medir(treino),teste:medir(teste),todos:medir(usar)};
  if(!ajustar)return {antes,n:usar.length,descartados:casos.length-usar.length};
  const chaves=Object.keys(PESOS).filter(k=>!['cat1','cat2','cat2Peq','orcPor150','orcAbaixoPor','evidAlvo','notaN'].includes(k));
  const obj=()=>{const m=medir(treino);return m.mrr+0.5*m.top3};
  let melhor=obj();const log=[];
  for(let volta=0;volta<3;volta++)for(const k of chaves){const v0=PESOS[k];let bestV=v0;
    for(const f of [0,0.5,0.75,1.33,2]){PESOS[k]=v0*f;const o=obj();if(o>melhor+1e-4){melhor=o;bestV=PESOS[k]}}
    PESOS[k]=bestV;if(bestV!==v0)log.push(`${k}: ${+v0.toFixed(4)} → ${+bestV.toFixed(4)}`)}
  return {antes,depois:{treino:medir(treino),teste:medir(teste),todos:medir(usar)},pesos:{...PESOS},log,n:usar.length,descartados:casos.length-usar.length};
},{casos,ajustar:flags.includes('--ajustar')});
console.log(JSON.stringify(r,null,1));await b.close();
