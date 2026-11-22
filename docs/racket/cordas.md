# RACKET DNA: sugestão de cordas (rodada 27, nov/2026)

## O que o relatório mostra
- Seção **"Cordas para o seu jogo"**, logo antes do Guia de compra, com chip próprio ("Cordas").
- Tipo de corda, espessura e faixa de tensão (como antes, agora com regras novas) e **3 cordas reais** do tipo: **A mais indicada**, **Econômica** e **Premium**. Cada uma tem preço do set no Brasil e um ou dois motivos.
- No híbrido: os 3 são poliésteres macios para as verticais, e o texto indica um multifilamento para as horizontais.
- Com dor hoje, a Premium é tripa natural (a corda mais macia).
- PDF e ficha: o exemplo de corda passa a ser as cordas escolhidas.
- Prévia grátis: só cita que o relatório traz "as 3 cordas certas para o seu jogo, com preço".
- Inglês: as mesmas cordas, sem preço em real e sem marcas vendidas só no Brasil (Topspin).

## Regra do tipo (`stringSetup`, em `racket/index.html`)
Ordem de prioridade (a primeira que vale decide):
1. Dor hoje ou dor forte → multifilamento 1,30 mm (48 lb com dor forte, 50 lb nos outros casos).
2. Iniciante ou menos de 14 anos → sintético (nylon) 1,30 mm.
3. Dor passada, cotovelo ou punho sensível, ou 60+ → avançado e intermediário avançado: híbrido (poliéster macio nas verticais, multi nas horizontais); demais: multifilamento.
4. Intermediário → multifilamento; com muito topspin e swing longo, híbrido.
5. Menos de 16 anos, ou intermediário avançado sem swing longo → híbrido.
6. Intermediário avançado com swing longo → poliéster macio 1,25 mm.
7. Avançado com muito topspin → poliéster facetado 1,25 mm; senão poliéster redondo 1,25 mm.

**Mudança principal:** antes, o intermediário caía no poliéster por padrão. As fontes indicam multifilamento ou híbrido até o 4.0 e poliéster completo só com swing longo e topspin, sem dor, a partir de cerca de 16 anos (ver `docs/racket/cordas/pesquisa-regras.md`, com as fontes e o grau de evidência de cada regra).

A tensão segue a lógica anterior (base por tipo, com ajustes por potência, controle, 18×20, quadro rígido com dor e tensão atual).

## Escolha das 3 cordas (`cordaPicks`)
- Universo: cordas do catálogo do tipo indicado (poliéster macio = os que o fabricante posiciona como macios: RPM Soft, Hyper-G Soft, Element, Hawk Touch).
- Pontuação: oferta no Brasil (alta 30, média 20, baixa 10). Quando houver dados de laboratório (TWU), somam maciez (rigidez em lb/in, com peso maior para dor, híbrido, poliéster macio e multi), segurar tensão (perda %) e spin (atrito) para quem usa muito topspin. Quem quer spin ganha +3 em corda facetada.
- **A mais indicada** = maior pontuação. **Econômica** = a mais barata, entre as de oferta média ou alta, mais barata que a indicada. **Premium** = mais cara, de oferta média ou alta (com dor hoje: tripa natural).
- Nenhuma marca paga para aparecer. Afiliado, se houver no futuro, só depois da recomendação e declarado.

## Dados
- `docs/racket/dados/cordas.json`: 60 cordas vendidas no Brasil, com tipo, formato, preço do set (e do rolo, quando achado), oferta, lojas e fontes.
- `racket/tools/cordas.mjs` injeta o catálogo no app. Depois de mudar o JSON: `node racket/tools/cordas.mjs && node racket/tools/i18n/build.mjs`.
- **Limitações desta versão:**
  - Preços vêm de resumos de busca (lojas online, Mercado Livre, Amazon), lidos em 22/11/2026. As páginas não abriram direto nesta sessão; conferir antes de usar como valor fechado.
  - "Oferta no Brasil" é estimativa pela quantidade de lojas e anúncios, não dado de venda.
  - Dados de laboratório (TWU) para 58 das 60 cordas, coletados pelo GPT em 22/11/2026 com URL (`docs/racket/cordas/gpt-2026-11-22.csv`). O mesmo arquivo trouxe preços de página de loja (33 cordas) e jogadores que usam ou usaram (12).
  - Com a rigidez medida, "poliéster macio" passou a ser poliéster abaixo de 185 lb/in (RPM Soft, Hyper-G Soft, Black Venom, Lynx, Poly Tour Pro, Sonic Pro, Revolve Spin, Topspin Cyber Blue e Cyber Flash). A Luxilon Element (208) e a Head Hawk Touch (196) saíram do grupo. A planilha indica que a RPM Soft é de poliamida.
  - A econômica não pode perder 50% ou mais de tensão no teste.
  - Tecnifibre HDMX ficou de fora (sem anúncio no Brasil).

