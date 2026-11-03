# Tenis Match — catálogo ampliado (out/2026)

## Tamanho
- 212 tênis de 13 marcas, 189 vendidos no Brasil (nov/2026). A Saucony (15 modelos) saiu em 24/out/2026 e a 361° (4) em 25/out/2026; antes eram 231 tênis de 15 marcas e 795 reviews.
- **Links:** fora do app desde 28/out/2026. Não deu para verificar 100% dos links (o ambiente de teste não abre as lojas) e os testados no celular estavam quebrados. As URLs seguem no catálogo para uma revisão futura, mas o app não mostra nenhuma.
- **Orçamento "Sem limite de preço"** (desde 02/nov/2026): o preço não pesa contra nenhum tênis e o relatório não fala em orçamento. Com essa opção o pódio tende a modelos topo de linha.
- **Comparador:** "Comparar dois tênis" na home e "Comparar com outro tênis" no relatório: specs lado a lado, hexágono sobreposto, o que muda e, depois do teste, o Fit Score de cada um.
- 191 vendidos no Brasil. 40 importados, com preço convertido de US$ × 5,40 × 1,6. Os importados aparecem como "importado" e perdem 3 pontos no Fit Score.

| Marca | Modelos |
|---|---|
| Nike | 27 |
| Mizuno | 25 |
| New Balance | 23 |
| On | 23 |
| ASICS | 22 |
| adidas | 21 |
| Hoka | 18 |
| Brooks | 15 |
| Olympikus | 13 |
| Puma | 8 |
| Salomon | 8 |
| Fila | 6 |
| Under Armour | 3 |

**Por categoria:** Trilha 43 · Treino diário 37 · Entrada 35 · Supertênis 27 · Treino rápido 26 · Máximo amortecimento 22 · Estabilidade 17 · Conforto e uso misto 5.

**Cobertura de reviews por modelo:** 5 ou mais: 77 · 4: 30 · 3: 41 · 2: 46 · 1: 22 · 0: 15. Modelos com menos de 2 reviews perdem até 0,8 ponto no Fit Score.

## Como foi feito
- **1ª rodada:** 10 agentes por marca. Para cada modelo: specs de laboratório (RunRepeat, RTINGS, Running Warehouse, Doctors of Running), reviews (RTR, DOR, BITR, Runner's World, Solereview, Running Shoes Guru, iRunFar e fontes BR) e preço em loja BR (sites das marcas, Centauro, Velocità).
- **2ª rodada:** reforço nos 82 modelos com 0–1 review. +152 reviews e +4 Mizuno.
- **Limites encontrados:** ~200 buscas por rodada compartilhadas entre agentes; só abrem URLs que vieram de busca; o RunRepeat costuma recusar; Netshoes, Mercado Livre e notas de clientes não são legíveis.
- **Formato de busca que rendeu mais:** `"<modelo> review roadtrailrun OR doctorsofrunning OR believeintherun OR rtings"`.

## Gerações atualizadas
Kayano 33, GT-2000 15, Nimbus 28, Novablast 6, Superblast 3, Adios Pro 5, Ultraboost 5, Pegasus 42, Pegasus Plus 2, Neo Vista 3, Speedgoat 7 e Cloudsurfer 3. A Brooks BR vende uma geração atrás em vários modelos; o catálogo registra a vendida aqui.

## Motor (teste com 10 perfis de corredor)
- Top 3 adequado ao uso: 29/30. Uso e perfil batendo juntos: 27/30. Nenhum tênis contraindicado no top 3. 10 marcas diferentes aparecem nos top 3.
- Influência das perguntas (% de perfis em que mudar a resposta troca o top 3): Orçamento 93% · Objetivo 90% · Prioridade 66% · Neutro/estabilidade 57% · Sensação 53% · Largura 48% · Peso 43% · Treino de ritmo 38% · Pisada 38% · Calor 35% · Terreno 33% · Uso fora da corrida 33% · Dor 31% · Km por semana 30% · Há quanto tempo corre 15% · Pace 7%.

## Resultado para o usuário
- **Pódio:** a Fila não entra no top 3 nem como segundo par (decisão editorial de out/2026, ver rodada 3 em `calibracao-e-validacao.md`).
- **Preço:** relatório único de R$ 9,99 com tudo abaixo (desde 24/out/2026; antes R$ 7,99 o tênis ideal e R$ 12,90 o setup completo).
- **PDF A4 (desde 28/out/2026):** Pix simulado com confirmação que oferece "Baixar relatório em PDF (A4)" ou "Ver relatório na tela"; o mesmo botão no topo e no fim do relatório. 5 páginas no padrão de `docs/padrao-relatorio-pdf.md`: veredito, sua corrida × o tênis, ajuste e adaptação, pódio com o consenso das reviews, ranking e método. Sem atletas e sem trechos de review com fonte: o catálogo ainda não tem esses dados.
- **Top 10:** os 10 tênis que mais combinam, com Fit Score, marca, categoria, preço e custo por km. Ordena por match, preço ou custo/km.
- **Top 3:** escolha entre top 3 geral e top 3 de uma marca, com hexágono, mapa do catálogo e tabela.
- **O melhor de cada marca:** o tênis que mais combina de cada uma das principais marcas (adidas, ASICS, Hoka, Mizuno, New Balance, Nike, Olympikus, On e Puma), em ordem alfabética e sem posição; as marcas preferidas da pessoa vêm primeiro. Pergunta opcional de marca preferida (até 3).
- **Por marca, só vendidos no Brasil:** o quadro de cada marca e o top 3 por marca ignoram os importados.
- **Tênis atual:** pergunta opcional (lista do catálogo). O relatório compara o atual com o recomendado: Fit Score, hexágono sobreposto, specs lado a lado e o que muda (preço, fôrma, contraindicações das reviews, peso, espuma, estabilidade, drop com aviso de transição e categoria).

## Pendências
- **Baixa confiança (37 modelos com 0–1 review):** entrada da Olympikus (Inverse, Veloz, Pride, Volta, Corre Pace, Corre Trilha), Mizuno de entrada (Frontier, Titan, Way, Victory, Prorunner), ASICS Sonoma/Nagoya/Hypersonic/Pulse, adidas Drive RC/Duramo SL/Supernova Stride, Puma Electrify e NB 680/520/Garoé/Nitrel. Caminho: notas de clientes das lojas BR (exigem navegador).
- **Fora do catálogo:** Mizuno Wave Ultima, Duel e Hayate; Hoka Torrent, Zinal, Kawana e Solimar; adidas Galaxy, Switch, Adios 9 e Soulstride.
- **Próximo passo:** fotos dos tênis via API.
