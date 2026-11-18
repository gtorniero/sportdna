/* RACKET DNA internacional: mercado, moeda, unidades e disponibilidade.
   Entra inline na página gerada (racket/tools/i18n/build.mjs), antes do motor.
   O motor continua o mesmo do Brasil: aqui só mudam preço de referência, faixas de orçamento,
   disponibilidade por país e a forma de mostrar números. Pesos e critérios ficam iguais. */
(function(){
'use strict';
var MARKETS={
 US:{code:'US',path:'en-us',lang:'en-US',name:'United States',currency:'USD',col:0,units:'imperial',report:'$9.99',
  budget:[[200,'Under $200'],[260,'$200 to $260'],[99999,'Over $260, or no set limit']]},
 GB:{code:'GB',path:'en-gb',lang:'en-GB',name:'United Kingdom',currency:'GBP',col:1,units:'metric',report:'US$9.99',
  budget:[[170,'Under £170'],[230,'£170 to £230'],[99999,'Over £230, or no set limit']]},
 CA:{code:'CA',path:'en-ca',lang:'en-CA',name:'Canada',currency:'CAD',col:2,units:'imperial',report:'US$9.99',
  budget:[[220,'Under $220'],[290,'$220 to $290'],[99999,'Over $290, or no set limit']]},
 AU:{code:'AU',path:'en-au',lang:'en-AU',name:'Australia',currency:'AUD',col:3,units:'metric',report:'US$9.99',
  budget:[[270,'Under $270'],[350,'$270 to $350'],[99999,'Over $350, or no set limit']]}
};
function pick(){
 var q=null;try{q=(new URLSearchParams(location.search).get('market')||'').toUpperCase()}catch(e){}
 if(q==='UK')q='GB';
 if(MARKETS[q])return q;
 var m=/\/en-(us|gb|ca|au)\//.exec(location.pathname||'');if(m)return m[1].toUpperCase();
 var meta=document.documentElement.getAttribute('data-market');return MARKETS[meta]?meta:'US';
}
var M=MARKETS[pick()];
var fmt0=new Intl.NumberFormat(M.lang,{style:'currency',currency:M.currency,maximumFractionDigits:0,minimumFractionDigits:0});
var units=M.units;try{var u=localStorage.getItem('rk_intl_units');if(u==='metric'||u==='imperial')units=u}catch(e){}
window.RK_INTL=Object.freeze({
 market:M.code,lang:M.lang,name:M.name,currency:M.currency,path:M.path,markets:MARKETS,
 report:M.report,budget:M.budget,
 /* ambiente: o checkout internacional só existe no sandbox da Stripe */
 env:'test',
 /* preço de referência local (moeda do país) a partir da tabela embutida no build */
 price:function(id){var p=(window.RK_PRICES||{})[id];return p?p[M.col]:null},
 money:function(n){return fmt0.format(n)},
 /* disponibilidade por país (MVP, a validar com varejo local): todas as marcas do catálogo estão no varejo
    especializado dos quatro mercados; ProKennex segue como marca especialista (mesma regra de produto do Brasil:
    só sobe no ranking para quem tem dor que limita o jogo). Volkl, Tecnifibre, Prince, Dunlop e Solinco são marcas comuns. */
 availability:{marginal:['ProKennex'],nicho:[],brasil:0},
 units:function(){return units},
 setUnits:function(v){units=v==='metric'?'metric':'imperial';try{localStorage.setItem('rk_intl_units',units)}catch(e){}},
 ftin:function(cm){var t=Math.round(cm/2.54);return Math.floor(t/12)+' ft '+(t%12)+' in'},
 lb:function(kg){return Math.round(kg*2.20462)},
 oz:function(g){return (g/28.3495).toFixed(1)},
 /* pontos de balanço (1/8 in): positivo = head light */
 pts:function(bal,len){var p=Math.round((((len||685)/2)-bal)/3.175);return p===0?'even balance':Math.abs(p)+' pts '+(p>0?'HL':'HH')},
 grip:function(n){return ['4','4 1/8','4 1/4','4 3/8','4 1/2','4 5/8'][n]+' in (L'+n+')'}
});
document.documentElement.lang=M.lang;
})();
