# Lote 2 — reviews com página aberta (Claude, 2026-11-06)

Arquivo de dados: `lote2-claude-paginas-2026-11-06.jsonl` (um objeto JSON por linha, campos do schema do `LEIAME.md`). Coleta feita nesta sessão auxiliar; o arquivo foi gravado em dois commits da mesma sessão (parcial e final) e está fechado a partir do último commit.

## Como foi feito
- Cada página foi baixada com `curl` nesta sessão. `verificado_em` é a hora UTC do download; `http_status` é o código final (todos os registros têm 200).
- Fontes de URL: o índice `reviewedracquets.html` da Tennis Warehouse (o índice `learning_center/racquet_reviews/` dá 403), os sitemaps do Tennisnerd e do TennisCompanion, as URLs da #93 em hosts liberados (reabertas para verificar) e poucas buscas web.
- **Tennis Warehouse**: só a nota do painel conta, como uma review (`revisor_id: tw-painel`). As notas dos testadores individuais não viraram registros. `spin` = Topspin. Escala de 100 no layout antigo e de 10 no layout 2025+ (`escala_original`). Flex e swingweight medidos pela TWU vão em `indices_laboratorio`. O peso encordoado medido fica em `notas_evidencia`, não em `massa_g`. `massa_g` só é preenchido quando o nome da versão traz os gramas.
- **TennisCompanion**: tabela de notas 0–10 do autor, sem nota geral. No comparativo Shift 99 / 99 Pro, as notas de cada versão ficam no campo extra `notas_por_variante`, e o registro é um só (peso 1). Em duas páginas a tabela e o texto trazem números diferentes; copiei o valor da tabela e anotei "INCONSISTÊNCIA" em `notas_evidencia` (Speed Pro 2026 e Ultra 99 Pro v5).
- **tennis MAGAZIN**: Kontrolle e Power vão para `notas_originais` (escala 10). O Wingfield Score é medição digital e vai para `indices_laboratorio`. Spielgefühl e Optik ficam só em `notas_evidencia`.
- **TennisAddict**: as notas de 2023 em diante são letras (A–E). Não são números, então ficaram em `notas_evidencia`, com `notas_originais` vazio.
- **Tennisnerd, Tennis.com, Perfect Tennis**: sem nota numérica. `sentimento_interpretado.overall` (−2..+2, `anotador: claude`) foi lido do veredito ou resumo; é interpretação, não nota publicada. Sem veredito claro, o campo fica vazio. Tennisnerd está com `geografia: excecao` (sede em Malta).
- **Tennis Express**: blog de varejista que vende a raquete. Os textos são descritivos, sem nota. A data no HTML (2025-02-13) é igual em todos os posts, por isso `ano_publicacao` ficou vazio. Valor de evidência baixo.
- **Artigo que cobre mais de uma família** (ex.: EZONE 2022 "100 or 98", VCORE 2021/2023, Prince Tour 2026, Ultra v5, TFight 300/300S na Tennis.com): um registro por família, com o mesmo `grupo_duplicado` (`multi:...`). O peso total de 1 deve ser dividido entre eles.
- **Comparativo de versões da mesma família**: um registro, com `variant_id` listando as versões.
- Deduplicação: URL normalizada contra o lote 1 e contra a #93. No Tennisnerd, pelo ID numérico do artigo, porque a mesma matéria tem duas URLs. 195 registros substituem snippet da #93 (anotado em `notas_evidencia`).
- Ano = ano de publicação mostrado na página ("Review date" na TW, `datePublished` nos demais). `nivel_revisor` ficou vazio em todos: o "Ability" da TW é público-alvo, não nível do testador.

