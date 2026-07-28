/* PROJECT ELYSIUM — motor de simulação.
   Resolve um sol inteiro: trabalho, produção, energia, água, alimento,
   agricultura, saúde, moral, relações, aprendizado, manutenção e eventos. */
var EL = window.EL || {}; window.EL = EL;

EL.Sim = (function () {

  /* ============ UTIL ============ */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function vivos(st) { return st.crew.filter(function (c) { return c.vivo; }); }
  function tem(st, t) { return st.tech.feitas.indexOf(t) >= 0; }
  function dificuldade(st) { return EL.DIFICULDADE[st.dif] || EL.DIFICULDADE.extremo; }

  /* Efeito agregado das tecnologias já concluídas */
  function efTech(st, chave, modo) {
    var v = (modo === 'mult') ? 1 : 0;
    for (var i = 0; i < st.tech.feitas.length; i++) {
      var t = EL.techPorId(st.tech.feitas[i]);
      if (t && t.ef && t.ef[chave] !== undefined) {
        if (modo === 'mult') v *= t.ef[chave];
        else if (modo === 'max') v = Math.max(v, t.ef[chave]);
        else v += t.ef[chave];
      }
    }
    return v;
  }

  /* Efeito agregado das edificações prontas */
  function efPredios(st, chave, modo) {
    var v = (modo === 'mult' || modo === 'max') ? (modo === 'mult' ? 1 : 0) : 0;
    for (var i = 0; i < st.predios.length; i++) {
      var p = st.predios[i]; if (!p.pronto) continue;
      var b = EL.buildPorId(p.id); if (!b || !b.ef) continue;
      var val = b.ef[chave]; if (val === undefined) continue;
      var esc = clamp(p.hp / 100, 0.25, 1); // prédio degradado rende menos
      if (modo === 'mult') v *= val;
      else if (modo === 'max') v = Math.max(v, val);
      else v += val * (typeof val === 'number' ? esc : 1);
    }
    return v;
  }

  /* ============ PONTOS DE TRABALHO ============ */
  function ptDe(st, c) {
    if (!c.vivo || c.emExpedicao) return 0;
    var pt = 1.0;
    if (c.ferimento) pt *= clamp(1 - c.ferimento.sev / 105, 0.04, 1);
    if (c.doente && c.doente > st.sol) pt *= 0.35;
    pt *= 0.35 + 0.65 * (c.saude / 100);
    pt *= 1 - 0.45 * (c.fadiga / 100);
    pt *= 0.75 + 0.25 * (c.moral / 100);
    pt *= tem(st, 'terraformacao') ? 1.0 : EL.PLANET.co2Penalidade;
    if (c.tracos.indexOf('imprudente') >= 0) pt *= 1.15;
    if (c.tracos.indexOf('meticuloso') >= 0) pt *= 0.90;
    if (c.tracos.indexOf('ansioso') >= 0 && st.crise) pt *= 0.75;
    if (c.tracos.indexOf('obsessivo') >= 0 && c.trabalho === 'pesquisar') pt *= 1.25;
    if (c.amputado) pt *= 0.72;
    if (c.idade > 50) pt *= 0.92;
    if (st.bonus.trabalho) pt *= st.bonus.trabalho;
    if (st.bonus.ferramentaDano) pt *= (1 - st.bonus.ferramentaDano);
    return Math.max(0, pt * 1.35);
  }

  function perFator(c, per) {
    if (!per) return 1;
    if (per === '*ciencia') {
      var m = 0;
      for (var i = 0; i < EL.PER_CIENCIA.length; i++) m = Math.max(m, c.per[EL.PER_CIENCIA[i]] || 0);
      var fm = 0.55 + 0.10 * m;
      if (EL._bonusPerAlta && m >= 7) fm *= EL._bonusPerAlta;
      return fm;
    }
    var f = 0.55 + 0.10 * (c.per[per] || 0);
    if (EL._bonusPerAlta && (c.per[per] || 0) >= 7) f *= EL._bonusPerAlta;
    return f;
  }

  /* ============ POSTOS DISPONÍVEIS ============ */
  function setoresOperaveis(st) {
    var out = [];
    for (var sid in st.setores) {
      var s = st.setores[sid];
      var d = EL.dist(EL.BASE_SETOR, sid);
      if (s.outpost || (d <= 1 && s.explorado >= 30)) out.push(sid);
      else if (s.rota && s.explorado >= 30 && d <= 2) out.push(sid);
    }
    return out;
  }

  function setoresConstruiveis(st) {
    var out = [EL.BASE_SETOR];
    for (var sid in st.setores) {
      if (sid === EL.BASE_SETOR) continue;
      var s = st.setores[sid], d = EL.dist(EL.BASE_SETOR, sid);
      if (s.explorado >= 50 && d <= 4) out.push(sid);
    }
    return out;
  }

  function jobsDisponiveis(st) {
    var lista = [];
    for (var i = 0; i < EL.JOBS.length; i++) lista.push({ id: EL.JOBS[i].id, n: EL.JOBS[i].n, cat: EL.JOBS[i].cat, d: EL.JOBS[i].d, fixo: true });
    var sets = setoresOperaveis(st);
    for (var s = 0; s < sets.length; s++) {
      var sid = sets[s];
      var recs = EL.recursosDoSetor(sid);
      for (var r = 0; r < recs.length; r++) {
        var rec = recs[r];
        if (rec.tec && !tem(st, rec.tec)) continue;
        if (rec.id === 'aquifero' || rec.id === 'vapor_geo') continue; // exigem edificação
        lista.push({
          id: 'ext:' + rec.id + ':' + sid, n: rec.n + ' — ' + sid, cat: 'Extração',
          d: rec.uso + ' · dificuldade ' + rec.dif + '/10 · ' + EL.RAR_NOME[rec.rar],
          rec: rec, setor: sid, fixo: false
        });
      }
    }
    return lista;
  }

  function fatorDistancia(st, sid) {
    if (sid === EL.BASE_SETOR) return 1;
    var s = st.setores[sid], d = EL.dist(EL.BASE_SETOR, sid);
    var f = 1 / (1 + 0.22 * d);
    if (s.outpost) f = Math.min(1, f * 2.2);
    if (s.rota) f *= 1.5;
    if (st.bonus.logistica) f *= st.bonus.logistica;
    return Math.min(1.15, f);
  }

  /* ============ RESUMO DERIVADO (usado pela UI e pelo turno) ============ */
  function resumo(st) {
    var vs = vivos(st), pop = vs.length;
    /* uma criança de Elysium ocupa uma cama e come, mas não come como um adulto de 1,06 g */
    var popEq = 0; for (var _i = 0; _i < vs.length; _i++) popEq += vs[_i].nativo ? 0.45 : 1;
    var Dc = dificuldade(st).consumo;
    var R = {};
    R.pop = pop; R.popEq = popEq;
    R.abrigo = Math.floor(12 + efPredios(st, 'abrigo', 'sum'));            // 12 = casco da nave
    R.abrigoDeficit = Math.max(0, pop - R.abrigo);
    R.conforto = efPredios(st, 'conforto', 'sum');
    R.defesa = Math.round(efPredios(st, 'defesa', 'sum') * (st.bonus.defesa || 1));
    R.labSlots = Math.floor(efPredios(st, 'labSlots', 'sum'));
    R.ppMult = Math.max(1, efPredios(st, 'ppMult', 'max')) * efTech(st, 'pesquisaMult', 'mult') * (st.bonus.pesquisa || 1);
    R.oficina = Math.floor(efPredios(st, 'oficina', 'sum'));
    R.fabMult = Math.max(1, efPredios(st, 'fabMult', 'max')) * efTech(st, 'fabricacaoMult', 'mult') * (st.bonus.fabricacao || 1);
    R.leitos = Math.floor(efPredios(st, 'leitos', 'sum'));
    R.curaMult = Math.max(1, efPredios(st, 'curaMult', 'max')) * efTech(st, 'curaMult', 'max' ) || 1;
    if (!R.curaMult || R.curaMult < 1) R.curaMult = 1;
    R.lotes = Math.floor(efPredios(st, 'lotes', 'sum'));
    R.moralPredios = efPredios(st, 'moral', 'sum');
    R.higiene = efPredios(st, 'higiene', 'sum');
    R.frioProt = clamp(efPredios(st, 'frioProt', 'max') + (tem(st, 'concreto_tec') ? 0.1 : 0), 0, 0.85);
    R.estoqueAgua = Math.round(1400 + pop * 90 + efPredios(st, 'estoqueAgua', 'sum'));
    R.estoqueComida = Math.round(700 + pop * 70 + efPredios(st, 'estoqueComida', 'sum'));
    R.estoqueMat = Math.round(8000 + efPredios(st, 'estoqueMat', 'sum'));
    R.roboSlots = Math.floor(efPredios(st, 'roboSlots', 'sum'));
    R.bateriaExtra = efPredios(st, 'bateria', 'sum');
    st.energia.capacidade = Math.max(st.energia.capacidadeBase || st.energia.capacidade, (st.energia.capacidadeBase || 186) + R.bateriaExtra);
    R.ensino = efPredios(st, 'ensino', 'sum') * (st.bonus.ensino || 1);
    R.espaco = efPredios(st, 'espaco', 'sum') > 0;

    /* --- energia --- */
    var solarF = st.clima.solarF * (1 - st.energia.sujeira);
    var gen = 8.63 * solarF;                                     // reator solar Helios-3
    var genMult = Math.max(1, efPredios(st, 'genMult', 'max'));
    for (var i = 0; i < st.predios.length; i++) {
      var p = st.predios[i]; if (!p.pronto) continue;
      var b = EL.buildPorId(p.id); if (!b || !b.ef || !b.ef.gen) continue;
      var esc = clamp(p.hp / 100, 0.2, 1), g = b.ef.gen * esc;
      switch (b.ef.tipo) {
        case 'solar': g *= solarF * (tem(st, 'fotovoltaico') ? 1.26 : 1); break;
        case 'vento': g *= clamp(st.clima.ventoF, 0.15, 1.9); break;
        case 'hidro': g *= (st.clima.estacao === 'escaldo' ? 0.4 : (st.clima.estacao === 'gelido' ? 0.7 : 1.05)); break;
        case 'bio': g *= (st.mat.biomassa > 40 ? 1 : 0); break;
        default: break;
      }
      gen += g * genMult;
    }
    gen = Math.max(0, gen - st.energia.penalidade);
    R.gen = gen;

    var dem = 0.205 * pop + 0.7;
    dem += Math.max(0, 12 - st.clima.tempMin) * 0.20 * (1 - R.frioProt);
    for (var j = 0; j < st.predios.length; j++) {
      var q = st.predios[j]; if (!q.pronto) continue;
      var bb = EL.buildPorId(q.id);
      if (bb && bb.up && bb.up.energia) dem += bb.up.energia;
    }
    if (st.robos.atlas.ativo && st.robos.atlas.tarefa !== 'ocioso') dem += 2.0;
    if (st.robos.kite.ativo && st.robos.kite.alvo) dem += 0.4;
    R.dem = dem;
    R.balanco = gen - dem;

    /* --- água --- */
    var rec = clamp(st.agua.recicladorBase + efTech(st, 'reciclador', 'sum') + efPredios(st, 'reciclador', 'sum') - st.agua.recicladorDano, 0.15, 0.94);
    R.reciclador = rec;
    R.aguaBruta = popEq * 7.4 * st.politica.racaoAgua * Dc;
    R.aguaLiquida = R.aguaBruta * (1 - rec);
    var upAgua = 0;
    for (var u = 0; u < st.predios.length; u++) {
      var pp2 = st.predios[u]; if (!pp2.pronto) continue;
      var b2 = EL.buildPorId(pp2.id);
      if (b2 && b2.up && b2.up.agua) upAgua += b2.up.agua;
    }
    R.aguaUso = upAgua;
    R.aguaPassiva = (efPredios(st, 'aguaProd', 'sum') + st.agua.fontes) * (st.bonus.agua || 1);
    R.aguaNet = R.aguaPassiva - R.aguaLiquida - upAgua;

    /* --- alimento --- */
    R.comidaMult = Math.max(1, efPredios(st, 'comidaMult', 'max'));
    R.comidaDia = popEq * st.politica.racaoComida * Dc / R.comidaMult;
    R.diasComida = R.comidaDia > 0 ? st.mat.comida / R.comidaDia : 999;
    R.diasAgua = (R.aguaLiquida + upAgua - R.aguaPassiva) > 0
      ? st.mat.agua / (R.aguaLiquida + upAgua - R.aguaPassiva) : 999;

    /* --- trabalho --- */
    R.ptTotal = 0; R.ptPorJob = {};
    for (var c = 0; c < vs.length; c++) {
      var cr = vs[c];
      var pt = ptDe(st, cr);
      R.ptTotal += pt;
      var jb = cr.forcado && cr.forcadoAte > st.sol ? cr.forcado : cr.trabalho;
      R.ptPorJob[jb] = (R.ptPorJob[jb] || 0) + pt;
    }
    R.moralMedia = 0; R.saudeMedia = 0; R.fadigaMedia = 0;
    for (var v2 = 0; v2 < vs.length; v2++) { R.moralMedia += vs[v2].moral; R.saudeMedia += vs[v2].saude; R.fadigaMedia += vs[v2].fadiga; }
    if (pop) { R.moralMedia /= pop; R.saudeMedia /= pop; R.fadigaMedia /= pop; }
    return R;
  }

  /* O luto tem de doer muito e depois cicatrizar. Uma penalidade permanente por morto
     transformava qualquer baixa numa sentença: menos moral, menos trabalho, mais baixas. */
  function lutoRecente(st) {
    var soma = 0;
    for (var i = 4; i < st.mortos.length; i++) {          // os 4 primeiros morreram na queda
      var idade = st.sol - st.mortos[i].sol;
      if (idade < 0 || idade > 100) continue;
      soma += 6 * (1 - idade / 100);
    }
    if (st.bonus.lutoDobrado) soma *= 1.6;
    if (st.bonus.lutoMetade) soma *= 0.6;
    return Math.min(soma, 20);
  }

  /* ============ API DE EVENTOS ============ */
  function criarApi(st, rng, R) {
    var api = {
      st: st, rng: rng, R: R,
      log: function (t, tipo) { EL.logar(st, t, tipo || 'evt'); },
      mat: function (id, q) { st.mat[id] = Math.max(0, (st.mat[id] || 0) + q); },
      moralAll: function (d) { vivos(st).forEach(function (c) { c.moral = clamp(c.moral + d, 0, 100); }); },
      moralOne: function (id, d) { var c = st.crew.filter(function (x) { return x.id === id; })[0]; if (c) c.moral = clamp(c.moral + d, 0, 100); },
      rel: function (a, b, d) { EL.setRel(st, a, b, EL.getRel(st, a, b) + d); },
      ferir: function (id, nome, sev, dias) {
        var c = st.crew.filter(function (x) { return x.id === id; })[0]; if (!c || !c.vivo) return;
        nome = EL.trFerimento(nome);
        if (c.ferimento) { c.ferimento.sev = Math.min(100, c.ferimento.sev + sev * 0.6); c.ferimento.dias += Math.round(dias * 0.5); }
        else c.ferimento = { n: nome, sev: sev, dias: dias };
        c.saude = clamp(c.saude - sev * 0.35, 1, 100);
        EL.logar(st, c.nome + ': ' + nome + ' (gravidade ' + Math.round(sev) + ').', 'bad');
      },
      matar: function (id, causa) {
        var c = st.crew.filter(function (x) { return x.id === id; })[0]; if (!c || !c.vivo) return;
        // Colônia Livre: ninguém morre, nem por evento. Fica gravemente ferido e se recupera.
        if (st.sandbox) {
          c.saude = Math.max(12, c.saude * 0.5);
          c.ferimento = { n: EL.trFerimento('Trauma grave'), sev: 55, dias: 12 };
          EL.logar(st, c.nome + ' escapou por pouco. (Modo Colônia Livre: ninguém morre)', 'warn');
          return;
        }
        causa = EL.trCausa(causa);
        c.vivo = false; st.mortos.push({ nome: c.nome, func: c.func, causa: causa, sol: st.sol });
        st.stats.mortosTotal++;
        EL.logar(st, '☠ ' + c.nome + ' — ' + causa + '. Sol ' + st.sol + '.', 'bad');
      },
      nascer: function () {
        st.stats.nascidos++;
        var nomes = ['Elysia', 'Kore', 'Vesper', 'Aurora', 'Novo', 'Terra', 'Íris', 'Solis', 'Aurea', 'Miríade'];
        var n = nomes[st.stats.nascidos % nomes.length] + ' ' + (st.stats.nascidos);
        st.crew.push({
          id: 'nat' + st.stats.nascidos, nome: n, idade: 0, sexo: rng.chance(0.5) ? 'F' : 'M',
          func: 'Criança de Elysium', per: {}, tracos: ['aprendiz'], fraqueza: 'Nasceu a 1,06 g e 1,2% de CO₂.',
          bio: 'A primeira geração. Nunca viu a Terra e nunca vai ver.',
          humor: 70, fadiga: 0, fome: 30, saude: 90, moral: 80, vivo: true, ferimento: null, doente: 0,
          trabalho: 'descanso', setorTrab: EL.BASE_SETOR, recurso: null, xp: {}, forcado: null, forcadoAte: 0,
          amputado: false, nativo: true
        });
        EL.logar(st, '★ Nasceu ' + n + '. População: ' + (vivos(st).length) + '.', 'good');
      },
      perdaTrabalho: function (frac) { st.perdaTrabalhoHoje = Math.max(st.perdaTrabalhoHoje || 0, frac); },
      perderRecurso: function (frac) {
        for (var k in st.mat) if (k !== 'agua' && st.mat[k] > 0) st.mat[k] *= (1 - frac);
      },
      destruir: function (bid, n) {
        var rem = n;
        for (var i = st.predios.length - 1; i >= 0 && rem > 0; i--)
          if (st.predios[i].id === bid) { st.predios.splice(i, 1); rem--; }
      },
      danificar: function (bid, d) {
        for (var i = 0; i < st.predios.length; i++) if (st.predios[i].id === bid) { st.predios[i].hp -= d; break; }
      }
    };
    return api;
  }

  /* ============ AÇÕES DO JOGADOR ============ */
  function podeConstruir(st, bid, setor) {
    var b = EL.buildPorId(bid); if (!b) return 'inexistente';
    if (b.tec && !tem(st, b.tec)) return 'Falta tecnologia: ' + EL.techPorId(b.tec).n;
    var n = st.predios.filter(function (p) { return p.id === bid; }).length;
    if (b.max && n >= b.max) return 'Limite atingido (' + b.max + ')';
    if (b.biomas) { var bi = EL.bioma(setor || EL.BASE_SETOR); if (b.biomas.indexOf(bi) < 0) return 'Bioma incompatível'; }
    for (var m in b.mat) { if (b.mat[m] > 0 && (st.mat[m] || 0) < b.mat[m]) return 'Falta ' + EL.MAT[m].n + ' (' + Math.floor(st.mat[m] || 0) + '/' + b.mat[m] + ')'; }
    return null;
  }
  function iniciarObra(st, bid, setor) {
    var err = podeConstruir(st, bid, setor); if (err) return err;
    var b = EL.buildPorId(bid);
    var desc = (st.bonus.canteiroBarato && bid === 'canteiro') ? 0.5 : 1;
    for (var m in b.mat) if (b.mat[m] > 0) st.mat[m] -= b.mat[m] * desc;
    st.predios.push({ uid: st.uidPredio++, id: bid, setor: setor || EL.BASE_SETOR, pronto: false, ptFeito: 0, hp: 100 });
    EL.logar(st, 'Obra iniciada: ' + b.n + (setor && setor !== EL.BASE_SETOR ? ' em ' + setor : '') + ' (' + b.pt + ' PT).', 'info');
    return null;
  }
  function cancelarObra(st, uid) {
    for (var i = 0; i < st.predios.length; i++) if (st.predios[i].uid === uid && !st.predios[i].pronto) {
      var b = EL.buildPorId(st.predios[i].id);
      for (var m in b.mat) if (b.mat[m] > 0) st.mat[m] += b.mat[m] * 0.6;
      st.predios.splice(i, 1);
      EL.logar(st, 'Obra cancelada. 60% do material recuperado.', 'warn');
      return;
    }
  }
  function podePesquisar(st, tid) {
    var t = EL.techPorId(tid); if (!t) return 'inexistente';
    if (tem(st, tid)) return 'já concluída';
    for (var i = 0; i < t.req.length; i++) if (!tem(st, t.req[i])) return 'Falta: ' + EL.techPorId(t.req[i]).n;
    if (t.mat) for (var m in t.mat) if ((st.mat[m] || 0) < t.mat[m]) return 'Falta ' + EL.MAT[m].n;
    return null;
  }
  function iniciarPesquisa(st, tid) {
    var err = podePesquisar(st, tid); if (err) return err;
    if (st.tech.ativa.filter(function (a) { return a.id === tid; }).length) return 'já em andamento';
    var t = EL.techPorId(tid);
    if (t.mat) for (var m in t.mat) st.mat[m] -= t.mat[m];
    st.tech.ativa.push({ id: tid, pp: 0 });
    EL.logar(st, 'Pesquisa iniciada: ' + t.n + ' (' + t.pp + ' PP).', 'info');
    return null;
  }
  function addProducao(st, rid, qtd) {
    var r = EL.receitaPorId(rid); if (!r) return 'inexistente';
    if (r.tec && !tem(st, r.tec)) return 'Falta tecnologia';
    st.filaProducao.push({ rec: rid, qtd: qtd || 1, feitos: 0, ptFeito: 0 });
    return null;
  }
  function plantar(st, idx, cropId) {
    var l = st.agricultura.lotes[idx]; if (!l) return 'lote inexistente';
    if (l.crop) return 'lote ocupado';
    var c = EL.cropPorId(cropId); if (!c) return 'cultivar inexistente';
    if (c.estufa && !l.protegido) return 'exige estufa';
    if ((st.mat.semente || 0) < c.sem) return 'Sem sementes suficientes';
    st.mat.semente -= c.sem;
    l.crop = cropId; l.prog = 0; l.saude = 100;
    return null;
  }

  /* ============ TURNO ============ */
  function avancar(st) {
    if (st.fimDeJogo) return;
    if (st.pendente) return 'Resolva o evento pendente antes de avançar.';

    var rng = EL.RNG.make(st.rngState);
    var D = dificuldade(st);
    st.sol++;
    st.perdaTrabalhoHoje = 0; st.faltouAgua = false;
    st.clima = EL.Clima.gerar(st, rng);
    st.ano = Math.floor((st.sol - 1) / EL.PLANET.anoSols) + 1;
    EL.logar(st, '— SOL ' + st.sol + ' · ' + st.clima.estacaoNome + ' ' + st.clima.solAno + ' · ' + st.clima.cond +
      ' · ' + st.clima.temp + '°C (mín ' + st.clima.tempMin + '°C)', 'sol');

    EL._bonusPerAlta = st.bonus.periciaAlta || 0;
    EL._bonusAprend = st.bonus.aprendizado || 1;
    var R = resumo(st);
    st.crise = (R.diasComida < 10 || R.diasAgua < 6);

    /* ---------- 1. TRABALHO ---------- */
    var perda = 1 - (st.perdaTrabalhoHoje || 0);
    var vs = vivos(st);
    var acc = { construir: 0, fabricar: 0, pesquisar: 0, medico: 0, agricultura: 0, guarda: 0,
                manutencao: 0, apoio: 0, ensino: 0, cozinha: 0, reciclar: 0, explorar: 0, robotica: 0, descanso: 0 };
    var extrai = {};      // 'recId:setor' -> pt efetivo
    var exploraSet = {};  // setor -> pt

    for (var i = 0; i < vs.length; i++) {
      var c = vs[i];
      if (c.emExpedicao) { c.trabalhoEfetivo = 'expedicao'; c.ptHoje = 0; continue; }
      if (c.forcado && c.forcadoAte > st.sol) c.trabalhoEfetivo = c.forcado;
      else { c.forcado = null; c.trabalhoEfetivo = c.trabalho; }
      var job = c.trabalhoEfetivo;
      var pt = ptDe(st, c) * perda;
      c.ptHoje = pt;
      if (job.indexOf('ext:') === 0) {
        var parts = job.split(':'), rec = EL.recursoPorId(parts[1]), sid = parts[2];
        if (!rec) { c.trabalhoEfetivo = 'descanso'; acc.descanso += pt; continue; }
        var per = rec.cat === 'Água' ? 'hidrologia' : (rec.cat === 'Flora' || rec.cat === 'Fauna' ? 'biologia' : 'geologia');
        var k = parts[1] + ':' + sid;
        extrai[k] = (extrai[k] || 0) + pt * perFator(c, per) * fatorDistancia(st, sid);
        ganharXP(c, per, 1);
      } else if (job === 'explorar') {
        var alvo = c.setorTrab || EL.BASE_SETOR;
        exploraSet[alvo] = (exploraSet[alvo] || 0) + pt * perFator(c, 'sobrevivencia');
        acc.explorar += pt; ganharXP(c, 'sobrevivencia', 1);
      } else {
        var jd = EL.jobPorId(job);
        if (!jd) { acc.descanso += pt; continue; }
        acc[jd.tipo] = (acc[jd.tipo] || 0) + pt * perFator(c, jd.per);
        if (jd.per && jd.per !== '*ciencia') ganharXP(c, jd.per, 1);
        else if (jd.per === '*ciencia') ganharXP(c, melhorCiencia(c), 1.2);
      }
    }

    st.trabalhoGuarda = acc.guarda; st.trabalhoConstrucao = acc.construir;
    st.trabalhoExploracao = acc.explorar; st.trabalhoExtracao = Object.keys(extrai).length;

    /* ---------- 2. ROBÔS ---------- */
    var atlas = st.robos.atlas;
    if (atlas.ativo && atlas.integridade > 20) {
      var apt = 6 * (atlas.integridade / 100) * (atlas.overclock ? 1.3 : 1) * (st.bonus.robo || 1);
      if (atlas.tarefa === 'construir') acc.construir += apt;
      else if (atlas.tarefa === 'extrair' && atlas.recurso) {
        var kk = atlas.recurso + ':' + atlas.setor;
        extrai[kk] = (extrai[kk] || 0) + apt * 0.9 * fatorDistancia(st, atlas.setor);
      } else if (atlas.tarefa === 'escavar') { st.mat.pedra += 55 * apt / 6 * 6; st.mat.argila += 22 * apt / 6 * 3; }
      atlas.integridade -= (atlas.overclock ? 1.5 : 0.6) * D.risco * (st.bonus.roboDesgaste || 1);
      if (atlas.overclock && rng.chance(0.02)) { atlas.integridade -= 25; EL.logar(st, 'ATLAS-1 sofreu uma falha grave pelo overclock.', 'bad'); }
      if (atlas.integridade <= 20) { atlas.ativo = false; EL.logar(st, 'ATLAS-1 parou. Integridade crítica.', 'bad'); }
    }
    var kite = st.robos.kite;
    kite.voando = false;
    if (kite.ativo && kite.alvo && kite.integridade > 15) {
      var alvoS = st.setores[kite.alvo];
      if (alvoS && EL.dist(EL.BASE_SETOR, kite.alvo) <= 4) {
        kite.voando = true;
        var mult = tem(st, 'cartografia') ? 3 : 1;
        var ganho = 11 * mult * (kite.integridade / 100);
        alvoS.explorado = Math.min(100, alvoS.explorado + ganho);
        kite.integridade -= 0.5 * D.risco;
        if (alvoS.explorado >= 100) { EL.logar(st, 'KITE concluiu o levantamento aéreo de ' + kite.alvo + '.', 'good'); kite.alvo = null; }
      }
    }
    if (acc.robotica > 0) {
      var rep = acc.robotica * 5;
      atlas.integridade = Math.min(100, atlas.integridade + rep * 0.7);
      kite.integridade = Math.min(100, kite.integridade + rep * 0.5);
      if (!atlas.ativo && atlas.integridade > 35) { atlas.ativo = true; EL.logar(st, 'ATLAS-1 recolocado em operação.', 'good'); }
      if (!kite.ativo && kite.integridade > 30) { kite.ativo = true; EL.logar(st, 'KITE recolocado em operação.', 'good'); }
      if (!st.impressora.ok && acc.robotica > 0.8) { st.impressora.ok = true; EL.logar(st, 'Vulcan-M reparada.', 'good'); }
    }

    /* ---------- 3. EXTRAÇÃO ---------- */
    var toolMult = (tem(st, 'siderurgia') ? 1.25 : (tem(st, 'forja_primitiva') ? 1.1 : 1)) * D.producao;
    st.aguaContaminada = false;
    for (var key in extrai) {
      var kp = key.split(':'), rc = EL.recursoPorId(kp[0]), st2 = kp[1];
      if (!rc || !rc.mat) continue;
      var dificFat = 1 / (1 + 0.16 * (rc.dif - 1));
      var q = rc.y * extrai[key] * dificFat * toolMult;
      if (rc.cat === 'Água') {
        if (st.clima.estacao === 'escaldo' && rc.id === 'rio_ferrun') q *= 0.45;
        if (!tem(st, 'purificacao_agua') && efPredios(st, 'aguaSegura', 'max') === 0 && rc.id === 'rio_ferrun') {
          st.aguaContaminada = true;
        }
      }
      st.mat[rc.mat] = (st.mat[rc.mat] || 0) + q;
      if (rng.chance(0.02 * rc.dif * D.risco * 0.1)) {
        var vv = vivos(st); if (vv.length) {
          var alvoC = rng.pick(vv);
          criarApi(st, rng, R).ferir(alvoC.id, 'Acidente de extração', rng.int(10, 35), rng.int(3, 9));
        }
      }
    }

    /* ---------- 4. EXPLORAÇÃO ---------- */
    for (var es in exploraSet) {
      var s3 = st.setores[es]; if (!s3) continue;
      var d3 = EL.dist(EL.BASE_SETOR, es);
      var g3 = exploraSet[es] * 14 / (1 + 0.5 * d3);
      s3.explorado = Math.min(100, s3.explorado + g3);
      if (s3.explorado >= 100 && !s3.completo) { s3.completo = true; EL.logar(st, 'Setor ' + es + ' totalmente levantado a pé.', 'good'); }
    }

    /* ---------- 5. DESMONTE DO CASCO ---------- */
    if (acc.reciclar > 0) {
      var qtdL = Math.min(st.casco.restante, acc.reciclar * 32 * D.producao);
      var qtdS = Math.min(st.casco.sucataRestante, acc.reciclar * 45 * D.producao);
      st.casco.restante -= qtdL; st.casco.sucataRestante -= qtdS;
      st.mat.liga_casco += qtdL; st.mat.sucata += qtdS;
      if (st.casco.restante <= 0 && st.casco.sucataRestante <= 0 && !st.flags.cascoFim) {
        st.flags.cascoFim = true;
        EL.logar(st, 'A NAV Perseverança acabou. Não existe mais nave — só uma cidade começando.', 'warn');
        st.abrigoCascoPerdido = true;
      }
    }

    /* ---------- 6. CONSTRUÇÃO ---------- */
    var ptObra = acc.construir * (st.bonus.construcao || 1) * D.producao;
    for (var b1 = 0; b1 < st.predios.length && ptObra > 0; b1++) {
      var pr = st.predios[b1]; if (pr.pronto) continue;
      var bd = EL.buildPorId(pr.id);
      var falta = bd.pt - pr.ptFeito;
      var usa = Math.min(falta, ptObra);
      pr.ptFeito += usa; ptObra -= usa;
      if (pr.ptFeito >= bd.pt) {
        pr.pronto = true; st.stats.predios++;
        EL.logar(st, (pr.ruina ? '✔ Reerguido: ' : '✔ Construído: ') + bd.n +
          (pr.setor !== EL.BASE_SETOR ? ' (' + pr.setor + ')' : ''), 'good');
        pr.ruina = false;
        if (bd.ef.outpost) st.setores[pr.setor].outpost = true;
        if (bd.ef.rota) st.setores[pr.setor].rota = true;
        if (bd.ef.lotes) for (var lz = 0; lz < bd.ef.lotes; lz++)
          st.agricultura.lotes.push({ crop: null, prog: 0, saude: 100, protegido: !!bd.ef.protegido, mult: bd.ef.loteMult || 1 });
      }
    }

    /* ---------- 7. OFICINA ---------- */
    var ptFab = acc.fabricar * R.fabMult * D.producao;
    if (R.oficina <= 0) ptFab = 0;
    var idxF = 0;
    while (ptFab > 0.001 && idxF < st.filaProducao.length) {
      var f = st.filaProducao[idxF], rr = EL.receitaPorId(f.rec);
      if (!rr) { st.filaProducao.splice(idxF, 1); continue; }
      var falt = rr.pt - f.ptFeito, usaF = Math.min(falt, ptFab);
      f.ptFeito += usaF; ptFab -= usaF;
      if (f.ptFeito >= rr.pt) {
        var ok = true;
        for (var mi in rr.ent) if ((st.mat[mi] || 0) < rr.ent[mi]) ok = false;
        if (rr.energia && st.energia.armazenada < rr.energia) ok = false;
        if (ok) {
          for (var mo in rr.ent) st.mat[mo] -= rr.ent[mo];
          for (var so in rr.sai) if (rr.sai[so] > 0) st.mat[so] = (st.mat[so] || 0) + rr.sai[so];
          if (rr.energia) st.energia.armazenada -= rr.energia;
          f.feitos++; f.ptFeito = 0;
          if (f.feitos >= f.qtd) { st.filaProducao.splice(idxF, 1); continue; }
        } else { EL.logar(st, 'Produção parada: falta insumo para ' + rr.n + '.', 'warn'); f.ptFeito = rr.pt; idxF++; }
      }
    }

    /* ---------- 8. PESQUISA ---------- */
    var slots = R.labSlots;
    var ppGer = acc.pesquisar * 4 * R.ppMult * D.pp;
    // sem bancada ainda se estuda — mal, com o caderno no colo. Zerar a pesquisa
    // transformava a perda do laboratório numa sentença silenciosa e definitiva.
    if (slots <= 0) ppGer *= 0.25;
    else {
      var pesquisadores = vs.filter(function (x) { return x.trabalhoEfetivo === 'pesquisar'; }).length;
      if (pesquisadores > slots) ppGer *= slots / pesquisadores;
    }
    st.ppHoje = ppGer;
    if (st.tech.ativa.length && ppGer > 0) {
      // o banco de PP vinha de descobertas e expedições e nunca era gasto em nada:
      // agora ele acelera o que está na bancada até se esgotar
      var doBanco = Math.min(st.tech.pp, ppGer * 0.6 + 1);
      st.tech.pp -= doBanco;
      var cada = (ppGer + doBanco) / st.tech.ativa.length;
      for (var a1 = st.tech.ativa.length - 1; a1 >= 0; a1--) {
        var at = st.tech.ativa[a1], tt = EL.techPorId(at.id);
        at.pp += cada;
        if (at.pp >= tt.pp) {
          st.tech.feitas.push(at.id); st.tech.ativa.splice(a1, 1); st.stats.techs++;
          EL.logar(st, '⚛ TECNOLOGIA CONCLUÍDA: ' + tt.n, 'good');
          if (tt.ef && tt.ef.rps) st.robos.kite.rps = true;
          criarApi(st, rng, R).moralAll(+3);
        }
      }
    } else st.tech.pp += ppGer;

    /* ---------- 9. AGRICULTURA ---------- */
    var cuidado = acc.agricultura;
    var lotesAtivos = st.agricultura.lotes.filter(function (l) { return l.crop; }).length;
    var cuidadoPorLote = lotesAtivos ? clamp(cuidado / (lotesAtivos * 0.06), 0, 1.4) : 1;
    st.colheitaRecente = false;
    var solo = st.agricultura.solo;
    var aguaIrrig = 0;
    for (var li = 0; li < st.agricultura.lotes.length; li++) {
      var lo = st.agricultura.lotes[li]; if (!lo.crop) continue;
      var cp = EL.cropPorId(lo.crop);
      aguaIrrig += cp.agua;
      // temperatura
      var tMed = (st.clima.temp + st.clima.tempMin) / 2;
      if (lo.protegido) tMed = Math.max(tMed, 14);
      if (cp.tanque) tMed = Math.max(tMed, 15); // tanque coberto, aquecido pelo rejeito térmico
      if (tMed < cp.tMin) lo.saude -= (cp.tMin - tMed) * 1.8;
      if (tMed > cp.tMax) lo.saude -= (tMed - cp.tMax) * 1.6;
      // nutrientes
      var fome = 0;
      if (cp.n > 0 && solo.n < cp.n * 0.35) fome += 0.30;
      if (solo.p < cp.p * 0.35) fome += 0.22;
      if (solo.k < cp.k * 0.35) fome += 0.15;
      if (solo.ph > 7.9 && !tem(st, 'agricultura_int')) fome += 0.10;
      fome = Math.min(fome, 0.72);          // solo pobre atrasa a lavoura; nunca a paralisa
      var vel = (1 - fome) * clamp(cuidadoPorLote, 0.2, 1.3);
      lo.prog += vel;
      // um lote mal nutrido fica raquítico, não morre: piso de 22 de saúde
      lo.saude = clamp(lo.saude - fome * 2.5 + (cuidadoPorLote > 0.9 ? 2 : 0.5), 22, 100);
      // consumo de nutrientes
      solo.n = Math.max(0, solo.n - cp.n / cp.dias * 0.25 * (cp.n > 0 ? 1 : -1));
      solo.p = Math.max(0, solo.p - cp.p / cp.dias * 0.25);
      solo.k = Math.max(0, solo.k - cp.k / cp.dias * 0.25);
      if (lo.saude <= 0) {
        EL.logar(st, 'Um lote de ' + cp.n + ' foi perdido.', 'bad');
        lo.crop = null; lo.prog = 0; lo.saude = 100; continue;
      }
      if (lo.prog >= cp.dias) {
        var rend = cp.rend * (lo.saude / 100) * (lo.mult || 1) * (st.bonus.colheita || 1) * efTech(st, 'colheitaMult', 'max' ) ;
        if (!rend || rend < 0) rend = cp.rend * (lo.saude / 100) * (lo.mult || 1) * (st.bonus.colheita || 1);
        rend *= D.producao;
        if (cp.rend > 0) { st.mat.comida += rend; st.colhidoTotal = (st.colhidoTotal || 0) + rend; }
        if (cp.fibra) st.mat.fibra += cp.fibra * (lo.saude / 100);
        if (cp.oleo) st.mat.biodiesel += cp.oleo * (lo.saude / 100);
        st.mat.semente += cp.sem * 1.9;
        st.mat.biomassa += 18;
        EL.logar(st, '🌾 Colheita: ' + cp.n + ' → ' + Math.round(rend) + ' rações.', 'good');
        st.stats.colheitas++; st.colheitaRecente = true; st.flags.jaColheu = true;
        lo.crop = null; lo.prog = 0; lo.saude = 100;
      }
    }
    // fertilizante aplicado automaticamente se houver
    if (st.mat.fertilizante > 0 && lotesAtivos > 0) {
      var usoF = Math.min(st.mat.fertilizante, lotesAtivos * 3);
      st.mat.fertilizante -= usoF;
      solo.n += usoF * 0.5; solo.p += usoF * 0.3; solo.k += usoF * 0.35;
    }
    // a reposição precisa acompanhar o tamanho da lavoura, senão construir mais canteiros
    // acelera o esgotamento e a colônia morre de fome por ter plantado demais
    var escalaSolo = Math.max(1, lotesAtivos * 0.4);
    if (st.mat.nitrato > 0 && solo.n < 45) { var un = Math.min(st.mat.nitrato, 24 * escalaSolo); st.mat.nitrato -= un; solo.n += un * 0.45; }
    if (st.mat.fosfato > 0 && solo.p < 40) { var up2 = Math.min(st.mat.fosfato, 16 * escalaSolo); st.mat.fosfato -= up2; solo.p += up2 * 0.55; }
    if (st.mat.silvita > 0 && solo.k < 40) { var uk = Math.min(st.mat.silvita, 16 * escalaSolo); st.mat.silvita -= uk; solo.k += uk * 0.5; }
    if (st.mat.gesso > 0 && solo.ph > 7.4) { var ug = Math.min(st.mat.gesso, 10); st.mat.gesso -= ug; solo.ph = Math.max(6.6, solo.ph - ug * 0.01); solo.sal = Math.max(0, solo.sal - ug * 0.002); }
    if (tem(st, 'compostagem')) { solo.n += 0.5 * escalaSolo; solo.p += 0.3 * escalaSolo; solo.k += 0.3 * escalaSolo; }
    // mineralização natural do loess vulcânico: lento, mas nunca zero
    solo.n += 0.25; solo.p += 0.12; solo.k += 0.18;
    solo.org = clamp(solo.org + (tem(st, 'compostagem') ? 0.25 : 0.02), 0, 90);

    /* ---------- 10. ÁGUA ---------- */
    var R2 = resumo(st);
    var aguaProd = R2.aguaPassiva;
    st.mat.agua += aguaProd;
    var consomeAgua = R2.aguaLiquida + R2.aguaUso + aguaIrrig;
    st.mat.agua -= consomeAgua;
    st.agua.produzidaHoje = aguaProd; st.agua.consumidaHoje = consomeAgua;
    if (st.mat.agua < 0) {
      var falta2 = -st.mat.agua; st.mat.agua = 0; st.faltouAgua = true;
      st.ultimoSemAgua = st.sol;
      // faltar 5% da água não é a mesma coisa que não ter nenhuma: o dano segue o tamanho do rombo
      var gravA = clamp(falta2 / Math.max(1, consomeAgua), 0.12, 1);
      vivos(st).forEach(function (c) { c.saude -= 9 * gravA; c.fadiga += 14 * gravA; c.moral -= 6 * gravA; });
      EL.logar(st, '⚠ FALTOU ÁGUA: déficit de ' + Math.round(falta2) + ' L. Desidratação generalizada.', 'bad');
    }
    st.mat.agua = Math.min(st.mat.agua, R2.estoqueAgua);

    /* ---------- 11. ENERGIA ---------- */
    st.energia.geracao = R2.gen; st.energia.demanda = R2.dem;
    var saldo = R2.gen - R2.dem;
    st.energia.armazenada = clamp(st.energia.armazenada + saldo, 0, st.energia.capacidade);
    if (saldo < 0 && st.energia.armazenada <= 0) {
      st.energia.ultimoDeficit = st.sol;
      var grav = clamp(-saldo / Math.max(1, R2.dem), 0.1, 1);   // fração da demanda não atendida
      var frio = st.clima.tempMin < 0 ? 1.6 : 0.7;
      vivos(st).forEach(function (c) { c.saude -= 2.4 * grav * frio; c.fadiga += 7 * grav; c.moral -= 4 * grav; });
      EL.logar(st, '⚠ APAGÃO: geração ' + R2.gen.toFixed(1) + ' kWh contra demanda ' + R2.dem.toFixed(1) + ' kWh.', 'bad');
    }
    st.energia.sujeira = clamp(st.energia.sujeira + st.clima.poeira * 0.12 - (st.clima.chuva > 8 ? 0.25 : 0), 0, 0.9);
    st.energia.penalidade = Math.max(0, st.energia.penalidade - (acc.manutencao > 0.4 ? 0.5 : 0));

    /* ---------- 12. ALIMENTO ---------- */
    var comeu = R2.comidaDia;
    var racaoReal = st.politica.racaoComida;
    if (st.mat.comida < comeu) { racaoReal *= st.mat.comida / comeu; comeu = st.mat.comida; }
    st.mat.comida = Math.max(0, st.mat.comida - comeu);
    var perdaEst = st.mat.comida * (0.012 + efTech(st, 'perdaComida', 'sum') * 0.012) * (st.bonus.perdaComida || 1);
    if (perdaEst > 0) st.mat.comida -= Math.max(0, perdaEst);
    st.mat.comida = Math.min(st.mat.comida, R2.estoqueComida);
    st.comidaSegura = R2.diasComida > 30;


    /* ---------- 13. NECESSIDADES, SAÚDE, MORAL ---------- */
    var moralAmb = 50 + R2.conforto * 1.1 + R2.moralPredios * 2.2 + (racaoReal - 1) * 45
      - R2.abrigoDeficit * 3.2 - (st.aguaContaminada ? 4 : 0)
      + (st.bonus.moralComando ? st.bonus.moralComando * 3 : 0)
      + (st.bonus.moralAlcool ? 5 : 0) - (st.crise ? 8 : 0)
      - lutoRecente(st)
      + ((R2.diasComida > 30 && R2.diasAgua > 20 && R2.abrigoDeficit === 0) ? 12 : 0)
      + (st.bonus.moral || 0);
    var apoioPsi = acc.apoio * 9;

    for (var n1 = 0; n1 < vs.length; n1++) {
      var p1 = vs[n1];
      // fome
      // a fome converge para um patamar ditado pela ração, em vez de subir sem limite:
      // 100% da ração -> 0 · 55% -> ~52 (debilitante, sobrevivível) · 25% -> ~86 (letal a médio prazo)
      var alvoFome = clamp((1 - racaoReal) * 115, 0, 100);
      p1.fome = clamp(p1.fome + (alvoFome - p1.fome) * 0.22, 0, 100);
      // fadiga
      var fMult = efTech(st, 'fadigaMult', 'mult');
      if (!fMult || fMult <= 0) fMult = 1;
      if (p1.trabalhoEfetivo === 'descanso') p1.fadiga = clamp(p1.fadiga - 32 + (R2.abrigoDeficit > 0 ? 6 : 0), 0, 100);
      else {
        var f2 = 11 * fMult * (st.bonus.fadiga || 1);
        if (p1.tracos.indexOf('tept') >= 0) f2 *= 1.4;
        if (p1.tracos.indexOf('obsessivo') >= 0) f2 *= 1.25;
        if (p1.idade > 50) f2 *= 1.15;
        if (R2.abrigoDeficit > 0) f2 *= 1.15;
        p1.fadiga = clamp(p1.fadiga + f2 - 7 - R2.conforto * 0.12, 0, 100);
      }
      // saúde
      var dS = 0;
      if (p1.fome > 80) dS -= (p1.fome - 80) * 0.09;
      if (racaoReal < 0.35) {
        // comer 34% da ração não é a mesma coisa que comer 5%: a penalidade acompanha o corte
        var gR = clamp((0.35 - racaoReal) / 0.35, 0.1, 1);
        dS -= 1.5 * gR;
      }
      if (p1.fadiga > 88) dS -= 1.4;
      if (st.clima.tempMin < 0 && R2.abrigoDeficit > 0) {
        // faltar duas camas não pode congelar as vinte pessoas: o frio cobra de quem ficou
        // de fora, e cobra conforme a noite. Este era o maior dreno de saúde do jogo inteiro.
        var fracFora = clamp(R2.abrigoDeficit / Math.max(1, vs.length), 0, 1);
        var frioSev = clamp(-st.clima.tempMin / 18, 0.35, 1.7);
        var dFrio = 2.2 * fracFora * frioSev;
        dS -= dFrio;
      }
      if (p1.ferimento) {
        // medicina que não cura mais rápido do que a ferida agrava é decoração:
        // com médico, leito e medicina moderna, um ferimento grave passa a ser recuperável
        var cura = 3.2 * R2.curaMult * (acc.medico > 0.3 ? 1.7 : 0.85) * (R2.leitos > 0 ? 1.25 : 1);
        p1.ferimento.sev -= cura;
        p1.ferimento.dias--;
        if (p1.ferimento.sev <= 0 || p1.ferimento.dias <= 0) {
          EL.logar(st, p1.nome + ' recuperou-se de: ' + p1.ferimento.n + '.', 'good');
          p1.ferimento = null;
        } else {
          dS -= p1.ferimento.sev * 0.030;
          if (p1.ferimento.sev < 25 && p1.fome < 82) dS += 1.2;   // ferida leve não impede o corpo de se recompor
        }
      } else if (p1.fome < 82 && p1.fadiga < 88) dS += 2.2 + R2.curaMult * 0.7;
      if (p1.doente && p1.doente > st.sol) dS -= 2.6;
      p1.saude = clamp(p1.saude + dS, 0, 100);
      // moral
      var alvo = moralAmb + (p1.tracos.indexOf('otimista') >= 0 ? 10 : 0)
        + (p1.tracos.indexOf('pessimista') >= 0 ? -10 : 0)
        + (p1.tracos.indexOf('luto') >= 0 ? -22 : 0)
        - p1.fome * 0.14 - p1.fadiga * 0.08 + (p1.saude - 70) * 0.12;
      // relações: amigos vivos por perto elevam
      var soc = 0;
      for (var n2 = 0; n2 < vs.length; n2++) if (vs[n2].id !== p1.id) soc += EL.getRel(st, p1.id, vs[n2].id) * 0.02;
      alvo += clamp(soc, -12, 12);
      alvo += apoioPsi / Math.max(1, vs.length) * 2.4;
      p1.moral = clamp(p1.moral + (alvo - p1.moral) * 0.18, 0, 100);
      p1.humor = clamp(p1.moral * 0.6 + (100 - p1.fadiga) * 0.25 + (100 - p1.fome) * 0.15, 0, 100);
      // morte — no modo Colônia Livre ninguém morre, só fica incapacitado
      if (p1.saude <= 0 && st.sandbox) {
        p1.saude = 8; p1.fadiga = Math.min(p1.fadiga, 70);
        if (p1.ferimento) p1.ferimento.sev = Math.min(p1.ferimento.sev, 30);
      } else if (p1.saude <= 0) {
        // a sede mata dias depois do dia seco: sem esta memória toda morte por água
        // aparecia como 'Colapso orgânico' e o jogador nunca descobria o que o matou
        var sedeRecente = st.faltouAgua || (st.ultimoSemAgua && st.sol - st.ultimoSemAgua <= 12);
        var causa = EL.trCausa(p1.ferimento ? p1.ferimento.n
                    : (p1.fome > 90 ? 'Inanição'
                    : (sedeRecente ? 'Desidratação' : 'Colapso orgânico')));
        criarApi(st, rng, R2).matar(p1.id, causa);
        criarApi(st, rng, R2).moralAll(-14);
      }
      // luto passa
      if (p1.tracos.indexOf('luto') >= 0 && st.sol > 45 && p1.moral > 55) {
        p1.tracos.splice(p1.tracos.indexOf('luto'), 1);
        EL.logar(st, p1.nome + ' voltou a rir de alguma coisa. Levou ' + st.sol + ' sols.', 'good');
      }
    }

    /* ---------- 14. ENSINO E APRENDIZADO ---------- */
    aplicarXP(st, acc.ensino * (1 + R2.ensino));

    /* ---------- 15. RELAÇÕES ---------- */
    if (rng.chance(0.5) && vs.length > 1) {
      var A = rng.pick(vs), B = rng.pick(vs);
      if (A.id !== B.id) {
        var delta = rng.int(-4, 6);
        if (A.trabalhoEfetivo === B.trabalhoEfetivo) delta += 3;
        if (R2.moralMedia < 40) delta -= 4;
        EL.setRel(st, A.id, B.id, EL.getRel(st, A.id, B.id) + delta);
      }
    }

    /* ---------- 16. MANUTENÇÃO E DESGASTE ---------- */
    var nPred = st.predios.filter(function (p) { return p.pronto; }).length || 1;
    var desgaste = 0.45 * D.risco * (st.bonus.risco || 1) * (st.bonus.desgaste || 1) - (acc.manutencao * 9) / nPred;
    for (var d1 = st.predios.length - 1; d1 >= 0; d1--) {
      var pd = st.predios[d1]; if (!pd.pronto) continue;
      pd.hp -= Math.max(-2, desgaste) * (st.clima.cond === 'tempestade' ? 2 : 1);
      pd.hp = Math.min(100, pd.hp);
      if (pd.hp <= 0) {
        var bcol = EL.buildPorId(pd.id);
        /* Apagar a estrutura do mapa era o pior momento do jogo: a estufa sumia com a
           lavoura inteira dentro e não havia como voltar atrás. Uma obra abandonada vira
           ruína — de pé o bastante para ser reerguida, e cara o bastante para doer. */
        EL.logar(st, '✖ ' + bcol.n + ' desabou por falta de manutenção. Restou a estrutura, para quem tiver braço de reerguê-la.', 'bad');
        if (bcol.ef && bcol.ef.lotes) {
          var rem = bcol.ef.lotes, meio = Math.ceil(bcol.ef.lotes / 2);
          for (var lx = st.agricultura.lotes.length - 1; lx >= 0 && rem > 0; lx--) {
            var lt = st.agricultura.lotes[lx];
            if (!!lt.protegido !== !!bcol.ef.protegido) continue;
            if (meio > 0) { st.agricultura.lotes.splice(lx, 1); meio--; }   // metade se perde no desabamento
            else { lt.protegido = false; lt.saude = Math.min(lt.saude, 55); }  // a outra metade fica ao relento
            rem--;
          }
        }
        pd.pronto = false;
        pd.hp = 100;
        pd.ptFeito = bcol.pt * 0.45;              // reerguer custa pouco mais da metade de construir
        pd.ruina = true;
      }
    }
    st.agua.recicladorDano = Math.max(0, st.agua.recicladorDano - (acc.manutencao > 0.5 ? 0.03 : 0));

    /* ---------- 16a. ENCRUZILHADA DE DOUTRINA ---------- */
    try {
      var dPend = EL.Doutrinas.pendente(st);
      if (dPend) st.doutrinaPendente = dPend.id; else st.doutrinaPendente = null;
    } catch (e) {}

    /* ---------- 16b. EXPEDIÇÃO E DEMANDAS ---------- */
    var apiED = criarApi(st, rng, resumo(st));
    try {
      var tinha = !!(st.exped && st.exped.ativa);
      EL.Exped.tick(st, rng, apiED);
      if (tinha && !(st.exped && st.exped.ativa)) st.expedicoesFeitas = (st.expedicoesFeitas || 0) + 1;
      EL.Demandas.verificarPrazo(st, apiED);
      EL.Demandas.talvezAbrir(st, rng);
    } catch (e) {}

    /* ---------- 17. EVENTOS ---------- */
    var R3 = resumo(st);
    st.moralMedia = R3.moralMedia; st.diasComida = R3.diasComida; st.diasAgua = R3.diasAgua;
    st.abrigoDeficit = R3.abrigoDeficit; st.defesa = R3.defesa; st.pop = R3.pop;
    st.setoresExplorados = 0;
    for (var sx in st.setores) if (st.setores[sx].explorado >= 50) st.setoresExplorados++;

    var cands = [];
    if (vivos(st).length === 0) { checarFim(st); st.rngState = rng.state; return null; }
    for (var e1 = 0; e1 < EL.EVENTOS.length; e1++) {
      var ev = EL.EVENTOS[e1];
      if (st.eventosCd[ev.id] && st.eventosCd[ev.id] > st.sol) continue;
      var w = (typeof ev.peso === 'function') ? ev.peso(st) : ev.peso;
      if (w > 0) cands.push({ ev: ev, w: w * D.evento * ((ev.cat === 'crise' || ev.cat === 'fauna') ? (st.bonus.risco || 1) : 1) * (ev.cat === 'saude' ? (st.bonus.doenca || 1) : 1) });
    }
    var nEv = rng.chance(0.55) ? 1 : (rng.chance(0.25) ? 2 : 0);
    for (var e2 = 0; e2 < nEv && cands.length; e2++) {
      var esc = rng.weighted(cands, function (x) { return x.w; });
      if (!esc) break;
      cands = cands.filter(function (x) { return x.ev.id !== esc.ev.id; });
      st.eventosCd[esc.ev.id] = st.sol + (esc.ev.cd || 20);
      EL.logar(st, '▣ ' + esc.ev.n + ' — ' + esc.ev.txt, 'evt');
      if (esc.ev.escolhas) { st.pendente = { id: esc.ev.id }; break; }
      else if (esc.ev.efe) esc.ev.efe(criarApi(st, rng, R3));
    }

    /* ---------- 17b. CONTADORES DE CENÁRIO ---------- */
    var aguaSobra = R3.aguaPassiva - R3.aguaLiquida - R3.aguaUso;
    st.aguaEstavel = aguaSobra > 0 ? (st.aguaEstavel || 0) + 1 : 0;

    /* ---------- 18. HISTÓRICO E MARCOS ---------- */
    if (!st.hist) st.hist = [];
    st.hist.push({ s: st.sol, p: R3.pop, c: Math.round(st.mat.comida), a: Math.round(st.mat.agua),
                   m: Math.round(R3.moralMedia), t: st.tech.feitas.length });
    if (!st.marcos) st.marcos = [];
    marcar(st, 'primeiraObra', st.predios.filter(function (p) { return p.pronto; }).length > 5, 'Primeira infraestrutura de verdade');
    marcar(st, 'primeiraColheita', st.stats.colheitas > 0, 'Primeira colheita nascida em Elysium');
    marcar(st, 'metal', st.mat.ferro > 20 || st.mat.aco > 10, 'Primeiro metal fundido');
    marcar(st, 'eletricidade', tem(st, 'eletricidade'), 'A colônia gerou eletricidade');
    marcar(st, 'autoAgua', R3.aguaPassiva > R3.aguaLiquida, 'Água renovável garantida');
    marcar(st, 'autoComida', R3.diasComida > 120, 'Autossuficiência alimentar');
    marcar(st, 'industria', tem(st, 'maquinas_ferr'), 'Indústria pesada');
    marcar(st, 'computacao', tem(st, 'computacao'), 'Computação');
    marcar(st, 'nuclear', tem(st, 'fissao'), 'Era nuclear');
    marcar(st, 'espaco', tem(st, 'foguetes'), 'Voo espacial');
    marcar(st, 'nascimento', st.stats.nascidos > 0, 'A primeira criança de Elysium');
    marcar(st, 'anoUm', st.sol > 402, 'Sobreviveu a um ano inteiro de Elysium');

    /* ---------- 19. FIM DE JOGO ---------- */
    checarFim(st);

    st.rngState = rng.state;
    st.mat.comida = Math.max(0, st.mat.comida);
    return null;
  }

  function resolverEscolha(st, idx) {
    if (!st.pendente) return;
    var ev = EL.eventoPorId(st.pendente.id);
    var rng = EL.RNG.make(st.rngState);
    var esc = ev.escolhas[idx];
    if (esc) { EL.logar(st, '→ ' + esc.t, 'warn'); esc.ef(criarApi(st, rng, resumo(st))); }
    st.pendente = null;
    st.rngState = rng.state;
    checarFim(st);
  }

  function marcar(st, id, cond, texto) {
    if (!cond) return;
    for (var i = 0; i < st.marcos.length; i++) if (st.marcos[i].id === id) return;
    st.marcos.push({ id: id, sol: st.sol, txt: texto });
    EL.logar(st, '★ ' + texto + ' (sol ' + st.sol + ')', 'good');
  }

  function checarFim(st) {
    var v = vivos(st);
    /* conquistas são verificadas sempre, mesmo sem fim de jogo */
    try { if (EL.Conquistas) { var nc = EL.Conquistas.verificar(st);
      if (nc.length) { st.conqNovas = (st.conqNovas || []).concat(nc);
        nc.forEach(function (c) { EL.logar(st, '🏆 ' + c.n + ' — ' + c.d, 'good'); }); } } } catch (e) {}

    /* condição de vitória própria do cenário */
    if (!st.fimDeJogo && st.cenario && EL.cenarioPorId) {
      var cen = EL.cenarioPorId(st.cenario);
      if (cen && cen.vitoria) {
        var venceu = false;
        try { venceu = cen.vitoria(st); } catch (e) {}
        if (venceu) {
          st.fimDeJogo = { tipo: 'vitoria',
            txt: (EL.LANG === 'en' ? 'Scenario complete: ' : 'Cenário vencido: ') + cen.n + ' — ' + cen.objetivo };
          EL.logar(st, '★★ ' + cen.n + ': objetivo cumprido no sol ' + st.sol + '.', 'good');
          try { if (EL.Conquistas) EL.Conquistas.verificar(st); } catch (e) {}
          return;
        }
      }
    }
    if (v.length === 0) {
      var ult = st.mortos.slice(-6).map(function (m) { return m.causa; });
      var cont = {}, causa = 'Colapso', maior = 0;
      ult.forEach(function (c) { cont[c] = (cont[c] || 0) + 1; if (cont[c] > maior) { maior = cont[c]; causa = c; } });
      st.fimDeJogo = { tipo: 'derrota', causa: causa,
        txt: EL.LANG === 'en'
          ? 'The colony of Elysium died out on sol ' + st.sol + '. Nobody will ever know it existed.'
          : 'A colônia de Elysium se extinguiu no sol ' + st.sol + '. Ninguém saberá que ela existiu.' };
      EL.logar(st, '☠☠ FIM. Todos morreram no sol ' + st.sol + '.', 'bad');
      return;
    }
    if (tem(st, 'terraformacao') && v.length >= 30) {
      st.fimDeJogo = { tipo: 'vitoria', txt: EL.LANG === 'en'
        ? 'Sol ' + st.sol + ': atmospheric CO₂ begins to fall. Elysium is a civilisation.'
        : 'Sol ' + st.sol + ': o CO₂ atmosférico começa a cair. Elysium é uma civilização.' };
      EL.logar(st, '★★ VITÓRIA: terraformação iniciada com ' + v.length + ' habitantes.', 'good');
    }
  }

  /* ============ APRENDIZADO ============ */
  function melhorCiencia(c) {
    var m = EL.PER_CIENCIA[0], v = -1;
    for (var i = 0; i < EL.PER_CIENCIA.length; i++) {
      var k = EL.PER_CIENCIA[i];
      if ((c.per[k] || 0) > v) { v = c.per[k] || 0; m = k; }
    }
    return m;
  }
  function ganharXP(c, per, mult) {
    if (!per) return;
    c.xp[per] = (c.xp[per] || 0) + 1 * (mult || 1) * (c.tracos.indexOf('aprendiz') >= 0 ? 2.2 : 1) * (EL._bonusAprend || 1);
  }
  function aplicarXP(st, bonusEnsino) {
    var vs = vivos(st);
    for (var i = 0; i < vs.length; i++) {
      var c = vs[i];
      for (var k in c.xp) {
        var atual = c.per[k] || 0;
        var custo = 14 + atual * 11;
        if (bonusEnsino > 0) custo /= (1 + bonusEnsino * 0.4);
        if (c.xp[k] >= custo && atual < 10) {
          c.per[k] = atual + 1; c.xp[k] = 0;
          EL.logar(st, '↑ ' + c.nome + ' evoluiu em ' + EL.PERICIAS[k] + ' (nível ' + c.per[k] + ').', 'good');
        }
      }
    }
  }

  /* api de efeitos para decisões tomadas fora do turno (demandas) */
  function apiUI(st) {
    var rng = EL.RNG.make(st.rngState);
    var a = criarApi(st, rng, resumo(st));
    st.rngState = rng.state;
    return a;
  }

  return {
    apiUI: apiUI,
    ptDe: ptDe, resumo: resumo, jobsDisponiveis: jobsDisponiveis, avancar: avancar,
    resolverEscolha: resolverEscolha, iniciarObra: iniciarObra, cancelarObra: cancelarObra,
    podeConstruir: podeConstruir, iniciarPesquisa: iniciarPesquisa, podePesquisar: podePesquisar,
    addProducao: addProducao, plantar: plantar, setoresOperaveis: setoresOperaveis,
    setoresConstruiveis: setoresConstruiveis,
    efPredios: efPredios, efTech: efTech, tem: tem, vivos: vivos, fatorDistancia: fatorDistancia
  };
})();
