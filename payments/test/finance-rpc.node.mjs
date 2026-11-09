import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare,Request:MiniflareRequest}=await import(process.env.MINIFLARE_TEST_MODULE || wranglerRequire.resolve('miniflare'));

const qa='5de99ca1-bf2a-4fa6-a46f-29ece5358634',pending='pending-fixture';
let providerReads=0;
// Local runtime supports 2026-05-22; production retains its existing 2026-11-02 date.
const mf=new Miniflare({workers:[
 {name:'caller',modules:true,compatibilityDate:'2026-05-22',serviceBindings:{SPORT_FINANCE:{name:'sport',entrypoint:'PaymentInsights'}},script:`export default {async fetch(request,env){try {const path=new URL(request.url).pathname;const data=path==='/args'?await env.SPORT_FINANCE.read({product:'quiddo'}):await env.SPORT_FINANCE.read();return Response.json(data);} catch {return Response.json({error:'rejected'}, {status:400});}}};`},
 {name:'sport',modules:true,compatibilityDate:'2026-05-22',script:readFileSync(new URL('../dist/finance-entrypoint.js',import.meta.url),'utf8'),d1Databases:{DB:'finance-fixture'},bindings:{PAYMENTS_MODE:'live',SITE_ORIGIN:'https://sportdna.example',MP_LIVE_TOKEN:'sport-live-fixture',MP_TOKEN:'test-must-not-be-used'},outboundService:async(request)=>{
   providerReads++;assert.equal(request.method,'GET');assert.equal(request.headers.get('Authorization'),'Bearer sport-live-fixture');
   const url=new URL(request.url);assert.equal(url.origin,'https://api.mercadopago.com');
   const isPending=url.pathname.includes('PENDING')||url.searchParams.get('external_reference')===pending;
   if(url.pathname.startsWith('/v1/orders/'))return Response.json({id:isPending?'ORDPENDING123456789':'ORDPAID123456789',external_reference:isPending?pending:qa,total_amount:'19.99',total_paid_amount:'19.99',currency:'BRL',live_mode:true,status:isPending?'created':'processed',status_detail:isPending?'pending':'accredited',transactions:{payments:[{status:isPending?'action_required':'processed',status_detail:isPending?'waiting_transfer':'accredited'}]}});
   assert.equal(url.pathname,'/v1/payments/search');
   return Response.json({paging:{total:isPending?0:1},results:isPending?[]:[{id:999,external_reference:qa,currency_id:'BRL',live_mode:true,transaction_amount:19.99,status:'approved',date_approved:'2026-11-06T15:14:00Z',transaction_amount_refunded:0,transaction_details:{net_received_amount:19.79},payer:{email:'never-return@example.com'}}]});
 }}
]});
try{
 const db=await mf.getD1Database('DB','sport');
 await db.exec('CREATE TABLE orders(id TEXT PRIMARY KEY,product TEXT,provider TEXT,amount INTEGER,mode TEXT,provider_id TEXT,state TEXT,created_at INTEGER); CREATE TABLE report_emails(order_id TEXT PRIMARY KEY,attempted_at INTEGER); CREATE TABLE promo_order_emails(order_id TEXT PRIMARY KEY,grant_id TEXT);');
 for(const [id,provider,amount,mode,providerId,state] of [[qa,'mercadopago',1999,'live','ORDPAID123456789','paid'],[pending,'mercadopago',1999,'live','ORDPENDING123456789','pending'],['test-fixture','mercadopago',1999,'test','ORDTEST123456789','paid'],['free-fixture','promo',0,'live',null,'paid']])await db.prepare('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?)').bind(id,'surf-report',provider,amount,mode,providerId,state,Date.parse('2026-11-06T15:00:00Z')).run();
 await db.prepare('INSERT INTO promo_order_emails VALUES (?,?)').bind('free-fixture','grant-fixture').run();
 const before=await db.prepare('SELECT * FROM orders').all();
 const response=await mf.dispatchFetch('http://localhost/');assert.equal(response.status,200);const data=await response.json();
 assert.equal(data.product,'SPORT DNA');assert.equal(data.verified_payments.orders,1);assert.equal(data.verified_payments.gross_cents,1999);assert.equal(data.verified_payments.by_classification.founder_qa.orders,1);assert.equal(data.verified_payments.with_exact_paid_at,1);
 assert.equal(data.free_access.orders,1);assert.equal(data.technical.orders,1);assert.equal(data.provider_checks.find(x=>x.status==='order_not_settled').count,1);assert.equal(providerReads,4);
 assert.equal(data.delivery.confirmed_deliveries,null);assert.equal(data.verified_payments.fees_cents,null);
 const report=JSON.stringify(data);for(const privateValue of [qa,'sport-live-fixture','test-must-not-be-used','never-return@example.com','grant-fixture'])assert(!report.includes(privateValue));
 assert.deepEqual((await db.prepare('SELECT * FROM orders').all()).results,before.results,'Reporting must not change order/payment state');
 assert.equal((await mf.dispatchFetch('http://localhost/args')).status,400);
 const publicWorker=await mf.getWorker('sport');
 assert.equal((await publicWorker.fetch('https://sportdna.example/api/btw/payments')).status,403);
 assert([403,404].includes((await publicWorker.fetch(new MiniflareRequest('https://sportdna.example/api/btw/payments',{headers:{Origin:'https://sportdna.example'}}))).status),'The private report must never be reachable over HTTP, including from the product origin');
 console.log('SPORT private RPC passed: own live token, SELECT/GET only, paid/pending separation, no data writes, QA/free/test classification, no identities/secrets in response, public route inaccessible.');
}finally{await mf.dispose();}
