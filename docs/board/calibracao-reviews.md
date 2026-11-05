# Board Match — calibração do motor contra casos reais (out/2026)

## Base: 422 casos (390 usados; 32 sem nível ou tipo)
| Frente | Casos | Peso + litragem | Fontes principais |
|---|---|---|---|
| Lojas (reviews de usuários) | 79 | 67 | Boardcave 72, Hawaiian South Shore 6 |
| Revistas e especialistas | 97 | 45 | Stab 45, The Inertia 20, Empire Ave 17, Swellnet 7, Surf Simply 4 |
| Marcas e coaches (tabelas e calculadoras) | 88 | 88 | Surf Simply, NSP, calculadora Guild Factor, Fly Surf, Rapture, Softech, Catch Surf |
| Atletas | 89 | 66 | JS Industries 48, Stab 14, WSL, Volcom |
| Fóruns | 69 | 25 | Seabreeze 66 |

Método: cada caso virou um perfil do questionário (peso, altura, nível, ondas, estilo) e rodou no motor publicado. 30% dos casos ficaram separados para validação (sorteio fixo por id) e não foram usados no ajuste.

## Resultado
| Métrica (390 casos) | Antes | Depois |
|---|---|---|
| Tipo certo em 1º | 44% | 56% |
| Tipo certo no top 3 | 71% | 77% |
| 1º certo ou tipo vizinho | 77% | 81% |
| Litragem a ±10% do que a pessoa usa (n=257) | 33% | 56% |
| Litragem a ±15% | 55% | 72% |
| Erro absoluto mediano de litragem | 13,7% | 8,6% |

Validação (122 casos fora do ajuste): 1º certo 64%, top 3 80%, litragem a ±15% em 72%.

## Litros por kg observados (casos reais, veredito positivo)
Pro 0,365 (pranchinha), 0,41 (step-up) · Avançado 0,375–0,41 · Intermediário 0,41 (pranchinha) a 0,47 (evolution/mid) · Já fica de pé 0,50–0,56 · Iniciante em soft: tabelas indicam mínimo de 0,8.

## O que mudou no motor
- Fatores de litragem por nível: já fica de pé 0,58→0,47; intermediário 0,45→0,41; intermediário avançado 0,41→0,385; avançado 0,385→0,36.
- Multiplicador por tipo: mini-malibu 1,8; mid 1,25; evolution 1,1; step-up 1,11; gun 1,3; biquilha 1,0.
- Saíram descontos que puxavam a litragem para baixo sem base (condicionamento forte, onda grande, frequência alta). EPS desconta 1 L (antes 2).
- Afinidades por nível e objetivo: evolution menos dominante para intermediários; groveler sobe para intermediários em onda pequena; mini-malibu mais forte para quem já fica de pé; longboard ganha no objetivo "curtir sem pressão".
- Softboard ganha força para quem ainda não fica de pé.
- Pergunta nova: "Você quer uma prancha de espuma (soft)?" (resolve softboard de performance). Depois passou a aparecer só para quem está começando.

