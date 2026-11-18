# RACKET DNA internacional: pendências e checklist de lançamento

## Estado em 18/11/2026: beta nos EUA no ar (aprovado pelo dono)

- **No ar:**
  - Página `https://sportdna.com.br/en/racket/` (inglês americano, indexável, hreflang en-US ↔ pt-BR).
  - `/en/terms/` e `/en/privacy/`.
- **Pagamento:**
  - Relatório a US$ 9,99, cobrado ao vivo pela Stripe, só cartão e só para os EUA (`liveMarkets:['US']`).
  - Worker de produção publicado em 18/11 (versão `08ef9e02`; a anterior era `88b6d2a3`).
  - Coluna `market` criada no D1 de produção.
  - A Stripe aceitou sessão ao vivo em USD (verificado).
- **Fora do ar:** Reino Unido, Canadá e Austrália seguem como páginas de teste em `intl/`, fora do pacote e só no sandbox.
- **Relatório financeiro (BRL):** não soma as vendas em USD. Acompanhe essas vendas na Stripe.

Os itens abaixo continuam valendo para os outros mercados e para sair do beta. Já resolvidos para os EUA: domínio provisório `.com.br`, preço US$ 9,99, termos e privacidade em inglês e tirar o `noindex`.

Nada abaixo foi feito em produção. Cada item precisa da aprovação do dono.

## Técnico

- [ ] **Domínio.** Decidir onde a versão em inglês vive.
  - Recomendação: um domínio genérico (`.com`) ou subdomínio dedicado, porque `.com.br` sinaliza Brasil ao Google.
  - Depois, trocar `SITE` em `racket/tools/i18n/build.mjs` e, se preciso, a regex de produção do simulador em `patches.mjs`.
- [ ] **Publicação.**
  - Incluir `intl/` (ou o caminho final) no `scripts/package-site.mjs`.
  - Tirar o `noindex`.
  - Ligar canonical e hreflang (en-US, en-GB, en-CA, en-AU, x-default) e o par pt-BR ↔ en no `racket/` brasileiro.
  - Gerar o sitemap internacional.
- [ ] **Sandbox de pagamento.**
  - Criar o D1 `sportdna-payments-sandbox` e aplicar as migrações.
  - Publicar `payments/wrangler.sandbox.jsonc` com chaves de TESTE da Stripe e um webhook de teste próprio.
  - Rodar o build com `--api=` e testar com o cartão 4242 4242 4242 4242 de ponta a ponta: pedido, retorno, webhook e liberação.
- [ ] **Produção do pagamento.**
  - Decidir o preço.
  - Tirar `testOnly` só quando aprovado.
  - Ativar Stripe Tax (IVA de 20% no Reino Unido, GST de 10% na Austrália, sales tax nos EUA e GST/HST no Canadá, conforme os limiares).
  - Aplicar `0002_market.sql` no D1 de produção antes do deploy do worker.
- [ ] **E-mail do relatório.** O envio por e-mail está desligado no inglês porque o modelo do e-mail é só em português.
- [ ] **Medição.**
  - Ligar GA4 e Meta só com aviso de cookies em inglês. Reino Unido: opt-in obrigatório (UK GDPR/PECR); Canadá: PIPEDA; EUA: CCPA para residentes da Califórnia.
  - Hoje os eventos vão só para `dataLayer`, com `environment:'test'` e `purchase_test`.
- [ ] **Raquete atual informada pela pessoa.** Os nomes de gerações antigas vêm do catálogo brasileiro. Conferir variações regionais de nome (por exemplo, edições só para os EUA).
- [ ] **RUN DNA e SURF DNA.** Ainda sem inglês. O convite "teste também" está oculto.

## Dados e motor

- [ ] **Preços.** Conferir na página ao vivo os preços em USD (8 estimados) e as 14 referências em GBP, CAD e AUD; trocar o fator pelas lojas locais quando houver lista completa.
- [ ] **Disponibilidade por país.** Validar com o varejo local que todas as marcas do catálogo têm loja e assistência nos 4 países. A suposição atual: ProKennex é marca especialista; Volkl, Tecnifibre, Prince, Dunlop e Solinco são comuns.
- [ ] **Calibração.** O top 3 foi calibrado com a disponibilidade brasileira. Sem as penalidades de nicho, a 1ª raquete muda em cerca de 27% dos perfis. Rodar `racket/tools/calibrar.mjs` com a disponibilidade internacional e casos de especialistas dos EUA e do Reino Unido.
- [ ] **Faixas de orçamento.** Confirmar com dados de busca e venda (o catálogo concentra-se entre $249 e $305).

## Comercial e jurídico

- [ ] **Preço do relatório.** US$ 9,99 em todos os mercados é proposta. Cobrar em USD de clientes do Reino Unido e da Austrália gera taxa de câmbio no cartão. Alternativa: cobrar em GBP e AUD.
- [ ] **Política de reembolso em inglês.**
  - No Reino Unido, conteúdo digital tem 14 dias de arrependimento, salvo consentimento expresso de entrega imediata com aviso de perda do direito.
  - Revisar a "7-day guarantee" com assessoria.
- [ ] **Documentos.** Termos de uso, política de privacidade e página "como ganhamos dinheiro" em inglês. O rodapé hoje avisa que vêm antes do lançamento.
- [ ] **Compra de raquetes.**
  - Decidir se haverá afiliado (Amazon ou Tennis Warehouse) e com que declaração (FTC 16 CFR 255, ASA/CAP no Reino Unido).
  - Até lá, nenhum botão.
- [ ] **Imagens das raquetes.** Não usar imagens do Mercado Livre. Se houver fotos, licenciar ou usar material de imprensa das marcas.
- [ ] **Campanhas.** Nenhuma até a aprovação.

## Achados da revisão editorial

- [ ] **Trecho de review com promessa de cura.** "Conta que ela curou o cotovelo de tenista" (REVQ) contradiz "nenhuma raquete previne ou trata lesão".
  - No inglês já foi suavizado.
  - No português segue igual: é dado do app brasileiro e precisa de decisão do dono.
- [ ] **PDF em A4.** Nos EUA e no Canadá o papel é Letter.
- [ ] **Horário.** O horário do pagamento aparece no formato de 24 horas.
- [ ] **Contato.** O e-mail é `.com.br` e o assunto do e-mail de "número errado" está em português.
- [ ] **Grafia americana.** "maneuverability" e "catalog" ficam na grafia dos EUA por falta de alternativa neutra.

## Revisão editorial

- [x] Segunda revisão completa do inglês, independente (ver `docs/racket/intl/revisao-editorial.md`).
- [ ] Leitura final por um falante nativo jogador de tênis, de preferência um americano e um britânico.
