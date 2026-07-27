/* PROJECT ELYSIUM — eventos (56).
   peso: número ou função(st) — 0 desativa. cd: cooldown em sols.
   Alguns eventos param o jogo e exigem uma escolha sua. */
var EL = window.EL || {}; window.EL = EL;

function _vivos(st){ var o=[]; for(var i=0;i<st.crew.length;i++) if(st.crew[i].vivo) o.push(st.crew[i]); return o; }
function _tem(st,t){ return st.tech.feitas.indexOf(t)>=0; }
function _predio(st,b){ var n=0; for(var i=0;i<st.predios.length;i++) if(st.predios[i].id===b&&st.predios[i].pronto) n++; return n; }

EL.EVENTOS = [
/* ================= CLIMA E GEOLOGIA ================= */
/* ================= PRIMEIROS SOLS =================
   A maioria das colônias morre antes do sol 80. Estes acontecimentos existem para que
   ninguém termine a primeira partida achando que viu o jogo inteiro. */
{id:'primeira_noite', n:'A primeira noite', cat:'descoberta', cd:999, peso:function(st){return (st.sol>=2&&st.sol<=4)?900:0;},
 txt:'A noite aqui dura treze horas e quarenta minutos. Ninguém tinha pensado nisso. Às 19h, Kore sobe inteira sobre a cordilheira — três vezes o tamanho da Lua da Terra, com crateras visíveis a olho nu — e Ilex atravessa o disco dela em quarenta minutos.',
 efe:function(a){ a.moralAll(+6);
   a.log('Vinte pessoas em silêncio no cascalho, olhando para cima. Deng foi o único que continuou de guarda, e mesmo ele olhou.','good');
   a.log('Nakamura escreveu no diário: "É a coisa mais bonita que qualquer um de nós vai ver na vida. Não sei se isso ajuda ou piora."','info'); }},

{id:'os_quatro', n:'Os corpos na seção 4', cat:'social', cd:999, peso:function(st){return (st.sol>=3&&st.sol<=9)?150:0;},
 txt:'Ninguém decidiu o que fazer com Ness, Fashola, Kolar e Tanabe. Eles ainda estão nos destroços. Faz cinco sols. Watanabe passa por ali três vezes por dia e não entra.',
 escolhas:[
  {t:'Enterrar hoje, com cerimônia, todos presentes', d:'Custa meio sol de trabalho. A colônia precisa disso mais do que precisa de meio sol.',
   ef:function(a){ a.perdaTrabalho(0.5); a.moralAll(+11); a.st.flags.enterrados=true;
     a.log('Quatro montes de pedra a oitenta metros do casco, virados para o oeste. Vosk leu os nomes e a função de cada um. Foi só isso, e foi suficiente.','good');
     a.moralOne('watanabe',+18); }},
  {t:'Enterrar sem parar o trabalho', d:'Sem custo. Metade da colônia não vai estar presente.',
   ef:function(a){ a.moralAll(+3); a.st.flags.enterrados=true;
     a.log('Deng e Aduba cavaram durante o turno. Quando terminaram, chamaram quem estava por perto. Sete pessoas.','warn'); }},
  {t:'Deixar para depois. Há coisas mais urgentes', d:'Zero custo agora. Isto volta.',
   ef:function(a){ a.moralAll(-6); a.st.flags.naoEnterrados=a.st.sol;
     a.log('Ninguém discordou em voz alta. Watanabe parou de passar por ali.','bad'); }}
 ]},

{id:'primeiro_voo', n:'O primeiro voo do KITE', cat:'descoberta', cd:999,
 peso:function(st){return (st.sol>=4&&st.sol<=14&&st.robos.kite.ativo)?260:0;},
 txt:'Salazar não consegue sentar, então pilotou deitado, com o controle apoiado no peito. Noventa e cinco minutos de autonomia, sessenta quilômetros de alcance, e a primeira vez que alguém vê este planeta de cima desde que caímos.',
 efe:function(a){ a.moralAll(+7); a.moralOne('salazar',+16);
   var alvos=['I7','K8','G3']; alvos.forEach(function(sx){ if(a.st.setores[sx]) a.st.setores[sx].explorado=Math.max(a.st.setores[sx].explorado,22); });
   a.log('A coluna da Caldeira Tyr a leste. A cratera de impacto ao norte. E no setor I7, sob a vegetação, linhas retas que Salazar mediu três vezes antes de chamar alguém.','info');
   a.log('Zhao passou o resto do sol tentando explicar aquilo como fratura colunar. Não conseguiu.','info'); }},

{id:'zhao_primeira', n:'Zhao volta com as mãos cheias', cat:'descoberta', cd:999,
 peso:function(st){return (st.sol>=6&&st.sol<=16)?120:0;},
 txt:'Ela saiu sozinha de novo, contra a recomendação de todo mundo, e voltou quatro horas depois com a mochila pesada e um corte feio no antebraço.',
 efe:function(a){ a.mat('min_cobre',a.rng.int(40,90)); a.mat('argila',a.rng.int(60,140)); a.mat('pedra',a.rng.int(80,180));
   a.st.tech.pp+=a.rng.int(8,18); a.moralAll(+5);
   a.log('Malaquita a 2,3 km. Argila de qualidade a oitocentos metros. Um afloramento de pomes que dá para explorar por anos.','good');
   a.log('"Este planeta é generoso", ela disse, sangrando na bancada enquanto Nakamura suturava. "Só não é gentil."','info');
   if(a.rng.chance(0.35)) a.ferir('zhao','Laceração profunda',18,4); }},

{id:'racao_primeira', n:'A primeira discussão sobre comida', cat:'social', cd:999,
 peso:function(st){return (st.sol>=8&&st.sol<=20)?110:0;},
 txt:'Lindqvist reduziu as porções sem avisar ninguém. Antonova percebeu na primeira refeição e disse, na frente de todos, que não tinha assinado para passar fome enquanto "gente que carrega pedra come igual a quem pensa".',
 escolhas:[
  {t:'Ração igual para todos, sem exceção', d:'Moral estável. Antonova fica ressentida por muito tempo.',
   ef:function(a){ a.moralAll(+5); a.st.flags.racaoIgual=true; a.moralOne('antonova',-14);
     a.rel('antonova','lindqvist',-18);
     a.log('Vosk foi curta: "Todos comem igual. Quem discordar pode discordar comendo igual." Ninguém levantou a mão.','good'); }},
  {t:'Quem faz trabalho pesado come mais', d:'Produção sobe. A colônia se divide em duas classes hoje.',
   ef:function(a){ a.st.bonus.trabalho=(a.st.bonus.trabalho||1)*1.08; a.moralAll(-7);
     a.st.flags.racaoDesigual=true;
     a.log('Duas filas no refeitório desde hoje. Funciona. E vai ser lembrado por muito tempo.','warn'); }},
  {t:'Deixar Lindqvist decidir sozinha, sem interferência', d:'Ela otimiza melhor que você. E vira a pessoa mais odiada da colônia.',
   ef:function(a){ a.st.bonus.comida=1.06; a.moralOne('lindqvist',-16); a.moralAll(-2);
     a.log('Ela agradeceu. Depois foi comer sozinha, do lado de fora, como faz desde então.','warn'); }}
 ]},

{id:'okonkwo_solo', n:'Okonkwo ajoelha no chão', cat:'descoberta', cd:999,
 peso:function(st){return (st.sol>=5&&st.sol<=15)?100:0;},
 txt:'Ele passou o turno inteiro de joelhos, peneirando o loess entre os dedos e cheirando punhados dele. Às seis da tarde sentou no chão e ficou olhando para o horizonte por um tempo desconfortavelmente longo.',
 efe:function(a){ a.st.tech.pp+=a.rng.int(10,22); a.moralAll(-3);
   a.log('"Não é solo ruim", ele disse depois. "É que não é solo. É pó de rocha esperando alguém inventar a biologia. Nunca teve uma raiz aqui. Nenhuma. Nunca."','info');
   a.log('Ele levou 41 sols para fazer a primeira coisa verde crescer nisso. (+PP)','info'); }},

{id:'flare', n:'Fulguração de Vesper', cat:'clima', cd:14, peso:function(st){return st.clima.flare?90:0;},
 txt:'Vesper cospe uma fulguração classe X. O céu inteiro fica verde por quarenta minutos e cada instrumento sem blindagem pisca e morre.',
 efe:function(a){ a.st.energia.armazenada*=0.82;
   if(a.st.robos.kite.voando){ a.st.robos.kite.integridade-=a.rng.int(15,40); a.log('O KITE estava no ar. Voltou girando e bateu no cascalho.','bad'); }
   if(!_tem(a.st,'eletronica_int')&&a.rng.chance(0.4)){ a.log('Um controlador do reator solar queimou. −0,9 kWh/sol até ser reparado.','bad'); a.st.energia.penalidade+=0.9; }
   a.moralAll(-3); }},

{id:'tempestade_p', n:'Tempestade de poeira', cat:'clima', cd:8, peso:function(st){return st.clima.cond==='tempestade de poeira'?70:0;},
 txt:'A parede de poeira chega em quarenta minutos e o mundo some. Ninguém trabalha. Os painéis viram lixo cinzento.',
 efe:function(a){ a.st.energia.sujeira=Math.min(0.85,a.st.energia.sujeira+a.rng.float(0.25,0.5));
   a.moralAll(-2); a.perdaTrabalho(0.45);
   if(_predio(a.st,'tenda')>0&&a.rng.chance(0.4)){ a.destruir('tenda',1); a.log('Uma tenda foi arrancada e levada. Não foi encontrada.','bad'); } }},

{id:'cheia', n:'Cheia do Ferrun', cat:'clima', cd:40, peso:function(st){ return (st.clima.mare>8.2&&st.clima.estacao==='verdejo')?100:0; },
 txt:'Sizígia de Kore e Ilex no mesmo sol do pico de degelo. O Ferrun sobe visivelmente — dá para ver a lâmina avançando pelo cascalho.',
 escolhas:[
  {t:'Evacuar tudo para o esporão rochoso a leste', d:'Custa um sol inteiro de trabalho. Salva quase todo o estoque.',
   ef:function(a){ a.perdaTrabalho(1.0); a.log('A colônia inteira carregou caixas por 14 horas. A água chegou a 40 cm do casco e parou.','good'); a.moralAll(-4); a.st.flags.enchenteSobrevivida=true; }},
  {t:'Erguer diques de terra ao redor do casco', d:'Metade do trabalho. Funciona se a cheia for moderada.',
   ef:function(a){ a.perdaTrabalho(0.5);
     if(a.rng.chance(0.45)){ a.log('Os diques romperam às 3h. A água entrou no casco.','bad'); a.perderRecurso(0.3); a.moralAll(-9); }
     else { a.log('Os diques seguraram. Por pouco.','good'); a.moralAll(-2); } }},
  {t:'Não fazer nada. Apostar na elevação de +6,2 m', d:'Zero custo. Se a projeção estiver errada, é catastrófico.',
   ef:function(a){ if(a.rng.chance(0.44)){ a.log('A água entrou. Estoque encharcado, dois feridos, moral destroçada.','bad');
       a.perderRecurso(0.45); a.moralAll(-16); var v=_vivos(a.st); if(v.length) a.ferir(a.rng.pick(v).id,'Hipotermia e contusão',30,6); }
     else { a.log('A água parou a 1,4 m abaixo do acampamento. Vosk não dormiu, mas a aposta deu certo.','good'); a.moralAll(3);} }}
 ]},

{id:'geada', n:'Geada fora de época', cat:'clima', cd:20, peso:function(st){return (st.clima.tempMin<-4&&st.agricultura.lotes.length>0)?45:0;},
 txt:'A mínima despenca durante a noite longa. De manhã, os canteiros estão brancos.',
 efe:function(a){ var perda=0; for(var i=0;i<a.st.agricultura.lotes.length;i++){ var l=a.st.agricultura.lotes[i];
     if(l.crop&&!l.protegido){ l.saude-=a.rng.int(25,55); perda++; } }
   if(perda) a.log(perda+' lotes queimados pela geada.','bad'); a.moralAll(-3); }},

{id:'sismo', n:'Tremor de terra', cat:'clima', cd:60, peso:12,
 txt:'Tyr se mexe. O chão vibra por onze segundos e alguma coisa cai em algum lugar.',
 efe:function(a){ var ps=a.st.predios.filter(function(p){return p.pronto;});
   if(ps.length){ var p=a.rng.pick(ps); p.hp-=a.rng.int(15,45); a.log('Danos estruturais em: '+EL.buildPorId(p.id).n,'warn'); }
   a.moralAll(-2); }},

{id:'erupcao', n:'Tyr entra em erupção', cat:'clima', cd:180, peso:function(st){return st.sol>60?6:0;},
 txt:'A coluna de cinzas sobe 14 km a leste. Em dois sols o céu inteiro fica marrom.',
 efe:function(a){ a.st.energia.sujeira=Math.min(0.9,a.st.energia.sujeira+0.6); a.st.flags.cinzaVulcanica=a.st.sol+a.rng.int(8,20);
   a.log('Chuva de cinza prevista por '+(a.st.flags.cinzaVulcanica-a.st.sol)+' sols. Geração solar praticamente nula.','bad');
   a.mat('enxofre',a.rng.int(40,120)); a.log('Por outro lado: enxofre precipitou por todo o acampamento.','good'); a.moralAll(-5); }},

{id:'meteoro', n:'Bólido', cat:'clima', cd:120, peso:5,
 txt:'Um risco branco cruza o céu de leste a oeste e o estrondo chega vinte segundos depois.',
 efe:function(a){ if(a.rng.chance(0.3)){ var s=a.rng.pick(Object.keys(a.st.setores)); a.st.setores[s].explorado=Math.max(a.st.setores[s].explorado,25);
     a.log('Impacto no setor '+s+'. Zhao quer ir lá amanhã. Ferro meteorítico não é pouca coisa.','info'); a.st.setores[s].meteorito=true; }
   else a.log('Passou. Só o estrondo e vinte pessoas de coração acelerado.','info'); }},

{id:'aurora', n:'Aurora de Vesper', cat:'clima', cd:25, peso:20,
 txt:'O campo magnético fraco do planeta deixa a aurora descer até a planície. Verde, roxo, e cobre o céu inteiro por seis horas.',
 efe:function(a){ a.moralAll(+5); a.log('Ninguém trabalhou direito. Ninguém se importou.','good'); }},

/* ================= FAUNA ================= */
{id:'ceifeiros', n:'Ataque de Ceifeiros', cat:'fauna', cd:12,
 peso:function(st){ var d=st.defesa||0; return Math.max(0, 46 - d*0.6) * (st.clima.tempMin<2?1.3:1); },
 txt:'Eles vêm pouco antes do amanhecer, quando o turno de guarda está mais cansado. Quatro. Depois seis.',
 efe:function(a){ var def=a.st.defesa||0, guarda=a.st.trabalhoGuarda||0;
   var chance=Math.max(0.05, 0.75 - def*0.011 - guarda*0.18);
   var v=_vivos(a.st); if(!v.length) return;
   if(a.rng.chance(chance)){ var alvo=a.rng.pick(v);
     var sev=a.rng.int(25,70);
     if(sev>62&&a.rng.chance(0.35)){ a.matar(alvo.id,'Morto por Ceifeiros'); a.moralAll(-22); }
     else { a.ferir(alvo.id,'Lacerações profundas',sev,a.rng.int(6,16)); a.moralAll(-9); a.log(alvo.nome+' foi alcançado antes de Deng abrir fogo.','bad'); }
   } else { a.log('A cerca e a guarda seguraram. Dois Ceifeiros abatidos.','good'); a.mat('fibra',a.rng.int(10,25)); a.moralAll(+2); } }},

{id:'enxame_ev', n:'Enxame-mandíbula', cat:'fauna', cd:70,
 peso:function(st){ return (st.clima.estacao==='cinzeiro'&&st.agricultura.lotes.length>0)?55:0; },
 txt:'A nuvem aparece no horizonte sul como uma mancha que muda de forma. Leva quarenta minutos para chegar.',
 escolhas:[
  {t:'Queimar as bordas: barreira de fumaça', d:'Consome biomassa e um turno. Salva talvez metade.',
   ef:function(a){ a.mat('biomassa',-Math.min(a.st.mat.biomassa||0,200)); a.perdaTrabalho(0.4);
     var p=0; a.st.agricultura.lotes.forEach(function(l){ if(l.crop&&!l.protegido&&a.rng.chance(0.45)){l.saude-=60;p++;} });
     a.log('Fumaça desviou boa parte do enxame. '+p+' lotes ainda foram atingidos.','warn'); }},
  {t:'Colher tudo o que der, agora, verde', d:'Perde rendimento mas salva caloria.',
   ef:function(a){ var g=0; a.st.agricultura.lotes.forEach(function(l){ if(l.crop&&!l.protegido){ var c=EL.cropPorId(l.crop);
       g+=c.rend*(l.prog/c.dias)*0.55*(l.saude/100); l.crop=null; l.prog=0; } });
     a.mat('comida',Math.round(g)); a.log('Colheita de emergência: '+Math.round(g)+' rações verdes. Os canteiros ficaram limpos.','warn'); }},
  {t:'Deixar passar. Proteger só as estufas', d:'Zero custo de trabalho. Perda quase total a céu aberto.',
   ef:function(a){ var p=0; a.st.agricultura.lotes.forEach(function(l){ if(l.crop&&!l.protegido){ l.saude=0; p++; } });
     a.log(p+' lotes reduzidos a talos. As estufas ficaram intactas.','bad'); a.moralAll(-8); }}
 ]},

{id:'rastejante_ev', n:'Rastejante na cerca', cat:'fauna', cd:18, peso:22,
 txt:'Um rastejante-de-placas de 400 kg decidiu que a cerca era um bom lugar para coçar as placas dorsais.',
 efe:function(a){ if(_predio(a.st,'cerca')>0){ a.log('A cerca cedeu em três metros. Reparo pendente.','warn'); a.danificar('cerca',30); }
   if(_tem(a.st,'caca')&&a.rng.chance(0.6)){ a.mat('fibra',a.rng.int(30,70)); a.log('Deng o abateu. Couro e osso recuperados.','good'); }
   else a.log('Ele foi embora sozinho, sem pressa nenhuma.','info'); }},

{id:'escavadores', n:'Escavadores sob as fundações', cat:'fauna', cd:30, peso:function(st){return st.predios.length>3?26:0;},
 txt:'O chão sob o armazém está oco. Uma colônia inteira de escavadores-de-túnel se instalou sob a fundação.',
 efe:function(a){ var ps=a.st.predios.filter(function(p){return p.pronto;});
   if(ps.length){ var p=a.rng.pick(ps); p.hp-=a.rng.int(10,30); a.log('Fundação comprometida: '+EL.buildPorId(p.id).n,'warn'); } }},

{id:'corvos', n:'Corvos-de-cinza', cat:'fauna', cd:22, peso:24,
 txt:'Os corvos aprenderam que metal brilhante existe aqui. E que humanos dormem.',
 efe:function(a){ var perdeu=['sucata','cobre','componente','ouro'];
   for(var i=0;i<perdeu.length;i++){ var k=perdeu[i]; if(a.st.mat[k]>0){ var q=Math.min(a.st.mat[k],a.rng.float(0.5,6)); a.mat(k,-q);
     a.log('Sumiram '+q.toFixed(1)+' de '+EL.MAT[k].n+'. Encontraram um ninho no barranco com metade.','warn'); break; } } }},

{id:'peixe_teste', n:'O peixe-lanterna', cat:'fauna', cd:999, peso:function(st){ return (_tem(st,'xenotoxicologia')&&st.setores['B6']&&st.setores['B6'].explorado>50)?40:0; },
 txt:'Raghavan trouxe do litoral um cardume de peixes-lanterna e um resultado de ensaio que ela não consegue interpretar sozinha.',
 escolhas:[
  {t:'Testar em cultura celular por mais 10 sols', d:'Seguro, lento, consome uma vaga de laboratório.',
   ef:function(a){ a.st.flags.peixeTeste=a.st.sol+10; a.log('Ensaio de citotoxicidade em andamento. Resultado no sol '+(a.st.sol+10)+'.','info'); }},
  {t:'Voluntário come uma porção pequena, sob observação', d:'Resposta em 1 sol. Risco real de envenenamento.',
   ef:function(a){ if(a.rng.chance(0.62)){ a.st.flags.peixeOK=true;
       a.log('COMESTÍVEL. Proteína marinha ilimitada. Raghavan chorou. Lindqvist recalculou tudo.','good'); a.moralAll(+14); }
     else { var v=_vivos(a.st); var alvo=a.rng.pick(v); a.ferir(alvo.id,'Envenenamento alimentar grave',58,9);
       a.log('Convulsões em quarenta minutos. '+alvo.nome+' quase morreu. O peixe está fora.','bad'); a.moralAll(-11); } }},
  {t:'Descartar. Não vale o risco', d:'Nada acontece. A dúvida permanece.',
   ef:function(a){ a.log('Raghavan não falou com ninguém pelo resto do sol.','info'); a.rel('raghavan','vosk',-12); }}
 ]},

/* ================= SAÚDE ================= */
{id:'surto_gastro', n:'Surto gastrointestinal', cat:'saude', cd:20,
 peso:function(st){ return st.aguaContaminada? 55 : (_predio(st,'latrina')?4:16); },
 txt:'Começa com dois. Ao meio-dia são sete. A água do Ferrun cobrou o preço.',
 efe:function(a){ var v=_vivos(a.st); a.rng.shuffle(v); var n=Math.min(v.length, a.rng.int(2,Math.max(2,Math.min(9,v.length))));
   for(var i=0;i<n;i++){ v[i].saude-=a.rng.int(12,30); v[i].fadiga+=18; v[i].doente=a.st.sol+a.rng.int(3,7); }
   a.log(n+' pessoas de cama. Nakamura tem 6 doses de antibiótico para o planeta inteiro.','bad'); a.moralAll(-8); }},

{id:'infeccao', n:'Infecção se agrava', cat:'saude', cd:10,
 peso:function(st){ var f=0; _vivos(st).forEach(function(c){ if(c.ferimento&&c.ferimento.sev>30) f++; }); return f*18; },
 txt:'A borda da ferida está vermelha e quente. Nakamura conhece esse cheiro.',
 efe:function(a){ var fer=_vivos(a.st).filter(function(c){return c.ferimento;});
   if(!fer.length) return; var c=a.rng.pick(fer);
   if(a.st.mat.antibiotico>=1){ a.mat('antibiotico',-1); c.ferimento.sev-=25; a.log('Uma dose de antibiótico gasta em '+c.nome+'. Restam '+Math.floor(a.st.mat.antibiotico)+'.','warn'); }
   else { c.ferimento.sev+=a.rng.int(12,28); c.saude-=a.rng.int(10,22);
     a.log('Sem antibiótico. '+c.nome+' está piorando.','bad'); a.moralAll(-5); } }},

{id:'co2_crise', n:'Acúmulo de CO₂', cat:'saude', cd:24, peso:function(st){ return _tem(st,'suporte_vida')?4:16; },
 txt:'Três pessoas desmaiaram dentro do casco em uma hora. O CO₂ acumulou no ponto mais baixo do compartimento.',
 efe:function(a){ var v=_vivos(a.st); a.rng.shuffle(v);
   for(var i=0;i<3&&i<v.length;i++){ v[i].saude-=a.rng.int(6,16); v[i].fadiga+=22; }
   var b=a.st.crew.filter(function(c){return c.id==='brandt'&&c.vivo;})[0];
   if(b){ b.saude-=10; a.log('Brandt levou o pior. O pulmão dele não tem margem.','bad'); }
   a.moralAll(-4); }},

{id:'exaustao', n:'Colapso por exaustão', cat:'saude', cd:8,
 peso:function(st){ var n=0; _vivos(st).forEach(function(c){ if(c.fadiga>84) n++; }); return n*20; },
 txt:'Alguém simplesmente parou de funcionar no meio do turno.',
 efe:function(a){ var cand=_vivos(a.st).filter(function(c){return c.fadiga>78;});
   if(!cand.length) return; var c=a.rng.pick(cand);
   c.fadiga=100; c.saude-=a.rng.int(8,20); c.forcado='descanso'; c.forcadoAte=a.st.sol+a.rng.int(2,5);
   a.log(c.nome+' caiu. Está fora de serviço até o sol '+c.forcadoAte+'. Isso era evitável.','bad'); a.moralAll(-4); }},

{id:'espora_falha', n:'Espora-cinza nos vedantes', cat:'saude', cd:35,
 peso:function(st){ return (st.sol>28&&!_tem(st,'plasticos'))?34:6; },
 txt:'O fungo degradou os vedantes de polímero do reciclador. A eficiência despencou durante a noite.',
 efe:function(a){ a.st.agua.recicladorDano+=0.10;
   a.log('Recuperação de água caiu 10 pontos. Reparo exige polímero ou uma vedação nova.','bad'); }},

{id:'parto_risco', n:'Gravidez', cat:'saude', cd:200,
 peso:function(st){ return (st.sol>180&&st.moralMedia>58&&st.comidaSegura)?18:0; },
 txt:'Nakamura confirma. A primeira gravidez de Elysium.',
 efe:function(a){ a.st.flags.gravidez=a.st.sol+270; a.moralAll(+12);
   a.log('Parto previsto para o sol '+a.st.flags.gravidez+'. A colônia inteira mudou de humor num único dia.','good'); }},

/* ================= SOCIAL ================= */
{id:'confronto_petrov', n:'Petrov contesta o comando', cat:'social', cd:40,
 peso:function(st){ return (st.moralMedia<50 && !st.flags.comandoResolvido)?45:0; },
 txt:'Petrov para no meio do acampamento e diz, alto: "Ela era a segunda oficial. Segunda. E olha onde estamos."',
 escolhas:[
  {t:'Apoiar Vosk publicamente', d:'Comando consolidado. Petrov fica ressentido, mas a cadeia fica clara.',
   ef:function(a){ a.st.flags.comandoResolvido='vosk'; a.st.bonus.moralComando=1.5;
     a.rel('petrov','vosk',-25); a.moralOne('vosk',+18); a.moralAll(+4);
     a.log('Vosk assumiu de fato. Petrov voltou ao trabalho em silêncio.','good'); }},
  {t:'Dar a Petrov a chefia de obras, com autonomia', d:'Divide o poder. Construção mais rápida, comando mais frágil.',
   ef:function(a){ a.st.flags.comandoResolvido='dividido'; a.st.bonus.construcao=1.18;
     a.rel('petrov','vosk',+15); a.moralOne('petrov',+20); a.moralOne('vosk',-8);
     a.log('Petrov chefia as obras. Funciona. Ninguém sabe mais quem decide o quê.','warn'); }},
  {t:'Instituir um conselho eleito de três', d:'Decisões mais lentas, legitimidade máxima, moral estável a longo prazo.',
   ef:function(a){ a.st.flags.comandoResolvido='conselho'; a.st.bonus.moralComando=2.4; a.st.bonus.pesquisa=0.94;
     a.moralAll(+9); a.log('Vosk, Petrov e Moreau eleitos. Toda decisão agora leva mais tempo. E todos a aceitam.','good'); }}
 ]},

{id:'watanabe_crise', n:'Watanabe desaparece', cat:'social', cd:999,
 peso:function(st){ var w=st.crew.filter(function(c){return c.id==='watanabe';})[0]; return (w&&w.vivo&&w.moral<25&&st.sol>3)?70:0; },
 txt:'Watanabe não apareceu no turno. Encontraram as botas dele na margem do rio, alinhadas lado a lado.',
 escolhas:[
  {t:'Mandar todos procurarem, agora', d:'Perde o sol inteiro de trabalho. Melhor chance de encontrá-lo.',
   ef:function(a){ a.perdaTrabalho(1.0);
     if(a.rng.chance(0.78)){ a.moralOne('watanabe',+30); a.moralAll(+6); a.st.flags.watanabeSalvo=true;
       a.log('Deng o encontrou a 3 km, sentado. Trouxe-o de volta sem dizer uma palavra. Moreau não sai do lado dele.','good'); }
     else { a.matar('watanabe','Desaparecido no Ferrun'); a.moralAll(-20); } }},
  {t:'Mandar Moreau e Deng. O resto trabalha', d:'Meio-termo. Chance menor.',
   ef:function(a){ a.perdaTrabalho(0.12);
     if(a.rng.chance(0.5)){ a.moralOne('watanabe',+22); a.moralAll(+2); a.st.flags.watanabeSalvo=true; a.log('Encontrado. Vivo.','good'); }
     else { a.matar('watanabe','Desaparecido no Ferrun'); a.moralAll(-24); a.log('Buscaram até escurecer.','bad'); } }},
  {t:'Não temos gente para isso', d:'Nenhum custo. Consequência humana permanente.',
   ef:function(a){ a.matar('watanabe','Desaparecido no Ferrun'); a.moralAll(-30); a.st.flags.abandonou=true;
     a.log('A colônia inteira soube da decisão. Ninguém falou nada. Foi pior assim.','bad'); }}
 ]},

{id:'briga', n:'Briga no refeitório', cat:'social', cd:25,
 peso:function(st){ return st.moralMedia<44?38:8; },
 txt:'Começou por causa de uma ração. Terminou com dois no chão e o resto assistindo.',
 efe:function(a){ var v=_vivos(a.st); a.rng.shuffle(v); if(v.length<2) return;
   var A=v[0],B=v[1]; A.saude-=a.rng.int(4,12); B.saude-=a.rng.int(4,12);
   a.rel(A.id,B.id,-30); a.moralAll(-5);
   a.log(A.nome+' e '+B.nome+' se pegaram. Moreau separou. Ninguém está bem.','bad'); }},

{id:'reyes_bebida', n:'Reyes destila de novo', cat:'social', cd:45,
 peso:function(st){ var r=st.crew.filter(function(c){return c.id==='reyes';})[0]; return (r&&r.vivo&&r.moral<48)?32:0; },
 txt:'Descobriram um alambique improvisado atrás da vidraria. Reyes montou com material de laboratório.',
 escolhas:[
  {t:'Destruir e advertir formalmente', d:'Química de volta ao trabalho. Ela guarda mágoa.',
   ef:function(a){ a.moralOne('reyes',-16); a.rel('reyes','vosk',-20); a.log('O alambique virou sucata. Reyes trabalhou o sol inteiro sem levantar a cabeça.','warn'); }},
  {t:'Legalizar: destilaria comunal, ração controlada', d:'+moral geral permanente. −produtividade química.',
   ef:function(a){ a.st.bonus.moralAlcool=1.4; a.st.bonus.quimica=0.9; a.moralAll(+8);
     a.log('Uma dose por pessoa a cada dez sols. Reyes virou a pessoa mais popular da colônia.','good'); }},
  {t:'Ignorar. Há problemas maiores', d:'Nada agora. O problema cresce.',
   ef:function(a){ a.st.flags.alcoolLivre=true; a.log('Ninguém disse nada. Reyes entendeu como permissão.','warn'); }}
 ]},

{id:'romance', n:'Aproximação', cat:'social', cd:60, peso:function(st){return st.sol>25?22:0;},
 txt:'Duas pessoas ficaram acordadas até tarde, e não era por causa de trabalho.',
 efe:function(a){ var v=_vivos(a.st); if(v.length<2) return; a.rng.shuffle(v);
   var A=v[0],B=v[1]; a.rel(A.id,B.id,+35); a.moralOne(A.id,+14); a.moralOne(B.id,+14);
   a.log(A.nome+' e '+B.nome+'. A colônia percebeu antes deles.','good'); }},

{id:'motim', n:'Recusa coletiva de trabalho', cat:'social', cd:50,
 peso:function(st){ return st.moralMedia<26?70:0; },
 txt:'Sete pessoas não saíram das tendas. Não é greve. É esgotamento com forma política.',
 escolhas:[
  {t:'Ceder: ração plena e um sol de folga', d:'Custa comida e um sol. Recupera muita moral.',
   ef:function(a){ a.perdaTrabalho(1.0); a.mat('comida',-a.st.pop*0.4); a.moralAll(+22);
     a.log('Comeram até se fartar e dormiram doze horas. No sol seguinte, trabalharam como não trabalhavam há semanas.','good'); }},
  {t:'Impor disciplina através de Deng', d:'Trabalho volta hoje. A fratura fica.',
   ef:function(a){ a.moralAll(-10); a.st.bonus.disciplina=true; a.st.flags.autoritario=(a.st.flags.autoritario||0)+1;
     a.log('Voltaram ao trabalho. Ninguém olhou para Vosk o dia inteiro.','warn'); }},
  {t:'Assembleia: eles decidem as prioridades do próximo turno', d:'Perde meio sol. Moral e legitimidade sobem muito.',
   ef:function(a){ a.perdaTrabalho(0.5); a.moralAll(+16); a.st.bonus.moralComando=(a.st.bonus.moralComando||1)+0.8;
     a.log('Quatro horas de discussão. Saíram com um plano que não era o seu — e com vontade de executá-lo.','good'); }}
 ]},

{id:'aduba_cresce', n:'Aduba assume um posto', cat:'social', cd:999,
 peso:function(st){ var s=st.crew.filter(function(c){return c.id==='aduba';})[0];
   if(!s||!s.vivo) return 0; var max=0; for(var k in s.per) if(s.per[k]>max) max=s.per[k]; return max>=5?60:0; },
 txt:'Samuel Aduba entrou nesta missão para carregar caixas. Hoje ele corrigiu Petrov — e Petrov aceitou a correção.',
 efe:function(a){ a.moralAll(+7); a.moralOne('aduba',+20); a.st.bonus.ensino=(a.st.bonus.ensino||1)+0.2;
   a.log('O primeiro especialista formado dentro de Elysium.','good'); }},

{id:'antonova_recusa', n:'Antonova se recusa', cat:'social', cd:40,
 peso:function(st){ var x=st.crew.filter(function(c){return c.id==='antonova';})[0];
   return (x&&x.vivo&&x.trabalho&&['construir','reciclar','explorar','agricultura'].indexOf(x.trabalho)>=0)?50:0; },
 txt:'"Eu construo reatores. Não carrego pedra." Antonova largou a pá no chão e voltou para o laboratório.',
 efe:function(a){ a.moralAll(-4); a.rel('antonova','petrov',-18);
   var x=a.st.crew.filter(function(c){return c.id==='antonova';})[0]; if(x) x.trabalho='pesquisar';
   a.log('Ela se realocou sozinha para a pesquisa. Está trabalhando. Só não onde você mandou.','warn'); }},

{id:'moreau_quebra', n:'Moreau não está bem', cat:'social', cd:90,
 peso:function(st){ var m=st.crew.filter(function(c){return c.id==='moreau';})[0];
   return (m&&m.vivo&&st.sol>40&&m.fadiga>60)?36:0; },
 txt:'A psicóloga da colônia foi encontrada chorando atrás do armazém. Ela cuida de dezenove pessoas. Ninguém cuida dela.',
 escolhas:[
  {t:'Dar a ela cinco sols de folga integral', d:'Perde apoio psicológico por 5 sols. Ela volta inteira.',
   ef:function(a){ var m=a.st.crew.filter(function(c){return c.id==='moreau';})[0];
     m.forcado='descanso'; m.forcadoAte=a.st.sol+5; m.moral=Math.min(100,m.moral+35);
     a.log('Ela resistiu. Aceitou quando Nakamura disse que era ordem médica.','good'); }},
  {t:'Formar mais dois em apoio psicológico', d:'Custa turnos de ensino. Distribui a carga para sempre.',
   ef:function(a){ a.perdaTrabalho(0.35); a.st.bonus.apoioDistribuido=true;
     var v=_vivos(a.st); a.rng.shuffle(v); for(var i=0;i<2&&i<v.length;i++) v[i].per.psicologia=(v[i].per.psicologia||0)+2;
     a.log('Moreau treinou dois colegas. Pela primeira vez em 40 sols, ela dormiu a noite toda.','good'); }},
  {t:'Não há margem. Ela aguenta', d:'Nenhum custo agora.',
   ef:function(a){ var m=a.st.crew.filter(function(c){return c.id==='moreau';})[0]; m.moral-=25; m.saude-=10;
     a.st.flags.moreauQuebrada=true; a.log('Ela voltou ao trabalho. Está sorrindo. Isso é pior.','bad'); }}
 ]},

/* ================= TÉCNICO ================= */
{id:'atlas_falha', n:'Falha do ATLAS-1', cat:'tecnico', cd:16,
 peso:function(st){ return st.robos.atlas.integridade<70? 45 : 14; },
 txt:'O servo do braço direito travou no meio de um ciclo. Rashid diz que já era para ter travado há vinte sols.',
 efe:function(a){ a.st.robos.atlas.integridade-=a.rng.int(8,22);
   if(a.st.robos.atlas.integridade<25){ a.st.robos.atlas.ativo=false; a.log('ATLAS-1 está parado. Sem ele a construção cai pela metade.','bad'); }
   else a.log('ATLAS-1 opera a '+Math.round(a.st.robos.atlas.integridade)+'%. Precisa de manutenção robótica.','warn'); }},

{id:'kite_perdido', n:'KITE não voltou', cat:'tecnico', cd:30,
 peso:function(st){ return st.robos.kite.voando?26:0; },
 txt:'A última telemetria mostra uma rajada lateral sobre a cordilheira e depois nada.',
 escolhas:[
  {t:'Expedição de resgate ao último ponto conhecido', d:'Custa trabalho e é perigoso. Recupera o drone em boa parte dos casos.',
   ef:function(a){ a.perdaTrabalho(0.5);
     if(a.rng.chance(0.65)){ a.st.robos.kite.integridade=Math.max(20,a.st.robos.kite.integridade-30);
       a.log('Encontrado num barranco. Amassado, mas recuperável.','good'); }
     else { a.st.robos.kite.ativo=false; a.log('Nada. A colônia perdeu os olhos.','bad'); a.moralAll(-8);
       var v=_vivos(a.st); if(a.rng.chance(0.25)) a.ferir(a.rng.pick(v).id,'Queda em terreno acidentado',30,7); } }},
  {t:'Aceitar a perda', d:'Sem custo. Sem drone.',
   ef:function(a){ a.st.robos.kite.ativo=false; a.moralAll(-6); a.moralOne('salazar',-18);
     a.log('Salazar pediu para ser deixado sozinho.','bad'); }}
 ]},

{id:'impressora_falha', n:'Vulcan-M falha', cat:'tecnico', cd:40, peso:function(st){return st.impressora.usos>6?30:8;},
 txt:'O bico extrusor entupiu com polímero degradado por espora-cinza.',
 efe:function(a){ a.st.impressora.ok=false; a.log('Impressora 3D fora de operação até reparo (manutenção robótica ou mecânica).','bad'); }},

{id:'bateria_celula', n:'Célula de bateria morre', cat:'tecnico', cd:35, peso:function(st){return st.sol>20?24:0;},
 txt:'Mais uma célula do banco original abriu circuito. Virtanen já esperava.',
 efe:function(a){ a.st.energia.capacidade=Math.max(40,a.st.energia.capacidade-a.rng.int(12,28));
   a.log('Capacidade de armazenamento agora: '+Math.round(a.st.energia.capacidade)+' kWh.','warn'); }},

{id:'curto', n:'Curto-circuito e incêndio', cat:'tecnico', cd:45, peso:function(st){return st.predios.length>5?20:6;},
 txt:'O cheiro de isolamento queimado acorda todo mundo às 2h.',
 efe:function(a){ var ps=a.st.predios.filter(function(p){return p.pronto;});
   if(ps.length){ var p=a.rng.pick(ps); p.hp-=a.rng.int(25,60); a.log('Incêndio em '+EL.buildPorId(p.id).n+'. Contido.','bad'); }
   var v=_vivos(a.st); if(a.rng.chance(0.35)) a.ferir(a.rng.pick(v).id,'Queimadura',a.rng.int(20,45),a.rng.int(5,12));
   a.moralAll(-5); }},

{id:'rashid_gambiarra', n:'A gambiarra de Rashid', cat:'tecnico', cd:50, peso:22,
 txt:'Rashid reprogramou o ATLAS-1 durante a noite. Diz que agora escava 30% mais rápido. Não documentou nada.',
 escolhas:[
  {t:'Manter. Precisamos da velocidade', d:'+30% de escavação. Risco permanente de falha catastrófica.',
   ef:function(a){ a.st.robos.atlas.overclock=true; a.log('ATLAS-1 opera fora de especificação. Rashid está radiante. Brandt não.','warn'); }},
  {t:'Reverter e exigir documentação', d:'Sem ganho. Sem risco. Rashid fica irritado.',
   ef:function(a){ a.moralOne('rashid',-10); a.st.bonus.robotica=(a.st.bonus.robotica||1)+0.1;
     a.log('Rashid documentou tudo, de má vontade. O manual vale mais do que os 30%.','good'); }}
 ]},

/* ================= DESCOBERTA ================= */
{id:'anomalia_1', n:'A Anomalia responde', cat:'descoberta', cd:18,
 peso:function(st){ return (st.setores['I7']&&st.setores['I7'].explorado>=60&&!st.flags.anomalia)?100:0; },
 txt:'As linhas do setor I7 não são geológicas. São paredes — enterradas, erodidas, mas com ângulos retos e uma liga metálica que não aparece em nenhum lugar do catálogo local.',
 escolhas:[
  {t:'Escavar. Precisamos saber', d:'Custa trabalho pesado e há risco de desabamento. É a única forma de avançar.',
   ef:function(a){ a.perdaTrabalho(0.6);
     if(a.rng.chance(0.62)){ a.st.flags.anomalia=1; a.st.tech.pp+=a.rng.int(30,60); a.mat('titanio',a.rng.int(15,40));
       a.log('Uma câmara selada, sem porta visível. A liga não oxidou em nenhum ponto. Não há corpos, não há símbolos, não há lixo. Alguém fechou isto com cuidado.','good'); a.moralAll(+8); }
     else { a.log('A escavação desmoronou. Duas pessoas quase soterradas. A câmara segue inacessível — a equipe vai tentar de novo em alguns sols, por outro ângulo.','bad');
       var v=_vivos(a.st); if(v.length) a.ferir(a.rng.pick(v).id,'Soterramento parcial',40,10); a.moralAll(-6); } }},
  {t:'Isolar o setor e proibir aproximação', d:'Zero risco, zero ganho. O mistério continua lá.',
   ef:function(a){ a.st.flags.anomalia='selada'; a.moralAll(-3);
     a.log('Vosk proibiu I7. Metade da colônia concorda. A outra metade fala sobre isso todas as noites.','warn'); }}
 ]},

{id:'anomalia_2', n:'A liga não é daqui', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.anomalia===1&&_tem(st,'siderurgia'))?90:0; },
 txt:'Reyes passou onze sols com a amostra da câmara. Hoje ela colocou o resultado na mesa e não conseguiu falar por um tempo.',
 efe:function(a){ a.st.flags.anomalia=2; a.st.tech.pp+=a.rng.int(35,70);
   a.log('A razão isotópica do ferro na liga não corresponde a nada deste sistema estelar. Seja lá quem construiu aquilo, também chegou de fora. (+PP)','good');
   a.moralAll(+5); }},