## Rodada 2 do GPT (22/11/2026)
- Arquivos em `docs/racket/cordas/rodada2-2026-11-22/` (LEIA-ME com as regras de integração, preços e laboratório).
- Preço do set agora tem status:
  - confirmado: 37 cordas, com página de loja e bitola;
  - referência: 21 cordas, só por busca, e o relatório mostra "cerca de R$ X (referência)";
  - esgotado: X-One Biphase e Multifeel, fora das 3 escolhas.
- Quando o set cotado é de outra bitola, o relatório mostra a bitola ao lado do preço.
- As escolhas preferem corda com preço confirmado; a econômica exige preço confirmado.
- A Duramix HD (162 lb/in) não foi usada para a Tecnifibre Synthetic Gut. RPM Power: só a bitola foi confirmada.
- Mercado Livre e Amazon não abriram: sem links de compra nesta versão.

## Próximos passos
1. Completar o laboratório da Tecnifibre Synthetic Gut e da RPM Power, e os preços que faltam.
2. Feito: "macio" pela rigidez medida (abaixo de 185 lb/in para poliéster).
3. Conferir preços nas lojas e incluir lojas especializadas (ProSpin, iTenis, Spin Top, Empório do Tenista).
4. Revisão de um professor ou encordoador (casos reais: o que o aluno usa e quanto paga).
5. Teste T29 em `racket/tools/regressao.mjs` cobre o tipo por perfil; ampliar com casos reais.

## Prompt para completar os dados (GPT ou outra sessão com acesso à Tennis Warehouse)
Um prompt só, numa rodada. O CSV que volta entra em `docs/racket/dados/cordas.json` (campos `lab`, `set_brl`, `rolo_brl`, `pros`) e depois roda `node racket/tools/cordas.mjs && node racket/tools/i18n/build.mjs`.

