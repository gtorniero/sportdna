# SPORT DNA

Find your DNA. Testes que cruzam seu corpo, nível e estilo com a ficha técnica do equipamento e explicam o porquê de cada escolha.

- **RACKET DNA** · raquete de tênis · `racket/`
- **SURF DNA** · prancha de surf · `surf/`
- **RUN DNA** · tênis de corrida · `run/`

Mais 45 guias em `content/`, lidos pela home (`index.html`).

Site estático: abra `index.html` com um servidor local (`python3 -m http.server`) ou publique a raiz no GitHub Pages ou na Vercel.

Um projeto Beyond the Work.

Identidade visual: `docs/identidade-visual.pdf` e arquivos em `assets/brand/`.




As páginas públicas têm conteúdo no HTML antes de executar JavaScript. Os links antigos por hash continuam funcionando; novos links usam URLs próprias.

- `templates/site.html`: estrutura compartilhada das páginas públicas.
- `assets/site.css` e `assets/site.js`: identidade visual, componentes e interações existentes.
- `content/*.js`: artigos; `sources`, `related` e `seoTitle` são campos opcionais.
- `seo.config.json`: domínio de publicação e mapa estável de URLs. Não renomeie uma URL existente ao mudar o título.
- `scripts/build-seo.mjs`: gera home, páginas de esporte, blog, artigos, privacidade, sitemap e 404; atualiza metadata dos apps e da calculadora.

Depois de editar os arquivos de origem, execute com Node.js 18 ou superior:

```sh
node scripts/build-seo.mjs
python3 tests/seo_static.py
```

Os HTML gerados são versionados para manter a publicação estática existente. Não edite diretamente o conteúdo das páginas geradas. Apps e calculadora continuam sendo arquivos próprios; seus motores e relatórios não passam pelo gerador.

Para os testes de navegador, instale Playwright no seu ambiente e execute `node tests/browser.cjs`, `node tests/app-smoke.cjs` e `node tests/accessibility.cjs`. Eles esperam o site local em `http://127.0.0.1:8000/matchlab/`; inicie o servidor **na pasta pai** do repositório. `PLAYWRIGHT_MODULE`, `CHROME_PATH`, `TEST_BASE_URL` e `AXE_PATH` permitem indicar ferramentas e endereços do ambiente. O teste de acessibilidade precisa do arquivo axe-core 4.10.3. `tests/performance.cjs` registra observações de laboratório; não substitui dados reais de Core Web Vitals.

No GitHub Pages de projeto, `matchlab/robots.txt` não controla o rastreamento: o arquivo efetivo precisa estar na raiz de `gtorniero.github.io`. O sitemap pode ser enviado diretamente ao Search Console após a publicação aprovada. Não há publicação automática adicionada por esta alteração.

A auditoria e as evidências ficam em `docs/seo/`.
