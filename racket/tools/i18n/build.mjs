/* Gera a versão internacional (inglês) do RACKET DNA a partir do racket/index.html brasileiro.
   node racket/tools/i18n/build.mjs            → escreve intl/en-{us,gb,ca,au}/racket/index.html e intl/assets/checkout.en.js
   node racket/tools/i18n/build.mjs --check    → só confere (falta de tradução, patch quebrado, português sobrando)
   node racket/tools/i18n/build.mjs --api=URL  → aponta o checkout para o worker sandbox (padrão: sem API = simulação de teste)

   O arquivo brasileiro não é alterado. Mesmo motor, mesmos pesos: as diferenças estão em patches.mjs (código)
   e en.json (texto). A pasta intl/ não entra no pacote do site (scripts/package-site.mjs tem lista fechada). */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page as PAGE_PATCHES, client as CLIENT_PATCHES } from './patches.mjs';
import { lex, scanJS, isText, decode, encode } from './lexer.mjs';
import { DATA } from './extrair.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const read = p => readFileSync(join(root, p), 'utf8');
const EN = JSON.parse(readFileSync(join(here, 'en.json'), 'utf8'));
const PRICES = JSON.parse(readFileSync(join(here, 'precos-mercado.json'), 'utf8'));
const LOCALE = readFileSync(join(here, 'locale.js'), 'utf8');
const MEASURE = readFileSync(join(here, 'measure.js'), 'utf8');
const errors = [];
const ORIGINAL = read('racket/index.html') + read('assets/payments/client.js');

