/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Biome, ClassConfig, Room, RoomType } from '../types';

export const CLASSES_DATA: Record<string, ClassConfig> = {
  warrior: {
    name: 'Guerreiro',
    color: '#ef4444',
    baseHp: 120,
    baseMp: 30,
    baseAttack: 16,
    baseDefense: 8,
    weaponName: 'Espada Larga de Ferro',
    armorName: 'Cota de Malha',
    description: 'Um combatente implacável com alta resistência física e técnicas de escudo devastadoras.',
    skills: [
      { name: 'Golpe Brutal', cost: 10, damageMultiplier: 1.8, healMultiplier: 0, type: 'damage', description: 'Ataca com força total causando 180% de dano.' },
      { name: 'Grito de Guerra', cost: 15, damageMultiplier: 1.2, healMultiplier: 0.15, type: 'buff', description: 'Aumenta o ímpeto e cura 15% do HP máximo.' }
    ]
  },
  mage: {
    name: 'Mago',
    color: '#3b82f6',
    baseHp: 80,
    baseMp: 90,
    baseAttack: 22,
    baseDefense: 3,
    weaponName: 'Cajado de Aprendiz',
    armorName: 'Túnica de Linho',
    description: 'Mestre das artes arcanas capaz de incinerar inimigos com feitiços destrutivos e regenerar mana.',
    skills: [
      { name: 'Impacto de Fogo', cost: 12, damageMultiplier: 2.3, healMultiplier: 0, type: 'damage', description: 'Lança uma rajada de fogo causando 230% de dano.' },
      { name: 'Escudo de Mana', cost: 20, damageMultiplier: 0, healMultiplier: 0.5, type: 'heal', description: 'Transmuta energia mágica para curar 50% de HP.' }
    ]
  },
  rogue: {
    name: 'Ladino',
    color: '#10b981',
    baseHp: 95,
    baseMp: 45,
    baseAttack: 19,
    baseDefense: 5,
    weaponName: 'Adagas de Aço',
    armorName: 'Armadura de Couro',
    description: 'Ágil e letal nas sombras, especialista em golpes críticos, sangramentos e evasão rápida.',
    skills: [
      { name: 'Apunhalar', cost: 10, damageMultiplier: 2.0, healMultiplier: 0, type: 'damage', description: 'Atinge pontos vitais causando 200% de dano com chance crítica.' },
      { name: 'Preparação rápida', cost: 15, damageMultiplier: 1.3, healMultiplier: 0.1, type: 'buff', description: 'Ataca rapidamente e cura 10% de HP.' }
    ]
  },
  cleric: {
    name: 'Clérigo',
    color: '#f97316',
    baseHp: 110,
    baseMp: 60,
    baseAttack: 13,
    baseDefense: 7,
    weaponName: 'Maça Sagrada',
    armorName: 'Placas Sacras',
    description: 'Guerreiro sagrado que combina proteção robusta, ataques divinos e milagres de ressurreição.',
    skills: [
      { name: 'Punição Divina', cost: 15, damageMultiplier: 1.6, healMultiplier: 0.2, type: 'damage', description: 'Ataca com luz divina causando 160% de dano e curando 20% do dano causado.' },
      { name: 'Prece Sagrada', cost: 12, damageMultiplier: 0, healMultiplier: 0.6, type: 'heal', description: 'Invoca uma prece pura que cura 60% de HP.' }
    ]
  },
  ranger: {
    name: 'Arqueiro',
    color: '#a855f7',
    baseHp: 100,
    baseMp: 40,
    baseAttack: 18,
    baseDefense: 4,
    weaponName: 'Arco de Caçador',
    armorName: 'Guarda do Vento',
    description: 'Atirador de precisão veloz que controla o campo de batalha de longe com flechas elementais e armadilhas.',
    skills: [
      { name: 'Disparo Perfurante', cost: 10, damageMultiplier: 2.1, healMultiplier: 0, type: 'damage', description: 'Dispara uma flecha pesada que ignora parte da defesa causando 210% de dano.' },
      { name: 'Flecha Curativa', cost: 15, damageMultiplier: 1.4, healMultiplier: 0.2, type: 'heal', description: 'Dispara uma flecha imbuída com seiva da vida que ataca e cura 20%.' }
    ]
  }
};

