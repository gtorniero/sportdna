// Run through the supported integrated-browser client. No AI API, payments or searches.
export async function checkBatch(tab,offers,{start=0,limit=20}={}){
 const results=[];let failures=0,cursor=start;
 const norm=s=>String(s).replace(/(\d)\s*[x×/]\s*(\d)/g,'$1 $2').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 for(;cursor<Math.min(offers.length,start+limit);cursor++){
  const o=offers[cursor];try{
   await tab.goto(o.affiliateUrl);
   await tab.playwright.getByRole('link',{name:'Ir para produto',exact:true}).innerText();
   const links=await tab.playwright.getByRole('main').getByRole('link').evaluateAll(es=>es.map(e=>({title:e.innerText,url:e.href})));
   const target=links.find(x=>x.title==='Ir para produto');
   if(!target)throw Error('No featured product');
   const expected=new URL(o.productUrl),actual=new URL(target.url);
   const feature=links.find(x=>x.title!=='Ir para produto'&&new URL(x.url).pathname===actual.pathname);
   const title=norm(feature?.title||'');
   const tokens=norm(o.model.replace(/8ª geração/g,'2026').replace(/\+/g,' plus ')).split(' ');
   const samePath=expected.pathname===actual.pathname;
   const sameItem=target.url.includes(o.id)||o.bindingType==='catalog'||o.bindingType==='product_group';
   const nameOK=tokens.every(t=>title.split(' ').includes(t));
   const genderOK=o.gender==='male'?!/\bfeminin/.test(title):o.gender==='female'?!/\bmasculin/.test(title):true;
   const status=samePath&&sameItem&&nameOK&&genderOK?'verified':'needs_review';
   results.push({id:o.id,model:o.model,gender:o.gender,status,observedTitle:feature?.title||'',checkedAt:status==='verified'?new Date().toISOString():null});failures=0;
  }catch(e){results.push({id:o.id,status:'not_verified',reason:String(e).slice(0,140)});failures++;if(failures>=2){cursor++;break}}
 }
 return {results,nextCursor:cursor,complete:cursor>=offers.length,blocked:failures>=2};
}
