# RACKET DNA internacional: diagnóstico, arquitetura e estado (teste)

Branch `claude/racket-intl-test`. Nada daqui está no ar:

- a pasta `intl/` não entra no pacote do site, porque `scripts/package-site.mjs` tem lista fechada de pastas;
- o produto de pagamento internacional é recusado em modo live;
- as páginas são `noindex` e não têm canonical.

Mercados: Estados Unidos (en-US), Reino Unido (en-GB), Canadá (en-CA) e Austrália (en-AU).

## 1. Diagnóstico do que existia

| Peça | Onde | Dependência do Brasil |
| --- | --- | --- |
| App inteiro (landing, questionário, motor, prévia, relatório, comparador, PDF, cards) | `racket/index.html`, arquivo único de 354 KB | ~1.400 textos em português no HTML e no JS, com números em `pt-BR` |
| Motor (`target`, `zones`, `penalties`, `compute`) | `racket/index.html`, objeto `PESOS` | Ver as linhas abaixo |
| Disponibilidade no motor | `penalties` | `A.imp` (pergunta de importação), `r.br` (lojas no Brasil) e `PESOS.pen.nicho`, que define a presença da marca no Brasil |
| Orçamento no motor | `penalties` | `A.budget` em reais contra `r.price` em reais. A penalidade é relativa (preço ÷ orçamento), portanto independente de moeda |
| Mensagens lidas por regex | `COMPRA=/no Brasil|…/` e outras 7 regex | Texto em português |
| Catálogo de preços | `PRECO` | Valores em reais de lojas brasileiras; importadas = USD × 5,20 |
| Imagens de produto | — | O app de raquete não usa fotos de produto, só cards e gráficos próprios |
| Compra de raquetes | `assets/affiliates.js`, `assets/affiliate-offers.js` | Mercado Livre, no 1º lugar e nas alternativas |
| Checkout | `assets/payments/client.js` e `payments/src/*` | Pix e cartão, BRL fixo no cliente, no worker (`currency:'brl'`) e na medição |
| Medição | `assets/measurement.js` | Só aceita o host `sportdna.com.br` e caminhos fixos; valor em BRL |
| SEO | `seo.config.json`, `scripts/build-seo.mjs`, `sitemap.xml` | Canonical brasileiro |

### Riscos encontrados

1. **Traduzir dentro do arquivo brasileiro quebraria o Brasil.**
   - Há regex que leem as mensagens do motor (`COMPRA`, `/sua atual|no Brasil/`, `/Peso|Swingweight|…/`).
   - Há valores de código que são palavras em português (`'no'`, `'fica'`, `'controle'`, `'ficha'`).
   - Por isso a tradução é feita por um gerador, trecho a trecho, e as regex são traduzidas junto.
2. **A ausência da pergunta de importação.**
   - Sem `A.imp`, o motor já se comporta como "aceita importar".
   - A presença da marca no Brasil, porém, também pesava sem essa pergunta (`PESOS.pen.nicho`).
   - Solução: a disponibilidade passa a ser por país (seção 3).
3. **Preço por conversão de câmbio (proibido pelo pedido).** O catálogo internacional usa preço de varejo dos EUA, não reais convertidos.
4. **Checkout real.**
   - O worker `sportdna-payments-test` roda em modo live.
   - O produto internacional fica marcado `testOnly`: o worker o recusa em live antes de tocar no banco ou na Stripe.
5. **Domínio `.com.br`.**
   - Um ccTLD sinaliza Brasil ao Google e dificulta ranquear nos EUA, no Reino Unido, no Canadá e na Austrália.
   - É decisão de lançamento (checklist).

## 2. Arquitetura

