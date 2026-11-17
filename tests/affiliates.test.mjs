import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(offers){let click;const window={SPORTDNA_AFFILIATE_OFFERS:{offers}};vm.runInNewContext(read('assets/affiliates.js'),{window,URL,Date,document:{addEventListener(_,f){click=f}}});return {window,card:window.SportDNAAffiliates.card,click};}
const offer={sport:'run',model:'Exact model',id:'MLB123',affiliateUrl:'https://meli.la/example',status:'verified',checkedAt:new Date().toISOString()};
test('offers require exact sport/model and a fresh verified safe link',()=>{const {card}=setup([offer]);assert.match(card('run','Exact model'),/sponsored noopener noreferrer/);assert.equal(card('racket','Exact model'),'');assert.equal(card('run','Other model'),'');for(const changed of [{status:'pending'},{checkedAt:'2000-01-01'},{affiliateUrl:'javascript:alert(1)'},{affiliateUrl:'https://meli.la.evil.test/x'}])assert.equal(setup([{...offer,...changed}]).card('run','Exact model'),'');});
test('all published offers map exactly to engine catalog; no duplicate mappings',()=>{const c={window:{}};vm.runInNewContext(read('assets/affiliate-offers.js'),c);const catalog=JSON.parse(read('docs/affiliates/catalog.json'));const seen=new Set();for(const o of c.window.SPORTDNA_AFFILIATE_OFFERS.offers){assert(catalog.some(p=>p.sport===o.sport&&p.name===o.model));assert(!seen.has(o.sport+o.model));seen.add(o.sport+o.model);assert.match(o.id,/^MLB\d+$/);}});
test('RUN has no checkout script; paid apps retain their adapters',()=>{assert.doesNotMatch(read('run/index.html'),/<script src="[^\"]*payments\//);for(const app of ['racket','surf'])assert.match(read(app+'/index.html'),/SportDNAPayments\?\.register/);});
test('inline application scripts parse',()=>{for(const app of ['run','racket','surf'])for(const m of read(app+'/index.html').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(/ld\+json|src=/.test(m[1]))continue;new vm.Script(m[2],{filename:app});}});
