import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {paginas} from '../templates/paginas.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),s.replace(/[ \t]+$/gm,''))};
const config=JSON.parse(read('seo.config.json'));
const site=new URL(config.siteUrl);
if(site.protocol!=='https:' || site.search || site.hash || !site.pathname.endsWith('/')) throw Error('siteUrl must be an HTTPS directory URL');
const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:''});return elements.get(id)};
const window={ML_BUILD:true,ML_SHOTS:{racket:'assets/reports/racket.webp',board:'assets/reports/board.webp',tenis:'assets/reports/tenis.webp'}};
const ctx=vm.createContext({window,document:{getElementById:element},matchMedia:()=>({matches:false})});
for(const file of ['raquete','tenis','prancha'])vm.runInContext(read(`content/${file}.js`),ctx,{filename:file});
vm.runInContext(read('assets/site.js'),ctx,{filename:'site.js'});
// Preços do Product/Offer e das descrições vêm do mesmo arquivo do checkout (conferido contra o servidor em tests/payment-prices.test.mjs).
vm.runInContext(read('assets/payments/config.js'),ctx,{filename:'config.js'});
const PRODUCTS=window.SPORTDNA_PAYMENTS.products;
const A=window.ML_ARTICLES, api=window.ML_BUILD_API;
const routes=config.routes;
for(const a of A)if(!routes['a-'+a.id])throw Error('Missing stable route for '+a.id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
const absolute=p=>new URL(p,site).href;
const price=product=>'R$ '+(PRODUCTS[product].amount/100).toFixed(2).replace('.',',');
const text=s=>s.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const CHROME=['brandHome','footBrand','nav','footTests','footGuides','footLinks'];
/* Catálogo do RACKET DNA lido do próprio app: os guias de compra nunca têm ficha ou preço digitados à mão. */
const RACKET=read('racket/index.html');
const grab=name=>{const m=new RegExp(`const ${name}=/\\*${name}\\*/(.*?);\\n`).exec(RACKET);if(!m)throw Error('RACKET DNA: '+name+' não encontrado');return JSON.parse(m[1])};
const CATALOG=grab('CATALOG'),PRECO=grab('PRECO');
const num=n=>Math.round(n).toLocaleString('pt-BR');
function rk(name){
 const i=CATALOG.findIndex(r=>`${r.brand} ${r.model}`===name);
 if(i<0)throw Error('Raquete fora do catálogo do RACKET DNA: '+name);
 const r=CATALOG[i],p=PRECO[i];
 if(!p)throw Error('Raquete sem preço no catálogo: '+name);
 const est=new Set(r.est||[]),star=k=>est.has(k)?'*':'';
 // n = lojas brasileiras com oferta; sem loja (n:0), o catálogo guarda a estimativa de importada
 const brl=v=>'R$\u00a0'+num(v);
 const preco=p.n>0?(p.min===p.max?brl(p.min):`${brl(p.min)} a ${brl(p.max)}`):`cerca de ${brl(p.min)}`;
 const lojas=p.n>0?(p.n===1?'1 loja':`${p.n} lojas`):'importada';
 return {...r,nome:name,ano:/\b20\d\d\b/.test(r.model)||!r.year?null:r.year,est:est.size>0,preco,lojas,
  t:{wt:`${r.wt} g${star('wt')}`,head:`${r.head} pol²${star('head')}`,ra:`${r.ra} RA${star('ra')}`,pat:`${r.pat}${star('pat')}`,sw:`${r.sw}${star('sw')}`,bal:`${r.bal} mm${star('bal')}`}};
}
const BR=CATALOG.map((_,i)=>PRECO[i]).filter(p=>p&&p.n>0),MIDS=BR.map(p=>(p.min+p.max)/2).sort((a,b)=>a-b);
const quartil=f=>Math.round(MIDS[Math.floor(f*(MIDS.length-1))]/10)*10;
const PAGES=paginas({esc,rk,price,num,
 go:key=>`href="#${key}" data-go="${key}"`,
 icon:s=>api.ICON.racket(s),mark:s=>api.MARK.racket(s),byline:(d,soAtualizado)=>api.byline(d,soAtualizado),
 dateBR:d=>d.split('-').reverse().join('/'),shotH:api.SHOT_H.racket,catalogo:api.AREAS.racket.facts[0][0],
 quartis:{n:BR.length,q25:quartil(.25),q75:quartil(.75),min:Math.min(...BR.map(p=>p.min))},
 notaEst:'* Estimado a partir de outra versão da mesma linha.'});
function links(html,prefix){
 html=html.replace(/href="#[^"]*" data-go="([^"]+)"/g,(_,key)=>`href="${prefix}${routes[key]??''}" data-go="${key}"`);
 return html.replace(/(href|src)="((?:assets|apps|content|ferramentas|racket|surf|run)\/[^"\s]*)"/g,(_,attr,p)=>`${attr}="${prefix}${p}"`);
}
/* lastmod e datas dos artigos: seo.dates.json guarda um resumo do conteúdo de cada página.
   Só quando o conteúdo muda a data de modificação passa a ser a do build (SEO_TODAY permite fixar). */
const DATES='seo.dates.json';
const dates=fs.existsSync(path.join(ROOT,DATES))?JSON.parse(read(DATES)):{};
const today=process.env.SEO_TODAY||new Date().toISOString().slice(0,10);
if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('SEO_TODAY must be YYYY-MM-DD');
function stamp(route,content){
 const hash=createHash('sha256').update(content).digest('hex').slice(0,16);
 const d=dates[route]||(dates[route]={published:today,modified:today,hash});
 if(d.hash!==hash){d.hash=hash;d.modified=today}
 return d;
}
// prévia de link: JPEG 1200×630 com os 3 apps (WhatsApp corta mal WebP e imagem em pé)
const OG_HOME='assets/og/sportdna-3-apps.jpg';
const OG_ALT='SPORT DNA: cards de resultado do RACKET DNA, SURF DNA e RUN DNA';
const ORG=absolute('')+'#organization', WEBSITE=absolute('')+'#website';
const LOGO=absolute('assets/brand/png/sportdna-simbolo-cor.png');
const AREA_OF={prancha:'board',raquete:'racket',tenis:'tenis'};
const HUB={board:'guias/surf/',racket:'guias/racket/',tenis:'guias/run/'};
const APP_ROUTE={board:'surf/',racket:'racket/',tenis:'run/'};
const REPORT={board:'surf-report',racket:'racket-report',tenis:'run-report'};
const PRODUCT_TEXT={racket:'Relatório completo do RACKET DNA: a raquete de tênis que combina com o seu jogo e o seu braço, com a explicação de cada especificação. Prévia grátis antes de pagar.',board:'Relatório completo do SURF DNA: tipo, medidas e litragem da prancha de surf para o seu nível e o seu mar. Prévia grátis antes de pagar.',tenis:'Relatório completo do RUN DNA: o tênis de corrida para o seu corpo, ritmo e objetivo, com ficha técnica e custo por km. Prévia grátis antes de pagar.'};
// Título: até ~60 caracteres, busca principal antes da marca. Sem seoTitle, a marca só entra se couber.
const articleTitle=a=>a.seoTitle||((a.title+' | SPORT DNA').length<=60?a.title+' | SPORT DNA':a.title);
// Descrição: até ~155 caracteres, cortada no fim de uma palavra.
const clip=(s,n=155)=>s.length<=n?s:s.slice(0,s.lastIndexOf(' ',n-1)).replace(/[,;:.]$/,'')+'…';
function metadata({title,description,url,type='website',article=null,crumbs=[],extra=[],date=null,og=[OG_HOME,OG_ALT],pageType='WebPage'}){
 const [ogImage,ogAlt]=og;
 const graph=[
  {'@type':'Organization','@id':ORG,name:'SPORT DNA',url:absolute(''),logo:{'@type':'ImageObject',url:LOGO,width:512,height:512},email:'hi@sportdna.com.br',parentOrganization:{'@type':'Organization',name:'Beyond the Work',url:'https://www.beyondthework.com.br/'}},
  {'@type':'WebSite','@id':WEBSITE,name:'SPORT DNA',url:absolute(''),inLanguage:'pt-BR',publisher:{'@id':ORG}},
  {'@type':pageType,'@id':url+'#webpage',url,name:title,description,inLanguage:'pt-BR',isPartOf:{'@id':WEBSITE},primaryImageOfPage:absolute(ogImage),...(date?{dateModified:date.modified}:{})}];
 if(article)graph.push({'@type':'Article','@id':url+'#article',headline:article.title,description:article.dek,inLanguage:'pt-BR',mainEntityOfPage:{'@id':url+'#webpage'},image:absolute(OG_HOME),datePublished:date.published,dateModified:date.modified,author:{'@id':ORG},publisher:{'@id':ORG},articleSection:api.AREAS[AREA_OF[article.area]].sport,keywords:(article.tags||[]).join(', '),...(article.sources?{citation:article.sources.map(s=>s.url)}:{})});
 graph.push(...extra);
 if(crumbs.length)graph.push({'@type':'BreadcrumbList',itemListElement:[['Início',absolute('')],...crumbs].map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))});
 return `<title>${esc(title)}</title>\n<meta name="description" content="${esc(description)}">\n<link rel="canonical" href="${url}">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:site_name" content="SPORT DNA">\n<meta property="og:type" content="${type}">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(description)}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${absolute(ogImage)}">\n<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="${esc(ogAlt)}">\n${type==='article'&&date?`<meta property="article:published_time" content="${date.published}">\n<meta property="article:modified_time" content="${date.modified}">\n`:''}<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(description)}">\n<meta name="twitter:image" content="${absolute(ogImage)}">\n<meta name="twitter:image:alt" content="${esc(ogAlt)}">\n<script type="application/ld+json">${json({'@context':'https://schema.org','@graph':graph})}</script>`;
}
// Página do teste ("teste: qual X escolher") e guia ("guia completo") disputam buscas diferentes.
const descriptions={
 inicio:'Testes com prévia grátis e guias para escolher raquete de tênis, prancha de surf e tênis de corrida pelo seu corpo, nível e estilo.',
 board:'Guia completo para escolher prancha de surf: tipos, litragem, medidas, rabeta e quilhas, com artigos para cada etapa e o teste SURF DNA.',
 racket:'Guia completo para escolher raquete de tênis: peso, balanço, cabeça, cordas e grip, com artigos para cada nível e o teste RACKET DNA.',
 tenis:'Guia completo para escolher tênis de corrida: amortecimento, drop, encaixe, durabilidade e troca, com artigos e o teste RUN DNA.',
 blog:'Guias para escolher pranchas de surf, raquetes de tênis e tênis de corrida. Entenda volume, medidas, materiais e os compromissos de cada escolha.',
 privacidade:'O que o SPORT DNA guarda, o que mede com o seu aceite (Google e Meta), cookies, pagamento por Stripe e Mercado Pago e links de afiliados.'};
