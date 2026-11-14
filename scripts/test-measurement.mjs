import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
function bridge(file, brand, path) {
 const scripts=[],calls=[],handlers={};const parent={postMessage(){}};
 const window={addEventListener(n,f){handlers[n]=f}};
 const context={window,parent,location:{origin:'https://'+brand+'.com.br'},document:{head:{appendChild(s){scripts.push(s.src)}},createElement(){return {}}},URLSearchParams,Number};
 vm.runInNewContext(readFileSync(file,'utf8'),context);
 const send=(data,origin=context.location.origin,source=parent)=>handlers.message({data,origin,source});
 const prefix=brand==='quiddo'?'qd':'sd';
 const events=()=>window.dataLayer.filter(x=>x[0]==='event');
 send({type:prefix+'_init',analytics:true,marketing:true},'https://evil.invalid');assert.equal(scripts.length,0,'forged message initializes nothing');
 send({type:prefix+'_init',analytics:true,marketing:true});assert.equal(scripts.length,2);
 // Consent Mode v2: padrão negado antes de qualquer update ou config.
 const consent=window.dataLayer.filter(x=>x[0]==='consent').map(x=>Array.from(x));
 assert.equal(consent[0][1],'default');for(const k of ['ad_storage','ad_user_data','ad_personalization','analytics_storage'])assert.equal(consent[0][2][k],'denied',k);
 assert.equal(consent[1][1],'update');assert.equal(consent[1][2].analytics_storage,'granted');assert.equal(consent[1][2].ad_personalization,'denied');
 assert(window.dataLayer.findIndex(x=>x[0]==='consent')<window.dataLayer.findIndex(x=>x[0]==='config'),'consent before config');
 send({type:prefix+'_measure',event:'page_view',path:'/host/ABCD',params:{email:'secret@example.com'}});assert.equal(events().length,0,'private path rejected');
 send({type:prefix+'_measure',event:'page_view',path,params:{email:'secret@example.com',nome:'Private Name'},campaign:'?utm_source=instagram&token=secret&utm_term=secret%40example.com',referrer:'https://www.google.com/search?q=secret'});
 const event=Array.from(events().at(-1));assert.equal(event[0],'event');assert.equal(event[1],'page_view');const text=JSON.stringify(event);assert(!text.includes('secret'));assert(!text.includes('Private Name'));assert(text.includes('utm_source=instagram'));
 assert.equal(event[2].page_location,'https://sportdna.com.br'+path+'?utm_source=instagram','canonical host');assert.equal(event[2].page_referrer,'','full referrer URL rejected');
 send({type:prefix+'_measure',event:'page_view',path,referrer:'https://www.google.com/'});assert.equal(events().at(-1)[2].page_referrer,'https://www.google.com/','referrer origin kept');
 const pageView=Array.from(window.fbq.queue.filter(x=>x[2]==='PageView').at(-1));assert.equal(pageView[3].page_path,path);assert.equal(pageView[3].content_category,'racket');
 const count=events().length;
 send({type:prefix+'_measure',event:'purchase',path,params:{transaction_id:'QD-SECRET',value:25,currency:'BRL',plano:'mensal'}});assert.equal(events().length,count,'access code cannot become transaction id');
 // Artigo do blog: caminho próprio; texto livre fora do padrão continua rejeitado.
 send({type:prefix+'_measure',event:'page_view',path:'/blog/litragem-como-entender-o-volume-da-prancha/'});assert.equal(events().at(-1)[2].page_location,'https://sportdna.com.br/blog/litragem-como-entender-o-volume-da-prancha/');
 send({type:prefix+'_measure',event:'page_view',path:'/blog/Nome Privado/'});assert.equal(events().length,count+1);
 send({type:prefix+'_measure',event:'page_view',path:'/ferramentas/litragem/'});assert.equal(events().length,count+2,'calculator measured');
 // Revogação vira update negado no Google e revoke na Meta.
 send({type:prefix+'_consent',analytics:false,marketing:false});
 const revoked=Array.from(window.dataLayer.filter(x=>x[0]==='consent').at(-1));assert.equal(revoked[1],'update');assert.equal(revoked[2].analytics_storage,'denied');assert.equal(revoked[2].ad_storage,'denied');
 assert(window.fbq.queue.some(x=>x[0]==='consent'&&x[1]==='revoke'));
 send({type:prefix+'_measure',event:'page_view',path});assert.equal(events().length,count+2,'nothing after revocation');
 const noScripts=[],noHandlers={};const noWindow={addEventListener(n,f){noHandlers[n]=f}};const noParent={postMessage(){}};
 vm.runInNewContext(readFileSync(file,'utf8'),{...context,window:noWindow,parent:noParent,document:{head:{appendChild(x){noScripts.push(x)}},createElement(){return {}}}});
 noHandlers.message({origin:context.location.origin,source:noParent,data:{type:prefix+'_init',analytics:false,marketing:false}});assert.equal(noScripts.length,0,'refusal loads no SDK');
 console.log(file+': privacy and consent checks passed');
}

bridge('assets/measurement-vendor.js','sportdna','/racket/');
