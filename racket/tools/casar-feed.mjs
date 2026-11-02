#!/usr/bin/env node
/* Casa um feed de produtos de afiliado (CSV da Awin, .csv ou .csv.gz) com o CATALOG do RACKET DNA.
   Uso: node racket/tools/casar-feed.mjs feed.csv[.gz] [feed2.csv ...]
   Saída (na pasta atual): feed-casado.json (proposta por raquete) e feed-casado.md (tabela para conferir à mão).
   Nada é gravado no app: a conferência é humana, e só depois a foto e o link entram no CATALOG. */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
const CATALOG = JSON.parse(html.match(/const CATALOG=\/\*CATALOG\*\/(\[.*?\]);/)[1]).map((r, id) => ({...r, id}));

const norm = t => String(t || '').replace(/(\d+)\s*[ªº]/g, ' v$1 ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/(\d)\s*g\b/g, '$1g').replace(/[^a-z0-9]+/g, ' ').trim();
const toks = t => norm(t).split(' ').filter(Boolean);

/* palavras que distinguem versões: se aparecem no produto e não no modelo, é outra raquete */
const VARIANT = new Set(['team','lite','l','plus','tour','pro','mp','s','x','98','99','100','104','105','107','108','97','95','16x19','16x20','18x20','16x18','18x19','lt','ul','rafa','origin','tribute','light']);
/* infantil, cordas, bolsas e acessórios */
const NOT_RACKET = /\b(junior|jr|infantil|kids|21|23|25|26|corda|cordas|string|bolsa|raqueteira|mochila|bag|overgrip|grip|capa|cover|antivibrador|bola|bolas|tenis de corrida|calcado|camiseta|padel|beach|squash|badminton|pickleball)\b/;
const GEN = /^(v\d+|geracao|20\d\d)$/;

function modelKeys(r) {
  const all = toks(r.model);
  const core = all.filter(t => !GEN.test(t) && !/^\d{3}g$/.test(t));
  const gen = all.filter(t => /^v\d+$/.test(t));
  const wt = all.find(t => /^\d{3}g$/.test(t));
  return {core, gen, wt, brand: norm(r.brand)};
}

function parseCSV(text) {
  const first = text.split('\n', 1)[0];
  const d = ['|', '\t', ';', ','].map(c => [c, first.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++ } else q = false } else f += c; continue }
    if (c === '"') q = true; else if (c === d) { row.push(f); f = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = '' }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row) }
  const head = rows.shift().map(h => h.replace(/^﻿/, '').trim());
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}

function readFeed(file) {
  let buf = fs.readFileSync(file);
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf);
  return parseCSV(buf.toString('utf8')).map(p => ({
    name: p.product_name || p.title || p.name || '',
    brand: p.brand_name || p.brand || '',
    cat: [p.merchant_category, p.category_name, p.merchant_product_category_path].filter(Boolean).join(' '),
    img: p.merchant_image_url || p.large_image || p.aw_image_url || p.image_url || '',
    url: p.aw_deep_link || p.deep_link || p.link || '',
    price: parseFloat(String(p.search_price || p.price || '').replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')) || null,
    store: p.merchant_name || path.basename(file).replace(/\..*$/, ''),
    stock: p.in_stock ?? '',
  }));
}

/* pontua um produto contra uma raquete; null = não é ela */
function match(p, r, k) {
  const nameN = norm(p.name), pt = new Set(toks(p.name + ' ' + p.brand));
  if (!pt.has(k.brand) && norm(p.brand) !== k.brand) return null;
  if (NOT_RACKET.test(nameN)) return null;
  if (!/raquete|racket|racquet/.test(nameN + ' ' + norm(p.cat))) return null;
  if (!k.core.every(t => pt.has(t))) return null;
  const extra = [...pt].filter(t => VARIANT.has(t) && !k.core.includes(t));
  if (extra.length) return null;
  const years = (nameN.match(/\b20\d\d\b/g) || []).map(Number);
  const gens = nameN.match(/\bv\d+\b/g) || [];
  if (years.length && r.year && !years.includes(r.year)) return null;          /* outra geração */
  if (gens.length && k.gen.length && !gens.some(g => k.gen.includes(g))) return null;
  const wts = nameN.match(/\b\d{3}g\b/g) || [];
  if (k.wt && wts.length && !wts.includes(k.wt)) return null;                 /* outro peso */
  const genOk = years.includes(r.year) || (k.gen.length && gens.some(g => k.gen.includes(g)));
  return {genOk, score: (genOk ? 10 : 0) + (p.img ? 3 : 0) + (String(p.stock) === '1' || /true|sim|yes/i.test(p.stock) ? 2 : 0) - pt.size * .05};
}

const files = process.argv.slice(2);
if (!files.length) { console.error('Uso: node racket/tools/casar-feed.mjs feed.csv[.gz] [...]'); process.exit(1) }
const products = files.flatMap(readFeed);
const out = {}, lines = ['| # | Raquete | Status | Loja | Produto no feed | Preço | Foto |', '|---|---|---|---|---|---|---|'];
for (const r of CATALOG) {
  const k = modelKeys(r);
  const c = products.map(p => ({p, m: match(p, r, k)})).filter(x => x.m).sort((a, b) => b.m.score - a.m.score);
  const best = c[0];
  const status = !best ? 'sem oferta' : best.m.genOk ? 'conferir foto' : 'conferir geração';
  out[r.id] = {raquete: `${r.brand} ${r.model}`, status, ofertas: c.length,
    ...(best && {loja: best.p.store, nome: best.p.name, img: best.p.img, url: best.p.url, preco: best.p.price})};
  lines.push(`| ${r.id} | ${r.brand} ${r.model} | ${status} | ${best ? best.p.store : ''} | ${best ? best.p.name.replace(/\|/g, '/') : ''} | ${best?.p.price ? 'R$ ' + best.p.price.toFixed(2).replace('.', ',') : ''} | ${best?.p.img ? `[ver](${best.p.img})` : ''} |`);
}
const n = s => Object.values(out).filter(x => x.status === s).length;
const resumo = `${products.length} produtos lidos. ${CATALOG.length} raquetes: ${n('conferir foto')} com geração confirmada, ${n('conferir geração')} sem geração no nome, ${n('sem oferta')} sem oferta.`;
fs.writeFileSync('feed-casado.json', JSON.stringify(out, null, 1));
fs.writeFileSync('feed-casado.md', `# Feed casado com o catálogo\n\n${resumo}\n\nConfira cada foto antes de levar ao CATALOG: a loja pode usar foto de outra geração.\n\n${lines.join('\n')}\n`);
console.log(resumo + '\nGerado: feed-casado.json e feed-casado.md');
