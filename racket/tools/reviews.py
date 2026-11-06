#!/usr/bin/env python3
"""Reviews de raquetes: camada bruta → camada derivada (RACKET DNA, branch de revisão).

Uso:  python3 racket/tools/reviews.py            (gera derivado/ e reescreve const EVID em racket/index.html)
      python3 racket/tools/reviews.py --checar    (só confere; falha se derivado/ ou EVID estiverem desatualizados)

Regras (docs/racket/dados/reviews/LEIAME.md):
- bruto/ nunca é editado; o que sai daqui é derivado e reproduzível.
- Nota publicada fica na escala original; sentimento −2..+2 é interpretação (anotador registrado).
- Índice de laboratório não é nota de quadra.
- O texto da Tennis Warehouse republicado (TW Europe, Tennis Only, pintura especial) é um grupo só.
- Só entra no motor registro de página aberta (base "pagina"), elegível e da MESMA geração de uma versão do catálogo
  (tabela VERSOES abaixo, explícita). Nota não passa de uma versão para outra.
- O motor recebe só DIREÇÕES por família de fonte (EVID): sinal da forma do perfil por atributo (atributo − média da
  própria review) e, quando a fonte publica nota geral numérica em 3+ reviews do conjunto, o sinal da nota geral
  relativa à média dessa fonte. Sentimento interpretado entra só na forma do perfil, nunca na aprovação.
  Tennis Warehouse não entra no EVID: já é a família "tw" do motor (TWD).
"""
import csv, json, os, re, sys, hashlib, collections

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../..'))
BR = os.path.join(RAIZ, 'docs/racket/dados/reviews/bruto')
DV = os.path.join(RAIZ, 'docs/racket/dados/reviews/derivado')
HTML = os.path.join(RAIZ, 'racket/index.html')
K = ['power', 'control', 'spin', 'comfort', 'maneuver', 'stability']
MERCADOS = {'EUA', 'Reino Unido', 'Alemanha', 'França', 'Espanha', 'Itália', 'Japão', 'Austrália', 'Brasil', 'Argentina',
            'US', 'UK', 'DE', 'FR', 'ES', 'IT', 'JP', 'AU', 'BR', 'AR'}
LIMIAR_FORMA = .04      # desvio mínimo (escala 0–1) do atributo frente à média da própria review para contar direção
LIMIAR_GERAL = .01      # desvio mínimo (escala 0–1) da nota geral frente à média da fonte
MIN_GERAL_FONTE = 3     # notas gerais numéricas da mesma fonte para existir "média da fonte"

# Versões do catálogo que cada registro pode representar: (família, regex no texto da versão) → ids do CATALOG.
# Só a geração vendida hoje; geração anterior vira "so_contexto". Lista explícita e revisável.
VERSOES = [
    ('Wilson Pro Staff 97', r'^v14( 315g)?$|^v14 \(exemplar', [38]),
    ('Wilson Blade 98', r'^v9 16x19$', [30]), ('Wilson Blade 98', r'^v9 18x20$', [108]),
    ('Wilson Blade 98', r'^v10 16x19$', [106]),
    ('Wilson Clash 100', r'^v3( \(teste original.*\))?$', [33]), ('Wilson Clash 100', r'^100 Pro v3', [118]),
    ('Head Speed', r'^MP 2026', [10]), ('Head Speed', r'^Pro 2026|^Pro Legend 2025 / geração 2026', [12]),
    ('Yonex EZONE 100', r'^8ª geração 2025', [42]),
]
QUARENTENA = {  # url → motivo (valor publicado implausível; preservado no bruto)
    'tennisaddict.fr/tests/yonex-ezone-100-2018': 'conforto 2.2/20 publicado; destoa das outras notas da mesma review',
}

def norm_url(u):
    u = (u or '').strip().lower().split('#')[0].split('?')[0].rstrip('/')
    return re.sub(r'^https?://(www\.)?', '', u)

