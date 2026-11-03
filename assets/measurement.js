/* Somente contagens consentidas. Nunca recebe respostas, medidas ou relatórios. */
(()=>{
'use strict';
const KEY='sd_consent_v1';let consent=null,frame=null,ready=false,last='',active=false,done=false;
const host=/^(www\.)?sportdna\.com\.br$/.test(location.hostname);
const path=location.pathname;
const allowed=new Set(['/','/racket/','/surf/','/run/','/blog/','/privacidade/','/guias/racket/','/guias/surf/','/guias/run/']);
const publicPath=allowed.has(path)?path:/^\/blog\/[a-z0-9-]+\/$/.test(path)?'/blog/':null;
const sport=/^\/(racket|surf|run)\/$/.exec(path)?.[1];
const query=new URLSearchParams();const source=new URLSearchParams(location.search);
for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','gbraid','wbraid']){const v=source.get(k);if(v&&/^[a-z0-9_.-]{1,200}$/i.test(v))query.set(k,v)}
const campaign=query.size?'?'+query.toString():'';
function read(){try{const c=JSON.parse(localStorage.getItem(KEY)||'null');return c?.version===1&&typeof c.analytics==='boolean'&&typeof c.marketing==='boolean'&&Number.isFinite(c.at)&&c.at<=Date.now()&&Date.now()-c.at<180*86400000?c:null}catch{return null}}
function remove(){frame?.remove();frame=null;ready=false;last=''}
function send(event,params={}){if(!ready||!frame||!publicPath)return;frame.contentWindow.postMessage({type:'sd_measure',event,path:publicPath,params,campaign},location.origin)}
function sync(){if(!host||!publicPath||!(consent?.analytics||consent?.marketing)){remove();return}if(!frame){frame=document.createElement('iframe');frame.hidden=true;frame.title='Medição opcional';frame.referrerPolicy='no-referrer';frame.src='/medicao.html'+campaign;document.body.append(frame)}if(ready&&last!==publicPath){send('page_view');last=publicPath}}
function clearCookies(){for(const part of document.cookie.split(';')){const n=part.trim().split('=')[0];if(!/^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_fbp$|_fbc$|_gcl_)/.test(n))continue;for(const domain of ['',location.hostname,'.sportdna.com.br'])document.cookie=n+'=; Max-Age=0; Path=/; SameSite=Lax'+(domain?'; Domain='+domain:'')}}
function save(analytics,marketing){consent={version:1,analytics,marketing,at:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(consent))}catch{}remove();clearCookies();document.getElementById('sd-consent')?.remove();sync()}
function preferences(){document.getElementById('sd-consent')?.remove();const box=document.createElement('section');box.id='sd-consent';box.setAttribute('aria-label','Preferências de privacidade');box.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;z-index:99999;max-width:640px;margin:auto;padding:20px;background:#fff;color:#111;border:2px solid #111;border-radius:16px;box-shadow:0 5px 30px #0003;max-height:85vh;overflow:auto;font:16px/1.5 sans-serif';
box.innerHTML='<h2 style="margin:0 0 8px;font-size:22px">Sua privacidade</h2><p>Você decide se permite cookies para medir visitas e ações no Google Analytics e na Meta. Suas respostas, medidas, condições físicas e relatórios não são enviados às tags. <a href="/privacidade/">Saiba mais</a>.</p><label style="display:block;min-height:44px"><input type="checkbox" name="analytics"> Medição de uso (Google Analytics)</label><label style="display:block;min-height:44px"><input type="checkbox" name="marketing"> Medição de anúncios (Meta)</label><div style="display:flex;gap:8px;flex-wrap:wrap"><button data-choice="reject">Recusar opcionais</button><button data-choice="save">Salvar escolhas</button><button data-choice="accept">Aceitar opcionais</button></div>';
box.querySelector('[name="analytics"]').checked=!!consent?.analytics;box.querySelector('[name="marketing"]').checked=!!consent?.marketing;box.querySelectorAll('button').forEach(b=>b.style.cssText='min-height:44px;padding:8px 12px;cursor:pointer');box.addEventListener('click',e=>{const a=e.target.closest('[data-choice]')?.dataset.choice;if(!a)return;save(a==='accept'||a==='save'&&box.querySelector('[name="analytics"]').checked,a==='accept'||a==='save'&&box.querySelector('[name="marketing"]').checked)});document.body.append(box)}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame?.contentWindow||e.data?.type!=='sd_ready')return;frame.contentWindow.postMessage({type:'sd_init',analytics:!!consent?.analytics,marketing:!!consent?.marketing},location.origin);ready=true;sync()});
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){consent=read();remove();sync()}});
window.SportDNAMeasure=Object.freeze({screen(id){if(!sport)return;if(id==='landing'){active=false;done=false}if(id==='quiz'&&!active){active=true;done=false;send('quiz_start',{sport})}if(id==='analysis'&&active&&!done){done=true;active=false;send('quiz_complete',{sport})}},preferences});
if(sport){const sections=['landing','quiz','analysis'].map(id=>document.getElementById(id)).filter(Boolean);new MutationObserver(()=>{for(const el of sections)if(!el.hidden)window.SportDNAMeasure.screen(el.id)}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']})}
consent=read();const b=document.createElement('button');b.type='button';b.textContent='Preferências de cookies';b.style.cssText='display:block;margin:16px auto;padding:8px 12px;min-height:44px;font:inherit;cursor:pointer';b.onclick=preferences;document.body.append(b);sync();if(!consent&&publicPath)preferences();
})();
