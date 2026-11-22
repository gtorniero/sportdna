<!-- Pesquisa de 22/11/2026 (agente de pesquisa, via buscas na web). Base das regras em docs/racket/cordas.md. -->
# Cordas de tênis por perfil de jogador: o que dizem as fontes

Pesquisa feita em 22/11/2026 para validar o motor de recomendação de cordas do RACKET DNA.

**Limitação importante:** nesta sessão, o acesso direto às páginas (WebFetch) estava bloqueado para `tennis-warehouse.com` e `twu.tennis-warehouse.com`. Por isso, tudo abaixo vem de buscas na web, ou seja, de trechos e resumos das páginas citadas, sem leitura do texto completo. Antes de cravar números no motor, vale abrir as URLs marcadas com (TWU) e conferir. Legenda: **[forte]** é estudo revisado por pares ou dado de laboratório; **[médio]** é consenso entre fabricantes e lojas grandes; **[fraco]** é número sem fonte ou blog isolado.

---

## 1. Tipo de corda por nível

| Nível | Tipo indicado | Bitola típica | Força da evidência |
| --- | --- | --- | --- |
| Iniciante (NTRP 2.0–2.5) | Nylon (synthetic gut) ou multifilamento. Tripa natural se o orçamento permitir | 16 (1,26–1,33 mm) | [médio] |
| Intermediário (3.0–3.5) | Multifilamento ou híbrido confortável (poli na vertical, multi na horizontal) | 16 ou 16L/17 | [médio] |
| Intermediário avançado (4.0) | Híbrido ou co-poli macio, desde que tenha golpe completo e topspin | 16L–17 (1,20–1,25 mm) | [médio] |
| Avançado (4.5+) | Poliéster/co-poli completo ou híbrido poli + tripa | 16L–17, ou 16 para quem quebra corda | [médio] |

- A Wilson recomenda nylon (ou tripa) para iniciantes, híbrido para intermediários e poliéster completo para avançados. https://www.wilson.com/en-us/blog/tennis/how-tos/how-choose-tennis-string
- A Wilson DE diz que tripa natural e nylon são melhores do iniciante ao intermediário, e poliéster para avançados. https://www.wilson.com/de-de/blogs/blog/how-to-choose-a-tennis-string
- A Tennis Warehouse diz que o poliéster "não é recomendado para iniciantes ou jogadores com lesão no braço" e que só faz sentido quando a pessoa já põe muito topspin e sustenta trocas longas. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_string/pros_and_cons_of_polyester_tennis_string.html
- A Head sugere multifilamento ou corda macia para quem ainda desenvolve técnica e diz para evitar o poliéster rígido nessa fase. https://www.head.com/tennis/tennis-strings/how-to-choose-your-tennis-strings
- O Tennis Companion (técnico USRSA Master Racquet Technician) diz que o multifilamento é ótimo para "iniciantes em evolução" e para quem quer potência e toque, e que iniciantes devem começar com bitola 16. Também diz que o poliéster serve "do intermediário ao avançado com velocidade de cabeça de raquete suficiente". https://tenniscompanion.org/how-to-choose-tennis-strings/
- A USTA descreve os polis como firmes, duráveis (bons para quem quebra corda) e com pouca potência, o que agrada quem bate forte e usa o swing rápido para aplicar topspin. https://www.usta.com/en/home/improve/gear-up/national/how-do-i-select-the-right-strings.html
- Bitolas: 15 (1,41–1,49 mm), 15L (1,34–1,40 mm), 16 (1,26–1,33 mm), 16L/17 mais finas. A rotulagem não é padronizada, então convém olhar o milímetro. https://www.tennis-warehouse.com/LC/StringReference.html e https://tennisexpress.com/blogs/news/how-to-choose-tennis-strings
- Segundo a Tennis Express, a 15 é a mais durável e a que gera menos spin, a 16 é a escolha geral mais popular, e a 17 favorece spin e toque com durabilidade média ou baixa. https://tennisexpress.com/blogs/news/how-to-choose-tennis-strings
- Iniciante que manda a bola longe: a TW sugere tensão mais alta e bitola mais grossa para ganhar controle, e não trocar por poli. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_string/pros_and_cons_of_polyester_tennis_string.html

