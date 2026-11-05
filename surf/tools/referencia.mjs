// Casos de referência do SURF DNA: perfis típicos com o que um coach espera ver no pódio.
// Uso: python3 -m http.server 8000 (na raiz) e depois: node surf/tools/referencia.mjs [--html outra-versao.html]
// Cada caso diz quais tipos devem estar no top 3 (deve), quais não podem aparecer no top 3 (nao) e,
// opcionalmente, quais podem ser o 1º (primeiro). A lista é para ser revisada por um professor de surf.
import {createRequire} from 'module';
import {execSync} from 'child_process';
import fs from 'fs';
const req=createRequire(import.meta.url);
let pw;try{pw=req('playwright')}catch(e){pw=createRequire(execSync('npm root -g').toString().trim()+'/')('playwright')}
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const BASE=arg('url','http://localhost:8000').replace(/\/$/,''),HTML=arg('html',null);

const corpo={peso:'72',altura:'175',idade:'1',fis:'2',freq:'2',motivo:'0',uso:'0',atual_mod:'0'};
const imp=(rem,est,vel,man,ctl)=>({rem,est,vel,man,ctl});
const C=[
 // iniciantes: nunca pranchinha
 ['Primeira prancha, nunca surfou',{nivel:'0',tempo:'0',auto:'0',pass:'0',skills:[],objv:'0',estilo:'0',imp:imp(9,9,5,3,3),tam:'1',forca:'0'},{deve:['soft'],nao:['short','step','gun','twin','grov'],primeiro:['soft','minimal']}],
 ['Iniciante que já fica de pé, quer autonomia',{nivel:'0',tempo:'2',auto:'1',pass:'1',skills:['2'],objv:'1',estilo:'0',imp:imp(8,8,5,4,3),tam:'1',forca:'0'},{deve:[],nao:['short','step','gun'],primeiro:['minimal','soft','mid','softp','evo']}],
 ['Já fica de pé, onda pequena e fraca, curtir',{nivel:'1',tempo:'2',auto:'1',pass:'1',skills:['2'],objv:'3',estilo:'0',imp:imp(8,7,7,4,3),tam:'0',forca:'0'},{deve:[],nao:['short','step','gun'],primeiro:['mid','fish','minimal','longp','evo','long','soft','softp']}],
 // do intermediário para cima: pranchinha triquilha é o padrão (evolution se a litragem não cabe em 6'4")
 ['Intermediário, quer aprender manobras, 0,5–1 m',{nivel:'1',tempo:'3',auto:'2',pass:'2',skills:['1','2','3','4'],objv:'2',estilo:'1',imp:imp(6,6,6,8,4),tam:'1',forca:'1'},{deve:[],nao:['step','gun','long','soft'],primeiro:['short','evo']}],
 ['Intermediário avançado, manobras, 1–1,5 m mistas',{nivel:'2',tempo:'3',skills:['1','2','3','4','5','6'],objv:'2',estilo:'1',imp:imp(5,6,9,7,6),tam:'2',forca:'1'},{deve:['short'],nao:['long','soft','minimal','gun'],primeiro:['short']}],
 ['Intermediário avançado, manobras fortes, 1–1,5 m cavadas',{nivel:'2',tempo:'4',skills:['1','2','3','4','5','6','7'],objv:'2',estilo:'2',imp:imp(5,5,7,9,7),tam:'2',forca:'2'},{deve:['short'],nao:['long','soft','minimal','grov','fish'],primeiro:['short']}],
 ['Intermediário avançado, curtir, onda pequena',{nivel:'2',tempo:'3',skills:['1','2','3','4','5'],objv:'3',estilo:'0',imp:imp(7,6,8,6,4),tam:'0',forca:'0'},{deve:['short'],nao:['step','gun','soft'],primeiro:['short']}],
 ['Intermediário avançada, 55 kg, 1–1,5 m',{nivel:'2',tempo:'3',skills:['1','2','3','4','5','6'],objv:'2',estilo:'1',imp:imp(6,6,7,8,5),tam:'2',forca:'1',peso:'55',altura:'163'},{deve:['short'],nao:['long','soft','gun'],primeiro:['short']}],
 ['Intermediário pesado, 95 kg, 0,5–1 m',{nivel:'1',tempo:'3',auto:'2',pass:'2',skills:['1','2','3','4'],objv:'2',estilo:'1',imp:imp(7,7,6,7,4),tam:'1',forca:'1',peso:'95',altura:'183'},{deve:[],nao:['gun','step','soft'],primeiro:['short','evo']}],
 ['Intermediário com dor no ombro',{nivel:'1',tempo:'3',auto:'2',pass:'2',skills:['1','2','3','4'],objv:'2',estilo:'1',imp:imp(7,7,6,7,4),tam:'1',forca:'1',dor:['0']},{deve:['evo'],nao:['step','gun','soft'],primeiro:['short','evo']}],
 ['Intermediário avançado que quer muita remada',{nivel:'2',tempo:'3',skills:['1','2','3','4','5','6'],objv:'2',estilo:'1',imp:imp(9,7,7,7,5),tam:'1',forca:'1'},{deve:['evo'],nao:['step','gun','soft','long'],primeiro:['short','evo']}],
 ['Avançado sem dor, nota alta em remada',{nivel:'3',skills:['1','2','3','4','5','6','7','8'],objv:'2',estilo:'2',imp:imp(9,5,7,8,6),tam:'2',forca:'1'},{deve:['short'],nao:['soft','long','gun'],primeiro:['short']}],
 ['Volta a surfar, intermediário, 46–55, cansa rápido',{nivel:'1',tempo:'4',auto:'2',pass:'2',skills:['1','2','3'],objv:'3',estilo:'0',imp:imp(9,8,6,4,4),tam:'1',forca:'1',idade:'3',fis:'0',motivo:'4'},{deve:[],nao:['step','gun'],primeiro:['short','evo']}],
 ['Avançado, prancha única, 1–1,5 m mistas',{nivel:'3',skills:['1','2','3','4','5','6','7'],objv:'2',estilo:'2',imp:imp(5,5,7,9,7),tam:'2',forca:'1'},{deve:['short'],nao:['long','soft','minimal','mid'],primeiro:['short']}],
 ['Avançado, tubo, 1,5–2,5 m cavadas',{nivel:'3',skills:['1','2','3','4','5','6','7','8'],objv:'2',estilo:'3',imp:imp(5,5,7,8,9),tam:'3',forca:'2'},{deve:['short'],nao:['long','soft','minimal','mid','fish','grov'],primeiro:['short']}],
 ['Avançado, piscina de ondas',{nivel:'3',skills:['1','2','3','4','5','6','7'],objv:'2',estilo:'2',imp:imp(4,5,7,9,6),tam:'1',forca:'1',uso:'4'},{deve:['short'],nao:['gun','step','long','soft'],primeiro:['short']}],
 ['Profissional, prancha do dia a dia, 1–1,5 m',{nivel:'4',skills:['1','2','3','4','5','6','7','8','9'],objv:'2',estilo:'2',imp:imp(4,4,8,10,8),tam:'2',forca:'2'},{deve:['short'],nao:['long','soft','minimal','mid','evo','gun'],primeiro:['short']}],
 // onda grande: step-up e gun
 ['Avançado, prancha para dias grandes, 1,5–2,5 m',{nivel:'3',skills:['1','2','3','4','5','6','7','8'],objv:'4',estilo:'2',imp:imp(6,5,6,6,9),tam:'3',forca:'2',uso:'2'},{deve:['step'],nao:['long','soft','minimal','mid','fish','grov'],primeiro:['step','short']}],
 ['Profissional, onda acima de 2,5 m',{nivel:'4',skills:['1','2','3','4','5','6','7','8','9'],objv:'4',estilo:'3',imp:imp(7,5,6,6,10),tam:'4',forca:'2',uso:'2'},{deve:['gun','step'],nao:['long','soft','minimal','mid','fish','grov','twin'],primeiro:['gun','step']}],
 // quando a pessoa pede outro estilo
 ['Avançado, prancha para dias pequenos',{nivel:'3',skills:['1','2','3','4','5','6','7'],objv:'3',estilo:'1',imp:imp(7,5,9,7,3),tam:'0',forca:'0',uso:'1'},{deve:[],nao:['step','gun','long','soft'],primeiro:['grov','twin','fish']}],
 ['Avançado com pranchinha, quer mudar para fish',{nivel:'3',skills:['1','2','3','4','5','6','7'],objv:'3',estilo:'1',imp:imp(6,6,8,7,4),tam:'1',forca:'0',atual_mod:'11',muda:'1',estilo_novo:'0',incomoda:'6'},{deve:['fish'],nao:['gun','soft'],primeiro:['fish']}],
 ['Avançado com pranchinha, quer somar ao quiver',{nivel:'3',skills:['1','2','3','4','5','6','7'],objv:'3',estilo:'1',imp:imp(6,6,8,7,4),tam:'1',forca:'1',motivo:'2',atual_mod:'11',muda:'2',incomoda:'6'},{deve:[],nao:['gun','soft'],primeiro:['twin','fish','grov','mid','evo','longp','step']}],
 ['Surf clássico, intermediário, onda pequena',{nivel:'1',tempo:'4',auto:'2',pass:'2',skills:['1','2','3'],objv:'5',estilo:'5',imp:imp(8,8,6,3,3),tam:'1',forca:'0'},{deve:['long'],nao:['short','step','gun','grov'],primeiro:['long','longp']}],
];

