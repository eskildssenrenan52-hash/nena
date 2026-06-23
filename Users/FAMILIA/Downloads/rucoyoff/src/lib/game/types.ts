export type CharacterClass =
  | 'knight'
  | 'archer'
  | 'mage'
  | 'necromancer'
  | 'paladin'
  | 'berserker'
  | 'assassin'
  | 'druid'
  | 'monk'
  | 'samurai'
  | 'summoner'
  | 'alchemist'
  | 'chronomancer'
  | 'beastmaster'


export type Direction = 'up' | 'down' | 'left' | 'right'

export type TileType =
  | 'grass' | 'dirt' | 'stone' | 'water' | 'deepwater'
  | 'sand' | 'snow' | 'lava' | 'wall' | 'floor'
  | 'tree' | 'rock' | 'chest' | 'portal'
  | 'dungeon_floor' | 'dungeon_wall' | 'dungeon_brick'
  | 'road' | 'bridge' | 'tall_grass' | 'flower'
  // City biome tiles
  | 'cobblestone' | 'house_wall' | 'house_roof' | 'house_door'
  | 'fountain' | 'lamp_post' | 'market_stall' | 'fence' | 'garden'
  // Tundra biome tiles
  | 'ice' | 'frozen_tree' | 'ice_rock' | 'snow_rock'
  // Volcano biome tiles
  | 'volcanic_rock' | 'ash' | 'obsidian' | 'magma_crust' | 'volcanic_vent'
  // Abyss biome tiles
  | 'void' | 'abyss_floor' | 'crystal' | 'dark_crystal' | 'abyss_wall' | 'soul_fire'
  | 'crystal_floor' | 'crystal_wall' | 'gem_node' | 'crystal_portal'
  | 'ruin_floor' | 'ruin_wall' | 'cobweb' | 'haunted_portal'
  | 'cloud_floor' | 'sky_platform' | 'sky_void' | 'sky_portal'
  // Deep Forest biome tiles
  | 'ancient_bark' | 'mossy_stone' | 'dark_water' | 'mushroom' | 'root' | 'canopy'
  // Snowy Mountain biome tiles
  | 'pine_tree' | 'snowy_peak' | 'mountain_rock' | 'frost_grass' | 'snow_path' | 'mountain_portal' | 'ice_crystal_node' | 'frozen_campfire'
  // Ancient Ruins biome tiles
  | 'ruin_pillar' | 'broken_tile' | 'vine_wall' | 'sarcophagus' | 'ancient_tile' | 'ruins_portal' | 'rune_stone' | 'ancient_brazier'


export type MonsterType =
  | 'slime' | 'skeleton' | 'goblin' | 'orc' | 'wolf'
  | 'spider' | 'zombie' | 'demon' | 'dragon' | 'troll'
  | 'witch' | 'knight_enemy' | 'archer_enemy' | 'mage_enemy' | 'ghost' | 'vampire' | 'treant'

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'consumable' | 'material'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Vec2 { x: number; y: number }

export interface Item {
  id: string
  name: string
  type: ItemType
  rarity: ItemRarity
  icon: string
  description: string
  stats: Partial<CharacterStats>
  stackable?: boolean
  quantity?: number
  level?: number
  value: number
}

export interface CharacterStats {
  maxHp: number
  maxMp: number
  attack: number
  defense: number
  speed: number
  critChance: number
  critDamage: number
  magicPower: number
  range: number
}

export interface ClassProgress {
  level: number
  xp: number
  xpToNext: number
  skills: SkillLevel[]
  abilities: AbilityState[]
  equipment: {
    weapon: Item | null
    armor: Item | null
    helmet: Item | null
    boots: Item | null
    ring: Item | null
  }
}

// ─── Abilities System ───────────────────────────────────────────────────────

