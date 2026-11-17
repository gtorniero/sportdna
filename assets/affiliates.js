/* Offers never enter scoring. An expired or unverified offer fails closed. */
(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=window.SPORTDNA_AFFILIATE_OFFERS||{offers:[]};
function valid(o){try{const u=new URL(o.affiliateUrl);return o.status==='verified'&&u.protocol==='https:'&&['meli.la','mercadolivre.com','www.mercadolivre.com.br','mercadolivre.com.br'].includes(u.hostname)&&Number.isFinite(Date.parse(o.checkedAt))&&Date.now()-Date.parse(o.checkedAt)>=0&&Date.now()-Date.parse(o.checkedAt)<=8*86400000;}catch{return false}}
window.SportDNAAffiliates=Object.freeze({card(sport,model){const o=data.offers.find(o=>o.sport===sport&&o.model===model&&valid(o));if(!o)return '';return `<aside class="affiliate-offer" style="margin-top:16px;padding:16px;border:1px solid var(--line,#ccc);border-radius:14px"><a class="btn btn-go" href="${esc(o.affiliateUrl)}" target="_blank" rel="sponsored noopener noreferrer" data-affiliate-id="${esc(o.id)}" data-affiliate-sport="${esc(sport)}">Ver no Mercado Livre <span aria-hidden="true">↗</span><span class="a11y-sr"> (abre em nova aba)</span></a><p class="note">${esc(o.variantNote||'Confira o modelo, a numeração e a disponibilidade no anúncio.')}</p><p class="note">Link afiliado: podemos receber comissão pela compra. Isso não altera o seu ranking.</p></aside>`;}});
document.addEventListener('click',e=>{const a=e.target.closest?.('[data-affiliate-id]');if(a)window.SportDNAMeasure?.affiliate(a.dataset.affiliateSport,a.dataset.affiliateId)});
})();
