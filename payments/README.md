# SPORT DNA — pagamentos de relatórios (preparação em teste)

Esta integração está **desligada por padrão e ainda não está pronta para vendas reais**. O site público continua com a simulação existente. Esta versão recusa `PAYMENTS_MODE=live` mesmo se alguém alterar a variável no painel.

## Cadastrado em 02/11/2026

- Stripe Beyond the Work, contexto `acct_1UTVXV134hMOoEZV`, somente ambiente de teste.
- RACKET R$ 19,99, SURF R$ 19,99, RUN R$ 9,99 e comparador RACKET R$ 4,99. Os IDs de preço de teste estão no catálogo do servidor, em `src/security.mjs`.
- Mercado Pago: aplicação própria **SPORT DNA — Relatórios**, ID `5664014589493403`, Checkout Transparente / API de Orders, ambiente Teste. A aplicação da Retrozap não foi reutilizada.

## Arquitetura

O site estático permanece no GitHub Pages. Um Worker separado cria pedidos e consulta os provedores; uma base D1 exclusiva guarda identificador do pedido, hash do token de acesso, produto, valor e estado. Stripe usa Checkout Sessions hospedado; Mercado Pago usa Pix via Orders API. Nenhuma resposta dos questionários é enviada ao servidor ou aos provedores. O e-mail é enviado ao Mercado Pago somente para criar o Pix.

Preços pertencem ao catálogo do servidor, nunca ao navegador. A sessão não libera o relatório só porque o usuário voltou à página. A consulta exige token aleatório do pedido e confronta o pagamento com produto, valor, moeda/país, referência e ambiente. Webhooks têm assinatura verificada e consultam a API do provedor. Pagamentos pendentes, referências divergentes, notificações falsas e reembolsos não concedem acesso.

Respostas e token do pedido ficam em `sessionStorage` no navegador. **Ainda falta recuperação de compra por e-mail e acesso em outro dispositivo**. A interface continua calculando o relatório em JavaScript público; esta mudança protege o fluxo normal de compra, mas não torna o conteúdo impossível de extrair por inspeção do código. Cobrança de produção exige decidir sobre geração/entrega do relatório no servidor, além dos demais itens abaixo.

## Implantação de teste pendente

1. Publicar o código desta pasta como Worker `sportdna-payments-test`, sem alterar os outros Workers.
2. Criar D1 exclusivo `sportdna-payments-test`, executar `migrations/0001.sql` e vincular como `DB`. Registrar o ID real em `wrangler.jsonc`.
3. Criar credenciais **de teste** com menor permissão possível. Guardar somente em Cloudflare Secrets: `STRIPE_KEY`, `STRIPE_WEBHOOK_SECRET`, `MP_TOKEN`, `MP_WEBHOOK_SECRET` e `RATE_SECRET` aleatório. Nada disso deve entrar no GitHub, HTML, chat ou logs.
4. Confirmar no painel do Mercado Pago que `MP_TOKEN` veio das credenciais **Teste** desta aplicação antes de definir `MP_TEST_CREDENTIALS_CONFIRMED=true`. O prefixo `APP_USR` também pode aparecer em credenciais de teste; o prefixo sozinho não prova o ambiente.
5. Cadastrar os endpoints reais do Worker em `/webhooks/stripe` e `/webhooks/mercadopago` no ambiente de teste. Stripe: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`. Mercado Pago: tópico Order.
6. Habilitar `PAYMENTS_MODE=test` somente depois de conferir credenciais, D1 e assinaturas. Para a prévia de teste do frontend, configurar `assets/payments/config.js` com `mode:'test'` e a origem HTTPS exata da API. O arquivo público permanece `mode:'off'`.
7. Executar compras de teste de cada produto/provedor, confirmar notificações reais, duplicidade, expiração, reembolso, cancelamento, retorno do Checkout e retomada. **Os testes locais com mocks não substituem esses testes nos provedores.**

O cadastro do Cloudflare foi preparado para `gtorniero/sportdna`, pasta `payments`, build `pnpm install --frozen-lockfile`, deploy `pnpm exec wrangler deploy`, sem previews automáticos. Não foi publicado: o token automático proposto inclui diversos serviços da conta além do necessário. Não usar tokens de Quiddo/Retrozap.

## Antes de produção

Além dos testes acima: revisar cobrança real e taxas na conta, recuperação/entrega do relatório, política de reembolso e privacidade, controles contra abuso, retenção dos pedidos e decisão sobre proteção do conteúdo. Criar catálogo de produção separado e revisar a habilitação de `live` em um PR próprio. Não copiar os IDs de teste para produção. Nenhuma contratação ou cobrança real foi feita nesta etapa.

## Validação local

- `pnpm install --frozen-lockfile`
- `pnpm test` (Node 22+ com `node:sqlite`): regras de valor/produto/ambiente, token de acesso, assinatura, pedido pendente, duplicidade e revogação após reembolso; provedores simulados.
- `pnpm build`: empacota sem publicar. O pacote é menor que o limite do plano Workers Free.
- Fluxo de navegador validado com um servidor QA local e dados fictícios; não há controles QA no site nem neste pacote.

Documentação: [Stripe Checkout](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted), [fulfillment e webhooks](https://docs.stripe.com/checkout/fulfillment), [Pix Orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/websites/pix), [teste Pix](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/pix), [assinatura de notificações](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/optional-notifications).


Update 2026-11-02: D1 sportdna-payments-test created (936d7152-4ddd-4764-9cd5-a6cd8e966582). Migration applied; orders and rate_limits tables verified. Worker binding remains pending. Automatic GitHub deployment abandoned; no build token created. Manual Worker publication and test-only Secrets storage await explicit confirmation.
