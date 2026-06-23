import type { Player } from './types'
import { uid } from './utils'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  condition: (stats: PlayerStats) => boolean
  rewardGold: number
}

interface PlayerStats {
  totalKills: number
  totalGold: number
  totalDamage: number
  highestLevel: number
  highestCombo: number
  bossesKilled: number
  classesPlayed: number
  mapsVisited: number
  deaths: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', title: 'Primeiro Sangue', description: 'Derrote seu primeiro inimigo.', icon: '🩸', tier: 'bronze', condition: s => s.totalKills >= 1, rewardGold: 25 },
  { id: 'k10', title: 'Guerreiro', description: 'Derrote 10 inimigos.', icon: '⚔', tier: 'bronze', condition: s => s.totalKills >= 10, rewardGold: 50 },
  { id: 'k100', title: 'Carniceiro', description: 'Derrote 100 inimigos.', icon: '🗡', tier: 'silver', condition: s => s.totalKills >= 100, rewardGold: 200 },
  { id: 'k1000', title: 'Deus da Guerra', description: 'Derrote 1000 inimigos.', icon: '👑', tier: 'gold', condition: s => s.totalKills >= 1000, rewardGold: 1000 },
  { id: 'rich', title: 'Rico', description: 'Acumule 1000 de ouro.', icon: '💰', tier: 'silver', condition: s => s.totalGold >= 1000, rewardGold: 300 },
  { id: 'millionaire', title: 'Milionario', description: 'Acumule 10000 de ouro.', icon: '💎', tier: 'gold', condition: s => s.totalGold >= 10000, rewardGold: 1500 },
  { id: 'lvl5', title: 'Aprendiz', description: 'Alcance o nivel 5.', icon: '⭐', tier: 'bronze', condition: s => s.highestLevel >= 5, rewardGold: 75 },
  { id: 'lvl20', title: 'Mestre', description: 'Alcance o nivel 20.', icon: '🔮', tier: 'silver', condition: s => s.highestLevel >= 20, rewardGold: 400 },
  { id: 'lvl50', title: 'Lenda', description: 'Alcance o nivel 50.', icon: '👑', tier: 'gold', condition: s => s.highestLevel >= 50, rewardGold: 2000 },
  { id: 'combo10', title: 'Combo Master', description: 'Alcance um combo de 10 hits.', icon: '🔥', tier: 'silver', condition: s => s.highestCombo >= 10, rewardGold: 200 },
  { id: 'combo25', title: 'Combo God', description: 'Alcance um combo de 25 hits.', icon: '⚡', tier: 'gold', condition: s => s.highestCombo >= 25, rewardGold: 1000 },
  { id: 'boss1', title: 'Cacador de Chefes', description: 'Derrote um Chefe.', icon: '👹', tier: 'silver', condition: s => s.bossesKilled >= 1, rewardGold: 500 },
  { id: 'boss10', title: 'Exterminador', description: 'Derrote 10 Chefes.', icon: '💀', tier: 'gold', condition: s => s.bossesKilled >= 10, rewardGold: 2000 },
  { id: 'all_classes', title: 'Polivalente', description: 'Jogue com todas as 4 classes.', icon: '🎭', tier: 'silver', condition: s => s.classesPlayed >= 4, rewardGold: 300 },
  { id: 'explorer', title: 'Explorador', description: 'Visite 5 mapas diferentes.', icon: '🗺', tier: 'bronze', condition: s => s.mapsVisited >= 5, rewardGold: 150 },
  { id: 'survivor', title: 'Sobrevivente', description: 'Morra 10 vezes (e continue tentando!).', icon: '😵', tier: 'bronze', condition: s => s.deaths >= 10, rewardGold: 100 },
  { id: 'damage_dealer', title: 'Destruidor', description: 'Cause 10000 de dano total.', icon: '💥', tier: 'silver', condition: s => s.totalDamage >= 10000, rewardGold: 250 },
  { id: 'mega_damage', title: 'Força Devastadora', description: 'Cause 100000 de dano total.', icon: '🌋', tier: 'gold', condition: s => s.totalDamage >= 100000, rewardGold: 1500 },
  { id: 'k500', title: 'Ceifador', description: 'Derrote 500 inimigos.', icon: '⚔', tier: 'gold', condition: s => s.totalKills >= 500, rewardGold: 2000 },
  { id: 'lvl30', title: 'Veterano', description: 'Alcance o nível 30.', icon: '🛡', tier: 'gold', condition: s => s.highestLevel >= 30, rewardGold: 800 },
  { id: 'lvl100', title: 'Ascendido', description: 'Alcance o nível 100.', icon: '🌟', tier: 'diamond', condition: s => s.highestLevel >= 100, rewardGold: 10000 },
  { id: 'boss5', title: 'Caçador de Chefes', description: 'Derrote 5 Chefes.', icon: '🏆', tier: 'gold', condition: s => s.bossesKilled >= 5, rewardGold: 2500 },
  { id: 'rich3', title: 'Barão', description: 'Acumule 50000 de ouro.', icon: '👑', tier: 'gold', condition: s => s.totalGold >= 50000, rewardGold: 3000 },
  { id: 'combo50', title: 'Frenético', description: 'Alcance um combo de 50 hits.', icon: '🌀', tier: 'diamond', condition: s => s.highestCombo >= 50, rewardGold: 5000 },
  { id: 'all_maps', title: 'Cartógrafo', description: 'Visite todos os 9 biomas.', icon: '🗺', tier: 'gold', condition: s => s.mapsVisited >= 9, rewardGold: 1200 },
  { id: 'no_deaths', title: 'Imortal', description: 'Alcance o nível 20 sem morrer.', icon: '🔮', tier: 'platinum', condition: s => s.highestLevel >= 20 && s.deaths === 0, rewardGold: 5000 },
  { id: 'pacifist', title: 'Pacifista', description: 'Morra 50 vezes.', icon: '🕊', tier: 'bronze', condition: s => s.deaths >= 50, rewardGold: 50 },
]

export const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  diamond: '#b9f2ff',
}

export function checkAchievements(player: Player, stats: PlayerStats): { unlocked: Achievement[]; newPlayer: Player } {
  const unlockedIds: string[] = player._achievements ?? []
  const newUnlocked: Achievement[] = []
  let totalGold = 0

  for (const ach of ACHIEVEMENTS) {
    if (!unlockedIds.includes(ach.id) && ach.condition(stats)) {
      unlockedIds.push(ach.id)
      newUnlocked.push(ach)
      totalGold += ach.rewardGold
    }
  }

  return {
    unlocked: newUnlocked,
    newPlayer: {
      ...player,
      gold: player.gold + totalGold,
      _achievements: unlockedIds,
    },
  }
}
