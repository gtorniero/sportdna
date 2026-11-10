# Reconciliação após recuperação do GitHub

Rodada 13 e correção 775cf1f preservadas na fonte publicada, checkout/medição e navegação SURF. Fonte: sportdna-site cf0b84a5-6cbb-418b-9507-35fdaf62a9a2. Workflow legado Pages desativado, pois a hospedagem foi migrada para Cloudflare. 16 testes de checkout/medição passaram. O teste SEO de igualdade com HEAD anterior acusa as mudanças de motor esperadas; três outros testes SEO passaram. Regressão visual completa pendente.

## Estado e limites

Esta branch recupera trabalho publicado enquanto o GitHub estava indisponível; não é uma publicação nova. As versões do site cf0b84a5 e de pagamentos 8130c77b foram confirmadas ativas em leitura autenticada da Cloudflare em 09/11/2026. Não restaurar bancos, segredos ou configurações de staging sobre produção. Históricos pessoais, dumps, conversas e credenciais ficam fora do repositório público. Preservar as branches anteriores; não reaplicar PRs antigos sem comparar o conteúdo.

## Consulta ao Claude

Históricos originais consultados em 09/11/2026: Quiddo (links institucionais já entregues), Retrozap Admin (remoção da etapa conferir já entregue), RACKET (rodada 13 e correção preservadas) e SURF (maroleira e quiver já incorporados). Ausência de um commit no GitHub não significa ausência da mudança em produção.

## Backend e publicação reproduzível

Recuperados também o entrypoint financeiro privado e a correção de data de conversão Meta do backend publicado, com os testes correspondentes. `node scripts/package-site.mjs` produz apenas a lista permitida de assets em `dist/site`; `wrangler.site.jsonc` aponta para o serviço existente. Não publicar a raiz do repositório: ela contém fontes do servidor e material interno. Site e pagamentos não estão conectados ao GitHub Builds; salvar/mesclar este PR não altera essas implantações.

## Verificação de 09/11

Os 226 arquivos gerados pelo empacotador têm os mesmos hashes do pacote publicado. Passaram 53 testes do backend (incluem casos executados em mais de uma entrada), 16 de checkout/medição e o teste RPC financeiro isolado. O teste RPC utiliza Miniflare 4; para toolchains com Miniflare 5, fornecer `MINIFLARE_TEST_MODULE` apontando para uma instalação compatível. Sem chamadas de pagamento reais.

## Atualização concorrente conciliada

Após autorização de Gui, main recebeu #96 (checkout novo e bloqueio do fallback simulado em produção) e #104 (desativação Pages). Conciliados sobre a recuperação, preservando revisão SURF, medições e backend financeiro. Os 16 testes de checkout/medição passaram novamente. A nova interface de checkout precisa de publicação Cloudflare; a igualdade dos 226 hashes descrita acima se refere à recuperação anterior a esta atualização.
