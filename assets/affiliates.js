/* Offers never enter scoring. Only fresh, verified offers are rendered. Meli CTAs preserve official affiliate links. */
/* card de compra limpo (nov/2026): cores do app (--ball) */
(()=>{if(typeof document==='undefined'||document.getElementById('affcss'))return;const st=document.createElement('style');st.id='affcss';st.textContent=`.affcard{margin-top:14px;padding:14px;border-radius:16px;background:var(--surface,#fff);border:1px solid var(--line,#ccd);display:flex;flex-direction:column;gap:10px}
.affhead{margin:0;font-size:13px;font-weight:600;color:var(--muted,#4A6570)}
.affbtns{display:flex;flex-wrap:wrap;gap:8px}.affbtn{flex:1 1 140px;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:12px 16px;border-radius:14px;background:var(--ball,#FF8A3D);color:var(--ball-ink,#0B2530);font:800 16px "DM Sans",sans-serif;text-decoration:none}
.afft{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15}.afft small{font-size:12.5px;font-weight:700;opacity:.85}
.affbtn:hover{filter:brightness(1.04)}.affbtn:focus-visible{outline:3px solid var(--ink,#0B2530);outline-offset:2px}
.affnote{margin:0;font-size:12px;color:var(--muted,#4A6570)}
.affphotos{display:flex;flex-wrap:wrap;gap:12px}
.affphoto{flex:1 1 140px;margin:0;min-width:0}
.affphoto img{display:block;width:100%;height:210px;object-fit:contain;background:#fff;border-radius:12px}
.affphoto figcaption{font-size:12px;text-align:center;margin-top:6px;color:var(--muted,#4A6570)}
.report-model-photo{margin-top:14px}
.report-model-photo figcaption{color:inherit}
.pod .affphoto img{height:150px}`;document.head.appendChild(st)})();
(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=window.SPORTDNA_AFFILIATE_OFFERS||{offers:[]};
const approvedPhotos=window.SPORTDNA_REPORT_PHOTOS?.photos||[];
const merchants={meli:{name:'Mercado Livre',hosts:['www.mercadolivre.com.br','produto.mercadolivre.com.br','mercadolivre.com.br']},nike:{name:'Nike',hosts:['www.nike.com.br','nike.com.br']}};
const buyUrl=o=>(o.merchant||'meli')==='meli'?o.affiliateUrl:o.purchaseUrl;
function valid(o){try{const u=new URL(buyUrl(o)),m=merchants[o.merchant||'meli'];return !!m&&o.status==='verified'&&u.protocol==='https:'&&!u.username&&!u.password&&((o.merchant||'meli')==='meli'?(u.hostname==='meli.la'&&/^\/[A-Za-z0-9]+$/.test(u.pathname)&&!u.search&&!u.hash):(m.hosts.includes(u.hostname)&&/\.html$/.test(u.pathname)))&&Number.isFinite(Date.parse(o.checkedAt))&&Date.now()-Date.parse(o.checkedAt)>=0&&Date.now()-Date.parse(o.checkedAt)<=8*86400000;}catch{return false}}
function offerPhoto(offer){
 if((offer.merchant||'meli')!=='meli'||offer.imageSource!=='affiliate-tool')return '';
 if(!/^MLB[0-9]+$/.test(offer.id)||offer.imageUrl!=='/assets/products/'+offer.id+'.webp')return '';
 const variant={male:'Modelo masculino',female:'Modelo feminino',unisex:'Modelo unissex'}[offer.gender]||'';
 return '<figure class="affphoto"><img src="'+esc(offer.imageUrl)+'" alt="'+esc(offer.imageTitle||offer.model)+'" width="420" height="420" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+(variant?'<figcaption>'+variant+'</figcaption>':'')+'</figure>';
}
function modelPhoto(sport,model){
 const photo=approvedPhotos.find(p=>p.sport===sport&&p.model===model&&p.approval==='approved');
 if(!photo||!(/^(T|R)-[0-9]{3}$/.test(photo.id))||!new RegExp('^/assets/model-photos/'+photo.id+'\\.(jpg|png|webp)$').test(photo.imageUrl))return '';
 return '<figure class="affphoto report-model-photo"><img src="'+esc(photo.imageUrl)+'" alt="'+esc(model)+'" width="420" height="420" loading="lazy" decoding="async"><figcaption>Imagem: '+esc(photo.brand)+'</figcaption></figure>';
}
document.addEventListener('error',event=>{
 const image=event.target;
 if(image?.tagName==='IMG'&&image.closest('.affphoto'))image.closest('.affphoto').remove();
},true);
window.SportDNAAffiliates=Object.freeze({card(sport,model){
 const offers=data.offers.filter(o=>o.sport===sport&&o.model===model&&valid(o)).sort((a,b)=>Number((a.merchant||'meli')!=='meli')-Number((b.merchant||'meli')!=='meli'));
 if(!offers.length)return modelPhoto(sport,model);
 const seen=new Set(),choices=offers.filter(o=>{const key=sport==='run'?(o.gender||'unspecified'):(o.variantKey||o.id);if(seen.has(key))return false;seen.add(key);return true});
 const photos=choices.map(offerPhoto).filter(Boolean).join('')||modelPhoto(sport,model);
 const names={male:'Modelo masculino',female:'Modelo feminino',unisex:'Modelo unissex'};
 const meliOnly=choices.every(o=>(o.merchant||'meli')==='meli');
 /* visual limpo (pedido do Gui, nov/2026): título, botão "Comprar agora" por variante e só "Publicidade · link de afiliado" */
 const vname=o=>{const key=o.merchant||'meli';if(key!=='meli')return 'na '+merchants[key].name+(o.gender&&names[o.gender]?' · '+names[o.gender].replace('Modelo ','').toLowerCase():'');if(sport==='run')return names[o.gender]?names[o.gender].replace('Modelo ','').toLowerCase():'';return String(o.buttonLabel||'').replace(/^Ver (oferta|no Mercado Livre)\s*·?\s*/i,'')};
 const label=o=>{const v=vname(o);return (o.merchant||'meli')!=='meli'?`<span class="afft"><b>Comprar ${esc(v)}</b></span>`:`<span class="afft"><b>Comprar agora</b>${choices.length>1&&v?`<small>${esc(v.charAt(0).toUpperCase()+v.slice(1))}</small>`:''}</span>`};
 return `<aside class="affiliate-offer affcard"><p class="affhead">${meliOnly?'Ofertas no Mercado Livre':'Onde comprar'}</p>${photos?'<div class="affphotos">'+photos+'</div>':''}<div class="affbtns">${choices.map(o=>{const key=o.merchant||'meli';return `<a class="affbtn" href="${esc(buyUrl(o))}" target="_blank" rel="${key==='meli'?'sponsored ':''}noopener noreferrer" data-affiliate-id="${esc(o.id)}" data-affiliate-sport="${esc(sport)}" data-merchant="${esc(key)}">${label(o)}<span aria-hidden="true">→</span><span class="a11y-sr"> (abre em nova aba)</span></a>`}).join('')}</div>${choices.some(o=>(o.merchant||'meli')==='meli')?'<p class="affnote">Publicidade · link de afiliado</p>':''}</aside>`;
}});
document.addEventListener('click',e=>{const a=e.target.closest?.('[data-affiliate-id]');if(a&&(a.dataset.merchant||'meli')==='meli')window.SportDNAMeasure?.affiliate(a.dataset.affiliateSport,a.dataset.affiliateId)});
})();
