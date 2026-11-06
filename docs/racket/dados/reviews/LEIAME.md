# Reviews de raquetes: camada bruta e derivada

Base de evidências de reviews do RACKET DNA. Fica neste repositório, sem outro repositório, para que Claude, ChatGPT/Codex e o Gui revisem pelo mesmo histórico do git.

## Regras
1. **`bruto/` é imutável.** Cada arquivo entra uma vez, como chegou, com data e origem no nome, e não é editado depois. Correção é registro novo na camada derivada, nunca edição do bruto.
2. **Nota publicada não vira nota de IA.**
   - Número publicado pelo site fica em `notas_originais`, com a escala original (10, 100, 20 ou 5).
   - Sentimento de −2 a +2 é interpretação de quem anotou (ChatGPT, Claude) e fica em `sentimento_interpretado`, com o anotador registrado.
   - Campo vazio é desconhecido; zero é neutro.
3. **Laboratório é separado de quadra.** Índice de laboratório (ex.: Diagnostic Center da SuperTennis) vai em `indices_laboratorio`, nunca em `notas_originais`.
4. **Fonte independente ≠ registro.**
   - Artigos diferentes da mesma publicação são uma `familia_fonte`.
   - O texto da Tennis Warehouse republicado em TW Europe, Tennis Only ou em URL de pintura especial é o mesmo `grupo_duplicado` e conta uma vez.
   - Review comparativa de várias versões tem peso total 1.
5. **Versão e geração não se transferem sozinhas.** 97L, 97S/LS, 100L, 100SL etc. ficam com o próprio `variant_id`. Nota de uma variante não vai para outra sem regra explícita e testada.
6. **Ano** é o de publicação quando confirmado; senão vazio. **Nível do testador** só quando declarado. "Perfil do jogador" é público-alvo, não nível.
7. **Quarentena.** Valor publicado implausível (ex.: TennisAddict EZONE 100 2018, conforto 2.2/20) fica preservado no bruto e marcado `quarentena` até conferência. Não é corrigido em silêncio.
8. **Página verificada.**
   - `base: "pagina"` só quando a página foi aberta e o conteúdo lido, com `verificado_em`.
   - Resumo de busca é `base: "snippet"` e não alimenta nota.
9. **Geografia.** Os 10 mercados são EUA, Reino Unido, Alemanha, França, Espanha, Itália, Japão, Austrália, Brasil e Argentina. Fora deles: `geografia: "excecao"` (ex.: Tennisnerd, sede em Malta).

## Arquivos
| Arquivo | O que é |
|---|---|
| `bruto/lote1-chatgpt-2026-11-06.csv` | 75 reviews (Pro Staff 97, Blade 98, Clash 100, Speed, EZONE 100), coletadas pelo ChatGPT/Codex com página aberta; CSV `;`, 18 colunas. SHA-256 `af8723270c1c295b19cb6f95b4a36e3d7834cf4f05f2441b619966b6ca427064` |
| `bruto/pr93-snippets-2026-11.json` | 1.028 registros da PR #93, tirados de resumos de busca (`base: snippet`). Só para deduplicar URL e mapear lacunas; não alimenta nota |
| `bruto/lote2-claude-paginas-*.jsonl` | Coleta com páginas abertas pela sessão auxiliar (quando houver) |
| `derivado/reviews.json` | Gerado por `racket/tools/reviews.py`: schema abaixo, grupos de duplicata, quarentena e elegibilidade |
| `derivado/cobertura.md` | Contagens por família, geração, fonte independente e país; lacunas |

## Schema derivado (um objeto por registro)
`registro_id`, `arquivo_bruto`, `linha_bruta`, `model_id` (família do catálogo), `variant_id`, `geracao`, `cabeca`, `massa_g`, `padrao`, `ano_publicacao`, `verificado_em`, `url_canonica`, `site`, `familia_fonte`, `pais`, `geografia` (`mercado`/`excecao`), `grupo_duplicado`, `revisor_id`, `nivel_revisor`, `tipo` (`playtest`/`editorial`/`laboratorio`/`cliente`/`forum`/`video`), `metodo_nota` (`publicada`/`laboratorio`/`interpretada`/`nenhuma`), `escala_original`, `notas_originais`, `indices_laboratorio`, `sentimento_interpretado` + `anotador`, `notas_normalizadas_0a1` (derivada, explícita), `notas_evidencia`, `base` (`pagina`/`snippet`), `elegibilidade` (`elegivel`/`quarentena`/`so_contexto`/`excluido`) + `motivo`.

## Como o motor usa (branch `claude/racket-revisao-motor`)
- Nenhuma review isolada favorece nem exclui uma raquete. Um sinal de review só mexe no ranking quando há pelo menos duas famílias de fonte independentes concordando no mesmo sentido; sem isso, o efeito é zero.
- Ausência de review não é penalizada.
- Testes em `racket/tools/regressao.mjs`: remoção de fonte e invariância a evidência isolada.
