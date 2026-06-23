import type { Player, GameState } from './types'
import { uid } from './utils'
import { calculateXpToNext } from './data'

export interface Quest {
  id: string
  title: string
  description: string
  type: 'kill' | 'collect' | 'reach_level' | 'explore' | 'boss'
  target: string
  targetCount: number
  currentCount: number
  completed: boolean
  rewardGold: number
  rewardXp: number
  rewardItemId?: string
  location?: string
}

export const QUESTS: Quest[] = [
  { id: 'starter_kill', title: 'Primeiro Sangue', description: 'Derrote 5 Slimes na Floresta.', type: 'kill', target: 'slime', targetCount: 5, currentCount: 0, completed: false, rewardGold: 50, rewardXp: 100, location: 'forest' },
  { id: 'starter_wolf', title: 'Caçador de Lobos', description: 'Derrote 3 Lobos.', type: 'kill', target: 'wolf', targetCount: 3, currentCount: 0, completed: false, rewardGold: 80, rewardXp: 150, location: 'forest' },
  { id: 'reach_level_5', title: 'Aprendiz', description: 'Alcance o nível 5.', type: 'reach_level', target: 'level', targetCount: 5, currentCount: 0, completed: false, rewardGold: 100, rewardXp: 200 },
  { id: 'dungeon_explore', title: 'Explorador das Trevas', description: 'Entre na Masmorra e derrote 5 Esqueletos.', type: 'kill', target: 'skeleton', targetCount: 5, currentCount: 0, completed: false, rewardGold: 120, rewardXp: 250, location: 'dungeon' },
  { id: 'desert_orc', title: 'Caçador de Orcs', description: 'Derrote 10 Orcs no Deserto.', type: 'kill', target: 'orc', targetCount: 10, currentCount: 0, completed: false, rewardGold: 200, rewardXp: 400, location: 'desert' },
  { id: 'collect_potions', title: 'Alquimista', description: 'Colete 10 Poções de Cura.', type: 'collect', target: 'potion', targetCount: 10, currentCount: 0, completed: false, rewardGold: 150, rewardXp: 300 },
  { id: 'swamp_boss', title: 'O Pântano Amaldiçoado', description: 'Derrote o Dragão Chefe no Pântano.', type: 'boss', target: 'dragon', targetCount: 1, currentCount: 0, completed: false, rewardGold: 500, rewardXp: 1000, location: 'swamp' },
  { id: 'volcano_boss', title: 'Vulcão Infernal', description: 'Derrote o Dragão Ancestral no Vulcão.', type: 'boss', target: 'dragon', targetCount: 1, currentCount: 0, completed: false, rewardGold: 1000, rewardXp: 2000, location: 'volcano' },
  // Deep Forest quests
  { id: 'deepforest_wolves', title: 'Caçador da Floresta', description: 'Derrote 10 Lobos na Floresta Antiga.', type: 'kill', target: 'wolf', targetCount: 10, currentCount: 0, completed: false, rewardGold: 160, rewardXp: 300, location: 'deepforest' },
  { id: 'treant_slayer', title: 'Cortador de Treantes', description: 'Derrote 8 Treantes na Floresta Antiga.', type: 'kill', target: 'treant', targetCount: 8, currentCount: 0, completed: false, rewardGold: 250, rewardXp: 500, location: 'deepforest' },
  { id: 'deepforest_boss', title: 'O Ancião Desperto', description: 'Derrote o Treante Chefe na Floresta Antiga.', type: 'boss', target: 'treant', targetCount: 1, currentCount: 0, completed: false, rewardGold: 600, rewardXp: 1200, location: 'deepforest' },
  // Abyss quests
  { id: 'ghost_hunter', title: 'Caçador de Espíritos', description: 'Derrote 15 Fantasmas no Abismo Eterno.', type: 'kill', target: 'ghost', targetCount: 15, currentCount: 0, completed: false, rewardGold: 320, rewardXp: 600, location: 'abyss' },
  { id: 'vampire_slayer', title: 'Caçador de Vampiros', description: 'Derrote 10 Vampiros no Abismo.', type: 'kill', target: 'vampire', targetCount: 10, currentCount: 0, completed: false, rewardGold: 450, rewardXp: 900, location: 'abyss' },
  { id: 'abyss_demon_boss', title: 'Senhor do Abismo', description: 'Derrote o Demônio Boss no Abismo Eterno.', type: 'boss', target: 'demon', targetCount: 1, currentCount: 0, completed: false, rewardGold: 1500, rewardXp: 3000, location: 'abyss' },
  // General progression
  { id: 'k50_all', title: 'Guerreiro Experiente', description: 'Derrote 50 inimigos no total.', type: 'kill', target: '*', targetCount: 50, currentCount: 0, completed: false, rewardGold: 200, rewardXp: 400 },
  { id: 'k250_all', title: 'Exterminador', description: 'Derrote 250 inimigos no total.', type: 'kill', target: '*', targetCount: 250, currentCount: 0, completed: false, rewardGold: 600, rewardXp: 1200 },
  { id: 'map_explorer', title: 'Viajante', description: 'Visite todos os 9 biomas.', type: 'explore', target: 'maps', targetCount: 9, currentCount: 0, completed: false, rewardGold: 800, rewardXp: 1600 },
  // Crystal Cave quests
  { id: 'crystal_explorer', title: 'Espeleólogo', description: 'Explore a Caverna de Cristal (Nível 1).', type: 'explore', target: 'maps', targetCount: 1, currentCount: 0, completed: false, rewardGold: 400, rewardXp: 800, location: 'crystal1' },
  { id: 'crystal_boss', title: 'Senhor dos Cristais', description: 'Derrote o Chefe da Caverna de Cristal - Nível 3.', type: 'boss', target: 'dragon', targetCount: 1, currentCount: 0, completed: false, rewardGold: 2000, rewardXp: 4000, location: 'crystal3' },
  // Haunted Ruins quests
  { id: 'haunted_ghosts', title: 'Caçador de Fantasmas', description: 'Derrote 20 Fantasmas nas Ruínas.', type: 'kill', target: 'ghost', targetCount: 20, currentCount: 0, completed: false, rewardGold: 600, rewardXp: 1200, location: 'haunted1' },
  { id: 'haunted_boss', title: 'Exorcista', description: 'Derrote o Chefe das Ruínas Amaldiçoadas - Nível 3.', type: 'boss', target: 'demon', targetCount: 1, currentCount: 0, completed: false, rewardGold: 2500, rewardXp: 5000, location: 'haunted3' },
  // Sky Realm quests
  { id: 'sky_dragons', title: 'Caçador de Dragões Celestiais', description: 'Derrote 15 Dragões no Reino Celestial.', type: 'kill', target: 'dragon', targetCount: 15, currentCount: 0, completed: false, rewardGold: 800, rewardXp: 1600, location: 'sky2' },
  { id: 'sky_boss', title: 'Senhor do Céu', description: 'Derrote o Dragão Primordial no Reino Celestial - Nível 3.', type: 'boss', target: 'dragon', targetCount: 1, currentCount: 0, completed: false, rewardGold: 5000, rewardXp: 10000, location: 'sky3' },
]