DOMINIO_FAMILIA = {'tennis-warehouse.com': 'Tennis Warehouse', 'tenniswarehouse-europe.com': 'Tennis Warehouse', 'tennisonly.com.au': 'Tennis Warehouse',
    'twu.tennis-warehouse.com': 'Tennis Warehouse', 'tennisaddict.fr': 'TennisAddict', 'tenniscompanion.org': 'TennisCompanion', 'tennisnerd.net': 'Tennisnerd',
    'tennis.com': 'Tennis.com', 'tennismagazin.de': 'tennis MAGAZIN', 'tennisexpress.com': 'Tennis Express', 'supertennis.tv': 'SuperTennis',
    'fabioferro.blog': 'Fabio Ferro', 'ubitennis.com': 'Ubitennis', 'emporiodotenista.com.br': 'Empório do Tenista'}

def familia_fonte(site, url=None):
    """Família de fonte = publicação. Pelo domínio da URL quando conhecido (o mesmo site com nomes diferentes é uma família só)."""
    d = re.sub(r'^https?://(www\.)?', '', (url or '').lower()).split('/')[0]
    if d in DOMINIO_FAMILIA: return DOMINIO_FAMILIA[d]
    s = (site or '').lower()
    if 'tennis warehouse' in s or 'tw europe' in s or 'tennis only' in s: return 'Tennis Warehouse'
    return (site or d).split(' (')[0].strip()

def num(x):
    try: return float(str(x).replace(',', '.'))
    except Exception: return None

def lote1():
    p = os.path.join(BR, 'lote1-chatgpt-2026-11-06.csv'); out = []
    with open(p, encoding='utf-8') as f:
        for i, r in enumerate(csv.DictReader(f, delimiter=';'), start=2):
            esc = r['escala'].strip()
            vals = dict(zip(K + ['overall'], [num(r[c]) for c in ['potência', 'controle', 'spin', 'conforto', 'manobrabilidade', 'estabilidade', 'nota geral']]))
            lab = 'laborat' in (r['prós curtos'] + r['contras curtos']).lower()
            out.append(dict(
                arquivo_bruto='bruto/lote1-chatgpt-2026-11-06.csv', linha_bruta=i, model_id=r['modelo'], variant_id=r['versão revisada'],
                ano_publicacao=int(r['ano']) if r['ano'].strip() else None, verificado_em='2026-11-06 (ChatGPT/Codex, página aberta)',
                url_canonica=r['URL'].strip(), site=r['site'], familia_fonte=familia_fonte(r['site'], r['URL']), pais=r['país'],
                geografia='mercado' if r['país'] in MERCADOS else 'excecao', revisor_id=r['nível do testador'] or None,
                nivel_revisor=(re.search(r'NTRP [\d.]+( a [\w.]+)?', r['nível do testador']) or [None])[0],
                tipo='laboratorio' if lab else r['tipo'],
                metodo_nota='laboratorio' if lab else ('interpretada' if esc == 'sentimento' else 'publicada'),
                escala_original=esc,
                notas_originais=None if (esc == 'sentimento' or lab) else vals,
                indices_laboratorio=vals if lab else None,
                sentimento_interpretado=vals if esc == 'sentimento' else None,
                anotador='ChatGPT/Codex' if esc == 'sentimento' else None,
                notas_evidencia=' | '.join(x for x in [r['prós curtos'], r['contras curtos']] if x), base='pagina'))
    return out

def lote2():
    out = []
    for fn in sorted(os.listdir(BR)):
        if not (fn.startswith('lote2') and fn.endswith('.jsonl')): continue
        for i, l in enumerate(open(os.path.join(BR, fn), encoding='utf-8'), start=1):
            if not l.strip(): continue
            o = json.loads(l); o['arquivo_bruto'] = 'bruto/' + fn; o['linha_bruta'] = i
            o['familia_fonte'] = familia_fonte(o.get('site'), o.get('url_canonica'))
            out.append(o)
    return out

LETRAS = {'A': 1.0, 'B': .75, 'C': .5, 'D': .25, 'E': 0.0}   # TennisAddict: conversão derivada e explícita
ATR_TRIAGEM = {'power': ['power', 'puissance', 'potenza', 'leistung'], 'control': ['control', 'précision', 'precision', 'kontrolle', 'controllo'],
               'spin': ['topspin', 'spin', "prise d'effet", 'effet'], 'comfort': ['comfort', 'confort', 'komfort', 'comfort'],
               'maneuver': ['maneuverability', 'maniabilité', 'manövrierbarkeit', 'maneggevolezza'], 'stability': ['stability', 'stabilité', 'stabilität', 'stabilità'],
               'overall': ['overall', 'note globale', 'gesamt']}
