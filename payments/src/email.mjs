import {catalog,digest} from './security.mjs';
const error=(status,message)=>{throw Object.assign(new Error(message),{status})};
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Enviado ao e-mail da compra logo após o pagamento confirmado (e no reenvio pedido pela pessoa).
// O relatório não é persistido: o banco guarda somente controle de reenvio.
// PDF opcional: nome simples .pdf e conteúdo base64 que começa com %PDF; até ~5,5 MB.
export function pdfAttachment(pdf){
 if(!pdf)return null;
 const filename=String(pdf.filename||''),content=String(pdf.data||'');
 if(!/^[a-z0-9-]{1,80}\.pdf$/.test(filename)||!/^JVBER[A-Za-z0-9+/]+={0,2}$/.test(content)||content.length>7500000)error(400,'PDF inválido.');
 return {filename,content};
}
// Link para abrir o relatório em qualquer navegador: pedido + token na consulta e respostas no fragmento (#), que não chega ao servidor.
export function resumeLink(order,token,resume){
 if(!resume)return null;
 const path=catalog[order.product]?.path;
 if(typeof resume!=='string'||!/^[A-Za-z0-9_-]{2,8000}$/.test(resume)||!/^[0-9a-f]{64}$/.test(String(token||''))||!path||path.includes('/'))return null;
 return 'https://sportdna.com.br/'+path+'/?retomar='+order.id+'.'+token+'#r='+resume;
}
export async function sendReport(env,order,text,pdf,resume,token) {
 if(!env.RESEND_KEY)error(503,'Envio por e-mail ainda indisponível.');
 if(!order.product.endsWith('-report')||!catalog[order.product])error(400,'Este produto não é um relatório.');
 if(order.state!=='paid')error(403,'Confirme o pagamento antes de enviar o relatório.');
 const email=String(order.recipientEmail||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))error(409,'O pagamento não informou um e-mail para entrega.');
 if(typeof text!=='string'||text.trim().length<20||text.length>70000)error(400,'O relatório está vazio ou é muito grande.');
 const attachment=pdfAttachment(pdf),link=resumeLink(order,token,resume);
 const report=text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').trim();
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS report_emails (order_id TEXT PRIMARY KEY, attempted_at INTEGER NOT NULL)').run();
 const now=Date.now();
 const lock=await env.DB.prepare('INSERT INTO report_emails(order_id,attempted_at) VALUES (?,?) ON CONFLICT(order_id) DO UPDATE SET attempted_at=excluded.attempted_at WHERE report_emails.attempted_at < ? RETURNING order_id').bind(order.id,now,now-120000).first();
 if(!lock)error(429,'Aguarde dois minutos antes de reenviar o relatório.');
 const title=catalog[order.product].name;
 let response;
 try {
  response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_KEY,'Content-Type':'application/json','Idempotency-Key':'sportdna-report-'+order.id+'-'+await digest(report)},body:JSON.stringify({from:env.EMAIL_DE||'SPORT DNA <hi@sportdna.com.br>',reply_to:'hi@sportdna.com.br',to:[email],subject:title+(order.mode==='test'?' · teste':''),...(attachment?{attachments:[attachment]}:{}),text:title+'\n\n'+(attachment?'Seu relatório completo está em anexo, em PDF. Abaixo, o texto do relatório.\n\n':'')+(link?'Para abrir o relatório de novo em qualquer navegador: '+link+'\nGuarde este e-mail e não compartilhe o link: ele abre o seu relatório.\n\n':'')+report+'\n\nhttps://sportdna.com.br',html:'<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><h1>'+escape(title)+'</h1>'+(attachment?'<p><b>Seu relatório completo está em anexo, em PDF.</b> Abaixo, o texto do relatório.</p>':'')+(link?'<p><a href="'+escape(link)+'" style="display:inline-block;padding:12px 18px;background:#0E4D64;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold">Abrir meu relatório</a></p><p style="color:#555;font-size:13px">O botão abre o relatório em qualquer navegador. Guarde este e-mail e não compartilhe o link.</p>':'')+'<div style="white-space:pre-wrap">'+escape(report)+'</div><p><a href="https://sportdna.com.br">SPORT DNA</a></p></div>'}),signal:AbortSignal.timeout(12000)});
 }catch {error(502,'Não foi possível confirmar o envio. Aguarde dois minutos e tente novamente.');}
 if(!response.ok)error(502,'Não foi possível confirmar o envio. Aguarde dois minutos e tente novamente.');
 const receipt=await response.json().catch(()=>null);
 if(typeof receipt?.id!=='string'||!receipt.id)error(502,'O provedor não confirmou o identificador do envio.');
 return {sent:true,emailId:receipt.id};
}
