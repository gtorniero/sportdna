import test from 'node:test';
import assert from 'node:assert/strict';
import {checkBatch} from '../scripts/check-affiliate-links.mjs';
const offer={id:'MLB123',model:'Exact model',purchaseUrl:'https://produto.mercadolivre.com.br/MLB-123-model-_JM',evidenceTitle:'Exact model',gender:'male'};
function fake(url,title='Exact model'){return {goto:async()=>{},url:async()=>url,playwright:{getByRole:()=>({innerText:async()=>title,evaluateAll:async()=>[title]})}}}
test('weekly check validates direct route and rejects social redirect or changed product',async()=>{assert.equal((await checkBatch(fake(offer.purchaseUrl),[offer])).results[0].status,'verified');for(const [url,title] of [['https://www.mercadolivre.com.br/social/name','Exact model'],[offer.purchaseUrl,'Another model']]){const result=(await checkBatch(fake(url,title),[offer])).results[0];assert.equal(result.status,'needs_review');assert.equal(result.checkedAt,null)}});
test('missing direct route never falls back to the affiliate profile',async()=>{const r=await checkBatch(fake(offer.purchaseUrl),[{...offer,purchaseUrl:null,affiliateUrl:'https://meli.la/old'}]);assert.equal(r.results[0].status,'not_verified')});
