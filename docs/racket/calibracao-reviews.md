# Racket Match — calibração do índice contra reviews (out/2026)

## Dados do relatório PDF (23/out)
- Trechos de review: as 58 raquetes têm pelo menos 2, resumidos e traduzidos (testadores TW + Tennisnerd, Tennis Companion, The Tennis Tribe e outros). Versões leves usam reviews de outros sites ou média de clientes TW; gerações anteriores vêm indicadas.
- Atletas: 45 de 58 raquetes com profissionais por linha. Incluídos nesta rodada: Dunlop CX (Mérida, Brooksby, Jamie Murray, Santamaria), Dunlop SX (Vallejo), Prince Tour (Pouille, customizada). Sem profissional confirmado: Clash, Shift, Instinct, Ti S6, Boost Drive, ProKennex, Phantom, Ripstick. Burn (Pavlyuchenkova) ficou de fora por fonte fraca (jan/2025).
- Comparação com o Tennis Engineer no mesmo perfil (intermediário, cotovelo, Pure Strike 98): o top 3 deles (Shift 99, Extreme MP, Percept 100, todas 66–67 RA) fica entre 16º e 37º no nosso, por causa da dor no cotovelo; os dois motores concordam que vale trocar a Pure Strike.

## Rodada 9: questionário mais curto e orçamento em 3 faixas (nov/2026)

### O que mudou
- Saíram duas perguntas, a pedido do dono:
  - **Mão dominante.** No tênis não faz diferença: o peso já era zero desde a rodada 3. Saiu também a dica de overgrip para canhoto e a frase "Canhoto ou destro não muda a recomendação".
  - **Backhand de uma ou duas mãos.** Saíram os efeitos no motor: `alvo.umaMao`, `peso.umaMaoAvancado`, `zona.swUmaMao` e `pen.umaMao` (swingweight mínimo, cotovelo e balanço). Saíram também o motivo "massa suficiente para o backhand de uma mão" e os chips do PDF. A evidência já era fraca (ver rodada 3).
- O questionário vai de **26–31** para **24–29** perguntas (sem e com as condicionais).
- O orçamento agora tem 3 faixas: "Até R$ 1.400" (`1400`), "R$ 1.400 a R$ 2.000" (`2000`) e "Acima de R$ 2.000 ou sem limite" (`99999`).
  - A penalidade progressiva (`pen.orcamento`) continua igual: até 8% acima é leve, e daí em diante cresce.
  - O limite de cada faixa é o seu valor. A terceira faixa não tem penalidade nem o bônus `placar.dentroOrcamento`.
  - "Cabe no orçamento" não aparece mais para quem marcou sem limite.
- Códigos antigos (salvos, colados ou restaurados pelo checkout):
  - `dom` e `bh` são descartados.
  - O orçamento antigo vai para a faixa nova: 1.800 → 2.000; 2.200 → sem limite.
- Exemplo pronto: o orçamento passou de 2.200 para 2.000. O resultado não muda: Head Boom MP 95% · Clash 100 v3 95% · Black Ace 300 92%.
- Ferramentas: `calibrar.mjs` não manda mais `dom` e `bh`, e o orçamento do caso vira 1400/2000/99999. `vies.mjs` mede as 3 faixas.

### Medição antes × depois
Casos de especialistas (`calibrar.mjs`, 268 casos úteis de 379, 88 na parte de teste):

| | R8 total | R9 total | R8 teste | R9 teste |
|---|---|---|---|---|
| Top 1 | 17,2% | 16,8% | 18,2% | 18,2% |
| Top 3 | 36,6% | 36,6% | 39,8% | 39,8% |
| Top 10 | 63,4% | 63,4% | 68,2% | 68,2% |
| MRR | 0,316 | 0,313 | 0,336 | 0,336 |
| Algum indicado no top 3 | 42,2% | 42,2% | 47,7% | 47,7% |

- Com dor no braço: top 3 de 63,9% para 66,7%.
- Grupo cotovelo: top 3 de 57,7% para 61,5%.
- Grupo potência: top 3 de 62,1% para 58,6% (1 caso de 29 saiu do top 3).
- Acaso: top 3 ≈ 4,8% (3 de 62).

Segurança (`vies.mjs --realista`, 3.000 perfis, três sementes):

| | R8, 12345 | R9, 12345 | R8, 777 | R9, 777 | R8, 2026 | R9, 2026 |
|---|---|---|---|---|---|---|
| Pódios com 2+ contraindicações sérias | 111 | 112 | 94 | 113 | 114 | 109 |
| Pódios com 1+ séria | 266 | 263 | 265 | 292 | 270 | 284 |
| 1ª acima do orçamento, faixa até R$ 1.400 | 16,3% | 17,1% | 15,8% | 19,5% | 16,2% | 18,0% |
| Faixa até R$ 1.400, mais de 8% acima | 4,7% | 4,1% | 5,0% | 4,5% | 4,5% | 3,5% |
| 1ª acima do orçamento, todos | 6,5% | 8,7% | 5,6% | 8,9% | 5,7% | 8,3% |

