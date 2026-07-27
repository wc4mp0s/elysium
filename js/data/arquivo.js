/* PROJECT ELYSIUM — Arquivo da Colônia.
   O que sobra quando a colônia acaba. Destrava entre partidas e nunca se perde.
   Conhecimento, não poder: nada aqui deixa o jogo mais fácil. */
var EL = window.EL || {}; window.EL = EL;

EL.ARQUIVO = [
/* ---------------- TRIPULAÇÃO ---------------- */
{id:'a_vosk', cat:'Tripulação', t:'Caderno de Alina Vosk', cond:{sol:1},
 d:'"Escrevo isto porque o Capitão Ness escrevia. Ele dizia que um comando que não registra nada não é um comando, é uma opinião com autoridade.\\n\\nEu era a segunda oficial. Segunda. Ninguém me elegeu. Vinte pessoas acordaram hoje esperando que eu soubesse o que fazer, e eu passei quarenta minutos dentro da seção 2 fingindo verificar um painel que eu sei que está morto."'},

{id:'a_lindqvist', cat:'Tripulação', t:'A planilha de Freya Lindqvist', cond:{sol:12},
 d:'Ela recalcula as calorias todas as noites, depois que os outros dormem. A planilha tem uma coluna que ninguém mais viu: a data projetada em que a última ração acaba.\\n\\nEla atualiza esse número há doze sols. Ele já subiu duas vezes e desceu nove.'},

{id:'a_watanabe', cat:'Tripulação', t:'A soldagem de Kenji Watanabe', cond:{marco:'metal'},
 d:'Yuki Tanabe morreu no incêndio da seção 4. Kenji voltou duas vezes para tentar tirá-la. Na terceira, Deng o derrubou e o segurou no chão até o teto ceder.\\n\\nEle não fala sobre isso. Solda. Solda melhor do que qualquer pessoa que já pisou neste planeta, e solda quatorze horas por sol quando deixam.'},

{id:'a_brandt', cat:'Tripulação', t:'O pulmão de Elias Brandt', cond:{sol:60},
 d:'Fibrose pulmonar. Oitenta por cento de capacidade quando saiu da Terra. Aqui, com 1,2% de CO₂ no ar, oitenta por cento vira algo perto de sessenta.\\n\\nEle sabe. Nakamura sabe. Ninguém disse a Aduba, que trabalha ao lado dele todos os dias e ainda acha que o velho vai ensiná-lo a fazer tudo.'},

{id:'a_aduba', cat:'Tripulação', t:'Samuel Aduba, 22 anos', cond:{marco:'primeiraColheita'},
 d:'Entrou na missão para carregar caixas. Não tinha especialização nenhuma — o formulário dizia "auxiliar geral", que é como se escreve "ninguém perguntou".\\n\\nEle aprende mais rápido que todos os outros dezenove. Numa colônia que não pode importar mais ninguém, isso não é uma curiosidade: é a única fábrica de especialistas que existe.'},

{id:'a_moreau', cat:'Tripulação', t:'Isabel Moreau atende dezenove pessoas', cond:{sol:40},
 d:'Nas primeiras seis horas depois do pouso ela atendeu dezenove pessoas. Não atendeu a vigésima.\\n\\nNão existe psicólogo para o psicólogo a 22,7 anos-luz da Terra. Existe uma cadeira atrás do armazém onde ela senta às vezes, e todo mundo já aprendeu a passar longe dali.'},

{id:'a_antonova', cat:'Tripulação', t:'O projeto de Larisa Antonova', cond:{tec:'eletricidade'},
 d:'Desenhado nas costas de folhas de inventário, a lápis, com régua improvisada. Um reator de fissão de água pressurizada, completo, com o circuito secundário e tudo.\\n\\nFaltam trinta anos-luz de indústria para construí-lo. O projeto está correto mesmo assim. Ela o guarda enrolado dentro de um tubo de amostra e não deixa ninguém tocar.'},

{id:'a_diop', cat:'Tripulação', t:'O silêncio de Amara Diop', cond:{tec:'computacao'},
 d:'Ela escreveu o núcleo de navegação da Perseverança. Aquele que falhou.\\n\\nNinguém nunca disse que a culpa foi dela — a análise apontou falha estrutural, não de software. Ela leu a análise. Continua não falando sobre isso.'},

/* ---------------- ESPÉCIES ---------------- */
{id:'e_ceifeiro', cat:'Espécies', t:'Ceifeiro', cond:{evento:'ceifeiros'},
 d:'Predador de matilha, ~90 kg, noturno. Caça em grupos de quatro a sete, com um padrão de cerco que Deng descreveu como "tático, e isso me incomoda mais do que os dentes".\\n\\nNão tem olhos na posição que esperaríamos. Tem quatro fossas termossensíveis. Ele não vê você: ele vê seu calor, e você está a 37 °C num planeta que passa a noite a −6.'},

{id:'e_espora', cat:'Espécies', t:'Fungo espora-cinza', cond:{sol:30},
 d:'Ubíquo. Inofensivo para tecido vivo — e devastador para tudo que veio conosco.\\n\\nEle digere polímeros sintéticos. Vedantes, isolamento, membrana de reciclador, lona de tenda. Não é um ataque: é só que a única coisa neste planeta que se parece com comida fácil somos nós e nossos plásticos.'},

{id:'e_rastejante', cat:'Espécies', t:'Rastejante-de-placas', cond:{tec:'caca'},
 d:'Quatrocentos quilos de herbívoro blindado que se move a 3 km/h e não tem predador natural conhecido.\\n\\nA carne é intragável — proteínas de quiralidade incompatível. O couro é excelente. O osso é melhor ainda. E ele deixa você chegar a quatro metros antes de sequer levantar a cabeça, o que diz muito sobre quanto tempo faz que nada o caça.'},

{id:'e_morcego', cat:'Espécies', t:'Morcego-eco das Cavernas de Kore', cond:{evento:'cavernas_desc'},
 d:'Milhões deles. Sessenta metros de guano fóssil acumulados por um tempo que Zhao estimou em "centenas de milhares de anos, no mínimo".\\n\\nNitrato e fosfato: exatamente os dois nutrientes que faltam ao loess vulcânico da planície. A caverna que quase nos matou de CO₂ é também a razão de termos lavoura.'},

{id:'e_erva', cat:'Espécies', t:'Erva-de-nitro', cond:{marco:'primeiraColheita'},
 d:'Cresce a oitocentos metros da base e fixa nitrogênio atmosférico com uma eficiência que Raghavan chamou de "constrangedora para as leguminosas terrestres".\\n\\nEstava ali desde o primeiro sol. Passamos vinte e seis sols morrendo de fome ao lado dela antes de alguém pensar em analisá-la.'},

{id:'e_peixe', cat:'Espécies', t:'Peixe-lanterna de Thalassa', cond:{evento:'peixe_teste'},
 d:'Cardumes densos, bioluminescentes, na plataforma continental. A questão nunca foi pescá-los: foi se podemos comê-los.\\n\\nA bioquímica local usa açúcares não-canônicos. Metade das amostras deu citotóxica em cultura. A outra metade não deu nada. Esse tipo de resultado é o pior de todos, porque não decide nada e alguém vai acabar decidindo com o próprio estômago.'},

{id:'e_enxame', cat:'Espécies', t:'Enxame-mandíbula', cond:{evento:'enxame_ev'},
 d:'Migra no Cinzeiro, todo ano, pelo mesmo corredor. Uma nuvem que muda de forma e leva quarenta minutos entre aparecer no horizonte e chegar.\\n\\nNão come plantas terrestres por nutrição — nossas proteínas não servem para ele. Ele as tritura de passagem. Perdemos a lavoura de um ano inteiro para um animal que nem estava com fome.'},

/* ---------------- PLANETA ---------------- */
{id:'p_sol', cat:'Planeta', t:'O sol de 27,4 horas', cond:{sol:20},
 d:'O corpo humano tem um relógio circadiano de aproximadamente 24 horas. Ele consegue se ajustar a variações de até uma hora, mais ou menos. Três horas e vinte e quatro minutos está muito além disso.\\n\\nO resultado não é insônia: é um desalinhamento permanente. Erro de julgamento, irritabilidade, microssonos durante o trabalho. Ninguém em Elysium jamais dormiu uma noite realmente boa, e ninguém jamais vai.'},

{id:'p_co2', cat:'Planeta', t:'1,2% de CO₂', cond:{sol:15},
 d:'Doze mil partes por milhão. Trinta vezes a atmosfera terrestre.\\n\\nNão mata. Dá dor de cabeça, sonolência e uma queda mensurável de desempenho cognitivo que a tripulação inteira carrega desde o primeiro sol. Toda decisão tomada neste planeta foi tomada por alguém funcionando a 92%.'},

{id:'p_kore', cat:'Planeta', t:'Kore e Ilex', cond:{evento:'visita_kore'},
 d:'Duas luas. Kore com 0,7 massa lunar num período de 19 sols; Ilex, um asteroide capturado, em 3,1.\\n\\nQuando alinham, a maré composta do Thalassa chega a 11 metros e o Ferrun literalmente para de correr por algumas horas. A primeira vez que aconteceu, metade da colônia achou que era o fim do mundo. Era terça-feira.'},

{id:'p_vesper', cat:'Planeta', t:'Vesper, anã laranja', cond:{evento:'flare'},
 d:'K3V. Sessenta e dois por cento da massa do Sol, quatorze por cento da luminosidade.\\n\\nAnãs laranja são estrelas de fulguração. A cada poucas semanas ela cospe uma classe X, o céu fica verde por quarenta minutos, e tudo que não estiver blindado morre. O campo magnético do planeta tem 60% do terrestre. Não é proteção: é um atraso.'},

{id:'p_loess', cat:'Planeta', t:'O loess da Planície de Cinzas', cond:{tec:'analise_solo'},
 d:'pH 8,4. Salino. Praticamente sem nitrogênio, sem fósforo e com 3% de matéria orgânica.\\n\\nÉ pó vulcânico depositado pelo vento durante um tempo geológico inteiro, sem nunca ter sido tocado por uma raiz. Não é solo ruim. Não é solo: é mineral moído esperando que alguém invente a biologia.'},

{id:'p_isolamento', cat:'Planeta', t:'22,7 anos-luz', cond:{sol:90},
 d:'O transmissor interestelar foi pulverizado no impacto. Mesmo intacto, a mensagem levaria 22,7 anos para chegar e a resposta, outros 22,7.\\n\\nAlguém deixou o receptor de longo alcance ligado uma noite, apontado para casa. Vinte e dois anos-luz de estática. Todos ouviram. Ninguém comentou no café da manhã.'},

/* ---------------- ANOMALIA ---------------- */
{id:'x_1', cat:'Anomalia', t:'Setor I7 — as linhas', cond:{flagAnomalia:1},
 d:'Trinta quilômetros a leste-sudeste. Linhas retas de 200 a 900 metros sob a vegetação, visíveis apenas na varredura multiespectral.\\n\\nNenhum processo geológico conhecido produz ângulos retos nessa escala. Zhao passou quatro sols tentando explicá-los como fraturas colunares e desistiu.'},

{id:'x_2', cat:'Anomalia', t:'A liga', cond:{flagAnomalia:2},
 d:'Reyes levou onze sols com a amostra.\\n\\nA razão isotópica do ferro não corresponde a nada deste sistema estelar. Isotopia é assinatura de origem — ferro formado numa nuvem molecular carrega as proporções daquela nuvem para sempre.\\n\\nSeja lá quem construiu aquilo, também chegou de fora.'},

{id:'x_3', cat:'Anomalia', t:'Doze pulsos', cond:{flagAnomalia:3},
 d:'Doze pulsos. Pausa de 41 segundos. Doze pulsos. Sem variação, sem modulação, sem erro.\\n\\nA deriva de frequência do oscilador permite datá-lo: está transmitindo, ininterruptamente, há cerca de 400 mil anos. Homo sapiens ainda não existia quando aquilo foi ligado.'},

{id:'x_4', cat:'Anomalia', t:'O índice', cond:{flagAnomalia:4},
 d:'Diop passou dezoito sols com os pulsos e não pediu ajuda a ninguém, como sempre.\\n\\nNão é linguagem. É um índice: três conjuntos de coordenadas relativas ao próprio emissor. Não estão dizendo nada. Estão apontando.'},

{id:'x_6', cat:'Anomalia', t:'O arquivo', cond:{flagAnomalia:6},
 d:'Não era um templo nem uma arma. Era um registro.\\n\\nEles também caíram aqui. Também eram poucos. Também não tinham como voltar. Duraram onze mil anos: construíram cidades, saíram do planeta, e então pararam.\\n\\nA última entrada não explica por quê. Descreve um inverno, uma decisão tomada em assembleia, e o desligamento voluntário dos reatores.\\n\\nO emissor de doze pulsos nunca foi um pedido de socorro. Era um aviso de que alguém esteve aqui, deixado para quem viesse depois.\\n\\nAgora somos nós.'},

/* ---------------- MARCOS ---------------- */
{id:'m_agua', cat:'Marcos', t:'A primeira água que não veio da nave', cond:{marco:'autoAgua'},
 d:'Trinta e quatro metros abertos a pá, escoramento de pedra e um balde amarrado em fibra de junco-lâmina.\\n\\nA colônia parou de depender de um tanque com data de validade e passou a depender de um aquífero de basalto com alguns milhões de anos de reserva. Foi o sol em que Elysium deixou de ser um acampamento.'},

{id:'m_ferro', cat:'Marcos', t:'A primeira barra de ferro', cond:{marco:'metal'},
 d:'Feia, porosa, cheia de escória. Watanabe tirou a esponja da bloomery e martelou até virar barra.\\n\\nÉ o primeiro metal fundido por seres humanos neste planeta. Petrov a guardou. Ninguém vai usá-la nunca.'},

{id:'m_colheita', cat:'Marcos', t:'A primeira colheita', cond:{marco:'primeiraColheita'},
 d:'Batata. Pequena, irregular, crescida em loess corrigido com cal e guano de morcego-eco.\\n\\nOkonkwo pesou três vezes porque não acreditou, e depois não conseguiu falar durante o jantar inteiro. Comida nascida em Elysium. Não trazida: nascida.'},

{id:'m_nascimento', cat:'Marcos', t:'A primeira pessoa de Elysium', cond:{marco:'nascimento'},
 d:'Vinte e duas horas de trabalho de parto, com Nakamura e Moreau na sala.\\n\\nNunca viu a Terra e nunca vai ver. Nasceu a 1,06 g, respirando 1,2% de CO₂, num dia de 27,4 horas — e para ela nada disso vai parecer estranho, porque é tudo que existe.\\n\\nA colônia deixou de ser uma tripulação e virou um povo.'},

{id:'m_terraform', cat:'Marcos', t:'O ar começa a mudar', cond:{marco:'terraformacao'},
 d:'A leitura de CO₂ caiu abaixo de 1,1% pela primeira vez em registro.\\n\\nVai levar séculos até chegar a 0,4%. Ninguém que assinou o projeto vai respirar o resultado. Assinaram mesmo assim, o que talvez seja a coisa mais humana que aconteceu neste planeta.'}
];

