/**
 * Sistema de Masteries - Especializações de combate
 * Cada player pode ter múltiplas masteries, mas apenas 1 ativa
 */

import type { CharacterStats } from './types'

export type MasteryType = 
  | 'SWORD' | 'AXE' | 'SPEAR' 
  | 'DAGGER' | 'BOW' | 'STAFF'
  | 'SHIELD' | 'BARE_HANDS'
  | 'FIRE' | 'ICE' | 'LIGHTNING'
  | 'DEFENSE' | 'VITALITY' | 'SHADOW' | 'LIGHT'

export interface MasteryNode {
  id: string
  name: string
  description: string
  icon: string
  level: number // 1-10
  xp: number // 0 to xpToNext
  xpToNext: number
  stats: Partial<CharacterStats>
  passive: string // Description of passive
  color: string
}

export interface Mastery {
  type: MasteryType
  level: number // 1-100
  xp: number
  nodes: Record<string, MasteryNode>
  totalLevel: number // Sum of all node levels
}

export interface PlayerMasteries {
  active: MasteryType
  masteries: Record<MasteryType, Mastery>
}

// Configuração das masteries
const MASTERY_TREES: Record<MasteryType, { 
  name: string; 
  color: string; 
  icon: string;
  baseStats: Partial<CharacterStats> 
}> = {
  SWORD: {
    name: 'Mestria da Espada',
    color: '#c0c0c0',
    icon: '⚔',
    baseStats: { attack: 5, critChance: 0.05 },
  },
  AXE: {
    name: 'Mestria do Machado',
    color: '#cc8040',
    icon: '🪓',
    baseStats: { attack: 8, defense: -2 },
  },
  SPEAR: {
    name: 'Mestria da Lança',
    color: '#d0d080',
    icon: '⚡',
    baseStats: { attack: 4, range: 20 },
  },
  DAGGER: {
    name: 'Mestria da Adaga',
    color: '#8040c0',
    icon: '🗡',
    baseStats: { attack: 3, speed: 0.5, critChance: 0.1 },
  },
  BOW: {
    name: 'Mestria do Arco',
    color: '#40a080',
    icon: '🏹',
    baseStats: { attack: 4, range: 40, speed: 0.2 },
  },
  STAFF: {
    name: 'Mestria do Bastão',
    color: '#4080ff',
    icon: '🔱',
    baseStats: { magicPower: 8, attack: 1 },
  },
  SHIELD: {
    name: 'Mestria do Escudo',
    color: '#ffd080',
    icon: '🛡',
    baseStats: { defense: 6, maxHp: 10 },
  },
  BARE_HANDS: {
    name: 'Mestria Marcial',
    color: '#ff6040',
    icon: '👊',
    baseStats: { attack: 3, speed: 1, defense: 1 },
  },
  FIRE: {
    name: 'Mestria de Fogo',
    color: '#ff4020',
    icon: '🔥',
    baseStats: { magicPower: 5, attack: 2 },
  },
  ICE: {
    name: 'Mestria de Gelo',
    color: '#40d0ff',
    icon: '❄',
    baseStats: { magicPower: 5, defense: 2 },
  },
  LIGHTNING: {
    name: 'Mestria de Raio',
    color: '#ffff40',
    icon: '⚡',
    baseStats: { magicPower: 6, speed: 1 },
  },
  DEFENSE: {
    name: 'Mestria de Defesa',
    color: '#80ff80',
    icon: '🛡',
    baseStats: { defense: 8 },
  },
  VITALITY: {
    name: 'Mestria de Vitalidade',
    color: '#ff80c0',
    icon: '❤',
    baseStats: { maxHp: 20 },
  },
  SHADOW: {
    name: 'Mestria de Sombra',
    color: '#404040',
    icon: '👤',
    baseStats: { speed: 1, critChance: 0.1 },
  },
  LIGHT: {
    name: 'Mestria de Luz',
    color: '#ffff80',
    icon: '✨',
    baseStats: { magicPower: 3, defense: 3 },
  },
}

