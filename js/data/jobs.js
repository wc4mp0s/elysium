/* PROJECT ELYSIUM — postos de trabalho fixos.
   Os postos de extração são gerados dinamicamente a partir de EL.RECURSOS
   e do setor em que a colônia consegue operar (ver sim.js). */
var EL = window.EL || {}; window.EL = EL;

EL.JOBS = [
{id:'descanso', n:'Descanso', cat:'Vida', per:null, tipo:'descanso',
 d:'Recupera fadiga em dobro e devolve moral. Ninguém aguenta 100 sols seguidos.'},

{id:'construir', n:'Obras', cat:'Trabalho', per:'construcao', tipo:'construir',
 d:'Aplica trabalho à fila de construção. Sem gente aqui, nada é erguido.'},

{id:'fabricar', n:'Oficina', cat:'Trabalho', per:'fabricacao', tipo:'fabricar',
 d:'Processa a fila de produção: tijolo, ferro, cabo, o que estiver na lista.'},

{id:'pesquisar', n:'Pesquisa', cat:'Ciência', per:'*ciencia', tipo:'pesquisar',
 d:'Gera PP. Limitado pelas vagas de laboratório existentes.'},

{id:'medico', n:'Enfermaria', cat:'Vida', per:'medicina', tipo:'medico',
 d:'Trata feridos e doentes. Sem isso, uma infecção vira um funeral.'},

{id:'agricultura', n:'Lavoura', cat:'Alimento', per:'agricultura', tipo:'agricultura',
 d:'Semear, irrigar, capinar, colher. Cada lote exige atenção contínua.'},

{id:'guarda', n:'Guarda perimetral', cat:'Defesa', per:'combate', tipo:'guarda',
 d:'Vigilância noturna. Reduz drasticamente o dano de ataques de fauna.'},

{id:'manutencao', n:'Manutenção', cat:'Trabalho', per:'mecanica', tipo:'manutencao',
 d:'Combate o desgaste, a espora-cinza e a entropia. Prédios sem manutenção quebram.'},

{id:'apoio', n:'Apoio psicológico', cat:'Vida', per:'psicologia', tipo:'apoio',
 d:'Escuta, mediação, ritual. Segura a moral e desarma conflitos antes que explodam.'},

{id:'ensino', n:'Ensino', cat:'Ciência', per:'ensino', tipo:'ensino',
 d:'Transfere perícia dos veteranos para quem tem menos. O único jeito de crescer.'},

{id:'cozinha_j', n:'Cozinha e racionamento', cat:'Alimento', per:'logistica', tipo:'cozinha',
 d:'Extrai mais caloria da mesma ração e reduz perdas de estoque.'},

{id:'reciclar', n:'Desmonte do casco', cat:'Trabalho', per:'fabricacao', tipo:'reciclar',
 d:'Corta e classifica a NAV Perseverança. Fonte finita: 2.300 kg de liga e 1.240 de sucata.'},

{id:'explorar', n:'Expedição', cat:'Exploração', per:'sobrevivencia', tipo:'explorar',
 d:'Levanta um setor a pé. Lento, perigoso e a única forma de conhecer o terreno de perto.'},

{id:'robotica_j', n:'Manutenção robótica', cat:'Trabalho', per:'robotica', tipo:'robotica',
 d:'Repara e melhora ATLAS-1 e o KITE. Sem isso, eles se degradam até parar.'}
];

EL.jobPorId = function (id) {
  for (var i = 0; i < EL.JOBS.length; i++) if (EL.JOBS[i].id === id) return EL.JOBS[i];
  return null;
};

/* Perícias que contam como "ciência" para pesquisa */
EL.PER_CIENCIA = ['fisica','quimica','biologia','geologia','programacao','engenharia','medicina','hidrologia','energia','eletronica'];

