/**
 * Sistema de Pets - Capture e treine criaturas
 */

export type PetType = 'SLIME' | 'WOLF' | 'DRAGON' | 'PHOENIX' | 'GOLEM' | 'GHOST' | 'TREANT' | 'SPIDER'

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface PetStats {
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  magicPower: number
}

export interface Pet {
  id: string
  type: PetType
  name: string
  rarity: PetRarity
  level: number
  xp: number
  xpToNext: number
  stats: PetStats
  skills: PetSkill[]
  loyalty: number // 0-100
  happiness: number // 0-100
  mood: 'happy' | 'neutral' | 'angry' | 'hungry'
  isSummoned: boolean
  lastFed: number // timestamp
  image: string
  color: string
}

export interface PetSkill {
  name: string
  icon: string
  description: string
  level: number
  cooldown: number
  damage: number
}

export interface PlayerPets {
  pets: Pet[]
  active: string | null // ID do pet ativo
  partySlots: (string | null)[] // Até 3 pets simultâneos
}

const PET_TEMPLATES: Record<PetType, Omit<Pet, 'id' | 'name' | 'xp' | 'xpToNext' | 'loyalty' | 'happiness'>> = {
  SLIME: {
    type: 'SLIME',
    rarity: 'common',
    level: 1,
    stats: { hp: 15, maxHp: 15, attack: 3, defense: 1, speed: 1, magicPower: 0 },
    skills: [
      { name: 'Pulo', icon: '💧', description: 'Salta para atacar', level: 1, cooldown: 1, damage: 5 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '💧',
    color: '#40c080',
  },
  WOLF: {
    type: 'WOLF',
    rarity: 'uncommon',
    level: 5,
    stats: { hp: 30, maxHp: 30, attack: 8, defense: 3, speed: 3, magicPower: 1 },
    skills: [
      { name: 'Mordida', icon: '🐺', description: 'Ataque rápido', level: 1, cooldown: 1, damage: 8 },
      { name: 'Uivo', icon: '🔊', description: 'Aumenta ataque', level: 1, cooldown: 5, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '🐺',
    color: '#8080a0',
  },
  DRAGON: {
    type: 'DRAGON',
    rarity: 'epic',
    level: 15,
    stats: { hp: 80, maxHp: 80, attack: 20, defense: 10, speed: 2, magicPower: 10 },
    skills: [
      { name: 'Chama', icon: '🐉', description: 'Bafo de fogo', level: 1, cooldown: 3, damage: 25 },
      { name: 'Corte', icon: '⚔', description: 'Ataque com garra', level: 1, cooldown: 2, damage: 15 },
      { name: 'Voo', icon: '💨', description: 'Esquive ataques', level: 1, cooldown: 4, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '🐉',
    color: '#ff4020',
  },
  PHOENIX: {
    type: 'PHOENIX',
    rarity: 'legendary',
    level: 20,
    stats: { hp: 50, maxHp: 50, attack: 15, defense: 5, speed: 4, magicPower: 15 },
    skills: [
      { name: 'Inferno', icon: '🔥', description: 'Ataque de fogo massivo', level: 1, cooldown: 5, damage: 30 },
      { name: 'Ressurreição', icon: '✨', description: 'Revive a si mesmo', level: 1, cooldown: 10, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '🔥',
    color: '#ff8040',
  },
  GOLEM: {
    type: 'GOLEM',
    rarity: 'rare',
    level: 12,
    stats: { hp: 100, maxHp: 100, attack: 12, defense: 15, speed: 1, magicPower: 2 },
    skills: [
      { name: 'Golpe', icon: '🪨', description: 'Ataque pesado', level: 1, cooldown: 2, damage: 20 },
      { name: 'Escudo', icon: '🛡', description: 'Aumenta defesa', level: 1, cooldown: 3, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '🪨',
    color: '#a0a0a0',
  },
  GHOST: {
    type: 'GHOST',
    rarity: 'rare',
    level: 10,
    stats: { hp: 25, maxHp: 25, attack: 5, defense: 2, speed: 5, magicPower: 8 },
    skills: [
      { name: 'Assombração', icon: '👻', description: 'Atordoe inimigo', level: 1, cooldown: 2, damage: 5 },
      { name: 'Evanescência', icon: '💨', description: 'Fique invisível', level: 1, cooldown: 4, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '👻',
    color: '#c0c0e0',
  },
  TREANT: {
    type: 'TREANT',
    rarity: 'uncommon',
    level: 7,
    stats: { hp: 40, maxHp: 40, attack: 6, defense: 8, speed: 1, magicPower: 3 },
    skills: [
      { name: 'Raiz', icon: '🌳', description: 'Enraíze inimigos', level: 1, cooldown: 3, damage: 3 },
      { name: 'Regenerar', icon: '🌿', description: 'Cure-se', level: 1, cooldown: 5, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '🌳',
    color: '#40a040',
  },
  SPIDER: {
    type: 'SPIDER',
    rarity: 'common',
    level: 3,
    stats: { hp: 20, maxHp: 20, attack: 4, defense: 2, speed: 4, magicPower: 2 },
    skills: [
      { name: 'Picada', icon: '🕷', description: 'Ataque rápido', level: 1, cooldown: 1, damage: 4 },
      { name: 'Teia', icon: '🕸', description: 'Prenda inimigo', level: 1, cooldown: 3, damage: 0 },
    ],
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: '🕷',
    color: '#804040',
  },
}

export function createPet(type: PetType, name: string = 'Pet', level: number = 1): Pet {
  const template = PET_TEMPLATES[type]
  const template_rarity = type === 'PHOENIX' ? 'legendary' : type === 'DRAGON' ? 'epic' : type === 'GOLEM' || type === 'GHOST' ? 'rare' : type === 'WOLF' || type === 'TREANT' ? 'uncommon' : 'common'

  return {
    id: `pet_${Date.now()}_${Math.random()}`,
    name,
    type,
    xp: 0,
    xpToNext: 100 * level,
    loyalty: 50,
    happiness: 75,
    mood: 'neutral',
    isSummoned: false,
    lastFed: Date.now(),
    image: template.image,
    color: template.color,
    rarity: template_rarity as PetRarity,
    level,
    stats: {
      ...template.stats,
      hp: template.stats.maxHp * level,
      maxHp: template.stats.maxHp * level,
      attack: template.stats.attack * level,
      defense: template.stats.defense * level,
      speed: template.stats.speed,
      magicPower: template.stats.magicPower * level,
    },
    skills: [...template.skills],
  }
}

export function createDefaultPets(): PlayerPets {
  return {
    pets: [createPet('SLIME', 'Gelatina')],
    active: null,
    partySlots: [null, null, null],
  }
}

export function addPetXp(pet: Pet, amount: number): Pet {
  const newXp = pet.xp + amount
  
  if (newXp >= pet.xpToNext) {
    // Level up
    const levels = Math.floor(newXp / pet.xpToNext)
    return {
      ...pet,
      level: pet.level + levels,
      xp: newXp % pet.xpToNext,
      xpToNext: pet.xpToNext * 2,
      stats: {
        ...pet.stats,
        maxHp: pet.stats.maxHp + 10 * levels,
        attack: pet.stats.attack + 3 * levels,
        defense: pet.stats.defense + 2 * levels,
      },
      loyalty: Math.min(100, pet.loyalty + 5),
    }
  }

  return {
    ...pet,
    xp: newXp,
  }
}

export function feedPet(pet: Pet): Pet {
  return {
    ...pet,
    happiness: Math.min(100, pet.happiness + 15),
    mood: 'happy',
    lastFed: Date.now(),
  }
}

export function getPetMood(pet: Pet): Pet['mood'] {
  const now = Date.now()
  const hoursSinceFed = (now - pet.lastFed) / (1000 * 60 * 60)

  if (hoursSinceFed > 24) return 'hungry'
  if (pet.happiness > 80) return 'happy'
  if (pet.happiness < 30) return 'angry'
  return 'neutral'
}

export function addPetToParty(pets: PlayerPets, petId: string, slot: number): PlayerPets {
  if (slot < 0 || slot >= 3) return pets

  return {
    ...pets,
    partySlots: [
      ...(pets.partySlots.slice(0, slot) || [null, null, null].slice(0, slot)),
      petId,
      ...(pets.partySlots.slice(slot + 1) || [null, null, null].slice(slot + 1)),
    ],
  }
}

export function removePetFromParty(pets: PlayerPets, slot: number): PlayerPets {
  if (slot < 0 || slot >= 3) return pets

  return {
    ...pets,
    partySlots: [
      ...(pets.partySlots.slice(0, slot) || [null, null, null].slice(0, slot)),
      null,
      ...(pets.partySlots.slice(slot + 1) || [null, null, null].slice(slot + 1)),
    ],
  }
}

export function calculatePetPower(pet: Pet): number {
  return (
    pet.stats.attack * 1.5 +
    pet.stats.defense +
    pet.stats.maxHp * 0.1 +
    pet.stats.speed * 2 +
    pet.stats.magicPower * 1.5 +
    pet.level * 10 +
    pet.loyalty * 0.5
  )
}

export function getPetBonus(pet: Pet): Partial<Record<string, number>> {
  return {
    xpMultiplier: 1 + pet.loyalty / 200,
    dropMultiplier: 1 + pet.level / 50,
    damageBonus: pet.stats.attack * 0.1,
  }
}
