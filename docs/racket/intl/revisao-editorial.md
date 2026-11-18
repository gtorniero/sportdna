# RACKET DNA internacional: revisão editorial do inglês

Revisão independente, feita em 18/11/2026 depois da implementação técnica. O revisor leu os 1.517 textos de `racket/tools/i18n/en.json` e a página montada.

## Resultado

Overall the English is good: accurate, mostly fluent, and it already uses the right tennis vocabulary (swingweight, RA, mains/crosses, gauge, restring, overgrip, lead tape at 3 and 9). The problems were mostly calques from Portuguese ('saída de bola' → 'livelier string bed', 'quem sente o braço', 'bola pesada' → 'heavy balls', 'your swing gets late', 'shakes', 'from the factory', 'Ready-made example', 'expert cases') and a few stiff UI phrases ('report is redone', 'Tell us your racket'). I fixed two rendering bugs: 'NTRPscale' (missing space after the NTRP glossary button) and '2· # Babolat' on the alternative cards. Regional spelling: -ize/-ise words, center/centre, favorite, defense and program were replaced with neutral wording ('mishits', 'clean contact', 'reading your answers', 'short summaries', 'custom', 'go-to'), and 'physical therapist' (US-only) became 'a doctor or other health professional'. Consistency: one term per concept (DNA Score, heavy shots, mishits, grip size too big/too small, review sites, expert picks, 7-day money-back guarantee, Specs vs. the catalog). Commercial copy is calm and honest, with no fake urgency (the patches already removed 'limited-time offer'). Prices are now labelled 'approximate' because most non-US prices are converted. Open decisions are in flags: a review blurb that says a racket 'cured' tennis elbow, the hard-coded guarantee wording and missing terms, USD pricing outside the US, unvalidated country availability, A4-only PDF and Brazil-facing contact details.

- 155 trocas aplicadas no `en.json`, todas conferidas contra o texto atual.
- Duas trocas feitas à mão: a garantia, que fica no `patches.mjs`, passou a dizer "7-day money-back guarantee" e "within 7 days of purchase"; o trecho de review "cured their tennis elbow" virou "Felt it was easier on their tennis elbow".
- Depois das trocas, o build, a paridade P1–P4, o teste do checkout (9/9) e o navegador (US e GB, 390 e 1000 px, claro e escuro, axe 0) passaram de novo.

## Decisões de termos

| Termo | Decisão |
| --- | --- |
| racket | Always 'racket' (never 'racquet'), matching the RACKET DNA brand. |
| frame | 'Frame' for the racket model as a physical object (Modelo); 'model' for the name/version. |
| swingweight | One word, lowercase in running text; 'SW' only in tight data rows. |
| stiffness (RA) | 'Stiffness' + number + 'RA' (e.g. 'Stiffness 68 RA'); 'stiff/flexible' for frames, 'firm/soft' for feel. |
| balance | 'head-light' / 'head-heavy' (hyphenated); mm is the engine's unit, the 'pts HL/HH' conversion is shown in the specs table. |
| head size | 'Head size' + 'sq in'; 'oversize' for large heads. |
| string pattern | 'String pattern', 'mains × crosses', 'open' vs 'dense' (not 'closed'). |
| power / pop | 'Power' as the attribute; 'pop' for the ball coming off the strings livelier (replaces the calque 'saída de bola'). |
| control, spin, comfort, stability | Attribute names as-is; 'Arm Comfort' (capitalized) only for the index. |
| maneuverability | Keep 'maneuverability' (Tennis Warehouse spec usage) as the attribute name; UK/AU would write 'manoeuvrability' (see flags). |
| mishits | Use 'mishits' instead of 'off-center hits' everywhere (avoids center/centre). |
| sweet spot | 'Sweet spot' (two words); 'clean contact' instead of 'centered contact'. |
| heavy shots | 'heavy shots' / 'a heavy ball' for opponents' pace-and-spin, not 'heavy balls'; 'a heavier ball' only for the player's own shot. |
| gauge | 'Gauge' with mm first and US gauge in parentheses: '1.25 mm (17)'. |
| tension | 'Tension' in lb, kg in secondary text; 'string job' / 'restring' for the act. |
| restring | 'Restring' (verb), 'restringing' (noun); never 'change the strings'. |
| playtester | 'Playtester' for Tennis Warehouse-style testers in headings and counts; 'tester' is fine as a second mention. |
| review sites | 'review sites' (not 'websites') for Tennisnerd, Tennis Companion, etc. |
| expert picks | Replaces 'expert cases' everywhere. |
| grip size | 'Grip size' when talking about handle thickness; handles 'feel too big / too small' (not thick/thin in quiz answers). |
| overgrip | One word. |
| stock / out of the box | 'Out of the box' for unmodified retail frames; 'custom' / 'pro stock' for pros' rackets (no 'customized'). |
| DNA Score | Always 'DNA Score' (never 'DNA match'). |
| comparison | 'Comparison' / 'comparisons' for the comparator feature. |
| test | 'Take the test' / 'Retake the test'; 'questionnaire' only in accessibility labels. |
| shop | 'shop' (works in all four markets, incl. 'pro shop'); avoid 'store'. |
| catalog | Kept as 'catalog' for consistency (UK/AU 'catalogue'); see flags. |
| health wording | 'a doctor or other health professional' instead of 'physical therapist' (US-only). |
| -ize/-ise and other variants | Avoided where a neutral word works: analyzing→reading, summarized→short summaries, customized→custom, favorite→go-to, favored→gave preference to, centered→start at/clean contact, defense→when defending, program→offers demos. |
| money-back guarantee | '7-day money-back guarantee' everywhere it is mentioned. |