VARIANTE_TOKENS = ['lite', 'team', 'ul', 'l', 'sl', 'pro', 'tour', 'plus', '+', 'elite', 'mp', '16x19', '18x20', '16x20', '18x16', '16x18', '18x19']

def toks(x, pares=True):
    x = (x or '').lower().replace('×', 'x').replace('-', ' ').replace('_', ' ').replace('/', ' ')
    L = re.findall(r'[a-z0-9+]+(?:x[0-9]+)?', x)
    return set(L) | ({a + b for a, b in zip(L, L[1:])} if pares else set())   # "t fight" também vale como "tfight"

def confirmar_titulo(titulo, url, cands, C):
    """Mapeamento PROVÁVEL pelo título/URL: o candidato precisa ter todos os tokens do nome no título, o ano do catálogo
    (ou nenhum ano conflitante) e nenhum token de variante a mais. Único → provável; senão ambíguo. Não substitui ler a página."""
    t = toks(titulo) | toks(url); anos = set(re.findall(r'20[12][0-9]', (titulo or '') + ' ' + (url or '')))
    ok = []
    for i in cands:
        r = C[i]; nome = toks(r['brand'] + ' ' + re.sub(r'\b(\d+) g\b', r'\1g', r['model']).replace('ª', ''), pares=False) - {'geração', 'gera'}
        nome = {x for x in nome if x not in ('8', 'v1')} | ({str(r['wt'])} if re.search(r'\b\d{3} ?g\b', r['model']) else set())
        pad = {x for x in nome if re.fullmatch(r'\d\dx\d\d', x)}
        tpad = {x for x in t if re.fullmatch(r'\d\dx\d\d', x)}
        if tpad and not (pad & tpad): continue          # título informa outro padrão
        if not (nome - {str(r['wt'])} - pad) <= t: continue
        if anos and str(r.get('year')) not in anos: continue
        extra = {v for v in VARIANTE_TOKENS if v in t and v not in nome}
        if extra: continue
        ok.append(i)
    return ok[0] if len(ok) == 1 else None, ok

def para01(v, esc):
    if v is None: return None
    if esc == 'letras': return LETRAS.get(str(v).strip().upper())
    if esc == 'sentimento': return (max(-2, min(2, v)) + 2) / 4
    e = {'10': 10, '100': 100, '20': 20, '5': 5}.get(str(esc))
    return None if not e else v / e

def catalogo():
    s = open(HTML, encoding='utf-8').read()
    return json.loads(re.search(r'const CATALOG=/\*CATALOG\*/(\[.*?\]);\n', s).group(1))

def triagem(C):
    p = os.path.join(BR, 'triagem-codex-2026-11-06.json')
    if not os.path.exists(p): return []
    d = json.load(open(p, encoding='utf-8')); out = []
    conf = json.load(open(os.path.join(BR, 'conferencia-gui-2026-11-06.json'), encoding='utf-8'))['registros'] if os.path.exists(os.path.join(BR, 'conferencia-gui-2026-11-06.json')) else []
    for i, f in enumerate(d['fontes'], start=1):
        bruto = f.get('atributos_brutos_para_conferencia') or {}
        vals = {}
        for k, nomes in ATR_TRIAGEM.items():
            for nk, nv in bruto.items():
                if nk.strip().lower() in nomes: vals[k] = nv
        letras = any(str(v).strip().upper() in LETRAS for v in vals.values())
        nums = [num(v) for v in vals.values() if num(v) is not None]
        esc = 'letras' if letras else ('100' if nums and max(nums) > 20 else ('20' if nums and max(nums) > 10 else ('10' if nums else None)))
        cid, ok = confirmar_titulo(f.get('titulo'), f['url'], f.get('ids_candidatos') or [], C)
        site = re.sub(r'^https?://(www\.)?', '', f['url']).split('/')[0]
        rec = dict(arquivo_bruto='bruto/triagem-codex-2026-11-06.json', linha_bruta=i, model_id=(C[cid].get('fam') if cid is not None else None) or '(não confirmado)',
                   variant_id=f.get('titulo'), ano_publicacao=None, verificado_em='2026-11-06 (Codex: página consultada, leitura não certificada)' if f.get('pagina_consultada') else None,
                   url_canonica=f['url'], site=site, familia_fonte=familia_fonte(site, f['url']),
                   pais=None, geografia=None, revisor_id=None, nivel_revisor=None, tipo='playtest', metodo_nota='publicada' if vals else 'nenhuma',
                   escala_original=esc, notas_originais={k: (v if letras else num(v)) for k, v in vals.items()} or None, indices_laboratorio=None,
                   sentimento_interpretado=None, anotador=None, notas_evidencia='triagem-codex; ids candidatos ' + ','.join(map(str, f.get('ids_candidatos') or [])) + (f'; provável pelo título: {cid}' if cid is not None else f'; título compatível com {ok}' if ok else '; título não confirma nenhum candidato'),
                   base='triagem', catalogo_provavel=cid, painel_confirmado=False)
        # conferência humana (Gui): confirma versão e as notas citadas, só elas
        for g in conf:
            if g['catalogo_id'] in (f.get('ids_candidatos') or []) and g['site'].lower() in site and cid == g['catalogo_id']:
                m = {'precisao': 'control', 'potencia': 'power'}
                rec2 = dict(rec); rec2.update(linha_bruta=f'{i} + conferencia-gui', base='pagina', verificado_em='2026-11-06 (conferido pelo Gui na página)',
                            model_id=C[g['catalogo_id']].get('fam'), variant_id=g['modelo_catalogo'] + ' ' + g['geracao'], escala_original='letras',
                            notas_originais={m[k]: v for k, v in g['notas_originais'].items()}, painel_confirmado=True, geografia='mercado', pais='França',
                            notas_evidencia='conferência manual do Gui (só precisão e potência); demais atributos seguem na triagem')
                rec2['_ids'] = [g['catalogo_id']]; out.append(rec2)
        out.append(rec)
    return out

