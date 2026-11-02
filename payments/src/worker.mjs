import StripeClient from 'stripe';
import {catalog,digest,verifyMP,stripeState,mpState} from './security.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const tokenFormat=/^[0-9a-f]{64}$/;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status})};
function ready(env,provider) {
 // This first release deliberately cannot charge real money.
 if(env.PAYMENTS_MODE!=='test') fail(503,'Pagamentos ainda não habilitados.');
 if(!env.DB||!env.RATE_SECRET) fail(503,'Configuração de pagamentos incompleta.');
 if(provider==='stripe'&&(!/^[sr]k_test_/.test(env.STRIPE_KEY||'')||!env.STRIPE_WEBHOOK_SECRET)) fail(503,'Stripe de teste indisponível.');
 if(provider==='mercadopago'&&(!env.MP_TOKEN||env.MP_TEST_CREDENTIALS_CONFIRMED!=='true'||!env.MP_WEBHOOK_SECRET)) fail(503,'Pix de teste indisponível.');
}
const stripe=env=>new StripeClient(env.STRIPE_KEY,{apiVersion:'2026-09-30.endive',httpClient:StripeClient.createFetchHttpClient(),maxNetworkRetries:1});
async function mp(env,path,body,id) {
 const r=await fetch('https://api.mercadopago.com/v1/orders'+path,{method:body?'POST':'GET',
  headers:{Authorization:'Bearer '+env.MP_TOKEN,'Content-Type':'application/json',...(id?{'X-Idempotency-Key':id}:{})},
  body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
 if(!r.ok) fail(502,'O Mercado Pago não confirmou a operação. Tente consultar novamente.');
 return r.json();
}
async function readJson(request) {
 if(Number(request.headers.get('content-length')||0)>4096) fail(413,'Solicitação muito grande.');
 const body=await request.text();if(body.length>4096) fail(413,'Solicitação muito grande.');
 try{return JSON.parse(body)}catch{fail(400,'Solicitação inválida.')}
}
async function rate(request,env) {
 const bucket=Math.floor(Date.now()/600000);
 const id=bucket+':'+await digest(env.RATE_SECRET+':'+(request.headers.get('cf-connecting-ip')||'local'));
 const r=await env.DB.prepare('INSERT INTO rate_limits(id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id).first();
 if(r.count>10) fail(429,'Aguarde alguns minutos antes de tentar novamente.');
 // Buckets contain salted IP hashes, not the original addresses.
 await env.DB.prepare('DELETE FROM rate_limits WHERE id < ?').bind((bucket-144)+':').run();
}
function publicOrder(o) {
 return {id:o.id,product:o.product,provider:o.provider,amount:o.amount,currency:'BRL',mode:o.mode,state:o.state,
  checkoutUrl:o.checkout_url||null,pixCode:o.pix_code||null,pixImage:o.pix_image||null};
}
async function refresh(o,env,force=false) {
 if(!o.provider_id) return o;
 if(!force&&Date.now()-o.checked_at<5000) return o;
 const value=o.provider==='stripe'?await stripe(env).checkout.sessions.retrieve(o.provider_id,{expand:['payment_intent.latest_charge']}):await mp(env,'/'+encodeURIComponent(o.provider_id));
 const state=o.provider==='stripe'?stripeState(value,o):mpState(value,o);
 // Always fail closed; a stale paid flag must not survive a mismatched provider response.
 await env.DB.prepare('UPDATE orders SET state=?,checked_at=? WHERE id=?').bind(state,Date.now(),o.id).run();
 return {...o,state};
}
async function create(request,env) {
 const b=await readJson(request);
 const product=catalog[b.product];if(!product||!['stripe','mercadopago'].includes(b.provider)||!uuid.test(b.id)||!tokenFormat.test(b.token)) fail(400,'Produto ou pedido inválido.');
 ready(env,b.provider);await rate(request,env);
 if(b.provider==='mercadopago'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email||'')) fail(400,'Informe seu e-mail para o Pix.');
 const hash=await digest(b.token);
 let existing=await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(b.id).first();
 if(existing) {
  if(existing.token_hash!==hash||existing.product!==b.product||existing.provider!==b.provider) fail(409,'Pedido já utilizado.');
  if(existing.provider_id) return publicOrder(await refresh(existing,env));
 } else {
  await env.DB.prepare('INSERT INTO orders(id,token_hash,product,provider,amount,mode,created_at) VALUES (?,?,?,?,?,?,?)').bind(b.id,hash,b.product,b.provider,product.amount,'test',Date.now()).run();
 }
 let id,url=null,code=null,image=null;
 if(b.provider==='stripe') {
  const s=await stripe(env).checkout.sessions.create({mode:'payment',client_reference_id:b.id,
   metadata:{sportdna_product:b.product},integration_identifier:'sportdna_reports_kpvndwqa',
   line_items:[{quantity:1,price:product.stripeTestPrice}],
   success_url:`${env.SITE_ORIGIN}/${product.path}/?payment=return`,cancel_url:`${env.SITE_ORIGIN}/${product.path}/?payment=cancel`},
   {idempotencyKey:b.id});
  if(s.livemode!==false||!s.url?.startsWith('https://checkout.stripe.com/')) fail(502,'Checkout de teste inválido.');
  id=s.id;url=s.url;
 } else {
  const amount=(product.amount/100).toFixed(2);
  const s=await mp(env,'',{type:'online',processing_mode:'automatic',total_amount:amount,external_reference:b.id,
   payer:{email:b.email,first_name:'APRO'},transactions:{payments:[{amount,payment_method:{id:'pix',type:'bank_transfer'}}]}},b.id);
  if(s.live_mode===true) fail(502,'Ambiente de teste inválido.');
  id=s.id;const method=s.transactions?.payments?.[0]?.payment_method;
  code=method?.qr_code||null;image=method?.qr_code_base64||null;
 }
 if(typeof id!=='string'||id.length>128) fail(502,'Pedido não confirmado pelo provedor.');
 await env.DB.prepare('UPDATE orders SET provider_id=?,state=?,checkout_url=?,pix_code=?,pix_image=? WHERE id=?').bind(id,'pending',url,code,image,b.id).run();
 return publicOrder(await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(b.id).first());
}
async function status(request,env,id) {
 if(!uuid.test(id)) fail(404,'Pedido não encontrado.');
 const t=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 if(!tokenFormat.test(t)) fail(401,'Acesso inválido.');
 const o=await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first();
 if(!o||o.token_hash!==await digest(t)) fail(404,'Pedido não encontrado.');
 ready(env,o.provider);return publicOrder(await refresh(o,env));
}
async function webhook(request,env,provider) {
 ready(env,provider);
 let id;
 if(provider==='stripe') {
  let event;try{event=await stripe(env).webhooks.constructEventAsync(await request.text(),request.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET,300,StripeClient.createSubtleCryptoProvider())}catch{fail(401,'Assinatura inválida.')}
  if(event.livemode!==false) fail(400,'Ambiente inválido.');
  const object=event.data.object;
  if(object.object==='checkout.session') id=object.id;
  else if(['charge.refunded','charge.dispute.created','charge.dispute.closed'].includes(event.type)) {
   const pi=object.payment_intent;
   if(typeof pi!=='string') return {received:true};
   const sessions=await stripe(env).checkout.sessions.list({payment_intent:pi,limit:1});id=sessions.data[0]?.id;
  } else return {received:true};
 } else {
  if(!await verifyMP(request,env.MP_WEBHOOK_SECRET)) fail(401,'Assinatura inválida.');
  const body=await readJson(request),queryId=new URL(request.url).searchParams.get('data.id');
  if(body.type!=='order'||String(body.data?.id).toLowerCase()!==queryId.toLowerCase()) fail(400,'Notificação inválida.');
  id=String(body.data.id);
 }
 if(id) {
  const o=await env.DB.prepare('SELECT * FROM orders WHERE provider=? AND provider_id=?').bind(provider,id).first();
  if(o) await refresh(o,env,true);
 }
 return {received:true};
}
export default {async fetch(request,env) {
 const origin=request.headers.get('Origin'),url=new URL(request.url);
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 if(origin===env.SITE_ORIGIN) headers['Access-Control-Allow-Origin']=origin;
 try {
  const isHook=url.pathname.startsWith('/webhooks/');
  if(!isHook&&origin!==env.SITE_ORIGIN) fail(403,'Origem não permitida.');
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'}});
  let value;
  if(request.method==='POST'&&url.pathname==='/orders') value=await create(request,env);
  else if(request.method==='GET'&&url.pathname.startsWith('/orders/')) value=await status(request,env,url.pathname.slice(8));
  else if(request.method==='POST'&&url.pathname==='/webhooks/stripe') value=await webhook(request,env,'stripe');
  else if(request.method==='POST'&&url.pathname==='/webhooks/mercadopago') value=await webhook(request,env,'mercadopago');
  else fail(404,'Rota não encontrada.');
  return new Response(JSON.stringify(value),{headers});
 }catch(e){return new Response(JSON.stringify({error:e.status?e.message:'Não foi possível confirmar o pagamento. Consulte novamente.'}),{status:e.status||503,headers})}
}};