## Contagem por família (ordem de prioridade)
| Família | Registros | Grupos de duplicata (≈ peso) | Famílias de fonte independentes | Com nota publicada | Gerações registradas |
|---|---|---|---|---|---|
| Wilson Pro Staff 97 | 1 | 1 | 1 (tennisnerd) | 0 | v13 |
| Wilson Blade 98 | 12 | 12 | 5 (perfect-tennis, tennis-warehouse, tenniscompanion, tennisexpress, tennisnerd) | 4 | v10; v6 (Countervail); v7; v7 e v8; v8 e v9; v9 |
| Wilson Clash 100 | 8 | 8 | 4 (tennis-warehouse, tenniscompanion, tennisexpress, tennisnerd) | 2 | v1; v2; v3 |
| Head Speed | 7 | 7 | 3 (tenniscompanion, tennisexpress, tennisnerd) | 1 | 2022; 2024; 2024 (Auxetic 2.0, edição Legend 2); 2025; 2026 |
| Yonex EZONE 100 | 5 | 5 | 3 (perfect-tennis, tennis-warehouse, tennisnerd) | 2 | 2020 (6ª geração); 2022 (7ª geração); 2025 (8ª geração) |
| Babolat Pure Drive 98 | 6 | 6 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 2 | 2023; 2025 |
| Tecnifibre TF40 | 10 | 10 | 3 (tennis-warehouse, tennisaddict, tennisnerd) | 4 | 2019 (V1); 2022 (V2); 2024 (V3) |
| Head Gravity | 12 | 12 | 4 (tennis-warehouse, tennis.com, tennisexpress, tennisnerd) | 5 | 2021; 2023; 2025 |
| Head Radical | 9 | 9 | 4 (tennis-warehouse, tennis.com, tennisexpress, tennisnerd) | 3 | 2023; 2025 |
| Head Extreme | 15 | 15 | 4 (tennis-warehouse, tennisaddict, tennisexpress, tennisnerd) | 6 | 2020 (Graphene 360+); 2022; 2024; 2026 |
| Head Prestige | 8 | 8 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 4 | 2021; 2023 |
| Yonex VCORE 98 | 9 | 9 | 3 (tennis-warehouse, tennisexpress, tennisnerd) | 3 | 2018 (5ª geração); 2021 (6ª geração); 2023 (7ª geração); 2026 (8ª geração) |
| Yonex VCORE 100 | 6 | 6 | 3 (tennis-warehouse, tennisexpress, tennisnerd) | 2 | 2018; 2021 (6ª geração); 2023 (7ª geração); 2026 (8ª geração) |
| Yonex EZONE 98 | 11 | 11 | 4 (tennis-warehouse, tenniscompanion, tennisexpress, tennisnerd) | 3 | 2020 (6ª geração); 2022 (7ª geração); 2025 (8ª geração) |
| Wilson Ultra 100 | 6 | 6 | 4 (tennis-warehouse, tennis.com, tennisexpress, tennisnerd) | 1 | v3; v4; v5 |
| Wilson Shift 99 | 7 | 7 | 4 (tennis-warehouse, tennisaddict, tenniscompanion, tennisnerd) | 3 | v1 |
| Yonex Percept 97 | 9 | 9 | 6 (perfect-tennis, tennis-warehouse, tennis.com, tennisaddict, tenniscompanion, tennisnerd) | 4 | 2023; 2023 (1ª geração Percept); 2026 (2G-Namd) |
| Yonex Percept 100 | 7 | 7 | 4 (perfect-tennis, tennis-warehouse, tennis.com, tennisnerd) | 2 | 2023; 2023 (1ª geração Percept) |
| Head Boom | 9 | 9 | 3 (tennis-warehouse, tennisexpress, tennisnerd) | 4 | 2022; 2024; 2026 |
| Head Instinct | 4 | 4 | 2 (tennis-warehouse, tennisnerd) | 2 | 2019 (Graphene 360); 2020 (Graphene 360+); 2022; 2025 |
| Prince Phantom 100X | 6 | 6 | 2 (tennis-warehouse, tennisnerd) | 4 | 2020; 2024; 2025 (O3) |
| Prince Tour 100 | 9 | 9 | 3 (tennis-warehouse, tennisaddict, tennisnerd) | 6 | 2018 (Textreme Tour); 2019 (Textreme Tour); 2022 (ATS Textreme Tour); 2026 |
| Tecnifibre TFight 100 | 4 | 4 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 1 | 2025 |
| Wilson Blade 100 | 6 | 6 | 3 (tennis-warehouse, tenniscompanion, tennisnerd) | 3 | v10; v7; v9 |
| Wilson Blade 104 | 4 | 4 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 1 | v7; v8; v9 |
| Wilson Clash 108 | 1 | 1 | 1 (tenniscompanion) | 0 | v2 |
| Wilson Burn 100 | 6 | 6 | 2 (tennis-warehouse, tennisnerd) | 3 | v1 (2015); v3 (Countervail); v3 (Countervail, 2017); v4; v5 |
| Wilson RF 01 | 6 | 6 | 4 (tennis-warehouse, tennisaddict, tennisexpress, tennisnerd) | 3 | 2024 (1ª geração) |
| Wilson Pro Staff 100 | 3 | 3 | 2 (tennis-warehouse, tennisnerd) | 2 | v14 |
| Wilson Blade 101 | 0 | 0 | 0 | 0 | — |
| Wilson Ultra 99 | 5 | 5 | 5 (tennis-warehouse, tennis.com, tenniscompanion, tennisexpress, tennisnerd) | 2 | v5 |
| Wilson Ultra Pro 97 | 5 | 5 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 2 | v3; v4 |
| Wilson Ultra Power 100 | 0 | 0 | 0 | 0 | — |
| Head Speed 97 | 3 | 3 | 3 (tennis-warehouse, tennisexpress, tennisnerd) | 1 | 2026 |
| Head Speed 105 | 0 | 0 | 0 | 0 | — |
| Head Gravity 104 | 0 | 0 | 0 | 0 | — |
| Head Radical 102 | 0 | 0 | 0 | 0 | — |
| Head Prestige 95 | 3 | 3 | 3 (tennis-warehouse, tennis.com, tennisexpress) | 1 | 2023 |
| Head Extreme 105 | 1 | 1 | 1 (tennisnerd) | 0 | 2022 |
| Head Instinct 107 | 0 | 0 | 0 | 0 | — |
| Head Instinct 110 | 0 | 0 | 0 | 0 | — |
| Head Boom 107 | 0 | 0 | 0 | 0 | — |
| Head Ti S6 | 0 | 0 | 0 | 0 | — |
| Babolat Pure Strike 97 | 3 | 3 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 1 | 2024; 2024 (4ª geração) |
| Babolat Evo Aero | 3 | 3 | 2 (tennisaddict, tennismagazin) | 2 | 2023 |
| Babolat Evo Drive Tour | 1 | 1 | 1 (tennismagazin) | 1 | 2023 |
| Babolat Boost Drive | 0 | 0 | 0 | 0 | — |
| Babolat Boost Aero | 0 | 0 | 0 | 0 | — |
| Babolat Boost Strike | 0 | 0 | 0 | 0 | — |
| Yonex EZONE 105 | 0 | 0 | 0 | 0 | — |
| Yonex VCORE 95 | 3 | 3 | 2 (tennis-warehouse, tennisnerd) | 2 | 2018 (5ª geração); 2023 (7ª geração); 2026 (8ª geração) |
| Dunlop FX 500 | 4 | 4 | 3 (perfect-tennis, tennis-warehouse, tennisnerd) | 1 | 2020 (v1); 2023 (v2); 2026 |
| Dunlop CX 200 Tour | 4 | 4 | 3 (tennis-warehouse, tennis.com, tennisnerd) | 2 | 2021; 2024 |
| Volkl Vostra V1 99 | 1 | 1 | 1 (tennis-warehouse) | 1 | 2025 |
| Volkl Vostra V1 102 | 2 | 2 | 1 (tennis-warehouse) | 2 | 2017 (V-Sense, antecessora); 2024 |
| Volkl Vostra V8 | 2 | 2 | 1 (tennis-warehouse) | 2 | 2024 |
| Volkl Vostra V9 | 3 | 3 | 2 (tennis-warehouse, tennis.com) | 2 | 2024 |
| Volkl Vostra V10 | 3 | 3 | 2 (tennis-warehouse, tennis.com) | 2 | 2024 |
| Volkl V1 Classic | 1 | 1 | 1 (tennismagazin) | 1 | 2023 |
| Prince Ripstick 100 | 3 | 3 | 2 (tennis-warehouse, tennisnerd) | 2 | 2021 (1ª geração); 2025 |
| Prince Phantom 100P | 4 | 4 | 2 (tennis-warehouse, tennisnerd) | 3 | 2018; 2020; 2024 |
| Prince Phantom 107 | 2 | 2 | 1 (tennis-warehouse) | 2 | 2020; 2024 |
| Prince Tour 98 | 3 | 3 | 2 (tennis-warehouse, tennisnerd) | 2 | 2022 (ATS Textreme Tour); 2026 |
| Tecnifibre TFight 98 | 9 | 9 | 4 (tennis-warehouse, tennis.com, tennisaddict, tennisnerd) | 3 | 2022 (Isoflex); 2025 |
| ProKennex Ki Q+ Tour | 5 | 5 | 2 (tennis-warehouse, tennisnerd) | 4 | 2019; 2023; 2026 |
| ProKennex Black Ace 97 | 2 | 2 | 2 (tennis-warehouse, tennisnerd) | 1 | 2025 |
| ProKennex Black Ace 100 | 4 | 4 | 1 (tennis-warehouse) | 4 | 2020; 2021; 2025 |
| ProKennex Black Ace 105 | 1 | 1 | 1 (tennis-warehouse) | 1 | 2022 |

