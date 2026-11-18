#!/usr/bin/env node
/* Paridade do motor: RACKET DNA brasileiro × versão internacional gerada (intl/en-xx/racket).
   node racket/tools/i18n/paridade.mjs [--n 300] [--json saida.json]
   Falham (código 1):
     P1 mesmo motor: com as mesmas condições de compra (sem limite de orçamento, mesma disponibilidade),
        BR e EN dão exatamente o mesmo placar em todas as raquetes, para N perfis aleatórios (semente fixa)
     P2 a pergunta de importação não existe no EN e uma resposta antiga "imp" não muda nada
     P3 faixas de orçamento: cada mercado mostra as próprias faixas e moeda; nenhuma faixa em R$
     P4 preço de referência: toda raquete tem preço nos 4 mercados; nenhum preço igual ao do Brasil em reais
   Relatório (não falha): quanto o top 3 muda por causas legítimas (orçamento do país e disponibilidade). */
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import http from 'node:http';
const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../../..');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null };
const N = +(opt('--n') || 300);
let seed = 20261118; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = a => a[Math.floor(rnd() * a.length)];

const srv = http.createServer((q, s) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(raiz, u.endsWith('/') ? u + 'index.html' : u);
  if (!f.startsWith(raiz) || !fs.existsSync(f)) { s.writeHead(404); return s.end() } s.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); s.end(fs.readFileSync(f)) });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await chromium.launch();
async function open(p) { const pg = await b.newPage(); await pg.route(/cdnjs|jsdelivr|unpkg|fonts\.g|googletag|facebook/, r => r.abort()); await pg.goto(base + p + '?teste'); await pg.waitForFunction(() => window.__RK); return pg }
const br = await open('/racket/'), en = await open('/intl/en-us/racket/');
const fails = [], ok = m => console.log('ok  ' + m), bad = m => { fails.push(m); console.log('ERRO ' + m) };

/* perfis aleatórios a partir das perguntas brasileiras (as ocultas saem no purgeHidden do próprio motor) */
const Q = await br.evaluate(() => window.__RK.Q.map(q => ({ id: q.id, type: q.type, min: q.min, max: q.max, multi: q.multi, o: (q.o || []).map(o => o[0]) })));
const nRK = await br.evaluate(() => window.__RK.RK.length);
const perfis = [];
for (let i = 0; i < N; i++) {
  const a = {};
  for (const q of Q) {
    if (q.id === 'imp' || q.id === 'budget') continue;
    if (q.type === 'step') a[q.id] = String(Math.round(q.min + rnd() * (q.max - q.min)));
    else if (q.type === 'select') a[q.id] = rnd() < .25 ? 'none' : rnd() < .15 ? 'other' : String(Math.floor(rnd() * nRK));
    else if (q.multi) a[q.id] = q.o.filter(() => rnd() < .35).slice(0, q.multi);
    else if (q.o.length) a[q.id] = pick(q.o);
  }
  perfis.push({ a, imp: pick(['yes', 'no']), faixa: Math.floor(rnd() * 3) });
}
const run = (pg, lista, prep) => pg.evaluate(([lista, prep]) => {
  const H = window.__RK, { A, compute, PESOS } = H;
  if (prep.nicho) Object.assign(PESOS.pen.nicho, prep.nicho);
  return lista.map(a => { Object.keys(A).forEach(k => delete A[k]); Object.assign(A, H.cleanAnswers(JSON.parse(JSON.stringify(a))));
    const R = compute(); const all = {}; R.all.forEach(x => { all[x.r.id] = x.raw });
    return { all, top3: R.ranked.slice(0, 3).map(x => x.r.id), names: R.ranked.slice(0, 3).map(x => x.r.name) } });
}, [lista, prep]);

/* P1 mesmo motor */
const intlDisp = await en.evaluate(() => JSON.parse(JSON.stringify(window.RK_INTL.availability)));
const p1br = await run(br, perfis.map(p => ({ ...p.a, imp: 'yes', budget: '99999' })), { nicho: intlDisp });
const p1en = await run(en, perfis.map(p => ({ ...p.a, budget: '99999' })), {});
let dif = 0, exemplo = null;
p1br.forEach((r, i) => { const e = p1en[i]; for (const id in r.all) if (r.all[id] !== e.all[id]) { dif++; exemplo ??= { perfil: i, id, br: r.all[id], en: e.all[id] }; break } });
dif ? bad(`P1 ${dif}/${N} perfis com placar diferente entre BR e EN nas mesmas condições: ${JSON.stringify(exemplo)}`) : ok(`P1 mesmo motor: ${N} perfis × ${nRK} raquetes com placar idêntico (BR com importação aceita, sem limite de orçamento e a disponibilidade internacional)`);
// recarrega a página brasileira para desfazer a mudança de disponibilidade
await br.reload(); await br.waitForFunction(() => window.__RK);

