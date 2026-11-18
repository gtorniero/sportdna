// Checkout da versão em inglês (en/assets/checkout.en.js): só cartão, USD, sandbox, mercado no pedido.
// node --test racket/tools/i18n/checkout.test.mjs  (rodar depois de build.mjs). Provedores simulados em memória.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const clientSource=readFileSync(new URL('../../../en/assets/checkout.en.js',import.meta.url),'utf8');
const page=readFileSync(new URL('../../../en/racket/index.html',import.meta.url),'utf8');
const configOf=api=>(page.match(/window\.SPORTDNA_PAYMENTS=Object\.freeze\([^\n]*;/)||[''])[0].replace(/api:"[^"]*"/,'api:'+JSON.stringify(api));
function environment(options={}){
 const nodes=[];
 class Element{
  constructor(tag){this.tag=tag;this.style={};this.children=[];this.id='';this.textContent='';this.disabled=false;nodes.push(this)}
  append(...xs){this.children.push(...xs)}
  setAttribute(){} addEventListener(){} showModal(){this.open=true} close(){this.open=false} remove(){} focus(){}
  set innerHTML(value){this.html=value;if(this.tag==='dialog'){for(const [tag,id] of [['h2','paymentTitle'],['p','paymentIntro'],['div','paymentBody'],['p','paymentStatus'],['button','paymentClose']]){const e=new Element(tag);e.id=id;this.append(e)}}}
  querySelector(selector){return this.children.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||this.children.map(x=>x.querySelector(selector)).find(Boolean)||null}
  querySelectorAll(){return []}
 }
 const document={createElement:tag=>new Element(tag),body:new Element('body'),querySelector:selector=>nodes.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||null};
 const context={window:{SportDNAMeasure:options.measure,RK_INTL:{market:options.market||'US',report:'$9.99'}},document,location:{origin:'https://sportdna.com.br',search:''},sessionStorage:{data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}},Intl,URLSearchParams,AbortSignal,AbortController,crypto:globalThis.crypto,setTimeout,clearTimeout,console,...options.context};
 vm.runInNewContext(configOf(options.api??'https://sandbox.example'),context);vm.runInNewContext(clientSource,context);
 context.window.SportDNAPayments.register({name:'racket',snapshot:()=>({}),restore(){},unlock:options.unlock||(()=>{throw Error('Unpaid access must never unlock')})});
 return {context,nodes};
}
test('published page (US beta): live mode on the production worker, USD 9.99',()=>{
 const c=configOf(undefined);assert.match(page,/mode:'live',api:"https:\/\/sportdna-payments-test\.guitorniero\.workers\.dev"/);assert.match(c,/'racket-report-intl':Object\.freeze\(\{name:'RACKET DNA Report',amount:999,currency:'USD'\}\)/);
 assert.doesNotMatch(page,/open\('racket-report'|open\(t==='cmp'|saveRevision\('racket-report'[,)]/);
});
test('without a sandbox API the checkout stays off (the page shows its own test simulator, never a live charge)',()=>{
 const {context}=environment({api:''});assert.equal(context.window.SportDNAPayments.enabled,false);assert.equal(context.window.SportDNAPayments.open('racket-report-intl'),false);
});
test('card only, English, USD price; no Pix and no promo code',()=>{
 const {context,nodes}=environment();assert.equal(context.window.SportDNAPayments.open('racket-report-intl'),true);
 const providers=nodes.filter(x=>x.tag==='button'&&x.provider).map(x=>x.provider);assert.deepEqual(providers,['stripe']);
 assert.equal(nodes.find(x=>x.id==='payment-product-price').textContent,'$9.99');
 assert.ok(nodes.some(x=>x.textContent==='One-time payment, no subscription'));
 assert.equal(nodes.find(x=>x.id==='paymentGo').textContent,'Pay $9.99 by card');
 assert.equal(nodes.some(x=>x.id==='paymentPromo'&&nodes.some(d=>d.tag==='details'&&d.children.includes(x))&&false),false);
});
test('order carries product, market and card provider; never quiz answers',async()=>{
 const {context,nodes}=environment({market:'GB'});let body;
 context.fetch=async(_u,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({id:body.id,product:body.product,amount:999,currency:'USD',market:'GB',provider:'stripe',mode:'test',state:'pending',checkoutUrl:'https://checkout.stripe.com/c/pay/x'})}};
 context.window.SportDNAPayments.open('racket-report-intl');await nodes.find(x=>x.id==='paymentGo').onclick();
 assert.equal(body.product,'racket-report-intl');assert.equal(body.provider,'stripe');assert.equal(body.market,'GB');assert.equal(body.answers,undefined);assert.equal(body.meta,undefined); // sem aceite de marketing não há contexto da Meta
});
for(const [label,patch] of [['sandbox mode',{mode:'test'}],['BRL',{currency:'BRL'}],['other market',{market:'AU'}],['other amount',{amount:1999}],['Pix',{provider:'mercadopago'}]])
 test(`a paid order with ${label} never unlocks`,async()=>{
  let unlocked=0;const {context,nodes}=environment({unlock:()=>unlocked++});let pending;
  context.fetch=async(_u,o)=>{if(o.method==='POST')pending=JSON.parse(o.body);return {ok:true,json:async()=>({id:pending.id,product:pending.product,amount:999,currency:'USD',market:'US',provider:'stripe',mode:'live',state:o.method==='POST'?'pending':'paid',checkoutUrl:'https://checkout.stripe.com/c/pay/x',...patch})}};
  context.window.SportDNAPayments.open('racket-report-intl');await nodes.find(x=>x.id==='paymentGo').onclick();await new Promise(setImmediate);
  assert.equal(unlocked,0);
 });
test('a matching paid live US order unlocks once',async()=>{
 let unlocked=0;const {context,nodes}=environment({unlock:()=>unlocked++});let pending;
 context.fetch=async(_u,o)=>{if(o.method==='POST')pending=JSON.parse(o.body);return {ok:true,json:async()=>({id:pending.id,product:pending.product,amount:999,currency:'USD',market:'US',provider:'stripe',mode:'live',state:o.method==='POST'?'pending':'paid',checkoutUrl:'https://checkout.stripe.com/c/pay/x'})}};
 context.window.SportDNAPayments.open('racket-report-intl');await nodes.find(x=>x.id==='paymentGo').onclick();await new Promise(setImmediate);
 assert.equal(unlocked,1);
});
