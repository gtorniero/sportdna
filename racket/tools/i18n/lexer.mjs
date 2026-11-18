/* Lexer do RACKET DNA para a versão internacional.
   Percorre racket/index.html (HTML com JS embutido) e devolve os trechos de texto visível:
   texto entre tags, atributos de texto (aria-label, alt, title, placeholder, content) e
   texto dentro de strings e template literals do JS, inclusive o HTML montado dentro delas.
   Comentários, CSS, nomes de código e o JSON-LD ficam de fora.
   Cada trecho sai com posição exata no arquivo, para a troca não encostar em código. */

const TEXT_ATTRS = /^(aria-label|alt|title|placeholder|content)$/i;

/* ---------- HTML dentro de um texto (página, string ou template) ---------- */
// Recebe o conteúdo bruto de um texto e devolve os pedaços visíveis.
// state.inTag mantém o estado entre pedaços de um mesmo template (`<p class="${x}">Texto`).
function htmlPieces(raw, base, ctx, out, state = { inTag: false, attr: null, quote: null }) {
  let i = 0, textStart = state.inTag ? -1 : 0;
  const flush = (end) => {
    if (textStart >= 0 && end > textStart) out.push({ start: base + textStart, end: base + end, ctx, raw: raw.slice(textStart, end) });
  };
  while (i < raw.length) {
    if (!state.inTag) {
      if (raw[i] === '<' && /[a-zA-Z/!]/.test(raw[i + 1] || '')) {
        flush(i); state.inTag = true; state.attr = null; textStart = -1; i++; continue;
      }
      i++; continue;
    }
    // dentro de uma tag: procura atributos de texto entre aspas
    if (state.quote) {
      const j = raw.indexOf(state.quote, i);
      const end = j < 0 ? raw.length : j;
      if (state.attr && TEXT_ATTRS.test(state.attr) && end > i) out.push({ start: base + i, end: base + end, ctx: ctx + state.quote, raw: raw.slice(i, end) });
      if (j < 0) { i = raw.length; break; }
      state.quote = null; state.attr = null; i = j + 1; continue;
    }
    const m = /^([a-zA-Z-]+)\s*=\s*(["'])/.exec(raw.slice(i));
    if (m) { state.attr = m[1]; state.quote = m[2]; i += m[0].length; continue; }
    if (raw[i] === '>') { state.inTag = false; textStart = i + 1; i++; continue; }
    i++;
  }
  flush(raw.length);
  return state;
}

/* ---------- JS ---------- */
const REGEX_BEFORE = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', '=>', 'return', 'typeof', 'case', 'in', 'of', '&&', '||', '??', '']);

export function scanJS(src, i, stop, out, regexes) {
  // stop(src, i) → true quando o bloco termina (fim do <script> ou `}` do template)
  let last = '', depth = 0;
  while (i < src.length) {
    if (depth === 0 && stop(src, i)) return i;
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { const j = src.indexOf('\n', i); i = j < 0 ? src.length : j; continue; }
    if (c === '/' && src[i + 1] === '*') { const j = src.indexOf('*/', i + 2); i = j < 0 ? src.length : j + 2; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      htmlPieces(src.slice(i + 1, j), i + 1, 'js' + c, out);
      i = j + 1; last = 'str'; continue;
    }
    if (c === '`') { i = scanTemplate(src, i + 1, out, regexes); last = 'str'; continue; }
    if (c === '/' && REGEX_BEFORE.has(last)) {
      let j = i + 1, cls = false;
      while (j < src.length) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false;
        else if (src[j] === '/' && !cls) break;
        else if (src[j] === '\n') break;
        j++;
      }
      let k = j + 1; while (/[a-z]/.test(src[k] || '')) k++;
      regexes.push({ start: i, end: k, raw: src.slice(i, k) });
      i = k; last = 'regex'; continue;
    }
    if (/[A-Za-z_$À-ɏ]/.test(c)) {
      let j = i; while (/[\w$À-ɏ]/.test(src[j] || '')) j++;
      last = src.slice(i, j); if (!['return', 'typeof', 'case', 'in', 'of'].includes(last)) last = 'id';
      i = j; continue;
    }
    if (/[0-9]/.test(c)) { let j = i; while (/[\w.]/.test(src[j] || '')) j++; i = j; last = 'num'; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
    const two = src.slice(i, i + 2);
    if (['=>', '&&', '||', '??'].includes(two)) { last = two; i += 2; continue; }
    last = (c === ')' || c === ']') ? 'close' : c; i++;
  }
  return i;
}

function scanTemplate(src, i, out, regexes) {
  const state = { inTag: false, attr: null, quote: null };
  let chunk = i;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === '`') { htmlPieces(src.slice(chunk, i), chunk, 'tpl', out, state); return i + 1; }
    if (src[i] === '$' && src[i + 1] === '{') {
      htmlPieces(src.slice(chunk, i), chunk, 'tpl', out, state);
      i = scanJS(src, i + 2, (s, k) => s[k] === '}', out, regexes) + 1;
      chunk = i; continue;
    }
    i++;
  }
  return i;
}

