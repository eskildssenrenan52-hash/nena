// @ts-nocheck
import type {
  CharacterClass,
  Player,
  PlayerPrestige,
  PrestigeRankInfo,
  CharacterStats,
} from './types'

// Nível necessário para o primeiro prestígio. Cada rank custa +10 do anterior.
export const PRESTIGE_BASE_LEVEL = 50
export const PRESTIGE_LEVEL_STEP = 10
export const PRESTIGE_MAX_RANK = 10

export function prestigeRequirement(currentRank: number): number {
  return PRESTIGE_BASE_LEVEL + currentRank * PRESTIGE_LEVEL_STEP
}

// ─── Nodes da árvore global de prestígio ─────────────────────────────────
export interface PrestigeNode {
  id: string
  name: string
  description: string
  icon: string
  maxRank: number
  cost: number
  // bônus por rank, aplicados como multiplicadores ao stat
  stat?: keyof CharacterStats
  multiplierPerRank?: number
  flatPerRank?: number
  // ou um flag especial
  flag?: string
  // bônus global (XP/gold/drop) por rank
  globalKind?: 'xp' | 'gold' | 'drop' | 'buildSlot'
  globalValuePerRank?: number
}

export const PRESTIGE_TREE: PrestigeNode[] = [
  // Linha 1 — Combate
  { id: 'eternal_might', name: 'Poder Eterno', icon: '⚔', maxRank: 5, cost: 1,
    description: '+5% Ataque por rank', stat: 'attack', multiplierPerRank: 0.05 },
  { id: 'eternal_focus', name: 'Foco Eterno', icon: '🎯', maxRank: 5, cost: 1,
    description: '+3% Crítico por rank', stat: 'critChance', flatPerRank: 0.03 },
  { id: 'eternal_fury', name: 'Fúria Eterna', icon: '💥', maxRank: 5, cost: 1,
    description: '+15% Dano Crítico por rank', stat: 'critDamage', flatPerRank: 15 },

  // Linha 2 — Vitalidade
  { id: 'eternal_vigor', name: 'Vigor Eterno', icon: '❤', maxRank: 5, cost: 1,
    description: '+8% HP máximo por rank', stat: 'maxHp', multiplierPerRank: 0.08 },
  { id: 'eternal_mana', name: 'Mana Eterna', icon: '💧', maxRank: 5, cost: 1,
    description: '+10% MP máximo por rank', stat: 'maxMp', multiplierPerRank: 0.10 },
  { id: 'eternal_aegis', name: 'Égide Eterna', icon: '🛡', maxRank: 5, cost: 1,
    description: '+6% Defesa por rank', stat: 'defense', multiplierPerRank: 0.06 },

  // Linha 3 — Magia & Mobilidade
  { id: 'eternal_magic', name: 'Magia Eterna', icon: '✦', maxRank: 5, cost: 1,
    description: '+8% Poder Mágico por rank', stat: 'magicPower', multiplierPerRank: 0.08 },
  { id: 'eternal_swift', name: 'Velocidade Eterna', icon: '💨', maxRank: 3, cost: 2,
    description: '+0.3 Velocidade por rank', stat: 'speed', flatPerRank: 0.3 },
  { id: 'eternal_reach', name: 'Alcance Eterno', icon: '➹', maxRank: 3, cost: 2,
    description: '+8% Alcance por rank', stat: 'range', multiplierPerRank: 0.08 },

  // Linha 4 — Bônus globais (mundo)
  { id: 'ascendant_xp', name: 'Ascensão XP', icon: '★', maxRank: 5, cost: 1,
    description: '+10% XP de todas fontes', globalKind: 'xp', globalValuePerRank: 0.10 },
  { id: 'ascendant_gold', name: 'Fortuna Ascendente', icon: '🪙', maxRank: 5, cost: 1,
    description: '+15% Gold de drops', globalKind: 'gold', globalValuePerRank: 0.15 },
  { id: 'ascendant_loot', name: 'Sorte Ascendente', icon: '🎁', maxRank: 5, cost: 1,
    description: '+12% Chance de drop', globalKind: 'drop', globalValuePerRank: 0.12 },

  // Linha 5 — Keystones
  { id: 'soul_anchor', name: 'Âncora da Alma', icon: '⚓', maxRank: 1, cost: 3,
    description: 'Mantém 50% do XP de classe ao prestigiar', flag: 'soul_anchor' },
  { id: 'second_wind', name: 'Segundo Fôlego', icon: '⟲', maxRank: 1, cost: 3,
    description: 'Ao morrer, ressuscita 1x por mapa com 30% HP', flag: 'second_wind' },
  { id: 'mythic_form', name: 'Forma Mítica', icon: '☼', maxRank: 1, cost: 5,
    description: 'Aura mítica permanente + título "Mítico"', flag: 'mythic_form' },
]

