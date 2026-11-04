# RUN DNA — argumentos de venda (nov/2026)

Documento interno. Números conferidos no código e nos dados em 02/nov/2026, 03/nov/2026 e 04/nov/2026 (orçamento em 4 faixas, rodada 7). Use só o que está aqui; não arredonde para cima.

## Em uma frase
O RUN DNA cruza o seu corpo e o seu treino com 212 tênis (189 com medida de laboratório) e 1.755 reviews, e foi calibrado contra centenas de recomendações de especialistas — sem nenhuma marca pagando para aparecer.

## Números para usar
| Número | O que é |
|---|---|
| 212 tênis, 13 marcas | Catálogo atual; 189 vendidos no Brasil |
| 1.755 reviews | 1.212 de especialistas que testam de verdade e 543 de clientes |
| 189 tênis com medida de laboratório | Peso, altura de espuma e drop medidos, não só a ficha da marca |
| 41 estudos científicos | Revisados em 12 questões (pisada, conforto, peso corporal, drop, amortecimento, supertênis, rodízio, vida útil). São 47 citações em `dados/ciencia.json`, mas 5 estudos aparecem em mais de uma questão: use 41 |
| 304 recomendações de especialistas | De 35 fontes (RunRepeat, RTINGS, Solereview, Doctors of Running, iRunFar, Runner's World e guias brasileiros). 234 têm algum tênis do nosso catálogo e são as usadas para calibrar e testar o motor (as 35 fontes estão nas 234) |
| 5.000 perfis simulados | Teste de segurança e de viés: 5.000 perfis sorteados, 15.000 tênis no pódio. Não diga "15.000 perfis" |
| 37 critérios por tênis | 19 respostas, 8 medidas, 6 índices e 4 sinais das reviews (calculado no código: `Q.length+8+6+4`) |
| 52 pesos calibrados | Cada fator do placar ajustado contra as recomendações dos especialistas, com teste em casos guardados |
| 19 perguntas | Corpo, desgaste da sola, corrida, objetivo e preferências |
| 6 índices por tênis | Amortecimento, resposta, leveza, estabilidade, durabilidade e custo por km |

## O que nos diferencia (verdadeiro e verificável)
- **Ciência, não mito.** Neutro por padrão, porque estudos com milhares de corredores (Nielsen 2014; Cochrane 2022) mostram que escolher pela pisada não reduz lesão. Estabilidade só para quem sente desconforto.
- **Testado contra especialistas.** Num teste com recomendações reais de especialistas, o motor coloca um tênis indicado por eles no top 3 em 29% dos casos e no top 10 em 50% (escolhendo 3 ao acaso seria perto de 2%).
- **Equilíbrio entre marcas.** A participação das marcas no nosso pódio acompanha a dos especialistas (ex.: Nike 20% × 21%, ASICS 24% × 26%). Nenhuma marca paga.
- **Segurança primeiro.** Em 5.000 perfis simulados (15.000 tênis no pódio), 99,9% dos tênis do pódio não têm duas ou mais contraindicações sérias citadas pelas reviews (pé largo, peso, estabilidade, Aquiles, trilha técnica, pisada).
- **Cada tênis tem um porquê.** 138 dos 212 modelos são a melhor escolha para algum perfil de corredor.
- **Honestidade.** Mostramos quando o dado é só da ficha da marca, quando o preço é estimado e quando as reviews discordam. Não prometemos prevenir lesão.

## O que não dizer
- “47 estudos” (são 41 estudos; 47 é o número de citações) e “15.000 perfis” (são 5.000 perfis, 15.000 vagas de pódio).
- “Previne lesão” ou “o tênis que vai curar sua dor” (nenhum estudo sustenta).
- “O melhor tênis do mercado” (o certo é “o que mais combina com você”).
- Números de acerto sem dizer contra o quê (sempre “contra recomendações de especialistas”).