**Onde as fontes divergem:** o NTRP 4.0. A Wilson põe o poli completo só no "avançado". O Tennis Companion aceita poli a partir do "intermediário" com swing rápido. Proposta para o motor: no 4.0, decidir pelo swing e pelo spin, não pelo nível.

## 2. Dor no braço (cotovelo, punho, ombro)

**O que se recomenda (consenso [médio]):**
- Para quem tem dor no braço: tripa natural em primeiro lugar, depois multifilamento. O poli deve ser evitado, e quem não abre mão dele deve usar um co-poli macio em tensão baixa.
  - A TW diz que a tripa natural é a corda mais confortável para o braço e a que melhor segura tensão, mas é a mais cara. https://www.tennis-warehouse.com/LC/StringReference.html
  - A Tennis Express indica o multifilamento como primeira opção para dor no braço ou cotovelo de tenista. https://tennisexpress.com/blogs/news/best-strings-for-tennis-elbow
  - A Wilson diz que cordas de conforto são as melhores para seniores e para quem tem ou já teve lesão no braço. https://www.wilson.com/en-gb/blogs/blog/how-to-choose-a-tennis-string
  - A TW diz que o kevlar transmite muito choque aos tendões e não é indicado para iniciantes nem para quem tem lesão. https://www.tennis-warehouse.com/LC/StringReference.html
- Tensão: baixar cerca de 5 lb para quem tem dor no braço. https://www.tennisexpress.com/info/racquet-choice-and-effects-on-tennis-elbow [fraco, número sem estudo]
- Na Wilson ES (em espanhol), recomenda-se tensão menor com cordas rígidas como o poliéster, para evitar lesão no braço. https://www.wilson.com/es-es/blog/tennis/what-string-tension-should-i-use-my-tennis-racket

**Qualidade da evidência:**
- **Tensão [forte, mas limitada]:** em estudo biomecânico (Shoulder & Elbow, 2016) com raquetes a 200, 222 e 245 N (cerca de 45, 50 e 55 lb), a aceleração no cotovelo em 200 N foi significativamente menor, e tensões menores transmitiram menos força no backhand. É estudo de laboratório, não ensaio clínico com pacientes. https://pmc.ncbi.nlm.nih.gov/articles/PMC4950282 , https://pubmed.ncbi.nlm.nih.gov/27583017/ , https://app.dundee.ac.uk/news/2016/tennis-elbow-risk-could-be-eased-by-reduced-tension.php
- **Tensão e vibração [forte]:** estudo de 2024 não encontrou efeito da tensão na força de impacto, mas encontrou mais vibração com tensão maior. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11734973/
- **Quadro x corda [forte]:** para Rod Cross (Univ. Sydney), a amplitude de vibração no cabo depende principalmente da rigidez do quadro, não da corda. https://www.semanticscholar.org/paper/Flexible-beam-analysis-of-the-effects-of-string-and-Cross/43fa3e08a148389178314e00c558d20990f584d3
- **Vibração como causa [médio]:** revisão de 2019 cita a vibração transmitida à mão como uma das causas do cotovelo de tenista. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6949913/
- **"O poli causa cotovelo de tenista" [fraco]:** não se achou ensaio clínico que compare tipos de corda e incidência de epicondilite. A Wikipedia chama o poli de "o mais perigoso", sem estudo clínico citado. https://en.wikipedia.org/wiki/Strings_(tennis) . A afirmação se apoia em mecânica (o poli é cerca de 2x mais rígido que a tripa no banco de dados da TW, ver item 6) e no consenso de encordoadores.
- **Corda não cura nada:** até fabricante admite que só repouso e tratamento curam. https://ashawayusa.com/NewArmFriendly.php

**Conclusão para o motor:** dor deve pesar forte (é a regra mais segura e não custa nada ao jogador), mas o texto do relatório não deve prometer prevenção nem cura. Sugerir também um quadro mais flexível e procurar um fisioterapeuta.