```text
Você vai montar uma base de dados de cordas de tênis para um site brasileiro que recomenda raquete e corda (SPORT DNA). Faça tudo numa resposta só, para as 60 cordas da lista no fim.

REGRAS
1. Nunca invente número nem nome. Todo dado vem de uma página que você abriu, e a URL vai na linha. O que não achar fica vazio.
2. Uma linha por corda, na ordem da lista, mesmo que fique quase vazia.
3. Responda só com um bloco CSV (separador ponto e vírgula, decimais com ponto), seguido de um resumo curto.

FONTES
- Laboratório: Tennis Warehouse University (twu.tennis-warehouse.com: String Selector / String Performance Database) e as páginas de produto e de comparação da tennis-warehouse.com que trazem "TWU Stiffness", "Tension Loss" e "Spin Potential". Use a bitola 1,25 mm (17) para poliéster e 1,30 mm (16) para multifilamento, sintética e tripa; se só houver outra, use-a e informe em bitola_mm.
- Notas de playtest: reviews de cordas da Tennis Warehouse (0 a 100).
- Preços no Brasil, em reais, lidos hoje: Mercado Livre, Amazon.com.br, ProSpin, iTenis, Spin Top, Empório do Tenista, Casa da Raquete, Decathlon. Set = 12 m (12,2 m). Rolo = 200 m (se o rolo tiver outro tamanho, diga em obs). Pegue o menor e o maior preço que encontrar entre lojas confiáveis (ignore anúncio claramente fora da curva e diga em obs).
- Uso no circuito: jogadores profissionais (ATP/WTA, top 100 atual ou campeões de Grand Slam) que usam a corda, só com fonte (site do fabricante, Tennis Warehouse "What the pros use", stringers de torneio, matérias). Até 3 nomes.

COLUNAS (nesta ordem)
marca;modelo;bitola_mm;rigidez_lbin;perda_tensao_pct;spin_potencial;nota_conforto;nota_controle;nota_potencia;nota_spin;nota_durabilidade;nota_manter_tensao;url_laboratorio;set_min_brl;set_max_brl;rolo_min_brl;rolo_max_brl;lojas;url_precos;data_precos;pros;url_pros;obs

- url_precos: até 2 URLs, separadas por espaço.
- lojas: nomes separados por vírgula.
- data_precos: AAAA-MM-DD.
- pros: nomes separados por vírgula.

RESUMO NO FIM (até 8 linhas)
Quantas cordas ficaram com rigidez, com notas de playtest, com preço de set e com pro; quais fontes não abriram; qualquer dúvida importante.

LISTA (60)
Babolat RPM Blast; Babolat RPM Rough; Babolat RPM Power; Babolat RPM Soft; Babolat Pro Hurricane; Babolat Xcel; Babolat Addiction; Babolat Synthetic Gut; Babolat Touch VS; Luxilon ALU Power; Luxilon 4G; Luxilon Element; Luxilon Big Banger Original; Luxilon Smart; Solinco Hyper-G; Solinco Hyper-G Soft; Solinco Tour Bite; Solinco Confidential; Solinco Revolution; Solinco Vanquish; Head Lynx; Head Lynx Tour; Head Hawk; Head Hawk Touch; Head Sonic Pro; Head Velocity MLT; Head Reflex MLT; Head Synthetic Gut PPS; Head RIP Control; Wilson Revolve; Wilson Revolve Spin; Wilson NXT; Wilson Sensation; Wilson Synthetic Gut Power; Wilson Natural Gut; Yonex Poly Tour Pro; Yonex Poly Tour Strike; Yonex Poly Tour Spin; Yonex Poly Tour Rev; Yonex Rexis; Tecnifibre Black Code; Tecnifibre Razor Code; Tecnifibre Ice Code; Tecnifibre Red Code; Tecnifibre X-One Biphase; Tecnifibre NRG2; Tecnifibre Multifeel; Tecnifibre Synthetic Gut; Kirschbaum Pro Line II; Kirschbaum Max Power; Signum Pro Poly Plasma; Signum Pro Firestorm; Polyfibre Black Venom; MSV Focus Hex; Topspin Cyber Blue; Topspin Cyber Flash; Prince Synthetic Gut Duraflex; Prince Premier Touch; Gamma Synthetic Gut; Gamma Live Wire
```

## Prompt da 2ª rodada (laboratório que faltou e preços de todas)

