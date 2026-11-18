/* Medição da versão internacional (pré-lançamento).
   Mesma interface e mesmos nomes de evento do assets/measurement.js brasileiro (quiz_start, quiz_step, quiz_complete,
   view_offer, checkout_open, checkout_error, begin_checkout, purchase), com contexto a mais:
   market (US, GB, CA, AU), language, traffic_source e environment.
   Nesta fase nada sai do navegador: os eventos vão só para window.dataLayer (sem GA4, pixel ou Conversions API).
   Em ambiente de teste a compra vira purchase_test, sem value, para nunca somar como venda real.
   Nunca recebe respostas, medidas ou relatórios. */
(function(){
'use strict';
var I=window.RK_INTL||{},env=I.env==='live'?'live':'test';
var dl=window.dataLayer=window.dataLayer||[];
var source=(function(){try{var q=new URLSearchParams(location.search),u=q.get('utm_source');if(u&&/^[a-z0-9_.-]{1,60}$/i.test(u))return u.toLowerCase();
 if(q.get('gclid')||q.get('gbraid')||q.get('wbraid'))return 'google_ads';if(q.get('fbclid'))return 'meta';
 var r=document.referrer?new URL(document.referrer):null;return r&&r.origin!==location.origin?r.hostname.replace(/^www\./,''):'direct'}catch(e){return 'direct'}})();
var medium=(function(){try{var m=new URLSearchParams(location.search).get('utm_medium');return m&&/^[a-z0-9_.-]{1,60}$/i.test(m)?m.toLowerCase():null}catch(e){return null}})();
var base={sport:'racket',market:I.market||'US',language:(I.lang||'en').toLowerCase(),traffic_source:source,environment:env};
if(medium)base.traffic_medium=medium;
var debug=/[?&]debug_measure=1/.test(location.search);
function track(event,params){var e=Object.assign({event:event},base,params||{});dl.push(e);if(debug)try{console.info('[measure]',e)}catch(x){}return Promise.resolve(true)}
var PRODUCT='racket-report-intl';
function amount(){var p=window.SPORTDNA_PAYMENTS&&window.SPORTDNA_PAYMENTS.products&&window.SPORTDNA_PAYMENTS.products[PRODUCT];return p&&Number.isSafeInteger(p.amount)?p.amount:null}
function offer(event,product,o){o=o||{};if(product!==PRODUCT||o.example===true)return;var p={product:product};var a=amount();
 if(event!=='checkout_error'&&a){p.value=a/100;p.currency='USD'}
 if(['preview_primary','preview_details','comparator','other'].indexOf(o.position)>=0)p.cta_position=o.position;
 if(o.method==='card')p.payment_type='card';
 if(event==='checkout_error'){if(['network','timeout','unavailable','rejected','invalid_response','client'].indexOf(o.category)<0)return;p.error_category=o.category}
 return track(event,p)}
var seen={};
function orderOk(o){return o&&o.product===PRODUCT&&o.currency==='USD'&&o.amount===amount()&&o.provider==='stripe'&&(!o.market||o.market===base.market)}
var active=false,done=false,steps={};
window.SportDNAMeasure=Object.freeze({
 affiliate:function(){},contact:function(){},
 screen:function(id){if(id==='landing'){active=false;done=false}
  if(id==='quiz'&&!active){active=true;done=false;steps={};track('quiz_start')}
  if(id==='analysis'&&active&&!done){done=true;active=false;track('quiz_complete')}
  if(id==='preview')track('preview_view');if(id==='report')track('report_view')},
 offer:function(p,o){return offer('view_offer',p,o)},
 checkoutOpen:function(p,o){return offer('checkout_open',p,o)},
 checkoutError:function(p,o){return offer('checkout_error',p,o)},
 checkout:function(o){if(!orderOk(o)||seen['c'+o.id])return;seen['c'+o.id]=1;return track('begin_checkout',{product:o.product,value:o.amount/100,currency:'USD',payment_type:'card'})},
 // compra: em teste nunca vira "purchase" (evento de receita); em live exige pedido live conciliado
 purchase:function(o){if(!orderOk(o)||o.state!=='paid'||seen['p'+o.id])return;seen['p'+o.id]=1;
  if(env!=='live'||o.mode!=='live')return track('purchase_test',{product:o.product,payment_type:'card',test_order:true});
  return track('purchase',{product:o.product,value:o.amount/100,currency:'USD',payment_type:'card'})}
});
// telas: as mesmas seções do app brasileiro
function watch(){var ids=['landing','quiz','analysis','preview','report'];var els=ids.map(function(i){return document.getElementById(i)}).filter(Boolean);
 new MutationObserver(function(){els.forEach(function(el){if(!el.hidden)window.SportDNAMeasure.screen(el.id)})}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
 var box=document.getElementById('steps');if(box)new MutationObserver(function(){if(!active)return;var it=[].slice.call(box.children),i=it.findIndex(function(x){return x.classList.contains('on')});if(i<0||steps[i+1])return;steps[i+1]=1;track('quiz_step',{step:i+1,steps_total:it.length})}).observe(box,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 track('page_view',{page_path:location.pathname})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
