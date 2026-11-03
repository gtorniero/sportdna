# SPORT DNA

Site guarda-chuva com três testes de equipamento: RACKET DNA (raquete de tênis), SURF DNA (prancha de surf) e RUN DNA (tênis de corrida). Antigo MATCH LAB. Projeto da Beyond the Work. Tudo é HTML, CSS e JS estático, sem build.

## Estrutura

| Pasta | O que é | Quem mexe |
| --- | --- | --- |
| `index.html` | Home, páginas de cada app, biblioteca e leitor de artigos (roteamento por `#hash`) | Sessão do site |
| `content/` | Os 59 artigos (`raquete.js`, `tenis.js`, `prancha.js`), formato em `docs/guia-de-artigos.md` | Sessão do site |
| `assets/reports/` | Imagens dos relatórios de exemplo usadas na home e nas páginas dos apps | Sessão do site |
| `racket/` | RACKET DNA, arquivo único `index.html` | Sessão do Racket |
| `surf/` | SURF DNA, arquivo único `index.html` | Sessão do Board |
| `run/` | RUN DNA, arquivo único `index.html` | Sessão do Tenis |
| `docs/` | Contexto: padrão do relatório PDF, teste de fogo e, em `docs/<app>/`, benchmark, catálogo e calibração de cada app | Cada sessão atualiza o seu |

Leia `docs/padrao-relatorio-pdf.md` e a pasta `docs/<app>/` do seu app antes de mexer no motor ou no relatório. Registre ali as rodadas novas de calibração.

## Regras

- Cada sessão mexe só na sua pasta. Mudança fora dela vira pull request separado e com explicação.
- Trabalhe numa branch e abra pull request; nada vai direto para `main`.
- Cada app mantém no header o link `← SPORT DNA` apontando para `../`.
- Quando um app mudar o relatório de forma visível, atualize a imagem em `assets/reports/<app>.webp` (captura do relatório do "Ver um exemplo pronto", 1000 px de largura).
- Quando mudar número de perguntas, tamanho de catálogo ou preço de um app, atualize os `facts` desse app em `index.html` no mesmo pull request.
- Identidade: siga o manual em `docs/identidade-visual.pdf` e os arquivos em `assets/brand/`. Marca-mãe SPORT DNA: símbolo do anel de esportes (um arco por esporte) com o S branco no preto; logotipo SPORTDNA sem espaço, DNA em cinza. Apps com o equipamento no azul-petróleo #0E4D64 (RACKET #DDF247, SURF #6CCFF6, RUN #FF8A3D). Nomes sempre em maiúsculas nos logos; no seletor de esporte, só a primeira letra ("Racket DNA"). Títulos em Archivo, texto em DM Sans, logos em Syne. Footer com assinatura "Um projeto Beyond the Work".
- Textos em português do Brasil, diretos, sem jargão. Nenhuma marca paga para aparecer no resultado; afiliado só depois da recomendação e declarado.
- Acessibilidade WCAG 2.2 AA é requisito: siga `docs/acessibilidade.md` e rode o axe antes de abrir o pull request (meta: zero violações).
- Pagamento ainda é simulado. Especificações de catálogo são aproximadas até a revisão por professores.

## Testar

`python3 -m http.server` na raiz e abra `http://localhost:8000`.
