import type { Item, ItemRarity, MonsterType } from './types'

// Tabela de raridade por nível do inimigo
const RARITY_CHANCES: Record<number, Record<ItemRarity, number>> = {
  // Nível 1-5: 95% common, 5% uncommon
  1: { common: 0.95, uncommon: 0.05, rare: 0, epic: 0, legendary: 0 },
  2: { common: 0.90, uncommon: 0.10, rare: 0, epic: 0, legendary: 0 },
  3: { common: 0.85, uncommon: 0.15, rare: 0, epic: 0, legendary: 0 },
  4: { common: 0.80, uncommon: 0.20, rare: 0, epic: 0, legendary: 0 },
  5: { common: 0.75, uncommon: 0.25, rare: 0, epic: 0, legendary: 0 },
  // Nível 6-10: Raros começam a aparecer
  6: { common: 0.70, uncommon: 0.25, rare: 0.05, epic: 0, legendary: 0 },
  7: { common: 0.65, uncommon: 0.28, rare: 0.07, epic: 0, legendary: 0 },
  8: { common: 0.60, uncommon: 0.30, rare: 0.10, epic: 0, legendary: 0 },
  9: { common: 0.55, uncommon: 0.30, rare: 0.15, epic: 0, legendary: 0 },
  10: { common: 0.50, uncommon: 0.30, rare: 0.20, epic: 0, legendary: 0 },
  // Nível 11-15: Épicos começam
  11: { common: 0.48, uncommon: 0.28, rare: 0.22, epic: 0.02, legendary: 0 },
  12: { common: 0.45, uncommon: 0.27, rare: 0.24, epic: 0.04, legendary: 0 },
  13: { common: 0.42, uncommon: 0.26, rare: 0.26, epic: 0.06, legendary: 0 },
  14: { common: 0.40, uncommon: 0.25, rare: 0.28, epic: 0.07, legendary: 0 },
  15: { common: 0.38, uncommon: 0.24, rare: 0.30, epic: 0.08, legendary: 0 },
  // Nível 16-20: Mais épicos
  16: { common: 0.35, uncommon: 0.23, rare: 0.32, epic: 0.10, legendary: 0 },
  17: { common: 0.33, uncommon: 0.22, rare: 0.33, epic: 0.12, legendary: 0 },
  18: { common: 0.30, uncommon: 0.20, rare: 0.35, epic: 0.14, legendary: 0.01 },
  19: { common: 0.28, uncommon: 0.19, rare: 0.36, epic: 0.16, legendary: 0.01 },
  20: { common: 0.25, uncommon: 0.18, rare: 0.37, epic: 0.18, legendary: 0.02 },
  // Nível 21-30: Lendários aparecem regularmente
  21: { common: 0.22, uncommon: 0.17, rare: 0.38, epic: 0.21, legendary: 0.02 },
  22: { common: 0.20, uncommon: 0.16, rare: 0.38, epic: 0.23, legendary: 0.03 },
  23: { common: 0.18, uncommon: 0.15, rare: 0.38, epic: 0.25, legendary: 0.04 },
  24: { common: 0.16, uncommon: 0.14, rare: 0.38, epic: 0.27, legendary: 0.05 },
  25: { common: 0.14, uncommon: 0.13, rare: 0.38, epic: 0.29, legendary: 0.06 },
  // Nível 30+: Lendários e Épicos dominam
  30: { common: 0.10, uncommon: 0.10, rare: 0.35, epic: 0.35, legendary: 0.10 },
  35: { common: 0.08, uncommon: 0.08, rare: 0.30, epic: 0.39, legendary: 0.15 },
  40: { common: 0.05, uncommon: 0.05, rare: 0.25, epic: 0.40, legendary: 0.25 },
}