## Pontos que pedem decisão de produto ou jurídica

Também estão no checklist de `lancamento.md`.

- Medical claim in a review blurb: key 'Conta que ela curou o cotovelo de tenista.' → 'Says it cured their tennis elbow.' Showing that a racket 'cured' tennis elbow contradicts the product's own disclaimer ('No racket prevents or treats an injury') and is a health claim the engine can't back up. Recommend dropping this blurb or replacing it at the source data level with a non-curative paraphrase (e.g. 'Says their elbow felt better after switching').
- Guarantee text is hard-coded in patches.mjs, not en.json: '7-day guarantee: not happy with your report? Email us within 7 days and we will refund…'. Needs a decision and a written policy: 7 days from what (purchase date?), how to claim, full refund or not, and how this fits UK/AU consumer rules for digital content (right to cancel is usually lost once delivery starts with consent). The footer also says 'Privacy policy and terms in English: coming before launch'; don't sell without them. Also align its wording with the en.json lines that now say '7-day money-back guarantee' and use 'we'll'.
- Currency: UK, Canada and Australia are charged US$9.99 while racket prices show in local currency. That's honest as labeled, but buyers may pay card FX fees. Decide whether to price locally or add a short 'charged in US dollars' note at checkout.
- Country availability claims ('has little retail presence in your country', 'Specialist brand'): locale.js marks this as an unvalidated MVP rule (only ProKennex is flagged, the same for all four markets). Validate it per market, or soften the wording to something that doesn't claim local retail knowledge.
- Prices are approximate: for most rackets the UK/CA/AU prices are US prices times fixed factors (build.mjs), with real local benchmarks for only 14 rackets. I changed the copy to 'approximate', but product should confirm this level of disclosure is enough.
- Ranking position fragment (key 'º lugar ·'): I changed it to ' of 3 ·' (renders '2 of 3 · Babolat'). A cleaner fix is a code patch that prints '#${pos} · ' so it reads '#2 · Babolat'.
- Example sentence uses the generic key 'A' → 'The', so the patched template renders 'The 35-year-old intermediate player who has had pain in the elbow and who plays with a …'. A tpl-scoped key or a patch would let it read 'A 35-year-old intermediate player who has had elbow pain and plays with a …'.
- PDF is A4 only ('Download the report as a PDF (A4)'). US and Canadian users print on Letter; consider a Letter variant for those markets, or drop the '(A4)' label if it still prints well.
- Support and trust signals point to Brazil: contact hi@sportdna.com.br, links to beyondthework.com.br, a Portuguese mailto subject ('Número errado no SPORT DNA') in the 'Spotted a number that looks wrong?' link, and the SEO domain is a .com.br placeholder. Fine for a pre-launch test; fix before marketing to US/UK/CA/AU.
- Pix strings (Pix payment, Pix QR code, copy and paste) and test-checkout strings ('Simulate an approved payment', 'Simulated QR code', Stripe test card 4242) are translated but should never show in production English. They appear unreachable in the current build (card only, Stripe sandbox); keep it that way.
- Regional spellings that have no neutral alternative: 'maneuverability' (UK/AU 'manoeuvrability'), 'catalog' (UK/AU 'catalogue'), 'program' was removed. If you plan separate en-GB/en-AU builds, these two are the only spelling swaps left in the core copy.
- Times like 'at 14:30' in the pending-payment notice use a 24-hour clock; US readers expect '2:30 PM'. Minor code-level formatting fix.
- Dead keys: the guarantee keys 'Garantia de 7 dias:', 'não gostou, devolvemos… artigo 49…' and 'não gostou, devolvemos o valor pago (artigo 49…' are replaced by patches and don't render. I left them as they are.

