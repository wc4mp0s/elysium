/* PROJECT ELYSIUM — inicialização */
(function () {
  var st = null, dif = 'extremo';

  EL.aplicarIdioma();

  function aplicarTextoUI() {
    var T = EL.t, en = EL.LANG === 'en';
    function set(sel, v) { var e = document.querySelector(sel); if (e) e.textContent = v; }
    set('#bootPitch', en ? 'Twenty survivors. A planet never inhabited. No rescue.'
                         : 'Vinte sobreviventes. Um planeta que nunca foi habitado. Nenhum resgate.');
    set('#btnJogar', en ? 'PLAY' : 'JOGAR');
    set('#btnSave', T('salvar'));  set('#btnMenu', T('menu'));
    set('#btnAdvance', T('avancar1')); set('#btnAdvance5', T('avancar5'));

    var rod = document.querySelector('.boot-foot');
    if (rod) {
      rod.innerHTML = (en ? 'Free, no install, no account. Saves in your browser.'
                          : 'Grátis, sem instalar, sem cadastro. Salva no seu navegador.') +
        ' <button id="btnSemente" class="linkzin">' + (en ? 'world seed' : 'semente do mundo') + '</button>' +
        ' <button id="btnLang" class="linkzin">' + (en ? 'PT' : 'EN') + '</button>';
      ligarRodape();
    }
    var bl = document.getElementById('btnLangJogo'); if (bl) bl.textContent = en ? 'PT' : 'EN';

    var abas = T('abas');
    document.querySelectorAll('#tabs button').forEach(function (b) {
      if (abas[b.dataset.tab]) b.textContent = abas[b.dataset.tab];
    });
    var h3 = document.querySelectorAll('.side .panel h3');
    [T('estoqueVital'), T('energia'), T('materiais'), T('maquinas')].forEach(function (v, i) {
      if (h3[i]) h3[i].textContent = v;
    });
    document.querySelectorAll('.difOp').forEach(function (b) {
      var m = { facil:['Sobrevivente','Survivor'], normal:['Difícil','Hard'],
                extremo:['Extremo','Extreme'], brutal:['Brutal','Brutal'] }[b.dataset.diff];
      if (m) b.textContent = en ? m[1] : m[0];
    });
    if (en) {
      var rot = ['Daily challenge', 'Scenarios', 'Archive'];
      document.querySelectorAll('.boot-mais button').forEach(function (b, i) {
        var num = b.querySelector('b');
        b.textContent = rot[i] + ' ';
        if (num) b.appendChild(num);
      });
      var bc = document.getElementById('btnLoadGame');
      if (bc) bc.innerHTML = '↩ Continue colony <b id="contInfo"></b>';
    }
  }

  function ligarRodape() {
    var bs = document.getElementById('btnSemente');
    if (bs) bs.onclick = function () {
      var b = document.getElementById('sementeBox');
      b.classList.toggle('hidden');
      if (!b.classList.contains('hidden')) document.getElementById('seedInput').focus();
    };
    var bl = document.getElementById('btnLang');
    if (bl) bl.onclick = trocarIdiomaDialogo;
  }

  function trocarIdiomaDialogo() {
    EL.UI.dialogo({
      titulo: EL.LANG === 'en' ? 'CHANGE LANGUAGE' : 'TROCAR IDIOMA',
      texto: EL.LANG === 'en' ? 'Switch the game to <b>Portuguese</b>? The page will reload.'
                              : 'Mudar o jogo para <b>inglês</b>? A página será recarregada.',
      nota: EL.LANG === 'en' ? 'Your saved colony is kept.' : 'Sua colônia salva é preservada.',
      cancelar: EL.LANG === 'en' ? 'Cancel' : 'Cancelar',
      ok: EL.LANG === 'en' ? 'Português' : 'English'
    }, function (ok) { if (ok) EL.trocarIdioma(EL.LANG === 'en' ? 'pt' : 'en'); });
  }

  function iniciar(estado) {
    st = estado;
    EL.UI.setState(st);
    window.EL_salvarPartida = function (s2) {
      if (s2 && s2.diario) EL.Diario.salvar(s2); else EL.salvar(s2);
    };
    document.getElementById('boot').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    EL.UI.render();
    window.EL_salvarPartida(st);
  }

  var DIF_TXT = {
    facil:   'Margens folgadas. Você ainda vai perder gente — mas dá tempo de aprender.',
    normal:  'Equilibrado e implacável. Um erro custa caro, mas a colônia se recupera dele.',
    extremo: 'Nada é facilitado. Um erro no sol 5 costuma matar a colônia no sol 45, sem aviso.',
    brutal:  'Produção menor, mais eventos, mais risco. Para quem já venceu no Extremo.'
  };
  function pintaDif() {
    document.querySelectorAll('.difOp').forEach(function (x) { x.classList.toggle('sel', x.dataset.diff === dif); });
    var t = (EL.t('dif') || {})[dif] || DIF_TXT[dif] || '';
    document.getElementById('bootDifTxt').textContent = t;
  }
  document.querySelectorAll('.difOp').forEach(function (b) {
    b.addEventListener('click', function () { dif = b.dataset.diff; pintaDif(); });
  });

  /* ---------- ação primária: jogar ---------- */
  function comecar() {
    var campo = document.getElementById('seedInput');
    var seed = (campo && campo.value.trim()) || ('ELYSIUM-' + Math.floor(Math.random() * 1e9).toString(36).toUpperCase());
    iniciar(EL.novoJogo(seed, dif));
  }

  document.getElementById('btnJogar').addEventListener('click', function () {
    if (!EL.temSave()) { comecar(); return; }
    var s = EL.carregar();
    EL.UI.dialogo({
      titulo: 'JÁ EXISTE UMA COLÔNIA', perigo: true, icone: '⚠',
      texto: 'Você tem uma colônia salva no <b>sol ' + (s ? s.sol : '?') + '</b>, com ' +
             (s ? EL.Sim.vivos(s).length : '?') + ' sobreviventes.<br>Começar outra apaga esse progresso.',
      nota: 'Para voltar a ela, cancele e use "Continuar colônia".',
      cancelar: 'Voltar', ok: 'COMEÇAR OUTRA'
    }, function (ok) { if (ok) comecar(); });
  });

  document.getElementById('btnLoadGame').addEventListener('click', function () {
    var s = EL.carregar();
    if (!s) { EL.UI.avisar('NENHUM SALVAMENTO', 'Não há colônia salva neste navegador.'); return; }
    iniciar(s);
  });

  /* semente escondida: é ferramenta, não decisão de jogador */
  document.getElementById('btnSemente').addEventListener('click', function () {
    var b = document.getElementById('sementeBox');
    b.classList.toggle('hidden');
    if (!b.classList.contains('hidden')) document.getElementById('seedInput').focus();
  });

  function pintaContinuar() {
    var b = document.getElementById('btnLoadGame'), s = EL.carregar();
    if (!s) { b.classList.add('hidden'); return; }
    b.classList.remove('hidden');
    document.getElementById('contInfo').textContent =
      '· sol ' + s.sol + ' · ' + EL.Sim.vivos(s).length + ' vivos';
  }

  /* ---------- modos secundários: diário, cenários, arquivo ---------- */
  function pintaSecundarios() {
    var en = EL.LANG === 'en';
    var dia = EL.Diario.numeroDoDia();
    document.getElementById('diarioNum').textContent = '#' + dia;

    var cq = EL.Conquistas.ler();
    var venc = ['c_cen_inverno','c_cen_sozinho','c_cen_tanque','c_cen_tabula',
                'c_cen_anom','c_cen_enxame','c_cen_geracao'].filter(function (k) { return cq[k]; }).length;
    document.getElementById('cenCount').textContent = venc + '/7';
    document.getElementById('arqCount').textContent = EL.Arquivo.quantos() + '/' + EL.Arquivo.total();

    var r = EL.Diario.resultadoDoDia(dia), emAndamento = EL.Diario.carregar();
    var seq = EL.Diario.sequencia(), el = document.getElementById('diarioEstado');
    if (r) el.textContent = (en ? 'Daily #' + dia + ' done: ' : 'Desafio #' + dia + ' feito: ') + r.sol + ' sols' +
      (seq > 1 ? (en ? ' · ' + seq + '-day streak' : ' · sequência de ' + seq + ' dias') : '');
    else if (emAndamento) el.textContent = en ? 'Daily run in progress — sol ' + emAndamento.sol
                                              : 'Desafio de hoje em andamento — sol ' + emAndamento.sol;
    else if (seq > 0) el.textContent = en ? 'Streak of ' + seq + ' days — do not miss today'
                                          : 'Sequência de ' + seq + ' dias — não perca hoje';
    else el.textContent = '';
  }

  function iniciarDiario() {
    var dia = EL.Diario.numeroDoDia();
    var emAndamento = EL.Diario.carregar();
    if (emAndamento) { iniciar(emAndamento); return; }
    var jaFeito = EL.Diario.resultadoDoDia(dia);
    if (jaFeito) {
      EL.UI.dialogo({
        titulo: 'DESAFIO #' + dia + ' JÁ JOGADO', icone: '📅',
        texto: 'Você sobreviveu <b>' + jaFeito.sol + ' sols</b> no planeta de hoje.<br>' +
               'O placar guarda sempre a primeira tentativa.',
        nota: 'Um planeta novo aparece todo dia.',
        cancelar: 'Voltar', ok: 'Jogar assim mesmo'
      }, function (ok) { if (ok) { EL.Diario.limpar(); iniciar(EL.Diario.novaPartida()); } });
      return;
    }
    iniciar(EL.Diario.novaPartida());
  }

  document.getElementById('btnDiario').addEventListener('click', iniciarDiario);
  document.getElementById('btnCenarios').addEventListener('click', function () { EL.UI.abrirCenarios(); });
  document.getElementById('btnArquivo').addEventListener('click', function () { EL.UI.abrirArquivo(); });

  window.EL_iniciarCenario = function (id) {
    var c = EL.cenarioPorId(id); if (!c) return;
    function vai() {
      document.getElementById('cenTela').classList.add('hidden');
      iniciar(EL.novoCenario(id, 'ELYSIUM-' + id));
    }
    if (!EL.temSave()) { vai(); return; }
    EL.UI.dialogo({
      titulo: 'INICIAR CENÁRIO', perigo: true, icone: '⚠',
      texto: 'Começar <b>' + c.n + '</b> apaga a colônia salva neste navegador.',
      nota: 'O Desafio Diário e o Arquivo não são afetados.',
      cancelar: 'Voltar', ok: 'COMEÇAR'
    }, function (ok) { if (ok) vai(); });
  };

  /* ---------- estado inicial da tela ---------- */
  dif = 'facil';
  aplicarTextoUI();
  pintaDif();
  pintaContinuar();
  pintaSecundarios();
  ligarRodape();

  /* ---- barra inferior ---- */
  function irParaVisao() {
    var b = document.querySelector('#tabs button[data-tab="visao"]');
    if (b && !b.classList.contains('sel')) b.click();
    document.getElementById('tabbody').scrollTop = 0;
  }

  document.getElementById('btnAdvance').addEventListener('click', function () {
    var err = EL.Sim.avancar(st);
    if (err) { EL.UI.toast(err); return; }
    EL.UI.render(); EL.salvar(st);
    irParaVisao();
  });

  document.getElementById('btnAdvance5').addEventListener('click', function () {
    for (var i = 0; i < 5; i++) {
      if (st.pendente || st.fimDeJogo) break;
      EL.Sim.avancar(st);
    }
    EL.UI.render(); EL.salvar(st);
    irParaVisao();
  });

  document.getElementById('btnSave').addEventListener('click', function () {
    EL.salvar(st) ? EL.UI.toast('Colônia salva no navegador.') : EL.UI.toast('Falha ao salvar.');
  });

  document.getElementById('btnMenu').addEventListener('click', function () {
    var box = document.getElementById('modalBox');
    box.innerHTML = '<h3>MENU</h3>' +
      '<p>Semente do mundo <b>' + (st.seedStr || '—') + '</b> · dificuldade <b>' + EL.DIFICULDADE[st.dif].n + '</b> · sol <b>' + st.sol + '</b> · ' +
      EL.Sim.vivos(st).length + ' sobreviventes.</p>' +
      '<div class="choices">' +
      '<button data-menu="fechar">Voltar ao jogo</button>' +
      '<button data-menu="exportar">Exportar salvamento (.json)<i>Arquivo para backup ou para jogar em outro navegador.</i></button>' +
      '<button data-menu="importar">Importar salvamento<i>Substitui a colônia atual.</i></button>' +
      '<button data-menu="reiniciar">Abandonar e recomeçar<i>Apaga tudo. Não há como desfazer.</i></button>' +
      '</div>';
    box.innerHTML = EL.tHTML(box.innerHTML);
    document.getElementById('modal').classList.remove('hidden');
  });

  document.getElementById('modal').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-menu]'); if (!b) return;
    var a = b.dataset.menu;
    if (a === 'fechar') { document.getElementById('modal').classList.add('hidden'); EL.UI.render(); }
    else if (a === 'exportar') { EL.exportar(st); }
    else if (a === 'importar') {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var s = JSON.parse(r.result);
            if (!s.crew) throw 0;
            st = s; EL.UI.setState(st); EL.salvar(st);
            document.getElementById('modal').classList.add('hidden'); EL.UI.render();
            EL.UI.toast('Salvamento importado.');
          } catch (err) {
            EL.UI.avisar('ARQUIVO INVÁLIDO',
              'Este arquivo não é um salvamento do Project Elysium.',
              'Use um .json gerado por Menu → Exportar salvamento.');
          }
        };
        r.readAsText(f);
      };
      inp.click();
    } else if (a === 'reiniciar') {
      EL.UI.dialogo({
        titulo: 'ABANDONAR A COLÔNIA',
        perigo: true, icone: '☠',
        texto: 'Isto apaga permanentemente a colônia do sol <b>' + st.sol + '</b> — ' +
               EL.Sim.vivos(st).length + ' sobreviventes, ' + st.tech.feitas.length + ' tecnologias, ' +
               st.predios.filter(function (p) { return p.pronto; }).length + ' edificações.',
        nota: 'Não há como desfazer. Exporte o salvamento antes se quiser guardá-lo.',
        cancelar: 'Voltar', ok: 'APAGAR TUDO'
      }, function (ok) { if (ok) { EL.apagarSave(); location.reload(); } });
    }
  });

  /* teclado */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (!document.getElementById('dialog').classList.contains('hidden')) return;
    if (!document.getElementById('modal').classList.contains('hidden')) return;
    if (!st || st.pendente) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); document.getElementById('btnAdvance').click(); }
  });

  /* gaveta de recursos no celular */
  function fechaGaveta() {
    document.getElementById('side').classList.remove('open');
    document.getElementById('sideVeu').classList.remove('on');
  }
  document.getElementById('btnSide').addEventListener('click', function () {
    var ab = document.getElementById('side').classList.toggle('open');
    document.getElementById('sideVeu').classList.toggle('on', ab);
  });
  document.getElementById('sideVeu').addEventListener('click', fechaGaveta);
  document.getElementById('side').addEventListener('click', function (e) {
    if (e.target.closest('.row')) fechaGaveta();
  });

  var _bj = document.getElementById('btnLangJogo');
  if (_bj) _bj.addEventListener('click', trocarIdiomaDialogo);

  EL.UI.bind();
})();
