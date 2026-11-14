// Jornada (nov/2026): pedido guardado no aparelho, retomada, reteste e medição por etapa.
// Tudo em memória: nenhum pedido é criado e nenhum evento sai para o Google ou a Meta.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const configSource=readFileSync(new URL('../assets/payments/config.js',import.meta.url),'utf8');
const clientSource=readFileSync(new URL('../assets/payments/client.js',import.meta.url),'utf8');
const measureSource=readFileSync(new URL('../assets/measurement.js',import.meta.url),'utf8');
const vendorSource=readFileSync(new URL('../assets/measurement-vendor.js',import.meta.url),'utf8');
const DAY=86400000;
function storage(map=new Map()){return {data:map,getItem(k){return this.data.has(k)?this.data.get(k):null},setItem(k,v){this.data.set(k,String(v))},removeItem(k){this.data.delete(k)}}}
function page({local=new Map(),session=new Map(),search='',server,app={}}={}){
 const nodes=[];
 class Element{
  constructor(tag){this.tag=tag;this.style={};this.children=[];this.id='';this.textContent='';this.disabled=false;nodes.push(this)}
  append(...xs){this.children.push(...xs)}
  setAttribute(){} addEventListener(){} showModal(){this.open=true} close(){this.open=false} remove(){this.removed=true} focus(){}
  set innerHTML(value){this.html=value;if(this.tag==='dialog'){for(const [tag,id] of [['h2','paymentTitle'],['div','paymentBody'],['p','paymentStatus'],['button','paymentClose']]){const e=new Element(tag);e.id=id;this.append(e)}}}
  querySelector(selector){return this.children.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||this.children.map(x=>x.querySelector(selector)).find(Boolean)||null}
  querySelectorAll(){return []}
 }
 const document={createElement:tag=>new Element(tag),body:new Element('body'),querySelector:selector=>nodes.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||null};
 const calls={restore:[],unlock:[],fetch:[]};
 const context={window:{},document,location:{origin:'https://sportdna.com.br',search},localStorage:storage(local),sessionStorage:storage(session),Intl,URLSearchParams,AbortSignal,AbortController,crypto:globalThis.crypto,setTimeout:()=>0,clearTimeout(){},console,
  fetch:async(url,options={})=>{calls.fetch.push([url,options]);const r=server(url,options);return {ok:true,status:200,json:async()=>r}}};
 vm.runInNewContext(configSource,context);vm.runInNewContext(clientSource,context);
 const pay=context.window.SportDNAPayments;
 pay.register({name:'racket',snapshot:()=>({lvl:'int',age:'38'}),restore:a=>calls.restore.push(a),unlock:(...x)=>calls.unlock.push(x),...app});
 return {pay,calls,nodes,local,session,status:()=>nodes.filter(x=>x.id==='paymentStatus').at(-1)?.textContent||''};
}
const flush=()=>new Promise(setImmediate);
const pendingOrder=(body,extra={})=>({id:body.id,product:'racket-report',amount:1999,provider:'mercadopago',currency:'BRL',mode:'live',state:'pending',pixCode:'000201PIX',...extra});
async function createPix(p){p.pay.open('racket-report');p.nodes.find(x=>x.id==='paymentEmail').value='pessoa@exemplo.com';await p.nodes.find(x=>x.id==='paymentGo').onclick();await flush()}

test('pending Pix survives closing the tab, is offered on the next visit and never unlocks while unpaid',async()=>{
 let created;const server=(url,o)=>{if(o.method==='POST'){created=JSON.parse(o.body);return pendingOrder(created)}return pendingOrder(created)};
 const first=page({server});await createPix(first);
 assert.equal(first.local.size,1,'pedido guardado no aparelho');
 // Nova visita: aba nova (sessionStorage vazio), mesmo aparelho.
 const again=page({local:first.local,server});await flush();
 assert.equal(again.calls.restore.length,0,'outra visita não reabre nada sozinha');
 const s=again.pay.saved();assert.equal(s.state,'pending');assert.equal(s.provider,'mercadopago');assert.equal(s.amount,1999);
 assert.ok(s.expires-s.at===DAY);assert.equal('token' in s||'id' in s,false,'o resumo não expõe token nem id');
 await again.pay.resume();await flush();
 assert.equal(again.calls.unlock.length,0,'pendente nunca libera');
 assert.ok(again.nodes.some(x=>x.id==='paymentPixCode'),'reabre o Pix copia e cola');
});

