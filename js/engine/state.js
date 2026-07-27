/* PROJECT ELYSIUM — criação, salvamento e carregamento do estado */
var EL = window.EL || {}; window.EL = EL;

EL.SAVE_KEY = 'elysium_save_v1';

EL.DIFICULDADE = {
  facil:   { n:'Sobrevivente',     consumo:0.70, evento:0.60, risco:0.50, producao:1.75, pp:1.75 },
  normal:  { n:'Difícil',          consumo:0.85,evento:0.8,  risco:0.75, producao:1.3,  pp:1.3 },
  extremo: { n:'Realismo Extremo', consumo:1.0, evento:1.0,  risco:1.0,  producao:1.0,  pp:1.0 },
  brutal:  { n:'Brutal',           consumo:1.12,evento:1.25, risco:1.35, producao:0.88, pp:0.9 }
};

EL.novoJogo = function (seedStr, dif) {
  var seed = EL.RNG.hashSeed(seedStr || 'ELYSIUM-1');
  var rng = EL.RNG.make(seed);

  var st = {
    versao: 1,
    seed: seed, seedStr: seedStr, dif: dif || 'extremo',
    rngState: 0,
    sol: 1, ano: 1,
    clima: null,
    crew: [], mortos: [], rel: {},
    mat: {},
    energia: { armazenada: 186, capacidade: 186, capacidadeBase: 186, sujeira: 0.05, penalidade: 0, geracao: 0, demanda: 0, ultimoDeficit: 0 },
    agua: { recicladorBase: 0.61, recicladorDano: 0, fontes: 0, produzidaHoje: 0, consumidaHoje: 0 },
    tech: { feitas: [], pp: 0, ativa: [] },
    predios: [], uidPredio: 1,
    filaProducao: [],
    agricultura: { lotes: [], solo: JSON.parse(JSON.stringify(EL.SOLO_INICIAL)) },
    setores: {},
    robos: {
      atlas: { integridade: 88, ativo: true, tarefa: 'construir', setor: EL.BASE_SETOR, overclock: false, upgrades: [] },
      kite:  { integridade: 100, ativo: true, rps: false, voando: false, alvo: null }
    },
    impressora: { ok: true, usos: 0 },
    casco: { restante: 2300, sucataRestante: 1240 },
    politica: { racaoComida: 1.0, racaoAgua: 1.0, racaoDesigual: false, prioridade: 'equilibrio' },
    bonus: {},
    flags: {},
    log: [],
    eventosCd: {},
    pendente: null,
    fimDeJogo: null,
    hist: [],
    marcos: [],
    tutorial: { passo: 0, ativo: true },
    stats: { nascidos: 0, mortosTotal: 0, colheitas: 0, techs: 0, predios: 0 }
  };

  /* ---- materiais iniciais ---- */
  var m = st.mat;
  for (var k in EL.MAT) m[k] = 0;
  m.agua = 1800; m.comida = 800;
  m.polimero = 340; m.po_aco = 210; m.titanio = 40;
  m.sucata = 0; m.cabo = 340; m.semente = 12.4;
  m.medicamento = 100; m.antibiotico = 6;
  m.fibra = 0; m.pedra = 0; m.argila = 0;

  /* ---- tripulação ---- */
  for (var i = 0; i < EL.CREW_BASE.length; i++) {
    var b = EL.CREW_BASE[i];
    st.crew.push({
      id: b.id, nome: b.nome, idade: b.idade, sexo: b.sexo, func: b.func,
      per: JSON.parse(JSON.stringify(b.per)),
      tracos: b.tracos.slice(), fraqueza: b.fraqueza, bio: b.bio,
      humor: b.h, fadiga: b.f, fome: b.fo, saude: b.s, moral: b.m,
      vivo: true,
      ferimento: b.ferimento ? JSON.parse(JSON.stringify(b.ferimento)) : null,
      doente: 0, trabalho: 'descanso', setorTrab: EL.BASE_SETOR, recurso: null,
      xp: {}, forcado: null, forcadoAte: 0, amputado: false, nativo: false
    });
  }

  /* ---- mortos do pouso ---- */
  for (var j = 0; j < EL.MORTOS_INICIAIS.length; j++) {
    var d = EL.MORTOS_INICIAIS[j];
    st.mortos.push({ nome: d.nome, func: d.func, causa: d.causa, sol: 0 });
  }

  /* ---- relações ---- */
  for (var r = 0; r < EL.RELACOES_INICIAIS.length; r++) {
    var x = EL.RELACOES_INICIAIS[r];
    st.rel[EL.relKey(x[0], x[1])] = x[2];
  }

  /* ---- setores ---- */
  for (var y = 0; y < 10; y++) for (var xx = 0; xx < 12; xx++) {
    var sid = EL.setorId(xx, y);
    st.setores[sid] = { explorado: 0, rota: false, outpost: false };
  }
  st.setores[EL.BASE_SETOR].explorado = 100;
  st.setores[EL.BASE_SETOR].rota = true;
  st.setores[EL.BASE_SETOR].outpost = true;
  // o sobrevoo orbital deixou alguma coisa
  var vis = EL.vizinhos(EL.BASE_SETOR);
  for (var v = 0; v < vis.length; v++) st.setores[vis[v]].explorado = 35;
  st.setores['I7'].explorado = 12;   // a anomalia foi vista de longe
  st.setores['K8'].explorado = 20;   // a coluna de Tyr é visível do acampamento
  st.setores['G3'].explorado = 15;

  /* ---- edificações herdadas do pouso ---- */
  ['lab_campo', 'enfermaria', 'oficina', 'tenda', 'tenda'].forEach(function (bid) {
    st.predios.push({ uid: st.uidPredio++, id: bid, setor: EL.BASE_SETOR, pronto: true, ptFeito: 0, hp: 100 });
  });

  st.rngState = rng.state;
  st.clima = EL.Clima.gerar(st, rng);
  st.rngState = rng.state;

  EL.logar(st, '— SOL 1 —', 'sol');
  EL.logar(st, 'A NAV Perseverança está deitada a 30° sobre o cascalho da Planície de Cinzas. Vinte pessoas em pé, quatro sob lona. Ninguém dormiu.', 'warn');
  EL.logar(st, 'Vosk se vira para você e espera. Aloque o trabalho e avance o sol.', 'info');
  return st;
};

