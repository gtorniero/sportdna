import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../assets/measurement.js',import.meta.url),'utf8');
const vendor=readFileSync(new URL('../assets/measurement-vendor.js',import.meta.url),'utf8');
const config=readFileSync(new URL('../assets/payments/config.js',import.meta.url),'utf8');
const products={'racket-report':'racket','surf-report':'surf','run-report':'run','racket-comparator':'racket'};
function browser({path='/surf/',choice=true,stored=new Map(),autoReady=true,ack=true,canonical=null,referrer=''}={}){
 const handlers={},nodes=[],messages=[];let frame;
 if(!stored.has('sd_consent_v1'))stored.set('sd_consent_v1',JSON.stringify({version:1,analytics:choice,marketing:choice,at:Date.now()}));
 const window={addEventListener(n,f){handlers[n]=f}};
 class Element{constructor(tag){this.tag=tag;this.style={};this.children=[];this.id='';this.listeners={};nodes.push(this);if(tag==='iframe'){frame=this;this.contentWindow={postMessage:data=>{messages.push(data);if(data.type==='sd_measure'&&data.id&&ack)handlers.message({origin:location.origin,source:this.contentWindow,data:{type:'sd_done',id:data.id,queued:true}})}}}}append(...children){this.children.push(...children);for(const child of children)if(child.tag==='iframe'&&autoReady)ready()}appendChild(child){this.append(child)}remove(){this.removed=true}setAttribute(){}addEventListener(n,f){this.listeners[n]=f}querySelector(){return null}}
 const location={hostname:'sportdna.com.br',pathname:path,origin:'https://sportdna.com.br',search:'?utm_source=qa&utm_term=private%40example.invalid&email=private%40example.invalid#private'};
 const document={cookie:'',referrer,head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),getElementById:id=>nodes.find(n=>n.id===id&&!n.removed)||null,querySelectorAll:()=>[],querySelector:s=>s.includes('canonical')&&canonical?{getAttribute:()=>canonical}:null};
 const context={window,document,location,URL,URLSearchParams,Date,Number,Map,Set,Object,Promise,setTimeout,clearTimeout,MutationObserver:class{observe(){}},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)}};
 const ready=()=>handlers.message({origin:location.origin,source:frame.contentWindow,data:{type:'sd_ready'}});
 vm.createContext(context);vm.runInContext(config,context);vm.runInContext(source,context);
 return {measure:window.SportDNAMeasure,messages,stored,handlers,ready,frame:()=>frame,context,nodes};
}
function order(product='surf-report',provider='stripe'){
 const amount=product==='run-report'?999:product==='racket-comparator'?499:1999;
 return {id:'fixture-'+product,mode:'live',state:'paid',provider,product,amount,currency:'BRL',email:'PRIVATE@example.invalid',token:'SECRET',answers:{weight:70},measurement:{transaction_id:'a'.repeat(64),value:amount/100,currency:'BRL',sport:products[product],product}};
}
const events=b=>b.messages.filter(x=>x.type==='sd_measure');
test('all products send bounded confirmed sale once across repeat status and reload; no private fields',async()=>{
 for(const product of Object.keys(products))for(const provider of ['stripe','mercadopago']){
  const b=browser({path:'/'+products[product]+'/'}),o=order(product,provider);
  await b.measure.checkout({...o,state:'pending'});await b.measure.checkout(o);await b.measure.purchase(o);await b.measure.purchase(o);
  assert.equal(events(b).filter(x=>x.event==='begin_checkout').length,1);
  assert.equal(events(b).filter(x=>x.event==='purchase').length,1);
  const sale=events(b).find(x=>x.event==='purchase');assert.equal(sale.params.payment_type,provider==='stripe'?'card':'pix');assert.equal(sale.params.value,o.amount/100);
  const payload=JSON.stringify(events(b));for(const privateValue of ['PRIVATE','SECRET','weight','example.invalid','fixture-'])assert(!payload.includes(privateValue),privateValue);
  const reload=browser({path:'/'+products[product]+'/',stored:b.stored});await reload.measure.purchase(o);assert.equal(events(reload).filter(x=>x.event==='purchase').length,0);
 }
});
test('refusal, revocation, pending, test, promo, altered metadata, wrong product or amount never emit Purchase',async()=>{
 const refused=browser({choice:false});await refused.measure.purchase(order());assert.equal(events(refused).length,0);
 const b=browser();
 for(const patch of [{state:'pending'},{state:'revoked'},{mode:'test'},{provider:'promo',amount:0},{amount:1},{product:'racket-report'},{measurement:null},{measurement:{...order().measurement,value:1}},{measurement:{...order().measurement,transaction_id:'ACCESS-CODE'}}])await b.measure.purchase({...order(),...patch});
 assert.equal(events(b).filter(x=>x.event==='purchase').length,0);
 b.stored.set('sd_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));b.handlers.storage({key:'sd_consent_v1'});await b.measure.purchase(order());assert.equal(events(b).filter(x=>x.event==='purchase').length,0);assert(b.frame().removed);
 const privatePage=browser({path:'/private/'});await privatePage.measure.purchase(order());assert.equal(events(privatePage).length,0);
});
test('events wait for the isolated bridge and an in-flight sale is cancelled by revocation',async()=>{
 const b=browser({autoReady:false});const queued=b.measure.purchase(order());assert.equal(events(b).length,0);b.ready();await queued;assert.equal(events(b).filter(x=>x.event==='purchase').length,1);
 const c=browser({autoReady:false});const cancelled=c.measure.purchase(order());c.stored.set('sd_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));c.handlers.storage({key:'sd_consent_v1'});await cancelled;assert.equal(events(c).length,0);
});
test('vendor receives purchase/checkout with sport product metadata and rejects unknown mismatches',()=>{
 const handlers={},parent={postMessage(){}},window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendor,{window,parent,location:{origin:'https://sportdna.com.br'},document:{createElement:()=>({}),head:{appendChild(){}}},URLSearchParams,Number});
 const send=data=>handlers.message({origin:'https://sportdna.com.br',source:parent,data});send({type:'sd_init',analytics:true,marketing:true});
 const params={...order().measurement,payment_type:'card',email:'PRIVATE@example.invalid'};
 for(const event of ['begin_checkout','purchase'])send({type:'sd_measure',event,path:'/surf/',params});
 assert.equal(window.dataLayer.filter(x=>x[0]==='event').length,2);assert.equal(window.fbq.queue.filter(x=>x[2]==='Purchase').length,1);assert(!JSON.stringify(window.dataLayer).includes('PRIVATE'));
 for(const product of ['unknown','racket-report'])send({type:'sd_measure',event:'purchase',path:'/surf/',params:{...params,product}});
 assert.equal(window.dataLayer.filter(x=>x[0]==='event').length,2);
});

test('legacy advertising permission stays denied; explicit new choice is required, refusal stays refused',()=>{
 const at=Date.now();
 const setup=c=>browser({stored:new Map([['sd_consent_v1',JSON.stringify({version:1,analytics:true,marketing:true,at,...c})],['btw_capi_choice_v1','yes']])});
 const old=setup({});assert.equal(old.messages.find(d=>d.type==='sd_init').googleAdsMeasurement,false);assert(old.nodes.some(n=>n.id==='sd-consent'&&!n.removed));
 const fresh=setup({googleAdsMeasurement:true});assert.equal(fresh.messages.find(d=>d.type==='sd_init').googleAdsMeasurement,true);assert(!fresh.nodes.some(n=>n.id==='sd-consent'&&!n.removed));
 const no=setup({analytics:false,marketing:false});assert.equal(no.messages.length,0);assert(!no.nodes.some(n=>n.id==='sd-consent'&&!n.removed));
});
test('concurrent checks emit once; failure does not persist success and revocation cancels acknowledgment',async()=>{
 const b=browser({ack:false}),o=order();const p=b.measure.purchase(o),duplicate=b.measure.purchase(o);
 await new Promise(setImmediate);assert.equal(events(b).filter(x=>x.event==='purchase').length,1);
 b.stored.set('sd_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));b.handlers.storage({key:'sd_consent_v1'});await p;await duplicate;
 assert.equal(b.stored.has('sd_sale_'+o.measurement.transaction_id),false);
});
test('a failed acknowledgment can retry without deleting old purchase markers',async()=>{
 const b=browser({ack:false}),o=order(),p=b.measure.purchase(o);await new Promise(setImmediate);const message=events(b).find(x=>x.event==='purchase');
 b.handlers.message({origin:'https://sportdna.com.br',source:b.frame().contentWindow,data:{type:'sd_done',id:message.id,queued:false}});await p;assert.equal(b.stored.has('sd_sale_'+o.measurement.transaction_id),false);
 const retry=b.measure.purchase(o);await new Promise(setImmediate);const last=events(b).filter(x=>x.event==='purchase').at(-1);
 b.handlers.message({origin:'https://sportdna.com.br',source:b.frame().contentWindow,data:{type:'sd_done',id:last.id,queued:true}});await retry;assert.equal(b.stored.get('sd_sale_'+o.measurement.transaction_id),'1');
});

const quizEvents=b=>b.messages.filter(x=>x.type==='sd_measure'&&x.event.startsWith('quiz_')).map(x=>x.event);
const settle=()=>new Promise(setImmediate);
function choose(b,value){const banner=b.nodes.find(n=>n.id==='sd-consent'&&!n.removed);assert(banner,'consent banner');banner.listeners.click({target:{closest:()=>({dataset:{choice:value}})}})}
function revoke(b){b.stored.set('sd_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));b.handlers.storage({key:'sd_consent_v1'})}

test('valid consent before the test: one start and one completion',async()=>{
 const b=browser({path:'/racket/'});b.measure.screen('quiz');await settle();b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_start','quiz_complete']);
});
test('initial refusal throughout: no start and no completion',async()=>{
 const b=browser({path:'/racket/',choice:false});b.measure.screen('quiz');await settle();b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),[]);
});
test('consent accepted only after the test started: completion without backfilling start',async()=>{
 const b=browser({path:'/racket/',choice:false});b.measure.screen('quiz');await settle();assert.deepEqual(quizEvents(b),[]);
 choose(b,'accept');await settle();b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_complete']);
});
test('revocation during the test: no completion after revocation',async()=>{
 const b=browser({path:'/racket/'});b.measure.screen('quiz');await settle();revoke(b);b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_start']);
});
test('duplicate screen notifications do not create duplicate events',async()=>{
 const b=browser({path:'/racket/'});b.measure.screen('quiz');b.measure.screen('quiz');await settle();b.measure.screen('analysis');b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_start','quiz_complete']);
});
test('standalone example or restored report in a fresh document is not a completed quiz',async()=>{
 const b=browser({path:'/racket/'});b.measure.screen('analysis');await settle();b.measure.screen('preview');b.measure.screen('report');await settle();
 assert.deepEqual(quizEvents(b),[]);
});
test('bridge readiness within the wait window preserves the start',async()=>{
 const b=browser({path:'/racket/',autoReady:false});b.measure.screen('quiz');await settle();assert.deepEqual(quizEvents(b),[]);b.ready();await settle();b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_start','quiz_complete']);
});
test('consented quiz waits beyond two seconds for a slow bridge without losing start',async()=>{
 const b=browser({path:'/racket/',autoReady:false});b.measure.screen('quiz');await new Promise(resolve=>setTimeout(resolve,2050));b.ready();await settle();b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_start','quiz_complete']);
});

test('revocation cancels a quiz waiting for a slow bridge, even if consent is later granted',async()=>{
 const b=browser({path:'/racket/',autoReady:false});b.measure.screen('quiz');await settle();revoke(b);await settle();
 choose(b,'accept');b.ready();await settle();b.measure.screen('analysis');await settle();
 assert.deepEqual(quizEvents(b),['quiz_complete']);
});

test('RACKET offer/open/error are distinct from an order; bounded parameters only',async()=>{
 const b=browser({path:'/racket/'});
 await b.measure.offer('racket-report',{answers:{pain:'PRIVATE'},email:'PRIVATE'});
 await b.measure.checkoutOpen('racket-report',{position:'preview_primary',email:'PRIVATE'});
 await b.measure.checkoutError('racket-report',{position:'preview_primary',method:'pix',category:'network',message:'PRIVATE'});
 const rows=events(b).filter(e=>e.event!=='page_view');
 assert.deepEqual(rows.map(e=>e.event),['view_offer','checkout_open','checkout_error']);
 assert.equal(rows[1].params.cta_position,'preview_primary');assert.equal(rows[2].params.error_category,'network');
 assert(!JSON.stringify(rows).includes('PRIVATE'));assert(!rows.some(e=>e.event==='begin_checkout'||e.event==='purchase'));
 await b.measure.checkoutError('racket-report',{category:'PRIVATE'});assert.equal(events(b).length,4);
});
test('offers exclude demo, test mode, wrong products, refusal and retroactive acceptance',async()=>{
 const b=browser({path:'/racket/'});
 for(const action of ['offer','checkoutOpen','checkoutError'])await b.measure[action]('racket-report',{example:true,category:'network'});
 await b.measure.offer('surf-report');b.context.window.SPORTDNA_PAYMENTS={mode:'test'};await b.measure.offer('racket-report');
 assert.deepEqual(events(b).map(e=>e.event),['page_view']);
 const no=browser({path:'/racket/',choice:false});await no.measure.offer('racket-report');choose(no,'accept');await settle();
 assert.equal(events(no).filter(e=>e.event==='view_offer').length,0);
 await no.measure.checkoutOpen('racket-report');assert.equal(events(no).filter(e=>e.event==='checkout_open').length,1);
 const slow=browser({path:'/racket/',autoReady:false});const queued=slow.measure.offer('racket-report');revoke(slow);await queued;
 assert.equal(events(slow).length,0);
});
test('vendor filters RACKET offer fields and uses distinct Meta events',()=>{
 const handlers={},parent={postMessage(){}},window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendor,{window,parent,location:{origin:'https://sportdna.com.br'},document:{createElement:()=>({}),head:{appendChild(){}}},URLSearchParams,Number});
 const send=data=>handlers.message({origin:'https://sportdna.com.br',source:parent,data});send({type:'sd_init',analytics:true,marketing:true});
 for(const event of ['view_offer','checkout_open','checkout_error'])send({type:'sd_measure',event,path:'/racket/',params:{sport:'racket',product:'racket-report',cta_position:'preview_primary',payment_type:'pix',error_category:'network',email:'PRIVATE',answers:{pain:'PRIVATE'}}});
 assert.deepEqual(Array.from(window.fbq.queue.filter(e=>e[0]==='trackSingleCustom'),e=>e[2]),['OfferViewed','CheckoutOpened','CheckoutError']);
 assert(!JSON.stringify(window.dataLayer).includes('PRIVATE'));assert(!JSON.stringify(window.fbq.queue).includes('PRIVATE'));
 send({type:'sd_measure',event:'checkout_error',path:'/racket/',params:{sport:'racket',product:'racket-report',error_category:'PRIVATE'}});
 assert.equal(window.dataLayer.filter(e=>e[0]==='event').length,3);
});

test('consent bar: Aceitar is the primary choice, Recusar the same-size secondary, link to the measurement section',()=>{
 const b=browser({path:'/racket/',stored:new Map()});b.stored.delete('sd_consent_v1');
 const fresh=browser({path:'/racket/',stored:new Map([['sd_consent_v1','null']])});
 const bar=fresh.nodes.find(n=>n.id==='sd-consent'&&!n.removed);assert(bar,'bar shown without a choice');
 assert.match(bar.innerHTML,/class="sd-sec" data-choice="reject">Recusar<\/button><button type="button" class="sd-pri" data-choice="accept">Aceitar<\/button>/);
 assert.match(bar.innerHTML,/href="\/privacidade\/#medicao">Saiba mais</);
 const css=fresh.nodes.find(n=>n.id==='sd-consent-css').textContent;assert.match(css,/#sd-consent button\{[^}]*min-height:44px/);
 assert.equal(fresh.nodes.find(n=>n.id==='sd-cookie-status').innerHTML.includes('Medição desligada'),true);
 assert.equal(events(fresh).length,0,'nothing measured before a choice');
 choose(fresh,'accept');assert.equal(fresh.nodes.find(n=>n.id==='sd-cookie-status').innerHTML.includes('Medição ligada'),true);assert(!fresh.nodes.some(n=>n.id==='sd-consent'&&!n.removed));
 assert.equal(fresh.stored.get('btw_capi_choice_v1'),'yes');
 fresh.measure.preferences();choose(fresh,'reject');assert.equal(fresh.stored.get('btw_capi_choice_v1'),'no');assert.equal(JSON.parse(fresh.stored.get('sd_consent_v1')).marketing,false);
 assert.equal(fresh.nodes.find(n=>n.id==='sd-cookie-status').innerHTML.includes('Medição desligada'),true);
 assert(fresh.messages.some(m=>m.type==='sd_consent'&&m.analytics===false&&m.marketing===false),'revocation reaches Consent Mode before teardown');
});
test('blog articles keep their own path only when it is the published canonical page; calculator is measured',async()=>{
 const article='/blog/litragem-como-entender-o-volume-da-prancha/';
 const ok=browser({path:article,canonical:'https://sportdna.com.br'+article});assert.equal(events(ok)[0].path,article);
 const missing=browser({path:'/blog/nome-de-alguem/'});assert.equal(events(missing)[0].path,'/blog/');
 const calc=browser({path:'/ferramentas/litragem/'});assert.equal(events(calc)[0].path,'/ferramentas/litragem/');
 const ref=browser({path:'/',referrer:'https://www.google.com/search?q=private'});assert.equal(events(ref)[0].referrer,'https://www.google.com/');
 const self=browser({path:'/',referrer:'https://sportdna.com.br/racket/'});assert.equal(events(self)[0].referrer,'');
});
test('SURF and RUN offers use their own product and price; other sports stay excluded',async()=>{
 for(const [sport,product,value] of [['surf','surf-report',19.99],['run','run-report',9.99],['racket','racket-report',19.99]]){
  const b=browser({path:'/'+sport+'/'});await b.measure.offer(product,{example:false});await b.measure.checkoutOpen(product);
  const rows=events(b).filter(e=>e.event!=='page_view');assert.deepEqual(rows.map(e=>e.event),['view_offer','checkout_open'],sport);
  assert.equal(rows[0].params.value,value);assert.equal(rows[0].params.currency,'BRL');
  await b.measure.offer(sport==='run'?'surf-report':'run-report');assert.equal(events(b).filter(e=>e.event==='view_offer').length,1);
 }
});
test('vendor sends Meta standard events next to the unchanged custom events, always with the real page',()=>{
 const handlers={},parent={postMessage(){}},window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendor,{window,parent,location:{origin:'https://sportdna.com.br'},document:{createElement:()=>({}),head:{appendChild(){}}},URLSearchParams,Number});
 const send=data=>handlers.message({origin:'https://sportdna.com.br',source:parent,data});send({type:'sd_init',analytics:true,marketing:true});
 const tx='b'.repeat(64);
 send({type:'sd_measure',event:'page_view',path:'/surf/'});
 send({type:'sd_measure',event:'quiz_start',path:'/surf/',params:{sport:'surf'}});
 send({type:'sd_measure',event:'quiz_complete',path:'/surf/',params:{sport:'surf'}});
 send({type:'sd_measure',event:'view_offer',path:'/surf/',params:{sport:'surf',product:'surf-report',value:19.99,currency:'BRL'}});
 send({type:'sd_measure',event:'checkout_open',path:'/surf/',params:{sport:'surf',product:'surf-report',value:19.99,currency:'BRL'}});
 send({type:'sd_measure',event:'begin_checkout',path:'/surf/',params:{sport:'surf',product:'surf-report',value:19.99,currency:'BRL',payment_type:'pix'}});
 send({type:'sd_measure',event:'purchase',path:'/surf/',params:{sport:'surf',product:'surf-report',value:19.99,currency:'BRL',payment_type:'pix',transaction_id:tx}});
 const q=Array.from(window.fbq.queue.filter(e=>String(e[0]).startsWith('track')),e=>Array.from(e));
 const name=e=>e[0]==='trackSingleCustom'?e[2]:e[2];
 assert.deepEqual(q.map(name),['PageView','QuizStarted','QuizCompleted','Lead','OfferViewed','ViewContent','CheckoutOpened','InitiateCheckout','Purchase']);
 const by=n=>q.find(e=>e[2]===n)[3];
 for(const e of q)assert.equal(e[3].page_path,'/surf/',e[2]);
 assert.equal(JSON.stringify(by('Lead')),JSON.stringify({content_category:'surf',page_path:'/surf/'}));
 assert.equal(by('ViewContent').value,19.99);assert.equal(by('ViewContent').currency,'BRL');assert.deepEqual(Array.from(by('ViewContent').content_ids),['surf-report']);assert.equal(by('ViewContent').content_category,'surf');
 assert.equal(by('InitiateCheckout').content_category,'surf-report','existing InitiateCheckout category kept');assert.deepEqual(Array.from(by('InitiateCheckout').content_ids),['surf-report']);
 const purchase=q.find(e=>e[2]==='Purchase');assert.equal(purchase[3].value,19.99);assert.deepEqual(Array.from(purchase[3].content_ids),['surf-report']);assert.equal(purchase[4].eventID,tx);
 assert.equal(by('QuizCompleted').content_category,'surf');
 // Oferta de outro esporte na página errada continua fora.
 send({type:'sd_measure',event:'view_offer',path:'/racket/',params:{sport:'surf',product:'surf-report',value:19.99,currency:'BRL'}});
 assert.equal(window.fbq.queue.filter(e=>e[2]==='ViewContent').length,1);
});

test('SURF specialist contact: generate_lead only with consent, bounded origin, no private fields',async()=>{
 const b=browser({path:'/surf/'});
 await b.measure.contact('previa');await b.measure.contact('relatorio');await b.measure.contact('PRIVATE');await b.measure.contact({text:'PRIVATE'});
 const rows=events(b).filter(e=>e.event==='generate_lead');
 assert.deepEqual(rows.map(e=>e.params.origem),['previa','relatorio']);
 for(const e of rows){assert.equal(e.params.sport,'surf');assert.equal(e.path,'/surf/');assert.deepEqual(Object.keys(e.params).sort(),['origem','sport'])}
 assert(!JSON.stringify(events(b)).includes('PRIVATE'));
 const refused=browser({path:'/surf/',choice:false});await refused.measure.contact('previa');assert.equal(events(refused).length,0);
 const slow=browser({path:'/surf/',autoReady:false});const queued=slow.measure.contact('previa');revoke(slow);await queued;assert.equal(events(slow).length,0);
 const outside=browser({path:'/blog/'});await outside.measure.contact('previa');assert.equal(events(outside).filter(e=>e.event==='generate_lead').length,0);
});
test('vendor maps the contact to GA4 generate_lead, Meta Contact and custom ContatoEspecialista',()=>{
 const handlers={},parent={postMessage(){}},window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendor,{window,parent,location:{origin:'https://sportdna.com.br'},document:{createElement:()=>({}),head:{appendChild(){}}},URLSearchParams,Number});
 const send=data=>handlers.message({origin:'https://sportdna.com.br',source:parent,data});send({type:'sd_init',analytics:true,marketing:true});
 send({type:'sd_measure',event:'generate_lead',path:'/surf/',params:{sport:'surf',origem:'previa',text:'PRIVATE',code:'SD-PRIVA'}});
 const ga=window.dataLayer.filter(e=>e[0]==='event');assert.equal(ga.length,1);assert.equal(ga[0][1],'generate_lead');assert.equal(ga[0][2].origem,'previa');assert.equal(ga[0][2].sport,'surf');
 const q=Array.from(window.fbq.queue.filter(e=>String(e[0]).startsWith('track')),e=>Array.from(e));
 assert.deepEqual(q.map(e=>e[2]),['ContatoEspecialista','Contact']);
 assert.equal(q[1][0],'trackSingle');assert.equal(q[1][3].origem,'previa');assert.equal(q[1][3].page_path,'/surf/');assert.equal(q[1][3].content_category,'surf');
 assert.equal(q[0][0],'trackSingleCustom');assert.equal(q[0][3].origem,'previa');
 assert(!JSON.stringify(window.dataLayer).includes('PRIVA'));assert(!JSON.stringify(window.fbq.queue).includes('PRIVA'));
 // origem fora da lista, esporte trocado ou outra página: nada sai
 send({type:'sd_measure',event:'generate_lead',path:'/surf/',params:{sport:'surf',origem:'PRIVATE'}});
 send({type:'sd_measure',event:'generate_lead',path:'/racket/',params:{sport:'surf',origem:'relatorio'}});
 send({type:'sd_measure',event:'generate_lead',path:'/surf/',params:{origem:'relatorio'}});
 assert.equal(window.dataLayer.filter(e=>e[0]==='event').length,1);assert.equal(window.fbq.queue.filter(e=>e[2]==='Contact').length,1);
});
test('buying guides: page view measured with the real path and the racket category; institutional pages stay out',()=>{
 const guides=['/guias/racket/melhor-raquete-de-tenis/','/guias/racket/melhor-raquete-de-tenis-para-iniciante/','/guias/racket/raquete-de-tenis-para-dor-no-cotovelo/'];
 for(const path of guides){const b=browser({path,canonical:'https://sportdna.com.br'+path});assert.equal(events(b).filter(e=>e.event==='page_view').length,1,path);assert.equal(events(b)[0].path,path)}
 for(const path of ['/sobre/','/contato/','/termos/','/como-ganhamos-dinheiro/','/guias/racket/outro/']){const b=browser({path});assert.equal(events(b).length,0,path)}
 const handlers={},parent={postMessage(){}},window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendor,{window,parent,location:{origin:'https://sportdna.com.br'},document:{createElement:()=>({}),head:{appendChild(){}}},URLSearchParams,Number});
 const send=data=>handlers.message({origin:'https://sportdna.com.br',source:parent,data});send({type:'sd_init',analytics:true,marketing:true});
 for(const path of guides)send({type:'sd_measure',event:'page_view',path});
 send({type:'sd_measure',event:'page_view',path:'/guias/racket/outro/'});
 const views=Array.from(window.fbq.queue.filter(e=>e[2]==='PageView'),e=>Array.from(e));
 assert.deepEqual(views.map(e=>e[3].page_path),guides);for(const e of views)assert.equal(e[3].content_category,'racket');
});