- Os perfis sorteados não são os mesmos antes e depois, porque o questionário mudou e o sorteio anda junto. Por isso medimos com três sementes.
- Na média, os pódios com 2+ sérias ficam em 106 antes e 111 depois. A diferença cabe no ruído entre sementes (94 a 114).
- Na faixa até R$ 1.400, a 1ª acima do orçamento sobe cerca de 2 pontos, mas só dentro da tolerância de 8%. Os casos mais de 8% acima caíram.
- O total "1ª acima" sobe porque a faixa do meio agora é R$ 2.000, e não R$ 1.800/2.200. Nessa faixa, nenhuma 1ª passa mais de 8% do limite.
- 1ª dentro da zona do mapa: 91,3% → 90,9%. Cobertura: 56 modelos já em 1º e 60 no top 3, de 62.

### Decisão
O resultado não piorou de forma clara: nos casos de especialistas a parte de teste ficou idêntica, e a segurança ficou dentro do ruído. Por isso não rodamos `--ajustar --trava`, e os pesos da rodada 8 continuam.

Ponto para acompanhar: a faixa até R$ 1.400 com a 1ª um pouco acima do orçamento (até 8%).

### Números públicos (abertura do app e página 4 do PDF)
| Número | Valor | Fonte |
|---|---|---|
| Raquetes | 62 | `CATALOG` em `racket/index.html` |
| Perguntas | 24 a 29 | `Q` (sem e com as condicionais) |
| Variáveis por raquete | 45 | `NVAR` = 29 perguntas + 9 especificações + 7 índices |
| Avaliações | 670 | soma de `r.nrev` (TW 551 + outros sites 119) |
| Estudos científicos | 21 | `dados/ciencia.json` |
| Casos de especialistas | 379, em 3 idiomas | `dados/casos.json` (200), `casos-pt.json` (67), `casos-es.json` (112) |
| Perfis simulados | 3.000 por teste | `vies.mjs --realista` |
| Acerto no top 3 | 39,8% (acaso 4,8%) | `calibrar.mjs`, parte de teste (88 casos) |

Os números escritos no código estão em `METODO`, em `racket/index.html`. Atualize lá a cada rodada.

## Rodada 8: auditoria das fichas e nova calibração (nov/2026)

### Auditoria
32 buscas. Correções e conferências estão em `dados/auditoria-nov2026.json`, no formato {modelo, campo, antes, depois, fonte, nota}. Só corrigimos o que tinha fonte.

**Preços no Brasil (preço cheio):**

| Modelo | Antes | Depois | Fontes |
|---|---|---|---|
| Pure Aero Team | R$ 2.300 a 2.350 | R$ 1.800 a 2.230 | Amazon, Magazine Luiza, Mercado Livre |
| Pure Aero Lite | R$ 2.140 a 2.300 | R$ 1.970 a 2.300 | 4 lojas |
| Pure Drive Team | R$ 2.000 a 2.100 | R$ 1.800 a 2.100 | |
| Pure Drive Lite | R$ 2.100 | R$ 1.850 a 2.200 | |
| Pure Aero | R$ 1.800 a 2.230 | R$ 1.600 a 2.230 | |
| Pure Drive | R$ 1.930 a 2.090 | R$ 1.930 a 2.200 | |
| Pure Aero 98 | R$ 2.050 a 2.450 | R$ 2.050 a 2.320 | |
| Clash 100 v3 | R$ 1.620 a 1.800 | R$ 1.800 a 2.200 | R$ 1.620 era o preço no Pix |

As versões Team e Lite da Babolat custam de fato quase o mesmo que as principais no Brasil. A faixa antiga só exagerava um pouco.

**Fichas:**
- Balanço sem corda da Phantom 100X: 321 → 320 mm. Da Gravity MP: 326 → 325 mm. Fonte: TW Europe.
- Conferidas e sem diferença: Pure Aero, Pure Aero Team, Pure Aero 98, Pure Drive Team e Lite, Speed MP, Gravity MP, Boom MP, Clash 100 v3, Blade 98 v9, Phantom 100X, Black Ace 300 e EZONE 100.
- Pure Drive: uma página da TW Europe diz RA 72 ("atualizado com mais amostras"), mas junto de SW 290, que não bate com nada. Ficou 69; conferir na página.

**Disponibilidade:** continuam sem oferta nova no Brasil a Speed Team, a Boom Team, a Clash 108 v3, a Black Ace 105 e a Ki Q+ Tour. O preço da Extreme Team (R$ 2.049,90) foi confirmado.

**Efeito das correções sozinhas:**
- Casos de especialistas: nada muda, porque quase nenhum caso informa orçamento.
- Amostra realista: Babolat no top 3 de 20,7% para 21,6%.
- As fichas batem com a fonte. O desvio de marcas não vem de erro de ficha, e sim do motor e da aprovação TW.

### Calibração
Rodamos `calibrar.mjs --ajustar --trava`, com os mesmos critérios da rodada 7. Foram 9 passos aceitos, e a trava não precisou desfazer nenhum.

