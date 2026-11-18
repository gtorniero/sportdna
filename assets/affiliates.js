/* Offers never enter scoring. Only fresh, verified, direct product routes are rendered. */
(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=window.SPORTDNA_AFFILIATE_OFFERS||{offers:[]};
const merchants={meli:{name:'Mercado Livre',hosts:['www.mercadolivre.com.br','produto.mercadolivre.com.br','mercadolivre.com.br']},nike:{name:'Nike',hosts:['www.nike.com.br','nike.com.br']}};
function valid(o){try{const u=new URL(o.purchaseUrl),m=merchants[o.merchant||'meli'];return !!m&&o.status==='verified'&&u.protocol==='https:'&&!u.username&&!u.password&&m.hosts.includes(u.hostname)&&((o.merchant||'meli')==='meli'?/\/(?:p\/MLB\d+|up\/MLBU\d+|MLB-\d+)/.test(u.pathname):/\.html$/.test(u.pathname))&&Number.isFinite(Date.parse(o.checkedAt))&&Date.now()-Date.parse(o.checkedAt)>=0&&Date.now()-Date.parse(o.checkedAt)<=8*86400000;}catch{return false}}
window.SportDNAAffiliates=Object.freeze({card(sport,model){
 const offers=data.offers.filter(o=>o.sport===sport&&o.model===model&&valid(o)).sort((a,b)=>Number((a.merchant||'meli')!=='meli')-Number((b.merchant||'meli')!=='meli'));
 if(!offers.length)return '';
 const seen=new Set(),choices=offers.filter(o=>{const key=sport==='run'?(o.gender||'unspecified'):(o.variantKey||o.id);if(seen.has(key))return false;seen.add(key);return true});
 const names={male:'Modelo masculino',female:'Modelo feminino',unisex:'Modelo unissex'};
 const meliOnly=choices.every(o=>(o.merchant||'meli')==='meli');
 return `<aside class="affiliate-offer" style="margin-top:16px;padding:16px;border:1px solid var(--line,#ccc);border-radius:14px"><p class="note">${meliOnly?'Ofertas no Mercado Livre':'Onde comprar'}</p><div style="display:flex;flex-wrap:wrap;gap:12px">${choices.map(o=>{const key=o.merchant||'meli',m=merchants[key];const label=key==='meli'?(sport==='run'?(names[o.gender]||'Ver no Mercado Livre'):(o.buttonLabel||'Ver no Mercado Livre')):`Comprar na ${m.name}${names[o.gender]?' · '+names[o.gender].replace('Modelo ',''):''}`;return `<div style="flex:1 1 190px"><a class="btn btn-go" href="${esc(o.purchaseUrl)}" target="_blank" rel="${key==='meli'?'sponsored ':''}noopener noreferrer" data-affiliate-id="${esc(o.id)}" data-affiliate-sport="${esc(sport)}" data-merchant="${esc(key)}">${esc(label)} <span aria-hidden="true">↗</span><span class="a11y-sr"> (abre em nova aba)</span></a><p class="note">${esc(o.variantNote||'Confira o modelo, a numeração e a disponibilidade no anúncio.')}</p></div>`}).join('')}</div>${sport==='run'?'<p class="note">A forma e a numeração podem variar entre versões. Confira a tabela de medidas do anúncio antes de comprar.</p>':''}${choices.some(o=>(o.merchant||'meli')==='meli')?'<p class="note">Publicidade: podemos receber comissão pela compra. Isso não altera o seu ranking.</p>':''}</aside>`;
}});
document.addEventListener('click',e=>{const a=e.target.closest?.('[data-affiliate-id]');if(a&&(a.dataset.merchant||'meli')==='meli')window.SportDNAMeasure?.affiliate(a.dataset.affiliateSport,a.dataset.affiliateId)});
})();