```
racket/index.html (Brasil, intocado)
   │
   ├─ racket/tools/i18n/patches.mjs   mudanças de código só do internacional (find exato → replace; para se o BR mudar)
   ├─ racket/tools/i18n/lexer.mjs     acha cada texto visível (HTML, atributos, strings e templates do JS) com posição exata
   ├─ racket/tools/i18n/en.json       1.517 textos pt → en (chave = texto em português; "=" mantém; "tpl|a" = chave por contexto)
   ├─ racket/tools/i18n/locale.js     mercado, moeda, faixas de orçamento, unidades, disponibilidade por país
   ├─ racket/tools/i18n/measure.js    medição de teste (mesmos eventos, mais market/language/traffic_source/environment)
   └─ racket/tools/i18n/build.mjs  →  intl/en-us|en-gb|en-ca|en-au/racket/index.html + intl/assets/checkout.en.js
```

**Mesmo motor.** O gerador copia o JS do Brasil. Pesos e critérios não mudam: o teste P1 prova placar idêntico (seção 5).

**Sustentável.**

- Quando o Brasil muda um texto, o build para e lista o que falta traduzir (`faltando.json`).
- Quando um patch deixa de encaixar, o build diz qual.
- O build também falha se sobrar português na página gerada.
- Comando: `node racket/tools/i18n/build.mjs`.

**Reversível.** Apagar `intl/` e `racket/tools/i18n/` desfaz tudo. No pagamento, o produto `racket-report-intl` e a migração `0002_market.sql` não afetam pedidos brasileiros.

## 3. Decisões aplicadas

| Tema | Brasil | Internacional |
| --- | --- | --- |
| Pergunta "Compraria importada?" | Mantida | Removida. Uma resposta antiga `imp` não muda nada (teste P2) |
| Disponibilidade | Presença no Brasil: ProKennex e Volkl marginais; Tecnifibre, Prince, Dunlop e Solinco nicho; penalidade extra para quem não importa | Por país (MVP, a validar). Todas as marcas do catálogo estão no varejo especializado dos 4 países. ProKennex segue "marca especialista" com a mesma regra de produto: só sobe para quem tem dor que limita o jogo. Volkl e as outras deixam de ser nicho |
| Orçamento | Até R$ 1.400 / R$ 1.400–2.000 / acima | Faixas próprias de cada mercado (abaixo) |
| Preço das raquetes | Lojas brasileiras | Preço de referência local (abaixo) |
| Moeda do relatório | R$ 19,99 | US$ 9,99 nos 4 mercados (proposta; decisão comercial) |
| Imagens de produto | Não há fotos de produto | Idem. Nenhuma imagem de loja; layout sem espaço vazio |
| Compra de raquetes | Card Mercado Livre no 1º, 2º e 3º lugar | Nenhum botão, link, afiliado ou comparação de preço |
| "Oferta por tempo limitado" | Mantida | Removida: urgência sem prazo real é arriscada sob a CMA (Reino Unido) e a FTC (EUA) |
| Garantia | Art. 49 do CDC | "7-day guarantee" sem citar lei brasileira; política em inglês pendente |
| Unidades | cm, kg, g, mm | Altura e peso em ft/in e lb (US, CA) ou cm e kg (GB, AU), com troca na pergunta; a ficha mostra g + oz, mm + pts HL e grip 4 1/4 in (L2) |
| Nível | NTRP | NTRP, com a nota "se você usa UTR ou ranking de clube, vá pelas descrições" |
| Teste também (RUN, SURF) | Mostrado | Oculto (ainda não há inglês) |

### Faixas de orçamento por mercado

Os limites ficam entre os preços que concentram o catálogo; não são câmbio.

| Mercado | Faixa 1 | Faixa 2 | Faixa 3 |
| --- | --- | --- | --- |
| US | Under $200 | $200–260 | Over $260 |
| GB | Under £170 | £170–230 | Over £230 |
| CA | Under C$220 | C$220–290 | Over C$290 |
| AU | Under A$270 | A$270–350 | Over A$350 |

Nos EUA, 23 raquetes custam até $200, 90 até $260 e o resto fica entre $269 e $329.

### Preços de referência

Arquivo: `racket/tools/i18n/precos-mercado.json`, levantado em 18/11/2026.

- **USD:**
  - 175 de 183 com preço de loja: Tennis Warehouse na maioria, ou o MSRP da marca.
  - 8 estimados pela versão irmã.
