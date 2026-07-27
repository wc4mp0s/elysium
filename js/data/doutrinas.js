/* PROJECT ELYSIUM — doutrinas.
   A pesquisa era uma fila: você escolhia o próximo item e, no fim, pegava tudo.
   Sem custo de oportunidade não existe estratégia — só ordem.
   Aqui, três vezes na partida, a colônia escolhe um caminho e fecha os outros
   para sempre. É o que faz duas colônias serem diferentes uma da outra. */
var EL = window.EL || {}; window.EL = EL;

EL.DOUTRINAS = [
{
  id: 'sobreviver', ordem: 1,
  cond: function (st) { return st.tech.feitas.length >= 5 && st.sol >= 25; },
  t: 'COMO ESTA COLÔNIA VAI SOBREVIVER',
  d: 'Vosk convocou todo mundo. Não é uma decisão técnica: é sobre onde a colônia vai gastar a atenção que não tem de sobra. ' +
     'O que for escolhido aqui vai moldar os próximos duzentos sols, e o que não for escolhido não volta.',
  ops: [
    { id:'terra', n:'A TERRA',
      d:'Apostar no solo. Corrigir o loess, entender a bioquímica local, fazer o planeta alimentar a gente.',
      bom:['Colheita +30%','Canteiros custam metade','Doenças de água −25%'],
      ruim:['Construção −12%','Fabricação −12%'],
      ef:function(st){ st.bonus.colheita=(st.bonus.colheita||1)*1.30; st.bonus.canteiroBarato=true;
        st.bonus.doenca=(st.bonus.doenca||1)*0.75;
        st.bonus.construcao=(st.bonus.construcao||1)*0.88; st.bonus.fabricacao=(st.bonus.fabricacao||1)*0.88; } },
    { id:'maquina', n:'A MÁQUINA',
      d:'Apostar no metal. Ferramenta boa, forja cedo, estrutura antes de conforto. O planeta que se adapte.',
      bom:['Construção +25%','Fabricação +25%','ATLAS-1 desgasta 40% menos'],
      ruim:['Colheita −12%','Moral cai mais rápido'],
      ef:function(st){ st.bonus.construcao=(st.bonus.construcao||1)*1.25; st.bonus.fabricacao=(st.bonus.fabricacao||1)*1.25;
        st.bonus.roboDesgaste=0.6;
        st.bonus.colheita=(st.bonus.colheita||1)*0.88; st.bonus.moral=(st.bonus.moral||0)-4; } },
    { id:'agua', n:'A ÁGUA',
      d:'Apostar no ciclo. Poço, filtragem, reciclagem fechada. Nenhuma colônia morre de sede duas vezes.',
      bom:['Água produzida +35%','Reciclagem +10 pontos','Doenças −50%'],
      ruim:['Pesquisa −10%','Construção −8%'],
      ef:function(st){ st.bonus.agua=(st.bonus.agua||1)*1.35; st.agua.recicladorBase+=0.10;
        st.bonus.doenca=(st.bonus.doenca||1)*0.5;
        st.bonus.pesquisa=(st.bonus.pesquisa||1)*0.90; st.bonus.construcao=(st.bonus.construcao||1)*0.92; } }
  ]
},
{
  id: 'crescer', ordem: 2,
  cond: function (st) { return st.tech.feitas.length >= 16; },
  t: 'COMO ESTA COLÔNIA VAI CRESCER',
  d: 'São vinte e poucas pessoas com um planeta inteiro pela frente e nenhuma reposição vindo de fora. ' +
     'A pergunta não é mais como não morrer: é o que fazer com o pouco tempo que cada um tem.',
  ops: [
    { id:'especialistas', n:'ESPECIALISTAS',
      d:'Poucos sabendo muito. Cada um vira o melhor do planeta na sua área — e insubstituível nela.',
      bom:['Pesquisa +40%','Perícia alta rende mais'],
      ruim:['Ensino −50%','Perder alguém dói o dobro'],
      ef:function(st){ st.bonus.pesquisa=(st.bonus.pesquisa||1)*1.40; st.bonus.periciaAlta=1.15;
        st.bonus.ensino=(st.bonus.ensino||1)*0.5; st.bonus.lutoDobrado=true; } },
    { id:'generalistas', n:'GENERALISTAS',
      d:'Todos sabendo o suficiente. Ninguém é insubstituível, e ninguém é excepcional.',
      bom:['Ensino +120%','Aprendizado 2× mais rápido','Perder alguém dói metade'],
      ruim:['Pesquisa −18%'],
      ef:function(st){ st.bonus.ensino=(st.bonus.ensino||1)*2.2; st.bonus.aprendizado=2;
        st.bonus.lutoMetade=true; st.bonus.pesquisa=(st.bonus.pesquisa||1)*0.82; } },
    { id:'automatos', n:'AUTÔMATOS',
      d:'Deixar o trabalho pesado para as máquinas e aceitar o que isso faz com quem sobra.',
      bom:['Fadiga acumula 35% menos','Robôs 60% mais eficientes','Construção +15%'],
      ruim:['Moral base menor','Ensino −25%'],
      ef:function(st){ st.bonus.fadiga=(st.bonus.fadiga||1)*0.65; st.bonus.robo=1.6;
        st.bonus.construcao=(st.bonus.construcao||1)*1.15;
        st.bonus.moral=(st.bonus.moral||0)-6; st.bonus.ensino=(st.bonus.ensino||1)*0.75; } }
  ]
},
{
  id: 'sera', ordem: 3,
  cond: function (st) { return st.tech.feitas.length >= 32; },
  t: 'O QUE ELYSIUM VAI SER',
  d: 'A colônia não corre mais risco de acabar amanhã. O que ela vai virar, porém, ainda não está decidido — ' +
     'e a partir daqui as decisões deixam de ser sobre esta geração.',
  ops: [
    { id:'cidade', n:'UMA CIDADE',
      d:'Gente. Casas, escolas, praças, filhos. Uma colônia que quer durar mais que os seus fundadores.',
      bom:['Moral base +12','Nascimentos muito mais prováveis','Ensino +50%'],
      ruim:['Pesquisa −12%','Defesa −20%'],
      ef:function(st){ st.bonus.moral=(st.bonus.moral||0)+12; st.bonus.natalidade=2.4;
        st.bonus.ensino=(st.bonus.ensino||1)*1.5;
        st.bonus.pesquisa=(st.bonus.pesquisa||1)*0.88; st.bonus.defesa=0.8; } },
    { id:'fortaleza', n:'UMA FORTALEZA',
      d:'Muralha, sensores, reserva lacrada, redundância. Este planeta já tentou nos matar de seis maneiras.',
      bom:['Risco de evento −45%','Defesa +80%','Prédios duram o dobro'],
      ruim:['Moral base −5','Pesquisa −15%'],
      ef:function(st){ st.bonus.risco=(st.bonus.risco||1)*0.55; st.bonus.defesa=1.8; st.bonus.desgaste=0.5;
        st.bonus.moral=(st.bonus.moral||0)-5; st.bonus.pesquisa=(st.bonus.pesquisa||1)*0.85; } },
    { id:'farol', n:'UM FAROL',
      d:'Saber. Se alguém vier depois, que encontre uma biblioteca em vez de ruínas — como nós encontramos.',
      bom:['Pesquisa +65%','PP por descoberta dobrado','Arquivo destrava mais rápido'],
      ruim:['Produção de campo −15%','Risco de evento +20%'],
      ef:function(st){ st.bonus.pesquisa=(st.bonus.pesquisa||1)*1.65; st.bonus.ppDescoberta=2;
        st.bonus.trabalho=(st.bonus.trabalho||1)*0.85; st.bonus.risco=(st.bonus.risco||1)*1.2; } }
  ]
}
];