## 3. Tensão, perda de tensão e frequência de troca

**Faixas típicas:**
- Faixa geral de 40–65 lb (18–27 kg), conforme força e preferência. https://www.head.com/en_US/rs/stories/how-to-choose-your-tennis-strings
- Para nylon, multi ou tripa, a TW manda começar no meio da faixa impressa na raquete. Para poli e kevlar, 2 lb abaixo do meio. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_string/what_tension_do_I_string_my_tennis_racquet_at.html
- Na Wilson, o multi começa em 53–55 lb, o poli não deve passar de 54 lb e, no híbrido, o poli vai 2 lb abaixo do multi. https://www.wilson.com/en-us/blog/tennis/how-tos/what-string-tension-should-i-use-my-tennis-racket
- A Wilson ES dá para o poliéster 20–24,5 kg (44–54 lb), com 20–22 kg para potência e 22,5–24,5 kg para controle. https://www.wilson.com/es-es/blog/tennis/what-string-tension-should-i-use-my-tennis-racket
- **Quanto o poli fica abaixo do multi (as fontes divergem):**
  - 10–15% abaixo. https://TennisExpress.com/info/discussing-polyester-strings
  - cerca de 10% abaixo. https://merchantoftennis.com/blogs/strings/polyester e https://yosports.com.br/blogs/novidades/tensao-de-corda-para-raquete-de-tenis-o-guia-definitivo-para-sua-performance-em-2026
  - 5–8 lb abaixo do synthetic gut. https://tennisexpress.com/blogs/news/how-to-choose-tennis-strings
  - só 2 lb (Wilson, TW), ou 5% no híbrido (TW). https://www.tennis-warehouse.com/LC/StringReference.html
  - Proposta: poli 2–5 lb abaixo do multi como padrão e até 10% abaixo para quem tem dor ou busca conforto.
- No saibro brasileiro, um guia local sugere poli entre 42 e 48 lb ("bola pesada pede corda solta"). https://universodotenista.com/%F0%9F%8E%BE-guia-completo-de-tensao-das-cordas-string-tension-libragem/ [fraco]
- **Padrão de encordoamento e tamanho de cabeça [médio]:** o padrão fechado (18x20) dá mais controle, mais rigidez e corda mais durável, enquanto o aberto (16x19, 16x18) dá mais spin e profundidade. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_racquets/string_patterns_explained.html e https://www.usta.com/en/home/improve/gear-up/national/what-affect-does-string-pattern-have-on-a-racquet.html . Não se achou regra de tensão por tamanho de cabeça. A tensão real fica abaixo da regulada na máquina (27 kg reguladas medem 22,7–25 kg) e varia com o formato da cabeça. https://www.tenniswarehouse-europe.com/lc/RacquetStringTerms.html?lang=es

**Perda de tensão:**
- A perda é maior logo após encordoar e nas primeiras batidas. Depois se estabiliza, mas continua se acumulando (TWU). https://twu.tennis-warehouse.com/learning_center/deadstrings.php
- A ordem de quem perde menos tensão é tripa, nylon e poliéster (TWU). https://twu.tennis-warehouse.com/learning_center/temperature.php
- Cerca de 10% se perde nas primeiras 24 h. https://tenniscompanion.org/replacing-tennis-strings/ [médio]
- **Percentuais divergem:** um teste de encordoador viu o multi perdendo 17,3%, mais que outros. https://squashmagazine.com/2013/10/string-tech-dynamic-stiffness-and-tension-holding/ . Na Ashaway, poli e synthetic gut perderam cerca de 13% cada. https://www.ashawayusa.com/TennisTip9.php . A tabela da RacketEdge (poli com 15–22% em 24 h, multi com 8–11%, tripa com 3–5%) não tem fonte. https://racketedge.com/tennis/strings/guides/polyester-vs-multifilament-vs-natural-gut/ [fraco]
- A TWU mostrou que um poli rígido pode continuar mais rígido que um nylon macio mesmo depois de perder 20–35 lb antes de jogar (TWU). https://twu.tennis-warehouse.com/learning_center/deadstringsPart2.php

