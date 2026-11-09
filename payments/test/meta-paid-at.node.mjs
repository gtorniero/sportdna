import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
import {mpPaidAt,stripePaidAt,verifiedPaidAt} from '../src/meta-paid-at.mjs';import {runMeta} from '../src/meta-adapter.mjs';import {capture,schema} from '../src/meta-capi.mjs';
const now=Date.now(),paidAt=now-300000;
const order={id:'00000000-0000-4000-8000-000000000011',provider:'mercadopago',provider_id:'ORD12345678901234',created_at:now-600000,mode:'live',state:'paid',amount:1999,product:'surf-report',checked_at:now};
const payment={external_reference:order.id,live_mode:true,currency_id:'BRL',transaction_amount:19.99,transaction_amount_refunded:0,payment_method_id:'pix',status:'approved',status_detail:'accredited',date_approved:new Date(paidAt).toISOString()};
const mp=p=>({paging:{total:1},results:[{...payment,...p}]});
const stripeOrder={...order,provider:'stripe',provider_id:'cs_live_ABC'};
const charge={paid:true,captured:true,status:'succeeded',amount:1999,amount_captured:1999,currency:'brl',livemode:true,created:Math.floor(paidAt/1000),payment_method_details:{type:'card'}};
const session={id:stripeOrder.provider_id,client_reference_id:order.id,metadata:{sportdna_product:order.product},amount_total:1999,currency:'brl',livemode:true,payment_status:'paid',status:'complete',payment_intent:{status:'succeeded',capture_method:'automatic_async',latest_charge:charge}};
test('provider timestamp does not become a new sale time after a status poll',()=>{
 assert.equal(mpPaidAt(mp(),order,now),paidAt);assert.equal(mpPaidAt(mp(),{...order,checked_at:now+10000},now+10000),paidAt);
 assert.equal(stripePaidAt(session,stripeOrder,now),Math.floor(paidAt/1000)*1000);
});
test('MP rejects pending, refund, wrong identity, partial search, ambiguous payment, missing or future date',()=>{
 for(const p of [{status:'pending'},{status:'refunded'},{transaction_amount_refunded:1},{external_reference:'other'},{live_mode:false},{currency_id:'USD'},{transaction_amount:1},{payment_method_id:'visa'},{date_approved:null},{date_approved:new Date(now+120000).toISOString()},{date_approved:new Date(order.created_at-120000).toISOString()}])assert.equal(mpPaidAt(mp(p),order,now),null);
 for(const v of [{paging:{total:2},results:[payment]},{paging:{total:2},results:[payment,payment]},{paging:{},results:[payment]}])assert.equal(mpPaidAt(v,order,now),null);
});
test('Stripe requires immediate captured live card payment; manual auth, refund, wrong amount do not send',()=>{
 for(const c of [{paid:false},{captured:false},{refunded:true},{disputed:true},{amount_captured:1},{currency:'usd'},{livemode:false},{created:0}])assert.equal(stripePaidAt({...session,payment_intent:{...session.payment_intent,latest_charge:{...charge,...c}}},stripeOrder,now),null);
 assert.equal(stripePaidAt({...session,payment_intent:{...session.payment_intent,capture_method:'manual'}},stripeOrder,now),null);
});
test('provider lookup only uses GET with its own live secret and fixed destination; failures have no time fallback',async()=>{
 let count=0;const env={PAYMENTS_MODE:'live',MP_LIVE_TOKEN:'FAKE_LIVE_SECRET',STRIPE_LIVE_KEY:'sk_live_FAKE'};
 assert.equal(await verifiedPaidAt(order,env,async(url,req)=>{count++;assert(url.startsWith('https://api.mercadopago.com/v1/payments/search?'));assert.equal(req.method,'GET');assert.equal(req.headers.Authorization,'Bearer FAKE_LIVE_SECRET');assert(!url.includes('SECRET'));return Response.json(mp());},now),paidAt);
 assert.equal(await verifiedPaidAt(stripeOrder,env,async(url,req)=>{count++;assert(url.startsWith('https://api.stripe.com/v1/checkout/sessions/cs_live_ABC?'));assert.equal(req.method,'GET');assert.equal(req.headers.Authorization,'Bearer sk_live_FAKE');return Response.json(session);},now),Math.floor(paidAt/1000)*1000);
 const noCall=()=>{throw Error('unexpected network')};for(const patch of [{mode:'test'},{state:'pending'},{provider:'promo',amount:0}])assert.equal(await verifiedPaidAt({...order,...patch},env,noCall,now),null);
 assert.equal(await verifiedPaidAt(order,env,async()=>new Response('',{status:503}),now),null);assert.equal(count,2);
});
function database(){const sql=new DatabaseSync(':memory:');return {prepare(query){let values=[];return {bind(...args){values=args;return this},async run(){const r=sql.prepare(query).run(...values);return {meta:{changes:Number(r.changes)}}},async first(){return sql.prepare(query).get(...values)||null},async all(){return {results:sql.prepare(query).all(...values)}}}},async batch(statements){return Promise.all(statements.map(s=>s.run()))}}}
test('real SQL outbox uses original provider time, stable ID, one delivery; no new timestamp from checked_at',async()=>{
 const db=database();await db.prepare('CREATE TABLE orders(id TEXT,amount INTEGER,mode TEXT,state TEXT,provider TEXT,provider_id TEXT,product TEXT,created_at INTEGER,checked_at INTEGER)').run();await db.prepare('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)').bind(order.id,order.amount,order.mode,order.state,order.provider,order.provider_id,order.product,order.created_at,order.checked_at).run();
 await schema(db);await capture(db,'sportdna',order.id,{marketing:true,version:1,at:order.created_at,subject:'00000000-0000-4000-8000-000000000099',fbp:'fb.1.1793980000000.123456'});await db.prepare('UPDATE btw_meta_consent SET created=?').bind(order.created_at).run();
 const env={DB:db,PAYMENTS_MODE:'live',MP_LIVE_TOKEN:'FAKE_LIVE_SECRET',META_CAPI_ENABLED:'true',META_CAPI_TOKEN:'FAKE_META_SECRET',META_GRAPH_VERSION:'v26.0'};let sent=0,read=0;
 const fetcher=async(url,req)=>{if(url.startsWith('https://api.mercadopago.com/')){read++;return Response.json(mp());}assert.equal(url,'https://graph.facebook.com/v26.0/1109514848506414/events');const event=JSON.parse(req.body).data[0];assert.equal(event.event_time,Math.floor(paidAt/1000));assert.equal(event.event_name,'Purchase');assert.equal(event.custom_data.value,19.99);sent++;return Response.json({events_received:1})};
 await runMeta(env,fetcher);await db.prepare('UPDATE orders SET checked_at=?').bind(now+10000).run();await runMeta(env,fetcher);assert.equal(sent,1);assert.equal(read,1);assert.equal((await db.prepare('SELECT state FROM btw_meta_outbox').first()).state,'sent');
});