## Exemplos de trocas

| Antes | Depois | Motivo |
| --- | --- | --- |
| . You see the preview for free and only pay if you want the full report. | . The preview is free, and you only pay if you want the full report. | Smoother, more natural phrasing than 'You see the preview for free'. |
| rackets and against what playtesters wrote about them. Then we check the ranking against e | rackets and against what playtesters wrote about them. Then we check the ranking against e | 'block' recommendations reads as a calque; 'catch' is the natural verb. |
| playtester and website reviews read | reviews read, from playtesters and review sites | 'website reviews' is vague; 'review sites' is the usual term. |
| expert cases, in 3 languages | expert picks, in 3 languages | 'expert cases' is unclear in English; matches 'expert picks' used just above. |
| Specs on the scale | Specs vs. the catalog | 'Specs on the scale' suggests a weighing scale; this says what the feature does. |
| The difference in terms of feel: quicker, softer, more stable. | What the difference feels like: quicker, softer, more stable. | More natural than 'The difference in terms of feel'. |
| Frame, head size, grip, string, gauge and tension. Each one changes power, control and how | Frame, head size, grip size, string, gauge and tension. Each one changes power, control an | 'grip size' is the standard term; 'grip' alone can mean how you hold the racket. |
| factors read for each racket: | factors weighed for each racket: | 'factors read' is a calque; 'weighed' is idiomatic. |
| of your answers, 9 measured specs and 7 indexes per racket | of your answers, 9 measured specs and 7 indexes | Drops the repeated 'per racket' (the sentence already says 'for each racket'). |
| Pro models carry more weight and swingweight. If you play twice a week, your swing gets la | Pro models carry more weight and swingweight. If you play twice a week, you end up late on | 'your swing gets late' is a calque; 'late on the ball' is how players say it. |
| A handle that fits your hand lets you hold it without squeezing, which is usually more com | A handle that fits your hand lets you hold it without squeezing too hard, which is usually | Restores 'too hard' (squeezing is normal; over-squeezing is the problem). |
| A big head to “forgive” mistakes | Going oversize for “forgiveness” | Reads as a mistake headline like the others; 'oversize' is the tennis term. |
| A bigger sweet spot also means a livelier string bed. If you already have a long swing, th | A bigger head also means more pop. If you already have a long swing, the ball flies long. | Technically tighter: a bigger head (not the sweet spot) adds power; 'pop' matche |
| Manufacturer specs and typical retail prices in your country; check the exact model before | Manufacturer specs and approximate retail prices in your country; check the exact model be | Prices are estimates (US prices converted for most UK/CA/AU rackets), so 'approx |
| Everything from the previous version, but easier to swing; spin with control. | Everything the previous version did well, but easier to swing; spin with control. | 'Everything from the previous version' is a calque. |
| Very easy to swing from the baseline; loses stability against heavy balls. | Very easy to swing from the baseline; loses stability against heavy shots. | 'heavy balls' sounds translated; players say 'heavy shots' / 'a heavy ball'. |
| Easy power and spin; comfort is the weak point off-center. | Easy power and spin; comfort drops off on mishits. | 'off-center' has a UK/AU spelling (off-centre); 'mishits' is neutral and idiomat |
| Spin, quick response and easy to play; a good base for customizing. | Spin, quick response and easy to play; a good base for tweaking. | 'customizing' differs in UK/AU spelling (-ise); 'tweaking' is neutral. |
| Unstable against heavy balls, little spin; intermediate players outgrow it fast. | Unstable against heavy shots, little spin; intermediate players outgrow it fast. | Consistent 'heavy shots'. |
| Her favorite Gravity MP: touch, comfort and a mix of control and power. | Her go-to Gravity MP: touch, comfort and a mix of control and power. | 'favorite' vs 'favourite'; 'go-to' is neutral. |
| Low power handles hard-hit balls, but a low launch and some instability. | Low power lets it handle hard-hit balls, but it has a low launch and some instability. | Original was ungrammatical ('Low power handles hard-hit balls'). |
| Better touch and very easy to use; gets pushed around at the net by heavy balls. | Better touch and very easy to use; gets pushed around at the net by heavy shots. | Consistent 'heavy shots'. |
| Comfortable and fast, with easy depth and spin; twists off-center. | Comfortable and fast, with easy depth and spin; twists on mishits. | Avoids off-center/off-centre. |
| Easy pace and spin, good value; twists off-center. | Easy pace and spin, good value; twists on mishits. | Avoids off-center/off-centre. |
| Very comfortable with plenty of spin; inconsistent string bed against heavy balls. | Very comfortable with plenty of spin; inconsistent string bed against heavy shots. | Consistent 'heavy shots'. |
| Comfortable and forgiving off-center; a bit slow to maneuver. | Comfortable and forgiving on mishits; a bit slow to maneuver. | Avoids off-center/off-centre. |
| Precise on clean contact; unstable off-center. | Precise on clean contact; unstable on mishits. | Avoids off-center/off-centre. |
| Easy power and spin on defense; too firm a response for her. | Easy power and spin when defending; too firm a response for her. | 'defense' vs 'defence'; 'when defending' is neutral. |
| Fun, easy to swing and comfortable; flat balls can sail long. | Fun, easy to swing and comfortable; flat shots can sail long. | 'flat balls' sounds translated. |
| Soft, holds the ball and fast; would add weight. | Soft and fast, with good pocketing; would add weight. | 'holds the ball' is a calque; 'pocketing' is the tennis term for dwell time. |
| Comfortable, spin and power; more forgiving and versatile than the 98. | Comfortable, with spin and power; more forgiving and versatile than the 98. | Original list mixed an adjective with nouns. |
| The most maneuverable of the family; trades a little power and stability. | The most maneuverable in the family; gives up a little power and stability. | 'of the family' and bare 'trades' read as translated. |
| Praised for its maneuverability and how well it takes customization. | Praised for its maneuverability and how easy it is to tweak. | 'customization' differs UK/AU (-isation). |
| Power and spin from the baseline; less control against fast balls. | Power and spin from the baseline; less control against pace. | 'against fast balls' sounds translated; 'against pace' is idiomatic. |
| Very maneuverable and precise; a little unstable stock. | Very maneuverable and precise; a little unstable out of the box. | 'unstable stock' is ambiguous; 'out of the box' is clear. |
| Good control and feel; a low stock swingweight, better customized. | Good control and feel; a low swingweight out of the box, better with some added weight. | 'better customized' is vague and uses -ize spelling. |
| How much the racket weighs from the factory, unstrung and without an overgrip. Strings add | How much the racket weighs as sold, unstrung and without an overgrip. Strings add about 15 | 'from the factory' is a calque. |
| How heavy the racket “feels” when you swing it. It's measured in a lab, and it's what you  | How heavy the racket “feels” when you swing it. It's measured in a lab, and it's what you  | Fixes 'a more stable ball' (the racket is stable, not the ball). |
| How well the racket holds up against heavy balls and off-center hits without twisting. It  | How well the racket holds up against heavy shots and mishits without twisting. It comes fr | Neutral wording; consistent 'heavy shots' and 'mishits'. |
| Our own index, from 0 to 10, combining stiffness, weight and balance (dampening technology | Our own index, from 0 to 10, combining stiffness, weight and balance (dampening technology | 'physical therapist' is US-only; neutral wording works in all four markets. |

Lista completa (155 trocas): histórico do commit do `en.json`.