{id:'anomalia_3', n:'Doze pulsos', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.anomalia===2&&_tem(st,'radio'))?95:0; },
 txt:'Na primeira varredura de banda larga, a antena capta uma repetição vinda de I7. Doze pulsos, pausa de 41 segundos, doze pulsos. Sem variação.',
 efe:function(a){ a.st.flags.anomalia=3; a.st.tech.pp+=a.rng.int(30,60);
   a.log('A deriva de frequência permite datar o oscilador: está transmitindo, ininterruptamente, há cerca de 400 mil anos. Ninguém dormiu direito nessa noite. (+PP)','info');
   a.moralAll(-2); }},

{id:'anomalia_4', n:'Diop decifra', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.anomalia===3&&_tem(st,'computacao'))?95:0; },
 txt:'Amara Diop passou dezoito sols com os pulsos. Ela não pediu ajuda a ninguém, como sempre. Hoje projetou o resultado na parede do refeitório.',
 efe:function(a){ a.st.flags.anomalia=4;
   var alvos=['K6','L4','B6'];
   alvos.forEach(function(sx){ if(a.st.setores[sx]) a.st.setores[sx].explorado=Math.max(a.st.setores[sx].explorado,55); });
   a.st.tech.pp+=a.rng.int(45,85);
   a.log('Não é linguagem. É um índice: três conjuntos de coordenadas relativas ao próprio emissor. Os setores K6, L4 e B6 apareceram no mapa. (+PP)','good');
   a.moralAll(+7); }},

