/* PROJECT ELYSIUM — a crônica do sol.
   O motor já gera história emergente: o colono que quebra a perna enquanto o médico
   trata uma febre e a lavoura apodrece. O problema é que isso ficava enterrado numa
   aba de registro. Aqui essa história vira a primeira coisa que o jogador lê. */
var EL = window.EL || {}; window.EL = EL;

EL.Cronica = (function () {

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function en() { return EL.LANG === 'en'; }
  function prim(c) { return EL.nomeCurto(c); }

  /* ---------- cabeçalho: o sol como cena, não como tabela ---------- */
  var CEU = {
    'limpo':              ['O céu está limpo.', 'Clear sky.'],
    'nublado':            ['Nublado o sol inteiro.', 'Overcast all sol.'],
    'chuva':              ['Chove desde antes do amanhecer.', 'Rain since before dawn.'],
    'chuva ácida':        ['Chuva ácida. Ninguém sai sem cobrir a cabeça.', 'Acid rain. Nobody goes out uncovered.'],
    'tempestade':         ['Tempestade. O vento arranca o que não estiver amarrado.', 'Storm. The wind takes anything not tied down.'],
    'neve':               ['Neva sobre a Planície de Cinzas.', 'Snow over the Ashfall Plains.'],
    'poeira':             ['Poeira no ar o dia todo.', 'Dust in the air all day.'],
    'tempestade de poeira':['Tempestade de poeira. O mundo some por horas.', 'Dust storm. The world disappears for hours.']
  };

  function cabecalho(st) {
    var c = st.clima, e = en();
    var l = (CEU[c.cond] || ['', ''])[e ? 1 : 0];
    var t = c.temp + '°C';
    if (c.tempMin < -10) l += e ? ' The night bottomed out at ' + c.tempMin + '°C.' : ' A noite chegou a ' + c.tempMin + '°C.';
    else if (c.temp > 33) l += e ? ' The heat is brutal: ' + t + '.' : ' O calor é brutal: ' + t + '.';
    if (c.flare) l += e ? ' Vesper flared: the sky went green for forty minutes.'
                        : ' Vesper fulgurou: o céu ficou verde por quarenta minutos.';
    return l;
  }

  /* ---------- observações humanas tiradas do estado da tripulação ---------- */
  function pessoas(st) {
    var vs = EL.Sim.vivos(st), e = en(), out = [];
    if (!vs.length) return out;

    /* quem está pior, e por quê — cada motivo aparece no máximo uma vez */
    var feridos = vs.filter(function (c) { return c.ferimento && c.ferimento.sev > 35; });
    if (feridos.length) {
      var f = feridos[0];
      var fn = (EL.trFerimento ? EL.trFerimento(f.ferimento.n) : f.ferimento.n).toLowerCase();
      out.push(e ? prim(f) + ' is still down with ' + fn + '. Nakamura checks the wound twice a sol now.'
                 : prim(f) + ' continua de cama com ' + fn + '. Nakamura olha a ferida duas vezes por sol agora.');
    }

    var exaustos = vs.filter(function (c) { return c.fadiga > 85 && c.trabalho !== 'descanso'; });
    if (exaustos.length >= 3) {
      out.push(e ? exaustos.length + ' people are working past exhaustion. Someone is going to get hurt.'
                 : exaustos.length + ' pessoas estão trabalhando além da exaustão. Alguém vai se machucar.');
    } else if (exaustos.length === 1) {
      out.push(e ? prim(exaustos[0]) + ' has not slept properly in days and will not say so.'
                 : prim(exaustos[0]) + ' não dorme direito há dias e não vai falar nada.');
    }

    var quebrados = vs.filter(function (c) { return c.moral < 25; });
    if (quebrados.length) {
      var q = quebrados[0];
      out.push(e ? prim(q) + ' has stopped talking at meals. Moreau noticed.'
                 : prim(q) + ' parou de falar nas refeições. Moreau reparou.');
    }

    var famintos = vs.filter(function (c) { return c.fome > 75; });
    if (famintos.length >= 4) {
      out.push(e ? 'Hunger is visible now — in how slowly people stand up.'
                 : 'A fome já é visível — na lentidão com que as pessoas levantam.');
    }

    /* o CO₂ cobra de quem tem menos margem */
    var brandt = vs.filter(function (c) { return c.id === 'brandt'; })[0];
    if (brandt && brandt.saude < 60 && st.sol % 7 === 0) {
      out.push(e ? 'Brandt stopped halfway across the yard to catch his breath. He pretended to check a strut.'
                 : 'Brandt parou no meio do pátio para recuperar o fôlego. Fingiu conferir uma escora.');
    }

    /* alguém prestes a evoluir — mostra que as pessoas mudam */
    for (var i = 0; i < vs.length; i++) {
      var c = vs[i];
      for (var k in c.xp) {
        var atual = c.per[k] || 0, custo = 14 + atual * 11;
        if (c.xp[k] > custo * 0.85 && atual < 10 && out.length < 4) {
          out.push(e ? prim(c) + ' is getting genuinely good at ' + EL.PERICIAS[k].toLowerCase() + '.'
                     : prim(c) + ' está ficando realmente bom em ' + EL.PERICIAS[k].toLowerCase() + '.');
          i = vs.length; break;
        }
      }
    }

    /* nada de ruim acontecendo: diga isso também, senão o silêncio parece bug */
    if (!out.length) {
      var bons = [
        [ 'Sol sem novidade. Na Planície de Cinzas, isso é uma boa notícia.',
          'A sol with nothing to report. On the Ashfall Plains, that is good news.' ],
        [ 'Todo mundo trabalhou, todo mundo comeu, ninguém se machucou.',
          'Everyone worked, everyone ate, nobody got hurt.' ],
        [ 'A colônia funcionou. Só isso, e já é muito.',
          'The colony simply worked. That is all, and it is a lot.' ]
      ];
      out.push(bons[st.sol % bons.length][en() ? 1 : 0]);
    }
    return out.slice(0, 3);
  }

  /* ---------- o que aconteceu neste sol, em ordem de importância ---------- */
  var PESO = { evt: 5, bad: 4, good: 3, warn: 2, info: 1, '': 0 };

  function acontecimentos(st) {
    var linhas = st.log.filter(function (l) { return l.sol === st.sol && l.tipo !== 'sol'; });
    linhas = linhas.slice().sort(function (a, b) { return (PESO[b.tipo] || 0) - (PESO[a.tipo] || 0); });
    return linhas.slice(0, 5);
  }

  /* ---------- o que está prestes a acontecer ---------- */
  function tensao(st, R) {
    var e = en(), t = [];
    if (R.diasAgua < 8) {
      t.push([e ? 'Water runs out in ' + R.diasAgua.toFixed(0) + ' sols.'
                : 'A água acaba em ' + R.diasAgua.toFixed(0) + ' sols.', 'crit']);
    } else if (R.diasAgua < 30 && R.aguaNet < 0) {
      /* o poço secando devagar matava colônias inteiras sem nunca aparecer na tela */
      t.push([e ? 'The reserve is shrinking every sol: ' + R.diasAgua.toFixed(0) + ' sols of water left.'
                : 'A reserva encolhe todo sol: restam ' + R.diasAgua.toFixed(0) + ' sols de água.', 'warn']);
    }
    if (R.diasComida < 10) t.push([e ? 'Food runs out in ' + R.diasComida.toFixed(0) + ' sols.'
                                     : 'A comida acaba em ' + R.diasComida.toFixed(0) + ' sols.', 'crit']);
    if (R.balanco < 0 && st.energia.armazenada < Math.abs(R.balanco) * 6)
      t.push([e ? 'The battery will not last the week at this drain.'
                : 'A bateria não passa da semana nesse ritmo.', 'crit']);
    if (R.abrigoDeficit > 0 && st.clima.tempMin < 2) {
      var nsa = Math.ceil(R.abrigoDeficit);
      t.push([e ? (nsa === 1 ? '1 person sleeps' : nsa + ' people sleep') + ' outside tonight, at ' + st.clima.tempMin + '°C.'
                : (nsa === 1 ? '1 pessoa dorme' : nsa + ' pessoas dormem') + ' ao relento hoje, a ' + st.clima.tempMin + '°C.', 'crit']);
    }
    if (st.clima.estacao === 'verdejo' && st.clima.mare > 7.6)
      t.push([e ? 'The compound tide is rising. The Ferrun is swelling.'
                : 'A maré composta está subindo. O Ferrun engorda.', 'warn']);
    /* pesquisar sem bancada rende quase nada e não dava nenhum sinal */
    if (R.labSlots <= 0 && st.tech.ativa && st.tech.ativa.length) {
      t.push([e ? 'No working laboratory: research is crawling.'
                : 'Nenhum laboratório de pé: a pesquisa mal anda.', 'crit']);
    }
    /* meia ração esquecida é o erro silencioso mais caro do jogo */
    if (st.politica.racaoComida < 0.95 && R.diasComida > 40) {
      var pc = Math.round(st.politica.racaoComida * 100);
      t.push([e ? 'Still eating at ' + pc + '% rations with ' + R.diasComida.toFixed(0) + ' sols of food stored.'
                : 'Ainda comendo ' + pc + '% da ração, com ' + R.diasComida.toFixed(0) + ' sols de comida no silo.', 'warn']);
    }
    if (st.clima.solAno > 285 && st.clima.solAno < 302)
      t.push([e ? 'Gelid begins in ' + (302 - st.clima.solAno) + ' sols.'
                : 'O Gélido começa em ' + (302 - st.clima.solAno) + ' sols.', 'warn']);
    return t.slice(0, 3);
  }

  /* ---------- render ---------- */
  function html(st, R) {
    if (st.sol < 2) return '';
    var e = en();
    var h = '<div class="cron">';
    h += '<div class="cron-h"><span class="cron-sol">' + (e ? 'SOL ' : 'SOL ') + st.sol + '</span>' +
         '<span class="cron-est">' + esc(st.clima.estacaoNome) + ' ' + st.clima.solAno + '</span></div>';

    h += '<p class="cron-ceu">' + esc(cabecalho(st)) + '</p>';

    var ac = acontecimentos(st);
    if (ac.length) {
      h += '<div class="cron-ac">';
      ac.forEach(function (l) { h += '<div class="ca ' + l.tipo + '">' + esc(l.txt) + '</div>'; });
      h += '</div>';
    }

    var ps = pessoas(st);
    if (ps.length) {
      h += '<div class="cron-p">';
      ps.forEach(function (p) { h += '<div>' + esc(p) + '</div>'; });
      h += '</div>';
    }

    var tn = tensao(st, R);
    if (tn.length) {
      h += '<div class="cron-t">';
      tn.forEach(function (t) { h += '<span class="tn ' + t[1] + '">' + esc(t[0]) + '</span>'; });
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  return { html: html, pessoas: pessoas, cabecalho: cabecalho };
})();
