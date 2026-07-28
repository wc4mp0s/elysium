/* PROJECT ELYSIUM — conselhos de meio de jogo.
   A orientação inicial ensina os primeiros quatro sols e depois cala para sempre.
   O problema é que a colônia não morre no sol 4: morre no 300, por coisas que o
   jogo nunca explicou — a ração cortada que ninguém restaurou, o prédio que
   desabou levando a lavoura junto, o laboratório perdido que zera a pesquisa.

   Isto aqui não é uma fila: é um conjunto de conselhos que esperam a situação
   acontecer. Cada um aparece uma única vez, quando é útil, e some. */
var EL = window.EL || {}; window.EL = EL;

EL.Conselhos = (function () {

  function trabalhando(st, job) {
    var n = 0;
    st.crew.forEach(function (c) { if (c.vivo && c.trabalho === job) n++; });
    return n;
  }

  /* Ordem importa: o primeiro cuja condição bate é o que aparece. */
  var LISTA = [

    { id: 'agua_resolvida', aba: 'agricultura', prio: 1,
      t: 'A água parou de ser o problema',
      d: 'A reserva já cobre mais de 60 sols e continua subindo. Isso liberta gente do balde — e o próximo relógio é a comida.<br><br>' +
         'Tire pessoas da extração de água e ponha em <b>Agricultura</b> e <b>Obras</b>. ' +
         'Canteiro é a construção que mais muda o meio de jogo: <b>plante mais do que parece necessário</b>, porque parte da lavoura sempre morre.',
      quando: function (st, R) { return st.sol > 25 && R.diasAgua > 60 && R.aguaNet > 0 && R.diasComida < 60; } },

    { id: 'racao_esquecida', aba: null, prio: 0,
      t: 'A colônia ainda está de meia ração',
      d: 'Em algum momento você cortou a ração para esticar o estoque. O corte <b>nunca se desfaz sozinho</b>, ' +
         'e hoje há comida de sobra no silo.<br><br>' +
         'Ração cortada mantém a fome alta e a moral baixa <i>permanentemente</i>: menos trabalho, menos pesquisa, ' +
         'nenhuma gravidez. Volte para 100% na aba <b>Trabalho</b>, na barra de política.',
      quando: function (st, R) { return st.politica.racaoComida < 0.95 && R.diasComida > 45; } },

    { id: 'manutencao', aba: 'trabalho', prio: 0,
      t: 'Os prédios estão apodrecendo',
      d: 'Nenhuma pessoa está no posto de <b>Manutenção</b> e a base já tem estrutura demais para se sustentar sozinha.<br><br>' +
         'Prédio sem manutenção perde integridade todo sol e acaba desabando. Quando uma estufa desaba, ' +
         '<b>metade da lavoura dentro dela morre junto</b> — e reerguer custa quase metade de construir do zero. ' +
         'Uma pessoa fixa em Manutenção segura cerca de vinte construções.',
      quando: function (st) {
        var n = st.predios.filter(function (p) { return p.pronto; }).length;
        return st.sol > 40 && n >= 8 && trabalhando(st, 'manutencao') === 0;
      } },

    { id: 'abrigo_frio', aba: 'construcao', prio: 0,
      t: 'Tem gente dormindo ao relento',
      d: 'Falta cama para parte da tripulação e as noites já entram abaixo de zero.<br><br>' +
         'Quem dorme fora perde saúde toda noite de geada e acorda mais cansado — é um dreno constante que ' +
         'não aparece em lugar nenhum até alguém morrer de “colapso orgânico”. ' +
         'Abrigo é barato perto do que custa perder uma pessoa.',
      quando: function (st, R) { return R.abrigoDeficit > 0 && st.clima.tempMin < 3; } },

    { id: 'laboratorio', aba: 'construcao', prio: 0,
      t: 'Não há laboratório de pé',
      d: 'Há gente no posto de Pesquisa e nenhuma bancada onde trabalhar. Sem laboratório a pesquisa rende ' +
         '<b>um quarto</b> do normal — as pessoas continuam ocupadas e o progresso quase não anda.<br><br>' +
         'Reerguer ou construir um laboratório é, quase sempre, a obra mais rentável do momento.',
      quando: function (st, R) { return st.sol > 30 && R.labSlots <= 0 && trabalhando(st, 'pesquisar') > 0; } },

    { id: 'solo', aba: 'agricultura', prio: 1,
      t: 'O solo está se esgotando',
      d: 'A lavoura consome nitrogênio, fósforo e potássio mais rápido do que a terra repõe. Lote faminto ' +
         'cresce devagar e adoece.<br><br>' +
         'Três saídas, e vale usar as três: extrair <b>nitrato</b>, <b>fosfato</b> e <b>silvita</b> no mapa, ' +
         'pesquisar <b>Compostagem</b> e <b>Biodigestão</b>, e não abrir canteiro novo mais rápido do que consegue adubar.',
      quando: function (st) {
        var s = st.agricultura.solo;
        var lot = st.agricultura.lotes.filter(function (l) { return l.crop; }).length;
        return lot >= 6 && (s.n < 30 || s.p < 25 || s.k < 25);
      } },

    { id: 'doutrina', aba: 'pesquisa', prio: 2,
      t: 'Uma encruzilhada se abriu',
      d: 'A colônia chegou a um ponto em que precisa escolher <b>o que vai ser</b>, e as opções se excluem.<br><br>' +
         'Diferente da pesquisa, uma doutrina <b>fecha os outros caminhos para sempre</b>. Não existe escolha certa: ' +
         'existe a escolha coerente com a colônia que você já tem. Olhe o que está faltando antes de decidir.',
      quando: function (st) { return !!st.doutrinaPendente; } },

    { id: 'expedicao', aba: 'mapa', prio: 2,
      t: 'Dá para mandar gente longe agora',
      d: 'Setores explorados o bastante já aceitam <b>expedição</b>: uma equipe sai por vários sols e volta com ' +
         'material que a base não produz, mais pontos de pesquisa.<br><br>' +
         'O custo é real — quem vai não trabalha em casa, e há risco de acidente. Mande <b>4 a 6 pessoas</b>: ' +
         'equipe pequena se machuca muito mais. Alguém com perícia de sobrevivência alta reduz bastante o risco.',
      quando: function (st) {
        return st.sol > 60 && (!st.exped || !st.exped.ativa) && EL.Exped &&
               EL.Exped.setoresAlvo(st).length >= 2 && st.stats && !st.stats.expedicoes;
      } },

    { id: 'gelido', aba: 'construcao', prio: 1,
      t: 'O Gélido está chegando',
      d: 'Faltam menos de 20 sols para a estação fria. Ela dura muito e cobra em três frentes ao mesmo tempo: ' +
         'a lavoura desprotegida congela, o abrigo insuficiente vira mortalidade, e a geração solar cai.<br><br>' +
         'Antes que comece: cubra o que der (<b>estufa</b>), garanta cama para todos, e leve o estoque de comida ' +
         'para além do que parece exagero.',
      quando: function (st) { return st.clima.solAno > 282 && st.clima.solAno < 302; } },

    { id: 'industria', aba: 'oficina', prio: 3,
      t: 'Sobra braço: comece a indústria',
      d: 'Comida e água estão garantidas por bastante tempo. A partir daqui a colônia deixa de sobreviver ' +
         'e começa a construir.<br><br>' +
         'Ponha gente em <b>Fabricação</b> e na <b>Oficina</b>: ferramenta boa multiplica todo o resto do jogo, ' +
         'e sem cadeia de metal não existe eletricidade, nem medicina moderna, nem terraformação.',
      quando: function (st, R) {
        return st.sol > 80 && R.diasComida > 60 && R.diasAgua > 60 && trabalhando(st, 'fabricar') === 0;
      } },

    { id: 'cadeia_vidro', aba: 'oficina', prio: 1,
      t: 'Tijolo e vidro travam metade do jogo',
      d: 'Estufa, alojamento de alvenaria, laboratório permanente e hospital — todos exigem <b>vidro</b>, ' +
         'e a colônia não produz nenhum. Sem eles a lavoura congela todo Gélido, falta cama quando nascem ' +
         'crianças e a pesquisa nunca acelera.<br><br>' +
         'A cadeia inteira é: <b>areia</b> + <b>calcário</b> + <b>carvão vegetal</b> → cal → vidro, na <b>Oficina</b>. ' +
         'Areia e calcário ficam longe da base: é para isso que serve o <b>Posto avançado</b>, que abre a extração ' +
         'em setores distantes. E alguém precisa estar no posto de <b>Oficina</b>, ou a fila não anda.',
      quando: function (st) {
        return st.sol > 90 && EL.Sim.tem(st, 'ceramica') && (st.mat.vidro || 0) < 60 &&
               st.predios.filter(function (p) { return p.pronto && p.id === 'estufa'; }).length === 0;
      } },

    { id: 'oficina_parada', aba: 'trabalho', prio: 0,
      t: 'A oficina tem fila e ninguém trabalhando nela',
      d: 'Há receitas esperando e nenhuma pessoa no posto de <b>Oficina</b>. A fila não anda sozinha — ' +
         'fica parada até alguém ser alocado.<br><br>' +
         'Vale conferir também se falta insumo: uma receita sem material fica travada, avisa uma vez ' +
         'e sai da fila sozinha depois de trinta sols.',
      quando: function (st) {
        return st.filaProducao && st.filaProducao.length > 0 && trabalhando(st, 'fabricar') === 0 && st.sol > 50;
      } },

    { id: 'crescer', aba: null, prio: 3,
      t: 'Esta colônia pode crescer',
      d: 'Moral alta, comida garantida e ninguém passando fome: são as condições em que nasce gente em Elysium.<br><br>' +
         'Crianças não trabalham — comem menos que um adulto, mas comem. Em compensação, ' +
         '<b>a vitória exige 30 habitantes</b>, e vinte pessoas não chegam lá sozinhas. ' +
         'Um hospital e a medicina moderna mudam muito o desfecho de um parto.',
      quando: function (st, R) {
        return st.sol > 110 && R.moralMedia > 55 && st.comidaSegura && !st.stats.nascidos;
      } },

    { id: 'demanda_prazo', aba: 'trabalho', prio: 0,
      t: 'Um prazo está vencendo',
      d: 'Há um pedido aceito com prazo curto. Cumprir rende material e moral; falhar cobra moral e confiança.<br><br>' +
         'Se já não dá para entregar, é melhor reorganizar o trabalho agora do que descobrir no último sol.',
      quando: function (st) {
        var a = st.demandas && st.demandas.ativa;
        if (!a) return false;
        var falta = a.prazo - st.sol;
        return falta > 0 && falta <= 6;
      } }
  ];

  function porId(id) {
    for (var i = 0; i < LISTA.length; i++) if (LISTA[i].id === id) return LISTA[i];
    return null;
  }

  /* O conselho de maior prioridade que se aplica agora e ainda não foi visto. */
  function atual(st, R) {
    if (!st || st.fimDeJogo) return null;
    if (st.tutorial && st.tutorial.ativo) return null;   // não competir com a orientação inicial
    st.conselhos = st.conselhos || { vistos: {} };
    if (st.conselhos.desligado) return null;
    var melhor = null;
    for (var i = 0; i < LISTA.length; i++) {
      var c = LISTA[i];
      if (st.conselhos.vistos[c.id]) continue;
      var bate = false;
      try { bate = !!c.quando(st, R); } catch (e) { bate = false; }
      if (!bate) continue;
      if (!melhor || c.prio < melhor.prio) melhor = c;
    }
    return melhor;
  }

  function marcarVisto(st, id) {
    st.conselhos = st.conselhos || { vistos: {} };
    st.conselhos.vistos[id] = true;
  }

  function desligar(st) {
    st.conselhos = st.conselhos || { vistos: {} };
    st.conselhos.desligado = true;
  }

  function html(st, R) {
    var c = atual(st, R);
    if (!c) return '';
    var h = '<div class="tut conselho">';
    h += '<div class="tut-h"><span class="tut-n">CONSELHO</span>' +
         '<button class="tut-x" data-cons="fechar" data-id="' + c.id + '" title="Entendi">entendi ✕</button></div>';
    h += '<h4>' + c.t + '</h4><p>' + c.d + '</p>';
    if (c.aba) h += '<button class="act" data-cons-aba="' + c.aba + '" data-id="' + c.id + '">Ir para a aba indicada ▸</button>';
    h += '<button class="tut-nunca" data-cons="nunca">não mostrar conselhos</button>';
    h += '</div>';
    return h;
  }

  return { html: html, atual: atual, marcarVisto: marcarVisto, desligar: desligar, porId: porId, LISTA: LISTA };
})();
