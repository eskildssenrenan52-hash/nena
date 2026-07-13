// Central balancing/config for Rimhold.

export const TILE_SIZE = 32;
export const RENDER_SCALE = 2;

// Tileset indexes (0..15). true = blocks movement.
// Layout convention used by the new biome sheets:
// 0-7 = ground / paths / low decoration (walkable)
// 8-10 = large objects / walls (solid)
// 11 = flat emblem / floor detail (walkable)
// 12-13 = statues / crystal clusters / major props (solid)
// 14 = dark ground variant (walkable)
// 15 = full wall / hedge / cliff (solid)
export const TILE_BLOCK: boolean[] = [
  false, false, false, false,
  false, false, false, false,
  true,  true,  true,  false,
  true,  true,  false, true,
];

export const DIR_DOWN = 0;
export const DIR_LEFT = 1;
export const DIR_RIGHT = 2;
export const DIR_UP = 3;

export const PLAYER_STEP_MS = 170;
export const ATTACK_COOLDOWN_MS = 650;

// Floors per dungeon (was 3, now 5).
export const DUNGEON_FLOORS = 5;

// ---------- Progression ----------
export function xpForLevel(level: number): number {
  // 2x faster leveling: halved XP requirement.
  return Math.floor(25 * Math.pow(level, 2.3));
}
export const SKILL_XP_PER_HIT = 1;
export function skillXpForNext(skillLevel: number): number {
  return Math.floor(20 * Math.pow(skillLevel, 1.85));
}

// ---------- Classes / Skills ----------
export type ClassId =
  | "melee" | "archer" | "mage"
  | "paladin" | "assassin" | "berserker" | "elementalist" | "necromancer";
export type SkillId = "defense" | "melee" | "archer" | "mage";

export interface ClassDef {
  id: ClassId;
  name: string;
  color: number;
  attackRange: number;
  attackKind: "melee" | "arrow" | "bolt";
  primarySkill: SkillId;
  baseDamage: number;
  cooldownMs: number;
  tagline: string;
  // Each class now has its own unique AI-generated sprite sheet.
  baseSheet: ClassId;
  spriteTint: number;                        // kept for backwards compat (1 = no tint)
  weapon: WeaponStyle;                       // what to draw as overlay
  attackFx: AttackFxKind;                    // unique attack animation
}

export type WeaponStyle =
  | "sword" | "bow" | "staff"
  | "hammer" | "daggers" | "axe" | "orb" | "scythe";

export type AttackFxKind =
  | "slash" | "arrow" | "bolt"
  | "hammerSmash" | "daggerFlurry" | "axeCleave" | "elementalBurst" | "soulReap";

export const CLASSES: Record<ClassId, ClassDef> = {
  melee: {
    id:"melee", name:"Guerreiro", color:0xf59e0b,
    attackRange:1, attackKind:"melee", primarySkill:"melee",
    baseDamage:4, cooldownMs:600,
    tagline:"Corpo-a-corpo equilibrado. Confia em armadura e resistência.",
    baseSheet:"melee", spriteTint:0xffffff, weapon:"sword", attackFx:"slash",
  },
  archer: {
    id:"archer", name:"Arqueiro", color:0x22c55e,
    attackRange:6, attackKind:"arrow", primarySkill:"archer",
    baseDamage:3, cooldownMs:700,
    tagline:"Precisão à distância. Flechas em leque, armadilhas e chuva.",
    baseSheet:"archer", spriteTint:0xffffff, weapon:"bow", attackFx:"arrow",
  },
  mage: {
    id:"mage", name:"Mago", color:0x8b5cf6,
    attackRange:5, attackKind:"bolt", primarySkill:"mage",
    baseDamage:5, cooldownMs:900,
    tagline:"Arcano puro. Fogo, gelo, teleporte e meteoro.",
    baseSheet:"mage", spriteTint:0xffffff, weapon:"staff", attackFx:"bolt",
  },
  paladin: {
    id:"paladin", name:"Paladino", color:0xfde047,
    attackRange:1, attackKind:"melee", primarySkill:"defense",
    baseDamage:5, cooldownMs:700,
    tagline:"Escudo sagrado, cura em área, martelo de luz.",
    baseSheet:"paladin", spriteTint:0xffffff, weapon:"hammer", attackFx:"hammerSmash",
  },
  assassin: {
    id:"assassin", name:"Assassino", color:0xef4444,
    attackRange:1, attackKind:"melee", primarySkill:"melee",
    baseDamage:6, cooldownMs:420,
    tagline:"Dagas rápidas, dash mortal, invisibilidade e crítico.",
    baseSheet:"assassin", spriteTint:0xffffff, weapon:"daggers", attackFx:"daggerFlurry",
  },
  berserker: {
    id:"berserker", name:"Berserker", color:0xdc2626,
    attackRange:1, attackKind:"melee", primarySkill:"melee",
    baseDamage:7, cooldownMs:800,
    tagline:"Fúria. Quanto menos HP, mais dano. Redemoinho de machado.",
    baseSheet:"berserker", spriteTint:0xffffff, weapon:"axe", attackFx:"axeCleave",
  },
  elementalist: {
    id:"elementalist", name:"Elementalista", color:0x38bdf8,
    attackRange:5, attackKind:"bolt", primarySkill:"mage",
    baseDamage:5, cooldownMs:800,
    tagline:"Alterna fogo, gelo e raio. Cadeias, novas e chuva elemental.",
    baseSheet:"elementalist", spriteTint:0xffffff, weapon:"orb", attackFx:"elementalBurst",
  },
  necromancer: {
    id:"necromancer", name:"Necromante", color:0x7c3aed,
    attackRange:5, attackKind:"bolt", primarySkill:"mage",
    baseDamage:4, cooldownMs:850,
    tagline:"Invoca esqueleto que puxa aggro. Drena vida. Praga.",
    baseSheet:"necromancer", spriteTint:0xffffff, weapon:"scythe", attackFx:"soulReap",
  },
};

export const CLASS_ORDER: ClassId[] = [
  "melee", "paladin", "berserker", "assassin",
  "archer", "mage", "elementalist", "necromancer",
];

// ---------- Abilities ----------
export type AbilityKind =
  // Warrior
  | "whirlwind" | "charge" | "warcry" | "earthquake" | "shockwave" | "bloodlust"
  // Archer
  | "multishot" | "piercing" | "trap" | "arrowRain" | "evadeRoll" | "explosiveArrow"
  // Mage
  | "fireball" | "iceNova" | "blink" | "meteor" | "arcaneOrb" | "manaShield"
  // Paladin
  | "holyShield" | "hammerOfLight" | "consecrate" | "divineHeal" | "judgment" | "avengerWings"
  // Assassin
  | "dashStrike" | "shadowStep" | "poisonBlade" | "bladeFury" | "smokeBomb" | "deathMark"
  // Berserker
  | "berserkRage" | "bloodAxe" | "quakeSlam" | "reckless" | "warBanner" | "frenzy"
  // Elementalist
  | "chainLightning" | "flameWave" | "frostArmor" | "elementalStorm" | "earthSpike" | "voidRift"
  // Necromancer
  | "summonSkeleton" | "lifeDrain" | "boneShield" | "plague" | "corpseExplode" | "soulHarvest";

export interface AbilityDef {
  id: string;
  key: string;
  name: string;
  desc: string;
  kind: AbilityKind;
  cooldownMs: number;
  color: number;
  cost: number;        // 0 = starter (free)
}

