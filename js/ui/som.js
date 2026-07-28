/* PROJECT ELYSIUM — som.
   O jogo era completamente silencioso. Um arquivo de áudio traria dependência,
   peso e uma pasta de assets — coisas que este projeto não tem e não quer ter.
   Então nada aqui é gravado: cada som é sintetizado na hora pela Web Audio API,
   a partir de osciladores e ruído. O resultado é um punhado de linhas e zero bytes
   de download.

   A regra de bom-tom do navegador: nenhum áudio antes do primeiro gesto do usuário.
   O contexto só é criado no primeiro clique, e o estado do mudo vive no localStorage. */
var EL = window.EL || {}; window.EL = EL;

EL.Som = (function () {

  var ctx = null, master = null, ligado = true, pronto = false;

  try { ligado = localStorage.getItem('elysium_som') !== '0'; } catch (e) { ligado = true; }

  function iniciar() {
    if (pronto || !window.AudioContext && !window.webkitAudioContext) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.30;                 // o jogo é de leitura: o som acompanha, não disputa
      master.connect(ctx.destination);
      pronto = true;
    } catch (e) { pronto = false; }
  }

  function ok() {
    if (!ligado || !pronto || !ctx) return false;
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { } }
    return true;
  }

  /* Uma nota: onda, frequência inicial, frequência final, duração, volume. */
  function tom(tipo, f0, f1, dur, vol, atraso) {
    if (!ok()) return;
    var t = ctx.currentTime + (atraso || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), t + Math.min(0.02, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  /* Ruído filtrado: vento, desabamento, chuva — o que não tem altura definida. */
  function ruido(dur, vol, corte, tipoFiltro, atraso) {
    if (!ok()) return;
    var t = ctx.currentTime + (atraso || 0);
    var n = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = tipoFiltro || 'lowpass'; f.frequency.value = corte || 900;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur);
  }

  /* ---------- vocabulário sonoro ---------- */
  var VOZ = {
    /* interface: curtos, secos, quase inaudíveis */
    clique:    function () { tom('triangle', 620, 520, 0.045, 0.10); },
    aba:       function () { tom('sine', 440, 560, 0.06, 0.08); },
    alocar:    function () { tom('square', 300, 380, 0.05, 0.05); },

    /* o sol passa: duas notas descendo, como um relógio de estação */
    sol:       function () { tom('sine', 392, 392, 0.10, 0.10); tom('sine', 294, 294, 0.16, 0.09, 0.09); },

    /* boas notícias */
    bom:       function () { tom('sine', 523, 523, 0.09, 0.10); tom('sine', 659, 659, 0.14, 0.10, 0.08); },
    tec:       function () { tom('triangle', 587, 587, 0.09, 0.09);
                             tom('triangle', 784, 784, 0.09, 0.09, 0.09);
                             tom('triangle', 1047, 1047, 0.20, 0.09, 0.18); },
    construir: function () { tom('square', 180, 240, 0.07, 0.07); ruido(0.12, 0.05, 1400, 'lowpass', 0.05); },
    colheita:  function () { tom('sine', 660, 880, 0.13, 0.09); },
    nascer:    function () { tom('sine', 523, 523, 0.12, 0.10);
                             tom('sine', 784, 784, 0.12, 0.10, 0.11);
                             tom('sine', 1047, 1047, 0.32, 0.11, 0.22); },

    /* más notícias */
    aviso:     function () { tom('triangle', 380, 300, 0.14, 0.10); },
    ruim:      function () { tom('sawtooth', 220, 150, 0.22, 0.09); },
    evento:    function () { tom('sine', 330, 330, 0.10, 0.09); tom('sine', 247, 247, 0.22, 0.10, 0.10); },
    colapso:   function () { ruido(0.5, 0.16, 420, 'lowpass'); tom('sawtooth', 120, 55, 0.5, 0.09); },
    morte:     function () { tom('sine', 196, 165, 0.7, 0.11); tom('sine', 131, 110, 1.0, 0.08, 0.12); },

    /* fim de partida */
    vitoria:   function () { [523, 659, 784, 1047].forEach(function (f, i) { tom('sine', f, f, 0.5, 0.11, i * 0.13); }); },
    derrota:   function () { [330, 262, 196, 147].forEach(function (f, i) { tom('sine', f, f, 0.8, 0.10, i * 0.22); }); }
  };

  function tocar(nome) {
    if (!ligado) return;
    if (!pronto) iniciar();
    var v = VOZ[nome];
    if (v) { try { v(); } catch (e) { } }
  }

  /* Traduz um tipo de linha do registro num som, para o motor não precisar saber de áudio. */
  var PORTIPO = { evt: 'evento', bad: 'ruim', good: 'bom', warn: 'aviso' };
  function tocarLog(tipo, texto) {
    if (!ligado) return;
    if (texto) {
      if (texto.indexOf('⚛') === 0) return tocar('tec');
      if (texto.indexOf('☠') === 0) return tocar('morte');
      if (texto.indexOf('★') === 0) return tocar('nascer');
      if (texto.indexOf('✖') === 0) return tocar('colapso');
      if (texto.indexOf('✔') === 0) return tocar('construir');
    }
    var n = PORTIPO[tipo];
    if (n) tocar(n);
  }

  function alternar() {
    ligado = !ligado;
    try { localStorage.setItem('elysium_som', ligado ? '1' : '0'); } catch (e) { }
    if (ligado) { iniciar(); tocar('clique'); }
    return ligado;
  }

  function estaLigado() { return ligado; }

  return { iniciar: iniciar, tocar: tocar, tocarLog: tocarLog, alternar: alternar, ligado: estaLigado };
})();
