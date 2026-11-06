# RACKET DNA: revisão do modelo, regra por regra (rodada 12, branch de revisão)

Base: `main` em `aa10ad2` (no ar). Branch: `claude/racket-revisao-motor`, sem PR, merge ou deploy.

**Decisão:** **manter**, **corrigir**, **testar** (hipótese que precisa de teste em quadra ou de dado novo antes de mexer) ou **retirar**.

**Situação:**
- **implementado nesta branch:** código mudou e está coberto por `racket/tools/regressao.mjs`;
- **só auditado:** documentado, sem mudança de código.

**Leitura obrigatória:**
- Nada aqui foi validado em quadra. As simulações (`calibrar.mjs`, `vies.mjs`, `regressao.mjs`) mostram o que as regras fazem, não se a escolha ficou melhor.
- Os números do `PESOS` são decisões de produto calibradas contra casos de especialistas e reviews. Não são coeficientes clínicos nem biomecânicos validados.

## 1. Entradas (questionário)
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Intensidade e limitação da dor perguntadas também a quem marcou "já tive, hoje não" | `Q` pain/lim | **corrigir** | Misturava histórico com estado atual; quem já teve dor forte recebia regra mais dura que quem tem dor leve hoje | implementado: só aparecem com dor hoje |
| Histórico de dor sem pergunta própria | `Q` | **corrigir** | O histórico precisa ficar registrado sem virar regra de dor atual | implementado: `painPast` (como era) e `painAgo` (há quanto tempo); vão ao relatório, sem efeito numérico |
| Código antigo com "já tive" + intensidade | `cleanAnswers` | **corrigir** | Ambíguo, mas não contraditório | implementado: intensidade antiga vira histórico, marcado "veio de uma resposta antiga" |
| Código antigo com "já tive" + "em tratamento ou parado" | `cleanAnswers`, `painNote` | **corrigir** | Contraditório; não escolhemos estado clínico pela pessoa | implementado: marca `painConflito`, aplica só regras de histórico e pede revisão da etapa Braço. Revisar não gasta pagamento nem a edição única |
| Altura e peso corporal | `targetWeight` (±8/+6 g e −6/+5 g) | **testar** | A pesquisa não acha equação adulta validada; o efeito é pequeno e limitado | só auditado |
| Força percebida | alvo (`forca`) e peso (−12/+8/+12 g) | **testar** | Direção plausível (atraso no golpe), sem coeficiente validado. Soma com fôlego, nível e swing para a mesma capacidade | só auditado |
| Fôlego, anos de jogo, nível, swing | alvo e peso | **testar** (contagem dupla) | Vários bônus medem a mesma capacidade; a pesquisa desaconselha somar | só auditado |
| Frequência | só na troca de corda (`:1609`) | **manter** | Não mexe no ranking | só auditado |
| Sexo | não é perguntado | **manter fora** | Sem regra encontrada de −g por sexo; usar só para auditar resultados por grupo, se um dia for coletado | só auditado |
| `headp` (cabeça preferida) | `zones`, `penalties` | **retirar** (código morto) | A pergunta saiu a pedido do dono; o código ficou sem efeito porque `A.headp` nunca é preenchido | só auditado (remoção trivial, deixada para não misturar com esta rodada) |
| Raquete atual + "como sente" (pesada/leve) | alvo, peso, swingweight, `atualPesada/Leve`, `salto`, `naoGanha` | **manter + testar** | É a âncora mais útil (a pesquisa propõe partir da atual). Falta perguntar o que preservar e onde ela falha (atrasa, torce, falta profundidade) | só auditado; proposta na seção 10 |

## 2. Catálogo e fichas
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Campos estimados tratados como medidos | `CATALOG` | **corrigir** | 25 das 121 versões novas têm valor estimado a partir da versão irmã (balanço 14, RA 11, SW 8; peso 0), marcado só em `catalogo-versoes.md` | implementado: campo `est` em cada ficha e aviso no relatório. Não muda nota |
| Sem origem, data, eixo e estado (com/sem corda) por número | `CATALOG` | **corrigir** (estrutura) | A pesquisa pede origem, método e eixo do SW; hoje não há | só auditado |
| SW deduzido de massa e balanço | — | **não fazer** | A mesma massa e o mesmo centro de massa admitem distribuições diferentes | só auditado: nenhum SW foi calculado assim; os estimados vieram da versão irmã |
| Preços | `PRECO` | **manter** | Fora do escopo desta rodada | só auditado |

## 3. Índices e a contagem de massa, balanço e SW
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Os 6 índices vêm de cabeça, RA, SW, massa, padrão e balanço | `idx` | **manter** | Direções conhecidas (física e reviews), pesos de produto | só auditado |
| Massa e SW entram em quase todos os pontos (ver lista abaixo) | `idx`, `zones`, `penalties`, `compute` | **testar** (agrupar) | Contagem tripla da mesma grandeza; a pesquisa recomenda tratar massa, SW e balanço como um grupo | só auditado: exige redesenho e dado de quadra |
| Tecnologia de amortecimento | `indice.tec*` (0,03/0,04) | **manter** | Já reduzida na rodada 6; evidência fraca | só auditado |
| `SPINY` (nome da linha dá bônus de spin) | `idx` | **testar** | Usa nome comercial como proxy; é bônus por marca/linha sem medição | só auditado |