export type AbilityEffectType =
  | 'melee_aoe'      // dano em area corpo-a-corpo ao redor do jogador
  | 'projectile'     // projetil unico em linha reta na direcao
  | 'multi_projectile' // varios projeteis em leque
  | 'nova'           // explosao radial a partir do jogador
  | 'target_aoe'     // dano em area no ponto/alvo mirado
  | 'dash'           // avanco causando dano no caminho
  | 'summon'         // invoca minions (necromante)
  | 'heal'           // cura o jogador
  | 'buff'           // buff temporario de status
  | 'life_drain'     // dano que cura o jogador

export interface AbilityDef {
  id: string
  name: string
  description: string
  cls: CharacterClass
  icon: string
  color: string
  manaCost: number
  cooldown: number          // em ticks (~60/s)
  unlockLevel: number       // nivel da classe necessario
  effect: AbilityEffectType
  damageMultiplier: number  // multiplica o ataque/magia base
  range: number             // alcance em pixels
  radius?: number           // raio de efeito para AoE/nova
  projectileCount?: number  // numero de projeteis
  summonCount?: number      // numero de minions invocados
  summonType?: MinionType
  duration?: number         // duracao para buffs/summons
  healPercent?: number      // % de cura
  aoeRadius?: number        // raio de explosao ao impacto (projeteis)
}

export interface AbilityState {
  id: string
  currentCooldown: number   // ticks restantes
}

export type MinionType = 'skeleton_minion' | 'zombie_minion' | 'wraith_minion'

export interface Minion {
  id: string
  type: MinionType
  ownerId: string
  level: number
  hp: number
  maxHp: number
  attack: number
  position: Vec2
  targetMonsterId: string | null
  direction: Direction
  isMoving: boolean
  isAttacking: boolean
  attackCooldown: number
  lifespan: number
  animFrame: number
  range: number
}

// ─── Sistema de Reputação ──────────────────────────────────────────────────
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

// ─── Sistema de Masteries ──────────────────────────────────────────────────
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
  xp: number
  xpToNext: number
  stats: Partial<CharacterStats>
  passive: string
  color: string
}

export interface Mastery {
  type: MasteryType
  level: number // 1-100
  xp: number
  nodes: Record<string, MasteryNode>
  totalLevel: number
}

export interface PlayerMasteries {
  active: MasteryType
  masteries: Record<MasteryType, Mastery>
}

// ─── Sistema de Pets ──────────────────────────────────────────────────────
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

export interface PetSkill {
  name: string
  icon: string
  description: string
  level: number
  cooldown: number
  damage: number
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
  lastFed: number
  image: string
  color: string
}

export interface PlayerPets {
  pets: Pet[]
  active: string | null
  partySlots: (string | null)[]
}

// ─── Sistema de Achievements ──────────────────────────────────────────────
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
  progress: number
  requirement: number
  secret: boolean
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

export interface Projectile {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  damage: number
  isCrit: boolean
  radius: number
  color: string
  type: 'arrow' | 'fireball' | 'bone' | 'frost' | 'magic'
  pierce: boolean
  hitIds: string[]
  owner: 'player' | 'monster'
  aoeRadius?: number        // se > 0, explode causando dano em area ao acertar
}

export interface AreaEffect {
  id: string
  x: number
  y: number
  radius: number
  maxRadius: number
  life: number
  maxLife: number
  color: string
  damage: number
  isCrit: boolean
  hitIds: string[]
  type: 'nova' | 'explosion' | 'whirlwind' | 'frost'
}

