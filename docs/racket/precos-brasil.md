# Racket Match — preços no Brasil (out/2026)

Desde 25/out/2026 o app mostra preço de loja brasileira em R$, não mais conversão do preço dos EUA.

## Método
- Busca em lojas brasileiras (Centauro, Decathlon, Netshoes, Magalu, Amazon.com.br, Mercado Livre, Casa do Tenista e outras .com.br). Preços lidos dos resumos de busca na data da consulta, sem abrir cada página.
- Só produto novo, mesmo modelo, versão, peso e geração. Geração anterior, infantil, usada, kit e edição especial (ex.: Pure Drive Wimbledon) ficam fora.
- Vale o preço cheio no cartão. Importado com taxa (Amazon) só entra se não houver oferta nacional.
- Faixa = menor e maior oferta, arredondadas para dezenas. "Pouca oferta" = uma loja; "difícil de achar" = nenhuma.
- Sem loja no Brasil: estimativa de importada, preço de referência nos EUA × R$ 5,20, marcada como "importada" no app.
- Para atualizar: refazer a busca e trocar o objeto `PRECO` em `racket/index.html`.

## Tabela

| # | Raquete | Faixa (R$) | Lojas | Observação |
|---|---|---|---|---|
| 0 | Babolat Pure Aero 98 2026 | 2.050 a 2.450 | Amazon, Magazine Luiza | Decathlon tem 'Pure Aero 98' (url /raquete-de-tenis-pure-aero-98-preta-9038642-babolat/p) a R$ 2.279,99 (de 2.399,99), mas a geração não ficou clara (busca cito |
| 1 | Babolat Pure Aero 2026 (300 g) | 1.800 a 2.230 | Casa do Tenista, Magazine Luiza, Mercado Livre | Anúncios 'Pure Aero + 300g Gen9 2026' (Amazon R$ 2.199,90 / Pix R$ 2.089,90; Netshoes R$ 2.099,90) parecem ser a Pure Aero Plus (cabo longo), não usados. Centau |
| 2 | Babolat Pure Aero Team 2026 | 2.300 a 2.350 | Amazon, Magazine Luiza, Netshoes | Casa do Tenista tem dado estruturado de R$ 2.099 para a Team 2026, sem página de produto confirmada. |
| 3 | Babolat Pure Aero Lite 2026 | 2.140 a 2.300 | Amazon, Casa do Tenista, Magazine Luiza | ML mistura 2023 e 2026 (R$ 1.500–2.200), não usado. |
| 4 | Babolat Pure Drive 2025 (Gen 11) | 1.930 a 2.090 | Decathlon, Magazine Luiza, Mercado Livre | Casa do Tenista: Pure Drive Wimbledon 2025 R$ 2.199,90; Spectra Limited R$ 2.399. Edições especiais não usadas como principal. |
| 5 | Babolat Pure Drive Team 2025 | 2.000 a 2.100 | Casa do Tenista, Mercado Livre | Só 2 lojas; geração Gen 11 não explícita no ML. |
| 6 | Babolat Pure Drive Lite 2025 | 2.100 | Casa do Tenista, Mercado Livre |  |
| 7 | Babolat Pure Strike 100 16x19 (2025) | 1.660 a 1.850 | Amazon, Centauro, Mercado Livre | Não existe 'Gen 5' à venda; a geração atual no Brasil é a 4ª (lançada 2024). Tratei Gen 4 como o modelo do catálogo. |
| 8 | Babolat Pure Strike 98 16x19 (2025) | 1.700 a 1.900 | Casa do Tenista, Centauro, Mercado Livre | Gen 4 = atual. Anúncios a ~R$ 1.055 são 3ª geração. |
| 9 | Babolat Boost Drive (2025) | 940 a 1.000 | Mercado Livre, Netshoes | Nenhum anúncio diz '2025' explicitamente; Boost Drive é vendida encordoada. |
| 10 | Head Speed MP 2026 (300g, 100, 16x19) | 1.860 a 2.200 | Amazon, Casa do Tenista, Centauro, Mercado Livre | Faixa típica R$1.860–2.200. A 'Speed MP Legend 2026' (Amazon R$2.199) é edição especial, não incluída. |
| 11 | Head Speed MP L 2026 (285g, 100, 16x19) | 2.150 | Magazine Luiza, Netshoes | Anúncio ML 'Head Speed Mp L 2026 Sinner 285g' (MLBU3758749065) existe mas o preço não apareceu. Valor de R$1.399,90 na Centauro com 285 g era ambíguo (provavelm |
| 12 | Head Speed Pro 2026 (310g, 100, 18x20) | 1.900 a 2.300 | Centauro, Mercado Livre | Netshoes lista a Speed Pro 2026, sem preço no resultado. Speed Pro Legend é edição especial, não incluída. |
| 13 | Head Speed Team 2026 (270g, 105, 16x19) | ~1.240 (US$ 239 × 5,20) | nenhuma | Nenhum anúncio da Speed Team 2026 encontrado em lojas brasileiras. |
| 14 | Head Gravity MP 2025 (295g, 100, 16x20) | 1.740 a 2.200 | Amazon, Casa do Tenista, Magazine Luiza, Mercado Livre | Gravity MP L 2025 (Amazon R$2.199,90) é outra raquete, excluída. |
| 15 | Head Gravity Pro 2025 (315g, 100, 18x20) | 1.990 a 2.300 | Mercado Livre, Netshoes |  |
| 16 | Head Boom MP 2026 (295g, 100, 16x19) | 1.670 a 1.990 | Magazine Luiza, Mercado Livre, Netshoes | Não achei preço da Boom MP 2026 na cor padrão em loja grande (Centauro tem página mas sem preço confirmado). Alternate usada como proxy, mesmo frame. |
| 17 | Head Boom Team 2026 (260g, 107, 16x19) | ~1.240 (US$ 239 × 5,20) | nenhuma | Sem anúncio da Boom Team 2026 com preço. Parecida mas DIFERENTE: Head IG Boom XCeed 260g 107 16x19 — Casa do Tenista R$1.049 (2026) / R$1.199,90 (2025, Pix R$1. |
| 18 | Head Radical MP 2025 (300g, 98, 16x19) | 2.100 a 2.200 | Centauro, Mercado Livre, Netshoes | Anúncios ML a R$1.299–1.319 sem ano claro, ignorados. Palm Tree Crew 2025 (edição limitada, mesmo frame) também existe na Netshoes/Casa do Tenista. |
| 19 | Head Extreme MP 2026 (300g, 100, 16x19) | 2.200 | Magazine Luiza, Mercado Livre | Casa do Tenista e Netshoes listam a Extreme MP 2026 (ficha 300 g), sem preço capturado. Centauro mostrou R$459,90 para '2026' — outlier/erro, descartado. |
| 20 | Head Extreme Team 2026 (265g, 105, 16x19) | 2.050 | Magazine Luiza, Netshoes | DUVIDOSO: nenhum anúncio confirma 2026; preço alto para um modelo Team (quase igual à MP). Confirmar antes de usar. |
| 21 | Head Prestige MP 2023 (310g, 99, 18x19) | 1.890 a 2.340 | Casa do Tenista, Centauro, Mercado Livre | Existe Prestige MP 2025 (sucessora) no mercado; os anúncios da Casa do Tenista podem ser dela. Usadas (R$1.597–1.699) excluídas. |
| 22 | Head Instinct MP 2025 (300g, 100, 16x19) | 1.700 | Mercado Livre, Netshoes |  |
| 23 | Head Ti S6 (225g, 115, 16x19) | 920 a 1.330 | Amazon, Decathlon, Magazine Luiza | DUVIDOSO: faixa larga. Decathlon/Netshoes (R$1.600 cheio) parece muito acima do normal para a Ti S6; anúncios ML importados R$940–1.234 (+impostos). Sugiro usar |
| 24 | ProKennex Ki Q+ Tour 300 g (2026) | ~1.290 (US$ 249 × 5,20) | nenhuma | Não encontrada em lojas brasileiras. Só aparecem outros Q+ (Ki Q+5 300 g ~R$ 1.655–2.299; Ki Q+15 105 285 g ~R$ 1.999) no Mercado Livre, que são outros modelos. |
| 25 | ProKennex Black Ace 300 (2025) 300 g | 1.950 a 2.200 | Mercado Livre, Netshoes | Casa do Tenista tem 'Raquete de Tênis Prokennex Black Ace 16X19 300g (2025)' (https://www.casadotenista.com.br/raquete-de-tenis-black-ace-16x19-300g--2025-----p |
| 26 | ProKennex Black Ace 105 (2025) 300 g | ~1.290 (US$ 249 × 5,20) | nenhuma | Não encontrada em lojas brasileiras. |
| 27 | Völkl Vostra V1 Pro (2025) 302 g | ~1.400 (US$ 270 × 5,20) | nenhuma | Vostra V1 Pro não encontrada em lojas brasileiras. |
| 28 | Völkl Vostra V8 300 g (2024) | 1.920 a 2.130 | Amazon, Mercado Livre | Magazine Luiza tem 'Raquete De Tênis Volkl Vostra Vcell 8 300G - 2024 L3' (https://www.magazineluiza.com.br/raquete-de-tenis-volkl-vostra-vcell-8-300g-2024-l3/p |
| 29 | Völkl Vostra V1 MP 285 g (2024) | ~1.050 (US$ 202 × 5,20) | nenhuma | Não encontrada. Amazon.com.br tem 'VOLKL V1 Classic' 285 g (linha anterior, sem preço capturado). |
| 30 | Wilson Blade 98 16x19 v9 (305 g) | 1.730 a 1.800 | Decathlon, Mercado Livre, Netshoes | Magazine Luiza mostra faixa R$ 1.614,91–2.203,97 na busca (não detalhado). Centauro tem página v9 305g mas indisponível. Edições especiais (Roland Garros/US Ope |
| 31 | Wilson Blade 100L v9 (285 g) | 1.700 a 1.800 | Amazon, Magazine Luiza, Mercado Livre | Catálogo diz 284 g; lojas anunciam 285 g (mesma raquete). Netshoes tem página 'Blade 100L V9 - 285g - Verde' sem preço visível; Centauro indisponível. Netshoes  |
| 32 | Wilson Blade 104 v9 (290 g) | 1.400 a 1.700 | Amazon, Magazine Luiza, Mercado Livre, Netshoes | Faixa nacional R$ 1.400–1.700. |
| 33 | Wilson Clash 100 v3 (295 g) | 1.620 a 1.800 | Amazon, Decathlon, Mercado Livre | Sem novas lojas encontradas além das já conhecidas. |
| 34 | Wilson Clash 100L v3 (280 g) | 1.680 a 1.830 | Amazon, Netshoes | Centauro tem página Clash 100L V3 (m16pzf) sem preço visto. |
| 35 | Wilson Clash 108 v3 (280 g) | ~1.160 (US$ 224 × 5,20) | nenhuma | Nenhuma loja brasileira com Clash 108 V3 encontrada em 3 buscas. Usar fallback ou referência da 100L v3. |
| 36 | Wilson Ultra 100 v5 (300 g) | 1.670 a 2.100 | Amazon, Centauro, Magazine Luiza, Mercado Livre, Netshoes | Edição Roland Garros 2026 excluída. |
| 37 | Wilson Ultra 100L v5 (280 g) | 1.800 a 2.200 | Amazon, Centauro, Decathlon, Magazine Luiza, Mercado Livre | URLs de Decathlon/Magalu/Centauro são de listagem, não da página do produto. |
| 38 | Wilson Pro Staff 97 v14 (315 g) | 1.550 a 2.100 | Centauro, Decathlon, Magazine Luiza, Mercado Livre, Netshoes | Boa cobertura. |
| 39 | Wilson Shift 99 v1 (300 g, 16x20) | 1.490 a 1.800 | Mercado Livre | Só Mercado Livre. Decathlon (R$ 1.589,99), Centauro (R$ 1.899,90), Amazon (R$ 1.649,90) e Magalu (R$ 1.799,99) vendem a Shift 99 PRO v1 (315 g, 18x20) — outra r |
| 40 | Wilson Burn 100 v5 (300 g) | 1.770 | Mercado Livre | Cobertura fraca: só Mercado Livre. Amazon (B0D1YSH7WS) indisponível. Netshoes R$ 599 é Burn 100 antiga (WRT7270103), não v5. Listagens ML de R$ 803–1.202 sem co |
| 41 | Yonex EZONE 98 (2025, 8ª geração) 305 g | 2.200 a 2.500 | Amazon, Casa do Tenista, Mercado Livre, Netshoes | Decathlon tem página da EZONE 98 2025 azul, mas sem preço (indisponível). Não confundir com EZONE 98+ (27,5"), 98L (285 g) e 98 Tour. |
| 42 | Yonex EZONE 100 (2025, 8ª geração) 300 g | 2.200 a 2.500 | Casa do Tenista, Decathlon, Magazine Luiza, Netshoes | Mercado Livre (catálogo MLB45530697 e outros) com anúncios entre R$ 2.199 e R$ 2.999, misturando 100/100L/100SL. Amazon ~R$ 2.400–2.800, versões nem sempre iden |
| 43 | Yonex EZONE 100L (2025, 8ª geração) 285 g | 2.400 | Amazon, Mercado Livre | Netshoes tem a página 'Raquete de Tênis Yonex Ezone 100L 285g 2025 - Azul' (https://www.netshoes.com.br/p/raquete-de-tenis-yonex-ezone-100l-285g-2025-azul-595-1 |
| 44 | Yonex VCORE 98 (2026, 8ª geração) 305 g | 2.250 a 2.680 | Amazon, Casa do Tenista | Mercado Livre tem 'Raquete De Tênis Yonex Vcore 2026 Vermelho Ruby 98 Vermelho L2' (MLBU3670152014), preço não confirmado; anúncios VCORE 98 no ML vão de ~R$ 1. |
| 45 | Yonex VCORE 100 (2026, 8ª geração) 300 g | 2.490 a 2.500 | Amazon, Casa do Tenista, Netshoes | Netshoes também lista 'Raquete de Tênis Yonex Vcore 100 300G 2023 - Vermelho' (7ª geração), sem preço capturado. |
| 46 | Yonex VCORE 100L (2026, 8ª geração) 280 g | 2.670 | Amazon | Netshoes tem 'Raquete de Tênis Yonex Vcore 100L 8th Gen - 280g' e Casa do Tenista tem 'Raquete de Tênis Yonex Vcore 100L 16x19 280g (2026)', mas nenhum preço ap |
| 47 | Yonex Percept 97 (2023) 310 g | 2.000 a 2.300 | Decathlon, Mercado Livre, Netshoes | Cor Midnight Navy (2025, mesmo molde) no ML em ~R$ 2.199–2.669. Magazine Luiza tem página '...Percept 97 310g - 2023' sem preço capturado. |
| 48 | Yonex Percept 100 (2023) 300 g | 1.600 a 2.350 | Magazine Luiza, Mercado Livre, Netshoes | Não confundir com Percept 100D (305 g, 16x19 também) e 100L (280 g). Amazon tem a verde L4 indisponível. |
| 49 | Prince Phantom 100X 290 g | 1.670 a 2.000 | Mercado Livre, Netshoes | Centauro (m18jir) indisponível. Loja oficial princetennis.com.br lista sem preço visível. Phantom 100X 310 g é outra raquete. |
| 50 | Prince Tour 100 290 g (2026) | 1.890 | Mercado Livre | Só 1 loja para a 2026. princetennis.com.br lista 'Tour Carbon 100 290g' sem preço. Centauro só Tour 100 310g (indisponível). |
| 51 | Prince Ripstick 100 300 g | 1.790 | Mercado Livre | Anúncio ML a R$ 1.100 ('Grip 2') ignorado como outlier/duvidoso. Loja oficial princetennis.com.br lista o modelo sem preço visível. Pacote x2 de 280 g excluído. |
| 52 | Tecnifibre TF40 305 16x19 (2024) | 1.700 a 1.880 | Magazine Luiza, Mercado Livre | Geração (2022 vs 2024) não confirmada nos anúncios. Amazon só tem 18x20 (R$ 1.714,84), excluída. |
| 53 | Tecnifibre TFight 300 (2025) | 2.000 a 2.300 | Magazine Luiza, Mercado Livre | Atenção: Isoflex tem cabeça 98; a 2025 tem 100. Catálogo diz 100, então Isoflex fica como geração anterior. |
| 54 | Dunlop CX 200 (2024) | 2.030 | Amazon | Netshoes 'CX 200 - Preto+Vermelho' (provável 2024) esgotada. Só 1 oferta nova confirmada. |
| 55 | Dunlop SX 300 (2025) | 1.890 a 2.200 | Centauro, Magazine Luiza, Mercado Livre | Excluídas SX 300 Tour 305g e SX300 LS (Amazon V25 R$ 2.454,04). |
| 56 | Dunlop FX 500 (2025) | 1.900 a 2.100 | Amazon, Decathlon, Mercado Livre | Nenhum anúncio identifica 2025; a FX 500 vendida é a V23 (2023). Se o catálogo quer outra geração, preços podem não valer. |
| 57 | Dunlop CX 200 Tour 16x19 (2024) | 1.890 a 1.900 | Centauro, Netshoes | Excluída CX 200 Tour 18x20 315g (Centauro, indisponível). |

## Para conferir à mão
- Geração não confirmada no anúncio: Pure Strike 100 e 98 (à venda só a 4ª geração), FX 500, SX 300, Extreme Team, TF40.
- Uma oferta só: Vostra V8, Shift 99, Burn 100 v5, EZONE 100L, VCORE 100L, Prince Tour 100 e Ripstick 100, CX 200 (importada pela Amazon).
- Percept 100 na Magalu a R$ 1.600 está bem abaixo das outras ofertas.
