import type { Player, CharacterClass } from '@/lib/game/types'

export interface PassiveNode {
  id: string
  name: string
  description: string
  icon: string
  level: number
  stat: string
  value: number
  cls?: CharacterClass
}

export const PASSIVES: PassiveNode[] = [
  // Global passives (any class)
  { id: 'vitality1', name: 'Vitalidade I', description: '+50 HP máximo', icon: '❤', level: 3, stat: 'maxHp', value: 50 },
  { id: 'vitality2', name: 'Vitalidade II', description: '+120 HP máximo', icon: '❤', level: 8, stat: 'maxHp', value: 120 },
  { id: 'vitality3', name: 'Vitalidade III', description: '+300 HP máximo', icon: '❤', level: 18, stat: 'maxHp', value: 300 },
  { id: 'vitality4', name: 'Vitalidade IV', description: '+800 HP máximo', icon: '❤', level: 40, stat: 'maxHp', value: 800 },
  { id: 'vitality5', name: 'Vitalidade V', description: '+1800 HP máximo', icon: '❤', level: 60, stat: 'maxHp', value: 1800 },
  { id: 'mana1', name: 'Arcano I', description: '+30 MP máximo', icon: '💧', level: 4, stat: 'maxMp', value: 30 },
  { id: 'mana2', name: 'Arcano II', description: '+80 MP máximo', icon: '💧', level: 12, stat: 'maxMp', value: 80 },
  { id: 'mana3', name: 'Arcano III', description: '+250 MP máximo', icon: '💧', level: 22, stat: 'maxMp', value: 250 },
  { id: 'mana4', name: 'Arcano IV', description: '+700 MP máximo', icon: '💧', level: 45, stat: 'maxMp', value: 700 },
  { id: 'resilience', name: 'Resiliência', description: '+8 Defesa', icon: '🛡', level: 6, stat: 'defense', value: 8 },
  { id: 'resilience2', name: 'Resiliência II', description: '+20 Defesa', icon: '🛡', level: 16, stat: 'defense', value: 20 },
  { id: 'resilience3', name: 'Resiliência III', description: '+60 Defesa', icon: '🛡', level: 32, stat: 'defense', value: 60 },
  { id: 'crit1', name: 'Olho de Falcão', description: '+5% chance de critico', icon: '🎯', level: 7, stat: 'critChance', value: 0.05 },
  { id: 'crit2', name: 'Precisão Mortal', description: '+10% chance de critico', icon: '🎯', level: 15, stat: 'critChance', value: 0.1 },
  { id: 'critdmg', name: 'Golpe Fatal', description: '+30% dano critico', icon: '💥', level: 10, stat: 'critDamage', value: 0.3 },
  { id: 'critdmg2', name: 'Aniquilador', description: '+80% dano critico', icon: '💥', level: 28, stat: 'critDamage', value: 0.8 },
  { id: 'speed1', name: 'Passo Leve', description: '+0.4 velocidade', icon: '💨', level: 5, stat: 'speed', value: 0.4 },
  { id: 'speed2', name: 'Vento Veloz', description: '+0.8 velocidade', icon: '💨', level: 14, stat: 'speed', value: 0.8 },
  { id: 'speed3', name: 'Tempestade Veloz', description: '+1.5 velocidade', icon: '💨', level: 33, stat: 'speed', value: 1.5 },
  // Knight
  { id: 'knight_atk', name: 'Fúria do Cavaleiro', description: '+40 ataque', icon: '⚔', level: 9, stat: 'attack', value: 40, cls: 'knight' },
  { id: 'knight_def', name: 'Escudo de Aço', description: '+30 defesa', icon: '🛡', level: 11, stat: 'defense', value: 30, cls: 'knight' },
  { id: 'knight_hp', name: 'Cavalaria Inabalável', description: '+400 HP', icon: '❤', level: 20, stat: 'maxHp', value: 400, cls: 'knight' },
  { id: 'knight_supreme', name: 'Lâmina Suprema', description: '+120 ataque', icon: '⚔', level: 35, stat: 'attack', value: 120, cls: 'knight' },
  // Archer
  { id: 'archer_atk', name: 'Olho Aguia', description: '+35 ataque', icon: '🏹', level: 9, stat: 'attack', value: 35, cls: 'archer' },
  { id: 'archer_crit', name: 'Flecha Certeira', description: '+12% critico', icon: '🏹', level: 13, stat: 'critChance', value: 0.12, cls: 'archer' },
  { id: 'archer_range', name: 'Tiro de Águia', description: '+80 alcance', icon: '➹', level: 20, stat: 'range', value: 80, cls: 'archer' },
  { id: 'archer_crit2', name: 'Senhor das Flechas', description: '+25% critico', icon: '🏹', level: 35, stat: 'critChance', value: 0.25, cls: 'archer' },
  // Mage
  { id: 'mage_mp', name: 'Reservatório Arcano', description: '+100 MP', icon: '🔮', level: 9, stat: 'maxMp', value: 100, cls: 'mage' },
  { id: 'mage_magic', name: 'Poder Arcano', description: '+60 poder mágico', icon: '🔮', level: 13, stat: 'magicPower', value: 60, cls: 'mage' },
  { id: 'mage_range', name: 'Alcance Arcano', description: '+100 alcance', icon: '➹', level: 22, stat: 'range', value: 100, cls: 'mage' },
  { id: 'mage_supreme', name: 'Magus Supremo', description: '+200 poder mágico', icon: '✦', level: 38, stat: 'magicPower', value: 200, cls: 'mage' },
  // Necromancer
  { id: 'necro_atk', name: 'Toque da Morte', description: '+45 ataque', icon: '💀', level: 9, stat: 'attack', value: 45, cls: 'necromancer' },
  { id: 'necro_mp', name: 'Essência Sombria', description: '+80 MP', icon: '💀', level: 13, stat: 'maxMp', value: 80, cls: 'necromancer' },
  { id: 'necro_mag', name: 'Senhor dos Mortos', description: '+90 poder mágico', icon: '☠', level: 22, stat: 'magicPower', value: 90, cls: 'necromancer' },
  // Paladin
  { id: 'paladin_def', name: 'Égide Sagrada', description: '+45 defesa', icon: '⛨', level: 9, stat: 'defense', value: 45, cls: 'paladin' },
  { id: 'paladin_hp', name: 'Coração Puro', description: '+500 HP', icon: '✚', level: 18, stat: 'maxHp', value: 500, cls: 'paladin' },
  { id: 'paladin_atk', name: 'Lâmina Sagrada', description: '+80 ataque', icon: '☼', level: 28, stat: 'attack', value: 80, cls: 'paladin' },
  // Berserker
  { id: 'berk_atk', name: 'Fúria Sangrenta', description: '+90 ataque', icon: '🪓', level: 9, stat: 'attack', value: 90, cls: 'berserker' },
  { id: 'berk_crit', name: 'Sede Brutal', description: '+18% crítico', icon: '💢', level: 18, stat: 'critChance', value: 0.18, cls: 'berserker' },
  { id: 'berk_speed', name: 'Investida Constante', description: '+1.2 velocidade', icon: '💨', level: 30, stat: 'speed', value: 1.2, cls: 'berserker' },
  // Assassin
  { id: 'assa_crit', name: 'Letalidade', description: '+25% crítico', icon: '🗡', level: 9, stat: 'critChance', value: 0.25, cls: 'assassin' },
  { id: 'assa_critdmg', name: 'Lâmina Fatal', description: '+100% dano crítico', icon: '✦', level: 18, stat: 'critDamage', value: 1.0, cls: 'assassin' },
  { id: 'assa_speed', name: 'Sombra Veloz', description: '+1.5 velocidade', icon: '💨', level: 28, stat: 'speed', value: 1.5, cls: 'assassin' },
  // Druid
  { id: 'druid_mag', name: 'Voz da Mata', description: '+70 magia', icon: '🌿', level: 9, stat: 'magicPower', value: 70, cls: 'druid' },
  { id: 'druid_hp', name: 'Pele de Casca', description: '+450 HP', icon: '🌳', level: 18, stat: 'maxHp', value: 450, cls: 'druid' },
  { id: 'druid_mp', name: 'Comunhão', description: '+200 MP', icon: '💧', level: 28, stat: 'maxMp', value: 200, cls: 'druid' },
  // Monk
  { id: 'monk_speed', name: 'Passo das Mil Folhas', description: '+1.6 velocidade', icon: '💨', level: 9, stat: 'speed', value: 1.6, cls: 'monk' },
  { id: 'monk_crit', name: 'Punhos Precisos', description: '+15% crítico', icon: '✊', level: 18, stat: 'critChance', value: 0.15, cls: 'monk' },
  { id: 'monk_hp', name: 'Corpo de Aço', description: '+400 HP', icon: '❤', level: 28, stat: 'maxHp', value: 400, cls: 'monk' },
  // Samurai
  { id: 'sam_atk', name: 'Lâmina Honrada', description: '+85 ataque', icon: '🗡', level: 9, stat: 'attack', value: 85, cls: 'samurai' },
  { id: 'sam_crit', name: 'Iai Perfeito', description: '+22% crítico', icon: '✦', level: 18, stat: 'critChance', value: 0.22, cls: 'samurai' },
  { id: 'sam_critdmg', name: 'Bushido Supremo', description: '+90% dano crítico', icon: '⚡', level: 28, stat: 'critDamage', value: 0.9, cls: 'samurai' },
  // Summoner
  { id: 'sum_mp', name: 'Pacto Arcano', description: '+300 MP', icon: '✦', level: 9, stat: 'maxMp', value: 300, cls: 'summoner' },
  { id: 'sum_mag', name: 'Invocação Refinada', description: '+90 magia', icon: '☼', level: 18, stat: 'magicPower', value: 90, cls: 'summoner' },
  { id: 'sum_range', name: 'Vínculo Distante', description: '+90 alcance', icon: '➹', level: 28, stat: 'range', value: 90, cls: 'summoner' },
  // Alchemist
  { id: 'alch_mag', name: 'Catalisador', description: '+75 magia', icon: '⚗', level: 9, stat: 'magicPower', value: 75, cls: 'alchemist' },
  { id: 'alch_mp', name: 'Reserva Volátil', description: '+220 MP', icon: '💧', level: 18, stat: 'maxMp', value: 220, cls: 'alchemist' },
  { id: 'alch_crit', name: 'Reação Crítica', description: '+15% crítico', icon: '💥', level: 28, stat: 'critChance', value: 0.15, cls: 'alchemist' },
  // Chronomancer
  { id: 'chro_mag', name: 'Fluxo Temporal', description: '+95 magia', icon: '⌛', level: 9, stat: 'magicPower', value: 95, cls: 'chronomancer' },
  { id: 'chro_speed', name: 'Aceleração Pessoal', description: '+1.4 velocidade', icon: '💨', level: 18, stat: 'speed', value: 1.4, cls: 'chronomancer' },
  { id: 'chro_range', name: 'Visão Cronos', description: '+120 alcance', icon: '➹', level: 28, stat: 'range', value: 120, cls: 'chronomancer' },
  { id: 'chro_critdmg', name: 'Paradoxo Letal', description: '+120% dano crítico', icon: '∞', level: 38, stat: 'critDamage', value: 1.2, cls: 'chronomancer' },
  // Beastmaster
  { id: 'beast_atk', name: 'Vínculo da Fera', description: '+75 ataque', icon: '🐾', level: 9, stat: 'attack', value: 75, cls: 'beastmaster' },
  { id: 'beast_crit', name: 'Instinto Caçador', description: '+18% crítico', icon: '🎯', level: 18, stat: 'critChance', value: 0.18, cls: 'beastmaster' },
  { id: 'beast_hp', name: 'Couro Selvagem', description: '+450 HP', icon: '❤', level: 28, stat: 'maxHp', value: 450, cls: 'beastmaster' },
  { id: 'beast_speed', name: 'Passo Animal', description: '+1.3 velocidade', icon: '💨', level: 38, stat: 'speed', value: 1.3, cls: 'beastmaster' },
  // Late game
  { id: 'supreme_atk', name: 'Força Suprema', description: '+100 ataque', icon: '🌟', level: 25, stat: 'attack', value: 100 },
  { id: 'supreme_hp', name: 'Corpo de Aço', description: '+500 HP', icon: '🌟', level: 30, stat: 'maxHp', value: 500 },
  { id: 'god_crit', name: 'Golpe Divino', description: '+50% dano critico', icon: '⚡', level: 35, stat: 'critDamage', value: 0.5 },
  { id: 'apex_atk', name: 'Ápice da Força', description: '+250 ataque', icon: '☼', level: 50, stat: 'attack', value: 250 },
  { id: 'apex_hp', name: 'Coração Imortal', description: '+2000 HP', icon: '☼', level: 60, stat: 'maxHp', value: 2000 },
  { id: 'apex_mag', name: 'Magia Cósmica', description: '+250 magia', icon: '☼', level: 60, stat: 'magicPower', value: 250 },
]

export function getUnlockedPassives(player: Player): PassiveNode[] {
  return PASSIVES.filter(p => {
    if (player.level < p.level) return false
    if (p.cls && p.cls !== player.class) return false
    return true
  })
}

export function applyPassivesToStats(player: Player): Player {
  const unlocked = getUnlockedPassives(player)
  const bonuses: Record<string, number> = {}
  for (const p of unlocked) {
    bonuses[p.stat] = (bonuses[p.stat] ?? 0) + p.value
  }
  return {
    ...player,
    stats: {
      ...player.stats,
      maxHp: player.stats.maxHp + (bonuses.maxHp ?? 0),
      maxMp: player.stats.maxMp + (bonuses.maxMp ?? 0),
      attack: player.stats.attack + (bonuses.attack ?? 0),
      defense: player.stats.defense + (bonuses.defense ?? 0),
      speed: player.stats.speed + (bonuses.speed ?? 0),
      critChance: Math.min(0.95, player.stats.critChance + (bonuses.critChance ?? 0)),
      critDamage: player.stats.critDamage + (bonuses.critDamage ?? 0),
      magicPower: player.stats.magicPower + (bonuses.magicPower ?? 0),
    },
  }
}