def gerar():
    C = catalogo()
    R = lote1() + lote2() + triagem(C)
    snip = json.load(open(os.path.join(BR, 'pr93-snippets-2026-11.json'), encoding='utf-8'))['reviews']
    u93 = {norm_url(x.get('url')) for x in snip}
    # grupos de duplicata: mesma URL normalizada, ou texto da TW em espelho (mesmo código de review no nome da página)
    def chave(r):
        u = norm_url(r['url_canonica'])
        m = re.search(r'racquet_reviews/([a-z0-9]+)review', u)
        return (('tw:' + m.group(1)) if m else u) + ('#conf' if str(r.get('linha_bruta','')).endswith('conferencia-gui') else '')
    grupos = collections.defaultdict(list)
    for r in R: grupos[chave(r)].append(r)
    for g, L in grupos.items():
        for j, r in enumerate(L):
            r['grupo_duplicado'] = g
            r['duplicata_de'] = None if j == 0 else L[0]['arquivo_bruto'] + ':' + str(L[0]['linha_bruta'])
    for r in R:
        u = norm_url(r['url_canonica'])
        r['tambem_na_pr93_snippet'] = u in u93
        nota = r.get('notas_originais') or r.get('sentimento_interpretado') or {}
        r['notas_normalizadas_0a1'] = {k: para01(nota.get(k), r['escala_original']) for k in K + ['overall'] if nota and nota.get(k) is not None} or None
        ids = []
        for fam, rx, cid in VERSOES:
            if r['model_id'] == fam and re.search(rx, r['variant_id'] or ''): ids = cid
        if r.get('_ids'): ids = r.pop('_ids')
        r['catalogo_ids'] = ids
        q = next((m for uu, m in QUARENTENA.items() if uu in u), None)
        if r.get('duplicata_de'): r['elegibilidade'], r['motivo'] = 'excluido', 'duplicata'
        elif q: r['elegibilidade'], r['motivo'] = 'quarentena', q
        elif r.get('base') == 'triagem': r['elegibilidade'], r['motivo'] = 'triagem', 'aguarda conferência de geração, variante e painel na página'
        elif r.get('base') != 'pagina': r['elegibilidade'], r['motivo'] = 'so_contexto', 'resumo de busca, página não aberta'
        elif r['metodo_nota'] == 'laboratorio': r['elegibilidade'], r['motivo'] = 'so_contexto', 'índice de laboratório, não é nota de quadra'
        elif not ids: r['elegibilidade'], r['motivo'] = 'so_contexto', 'geração/versão fora do catálogo atual ou não explicitada'
        elif not r['notas_normalizadas_0a1']: r['elegibilidade'], r['motivo'] = 'so_contexto', 'sem nota nem sentimento por atributo'
        else: r['elegibilidade'], r['motivo'] = 'elegivel', ''
        r['registro_id'] = hashlib.sha1((r['arquivo_bruto'] + str(r['linha_bruta'])).encode()).hexdigest()[:10]
    # média da nota geral numérica por fonte (para direção da aprovação)
    ger = collections.defaultdict(list)
    for r in R:
        n = r.get('notas_originais') or {}
        if r['metodo_nota'] == 'publicada' and n.get('overall') is not None and not r.get('duplicata_de'):
            ger[r['familia_fonte']].append(para01(n['overall'], r['escala_original']))
    media_fonte = {f: sum(v) / len(v) for f, v in ger.items() if len(v) >= MIN_GERAL_FONTE}
    # EVID: por id do catálogo, por família de fonte (fora a TW), direções −1/0/+1
    ev = collections.defaultdict(lambda: collections.defaultdict(lambda: {'d': collections.defaultdict(list), 'a': []}))
    for r in R:
        if r['elegibilidade'] != 'elegivel' or r['familia_fonte'] == 'Tennis Warehouse': continue
        n = {k: v for k, v in r['notas_normalizadas_0a1'].items() if k in K}
        if len(n) >= 2:
            mu = sum(n.values()) / len(n)
            for k, v in n.items():
                for cid in r['catalogo_ids']: ev[cid][r['familia_fonte']]['d'][k].append(v - mu)
        o = (r.get('notas_originais') or {}).get('overall')
        if o is not None and r['familia_fonte'] in media_fonte:
            x = para01(o, r['escala_original']) - media_fonte[r['familia_fonte']]
            for cid in r['catalogo_ids']: ev[cid][r['familia_fonte']]['a'].append(x)
    sg = lambda x, t: 0 if abs(x) < t else (1 if x > 0 else -1)
    EVID = {}
    for cid, F in sorted(ev.items()):
        EVID[str(cid)] = {}
        for f, o in sorted(F.items()):
            EVID[str(cid)][f] = {'d': {k: sg(sum(v) / len(v), LIMIAR_FORMA) for k, v in sorted(o['d'].items())},
                                 'a': sg(sum(o['a']) / len(o['a']), LIMIAR_GERAL) if o['a'] else None}
    return R, EVID, media_fonte, u93, snip

