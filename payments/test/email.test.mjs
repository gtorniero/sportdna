import {test,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.mjs';
import {digest} from '../src/security.mjs';
let sqlite,env,oldFetch,messages,provider;
const id='81f87685-15e9-42b9-8074-6f13b94597ab',token='a'.repeat(64),origin='https://sportdna.com.br';
const text='Seu relatório completo: raquete recomendada, medidas e recomendações.';
const req=(report=text,t=token)=>new Request('https://api.example/orders/'+id+'/email',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({report,email:'outro@example.com'})});
beforeEach(async()=>{
 sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../migrations/0001.sql',import.meta.url),'utf8'));
 const prepare=(sql,params=[])=>({bind:(...p)=>prepare(sql,p),first:async()=>sqlite.prepare(sql).get(...params)||null,run:async()=>sqlite.prepare(sql).run(...params)});
 env={DB:{prepare},SITE_ORIGIN:origin,PAYMENTS_MODE:'test',RATE_SECRET:'fixture',STRIPE_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'fixture',RESEND_KEY:'re_fixture',EMAIL_DE:'SPORT DNA <hi@sportdna.com.br>'};
 sqlite.prepare('INSERT INTO orders(id,token_hash,product,provider,amount,mode,provider_id,state,created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(id,await digest(token),'racket-report','stripe',1999,'test','cs_unit','paid',Date.now());
 provider={id:'cs_unit',client_reference_id:id,metadata:{sportdna_product:'racket-report'},amount_total:1999,currency:'brl',livemode:false,payment_status:'paid',status:'complete',customer_details:{email:'sportdna-qa@example.com'}};
 oldFetch=globalThis.fetch;messages=[];globalThis.fetch=async(url,init)=>{if(String(url).startsWith('https://api.resend.com/')){messages.push(JSON.parse(init.body));return new Response(JSON.stringify({id:'email-fixture'}),{status:200})}return new Response(JSON.stringify(provider),{headers:{'content-type':'application/json'}})};
});
afterEach(()=>{sqlite.close();globalThis.fetch=oldFetch});
test('envia somente ao e-mail confirmado pelo provedor e escapa HTML',async()=>{const r=await worker.fetch(req(text+' <img src=x onerror=alert(1)>'),env);assert.equal(r.status,200);assert.deepEqual(await r.json(),{sent:true,emailId:'email-fixture'});assert.equal(messages.length,1);assert.deepEqual(messages[0].to,['sportdna-qa@example.com']);assert.ok(!messages[0].html.includes('<img'));assert.match(messages[0].html,/&lt;img/);assert.equal(messages[0].reply_to,'hi@sportdna.com.br')});
test('reconfere pagamento antes de enviar',async()=>{provider.payment_status='unpaid';assert.equal((await worker.fetch(req(),env)).status,403);assert.equal(messages.length,0)});
test('recusa token errado',async()=>{assert.equal((await worker.fetch(req(text,'b'.repeat(64)),env)).status,404);assert.equal(messages.length,0)});
test('limita reenvio e não grava relatório',async()=>{assert.equal((await worker.fetch(req(),env)).status,200);assert.equal((await worker.fetch(req(),env)).status,429);assert.equal(messages.length,1);assert.deepEqual(sqlite.prepare('PRAGMA table_info(report_emails)').all().map(x=>x.name),['order_id','attempted_at'])});
test('recusa relatório vazio, origem indevida e e-mail ausente',async()=>{assert.equal((await worker.fetch(req(''),env)).status,400);const bad=req();bad.headers.set('Origin','https://other.example');assert.equal((await worker.fetch(bad,env)).status,403);provider.customer_details=null;assert.equal((await worker.fetch(req(),env)).status,409);assert.equal(messages.length,0)});
test('recusa provedor de produção e modo live',async()=>{provider.livemode=true;assert.equal((await worker.fetch(req(),env)).status,403);assert.equal((await worker.fetch(req(),{...env,PAYMENTS_MODE:'live'})).status,503);assert.equal(messages.length,0)});

test('não confirma envio sem comprovante do provedor',async()=>{const previous=globalThis.fetch;globalThis.fetch=async(url,init)=>String(url).startsWith('https://api.resend.com/')?new Response('{}',{status:200}):previous(url,init);assert.equal((await worker.fetch(req(),env)).status,502)});
