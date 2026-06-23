/**
 * Sistema de Reputação com 5 Fações
 * Afeta questões, inimigos, NPCs e recompensas
 */

import type { Player } from './types'

export type FactionType = 'ORDER' | 'CHAOS' | 'NATURE' | 'CIVILIZATION' | 'SHADOW'

export interface Reputation {
  faction: FactionType
  level: number // -100 a +100
  points: number // 0 a 1000 per level
  title: string
  color: string
}

export interface PlayerReputation {
  order: Reputation
  chaos: Reputation
  nature: Reputation
  civilization: Reputation
  shadow: Reputation
}

const FACTION_CONFIG: Record<FactionType, { name: string; color: string; description: string; enemies: string[] }> = {
  ORDER: {
    name: 'Ordem',
    color: '#4080ff',
    description: 'Guardiões da Lei e Justiça',
    enemies: ['chaos', 'shadow'],
  },
  CHAOS: {
    name: 'Caos',
    color: '#ff4040',
    description: 'Libertários do Absurdo',
    enemies: ['order'],
  },
  NATURE: {
    name: 'Natureza',
    color: '#40c080',
    description: 'Guardiões da Floresta',
    enemies: ['civilization'],
  },
  CIVILIZATION: {
    name: 'Civilização',
    color: '#c0a030',
    description: 'Construtores do Progresso',
    enemies: ['nature'],
  },
  SHADOW: {
    name: 'Sombra',
    color: '#8040c0',
    description: 'Mestres do Oculto',
    enemies: ['order'],
  },
}

const REPUTATION_TITLES: Record<number, string> = {
  [-100]: 'Arqui-inimigo',
  [-75]: 'Inimigo Jurado',
  [-50]: 'Inimigo Mortal',
  [-25]: 'Inimigo',
  [0]: 'Neutro',
  [25]: 'Conhecido',
  [50]: 'Aliado',
  [75]: 'Herói',
  [100]: 'Lenda',
}

export function createDefaultReputation(): PlayerReputation {
  return {
    order: { faction: 'ORDER', level: 0, points: 0, title: 'Neutro', color: '#4080ff' },
    chaos: { faction: 'CHAOS', level: 0, points: 0, title: 'Neutro', color: '#ff4040' },
    nature: { faction: 'NATURE', level: 0, points: 0, title: 'Neutro', color: '#40c080' },
    civilization: { faction: 'CIVILIZATION', level: 0, points: 0, title: 'Neutro', color: '#c0a030' },
    shadow: { faction: 'SHADOW', level: 0, points: 0, title: 'Neutro', color: '#8040c0' },
  }
}

/**
 * Adicione reputação com uma fação
 */
export function addReputation(
  rep: PlayerReputation,
  faction: FactionType,
  amount: number
): PlayerReputation {
  const current = rep[faction.toLowerCase() as Lowercase<FactionType>]
  
  if (!current) return rep

  const newPoints = Math.max(-1000, Math.min(1000, current.points + amount))
  const newLevel = Math.max(-100, Math.min(100, Math.floor(newPoints / 10)))

  const title = getReputationTitle(newLevel)

  const updatedRep = {
    ...rep,
    [faction.toLowerCase()]: {
      ...current,
      level: newLevel,
      points: newPoints,
      title,
    },
  }

  return updatedRep
}

/**
 * Obtenha título baseado no nível
 */
export function getReputationTitle(level: number): string {
  const closestLevel = Object.keys(REPUTATION_TITLES)
    .map(Number)
    .sort((a, b) => Math.abs(level - a) - Math.abs(level - b))[0]

  return REPUTATION_TITLES[closestLevel] || 'Neutro'
}

/**
 * Verifique se é inimigo de uma fação
 */
export function isEnemyOf(faction: FactionType, rep: PlayerReputation): boolean {
  const factionRep = rep[faction.toLowerCase() as Lowercase<FactionType>]
  return factionRep && factionRep.level < -50
}

/**
 * Verifique se é aliado de uma fação
 */
export function isAllyOf(faction: FactionType, rep: PlayerReputation): boolean {
  const factionRep = rep[faction.toLowerCase() as Lowercase<FactionType>]
  return factionRep && factionRep.level > 50
}

/**
 * Obtenha bônus de reputação (XP, drops, etc)
 */
export function getReputationBonus(faction: FactionType, rep: PlayerReputation): number {
  const factionRep = rep[faction.toLowerCase() as Lowercase<FactionType>]
  if (!factionRep) return 1

  const level = factionRep.level
  if (level <= -50) return 0.7 // Penalty
  if (level < 0) return 0.85
  if (level < 25) return 1.0
  if (level < 50) return 1.1
  if (level < 75) return 1.2
  return 1.3
}

/**
 * Obtenha inimigos baseado em reputação
 */
export function getHostileFactions(rep: PlayerReputation): FactionType[] {
  const hostile: FactionType[] = []

  for (const [faction, factionRep] of Object.entries(rep)) {
    if (factionRep.level < -50) {
      hostile.push(faction.toUpperCase() as FactionType)
    }
  }

  return hostile
}

/**
 * Formatando informações de reputação para UI
 */
export function formatReputationInfo(faction: FactionType, rep: Reputation): string {
  const config = FACTION_CONFIG[faction]
  const progressBar = createProgressBar(rep.level, 100, 20)
  
  return `
${config.name.toUpperCase()}
${progressBar} ${rep.level}/100
Nível: ${rep.title}
${config.description}
  `.trim()
}

function createProgressBar(current: number, max: number, length: number): string {
  const normalized = Math.max(0, Math.min(1, (current + max) / (max * 2)))
  const filled = Math.round(normalized * length)
  const empty = length - filled

  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`
}

/**
 * Obtenha cor de reputação para UI
 */
export function getReputationColor(level: number): string {
  if (level < -50) return '#cc2020' // Inimigo: Vermelho
  if (level < 0) return '#ffaa00' // Adversário: Laranja
  if (level < 50) return '#aaaaaa' // Neutro: Cinza
  if (level < 75) return '#40c080' // Aliado: Verde
  return '#4080ff' // Herói: Azul
}

/**
 * Sincronizar reputação com player stats
 */
export function applyReputationModifiers(player: Player, rep: PlayerReputation): Player {
  let xpMult = 1.0
  let dropMult = 1.0
  let dmgMult = 1.0

  // Bonificações cumulativas
  for (const faction of Object.values(rep)) {
    if (faction.level > 50) {
      xpMult *= 1.05 // 5% per ally faction
      dropMult *= 1.05
    }
  }

  // Penalidades por inimigos
  for (const faction of Object.values(rep)) {
    if (faction.level < -50) {
      xpMult *= 0.95 // -5% per enemy faction
      dmgMult *= 0.95
    }
  }

  // Aplicar (seria no engine.ts na prática)
  return player
}