**Frequência de troca:**
- A regra clássica é trocar por ano tantas vezes quantas você joga por semana. A TW a considera boa para o recreativo e manda trocar mais vezes com poli. https://www.tennis-warehouse.com/LC/StringReference.html e https://www.wilson.com/en-us/blog/tennis/how-tos/how-often-should-i-re-string-my-tennis-racket
- A LTA (clube) fala em trocar a cada 40 horas de jogo. https://clubspark.lta.org.uk/CorstorphineLTC/Coaching/Racketstringing . A Tennis Express manda contar horas, e não meses. https://tennisexpress.com/blogs/news/how-often-should-you-restring-and-how-to-care-for-your-racquet
- A Central Sports (UK) fala em 3–6 meses para quem joga em clube e 2–4 semanas para competidores com 3 ou mais sessões por semana. O poli deve ser cortado "a cada poucas semanas" mesmo sem quebrar. https://centralsports.co.uk/blogs/tennis/when-to-restring-your-tennis-racket-2026-uk-guide
- Para juniores com poli completo, trocar no mínimo a cada dois meses. https://tennisconsult.com/tennis-strings-junior-tennis-players-prevent-injures-tennis-players
- O calor e o sol aceleram o desgaste do poli, o que importa no Brasil. https://www.wilson.com/es-es/blog/tennis/how-often-should-i-re-string-my-tennis-racket
- **Sem número sólido:** não se achou fonte confiável para "o poli morre em X horas". O número mais citado (cerca de 40 h) vale para cordas em geral. Para poli, faltam medições, então proponho entre 15 e 25 h, e esse valor é palpite. [fraco]

## 4. Quem bate forte, usa muito topspin ou quebra corda

- O poli é durável e dá controle e spin. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_string/pros_and_cons_of_polyester_tennis_string.html e https://www.usta.com/en/home/improve/gear-up/national/how-do-i-select-the-right-strings.html
- Para quem quebra corda: subir a bitola (nylon 16 vira 15L) (TW). https://www.tennis-warehouse.com/LC/StringReference.html . A Wilson indica 16 (1,30 mm) para competidores que quebram com frequência. https://www.wilson.com/en-us/blog/tennis/how-tos/how-choose-tennis-string
- Um padrão fechado faz a corda durar mais. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_racquets/string_patterns_explained.html
- Na TW, o híbrido com kevlar é "o fim da linha" para quem quebra corda, mas é muito duro para o braço. https://www.tennis-warehouse.com/LC/StringReference.html
- **Híbridos:** o híbrido deixa mais confortável uma corda firme e durável e prolonga a vida de uma corda macia. https://www.tennis-warehouse.com/LC/StringReference.html . A combinação mais comum é poli na vertical, para controle, e multi na horizontal, para conforto. https://universodotenista.com/%F0%9F%8E%BE-guia-completo-de-tensao-das-cordas-string-tension-libragem/ . O híbrido serve a quem quebra corda e tem braço sensível, a juniores em transição para o poli e a quem quer spin com mais potência.
- **Corda modelada (shaped):** a TWU registra que os polis com maior atrito ("COF") costumam ter superfície modelada ou texturizada. https://twu.tennis-warehouse.com/learning_center/slidingCOF.php . Já o ITF afirma não haver diferença significativa de spin entre cordas lisas e ásperas. https://m.itftennis.com/media/2175/rackets-and-strings-strings.pdf . **As fontes divergem, e a evidência a favor do formato é fraca.** O que pesa mais é o material: o poli gera cerca de 20% mais spin que o nylon na TWU. https://twu.tennis-warehouse.com/learning_center/spinandlubev2.php . Segundo a Ashaway, citando a TWU, são cerca de 25% a mais que o nylon e 7% a mais que a tripa. https://www.ashawayusa.com/TennisTip5.php

## 5. Juniores e seniores (60+)

