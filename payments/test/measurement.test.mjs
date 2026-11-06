import test from 'node:test';
import assert from 'node:assert/strict';
import {saleMeasurement} from '../src/measurement.mjs';
import {catalog} from '../src/security.mjs';
test('only reconciled live paid provider orders produce bounded anonymous sale metadata',async()=>{
 for(const [product,info] of Object.entries(catalog)){
  const order={id:'fixture-order-'+product,provider_id:'fixture-provider',product,amount:info.amount,provider:'stripe',mode:'live',state:'paid',email:'private@example.invalid',token:'PRIVATE',answers:{weight:70}};
  const m=await saleMeasurement(order);assert.match(m.transaction_id,/^[a-f0-9]{64}$/);assert.equal(m.value,info.amount/100);assert.equal(m.currency,'BRL');assert.equal(m.sport,info.path);assert.equal(m.product,product);assert.deepEqual(m,await saleMeasurement(order));assert(!JSON.stringify(m).includes('PRIVATE'));assert(!JSON.stringify(m).includes('example.invalid'));assert(!JSON.stringify(m).includes('weight'));
  for(const patch of [{mode:'test'},{state:'pending'},{state:'revoked'},{provider:'promo',amount:0},{amount:1},{provider_id:null},{product:'unknown'}])assert.equal(await saleMeasurement({...order,...patch}),null);
 }
});
