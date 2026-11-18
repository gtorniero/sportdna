// Versão em inglês do RACKET DNA: relatório em USD; ao vivo só US (beta), GB/CA/AU só no sandbox.
// Tudo aqui roda em memória; nenhum pedido chega a provedor real.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {catalog,stripeState,digest} from '../src/security.mjs';
import {saleMeasurement} from '../src/measurement.mjs';
import worker from '../src/worker.mjs';

const product='racket-report-intl';
const id='81f87685-15e9-42b9-8074-6f13b94597ac',token='c'.repeat(64);
const origin='https://preview.example';
function database(){
 const db=new DatabaseSync(':memory:');for(const m of ['0001.sql','0002_market.sql'])db.exec(readFileSync(new URL('../migrations/'+m,import.meta.url),'utf8'));
 return {raw:db,prepare(sql){return {bind(...params){return {async first(){return db.prepare(sql).get(...params)},async run(){return db.prepare(sql).run(...params)}}}}}};
}
const env=(mode='test')=>({DB:database(),SITE_ORIGIN:origin,PAYMENTS_MODE:mode,RATE_SECRET:'unit-rate',STRIPE_KEY:['rk','test','unit'].join('_'),STRIPE_WEBHOOK_SECRET:'unit-secret',STRIPE_LIVE_KEY:'rk_live_unit',STRIPE_LIVE_WEBHOOK_SECRET:'live-hook'});
const req=(path,init={})=>new Request('https://api.example'+path,{...init,headers:{Origin:origin,...init.headers}});
const order={id,product,provider_id:'cs_intl',amount:999,mode:'test',market:'US'};
const live={id:'cs_live',client_reference_id:id,metadata:{sportdna_product:product,sportdna_market:'US'},amount_total:999,currency:'usd',livemode:true,payment_status:'paid',status:'complete'};
const session={id:'cs_intl',client_reference_id:id,metadata:{sportdna_product:product,sportdna_market:'US'},amount_total:999,currency:'usd',livemode:false,payment_status:'paid',status:'complete'};