## Limites e próximos passos
- Fish e biquilha ainda erram (0/8 e 4/14 no top 3): são escolha de estilo; os casos raramente dizem o estilo do surfista. Testar com usuários reais que escolhem "deslizar com velocidade".
- Longboard, gun e step-up têm poucos casos com tamanho de onda. Faltaram Joel Tudor, Kassia Meador e guns de onda grande (limite de buscas).
- Litragem de soft para iniciante sai ~25% acima das tabelas de mínimo; mantido de propósito (softs reais de 8' têm 70–86 L). Validar com o Gustavo.
- Base enviesada para Austrália (Boardcave, Seabreeze) e JS Industries nos atletas. Próxima rodada: lojas BR, Surfboard Empire, Degree 33, Reddit, e 30–50 alunos reais do Gustavo.

## Rodada 2: coerência e teste de fogo (24/out/2026)
Sem casos novos; correções de regra encontradas testando perfis-limite no motor publicado.
- **Softboard +12** quando o tempo de surf é de até 6 meses e a pessoa marca até 2 habilidades (correção do `docs/teste-de-fogo.md`, que ainda não estava no motor). Antes, um iniciante de 3 meses que já pega espuma sozinho caía em mini-malibu.
- **Prancha para dias grandes** (papel no quiver): pranchinha −8, step-up +4. Antes, um avançado que pedia prancha para dias grandes recebia pranchinha em 1º.
- **Onda acima de 2,5 m**, só para intermediário avançado e avançado: gun +14, pranchinha −4. Antes, o gun ficava em 4º mesmo com onda grande, laje e prancha para dias grandes; agora fica em 2º, atrás do step-up.
- **Groveler em onda de 1,5 m para cima**: −6. Antes, um intermediário que gosta de manobra recebia groveler em onda de 1,5 a 2,5 m; agora recebe evolution.
- O perfil do "Ver um exemplo pronto" não mudou (Mid-length 96%, 37,6 L).
- Não houve nova medição nos 422 casos (a base não está no repositório). Rodar de novo na próxima rodada, junto com os 30–50 alunos do Gustavo.

## Rodada 3: questionário e litragem de avançado (25/out/2026)
Ajustes pedidos depois do teste do dono do projeto (avançado, dor no ombro, recebeu groveler de 28 L com uma evolution de 30 L).
- **Pergunta nova: dor ou lesão** (ombro, joelho/quadril, lombar, mobilidade; pode marcar mais de uma). Litros a mais: ombro +2,5 L; joelho/quadril +1,5 L; mobilidade +1,5 L; lombar +1 L. Joelho, quadril ou mobilidade puxam para tipos mais estáveis; ombro e lombar, um pouco. Sem aviso de fisioterapeuta no relatório (tirado a pedido do dono do projeto em 30/out).
- **Avançado:** fator de litragem de 0,385→0,36 para 0,40→0,37 L/kg. O mínimo antigo ficava abaixo do observado nos casos reais de avançado (0,375–0,41) e igual ao de profissional (0,365).
- **Groveler:** multiplicador de volume 1,06 → 1,10. Groveler costuma ter igual ou mais volume que a pranchinha da pessoa.
- Resultado no perfil de teste (75 kg, avançado, onda pequena): groveler de ~28,6 L para 31,8 L sem dor e 34,3 L com dor no ombro.
- **Saíram as perguntas** de roupa (lycra/john) e de fundo do pico. Valem o padrão: sem ajuste de roupa e beach break.
- **"Onde vai usar" e "papel da prancha" viraram uma pergunta só:** "Para que vai usar essa prancha?" (única, dias pequenos, dias grandes, viagem, piscina, mar e piscina).
- O questionário passou de 20–25 para 18–23 perguntas. O "Ver um exemplo pronto" não mudou (Mid-length 96%, 37,6 L).
- A validar com o Gustavo: os litros a mais por dor e a nova faixa de avançado.

## Rodada 4: coerência entre zona ideal e ranking (28/out/2026)
Mesma checagem feita no Racket Match (lá, só 27% dos 1º lugares caíam dentro da zona do mapa). Simulação com 500 perfis aleatórios no motor publicado (respostas sorteadas em todas as perguntas, peso 45–110 kg, altura 150–200 cm, metade com medidas da prancha atual).
- **Zonas que o Board mostra:** faixa de litros ("quanto ela deve boiar", na prévia, no Passo 2 e no PDF) e a régua do catálogo no PDF (comprimento ±2", largura ±1/4", espessura ±1/8", litros). O mapa do catálogo (comprimento × litros) não desenha zona.
- **Resultado:** o 1º lugar fica dentro de todas as zonas em 500 de 500 perfis (100%), e o 1º do ranking de 13 tipos é sempre a prancha recomendada. As zonas são calculadas a partir da própria recomendada (litragem do motor para o tipo vencedor ± a margem do nível), então não há como o 1º contradizer o gráfico. **Motor sem mudança.**
- **Para acompanhar (sem mudança agora):** o 2º e o 3º lugar caem dentro da faixa de litros do 1º em só 9% dos perfis (46 e 45 de 500), porque cada tipo tem a sua litragem; o relatório já mostra os litros de cada finalista. E o 1º lidera a prioridade nº 1 da pessoa (entre as 3 finalistas) em 48% dos perfis (242 de 500): o tipo pesa nível, estilo e onda antes das notas de prioridade, e a página 3 do PDF explica o que cada uma lidera e cede.
- Distribuição do 1º nos 500 perfis: mini-malibu 127, soft 78, mid 77, groveler 46, longboard 45, fish 22, twin 23, longboard performance 22, pranchinha 28, evolution 20, softp 6, step-up 5, gun 1.

## Rodada 5: pesos nomeados e travas de segurança (nov/2026)
Feita a partir da auditoria do motor contra o guia `docs/modelo-recomendacao.md` (nível do RUN DNA). Sem casos novos.

**Pesos nomeados (sem mudar resultado).** Todos os números do placar e da litragem saíram do `engine` para a tabela `PESOS` em `surf/index.html`, com a origem de cada grupo (regra, shaper, calibração dos 422 casos, teste de fogo). O cálculo do nível virou a função `habil()`. Saíram leituras de respostas que não existem mais no questionário (`ritmo`, `sens`, `remada`, `limit`, `pico`, `fundo`, `quilhas`, `acab`, `cor`). Prova: 3.000 perfis sorteados (semente 12345) deram pódio, porcentagens, litragem, medidas e ranking dos 13 tipos idênticos antes e depois.

**Regras novas** (todas em `PESOS.regras`):
- **Onda acima de 2,5 m, avançado, no mar** (fora "para dias pequenos"): gun e step-up sempre no pódio; no 1º lugar só gun, step-up ou pranchinha. A garantia sobe só o placar de quem entra no pódio (`ajustaPodio`).
- **Prancha para dias grandes com onda de 1,5 m ou mais**, nível intermediário para cima: −14 para longboard, longboard performance, mini-malibu, mid, fish e groveler.
- **Nível 0 ou 1** (Primeiras Ondas, Já Fica de Pé): −30 para pranchinha, step-up e gun depois de todas as outras regras, inclusive "quero mudar de estilo".
- **"Sim, quero soft"**: soft ou softboard performance garantida no pódio. A pergunta agora só aparece para quem está no nível 0 ou 1 (o nível é calculado pelas respostas da etapa 2); antes aparecia para intermediários que surfam há pouco tempo e era ignorada.
- **Aviso de onda acima do nível** na prévia, no relatório e no PDF: Primeiras Ondas a partir de 1 m, Já Fica de Pé a partir de 1,5 m, Intermediário acima de 2,5 m. Sem promessa de segurança.
- **Condicionamento multiplica a litragem**: 1,08 (canso rápido), 1,03 (razoável), 1,0 (bom), 0,97 (muito bom), no lugar de +1,5 L só para quem cansa rápido. O "Ver um exemplo pronto" passou a ter condicionamento "bom" para manter o resultado publicado nas imagens e textos do site (Mid-length 96%, 37,6 L).
- **Pranchinha até 6'4"**: não é mais esticada para caber a litragem; se a litragem pedida passa de 6'4" com até 25% a mais de largura e espessura (37 L), ela perde 0,5 ponto por % que falta.
- **Textos**: saíram "não machuca", "a mais segura" e "com segurança".
- **Reviews**: saíram as segundas reviews da Harley Ingleby HI4 e da Christenson Fish (mesmo modelo); a 7S Super Fish 3 passou de mini-malibu para fish (é uma fish de muito volume com rabeta swallow, segundo as fichas das lojas).

**Antes × depois** (`node surf/tools/vies.mjs`, 3.000 perfis, semente 12345):

| Pódios incoerentes | Antes | Depois |
|---|---|---|
| Nível ≤ 1 com pranchinha, step-up ou gun em 1º | 50 | 1 |
| Nível ≤ 1 com pranchinha, step-up ou gun no pódio | 103 | 2 |
| Onda > 2,5 m, avançado, mar: 1º não é gun nem step-up | 50 | 2 (pranchinha) |
| Onda > 2,5 m, avançado, mar: sem gun e step-up no pódio | 53 | 0 |
| Onda > 2,5 m, avançado, mar: fish ou longboard em 1º | 17 | 0 |
| Dias grandes, onda ≥ 1,5 m: tipo de onda pequena em 1º | 39 | 11 |
| Onda acima do nível sem aviso | 1.157 | 0 |
| Pediu soft e o pódio não tem soft | 394 | 0 |
| Pranchinha em 1º acima de 6'4" | 57 | 0 |
| Primeiras Ondas com 1º abaixo de 0,7 L/kg | 34 | 32 |

Os casos que sobram vêm de quem escolheu o estilo na pergunta "Para qual estilo você quer mudar?" (10 dos 11 de dias grandes, o único nível 1 com pranchinha em 1º, as evolution de 0,67–0,70 L/kg em Primeiras Ondas). Gun em 1º: 17 → 56; step-up: 25 → 36; pranchinha: 131 → 68. Os 13 tipos continuam aparecendo no top 3. Litros por kg do 1º (mediana) quase não mudaram: 0,96 · 0,69 · 0,53 · 0,49 · 0,49 do nível 0 ao 4.

**Pendências**
- **Recuperar a base dos 422 casos** (não está no repositório) e guardar em `docs/board/dados/casos.json`, com uma ferramenta de medição como a do RUN DNA (`run/tools/calibrar.mjs`): tipo certo em 1º e no top 3, MRR, erro de litragem, validação cruzada. As rodadas 2 a 5 ainda não foram medidas contra esses casos.
- Validar com o Gustavo os pesos das travas, os limites de onda por nível e os multiplicadores de condicionamento.
- Reviews: ainda nenhuma marca brasileira; Lost e DHD, parceiras do consultor, somam 5 das 26.

## Rodada 6: abertura, calculadora de litragem e PDF (nov/2026)
Sem mudança de placar nem de litragem (`node surf/tools/vies.mjs --dump` idêntico antes e depois, 3.000 perfis, semente 12345).
- **Fórmula de volume numa função só:** `litragem(a,H,lvl)` em `surf/index.html`. O motor e a calculadora chamam a mesma função.
- **Calculadora de litragem no app** (botão "Calcular minha litragem" na abertura, grátis): peso, altura, nível, condicionamento, idade e tipo (padrão: o tipo mais comum em 1º lugar naquele nível nos 3.000 perfis). Usa o meio do nível escolhido e os padrões do motor para o resto. Perfil do exemplo (70 kg, 170 cm, intermediário, razoável, 36–45, mid-length): **39,5 L, faixa 38–42 L**. O teste completo dá 38,7 L porque também usa o ponto exato do nível (H = 57, fator 0,416 em vez de 0,43), "rema pouco" (+1,5 L) e epóxi (−1 L); 38,7 fica dentro da faixa da calculadora.
- **"Ver um exemplo pronto" hoje:** Mid-length / egg, DNA Score 96%, 6'11" × 19 7/8" × 2 5/8", 38,7 L, rabeta round, 2+1, epóxi; pódio mid-length 96%, groveler 91%, fish 85% (condicionamento "razoável"; as rodadas 3 a 5 citam 37,6 L, valor antigo).
- **Números da abertura e fonte:** 13 tipos (`KEYS`), 17 variáveis da prancha (ficha técnica), 26 reviews (`REVIEWS`), 422 casos e 77% no top 3 (rodada 1; ao acaso 3/13 = 23%; base fora do repositório e ainda não medida depois das rodadas 2–5), 3.000 perfis (`vies.mjs`). Segurança medida agora: 0 dos 1.348 perfis em Primeiras Ondas com pranchinha, step-up ou gun no pódio; no nível ≤ 1, 2 de 1.965, ambos de quem pediu para mudar para pranchinha.
- **PDF:** html2canvas e jsPDF de `assets/vendor/` (sem CDN), gerado em segundo plano quando o relatório pago aparece; download na hora se o arquivo já está pronto, senão botão "Abrir o PDF".

## Rodada 5: questionário (4/nov/2026)
- **Dor ou lesão:** nova opção "Não tenho dor", exclusiva (desmarca as dores e vice-versa). Dá o mesmo resultado que deixar em branco.
- **Arrebentação:** "Joelhinho" e "Pato" viraram "Joelhinho ou pato" (valor 2, mesmos pontos do antigo joelhinho). "Uso o canal" manteve o valor 4. Respostas antigas com "pato" (valor 3) continuam valendo no motor.
- **Prioridades:** o texto explica a troca (mais remada e estabilidade, prancha maior que vira menos; mais manobra, prancha menor que rema menos) e pede 2 ou 3 prioridades. Aviso quando 4 ou mais itens recebem 8 ou mais.
- **Perguntas sem efeito:** medido em 400 perfis aleatórios trocando a resposta de cada pergunta. Nenhuma é inútil. As mais fracas: frequência e idade (nunca mudam o tipo; mudam 1 L ou mais em 16–17% dos perfis), altura (3% nos litros, mas define o comprimento) e força da onda (3% no tipo, mas muda rocker, fundo e rabeta).

## Rodada 7: questionário modular e nível declarado (4/nov/2026)
- **Nova ordem das etapas:** Seu corpo → Sua prancha (motivo, uso, prancha atual) → Seu surf → Seus objetivos → Seu mar. A soft (só para nível ≤ 1) foi para o fim, depois do nível.
- **Nível declarado** (`nivel`, primeira pergunta de "Seu surf"): Iniciante, Intermediário, Intermediário avançado, Avançado, Profissional. Limita o nível calculado (`PESOS.habil.declarado`): iniciante 0–1, intermediário 1–3, intermediário avançado 2–4, avançado 3–4, profissional 4. O cálculo por tempo, manobras e arrebentação continua decidindo dentro da faixa.
- **Perguntas puladas:** do intermediário avançado para cima, "Como você pega onda hoje?" e "Como você passa a arrebentação?" não aparecem; o motor assume onda verde e joelhinho ou pato. "O que você já faz na onda?" continua para todos. Total: 17 a 24 perguntas.
- **Prioridades:** sai "Perdoar erros" (era o mesmo que estabilidade); ficam 5 itens. O motor usa 5 notas (média e produto com os 5 índices); o perfil da prancha e o card de compartilhar mostram 5 eixos. A partir da 4ª nota 8 ou mais, esse item fica vermelho e o aviso explica a troca: o máximo de remada e estabilidade abre mão de manobra e controle em onda forte.
- **Efeito:** "Ver um exemplo pronto" igual (Mid-length 96%, 38,7 L; pódio mid 96, groveler 91, fish 85). Tirar "perdoar erros" mudou o 1º lugar em 1 de 300 perfis aleatórios (mid → minimal). Checagem do nível declarado: profissional sem manobras marcadas cai em Avançado (pranchinha 29 L); iniciante que marca tudo fica em Já Fica de Pé (evolution 36 L).

## Rodada 8: litragem do profissional (5/nov/2026)
- Profissional declarado tem faixa própria de fator: 0,36 → 0,33 L/kg (`PESOS.vol.pro`), contra 0,40 → 0,37 do Avançado. Depois entram os mesmos ajustes de corpo, onda e material.
- Antes, profissional e avançado davam exatamente a mesma litragem. Agora, com 75 kg: avançado com 7 manobras, 29,9 L (0,40 L/kg) e profissional, 26,9 L (0,36); avançado com tubo e aéreo, jovem e condicionamento muito bom, 25,7 L (0,34) e profissional, 22,9 L (0,31). Em onda pequena e fraca (groveler, epóxi): 27,2 L contra 24,2 L.
- Exemplo pronto e os outros níveis não mudam.

## Rodada 9: ordem do questionário (5/nov/2026)
- Etapas: Seu corpo → Seu surf → Sua prancha → Seus objetivos → Seu mar (o surf volta para antes da prancha).
- "Qual é a sua prancha atual?" com as opções da menor para a maior prancha. Os valores das respostas não mudaram (ids explícitos), só a ordem na tela.
- Sem mudança de resultado: as mesmas 3.000 respostas aleatórias e 126 combinações de prancha atual (14 tipos × mudar de estilo × incômodo) dão pódio, medidas e nível idênticos antes e depois.
- Pergunta de nível em escada: os 5 níveis numa linha (no celular, em coluna), com barras que crescem, resumo curto em cada degrau e a descrição completa embaixo do degrau escolhido. Os degraus até o escolhido ficam marcados. Valores das respostas iguais.
- Acessibilidade: quando uma resposta redesenha a etapa (nível, prancha atual, mudar de estilo), o foco fica na opção escolhida e a etapa não é anunciada de novo (antes o foco pulava para a primeira pergunta).
- Questionário mais curto para quem já surfa bem: avançado e profissional não veem "Há quanto tempo você surfa?" (o motor assume 3 a 6 anos para avançado e mais de 6 para profissional). No objetivo, "Aprender a ficar de pé" só aparece para iniciante e "Ganhar autonomia" some do avançado para cima. Total: 16 a 24 perguntas.
- Ranking: o relatório e o PDF mostram os 3 primeiros (mais a prancha atual, se ficar fora deles), não mais os 10.
- Efeito medido nos 3.000 perfis de `vies.mjs` (mesma semente, antes e depois): 1º lugar mudou em 112 (64 deles de nível ≥ 3, pelo tempo de surf assumido; o resto por objetivos sorteados que agora não aparecem para o nível), nível calculado mudou em 27. Exemplo pronto igual (Mid-length 96%, 38,7 L).
- **Prioridade alta não atendida** (`PESOS.priorAlta = 3`): cada nota 8 ou mais num índice em que o tipo fica abaixo de 5 tira pontos do tipo (nota − 7) × (5 − índice) × 3. Caso que motivou: avançado, 70 kg, mar de meio metro a 1 m, mistas, prioridades rápida, vira fácil e onda grande 8 → antes biquilha, groveler e fish (onda grande 4,5 · 2,0 · 3,0); agora biquilha, pranchinha e groveler. Nos 3.000 perfis de `vies.mjs` (notas sorteadas de 1 a 10, então muitos perfis têm várias notas 8+): 1º lugar mudou em 403, sem piorar os pódios incoerentes (nível ≤ 1 com pranchinha no pódio: 2; Primeiras Ondas abaixo de 0,7 L/kg: 5). Exemplo pronto igual. Uma versão mais forte (abaixo de 6) mudava 667 e foi descartada.
- **Relatório e PDF mais curtos:** saem os trechos de review e o ranking (web e PDF). O PDF passa de 5 para 3 páginas: veredito (com a mesma ilustração do tipo do resultado), seu surf × a prancha com o pódio, e setup e compra com números do método e glossário.
- **Fazer outro teste:** botão no topo e no fim do relatório. Limpa as respostas e o relatório guardado nesta sessão do navegador e volta para a primeira pergunta.
- **Confirmação de onda grande:** quem dá nota 8 ou mais para "onda forte" e diz que o mar tem até 1,5 m vê, em "Seu mar", a pergunta "Você quer mesmo uma prancha para onda grande?". "Não, é para o meu mar de sempre" faz a nota contar como 6; "Sim" mantém a nota. No caso que motivou: "Não" → biquilha, groveler, fish; "Sim" → biquilha, pranchinha, groveler. Total: 16 a 25 perguntas.
- **Coach de volta (5/nov/2026):** `COACH_ON=true`. Volta a seção do Gustavo Lucas no fim do relatório, com o formulário que monta o briefing para WhatsApp ou Instagram, o card "Seu DNA com um coach" na página e a nota de comissão no rodapé. O briefing deixa de mostrar "Tempo de surf" para avançado e profissional, que não respondem essa pergunta.
- **Perfil do coach atualizado** (com base nos áudios do Gustavo, 5/nov/2026): bio em duas frases (35+ anos de surf, filho de shaper, trabalha com vários shapers), destaques sem o título de vice-campeão, parceiros (Surface, Zampol, Pukas, Lost, DHD, Tokoro, Luke e Simon, entre outros) e botão de WhatsApp direto para (11) 95251-0278. O "Enviar pelo WhatsApp" do briefing agora vai para esse número.
- **Coach sem formulário:** sai o formulário de nome, e-mail e WhatsApp com autorização. Entra o botão "Mandar meu DNA para o Gustavo no WhatsApp", com a mensagem pronta (resultado, pedido de shaper e modelo, respostas e ficha), mais "Copiar a mensagem" e Instagram. Sai a menção a comissão (formulário e rodapé).
- **Tempo de surf por nível:** intermediário e intermediário avançado não veem "Ainda não surfo" nem "Menos de 6 meses". Resposta escondida pelo nível não entra no cálculo.

## Rodada 10: casos de referência e objetivo "manobras" (5/nov/2026)
Motivo: perfil de teste (intermediário avançado, 70 kg, mar de 1 a 1,5 m, mistas, objetivo "evoluir e aprender manobras") recebia biquilha, groveler e fish, sem pranchinha.
- **Causa 1:** o objetivo "Evoluir e aprender manobras" era somado a "Ganhar autonomia" (mesmo índice de `ARCH.ob`), que favorece groveler e evolution. Agora tem afinidade própria (`OBM`): pranchinha e evolution 5, biquilha 4, fish e groveler 3; pranchinha e step-up perdem 3 para nível ≤ 1.
- **Causa 2:** groveler com afinidade alta demais para 1 a 1,5 m (`tm` 4 → 2) e para intermediário avançado (`lv` 5 → 4); fish `tm` 1 a 1,5 m 4 → 3; groveler em onda cavada `fo` 2 → 0.
- **Regra nova:** em onda cavada de 1 m para cima, tipo feito para onda fraca perde 3 pontos por ponto que falta até 3 na afinidade com força (`PESOS.onda.cavada`).
- **Casos de referência:** `surf/tools/referencia.mjs`, 15 perfis típicos com o que um coach espera no pódio (deve ter, não pode ter, quem pode ser o 1º). Antes: 13 de 15. Agora: 15 de 15. A lista precisa ser revisada pelo Gustavo e crescer com casos reais dele.
- **3.000 perfis (`vies.mjs`):** pódios incoerentes continuam baixos (nível ≤ 1 com pranchinha em 1º: 1, de quem pediu para mudar para pranchinha; no pódio: 3; Primeiras Ondas abaixo de 0,7 L/kg: 8).
- **Exemplo pronto mudou:** intermediário que quer aprender manobras em onda pequena passa de Mid-length para **Evolution / allround 96%, 6'2" × 19 3/4" × 2 1/2", 34,2 L** (pódio evolution, fish, groveler). `assets/reports/board.webp` e o texto alternativo atualizados.

## Rodada 11: pranchinha triquilha como padrão (5/nov/2026)
Regra de coach: para quem já surfa, a pranchinha triquilha de até 6'4" é o "arroz com feijão"; o que muda é a litragem, a rabeta, o fundo e o tamanho de quilha, conforme objetivo, mar e mobilidade.
- **Regra no motor:** do nível Intermediário (calculado) para cima, a pranchinha é garantida no pódio e é o 1º lugar. Exceções, quando a pessoa pede outro estilo: "quero mudar de estilo"; manter o mesmo estilo de uma prancha atual que não é pranchinha; somar ao quiver quem já tem pranchinha; surf clássico (objetivo ou estilo); prancha para dias pequenos; soft. Onda acima de 2,5 m (avançado, mar) segue com gun e step-up; prancha para dias grandes aceita step-up ou gun em 1º. Se a litragem não cabe numa pranchinha de até 6'4" (pesados), o padrão vira a evolution.
- **Pranchinha sempre triquilha** (antes virava quadriquilha para quem marcava tubo).
- **Casos de referência:** 20 perfis em `surf/tools/referencia.mjs`, 20 de 20 batem.
- **Teste da regra:** 2.500 respostas aleatórias; 324 se encaixam na regra e em 0 o 1º lugar ficou fora de pranchinha, evolution (pesados), step-up ou gun (dias grandes).
- **3.000 perfis (`vies.mjs`):** pranchinha em 1º sobe de 10% para 17% (os sorteios incluem iniciantes e quem pede outro estilo); travas de segurança iguais.
- **Exemplo pronto:** Pranchinha 96%, 5'11" × 20 5/8" × 2 5/8", 32,1 L, rabeta round, triquilha, PU leve. `board.webp`, texto alternativo e descrição da pranchinha ("a prancha padrão de quem já surfa") atualizados.
- **Evolution para quem precisa de remada:** no intermediário e intermediário avançado com dor, nota 8+ em remada ou "cansa rápido" (e no avançado só com dor), a evolution entra no pódio e disputa o 1º lugar de igual para igual com a pranchinha. Casos de referência: 23 de 23 (novos: intermediário com dor no ombro → evolution; intermediário avançado com remada 9 → evolution; avançado sem dor com remada 9 → pranchinha).
- **Quadriquilha:** a pranchinha é sempre triquilha; para quem marca tubo ou surfa onda cavada, a ficha pede 5 caixas e explica a quadriquilha (mais velocidade e mais pegada na parede). Step-up e groveler viram quadriquilha para quem marca tubo.
- **Exemplo pronto:** remada 8 → 7 (com 8, a regra acima tirava a pranchinha do 1º lugar do exemplo). Resultado igual ao da rodada 11: Pranchinha 96%, 32,1 L.

## Rodada 12: versões da pranchinha, abertura e coach nos números (5/nov/2026)
- **Versões da pranchinha:** a rabeta, o fundo e as quilhas mudam com a onda e o estilo, e o relatório mostra a versão ao lado do nome. Para tubo: round pin, single concave profundo para double com vee (e canais leves no avançado). Onda cavada: round squash, mesmo fundo. Onda fraca: swallow, single concave raso, e quadriquilha se a nota de velocidade é 8 ou mais. Manobras: squash, single para double concave. Curvas: round, single concave com vee leve. Todo dia: squash ou round squash. Nos 10 casos de referência com pranchinha em 1º: 5 rabetas, 4 fundos, tri e quad, quilha S/M/L.
- **Exemplo pronto:** Pranchinha versão de onda fraca, 5'11" × 20 5/8" × 2 5/8", 32,1 L, swallow, single concave raso. `board.webp` e texto alternativo atualizados.
- **Abertura:** "Em 3 minutos" no lugar do número de perguntas; "Errar a prancha custa caro: uma nova sai por R$ 1.500 a R$ 4.000. Acertar custa R$ 19,99." abaixo dos botões e na prévia; card "20+ anos de experiência do surf coach profissional que calibrou o motor com a gente" no topo dos números. Facts do guia: "3 min de teste".
- **Banner de cookies menor** (`assets/measurement.js`, vale para os três apps): texto mais curto, letra 13 px, botões de 36 px de altura (acima do mínimo de 24 px da WCAG 2.2).
- Testes: 23 de 23 casos de referência; regra da pranchinha sem violação em 2.500 respostas; 3.000 perfis com as travas de sempre; axe 0 no questionário, relatório e abertura.

## Rodada 13: transição a partir da prancha atual, objetivos duplos e página do coach (5/nov/2026)

Teste do Gui: intermediário avançado com evolution 6'4" e 37 L, dor no ombro. O motor indicava biquilha 5'7" e pranchinha 5'11" (até 5 L e 9" a menos). Feedback: queda grande demais para o nível, e remada pedida alta virava prancha com remada 4.

- **Transição (`PESOS.transicao`):** até o intermediário avançado, a nova não perde mais que 2 a 4 L (1 a 2,5 L com dor, remada 8+, cansa rápido ou objetivo de conforto) nem mais que 2" a 4" de comprimento em relação à atual. Fish, biquilha, groveler e softboard curta descontam metade da diferença de comprimento de referência entre os tipos. Vale quando a atual é da família da pranchinha (evolution para baixo); o piso não leva tipos de performance acima de 0,58 L/kg.
- **Padrão por nível:** no intermediário o 1º lugar padrão passa a ser a evolution (mid-length também disputa quando precisa de remada). No intermediário avançado, a pranchinha só é o padrão se não houver dor nem remada 7+.
- **Remada alta (`PESOS.remadaAlta`):** até o intermediário avançado, nota 7+ em remada tira pontos do tipo que rema abaixo de (nota − 2).
- **Objetivos:** até 2, o placar faz a média dos dois. Opção nova: "Remar mais, com conforto".
- **Perguntas:** a partir do intermediário somem "com empurrão do professor" e "ainda não passo a arrebentação".
- **Faixa de comprimento:** até o intermediário avançado, de −1" a +3" ("na dúvida, a maior").
- **Coach:** card do Gustavo em destaque (azul-petróleo, bloco azul-claro), mensagem do WhatsApp com negrito, PDF com 4 páginas (a 4ª é o especialista com o resumo do DNA; o glossário volta para a 3ª).
- Caso do Gui depois: evolution 6'2" e 35,2 L em 1º, biquilha 5'10" e pranchinha 6'1" no pódio. Teste de viés (1.500 perfis): sem pódio incoerente novo; exemplo pronto agora dá evolution 6'2", 34,2 L (imagem `assets/reports/board.webp` atualizada).

## Rodada 14: litragem do profissional (5/nov/2026)
Motivo: surfista profissional de 70 kg recebia 21,4 L (0,305 L/kg), abaixo até dos atletas do CT (0,33–0,38 L/kg, mediana ~0,36; Toledo 70 kg ~25,4 L; Jadson 70 kg ~24 L; Surf Simply pro 0,35–0,40).
- Causa: a faixa do profissional (0,36 → 0,33) e dois descontos empilhados (condicionamento muito bom −3% e prioridade de manobra −5%).
- **Faixa do profissional:** 0,39 → 0,36 L/kg antes dos ajustes de corpo.
- **Sem desconto no avançado e no profissional:** condicionamento e prioridade de manobra não descontam litros do nível Avançado (calculado) e de quem se declara avançado ou profissional; todo profissional tem condicionamento e quer manobra. Nos outros níveis, os dois descontos somados vão até 6% (`PESOS.vol.descMax = 0.94`). Acréscimos (cansa rápido, mais flutuação) continuam inteiros.
- **Piso de 0,34 L/kg** para todo tipo de medida calculada (`PESOS.vol.pisoLkg`).
- Resultado, 70 kg: profissional 25,3 L (0,361 L/kg, a mediana do CT), 5'11"; avançado muito em forma 26,0 L; avançado médio 27,9 L; intermediário avançado 28,1 L.
- Exemplo pronto igual. Casos de referência: 21 de 23, as mesmas 2 falhas que já existem no `main` depois do PR #83 (intermediário agora tem evolution como padrão; ver nota no PR).

## Rodada 15: primeira prancha sem pergunta de prancha atual (5/nov/2026)
- Quem responde "É a minha primeira" em "Por que você quer uma nova prancha?" não vê mais "Qual é a sua prancha atual?" nem as perguntas que dependem dela (medidas, mudar de estilo, para qual estilo, o que incomoda). Resposta antiga dessas perguntas não entra no cálculo nem no briefing.
- Rodapé do app só com a assinatura: "SURF DNA · by SPORT DNA · Um projeto Beyond the Work".
- Caso de referência "avançado com pranchinha, quer mudar para fish" passa a dizer o motivo (substituir a atual).
