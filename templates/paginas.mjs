/* Páginas estáticas geradas por scripts/build-seo.mjs: guias de compra do RACKET DNA e páginas institucionais.
   Não são publicadas como estão (templates/ fica fora do pacote); o build monta o HTML final em cada rota.
   Especificações e preços vêm do catálogo do RACKET DNA (CATALOG e PRECO em racket/index.html), lidos no build:
   se um modelo sair do catálogo ou mudar de nome, o build falha em vez de publicar ficha inventada.
   As listas por perfil são o resultado do motor do teste para os perfis abaixo (scripts/guia-raquete-perfis.mjs
   roda o motor de novo e confere). Ao refazer as listas, atualize RODADA. */

export const RODADA = '2026-11-14';

// Respostas completas de cada perfil de exemplo (mesmas chaves do questionário do RACKET DNA).
const BASE = {age:'35',height:'175',weight:'75',str:'mid',cond:'2',arm:'no',years:'3',freq:'2',serve:'safe',style:['all'],opp:'mix',miss:'short',cur:'none',why:'broken',want:[],restr:'6m',imp:'no',budget:'99999'};
const perfil = o => ({...BASE, ...o});

export const PERFIS = {
 iniciante: {
  titulo: 'Iniciante',
  quem: 'Para quem ainda erra a troca de bola em ritmo médio e está comprando a primeira raquete boa.',
  resumo: '35 anos, 1,75 m, 75 kg, força na média, sem dor, joga uma vez por semana há menos de um ano, orçamento de até R$ 2.000.',
  respostas: perfil({lvl:'beg',years:'0',freq:'1',serve:'weak',style:['keep'],opp:'soft',miss:'net',why:'first',restr:'zero',budget:'2000'}),
  zona: {peso:[258,282], sw:[304,320], cabeca:[100,107]},
  picks: ['Babolat Boost Drive','Wilson Blade 104 v9','Babolat Pure Drive 107','Babolat Boost Strike','Wilson Clash 108 v3']
 },
 iniciante_menos_forca: {
  titulo: 'Iniciante com menos força',
  quem: 'Para quem está começando depois dos 50, tem pouca força ou cansa cedo na quadra.',
  resumo: '55 anos, 1,65 m, 65 kg, força abaixo da média, termina o jogo no limite, sem dor, joga uma vez por semana há menos de um ano.',
  respostas: perfil({lvl:'beg',years:'0',freq:'1',serve:'weak',style:['keep'],opp:'soft',miss:'net',why:'first',restr:'zero',budget:'2000',str:'low',cond:'1',age:'55',height:'165',weight:'65'}),
  zona: {peso:[246,270], sw:[304,320], cabeca:[100,107]},
  picks: ['Babolat Boost Drive','Babolat Evo Drive','Head Extreme Team','Babolat Boost Aero','Head Radical Team L 2025']
 },
 intermediario: {
  titulo: 'Intermediário',
  quem: 'Para quem troca bola com consistência, joga partidas e quer uma raquete para os próximos anos.',
  resumo: '35 anos, 1,75 m, 75 kg, força na média, sem dor, joga 2 a 3 vezes por semana há 3 a 10 anos, swing médio, topspin médio, jogo completo.',
  respostas: perfil({lvl:'int',swing:'mid',spin:'mid',why:'level'}),
  zona: {peso:[284,300], sw:[313,325], cabeca:[98,102]},
  picks: ['Yonex EZONE 100','Tecnifibre TFight 300','Babolat Pure Drive']
 },
 intermediario_avancado: {
  titulo: 'Intermediário avançado',
  quem: 'Para quem tem golpes confiáveis, varia direção e efeito e já gera velocidade com o próprio braço.',
  resumo: '35 anos, força acima da média, sobra fôlego, joga há mais de 10 anos, swing longo, topspin médio, ataca do fundo, corda de poliéster.',
  respostas: perfil({lvl:'adv_int',years:'10',swing:'long',spin:'mid',style:['agg','all'],serve:'mix',str:'high',cond:'3',string:'poly',tens:'54',restr:'3m'}),
  zona: {peso:[303,319], sw:[316,328], cabeca:[98,102]},
  picks: ['Babolat Pure Aero 98','Wilson Pro Staff 97 v14','Yonex EZONE 98']
 },
 avancado: {
  titulo: 'Avançado',
  quem: 'Para quem compete, treina quatro vezes ou mais por semana e enfrenta bola pesada.',
  resumo: '27 anos, 1,82 m, 78 kg, força acima da média, sobra fôlego, joga 4 ou mais vezes por semana há mais de 10 anos, swing longo, muito topspin, adversários de bola pesada.',
  respostas: perfil({lvl:'adv',years:'10',freq:'4',swing:'long',spin:'high',style:['agg','all'],serve:'mix',str:'high',cond:'3',opp:'heavy',miss:'long',string:'poly',tens:'54',restr:'1m',age:'27',height:'182',weight:'78'}),
  zona: {peso:[315,331], sw:[317,329], cabeca:[97,100]},
  picks: ['Wilson Pro Staff 97 v14','Tecnifibre TFight 315S','Volkl Vostra V10 320 g']
 },
 cotovelo: {
  titulo: 'Braço sensível ou dor no cotovelo',
  quem: 'Para quem sente o cotovelo hoje e quer uma raquete que incomode menos.',
  resumo: '45 anos, força na média, intermediário, dor moderada no cotovelo hoje, joga menos por causa dela, quer mais conforto.',
  respostas: perfil({lvl:'int',swing:'mid',spin:'mid',arm:'now',joint:['elbow'],pain:'2',lim:'1',why:'pain',want:['comfort'],age:'45'}),
  zona: {peso:[284,300], sw:[313,325], cabeca:[98,102], ra:[54,62]},
  picks: ['ProKennex Black Ace 300','Wilson Clash 100 v3','Prince Phantom 100X 290 g','Head Boom MP']
 },
 cotovelo_menos_forca: {
  titulo: 'Dor no cotovelo e menos força',
  quem: 'Para quem sente o cotovelo e também tem pouca força ou mais idade.',
  resumo: '55 anos, 1,65 m, 65 kg, força abaixo da média, termina o jogo no limite, intermediário, dor moderada no cotovelo hoje.',
  respostas: perfil({lvl:'int',swing:'mid',spin:'mid',arm:'now',joint:['elbow'],pain:'2',lim:'1',why:'pain',want:['comfort'],age:'55',str:'low',cond:'1',height:'165',weight:'65'}),
  zona: {peso:[272,288], sw:[310,322], cabeca:[98,102], ra:[54,62]},
  picks: ['Head Speed MP L','Wilson Clash 100L v3','Prince Phantom 100X 290 g','Babolat Evo Aero']
 },
 cotovelo_avancado: {
  titulo: 'Dor no cotovelo, jogo forte',
  quem: 'Para quem bate forte, tem golpes confiáveis e sente o cotovelo.',
  resumo: '40 anos, força acima da média, sobra fôlego, joga há mais de 10 anos, swing longo, ataca do fundo, dor moderada no cotovelo hoje.',
  respostas: perfil({lvl:'adv_int',years:'10',swing:'long',spin:'mid',style:['agg','all'],serve:'mix',str:'high',cond:'3',arm:'now',joint:['elbow'],pain:'2',lim:'1',why:'pain',want:['comfort'],age:'40',string:'poly',tens:'54',restr:'3m'}),
  zona: {peso:[303,319], sw:[316,328], cabeca:[98,102], ra:[54,62]},
  picks: ['Wilson Clash 100 Pro v3','Head Gravity Pro','ProKennex Black Ace 300','Prince Phantom 100P']
 },
 potencia: {
  titulo: 'Mais potência com pouco esforço',
  quem: 'Para quem tem swing curto, pouca força e vê a bola sair curta.',
  resumo: '50 anos, força abaixo da média, intermediário, swing curto, pouco topspin, erra mais com bola curta, quer mais potência.',
  respostas: perfil({lvl:'int',swing:'short',spin:'low',str:'low',miss:'short',why:'feel',want:['power'],age:'50'}),
  zona: {peso:[272,288], sw:[311,323], cabeca:[98,102]},
  picks: ['Yonex EZONE 105','Wilson Blade 104 v9','Babolat Pure Drive 107']
 },
 controle: {
  titulo: 'Mais controle',
  quem: 'Para quem já gera velocidade e vê a bola passar da linha de fundo.',
  resumo: '35 anos, força acima da média, intermediário avançado, joga há mais de 10 anos, swing longo, erra mais com bola longa, quer mais controle.',
  respostas: perfil({lvl:'adv_int',years:'10',swing:'long',spin:'mid',miss:'long',why:'feel',want:['control'],str:'high',string:'poly',tens:'54',restr:'3m'}),
  zona: {peso:[300,316], sw:[315,327], cabeca:[98,102]},
  picks: ['Dunlop CX 200 Tour 18x20','Tecnifibre TF40 315 18x20','Babolat Pure Strike 97']
 },
 spin: {
  titulo: 'Mais spin',
  quem: 'Para quem ataca do fundo com swing longo e muito topspin.',
  resumo: '35 anos, força na média, intermediário, swing longo, muito topspin, ataca do fundo, quer mais spin.',
  respostas: perfil({lvl:'int',swing:'long',spin:'high',style:['agg'],why:'feel',want:['spin']}),
  zona: {peso:[284,300], sw:[314,326], cabeca:[98,102]},
  picks: ['Babolat Pure Aero','Head Extreme MP XL 2026','Dunlop SX 300']
 },
 ate1400: {
  titulo: 'Até R$ 1.400',
  quem: 'Para o intermediário que quer gastar pouco.',
  resumo: 'O mesmo intermediário do perfil acima, com orçamento de até R$ 1.400. Mostramos as três primeiras do motor com oferta a partir de R$ 1.400 ou menos.',
  respostas: perfil({lvl:'int',swing:'mid',spin:'mid',why:'level',budget:'1400'}),
  filtro: {precoMax:1400},
  zona: {peso:[284,300], sw:[313,325], cabeca:[98,102]},
  picks: ['Babolat Boost Strike','Wilson Blade 104 v9','Dunlop CX 200 LS']
 }
};