**Juniores:**
- Começar com multi ou corda macia, passar por um híbrido e só ir ao poli completo quando o físico e os golpes estiverem prontos. https://solincosports.com/the-ultimate-guide-to-junior-tennis-equipment , https://www.coachlife.com/videos/when-should-juniors-switch-to-polyester-strings , https://tennisconsult.com/tennis-strings-junior-tennis-players-prevent-injures-tennis-players
- Bitola 16–17, com tensão de partida de 50–55 lb, seguindo a faixa da raquete. https://tennisconsult.com/tennis-strings-junior-tennis-players-prevent-injures-tennis-players [fraco a médio]
- As crianças não percebem quando o poli está morto, então a troca deve seguir calendário fixo (no mínimo a cada 2 meses). Mesma fonte.
- O poli completo serve aos juniores avançados com swing completo, a partir de cerca de 16 anos. Os mais novos não batem forte o bastante para quebrar o poli, então ele morre antes de quebrar. https://www.tennis.com/news/articles/double-edged-sword-the-risk-vs-reward-proposition-of-polyester-strings
- Não se achou orientação oficial do ITF para cordas de juniores.

**Seniores:**
- Corda de conforto, pensando no risco de lesão no braço. https://www.wilson.com/en-gb/blogs/blog/how-to-choose-a-tennis-string
- Tripa natural ou multi. O multi perde tensão mais rápido que a tripa. https://www.tennis-warehouse.com/LC/StringReference.html
- Tensão no terço inferior ou no meio da faixa, o que dá mais potência e absorve mais choque. https://tennisexpress.com/blogs/news/how-to-choose-tennis-strings . A Tennis Express também fala em ficar na parte média para alta da faixa para manter o multi confortável, o que **contradiz** a regra geral. Prefiro seguir o estudo de 2016, que favorece tensão menor.
- Não se achou estudo específico para pessoas com mais de 60 anos. A regra é extrapolada da regra para dor no braço.

## 6. Métricas de laboratório e limites

**Distribuição real da rigidez TWU (lb/in, medida em 1 corda a cerca de 51–52 lb):**

| Tipo | Mediana | Faixa | Fonte |
| --- | --- | --- | --- |
| Tripa natural (n=18) | ~93 | 74–109, metade central 85–99 | https://thetennisindex.com/guides/compendium/string-types |
| Nylon, multi e synthetic gut (n≈230) | ~153–158 | — | https://tennisracquets.com/pages/tennis-string-types , https://thetennisindex.com/guides/compendium/string-types |
| Poliéster (n≈480) | ~201 | 136–314, com 80% entre 180 e 240 | https://thetennisindex.com/guides/compendium/string-types , https://stringgoat.com/en/blog/tennis-strings/tennis-string-types-guide |

Esses números vêm de sites terceiros que consultaram o banco da TWU. O banco original está em https://twu.tennis-warehouse.com/learning_center/reporter2.php e a ferramenta de rigidez em https://twu.tennis-warehouse.com/learning_center/stringstiffnesstool.php . A rigidez muda com a tensão, mas a ordem entre as cordas se mantém. https://twu.tennis-warehouse.com/learning_center/stringstiffness.php

**Validação da hipótese "< 180 macio, 180–210 médio, > 210 duro":** ela só funciona **dentro dos poliésteres**. Aplicada a todas as cordas, quase todo multi e toda tripa cairia em "macio" e metade dos polis em "duro". Proposta de dois níveis:
- Escala geral: abaixo de 120 é muito macio (tripa), de 120 a 175 é macio (nylon e multi), de 175 a 205 é médio (polis macios e médios, perto da mediana de 201) e acima de 205 é duro.
- Dentro do poli: abaixo de 185 é poli macio (cerca dos 20–25% mais macios), de 185 a 215 é médio e acima de 215 é duro (cerca do quartil superior).
- Os cortes são meus, derivados da distribuição acima. Convém recalcular com o banco TWU atual.

