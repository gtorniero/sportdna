// Tag do Google Ads no quadro /medicao: só com os dois aceites, só em página pública e só pedido e compra.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const vendor=readFileSync(new URL('../assets/measurement-vendor.js',import.meta.url),'utf8');
const ADS='AW-18547334686',GA='G-BL3GWV6MGQ',tx='a'.repeat(64);
function frame(init,top='/racket/'){
 const handlers={},scripts=[];const parent={postMessage(){},location:{pathname:top}};
 const window={addEventListener(n,f){handlers[n]=f}};
 vm.runInNewContext(vendor,{window,parent,location:{origin:'https://sportdna.com.br'},document:{head:{appendChild(s){scripts.push(s.src)}},createElement(){return {}}},URLSearchParams,Number,Object});
 const send=data=>handlers.message({data,origin:'https://sportdna.com.br',source:parent});
 send({type:'sd_init',...init});
 // Cópia em JSON: objetos do contexto vm têm outro protótipo.
 const calls=()=>JSON.parse(JSON.stringify((window.dataLayer||[]).map(x=>Array.from(x))));
 const ads=()=>calls().filter(c=>c[0]==='event'&&c[2]?.send_to===ADS);
 const measure=(event,params={})=>send({type:'sd_measure',event,path:'/racket/',params,campaign:'?utm_source=google&gclid=CLIQUE'});
 return {send,calls,ads,measure,parent,scripts};
}
const all={analytics:true,marketing:true,googleAdsMeasurement:true};
const sale={sport:'racket',product:'racket-report',value:19.99,currency:'BRL',payment_type:'pix'};
test('com os dois aceites: config depois do Consent Mode, sem personalização',()=>{
 const x=frame(all);const c=x.calls();
 const config=c.findIndex(v=>v[0]==='config'&&v[1]===ADS);
 assert(config>c.findIndex(v=>v[0]==='consent'&&v[1]==='update'),'consent before Ads config');
 assert.deepEqual(c[config][2],{send_page_view:false,page_title:'SPORT DNA',allow_ad_personalization_signals:false});
});
test('recebe só pedido criado e compra, com valor e ID irreversível; nada do teste',()=>{
 const x=frame(all);
 x.measure('page_view');x.measure('quiz_complete',{sport:'racket'});x.measure('view_offer',{sport:'racket',product:'racket-report',value:19.99,currency:'BRL'});
 x.measure('begin_checkout',sale);x.measure('purchase',{...sale,transaction_id:tx});
 const ads=x.ads();
 assert.deepEqual(ads.map(c=>c[1]),['begin_checkout','purchase']);
 assert.deepEqual(ads[0][2],{send_to:ADS,page_title:'SPORT DNA',value:19.99,currency:'BRL'});
 assert.deepEqual(ads[1][2],{send_to:ADS,page_title:'SPORT DNA',value:19.99,currency:'BRL',transaction_id:tx});
 // GA4 continua recebendo tudo como antes
 assert.equal(x.calls().filter(c=>c[0]==='event'&&c[2]?.send_to===GA).length,5);
});
test('sem o aceite de anúncios, com recusa ou fora de página pública: Google Ads não carrega',()=>{
 for(const [init,top] of [[{...all,googleAdsMeasurement:false},'/racket/'],[{analytics:true,marketing:false,googleAdsMeasurement:false},'/racket/'],[{analytics:false,marketing:false},'/racket/'],[all,'/conta/privada/'],[all,'/blog/Nome Privado/']]){
  const x=frame(init,top);x.measure('purchase',{...sale,transaction_id:tx});
  assert.equal(x.calls().some(c=>c[1]===ADS),false,JSON.stringify([init,top]));
 }
});
test('revogação ou saída para página não pública: nenhuma compra a mais vai ao Google Ads',()=>{
 const x=frame(all);
 x.send({type:'sd_consent',analytics:true,marketing:false,googleAdsMeasurement:false});
 x.measure('purchase',{...sale,transaction_id:tx});assert.equal(x.ads().length,0);
 const y=frame(all);y.parent.location.pathname='/outra/';
 y.measure('purchase',{...sale,transaction_id:tx});assert.equal(y.ads().length,0);
});
