/* PROJECT ELYSIUM — camada de idioma.
   O português é o original: fica nos arquivos de dados.
   O inglês é aplicado por cima, sobrescrevendo os campos de texto no carregamento.
   Trocar de idioma recarrega a página — assim não é preciso guardar duas cópias de tudo. */
var EL = window.EL || {}; window.EL = EL;

EL.LANG_KEY = 'elysium_lang';
EL.LANG = (function () {
  try { return localStorage.getItem(EL.LANG_KEY) || 'pt'; } catch (e) { return 'pt'; }
})();

/* Texto de interface. EL.t('chave') devolve português por padrão. */
EL.t = function (k) {
  if (EL.LANG === 'en' && EL.UI_EN && EL.UI_EN[k] !== undefined) return EL.UI_EN[k];
  return EL.UI_PT[k] !== undefined ? EL.UI_PT[k] : k;
};

EL.trFerimento = function (n) {
  if (EL.LANG === 'en' && EL.EN && EL.EN.ferimentos && EL.EN.ferimentos[n]) return EL.EN.ferimentos[n];
  return n;
};
EL.trCausa = function (c) {
  if (EL.LANG === 'en' && EL.EN && EL.EN.causas && EL.EN.causas[c]) return EL.EN.causas[c];
  return c;
};

EL.trocarIdioma = function (lang) {
  try { localStorage.setItem(EL.LANG_KEY, lang); } catch (e) {}
  location.reload();
};

/* Aplica o dicionário inglês sobre os arquivos de dados já carregados. */
EL.aplicarIdioma = function () {
  if (EL.LANG !== 'en' || !EL.EN) return;
  var D = EL.EN;

  function porId(lista, dic, campos) {
    if (!lista || !dic) return;
    for (var i = 0; i < lista.length; i++) {
      var o = lista[i], t = dic[o.id];
      if (!t) continue;
      for (var c = 0; c < campos.length; c++) if (t[campos[c]] !== undefined) o[campos[c]] = t[campos[c]];
    }
  }
  function porChave(obj, dic, campos) {
    if (!obj || !dic) return;
    for (var k in obj) {
      var t = dic[k]; if (!t) continue;
      if (typeof t === 'string') { obj[k].n = t; continue; }
      for (var c = 0; c < campos.length; c++) if (t[campos[c]] !== undefined) obj[k][campos[c]] = t[campos[c]];
    }
  }

  porId(EL.TECH,     D.tech,     ['n', 'd', 'cat']);
  porId(EL.BUILD,    D.build,    ['n', 'd', 'cat']);
  porId(EL.RECURSOS, D.rec,      ['n', 'uso', 'cat']);
  porId(EL.CROPS,    D.crops,    ['n', 'd']);
  porId(EL.JOBS,     D.jobs,     ['n', 'd', 'cat']);
  porId(EL.RECEITAS, D.receitas, ['n']);
  porId(EL.CREW_BASE, D.crew,    ['func', 'fraqueza', 'bio']);
  for (var ic = 0; ic < EL.CREW_BASE.length; ic++) {
    if (EL.CREW_BASE[ic].ferimento) EL.CREW_BASE[ic].ferimento.n = EL.trFerimento(EL.CREW_BASE[ic].ferimento.n);
  }
  if (D.estacoes) for (var ie = 0; ie < EL.ESTACOES.length && ie < D.estacoes.length; ie++) {
    EL.ESTACOES[ie].nome = D.estacoes[ie].nome;
    EL.ESTACOES[ie].desc = D.estacoes[ie].desc;
  }
  porChave(EL.MAT,     D.mat,     ['n', 'u']);
  porChave(EL.BIOMAS,  D.biomas,  ['nome']);
  porChave(EL.TRACOS,  D.tracos,  ['n', 'efe']);

  if (D.pericias) for (var p in D.pericias) if (EL.PERICIAS[p]) EL.PERICIAS[p] = D.pericias[p];
  if (D.rar) for (var r in D.rar) EL.RAR_NOME[r] = D.rar[r];
  if (D.setores) for (var s in D.setores) EL.SETOR_NOMES[s] = D.setores[s];
  if (D.mortos) for (var m = 0; m < EL.MORTOS_INICIAIS.length; m++) {
    if (D.mortos[m]) { EL.MORTOS_INICIAIS[m].func = D.mortos[m].func; EL.MORTOS_INICIAIS[m].causa = D.mortos[m].causa; }
  }
  if (D.dificuldade) for (var dd in D.dificuldade) if (EL.DIFICULDADE[dd]) EL.DIFICULDADE[dd].n = D.dificuldade[dd];

  /* eventos: nome, texto e rótulos das escolhas */
  if (D.eventos) {
    for (var e = 0; e < EL.EVENTOS.length; e++) {
      var ev = EL.EVENTOS[e], te = D.eventos[ev.id];
      if (!te) continue;
      if (te.n) ev.n = te.n;
      if (te.txt) ev.txt = te.txt;
      if (te.e && ev.escolhas) for (var c2 = 0; c2 < ev.escolhas.length && c2 < te.e.length; c2++) {
        if (te.e[c2][0]) ev.escolhas[c2].t = te.e[c2][0];
        if (te.e[c2][1]) ev.escolhas[c2].d = te.e[c2][1];
      }
    }
  }
  /* passos do tutorial */
  if (D.tut && EL.Tutorial) {
    for (var i2 = 0; i2 < EL.Tutorial.PASSOS.length && i2 < D.tut.length; i2++) {
      EL.Tutorial.PASSOS[i2].t = D.tut[i2][0];
      EL.Tutorial.PASSOS[i2].d = D.tut[i2][1];
      EL.Tutorial.PASSOS[i2].feito = D.tut[i2][2];
    }
  }
  /* conselhos de meio de jogo */
  if (D.cons && EL.Conselhos) {
    for (var i3 = 0; i3 < EL.Conselhos.LISTA.length; i3++) {
      var cc = EL.Conselhos.LISTA[i3], tc = D.cons[cc.id];
      if (!tc) continue;
      cc.t = tc[0]; cc.d = tc[1];
    }
  }
  document.documentElement.lang = 'en';
};