/* ================= ESTADO PERSISTENTE ================= */
EL.Arquivo = (function () {
  var CHAVE = 'elysium_arquivo';

  function ler() {
    try {
      var a = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (!a || typeof a !== 'object') a = {};
      a.entradas = a.entradas || {};
      a.partidas = a.partidas || 0;
      a.melhorSol = a.melhorSol || 0;
      a.totalSols = a.totalSols || 0;
      a.totalMortos = a.totalMortos || 0;
      return a;
    } catch (e) { return { entradas:{}, partidas:0, melhorSol:0, totalSols:0, totalMortos:0 }; }
  }
  function gravar(a) { try { localStorage.setItem(CHAVE, JSON.stringify(a)); } catch (e) {} }

  function destravado(id) { return !!ler().entradas[id]; }
  function total() { return EL.ARQUIVO.length; }
  function quantos() { return Object.keys(ler().entradas).length; }

  /* Verifica quais entradas a partida atual destrava. Devolve as novas. */
  function verificar(st) {
    var a = ler(), novas = [];
    var marcos = (st.marcos || []).map(function (m) { return m.id; });
    var eventosVistos = st.eventosCd || {};
    var anom = typeof st.flags.anomalia === 'number' ? st.flags.anomalia : 0;

    EL.ARQUIVO.forEach(function (e) {
      if (a.entradas[e.id]) return;
      var c = e.cond, ok = false;
      if (c.sol && st.sol >= c.sol) ok = true;
      if (c.marco && marcos.indexOf(c.marco) >= 0) ok = true;
      if (c.tec && st.tech.feitas.indexOf(c.tec) >= 0) ok = true;
      if (c.evento && eventosVistos[c.evento]) ok = true;
      if (c.flagAnomalia && anom >= c.flagAnomalia) ok = true;
      if (ok) { a.entradas[e.id] = { sol: st.sol }; novas.push(e); }
    });
    if (novas.length) gravar(a);
    return novas;
  }

  /* Fecha a contabilidade de uma partida encerrada. */
  function registrarPartida(st) {
    var a = ler();
    a.partidas++;
    a.totalSols += st.sol;
    a.totalMortos += st.mortos.length;
    if (st.sol > a.melhorSol) a.melhorSol = st.sol;
    gravar(a);
    return a;
  }

  return { ler:ler, destravado:destravado, total:total, quantos:quantos,
           verificar:verificar, registrarPartida:registrarPartida };
})();
