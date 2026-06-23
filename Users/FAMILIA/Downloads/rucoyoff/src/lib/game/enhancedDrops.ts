/**
 * Sistema aprimorado de drops de itens para monstros
 * Integra-se com o sistema existente de drops
 */

import type { Item, ItemRarity, MonsterType, Monster } from './types'

// Tabela de raridade por nível do inimigo - APRIMORADA
const ENHANCED_RARITY_CHANCES: Record<number, Record<ItemRarity, number>> = {
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

/**
 * Calcula a chance base de drop de item baseado no nível do inimigo
 * @param monsterLevel - Nível do monstro
 * @returns Número entre 0 e 1 representando a chance de drop
 */
export function calculateBaseDropChance(monsterLevel: number): number {
  // Chance base é 15% (0.15)
  // Aumenta 2% por nível acima de 1
  const baseChance = 0.15
  const levelBonus = (monsterLevel - 1) * 0.02
  const maxChance = 0.40 // Cap em 40%
  
  return Math.min(baseChance + levelBonus, maxChance)
}

/**
 * Calcula a chance de drop ajustada por tipo de elite
 */
export function getAdjustedDropChance(monster: Monster): number {
  let chance = calculateBaseDropChance(monster.level)
  
  // Boss/inimigos especiais têm 2x-3x de chance
  if (monster.elite === 'boss') {
    chance = Math.min(chance * 3, 0.8) // Max 80% para bosses
  } else if (monster.elite === 'champion') {
    chance = Math.min(chance * 2, 0.6) // Max 60% para champions
  }
  
  return chance
}

/**
 * Seleciona uma raridade aleatória baseada no nível do inimigo
 */
export function selectDropRarity(monsterLevel: number, isElite: boolean = false): ItemRarity {
  const clampedLevel = Math.min(Math.max(monsterLevel, 1), 40)
  const chances = ENHANCED_RARITY_CHANCES[clampedLevel] || ENHANCED_RARITY_CHANCES[40]
  
  let roll: Record<ItemRarity, number>
  
  if (isElite) {
    // Elites pulam raridades comuns
    roll = {
      common: chances.common * 0.3,
      uncommon: chances.uncommon * 1.5,
      rare: chances.rare * 1.5,
      epic: chances.epic * 2.0,
      legendary: chances.legendary * 3.0,
    }
    // Normalizar
    const sum = Object.values(roll).reduce((a, b) => a + b, 0)
    Object.keys(roll).forEach(k => {
      roll[k as ItemRarity] /= sum
    })
  } else {
    roll = chances
  }
  
  const random = Math.random()
  let cumulative = 0
  
  for (const [rarity, chance] of Object.entries(roll)) {
    cumulative += chance
    if (random <= cumulative) {
      return rarity as ItemRarity
    }
  }
  
  return 'common'
}

/**
 * Gera uma mensagem de drop formatada
 */
export function formatDropMessage(item: Item, monsterName: string): string {
  const rarityEmoji: Record<ItemRarity, string> = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '⭐',
  }
  
  const rarityColor: Record<ItemRarity, string> = {
    common: '#7a8aa0',
    uncommon: '#40c060',
    rare: '#4080ff',
    epic: '#c040ff',
    legendary: '#ffd040',
  }
  
  return `${rarityEmoji[item.rarity]} ${item.name}`
}

/**
 * Aumenta as stats do item baseado no nível do monstro
 */
export function enhanceItemStats(item: Item, monsterLevel: number): Item {
  const multiplier = 1 + (monsterLevel - 1) * 0.1
  
  return {
    ...item,
    level: Math.max(item.level || 1, monsterLevel - 2),
    stats: Object.fromEntries(
      Object.entries(item.stats || {}).map(([key, value]) => {
        if (typeof value === 'number') {
          return [key, Math.round(value * multiplier)]
        }
        return [key, value]
      })
    ) as any,
  }
}

/**
 * Valida se um item deve ser droppado (compatível com raridade e nível)
 */
export function isValidDropForMonster(item: Item, monster: Monster): boolean {
  // Itens comuns podem ser droppados por qualquer monstro
  if (item.rarity === 'common') return true
  
  // Itens incomuns requerem no mínimo nível 3
  if (item.rarity === 'uncommon' && monster.level < 3) return false
  
  // Itens raros requerem no mínimo nível 8
  if (item.rarity === 'rare' && monster.level < 8) return false
  
  // Itens épicos requerem no mínimo nível 15
  if (item.rarity === 'epic' && monster.level < 15) return false
  
  // Itens lendários requerem no mínimo nível 22 E um elite
  if (item.rarity === 'legendary' && (monster.level < 22 || monster.elite === 'normal')) return false
  
  return true
}
