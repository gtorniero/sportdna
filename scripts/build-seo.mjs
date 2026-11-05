import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
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
const A=window.ML_ARTICLES, api=window.ML_BUILD_API;
const routes=config.routes;
for(const a of A)if(!routes['a-'+a.id])throw Error('Missing stable route for '+a.id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
const absolute=p=>new URL(p,site).href;
function links(html,prefix){
 html=html.replace(/href="#[^"]*" data-go="([^"]+)"/g,(_,key)=>`href="${prefix}${routes[key]??''}" data-go="${key}"`);
 return html.replace(/(href|src)="((?:assets|apps|content|ferramentas|racket|surf|run)\/[^"\s]*)"/g,(_,attr,p)=>`${attr}="${prefix}${p}"`);
}
// prévia de link da home: JPEG 1200×630 com os 3 apps (WhatsApp corta mal WebP)
const OG_HOME='assets/og/sportdna-3-apps.jpg';
function metadata(title,description,url,image,type='website',article=null){
 const graph=[{'@type':'Organization','@id':absolute('')+'#organization',name:'SPORT DNA',url:absolute('')},{'@type':'WebSite','@id':absolute('')+'#website',name:'SPORT DNA',url:absolute(''),inLanguage:'pt-BR'}];
 graph.push({'@type':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'pt-BR',isPartOf:{'@id':absolute('')+'#website'}});
 if(article)graph.push({'@type':'Article',headline:article.title,description:article.dek,inLanguage:'pt-BR',mainEntityOfPage:url,author:{'@id':absolute('')+'#organization'},publisher:{'@id':absolute('')+'#organization'},...(article.sources?{citation:article.sources.map(s=>s.url)}:{})});
 if(url!==absolute(''))graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:absolute('')},...(article?[{'@type':'ListItem',position:2,name:'Blog',item:absolute(routes.blog)},{'@type':'ListItem',position:3,name:article.title,item:url}]:[{'@type':'ListItem',position:2,name:title,item:url}])]});
 return `<title>${esc(title)}</title>\n<meta name="description" content="${esc(description)}">\n<link rel="canonical" href="${url}">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:site_name" content="SPORT DNA">\n<meta property="og:type" content="${type}">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(description)}">\n<meta property="og:url" content="${url}">\n${image===OG_HOME?`<meta property="og:image" content="${absolute(image)}">\n<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="SPORT DNA: cards de resultado do RACKET DNA, SURF DNA e RUN DNA">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${absolute(image)}">`:`<meta property="og:image" content="${absolute(image)}">\n<meta property="og:image:alt" content="Exemplo de relatório SPORT DNA">\n<meta name="twitter:card" content="summary_large_image">`}\n<script type="application/ld+json">${json({'@context':'https://schema.org','@graph':graph})}</script>`;
}
const descriptions={inicio:'Testes grátis e guias para escolher raquete de tênis, prancha de surf e tênis de corrida pelo seu corpo, nível e estilo.',board:'Escolha sua prancha de surf com o SURF DNA. Explore tipos, volume e medidas e faça o teste grátis.',racket:'Encontre uma raquete de tênis para seu nível e estilo com o RACKET DNA. Faça o teste grátis.',tenis:'Escolha tênis de corrida para seu perfil com o RUN DNA. Compare características e faça o teste grátis.',blog:'Guias para escolher pranchas de surf, raquetes de tênis e tênis de corrida. Entenda volume, medidas, materiais e os compromissos de cada escolha.',privacidade:'Como o SPORT DNA processa respostas no navegador, pagamentos, envio de relatórios e links de afiliados.'};
const titles={inicio:'SPORT DNA | Escolha seu equipamento esportivo',board:'Qual prancha de surf escolher? SURF DNA',racket:'Qual raquete de tênis escolher? RACKET DNA',tenis:'Qual tênis de corrida escolher? RUN DNA',blog:'Blog SPORT DNA | Guias de equipamentos esportivos',privacidade:'Privacidade e afiliados | SPORT DNA'};
// ícone da aba: símbolo SPORT DNA no site, ícone de cada app nos testes
const icons=(prefix,name)=>`<link rel="icon" type="image/svg+xml" href="${prefix}assets/brand/svg/${name}.svg">\n<link rel="icon" type="image/png" sizes="512x512" href="${prefix}assets/brand/png/${name}.png">\n<link rel="apple-touch-icon" href="${prefix}assets/brand/png/${name}.png">`;
const sitemap=[];
for(const view of ['inicio','board','racket','tenis','blog','privacidade',...A.map(a=>'a-'+a.id)]){
 const route=routes[view], prefix='../'.repeat(route.split('/').filter(Boolean).length)||'./';
 const a=A.find(a=>'a-'+a.id===view);
 let body;
 if(a)body=api.article(a.id);
 else if(['board','racket','tenis'].includes(view)){body=api.hub(view);api.fillHub(view);body=body.replace('<div class="grid-a" id="hubGrid"></div>',`<div class="grid-a" id="hubGrid">${element('hubGrid').innerHTML}</div>`)}
 else if(view==='blog'){body=api.library();api.fillLib();body=body.replace('<div id="libBody"></div>',`<div id="libBody">${element('libBody').innerHTML}</div>`)}
 else body=view==='privacidade'?api.privacy():api.home();
 let html=read('templates/site.html').replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'');
 html=html.replace('</head>',metadata(a?(a.seoTitle||`${a.title} | SPORT DNA`):titles[view],a?a.dek:descriptions[view],absolute(route),(view==='inicio'?OG_HOME:`assets/reports/${a?({prancha:'board',raquete:'racket',tenis:'tenis'}[a.area]):(['board','racket','tenis'].includes(view)?view:'board')}.webp`),a?'article':'website',a)+'\n'+icons(prefix,'sportdna-simbolo-cor')+'\n</head>');
 html=html.replace('<main id="app" tabindex="-1"></main>',`<main id="app" tabindex="-1">${body}</main>`);
 for(const id of ['brandHome','footBrand','nav','footLinks'])html=html.replace(new RegExp(`(<(?:a|div|nav)[^>]*id="${id}"[^>]*>)(<\\/(?:a|div|nav)>)`),(_,open,close)=>open+element(id).innerHTML+close);
 html=links(html,prefix);
 const files=a?[a.area]:({board:['prancha'],racket:['raquete'],tenis:['tenis'],privacidade:[]}[view]||['raquete','tenis','prancha']);
 const scripts=files.map(f=>`<script defer src="${prefix}content/${f}.js"></script>`).join('\n');
 html=html.replace('<!-- SITE_SCRIPTS -->',`<script>window.ML_ROOT=${json(prefix)};window.ML_VIEW=${json(view)};window.ML_ROUTES=${json(routes)};window.ML_SHOTS=${json(window.ML_SHOTS)};</script>\n${scripts}\n<script defer src="${prefix}assets/site.js"></script>`);
 write(route+'index.html',html);sitemap.push(absolute(route));
}
// Existing interactive pages retain their engines and layouts; only metadata changes.
for(const app of ['board','racket','tenis','litragem']){
 const route=app==='litragem'?'ferramentas/litragem/':({board:'surf/',racket:'racket/',tenis:'run/'}[app]);
 let html=read(route+'index.html').replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->\n?/g,'');
 // Remove inherited document titles from the body; keep SVG titles untouched.
 html=html.replace(/(<body[^>]*>\s*)<title>[^<]*<\/title>/, '$1');
 html=html.replace(/<head>([\s\S]*?)<\/head>/,(_,head)=>'<head>'+head.replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'')+'</head>');
 const title=app==='litragem'?'Calculadora de litragem de prancha de surf | SPORT DNA':'Teste: '+titles[app];
 const description=app==='litragem'?'Estime uma faixa de volume de prancha pelo peso, nível e tipo. Explore a fórmula e use o resultado como referência para conversar com seu shaper.':({board:'Faça o teste SURF DNA para explorar tipos, medidas e volume de prancha. Prévia grátis e relatório completo por R$ 19,99.',racket:'Faça o teste RACKET DNA para comparar seu perfil com as raquetes do catálogo. Prévia grátis e relatório completo por R$ 19,99.',tenis:'Faça o teste RUN DNA e explore tênis de corrida para seu perfil de treino. Prévia grátis e relatório completo por R$ 9,99.'}[app]);
 html=html.replace('</head>',`<!-- SEO_START -->\n${metadata(title,description,absolute(route),`assets/reports/${app==='litragem'?'board':app}.webp`)}\n${icons(app==='litragem'?'../../':'../',{board:'surfdna-icone',racket:'racketdna-icone',tenis:'rundna-icone',litragem:'surfdna-icone'}[app])}\n<!-- SEO_END -->\n</head>`);
 // Replace legacy home hash links with canonical paths without changing app actions.
 html=html.replace(/href="\.\.\/\.\.\/(?:index\.html)?#(a-[^"\s]+|blog|board|racket|tenis|privacidade)"/g,(_,key)=>`href="../../${routes[key]||''}"`);
 write(route+'index.html',html);sitemap.push(absolute(route));
}
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(url=>`  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n`);
write('404.html',`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="icon" type="image/svg+xml" href="${site.pathname}assets/brand/svg/sportdna-simbolo-cor.svg"><title>Página não encontrada | SPORT DNA</title></head><body><main><h1>Página não encontrada</h1><p>Confira o endereço ou <a href="${site.pathname}">volte ao início</a>.</p></main></body></html>`);
console.log(`Generated ${sitemap.length} canonical pages, sitemap, robots and 404. Site: ${site.href}`);