Onde massa e SW entram hoje:
- **Índices:** manobra, estabilidade, conforto, potência e braço.
- **Zona do mapa:** ±2 pontos de Match.
- **Penalidades:** peso fora do ideal, SW fora da faixa, raquete leve para braço com dor e raquete pesada para força baixa.

## 4. Força, idade e peso ideal
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Penalidade extra a 310 g+ só por ter 60+ | `pen.pesadaFraco.idade` | **retirar** | Degrau sem base: 59 e 60 anos davam rankings diferentes, e a raquete punida estava dentro da faixa de peso que o próprio motor calculou | implementado; T6 garante 59 = 60 = 61 |
| A mesma penalidade para força baixa | `pen.pesadaFraco` | **manter + testar** | Coerente com "chega atrasado", sem número validado | mantido; T7 |
| Alvo de conforto +1,5 aos 45 e de manobra +2,25 aos 55; peso −10 g aos 55 | `alvo.idade`, `peso.senior` | **testar** | Também são degraus etários sem regra de "−g por década" nas fontes; o ideal é transição suave ou nenhuma | só auditado (o pedido foi tirar só o de 60) |
| Juvenil (< 14 anos): aviso, catálogo adulto | `juvenil` | **manter** | Lacuna declarada: não há quadros juvenis | só auditado |
| Piso adulto 258 g e piso de 280 g com dor hoje | `peso.adultoMin`, `peso.dorHojeMin` | **testar** | Coerente com a massa reduzir choque no modelo de Cross, mas isso não demonstra menos dor | só auditado |

## 5. Dor no braço
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| "Dor forte" acionada pelo histórico | `dorForte`, alvo, zona, penalidade, corda, aviso | **corrigir** | Histórico virava dor atual | implementado; T1 a T5 |
| Limites de RA da zona: forte 60, hoje cotovelo 62, hoje 63, passado 66, nenhuma 72 | `zona.raMax` | **testar** (são de produto) | Não há ponto de corte clínico de RA. Hoje só desenham a faixa do mapa; a zona que conta no ranking usa só peso e SW | só auditado; nenhum limite novo foi criado |
| Penalidades de RA: hoje 62/65, passado 66, forte 60 | `pen.raHoje`, `pen.raPassado`, `pen.raForte` | **testar** | Mesma ressalva. "Passado 66" continua valendo para todo histórico, forte ou leve, sem diferença numérica | só auditado |
| Raquete leve (< 275 g) para quem tem ou teve dor | `pen.bracoLeve` | **testar** | Direção do modelo de impacto, sem desfecho clínico | só auditado |
| Bônus de raquete amigável ao braço (hoje/passado) | `placar.braco` | **testar** | Índice de braço é construção de produto | só auditado |
| Aviso de "dor forte ou em tratamento" e orientação profissional | `painNote` | **manter** | Correto para dor atual que limita | implementado: só com dor atual. Histórico ganhou texto próprio |

## 6. Zona, promoção, família e escala de DNA
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Zona = peso ± 8 g e SW ± 6 do ideal; alarga até caber 3 raquetes | `zones`, `compute` | **manter + testar** | Coerente com "faixa ampla em vez de ponto"; os ±8/±6 são de produto | só auditado |
| Zona vale ±2 pontos | `match.zona` | **manter** | Pequeno; reduzido na rodada 8 | só auditado |
| Promoção da melhor da zona se estiver até 10 pontos atrás | `match.promoverZona` | **testar** | Pode passar por cima de 10 pontos de diferença. Ocorreu em 30 posições de top 3 nos 218 perfis da regressão | só auditado |
| Uma versão por família no ranking, demais como "também existe" | `compute` | **manter** | Evita lotar o top 3 com a mesma linha | só auditado |
| Escala de DNA: a 1ª fica entre 90 e 96 | `match.escala*` | **corrigir** (apresentação) | É escala relativa, não probabilidade. Diferença de 1 ponto não significa nada e cria precisão falsa | só auditado; proposta: mostrar "empate técnico" quando a diferença bruta for de 1 a 2 pontos |
| Confiança (70 a 97) | `match.conf*` | **testar** | Conta respostas e distância entre 1ª e 5ª; não é calibrada | só auditado |

## 7. Orçamento e disponibilidade
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Penalidade progressiva acima do orçamento e +3 dentro dele | `pen.orcamento`, `placar.dentroOrcamento` | **manter** | Restrição explícita do usuário. A pesquisa sugere filtrar antes de pontuar | só auditado |
| "Difícil de achar no Brasil" (−12) e "pouca oferta" (−2) | `pen.dificilAchar`, `pen.poucaOferta` | **manter** | Só vale quando a pessoa prefere comprar no Brasil | só auditado |
| Custo de corda e serviço fora do preço | — | **testar** | A pesquisa sugere custo do conjunto pronto | só auditado |

