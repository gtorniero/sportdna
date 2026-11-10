import {WorkerEntrypoint} from 'cloudflare:workers';
import {collectProduct} from './finance-report.mjs';
export {default} from './worker.mjs';

// Reachable only through a configured Cloudflare service binding. No public HTTP handler.
// No caller-provided URLs, SQL, order IDs, credentials or product filters.
export class PaymentInsights extends WorkerEntrypoint {
 async read(...args){
  if(args.length)throw Error('Invalid report request');
  if(this.env.PAYMENTS_MODE!=='live')return {status:'not_configured',product:'SPORT DNA'};
  return collectProduct('sportdna',{PROMO_SPORTDNA:this.env.DB,MP_TOKEN:this.env.MP_LIVE_TOKEN},fetch,Date.now());
 }
}