// Nodes de cada mastery
const MASTERY_NODES: Record<MasteryType, Record<string, Omit<MasteryNode, 'xp' | 'xpToNext'>>> = {
  SWORD: {
    slash: {
      id: 'slash',
      name: 'Golpe Vertical',
      description: '+10% dano de espada',
      icon: '⚔',
      level: 0,
      stats: { attack: 2 },
      passive: 'Dano base aumentado',
      color: '#c0c0c0',
    },
    riposte: {
      id: 'riposte',
      name: 'Riposte',
      description: 'Contra-ataque após bloquear',
      icon: '↩',
      level: 0,
      stats: { attack: 1 },
      passive: 'Chance de contra-ataque',
      color: '#ffc0c0',
    },
    cleave: {
      id: 'cleave',
      name: 'Cisão',
      description: 'Golpe que atinge múltiplos inimigos',
      icon: '⚔',
      level: 0,
      stats: { attack: 3 },
      passive: 'AoE automático',
      color: '#ffffff',
    },
  },
  AXE: {
    cleave: {
      id: 'cleave',
      name: 'Cisão Pesada',
      description: '+20% dano de machado',
      icon: '🪓',
      level: 0,
      stats: { attack: 4 },
      passive: 'Dano massivo',
      color: '#ff6020',
    },
    whirlwind: {
      id: 'whirlwind',
      name: 'Redemoinhos',
      description: 'Gire para atingir tudo ao redor',
      icon: '🌪',
      level: 0,
      stats: { attack: 2 },
      passive: 'AoE 360°',
      color: '#cc8040',
    },
    execute: {
      id: 'execute',
      name: 'Execução',
      description: 'Golpe final que ignora defesa',
      icon: '💥',
      level: 0,
      stats: { attack: 5 },
      passive: 'Ignore defesa parcial',
      color: '#8a0000',
    },
  },
  SPEAR: {
    thrust: {
      id: 'thrust',
      name: 'Estocada Rápida',
      description: '+15% velocidade de ataque',
      icon: '→',
      level: 0,
      stats: { speed: 0.3 },
      passive: 'Ataque mais rápido',
      color: '#d0d080',
    },
    reach: {
      id: 'reach',
      name: 'Alcance Aumentado',
      description: '+30% alcance de lança',
      icon: '📏',
      level: 0,
      stats: { range: 15 },
      passive: 'Alcance maior',
      color: '#ffff80',
    },
    pierce: {
      id: 'pierce',
      name: 'Perfuração',
      description: 'Ataque que atravessa inimigos',
      icon: '⚡',
      level: 0,
      stats: { attack: 2 },
      passive: 'Penetra defesa',
      color: '#ffaa00',
    },
  },
  DAGGER: {
    ambush: {
      id: 'ambush',
      name: 'Emboscada',
      description: '+50% dano crítico com adaga',
      icon: '🗡',
      level: 0,
      stats: { critChance: 0.1 },
      passive: 'Crits aumentados',
      color: '#8040c0',
    },
    evasion: {
      id: 'evasion',
      name: 'Evasão',
      description: '+20% dodge',
      icon: '🚀',
      level: 0,
      stats: { speed: 0.5 },
      passive: 'Desvie ataques',
      color: '#40c0ff',
    },
    poison: {
      id: 'poison',
      name: 'Veneno',
      description: 'Ataques envenenam inimigos',
      icon: '☠',
      level: 0,
      stats: {},
      passive: 'Veneno no ataque',
      color: '#40a040',
    },
  },
  BOW: {
    precision: {
      id: 'precision',
      name: 'Precisão',
      description: '+25% dano de arco',
      icon: '🎯',
      level: 0,
      stats: { attack: 3, critChance: 0.05 },
      passive: 'Dano aumentado',
      color: '#40a080',
    },
    multishot: {
      id: 'multishot',
      name: 'Disparo Múltiplo',
      description: '3 flechas por tiro',
      icon: '🏹',
      level: 0,
      stats: { attack: 1 },
      passive: 'Multiplo ataque',
      color: '#80ff40',
    },
    ricochet: {
      id: 'ricochet',
      name: 'Ricochete',
      description: 'Flechas ricocheteiam',
      icon: '⚡',
      level: 0,
      stats: {},
      passive: 'Ataque em área',
      color: '#ffff80',
    },
  },
  STAFF: {
    fireball: {
      id: 'fireball',
      name: 'Bola de Fogo',
      description: '+30% dano de fogo',
      icon: '🔥',
      level: 0,
      stats: { magicPower: 3 },
      passive: 'Fogo aumentado',
      color: '#ff4020',
    },
    mana_shield: {
      id: 'mana_shield',
      name: 'Escudo de Mana',
      description: 'Converta mana em absorção',
      icon: '🛡',
      level: 0,
      stats: { maxMp: 10 },
      passive: 'Proteção mágica',
      color: '#4080ff',
    },
    spell_chain: {
      id: 'spell_chain',
      name: 'Corrente de Magia',
      description: 'Magias se encadeiam',
      icon: '⛓',
      level: 0,
      stats: { magicPower: 2 },
      passive: 'Magias interconectam',
      color: '#c080ff',
    },
  },
  SHIELD: {
    block: {
      id: 'block',
      name: 'Bloqueio',
      description: '+30% bloqueio',
      icon: '🛡',
      level: 0,
      stats: { defense: 3 },
      passive: 'Defesa aumentada',
      color: '#ffd080',
    },
    retaliation: {
      id: 'retaliation',
      name: 'Retaliação',
      description: 'Contra-ataque ao bloquear',
      icon: '⚔',
      level: 0,
      stats: { attack: 1 },
      passive: 'Dano ao bloquear',
      color: '#ff8040',
    },
    shield_bash: {
      id: 'shield_bash',
      name: 'Golpe de Escudo',
      description: 'Atordoe inimigos',
      icon: '💥',
      level: 0,
      stats: {},
      passive: 'Imobiliza',
      color: '#ffff40',
    },
  },
  BARE_HANDS: {
    punch: {
      id: 'punch',
      name: 'Soco Potente',
      description: '+40% dano de mão',
      icon: '👊',
      level: 0,
      stats: { attack: 4 },
      passive: 'Dano aumentado',
      color: '#ff6040',
    },
    kick: {
      id: 'kick',
      name: 'Chute',
      description: 'Afaste inimigos',
      icon: '🦵',
      level: 0,
      stats: { speed: 0.3 },
      passive: 'Knockback',
      color: '#ff8060',
    },
    mastery: {
      id: 'mastery',
      name: 'Domínio Marcial',
      description: 'Desbloqueia combos',
      icon: '✨',
      level: 0,
      stats: { attack: 2 },
      passive: 'Combos automáticos',
      color: '#ffaa40',
    },
  },
  FIRE: {
    burn: {
      id: 'burn',
      name: 'Queimadura',
      description: 'Ataques deixam fogo',
      icon: '🔥',
      level: 0,
      stats: { magicPower: 3 },
      passive: 'DOT contínuo',
      color: '#ff4020',
    },
    heat_wave: {
      id: 'heat_wave',
      name: 'Onda de Calor',
      description: 'AoE de fogo',
      icon: '🌊',
      level: 0,
      stats: { magicPower: 2 },
      passive: 'Fogo em área',
      color: '#ff6020',
    },
    melt: {
      id: 'melt',
      name: 'Derreter',
      description: 'Ignore armadura com fogo',
      icon: '💧',
      level: 0,
      stats: {},
      passive: 'Ignore defesa',
      color: '#ff8080',
    },
  },
  ICE: {
    freeze: {
      id: 'freeze',
      name: 'Congelamento',
      description: 'Imobiliza inimigos',
      icon: '❄',
      level: 0,
      stats: { magicPower: 2 },
      passive: 'Imobiliza',
      color: '#40d0ff',
    },
    chill: {
      id: 'chill',
      name: 'Desaceleração',
      description: 'Inimigos se movem lentamente',
      icon: '🧊',
      level: 0,
      stats: { magicPower: 2 },
      passive: 'Reduz velocidade',
      color: '#80e0ff',
    },
    shatter: {
      id: 'shatter',
      name: 'Estilhaço',
      description: 'Quebre gelo para AoE',
      icon: '💥',
      level: 0,
      stats: { magicPower: 3 },
      passive: 'Explosão',
      color: '#40ffff',
    },
  },
  LIGHTNING: {
    shock: {
      id: 'shock',
      name: 'Choque',
      description: 'Atordoe e cause dano',
      icon: '⚡',
      level: 0,
      stats: { magicPower: 3 },
      passive: 'Atordoa',
      color: '#ffff40',
    },
    chain: {
      id: 'chain',
      name: 'Corrente de Raio',
      description: 'Raio salta entre inimigos',
      icon: '⛓',
      level: 0,
      stats: { magicPower: 2 },
      passive: 'Salta',
      color: '#ffff80',
    },
    surge: {
      id: 'surge',
      name: 'Surto',
      description: '+30% velocidade durante raio',
      icon: '💫',
      level: 0,
      stats: { speed: 1 },
      passive: 'Speed boost',
      color: '#ffff00',
    },
  },
  DEFENSE: {
    fortitude: {
      id: 'fortitude',
      name: 'Fortaleza',
      description: '+50% defesa',
      icon: '💪',
      level: 0,
      stats: { defense: 5 },
      passive: 'Defesa aumentada',
      color: '#80ff80',
    },
    resist: {
      id: 'resist',
      name: 'Resistência Elemental',
      description: 'Resista magia',
      icon: '🛡',
      level: 0,
      stats: { defense: 2 },
      passive: 'Resistência',
      color: '#40ff40',
    },
    counter: {
      id: 'counter',
      name: 'Contra-Ataque Perfeito',
      description: 'Contra-ataque automático',
      icon: '⚔',
      level: 0,
      stats: { defense: 1 },
      passive: 'Counter automático',
      color: '#ff8080',
    },
  },
  VITALITY: {
    health_boost: {
      id: 'health_boost',
      name: 'Aumento de Vida',
      description: '+50% HP',
      icon: '❤',
      level: 0,
      stats: { maxHp: 10 },
      passive: 'HP aumentado',
      color: '#ff80c0',
    },
    regeneration: {
      id: 'regeneration',
      name: 'Regeneração',
      description: 'Cure automaticamente',
      icon: '🌿',
      level: 0,
      stats: { maxHp: 5 },
      passive: 'Cura contínua',
      color: '#40ff80',
    },
    endurance: {
      id: 'endurance',
      name: 'Resistência',
      description: 'Resista DOT',
      icon: '🛡',
      level: 0,
      stats: { maxHp: 5 },
      passive: 'Menos DOT',
      color: '#ff40a0',
    },
  },
  SHADOW: {
    stealth: {
      id: 'stealth',
      name: 'Furtividade',
      description: 'Fique invisível brevemente',
      icon: '👤',
      level: 0,
      stats: { speed: 1 },
      passive: 'Invisibilidade',
      color: '#202020',
    },
    shadow_clone: {
      id: 'shadow_clone',
      name: 'Clone de Sombra',
      description: 'Crie cópias suas',
      icon: '👥',
      level: 0,
      stats: { attack: 1 },
      passive: 'Clones',
      color: '#404040',
    },
    assassination: {
      id: 'assassination',
      name: 'Assassinato',
      description: 'Ataque furtivo aumentado',
      icon: '🗡',
      level: 0,
      stats: { critChance: 0.2 },
      passive: 'Dano crítico',
      color: '#8040c0',
    },
  },
  LIGHT: {
    holy_strike: {
      id: 'holy_strike',
      name: 'Golpe Sagrado',
      description: 'Ataque divino',
      icon: '✨',
      level: 0,
      stats: { magicPower: 2, attack: 1 },
      passive: 'Dano sagrado',
      color: '#ffff80',
    },
    healing: {
      id: 'healing',
      name: 'Cura Sagrada',
      description: 'Cure aliados',
      icon: '✨',
      level: 0,
      stats: { maxHp: 5 },
      passive: 'Cura',
      color: '#ffff40',
    },
    protection: {
      id: 'protection',
      name: 'Proteção Divina',
      description: 'Proteja aliados',
      icon: '🛡',
      level: 0,
      stats: { defense: 2 },
      passive: 'Defesa de grupo',
      color: '#ffffc0',
    },
  },
}

