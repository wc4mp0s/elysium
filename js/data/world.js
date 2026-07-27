/* PROJECT ELYSIUM — o planeta, o mapa, o clima */
var EL = window.EL || {}; window.EL = EL;

EL.PLANET = {
  nome: 'Elysium', designacao: 'EL-7742',
  estrela: 'Vesper (K3V)', distanciaTerra: 22.7,
  raio: 1.14, massa: 1.38, gravidade: 1.06,
  solHoras: 27.4,          // duração do dia local
  anoSols: 402,            // duração do ano local
  obliquidade: 21.6,
  pressao: 0.91,
  atm: { N2: 74.1, O2: 19.1, Ar: 3.2, CO2: 1.2 },
  co2Penalidade: 0.92,     // multiplicador cognitivo/físico ao nível da planície
  magnetismo: 0.6,
  luas: [
    { nome: 'Kore', periodo: 19, massa: 0.7 },
    { nome: 'Ilex', periodo: 3.1, massa: 0.02 }
  ],
  fotovoltaicoFator: 0.65  // luz vermelha de Vesper: painéis rendem 65% do nominal terrestre
};

EL.ESTACOES = [
  { id: 'verdejo', nome: 'Verdejo',  tMin: 4,   tMax: 21, chuva: 0.42, poeira: 0.05, vento: 0.35, desc: 'Degelo e chuvas frontais. O Ferrun engorda.' },
  { id: 'escaldo', nome: 'Escaldo',  tMin: 14,  tMax: 38, chuva: 0.08, poeira: 0.18, vento: 0.25, desc: 'Seca dura. O rio recua 70%. Risco de incêndio.' },
  { id: 'cinzeiro',nome: 'Cinzeiro', tMin: 2,   tMax: 24, chuva: 0.22, poeira: 0.55, vento: 0.70, desc: 'Tempestades de poeira. Migração do enxame-mandíbula.' },
  { id: 'gelido',  nome: 'Gélido',   tMin: -24, tMax: 6,  chuva: 0.30, poeira: 0.10, vento: 0.50, desc: 'Neve na planície. Aquecimento consome tudo.' }
];
EL.SOLS_POR_ESTACAO = 100; // 4 x 100 = 400, +2 sols de intercalação no Gélido

/* ---------------- BIOMAS ---------------- */
EL.BIOMAS = {
  O: { nome: 'Oceano Thalassa',      icone: '≈', cor: '#123047', mov: 9, perigo: 3, agua: 1.0 },
  C: { nome: 'Litoral',              icone: '~', cor: '#1c3b4a', mov: 2, perigo: 1, agua: 0.6 },
  D: { nome: 'Delta de Miríade',     icone: '⌇', cor: '#1f4438', mov: 3, perigo: 2, agua: 0.9 },
  P: { nome: 'Planície de Cinzas',   icone: '·', cor: '#2c2a20', mov: 1, perigo: 1, agua: 0.2 },
  F: { nome: 'Floresta de Espirais', icone: '♣', cor: '#1a3324', mov: 3, perigo: 2, agua: 0.5 },
  E: { nome: 'Deserto de Sal Vítreo',icone: '∴', cor: '#3d3520', mov: 2, perigo: 3, agua: 0.05 },
  S: { nome: 'Pântano Amaranto',     icone: '≋', cor: '#2a2c1c', mov: 4, perigo: 4, agua: 0.9 },
  M: { nome: 'Cordilheira Kestrel',  icone: '▲', cor: '#2b3038', mov: 5, perigo: 3, agua: 0.3 },
  V: { nome: 'Caldeira Tyr',         icone: '🜂', cor: '#43201a', mov: 6, perigo: 6, agua: 0.1 },
  I: { nome: 'Campos de Gelo Boreal',icone: '❄', cor: '#22323f', mov: 5, perigo: 4, agua: 0.8 },
  X: { nome: 'Cratera Solene',       icone: '◎', cor: '#33302a', mov: 3, perigo: 2, agua: 0.1 },
  K: { nome: 'Cavernas de Kore',     icone: '⊙', cor: '#241f2e', mov: 4, perigo: 5, agua: 0.4 },
  T: { nome: 'Chapada de Basalto',   icone: '≡', cor: '#2d2d33', mov: 3, perigo: 2, agua: 0.15 },
  L: { nome: 'Planalto Ocre',        icone: '▣', cor: '#3a2e1e', mov: 3, perigo: 2, agua: 0.2 },
  U: { nome: 'Maciço Ultramáfico',   icone: '◈', cor: '#26302b', mov: 6, perigo: 4, agua: 0.2 },
  A: { nome: 'Anomalia',             icone: '¤', cor: '#2e2440', mov: 3, perigo: 5, agua: 0.2 }
};

/* Grade 12 colunas (A–L) x 10 linhas. Linha 1 = norte polar, linha 10 = subtropical. */
EL.GRID = [
  'OOIIIIIIIIII',
  'OCPFFPPTTMMI',
  'OCPFFPXPMMMM',
  'OCLPPPPPMMMU',
  'OCPPPPPPPMMM',
  'OCPPPPPPPMKM',
  'OCCPPPPPAMMM',
  'OCCDPPSSPMVM',
  'OOCEEESPPMMM',
  'OOOEEEEPPPMM'
];
EL.COLS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
EL.BASE_SETOR = 'F6';
EL.RIO = ['H3','G4','F5','G6','G7','G8','G9','F9','E9','D8'];

