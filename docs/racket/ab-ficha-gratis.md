# Teste A/B: ficha ideal grátis na prévia (nov/2026)

**Pergunta:** mostrar de graça a ficha ideal (faixas de peso, cabeça, swingweight e balanço) e a confiança do resultado aumenta ou diminui quem abre o checkout?

- **controle:** prévia como antes ("O que está por trás", com o peso ideal e dois números que podem aparecer como "—").
- **ficha:** no lugar desse painel, "Sua ficha ideal · grátis" com as faixas que o motor já calcula (`RES.Z`) e a confiança (`RES.conf`, com o número de respostas). Sem pesos nem fórmula. Os modelos, a corda e a tensão continuam no relatório.

## Como o grupo é sorteado
- `FICHA_GRATIS_PCT = 50` em `racket/index.html`: metade de quem chega pela primeira vez vê a ficha.
- O grupo fica no navegador (`localStorage.sd_ab_ficha_v1` = `controle` ou `ficha`) e não muda nas próximas visitas.
- Quem já tinha feito o teste antes do A/B (`rm_last` no aparelho) fica `fora`: vê a prévia antiga e não entra na conta.
- Conferência manual: `/racket/?ab=ficha` ou `/racket/?ab=controle` fixa o grupo neste navegador.

## Como ler
Os eventos do RACKET levam `ab_ficha` (só com aceite de cookies; ver `docs/medicao-jornada-2026-11-14.md`). No GA4, registre `ab_ficha` como dimensão personalizada de evento e compare por grupo:

| Métrica | Conta |
|---|---|
| Abertura do checkout | `checkout_open` ÷ `view_offer` |
| Pedido criado | `begin_checkout` ÷ `view_offer` |
| Compra | `purchase` ÷ `view_offer` |

- `view_offer` do exemplo pronto não conta (o exemplo não envia oferta).
- Rodar por 2 semanas ou até ~100 `view_offer` por grupo, o que vier depois. Com 13 ofertas em 3 dias (12 a 14/11), 2 semanas dão ~60 por grupo: diferença pequena não vai ser conclusiva. Olhe junto as compras no D1 por dia.
- Ganha a ficha se abrir mais checkout sem derrubar a compra. Se a compra cair (a pessoa leva a ficha e não paga), fica o controle.

## Como encerrar
- Ficha para todos: `FICHA_GRATIS_PCT = 100`.
- Prévia antiga para todos: `FICHA_GRATIS_PCT = 0`.

Com 0 ou 100 o grupo é apagado do aparelho e a medição para de mandar `ab_ficha`. Depois de decidir, dá para remover o código do grupo perdedor.
