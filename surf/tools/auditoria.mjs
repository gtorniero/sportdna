// Auditoria do SURF DNA: perfis realistas (respostas coerentes entre si) contra regras de bom senso de coach.
// Uso: python3 -m http.server 8000 (na raiz) e depois: node surf/tools/auditoria.mjs [--html outra-versao.html] [--detalhe]
// Cada regra conta quantos perfis a quebram e mostra exemplos. Não substitui a revisão de um professor de surf.
import {createRequire} from 'module';
import {execSync} from 'child_process';
import fs from 'fs';
const req=createRequire(import.meta.url);
let pw;try{pw=req('playwright')}catch(e){pw=createRequire(execSync('npm root -g').toString().trim()+'/')('playwright')}
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const BASE=arg('url','http://localhost:8000').replace(/\/$/,''),HTML=arg('html',null),DET=process.argv.includes('--detalhe');

// perfis: corpo × nível (com respostas coerentes) × mar × objetivo × prancha atual × dor
const corpos=[[45,155],[55,163],[65,170],[75,178],[85,182],[100,188]];
const niveis={ // nível declarado → respostas coerentes
 0:{nivel:'0',tempo:'1',auto:'1',pass:'1',skills:['2']},
 1:{nivel:'1',tempo:'3',auto:'2',pass:'2',skills:['1','2','3']},
 2:{nivel:'2',tempo:'4',skills:['1','2','3','4','5','6']},
 3:{nivel:'3',skills:['1','2','3','4','5','6','7']},
 4:{nivel:'4',skills:['1','2','3','4','5','6','7','8','9']}};
const mares=[['0','0'],['1','1'],['2','1'],['2','2'],['3','2'],['4','2']];
const objetivos={0:['0','0'],1:['3','0'],2:['2','1'],3:['2','2'],4:['5','5']}; // [objv, estilo]
const atuais=[null,'1','6','7','11']; // não tem, soft, mid, evolution, pranchinha
const P=[];
for(const [peso,alt] of corpos)for(const nv of Object.keys(niveis))for(const [tam,forca] of mares)for(const ob of Object.keys(objetivos))for(const at of atuais)for(const dor of [[],['0']])for(const rem of [5,8]){
  if(nv==='0'&&(+tam>=3||at==='11'))continue;
  if(nv==='0'&&ob==='3')continue;
  const [objv,estilo]=objetivos[ob];if(nv!=='0'&&objv==='0')continue;
  if(ob==='4'&&+tam>=3)continue;
  const imp=+nv>=3?{rem,est:5,vel:8,man:8,ctl:+tam>=3?8:5}:{rem,est:7,vel:6,man:6,ctl:4};
  const a={peso:String(peso),altura:String(alt),idade:'1',fis:'2',freq:'2',uso:+tam===4?'2':'0',imp,tam,forca,objvs:[objv],objv,estilo,dor,...niveis[nv]};
  if(at){a.motivo='1';a.atual_mod=at;a.muda='2';a.incomoda='6'}else a.motivo='0';
  if(+tam>=3&&imp.ctl>=8&&+tam<=2)a.grande='1';
  P.push(a)}

const b=await pw.chromium.launch();const p=await b.newPage();
await p.route('**/surf/**',async rt=>{
  const u=rt.request().url();if(!/\/surf\/(index\.html)?(\?.*)?$/.test(u))return rt.continue();
  const resp=await rt.fetch();let t=HTML?fs.readFileSync(HTML,'utf8'):await resp.text();
  const fim='\n})();\n</script>';const i=t.indexOf(fim);if(i<0)throw new Error('Não achei o fim do script principal');
  t=t.slice(0,i)+'\nwindow.__S={A,Q,compute,ARCH,LV,PN,ATUAL_K};'+t.slice(i);
  rt.fulfill({response:resp,body:t,headers:{...resp.headers(),'content-type':'text/html; charset=utf-8'}});
});
await p.goto(BASE+'/surf/index.html');await p.waitForFunction(()=>window.__S);
const res=await p.evaluate(P=>{const {A,Q,compute,ARCH,ATUAL_K}=window.__S;
  const objvQ=Q.find(q=>q.id==='objv'||q.id==='objvs');
  return P.map(a=>{Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,JSON.parse(JSON.stringify(a)));
    if(objvQ&&objvQ.id==='objvs')delete A.objv;else delete A.objvs;
    const r=compute();
    return {a,lvl:r.lvl,peso:r.peso,fins:r.fins.map(f=>({k:f.k,fit:f.fit})),d:{L:r.d.L,W:r.d.W,T:r.d.T,V:r.d.V},
      dims:r.fins.map((f,i)=>{const x=i?null:r.d;return x}),
      Lmin:Object.fromEntries(Object.entries(ARCH).map(([k,v])=>[k,v.L])),fixed:Object.fromEntries(Object.entries(ARCH).map(([k,v])=>[k,!!v.fixedVol])),
      atual:r.atual?{k:r.atual.k,V:r.atual.d.V,L:r.atual.d.L}:null}})},P);