export const BIOMES_DATA: Biome[] = [
  {
    id: 1,
    name: 'Floresta dos Murmúrios',
    color: '#22c55e',
    hazardName: 'Cipós Venenosos',
    hazardDescription: 'A vegetação viva espreita. Andar por salas desconhecidas pode envenenar o herói causando 3 de dano periódico.',
    ambientEffect: 'Esporos de cura flutuam no ar, ocasionalmente restaurando 10 HP ao se mover.',
    backgroundGradient: 'from-emerald-950 via-green-900 to-zinc-950',
    particleConfig: { color: '#4ade80', speed: 0.8, size: 4, shape: 'circle' },
    enemies: [
      { key: 'slime_esporos', name: 'Slime de Esporos', hpMultiplier: 0.8, atkMultiplier: 0.8 },
      { key: 'goblin_floresta', name: 'Goblin da Floresta', hpMultiplier: 1.0, atkMultiplier: 1.0 },
      { key: 'ent_corrompido', name: 'Ent Corrompido', hpMultiplier: 1.3, atkMultiplier: 1.1 }
    ],
    boss: {
      key: 'boss_guardia_silvestre',
      name: 'Sylvana, a Guardiã Silvestre',
      hpMultiplier: 3.5,
      atkMultiplier: 1.5,
      description: 'Uma dríade corrompida que controla as raízes da floresta e recupera vida sugando a alma do jogador.'
    }
  },
  {
    id: 2,
    name: 'Cavernas de Cristal',
    color: '#06b6d4',
    hazardName: 'Espinhos de Cristal',
    hazardDescription: 'Cristais afiados brotam do solo. Pisá-los causa 8 de dano imediato.',
    ambientEffect: 'Aura cintilante. Inimigos têm 15% de chance de refletir 5 de dano de volta para você.',
    backgroundGradient: 'from-cyan-950 via-sky-900 to-zinc-950',
    particleConfig: { color: '#22d3ee', speed: 1.2, size: 3, shape: 'star' },
    enemies: [
      { key: 'besouro_cristal', name: 'Besouro de Cristal', hpMultiplier: 1.2, atkMultiplier: 0.9 },
      { key: 'gargula_estilhaco', name: 'Gárgula de Estilhaço', hpMultiplier: 1.1, atkMultiplier: 1.2 },
      { key: 'golem_gema', name: 'Golem de Gema', hpMultiplier: 1.5, atkMultiplier: 1.1 }
    ],
    boss: {
      key: 'boss_imperatriz_cristal',
      name: 'Geodia, a Imperatriz de Cristal',
      hpMultiplier: 4.2,
      atkMultiplier: 1.8,
      description: 'Uma entidade cristalina gigante cujos ataques se fragmentam, atingindo o jogador múltiplas vezes.'
    }
  },
  {
    id: 3,
    name: 'Deserto Ardente',
    color: '#f97316',
    hazardName: 'Insolação Extrema',
    hazardDescription: 'O calor escaldante consome suas forças. Se mover gasta 3 HP devido à desidratação extrema.',
    ambientEffect: 'Tempestade de areia periódica. Reduz a cura recebida em 25%.',
    backgroundGradient: 'from-amber-950 via-orange-900 to-zinc-950',
    particleConfig: { color: '#f59e0b', speed: 1.6, size: 2.5, shape: 'line' },
    enemies: [
      { key: 'escorpiao_areia', name: 'Escorpião de Areia', hpMultiplier: 1.0, atkMultiplier: 1.1 },
      { key: 'aparicao_poeira', name: 'Aparição de Poeira', hpMultiplier: 0.9, atkMultiplier: 1.3 },
      { key: 'basilisco_deserto', name: 'Basilisco do Deserto', hpMultiplier: 1.4, atkMultiplier: 1.2 }
    ],
    boss: {
      key: 'boss_devorador_sol',
      name: 'Solis, o Devorador do Sol',
      hpMultiplier: 4.5,
      atkMultiplier: 2.0,
      description: 'Uma serpente colossal forjada em fogo que derrete sua armadura, reduzindo sua defesa a cada turno.'
    }
  },
  {
    id: 4,
    name: 'Tundra Congelada',
    color: '#3b82f6',
    hazardName: 'Piso Deslizante',
    hazardDescription: 'Gelo liso dificulta a locomoção. Ao pisar em certas salas, você é empurrado de volta e perde 5 HP.',
    ambientEffect: 'Frio extremo. Suas habilidades gastam 30% a mais de Mana.',
    backgroundGradient: 'from-blue-950 via-indigo-900 to-zinc-950',
    particleConfig: { color: '#bfdbfe', speed: 0.9, size: 5, shape: 'star' },
    enemies: [
      { key: 'lobo_gelido', name: 'Lobo Gélido', hpMultiplier: 1.1, atkMultiplier: 1.2 },
      { key: 'elemental_gelo', name: 'Elemental de Gelo', hpMultiplier: 1.3, atkMultiplier: 1.3 },
      { key: 'batedor_yeti', name: 'Batedor Yeti', hpMultiplier: 1.6, atkMultiplier: 1.1 }
    ],
    boss: {
      key: 'boss_soberano_inverno',
      name: 'Boreas, o Soberano do Inverno',
      hpMultiplier: 5.0,
      atkMultiplier: 1.7,
      description: 'Um lorde espectral do gelo que congela seus movimentos, impedindo que você use habilidades por 1 turno.'
    }
  },
  {
    id: 5,
    name: 'Pântano Sombrio',
    color: '#84cc16',
    hazardName: 'Gás Metano Explosivo',
    hazardDescription: 'Bolas de gás tóxico inflamam. Salas perigosas explodem tirando 12 HP.',
    ambientEffect: 'Névoa espessa. O mapa do subsolo fica totalmente escondido, precisando andar para revelar.',
    backgroundGradient: 'from-lime-950 via-emerald-950 to-zinc-950',
    particleConfig: { color: '#a3e635', speed: 0.6, size: 6, shape: 'circle' },
    enemies: [
      { key: 'slime_lama', name: 'Slime de Lama', hpMultiplier: 1.3, atkMultiplier: 1.0 },
      { key: 'bruxa_pantano', name: 'Bruxa do Pântano', hpMultiplier: 1.1, atkMultiplier: 1.4 },
      { key: 'espreitador_pantano', name: 'Espreitador do Pântano', hpMultiplier: 1.5, atkMultiplier: 1.2 }
    ],
    boss: {
      key: 'boss_patriarca_nox',
      name: 'Patriarca Nox, o Senhor da Lama',
      hpMultiplier: 5.5,
      atkMultiplier: 1.9,
      description: 'Uma aberração pantanosa que envenena o jogador, tirando 5 HP por turno durante todo o combate.'
    }
  },
  {
    id: 6,
    name: 'Mina Abandonada',
    color: '#78716c',
    hazardName: 'Desmoronamento',
    hazardDescription: 'As vigas de madeira estão podres. Piscar de olhos e pedras caem do teto tirando 10 HP.',
    ambientEffect: 'Barris de pólvora. Acertar um crítico inflama o barril, causando 15 de dano ao inimigo e herói.',
    backgroundGradient: 'from-stone-900 via-zinc-900 to-black',
    particleConfig: { color: '#d6d3d1', speed: 1.1, size: 3.5, shape: 'square' },
    enemies: [
      { key: 'morcego_caverna', name: 'Morcego de Caverna', hpMultiplier: 1.0, atkMultiplier: 1.2 },
      { key: 'minerador_mortovivo', name: 'Minerador Morto-Vivo', hpMultiplier: 1.4, atkMultiplier: 1.3 },
      { key: 'aranha_pedra', name: 'Aranha de Pedra', hpMultiplier: 1.3, atkMultiplier: 1.4 }
    ],
    boss: {
      key: 'boss_colosso_encouracado',
      name: 'Ironclad, o Colosso Mecânico',
      hpMultiplier: 6.0,
      atkMultiplier: 2.1,
      description: 'Uma enorme máquina de mineração descontrolada com blindagem intransponível. Reduz o dano recebido em 30%.'
    }
  },
  {
    id: 7,
    name: 'Vulcão Infernal',
    color: '#ef4444',
    hazardName: 'Placa de Magma',
    hazardDescription: 'Solo derretido em fusão. Pisou, queimou! Tira 15 HP instantaneamente.',
    ambientEffect: 'Calor sufocante. Suas poções curam 40% a menos devido à evaporação das ervas.',
    backgroundGradient: 'from-red-950 via-rose-950 to-black',
    particleConfig: { color: '#f87171', speed: 1.8, size: 3, shape: 'circle' },
    enemies: [
      { key: 'diabrete_lava', name: 'Diabrete de Lava', hpMultiplier: 1.2, atkMultiplier: 1.4 },
      { key: 'esqueleto_cinzas', name: 'Esqueleto de Cinzas', hpMultiplier: 1.3, atkMultiplier: 1.3 },
      { key: 'draco_fogo', name: 'Draco de Fogo', hpMultiplier: 1.7, atkMultiplier: 1.5 }
    ],
    boss: {
      key: 'boss_senhor_fogo',
      name: 'Ignis, o Senhor do Fogo Supremo',
      hpMultiplier: 6.5,
      atkMultiplier: 2.4,
      description: 'A manifestação viva do vulcão. Seus ataques aplicam queima perpétua que consome sua vida rapidamente.'
    }
  },
  {
    id: 8,
    name: 'Templo Celestial',
    color: '#eab308',
    hazardName: 'Instabilidade Gravitacional',
    hazardDescription: 'A gravidade oscila violentamente. Salas com portais puxam o herói e tiram 12 HP.',
    ambientEffect: 'Bênção do Vento. Você tem 20% de chance de esquivar de qualquer ataque inimigo.',
    backgroundGradient: 'from-yellow-950 via-sky-950 to-zinc-950',
    particleConfig: { color: '#fef08a', speed: 1.3, size: 4, shape: 'star' },
    enemies: [
      { key: 'espirito_zefiro', name: 'Espírito do Zéfiro', hpMultiplier: 1.1, atkMultiplier: 1.3 },
      { key: 'valquiria_nuvem', name: 'Valquíria de Nuvem', hpMultiplier: 1.5, atkMultiplier: 1.4 },
      { key: 'gargula_tempestade', name: 'Gárgula de Tempestade', hpMultiplier: 1.6, atkMultiplier: 1.5 }
    ],
    boss: {
      key: 'boss_arbitro_ceu',
      name: 'Caelum, o Árbitro do Céu',
      hpMultiplier: 7.0,
      atkMultiplier: 2.3,
      description: 'Um arcanjo que voa alto e conjura tempestades de raios. A cada 3 turnos, causa 30 de dano inevitável.'
    }
  },
  {
    id: 9,
    name: 'Abismo Marinho',
    color: '#06b6d4',
    hazardName: 'Falta de Oxigênio',
    hazardDescription: 'A pressão e a falta de ar machucam. Cada movimento consome 1 de oxigênio. Sem oxigênio, você perde 10 HP por passo.',
    ambientEffect: 'Bolhas de ar. Salas marcadas com fontes restauram todo seu oxigênio e dão cura.',
    backgroundGradient: 'from-blue-950 via-teal-950 to-black',
    particleConfig: { color: '#2dd4bf', speed: 0.7, size: 4.5, shape: 'circle' },
    enemies: [
      { key: 'agua_viva_abissal', name: 'Água-Viva Abissal', hpMultiplier: 1.4, atkMultiplier: 1.3 },
      { key: 'peixe_lanterna', name: 'Peixe-Lanterna', hpMultiplier: 1.3, atkMultiplier: 1.5 },
      { key: 'sereia_assassina', name: 'Sereia Assassina', hpMultiplier: 1.6, atkMultiplier: 1.6 }
    ],
    boss: {
      key: 'boss_terror_abismo',
      name: 'Leviathan, o Terror das Profundezas',
      hpMultiplier: 8.0,
      atkMultiplier: 2.6,
      description: 'Um monstro marinho ancestral que arrasta o herói para redemoinhos, reduzindo drasticamente seu dano físico.'
    }
  },
  {
    id: 10,
    name: 'Cidadela do Caos',
    color: '#a855f7',
    hazardName: 'Distorção Espaço-Temporal',
    hazardDescription: 'As paredes mudam de lugar. Passar por anomalias embaralha o mapa e causa 10 de dano mental.',
    ambientEffect: 'Caos absoluto. Seus ataques flutuam entre causar 50% e 200% do dano normal de forma imprevisível.',
    backgroundGradient: 'from-purple-950 via-violet-950 to-black',
    particleConfig: { color: '#c084fc', speed: 1.5, size: 3.5, shape: 'star' },
    enemies: [
      { key: 'fenda_caos', name: 'Fenda do Caos', hpMultiplier: 1.5, atkMultiplier: 1.5 },
      { key: 'espectro_vazio', name: 'Espectro do Vazio', hpMultiplier: 1.6, atkMultiplier: 1.6 },
      { key: 'cavaleiro_caos', name: 'Cavaleiro do Caos', hpMultiplier: 1.9, atkMultiplier: 1.7 }
    ],
    boss: {
      key: 'boss_caos_encarnado',
      name: 'Aethes, o Caos Encarnado',
      hpMultiplier: 10.0,
      atkMultiplier: 3.0,
      description: 'O governante supremo deste universo bizarro, capaz de mimetizar suas próprias habilidades de cura e causar explosões caóticas devastadoras.'
    }
  }
];