export function createPrestigeRank(cls: CharacterClass): PrestigeRankInfo {
  return {
    class: cls,
    rank: 0,
    totalPoints: 0,
    spent: {},
    unlockedTitles: [],
    unlockedAuras: [],
  }
}

const ALL_CLASSES: CharacterClass[] = [
  'knight', 'archer', 'mage', 'necromancer', 'paladin', 'berserker',
  'assassin', 'druid', 'monk', 'samurai', 'summoner', 'alchemist',
  'chronomancer', 'beastmaster',
]

export function createDefaultPrestige(): PlayerPrestige {
  const byClass = {} as Record<CharacterClass, PrestigeRankInfo>
  for (const c of ALL_CLASSES) byClass[c] = createPrestigeRank(c)
  return { global: 0, byClass }
}

export function canPrestige(player: Player): boolean {
  if (!player.prestige) return false
  const info = player.prestige.byClass[player.class]
  if (!info) return false
  if (info.rank >= PRESTIGE_MAX_RANK) return false
  return player.level >= prestigeRequirement(info.rank)
}

const PRESTIGE_TITLES = [
  'Iniciado', 'Ascendido', 'Glorioso', 'Iluminado', 'Lendário',
  'Mítico', 'Cósmico', 'Imortal', 'Transcendente', 'Eterno',
]
const PRESTIGE_AURAS = [
  'soft-glow', 'silver-spark', 'gold-ember', 'azure-tide', 'violet-storm',
  'jade-pulse', 'crimson-blaze', 'arctic-ring', 'void-halo', 'rainbow-prism',
]

/**
 * Executa o prestígio para a classe atual. Reseta nível, dá +1 rank e libera bônus.
 * Mantém XP global de classes e progresso de outras classes.
 */
export function performPrestige(player: Player): Player {
  if (!canPrestige(player)) return player
  const prestige = { ...player.prestige! }
  const info = { ...prestige.byClass[player.class] }
  info.rank += 1
  info.totalPoints += 3 + Math.floor(info.rank / 2) // 3,3,4,4,5,5,6,6,7,7
  info.unlockedTitles = [...info.unlockedTitles, PRESTIGE_TITLES[info.rank - 1]]
  info.unlockedAuras = [...info.unlockedAuras, PRESTIGE_AURAS[info.rank - 1]]
  prestige.byClass = { ...prestige.byClass, [player.class]: info }
  prestige.global = Object.values(prestige.byClass).reduce((s, r) => s + r.rank, 0)

  // Reset class progression
  const cp = { ...player.classProgress }
  const keepXp = info.spent['soul_anchor'] ? Math.floor(cp[player.class].xp * 0.5) : 0
  cp[player.class] = {
    ...cp[player.class],
    level: 1,
    xp: keepXp,
    xpToNext: 100,
  }

  return {
    ...player,
    prestige,
    classProgress: cp,
    level: 1,
    xp: keepXp,
    xpToNext: 100,
  }
}

export function investPrestigePoint(player: Player, nodeId: string): Player {
  if (!player.prestige) return player
  const info = { ...player.prestige.byClass[player.class] }
  const node = PRESTIGE_TREE.find(n => n.id === nodeId)
  if (!node) return player
  const current = info.spent[nodeId] ?? 0
  if (current >= node.maxRank) return player
  if (info.totalPoints < node.cost) return player
  info.spent = { ...info.spent, [nodeId]: current + 1 }
  info.totalPoints -= node.cost
  return {
    ...player,
    prestige: { ...player.prestige, byClass: { ...player.prestige.byClass, [player.class]: info } },
  }
}

