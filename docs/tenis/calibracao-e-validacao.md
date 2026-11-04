# Tenis Match — calibração e validação com reviews (out/2026)

## Rodada 7: orçamento em 4 faixas, com mais de uma marcada (04/nov/2026)
- **Pergunta nova:** "Quanto pretende investir?" com 4 faixas e marcação múltipla ("Pode marcar mais de uma faixa."): Até R$ 500 · R$ 500 a 1.000 · R$ 1.000 a 1.500 · Acima de R$ 1.500 ou sem limite ("Mostramos o melhor, custe o que custar"). No catálogo: 32 tênis até R$ 500, 71 de R$ 500 a 1.000, 65 de R$ 1.000 a 1.500 e 44 acima. Antes eram 6 opções de escolha única (até R$ 400, 400 a 700, 700 a 1.000, 1.000 a 1.500, acima de 1.500, sem limite).
- **Regra:** a janela vai do menor piso ao maior teto marcados (faixas salteadas, como 1ª + 3ª, cobrem tudo entre elas). Com a última faixa marcada não há teto (nada fica "acima do orçamento"); marcada sozinha, também não há piso. Tudo sai de `budget(a)` em `run/index.html` (`min`, `max`, `semLimite` e `lvl`, o nível antigo pelo teto: 0 até R$ 500, 2 até R$ 1.000, 3 até R$ 1.500, 4 sem teto), usado nas regras de supertênis, na faixa de entrada e no índice de custo por km. Textos do relatório descrevem a janela ("até R$ 1.000", "de R$ 500 a R$ 1.500", "a partir de R$ 1.000, sem limite", "sem limite de preço").
- **Respostas antigas** (pagamento retomado com `orc` de 0 a 5): 0 → até R$ 500; 1 → até R$ 1.000 (faixas 1 e 2); 2 → R$ 500 a 1.000; 3 → R$ 1.000 a 1.500; 4 e 5 → acima de R$ 1.500 ou sem limite. Valor inválido cai em até R$ 1.000.
- **Leitura dos casos (`calibrar.mjs`):** orçamento em R$ vira a faixa que o contém; sem orçamento, a última faixa (como era "sem limite"); guias de até US$ 110 e guias "baratos" sem valor, até R$ 500. `cobertura.mjs` testa as faixas sozinhas e em pares.
- **Medição (antes → depois, mesmas ferramentas):**

| Métrica | Antes | Depois |
|---|---|---|
| Top 3 (234 casos) | 30,8% | 29,5% |
| Top 10 | 54,3% | 50,4% |
| MRR | 0,287 | 0,274 |
| Distância de marcas para os especialistas (L1, top 3) | 27,7 | 28,6 |
| Pódios com 2+ contraindicações sérias (5.000 perfis, 15.000 vagas; 22% dos perfis marcam 2 faixas) | 33 | 19 |
| 1º acima do teto (perfis com teto) | 11,6% (390 de 3.356) | 13,0% (460 de 3.526) |
| 1º mais de 8% acima do teto | 11,6% | 6,6% (233) |
| Tênis diferentes em 1º | 126 | 118 |
| Cobertura: 1º para algum perfil / pódio / fora do top 10 | 145 / 179 / 3 | 138 / 174 / 4 |

- **Onde piorou:** só nos 42 casos com orçamento declarado (os 192 sem orçamento ficam iguais). Os guias "baratos" indicam muito tênis de R$ 500 a 700, e o corte de R$ 700 deixou de existir: com teto de R$ 500 eles saem, com teto de R$ 1.000 entram os de R$ 900. É efeito das faixas, não dos pesos.
- **Pesos do orçamento (`--ajustar --so=orc`):** a única troca aceita pela validação cruzada foi `orcTeto` 12 → 6 (top 3 +0,4 ponto, top 10 igual), que leva o 1º mais de 8% acima do teto de 6,6% para 9,2% dos perfis. Recusada: pesos ficam como estavam. `orcPor150` 1 → 2 daria top 10 51,7% e menos 1º acima do teto, mas não passa na validação cruzada (fica anotado para a próxima rodada).
- **PDF reorganizado (mesmo dia):** veredito, ranking e pódio, método e dados, sua corrida × o tênis e, por último e compacto, o guia de compra (ajuste, troca, adaptação, alertas, checklist, "se não trocar agora"). Saiu o quadro "De onde vem a escolha" (barras de pontos do placar); "por que o atual ficou para trás" agora explica em palavras.
- **Exemplo pronto** (orçamento "R$ 500 a 1.000", o mais perto do antigo "R$ 400 a 700"): Nike Vomero 18 (96%); 2º New Balance 1080 v15 (94%) e 3º Nike Winflo 12 (91%). Com teto de R$ 1.000 o Winflo 12 não é mais o 1º. Imagem do relatório e cards refeitos.

