#!/usr/bin/env node
/* Medição e calibração do motor do RACKET DNA contra casos de especialistas.
   Uso: node racket/tools/calibrar.mjs [arquivos de casos...] [--pesos json] [--html outra-versao.html] [--detalhe]
        node racket/tools/calibrar.mjs --ajustar [--saida pesos.json] [--trava]
   --ajustar  descida por coordenadas nos pesos de PESOS (multiplicadores 0,5/0,75/1,25/1,5/2, duas voltas).
              1 em cada 3 casos (por id, semente fixa) fica só para teste; o resto é dividido em 3 partes.
              Um passo só entra se melhora o total, pelo menos 2 das 3 partes melhoram e nenhuma piora mais de 0,01.
              Objetivo = MRR + 0,5 × top 3 − 0,1 × desvio de marcas (L1 entre as marcas do nosso top 3 e as do 1º indicado).
              Pesos de saúde e segurança têm piso de 0,5× o valor atual; orçamento e "difícil de achar" ficam fora.
   --saida    grava os pesos alterados (formato de --pesos)
   --json     grava o resultado de cada caso (posição do 1º indicado, nosso top 3)
   --trava    roda vies.mjs --realista com os pesos finais; se os pódios com 2+ contraindicações sérias ou a faixa até
              R$ 1.400 acima do orçamento piorarem em relação ao app atual, desfaz passos até não piorarem.
   Sem arquivos, lê docs/racket/dados/casos.json, casos-pt.json e casos-es.json.
   Abre racket/index.html?teste num Chromium (Playwright), converte cada caso em respostas do questionário,
   e mede, para o PRIMEIRO modelo de recomendados_catalogo: top 1, top 3, top 10 e MRR (1 ÷ posição no nosso ranking).
   Também mede "algum indicado no top 3" e compara as marcas do nosso top 3 com as indicadas pelos especialistas.
   Respostas que o caso não informa usam valores neutros (ver `resp` abaixo): quem lê os erros deve lembrar disso. */
import {createRequire} from 'module';
import fs from 'fs';import path from 'path';import url from 'url';import http from 'http';
const {chromium}=createRequire(import.meta.url)('playwright');
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);const flag=k=>args.includes(k);const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null};
const arquivos=args.filter((a,i)=>!a.startsWith('--')&&!['--pesos','--html','--saida','--json'].includes(args[i-1]));
const HTML=opt('--html');
const lista=arquivos.length?arquivos:['casos.json','casos-pt.json','casos-es.json'].map(f=>path.join(raiz,'docs/racket/dados',f));
const casos=lista.flatMap(f=>{const d=JSON.parse(fs.readFileSync(f,'utf8'));return Array.isArray(d)?d:d.casos});
const PES=(v=>!v?null:JSON.parse(fs.existsSync(v)?fs.readFileSync(v,'utf8'):v))(opt('--pesos'));

/* perfil do caso → respostas do questionário */
const BRL={usd:5.2,eur:5.9};
function resp(c){
  const f=c.perfil||{};const lvl={iniciante:'beg',intermediario:'int',avancado:'adv'}[f.nivel]||'int';
  const pri={controle:'control',conforto:'comfort',potencia:'power',spin:'spin'}[f.prioridade];
  const est={baseline:'agg',agressivo:'agg','all-court':'all','saque-voleio':'net','contra-ataque':'cnt'}[f.estilo];
  const brl=f.orcamento_brl??(f.orcamento_usd!=null?f.orcamento_usd*BRL.usd:f.orcamento_eur!=null?f.orcamento_eur*BRL.eur:null);
  const a={
    age:String({adulto:35,senior:62,junior:14}[f.idade_faixa]||35),height:'175',weight:'75',
    str:{alta:'high',baixa:'low'}[f.forca]||'mid',cond:'2',
    arm:f.dor_braco?'now':'no',
    lvl,years:{beg:'0',int:'1',adv:'10'}[lvl],freq:'2',
    swing:{beg:'short',int:'mid',adv:'long'}[lvl],
    spin:pri==='spin'?'high':lvl==='beg'?'low':'mid',
    serve:{beg:'push',int:'safe',adv:'mix'}[lvl],
    opp:'mix',cur:'none',why:f.dor_braco?'pain':'first',want:pri?[pri]:[],headp:'any',
    string:'?',tens:'?',restr:'3m',imp:c.idioma==='pt'?'no':'yes',
    budget:brl==null?'99999':brl<=1400?'1400':brl<=2000?'2000':'99999'
  };
  if(est)a.style=[est];
  if(f.dor_braco){a.joint=['elbow'];a.pain='2';a.lim='1'}
  return a;
}
/* indicados na ordem do guia: usa recomendados_catalogo e também acha no catálogo atual os nomes originais
   (assim, modelos novos no catálogo passam a contar sem refazer os arquivos de casos) */
