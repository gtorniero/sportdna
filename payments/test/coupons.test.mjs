// Cupom de desconto (ARBO50: 50% no relatório RACKET DNA). Banco em memória; provedores simulados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {digest,stripeState} from '../src/security.mjs';
import {saleMeasurement} from '../src/measurement.mjs';
import worker from '../src/worker.mjs';
const origin='https://sportdna.com.br';
function database(){
 const db=new DatabaseSync(':memory:');for(const m of ['0001.sql','0002_market.sql','0003_discounts.sql'])db.exec(readFileSync(new URL('../migrations/'+m,import.meta.url),'utf8'));
 return {raw:db,prepare(sql){return {bind(...p){return {async first(){return db.prepare(sql).get(...p)},async run(){return db.prepare(sql).run(...p)}}}}}};
}
async function env(mode='live'){
 const DB=database();
 DB.raw.prepare('INSERT INTO discount_codes(hash,code,percent,products,active,expires,created) VALUES (?,?,?,?,?,?,?)').run(await digest('sportdna-coupon:ARBO50'),'ARBO50',50,'["racket-report"]',1,null,Date.now());
 DB.raw.prepare('INSERT INTO discount_codes(hash,code,percent,products,active,expires,created) VALUES (?,?,?,?,?,?,?)').run(await digest('sportdna-coupon:VELHO10'),'VELHO10',10,'["racket-report"]',0,null,Date.now());
 return {DB,SITE_ORIGIN:origin,PAYMENTS_MODE:mode,RATE_SECRET:'r',STRIPE_KEY:['rk','test','unit'].join('_'),STRIPE_WEBHOOK_SECRET:'w',STRIPE_LIVE_KEY:'rk_live_unit',STRIPE_LIVE_WEBHOOK_SECRET:'lw',MP_LIVE_TOKEN:'mp-live',MP_LIVE_WEBHOOK_SECRET:'mpw'};
}
const req=(path,body)=>new Request('https://api.example'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
const id='9a1f7685-15e9-42b9-8074-6f13b94597ab',token='f'.repeat(64);
test('check: ARBO50 gives 50% on the RACKET DNA report (R$ 19,99 → R$ 9,99), case-insensitive',async()=>{
 const e=await env();
 const r=await worker.fetch(req('/coupons/check',{product:'racket-report',coupon:' arbo50 '}),e);assert.equal(r.status,200);
 assert.deepEqual(await r.json(),{product:'racket-report',code:'ARBO50',percent:50,amount:999,currency:'BRL'});
});
test('check: unknown, inactive, other product and English product are refused',async()=>{
 const e=await env();
 for(const body of [{product:'racket-report',coupon:'NAOEXISTE'},{product:'racket-report',coupon:'VELHO10'},{product:'surf-report',coupon:'ARBO50'},{product:'racket-report-intl',coupon:'ARBO50'},{product:'racket-report',coupon:'<script>'}]){
  const r=await worker.fetch(req('/coupons/check',body),e);assert.equal(r.status,404,JSON.stringify(body));
 }
});
test('card order with coupon: Stripe charges R$ 9,99 and the order keeps 50%',async()=>{
 const e=await env();const old=globalThis.fetch;let sent;
 globalThis.fetch=async(url,init)=>{sent=new URLSearchParams(init.body);return new Response(JSON.stringify({id:'cs_c',livemode:true,url:'https://checkout.stripe.com/c/pay/cs_c'}),{headers:{'Content-Type':'application/json'}})};
 try{
  const r=await worker.fetch(req('/orders',{id,token,product:'racket-report',provider:'stripe',coupon:'arbo50'}),e);assert.equal(r.status,200);const o=await r.json();
  assert.equal(o.amount,999);assert.equal(o.discount,50);assert.equal(sent.get('line_items[0][price_data][unit_amount]'),'999');assert.equal(sent.get('line_items[0][price_data][currency]'),'brl');
  const row=e.DB.raw.prepare('SELECT amount,discount FROM orders WHERE id=?').get(id);assert.deepEqual({...row},{amount:999,discount:50});
  // a sessão paga só vale com o valor com desconto
  const s={id:'cs_c',client_reference_id:id,metadata:{sportdna_product:'racket-report'},amount_total:999,currency:'brl',livemode:true,payment_status:'paid',status:'complete'};
  const ord={id,product:'racket-report',provider_id:'cs_c',amount:999,mode:'live'};
  assert.equal(stripeState(s,ord),'paid');assert.equal(stripeState({...s,amount_total:1999},ord),'invalid');assert.equal(stripeState({...s,amount_total:500},ord),'invalid');
  // mesmo pedido sem cupom: conflito, não vira preço cheio às escondidas
  assert.equal((await worker.fetch(req('/orders',{id,token,product:'racket-report',provider:'stripe'}),e)).status,409);
 }finally{globalThis.fetch=old}
});
test('Pix order with coupon: Mercado Pago gets 9.99',async()=>{
 const e=await env();const old=globalThis.fetch;let body;
 globalThis.fetch=async(url,init)=>{body=JSON.parse(init.body);return new Response(JSON.stringify({id:'ORD1234567890',live_mode:true,transactions:{payments:[{payment_method:{qr_code:'x'}}]}}),{headers:{'Content-Type':'application/json'}})};
 try{
  const r=await worker.fetch(req('/orders',{id,token,product:'racket-report',provider:'mercadopago',email:'a@b.co',coupon:'ARBO50'}),e);assert.equal(r.status,200);
  assert.equal(body.total_amount,'9.99');assert.equal(body.transactions.payments[0].amount,'9.99');
 }finally{globalThis.fetch=old}
});
test('invalid coupon on order creation fails before any provider call; no coupon keeps the full price',async()=>{
 const e=await env();const old=globalThis.fetch;let calls=0,sent;
 globalThis.fetch=async(url,init)=>{calls++;sent=new URLSearchParams(init.body);return new Response(JSON.stringify({id:'cs_f',livemode:true,url:'https://checkout.stripe.com/c/pay/cs_f'}),{headers:{'Content-Type':'application/json'}})};
 try{
  assert.equal((await worker.fetch(req('/orders',{id,token,product:'racket-report',provider:'stripe',coupon:'NAOEXISTE'}),e)).status,404);assert.equal(calls,0);
  const r=await worker.fetch(req('/orders',{id,token,product:'racket-report',provider:'stripe'}),e);assert.equal((await r.json()).amount,1999);assert.equal(sent.get('line_items[0][price_data][unit_amount]'),'1999');
 }finally{globalThis.fetch=old}
});
test('sale measurement uses the amount actually paid',async()=>{
 const m=await saleMeasurement({id,product:'racket-report',provider:'stripe',provider_id:'cs_c',amount:999,discount:50,mode:'live',state:'paid'});
 assert.equal(m.value,9.99);assert.equal(m.currency,'BRL');
 for(const o of [{amount:2999},{amount:999},{amount:500,discount:50},{amount:999,discount:95}])assert.equal(await saleMeasurement({id,product:'racket-report',provider:'stripe',provider_id:'cs_c',mode:'live',state:'paid',...o}),null,JSON.stringify(o));
});