| Peso | Rodada 7 | Rodada 8 |
|---|---|---|
| `alvo.nivel.adv.control` | 1,125 | 1,4063 |
| `alvo.swing.long.power` | −1,5 | −0,75 |
| `alvo.estilo.net.maneuver` | 1,5 | 3 |
| `alvo.saque.mix.stability` | 0,5 | 0,625 |
| `alvo.quer.power` | 2 | 3 |
| `pen.swBorda` | 1,2 | 0,6 |
| `placar.aprovacaoNivel.adv` | 2,5 | 1,25 |
| `placar.aprovacaoTeto` | 8 | 4 |
| `match.zona` | 4 | 2 |

A aprovação dos testadores TW passou a pesar metade.

### Rodada 7 × rodada 8
Casos de especialistas: 268 no total, 88 na parte de teste.

| | R7 total | R8 total | R7 teste | R8 teste |
|---|---|---|---|---|
| Top 1 | 18,7% | 17,2% | 19,3% | 18,2% |
| Top 3 | 32,5% | 36,6% | 35,2% | 39,8% |
| Top 10 | 61,6% | 63,4% | 68,2% | 68,2% |
| MRR | 0,312 | 0,316 | 0,331 | 0,336 |
| Algum indicado no top 3 | 39,6% | 42,2% | 44,3% | 47,7% |

- Grupo cotovelo: top 3 de 30,8% para 57,7%.
- Com dor no braço: top 3 de 27,8% para 63,9%.
- Iniciante: sem mudança (top 3 de 16,2%).

Marcas no nosso top 3 nos casos, contra o 1º indicado pelos especialistas:

| Marca | Especialistas | R7 | R8 |
|---|---|---|---|
| Babolat | 33,2% | 20,6% | 20,8% |
| Wilson | 28,4% | 14,8% | 19,0% |
| Head | 22,8% | 29,5% | 26,9% |
| Yonex | 10,1% | 14,7% | 13,4% |
| Prince | 3,0% | 11,2% | 11,4% |
| ProKennex | 0% | 4,6% | 5,5% |
| Tecnifibre | 1,1% | 3,5% | 2,5% |
| Dunlop | 1,5% | 0,6% | 0% |
| Volkl | 0% | 0,5% | 0,5% |

Segurança e cobertura (`vies.mjs`, 3.000 perfis):

| | Realista R7 | Realista R8 | Uniforme R7 | Uniforme R8 |
|---|---|---|---|---|
| Pódios com contraindicação séria, 1+ / 2+ | 270 / 126 | 266 / 111 | 430 / 200 | 468 / 172 |
| 1ª acima do orçamento, até R$ 1.400 | 20,0% | 16,3% | 14,9% | 10,8% |
| Modelos já em 1º / no top 3 (de 62) | 54 / 59 | 52 / 62 | 54 / 59 | 51 / 59 |
| 1ª dentro da zona do mapa | 93,2% | 91,3% | | |
| Babolat 1º / top 3 | 23,4 / 20,7% | 21,9 / 21,5% | 13,5 / 12,3% | 12,5 / 12,0% |

- No sorteio uniforme, os pódios com 1 contraindicação séria subiram (430 → 468), e os com 2 ou mais caíram. A trava mede a amostra realista, e lá os dois números caíram.
- Exemplo pronto: Head Boom MP 95% · Clash 100 v3 95% · Black Ace 300 92%. Por isso foram refeitos:
  - `assets/reports/racket.webp`;
  - `assets/cards/racket-produto.webp`;
  - `assets/cards/racket-perfil.webp` (DNA 95%, conforto 9,2, potência 8,5);
  - os textos alternativos em `index.html`, `assets/site.js` e `guias/racket/`.

### Leitura
- O ganho veio de pesar menos a aprovação TW e o swingweight fora da zona, e de seguir mais o que a pessoa pede (potência e manobra na rede). O que mais melhorou foi o grupo com dor no braço.
- Instabilidade: `alvo.nivel.adv.control` desceu na rodada 7 e voltou a subir agora. Com 180 casos de treino, um peso pode oscilar entre rodadas; vale aumentar a base de casos antes da próxima.
- Babolat continua abaixo dos especialistas (20,8% × 33,2%). Pure Drive, Pure Aero e Pure Aero 98 já são 1º quando indicadas. O que perde é a família leve (Pure Drive Lite e Team, Pure Aero Team, posição mediana 26 a 45) e a Evo Drive (mediana 18).
- Iniciante continua com 0% de top 1. Os guias indicam a Ti S6 (225 g e 115 pol²), abaixo do nosso piso de 258 g; é uma regra para rever com professores.

## Rodada 7: calibração contra casos de especialistas (nov/2026)

Ferramenta: `node racket/tools/calibrar.mjs --ajustar --trava --saida pesos.json`.
- Descida por coordenadas em 120 pesos de `PESOS`, com multiplicadores 0,5/0,75/1,25/1,5/2, em duas voltas.
- Divisão fixa por id (semente 20261102): 1 em cada 3 casos fica só para teste. O resto é dividido em 3 partes.
- Um passo só entra se: o total melhora, pelo menos 2 das 3 partes melhoram e nenhuma piora mais de 0,01.
- Objetivo: MRR + 0,5 × top 3 − 0,1 × desvio de marcas. O desvio é a distância L1 entre as marcas do nosso top 3 e as do 1º indicado.
- Pesos de saúde e segurança têm piso de 0,5×.
- Ficam fora: orçamento, "difícil de achar", limiares, alvos em gramas e mm, e `match.pen`. `match.pen` multiplica todas as penalidades, inclusive as de orçamento e segurança; na primeira rodada o ajuste tentou cortá-lo pela metade.
- Trava: `vies.mjs --realista` com os pesos finais. Os pódios com 2+ contraindicações sérias e a faixa até R$ 1.400 acima do orçamento não podem piorar em relação à rodada 6.

