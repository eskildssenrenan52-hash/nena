// @ts-nocheck
import type { Item, Monster, GameMap, Tile, TileType, MonsterType, CharacterClass, Player, CharacterStats, EliteTier } from './types'
import { buildAbilityStates } from './abilities'
import { createDefaultReputation } from './reputationSystem'
import { createDefaultMasteries } from './masterySystem'
import { createDefaultPets } from './petSystem'
import { createDefaultAchievements } from './advancedAchievements'
import { createDefaultPrestige } from './prestigeSystem'
import { createDefaultSpecializations } from './specializations'
import { generateExtraMap } from './extraBiomes'

// ─── Items Database ─────────────────────────────────────────────────────────

export const ITEMS: Record<string, Item> = {
  // Weapons
  wooden_sword: { id: 'wooden_sword', name: 'Espada de Madeira', type: 'weapon', rarity: 'common', icon: '🗡', description: 'Uma espada tosca de madeira.', stats: { attack: 3 }, value: 10 },
  iron_sword: { id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', rarity: 'common', icon: '⚔', description: 'Uma espada basica de ferro.', stats: { attack: 8 }, value: 80 },
  steel_sword: { id: 'steel_sword', name: 'Espada de Aco', type: 'weapon', rarity: 'uncommon', icon: '⚔', description: 'Forjada em aco resistente.', stats: { attack: 15, critChance: 5 }, value: 300 },
  knight_blade: { id: 'knight_blade', name: 'Lâmina do Cavaleiro', type: 'weapon', rarity: 'rare', icon: '⚔', description: 'A arma preferida dos cavaleiros da guarda.', stats: { attack: 28, defense: 4, critChance: 8 }, value: 1200 },
  titan_sword: { id: 'titan_sword', name: 'Espada do Titan', type: 'weapon', rarity: 'epic', icon: '⚔', description: 'Uma espada lendaria de poder titanico.', stats: { attack: 50, defense: 8, critChance: 12, critDamage: 20 }, value: 5000 },

  wooden_bow: { id: 'wooden_bow', name: 'Arco de Madeira', type: 'weapon', rarity: 'common', icon: '🏹', description: 'Um arco simples de madeira.', stats: { attack: 5, range: 3 }, value: 15 },
  iron_bow: { id: 'iron_bow', name: 'Arco de Ferro', type: 'weapon', rarity: 'common', icon: '🏹', description: 'Um arco reforçado com ferro.', stats: { attack: 12, range: 4 }, value: 100 },
  elven_bow: { id: 'elven_bow', name: 'Arco Élfico', type: 'weapon', rarity: 'rare', icon: '🏹', description: 'Fabricado por elfos mestres.', stats: { attack: 30, range: 5, critChance: 15 }, value: 1500 },
  titan_bow: { id: 'titan_bow', name: 'Arco do Titan', type: 'weapon', rarity: 'epic', icon: '🏹', description: 'Flechas que rasgam o ar como raios.', stats: { attack: 55, range: 6, critChance: 18, critDamage: 25 }, value: 5500 },

  bone_scythe: { id: 'bone_scythe', name: 'Foice de Osso', type: 'weapon', rarity: 'common', icon: '🦴', description: 'Foice rudimentar feita de ossos.', stats: { attack: 5, magicPower: 7, range: 4 }, value: 25 },
  cursed_staff: { id: 'cursed_staff', name: 'Cajado Amaldicoado', type: 'weapon', rarity: 'uncommon', icon: '☠', description: 'Pulsa com energia necrotica.', stats: { attack: 8, magicPower: 22, range: 5 }, value: 350 },
  soul_reaper: { id: 'soul_reaper', name: 'Ceifador de Almas', type: 'weapon', rarity: 'rare', icon: '☠', description: 'Colhe a vida dos vivos.', stats: { attack: 14, magicPower: 42, critChance: 10, range: 5 }, value: 1900 },
  lich_staff: { id: 'lich_staff', name: 'Cajado do Lich', type: 'weapon', rarity: 'epic', icon: '☠', description: 'O poder da morte em forma de cajado.', stats: { attack: 22, magicPower: 75, critChance: 16, critDamage: 30, range: 6 }, value: 6200 },

  wooden_staff: { id: 'wooden_staff', name: 'Cajado de Madeira', type: 'weapon', rarity: 'common', icon: '🪄', description: 'Um cajado basico para iniciantes.', stats: { attack: 4, magicPower: 8 }, value: 20 },
  iron_staff: { id: 'iron_staff', name: 'Cajado de Ferro', type: 'weapon', rarity: 'common', icon: '🪄', description: 'Um cajado reforçado com ferro.', stats: { attack: 6, magicPower: 18 }, value: 120 },
  arcane_staff: { id: 'arcane_staff', name: 'Cajado Arcano', type: 'weapon', rarity: 'rare', icon: '🪄', description: 'Carregado de energia magica.', stats: { attack: 10, magicPower: 40, critChance: 10 }, value: 1800 },
  titan_staff: { id: 'titan_staff', name: 'Cajado do Titan', type: 'weapon', rarity: 'epic', icon: '🪄', description: 'O poder arcano em estado puro.', stats: { attack: 18, magicPower: 70, critChance: 15, critDamage: 30 }, value: 6000 },

  leather_armor: { id: 'leather_armor', name: 'Armadura de Couro', type: 'armor', rarity: 'common', icon: '🛡', description: 'Protecao basica de couro.', stats: { defense: 5, maxHp: 20 }, value: 60 },
  chainmail: { id: 'chainmail', name: 'Cota de Malha', type: 'armor', rarity: 'uncommon', icon: '🛡', description: 'Aneis metalicos entrelaçados.', stats: { defense: 12, maxHp: 40 }, value: 250 },
  plate_armor: { id: 'plate_armor', name: 'Armadura de Placas', type: 'armor', rarity: 'rare', icon: '🛡', description: 'Protecao maxima de metal.', stats: { defense: 25, maxHp: 80, speed: -1 }, value: 1000 },
  titan_armor: { id: 'titan_armor', name: 'Armadura do Titan', type: 'armor', rarity: 'epic', icon: '🛡', description: 'Forjada nos forges do abismo.', stats: { defense: 50, maxHp: 200, speed: -2 }, value: 5000 },

  leather_helmet: { id: 'leather_helmet', name: 'Capacete de Couro', type: 'helmet', rarity: 'common', icon: '⛑', description: 'Protecao basica para a cabeca.', stats: { defense: 3, maxHp: 10 }, value: 40 },
  iron_helmet: { id: 'iron_helmet', name: 'Capacete de Ferro', type: 'helmet', rarity: 'uncommon', icon: '⛑', description: 'Capacete de ferro solido.', stats: { defense: 8, maxHp: 25 }, value: 180 },
  titan_helmet: { id: 'titan_helmet', name: 'Elmo do Titan', type: 'helmet', rarity: 'epic', icon: '⛑', description: 'Protecao lendaria.', stats: { defense: 30, maxHp: 100 }, value: 4000 },

  leather_boots: { id: 'leather_boots', name: 'Botas de Couro', type: 'boots', rarity: 'common', icon: '👢', description: 'Botas confortaveis.', stats: { speed: 1, defense: 2 }, value: 40 },
  iron_boots: { id: 'iron_boots', name: 'Botas de Ferro', type: 'boots', rarity: 'uncommon', icon: '👢', description: 'Botas pesadas mas resistentes.', stats: { speed: -1, defense: 8 }, value: 150 },
  swift_boots: { id: 'swift_boots', name: 'Botas Velozes', type: 'boots', rarity: 'rare', icon: '👢', description: 'Encantadas para maior velocidade.', stats: { speed: 4, defense: 4 }, value: 800 },

  copper_ring: { id: 'copper_ring', name: 'Anel de Cobre', type: 'ring', rarity: 'common', icon: '💍', description: 'Um simples anel de cobre.', stats: { maxMp: 10 }, value: 50 },
  magic_ring: { id: 'magic_ring', name: 'Anel Magico', type: 'ring', rarity: 'uncommon', icon: '💍', description: 'Um anel com encantamento basico.', stats: { maxMp: 30, magicPower: 8 }, value: 300 },
  power_ring: { id: 'power_ring', name: 'Anel do Poder', type: 'ring', rarity: 'rare', icon: '💍', description: 'Amplifica o poder do portador.', stats: { maxHp: 50, maxMp: 50, attack: 10, critChance: 5 }, value: 1500 },

  small_potion: { id: 'small_potion', name: 'Pocao Pequena', type: 'consumable', rarity: 'common', icon: '🧪', description: 'Restaura 50 HP.', stats: { maxHp: 50 }, stackable: true, quantity: 1, value: 20 },
  potion: { id: 'potion', name: 'Pocao de Cura', type: 'consumable', rarity: 'common', icon: '🧪', description: 'Restaura 120 HP.', stats: { maxHp: 120 }, stackable: true, quantity: 1, value: 50 },
  great_potion: { id: 'great_potion', name: 'Pocao Grande', type: 'consumable', rarity: 'uncommon', icon: '🧪', description: 'Restaura 300 HP.', stats: { maxHp: 300 }, stackable: true, quantity: 1, value: 120 },
  mana_potion: { id: 'mana_potion', name: 'Elixir de Mana', type: 'consumable', rarity: 'common', icon: '🔮', description: 'Restaura 50 MP.', stats: { maxMp: 50 }, stackable: true, quantity: 1, value: 30 },

  // Legendary items
  void_blade: { id: 'void_blade', name: 'Lâmina do Vazio', type: 'weapon', rarity: 'legendary', icon: '🗡', description: 'Forjada nas profundezas do Abismo Eterno.', stats: { attack: 120, critChance: 20, critDamage: 80, speed: 1 }, value: 25000 },
  soul_staff: { id: 'soul_staff', name: 'Cajado das Almas', type: 'weapon', rarity: 'legendary', icon: '🪄', description: 'Alimentado pela essência das almas perdidas.', stats: { attack: 60, magicPower: 150, maxMp: 200, critChance: 15 }, value: 28000 },
  abyss_armor: { id: 'abyss_armor', name: 'Armadura do Abismo', type: 'armor', rarity: 'legendary', icon: '🛡', description: 'Tecida das trevas profundas.', stats: { defense: 90, maxHp: 500, speed: -1 }, value: 30000 },
  ancient_bow: { id: 'ancient_bow', name: 'Arco Ancião', type: 'weapon', rarity: 'legendary', icon: '🏹', description: 'Fabricado pela Floresta Antiga.', stats: { attack: 100, critChance: 25, critDamage: 100, range: 80 }, value: 26000 },
  treant_ring: { id: 'treant_ring', name: 'Anel do Treante', type: 'ring', rarity: 'epic', icon: '💍', description: 'A essência da floresta concentrada.', stats: { maxHp: 200, defense: 20, speed: 1 }, value: 8000 },
  vampire_cloak: { id: 'vampire_cloak', name: 'Manto Vampírico', type: 'armor', rarity: 'epic', icon: '🛡', description: 'Absorve a vitalidade dos inimigos.', stats: { defense: 40, maxHp: 300, critChance: 10 }, value: 12000 },
  crystal_helm: { id: 'crystal_helm', name: 'Elmo de Cristal', type: 'helmet', rarity: 'epic', icon: '⛑', description: 'Cristalizado nas energias do abismo.', stats: { defense: 40, maxMp: 150, magicPower: 40 }, value: 10000 },

  void_crystal: { id: 'void_crystal', name: 'Cristal do Vazio', type: 'material', rarity: 'rare', icon: '🔷', description: 'Fragmento do Abismo Eterno.', stats: {}, stackable: true, quantity: 1, value: 150 },
  ancient_bark_piece: { id: 'ancient_bark_piece', name: 'Casca Ancião', type: 'material', rarity: 'uncommon', icon: '🪵', description: 'Da Floresta Antiga.', stats: {}, stackable: true, quantity: 1, value: 60 },
  ghost_essence: { id: 'ghost_essence', name: 'Essência Fantasmal', type: 'material', rarity: 'rare', icon: '👻', description: 'Resíduo de um Fantasma.', stats: {}, stackable: true, quantity: 1, value: 200 },
  slime_gel: { id: 'slime_gel', name: 'Gel de Slime', type: 'material', rarity: 'common', icon: '💚', description: 'Material de crafting basico.', stats: {}, stackable: true, quantity: 1, value: 5 },
  bone_shard: { id: 'bone_shard', name: 'Fragmento de Osso', type: 'material', rarity: 'common', icon: '🦴', description: 'Um estilhaço de osso.', stats: {}, stackable: true, quantity: 1, value: 8 },
  wolf_pelt: { id: 'wolf_pelt', name: 'Pele de Lobo', type: 'material', rarity: 'common', icon: '🐺', description: 'Pele quente de lobo.', stats: {}, stackable: true, quantity: 1, value: 15 },
  demon_horn: { id: 'demon_horn', name: 'Chifre Demonico', type: 'material', rarity: 'rare', icon: '😈', description: 'Chifre de um demonio.', stats: {}, stackable: true, quantity: 1, value: 200 },
  dragon_scale: { id: 'dragon_scale', name: 'Escama de Dragao', type: 'material', rarity: 'epic', icon: '🐉', description: 'Escama quase indestrutivel.', stats: {}, stackable: true, quantity: 1, value: 1000 },
}

// ─── Monster Definitions ────────────────────────────────────────────────────

// Multiplicadores de poder por tier de elite
const ELITE_MULT: Record<EliteTier, { hp: number; atk: number; xp: number; gold: number }> = {
  normal:   { hp: 1,    atk: 1,    xp: 1,   gold: 1 },
  elite:    { hp: 2.2,  atk: 1.5,  xp: 2.5, gold: 2.5 },
  champion: { hp: 4,    atk: 2.1,  xp: 5,   gold: 5 },
  boss:     { hp: 9,    atk: 3.2,  xp: 12,  gold: 12 },
}

const ELITE_PREFIX: Record<EliteTier, string> = {
  normal: '', elite: 'Elite ', champion: 'Campeao ', boss: 'CHEFE ',
}

const RANGED_TYPES: MonsterType[] = ['archer_enemy', 'mage_enemy', 'witch', 'ghost']

// DIFICULDADE 5x - multiplicadores globais
const DIFF_HP = 5.0
const DIFF_ATK = 4.0
const DIFF_DEF = 2.5

export function createMonster(type: MonsterType, level: number, x: number, y: number, elite: EliteTier = 'normal'): Monster {
  const templates: Record<MonsterType, Omit<Monster, 'id' | 'position' | 'targetPosition' | 'animFrame' | 'animTimer' | 'isDead' | 'deathTimer' | 'isMoving' | 'isAttacking' | 'attackCooldown' | 'isAggrod' | 'direction' | 'attackRange' | 'isRanged' | 'elite'>> = {
    slime: { type: 'slime', name: 'Slime', level, hp: 20 * level, maxHp: 20 * level, attack: 3 * level, defense: 1, speed: 1.5, xpReward: 10 * level, goldReward: 2 * level, aggroRange: 120, drops: [{ item: { ...ITEMS.slime_gel, quantity: 1 }, chance: 0.7 }, { item: { ...ITEMS.small_potion, quantity: 1 }, chance: 0.15 }] },
    skeleton: { type: 'skeleton', name: 'Esqueleto', level, hp: 30 * level, maxHp: 30 * level, attack: 7 * level, defense: 3, speed: 2, xpReward: 18 * level, goldReward: 5 * level, aggroRange: 150, drops: [{ item: { ...ITEMS.bone_shard, quantity: 1 }, chance: 0.8 }, { item: { ...ITEMS.iron_sword, quantity: 1 }, chance: 0.05 }] },
    goblin: { type: 'goblin', name: 'Goblin', level, hp: 25 * level, maxHp: 25 * level, attack: 6 * level, defense: 2, speed: 2.5, xpReward: 15 * level, goldReward: 8 * level, aggroRange: 140, drops: [{ item: { ...ITEMS.small_potion, quantity: 1 }, chance: 0.3 }, { item: { ...ITEMS.leather_armor, quantity: 1 }, chance: 0.04 }] },
    orc: { type: 'orc', name: 'Orc', level, hp: 60 * level, maxHp: 60 * level, attack: 12 * level, defense: 6, speed: 1.8, xpReward: 30 * level, goldReward: 15 * level, aggroRange: 130, drops: [{ item: { ...ITEMS.chainmail, quantity: 1 }, chance: 0.08 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.25 }] },
    wolf: { type: 'wolf', name: 'Lobo', level, hp: 35 * level, maxHp: 35 * level, attack: 9 * level, defense: 2, speed: 3.5, xpReward: 20 * level, goldReward: 6 * level, aggroRange: 160, drops: [{ item: { ...ITEMS.wolf_pelt, quantity: 1 }, chance: 0.75 }, { item: { ...ITEMS.leather_boots, quantity: 1 }, chance: 0.06 }] },
    spider: { type: 'spider', name: 'Aranha Venenosa', level, hp: 28 * level, maxHp: 28 * level, attack: 8 * level, defense: 2, speed: 2.8, xpReward: 22 * level, goldReward: 7 * level, aggroRange: 110, drops: [{ item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.2 }, { item: { ...ITEMS.copper_ring, quantity: 1 }, chance: 0.04 }] },
    zombie: { type: 'zombie', name: 'Zumbi', level, hp: 45 * level, maxHp: 45 * level, attack: 8 * level, defense: 4, speed: 1.2, xpReward: 25 * level, goldReward: 10 * level, aggroRange: 100, drops: [{ item: { ...ITEMS.bone_shard, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.2 }] },
    demon: { type: 'demon', name: 'Demonio', level, hp: 80 * level, maxHp: 80 * level, attack: 18 * level, defense: 8, speed: 2.2, xpReward: 50 * level, goldReward: 30 * level, aggroRange: 170, drops: [{ item: { ...ITEMS.demon_horn, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.great_potion, quantity: 1 }, chance: 0.3 }, { item: { ...ITEMS.titan_armor, quantity: 1 }, chance: 0.02 }] },
    dragon: { type: 'dragon', name: 'Dragao Antigo', level, hp: 200 * level, maxHp: 200 * level, attack: 35 * level, defense: 15, speed: 1.5, xpReward: 200 * level, goldReward: 200 * level, aggroRange: 200, drops: [{ item: { ...ITEMS.dragon_scale, quantity: 1 }, chance: 0.8 }, { item: { ...ITEMS.titan_sword, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.titan_armor, quantity: 1 }, chance: 0.05 }] },
    troll: { type: 'troll', name: 'Troll da Floresta', level, hp: 120 * level, maxHp: 120 * level, attack: 22 * level, defense: 10, speed: 1.6, xpReward: 80 * level, goldReward: 50 * level, aggroRange: 140, drops: [{ item: { ...ITEMS.great_potion, quantity: 1 }, chance: 0.35 }, { item: { ...ITEMS.plate_armor, quantity: 1 }, chance: 0.04 }] },
    witch: { type: 'witch', name: 'Bruxa Sombria', level, hp: 55 * level, maxHp: 55 * level, attack: 15 * level, defense: 5, speed: 2.0, xpReward: 40 * level, goldReward: 25 * level, aggroRange: 180, drops: [{ item: { ...ITEMS.arcane_staff, quantity: 1 }, chance: 0.06 }, { item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.4 }, { item: { ...ITEMS.magic_ring, quantity: 1 }, chance: 0.05 }] },
    knight_enemy: { type: 'knight_enemy', name: 'Cavaleiro das Trevas', level, hp: 70 * level, maxHp: 70 * level, attack: 16 * level, defense: 12, speed: 2.0, xpReward: 60 * level, goldReward: 40 * level, aggroRange: 150, drops: [{ item: { ...ITEMS.knight_blade, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.plate_armor, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.4 }] },
    archer_enemy: { type: 'archer_enemy', name: 'Arqueiro Sombrio', level, hp: 40 * level, maxHp: 40 * level, attack: 14 * level, defense: 6, speed: 3.0, xpReward: 45 * level, goldReward: 30 * level, aggroRange: 200, drops: [{ item: { ...ITEMS.elven_bow, quantity: 1 }, chance: 0.04 }, { item: { ...ITEMS.leather_armor, quantity: 1 }, chance: 0.1 }] },
    mage_enemy: { type: 'mage_enemy', name: 'Mago das Sombras', level, hp: 35 * level, maxHp: 35 * level, attack: 12 * level, defense: 4, speed: 2.5, xpReward: 55 * level, goldReward: 35 * level, aggroRange: 190, drops: [{ item: { ...ITEMS.arcane_staff, quantity: 1 }, chance: 0.05 }, { item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.magic_ring, quantity: 1 }, chance: 0.04 }] },
      ghost: { type: 'ghost', name: 'Fantasma', level, hp: 30 * level, maxHp: 30 * level, attack: 18 * level, defense: 2, speed: 2.8, xpReward: 50 * level, goldReward: 28 * level, aggroRange: 170, drops: [{ item: { ...ITEMS.mana_potion, quantity: 1 }, chance: 0.5 }, { item: { ...ITEMS.soul_staff, quantity: 1 }, chance: 0.002 }, { item: { ...ITEMS.void_crystal, quantity: 1 }, chance: 0.25 }] },
    vampire: { type: 'vampire', name: 'Vampiro', level, hp: 60 * level, maxHp: 60 * level, attack: 20 * level, defense: 8, speed: 3.2, xpReward: 70 * level, goldReward: 50 * level, aggroRange: 160, drops: [{ item: { ...ITEMS.magic_ring, quantity: 1 }, chance: 0.08 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.4 }, { item: { ...ITEMS.vampire_cloak, quantity: 1 }, chance: 0.004 }] },
    treant: { type: 'treant', name: 'Treante', level, hp: 90 * level, maxHp: 90 * level, attack: 22 * level, defense: 15, speed: 1.4, xpReward: 80 * level, goldReward: 60 * level, aggroRange: 130, drops: [{ item: { ...ITEMS.iron_sword, quantity: 1 }, chance: 0.03 }, { item: { ...ITEMS.potion, quantity: 1 }, chance: 0.3 }, { item: { ...ITEMS.treant_ring, quantity: 1 }, chance: 0.006 }, { item: { ...ITEMS.ancient_bow, quantity: 1 }, chance: 0.001 }, { item: { ...ITEMS.ancient_bark_piece, quantity: 1 }, chance: 0.35 }] },
  }

  const template = templates[type]
  const mult = ELITE_MULT[elite]
  const isRanged = RANGED_TYPES.includes(type)

  const maxHp = Math.round(template.maxHp * DIFF_HP * mult.hp)
  const attack = Math.round(template.attack * DIFF_ATK * mult.atk)
  const defense = Math.round(template.defense * DIFF_DEF + level * 2)
  const eliteScale = elite === 'normal' ? 1 : elite === 'elite' ? 1.15 : elite === 'champion' ? 1.3 : 1.6

  return {
    ...template,
    name: `${ELITE_PREFIX[elite]}${template.name}`,
    maxHp,
    hp: maxHp,
    attack,
    defense,
    xpReward: Math.round(template.xpReward * mult.xp * 1.5),
    goldReward: Math.round(template.goldReward * mult.gold * 1.5),
    aggroRange: Math.round(template.aggroRange * (isRanged ? 1.3 : 1.1) * 1.3),
    speed: template.speed * (elite === 'boss' ? 0.9 : 1) * 1.4,
    attackRange: isRanged ? 220 : 42 + Math.round(eliteScale * 4),
    isRanged,
    elite,
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    position: { x, y },
    targetPosition: { x, y },
    direction: 'down',
    isMoving: false,
    isAttacking: false,
    attackCooldown: 0,
    isAggrod: false,
    animFrame: Math.random() * 60,
    animTimer: 0,
    isDead: false,
    deathTimer: 0,
    _spawnX: x,
    _spawnY: y,
    _spawnType: type,
    _spawnLevel: level,
    _spawnElite: elite,
    _respawnIn: 0,
  }
}

export function rollEliteTier(bossChance = 0): EliteTier {
  const r = Math.random()
  if (bossChance > 0 && r < bossChance) return 'boss'
  if (r < 0.08) return 'champion'
  if (r < 0.28) return 'elite'
  return 'normal'
}

// ─── Map Generation ─────────────────────────────────────────────────────────

const NON_WALKABLE: TileType[] = [
  'water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock',
  'house_wall', 'house_roof', 'fountain', 'lamp_post', 'market_stall', 'fence',
  'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent',
  'crystal_wall', 'ruin_wall', 'sky_void', 'cobweb',
  'abyss_wall', 'void',
  'pine_tree', 'snowy_peak', 'mountain_rock', 'ice_crystal_node',
  'ruin_pillar', 'vine_wall', 'sarcophagus', 'rune_stone', 'ancient_brazier',
]

function makeTile(type: TileType): Tile {
  const walkable = !NON_WALKABLE.includes(type)
  return { type, walkable, transparent: true }
}

export function generateMap(id: string): GameMap {
  switch (id) {
    case 'city': return generateCityMap()
    case 'forest': return generateForestMap()
    case 'dungeon': return generateDungeonMap()
    case 'desert': return generateDesertMap()
    case 'swamp': return generateSwampMap()
    case 'tundra': return generateTundraMap()
    case 'volcano': return generateVolcanoMap()
    case 'abyss': return generateAbyssMap()
    case 'deepforest': return generateDeepForestMap()
    // Crystal Cave (10 floors)
    case 'crystal1': return generateCrystalCaveMap(1)
    case 'crystal2': return generateCrystalCaveMap(2)
    case 'crystal3': return generateCrystalCaveMap(3)
    case 'crystal4': return generateCrystalCaveMap(4)
    case 'crystal5': return generateCrystalCaveMap(5)
    case 'crystal6': return generateCrystalCaveMap(6)
    case 'crystal7': return generateCrystalCaveMap(7)
    case 'crystal8': return generateCrystalCaveMap(8)
    case 'crystal9': return generateCrystalCaveMap(9)
    case 'crystal10': return generateCrystalCaveMap(10)
    // Haunted Ruins (8 floors)
    case 'haunted1': return generateHauntedRuinsMap(1)
    case 'haunted2': return generateHauntedRuinsMap(2)
    case 'haunted3': return generateHauntedRuinsMap(3)
    case 'haunted4': return generateHauntedRuinsMap(4)
    case 'haunted5': return generateHauntedRuinsMap(5)
    case 'haunted6': return generateHauntedRuinsMap(6)
    case 'haunted7': return generateHauntedRuinsMap(7)
    case 'haunted8': return generateHauntedRuinsMap(8)
    // Sky Realm (6 floors)
    case 'sky1': return generateSkyRealmMap(1)
    case 'sky2': return generateSkyRealmMap(2)
    case 'sky3': return generateSkyRealmMap(3)
    case 'sky4': return generateSkyRealmMap(4)
    case 'sky5': return generateSkyRealmMap(5)
    case 'sky6': return generateSkyRealmMap(6)
    // Novos biomas adjacentes a cidade
    case 'meadow': return generateMeadowMap()
    case 'coast':  return generateCoastMap()
    // Catacumbas (2 andares de profundidade)
    case 'catacombs1': return generateCatacombsMap(1)
    case 'catacombs2': return generateCatacombsMap(2)
    // Snowy Mountain (3 floors)
    case 'mountain1': return generateSnowyMountainMap(1)
    case 'mountain2': return generateSnowyMountainMap(2)
    case 'mountain3': return generateSnowyMountainMap(3)
    // Ancient Ruins (3 floors)
    case 'ruins1': return generateAncientRuinsMap(1)
    case 'ruins2': return generateAncientRuinsMap(2)
    case 'ruins3': return generateAncientRuinsMap(3)
    default: {
      const extra = generateExtraMap(id)
      if (extra) return extra
      return generateCityMap()
    }
  }
}

// ─── City Map ─────────────────────────────────────────────────────────────────

function generateCityMap(): GameMap {
  const W = 500, H = 500
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const isGarden = (x + y) % 9 === 0 || (x * 2 + y) % 13 === 3
      tiles[y][x] = makeTile(isGarden ? 'garden' : 'grass')
    }
  }

  for (let x = 0; x < W; x++) {
    tiles[0][x] = makeTile('wall')
    tiles[H - 1][x] = makeTile('wall')
  }
  for (let y = 0; y < H; y++) {
    tiles[y][0] = makeTile('wall')
    tiles[y][W - 1] = makeTile('wall')
  }

  // Road network
  const mainRoads = [125, 250, 375]
  for (let x = 1; x < W - 1; x++) {
    for (const ry of mainRoads) {
      tiles[ry][x] = makeTile('cobblestone')
      tiles[ry + 1][x] = makeTile('cobblestone')
      tiles[ry - 1][x] = makeTile('cobblestone')
    }
  }
  for (let y = 1; y < H - 1; y++) {
    for (const rx of mainRoads) {
      tiles[y][rx] = makeTile('cobblestone')
      tiles[y][rx + 1] = makeTile('cobblestone')
      tiles[y][rx - 1] = makeTile('cobblestone')
    }
  }

  const cx = 250, cy = 250
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      tiles[cy + dy][cx + dx] = makeTile('cobblestone')
    }
  }
  tiles[cy][cx] = makeTile('fountain')
  for (let dy = -10; dy <= 10; dy += 5) {
    for (let dx = -10; dx <= 10; dx += 5) {
      if ((dy !== 0 || dx !== 0) && (Math.abs(dx) === 10 || Math.abs(dy) === 10)) {
        tiles[cy + dy][cx + dx] = makeTile('lamp_post')
      }
    }
  }

  const placeHouse = (hx: number, hy: number, w: number, h: number) => {
    for (let y = hy; y < hy + h; y++) {
      for (let x = hx; x < hx + w; x++) {
        if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) continue
        if (y === hy + h - 1) tiles[y][x] = makeTile('house_wall')
        else tiles[y][x] = makeTile('house_roof')
      }
    }
    const doorX = hx + Math.floor(w / 2)
    if (doorX > 0 && doorX < W - 1 && hy + h - 1 < H - 1) {
      tiles[hy + h - 1][doorX] = makeTile('house_door')
    }
  }

  // Fewer houses, distributed in 4 districts
  for (let district = 0; district < 4; district++) {
    const startX = district % 2 === 0 ? 40 : 280
    const startY = district < 2 ? 40 : 280
    const endX = district % 2 === 0 ? 200 : 460
    const endY = district < 2 ? 200 : 460
    for (let i = 0; i < 5; i++) {
      const w = 8 + Math.floor(Math.random() * 8)
      const h = 6 + Math.floor(Math.random() * 6)
      const x = startX + 10 + Math.floor(Math.random() * (endX - startX - w - 20))
      const y = startY + 10 + Math.floor(Math.random() * (endY - startY - h - 20))
      placeHouse(x, y, w, h)
    }
  }

  // Market areas
  const marketAreas = [
    { x: 150, y: 150 }, { x: 350, y: 150 }, { x: 150, y: 350 }, { x: 350, y: 350 },
  ]
  for (const { x: mx, y: my } of marketAreas) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (Math.random() < 0.3) tiles[my + dy][mx + dx] = makeTile('market_stall')
      }
    }
  }

  // Portals — including 2 new biomes (meadow/coast) and 2 catacomb floors (down)
  const portalLocations: { x: number; y: number; name: string }[] = [
    { x: 100, y: 470, name: 'Forest' },
    { x: 200, y: 470, name: 'Desert' },
    { x: 300, y: 470, name: 'Swamp' },
    { x: 400, y: 470, name: 'Tundra' },
    { x: 470, y: 100, name: 'Dungeon' },
    { x: 470, y: 200, name: 'Volcano' },
    { x: 470, y: 300, name: 'Crystal Cave' },
    { x: 470, y: 400, name: 'Haunted Ruins' },
    { x: 30,  y: 100, name: 'Sky Realm' },
    { x: 30,  y: 250, name: 'Deep Forest' },
    { x: 30,  y: 400, name: 'Abyss' },
    // NOVOS biomas adjacentes a cidade
    { x: 100, y: 30,  name: 'Pradaria Florida' },
    { x: 400, y: 30,  name: 'Costa Rochosa' },
    // ALCAPAO para Catacumbas (andar 1)
    { x: 250, y: 280, name: 'Catacumbas' },
    // Montanha Nevada (3 andares) - portal norte-oeste
    { x: 60,  y: 60,  name: 'Montanha Nevada' },
    // Ruinas Antigas (3 andares) - portal sul-leste
    { x: 440, y: 440, name: 'Ruinas Antigas' },
    // ─── NOVOS BIOMAS (4 normais × 2 andares) ───
    { x: 50,  y: 470, name: 'Bosque de Cristal' },     // oeste do portal Forest (100,470)
    { x: 250, y: 470, name: 'Savana Dourada' },        // sul central
    { x: 470, y: 250, name: 'Arquipelago Mistico' },   // leste central
    { x: 30,  y: 30,  name: 'Vale Esquecido' },        // canto noroeste
    // ─── SECRETOS (requerem chave) ───
    { x: 200, y: 30,  name: 'Fenda Estelar' },         // SECRETO norte
    { x: 300, y: 30,  name: 'Jardim Eterno' },         // SECRETO norte
  ]
  for (const portal of portalLocations) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const px = portal.x + dx, py = portal.y + dy
        if (px >= 0 && px < W && py >= 0 && py < H) tiles[py][px] = makeTile('cobblestone')
      }
    }
    tiles[portal.y][portal.x] = makeTile('portal')
  }

  // Spawn area clear
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      tiles[cy + dy][cx + dx] = makeTile('cobblestone')
    }
  }
  tiles[cy][cx] = makeTile('fountain')

  // Monsters — REDUCIDO 5x e DISTRIBUIDO PELO MAPA INTEIRO (nao mais apenas nas pontas)
  const monsters: Monster[] = []
  const cityMonsterCount = 20
  for (let i = 0; i < cityMonsterCount; i++) {
    // Distribuicao aleatoria pelo mapa, evitando a praça central
    let mx = 0, my = 0
    for (let attempt = 0; attempt < 10; attempt++) {
      mx = 20 + Math.floor(Math.random() * (W - 40))
      my = 20 + Math.floor(Math.random() * (H - 40))
      const distCenter = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)
      if (distCenter > 40 && tiles[my][mx].walkable) break
    }
    const type = (['slime', 'goblin', 'wolf', 'skeleton'] as MonsterType[])[Math.floor(Math.random() * 4)]
    const level = 1 + Math.floor(Math.random() * 5)
    monsters.push(createMonster(type, level, mx * 32, my * 32, 'normal'))
  }

  return {
    id: 'city', name: 'Cidade de Valor',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: (cx + 2) * 32, y: (cy + 2) * 32 }, { x: (cx - 2) * 32, y: (cy - 2) * 32 }],
    ambience: 'city', musicTheme: 'city',
    minLevel: 1,
  }
}

