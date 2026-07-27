/* PROJECT ELYSIUM — demandas da colônia.
   Diferente de um evento: a demanda fica de pé, com prazo correndo, esperando
   sua decisão. É o que dá textura ao meio do jogo, quando a alocação já parou
   de mudar sozinha e sobrava só clicar "avançar". */
var EL = window.EL || {}; window.EL = EL;

function _dv(st, id) { return st.crew.filter(function (c) { return c.id === id && c.vivo; })[0]; }
function _dt(st, t) { return st.tech.feitas.indexOf(t) >= 0; }
function _dp(st, b) { return st.predios.filter(function (p) { return p.id === b && p.pronto; }).length; }

EL.DEMANDAS = [
{id:'d_canteiros', quem:'okonkwo', prazo:14, peso:function(st){return (st.sol>35&&st.agricultura.lotes.length<14&&_dt(st,'agricultura_bas'))?60:0;},
 t:'Okonkwo quer mais canteiros',
 d:'"Eu consigo alimentar vinte pessoas. Não consigo alimentar vinte pessoas com oito canteiros. A conta não é minha opinião, é aritmética."',
 custo:'4 canteiros construídos, ou o equivalente em pedra e fibra',
 pode:function(st){return (st.mat.pedra>=240&&st.mat.fibra>=60);},
 sim:function(a){ a.mat('pedra',-240); a.mat('fibra',-60);
   for(var i=0;i<4;i++) a.st.agricultura.lotes.push({crop:null,prog:0,saude:100,protegido:false,mult:1});
   a.st.bonus.colheita=(a.st.bonus.colheita||1)*1.05; a.moralOne('okonkwo',+22); a.moralAll(+4);
   a.log('Quatro canteiros novos abertos em dois sols. Okonkwo trabalhou nos dois sem parar.','good'); },
 nao:function(a){ a.moralOne('okonkwo',-20); a.moralAll(-3);
   a.log('Okonkwo não discutiu. Passou a anotar num caderno quantas rações teria colhido.','warn'); }},

{id:'d_muralha', quem:'deng', prazo:18, peso:function(st){return (st.sol>60&&(st.defesa||0)<30)?55:0;},
 t:'Deng quer o perímetro fechado',
 d:'"Os Ceifeiros já aprenderam nosso horário. Eles vêm quando o turno de guarda está mais cansado. Isso não é instinto, é observação — e eles estão observando há sessenta sols."',
 custo:'Uma cerca perimetral erguida',
 pode:function(st){return _dp(st,'cerca')>0||_dp(st,'muralha')>0;},
 sim:function(a){ a.st.bonus.risco=(a.st.bonus.risco||1)*0.85; a.moralOne('deng',+20); a.moralAll(+5);
   a.log('Deng revisou o perímetro inteiro pessoalmente, duas vezes. Dorme um pouco melhor desde então.','good'); },
 nao:function(a){ a.moralOne('deng',-18); a.st.bonus.risco=(a.st.bonus.risco||1)*1.12;
   a.log('Ele não insistiu. Passou a fazer turno duplo de guarda por conta própria.','warn'); }},

{id:'d_folga', quem:'moreau', prazo:8, peso:function(st){return (st.sol>45&&(st.moralMedia||60)<45)?70:0;},
 t:'Moreau pede um sol de folga para todos',
 d:'"Ninguém aqui descansou de verdade desde o pouso. Um sol. Não é generosidade, é manutenção preventiva — e vocês fazem isso com o ATLAS toda semana."',
 custo:'Um sol inteiro de trabalho',
 pode:function(){return true;},
 sim:function(a){ a.perdaTrabalho(1.0); a.moralAll(+22);
   a.st.crew.forEach(function(c){ if(c.vivo) c.fadiga=Math.max(0,c.fadiga-30); });
   a.log('Um sol sem escala. Alguém achou um baralho na seção 2. Ninguém falou de ração, água ou pesquisa.','good'); },
 nao:function(a){ a.moralAll(-9); a.moralOne('moreau',-14);
   a.log('Moreau aceitou a resposta em silêncio, que é o pior jeito de ela aceitar uma resposta.','bad'); }},

{id:'d_ar_brandt', quem:'brandt', prazo:25, peso:function(st){var b=_dv(st,'brandt');return (b&&b.saude<62&&st.sol>70)?85:0;},
 t:'O pulmão de Brandt não aguenta o CO₂',
 d:'Nakamura foi direto: sem ar filtrado, Brandt não chega ao próximo Gélido. Um filtro de zeólita e um circuito fechado resolvem — se houver zeólita e alguém para montar.',
 custo:'40 kg de zeólita e 20 de cerâmica',
 pode:function(st){return st.mat.zeolita>=40&&st.mat.ceramica>=20;},
 sim:function(a){ a.mat('zeolita',-40); a.mat('ceramica',-20);
   var b=_dv(a.st,'brandt'); if(b){ b.saude=Math.min(100,b.saude+28); b.ferimento=null; }
   a.st.flags.arBrandt=true; a.moralAll(+10); a.moralOne('brandt',+18);
   a.log('Brandt reclamou do aparelho por três sols. No quarto, voltou a levantar do banco sem apoio.','good'); },
 nao:function(a){ var b=_dv(a.st,'brandt'); if(b) b.saude=Math.max(5,b.saude-14);
   a.moralAll(-6); a.log('Ninguém disse isso a Brandt. Aduba desconfia, e trabalha mais perto dele desde então.','bad'); }},

{id:'d_escola', quem:'aduba', prazo:20, peso:function(st){return (st.sol>90&&_dp(st,'escola')===0&&_dt(st,'ceramica'))?50:0;},
 t:'Aduba quer uma escola',
 d:'"Eu aprendi tudo o que sei olhando por cima do ombro do Brandt. Isso funciona para uma pessoa. Não funciona para uma colônia — e muito menos para quem vai nascer aqui."',
 custo:'Uma escola construída',
 pode:function(st){return _dp(st,'escola')>0;},
 sim:function(a){ a.st.bonus.ensino=(a.st.bonus.ensino||1)+0.6; a.moralAll(+9); a.moralOne('aduba',+20);
   a.log('Aduba deu a primeira aula. Sete adultos sentados no chão aprendendo a ler um diagrama de circuito.','good'); },
 nao:function(a){ a.moralOne('aduba',-15); a.moralAll(-3);
   a.log('"Tudo bem", ele disse. Continuou olhando por cima do ombro dos outros.','warn'); }},

{id:'d_pesquisa', quem:'antonova', prazo:12, peso:function(st){return (st.sol>55&&st.tech.feitas.length<14)?45:0;},
 t:'Antonova quer prioridade para o laboratório',
 d:'"Vocês estão otimizando a próxima semana. Eu estou tentando otimizar a próxima década. Uma dessas coisas exige que alguém pare de carregar pedra."',
 custo:'Produção de campo reduzida por 20 sols',
 pode:function(){return true;},
 sim:function(a){ a.st.bonus.pesquisa=(a.st.bonus.pesquisa||1)*1.35; a.st.bonus.trabalho=(a.st.bonus.trabalho||1)*0.93;
   a.moralOne('antonova',+18); a.log('Duas bancadas a mais, iluminação decente e ninguém interrompendo. A pesquisa acelerou de verdade.','good'); },
 nao:function(a){ a.moralOne('antonova',-16);
   a.log('Ela voltou ao laboratório sem responder. O projeto do reator ganhou mais três folhas naquela noite.','warn'); }},

{id:'d_memorial', quem:'watanabe', prazo:15, peso:function(st){var w=_dv(st,'watanabe');return (w&&st.sol>25&&!st.flags.memorialFeito&&_dp(st,'memorial')===0)?55:0;},
 t:'Watanabe quer marcar o lugar',
 d:'Ele não pediu com palavras. Apareceu com quatro placas de liga cortadas e polidas, com os nomes gravados, e ficou esperando alguém dizer onde colocar.',
 custo:'Um memorial erguido',
 pode:function(st){return _dp(st,'memorial')>0;},
 sim:function(a){ a.st.flags.memorialFeito=true; a.moralAll(+14); a.moralOne('watanabe',+25);
   a.log('As quatro placas ficaram viradas para o oeste. Watanabe vai lá toda semana, sozinho, e volta melhor do que foi.','good'); },
 nao:function(a){ a.moralOne('watanabe',-22); a.moralAll(-5);
   a.log('Ele guardou as placas na oficina, embrulhadas em pano. Não falou mais no assunto.','bad'); }},

{id:'d_agua_limpa', quem:'kowalczyk', prazo:10, peso:function(st){return (st.aguaContaminada&&st.sol>20)?90:0;},
 t:'Kowalczyk quer parar de envenenar todo mundo',
 d:'"Estamos bebendo do Ferrun sem tratar. Eu sei que temos pressa. Mas cada surto custa mais sols de trabalho do que a estação de filtragem inteira."',
 custo:'Purificação pesquisada e a estação de filtragem construída',
 pode:function(st){return _dt(st,'purificacao_agua')&&_dp(st,'filtro_agua')>0;},
 sim:function(a){ a.st.bonus.doenca=(a.st.bonus.doenca||1)*0.6; a.moralAll(+8); a.moralOne('kowalczyk',+22);
   a.log('Barro poroso, areia graduada, carvão. A estagiária tinha razão desde o sol 6.','good'); },
 nao:function(a){ a.moralOne('kowalczyk',-14); a.st.bonus.doenca=(a.st.bonus.doenca||1)*1.2;
   a.log('Ela passou a ferver a própria água num caneco separado. Três pessoas começaram a imitá-la.','warn'); }},

{id:'d_oficina', quem:'petrov', prazo:16, peso:function(st){return (st.sol>75&&_dt(st,'siderurgia')&&_dp(st,'fundicao')===0)?50:0;},
 t:'Petrov quer uma fundição de verdade',
 d:'"A forja faz quilos. Eu preciso de toneladas. Não dá para construir uma cidade com metal feito uma barra por vez."',
 custo:'Uma fundição construída',
 pode:function(st){return _dp(st,'fundicao')>0;},
 sim:function(a){ a.st.bonus.construcao=(a.st.bonus.construcao||1)+0.12; a.moralOne('petrov',+18); a.moralAll(+5);
   a.log('Alto-forno pequeno, sopro forçado e um Petrov que passou a sorrir ocasionalmente.','good'); },
 nao:function(a){ a.moralOne('petrov',-16);
   a.log('Ele voltou à forja. Continua produzindo o mesmo, e continua achando pouco.','warn'); }},

{id:'d_reserva', quem:'lindqvist', prazo:20, peso:function(st){return (st.sol>100&&(st.diasComida||0)<60&&st.diasComida>15)?55:0;},
 t:'Lindqvist quer uma reserva de emergência',
 d:'"Não estou pedindo mais comida. Estou pedindo que uma parte dela seja intocável. Sessenta sols lacrados que ninguém abre por conveniência — só por catástrofe."',
 custo:'Um silo hermético e 200 rações guardadas',
 pode:function(st){return _dp(st,'silo')>0&&st.mat.comida>=400;},
 sim:function(a){ a.mat('comida',-200); a.st.flags.reservaLacrada=true;
   a.st.bonus.perdaComida=(a.st.bonus.perdaComida||1)*0.6; a.moralAll(+9); a.moralOne('lindqvist',+20);
   a.log('Duzentas rações lacradas com data e assinatura. Lindqvist dorme melhor desde então, e ela precisava.','good'); },
 nao:function(a){ a.moralOne('lindqvist',-15);
   a.log('"Então continuamos vivendo de sol em sol", ela disse, e voltou para a planilha.','warn'); }},

{id:'d_rashid_atlas', quem:'rashid', prazo:14, peso:function(st){return (st.sol>65&&st.robos.atlas.integridade<70)?50:0;},
 t:'Rashid quer reconstruir o ATLAS',
 d:'"Ele não foi feito para isto. Nenhum de nós foi. A diferença é que ele não reclama, então ninguém percebe que está morrendo."',
 custo:'60 kg de aço e 20 de cobre',
 pode:function(st){return st.mat.aco>=60&&st.mat.cobre>=20;},
 sim:function(a){ a.mat('aco',-60); a.mat('cobre',-20);
   a.st.robos.atlas.integridade=Math.min(100,a.st.robos.atlas.integridade+45); a.st.robos.atlas.ativo=true;
   a.moralOne('rashid',+18); a.log('Servo direito refeito do zero, com peça usinada aqui. O ATLAS voltou a escavar como no primeiro sol.','good'); },
 nao:function(a){ a.moralOne('rashid',-14); a.st.robos.atlas.integridade=Math.max(5,a.st.robos.atlas.integridade-8);
   a.log('Rashid continuou remendando com o que tinha. Cada remendo dura menos que o anterior.','warn'); }},

{id:'d_zhao_expedicao', quem:'zhao', prazo:16, peso:function(st){return (st.sol>50&&(st.setoresExplorados||0)<8)?45:0;},
 t:'Zhao quer sair do vale',
 d:'"Conhecemos dois quilômetros de um continente. Tudo que precisamos — fosfato, cobre de verdade, enxofre — está lá fora, e eu sou a única aqui que sabe reconhecer."',
 custo:'Uma expedição concluída',
 pode:function(st){return (st.expedicoesFeitas||0)>0;},
 sim:function(a){ a.st.tech.pp+=45; a.moralOne('zhao',+20); a.moralAll(+5);
   a.log('Ela voltou com o caderno cheio e uma mochila que nenhuma pessoa deveria conseguir carregar. (+PP)','good'); },
 nao:function(a){ a.moralOne('zhao',-16);
   a.log('Zhao continua saindo sozinha, sem avisar, e voltando com pedras no bolso.','warn'); }},

{id:'d_diop_computador', quem:'diop', prazo:22, peso:function(st){return (_dt(st,'semicondutores')&&!_dt(st,'computacao'))?60:0;},
 t:'Diop quer construir o computador',
 d:'Ela falou seis frases seguidas, o que é um recorde. A última foi: "Eu consigo dobrar a velocidade de tudo que fazemos aqui. Só preciso de silício e de que ninguém me interrompa por trinta sols."',
 custo:'Computação pesquisada',
 pode:function(st){return _dt(st,'computacao');},
 sim:function(a){ a.st.bonus.pesquisa=(a.st.bonus.pesquisa||1)*1.2; a.moralOne('diop',+25); a.moralAll(+8);
   a.log('Lógica discreta, memória de núcleo e um compilador escrito à mão. Diop não dormiu por trinta sols e parece dez anos mais nova.','good'); },
 nao:function(a){ a.moralOne('diop',-18);
   a.log('Ela parou de falar de novo. Dessa vez ninguém reparou por doze sols.','bad'); }},

{id:'d_reyes_lab', quem:'reyes', prazo:18, peso:function(st){return (st.sol>85&&_dt(st,'vidraria')&&_dp(st,'laboratorio')===0)?45:0;},
 t:'Reyes quer um laboratório de verdade',
 d:'"Estou fazendo química de precisão numa bancada de campo sob uma lona. Se eu errar uma medida de ácido, não é o experimento que se perde."',
 custo:'Um laboratório permanente construído',
 pode:function(st){return _dp(st,'laboratorio')>0;},
 sim:function(a){ a.st.bonus.pesquisa=(a.st.bonus.pesquisa||1)*1.12; a.moralOne('reyes',+18); a.moralAll(+4);
   a.log('Capela de exaustão, bancada nivelada e vidraria de verdade. Reyes não destila nada além do que devia há trinta sols.','good'); },
 nao:function(a){ a.moralOne('reyes',-15);
   a.log('Ela continuou trabalhando sob a lona. O alambique reapareceu na semana seguinte.','warn'); }}
];

