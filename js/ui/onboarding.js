/* PROJECT ELYSIUM — tutorial guiado e tela de fim de partida.
   O objetivo dos primeiros sols não é ensinar botões: é ensinar que
   água, comida e fadiga são três relógios correndo ao mesmo tempo. */
var EL = window.EL || {}; window.EL = EL;

EL.Tutorial = (function () {

  function contaPosto(st, filtro) {
    var n = 0;
    st.crew.forEach(function (c) { if (c.vivo && filtro(c.trabalho)) n++; });
    return n;
  }

  /* Cada passo: título, texto, aba sugerida e a condição que o conclui. */
  var PASSOS = [
    { t: 'A água é o primeiro relógio',
      aba: 'trabalho',
      d: 'A reserva de água acaba <b>antes da comida</b> — e ninguém está trabalhando. O Rio Ferrun corre a 1,1 km da base.<br><br>' +
         'Na aba <b>Trabalho</b>, coloque <b>pelo menos 4 pessoas</b> em algum posto “Rio Ferrun”.',
      ok: function (st) { return contaPosto(st, function (j) { return j.indexOf('ext:rio_ferrun') === 0; }) >= 4; },
      feito: 'Água encaminhada. Quatro pessoas carregando balde sustentam a colônia — por enquanto.' },

    { t: 'Ciência não salva ninguém hoje',
      aba: 'trabalho',
      d: 'Pesquisa é lenta e é a única coisa que muda o futuro. Comece agora ou não haverá lavoura a tempo.<br><br>' +
         'Coloque <b>2 pessoas</b> no posto <b>Pesquisa</b>. Prefira quem tem perícia científica alta: Antonova, Raghavan, Reyes ou Diop.',
      ok: function (st) { return contaPosto(st, function (j) { return j === 'pesquisar'; }) >= 2; },
      feito: 'Duas pessoas no laboratório. Há 2 vagas — colocar mais gente não gera mais PP.' },

    { t: 'Escolha a primeira pesquisa',
      aba: 'pesquisa',
      d: 'Na aba <b>Pesquisa</b>, inicie <b>Análise pedológica local</b>.<br><br>' +
         'O solo daqui é loess vulcânico: alcalino, salgado e quase sem nitrogênio. Sem analisá-lo, plantar é apostar.',
      ok: function (st) { return st.tech.ativa.length > 0 || st.tech.feitas.length > 0; },
      feito: 'Pesquisa em andamento. Depois desta, vá para Agricultura de canteiro e Hidrogeologia.' },

    { t: 'Braços para as obras',
      aba: 'trabalho',
      d: 'Nada é construído sozinho. O posto <b>Obras</b> aplica trabalho à fila de construção, e o ATLAS-1 ajuda.<br><br>' +
         'Coloque <b>3 pessoas</b> em <b>Obras</b> e mais <b>2</b> em <b>Argila vermelha</b> — argila é o material da cisterna, do tijolo e do forno.',
      ok: function (st) {
        return contaPosto(st, function (j) { return j === 'construir'; }) >= 3 &&
               contaPosto(st, function (j) { return j.indexOf('ext:argila') === 0; }) >= 1;
      },
      feito: 'Equipe de obras montada.' },

    { t: 'A cisterna primeiro',
      aba: 'construcao',
      d: 'Na aba <b>Construção</b>, inicie uma <b>Cisterna e captação de chuva</b>.<br><br>' +
         'Ela guarda 1.500 L e recolhe chuva sozinha. É a obra mais barata que muda o jogo.',
      ok: function (st) { return st.predios.filter(function (p) { return p.id === 'cisterna'; }).length > 0; },
      feito: 'Cisterna na fila. Materiais já foram descontados do estoque.' },

    { t: 'Deixe gente descansando',
      aba: 'trabalho',
      d: 'A tripulação chegou exausta e o sol daqui tem 27,4 h — o corpo humano não acompanha.<br><br>' +
         'Fadiga acima de 80 causa acidentes e colapsos. Deixe <b>pelo menos 3 pessoas em Descanso</b> e vá alternando quem folga.',
      ok: function (st) { return contaPosto(st, function (j) { return j === 'descanso'; }) >= 3; },
      feito: 'Ninguém aguenta 100 sols seguidos. Rodar folgas é parte da estratégia, não desperdício.' },

    { t: 'Avance o sol',
      aba: null,
      d: 'Está tudo alocado. Clique em <b>AVANÇAR 1 SOL</b> (ou aperte Espaço).<br><br>' +
         'Leia o registro depois: é ali que a colônia conta o que aconteceu.',
      ok: function (st) { return st.sol >= 2; },
      feito: 'Primeiro sol vencido.' },

    { t: 'O vão alimentar',
      aba: 'agricultura',
      d: 'Este é o problema que mata a maioria das colônias.<br><br>' +
         'Você tem <b>40 sols de rações</b>. A batata leva <b>78 sols</b> para ficar pronta. A conta não fecha.<br><br>' +
         'As saídas: <b>racionar</b> (aba Trabalho), plantar <b>Chlorella</b> (22 sols) assim que houver canteiros, e abrir <b>mais canteiros do que parece necessário</b>.',
      ok: function (st) { return st.sol >= 4; },
      feito: 'Você foi avisado. A partir daqui, a colônia é sua.' }
  ];

  function passoAtual(st) {
    if (!st.tutorial || !st.tutorial.ativo) return null;
    if (st.tutorial.passo >= PASSOS.length) return null;
    return PASSOS[st.tutorial.passo];
  }

  /* Avança automaticamente enquanto as condições já estiverem satisfeitas. */
  function verificar(st) {
    if (!st.tutorial || !st.tutorial.ativo) return false;
    var mudou = false;
    while (st.tutorial.passo < PASSOS.length && PASSOS[st.tutorial.passo].ok(st)) {
      var p = PASSOS[st.tutorial.passo];
      EL.logar(st, '✔ ' + p.feito, 'good');
      st.tutorial.passo++;
      mudou = true;
    }
    if (st.tutorial.passo >= PASSOS.length && st.tutorial.ativo) {
      st.tutorial.ativo = false;
      EL.logar(st, 'Fim da orientação inicial. O manual completo continua em COMO_JOGAR.md.', 'info');
    }
    return mudou;
  }

  function html(st) {
    var p = passoAtual(st);
    if (!p) return '';
    var n = st.tutorial.passo + 1, tot = PASSOS.length;
    var h = '<div class="tut">';
    h += '<div class="tut-h"><span class="tut-n">ORIENTAÇÃO ' + n + '/' + tot + '</span>' +
         '<button class="tut-x" data-tut="fechar" title="Dispensar orientação">dispensar ✕</button></div>';
    h += '<h4>' + p.t + '</h4><p>' + p.d + '</p>';
    if (p.aba) h += '<button class="act" data-tut-aba="' + p.aba + '">Ir para a aba indicada ▸</button>';
    h += '<div class="tut-bar"><i style="width:' + Math.round(st.tutorial.passo / tot * 100) + '%"></i></div>';
    h += '</div>';
    return h;
  }

  return { html: html, verificar: verificar, passoAtual: passoAtual, PASSOS: PASSOS };
})();


