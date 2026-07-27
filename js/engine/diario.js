/* PROJECT ELYSIUM — Desafio Diário.
   Todo mundo joga o mesmo planeta no mesmo dia. A semente é a data.
   Nada disso precisa de servidor: o histórico fica no navegador de quem joga. */
var EL = window.EL || {}; window.EL = EL;

EL.Diario = (function () {

  var CHAVE_HIST = 'elysium_diario_hist';
  var CHAVE_SAVE = 'elysium_save_diario';
  var EPOCA = Date.UTC(2026, 6, 27);        // 27/07/2026 = desafio #1
  var DIF = 'normal';                        // fixa, para os resultados serem comparáveis

  function hojeUTC() {
    var d = new Date();
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  function numeroDoDia(ms) {
    return Math.floor(((ms === undefined ? hojeUTC() : ms) - EPOCA) / 86400000) + 1;
  }
  function dataISO(ms) {
    var d = new Date(ms === undefined ? hojeUTC() : ms);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
  }
  function semente(ms) { return 'ELYSIUM-' + dataISO(ms); }

  /* ---------- histórico local ---------- */
  function historico() {
    try { return JSON.parse(localStorage.getItem(CHAVE_HIST) || '[]'); }
    catch (e) { return []; }
  }
  function salvarHistorico(h) {
    try { localStorage.setItem(CHAVE_HIST, JSON.stringify(h.slice(-400))); } catch (e) {}
  }
  function resultadoDoDia(dia) {
    var h = historico();
    for (var i = 0; i < h.length; i++) if (h[i].dia === dia) return h[i];
    return null;
  }
  function jaJogouHoje() { return !!resultadoDoDia(numeroDoDia()); }

  /* Registra o resultado da partida diária. Só o primeiro resultado do dia conta. */
  function registrar(st) {
    if (!st.diario) return null;
    var h = historico();
    for (var i = 0; i < h.length; i++) if (h[i].dia === st.diarioDia) return h[i];
    var r = {
      dia: st.diarioDia,
      data: dataISO(),
      sol: st.sol,
      vivos: EL.Sim.vivos(st).length,
      mortos: st.mortos.length,
      tec: st.tech.feitas.length,
      vitoria: !!(st.fimDeJogo && st.fimDeJogo.tipo === 'vitoria'),
      causa: (st.fimDeJogo && st.fimDeJogo.causa) || '',
      marcos: (st.marcos || []).map(function (m) { return m.id; })
    };
    h.push(r); salvarHistorico(h);
    return r;
  }

  /* Sequência de dias consecutivos, contando para trás a partir de hoje.
     Faltar um dia zera a sequência — mas nada é perdido nem punido além disso. */
  function sequencia() {
    var h = historico(), set = {};
    h.forEach(function (r) { set[r.dia] = true; });
    var hoje = numeroDoDia(), n = 0, d = set[hoje] ? hoje : hoje - 1;
    while (set[d]) { n++; d--; }
    return n;
  }

  function melhor() {
    var h = historico(), m = null;
    h.forEach(function (r) { if (!m || r.sol > m.sol) m = r; });
    return m;
  }

  /* ---------- marcos exibidos no cartão ---------- */
  var SELOS = [
    { id: 'autoAgua',         e: '💧', n: 'Água renovável' },
    { id: 'primeiraColheita', e: '🌾', n: 'Primeira colheita' },
    { id: 'metal',            e: '⛏', n: 'Primeiro metal' },
    { id: 'autoComida',       e: '🍞', n: 'Autossuficiência' },
    { id: 'eletricidade',     e: '⚡', n: 'Eletricidade' },
    { id: 'industria',        e: '🏭', n: 'Indústria pesada' },
    { id: 'nascimento',       e: '👶', n: 'Primeiro nascimento' },
    { id: 'espaco',           e: '🚀', n: 'Voo espacial' }
  ];

  function selos(marcosIds) {
    var s = '';
    for (var i = 0; i < SELOS.length; i++) {
      s += (marcosIds.indexOf(SELOS[i].id) >= 0) ? SELOS[i].e : '⬛';
    }
    return s;
  }

  /* ---------- cartão de compartilhamento ---------- */
  function cartao(st) {
    var en = EL.LANG === 'en';
    var ids = (st.marcos || []).map(function (m) { return m.id; });
    var v = EL.Sim.vivos(st).length;
    var seq = sequencia();
    var l = [];
    l.push('PROJECT ELYSIUM #' + st.diarioDia + ' — ' + st.sol + ' ' + (en ? 'sols' : 'sols'));
    l.push(selos(ids));
    if (st.fimDeJogo && st.fimDeJogo.tipo === 'vitoria') {
      l.push('★ ' + (en ? 'CIVILISATION' : 'CIVILIZAÇÃO') + ' · ' + v + (en ? ' alive' : ' vivos'));
    } else if (st.fimDeJogo) {
      l.push('☠ ' + (st.fimDeJogo.causa || (en ? 'Collapse' : 'Colapso')));
    } else {
      l.push('▸ ' + v + (en ? ' still alive' : ' ainda vivos'));
    }
    if (seq > 1) l.push((en ? 'streak: ' : 'sequência: ') + seq + (en ? ' days' : ' dias'));
    l.push('https://wc4mp0s.github.io/elysium/');
    return l.join('\n');
  }

  /* ---------- salvamento próprio, para não misturar com a campanha ---------- */
  function salvar(st) { try { localStorage.setItem(CHAVE_SAVE, JSON.stringify(st)); } catch (e) {} }
  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE_SAVE) || 'null');
      if (s && s.diarioDia === numeroDoDia()) return s;   // partida de ontem não serve
      return null;
    } catch (e) { return null; }
  }
  function limpar() { try { localStorage.removeItem(CHAVE_SAVE); } catch (e) {} }

  /* ---------- criação da partida do dia ---------- */
  function novaPartida() {
    var st = EL.novoJogo(semente(), DIF);
    st.diario = true;
    st.diarioDia = numeroDoDia();
    st.diarioData = dataISO();
    EL.logar(st, EL.LANG === 'en'
      ? 'DAILY CHALLENGE #' + st.diarioDia + ' — everyone plays this same world today.'
      : 'DESAFIO DIÁRIO #' + st.diarioDia + ' — todo mundo joga este mesmo mundo hoje.', 'info');
    return st;
  }

  return {
    numeroDoDia: numeroDoDia, dataISO: dataISO, semente: semente, DIF: DIF,
    historico: historico, resultadoDoDia: resultadoDoDia, jaJogouHoje: jaJogouHoje,
    registrar: registrar, sequencia: sequencia, melhor: melhor,
    selos: selos, SELOS: SELOS, cartao: cartao,
    salvar: salvar, carregar: carregar, limpar: limpar, novaPartida: novaPartida
  };
})();