EL.Doutrinas = (function () {

  function porId(id) {
    for (var i = 0; i < EL.DOUTRINAS.length; i++) if (EL.DOUTRINAS[i].id === id) return EL.DOUTRINAS[i];
    return null;
  }

  function escolhidas(st) { return (st.doutrinas && st.doutrinas.escolhas) || {}; }

  /* Existe uma encruzilhada aberta agora? */
  function pendente(st) {
    if (st.sandbox) return null;
    st.doutrinas = st.doutrinas || { escolhas: {} };
    for (var i = 0; i < EL.DOUTRINAS.length; i++) {
      var d = EL.DOUTRINAS[i];
      if (st.doutrinas.escolhas[d.id]) continue;
      var ok = false;
      try { ok = d.cond(st); } catch (e) { ok = false; }
      if (ok) return d;
    }
    return null;
  }

  function escolher(st, doutrinaId, opId) {
    var d = porId(doutrinaId); if (!d) return 'inexistente';
    st.doutrinas = st.doutrinas || { escolhas: {} };
    if (st.doutrinas.escolhas[doutrinaId]) return 'já escolhida';
    var op = null;
    for (var i = 0; i < d.ops.length; i++) if (d.ops[i].id === opId) op = d.ops[i];
    if (!op) return 'opção inexistente';
    op.ef(st);
    st.doutrinas.escolhas[doutrinaId] = opId;
    EL.logar(st, '◆ ' + d.t + ' — ' + op.n, 'evt');
    EL.logar(st, op.d, 'good');
    return null;
  }

  /* Nome legível das doutrinas já escolhidas, para a aba Pesquisa. */
  function resumo(st) {
    var e = escolhidas(st), out = [];
    EL.DOUTRINAS.forEach(function (d) {
      if (!e[d.id]) return;
      for (var i = 0; i < d.ops.length; i++) if (d.ops[i].id === e[d.id]) out.push({ t: d.t, op: d.ops[i] });
    });
    return out;
  }

  return { porId: porId, escolhidas: escolhidas, pendente: pendente, escolher: escolher, resumo: resumo };
})();
