# Modelo de recomendação — guia para os apps SPORT DNA (nov/2026)

Documento interno, feito a partir do RUN DNA (`docs/tenis/modelo.md`) para ser reaproveitado no RACKET DNA e no SURF DNA.

## Estrutura que funciona
1. **Perguntas → perfil.** Respostas viram derivados: nível, traços (para cruzar com reviews) e um vetor ideal de 6 índices (o mesmo do hexágono do relatório).
2. **Categoria antes do produto.** Regras escolhem 1ª e 2ª categoria; o produto compete dentro delas.
3. **Placar com pesos nomeados.** Todos os pesos numa tabela única (`PESOS`), com comentário de origem: regra de produto, ciência ou calibrado.
4. **Specs × perfil, assimétrico.** Faltar o que a pessoa precisa pesa mais que sobrar.
5. **Reviews como evidência.** Etiquetas “indicado para” e “não indicado para” vindas de 2+ reviews; nota puxada para a média quando há poucas reviews; dado de ficha e preço estimado valem menos que medida de laboratório e preço real.
6. **Segurança primeiro.** Contraindicações de saúde e encaixe pesam muito e têm teto alto; o resultado nunca promete prevenção de lesão.

## Ciência
Para cada regra, uma linha: o que a literatura diz, força da evidência e a decisão (manter, reduzir, retirar). Modelo: `docs/tenis/ciencia.md`.

## Validação e calibração
- **Casos de especialistas:** guias “melhor X para Y” de quem testa, traduzidos para o perfil do questionário (`docs/tenis/validacao.md`). Meta: 300+ casos de 10+ fontes.
- **Métricas:** top 3, top 10, MRR; 1 em cada 3 casos só para teste.
- **Calibração** (`run/tools/calibrar.mjs`): descida coordenada nos pesos, aceitando mudança só se melhora o total e 2 de 3 partes; pesos de saúde com piso.
- **Antes de aceitar:** testes de viés (distribuição de marcas × especialistas, contraindicação séria em 5.000 perfis, casos de referência).
- **Leitura dos casos importa:** erros de tradução do perfil (ex.: “tênis de prova” sem nível) parecem erro do motor. Revise os casos que mais erram antes de mexer nos pesos.

## Próximo nível
Validação com 30 a 50 usuários reais (o motor acerta o que eles gostam?) e notas de clientes de lojas brasileiras como camada separada.
