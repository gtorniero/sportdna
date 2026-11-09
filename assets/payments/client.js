(()=>{
 'use strict';
 const config=window.SPORTDNA_PAYMENTS||{mode:'off',api:''};
 const test=config.mode==='test';
 const enabled=['test','live'].includes(config.mode)&&(/^https:\/\/[a-z0-9.-]+(?::\d+)?$/.test(config.api)||/^http:\/\/127\.0\.0\.1:\d+$/.test(config.api));
 const key='sportdna-'+config.mode+'-checkout-v1';let app=null,dialog=null,timer=null,busy=false,verifiedOrder=null;
 const productInfo=product=>config.products?.[product];
 const fieldStyle='box-sizing:border-box;display:block;width:100%;min-height:48px;padding:12px 14px;font:inherit;font-size:16px;border:1.5px solid #6B7F87;border-radius:12px;background:var(--surface,#fff);color:var(--ink,#111);margin-top:6px';
 const actionStyle='box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px';
 const money=amount=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(amount/100);
 function validAmount(order){
  const info=productInfo(order.product);
  return !!info&&Number.isSafeInteger(order.amount)&&(order.provider==='promo'?order.amount===0:order.amount===info.amount);
 }
 function summary(body,product,amount){
  const info=productInfo(product);if(!info)throw new Error('Produto indisponível. Atualize a página.');
  const text=document.createElement('p');text.id='payment-product-summary';
  text.textContent=info.name+' · '+money(amount??info.amount)+' · pagamento único';
  text.style.cssText='margin:0;padding:12px 14px;border:1px solid var(--line,#6B7F87);border-radius:12px;background:var(--surface,#fff);font-weight:700;line-height:1.4';
  body.append(text);
 }

 const get=()=>{try{return JSON.parse(sessionStorage.getItem(key+':'+app?.name)||'null')}catch{return null}};
 const save=x=>sessionStorage.setItem(key+':'+app?.name,JSON.stringify(x));
 const random=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function api(path,options={}) {
  const response=await fetch(config.api+path,{...options,headers:{'Content-Type':'application/json',...options.headers},cache:'no-store',signal:AbortSignal.timeout(18000)});
  const data=await response.json();if(!response.ok) throw new Error(data.error||'Não foi possível confirmar o pagamento.');return data;
 }
 function close(){clearTimeout(timer);if(dialog){dialog.close();dialog.remove();dialog=null}}
 function panel(title,intro=''){
  close();
  dialog=document.createElement('dialog');
  dialog.style.cssText='box-sizing:border-box;width:calc(100% - 32px);max-width:460px;max-height:calc(100% - 32px);border:1px solid var(--line,#777);border-radius:18px;padding:clamp(18px,5vw,24px);background:var(--bg,#fff);color:var(--ink,#111)';
  dialog.innerHTML='<h2 id="paymentTitle" tabindex="-1" style="font-size:22px;margin:0;line-height:1.2"></h2>'+
   '<p id="paymentIntro" style="margin:6px 0 0;line-height:1.45"></p>'+
   '<div id="paymentBody" style="display:grid;gap:12px;margin-top:16px"></div>'+
   '<div id="paymentStatus" role="status" aria-live="polite"></div>'+
   '<button type="button" class="btn btn-ghost" id="paymentClose" style="margin-top:16px">Fechar</button>';
  dialog.setAttribute('aria-labelledby','paymentTitle');
  const heading=dialog.querySelector('#paymentTitle');
  const note=dialog.querySelector('#paymentIntro');
  heading.textContent=title;
  note.textContent=test?'Ambiente de teste. Nenhum valor será cobrado.':intro;
  note.hidden=!note.textContent;
  document.body.append(dialog);
  dialog.showModal();
  heading.focus({preventScroll:true});
  dialog.querySelector('#paymentClose').onclick=close;
  dialog.addEventListener('cancel',()=>clearTimeout(timer));
  return dialog.querySelector('#paymentBody');
 }
 function message(text){if(dialog)dialog.querySelector('#paymentStatus').textContent=text}
 async function check(){
  const pending=get();if(!pending||!app||pending.app!==app.name)return;
  try {
   const order=await api('/orders/'+pending.id,{headers:{Authorization:'Bearer '+pending.token}});
   if(order.product!==pending.product||order.mode!==config.mode||!validAmount(order))throw new Error('Produto ou valor diferente da oferta. Nenhum acesso foi liberado; consulte o suporte antes de pagar.');
   if(order.state==='paid'){
    const current=get();
    if(current?.id!==pending.id)return false;
    verifiedOrder=current.id;
    app.restore(current.answers);app.unlock(current.product,current.revised===true);close();emailButton(current);
    try{await window.SportDNAMeasure?.purchase?.(order)}catch{/* Medição opcional não bloqueia acesso. */}return true;
   }
   if(['invalid','revoked','expired'].includes(order.state)){message('O pagamento não foi aprovado. Nenhum acesso foi liberado.');return false}
   message('Aguardando confirmação do pagamento…');
   if(dialog?.open)timer=setTimeout(check,6000);return false;
  }catch(e){message(e.message);return false}
 }
 function emailButton(pending){
  if(!pending.product.endsWith('-report'))return;
  const report=document.querySelector('#report');if(!report||report.hidden||document.querySelector('#sportdna-email-report'))return;
  const button=document.createElement('button');button.id='sportdna-email-report';button.type='button';button.className='btn btn-go';button.textContent='Enviar relatório ao e-mail da compra';
  const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  // O botão fica fora do relatório para preservar o PDF e seu conteúdo original.
  const actions=document.createElement('aside');actions.hidden=report.hidden;actions.append(button,status);report.after(actions);
  new MutationObserver(()=>{actions.hidden=report.hidden}).observe(report,{attributes:true,attributeFilter:['hidden']});
  button.onclick=()=>{
   const body=panel('Enviar relatório por e-mail');
   const notice=document.createElement('p');notice.textContent='Enviaremos o conteúdo deste relatório ao e-mail informado no pagamento.';body.append(notice);
   const send=document.createElement('button');send.type='button';send.className='btn btn-go';send.textContent='Confirmar envio';body.append(send);
   send.onclick=async()=>{
    send.disabled=true;message('Enviando relatório…');
    try{await api('/orders/'+pending.id+'/email',{method:'POST',headers:{Authorization:'Bearer '+pending.token},body:JSON.stringify({report:report.innerText})});status.textContent='Relatório enviado ao e-mail da compra. Confira também o spam.';}
    catch(e){status.textContent=e.message}finally{message(status.textContent);send.disabled=false}
   };
  };
 }
 function pendingPanel(order){
  const product=order.product||get()?.product;
  if(order.product&&!validAmount(order))throw new Error('O valor retornado é diferente da oferta. Atualize a página antes de pagar.');
  const body=panel('Confirmar pagamento','O acesso é liberado após a confirmação.');
  summary(body,product,order.amount);
  if(order.checkoutUrl){
   const link=document.createElement('a');link.className='btn btn-go';link.textContent='Pagar com cartão';
   if(!order.checkoutUrl.startsWith('https://checkout.stripe.com/'))throw new Error('Endereço de checkout inválido.');
   link.href=order.checkoutUrl;body.append(link);
  }else if(order.pixCode){
   if(order.pixImage&&/^[A-Za-z0-9+/=]+$/.test(order.pixImage)){const img=document.createElement('img');img.src='data:image/png;base64,'+order.pixImage;img.alt='QR Code Pix';img.style.cssText='max-width:220px;width:100%;display:block;margin:auto';body.append(img)}
   const label=document.createElement('label');label.textContent='Pix — copia e cola';
   const input=document.createElement('textarea');input.readOnly=true;input.value=order.pixCode;input.style.cssText='box-sizing:border-box;display:block;width:100%;min-height:48px;padding:12px 14px;font:inherit;font-size:16px;border:1.5px solid #6B7F87;border-radius:12px;background:var(--surface,#fff);color:var(--ink,#111);min-height:96px;margin:8px 0 12px';label.append(input);body.append(label);
   const copy=document.createElement('button');copy.type='button';copy.className='btn btn-pri';copy.textContent='Copiar Pix';copy.onclick=async()=>{try{await navigator.clipboard.writeText(order.pixCode);message('Código Pix copiado.')}catch{input.select();message('Selecione e copie o código.')}};body.append(copy);
  }
  const button=document.createElement('button');button.type='button';button.className='btn btn-pri';button.textContent='Consultar pagamento';button.onclick=()=>{clearTimeout(timer);check()};body.append(button);check();
 }
 function open(product){
  if(!enabled)return false;
  if(!productInfo(product)){panel('Pagamento indisponível');message('Não conseguimos carregar esta oferta. Atualize a página antes de pagar.');return true;}
  const body=panel('Como deseja pagar?','O acesso é liberado após a confirmação.');
  summary(body,product);
  const label=document.createElement('label');
  label.textContent='E-mail (obrigatório para Pix ou código promocional)';
  const email=document.createElement('input');
  email.type='email';email.autocomplete='email';email.required=true;
  email.style.cssText=fieldStyle;
  label.append(email);
  body.append(label);
  const methodButtons=document.createElement('div');
  methodButtons.style.cssText='display:grid;gap:8px';
  body.append(methodButtons);
  const methods=[
   ['stripe','Cartão','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'],
   ['mercadopago','Pix','<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM21 15v2M15 21h2m4-2v2h-2"/>']
  ];
  for(const [provider,text,icon] of methods){
   const button=document.createElement('button');
   button.type='button';button.className='btn btn-go';
   button.textContent=text;
   const symbol=document.createElement('span');
   symbol.setAttribute('aria-hidden','true');
   symbol.style.cssText='display:flex;order:-1';
   symbol.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+icon+'</svg>';
   button.append(symbol);
   button.style.cssText=actionStyle;
   button.onclick=async()=>{
    if(busy)return;if(provider==='mercadopago'&&!email.reportValidity())return;
    busy=true;body.querySelectorAll('button').forEach(b=>b.disabled=true);message('Preparando pagamento…');
    try{
     const current=get();const p=current?.app===app.name&&current.product===product&&current.provider===provider?current:{id:crypto.randomUUID(),token:random(),app:app.name,product,provider,answers:app.snapshot()};
     save(p);const order=await api('/orders',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,provider,meta:window.BTWMetaConsent?.context(),...(provider==='mercadopago'?{email:email.value}:{})})});
     try{await window.SportDNAMeasure?.checkout?.(order)}catch{/* Medição opcional não bloqueia checkout. */}pendingPanel(order);
    }catch(e){message(e.message);body.querySelectorAll('button').forEach(b=>b.disabled=false)}finally{busy=false}
   };methodButtons.append(button);
  }
  const promoBox=document.createElement('div');
  promoBox.style.cssText='display:grid;gap:8px;padding-top:12px;border-top:1px solid var(--line,#6B7F87)';
  const promoLabel=document.createElement('label');
  promoLabel.textContent='Código promocional';
  const promo=document.createElement('input');
  promo.autocomplete='off';promo.maxLength=80;promo.style.cssText=fieldStyle;
  promoLabel.append(promo);
  const apply=document.createElement('button');
  apply.type='button';apply.className='btn btn-ghost';apply.textContent='Aplicar código e liberar grátis';
  apply.style.cssText=actionStyle;
  promoBox.append(promoLabel,apply);
  body.append(promoBox);
  apply.onclick=async()=>{
   if(busy)return;if(!email.reportValidity())return;
   if(!promo.value.trim()){message('Digite o código promocional.');promo.focus();return}
   busy=true;body.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{
    const p={id:crypto.randomUUID(),token:random(),app:app.name,product,provider:'promo',answers:app.snapshot()};
    const order=await api('/promos/redeem',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,email:email.value,codigo:promo.value})});
    if(order.state!=='paid'||order.provider!=='promo'||order.amount!==0)throw new Error('Código não confirmado.');
    save(p);await check();
   }catch(e){message(e.message)}finally{busy=false;body.querySelectorAll('button').forEach(b=>b.disabled=false)}
  };
  return true;
 }
 function saveRevision(product){
  const pending=get();
  if(!pending||pending.id!==verifiedOrder||pending.product!==product||pending.revised)return false;
  try{save({...pending,answers:app.snapshot(),revised:true});return true}catch{return false}
 }
 window.SportDNAPayments={enabled,open,saveRevision,register(options){app=options;if(!enabled)return;const p=get();if(p?.app===app.name){app.restore(p.answers);check().then(paid=>{if(!paid&&new URLSearchParams(location.search).has('payment'))pendingPanel({})})}}};
})();
