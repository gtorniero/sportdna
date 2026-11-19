import {catalog,currencyOf,digest} from './security.mjs';
// Only metadata from an already reconciled real order. No emails, tokens or quiz answers.
export async function saleMeasurement(order){
 const product=catalog[order?.product];
 if(!product||order.mode!=='live'||order.state!=='paid'||!['stripe','mercadopago'].includes(order.provider)||!(order.amount===product.amount||(Number.isInteger(order.discount)&&order.discount>=1&&order.discount<=90&&order.amount===Math.floor(product.amount*(100-order.discount)/100)))||order.amount<=0||!order.provider_id||!order.id)return null;
 return {transaction_id:await digest('sportdna:purchase:'+order.id),value:order.amount/100,currency:currencyOf(order.product).toUpperCase(),sport:product.sport||product.path,product:order.product};
}