{id:'anomalia_5', n:'O segundo sítio', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.anomalia===4 && ((st.setores['K6']&&st.setores['K6'].explorado>=85)||(st.setores['L4']&&st.setores['L4'].explorado>=85)))?95:0; },
 txt:'A segunda estrutura está sob quarenta metros de basalto. Menor que a de I7, e muito mais danificada — mas aberta.',
 escolhas:[
  {t:'Entrar', d:'Risco real. Também é a única forma de entender o que houve aqui.',
   ef:function(a){ a.st.flags.anomalia=5; a.perdaTrabalho(0.4);
     a.st.tech.pp+=a.rng.int(60,110); a.mat('supercond',a.rng.int(2,10)); a.mat('titanio',a.rng.int(30,90));
     a.log('Dentro há prateleiras. Vazias. Alguém retirou tudo antes de selar — menos um painel de material supercondutor ainda intacto depois de 400 mil anos. Levamos. (+PP)','good');
     if(a.rng.chance(0.3)){ var v=_vivos(a.st); if(v.length) a.ferir(a.rng.pick(v).id,'Exposição a atmosfera confinada',35,8); }
     a.moralAll(+6); }},
  {t:'Mapear de fora e não entrar', d:'Sem risco. O arco continua parado até que alguém decida entrar.',
   ef:function(a){ a.st.tech.pp+=15; a.log('Fotogrametria completa da entrada. Deng recomendou não entrar e Vosk concordou. Por ora.','warn'); }}
 ]},