export function getActiveQuests(player: Player): Quest[] {
  const saved = player._quests ?? []
  return QUESTS.map(q => {
    const s = saved.find(sq => sq.id === q.id)
    return s ? { ...q, ...s } : { ...q }
  })
}

export function updateQuests(state: GameState, monsterType: string, locationId: string): GameState {
  if (!state.player) return state
  const quests = getActiveQuests(state.player)
  let changed = false
  const newQuests = quests.map(q => {
    if (q.completed) return q
    if (q.type === 'kill' && (q.target === monsterType || q.target === '*')) {
      if (!q.location || q.location === locationId) {
        changed = true
        return { ...q, currentCount: q.currentCount + 1 }
      }
    }
    return q
  })

  if (!changed) return state

  const completedQuests = newQuests.filter(q => !q.completed && q.currentCount >= q.targetCount)
  if (completedQuests.length > 0) {
    let gold = state.player.gold
    let xp = state.player.xp
    let level = state.player.level
    let xpToNext = state.player.xpToNext
    const newMessages = [...state.chatMessages]
    const newNotifications = [...state.notifications]

    for (const q of completedQuests) {
      q.completed = true
      gold += q.rewardGold
      xp += q.rewardXp
      newMessages.push({
        id: uid('quest'),
        text: `Quest completada: ${q.title}! +${q.rewardGold} Ouro, +${q.rewardXp} XP`,
        type: 'level',
        timestamp: Date.now(),
      })
      newNotifications.push({
        id: uid('questnot'),
        text: `Quest: ${q.title}`,
        type: 'achievement',
        timer: 240,
      })
    }

    while (xp >= xpToNext) {
      xp -= xpToNext
      level++
      xpToNext = calculateXpToNext(level)
      newNotifications.push({ id: uid('lvl'), text: `Level ${level}!`, type: 'level', timer: 180 })
    }

    return {
      ...state,
      player: { ...state.player, gold, xp, level, xpToNext, _quests: newQuests },
      chatMessages: newMessages.slice(-50),
      notifications: newNotifications,
    }
  }

  return { ...state, player: { ...state.player, _quests: newQuests } }
}

export function checkLevelQuests(state: GameState): GameState {
  if (!state.player) return state
  const quests = getActiveQuests(state.player)
  let changed = false
  const newQuests = quests.map(q => {
    if (q.completed) return q
    if (q.type === 'reach_level' && q.target === 'level' && state.player!.level >= q.targetCount) {
      changed = true
      return { ...q, currentCount: state.player!.level }
    }
    return q
  })
  if (!changed) return state
  return { ...state, player: { ...state.player, _quests: newQuests } }
}