- Por família de fonte: tennis-warehouse 116, tennisnerd 97, tennis.com 22, tennisexpress 22, tenniscompanion 12, tennisaddict 8, perfect-tennis 5, tennismagazin 4
- Por método de nota: publicada 127, interpretada 105, nenhuma 54
- Registros que substituem snippet da #93: 195
- Total: 286 registros, 55 famílias com pelo menos um registro (de 68 da lista).


## Duplicatas encontradas (abertas e não registradas)
- `tennis-warehouse.com/learning_center/racquet_reviews/HSPDMreview.html`: já no lote 1
- `tennis-warehouse.com/learning_center/racquet_reviews/HSPDPreview.html`: mesmo texto/notas de HSPDPL (lote 1)
- `tennis-warehouse.com/learning_center/racquet_reviews/HSMPL5review.html`: mesmo texto/notas de HSPMP6 (lote 1)
- `tennis-warehouse.com/learning_center/racquet_reviews/HSPPL5review.html`: mesmo texto/notas de HSPDP6 (lote 1)
- `tennis-warehouse.com/learning_center/racquet_reviews/WB18Vreview.html`: já no lote 1
- `tennis-warehouse.com/learning_center/racquet_reviews/WB9816review.html`: já no lote 1
- `tennis-warehouse.com/learning_center/racquet_reviews/W97V14review.html`: mesmo texto/notas de WNPS97 (lote 1)
- `tennis-warehouse.com/learning_center/racquet_reviews/WPS97Creview.html`: Pro Staff 97 Classic: texto de abril/2023 de WNPS97 (lote 1) revisado jan/2026, mesmas notas
- `tennis-warehouse.com/learning_center/racquet_reviews/CL103Vreview.html`: mesmo texto do teste original do Clash 100 v3 (WCBAR, lote 1)
- `tennis-warehouse.com/learning_center/racquet_reviews/EZ10BBreview.html`: mesmo texto do teste original EZONE 100 2025 (EZ10EB, lote 1)
- `tennis-warehouse.com/learning_center/racquet_reviews/PERMreview.html`: pintura Midnight Navy de PERC
- `tennis-warehouse.com/learning_center/racquet_reviews/PS97DNreview.html`: 2-Pack de PS97SN
- `tennis-warehouse.com/learning_center/racquet_reviews/TFB305review.html`: TFight Blue de TF305S
- `tennis-warehouse.com/learning_center/racquet_reviews/CX26LEreview.html`: fora das famílias-alvo (CX 200)
- `tennis-warehouse.com/learning_center/racquet_reviews/WB9810review.html`: TW original de WB9810 (lote 1 registrou a cópia da TW Europe)
- `tennis-warehouse.com/learning_center/racquet_reviews/PERC1Dreview.html`: mesmo texto/notas de PERM1D
- `tennis-warehouse.com/learning_center/racquet_reviews/PS97Sreview.html`: mesmo texto/notas de PS97SN
- `tennis-warehouse.com/learning_center/racquet_reviews/Q5PKIYreview.html`: fora das famílias-alvo
- `tennis-warehouse.com/learning_center/racquet_reviews/DF50Treview.html`: FX 500 Tour fora das famílias-alvo
- `tennis-warehouse.com/learning_center/racquet_reviews/VKLV8review.html`: V-Feel V8 Pro: modelo antecessor diferente do Vostra V8, sem família no catálogo
- Cópias de textos da TW registradas uma vez só (URLs anotadas em `notas_evidencia` do registro TW): TW Europe `PD98R`, `HPPR`, `YVC956` (= VC958G), `WRF1R` (alemão), `315PBA` (= PBA315), `PT290` (= ATR290), `PKQT19`, `WC10V3` (= Clash 100 v3, já no lote 1); Tennis Only `LEZ10B`, `HPRR`, `ATR290`, `VOSV1M`. Conferi as notas: são iguais.
- TennisAddict "Shift 99 session de soirée" = mesmo texto do Shift 99 300 v1.
- `PT1001` (Textreme Tour 100 310, 2018) só abriu na TW Europe (a URL na TW deu 404). Foi registrado a partir da TW Europe, com `grupo_duplicado tw:PT1001`.