export interface Player {
  name: string
  class: CharacterClass
  skin?: number
  level: number
  xp: number
  xpToNext: number
  hp: number
  mp: number
  maxHp?: number
  stats: CharacterStats
  baseStats: CharacterStats
  gold: number
  position: Vec2
  direction: Direction
  isMoving: boolean
  isAttacking: boolean
  attackCooldown: number
  inventory: (Item | null)[]
  equipment: {
    weapon: Item | null
    armor: Item | null
    helmet: Item | null
    boots: Item | null
    ring: Item | null
  }
  skills: SkillLevel[]
  abilities: AbilityState[]
  // Per-class independent progress
  classProgress: Record<CharacterClass, ClassProgress>
  // buffs temporarios
  buffs: ActiveBuff[]
  // Status effects
  statusEffects?: StatusEffect[]
  // Persisted stats for achievements
  _totalKills?: number
  _totalDamage?: number
  _bossesKilled?: number
  _highestCombo?: number
  _classesPlayed?: number
  _mapsVisited?: number
  _visitedMapIds?: string[]
  _deaths?: number
  _achievements?: string[]
  _quests?: { id: string; currentCount: number; completed: boolean }[]
  animFrame?: number

  // ─── NOVOS SISTEMAS ───────────────────────────────────────────────────
  // Sistema de Reputação
  reputation?: PlayerReputation
  
  // Sistema de Masteries
  masteries?: PlayerMasteries
  
  // Sistema de Pets
  pets?: PlayerPets
  
  // Sistema de Achievements
  achievements?: Record<string, Achievement>

  // ─── FASE 1: Prestige & Specialization ─────────────────────────────
  prestige?: PlayerPrestige
  specializations?: PlayerSpecializations
}

// ─── Sistema de Prestige ──────────────────────────────────────────────
export interface PrestigeRankInfo {
  class: CharacterClass
  rank: number              // 0..10
  totalPoints: number       // pontos disponíveis na árvore de prestígio
  spent: Record<string, number>  // nodeId -> ranks investidos
  unlockedTitles: string[]
  unlockedAuras: string[]
}

export interface PlayerPrestige {
  global: number                                // soma de todos os ranks
  byClass: Record<CharacterClass, PrestigeRankInfo>
  selectedTitle?: string
  selectedAura?: string
}

// ─── Sistema de Especializações ───────────────────────────────────────
export type SpecId = string

export interface SpecTalentNode {
  id: string
  name: string
  description: string
  icon: string
  maxRank: number
  row: number               // tier 1..5
  col: number               // 0..4 para layout
  cost: number              // pontos por rank
  requires?: string         // node prerequisito
  effect: {
    stat?: keyof CharacterStats
    value?: number          // por rank
    flag?: string           // efeitos especiais (keystones)
  }
}

export interface Specialization {
  id: SpecId
  cls: CharacterClass
  name: string
  description: string
  icon: string
  color: string
  flavor: string
  unlockLevel: number
  tree: SpecTalentNode[]
}

export interface PlayerSpecializations {
  // spec ativa por classe
  active: Partial<Record<CharacterClass, SpecId>>
  // pontos investidos por spec
  invested: Record<SpecId, Record<string, number>>
  // loadouts salvos por spec
  loadouts: Record<SpecId, { name: string; ranks: Record<string, number> }[]>
}

export interface ActiveBuff {
  id: string
  name: string
  timer: number
  stat: keyof CharacterStats
  amount: number
}

export interface SkillLevel {
  name: string
  level: number
  xp: number
  xpToNext: number
  icon: string
}

export interface StatusEffect {
  id: string
  type: 'stun' | 'poison' | 'burn' | 'freeze' | 'slow' | 'bleed' | 'curse' | 'regen'
  source: 'player' | 'monster'
  duration: number
  tickInterval: number
  tickTimer: number
  potency: number
  name: string
  icon: string
  color: string
}

