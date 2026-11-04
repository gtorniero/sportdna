# RUN DNA — como o modelo de recomendação funciona (nov/2026)

Documento interno. Não linkar no site. O código está em `run/index.html` (função `engine`, tabela `PESOS`); a base científica em `ciencia.md`; a validação em `validacao.md`; os dados em `dados/`.

## 1. Entrada: 19 perguntas
Corpo (peso, largura do pé, dor, **onde o tênis gasta**), corrida (tempo de corrida, km por semana, ritmo leve, terreno, calor), objetivo (objetivo, treino de ritmo), preferências (sensação, prioridade, desconforto com neutro, orçamento — 4 faixas, pode marcar mais de uma; a última é "acima de R$ 1.500 ou sem limite" —, marca preferida, tênis atual, uso fora da corrida, rodízio).

Derivados:
- **Orçamento** (`budget(a)`): janela do menor piso ao maior teto marcados; com a última faixa, sem teto (e, se for a única, sem piso). `lvl` traduz o teto para a escala antiga (0 até R$ 500, 2 até R$ 1.000, 3 até R$ 1.500, 4 sem teto) e alimenta as regras de categoria e o índice de custo por km. Respostas antigas (`orc` de 0 a 5) são convertidas.
- **Nível** (0 a 4): média de tempo de corrida, km/semana e ritmo; quem ainda não corre é 0.
- **Desgaste da sola** → pisada (calcanhar, meio, ponta ou sem informação) e giro (por dentro, por fora). Pisada ajusta drop; sola gasta por dentro só soma 1 ponto à estabilidade pedida, sem trocar a categoria (pisada não decide; ver ciência, perguntas 1 e 11).
- **Traços** (para cruzar com as etiquetas das reviews): pesado, pé largo/estreito, precisa de estabilidade, iniciante, ritmo, ritmo leve, longão, calor, Aquiles, calcanhar, antepé, asfalto, trilha técnica, uso diário.
- **Usos pedidos**: rodagem, ritmo, prova de 5/10 km, meia, maratona, trilha, academia, dia a dia.
- **Vetor ideal** (0 a 10) de amortecimento, resposta, leveza, estabilidade, durabilidade e custo por km — o mesmo do hexágono do relatório.

## 2. Categoria
Pontos por categoria (entrada, treino diário, máximo amortecimento, estabilidade, treino rápido, supertênis, trilha, conforto) a partir de objetivo, terreno, sensação, treino de ritmo, desconforto com neutro, dor, peso, nível, uso e orçamento. As duas maiores viram categoria 1 e 2. Regras com base científica: estabilidade só com desconforto em neutro; supertênis só com nível ≥ 3, ritmo e orçamento (teto de R$ 1.000 ou mais; meia e maratona, R$ 1.500 ou mais), nunca para iniciante nem para quem pediu estabilidade; quem compete, faz ritmo semanal e monta rodízio pode ter supertênis como par de prova.

## 3. Placar de cada tênis (`PESOS`, calibrado em nov/2026)
Soma de fatores, cada um com peso nomeado (valores atuais em `run/index.html`):

| Fator | Peso atual | Origem |
|---|---|---|
| Categoria 1 / 2 / vizinha | 10 / 12 (8 se a 1ª tem < 10 modelos; 6 se a pessoa relatou desconforto com neutro) / 6 | **calibrado**: a ordem entre 1ª e 2ª categoria é pouco confiável; a zona desempata |
| Zona (categoria 1 + até 8% acima do orçamento) | ±1,1 | **calibrado** |
| Preço × orçamento (janela das faixas marcadas) | +3 dentro; −0,5 até 8% acima do teto; −12 e −1 por R$ 150 mais acima; até −2 abaixo do piso; sem teto com a última faixa | **calibrado** (rodada 7: mantidos) |
| Sensação preferida (macio/firme) | 1,24 × distância | ciência (conforto) + **calibrado** |
| Specs técnicas (falta × sobra do vetor ideal) | falta 0,23; sobra 0,05; leveza 7,2 para quem pede leveza/ritmo, 0,2 para os outros | ciência (Franz 2012) + **calibrado** |
| Peso do corredor | 85 kg+: +0,6 maciez, +0,6 base estável, −1 tênis < 215 g; até 65 kg: +0,6 maciez | ciência (Malisoux 2020, Fuller 2017) |
| Pé largo | +2 fôrma larga, −0,6 fôrma padrão | regra |
| Prioridade | durabilidade, leveza, preço; conforto 0,9 | regra + **calibrado** |
| Dor e pisada | tornozelo −1,5 em tênis muito macio; drop < 7 mm −1,2 (calcanhar) e −1,5 (Aquiles); drop ≥ 10 −0,2 (antepé) | ciência (fraca) + **calibrado** |
| Desconforto com neutro | +1,06 por ponto de estabilidade; −4 se o tênis não é de estabilidade | ciência (Malisoux 2016) |
| Usos indicados pelas reviews | 2,4 por uso (teto 2,4); −0,5 sem nenhum | **calibrado** |
| Contraindicações sérias (encaixe e saúde) | 12 + até 1 por etiqueta, teto 24 | segurança |
| Ressalvas leves (calor, longão, ritmo fora de tênis rápido, iniciante, uso diário, asfalto) | 1,2 cada; ritmo 1 | regra |
| Perfil ideal citado pelas reviews | 0,8 por etiqueta, teto 1,6 | regra |
| Nota das reviews | 3,18 × (nota − 3,8) × n/(n+4), n = profissionais + 0,7 × clientes | **calibrado** |
| Qualidade do dado | −0,6 preço estimado; −2,4 specs só de ficha; −3 importado; −0,9 por review a menos que 4 | regra + **calibrado** |

Categorias vizinhas: entrada ↔ treino diário/conforto; treino diário ↔ treino rápido/máximo/entrada/conforto; máximo ↔ treino diário/estabilidade; estabilidade ↔ máximo/treino diário; treino rápido ↔ treino diário/supertênis; supertênis ↔ treino rápido. Quem relatou desconforto com neutro não recebe categoria vizinha.

## 4. Pódio e relatório
Top 3 por placar (Fila fora do pódio por decisão editorial); Fit Score = 96 − 2 × (distância para o 1º), entre 70 e 97 no pódio. Segundo par para rodízio da categoria complementar. Quadro por marca (só vendidos no Brasil). Comparação com o tênis atual e comparador livre. PDF de 5 páginas na ordem de `docs/padrao-relatorio-pdf.md` (veredito, ranking e pódio, método e dados, sua corrida × o tênis, guia de compra); nenhuma página mostra pesos ou pontos do placar.

## 5. Como recalibrar
1. Acrescente casos em `dados/casos.json` (formato em `validacao.md`).
2. `node run/tools/calibrar.mjs docs/tenis/dados/casos.json` mede; com `--ajustar` (e `--so=orc` para mexer só nos pesos cujo nome começa com `orc`) procura pesos melhores em validação cruzada de 3 partes (só aceita mudança que melhora o total e 2 das 3 partes; pesos de saúde não caem abaixo da metade).
3. Antes de aceitar: rode os testes de viés (marcas, contraindicação séria, casos de referência) e registre a rodada em `calibracao-e-validacao.md`.
