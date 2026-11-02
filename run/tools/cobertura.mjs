// Cobertura do catálogo do RUN DNA: para cada tênis, procura o perfil de corredor em que ele fica mais bem colocado.
// Uso: node run/tools/cobertura.mjs [saida.json]
// Busca local (subida de encosta) sobre as respostas do questionário, a partir de perfis coerentes com a categoria e o preço do tênis.
// Um tênis "sem perfil" (nunca no top 3) indica dado errado, modelo dominado por outro da mesma linha, ou regra que o exclui.
import {createRequire} from 'module';
const {chromium}=createRequire(import.meta.url)('playwright');
import fs from 'fs';import path from 'path';import url from 'url';
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const html=fs.readFileSync(path.join(raiz,'run/index.html'),'utf8');
const i=html.indexOf('const KMW=');const j=html.indexOf('\n',i)+1;
const tmp=path.join(raiz,'run/tools/.motor.html');
fs.writeFileSync(tmp,html.slice(0,j)+'window.__T={engine,M,BUD,PODIO_FORA};\n'+html.slice(j));
const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+tmp);fs.unlinkSync(tmp);
const r=await p.evaluate(()=>{
  const {engine,M,BUD,PODIO_FORA}=window.__T;
  const OPC={peso:[50,58,65,72,80,88,96,105],largura:[0,1,2],dor:[0,1,2,3,4,5,6],pisada:[0,1,2,3,4,5,6,7],tempo:[0,1,2,3,4],km:[0,1,2,3,4],pace:[0,1,2,3,4],terreno:[0,1,2,3],calor:[0,1,2],obj:[0,1,2,3,4,5],treino:[0,1,2],sens:[0,1,2],prior:[0,1,2,3],neutro:[0,1,2],orc:[0,1,2,3,4,5],uso:[0,1,2],pares:[0,1]};
  const OBJ={ent:0,dia:2,max:3,est:2,rap:1,sup:3,tri:4,con:5};
  let st=99;const mb=()=>{st|=0;st=st+0x6D2B79F5|0;let t=Math.imul(st^st>>>15,1|st);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const pos=(m,a)=>{const e=engine(a,false);const k=e.ranked.findIndex(x=>x.m===m);return k<0?999:k};
  const out=[];
  for(const m of M){
    const orc=BUD.findIndex(([lo,hi],q)=>q<5&&m.p>=lo&&m.p<=hi);
    let best=null,bestP=1e9;
    for(let t=0;t<6;t++){
      const a={};for(const k in OPC)a[k]=OPC[k][Math.floor(mb()*OPC[k].length)];
      a.obj=OBJ[m.c];a.orc=orc<0?5:orc;if(m.c==='tri')a.terreno=2+Math.floor(mb()*2);if(m.c==='est')a.neutro=1;if(m.c==='sup'||m.c==='rap'){a.tempo=4;a.pace=4;a.km=3;a.treino=2}
      let cur=pos(m,a);
      for(let it=0;it<6&&cur>0;it++){let mel=false;
        for(const k in OPC)for(const v of OPC[k]){if(a[k]===v)continue;const o=a[k];a[k]=v;const q=pos(m,a);if(q<cur){cur=q;mel=true}else a[k]=o}
        if(!mel)break}
      if(cur<bestP){bestP=cur;best={...a}}
      if(bestP===0)break}
    out.push({modelo:m.n,marca:m.b,cat:m.c,vendidoBR:!!m.br,podioFora:PODIO_FORA.includes(m.b),melhorPosicao:bestP+1,perfil:best});
  }
  return out;
});
const sem=r.filter(x=>x.melhorPosicao>3);
console.log(`modelos: ${r.length} | 1º lugar para algum perfil: ${r.filter(x=>x.melhorPosicao===1).length} | pódio: ${r.filter(x=>x.melhorPosicao<=3).length} | sem pódio: ${sem.length}`);
sem.forEach(x=>console.log(`  ${x.modelo} (${x.cat}${x.vendidoBR?'':', importado'}${x.podioFora?', fora do pódio por regra':''}): melhor posição ${x.melhorPosicao}`));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(r,null,1));
await b.close();