test('resume unlocks only after the server confirms the order as paid',async()=>{
 let created,state='pending';const server=(url,o)=>{if(o.method==='POST'){created=JSON.parse(o.body);return pendingOrder(created)}return pendingOrder(created,{state})};
 const first=page({server});await createPix(first);
 state='paid';
 const again=page({local:first.local,server});await again.pay.resume();await flush();
 assert.equal(again.calls.unlock.length,1);assert.equal(again.calls.unlock[0][0],'racket-report');
 assert.ok(Number.isFinite(JSON.parse([...again.local.values()][0]).paidAt),'data do pagamento guardada');
});

test('pending order expires from the device after 24 h; expired or revoked order is forgotten',async()=>{
 const old=new Map([['sportdna-live-checkout-v1:racket',JSON.stringify({id:'x',token:'t',app:'racket',product:'racket-report',provider:'mercadopago',answers:{},at:Date.now()-DAY-1000})]]);
 const p=page({local:old,server:()=>{throw Error('no call')}});assert.equal(p.pay.saved(),null);assert.equal(old.size,0);
 const rec=new Map([['sportdna-live-checkout-v1:racket',JSON.stringify({id:'y',token:'t',app:'racket',product:'racket-report',provider:'mercadopago',answers:{},at:Date.now()})]]);
 const q=page({local:rec,server:()=>({id:'y',product:'racket-report',amount:1999,provider:'mercadopago',currency:'BRL',mode:'live',state:'expired'})});
 await q.pay.resume();await flush();assert.equal(q.calls.unlock.length,0);assert.equal(rec.size,0);assert.match(q.status(),/expirou/);
});

test('a pending order is reused only for the same answers; new answers create a new order',async()=>{
 const ids=[];let answers={lvl:'int',age:'38'};
 const server=(url,o)=>{if(o.method==='POST'){const b=JSON.parse(o.body);ids.push(b.id);return pendingOrder(b)}return {}};
 const p=page({server,app:{snapshot:()=>JSON.parse(JSON.stringify(answers))}});
 await createPix(p);await createPix(p);assert.equal(new Set(ids).size,1,'mesmas respostas: mesmo pedido');
 answers={age:'38',lvl:'adv'};await createPix(p);assert.equal(new Set(ids).size,2,'respostas novas: pedido novo');
});

test('paid order is kept for the app retest window; retest is allowed once and only after server confirmation',async()=>{
 const paidAt=Date.now()-30*DAY;
 const rec=()=>new Map([['sportdna-live-checkout-v1:racket',JSON.stringify({id:'z',token:'t',app:'racket',product:'racket-report',provider:'stripe',answers:{lvl:'int'},at:paidAt,paidAt})]]);
 const server=()=>({id:'z',product:'racket-report',amount:1999,provider:'stripe',currency:'BRL',mode:'live',state:'paid'});
 // Sem keepPaidDays o pago vale 1 dia.
 assert.equal(page({local:rec(),server}).pay.saved(),null);
 const local=rec();const p=page({local,server,app:{keepPaidDays:90,retestDays:90}});
 const s=p.pay.saved();assert.equal(s.state,'paid');assert.equal(s.retest.available,true);
 assert.equal(p.pay.saveRevision('racket-report','retest'),false,'antes de o servidor confirmar, nada muda');
 await p.pay.resume();await flush();assert.equal(p.calls.unlock.length,1);assert.equal(p.calls.unlock[0][2].retest.available,true);
 assert.equal(p.pay.saveRevision('racket-report','retest'),true);
 assert.equal(p.pay.saveRevision('racket-report','retest'),false,'reteste só uma vez');
 assert.equal(p.pay.saved().retest.used,true);
 const late=new Map([['sportdna-live-checkout-v1:racket',JSON.stringify({id:'z',token:'t',app:'racket',product:'racket-report',provider:'stripe',answers:{},at:0,paidAt:Date.now()-91*DAY})]]);
 assert.equal(page({local:late,server,app:{keepPaidDays:90,retestDays:90}}).pay.saved(),null,'depois de 90 dias o aparelho esquece');
});