**Qual métrica prevê o quê:**
- **Conforto:** a rigidez TWU (lb/in) é o melhor indicador da corda. A corda menos rígida é mais confortável e dá menos controle. https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_string/understanding_string_stiffness.html . Mas a vibração no braço depende mais do quadro (Cross, item 2) e da tensão (estudos de 2016 e 2024). A perda de tensão pesa pouco no conforto.
- **Spin:** na TWU, o spin cresce com alto atrito entre corda e bola e baixo atrito entre as cordas (snapback). https://twu.tennis-warehouse.com/learning_center/stringmovementPart2.php e https://twu.tennis-warehouse.com/learning_center/stringballfriction.php . Lubrificar as interseções aumentou o spin em 14–58%. Corda e tensão muito baixas não fazem snapback. https://twu.tennis-warehouse.com/learning_center/spinandlubev2.php . A rigidez da corda também foi apontada pelo ITF (2006–07) como fator relevante. https://twu.tennis-warehouse.com/learning_center/spinandstiffness.php
  - Para o motor: use o "spin potential" do banco TWU quando existir. Na falta dele, use o material como indicador (poli acima de tripa, e tripa acima de nylon).
- **Durabilidade e vida útil:** use a perda de tensão (%) do banco TWU. Para o poli, ela indica quando a corda "morre". Não achei limite publicado. Proposta: abaixo da mediana do tipo é boa manutenção, e mais de 5 pontos percentuais acima dela é ruim. [fraco]

## 7. Erros comuns

- Iniciante ou quem tem dor no braço usando poli completo (TW, Head, Wilson, links do item 1).
- Usar poli porque o ídolo usa, sem ter swing para isso. https://www.tennis.com/news/articles/double-edged-sword-the-risk-vs-reward-proposition-of-polyester-strings
- Nunca trocar a corda, ou só trocar quando ela quebra. O poli perde tensão e fica mais duro sem quebrar (Wilson e TennisConsult, item 3).
- Encordoar o poli na mesma tensão do multi (TW e Wilson, item 3).
- Corrigir bola longa trocando para poli, quando bastaria subir a tensão ou a bitola (TW, item 1).
- Usar kevlar por durabilidade tendo braço sensível (TW, item 4).
- Comprar pela bitola nominal e ignorar o milímetro (TW e Tennis Express, item 1).
- Deixar a raquete no carro ou no sol, o que acelera a perda de tensão (Wilson ES, item 3).

---

## Regras sugeridas para o motor

Entradas: `nivel` (NTRP), `dor` (nenhuma / passada / atual; local), `idade`, `swing` (lento / médio / rápido), `spin` (pouco / médio / muito), `quebra_corda` (nunca / às vezes / frequente, ou seja, menos de 10 h), `quer` (potência / controle / conforto / spin), `freq_semana` (sessões), `horas_semana`, `faixa_raquete` (mín–máx lb), `padrao` (16x19, 18x20...).

Tensão base `T0` = meio da faixa da raquete (se não houver faixa, 52 lb / 23,5 kg).

### Prioridade 1: segurança (vence as outras regras)
1. **Se `dor = atual`**, a corda é tripa natural ou multifilamento macio (rigidez abaixo de 175 lb/in), em bitola 16 ou 16L, com tensão de `T0 − 4` a `T0 − 6` lb. O poli fica proibido. Se a pessoa insistir em poli (avançado, quebra corda), oferecer híbrido com tripa ou multi na vertical e poli macio (abaixo de 185) na horizontal, a `T0 − 5`. O texto do relatório deve sugerir fisioterapeuta e quadro mais flexível, sem prometer cura. *(Evidência: tensão [forte, de laboratório]; tipo de corda [médio].)*
2. **Se `dor = passada` ou `idade ≥ 60`**, usar multi, tripa ou híbrido macio, de `T0 − 2` a `T0 − 4`. O poli completo só é permitido se `nivel ≥ 4.5`, com poli macio abaixo de 185.
3. **Se `idade < 14`**, usar nylon ou multi 16–17 a `T0` (cerca de 50–55 lb). Nunca poli completo. **Se `idade` estiver entre 14 e 16 e `nivel ≥ 4.0`**, usar híbrido. Poli completo só a partir de cerca de 16 anos, com `swing = rápido` e sem dor.
4. Nunca recomendar kevlar se houver `dor`, se `nivel < 4.5` ou se `idade ≥ 60`.