- **GBP, CAD e AUD:**
  - 14 raquetes com preço real de loja local: All Things Tennis, Merchant of Tennis e Tennis Warehouse Australia.
  - As demais usam a mediana loja local ÷ loja dos EUA dessas 14: 0,87, 1,104 e 1,351.
- **Ressalva:** os números vieram de páginas indexadas, não da página ao vivo. Conferir antes do lançamento.

## 4. Pagamento (sandbox)

- **`payments/src/security.mjs`:**
  - Produto `racket-report-intl`: 999 centavos de USD, `testOnly`, só Stripe, mercados US, GB, CA e AU, com caminho de retorno por país.
  - `currencyOf()` por produto; os produtos brasileiros seguem em BRL.
- **`payments/src/worker.mjs`:**
  - Recusa o produto em live, recusa Pix, promo e país inválido.
  - Grava o `market`, envia `price_data` em USD e `metadata.sportdna_market`.
  - Valida moeda, valor, produto, país e modo no retorno e no webhook.
  - Pedido internacional nunca vira medição de venda (`saleMeasurement` exige live).
- **`payments/migrations/0002_market.sql`:** coluna `market`, usada só pelo produto internacional.
- **`payments/wrangler.sandbox.jsonc`:** worker, D1 e segredos separados (`sportdna-payments-sandbox`, `PAYMENTS_MODE=test`). Não foi publicado.
- **Página gerada:** `mode:'test'` e API vazia.
  - Sem API, o checkout fica desligado e a página mostra um simulador de teste ("Simulate an approved payment").
  - O simulador é bloqueado nos domínios de produção (`sportdna.com.br` e `sportdna.com`), onde aparece "pagamento indisponível" e nada é liberado.
  - Para ligar o sandbox: `node racket/tools/i18n/build.mjs --api=https://sportdna-payments-sandbox.<conta>.workers.dev`.

## 5. Testes executados (18/11/2026)

| Teste | Resultado |
| --- | --- |
| Arquivo brasileiro | `racket/index.html` só muda pelo pedido de relatório (branch `claude/racket-relatorio-ordem`, PR #150); o gerador não o altera |
| Regressão do motor BR (`racket/tools/regressao.mjs --base git:origin/main`) | 28/28 |
| Paridade P1 (`racket/tools/i18n/paridade.mjs`) | 300 perfis × 183 raquetes: placar idêntico entre BR e EN nas mesmas condições de compra |
| Paridade P2 | Sem pergunta de importação; uma resposta `imp` antiga não muda 100/100 resultados |
| Paridade P3 e P4 | Faixas e moeda certas nos 4 mercados; 183 preços por mercado; nenhum valor em reais |
| Diferença legítima (relatório) | Mesma 1ª raquete em 54% dos perfis (faixa de orçamento equivalente); 73% sem limite de orçamento. O resto vem de preço relativo e disponibilidade |
| Pagamento, worker (`payments/test`) | 41/41, incluindo 7 testes do produto internacional (live recusa, BRL, país, webhook, liberação, medição) |
| Pagamento, cliente EN (`racket/tools/i18n/checkout.test.mjs`) | 9/9: só cartão, $9.99, mercado no pedido; BRL, outro país, outro valor ou Pix nunca liberam |
| Pagamento, cliente BR (`tests/payment-prices.test.mjs`) | 12/12 |
| Navegador EN, US e GB, 390 e 1000 px, claro e escuro, exemplo e perfil até o relatório pago | 0 erro de JS, 0 NaN/undefined, 0 rolagem horizontal, axe 0 |
| Imagens e compra no EN | 0 cards de afiliado, 0 links de loja, 0 imagens de produto |
| SEO EN | `noindex, nofollow, noarchive`, sem canonical, `lang` por país; hreflang preparado em comentário |
| Pacote do site | `dist/site` sem `intl/` |

## 6. Pendências e checklist de lançamento

Ver `docs/racket/intl/lancamento.md`.