// ─── Forest Map 100x larger ───────────────────────────────────────────────────

function generateForestMap(): GameMap {
  const W = 800, H = 800
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.05) + Math.cos(y * 0.05) + 2) / 4
      let type: TileType = 'grass'
      if (v < 0.15) type = 'water'
      else if (v < 0.25) type = 'sand'
      else if (v < 0.35) type = 'dirt'
      else if (v > 0.85) type = 'tree'
      else if (v > 0.75) {
        type = (x + y) % 3 === 0 ? 'rock' : ((x + y) % 5 === 0 ? 'tall_grass' : 'grass')
      } else if (v > 0.65) {
        type = (x * y) % 7 === 0 ? 'flower' : 'grass'
      } else {
        type = (x + y) % 10 === 0 ? 'tall_grass' : 'grass'
      }
      tiles[y][x] = makeTile(type)
    }
  }

  // Multiple path networks through the forest
  for (let x = 0; x < W; x++) {
    if (tiles[H/4][x].walkable) tiles[H/4][x] = makeTile('road')
    if (tiles[H/4+1][x].walkable) tiles[H/4+1][x] = makeTile('road')
    if (tiles[H/2][x].walkable) tiles[H/2][x] = makeTile('road')
    if (tiles[H/2+1][x].walkable) tiles[H/2+1][x] = makeTile('road')
    if (tiles[3*H/4][x].walkable) tiles[3*H/4][x] = makeTile('road')
    if (tiles[3*H/4+1][x].walkable) tiles[3*H/4+1][x] = makeTile('road')
  }
  for (let y = 0; y < H; y++) {
    if (tiles[y][W/4].walkable) tiles[y][W/4] = makeTile('road')
    if (tiles[y][W/2].walkable) tiles[y][W/2] = makeTile('road')
    if (tiles[y][3*W/4].walkable) tiles[y][3*W/4] = makeTile('road')
  }

  // Portal at city entrance
  tiles[100][100] = makeTile('portal')
  // Portal to deep forest
  tiles[W-100][H-100] = makeTile('portal')

  // Massive number of monsters scattered across the enormous forest
  const monsters: Monster[] = []
  const spawnGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number; zones: [number,number,number,number][] }[] = [
    { type: 'slime', count: 30, minLvl: 2, maxLvl: 8, zones: [[50,50,400,400],[800,50,1200,400],[50,800,500,1200],[1400,50,1900,400],[50,1400,400,1900],[1400,1400,1900,1900]] },
    { type: 'wolf', count: 24, minLvl: 3, maxLvl: 10, zones: [[300,300,700,700],[1300,300,1700,700],[300,1300,800,1700],[1300,1300,1700,1700]] },
    { type: 'goblin', count: 20, minLvl: 2, maxLvl: 8, zones: [[500,200,900,600],[1200,200,1800,600],[200,500,600,1100],[1200,1200,1800,1800]] },
    { type: 'spider', count: 16, minLvl: 3, maxLvl: 10, zones: [[600,600,1000,1000],[1000,600,1400,1000],[600,1000,1000,1400],[1000,1000,1400,1400]] },
    { type: 'skeleton', count: 12, minLvl: 4, maxLvl: 12, zones: [[700,700,1300,1300]] },
    { type: 'troll', count: 8, minLvl: 5, maxLvl: 15, zones: [[800,800,1200,1200]] },
    { type: 'witch', count: 6, minLvl: 8, maxLvl: 18, zones: [[900,900,1100,1100],[1500,1500,1700,1700],[300,1500,500,1700]] },
  ]

  for (const group of spawnGroups) {
    for (let i = 0; i < group.count; i++) {
      const zone = group.zones[Math.floor(Math.random() * group.zones.length)]
      const [x1, y1, x2, y2] = zone
      const px = x1 + Math.floor(Math.random() * (x2 - x1))
      const py = y1 + Math.floor(Math.random() * (y2 - y1))
      const lvl = group.minLvl + Math.floor(Math.random() * (group.maxLvl - group.minLvl + 1))
      const elite = rollEliteTier(0.01)
      monsters.push(createMonster(group.type, lvl, px * 32, py * 32, elite))
    }
  }

  // Boss at far corner
  monsters.push(createMonster('troll', 20, (W - 50) * 32, (H - 50) * 32, 'boss'))
  // Many champions
  for (let i = 0; i < 3; i++) {
    const px = 200 + Math.floor(Math.random() * (W - 400))
    const py = 200 + Math.floor(Math.random() * (H - 400))
    const type = ['wolf', 'goblin', 'skeleton', 'spider', 'troll', 'witch'][Math.floor(Math.random() * 6)] as MonsterType
    monsters.push(createMonster(type, 12, px * 32, py * 32, 'champion'))
  }

  return {
    id: 'forest', name: 'Floresta das Sombras - Imensa',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 10, y: 32 * 10 }, { x: 32 * 20, y: 32 * 20 }],
    ambience: 'forest', musicTheme: 'forest',
  }
}