// Itens por raridade (exemplos)
const ITEM_POOL: Record<ItemRarity, Item[]> = {
  common: [
    { 
      id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', rarity: 'common',
      icon: '⚔', description: 'Uma espada simples de ferro', 
      stats: { attack: 2 }, value: 10, level: 1
    },
    { 
      id: 'leather_armor', name: 'Armadura de Couro', type: 'armor', rarity: 'common',
      icon: '🛡', description: 'Proteção básica', 
      stats: { defense: 1 }, value: 15, level: 1
    },
    { 
      id: 'cloth_helm', name: 'Capacete de Pano', type: 'helmet', rarity: 'common',
      icon: '🎓', description: 'Proteção mínima', 
      stats: { defense: 1 }, value: 8, level: 1
    },
    { 
      id: 'basic_ring', name: 'Anel Básico', type: 'ring', rarity: 'common',
      icon: '💍', description: 'Um anel simples',
      stats: { maxHp: 5 }, value: 5, level: 1
    },
  ],
  uncommon: [
    { 
      id: 'steel_sword', name: 'Espada de Aço', type: 'weapon', rarity: 'uncommon',
      icon: '🗡', description: 'Uma boa arma de aço', 
      stats: { attack: 5 }, value: 40, level: 5
    },
    { 
      id: 'reinforced_armor', name: 'Armadura Reforçada', type: 'armor', rarity: 'uncommon',
      icon: '🛡', description: 'Proteção reforçada', 
      stats: { defense: 3 }, value: 50, level: 5
    },
    { 
      id: 'iron_helm', name: 'Capacete de Ferro', type: 'helmet', rarity: 'uncommon',
      icon: '⚔', description: 'Defesa melhorada',
      stats: { defense: 2, maxHp: 10 }, value: 35, level: 5
    },
    { 
      id: 'emerald_ring', name: 'Anel de Esmeralda', type: 'ring', rarity: 'uncommon',
      icon: '💎', description: 'Aumenta resistência',
      stats: { maxHp: 15, defense: 1 }, value: 25, level: 5
    },
  ],
  rare: [
    { 
      id: 'mithril_sword', name: 'Espada de Mithril', type: 'weapon', rarity: 'rare',
      icon: '✨', description: 'Uma arma lendária', 
      stats: { attack: 12, critChance: 0.05 }, value: 120, level: 10
    },
    { 
      id: 'dragon_armor', name: 'Armadura de Dragão', type: 'armor', rarity: 'rare',
      icon: '🐉', description: 'Proteção de dragão', 
      stats: { defense: 7, maxHp: 20 }, value: 150, level: 10
    },
    { 
      id: 'rune_helm', name: 'Capacete de Runa', type: 'helmet', rarity: 'rare',
      icon: '✦', description: 'Runa de proteção',
      stats: { defense: 5, magicPower: 3 }, value: 100, level: 10
    },
    { 
      id: 'sapphire_ring', name: 'Anel de Safira', type: 'ring', rarity: 'rare',
      icon: '💎', description: 'Poder mágico',
      stats: { maxMp: 20, magicPower: 2 }, value: 80, level: 10
    },
  ],
  epic: [
    { 
      id: 'excalibur', name: 'Excalibur', type: 'weapon', rarity: 'epic',
      icon: '⚜', description: 'A espada lendária', 
      stats: { attack: 25, critDamage: 0.5 }, value: 400, level: 15
    },
    { 
      id: 'titan_armor', name: 'Armadura Titã', type: 'armor', rarity: 'epic',
      icon: '👑', description: 'Poder de um titã', 
      stats: { defense: 15, maxHp: 50 }, value: 500, level: 15
    },
    { 
      id: 'phoenix_helm', name: 'Capacete de Fênix', type: 'helmet', rarity: 'epic',
      icon: '🔥', description: 'Renasce das cinzas',
      stats: { defense: 10, maxHp: 40 }, value: 350, level: 15
    },
    { 
      id: 'void_ring', name: 'Anel do Vazio', type: 'ring', rarity: 'epic',
      icon: '⚫', description: 'Vazio absoluto',
      stats: { attack: 8, magicPower: 5, speed: 1 }, value: 300, level: 15
    },
  ],
  legendary: [
    { 
      id: 'godslayer', name: 'Matador de Deuses', type: 'weapon', rarity: 'legendary',
      icon: '⚡', description: 'Arma suprema', 
      stats: { attack: 50, critChance: 0.15, critDamage: 1.0 }, value: 1000, level: 25
    },
    { 
      id: 'divine_armor', name: 'Armadura Divina', type: 'armor', rarity: 'legendary',
      icon: '✨', description: 'Proteção suprema', 
      stats: { defense: 30, maxHp: 100 }, value: 1200, level: 25
    },
    { 
      id: 'crown_helm', name: 'Coroa Celestial', type: 'helmet', rarity: 'legendary',
      icon: '👑', description: 'Rainha celestial',
      stats: { defense: 25, maxHp: 80, magicPower: 10 }, value: 1000, level: 25
    },
    { 
      id: 'infinity_ring', name: 'Anel do Infinito', type: 'ring', rarity: 'legendary',
      icon: '∞', description: 'Infinito poder',
      stats: { attack: 15, defense: 10, maxHp: 50, maxMp: 50, speed: 2 }, value: 800, level: 25
    },
  ],
}

