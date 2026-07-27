/* PROJECT ELYSIUM — conquistas.
   Permanentes, guardadas no navegador, verificadas a cada sol.
   Nenhuma delas dá vantagem: são objetivos para quem já sabe jogar. */
var EL = window.EL || {}; window.EL = EL;

function _v(st) { return EL.Sim.vivos(st).length; }
function _t(st, x) { return st.tech.feitas.indexOf(x) >= 0; }
function _m(st, x) { return (st.marcos || []).some(function (a) { return a.id === x; }); }
function _p(st, x) { return st.predios.filter(function (p) { return p.id === x && p.pronto; }).length; }

EL.CONQUISTAS = [
/* ---------- sobrevivência ---------- */
{id:'c_sol50',  n:'Um mês e meio',        d:'Chegue ao sol 50.',                          ok:function(st){return st.sol>=50;}},
{id:'c_sol100', n:'Cem sols',             d:'Chegue ao sol 100.',                         ok:function(st){return st.sol>=100;}},
{id:'c_sol402', n:'Um ano de Elysium',    d:'Sobreviva a um ano local inteiro: 402 sols.',ok:function(st){return st.sol>=402;}},
{id:'c_sol1000',n:'Mil sols',             d:'Chegue ao sol 1000. Quase três anos locais.',ok:function(st){return st.sol>=1000;}},
{id:'c_gelido', n:'Passou o Gélido',      d:'Atravesse um inverno completo sem perder ninguém para o frio.',
  ok:function(st){return st.sol>402 && !st.mortos.some(function(m){return /Hipoterm/i.test(m.causa);});}},
{id:'c_semmorte',n:'Ninguém a mais',      d:'Chegue ao sol 200 sem perder um único sobrevivente do pouso.',
  ok:function(st){return st.sol>=200 && st.mortos.length<=4;}},
{id:'c_ano_limpo',n:'O primeiro ano limpo',d:'Complete o ano 1 com os vinte ainda vivos.',
  ok:function(st){return st.sol>=402 && _v(st)>=20;}},

/* ---------- recursos ---------- */
{id:'c_agua',    n:'Sede resolvida',      d:'Produza mais água do que consome.',          ok:function(st){return _m(st,'autoAgua');}},
{id:'c_comida',  n:'Fome resolvida',      d:'Chegue a 120 sols de reserva alimentar.',    ok:function(st){return _m(st,'autoComida');}},
{id:'c_poco',    n:'Trinta e quatro metros',d:'Construa um poço até o aquífero de basalto.',ok:function(st){return _p(st,'poco_raso')+_p(st,'poco')>0;}},
{id:'c_silo',    n:'Nada se perde',       d:'Construa um silo hermético.',                ok:function(st){return _p(st,'silo')>0;}},
{id:'c_colheita20',n:'Vinte colheitas',   d:'Faça 20 colheitas numa mesma partida.',      ok:function(st){return st.stats.colheitas>=20;}},
{id:'c_estufa',  n:'Verde sob vidro',     d:'Construa 5 estufas.',                        ok:function(st){return _p(st,'estufa')>=5;}},

/* ---------- indústria ---------- */
{id:'c_ferro',   n:'O primeiro metal',    d:'Funda a primeira barra de ferro de Elysium.',ok:function(st){return _m(st,'metal');}},
{id:'c_aco',     n:'Aço',                 d:'Produza 500 kg de aço.',                     ok:function(st){return st.mat.aco>=500;}},
{id:'c_eletric', n:'Que se faça a luz',   d:'Gere eletricidade.',                         ok:function(st){return _t(st,'eletricidade');}},
{id:'c_maquinas',n:'A máquina que faz máquinas',d:'Pesquise máquinas-ferramenta.',        ok:function(st){return _t(st,'maquinas_ferr');}},
{id:'c_comput',  n:'Diop tem onde trabalhar',d:'Chegue à computação.',                    ok:function(st){return _t(st,'computacao');}},
{id:'c_fissao',  n:'Antonova sorriu',     d:'Construa um reator de fissão.',              ok:function(st){return _p(st,'reator_fissao')>0;}},
{id:'c_fusao',   n:'Energia sem fim',     d:'Construa um reator de fusão.',               ok:function(st){return _p(st,'tokamak')>0;}},
{id:'c_tec40',   n:'Quarenta tecnologias',d:'Conclua 40 pesquisas numa partida.',         ok:function(st){return st.tech.feitas.length>=40;}},
{id:'c_tecall',  n:'A biblioteca inteira',d:'Conclua as 74 tecnologias.',                 ok:function(st){return st.tech.feitas.length>=74;}},

/* ---------- pessoas ---------- */
{id:'c_nasc',    n:'A primeira de Elysium',d:'Uma criança nasce na colônia.',             ok:function(st){return st.stats.nascidos>=1;}},
{id:'c_nasc10',  n:'Um povo',             d:'Dez pessoas nascidas em Elysium.',           ok:function(st){return st.stats.nascidos>=10;}},
{id:'c_pop40',   n:'Quarenta',            d:'Chegue a 40 habitantes.',                    ok:function(st){return _v(st)>=40;}},
{id:'c_moral',   n:'Contra tudo',         d:'Mantenha a moral média acima de 75 no sol 150.',
  ok:function(st){return st.sol>=150 && (st.moralMedia||0)>75;}},
{id:'c_aduba',   n:'O aprendiz',          d:'Leve Samuel Aduba ao nível 8 em alguma perícia.',
  ok:function(st){var c=st.crew.filter(function(x){return x.id==='aduba';})[0];
    if(!c||!c.vivo)return false; for(var k in c.per) if(c.per[k]>=8) return true; return false;}},
{id:'c_watanabe',n:'Ele voltou',          d:'Watanabe supera o luto e chega ao sol 150 vivo.',
  ok:function(st){var c=st.crew.filter(function(x){return x.id==='watanabe';})[0];
    return !!(c&&c.vivo&&st.sol>=150&&c.tracos.indexOf('luto')<0);}},
{id:'c_salazar', n:'De volta aos pés',    d:'Salve a perna de Salazar.',
  ok:function(st){return st.flags.salazarResolvido==='haste'||st.flags.salazarResolvido==='consolidou';}},
{id:'c_enterro', n:'Como se deve',        d:'Enterre os quatro do pouso com cerimônia.',  ok:function(st){return !!st.flags.enterrados;}},

/* ---------- exploração e Anomalia ---------- */
{id:'c_mapa20',  n:'Cartógrafo',          d:'Levante 20 setores do continente.',          ok:function(st){return (st.setoresExplorados||0)>=20;}},
{id:'c_cavernas',n:'Sob a montanha',      d:'Descubra as Cavernas de Kore.',              ok:function(st){return !!st.flags.cavernas;}},
{id:'c_anom1',   n:'Ângulos retos',       d:'Escave a câmara da Anomalia.',               ok:function(st){return typeof st.flags.anomalia==='number'&&st.flags.anomalia>=1;}},
{id:'c_anom4',   n:'Não é linguagem',     d:'Decifre os doze pulsos.',                    ok:function(st){return typeof st.flags.anomalia==='number'&&st.flags.anomalia>=4;}},
{id:'c_anom6',   n:'Agora somos nós',     d:'Leia o arquivo da Anomalia.',                ok:function(st){return st.flags.anomalia===6;}},
{id:'c_selar',   n:'De quem vier depois', d:'Sele a câmara de I7 em vez de lê-la.',       ok:function(st){return st.flags.anomalia==='selada2';}},

/* ---------- vitória e proezas ---------- */
{id:'c_espaco',  n:'O primeiro voo',      d:'Pesquise propulsão orbital.',                ok:function(st){return _t(st,'foguetes');}},
{id:'c_vitoria', n:'Elysium respira',     d:'Complete a terraformação.',                  ok:function(st){return _t(st,'terraformacao');}},
{id:'c_vit_semanom',n:'Sem ajuda nenhuma',d:'Vença sem nunca escavar a Anomalia.',
  ok:function(st){return _t(st,'terraformacao') && !st.flags.anomalia;}},
{id:'c_extremo', n:'Realismo Extremo',    d:'Chegue ao sol 300 na dificuldade Extremo.',  ok:function(st){return st.dif==='extremo'&&st.sol>=300;}},
{id:'c_brutal',  n:'Brutal',              d:'Chegue ao sol 200 na dificuldade Brutal.',   ok:function(st){return st.dif==='brutal'&&st.sol>=200;}},

/* ---------- cenários ---------- */
{id:'c_cen_inverno', n:'O Inverno de Ferro', d:'Vença o cenário O Inverno de Ferro.',  ok:function(st){return st.cenario==='inverno'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_sozinho', n:'Sozinho',            d:'Vença o cenário Sozinho.',             ok:function(st){return st.cenario==='sozinho'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_tanque',  n:'O Tanque Rompeu',    d:'Vença o cenário O Tanque Rompeu.',     ok:function(st){return st.cenario==='tanque'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_tabula',  n:'Tabula Rasa',        d:'Vença o cenário Tabula Rasa.',         ok:function(st){return st.cenario==='tabula'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_anom',    n:'A Anomalia Primeiro',d:'Vença o cenário A Anomalia Primeiro.', ok:function(st){return st.cenario==='anomalia'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_enxame',  n:'A Estação da Poeira',d:'Vença o cenário A Estação da Poeira.', ok:function(st){return st.cenario==='enxame'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_geracao', n:'A Segunda Geração',  d:'Vença o cenário A Segunda Geração.',   ok:function(st){return st.cenario==='geracao'&&st.fimDeJogo&&st.fimDeJogo.tipo==='vitoria';}},
{id:'c_cen_todos',   n:'Todos os cenários',  d:'Vença os sete cenários com objetivo.',
  ok:function(){ var a=EL.Conquistas.ler();
    return ['c_cen_inverno','c_cen_sozinho','c_cen_tanque','c_cen_tabula','c_cen_anom','c_cen_enxame','c_cen_geracao']
      .every(function(id){return !!a[id];}); }},

/* ---------- desafio diário ---------- */
{id:'c_diario7',  n:'Uma semana',   d:'Sete desafios diários seguidos.', ok:function(){return EL.Diario.sequencia()>=7;}},
{id:'c_diario30', n:'Um mês',       d:'Trinta desafios diários seguidos.',ok:function(){return EL.Diario.sequencia()>=30;}}
];

/* ================= ESTADO PERSISTENTE ================= */
EL.Conquistas = (function () {
  var CHAVE = 'elysium_conquistas';

  function ler() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function gravar(a) { try { localStorage.setItem(CHAVE, JSON.stringify(a)); } catch (e) {} }
  function quantas() { return Object.keys(ler()).length; }
  function total() { return EL.CONQUISTAS.length; }

  /* Verifica as conquistas da partida. Sandbox não conta. */
  function verificar(st) {
    if (st.sandbox) return [];
    var a = ler(), novas = [];
    EL.CONQUISTAS.forEach(function (c) {
      if (a[c.id]) return;
      var ok = false;
      try { ok = c.ok(st); } catch (e) { ok = false; }
      if (ok) { a[c.id] = { sol: st.sol, data: new Date().toISOString().slice(0, 10) }; novas.push(c); }
    });
    if (novas.length) gravar(a);
    return novas;
  }

  return { ler: ler, quantas: quantas, total: total, verificar: verificar };
})();
