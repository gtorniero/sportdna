# Board Match — ilustrações dos 13 tipos

Geradas no app do Gemini (conta pessoal, sem custo de API), sem marca, fundo #EEF4F5, vista de cima e de lado. Ficam em `surf/img/tipos/<tipo>.webp` (1400 px, webp). Na página aparecem como "Ilustração do tipo, gerada por IA e sem marca"; as medidas exatas da pessoa continuam no desenho do Passo 1 e no PDF.

O app só mostra a ilustração dos tipos listados em `TIMG`; tipo sem imagem cai no desenho.

## Status
| Tipo | Chave | Imagem |
| --- | --- | --- |
| Mid-length / egg | mid | ok |
| Pranchinha | short | ok |
| Softboard de aprendizado | soft | ok |
| Longboard clássico | long | ok |
| Longboard performance | longp | ok |
| Mini-malibu / funboard | minimal | ok (refazer mais larga, se der) |
| Evolution / allround | evo | ok |
| Fish | fish | ok (refazer deitada, como as outras) |
| Groveler | grov | refazer (saiu em pé e com fundo dividido) |
| Biquilha moderna | twin | ok (refazer deitada, como as outras) |
| Softboard performance | softp | ok |
| Step-up | step | falta |
| Gun | gun | falta |

## Backup
Os originais do Gemini (2000 px) estão em `docs/board/imagens-originais/`, inclusive o groveler rejeitado.

## Histórico
- 2/nov/2026: step-up v1 rejeitada, com as quilhas desenhadas em cima do deck na vista de cima (`imagens-originais/step-v1-rejeitada-quilhas-no-deck.jpg`). O texto-base agora diz que as quilhas só aparecem na vista de lado.

## Próxima sessão (pendente)
1. Gerar step-up e gun.
2. Refazer groveler (saiu em pé e com fundo dividido) e, se quiser, fish e biquilha deitadas.
3. Gerar as 6 variantes de rabeta: short-roundpin, short-round, evo-roundpin, evo-round, mid-round, longp-round.
4. Opcional: refazer a mini-malibu mais larga (ficou parecida com a mid-length).
5. Salvar em `surf/img/tipos/`, incluir a chave em `TIMG` e mandar para revisão do Gustavo.

## Variantes de rabeta
O motor muda a rabeta em alguns tipos; o app procura `img/tipos/<tipo>-<rabeta>.webp` (rabeta: square, squash, round, roundpin, pin, swallow) e, sem variante, usa a do tipo. Faltam: short-roundpin, short-round, evo-roundpin, evo-round, mid-round, longp-round.

## Conferir antes de aceitar
Número e posição das quilhas, formato da rabeta, nenhum logo ou texto, mesmo fundo. Pedir revisão do Gustavo.

## Prompt base
```
Studio catalog photo of ONE surfboard lying flat, shown twice on the same image. Layout exactly like a technical sheet: on the left, top-down view of the deck, nose pointing up; on the right, side profile lying horizontally, nose pointing left, fins hanging below. Same uniform pale blue-grey (#EEF4F5) background across the whole image, no split, no floor line, soft contact shadow, no props. Fins are mounted on the BOTTOM of the board: they appear ONLY in the side profile, never in the top-down deck view (the deck is clean, with no fins on it). Board: plain white glassed finish with a thin natural wood stringer (unless stated otherwise). No logos, no brand names, no text, no stickers, no people, no hands. Soft even lighting, realistic proportions, accurate surfboard shape, centered with generous empty margin around it. Wide 16:9 framing.
```

## Linha de cada tipo
- mid: Mid-length egg surfboard, 7'0" long, 21.5" wide, full round nose, round pin tail, 2+1 fins (one large center fin, two small side fins), gentle low rocker.
- short: High-performance shortboard, 6'0" long, 19.25" wide, thin, pointed nose, squash tail, thruster three-fin setup, pronounced nose rocker.
- soft: Soft-top foam beginner surfboard, 8'0" long, 23" wide, very thick, wide round nose, wide square tail, three soft fins. Deck in soft light blue foam, slick white bottom, no wood stringer visible.
- long: Classic noserider longboard, 9'2" long, 22.75" wide, wide round nose with concave, square tail, single large center fin, flat rocker.
- longp: Performance longboard, 9'0" long, 22.5" wide, slightly narrower round nose, squash tail, 2+1 fins, more tail rocker.
- minimal: Mini-malibu funboard, 7'6" long, 22" wide, thick, round nose, round tail, thruster three fins, mellow rocker.
- evo: Hybrid evolution surfboard, 6'4" long, 21" wide, semi-round nose, squash tail, thruster three fins, moderate rocker.
- fish: Retro fish surfboard, 5'8" long, 21.25" wide, wide full nose, deep swallow tail, twin keel fins, flat rocker.
- grov: Small-wave groveler surfboard, 5'6" long, 20.5" wide, wide short outline, wide nose, squash tail, quad four-fin setup, low rocker.
- twin: Modern performance twin-fin surfboard, 5'10" long, 20.25" wide, medium pointed nose, swallow tail, two upright twin fins, moderate rocker.
- softp: Short soft-top performance surfboard, 6'2" long, 22" wide, semi-pointed nose, squash tail, three fins. Deck in soft light blue foam, slick white bottom, no wood stringer visible.
- step: Step-up surfboard, 6'4" long, 19.5" wide, narrow pulled-in pointed nose, round pin tail, thruster three fins, more nose rocker.
- gun: Big-wave gun surfboard, 7'6" long, 19.75" wide, long narrow pointed nose, narrow pin tail, thruster three fins, long continuous rocker.
