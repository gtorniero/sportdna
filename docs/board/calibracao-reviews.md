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
- **Para acompanhar (sem mudança agora):** o 2º e o 3º lugar caem dentro da faixa de litros do 1º em só 9% dos perfis (46 e 45 de 500), porque cada tipo tem a sua litragem; o relatório já mostra os litros de cada finalista. E o 1º lidera a prioridade nº 1 da pessoa (entre as 3 finalistas) em 48% dos perfis (242 de 500): o tipo pesa nível, estilo e onda antes das notas de prioridade, e a página 4 do PDF explica o que cada uma lidera e cede.
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