// ─── Dungeon Map 100x larger with improved corridor generation ──────────────────────────────────────────────────

function generateDungeonMap(): GameMap {
  const W = 600, H = 600
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      tiles[y][x] = makeTile('dungeon_wall')
    }
  }

  const roomCount = 100
  const rooms: { x: number; y: number; w: number; h: number }[] = []
  const rng = (seed: number) => {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
  }
  const rand = rng(42)

  // Generate rooms with collision detection
  for (let i = 0; i < roomCount; i++) {
    const w = 8 + Math.floor(rand() * 15)
    const h = 6 + Math.floor(rand() * 12)
    const x = 5 + Math.floor(rand() * (W - w - 10))
    const y = 5 + Math.floor(rand() * (H - h - 10))
    
    // Check collision with existing rooms
    let collision = false
    for (const room of rooms) {
      if (x < room.x + room.w + 3 && x + w > room.x - 3 &&
          y < room.y + room.h + 3 && y + h > room.y - 3) {
        collision = true
        break
      }
    }
    
    if (!collision) {
      rooms.push({ x, y, w, h })
    }
  }

  // Carve rooms
  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (x >= 0 && x < W && y >= 0 && y < H) {
          tiles[y][x] = makeTile('dungeon_floor')
        }
      }
    }
  }

  // Improved corridor generation with branching paths
  for (let i = 1; i < rooms.length; i++) {
    const r1 = rooms[i - 1]
    const r2 = rooms[i]
    const x1 = Math.floor(r1.x + r1.w / 2)
    const y1 = Math.floor(r1.y + r1.h / 2)
    const x2 = Math.floor(r2.x + r2.w / 2)
    const y2 = Math.floor(r2.y + r2.h / 2)
    
    // Create L-shaped corridor with width 2 for better accessibility
    const corridorWidth = 2
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let w = 0; w < corridorWidth; w++) {
        const cx = x
        const cy = y1 + w - Math.floor(corridorWidth / 2)
        if (cx >= 0 && cx < W && cy >= 0 && cy < H) tiles[cy][cx] = makeTile('dungeon_floor')
      }
    }
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      for (let w = 0; w < corridorWidth; w++) {
        const cx = x2 + w - Math.floor(corridorWidth / 2)
        const cy = y
        if (cx >= 0 && cx < W && cy >= 0 && cy < H) tiles[cy][cx] = makeTile('dungeon_floor')
      }
    }
  }

  // Add extra connections between distant rooms to prevent dead ends
  for (let i = 0; i < rooms.length - 10; i += 10) {
    const r1 = rooms[i]
    const r2 = rooms[i + 10]
    const x1 = Math.floor(r1.x + r1.w / 2)
    const y1 = Math.floor(r1.y + r1.h / 2)
    const x2 = Math.floor(r2.x + r2.w / 2)
    const y2 = Math.floor(r2.y + r2.h / 2)
    
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      if (x >= 0 && x < W && y1 >= 0 && y1 < H) tiles[y1][x] = makeTile('dungeon_floor')
    }
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      if (y >= 0 && y < H && x2 >= 0 && x2 < W) tiles[y][x2] = makeTile('dungeon_floor')
    }
  }

  const lastRoom = rooms[rooms.length - 1]
  // Clear area around portal for better accessibility
  const portalX = Math.floor(lastRoom.x + lastRoom.w/2)
  const portalY = Math.floor(lastRoom.y + lastRoom.h/2)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const px = portalX + dx
      const py = portalY + dy
      if (px >= 0 && px < W && py >= 0 && py < H) {
        tiles[py][px] = makeTile('dungeon_floor')
      }
    }
  }
  tiles[portalY][portalX] = makeTile('portal')

  const monsters: Monster[] = []
  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i]
    const count = 2 + Math.floor(rand() * 4)
    for (let j = 0; j < count; j++) {
      const px = room.x + 2 + Math.floor(rand() * (room.w - 4))
      const py = room.y + 2 + Math.floor(rand() * (room.h - 4))
      const typePool = ['skeleton', 'zombie', 'orc', 'knight_enemy', 'mage_enemy', 'witch']
      const type = typePool[Math.floor(rand() * typePool.length)] as MonsterType
      const lvl = 5 + Math.floor(rand() * 12)
      const elite = rollEliteTier(0.02)
      monsters.push(createMonster(type, lvl, px * 32, py * 32, elite))
    }
  }

  // Add more elite monsters and champions
  for (let i = 0; i < 4; i++) {
    const room = rooms[Math.floor(rand() * rooms.length)]
    const typePool = ['skeleton', 'zombie', 'orc', 'knight_enemy', 'mage_enemy']
    const type = typePool[Math.floor(rand() * typePool.length)] as MonsterType
    const px = room.x + 2 + Math.floor(rand() * (room.w - 4))
    const py = room.y + 2 + Math.floor(rand() * (room.h - 4))
    monsters.push(createMonster(type, 18, px * 32, py * 32, 'champion'))
  }

  monsters.push(createMonster('demon', 25, Math.floor(lastRoom.x + lastRoom.w / 2) * 32, Math.floor(lastRoom.y + lastRoom.h / 2) * 32, 'boss'))

  // Ensure spawn area is clear and accessible
  const firstRoom = rooms[0]
  const spawnX = Math.floor(firstRoom.x + firstRoom.w/2)
  const spawnY = Math.floor(firstRoom.y + firstRoom.h/2)
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const px = spawnX + dx
      const py = spawnY + dy
      if (px >= 0 && px < W && py >= 0 && py < H) {
        tiles[py][px] = makeTile('dungeon_floor')
      }
    }
  }

  return {
    id: 'dungeon', name: 'Masmorra das Trevas - Gigante',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: spawnX * 32, y: spawnY * 32 }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: 5,
  }
}

