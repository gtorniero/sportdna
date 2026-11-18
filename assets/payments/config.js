// Preços exibidos no checkout. O catálogo do servidor continua sendo a fonte da cobrança.
// tests/payment-prices.test.mjs verifica os valores contra payments/src/security.mjs.
window.SPORTDNA_PAYMENTS=Object.freeze({
 mode:'live',api:'https://sportdna-payments-test.guitorniero.workers.dev',
 products:Object.freeze({
  'racket-report':Object.freeze({name:'Relatório RACKET DNA',amount:1999}),
  'surf-report':Object.freeze({name:'Relatório SURF DNA',amount:1999}),
  'run-report':Object.freeze({name:'Relatório RUN DNA',amount:999}),
  'racket-comparator':Object.freeze({name:'Comparador RACKET DNA',amount:499})
 }),
 // selo de oferta no checkout (o RUN é grátis e não tem)
 promo:Object.freeze({'racket-report':'Oferta por tempo limitado','surf-report':'Oferta por tempo limitado','racket-comparator':'Oferta por tempo limitado'})
});
