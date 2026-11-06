import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {test} from 'node:test';
function database(){const sqlite=new DatabaseSync(':memory:');const prepare=(sql,values=[])=>({bind:(...v)=>prepare(sql,v),first:async()=>sqlite.prepare(sql).get(...values)||null,all:async()=>({results:sqlite.prepare(sql).all(...values)}),run:async()=>({meta:{changes:sqlite.prepare(sql).run(...values).changes}})});return {prepare,batch:async(s)=>Promise.all(s.map(x=>x.run()))};}
async function seed(db){await promoTables(db);await db.prepare('INSERT INTO promo_codes(id,hash,label,sites,created) VALUES (?,?,?,?,?)').bind('test',await promoHash('BTW-TEST-FRIENDS'),'Test','["retrozap","sportdna"]',Date.now()).run();}
import worker from '../src/worker.mjs';
import {promoTables,promoHash} from '../src/promos.mjs';
import {readFileSync} from 'node:fs';
const origin='https://sportdna.com.br',id='11111111-1111-4111-8111-111111111111',token='1'.repeat(64);
test('free report uses server authorization, exact product and bearer; no payment provider',async()=>{
 const db=database();for(const sql of readFileSync(new URL('../migrations/0001.sql',import.meta.url),'utf8').split(';').filter(x=>x.trim()))await db.prepare(sql).run();await seed(db);
 const env={DB:db,PROMOS:db,SITE_ORIGIN:origin,PAYMENTS_MODE:'live',RATE_SECRET:'fixture'};
 const request=(body)=>new Request('https://api.example/promos/redeem',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const body={id,token,product:'racket-report',email:'guest@example.com',codigo:'WRONG-CODE'};
 assert.equal((await worker.fetch(request(body),env)).status,400);
 body.codigo='BTW-TEST-FRIENDS';let r=await worker.fetch(request(body),env);assert.equal(r.status,200);const result=await r.json();assert.equal(result.state,'paid');assert.equal(result.amount,0);assert.equal(result.provider,'promo');
 r=await worker.fetch(new Request('https://api.example/orders/'+id,{headers:{Origin:origin,Authorization:'Bearer '+token}}),env);assert.equal(r.status,200);const status=await r.json();assert.equal(status.state,'paid');assert.equal(status.measurement,undefined);
 assert.equal((await worker.fetch(request({...body,product:'surf-report'}),env)).status,409);
 assert.equal((await worker.fetch(request({...body,token:'2'.repeat(64)}),env)).status,409);
});

test('Surf-only promotion rejects other products and grants the complete Surf report',async()=>{
 const db=database();for(const sql of readFileSync(new URL('../migrations/0001.sql',import.meta.url),'utf8').split(';').filter(x=>x.trim()))await db.prepare(sql).run();await seed(db);
 await db.prepare('UPDATE promo_codes SET sites=?').bind('["sportdna:surf-report"]').run();
 const env={DB:db,PROMOS:db,SITE_ORIGIN:origin,PAYMENTS_MODE:'live',RATE_SECRET:'fixture'};
 const redeem=product=>worker.fetch(new Request('https://api.example/promos/redeem',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),token,product,email:'guest@example.com',codigo:'BTW-TEST-FRIENDS'})}),env);
 for(const product of ['racket-report','run-report','racket-comparator'])assert.equal((await redeem(product)).status,400);
 assert.equal((await db.prepare('SELECT COUNT(*) n FROM promo_grants').first()).n,0);
 const r=await redeem('surf-report');assert.equal(r.status,200);const result=await r.json();assert.equal(result.amount,0);assert.equal(result.provider,'promo');assert.equal(result.state,'paid');
});