test('the payment tab still reopens by itself on reload; forget() clears device and tab',async()=>{
 let created;const server=(url,o)=>{if(o.method==='POST'){created=JSON.parse(o.body);return pendingOrder(created)}return pendingOrder(created,{state:'paid'})};
 const first=page({server});await createPix(first);
 const reload=page({local:first.local,session:first.session,server});await flush();
 assert.equal(reload.calls.restore.length>=1,true);assert.equal(reload.calls.unlock.length,1);
 reload.pay.forget();assert.equal(first.local.size,0);assert.equal(first.session.size,0);
});

// ---------- medição ----------
function measured({path='/racket/',local={},session={}}={}){
 const handlers={},messages=[],nodes=[];let frame;
 const stored=new Map(Object.entries({sd_consent_v1:JSON.stringify({version:1,analytics:true,marketing:true,googleAdsMeasurement:true,at:Date.now()}),btw_capi_choice_v1:'yes',...local}));
 class Element{constructor(tag){this.tag=tag;this.style={};this.children=[];this.id='';this.hidden=false;nodes.push(this);this.classList={contains:c=>(this.className||'').split(' ').includes(c)};if(tag==='iframe'){frame=this;this.contentWindow={postMessage:d=>{messages.push(d);if(d.type==='sd_measure'&&d.id)handlers.message({origin:'https://sportdna.com.br',source:this.contentWindow,data:{type:'sd_done',id:d.id,queued:true}})}}}}
  append(...c){this.children.push(...c);for(const x of c)if(x.tag==='iframe')handlers.message({origin:'https://sportdna.com.br',source:x.contentWindow,data:{type:'sd_ready'}})}appendChild(c){this.append(c)}remove(){}setAttribute(){}addEventListener(){}before(){}querySelector(){return null}}
 const steps=new Element('ol');steps.id='steps';const quiz=new Element('section');quiz.id='quiz';quiz.hidden=true;const landing=new Element('section');landing.id='landing';
 const observers=[];
 const document={cookie:'',referrer:'',head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),getElementById:id=>nodes.find(n=>n.id===id)||null,querySelectorAll:()=>[],querySelector:()=>null};
 const ss=storage(new Map(Object.entries(session)));
 const context={window:{addEventListener(n,f){handlers[n]=f}},document,location:{hostname:'sportdna.com.br',pathname:path,origin:'https://sportdna.com.br',search:''},URL,URLSearchParams,Date,Number,Map,Set,Object,Promise,JSON,setTimeout,clearTimeout,sessionStorage:ss,
  MutationObserver:class{constructor(f){this.f=f;observers.push(this)}observe(){}},localStorage:{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)}};
 vm.createContext(context);vm.runInContext(configSource,context);vm.runInContext(measureSource,context);
 const fire=()=>observers.forEach(o=>o.f());
 const setStep=(i,n)=>{steps.children=Array.from({length:n},(_,k)=>{const e=new Element('li');e.className=k===i?'on':k<i?'done':'';return e});fire()};
 const start=()=>{landing.hidden=true;quiz.hidden=false;fire()};
 return {messages,setStep,start,events:()=>messages.filter(x=>x.type==='sd_measure')};
}
test('quiz_step: each step once per quiz, only its number and total, with A/B group and click origin',async()=>{
 const m=measured({local:{sd_ab_ficha_v1:'ficha'},session:{sd_de:JSON.stringify({de:'artigo_meio',a:'raquete-03',sport:'racket',at:Date.now()})}});
 m.setStep(0,6);m.start();await flush();m.setStep(1,6);m.setStep(1,6);m.setStep(2,6);await flush();await new Promise(r=>setTimeout(r,20));
 const steps=m.events().filter(x=>x.event==='quiz_step');
 assert.deepEqual(steps.map(x=>x.params.step),[1,2,3]);
 for(const e of steps){assert.deepEqual(Object.keys(e.params).sort(),['ab_ficha','cta_artigo','cta_origem','sport','step','steps_total']);assert.equal(e.params.steps_total,6)}
 const start=m.events().find(x=>x.event==='quiz_start');assert.equal(start.params.ab_ficha,'ficha');assert.equal(start.params.cta_origem,'artigo_meio');
 const pv=m.events().find(x=>x.event==='page_view');assert.equal(pv.params.ab_ficha,undefined,'page_view sem contexto');
});
test('A/B group only on RACKET and only known values; stale or foreign click origin is ignored',async()=>{
 const surf=measured({path:'/surf/',local:{sd_ab_ficha_v1:'ficha'},session:{sd_de:JSON.stringify({de:'artigo_meio',sport:'racket',at:Date.now()})}});surf.setStep(0,5);surf.start();await new Promise(r=>setTimeout(r,20));
 for(const e of surf.events())assert.equal(e.params.ab_ficha??e.params.cta_origem,undefined);
 const odd=measured({local:{sd_ab_ficha_v1:'<script>'},session:{sd_de:JSON.stringify({de:'artigo_meio',sport:'racket',at:Date.now()-3600000})}});odd.setStep(0,6);odd.start();await new Promise(r=>setTimeout(r,20));
 for(const e of odd.events())assert.equal(e.params.ab_ficha??e.params.cta_origem,undefined);
});
test('vendor: quiz_step goes to GA4 only, bounded; A/B and origin pass only from the closed lists',()=>{
 const handlers={},parent={postMessage(){}},window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendorSource,{window,parent,location:{origin:'https://sportdna.com.br'},document:{createElement:()=>({}),head:{appendChild(){}}},URLSearchParams,Number});
 const send=data=>handlers.message({origin:'https://sportdna.com.br',source:parent,data});send({type:'sd_init',analytics:true,marketing:true});
 send({type:'sd_measure',event:'quiz_step',path:'/racket/',params:{sport:'racket',step:2,steps_total:6,ab_ficha:'ficha',cta_origem:'grip',answer:'PRIVATE'}});
 const ev=window.dataLayer.filter(x=>x[0]==='event');assert.equal(ev.length,1);assert.equal(ev[0][1],'quiz_step');assert.equal(ev[0][2].step,2);assert.equal(ev[0][2].ab_ficha,'ficha');assert.equal(ev[0][2].cta_origem,'grip');assert(!JSON.stringify(ev).includes('PRIVATE'));
 assert.equal(window.fbq.queue.length,3,'só init/consent/autoConfig: a Meta não recebe etapas');
 for(const params of [{sport:'racket',step:0,steps_total:6},{sport:'racket',step:7,steps_total:6},{sport:'racket',step:'2',steps_total:6},{sport:'surf',step:1,steps_total:5}])send({type:'sd_measure',event:'quiz_step',path:'/racket/',params});
 assert.equal(window.dataLayer.filter(x=>x[0]==='event').length,1);
 send({type:'sd_measure',event:'quiz_start',path:'/surf/',params:{sport:'surf',ab_ficha:'ficha',cta_origem:'xss'}});
 const last=window.dataLayer.filter(x=>x[0]==='event').at(-1)[2];assert.equal(last.ab_ficha,undefined);assert.equal(last.cta_origem,undefined);
 send({type:'sd_measure',event:'page_view',path:'/ferramentas/grip/',params:{}});
 assert.equal(window.fbq.queue.at(-1)[3].content_category,'racket');
});
