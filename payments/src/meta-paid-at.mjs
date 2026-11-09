import {stripeState} from './security.mjs';
// Read-only provider verification. checked_at is a polling timestamp, never a purchase time.
function validTime(value,order,now){const t=typeof value==='number'?value:Date.parse(value);return Number.isFinite(t)&&t>=order.created_at-60000&&t<=now+60000?t:null}
export function mpPaidAt(body,order,now=Date.now()){
 const data=Array.isArray(body)&&body.length===1?body[0]:body;
 if(!Array.isArray(data?.results)||!Number.isSafeInteger(data.paging?.total)||data.paging.total!==data.results.length||data.results.length>30)return null;
 const paid=data.results.filter(p=>['approved','refunded','charged_back'].includes(p.status));
 if(paid.length!==1)return null;const p=paid[0];
 if(p.status!=='approved'||p.status_detail!=='accredited'||p.external_reference!==order.id||p.live_mode!==true||p.currency_id!=='BRL'||Math.round(Number(p.transaction_amount)*100)!==order.amount||p.payment_method_id!=='pix'||Number(p.transaction_amount_refunded||0)!==0)return null;
 return validTime(p.date_approved,order,now);
}
export function stripePaidAt(session,order,now=Date.now()){
 if(stripeState(session,order)!=='paid')return null;
 const pi=session.payment_intent,c=pi?.latest_charge;
 // Only the existing immediate card capture flow has a charge-created purchase time.
 if(!['automatic','automatic_async'].includes(pi?.capture_method)||pi.status!=='succeeded'||!c||typeof c!=='object'||c.paid!==true||c.captured!==true||c.status!=='succeeded'||c.amount!==order.amount||c.amount_captured!==order.amount||c.currency!=='brl'||c.livemode!==true||c.payment_method_details?.type!=='card'||!Number.isSafeInteger(c.created))return null;
 return validTime(c.created*1000,order,now);
}
export async function verifiedPaidAt(order,env,fetcher=fetch,now=Date.now()){
 if(env.PAYMENTS_MODE!=='live'||order.mode!=='live'||order.state!=='paid'||!Number.isSafeInteger(order.amount)||order.amount<=0)return null;
 let url,key,headers={};
 if(order.provider==='mercadopago'&&/^ORD[A-Z0-9]{10,64}$/.test(order.provider_id||'')&&env.MP_LIVE_TOKEN){
  key=env.MP_LIVE_TOKEN;url='https://api.mercadopago.com/v1/payments/search?'+new URLSearchParams({sort:'date_created',criteria:'desc',external_reference:order.id,range:'date_created',begin_date:'NOW-7DAYS',end_date:'NOW'});
 }else if(order.provider==='stripe'&&/^cs_live_[a-zA-Z0-9]+$/.test(order.provider_id||'')&&/^[sr]k_live_/.test(env.STRIPE_LIVE_KEY||'')){
  key=env.STRIPE_LIVE_KEY;url='https://api.stripe.com/v1/checkout/sessions/'+order.provider_id+'?'+new URLSearchParams({'expand[0]':'payment_intent.latest_charge'});headers['Stripe-Version']='2026-09-30.endive';
 }else return null;
 try{
  const r=await fetcher(url,{method:'GET',redirect:'error',headers:{...headers,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
  if(!r.ok)return null;const text=await r.text();if(text.length>500000)return null;const data=JSON.parse(text);
  return order.provider==='stripe'?stripePaidAt(data,order,now):mpPaidAt(data,order,now);
 }catch{return null}
}