### Prioridade 2: nível e swing
5. **Se `nivel ≤ 2.5`**, usar nylon ou multi, bitola 16, a `T0`. Se `quer = controle` (bola longa), ir de `T0 + 2` a `T0 + 3` ou usar bitola 15L, sem passar a poli.
6. **Se `nivel` estiver entre 3.0 e 3.5**, usar multi 16 ou 16L a `T0`. Se `spin = muito` e `swing ≥ médio`, usar híbrido com poli macio na vertical a `T0 − 2` e multi na horizontal a `T0`.
7. **Se `nivel = 4.0`**, decidir pelo swing. Com `swing = rápido` e `spin ≥ médio`, usar co-poli macio ou médio (180–210), bitola 16L–17, de `T0 − 2` a `T0 − 5`. Nos demais casos, usar híbrido ou multi.
8. **Se `nivel ≥ 4.5`**, usar poli ou co-poli completo, bitola 16L–17, de `T0 − 2` a `T0 − 5`. Se `quer = conforto` ou `potência`, usar híbrido com tripa (na vertical ou na horizontal).

### Prioridade 3: ajustes finos
9. **Se `quebra_corda = frequente`**, subir meia bitola (17 vira 16L, 16L vira 16). Com poli, usar o mais firme permitido pelas regras de dor. Sem poli permitido, usar híbrido com poli na vertical e multi na horizontal. Em padrão 18x20, a durabilidade já é maior. Kevlar só se as regras 1 a 4 permitirem.
10. **Se `quer = potência`**, baixar 2–3 lb, usar bitola mais fina e corda mais macia. **Se `quer = controle`**, subir 2–3 lb (respeitando o teto de 54 lb para poli, da Wilson) e usar bitola mais grossa.
11. **Se `quer = spin`**, usar poli (se permitido) com o maior "spin potential" TWU, bitola 17 e padrão aberto. O formato modelado conta como bônus pequeno, porque a evidência é fraca e o ITF não vê diferença. Nunca baixar a tensão a ponto de matar o snapback (piso sugerido de cerca de 44 lb ou 20 kg, que é o piso da Wilson para poli).
12. **Saibro e calor (Brasil)**: preferir a ponta baixa da faixa do poli (44–50 lb) e lembrar que o calor encurta a vida da corda. *(Evidência [fraco], fonte local.)*
13. **Teto e piso:** a tensão final fica sempre dentro de `faixa_raquete`, com o poli sem passar de 54 lb.

### Frequência de troca
14. **Nylon, multi e tripa**: trocar por ano tantas vezes quantas a pessoa joga por semana, com teto de cerca de 40 h de jogo.
15. **Poli ou co-poli**: trocar a cada 15–25 h de jogo, ou seja, `semanas = 20 / horas_semana`, com piso de 2 semanas e teto de 8 semanas. Também trocar ao perder controle ou spin, mesmo sem quebrar. *(Evidência [fraco] no número exato e [médio] em trocar antes da corda quebrar.)*
16. **Híbrido**: usar a regra do poli se o poli estiver na vertical.
17. **Juniores com poli**: no mínimo a cada 8 semanas, por calendário.

### Limites para os rótulos do catálogo (rigidez TWU a cerca de 51–52 lb)
- **Escala geral:** abaixo de 120 é "muito macia", de 120 a 175 é "macia", de 175 a 205 é "média" e acima de 205 é "dura".
- **Rótulo de conforto do poli:** abaixo de 185 é "poli macio", de 185 a 215 é "poli médio" e acima de 215 é "poli duro".
- **Spin:** usar o "spin potential" TWU em quartis dentro do banco (o quartil superior é "muito spin"). Na falta dele, poli = alto, tripa = médio e nylon ou multi = médio ou baixo.
- **Manutenção de tensão:** comparar com a mediana do tipo. Mais de 5 pontos percentuais acima da mediana é "perde tensão rápido".
- Os cortes acima são propostos a partir da distribuição publicada por terceiros e devem ser recalculados com o banco TWU atual antes de entrar no motor.
