# Conferência do lote 3 (ChatGPT) — 16/11/2026

Conferência por Claude, com a página aberta (curl, uma requisição por URL, pausa de 1 s), das linhas do lote 3 cujas URLs estão em Tennis Warehouse, TW Europe, Tennis Only, TennisAddict, Tennisnerd, Tennis.com, Tennis Express e Padel Warehouse. Detalhe linha a linha em `conferencia-lote3-2026-11-16.json`. Os CSVs do bruto não foram alterados.

## Números

| | Linhas |
|---|---|
| Selecionadas | 87 |
| Página aberta | 85 |
| Não abertas | 2 (Padel Warehouse sem resposta; Tennis Express Pure Drive 98 com HTTP 500 duas vezes) |
| Versão/geração confere | 85 |
| Com nota publicada conferida e igual | 60 |
| Com nota divergente | 1 |
| Sem nota no CSV (só versão e citação) | 25 |

## Playtests da Tennis Warehouse (prioridade)

- 41 linhas com notas por atributo de páginas `learning_center/racquet_reviews` (TW EUA, TW Europe, Tennis Only), mais 1 linha da Padel Warehouse conferida no espelho da TW: **42 de 42 batem exatamente** nas notas da média do painel (Power, Control, Topspin, Comfort, Maneuverability, Stability e Final Verdict/Overall), nas escalas 10 e 100.
- Versão e geração conferem em todas (L, 16x19/18x20, v9/v10, 8th Gen, ano). Três páginas no formato antigo (Pure Aero Rafa Origin, Pure Drive Tour 2018, Pro Staff X v14) têm título genérico; o modelo foi confirmado no texto.
- Painéis de 3 a 6 testadores (a maioria 4). O número por linha está em `n_testadores`.

## Divergências e pontos de atenção

1. **Tennis Express, Babolat Pure Drive Super Lite (parte01, linha 32):** CSV 5.0/5 de 2 avaliações; página hoje 4.67/5 de 3 avaliações. Nota divergente, provavelmente por avaliação nova depois da coleta.
2. **Tennis Express, Babolat Pure Drive Lite (parte01, linha 28):** nota 5.0 confere, mas a contagem passou de 5 para 6 avaliações (a citação literal não bate mais).
3. **Yonex VCORE 100D 8ª geração (parte05, linha 16):** URL da Padel Warehouse não abriu. No espelho da TW todas as notas conferem, inclusive o controle "8.", que está assim na própria página da TW (erro de digitação dela). A média das 4 notas individuais de controle dá 8.025, ou seja 8.0. Tratar como 8.0 só com regra explícita na camada derivada.
4. **Tennis Express, Pure Drive 98 Gen11 (parte01, linha 26):** HTTP 500 nas duas tentativas; não conferida.
5. **Tennis Express, Pure Drive 107 (parte01, linha 23):** HTTP 500 na 1ª tentativa e 200 na 2ª; confere.
6. **Coluna "nível do testador" incompleta** em 11 playtests da TW: a página tem mais testadores que os listados no CSV (não muda as notas, que são a média do painel). Linhas: parte01/30, parte01/37, parte02/2, parte02/7, parte02/22, parte02/32, parte02/42, parte02/47, parte03/2, parte03/18, parte03/19.
7. **Citação literal fraca:** na maioria das linhas a "citação" é o título da página ou o nome do modelo (ou o rótulo da nota, como "5.0 out of 5"), não um trecho opinativo. Ela aparece na página, mas serve só para confirmar que é a página certa.
8. **TennisAddict (parte01/25, parte05/12):** letras conferem. O CSV mapeia Précision → controle e Prise d'effet → spin; Tolérance e Toucher não foram registrados.

## Não conferido

- Especificações físicas da coluna "versão revisada" foram conferidas por amostra (tamanho de cabeça, padrão, peso); ano de publicação só onde a página mostra data.
- Linhas de outros sites do lote 3 (Tennis Overload, Extreme Tennis, Tennis Torasan etc.) ficaram fora desta rodada.
