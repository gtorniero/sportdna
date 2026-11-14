# Aviso de cookies, Consent Mode e eventos padrão da Meta (14/11/2026)

Segue `growth/consentimento-e-seo.md` e `growth/medicao-spec.md` (seções 1, 3 e 6) do projeto Beyond the Work.

## Aviso
- Barra no rodapé da tela, uma linha e "Saiba mais" para `/privacidade/#medicao`.
- "Aceitar" é o principal (cor do app; branco no site), à direita e com o foco inicial. "Recusar" é o secundário, contornado, com o mesmo tamanho (44 px). Sem resposta, nada carrega.
- Rodapé: botão "Medição ligada" / "Medição desligada", que reabre a barra.
- Chaves mantidas: `sd_consent_v1`, `btw_capi_choice_v1`, `btw_meta_subject_sportdna` e a revogação em `/meta/revoke`.

## Medição
- Consent Mode v2 no quadro `/medicao.html`: `default` negado nos quatro sinais, `update` no aceite e, ao recusar depois de aceitar, `update` negado e `fbq('consent','revoke')` antes de o quadro sair. Sem aceite o quadro nem é criado: não há pings sem cookie.
- Eventos personalizados com os mesmos nomes e momentos. Eventos padrão somados: `Lead` junto com `QuizCompleted` (`content_category` = racket/surf/run), `ViewContent` junto com `OfferViewed` (value, BRL, `content_ids`), `InitiateCheckout` e `Purchase` com `content_ids` (Purchase mantém o `eventID` igual ao da Conversions API).
- Todo evento do pixel leva `page_path` e `content_category`, porque a Meta só enxerga `/medicao.html`.
- GA4: `page_location` no domínio canônico (`https://sportdna.com.br`, antes `www`) e `page_referrer` só com a origem de quem trouxe a visita.
- Artigos do blog medidos pelo próprio caminho quando o endereço é a página publicada (canonical igual); a calculadora de litragem entra na medição.
- Oferta, abertura e erro de checkout valem para os três testes (antes só RACKET). SURF e RUN passam a chamar a oferta no PR separado das pastas dos apps.

## CheckoutError (2 contra 8 compras)
O evento sai em dois casos: clique em "Gerar Pix" sem e-mail válido (`invalid_email`, validação, não é falha) ou falha ao criar o pedido (`network`, `timeout`, `unavailable`, `rejected`, `invalid_response`). O parâmetro `error_category` diz qual foi; o worker de pagamento está com logs desligados.

Causas de código corrigidas em `assets/payments/client.js`:
- E-mail como `nome@gmail` passava no navegador e era recusado pelo servidor (400, `rejected`). Agora a regra é a mesma do servidor e o erro sai como `invalid_email` sem chamar o servidor.
- `AbortSignal.timeout` (Safari 16+) e `crypto.randomUUID` (Safari 15.4+): no iPhone com iOS 15 o pedido nem saía, e o erro aparecia como `network`. Agora há alternativa.
- Resposta de erro sem JSON virava `invalid_response`; agora o status vem primeiro (`unavailable`/`rejected`).
- Mensagens do navegador em inglês ("Load failed", "The operation timed out") não aparecem mais; todo erro tem texto em português. Falha do próprio navegador sai como `client`.

O nome `sportdna-payments-test` é legado e é o worker de produção (ver CLAUDE.md). Renomear exige mudança na Cloudflare e não faz parte deste PR.