// ─── Desert Map 5x larger ───────────────────────────────────────────────────

function generateDesertMap(): GameMap {
  const W = 300, H = 300
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.08) * Math.cos(y * 0.08) + 1) / 2
      let type: TileType = 'sand'
      if (v < 0.15) type = 'lava'
      else if (v < 0.2) type = 'stone'
      else if (v > 0.75) type = 'rock'
      tiles[y][x] = makeTile(type)
    }
  }

  const ox = Math.floor(W / 2), oy = Math.floor(H / 2)
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      if (dx*dx+dy*dy <= 20) tiles[oy+dy][ox+dx] = makeTile('water')
      else if (dx*dx+dy*dy <= 30) tiles[oy+dy][ox+dx] = makeTile('grass')
    }
  }
  tiles[oy][ox + 6] = makeTile('portal')

  const monsters: Monster[] = []
  const spawnGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number }[] = [
    { type: 'goblin', count: 4, minLvl: 8, maxLvl: 12 },
    { type: 'orc', count: 4, minLvl: 9, maxLvl: 13 },
    { type: 'demon', count: 2, minLvl: 10, maxLvl: 14 },
    { type: 'troll', count: 2, minLvl: 11, maxLvl: 14 },
  ]

  for (const group of spawnGroups) {
    for (let i = 0; i < group.count; i++) {
      const px = 20 + Math.floor(Math.random() * (W - 40))
      const py = 20 + Math.floor(Math.random() * (H - 40))
      const lvl = group.minLvl + Math.floor(Math.random() * (group.maxLvl - group.minLvl + 1))
      const elite = rollEliteTier(0.02)
      monsters.push(createMonster(group.type, lvl, px * 32, py * 32, elite))
    }
  }

  for (let i = 0; i < 2; i++) {
    const px = 30 + Math.floor(Math.random() * (W - 60))
    const py = 30 + Math.floor(Math.random() * (H - 60))
    const type = ['orc', 'demon', 'troll'][Math.floor(Math.random() * 3)] as MonsterType
    monsters.push(createMonster(type, 14, px * 32, py * 32, 'champion'))
  }

  monsters.push(createMonster('demon', 20, (W - 15) * 32, (H - 15) * 32, 'boss'))

  return {
    id: 'desert', name: 'Deserto das Chamas',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: ox * 32, y: oy * 32 }],
    ambience: 'desert', musicTheme: 'desert',
    minLevel: 8,
  }
}

// ─── Swamp Map 5x larger ────────────────────────────────────────────────────

function generateSwampMap(): GameMap {
  const W = 280, H = 280
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.1 + y * 0.05) * Math.cos(x * 0.05 + y * 0.1) + 1) / 2
      let type: TileType = 'grass'
      if (v < 0.35) type = 'water'
      else if (v < 0.42) type = 'dirt'
      else if (v > 0.7) type = 'tree'
      else if (v > 0.6) type = 'tall_grass'
      else if ((x + y) % 12 === 0) type = 'flower'
      tiles[y][x] = makeTile(type)
    }
  }

  tiles[40][40] = makeTile('portal')

  const monsters: Monster[] = []
  const spawnGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number }[] = [
    { type: 'zombie', count: 4, minLvl: 12, maxLvl: 17 },
    { type: 'spider', count: 3, minLvl: 13, maxLvl: 18 },
    { type: 'witch', count: 3, minLvl: 14, maxLvl: 19 },
    { type: 'demon', count: 2, minLvl: 15, maxLvl: 20 },
    { type: 'dragon', count: 2, minLvl: 16, maxLvl: 22 },
  ]

  for (const group of spawnGroups) {
    for (let i = 0; i < group.count; i++) {
      const px = 20 + Math.floor(Math.random() * (W - 40))
      const py = 20 + Math.floor(Math.random() * (H - 40))
      const lvl = group.minLvl + Math.floor(Math.random() * (group.maxLvl - group.minLvl + 1))
      const elite = rollEliteTier(0.02)
      monsters.push(createMonster(group.type, lvl, px * 32, py * 32, elite))
    }
  }

  for (let i = 0; i < 2; i++) {
    const px = 30 + Math.floor(Math.random() * (W - 60))
    const py = 30 + Math.floor(Math.random() * (H - 60))
    const type = ['witch', 'demon', 'dragon'][Math.floor(Math.random() * 3)] as MonsterType
    monsters.push(createMonster(type, 20, px * 32, py * 32, 'champion'))
  }

  monsters.push(createMonster('dragon', 30, (W / 2) * 32, (H / 2) * 32, 'boss'))

  return {
    id: 'swamp', name: 'Pantano Amaldicoado',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 4, y: 32 * 4 }],
    ambience: 'swamp', musicTheme: 'swamp',
    minLevel: 15,
  }
}

// ─── Tundra Map 5x larger ───────────────────────────────────────────────────

function generateTundraMap(): GameMap {
  const W = 290, H = 290
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.12) * Math.cos(y * 0.08) + 1) / 2
      let type: TileType = 'snow'
      if (v < 0.15) type = 'ice'
      else if (v < 0.22) type = 'snow'
      else if (v > 0.8) type = 'frozen_tree'
      else if (v > 0.72) type = 'ice_rock'
      else if (v > 0.65) type = 'snow_rock'
      tiles[y][x] = makeTile(type)
    }
  }

  const cx = Math.floor(W / 2), cy = Math.floor(H / 2)
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (Math.abs(dx) === 3 || Math.abs(dy) === 3) {
        tiles[cy+dy][cx+dx] = makeTile('wall')
      } else {
        tiles[cy+dy][cx+dx] = makeTile('floor')
      }
    }
  }
  tiles[cy+3][cx] = makeTile('floor')
  tiles[cy][cx+4] = makeTile('portal')

  const monsters: Monster[] = []
  const spawnGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number }[] = [
    { type: 'wolf', count: 4, minLvl: 10, maxLvl: 15 },
    { type: 'skeleton', count: 3, minLvl: 11, maxLvl: 16 },
    { type: 'troll', count: 3, minLvl: 13, maxLvl: 18 },
    { type: 'demon', count: 2, minLvl: 14, maxLvl: 20 },
  ]

  for (const group of spawnGroups) {
    for (let i = 0; i < group.count; i++) {
      const px = 20 + Math.floor(Math.random() * (W - 40))
      const py = 20 + Math.floor(Math.random() * (H - 40))
      const lvl = group.minLvl + Math.floor(Math.random() * (group.maxLvl - group.minLvl + 1))
      const elite = rollEliteTier(0.02)
      monsters.push(createMonster(group.type, lvl, px * 32, py * 32, elite))
    }
  }

  for (let i = 0; i < 2; i++) {
    const px = 30 + Math.floor(Math.random() * (W - 60))
    const py = 30 + Math.floor(Math.random() * (H - 60))
    const type = ['troll', 'demon', 'skeleton'][Math.floor(Math.random() * 3)] as MonsterType
    monsters.push(createMonster(type, 18, px * 32, py * 32, 'champion'))
  }

  monsters.push(createMonster('troll', 25, cx * 32 + 96, cy * 32 + 64, 'boss'))

  return {
    id: 'tundra', name: 'Tundra Congelada',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 5, y: 32 * 5 }],
    ambience: 'tundra', musicTheme: 'tundra',
    minLevel: 12,
  }
}

