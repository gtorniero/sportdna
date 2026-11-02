# RACKET DNA: modelos novos no catálogo (nov/2026)

Quatro raquetes que os especialistas indicam com frequência (`dados/casos*.json`) e que faltavam no catálogo. Entraram como ids 58 a 61 em `racket/index.html` (`CATALOG` e `PRECO`). Mesmo padrão do catálogo: peso e balanço sem corda; swingweight e rigidez encordados; comprimento em mm.

Limite da coleta: as fichas vieram dos resumos de busca. Este ambiente não abre tennis-warehouse.com, então não deu para conferir a página. Onde as fontes divergem, a tabela diz qual valor entrou e por quê. Nenhuma das quatro tem review da Tennis Warehouse no motor. Pela regra de herança, a Pure Drive 107 herda 0,7 da aprovação da Pure Drive; as outras três ficam com aprovação 0, porque não há modelo-pai no catálogo.

| Campo | Babolat Evo Drive (Gen2, 2025) | Babolat Boost Aero (2026) | Babolat Pure Drive 107 (Gen11, 2025) | Wilson Ultra Power 100 |
|---|---|---|---|---|
| Peso sem corda | 270 g | 260 g | 285 g | 268 g |
| Cabeça | 104 pol² | 102 pol² | 107 pol² | 100 pol² |
| Rigidez (RA) | 68 (fonte fraca) | 65 | 69 | 69 (fonte fraca) |
| Balanço sem corda | 320 mm | 340 mm | 320 mm | 330 mm |
| Swingweight | 302 (fonte fraca) | 312 | 307 | 295 (fonte fraca) |
| Padrão | 16x17 | 16x19 | 16x19 | 16x20 |
| Comprimento | 686 mm (27") | 686 mm | 686 mm | 686 mm (68,58 cm) |
| Preço no Brasil (cheio) | R$ 1.200 a 1.350 | R$ 1.170 a 1.300 | R$ 1.530 a 2.200 | R$ 900 (uma loja) |
| Vendida no Brasil | Sim: Casa do Tenista, Decathlon | Sim: Webcontinental, Centauro | Sim: Mercado Livre, Netshoes, Magazine Luiza | Pouca oferta: um anúncio no Mercado Livre |
| Linha `PRECO` | `{"min":1200,"max":1350,"n":2}` | `{"min":1170,"max":1300,"n":2}` | `{"min":1530,"max":2200,"n":3}` | `{"min":900,"max":900,"n":1}` |

## Notas por modelo

**Evo Drive.**
- O padrão 16x17 é o da Evo Drive comum; a Evo Drive Tour é 16x19. O motor ganhou `'16x17':1.1` na tabela `OPEN`.
- SW 302 e RA 68 vêm da TW Europe e do Too Many Rackets. Uma ficha da TW EUA de 2025 diz SW 292, RA 64 e 303 g encordada, o que não bate com 270 g sem corda, então ficou de fora. Conferir na página da TW quando der acesso.
- Fontes: [TW Europe, Evo Drive](https://www.tenniswarehouse-europe.com/Raquette_Babolat_Evo_Drive/descpageRCQBA-BRED-EN.html) · [TW Europe, Evo Drive 2025](https://www.tenniswarehouse-europe.com/Babolat_Evo_Drive_Racket_2025/descpageRCQBA-BEDR-EN.html) · [Too Many Rackets, Evo Drive × Pure Drive](https://toomanyrackets.com/babolat-evo-drive-vs-pure-drive/) · [Babolat PT, linha Evo Drive (270 g ± 7)](https://www.babolat.com/pt/tenis/collections/evo-drive.html) · [Casa do Tenista (R$ 1.349,90; à vista R$ 1.214,91)](https://www.casadotenista.com.br/raquetes/raquete-de-tenis-intermediaria/babolat) · [Decathlon BR (R$ 1.199,99)](https://www.decathlon.com.br/raquete-de-tenis-babolat-evo-drive-unissex---azul-branca-2145108660/p)

**Boost Aero 2026.**
- SW 312 e RA 65 vêm da TW EUA e da TW Europe, o mesmo laboratório do resto do catálogo. A Merchant of Tennis diz SW 305 e RA 60; a ficha de 2023 dizia RA 70.
- Fontes: [TW EUA, Boost Aero 2026](https://www.tennis-warehouse.com/Babolat_Boost_Aero_2026/descpageRCBAB-BBOASR.html) · [TW Europe](https://www.tenniswarehouse-europe.com/descpageRCQBA-BBOASR.html) · [Merchant of Tennis (260 g, 340 mm, 102 pol²)](https://www.merchantoftennis.com/products/babolat-boost-aero-2026) · [Casas Bahia, ficha 2026 260 g](https://www.casasbahia.com.br/raquete-de-tenis-boost-aero-2026-grafite-260g-encordoada-l2-babolat/p/1582727718) · [Bondfaro/Webcontinental (R$ 1.299,90 e R$ 1.169,91)](https://www.bondfaro.com.br/raquete-tenis-squash?page=18) · [Centauro (10x R$ 119,99)](https://www.centauro.com.br/nav/marca/babolat/cor/cinza)

**Pure Drive 107 (2025).**
- As fontes concordam: 285 g sem corda; 32 cm sem corda (8 pts HL); SW 307; RA 69; 16x19.
- A Netshoes anuncia R$ 1.781,91, com 25% de desconto sobre R$ 2.375,90. A faixa usa os anúncios de R$ 1.530 a 2.200.
- Fontes: [TW EUA](https://www.tennis-warehouse.com/Babolat_Pure_Drive_107_2025/descpageRCBAB-BPD17R.html) · [TW Europe](https://www.tenniswarehouse-europe.com/Babolat_Pure_Drive_107_2025_Racket_/descpageRCQBA-BPD17R-EN.html) · [Babolat PT, sem cordas (285 g ± 7, 16/19)](https://www.babolat.com/pt/pure-drive-107-gen11-sem-cordas/100-101557.html) · [Mercado Livre (R$ 1.870)](https://www.mercadolivre.com.br/raquete-de-tnis-pure-drive-107-gen11-l3-sem-cordas-2025-babolat/p/MLB45887302) · [Netshoes](https://www.netshoes.com.br/raquete-de-tenis-babolat-pure-drive-107-encordoada-285g-azul-2DC-0769-008) · [Magazine Luiza](https://www.magazineluiza.com.br/busca/raquete+babolat+pure+drive/)

**Wilson Ultra Power 100.**
- Escolhi a versão 100 e não a 105. Os casos de especialistas citam mais a 100 (Ultra Power 100 em 3 casos; 105 e RXT 105 em 1 cada). No Brasil, a 105 que aparece é a RXT 105, de R$ 400, um quadro mais simples.
- Peso, balanço, cabeça e padrão 16x20 vêm da Wilson (sites de Singapura e da Espanha): 268 g e 33 cm sem corda; 283 g e 34 cm encordada.
- SW 295 e RA 69 aparecem só numa loja (The God of Sports). Essa mesma loja dá 285 g e 16x19, o que contradiz a Wilson, então os dois números são fonte fraca.
- O ano do modelo não ficou claro: `year:null`.
- Fontes: [Wilson SG (WR146810U)](https://sg.wilson.com/products/wilson-ultra-power-100-tennis-recreational-racket-strung---wr146810u) · [Wilson ES (WR14680)](https://www.wilson.com/en-es/products/ultra-power-100-tennis-racket-wr14680) · [iPon Tennis (268 g, 16x20)](https://www.ipontennis.com/en/tennis-rackets/wilson-ultra-power-100-racket-268g) · [The God of Sports (SW 295, RA 69)](https://thegodofsports.com/products/wilson-ultra-power-100-tennis-racket) · [Mercado Livre, lista Ultra Power (R$ 899)](https://lista.mercadolivre.com.br/raquete-wilson-ultra-power)

## Efeito medido
Os números de `vies.mjs` e `calibrar.mjs` com e sem os quatro modelos estão em `calibracao-reviews.md`, rodada 6.