## URLs que falharam ao abrir
- TennisAddict (reset de conexão intermitente no proxy; várias tentativas espaçadas): `tests/tecnifibre-tf40/`, `tests/tecnifibre-t-fight-300s-2025/`, `tests/wilson-shift-99-300-wlabs-edition/`, `tests/yonex-vcore-100-gen-8-2026/`, `tests/head-boom-mp-2026/`, além do índice `tests/` e do sitemap (por isso a TennisAddict ficou com poucas páginas).
- Tennishead (proxy recusa `tennishead.net` e `www.tennishead.net`): `racket-review-pro-kennex-kiqtour/`, `babolat-evo-drive-tour-buyers-guide/`, `wilson-burn-100-v5-review/`, `wilson-pro-staff-v14-review/` (achada na busca, não aberta).
- TW 404 (códigos tentados para achar o original de cópias da TW Europe): `PT1001`, `YVC956`, `WC10V3`, `315PBA`, `PT290`.
- Tennis Express `blogs/news/wilson-ultra-100-tennis-racquet-review`: HTTP 500.
- `racquetsportsindustry.com`: sem conexão.

## Páginas abertas e não registradas (não são review de quadra)
Prévias e anúncios sem teste (Tennisnerd: Clash V3, Ultra V4, Blade 100 V8 "review to come", página "Dunlop CX 2024"); apresentação da linha FX 500 2026; Tennisnerd "VCORE 2026" (comparativo de linha inteira, sem sentimento separável por família); páginas de specs e cordas do TennisCompanion (Clash v2, Blade 18x20 v8); páginas de produto com avaliações de clientes (Tennis Express); guias e listas de melhores (TennisCompanion, Tennisnerd, TW); Volkl V1 Evo (sem família no catálogo); Prince Ripstick 98, Ripcord, Solinco, Mizuno, Pure Aero, Pure Drive 100, Pure Strike 98/100, CX 200, CX 400, SX 300 e Fire (fora da lista).