Passos aceitos: 10. A trava desfez 2:
- `placar.aprovacaoTeto` 8 → 16 e `placar.aprovacaoNivel.adv` 2,5 → 5 foram desfeitos. Juntos, levavam a faixa até R$ 1.400 de 20,4% para 22,6% acima do orçamento. Também reforçavam o efeito popularidade da TW, o mesmo visto na rodada 3.

Pesos que mudaram:
| Peso | Rodada 6 | Rodada 7 |
|---|---|---|
| `alvo.nivel.adv.control` | 1,5 | 1,125 |
| `alvo.idade.seniorAlvo.maneuver` | 1,5 | 2,25 |
| `alvo.estilo.agg.power` | 0,5 | 1,125 |
| `alvo.saque.mix.spin` | 0,5 | 1 |
| `alvo.quer.control` | 2,5 | 3,125 |
| `alvo.quer.comfort` | 2,5 | 5 |
| `placar.aprovacaoNivel.int` | 1 | 1,25 |

### Rodada 6 × rodada 7
Casos de especialistas: 268 com modelo do catálogo, 88 deles na parte de teste.

| | Rodada 6 total | Rodada 7 total | Rodada 6 teste | Rodada 7 teste |
|---|---|---|---|---|
| Top 1 | 19,0% | 18,7% | 19,3% | 19,3% |
| Top 3 | 31,7% | 32,5% | 35,2% | 35,2% |
| Top 10 | 61,2% | 61,6% | 68,2% | 68,2% |
| MRR | 0,311 | 0,312 | 0,331 | 0,331 |
| Algum indicado no top 3 | 39,2% | 39,6% | 44,3% | 44,3% |

Marcas no nosso top 3, contra o 1º indicado pelos especialistas:
| Marca | Especialistas | Rodada 6 | Rodada 7 |
|---|---|---|---|
| Babolat | 33,2% | 19,9% | 20,6% |
| Wilson | 28,4% | 11,2% | 14,8% |
| Head | 22,8% | 32,2% | 29,5% |
| Yonex | 10,1% | 13,9% | 14,7% |
| Prince | 3,0% | 12,9% | 11,2% |
| Tecnifibre | 1,1% | 4,7% | 3,5% |
| ProKennex | 0% | 4,0% | 4,6% |

Segurança e cobertura (`vies.mjs`, 3.000 perfis):
| | Realista, rodada 6 | Realista, rodada 7 | Uniforme, rodada 6 | Uniforme, rodada 7 |
|---|---|---|---|---|
| Pódios com contraindicação séria, 1+ / 2+ | 270 / 126 | 270 / 126 | 434 / 201 | 430 / 200 |
| 1ª acima do orçamento, até R$ 1.400 | 20,4% | 20,0% | 14,8% | 14,9% |
| 1ª acima do orçamento (todos) | 8,1% | 8,1% | 6,6% | 6,8% |
| Modelos já em 1º / no top 3 (de 62) | 54 / 60 | 54 / 59 | 54 / 60 | 54 / 59 |
| Babolat 1º / top 3 | 24,7 / 21,4% | 23,4 / 20,7% | 13,8 / 12,7% | 13,5 / 12,3% |

- Nunca no top 3 na rodada 7: Vostra V8, Burn 100 v5 e Dunlop FX 500 na amostra realista; Ti S6, Burn 100 v5 e Dunlop FX 500 na uniforme.
- Exemplo pronto: Phantom 100X 290 g 96% · Clash 100 v3 96% · Boom MP 95%. Antes: Black Ace 300, Phantom 100X e Boom MP.
- Atualizados com o novo exemplo:
  - `assets/reports/racket.webp`: 1000 × 1899, mesmo recorte;
  - `assets/cards/racket-produto.webp`: 720 × 1280;
  - os textos alternativos em `index.html`, `assets/site.js` e `guias/racket/`.

### Leitura
- A calibração ganhou pouco: +0,8 ponto de top 3 no total e nada na parte de teste. Os pesos não são o gargalo, como no RUN DNA.
- O que mais erra:
  - **Iniciante:** 0% de top 1. Os guias indicam raquetes muito leves e de cabeça muito grande (Ti S6, 225 g e 115 pol²), e o nosso peso ideal tem piso de 258 g.
  - **Marcas:** Wilson e Babolat continuam sub-indicadas, e Head e Prince super-indicadas.
- Próximo passo:
  - revisar os dados dos modelos (aprovação, etiquetas, preço da Babolat no Brasil) e a regra do piso de peso para iniciante;
  - conferir a leitura dos casos de iniciante, sem forçar o `resp()`. Nesta rodada ele não mudou.

## Rodada 6: pesos nomeados, orçamento, segurança, ciência e 4 modelos novos (nov/2026)

