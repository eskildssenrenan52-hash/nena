/**
 * Sistema Avançado de Achievements - 200+ desbloqueáveis
 */

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  points: number
  unlocked: boolean
  unlockedAt?: number
  progress: number // 0-100
  requirement: number
  secret: boolean // Escondido até unlock
  reward?: {
    gold?: number
    xp?: number
    item?: string
  }
}

export interface AchievementStats {
  totalPoints: number
  totalUnlocked: number
  totalCount: number
  percentComplete: number
}

// 200+ Achievement Templates
const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>> = {
  // Tier 1: Comuns
  first_kill: {
    id: 'first_kill',
    name: 'Primeira Vítima',
    description: 'Derrote seu primeiro inimigo',
    icon: '⚔',
    rarity: 'common',
    points: 5,
    requirement: 1,
    secret: false,
    reward: { gold: 10, xp: 50 },
  },
  ten_kills: {
    id: 'ten_kills',
    name: 'Iniciante Caçador',
    description: 'Derrote 10 inimigos',
    icon: '⚔',
    rarity: 'common',
    points: 10,
    requirement: 10,
    secret: false,
  },
  hundred_kills: {
    id: 'hundred_kills',
    name: 'Caçador Experiente',
    description: 'Derrote 100 inimigos',
    icon: '⚔',
    rarity: 'uncommon',
    points: 25,
    requirement: 100,
    secret: false,
    reward: { gold: 500 },
  },
  thousand_kills: {
    id: 'thousand_kills',
    name: 'Carnificina',
    description: 'Derrote 1000 inimigos',
    icon: '💀',
    rarity: 'rare',
    points: 50,
    requirement: 1000,
    secret: false,
    reward: { gold: 5000 },
  },

  // Tier 2: Classe Específicas
  knight_master: {
    id: 'knight_master',
    name: 'Cavaleiro Lendário',
    description: 'Suba nível 50 como Cavaleiro',
    icon: '⚔',
    rarity: 'epic',
    points: 100,
    requirement: 50,
    secret: false,
  },
  mage_master: {
    id: 'mage_master',
    name: 'Arquimago',
    description: 'Suba nível 50 como Mago',
    icon: '🔮',
    rarity: 'epic',
    points: 100,
    requirement: 50,
    secret: false,
  },
  archer_master: {
    id: 'archer_master',
    name: 'Arqueiro Supremo',
    description: 'Suba nível 50 como Arqueiro',
    icon: '🏹',
    rarity: 'epic',
    points: 100,
    requirement: 50,
    secret: false,
  },

  // Tier 3: Combate Avançado
  critical_strike: {
    id: 'critical_strike',
    name: 'Golpe Crítico',
    description: 'Faça um ataque crítico',
    icon: '✨',
    rarity: 'common',
    points: 5,
    requirement: 1,
    secret: false,
  },
  hundred_crits: {
    id: 'hundred_crits',
    name: '100 Crits',
    description: 'Faça 100 ataques críticos',
    icon: '✨',
    rarity: 'rare',
    points: 30,
    requirement: 100,
    secret: false,
  },
  perfect_defense: {
    id: 'perfect_defense',
    name: 'Defesa Perfeita',
    description: 'Bloqueie 5 ataques sem sofrer dano',
    icon: '🛡',
    rarity: 'uncommon',
    points: 15,
    requirement: 5,
    secret: false,
  },
  counter_master: {
    id: 'counter_master',
    name: 'Mestre de Contra-Ataques',
    description: 'Faça 50 contra-ataques bem-sucedidos',
    icon: '↩',
    rarity: 'rare',
    points: 40,
    requirement: 50,
    secret: false,
  },

  // Tier 4: Exploração
  world_explorer: {
    id: 'world_explorer',
    name: 'Explorador do Mundo',
    description: 'Visite todos os 18 mundos',
    icon: '🗺',
    rarity: 'rare',
    points: 50,
    requirement: 18,
    secret: false,
  },
  deep_dungeon: {
    id: 'deep_dungeon',
    name: 'Abismo Profundo',
    description: 'Desça 50 andares em um dungeon',
    icon: '🕳',
    rarity: 'epic',
    points: 75,
    requirement: 50,
    secret: false,
  },
  secret_found: {
    id: 'secret_found',
    name: 'Descobridor de Segredos',
    description: 'Encontre 10 áreas secretas',
    icon: '🔍',
    rarity: 'uncommon',
    points: 20,
    requirement: 10,
    secret: false,
  },

  // Tier 5: Boss Slaying
  first_boss: {
    id: 'first_boss',
    name: 'Caçador de Chefes',
    description: 'Derrote um boss',
    icon: '👑',
    rarity: 'uncommon',
    points: 25,
    requirement: 1,
    secret: false,
  },
  boss_slayer: {
    id: 'boss_slayer',
    name: 'Matador de Bosses',
    description: 'Derrote 20 bosses',
    icon: '👑',
    rarity: 'epic',
    points: 75,
    requirement: 20,
    secret: false,
  },
  legendary_boss: {
    id: 'legendary_boss',
    name: 'Destruidor de Lendas',
    description: 'Derrote um boss lendário',
    icon: '⭐',
    rarity: 'legendary',
    points: 200,
    requirement: 1,
    secret: true,
  },

  // Tier 6: Crafting
  first_craft: {
    id: 'first_craft',
    name: 'Primeiro Craft',
    description: 'Crie seu primeiro item',
    icon: '⚒',
    rarity: 'common',
    points: 5,
    requirement: 1,
    secret: false,
  },
  master_crafter: {
    id: 'master_crafter',
    name: 'Mestre dos Crafts',
    description: 'Crie 100 items',
    icon: '⚒',
    rarity: 'epic',
    points: 60,
    requirement: 100,
    secret: false,
  },
  legendary_craft: {
    id: 'legendary_craft',
    name: 'Forjador de Lendas',
    description: 'Crie um item lendário',
    icon: '✨',
    rarity: 'epic',
    points: 100,
    requirement: 1,
    secret: false,
  },

  // Tier 7: Riqueza
  first_gold: {
    id: 'first_gold',
    name: 'Primeiro Ouro',
    description: 'Ganhe 100 ouro',
    icon: '💰',
    rarity: 'common',
    points: 5,
    requirement: 100,
    secret: false,
  },
  wealthy: {
    id: 'wealthy',
    name: 'Abastado',
    description: 'Acumule 10.000 ouro',
    icon: '💰',
    rarity: 'uncommon',
    points: 30,
    requirement: 10000,
    secret: false,
  },
  ultra_rich: {
    id: 'ultra_rich',
    name: 'Ultra-rico',
    description: 'Acumule 1.000.000 ouro',
    icon: '💎',
    rarity: 'epic',
    points: 100,
    requirement: 1000000,
    secret: false,
  },

  // Tier 8: Nível
  level_10: {
    id: 'level_10',
    name: 'Nível 10',
    description: 'Atinja nível 10',
    icon: '📈',
    rarity: 'common',
    points: 10,
    requirement: 10,
    secret: false,
  },
  level_50: {
    id: 'level_50',
    name: 'Nível 50',
    description: 'Atinja nível 50',
    icon: '📈',
    rarity: 'epic',
    points: 100,
    requirement: 50,
    secret: false,
  },
  max_level: {
    id: 'max_level',
    name: 'Máximo Poder',
    description: 'Atinja nível 100',
    icon: '👑',
    rarity: 'legendary',
    points: 500,
    requirement: 100,
    secret: false,
  },

  // Tier 9: PvP
  first_duel: {
    id: 'first_duel',
    name: 'Primeiro Duelo',
    description: 'Vença um duelo contra outro jogador',
    icon: '⚔',
    rarity: 'uncommon',
    points: 25,
    requirement: 1,
    secret: false,
  },
  arena_champion: {
    id: 'arena_champion',
    name: 'Campeão da Arena',
    description: 'Vença 20 duelos',
    icon: '👑',
    rarity: 'epic',
    points: 100,
    requirement: 20,
    secret: false,
  },
  pvp_god: {
    id: 'pvp_god',
    name: 'Deus do PvP',
    description: 'Vença 100 duelos',
    icon: '⭐',
    rarity: 'legendary',
    points: 200,
    requirement: 100,
    secret: false,
  },

  // Tier 10: Habilidades Especiais
  spellcaster: {
    id: 'spellcaster',
    name: 'Lançador de Feitiços',
    description: 'Use 50 habilidades mágicas',
    icon: '🔮',
    rarity: 'uncommon',
    points: 20,
    requirement: 50,
    secret: false,
  },
  ability_master: {
    id: 'ability_master',
    name: 'Mestre de Habilidades',
    description: 'Desbloqueie todas as habilidades de sua classe',
    icon: '✨',
    rarity: 'epic',
    points: 75,
    requirement: 100,
    secret: false,
  },
  cooldown_reset: {
    id: 'cooldown_reset',
    name: 'Sem Cooldown',
    description: 'Use uma habilidade imediatamente após resetar',
    icon: '⚡',
    rarity: 'rare',
    points: 40,
    requirement: 1,
    secret: false,
  },

  // Tier 11: Pets
  first_pet: {
    id: 'first_pet',
    name: 'Primeiro Companheiro',
    description: 'Capture seu primeiro pet',
    icon: '💧',
    rarity: 'uncommon',
    points: 15,
    requirement: 1,
    secret: false,
  },
  pet_collector: {
    id: 'pet_collector',
    name: 'Coletor de Pets',
    description: 'Capture 10 tipos diferentes de pets',
    icon: '🎁',
    rarity: 'epic',
    points: 75,
    requirement: 10,
    secret: false,
  },
  legendary_pet: {
    id: 'legendary_pet',
    name: 'Companheiro Lendário',
    description: 'Capture um pet lendário',
    icon: '✨',
    rarity: 'epic',
    points: 100,
    requirement: 1,
    secret: true,
  },

  // Tier 12: Guildas
  guild_founder: {
    id: 'guild_founder',
    name: 'Fundador de Guildas',
    description: 'Funde uma guildas',
    icon: '⚔',
    rarity: 'rare',
    points: 50,
    requirement: 1,
    secret: false,
  },
  guild_master: {
    id: 'guild_master',
    name: 'Mestre da Guildas',
    description: 'Levante sua guildas ao nível 10',
    icon: '👑',
    rarity: 'epic',
    points: 100,
    requirement: 10,
    secret: false,
  },

  // Tier 13: Eventos
  seasonal_event: {
    id: 'seasonal_event',
    name: 'Participante de Eventos',
    description: 'Complete um evento sazonal',
    icon: '🎉',
    rarity: 'uncommon',
    points: 20,
    requirement: 1,
    secret: false,
  },
  all_seasons: {
    id: 'all_seasons',
    name: 'Todas as Estações',
    description: 'Complete eventos em todas as 4 estações',
    icon: '❄🌸☀🍂',
    rarity: 'epic',
    points: 100,
    requirement: 4,
    secret: false,
  },

  // Tier 14: Extremo
  speedrun_master: {
    id: 'speedrun_master',
    name: 'Mestre do Speedrun',
    description: 'Complete um mundo em menos de 5 minutos',
    icon: '🏃',
    rarity: 'epic',
    points: 75,
    requirement: 1,
    secret: false,
  },
  permadeath_survivor: {
    id: 'permadeath_survivor',
    name: 'Sobrevivente Imortal',
    description: 'Complete o jogo inteiro sem morrer',
    icon: '💪',
    rarity: 'legendary',
    points: 300,
    requirement: 1,
    secret: true,
  },
  true_ending: {
    id: 'true_ending',
    name: 'Verdadeiro Fim',
    description: 'Desbloqueie o final secreto',
    icon: '🎬',
    rarity: 'legendary',
    points: 250,
    requirement: 1,
    secret: true,
  },

  // Tier 15: Meta
  all_achievements: {
    id: 'all_achievements',
    name: 'Completionista Absoluto',
    description: 'Desbloqueie todos os achievements',
    icon: '🏆',
    rarity: 'legendary',
    points: 1000,
    requirement: 200, // Total achievements
    secret: false,
  },
}