/* ================= TELA DE FIM DE PARTIDA ================= */
EL.Fim = (function () {

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* Mini-gráfico da população e do estoque ao longo da partida (SVG puro). */
  function grafico(st) {
    var h = st.hist || [];
    if (h.length < 3) return '';
    var W = 560, H = 110, max = 0;
    h.forEach(function (p) { if (p.p > max) max = p.p; });
    if (!max) max = 1;
    var passo = Math.max(1, Math.floor(h.length / 240));
    var pts = [], pontosMoral = [];
    for (var i = 0; i < h.length; i += passo) {
      var x = (i / (h.length - 1)) * W;
      pts.push(x.toFixed(1) + ',' + (H - (h[i].p / max) * (H - 12) - 6).toFixed(1));
      pontosMoral.push(x.toFixed(1) + ',' + (H - (h[i].m / 100) * (H - 12) - 6).toFixed(1));
    }
    var s = '<svg class="fim-graf" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">';
    s += '<polyline points="' + pontosMoral.join(' ') + '" fill="none" stroke="#4fd1c5" stroke-width="1" opacity=".55"/>';
    s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#e8a33d" stroke-width="2"/>';
    s += '</svg>';
    s += '<div class="fim-leg"><span style="color:#e8a33d">— população (máx ' + max + ')</span> ' +
         '<span style="color:#4fd1c5">— moral média</span></div>';
    return s;
  }

  function textoCompartilhavel(st) {
    var v = EL.Sim.vivos(st).length;
    var l = 'PROJECT ELYSIUM — ' + (st.fimDeJogo && st.fimDeJogo.tipo === 'vitoria' ? 'CIVILIZAÇÃO' : 'colônia perdida') + '\n';
    l += 'Sobrevivi ' + st.sol + ' sols (' + (st.sol / 402).toFixed(1) + ' anos de Elysium) · ' + EL.DIFICULDADE[st.dif].n + '\n';
    l += v + ' vivos · ' + st.mortos.length + ' mortos · ' + st.tech.feitas.length + '/' + EL.TECH.length + ' tecnologias\n';
    if (st.fimDeJogo && st.fimDeJogo.causa) l += 'Fim: ' + st.fimDeJogo.causa + '\n';
    if (st.marcos && st.marcos.length) l += 'Último marco: ' + st.marcos[st.marcos.length - 1].txt + '\n';
    l += 'Semente: ' + (st.seedStr || '—');
    return l;
  }

  function html(st) {
    var vit = st.fimDeJogo.tipo === 'vitoria';
    var v = EL.Sim.vivos(st).length;
    var anos = (st.sol / EL.PLANET.anoSols).toFixed(1);
    var h = '<div class="fim' + (vit ? ' vit' : '') + '">';
    h += '<div class="fim-selo">' + (vit ? '★' : '☠') + '</div>';
    h += '<h2>' + (vit ? 'ELYSIUM É UMA CIVILIZAÇÃO' : 'A COLÔNIA ACABOU') + '</h2>';
    h += '<p class="fim-sub">' + esc(st.fimDeJogo.txt) + '</p>';

    h += '<div class="fim-num">';
    h += num(st.sol, 'sols sobrevividos', anos + ' anos de Elysium');
    h += num(v, 'vivos no fim', st.mortos.length + ' mortos ao todo');
    h += num(st.tech.feitas.length + '/' + EL.TECH.length, 'tecnologias', 'de 6 tiers');
    h += num(st.predios.filter(function (p) { return p.pronto; }).length, 'edificações', st.stats.colheitas + ' colheitas');
    h += '</div>';

    if (st.fimDeJogo.causa) h += '<div class="fim-causa">O que acabou com a colônia: <b>' + esc(st.fimDeJogo.causa) + '</b></div>';

    h += grafico(st);

    if (st.marcos && st.marcos.length) {
      h += '<h4 class="fim-h">O QUE VOCÊS CONSEGUIRAM</h4><div class="fim-marcos">';
      st.marcos.forEach(function (m) { h += '<div><span>sol ' + m.sol + '</span> ' + esc(m.txt) + '</div>'; });
      h += '</div>';
    }

    var restantes = [];
    if (!EL.Sim.tem(st, 'eletricidade')) restantes.push('nunca gerou eletricidade');
    if (!st.stats.colheitas) restantes.push('nunca colheu nada');
    if (!st.stats.nascidos) restantes.push('nenhuma criança nasceu');
    if (restantes.length) h += '<div class="fim-falta">E o que não deu tempo: ' + esc(restantes.join(' · ')) + '.</div>';

    h += '<h4 class="fim-h">MEMORIAL</h4><div class="fim-mortos">';
    st.mortos.slice(0, 26).forEach(function (m) {
      h += '<div><b>' + esc(m.nome) + '</b> <span>' + esc(m.causa) + (m.sol ? ' · sol ' + m.sol : ' · no pouso') + '</span></div>';
    });
    if (st.mortos.length > 26) h += '<div><span>e mais ' + (st.mortos.length - 26) + '…</span></div>';
    h += '</div>';

    h += '<pre class="fim-share" id="fimShare">' + esc(textoCompartilhavel(st)) + '</pre>';
    h += '<div class="fim-acts">' +
      '<button class="act" data-fim="copiar">Copiar resultado</button> ' +
      '<button class="act" data-fim="rever">Rever a partida</button> ' +
      '<button class="act on" data-fim="nova">NOVA COLÔNIA</button></div>';
    h += '<p class="fim-dica">' + esc(dica(st)) + '</p>';
    h += '</div>';
    return h;
  }

  function num(v, l, s) {
    return '<div class="fim-n"><b>' + v + '</b><span>' + l + '</span><i>' + s + '</i></div>';
  }

  /* Uma lição concreta, baseada no que realmente falhou. */
  function dica(st) {
    var c = (st.fimDeJogo.causa || '').toLowerCase();
    if (c.indexOf('desidrat') >= 0)
      return 'Da próxima: água antes de tudo. Uma Cisterna no sol 2 e um Poço escavado assim que sair Hidrogeologia mudam a partida inteira.';
    if (c.indexOf('inani') >= 0 || c.indexOf('fome') >= 0)
      return 'Da próxima: corte a ração cedo, ainda com folga, e plante Chlorella (22 sols) antes de pensar em batata (78 sols).';
    if (c.indexOf('hipoterm') >= 0)
      return 'Da próxima: abrigo isolado e reserva de energia antes do Gélido. Tenda não segura −24 °C.';
    if (c.indexOf('sepse') >= 0 || c.indexOf('infec') >= 0 || c.indexOf('fratura') >= 0)
      return 'Da próxima: mantenha alguém na Enfermaria desde o sol 1 e pesquise Medicina de campo cedo. Ferimento sem tratamento vira morte.';
    if (c.indexOf('ceifeiro') >= 0)
      return 'Da próxima: uma Cerca perimetral custa pouco e alguém na Guarda reduz muito o dano dos Ceifeiros.';
    if (st.tech.feitas.length < 6)
      return 'Da próxima: duas pessoas fixas na Pesquisa desde o sol 1. Tecnologia demora, e nada demora tanto quanto começar tarde.';
    return 'Da próxima: olhe o Balanço de energia todos os turnos. Construir demais sem gerar mais energia derruba a colônia inteira.';
  }

  return { html: html, textoCompartilhavel: textoCompartilhavel };
})();