{id:'anomalia_6', n:'A câmara de I7 se abre', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.anomalia===5&&(_tem(st,'eletronica_int')||_tem(st,'supercondutores')))?100:0; },
 txt:'O painel supercondutor do segundo sítio, alimentado pela nossa própria rede, encaixa no vão sem porta da câmara de I7. Não houve som. A parede simplesmente deixou de estar ali.',
 escolhas:[
  {t:'Ler o arquivo', d:'O que estiver lá dentro passa a fazer parte da história desta colônia.',
   ef:function(a){ a.st.flags.anomalia=6; a.st.flags.arquivo=true;
     a.st.tech.pp+=a.rng.int(180,320); a.st.bonus.pesquisa=(a.st.bonus.pesquisa||1)*1.25;
     a.log('Não era um templo nem uma arma. Era um registro.','evt');
     a.log('Eles também caíram aqui. Também eram poucos. Também não tinham como voltar. Duraram onze mil anos — construíram cidades, saíram do planeta, e então pararam. A última entrada não explica por quê: descreve um inverno, uma decisão tomada em assembleia, e o desligamento voluntário dos reatores.','evt');
     a.log('O emissor de doze pulsos não era um pedido de socorro. Era um aviso de que alguém esteve aqui — deixado para quem viesse depois. Agora somos nós. (+PP, pesquisa permanentemente +25%)','good');
     a.moralAll(+22); }},
  {t:'Selar de novo e nunca mais falar disso', d:'A colônia perde o achado. Ganha algo mais difícil de medir.',
   ef:function(a){ a.st.flags.anomalia='selada2'; a.st.bonus.moralComando=(a.st.bonus.moralComando||1)+1.2;
     a.moralAll(+8);
     a.log('Vosk selou a câmara com concreto e registrou a decisão no diário da colônia, com todos os nomes embaixo. Ninguém discutiu. Algumas coisas são de quem vier depois.','warn'); }}
 ]},

