import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {catalog,hmac,verifyMP,stripeState,mpState,digest} from '../src/security.mjs';
import worker from '../src/worker.mjs';
const order={id:'81f87685-15e9-42b9-8074-6f13b94597ab',product:'racket-report',provider_id:'cs_unit',amount:1999,mode:'test'};
const session={id:'cs_unit',client_reference_id:order.id,metadata:{sportdna_product:order.product},amount_total:1999,currency:'brl',livemode:false,payment_status:'paid',status:'complete'};
const mpOrder={...order,provider_id:'ORD123'};
const pix={id:'ORD123',external_reference:order.id,total_amount:'19.99',country_code:'BRA',status:'processed',status_detail:'accredited',transactions:{payments:[{amount:'19.99',status:'processed',status_detail:'accredited',payment_method:{id:'pix'}}]}};
test('preserves the four existing prices in integer cents',()=>assert.deepEqual(Object.values(catalog).map(x=>x.amount),[1999,1999,999,499]));
test('Stripe requires paid status and exact order/product/amount/currency/mode',()=>{
 assert.equal(stripeState(session,order),'paid');
 for(const patch of [{payment_status:'unpaid'},{status:'open'},{amount_total:999},{currency:'usd'},{livemode:true},{id:'other'},{client_reference_id:'other'},{metadata:{sportdna_product:'run-report'}}]) assert.notEqual(stripeState({...session,...patch},order),'paid');
 for(const patch of [{refunded:true},{amount_refunded:100},{disputed:true}]) assert.equal(stripeState({...session,payment_intent:{latest_charge:patch}},order),'revoked');
});
test('Pix requires one accredited payment, exact reference, amount and country',()=>{
 assert.equal(mpState(pix,mpOrder),'paid');
 for(const patch of [{total_amount:'9.99'},{country_code:'ARG'},{live_mode:true},{external_reference:'other'},{id:'other'},{status:'action_required'},{status_detail:'waiting_transfer'},{transactions:{payments:[]}}]) assert.notEqual(mpState({...pix,...patch},mpOrder),'paid');
 const refunded=structuredClone(pix);refunded.transactions.payments[0].status='refunded';assert.equal(mpState(refunded,mpOrder),'revoked');
});
test('Mercado Pago rejects forgery, altered ids and stale notifications',async()=>{
 const now=Date.now(),ts=String(now),signature=await hmac('unit-secret',`id:ord123;request-id:r-1;ts:${ts};`);
 const request=(id='ORD123',sig=signature)=>new Request('https://api.example/webhooks/mercadopago?data.id='+id,{headers:{'x-request-id':'r-1','x-signature':`ts=${ts},v1=${sig}`}});
 assert.equal(await verifyMP(request(),'unit-secret',now),true);
 assert.equal(await verifyMP(request('ORD124'),'unit-secret',now),false);
 assert.equal(await verifyMP(request('ORD123','0'.repeat(64)),'unit-secret',now),false);
 assert.equal(await verifyMP(request(),'unit-secret',now+300001),false);
 assert.equal(await verifyMP(request(),'',now),false);
});
function database(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001.sql',import.meta.url),'utf8'));
 return {prepare(sql){return {bind(...params){return {async first(){return db.prepare(sql).get(...params)},async run(){return db.prepare(sql).run(...params)}}}}}};
}
const origin='https://sportdna.com.br';
const req=(path,init={})=>new Request('https://api.example'+path,{...init,headers:{Origin:origin,...init.headers}});
const env=()=>({DB:database(),SITE_ORIGIN:origin,PAYMENTS_MODE:'test',RATE_SECRET:'unit-rate',STRIPE_KEY:['rk','test','unit'].join('_'),STRIPE_WEBHOOK_SECRET:'unit-secret'});
test('off mode, live mode and missing secrets fail closed without provider calls',async()=>{
 for(const mode of ['off','live','test']){
  const e={SITE_ORIGIN:origin,PAYMENTS_MODE:mode};const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id:order.id,token:'a'.repeat(64),product:order.product,provider:'stripe'})}),e);assert.equal(r.status,503);
 }
});
test('cross-origin requests, unknown product and unauthorized status rejected',async()=>{
 const e=env();assert.equal((await worker.fetch(new Request('https://api.example/orders',{headers:{Origin:'https://other.example'}}),e)).status,403);
 assert.equal((await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({id:order.id,token:'a'.repeat(64),product:'free',provider:'stripe'})}),e)).status,400);
 assert.equal((await worker.fetch(req('/orders/'+order.id),e)).status,401);
 assert.equal((await worker.fetch(req('/orders/'+order.id,{headers:{Authorization:'Bearer '+'a'.repeat(64)}}),e)).status,404);
});
test('status reconciles the provider, scoped token required and refund revokes access',async()=>{
 const e=env(),token='a'.repeat(64);
 await e.DB.prepare('INSERT INTO orders(id,token_hash,product,provider,amount,mode,provider_id,state,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(order.id,await digest(token),order.product,'stripe',1999,'test',order.provider_id,'pending',Date.now()).run();
 const oldFetch=globalThis.fetch;let current=session,calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify(current),{status:200,headers:{'Content-Type':'application/json'}})};
 try{
  const r=await worker.fetch(req('/orders/'+order.id,{headers:{Authorization:'Bearer '+token}}),e);assert.equal(r.status,200);assert.equal((await r.json()).state,'paid');assert.equal(calls,1);
  assert.equal((await worker.fetch(req('/orders/'+order.id,{headers:{Authorization:'Bearer '+'b'.repeat(64)}}),e)).status,404);
  await e.DB.prepare('UPDATE orders SET checked_at=? WHERE id=?').bind(0,order.id).run();
  current={...session,payment_intent:{latest_charge:{refunded:true}}};
  assert.equal((await (await worker.fetch(req('/orders/'+order.id,{headers:{Authorization:'Bearer '+token}}),e)).json()).state,'revoked');
 }finally{globalThis.fetch=oldFetch}
});
test('unsigned and live-mode Stripe webhook never fulfill an order',async()=>{
 const e=env();assert.equal((await worker.fetch(req('/webhooks/stripe',{method:'POST',body:'{}'}),e)).status,401);
 const body=JSON.stringify({id:'evt_unit',livemode:true,data:{object:{object:'checkout.session',id:order.provider_id}}}),ts=Math.floor(Date.now()/1000),sig=await hmac('unit-secret',ts+'.'+body);
 const r=await worker.fetch(req('/webhooks/stripe',{method:'POST',body,headers:{'stripe-signature':`t=${ts},v1=${sig}`}}),e);assert.equal(r.status,400);
});
test('creation uses server catalog, provider idempotency and does not transmit quiz answers',async()=>{
 const e=env(),body={id:order.id,token:'a'.repeat(64),product:order.product,provider:'stripe',amount:1,answers:{private:'not-for-provider'}};
 const oldFetch=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,init)=>{calls++;if(init.method==='GET')return new Response(JSON.stringify(session),{headers:{'Content-Type':'application/json'}});assert.match(String(url),/checkout\/sessions/);assert.ok(String(init.body).includes(catalog[order.product].stripeTestPrice));assert.ok(!String(init.body).includes('not-for-provider'));assert.equal(new Headers(init.headers).get('Idempotency-Key'),order.id);return new Response(JSON.stringify({id:'cs_unit',livemode:false,url:'https://checkout.stripe.com/c/pay/unit'}),{headers:{'Content-Type':'application/json'}})};
 try{
  for(let i=0;i<2;i++){const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify(body)}),e);assert.equal(r.status,200);assert.equal((await r.json()).amount,1999)}
  assert.equal(calls,2); // second call only reconciles the existing session; never creates a second one
  const r=await worker.fetch(req('/orders',{method:'POST',body:JSON.stringify({...body,product:'run-report'})}),e);assert.equal(r.status,409);
 }finally{globalThis.fetch=oldFetch}
});
test('signed duplicate Stripe notifications reconcile the stored order only',async()=>{
 const e=env(),token='a'.repeat(64);
 await e.DB.prepare('INSERT INTO orders(id,token_hash,product,provider,amount,mode,provider_id,state,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(order.id,await digest(token),order.product,'stripe',1999,'test',order.provider_id,'pending',Date.now()).run();
 const oldFetch=globalThis.fetch;let current={...session,payment_status:'unpaid'};
 globalThis.fetch=async()=>new Response(JSON.stringify(current),{headers:{'Content-Type':'application/json'}});
 async function deliver(){const body=JSON.stringify({id:'evt_unit',livemode:false,data:{object:{object:'checkout.session',id:order.provider_id}}}),ts=Math.floor(Date.now()/1000),sig=await hmac('unit-secret',ts+'.'+body);return worker.fetch(req('/webhooks/stripe',{method:'POST',body,headers:{'stripe-signature':`t=${ts},v1=${sig}`}}),e)}
 try{
  assert.equal((await deliver()).status,200);assert.equal((await e.DB.prepare('SELECT state FROM orders WHERE id=?').bind(order.id).first()).state,'pending');
  current=session;for(let i=0;i<2;i++)assert.equal((await deliver()).status,200);
  assert.equal((await e.DB.prepare('SELECT state FROM orders WHERE id=?').bind(order.id).first()).state,'paid');
 }finally{globalThis.fetch=oldFetch}
});