/* ---------- Página ---------- */
export function lex(src) {
  const out = [], regexes = [], scripts = [];
  let i = 0, textStart = 0;
  const flushText = end => { if (end > textStart) out.push({ start: textStart, end, ctx: 'html', raw: src.slice(textStart, end) }); };
  while (i < src.length) {
    if (src.startsWith('<!--', i)) { flushText(i); i = src.indexOf('-->', i) + 3; textStart = i; continue; }
    if (src[i] === '<' && /[a-zA-Z/!]/.test(src[i + 1] || '')) {
      flushText(i);
      const tagEnd = src.indexOf('>', i);
      const tag = src.slice(i, tagEnd + 1);
      htmlPieces(tag, i, 'html', out.attrs || (out.attrs = []), { inTag: false });
      i = tagEnd + 1;
      const name = (/^<([a-zA-Z]+)/.exec(tag) || [])[1]?.toLowerCase();
      if (name === 'style') { i = src.indexOf('</style>', i); }
      else if (name === 'script') {
        if (/type="application\/ld\+json"/.test(tag)) i = src.indexOf('</script>', i);
        else { const s = i; i = scanJS(src, i, (x, k) => x.startsWith('</script>', k), out, regexes); scripts.push([s, i]); }
      }
      textStart = i; continue;
    }
    i++;
  }
  flushText(src.length);
  // atributos de tags do HTML da página: só os de texto (htmlPieces já filtra)
  const pieces = [...out, ...(out.attrs || []).filter(p => p.ctx !== 'html')];
  return { pieces: pieces.sort((a, b) => a.start - b.start), regexes, scripts };
}

/* ---------- O que é texto para traduzir ---------- */
const PT = /[ãõçáéíóúâêôàÁÉÍÓÚÃÕÇÂÊÔ]|\b(de|da|do|das|dos|que|não|com|para|uma|um|sua|seu|na|no|em|ou|mais|menos|sem|por|o|a|e|raquetes?|anos|linha|libragem|peso|rigidez|cordas|pontos?|novo|leve|forte|moderada|dor|contra|seria|hoje|este|esta|pesada|cotovelo|isso|disso|perto|pela|pelo|medidas|resultado|abaixo|acima)\b/i;
export function isText(t) {
  const s = t.trim();
  if (!s || !/[A-Za-zÀ-ú]/.test(s)) return false;
  if (/^[#.]?[a-z][\w-]*$/.test(s) && !PT.test(s)) return false;           // ids, classes, chaves
  if (/^[\w-]+(\s+[\w-]+)*$/.test(s) && /^[a-z]/.test(s) && !PT.test(s)) return false; // listas de classes
  if (/^(https?:|mailto:|\.\.?\/|\/)/.test(s)) return false;
  if (/[{};]/.test(s) && /:\s*[^ ]+;/.test(s)) return false;               // CSS
  return PT.test(s) || /^[A-ZÀ-Ú]/.test(s) || /\s/.test(s);
}

/* texto de JS cru → texto legível, e o caminho de volta conforme o contexto */
export const decode = (raw, ctx) => ctx.startsWith('js') || ctx === 'tpl' ? raw.replace(/\\(['"`\\])/g, '$1') : raw;
export function encode(text, ctx) {
  let t = text;
  if (ctx.startsWith('js') || ctx === 'tpl') t = t.replace(/\\/g, '\\\\');
  if (ctx.includes("'") && ctx.startsWith('js')) t = t.replace(/'/g, "\\'");
  if (ctx.startsWith('js"')) t = t.replace(/"/g, '\\"');
  if (ctx === 'tpl' || ctx.startsWith('tpl')) t = t.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  if (/["']$/.test(ctx) && ctx.length > 3) { const q = ctx.at(-1); t = t.replace(new RegExp(q, 'g'), q === '"' ? '&quot;' : '&#39;'); }
  return t;
}