{id:'aquifero_conf', n:'O aquífero existe', cat:'descoberta', cd:999,
 peso:function(st){ return (_tem(st,'reparo_rps')&&!st.flags.aquiferoConf)?90:0; },
 txt:'O radar de solo do KITE devolve uma assinatura inequívoca: lâmina saturada a 34 metros sob o acampamento, em basalto fraturado.',
 efe:function(a){ a.st.flags.aquiferoConf=true; a.moralAll(+10);
   a.log('Água doce sob os pés. Falta só pesquisar Hidrogeologia e cavar 34 metros.','good'); }},

{id:'veio_rico', n:'Veio inesperado', cat:'descoberta', cd:30, peso:function(st){return st.trabalhoExtracao>2?26:0;},
 txt:'Zhao seguiu uma coloração no barranco e encontrou algo que não estava no levantamento orbital.',
 efe:function(a){ var mats=['min_cobre','min_ferro','quartzo','calcario','enxofre','nitrato'];
   var m=a.rng.pick(mats); var q=a.rng.int(120,400); a.mat(m,q);
   a.log('+'+q+' '+EL.MAT[m].u+' de '+EL.MAT[m].n+'. Zhao subiu num afloramento de 12 m sem corda para chegar lá.','good');
   if(a.rng.chance(0.25)) a.ferir('zhao','Queda de altura',35,8); }},

