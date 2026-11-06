import {catalog,digest} from './security.mjs';
// Only metadata from an already reconciled real order. No emails, tokens or quiz answers.
export async function saleMeasurement(order){
 const product=catalog[order?.product];
 if(!product||order.mode!=='live'||order.state!=='paid'||!['stripe','mercadopago'].includes(order.provider)||order.amount!==product.amount||order.amount<=0||!order.provider_id||!order.id)return null;
 return {transaction_id:await digest('sportdna:purchase:'+order.id),value:order.amount/100,currency:'BRL',sport:product.path,product:order.product};
}
