/* Offers never enter scoring. An expired or unverified offer fails closed. */
/* card de compra (nov/2026): limpo, um botão por variante, cores do app (--ball) */
(()=>{if(typeof document==='undefined'||document.getElementById('affcss'))return;const st=document.createElement('style');st.id='affcss';st.textContent=`.affcard{margin-top:16px;padding:16px;border-radius:18px;background:var(--surface,#fff);border:1px solid var(--line,#ccd);display:flex;flex-direction:column;gap:10px}
.affhead{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.affhead b{font:800 18px Archivo,sans-serif;color:var(--ink,#0B2530)}.affhead span{font-size:13px;color:var(--muted,#4A6570)}
.affbtns{display:flex;flex-wrap:wrap;gap:8px}.affbtn{flex:1 1 150px;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 16px;border-radius:14px;background:var(--ball,#FF8A3D);color:var(--ball-ink,#0B2530);font:800 16px "DM Sans",sans-serif;text-decoration:none;box-shadow:0 6px 16px rgba(6,34,44,.12)}
.affbtn:hover{filter:brightness(1.04)}.affbtn:focus-visible{outline:3px solid var(--ink,#0B2530);outline-offset:2px}
.affnote{margin:0;font-size:12.5px;color:var(--muted,#4A6570)}`;document.head.appendChild(st)})();
(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=window.SPORTDNA_AFFILIATE_OFFERS||{offers:[]};
function valid(o){try{const u=new URL(o.affiliateUrl);return o.status==='verified'&&u.protocol==='https:'&&['meli.la','mercadolivre.com','www.mercadolivre.com.br','mercadolivre.com.br'].includes(u.hostname)&&Number.isFinite(Date.parse(o.checkedAt))&&Date.now()-Date.parse(o.checkedAt)>=0&&Date.now()-Date.parse(o.checkedAt)<=8*86400000;}catch{return false}}
window.SportDNAAffiliates=Object.freeze({card(sport,model){
 const offers=data.offers.filter(o=>o.sport===sport&&o.model===model&&valid(o));
 if(!offers.length)return '';
 const seen=new Set(), choices=offers.filter(o=>{const key=sport==='run'?(o.gender||'unspecified'):(o.variantKey||o.id);if(seen.has(key))return false;seen.add(key);return true});
 const names={male:'Masculino',female:'Feminino',unisex:'Unissex'};
 const one=choices.length===1;
 const label=o=>sport==='run'?(one?'Comprar no Mercado Livre':(names[o.gender]||'Comprar')):(one?'Comprar no Mercado Livre':(o.buttonLabel||'Comprar no Mercado Livre'));
 return `<aside class="affiliate-offer affcard"><div class="affhead"><b>Comprar agora</b><span>no Mercado Livre</span></div><div class="affbtns">${choices.map(o=>`<a class="affbtn" href="${esc(o.affiliateUrl)}" target="_blank" rel="sponsored noopener noreferrer" data-affiliate-id="${esc(o.id)}" data-affiliate-sport="${esc(sport)}">${esc(label(o))} <span aria-hidden="true">→</span><span class="a11y-sr"> (abre em nova aba)</span></a>`).join('')}</div><p class="affnote">Link afiliado</p></aside>`;
}});
document.addEventListener('click',e=>{const a=e.target.closest?.('[data-affiliate-id]');if(a)window.SportDNAMeasure?.affiliate(a.dataset.affiliateSport,a.dataset.affiliateId)});
})();
