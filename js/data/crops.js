/* PROJECT ELYSIUM — cultivares do banco de sementes (214 espécies; 16 viáveis a curto prazo)
   dias   = sols da semeadura à colheita (fotoperíodo de 27,4 h já embutido)
   agua   = L por lote por sol
   rend   = rações produzidas por lote colhido
   tMin/tMax = faixa térmica tolerada; fora dela, perda proporcional
   n/p/k  = consumo de nutrientes do solo por ciclo
   praga  = suscetibilidade (0–1) ao enxame-mandíbula e a fungos */
var EL = window.EL || {}; window.EL = EL;

EL.CROPS = [
{id:'batata',   n:'Batata (cultivar anão)', dias:78, agua:8, rend:230, tMin:3,  tMax:27, n:22,p:14,k:30, praga:0.35, sem:0.35,
 d:'Caloria por metro quadrado imbatível. A âncora alimentar de qualquer colônia.'},
{id:'trigo',    n:'Trigo anão de ciclo curto', dias:96, agua:7, rend:170, tMin:2, tMax:31, n:30,p:12,k:18, praga:0.5, sem:0.3,
 d:'Pão. Também palha, cobertura morta e substrato para fungos.'},
{id:'soja',     n:'Soja', dias:104, agua:9, rend:190, tMin:9, tMax:33, n:-18,p:16,k:22, praga:0.45, sem:0.32,
 d:'Fixa nitrogênio: devolve solo melhor do que pegou. Proteína e óleo.'},
{id:'quinoa',   n:'Quinoa', dias:88, agua:4, rend:130, tMin:-2, tMax:30, n:18,p:10,k:16, praga:0.25, sem:0.25,
 d:'Aguenta sal, seca e frio. O seguro contra estação ruim.'},
{id:'colza',    n:'Colza', dias:92, agua:6, rend:90, tMin:1, tMax:28, n:26,p:14,k:20, praga:0.4, sem:0.28, oleo:45,
 d:'Óleo alimentar, biodiesel e lubrificante. Colônia sem óleo não fabrica nada.'},
{id:'kale',     n:'Couve resistente', dias:46, agua:8, rend:70, tMin:-6, tMax:26, n:20,p:8,k:14, praga:0.55, sem:0.18,
 d:'Rápida, nutritiva, sobrevive à geada. A primeira coisa verde a comer.'},
{id:'cenoura',  n:'Cenoura', dias:68, agua:7, rend:110, tMin:0, tMax:27, n:14,p:12,k:24, praga:0.3, sem:0.2,
 d:'Caroteno. Sem ela, começam os problemas de visão noturna no sol longo.'},
{id:'tomate',   n:'Tomate de estufa', dias:82, agua:12, rend:120, tMin:12, tMax:32, n:24,p:18,k:32, praga:0.6, sem:0.22, estufa:true,
 d:'Exige estufa na planície. Vitamina C e um enorme ganho de moral.'},
{id:'feijao',   n:'Feijão-caupi', dias:72, agua:8, rend:150, tMin:11, tMax:35, n:-14,p:12,k:18, praga:0.4, sem:0.26,
 d:'Fixa nitrogênio, tolera calor e seca. Companheiro perfeito do trigo.'},
{id:'amaranto', n:'Amaranto', dias:74, agua:5, rend:120, tMin:6, tMax:36, n:16,p:10,k:14, praga:0.2, sem:0.2,
 d:'Grão e folha. Praticamente indestrutível — inclusive no Escaldo.'},
{id:'chlorella',n:'Chlorella (tanque)', dias:22, agua:7, rend:100, tMin:14, tMax:30, n:12,p:10,k:8, praga:0.1, sem:0.12, tanque:true,
 d:'Alga em tanque coberto: 22 sols do zero à colheita, imune ao frio da planície. A resposta para o vão alimentar dos primeiros 60 sols.'},
{id:'azolla',   n:'Azolla (tanque)', dias:18, agua:8, rend:60, tMin:12, tMax:32, n:-24,p:6,k:6, praga:0.1, sem:0.1, tanque:true,
 d:'Duplica em 4 sols e fixa nitrogênio da atmosfera. Adubo verde e ração.'},
{id:'algodao',  n:'Algodão', dias:118, agua:11, rend:0, tMin:14, tMax:37, n:26,p:14,k:22, praga:0.5, sem:0.3, fibra:34,
 d:'Não alimenta. Veste — e no Gélido isso é a mesma coisa.'},
{id:'canhamo',  n:'Cânhamo', dias:86, agua:8, rend:0, tMin:6, tMax:33, n:22,p:12,k:20, praga:0.25, sem:0.26, fibra:52,
 d:'Fibra estrutural, corda, papel e celulose. O material mais versátil do banco.'},
{id:'beterraba',n:'Beterraba sacarina', dias:98, agua:9, rend:140, tMin:2, tMax:29, n:24,p:14,k:34, praga:0.35, sem:0.24, acucar:80,
 d:'Açúcar: caloria densa, conservante e substrato de fermentação.'},
{id:'girassol', n:'Girassol', dias:90, agua:7, rend:80, tMin:7, tMax:34, n:22,p:16,k:24, praga:0.3, sem:0.26, oleo:60,
 d:'Óleo e proteína. As raízes quebram o loess compactado.'}
];

EL.cropPorId = function (id) {
  for (var i = 0; i < EL.CROPS.length; i++) if (EL.CROPS[i].id === id) return EL.CROPS[i];
  return null;
};

/* Solo inicial de F6: loess vulcânico. Alcalino, salgado, sem nitrogênio nem matéria orgânica. */
EL.SOLO_INICIAL = { ph:8.4, n:14, p:10, k:52, org:3, sal:0.31 };

/* Pragas e doenças de lavoura */
EL.PRAGAS = [
{id:'enxame', n:'Enxame-mandíbula', est:'cinzeiro', dano:0.75, d:'Nuvem migratória. Devasta o que não estiver sob vidro.'},
{id:'ferrugem', n:'Ferrugem-de-espora', est:'verdejo', dano:0.30, d:'Fungo nativo que ataca folha larga na umidade.'},
{id:'roedor', n:'Roedor-espinho', est:null, dano:0.18, d:'Ataca o armazenado, não o plantado. Silo hermético resolve.'},
{id:'salinizacao', n:'Salinização', est:'escaldo', dano:0.25, d:'Irrigação sem drenagem no calor traz o sal à superfície.'}
];
