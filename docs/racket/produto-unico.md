# RACKET DNA: produto único (nov/2026)

Decisão do dono: um só produto, o relatório de R$ 19,99, com mais valor dentro.

- **Comparador incluído.** O comparador avulso (R$ 4,99) sai da tela. A abertura continua com 1 comparação grátis; depois dela, o convite é para o teste (prévia grátis) e o relatório, que traz o comparador ilimitado.
- **Compras antigas do comparador continuam valendo.** O produto `racket-comparator` segue no `assets/payments/config.js` e no servidor; o adaptador do checkout ainda libera o comparador quando um pedido desse produto é confirmado.
- **Corda e tensão para a nova e para a atual.** Já existia para a raquete do catálogo. Agora a raquete fora do catálogo também ganha uma linha, partindo de um quadro médio (16×19, 65 RA), com a ressalva escrita na tela.
- **Garantia de 7 dias**, com o mesmo texto dos termos (artigo 49 do Código de Defesa do Consumidor), na prévia e no fim do relatório pago.
- **Reteste grátis em 90 dias.** Uma vez, com as respostas preenchidas, sem backend novo:
  - o pedido pago fica guardado no aparelho por 90 dias (`keepPaidDays: 90` no registro do checkout);
  - o botão só aparece depois de o servidor confirmar o pagamento nesta página e dentro do prazo (`retestDays: 90`); o `client.js` grava `retested` e não deixa repetir;
  - mesma confiança da "correção única" que já existia: as respostas ficam no aparelho; o pagamento é sempre conferido no servidor.
  - Precisa do `assets/payments/client.js` do PR da jornada (saved/resume/retest). Sem ele, o reteste não aparece.