/* ================= RECEITAS DA OFICINA ================= */
EL.RECEITAS = [
{id:'tijolo',    n:'Tijolo',            tec:'ceramica',        pt:1.0, ent:{argila:60},                sai:{tijolo:100}},
{id:'ceramica',  n:'Cerâmica',          tec:'ceramica',        pt:1.2, ent:{argila:40},                sai:{ceramica:20}},
{id:'cal',       n:'Cal',               tec:'cal_argamassa',   pt:1.0, ent:{calcario:100,carvao_veg:12}, sai:{cal:60}},
{id:'carvao_veg',n:'Carvão vegetal',    tec:'carvoaria',       pt:0.8, ent:{biomassa:100},             sai:{carvao_veg:32}},
{id:'coque',     n:'Coque',             tec:'carvoaria',       pt:1.0, ent:{carvao_min:100},           sai:{coque:62}},
{id:'ferro',     n:'Ferro',             tec:'forja_primitiva', pt:1.6, ent:{min_ferro:120,carvao_veg:40}, sai:{ferro:44}},
{id:'ferro_met', n:'Ferro meteorítico forjado', tec:'forja_primitiva', pt:1.2, ent:{fe_meteor:60,carvao_veg:16}, sai:{aco:42}},
{id:'cobre',     n:'Cobre',             tec:'fundicao_cobre',  pt:1.5, ent:{min_cobre:100,carvao_veg:34}, sai:{cobre:36}},
{id:'estanho',   n:'Estanho',           tec:'fundicao_cobre',  pt:1.4, ent:{min_estanho:100,carvao_veg:30}, sai:{bronze:0,zinco:0,chumbo:28}},
{id:'bronze',    n:'Bronze',            tec:'bronze',          pt:1.4, ent:{cobre:70,min_estanho:40,carvao_veg:20}, sai:{bronze:90}},
{id:'aco',       n:'Aço',               tec:'siderurgia',      pt:1.8, ent:{ferro:100,coque:35},       sai:{aco:88}},
{id:'aco_liga',  n:'Aço-liga',          tec:'aco_liga_tec',    pt:2.2, ent:{aco:100,cromita:25,min_niquel:15}, sai:{aco_liga:96}},
{id:'zinco',     n:'Zinco',             tec:'siderurgia',      pt:1.6, ent:{min_zinco:100,coque:30},   sai:{zinco:42}},
{id:'chumbo',    n:'Chumbo',            tec:'siderurgia',      pt:1.5, ent:{min_chumbo:100,coque:26},  sai:{chumbo:52}},
{id:'aluminio',  n:'Alumínio',          tec:'aluminio_tec',    pt:2.4, ent:{bauxita:200,grafita:30},   sai:{aluminio:48}, energia:26},
{id:'titanio_p', n:'Titânio (Kroll)',   tec:'metalurgia_ti',   pt:3.0, ent:{ilmenita:200,carvao_veg:60}, sai:{titanio:34}, energia:32},
{id:'vidro',     n:'Vidro',             tec:'vidraria',        pt:1.4, ent:{areia:100,cal:20,carvao_veg:22}, sai:{vidro:70}},
{id:'cimento',   n:'Cimento',           tec:'concreto_tec',    pt:1.6, ent:{calcario:150,argila:50,carvao_veg:34}, sai:{cimento:120}},
{id:'concreto',  n:'Concreto',          tec:'concreto_tec',    pt:1.0, ent:{cimento:100,areia:200,pedra:300,agua:120}, sai:{concreto:580}},
{id:'tecido',    n:'Tecido',            tec:'tecelagem',       pt:1.2, ent:{fibra:40},                 sai:{tecido:26}},
{id:'corda',     n:'Corda',             tec:null,              pt:0.8, ent:{fibra:20},                 sai:{corda:44}},
{id:'papel',     n:'Papel',             tec:'tecelagem',       pt:1.0, ent:{fibra:30,cal:8},           sai:{papel:50}},
{id:'sabao',     n:'Sabão',             tec:'saneamento',      pt:1.0, ent:{cal:30,biodiesel:20},      sai:{sabao:34}},
{id:'carvao_at', n:'Carvão ativado',    tec:'purificacao_agua',pt:0.9, ent:{carvao_veg:40},            sai:{zeolita:24}},
{id:'acido_sulf',n:'Ácido sulfúrico',   tec:'acido_sulfurico', pt:1.8, ent:{enxofre:60,agua:80,chumbo:4}, sai:{acido_sulf:110}},
{id:'amonia',    n:'Amônia',            tec:'haber_bosch',     pt:2.0, ent:{hidrogenio:60},            sai:{amonia:90}, energia:18},
{id:'fertilizante',n:'Fertilizante NPK',tec:'quimica_ind',     pt:1.2, ent:{nitrato:40,fosfato:30,silvita:30}, sai:{fertilizante:96}},
{id:'fert_haber',n:'Fertilizante sintético', tec:'haber_bosch',pt:1.4, ent:{amonia:60,fosfato:30,silvita:30}, sai:{fertilizante:240}},
{id:'plastico',  n:'Plástico',          tec:'plasticos',       pt:1.6, ent:{metano:60,acido_sulf:20},  sai:{plastico:70}, energia:8},
{id:'borracha',  n:'Borracha',          tec:'plasticos',       pt:1.4, ent:{biomassa:120,enxofre:10},  sai:{borracha:38}},
{id:'cabo',      n:'Cabo elétrico',     tec:'trefilacao',      pt:1.2, ent:{cobre:30,plastico:8},      sai:{cabo:120}},
{id:'engrenagem',n:'Engrenagem',        tec:'siderurgia',      pt:1.4, ent:{aco:40},                   sai:{engrenagem:16}},
{id:'rolamento', n:'Rolamento',         tec:'maquinas_ferr',   pt:1.6, ent:{aco:30,corindon:6},        sai:{rolamento:14}},
{id:'motor',     n:'Motor elétrico',    tec:'motor_eletrico',  pt:2.4, ent:{cobre:60,aco:80,rolamento:4}, sai:{motor:2}},
{id:'turbina',   n:'Turbina',           tec:'maquinas_ferr',   pt:3.2, ent:{aco_liga:200,rolamento:8}, sai:{turbina:1}},
{id:'silicio',   n:'Silício grau eletrônico', tec:'silicio_tec', pt:2.6, ent:{quartzo:120,carvao_veg:40}, sai:{silicio:26}, energia:22},
{id:'componente',n:'Componente eletrônico', tec:'semicondutores', pt:2.0, ent:{silicio:20,cobre:10,vidro:8}, sai:{componente:40}, energia:6},
{id:'circuito',  n:'Circuito integrado',tec:'computacao',      pt:2.8, ent:{silicio:30,ouro:0.3,componente:20}, sai:{circuito:12}, energia:14},
{id:'painel_pv', n:'Painel fotovoltaico',tec:'fotovoltaico',   pt:2.2, ent:{silicio:40,vidro:60,cabo:30,aluminio:20}, sai:{painel_pv:6}, energia:12},
{id:'celula_bat',n:'Célula de bateria', tec:'baterias',        pt:1.8, ent:{chumbo:60,acido_sulf:40,plastico:12}, sai:{celula_bat:8}},
{id:'biodiesel', n:'Biodiesel',         tec:'quimica_ind',     pt:1.2, ent:{biomassa:200},             sai:{biodiesel:60}},
{id:'metano_p',  n:'Metano (biodigestor)', tec:'biodigestao',  pt:1.0, ent:{biomassa:150,agua:60},     sai:{metano:80}},
{id:'hidrogenio',n:'Hidrogênio (eletrólise)', tec:'cloro_alcali', pt:1.2, ent:{agua:100},              sai:{hidrogenio:90,oxigenio:45}, energia:24},
{id:'medicamento',n:'Suprimento médico',tec:'medicina_mod',    pt:1.6, ent:{biomassa:60,acido_sulf:20,vidro:10}, sai:{medicamento:24}},
{id:'antibiotico',n:'Antibiótico',      tec:'biotecnologia',   pt:2.2, ent:{biomassa:100,medicamento:6}, sai:{antibiotico:14}},
{id:'urania',    n:'Urânio enriquecido',tec:'fissao',          pt:4.0, ent:{uraninita:400,acido_sulf:200}, sai:{urania:12}, energia:120},
{id:'supercond', n:'Supercondutor',     tec:'supercondutores', pt:3.6, ent:{monazita:120,cobre:80,oxigenio:40}, sai:{supercond:22}, energia:60},
{id:'deuterio',  n:'Deutério',          tec:'fusao',           pt:3.0, ent:{agua:2000},                sai:{deuterio:9}, energia:80},
{id:'combustivel',n:'Propelente',       tec:'foguetes',        pt:2.6, ent:{hidrogenio:200,oxigenio:400}, sai:{combustivel:340}, energia:40},
{id:'semente_p', n:'Multiplicar sementes', tec:'agricultura_bas', pt:1.0, ent:{comida:14},             sai:{semente:1.6}}
];

EL.receitaPorId = function (id) {
  for (var i = 0; i < EL.RECEITAS.length; i++) if (EL.RECEITAS[i].id === id) return EL.RECEITAS[i];
  return null;
};