// Each class has 6 abilities. Index 0 is the free starter. The other 5
// are purchased with gold and can be equipped into 4 loadout slots.
export const ABILITIES: Record<ClassId, AbilityDef[]> = {
  melee: [
    { id:"whirl", key:"1", name:"Redemoinho",   desc:"Golpeia todos os inimigos ao redor.", kind:"whirlwind",  cooldownMs:5000,  color:0xf59e0b, cost:0 },
    { id:"chrg",  key:"2", name:"Investida",    desc:"Avança até 4 tiles empurrando inimigos.", kind:"charge", cooldownMs:6000,  color:0xf97316, cost:150 },
    { id:"cry",   key:"3", name:"Grito de Guerra",desc:"Aumenta seu ataque por 8s e cura.", kind:"warcry",     cooldownMs:15000, color:0xfbbf24, cost:400 },
    { id:"quake", key:"4", name:"Terremoto",    desc:"Atordoa e fere inimigos em 3 tiles.", kind:"earthquake", cooldownMs:12000, color:0xb45309, cost:800 },
    { id:"shock", key:"5", name:"Onda de Choque",desc:"Cone frontal de energia que empurra e atordoa em linha (4 tiles).", kind:"shockwave", cooldownMs:9000, color:0xfde68a, cost:1200 },
    { id:"blust", key:"6", name:"Sede de Sangue",desc:"Por 8s, cura 25% de todo dano causado.", kind:"bloodlust", cooldownMs:16000, color:0xdc2626, cost:1800 },
  ],
  archer: [
    { id:"multi", key:"1", name:"Múltiplos Tiros",desc:"Dispara 3 flechas em leque.", kind:"multishot",         cooldownMs:4000,  color:0x22c55e, cost:0 },
    { id:"pier",  key:"2", name:"Flecha Perfurante",desc:"Flecha reta que atravessa alvos.", kind:"piercing",   cooldownMs:5000,  color:0x84cc16, cost:150 },
    { id:"trap",  key:"3", name:"Armadilha",    desc:"Coloca uma armadilha que causa dano.", kind:"trap",       cooldownMs:8000,  color:0xa3e635, cost:400 },
    { id:"rain",  key:"4", name:"Chuva de Flechas",desc:"Chove flechas em área ao seu redor.", kind:"arrowRain",cooldownMs:14000, color:0x14532d, cost:800 },
    { id:"roll",  key:"5", name:"Rolar Evasivo", desc:"Rola 3 tiles para trás e fica invisível por 3s.", kind:"evadeRoll", cooldownMs:7000, color:0xd9f99d, cost:1200 },
    { id:"expar", key:"6", name:"Flecha Explosiva",desc:"Flecha que explode ao impacto (área grande).", kind:"explosiveArrow", cooldownMs:6000, color:0xf97316, cost:1800 },
  ],
  mage: [
    { id:"fire",  key:"1", name:"Bola de Fogo", desc:"Projétil explosivo em área.", kind:"fireball",           cooldownMs:4000,  color:0xef4444, cost:0 },
    { id:"nova",  key:"2", name:"Nova de Gelo", desc:"Explosão gélida ao redor.", kind:"iceNova",              cooldownMs:6000,  color:0x38bdf8, cost:150 },
    { id:"blink", key:"3", name:"Teleporte",    desc:"Pisca até 5 tiles na direção.", kind:"blink",            cooldownMs:9000,  color:0xa78bfa, cost:400 },
    { id:"met",   key:"4", name:"Meteoro",      desc:"Faz um meteoro cair no inimigo mais próximo.", kind:"meteor",cooldownMs:15000,color:0xdc2626, cost:800 },
    { id:"orb",   key:"5", name:"Orbe Arcano",  desc:"Orbe orbita você por 8s causando dano em contato.", kind:"arcaneOrb", cooldownMs:12000, color:0xa78bfa, cost:1200 },
    { id:"mshld", key:"6", name:"Escudo Arcano",desc:"Absorve 60% do dano por 6s e libera raios ao ser atingido.", kind:"manaShield", cooldownMs:14000, color:0x60a5fa, cost:1800 },
  ],
  paladin: [
    { id:"pshield", key:"1", name:"Escudo Sagrado", desc:"Reduz o dano recebido em 70% por 6s.", kind:"holyShield",   cooldownMs:12000, color:0xfde047, cost:0 },
    { id:"phammer", key:"2", name:"Martelo de Luz", desc:"Golpe frontal atordoante em cone.",   kind:"hammerOfLight", cooldownMs:5000,  color:0xfacc15, cost:150 },
    { id:"pcons",   key:"3", name:"Consagrar",      desc:"Terra sagrada queima inimigos por 6s.",kind:"consecrate",   cooldownMs:10000, color:0xfef08a, cost:400 },
    { id:"pheal",   key:"4", name:"Cura Divina",    desc:"Cura você totalmente e minions.",     kind:"divineHeal",   cooldownMs:20000, color:0xffffff, cost:800 },
    { id:"pjudge",  key:"5", name:"Julgamento",     desc:"Raio de luz vertical em todos inimigos em 4 tiles.", kind:"judgment", cooldownMs:11000, color:0xfef3c7, cost:1200 },
    { id:"pwings",  key:"6", name:"Asas do Vingador",desc:"Voa até o inimigo mais próximo e explode em luz.", kind:"avengerWings", cooldownMs:10000, color:0xfef08a, cost:1800 },
  ],
  assassin: [
    { id:"adash",  key:"1", name:"Investida Fatal",desc:"Dash de 4 tiles + crítico no alvo.",   kind:"dashStrike",   cooldownMs:5000,  color:0xef4444, cost:0 },
    { id:"ashadow",key:"2", name:"Passo Sombra",   desc:"Fica invisível por 4s. Próximo golpe crítico.", kind:"shadowStep", cooldownMs:11000, color:0x1e1b4b, cost:150 },
    { id:"apoison",key:"3", name:"Lâmina Envenenada",desc:"Envenena inimigos ao redor (DoT).", kind:"poisonBlade",   cooldownMs:8000,  color:0x84cc16, cost:400 },
    { id:"afury",  key:"4", name:"Fúria de Lâminas",desc:"6 ataques rápidos em qualquer direção.",kind:"bladeFury",  cooldownMs:14000, color:0xdc2626, cost:800 },
    { id:"asmoke", key:"5", name:"Bomba de Fumaça",desc:"Cega inimigos em 3x3 por 4s, você fica invisível.", kind:"smokeBomb", cooldownMs:10000, color:0x475569, cost:1200 },
    { id:"amark",  key:"6", name:"Marca Mortal",   desc:"Marca alvo; se morrer em 5s, explode veneno.", kind:"deathMark", cooldownMs:12000, color:0x7f1d1d, cost:1800 },
  ],
  berserker: [
    { id:"brage", key:"1", name:"Fúria Berserker",desc:"Vira ×2 dano por 6s (perde defesa).",  kind:"berserkRage",   cooldownMs:14000, color:0xdc2626, cost:0 },
    { id:"baxe",  key:"2", name:"Machado Sangrento",desc:"Golpe frontal que drena vida.",       kind:"bloodAxe",      cooldownMs:5000,  color:0x991b1b, cost:150 },
    { id:"bslam", key:"3", name:"Impacto Sísmico", desc:"Salto que atordoa em área grande.",    kind:"quakeSlam",     cooldownMs:11000, color:0x92400e, cost:400 },
    { id:"breck", key:"4", name:"Investida Cega",  desc:"Ataca todos ao redor 3× ignorando defesa.", kind:"reckless",  cooldownMs:16000, color:0xf59e0b, cost:800 },
    { id:"bbann", key:"5", name:"Estandarte de Guerra",desc:"+40% dano seu por 10s (buff pessoal).", kind:"warBanner", cooldownMs:18000, color:0xf59e0b, cost:1200 },
    { id:"bfren", key:"6", name:"Frenesi",         desc:"Ataca 4× cada inimigo adjacente em rajada.", kind:"frenzy", cooldownMs:9000, color:0xdc2626, cost:1800 },
  ],
  elementalist: [
    { id:"echain",key:"1", name:"Raio em Cadeia", desc:"Salta entre 5 inimigos próximos.",     kind:"chainLightning",cooldownMs:6000,  color:0x38bdf8, cost:0 },
    { id:"eflame",key:"2", name:"Onda de Chamas", desc:"Cone de fogo à frente.",               kind:"flameWave",     cooldownMs:5000,  color:0xf97316, cost:150 },
    { id:"efrost",key:"3", name:"Armadura Gélida",desc:"Congela quem te atacar por 8s.",       kind:"frostArmor",    cooldownMs:15000, color:0x60a5fa, cost:400 },
    { id:"estorm",key:"4", name:"Tempestade Elemental",desc:"Rain fogo/gelo/raio em área.",     kind:"elementalStorm",cooldownMs:20000, color:0x8b5cf6, cost:800 },
    { id:"espike",key:"5", name:"Estacas de Terra",desc:"Estacas rochosas empalam em linha (5 tiles) atordoando.", kind:"earthSpike", cooldownMs:8000, color:0xb45309, cost:1200 },
    { id:"erift", key:"6", name:"Fenda do Vazio", desc:"Fenda que puxa inimigos ao centro e implode em dano massivo.", kind:"voidRift", cooldownMs:16000, color:0x581c87, cost:1800 },
  ],
  necromancer: [
    { id:"nsummon",key:"1",name:"Invocar Esqueleto",desc:"Esqueleto puxa aggro e ataca por você. Metade do seu dano.", kind:"summonSkeleton", cooldownMs:12000, color:0xe5e7eb, cost:0 },
    { id:"ndrain", key:"2",name:"Drenar Vida",     desc:"Feixe de sombra que rouba vida do inimigo.", kind:"lifeDrain", cooldownMs:6000,  color:0x7c3aed, cost:150 },
    { id:"nbone",  key:"3",name:"Escudo de Ossos", desc:"Círculo de ossos absorve 60% do dano por 8s.", kind:"boneShield", cooldownMs:14000, color:0xd1d5db, cost:400 },
    { id:"nplague",key:"4",name:"Praga",           desc:"Peste em área que se espalha entre inimigos.", kind:"plague",   cooldownMs:16000, color:0x14532d, cost:800 },
    { id:"nexpl",  key:"5",name:"Explodir Cadáveres",desc:"Detona TODOS os inimigos abaixo de 30% HP em ossos.", kind:"corpseExplode", cooldownMs:11000, color:0xf3f4f6, cost:1200 },
    { id:"nharv",  key:"6",name:"Colheita de Almas",desc:"Rouba vida de todos inimigos em 3 tiles. Cura muito.", kind:"soulHarvest", cooldownMs:13000, color:0x7c3aed, cost:1800 },
  ],
};

// ---------- Monsters ----------
export interface MonsterDef {
  id: string;
  name: string;
  // Sprite sheet identifier. "slime"/"goblin"/"crimson_wyrm" plus any of the
  // dedicated enemy-*.png sheets. Falls back to "goblin" if the sheet key
  // is not registered in the engine's sheet map.
  sprite: string;
  baseHp: number;
  baseDamage: number;
  baseXp: number;
  aggroRadius: number;
  stepMs: number;
  tint?: number;
}

