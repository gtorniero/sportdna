import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(offers){let click;const window={SPORTDNA_AFFILIATE_OFFERS:{offers}};vm.runInNewContext(read('assets/affiliates.js'),{window,URL,Date,document:{getElementById(){return true},addEventListener(type,f){if(type==='click')click=f}}});return {window,card:window.SportDNAAffiliates.card,click};}
const offer={sport:'run',model:'Exact model',id:'MLB123',affiliateUrl:'https://meli.la/example',purchaseUrl:'https://produto.mercadolivre.com.br/MLB-123-exact-model-_JM',merchant:'meli',status:'verified',checkedAt:new Date().toISOString()};
test('offers require exact sport/model and a fresh verified safe link',()=>{const {card}=setup([offer]);assert.match(card('run','Exact model'),/sponsored noopener noreferrer/);assert.equal(card('racket','Exact model'),'');assert.equal(card('run','Other model'),'');for(const changed of [{status:'pending'},{checkedAt:'2000-01-01'},{purchaseUrl:'javascript:alert(1)'},{purchaseUrl:'https://meli.la.evil.test/x'},{purchaseUrl:'https://meli.la/example'},{purchaseUrl:'https://www.mercadolivre.com.br/social/example'}])assert.equal(setup([{...offer,...changed}]).card('run','Exact model'),'');});
test('all published offers map exactly to engine catalog; no duplicate mappings',()=>{const c={window:{}};vm.runInNewContext(read('assets/affiliate-offers.js'),c);const catalog=JSON.parse(read('docs/affiliates/catalog.json'));const seen=new Set();for(const o of c.window.SPORTDNA_AFFILIATE_OFFERS.offers){assert(catalog.some(p=>p.sport===o.sport&&p.name===o.model));assert(!seen.has(o.sport+o.model+(o.gender||o.variantKey||o.id)));seen.add(o.sport+o.model+(o.gender||o.variantKey||o.id));assert.match(o.id,/^MLB\d+$/);}});
test('RUN has no checkout script; paid apps retain their adapters',()=>{assert.doesNotMatch(read('run/index.html'),/<script src="[^\"]*payments\//);for(const app of ['racket','surf'])assert.match(read(app+'/index.html'),/SportDNAPayments\?\.register/);});
test('inline application scripts parse',()=>{for(const app of ['run','racket','surf'])for(const m of read(app+'/index.html').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(/ld\+json|src=/.test(m[1]))continue;new vm.Script(m[2],{filename:app});}});

test('male and female buttons appear only for independently verified offers',()=>{const {card}=setup([{...offer,gender:'male'},{...offer,id:'MLB124',gender:'female',affiliateUrl:'https://meli.la/female'}]);const h=card('run','Exact model');assert.match(h,/Masculino/);assert.match(h,/Feminino/);assert.equal((h.match(/<a /g)||[]).length,2);const one=setup([{...offer,gender:'male'},{...offer,gender:'female',status:'pending'}]).card('run','Exact model');assert.doesNotMatch(one,/Feminino/);assert.doesNotMatch(setup([offer]).card('run','Exact model'),/Masculino|Feminino/);});

test('all Meli CTAs use direct product routes and preserve original affiliate references',()=>{const c={window:{}};vm.runInNewContext(read('assets/affiliate-offers.js'),c);for(const o of c.window.SPORTDNA_AFFILIATE_OFFERS.offers){if((o.merchant||'meli')!=='meli')continue;assert.match(o.affiliateUrl,/^https:\/\/meli\.la\//);const u=new URL(o.purchaseUrl);assert.match(u.pathname,/\/(?:p\/MLB|up\/MLBU|MLB-)/);assert(!u.pathname.includes('/social/'));const html=setup([o]).card(o.sport,o.model);if(o.status!=='verified'){assert.equal(html,'');continue;}assert(html.includes(o.purchaseUrl.replaceAll('&','&amp;')));assert(!html.includes(o.affiliateUrl));assert(!o.purchaseUrl.includes('matt_d2id'));}});
test('official store alternatives do not display commission bookkeeping; Meli wins for same version',()=>{const direct={...offer,id:'NIKE056401',merchant:'nike',purchaseUrl:'https://www.nike.com.br/tenis-nike-vomero-18-masculino-056401.html',gender:'male'};const h=setup([direct]).card('run','Exact model');assert.match(h,/Comprar na Nike/);assert.doesNotMatch(h,/comiss|Mercado Livre|sponsored/);const both=setup([direct,{...offer,gender:'male'}]).card('run','Exact model');assert.doesNotMatch(both,/Comprar na Nike/);assert.match(both,/produto.mercadolivre/);});

test('photos require a fresh affiliate offer, official tool provenance and a safe image URL',()=>{
 const image={...offer,imageSource:'affiliate-tool',imageUrl:'/assets/products/MLB123.webp',imageTitle:'Exact model photo'};
 const html=setup([image]).card('run','Exact model');
 assert.match(html,/<figure class="affphoto">/);
 assert.match(html,/alt="Exact model photo"/);
 assert.match(html,/referrerpolicy="no-referrer"/);
 for(const changed of [{status:'pending'},{checkedAt:'2000-01-01'},{imageSource:null},{imageUrl:'https://evil.example/photo.webp'},{imageUrl:'javascript:alert(1)'},{imageUrl:'https://http2.mlstatic.com.evil.example/photo.webp'}]){
  assert.doesNotMatch(setup([{...image,...changed}]).card('run','Exact model'),/<figure class="affphoto">/);
 }
 assert.equal(setup([image]).card('run','Missing model'),'');
 assert.doesNotMatch(setup([offer]).card('run','Exact model'),/<img/);
 const store={...image,merchant:'nike',purchaseUrl:'https://www.nike.com.br/tenis-example-123.html'};
 assert.doesNotMatch(setup([store]).card('run','Exact model'),/<img/);
});

test('every active Meli offer has its own official WebP; inactive offers never render',()=>{
 const c={window:{}};vm.runInNewContext(read('assets/affiliate-offers.js'),c);
 for(const o of c.window.SPORTDNA_AFFILIATE_OFFERS.offers){
  if((o.merchant||'meli')!=='meli')continue;
  if(o.status!=='verified'){assert.equal(setup([o]).card(o.sport,o.model),'');continue;}
  assert.equal(o.imageSource,'affiliate-tool',o.id);
  assert.equal(o.imageUrl,'/assets/products/'+o.id+'.webp',o.id);
  const encoded=read('source-assets/products/'+o.id+'.webp.b64').trim();
  const bytes=Buffer.from(encoded,'base64');
  assert.equal(bytes.toString('base64'),encoded,o.id);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',o.id);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',o.id);
 }
});
