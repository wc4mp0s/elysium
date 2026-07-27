/* PROJECT ELYSIUM — cartão de resultado em imagem (canvas → PNG).
   É o que as pessoas realmente postam. Texto puro ninguém compartilha. */
var EL = window.EL || {}; window.EL = EL;

EL.Cartao = (function () {

  var W = 1200, H = 630;
  var COR = { bg:'#0a0e13', bg2:'#131b25', linha:'#243244', txt:'#c9d6e2',
              dim:'#7d8fa3', dim2:'#56677a', amber:'#e8a33d', cyan:'#4fd1c5',
              green:'#63c98a', red:'#e05c5c' };
  var F = '"SF Mono", Menlo, Consolas, monospace';

  function desenhar(st) {
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var en = EL.LANG === 'en';
    var vit = !!(st.fimDeJogo && st.fimDeJogo.tipo === 'vitoria');
    var vivos = EL.Sim.vivos(st).length;

    /* fundo com vinheta */
    c.fillStyle = COR.bg; c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(W / 2, 90, 40, W / 2, 90, 780);
    g.addColorStop(0, vit ? '#16281f' : '#1c1418');
    g.addColorStop(1, COR.bg);
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    /* estrelas */
    c.fillStyle = COR.txt;
    var pos = [[90,70],[240,44],[420,96],[610,52],[790,84],[980,60],[1120,110],[160,150],[1050,168]];
    pos.forEach(function (p, i) {
      c.globalAlpha = 0.2 + (i % 4) * 0.12;
      c.beginPath(); c.arc(p[0], p[1], 1.6, 0, 6.3); c.fill();
    });
    c.globalAlpha = 1;

    /* faixa superior */
    c.fillStyle = vit ? COR.green : COR.red;
    c.fillRect(0, 0, W, 5);

    /* cabeçalho */
    c.textAlign = 'left';
    c.font = '500 22px ' + F; c.fillStyle = COR.amber;
    c.fillText('PROJECT', 60, 78);
    c.font = '700 40px ' + F; c.fillStyle = COR.txt;
    c.fillText('ELYSIUM', 60, 124);

    c.textAlign = 'right';
    c.font = '500 20px ' + F; c.fillStyle = COR.dim;
    if (st.diario) {
      c.fillText((en ? 'DAILY CHALLENGE' : 'DESAFIO DIÁRIO') + ' #' + st.diarioDia, W - 60, 78);
      c.font = '400 15px ' + F; c.fillStyle = COR.dim2;
      c.fillText(st.diarioData || '', W - 60, 104);
    } else {
      c.fillText((en ? 'seed' : 'semente') + ' · ' + (st.seedStr || '—'), W - 60, 78);
      c.font = '400 15px ' + F; c.fillStyle = COR.dim2;
      c.fillText(EL.DIFICULDADE[st.dif].n, W - 60, 104);
    }

    /* veredito */
    c.textAlign = 'left';
    c.font = '700 27px ' + F; c.fillStyle = vit ? COR.green : COR.red;
    c.fillText(vit ? (en ? 'ELYSIUM IS A CIVILISATION' : 'ELYSIUM É UMA CIVILIZAÇÃO')
                   : (en ? 'THE COLONY IS GONE' : 'A COLÔNIA ACABOU'), 60, 190);

    /* números */
    var nums = [
      [String(st.sol), en ? 'sols survived' : 'sols sobrevividos'],
      [String(vivos), en ? 'alive' : 'vivos'],
      [st.tech.feitas.length + '/' + EL.TECH.length, en ? 'technologies' : 'tecnologias'],
      [String(st.stats.colheitas), en ? 'harvests' : 'colheitas']
    ];
    nums.forEach(function (n, i) {
      var x = 60 + i * 200;
      c.fillStyle = COR.bg2; c.fillRect(x, 218, 180, 96);
      c.strokeStyle = COR.linha; c.lineWidth = 1; c.strokeRect(x + 0.5, 218.5, 179, 95);
      c.textAlign = 'center';
      c.font = '700 38px ' + F; c.fillStyle = COR.amber;
      c.fillText(n[0], x + 90, 268);
      c.font = '400 13px ' + F; c.fillStyle = COR.dim;
      c.fillText(n[1], x + 90, 295);
    });

    /* gráfico de população e moral */
    var hist = st.hist || [];
    var gx = 60, gy = 350, gw = W - 120, gh = 120;
    c.fillStyle = '#080c11'; c.fillRect(gx, gy, gw, gh);
    c.strokeStyle = COR.linha; c.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
    if (hist.length > 2) {
      var max = 1;
      hist.forEach(function (p) { if (p.p > max) max = p.p; });
      function linha(campo, div, cor, esp, alpha) {
        c.beginPath();
        for (var i = 0; i < hist.length; i++) {
          var x = gx + (i / (hist.length - 1)) * gw;
          var y = gy + gh - (hist[i][campo] / div) * (gh - 16) - 8;
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.globalAlpha = alpha; c.strokeStyle = cor; c.lineWidth = esp; c.stroke();
        c.globalAlpha = 1;
      }
      linha('m', 100, COR.cyan, 1.5, 0.6);
      linha('p', max, COR.amber, 2.5, 1);
      c.textAlign = 'left';
      c.font = '400 12px ' + F; c.fillStyle = COR.dim2;
      c.fillText((en ? 'population' : 'população') + ' · ' + (en ? 'morale' : 'moral'), gx + 8, gy + gh - 8);
    } else {
      c.textAlign = 'center';
      c.font = '400 13px ' + F; c.fillStyle = COR.dim2;
      c.fillText(en ? 'run too short to chart' : 'partida curta demais para o gráfico', W / 2, gy + gh / 2 + 4);
    }

    /* marcos */
    var ids = (st.marcos || []).map(function (m) { return m.id; });
    c.textAlign = 'left';
    c.font = '400 13px ' + F; c.fillStyle = COR.dim2;
    c.fillText(en ? 'MILESTONES' : 'MARCOS', 60, 508);
    EL.Diario.SELOS.forEach(function (s, i) {
      var x = 60 + i * 52, feito = ids.indexOf(s.id) >= 0;
      c.globalAlpha = feito ? 1 : 0.18;
      c.font = '30px ' + F;
      c.fillText(feito ? s.e : '⬛', x, 548);
      c.globalAlpha = 1;
    });

    /* causa do fim */
    if (st.fimDeJogo && st.fimDeJogo.causa) {
      c.textAlign = 'right';
      c.font = '400 15px ' + F; c.fillStyle = COR.dim;
      c.fillText((en ? 'Ended by: ' : 'Fim: ') + st.fimDeJogo.causa, W - 60, 543);
    }

    /* rodapé */
    c.fillStyle = COR.linha; c.fillRect(60, 578, W - 120, 1);
    c.textAlign = 'left';
    c.font = '400 15px ' + F; c.fillStyle = COR.amber;
    c.fillText('wc4mp0s.github.io/elysium', 60, 604);
    c.textAlign = 'right';
    c.font = '400 13px ' + F; c.fillStyle = COR.dim2;
    c.fillText(en ? 'a colonisation simulator · free · no install'
                  : 'simulador de colonização · grátis · sem instalar', W - 60, 604);

    return cv;
  }

  function baixar(st) {
    var cv = desenhar(st);
    var a = document.createElement('a');
    a.download = 'elysium-' + (st.diario ? 'desafio' + st.diarioDia : 'sol' + st.sol) + '.png';
    a.href = cv.toDataURL('image/png');
    a.click();
  }

  function copiar(st, cb) {
    var cv = desenhar(st);
    if (!cv.toBlob || !navigator.clipboard || !window.ClipboardItem) { cb(false); return; }
    cv.toBlob(function (blob) {
      if (!blob) { cb(false); return; }
      navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
        .then(function () { cb(true); }, function () { cb(false); });
    }, 'image/png');
  }

  function dataURL(st) { return desenhar(st).toDataURL('image/png'); }

  return { desenhar: desenhar, baixar: baixar, copiar: copiar, dataURL: dataURL };
})();
