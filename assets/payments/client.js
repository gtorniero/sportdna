(()=>{
 'use strict';
 const config=window.SPORTDNA_PAYMENTS||{mode:'off',api:''};
 const test=config.mode==='test';
 const enabled=['test','live'].includes(config.mode)&&(/^https:\/\/[a-z0-9.-]+(?::\d+)?$/.test(config.api)||/^http:\/\/127\.0\.0\.1:\d+$/.test(config.api));
 const key='sportdna-'+config.mode+'-checkout-v1';let app=null,dialog=null,timer=null,busy=false;
 const get=()=>{try{return JSON.parse(sessionStorage.getItem(key+':'+app?.name)||'null')}catch{return null}};
 const save=x=>sessionStorage.setItem(key+':'+app?.name,JSON.stringify(x));
 const random=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function api(path,options={}) {
  const response=await fetch(config.api+path,{...options,headers:{'Content-Type':'application/json',...options.headers},cache:'no-store',signal:AbortSignal.timeout(18000)});
  const data=await response.json();if(!response.ok) throw new Error(data.error||'Não foi possível confirmar o pagamento.');return data;
 }
 function close(){clearTimeout(timer);if(dialog){dialog.close();dialog.remove();dialog=null}}
 function panel(title){
  close();dialog=document.createElement('dialog');dialog.style.cssText='border:1px solid var(--line,#777);border-radius:18px;padding:24px;max-width:460px;width:calc(100% - 32px);background:var(--bg,#fff);color:var(--ink,#111)';
  dialog.innerHTML='<h2 id="paymentTitle" style="font-size:22px"></h2><p>'+(test?'Ambiente de teste — nenhum valor será cobrado.':'Pagamento único. O relatório é liberado após a confirmação.')+'</p><div id="paymentBody"></div><p id="paymentStatus" role="status" aria-live="polite"></p><button type="button" class="btn btn-ghost" id="paymentClose">Fechar</button>';
  dialog.setAttribute('aria-labelledby','paymentTitle');dialog.querySelector('h2').textContent=title;document.body.append(dialog);dialog.showModal();
  dialog.querySelector('#paymentClose').onclick=close;dialog.addEventListener('cancel',()=>clearTimeout(timer));return dialog.querySelector('#paymentBody');
 }
 function message(text){if(dialog)dialog.querySelector('#paymentStatus').textContent=text}
 async function check(){
  const pending=get();if(!pending||!app||pending.app!==app.name)return;
  try {
   const order=await api('/orders/'+pending.id,{headers:{Authorization:'Bearer '+pending.token}});
   if(order.product!==pending.product||order.mode!==config.mode)throw new Error('Pedido incompatível com este relatório.');
   if(order.state==='paid'){
    app.restore(pending.answers);app.unlock(pending.product);close();emailButton(pending);return true;
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
  const body=panel('Confirmar pagamento');
  if(order.checkoutUrl){
   const link=document.createElement('a');link.className='btn btn-go';link.textContent='Pagar com cartão';
   if(!order.checkoutUrl.startsWith('https://checkout.stripe.com/'))throw new Error('Endereço de checkout inválido.');
   link.href=order.checkoutUrl;body.append(link);
  }else if(order.pixCode){
   if(order.pixImage&&/^[A-Za-z0-9+/=]+$/.test(order.pixImage)){const img=document.createElement('img');img.src='data:image/png;base64,'+order.pixImage;img.alt='QR Code Pix';img.style.cssText='max-width:220px;width:100%;display:block;margin:auto';body.append(img)}
   const label=document.createElement('label');label.textContent='Pix — copia e cola';
   const input=document.createElement('textarea');input.readOnly=true;input.value=order.pixCode;input.style.width='100%';label.append(input);body.append(label);
   const copy=document.createElement('button');copy.type='button';copy.className='btn btn-pri';copy.textContent='Copiar Pix';copy.onclick=async()=>{try{await navigator.clipboard.writeText(order.pixCode);message('Código Pix copiado.')}catch{input.select();message('Selecione e copie o código.')}};body.append(copy);
  }
  const button=document.createElement('button');button.type='button';button.className='btn btn-pri';button.textContent='Consultar pagamento';button.onclick=()=>{clearTimeout(timer);check()};body.append(button);check();
 }
 function open(product){
  if(!enabled)return false;
  const body=panel('Como deseja pagar?');
  const label=document.createElement('label');label.textContent='Seu e-mail (para Pix ou código promocional)';const email=document.createElement('input');email.type='email';email.autocomplete='email';email.style.cssText='width:100%;margin:8px 0 16px';label.append(email);body.append(label);
  for(const [provider,text] of [['stripe','Cartão — Stripe'],['mercadopago','Pix — Mercado Pago']]){
   const button=document.createElement('button');button.type='button';button.className='btn btn-go';button.textContent=text;button.style.cssText='width:100%;margin-bottom:10px';
   button.onclick=async()=>{
    if(busy)return;if(provider==='mercadopago'&&(!email.value||!email.checkValidity())){email.reportValidity();return}
    busy=true;body.querySelectorAll('button').forEach(b=>b.disabled=true);message('Preparando pagamento…');
    try{
     const current=get();const p=current?.app===app.name&&current.product===product&&current.provider===provider?current:{id:crypto.randomUUID(),token:random(),app:app.name,product,provider,answers:app.snapshot()};
     save(p);const order=await api('/orders',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,provider,...(provider==='mercadopago'?{email:email.value}:{})})});pendingPanel(order);
    }catch(e){message(e.message);body.querySelectorAll('button').forEach(b=>b.disabled=false)}finally{busy=false}
   };body.append(button);
  }
  const promoLabel=document.createElement('label');promoLabel.textContent='Código promocional';
  const promo=document.createElement('input');promo.autocomplete='off';promo.maxLength=80;promo.style.cssText='width:100%;margin:8px 0 12px';promoLabel.append(promo);body.append(promoLabel);
  const apply=document.createElement('button');apply.type='button';apply.className='btn btn-pri';apply.textContent='Aplicar código e liberar grátis';apply.style.cssText='width:100%;margin-bottom:12px';body.append(apply);
  apply.onclick=async()=>{
   if(busy)return;if(!email.value||!email.checkValidity()){message('Informe seu e-mail para receber o acesso.');email.focus();return}
   if(!promo.value.trim()){message('Digite o código promocional.');promo.focus();return}
   busy=true;body.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{
    const p={id:crypto.randomUUID(),token:random(),app:app.name,product,provider:'promo',answers:app.snapshot()};
    const order=await api('/promos/redeem',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,email:email.value,codigo:promo.value})});
    if(order.state!=='paid'||order.provider!=='promo'||order.amount!==0)throw new Error('Código não confirmado.');
    save(p);await check();
   }catch(e){message(e.message)}finally{busy=false;body.querySelectorAll('button').forEach(b=>b.disabled=false)}
  };
  body.querySelector('button').focus();return true;
 }
 window.SportDNAPayments={enabled,open,register(options){app=options;if(!enabled)return;const p=get();if(p?.app===app.name){app.restore(p.answers);check().then(paid=>{if(!paid&&new URLSearchParams(location.search).has('payment'))pendingPanel({})})}}};
})();