const titles={
 inicio:'Testes para escolher raquete, prancha e tênis | SPORT DNA',
 board:'Como escolher prancha de surf: guia completo | SPORT DNA',
 racket:'Como escolher raquete de tênis: guia completo | SPORT DNA',
 tenis:'Como escolher tênis de corrida: guia completo | SPORT DNA',
 blog:'Guias de raquete, prancha e tênis de corrida | SPORT DNA',
 privacidade:'Privacidade e afiliados | SPORT DNA'};
// ícone da aba: símbolo SPORT DNA no site, ícone de cada app nos testes
const icons=(prefix,name)=>`<link rel="icon" type="image/svg+xml" href="${prefix}assets/brand/svg/${name}.svg">\n<link rel="icon" type="image/png" sizes="512x512" href="${prefix}assets/brand/png/${name}.png">\n<link rel="apple-touch-icon" href="${prefix}assets/brand/png/${name}.png">`;
const sitemap=[];
for(const view of ['inicio','board','racket','tenis','blog','privacidade',...A.map(a=>'a-'+a.id)]){
 const route=routes[view], prefix='../'.repeat(route.split('/').filter(Boolean).length)||'./';
 const a=A.find(a=>'a-'+a.id===view);
 let body,date=null;
 if(a){date=stamp(route,JSON.stringify(a));window.ML_DATE=date;body=api.article(a.id);delete window.ML_DATE}
 else if(['board','racket','tenis'].includes(view)){body=api.hub(view);api.fillHub(view);body=body.replace('<div class="grid-a" id="hubGrid"></div>',`<div class="grid-a" id="hubGrid">${element('hubGrid').innerHTML}</div>`)}
 else if(view==='blog'){body=api.library();api.fillLib();body=body.replace('<div id="libBody"></div>',`<div id="libBody">${element('libBody').innerHTML}</div>`)}
 else body=view==='privacidade'?api.privacy():api.home();
 const url=absolute(route);if(!date)date=stamp(route,body);
 let html=read('templates/site.html').replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'');
 const crumbs=a?[[api.AREAS[AREA_OF[a.area]].name,absolute(HUB[AREA_OF[a.area]])],[a.title,url]]:view==='inicio'?[]:[[{board:'SURF DNA',racket:'RACKET DNA',tenis:'RUN DNA',blog:'Blog',privacidade:'Privacidade e afiliados'}[view],url]];
 html=html.replace('</head>',metadata({title:a?articleTitle(a):titles[view],description:a?clip(a.dek):descriptions[view],url,type:a?'article':'website',article:a,crumbs,date})+'\n'+icons(prefix,'sportdna-simbolo-cor')+'\n</head>');
 html=html.replace('<main id="app" tabindex="-1"></main>',`<main id="app" tabindex="-1">${body}</main>`);
 for(const id of CHROME)html=html.replace(new RegExp(`(<(?:a|div|nav)[^>]*id="${id}"[^>]*>)(<\\/(?:a|div|nav)>)`),(_,open,close)=>open+element(id).innerHTML+close);
 html=links(html,prefix);
 const files=a?[a.area]:({board:['prancha'],racket:['raquete'],tenis:['tenis'],privacidade:[]}[view]||['raquete','tenis','prancha']);
 const scripts=files.map(f=>`<script defer src="${prefix}content/${f}.js"></script>`).join('\n');
 html=html.replace('<!-- SITE_SCRIPTS -->',`<script>window.ML_ROOT=${json(prefix)};window.ML_VIEW=${json(view)};window.ML_ROUTES=${json(routes)};window.ML_SHOTS=${json(window.ML_SHOTS)};${a?`window.ML_DATE=${json({published:date.published,modified:date.modified})};`:''}</script>\n${scripts}\n<script defer src="${prefix}assets/site.js"></script>`);
 write(route+'index.html',html);sitemap.push([url,date.modified]);
}
/* Guias de compra e páginas institucionais (templates/paginas.mjs): HTML pronto, sem renderização no navegador. */
for(const pg of PAGES){
 const view=pg.key,route=routes[view];if(route===undefined)throw Error('Missing stable route for '+view);
 const prefix='../'.repeat(route.split('/').filter(Boolean).length)||'./';
 const url=absolute(route);
 // a data entra no HTML, então o resumo usa uma versão com data fixa
 const date=stamp(route,JSON.stringify([pg.title,pg.description,pg.body({published:'0000-00-00',modified:'0000-00-00'})]));
 const body=pg.body(date);
 const crumbs=pg.guia?[['RACKET DNA',absolute(HUB.racket)],[pg.crumb,url]]:[[pg.crumb,url]];
 const extra=[];
 if(pg.guia){
  extra.push({'@type':'Article','@id':url+'#article',headline:pg.headline,description:pg.description,inLanguage:'pt-BR',mainEntityOfPage:{'@id':url+'#webpage'},image:absolute(pg.og[0]),datePublished:date.published,dateModified:date.modified,author:{'@id':ORG},publisher:{'@id':ORG},articleSection:'Raquete de tênis',keywords:pg.keywords,...(pg.citation?{citation:pg.citation}:{})});
  extra.push({'@type':'ItemList','@id':url+'#raquetes',name:'Raquetes citadas no guia',numberOfItems:pg.itemList.length,itemListElement:pg.itemList.map((name,i)=>({'@type':'ListItem',position:i+1,name}))});
 }
 if(pg.faq)extra.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:pg.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:text(a)}}))});
 let html=read('templates/site.html').replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'');
 html=html.replace('</head>',metadata({title:pg.title,description:pg.description,url,type:pg.guia?'article':'website',crumbs,extra,date,...(pg.og?{og:pg.og}:{}),...(pg.pageType?{pageType:pg.pageType}:{})})+'\n'+icons(prefix,'sportdna-simbolo-cor')+'\n</head>');
 html=html.replace('<main id="app" tabindex="-1"></main>',`<main id="app" tabindex="-1">${body}</main>`);
 for(const id of CHROME)html=html.replace(new RegExp(`(<(?:a|div|nav)[^>]*id="${id}"[^>]*>)(<\\/(?:a|div|nav)>)`),(_,open,close)=>open+element(id).innerHTML+close);
 html=links(html,prefix);
 html=html.replace('<!-- SITE_SCRIPTS -->',`<script>window.ML_ROOT=${json(prefix)};window.ML_VIEW=${json(view)};window.ML_ROUTES=${json(routes)};window.ML_SHOTS=${json(window.ML_SHOTS)};window.ML_STATIC=true;</script>\n<script defer src="${prefix}assets/site.js"></script>`);
 write(route+'index.html',html);sitemap.push([url,date.modified]);
}
// Existing interactive pages retain their engines and layouts; only metadata changes.
const strip=html=>html.replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->\n?/g,'');
const TOOLS={litragem:'ferramentas/litragem/',grip:'ferramentas/grip/'};
for(const app of ['board','racket','tenis','litragem','grip']){
 const tool=!!TOOLS[app];
 const route=tool?TOOLS[app]:APP_ROUTE[app];
 let html=strip(read(route+'index.html'));
 // Remove inherited document titles from the body; keep SVG titles untouched.
 html=html.replace(/(<body[^>]*>\s*)<title>[^<]*<\/title>/, '$1');
 html=html.replace(/<head>([\s\S]*?)<\/head>/,(_,head)=>'<head>'+head.replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'')+'</head>');
 const url=absolute(route),date=stamp(route,html);
 const name=app==='litragem'?'Calculadora de litragem':app==='grip'?'Tamanho do grip':api.AREAS[app].name;
 const title=app==='grip'?'Tamanho do grip da raquete: meça a mão | SPORT DNA':app==='litragem'?'Calculadora de litragem de prancha de surf | SPORT DNA':({board:'Teste: qual prancha de surf escolher? | SURF DNA',racket:'Teste: qual raquete de tênis escolher? | RACKET DNA',tenis:'Teste: qual tênis de corrida escolher? | RUN DNA'}[app]);
 const description=app==='grip'?'Meça a mão com uma régua e descubra o grip da sua raquete de tênis, de L1 a L5, com polegadas e milímetros. Grátis e sem cadastro.':app==='litragem'?'Estime uma faixa de volume de prancha pelo peso, nível e tipo. Explore a fórmula e use o resultado como referência para conversar com seu shaper.':({board:`Faça o teste SURF DNA para explorar tipos, medidas e volume de prancha. Prévia grátis e relatório completo por ${price('surf-report')}.`,racket:`Faça o teste RACKET DNA para comparar seu perfil com as raquetes do catálogo. Prévia grátis e relatório completo por ${price('racket-report')}.`,tenis:`Faça o teste RUN DNA e explore tênis de corrida para seu perfil de treino. Prévia grátis e relatório completo por ${price('run-report')}.`}[app]);
 const extra=[];
 if(tool){
  // FAQPage só com as perguntas visíveis na própria página.
  const faq=/<div class="faq">([\s\S]*?)<\/div>/.exec(html)?.[1]||'';
  const qa=[...faq.matchAll(/<details><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(m=>({'@type':'Question',name:text(m[1]),acceptedAnswer:{'@type':'Answer',text:text(m[2])}}));
  if(qa.length)extra.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:qa});
 }else{
  const product=REPORT[app],info=PRODUCTS[product];
  extra.push({'@type':'Product','@id':url+'#product',name:info.name,description:PRODUCT_TEXT[app],category:'Teste de equipamento esportivo',brand:{'@type':'Brand',name:'SPORT DNA'},image:absolute(`assets/reports/${app}.webp`),url,offers:{'@type':'Offer',url,price:(info.amount/100).toFixed(2),priceCurrency:'BRL',availability:'https://schema.org/InStock',seller:{'@id':ORG}}});
 }
 html=html.replace('</head>',`<!-- SEO_START -->\n${metadata({title,description,url,crumbs:[[tool?name:'Teste '+name,url]],extra,date})}\n${icons(tool?'../../':'../',{board:'surfdna-icone',racket:'racketdna-icone',tenis:'rundna-icone',litragem:'surfdna-icone',grip:'racketdna-icone'}[app])}\n<!-- SEO_END -->\n</head>`);
 // Replace legacy home hash links with canonical paths without changing app actions.
 html=html.replace(/href="\.\.\/\.\.\/(?:index\.html)?#(a-[^"\s]+|blog|board|racket|tenis|privacidade)"/g,(_,key)=>`href="../../${routes[key]||''}"`);
 write(route+'index.html',html);sitemap.push([url,date.modified]);
}
write(DATES,JSON.stringify(Object.fromEntries(Object.entries(dates).sort(([a],[b])=>a.localeCompare(b))),null,1)+'\n');
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(([url,mod])=>`  <url><loc>${esc(url)}</loc><lastmod>${mod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n`);
write('404.html',`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="icon" type="image/svg+xml" href="${site.pathname}assets/brand/svg/sportdna-simbolo-cor.svg"><link rel="stylesheet" href="${site.pathname}assets/site.css"><title>Página não encontrada | SPORT DNA</title></head><body><main id="app" tabindex="-1"><section><div class="wrap"><h1>Página não encontrada</h1><p>Confira o endereço, <a href="${site.pathname}">volte ao início</a> ou veja os <a href="${site.pathname}blog/">guias do blog</a>.</p></div></section></main><footer><div class="wrap f-base"><span class="f-links"><a href="${site.pathname}sobre/">Sobre</a> · <a href="${site.pathname}como-ganhamos-dinheiro/">Como ganhamos dinheiro</a> · <a href="${site.pathname}contato/">Contato</a> · <a href="${site.pathname}termos/">Termos de uso</a> · <a href="${site.pathname}privacidade/">Privacidade e afiliados</a></span><a class="btw" href="https://www.beyondthework.com.br" target="_blank" rel="noopener" aria-label="Um projeto Beyond the Work"><svg class="btw-sym" viewBox="0 0 120 120" aria-hidden="true"><line x1="46" y1="34" x2="110" y2="34" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="28" y1="60" x2="110" y2="60" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="10" y1="86" x2="110" y2="86" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg><span class="btw-txt"><small>Um projeto</small><b>Beyond the Work</b></span></a></div></footer><script src="${site.pathname}assets/measurement.js" defer></script></body></html>`);
console.log(`Generated ${sitemap.length} canonical pages, sitemap, robots and 404. Site: ${site.href}`);
