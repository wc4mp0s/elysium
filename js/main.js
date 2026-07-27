/* PROJECT ELYSIUM — inicialização */
(function () {
  var st = null, dif = 'extremo';

  EL.aplicarIdioma();
  aplicarTextoUI();

  function aplicarTextoUI() {
    var T = EL.t;
    function set(sel, v) { var e = document.querySelector(sel); if (e) e.textContent = v; }
    function setHTML(sel, v) { var e = document.querySelector(sel); if (e) e.innerHTML = v; }
    set('.boot-sub', T('subtitulo'));
    var pd = document.querySelectorAll('.boot-desc p');
    if (pd[0]) pd[0].innerHTML = T('introA');
    if (pd[1]) pd[1].innerHTML = T('introB');
    var lbl = document.querySelector('.boot-seed');
    if (lbl) lbl.childNodes[0].nodeValue = T('semente') + ' ';
    set('#btnNewGame', T('iniciar'));
    set('#btnLoadGame', T('continuar'));
    set('.boot-foot', T('rodape'));
    set('#btnSave', T('salvar'));
    set('#btnMenu', T('menu'));
    set('#btnAdvance', T('avancar1'));
    set('#btnAdvance5', T('avancar5'));
    document.getElementById('btnLang').textContent = EL.LANG === 'en' ? 'PT' : 'EN';
    var abas = T('abas');
    document.querySelectorAll('#tabs button').forEach(function (b) {
      if (abas[b.dataset.tab]) b.textContent = abas[b.dataset.tab];
    });
    var h3 = document.querySelectorAll('.side .panel h3');
    [T('estoqueVital'), T('energia'), T('materiais'), T('maquinas')].forEach(function (v, i) {
      if (h3[i]) h3[i].textContent = v;
    });
    document.querySelectorAll('.diffBtn').forEach(function (b) {
      var m = { facil:['SOBREVIVENTE','SURVIVOR'], normal:['DIFÍCIL','HARD'],
                extremo:['EXTREMO','EXTREME'], brutal:['BRUTAL','BRUTAL'] }[b.dataset.diff];
      if (m) b.textContent = EL.LANG === 'en' ? m[1] : m[0];
    });
  }

  function iniciar(estado) {
    st = estado;
    EL.UI.setState(st);
    document.getElementById('boot').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    EL.UI.render();
    EL.salvar(st);
  }

  var DIF_TXT = {
    facil:   'Margens folgadas de água, comida e energia. Para a primeira colônia — você ainda vai perder gente, mas dá tempo de aprender.',
    normal:  'Equilibrado e implacável. Um erro custa caro, mas a colônia consegue se recuperar dele.',
    extremo: 'Nada é facilitado. Um erro de alocação no sol 5 costuma matar a colônia no sol 45, sem aviso.',
    brutal:  'Produção reduzida, eventos mais frequentes, riscos maiores. Para quem já venceu no Extremo.'
  };
  function pintaDif() {
    document.querySelectorAll('.diffBtn').forEach(function (x) { x.classList.toggle('sel', x.dataset.diff === dif); });
    document.getElementById('bootDifTxt').textContent = (EL.t('dif') || {})[dif] || DIF_TXT[dif] || '';
  }
  document.querySelectorAll('.diffBtn').forEach(function (b) {
    b.addEventListener('click', function () { dif = b.dataset.diff; pintaDif(); });
  });
  dif = 'facil';
  pintaDif();

  function comecar() {
    var seed = document.getElementById('seedInput').value.trim() || 'ELYSIUM-1';
    iniciar(EL.novoJogo(seed, dif));
  }

  document.getElementById('btnNewGame').addEventListener('click', function () {
    if (!EL.temSave()) { comecar(); return; }
    var s = EL.carregar();
    var onde = s ? ('sol <b>' + s.sol + '</b>, ' + EL.Sim.vivos(s).length + ' sobreviventes') : 'em andamento';
    EL.UI.dialogo({
      titulo: 'COLÔNIA EXISTENTE',
      perigo: true, icone: '⚠',
      texto: 'Há uma colônia salva neste navegador — ' + onde + '.<br>' +
             'Iniciar uma nova <b>apaga esse progresso permanentemente</b>.',
      nota: 'Para preservá-la, cancele, escolha CONTINUAR e use Menu → Exportar salvamento.',
      cancelar: 'Voltar', ok: 'APAGAR E COMEÇAR'
    }, function (ok) { if (ok) comecar(); });
  });

  document.getElementById('btnLoadGame').addEventListener('click', function () {
    var s = EL.carregar();
    if (!s) {
      EL.UI.avisar('NENHUM SALVAMENTO',
        'Não há colônia salva neste navegador.',
        'Se você tem um arquivo .json exportado, inicie uma colônia e use Menu → Importar.');
      return;
    }
    iniciar(s);
  });

  if (!EL.temSave()) document.getElementById('btnLoadGame').disabled = true;

  /* ---- barra inferior ---- */
  document.getElementById('btnAdvance').addEventListener('click', function () {
    var err = EL.Sim.avancar(st);
    if (err) EL.UI.toast(err);
    EL.UI.render(); EL.salvar(st);
    document.getElementById('tabbody').scrollTop = 0;
  });

  document.getElementById('btnAdvance5').addEventListener('click', function () {
    for (var i = 0; i < 5; i++) {
      if (st.pendente || st.fimDeJogo) break;
      EL.Sim.avancar(st);
    }
    EL.UI.render(); EL.salvar(st);
    document.getElementById('tabbody').scrollTop = 0;
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

  document.getElementById('btnLang').addEventListener('click', function () {
    EL.UI.dialogo({
      titulo: EL.LANG === 'en' ? 'CHANGE LANGUAGE' : 'TROCAR IDIOMA',
      texto: EL.LANG === 'en'
        ? 'Switch the game to <b>Portuguese</b>? The page will reload.'
        : 'Mudar o jogo para <b>inglês</b>? A página será recarregada.',
      nota: EL.LANG === 'en' ? 'Your saved colony is kept.' : 'Sua colônia salva é preservada.',
      cancelar: EL.LANG === 'en' ? 'Cancel' : 'Cancelar',
      ok: EL.LANG === 'en' ? 'Português' : 'English'
    }, function (ok) { if (ok) EL.trocarIdioma(EL.LANG === 'en' ? 'pt' : 'en'); });
  });

  EL.UI.bind();
})();