// ─── Volcano Map 5x larger ──────────────────────────────────────────────────

function generateVolcanoMap(): GameMap {
  const W = 310, H = 310
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.15) * Math.cos(y * 0.09) + 1) / 2
      let type: TileType = 'ash'
      if (v < 0.18) type = 'lava'
      else if (v < 0.25) type = 'magma_crust'
      else if (v > 0.85) type = 'volcanic_rock'
      else if (v > 0.78) type = 'obsidian'
      else if (v > 0.7) type = 'volcanic_vent'
      tiles[y][x] = makeTile(type)
    }
  }

  const cx = Math.floor(W / 2), cy = Math.floor(H / 2)
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (dx*dx+dy*dy <= 16) {
        tiles[cy+dy][cx+dx] = makeTile('volcanic_rock')
      }
    }
  }
  tiles[cy][cx] = makeTile('portal')

  const monsters: Monster[] = []
  const spawnGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number }[] = [
    { type: 'demon', count: 5, minLvl: 14, maxLvl: 22 },
    { type: 'dragon', count: 4, minLvl: 16, maxLvl: 25 },
    { type: 'troll', count: 3, minLvl: 15, maxLvl: 22 },
    { type: 'witch', count: 2, minLvl: 16, maxLvl: 24 },
  ]

  for (const group of spawnGroups) {
    for (let i = 0; i < group.count; i++) {
      const px = 20 + Math.floor(Math.random() * (W - 40))
      const py = 20 + Math.floor(Math.random() * (H - 40))
      const lvl = group.minLvl + Math.floor(Math.random() * (group.maxLvl - group.minLvl + 1))
      const elite = rollEliteTier(0.03)
      monsters.push(createMonster(group.type, lvl, px * 32, py * 32, elite))
    }
  }

  for (let i = 0; i < 2; i++) {
    const px = 30 + Math.floor(Math.random() * (W - 60))
    const py = 30 + Math.floor(Math.random() * (H - 60))
    const type = ['dragon', 'demon', 'witch'][Math.floor(Math.random() * 3)] as MonsterType
    monsters.push(createMonster(type, 25, px * 32, py * 32, 'champion'))
  }

  monsters.push(createMonster('dragon', 40, (cx - 6) * 32, (cy - 6) * 32, 'boss'))

  return {
    id: 'volcano', name: 'Vulcao Infernal',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 32 * 4, y: 32 * 4 }],
    ambience: 'volcano', musicTheme: 'volcano',
    minLevel: 18,
  }
}

// ─── Abyss Map ──────────────────────────────────────────────────────────────

function generateAbyssMap(): GameMap {
  const W = 260, H = 260
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const n = (Math.sin(x * 0.11 + y * 0.07) + Math.cos(x * 0.05 - y * 0.13)) / 2
      const v = (n + 1) / 2
      let type: TileType = 'abyss_floor'
      if (v < 0.1) type = 'void'
      else if (v < 0.22) type = 'dark_crystal'
      else if (v < 0.32) type = 'crystal'
      else if (v > 0.88) type = 'abyss_wall'
      else if (v > 0.78) type = 'soul_fire'
      tiles[y][x] = makeTile(type, !['abyss_wall', 'void', 'dark_crystal'].includes(type))
    }
  }

  const cx = Math.floor(W / 2), cy = Math.floor(H / 2)
  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      if (dx * dx + dy * dy <= 25) tiles[cy + dy][cx + dx] = makeTile('abyss_floor')
    }
  }
  tiles[cy][cx] = makeTile('portal')

  const monsters: Monster[] = []
  const abyssGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number }[] = [
    { type: 'demon', count: 4, minLvl: 20, maxLvl: 32 },
    { type: 'dragon', count: 3, minLvl: 22, maxLvl: 35 },
    { type: 'witch', count: 3, minLvl: 20, maxLvl: 30 },
    { type: 'ghost', count: 4, minLvl: 18, maxLvl: 28 },
    { type: 'vampire', count: 2, minLvl: 22, maxLvl: 32 },
  ]

  for (const g of abyssGroups) {
    for (let i = 0; i < g.count; i++) {
      const px = 15 + Math.floor(Math.random() * (W - 30))
      const py = 15 + Math.floor(Math.random() * (H - 30))
      const lvl = g.minLvl + Math.floor(Math.random() * (g.maxLvl - g.minLvl + 1))
      monsters.push(createMonster(g.type, lvl, px * 32, py * 32, rollEliteTier(0.04)))
    }
  }
  for (let i = 0; i < 2; i++) {
    const type: MonsterType = ['demon', 'dragon', 'vampire'][i % 3] as MonsterType
    const px = 20 + Math.floor(Math.random() * (W - 40))
    const py = 20 + Math.floor(Math.random() * (H - 40))
    monsters.push(createMonster(type, 35, px * 32, py * 32, 'champion'))
  }
  monsters.push(createMonster('demon', 50, cx * 32, (cy - 10) * 32, 'boss'))
  monsters.push(createMonster('dragon', 50, (cx + 10) * 32, cy * 32, 'boss'))

  return {
    id: 'abyss', name: 'Abismo Eterno',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: (cx + 1) * 32, y: (cy + 1) * 32 }],
    ambience: 'abyss', musicTheme: 'abyss',
    minLevel: 22,
  }
}

// ─── Deep Forest Map 100x larger ────────────────────────────────────────────────────────

function generateDeepForestMap(): GameMap {
  const W = 600, H = 600
  const tiles: Tile[][] = []

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const n1 = Math.sin(x * 0.03) * Math.cos(y * 0.02)
      const n2 = Math.cos(x * 0.05 + y * 0.04)
      const v = (n1 + n2 + 2) / 4
      let type: TileType = 'grass'
      if (v < 0.12) type = 'dark_water'
      else if (v < 0.2) type = 'mossy_stone'
      else if (v < 0.3) type = 'root'
      else if (v > 0.82) type = 'ancient_bark'
      else if (v > 0.72) type = 'canopy'
      else if (v > 0.62) type = 'mushroom'
      tiles[y][x] = makeTile(type, !['ancient_bark', 'dark_water', 'canopy'].includes(type))
    }
  }

  const cx = Math.floor(W / 2), cy = Math.floor(H / 2)
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      if (dx * dx + dy * dy <= 64) tiles[cy + dy][cx + dx] = makeTile('grass')
    }
  }
  tiles[cy][cx] = makeTile('portal')
  
  // Multiple path networks through the deep forest
  for (let x = 0; x < W; x++) {
    if (tiles[Math.floor(H/4)][x].walkable) tiles[Math.floor(H/4)][x] = makeTile('root')
    if (tiles[Math.floor(H/2)][x].walkable) tiles[Math.floor(H/2)][x] = makeTile('root')
    if (tiles[Math.floor(3*H/4)][x].walkable) tiles[Math.floor(3*H/4)][x] = makeTile('root')
  }
  for (let y = 0; y < H; y++) {
    if (tiles[y][Math.floor(W/4)].walkable) tiles[y][Math.floor(W/4)] = makeTile('root')
    if (tiles[y][Math.floor(W/2)].walkable) tiles[y][Math.floor(W/2)] = makeTile('root')
    if (tiles[y][Math.floor(3*W/4)].walkable) tiles[y][Math.floor(3*W/4)] = makeTile('root')
  }

  // More mushroom clusters throughout the forest
  for (let c = 0; c < 100; c++) {
    const rx = 50 + Math.floor(Math.random() * (W - 100))
    const ry = 50 + Math.floor(Math.random() * (H - 100))
    for (let d = 0; d < 12; d++) {
      const a = (d / 12) * Math.PI * 2
      const mx2 = Math.floor(rx + Math.cos(a) * 8)
      const my2 = Math.floor(ry + Math.sin(a) * 8)
      if (my2 >= 0 && my2 < H && mx2 >= 0 && mx2 < W) tiles[my2][mx2] = makeTile('mushroom')
    }
  }

  const monsters: Monster[] = []
  const dfGroups: { type: MonsterType; count: number; minLvl: number; maxLvl: number; zones: [number,number,number,number][] }[] = [
    { type: 'wolf', count: 24, minLvl: 10, maxLvl: 18, zones: [[100,100,400,400],[1100,100,1400,400],[100,1100,400,1400],[1100,1100,1400,1400]] },
    { type: 'spider', count: 28, minLvl: 8, maxLvl: 16, zones: [[400,200,700,500],[800,200,1100,500],[200,800,500,1100],[1000,800,1300,1100]] },
    { type: 'treant', count: 16, minLvl: 12, maxLvl: 20, zones: [[500,400,1000,1000]] },
    { type: 'witch', count: 12, minLvl: 14, maxLvl: 22, zones: [[600,500,900,900],[300,300,600,600],[900,900,1200,1200]] },
    { type: 'zombie', count: 20, minLvl: 10, maxLvl: 18, zones: [[200,200,500,500],[1000,200,1300,500],[200,1000,500,1300],[1000,1000,1300,1300]] },
  ]

  for (const g of dfGroups) {
    for (let i = 0; i < g.count; i++) {
      const zone = g.zones[Math.floor(Math.random() * g.zones.length)]
      const [x1, y1, x2, y2] = zone
      const px = x1 + Math.floor(Math.random() * (x2 - x1))
      const py = y1 + Math.floor(Math.random() * (y2 - y1))
      const lvl = g.minLvl + Math.floor(Math.random() * (g.maxLvl - g.minLvl + 1))
      monsters.push(createMonster(g.type, lvl, px * 32, py * 32, rollEliteTier(0.03)))
    }
  }
  
  // Champions
  for (let i = 0; i < 4; i++) {
    const px = 100 + Math.floor(Math.random() * (W - 200))
    const py = 100 + Math.floor(Math.random() * (H - 200))
    const type = ['wolf', 'spider', 'treant', 'witch'][Math.floor(Math.random() * 4)] as MonsterType
    monsters.push(createMonster(type, 22, px * 32, py * 32, 'champion'))
  }
  
  // Boss at far corner
  monsters.push(createMonster('treant', 30, (W - 100) * 32, (H - 100) * 32, 'boss'))

  return {
    id: 'deepforest', name: 'Floresta Antiga - Imensa',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: (cx + 5) * 32, y: (cy + 5) * 32 }],
    ambience: 'deepforest', musicTheme: 'deepforest',
    minLevel: 10,
  }
}

// ─── Player Factory ─────────────────────────────────────────────────────────

export const BASE_STATS: Record<CharacterClass, CharacterStats> = {
  knight:      { maxHp: 130, maxMp: 50, attack: 13, defense: 11, speed: 4.6, critChance: 5, critDamage: 150, magicPower: 2, range: 48 },
  archer:      { maxHp: 85, maxMp: 70, attack: 11, defense: 5, speed: 5.8, critChance: 15, critDamage: 175, magicPower: 4, range: 224 },
  mage:        { maxHp: 65, maxMp: 130, attack: 6, defense: 3, speed: 4.8, critChance: 10, critDamage: 200, magicPower: 22, range: 256 },
  necromancer: { maxHp: 90, maxMp: 110, attack: 8, defense: 6, speed: 5.0, critChance: 8, critDamage: 180, magicPower: 18, range: 192 },
  paladin:     { maxHp: 150, maxMp: 80, attack: 11, defense: 14, speed: 4.4, critChance: 6, critDamage: 160, magicPower: 10, range: 48 },
  berserker:   { maxHp: 160, maxMp: 30, attack: 18, defense: 7, speed: 5.2, critChance: 12, critDamage: 190, magicPower: 0, range: 52 },
  assassin:    { maxHp: 70, maxMp: 60, attack: 14, defense: 4, speed: 6.6, critChance: 25, critDamage: 220, magicPower: 2, range: 44 },
  druid:       { maxHp: 95, maxMp: 120, attack: 8, defense: 7, speed: 5.0, critChance: 9, critDamage: 175, magicPower: 20, range: 200 },
  monk:        { maxHp: 105, maxMp: 80, attack: 12, defense: 8, speed: 6.2, critChance: 18, critDamage: 180, magicPower: 6, range: 46 },
  samurai:     { maxHp: 115, maxMp: 55, attack: 16, defense: 9, speed: 5.4, critChance: 20, critDamage: 210, magicPower: 3, range: 52 },
  summoner:    { maxHp: 80, maxMp: 140, attack: 7, defense: 5, speed: 4.9, critChance: 8, critDamage: 170, magicPower: 17, range: 210 },
  alchemist:   { maxHp: 90, maxMp: 100, attack: 9, defense: 6, speed: 5.1, critChance: 12, critDamage: 195, magicPower: 16, range: 180 },
  chronomancer:{ maxHp: 75, maxMp: 150, attack: 8, defense: 5, speed: 5.2, critChance: 12, critDamage: 215, magicPower: 24, range: 240 },
  beastmaster: { maxHp: 110, maxMp: 90, attack: 13, defense: 8, speed: 5.4, critChance: 14, critDamage: 185, magicPower: 8, range: 200 },
}