O que mudou em `racket/index.html`:
- **Tabela `PESOS`.** Todos os pesos de `target`, `targetWeight`, `zones`, `penalties`, `score` e `compute`, mais a aprovação TW (`r.q`), estão numa tabela única, agrupada e com a origem de cada grupo. Equivalência provada: nos 3.000 perfis sorteados, o top 3 e o Match ficaram idênticos antes e depois da troca.
- **Motor exposto para teste.** Com `?teste` na URL, `window.__RK` traz `A`, `Q`, `RK`, `compute`, `PESOS`, `idx` e `EXAMPLE`. Sem o parâmetro, nada muda.
- **Orçamento progressivo**, no modelo do RUN DNA:
  - até 8% acima: −1,5;
  - mais de 8% acima: −18, e mais −10 a cada 10% a mais;
  - dentro do orçamento: +3 no Match;
  - a regra da zona não promove para 1º uma raquete bem acima do orçamento quando a 1ª cabe nele.
- **Segurança:**
  - Dor no braço e raquete abaixo de 275 g: 6 + 0,6 por grama.
  - Força baixa ou 60+ anos e raquete de 310 g ou mais: 8 + 1 por grama.
  - Rigidez para quem tem dor hoje: 2,2/1,8/1,2 → 3/2,5/1,8 por ponto de RA.
  - "Difícil de achar no Brasil" para quem prefere comprar aqui: 6 → 12.
- **Rigidez com evidência fraca (`ciencia.md`, tema 1).** Testamos um bloqueio duro de RA > 60 no pódio de quem tem dor forte e ele foi retirado. Ficou a penalidade suave (`pen.raForte`), e o texto do relatório não diz mais que o motor "limitou a 60 RA". Os pesos de ombro (0,6) e punho (0,8) não subiram (tema 8).
- **Tecnologia de amortecimento vale menos** (`PESOS.indice`, tema 4): no índice de conforto, 0,08 → 0,03; no conforto no braço, 0,12 → 0,04, com a diferença indo para a massa (0,24 → 0,32).
- **Textos:**
  - O índice "Braço Seguro" passou a se chamar "Conforto no braço".
  - Saíram "o que protege", "reduz a carga", "poupa o braço" e "proteger o braço".
  - O glossário de grip passou a falar em linguagem de conforto.
  - Quem tem dor recebe uma nota: idade, volume de jogo e técnica pesam mais que qualquer especificação, e se a dor persistir, procure um profissional.
  - Menores de 14 anos recebem um aviso: o catálogo é adulto, e vale procurar uma raquete juvenil de 25 ou 26 polegadas.
- **Herança de aprovação.** Versões leves sem review da TW herdam 0,7 da aprovação do modelo-pai (tabela `PAI`).
- **4 modelos novos** (`catalogo-novos.md`): Evo Drive, Boost Aero, Pure Drive 107 e Ultra Power 100. Catálogo: 58 → 62.
- **Acessibilidade.** A opção já escolhida na busca de raquete atual ganhou `role="option"`, o que corrige 2 violações do axe na etapa 5.

Ferramentas novas:
- `racket/tools/vies.mjs`: marcas, cobertura, contraindicações, orçamento e exemplo pronto. Opções `--realista`, `--exp`, `--pesos` e `--html`.
- `racket/tools/calibrar.mjs`: medição contra os casos de especialistas, sem otimizar. Mede top 1, top 3, top 10 e MRR do 1º indicado, e compara as marcas.

### Testes de viés (3.000 perfis, semente 12345)
Contraindicação séria = as regras de `vies.mjs` sem as três de rigidez (evidência fraca).

| | Uniforme, antes | Uniforme, depois (62) | Realista, antes | Realista, depois (62) |
|---|---|---|---|---|
| Babolat 1º / top 3 (catálogo 17,2% → 21,0%) | 11,1% / 11,6% | 13,8% / 12,7% | 20,6% / 18,5% | 24,7% / 21,4% |
| Head 1º / top 3 | 35,5% / 32,5% | 26,7% / 23,9% | 35,6% / 34,0% | 25,2% / 24,3% |
| Wilson 1º / top 3 | 25,2% / 27,9% | 31,6% / 33,5% | 22,3% / 22,8% | 27,7% / 27,4% |
| Modelos já em 1º / no top 3 | 47 / 56 de 58 | 54 / 60 de 62 | 50 / 56 de 58 | 54 / 60 de 62 |
| Pódios com contraindicação séria, 1+ / 2+ | 524 / 339 | 434 / 201 | 343 / 203 | 270 / 126 |
| 1ª acima do orçamento (todos) | 22,4% | 6,6% | 21,8% | 8,1% |
| 1ª acima do orçamento (até R$ 1.400) | 69,9% | 14,8% | 69,2% | 20,4% (8,6% mais de 8% acima) |
| 1ª difícil de achar, para quem prefere o Brasil | 149 | 233 | 93 | 147 |
| Match da 1ª (mín / p10 / mediana) | 79 / 91 / 94 | 77 / 89 / 95 | 83 / 91 / 95 | 81 / 90 / 95 |