export const MONSTERS: Record<string, MonsterDef> = {
  slime:        { id:"slime",        name:"Slime do Pântano",   sprite:"slime",  baseHp:12, baseDamage:2, baseXp:8,   aggroRadius:4, stepMs:420 },
  meadow_goblin:{ id:"meadow_goblin",name:"Goblin do Prado",    sprite:"goblin", baseHp:20, baseDamage:4, baseXp:14,  aggroRadius:5, stepMs:340 },
  wolf:         { id:"wolf",         name:"Lobo da Bruma",      sprite:"goblin", baseHp:32, baseDamage:6, baseXp:26,  aggroRadius:7, stepMs:240, tint:0x8a8f99 },
  forest_slime: { id:"forest_slime", name:"Musgo Vivo",         sprite:"slime",  baseHp:28, baseDamage:5, baseXp:22,  aggroRadius:4, stepMs:360, tint:0x4ade80 },
  scorpion:     { id:"scorpion",     name:"Escorpião de Areia", sprite:"slime",  baseHp:44, baseDamage:8, baseXp:44,  aggroRadius:5, stepMs:320, tint:0xd4a256 },
  desert_goblin:{ id:"desert_goblin",name:"Nômade Rachado",     sprite:"goblin", baseHp:52, baseDamage:9, baseXp:50,  aggroRadius:6, stepMs:280, tint:0xf59e0b },
  ice_wraith:   { id:"ice_wraith",   name:"Espectro Glacial",   sprite:"slime",  baseHp:60, baseDamage:10,baseXp:64,  aggroRadius:6, stepMs:340, tint:0x7dd3fc },
  frost_wolf:   { id:"frost_wolf",   name:"Lobo Gélido",        sprite:"goblin", baseHp:70, baseDamage:12,baseXp:76,  aggroRadius:7, stepMs:230, tint:0xdbeafe },
  fire_imp:     { id:"fire_imp",     name:"Ímpio das Chamas",   sprite:"goblin", baseHp:80, baseDamage:14,baseXp:92,  aggroRadius:6, stepMs:260, tint:0xf97316 },
  magma_slime:  { id:"magma_slime",  name:"Slime de Magma",     sprite:"slime",  baseHp:110,baseDamage:12,baseXp:100, aggroRadius:4, stepMs:380, tint:0xdc2626 },
  ruin_ghoul:   { id:"ruin_ghoul",   name:"Ghoul das Ruínas",   sprite:"goblin", baseHp:130,baseDamage:16,baseXp:130, aggroRadius:6, stepMs:280, tint:0x14b8a6 },
  deep_slime:   { id:"deep_slime",   name:"Anêmona Abissal",    sprite:"slime",  baseHp:150,baseDamage:14,baseXp:140, aggroRadius:5, stepMs:360, tint:0x0ea5e9 },
  crystal_golem:{ id:"crystal_golem",name:"Golem de Cristal",   sprite:"goblin", baseHp:200,baseDamage:20,baseXp:200, aggroRadius:5, stepMs:320, tint:0xa78bfa },
  crystal_slime:{ id:"crystal_slime",name:"Slime Prismático",   sprite:"slime",  baseHp:170,baseDamage:16,baseXp:180, aggroRadius:4, stepMs:380, tint:0xe879f9 },

  bog_toad:      { id:"bog_toad",      name:"Sapo do Charco",     sprite:"bog_toad",  baseHp:55, baseDamage:9,  baseXp:58,  aggroRadius:5, stepMs:400, tint:0x65a30d },
  marsh_witch:   { id:"marsh_witch",   name:"Bruxa do Pântano",   sprite:"marsh_witch", baseHp:68, baseDamage:12, baseXp:78,  aggroRadius:7, stepMs:300, tint:0x84cc16 },
  vine_beast:    { id:"vine_beast",    name:"Fera das Vinhas",    sprite:"vine_beast", baseHp:95, baseDamage:14, baseXp:104, aggroRadius:6, stepMs:270, tint:0x16a34a },
  jungle_serpent:{ id:"jungle_serpent",name:"Serpente Esmeralda", sprite:"jungle_serpent",  baseHp:82, baseDamage:15, baseXp:98,  aggroRadius:6, stepMs:320, tint:0x059669 },
  sky_sprite:    { id:"sky_sprite",    name:"Fada da Tempestade", sprite:"sky_sprite",  baseHp:120,baseDamage:16, baseXp:132, aggroRadius:7, stepMs:260, tint:0xfde68a },
  storm_eagle:   { id:"storm_eagle",   name:"Águia da Tormenta",  sprite:"storm_eagle", baseHp:140,baseDamage:18, baseXp:150, aggroRadius:8, stepMs:210, tint:0xe0e7ff },
  void_stalker:  { id:"void_stalker",  name:"Espreitador do Vazio",sprite:"void_stalker",baseHp:210,baseDamage:24, baseXp:220, aggroRadius:7, stepMs:250, tint:0x312e81 },
  shadow_hound:  { id:"shadow_hound",  name:"Cão das Sombras",    sprite:"shadow_hound", baseHp:180,baseDamage:22, baseXp:200, aggroRadius:8, stepMs:220, tint:0x1e1b4b },
  abyss_slime:   { id:"abyss_slime",   name:"Slime do Vazio",     sprite:"abyss_slime",  baseHp:240,baseDamage:20, baseXp:240, aggroRadius:5, stepMs:360, tint:0x4c1d95 },
  bone_knight:   { id:"bone_knight",   name:"Cavaleiro de Osso",  sprite:"bone_knight", baseHp:160,baseDamage:19, baseXp:170, aggroRadius:6, stepMs:290, tint:0xf5f5f4 },

  spore_walker:  { id:"spore_walker",  name:"Andarilho de Esporos",sprite:"spore_walker",baseHp:90, baseDamage:13, baseXp:96,  aggroRadius:6, stepMs:300, tint:0xdc2626 },
  myco_slime:    { id:"myco_slime",    name:"Slime Micélio",      sprite:"slime",  baseHp:75, baseDamage:11, baseXp:82,  aggroRadius:4, stepMs:400, tint:0xf59e0b },
  cog_sentinel:  { id:"cog_sentinel",  name:"Sentinela Engrenagem",sprite:"cog_sentinel",baseHp:220,baseDamage:22, baseXp:220, aggroRadius:6, stepMs:280, tint:0xb45309 },
  brass_slime:   { id:"brass_slime",   name:"Ooze de Bronze",     sprite:"slime",  baseHp:190,baseDamage:18, baseXp:190, aggroRadius:4, stepMs:360, tint:0xca8a04 },
  lantern_maw:   { id:"lantern_maw",   name:"Bocarra Lanterna",   sprite:"lantern_maw",  baseHp:260,baseDamage:24, baseXp:260, aggroRadius:6, stepMs:340, tint:0x0891b2 },
  reef_shade:    { id:"reef_shade",    name:"Sombra do Recife",   sprite:"goblin", baseHp:230,baseDamage:22, baseXp:240, aggroRadius:7, stepMs:250, tint:0x155e75 },
  cinder_fiend:  { id:"cinder_fiend",  name:"Cinzento Infernal",  sprite:"cinder_fiend", baseHp:300,baseDamage:28, baseXp:300, aggroRadius:7, stepMs:240, tint:0xdc2626 },
  ember_slime:   { id:"ember_slime",   name:"Slime Brasa",        sprite:"slime",  baseHp:270,baseDamage:24, baseXp:280, aggroRadius:5, stepMs:340, tint:0xea580c },
  shard_widow:   { id:"shard_widow",   name:"Viúva de Cristal",   sprite:"shard_widow", baseHp:340,baseDamage:30, baseXp:340, aggroRadius:7, stepMs:230, tint:0x7c3aed },
  prism_slime:   { id:"prism_slime",   name:"Slime Fractal",      sprite:"slime",  baseHp:310,baseDamage:26, baseXp:320, aggroRadius:5, stepMs:340, tint:0xc084fc },

  // ---- 10 NEW BIOMES × 1 new signature monster each (some biomes reuse existing sprite w/ new tint) ----
  frost_reaver:  { id:"frost_reaver",  name:"Ceifeiro Congelado", sprite:"goblin", baseHp:360,baseDamage:32, baseXp:360, aggroRadius:7, stepMs:240, tint:0xbae6fd },
  sunken_priest: { id:"sunken_priest", name:"Sacerdote Afogado",  sprite:"goblin", baseHp:380,baseDamage:30, baseXp:380, aggroRadius:8, stepMs:270, tint:0x0e7490 },
  neon_ripper:   { id:"neon_ripper",   name:"Ceifador Neon",      sprite:"goblin", baseHp:400,baseDamage:36, baseXp:420, aggroRadius:8, stepMs:220, tint:0xec4899 },
  bloodmoon_bat: { id:"bloodmoon_bat", name:"Morcego Sangue-Lua", sprite:"slime",  baseHp:340,baseDamage:34, baseXp:400, aggroRadius:8, stepMs:200, tint:0x991b1b },
  celestial_seer:{ id:"celestial_seer",name:"Vidente Celeste",    sprite:"goblin", baseHp:460,baseDamage:38, baseXp:460, aggroRadius:9, stepMs:260, tint:0xfef3c7 },
  ashen_wight:   { id:"ashen_wight",   name:"Aparição Cinza",     sprite:"slime",  baseHp:420,baseDamage:34, baseXp:440, aggroRadius:6, stepMs:300, tint:0x71717a },
  gloom_husk:    { id:"gloom_husk",    name:"Casca Umbrível",     sprite:"goblin", baseHp:490,baseDamage:40, baseXp:500, aggroRadius:7, stepMs:250, tint:0x27272a },
  mireborn:      { id:"mireborn",      name:"Nascido do Lodo",    sprite:"slime",  baseHp:510,baseDamage:38, baseXp:520, aggroRadius:6, stepMs:320, tint:0x365314 },
  runic_titan:   { id:"runic_titan",   name:"Titã Rúnico",        sprite:"goblin", baseHp:640,baseDamage:44, baseXp:600, aggroRadius:6, stepMs:300, tint:0x1e40af },
  void_hydra:    { id:"void_hydra",    name:"Hidra do Vazio",     sprite:"slime",  baseHp:720,baseDamage:48, baseXp:700, aggroRadius:8, stepMs:320, tint:0x581c87 },

  // ============ 10 NEW BIOMES × 3 UNIQUE ENEMIES each = 30 new enemies ============
  // Crimson Dunes
  crimson_wyrm:  { id:"crimson_wyrm",  name:"Wyrm Escarlate",     sprite:"crimson_wyrm", baseHp:520,baseDamage:36, baseXp:520, aggroRadius:7, stepMs:280 },
  dune_stalker:  { id:"dune_stalker",  name:"Espreitador de Duna",sprite:"goblin", baseHp:440,baseDamage:34, baseXp:460, aggroRadius:8, stepMs:220, tint:0xb91c1c },
  bone_scarab:   { id:"bone_scarab",   name:"Escaravelho Ossório",sprite:"slime",  baseHp:380,baseDamage:30, baseXp:400, aggroRadius:5, stepMs:340, tint:0xf87171 },
  // Obsidian Reef
  obsidian_shark:{ id:"obsidian_shark",name:"Tubarão Obsidiana",  sprite:"goblin", baseHp:560,baseDamage:40, baseXp:560, aggroRadius:8, stepMs:210, tint:0x0f172a },
  molten_medusa: { id:"molten_medusa", name:"Medusa Magma",       sprite:"slime",  baseHp:480,baseDamage:36, baseXp:480, aggroRadius:6, stepMs:320, tint:0xf97316 },
  reef_leviathan:{ id:"reef_leviathan",name:"Leviatã do Recife",  sprite:"goblin", baseHp:700,baseDamage:44, baseXp:700, aggroRadius:7, stepMs:290, tint:0x1e3a8a },
  // Seraph Grove
  seraph_guard:  { id:"seraph_guard",  name:"Guardião Serafim",   sprite:"goblin", baseHp:600,baseDamage:38, baseXp:580, aggroRadius:7, stepMs:270, tint:0xfef3c7 },
  gilded_stag:   { id:"gilded_stag",   name:"Cervo Dourado",      sprite:"goblin", baseHp:520,baseDamage:32, baseXp:520, aggroRadius:6, stepMs:230, tint:0xfbbf24 },
  ivory_wisp:    { id:"ivory_wisp",    name:"Fátuo Ebúrneo",      sprite:"slime",  baseHp:400,baseDamage:34, baseXp:440, aggroRadius:8, stepMs:300, tint:0xfffbeb },
  // Thunderveil
  storm_djinn:   { id:"storm_djinn",   name:"Djinn da Tormenta",  sprite:"goblin", baseHp:620,baseDamage:42, baseXp:640, aggroRadius:8, stepMs:220, tint:0x60a5fa },
  volt_hound:    { id:"volt_hound",    name:"Cão Voltaico",       sprite:"goblin", baseHp:500,baseDamage:36, baseXp:500, aggroRadius:8, stepMs:200, tint:0xa5f3fc },
  arc_slime:     { id:"arc_slime",     name:"Slime de Arco",      sprite:"slime",  baseHp:460,baseDamage:32, baseXp:460, aggroRadius:5, stepMs:340, tint:0xfde047 },
  // Glass Desert
  shard_bandit:  { id:"shard_bandit",  name:"Bandido de Vidro",   sprite:"goblin", baseHp:580,baseDamage:40, baseXp:560, aggroRadius:7, stepMs:250, tint:0xe0e7ff },
  mirror_wraith: { id:"mirror_wraith", name:"Espectro Espelhado", sprite:"slime",  baseHp:520,baseDamage:38, baseXp:520, aggroRadius:6, stepMs:310, tint:0xf1f5f9 },
  glass_hydra:   { id:"glass_hydra",   name:"Hidra Cristalina",   sprite:"slime",  baseHp:660,baseDamage:44, baseXp:660, aggroRadius:6, stepMs:330, tint:0x93c5fd },
  // Mirror Lake
  silver_koi:    { id:"silver_koi",    name:"Koi Prateado",       sprite:"slime",  baseHp:500,baseDamage:36, baseXp:500, aggroRadius:5, stepMs:320, tint:0xd4d4d8 },
  reflect_knight:{ id:"reflect_knight",name:"Cavaleiro Reflexo",  sprite:"goblin", baseHp:640,baseDamage:42, baseXp:640, aggroRadius:6, stepMs:270, tint:0xe5e7eb },
  mirage_witch:  { id:"mirage_witch",  name:"Bruxa Miragem",      sprite:"goblin", baseHp:560,baseDamage:40, baseXp:580, aggroRadius:8, stepMs:290, tint:0xa1a1aa },
  // Plasma Bog
  plasma_ooze:   { id:"plasma_ooze",   name:"Gosma de Plasma",    sprite:"slime",  baseHp:540,baseDamage:38, baseXp:540, aggroRadius:5, stepMs:340, tint:0xc084fc },
  neon_toad:     { id:"neon_toad",     name:"Sapo Neon",          sprite:"slime",  baseHp:460,baseDamage:34, baseXp:460, aggroRadius:5, stepMs:360, tint:0xa855f7 },
  void_leech:    { id:"void_leech",    name:"Sanguessuga Vazia",  sprite:"goblin", baseHp:580,baseDamage:40, baseXp:580, aggroRadius:7, stepMs:260, tint:0x7e22ce },
  // Honeycomb Hive
  queen_drone:   { id:"queen_drone",   name:"Rainha Zangão",      sprite:"goblin", baseHp:700,baseDamage:44, baseXp:700, aggroRadius:8, stepMs:230, tint:0xfacc15 },
  wax_golem:     { id:"wax_golem",     name:"Golem de Cera",      sprite:"goblin", baseHp:620,baseDamage:38, baseXp:620, aggroRadius:5, stepMs:320, tint:0xfef08a },
  honey_slime:   { id:"honey_slime",   name:"Slime de Mel",       sprite:"slime",  baseHp:520,baseDamage:34, baseXp:520, aggroRadius:5, stepMs:360, tint:0xeab308 },
  // Cursed Orchard
  rotten_ent:    { id:"rotten_ent",    name:"Ente Podre",         sprite:"goblin", baseHp:660,baseDamage:42, baseXp:660, aggroRadius:6, stepMs:290, tint:0x7f1d1d },
  crow_lord:     { id:"crow_lord",     name:"Senhor dos Corvos",  sprite:"goblin", baseHp:560,baseDamage:40, baseXp:580, aggroRadius:8, stepMs:220, tint:0x1c1917 },
  worm_king:     { id:"worm_king",     name:"Rei dos Vermes",     sprite:"slime",  baseHp:600,baseDamage:38, baseXp:600, aggroRadius:5, stepMs:340, tint:0x991b1b },
  // Cosmic Bazaar
  starweaver:    { id:"starweaver",    name:"Tecelã Estelar",     sprite:"goblin", baseHp:780,baseDamage:48, baseXp:780, aggroRadius:8, stepMs:260, tint:0xa78bfa },
  cosmic_slime:  { id:"cosmic_slime",  name:"Slime Cósmico",      sprite:"slime",  baseHp:700,baseDamage:44, baseXp:720, aggroRadius:5, stepMs:340, tint:0x6366f1 },
  singularity:   { id:"singularity",   name:"Singularidade",      sprite:"slime",  baseHp:900,baseDamage:52, baseXp:900, aggroRadius:9, stepMs:320, tint:0x1e1b4b },

  // ============ 10 NEW ENDGAME BIOMES (Lv 75+) × 2 UNIQUE ENEMIES each ============
  // Sunspire (tier 75)
  solar_herald:  { id:"solar_herald",  name:"Arauto Solar",       sprite:"goblin", baseHp:1400,baseDamage:70,baseXp:1200,aggroRadius:8, stepMs:230, tint:0xfacc15 },
  gilded_pyre:   { id:"gilded_pyre",   name:"Pira Dourada",       sprite:"slime",  baseHp:1200,baseDamage:64,baseXp:1100,aggroRadius:5, stepMs:340, tint:0xf59e0b },
  // Moonshade (tier 78)
  lunar_seer:    { id:"lunar_seer",    name:"Vidente Lunar",      sprite:"goblin", baseHp:1500,baseDamage:72,baseXp:1300,aggroRadius:8, stepMs:260, tint:0xbfdbfe },
  moon_wraith:   { id:"moon_wraith",   name:"Espectro Lunar",     sprite:"slime",  baseHp:1300,baseDamage:66,baseXp:1200,aggroRadius:6, stepMs:320, tint:0x93c5fd },
  // Stormforge (tier 82)
  arc_titan:     { id:"arc_titan",     name:"Titã do Arco",       sprite:"goblin", baseHp:1800,baseDamage:80,baseXp:1500,aggroRadius:7, stepMs:280, tint:0x22d3ee },
  volt_slime:    { id:"volt_slime",    name:"Slime Voltaico",     sprite:"slime",  baseHp:1500,baseDamage:72,baseXp:1300,aggroRadius:5, stepMs:320, tint:0xfde047 },
  // Dreamweave (tier 85)
  dream_eater:   { id:"dream_eater",   name:"Devora-Sonhos",      sprite:"goblin", baseHp:1900,baseDamage:82,baseXp:1600,aggroRadius:8, stepMs:250, tint:0xf9a8d4 },
  candy_horror:  { id:"candy_horror",  name:"Horror de Doce",     sprite:"slime",  baseHp:1600,baseDamage:74,baseXp:1400,aggroRadius:5, stepMs:340, tint:0xf472b6 },
  // Bone Wastes (tier 88)
  bone_colossus: { id:"bone_colossus", name:"Colosso de Osso",    sprite:"goblin", baseHp:2200,baseDamage:88,baseXp:1800,aggroRadius:6, stepMs:300, tint:0xf5f5f4 },
  skull_swarm:   { id:"skull_swarm",   name:"Enxame de Caveiras", sprite:"slime",  baseHp:1700,baseDamage:78,baseXp:1500,aggroRadius:6, stepMs:280, tint:0xe7e5e4 },
  // Venom Grove (tier 90)
  toxic_hydra:   { id:"toxic_hydra",   name:"Hidra Tóxica",       sprite:"goblin", baseHp:2400,baseDamage:92,baseXp:1900,aggroRadius:7, stepMs:290, tint:0x84cc16 },
  spore_titan:   { id:"spore_titan",   name:"Titã de Esporos",    sprite:"slime",  baseHp:2000,baseDamage:84,baseXp:1700,aggroRadius:5, stepMs:340, tint:0x65a30d },
  // Magma Core (tier 92)
  magma_lord:    { id:"magma_lord",    name:"Lorde do Magma",     sprite:"goblin", baseHp:2600,baseDamage:96,baseXp:2000,aggroRadius:7, stepMs:280, tint:0xdc2626 },
  obsidian_wyrm: { id:"obsidian_wyrm", name:"Wyrm de Obsidiana",  sprite:"slime",  baseHp:2200,baseDamage:88,baseXp:1800,aggroRadius:6, stepMs:320, tint:0x18181b },
  // Astral Void (tier 95)
  star_devourer: { id:"star_devourer", name:"Devorador de Astros",sprite:"goblin", baseHp:2800,baseDamage:100,baseXp:2200,aggroRadius:8,stepMs:260, tint:0xa78bfa },
  void_wisp:     { id:"void_wisp",     name:"Fátuo do Vazio",     sprite:"slime",  baseHp:2400,baseDamage:92,baseXp:2000,aggroRadius:6, stepMs:320, tint:0x6366f1 },
  // Nightmare Gate (tier 98)
  nightmare_king:{ id:"nightmare_king",name:"Rei do Pesadelo",    sprite:"goblin", baseHp:3200,baseDamage:110,baseXp:2500,aggroRadius:8,stepMs:250, tint:0x7f1d1d },
  flesh_horror:  { id:"flesh_horror",  name:"Horror de Carne",    sprite:"slime",  baseHp:2800,baseDamage:100,baseXp:2200,aggroRadius:6,stepMs:320, tint:0x991b1b },
  // Titan Ruins (tier 100)
  fallen_titan:  { id:"fallen_titan",  name:"Titã Caído",         sprite:"goblin", baseHp:3600,baseDamage:120,baseXp:2800,aggroRadius:7,stepMs:300, tint:0x9ca3af },
  rune_guardian: { id:"rune_guardian", name:"Guardião Rúnico",    sprite:"slime",  baseHp:3000,baseDamage:108,baseXp:2400,aggroRadius:5,stepMs:340, tint:0x1e40af },



  // ============ NEW SIGNATURE ENEMIES (1 per biome, unique sprite mapping) ============
  meadow_dryad:    { id:"meadow_dryad", name:"Dríade do Prado", sprite:"vine_beast", baseHp:30, baseDamage:6, baseXp:20, aggroRadius:6, stepMs:320, tint:0x86efac },
  forest_stalker:  { id:"forest_stalker", name:"Espreitador da Mata", sprite:"shadow_hound", baseHp:50, baseDamage:9, baseXp:44, aggroRadius:7, stepMs:250, tint:0x14532d },
  sand_lurker:     { id:"sand_lurker", name:"Espreitador de Areia", sprite:"spore_walker", baseHp:66, baseDamage:11, baseXp:60, aggroRadius:6, stepMs:280, tint:0xfbbf24 },
  glacial_hunter:  { id:"glacial_hunter", name:"Caçador Glacial", sprite:"storm_eagle", baseHp:88, baseDamage:14, baseXp:88, aggroRadius:7, stepMs:240, tint:0xdbeafe },
  cinder_wretch:   { id:"cinder_wretch", name:"Miserável de Brasa", sprite:"cinder_fiend", baseHp:120, baseDamage:18, baseXp:124, aggroRadius:7, stepMs:260, tint:0xf97316 },
  ruin_wraith:     { id:"ruin_wraith", name:"Espectro das Ruínas", sprite:"bone_knight", baseHp:160, baseDamage:22, baseXp:180, aggroRadius:6, stepMs:280, tint:0x0d9488 },
  prism_widow:     { id:"prism_widow", name:"Viúva Prismática", sprite:"shard_widow", baseHp:220, baseDamage:26, baseXp:240, aggroRadius:7, stepMs:260, tint:0xe879f9 },
  bog_shaman:      { id:"bog_shaman", name:"Xamã do Charco", sprite:"marsh_witch", baseHp:80, baseDamage:13, baseXp:90, aggroRadius:7, stepMs:300, tint:0x4d7c0f },
  canopy_wyrm:     { id:"canopy_wyrm", name:"Wyrm da Copa", sprite:"jungle_serpent", baseHp:130, baseDamage:17, baseXp:150, aggroRadius:6, stepMs:300, tint:0x15803d },
  cirrus_seraph:   { id:"cirrus_seraph", name:"Serafim de Cirro", sprite:"sky_sprite", baseHp:170, baseDamage:20, baseXp:190, aggroRadius:8, stepMs:240, tint:0xe0f2fe },
  abyss_horror:    { id:"abyss_horror", name:"Horror Abissal", sprite:"void_stalker", baseHp:260, baseDamage:28, baseXp:300, aggroRadius:8, stepMs:260, tint:0x1e1b4b },
  spore_matron:    { id:"spore_matron", name:"Matrona de Esporos", sprite:"spore_walker", baseHp:120, baseDamage:16, baseXp:140, aggroRadius:6, stepMs:300, tint:0xa16207 },
  cog_engineer:    { id:"cog_engineer", name:"Engenheiro Corrompido", sprite:"cog_sentinel", baseHp:260, baseDamage:25, baseXp:270, aggroRadius:6, stepMs:280, tint:0x9a3412 },
  lantern_wretch:  { id:"lantern_wretch", name:"Bocarra Lanterna Chefe", sprite:"lantern_maw", baseHp:320, baseDamage:29, baseXp:330, aggroRadius:7, stepMs:320, tint:0x0e7490 },
  cinder_titan:    { id:"cinder_titan", name:"Titã de Brasa", sprite:"cinder_fiend", baseHp:360, baseDamage:33, baseXp:380, aggroRadius:7, stepMs:260, tint:0xea580c },
  shard_matron:    { id:"shard_matron", name:"Matrona de Cristal", sprite:"shard_widow", baseHp:400, baseDamage:36, baseXp:420, aggroRadius:7, stepMs:260, tint:0x8b5cf6 },
  glacier_lord:    { id:"glacier_lord", name:"Lorde da Geleira", sprite:"storm_eagle", baseHp:440, baseDamage:40, baseXp:460, aggroRadius:7, stepMs:250, tint:0x60a5fa },
  tide_prophet:    { id:"tide_prophet", name:"Profeta da Maré", sprite:"lantern_maw", baseHp:460, baseDamage:38, baseXp:480, aggroRadius:7, stepMs:320, tint:0x0891b2 },
  neon_phantom:    { id:"neon_phantom", name:"Fantasma Neon", sprite:"shadow_hound", baseHp:480, baseDamage:42, baseXp:500, aggroRadius:8, stepMs:220, tint:0xf472b6 },
  moon_reaper:     { id:"moon_reaper", name:"Ceifador Lunar", sprite:"shadow_hound", baseHp:400, baseDamage:40, baseXp:440, aggroRadius:8, stepMs:220, tint:0xb91c1c },
  star_herald:     { id:"star_herald", name:"Arauto Estelar", sprite:"sky_sprite", baseHp:520, baseDamage:42, baseXp:520, aggroRadius:8, stepMs:250, tint:0xfef9c3 },
  ash_reaver:      { id:"ash_reaver", name:"Ceifeiro Cinzento", sprite:"bone_knight", baseHp:460, baseDamage:38, baseXp:480, aggroRadius:6, stepMs:280, tint:0xa8a29e },
  gloom_stalker:   { id:"gloom_stalker", name:"Espreitador da Umbra", sprite:"void_stalker", baseHp:540, baseDamage:44, baseXp:560, aggroRadius:7, stepMs:240, tint:0x0a0a0a },
  mire_toad:       { id:"mire_toad", name:"Sapo Fétido", sprite:"bog_toad", baseHp:90, baseDamage:14, baseXp:100, aggroRadius:5, stepMs:340, tint:0x365314 },
  rune_sentinel:   { id:"rune_sentinel", name:"Sentinela Rúnico", sprite:"cog_sentinel", baseHp:700, baseDamage:48, baseXp:660, aggroRadius:6, stepMs:300, tint:0x1d4ed8 },
  gate_stalker:    { id:"gate_stalker", name:"Espreitador do Portão", sprite:"void_stalker", baseHp:800, baseDamage:52, baseXp:760, aggroRadius:8, stepMs:260, tint:0x581c87 },
  crimson_scarab:  { id:"crimson_scarab", name:"Escaravelho Escarlate", sprite:"crimson_wyrm", baseHp:500, baseDamage:38, baseXp:500, aggroRadius:6, stepMs:280, tint:0xef4444 },
  reef_wyrm:       { id:"reef_wyrm", name:"Wyrm do Recife", sprite:"crimson_wyrm", baseHp:620, baseDamage:42, baseXp:600, aggroRadius:7, stepMs:290, tint:0x0f172a },
  gilded_serpent:  { id:"gilded_serpent", name:"Serpente Dourada", sprite:"jungle_serpent", baseHp:580, baseDamage:40, baseXp:580, aggroRadius:6, stepMs:300, tint:0xf59e0b },
  arc_raptor:      { id:"arc_raptor", name:"Raptor do Arco", sprite:"storm_eagle", baseHp:600, baseDamage:44, baseXp:620, aggroRadius:8, stepMs:220, tint:0x22d3ee },
  glass_widow:     { id:"glass_widow", name:"Viúva de Vidro", sprite:"shard_widow", baseHp:560, baseDamage:42, baseXp:580, aggroRadius:7, stepMs:240, tint:0xbfdbfe },
  mirror_serpent:  { id:"mirror_serpent", name:"Serpente Espelhada", sprite:"jungle_serpent", baseHp:520, baseDamage:40, baseXp:540, aggroRadius:6, stepMs:320, tint:0xe5e7eb },
  plasma_toad:     { id:"plasma_toad", name:"Sapo de Plasma", sprite:"bog_toad", baseHp:500, baseDamage:38, baseXp:500, aggroRadius:5, stepMs:360, tint:0xa855f7 },
  honey_hornet:    { id:"honey_hornet", name:"Vespa Dourada", sprite:"sky_sprite", baseHp:600, baseDamage:42, baseXp:620, aggroRadius:8, stepMs:250, tint:0xfacc15 },
  orchard_wight:   { id:"orchard_wight", name:"Aparição do Pomar", sprite:"shadow_hound", baseHp:580, baseDamage:42, baseXp:600, aggroRadius:7, stepMs:250, tint:0x7f1d1d },
  star_broker:     { id:"star_broker", name:"Corretor Estelar", sprite:"shard_widow", baseHp:740, baseDamage:50, baseXp:760, aggroRadius:8, stepMs:260, tint:0x8b5cf6 },
  solar_wyrm:      { id:"solar_wyrm", name:"Wyrm Solar", sprite:"crimson_wyrm", baseHp:1300, baseDamage:68, baseXp:1200, aggroRadius:7, stepMs:260, tint:0xfbbf24 },
  lunar_wraith:    { id:"lunar_wraith", name:"Espectro Lunar Maior", sprite:"void_stalker", baseHp:1400, baseDamage:70, baseXp:1250, aggroRadius:8, stepMs:260, tint:0xbfdbfe },
  arc_leviathan:   { id:"arc_leviathan", name:"Leviatã do Arco", sprite:"lantern_maw", baseHp:1600, baseDamage:76, baseXp:1400, aggroRadius:7, stepMs:310, tint:0x22d3ee },
  dream_hydra:     { id:"dream_hydra", name:"Hidra Onírica", sprite:"abyss_slime", baseHp:1700, baseDamage:78, baseXp:1500, aggroRadius:7, stepMs:320, tint:0xf472b6 },
  bone_reaver:     { id:"bone_reaver", name:"Ceifeiro Ossário", sprite:"bone_knight", baseHp:2000, baseDamage:84, baseXp:1700, aggroRadius:6, stepMs:290, tint:0xf5f5f4 },
  venom_matron:    { id:"venom_matron", name:"Matrona Venenosa", sprite:"marsh_witch", baseHp:2200, baseDamage:88, baseXp:1800, aggroRadius:7, stepMs:290, tint:0x65a30d },
  magma_hydra:     { id:"magma_hydra", name:"Hidra de Magma", sprite:"crimson_wyrm", baseHp:2400, baseDamage:92, baseXp:1900, aggroRadius:7, stepMs:280, tint:0xdc2626 },
  astral_horror:   { id:"astral_horror", name:"Horror Astral", sprite:"void_stalker", baseHp:2600, baseDamage:96, baseXp:2100, aggroRadius:8, stepMs:260, tint:0x8b5cf6 },
  nightmare_wyrm:  { id:"nightmare_wyrm", name:"Wyrm do Pesadelo", sprite:"abyss_slime", baseHp:3000, baseDamage:104, baseXp:2300, aggroRadius:7, stepMs:310, tint:0x7f1d1d },
  titan_watcher:   { id:"titan_watcher", name:"Observador Titânico", sprite:"bone_knight", baseHp:3400, baseDamage:112, baseXp:2600, aggroRadius:7, stepMs:290, tint:0xd4d4d8 },

  // Training dummy — non-hostile, gives XP per hit, never truly dies.
  training_dummy:{ id:"training_dummy", name:"Boneco de Treino", sprite:"goblin", baseHp:9999, baseDamage:0, baseXp:0, aggroRadius:0, stepMs:99999, tint:0xffffff },
  bank_npc:      { id:"bank_npc",       name:"Banco de Rimhold", sprite:"goblin", baseHp:9999, baseDamage:0, baseXp:0, aggroRadius:0, stepMs:99999, tint:0xffffff },
  blacksmith_npc:{ id:"blacksmith_npc",  name:"Ferreiro de Rimhold", sprite:"goblin", baseHp:9999, baseDamage:0, baseXp:0, aggroRadius:0, stepMs:99999, tint:0xffffff },
  // Skeleton minion (used by necromancer summon; not spawned by biomes)
  skeleton_minion:{ id:"skeleton_minion", name:"Esqueleto Invocado", sprite:"goblin", baseHp:1, baseDamage:1, baseXp:0, aggroRadius:0, stepMs:220, tint:0xffffff },
};

