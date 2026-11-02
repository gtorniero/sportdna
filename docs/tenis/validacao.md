# RUN DNA — validação contra casos de especialistas (nov/2026)

Documento interno.

## O conjunto
304 casos “para este tipo de corredor, os especialistas indicam estes tênis”, tirados de guias de quem testa de verdade (`dados/casos.json`):
- **Asfalto:** 151 casos de 12 fontes (RunRepeat, RTINGS, Solereview, Marathon Handbook, Outside, Believe in the Run, OutdoorGearLab, Doctors of Running, Tom's Guide, The Run Testers, Fleet Feet, Running Warehouse).
- **Velocidade e trilha:** 102 casos de 18 fontes (inclui iRunFar, Runner's World EUA e Alemanha, Road Trail Run, Trail Runner, REI).
- **Brasil:** 51 casos de 25 guias (Centauro Arena, Webrun, Ativo/O2, Forbes, CNN Brasil, Exame e outros; vários são varejo ou afiliados, com peso igual por enquanto).

Formato: `{"fonte","url","data","categoria_original","grupo","perfil":{peso,largura,dor,pisada,nivel,km_semana,terreno,objetivo,ritmo,sensacao,prioridade,desconforto_neutro,orcamento_usd|orcamento_brl},"recomendados":[{"original","no_catalogo","posicao"}]}`.

Limites: coleta só pelos trechos das buscas (os sites bloqueiam leitura direta neste ambiente), gerações às vezes misturadas e normalizadas para a do catálogo, 70 casos sem nenhum indicado no catálogo (Saucony, Altra, Topo, La Sportiva). Ficam 234 casos úteis.

## Métricas
- **Top 3:** algum tênis indicado pelos especialistas está no nosso pódio.
- **Top 10:** algum está no nosso top 10.
- **MRR:** 1 ÷ posição do melhor indicado no nosso ranking.
Divisão fixa: 1 em cada 3 casos só para teste.

## Resultado (234 casos)
| Etapa | Top 3 | Top 10 | MRR | Top 3 no teste |
|---|---|---|---|---|
| Motor antes desta rodada | 16% | 36% | 0,155 | 14% |
| Leitura dos casos corrigida (prova = avançado com rodízio; “daily running” ≠ uso casual; guias de US$ 100 = entrada) e regra de par de prova | 21% | 48% | 0,205 | 19% |
| Pesos calibrados (leveza 1,8; usos 2,4; contraindicação 6 e teto 12; clientes 0,7) | 26% | 47% | 0,217 | 23% |
| Auditoria de 63 modelos, contradições resolvidas, categorias vizinhas, ressalvas leves fixas e nova calibração (rodada 6) | **31%** | **54%** | 0,287 | **30%** |

Para comparação, sortear 3 tênis do catálogo acertaria perto de 2%.

## Marcas depois da rodada 6 (top 3 nos 234 casos: especialistas × nós)
ASICS 26 × 23 · Nike 21 × 21 · Hoka 11 × 10 · adidas 9 × 9 · New Balance 9 × 9 · Brooks 8 × 6 · Puma 6 × 0,4 · Olympikus 5 × 6 · Mizuno 4 × 10 · On 1 × 4. Puma aparece nos guias quase só como supertênis de prova (Fast-R Elite 3, Deviate Elite 4), onde concorre com outros 29.

## Diagnóstico que ficava antes da rodada 6
- **Categoria errada** ainda explica cerca de 1 em cada 5 erros, quase todos em velocidade: os guias respondem “qual o melhor tênis de prova”, o questionário pergunta “qual tênis para mim”.
- **Marcas** (nossas indicações × especialistas, top 3): ASICS 17% × 26%, Nike 12% × 21%, Brooks 3% × 8%, Puma 1% × 6%; Mizuno 14% × 4%, New Balance 17% × 9%. Uma calibração que tentava aproximar as marcas só pelos pesos não mudou quase nada: a diferença está nos dados dos modelos (etiquetas e notas), não nos pesos. Próxima rodada: revisar as etiquetas “não indicado” e as notas de Nike, ASICS, Brooks e Puma com as fontes destes casos.
- **Catálogo:** Saucony (Hurricane, Ride, Guide, Endorphin, Peregrine), Altra, Topo e La Sportiva são muito citadas pelos especialistas e não estão no catálogo.

## Segurança (5.000 perfis sorteados)
Pódios com 2 ou mais contraindicações sérias: 130 → 61; com 1 ou mais: 1.545 → 990.
