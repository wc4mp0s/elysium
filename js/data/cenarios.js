/* PROJECT ELYSIUM — cenários nomeados.
   Cada um é uma partida inteira com uma restrição própria e uma condição de vitória
   diferente. Nenhum deles mexe no motor: todos são só um estado inicial diferente. */
var EL = window.EL || {}; window.EL = EL;

EL.CENARIOS = [
{ id:'queda', n:'A Queda', dif:'facil', ordem:1,
  d:'O cenário original. A NAV Perseverança caiu na Planície de Cinzas com vinte sobreviventes, quarenta sols de comida e trinta e um de água.',
  objetivo:'Terraformação atmosférica com 40 habitantes.',
  dica:'Água antes de tudo. Depois canteiros, e mais canteiros do que parece necessário.',
  mods:null, vitoria:null },

{ id:'inverno', n:'O Inverno de Ferro', dif:'normal', ordem:2,
  d:'A nave caiu no início do Gélido. Cem sols de neve pela frente, mínimas de −24 °C, o Ferrun congelado nas margens e nenhuma lavoura possível a céu aberto.',
  objetivo:'Sobreviver até o fim do Gélido — sol 402 — com pelo menos 12 pessoas.',
  dica:'Aquecimento consome tudo. Abrigo isolado e energia antes de qualquer outra coisa.',
  mods: function (st) {
    st.sol = 302; st.ano = 1;
    st.mat.comida = 1100; st.mat.agua = 2400;   // caíram com mais reserva, e vão precisar
    st.mat.sucata = 400; st.mat.biomassa = 600;
  },
  vitoria: function (st) { return st.sol >= 402 && EL.Sim.vivos(st).length >= 12; } },

{ id:'sozinho', n:'Sozinho', dif:'normal', ordem:3,
  d:'O impacto abriu a seção 3. Quinze pessoas morreram. Restaram cinco — e os suprimentos de vinte.',
  objetivo:'Chegar a 12 habitantes. Só existe um jeito, e ele leva muitos sols.',
  dica:'Cinco pessoas não constroem uma colônia. Elas constroem as condições para nascer uma.',
  mods: function (st) {
    var ficam = ['vosk','nakamura','petrov','okonkwo','brandt'];
    st.crew.forEach(function (c) {
      if (ficam.indexOf(c.id) < 0) {
        c.vivo = false;
        st.mortos.push({ nome:c.nome, func:c.func, causa:EL.trCausa('Esmagamento, seção 4'), sol:0 });
      }
    });
    st.crew.forEach(function (c) { if (c.vivo) { c.moral = Math.max(15, c.moral - 25); c.ferimento = null; } });
  },
  vitoria: function (st) { return EL.Sim.vivos(st).length >= 12; } },

{ id:'tanque', n:'O Tanque Rompeu', dif:'normal', ordem:4,
  d:'O reservatório principal rachou no impacto e ninguém percebeu por seis horas. Sobraram quatrocentos litros para vinte pessoas.',
  objetivo:'Produção de água renovável maior que o consumo, mantida por 30 sols seguidos.',
  dica:'Você tem menos de sete sols. Todo mundo no rio, e a cisterna é a primeira obra.',
  mods: function (st) {
    st.mat.agua = 400;
    st.mat.comida = 1000;                       // comida sobrando não ajuda quem morre de sede
    st.agua.recicladorDano = 0.08;
  },
  vitoria: function (st) { return (st.aguaEstavel || 0) >= 30; } },

{ id:'tabula', n:'Tabula Rasa', dif:'normal', ordem:5,
  d:'A biblioteca científica queimou. Sobraram fragmentos, memória humana e a capacidade de deduzir. Tudo custa o dobro para descobrir.',
  objetivo:'Gerar eletricidade. Do zero, sem manual.',
  dica:'Concentre a pesquisa. Com metade da velocidade, dividir projetos é fatal.',
  mods: function (st) {
    st.bonus.pesquisa = 0.5;
    st.mat.sucata = 500; st.mat.polimero = 500;  // sobrou material, faltou conhecimento
    EL.logar(st, 'A biblioteca científica queimou na seção 2. Antonova passou a manhã tentando salvar alguma coisa. Não salvou.', 'bad');
  },
  vitoria: function (st) { return EL.Sim.tem(st, 'eletricidade'); } },

{ id:'anomalia', n:'A Anomalia Primeiro', dif:'normal', ordem:6,
  d:'O KITE avistou as linhas de I7 no primeiro sobrevoo. Metade da tripulação quer entender aquilo antes de qualquer outra coisa. A outra metade quer comer.',
  objetivo:'Ler o arquivo da Anomalia antes do sol 250.',
  dica:'Exige metalurgia, rádio, computação e supercondutores. Nessa ordem, e depressa.',
  mods: function (st) {
    st.setores['I7'].explorado = 65;
    st.mat.comida = 1000;
    EL.logar(st, 'O primeiro sobrevoo já trouxe as linhas de I7. Ninguém consegue falar de outra coisa.', 'info');
  },
  vitoria: function (st) { return st.flags.anomalia === 6 && st.sol <= 250; } },

{ id:'enxame', n:'A Estação da Poeira', dif:'normal', ordem:7,
  d:'A nave caiu no meio do Cinzeiro. Tempestades de poeira, ventos de 90 km/h, painéis solares inúteis e o enxame-mandíbula a caminho.',
  objetivo:'Colher 2.500 rações antes do fim do Cinzeiro.',
  dica:'Solar não vai te salvar aqui. Vento e biomassa, sim.',
  mods: function (st) {
    st.sol = 201; st.ano = 1;
    st.mat.comida = 950; st.mat.sucata = 350;
    st.energia.sujeira = 0.35;
  },
  vitoria: function (st) { return (st.colhidoTotal || 0) >= 2500; } },

{ id:'geracao', n:'A Segunda Geração', dif:'normal', ordem:8,
  d:'Nada de errado com o pouso. O problema é o objetivo: esta colônia não quer sobreviver, quer continuar.',
  objetivo:'Chegar a 25 habitantes, com pelo menos 5 nascidos em Elysium.',
  dica:'Nascimento exige moral alta, comida sobrando e medicina. Nessa ordem.',
  mods: null,
  vitoria: function (st) { return EL.Sim.vivos(st).length >= 25 && st.stats.nascidos >= 5; } },

{ id:'livre', n:'Colônia Livre', dif:'livre', ordem:9, sandbox:true,
  d:'Sem mortes, sem catástrofe, recursos folgados. Para construir a cidade inteira e ver a árvore tecnológica até o fim, sem pressa.',
  objetivo:'Nenhum. Construa o que quiser.',
  dica:'Não conta para o Desafio Diário nem destrava o Arquivo — senão os dois perderiam o sentido.',
  mods: function (st) {
    st.sandbox = true;
    st.mat.agua = 12000; st.mat.comida = 6000;
    st.mat.sucata = 3000; st.mat.pedra = 4000; st.mat.argila = 3000;
    st.mat.fibra = 1500; st.mat.biomassa = 2000; st.mat.semente = 60;
    st.energia.capacidadeBase = 600; st.energia.capacidade = 600; st.energia.armazenada = 600;
    st.crew.forEach(function (c) { c.ferimento = null; c.saude = 95; c.moral = 80; c.fadiga = 10; });
    EL.logar(st, 'Modo Colônia Livre: ninguém morre e nada catastrófico acontece. Construa.', 'info');
  },
  vitoria: null }
];

EL.cenarioPorId = function (id) {
  for (var i = 0; i < EL.CENARIOS.length; i++) if (EL.CENARIOS[i].id === id) return EL.CENARIOS[i];
  return null;
};

/* Cria a partida de um cenário. */
EL.novoCenario = function (id, seedStr) {
  var c = EL.cenarioPorId(id);
  if (!c) return null;
  var st = EL.novoJogo(seedStr || ('ELYSIUM-' + c.id), c.dif);
  st.cenario = c.id;
  if (c.mods) c.mods(st);
  // o clima precisa refletir o sol inicial de cenários que começam em outra estação
  var rng = EL.RNG.make(st.rngState);
  st.clima = EL.Clima.gerar(st, rng);
  st.rngState = rng.state;
  EL.logar(st, '▣ CENÁRIO: ' + c.n + ' — ' + c.objetivo, 'evt');
  return st;
};