EL.relKey = function (a, b) { return a < b ? a + '|' + b : b + '|' + a; };
EL.getRel = function (st, a, b) { var v = st.rel[EL.relKey(a, b)]; return v === undefined ? 0 : v; };
EL.setRel = function (st, a, b, v) { st.rel[EL.relKey(a, b)] = Math.max(-100, Math.min(100, v)); };

EL.traduzLog = function (txt) {
  if (EL.LANG !== 'en' || !EL.EN) return txt;
  if (EL.EN.log && EL.EN.log[txt]) return EL.EN.log[txt];
  var re = EL.EN.logRe || [];
  for (var i = 0; i < re.length; i++) {
    var m = txt.match(re[i][0]);
    if (m) return re[i][1](m);
  }
  return txt;
};

EL.logar = function (st, txt, tipo) {
  st.log.push({ sol: st.sol, txt: EL.traduzLog(txt), tipo: tipo || '' });
  if (st.log.length > 600) st.log.splice(0, st.log.length - 600);
};

EL.salvar = function (st) {
  try { localStorage.setItem(EL.SAVE_KEY, JSON.stringify(st)); return true; }
  catch (e) { return false; }
};
EL.carregar = function () {
  try {
    var s = localStorage.getItem(EL.SAVE_KEY);
    if (!s) return null;
    var st = JSON.parse(s);
    if (!st || !st.crew) return null;
    return st;
  } catch (e) { return null; }
};
EL.temSave = function () { return !!localStorage.getItem(EL.SAVE_KEY); };
EL.apagarSave = function () { localStorage.removeItem(EL.SAVE_KEY); };

EL.exportar = function (st) {
  var blob = new Blob([JSON.stringify(st)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'elysium-sol' + st.sol + '.json';
  a.click();
};