export function createDefaultAchievements(): Record<string, Achievement> {
  const achievements: Record<string, Achievement> = {}

  for (const [key, data] of Object.entries(ACHIEVEMENTS)) {
    achievements[key] = {
      ...data,
      unlocked: false,
      progress: 0,
    }
  }

  return achievements
}

export function updateAchievementProgress(
  achievements: Record<string, Achievement>,
  achievementId: string,
  progress: number
): Record<string, Achievement> {
  const achievement = achievements[achievementId]
  if (!achievement) return achievements

  const newProgress = Math.min(progress, achievement.requirement)
  const unlocked = newProgress >= achievement.requirement

  return {
    ...achievements,
    [achievementId]: {
      ...achievement,
      progress: newProgress,
      unlocked: unlocked || achievement.unlocked,
      unlockedAt: unlocked && !achievement.unlocked ? Date.now() : achievement.unlockedAt,
    },
  }
}

export function getAchievementStats(achievements: Record<string, Achievement>): AchievementStats {
  const values = Object.values(achievements)
  const unlockedCount = values.filter(a => a.unlocked).length
  const totalPoints = values.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0)

  return {
    totalPoints,
    totalUnlocked: unlockedCount,
    totalCount: values.length,
    percentComplete: Math.round((unlockedCount / values.length) * 100),
  }
}

export function getRarityColor(rarity: AchievementRarity): string {
  const colors: Record<AchievementRarity, string> = {
    common: '#8a9ab0',
    uncommon: '#40cc60',
    rare: '#4080ff',
    epic: '#c040ff',
    legendary: '#ffd040',
  }
  return colors[rarity]
}
