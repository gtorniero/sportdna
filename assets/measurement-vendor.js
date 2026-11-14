/* Contexto separado: nunca recebe URL completa, dados de formulários ou códigos de sala. */
(() => {
  'use strict';
  const GA = 'G-BL3GWV6MGQ';
  const PIXEL = '1109514848506414';
  const SITE = 'https://sportdna.com.br';
  let initialized = false;
  let analytics = false;
  let marketing = false;
  let metaLoaded = false;
  const metaCallbacks = [];
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const allowedPaths = new Set(['/', '/racket/', '/surf/', '/run/', '/blog/', '/privacidade/', '/guias/racket/', '/guias/surf/', '/guias/run/', '/ferramentas/litragem/', '/ferramentas/grip/', '/guias/racket/melhor-raquete-de-tenis/', '/guias/racket/melhor-raquete-de-tenis-para-iniciante/', '/guias/racket/raquete-de-tenis-para-dor-no-cotovelo/']);
  // Artigos entram pelo próprio caminho; a página principal só envia caminhos publicados (canonical igual ao endereço).
  function safePath(path) { return allowedPaths.has(path) || /^\/blog\/[a-z0-9-]{1,140}\/$/.test(path) ? path : null; }
  // Área da página para a Meta: o pixel roda em /medicao.html, então o caminho real vai como parâmetro.
  function area(path, sport) {
    if (sport) return sport;
    const m = /^\/(?:guias\/)?(racket|surf|run)\/(?:[a-z0-9-]+\/)?$/.exec(path);
    if (m) return m[1];
    if (path === '/ferramentas/grip/') return 'racket';
    return path === '/ferramentas/litragem/' ? 'surf' : path === '/' ? 'home' : path === '/privacidade/' ? 'privacidade' : 'blog';
  }
  function script(src, onload) { const s = document.createElement('script'); s.async = true; s.src = src; s.referrerPolicy = 'no-referrer'; if(onload)s.onload=onload; document.head.appendChild(s); }
  function gtag() { window.dataLayer.push(arguments); }
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== parent || parent === window) return;
    const d = e.data;
    if (d?.type === 'sd_init' && !initialized) {
      initialized = true;
      analytics = d.analytics === true; marketing = d.marketing === true;
      if (analytics) {
        window.dataLayer = [];
        const ads = marketing && d.googleAdsMeasurement === true ? 'granted' : 'denied';
        // Consent Mode v2: tudo negado por padrão; o aceite chega como update. Sem aceite este quadro nem existe.
        gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });
        gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: ads, ad_user_data: ads, ad_personalization: 'denied' });
        gtag('set', 'ads_data_redaction', ads !== 'granted');
        gtag('js', new Date());
        gtag('config', GA, { send_page_view: false, page_location: SITE + '/', page_referrer: '', page_title: 'SPORT DNA', allow_google_signals: false, allow_ad_personalization_signals: false });
        script('https://www.googletagmanager.com/gtag/js?id=' + GA);
      }
      if (marketing) {
        const fbq = function() { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
        fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
        window.fbq = window._fbq = fbq;
        fbq('set', 'autoConfig', false, PIXEL);
        fbq('consent', 'grant');
        fbq('init', PIXEL);
        script('https://connect.facebook.net/en_US/fbevents.js', () => { metaLoaded = true; for(const done of metaCallbacks.splice(0))done(); });
      }
      return;
    }
    // Revogação: só reduz permissões (um novo aceite recria o quadro do zero).
    if (d?.type === 'sd_consent' && initialized) {
      const a = analytics && d.analytics === true, m = marketing && d.marketing === true;
      const ads = a && m && d.googleAdsMeasurement === true ? 'granted' : 'denied';
      if (analytics) gtag('consent', 'update', { analytics_storage: a ? 'granted' : 'denied', ad_storage: ads, ad_user_data: ads, ad_personalization: 'denied' });
      if (marketing && !m && window.fbq) window.fbq('consent', 'revoke');
      analytics = a; marketing = m;
      return;
    }
    if (!initialized || d?.type !== 'sd_measure' || !['page_view', 'quiz_start', 'quiz_step', 'quiz_complete', 'view_offer', 'checkout_open', 'checkout_error', 'begin_checkout', 'purchase', 'generate_lead'].includes(d.event)) return;
    const path = typeof d.path === 'string' ? safePath(d.path) : null;
    if (!path) return;
    const p = {};
    const raw = d.params || {};
    if (['racket','surf','run'].includes(raw.sport)) p.sport = raw.sport;
    const products={'racket-report':'racket','surf-report':'surf','run-report':'run','racket-comparator':'racket'};
    if (has(products,raw.product)&&products[raw.product]===p.sport) p.product=raw.product;
    if (['pix','card'].includes(raw.payment_type)) p.payment_type = raw.payment_type;
    // Contexto de lista fechada: grupo do A/B da ficha grátis (só RACKET) e de onde veio o clique para o teste.
    if (p.sport === 'racket' && ['controle', 'ficha'].includes(raw.ab_ficha)) p.ab_ficha = raw.ab_ficha;
    if (p.sport && ['artigo_meio', 'artigo_fim', 'grip', 'litragem', 'guia'].includes(raw.cta_origem)) {
      p.cta_origem = raw.cta_origem;
      if (/^(raquete|prancha|tenis)-\d{2}$/.test(raw.cta_artigo || '')) p.cta_artigo = raw.cta_artigo;
    }
    // Etapa do questionário: número da etapa e total, nada mais.
    if (d.event === 'quiz_step') {
      if (!p.sport || path !== '/' + p.sport + '/' || !Number.isInteger(raw.step) || !Number.isInteger(raw.steps_total) || raw.step < 1 || raw.steps_total > 20 || raw.step > raw.steps_total) return;
      p.step = raw.step; p.steps_total = raw.steps_total;
    }
    if (['view_offer','checkout_open','checkout_error'].includes(d.event)) {
      if(!p.sport||path!=='/'+p.sport+'/'||!p.product)return;
      if(['preview_primary','preview_details','comparator','other'].includes(raw.cta_position))p.cta_position=raw.cta_position;
      if(d.event==='checkout_error'){
        if(!['invalid_email','network','timeout','unavailable','rejected','invalid_response','client'].includes(raw.error_category))return;
        p.error_category=raw.error_category;
      }
    }
    // Contato com o especialista parceiro: só o esporte da própria página e o lugar do botão.
    if (d.event === 'generate_lead') {
      if (!p.sport || path !== '/' + p.sport + '/' || !['previa', 'relatorio'].includes(raw.origem)) return;
      p.origem = raw.origem;
    }
    if (Number.isFinite(raw.value) && raw.value > 0 && raw.value < 10000 && raw.currency === 'BRL') { p.value = raw.value; p.currency = 'BRL'; }
    if (d.event === 'purchase') {
      if (!/^[a-f0-9]{64}$/.test(raw.transaction_id) || !p.value || !p.sport || !p.product) return;
      p.transaction_id = raw.transaction_id;
    }
    if (d.event==='begin_checkout'&&(!p.value||!p.product||!p.payment_type)) return;
    const query = new URLSearchParams();
    const source = new URLSearchParams(typeof d.campaign === 'string' ? d.campaign : '');
    for (const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','gbraid','wbraid']) {
      const v = source.get(k); if (v && /^[a-z0-9_.-]{1,200}$/i.test(v)) query.set(k,v);
    }
    const suffix = query.toString() ? '?' + query.toString() : '';
    // Só a origem de quem trouxe a visita, nunca o endereço completo.
    const referrer = typeof d.referrer === 'string' && /^https?:\/\/[a-z0-9.-]{1,253}(?::\d{1,5})?\/$/i.test(d.referrer) ? d.referrer : '';
    const done = () => parent.postMessage({ type: 'sd_done', id: d.id, queued: true }, location.origin);
    if (analytics) gtag('event', d.event, { ...p, send_to: GA, page_location: SITE + path + suffix, page_referrer: referrer, page_title: 'SPORT DNA', transport_type: 'beacon', event_callback: done, event_timeout: 1500 });
    if (marketing && d.event !== 'quiz_step') {
      // Toda chamada leva a página real e a área, porque a Meta só enxerga /medicao.html.
      const page = { page_path: path, content_category: area(path, p.sport) };
      const item = p.product ? { content_ids: [p.product], content_type: 'product', num_items: 1 } : {};
      if (d.event === 'page_view') window.fbq('trackSingle', PIXEL, 'PageView', { page_category: path, ...page });
      else if (d.event === 'purchase') window.fbq('trackSingle', PIXEL, 'Purchase', { value:p.value, currency:'BRL', ...item, ...page }, {eventID:p.transaction_id});
      // content_category do InitiateCheckout continua sendo o produto, como já era.
      else if (d.event === 'begin_checkout') window.fbq('trackSingle', PIXEL, 'InitiateCheckout', {value:p.value, currency:p.currency, ...item, page_path:path, content_category:p.product});
      // Contato: personalizado ContatoEspecialista e, ao lado, o padrão Contact.
      else if (d.event === 'generate_lead') {
        window.fbq('trackSingleCustom', PIXEL, 'ContatoEspecialista', { page_category: path, ...p, ...page });
        window.fbq('trackSingle', PIXEL, 'Contact', { ...page, origem: p.origem });
      }
      else {
        window.fbq('trackSingleCustom', PIXEL, {quiz_start:'QuizStarted',quiz_complete:'QuizCompleted',view_offer:'OfferViewed',checkout_open:'CheckoutOpened',checkout_error:'CheckoutError'}[d.event], { page_category: path, ...p, ...page });
        // Eventos padrão ao lado dos personalizados, que continuam iguais.
        if (d.event === 'quiz_complete' && p.sport) window.fbq('trackSingle', PIXEL, 'Lead', { content_category: p.sport, page_path: path });
        if (d.event === 'view_offer') window.fbq('trackSingle', PIXEL, 'ViewContent', { ...(p.value ? { value: p.value, currency: 'BRL' } : {}), ...item, ...page });
      }
    }
    if (!analytics && marketing) { if (d.event === 'quiz_step') done(); else if(metaLoaded)done();else metaCallbacks.push(done); }
  });
  if (parent !== window) parent.postMessage({ type: 'sd_ready' }, location.origin);
})();