export interface Monster {
  id: string
  type: MonsterType
  name: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  xpReward: number
  goldReward: number
  position: Vec2
  targetPosition: Vec2
  direction: Direction
  isMoving: boolean
  isAttacking: boolean
  attackCooldown: number
  aggroRange: number
  isAggrod: boolean
  drops: ItemDropEntry[]
  animFrame: number
  animTimer: number
  isDead: boolean
  deathTimer: number
  // Combate avancado
  attackRange: number       // alcance de ataque do monstro
  isRanged: boolean         // ataca a distancia (atira projeteis)
  elite: EliteTier          // raridade/poder do monstro
  // Status effects
  statusEffects?: StatusEffect[]
  // Respawn: posicao/template originais e timer ate reaparecer (ticks)
  _spawnX?: number
  _spawnY?: number
  _spawnType?: MonsterType
  _spawnLevel?: number
  _spawnElite?: EliteTier
  _respawnIn?: number
}

export type EliteTier = 'normal' | 'elite' | 'champion' | 'boss'

export interface ItemDropEntry {
  item: Item
  chance: number
}

export interface Tile {
  type: TileType
  walkable: boolean
  transparent: boolean
  animated?: boolean
  animFrame?: number
}

export interface GameMap {
  id: string
  name: string
  width: number
  height: number
  tiles: Tile[][]
  monsters: Monster[]
  spawnPoints: Vec2[]
  ambience: string
  musicTheme: string
  minLevel?: number
}

export interface DamageNumber {
  id: string
  value: number
  x: number
  y: number
  timer: number
  type: 'physical' | 'magic' | 'heal' | 'crit'
}

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'spark' | 'smoke' | 'blood' | 'magic' | 'leaf' | 'fire' | 'water' | 'death' | 'xp' | 'heal'
}

export type GameScreen = 'title' | 'create' | 'playing' | 'paused' | 'inventory' | 'dead' | 'editor'

// ─── Editor Types ─────────────────────────────────────────────────────────────

export type EditorTool =
  | 'paint'       // pintar tiles
  | 'erase'       // apagar (colocar grass)
  | 'fill'        // flood fill
  | 'spawn'       // adicionar ponto de spawn
  | 'monster'     // colocar monstro
  | 'select'      // selecionar região
  | 'eyedropper'  // pegar tile do mapa
  | 'line'        // desenhar linha
  | 'rect'        // retângulo (contorno)
  | 'rect_fill'   // retângulo preenchido
  | 'circle'      // círculo preenchido

export interface EditorState {
  isOpen: boolean
  activeTool: EditorTool
  selectedTile: TileType
  selectedMonsterType: MonsterType
  selectedMonsterLevel: number
  brushSize: number
  showGrid: boolean
  showCollisions: boolean
  showMonsters: boolean
  showSpawns: boolean
  mapName: string
  history: Tile[][][]  // undo history (snapshots of tiles)
  historyIndex: number
  selectionStart: Vec2 | null
  selectionEnd: Vec2 | null
}

export interface GameState {
  screen: GameScreen
  player: Player | null
  currentMap: GameMap | null
  camera: Vec2
  tick: number
  damageNumbers: DamageNumber[]
  particles: Particle[]
  minions: Minion[]
  projectiles: Projectile[]
  areaEffects: AreaEffect[]
  chatMessages: ChatMessage[]
  notifications: GameNotification[]
  selectedItem: Item | null
  hoveredMonster: Monster | null
  mousePos: Vec2
  isPaused: boolean
  editorOpen: boolean
  editorState: EditorState
  // Internal game state
  _combo?: { count: number; timer: number; maxCombo: number; lastHitTime: number; multiplier: number }
  _screenShake?: number
  _lastAmbience?: string
  _devMode?: boolean
  _levelUpFlash?: number
  _portalTarget?: string | null
  _portalCooldown?: number
  _weather?: 'none' | 'rain' | 'snow' | 'fog' | 'storm'
  _weatherIntensity?: number
  _timeOfDay?: number
  _killStreak?: number
  _killStreakTimer?: number
}

export interface ChatMessage {
  id: string
  text: string
  type: 'system' | 'loot' | 'level' | 'combat' | 'info'
  timestamp: number
}

export interface GameNotification {
  id: string
  text: string
  type: 'level' | 'item' | 'skill' | 'achievement'
  timer: number
}