export function createDefaultMasteries(): PlayerMasteries {
  const masteries: Record<MasteryType, Mastery> = {} as any

  for (const type of Object.keys(MASTERY_TREES) as MasteryType[]) {
    const nodes: Record<string, MasteryNode> = {}
    const typeNodes = MASTERY_NODES[type]

    for (const [nodeId, nodeData] of Object.entries(typeNodes)) {
      nodes[nodeId] = {
        ...nodeData,
        xp: 0,
        xpToNext: 100,
      }
    }

    masteries[type] = {
      type,
      level: 0,
      xp: 0,
      nodes,
      totalLevel: 0,
    }
  }

  return {
    active: 'SWORD',
    masteries,
  }
}

export function upgradeMasteryNode(
  masteries: PlayerMasteries,
  masteryType: MasteryType,
  nodeId: string
): PlayerMasteries {
  const mastery = masteries.masteries[masteryType]
  const node = mastery.nodes[nodeId]

  if (!node || node.level >= 10) return masteries

  return {
    ...masteries,
    masteries: {
      ...masteries.masteries,
      [masteryType]: {
        ...mastery,
        nodes: {
          ...mastery.nodes,
          [nodeId]: {
            ...node,
            level: node.level + 1,
            xp: 0,
            xpToNext: Math.round(node.xpToNext * 1.2),
          },
        },
        totalLevel: mastery.totalLevel + 1,
      },
    },
  }
}

export function getMasteryStats(masteries: PlayerMasteries): Partial<CharacterStats> {
  const active = masteries.masteries[masteries.active]
  const baseStats = MASTERY_TREES[masteries.active].baseStats
  const stats = { ...baseStats } as Partial<CharacterStats>

  for (const node of Object.values(active.nodes)) {
    for (const [key, value] of Object.entries(node.stats)) {
      stats[key as keyof CharacterStats] = (stats[key as keyof CharacterStats] || 0) + (value as number) * node.level
    }
  }

  return stats
}
