import {verifiedPaidAt} from './meta-paid-at.mjs';
import {capture,enqueue,drain,revoke,schema} from './meta-capi.mjs';
export async function captureCheckout(env,id,meta){if(env.META_CAPI_ENABLED!=='true')return;try{await capture(env.DB,'sportdna',id,meta)}catch{console.warn('meta_consent_capture_failed')}}
export async function runMeta(env,fetcher=fetch){if(env.META_CAPI_ENABLED!=='true')return;try{
 await schema(env.DB);
 const rows=await env.DB.prepare("SELECT p.id,p.amount,p.mode,p.state,p.provider,p.provider_id,p.product,p.created_at FROM orders p JOIN btw_meta_consent c ON c.id=p.id WHERE c.brand='sportdna' AND c.revoked=0 AND p.state='paid' AND p.mode='live' AND p.provider IN ('stripe','mercadopago') AND p.amount>0"+" AND NOT EXISTS (SELECT 1 FROM btw_meta_outbox o WHERE o.id=p.id) ORDER BY c.created LIMIT 2").all();
 for(const r of rows.results||[]){const paidAt=await verifiedPaidAt(r,env,fetcher);if(paidAt!==null)await enqueue(env.DB,'sportdna',{id:r.id,paid:true,live:true,free:false,cents:r.amount,paidAt,emailMatching:env.META_EMAIL_MATCHING==='true'});}
 await env.DB.prepare("UPDATE btw_meta_outbox SET state='revoked',payload='{}' WHERE state='pending' AND id NOT IN (SELECT id FROM ("+"SELECT p.id,p.amount,p.mode,p.state,p.provider,p.provider_id,p.product,p.created_at FROM orders p JOIN btw_meta_consent c ON c.id=p.id WHERE c.brand='sportdna' AND c.revoked=0 AND p.state='paid' AND p.mode='live' AND p.provider IN ('stripe','mercadopago') AND p.amount>0"+"))").run();
 await drain(env.DB,env,'sportdna',fetcher);
}catch{console.warn('meta_delivery_check_failed')}}
export async function metaRoute(request,env){
 if(request.method!=='POST'||new URL(request.url).pathname!=='/meta/revoke')return null;
 const origin=request.headers.get('Origin');if(!["https://sportdna.com.br", "https://www.sportdna.com.br"].includes(origin))return new Response(null,{status:403});
 if(Number(request.headers.get('Content-Length')||0)>2048)return new Response(null,{status:413});
 try{const text=await request.text();if(text.length>2048)return new Response(null,{status:413});const body=JSON.parse(text);await revoke(env.DB,'sportdna',body.subject);return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}})}catch{return new Response(null,{status:400})}
}