const b=await pw.chromium.launch();const p=await b.newPage();
await p.route('**/surf/**',async rt=>{
  const u=rt.request().url();if(!/\/surf\/(index\.html)?(\?.*)?$/.test(u))return rt.continue();
  const resp=await rt.fetch();let t=HTML?fs.readFileSync(HTML,'utf8'):await resp.text();
  const fim='\n})();\n</script>';const i=t.indexOf(fim);if(i<0)throw new Error('Não achei o fim do script principal');
  t=t.slice(0,i)+'\nwindow.__S={A,compute,LV,PN};'+t.slice(i);
  rt.fulfill({response:resp,body:t,headers:{...resp.headers(),'content-type':'text/html; charset=utf-8'}});
});
await p.goto(BASE+'/surf/index.html');await p.waitForFunction(()=>window.__S);
const res=await p.evaluate(C=>C.map(([nome,resp,esp])=>{const {A,compute,LV,PN}=window.__S;Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,resp);
  const r=compute(),top=r.fins.map(f=>f.k),falhas=[];
  esp.deve.forEach(k=>{if(!top.includes(k))falhas.push(`falta ${PN[k]}`)});
  esp.nao.forEach(k=>{if(top.includes(k))falhas.push(`não devia ter ${PN[k]}`)});
  if(esp.primeiro&&!esp.primeiro.includes(top[0]))falhas.push(`1º devia ser ${esp.primeiro.map(k=>PN[k]).join(' ou ')}`);
  const dc=r.dc,ft=x=>`${Math.floor(x/12)}'${Math.round(x%12)}"`;
  return {nome,nivel:LV[r.lvl].n,podio:r.fins.map(f=>`${PN[f.k]} ${f.fit}%`),L:Math.round(r.d.V*10)/10,falhas,ficha:`${ft(r.d.L)} · rabeta ${dc.tail} · ${dc.setup} ${dc.finSize} · fundo ${dc.bottom.split(':')[0]} · rocker bico ${dc.rocker[0].toFixed(2)} · ${dc.template.split(':')[0]} · borda ${dc.rail}`}}),C.map(([n,r,e])=>[n,{...corpo,...r},e]));
await b.close();
let ok=0;for(const x of res){if(!x.falhas.length)ok++;console.log(`${x.falhas.length?'FALHA':'ok   '} ${x.nome} [${x.nivel}] → ${x.podio.join(' · ')} · ${x.L} L\n      ficha: ${x.ficha}${x.falhas.length?'\n      '+x.falhas.join('; '):''}`)}
console.log(`\n${ok} de ${res.length} casos de referência batem com o esperado.`);
process.exitCode=ok===res.length?0:1;
