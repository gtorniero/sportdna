import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare,convertV4MiniflareOptions}=await import(process.env.MINIFLARE_TEST_MODULE||wranglerRequire.resolve('miniflare'));
const {build}=wranglerRequire('esbuild');
const now=Date.now(),paidAt=Math.floor((now-300000)/1000)*1000;
const uuid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const stripeOrder={id:uuid(11),provider:'stripe',provider_id:'cs_live_FIXTURE',created_at:now-600000,mode:'live',state:'paid',amount:1999,product:'racket-report'};
const mpOrder={...stripeOrder,id:uuid(12),provider:'mercadopago',provider_id:'ORDFIXTURE12345678'};
const stripeSession=()=>({id:stripeOrder.provider_id,client_reference_id:stripeOrder.id,metadata:{sportdna_product:stripeOrder.product},amount_total:1999,currency:'brl',livemode:true,payment_status:'paid',status:'complete',payment_intent:{status:'succeeded',capture_method:'automatic_async',latest_charge:{paid:true,captured:true,status:'succeeded',amount:1999,amount_captured:1999,currency:'brl',livemode:true,created:paidAt/1000,payment_method_details:{type:'card'}}}});
const mpPayment=()=>({paging:{total:1},results:[{external_reference:mpOrder.id,live_mode:true,currency_id:'BRL',transaction_amount:19.99,transaction_amount_refunded:0,payment_method_id:'pix',status:'approved',status_detail:'accredited',date_approved:new Date(paidAt).toISOString()}]});