export const START_WEAPONS: Record<CharacterClass, string> = {
  knight: 'wooden_sword',
  archer: 'wooden_bow',
  mage: 'wooden_staff',
  necromancer: 'bone_scythe',
  paladin: 'wooden_sword',
  berserker: 'wooden_sword',
  assassin: 'wooden_sword',
  druid: 'wooden_staff',
  monk: 'wooden_sword',
  samurai: 'iron_sword',
  summoner: 'wooden_staff',
  alchemist: 'wooden_staff',
  chronomancer: 'wooden_staff',
  beastmaster: 'wooden_bow',
}

const PRIMARY_SKILL: Record<CharacterClass, { name: string; icon: string }> = {
  knight: { name: 'Melee', icon: 'M' },
  archer: { name: 'Distancia', icon: 'D' },
  mage: { name: 'Magia', icon: 'G' },
  necromancer: { name: 'Necromancia', icon: 'N' },
  paladin: { name: 'Sagrado', icon: 'P' },
  berserker: { name: 'Fúria', icon: 'B' },
  assassin: { name: 'Furtividade', icon: 'A' },
  druid: { name: 'Natureza', icon: 'D' },
  monk: { name: 'Artes Marciais', icon: 'K' },
  samurai: { name: 'Bushido', icon: 'X' },
  summoner: { name: 'Invocação', icon: 'I' },
  alchemist: { name: 'Alquimia', icon: 'Q' },
  chronomancer: { name: 'Cronomancia', icon: 'T' },
  beastmaster: { name: 'Domínio', icon: 'F' },
}

function makeClassProgress(cls: CharacterClass): import('./types').ClassProgress {
  return {
    level: 1,
    xp: 0,
    xpToNext: 100,
    skills: [
      { name: PRIMARY_SKILL[cls].name, level: 1, xp: 0, xpToNext: 50, icon: PRIMARY_SKILL[cls].icon },
      { name: 'Defesa', level: 1, xp: 0, xpToNext: 50, icon: 'S' },
      { name: 'Vitalidade', level: 1, xp: 0, xpToNext: 50, icon: 'V' },
    ],
    abilities: buildAbilityStates(cls),
    equipment: {
      weapon: { ...ITEMS[START_WEAPONS[cls]] },
      armor: null, helmet: null, boots: null, ring: null,
    },
  }
}

export function createPlayer(name: string, cls: CharacterClass): Player {
  const stats = { ...BASE_STATS[cls] }
  const inventory = Array(30).fill(null) as (Item | null)[]
  inventory[0] = { ...ITEMS.small_potion, quantity: 5 }
  inventory[1] = { ...ITEMS.mana_potion, quantity: 3 }
  inventory[2] = { ...ITEMS[START_WEAPONS[cls]] }

  const classProgress: Record<CharacterClass, import('./types').ClassProgress> = {
    knight: makeClassProgress('knight'),
    archer: makeClassProgress('archer'),
    mage: makeClassProgress('mage'),
    necromancer: makeClassProgress('necromancer'),
    paladin: makeClassProgress('paladin'),
    berserker: makeClassProgress('berserker'),
    assassin: makeClassProgress('assassin'),
    druid: makeClassProgress('druid'),
    monk: makeClassProgress('monk'),
    samurai: makeClassProgress('samurai'),
    summoner: makeClassProgress('summoner'),
    alchemist: makeClassProgress('alchemist'),
    chronomancer: makeClassProgress('chronomancer'),
    beastmaster: makeClassProgress('beastmaster'),
  }

  const clsProgress = classProgress[cls]

  return {
    name,
    class: cls,
    level: clsProgress.level,
    xp: clsProgress.xp,
    xpToNext: clsProgress.xpToNext,
    hp: stats.maxHp,
    mp: stats.maxMp,
    stats: { ...stats },
    baseStats: { ...stats },
    gold: 50,
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    isAttacking: false,
    attackCooldown: 0,
    inventory,
    equipment: { ...clsProgress.equipment },
    skills: [...clsProgress.skills],
    abilities: [...clsProgress.abilities],
    classProgress,
    buffs: [],
    // Initialize new Phase 1 systems
    reputation: createDefaultReputation(),
    masteries: createDefaultMasteries(),
    pets: createDefaultPets(),
    achievements: createDefaultAchievements(),
    prestige: createDefaultPrestige(),
    specializations: createDefaultSpecializations(),
  }
}

export function calculateXpToNext(level: number): number {
  // No level cap - exponential scaling continues indefinitely
  return Math.floor(100 * Math.pow(1.4, level - 1))
}

export function recalcStats(player: Player): CharacterStats {
  const base = { ...player.baseStats }
  const eq = player.equipment

  const allEquipped = [eq.weapon, eq.armor, eq.helmet, eq.boots, eq.ring].filter(Boolean) as Item[]
  for (const item of allEquipped) {
    for (const [key, val] of Object.entries(item.stats)) {
      if (val !== undefined) {
        (base as Record<string, number>)[key] = ((base as Record<string, number>)[key] || 0) + (val as number)
      }
    }
  }

  const lvlBonus = (player.level - 1) * 0.12
  base.maxHp = Math.round(base.maxHp * (1 + lvlBonus))
  base.maxMp = Math.round(base.maxMp * (1 + lvlBonus))
  base.attack = Math.round(base.attack * (1 + lvlBonus))
  base.defense = Math.round(base.defense * (1 + lvlBonus))
  base.magicPower = Math.round(base.magicPower * (1 + lvlBonus))

  if (player.buffs && player.buffs.length > 0) {
    for (const buff of player.buffs) {
      (base as Record<string, number>)[buff.stat] = ((base as Record<string, number>)[buff.stat] || 0) + buff.amount
    }
  }

  return base
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIOMA: CAVERNA DE CRISTAL (10 andares)
// ═══════════════════════════════════════════════════════════════════════════════
function generateCrystalCaveMap(floor: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10): GameMap {
  const W = 400, H = 400
  const tiles: Tile[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => makeTile('crystal_wall'))
  )

  // Noise-based cave carving
  const cave: boolean[][] = Array.from({ length: H }, () => new Array(W).fill(false))
  // Multiple passes of cellular automata
  const seed = (floor * 1337 + 42)
  let rng = seed
  const randN = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647 }

  // Initialize with random alive cells (higher density for larger caves)
  for (let y = 2; y < H-2; y++)
    for (let x = 2; x < W-2; x++)
      cave[y][x] = randN() < 0.48

  // 6 CA passes for more organic caves
  for (let pass = 0; pass < 6; pass++) {
    const next = cave.map(r => [...r])
    for (let y = 1; y < H-1; y++) {
      for (let x = 1; x < W-1; x++) {
        let walls = 0
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (!cave[y+dy]?.[x+dx]) walls++
        next[y][x] = walls < 5
      }
    }
    for (let y = 0; y < H; y++) cave[y] = next[y]
  }

  // Ensure connectivity by adding corridors
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (y % 50 === 0 || x % 50 === 0) {
        cave[y][x] = true
      }
    }
  }

  // Apply to tiles
  const floorTile = floor >= 7 ? 'dark_crystal' : floor >= 4 ? 'crystal_floor' : 'crystal_floor' as TileType
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (cave[y][x]) tiles[y][x] = makeTile(floorTile)

  // Many more gem nodes (decoration)
  for (let i = 0; i < 40; i++) {
    const gx = Math.floor(randN() * (W-4)) + 2
    const gy = Math.floor(randN() * (H-4)) + 2
    if (cave[gy][gx]) tiles[gy][gx] = makeTile('gem_node')
  }

  // Find spawn and portal
  let spawnX = 50, spawnY = 50
  for (let y = 20; y < H/2; y++) for (let x = 20; x < W/2; x++)
    if (cave[y][x]) { spawnX = x; spawnY = y; break }
  let portalX = W-50, portalY = H-50
  for (let y = H-20; y > H/2; y--) for (let x = W-20; x > W/2; x--)
    if (cave[y][x]) { portalX = x; portalY = y; break }
  tiles[portalY][portalX] = makeTile('crystal_portal')

  // Entrance to previous floor / city
  let entX = 50, entY = H-50
  for (let y = H-20; y > H/2; y--) for (let x = 20; x < W/2; x++)
    if (cave[y][x]) { entX = x; entY = y; break }
  if (floor > 1) tiles[entY][entX] = makeTile('portal')

  // Monsters with scaling difficulty for 10 floors
  const floorIndex = floor - 1
  const levelData = [
    { minLvl: 18, maxLvl: 22, monsters: 40, champions: 6 },
    { minLvl: 21, maxLvl: 26, monsters: 45, champions: 7 },
    { minLvl: 24, maxLvl: 30, monsters: 50, champions: 8 },
    { minLvl: 27, maxLvl: 34, monsters: 55, champions: 9 },
    { minLvl: 30, maxLvl: 38, monsters: 60, champions: 10 },
    { minLvl: 33, maxLvl: 42, monsters: 65, champions: 11 },
    { minLvl: 36, maxLvl: 46, monsters: 70, champions: 12 },
    { minLvl: 39, maxLvl: 50, monsters: 75, champions: 13 },
    { minLvl: 42, maxLvl: 54, monsters: 80, champions: 14 },
    { minLvl: 45, maxLvl: 58, monsters: 85, champions: 15 },
  ]
  
  const currentLevelData = levelData[Math.min(floorIndex, levelData.length - 1)]
  const monsterTypes = floor < 4
    ? ['ghost', 'skeleton', 'witch'] as MonsterType[]
    : floor < 7
      ? ['demon', 'vampire', 'dragon'] as MonsterType[]
      : ['demon', 'dragon', 'witch', 'vampire'] as MonsterType[]
  const monsters: Monster[] = []

  for (let i = 0; i < currentLevelData.monsters; i++) {
    const mx = Math.floor(randN() * (W-40)) + 20
    const my = Math.floor(randN() * (H-40)) + 20
    if (!cave[my]?.[mx]) continue
    const type = monsterTypes[Math.floor(randN() * monsterTypes.length)]
    const lvl = currentLevelData.minLvl + Math.floor(randN() * (currentLevelData.maxLvl - currentLevelData.minLvl))
    monsters.push(createMonster(type, lvl, mx*32, my*32, rollEliteTier(0.05)))
  }

  // Champions scale with floor
  for (let i = 0; i < currentLevelData.champions; i++) {
    const mx = Math.floor(randN() * (W-40)) + 20
    const my = Math.floor(randN() * (H-40)) + 20
    if (!cave[my]?.[mx]) continue
    monsters.push(createMonster('dragon', currentLevelData.maxLvl-3, mx*32, my*32, 'champion'))
  }

  // Boss on floors 5 and 10
  if (floor === 5) {
    monsters.push(createMonster('dragon', 40, (W/2)*32, (H/2)*32, 'boss'))
  }
  if (floor === 10) {
    monsters.push(createMonster('dragon', 60, (W/2)*32, (H/2)*32, 'boss'))
  }

  return {
    id: `crystal${floor}`,
    name: `✦ Caverna de Cristal - Nível ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: spawnX*32, y: spawnY*32 }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: currentLevelData.minLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIOMA: RUÍNAS AMALDIÇOADAS (8 andares)
// ═══════════════════════════════════════════════════════════════════════════════
function generateHauntedRuinsMap(floor: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): GameMap {
  const W = 350, H = 350
  const tiles: Tile[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => makeTile('ruin_wall'))
  )

  let rng = floor * 9999 + 7777
  const randN = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647 }

  // Room-based ruins layout with many more rooms
  type Room = { x: number; y: number; w: number; h: number }
  const rooms: Room[] = []
  const roomCount = 200 + floor * 30 // More rooms on higher floors
  
  for (let attempt = 0; attempt < roomCount; attempt++) {
    const rw = 8 + Math.floor(randN() * 15)
    const rh = 8 + Math.floor(randN() * 12)
    const rx = 5 + Math.floor(randN() * (W - rw - 10))
    const ry = 5 + Math.floor(randN() * (H - rh - 10))
    let ok = true
    for (const r of rooms)
      if (rx < r.x+r.w+3 && rx+rw > r.x-3 && ry < r.y+r.h+3 && ry+rh > r.y-3) { ok = false; break }
    if (!ok) continue
    rooms.push({ x: rx, y: ry, w: rw, h: rh })
    // Carve room
    for (let y = ry; y < ry+rh; y++)
      for (let x = rx; x < rx+rw; x++)
        tiles[y][x] = makeTile('ruin_floor')
    // Cobwebs in corners
    if (floor > 2) {
      tiles[ry][rx] = makeTile('cobweb')
      tiles[ry][rx+rw-1] = makeTile('cobweb')
      tiles[ry+rh-1][rx] = makeTile('cobweb')
      tiles[ry+rh-1][rx+rw-1] = makeTile('cobweb')
    }
  }

  // Connect rooms with wider corridors for better accessibility
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i-1], b = rooms[i]
    const ax = Math.floor(a.x + a.w/2), ay = Math.floor(a.y + a.h/2)
    const bx = Math.floor(b.x + b.w/2), by = Math.floor(b.y + b.h/2)
    // Wider corridors (width 2)
    for (let x = Math.min(ax,bx); x <= Math.max(ax,bx); x++) {
      tiles[ay][x] = makeTile('ruin_floor')
      if (ay+1 < H) tiles[ay+1][x] = makeTile('ruin_floor')
    }
    for (let y = Math.min(ay,by); y <= Math.max(ay,by); y++) {
      tiles[y][bx] = makeTile('ruin_floor')
      if (bx+1 < W) tiles[y][bx+1] = makeTile('ruin_floor')
    }
  }

  // Add extra connections between distant rooms
  for (let i = 0; i < rooms.length - 20; i += 20) {
    if (rooms[i + 20]) {
      const a = rooms[i], b = rooms[i + 20]
      const ax = Math.floor(a.x + a.w/2), ay = Math.floor(a.y + a.h/2)
      const bx = Math.floor(b.x + b.w/2), by = Math.floor(b.y + b.h/2)
      for (let x = Math.min(ax,bx); x <= Math.max(ax,bx); x++) tiles[ay][x] = makeTile('ruin_floor')
      for (let y = Math.min(ay,by); y <= Math.max(ay,by); y++) tiles[y][bx] = makeTile('ruin_floor')
    }
  }

  // Portal in last room
  const lastR = rooms[rooms.length-1]
  const portalX = Math.floor(lastR.x + lastR.w/2), portalY = Math.floor(lastR.y + lastR.h/2)
  tiles[portalY][portalX] = makeTile('haunted_portal')
  if (floor > 1 && rooms[0]) {
    const firstR = rooms[0]
    tiles[Math.floor(firstR.y + firstR.h/2)][Math.floor(firstR.x + firstR.w/2)] = makeTile('portal')
  }

  // Scaling difficulty for 8 floors
  const floorIndex = floor - 1
  const levelData = [
    { minLvl: 20, maxLvl: 27, monsters: 4, champions: 3 },
    { minLvl: 24, maxLvl: 32, monsters: 5, champions: 4 },
    { minLvl: 28, maxLvl: 36, monsters: 6, champions: 5 },
    { minLvl: 32, maxLvl: 40, monsters: 7, champions: 6 },
    { minLvl: 36, maxLvl: 45, monsters: 8, champions: 7 },
    { minLvl: 40, maxLvl: 50, monsters: 9, champions: 8 },
    { minLvl: 44, maxLvl: 55, monsters: 10, champions: 9 },
    { minLvl: 48, maxLvl: 60, monsters: 11, champions: 10 },
  ]
  
  const currentLevelData = levelData[Math.min(floorIndex, levelData.length - 1)]
  const monsterTypes = (floor <= 2
    ? ['ghost', 'zombie', 'skeleton', 'witch']
    : floor <= 4
      ? ['vampire', 'ghost', 'demon', 'witch']
      : ['vampire', 'demon', 'dragon', 'witch']) as MonsterType[]

  const monsters: Monster[] = []
  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i]
    const count = currentLevelData.monsters + Math.floor(randN() * 3)
    for (let j = 0; j < count; j++) {
      const mx = room.x + 2 + Math.floor(randN() * (room.w-4))
      const my = room.y + 2 + Math.floor(randN() * (room.h-4))
      const type = monsterTypes[Math.floor(randN() * monsterTypes.length)]
      const lvl = currentLevelData.minLvl + Math.floor(randN() * (currentLevelData.maxLvl - currentLevelData.minLvl))
      monsters.push(createMonster(type, lvl, mx*32, my*32, rollEliteTier(0.06)))
    }
  }

  // Boss on floors 4 and 8
  if (floor === 4) {
    monsters.push(createMonster('demon', 45, portalX*32, (portalY-6)*32, 'boss'))
  }
  if (floor === 8) {
    monsters.push(createMonster('demon', 65, portalX*32, (portalY-6)*32, 'boss'))
  }
  // Champions
  for (let i = 0; i < currentLevelData.champions * 2; i++) {
    const room = rooms[Math.floor(randN() * rooms.length)]
    const type = monsterTypes[Math.floor(randN() * monsterTypes.length)]
    monsters.push(createMonster(type, currentLevelData.maxLvl, Math.floor(room.x + room.w/2)*32, Math.floor(room.y + room.h/2)*32, 'champion'))
  }

  const spawnR = rooms[0]
  return {
    id: `haunted${floor}`,
    name: `☠ Ruínas Amaldiçoadas - Nível ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: Math.floor(spawnR.x + spawnR.w/2)*32, y: Math.floor(spawnR.y + spawnR.h/2)*32 }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: currentLevelData.minLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIOMA: REINO CELESTIAL (6 andares)