```text
Segunda rodada da base de cordas do SPORT DNA. Faça tudo numa resposta só.

REGRAS
1. Nunca invente número. Todo dado vem de uma página que você abriu, com a URL na linha. O que não achar fica vazio.
2. Responda só com os 2 blocos CSV abaixo (separador ponto e vírgula, decimais com ponto) e um resumo curto no fim.

BLOCO 1: LABORATÓRIO QUE FALTOU (2 cordas)
Fonte: Tennis Warehouse University (twu.tennis-warehouse.com, String Selector / reporter2.php) e páginas de produto e de review da tennis-warehouse.com. Bitola 1,30 mm (16) para a sintética; para a RPM Power, a que existir (diga qual).
Colunas: marca;modelo;bitola_mm;rigidez_lbin;perda_tensao_pct;spin_potencial;nota_conforto;nota_controle;nota_potencia;nota_spin;nota_durabilidade;url_laboratorio;obs
Cordas: Babolat RPM Power; Tecnifibre Synthetic Gut
(Se a Tecnifibre Synthetic Gut não existir no TWU, procure a "Tecnifibre Synthetic Gut Duramix" ou a sintética da Tecnifibre mais próxima e diga em obs.)

BLOCO 2: PREÇOS NO BRASIL, TODAS AS 60 CORDAS
Lojas: Mercado Livre (só lojas oficiais ou com reputação verde), Amazon.com.br, ProSpin, iTenis, Spin Top, Empório do Tenista, Casa da Raquete, Decathlon, Centauro. Procure em pelo menos 3 lojas por corda.
- Set = 12 m (ou 12,2 m), na bitola mais comum: 1,25 mm para poliéster, 1,30 mm para multifilamento, sintética e tripa. Se só achar outra bitola, use e diga em obs.
- Rolo = 200 m. Se o rolo tiver outro tamanho, diga em obs.
- Preço à vista (Pix) quando a loja mostrar. Marque se está esgotado e ignore anúncio claramente fora da curva (diga em obs).
- set_min e set_max = menor e maior preço entre as lojas onde achou. Mesmo para rolo.
- url_mercado_livre_set: o link do anúncio do SET no Mercado Livre (de preferência loja oficial da marca ou vendedor com reputação verde e muitas vendas), no formato produto.mercadolivre.com.br/MLB-... ou www.mercadolivre.com.br/.../p/MLB...; sem parâmetros de rastreio. Se houver página de produto do catálogo (/p/MLB...), prefira ela. Se não achar anúncio confiável, deixe vazio.
Colunas: marca;modelo;set_min_brl;set_max_brl;n_lojas_set;rolo_min_brl;rolo_max_brl;n_lojas_rolo;loja_mais_barata_set;url_mais_barata_set;url_outra_loja;url_mercado_livre_set;preco_mercado_livre_set;vendedor_mercado_livre;data;obs

Lista (60): Babolat RPM Blast; Babolat RPM Rough; Babolat RPM Power; Babolat RPM Soft; Babolat Pro Hurricane; Babolat Xcel; Babolat Addiction; Babolat Synthetic Gut; Babolat Touch VS; Luxilon ALU Power; Luxilon 4G; Luxilon Element; Luxilon Big Banger Original; Luxilon Smart; Solinco Hyper-G; Solinco Hyper-G Soft; Solinco Tour Bite; Solinco Confidential; Solinco Revolution; Solinco Vanquish; Head Lynx; Head Lynx Tour; Head Hawk; Head Hawk Touch; Head Sonic Pro; Head Velocity MLT; Head Reflex MLT; Head Synthetic Gut PPS; Head RIP Control; Wilson Revolve; Wilson Revolve Spin; Wilson NXT; Wilson Sensation; Wilson Synthetic Gut Power; Wilson Natural Gut; Yonex Poly Tour Pro; Yonex Poly Tour Strike; Yonex Poly Tour Spin; Yonex Poly Tour Rev; Yonex Rexis; Tecnifibre Black Code; Tecnifibre Razor Code; Tecnifibre Ice Code; Tecnifibre Red Code; Tecnifibre X-One Biphase; Tecnifibre NRG2; Tecnifibre Multifeel; Tecnifibre Synthetic Gut; Kirschbaum Pro Line II; Kirschbaum Max Power; Signum Pro Poly Plasma; Signum Pro Firestorm; Polyfibre Black Venom; MSV Focus Hex; Topspin Cyber Blue; Topspin Cyber Flash; Prince Synthetic Gut Duraflex; Prince Premier Touch; Gamma Synthetic Gut; Gamma Live Wire

Prioridade, se o tempo acabar: primeiro estas 27, que estão sem preço de loja: Babolat Pro Hurricane; Babolat Addiction; Babolat Synthetic Gut; Luxilon Element; Luxilon Big Banger Original; Luxilon Smart; Solinco Vanquish; Head Sonic Pro; Head Velocity MLT; Head Synthetic Gut PPS; Wilson Revolve; Wilson Revolve Spin; Wilson Natural Gut; Yonex Poly Tour Strike; Yonex Poly Tour Rev; Tecnifibre X-One Biphase; Tecnifibre NRG2; Tecnifibre Multifeel; Tecnifibre Synthetic Gut; Kirschbaum Pro Line II; Signum Pro Firestorm; MSV Focus Hex; Topspin Cyber Blue; Topspin Cyber Flash; Prince Synthetic Gut Duraflex; Prince Premier Touch; Gamma Synthetic Gut.

RESUMO NO FIM (até 6 linhas)
Quantas cordas ficaram com preço de set em 3 lojas ou mais, quantas em 1 ou 2, quantas sem preço; quais lojas não abriram.
```
