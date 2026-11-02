(()=>{
 'use strict';
 const config=window.SPORTDNA_PAYMENTS||{mode:'off',api:''};
 const enabled=config.mode==='test'&&(/^https:\/\/[a-z0-9.-]+(?::\d+)?$/.test(config.api)||/^http:\/\/127\.0\.0\.1:\d+$/.test(config.api));
 const key='sportdna-test-checkout-v1';let app=null,dialog=null,timer=null,busy=false;
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
  dialog.innerHTML='<h2 id="paymentTitle" style="font-size:22px"></h2><p>Ambiente de teste — nenhum valor será cobrado.</p><div id="paymentBody"></div><p id="paymentStatus" role="status" aria-live="polite"></p><button type="button" class="btn btn-ghost" id="paymentClose">Fechar</button>';
  dialog.setAttribute('aria-labelledby','paymentTitle');dialog.querySelector('h2').textContent=title;document.body.append(dialog);dialog.showModal();
  dialog.querySelector('#paymentClose').onclick=close;dialog.addEventListener('cancel',()=>clearTimeout(timer));return dialog.querySelector('#paymentBody');
 }
 function message(text){if(dialog)dialog.querySelector('#paymentStatus').textContent=text}
 async function check(){
  const pending=get();if(!pending||!app||pending.app!==app.name)return;
  try {
   const order=await api('/orders/'+pending.id,{headers:{Authorization:'Bearer '+pending.token}});
   if(order.product!==pending.product||order.mode!=='test')throw new Error('Pedido incompatível com este relatório.');
   if(order.state==='paid'){
    app.restore(pending.answers);app.unlock(pending.product);close();return true;
   }
   if(['invalid','revoked','expired'].includes(order.state)){message('O pagamento não foi aprovado. Nenhum acesso foi liberado.');return false}
   message('Aguardando confirmação do pagamento de teste…');
   if(dialog?.open)timer=setTimeout(check,6000);return false;
  }catch(e){message(e.message);return false}
 }
 function pendingPanel(order){
  const body=panel('Confirmar pagamento de teste');
  if(order.checkoutUrl){
   const link=document.createElement('a');link.className='btn btn-go';link.textContent='Abrir checkout de teste';
   if(!order.checkoutUrl.startsWith('https://checkout.stripe.com/'))throw new Error('Endereço de checkout inválido.');
   link.href=order.checkoutUrl;body.append(link);
  }else if(order.pixCode){
   if(order.pixImage&&/^[A-Za-z0-9+/=]+$/.test(order.pixImage)){const img=document.createElement('img');img.src='data:image/png;base64,'+order.pixImage;img.alt='QR Code Pix de teste';img.style.cssText='max-width:220px;width:100%;display:block;margin:auto';body.append(img)}
   const label=document.createElement('label');label.textContent='Pix de teste — copia e cola';
   const input=document.createElement('textarea');input.readOnly=true;input.value=order.pixCode;input.style.width='100%';label.append(input);body.append(label);
   const copy=document.createElement('button');copy.type='button';copy.className='btn btn-pri';copy.textContent='Copiar Pix de teste';copy.onclick=async()=>{try{await navigator.clipboard.writeText(order.pixCode);message('Código de teste copiado.')}catch{input.select();message('Selecione e copie o código.')}};body.append(copy);
  }
  const button=document.createElement('button');button.type='button';button.className='btn btn-pri';button.textContent='Consultar pagamento';button.onclick=()=>{clearTimeout(timer);check()};body.append(button);check();
 }
 function open(product){
  if(!enabled)return false;
  const body=panel('Como deseja testar o pagamento?');
  const label=document.createElement('label');label.textContent='Seu e-mail (necessário para Pix)';const email=document.createElement('input');email.type='email';email.autocomplete='email';email.style.cssText='width:100%;margin:8px 0 16px';label.append(email);body.append(label);
  for(const [provider,text] of [['stripe','Checkout Stripe de teste'],['mercadopago','Pix Mercado Pago de teste']]){
   const button=document.createElement('button');button.type='button';button.className='btn btn-go';button.textContent=text;button.style.cssText='width:100%;margin-bottom:10px';
   button.onclick=async()=>{
    if(busy)return;if(provider==='mercadopago'&&(!email.value||!email.checkValidity())){email.reportValidity();return}
    busy=true;body.querySelectorAll('button').forEach(b=>b.disabled=true);message('Preparando pagamento de teste…');
    try{
     const current=get();const p=current?.app===app.name&&current.product===product&&current.provider===provider?current:{id:crypto.randomUUID(),token:random(),app:app.name,product,provider,answers:app.snapshot()};
     save(p);const order=await api('/orders',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,provider,...(provider==='mercadopago'?{email:email.value}:{})})});pendingPanel(order);
    }catch(e){message(e.message);body.querySelectorAll('button').forEach(b=>b.disabled=false)}finally{busy=false}
   };body.append(button);
  }
  body.querySelector('button').focus();return true;
 }
 window.SportDNAPayments={enabled,open,register(options){app=options;if(!enabled)return;const p=get();if(p?.app===app.name){app.restore(p.answers);check().then(paid=>{if(!paid&&new URLSearchParams(location.search).has('payment'))pendingPanel({})})}}};
})();
