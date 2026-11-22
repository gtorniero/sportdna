# SPORT DNA — segunda rodada de cordas: entrega para integração pelo Claude

Pesquisa de 22/11/2026. Estes arquivos são dados e orientações de integração. Esta entrega não altera código, motor de recomendação, catálogo ativo, GitHub ou produção. A implementação continua com o Claude.

## Arquivos

- `01-laboratorio.csv`: 2 registros e 13 colunas.
- `02-precos-brasil.csv`: 60 registros na ordem solicitada e 16 colunas.
- CSV UTF-8, separador ponto e vírgula, decimais com ponto. Preservar URLs, data e observações.

## Regra obrigatória: Duramix não é Synthetic Gut

O registro de laboratório `Tecnifibre / Duramix HD 16` pertence exclusivamente à Duramix HD, bitola 1.30 mm, construção nylon/poliéster. Seus valores confirmados são rigidez 162.3 lb/in, perda de tensão 34.1% e spin potencial 2.2, no ensaio TWU de 51 lb/Fast.

NÃO copiar esses números para Tecnifibre Synthetic Gut. NÃO criar alias, equivalência, fallback de laboratório nem correspondência aproximada entre os dois nomes. Se a Duramix não estiver no catálogo, manter esta linha apenas como referência de pesquisa até decidir cadastrar uma corda separada. Os campos laboratoriais da Synthetic Gut continuam vazios nesta rodada. Sua linha de preços também continua sem preço confirmado.

Para Babolat RPM Power, somente a bitola 1.25 mm está confirmada na página TW citada. Rigidez, perda de tensão, spin potencial e notas de playtest continuam vazios. Não estimar valores com base em outras RPM ou em avaliações de consumidores.

## Como usar somente dados confirmados

1. Fazer correspondência pelo fabricante, modelo exato, bitola e formato. Não juntar famílias ou variantes como ALU Power Vibe/ALU Power, Lynx Tour/Lynx, Hawk Touch/Hawk ou RPM Rough/RPM Blast.
2. Campo vazio significa desconhecido: manter vazio ou null conforme o esquema existente. Não converter ausência de medida ou preço em zero. Os zeros de `n_lojas_set` e `n_lojas_rolo` são contagens de cotações válidas nesta pesquisa, não prova de inexistência comercial.
3. Não apagar dados previamente confirmados por causa de campos vazios desta rodada. Em conflito, preservar as duas proveniências e conferir a fonte antes de substituir.
4. Os preços são um retrato de 22/11/2026. As faixas usam uma cotação selecionada por loja e formato, priorizando a bitola pedida. Bitolas alternativas e metragem diferente estão em `obs`. Não aplicar preço de outra bitola como se fosse da bitola recomendada.
5. Sets têm metragem confirmada de 12 ou 12.2 m. Rolos têm 200 m, salvo Topspin Cyber Blue: 300 m. Não dividir preço de rolo para inventar preço de set nem calcular descontos Pix não publicados.
6. X-One Biphase e Multifeel: os preços de set da ProSpin estão ESGOTADOS. Topspin Cyber Blue: rolo ESGOTADO. Podem servir como histórico identificado, nunca como oferta comprável ou disponível. Se o esquema não suporta disponibilidade, deixar esses preços fora das ofertas ativas até implementar esse campo.
7. Todos os campos Mercado Livre estão vazios: anúncio e reputação do vendedor não foram validados. URLs de pesquisa ou produto NÃO comprovam afiliado validado. Esta entrega não autoriza criar botões de compra nem alterar as regras de afiliados.
8. Sets ProSpin de RPM Blast foram excluídos por trecho descritivo citando Rough. Sets sem metragem confirmada, como NRG2 da Spin Top e Sonic Pro pesquisado, não entraram nas faixas. Não reintroduzir essas ofertas automaticamente.
9. As métricas laboratoriais são medições TWU, não notas de playtest. Os campos de notas de playtest deste CSV estão vazios. Não transformar avaliações de clientes em notas do laboratório.

## Cobertura e limites

- Sets: 0 cordas em 3 ou mais lojas, 39 em 1 ou 2 lojas, 21 sem preço confirmado. As 39 incluem os 2 sets esgotados explicitamente marcados.
- Foram tentadas consultas a ProSpin, Empório do Tenista e iTenis para as 60 cordas, com complementos da Spin Top. Três tentativas não equivalem a três cotações confirmadas.
- Mercado Livre e Amazon bloquearam leitura; Casa da Raquete não abriu; Decathlon retornou página indisponível; iTenis limitou parte das buscas; Centauro não teve cotação validada.
- Não interpretar mínimos/máximos como extremos de todo o mercado brasileiro. São os extremos das cotações selecionadas e documentadas nesta pesquisa.

## Evidências locais para conferência

Os originais estão na pasta pai `pesquisa-cordas-2026-11-22-rodada2/`: `consultas.json`, `produtos.json`, `auditoria-final.json`, `ofertas-extraidas.json`, `twu-all.json`, `twu-all.html` e os HTMLs de buscas e produtos. `auditoria-final.json` relaciona as cotações selecionadas aos arquivos e URLs. Consultar esses arquivos em caso de dúvida antes de integrar.

Antes de eventual publicação, seguir as regras do projeto: conciliar versão no ar, GitHub e entregas do Claude/Codex, coordenando com quem estiver publicando. Este pacote não executa publicação.