/* ================= MOTOR DAS DEMANDAS ================= */
EL.Demandas = (function () {

  function porId(id) {
    for (var i = 0; i < EL.DEMANDAS.length; i++) if (EL.DEMANDAS[i].id === id) return EL.DEMANDAS[i];
    return null;
  }

  function ativa(st) {
    return (st.demandas && st.demandas.ativa) ? porId(st.demandas.ativa.id) : null;
  }

  /* Sorteia uma nova demanda quando não há nenhuma de pé. */
  function talvezAbrir(st, rng) {
    st.demandas = st.demandas || { ativa: null, atendidas: [], recusadas: [], ultimo: 0 };
    if (st.demandas.ativa) return;
    if (st.sol - (st.demandas.ultimo || 0) < 12) return;
    if (st.sandbox) return;

    var cands = [];
    EL.DEMANDAS.forEach(function (d) {
      if (st.demandas.atendidas.indexOf(d.id) >= 0 || st.demandas.recusadas.indexOf(d.id) >= 0) return;
      if (d.quem && !_dv(st, d.quem)) return;
      var w = d.peso(st);
      if (w > 0) cands.push({ d: d, w: w });
    });
    if (!cands.length) return;
    if (!rng.chance(0.45)) return;

    var esc = rng.weighted(cands, function (x) { return x.w; });
    if (!esc) return;
    st.demandas.ativa = { id: esc.d.id, sol: st.sol, prazo: st.sol + esc.d.prazo };
    st.demandas.ultimo = st.sol;
    EL.logar(st, '◈ ' + esc.d.t, 'evt');
  }

  /* Prazo estourado sem decisão = recusa. */
  function verificarPrazo(st, api) {
    if (!st.demandas || !st.demandas.ativa) return;
    if (st.sol < st.demandas.ativa.prazo) return;
    var d = porId(st.demandas.ativa.id);
    if (d) {
      EL.logar(st, (EL.LANG === 'en' ? 'Nobody answered: ' : 'Ninguém respondeu: ') + d.t + '.', 'warn');
      d.nao(api);
      st.demandas.recusadas.push(d.id);
    }
    st.demandas.ativa = null;
  }

  function resolver(st, aceitar, api) {
    if (!st.demandas || !st.demandas.ativa) return 'nenhuma';
    var d = porId(st.demandas.ativa.id);
    if (!d) { st.demandas.ativa = null; return 'nenhuma'; }
    if (aceitar) {
      if (!d.pode(st)) return EL.LANG === 'en' ? 'Requirements not met yet.' : 'Os requisitos ainda não estão cumpridos.';
      d.sim(api); st.demandas.atendidas.push(d.id);
      EL.logar(st, '✔ ' + d.t, 'good');
    } else {
      d.nao(api); st.demandas.recusadas.push(d.id);
      EL.logar(st, '✖ ' + d.t, 'warn');
    }
    st.demandas.ativa = null;
    return null;
  }

  return { porId: porId, ativa: ativa, talvezAbrir: talvezAbrir, verificarPrazo: verificarPrazo, resolver: resolver };
})();