// ═══════════════════════════════════════════════════════════════════════════════
function generateSkyRealmMap(floor: 1 | 2 | 3 | 4 | 5 | 6): GameMap {
  const W = 700, H = 700
  const tiles: Tile[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => makeTile('sky_void'))
  )

  let rng = floor * 5555 + 3131
  const randN = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647 }

  // Sky platforms — floating islands of varying sizes
  type Platform = { cx: number; cy: number; r: number }
  const platforms: Platform[] = []
  const mainCX = Math.floor(W/2), mainCY = Math.floor(H/2)

  // Central hub platform - much larger for higher floors
  const hubR = 20 + floor * 5
  platforms.push({ cx: mainCX, cy: mainCY, r: hubR })

  // Many more satellite platforms
  const platformCount = 30 + floor * 10
  for (let i = 0; i < platformCount; i++) {
    const angle = randN() * Math.PI * 2
    const dist  = 50 + Math.floor(randN() * 150)
    const cx    = Math.floor(mainCX + Math.cos(angle) * dist)
    const cy    = Math.floor(mainCY + Math.sin(angle) * dist)
    const r     = 8 + Math.floor(randN() * 15)
    if (cx - r < 10 || cx + r > W-10 || cy - r < 10 || cy + r > H-10) continue
    platforms.push({ cx, cy, r })
  }
  
  // Add connecting bridges between nearby platforms
  for (let i = 0; i < platforms.length; i++) {
    for (let j = i + 1; j < platforms.length; j++) {
      const p1 = platforms[i], p2 = platforms[j]
      const dist = Math.hypot(p1.cx - p2.cx, p1.cy - p2.cy)
      if (dist < 80 && Math.random() < 0.3) {
        // Create a bridge
        const steps = Math.floor(dist / 5)
        for (let s = 0; s <= steps; s++) {
          const t = s / steps
          const bx = Math.floor(p1.cx + (p2.cx - p1.cx) * t)
          const by = Math.floor(p1.cy + (p2.cy - p1.cy) * t)
          if (bx >= 0 && bx < W && by >= 0 && by < H) {
            tiles[by][bx] = makeTile('sky_platform')
          }
        }
      }
    }
  }

  // Carve platforms as ellipses + sky_platform tile borders
  for (const plat of platforms) {
    for (let dy = -plat.r; dy <= plat.r; dy++) {
      for (let dx = -plat.r; dx <= plat.r; dx++) {
        const dist = Math.sqrt(dx*dx / (plat.r*plat.r) + dy*dy / ((plat.r*0.65)*(plat.r*0.65)))
        const px = plat.cx + dx, py = plat.cy + dy
        if (px < 0 || py < 0 || px >= W || py >= H) continue
        if (dist <= 1.0) tiles[py][px] = makeTile(dist > 0.78 ? 'sky_platform' : 'cloud_floor')
      }
    }
  }

  // Portal on last satellite
  const lastPlat = platforms[platforms.length-1]
  tiles[lastPlat.cy][lastPlat.cx] = makeTile('sky_portal')
  // Return portal  
  if (floor > 1) tiles[mainCY-5][mainCX] = makeTile('portal')

  // Monsters — flying/magic enemies with scaling difficulty for 6 floors
  const floorIndex = floor - 1
  const levelData = [
    { minLvl: 22, maxLvl: 29, monsters: 15, champions: 3 },
    { minLvl: 28, maxLvl: 36, monsters: 20, champions: 4 },
    { minLvl: 34, maxLvl: 44, monsters: 25, champions: 5 },
    { minLvl: 40, maxLvl: 52, monsters: 30, champions: 6 },
    { minLvl: 46, maxLvl: 60, monsters: 35, champions: 7 },
    { minLvl: 52, maxLvl: 68, monsters: 40, champions: 8 },
  ]
  
  const currentLevelData = levelData[Math.min(floorIndex, levelData.length - 1)]
  const monsterTypes = (floor <= 2
    ? ['witch', 'mage_enemy', 'ghost']
    : floor <= 4
      ? ['dragon', 'witch', 'demon', 'mage_enemy']
      : ['dragon', 'demon', 'vampire', 'ghost']) as MonsterType[]

  const monsters: Monster[] = []
  for (const plat of platforms.slice(1)) {
    const count = 1 + Math.floor(randN() * (currentLevelData.monsters / platforms.length))
    for (let j = 0; j < count; j++) {
      const angle2 = randN() * Math.PI * 2
      const dr2    = Math.floor(randN() * (plat.r * 0.6))
      const mx     = plat.cx + Math.round(Math.cos(angle2) * dr2)
      const my     = plat.cy + Math.round(Math.sin(angle2) * dr2)
      if (mx < 0 || my < 0 || mx >= W || my >= H) continue
      if (tiles[my][mx].type === 'sky_void') continue
      const type = monsterTypes[Math.floor(randN() * monsterTypes.length)]
      const lvl  = currentLevelData.minLvl + Math.floor(randN() * (currentLevelData.maxLvl - currentLevelData.minLvl))
      monsters.push(createMonster(type, lvl, mx*32, my*32, rollEliteTier(0.06)))
    }
  }

  // Champions + Boss
  for (let i = 0; i < currentLevelData.champions; i++) {
    const plat = platforms[Math.floor(randN() * platforms.length)]
    monsters.push(createMonster('dragon', currentLevelData.maxLvl, plat.cx*32, plat.cy*32, 'champion'))
  }
  
  // Boss on floors 3 and 6
  if (floor === 3) {
    monsters.push(createMonster('dragon', 50, mainCX*32, (mainCY-5)*32, 'boss'))
  }
  if (floor === 6) {
    monsters.push(createMonster('dragon', 70, mainCX*32, (mainCY-5)*32, 'boss'))
  }

  return {
    id: `sky${floor}`,
    name: `⚡ Reino Celestial - Nível ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: mainCX*32, y: mainCY*32 }],
    ambience: 'sky', musicTheme: 'sky',
    minLevel: currentLevelData.minLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOVO BIOMA: PRADARIA FLORIDA (adjacente a cidade)
// ═══════════════════════════════════════════════════════════════════════════════
function generateMeadowMap(): GameMap {
  const W = 200, H = 200
  const tiles: Tile[][] = []
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.08) + Math.cos(y * 0.09) + 2) / 4
      let type: TileType = 'grass'
      if (v < 0.2) type = 'water'
      else if (v < 0.28) type = 'flower'
      else if (v > 0.78) type = 'tree'
      else if ((x + y * 3) % 7 === 0) type = 'flower'
      else if ((x * 2 + y) % 5 === 0) type = 'tall_grass'
      else if ((x + y) % 11 === 0) type = 'garden'
      tiles[y][x] = makeTile(type)
    }
  }
  for (let x = 0; x < W; x++) { tiles[0][x] = makeTile('wall'); tiles[H-1][x] = makeTile('wall') }
  for (let y = 0; y < H; y++) { tiles[y][0] = makeTile('wall'); tiles[y][W-1] = makeTile('wall') }
  // Portal de volta para cidade
  tiles[H-10][Math.floor(W/2)] = makeTile('portal')

  const monsters: Monster[] = []
  for (let i = 0; i < 14; i++) {
    const px = 20 + Math.floor(Math.random() * (W - 40))
    const py = 20 + Math.floor(Math.random() * (H - 40))
    const type = (['slime','wolf','spider'] as MonsterType[])[Math.floor(Math.random()*3)]
    monsters.push(createMonster(type, 2 + Math.floor(Math.random()*4), px*32, py*32, 'normal'))
  }
  return {
    id: 'meadow', name: 'Pradaria Florida',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: Math.floor(W/2)*32, y: (H-12)*32 }],
    ambience: 'forest', musicTheme: 'forest', minLevel: 1,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOVO BIOMA: COSTA ROCHOSA (adjacente a cidade)
// ═══════════════════════════════════════════════════════════════════════════════
function generateCoastMap(): GameMap {
  const W = 220, H = 200
  const tiles: Tile[][] = []
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const shore = y / H
      let type: TileType = 'sand'
      const noise = (Math.sin(x*0.1) + Math.cos(y*0.07)) * 0.5
      if (shore > 0.65 + noise * 0.1) type = 'water'
      if (shore > 0.85) type = 'deepwater'
      if (shore < 0.25 && (x+y) % 6 === 0) type = 'rock'
      if (shore < 0.4 && (x*3+y) % 9 === 0) type = 'rock'
      if (shore < 0.3 && (x+y*2) % 7 === 0) type = 'grass'
      tiles[y][x] = makeTile(type)
    }
  }
  for (let x = 0; x < W; x++) { tiles[0][x] = makeTile('wall'); tiles[H-1][x] = makeTile('wall') }
  for (let y = 0; y < H; y++) { tiles[y][0] = makeTile('wall'); tiles[y][W-1] = makeTile('wall') }
  tiles[10][Math.floor(W/2)] = makeTile('portal')

  const monsters: Monster[] = []
  for (let i = 0; i < 14; i++) {
    const px = 20 + Math.floor(Math.random() * (W - 40))
    const py = 20 + Math.floor(Math.random() * (H/2 - 20))
    if (!tiles[py][px].walkable) continue
    const type = (['spider','goblin','slime'] as MonsterType[])[Math.floor(Math.random()*3)]
    monsters.push(createMonster(type, 3 + Math.floor(Math.random()*4), px*32, py*32, 'normal'))
  }
  return {
    id: 'coast', name: 'Costa Rochosa',
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: Math.floor(W/2)*32, y: 14*32 }],
    ambience: 'desert', musicTheme: 'desert', minLevel: 2,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATACUMBAS — 2 ANDARES DE PROFUNDIDADE (abaixo da cidade)
// ═══════════════════════════════════════════════════════════════════════════════
function generateCatacombsMap(floor: 1 | 2): GameMap {
  const W = 150, H = 150
  const tiles: Tile[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => makeTile('dungeon_wall'))
  )

  let rng = floor * 4321 + 911
  const randN = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647 }

  type Room = { x: number; y: number; w: number; h: number }
  const rooms: Room[] = []
  const roomCount = 25
  for (let attempt = 0; attempt < roomCount * 4 && rooms.length < roomCount; attempt++) {
    const rw = 6 + Math.floor(randN() * 8)
    const rh = 5 + Math.floor(randN() * 7)
    const rx = 3 + Math.floor(randN() * (W - rw - 6))
    const ry = 3 + Math.floor(randN() * (H - rh - 6))
    let ok = true
    for (const r of rooms)
      if (rx < r.x+r.w+2 && rx+rw > r.x-2 && ry < r.y+r.h+2 && ry+rh > r.y-2) { ok = false; break }
    if (!ok) continue
    rooms.push({ x: rx, y: ry, w: rw, h: rh })
    for (let y = ry; y < ry+rh; y++) for (let x = rx; x < rx+rw; x++)
      tiles[y][x] = makeTile('dungeon_floor')
  }
  // Connect
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i-1], b = rooms[i]
    const ax = Math.floor(a.x + a.w/2), ay = Math.floor(a.y + a.h/2)
    const bx = Math.floor(b.x + b.w/2), by = Math.floor(b.y + b.h/2)
    for (let x = Math.min(ax,bx); x <= Math.max(ax,bx); x++) {
      tiles[ay][x] = makeTile('dungeon_floor')
      if (ay+1 < H) tiles[ay+1][x] = makeTile('dungeon_floor')
    }
    for (let y = Math.min(ay,by); y <= Math.max(ay,by); y++) {
      tiles[y][bx] = makeTile('dungeon_floor')
      if (bx+1 < W) tiles[y][bx+1] = makeTile('dungeon_floor')
    }
  }
  // Portal de SUBIDA (volta) na primeira sala
  const r0 = rooms[0]
  const upX = Math.floor(r0.x + r0.w/2), upY = Math.floor(r0.y + r0.h/2)
  tiles[upY][upX] = makeTile('portal')
  // Portal de DESCIDA (avancar) na ultima sala — apenas no andar 1
  if (floor === 1) {
    const rL = rooms[rooms.length - 1]
    const dX = Math.floor(rL.x + rL.w/2), dY = Math.floor(rL.y + rL.h/2)
    tiles[dY][dX] = makeTile('haunted_portal') // reusa pra portal de descida
  }

  // Monsters
  const monsters: Monster[] = []
  const baseLvl = floor === 1 ? 4 : 9
  const monsterTypes: MonsterType[] = floor === 1
    ? ['skeleton', 'zombie', 'spider']
    : ['skeleton', 'zombie', 'witch', 'ghost', 'vampire']
  for (let i = 1; i < rooms.length; i++) {
    const r = rooms[i]
    const count = floor === 1 ? 1 : 2
    for (let j = 0; j < count; j++) {
      const px = r.x + 2 + Math.floor(randN() * Math.max(1, r.w - 4))
      const py = r.y + 2 + Math.floor(randN() * Math.max(1, r.h - 4))
      const type = monsterTypes[Math.floor(randN() * monsterTypes.length)]
      const lvl = baseLvl + Math.floor(randN() * 4)
      monsters.push(createMonster(type, lvl, px*32, py*32, 'normal'))
    }
  }
  // Mini-chefe no andar 2
  if (floor === 2 && rooms.length > 1) {
    const rL = rooms[rooms.length - 1]
    monsters.push(createMonster('vampire', 15, Math.floor(rL.x + rL.w/2)*32, Math.floor(rL.y + rL.h/2)*32, 'boss'))
  }

  return {
    id: `catacombs${floor}`,
    name: `Catacumbas — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: upX*32, y: (upY+2)*32 }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: floor === 1 ? 3 : 8,
  }
}