## Abertura com números grandes e PDF local (03/nov/2026)
- **Abertura:** o quadro "O motor" virou uma faixa de 6 números: 1.755 reviews (soma de `nr` no catálogo), 37 critérios por tênis (`Q.length+8+6+4`), 41 estudos (títulos distintos em `dados/ciencia.json`; 47 citações), 234 recomendações de especialistas de 35 fontes (casos úteis em `dados/casos.json`), 5.000 perfis simulados (teste de segurança) e 31% de pódios com um tênis indicado pelos especialistas contra cerca de 2% ao acaso (`run/tools/calibrar.mjs`: 30,8% top 3 e 54,3% top 10 nos 234 casos; acaso calculado em 2,1%). Saíram os números de efeito (cruzamentos por análise e combinações possíveis).
- **Conferido de novo em 03/nov:** pódios com 2+ contraindicações sérias: 32 em 15.000 (5.000 perfis, mesma semente e mesmo sorteio da rodada 6).
- **Texto corrigido:** "Cumulus 28 declara 8 mm e mede cerca de 12" (o catálogo tem 12 mm); "segundo par: um dos outros 211" (era 31, do catálogo antigo). No PDF, página 5, o "85% dos 500 perfis" (rodada 4, motor antigo) virou o 31% contra especialistas.
- **Exemplo pronto:** Nike Winflo 12, DNA 96%; 2º Mizuno Wave Sky 9 (93%) e 3º Under Armour Infinite Pro (90%). Imagem do relatório e cards já batem com o motor.
- **PDF:** bibliotecas em `assets/vendor/` (sem CDN), gerado em segundo plano quando o relatório pago aparece; clique baixa na hora, ou mostra "Abrir o PDF" quando ainda está gerando; "Tentar de novo" no erro.

## Rodada 6: auditoria de dados, marcas e cobertura (nov/2026)
- **Auditoria com fonte de 63 modelos** por 6 agentes (Nike, Puma, ASICS, Brooks, Mizuno, New Balance, modelos fracos), registro em `dados/auditoria-nov2026.json`. Ex.: Pegasus 42 maciez 2,4 → 3,0 e aprovação 3,8 → 4,1, sem “pé largo” e “longão”; Novablast 6 e Superblast 3 com aprovação maior; Wave Rider 30, Neo Vista 3, Neo Zen 2 e SC Trainer v3 com resposta menor.
- **9 “importados” são vendidos no Brasil** (7 New Balance, On Cloudsoma, adidas Prime X3 e Takumi Sen 11): 189 dos 212 vendidos aqui.
- **18 contradições de etiquetas** resolvidas (contraindicação vale; em tênis rápido, “não indicado para ritmo” sai).
- **Motor:** ressalvas leves com valor fixo (não escalam com a contraindicação séria); categorias vizinhas (ex.: treino rápido versátil para treino diário); quem relatou desconforto com neutro só recebe estabilidade no topo e tênis sem apoio perde 4.
- **Resultado (234 casos):** top 3 26% → 31%; top 10 47% → 54%. Marcas perto das dos especialistas (ver `validacao.md`); pódios com 2+ contraindicações sérias: 32 em 15.000.
- **Cobertura (`run/tools/cobertura.mjs`):** 179 dos 212 tênis chegam ao pódio para algum perfil e 145 são 1º lugar. Fora: 6 Fila (regra), 6 importados e 21 dominados por um irmão mais barato ou mais bem avaliado, quase todos de entrada. Todos menos 3 entram no top 10 de algum perfil.

## Rodada 5: ciência e calibração com especialistas (nov/2026)
- **Ciência:** cada regra do motor revisada contra a literatura (`ciencia.md`). Mudanças: menos maciez “de presente” para 85 kg+ (Malisoux 2020: maciez protegeu os leves), base estável para pesados, maciez para até 65 kg, supertênis fora para quem pediu estabilidade, textos sem promessa de prevenção.
- **Pergunta nova:** “Onde o seu tênis gasta mais?” (8 opções) no lugar de “Que parte do pé toca o chão primeiro?”.
- **Pesos numa tabela (`PESOS`)** e calibração contra 304 casos de especialistas (`validacao.md`, `run/tools/calibrar.mjs`). Top 3: 16% → 26%; top 10: 36% → 47%. Pódios com 2+ contraindicações sérias: 130 → 61 em 15.000.
- **Fica para a próxima:** reviews dos 48 modelos fracos (busca esgotou), revisão das etiquetas e notas de Nike, ASICS, Brooks e Puma, e validação com corredores reais.

