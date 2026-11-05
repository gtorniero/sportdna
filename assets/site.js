(function(){
const A = (window.ML_ARTICLES||[]).slice();
const SHOTS = window.ML_SHOTS||{};
const CATS = {escolher:"Como escolher", importancia:"Por que importa", evolucao:"Evolução", tecnologia:"Tecnologia"};

/* ---------- Logos (identidades oficiais) ---------- */
/* SPORT DNA: S dentro do D; apps com o equipamento no azul-petróleo */
const SD = {
  D:"M6 12 H38 A20 20 0 0 1 58 32 A20 20 0 0 1 38 52 H6 Z",
  S:`<text x="31" y="46" text-anchor="middle" font-family="Syne, Archivo, sans-serif" font-weight="800" font-size="40" fill="#FFFFFF">S</text>`,
  racket:c=>`<g transform="translate(32 32) scale(.84) translate(-32 -32)"><ellipse cx="42.24" cy="21.71" rx="16.7" ry="12.8" transform="rotate(-45 42.24 21.71)" fill="none" stroke="${c}" stroke-width="2.3"/><path d="M22 41.6 C24.4 37.6 25.8 33 27 27" fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round"/><path d="M23 42.4 C27 39.5 31.5 37.7 37 37.4" fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round"/><line x1="7.8" y1="56.2" x2="21.8" y2="42.2" stroke="${c}" stroke-width="4.8" stroke-linecap="round"/></g>`,
  board:(c,bg)=>`<g transform="translate(32 32) rotate(32) translate(-32 -32)"><path d="M32 5 C38.5 6.5 41 18 41 30 C41 41 40 50 38 58 L32 52 L26 58 C24 50 23 41 23 30 C23 18 25.5 6.5 32 5Z" fill="${c}"/>${bg?`<line x1="32" y1="11" x2="32" y2="48" stroke="${bg}" stroke-width="1.5" stroke-linecap="round"/>`:""}</g>`,
  tenis:c=>`<g transform="translate(32 34) rotate(18) scale(1.08) translate(-34 -37)"><path d="M13 37.5 C13 32.5 15 29 18.5 28.3 C20.5 30 23.5 30.6 26.5 29 L28.5 27.2 C31 28 33 30 35.5 31.6 C41.5 34 48.5 35.2 53 36.8 C54.6 37.4 54.4 38.8 53 38.8 L13 38.8Z" fill="${c}"/><path d="M12 40.6 L55.5 40.6 C55.5 43.6 53 45.6 49.5 45.6 L16 45.6 C13.5 45.6 11.8 43.6 12 40.6Z" fill="${c}"/></g>`
};
const ICON = {
  lab:(s=36)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#0A0A0A"/>${["#DDF247","#6CCFF6","#FF8A3D"].map((c,i)=>{const r=21,C=2*Math.PI*r,g=C/3;return `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${c}" stroke-width="4.5" stroke-dasharray="${g-3.2} ${C}" stroke-dashoffset="${-i*g}" transform="rotate(-90 32 32)"/>`}).join("")}<text x="32" y="43" text-anchor="middle" font-family="Syne, Archivo, sans-serif" font-weight="800" font-size="29" fill="#FFFFFF">S</text></svg>`,
  racket:(s=36)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#0E4D64"/>${SD.racket("#DDF247")}</svg>`,
  board:(s=36)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#0E4D64"/>${SD.board("#6CCFF6","#0E4D64")}</svg>`,
  tenis:(s=36)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#0E4D64"/>${SD.tenis("#FF8A3D")}</svg>`
};
const MARK = {
  racket:(s=48)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">${SD.racket("#DDF247")}</svg>`,
  board:(s=48)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">${SD.board("#6CCFF6","#0E4D64")}</svg>`,
  tenis:(s=48)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">${SD.tenis("#FF8A3D")}</svg>`
};
const labLockup = s => `${ICON.lab(s)}<span class="wm"><span class="wordmark">SPORT<span class="dna">DNA</span></span></span>`;

const AREAS = {
  racket:{key:"racket", name:"RACKET DNA", w1:"Racket", sport:"Raquete de tênis", cls:"a-racket",
    q:"Qual raquete combina com o seu braço, o seu nível e o jeito que você bate na bola?",
    h1:`A raquete certa para o seu jogo e para o seu <span class="hl">braço</span>.`,
    lede:"Peso, balanço, swingweight, rigidez, cabeça e padrão de cordas. O teste cruza suas respostas com a ficha técnica de cada raquete e mostra a análise inteira antes de você pagar.",
    quiz:"racket/",
    facts:[["62","raquetes no catálogo"],["19 a 28","perguntas"],["R$ 19,99","relatório"]],
    vin:["Idade e força","Dor no braço","Medida da mão","Nível e frequência","Estilo, topspin e swing","Onde você erra","Raquete atual e sensação","Orçamento e corda"],
    vout:["Peso","Balanço","Swingweight","Rigidez (RA)","Cabeça","Padrão","Corda e tensão","Grip"],
    inside:[["Raquete ideal com DNA Score","Marca, modelo e as seis especificações que importam."],["Índice Conforto no braço","Rigidez, peso e balanço avaliados para quem sente o braço."],["Comparação com a sua raquete","A diferença traduzida em sensação: mais solta, mais macia."],["Corda, tensão e grip","Para a nova raquete e para a que você já tem."]],
    price:[["R$ 19,99","Relatório completo"]],
    engine:{title:"Não é palpite. É um motor calibrado com 379 recomendações de especialistas.",
      lede:"Indicações de especialistas em português, inglês e espanhol viraram perfis do questionário e rodaram no motor. Os pesos foram ajustados e conferidos em casos guardados à parte, com travas para não piorar a segurança do braço nem estourar o seu orçamento.",
      stats:[["670","avaliações de testadores e de sites especializados"],["45","variáveis cruzadas: respostas, ficha técnica e índices"],["21","estudos científicos sobre raquete e braço"],["379","recomendações de especialistas, em 3 idiomas"],["3.000","perfis simulados para conferir segurança e viés"],["62","raquetes com specs medidas"]],
      steps:[["Seu corpo e o seu braço","Idade, força, medida da mão e dor no braço definem a faixa de peso e quanto conforto a raquete precisa ter."],["Seu jogo","Nível, frequência, estilo, topspin, swing e onde você erra viram um perfil ideal em seis atributos: potência, controle, spin, conforto, manobra e estabilidade."],["62 raquetes disputam o seu perfil","Peso, balanço, swingweight, rigidez, cabeça e padrão de cada raquete viram índices, comparados com o seu perfil ideal."],["Travas de segurança e orçamento","Raquete leve demais para quem sente o braço, pesada demais para quem tem pouca força e preço acima do seu orçamento perdem pontos."],["Corda, tensão e grip","A corda, a espessura e a tensão para o seu jogo, e como medir o grip."]],
      sources:"Fontes da calibração: Tennisnerd, Tennis Warehouse, The Tennis Tribe, TennisHack, Too Many Rackets, Tennis Express, Tênis Recreativo, InnerTenis, Universo do Tenista e Brasil Tênis, entre 74 fontes. Nenhuma marca paga para aparecer."},
    gloss:[["RA","Índice de rigidez do aro. Quanto maior, mais potência e mais vibração no braço."],["Swingweight","Quanto a raquete pesa no balanço. Define estabilidade e esforço."],["Head light","Balanço com mais massa no cabo. Mais manobrável na rede."],["Padrão de cordas","16x19 dá mais spin; 18x20 dá mais controle."],["Grip","Circunferência do cabo. O errado força o antebraço."],["Tensão","Mais alta dá controle; mais baixa dá potência e conforto."]]},
  board:{key:"board", name:"SURF DNA", w1:"Surf", sport:"Prancha de surf", cls:"a-board",
    q:"Qual prancha faz você remar, entrar na onda e evoluir no mar onde você surfa?",
    h1:`A prancha certa para o seu surf e para o seu <span class="hl">mar</span>.`,
    lede:"Tipo, medidas, litragem, rabeta, fundo, rocker e quilhas, calculados pelo seu peso, pelo que você já faz na onda e pelo seu pico. Recomendamos tudo, menos marca e shaper.",
    quiz:"surf/",
    facts:[["13","tipos de prancha"],["3 min","de teste"],["R$ 19,99","relatório"]],
    vin:["Peso, altura e idade","Tempo e frequência de surf","O que já faz na onda","Estilo","Flutuação preferida","Tamanho e força da onda","Papel no quiver","Prancha atual"],
    vout:["Tipo de shape","Comprimento","Largura e espessura","Litragem","Rabeta e bordas","Fundo e rocker","Quilhas","Construção"],
    inside:[["Tipo de prancha com DNA Score","O shape que combina com seu estilo e seu nível."],["Medidas e litragem","Comprimento, largura, espessura e litros calculados para você."],["Deck e fundo desenhados","Rabeta, quilhas, fundo e construção no desenho da prancha."],["Guia para a loja ou o shaper","Faixas aceitáveis para comprar nova, usada ou sob medida."]],
    price:[["Grátis","Prévia com a litragem"],["R$ 19,99","Relatório completo"]],
    engine:{title:"Não é palpite. É um motor calibrado com 422 casos reais de surf.",
      lede:"Cada caso (review de loja, teste de revista, prancha de atleta, tabela de marca, relato de fórum) virou um perfil do questionário e rodou no motor. O que errava foi ajustado e conferido em casos guardados à parte.",
      stats:[["422","casos reais de surf na calibração, de 5 frentes"],["416","tamanhos de 35 modelos, de 12 marcas, comparados medida por medida"],["1.000+","fontes de surf mapeadas, em mais de 400 sites"]],
      steps:[["Seu nível pelo que você faz na onda","Dez habilidades, como você pega onda e como passa a arrebentação viram uma nota de 0 a 100 e um entre 5 níveis. Tempo de surf, sozinho, não decide."],["Seu estilo e suas prioridades","Linha, curvas, manobras, tubo, aéreo ou clássico, e o peso que você dá a remada, estabilidade, velocidade, manobra e onda forte."],["13 tipos disputam o seu perfil","Cada tipo tem afinidade com nível, estilo, tamanho e força da onda, objetivo e uso. O motor soma, ranqueia e aplica travas para não indicar prancha acima do seu nível."],["A litragem para o seu corpo","Seu peso, seu nível, seu condicionamento e sua idade definem quanto a prancha precisa boiar, e o tipo de prancha ajusta a conta."],["As 12 decisões de shape","Bico, ponto mais largo, rabeta, borda, rocker, fundo, quilhas, tamanho e formato da quilha, caixas, construção e acabamento, cada uma com o porquê."]],
      sources:"Fontes da calibração: reviews da Boardcave e da Hawaiian South Shore; testes da Stab, The Inertia, Empire Ave, Swellnet e Surf Simply; tabelas da NSP, Softech, Catch Surf e outras calculadoras; pranchas de atletas da JS Industries, Stab, WSL e Volcom; relatos do fórum Seabreeze. Medidas das tabelas oficiais de Pyzel, Lost, Channel Islands, Firewire, DHD, Sharp Eye, Torq, NSP, Album, Christenson, Catch Surf e Softech; faixas de litragem da Lost, da Surf Simply e de Rusty; estudos sobre remada e volume (Farley et al. 2012; CSUSM). Nenhuma marca paga para aparecer."},
    gloss:[["Litragem","Volume da prancha em litros. Define flutuação e remada."],["Rocker","Curvatura do bico à rabeta. Mais rocker, mais manobra e menos velocidade."],["Rabeta","Formato da traseira. Muda soltura e firmeza na parede."],["Quilhas","Single, twin, thruster ou quad. Cada configuração dá outra linha."],["Stringer","Longarina central de madeira que dá rigidez."],["EPS","Bloco de isopor expandido com epóxi. Mais leve e flutuante que o PU."]]},
  tenis:{key:"tenis", name:"RUN DNA", w1:"Run", sport:"Tênis de corrida", cls:"a-tenis",
    q:"Qual tênis de corrida acompanha o seu corpo, o seu ritmo e o seu objetivo?",
    h1:`O tênis de corrida certo para o seu corpo e o seu <span class="hl">treino</span>.`,
    lede:"Espuma, drop, altura, forma, durabilidade e custo por km, cruzados com seu peso, seu ritmo e seus km por semana. Sem mito da pisada: neutro por padrão.",
    quiz:"run/",
    facts:[["212","tênis de 13 marcas"],["19","perguntas"],["R$ 9,99","relatório"]],
    vin:["Peso e largura do pé","Dor ao correr","Km por semana e ritmo","Terreno","Objetivo e prova","Treino de tiro","Sensação preferida","Orçamento"],
    vout:["Categoria","Altura de espuma","Drop","Peso","Durabilidade","Custo por km","Quando trocar","Segundo par"],
    inside:[["Tênis ideal com DNA Score","Modelo, preço médio no Brasil e ficha técnica."],["Ficha de laboratório","Peso, espuma e drop medidos, e seis índices contra a média do catálogo."],["Quando trocar","A data de troca pela sua quilometragem semanal."],["Segundo par e custo por km","Rodízio e os finalistas lado a lado."]],
    price:[["R$ 9,99","Relatório completo"]],
    engine:{title:"Não é palpite. É um motor calibrado com 234 recomendações de especialistas.",
      lede:"Cada indicação de especialista (guias de revistas, testes de laboratório, lojas e treinadores) virou um perfil do questionário e rodou no motor. Os pesos foram ajustados e conferidos em casos guardados à parte, sem marca nenhuma pagando para aparecer.",
      stats:[["1.755","reviews lidas, de testadores e de clientes"],["37","critérios técnicos por tênis"],["41","estudos científicos por trás das regras"],["234","recomendações de especialistas, de 35 fontes"],["5.000","perfis simulados para conferir segurança e viés"],["212","tênis de 13 marcas avaliados"]],
      steps:[["Seu corpo e o seu treino","Peso, largura do pé, dor, km por semana, ritmo, terreno e objetivo definem a categoria ideal: treino diário, amortecimento, estabilidade, treino rápido, prova ou trilha."],["Sem mito da pisada","Neutro por padrão: os estudos não mostram ganho em escolher pelo tipo de pisada. Estabilidade entra quando você relata desconforto."],["212 tênis disputam o seu perfil","Peso, espuma e drop medidos em laboratório, durabilidade e aprovação nas reviews, comparados com o tênis ideal para você."],["Travas de segurança","Contraindicações sérias (como supertênis para quem pediu estabilidade) tiram o tênis do pódio."],["Custo por km e data de troca","O preço médio no Brasil dividido pela durabilidade, e quando trocar pela sua quilometragem."]],
      sources:"Fontes da calibração: testes e guias da RunRepeat, RTINGS, Solereview, Outside, iRunFar, Believe in the Run, Doctors of Running e Runner's World, e fontes brasileiras como Centauro Arena, Exame e Webrun, num total de 35 fontes. Nenhuma marca paga para aparecer."},
    gloss:[["Drop","Diferença de altura entre calcanhar e antepé, em mm."],["Stack","Altura total de espuma sob o pé."],["PEBA","Espuma leve e muito responsiva, comum em tênis de prova."],["Placa de carbono","Lâmina rígida na entressola que muda a mecânica da passada."],["Rocker","Curvatura da sola que ajuda a rolar do apoio à impulsão."],["Cabedal","A parte de cima do tênis, que segura o pé."]]}
};
const ORDER = ["racket","board","tenis"];
const DATA2KEY = {raquete:"racket", prancha:"board", tenis:"tenis"};
const app = document.getElementById("app");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const byArea = k => A.filter(x => DATA2KEY[x.area] === k);
const ar = x => AREAS[DATA2KEY[x.area]];
const appLockup = (k,s=34) => `${ICON[k](s)}<span class="wm"><span class="wordmark">${AREAS[k].name}</span><small>by SPORT DNA</small></span>`;

/* chrome */
document.getElementById("brandHome").innerHTML = labLockup(34);
document.getElementById("footBrand").innerHTML = labLockup(28);
document.getElementById("nav").innerHTML = ORDER.map(k=>`<a href="${AREAS[k].quiz}">${ICON[k](24)}${AREAS[k].w1} DNA</a>`).join("") + `<span class="sep" aria-hidden="true"></span><a href="#blog" data-go="blog">Blog</a><a href="#conceito" data-go="conceito">Como funciona</a>`;
document.getElementById("footLinks").innerHTML = ORDER.map(k=>`<a href="${AREAS[k].quiz}">${AREAS[k].name}</a>`).join("") + `<a href="#blog" data-go="blog">Blog</a><a href="ferramentas/litragem/index.html">Calculadora de litragem</a><a href="#privacidade" data-go="privacidade">Privacidade e afiliados</a>`;

const REPORT_DESC={
  racket:"Exemplo de relatório do RACKET DNA: em Seu resultado, Head Boom MP com DNA Score de 95%, 295 g, balanço de 315 mm, swingweight 316, 61 RA, cabeça de 100 polegadas quadradas e padrão 16x19, de R$ 1.670 a R$ 1.990, para um atacante completo de topspin moderado, nível intermediário. Depois, Por que combina, trechos de testadores, pontos de atenção e a comparação com a Head Speed Pro atual, que tem DNA Score de 75%.",
  board:"Exemplo de relatório do SURF DNA: prancha ideal evolution (allround), pranchinha com mais volume, com DNA Score de 96%, medidas de 6 pés e 2 polegadas por 19 e 3/4 por 2 e 1/2 polegadas e 34,2 litros, com a ilustração da prancha, o desenho das 3 medidas e os detalhes: rabeta round, triquilha (thruster), fundo plano para single concave, construção em epóxi (EPS) e curva do bico de 4 e 1/4 polegadas.",
  tenis:"Exemplo de relatório do RUN DNA: tênis ideal Nike Vomero 18, com DNA Score de 96%. Máximo amortecimento, 298 g, 43 mm de espuma, drop de 10 mm, R$ 949,99 e custo de R$ 1,70 por km. Abaixo, Por que combina, bem amortecido e dentro do orçamento, e a ficha técnica, com durabilidade de 560 km e troca em cerca de 4 meses."};
function reportFrame(k, h){
  const a = AREAS[k];
  return `<div class="report ${a.cls}"><div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">sportdna.com.br/${({racket:"racket",board:"surf",tenis:"tenis"})[k]}/relatorio</span><span class="pill">${a.name}</span></div>
  <button type="button" class="shot" data-zoom="${k}" style="--h:${h||460}px" aria-label="Ampliar relatório de exemplo do ${a.name}" aria-describedby="rd-${k}-${h||460}"><img src="${SHOTS[k]||""}" alt="" width="1000" height="${k==='racket'?1943:1985}" loading="lazy" decoding="async"></button>
  <span class="zoom" aria-hidden="true">Ampliar ↗</span><p class="sr-only" id="rd-${k}-${h||460}">${REPORT_DESC[k]}</p></div>`;
}
function acard(x){
  const a = ar(x);
  return `<a class="acard ${a.cls}" href="#a-${x.id}" data-go="a-${x.id}">
    <div class="meta">${ICON[a.key](22)}<span class="chip area">${a.w1}</span><span class="chip">${CATS[x.cat]||x.cat}</span></div>
    <h3>${esc(x.title)}</h3><p>${esc(x.dek)}</p>
    <div class="foot"><span>${esc(x.level)}</span><span>${x.minutes} min de leitura</span></div></a>`;
}

function vars(a){
  return `<div class="vars"><div><span class="vl">Você informa</span><p>${a.vin.join(" · ")}</p></div><div><span class="vl">A gente calcula</span><ul>${a.vout.map(c=>`<li>${c}</li>`).join("")}</ul></div></div>`;
}
const TOOLBOX=`<a class="toolbox" href="ferramentas/litragem/index.html"><span class="tb-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/></svg></span><span class="tb-tx"><small>Ferramenta grátis</small><b>Calculadora de litragem de prancha</b><span>Peso, nível e tipo de prancha: veja quantos litros você precisa em segundos.</span></span><span class="tb-go">Calcular →</span></a>`;
const CARDS={
  racket:{perfil:["assets/cards/racket-perfil.webp","Card de DNA de jogo do RACKET DNA: Atacante completo de topspin moderado, nível intermediário, hexágono com conforto 9,2 e potência 8,5"],
          produto:["assets/cards/racket-produto.webp","Card da raquete do RACKET DNA: Head Boom MP, 295 g, cabeça de 100 pol², 61 RA, padrão 16x19, DNA 95%, escolhida entre 62 raquetes"]},
  board:{perfil:["assets/cards/board-perfil.webp","Card de DNA de surf do SURF DNA: Surfista de linha de onda pequena, nível intermediário, DNA 96%"],
         produto:["assets/cards/board-produto.webp","Card da prancha do SURF DNA: Mid-length egg, 6 pés e 11 polegadas por 19 7/8 polegadas, 38,7 litros, rabeta round, quilhas 2+1, DNA 96%, escolhida entre 13 tipos de prancha"]},
  tenis:{perfil:["assets/cards/tenis-perfil.webp","Card de corredor do RUN DNA: Corredor Constante, meia maratona, 20 a 40 km por semana, DNA 96%"],
         produto:["assets/cards/tenis-produto.webp","Card do tênis do RUN DNA: Nike Vomero 18, máximo amortecimento, 298 g, 43 mm de espuma, drop de 10 mm, 560 km de durabilidade, R$ 949,99, DNA 96%, escolhido entre 212 tênis"]}};
const cardImg=(k,t,cls)=>`<img class="${cls||""}" src="${CARDS[k][t][0]}" alt="${CARDS[k][t][1]}" width="720" height="1280" loading="lazy" decoding="async">`;
/* ---------- HOME ---------- */
let heroK = "racket";
const MODEL_TXT={
  racket:"a raquete ideal com DNA Score, a ficha técnica, o perfil de jogo no hexágono e a comparação com a sua raquete atual.",
  board:"o tipo de prancha com DNA Score, o desenho da prancha, as medidas e a litragem, os motivos em cards e a comparação com a sua prancha atual.",
  tenis:"o tênis ideal com DNA Score e preço médio, a ficha técnica, os prós e contras das reviews e a data de troca pela sua quilometragem."};
function modelSec(){
  const a=AREAS[heroK];
  return `<div class="model ${a.cls}">
    <div>
      <div class="eyebrow">Modelo de relatório</div>
      <h2 style="font-size:clamp(1.8rem,3.4vw,2.5rem);margin:8px 0 16px">O que você recebe no final.</h2>
      <div class="mtabs" role="group" aria-label="Escolha o app">${ORDER.map(k=>`<button type="button" data-hero="${k}" aria-pressed="${k===heroK}">${ICON[k](26)}${AREAS[k].w1}</button>`).join("")}</div>
      <p class="muted-p">Relatório real do ${a.name}, gerado com um perfil de exemplo: ${MODEL_TXT[heroK]}</p>
      <a class="btn btn-area" href="${a.quiz}">Fazer o teste do ${a.name} <span class="arr">→</span></a>
    </div>
    ${reportFrame(heroK, 560)}
  </div>`;
}
function heroReport(){
  return `${reportFrame("racket", 500)}
  `;
}
const MOB_Q = matchMedia("(max-width:940px)");
const MOB_HOME = ()=>MOB_Q.matches;
const conceitoSec = ()=>`<section class="band" id="conceito"><div class="wrap">
    <div class="shead"><div><div class="eyebrow">Como funciona</div><h2>Ficha técnica é confusa. A escolha não precisa ser.</h2></div><p>Equipamento caro, erro caro. A maioria compra pela marca, pelo ídolo ou pelo vendedor. O SPORT DNA traduz especificação em sensação e mostra o que muda no seu jogo.</p></div>
    <div class="steps">
      <div class="step"><span class="n">PASSO 1</span><h3>Responda o teste</h3><p>Corpo, nível, frequência, histórico de dor e o que você sente hoje no equipamento atual. Sem cadastro.</p></div>
      <div class="step"><span class="n">PASSO 2</span><h3>Veja a análise grátis</h3><p>Seu perfil, as especificações ideais e o grau de confiança do resultado, antes de pagar qualquer coisa.</p></div>
      <div class="step"><span class="n">PASSO 3</span><h3>Desbloqueie o relatório</h3><p>Os finalistas com marca e modelo, comparados com o que você já tem, num relatório como o exemplo abaixo.</p></div>
    </div>
    <h3 class="eng-h" style="margin-top:40px">O que tem por trás dos três testes</h3>
    <div class="eng-stats home-stats">${[["2.451","reviews e avaliações lidas, de testadores e de clientes","a-tenis"],["1.035","casos reais e indicações de especialistas na calibração","a-racket"],["62","estudos científicos por trás das regras","a-board"],["274","tênis e raquetes com ficha técnica, mais 13 tipos de prancha","a-tenis"],["11.000","perfis simulados para conferir segurança e viés","a-racket"],["0","marcas pagando para aparecer no resultado","a-board"]].map(([v,l,c])=>`<div class="${c}"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    <div class="principles">
      <div class="principle"><span class="ck">✓</span><div><b>Análise antes de pagar</b><span>Você vê o raciocínio inteiro. Só os finalistas ficam ocultos.</span></div></div>
      <div class="principle"><span class="ck">✓</span><div><b>Nenhuma marca no comando</b><span>Ninguém paga para aparecer no resultado. Mesmas respostas, mesmo resultado.</span></div></div>
      <div class="principle"><span class="ck">✓</span><div><b>Afiliado só depois, e declarado</b><span>Links de compra entram após a recomendação e não alteram a conta.</span></div></div>
      <div class="principle"><span class="ck">✓</span><div><b>Critérios explicados</b><span>Mostramos os motivos e os limites de cada recomendação.</span></div></div>
    </div>
  </div></section>`;
const areasSec = ()=>`  <section id="areas"><div class="wrap">
    <div class="shead"><div><div class="eyebrow">Três apps, um método</div><h2>Comece pelo seu esporte.</h2></div><p>Cada app tem o próprio teste, um relatório com a análise completa e um blog com guias.</p></div>
    <div class="adots" role="group" aria-label="Escolher app no carrossel">${ORDER.map((k,i)=>`<button type="button" class="adot ${AREAS[k].cls}" data-slide="${i}" aria-pressed="${i===0}" aria-label="${AREAS[k].name}">${ICON[k](20)}<span>${AREAS[k].name}</span></button>`).join("")}</div>
    <div class="areas" id="areasTrack" role="region" aria-roledescription="carrossel" aria-label="Apps do SPORT DNA">${ORDER.map(k=>{const a=AREAS[k];return `<article class="area-card ${a.cls}">
      <a class="banner" href="#${k}" data-go="${k}">${MARK[k]()}<div><span class="wordmark">${a.w1} <em>DNA</em></span><small>${a.sport} · by SPORT DNA</small></div></a>
      <a class="pair" href="${a.quiz}" aria-label="Fazer o teste do ${a.name}">${cardImg(k,"perfil","p1")}${cardImg(k,"produto","p2")}<span class="pair-cap">${k==="racket"?"Seu DNA de jogo e a sua raquete":k==="board"?"Seu DNA de surf e a sua prancha":"Seu perfil de corredor e o seu tênis"}</span></a>
      <div class="body"><p class="q">${a.q}</p>${vars(a)}
      <span class="meta">${a.facts[0][0]} ${a.facts[0][1]} · ${byArea(k).length} guias</span>
      <div class="row"><a class="btn btn-area" href="${a.quiz}">Fazer o teste <span class="arr">→</span></a><a class="btn btn-ghost" href="#${k}" data-go="${k}">Ver o app</a></div></div>
    </article>`}).join("")}</div>
  </div></section>`;
function home(){
  const feat = ORDER.map(k => featured(k)[0]).filter(Boolean);
  return `
  <section class="hero"><div class="wrap hero-grid">
    <div class="hero-txt">
      <div class="eyebrow">SPORT DNA · Find your DNA</div>
      <h1>O equipamento certo muda o seu <span class="hl">jogo</span>.</h1>
      <p class="lede">Você responde algumas perguntas sobre seu corpo, seu nível e seu estilo. A gente cruza com a ficha técnica de cada equipamento e entrega um relatório que explica o porquê de cada escolha.</p>
      <div class="chooser">
        <h2>Escolher meu esporte</h2>
        <div class="tiles">${ORDER.map((k,i)=>{const a=AREAS[k];return `<a class="tile ${a.cls}${i===0?" sel":""}" href="${a.quiz}">${ICON[k](52)}<span class="tn"><b>${a.w1} DNA</b><span>${a.sport}</span></span><span class="go">Fazer o teste<i aria-hidden="true"> →</i></span></a>`}).join("")}</div>
        <p>Teste grátis e sem cadastro.</p>
      </div>
    </div>
    <figure class="fan">
      <div class="fan-stage">${ORDER.map((k,i)=>`<a class="fcard f${i} ${AREAS[k].cls}" href="${AREAS[k].quiz}" aria-label="Fazer o teste do ${AREAS[k].name}">${cardImg(k,"produto")}</a>`).join("")}</div>
      <figcaption>Exemplos de resultado. O seu sai do teste, pronto para compartilhar.</figcaption>
    </figure>
  </div></section>

  ${MOB_HOME()?areasSec()+conceitoSec():conceitoSec()+areasSec()}

  <section style="padding-top:0"><div class="wrap a-board">${TOOLBOX}</div></section>
  <section id="modelo" style="padding-top:0"><div class="wrap" id="modelBox">${modelSec()}</div></section>

  <section><div class="wrap">
    <div class="shead"><div><div class="eyebrow">Blog · ${A.length} guias</div><h2>Antes de comprar, entenda.</h2></div><a class="btn btn-ghost" href="#blog" data-go="blog">Ver todos os guias <span class="arr">→</span></a></div>
    <div class="grid-a">${feat.map(acard).join("")}</div>
  </div></section>
`;
}

/* ---------- HUB ---------- */
/* 3 guias em destaque: primeiro os de "como escolher", depois os demais na ordem */
const featured = k => { const l=byArea(k); return [...l.filter(x=>x.cat==="escolher"),...l.filter(x=>x.cat!=="escolher")].slice(0,3); };
const engineSec = a => `<section class="band" id="motor"><div class="wrap">
    <div class="shead"><div><div class="eyebrow">O motor</div><h2>${a.engine.title}</h2><p>${a.engine.lede}</p></div></div>
    <div class="eng-stats">${a.engine.stats.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    <h3 class="eng-h">Como o cálculo é feito</h3>
    <ol class="eng-steps">${a.engine.steps.map(([t,d],i)=>`<li><span class="k" aria-hidden="true">${i+1}</span><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ol>
    <p class="eng-src">${a.engine.sources}</p>
    <a class="btn btn-area" href="${a.quiz}">Fazer o teste grátis <span class="arr">→</span></a>
  </div></section>`;
let hubFilter = "todos", curHub = null;
function hub(k){
  const a = AREAS[k];
  return `<div class="${a.cls}">
  <section class="hub-hero"><div class="wrap grid">
    <div>
      <div class="lockup">${appLockup(k,44)}</div>
      <h1>${a.h1}</h1>
      <p class="lede">${a.lede}</p>
      <div class="row"><a class="btn btn-area" href="${a.quiz}">Fazer o teste grátis <span class="arr">→</span></a><button class="btn btn-ghost" type="button" data-scroll="relatorio">Ver o relatório</button></div>
      <div class="facts">${a.facts.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    </div>
    ${true ? reportFrame(k, 440) : `<div class="calc ${a.cls}"><div class="eyebrow">Variáveis do teste</div>${vars(a)}<p class="soon">Relatório de exemplo em breve.</p></div>`}
  </div></section>
  ${a.engine?engineSec(a):""}
  ${k==="board"?`<section style="padding-block:28px 0"><div class="wrap">${TOOLBOX}</div></section>`:""}
  <nav class="subnav" aria-label="Nesta página"><div class="wrap">
    ${a.engine?`<button type="button" data-scroll="motor">O motor</button>`:""}
    <button type="button" data-scroll="relatorio">O relatório</button>
    <button type="button" data-scroll="guias">Guias (${byArea(k).length})</button>
    <button type="button" data-scroll="glossario">Glossário</button>
    <a class="go" href="${a.quiz}">Fazer o teste →</a>
  </div></nav>
  <section id="relatorio"><div class="wrap inside">
    <div>
      <div class="eyebrow">O que vem no relatório</div>
      <h2 style="font-size:clamp(1.8rem,3.4vw,2.5rem);margin:8px 0 22px">Tudo explicado, nada empurrado.</h2>
      <ol>${a.inside.map(([t,d],i)=>`<li><span class="k">${i+1}</span><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ol>
      <div class="price">${a.price.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    </div>
    ${reportFrame(k, 640)}
  </div></section>
  <section id="guias" style="padding-top:0"><div class="wrap">
    <div class="shead"><div><div class="eyebrow">${byArea(k).length} guias</div><h2>Para ler antes de comprar</h2></div></div>
    <div class="grid-a">${featured(k).map(acard).join("")}</div>
    <details class="more-guides">
      <summary>Ver todos os ${byArea(k).length} guias ${a.name}</summary>
      <div class="filters" role="group" aria-label="Filtrar por categoria">
        ${["todos",...Object.keys(CATS)].map(c=>`<button type="button" data-filter="${c}" aria-pressed="${c===hubFilter}">${c==="todos"?"Todos":CATS[c]}</button>`).join("")}
        <span class="count" id="hubCount" aria-live="polite"></span>
      </div>
      <div class="grid-a" id="hubGrid"></div>
    </details>
  </div></section>
  <section id="glossario" style="padding-top:0"><div class="wrap">
    <div class="shead"><div><div class="eyebrow">Glossário rápido</div><h2>Os termos que mais confundem.</h2></div></div>
    <div class="glossary">${a.gloss.map(([t,d])=>`<div><b>${t}</b><span>${d}</span></div>`).join("")}</div>
  </div></section></div>`;
}
function fillHub(k){
  const list = byArea(k).filter(x => hubFilter==="todos" || x.cat===hubFilter);
  document.getElementById("hubGrid").innerHTML = list.map(acard).join("") || `<div class="empty">Nenhum guia nesta categoria ainda.</div>`;
  document.getElementById("hubCount").textContent = list.length + (list.length===1?" guia":" guias");
  if(!window.ML_BUILD) publicLinks(document.getElementById("hubGrid"));
}

/* ---------- LIBRARY ---------- */
let libArea = "todas", libQ = "";
function library(){
  return `<section class="hub-hero" style="padding-bottom:40px"><div class="wrap">
    <div class="lockup">${labLockup(44)}</div>
    <h1 style="max-width:16em">Tudo o que a ficha técnica não explica.</h1>
    <p class="lede">${A.length} guias sobre como escolher, por que escolher certo importa, a evolução de cada esporte e as tecnologias por trás do equipamento.</p>
  </div></section>
  <section style="padding-top:36px"><div class="wrap">
    <div class="filters" role="group" aria-label="Filtrar blog">
      <button type="button" data-lib="todas" aria-pressed="${libArea==="todas"}">Todos</button>
      ${ORDER.map(k=>`<button type="button" data-lib="${k}" aria-pressed="${k===libArea}">${ICON[k](20)}${AREAS[k].name}</button>`).join("")}
      <label class="search" for="q"><span aria-hidden="true">⌕</span><input id="q" type="search" aria-label="Buscar no blog" placeholder="Buscar: drop, litragem, RA…" value="${esc(libQ)}"></label>
      <span class="count" id="libCount" aria-live="polite"></span>
    </div>
    <div id="libBody"></div>
  </div></section>`;
}
function fillLib(){
  const q = libQ.trim().toLowerCase();
  const list = A.filter(x => (libArea==="todas"||DATA2KEY[x.area]===libArea) && (!q || (x.title+" "+x.dek+" "+x.tags.join(" ")).toLowerCase().includes(q)));
  const body = document.getElementById("libBody");
  document.getElementById("libCount").textContent = list.length + (list.length===1?" guia":" guias");
  if(!list.length){ body.innerHTML = `<div class="empty">Nada encontrado para “${esc(libQ)}”. Tente outro termo.</div>`; return; }
  body.innerHTML = Object.keys(CATS).map(c=>{
    const g = list.filter(x=>x.cat===c); if(!g.length) return "";
    return `<div style="margin-bottom:44px"><h2 style="font-size:1.5rem;margin-bottom:16px">${CATS[c]}</h2><div class="grid-a">${g.map(acard).join("")}</div></div>`;
  }).join("");
  if(!window.ML_BUILD) publicLinks(body);
}

/* ---------- ARTICLE ---------- */
function article(id){
  const x = A.find(y=>y.id===id); if(!x) return null;
  const a = ar(x); const list = byArea(a.key); const i = list.indexOf(x);
  const prev = list[i-1], next = list[i+1];
  let hn = 0; const heads = [];
  const body = x.body.map(b=>{
    if(b.t==="p") return `<p>${esc(b.x)}</p>`;
    if(b.t==="h"){ hn++; heads.push(b.x); return `<h2 id="${x.id}-s${hn}">${esc(b.x)}</h2>`; }
    if(b.t==="ul") return `<ul>${b.items.map(it=>`<li>${esc(it)}</li>`).join("")}</ul>`;
    if(b.t==="tip") return `<div class="tip"><b>Dica</b><div>${esc(b.x)}</div></div>`;
    if(b.t==="quote") return `<blockquote>${esc(b.x)}</blockquote>`;
    if(b.t==="spec") return `<div class="spec"><div class="cap">${esc(b.caption||"Referência")}</div><div class="tw" tabindex="0" role="region" aria-label="${esc(b.caption||'Tabela de referência')}"><table>${b.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table></div></div>`;
    return "";
  }).join("");
  const references=(x.sources||[]).length ? `<section class="prose"><h2>Fontes e critérios</h2><ul>${x.sources.map(s=>`<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul><p>Conteúdo educativo da equipe SPORT DNA. Não substitui avaliação na água com professor ou shaper.</p></section>` : '';
  const preferred=(x.related||[]).map(id=>list.find(y=>y.id===id)).filter(Boolean);
  const related = [...new Set(preferred.concat(list.filter(y=>y!==x && y.cat===x.cat),list.filter(y=>y!==x && y.cat!==x.cat)))].slice(0,3);
  return `<div class="${a.cls}"><article class="article"><div class="wrap">
    <nav class="crumbs" aria-label="Você está em"><a href="#inicio" data-go="inicio">Início</a><span>/</span><a href="#${a.key}" data-go="${a.key}">${a.name}</a><span>/</span><span>${CATS[x.cat]}</span></nav>
    <div class="art-grid">
      <div style="min-width:0">
        <header class="art-head">
          <div class="meta">${ICON[a.key](24)}<span class="chip area">${a.sport}</span><span class="chip">${CATS[x.cat]}</span></div>
          <h1>${esc(x.title)}</h1><p class="dek">${esc(x.dek)}</p>
          <div class="by"><span>Nível: ${esc(x.level)}</span><span>${x.minutes} min de leitura</span><span>${x.tags.map(t=>"#"+esc(t)).join(" ")}</span></div>
        </header>
        <div class="prose">${body}</div>${references}
        <div class="pn">
          ${prev?`<a href="#a-${prev.id}" data-go="a-${prev.id}"><small>← Anterior</small><b>${esc(prev.title)}</b></a>`:"<span></span>"}
          ${next?`<a class="next" href="#a-${next.id}" data-go="a-${next.id}"><small>Próximo →</small><b>${esc(next.title)}</b></a>`:""}
        </div>
      </div>
      <div class="side">
        ${a.key==="board"?TOOLBOX.replace('class="toolbox"','class="toolbox mini"'):""}
        <div class="cta-box">
          ${true?`<button type="button" class="thumb" data-zoom="${a.key}" aria-label="Ampliar relatório de exemplo do ${a.name}"><img src="${SHOTS[a.key]||""}" alt="" width="1000" height="${a.key==='racket'?1943:1985}" loading="lazy" decoding="async"></button>`:""}
          <div class="in">
            <div class="lockup">${MARK[a.key](32)}<span class="wordmark">${a.w1} <em>DNA</em></span></div>
            <p>${a.q}</p>
            <a class="btn btn-area" href="${a.quiz}">Fazer o teste grátis <span class="arr">→</span></a>
          </div>
        </div>
        ${heads.length?`<div class="toc"><div class="eyebrow">Neste guia</div><ol>${heads.map((h,j)=>`<li><button type="button" data-anchor="${x.id}-s${j+1}">${esc(h)}</button></li>`).join("")}</ol></div>`:""}
      </div>
    </div>
    <div style="margin-top:64px"><h2 style="font-size:1.5rem;margin-bottom:16px">Continue lendo</h2><div class="grid-a">${related.map(acard).join("")}</div></div>
  </div></article></div>`;
}

/* ---------- ROUTER ---------- */
function privacy(){
  return `<article class="article"><div class="wrap">
    <nav class="crumbs" aria-label="Você está em"><a href="#inicio" data-go="inicio">Início</a><span>/</span><span>Privacidade e afiliados</span></nav>
    <header class="art-head"><h1>Privacidade e afiliados</h1><p class="dek">O que o SPORT DNA guarda, o que não guarda e como funcionam os links de loja.</p><div class="by"><span>Atualizado em novembro de 2026</span></div></header>
    <div class="prose">
      <h2>Quem somos</h2>
      <p>O SPORT DNA é um projeto da Beyond the Work com três testes de equipamento: RACKET DNA (raquete de tênis), SURF DNA (prancha de surf) e RUN DNA (tênis de corrida).</p>
      <h2>Suas respostas</h2>
      <ul>
        <li>As respostas dos testes são processadas no seu próprio navegador. Não temos conta de usuário nem banco de dados com elas.</li>
        <li>O RACKET DNA guarda no seu navegador o último resultado e o que você liberou, para você voltar depois. Para apagar, limpe os dados do site no navegador.</li>
        <li>Google Analytics e Pixel da Meta só são carregados após sua escolha de cookies opcionais. Medimos páginas públicas e início e conclusão dos testes apenas por esporte. As tags não recebem respostas, peso, idade, dor, condições físicas, e-mail, códigos de resultado ou conteúdo do relatório.</li>
        <li>Rótulos de campanha e identificadores de clique válidos podem ser usados para atribuir visitas. Recusar não impede o uso do site. Você pode alterar sua escolha em Preferências de cookies, no rodapé; ela vale por até 180 dias. Ao revogar, interrompemos novas coletas opcionais e removemos os cookies opcionais acessíveis ao site. Dados já recebidos pelos fornecedores não são apagados automaticamente.</li>
        <li>Google e Meta podem processar identificadores do navegador e informações técnicas, como IP e dispositivo, em outros países. Consulte as políticas do Google e da Meta. Simulações e pagamentos de teste não geram compras nos pixels.</li>
      </ul>
      <h2>Contato e e-mail</h2>
      <ul>
        <li>Quando você compra ou usa um código promocional, o e-mail informado é usado para identificar o acesso. O envio do relatório por e-mail só acontece quando você solicita; o conteúdo é enviado ao nosso servidor e ao serviço de e-mail Resend, exclusivamente para o endereço confirmado da compra. Não guardamos o texto do relatório no banco de dados; guardamos o controle de reenvio.</li>
        <li>No SURF DNA, o resumo para o coach só sai se você mesmo mandar, pelo WhatsApp ou pelo Instagram, depois de autorizar.</li>
      </ul>
      <h2>Pagamento</h2>
      <p>O checkout oferece cartão pelo Stripe e Pix pelo Mercado Pago. Em produção há cobrança real, no valor exibido antes de escolher o meio de pagamento. Os dados de cartão são informados no checkout do Stripe. Para o Pix, o e-mail é encaminhado ao Mercado Pago. Nosso banco registra identificador do pedido, produto, valor, situação do pagamento e o resumo criptográfico do token de acesso. As respostas do teste ficam no navegador e não são enviadas para criar o pagamento. Ambientes de teste são identificados como tal.</p>
      <h2>Serviços de terceiros</h2>
      <p>Para carregar fontes e algumas bibliotecas, o navegador acessa o Google Fonts e o cdnjs (Cloudflare). Esses serviços podem registrar o endereço IP de quem acessa, como qualquer site.</p>
      <h2>Links de afiliado</h2>
      <ul>
        <li>Nenhuma marca ou loja paga para aparecer no resultado. O ranking é calculado antes e sem olhar para comissão.</li>
        <li>Alguns links de compra podem ser de afiliado, por exemplo pela rede Awin. Se você comprar por eles, a loja pode nos pagar uma comissão, sem custo extra para você.</li>
        <li>Links de afiliado aparecem só depois da recomendação e são marcados como tal.</li>
        <li>Fotos de produto, quando houver, têm crédito da marca ou da loja.</li>
      </ul>
      <h2>Saúde</h2>
      <p>O conteúdo é educativo. Em caso de dor ou lesão, procure um profissional de saúde.</p>
      <h2>Fale com a gente</h2>
      <p>Dúvidas ou pedidos sobre seus dados: <a href="mailto:hi@sportdna.com.br">hi@sportdna.com.br</a>.</p>
    </div>
  </div></article>`;
}
if(window.ML_BUILD){ window.ML_BUILD_API={home,hub,library,article,privacy,fillHub,fillLib,AREAS}; return; }
const root = window.ML_ROOT || "./";
function publicLinks(scope){
  scope.querySelectorAll('a[data-go]').forEach(a=>{a.href=root+(window.ML_ROUTES[a.dataset.go]||'');});
  scope.querySelectorAll('[src], a[href]').forEach(el=>{
    const attr=el.hasAttribute('src')?'src':'href', value=el.getAttribute(attr);
    if(/^(assets|apps|ferramentas|racket|surf|run)\//.test(value)) el.setAttribute(attr,root+value);
  });
}
publicLinks(document);
const LEGACY = {raquete:"racket", prancha:"board", biblioteca:"blog"};
function setNav(view){
  const k = view.startsWith("a-") ? DATA2KEY[view.slice(2).split("-")[0]] : view;
  document.querySelectorAll(".nav a").forEach(a=>{ a.removeAttribute("aria-current"); if(a.dataset.go===k) a.setAttribute("aria-current","page"); });
}
let firstRender=true;
function say(t){const l=document.getElementById("a11yLive");l.textContent="";setTimeout(()=>{l.textContent=t},80)}
function initAreas(){
  const tr=document.getElementById("areasTrack"); if(!tr) return;
  const dots=[...document.querySelectorAll(".adot")];
  const cards=[...tr.children];
  const mark=i=>dots.forEach((d,j)=>d.setAttribute("aria-pressed",String(i===j)));
  let raf=0;
  tr.addEventListener("scroll",()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{
    const r=tr.getBoundingClientRect(), x=r.left+r.width/2; let best=0,bd=1e9;
    cards.forEach((c,i)=>{const b=c.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-x); if(d<bd){bd=d;best=i}}); mark(best); }); },{passive:true});
  dots.forEach((d,i)=>d.addEventListener("click",()=>{ const c=cards[i];
    const r=tr.getBoundingClientRect(),b=c.getBoundingClientRect();
    tr.scrollTo({left:tr.scrollLeft+(b.left+b.width/2)-(r.left+r.width/2),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}); mark(i); }));
}
MOB_Q.addEventListener("change",()=>{ const h=(location.hash||"#inicio").slice(1); if(window.ML_VIEW==="inicio"){ const y=scrollY; app.innerHTML=home(); publicLinks(app); initAreas(); scrollTo(0,y); } });
function render(view){
  view = LEGACY[view] || view || "inicio";
  let html, after;
  if(view==="inicio"||view==="conceito"){ html = home(); after=initAreas; }
  else if(AREAS[view]){ hubFilter="todos"; curHub=view; html = hub(view); after=()=>fillHub(view); }
  else if(view==="blog"){ html = library(); after=fillLib; }
  else if(view.startsWith("a-")){ html = article(view.slice(2)); }
  else if(view==="privacidade"){ html = privacy(); }
  if(!html){ view="inicio"; html=home(); }
  app.innerHTML = html; if(after) after();
  setNav(view);
  document.getElementById("nav").classList.remove("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded","false");
  const t = view==="privacidade" ? "Privacidade e afiliados" : view.startsWith("a-") ? (A.find(y=>y.id===view.slice(2))||{}).title : view==="blog" ? "Blog" : (AREAS[view]||{}).name;
  // Metadata is supplied by the static page generator.
  if(view==="conceito"){ requestAnimationFrame(()=>document.getElementById("conceito").scrollIntoView()); }
  else window.scrollTo(0,0);
  publicLinks(app);
  if(!firstRender && view!=="conceito"){ const h=app.querySelector("h1"); if(h){ h.setAttribute("tabindex","-1"); h.focus({preventScroll:true}); } say("Página: "+(t||"Início")); }
  firstRender=false;
}
const lb = document.getElementById("lb");
let lbOpener=null;
function openLB(k){ lbOpener=document.activeElement; const im=document.getElementById("lbImg"); im.src = root+(SHOTS[k]||""); im.alt = REPORT_DESC[k]; document.getElementById("lbCap").textContent = AREAS[k].name+" · relatório de exemplo"; lb.hidden=false; lb.scrollTop=0; document.getElementById("lbClose").focus(); }
function closeLB(){ lb.hidden=true; if(lbOpener&&lbOpener.isConnected) lbOpener.focus(); }
document.addEventListener("click", e=>{
  if(!lb.hidden){ if(e.target.id==="lbClose"||e.target===lb) closeLB(); return; }
  if(e.target.closest(".skip")){ e.preventDefault(); const h=app.querySelector("h1")||app; h.setAttribute("tabindex","-1"); h.focus(); return; }
  const z = e.target.closest("[data-zoom]"); if(z){ openLB(z.dataset.zoom); return; }
  const go = e.target.closest("[data-go]"); if(go){ return; }
  const sc = e.target.closest("[data-scroll]"); if(sc){ e.preventDefault(); const el=document.getElementById(sc.dataset.scroll); if(el){ el.scrollIntoView(); const h=el.querySelector("h2,h1")||el; h.setAttribute("tabindex","-1"); h.focus({preventScroll:true}); } return; }
  const an = e.target.closest("[data-anchor]"); if(an){ const el=document.getElementById(an.dataset.anchor); if(el){ el.scrollIntoView(); el.setAttribute("tabindex","-1"); el.focus({preventScroll:true}); } return; }
  const hr = e.target.closest("[data-hero]"); if(hr){ heroK=hr.dataset.hero; document.getElementById("modelBox").innerHTML=modelSec(); const nb=document.querySelector(`[data-hero="${heroK}"]`); if(nb) nb.focus(); say("Relatório de exemplo do "+AREAS[heroK].name); return; }
  const f = e.target.closest("[data-filter]"); if(f){ hubFilter=f.dataset.filter; document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed", b===f)); fillHub(curHub); return; }
  const l = e.target.closest("[data-lib]"); if(l){ libArea=l.dataset.lib; document.querySelectorAll("[data-lib]").forEach(b=>b.setAttribute("aria-pressed", b===l)); fillLib(); return; }
});
document.addEventListener("keydown", e=>{ if(lb.hidden) return; if(e.key==="Escape") closeLB(); if(e.key==="Tab"){ e.preventDefault(); document.getElementById("lbClose").focus(); } });
document.addEventListener("input", e=>{ if(e.target.id==="q"){ libQ=e.target.value; fillLib(); } });
document.getElementById("menuBtn").addEventListener("click", function(){
  const n=document.getElementById("nav"); const o=n.classList.toggle("open"); this.setAttribute("aria-expanded", o);
});
function legacyRoute(){
  const h=location.hash.slice(1), key=LEGACY[h]||h;
  if(key==="conceito") return false;
  if(window.ML_ROUTES[key]!==undefined && key!==window.ML_VIEW){ const next=new URL(root+window.ML_ROUTES[key],location.href); next.search=location.search; location.replace(next.href); return true; }
  return false;
}
window.addEventListener("hashchange",legacyRoute);
if(!legacyRoute()){ render(window.ML_VIEW || 'inicio'); if(location.hash==='#conceito') requestAnimationFrame(()=>document.getElementById('conceito')?.scrollIntoView()); }
})();

// A mesma medição consentida em todas as páginas públicas geradas.
if (typeof document.querySelector === 'function' && !document.querySelector('script[src="/assets/measurement.js"]')) { const m = document.createElement('script'); m.src = '/assets/measurement.js'; m.defer = true; document.head.appendChild(m); }