/* Nomes próprios de setores notáveis */
EL.SETOR_NOMES = {
  'F6':'Campo Perseverança', 'G3':'Cratera Solene', 'C4':'Planalto Ocre',
  'K6':'Cavernas de Kore', 'K8':'Caldeira Tyr', 'L4':'Maciço de Vall',
  'I7':'A Anomalia', 'D8':'Delta de Miríade', 'B6':'Praias Negras',
  'H2':'Chapada dos Ventos', 'D2':'Bosque Espiral', 'E10':'Salinas de Vítreo',
  'H8':'Brejo Amaranto', 'J1':'Muralha Boreal', 'H3':'Nascente do Ferrun'
};

/* Distância em setores (Chebyshev, terreno aproximado) */
EL.setorXY = function (id) {
  var c = EL.COLS.indexOf(id[0]);
  var r = parseInt(id.slice(1), 10) - 1;
  return { x: c, y: r };
};
EL.setorId = function (x, y) {
  if (x < 0 || x > 11 || y < 0 || y > 9) return null;
  return EL.COLS[x] + (y + 1);
};
EL.dist = function (a, b) {
  var A = EL.setorXY(a), B = EL.setorXY(b);
  return Math.max(Math.abs(A.x - B.x), Math.abs(A.y - B.y));
};
EL.bioma = function (id) {
  var p = EL.setorXY(id);
  return EL.GRID[p.y][p.x];
};
EL.vizinhos = function (id) {
  var p = EL.setorXY(id), out = [];
  for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue;
    var s = EL.setorId(p.x + dx, p.y + dy);
    if (s) out.push(s);
  }
  return out;
};

/* ---------------- CLIMA ---------------- */
EL.Clima = {
  estacaoDe: function (solDoAno) {
    var i = Math.floor((solDoAno - 1) / EL.SOLS_POR_ESTACAO);
    return EL.ESTACOES[Math.min(3, i)];
  },
  /* Gera o tempo de um sol. Determinístico via rng do estado. */
  gerar: function (st, rng) {
    var solAno = ((st.sol - 1) % EL.PLANET.anoSols) + 1;
    var est = EL.Clima.estacaoDe(solAno);
    var faseEst = ((solAno - 1) % EL.SOLS_POR_ESTACAO) / EL.SOLS_POR_ESTACAO;
    var senoide = Math.sin(faseEst * Math.PI); // pico no meio da estação
    var tBase = est.tMin + (est.tMax - est.tMin) * (0.35 + 0.65 * senoide);
    var temp = rng.gauss(tBase, 4.2, est.tMin - 10, est.tMax + 8);
    var tMin = temp - rng.float(7, 13); // amplitude térmica alta: atmosfera fina, sol de 27,4 h

    var cond = 'limpo', solarF = 1.0, ventoF = rng.float(0.4, 1.2) * (0.6 + est.vento);
    var chuva = 0, poeira = 0, acido = false;

    var r = rng.next();
    if (r < est.chuva * 0.75) {
      cond = 'chuva'; chuva = rng.float(3, 22); solarF = rng.float(0.25, 0.5);
      if (rng.chance(0.28)) { cond = 'chuva ácida'; acido = true; }
      if (rng.chance(0.12)) { cond = 'tempestade'; chuva = rng.float(25, 70); ventoF *= 1.9; solarF = 0.15; }
    } else if (r < est.chuva * 0.75 + est.poeira * 0.8) {
      cond = 'poeira'; poeira = rng.float(0.2, 0.7); solarF = rng.float(0.25, 0.65);
      if (rng.chance(0.15)) { cond = 'tempestade de poeira'; poeira = rng.float(0.7, 1); solarF = 0.08; ventoF *= 2.1; }
    } else if (r < est.chuva * 0.75 + est.poeira * 0.8 + 0.14) {
      cond = 'nublado'; solarF = rng.float(0.45, 0.75);
    }
    if (temp < 0 && chuva > 0) cond = 'neve';

    // fulguração de Vesper (estrela de fulguração): 1,8% por sol
    var flare = rng.chance(0.018);

    // maré composta Kore + Ilex
    var fk = Math.cos(2 * Math.PI * (st.sol % 19) / 19);
    var fi = Math.cos(2 * Math.PI * (st.sol % 3.1) / 3.1);
    var mare = 3.4 + 4.2 * Math.abs(fk) + 1.1 * Math.abs(fi) * Math.abs(fk);

    return {
      temp: Math.round(temp * 10) / 10, tempMin: Math.round(tMin * 10) / 10,
      cond: cond, solarF: solarF, ventoF: Math.round(ventoF * 100) / 100,
      chuva: Math.round(chuva * 10) / 10, poeira: Math.round(poeira * 100) / 100,
      acido: acido, flare: flare, mare: Math.round(mare * 10) / 10,
      estacao: est.id, estacaoNome: est.nome, solAno: solAno
    };
  }
};