## Rodada 4: gráficos e ranking coerentes (28/out/2026)
Mesma checagem feita no Racket Match (PR #20): o relatório mostra uma meta e o 1º lugar a contradiz?

**Onde o Tenis podia se contradizer:**
1. **Categoria ideal.** A prévia diz "Categoria ideal: X" e o relatório diz "apontam para a categoria X", mas o motor deixava a 2ª categoria a 2 ou 4 pontos da 1ª. No exemplo pronto, o texto falava em máximo amortecimento e o 1º era um treino diário (Corre 5).
2. **Hexágono "O que você precisa".** A linha laranja mostrava a resposta pedida sem o teto que o motor usa (resposta até 6 fora das categorias de velocidade, Rodada 3). O relatório marcava "Resposta um pouco abaixo do ideal" num tênis que o motor escolheu de propósito por não precisar de mais resposta.

Simulação com 500 perfis aleatórios (todas as respostas sorteadas, mesma semente). "Zona" = categoria ideal com preço até 8% acima do teto do orçamento.

| Versão | 1º na categoria ideal | 1º dentro da zona | Fora da zona havendo tênis dentro | Acima do orçamento (+8%) | Tênis diferentes em 1º | Ultraboost 5 em 1º |
|---|---|---|---|---|---|---|
| Antes | 78% | 71% | 54 (11%) | 40 | 75 | 17 |
| ±4 no Match só pela categoria, sem olhar preço | 93% | — | — | 68 | 73 | 42 |
| ±4 no Match pela zona (categoria + orçamento) | 87% | 80% | 10 (2%) | 39 | 73 | 40 |
| **Publicado: ±4 pela zona, ±2 em categoria com menos de 10 modelos** | **85%** | **78%** | **20 (4%)** | **39** | **75** | **31** |

- Só a categoria (2ª linha) empurrava o 1º para fora do orçamento (40 → 68 perfis). Por isso a zona inclui o preço.
- A versão com ±4 em tudo trazia de volta o monopólio do Ultraboost 5 em conforto e uso misto (5 modelos), o problema que a Rodada 3 tinha resolvido. Em categoria pequena o bônus cai para ±2.
- Hexágono desenhado com a meta do motor: 1º com algum índice "um pouco abaixo do ideal" caiu de 311 para 205 perfis (62% → 41%). O que sobra é quase todo amortecimento (115 perfis), uma troca real que o chip vermelho já mostra.
- Marcas em 1º (antes → depois): adidas 122 → 134, ASICS 66 → 67, Mizuno 62 → 62, Olympikus 61 → 57, Hoka 62 → 55, New Balance 42 → 43, Brooks 37 → 34, Nike 23 → 24, Puma 15 → 15, On 8 → 7.
- Exemplo pronto: o 1º passa de Olympikus Corre 5 (treino diário) para Olympikus Corre Max 2 (máximo amortecimento), coerente com o texto. Custo: fôrma padrão para quem tem pé largo e specs só da ficha; os dois aparecem no relatório.
- **Exemplo pronto, 28/out/2026:** a largura do pé passou de larga para normal, para o exemplo não recomendar fôrma padrão a quem tem pé largo. Novo pódio: Mizuno Wave Sky 9 (máximo amortecimento, R$ 699,89, 96%), Olympikus Corre Max 2 (92%) e Olympikus Corre 5 (77%). Ponto de atenção que fica: drop de 4,4 mm para quem pisa de calcanhar (o relatório avisa).

**Regra no motor:**
- `ZONA = 2` no placar (±4 no Match): tênis na categoria ideal e com preço até 8% acima do orçamento soma; o resto perde. Em categoria com menos de 10 modelos, metade (`ZONA_PEQ`).
- O hexágono e os chips usam a meta que o motor usa (`r.ID`), não a meta crua das respostas.
- Quando o 1º ainda fica fora da zona (112 de 500 perfis, 92 deles sem nenhum tênis na zona, por exemplo estabilidade com orçamento até R$ 700), o relatório diz em "Pontos de atenção": "Fica fora da sua categoria ideal (X, até R$ Y): é da categoria Z. O melhor dentro dela, W, ficou N pontos atrás (motivo)." O motivo é o fator em que o tênis da zona mais perdeu para o 1º; sem tênis na zona, diz que nenhum cabe no orçamento.
- Nenhum texto com "NaN" ou "undefined" nos 500 perfis.

## Rodada 4: Nike em perfis comuns (28/out/2026)
- Queixa: corredor com bom ritmo e 10 a 20 km por semana não via Nike. Em 3.000 variações desse perfil, a adidas era 1º lugar em 39% e a Nike em 2% (top 3: 4%).
- O melhor Nike costuma ser o Winflo 12, que perde por pouca review profissional (2, mas 8 de clientes), peso (299 g) e falta de etiquetas de uso. O Pegasus 42 perde por maciez medida baixa (2,4) e cinco etiquetas "não indicado".
- **Mudanças:** etiquetas de preferência (calor, longão, ritmo leve, iniciante, uso diário, asfalto) pesam 40% (`LEVE`); reviews de clientes contam como evidência (×0,35) na penalidade de poucas reviews; tênis sem etiqueta de uso perde 0,5 (era 1).
- **Resultado:** no perfil da queixa, Nike no top 3 de 4% para 6%; nos 5.000 sorteados, de 8% para 10%. Pódios com etiqueta séria (pé largo, peso, pronação, Aquiles, trilha técnica, pisada) caíram de 1.751 para 1.552. Casos de referência iguais (maratona competitiva, desconforto com neutro).
- O resto da diferença vem dos dados da Nike, não do motor: subir mais seria favorecer marca.

## Rodada 3: viés de marca (25/out/2026)
- Teste com 40 perfis realistas (6 a 8 por objetivo, orçamentos de até R$ 400 a acima de R$ 1.500) e 5.000 perfis sorteados com todas as respostas.
- **Vieses encontrados:** (1) etiqueta "não indicado" tirava 4 pontos por etiqueta, e marcas com mais reviews (Nike, ASICS) acumulam mais etiquetas; "não indicado para ritmo" punia até tênis de amortecimento; (2) pouca review era vantagem (Fila, Olympikus); (3) qualquer preço dentro do orçamento ganhava o mesmo bônus; (4) categoria com poucos modelos virava monopólio (Ultraboost 5 em "dia a dia"); (5) "prioridade conforto" somava maciez mesmo para quem prefere firme (prejudicava a On); (6) o motor pedia resposta de supertênis para quem prefere firme.
- **Mudanças no motor:** encaixe por specs técnicas (amortecimento, resposta, leveza e estabilidade do hexágono contra o que o perfil pede; falta pesa 0,45 por ponto, sobra 0,12; leveza só pesa para quem pediu leveza ou faz ritmo; resposta limitada a 6 fora das categorias de velocidade); etiqueta negativa de 3 a 4 pontos conforme o nº de reviews, teto 7; "não indicado para ritmo" vale 35% quando o tênis não é de velocidade; nota das reviews puxada para a média com pouca evidência (peso n/(n+4)); −0,45 por review profissional a menos que 4; preço estimado −0,6; abaixo da faixa de orçamento perde até 2 pontos (exceto prioridade preço); até 8% acima perde 0,5; categoria com menos de 10 modelos dá 8 pontos à 2ª categoria.
- **Origem das specs:** 27 tênis têm todas as medidas redondas (maciez, resposta, estabilidade, salto, antepé e drop), sinal de specs da ficha da marca sem medição de laboratório: Olympikus 10, Fila 5, 361° 4, adidas 3, Mizuno 2, New Balance 2 e On 1. Eles perdem 1,2 ponto (`FICHA`) e o relatório mostra a origem ("specs de laboratório" ou "specs da ficha da marca").
- **Decisão editorial:** a Fila não entra no pódio nem como segundo par (`PODIO_FORA`). Continua no top 10 e no ranking por marca.

| 1º lugar nos 40 perfis | Antes | Depois |
|---|---|---|
| adidas | 12 | 10 |
| ASICS | 6 | 8 |
| Nike | 4 | 7 |
| New Balance | 2 | 4 |
| Olympikus | 5 | 4 |
| Hoka | 2 | 3 |
| Mizuno | 2 | 2 |
| Brooks | 0 | 2 |
| Fila | 7 | 0 |

Nos 5.000 sorteados, 1º lugar: adidas 23,8% · ASICS 14,8% · Olympikus 14,0% · Mizuno 11,6% · Hoka 10,9% · Brooks 8,1% · Nike 5,6% · New Balance 5,1%. Com orçamento até R$ 700 a Nike quase não aparece porque os modelos de entrada dela têm maciez de 1,5 a 2,3 e várias etiquetas negativas; de R$ 1.000 a 1.500 ela fica em 1º em 12%.

- **Sem piora:** nenhum pódio fora da categoria (0/120 e 0/15.000); pódios com 2+ contraindicações reais 91 → 93 em 15.000 vagas; pódios com preço estimado 1.080 → 133. Maratona competitiva: Vaporfly 4, Hyperwarp Elite, Metaspeed Sky Tokyo. Desconforto com neutro: GT-2000 15, Wave Inspire 22, ForeverRun Nitro 2.
- **On:** com orçamento acima de R$ 1.000 e preferência por firme, aparece em 93 vagas de pódio (era 143 no motor antigo e 69 na primeira versão desta rodada). Nenhum On custa menos de R$ 999, a nota média das reviews é a menor entre as marcas grandes (3,74) e a resposta medida é baixa em vários modelos (Cloudflow 5: 1,6 de 5).
- **Pendências:** medir em laboratório (ou achar medição) dos 27 tênis só com ficha; a Olympikus ainda lidera até R$ 400 (36%) por falta de alternativa medida nessa faixa. Conferir "vendido no Brasil" de New Balance (52% marcados como importados) e Salomon (75%), e a resposta da On.

## Rodada 2: validação com reviews profissionais
- 8 agentes percorreram os 231 tênis. Só reviews profissionais com teste real ou de laboratório (RTINGS, RunRepeat, Doctors of Running, Road Trail Run, Believe in the Run, Running Shoes Guru, The Run Testers, Solereview, Running Warehouse, iRunFar, OutdoorGearLab, Tom's Guide e blogs BR com teste real para a Olympikus).
- +293 reviews novas em 138 modelos. Base: 795 → **1.088 reviews**.
- Sem review profissional (46 modelos): quase todos de entrada (Olympikus Pride, Veloz, Volta, Corre Trilha; Mizuno de entrada; ASICS só do Brasil; Fila; 361°; NB 520, 680 e Arishi).

| Atributo | Concordância de ranking (Spearman) | Erro médio (1–5) | Desvio entre as próprias fontes |
|---|---|---|---|
| Resposta | 0,75 | 0,52 | 0,55 |
| Estabilidade | 0,56 | 0,59 | 0,49 |
| Maciez | 0,53 | 0,58 | 0,46 |
| Aprovação geral | 0,40 | 0,36 | 0,41 |

O erro do catálogo é do mesmo tamanho da discordância entre os próprios reviewers.

**Maiores correções:** Takumi Sen 11 mais estável e menos macio; Cloudboom Strike 2 mais estável, mais firme e menos responsivo; Tempus 2, Caldera 8, Adizero Evo SL e Ultraboost 5 mais macios; Metaspeed Edge Tokyo e Zoom Fly 6 mais estáveis; Megablast mais firme; Ghost Max 3 mais macio e menos estável; Sonicblast e Superblast 3 menos responsivos.

**Mudanças no motor:** consenso ponderado (review nova pesa 1, laboratório 1,2); specs pela mediana das medições de laboratório; etiquetas de uso e de contraindicação quando 2+ reviews citam; aviso de divergência entre fontes em 29 modelos ("As reviews profissionais discordam sobre… Vale provar antes de comprar.").

**Teste com 10 perfis:** top 3 adequado 30/30; uso e perfil juntos 28/30. Maratona competitiva: Adios Pro 5, Metaspeed Edge Tokyo, Deviate Nitro Elite 4. Pronador: GT-2000 15, Wave Inspire 22, Structure 26.

**Pendências:** limpar fontes de geração errada (Aero Glide 4, Kinvara 16, Peregrine 16, Endorphin Pro 5, Velociti Elite 2); atualizar Tecton X 4, Infinite Pro 2, Hyperwarp 2, Rincon 5/Arahi 9; notas de clientes BR como camada separada; validação com 30–50 corredores reais.

## Rodada 1: calibração inicial (32 tênis)
- 165 reviews lidas. Concordância com o consenso subiu em todos os índices (amortecimento 0,55→0,88; resposta 0,62→0,97; leveza 0,86→0,99; estabilidade 0,64→0,98; durabilidade 0,30→0,81).
- Correções de dados: maciez, pesos de supertênis, drops medidos (Cumulus 28 13 mm, Kayano 32 8 mm), durabilidade, forma larga, categorias e preços.
- Motor: etiquetas de usos indicados, "não indicado para" e perfil ideal; Fit Score com bônus/penalidades por etiqueta e aprovação ponderada; supertênis entra para maratona e meia competitivas (nível ≥3, treino de ritmo e orçamento ≥ R$ 1.000).
- Perguntas: removida "Tem prova marcada?" (0% de influência); adicionadas pisada, calor, uso fora da corrida e dor no tendão de Aquiles.
