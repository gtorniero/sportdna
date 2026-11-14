// Modo interno da equipe (?btw_interno=1): nada de GA4, pixel nem Conversions API, mesmo com aceite.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../assets/measurement.js',import.meta.url),'utf8');
const config=readFileSync(new URL('../assets/payments/config.js',import.meta.url),'utf8');
// Pote de cookies mínimo: grava, troca e apaga (Max-Age=0) pelo nome.
function jar(initial={}){const c=new Map(Object.entries(initial));return {get cookie(){return [...c].map(([k,v])=>k+'='+v).join('; ')},set cookie(raw){const [pair,...attrs]=raw.split(';');const i=pair.indexOf('=');const k=pair.slice(0,i).trim(),v=pair.slice(i+1).trim();if(attrs.some(a=>/^\s*max-age=0\s*$/i.test(a)))c.delete(k);else c.set(k,v)},has:k=>c.has(k)}}
function page({search='',cookies={}}={}){
 const handlers={},nodes=[];
 const stored=new Map([['sd_consent_v1',JSON.stringify({version:1,analytics:true,marketing:true,googleAdsMeasurement:true,at:Date.now()})],['btw_capi_choice_v1','yes']]);
 class Element{constructor(tag){this.tag=tag;this.style={};this.id='';nodes.push(this);if(tag==='iframe')this.contentWindow={postMessage(){}}}append(){}appendChild(){}remove(){this.removed=true}setAttribute(){}addEventListener(){}querySelector(){return null}}
 const location={hostname:'sportdna.com.br',pathname:'/racket/',origin:'https://sportdna.com.br',search};
 const cookie=jar(cookies);
 const document={get cookie(){return cookie.cookie},set cookie(v){cookie.cookie=v},referrer:'',head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),getElementById:id=>nodes.find(n=>n.id===id&&!n.removed)||null,querySelectorAll:()=>[],querySelector:()=>null};
 const window={addEventListener(n,f){handlers[n]=f}};
 const context={window,document,location,URL,URLSearchParams,Date,Number,Map,Set,Object,Promise,setTimeout,clearTimeout,crypto:globalThis.crypto,MutationObserver:class{observe(){}},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)}};
 vm.createContext(context);vm.runInContext(config,context);vm.runInContext(source,context);
 return {window,cookie,frames:()=>nodes.filter(n=>n.tag==='iframe'&&!n.removed)};
}
test('?btw_interno=1 grava o cookie e não cria o quadro de medição nem o contexto da Conversions API',()=>{
 const p=page({search:'?btw_interno=1&utm_source=qa'});
 assert.equal(p.cookie.has('btw_interno'),true);
 assert.equal(p.frames().length,0,'sem quadro: GA4 e pixel não carregam');
 assert.equal(p.window.BTWMetaConsent.context(),null,'pedido sai sem consentimento da Meta');
});
test('o cookie vale nas visitas seguintes, sem o parâmetro',()=>{
 const p=page({cookies:{btw_interno:'1'}});
 assert.equal(p.frames().length,0);
 assert.equal(p.window.BTWMetaConsent.context(),null);
});
test('?btw_interno=0 apaga o cookie e a medição consentida volta',()=>{
 const p=page({search:'?btw_interno=0',cookies:{btw_interno:'1'}});
 assert.equal(p.cookie.has('btw_interno'),false);
 assert.equal(p.frames().length,1);
 assert.equal(p.window.BTWMetaConsent.context()?.marketing,true);
});
test('sem o modo interno, nada muda: com aceite, o quadro existe',()=>{
 const p=page();
 assert.equal(p.frames().length,1);
});