def cobertura(R, media_fonte, u93, snip):
    L = ['# Cobertura das reviews (gerado por `racket/tools/reviews.py`)', '']
    tot = collections.Counter(r['elegibilidade'] for r in R)
    L += [f'- Registros brutos: {len(R)} ({", ".join(f"{k} {v}" for k, v in sorted(tot.items()))}).',
          f'- Famílias de fonte independentes (sem duplicatas): {len({r["familia_fonte"] for r in R if not r.get("duplicata_de")})}.',
          f'- Notas publicadas: {sum(r["metodo_nota"]=="publicada" for r in R)} · interpretadas (sentimento): {sum(r["metodo_nota"]=="interpretada" for r in R)} · laboratório: {sum(r["metodo_nota"]=="laboratorio" for r in R)}.',
          f'- Fora dos 10 mercados (exceção geográfica): {sum(r["geografia"]=="excecao" for r in R)}.',
          f'- URLs também presentes nos resumos de busca da #93: {sum(r["tambem_na_pr93_snippet"] for r in R)} (a #93 tem {len(snip)} registros, {len(u93)} URLs, nenhum com página aberta).',
          f'- Média de nota geral por fonte (3+ notas numéricas): ' + (', '.join(f'{k} {v:.3f}' for k, v in sorted(media_fonte.items())) or 'nenhuma'), '',
          '| Família | Registros | Fontes independentes | Elegíveis p/ motor | Gerações/versões registradas |', '|---|---|---|---|---|']
    by = collections.defaultdict(list)
    for r in R: by[r['model_id']].append(r)
    for f, rs in sorted(by.items()):
        u = [r for r in rs if not r.get('duplicata_de')]
        L.append(f'| {f} | {len(rs)} | {len({r["familia_fonte"] for r in u})} | {sum(r["elegibilidade"]=="elegivel" for r in rs)} | {"; ".join(sorted({r["variant_id"] for r in rs}))[:300]} |')
    C = catalogo(); RAW = open(HTML, encoding='utf-8').read()
    TWD = json.loads(re.search(r'const TWD=(\{.*?\});\n', RAW).group(1)); RV = json.loads(re.search(r'const RV=(\{.*?\});\n', RAW).group(1))
    eleg = collections.defaultdict(set); prov = collections.defaultdict(list)
    for r in R:
        if r['elegibilidade'] == 'elegivel':
            for i in r['catalogo_ids']: eleg[i].add(r['familia_fonte'])
        if r['elegibilidade'] == 'triagem' and r.get('catalogo_provavel') is not None: prov[r['catalogo_provavel']].append(r)
    fams = lambda i: len(eleg[i]) + (1 if str(i) in TWD else 0) + (1 if str(i) in RV else 0)
    n2 = sum(fams(i) >= 2 for i in range(len(C))); n1 = sum(fams(i) == 1 for i in range(len(C))); n0 = sum(fams(i) == 0 for i in range(len(C)))
    L += ['', '## Por versão do catálogo (183)', '',
          f'- Famílias de fonte que o motor vê hoje (TW, sites da rodada 1 e EVID): 2 ou mais em {n2} versões, 1 em {n1}, nenhuma em {n0}.',
          '- Só versões com 2+ famílias concordando podem ter nota mexida por review; as demais ficam neutras (sem bônus nem penalidade).',
          f'- Triagem do Codex com mapeamento provável pelo título: {len(prov)} versões; {sum(any(len(x.get("notas_originais") or {})>=3 for x in v) for v in prov.values())} com página de 3+ atributos. Não entram no motor até conferência de geração, variante e painel.', '',
          '| id | Versão | TW | Sites r1 | Elegíveis (famílias) | Triagem provável (páginas · com 3+ atributos) |', '|---|---|---|---|---|---|']
    for i, r in enumerate(C):
        L.append(f'| {i} | {r["brand"]} {r["model"]} | {"sim" if str(i) in TWD else ""} | {"sim" if str(i) in RV else ""} | {", ".join(sorted(eleg[i]))} | {len(prov[i])} · {sum(len(x.get("notas_originais") or {})>=3 for x in prov[i])} |')
    L += ['', '## Lacunas: nenhuma família de fonte e nenhuma página provável na triagem', '']
    lac = [f'{i} {C[i]["brand"]} {C[i]["model"]}' for i in range(len(C)) if fams(i) == 0 and not prov[i]]
    L += [f'- {len(lac)} versões: ' + '; '.join(lac)]
    L += ['', '## Quarentena e exclusões', '']
    for r in R:
        if r['elegibilidade'] in ('quarentena', 'excluido'):
            L.append(f'- {r["model_id"]} · {r["variant_id"]} · {r["site"]}: {r["elegibilidade"]} ({r["motivo"]}) — {r["url_canonica"]}')
    return '\n'.join(L) + '\n'