{id:'ruina_menor', n:'Fragmento', cat:'descoberta', cd:80, peso:function(st){return st.setoresExplorados>6?18:0;},
 txt:'Uma expedição trouxe um objeto de 11 cm. Metal, liso, sem junta visível, e mais denso do que deveria ser.',
 efe:function(a){ a.st.tech.pp+=a.rng.int(15,40); a.st.flags.fragmentos=(a.st.flags.fragmentos||0)+1;
   a.log('Antonova passou a noite medindo. "Isto não foi fundido. Foi crescido." (+PP)','good'); }},

{id:'nascente', n:'Nascente subterrânea', cat:'descoberta', cd:70, peso:function(st){return st.setoresExplorados>3?20:0;},
 txt:'Kowalczyk seguiu um traço de umidade no líquen e encontrou uma nascente permanente.',
 efe:function(a){ a.st.agua.fontes+=90; a.moralOne('kowalczyk',+18); a.moralAll(+5);
   a.log('+90 L/sol de água limpa, para sempre. A estagiária resolveu o maior problema da colônia.','good'); }},

/* ================= RECURSO E CRISE ================= */
{id:'perda_estoque', n:'Estoque estragado', cat:'crise', cd:30,
 peso:function(st){ return (_predio(st,'silo')===0&&st.mat.comida>60)?26:5; },
 txt:'Umidade entrou no contêiner de rações. Metade do lote está com mofo esverdeado.',
 efe:function(a){ var q=Math.min(a.st.mat.comida, a.rng.int(20,70)); a.mat('comida',-q);
   a.log('Perdidas '+q+' rações. Um silo hermético teria evitado isso.','bad'); a.moralAll(-6); }},

{id:'fome_decisao', n:'A conta de Lindqvist', cat:'crise', cd:60,
 peso:function(st){ return (st.diasComida<12&&st.diasComida>0)?80:0; },
 txt:'Lindqvist coloca a planilha na mesa. "Com a ração atual, temos '+'" comida para menos de doze sols. Alguém precisa decidir hoje."',
 escolhas:[
  {t:'Cortar para 55% da ração imediatamente', d:'Estica muito o estoque. Fadiga e saúde despencam.',
   ef:function(a){ a.st.politica.racaoComida=0.55; a.moralAll(-12);
     a.log('Meia ração. Ninguém discutiu. Todos entenderam a aritmética.','warn'); }},
  {t:'Manter a ração e apostar tudo na lavoura', d:'Moral preservada. Se a colheita atrasar, é fome de verdade.',
   ef:function(a){ a.moralAll(+5); a.st.flags.apostaLavoura=true;
     a.log('Vosk apostou na colheita. Okonkwo não dormiu depois disso.','warn'); }},
  {t:'Ração desigual: quem trabalha pesado come mais', d:'Produção mantida. Custo social alto.',
   ef:function(a){ a.st.politica.racaoDesigual=true; a.moralAll(-8); a.st.bonus.trabalho=1.12;
     a.log('Duas filas no refeitório. Funciona. E vai ser lembrado por muito tempo.','warn'); }}
 ]},

{id:'sede', n:'Reserva de água em nível crítico', cat:'crise', cd:20,
 peso:function(st){ return st.diasAgua<6?90:0; },
 txt:'Restam menos de seis sols de água. Isto não é um alerta: é uma contagem.',
 efe:function(a){ a.st.politica.racaoAgua=Math.min(a.st.politica.racaoAgua,0.6); a.moralAll(-10);
   _vivos(a.st).forEach(function(c){ c.saude-=4; c.fadiga+=8; });
   a.log('Racionamento forçado a 60%. Dor de cabeça, urina escura, irritação generalizada.','bad'); }},

{id:'apagao', n:'Apagão', cat:'crise', cd:15, peso:function(st){ return st.energia.armazenada<=0?85:0; },
 txt:'A bateria zerou às 21h. O aquecimento parou. O reciclador parou. O módulo médico ficou no circuito de emergência por três horas.',
 efe:function(a){ _vivos(a.st).forEach(function(c){ c.saude-=a.rng.int(3,9); c.fadiga+=12; });
   a.st.agua.recicladoHoje=0; a.moralAll(-9);
   a.log('Uma noite a −6 °C sem aquecimento. Todo mundo pagou por isso.','bad'); }},