/* ---------- 1. patches ---------- */
function applyPatches(src, list, label) {
  for (const p of list) {
    const want = p.n ?? 1;
    let count;
    if (p.find instanceof RegExp) {
      const rx = p.find.global ? p.find : new RegExp(p.find.source, p.find.flags);
      count = (src.match(new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g')) || []).length;
      src = src.replace(rx, p.replace);
    } else {
      count = src.split(p.find).length - 1;
      src = src.split(p.find).join(p.replace);
    }
    if (want === -1 ? count < 1 : count !== want) errors.push(`${label}: patch encontrou ${count}× (esperado ${want === -1 ? '≥1' : want}): ${String(p.find).slice(0, 90)}`);
  }
  return src;
}
const patchText = [...PAGE_PATCHES, ...CLIENT_PATCHES].map(p => p.replace).join('\n');

/* ---------- 2. tradução por trecho (posição exata do lexer) ---------- */
const missing = new Map();
function translate(src, pieces, label, { skip = () => false } = {}) {
  const out = [];
  for (const p of pieces) {
    if (skip(p)) continue;
    const text = decode(p.raw, p.ctx);
    if (!isText(text)) continue;
    const key = text.trim().replace(/\s+/g, ' ');
    let en = EN[p.ctx + '|' + key] ?? EN[key]; // chave com contexto (ex.: "tpl|a") vale antes da geral
    if (en === undefined) {
      if (patchText.includes(key) && !ORIGINAL.includes(key)) continue; // texto em inglês que veio de um patch
      missing.set(key, label);
      continue;
    }
    if (en === '=') continue; // igual nas duas línguas (nome próprio, sigla)
    const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
    out.push({ start: p.start, end: p.end, value: encode(lead + en + trail, p.ctx) });
  }
  out.sort((a, b) => b.start - a.start);
  for (const r of out) src = src.slice(0, r.start) + r.value + src.slice(r.end);
  return src;
}
function dataRanges(src) {
  const skip = []; let pos = 0;
  for (const line of src.split('\n')) { if (DATA.test(line)) skip.push([pos, pos + line.length]); pos += line.length + 1; }
  return p => skip.some(([a, b]) => p.start >= a && p.end <= b);
}

/* ---------- 3. página ---------- */
let page = applyPatches(read('racket/index.html'), PAGE_PATCHES, 'página');
const { pieces, regexes } = lex(page);
page = translate(page, pieces, 'página', { skip: dataRanges(page) });
// expressões regulares que leem texto do motor (mensagens de penalidade): traduzidas pela mesma tabela
for (const [pt, en] of Object.entries(EN.__regex || {})) {
  const n = page.split(pt).length - 1;
  if (n !== 1) errors.push(`regex: ${n}× ${pt}`);
  page = page.split(pt).join(en);
}

/* ---------- 4. cliente de checkout em inglês ---------- */
let client = applyPatches(read('assets/payments/client.js'), CLIENT_PATCHES, 'checkout');
{
  const out = [], rx = [];
  scanJS(client, 0, () => false, out, rx);
  client = translate(client, out.sort((a, b) => a.start - b.start), 'checkout');
}

/* ---------- 5. português sobrando ---------- */
const PT_LEFT = /[ãõçâêôÃÕÇ]|\b(você|não|raquete|raquetes|seu|sua|para|com|mais|uma|está|são)\b/i;
const NAMES = /Muchová|Jódar|Krejčíková|Kopřiva|Lehečka|Macháč|Menšík|Siniaková|Bouzková|Nosková|Vondroušová|Paolini|João|Fonseca|Mendonça|Câmara/;
function leftovers(src, label, skip = () => false, js = false) {
  let pieces;
  if (js) { pieces = []; scanJS(src, 0, () => false, pieces, []); } else ({ pieces } = lex(src));
  for (const p of pieces) {
    if (skip(p)) continue;
    const t = decode(p.raw, p.ctx);
    if (isText(t) && PT_LEFT.test(t.replace(NAMES, '').replace(/[\w.-]+@[\w.-]+|\b[\w-]+\.com(\.br)?\b/g, ''))) errors.push(`${label}: português sobrando: ${t.trim().slice(0, 100)}`);
  }
}

/* ---------- 6. saída por mercado ---------- */
const pricesTable = {};
{
  const f = { gbp: .87, cad: 1.104, aud: 1.351 }; // mediana loja local ÷ loja dos EUA nas 14 raquetes de referência
  const bench = Object.fromEntries(PRICES.bench.map(b => [b.id, b]));
  const r5 = x => Math.round(x / 5) * 5;
  for (const [id, v] of Object.entries(PRICES.usd)) {
    const b = bench[id] || {};
    pricesTable[id] = [Math.round(v.usd), Math.round(b.gbp || r5(v.usd * f.gbp)), Math.round(b.cad || r5(v.usd * f.cad)), Math.round(b.aud || r5(v.usd * f.aud))];
  }
}
const MARKETS = { us: ['US', 'en-US', 'en_US', '$9.99'], gb: ['GB', 'en-GB', 'en_GB', 'US$9.99'], ca: ['CA', 'en-CA', 'en_CA', 'US$9.99'], au: ['AU', 'en-AU', 'en_AU', 'US$9.99'] };
const SITE = 'https://sportdna.com.br'; // domínio provisório: ver docs/racket/intl/diagnostico.md (ccTLD .com.br)
function seo(m) {
  const [, lang, og] = MARKETS[m];
  const title = 'Which tennis racket should you buy? Take the test | RACKET DNA';
  const desc = 'Answer a few questions about your body, level and game and see how the rackets in our catalog fit you. Free preview; the full report is a one-time payment.';
  const alt = Object.entries(MARKETS).map(([k, v]) => `<link rel="alternate" hreflang="${v[1]}" href="${SITE}/intl/en-${k}/racket/">`).join('\n');
  return `
<title>${title}</title>
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="description" content="${desc}">
<!-- Pré-lançamento: sem canonical e sem link do site brasileiro. Na aprovação, trocar SITE pelo domínio final e ligar os hreflang abaixo
     (e o par pt-BR ↔ en no racket/ brasileiro). Ver docs/racket/intl/seo-analytics.md.
${alt.replace(/--/g, '- -')}
<link rel="alternate" hreflang="pt-BR" href="${SITE}/racket/">
<link rel="alternate" hreflang="x-default" href="${SITE}/intl/en-us/racket/">
-->
<meta property="og:locale" content="${og}">
<meta property="og:site_name" content="SPORT DNA">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<link rel="icon" type="image/svg+xml" href="/assets/brand/svg/racketdna-icone.svg">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/brand/png/racketdna-icone.png">
<link rel="apple-touch-icon" href="/assets/brand/png/racketdna-icone.png">
`;
}
const payConfig = `window.SPORTDNA_PAYMENTS=Object.freeze({mode:'test',api:${JSON.stringify(typeof args.api === 'string' ? args.api : '')},products:Object.freeze({'racket-report-intl':Object.freeze({name:'RACKET DNA Report',amount:999,currency:'USD'})})});`;
const inject = `<script>window.RK_PRICES=${JSON.stringify(pricesTable)};</script>\n<script>\n${LOCALE}</script>\n<script>${payConfig}</script>\n<script src="../../assets/checkout.en.js"></script>`;
const PAYSCRIPTS = /<script src="\.\.\/assets\/payments\/config\.js[^"]*"><\/script>\n<script src="\.\.\/assets\/payments\/client\.js[^"]*"><\/script>/;
if (!PAYSCRIPTS.test(page)) errors.push('scripts de pagamento não encontrados');

const outputs = {};
for (const [m, [code, , , report]] of Object.entries(MARKETS)) {
  let html = page.replace('__MARKET__', code).replace('__SEO__', seo(m)).replace(PAYSCRIPTS, inject)
    .replace('__MEASURE__', `<script>\n${MEASURE}</script>`).split('{REPORT}').join(report);
  outputs[`intl/en-${m}/racket/index.html`] = html;
}
outputs['intl/assets/checkout.en.js'] = '/* Gerado por racket/tools/i18n/build.mjs a partir de assets/payments/client.js. Não editar à mão. */\n' + client;

if (args.debug) { writeFileSync(join(root, 'dist', 'client.en.debug.js'), client); writeFileSync(join(root, 'dist', 'page.en.debug.html'), outputs['intl/en-us/racket/index.html']); }
leftovers(outputs['intl/en-us/racket/index.html'], 'página', dataRanges(outputs['intl/en-us/racket/index.html']));
leftovers(client, 'checkout', () => false, true);
if (/\{REPORT\}|__MARKET__|__SEO__|__MEASURE__/.test(outputs['intl/en-us/racket/index.html'])) errors.push('marcador não substituído');

if (missing.size) {
  writeFileSync(join(here, 'faltando.json'), JSON.stringify(Object.fromEntries([...missing].map(([k]) => [k, ''])), null, 1) + '\n');
  errors.push(`${missing.size} textos sem tradução (lista em racket/tools/i18n/faltando.json)`);
}
if (errors.length) { console.error(errors.slice(0, 60).join('\n')); if (errors.length > 60) console.error(`… e mais ${errors.length - 60}`); process.exit(1); }
if (!args.check) for (const [p, html] of Object.entries(outputs)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), html); }
console.log(JSON.stringify({ ok: true, chaves: Object.keys(EN).length, arquivos: Object.keys(outputs), escrito: !args.check }));
