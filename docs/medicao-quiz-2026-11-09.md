# Medição do questionário com carregamento lento

Com consentimento válido antes do início, a ponte de medição podia demorar mais de dois segundos para carregar. Nesse caso, o início era descartado e uma conclusão posterior podia ser enviada normalmente. O problema foi reproduzido sem rede externa com o código publicado.

Os eventos `quiz_start` e `quiz_complete` agora aguardam a ponte por até 15 segundos, sem bloquear a interface. A espera só começa quando já existe consentimento e é cancelada pela alteração ou revogação da escolha. A espera de checkout/Purchase e sua confirmação/deduplicação permanecem iguais.

Uma pessoa que começa sem consentimento e aceita antes de concluir ainda pode gerar somente `quiz_complete`: não reconstituímos ações anteriores ao aceite. Recusa, ponte permanentemente indisponível, mudança de sessão e limites da janela do relatório também impedem tratar contagens de eventos como um funil sequencial completo. Esta correção não identifica a causa de uma sessão histórica específica nem recupera eventos antigos.

Validação local: reprodução do atraso além de dois segundos; consentimento anterior e posterior; recusa; revogação com espera pendente e novo aceite; duplicatas; exemplo/retomada sem questionário. Testes de pagamento e acesso continuam passando. Nenhum evento foi enviado ao Google ou à Meta e nenhuma compra foi criada durante esta validação.

Publicação usa o `sportdna-site` existente na Cloudflare. A fonte foi conciliada com `97496f83af28a06301b4a61cb5030e0f08b1301c` e os arquivos públicos atuais. Não alterar o serviço separado de pagamentos nem reativar GitHub Pages.