export function scaleMonster(def: MonsterDef, level: number) {
  const f = 1 + (level - 1) * 0.35;
  // Enemies are 2x stronger overall (HP + damage).
  return {
    hp: Math.round(def.baseHp * f * 2),
    damage: Math.round(def.baseDamage * (1 + (level - 1) * 0.3) * 2),
    xp: Math.round(def.baseXp * (1 + (level - 1) * 0.5)),
  };
}

// ---------- Biomes ----------
export interface BiomeSpawn { monster: keyof typeof MONSTERS; weight: number; }
export interface BiomeDef {
  id: string;
  name: string;
  tier: number;
  spawns: BiomeSpawn[];
  bg: string;
  dungeonName: string;
  mapColor: string;
  sunny?: boolean;
}

export const BIOMES: Record<string, BiomeDef> = {
  meadow:  { id:"meadow",  name:"Prado de Rimhold",    tier:1,  bg:"#1a2a1a", dungeonName:"Cripta do Prado",  mapColor:"#7bc47f",
    spawns:[{monster:"slime",weight:6},{monster:"meadow_goblin",weight:4},{monster:"meadow_dryad",weight:4}], sunny:true },
  forest:  { id:"forest",  name:"Floresta dos Sussurros",tier:5,bg:"#0e1a12", dungeonName:"Raízes Profundas",mapColor:"#2f6b3a",
    spawns:[{monster:"wolf",weight:5},{monster:"forest_slime",weight:5},{monster:"forest_stalker",weight:4}] },
  desert:  { id:"desert",  name:"Deserto de Vashra",   tier:10, bg:"#3b2f1a", dungeonName:"Tumba de Vashra", mapColor:"#e5c97a",
    spawns:[{monster:"scorpion",weight:5},{monster:"desert_goblin",weight:5},{monster:"sand_lurker",weight:4}], sunny:true },
  tundra:  { id:"tundra",  name:"Tundra Congelada",    tier:16, bg:"#1e293b", dungeonName:"Fenda de Gelo",   mapColor:"#bfdbfe",
    spawns:[{monster:"ice_wraith",weight:5},{monster:"frost_wolf",weight:5},{monster:"glacial_hunter",weight:4}] },
  volcano: { id:"volcano", name:"Cume Vulcânico",      tier:24, bg:"#2a0e0e", dungeonName:"Forja de Magma",  mapColor:"#dc2626",
    spawns:[{monster:"fire_imp",weight:5},{monster:"magma_slime",weight:4},{monster:"cinder_wretch",weight:4}] },
  ruins:   { id:"ruins",   name:"Ruínas Submersas",    tier:32, bg:"#0b1a1f", dungeonName:"Templo Afundado", mapColor:"#0d9488",
    spawns:[{monster:"ruin_ghoul",weight:5},{monster:"deep_slime",weight:5},{monster:"bone_knight",weight:3},{monster:"ruin_wraith",weight:4}] },
  crystal: { id:"crystal", name:"Cavernas de Cristal", tier:42, bg:"#160b2a", dungeonName:"Núcleo Prismático",mapColor:"#c084fc",
    spawns:[{monster:"crystal_golem",weight:4},{monster:"crystal_slime",weight:5},{monster:"prism_widow",weight:4}] },
  swamp:   { id:"swamp",   name:"Pântano Sombrio",     tier:14, bg:"#14201a", dungeonName:"Covas do Charco", mapColor:"#4d7c0f",
    spawns:[{monster:"bog_toad",weight:5},{monster:"marsh_witch",weight:5},{monster:"bog_shaman",weight:4}] },
  jungle:  { id:"jungle",  name:"Selva Ancestral",     tier:20, bg:"#0a1f14", dungeonName:"Templo Coberto",  mapColor:"#15803d", sunny:true,
    spawns:[{monster:"vine_beast",weight:5},{monster:"jungle_serpent",weight:5},{monster:"canopy_wyrm",weight:4}] },
  sky:     { id:"sky",     name:"Ilhas Celestes",      tier:28, bg:"#1e2a4a", dungeonName:"Torre das Nuvens",mapColor:"#fef3c7", sunny:true,
    spawns:[{monster:"sky_sprite",weight:5},{monster:"storm_eagle",weight:5},{monster:"cirrus_seraph",weight:4}] },
  abyss:   { id:"abyss",   name:"Abismo Sombrio",      tier:38, bg:"#0a0819", dungeonName:"Fenda do Vazio",  mapColor:"#312e81",
    spawns:[{monster:"void_stalker",weight:5},{monster:"shadow_hound",weight:5},{monster:"abyss_slime",weight:4},{monster:"abyss_horror",weight:4}] },

  mycelium: { id:"mycelium", name:"Bosque Micélio",     tier:18, bg:"#1a0f1a", dungeonName:"Rizoma Vermelho", mapColor:"#b91c1c",
    spawns:[{monster:"spore_walker",weight:5},{monster:"myco_slime",weight:5},{monster:"spore_matron",weight:4}] },
  clockwork:{ id:"clockwork",name:"Cidade Engrenagem",  tier:26, bg:"#231a12", dungeonName:"Fábrica Perdida", mapColor:"#b45309",
    spawns:[{monster:"cog_sentinel",weight:5},{monster:"brass_slime",weight:5},{monster:"cog_engineer",weight:4}] },
  abyss_sea:{ id:"abyss_sea",name:"Mar do Abismo",      tier:34, bg:"#061a24", dungeonName:"Fossa Bioluminescente", mapColor:"#0891b2",
    spawns:[{monster:"lantern_maw",weight:5},{monster:"reef_shade",weight:5},{monster:"lantern_wretch",weight:4}] },
  emberlands:{id:"emberlands",name:"Terras de Brasa",   tier:44, bg:"#2a0806", dungeonName:"Coração da Cinza",mapColor:"#ea580c", sunny:true,
    spawns:[{monster:"cinder_fiend",weight:5},{monster:"ember_slime",weight:5},{monster:"cinder_titan",weight:4}] },
  shardveil:{ id:"shardveil", name:"Véu de Cristal",    tier:50, bg:"#1a0b2a", dungeonName:"Reliquário Fractal",mapColor:"#7c3aed",
    spawns:[{monster:"shard_widow",weight:4},{monster:"prism_slime",weight:5},{monster:"shard_matron",weight:4}] },

  // ---------- 10 NEW BIOMES ----------
  frostpeak:    { id:"frostpeak",    name:"Pico Congelado",    tier:36, bg:"#0f1a2a", dungeonName:"Halls de Gelo Eterno",  mapColor:"#93c5fd",
    spawns:[{monster:"frost_reaver",weight:5},{monster:"ice_wraith",weight:3},{monster:"glacier_lord",weight:4}] },
  sunken_temple:{ id:"sunken_temple",name:"Templo Submerso",   tier:40, bg:"#062a3a", dungeonName:"Câmaras Afogadas",     mapColor:"#0e7490",
    spawns:[{monster:"sunken_priest",weight:5},{monster:"reef_shade",weight:3},{monster:"tide_prophet",weight:4}] },
  neon_wastes:  { id:"neon_wastes",  name:"Terras Neon",       tier:46, bg:"#1a0a2a", dungeonName:"Cidade Fantasma Neon", mapColor:"#ec4899",
    spawns:[{monster:"neon_ripper",weight:5},{monster:"cog_sentinel",weight:3},{monster:"neon_phantom",weight:4}] },
  bloodmoon:    { id:"bloodmoon",    name:"Floresta Sangue-Lua",tier:30, bg:"#2a0808", dungeonName:"Santuário Escarlate",  mapColor:"#991b1b",
    spawns:[{monster:"bloodmoon_bat",weight:5},{monster:"shadow_hound",weight:3},{monster:"moon_reaper",weight:4}] },
  celestial:    { id:"celestial",    name:"Fenda Celeste",     tier:54, bg:"#2a2a1a", dungeonName:"Trono dos Astros",     mapColor:"#fef3c7", sunny:true,
    spawns:[{monster:"celestial_seer",weight:5},{monster:"sky_sprite",weight:3},{monster:"star_herald",weight:4}] },
  ashen:        { id:"ashen",        name:"Estepe Cinza",      tier:22, bg:"#1a1a1a", dungeonName:"Necrópole de Cinzas",   mapColor:"#71717a",
    spawns:[{monster:"ashen_wight",weight:5},{monster:"bone_knight",weight:3},{monster:"ash_reaver",weight:4}] },
  gloomwood:    { id:"gloomwood",    name:"Bosque Umbra",      tier:48, bg:"#0a0a0a", dungeonName:"Coração da Escuridão", mapColor:"#27272a",
    spawns:[{monster:"gloom_husk",weight:5},{monster:"shadow_hound",weight:3},{monster:"gloom_stalker",weight:4}] },
  mire:         { id:"mire",         name:"Charco Fétido",     tier:12, bg:"#1a1a0a", dungeonName:"Poços Fétidos",         mapColor:"#365314",
    spawns:[{monster:"mireborn",weight:5},{monster:"bog_toad",weight:3},{monster:"mire_toad",weight:4}] },
  runes:        { id:"runes",        name:"Planícies Rúnicas", tier:58, bg:"#0a1a2a", dungeonName:"Câmara dos Selos",      mapColor:"#1e40af",
    spawns:[{monster:"runic_titan",weight:4},{monster:"crystal_golem",weight:3},{monster:"rune_sentinel",weight:4}] },
  void_gate:    { id:"void_gate",    name:"Portal do Vazio",   tier:62, bg:"#050510", dungeonName:"Portão Vazio Absoluto", mapColor:"#581c87",
    spawns:[{monster:"void_hydra",weight:4},{monster:"void_stalker",weight:3},{monster:"gate_stalker",weight:4}] },

  // ============ MAIN CITY (safe zone — no enemies, spawn/respawn) ============
  main_city: { id:"main_city", name:"Cidade de Rimhold", tier:0, bg:"#1a1610", dungeonName:"—", mapColor:"#e5c98a", sunny:true,
    spawns:[] },

  // ============ 10 NEW BIOMES (irregular blob-shaped, 5x larger world) ============
  crimson_dunes:  { id:"crimson_dunes",  name:"Dunas Escarlates",   tier:34, bg:"#2a0808", dungeonName:"Cripta Escarlate",     mapColor:"#dc2626", sunny:true,
    spawns:[{monster:"crimson_wyrm",weight:4},{monster:"dune_stalker",weight:5},{monster:"bone_scarab",weight:5},{monster:"crimson_scarab",weight:4}] },
  obsidian_reef:  { id:"obsidian_reef",  name:"Recife Obsidiana",   tier:42, bg:"#050c1a", dungeonName:"Fenda Vulcânica",      mapColor:"#0f172a",
    spawns:[{monster:"obsidian_shark",weight:5},{monster:"molten_medusa",weight:5},{monster:"reef_leviathan",weight:3},{monster:"reef_wyrm",weight:4}] },
  seraph_grove:   { id:"seraph_grove",   name:"Bosque Serafim",     tier:52, bg:"#2a2410", dungeonName:"Catedral Dourada",     mapColor:"#facc15", sunny:true,
    spawns:[{monster:"seraph_guard",weight:5},{monster:"gilded_stag",weight:5},{monster:"ivory_wisp",weight:5},{monster:"gilded_serpent",weight:4}] },
  thunderveil:    { id:"thunderveil",    name:"Véu Trovejante",     tier:44, bg:"#0a0a2a", dungeonName:"Câmara Elétrica",      mapColor:"#60a5fa",
    spawns:[{monster:"storm_djinn",weight:4},{monster:"volt_hound",weight:5},{monster:"arc_slime",weight:5},{monster:"arc_raptor",weight:4}] },
  glass_desert:   { id:"glass_desert",   name:"Deserto de Vidro",   tier:46, bg:"#1a1a2a", dungeonName:"Catedral Cristalina",  mapColor:"#93c5fd",
    spawns:[{monster:"shard_bandit",weight:5},{monster:"mirror_wraith",weight:5},{monster:"glass_hydra",weight:4},{monster:"glass_widow",weight:4}] },
  mirror_lake:    { id:"mirror_lake",    name:"Lago Espelhado",     tier:38, bg:"#101418", dungeonName:"Palácio Reflexo",      mapColor:"#d4d4d8",
    spawns:[{monster:"silver_koi",weight:5},{monster:"reflect_knight",weight:4},{monster:"mirage_witch",weight:5},{monster:"mirror_serpent",weight:4}] },
  plasma_bog:     { id:"plasma_bog",     name:"Charco Plasma",      tier:48, bg:"#1a0a2a", dungeonName:"Cova Radiante",        mapColor:"#c084fc",
    spawns:[{monster:"plasma_ooze",weight:5},{monster:"neon_toad",weight:5},{monster:"void_leech",weight:4},{monster:"plasma_toad",weight:4}] },
  honeycomb_hive: { id:"honeycomb_hive", name:"Colmeia Dourada",    tier:36, bg:"#2a2408", dungeonName:"Câmara da Rainha",     mapColor:"#facc15", sunny:true,
    spawns:[{monster:"queen_drone",weight:4},{monster:"wax_golem",weight:5},{monster:"honey_slime",weight:5},{monster:"honey_hornet",weight:4}] },
  cursed_orchard: { id:"cursed_orchard", name:"Pomar Amaldiçoado",  tier:40, bg:"#1a0a0a", dungeonName:"Raízes Malditas",      mapColor:"#7f1d1d",
    spawns:[{monster:"rotten_ent",weight:5},{monster:"crow_lord",weight:5},{monster:"worm_king",weight:4},{monster:"orchard_wight",weight:4}] },
  cosmic_bazaar:  { id:"cosmic_bazaar",  name:"Bazar Cósmico",      tier:60, bg:"#0a0518", dungeonName:"Fenda Estelar",        mapColor:"#a78bfa",
    spawns:[{monster:"starweaver",weight:4},{monster:"cosmic_slime",weight:5},{monster:"singularity",weight:3},{monster:"star_broker",weight:4}] },

  // ============ 10 NEW ENDGAME BIOMES (Lv 75+) ============
  sunspire:       { id:"sunspire",       name:"Pináculo Solar",     tier:75, bg:"#2a1a05", dungeonName:"Coração do Sol",       mapColor:"#facc15", sunny:true,
    spawns:[{monster:"solar_herald",weight:5},{monster:"gilded_pyre",weight:5},{monster:"solar_wyrm",weight:4}] },
  moonshade:      { id:"moonshade",      name:"Vale das Luas",      tier:78, bg:"#0a1024", dungeonName:"Câmara Lunar",         mapColor:"#93c5fd",
    spawns:[{monster:"lunar_seer",weight:5},{monster:"moon_wraith",weight:5},{monster:"lunar_wraith",weight:4}] },
  stormforge:     { id:"stormforge",     name:"Forja da Tormenta",  tier:82, bg:"#181008", dungeonName:"Núcleo Elétrico",      mapColor:"#22d3ee",
    spawns:[{monster:"arc_titan",weight:4},{monster:"volt_slime",weight:5},{monster:"arc_leviathan",weight:4}] },
  dreamweave:     { id:"dreamweave",     name:"Tear dos Sonhos",    tier:85, bg:"#2a0a1a", dungeonName:"Câmara Onírica",       mapColor:"#f472b6",
    spawns:[{monster:"dream_eater",weight:5},{monster:"candy_horror",weight:5},{monster:"dream_hydra",weight:4}] },
  bone_wastes:    { id:"bone_wastes",    name:"Ermo de Ossos",      tier:88, bg:"#1a1408", dungeonName:"Ossário Real",         mapColor:"#e7e5e4",
    spawns:[{monster:"bone_colossus",weight:4},{monster:"skull_swarm",weight:5},{monster:"bone_reaver",weight:4}] },
  venom_grove:    { id:"venom_grove",    name:"Bosque Venenoso",    tier:90, bg:"#0a1a08", dungeonName:"Raiz Tóxica",          mapColor:"#84cc16",
    spawns:[{monster:"toxic_hydra",weight:4},{monster:"spore_titan",weight:5},{monster:"venom_matron",weight:4}] },
  magma_core:     { id:"magma_core",     name:"Núcleo de Magma",    tier:92, bg:"#1a0505", dungeonName:"Coração Fundido",      mapColor:"#dc2626",
    spawns:[{monster:"magma_lord",weight:4},{monster:"obsidian_wyrm",weight:5},{monster:"magma_hydra",weight:4}] },
  astral_void:    { id:"astral_void",    name:"Vazio Astral",       tier:95, bg:"#050518", dungeonName:"Fenda das Estrelas",   mapColor:"#a78bfa",
    spawns:[{monster:"star_devourer",weight:4},{monster:"void_wisp",weight:5},{monster:"astral_horror",weight:4}] },
  nightmare_gate: { id:"nightmare_gate", name:"Portal do Pesadelo", tier:98, bg:"#180505", dungeonName:"Trono Carmesim",       mapColor:"#7f1d1d",
    spawns:[{monster:"nightmare_king",weight:4},{monster:"flesh_horror",weight:5},{monster:"nightmare_wyrm",weight:4}] },
  titan_ruins:    { id:"titan_ruins",    name:"Ruínas do Titã",     tier:100,bg:"#101418", dungeonName:"Trono do Titã Caído",  mapColor:"#9ca3af",
    spawns:[{monster:"fallen_titan",weight:3},{monster:"rune_guardian",weight:5},{monster:"titan_watcher",weight:4}] },
};