// ─── Snowy Mountain (3 floors) ────────────────────────────────────────────
function generateSnowyMountainMap(floor: number): GameMap {
  const W = 220 + floor * 40, H = 220 + floor * 40
  const tiles: Tile[][] = []
  const seed = 9000 + floor * 137
  let r = seed
  const rand = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 }

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.07 + floor) + Math.cos(y * 0.07 - floor) + 2) / 4
      let type: TileType = 'snow'
      if (v < 0.20) type = 'frost_grass'
      else if (v < 0.30) type = 'snow_path'
      else if (v > 0.82) type = 'snowy_peak'
      else if (v > 0.72) type = 'mountain_rock'
      else if ((x + y) % 13 === 0) type = 'pine_tree'
      else if ((x * 3 + y) % 17 === 0) type = 'frost_grass'
      tiles[y][x] = makeTile(type)
    }
  }

  // Walls of ice on outer edge
  for (let x = 0; x < W; x++) { tiles[0][x] = makeTile('ice'); tiles[H-1][x] = makeTile('ice') }
  for (let y = 0; y < H; y++) { tiles[y][0] = makeTile('ice'); tiles[y][W-1] = makeTile('ice') }

  // Snow paths
  for (let x = 4; x < W - 4; x++) {
    if (tiles[Math.floor(H/2)][x].walkable) tiles[Math.floor(H/2)][x] = makeTile('snow_path')
  }
  for (let y = 4; y < H - 4; y++) {
    if (tiles[y][Math.floor(W/2)].walkable) tiles[y][Math.floor(W/2)] = makeTile('snow_path')
  }

  // Sparse special tiles
  for (let i = 0; i < 14 + floor * 4; i++) {
    const x = 5 + Math.floor(rand() * (W - 10))
    const y = 5 + Math.floor(rand() * (H - 10))
    tiles[y][x] = makeTile('ice_crystal_node')
  }
  for (let i = 0; i < 4 + floor; i++) {
    const x = 8 + Math.floor(rand() * (W - 16))
    const y = 8 + Math.floor(rand() * (H - 16))
    tiles[y][x] = makeTile('frozen_campfire')
  }

  // Spawn near top-left, portal forward at bottom-right
  const sx = 6, sy = 6
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (sx+dx > 0 && sy+dy > 0) tiles[sy+dy][sx+dx] = makeTile('snow_path')
  }
  // Back portal (up to previous floor / city)
  tiles[sy][sx] = makeTile('portal')

  // Forward portal (only floors 1 & 2)
  if (floor < 3) {
    const fx = W - 7, fy = H - 7
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (fx+dx < W-1 && fy+dy < H-1) tiles[fy+dy][fx+dx] = makeTile('snow_path')
    }
    tiles[fy][fx] = makeTile('mountain_portal')
  }

  const monsters: Monster[] = []
  const pool: MonsterType[] = floor === 1
    ? ['wolf','skeleton','goblin']
    : floor === 2
    ? ['wolf','witch','troll','spider']
    : ['troll','witch','dragon','ghost','vampire']
  const baseLvl = floor === 1 ? 4 : floor === 2 ? 10 : 18
  const count = 40 + floor * 20
  for (let i = 0; i < count; i++) {
    const x = 4 + Math.floor(rand() * (W - 8))
    const y = 4 + Math.floor(rand() * (H - 8))
    if (!tiles[y][x].walkable) continue
    const t = pool[Math.floor(rand() * pool.length)]
    const lvl = baseLvl + Math.floor(rand() * 5)
    const elite = rand() < 0.03 ? 'elite' : 'normal'
    monsters.push(createMonster(t, lvl, x*32, y*32, elite as EliteTier))
  }
  // Boss on last floor
  if (floor === 3) {
    monsters.push(createMonster('dragon', baseLvl + 8, Math.floor(W/2)*32, Math.floor(H/2)*32, 'boss'))
  }

  return {
    id: `mountain${floor}`,
    name: `Montanha Nevada — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: (sx+1)*32, y: (sy+1)*32 }],
    ambience: 'tundra', musicTheme: 'tundra',
    minLevel: baseLvl,
  }
}

// ─── Ancient Ruins (3 floors) ─────────────────────────────────────────────
function generateAncientRuinsMap(floor: number): GameMap {
  const W = 220 + floor * 40, H = 220 + floor * 40
  const tiles: Tile[][] = []
  const seed = 4400 + floor * 211
  let r = seed
  const rand = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 }

  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const v = (Math.sin(x * 0.08 + floor * 1.3) + Math.cos(y * 0.08 - floor) + 2) / 4
      let type: TileType = 'ancient_tile'
      if (v < 0.22) type = 'broken_tile'
      else if (v > 0.78) type = 'vine_wall'
      else if ((x + y * 2) % 19 === 0) type = 'ruin_pillar'
      else if ((x * 5 + y) % 23 === 0) type = 'broken_tile'
      tiles[y][x] = makeTile(type)
    }
  }

  // Outer walls
  for (let x = 0; x < W; x++) { tiles[0][x] = makeTile('vine_wall'); tiles[H-1][x] = makeTile('vine_wall') }
  for (let y = 0; y < H; y++) { tiles[y][0] = makeTile('vine_wall'); tiles[y][W-1] = makeTile('vine_wall') }

  // Grand corridors
  for (let x = 3; x < W - 3; x++) tiles[Math.floor(H/2)][x] = makeTile('ancient_tile')
  for (let y = 3; y < H - 3; y++) tiles[y][Math.floor(W/2)] = makeTile('ancient_tile')

  // Sarcophagi clusters
  for (let i = 0; i < 8 + floor * 3; i++) {
    const x = 6 + Math.floor(rand() * (W - 12))
    const y = 6 + Math.floor(rand() * (H - 12))
    tiles[y][x] = makeTile('sarcophagus')
  }
  // Rune stones (lore)
  for (let i = 0; i < 10 + floor * 2; i++) {
    const x = 4 + Math.floor(rand() * (W - 8))
    const y = 4 + Math.floor(rand() * (H - 8))
    tiles[y][x] = makeTile('rune_stone')
  }
  // Braziers
  for (let i = 0; i < 6 + floor * 2; i++) {
    const x = 4 + Math.floor(rand() * (W - 8))
    const y = 4 + Math.floor(rand() * (H - 8))
    tiles[y][x] = makeTile('ancient_brazier')
  }

  // Spawn
  const sx = 6, sy = 6
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (sx+dx > 0 && sy+dy > 0) tiles[sy+dy][sx+dx] = makeTile('ancient_tile')
  }
  tiles[sy][sx] = makeTile('portal')

  if (floor < 3) {
    const fx = W - 7, fy = H - 7
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (fx+dx < W-1 && fy+dy < H-1) tiles[fy+dy][fx+dx] = makeTile('ancient_tile')
    }
    tiles[fy][fx] = makeTile('ruins_portal')
  }

  const monsters: Monster[] = []
  const pool: MonsterType[] = floor === 1
    ? ['skeleton','zombie','spider','ghost']
    : floor === 2
    ? ['skeleton','ghost','vampire','witch','demon']
    : ['vampire','demon','dragon','knight_enemy','mage_enemy']
  const baseLvl = floor === 1 ? 6 : floor === 2 ? 14 : 22
  const count = 45 + floor * 20
  for (let i = 0; i < count; i++) {
    const x = 4 + Math.floor(rand() * (W - 8))
    const y = 4 + Math.floor(rand() * (H - 8))
    if (!tiles[y][x].walkable) continue
    const t = pool[Math.floor(rand() * pool.length)]
    const lvl = baseLvl + Math.floor(rand() * 5)
    const elite = rand() < 0.04 ? 'elite' : 'normal'
    monsters.push(createMonster(t, lvl, x*32, y*32, elite as EliteTier))
  }
  if (floor === 3) {
    monsters.push(createMonster('demon', baseLvl + 10, Math.floor(W/2)*32, Math.floor(H/2)*32, 'boss'))
  }

  return {
    id: `ruins${floor}`,
    name: `Ruínas Antigas — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: (sx+1)*32, y: (sy+1)*32 }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: baseLvl,
  }
}