// Uma frase por raquete, só com o que a ficha técnica mostra.
const POR_QUE = {
 'Babolat Boost Drive': 'Leve e com cabeça grande: fácil de acelerar e perdoa a batida fora do centro. Vendida já encordoada.',
 'Wilson Blade 104 v9': 'Cabeça de 104 pol² com peso de raquete adulta e balanço head light. É 0,5 pol mais longa que o padrão.',
 'Babolat Pure Drive 107': 'A cabeça de 107 pol² dá muita área de acerto, e o quadro rígido devolve potência com pouco esforço.',
 'Babolat Boost Strike': 'Cabeça de 102 pol² e 285 g, por um preço de entrada. Só uma loja no Brasil na consulta.',
 'Wilson Clash 108 v3': 'Cabeça de 108 pol² e quadro flexível. Sem loja no Brasil na consulta: preço estimado de importada.',
 'Babolat Evo Drive': 'Leve, cabeça de 104 pol² e padrão 16x17, bem aberto. Preço de entrada.',
 'Head Extreme Team': 'Leve, cabeça de 105 pol² e quadro mais flexível que o das outras desta faixa.',
 'Babolat Boost Aero': 'Leve e com balanço quase neutro, que ajuda a gerar potência com pouco movimento.',
 'Head Radical Team L 2025': 'Leve, cabeça de 102 pol² e balanço quase neutro.',
 'Yonex EZONE 100': '300 g, 100 pol² e 16x19, a combinação mais comum, com quadro rígido que devolve potência.',
 'Tecnifibre TFight 300': 'Mesmo peso e cabeça da EZONE 100, com quadro um pouco mais flexível.',
 'Babolat Pure Drive': 'Quadro rígido, 300 g e 100 pol²: muita potência para quem ainda não gera velocidade de sobra.',
 'Babolat Pure Aero 98': 'Cabeça de 98 pol² e padrão 16x20: mais controle que as de 100 pol², com 305 g.',
 'Wilson Pro Staff 97 v14': 'Pesada, cabeça de 97 pol² e balanço bem head light: estável contra bola forte e precisa.',
 'Yonex EZONE 98': 'Cabeça de 98 pol², 305 g e quadro mais flexível que o da EZONE 100.',
 'Tecnifibre TFight 315S': 'Pesada e head light, com cabeça de 98 pol²: para quem acelera sem esforço.',
 'Volkl Vostra V10 320 g': 'A mais pesada desta lista, com swingweight alto: estabilidade para golpes longos. Só uma loja no Brasil na consulta.',
 'ProKennex Black Ace 300': 'Uma das mais flexíveis do catálogo, com 300 g de peso para dar estabilidade.',
 'Wilson Clash 100 v3': 'A mais flexível do catálogo, empatada com a Clash 100L v3, com 295 g e 100 pol².',
 'Prince Phantom 100X 290 g': 'Quadro flexível e padrão 16x18 aberto, com 290 g.',
 'Head Boom MP': 'Quadro abaixo da média de rigidez do catálogo, 295 g e 100 pol².',
 'Head Speed MP L': 'Versão de 285 g da Speed MP, com quadro mais flexível que a média.',
 'Wilson Clash 100L v3': 'A versão de 280 g da Clash 100 v3, com a mesma rigidez, a menor do catálogo.',
 'Babolat Evo Aero': 'Leve, flexível e com cabeça de 102 pol², por um preço de entrada.',
 'Wilson Clash 100 Pro v3': 'A versão pesada da Clash: 305 g e padrão 16x20, com quadro flexível.',
 'Head Gravity Pro': 'Pesada, flexível, padrão 18x20 fechado e balanço head light.',
 'Prince Phantom 100P': 'Pesada e flexível, com preço abaixo das outras desta faixa. Só uma loja no Brasil na consulta.',
 'Yonex EZONE 105': 'Cabeça de 105 pol² e 275 g: área de acerto grande e fácil de acelerar.',
 'Dunlop CX 200 Tour 18x20': 'A menor cabeça desta lista, 95 pol², com padrão 18x20 fechado e 315 g.',
 'Tecnifibre TF40 315 18x20': 'Pesada, cabeça de 98 pol² e padrão 18x20: bola mais baixa e controlada.',
 'Babolat Pure Strike 97': 'Cabeça de 97 pol², 310 g e balanço head light, com padrão 16x20.',
 'Babolat Pure Aero': '300 g, 100 pol² e 16x19: o padrão aberto ajuda um pouco no spin.',
 'Head Extreme MP XL 2026': 'Versão 0,5 pol mais longa da Extreme MP: mais alcance, com 300 g e 16x19.',
 'Dunlop SX 300': '300 g, 100 pol², 16x19 e quadro rígido, que devolve mais potência.',
 'Dunlop CX 200 LS': 'Cabeça de 98 pol², 290 g e quadro mais flexível que a média. Só uma loja no Brasil na consulta.'
};

const textOf = html => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();