export const DUNGEON_BIOMES: (keyof typeof BIOMES)[] = [
  "forest","desert","tundra","volcano","ruins","crystal",
  "swamp","jungle","sky","abyss",
  "mycelium","clockwork","abyss_sea","emberlands","shardveil",
  "frostpeak","sunken_temple","neon_wastes","bloodmoon","celestial",
  "ashen","gloomwood","mire","runes","void_gate",
  "crimson_dunes","obsidian_reef","seraph_grove","thunderveil","glass_desert",
  "mirror_lake","plasma_bog","honeycomb_hive","cursed_orchard","cosmic_bazaar",
  "sunspire","moonshade","stormforge","dreamweave","bone_wastes",
  "venom_grove","magma_core","astral_void","nightmare_gate","titan_ruins",
];

export const OVERWORLD_ID = "__overworld__";

// ---------- Achievements ----------
export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  target: number;
  metric: "kills" | "biomesVisited" | "level" | "gold" | "abilitiesUsed" | "tan";
  reward: number;
}
export const ACHIEVEMENTS: AchievementDef[] = [
  { id:"first_blood",  name:"Primeiro Sangue",   desc:"Derrote 1 inimigo.",        target:1,   metric:"kills",         reward:5   },
  { id:"slayer_25",    name:"Caçador",           desc:"Derrote 25 inimigos.",      target:25,  metric:"kills",         reward:30  },
  { id:"slayer_100",   name:"Exterminador",      desc:"Derrote 100 inimigos.",     target:100, metric:"kills",         reward:120 },
  { id:"slayer_500",   name:"Aniquilador",       desc:"Derrote 500 inimigos.",     target:500, metric:"kills",         reward:600 },
  { id:"traveler_5",   name:"Viajante",          desc:"Visite 5 biomas distintos.",target:5,   metric:"biomesVisited", reward:40  },
  { id:"traveler_all", name:"Cartógrafo",        desc:"Visite todos os biomas.",   target:46,  metric:"biomesVisited", reward:800 },
  { id:"level_5",      name:"Aprendiz",          desc:"Alcance o nível 5.",        target:5,   metric:"level",         reward:20  },
  { id:"level_15",     name:"Veterano",          desc:"Alcance o nível 15.",       target:15,  metric:"level",         reward:80  },
  { id:"level_30",     name:"Lenda",             desc:"Alcance o nível 30.",       target:30,  metric:"level",         reward:250 },
  { id:"rich",         name:"Rico",              desc:"Acumule 500 de ouro.",      target:500, metric:"gold",          reward:50  },
  { id:"skillful",     name:"Habilidoso",        desc:"Use 10 habilidades.",       target:10,  metric:"abilitiesUsed", reward:25  },
  { id:"bronze",       name:"Bronzeado",         desc:"Bronzeamento nível 5.",     target:5,   metric:"tan",           reward:35  },
];
