(()=>{'use strict';const brand='sportdna';const key='btw_meta_subject_'+brand;function currentSubject(){const v=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1);return v&&/^[a-f0-9-]{36}$/.test(v)?v:localStorage.getItem(key)}function subject(){let id=currentSubject();if(!id){id=crypto.randomUUID();localStorage.setItem(key,id);document.cookie=key+'='+id+'; Max-Age=15552000; Secure; SameSite=Lax; Path=/; Domain=.'+brand+'.com.br'}return id;}function context(){try{if(localStorage.getItem('btw_capi_choice_v1')!=='yes')return null;let c;if(brand==='retrozap')c={version:1,marketing:localStorage.getItem('rz_marketing_v1')==='sim',at:Date.now()};else c=JSON.parse(localStorage.getItem(brand==='quiddo'?'qd_consent_v1':'sd_consent_v1')||'null');if(c?.marketing!==true||c.version!==1||!Number.isFinite(c.at))return null;const out={version:1,marketing:true,at:c.at,subject:subject()};const click=new URLSearchParams(location.search).get('fbclid');if(click&&/^[A-Za-z0-9_-]{20,200}$/.test(click)&&!document.cookie.split(';').map(x=>x.trim()).some(x=>x.startsWith('_fbc=')&&x.endsWith('.'+click)))document.cookie='_fbc=fb.1.'+Date.now()+'.'+click+'; Max-Age=7776000; Secure; SameSite=Lax; Path=/; Domain=.'+brand+'.com.br';for(const [key,name] of [['fbp','_fbp'],['fbc','_fbc']]){const v=document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);if(v&&/^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/.test(v))out[key]=v}return out}catch{return null}}function revoke(){let id;try{id=currentSubject()}catch{}if(!id)return;const api=brand==='sportdna'?(window.SPORTDNA_PAYMENTS?.api||'')+'/meta/revoke':'/api/meta/revoke';void fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:id}),keepalive:true}).catch(()=>{});}window.BTWMetaConsent=Object.freeze({context,revoke});window.addEventListener('storage',e=>{if(['rz_marketing_v1','qd_consent_v1','sd_consent_v1',null].includes(e.key)&&!context())revoke()});})();
/* Somente contagens consentidas. Nunca recebe respostas, medidas ou relatórios. */
(()=>{
'use strict';
const PRODUCTS=Object.freeze({'racket-report':'racket','surf-report':'surf','run-report':'run','racket-comparator':'racket'});
const waiting=new Set(),callbacks=new Map(),checkouts=new Set(),purchases=new Set();let sequence=0;
const KEY='sd_consent_v1';let consent=null,frame=null,ready=false,last='',active=false,done=false,opener=null;
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const host=/^(www\.)?sportdna\.com\.br$/.test(location.hostname);
const path=location.pathname;
const allowed=new Set(['/','/racket/','/surf/','/run/','/blog/','/privacidade/','/guias/racket/','/guias/surf/','/guias/run/','/ferramentas/litragem/','/ferramentas/grip/','/guias/racket/melhor-raquete-de-tenis/','/guias/racket/melhor-raquete-de-tenis-para-iniciante/','/guias/racket/raquete-de-tenis-para-dor-no-cotovelo/']);
// Artigo do blog entra com o próprio caminho só quando é a página publicada (canonical igual ao endereço).
// Endereço inexistente em /blog/ continua reduzido a /blog/: nenhum trecho arbitrário vira parâmetro.
function canonicalPath(){try{const href=document.querySelector?.('link[rel="canonical"]')?.getAttribute('href');return href?new URL(href,'https://sportdna.com.br/').pathname:null}catch{return null}}
const publicPath=allowed.has(path)?path:/^\/blog\/[a-z0-9-]{1,140}\/$/.test(path)?(canonicalPath()===path?path:'/blog/'):null;
const sport=/^\/(racket|surf|run)\/$/.exec(path)?.[1];
const query=new URLSearchParams();const source=new URLSearchParams(location.search);
for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','gbraid','wbraid']){const v=source.get(k);if(v&&/^[a-z0-9_.-]{1,200}$/i.test(v))query.set(k,v)}
// URLSearchParams.size não existe no Safari antes do 17: usar toString() para não perder a campanha.
const campaign=query.toString()?'?'+query.toString():'';
// Só a origem de quem trouxe a visita (ex.: https://www.google.com/), nunca o endereço completo.
const referrer=(()=>{try{const r=new URL(document.referrer);return /^https?:$/.test(r.protocol)&&r.origin!==location.origin?r.origin+'/':''}catch{return ''}})();
function read(){try{const c=JSON.parse(store.get(KEY)||'null');return c?.version===1&&typeof c.analytics==='boolean'&&typeof c.marketing==='boolean'&&Number.isFinite(c.at)&&c.at<=Date.now()&&Date.now()-c.at<180*86400000?c:null}catch{return null}}
// update: Consent Mode v2 do Google e consentimento da Meta recebem a revogação antes de o quadro sair.
function remove(update){const old=frame;frame=null;ready=false;last='';if(old){if(update){try{old.contentWindow.postMessage({type:'sd_consent',...update},location.origin)}catch{}setTimeout(()=>{old.remove();clearCookies()},500)}else old.remove()}for(const resolve of waiting)resolve(false);waiting.clear();for(const done of [...callbacks.values()])done(false);callbacks.clear()}
function send(event,params={},id){if(!ready||!frame||!publicPath)return;frame.contentWindow.postMessage({type:'sd_measure',event,path:publicPath,params,campaign,referrer,id},location.origin)}
function canMeasure(){return host&&publicPath&&!!(consent?.analytics||consent?.marketing)}
function bridgeReady(waitMs=2000){if(!canMeasure())return Promise.resolve(false);if(ready)return Promise.resolve(true);return new Promise(resolve=>{const finish=ok=>{clearTimeout(timer);waiting.delete(finish);resolve(ok)};const timer=setTimeout(()=>finish(false),waitMs);waiting.add(finish)})}
// Quiz não bloqueia a interface: tolera carregamento lento só com consentimento já válido.
// remove() cancela a espera ao mudar/revogar a escolha; eventos anteriores ao aceite não entram.
// Contexto da visita ao teste, só com valores de lista fechada (nada digitado pela pessoa):
// ab_ficha = grupo do teste A/B da ficha ideal grátis no RACKET (racket/index.html grava 'sd_ab_ficha_v1');
// cta_origem/cta_artigo = de onde veio o clique para o teste (site.js grava 'sd_de' ao clicar no convite de um artigo ou ferramenta).
const ab=()=>{if(sport!=='racket')return null;const v=store.get('sd_ab_ficha_v1');return ['controle','ficha'].includes(v)?v:null};
const ORIGIN=(()=>{if(!sport)return null;try{const o=JSON.parse(sessionStorage.getItem('sd_de')||'null');if(!o||!Number.isFinite(o.at)||Date.now()-o.at>1800000||o.sport!==sport)return null;if(!['artigo_meio','artigo_fim','grip','litragem','guia'].includes(o.de))return null;return {cta_origem:o.de,...(/^(raquete|prancha|tenis)-\d{2}$/.test(o.a||'')?{cta_artigo:o.a}:{})}}catch{return null}})();
function context(event,params){if(!sport||event==='page_view')return params;const out={...params},v=ab();if(v)out.ab_ficha=v;if(ORIGIN)Object.assign(out,ORIGIN);return out}
async function track(event,params){params=context(event,params);const waitMs=event==='quiz_start'||event==='quiz_complete'||event==='quiz_step'?15000:2000;if(!await bridgeReady(waitMs)||!canMeasure())return;return new Promise(resolve=>{const id=++sequence;const done=queued=>{clearTimeout(timer);callbacks.delete(id);resolve(queued===true)};const timer=setTimeout(()=>done(false),2000);callbacks.set(id,done);send(event,params,id)})}
function orderParams(order){const kind=PRODUCTS[order?.product],amount=window.SPORTDNA_PAYMENTS?.products?.[order?.product]?.amount;if(!kind||kind!==sport||order.mode!=='live'||!['stripe','mercadopago'].includes(order.provider)||order.currency!=='BRL'||!Number.isSafeInteger(amount)||amount<=0||order.amount!==amount)return null;return {sport:kind,product:order.product,value:amount/100,currency:'BRL',payment_type:order.provider==='stripe'?'card':'pix'}}
// Oferta e abertura não são pedidos nem compras. Não recebem dados do questionário.
// Valem nos três testes; cada página só aceita os produtos do próprio esporte.
function offerEvent(event,product,options={}){
 if(!sport||PRODUCTS[product]!==sport||window.SPORTDNA_PAYMENTS?.mode!=='live'||options.example===true)return;
 const params={sport,product};
 const amount=window.SPORTDNA_PAYMENTS?.products?.[product]?.amount;
 if(event!=='checkout_error'&&Number.isSafeInteger(amount)&&amount>0){params.value=amount/100;params.currency='BRL'}
 if(['preview_primary','preview_details','comparator','other'].includes(options.position))params.cta_position=options.position;
 if(['pix','card'].includes(options.method))params.payment_type=options.method;
 if(event==='checkout_error'){
  if(!['invalid_email','network','timeout','unavailable','rejected','invalid_response','client'].includes(options.category))return;
  params.error_category=options.category;
 }
 return track(event,params);
}
// Contato com o especialista parceiro (botão de WhatsApp no SURF DNA): só o esporte e o lugar do botão.
// Nunca leva a mensagem, as respostas, o resultado nem o código de referência.
function contactEvent(origin){if(!sport||!['previa','relatorio'].includes(origin))return;return track('generate_lead',{sport,origem:origin})}
async function checkout(order){const p=orderParams(order);if(!p||!['pending','paid'].includes(order.state)||typeof order.id!=='string'||!order.id||checkouts.has(order.id)||!await bridgeReady()||!canMeasure())return;checkouts.add(order.id);await track('begin_checkout',p)}
async function purchase(order){const p=orderParams(order),m=order?.measurement;if(!p||order.state!=='paid'||!m||!/^([a-f0-9]{64})$/.test(m.transaction_id)||m.value!==p.value||m.currency!=='BRL'||m.sport!==p.sport||m.product!==p.product||purchases.has(m.transaction_id)||!canMeasure())return;try{const key='sd_sale_'+m.transaction_id;if(localStorage.getItem(key))return;purchases.add(m.transaction_id);const queued=await track('purchase',{...p,transaction_id:m.transaction_id});if(queued&&canMeasure())localStorage.setItem(key,'1')}catch{/* A medição nunca impede o acesso. */}finally{purchases.delete(m.transaction_id)}}
function sync(){if(!host||!publicPath||!(consent?.analytics||consent?.marketing)){remove();return}if(!frame){frame=document.createElement('iframe');frame.hidden=true;frame.title='Medição opcional';frame.referrerPolicy='no-referrer';frame.src='/medicao.html'+campaign;document.body.append(frame)}if(ready&&last!==publicPath){send('page_view');last=publicPath}}
function clearCookies(){for(const part of document.cookie.split(';')){const n=part.trim().split('=')[0];if(!/^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_fbp$|_fbc$|_gcl_)/.test(n))continue;for(const domain of ['',location.hostname,'.sportdna.com.br'])document.cookie=n+'=; Max-Age=0; Path=/; SameSite=Lax'+(domain?'; Domain='+domain:'')}}
function save(analytics,marketing){const before=consent;store.set('btw_capi_choice_v1',marketing?'yes':'no');if(!marketing)window.BTWMetaConsent?.revoke();consent={version:1,analytics,marketing,googleAdsMeasurement:analytics&&marketing,at:Date.now()};store.set(KEY,JSON.stringify(consent));const narrowed=(before?.analytics&&!analytics)||(before?.marketing&&!marketing);remove(narrowed?{analytics,marketing,googleAdsMeasurement:analytics&&marketing}:null);clearCookies();close();sync();if(marketing)window.BTWMetaConsent?.context();label()}
/* Aviso: uma barra no rodapé da tela. "Aceitar" é o principal (cor da marca, à direita, foco inicial);
   "Recusar" é o secundário, do mesmo tamanho e na mesma barra. Fechar ou ignorar não liga nada. */
const ACCENT={racket:'#DDF247',surf:'#6CCFF6',run:'#FF8A3D'};
const accent=ACCENT[sport]||(path==='/ferramentas/litragem/'?ACCENT.surf:'#FFFFFF');
const CSS='#sd-consent{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111;color:#fff;font:14px/1.4 "DM Sans",system-ui,sans-serif;padding:10px max(16px,env(safe-area-inset-left,0px)) calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid #ffffff33;box-shadow:0 -6px 24px #0000004d}#sd-consent .sd-row{max-width:960px;margin:0 auto;display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap}#sd-consent .sd-txt{flex:1 1 260px;margin:0}#sd-consent a{color:#fff;text-decoration:underline;text-underline-offset:2px;font-weight:600}#sd-consent .sd-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:0 0 auto}#sd-consent button{font:700 15px/1 "DM Sans",system-ui,sans-serif;min-height:44px;min-width:120px;padding:0 18px;border-radius:12px;cursor:pointer;white-space:nowrap}#sd-consent .sd-pri{background:var(--sd-accent);color:#0A0A0A;border:2px solid var(--sd-accent)}#sd-consent .sd-sec{background:transparent;color:#fff;border:2px solid #8A8A86}#sd-consent button:focus-visible,#sd-consent a:focus-visible{outline:3px solid #fff;outline-offset:2px}#sd-consent .sd-pri:focus-visible{outline-color:var(--sd-accent)}.sd-cookie-link{background:none;border:0;padding:4px 0;min-height:24px;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}#footLinks .sd-cookie-link{text-decoration:none;padding:0;line-height:inherit}#footLinks .sd-cookie-link:hover{color:var(--ink,inherit)}.f-links:not(#footLinks) .sd-cookie-link{margin-inline-start:16px}.sd-sr{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}@media (max-width:560px){#sd-consent .sd-btns{width:100%}#sd-consent button{min-width:0;width:100%}}@media (forced-colors:active){#sd-consent{border-top:2px solid CanvasText}#sd-consent button{border:2px solid ButtonText}}';
function style(){if(document.getElementById('sd-consent-css'))return;const st=document.createElement('style');st.id='sd-consent-css';st.textContent=CSS;document.head.append(st)}
let resize=null;
// Reserva o espaço da barra: o fim da página e o elemento em foco não ficam escondidos atrás dela (WCAG 2.4.11).
function room(el){try{const h=el?.isConnected?Math.ceil(el.getBoundingClientRect().height):0;let space=document.getElementById('sd-consent-space');if(!h){space?.remove();document.documentElement.style.scrollPaddingBottom='';return}if(!space){space=document.createElement('div');space.id='sd-consent-space';space.setAttribute('aria-hidden','true');el.before(space)}space.style.height=h+'px';document.documentElement.style.scrollPaddingBottom=h+'px'}catch{}}
function close(){const el=document.getElementById('sd-consent');const inside=el&&el.contains?.(document.activeElement);el?.remove();resize?.disconnect?.();resize=null;room(null);if(inside&&opener?.isConnected)opener.focus?.();opener=null}
function banner(){
 document.getElementById('sd-consent')?.remove();style();
 const el=document.createElement('section');el.id='sd-consent';el.setAttribute('aria-label','Aviso de cookies');el.style.setProperty?.('--sd-accent',accent);
 el.innerHTML='<div class="sd-row"><p class="sd-txt">Usamos cookies para medir visitas e anúncios. Os testes funcionam igual sem eles. <a href="/privacidade/#medicao">Saiba mais</a></p><div class="sd-btns"><button type="button" class="sd-sec" data-choice="reject">Recusar</button><button type="button" class="sd-pri" data-choice="accept">Aceitar</button></div></div>';
 el.addEventListener('click',e=>{const a=e.target.closest('[data-choice]')?.dataset.choice;if(a==='accept'||a==='reject')save(a==='accept',a==='accept')});
 document.body.append(el);
 try{resize=new ResizeObserver(()=>room(el));resize.observe(el)}catch{room(el)}
 el.querySelector?.('.sd-pri')?.focus?.({preventScroll:true});
 return el;
}
// Rodapé: estado atual da medição; reabre o mesmo aviso. Revogar fica tão fácil quanto aceitar.
let footer=null;
function label(){if(!footer)return;const on=!!(consent?.analytics||consent?.marketing);footer.innerHTML='<span>Medição '+(on?'ligada':'desligada')+'</span><span class="sd-sr">: mudar a escolha de cookies</span>'}
function reopen(){opener=footer;banner()}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;if(e.data?.type==='sd_done'){callbacks.get(e.data.id)?.(e.data.queued===true);return}if(e.data?.type!=='sd_ready')return;frame.contentWindow.postMessage({type:'sd_init',analytics:!!consent?.analytics,marketing:!!consent?.marketing,googleAdsMeasurement:consent?.analytics===true&&consent?.marketing===true&&consent?.googleAdsMeasurement===true},location.origin);ready=true;sync();for(const resolve of waiting)resolve(true);waiting.clear()});
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){consent=read();remove();clearCookies();sync();label()}});
// Etapa do questionário (quiz_step): só o número da etapa aberta e o total, uma vez por questionário.
// Lido da barra de etapas (#steps, item com a classe "on") que os três testes já desenham. Nunca a pergunta nem a resposta.
const stepsSent=new Set();
function stepRead(){const box=document.getElementById?.('steps');if(!sport||!active||!box)return;const items=[...(box.children||[])];const i=items.findIndex(x=>x.classList?.contains('on'));if(i<0||items.length>20)return;const n=i+1;if(stepsSent.has(n))return;stepsSent.add(n);void track('quiz_step',{sport,step:n,steps_total:items.length})}
window.SportDNAMeasure=Object.freeze({screen(id){if(!sport)return;if(id==='landing'){active=false;done=false}if(id==='quiz'&&!active){active=true;done=false;stepsSent.clear();void track('quiz_start',{sport});stepRead()}if(id==='analysis'&&active&&!done){done=true;active=false;void track('quiz_complete',{sport})}},offer:(product,options)=>offerEvent('view_offer',product,options),checkoutOpen:(product,options)=>offerEvent('checkout_open',product,options),checkoutError:(product,options)=>offerEvent('checkout_error',product,options),contact:contactEvent,checkout,purchase,preferences:reopen});
if(sport){const sections=['landing','quiz','analysis'].map(id=>document.getElementById(id)).filter(Boolean);new MutationObserver(()=>{for(const el of sections)if(!el.hidden)window.SportDNAMeasure.screen(el.id)}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});const box=document.getElementById('steps');if(box)new MutationObserver(stepRead).observe(box,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
consent=read();style();footer=document.createElement('button');footer.type='button';footer.className='sd-cookie-link';footer.id='sd-cookie-status';footer.onclick=reopen;label();const ft=[...document.querySelectorAll('footer')].pop();const spot=document.getElementById('footLinks')||ft?.querySelector?.('.f-links')||ft?.querySelector?.('.f-base');if(spot)spot.append(footer);else if(ft)ft.append(footer);else{footer.style.cssText='display:block;margin:16px auto';document.body.append(footer)}sync();if(publicPath&&(!consent||!store.get('btw_capi_choice_v1')||consent.marketing&&typeof consent.googleAdsMeasurement!=='boolean'))banner();
})();
