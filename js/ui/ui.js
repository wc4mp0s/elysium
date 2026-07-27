/* PROJECT ELYSIUM — interface */
var EL = window.EL || {}; window.EL = EL;

EL.UI = (function () {
  var st = null, tab = 'visao', mapSel = EL.BASE_SETOR;

  function $(s) { return document.querySelector(s); }
  function fmt(n, d) { if (n === undefined || n === null || isNaN(n)) return '—'; d = d === undefined ? 0 : d; return Number(n).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cls(v, bom, ruim) { return v >= bom ? 'good' : (v <= ruim ? 'bad' : 'warn'); }

  function setState(s) { st = s; }

  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    setTimeout(function () { t.classList.remove('on'); }, 2200);
  }

  /* ================= DIÁLOGOS DO SISTEMA =================
     Substituem alert()/confirm() nativos, que quebram a identidade visual.
     opts: {titulo, texto, nota, icone, perigo, ok, cancelar}
     cb(true) se confirmado, cb(false) se cancelado/fechado. */
  var _dlgCb = null;
  function dialogo(opts, cb) {
    _dlgCb = cb || null;
    var box = $('#dialogBox'), wrap = $('#dialog');
    box.className = 'dlg' + (opts.perigo ? ' perigo' : '');
    var h = '';
    h += '<div class="dlg-ico">' + (opts.icone || (opts.perigo ? '⚠' : '▣')) + '</div>';
    h += '<h3>' + esc(opts.titulo || 'AVISO') + '</h3>';
    h += '<p>' + (opts.texto || '') + '</p>';
    if (opts.nota) h += '<p class="sub-nota">' + esc(opts.nota) + '</p>';
    h += '<div class="dlg-acts">';
    if (opts.cancelar !== false) h += '<button data-dlg="0">' + esc(opts.cancelar || 'Cancelar') + '</button>';
    h += '<button class="' + (opts.perigo ? 'dgr' : 'pri') + '" data-dlg="1">' + esc(opts.ok || 'OK') + '</button>';
    h += '</div>';
    box.innerHTML = EL.tHTML(h);
    wrap.classList.remove('hidden');
    var b = box.querySelector('button[data-dlg="1"]');
    if (b) b.focus();
  }
  function fecharDialogo(ok) {
    $('#dialog').classList.add('hidden');
    var cb = _dlgCb; _dlgCb = null;
    if (cb) cb(!!ok);
  }
  function avisar(titulo, texto, nota) {
    dialogo({ titulo: titulo, texto: texto, nota: nota, cancelar: false, ok: 'Entendi' });
  }

  /* ================= TOPO E LATERAL ================= */
  function renderTopo(R) {
    $('#hdSol').textContent = st.sol;
    $('#hdDate').textContent = 'Ano ' + st.ano + ' · ' + st.clima.estacaoNome + ' ' + st.clima.solAno + '/100';
    $('#hdWeather').textContent = st.clima.cond.toUpperCase() + ' · ' + st.clima.temp + '°C / mín ' + st.clima.tempMin + '°C · vento ' +
      st.clima.ventoF.toFixed(2) + ' · maré ' + st.clima.mare + ' m' + (st.clima.flare ? ' · ⚡FLARE' : '');
    $('#hdStats').innerHTML =
      '<span>POP <b>' + R.pop + '</b></span>' +
      '<span>MORAL <b class="' + cls(R.moralMedia, 60, 35) + '">' + Math.round(R.moralMedia) + '</b></span>' +
      '<span>SAÚDE <b class="' + cls(R.saudeMedia, 70, 45) + '">' + Math.round(R.saudeMedia) + '</b></span>' +
      '<span>FADIGA <b class="' + cls(100 - R.fadigaMedia, 55, 25) + '">' + Math.round(R.fadigaMedia) + '</b></span>' +
      '<span>PP <b>' + fmt(st.tech.pp, 0) + '</b></span>';

    var al = [];
    if (R.diasAgua < 8) al.push(['crit', 'ÁGUA: ' + R.diasAgua.toFixed(1) + ' sols']);
    else if (R.diasAgua < 20) al.push(['warn', 'Água: ' + R.diasAgua.toFixed(0) + ' sols']);
    if (R.diasComida < 10) al.push(['crit', 'COMIDA: ' + R.diasComida.toFixed(1) + ' sols']);
    else if (R.diasComida < 25) al.push(['warn', 'Comida: ' + R.diasComida.toFixed(0) + ' sols']);
    if (R.balanco < 0) al.push([st.energia.armazenada < Math.abs(R.balanco) * 4 ? 'crit' : 'warn',
      'Energia ' + R.balanco.toFixed(1) + ' kWh/sol · bateria ' + Math.round(st.energia.armazenada) + '/' + Math.round(st.energia.capacidade)]);
    if (R.abrigoDeficit > 0) al.push(['crit', Math.ceil(R.abrigoDeficit) + ' sem abrigo · mín ' + st.clima.tempMin + '°C']);
    if (st.aguaContaminada) al.push(['crit', 'Água NÃO potável — risco de surto']);
    if (R.moralMedia < 35) al.push(['crit', 'Moral crítica']);
    if (!st.robos.atlas.ativo) al.push(['warn', 'ATLAS-1 parado']);
    if (!st.impressora.ok) al.push(['warn', 'Impressora 3D quebrada']);
    if (st.tech.ativa.length === 0) al.push(['info', 'Nenhuma pesquisa em andamento']);
    if (st.agricultura.lotes.filter(function (l) { return !l.crop; }).length && st.mat.semente > 0.3)
      al.push(['info', 'Lotes vazios disponíveis']);
    $('#alertBar').innerHTML = EL.tHTML(al.map(function (a) { return '<div class="alert ' + a[0] + '">' + esc(a[1]) + '</div>'; }).join(''));
  }

  function renderSide(R) {
    var v = '';
    v += row('Água', fmt(st.mat.agua) + ' L', cls(R.diasAgua, 25, 8), R.diasAgua / 40);
    v += '<div class="sub">' + R.diasAgua.toFixed(1) + ' sols · líquido ' + (R.aguaPassiva - R.aguaLiquida - R.aguaUso).toFixed(0) + ' L/sol · recicl. ' + Math.round(R.reciclador * 100) + '%</div>';
    v += row('Comida', fmt(st.mat.comida) + ' rações', cls(R.diasComida, 40, 12), R.diasComida / 60);
    v += '<div class="sub">' + R.diasComida.toFixed(1) + ' sols · consumo ' + R.comidaDia.toFixed(1) + '/sol</div>';
    v += row('Abrigo', R.pop + '/' + R.abrigo, R.abrigoDeficit > 0 ? 'bad' : 'good', Math.min(1, R.abrigo / Math.max(1, R.pop)));
    v += row('Defesa', Math.round(R.defesa), cls(R.defesa, 40, 10), R.defesa / 100);
    $('#vitals').innerHTML = EL.tHTML(v);

    var e = '';
    e += row('Bateria', Math.round(st.energia.armazenada) + '/' + Math.round(st.energia.capacidade) + ' kWh',
      cls(st.energia.armazenada / Math.max(1, st.energia.capacidade), 0.5, 0.2), st.energia.armazenada / Math.max(1, st.energia.capacidade));
    e += row('Geração', R.gen.toFixed(1) + ' kWh', 'good');
    e += row('Demanda', R.dem.toFixed(1) + ' kWh', 'warn');
    e += row('Balanço', (R.balanco >= 0 ? '+' : '') + R.balanco.toFixed(1) + ' kWh', R.balanco >= 0 ? 'good' : 'bad');
    e += '<div class="sub">Sujeira nos painéis: ' + Math.round(st.energia.sujeira * 100) + '% · luz solar ' + Math.round(st.clima.solarF * 100) + '%</div>';
    $('#energyPanel').innerHTML = EL.tHTML(e);

    var m = '', ks = Object.keys(st.mat).filter(function (k) { return st.mat[k] > 0.05 && k !== 'agua' && k !== 'comida'; });
    ks.sort(function (a, b) { return st.mat[b] - st.mat[a]; });
    if (!ks.length) m = '<div class="sub">Nenhum material estocado. Colete.</div>';
    ks.forEach(function (k) { m += row(EL.MAT[k].n, fmt(st.mat[k], st.mat[k] < 10 ? 1 : 0) + ' ' + EL.MAT[k].u, ''); });
    $('#matsPanel').innerHTML = EL.tHTML(m);

    var q = '';
    q += row('ATLAS-1', Math.round(st.robos.atlas.integridade) + '%' + (st.robos.atlas.ativo ? '' : ' (PARADO)'),
      st.robos.atlas.ativo ? cls(st.robos.atlas.integridade, 70, 35) : 'bad', st.robos.atlas.integridade / 100);
    q += '<div class="sub">Tarefa: ' + esc(st.robos.atlas.tarefa) + (st.robos.atlas.overclock ? ' · OVERCLOCK' : '') + '</div>';
    q += row('KITE', Math.round(st.robos.kite.integridade) + '%' + (st.robos.kite.ativo ? '' : ' (PERDIDO)'),
      st.robos.kite.ativo ? cls(st.robos.kite.integridade, 70, 35) : 'bad', st.robos.kite.integridade / 100);
    q += '<div class="sub">Alvo: ' + (st.robos.kite.alvo || 'nenhum') + (st.robos.kite.rps ? ' · RPS ativo' : ' · RPS offline') + '</div>';
    q += row('Vulcan-M', st.impressora.ok ? 'operacional' : 'QUEBRADA', st.impressora.ok ? 'good' : 'bad');
    q += row('Casco', fmt(st.casco.restante + st.casco.sucataRestante) + ' kg restantes', '');
    $('#machPanel').innerHTML = EL.tHTML(q);

    /* faixa compacta sempre visível no celular */
    function vs(k, val, d, c) {
      return '<div class="vs"><span class="vk">' + k + '</span><span class="vv ' + c + '">' + val +
             '</span><span class="vd">' + d + '</span></div>';
    }
    $('#vitStrip').innerHTML =
      vs('ÁGUA', fmt(st.mat.agua), R.diasAgua.toFixed(0) + ' sols', cls(R.diasAgua, 25, 8)) +
      vs('COMIDA', fmt(st.mat.comida), R.diasComida.toFixed(0) + ' sols', cls(R.diasComida, 40, 12)) +
      vs('ENERGIA', Math.round(st.energia.armazenada), (R.balanco >= 0 ? '+' : '') + R.balanco.toFixed(1) + ' kWh',
         R.balanco >= 0 ? 'good' : 'bad') +
      vs('ABRIGO', R.pop + '/' + R.abrigo, R.abrigoDeficit ? 'faltam ' + Math.ceil(R.abrigoDeficit) : 'ok',
         R.abrigoDeficit ? 'bad' : 'good');
  }
  function row(k, v, c, bar) {
    var s = '<div class="row"><span class="k">' + esc(k) + '</span><span class="v ' + (c || '') + '">' + esc(v) + '</span></div>';
    if (bar !== undefined) s += '<div class="bar"><i class="' + (c || '') + '" style="width:' + Math.max(0, Math.min(100, bar * 100)) + '%"></i></div>';
    return s;
  }

  function renderBottom(R) {
    var livres = 0, ocup = {};
    EL.Sim.vivos(st).forEach(function (c) {
      var j = c.trabalho;
      ocup[j] = (ocup[j] || 0) + 1;
      if (j === 'descanso') livres++;
    });
    $('#bbLabor').innerHTML = EL.tHTML(
      '<span>Trabalho total <b>' + R.ptTotal.toFixed(1) + ' PT</b></span>' +
      '<span>Em descanso <b>' + livres + '</b></span>' +
      '<span>Obras <b>' + st.predios.filter(function (p) { return !p.pronto; }).length + '</b></span>' +
      '<span>Pesquisa <b>' + st.tech.ativa.length + '/' + Math.round(R.labSlots) + '</b></span>' +
      '<span>Lotes <b>' + st.agricultura.lotes.filter(function (l) { return l.crop; }).length + '/' + st.agricultura.lotes.length + '</b></span>');
    $('#btnAdvance').disabled = !!st.pendente || !!st.fimDeJogo;
    $('#btnAdvance5').disabled = !!st.pendente || !!st.fimDeJogo;
  }

  /* ================= ABAS ================= */
  function renderTab() {
    var R = EL.Sim.resumo(st);
    var h = '';
    switch (tab) {
      case 'visao': h = tabVisao(R); break;
      case 'trabalho': h = tabTrabalho(R); break;
      case 'tripulacao': h = tabTripulacao(R); break;
      case 'construcao': h = tabConstrucao(R); break;
      case 'pesquisa': h = tabPesquisa(R); break;
      case 'agricultura': h = tabAgricultura(R); break;
      case 'oficina': h = tabOficina(R); break;
      case 'mapa': h = tabMapa(R); break;
      case 'catalogo': h = tabCatalogo(R); break;
      case 'registro': h = tabRegistro(R); break;
    }
    $('#tabbody').innerHTML = EL.tHTML(h);
  }

  /* ---------- VISÃO GERAL ---------- */
  function tabVisao(R) {
    var h = '';
    if (st.fimDeJogo) {
      h += '<div class="' + (st.fimDeJogo.tipo === 'vitoria' ? 'okbox' : 'warnbox') + '"><b>' +
        (st.fimDeJogo.tipo === 'vitoria' ? '★ VITÓRIA' : '☠ FIM DA COLÔNIA') + '</b><br>' + esc(st.fimDeJogo.txt) + '</div>';
    }
    h += EL.Cronica.html(st, R);
    h += '<h2 class="sec">SITUAÇÃO — SOL ' + st.sol + '</h2>';
    h += '<div class="grid g2">';

    h += '<div class="card"><h5>Clima</h5><div class="meta">' + EL.ESTACOES.filter(function (e) { return e.id === st.clima.estacao; })[0].desc + '</div>' +
      row('Condição', st.clima.cond) + row('Temperatura', st.clima.temp + '°C (mín ' + st.clima.tempMin + '°C)') +
      row('Chuva', st.clima.chuva + ' mm' + (st.clima.acido ? ' (ÁCIDA)' : '')) +
      row('Poeira', Math.round(st.clima.poeira * 100) + '%') +
      row('Luz solar', Math.round(st.clima.solarF * 100) + '%') +
      row('Maré composta', st.clima.mare + ' m') + '</div>';

    h += '<div class="card"><h5>Balanço vital</h5>' +
      row('Água', st.mat.agua.toFixed(0) + ' L → ' + R.diasAgua.toFixed(1) + ' sols', cls(R.diasAgua, 25, 8)) +
      row('  produção passiva', R.aguaPassiva.toFixed(0) + ' L/sol') +
      row('  consumo líquido', (R.aguaLiquida + R.aguaUso).toFixed(0) + ' L/sol') +
      row('Comida', st.mat.comida.toFixed(0) + ' → ' + R.diasComida.toFixed(1) + ' sols', cls(R.diasComida, 40, 12)) +
      row('Energia', R.balanco.toFixed(1) + ' kWh/sol', R.balanco >= 0 ? 'good' : 'bad') +
      row('Abrigo', R.pop + '/' + R.abrigo, R.abrigoDeficit ? 'bad' : 'good') + '</div>';

    h += '<div class="card"><h5>Estado humano</h5>' +
      row('Moral média', Math.round(R.moralMedia), cls(R.moralMedia, 60, 35)) +
      row('Saúde média', Math.round(R.saudeMedia), cls(R.saudeMedia, 70, 45)) +
      row('Fadiga média', Math.round(R.fadigaMedia), cls(100 - R.fadigaMedia, 55, 25)) +
      row('Feridos', EL.Sim.vivos(st).filter(function (c) { return c.ferimento; }).length) +
      row('Doentes', EL.Sim.vivos(st).filter(function (c) { return c.doente > st.sol; }).length) +
      row('Mortos até agora', st.mortos.length) + '</div>';

    h += '<div class="card"><h5>Infraestrutura</h5>' +
      row('Edificações', st.predios.filter(function (p) { return p.pronto; }).length) +
      row('Obras em andamento', st.predios.filter(function (p) { return !p.pronto; }).length) +
      row('Vagas de laboratório', R.labSlots) + row('Vagas de oficina', R.oficina) +
      row('Lotes agrícolas', st.agricultura.lotes.length) +
      row('Tecnologias', st.tech.feitas.length + '/' + EL.TECH.length) +
      row('Setores levantados', st.setoresExplorados || 0) + '</div>';
    h += '</div>';

    /* objetivos */
    h += '<h4 class="sub2">OBJETIVOS ATUAIS</h4><div class="grid g3">';
    var objs = objetivos(R);
    objs.forEach(function (o) {
      h += '<div class="card"><h5>' + esc(o.t) + '</h5><p>' + esc(o.d) + '</p>' +
        '<span class="tag ' + (o.ok ? 'ok' : 'hi') + '">' + (o.ok ? 'CUMPRIDO' : 'PENDENTE') + '</span></div>';
    });
    h += '</div>';

    h += '<h4 class="sub2">ÚLTIMOS ACONTECIMENTOS</h4><div class="log">';
    st.log.slice(-14).reverse().forEach(function (l) {
      h += '<div class="entry ' + l.tipo + '">' + (l.tipo !== 'sol' ? '<span class="who">s' + l.sol + '</span> ' : '') + esc(l.txt) + '</div>';
    });
    h += '</div>';
    return h;
  }

  function objetivos(R) {
    var o = [];
    o.push({ t: 'Fonte de água renovável', d: 'Poço, tela de neblina ou coleta de rio purificada. Sem isso, a contagem termina.', ok: R.aguaPassiva > R.aguaLiquida * 0.8 });
    o.push({ t: 'Água potável', d: 'Pesquisar Purificação e erguer a estação de filtragem.', ok: EL.Sim.tem(st, 'purificacao_agua') });
    o.push({ t: 'Abrigo para todos', d: 'Ninguém pode dormir ao relento quando a mínima for negativa.', ok: R.abrigoDeficit === 0 });
    o.push({ t: 'Primeira colheita', d: 'Corrigir o loess, plantar e colher antes que as rações acabem.', ok: !!st.flags.jaColheu });
    o.push({ t: 'Superávit energético', d: 'Geração maior que demanda, todos os sols.', ok: R.balanco > 0 });
    o.push({ t: 'Metalurgia', d: 'Do bloomery ao aço. Sem metal não existe indústria.', ok: EL.Sim.tem(st, 'siderurgia') });
    o.push({ t: 'Eletricidade', d: 'Dínamo, cobre trefilado, motor.', ok: EL.Sim.tem(st, 'eletricidade') });
    o.push({ t: 'Sobreviver ao Gélido', d: '100 sols a até −24 °C. Abrigo isolado e reserva de energia.', ok: st.sol > 402 });
    o.push({ t: 'Terraformação', d: 'CO₂ de 1,2% para 0,4% com 40+ habitantes. O fim do jogo.', ok: EL.Sim.tem(st, 'terraformacao') });
    return o.filter(function (x) { return !x.ok; }).slice(0, 6).concat(o.filter(function (x) { return x.ok; }).slice(0, 3));
  }

  /* ---------- TRABALHO ---------- */
  function tabTrabalho(R) {
    var jobs = EL.Sim.jobsDisponiveis(st);
    var h = '<h2 class="sec">ALOCAÇÃO DE TRABALHO</h2>';
    h += '<div class="hint">Cada pessoa produz de 0 a ~1,2 PT por sol, conforme saúde, fadiga, moral, ferimento e o CO₂ de 1,2% da atmosfera. ' +
      'A perícia multiplica o resultado: nível 0 rende 0,55× · nível 5 rende 1,05× · nível 9 rende 1,45×.</div>';

    /* políticas */
    h += '<div class="grid g2"><div class="card"><h5>Política de ração alimentar</h5>' +
      '<input type="range" id="racaoComida" min="40" max="120" value="' + Math.round(st.politica.racaoComida * 100) + '">' +
      '<div class="meta">Atual: <b>' + Math.round(st.politica.racaoComida * 100) + '%</b> · consumo ' + R.comidaDia.toFixed(1) + ' rações/sol · autonomia ' + R.diasComida.toFixed(1) + ' sols</div>' +
      '<p>Abaixo de 85% a fome sobe e a saúde cai. Abaixo de 60% a colônia perde produtividade rapidamente.</p></div>';
    h += '<div class="card"><h5>Política de ração de água</h5>' +
      '<input type="range" id="racaoAgua" min="50" max="120" value="' + Math.round(st.politica.racaoAgua * 100) + '">' +
      '<div class="meta">Atual: <b>' + Math.round(st.politica.racaoAgua * 100) + '%</b> · bruto ' + R.aguaBruta.toFixed(0) + ' L/sol · perda líquida ' + R.aguaLiquida.toFixed(0) + ' L/sol</div>' +
      '<p>Abaixo de 75% começam cefaleia, irritação e queda de saúde. Higiene reduzida aumenta o risco de surto.</p></div></div>';

    /* robôs */
    h += '<h4 class="sub2">MÁQUINAS</h4><div class="grid g2">';
    h += '<div class="card"><h5>ATLAS-1 · ' + Math.round(st.robos.atlas.integridade) + '%</h5>' +
      '<div class="meta">Equivale a ~' + (6 * st.robos.atlas.integridade / 100).toFixed(1) + ' PT. Degrada com o uso.</div>' +
      '<select id="atlasTarefa"><option value="ocioso">Ocioso (poupa integridade)</option>' +
      '<option value="construir">Obras</option><option value="escavar">Escavar pedra e argila</option>' +
      '<option value="extrair">Extração de recurso</option></select> ';
    if (st.robos.atlas.tarefa === 'extrair') {
      h += '<select id="atlasRec">';
      jobs.filter(function (j) { return !j.fixo; }).forEach(function (j) {
        h += '<option value="' + j.rec.id + '|' + j.setor + '">' + esc(j.n) + '</option>';
      });
      h += '</select>';
    }
    h += '</div>';
    h += '<div class="card"><h5>KITE · ' + Math.round(st.robos.kite.integridade) + '%</h5>' +
      '<div class="meta">Levanta ' + (EL.Sim.tem(st, 'cartografia') ? '33' : '11') + '% de um setor por sol. Alcance 4 setores da base.</div>' +
      '<select id="kiteAlvo"><option value="">— não voar —</option>';
    for (var sid in st.setores) {
      if (EL.dist(EL.BASE_SETOR, sid) > 4) continue;
      if (st.setores[sid].explorado >= 100) continue;
      h += '<option value="' + sid + '"' + (st.robos.kite.alvo === sid ? ' selected' : '') + '>' + sid + ' — ' +
        EL.BIOMAS[EL.bioma(sid)].nome + ' (' + Math.round(st.setores[sid].explorado) + '%)</option>';
    }
    h += '</select></div></div>';

    /* tabela de alocação */
    h += '<h4 class="sub2">POSTOS</h4>';
    h += '<table class="tbl resp"><thead><tr><th>Sobrevivente</th><th>Estado</th><th>PT</th><th>Posto</th><th>Perícia relevante</th></tr></thead><tbody>';
    EL.Sim.vivos(st).forEach(function (c) {
      var pt = EL.Sim.ptDe(st, c);
      var estado = [];
      if (c.ferimento) estado.push('<span class="tag no">' + esc(c.ferimento.n) + '</span>');
      if (c.doente > st.sol) estado.push('<span class="tag no">doente</span>');
      if (c.forcado && c.forcadoAte > st.sol) estado.push('<span class="tag hi">forçado: ' + c.forcado + '</span>');
      if (c.fadiga > 80) estado.push('<span class="tag no">exausto</span>');
      if (c.moral < 30) estado.push('<span class="tag no">moral baixa</span>');
      if (!estado.length) estado.push('<span class="tag ok">apto</span>');

      var sel = '<select class="jobSel" data-c="' + c.id + '">';
      var cats = {};
      jobs.forEach(function (j) { (cats[j.cat] = cats[j.cat] || []).push(j); });
      Object.keys(cats).forEach(function (k) {
        sel += '<optgroup label="' + esc(k) + '">';
        cats[k].forEach(function (j) {
          sel += '<option value="' + esc(j.id) + '"' + (c.trabalho === j.id ? ' selected' : '') + '>' + esc(j.n) + '</option>';
        });
        sel += '</optgroup>';
      });
      sel += '</select>';
      if (c.trabalho === 'explorar') {
        sel += ' <select class="expSel" data-c="' + c.id + '">';
        for (var s2 in st.setores) {
          if (EL.dist(EL.BASE_SETOR, s2) > 3) continue;
          sel += '<option value="' + s2 + '"' + (c.setorTrab === s2 ? ' selected' : '') + '>' + s2 + ' (' + Math.round(st.setores[s2].explorado) + '%)</option>';
        }
        sel += '</select>';
      }
      var jd = EL.jobPorId(c.trabalho);
      var perTxt = '—';
      if (jd && jd.per && jd.per !== '*ciencia') perTxt = EL.PERICIAS[jd.per] + ' ' + (c.per[jd.per] || 0);
      else if (jd && jd.per === '*ciencia') perTxt = 'ciência (melhor)';
      else if (c.trabalho.indexOf('ext:') === 0) perTxt = 'campo';

      h += '<tr><td><b>' + esc(c.nome) + '</b> <span class="sub">' + esc(c.func) + '</span></td>' +
        '<td>' + estado.join(' ') + '</td>' +
        '<td class="n" data-l="TRABALHO">' + pt.toFixed(2) + ' PT · ' + perTxt + '</td>' +
        '<td data-l="POSTO">' + sel + '</td><td class="n desk-only">' + perTxt + '</td></tr>';
    });
    h += '</tbody></table>';
    h += '<div class="hint" style="margin-top:10px">Total disponível neste sol: <b>' + R.ptTotal.toFixed(2) + ' PT</b> humanos' +
      (st.robos.atlas.ativo ? ' + <b>' + (6 * st.robos.atlas.integridade / 100).toFixed(1) + ' PT</b> de ATLAS-1' : '') + '.</div>';
    return h;
  }

  /* ---------- TRIPULAÇÃO ---------- */
  function tabTripulacao() {
    var h = '<h2 class="sec">TRIPULAÇÃO — ' + EL.Sim.vivos(st).length + ' VIVOS · ' + st.mortos.length + ' MORTOS</h2>';
    h += '<div class="grid g2">';
    EL.Sim.vivos(st).forEach(function (c) {
      var cl = c.ferimento ? 'hurt' : (c.moral < 35 ? 'low' : '');
      h += '<div class="crew ' + cl + '"><div class="crew-h"><b>' + esc(c.nome) + '</b><span class="job">' + esc(jobNome(c.trabalho)) + '</span></div>';
      h += '<div class="crew-role">' + c.idade + ' anos · ' + esc(c.func) + '</div>';
      h += '<div class="stats5">' + stat('HUMOR', c.humor) + stat('FADIGA', 100 - c.fadiga) + stat('FOME', 100 - c.fome) + stat('SAÚDE', c.saude) + stat('MORAL', c.moral) + '</div>';
      var per = Object.keys(c.per).filter(function (k) { return c.per[k] > 0; }).sort(function (a, b) { return c.per[b] - c.per[a]; });
      h += '<div class="skills">' + per.map(function (k) { return EL.PERICIAS[k] + ' <b>' + c.per[k] + '</b>'; }).join(' · ') + '</div>';
      h += '<div class="rel">' + c.tracos.map(function (t) { return '<span class="tag">' + esc(EL.TRACOS[t] ? EL.TRACOS[t].n : t) + '</span>'; }).join('') + '</div>';
      if (c.ferimento) h += '<div class="rel" style="color:#e05c5c">✚ ' + esc(c.ferimento.n) + ' — gravidade ' + Math.round(c.ferimento.sev) + ', ' + c.ferimento.dias + ' sols</div>';
      if (c.fraqueza) h += '<div class="rel">⚠ ' + esc(c.fraqueza) + '</div>';
      var rels = [];
      EL.Sim.vivos(st).forEach(function (o) {
        if (o.id === c.id) return;
        var v = EL.getRel(st, c.id, o.id);
        if (Math.abs(v) >= 25) rels.push((v > 0 ? '♥ ' : '✖ ') + o.nome.split(' ')[0] + ' (' + v + ')');
      });
      if (rels.length) h += '<div class="rel">' + esc(rels.join(' · ')) + '</div>';
      if (c.bio) h += '<div class="rel" style="font-style:italic;color:#56677a">' + esc(c.bio) + '</div>';
      h += '</div>';
    });
    h += '</div>';
    if (st.mortos.length) {
      h += '<h4 class="sub2">MEMORIAL</h4><table class="tbl"><thead><tr><th>Nome</th><th>Função</th><th>Causa</th><th>Sol</th></tr></thead><tbody>';
      st.mortos.forEach(function (m) { h += '<tr><td>' + esc(m.nome) + '</td><td>' + esc(m.func) + '</td><td>' + esc(m.causa) + '</td><td class="n">' + m.sol + '</td></tr>'; });
      h += '</tbody></table>';
    }
    return h;
  }
  function stat(l, v) {
    var c = cls(v, 65, 35);
    return '<div class="st"><div class="lbl">' + l + '</div><div class="val ' + c + '">' + Math.round(v) + '</div><div class="bar"><i class="' + c + '" style="width:' + Math.round(v) + '%"></i></div></div>';
  }
  function jobNome(id) {
    if (id.indexOf('ext:') === 0) { var r = EL.recursoPorId(id.split(':')[1]); return (r ? r.n : id) + ' @' + id.split(':')[2]; }
    var j = EL.jobPorId(id); return j ? j.n : id;
  }

  /* ---------- CONSTRUÇÃO ---------- */
  function tabConstrucao(R) {
    var h = '<h2 class="sec">CONSTRUÇÃO</h2>';
    var obras = st.predios.filter(function (p) { return !p.pronto; });
    if (obras.length) {
      h += '<h4 class="sub2">FILA DE OBRAS</h4><table class="tbl"><thead><tr><th>Obra</th><th>Setor</th><th>Progresso</th><th></th></tr></thead><tbody>';
      obras.forEach(function (p) {
        var b = EL.buildPorId(p.id);
        h += '<tr><td>' + esc(b.n) + '</td><td>' + p.setor + '</td><td>' + p.ptFeito.toFixed(1) + '/' + b.pt + ' PT' +
          '<div class="bar"><i style="width:' + Math.round(p.ptFeito / b.pt * 100) + '%"></i></div></td>' +
          '<td><button class="act dang" data-cancel="' + p.uid + '">cancelar</button></td></tr>';
      });
      h += '</tbody></table>';
    } else h += '<div class="hint">Nenhuma obra em andamento. Ninguém no posto "Obras" produz construção.</div>';

    h += '<h4 class="sub2">DISPONÍVEIS</h4>';
    h += '<div class="hint">Materiais são consumidos ao iniciar a obra. O trabalho vem do posto "Obras" e do ATLAS-1.</div>';
    h += '<label class="sub">Setor de destino: <select id="setorObra">';
    EL.Sim.setoresConstruiveis(st).forEach(function (s) {
      h += '<option value="' + s + '"' + (s === EL.BASE_SETOR ? ' selected' : '') + '>' + s + ' — ' + EL.BIOMAS[EL.bioma(s)].nome + '</option>';
    });
    h += '</select></label>';

    var cats = {};
    EL.BUILD.forEach(function (b) { (cats[b.cat] = cats[b.cat] || []).push(b); });
    Object.keys(cats).forEach(function (k) {
      h += '<h4 class="sub2">' + k.toUpperCase() + '</h4><div class="grid g2">';
      cats[k].forEach(function (b) {
        var err = EL.Sim.podeConstruir(st, b.id, EL.BASE_SETOR);
        var n = st.predios.filter(function (p) { return p.id === b.id; }).length;
        h += '<div class="card' + (err ? '' : ' act') + '"><h5>' + esc(b.n) + (n ? ' <span class="sub">×' + n + '</span>' : '') + '</h5>';
        h += '<div class="meta">' + b.pt + ' PT' + (b.max ? ' · máx ' + b.max : '') + (b.tec ? ' · exige ' + EL.techPorId(b.tec).n : '') + '</div>';
        h += '<p>' + esc(b.d) + '</p>';
        var mats = Object.keys(b.mat).filter(function (m) { return b.mat[m] > 0; });
        h += mats.map(function (m) {
          var ok = (st.mat[m] || 0) >= b.mat[m];
          return '<span class="tag ' + (ok ? 'ok' : 'no') + '">' + b.mat[m] + ' ' + EL.MAT[m].n + '</span>';
        }).join('');
        var efs = [];
        for (var e in b.ef) if (typeof b.ef[e] === 'number' && b.ef[e]) efs.push(e + ' +' + b.ef[e]);
        if (efs.length) h += '<div class="sub">' + esc(efs.join(' · ')).replace(/(^|· )([a-zA-Z]+) \+/g, function(m,a,k){ return a + ((EL.LANG==='en'&&EL.EF_EN&&EL.EF_EN[k])?EL.EF_EN[k]:k) + ' +'; }) + '</div>';
        if (b.up && (b.up.energia || b.up.agua || b.up.trabalho)) h += '<div class="sub">Custo/sol: ' +
          (b.up.energia ? b.up.energia + ' kWh ' : '') + (b.up.agua ? b.up.agua + ' L ' : '') + (b.up.trabalho ? b.up.trabalho + ' PT' : '') + '</div>';
        h += '<div style="margin-top:6px">' + (err ? '<span class="tag no">' + esc(err) + '</span>' :
          '<button class="act" data-build="' + b.id + '">CONSTRUIR</button>') + '</div></div>';
      });
      h += '</div>';
    });
    return h;
  }

  /* ---------- PESQUISA ---------- */
  function tabPesquisa(R) {
    var h = '<h2 class="sec">PESQUISA</h2>';
    h += '<div class="hint">Geração: <b>' + (st.ppHoje || 0).toFixed(1) + ' PP</b> no último sol · vagas de laboratório: <b>' + R.labSlots + '</b> · multiplicador <b>' + R.ppMult.toFixed(2) + '×</b> · PP acumulados livres: <b>' + fmt(st.tech.pp) + '</b>.<br>' +
      'Coloque pessoas no posto "Pesquisa". Mais pesquisadores do que vagas não gera mais PP. Projetos ativos dividem os PP entre si.</div>';
    if (st.tech.ativa.length) {
      h += '<h4 class="sub2">EM ANDAMENTO</h4><div class="grid g2">';
      st.tech.ativa.forEach(function (a) {
        var t = EL.techPorId(a.id);
        h += '<div class="card act"><h5>' + esc(t.n) + '</h5><div class="meta">' + a.pp.toFixed(1) + '/' + t.pp + ' PP</div>' +
          '<div class="bar"><i style="width:' + Math.round(a.pp / t.pp * 100) + '%"></i></div><p>' + esc(t.d) + '</p></div>';
      });
      h += '</div>';
    }
    for (var tier = 1; tier <= 6; tier++) {
      var ts = EL.TECH.filter(function (t) { return t.t === tier; });
      var visiveis = ts.filter(function (t) {
        if (EL.Sim.tem(st, t.id)) return true;
        return t.req.every(function (r) { return EL.Sim.tem(st, r); }) || tier <= 2;
      });
      if (!visiveis.length) continue;
      h += '<h4 class="sub2">TIER ' + tier + '</h4><div class="grid g2">';
      visiveis.forEach(function (t) {
        var feito = EL.Sim.tem(st, t.id);
        var ativo = st.tech.ativa.filter(function (a) { return a.id === t.id; }).length > 0;
        var err = EL.Sim.podePesquisar(st, t.id);
        h += '<div class="card' + (feito ? '' : ' act') + '"><h5>' + esc(t.n) + '</h5>' +
          '<div class="meta">' + t.cat + ' · ' + t.pp + ' PP' + (t.req.length ? ' · requer: ' + t.req.map(function (r) { return EL.techPorId(r).n; }).join(', ') : '') + '</div>' +
          '<p>' + esc(t.d) + '</p>';
        if (feito) h += '<span class="tag ok">CONCLUÍDA</span>';
        else if (ativo) h += '<span class="tag hi">EM ANDAMENTO</span>';
        else if (err) h += '<span class="tag no">' + esc(err) + '</span>';
        else h += '<button class="act" data-tech="' + t.id + '">PESQUISAR</button>';
        h += '</div>';
      });
      h += '</div>';
    }
    return h;
  }

  /* ---------- AGRICULTURA ---------- */
  function tabAgricultura(R) {
    var s = st.agricultura.solo;
    var h = '<h2 class="sec">AGRICULTURA</h2>';
    if (!EL.Sim.tem(st, 'analise_solo')) {
      h += '<div class="warnbox">O solo local não foi analisado. Sem <b>Análise pedológica</b>, plantar é apostar às cegas — e o loess vulcânico é alcalino, salgado e praticamente sem nitrogênio.</div>';
    } else {
      h += '<div class="grid g4">' +
        '<div class="card"><h5>pH ' + s.ph.toFixed(1) + '</h5><p>' + (s.ph > 7.8 ? 'Alcalino demais. Bloqueia ferro e fósforo.' : 'Adequado.') + '</p></div>' +
        '<div class="card"><h5>N ' + Math.round(s.n) + '</h5><p>' + (s.n < 25 ? 'Deficiente. Use nitrato, leguminosas ou compostagem.' : 'Suficiente.') + '</p></div>' +
        '<div class="card"><h5>P ' + Math.round(s.p) + '</h5><p>' + (s.p < 20 ? 'Deficiente. Fosforita das Cavernas de Kore.' : 'Suficiente.') + '</p></div>' +
        '<div class="card"><h5>K ' + Math.round(s.k) + '</h5><p>' + (s.k < 20 ? 'Deficiente. Silvita do Sal Vítreo.' : 'Suficiente.') + '</p></div>' +
        '<div class="card"><h5>Matéria orgânica ' + s.org.toFixed(1) + '%</h5><p>' + (s.org < 8 ? 'Loess quase estéril. Compostagem resolve com o tempo.' : 'Melhorando.') + '</p></div>' +
        '<div class="card"><h5>Salinidade ' + s.sal.toFixed(2) + '</h5><p>' + (s.sal > 0.25 ? 'Alta. Irrigar sem drenagem piora.' : 'Controlada.') + '</p></div>' +
        '</div>';
    }
    h += '<div class="warnbox"><b>O vão alimentar.</b> Você tem 40 sols de rações. A batata leva 78 sols para ficar pronta. ' +
      'Sozinha, a conta não fecha — e é assim de propósito. As três saídas são: racionar (a 55% a colônia fica debilitada mas sobrevive), ' +
      'plantar cultivares rápidos (<b>Chlorella</b>, 22 sols, e <b>Couve</b>, 46 sols) e abrir mais canteiros do que parece necessário.</div>';
    h += '<div class="hint">Sementes disponíveis: <b>' + st.mat.semente.toFixed(2) + ' kg</b> · lotes: <b>' + st.agricultura.lotes.length + '</b> · fertilizante: <b>' + Math.round(st.mat.fertilizante) + ' kg</b>. ' +
      'Construa <b>Canteiros corrigidos</b> (aba Construção) para ter onde plantar. Alguém precisa estar no posto "Lavoura" ou a colheita definha.</div>';

    if (!st.agricultura.lotes.length) h += '<div class="warnbox">Nenhum lote. Construa canteiros.</div>';
    else {
      h += '<h4 class="sub2">LOTES</h4><table class="tbl"><thead><tr><th>#</th><th>Tipo</th><th>Cultivar</th><th>Progresso</th><th>Saúde</th><th>Ação</th></tr></thead><tbody>';
      st.agricultura.lotes.forEach(function (l, i) {
        var c = l.crop ? EL.cropPorId(l.crop) : null;
        h += '<tr><td class="n">' + (i + 1) + '</td><td>' + (l.protegido ? 'Estufa ×' + (l.mult || 1) : 'Aberto') + '</td>';
        h += '<td>' + (c ? esc(c.n) : '<i class="sub">vazio</i>') + '</td>';
        h += '<td>' + (c ? Math.round(l.prog) + '/' + c.dias + ' sols<div class="bar"><i style="width:' + Math.round(l.prog / c.dias * 100) + '%"></i></div>' : '—') + '</td>';
        h += '<td class="n ' + (c ? cls(l.saude, 70, 35) : '') + '">' + (c ? Math.round(l.saude) : '—') + '</td>';
        h += '<td>';
        if (!c) {
          h += '<select class="plantSel" data-l="' + i + '"><option value="">— plantar —</option>';
          EL.CROPS.forEach(function (cr) {
            if (cr.estufa && !l.protegido) return;
            var pode = st.mat.semente >= cr.sem;
            h += '<option value="' + cr.id + '"' + (pode ? '' : ' disabled') + '>' + esc(cr.n) + ' (' + cr.dias + ' sols, ' + cr.rend + ' rações)</option>';
          });
          h += '</select>';
        } else h += '<button class="act dang" data-arrancar="' + i + '">arrancar</button>';
        h += '</td></tr>';
      });
      h += '</tbody></table>';
    }

    h += '<h4 class="sub2">BANCO DE SEMENTES</h4><table class="tbl"><thead><tr><th>Cultivar</th><th>Ciclo</th><th>Água</th><th>Rações</th><th>Faixa térmica</th><th>Praga</th><th>Notas</th></tr></thead><tbody>';
    EL.CROPS.forEach(function (c) {
      h += '<tr><td><b>' + esc(c.n) + '</b></td><td class="n">' + c.dias + ' sols</td><td class="n">' + c.agua + ' L</td>' +
        '<td class="n">' + (c.rend || '—') + '</td><td class="n">' + c.tMin + '° a ' + c.tMax + '°</td>' +
        '<td class="n">' + Math.round(c.praga * 100) + '%</td><td class="sub">' + esc(c.d) + '</td></tr>';
    });
    h += '</tbody></table>';
    return h;
  }

  /* ---------- OFICINA ---------- */
  function tabOficina(R) {
    var h = '<h2 class="sec">OFICINA E PRODUÇÃO</h2>';
    h += '<div class="hint">Vagas de oficina: <b>' + R.oficina + '</b> · multiplicador de fabricação <b>' + R.fabMult.toFixed(2) + '×</b>. ' +
      'A fila é processada pelo posto "Oficina". Se faltar insumo, a produção trava naquele item.</div>';
    if (R.oficina <= 0) h += '<div class="warnbox">Sem oficina construída, nada é produzido.</div>';
    if (st.filaProducao.length) {
      h += '<h4 class="sub2">FILA</h4><table class="tbl"><thead><tr><th>Item</th><th>Feitos</th><th>Progresso</th><th></th></tr></thead><tbody>';
      st.filaProducao.forEach(function (f, i) {
        var r = EL.receitaPorId(f.rec);
        h += '<tr><td>' + esc(r.n) + '</td><td class="n">' + f.feitos + '/' + f.qtd + '</td>' +
          '<td>' + f.ptFeito.toFixed(1) + '/' + r.pt + ' PT</td>' +
          '<td><button class="act dang" data-delprod="' + i + '">remover</button></td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '<h4 class="sub2">RECEITAS</h4><div class="grid g2">';
    EL.RECEITAS.forEach(function (r) {
      var bloq = r.tec && !EL.Sim.tem(st, r.tec);
      h += '<div class="card' + (bloq ? '' : ' act') + '"><h5>' + esc(r.n) + '</h5>';
      h += '<div class="meta">' + r.pt + ' PT por lote' + (r.energia ? ' · ' + r.energia + ' kWh' : '') + (r.tec ? ' · exige ' + EL.techPorId(r.tec).n : '') + '</div>';
      h += '<div>' + Object.keys(r.ent).map(function (m) {
        var ok = (st.mat[m] || 0) >= r.ent[m];
        return '<span class="tag ' + (ok ? 'ok' : 'no') + '">−' + r.ent[m] + ' ' + EL.MAT[m].n + '</span>';
      }).join('') + '</div>';
      h += '<div>' + Object.keys(r.sai).filter(function (m) { return r.sai[m] > 0; }).map(function (m) {
        return '<span class="tag cy">+' + r.sai[m] + ' ' + EL.MAT[m].n + '</span>';
      }).join('') + '</div>';
      if (!bloq) h += '<div style="margin-top:6px"><button class="act" data-prod="' + r.id + '" data-q="1">×1</button> ' +
        '<button class="act" data-prod="' + r.id + '" data-q="5">×5</button> ' +
        '<button class="act" data-prod="' + r.id + '" data-q="20">×20</button></div>';
      else h += '<span class="tag no">bloqueada</span>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  /* ---------- MAPA ---------- */
  function tabMapa() {
    var h = '<h2 class="sec">CONTINENTE AURORAE</h2>';
    h += '<div class="hint">Cada setor tem 25 × 25 km. Você só extrai de setores explorados (≥30%) e adjacentes à base, ou com <b>Posto avançado</b>. Use o KITE para levantamento aéreo e o posto "Expedição" para o levantamento a pé.</div>';
    h += '<div class="mapwrap"><table class="map"><tr><th></th>';
    EL.COLS.forEach(function (c) { h += '<th>' + c + '</th>'; });
    h += '</tr>';
    for (var y = 0; y < 10; y++) {
      h += '<tr><th>' + (y + 1) + '</th>';
      for (var x = 0; x < 12; x++) {
        var sid = EL.setorId(x, y), s = st.setores[sid], b = EL.BIOMAS[EL.bioma(sid)];
        var c = 'cell';
        if (s.explorado < 15) c += ' unk';
        if (sid === EL.BASE_SETOR) c += ' base';
        if (s.rota || s.outpost) c += ' route';
        if (sid === mapSel) c += ' sel';
        var ico = s.explorado < 15 ? '?' : b.icone;
        if (EL.RIO.indexOf(sid) >= 0 && s.explorado >= 15) ico = '≀';
        h += '<td><div class="' + c + '" data-sec="' + sid + '" style="background:' + (s.explorado < 15 ? '#0c1117' : b.cor) + '">' +
          ico + '<span class="pc">' + Math.round(s.explorado) + '</span></div></td>';
      }
      h += '</tr>';
    }
    h += '</table><div class="legend">';
    for (var k in EL.BIOMAS) h += '<span><b>' + EL.BIOMAS[k].icone + '</b>' + EL.BIOMAS[k].nome + '</span>';
    h += '<span><b>≀</b>Rio Ferrun</span></div></div>';

    /* detalhe */
    var s2 = st.setores[mapSel], bi = EL.BIOMAS[EL.bioma(mapSel)];
    h += '<h4 class="sub2">SETOR ' + mapSel + (EL.SETOR_NOMES[mapSel] ? ' — ' + EL.SETOR_NOMES[mapSel].toUpperCase() : '') + '</h4>';
    h += '<div class="grid g2"><div class="card"><h5>' + esc(bi.nome) + '</h5>' +
      row('Explorado', Math.round(s2.explorado) + '%', cls(s2.explorado, 60, 20)) +
      row('Distância da base', EL.dist(EL.BASE_SETOR, mapSel) + ' setores (' + (EL.dist(EL.BASE_SETOR, mapSel) * 25) + ' km)') +
      row('Custo de deslocamento', bi.mov + '/10') + row('Perigo', bi.perigo + '/10') +
      row('Rota', s2.rota ? 'sim' : 'não') + row('Posto avançado', s2.outpost ? 'sim' : 'não') +
      row('Eficiência de extração', Math.round(EL.Sim.fatorDistancia(st, mapSel) * 100) + '%') + '</div>';
    h += '<div class="card"><h5>Recursos detectados</h5>';
    if (s2.explorado < 30) h += '<p>Levantamento insuficiente. Envie o KITE ou uma expedição.</p>';
    else {
      var recs = EL.recursosDoSetor(mapSel);
      if (!recs.length) h += '<p>Nada de valor industrial identificado.</p>';
      recs.forEach(function (r) {
        var bloq = r.tec && !EL.Sim.tem(st, r.tec);
        h += '<div class="row"><span class="k">' + esc(r.n) + '</span><span class="v ' + (bloq ? 'bad' : 'good') + '">' +
          EL.RAR_NOME[r.rar] + ' · dif ' + r.dif + (bloq ? ' · bloqueado' : '') + '</span></div>';
      });
    }
    h += '</div></div>';
    return h;
  }

  /* ---------- CATÁLOGO ---------- */
  function tabCatalogo() {
    var h = '<h2 class="sec">CATÁLOGO DE RECURSOS — ' + EL.RECURSOS.length + ' ENTRADAS</h2>';
    h += '<div class="hint">Estimativa: isto representa menos de 15% do que o continente contém. Cada expedição pode revelar mais.</div>';
    var cats = {};
    EL.RECURSOS.forEach(function (r) { (cats[r.cat] = cats[r.cat] || []).push(r); });
    Object.keys(cats).forEach(function (k) {
      h += '<h4 class="sub2">' + k.toUpperCase() + ' (' + cats[k].length + ')</h4>';
      h += '<table class="tbl"><thead><tr><th>Recurso</th><th>Setores</th><th>Raridade</th><th>Dif.</th><th>Rende</th><th>Aplicação</th></tr></thead><tbody>';
      cats[k].forEach(function (r) {
        var sets = r.set.indexOf('*') >= 0 ? 'em toda parte' : r.set.slice(0, 6).join(', ') + (r.set.length > 6 ? '…' : '');
        h += '<tr><td><b>' + esc(r.n) + '</b></td><td class="n">' + esc(sets) + '</td><td class="n">' + EL.RAR_NOME[r.rar] + '</td>' +
          '<td class="n">' + r.dif + '/10</td><td class="n">' + (r.mat ? r.y + ' ' + EL.MAT[r.mat].u : '—') + '</td>' +
          '<td class="sub">' + esc(r.uso) + (r.tec ? ' <span class="tag ' + (EL.Sim.tem(st, r.tec) ? 'ok' : 'no') + '">' + EL.techPorId(r.tec).n + '</span>' : '') + '</td></tr>';
      });
      h += '</tbody></table>';
    });
    return h;
  }

  /* ---------- REGISTRO ---------- */
  function tabRegistro() {
    var h = '<h2 class="sec">REGISTRO DA COLÔNIA</h2><div class="log">';
    st.log.slice().reverse().forEach(function (l) {
      h += '<div class="entry ' + l.tipo + '">' + (l.tipo !== 'sol' ? '<span class="who">sol ' + l.sol + '</span> ' : '') + esc(l.txt) + '</div>';
    });
    h += '</div>';
    return h;
  }

  /* ================= MODAL DE EVENTO ================= */
  function renderPendente() {
    if (!st.pendente) { $('#modal').classList.add('hidden'); return; }
    var ev = EL.eventoPorId(st.pendente.id);
    var h = '<h3>▣ ' + esc(ev.n.toUpperCase()) + '</h3><p>' + esc(ev.txt) + '</p><div class="choices">';
    ev.escolhas.forEach(function (e, i) {
      h += '<button data-esc="' + i + '">' + esc(e.t) + '<i>' + esc(e.d) + '</i></button>';
    });
    h += '</div>';
    $('#modalBox').innerHTML = EL.tHTML(h);
    $('#modal').classList.remove('hidden');
  }

  /* ================= RENDER PRINCIPAL ================= */
  function render() {
    var R = EL.Sim.resumo(st);
    st.setoresExplorados = 0;
    for (var sx in st.setores) if (st.setores[sx].explorado >= 50) st.setoresExplorados++;
    if (st.tutorial && st.tutorial.ativo) EL.Tutorial.verificar(st);
    renderTopo(R); renderSide(R); renderTab(); renderBottom(R); renderPendente();
    document.getElementById('tutSlot').innerHTML = EL.tHTML(EL.Tutorial.html(st));
    renderFim();
  }

  function renderFim() {
    var w = document.getElementById('fimTela');
    if (!st.fimDeJogo) { w.classList.add('hidden'); return; }
    if (st.fimVisto) return;                 // já está aberta; não redesenhar por baixo do usuário
    st.fimVisto = true;
    try {
      st.arqNovas = EL.Arquivo.verificar(st);
      EL.Conquistas.verificar(st);
      EL.Arquivo.registrarPartida(st);
      if (st.diario) EL.Diario.registrar(st);
    } catch (e) {}
    w.className = 'fimwrap' + (st.fimDeJogo.tipo === 'vitoria' ? ' vitoria' : '');
    w.innerHTML = EL.tHTML(EL.Fim.html(st));
    w.scrollTop = 0;
  }

  /* ================= EVENTOS DE UI ================= */
  function bind() {
    document.getElementById('tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      tab = b.dataset.tab;
      Array.prototype.forEach.call(this.children, function (x) { x.classList.remove('sel'); });
      b.classList.add('sel'); renderTab();
    });

    document.getElementById('tabbody').addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.build) {
        var setor = document.getElementById('setorObra');
        var err = EL.Sim.iniciarObra(st, t.dataset.build, setor ? setor.value : EL.BASE_SETOR);
        if (err) toast(err); render(); EL.salvar(st);
      } else if (t.dataset.cancel) {
        EL.Sim.cancelarObra(st, parseInt(t.dataset.cancel, 10)); render(); EL.salvar(st);
      } else if (t.dataset.tech) {
        var e2 = EL.Sim.iniciarPesquisa(st, t.dataset.tech); if (e2) toast(e2); render(); EL.salvar(st);
      } else if (t.dataset.prod) {
        var e3 = EL.Sim.addProducao(st, t.dataset.prod, parseInt(t.dataset.q, 10)); if (e3) toast(e3); render(); EL.salvar(st);
      } else if (t.dataset.delprod) {
        st.filaProducao.splice(parseInt(t.dataset.delprod, 10), 1); render(); EL.salvar(st);
      } else if (t.dataset.arrancar) {
        var l = st.agricultura.lotes[parseInt(t.dataset.arrancar, 10)];
        if (l) { l.crop = null; l.prog = 0; l.saude = 100; } render(); EL.salvar(st);
      }
    });

    document.getElementById('tabbody').addEventListener('change', function (e) {
      var el = e.target;
      if (el.classList.contains('jobSel')) {
        var c = st.crew.filter(function (x) { return x.id === el.dataset.c; })[0];
        if (c) c.trabalho = el.value; render(); EL.salvar(st);
      } else if (el.classList.contains('expSel')) {
        var c2 = st.crew.filter(function (x) { return x.id === el.dataset.c; })[0];
        if (c2) c2.setorTrab = el.value; EL.salvar(st);
      } else if (el.classList.contains('plantSel')) {
        if (!el.value) return;
        var err = EL.Sim.plantar(st, parseInt(el.dataset.l, 10), el.value);
        if (err) toast(err); render(); EL.salvar(st);
      } else if (el.id === 'racaoComida') {
        st.politica.racaoComida = parseInt(el.value, 10) / 100; render(); EL.salvar(st);
      } else if (el.id === 'racaoAgua') {
        st.politica.racaoAgua = parseInt(el.value, 10) / 100; render(); EL.salvar(st);
      } else if (el.id === 'atlasTarefa') {
        st.robos.atlas.tarefa = el.value; render(); EL.salvar(st);
      } else if (el.id === 'atlasRec') {
        var pr = el.value.split('|'); st.robos.atlas.recurso = pr[0]; st.robos.atlas.setor = pr[1]; EL.salvar(st);
      } else if (el.id === 'kiteAlvo') {
        st.robos.kite.alvo = el.value || null; render(); EL.salvar(st);
      }
    });

    document.getElementById('tabbody').addEventListener('click', function (e) {
      var c = e.target.closest('.cell'); if (!c) return;
      mapSel = c.dataset.sec; renderTab();
    });

    document.getElementById('modal').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-esc]'); if (!b) return;
      EL.Sim.resolverEscolha(st, parseInt(b.dataset.esc, 10));
      render(); EL.salvar(st);
    });

    /* tutorial */
    document.getElementById('tutSlot').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tut],[data-tut-aba]'); if (!b) return;
      if (b.dataset.tutAba) {
        var alvo = document.querySelector('#tabs button[data-tab="' + b.dataset.tutAba + '"]');
        if (alvo) alvo.click();
      } else if (b.dataset.tut === 'fechar') {
        EL.UI.dialogo({
          titulo: 'DISPENSAR ORIENTAÇÃO',
          texto: 'A orientação inicial cobre os primeiros sols — água, pesquisa, obras, fadiga e o vão alimentar.<br>' +
                 'Ela some sozinha quando você concluir os passos.',
          nota: 'Você pode continuar sem ela, mas a primeira colônia costuma morrer por volta do sol 40.',
          cancelar: 'Manter', ok: 'Dispensar'
        }, function (ok) { if (ok) { st.tutorial.ativo = false; render(); EL.salvar(st); } });
      }
    });

    /* tela de fim de partida */
    document.getElementById('fimTela').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-fim]'); if (!b) return;
      var a = b.dataset.fim;
      if (a === 'imagem') {
        EL.Cartao.baixar(st); toast('Imagem baixada.');
      } else if (a === 'copiarimg') {
        EL.Cartao.copiar(st, function (ok) {
          toast(ok ? 'Imagem copiada — pode colar direto.' : 'Seu navegador não permite copiar imagem. Use "Baixar imagem".');
        });
      } else if (a === 'arquivo') {
        EL.UI.abrirArquivo();
      } else if (a === 'copiar') {
        var txt = EL.Fim.textoCompartilhavel(st);
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast('Resultado copiado.'); },
          function () { toast('Selecione o texto e copie manualmente.'); });
        else toast('Selecione o texto e copie manualmente.');
      } else if (a === 'rever') {
        document.getElementById('fimTela').classList.add('hidden');
      } else if (a === 'nova') {
        EL.apagarSave(); location.reload();
      }
    });

    /* arquivo da colônia */
    document.getElementById('arqTela').addEventListener('click', function (e) {
      if (e.target.closest('[data-arq="fechar"]')) document.getElementById('arqTela').classList.add('hidden');
    });

    /* cenários */
    document.getElementById('cenTela').addEventListener('click', function (e) {
      if (e.target.closest('[data-cen-fechar]')) { document.getElementById('cenTela').classList.add('hidden'); return; }
      var c = e.target.closest('[data-cen]');
      if (c && window.EL_iniciarCenario) window.EL_iniciarCenario(c.dataset.cen);
    });

    /* diálogos do sistema */
    document.getElementById('dialog').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-dlg]');
      if (b) { fecharDialogo(b.dataset.dlg === '1'); return; }
      if (e.target === this) fecharDialogo(false);   // clique fora cancela
    });
    document.addEventListener('keydown', function (e) {
      if (document.getElementById('dialog').classList.contains('hidden')) return;
      if (e.key === 'Escape') { e.preventDefault(); fecharDialogo(false); }
      else if (e.key === 'Enter') { e.preventDefault(); fecharDialogo(true); }
    });
  }

  function abrirCenarios() {
    var w = document.getElementById('cenTela');
    w.className = 'fimwrap';
    w.innerHTML = EL.tHTML(EL.CenariosUI.html());
    w.scrollTop = 0;
  }

  function abrirArquivo() {
    var w = document.getElementById('arqTela');
    w.className = 'fimwrap';
    w.innerHTML = EL.tHTML(EL.ArquivoUI.html());
    w.scrollTop = 0;
  }

  return {
    setState: setState, render: render, bind: bind, toast: toast, abrirArquivo: abrirArquivo,
    abrirCenarios: abrirCenarios,
    dialogo: dialogo, avisar: avisar, fecharDialogo: fecharDialogo,
    get tab() { return tab; }, set tab(v) { tab = v; }
  };
})();