{id:'ferramenta_quebra', n:'Ferramentas quebram', cat:'crise', cd:25, peso:function(st){return _tem(st,'siderurgia')?6:22;},
 txt:'Três cabos de ferramenta partiram no mesmo sol. O material da nave não foi feito para rocha vulcânica.',
 efe:function(a){ a.st.bonus.ferramentaDano=(a.st.bonus.ferramentaDano||0)+0.06;
   a.log('Produção de campo −6% até haver forja e reposição.','warn'); }},

{id:'acidente_obra', n:'Acidente de obra', cat:'crise', cd:12,
 peso:function(st){ return st.trabalhoConstrucao>3?30:8; },
 txt:'Uma peça de sucata de 80 kg escorregou do cavalete.',
 efe:function(a){ var cand=_vivos(a.st).filter(function(c){return c.trabalho==='construir';});
   if(!cand.length) cand=_vivos(a.st);
   if(!cand.length) return;
   var c=a.rng.pick(cand); var sev=a.rng.int(15,55);
   a.ferir(c.id,'Trauma por esmagamento',sev,a.rng.int(4,14)); a.moralAll(-4);
   a.log(c.nome+' foi atingido. '+(c.tracos.indexOf('imprudente')>=0?'Estava trabalhando sem apoio, de novo.':'Azar puro.'),'bad'); }},

{id:'gelido_aviso', n:'O Gélido se aproxima', cat:'crise', cd:400,
 peso:function(st){ return (st.clima.solAno>280&&st.clima.solAno<292)?100:0; },
 txt:'Virtanen fez a conta do aquecimento para 100 sols a −24 °C. Colocou o papel na mesa e não disse nada.',
 efe:function(a){ a.st.flags.avisoGelido=true; a.moralAll(-4);
   a.log('Sem abrigo isolado e reserva energética, o Gélido mata. Restam ~20 sols para se preparar.','warn'); }},

{id:'boa_colheita', n:'Colheita acima do previsto', cat:'recurso', cd:40,
 peso:function(st){ return st.colheitaRecente?35:0; },
 txt:'Okonkwo pesou três vezes porque não acreditou.',
 efe:function(a){ var b=Math.round(a.st.mat.comida*0.12)+8; a.mat('comida',b);
   a.moralAll(+9); a.moralOne('okonkwo',+20); a.log('+'+b+' rações acima do previsto. Okonkwo sorriu pela primeira vez.','good'); }},

{id:'veta_solar', n:'Painéis limpos', cat:'recurso', cd:12, peso:function(st){return st.energia.sujeira>0.3?30:0;},
 txt:'Aduba passou o turno inteiro limpando painel com um pano e água racionada. Ninguém pediu.',
 efe:function(a){ a.st.energia.sujeira=Math.max(0,a.st.energia.sujeira-0.4); a.moralOne('aduba',+8);
   a.log('Geração solar recuperada. Custou 20 L de água e um garoto de 22 anos com iniciativa.','good'); }},

{id:'chuva_boa', n:'Chuva forte', cat:'recurso', cd:10, peso:function(st){return st.clima.chuva>18&&!st.clima.acido?40:0;},
 txt:'Chove de verdade. Todo recipiente disponível foi posto para fora.',
 efe:function(a){ var q=Math.round(a.rng.int(120,420)*(1+_predio(a.st,'cisterna')*0.35)); a.mat('agua',q);
   a.log('+'+q+' L captados. Alguém dançou na chuva. Deng fingiu não ver.','good'); a.moralAll(+4); }},

{id:'chuva_acida', n:'Chuva ácida', cat:'crise', cd:14, peso:function(st){return st.clima.acido?60:0;},
 txt:'pH 4,8. Queima folha jovem e ataca contato elétrico exposto.',
 efe:function(a){ a.st.agricultura.lotes.forEach(function(l){ if(l.crop&&!l.protegido) l.saude-=a.rng.int(8,22); });
   if(!_tem(a.st,'plasticos')) a.st.energia.penalidade+=0.3;
   a.log('Lavoura a céu aberto danificada e contatos corroídos.','warn'); }},

{id:'incendio_capim', n:'Incêndio de capim-vidro', cat:'crise', cd:50,
 peso:function(st){ return (st.clima.estacao==='escaldo'&&st.clima.temp>32)?45:0; },
 txt:'O capim-vidro acumula sílica e queima como estopa. A frente de fogo tem 2 km de largura e vem com o vento.',
 escolhas:[
  {t:'Aceiro: queimar uma faixa antes que o fogo chegue', d:'Custa trabalho. Salva quase tudo.',
   ef:function(a){ a.perdaTrabalho(0.55); a.log('O aceiro segurou. O acampamento ficou cercado por 3 km de cinza preta.','good'); a.mat('biomassa',60); }},
  {t:'Molhar o perímetro com a reserva de água', d:'Custa muita água. Funciona quase sempre.',
   ef:function(a){ a.mat('agua',-Math.min(a.st.mat.agua,600));
     a.log('600 L de água potável jogados no chão. Funcionou. Lindqvist quase teve um colapso.','warn'); }},
  {t:'Evacuar para o leito do rio', d:'Perde estruturas leves. Ninguém morre.',
   ef:function(a){ a.destruir('tenda',2); a.perdaTrabalho(0.4); a.moralAll(-8);
     a.log('Duas tendas e parte do estoque exposto viraram cinza. Todos vivos.','bad'); a.perderRecurso(0.12); }}
 ]},

{id:'primeiro_metal', n:'O primeiro metal', cat:'descoberta', cd:999,
 peso:function(st){ return (st.mat.ferro>=20&&!st.flags.primeiroMetal)?100:0; },
 txt:'Watanabe tira a esponja de ferro da bloomery e a martela até virar uma barra. É feia, porosa, cheia de escória.',
 efe:function(a){ a.st.flags.primeiroMetal=true; a.moralAll(+14);
   a.log('É a primeira barra de ferro fundida por seres humanos neste planeta. Petrov guardou-a. Ninguém vai usá-la nunca.','good'); }},

{id:'primeira_colheita', n:'A primeira colheita', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.jaColheu&&!st.flags.primeiraColheita)?100:0; },
 txt:'Batata. Pequena, irregular, crescida em loess corrigido com cal e guano de morcego-eco.',
 efe:function(a){ a.st.flags.primeiraColheita=true; a.moralAll(+20);
   a.log('Comida nascida em Elysium. Okonkwo não conseguiu falar durante o jantar.','good'); }},

{id:'nascimento', n:'Nascimento', cat:'descoberta', cd:999,
 peso:function(st){ return (st.flags.gravidez&&st.sol>=st.flags.gravidez)?100:0; },
 txt:'Depois de 22 horas de trabalho de parto, com Nakamura e Moreau na sala, nasce a primeira pessoa de Elysium.',
 efe:function(a){ a.st.flags.gravidez=null;
   if(_tem(a.st,'medicina_mod')||_predio(a.st,'hospital')>0||a.rng.chance(0.72)){
     a.nascer(); a.moralAll(+30); a.log('Mãe e criança bem. A colônia deixou de ser uma tripulação e virou um povo.','good'); }
   else { a.moralAll(-25); a.log('Complicações. Nakamura fez tudo o que era possível fazer com o que existia. Não foi suficiente.','bad'); } }},

{id:'expedicao_perdida', n:'Expedição em apuros', cat:'crise', cd:20,
 peso:function(st){ return st.trabalhoExploracao>0? 24*(1-(st.bonus.riscoExped||1)*0.3):0; },
 txt:'A equipe de campo não voltou no horário. O rádio, se existisse, resolveria isto.',
 efe:function(a){ var cand=_vivos(a.st).filter(function(c){return c.trabalho==='explorar';});
   if(!cand.length) return; var c=a.rng.pick(cand);
   if(a.rng.chance(0.6)){ c.fadiga+=30; c.saude-=10; a.log(c.nome+' voltou seis horas atrasado, desidratado, mas com o levantamento completo.','warn'); }
   else { a.ferir(c.id,'Fratura em terreno remoto',a.rng.int(35,65),a.rng.int(10,25)); a.moralAll(-7);
     a.log(c.nome+' caiu a 9 km da base. Levaram um sol inteiro para trazê-lo.','bad'); a.perdaTrabalho(0.3); } }},

{id:'cavernas_desc', n:'As Cavernas de Kore', cat:'descoberta', cd:999,
 peso:function(st){ return (st.setores['K6']&&st.setores['K6'].explorado>=50&&!st.flags.cavernas)?85:0; },
 txt:'A boca da caverna sopra ar quente e cheira a amônia. Lá dentro: milhões de morcegos-eco e sessenta metros de guano fóssil.',
 efe:function(a){ a.st.flags.cavernas=true; a.mat('nitrato',a.rng.int(80,200)); a.mat('fosfato',a.rng.int(40,120));
   a.log('Nitrato e fosfato: exatamente os dois nutrientes que faltam ao loess. O CO₂ lá dentro é letal — só entra quem tiver como respirar.','good'); a.moralAll(+8); }},