const html0=fs.readFileSync(opt('--html')||path.join(raiz,'racket/index.html'),'utf8');
const CAT=JSON.parse(html0.match(/const CATALOG=\/\*CATALOG\*\/(\[.*?\]);/)[1]);
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\(.*?\)/g,' ').replace(/\b(gen ?\d+|20\d\d|v\d+|\d+ ?g)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const porNome=new Map();CAT.forEach(r=>{porNome.set(norm(r.brand+' '+r.model),r.model);if(!porNome.has(norm(r.model)))porNome.set(norm(r.model),r.model)});
const indicados=c=>{const out=[];const add=m=>{if(m&&!out.includes(m))out.push(m)};
  (c.recomendados||[]).forEach((o,i)=>{const d=(c.recomendados_detalhe||[]).find(x=>x.original===o);if(d&&d.no_catalogo&&CAT.some(r=>r.model===d.no_catalogo))return add(d.no_catalogo);add(porNome.get(norm(o)))});
  (c.recomendados_catalogo||[]).forEach(add);return out};
/* divisão fixa por id: teste (1 em 3) e 3 partes de treino */
const hash=(t,seed)=>{let h=2166136261^seed;for(const ch of String(t)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const SEMENTE=20261102;
const entradas=casos.map(c=>({id:c.id,teste:hash(c.id,SEMENTE)%3===0,parte:hash(c.id,SEMENTE+1)%3,idioma:c.idioma,grupo:c.grupo||c.perfil?.nivel||'?',dor:!!c.perfil?.dor_braco,rec:indicados(c),a:resp(c)}));

const tipos={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((q,s)=>{const p=decodeURIComponent(q.url.split('?')[0]);if(HTML&&(p==='/racket/'||p==='/racket/index.html')){s.writeHead(200,{'content-type':tipos['.html']});return s.end(fs.readFileSync(HTML))}const f=path.join(raiz,p.endsWith('/')?p+'index.html':p);if(!f.startsWith(raiz)||!fs.existsSync(f)){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':tipos[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
const b=await chromium.launch();const pg=await b.newPage();
await pg.goto(`http://127.0.0.1:${srv.address().port}/racket/?teste`,{waitUntil:'load'});
const out=await pg.evaluate(({entradas,PES,AJ})=>{
  const {A,RK,compute,PESOS}=window.__RK;
  const mescla=(o,m)=>{Object.keys(m).forEach(k=>{if(m[k]&&typeof m[k]==='object'&&!Array.isArray(m[k])&&o[k]&&typeof o[k]==='object')mescla(o[k],m[k]);else o[k]=m[k]})};
  if(PES)mescla(PESOS,PES);
  const porModelo=new Map(RK.map(r=>[r.model,r]));
  const roda=e=>{
    Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,JSON.parse(JSON.stringify(e.a)));
    /* o ranking mostra uma linha por família (mesmo molde em pesos diferentes): o indicado conta pela família */
    const fam=r=>r.fam||(r.brand+' '+r.model);
    const R=compute();const ordem=R.ranked.map(x=>x.r.id),ordemF=R.ranked.map(x=>fam(x.r));
    const ids=e.rec.map(m=>porModelo.get(m)).filter(Boolean).map(r=>r.id);
    const sem=e.rec.filter(m=>!porModelo.has(m));
    const posF=i=>ordemF.indexOf(fam(RK[i]))+1;
    const pos=ids.length?posF(ids[0]):0;
    const melhor=ids.length?Math.min(...ids.map(posF)):0;
    return {...e,ids,sem,pos,melhor,top3:ordem.slice(0,3)};
  };
  const tudo=()=>entradas.map(roda);
  let ajuste=null;
  if(AJ){
    const uteis=entradas.filter(e=>e.rec.some(m=>porModelo.has(m)));
    const treino=uteis.filter(e=>!e.teste);
    /* objetivo de uma lista de resultados */
    const nota=L=>{if(!L.length)return 0;let mrr=0,t3=0;const mN={},mE={};
      L.forEach(x=>{mrr+=1/x.pos;if(x.pos<=3)t3++;x.top3.forEach(i=>mN[RK[i].brand]=(mN[RK[i].brand]||0)+1);const b=RK[x.ids[0]].brand;mE[b]=(mE[b]||0)+1});
      const tN=3*L.length,tE=L.length;const dev=Object.keys({...mN,...mE}).reduce((s,b)=>s+Math.abs((mN[b]||0)/tN-(mE[b]||0)/tE),0);
      return mrr/L.length+0.5*t3/L.length-0.1*dev};
    const notas=()=>{const R=treino.map(roda);return [0,1,2].map(q=>nota(R.filter(x=>x.parte===q)))};
    /* folhas numéricas de PESOS que são pesos (limiares, alvos em gramas/mm, orçamento e importação ficam fora) */
    const folhas=[];const anda=(o,p)=>Object.keys(o).forEach(k=>{const v=o[k],q=p?p+'.'+k:k;if(typeof v==='number')folhas.push(q);else if(v&&typeof v==='object'&&!Array.isArray(v))anda(v,q)});anda(PESOS,'');
    const FORA=[/^(peso|zona|aprovacao|indice|juvenil)\./,/^alvo\.(base|min|max)$/,/^alvo\.spin\./,/^alvo\.idade\.(padrao|maduro|senior|jovem)$/,
      /^pen\.(orcamento\.|dificilAchar|poucaOferta)/,/^pen\.(pesoTolerancia|pesoLonge|bracoIndiceMin)$/,/\.(lim|limCotovelo|limOutras|sw|bal|g|idade|margem|cotoveloPeso|tolerancia100|desconto100)$/,
      /^placar\.(alvoAlto|aprovacaoPadrao|dentroOrcamento|braco\.centro)$/,/^placar\.braco\..*(Min|Max|MaxCotovelo)$/,
      /^match\.(base|distRuim|min|max|escala|conf)/,/^match\.pen$/];
    const SAUDE=[/^pen\.(raHoje|raPassado|raForte|bracoLeve|pesadaFraco|ombro|punho)\./,/^alvo\.(dor|articulacao|dorForte|emTratamento)\./,/^alvo\.idade\.seniorAlvo\./,/^placar\.braco\./];
    const get=p=>p.split('.').reduce((o,k)=>o[k],PESOS);const set=(p,v)=>{const k=p.split('.');const o=k.slice(0,-1).reduce((o,k)=>o[k],PESOS);o[k[k.length-1]]=v};
    const chaves=folhas.filter(p=>!FORA.some(r=>r.test(p))&&get(p)!==0);
    const base0=Object.fromEntries(chaves.map(p=>[p,get(p)]));
    let atual=notas();const log=[];const t0=Date.now();
    for(let volta=0;volta<2;volta++)for(const k of chaves){const v0=get(k);let melhorV=v0,melhorS=atual;
      for(const f of [0.5,0.75,1.25,1.5,2]){let v=+(v0*f).toFixed(4);
        if(SAUDE.some(r=>r.test(k))&&Math.abs(v)<Math.abs(base0[k])*0.5)continue;
        if(k==='alvo.compressao'&&v>1)continue;
        set(k,v);const sc=notas();
        const ganho=sc.reduce((a,b)=>a+b,0)-melhorS.reduce((a,b)=>a+b,0),melhora=sc.filter((x,q)=>x>melhorS[q]+1e-4).length,pior=sc.some((x,q)=>x<atual[q]-0.01);
        if(ganho>0.003&&melhora>=2&&!pior){melhorV=v;melhorS=sc}}
      set(k,melhorV);if(melhorV!==v0){log.push([k,v0,melhorV]);atual=melhorS}}
    const mud={};chaves.forEach(p=>{if(get(p)!==base0[p])mud[p]=[base0[p],get(p)]});
    ajuste={log,mud,n:chaves.length,ms:Date.now()-t0,notaFinal:atual};
  }
  return {cat:RK.map(r=>({id:r.id,brand:r.brand,name:r.name,model:r.model})),res:tudo(),ajuste};
},{entradas,PES,AJ:flag('--ajustar')});
await b.close();srv.close();

const {res,cat}=out;
if(opt('--json'))fs.writeFileSync(opt('--json'),JSON.stringify({res,cat}));const pct=x=>(100*x).toFixed(1).replace('.',',')+'%';
const uteis=res.filter(x=>x.ids.length);
const semNome=[...new Set(res.flatMap(x=>x.sem))];
const med=g=>{const n=g.length||1;return {n:g.length,t1:g.filter(x=>x.pos===1).length/n,t3:g.filter(x=>x.pos>=1&&x.pos<=3).length/n,t10:g.filter(x=>x.pos>=1&&x.pos<=10).length/n,mrr:g.reduce((s,x)=>s+1/x.pos,0)/n,alg3:g.filter(x=>x.melhor<=3).length/n}};
const linha=(nome,m)=>console.log(`${nome.padEnd(26)}${String(m.n).padStart(5)}  ${pct(m.t1).padStart(6)}  ${pct(m.t3).padStart(6)}  ${pct(m.t10).padStart(6)}  ${m.mrr.toFixed(3).replace('.',',').padStart(6)}  ${pct(m.alg3).padStart(7)}`);
console.log(`RACKET DNA · ${res.length} casos de ${lista.length} arquivo(s); ${uteis.length} com pelo menos um modelo do catálogo${PES?' · com --pesos':''}`);
if(semNome.length)console.log('Nomes em recomendados_catalogo que não batem com o catálogo: '+semNome.join(', '));
console.log('\nGrupo                         n     top1    top3   top10     MRR  algum no top3');
linha('Todos',med(uteis));
['en','pt','es'].forEach(l=>{const g=uteis.filter(x=>x.idioma===l);if(g.length)linha('Idioma '+l,med(g))});
[...new Set(uteis.map(x=>x.grupo))].sort().forEach(gr=>{const g=uteis.filter(x=>x.grupo===gr);if(g.length>=5)linha('Grupo '+gr,med(g))});
linha('Com dor no braço',med(uteis.filter(x=>x.dor)));
const cat3=3/cat.length;console.log(`Acaso (3 de ${cat.length} raquetes): top 3 ≈ ${pct(cat3)}; top 1 ≈ ${pct(1/cat.length)}`);
/* marcas */
const marcas=[...new Set(cat.map(r=>r.brand))];const nos={},esp={},espTodos={};let tn=0,te=0,tt=0;
uteis.forEach(x=>{x.top3.forEach(i=>{nos[cat[i].brand]=(nos[cat[i].brand]||0)+1;tn++});const b1=cat[x.ids[0]].brand;esp[b1]=(esp[b1]||0)+1;te++;x.ids.forEach(i=>{espTodos[cat[i].brand]=(espTodos[cat[i].brand]||0)+1;tt++})});
console.log('\nMarca        nosso top3  1º indicado  todos indicados  catálogo');
marcas.sort((a,b)=>(espTodos[b]||0)-(espTodos[a]||0)).forEach(m=>console.log(`${m.padEnd(12)}${pct((nos[m]||0)/tn).padStart(10)}  ${pct((esp[m]||0)/te).padStart(11)}  ${pct((espTodos[m]||0)/tt).padStart(15)}  ${pct(cat.filter(r=>r.brand===m).length/cat.length).padStart(8)}`));
if(flag('--detalhe')){console.log('\nCasos que mais erram (1º indicado fora do top 10):');uteis.filter(x=>x.pos>10).slice(0,40).forEach(x=>console.log(`  ${x.id} [${x.grupo}${x.dor?', dor':''}] indicado ${cat[x.ids[0]].name} em ${x.pos}º; nosso top 3: ${x.top3.map(i=>cat[i].name).join(' · ')}`))}

/* ---------- calibração: relatório, saída e trava de segurança ---------- */
const tst=uteis.filter(x=>x.teste);
console.log(`\nParte de teste (${tst.length} casos, 1 em 3 por id):`);linha('Teste',med(tst));
if(out.ajuste){
  const {log,mud,n,ms}=out.ajuste;
  console.log(`\nAjuste: ${n} pesos testados em ${(ms/1000).toFixed(0)} s; ${log.length} passos aceitos`);
  log.forEach(([k,a,b])=>console.log(`  ${k}: ${a} → ${b}`));
  const aninha=m=>{const o={};Object.entries(m).forEach(([p,[,v]])=>{const k=p.split('.');let x=o;k.slice(0,-1).forEach(c=>x=x[c]=x[c]||{});x[k[k.length-1]]=v});return o};
  let final={...mud};
  if(flag('--trava')){
    const {execFileSync}=await import('child_process');
    const vies=pes=>{const o=execFileSync(process.execPath,[path.join(raiz,'racket/tools/vies.mjs'),'--realista',...(pes?['--pesos',JSON.stringify(aninha(pes))]:[])],{encoding:'utf8',maxBuffer:1e8});
      const s2=+o.match(/contraindicação séria[^\n]*com 2\+: (\d+)/)[1];const o14=parseFloat(o.match(/até R\$ 1400: \d+ perfis, 1ª acima ([\d,]+)%/)[1].replace(',','.'));return {s2,o14}};
    const ref=vies(null);let m=vies(final);console.log(`\nTrava (vies --realista): app atual 2+ sérias ${ref.s2}, até R$ 1.400 acima ${ref.o14}% · com o ajuste ${m.s2}, ${m.o14}%`);
    const ruim=x=>Math.max(0,x.s2-ref.s2)+Math.max(0,x.o14-ref.o14);
    while(ruim(m)>0&&Object.keys(final).length){let best=null;
      for(const k of Object.keys(final)){const c={...final};delete c[k];const r=vies(c);if(!best||ruim(r)<ruim(best.r))best={k,r}}
      console.log(`  desfaz ${best.k} → 2+ sérias ${best.r.s2}, até R$ 1.400 ${best.r.o14}%`);delete final[best.k];m=best.r}
  }
  if(opt('--saida')){fs.writeFileSync(opt('--saida'),JSON.stringify(aninha(final),null,1));console.log('Pesos finais gravados em '+opt('--saida'))}
}