test('Cloudflare runtime verifies providers without following redirects and drains only eligible purchases once',async t=>{
 const bundle=await build({stdin:{contents:`import {verifiedPaidAt} from './src/meta-paid-at.mjs';import {runMeta} from './src/meta-adapter.mjs';import {schema} from './src/meta-capi.mjs';export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path==='/schema'){await schema(env.DB);return new Response('ok')}if(path==='/verify')return Response.json({paidAt:await verifiedPaidAt(await request.json(),env)});if(path==='/run'){await runMeta(env);return new Response('ok')}return new Response(null,{status:404})}};`,resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,format:'esm',platform:'neutral',write:false});
 let phase='paid',providerReads=0;
 const delivered=[];
 const options={modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-11-02',host:'127.0.0.1',port:0,d1Databases:{DB:'meta-runtime-isolated-fixture'},bindings:{PAYMENTS_MODE:'live',STRIPE_LIVE_KEY:'sk_live_FAKE_LOCAL_ONLY',MP_LIVE_TOKEN:'FAKE_MP_LOCAL_ONLY',META_CAPI_ENABLED:'true',META_CAPI_TOKEN:'FAKE_META_LOCAL_ONLY',META_GRAPH_VERSION:'v26.0'},outboundService:async request=>{
  // Intercept EVERY outbound request. No payment provider or Meta network access.
  const url=new URL(request.url);
  if(url.origin==='https://api.stripe.com'||url.origin==='https://api.mercadopago.com'){
   providerReads++;assert.equal(request.method,'GET');
   const stripe=url.origin==='https://api.stripe.com';
   assert.equal(request.headers.get('Authorization'),stripe?'Bearer sk_live_FAKE_LOCAL_ONLY':'Bearer FAKE_MP_LOCAL_ONLY');
   if(stripe){assert.equal(url.pathname,'/v1/checkout/sessions/'+stripeOrder.provider_id);assert.equal(url.searchParams.get('expand[0]'),'payment_intent.latest_charge')}
   else{assert.equal(url.pathname,'/v1/payments/search');assert.equal(url.searchParams.get('external_reference'),mpOrder.id)}
   if(phase==='redirect')return new Response(JSON.stringify(stripe?stripeSession():mpPayment()),{status:302,headers:{Location:'https://redirect-target.invalid/forbidden'}});
   if(phase==='unavailable')return new Response(null,{status:503});
   const body=stripe?stripeSession():mpPayment();
   if(phase==='refunded'){if(stripe)body.payment_intent.latest_charge.refunded=true;else body.results[0].transaction_amount_refunded=19.99}
   return Response.json(body);
  }
  assert.equal(url.href,'https://graph.facebook.com/v26.0/1109514848506414/events','Unexpected outbound request, including redirected credentials, is forbidden');
  assert.equal(request.method,'POST');assert.equal(request.headers.get('Authorization'),'Bearer FAKE_META_LOCAL_ONLY');
  const body=await request.json();assert.equal(body.data.length,1);assert.equal(body.test_event_code,undefined);delivered.push(body.data[0]);
  return Response.json({events_received:1});
 }};
 const mf=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
 try{
  await mf.ready;
  const verify=async order=>(await (await mf.dispatchFetch('http://localhost/verify',{method:'POST',body:JSON.stringify(order)})).json()).paidAt;
  await t.test('Stripe and Pix GETs work in the real Workers Request/fetch implementation',async()=>{assert.equal(await verify(stripeOrder),paidAt);assert.equal(await verify(mpOrder),paidAt);assert.equal(providerReads,2)});
  await t.test('redirects, provider failures and refunds fail closed',async()=>{for(const kind of ['redirect','unavailable','refunded']){phase=kind;for(const order of [stripeOrder,mpOrder]){const before=providerReads;assert.equal(await verify(order),null);assert.equal(providerReads,before+1)}}assert.equal(delivered.length,0)});
  await t.test('test, pending and free purchases never query providers',async()=>{const before=providerReads;for(const patch of [{mode:'test'},{state:'pending'},{provider:'promo',amount:0}])assert.equal(await verify({...stripeOrder,...patch}),null);assert.equal(providerReads,before)});
  await mf.dispatchFetch('http://localhost/schema');
  const db=await mf.getD1Database('DB');
  await db.exec('CREATE TABLE orders(id TEXT PRIMARY KEY,amount INTEGER,mode TEXT,state TEXT,provider TEXT,provider_id TEXT,product TEXT,created_at INTEGER,checked_at INTEGER)');
  const rows=[stripeOrder,mpOrder,{...stripeOrder,id:uuid(13),mode:'test'},{...stripeOrder,id:uuid(14),provider:'promo',amount:0},{...stripeOrder,id:uuid(15),state:'pending'},{...stripeOrder,id:uuid(16)},{...stripeOrder,id:uuid(17)}];
  for(const order of rows){
   await db.prepare('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)').bind(order.id,order.amount,order.mode,order.state,order.provider,order.provider_id,order.product,order.created_at,now).run();
   if(order.id!==uuid(17))await db.prepare('INSERT INTO btw_meta_consent(id,brand,context,created,revoked) VALUES (?,?,?,?,?)').bind(order.id,'sportdna',JSON.stringify({marketing:true,version:1,at:order.created_at,subject:uuid(99),fbp:'fb.1.1793980000000.123456'}),order.created_at,order.id===uuid(16)?1:0).run();
  }
  const beforeOrders=(await db.prepare('SELECT * FROM orders ORDER BY id').all()).results;
  await t.test('provider redirect never creates an outbox row',async()=>{phase='redirect';const before=providerReads;await mf.dispatchFetch('http://localhost/run');assert.equal(providerReads,before+2);assert.equal((await db.prepare('SELECT COUNT(*) n FROM btw_meta_outbox').first()).n,0);assert.equal(delivered.length,0)});
  await t.test('eligible live purchases use original timestamps and stable IDs exactly once',async()=>{
   phase='paid';const before=providerReads;await mf.dispatchFetch('http://localhost/run');assert.equal(providerReads,before+2);assert.equal(delivered.length,2);
   for(const order of [stripeOrder,mpOrder]){const id=createHash('sha256').update('sportdna:purchase:'+order.id).digest('hex');const event=delivered.find(e=>e.event_id===id);assert(event);assert.equal(event.event_time,paidAt/1000);assert.equal(event.event_name,'Purchase');assert.deepEqual(event.custom_data,{value:19.99,currency:'BRL'})}
   const outbox=(await db.prepare('SELECT id,state,attempts,last_status,payload FROM btw_meta_outbox ORDER BY id').all()).results;
   assert.deepEqual(outbox.map(r=>r.id),[stripeOrder.id,mpOrder.id]);for(const r of outbox){assert.equal(r.state,'sent');assert.equal(r.attempts,1);assert.equal(r.last_status,200);assert.equal(r.payload,'{}')}
   await mf.dispatchFetch('http://localhost/run');assert.equal(providerReads,before+2);assert.equal(delivered.length,2);
   assert.deepEqual((await db.prepare('SELECT * FROM orders ORDER BY id').all()).results,beforeOrders,'Queue processing must not change prices, payment state or purchase records');
  });
 }finally{await mf.dispose()}
});
