const encoder = new TextEncoder();
export const catalog = Object.freeze({
 'racket-report': {amount:1999, name:'Relatório RACKET DNA', path:'racket', stripeTestPrice:'price_1UXQc8134hMOoEZVeFvwBWWH'},
 'surf-report': {amount:1999, name:'Relatório SURF DNA', path:'surf', stripeTestPrice:'price_1UXQcC134hMOoEZVMG1XhvLs'},
 'run-report': {amount:999, name:'Relatório RUN DNA', path:'run', stripeTestPrice:'price_1UXQcG134hMOoEZVNKn0DNnj'},
 'racket-comparator': {amount:499, name:'Comparador RACKET DNA', path:'racket', stripeTestPrice:'price_1UXQcL134hMOoEZV0yLYBnVF'}
});
export const hex = bytes => [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(value) { return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value))); }
export async function hmac(secret, value) {
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));
}
export function equalHex(a,b) {
 if(!/^[a-f0-9]{64}$/.test(a||'')||!/^[a-f0-9]{64}$/.test(b||'')) return false;
 let diff=0;for(let i=0;i<a.length;i++) diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
export async function verifyMP(request, secret, now=Date.now()) {
 if(!secret) return false;
 const parts=Object.fromEntries((request.headers.get('x-signature')||'').split(',').map(p=>p.trim().split('=')));
 const id=new URL(request.url).searchParams.get('data.id');
 const rid=request.headers.get('x-request-id'), ts=parts.ts;
 if(!id||!rid||!/^\d{10,13}$/.test(ts||'')) return false;
 const ms=ts.length===13?Number(ts):Number(ts)*1000;
 if(Math.abs(now-ms)>300000) return false;
 const manifest=`id:${id.toLowerCase()};request-id:${rid};ts:${ts};`;
 return equalHex(await hmac(secret,manifest),parts.v1);
}
export function stripeState(s, order) {
 if(s.id!==order.provider_id||s.client_reference_id!==order.id||s.metadata?.sportdna_product!==order.product||
    s.amount_total!==order.amount||s.currency!=='brl'||s.livemode!==(order.mode==='live')) return 'invalid';
 const pi=s.payment_intent;
 const charge=pi && typeof pi==='object'?pi.latest_charge:null;
 if(charge&&typeof charge==='object'&&(charge.refunded||charge.amount_refunded>0||charge.disputed)) return 'revoked';
 if(s.payment_status==='paid'&&s.status==='complete') return 'paid';
 return s.status==='expired'?'expired':'pending';
}
export function mpState(s,order) {
 const p=s.transactions?.payments;
 if(s.id!==order.provider_id||s.external_reference!==order.id||s.country_code!=='BRA'||
    Math.round(Number(s.total_amount)*100)!==order.amount||!Array.isArray(p)||p.length!==1||
    Math.round(Number(p[0].amount)*100)!==order.amount||p[0].payment_method?.id!=='pix'||
    (typeof s.live_mode==='boolean'&&s.live_mode!==(order.mode==='live'))||
    (order.mode==='live'&&String(s.id).startsWith('ORDTST')))
    return 'invalid';
 if(s.status==='processed'&&s.status_detail==='accredited'&&p[0].status==='processed'&&p[0].status_detail==='accredited') return 'paid';
 if(['refunded','charged_back','cancelled','canceled'].includes(s.status)||['refunded','charged_back','cancelled','canceled'].includes(p[0].status)) return 'revoked';
 return 'pending';
}