- Os 4 modelos novos na amostra realista: Boost Aero 5,3% em 1º e 12,2% no top 3; Evo Drive 1,3% e 4,5%; Ultra Power 100 0,6% e 1,7%; Pure Drive 107 0,1% e 0,7%.
- Exemplo pronto: Black Ace 300, Phantom 100X e Boom MP. Antes, a Clash 100 era a 2ª.
- Efeito colateral: há mais 1ª "difícil de achar" para quem prefere comprar no Brasil, porque as opções baratas do catálogo são quase todas importadas.

### Por que a Babolat aparecia pouco (medido, sem correção forçada)
Amostra realista, catálogo de 58, Babolat no top 3:
- **Motor completo: 16,5%**, contra 17,2% do catálogo. Na amostra realista, a Babolat já estava perto da paridade com o catálogo. A queda para 11,6% no sorteio uniforme vem de 2/3 dos perfis com dor no braço, porque os quadros da Babolat são de 63 a 69 RA.
- Sem a compressão 0,6: 16,3%. Não é a causa.
- Sem a aprovação TW (±8): 13,6%. A aprovação ajuda a Babolat, não atrapalha.
- Rigidez igual para todas nos índices: 18,4% (1º: 20,5% → 24,2%). É o maior efeito isolado entre os três, mas ainda pequeno.
- Sem o orçamento: 19,2%. Com a zona do mapa também desligada: 21,6%. Os preços da Babolat no Brasil são altos: Team e Lite custam R$ 2.000 a 2.300, mais que a Pure Drive.
- A família Pure Drive quase não aparece (cerca de 2,6% dos lugares no pódio, medido antes do ajuste final). A Babolat aparece pela Boost Drive, pela Pure Aero 98, pela Pure Aero e pela Pure Strike.
- Nos casos de especialistas, a Babolat é 29,7% dos 1º indicados, contra 17,8% do nosso top 3. Isso fica para a calibração.

### Casos de especialistas (só medição, nenhum peso ajustado)
379 casos (en 200, pt 67, es 112). Contam os casos com pelo menos um modelo do catálogo. A métrica é o 1º indicado pelo guia no nosso ranking.

| Motor | Casos | Top 1 | Top 3 | Top 10 | MRR | Algum indicado no top 3 |
|---|---|---|---|---|---|---|
| Antes da rodada 6 (58 modelos) | 256 | 20,3% | 32,4% | 62,9% | 0,323 | 39,5% |
| Rodada 6, 58 modelos | 257 | 19,8% | 32,3% | 63,0% | 0,320 | 40,1% |
| Rodada 6, 62 modelos | 268 | 19,0% | 31,7% | 61,2% | 0,311 | 39,2% |

- Acaso: top 3 ≈ 5%.
- Com os 4 modelos, entram 11 casos que antes não tinham modelo do catálogo. São casos difíceis (iniciante, conforto), por isso as médias caem um pouco.
- Grupos com 62 modelos:
  - spin: 73,9% de top 3;
  - potência: 62,1%;
  - cotovelo: 30,8% de top 3 e 88,5% de top 10;
  - iniciante: 16,2% de top 3 e 0% de top 1. A Ti S6 é indicada como 1ª e fica em 47º no nosso ranking.
- Marcas, nosso top 3 × 1º indicado pelos especialistas:
  - Babolat 19,9% × 33,2%; Wilson 11,2% × 28,4%;
  - Head 32,2% × 22,8%; Prince 12,9% × 3,0%; Tecnifibre 4,7% × 1,1%; ProKennex 4,0% × 0%.

Limites:
- Respostas que o caso não informa usam valores neutros (ver `resp` em `calibrar.mjs`).
- Os perfis sorteados usam o número de modelos para escolher a raquete atual. Por isso as amostras de 58 e de 62 não são exatamente os mesmos perfis.
- A imagem `assets/reports/racket.webp` ainda mostra "58 raquetes" e o exemplo antigo.

## Rodada 5 — iniciante leve, zona sempre com raquete, Match legível e tensão (30/out)

Caso real: iniciante leve (perfil de mulher adulta, força abaixo da média). Peso ideal calculado 248 g → zona 240–256 g sem nenhuma raquete adulta no catálogo (a mais leve tem 260 g). Resultado: 1ª fora da zona, Match máximo 74% e 10º com 46%; tensão sugerida 55–57 lb com nylon.

Mudanças:
- Peso ideal com piso de 258 g para adulto (14 anos ou mais).
- Zona do mapa alarga aos poucos até ter pelo menos 3 raquetes do catálogo.
- A 1ª fica sempre na zona: a melhor da zona sobe para 1º se estiver até 10 pontos atrás.
- Escala do Match: a melhor para o perfil fica entre 90 e 96; as demais caem 0,8 ponto por ponto de diferença. A ordem do ranking não muda.
- Tensão (base): iniciante com nylon 54 → 50 lb e sem o +2 de "quero controle" (para iniciante, tensão baixa dá saída de bola e ponto doce maior); poliéster 51 → 48 lb; poliéster facetado (avançado com muito spin) 51 → 49 lb; híbrido para braço sensível 50 → 49 lb.
- Relatório abre com um parágrafo em linguagem simples dizendo por que aquela raquete.

