/* PROJECT ELYSIUM — expedições.
   O mapa existia mas era inerte: você explorava e nunca mais pensava nele.
   Uma expedição tira gente do trabalho por vários sols em troca de material,
   descoberta e risco. É a decisão que faz a alocação voltar a mudar no meio do jogo. */
var EL = window.EL || {}; window.EL = EL;

EL.Exped = (function () {

  function en() { return EL.LANG === 'en'; }

  /* Quantos sols leva ir, trabalhar e voltar. */
  function duracao(st, setor, n) {
    var d = EL.dist(EL.BASE_SETOR, setor);
    var bio = EL.BIOMAS[EL.bioma(setor)];
    var viagem = Math.ceil(d * (1 + bio.mov / 6));
    if (st.setores[setor].rota) viagem = Math.ceil(viagem * 0.7);
    if (st.setores[setor].outpost) viagem = Math.ceil(viagem * 0.6);
    var trabalho = Math.max(2, Math.ceil(8 - n * 0.6));
    return Math.max(4, viagem * 2 + trabalho);
  }

  /* Risco de incidente por sol de expedição (0–1). */
  function risco(st, setor, membros) {
    var bio = EL.BIOMAS[EL.bioma(setor)];
    var d = EL.dist(EL.BASE_SETOR, setor);
    var r = 0.012 + bio.perigo * 0.0045 + d * 0.002;
    var sobrev = 0;
    membros.forEach(function (c) { sobrev = Math.max(sobrev, c.per.sobrevivencia || 0); });
    r *= (1 - sobrev * 0.055);
    if (membros.length < 3) r *= 1.4;
    if (membros.length >= 5) r *= 0.82;
    if (EL.Sim.tem(st, 'radio')) r *= 0.55;
    else if (EL.Sim.tem(st, 'telegrafia')) r *= 0.72;
    if (EL.Sim.tem(st, 'caca')) r *= 0.88;
    r *= (EL.DIFICULDADE[st.dif] || {}).risco || 1;
    return Math.max(0.004, Math.min(0.14, r));
  }

  function nivelRisco(r) {
    if (r < 0.02) return ['baixo', 'low'];
    if (r < 0.045) return ['médio', 'medium'];
    if (r < 0.08) return ['alto', 'high'];
    return ['muito alto', 'very high'];
  }

  /* O que aquele setor tem para dar. */
  function espolio(st, setor, membros, sols) {
    var recs = EL.recursosDoSetor(setor).filter(function (r) {
      return r.mat && r.y > 0 && (!r.tec || EL.Sim.tem(st, r.tec));
    });
    var out = {};
    var forca = 0;
    membros.forEach(function (c) { forca += 0.5 + (c.per.geologia || 0) * 0.06 + (c.per.sobrevivencia || 0) * 0.04; });
    recs.slice(0, 5).forEach(function (r) {
      var q = r.y * forca * sols * 0.42 / (1 + 0.16 * (r.dif - 1));
      if (q > 0.4) out[r.mat] = Math.round((out[r.mat] || 0) + q);
    });
    return out;
  }

  function podeEnviar(st) {
    if (st.exped && st.exped.ativa) return en() ? 'An expedition is already out.' : 'Já há uma expedição em campo.';
    return null;
  }

  function setoresAlvo(st) {
    var out = [];
    for (var sid in st.setores) {
      if (sid === EL.BASE_SETOR) continue;
      var s = st.setores[sid];
      if (s.explorado < 25) continue;
      if (EL.dist(EL.BASE_SETOR, sid) > 6) continue;
      out.push(sid);
    }
    out.sort(function (a, b) { return EL.dist(EL.BASE_SETOR, a) - EL.dist(EL.BASE_SETOR, b); });
    return out;
  }

  function enviar(st, setor, ids) {
    var err = podeEnviar(st); if (err) return err;
    var membros = st.crew.filter(function (c) { return c.vivo && ids.indexOf(c.id) >= 0; });
    if (membros.length < 2) return en() ? 'An expedition needs at least 2 people.' : 'Uma expedição precisa de pelo menos 2 pessoas.';
    if (membros.length > 6) return en() ? 'At most 6 people.' : 'No máximo 6 pessoas.';
    var sols = duracao(st, setor, membros.length);
    st.exped = st.exped || {};
    st.exped.ativa = {
      setor: setor, ids: membros.map(function (c) { return c.id; }),
      sols: sols, restam: sols, risco: risco(st, setor, membros), incidentes: 0
    };
    membros.forEach(function (c) { c.trabalho = 'expedicao'; c.emExpedicao = true; });
    EL.logar(st, (en() ? 'Expedition left for ' : 'Expedição partiu para ') + setor + ' — ' +
      membros.length + (en() ? ' people, ' : ' pessoas, ') + sols + ' sols.', 'info');
    return null;
  }

  function cancelar(st) {
    if (!st.exped || !st.exped.ativa) return;
    var a = st.exped.ativa;
    st.crew.forEach(function (c) {
      if (a.ids.indexOf(c.id) >= 0) { c.emExpedicao = false; c.trabalho = 'descanso'; c.fadiga = Math.min(100, c.fadiga + 20); }
    });
    EL.logar(st, en() ? 'The expedition turned back early. Nothing gained, and the walk cost them.'
                      : 'A expedição voltou antes do tempo. Nada obtido, e a caminhada cobrou o preço.', 'warn');
    st.exped.ativa = null;
  }

  /* Chamado uma vez por sol pelo motor. */
  function tick(st, rng, api) {
    if (!st.exped || !st.exped.ativa) return;
    var a = st.exped.ativa;
    var membros = st.crew.filter(function (c) { return c.vivo && a.ids.indexOf(c.id) >= 0; });
    if (!membros.length) { st.exped.ativa = null; return; }

    membros.forEach(function (c) { c.fadiga = Math.min(100, c.fadiga + 4); });

    /* incidente */
    if (rng.chance(a.risco)) {
      a.incidentes++;
      var v = rng.pick(membros);
      var bio = EL.BIOMAS[EL.bioma(a.setor)];
      var tipos = [
        [en() ? 'Fall on broken ground' : 'Queda em terreno acidentado', 30],
        [en() ? 'Exposure' : 'Exposição ao tempo', 24],
        [en() ? 'Predator attack in the field' : 'Ataque de predador em campo', 45],
        [en() ? 'Bad water in the field' : 'Água ruim em campo', 20]
      ];
      var t = rng.pick(tipos);
      api.ferir(v.id, t[0], t[1] + bio.perigo * 3, rng.int(5, 14));
      EL.logar(st, (en() ? 'Trouble in the field at ' : 'Problema em campo no setor ') + a.setor + '.', 'bad');
      api.moralAll(-2);
      if (rng.chance(0.10)) {
        EL.logar(st, en() ? 'The team is turning back.' : 'A equipe está voltando.', 'warn');
        a.restam = Math.min(a.restam, 2);
      }
    }

    a.restam--;
    if (a.restam > 0) return;

    /* retorno */
    var sols = a.sols;
    var esp = espolio(st, a.setor, membros, sols);
    var linhas = [];
    for (var m in esp) { st.mat[m] = (st.mat[m] || 0) + esp[m]; linhas.push(esp[m] + ' ' + EL.MAT[m].n); }
    var s = st.setores[a.setor];
    s.explorado = Math.min(100, s.explorado + 35);
    st.tech.pp += Math.round(sols * 1.2);

    membros.forEach(function (c) {
      c.emExpedicao = false; c.trabalho = 'descanso';
      c.xp.sobrevivencia = (c.xp.sobrevivencia || 0) + sols * 0.8;
      c.xp.geologia = (c.xp.geologia || 0) + sols * 0.4;
    });

    EL.logar(st, (en() ? 'The expedition to ' : 'A expedição a ') + a.setor +
      (en() ? ' is back after ' : ' voltou depois de ') + sols + ' sols' +
      (a.incidentes ? (en() ? ', with ' + a.incidentes + ' incident(s)' : ', com ' + a.incidentes + ' incidente(s)') : '') + '.', 'good');
    if (linhas.length) EL.logar(st, (en() ? 'Brought back: ' : 'Trouxeram: ') + linhas.join(' · ') + '.', 'good');
    api.moralAll(a.incidentes ? +2 : +6);

    /* a distância às vezes revela coisa que o drone não vê */
    if (rng.chance(0.28)) {
      var viz = EL.vizinhos(a.setor);
      var alvo = rng.pick(viz);
      if (st.setores[alvo] && st.setores[alvo].explorado < 60) {
        st.setores[alvo].explorado = Math.max(st.setores[alvo].explorado, 55);
        EL.logar(st, (en() ? 'On the way back they surveyed ' : 'Na volta levantaram também o setor ') + alvo + '.', 'info');
      }
    }
    st.exped.ativa = null;
  }

  return { duracao: duracao, risco: risco, nivelRisco: nivelRisco, espolio: espolio,
           podeEnviar: podeEnviar, setoresAlvo: setoresAlvo, enviar: enviar, cancelar: cancelar, tick: tick };
})();