/* P2 pergunta de importação */
const temImp = await en.evaluate(() => window.__RK.Q.some(q => q.id === 'imp') || /import/i.test(window.__RK.Q.map(q => q.t + ' ' + (q.h || '')).join(' ')));
temImp ? bad('P2 a versão EN ainda pergunta sobre importação') : ok('P2 sem pergunta de importação no EN');
const comImp = await run(en, perfis.slice(0, 100).map(p => ({ ...p.a, imp: 'no', budget: '260' })), {});
const semImp = await run(en, perfis.slice(0, 100).map(p => ({ ...p.a, budget: '260' })), {});
const mudou = comImp.filter((r, i) => JSON.stringify(r.all) !== JSON.stringify(semImp[i].all)).length;
mudou ? bad(`P2 resposta antiga "imp" mudou ${mudou}/100 resultados no EN`) : ok('P2 resposta antiga de importação não muda nenhum resultado no EN (100 perfis)');

/* P3 e P4 por mercado */
const mercados = {};
for (const m of ['us', 'gb', 'ca', 'au']) {
  const pg = m === 'us' ? en : await open(`/intl/en-${m}/racket/`);
  const info = await pg.evaluate(() => { const I = window.RK_INTL, q = window.__RK.Q.find(x => x.id === 'budget');
    return { market: I.market, currency: I.currency, opts: q.o.map(o => o[1]), faixas: I.budget.map(b => b[0]), semPreco: window.__RK.RK.filter(r => !r.price).length,
      precos: window.__RK.RK.map(r => r.price && r.price[0]), lang: document.documentElement.lang, report: I.report } });
  mercados[m] = info;
  const sym = { USD: '$', GBP: '£', CAD: '$', AUD: '$' }[info.currency];
  const faixaOk = info.opts.length === 3 && info.opts.every(t => t.includes(sym) && !/R\$/.test(t));
  faixaOk ? ok(`P3 ${info.market} (${info.lang}): orçamento em ${info.currency}: ${info.opts.join(' | ')} · relatório ${info.report}`) : bad(`P3 ${m}: faixas ${info.opts.join(' | ')}`);
  info.semPreco ? bad(`P4 ${m}: ${info.semPreco} raquetes sem preço`) : ok(`P4 ${info.market}: ${info.precos.length} raquetes com preço de referência local (mediana ${info.precos.slice().sort((a, b) => a - b)[Math.floor(info.precos.length / 2)]} ${info.currency})`);
}
const brPrecos = await br.evaluate(() => window.__RK.RK.map(r => r.price && r.price[0]));
const iguais = mercados.us.precos.filter((v, i) => v === brPrecos[i]).length;
iguais > 3 ? bad(`P4 ${iguais} preços em USD iguais ao valor em reais (conversão literal?)`) : ok('P4 preços em USD não repetem os valores em reais');

/* relatório: diferenças legítimas no uso normal (faixa equivalente de orçamento e disponibilidade de cada país) */
const faixasBR = ['1400', '2000', '99999'], faixasUS = mercados.us.faixas.map(String);
const rBR = await run(br, perfis.map(p => ({ ...p.a, imp: p.imp, budget: faixasBR[p.faixa] })), {});
const rEN = await run(en, perfis.map(p => ({ ...p.a, budget: faixasUS[p.faixa] })), {});
const rENsemOrc = await run(en, perfis.map(p => ({ ...p.a, budget: '99999' })), {});
const rBRsemOrc = await run(br, perfis.map(p => ({ ...p.a, imp: p.imp, budget: '99999' })), {});
const same1 = rBR.filter((r, i) => r.top3[0] === rEN[i].top3[0]).length;
const jac = (a, b) => a.filter(x => b.includes(x)).length / new Set([...a, ...b]).size;
const mj = rBR.reduce((s, r, i) => s + jac(r.top3, rEN[i].top3), 0) / N;
const same1semOrc = rBRsemOrc.filter((r, i) => r.top3[0] === rENsemOrc[i].top3[0]).length;
console.log(`\nRelatório (não falha): uso normal, faixa de orçamento equivalente`);
console.log(`  mesma 1ª raquete BR × US: ${same1}/${N} (${Math.round(same1 / N * 100)}%) · top 3 em comum (Jaccard médio): ${(mj * 100).toFixed(0)}%`);
console.log(`  sem limite de orçamento nos dois (só disponibilidade difere): mesma 1ª raquete ${same1semOrc}/${N} (${Math.round(same1semOrc / N * 100)}%)`);
const exemplos = rBR.map((r, i) => ({ i, br: rBR[i].names[0], en: rEN[i].names[0] })).filter(x => x.br !== x.en).slice(0, 5);
for (const x of exemplos) console.log(`  perfil ${x.i}: BR ${x.br} · US ${x.en}`);
if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify({ N, same1, mj, same1semOrc, fails, mercados: Object.fromEntries(Object.entries(mercados).map(([k, v]) => [k, { ...v, precos: undefined }])) }, null, 1));
await b.close(); srv.close();
console.log(fails.length ? `\n${fails.length} falha(s)` : '\nparidade ok');
process.exit(fails.length ? 1 : 0);
