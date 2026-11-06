import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {catalog} from '../payments/src/security.mjs';
const configSource=readFileSync(new URL('../assets/payments/config.js',import.meta.url),'utf8');
const clientSource=readFileSync(new URL('../assets/payments/client.js',import.meta.url),'utf8');
function environment(options={}){
 const nodes=[];
 class Element{
  constructor(tag){this.tag=tag;this.style={};this.children=[];this.id='';this.textContent='';this.disabled=false;nodes.push(this)}
  append(...xs){this.children.push(...xs)}
  setAttribute(){} addEventListener(){} showModal(){this.open=true} close(){this.open=false} remove(){} focus(){}
  set innerHTML(value){this.html=value;if(this.tag==='dialog'){for(const [tag,id] of [['h2','paymentTitle'],['div','paymentBody'],['p','paymentStatus'],['button','paymentClose']]){const e=new Element(tag);e.id=id;this.append(e)}}}
  querySelector(selector){return this.children.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||this.children.map(x=>x.querySelector(selector)).find(Boolean)||null}
  querySelectorAll(){return []}
 }
 const document={createElement:tag=>new Element(tag),body:new Element('body'),querySelector:selector=>nodes.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||null};
 const context={window:{SportDNAMeasure:options.measure},document,location:{origin:'https://sportdna.com.br',search:''},sessionStorage:{data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}},Intl,URLSearchParams,AbortSignal,crypto:globalThis.crypto,setTimeout,clearTimeout,console};
 vm.runInNewContext(configSource,context);vm.runInNewContext(clientSource,context);
 context.window.SportDNAPayments.register({name:'racket',snapshot:()=>({}),restore(){},unlock:options.unlock||(()=>{throw Error('Unpaid access must never unlock')})});
 return {context,nodes};
}
test('all displayed products exactly match server amounts and names',()=>{
 const {context}=environment();const products=context.window.SPORTDNA_PAYMENTS.products;
 assert.deepEqual(Object.keys(products).sort(),Object.keys(catalog).sort());
 for(const [id,p] of Object.entries(products)){assert.equal(p.amount,catalog[id].amount,id);assert.equal(p.name,catalog[id].name,id)}
});
for(const [id,price] of [['racket-report','19,99'],['surf-report','19,99'],['run-report','9,99'],['racket-comparator','4,99']]){
 test(`checkout identifies ${id} and its full one-time price before a provider is selected`,()=>{
  const {context,nodes}=environment();assert.equal(context.window.SportDNAPayments.open(id),true);
  const text=nodes.find(x=>x.id==='payment-product-summary').textContent;
  assert.ok(text.includes(catalog[id].name));assert.ok(text.includes(price));assert.ok(text.includes('pagamento único'));
 });
}
test('unknown product is handled without falling back to the legacy simulated checkout',()=>{const {context,nodes}=environment();assert.equal(context.window.SportDNAPayments.open('unknown'),true);assert.equal(nodes.filter(x=>x.tag==='button'&&x.textContent==='Cartão — Stripe').length,0);assert.ok(nodes.find(x=>x.id==='paymentStatus').textContent.includes('Atualize a página'))});

test('a provider order with a different amount never offers a payment link',async()=>{
 const {context,nodes}=environment();
 context.fetch=async(_url,options)=>({ok:true,json:async()=>({...JSON.parse(options.body),amount:2499,currency:'BRL',mode:'live',state:'pending',checkoutUrl:'https://checkout.stripe.com/test'})});
 context.window.SportDNAPayments.open('racket-report');
 await nodes.find(x=>x.tag==='button'&&x.textContent==='Cartão — Stripe').onclick();
 assert.ok(nodes.find(x=>x.id==='paymentStatus').textContent.includes('valor retornado é diferente'));
 assert.equal(nodes.filter(x=>x.tag==='a').length,0);
});

// Provedores simulados apenas em memória; nenhum pedido é criado em produção.
test('accepted checkout and confirmed status call measurement hooks without exposing answers',async()=>{
 const calls=[];let unlocked=0;
 const {context,nodes}=environment({unlock:()=>unlocked++,measure:{checkout:o=>calls.push(['checkout',o]),purchase:o=>calls.push(['purchase',o])}});
 let pending;context.fetch=async(_url,options)=>{if(options.method==='POST')pending=JSON.parse(options.body);return {ok:true,json:async()=>({id:pending.id,product:pending.product,amount:1999,provider:'stripe',currency:'BRL',mode:'live',state:options.method==='POST'?'pending':'paid',checkoutUrl:'https://checkout.stripe.com/fixture',measurement:{transaction_id:'a'.repeat(64),value:19.99,currency:'BRL',sport:'racket',product:'racket-report'}})}};
 context.window.SportDNAPayments.open('racket-report');await nodes.find(x=>x.tag==='button'&&x.textContent==='Cartão — Stripe').onclick();await new Promise(setImmediate);
 assert.deepEqual(calls.map(x=>x[0]),['checkout','purchase']);assert.equal(unlocked,1);assert(!JSON.stringify(calls).includes('answers'));
});
test('optional measurement failure cannot block the paid access',async()=>{
 let unlocked=0;const {context,nodes}=environment({unlock:()=>unlocked++,measure:{checkout(){throw Error('optional offline')},purchase(){throw Error('optional offline')}}});
 let pending;context.fetch=async(_url,options)=>{if(options.method==='POST')pending=JSON.parse(options.body);return {ok:true,json:async()=>({id:pending.id,product:pending.product,amount:1999,provider:'stripe',currency:'BRL',mode:'live',state:options.method==='POST'?'pending':'paid',checkoutUrl:'https://checkout.stripe.com/fixture'})}};
 context.window.SportDNAPayments.open('racket-report');await nodes.find(x=>x.tag==='button'&&x.textContent==='Cartão — Stripe').onclick();await new Promise(setImmediate);assert.equal(unlocked,1);
});