export function resetPrestigePoints(player: Player): Player {
  if (!player.prestige) return player
  const info = { ...player.prestige.byClass[player.class] }
  let refund = 0
  for (const [id, ranks] of Object.entries(info.spent)) {
    const node = PRESTIGE_TREE.find(n => n.id === id)
    if (!node) continue
    refund += node.cost * (ranks as number)
  }
  info.spent = {}
  info.totalPoints += refund
  return {
    ...player,
    prestige: { ...player.prestige, byClass: { ...player.prestige.byClass, [player.class]: info } },
  }
}

/**
 * Aplica bônus de prestígio aos stats. Roda DEPOIS de recalcStats + applyPassivesToStats.
 */
export function applyPrestigeToStats(player: Player): Player {
  if (!player.prestige) return player
  const info = player.prestige.byClass[player.class]
  if (!info || info.rank === 0) return player
  const stats = { ...player.stats }

  // Bônus de rank passivo (sempre ativo, sem precisar gastar ponto)
  const rankBonus = info.rank * 0.03 // +3% em todos stats principais por rank
  stats.maxHp = Math.round(stats.maxHp * (1 + rankBonus))
  stats.maxMp = Math.round(stats.maxMp * (1 + rankBonus))
  stats.attack = Math.round(stats.attack * (1 + rankBonus))
  stats.defense = Math.round(stats.defense * (1 + rankBonus))
  stats.magicPower = Math.round(stats.magicPower * (1 + rankBonus))

  // Bônus dos nodes investidos
  for (const [id, ranks] of Object.entries(info.spent)) {
    const node = PRESTIGE_TREE.find(n => n.id === id)
    if (!node || !node.stat) continue
    const r = ranks as number
    if (node.multiplierPerRank) {
      stats[node.stat] = Math.round((stats[node.stat] as number) * (1 + node.multiplierPerRank * r))
    } else if (node.flatPerRank) {
      if (node.stat === 'critChance') {
        stats.critChance = Math.min(0.95, (stats.critChance as number) + node.flatPerRank * r)
      } else {
        stats[node.stat] = (stats[node.stat] as number) + node.flatPerRank * r
      }
    }
  }

  return { ...player, stats }
}

export function getXpMultiplier(player: Player): number {
  if (!player.prestige) return 1
  const info = player.prestige.byClass[player.class]
  if (!info) return 1
  let mult = 1
  for (const [id, ranks] of Object.entries(info.spent)) {
    const node = PRESTIGE_TREE.find(n => n.id === id)
    if (!node || node.globalKind !== 'xp') continue
    mult += (node.globalValuePerRank ?? 0) * (ranks as number)
  }
  return mult
}

export function getGoldMultiplier(player: Player): number {
  if (!player.prestige) return 1
  const info = player.prestige.byClass[player.class]
  if (!info) return 1
  let mult = 1
  for (const [id, ranks] of Object.entries(info.spent)) {
    const node = PRESTIGE_TREE.find(n => n.id === id)
    if (!node || node.globalKind !== 'gold') continue
    mult += (node.globalValuePerRank ?? 0) * (ranks as number)
  }
  return mult
}

export function getDropMultiplier(player: Player): number {
  if (!player.prestige) return 1
  const info = player.prestige.byClass[player.class]
  if (!info) return 1
  let mult = 1
  for (const [id, ranks] of Object.entries(info.spent)) {
    const node = PRESTIGE_TREE.find(n => n.id === id)
    if (!node || node.globalKind !== 'drop') continue
    mult += (node.globalValuePerRank ?? 0) * (ranks as number)
  }
  return mult
}

export function hasFlag(player: Player, flag: string): boolean {
  if (!player.prestige) return false
  const info = player.prestige.byClass[player.class]
  if (!info) return false
  for (const [id, ranks] of Object.entries(info.spent)) {
    const node = PRESTIGE_TREE.find(n => n.id === id)
    if (node?.flag === flag && (ranks as number) > 0) return true
  }
  return false
}

export function getActiveTitle(player: Player): string | null {
  if (!player.prestige) return null
  const info = player.prestige.byClass[player.class]
  if (!info || info.rank === 0) return null
  return PRESTIGE_TITLES[info.rank - 1]
}