Simulação com 500 perfis aleatórios:
| | Rodada 4 | Rodada 5 |
|---|---|---|
| 1ª dentro da zona | 75% | 99% |
| Match da 1ª (mín / p10 / mediana / máx) | — | 84 / 91 / 94 / 96 |
| Match da 10ª (mín / p10 / mediana / máx) | — | 61 / 73 / 81 / 93 |
| Raquetes diferentes em 1º | 31 | 32 |

Caso real depois: Head Boom Team 94% (dentro da zona 248–268 g), top 3 entre 86% e 94%, tensão 48–50 lb.

## Rodada 4 — mapa e ranking coerentes (28/out)

Problema visto em teste real: o relatório recomendava raquete fora da "sua zona" no mapa peso × swingweight. A zona desenhada (peso ideal ±8 g, swingweight ideal ±6) era mais estreita do que o motor cobrava: abaixo da zona, o swingweight só era penalizado 6 pontos depois da borda, e o peso tinha penalidade leve (1/3 por grama).

Simulação com 500 perfis aleatórios (todas as respostas sorteadas):
| Versão | 1ª dentro da zona | Fora da zona havendo raquete dentro | Raquetes diferentes em 1º | Clash 100 v3 em 1º |
|---|---|---|---|---|
| Antes | 27% | 63% | 33 | 40% |
| Penalidade a partir da borda (1,2 por g ou ponto de SW) | 41% | 48% | 28 | — |
| **Publicado: penalidade da borda + zona no Match (±4 pontos)** | **75%** | **15%** | **31** | **14%** |

Regra no motor:
- Peso e swingweight passam a ser penalizados a partir da borda da zona do mapa (1,2 por grama ou ponto de swingweight).
- Estar dentro da zona soma 4 pontos ao Match; fora, tira 4.
- Quando a 1ª ainda fica fora da zona (sem raquete na zona, ou as da zona são bem piores por rigidez, preço etc.), o relatório diz por quê: qual a melhor dentro da zona, quantos pontos atrás e o motivo.
- Exemplo pronto passa a preferir comprar no Brasil (antes recomendava a Black Ace 105, sem loja no Brasil).

Limite: não foi refeita a validação com os 30 testadores da TW (os dados brutos não estão no repositório). Refazer quando a base voltar.

## Rodada 3 — 30 perfis, destro/canhoto, backhand e Clash (23/out)

### Evidência: o que muda a recomendação
| Fator | Conclusão | Força da evidência | Regra no motor |
|---|---|---|---|
| Canhoto vs destro | Não muda nada: raquete é simétrica; nenhum varejista, review ou estudo recomenda spec diferente | Moderada (ausência consistente) | Peso zero. Só dica no relatório: canhoto enrola o overgrip no sentido contrário (Tennis Warehouse) |
| Backhand de 1 mão (int/avançado) | Consenso de especialistas: mais massa e swingweight, quadro com balanço na mão, cabeça 97–100. Pros de 1 mão usam ~8 g a mais (amostra pequena) | Fraca / prática | +5 no swingweight ideal, empurrão leve em estabilidade, +3 g só para avançado, leve penalidade para balanço >325 mm. Nada para iniciante |
| 1 mão e cotovelo | Associação fraca e contraditória (Song et al., 402 jogadores, a favor; estudo com 2.633 alunos, contra). O mesmo estudo não associou rigidez, peso ou tensão à epicondilite | Fraca | 1 mão sozinho não muda nada; com cotovelo sensível, penaliza quadro < 295 g |

Fontes: tenniswarehouse-europe.com/LC/Regripping.html · tennisnerd.net (best racquets one-handed backhand) · toomanyrackets.com (one-handed backhands; average weight of pro rackets) · newswise.com (modern tennis trends, tennis elbow) · experts.umn.edu (The Elbow and Tennis, part 1) · Clin Sports Med 1995 (biomechanics of tennis elbow) · PMC4950282 (Mohandhas 2016, tensão e aceleração no cotovelo).

### Teste com 30 perfis diversos (iniciante a 4.5, 14 a 62 anos, dor em cotovelo, ombro e punho, 1 e 2 mãos, canhoto, orçamento baixo, raquete atual pesada/leve)
- Inverter canhoto/destro nos 30: top 3 muda em 0 de 30 (antes também 0).
- Inverter backhand 1↔2 mãos: top 1 mudava em 10 de 30 (efeito forte demais para evidência fraca) → agora 4 de 30.
- Clash 100 em 1º: 4 de 30, todos com dor no braço ou pós-lesão. É o consenso das reviews (RA 54, conforto nº 1 na TW). Rigidez ficou menos punitiva (cotovelo ×3 → ×2,2; punho/ombro sem cotovelo, limite 65 RA), o que abre espaço para Gravity MP, Phantom 100X, Speed MP e VCORE 98 nesses perfis.
- 14 raquetes diferentes em 1º lugar entre 30 perfis; diferença média 1º–10º: 10,7 pontos.

