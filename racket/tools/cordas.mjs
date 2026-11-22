#!/usr/bin/env node
/* Injeta o catálogo de cordas (docs/racket/dados/cordas.json) no RACKET DNA, entre os marcadores CORDAS e FIM_CORDAS.
   Uso: node racket/tools/cordas.mjs   (depois, rode o build do inglês: node racket/tools/i18n/build.mjs)
   Campos do app: n (marca e modelo), t (tipo), sh (formato), mc (macio pelo fabricante), br (só no Brasil),
   p (set em R$, mínimo e máximo arredondados), pop (3 alta, 2 média, 1 baixa oferta no Brasil),
   s/l/c (rigidez lb/in, perda de tensão %, spin potencial: TWU; null se não houver), pr (um jogador que usa ou usou, com fonte no JSON),
   ps (preço: ok = página de loja, ref = só busca, esg = esgotado e fora das ofertas), pg (bitola do set cotado, quando difere da indicada). */
import fs from 'fs';import path from 'path';import url from 'url';
const raiz=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const doc=JSON.parse(fs.readFileSync(path.join(raiz,'docs/racket/dados/cordas.json'),'utf8'));
const pop={high:3,medium:2,low:1};
/* macio: com rigidez medida, poliéster abaixo de 185 lb/in (docs/racket/cordas/pesquisa-regras.md); sem medida, o posicionamento do fabricante */
const macio=c=>{const r=c.lab?.rigidez_lbin;return r!=null?(/^poly/.test(c.tipo)&&r<185):!!c.macio_fabricante};
const lista=doc.cordas.map(c=>({n:c.marca+' '+c.modelo,t:c.tipo,sh:c.formato||null,mc:macio(c)?1:0,br:c.so_brasil?1:0,
  p:[Math.round(c.set_brl[0]),Math.round(c.set_brl[1])],pop:pop[c.popular_br]||1,s:c.lab?.rigidez_lbin??null,l:c.lab?.perda_tensao_pct??null,c:c.lab?.spin_potencial??null,
  pr:(c.pros||[])[0]||null,ps:{confirmado:'ok',esgotado:'esg'}[c.preco_status]||'ref',
  pg:c.bitola_set_mm&&Math.abs(c.bitola_set_mm-(/^poly/.test(c.tipo)?1.25:1.30))>0.03?c.bitola_set_mm:null}));
const f=path.join(raiz,'racket/index.html');let h=fs.readFileSync(f,'utf8');
const re=/\/\*CORDAS\*\/[\s\S]*?\/\*FIM_CORDAS\*\//;if(!re.test(h)){console.error('marcador /*CORDAS*/ não encontrado');process.exit(1)}
h=h.replace(re,()=>'/*CORDAS*/'+JSON.stringify(lista)+'/*FIM_CORDAS*/');fs.writeFileSync(f,h);
console.log(JSON.stringify({cordas:lista.length,comLab:lista.filter(x=>x.s!=null).length}));