{id:'sono_27h', n:'A dessincronia cobra', cat:'saude', cd:30, peso:function(st){return st.sol>15?30:0;},
 txt:'O corpo humano tem um relógio de 24 h. O sol daqui tem 27,4. Depois de algumas semanas, a conta chega.',
 efe:function(a){ _vivos(a.st).forEach(function(c){ if(a.rng.chance(0.5)){ c.fadiga+=a.rng.int(6,16); c.humor-=5; } });
   if(_tem(a.st,'organizacao')) a.log('Os turnos escalonados amortecem o efeito, mas não o eliminam.','info');
   else a.log('Erros de julgamento, irritação, microssonos durante o trabalho. Existe protocolo para isso na biblioteca.','warn'); }},

{id:'diop_fala', n:'Diop finalmente fala', cat:'social', cd:999,
 peso:function(st){ var d=st.crew.filter(function(c){return c.id==='diop';})[0];
   return (d&&d.vivo&&st.sol>50&&_tem(st,'organizacao'))?40:0; },
 txt:'Amara Diop, que não fala com ninguém desde o pouso, pede a palavra no jantar.',
 efe:function(a){ a.st.tech.pp+=25; a.moralAll(+8); a.moralOne('diop',+22);
   var d=a.st.crew.filter(function(c){return c.id==='diop';})[0]; if(d){ var i=d.tracos.indexOf('introvertido'); if(i>=0) d.tracos.splice(i,1); }
   a.log('Ela vinha modelando o consumo da colônia sozinha há 50 sols. Tinha três otimizações prontas. Ninguém perguntou. (+25 PP)','good'); }},

{id:'brandt_pulmao', n:'O pulmão de Brandt', cat:'saude', cd:80,
 peso:function(st){ var b=st.crew.filter(function(c){return c.id==='brandt';})[0]; return (b&&b.vivo&&st.sol>60)?30:0; },
 txt:'Brandt tossiu sangue na oficina e tentou limpar antes que alguém visse. Aduba viu.',
 efe:function(a){ var b=a.st.crew.filter(function(c){return c.id==='brandt';})[0];
   b.saude-=a.rng.int(8,18); b.ferimento={n:'Fibrose pulmonar avançada',sev:45,dias:999};
   a.log('O CO₂ de 1,2% está matando Brandt devagar. Sem ar filtrado, ele não chega ao Gélido.','bad'); a.moralAll(-7); }},

{id:'salazar_perna', n:'A perna de Salazar', cat:'saude', cd:999,
 peso:function(st){ var s=st.crew.filter(function(c){return c.id==='salazar';})[0];
   return (s&&s.vivo&&s.ferimento&&st.sol>4&&!st.flags.salazarResolvido)?80:0; },
 txt:'A fratura não consolidou. Nakamura diz que ou entra uma haste intramedular hoje, ou a perna sai.',
 escolhas:[
  {t:'Imprimir haste de titânio na Vulcan-M', d:'0,9 kg de titânio e 19 kWh. Salva a perna.',
   ef:function(a){ if(a.st.mat.titanio>=0.9&&a.st.energia.armazenada>19){ a.mat('titanio',-0.9); a.st.energia.armazenada-=19;
       a.st.flags.salazarResolvido='haste'; var s=a.st.crew.filter(function(c){return c.id==='salazar';})[0];
       s.ferimento.sev=30; s.ferimento.dias=22; a.moralAll(+10);
       a.log('Cirurgia de quatro horas com anestesia insuficiente. A haste entrou. Ele vai voltar a andar.','good'); }
     else { a.log('Não havia titânio ou energia suficiente. A decisão foi tomada por você sem que você percebesse.','bad'); } }},
  {t:'Amputar acima do joelho', d:'Salva a vida. Custa um piloto e muita moral.',
   ef:function(a){ a.st.flags.salazarResolvido='amputado'; var s=a.st.crew.filter(function(c){return c.id==='salazar';})[0];
     s.ferimento=null; s.saude=52; s.moral-=30; s.per.pilotagem=Math.max(0,s.per.pilotagem-1); s.amputado=true;
     a.moralAll(-14); a.log('Nakamura amputou com serra de campo. Salazar não gritou. Isso foi pior.','bad'); }},
  {t:'Esperar mais. Talvez consolide sozinha', d:'Aposta. Se falhar, ele morre de sepse.',
   ef:function(a){ if(a.rng.chance(0.3)){ a.st.flags.salazarResolvido='consolidou'; var s=a.st.crew.filter(function(c){return c.id==='salazar';})[0];
       s.ferimento.sev=25; a.log('Contra todas as expectativas, consolidou. Ele vai mancar para sempre.','good'); }
     else { a.matar('salazar','Sepse por fratura exposta'); a.moralAll(-26);
       a.log('Sepse em quatro sols. Nakamura não falou com Vosk por dez sols.','bad'); } }}
 ]},

{id:'visita_kore', n:'Kore em perigeu total', cat:'clima', cd:57, peso:function(st){return (st.sol%19)<1?25:0;},
 txt:'Kore ocupa quase quatro graus do céu. Dá para ver crateras a olho nu. A maré do Thalassa sobe 11 metros.',
 efe:function(a){ a.moralAll(+3); a.log('Metade da colônia ficou acordada olhando. Nenhum custo. Valeu a pena.','info'); }},

{id:'gelido_morte', n:'Noite de −31 °C', cat:'crise', cd:12,
 peso:function(st){ return (st.clima.tempMin<-20&&st.abrigoDeficit>0)?80:0; },
 txt:'A mínima bateu −31 °C e há gente dormindo em tenda.',
 efe:function(a){ var v=_vivos(a.st); a.rng.shuffle(v);
   var n=Math.min(a.st.abrigoDeficit,v.length);
   for(var i=0;i<n;i++){ v[i].saude-=a.rng.int(12,30); v[i].fadiga+=20;
     if(v[i].saude<12&&a.rng.chance(0.3)) a.matar(v[i].id,'Hipotermia'); }
   a.log(n+' pessoas passaram a noite sem abrigo adequado.','bad'); a.moralAll(-10); }},

{id:'zhao_queda', n:'Zhao cai', cat:'crise', cd:60,
 peso:function(st){ var z=st.crew.filter(function(c){return c.id==='zhao';})[0];
   return (z&&z.vivo&&z.trabalho&&(z.trabalho==='explorar'||z.trabalho.indexOf('ext:')===0))?30:0; },
 txt:'Ela subiu sozinha num afloramento instável. De novo. Todo mundo já tinha avisado. Duas vezes.',
 efe:function(a){ a.ferir('zhao','Politraumatismo por queda',a.rng.int(40,75),a.rng.int(12,30));
   a.moralAll(-6); a.log('Doze metros. Ela estava certa sobre o veio de calcopirita. Isso não ajuda muito agora.','bad'); }},

{id:'motor_novo', n:'Brandt improvisa', cat:'recurso', cd:60,
 peso:function(st){ var b=st.crew.filter(function(c){return c.id==='brandt';})[0]; return (b&&b.vivo&&st.mat.sucata>200)?24:0; },
 txt:'Brandt passou o turno de folga montando alguma coisa com sucata da seção 3.',
 efe:function(a){ a.mat('sucata',-a.rng.int(60,140));
   var o=a.rng.pick(['engrenagem','rolamento','corda','cabo']);
   var q=a.rng.int(10,40); a.mat(o,q);
   a.log('+'+q+' '+EL.MAT[o].n+'. "Sobrou peça", ele disse. Ninguém acredita que sobrou.','good'); a.moralAll(+3); }},

{id:'petrov_projeto', n:'Petrov apresenta um projeto', cat:'social', cd:70,
 peso:function(st){ return (st.sol>35&&st.flags.comandoResolvido)?24:0; },
 txt:'Petrov desenhou, à mão, uma planta completa de expansão da colônia para 200 habitantes.',
 efe:function(a){ a.st.bonus.construcao=(a.st.bonus.construcao||1)+0.08; a.moralAll(+6); a.moralOne('petrov',+12);
   a.log('É bom. É muito bom. Construção +8% permanente. Ele levou 40 sols de noites para fazer isso.','good'); }},

{id:'antonova_reator', n:'Antonova tem um plano', cat:'social', cd:999,
 peso:function(st){ return (_tem(st,'eletricidade')&&!st.flags.antonovaPlano)?45:0; },
 txt:'Ela desenrola no chão do refeitório um projeto de reator de fissão desenhado nas costas de folhas de inventário.',
 efe:function(a){ a.st.flags.antonovaPlano=true; a.st.tech.pp+=35; a.moralOne('antonova',+16);
   a.log('Faltam trinta anos-luz de indústria para construir isso. Mas o projeto existe, e está correto. (+35 PP)','good'); }},

{id:'silencio', n:'Silêncio de rádio', cat:'social', cd:120, peso:function(st){return st.sol>90?16:0;},
 txt:'Alguém deixou o receptor de longo alcance ligado a noite toda, apontado para a Terra. Ninguém desligou.',
 efe:function(a){ a.moralAll(-6); a.log('Vinte e dois anos-luz de estática. Todos ouviram e ninguém comentou no café da manhã.','warn'); }}
];

EL.eventoPorId = function(id){ for(var i=0;i<EL.EVENTOS.length;i++) if(EL.EVENTOS[i].id===id) return EL.EVENTOS[i]; return null; };