### Validação com os 30 testadores da TW (deixando o testador fora da base)
| Versão | Correlação média | Acerta a favorita | Favorita no top 2 |
|---|---|---|---|
| Rodada 2 | 0,33 | 5/28 (18%) | 13/28 |
| Sem aprovação TW | 0,25 | 7/28 | 15/28 |
| Aprovação ×3 para todos | 0,36 | 9/28 | 15/28 |
| **Publicado (rodada 3)** | **0,33** | **8/28 (29%)** | **16/28** |
Acaso = 14%.

Trade-off decidido: aprovação TW forte para todos melhora um pouco a validação, mas coloca a Pure Aero 98 no top 3 de 27 dos 28 testadores e de 14 dos 30 perfis (efeito popularidade). Versão publicada:
- Aprovação pesa por nível (avançado 2,5×, 4.0 2×, intermediário 1×, iniciante 0,6×), porque os testadores TW são 4.5+.
- Aprovação só desempata entre raquetes que já estão perto do perfil (some quando a distância passa de 1,2 acima da melhor).
- Bônus de "Braço Seguro" reduzido (era contado três vezes: alvo de conforto, bônus e penalidade de rigidez).
- Teto de swingweight por nível (iniciante 312, intermediário 320, 4.0 326).
- Novo: salto de mais de 35 g em relação à raquete atual é penalizado (troca em etapas).

### Gaps que continuam
- Validação só cobre jogadores avançados (testadores TW). Iniciantes e intermediários não têm verdade de campo: precisa de pesquisa com jogadores reais (30–50 respostas + raquete que aprovam).
- Personas de testadores são inferidas (nível, estilo, raquete) e quase todas parecidas (25 avançados, força alta): limita a diversidade possível do top 3.
- Versões leves seguem sem reviews TW.

## Rodada 2 — Tennis Warehouse (base principal)
- 670 avaliações da Tennis Warehouse: 545 notas individuais de testadores (geração atual + até 3 anteriores do mesmo modelo, ~4 testadores por review) e 125 reviews de clientes.
- Por raquete: 24 com 15+, 20 com 8–14, 9 com 1–7, 5 sem nada (Pure Aero Lite, Pure Drive Lite, Boost Drive, Speed Team, Blade 100L). TW não faz review das versões leves; as reviews de clientes dos produtos atuais não carregam sem navegador.
- Gerações mais antigas pesam menos (atual 1,0; até 2 anos 0,65; até 4 anos 0,4; mais velhas 0,2). Clientes pesam 0,3.
- Cada nota foi corrigida pela régua do testador: usamos o formato do perfil de cada avaliação (nota do atributo menos a média da própria avaliação) e a aprovação relativa à média daquele testador.

### Concordância de perfil com a TW (Spearman, 43 raquetes com 3+ avaliações)
| Atributo | Índice antigo | Índice novo | Outros sites vs TW |
|---|---|---|---|
| Potência | 0,71 | 0,72 | 0,87 |
| Controle | 0,77 | 0,76 | 0,87 |
| Spin | 0,67 | 0,74 | 0,67 |
| Conforto | 0,62 | 0,68 | 0,84 |
| Manobra | 0,72 | 0,71 | 0,73 |
| Estabilidade | 0,73 | 0,73 | 0,78 |
Os outros sites concordam fortemente com a TW: o sinal das reviews é consistente.

### Validação por testador
30 testadores avaliaram 3+ raquetes (512 avaliações). Teste honesto, excluindo o próprio testador da base.
| Versão do motor | Correlação com a aprovação do testador |
|---|---|
| Original (só specs) | 0,09 |
| Publicado na rodada 1 (specs + sites) | 0,08 |
| Specs + perfil TW | 0,175 |
| Specs + perfil TW + aprovação TW | 0,345 |

### Achados por nível
- Testadores 4.5/Open: aprovam mais raquetes com mais swingweight e peso (+0,16/+0,17).
- Testadores até 4.0: leve preferência por quadros mais macios e cabeça não muito grande (−0,11 / −0,13).

### O que mudou no motor (rodada 2)
- Raquete com 3+ avaliações TW: perfil puxado para o da TW com peso de 25% + 3% por avaliação (máximo 70%). Senão, vale o ajuste da rodada 1.
- Aprovação TW no Match Score (ajustada na rodada 3).

## Rodada 1 — reviews globais (resumo)
- 145 reviews de 13 sites (125 usadas). Rigidez pesava demais na potência; spin depende mais de padrão aberto e linha de spin; conforto ganha com massa; estabilidade é sobretudo swingweight; tecnologia de amortecimento quase não aparece nas notas.
- Efeito halo: raquete querida ganha nota alta em tudo; usamos o formato do perfil e tratamos a aprovação à parte.

## Pendências e oportunidades
- Versões leves (L, Lite, Team, Boost) seguem só com specs: ler reviews de clientes da TW com navegador ou fóruns (TT Talk, r/10s) com peso baixo.
- Dados que misturam variações (Phantom 305 g, TF40 18x20, CX 200 Tour 18x20, Ki Q+ 305/315) e gerações antigas: filtrar se a base crescer.
- 7º atributo de toque/voleio (TW Touch/Feel e Volleys) e notas por golpe (saque, devolução) para casar com as perguntas de saque e estilo.
- Validação real: aplicar o teste a 30–50 jogadores e comparar com a raquete que eles aprovam (principal gap para iniciante/intermediário).