await b.close();

const ft=x=>`${Math.floor(x/12)}'${Math.round(x%12)}"`;
const PN={soft:'soft',softp:'soft perf.',long:'long',longp:'long perf.',minimal:'mini-mal',mid:'mid',evo:'evolution',fish:'fish',grov:'groveler',twin:'biquilha',short:'pranchinha',step:'step-up',gun:'gun'};
const desc=x=>`${x.peso} kg, nível ${x.lvl}, onda ${x.a.tam}/${x.a.forca}, obj ${x.a.objv}, atual ${x.a.atual_mod||'—'}${x.a.dor.length?', dor':''} → ${x.fins.map(f=>PN[f.k]+' '+f.fit+'%').join(' · ')} · ${ft(x.d.L)} ${x.d.V.toFixed(1)} L (${(x.d.V/x.peso).toFixed(2)} L/kg)`;
const regras=[
 ['Comprimento do 1º fora da faixa do tipo',x=>!x.fixed[x.fins[0].k]&&(x.d.L<x.Lmin[x.fins[0].k][0]-0.01||x.d.L>x.Lmin[x.fins[0].k][1]+4.01)],
 ['Iniciante ou "já fica de pé" com fish, biquilha ou groveler no pódio',x=>x.lvl<=1&&x.fins.some(f=>['fish','twin','grov'].includes(f.k))],
 ['Iniciante ou "já fica de pé" com pranchinha, step-up ou gun no pódio',x=>x.lvl<=1&&x.fins.some(f=>['short','step','gun'].includes(f.k))],
 ['Primeiras ondas com 1º fora de soft, mini-mal, mid ou long',x=>x.lvl===0&&!['soft','minimal','mid','long','softp'].includes(x.fins[0].k)],
 ['Avançado ou pro com 1º de nicho fora de pranchinha/step/gun em mar de 1 m+ sem pedir outro estilo',x=>x.lvl>=3&&+x.a.tam>=2&&!['4'].includes(x.a.objv)&&x.a.estilo!=='5'&&!x.a.atual_mod&&!['short','step','gun','evo'].includes(x.fins[0].k)],
 ['Onda acima de 2,5 m, avançado: sem gun e step-up no pódio',x=>x.a.tam==='4'&&x.lvl>=3&&!x.fins.some(f=>['gun','step'].includes(f.k))],
 ['Onda de 1,5 m+, nível ≥ 2: long, mini-mal, fish ou groveler em 1º',x=>+x.a.tam>=3&&x.lvl>=2&&['long','minimal','fish','grov'].includes(x.fins[0].k)],
 ['Surf clássico sem longboard no pódio',x=>x.a.objv==='5'&&!x.fins.some(f=>['long','longp'].includes(f.k))],
 ['Pranchinha, biquilha, groveler ou fish em 1º acima de 0,6 L/kg',x=>['short','twin','grov','fish'].includes(x.fins[0].k)&&x.d.V/x.peso>0.6],
 ['Qualquer prancha calculada abaixo de 0,34 L/kg',x=>!x.fixed[x.fins[0].k]&&x.d.V/x.peso<0.335],
 ['Avançado/pro com pranchinha acima de 0,45 L/kg (55 kg ou mais)',x=>x.lvl>=3&&x.peso>=55&&x.fins[0].k==='short'&&x.d.V/x.peso>0.45],
 ['Troca de prancha: nova com mais de 6 L a menos que a atual (até int. avançado)',x=>x.atual&&x.lvl<=3&&x.d.V<x.atual.V-6],
 ['3º lugar a mais de 20 pontos do 1º (devia mostrar só 2)',x=>x.fins[2]&&x.fins[0].fit-x.fins[2].fit>20],
];
const out=regras.map(([n,f])=>{const bad=res.filter(f);return {n,c:bad.length,ex:bad.slice(0,DET?8:3).map(desc)}});
console.log(`Auditoria SURF DNA · ${res.length} perfis\n`);
for(const r of out){console.log(`${String(r.c).padStart(5)}  ${(100*r.c/res.length).toFixed(1).padStart(5)}%  ${r.n}`);if(r.c)r.ex.forEach(e=>console.log('         · '+e))}
// distribuição do 1º lugar por nível
const dist={};res.forEach(x=>{const k=x.lvl+':'+x.fins[0].k;dist[k]=(dist[k]||0)+1});
console.log('\n1º lugar por nível calculado:');for(let l=0;l<5;l++){const e=Object.entries(dist).filter(([k])=>k.startsWith(l+':')).sort((p,q)=>q[1]-p[1]).map(([k,v])=>PN[k.split(':')[1]]+' '+v);console.log(`  ${l}: ${e.join(', ')}`)}
