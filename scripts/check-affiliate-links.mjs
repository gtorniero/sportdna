// Links-only maintenance through the supported integrated-browser client.
// Check stock on the product route. Customer CTAs must retain official affiliateUrl.
// This inspection never certifies commission attribution or rewrites affiliateUrl.
export async function checkBatch(tab,offers,{start=0,limit=20}={}){
 const results=[];let failures=0,cursor=start;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 for(;cursor<Math.min(offers.length,start+limit);cursor++){
  const o=offers[cursor];try{
   if(!o.purchaseUrl)throw Error('Missing direct purchase route');
   const expected=new URL(o.purchaseUrl);
   await tab.goto(o.purchaseUrl);
   if(o.evidenceTitle)try{await tab.playwright.getByRole('heading',{name:o.evidenceTitle,exact:true}).innerText({timeout:5000});}catch{}
   const actual=new URL(await tab.url());
   const titles=await tab.playwright.getByRole('heading').evaluateAll(es=>es.filter(e=>e.tagName==='H1').map(e=>e.innerText));
   const title=titles.join(' '),n=norm(title),saved=norm(o.evidenceTitle);
   const samePath=expected.hostname===actual.hostname&&expected.pathname===actual.pathname;
   const social=/\/social\//.test(actual.pathname)||actual.hostname==='meli.la';
   const genderOK=o.gender==='male'?!/\bfeminin/.test(n):o.gender==='female'?!/\bmasculin/.test(n):true;
   const identityOK=!!saved&&(n===saved||n.includes(saved));
   const snapshot=await tab.playwright.domSnapshot();
   const unavailable=/Este produto est[áa] indispon[íi]vel|An[úu]ncio pausado|Publica[çc][ãa]o pausada|Produto esgotado/i.test(snapshot);
   const buyable=/button \"Comprar agora/.test(snapshot);
   const status=unavailable?'unavailable':!social&&samePath&&identityOK&&genderOK&&buyable?'verified':'needs_review';
   results.push({id:o.id,model:o.model,gender:o.gender,status,observedTitle:title,availability:unavailable?'unavailable':buyable?'buy_button_present':'unconfirmed',directRoute:!social,checkedAt:status==='verified'?new Date().toISOString():null});failures=0;
  }catch(e){results.push({id:o.id,status:'not_verified',reason:String(e).slice(0,140)});failures++;if(failures>=2){cursor++;break}}
 }
 return {results,nextCursor:cursor,complete:cursor>=offers.length,blocked:failures>=2};
}
