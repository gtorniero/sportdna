# Faça sua prancha com o Gustavo Lucas (ativo)

Parceria ativa (`const COACH_ON=true;` em `surf/index.html`). O Gustavo é surf coach com acesso às fábricas e vende várias marcas; a Beyond the Work recebe comissão por prancha encomendada com ele. Os prints desta pasta são da primeira versão (antes de 14/nov/2026).

## Onde ele aparece (nov/2026)
- **Abertura:** diferencial "Faça sua prancha com um especialista", com foto e "Parceria declarada".
- **Prévia grátis** (antes de pagar, depois da litragem): bloco com foto, bio (`COACH_BIO`), shapers parceiros, 3 passos e o botão "Pedir a indicação do Gustavo no WhatsApp". A mensagem leva só as respostas do questionário (sem nível calculado, prancha, medidas, litros ou faixa) e o código. No "Ver um exemplo pronto", leva só o código.
- **Relatório pago:** seção "Faça sua prancha com um especialista" com o briefing completo (respostas + prancha calculada) e o código.
- **PDF, página 4:** contato, código e o resumo que ele recebe.
- **Página do SURF DNA** (`guias/surf/`): item 5 de "O que vem no relatório".

## Código SURF DNA
`SD-` + 5 caracteres (sem 0, O, 1 e I), gerado no aparelho por resultado e guardado só na aba (`sessionStorage`, chave `sd_surf_ref_v1`). O mesmo resultado tem o mesmo código na prévia, no relatório, no PDF e na volta do pagamento. Não identifica a pessoa e não vai para o nosso servidor: serve para o Gustavo informar de onde veio cada encomenda.

## Medição (só com aceite)
Clique em qualquer WhatsApp do especialista: GA4 `generate_lead` com `origem` = `previa` ou `relatorio` (e `sport`); Meta `Contact` (padrão) e `ContatoEspecialista` (personalizado). Nada da mensagem, das respostas ou do código vai para Google ou Meta.

## Transparência (CONAR)
Ao lado de todo bloco do especialista (prévia, relatório, PDF): "Parceria: o SPORT DNA pode receber uma comissão quando a prancha é encomendada com o especialista. Isso não muda as medidas recomendadas." A política de privacidade e afiliados diz o mesmo.

## Desligar
Troque para `const COACH_ON=false;`: some a prévia, a seção do relatório e a página 4 do PDF; a abertura volta a "Cards para compartilhar".
