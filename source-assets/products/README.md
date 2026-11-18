# Fotos de ofertas afiliadas

Os arquivos `.webp.b64` preservam integralmente os bytes das fotos oficiais fornecidas pelas ofertas afiliadas do Mercado Livre. A codificação em texto permite importar os ativos em lote pelo conector GitHub; não há recriação ou alteração das imagens.

`node scripts/package-site.mjs` valida a codificação e o formato WebP e produz os arquivos públicos em `dist/site/assets/products/`. O site utiliza apenas esses WebP, com carregamento sob demanda. As fontes codificadas não entram na publicação.

O cadastro de ofertas em `assets/affiliate-offers.js` vincula cada imagem ao identificador exato do anúncio. Sem oferta afiliada verificada e recente, não há foto ou botão de compra. A cobertura de 18/11/2026 corresponde a 319 ofertas ativas e 245 modelos. Duas ofertas que não puderam ser confirmadas ficaram inativas.
