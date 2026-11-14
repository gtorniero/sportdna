# Board Match — briefing

**O que é:** teste de prancha de surf da família Match Lab. A pessoa responde o questionário, vê a análise grátis com os 3 finalistas ocultos e paga para revelar a prancha ideal. Recomenda tipo, medidas, litragem, rabeta, fundo, rocker, quilhas, construção e acabamento, sem marca e sem shaper.

## Links de referência (claude.ai)
- Plano de negócio e arquitetura do Match Lab: https://claude.ai/artifact/8gNsXDc4T7cjHnxDgGiLaW
- Logos: https://claude.ai/artifact/675ZoyJqS6pLmQUekYYuXF
- Guia técnico de pranchas: https://claude.ai/artifact/SGnvL42ZVoV8f5BujDS1oy
- Modelo técnico (motor): https://claude.ai/artifact/EksaGBVicCuyi9AG6PCErZ
- Protótipo antigo (congelado; a versão viva é `surf/`): https://claude.ai/artifact/MLoBRFUZMuymcx9MVxsy2V

## Decisões já tomadas
- Nome: Board Match, by Match Lab.
- Identidade: azul-petróleo #0E4D64 e branco, cor do app azul-claro #6CCFF6. Logo em Syne; títulos em Archivo; texto em DM Sans.
- Logo: prancha branca + prancha azul-claro cruzadas, minimalista.
- Página com a mesma organização do Racket Match: abertura com "O motor", quiz em etapas, análise, prévia com finalistas ocultos, dois planos, relatório, card de DNA de surf.
- Preço: R$ 19,99, plano único (decidido em 24/out/2026; substitui os dois planos de R$ 7,99 e R$ 14,90). Inclui a prancha ideal, as 17 variáveis, 2º e 3º lugares, comparador, guia de loja, ficha técnica, relatório em PDF e Seu Match.
- Relatório em PDF A4 (5 páginas) no padrão de `docs/padrao-relatorio-pdf.md`, adaptado à prancha: veredito, seu surf × a prancha, pódio, ranking e método e, por último e com menos destaque, setup, adaptação e compra (nov/2026).
- Guia "Como achar essa prancha numa loja" com faixas aceitáveis (comprimento ±2", largura ±1/4", espessura ±1/8", litragem ±1,5 L).
- Consultor opcional (professor de surf parceiro, Gustavo Lucas): único app com parceiro de compra; pode receber comissão, declarado na página. Desde 14/nov/2026 aparece também na prévia grátis (só com as respostas, sem a prancha calculada), com código SURF DNA para atribuição; detalhes em `docs/board/seu-match-gustavo/README.md`.

## Concorrentes de referência
- Magic Board Finder (independente, mais de 1.500 modelos, licencia o motor para lojas): o mais próximo.
- Volume Prancha (BR): só litros, metodologia transparente que vale copiar.
- Calculadoras de marca (Firewire, JS, NSP) e lojas (Boardcave, Surfboard Empire): só volume ou presas ao próprio estoque.
- Ninguém entrega a ficha completa sem marca, em português, ligada a loja ou shaper no Brasil.

## Pendências
0. Prova social no PDF (página 3): 28 trechos conferidos em `docs/board/reviews.md`; falta chegar a 3 por tipo e achar review independente de gun.
1. Revisar as regras do motor com o Gustavo (litragem por nível, tipo de prancha por estilo e onda).
2. Catálogo com fotos: feed de Google Shopping das lojas de surf (Board's Point, Sea Club, Ukelele, Silver Surf, FM Surf) e API do Mercado Livre; mostrar "à venda dentro das suas faixas".
3. Ferramenta grátis de litragem para SEO.
4. Pix, login, banco de dados e domínio (sportdna.com.br/surf).
