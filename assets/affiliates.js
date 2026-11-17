/* Offers never enter scoring. An expired or unverified offer fails closed. */
(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=window.SPORTDNA_AFFILIATE_OFFERS||{offers:[]};
function valid(o){try{const u=new URL(o.affiliateUrl);return o.status==='verified'&&u.protocol==='https:'&&['meli.la','mercadolivre.com','www.mercadolivre.com.br','mercadolivre.com.br'].includes(u.hostname)&&Number.isFinite(Date.parse(o.checkedAt))&&Date.now()-Date.parse(o.checkedAt)>=0&&Date.now()-Date.parse(o.checkedAt)<=8*86400000;}catch{return false}}
window.SportDNAAffiliates=Object.freeze({card(sport,model){
 const offers=data.offers.filter(o=>o.sport===sport&&o.model===model&&valid(o));
 if(!offers.length)return '';
 const seen=new Set(), choices=offers.filter(o=>{const key=sport==='run'?(o.gender||'unspecified'):(o.variantKey||o.id);if(seen.has(key))return false;seen.add(key);return true});
 const names={male:'Modelo masculino',female:'Modelo feminino',unisex:'Modelo unissex'};
 return `<aside class="affiliate-offer" style="margin-top:16px;padding:16px;border:1px solid var(--line,#ccc);border-radius:14px"><p class="note">Ofertas no Mercado Livre</p><div style="display:flex;flex-wrap:wrap;gap:12px">${choices.map(o=>`<div style="flex:1 1 190px"><a class="btn btn-go" href="${esc(o.affiliateUrl)}" target="_blank" rel="sponsored noopener noreferrer" data-affiliate-id="${esc(o.id)}" data-affiliate-sport="${esc(sport)}">${esc(sport==='run'?(names[o.gender]||'Ver no Mercado Livre'):(o.buttonLabel||'Ver no Mercado Livre'))} <span aria-hidden="true">↗</span><span class="a11y-sr"> (abre em nova aba)</span></a><p class="note">${esc(o.variantNote||'Confira o modelo, a numeração e a disponibilidade no anúncio.')}</p></div>`).join('')}</div>${sport==='run'?'<p class="note">A forma e a numeração podem variar entre versões. Confira a tabela de medidas do anúncio antes de comprar.</p>':''}<p class="note">Link afiliado: podemos receber comissão pela compra. Isso não altera o seu ranking.</p></aside>`;
}});
document.addEventListener('click',e=>{const a=e.target.closest?.('[data-affiliate-id]');if(a)window.SportDNAMeasure?.affiliate(a.dataset.affiliateSport,a.dataset.affiliateId)});
})();
