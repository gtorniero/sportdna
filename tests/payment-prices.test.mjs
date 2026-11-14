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
  set innerHTML(value){this.html=value;if(this.tag==='dialog'){for(const [tag,id] of [['h2','paymentTitle'],['p','paymentIntro'],['div','paymentBody'],['p','paymentStatus'],['button','paymentClose']]){const e=new Element(tag);e.id=id;this.append(e)}}}
  querySelector(selector){return this.children.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||this.children.map(x=>x.querySelector(selector)).find(Boolean)||null}
  querySelectorAll(){return []}
 }
 const document={createElement:tag=>new Element(tag),body:new Element('body'),querySelector:selector=>nodes.find(x=>selector.startsWith('#')?x.id===selector.slice(1):x.tag===selector)||null};
 const context={window:{SportDNAMeasure:options.measure},document,location:{origin:'https://sportdna.com.br',search:''},sessionStorage:{data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}},Intl,URLSearchParams,AbortSignal,AbortController,crypto:globalThis.crypto,setTimeout,clearTimeout,console,...options.context};
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
  assert.equal(nodes.find(x=>x.id==='payment-product-summary').textContent,catalog[id].name);
  assert.ok(nodes.find(x=>x.id==='payment-product-price').textContent.includes(price));
  assert.ok(nodes.some(x=>x.textContent==='Pagamento único, sem assinatura'));
 });
}
test('unknown product is handled without falling back to the legacy simulated checkout',()=>{const {context,nodes}=environment();assert.equal(context.window.SportDNAPayments.open('unknown'),true);assert.equal(nodes.filter(x=>x.tag==='button'&&x.provider).length,0);assert.ok(nodes.find(x=>x.id==='paymentStatus').textContent.includes('Atualize a página'))});

test('a provider order with a different amount never offers a payment link',async()=>{
 const {context,nodes}=environment();
 context.fetch=async(_url,options)=>({ok:true,json:async()=>({...JSON.parse(options.body),amount:2499,currency:'BRL',mode:'live',state:'pending',checkoutUrl:'https://checkout.stripe.com/test'})});
 context.window.SportDNAPayments.open('racket-report');
 nodes.find(x=>x.tag==='button'&&x.provider==='stripe').onclick();
 await nodes.find(x=>x.id==='paymentGo').onclick();
 assert.ok(nodes.find(x=>x.id==='paymentStatus').textContent.includes('valor retornado é diferente'));
 assert.equal(nodes.filter(x=>x.tag==='a').length,0);
});

// Provedores simulados apenas em memória; nenhum pedido é criado em produção.
test('accepted checkout and confirmed status call measurement hooks without exposing answers',async()=>{
 const calls=[];let unlocked=0;
 const {context,nodes}=environment({unlock:()=>unlocked++,measure:{checkout:o=>calls.push(['checkout',o]),purchase:o=>calls.push(['purchase',o])}});
 let pending;context.fetch=async(_url,options)=>{if(options.method==='POST')pending=JSON.parse(options.body);return {ok:true,json:async()=>({id:pending.id,product:pending.product,amount:1999,provider:'stripe',currency:'BRL',mode:'live',state:options.method==='POST'?'pending':'paid',checkoutUrl:'https://checkout.stripe.com/fixture',measurement:{transaction_id:'a'.repeat(64),value:19.99,currency:'BRL',sport:'racket',product:'racket-report'}})}};
 context.window.SportDNAPayments.open('racket-report');nodes.find(x=>x.tag==='button'&&x.provider==='stripe').onclick();await nodes.find(x=>x.id==='paymentGo').onclick();await new Promise(setImmediate);
 assert.deepEqual(calls.map(x=>x[0]),['checkout','purchase']);assert.equal(unlocked,1);assert(!JSON.stringify(calls).includes('answers'));
});
test('optional measurement failure cannot block the paid access',async()=>{
 let unlocked=0;const {context,nodes}=environment({unlock:()=>unlocked++,measure:{checkout(){throw Error('optional offline')},purchase(){throw Error('optional offline')}}});
 let pending;context.fetch=async(_url,options)=>{if(options.method==='POST')pending=JSON.parse(options.body);return {ok:true,json:async()=>({id:pending.id,product:pending.product,amount:1999,provider:'stripe',currency:'BRL',mode:'live',state:options.method==='POST'?'pending':'paid',checkoutUrl:'https://checkout.stripe.com/fixture'})}};
 context.window.SportDNAPayments.open('racket-report');nodes.find(x=>x.tag==='button'&&x.provider==='stripe').onclick();await nodes.find(x=>x.id==='paymentGo').onclick();await new Promise(setImmediate);assert.equal(unlocked,1);
});