test('intl report is USD 9.99, card only, live only in the US',()=>{
 const p=catalog[product];
 assert.equal(p.amount,999);assert.equal(p.currency,'usd');assert.equal(p.provider,'stripe');
 assert.deepEqual(Object.keys(p.markets).sort(),['AU','CA','GB','US']);assert.deepEqual(p.liveMarkets,['US']);assert.equal(p.markets.US,'en/racket');
});
test('Brazilian products keep BRL and are untouched',()=>{
 for(const k of ['racket-report','surf-report','run-report','racket-comparator'])assert.equal(catalog[k].currency,undefined,k);
 assert.equal(stripeState({...session,metadata:{sportdna_product:'racket-report'},amount_total:1999,currency:'brl'},{...order,product:'racket-report',amount:1999,market:undefined}),'paid');
});
test('Stripe state checks amount, currency, product, market and mode',()=>{
 assert.equal(stripeState(session,order),'paid');
 assert.equal(stripeState(live,{...order,provider_id:'cs_live',mode:'live'}),'paid');
 assert.equal(stripeState({...live,metadata:{sportdna_product:product,sportdna_market:'GB'}},{...order,provider_id:'cs_live',mode:'live',market:'GB'}),'invalid');
 for(const patch of [{currency:'brl'},{currency:'gbp'},{amount_total:1999},{livemode:true},{metadata:{sportdna_product:product,sportdna_market:'BR'}},{metadata:{sportdna_product:product,sportdna_market:'GB'}},{metadata:{sportdna_product:product}},{metadata:{sportdna_product:'racket-report',sportdna_market:'US'}}])
  assert.equal(stripeState({...session,...patch},order),'invalid',JSON.stringify(patch));
 assert.equal(stripeState({...session,payment_intent:{latest_charge:{refunded:true}}},order),'revoked');
});
test('live mode refuses countries outside the beta before any database or provider work',async()=>{
 const e=env('live');let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw Error('no provider')};
 try{
  const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id,token,product,provider:'stripe',market:'GB'})}),e);
  assert.equal(r.status,409);assert.equal(calls,0);
  assert.equal(e.DB.raw.prepare('SELECT count(*) n FROM orders').get().n,0);
 }finally{globalThis.fetch=old}
});
test('intl refuses Pix, unknown country and promo codes',async()=>{
 const e=env();
 for(const body of [{provider:'mercadopago',market:'US',email:'a@b.co'},{provider:'stripe',market:'BR'},{provider:'stripe'},{provider:'stripe',market:'us'}]){
  const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id,token,product,...body})}),e);assert.equal(r.status,400,JSON.stringify(body));
 }
 const r=await worker.fetch(req('/promos/redeem',{method:'POST',body:JSON.stringify({id,token,product,codigo:'X',email:'a@b.co'})}),e);assert.equal(r.status,400);
});
test('sandbox order: USD price data, market metadata and return path per country',async()=>{
 const e=env();const old=globalThis.fetch;let sent=null;
 globalThis.fetch=async(url,init)=>{
  if(init.method==='GET')return new Response(JSON.stringify(session),{headers:{'Content-Type':'application/json'}});
  sent=new URLSearchParams(init.body);return new Response(JSON.stringify({...session,payment_status:'unpaid',status:'open',url:'https://checkout.stripe.com/c/pay/cs_intl'}),{headers:{'Content-Type':'application/json'}})};
 try{
  const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id,token,product,provider:'stripe',market:'GB'})}),e);
  assert.equal(r.status,200);const o=await r.json();
  assert.equal(o.currency,'USD');assert.equal(o.amount,999);assert.equal(o.market,'GB');assert.equal(o.mode,'test');
  assert.equal(sent.get('line_items[0][price_data][currency]'),'usd');assert.equal(sent.get('line_items[0][price_data][unit_amount]'),'999');
  assert.equal(sent.get('metadata[sportdna_market]'),'GB');assert.equal(sent.get('locale'),'en');
  assert.equal(sent.get('success_url'),origin+'/intl/en-gb/racket/?payment=return');
  assert.equal(e.DB.raw.prepare('SELECT market FROM orders WHERE id=?').get(id).market,'GB');
  // mesmo pedido com outro país é recusado
  const again=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id,token,product,provider:'stripe',market:'US'})}),e);assert.equal(again.status,409);
 }finally{globalThis.fetch=old}
});
test('webhook releases only the matching sandbox order; test sales never become measured purchases',async()=>{
 const e=env();
 e.DB.raw.prepare('INSERT INTO orders(id,token_hash,product,provider,amount,mode,market,provider_id,state,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,await digest(token),product,'stripe',999,'test','US','cs_intl','pending',Date.now());
 const old=globalThis.fetch;let current={...session,metadata:{sportdna_product:product,sportdna_market:'CA'}};
 globalThis.fetch=async()=>new Response(JSON.stringify(current),{headers:{'Content-Type':'application/json'}});
 const {hmac}=await import('../src/security.mjs');
 const deliver=async()=>{const body=JSON.stringify({id:'evt_intl',livemode:false,data:{object:{object:'checkout.session',id:'cs_intl'}}}),ts=Math.floor(Date.now()/1000),sig=await hmac('unit-secret',ts+'.'+body);return worker.fetch(req('/webhooks/stripe',{method:'POST',body,headers:{'stripe-signature':`t=${ts},v1=${sig}`}}),e)};
 try{
  assert.equal((await deliver()).status,200);
  assert.equal(e.DB.raw.prepare('SELECT state FROM orders WHERE id=?').get(id).state,'invalid'); // país diferente do pedido
  e.DB.raw.prepare("UPDATE orders SET state='pending' WHERE id=?").run(id);current=session;
  assert.equal((await deliver()).status,200);
  const row=e.DB.raw.prepare('SELECT * FROM orders WHERE id=?').get(id);assert.equal(row.state,'paid');
  const r=await worker.fetch(req('/orders/'+id,{headers:{Authorization:'Bearer '+token}}),e);const o=await r.json();
  assert.equal(o.state,'paid');assert.equal(o.currency,'USD');assert.equal(o.measurement,undefined);
  assert.equal(await saleMeasurement({...row}),null);
  // o mesmo pedido lido por um worker live não é aceito
  assert.equal((await worker.fetch(req('/orders/'+id,{headers:{Authorization:'Bearer '+token}}),{...e,PAYMENTS_MODE:'live'})).status,409);
 }finally{globalThis.fetch=old}
});

test('live US order: live key, USD price data, US metadata and /en/racket return path',async()=>{
 const e=env('live');const old=globalThis.fetch;let sent=null,auth=null;
 globalThis.fetch=async(url,init)=>{auth=new Headers(init.headers).get('Authorization');sent=new URLSearchParams(init.body);return new Response(JSON.stringify({...live,payment_status:'unpaid',status:'open',url:'https://checkout.stripe.com/c/pay/cs_live'}),{headers:{'Content-Type':'application/json'}})};
 try{
  const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id,token,product,provider:'stripe',market:'US'})}),e);
  assert.equal(r.status,200);const o=await r.json();assert.equal(o.mode,'live');assert.equal(o.currency,'USD');assert.equal(o.market,'US');
  assert.equal(auth,'Bearer rk_live_unit');assert.equal(sent.get('line_items[0][price_data][currency]'),'usd');assert.equal(sent.get('line_items[0][price_data][unit_amount]'),'999');
  assert.equal(sent.get('metadata[sportdna_market]'),'US');assert.equal(sent.get('success_url'),origin+'/en/racket/?payment=return');
 }finally{globalThis.fetch=old}
});
test('a paid live US order is measured in USD',async()=>{
 const m=await saleMeasurement({id,product,provider:'stripe',provider_id:'cs_live',amount:999,mode:'live',state:'paid'});
 assert.equal(m.currency,'USD');assert.equal(m.value,9.99);assert.equal(m.product,product);
});