## 8. Iniciantes
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Peso ideal 270 g, SW até 312, cabeça 100–107, −6 para cabeça < 100 | `peso.nivel.beg`, `zona`, `pen.cabecaIniciante` | **testar** (faixa ampla) | As fontes têm faixas largas e sobrepostas: LTA 250–300 g, USTA 269–312 g, cabeça 105–115 ou 98–105. Mostrar uma faixa e duas demos, sem um número ideal | só auditado |
| Penalidade de −15 para cabeça ≥ 110 em quem não é iniciante | `pen.cabeca110` | **manter** | Coerente com as faixas comerciais | só auditado |

## 9. Corda, tensão e explicações
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Multifilamento 48 lb para dor forte | `stringSetup` | **corrigir** (gatilho) e **testar** (número) | Só com dor atual agora. Os 48/50 lb são de produto: o estudo de tensão mediu aceleração (−25% de 245 para 200 N), não dor, e misturar material e tensão impede atribuir causa | gatilho implementado; número só auditado |
| Ajustes de ±1 a ±2 lb | `stringSetup` | **testar** | Hipóteses de produto; −2 lb não tem efeito clínico demonstrado | só auditado |
| "Dentro do limite para quem já teve dor" também para quem tem dor hoje | `whyPara` | **corrigir** | Texto errado para dor atual | implementado |
| Histórico no relatório e no resumo do perfil | `painNote`, perfil | **corrigir** | O histórico precisa ficar visível | implementado |

## 10. Evidência de reviews
| Regra | Onde | Decisão | Por quê | Situação |
|---|---|---|---|---|
| Aprovação da TW decide sozinha | `r.q` | **corrigir** | Uma fonte só favorecia ou enterrava raquetes | implementado: só com 2+ famílias de fonte na mesma direção, e mais a favor que contra; T8 a T10 |
| Ajuste de perfil (6 índices) pela TW sozinha | `idx` | **corrigir** | Mesmo motivo | implementado: atributo a atributo, só com 2+ famílias concordando |
| Penalidade por não ter review (−6) | `match.semReview` | **retirar** | Penalizava ausência | implementado; T11 |
| Herança de aprovação do modelo-pai para versões leves | `PAI`, `parent` | **retirar** | Passava nota de uma versão para outra (97L, 100L etc.) | implementado |
| Sites da rodada 1 (RV) | `RV` | **manter como UMA família** | É agregado sem URL; não dá para saber quantas fontes independentes há dentro | só auditado |
| Lote 1 do ChatGPT (75) | `docs/racket/dados/reviews/` | **incorporar com critério** | Camada bruta imutável. 22 registros elegíveis (página aberta e mesma geração do catálogo; os da TW não entram no EVID porque a TW já é a família do TWD). À parte, 3 da TennisAddict (162, 163, 164) foram conferidas pelo Codex no site original, a pedido do Gui: enriquecimento de URLs que já estavam na #93, 1 em quarentena, 52 só como contexto | implementado: entram só como direção (EVID) |
| Lote 2 da sessão auxiliar (273, página aberta) | idem | **incorporar com critério** | 109 elegíveis (versão confirmada dentro da família); 33 comparativas ficam só como contexto; TW nova não substitui o TWD antigo (mesma família) | implementado; trocar o TWD pelas notas novas de painel é o próximo passo |
| Complemento do usuário (Ripstick 100 300 g, 2021) | idem | **contexto** | Geração 2021 não passa para a 2025 do catálogo; a TennisAddict já estava na triagem (duplicata); a Tennisnerd é URL nova, sem nota e não aberta por Claude | implementado (errata + complemento) |
| Triagem do Codex (518) | idem | **triagem** | ID candidato não confirma geração; atributos podem ser de um testador | implementado: preservada e mapeada pelo título (221 prováveis), sem entrar no motor até conferir painel e geração |
| Remover uma fonte inteira | `regressao.mjs` | **monitorar** | A TW ainda é a fonte que mais mexe no ranking. Sem ela, o top 1 muda em 104 de 218 perfis | relatório na regressão |

## 11. O que precisa de quadra
- **Demos pareadas:** a atual contra duas candidatas, em ordem sorteada, com a mesma corda e a mesma tensão.
- **Comparar três motores:** o atual, uma linha de base "mais próxima da atual" e o proposto.
- **Desfechos:**
  - a fração que prefere a 1ª recomendação à referência;
  - a fração cuja preferida está no top 3;
  - profundidade, dispersão e esforço no fim da sessão;
  - desconforto relatado durante e depois.
- **Separados:** material e tensão da corda testados à parte do quadro.
- **Segurança:** nada de teste provocativo com quem tem dor que limita o jogo.
- **Jogadores sem referência** (iniciantes) entram inteiros na validação, não só por regra.
