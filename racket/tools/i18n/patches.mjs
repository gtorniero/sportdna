/* Mudanças de código da versão internacional, aplicadas sobre o racket/index.html brasileiro antes da tradução.
   Cada item: find (texto exato do arquivo brasileiro), replace e n (quantas vezes deve aparecer).
   Se o arquivo brasileiro mudar e um find sumir, o build para e diz qual. O motor (pesos e critérios) não é tocado:
   aqui só entram mercado, moeda, unidades, disponibilidade por país, checkout de teste e a retirada da compra de raquetes. */

export const page = [
 // ---------- cabeçalho: idioma, SEO fora do índice, sem canonical brasileiro ----------
 { find: '<!doctype html><html lang="pt-BR"><head>', replace: '<!doctype html><html lang="en" data-market="__MARKET__"><head>' },
 { find: /<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, replace: '<!-- SEO_START -->__SEO__<!-- SEO_END -->' },

 // ---------- ofertas de corda do Mercado Livre: só na versão brasileira (tests/string-affiliates.test.mjs) ----------
 { find: /<script src="\/racket\/cordas-afiliados\.js\?v=[0-9a-z]+"><\/script>\n?/, replace: '' },

 // ---------- números e preços ----------
 { find: "const fmt=n=>n.toLocaleString('pt-BR');", replace: "const fmt=n=>n.toLocaleString('en-US');" },
 { find: "const dec=n=>(+n).toFixed(1).replace('.',',');", replace: 'const dec=n=>(+n).toFixed(1);' },
 // preço de referência do país selecionado (moeda local); sem estimativa de importação
 { find: "const RK=CATALOG.map((a,i)=>{const p=PRECO[i];return {...a,id:i,name:a.brand+' '+a.model,len:a.len||685,price:p?[p.min,p.max]:null,lojas:p?p.n:0,usd:p&&p.usd||0}});",
   replace: "const RK=CATALOG.map((a,i)=>{const v=window.RK_INTL.price(i);return {...a,id:i,name:a.brand+' '+a.model,len:a.len||685,price:v?[v,v]:null,lojas:v?9:0,usd:0}});\n/* intl: disponibilidade por país no lugar da presença no Brasil (mesmos pesos; só muda quem é marca especialista) */\nObject.assign(PESOS.pen.nicho,window.RK_INTL.availability);" },
 { find: /const precoTxt=\(r,sep=' a '\)=>[^\n]*\n/, replace: "const precoTxt=(r)=>!r.price?'no price':'~'+window.RK_INTL.money(r.price[0]);\n" },
 { find: "const brTag=r=>(ehNicho(r)?'<span class=\"brtag d\">Marca de nicho no Brasil</span> ':'')+r.br==='d'?'<span class=\"brtag d\">Difícil de achar no Brasil</span>':r.br==='p'?'<span class=\"brtag p\">Pouca oferta no Brasil</span>':''",
   replace: "const brTag=r=>ehNicho(r)?'<span class=\"brtag d\">Specialist brand</span> ':''" },

 // ---------- questionário: sem a pergunta de importação; orçamento do país ----------
 { find: /\n \{s:5,id:'imp',[^\n]*\n/, replace: '\n' },
 { find: "o:[['1400','Até R$ 1.400'],['2000','R$ 1.400 a R$ 2.000'],['99999','Acima de R$ 2.000 ou sem limite']]}", replace: 'o:window.RK_INTL.budget.map(b=>[String(b[0]),b[1]])}' },
 { find: "const EXAMPLE={imp:'no',", replace: 'const EXAMPLE={' },
 { find: "restr:'6m',budget:'2000'};", replace: "restr:'6m',budget:String(window.RK_INTL.budget[1][0])};" },
 // altura e peso: pés/polegadas e libras quando o país usa; o motor continua recebendo cm e kg
 { find: "  if(q.type==='step'){\n    const v=A[q.id];\n    fs.innerHTML=`<label class=\"ql\" for=\"q_${q.id}\">${q.t}</label>${help}<div class=\"rng\"><input type=\"range\" min=\"${q.min}\" max=\"${q.max}\" step=\"1\" value=\"${v||q.mid}\" class=\"${v?'':'unset'}\" aria-label=\"${q.t}\"><span class=\"rnum\"><input id=\"q_${q.id}\" type=\"number\" inputmode=\"numeric\" min=\"${q.min}\" max=\"${q.max}\" value=\"${v||''}\" placeholder=\"${q.mid}\"><small>${q.u}</small></span></div>`;\n    const r=fs.querySelector('input[type=range]'),n=fs.querySelector('input[type=number]');\n    r.addEventListener('input',()=>{A[q.id]=r.value;n.value=r.value;r.classList.remove('unset');progress()});\n    n.addEventListener('input',()=>{const x=+n.value;if(x>=q.min&&x<=q.max){A[q.id]=String(x);r.value=x;r.classList.remove('unset')}else delete A[q.id];progress()});",
   replace: "  if(q.type==='step'){\n    const I=window.RK_INTL,body=q.id==='height'||q.id==='weight',imp=body&&I.units()==='imperial';\n    const cv=!imp?{to:x=>+x,from:x=>+x,u:q.u,min:q.min,max:q.max,mid:q.mid}:q.id==='height'?{to:c=>Math.round(c/2.54),from:x=>Math.round(x*2.54),u:'in',min:55,max:83,mid:69}:{to:k=>Math.round(k*2.20462),from:x=>Math.round(x/2.20462),u:'lb',min:77,max:330,mid:165};\n    const v=A[q.id]?cv.to(A[q.id]):'',ftin=x=>imp&&q.id==='height'&&x?I.ftin(cv.from(x)):'';\n    fs.innerHTML=`<label class=\"ql\" for=\"q_${q.id}\">${q.t}</label>${help}<div class=\"rng\"><input type=\"range\" min=\"${cv.min}\" max=\"${cv.max}\" step=\"1\" value=\"${v||cv.mid}\" class=\"${v?'':'unset'}\" aria-label=\"${q.t}\"><span class=\"rnum\"><input id=\"q_${q.id}\" type=\"number\" inputmode=\"numeric\" min=\"${cv.min}\" max=\"${cv.max}\" value=\"${v}\" placeholder=\"${cv.mid}\"><small>${cv.u}</small></span></div>${imp&&q.id==='height'?`<p class=\"help ftin\" aria-live=\"polite\">${ftin(v)}</p>`:''}${body?`<p class=\"help\" style=\"margin-top:8px\"><button type=\"button\" class=\"gl unitsw\">${imp?'Use cm and kg':'Use feet, inches and pounds'}</button></p>`:''}`;\n    const r=fs.querySelector('input[type=range]'),n=fs.querySelector('input[type=number]'),ft=fs.querySelector('.ftin');\n    const put=x=>{A[q.id]=String(cl(cv.from(x),q.min,q.max));if(ft)ft.textContent=ftin(x)};\n    r.addEventListener('input',()=>{put(+r.value);n.value=r.value;r.classList.remove('unset');progress()});\n    n.addEventListener('input',()=>{const x=+n.value;if(x>=cv.min&&x<=cv.max){put(x);r.value=x;r.classList.remove('unset')}else delete A[q.id];progress()});\n    const us=fs.querySelector('.unitsw');if(us)us.onclick=()=>{I.setUnits(imp?'metric':'imperial');$('#qs').querySelectorAll('[data-q=\"height\"],[data-q=\"weight\"]').forEach(f=>{const qq=Q.find(x=>x.id===f.dataset.q);f.replaceWith(field(qq))});$(`#qs [data-q=\"${q.id}\"] .unitsw`)?.focus()};" },

 // ---------- oferta: selo "Limited-time offer" igual ao do Brasil (pedido do dono, 18/11); sem Pix ----------
 { find: '<span class="muted">pagamento único, por cartão ou Pix</span>', replace: '<span class="muted">pagamento único, por cartão</span>' },
 // seletor de idioma: na página em inglês, o inglês é o atual
 { find: 'aria-current="page" aria-label="Português">', replace: 'aria-label="Português">' },
 { find: 'hreflang="en-US" aria-label="English">', replace: 'hreflang="en-US" aria-current="page" aria-label="English">' },
 { find: 'Pagamento único por cartão ou Pix. O relatório sai na hora', replace: 'Pagamento único por cartão. O relatório sai na hora' },
 { find: '        <li>Onde é fácil ou difícil de achar cada raquete no Brasil</li>\n', replace: '' },

 // ---------- sem compra de raquetes: nenhum card de loja, afiliado ou comparação de preço ----------
 { find: "${window.SportDNAAffiliates?.card('racket',r.brand+' '+r.model)||''}", replace: '', n: 3 }, // 1º lugar, alternativas e opção para evoluir
 // sem lojas nem fotos de produto no inglês (affiliates.js também desenha as fotos aprovadas do Brasil)
 { find: /<script src="\/assets\/affiliate-offers\.js[^"]*"><\/script>\n(?:<script src="\/assets\/(?:report-photos|affiliates)\.js[^"]*"><\/script>\n)+<script src="\/assets\/measurement\.js"><\/script>\n/, replace: '__MEASURE__\n' },
 { find: "${r.usd?'':' novo'}${r.br==='d'?' · difícil de achar no Brasil':r.br==='p'?' · pouca oferta no Brasil':' · fácil de achar no Brasil'}", replace: "${' novo'}" },
 { find: "${x.r.usd?'~R$ '+fmt(x.r.price[0])+' · importada':precoTxt(x.r,'–')+(x.r.br==='p'?' · pouca oferta':'')}", replace: '${precoTxt(x.r)}' },
 { find: "x.fillText(precoTxt(r).replace(' importada',' · importada').replace(/ \\(US.*\\)/,''),90,y+30);", replace: 'x.fillText(precoTxt(r),90,y+30);' },
 { find: ".concat(r.tech?[['Tecnologia','',esc(r.tech)]]:[]).concat([['No Brasil','',BR[r.br]||'Fácil de achar']]);", replace: ".concat(r.tech?[['Tecnologia','',esc(r.tech)]]:[]);" },
 { find: "['Preço no Brasil','price','',2]", replace: "['Preço','price','',2]" },

 // ---------- unidades na ficha: onças, pontos de balanço e grip em polegadas ----------
 { find: "['Peso sem corda','wt',r.wt+' g'],['Balanço sem corda','bal',r.bal+' mm']", replace: "['Peso sem corda','wt',r.wt+' g ('+window.RK_INTL.oz(r.wt)+' oz)'],['Balanço sem corda','bal',r.bal+' mm ('+window.RK_INTL.pts(r.bal,r.len)+')']" },
 { find: '${gs?`<p><strong>Para você: L${gs.g}</strong>, ${gs.src}.</p>`:\'\'}', replace: '${gs?`<p><strong>Para você: ${window.RK_INTL.grip(gs.g)}</strong>, ${gs.src}.</p>`:\'\'}' },

 // ---------- checkout: produto internacional, só sandbox; simulação de teste fora da produção ----------
 { find: "if(window.SportDNAPayments?.open(t==='cmp'?'racket-comparator':'racket-report',", replace: "if(window.SportDNAPayments?.open('racket-report-intl'," },
 { find: "saveRevision('racket-report')", replace: "saveRevision('racket-report-intl')" },
 { find: "saveRevision('racket-report','retest')", replace: "saveRevision('racket-report-intl','retest')" },
 // simulação liberada fora dos domínios de produção; em produção, sem checkout carregado, nunca libera (payDown)
 { find: 'const PAY_DEV=/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname);', replace: 'const PAY_DEV=!/(^|\\.)sportdna\\.com(\\.br)?$/.test(location.hostname);' },
 { find: "  const price=isCmp?4.99:19.99;\n  const label=isCmp?'Comparador ilimitado':'Relatório RACKET DNA';\n  const code='00020126580014BR.GOV.BCB.PIX0136SIMULACAO-RACKETDNA-'+Date.now().toString(36).toUpperCase()+'5204000053039865406'+price.toFixed(2)+'5802BR5909SPORT DNA6009SAO PAULO6304SIMU';",
   replace: "  const label='Relatório RACKET DNA';" },
 { find: /<div class="phead"><div><p class="eyebrow">Pagamento via Pix<\/p>[\s\S]*?<input type="email" id="pxE" placeholder="voce@email.com" style="width:100%">`\}/,
   replace: "<div class=\"phead\"><div><p class=\"eyebrow\">Test checkout</p><h3 id=\"pxT\">${label}</h3></div><button class=\"btn btn-ghost btn-sm\" id=\"pxX\" type=\"button\" aria-label=\"Close\">Close</button></div>\n    <div class=\"phead\"><span class=\"mono\" style=\"font-size:28px;font-weight:700\">${window.RK_INTL.report}</span><span class=\"muted\">one-time payment</span></div>\n    <div id=\"pxBody\">\n      <p class=\"note\" style=\"margin:8px 0\">This preview has no live checkout. The button below simulates an approved card payment in the Stripe sandbox flow. No card is charged.</p>" },
 { find: "      <p class=\"note\" style=\"margin-top:8px\">Este código Pix não é válido e nenhum valor é cobrado. O e-mail não é enviado nem guardado.</p>\n", replace: "      <p class=\"note\" style=\"margin-top:8px\">Test environment only. Nothing is charged and no data is sent.</p>\n" },
 { find: "  let left=600;pixTimer=setInterval(()=>{left--;const e=$('#pxTm');if(!e){clearInterval(pixTimer);return}e.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');if(left<=0){clearInterval(pixTimer);e.textContent='expirado'}},1000);\n", replace: '' },
 { find: "  $('#pxCp').onclick=async()=>{try{await navigator.clipboard.writeText(code);toast('Código Pix copiado')}catch(e){$('#pxC').select();toast('Selecione e copie o código')}};\n", replace: '' },
 { find: '<span>Confirmando com o banco…</span>', replace: '<span>Confirming the test payment…</span>' },

 // ---------- RUN e SURF ainda não têm versão em inglês: sem convite cruzado; rodapé sem páginas em português ----------
 { find: /const testeTambem=\(\)=>`[\s\S]*?<\/div><\/section>`;/, replace: "const testeTambem=()=>'';" },
 { find: /    <a href="\.\.\/guias\/racket\/">Como escolher raquete de tênis<\/a>[^\n]*\n/, replace: '    <a href="/en/terms/">Terms of Use</a><span aria-hidden="true"> · </span><a href="/en/privacy/">Privacy Policy</a><span aria-hidden="true"> · </span><a href="mailto:hi@sportdna.com.br">Contact</a><span aria-hidden="true"> · </span><a href="/racket/" hreflang="pt-BR" lang="pt-BR">Português</a><span aria-hidden="true"> · </span>\n' },
 { find: '<a class="tag" href="../"', replace: '<a class="tag" href="/"' },

 // ---------- garantia: sem citar o Código de Defesa do Consumidor (lei brasileira); política em inglês pendente ----------
 { find: '<p class="note"><strong>Garantia de 7 dias:</strong> não gostou, devolvemos o valor pago, como prevê o artigo 49 do Código de Defesa do Consumidor (<a href="../termos/" style="color:inherit">termos</a>). O cálculo já foi feito: o pagamento só revela o resultado. Se houver link de compra, ele aparece depois, e a recomendação não muda por isso.</p>',
   replace: '<p class="note"><strong>7-day money-back guarantee:</strong> not happy with your report? Email us within 7 days of purchase and we will refund what you paid. The analysis is already done: paying only reveals the result.</p>' },
 { find: "'<p class=\"note\"><strong>Garantia de 7 dias:</strong> não gostou, devolvemos o valor pago (artigo 49 do Código de Defesa do Consumidor). Escreva para <a href=\"mailto:hi@sportdna.com.br\" style=\"color:inherit\">hi@sportdna.com.br</a> com o e-mail da compra.</p>'",
   replace: "'<p class=\"note\"><strong>7-day money-back guarantee:</strong> not happy with your report? Within 7 days of purchase, email <a href=\"mailto:hi@sportdna.com.br\" style=\"color:inherit\">hi@sportdna.com.br</a> from the address you paid with and we will refund you.</p>'" },
 { find: "${hv?'acima':'abaixo'}", replace: "${hv?'above':'below'}", n: -1 },

 { find: "t===2?(x?(a.usd?'~':'')+'R$ '+fmt(x[0]):'—')", replace: "t===2?(x?'~'+window.RK_INTL.money(x[0]):'—')" },
 { find: "t===2?(y?(b.usd?'~':'')+'R$ '+fmt(y[0]):'—')", replace: "t===2?(y?'~'+window.RK_INTL.money(y[0]):'—')" },
 // pedido salvo: valor em dólar, formato em inglês
 { find: "(pay.amount/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})", replace: "window.RK_INTL.report" },
 { find: "same(d,n)?'hoje':same(d,y)?'ontem':'em '+d.toLocaleDateString('pt-BR')", replace: "same(d,n)?'today':same(d,y)?'yesterday':'on '+d.toLocaleDateString(window.RK_INTL.lang)" },

 { find: /'pt-BR'/g, replace: 'window.RK_INTL.lang', n: -1 },

 { find: "<span>linha ${esc(P.l.replace(/^\\S+ /,''))}</span>", replace: "<span>${esc(P.l.replace(/^\\S+ /,''))} line</span>" },
 { find: "if(Math.abs(b.wt-a.wt)>=5)d.push(`${Math.abs(b.wt-a.wt)} g mais ${b.wt>a.wt?'pesada':'leve'}`);", replace: "if(Math.abs(b.wt-a.wt)>=5)d.push(`${Math.abs(b.wt-a.wt)} g ${b.wt>a.wt?'heavier':'lighter'}`);" },
 { find: "const hist=[sev?`dor ${sev}`:''", replace: "const hist=[sev?`${sev} pain`:''" },
 { find: "const who=`Jogador ${lv} de ${EXAMPLE.age} anos${EXAMPLE.arm==='past'?', já teve dor '+jt:''}${cur?' e joga com uma '+esc(cur.name):''}.`;",
   replace: "const who=`A ${EXAMPLE.age}-year-old ${lv} player${EXAMPLE.arm==='past'?' who has had pain '+jt:''}${cur?(EXAMPLE.arm==='past'?' and':'')+' who plays with a '+esc(cur.name):''}.`;" },

 // ---------- dados: nome de geração em inglês ----------
 { find: /8ª geração/g, replace: '8th Gen', n: -1 },
];

/* cliente de checkout (assets/payments/client.js) → cópia em inglês, só cartão (Stripe sandbox) e USD */
export const client = [
 { find: "const money=amount=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(amount/100);", replace: "const money=amount=>window.RK_INTL?.report||new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount/100);" },
 { find: "  return !!info&&Number.isSafeInteger(order.amount)&&(order.provider==='promo'?order.amount===0:order.amount===info.amount||(order.discount!==undefined&&order.amount===discounted(info.amount,order.discount)));",
   replace: " return !!info&&Number.isSafeInteger(order.amount)&&order.provider==='stripe'&&order.amount===info.amount&&order.currency===info.currency&&(!order.market||order.market===window.RK_INTL?.market);" },
 { find: "function emailButton(pending,fresh){\n  if(!pending.product.endsWith('-report'))return;", replace: "function emailButton(pending,fresh){\n  return; /* intl: envio por e-mail ainda só em português (pendência) */" },
 { find: " function sendReportEmail(){\n", replace: " function sendReportEmail(){\n  return Promise.resolve(false); /* intl: e-mail do relatório só em português */\n" },
 { find: "for(const [provider,title,sub,icon] of [['mercadopago','Pix','Aprovação na hora, pelo app do seu banco',ICON.pix],['stripe','Cartão de crédito ou débito','Pagamento seguro pela Stripe',ICON.card]]){", replace: "for(const [provider,title,sub,icon] of [['stripe','Cartão de crédito ou débito','Pagamento seguro pela Stripe',ICON.card]]){" },
 { find: "  let method='mercadopago';const optBtns=[];", replace: "  let method='stripe';const optBtns=[];" },
 { find: "body:JSON.stringify({id:p.id,token:p.token,product,provider,meta:window.BTWMetaConsent?.context(),", replace: "body:JSON.stringify({id:p.id,token:p.token,product,provider,market:window.RK_INTL?.market,meta:window.BTWMetaConsent?.context()," },
 // sem código promocional na versão de teste (o servidor recusa promo para o produto internacional)
 { find: "det.append(promoLbl,row);body.append(det);", replace: 'det.append(promoLbl,row);' },
 { find: "  select('mercadopago');optBtns[0].focus();return true;", replace: "  select('stripe');optBtns[0].focus();return true;" },
];
