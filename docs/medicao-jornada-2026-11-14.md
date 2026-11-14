# Medição da jornada (14/11/2026)

Complementa `docs/medicao-consentimento-2026-11-14.md`. Tudo continua só com aceite e passando pelo quadro `/medicao.html`.

## Etapa do questionário: `quiz_step`
- Sai uma vez por etapa aberta em cada questionário: `sport`, `step` (1, 2, 3…) e `steps_total` (RACKET 6, SURF 5, RUN conforme o app). Nunca a pergunta nem a resposta.
- Lido da barra de etapas que os três testes já desenham (`#steps`, item com a classe `on`), em `assets/measurement.js`. Não precisa de mudança nos apps.
- Só o GA4 recebe. A Meta não precisa de cada etapa.
- Leitura no GA4: Explorar → Funil com `quiz_start` → `quiz_step` (step = 2 … N) → `quiz_complete`, filtrando `sport`. Antes, registrar `step` e `steps_total` como dimensões personalizadas de evento (Administrador → Definições personalizadas).

## Contexto da visita ao teste
Os eventos dos testes (menos `page_view`) podem levar, de listas fechadas:
- `ab_ficha` (`controle` ou `ficha`): grupo do A/B da ficha ideal grátis no RACKET. Vem de `localStorage.sd_ab_ficha_v1`, gravado pelo app (`docs/racket/ab-ficha-gratis.md`).
- `cta_origem` (`artigo_meio`, `artigo_fim`, `grip`, `litragem`, `guia`) e `cta_artigo` (ex.: `raquete-01`): de onde veio o clique para o teste. O site grava `sessionStorage.sd_de` no clique e a medição usa por 30 minutos, só no teste do mesmo esporte. Sem UTM interna, para não reiniciar a origem da sessão no GA4.
- Registrar `ab_ficha`, `cta_origem` e `cta_artigo` como dimensões personalizadas de evento no GA4 para usar nos relatórios.

## Compras em dobro no pixel (8 × 5 pagas)
Conferido em 14/11 (D1 só em agregados, sem dados pessoais):
- Pedidos `live` pagos: 5 (Pix 4, cartão 1). Promoção não conta: código liberado nunca dispara `Purchase` no navegador (`orderParams` exige Stripe ou Mercado Pago) nem na Conversions API.
- Fila da Conversions API (`btw_meta_outbox`): 4 enviados. A CAPI está ligada.
- O `eventID` do pixel e o `event_id` da CAPI são o mesmo SHA-256 de `sportdna:purchase:<id do pedido>` (teste em `payments/test/meta-capi*.mjs`), com o mesmo nome `Purchase`. A deduplicação está correta no código.
- Hipótese mais provável: os 8 somam as duas fontes (até 5 do navegador, só com aceite, + 4 do servidor). A contagem deduplicada deveria dar no máximo 5. Não temos acesso ao Gerenciador de Eventos para confirmar. Conferir no Gerenciador de Eventos: Purchase → Visão geral → "Deduplicação" (deve mostrar as duas fontes com o mesmo identificador). Se aparecer abaixo de 100%, mandar a captura para revisarmos.
- Para evitar compra contada de novo semanas depois (pedido pago agora fica no aparelho para retomar), `assets/payments/client.js` só chama `purchase` nas primeiras 24 h depois da confirmação. A trava por navegador (`sd_sale_<id>`) continua.

## Quadro `/medicao` fora do Web Analytics (RUM)
- O Web Analytics da Cloudflare injeta o script em toda página HTML, inclusive no quadro de medição: 34% dos carregamentos eram o quadro.
- `_headers` (publicado por `scripts/package-site.mjs`) manda `Cache-Control: ... no-transform` em `/medicao.html` e `/medicao`. Com `no-transform`, a Cloudflare não injeta o script ali (documentação do Web Analytics).
- Conferir depois de publicar: `curl -sI https://sportdna.com.br/medicao` mostra `no-transform`, e o caminho some do painel em 1 ou 2 dias. Alternativa no painel: Web Analytics → sportdna.com.br → Manage site → Advanced options → Add rule, excluindo `/medicao*`.

## Search Console (tarefa do dono)
A propriedade do sportdna.com.br nega acesso à conta usada pelo Claude. Para ler buscas orgânicas: Search Console → Configurações → Usuários e permissões → adicionar a conta com permissão Completa (ou criar a propriedade de domínio e validar pelo DNS da Cloudflare), e enviar `https://sportdna.com.br/sitemap.xml`.

## Pedido pendente e retomada
- `assets/payments/client.js` guarda o pedido no aparelho: não pago por 24 h (o mesmo prazo do servidor), pago por 1 dia (ou `keepPaidDays` do app; o RACKET usa 90 para o reteste).
- Só a aba do pagamento reabre o relatório sozinha. Em outra visita o app mostra o cartão de retomada (`saved()`), e só `check()` com o servidor dizendo "pago" chama `unlock`.
- Um pedido pendente só é reaproveitado para as mesmas respostas. Respostas novas geram pedido novo.
- Testes: `tests/journey.test.mjs`.