/* ================= TEXTO DE INTERFACE (ORIGINAL) ================= */
EL.UI_PT = {
  subtitulo: 'Simulador de colonização planetária',
  introA: 'A <strong>NAV Perseverança</strong> caiu no planeta EL-7742. Vinte sobreviventes. Quarenta sols de comida. Trinta e um de água. Nenhum resgate — nunca.',
  introB: 'Você comanda. Cada sol é um turno. Cada decisão altera o futuro.',
  semente: 'Semente do mundo',
  iniciar: 'INICIAR COLÔNIA', continuar: 'CONTINUAR',
  rodape: 'Salvamento automático no navegador. Nenhum dado sai do seu computador.',
  salvar: 'Salvar', menu: 'Menu',
  avancar1: 'AVANÇAR 1 SOL ▸', avancar5: '▸▸ 5 SOLS',
  abas: { visao:'Visão Geral', trabalho:'Trabalho', tripulacao:'Tripulação', construcao:'Construção',
          pesquisa:'Pesquisa', agricultura:'Agricultura', oficina:'Oficina', mapa:'Mapa',
          catalogo:'Catálogo', registro:'Registro' },
  estoqueVital:'ESTOQUE VITAL', energia:'ENERGIA', materiais:'MATERIAIS', maquinas:'MÁQUINAS',
  agua:'Água', comida:'Comida', abrigo:'Abrigo', defesa:'Defesa',
  sols:'sols', racoes:'rações', bateria:'Bateria', geracao:'Geração', demanda:'Demanda', balanco:'Balanço',
  dif: {
    facil:'Margens folgadas de água, comida e energia. Para a primeira colônia — você ainda vai perder gente, mas dá tempo de aprender.',
    normal:'Equilibrado e implacável. Um erro custa caro, mas a colônia consegue se recuperar dele.',
    extremo:'Nada é facilitado. Um erro de alocação no sol 5 costuma matar a colônia no sol 45, sem aviso.',
    brutal:'Produção reduzida, eventos mais frequentes, riscos maiores. Para quem já venceu no Extremo.'
  }
};

/* ================= TEXTO DE INTERFACE (INGLÊS) ================= */
EL.UI_EN = {
  subtitulo: 'A planetary colonisation simulator',
  introA: 'The <strong>NAV Perseverança</strong> crashed on planet EL-7742. Twenty survivors. Forty sols of food. Thirty-one of water. No rescue — ever.',
  introB: 'You are in command. Each sol is a turn. Every decision changes the future.',
  semente: 'World seed',
  iniciar: 'FOUND THE COLONY', continuar: 'CONTINUE',
  rodape: 'Saved automatically in your browser. No data ever leaves your computer.',
  salvar: 'Save', menu: 'Menu',
  avancar1: 'ADVANCE 1 SOL ▸', avancar5: '▸▸ 5 SOLS',
  abas: { visao:'Overview', trabalho:'Labour', tripulacao:'Crew', construcao:'Building',
          pesquisa:'Research', agricultura:'Farming', oficina:'Workshop', mapa:'Map',
          catalogo:'Catalogue', registro:'Log' },
  estoqueVital:'VITAL STOCK', energia:'POWER', materiais:'MATERIALS', maquinas:'MACHINES',
  agua:'Water', comida:'Food', abrigo:'Shelter', defesa:'Defence',
  sols:'sols', racoes:'rations', bateria:'Battery', geracao:'Output', demanda:'Demand', balanco:'Balance',
  dif: {
    facil:'Generous margins on water, food and power. For your first colony — you will still lose people, but you get time to learn.',
    normal:'Balanced and unforgiving. A mistake costs dearly, but the colony can still recover from it.',
    extremo:'Nothing is softened. A bad assignment on sol 5 usually kills the colony on sol 45, with no warning.',
    brutal:'Lower output, more frequent events, higher risk. For those who have already won on Extreme.'
  }
};