export function paginas(h) {
 const {esc, go, rk} = h;
 const nomes = k => PERFIS[k].picks.slice(0, 3).map(n => rk(n).nome);
 const lista = arr => arr.length > 1 ? arr.slice(0, -1).join(', ') + ' e ' + arr.at(-1) : arr[0];
 const faixa = ([a, b], u = '') => `${a} a ${b}${u}`;
 const zona = z => [`peso de ${faixa(z.peso, ' g')} sem corda`, `swingweight de ${faixa(z.sw)}`, `cabeça de ${faixa(z.cabeca, ' pol²')}`, ...(z.ra ? [`rigidez de ${faixa(z.ra, ' RA')}`] : [])];
 const rodada = h.dateBR(RODADA);

 const pick = (nome, i) => {
  const r = rk(nome);
  return `<li class="rk-pick"><span class="pos">${i + 1}º</span><div class="pk">
   <p class="nm"><b>${esc(r.nome)}</b>${r.ano ? ` <span class="yr">${r.ano}</span>` : ''}</p>
   <ul class="specs" aria-label="Ficha técnica da ${esc(r.nome)}"><li>${r.t.wt}</li><li>${r.t.head}</li><li>${r.t.ra}</li><li>${r.t.pat}</li><li>SW ${r.t.sw}</li><li>${r.t.bal}</li></ul>
   <p class="why">${esc(POR_QUE[nome] || '')}</p>
   <p class="preco"><b>${r.preco}</b>${r.lojas ? ` <span>· ${r.lojas}</span>` : ''}</p>
  </div></li>`;
 };
 const grupo = (k, n = 3, nivel = 'h3') => {
  const p = PERFIS[k];
  return `<div class="perfil" id="perfil-${k.replace(/_/g, '-')}">
   <${nivel}>${esc(p.titulo)}</${nivel}>
   <p class="quem">${esc(p.quem)}</p>
   <p class="zona"><b>O que o motor procura:</b> ${zona(p.zona).join(', ')}.</p>
   <ol class="rk-picks">${p.picks.slice(0, n).map(pick).join('')}</ol>
   ${p.picks.slice(0, n).some(x => rk(x).est) ? `<p class="exemplo">${h.notaEst}</p>` : ''}
   <p class="exemplo"><b>Perfil de exemplo:</b> ${esc(p.resumo)}</p>
  </div>`;
 };
 const tabela = (linhas, legenda) => `<div class="cmp"><div class="tw" tabindex="0" role="region" aria-label="${esc(legenda)}"><table>
   <caption class="sr-only">${esc(legenda)}</caption>
   <thead><tr><th scope="col">Raquete e perfil</th><th scope="col">Peso</th><th scope="col">Cabeça</th><th scope="col">Balanço</th><th scope="col">SW</th><th scope="col">Rigidez</th><th scope="col">Padrão</th><th scope="col">Preço no Brasil</th></tr></thead>
   <tbody>${linhas.map(([nome, perfis]) => {const r = rk(nome); return `<tr><th scope="row">${esc(r.nome)}<span class="perf">${esc(perfis.join(' · '))}</span></th><td>${r.t.wt}</td><td>${r.t.head}</td><td>${r.t.bal}</td><td>${r.t.sw}</td><td>${r.t.ra}</td><td>${r.t.pat}</td><td>${r.preco}${r.lojas ? ` (${r.lojas})` : ''}</td></tr>`}).join('')}</tbody>
  </table></div>${linhas.some(([n]) => rk(n).est) ? `<p class="exemplo">${h.notaEst}</p>` : ''}</div>`;
 const faqHtml = faq => `<div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}</div>`;
 const toc = itens => `<div class="toc"><div class="eyebrow">Neste guia</div><ol>${itens.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></div>`;
 const cta = texto => `<div class="cta-box">
   <button type="button" class="thumb" data-zoom="racket" aria-label="Ampliar relatório de exemplo do RACKET DNA"><img src="assets/reports/racket.webp" alt="" width="1000" height="${h.shotH}" loading="lazy" decoding="async"></button>
   <div class="in"><div class="lockup">${h.mark(32)}<span class="wordmark">Racket <em>DNA</em></span></div>
   <p>${texto}</p>
   <a class="btn btn-area" href="racket/">Fazer o teste grátis <span class="arr">→</span></a></div></div>`;
 const faixaFinal = (titulo, texto) => `<div class="guia-cta"><h2>${titulo}</h2><p>${texto}</p><a class="btn btn-area" href="racket/">Fazer o teste grátis <span class="arr">→</span></a><p class="miudo">Teste e prévia grátis, sem cadastro. Relatório completo por ${h.price('racket-report')}.</p></div>`;
 const selo = '<p class="selo"><span aria-hidden="true">✓</span> Nenhuma marca paga para aparecer nesta lista. Esta página não tem links de loja nem de afiliado. <a ' + go('como-ganhamos-dinheiro') + '>Como ganhamos dinheiro</a>.</p>';
 const metodo = `<p>As listas são o resultado do motor do RACKET DNA, o mesmo do teste, rodado em ${rodada} com perfis de exemplo. Cada perfil é um conjunto completo de respostas (idade, altura, peso, força, fôlego, dor, nível, frequência, swing, topspin, saque, estilo, onde erra e orçamento), com a opção de comprar no Brasil. Mostramos as primeiras colocadas, uma por linha de raquete.</p>
   <p>Peso e balanço são sem corda; swingweight e rigidez (RA), com corda. As fichas vêm de fabricantes, lojas e laboratórios especializados, como a Tennis Warehouse. Os preços são de lojas brasileiras, preço cheio no cartão, consultados em outubro e novembro de 2026. Sem loja no Brasil, mostramos uma estimativa de importada. Preços mudam com promoções, e fichas têm tolerância de fábrica e mudam entre gerações: confira o modelo, o ano e o peso antes de comprar.</p>
   <p>Um perfil de exemplo não é você. Mudou a idade, a força, a dor ou o orçamento, muda a lista. O teste faz a conta com as suas respostas, entre ${h.catalogo} raquetes.</p>`;
 const guiaShell = ({crumb, chip, titulo, dek, date, minutos, nivel, corpo, side}) => `<div class="a-racket"><article class="article guia"><div class="wrap">
  <nav class="crumbs" aria-label="Você está em"><a ${go('inicio')}>Início</a><span>/</span><a ${go('racket')}>RACKET DNA</a><span>/</span><span>${esc(crumb)}</span></nav>
  <div class="art-grid">
   <div style="min-width:0">
    <header class="art-head">
     <div class="meta">${h.icon(24)}<span class="chip area">Raquete de tênis</span><span class="chip">${esc(chip)}</span></div>
     <h1>${titulo}</h1><p class="dek">${dek}</p>
     <div class="by">${h.byline(date)}<span>Nível: ${nivel}</span><span>${minutos} min de leitura</span></div>
    </header>
    ${selo}
    <div class="prose">${corpo}</div>
   </div>
   <div class="side">${side}</div>
  </div>
 </div></article></div>`;
 const paginaGuia = cfg => date => {
  // tempo de leitura: palavras do texto corrido / 200, arredondado para cima (tabelas e fichas ficam de fora)
  const corrido = cfg.corpo.replace(/<table[\s\S]*?<\/table>/g, '').replace(/<ul class="specs"[\s\S]*?<\/ul>/g, '');
  const minutos = Math.max(1, Math.ceil(textOf(corrido).split(' ').length / 200));
  return guiaShell({...cfg, date, minutos});
 };

 /* ---------- Guia principal: melhor raquete de tênis ---------- */
 const todos = ['iniciante', 'intermediario', 'intermediario_avancado', 'avancado', 'cotovelo', 'potencia', 'controle', 'spin', 'ate1400'];
 const linhas = [];
 for (const k of todos) for (const n of PERFIS[k].picks.slice(0, 3)) {
  const l = linhas.find(x => x[0] === n);
  if (l) l[1].push(PERFIS[k].titulo); else linhas.push([n, [PERFIS[k].titulo]]);
 }
 const q = h.quartis;
 const faqHub = [
  ['Qual é a melhor raquete de tênis em 2026?', `Depende do seu corpo, do seu nível e do seu braço. Para um adulto intermediário sem dor, o motor do RACKET DNA colocou ${lista(nomes('intermediario'))} nas primeiras posições do perfil de exemplo. Para iniciante, as primeiras foram ${lista(nomes('iniciante'))}. O teste faz a mesma conta com as suas respostas.`],
  ['Qual raquete de tênis comprar para começar?', `Uma raquete adulta de cerca de ${faixa(PERFIS.iniciante.zona.peso, ' g')} sem corda, cabeça de 100 a 107 pol² e padrão 16x19 costuma funcionar para quem começa. Mais detalhes no <a ${go('raquete-iniciante')}>guia de raquete para iniciante</a>.`],
  ['Raquete mais leve é sempre melhor?', 'Não. Uma raquete leve demais é empurrada pela bola, torce na batida fora do centro e deixa o braço fazer o trabalho de estabilizar. O melhor peso é o mais alto que você acelera sem atrasar o golpe e sem cansar no fim do jogo.'],
  ['Qual a melhor raquete para quem tem dor no cotovelo?', `Quadros mais flexíveis, com peso suficiente para estabilizar e cabeça de 100 pol² ou perto disso, costumam ser descritos como mais confortáveis. No perfil de exemplo, as primeiras foram ${lista(nomes('cotovelo'))}. Dor que não passa pede avaliação de médico ou fisioterapeuta. Veja o <a ${go('raquete-cotovelo')}>guia para dor no cotovelo</a>.`],
  ['Raquete de 98 ou de 100 pol²?', 'A de 100 pol² perdoa mais as batidas fora do centro e dá mais potência. A de 98 pol² dá mais controle para quem já bate forte e acerta o centro com frequência.'],
  ['Quanto custa uma boa raquete de tênis no Brasil?', `Metade das ${q.n} raquetes do catálogo com loja no Brasil custa entre R$ ${h.num(q.q25)} e R$ ${h.num(q.q75)}, preço cheio no cartão, na consulta de outubro e novembro de 2026. Há opções de entrada a partir de cerca de R$ ${h.num(q.min)}.`],
  ['Vale comprar a raquete do meu tenista favorito?', `Só se as especificações combinarem com você. As raquetes da linha dos profissionais costumam ser pesadas, e muitos jogam versões personalizadas. Leia <a ${go('a-raquete-08')}>o erro caro de comprar a raquete do seu ídolo</a>.`],
  ['Alguma marca paga para aparecer nesta lista?', `Não. A lista sai do mesmo motor do teste, rodado com perfis de exemplo, e esta página não tem links de afiliado. Veja <a ${go('como-ganhamos-dinheiro')}>como o SPORT DNA ganha dinheiro</a>.`]
 ];
 const resumoRapido = [
  ['Intermediário sem dor', `${faixa(PERFIS.intermediario.zona.peso, ' g')}, cabeça perto de 100 pol² e padrão 16x19. Primeiras do perfil de exemplo: ${lista(nomes('intermediario'))}.`],
  ['Iniciante', `${faixa(PERFIS.iniciante.zona.peso, ' g')} e cabeça de 100 a 107 pol². Primeiras: ${lista(nomes('iniciante'))}.`],
  ['Dor no cotovelo', `quadro flexível, até ${PERFIS.cotovelo.zona.ra[1]} RA, com peso para estabilizar. Primeiras: ${lista(nomes('cotovelo'))}.`],
  ['Avançado', `${PERFIS.avancado.zona.peso[0]} g ou mais, cabeça de ${faixa(PERFIS.avancado.zona.cabeca, ' pol²')} e balanço head light. Primeiras: ${lista(nomes('avancado'))}.`]
 ];
 const niveis = [['Iniciante', 'iniciante'], ['Intermediário', 'intermediario'], ['Intermediário avançado', 'intermediario_avancado'], ['Avançado', 'avancado']];
 const corpoHub = `
  <p>Não existe uma raquete melhor para todo mundo. Existe a melhor para o seu corpo, o seu nível e o seu braço. Este guia mostra as especificações que decidem a escolha e as raquetes que o motor do RACKET DNA coloca no topo para perfis comuns, com ficha técnica e preço no Brasil.</p>
  <div class="resumo" id="resposta-rapida">
   <h2>Resposta rápida</h2>
   <ul>${resumoRapido.map(([t, d]) => `<li><b>${t}:</b> ${d}</li>`).join('')}</ul>
   <a class="btn btn-area" href="racket/">Descubra a sua em 3 minutos <span class="arr">→</span></a>
  </div>
  <h2 id="como-escolher">Como escolher: as especificações que importam</h2>
  <p>Marca e cor dizem pouco. Cinco números da ficha técnica mudam a sensação na quadra, e eles conversam entre si.</p>
  <h3>Peso</h3>
  <p>Raquetes adultas vão de cerca de 255 a 320 g sem corda. Mais peso dá estabilidade e passa menos tranco para o braço; menos peso facilita acelerar. O melhor peso é o mais alto que você move sem atrasar o golpe. <a ${go('a-raquete-01')}>Como escolher a primeira raquete</a>.</p>
  <h3>Balanço e swingweight</h3>
  <p>O balanço mostra onde fica o peso. Uma raquete head light tem mais massa no cabo e fica ágil na mão; uma head heavy tem mais massa na cabeça e empurra a bola com menos esforço. O swingweight é o peso que você sente durante o golpe e o número que melhor prevê a sensação. <a ${go('a-raquete-02')}>Entenda balanço e swingweight</a>.</p>
  <h3>Tamanho da cabeça</h3>
  <p>Cabeça de 100 pol² é o meio-termo. De 102 a 107 pol², a raquete perdoa mais as batidas fora do centro e dá mais potência. De 95 a 98 pol², dá mais controle para quem acerta o centro. <a ${go('a-raquete-03')}>95, 98, 100 ou 105 pol²</a>.</p>
  <h3>Padrão de cordas</h3>
  <p>O 16x19 é o mais comum. Padrões fechados como o 18x20 deixam a bola mais baixa e controlada. O padrão mais aberto ajuda um pouco no spin; o que mais gera spin é o seu golpe. <a ${go('a-raquete-04')}>Padrão de cordas e tensão</a>.</p>
  <h3>Rigidez (RA)</h3>
  <p>A escala RA mede quanto o aro flexiona: até 63 costuma ser chamada de flexível, de 64 a 67 de média e de 68 para cima de rígida. Quadro rígido devolve mais potência; quadro flexível costuma ser descrito como mais confortável por quem sente o cotovelo. <a ${go('a-raquete-12')}>Rigidez, RA e materiais</a>.</p>
  <p>O grip, a espessura do cabo, não muda o ranking, mas precisa caber na sua mão para você segurar sem apertar demais. <a ${go('a-raquete-05')}>Como medir o grip</a>.</p>
  <div class="spec"><div class="cap">O que o motor procura em cada nível (perfis de exemplo)</div><div class="tw" tabindex="0" role="region" aria-label="Faixas de especificação por nível"><table>
   <thead><tr><th scope="col">Nível</th><th scope="col">Peso sem corda</th><th scope="col">Swingweight</th><th scope="col">Cabeça</th></tr></thead>
   <tbody>${niveis.map(([t, k]) => {const z = PERFIS[k].zona; return `<tr><th scope="row">${t}</th><td>${faixa(z.peso, ' g')}</td><td>${faixa(z.sw)}</td><td>${faixa(z.cabeca, ' pol²')}</td></tr>`}).join('')}</tbody>
  </table></div></div>
  <p>As faixas mudam com força, idade, dor e estilo. Quem tem menos força ou mais idade vai para o lado mais leve; quem sente o braço, para quadros mais flexíveis.</p>
  <h2 id="por-perfil">As melhores raquetes de tênis por perfil</h2>
  <p>Para cada perfil, as três primeiras colocadas do motor, com a ficha técnica do catálogo: peso sem corda, cabeça, rigidez, padrão de cordas, swingweight e balanço sem corda (em mm a partir da ponta do cabo; numa raquete de 27 pol, abaixo de 343 mm é head light).</p>
  ${todos.map(k => grupo(k)).join('')}
  <div class="meio-cta"><p><b>Nenhum perfil é exatamente você?</b> O teste faz a mesma conta com as suas respostas e mostra a análise inteira antes de você pagar.</p><a class="btn btn-area" href="racket/">Descubra a sua em 3 minutos <span class="arr">→</span></a></div>
  <h2 id="comparativo">Tabela comparativa</h2>
  <p>Todas as raquetes deste guia, lado a lado. Peso e balanço são sem corda; swingweight (SW) e rigidez, com corda. Em telas pequenas, deslize a tabela para o lado.</p>
  ${tabela(linhas, 'Tabela comparativa das raquetes do guia')}
  <h2 id="erros">Erros comuns na hora de comprar</h2>
  <ul>
   <li><b>Comprar a raquete do ídolo.</b> A linha dos profissionais costuma ser pesada e exigente. <a ${go('a-raquete-08')}>Leia por quê</a>.</li>
   <li><b>Escolher a mais leve achando que poupa o braço.</b> Leve demais torce e passa mais tranco. <a ${go('a-raquete-06')}>Raquete errada e lesões</a>.</li>
   <li><b>Olhar só o peso.</b> Duas raquetes de 300 g podem ter swingweight bem diferente.</li>
   <li><b>Errar a versão.</b> A mesma linha sai em vários pesos, comprimentos e padrões. Confira peso, ano e padrão no anúncio e no cabo.</li>
   <li><b>Esquecer a corda.</b> Poliéster duro e tenso cansa o braço de quem começa ou sente dor. <a ${go('a-raquete-14')}>Tipos de corda</a>.</li>
  </ul>
  <h2 id="como-montamos">Como montamos esta lista</h2>
  ${metodo}
  <h2 id="perguntas">Perguntas frequentes</h2>
  ${faqHtml(faqHub)}
  ${faixaFinal('Descubra a sua em 3 minutos', `O RACKET DNA cruza seu corpo, seu nível e seu braço com a ficha técnica de ${h.catalogo} raquetes e mostra o porquê de cada escolha.`)}
  <h2 id="leia-tambem">Leia também</h2>
  <ul>
   <li><a ${go('raquete-iniciante')}>Melhor raquete de tênis para iniciante</a></li>
   <li><a ${go('raquete-cotovelo')}>Raquete de tênis para dor no cotovelo</a></li>
   <li><a ${go('a-raquete-10')}>Do iniciante ao avançado: como a raquete acompanha a sua evolução</a></li>
   <li><a ${go('racket')}>Guia completo para escolher raquete de tênis</a></li>
  </ul>`;
 const tocHub = [['resposta-rapida', 'Resposta rápida'], ['como-escolher', 'Como escolher'], ['por-perfil', 'As melhores por perfil'], ['comparativo', 'Tabela comparativa'], ['erros', 'Erros comuns'], ['como-montamos', 'Como montamos a lista'], ['perguntas', 'Perguntas frequentes']];

 /* ---------- Para iniciante ---------- */
 const faqIni = [
  ['Qual a melhor raquete de tênis para iniciante?', `A que perdoa erros enquanto o golpe se forma: leve sem exagero, cabeça grande e balanço que ajuda a gerar potência. No perfil de exemplo, as primeiras do motor foram ${lista(nomes('iniciante'))}. Com menos força, ${lista(nomes('iniciante_menos_forca'))}.`],
  ['Qual o peso ideal de raquete para iniciante?', `Para o adulto que começa, o motor procura cerca de ${faixa(PERFIS.iniciante.zona.peso, ' g')} sem corda. Com menos força ou mais idade, ${faixa(PERFIS.iniciante_menos_forca.zona.peso, ' g')}. Leve demais também atrapalha: a raquete torce e passa mais tranco para o braço.`],
  ['Raquete de iniciante precisa ser barata?', 'Não precisa ser cara. No catálogo, várias opções para quem começa custam de R$ 900 a R$ 1.400. Fuja das raquetes de alumínio vendidas como brinquedo: são muito leves e duras, vibram bastante e não ajudam a desenvolver o golpe.'],
  ['Quando trocar a raquete de iniciante?', `Quando a bola começa a sair longa, você já acerta o centro com frequência e sente que a raquete treme contra bola mais forte. Aí costuma valer subir de peso e ir para cabeça de 100 ou 98 pol². <a ${go('a-raquete-10')}>Como a raquete acompanha a sua evolução</a>.`],
  ['Criança pode usar raquete de adulto?', `A raquete infantil é escolhida pelo comprimento, de 19 a 26 pol, conforme a altura. Não há pressa para passar para a de adulto: a menor não tira velocidade do saque e pesa menos no braço. <a ${go('a-raquete-16')}>Tamanho por idade e altura</a>.`]
 ];
 const corpoIni = `
  <p>A primeira raquete boa tem um trabalho simples: deixar você acertar a bola no lugar certo com pouco esforço e sem dor enquanto o golpe se forma. Ela acompanha meses de aula e de repetição. Este guia mostra o que ela precisa ter e quais raquetes do catálogo do RACKET DNA aparecem no topo para quem está começando.</p>
  <h2 id="o-que-precisa">O que a raquete de iniciante precisa ter</h2>
  <ul>
   <li><b>Peso de ${faixa(PERFIS.iniciante.zona.peso, ' g')} sem corda</b> para o adulto com força na média. Leve o bastante para acelerar, pesada o bastante para não ser empurrada pela bola.</li>
   <li><b>Cabeça de 100 a 107 pol².</b> A área de acerto maior perdoa a batida fora do centro, a mais comum de quem começa.</li>
   <li><b>Balanço neutro ou levemente head light.</b> Nas raquetes mais leves, um pouco mais de peso na cabeça ajuda a gerar potência.</li>
   <li><b>Padrão 16x19.</b> O mais comum, com equilíbrio entre efeito, potência e conforto.</li>
   <li><b>Corda sintética ou multifilamento</b>, em tensão média. Deixe o poliéster para quando o golpe estiver formado.</li>
   <li><b>Grip do tamanho da sua mão.</b> <a ${go('a-raquete-05')}>Veja como medir</a>.</li>
  </ul>
  <div class="spec"><div class="cap">O que o motor procura para iniciante (perfis de exemplo)</div><div class="tw" tabindex="0" role="region" aria-label="Faixas de especificação para iniciante"><table>
   <thead><tr><th scope="col">Perfil</th><th scope="col">Peso sem corda</th><th scope="col">Swingweight</th><th scope="col">Cabeça</th></tr></thead>
   <tbody>${[['Força na média', 'iniciante'], ['Menos força', 'iniciante_menos_forca']].map(([t, k]) => {const z = PERFIS[k].zona; return `<tr><th scope="row">${t}</th><td>${faixa(z.peso, ' g')}</td><td>${faixa(z.sw)}</td><td>${faixa(z.cabeca, ' pol²')}</td></tr>`}).join('')}</tbody>
  </table></div></div>
  <h2 id="modelos">As melhores raquetes para iniciante no catálogo</h2>
  <p>As cinco primeiras colocadas do motor para dois perfis de quem começa, uma por linha de raquete, com a ficha técnica do catálogo.</p>
  ${grupo('iniciante', 5)}
  ${grupo('iniciante_menos_forca', 5)}
  <div class="meio-cta"><p><b>Seu caso é diferente?</b> Idade, altura, força e dor mudam a conta. O teste faz com as suas respostas.</p><a class="btn btn-area" href="racket/">Descubra a sua em 3 minutos <span class="arr">→</span></a></div>
  <h2 id="erros">Erros comuns de quem começa</h2>
  <ul>
   <li><b>Comprar a raquete do profissional.</b> Pesada e com cabeça pequena, ela pune cada batida fora do centro. <a ${go('a-raquete-08')}>O erro caro de comprar a raquete do ídolo</a>.</li>
   <li><b>Ir para o outro extremo.</b> Raquete de alumínio muito leve vibra bastante e não ajuda a desenvolver o golpe.</li>
   <li><b>Corda de poliéster dura.</b> É pensada para quem gera muita velocidade de braço.</li>
   <li><b>Não testar.</b> Se der, bata bola com duas ou três raquetes antes de comprar. Dez minutos de quadra dizem muito.</li>
  </ul>
  <h2 id="como-montamos">Como montamos esta lista</h2>
  ${metodo}
  <h2 id="perguntas">Perguntas frequentes</h2>
  ${faqHtml(faqIni)}
  ${faixaFinal('Descubra a sua em 3 minutos', 'Responda sobre seu corpo, seu nível e seu orçamento. O RACKET DNA mostra a raquete que combina com você e explica o porquê.')}
  <h2 id="leia-tambem">Leia também</h2>
  <ul>
   <li><a ${go('melhor-raquete')}>Melhor raquete de tênis 2026: os modelos por perfil</a></li>
   <li><a ${go('a-raquete-01')}>Como escolher sua primeira raquete de tênis</a></li>
   <li><a ${go('raquete-cotovelo')}>Raquete de tênis para dor no cotovelo</a></li>
  </ul>`;
 const tocIni = [['o-que-precisa', 'O que a raquete precisa ter'], ['modelos', 'As melhores no catálogo'], ['erros', 'Erros comuns'], ['como-montamos', 'Como montamos a lista'], ['perguntas', 'Perguntas frequentes']];

 /* ---------- Dor no cotovelo ---------- */
 const fontesCotovelo = [
  ['Hennig, Rosenbaum e Milani (1992): transferência da vibração da raquete para o antebraço', 'https://journals.lww.com/acsm-msse/abstract/1992/10000/transfer_of_tennis_racket_vibrations_onto_the.11.aspx'],
  ['De Smedt et al. (2007): lateral epicondylitis in tennis, revisão no BJSM', 'https://pubmed.ncbi.nlm.nih.gov/17616547/'],
  ['Hennig (2007): impacto e vibração no braço do tenista, revisão', 'https://pubmed.ncbi.nlm.nih.gov/17417052/'],
  ['Li, Fewtrell e Jenkins (2004): antivibrador não reduz a vibração do quadro no antebraço', 'https://www.semanticscholar.org/paper/String-vibration-dampers-do-not-reduce-racket-frame-Li-Fewtrell/c796118cc54fae9d6feeb896dd6f09968a78301d'],
  ['Mohandhas et al. (2016): tensão da corda e força no cotovelo', 'https://discovery.dundee.ac.uk/en/publications/racquet-string-tension-directly-affects-force-experienced-at-the-/'],
  ['Gruchow e Pelletier (1979): fatores ligados ao cotovelo de tenista em 532 jogadores', 'https://pubmed.ncbi.nlm.nih.gov/474862/']
 ];
 const evidencias = [
  ['Rigidez (RA)', 'Nenhum estudo clínico mostrou que quadro flexível evita ou trata o cotovelo de tenista, e um estudo de laboratório achou menos vibração no braço com quadro mais rígido. Mesmo assim, quadros flexíveis costumam ser descritos como mais confortáveis por quem tem dor, e é o que os especialistas mais indicam.', 'Fraca'],
  ['Peso e swingweight', 'Pela física da batida, uma raquete com mais massa recua menos e manda menos choque para a mão, desde que você consiga acelerá-la sem esforço.', 'Moderada'],
  ['Tamanho da cabeça', 'Batidas fora do centro são as que mais dão tranco no braço, e a cabeça maior perdoa mais essas batidas.', 'Moderada'],
  ['Corda e tensão', 'Tensão mais baixa passou menos força ao cotovelo num estudo de laboratório. Corda macia (multifilamento ou tripa) costuma ser mais confortável; não achamos estudo clínico comparando com poliéster.', 'Fraca'],
  ['Antivibrador', 'Muda o som da batida. Não reduz a vibração do quadro que chega ao braço.', 'Forte'],
  ['Idade e volume de jogo', 'Pesam mais no risco de cotovelo do que qualquer especificação da raquete, junto com a técnica.', 'Moderada']
 ];
 const faqCot = [
  ['Qual a melhor raquete para cotovelo de tenista?', `Não existe raquete que trate o cotovelo de tenista. Para quem sente o braço, quadros flexíveis, com peso para estabilizar e cabeça de 100 pol² ou perto disso costumam incomodar menos. No perfil de exemplo, as primeiras do motor foram ${lista(nomes('cotovelo'))}.`],
  ['Raquete leve é melhor para quem tem dor no cotovelo?', 'Nem sempre. Uma raquete muito leve é empurrada pela bola, torce na batida fora do centro e deixa o braço estabilizar. Um pouco mais de peso costuma ajudar, desde que você consiga acelerar sem esforço. Com dor no ombro ou pouca força, a conta muda.'],
  ['Antivibrador ajuda no cotovelo de tenista?', 'Não para o braço. Estudos controlados mostram que ele muda o som e a sensação da batida, mas não reduz a vibração do quadro que chega ao antebraço.'],
  ['Qual corda e tensão usar com dor no cotovelo?', `Corda macia, como multifilamento ou tripa natural, em tensão mais baixa costuma ser mais confortável. Trocar o poliéster é a mudança mais barata e reversível para testar primeiro. <a ${go('a-raquete-14')}>Tipos de corda</a>.`],
  ['Preciso parar de jogar?', 'Quem decide é um médico ou fisioterapeuta. Dor que piora ao segurar objetos ou não melhora com alguns dias de descanso merece avaliação. A raquete entra como parte do plano, junto com técnica e fortalecimento, nunca como tratamento.']
 ];
 const corpoCot = `
  <div class="aviso" role="note"><p><b>Antes de tudo:</b> este guia é educativo e não substitui avaliação. Dor no cotovelo que não passa, piora ao segurar objetos ou limita o jogo pede um médico ou fisioterapeuta. A raquete é só uma parte: volume de jogo, técnica e fortalecimento pesam mais.</p></div>
  <p>Cotovelo de tenista, ou epicondilite lateral, é a dor na parte de fora do cotovelo ligada à sobrecarga dos tendões que estendem o punho. A raquete não causa nem cura sozinha, mas muda quanto choque chega ao braço a cada batida. Este guia separa o que os estudos mostram do que é só costume e lista as raquetes que o motor do RACKET DNA coloca no topo para quem sente o cotovelo.</p>
  <h2 id="o-que-dizem">O que os estudos dizem e o que não dizem</h2>
  <div class="cmp ev"><div class="tw" tabindex="0" role="region" aria-label="O que os estudos dizem sobre raquete e cotovelo"><table>
   <thead><tr><th scope="col">Fator</th><th scope="col">O que se sabe</th><th scope="col">Força da evidência</th></tr></thead>
   <tbody>${evidencias.map(([f, t, e]) => `<tr><th scope="row">${f}</th><td class="txt">${t}</td><td>${e}</td></tr>`).join('')}</tbody>
  </table></div></div>
  <p>Nos 36 casos de especialistas com dor no braço que usamos para calibrar o teste, a rigidez média das raquetes indicadas foi de 57,5 RA, contra 65 nos demais casos. É prática de quem joga e ensina, não prova de laboratório. Por isso o motor prefere quadros flexíveis para quem sente o braço, mas não deixa a rigidez decidir sozinha.</p>
  <h2 id="especificacoes">As especificações para braço sensível</h2>
  <ul>
   <li><b>Rigidez de ${faixa(PERFIS.cotovelo.zona.ra, ' RA')}.</b> É a faixa que o motor procura quando há dor no cotovelo. No catálogo, o mínimo é 54 RA.</li>
   <li><b>Peso de ${faixa(PERFIS.cotovelo.zona.peso, ' g')} sem corda</b> para o adulto com força na média. Com menos força, ${faixa(PERFIS.cotovelo_menos_forca.zona.peso, ' g')}.</li>
   <li><b>Cabeça de ${faixa(PERFIS.cotovelo.zona.cabeca, ' pol²')}.</b> Área de acerto que perdoa sem deixar a raquete lenta.</li>
   <li><b>Corda macia e tensão mais baixa.</b> Multifilamento ou tripa, na faixa de baixo da recomendada pelo fabricante.</li>
   <li><b>Grip do tamanho da mão.</b> Um cabo do tamanho da sua mão deixa você segurar sem apertar demais, o que costuma ser mais confortável.</li>
  </ul>
  <h2 id="modelos">Raquetes do catálogo para quem sente o cotovelo</h2>
  <p>As quatro primeiras colocadas do motor para três perfis com dor no cotovelo hoje, uma por linha de raquete.</p>
  ${grupo('cotovelo', 4)}
  ${grupo('cotovelo_menos_forca', 4)}
  ${grupo('cotovelo_avancado', 4)}
  <div class="meio-cta"><p><b>Dói o ombro ou o punho?</b> Cada articulação pede um ajuste diferente. O teste pergunta onde dói, a intensidade e se limita o jogo, e calcula um índice de Conforto no braço.</p><a class="btn btn-area" href="racket/">Descubra a sua em 3 minutos <span class="arr">→</span></a></div>
  <h2 id="corda">Corda e tensão: a primeira mudança a testar</h2>
  <p>Antes de trocar de raquete, vale olhar a corda. Poliéster duro e muito tenso endurece a cama de cordas, e poliéster velho perde a elasticidade. Trocar por multifilamento e baixar a tensão é barato, rápido e reversível. Se a dor continuar, a raquete entra na conta. <a ${go('a-raquete-06')}>Raquete errada e lesões</a>.</p>
  <h2 id="como-montamos">Como montamos esta lista</h2>
  ${metodo}
  <h2 id="perguntas">Perguntas frequentes</h2>
  ${faqHtml(faqCot)}
  <h2 id="fontes">Fontes</h2>
  <ul>${fontesCotovelo.map(([t, u]) => `<li><a href="${u}" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>
  ${faixaFinal('Descubra a sua em 3 minutos', 'O RACKET DNA pergunta sobre a sua dor e mostra quanto conforto a raquete precisa ter, sem prometer cura.')}
  <h2 id="leia-tambem">Leia também</h2>
  <ul>
   <li><a ${go('melhor-raquete')}>Melhor raquete de tênis 2026: os modelos por perfil</a></li>
   <li><a ${go('a-raquete-06')}>Raquete errada e lesões: o que o equipamento tem a ver com o cotovelo de tenista</a></li>
   <li><a ${go('a-raquete-12')}>Rigidez, RA e materiais compósitos</a></li>
  </ul>`;
 const tocCot = [['o-que-dizem', 'O que os estudos dizem'], ['especificacoes', 'As especificações'], ['modelos', 'Raquetes do catálogo'], ['corda', 'Corda e tensão'], ['como-montamos', 'Como montamos a lista'], ['perguntas', 'Perguntas frequentes']];
 const ctaTexto = `Descubra a sua em 3 minutos: o teste cruza seu corpo, seu nível e seu braço com ${h.catalogo} raquetes.`;

 /* ---------- Institucionais ---------- */
 const empresa = 'BEYOND THE WORK PORTAIS DE CONTEUDO NA INTERNET LTDA (nome fantasia Beyond the Work Ideas), CNPJ 69.746.447/0001-00, Rua Pais Leme, 215, conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150';
 const email = '<a href="mailto:hi@sportdna.com.br">hi@sportdna.com.br</a>';
 const inst = ({crumb, titulo, dek, date, corpo}) => `<article class="article inst"><div class="wrap">
  <nav class="crumbs" aria-label="Você está em"><a ${go('inicio')}>Início</a><span>/</span><span>${esc(crumb)}</span></nav>
  <header class="art-head"><h1>${titulo}</h1><p class="dek">${dek}</p><div class="by">${h.byline(date, true)}</div></header>
  <div class="prose">${corpo}</div>
 </div></article>`;
 const precos = `<ul>
   <li><b>RACKET DNA</b>, relatório completo da raquete de tênis: ${h.price('racket-report')}. Inclui o comparador de raquetes, que também é vendido sozinho por ${h.price('racket-comparator')}.</li>
   <li><b>SURF DNA</b>, relatório completo da prancha de surf: ${h.price('surf-report')}.</li>
   <li><b>RUN DNA</b>, relatório completo do tênis de corrida: ${h.price('run-report')}.</li>
  </ul>`;

 return [
  {
   key: 'melhor-raquete', area: 'racket', guia: true,
   title: 'Melhor raquete de tênis 2026: qual comprar | SPORT DNA',
   description: 'Qual raquete de tênis comprar em 2026: como escolher peso, balanço, cabeça e RA, e os melhores modelos por perfil, com ficha técnica e preço no Brasil.',
   headline: 'Melhor raquete de tênis 2026: qual comprar para o seu jogo',
   crumb: 'Melhor raquete de tênis 2026',
   og: ['assets/og/melhor-raquete-de-tenis.jpg', 'Guia SPORT DNA: melhor raquete de tênis 2026, com os modelos por perfil e o card do RACKET DNA'],
   faq: faqHub, itemList: linhas.map(l => rk(l[0]).nome), keywords: 'melhor raquete de tênis, qual raquete de tênis comprar, raquete de tênis 2026',
   source: corpoHub,
   body: paginaGuia({crumb: 'Melhor raquete de tênis 2026', chip: 'Guia de compra', titulo: 'Melhor raquete de tênis 2026: qual comprar para o seu jogo', dek: 'Como escolher peso, balanço, cabeça, padrão e rigidez, e as raquetes que o motor do RACKET DNA coloca no topo para cada perfil, com ficha técnica e preço no Brasil.', nivel: 'Todos', corpo: corpoHub, side: cta(ctaTexto) + toc(tocHub)})
  },
  {
   key: 'raquete-iniciante', area: 'racket', guia: true,
   title: 'Melhor raquete de tênis para iniciante em 2026 | SPORT DNA',
   description: 'A primeira raquete boa: peso, cabeça e balanço que perdoam erros, e os modelos do catálogo RACKET DNA para quem está começando, com preço no Brasil.',
   headline: 'Melhor raquete de tênis para iniciante',
   crumb: 'Raquete para iniciante',
   og: ['assets/og/raquete-de-tenis-para-iniciante.jpg', 'Guia SPORT DNA: melhor raquete de tênis para iniciante, com o card do RACKET DNA'],
   faq: faqIni, itemList: [...new Set([...PERFIS.iniciante.picks, ...PERFIS.iniciante_menos_forca.picks])].map(n => rk(n).nome), keywords: 'raquete de tênis para iniciante, primeira raquete de tênis, raquete leve',
   source: corpoIni,
   body: paginaGuia({crumb: 'Raquete para iniciante', chip: 'Guia de compra', titulo: 'Melhor raquete de tênis para iniciante', dek: 'O peso, a cabeça e o balanço que perdoam erros enquanto você aprende, e as raquetes do catálogo que o motor do RACKET DNA coloca no topo para quem está começando.', nivel: 'Iniciante', corpo: corpoIni, side: cta(ctaTexto) + toc(tocIni)})
  },
  {
   key: 'raquete-cotovelo', area: 'racket', guia: true,
   title: 'Raquete de tênis para dor no cotovelo (2026) | SPORT DNA',
   description: 'Raquete para cotovelo de tenista: o que os estudos dizem sobre rigidez, peso, cabeça e corda, e os modelos do catálogo RACKET DNA para braço sensível.',
   headline: 'Raquete de tênis para dor no cotovelo: o que ajuda e quais modelos',
   crumb: 'Raquete para dor no cotovelo',
   og: ['assets/og/raquete-de-tenis-para-dor-no-cotovelo.jpg', 'Guia SPORT DNA: raquete de tênis para dor no cotovelo, com o card do RACKET DNA'],
   faq: faqCot, itemList: [...new Set(['cotovelo', 'cotovelo_menos_forca', 'cotovelo_avancado'].flatMap(k => PERFIS[k].picks))].map(n => rk(n).nome), keywords: 'raquete para cotovelo de tenista, raquete para tennis elbow, raquete de tênis confortável',
   citation: fontesCotovelo.map(f => f[1]),
   source: corpoCot,
   body: paginaGuia({crumb: 'Raquete para dor no cotovelo', chip: 'Guia de compra', titulo: 'Raquete de tênis para dor no cotovelo: o que ajuda e quais modelos', dek: 'O que os estudos dizem sobre rigidez, peso, cabeça, corda e antivibrador, e as raquetes do catálogo que o motor do RACKET DNA coloca no topo para quem sente o cotovelo.', nivel: 'Todos', corpo: corpoCot, side: cta(ctaTexto) + toc(tocCot)})
  },
  {
   key: 'sobre', pageType: 'AboutPage',
   title: 'Sobre o SPORT DNA: quem faz e como recomendamos',
   description: 'Quem faz o SPORT DNA, como os testes RACKET DNA, SURF DNA e RUN DNA chegam a uma recomendação, como o catálogo é montado e por que nenhuma marca paga.',
   crumb: 'Sobre',
   body: date => inst({crumb: 'Sobre', titulo: 'Sobre o SPORT DNA', dek: 'Quem faz, como os testes chegam a uma recomendação e por que nenhuma marca paga para aparecer.', date, corpo: `
    <h2>Quem faz</h2>
    <p>O SPORT DNA é um projeto da Beyond the Work, empresa de São Paulo: ${empresa}. Os testes, os relatórios e os textos do site são feitos pela equipe SPORT DNA.</p>
    <h2>O que fazemos</h2>
    <p>Equipamento caro, erro caro. A maioria das pessoas compra pela marca, pelo ídolo ou pelo vendedor. O SPORT DNA tem três testes que cruzam o seu corpo, o seu nível e o seu estilo com a ficha técnica do equipamento e explicam o porquê de cada escolha:</p>
    <ul>
     <li><a href="racket/">RACKET DNA</a>: a raquete de tênis para o seu jogo e o seu braço.</li>
     <li><a href="surf/">SURF DNA</a>: o tipo, as medidas e a litragem da prancha de surf para o seu nível e o seu mar.</li>
     <li><a href="run/">RUN DNA</a>: o tênis de corrida para o seu corpo, o seu ritmo e o seu objetivo.</li>
    </ul>
    <p>O site também tem <a ${go('blog')}>guias</a> para cada esporte e uma <a href="ferramentas/litragem/">calculadora de litragem</a> de prancha.</p>
    <h2>Como os testes recomendam</h2>
    <ul>
     <li>Você responde perguntas sobre corpo, nível, frequência, estilo, dores e orçamento. Sem cadastro.</li>
     <li>O motor de cada teste transforma as respostas num perfil ideal e compara esse perfil com a ficha técnica de cada equipamento do catálogo. Travas de segurança tiram do topo o que não combina com o seu corpo ou com a sua dor.</li>
     <li>Você vê a análise grátis antes de pagar. O relatório pago revela as primeiras colocadas, com a ficha técnica e a comparação com o que você já tem.</li>
     <li>Mesmas respostas, mesmo resultado. As respostas são processadas no seu navegador e não ficam no nosso servidor.</li>
    </ul>
    <p>Os motores foram calibrados com casos reais e indicações de especialistas: 379 recomendações no RACKET DNA, 422 casos reais de surf no SURF DNA e 234 recomendações no RUN DNA. As regras que mexem com o corpo seguem estudos científicos, e o texto do relatório não promete prevenir nem tratar lesão.</p>
    <h2>Como o catálogo é montado</h2>
    <ul>
     <li><b>RACKET DNA:</b> ${h.catalogo} raquetes, com peso e balanço sem corda e swingweight e rigidez com corda, de fichas de fabricantes, lojas e laboratórios especializados. Preço de lojas brasileiras, preço cheio no cartão; sem loja no Brasil, estimativa de importada.</li>
     <li><b>SURF DNA:</b> 13 tipos de prancha, com medidas comparadas a tabelas oficiais de 12 marcas. O teste recomenda tipo, medidas, litragem e detalhes de shape, não marca nem shaper.</li>
     <li><b>RUN DNA:</b> 212 tênis de 13 marcas, com peso, espuma e drop medidos em laboratório, durabilidade e preço médio no Brasil.</li>
    </ul>
    <p>Fichas técnicas têm tolerância de fábrica e mudam entre gerações, e preços mudam com promoções. Confira o modelo antes de comprar. Achou um erro no catálogo? Escreva para ${email}.</p>
    <h2>Independência</h2>
    <p>Nenhuma marca, loja ou fabricante paga para aparecer no resultado nem para mudar a ordem. O ranking é calculado antes e sem olhar para comissão. Veja <a ${go('como-ganhamos-dinheiro')}>como o SPORT DNA ganha dinheiro</a>.</p>
    <h2>Saúde</h2>
    <p>O conteúdo é educativo. Em caso de dor ou lesão, procure um médico ou fisioterapeuta.</p>
    <h2>Fale com a gente</h2>
    <p>${email} · <a ${go('contato')}>Contato</a> · <a ${go('termos')}>Termos de uso</a> · <a ${go('privacidade')}>Privacidade</a></p>`})
  },
  {
   key: 'contato', pageType: 'ContactPage',
   title: 'Contato | SPORT DNA',
   description: 'Fale com o SPORT DNA: dúvidas sobre os testes e relatórios, problemas com pagamento, desistência da compra, correções no catálogo e privacidade.',
   crumb: 'Contato',
   body: date => inst({crumb: 'Contato', titulo: 'Fale com a gente', dek: 'Dúvidas, problemas com uma compra, correções no catálogo ou pedidos sobre seus dados.', date, corpo: `
    <p class="contato-email">${email}</p>
    <p>Use esse e-mail para:</p>
    <ul>
     <li>dúvidas sobre os testes e os relatórios;</li>
     <li>problemas com pagamento ou com a liberação do relatório;</li>
     <li>desistir de uma compra e pedir a devolução (veja os <a ${go('termos')}>termos de uso</a>);</li>
     <li>avisar de um erro na ficha técnica ou no preço de um equipamento;</li>
     <li>pedidos sobre seus dados pessoais (veja a <a ${go('privacidade')}>política de privacidade</a>);</li>
     <li>parcerias e imprensa.</li>
    </ul>
    <h2>Problema com uma compra</h2>
    <p>Conte qual relatório você comprou (RACKET DNA, SURF DNA ou RUN DNA), a data, o meio de pagamento (Pix ou cartão) e o e-mail usado no pagamento. Nunca envie número de cartão, senha ou código de segurança.</p>
    <h2>Empresa</h2>
    <p>${empresa}.</p>`})
  },
  {
   key: 'termos',
   title: 'Termos de uso | SPORT DNA',
   description: 'Termos de uso do SPORT DNA: preços dos relatórios, pagamento por Pix ou cartão, entrega digital, direito de desistir em 7 dias e limites das recomendações.',
   crumb: 'Termos de uso',
   body: date => inst({crumb: 'Termos de uso', titulo: 'Termos de uso', dek: 'As regras dos testes e dos relatórios pagos do SPORT DNA, em linguagem direta.', date, corpo: `
    <h2>1. Quem oferece</h2>
    <p>O SPORT DNA (sportdna.com.br) é oferecido pela ${empresa}. Contato: ${email}. Ao usar o site, você concorda com estes termos.</p>
    <h2>2. O que é o SPORT DNA</h2>
    <p>Testes que recomendam equipamento esportivo a partir das suas respostas, mais guias educativos. O teste e a prévia com a análise são grátis e não pedem cadastro. O SPORT DNA não vende equipamento.</p>
    <h2>3. Relatórios pagos e preços</h2>
    ${precos}
    <p>O valor cobrado é o mostrado na tela de pagamento, antes de você escolher o meio. É um pagamento único: não é assinatura e não renova. Códigos promocionais, quando oferecidos, liberam um relatório sem cobrança.</p>
    <h2>4. Como pagar</h2>
    <ul>
     <li><b>Pix</b>, processado pelo Mercado Pago. Para gerar o Pix, você informa um e-mail, que é repassado ao Mercado Pago.</li>
     <li><b>Cartão de crédito ou débito</b>, no checkout do Stripe. Os dados do cartão são digitados na página do Stripe e não passam pelo SPORT DNA.</li>
    </ul>
    <h2>5. Entrega</h2>
    <ul>
     <li>A entrega é digital. O relatório abre no próprio navegador assim que o Mercado Pago ou o Stripe confirmam o pagamento. Sem essa confirmação, o relatório não é liberado.</li>
     <li>Você pode baixar o relatório em PDF. Quando a opção aparecer, também pode pedir o envio do texto do relatório para o e-mail usado no pagamento.</li>
     <li>Não há conta de usuário nem recuperação automática em outro aparelho. O relatório fica no navegador em que foi liberado; baixe o PDF para guardar.</li>
     <li>No RACKET DNA e no SURF DNA, você pode corrigir as respostas uma vez depois de pagar, e o relatório é refeito sem novo pagamento.</li>
    </ul>
    <h2 id="arrependimento">6. Direito de desistir em 7 dias</h2>
    <p>Você pode desistir da compra em até 7 dias, contados do pagamento, e receber de volta o valor pago, como prevê o artigo 49 do Código de Defesa do Consumidor.</p>
    <ul>
     <li><b>Como pedir:</b> escreva para ${email} com o e-mail usado no pagamento, o relatório comprado e a data.</li>
     <li><b>Como volta o dinheiro:</b> pelo mesmo meio de pagamento, com estorno no cartão pelo Stripe ou devolução do Pix pelo Mercado Pago. O prazo para o valor aparecer depende do seu banco ou da operadora do cartão.</li>
     <li><b>Depois da devolução</b>, o pedido deixa de liberar o relatório no site.</li>
    </ul>
    <p>Se o relatório não abriu depois do pagamento ou se houve cobrança em duplicidade, escreva para o mesmo e-mail.</p>
    <h2>7. O que a recomendação é e o que não é</h2>
    <ul>
     <li>A recomendação é uma estimativa feita a partir das suas respostas e do catálogo. Respostas diferentes dão resultados diferentes.</li>
     <li>As fichas técnicas vêm de fabricantes, lojas e laboratórios, têm tolerância de fábrica e mudam entre gerações. Os preços são de referência, da data da consulta, e mudam com promoções. Confira modelo, versão e preço antes de comprar e, se puder, teste o equipamento.</li>
     <li>No SURF DNA, medidas e litragem são de referência: confira com a loja ou o shaper.</li>
     <li>O conteúdo é educativo e não substitui avaliação de médico, fisioterapeuta, professor ou treinador. Não prometemos melhora de desempenho nem prevenção de lesão.</li>
    </ul>
    <h2>8. Links de loja, afiliados e parceiros</h2>
    <p>Nenhuma marca paga para aparecer no resultado. Links de afiliado, quando existirem, aparecem só depois da recomendação e são identificados. No SURF DNA, a prévia e o relatório sugerem um especialista parceiro, com quem você pode encomendar a prancha; nesse caso, o SPORT DNA pode receber uma comissão. Detalhes em <a ${go('como-ganhamos-dinheiro')}>como ganhamos dinheiro</a>.</p>
    <h2>9. Uso do conteúdo e marcas</h2>
    <p>Textos, relatórios, imagens e o código do site são do SPORT DNA. Você pode usar o seu relatório e compartilhar os cards de resultado. Nomes de marcas e modelos de equipamento pertencem aos seus donos e aparecem só para identificar o produto; o SPORT DNA não tem relação com os fabricantes.</p>
    <h2>10. Privacidade</h2>
    <p>O que guardamos, o que medimos com o seu aceite e com quem compartilhamos está na <a ${go('privacidade')}>política de privacidade</a>.</p>
    <h2>11. Mudanças e lei aplicável</h2>
    <p>Estes termos podem mudar; a data no topo indica a versão em vigor. Valem as leis brasileiras. Fica eleito o foro da cidade de São Paulo/SP, sem prejuízo do direito do consumidor de usar o foro do seu domicílio.</p>`})
  },
  {
   key: 'como-ganhamos-dinheiro',
   title: 'Como o SPORT DNA ganha dinheiro',
   description: 'De onde vem a receita do SPORT DNA: relatórios pagos, nenhuma posição vendida no resultado, afiliados só depois da recomendação e o especialista de surf.',
   crumb: 'Como ganhamos dinheiro',
   body: date => inst({crumb: 'Como ganhamos dinheiro', titulo: 'Como o SPORT DNA ganha dinheiro', dek: 'De onde vem a receita, o que nunca está à venda e onde pode haver comissão.', date, corpo: `
    <h2>Relatórios pagos</h2>
    <p>A principal receita é a venda dos relatórios completos. O teste e a prévia com a análise são grátis.</p>
    ${precos}
    <h2>O que não está à venda</h2>
    <p>Nenhuma marca, loja ou fabricante paga para aparecer no resultado nem para mudar a ordem. O ranking é calculado antes e sem olhar para comissão. Os guias de compra, como o da <a ${go('melhor-raquete')}>melhor raquete de tênis</a>, saem do mesmo motor dos testes.</p>
    <h2>Links de afiliado</h2>
    <p>Hoje os relatórios não têm links de afiliado. Se passarem a ter, valem estas regras:</p>
    <ul>
     <li>o link aparece só depois da recomendação e não muda a conta;</li>
     <li>o link é identificado como de afiliado;</li>
     <li>a loja pode nos pagar uma comissão, sem custo extra para você.</li>
    </ul>
    <h2>Especialista parceiro no SURF DNA</h2>
    <p>Na prévia grátis e no relatório do SURF DNA, sugerimos um surf coach parceiro, o Gustavo Lucas, que revisa a escolha com você e indica shaper e modelo. Se você encomendar a prancha com ele, o SPORT DNA pode receber uma comissão. Isso não muda as medidas: o tipo, as medidas e a litragem são calculados antes, pelo mesmo motor, para todo mundo. A parceria é declarada ao lado de cada bloco do especialista, e a conversa só começa se você abrir o WhatsApp e enviar a mensagem.</p>
    <h2>Anúncios</h2>
    <p>O site não exibe anúncios hoje. No futuro, os artigos do blog e os guias podem ter anúncios do Google, sempre identificados como publicidade. Os testes, as prévias, o pagamento e os relatórios não terão anúncios, e anunciante nenhum escolhe o que recomendamos. Como os anúncios usam cookies está na <a ${go('privacidade')}>política de privacidade</a>.</p>
    <h2>Dúvidas</h2>
    <p>${email}</p>`})
  }
 ];
}
