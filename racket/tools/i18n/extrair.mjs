/* Lista os textos visíveis do racket/index.html que precisam de tradução.
   node racket/tools/i18n/extrair.mjs [--json]  → chaves únicas, contagem e contexto */
import { readFileSync } from 'node:fs';
import { lex, isText, decode } from './lexer.mjs';
export const DATA = /^const (CATALOG|RV|EVID|TWD|TWP|PROS|PRECO|GERACOES)=/;
export function segments(src) {
  const { pieces, regexes } = lex(src);
  // linhas de dados (catálogo, reviews, preços): fora da tradução por chave; REVQ entra (frases dos testadores)
  const skip = [];
  let pos = 0;
  for (const line of src.split('\n')) { if (DATA.test(line)) skip.push([pos, pos + line.length]); pos += line.length + 1; }
  const inData = p => skip.some(([a, b]) => p.start >= a && p.end <= b);
  const segs = [];
  for (const p of pieces) {
    if (inData(p)) continue;
    const text = decode(p.raw, p.ctx);
    if (!isText(text)) continue;
    const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
    segs.push({ ...p, key: text.trim().replace(/\s+/g, ' '), lead, trail });
  }
  return { segs, regexes };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const src = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const { segs, regexes } = segments(src);
  const keys = new Map();
  for (const s of segs) { const k = keys.get(s.key) || { n: 0, ctx: new Set() }; k.n++; k.ctx.add(s.ctx); keys.set(s.key, k); }
  if (process.argv.includes('--json')) console.log(JSON.stringify([...keys.keys()], null, 1));
  else {
    console.log('segmentos', segs.length, 'chaves', keys.size, 'caracteres', [...keys.keys()].join('').length);
    const ptRx = regexes.filter(r => /[ãõçáéíóú]|Brasil|nicho|sua |raquete/i.test(r.raw));
    console.log('regex com português', ptRx.length); for (const r of ptRx) console.log('  ', r.raw.slice(0, 120));
  }
}