## Lacunas
- **Sem nenhuma review encontrada**: Wilson Blade 101, Wilson Ultra Power 100, Head Speed 105 (Team), Gravity 104 (Team), Radical 102 (Team), Instinct 107/110, Boom 107 (Team), Ti S6, Babolat Boost Drive/Aero/Strike, Yonex EZONE 105. Para esses modelos leves e de entrada, as buscas só devolvem páginas de produto, avaliações de clientes e listas de "melhores para iniciante". Não achei teste de quadra dedicado.
- **Top 5, fontes novas fora do lote 1**: quase todas as reviews da TW dessas famílias já estavam no lote 1, direto ou como repintura. O ganho veio de Tennisnerd, TennisCompanion e Tennis Express.
  - Pro Staff 97: só 1 registro novo (Tennisnerd v13). Tennishead v14 está bloqueada, e o TennisCompanion v14 já estava no lote 1.
  - Head Speed: só 1 nota publicada nova (TennisCompanion Speed Pro 2026).
- **Uma fonte só** (família de fonte independente = 1): Wilson Clash 108, Pro Staff 97, Pro Staff 100, Blade 104, Volkl Vostra V8 e V1 99, ProKennex Black Ace 97/100/105, Phantom 100P e 107, Ripstick 100, Prince Tour 98, Head Extreme 105, Volkl V1 Classic, Evo Drive Tour e outras (ver tabela). Pela regra do motor, essas famílias ainda não movem ranking.
- Famílias com várias gerações: a geração está em `geracao`/`variant_id`. Nenhuma nota foi transferida entre variantes.
- O TennisAddict tem muito mais testes das famílias-alvo; vale nova tentativa quando a conexão estabilizar.

## Resumo final
286 registros com página aberta e lida, 55 das 68 famílias da lista, 8 famílias de fonte:
- Tennis Warehouse: 116 (painel; inclui 1 da TW Europe)
- Tennisnerd: 97
- Tennis.com: 22
- Tennis Express: 22
- TennisCompanion: 12
- TennisAddict: 8
- Perfect Tennis: 5
- tennis MAGAZIN: 4

Por método de nota: 127 com nota publicada, 105 com sentimento interpretado, 54 sem nota. A coleta foi encerrada por pedido da sessão principal (a busca web passou para o Codex).