// Causas de CheckoutError (2 contra 8 compras em 14/11): cada falha sai classificada e com texto em português.
function errors(){const rows=[];return {rows,measure:{checkoutOpen(){},checkoutError:(product,o)=>rows.push(o)}}}
async function pay(env,provider){env.context.window.SportDNAPayments.open('racket-report');env.nodes.find(x=>x.tag==='button'&&x.provider===provider).onclick();await env.nodes.find(x=>x.id==='paymentGo').onclick()}
test('Pix e-mail without a dot after @ is caught before the server, as invalid_email',async()=>{
 const e=errors(),env=environment({measure:e.measure});let calls=0;env.context.fetch=async()=>{calls++;throw Error('must not call')};
 env.context.window.SportDNAPayments.open('racket-report');env.nodes.find(x=>x.id==='paymentEmail').value='nome@gmail';await env.nodes.find(x=>x.id==='paymentGo').onclick();
 assert.equal(calls,0);assert.equal(e.rows[0].category,'invalid_email');assert.equal(e.rows[0].method,'pix');
});
test('network failure, timeout, HTML error page and server error are classified, never shown in English',async()=>{
 for(const [label,fetcher,category] of [
  ['network',async()=>{throw new TypeError('Load failed')},'network'],
  ['timeout',async()=>{throw Object.assign(new Error('The operation timed out.'),{name:'TimeoutError'})},'timeout'],
  ['html 502',async()=>({ok:false,status:502,json:async()=>{throw new SyntaxError('Unexpected token <')}}),'unavailable'],
  ['json 400',async()=>({ok:false,status:400,json:async()=>({error:'Informe seu e-mail para o Pix.'})}),'rejected'],
  ['empty 200',async()=>({ok:true,status:200,json:async()=>{throw new SyntaxError('Unexpected end of JSON input')}}),'invalid_response']]){
  const e=errors(),env=environment({measure:e.measure});env.context.fetch=fetcher;await pay(env,'stripe');
  assert.equal(e.rows.at(-1).category,category,label);
  const text=env.nodes.find(x=>x.id==='paymentStatus').textContent;assert.doesNotMatch(text,/Load failed|timed out|Unexpected|token/,label);assert.ok(text.length>10,label);
  assert.equal(env.nodes.find(x=>x.id==='paymentGo').disabled,false,label);
 }
});
test('Safari 15 without AbortSignal.timeout and crypto.randomUUID still creates a valid order',async()=>{
 const legacyCrypto={getRandomValues:a=>globalThis.crypto.getRandomValues(a)};
 const env=environment({context:{AbortSignal:{},crypto:legacyCrypto}});let body,signal;
 env.context.fetch=async(_url,options)=>{body=JSON.parse(options.body);signal=options.signal;return {ok:true,json:async()=>({id:body.id,product:'racket-report',amount:1999,provider:'stripe',currency:'BRL',mode:'live',state:'pending',checkoutUrl:'https://checkout.stripe.com/fixture'})}};
 await pay(env,'stripe');
 assert.match(body.id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);assert.ok(signal&&typeof signal.aborted==='boolean');
 assert.equal(env.nodes.find(x=>x.id==='paymentStatus').textContent.includes('neste navegador'),false);
});
