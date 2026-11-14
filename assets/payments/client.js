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
  const box=el('div','sp-sum');const left=el('div');
  const name=el('b',null,info.name);name.id='payment-product-summary';
  const note=el('small',null,'Pagamento único, sem assinatura');
  const price=el('span','sp-price',money(amount??info.amount));price.id='payment-product-price';
  left.append(name,note);box.append(left,price);body.append(box);
 }

 /* Pedido guardado no aparelho (localStorage) e na aba (sessionStorage).
    - Não pago: vale 24 h, o mesmo prazo do pedido no servidor. Quem fecha a aba e volta encontra o Pix ou o cartão pendente.
    - Pago: vale 1 dia, ou o que o app pedir em keepPaidDays (o RACKET guarda 90 dias para o reteste grátis).
    A cópia da aba marca "esta é a aba do pagamento": só ela reabre o relatório sozinha ao recarregar.
    Em outra visita o app mostra o cartão de retomada (saved) e a pessoa escolhe (resume).
    Nada aqui libera relatório: só check(), com o servidor dizendo "pago", chama unlock. */
 const DAY=86400000;
 const local=(()=>{try{return localStorage}catch{return null}})(),session=(()=>{try{return sessionStorage}catch{return null}})();
 const slot=()=>key+':'+app?.name;
 const days=(v,min,max,def)=>{const n=Number(v);return Number.isFinite(n)&&n>=min?Math.min(n,max):def};
 const keepPaid=()=>days(app?.keepPaidDays,1,365,1)*DAY;
 const alive=x=>{if(!x||typeof x!=='object'||typeof x.id!=='string'||typeof x.token!=='string')return false;const now=Date.now();if(Number.isFinite(x.paidAt))return now-x.paidAt<keepPaid();return !Number.isFinite(x.at)||now-x.at<DAY};
 const read=store=>{try{const x=JSON.parse(store?.getItem(slot())||'null');if(x&&!alive(x)){store.removeItem(slot());return null}return x}catch{return null}};
 const get=()=>read(local)||read(session);
 const tab=()=>!!read(session);
 const save=x=>{const v=JSON.stringify({...x,at:Number.isFinite(x.at)?x.at:Date.now()});let ok=false;for(const store of [local,session]){try{store.setItem(slot(),v);ok=true}catch{}}if(!ok)throw new TypeError('storage')};
 const forget=()=>{for(const store of [local,session]){try{store?.removeItem(slot())}catch{}}};
 // Respostas iguais com chaves em qualquer ordem: um pedido pendente só é reaproveitado para as mesmas respostas.
 const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
 const retestInfo=x=>{const d=days(app?.retestDays,1,365,0);if(!d||!Number.isFinite(x?.paidAt))return null;const until=x.paidAt+d*DAY;return {until,used:x.retested===true,available:x.retested!==true&&Date.now()<until}};
 const random=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
 // AbortSignal.timeout só existe a partir do Safari 16 (iPhone 6s/7 param no iOS 15) e crypto.randomUUID a partir do 15.4: sem elas o pedido nem saía do navegador.
 const uuid=()=>{if(typeof crypto.randomUUID==='function')return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)};
 const deadline=ms=>{if(typeof AbortSignal.timeout==='function')return AbortSignal.timeout(ms);const c=new AbortController();setTimeout(()=>c.abort(),ms);return c.signal};
 const fault=(message,category)=>Object.assign(new Error(message),{category});
 // Mesma regra do servidor (payments/src/worker.mjs): sem ponto depois do @ o Pix seria recusado lá.
 const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 async function api(path,options={}) {
  let response;
  try{response=await fetch(config.api+path,{...options,headers:{'Content-Type':'application/json',...options.headers},cache:'no-store',signal:deadline(18000)})}
  catch(e){throw ['TimeoutError','AbortError'].includes(e?.name)?fault('O pagamento demorou para responder. Confira sua conexão e tente de novo.','timeout'):fault('Sem conexão com o pagamento. Confira sua internet e tente de novo.','network')}
  // Erro do servidor pode vir sem JSON (página de erro da rede): status primeiro, texto em português sempre.
  let data=null;try{data=await response.json()}catch{}
  if(!response.ok)throw fault(typeof data?.error==='string'&&data.error?data.error:'Não foi possível confirmar o pagamento. Tente de novo em instantes.',response.status>=500?'unavailable':'rejected');
  if(!data||typeof data!=='object')throw fault('Resposta inesperada do pagamento. Tente de novo em instantes.','invalid_response');
  return data;
 }
 function close(){clearTimeout(timer);if(dialog){dialog.close();dialog.remove();dialog=null}}
 /* visual do checkout: usa as cores de cada app (--pri, --ball, --surface…) */
 const CSS='dialog.sdpay{border:0;border-radius:20px;padding:0;max-width:460px;width:calc(100% - 24px);max-height:calc(100dvh - 24px);overflow:auto;background:var(--bg,#fff);color:var(--ink,#111);box-shadow:0 20px 60px #0006;font-family:var(--f-body,inherit)}dialog.sdpay::backdrop{background:#0009}.sdpay *{box-sizing:border-box}.sdpay .sp-in{padding:20px 20px 16px}.sdpay .sp-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.sdpay h2{font:800 22px/1.15 var(--f-display,inherit);margin:4px 0 0}.sdpay .sp-x{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#111);font-size:22px;line-height:1;cursor:pointer}.sdpay .sp-sum{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:14px;background:var(--soft,#f2f2f2);margin:0 0 16px}.sdpay .sp-sum b{display:block;font-size:15px}.sdpay .sp-sum small{display:block;color:var(--muted,#555);font-size:13px;margin-top:2px}.sdpay .sp-price{font:800 24px/1 var(--f-display,inherit);white-space:nowrap}.sdpay .sp-lbl{display:block;font-weight:700;font-size:15px;margin:0 0 8px}.sdpay .sp-opts{display:grid;gap:10px;margin:0 0 16px}.sdpay .sp-opt{display:flex;align-items:center;gap:14px;width:100%;min-height:64px;padding:12px 14px;border-radius:14px;border:2px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#111);text-align:left;font:inherit;cursor:pointer}.sdpay .sp-opt[aria-pressed=true]{border-color:var(--pri,#0E4D64);box-shadow:0 0 0 1px var(--pri,#0E4D64) inset}.sdpay .sp-opt svg{flex:none;width:32px;height:32px}.sdpay .sp-opt b{display:block;font-size:16px}.sdpay .sp-opt small{display:block;color:var(--muted,#555);font-size:13px}.sdpay .sp-ck{margin-left:auto;flex:none;width:22px;height:22px;border-radius:50%;border:2px solid var(--line,#999)}.sdpay .sp-opt[aria-pressed=true] .sp-ck{border:7px solid var(--pri,#0E4D64)}.sdpay input,.sdpay textarea{display:block;width:100%;min-height:48px;padding:12px 14px;font:inherit;font-size:16px;border:1.5px solid #6B7F87;border-radius:12px;background:var(--surface,#fff);color:var(--ink,#111)}.sdpay .sp-hint{color:var(--muted,#555);font-size:13px;margin:6px 0 0}.sdpay .sp-field{margin:0 0 16px}.sdpay .sp-err{color:#B3261E;font-size:14px;font-weight:600;margin:6px 0 0}.sdpay .sp-cta{width:100%;min-height:52px;font-size:17px}.sdpay .sp-sec{width:100%;margin-top:10px}.sdpay details{margin-top:16px;border-top:1px solid var(--line,#ddd);padding-top:12px}.sdpay summary{cursor:pointer;font-weight:600;min-height:32px;display:flex;align-items:center;gap:8px}.sdpay .sp-row{display:flex;gap:8px;margin-top:10px}.sdpay .sp-row input{flex:1}.sdpay .sp-row button{flex:none}.sdpay .sp-safe{display:flex;align-items:center;gap:8px;margin:14px 0 0;color:var(--muted,#555);font-size:13px}.sdpay .sp-safe svg{flex:none;width:16px;height:16px}.sdpay #paymentStatus:empty{display:none}.sdpay #paymentStatus{margin:12px 0 0;font-weight:600}.sdpay .sp-steps{margin:0 0 14px;padding-left:20px;font-size:15px}.sdpay .sp-steps li{margin:4px 0}.sdpay .sp-qr{display:block;width:220px;max-width:100%;margin:0 auto 14px;border-radius:12px;background:#fff;padding:8px}.sdpay .sp-wait{display:flex;align-items:center;gap:10px;color:var(--muted,#555);font-size:14px;margin-top:12px}.sdpay .sp-dot{width:10px;height:10px;border-radius:50%;background:var(--pri,#0E4D64);animation:sdp 1.2s infinite}@keyframes sdp{50%{opacity:.25}}@media (prefers-reduced-motion:reduce){.sdpay .sp-dot{animation:none}}@media (max-width:520px){dialog.sdpay{width:100%;max-width:none;margin:auto 0 0;border-radius:20px 20px 0 0;max-height:94dvh}}';
 const ICON={
  pix:'<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#32BCAD" d="M23.3 22.6a3.6 3.6 0 0 1-2.6-1.1l-3.8-3.8a.7.7 0 0 0-1 0l-3.8 3.8a3.6 3.6 0 0 1-2.6 1.1h-.7l4.8 4.8a3.9 3.9 0 0 0 5.5 0l4.8-4.8zM9.5 9.4c1 0 1.9.4 2.6 1.1l3.8 3.8a.7.7 0 0 0 1 0l3.8-3.8a3.6 3.6 0 0 1 2.6-1.1h.4l-4.8-4.8a3.9 3.9 0 0 0-5.5 0L8.6 9.4z"/><path fill="#32BCAD" d="m27.4 13.3-2.9-2.9h-1.2c-.6 0-1.2.2-1.6.7l-3.8 3.8a1.9 1.9 0 0 1-2.7 0l-3.8-3.8c-.4-.4-1-.7-1.6-.7H8.4l-2.9 2.9a3.9 3.9 0 0 0 0 5.5l2.9 2.9h1.4c.6 0 1.2-.2 1.6-.7l3.8-3.8c.7-.7 2-.7 2.7 0l3.8 3.8c.4.4 1 .7 1.6.7h1.2l2.9-2.9a3.9 3.9 0 0 0 0-5.5z"/></svg>',
  card:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="7" width="26" height="18" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12.5h26" stroke="currentColor" stroke-width="3"/><path d="M7.5 20h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lock:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  tag:'<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 2h6l6 6-6 6-6-6z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5.5" cy="5.5" r="1.2" fill="currentColor"/></svg>'
 };
 function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
 function panel(title){
  close();if(!document.getElementById?.('sd-pay-css')&&document.head){const st=document.createElement('style');st.id='sd-pay-css';st.textContent=CSS;document.head.append(st)}
  dialog=document.createElement('dialog');dialog.className='sdpay';
  dialog.innerHTML='<div class="sp-in"><div class="sp-top"><h2 id="paymentTitle"></h2><button type="button" class="sp-x" id="paymentClose" aria-label="Fechar">×</button></div>'+(test?'<p class="sp-hint">Ambiente de teste: nenhum valor será cobrado.</p>':'')+'<div id="paymentBody"></div><p id="paymentStatus" role="status" aria-live="polite"></p><p class="sp-safe">'+ICON.lock+'<span>Pagamento seguro: cartão pela Stripe e Pix pelo Mercado Pago. Não guardamos dados do cartão.</span></p></div>';
  dialog.setAttribute('aria-labelledby','paymentTitle');dialog.querySelector('h2').textContent=title;document.body.append(dialog);dialog.showModal();
  dialog.querySelector('#paymentClose').onclick=close;dialog.addEventListener('cancel',()=>clearTimeout(timer));return dialog.querySelector('#paymentBody');
 }
 function message(text){if(dialog)dialog.querySelector('#paymentStatus').textContent=text}
 async function check(){
  const pending=get();if(!pending||!app||pending.app!==app.name)return;
  try {
   const order=await api('/orders/'+pending.id,{headers:{Authorization:'Bearer '+pending.token}});
   if(order.product!==pending.product||order.mode!==config.mode||!validAmount(order))throw new Error('Produto ou valor diferente da oferta. Nenhum acesso foi liberado; consulte o suporte antes de pagar.');
   if(order.state==='paid'){
    let current=get();
    if(current?.id!==pending.id)return false;
    // A compra só é medida perto do pagamento (24 h): abrir de novo semanas depois não vira outra Purchase.
    const fresh=!Number.isFinite(current.paidAt)||Date.now()-current.paidAt<DAY;
    if(!Number.isFinite(current.paidAt)){current={...current,paidAt:Date.now()};try{save(current)}catch{}}
    verifiedOrder=current.id;
    app.restore(current.answers);app.unlock(current.product,current.revised===true,{retested:current.retested===true,retest:retestInfo(current)});close();emailButton(current);
    if(fresh)try{await window.SportDNAMeasure?.purchase?.(order)}catch{/* Medição opcional não bloqueia acesso. */}return true;
   }
   if(['invalid','revoked','expired'].includes(order.state)&&!Number.isFinite(pending.paidAt))forget();
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
   const body=panel('Receber o relatório por e-mail');
   const notice=document.createElement('p');notice.textContent='Enviamos o texto deste relatório para o e-mail usado no pagamento.';notice.style.margin='0 0 14px';body.append(notice);
   const send=document.createElement('button');send.type='button';send.className='btn btn-go sp-cta';send.textContent='Enviar o relatório';body.append(send);
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
  if(order.checkoutUrl){
   if(!order.checkoutUrl.startsWith('https://checkout.stripe.com/'))throw new Error('Endereço de checkout inválido.');
   const body=panel('Pagar com cartão');summary(body,product,order.amount);
   const p=el('p',null,'Abrindo o pagamento seguro da Stripe, para cartão de crédito ou débito. Depois de pagar, você volta para cá e o relatório abre sozinho.');p.style.margin='0 0 14px';body.append(p);
   const link=el('a','btn btn-go sp-cta','Ir para o pagamento com cartão');link.href=order.checkoutUrl;link.style.display='flex';link.style.alignItems='center';link.style.justifyContent='center';body.append(link);
   try{if(typeof location.assign==='function')setTimeout(()=>location.assign(order.checkoutUrl),400)}catch{}
   check();return;
  }
  const body=panel(order.pixCode?'Pague com Pix':'Confirmar pagamento');
  summary(body,product,order.amount);
  if(order.pixCode){
   const steps=el('ol','sp-steps');for(const t of ['Abra o app do seu banco e escolha Pix.','Leia o QR Code ou use o Pix copia e cola.','Volte para esta tela: o relatório abre assim que o banco confirmar.'])steps.append(el('li',null,t));body.append(steps);
   if(order.pixImage&&/^[A-Za-z0-9+/=]+$/.test(order.pixImage)){const img=el('img','sp-qr');img.src='data:image/png;base64,'+order.pixImage;img.alt='QR Code do Pix';body.append(img)}
   const label=el('label','sp-lbl','Pix copia e cola');const input=document.createElement('textarea');input.readOnly=true;input.value=order.pixCode;input.id='paymentPixCode';input.rows=3;input.style.marginTop='6px';input.style.fontSize='14px';label.append(input);body.append(label);
   const copy=el('button','btn btn-go sp-cta','Copiar código Pix');copy.type='button';copy.style.marginTop='12px';copy.onclick=async()=>{try{await navigator.clipboard.writeText(order.pixCode);copy.textContent='Código copiado';message('Código Pix copiado. Cole no app do seu banco.')}catch{input.select();message('Selecione o código e copie.')}};body.append(copy);
   const wait=el('div','sp-wait');wait.append(el('span','sp-dot'),el('span',null,'Aguardando a confirmação do banco…'));body.append(wait);
  }
  const button=el('button','btn btn-ghost sp-sec','Já paguei: verificar agora');button.type='button';button.onclick=()=>{clearTimeout(timer);check()};body.append(button);check();
 }
 function open(product,options={}){
  if(!enabled)return false;
  if(!productInfo(product)){panel('Pagamento indisponível');message('Não conseguimos carregar esta oferta. Atualize a página antes de pagar.');return true;}
  const body=panel('Liberar o relatório');
  const measurement={position:options.position,example:options.example===true};
  try{void window.SportDNAMeasure?.checkoutOpen?.(product,measurement)}catch{/* Medição opcional. */}
  function checkoutError(category,provider){try{void window.SportDNAMeasure?.checkoutError?.(product,{...measurement,category,method:provider==='stripe'?'card':'pix'})}catch{/* Medição opcional. */}}
  summary(body,product);
  const price=money(productInfo(product).amount);
  // 1) forma de pagamento: Pix já vem marcado (o mais usado no Brasil)
  const lbl=el('p','sp-lbl','Como você quer pagar?');lbl.id='paymentMethodLabel';body.append(lbl);
  const opts=el('div','sp-opts');opts.setAttribute('role','group');opts.setAttribute('aria-labelledby','paymentMethodLabel');body.append(opts);
  let method='mercadopago';const optBtns=[];
  for(const [provider,title,sub,icon] of [['mercadopago','Pix','Aprovação na hora, pelo app do seu banco',ICON.pix],['stripe','Cartão de crédito ou débito','Pagamento seguro pela Stripe',ICON.card]]){
   const b=el('button','sp-opt');b.type='button';b.provider=provider;
   const ic=el('span');ic.innerHTML=icon;ic.style.display='flex';const txt=el('span');txt.append(el('b',null,title),el('small',null,sub));
   const ck=el('span','sp-ck');ck.setAttribute('aria-hidden','true');b.append(ic,txt,ck);
   b.onclick=()=>select(provider);optBtns.push(b);opts.append(b);
  }
  // 2) e-mail: só para o Pix (o comprovante e o acesso vão para ele); no cartão a Stripe pede
  const field=el('div','sp-field');const elbl=el('label','sp-lbl','Seu e-mail');elbl.htmlFor='paymentEmail';
  const email=document.createElement('input');email.type='email';email.id='paymentEmail';email.autocomplete='email';email.inputMode='email';email.placeholder='voce@email.com';email.setAttribute('aria-describedby','paymentEmailHint');
  const hint=el('p','sp-hint','Para enviar o comprovante e recuperar o acesso, se precisar.');hint.id='paymentEmailHint';
  const err=el('p','sp-err');err.id='paymentEmailErr';err.setAttribute('role','alert');
  field.append(elbl,email,hint,err);body.append(field);
  // 3) botão principal
  const cta=el('button','btn btn-go sp-cta');cta.type='button';cta.id='paymentGo';body.append(cta);
  function select(provider){
   method=provider;for(const b of optBtns)b.setAttribute('aria-pressed',String(b.provider===provider));
   field.hidden=provider!=='mercadopago'&&!promoOpen();err.textContent='';
   cta.textContent=provider==='mercadopago'?'Gerar Pix de '+price:'Pagar '+price+' com cartão';
  }
  const mail=()=>String(email.value||'').trim();
  const emailOk=()=>EMAIL.test(mail())&&(typeof email.checkValidity!=='function'||email.checkValidity());
  function needEmail(text){err.textContent=text;field.hidden=false;email.setAttribute('aria-invalid','true');email.focus()}
  cta.onclick=async()=>{
   const provider=method;if(busy)return;
   if(provider==='mercadopago'&&!emailOk()){needEmail('Digite um e-mail válido para gerar o Pix.');checkoutError('invalid_email',provider);return}
   email.removeAttribute?.('aria-invalid');err.textContent='';
   busy=true;cta.disabled=true;message(provider==='mercadopago'?'Gerando o Pix…':'Abrindo o pagamento com cartão…');
   try{
    const current=get(),answers=app.snapshot();const p=current?.app===app.name&&current.product===product&&current.provider===provider&&!Number.isFinite(current.paidAt)&&stable(current.answers)===stable(answers)?current:{id:uuid(),token:random(),app:app.name,product,provider,answers,at:Date.now()};
    save(p);const order=await api('/orders',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,provider,meta:window.BTWMetaConsent?.context(),...(provider==='mercadopago'?{email:mail()}:{})})});
    try{await window.SportDNAMeasure?.checkout?.(order)}catch{/* Medição opcional não bloqueia checkout. */}pendingPanel(order);
   }catch(e){
    // Falha de rede/servidor já vem classificada por api(); o resto é validação da resposta ou falha deste navegador.
    const category=e.category||(e instanceof TypeError||e instanceof ReferenceError?'client':'invalid_response');
    checkoutError(category,provider);message(category==='client'?'Não conseguimos abrir o pagamento neste navegador. Atualize a página ou tente em outro navegador.':e.message);cta.disabled=false
   }finally{busy=false}
  };
  // 4) código promocional, recolhido
  const det=document.createElement('details');const sum=document.createElement('summary');sum.innerHTML=ICON.tag+'<span>Tenho um código promocional</span>';det.append(sum);
  const promoLbl=el('label','sp-lbl','Código promocional');promoLbl.htmlFor='paymentPromo';promoLbl.style.marginTop='10px';
  const row=el('div','sp-row');const promo=document.createElement('input');promo.id='paymentPromo';promo.autocomplete='off';promo.maxLength=80;promo.setAttribute('autocapitalize','characters');
  const apply=el('button','btn btn-pri','Aplicar');apply.type='button';apply.id='paymentApply';row.append(promo,apply);det.append(promoLbl,row);body.append(det);
  const promoOpen=()=>!!det.open;
  det.addEventListener('toggle',()=>{if(det.open)field.hidden=false;else select(method)});
  apply.onclick=async()=>{
   if(busy)return;
   if(!emailOk()){needEmail('Digite seu e-mail para usar o código.');return}
   if(!promo.value.trim()){message('Digite o código promocional.');promo.focus();return}
   busy=true;apply.disabled=true;cta.disabled=true;message('Conferindo o código…');
   try{
    const p={id:uuid(),token:random(),app:app.name,product,provider:'promo',answers:app.snapshot()};
    const order=await api('/promos/redeem',{method:'POST',body:JSON.stringify({id:p.id,token:p.token,product,email:mail(),codigo:promo.value})});
    if(order.state!=='paid'||order.provider!=='promo'||order.amount!==0)throw new Error('Código não confirmado.');
    save(p);await check();
   }catch(e){message(e.message)}finally{busy=false;apply.disabled=false;cta.disabled=false}
  };
  select('mercadopago');optBtns[0].focus();return true;
 }
 /* kind 'edit': a correção única logo depois do pagamento (já existia).
    kind 'retest': refazer o teste uma vez dentro de retestDays depois do pagamento (RACKET: 90 dias), sem novo pagamento.
    As duas só valem para o pedido que o servidor acabou de confirmar como pago nesta página (verifiedOrder). */
 function saveRevision(product,kind='edit'){
  const pending=get();
  if(!pending||pending.id!==verifiedOrder||pending.product!==product)return false;
  if(kind==='retest'){if(!retestInfo(pending)?.available)return false;try{save({...pending,answers:app.snapshot(),retested:true,retestAt:Date.now()});return true}catch{return false}}
  if(pending.revised)return false;
  try{save({...pending,answers:app.snapshot(),revised:true});return true}catch{return false}
 }
 // Resumo do pedido guardado para o cartão "Seu resultado está salvo" (sem token nem id).
 function saved(){
  const p=get();if(!enabled||!app||p?.app!==app.name)return null;
  const paid=Number.isFinite(p.paidAt),at=Number.isFinite(p.at)?p.at:Date.now();
  return {product:p.product,provider:p.provider,state:paid?'paid':'pending',at,paidAt:paid?p.paidAt:null,expires:paid?p.paidAt+keepPaid():at+DAY,amount:productInfo(p.product)?.amount??null,answers:JSON.parse(JSON.stringify(p.answers||{})),retest:retestInfo(p)};
 }
 // Retomar pelo cartão: pago abre o relatório (depois de o servidor confirmar); pendente reabre o Pix ou o cartão.
 async function resume(){
  const p=get();if(!enabled||!app||p?.app!==app.name)return false;
  try{session?.setItem(slot(),JSON.stringify(p))}catch{}
  app.restore(p.answers);
  if(Number.isFinite(p.paidAt)){panel('Abrindo o seu relatório');message('Conferindo o pagamento…');return check()}
  panel('Retomar o pagamento');message('Conferindo o pedido…');
  try{
   const order=await api('/orders/'+p.id,{headers:{Authorization:'Bearer '+p.token}});
   if(order.product!==p.product||order.mode!==config.mode||!validAmount(order))throw new Error('Produto ou valor diferente da oferta. Nenhum acesso foi liberado; consulte o suporte antes de pagar.');
   if(order.state==='paid')return check();
   if(['invalid','revoked','expired'].includes(order.state)){forget();message('Este pagamento expirou e nada foi cobrado. Para liberar o relatório, gere um novo na prévia.');return false}
   pendingPanel(order);return false;
  }catch(e){message(e.message);return false}
 }
 window.SportDNAPayments={enabled,open,saveRevision,saved,resume,forget,register(options){app=options;if(!enabled)return;const p=get();if(p?.app!==app.name)return;const back=new URLSearchParams(location.search).has('payment');if(!tab()&&!back)return;app.restore(p.answers);check().then(paid=>{if(!paid&&back)pendingPanel({})})}};
})();