/**
 * Calcula a chance de drop de item baseado no nível do inimigo
 * @param monsterLevel - Nível do monstro
 * @returns Número entre 0 e 1 representando a chance de drop
 */
export function getDropChance(monsterLevel: number): number {
  // Chance base é 15% (0.15)
  // Aumenta 2% por nível acima de 1
  const baseChance = 0.15
  const levelBonus = (monsterLevel - 1) * 0.02
  const maxChance = 0.40 // Cap em 40%
  
  return Math.min(baseChance + levelBonus, maxChance)
}

/**
 * Seleciona uma raridade aleatória baseada no nível do inimigo
 */
function selectRarity(monsterLevel: number): ItemRarity {
  const clampedLevel = Math.min(Math.max(monsterLevel, 1), 40)
  const chances = RARITY_CHANCES[clampedLevel] || RARITY_CHANCES[40]
  
  const random = Math.random()
  let cumulative = 0
  
  for (const [rarity, chance] of Object.entries(chances)) {
    cumulative += chance
    if (random <= cumulative) {
      return rarity as ItemRarity
    }
  }
  
  return 'common'
}

/**
 * Seleciona um item aleatório de uma raridade
 */
function selectItem(rarity: ItemRarity): Item {
  const pool = ITEM_POOL[rarity]
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Gera um item de drop para um monstro derrotado
 * @param monsterLevel - Nível do monstro
 * @param monsterType - Tipo do monstro (afeta a chance)
 * @returns Item ou null se não houve drop
 */
export function generateMonsterDrop(
  monsterLevel: number,
  monsterType: MonsterType
): Item | null {
  // Boss/inimigos especiais têm 2x de chance
  const isBoss = ['dragon', 'vampire', 'demon', 'troll', 'witch'].includes(monsterType)
  const dropChance = getDropChance(monsterLevel) * (isBoss ? 2 : 1)
  
  if (Math.random() > dropChance) {
    return null
  }

  // Boss sempre dropam pelo menos uncommon
  let rarity: ItemRarity
  if (isBoss) {
    const roll = Math.random()
    if (roll < 0.1) {
      rarity = 'legendary'
    } else if (roll < 0.3) {
      rarity = 'epic'
    } else if (roll < 0.6) {
      rarity = 'rare'
    } else {
      rarity = 'uncommon'
    }
  } else {
    rarity = selectRarity(monsterLevel)
  }

  const item = selectItem(rarity)
  
  // Ajusta o nível do item baseado no level do monstro
  const adjustedItem = {
    ...item,
    level: Math.max(1, item.level! + Math.floor((monsterLevel - (item.level! || 1)) / 5))
  }
  
  return adjustedItem
}

/**
 * Gera uma mensagem de drop de loot
 */
export function generateLootMessage(item: Item, monsterName: string): string {
  const rarityEmoji: Record<ItemRarity, string> = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
  }
  
  return `${rarityEmoji[item.rarity]} Obteve: ${item.name}!`
}
