# RUN DNA — como o modelo de recomendação funciona (nov/2026)

Documento interno. Não linkar no site. O código está em `run/index.html` (função `engine`, tabela `PESOS`); a base científica em `ciencia.md`; a validação em `validacao.md`; os dados em `dados/`.

## 1. Entrada: 19 perguntas
Corpo (peso, largura do pé, dor, **onde o tênis gasta**), corrida (tempo de corrida, km por semana, ritmo leve, terreno, calor), objetivo (objetivo, treino de ritmo), preferências (sensação, prioridade, desconforto com neutro, orçamento — inclui "sem limite" —, marca preferida, tênis atual, uso fora da corrida, rodízio).

Derivados:
- **Nível** (0 a 4): média de tempo de corrida, km/semana e ritmo; quem ainda não corre é 0.
- **Desgaste da sola** → pisada (calcanhar, meio, ponta ou sem informação) e giro (por dentro, por fora). Pisada ajusta drop; sola gasta por dentro só soma 1 ponto à estabilidade pedida, sem trocar a categoria (pisada não decide; ver ciência, perguntas 1 e 11).
- **Traços** (para cruzar com as etiquetas das reviews): pesado, pé largo/estreito, precisa de estabilidade, iniciante, ritmo, ritmo leve, longão, calor, Aquiles, calcanhar, antepé, asfalto, trilha técnica, uso diário.
- **Usos pedidos**: rodagem, ritmo, prova de 5/10 km, meia, maratona, trilha, academia, dia a dia.
- **Vetor ideal** (0 a 10) de amortecimento, resposta, leveza, estabilidade, durabilidade e custo por km — o mesmo do hexágono do relatório.

## 2. Categoria
Pontos por categoria (entrada, treino diário, máximo amortecimento, estabilidade, treino rápido, supertênis, trilha, conforto) a partir de objetivo, terreno, sensação, treino de ritmo, desconforto com neutro, dor, peso, nível, uso e orçamento. As duas maiores viram categoria 1 e 2. Regras com base científica: estabilidade só com desconforto em neutro; supertênis só com nível ≥ 3, ritmo e orçamento, nunca para iniciante nem para quem pediu estabilidade; quem compete, faz ritmo semanal e monta rodízio pode ter supertênis como par de prova.

## 3. Placar de cada tênis (`PESOS`)
Soma de fatores, cada um com peso nomeado:

| Fator | Peso atual | Origem |
|---|---|---|
| Categoria 1 / 2 / zona (categoria + orçamento) | 10 / 6 (8 se a categoria 1 tem < 10 modelos) / ±2 | regra |
| Preço × orçamento | +1,5 dentro; −0,5 até 8% acima; −6 e mais acima; até −2 se muito abaixo da faixa | regra |
| Sensação preferida (macio/firme) | 0,7 × distância | ciência (conforto) |
| Specs técnicas (falta × sobra do vetor ideal) | falta 0,45; sobra 0,12; leveza 1,8 para quem pede leveza/ritmo, 0,15 para os outros | ciência + **calibrado** |
| Peso do corredor | 85 kg+: +0,6 maciez, +0,6 base estável, −1 tênis < 215 g; até 65 kg: +0,6 maciez | ciência |
| Pé largo | +2 fôrma larga, −0,6 fôrma padrão | regra |
| Prioridade | durabilidade, leveza, preço ou conforto | regra |
| Dor e pisada | tornozelo −1,5 em tênis muito macio; drop < 7 mm −1,2 (calcanhar) e −1,5 (Aquiles); drop ≥ 10 −0,8 (antepé) | ciência (fraca) |
| Estabilidade | +0,8 por ponto de estabilidade se há desconforto com neutro | ciência |
| Usos indicados pelas reviews | 2,4 por uso (teto 2,4); −0,5 sem nenhum | **calibrado** |
| "Não indicado para" (reviews) | 6 + até 1 por etiqueta (menos com muitas reviews), teto 12; etiquetas de preferência valem 0,4; ritmo fora de tênis rápido 0,35 | **calibrado** + segurança |
| Perfil ideal citado pelas reviews | 0,8 por etiqueta, teto 1,6 | regra |
| Nota das reviews | 1,8 × (nota − 3,8) × n/(n+4), n = profissionais + 0,7 × clientes | **calibrado** |
| Qualidade do dado | −0,6 preço estimado; −1,2 specs só de ficha; −3 importado; −0,45 por review a menos que 4 | regra |

## 4. Pódio e relatório
Top 3 por placar (Fila fora do pódio por decisão editorial); Fit Score = 96 − 2 × (distância para o 1º), entre 70 e 97 no pódio. Segundo par para rodízio da categoria complementar. Quadro por marca (só vendidos no Brasil). Comparação com o tênis atual e comparador livre.

## 5. Como recalibrar
1. Acrescente casos em `dados/casos.json` (formato em `validacao.md`).
2. `node run/tools/calibrar.mjs docs/tenis/dados/casos.json` mede; com `--ajustar` procura pesos melhores em validação cruzada de 3 partes (só aceita mudança que melhora o total e 2 das 3 partes; pesos de saúde não caem abaixo da metade).
3. Antes de aceitar: rode os testes de viés (marcas, contraindicação séria, casos de referência) e registre a rodada em `calibracao-e-validacao.md`.