def main():
    R, EVID, media_fonte, u93, snip = gerar()
    os.makedirs(DV, exist_ok=True)
    out = {'reviews.json': json.dumps({'gerado_por': 'racket/tools/reviews.py', 'registros': R}, ensure_ascii=False, indent=1) + '\n',
           'evid.json': json.dumps(EVID, ensure_ascii=False, indent=1, sort_keys=True) + '\n',
           'cobertura.md': cobertura(R, media_fonte, u93, snip)}
    s = open(HTML, encoding='utf-8').read()
    novo = 'const EVID=' + json.dumps(EVID, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n'
    s2 = re.sub(r'const EVID=\{.*?\};\n', lambda m: novo, s) if 'const EVID=' in s else s
    if '--checar' in sys.argv:
        ok = all(os.path.exists(os.path.join(DV, k)) and open(os.path.join(DV, k), encoding='utf-8').read() == v for k, v in out.items()) and s2 == s
        print('reviews derivadas em dia' if ok else 'DESATUALIZADO: rode python3 racket/tools/reviews.py'); sys.exit(0 if ok else 1)
    for k, v in out.items(): open(os.path.join(DV, k), 'w', encoding='utf-8').write(v)
    if s2 != s: open(HTML, 'w', encoding='utf-8').write(s2)
    print(f'{len(R)} registros · {sum(r["elegibilidade"]=="elegivel" for r in R)} elegíveis · EVID para {len(EVID)} versões do catálogo')

if __name__ == '__main__':
    main()
