import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../assets/measurement.js',import.meta.url),'utf8');
const vendor=readFileSync(new URL('../assets/measurement-vendor.js',import.meta.url),'utf8');
const config=readFileSync(new URL('../assets/payments/config.js',import.meta.url),'utf8');
const products={'racket-report':'racket','surf-report':'surf','run-report':'run','racket-comparator':'racket'};
function browser({path='/surf/',choice=true,stored=new Map(),autoReady=true,ack=true}={}){
 const handlers={},nodes=[],messages=[];let frame;
 if(!stored.has('sd_consent_v1'))stored.set('sd_consent_v1',JSON.stringify({version:1,analytics:choice,marketing:choice,at:Date.now()}));
 const window={addEventListener(n,f){handlers[n]=f}};
 class Element{constructor(tag){this.tag=tag;this.style={};this.children=[];this.id='';this.listeners={};nodes.push(this);if(tag==='iframe'){frame=this;this.contentWindow={postMessage:data=>{messages.push(data);if(data.type==='sd_measure'&&data.id&&ack)handlers.message({origin:location.origin,source:this.contentWindow,data:{type:'sd_done',id:data.id,queued:true}})}}}}append(...children){this.children.push(...children);for(const child of children)if(child.tag==='iframe'&&autoReady)ready()}appendChild(child){this.append(child)}remove(){this.removed=true}setAttribute(){}addEventListener(n,f){this.listeners[n]=f}querySelector(){return null}}
 const location={hostname:'sportdna.com.br',pathname:path,origin:'https://sportdna.com.br',search:'?utm_source=qa&utm_term=private%40example.invalid&email=private%40example.invalid#private'};
 const document={cookie:'',head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),getElementById:id=>nodes.find(n=>n.id===id&&!n.removed)||null,querySelectorAll:()=>[]};
 const context={window,document,location,URLSearchParams,Date,Number,Map,Set,Object,Promise,setTimeout,clearTimeout,MutationObserver:class{observe(){}},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)}};
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