// Helper to generate a procedural grid based map for a floor
export function generateMap(biomeId: number, floor: number): Room[][] {
  const size = 5 + Math.floor(floor / 2); // 5x5 for floor 1-2, 6x6 for 3-4, 7x7 for 5
  const map: Room[][] = [];

  for (let y = 0; y < size; y++) {
    const row: Room[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        type: 'empty',
        explored: false
      });
    }
    map.push(row);
  }

  // Always start at (0, size-1)
  const startX = 0;
  const startY = size - 1;
  map[startY][startX].type = 'start';
  map[startY][startX].explored = true;

  // Distribute rooms procedurally
  // 1 boss room on floor 5, else stairs room
  const endX = size - 1;
  const endY = 0;
  map[endY][endX].type = floor === 5 ? 'boss' : 'stairs';

  // Fill in other special rooms
  const totalRooms = size * size;
  const chestCount = Math.floor(totalRooms * 0.15);
  const shrineCount = Math.floor(totalRooms * 0.10);
  const hazardCount = Math.floor(totalRooms * 0.20);
  const enemyCount = Math.floor(totalRooms * 0.25);

  let remainingEmpty: Array<{x: number, y: number}> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x === startX && y === startY) || (x === endX && y === endY)) continue;
      remainingEmpty.push({ x, y });
    }
  }

  // Shuffle empty spaces
  remainingEmpty.sort(() => Math.random() - 0.5);

  const placeRooms = (count: number, type: RoomType) => {
    for (let i = 0; i < count; i++) {
      if (remainingEmpty.length === 0) break;
      const pos = remainingEmpty.pop()!;
      map[pos.y][pos.x].type = type;
    }
  };

  placeRooms(chestCount, 'chest');
  placeRooms(shrineCount, 'shrine');
  placeRooms(hazardCount, 'hazard');
  placeRooms(enemyCount, 'enemy');

  return map;
}
