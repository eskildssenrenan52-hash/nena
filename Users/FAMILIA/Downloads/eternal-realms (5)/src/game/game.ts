import {
  BIOMES,
  World,
  CaveFloor,
  TILE,
  Player,
  type Enemy,
  type FloatingText,
  type Loot,
  type Projectile,
  type PlayMap,
  makeItem,
  rollRarity,
  shouldDropRarity,
  RARITY_COLOR,
  CLASS_INFO,
  type PlayerClass,
  type Particle,
  rollEnemyModifiers,
  type EnemyModifier,
} from "./engine";
import { _setOverlayBonusesProvider } from "./engine";
import { rollAncientRune, ANCIENT_RUNES, runeTierLabel } from "./ancientRunes";
import {
  getOverlayCombatBonuses,
  drainRewardQueue,
  petById,
  onEnemyKilled,
  onPlayerHit,
} from "@/rucoy/bridge";
import { getOverlayState, setOverlayState, addWood, craftBoat, setIsland, BOAT_WOOD_COST } from "@/rucoy/store";
import {
  enterCelestialRoom,
  enterUnifiedBiomePortalRoom,
  enterUnifiedBiomeDungeon,
  enterContinent,
  exitCelestialRoom
} from "./continents";
import { ISLAND2_BIOMES } from "./island2";
import { addTrophies, getEnemyTrophyValue } from "@/rucoy/trophies";

// Wire the overlay provider into the engine at module load so Player.atk()/def()
// pick up equipped item + active pet bonuses from the very first frame.
_setOverlayBonusesProvider(getOverlayCombatBonuses);

import {
  GrandDungeonFloor,
  GRAND_MAX_FLOOR,
  difficultyMultiplier,
  enemyNameForFloor,
} from "./grandDungeon";
import {
  TempleFloor,
  TEMPLE_MAX_FLOOR,
  templeDifficultyMultiplier,
  templeEnemyNameForFloor,
} from "./temple";
import {
  updateVeins,
  tryMineAt,
  makePickaxe,
  _pendingMonsterSpawns,
  ORES,
  type OreKind,
  giveOre,
} from "./mining";
import { tickEvents, dropMultiplier } from "./events";
import {
  type AmbitiousState,
  initAmbitiousState,
  updateAmbitiousSystems,
} from "./ambitiousFeatures";
import { getAchievementBonuses, checkAchievements } from "./achievements";
import { computeBonuses as computeTalentBonuses, talentNode, nodePrereqMet } from "./talents";
import {
  BossRushArena,
  arenaEnemyName,
  enemiesInWave,
  isBossWave,
  waveMultiplier,
  waveClearGold,
  waveEnemyXp,
  loadBossRushBest,
  saveBossRushBest,
} from "./bossRush";
import { rollOrbDrop, giveOrb, ORB_NAME, ORB_COLOR } from "./orbs";
import {
  tickStatusEffects,
  absorbShield,
  type EchoSlot,
  queueEcho,
  applyEffect,
  addEssence,
  consumeEssence,
  consumeAllEssences,
  type EssenceKind,
  type StatusEffect,
} from "./statusEffects";

export type Input = {
  keys: Set<string>;
  mouse: { x: number; y: number; down: boolean; downOnce: boolean };
};

// Snapshot of per-floor mutable state (enemies etc.), so returning to a floor restores it
type FloorSnapshot = {
  enemies: Enemy[];
  loot: Loot[];
  projectiles: Projectile[];
  spawnTimer: number;
  bossTimer: number;
};

export type GameState = {
  world: World; // always the overworld
  activeMap: PlayMap; // current playable map (world or a sub-floor)
  activeCaveBiome: number | null; // biomeId if on biome caves floors 2+
  activeFloor: number; // 1 = overworld, 2/3/4 = biome sub-floors
  activeGrandFloor: number; // 0 = not in grand dungeon, 1..100
  grandFloors: Map<number, GrandDungeonFloor>;
  activeTempleFloor: number; // 0 = not in temple, 1..25
  templeFloors: Map<number, TempleFloor>;
  caves: Map<string, CaveFloor>;
  snapshots: Map<string, FloorSnapshot>;
  player: Player;
  enemies: Enemy[];
  loot: Loot[];
  projectiles: Projectile[];
  floaters: FloatingText[];
  camera: { x: number; y: number };
  time: number;
  paused: boolean;
  panel:
    | "none"
    | "inventory"
    | "stats"
    | "help"
    | "map"
    | "mining"
    | "crafting"
    | "achievements"
    | "ferreiro"
    | "bestiario"
    | "mercenarios";
  activeCelestialPortalRoom?: boolean;
  activeUnifiedBiomePortalRoom?: boolean;
  activeUnifiedBiomeDungeon?: number | null;
  currentContinentId?: number;
  _achPage?: number;
  _achPageHits?: {
    prev: [number, number, number, number];
    next: [number, number, number, number];
  };
  log: { text: string; color: string; life: number }[];
  kills: number;
  bossKills: number;
  discovered: Set<number>;
  ambitious?: AmbitiousState;
  spawnTimer: number;
  bossTimer: number;
  stairCd: number;
  // Mining
  veins: import("./mining").Vein[];
  oreRespawn: number;
  // Events
  activeEvent: import("./events").ActiveEvent | null;
  eventCd: number;
  meteorTimer: number;
  meteors: { x: number; y: number; vx: number; vy: number; life: number }[];
  particles: Particle[];
  // Crafting UI
  craftingTab: string; // profession id currently focused in crafting panel
  autoFire: boolean; // right-joystick / auto-fire on mobile
  // Boss Rush arena state
  arena: BossRushArena | null;
  activeArena: boolean;
  arenaWave: number;
  arenaWaveActive: boolean;
  arenaNextWaveIn: number;
  arenaBest: number;
  arenaCityReturn: { x: number; y: number } | null;
  // Active follower pet driven by the React overlay state (rucoy/store).
  activePet: {
    id: string;
    pos: { x: number; y: number };
    attackCd: number;
  } | null;
  shakeTime?: number;
  shakeIntensity?: number;
  hitstopTime?: number;
  // Mundo Alternativo — índice cíclico do biome-alvo (81..90) do portal.
  altPortalIndex: number;
  // Sinal "E foi pressionada neste frame" enviado pelo React (EternalRealms).
  _ePressed?: boolean;
  // Clima dinâmico
  weather: "Ensolarado" | "Chuvoso" | "Tempestade" | "Nevoeiro";
  weatherTimer: number;
  zoom: number;
  // ═══ FEATURES NOVAS ═══
  // 1. Combo de Abates — kill streak multiplier
  comboCount: number;
  comboTimer: number;
  // 2. Bestiário — enciclopédia de inimigos derrotados
  bestiario: Record<string, number>;
  // 3. Invasão Aleatória — horde events periódicos
  invasionTimer: number;
  invasionActive: boolean;
  invasionCd: number;
  // 4. Título do Personagem — exibido acima do herói
  playerTitle: string;
  // 5. Mercador Itinerante — NPC que aparece aleatoriamente
  merchantTimer: number;
  merchantPos: { x: number; y: number } | null;
  // 6. Missão Diária — matar N inimigos por recompensa
  dailyKills: number;
  dailyGoal: number;
  dailyDone: boolean;
  // 7. Modo Brutal — 2× dano sofrido, 3× XP/Gold recebidos
  brutalMode: boolean;
  // 8. Modo Noturno — ciclo de dia/noite detectado
  isNight: boolean;
  islandQuests: Record<number, { kills: number; goal: number; done: boolean }>;
  arenaModifier?: string;
  arenaModifierDesc?: string;
  arenaModifierColor?: string;
};

let enemySeq = 0;

function floorKey(g: GameState): string {
  if (g.activeGrandFloor > 0) return `g${g.activeGrandFloor}`;
  if ((g.activeTempleFloor || 0) > 0) return `t${g.activeTempleFloor}`;
  return g.activeCaveBiome ? `f${g.activeFloor}:b${g.activeCaveBiome}` : "overworld";
}

function inGrand(g: GameState) {
  return g.activeGrandFloor > 0;
}
function inTemple(g: GameState) {
  return (g.activeTempleFloor || 0) > 0;
}
function inArena(g: GameState) {
  return g.activeArena;
}

// ---- Talent bonuses ----
export function recomputeTalentBonuses(g: GameState) {
  const b = computeTalentBonuses(g.player.cls, g.player.talents || {});
  const oldHp = g.player.talentBonuses?.maxHpBonus ?? 0;
  const oldMp = g.player.talentBonuses?.maxMpBonus ?? 0;
  g.player.talentBonuses = b;
  const hpDelta = b.maxHpBonus - oldHp;
  const mpDelta = b.maxMpBonus - oldMp;
  g.player.maxHp += hpDelta;
  g.player.hp = Math.min(g.player.maxHp, Math.max(1, g.player.hp + hpDelta));
  g.player.maxMp += mpDelta;
  g.player.mp = Math.min(g.player.maxMp, Math.max(0, g.player.mp + mpDelta));
}

export function allocTalent(g: GameState, nodeId: string): boolean {
  const p = g.player;
  if (!p.talents) p.talents = {};
  if (p.talentPoints <= 0) return false;
  const n = talentNode(p.cls, nodeId);
  if (!n) return false;
  const cur = p.talents[nodeId] || 0;
  if (cur >= n.maxRank) return false;
  if (!nodePrereqMet(p.cls, nodeId, p.talents)) return false;
  p.talents[nodeId] = cur + 1;
  p.talentPoints -= 1;
  recomputeTalentBonuses(g);
  logMsg(g, `Talento aprimorado: ${n.name} (${p.talents[nodeId]}/${n.maxRank}).`, "#f0b040");
  return true;
}

export function respecTalents(g: GameState) {
  const p = g.player;
  const spent = Object.values(p.talents || {}).reduce((a, c) => a + (c || 0), 0);
  if (spent === 0) {
    logMsg(g, "Nenhum talento investido para resetar.", "#ef4444");
    return;
  }
  const cost = p.level * 75; // balanced: 75 gold per level
  if (p.gold < cost) {
    logMsg(g, `Ouro insuficiente! Custo para resetar: ${cost}g (Você tem: ${p.gold}g).`, "#ef4444");
    return;
  }
  p.gold -= cost;
  p.talents = {};
  p.talentPoints += spent;
  recomputeTalentBonuses(g);
  logMsg(g, `Talentos redistribuídos! Pago: ${cost}g. +${spent} pontos devolvidos.`, "#5ea8ff");
}

export function newGame(
  seed = Math.floor(Math.random() * 99999),
  cls: PlayerClass = "melee",
): GameState {
  const world = new World(seed);
  const player = new Player();
  player.cls = cls;
  const b = CLASS_INFO[cls].base;
  player.attr = { str: b.str, agi: b.agi, int: b.int, vit: b.vit };
  player.maxHp = b.hp;
  player.hp = b.hp;
  player.maxMp = b.mp;
  player.mp = b.mp;
  player.skills = classSkills(cls);

  player.pos = { x: world.spawn.x, y: world.spawn.y };
  // O jogador começa SEM nenhum item: precisa conquistar tudo pelo jogo.
  // (Sem arma, sem armadura, sem picareta, sem materiais, sem receitas, sem poções.)
  player.recipesKnown = new Set();

  return {
    world,
    activeMap: world,
    activeCaveBiome: null,
    activeFloor: 1,
    activeGrandFloor: 0,
    grandFloors: new Map(),
    activeTempleFloor: 0,
    templeFloors: new Map(),
    caves: new Map(),
    snapshots: new Map(),
    player,
    enemies: [],
    loot: [],
    projectiles: [],
    floaters: [],
    camera: { x: player.pos.x, y: player.pos.y },
    time: 0,
    paused: false,
    panel: "none",
    log: [
      { text: "Bem-vindo à Cidade Central de Asterion.", color: "#f0e0a0", life: 12 },
      {
        text: "WASD move, mouse ataca, 1-4 habilidades. B = crafting, N = mineração. Escada dourada ao norte → Masmorra de 100 andares.",
        color: "#fff",
        life: 12,
      },
      {
        text: "Uma escada antiga na praça leva ao 2º andar da cidade: há um boneco de treino aguardando seus golpes.",
        color: "#c8a866",
        life: 14,
      },
    ],
    kills: 0,
    bossKills: 0,
    discovered: new Set([1]),
    ambitious: initAmbitiousState(),
    spawnTimer: 0,
    bossTimer: 30,
    stairCd: 0,
    veins: [],
    oreRespawn: 0,
    activeEvent: null,
    eventCd: 90 + Math.random() * 120,
    meteorTimer: 0,
    meteors: [],
    particles: [],
    craftingTab: "ferreiro",
    autoFire: false,
    arena: null,
    activeArena: false,
    arenaWave: 0,
    arenaWaveActive: false,
    arenaNextWaveIn: 0,
    arenaBest: loadBossRushBest(),
    arenaCityReturn: null,
    activePet: null,
    shakeTime: 0,
    shakeIntensity: 0,
    hitstopTime: 0,
    altPortalIndex: 0,
    weather: "Ensolarado",
    weatherTimer: 60,
    zoom: 1.0,
    comboCount: 0,
    comboTimer: 0,
    bestiario: {},
    invasionTimer: 300,
    invasionActive: false,
    invasionCd: 0,
    playerTitle: "Aventureiro",
    merchantTimer: 180,
    merchantPos: null,
    dailyKills: 0,
    dailyGoal: 50,
    dailyDone: false,
    brutalMode: false,
    isNight: false,
    islandQuests: {},
  };
}

export function logMsg(g: GameState, text: string, color = "#fff") {
  g.log.unshift({ text, color, life: 6 });
  if (g.log.length > 8) g.log.pop();
}

export function spawnParticles(
  g: GameState,
  x: number,
  y: number,
  color: string,
  count = 10,
  options: Partial<Particle> = {},
) {
  if (!g.particles) g.particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed =
      options.vx !== undefined && options.vy !== undefined
        ? Math.hypot(options.vx, options.vy) * (0.5 + Math.random() * 0.8)
        : 1.5 + Math.random() * 3.5;
    const life = options.maxLife ?? 0.3 + Math.random() * 0.4;
    g.particles.push({
      x,
      y,
      vx:
        options.vx !== undefined && options.vy !== undefined
          ? options.vx * (0.4 + Math.random() * 0.8) + (Math.random() - 0.5) * 2.5
          : Math.cos(angle) * speed,
      vy:
        options.vx !== undefined && options.vy !== undefined
          ? options.vy * (0.4 + Math.random() * 0.8) + (Math.random() - 0.5) * 2.5
          : Math.sin(angle) * speed,
      color,
      size: options.size ?? 1.6 + Math.random() * 2.4,
      life,
      maxLife: life,
      alpha: 1,
      grow: options.grow ?? -1.2,
      gravity: options.gravity ?? 0.03,
      drag: options.drag ?? 0.96,
    });
  }
}

function tileAt(g: GameState, wx: number, wy: number) {
  return g.activeMap.get(Math.floor(wx / TILE), Math.floor(wy / TILE));
}

function collides(g: GameState, x: number, y: number, r = 12) {
  const pts = [
    [x - r, y - r],
    [x + r, y - r],
    [x - r, y + r],
    [x + r, y + r],
  ];
  const hasBoat = g.activeMap === g.world && getOverlayState().hasBoat;
  for (const [px, py] of pts) {
    const tx = Math.floor(px / TILE),
      ty = Math.floor(py / TILE);
    if (g.activeMap.isBlocked(tx, ty)) {
      // Com barco, o jogador pode atravessar água (tile kind 1) no overworld.
      if (hasBoat) {
        const t = g.activeMap.get(tx, ty);
        if (t && t.kind === 1) continue;
      }
      return true;
    }
  }
  return false;
}

function moveEntity(g: GameState, pos: { x: number; y: number }, dx: number, dy: number, r = 12) {
  const nx = pos.x + dx;
  if (!collides(g, nx, pos.y, r)) pos.x = nx;
  const ny = pos.y + dy;
  if (!collides(g, pos.x, ny, r)) pos.y = ny;
}

function currentBiomeForEnemies(g: GameState): number {
  if (g.activeCaveBiome) return g.activeCaveBiome;
  const t = tileAt(g, g.player.pos.x, g.player.pos.y);
  return t.biome || 1;
}

function spawnEnemyNear(g: GameState, cx: number, cy: number, boss = false, miningOre?: OreKind) {
  const isGrand = inGrand(g);
  const inCave = !!g.activeCaveBiome;
  const tries = 30;
  for (let i = 0; i < tries; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = isGrand
      ? 220 + Math.random() * 260
      : inCave
        ? 200 + Math.random() * 240
        : 300 + Math.random() * 400;
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist;
    const maxCoord = g.activeMap.size * TILE;
    if (x < 32 || y < 32 || x > maxCoord - 32 || y > maxCoord - 32) continue;
    if (collides(g, x, y, 12)) continue;

    if (miningOre) {
      const meta = ORES[miningOre];
      const level = Math.max(1, meta.level);
      const maxHp = Math.floor(((120 + level * 30) * 4) / 3);
      const name = `Guardião de ${meta.name}`;
      const en: Enemy = {
        id: ++enemySeq,
        pos: { x, y },
        vel: { x: 0, y: 0 },
        hp: maxHp,
        maxHp,
        atk: Math.floor(((10 + level * 2.0) * 4) / 2),
        def: Math.floor(level * 2.5),
        speed: 1.1,
        level,
        name,
        biome: 0,
        radius: 15,
        color: meta.color,
        isBoss: false,
        attackCd: 0,
        hitFlash: 0,
        isMiningGuardian: true,
        guardianOre: miningOre,
      };
      g.enemies.push(en);
      logMsg(g, `Um ${name} despertou defendendo a veia quebrada!`, meta.color);
      return;
    }

    const isTempleFloor = inTemple(g);
    if (isTempleFloor) {
      const floor = g.activeTempleFloor;
      const mul = templeDifficultyMultiplier(floor);
      const level = Math.max(
        1,
        Math.floor(1 + floor * 12 + Math.floor(Math.random() * 4) + (boss ? 15 : 0)),
      );
      const name = templeEnemyNameForFloor(floor, boss);
      const baseHp = boss ? 500 : 35;
      const baseAtk = boss ? 20 : 10;
      const baseDef = boss ? 8 : 4;
      const lvlScale = 1 + Math.max(0, level - 1) * 0.07;
      const mods = rollEnemyModifiers(boss, floor + 10);
      let modHp = 1,
        modAtk = 1,
        modDef = 1,
        modSpeed = 1;
      for (const m of mods) {
        if (m.id === "colossal") modHp *= 2.2;
        if (m.id === "blindado") modDef *= 2.5;
        if (m.id === "rapido") modSpeed *= 1.4;
        if (m.id === "vampirico") modAtk *= 1.1;
        if (m.id === "igneo" || m.id === "eletrizado") modAtk *= 1.1;
      }
      const maxHp = Math.floor((baseHp * mul * 4 * 1.5 * 3 * lvlScale * modHp) / 3);
      const isPurpleElite = !boss && Math.random() < 0.05;
      const finalMaxHp = isPurpleElite ? maxHp * 2 : maxHp;
      const finalAtk = isPurpleElite
        ? Math.floor((baseAtk * mul * 4 * 1.5 * 2.5 * lvlScale * modAtk))
        : Math.floor((baseAtk * mul * 4 * 1.5 * 2.5 * lvlScale * modAtk) / 2);
      
      const accents = ["#ffd700", "#ffaa00", "#ffffff", "#00ffcc", "#ff3366"];
      const en: Enemy = {
        id: ++enemySeq,
        pos: { x, y },
        vel: { x: 0, y: 0 },
        hp: finalMaxHp,
        maxHp: finalMaxHp,
        atk: finalAtk,
        def: Math.floor(baseDef * mul * 4 * 1.5 * 2.2 * lvlScale * modDef),
        speed: (boss ? 1.8 : (isPurpleElite ? 2.3 : 2.0 + Math.random() * 0.5)) * modSpeed,
        level,
        name: isPurpleElite ? `Invasor ${name}` : name,
        biome: 0,
        radius: boss ? 26 : 14,
        color: boss ? "#ffd700" : accents[floor % accents.length],
        isBoss: boss,
        attackCd: 0,
        hitFlash: 0,
        modifiers: mods.length ? mods : undefined,
        isElite: !boss && mods.length > 0,
        isPurpleElite,
      };
      g.enemies.push(en);
      if (boss) {
        logMsg(g, `⚠️ CHEFE DO TEMPLO: ${name} (Nv ${level}) despertou no ${floor}º andar!`, "#ffd700");
      } else if (isPurpleElite) {
        logMsg(g, `🔮 ELITE DO TEMPLO: Invasor ${name} (Nv ${level}) - Prepare-se!`, "#d8b4fe");
      }
      return;
    }

    if (isGrand) {
      // Grand Dungeon: cada andar aumenta o nível dos inimigos em +10.
      const floor = g.activeGrandFloor;
      const mul = difficultyMultiplier(floor);
      const level = Math.max(
        1,
        Math.floor(1 + floor * 10 + Math.floor(Math.random() * 3) + (boss ? 12 : 0)),
      );
      const name = enemyNameForFloor(floor, boss);
      const baseHp = boss ? 380 : 26;
      const baseAtk = boss ? 16 : 8;
      const baseDef = boss ? 6 : 3;
      // Escalonamento por nível: +6% HP/ATK por nível acima de 1.
      const lvlScale = 1 + Math.max(0, level - 1) * 0.06;
      const mods = rollEnemyModifiers(boss, floor);
      let modHp = 1,
        modAtk = 1,
        modDef = 1,
        modSpeed = 1;
      for (const m of mods) {
        if (m.id === "colossal") modHp *= 2.2;
        if (m.id === "blindado") modDef *= 2.5;
        if (m.id === "rapido") modSpeed *= 1.4;
        if (m.id === "vampirico") modAtk *= 1.1;
        if (m.id === "igneo" || m.id === "eletrizado") modAtk *= 1.1;
      }
      const maxHp = Math.floor((baseHp * mul * 4 * 1.3 * 2.5 * lvlScale * modHp) / 3);
      const isPurpleElite = !boss && Math.random() < 0.03;
      const finalMaxHp = isPurpleElite ? maxHp * 2 : maxHp;
      const finalAtk = isPurpleElite
        ? Math.floor((baseAtk * mul * 4 * 1.3 * 2.2 * lvlScale * modAtk))
        : Math.floor((baseAtk * mul * 4 * 1.3 * 2.2 * lvlScale * modAtk) / 2);
      const accents = ["#c8a060", "#8090a0", "#a08040", "#607080", "#b06040"];
      const en: Enemy = {
        id: ++enemySeq,
        pos: { x, y },
        vel: { x: 0, y: 0 },
        hp: finalMaxHp,
        maxHp: finalMaxHp,
        atk: finalAtk,
        def: Math.floor(baseDef * mul * 4 * 1.3 * 2.0 * lvlScale * modDef),
        speed: (boss ? 1.7 : (isPurpleElite ? 2.2 : 1.9 + Math.random() * 0.5)) * modSpeed,
        level,
        name: isPurpleElite ? `Elite ${name}` : name,
        biome: 0,
        radius: boss ? 24 : 12,
        color: boss ? "#f04060" : accents[floor % accents.length],
        isBoss: boss,
        attackCd: 0,
        hitFlash: 0,
        modifiers: mods.length ? mods : undefined,
        isElite: !boss && mods.length > 0,
        isPurpleElite,
      };
      g.enemies.push(en);
      if (boss) logMsg(g, `${name} (Nv ${level}) surge no ${floor}º andar da Masmorra!`, "#f04060");
      else if (isPurpleElite) {
        logMsg(g, `🔮 ELITE SURGIU: Elite ${name} (Nv ${level}) - 2x mais poderoso!`, "#d8b4fe");
      } else if (mods.length)
        logMsg(
          g,
          `${mods.map((m) => m.name).join(", ")} ${name} (Nv ${level}) aparece!`,
          "#f0b040",
        );
      return;
    }

    let biomeId: number;
    if (inCave) biomeId = g.activeCaveBiome!;
    else biomeId = g.activeMap.get(Math.floor(x / TILE), Math.floor(y / TILE)).biome;
    const b = BIOMES.find((bb) => bb.id === biomeId) || BIOMES[0];
    const dangerBoost = inCave ? 3 : 0;
    const level = Math.max(
      1,
      b.danger + dangerBoost + Math.floor(Math.random() * 3) - 1 + (boss ? 5 : 0),
    );
    let monsterName = inCave
      ? boss
        ? b.caveTheme.boss
        : b.caveTheme.monsters[Math.floor(Math.random() * b.caveTheme.monsters.length)]
      : boss
        ? b.boss
        : b.monsters[Math.floor(Math.random() * b.monsters.length)];

    // --- Underwater-Exclusive Monsters & Bosses ---
    let isUnderwaterMonster = false;
    if (g.player.isUnderwater) {
      isUnderwaterMonster = true;
      if (boss) {
        const uBosses = [
          "Tritão Colossal Abissal",
          "Kraken das Fossas Negras",
          "Leviatã de Éter Submarino",
          "Sirenarca das Correntes",
          "Devorador das Profundezas",
        ];
        monsterName = uBosses[Math.floor(Math.random() * uBosses.length)];
      } else {
        const uMonsters = [
          "Peixe-Lanterna Sombrio",
          "Arraia Elétrica Sombria",
          "Enguia Hidrodinâmica",
          "Tubarão Espectral",
          "Coral Vivo Voraz",
        ];
        monsterName = uMonsters[Math.floor(Math.random() * uMonsters.length)];
      }
    }

    const mods = rollEnemyModifiers(boss, level);
    let modHp = 1,
      modAtk = 1,
      modDef = 1,
      modSpeed = 1;
    for (const m of mods) {
      if (m.id === "colossal") modHp *= 2.2;
      if (m.id === "blindado") modDef *= 2.5;
      if (m.id === "rapido") modSpeed *= 1.4;
      if (m.id === "vampirico" || m.id === "igneo" || m.id === "eletrizado") modAtk *= 1.1;
    }
    const maxHp = Math.floor(
      ((boss ? 300 + level * 60 : 20 + level * 12) * 4 * 1.3 * 2.5 * modHp) / 3,
    );
    const isPurpleElite = !boss && Math.random() < 0.03;
    const finalMaxHp = isPurpleElite ? maxHp * 2 : maxHp;
    const finalAtk = isPurpleElite
      ? Math.floor((((boss ? 12 : 6) + level * 2) * 4 * 1.3 * 2.2 * modAtk))
      : Math.floor((((boss ? 12 : 6) + level * 2) * 4 * 1.3 * 2.2 * modAtk) / 2);

    const accent = inCave ? b.caveTheme.accent : b.accent;
    const en: Enemy = {
      id: ++enemySeq,
      pos: { x, y },
      vel: { x: 0, y: 0 },
      hp: finalMaxHp,
      maxHp: finalMaxHp,
      atk: finalAtk,
      def: Math.floor(Math.floor(level * 1.2) * 4 * 1.3 * 2.0 * modDef),
      speed: (boss ? 1.6 : (isPurpleElite ? 2.2 : 1.9 + Math.random() * 0.4)) * modSpeed,
      level,
      name: isPurpleElite ? `Elite ${monsterName}` : monsterName,
      biome: biomeId,
      radius: boss ? 22 : 12,
      color: isUnderwaterMonster ? (boss ? "#38bdf8" : "#0ea5e9") : boss ? "#f04060" : accent,
      isBoss: boss,
      attackCd: 0,
      hitFlash: 0,
      modifiers: mods.length ? mods : undefined,
      isElite: !boss && mods.length > 0,
      isPurpleElite,
    };
    g.enemies.push(en);
    if (boss) {
      const label = inCave ? b.caveTheme.label : b.name;
      logMsg(g, `${monsterName} apareceu em ${label}!`, "#f04060");
    } else if (isPurpleElite) {
      logMsg(g, `🔮 ELITE SURGIU: Elite ${monsterName} (Nv ${level}) - 2x mais poderoso!`, "#d8b4fe");
    } else if (mods.length) {
      logMsg(g, `${mods.map((m) => m.name).join(", ")} ${monsterName} aparece!`, "#f0b040");
    }
    return;
  }
}

function dropLoot(g: GameState, e: Enemy) {
  const p = g.player;
  if (e.isMiningGuardian && e.guardianOre) {
    const count = 3 + Math.floor(Math.random() * 4);
    const meta = ORES[e.guardianOre as OreKind];
    giveOre(g, e.guardianOre as OreKind, count);
    logMsg(g, `Guardião quebrado! Você recolheu +${count} ${meta.name}.`, meta.color);
    g.floaters.push({
      x: e.pos.x,
      y: e.pos.y - 18,
      text: `+${count} ${meta.name}`,
      color: meta.color,
      life: 1.4,
      vy: -25,
    });
  }
  const goldMult = (p.runeBonuses?.goldMult ?? 1) * (e.isElite ? 1.5 : 1) * (inTemple(g) ? 3.5 : 1);
  const gold = Math.floor((e.level * (e.isBoss ? 20 : 3) + Math.random() * e.level * 4) * goldMult);
  p.gold += gold;
  g.floaters.push({
    x: e.pos.x,
    y: e.pos.y - 10,
    text: `+${gold}g`,
    color: "#f0c060",
    life: 1.2,
    vy: -30,
  });
  const xpBase = e.isBoss ? e.level * 50 : e.level * 12;
  const xp = xpBase * (inTemple(g) ? 3.5 : 1);
  p.gainXp(xp, (m, c) => logMsg(g, m, c));

  // ---- Ancient Relic drop from underwater enemies ----
  if (p.isUnderwater) {
    const rCount = e.isBoss ? 5 + Math.floor(Math.random() * 6) : Math.floor(Math.random() * 3) + 1;
    p.ancientRelics = (p.ancientRelics || 0) + rCount;
    g.floaters.push({
      x: e.pos.x,
      y: e.pos.y - 42,
      text: `+${rCount} Relíquia 🏺`,
      color: "#a8dadc",
      life: 1.5,
      vy: -25,
    });
  }
  // Drop rate 100x menor para mobs comuns; elites com bônus; chefes garantidos.
  const base = e.isBoss ? 0.35 : inGrand(g) ? 0.6 : g.activeCaveBiome ? 0.5 : 0.35;
  const eliteBoost = e.isElite ? 15 : 1; // elites dropam ~15x mais que comuns
  const chance = e.isBoss ? base : (base / 100) * eliteBoost;
  // ---- Runa ancestral: chance rara em chefes e chance mínima em elites ----
  if (e.isBoss || e.isElite) {
    const power = (inGrand(g) ? g.activeGrandFloor : Math.floor(e.level / 2)) + (e.isBoss ? 15 : 0);
    const rune = rollAncientRune(power);
    if (rune) {
      p.runes.push(rune);
      // Auto-equipar em slot vazio para bônus imediato
      const emptyIdx = p.equippedRunes.findIndex((r) => r == null);
      if (emptyIdx >= 0) {
        p.equippedRunes[emptyIdx] = rune;
        p.recomputeRuneBonuses();
        recalculateStats(g);
      }
      const info = ANCIENT_RUNES[rune.runeId];
      logMsg(
        g,
        `RUNA ANCESTRAL: ${info.name} (${runeTierLabel(rune.tier)})${emptyIdx >= 0 ? " — equipada" : " — inventário cheio"}`,
        info.color,
      );
      g.floaters.push({
        x: e.pos.x,
        y: e.pos.y - 24,
        text: `⟡ RUNA ⟡`,
        color: info.color,
        life: 3,
        vy: -20,
      });
    }
  }
  // ---- Orb drop (very rare crystal for the Ferreiro upgrade system) ----
  {
    const src = e.isBoss ? "boss" : e.isElite ? "elite" : "monster";
    const orbLuck =
      Math.floor(p.runeBonuses?.dropLuck ?? 0) + (inGrand(g) ? g.activeGrandFloor : 0);
    const orb = rollOrbDrop(src, orbLuck);
    if (orb) {
      giveOrb(g, orb, 1);
      logMsg(g, `Dropou ${ORB_NAME[orb]}!`, ORB_COLOR[orb]);
      g.floaters.push({
        x: e.pos.x,
        y: e.pos.y - 30,
        text: `◈ ${ORB_NAME[orb]}`,
        color: ORB_COLOR[orb],
        life: 2.5,
        vy: -22,
      });
    }
  }
  // ─── DROP LENDÁRIO: 0.3 % comum, 5 % em chefes ───
  {
    const legendChance = e.isBoss ? 0.05 : 0.003;
    if (Math.random() < legendChance) {
      const legendaries = [
        "Espada do Abismo Eterno",
        "Arco do Destino Final",
        "Cajado da Criação",
        "Lâmina Fantasma",
        "Escudo de Asterion",
        "Cetro do Caos",
      ];
      const lName = legendaries[Math.floor(Math.random() * legendaries.length)];
      const statBonus = 4 + Math.floor(e.level * 0.5);
      p.attr.str = (p.attr.str || 0) + statBonus;
      p.attr.agi = (p.attr.agi || 0) + statBonus;
      p.attr.int = (p.attr.int || 0) + statBonus;
      p.maxHp = Math.round(p.maxHp + statBonus * 4);
      p.hp    = Math.min(p.maxHp, Math.round(p.hp + statBonus * 4));
      logMsg(g, `⭐ DROP LENDÁRIO: ${lName}! +${statBonus} todos atributos`, "#ffd700");
      g.floaters.push({ x: e.pos.x, y: e.pos.y - 32, text: `⭐ LENDÁRIO!`, color: "#ffd700", life: 3.5, vy: -12 });
    }
  }

  if (Math.random() >= chance) return;
  const kinds: Array<"weapon" | "armor" | "potion" | "material"> = [
    "weapon",
    "armor",
    "potion",
    "material",
  ];
  const kind = e.isBoss
    ? Math.random() < 0.5
      ? "weapon"
      : "armor"
    : kinds[Math.floor(Math.random() * kinds.length)];
  const runeLuck = Math.floor(p.runeBonuses?.dropLuck ?? 0);
  const luck =
    (e.isBoss ? 20 : 0) +
    (g.activeCaveBiome ? 8 : 0) +
    (inGrand(g) ? Math.min(45, g.activeGrandFloor) : 0) +
    (inTemple(g) ? Math.min(60, g.activeTempleFloor * 2.5) : 0) +
    (e.isElite ? 10 : 0) +
    runeLuck;
  const rarity = rollRarity(luck);
  if (!shouldDropRarity(rarity)) return;
  const tier = Math.max(
    1,
    Math.floor(e.level / 3) +
      1 +
      (inGrand(g) ? Math.floor(g.activeGrandFloor / 8) : 0) +
      (inTemple(g) ? Math.floor(g.activeTempleFloor / 2) : 0) +
      (e.isElite ? 1 : 0),
  );
  const it = makeItem(kind, tier, rarity);
  g.loot.push({ pos: { x: e.pos.x, y: e.pos.y }, item: it, life: 30 });
}

function damageEnemy(g: GameState, e: Enemy, dmg: number) {
  let modDmg = dmg;
  if (g.activeArena && g.arenaModifier === "FÚRIA SANGRENTA") {
    if (Math.random() < 0.4) {
      modDmg *= 2.0;
      g.floaters.push({
        x: e.pos.x,
        y: e.pos.y - 18,
        text: "💥 CRÍTICO BRUTAL!",
        color: "#f97316",
        life: 1.0,
        vy: -50,
      });
    }
  }
  const scaledDmg = modDmg * (g.player.tempDmgMult ?? 1.0);
  const real = Math.max(1, Math.floor(scaledDmg) - e.def);
  e.hp -= real;

  if (g.activeArena && g.arenaModifier === "SANGUE DRENANTE") {
    const lifesteal = Math.floor(real * 0.15);
    if (lifesteal > 0) {
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + lifesteal);
    }
  }
  e.hitFlash = 0.15;
  g.floaters.push({
    x: e.pos.x,
    y: e.pos.y - 8,
    text: `${real}`,
    color: "#ffe0e0",
    life: 0.8,
    vy: -40,
  });

  // Combat Impact Feedback: brief frame freeze and subtle camera shake
  g.hitstopTime = e.isBoss ? 0.08 : 0.04;
  g.shakeTime = 0.15;
  g.shakeIntensity = e.isBoss ? 3.5 : 1.8;

  // Directional particle spray based on player angle
  const pDirX = e.pos.x - g.player.pos.x;
  const pDirY = e.pos.y - g.player.pos.y;
  const pLen = Math.hypot(pDirX, pDirY) || 1;
  const vx = (pDirX / pLen) * 3.5;
  const vy = (pDirY / pLen) * 3.5;
  spawnParticles(
    g,
    e.pos.x,
    e.pos.y,
    e.isBoss ? "#ffd700" : e.isTrainingDummy ? "#c8a866" : "#ff4040",
    10,
    { vx, vy, size: 2.5 },
  );

  // Lifesteal do jogador via runa
  const ls = g.player.runeBonuses?.lifesteal ?? 0;
  if (ls > 0) {
    const heal = Math.floor(real * ls);
    if (heal > 0) g.player.hp = Math.min(g.player.maxHp, g.player.hp + heal);
  }
  // Cristalizado: reflete parte do dano em quem atacou (o jogador)
  const mods = e.modifiers ?? [];
  if (mods.some((m) => m.id === "cristalizado")) {
    const reflected = Math.max(1, Math.floor(real * 0.15));
    g.player.hp -= reflected;
    g.floaters.push({
      x: g.player.pos.x,
      y: g.player.pos.y - 8,
      text: `${reflected}✦`,
      color: "#a0e0ff",
      life: 0.8,
      vy: -30,
    });
  }

  // ---- Boneco de treino: XP por acerto que fica cada vez mais fraco por nível ----
  if (e.isTrainingDummy) {
    const lvl = g.player.level;
    // Fórmula de retorno decrescente: nível 1 ≈ 20 XP/golpe, nível 10 ≈ 4, nível 50 ≈ 1.
    const gained = Math.max(1, Math.floor(20 / (1 + lvl * 0.45)));
    g.player.gainXp(gained, (m, c) => logMsg(g, m, c));
    g.floaters.push({
      x: e.pos.x,
      y: e.pos.y - 20,
      text: `+${gained} XP`,
      color: "#8fe0a0",
      life: 1,
      vy: -25,
    });
    if (e.hp <= 0) {
      // Nunca morre — sempre volta com vida cheia.
      e.hp = e.maxHp;
      e.hitFlash = 0.3;
      logMsg(g, "O boneco de treino se recompõe.", "#c8a866");
    }
    return;
  }

  if (e.hp <= 0) {
    g.enemies = g.enemies.filter((x) => x !== e);
    g.kills++;

    // ─── COMBO DE ABATES ───
    g.comboCount++;
    g.comboTimer = 4.5;
    if (g.comboCount >= 3) {
      const label = g.comboCount >= 10 ? "🔥 IMPARÁVEL!" : g.comboCount >= 7 ? "⚡ DESTRUIDOR!" : g.comboCount >= 5 ? "💥 DEVASTADOR!" : "✨ COMBO!";
      g.floaters.push({
        x: g.player.pos.x + (Math.random() - 0.5) * 50,
        y: g.player.pos.y - 60,
        text: `${g.comboCount}× ${label}`,
        color: g.comboCount >= 10 ? "#ff2244" : g.comboCount >= 7 ? "#ff6600" : g.comboCount >= 5 ? "#ffaa00" : "#ffdd44",
        life: 1.3,
        vy: -16,
      });
    }

    // ─── BESTIÁRIO ───
    if (!g.bestiario) g.bestiario = {};
    g.bestiario[e.name] = (g.bestiario[e.name] || 0) + 1;

    // ─── TÍTULO AUTOMÁTICO ───
    g.playerTitle =
      g.kills >= 2000 ? "Destruidor de Mundos" :
      g.kills >= 1000 ? "Lenda de Asterion" :
      g.kills >= 500  ? "Campeão Eterno" :
      g.kills >= 200  ? "Ceifador Sombrio" :
      g.kills >= 100  ? "Caçador Veterano" :
      g.kills >= 50   ? "Guerreiro Experiente" :
      g.kills >= 20   ? "Combatente Hábil" :
      g.kills >= 5    ? "Aprendiz de Batalha" : "Aventureiro";

    // ─── MISSÃO DIÁRIA ───
    if (!g.dailyDone) {
      g.dailyKills++;
      if (g.dailyKills >= g.dailyGoal) {
        g.dailyDone = true;
        g.player.gold += 500;
        logMsg(g, "🎯 Missão Diária concluída! +500 ouro!", "#facc15");
        g.floaters.push({ x: g.player.pos.x, y: g.player.pos.y - 65, text: "MISSÃO DIÁRIA! +500💰", color: "#facc15", life: 2.5, vy: -14 });
      }
    }

    // ─── MISSÃO DE ILHA EXCLUSIVA (ILHAS 15-34) ───
    const currentBiomeId = g.activeCaveBiome || (g.world ? tileAt(g, g.player.pos.x, g.player.pos.y)?.biome || 1 : 1);
    const islandNum = getIslandFromBiome(currentBiomeId);
    if (islandNum >= 15 && islandNum <= 34) {
      if (!g.islandQuests) g.islandQuests = {};
      if (!g.islandQuests[islandNum]) {
        g.islandQuests[islandNum] = { kills: 0, goal: 15, done: false };
      }
      const q = g.islandQuests[islandNum];
      if (!q.done) {
        q.kills++;
        if (q.kills >= q.goal) {
          q.done = true;
          const rewardGold = 1000 + islandNum * 200;
          g.player.gold += rewardGold;
          addTrophies(g, 150, `Completou Missão da Ilha ${islandNum}!`, `Completed Quest of Island ${islandNum}!`);
          logMsg(g, `🏆 Missão Exclusiva da Ilha ${islandNum} concluída! +${rewardGold} ouro!`, "#38bdf8");
          g.floaters.push({
            x: g.player.pos.x,
            y: g.player.pos.y - 85,
            text: `MISSÃO CONCLUÍDA! +${rewardGold}💰`,
            color: "#38bdf8",
            life: 3.0,
            vy: -16,
          });
        }
      }
    }

    // ─── MODO BRUTAL (bônus extra) ───
    if (g.brutalMode) {
      const bonus = Math.max(1, Math.floor(e.level * 4));
      g.player.gold += bonus;
      g.floaters.push({ x: e.pos.x, y: e.pos.y - 22, text: `💀+${bonus}`, color: "#ff4444", life: 0.9, vy: -22 });
    }

    const trophyVal = getEnemyTrophyValue(e.name, e.isBoss);
    addTrophies(g, trophyVal, `Derrotou ${e.name}!`, `Defeated ${e.name}!`);
    if (e.isBoss) {
      g.bossKills++;
      logMsg(g, `Chefe derrotado: ${e.name}`, "#f0b040");
    }
    try {
      onEnemyKilled(g.player.cls, e.level, !!e.isBoss);
    } catch {
      /* skills off */
    }
    dropLoot(g, e);
  }
}

function respawnInCity(g: GameState) {
  // Always sends the player back to the central city plaza.
  snapshotFloor(g);
  // Leaving the arena on death: save best wave & clear arena state.
  if (g.activeArena) {
    if (g.arenaWave > g.arenaBest) {
      g.arenaBest = g.arenaWave;
      saveBossRushBest(g.arenaWave);
    }
    g.arena = null;
    g.activeArena = false;
    g.arenaWave = 0;
    g.arenaWaveActive = false;
    g.arenaCityReturn = null;
  }
  g.activeMap = g.world;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  g.activeGrandFloor = 0;
  restoreFloor(g, "overworld");
  g.player.pos.x = g.world.spawn.x;
  g.player.pos.y = g.world.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  g.stairCd = 1.5;
}

function damagePlayer(g: GameState, dmg: number, source?: Enemy) {
  const p = g.player;
  if (p.invuln > 0) return;
  let finalDmg = dmg;
  if (g.activeArena && g.arenaModifier === "FÚRIA SANGRENTA") {
    finalDmg = Math.floor(dmg * 1.3);
  }
  let real = Math.max(1, finalDmg - p.def());
  try {
    onPlayerHit(real);
  } catch {
    /* skills off */
  }

  // Active tank mercenary damage interception!
  const activeMerc = g.ambitious?.mercenaries?.find((m: any) => m.active && m.hp > 0);
  if (activeMerc && activeMerc.role === "Tanque") {
    const intercepted = Math.floor(real * 0.35); // Tank intercepts 35% of player's taken damage!
    if (intercepted > 0) {
      real -= intercepted;
      activeMerc.hp = Math.max(0, activeMerc.hp - Math.floor(intercepted * 0.65)); // Tank mitigates some of it!
      g.floaters.push({
        x: activeMerc.pos.x,
        y: activeMerc.pos.y - 15,
        text: `🛡️ BLOQUEADO -${intercepted}`,
        color: "#9ca3af",
        life: 1.2,
        vy: -20
      });
      spawnParticles(g, activeMerc.pos.x, activeMerc.pos.y, "#9ca3af", 6, { size: 1.8 });

      if (activeMerc.hp <= 0) {
        activeMerc.active = false;
        logMsg(g, `⚠️ Seu mercenário defensor ${activeMerc.name} ficou sem vida e recuou!`, "#ef4444");
      }
    }
  }

  // Shield absorption mechanics
  let dmgToHp = real;
  let absorbed = 0;
  if (p.shield > 0) {
    absorbed = Math.min(p.shield, real);
    p.shield -= absorbed;
    dmgToHp -= absorbed;
    // Spawn shield sparks
    spawnParticles(g, p.pos.x, p.pos.y, "#38bdf8", 6, { size: 2.2 });
  }

  p.hp -= dmgToHp;
  p.shieldRechargeCd = 180; // 3 seconds recharge delay on taking damage
  p.invuln = 0.4;
  p.hitFlash = 0.2;

  // Floater damage notifications
  if (absorbed > 0) {
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 12,
      text: `🛡️ -${absorbed}`,
      color: "#38bdf8",
      life: 0.8,
      vy: -25,
    });
  }
  if (dmgToHp > 0) {
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 4,
      text: `${dmgToHp}`,
      color: "#ff6060",
      life: 0.8,
      vy: -30,
    });
  } else {
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 4,
      text: "ABSORVIDO",
      color: "#cbd5e1",
      life: 0.6,
      vy: -15,
    });
  }
  // Modificadores do atacante
  if (source?.modifiers) {
    for (const m of source.modifiers) {
      if (m.id === "vampirico") {
        source.hp = Math.min(source.maxHp, source.hp + Math.floor(real * 0.5));
      } else if (m.id === "congelante") {
        // slow curto no player
        p.speed = Math.max(1.5, p.speed - 0.6);
        setTimeout(() => {
          if (p.speed < 3.2) p.speed = Math.min(3.2, p.speed + 0.6);
        }, 900);
      }
    }
  }
  if (p.hp <= 0) {
    p.hp = Math.floor(p.maxHp * 0.5);
    p.gold = Math.floor(p.gold * 0.75);
    respawnInCity(g);
    logMsg(
      g,
      "Você caiu. Ressuscitado na Cidade Central de Asterion (perdeu 25% do ouro).",
      "#ff6060",
    );
  }
}

function classSkills(cls: import("./engine").PlayerClass): import("./engine").Skill[] {
  if (cls === "melee")
    return [
      {
        id: "cleave",
        name: "Corte Amplo",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Golpe em cone",
        key: "1",
      },
      {
        id: "shield",
        name: "Guarda de Ferro",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Invulnerável 1.5s",
        key: "2",
      },
      {
        id: "slash",
        name: "Golpe Giratório",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Dano em área ao redor",
        key: "3",
      },
      {
        id: "dash",
        name: "Investida",
        cost: 5,
        cd: 0,
        cur: 0,
        desc: "Impulso na direção",
        key: "4",
      },
    ];
  if (cls === "magic")
    return [
      {
        id: "bolt",
        name: "Raio Arcano",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Projétil rápido",
        key: "1",
      },
      {
        id: "fireball",
        name: "Bola de Fogo",
        cost: 22,
        cd: 0,
        cur: 0,
        desc: "Explosão em área",
        key: "2",
      },
      { id: "heal", name: "Cura Menor", cost: 15, cd: 0, cur: 0, desc: "Restaura HP", key: "3" },
      { id: "dash", name: "Piscar", cost: 8, cd: 0, cur: 0, desc: "Teleporte curto", key: "4" },
    ];
  if (cls === "paladin")
    return [
      {
        id: "smite",
        name: "Golpe Sagrado",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Dano sagrado + cura",
        key: "1",
      },
      { id: "heal", name: "Bênção", cost: 15, cd: 0, cur: 0, desc: "Restaura HP", key: "2" },
      {
        id: "slash",
        name: "Golpe Giratório",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Dano em área",
        key: "3",
      },
      {
        id: "dash",
        name: "Avanço Sagrado",
        cost: 5,
        cd: 0,
        cur: 0,
        desc: "Impulso na direção",
        key: "4",
      },
    ];
  if (cls === "necro")
    return [
      {
        id: "drain",
        name: "Dreno de Vida",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Projétil que cura",
        key: "1",
      },
      {
        id: "summon",
        name: "Invocar Esqueleto",
        cost: 25,
        cd: 0,
        cur: 0,
        desc: "Invoca aliado 20s",
        key: "2",
      },
      {
        id: "bolt",
        name: "Raio Sombrio",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Projétil arcano",
        key: "3",
      },
      {
        id: "heal",
        name: "Sangria Reversa",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Restaura HP",
        key: "4",
      },
    ];
  if (cls === "archer")
    return [
      {
        id: "quickshot",
        name: "Tiro Rápido",
        cost: 6,
        cd: 0,
        cur: 0,
        desc: "Flecha veloz longa",
        key: "1",
      },
      {
        id: "rain",
        name: "Chuva de Flechas",
        cost: 20,
        cd: 0,
        cur: 0,
        desc: "Flechas em área",
        key: "2",
      },
      { id: "dash", name: "Salto Ágil", cost: 5, cd: 0, cur: 0, desc: "Impulso ágil", key: "3" },
      { id: "heal", name: "Bandagem", cost: 12, cd: 0, cur: 0, desc: "Restaura HP", key: "4" },
    ];
  if (cls === "druid")
    return [
      {
        id: "entangle",
        name: "Enredar",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Espinhos imobilizantes",
        key: "1",
      },
      {
        id: "thorns",
        name: "Casca de Ferro",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Aumenta DEF por 3.5s",
        key: "2",
      },
      {
        id: "rejuvenate",
        name: "Rejuvenescer",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Regenera HP rápido",
        key: "3",
      },
      {
        id: "earthquake",
        name: "Terremoto",
        cost: 25,
        cd: 0,
        cur: 0,
        desc: "Tremor que causa AoE",
        key: "4",
      },
    ];
  if (cls === "assassin")
    return [
      {
        id: "backstab",
        name: "Apunhalar",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Golpe de alto crítico",
        key: "1",
      },
      {
        id: "smokebomb",
        name: "Fumaça Noturna",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Velocidade + Evasão",
        key: "2",
      },
      {
        id: "shuriken",
        name: "Leque Shuriken",
        cost: 8,
        cd: 0,
        cur: 0,
        desc: "Lança 3 projéteis",
        key: "3",
      },
      {
        id: "shadowstep",
        name: "Passo Sombrio",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Teleporte com dano",
        key: "4",
      },
    ];
  if (cls === "warlock")
    return [
      {
        id: "curse",
        name: "Dreno de Almas",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Dano de agonia contínuo",
        key: "1",
      },
      {
        id: "chaosbolt",
        name: "Seta do Caos",
        cost: 20,
        cd: 0,
        cur: 0,
        desc: "Projétil devastador",
        key: "2",
      },
      {
        id: "corruption",
        name: "Explosão Corrupta",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Dano em área e dreno",
        key: "3",
      },
      {
        id: "demon_shield",
        name: "Pacto Negro",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Defesa divina temporária",
        key: "4",
      },
    ];
  if (cls === "samurai")
    return [
      {
        id: "iaijutsu",
        name: "Iaijutsu Espetacular",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Investida cortante",
        key: "1",
      },
      {
        id: "parry",
        name: "Bloqueio Perfeito",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Contra-ataca ao ser atingido",
        key: "2",
      },
      {
        id: "focus",
        name: "Foco Interior",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Aumenta ATK por 3s",
        key: "3",
      },
      {
        id: "slash_wind",
        name: "Corte de Vento",
        cost: 8,
        cd: 0,
        cur: 0,
        desc: "Projétil de lâmina",
        key: "4",
      },
    ];
  if (cls === "monk")
    return [
      {
        id: "fists",
        name: "Punhos da Fúria",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Combo rápido corpo-a-corpo",
        key: "1",
      },
      {
        id: "chi_shield",
        name: "Barreira de Chi",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Escudo que restaura MP",
        key: "2",
      },
      {
        id: "kick",
        name: "Chute do Dragão",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Golpe que empurra",
        key: "3",
      },
      {
        id: "meditate",
        name: "Meditação Zen",
        cost: 20,
        cd: 0,
        cur: 0,
        desc: "Cura imóvel profunda",
        key: "4",
      },
    ];
  if (cls === "bard")
    return [
      {
        id: "sonata",
        name: "Sonata Sônica",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Ondas musicais de choque",
        key: "1",
      },
      {
        id: "tempo",
        name: "Ritmo Acelerado",
        cost: 8,
        cd: 0,
        cur: 0,
        desc: "Grande aumento de velocidade",
        key: "2",
      },
      {
        id: "lullaby",
        name: "Melodia Protetora",
        cost: 14,
        cd: 0,
        cur: 0,
        desc: "Debufa inimigos ao redor",
        key: "3",
      },
      {
        id: "harmony",
        name: "Acorde Harmônico",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Cura HP + MP",
        key: "4",
      },
    ];
  if (cls === "gunslinger")
    return [
      {
        id: "bullet_storm",
        name: "Tempestade de Balas",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Cone de fuzilaria rápida",
        key: "1",
      },
      {
        id: "grenade",
        name: "Granada Explosiva",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Explosão massiva",
        key: "2",
      },
      {
        id: "disengage",
        name: "Salto de Recuo",
        cost: 8,
        cd: 0,
        cur: 0,
        desc: "Salta para trás atirando",
        key: "3",
      },
      {
        id: "focus_shot",
        name: "Tiro de Precisão",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Disparo perfurante longo",
        key: "4",
      },
    ];
  if (cls === "alchemist")
    return [
      {
        id: "acid",
        name: "Bomba de Ácido",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Lança poça corrosiva",
        key: "1",
      },
      {
        id: "mutagen",
        name: "Elixir de Mutagênio",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Super buffs de ATK/DEF",
        key: "2",
      },
      {
        id: "homunculus",
        name: "Criar Homúnculo",
        cost: 20,
        cd: 0,
        cur: 0,
        desc: "Invoca ajudante explosivo",
        key: "3",
      },
      {
        id: "gold_transmute",
        name: "Transmutar Ouro",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Dano + ganho de ouro extra",
        key: "4",
      },
    ];
  if (cls === "vampire")
    return [
      {
        id: "bite",
        name: "Mordida Sombria",
        cost: 10,
        cd: 0,
        cur: 0,
        desc: "Dano alto que cura HP",
        key: "1",
      },
      {
        id: "swarm",
        name: "Nuvem de Morcegos",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Morcegos danificam em área",
        key: "2",
      },
      {
        id: "mist",
        name: "Forma de Névoa",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Fica invencível e veloz",
        key: "3",
      },
      {
        id: "blood_puddle",
        name: "Erupção de Sangue",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Poça que causa dano em área",
        key: "4",
      },
    ];
  if (cls === "ecomancer")
    return [
      {
        id: "eco_mark",
        name: "Marcar Instante",
        cost: 15,
        cd: 0,
        cur: 0,
        desc: "Grava a próxima skill; ela se re-executa em 3s a 70% de dano",
        key: "1",
      },
      {
        id: "eco_paradox",
        name: "Ecoar Paradoxo",
        cost: 20,
        cd: 0,
        cur: 0,
        desc: "2 projéteis + 2 ecos-espelho 1s depois",
        key: "2",
      },
      {
        id: "eco_collapse",
        name: "Colapso de Linha",
        cost: 30,
        cd: 0,
        cur: 0,
        desc: "Detona TODOS ecos ativos (+40% por eco)",
        key: "3",
      },
      {
        id: "eco_loop",
        name: "Loop Perpétuo",
        cost: 45,
        cd: 0,
        cur: 0,
        desc: "5s: toda skill gera eco extra. Drena 4% HP/s",
        key: "4",
      },
    ];
  if (cls === "symbiote")
    return [
      {
        id: "sym_devour",
        name: "Devorar Essência",
        cost: 12,
        cd: 0,
        cur: 0,
        desc: "Executa alvos <25% HP e absorve 1 essência (máx. 5)",
        key: "1",
      },
      {
        id: "sym_mutate",
        name: "Mutação Reativa",
        cost: 18,
        cd: 0,
        cur: 0,
        desc: "Consome 1 essência: buff dinâmico 10s",
        key: "2",
      },
      {
        id: "sym_swarm",
        name: "Enxame Parasita",
        cost: 28,
        cd: 0,
        cur: 0,
        desc: "Parasitas perseguem em área",
        key: "3",
      },
      {
        id: "sym_fusion",
        name: "Fusão Aberrante",
        cost: 50,
        cd: 0,
        cur: 0,
        desc: "Consome todas: cura 15%/essência + pulso combinado",
        key: "4",
      },
    ];
  // reaper
  return [
    {
      id: "scythe_sweep",
      name: "Corte da Foice",
      cost: 12,
      cd: 0,
      cur: 0,
      desc: "Ataque curvo de atração",
      key: "1",
    },
    {
      id: "soul_reap",
      name: "Ceifar Alma",
      cost: 14,
      cd: 0,
      cur: 0,
      desc: "Execução, cura se abater",
      key: "2",
    },
    {
      id: "grim_shroud",
      name: "Manto da Morte",
      cost: 15,
      cd: 0,
      cur: 0,
      desc: "Escudo de absorção vital",
      key: "3",
    },
    {
      id: "death_grip",
      name: "Puxão Sombrio",
      cost: 10,
      cd: 0,
      cur: 0,
      desc: "Puxa e reduz velocidade",
      key: "4",
    },
  ];
}

function useSkill(g: GameState, id: string) {
  const p = g.player;
  const s = p.skills.find((x) => x.id === id);
  const tb = p.talentBonuses || { mpCostMult: 1, cooldownMult: 1 };

  let costScale = tb.mpCostMult;
  if (g.activeArena && g.arenaModifier === "TEMPESTADE ARCANA") {
    costScale *= 2.0;
  }
  let effCost = Math.max(1, Math.floor(s?.cost ? s.cost * costScale : 0));
  let dMult = 1.0;

  // --- CLASS UNIQUE SKILL & RESOURCE INTERACTIONS ---
  if (p.cls === "magic") {
    if (p.classResource >= 100) {
      effCost = 0; // Sobrecarga: 0 mana!
      dMult = 2.0; // 100% extra damage
      p.classResource = 0; // reset Flow
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 12,
        text: "FLUXO TOTAL!",
        color: "#00ffff",
        life: 1,
        vy: -30,
      });
    }
  } else if (p.cls === "melee") {
    if (p.classResource >= 100) {
      dMult = 1.5; // Fúria total deals 50% extra damage!
      p.classResource = 0; // reset Rage
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 12,
        text: "RAIVA LIBERADA!",
        color: "#ff5000",
        life: 1.2,
        vy: -35,
      });
    }
  } else if (p.cls === "assassin") {
    const pts = p.classResource; // combo points
    if (pts > 0) {
      dMult = 1.0 + pts * 0.4; // up to 3.0x damage!
      p.classResource = 0; // consume combo points
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 12,
        text: `${pts}✦ COMBO EXEC!`,
        color: "#ff4060",
        life: 1,
        vy: -30,
      });
    }
  } else if (p.cls === "vampire") {
    // Skills cost HP (Blood pool) instead of MP
    effCost = 0;
    const hpCost = Math.max(1, Math.floor((s?.cost ?? 0) * 1.5));
    p.hp = Math.max(1, p.hp - hpCost);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: `-${hpCost}🩸`,
      color: "#ff3050",
      life: 0.8,
      vy: -20,
    });
  }

  if (!s || s.cur > 0 || (p.cls !== "vampire" && p.mp < effCost)) return;
  if (p.cls !== "vampire") {
    p.mp -= effCost;
  }

  p.tempDmgMult = dMult; // apply to all damageEnemy inside this execution

  const len = Math.hypot(p.facing.x, p.facing.y) || 1;
  const fx = p.facing.x / len,
    fy = p.facing.y / len;
  // Note: individual skill branches below still set s.cd (the base cooldown).
  // After dispatch we scale s.cd by talent cooldownMult once (see end of function).
  if (id === "slash") {
    s.cd = 0.6;
    s.cur = s.cd;
    const r = 90;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) damageEnemy(g, e, p.atk() * 1.4);
    }
  } else if (id === "cleave") {
    s.cd = 0.8;
    s.cur = s.cd;
    const r = 110;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      const d = Math.hypot(dx, dy);
      if (d < r) {
        const dot = (dx / d) * fx + (dy / d) * fy;
        if (dot > 0.2) damageEnemy(g, e, p.atk() * 1.8);
      }
    }
  } else if (id === "shield") {
    s.cd = 8;
    s.cur = s.cd;
    p.invuln = 1.5;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Guarda!",
      color: "#a0c0ff",
      life: 1,
      vy: -30,
    });
  } else if (id === "bolt") {
    s.cd = 0.4;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 8, y: fy * 8 },
      life: 1.2,
      damage: Math.floor(p.atk() * 1.6 + p.attr.int * 2),
      from: "player",
    });
  } else if (id === "fireball") {
    s.cd = 1.6;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 6, y: fy * 6 },
      life: 1.4,
      damage: Math.floor(p.atk() * 2.2 + p.attr.int * 4),
      from: "player",
    });
    // pseudo-AoE: hit enemies close to trajectory next tick already handled by projectile collide;
    // emulate AoE by damaging near landing point too
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - (p.pos.x + fx * 200),
        dy = e.pos.y - (p.pos.y + fy * 200);
      if (dx * dx + dy * dy < 90 * 90) damageEnemy(g, e, p.atk() * 1.2);
    }
  } else if (id === "heal") {
    s.cd = 4;
    s.cur = s.cd;
    const amt = 30 + p.attr.int * 3;
    p.hp = Math.min(p.maxHp, p.hp + amt);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: `+${amt}`,
      color: "#60ff80",
      life: 1,
      vy: -30,
    });
  } else if (id === "dash") {
    s.cd = 1.5;
    s.cur = s.cd;
    for (let i = 0; i < 8; i++) moveEntity(g, p.pos, fx * 8, fy * 8);
    p.invuln = 0.3;
  } else if (id === "smite") {
    s.cd = 0.9;
    s.cur = s.cd;
    let hit = false;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < 70 * 70) {
        damageEnemy(g, e, p.atk() * 2.0);
        hit = true;
      }
    }
    if (hit) {
      p.hp = Math.min(p.maxHp, p.hp + 12 + p.attr.int);
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: "Sagrado!",
        color: "#fff080",
        life: 1,
        vy: -30,
      });
    }
  } else if (id === "drain") {
    s.cd = 0.5;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 7, y: fy * 7 },
      life: 1.4,
      damage: Math.floor(p.atk() * 1.3 + p.attr.int * 2),
      from: "player",
    });
    // Heal a small tick per cast
    p.hp = Math.min(p.maxHp, p.hp + 4 + Math.floor(p.attr.int * 0.4));
  } else if (id === "summon") {
    s.cd = 8;
    s.cur = s.cd;
    const hp = 40 + p.attr.int * 5 + p.level * 4;
    p.minions.push({
      pos: { x: p.pos.x + fx * 24, y: p.pos.y + fy * 24 },
      vel: { x: 0, y: 0 },
      target: null,
      hp,
      maxHp: hp,
      life: 22,
      kind: "skeleton",
      attackCd: 0,
    });
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Esqueleto!",
      color: "#c060ff",
      life: 1,
      vy: -30,
    });
  } else if (id === "quickshot") {
    s.cd = 0.2;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 14, y: fy * 14 },
      life: 1.8,
      damage: Math.floor(p.atk() * 1.5 + p.attr.agi * 2),
      from: "player",
    });
  } else if (id === "rain") {
    s.cd = 2.5;
    s.cur = s.cd;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      g.projectiles.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: Math.cos(ang) * 8, y: Math.sin(ang) * 8 },
        life: 1.2,
        damage: Math.floor(p.atk() * 1.1 + p.attr.agi),
        from: "player",
      });
    }
  } else if (id === "entangle") {
    s.cd = 0.5;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 9, y: fy * 9 },
      life: 1.1,
      damage: Math.floor(p.atk() * 1.5 + p.attr.int * 2),
      from: "player",
      kind: "green_leaf",
    });
  } else if (id === "thorns") {
    s.cd = 6;
    s.cur = s.cd;
    p.invuln = 2.0;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Casca de Ferro!",
      color: "#5ea8ff",
      life: 1,
      vy: -30,
    });
  } else if (id === "rejuvenate") {
    s.cd = 4;
    s.cur = s.cd;
    const amt = 40 + p.attr.int * 4;
    p.hp = Math.min(p.maxHp, p.hp + amt);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: `+${amt} HP`,
      color: "#60ff80",
      life: 1,
      vy: -30,
    });
  } else if (id === "earthquake") {
    s.cd = 3.0;
    s.cur = s.cd;
    const r = 140;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 2.5 + p.attr.int * 3);
        spawnParticles(g, e.pos.x, e.pos.y, "#8a5a1a", 8);
      }
    }
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "TERREMOTO!",
      color: "#b08858",
      life: 1.2,
      vy: -35,
    });
  } else if (id === "backstab") {
    s.cd = 0.6;
    s.cur = s.cd;
    const r = 60;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 3.5 + p.attr.agi * 3);
        g.floaters.push({
          x: e.pos.x,
          y: e.pos.y - 12,
          text: "CRÍTICO!",
          color: "#ff4060",
          life: 1,
          vy: -40,
        });
      }
    }
  } else if (id === "smokebomb") {
    s.cd = 7;
    s.cur = s.cd;
    p.invuln = 2.5;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Fumaça!",
      color: "#a0a0a0",
      life: 1,
      vy: -30,
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#444444", 25, { size: 5, gravity: 0.01 });
  } else if (id === "shuriken") {
    s.cd = 0.3;
    s.cur = s.cd;
    const angles = [-0.2, 0, 0.2];
    for (const a of angles) {
      const cos = Math.cos(a),
        sin = Math.sin(a);
      const rfx = fx * cos - fy * sin;
      const rfy = fx * sin + fy * cos;
      g.projectiles.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: rfx * 12, y: rfy * 12 },
        life: 1.0,
        damage: Math.floor(p.atk() * 1.2 + p.attr.agi * 1.5),
        from: "player",
        kind: "dagger_throw",
      });
    }
  } else if (id === "shadowstep") {
    s.cd = 2.0;
    s.cur = s.cd;
    for (let i = 0; i < 15; i++) moveEntity(g, p.pos, fx * 10, fy * 10);
    p.invuln = 0.5;
    const r = 90;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 2.0 + p.attr.agi * 2);
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#8060ff", 15);
  } else if (id === "curse") {
    s.cd = 0.4;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 8, y: fy * 8 },
      life: 1.3,
      damage: Math.floor(p.atk() * 1.4 + p.attr.int * 2),
      from: "player",
      kind: "shadow_bolt",
    });
  } else if (id === "chaosbolt") {
    s.cd = 1.2;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 5.5, y: fy * 5.5 },
      life: 1.6,
      damage: Math.floor(p.atk() * 2.8 + p.attr.int * 5),
      from: "player",
      kind: "dark_bolt",
    });
  } else if (id === "corruption") {
    s.cd = 2.5;
    s.cur = s.cd;
    const r = 110;
    let count = 0;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 1.8 + p.attr.int * 2);
        count++;
      }
    }
    if (count > 0) {
      const healAmt = Math.min(100, count * (5 + Math.floor(p.attr.int * 0.5)));
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: `+${healAmt} Sifão`,
        color: "#a060ff",
        life: 1,
        vy: -30,
      });
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#800080", 20);
  } else if (id === "demon_shield") {
    s.cd = 9;
    s.cur = s.cd;
    p.invuln = 2.0;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Pacto Protetor!",
      color: "#c04070",
      life: 1,
      vy: -30,
    });
  } else if (id === "iaijutsu") {
    s.cd = 0.8;
    s.cur = s.cd;
    p.invuln = 0.4;
    for (let i = 0; i < 12; i++) moveEntity(g, p.pos, fx * 11, fy * 11);
    const r = 100;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 2.2 + p.attr.str * 1.5);
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#e0f0ff", 15);
  } else if (id === "parry") {
    s.cd = 4;
    s.cur = s.cd;
    p.invuln = 1.2;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Contra-Ataque!",
      color: "#ffe040",
      life: 1,
      vy: -30,
    });
  } else if (id === "focus") {
    s.cd = 6;
    s.cur = s.cd;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Foco Ampliado!",
      color: "#ff9040",
      life: 1,
      vy: -30,
    });
    p.hp = Math.min(p.maxHp, p.hp + 20 + p.attr.str);
  } else if (id === "slash_wind") {
    s.cd = 0.3;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 12, y: fy * 12 },
      life: 0.9,
      damage: Math.floor(p.atk() * 1.5 + p.attr.agi * 1.5),
      from: "player",
      kind: "katana_swing",
    });
  } else if (id === "fists") {
    s.cd = 0.25;
    s.cur = s.cd;
    for (let i = 0; i < 3; i++) {
      g.projectiles.push({
        pos: { x: p.pos.x + (Math.random() - 0.5) * 10, y: p.pos.y + (Math.random() - 0.5) * 10 },
        vel: { x: fx * 13, y: fy * 13 },
        life: 0.25,
        damage: Math.floor(p.atk() * 0.8 + p.attr.str * 0.6),
        from: "player",
        kind: "chi_punch",
      });
    }
  } else if (id === "chi_shield") {
    s.cd = 6;
    s.cur = s.cd;
    const mpAmt = 15 + Math.floor(p.attr.int * 1.5);
    p.mp = Math.min(p.maxMp, p.mp + mpAmt);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: `+${mpAmt} Mana`,
      color: "#80ffe0",
      life: 1,
      vy: -30,
    });
    p.invuln = 1.0;
  } else if (id === "kick") {
    s.cd = 0.8;
    s.cur = s.cd;
    const r = 90;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 2.0);
        const elen = Math.hypot(dx, dy) || 1;
        e.pos.x += (dx / elen) * 45;
        e.pos.y += (dy / elen) * 45;
      }
    }
    spawnParticles(g, p.pos.x + fx * 20, p.pos.y + fy * 20, "#ff5500", 12);
  } else if (id === "meditate") {
    s.cd = 10;
    s.cur = s.cd;
    const heal = Math.floor(p.maxHp * 0.4);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    p.mp = Math.min(p.maxMp, p.mp + 20);
    p.invuln = 1.5;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Zen!",
      color: "#fff",
      life: 1.2,
      vy: -30,
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#fff0a0", 25, { size: 3 });
  } else if (id === "sonata") {
    s.cd = 0.35;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 9, y: fy * 9 },
      life: 1.1,
      damage: Math.floor(p.atk() * 1.5 + p.attr.int * 1.5),
      from: "player",
      kind: "sonic_note",
    });
  } else if (id === "tempo") {
    s.cd = 5;
    s.cur = s.cd;
    p.invuln = 0.8;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Ritmo!",
      color: "#80ffe0",
      life: 1,
      vy: -30,
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#00ffff", 15);
  } else if (id === "lullaby") {
    s.cd = 2.0;
    s.cur = s.cd;
    const r = 120;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 1.4);
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#ffe040", 20);
  } else if (id === "harmony") {
    s.cd = 5;
    s.cur = s.cd;
    const hp = 30 + p.attr.int * 2;
    const mp = 15 + Math.floor(p.attr.int * 0.8);
    p.hp = Math.min(p.maxHp, p.hp + hp);
    p.mp = Math.min(p.maxMp, p.mp + mp);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Harmonia!",
      color: "#fff080",
      life: 1,
      vy: -30,
    });
  } else if (id === "bullet_storm") {
    s.cd = 0.5;
    s.cur = s.cd;
    for (let i = -2; i <= 2; i++) {
      const ang = i * 0.12;
      const cos = Math.cos(ang),
        sin = Math.sin(ang);
      const rfx = fx * cos - fy * sin;
      const rfy = fx * sin + fy * cos;
      g.projectiles.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: rfx * 15, y: rfy * 15 },
        life: 0.8,
        damage: Math.floor(p.atk() * 0.9 + p.attr.agi * 0.8),
        from: "player",
        kind: "bullet",
      });
    }
  } else if (id === "grenade") {
    s.cd = 1.8;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 7, y: fy * 7 },
      life: 1.0,
      damage: Math.floor(p.atk() * 2.8 + p.attr.agi * 3),
      from: "player",
      kind: "flask",
    });
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - (p.pos.x + fx * 160),
        dy = e.pos.y - (p.pos.y + fy * 160);
      if (dx * dx + dy * dy < 80 * 80) damageEnemy(g, e, p.atk() * 1.5);
    }
  } else if (id === "disengage") {
    s.cd = 1.5;
    s.cur = s.cd;
    p.invuln = 0.4;
    for (let i = 0; i < 8; i++) moveEntity(g, p.pos, -fx * 9, -fy * 9);
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 14, y: fy * 14 },
      life: 1.0,
      damage: Math.floor(p.atk() * 1.5 + p.attr.agi * 1.5),
      from: "player",
      kind: "bullet",
    });
  } else if (id === "focus_shot") {
    s.cd = 1.0;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 18, y: fy * 18 },
      life: 1.4,
      damage: Math.floor(p.atk() * 2.4 + p.attr.agi * 4),
      from: "player",
      kind: "bullet",
    });
  } else if (id === "acid") {
    s.cd = 0.5;
    s.cur = s.cd;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 8, y: fy * 8 },
      life: 1.1,
      damage: Math.floor(p.atk() * 1.4 + p.attr.int * 2),
      from: "player",
      kind: "flask",
    });
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - (p.pos.x + fx * 180),
        dy = e.pos.y - (p.pos.y + fy * 180);
      if (dx * dx + dy * dy < 70 * 70) damageEnemy(g, e, p.atk() * 1.0);
    }
  } else if (id === "mutagen") {
    s.cd = 7;
    s.cur = s.cd;
    p.hp = Math.min(p.maxHp, p.hp + 35);
    p.invuln = 1.8;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Mutação!",
      color: "#80e060",
      life: 1.2,
      vy: -30,
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#00ff00", 20);
  } else if (id === "homunculus") {
    s.cd = 7;
    s.cur = s.cd;
    const hp = 30 + p.attr.int * 4;
    p.minions.push({
      pos: { x: p.pos.x + fx * 24, y: p.pos.y + fy * 24 },
      vel: { x: 0, y: 0 },
      target: null,
      hp,
      maxHp: hp,
      life: 18,
      kind: "skeleton",
      attackCd: 0,
    });
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Homúnculo!",
      color: "#80e060",
      life: 1,
      vy: -30,
    });
  } else if (id === "gold_transmute") {
    s.cd = 1.5;
    s.cur = s.cd;
    let goldGain = 0;
    const r = 80;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 1.6 + p.attr.int * 2);
        goldGain += 10 + Math.floor(Math.random() * 10);
      }
    }
    if (goldGain > 0) {
      p.gold += goldGain;
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: `+${goldGain}g`,
        color: "#f0b040",
        life: 1,
        vy: -30,
      });
      spawnParticles(g, p.pos.x, p.pos.y, "#f0b040", 15);
    }
  } else if (id === "bite") {
    s.cd = 0.5;
    s.cur = s.cd;
    let bit = false;
    const r = 60;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 2.5);
        bit = true;
      }
    }
    if (bit) {
      const heal = 15 + Math.floor(p.attr.str * 0.8);
      p.hp = Math.min(p.maxHp, p.hp + heal);
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: `+${heal} HP`,
        color: "#ff4060",
        life: 1,
        vy: -30,
      });
    }
  } else if (id === "swarm") {
    s.cd = 3.0;
    s.cur = s.cd;
    const r = 110;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 1.6);
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#990000", 25, { size: 3 });
  } else if (id === "mist") {
    s.cd = 6;
    s.cur = s.cd;
    p.invuln = 2.0;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Forma de Névoa!",
      color: "#c04070",
      life: 1,
      vy: -30,
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#550000", 20);
  } else if (id === "blood_puddle") {
    s.cd = 2.5;
    s.cur = s.cd;
    const r = 120;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 2.2 + p.attr.str * 2);
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#ff0000", 30);
  } else if (id === "scythe_sweep") {
    s.cd = 0.55;
    s.cur = s.cd;
    const r = 100;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      const d = Math.hypot(dx, dy);
      if (d < r) {
        const dot = (dx / d) * fx + (dy / d) * fy;
        if (dot > 0.1) damageEnemy(g, e, p.atk() * 2.0 + p.attr.str * 1.5);
      }
    }
  } else if (id === "soul_reap") {
    s.cd = 1.0;
    s.cur = s.cd;
    let hit = false;
    const r = 70;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        const isLow = e.hp / e.maxHp < 0.25;
        const multiplier = isLow ? 4.0 : 1.8;
        damageEnemy(g, e, p.atk() * multiplier);
        hit = true;
      }
    }
    if (hit) {
      p.hp = Math.min(p.maxHp, p.hp + 10 + Math.floor(p.attr.str * 0.5));
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: "Ceifar!",
        color: "#9a40ff",
        life: 1,
        vy: -30,
      });
    }
  } else if (id === "grim_shroud") {
    s.cd = 8;
    s.cur = s.cd;
    p.invuln = 2.0;
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "Manto da Morte!",
      color: "#a060ff",
      life: 1.2,
      vy: -30,
    });
  } else if (id === "death_grip") {
    s.cd = 2.0;
    s.cur = s.cd;
    const r = 130;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, p.atk() * 1.4);
        e.pos.x = p.pos.x + fx * 30;
        e.pos.y = p.pos.y + fy * 30;
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#201040", 20);
  } else if (id === "eco_mark") {
    s.cd = 6;
    s.cur = s.cd;
    p.markedNextSkill = { power: 0.7, expiresIn: 3.0 };
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: "⧗ Instante Marcado!",
      color: "#22d3ee",
      life: 1.2,
      vy: -30,
    });
  } else if (id === "eco_paradox") {
    s.cd = 5;
    s.cur = s.cd;
    const dmg = Math.floor(p.atk() * 1.9 + p.attr.int * 3);
    for (const ang of [0.25, -0.25]) {
      const cs = Math.cos(ang),
        sn = Math.sin(ang);
      g.projectiles.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: (fx * cs - fy * sn) * 8, y: (fx * sn + fy * cs) * 8 },
        life: 1.4,
        damage: dmg,
        from: "player",
      });
    }
    queueEcho(p, {
      id: `paradox-L-${g.time}`,
      abilityId: "eco_paradox",
      delay: 1.0,
      totalDelay: 1.0,
      power: 0.7,
      targetX: p.pos.x + fx * 200,
      targetY: p.pos.y + fy * 200,
      color: "#67e8f9",
      from: "paradox",
    });
    queueEcho(p, {
      id: `paradox-R-${g.time}`,
      abilityId: "eco_paradox",
      delay: 1.0,
      totalDelay: 1.0,
      power: 0.7,
      targetX: p.pos.x - fx * 200,
      targetY: p.pos.y - fy * 200,
      color: "#67e8f9",
      from: "paradox",
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#22d3ee", 12);
  } else if (id === "eco_collapse") {
    s.cd = 12;
    s.cur = s.cd;
    const echoes = p.echoQueue?.length ?? 0;
    p.echoQueue = [];
    const boost = 1 + Math.min(5, echoes) * 0.4;
    const r = 150;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) damageEnemy(g, e, (p.atk() * 1.6 + p.attr.int * 3) * boost);
    }
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 12,
      text: `⧗ COLAPSO x${echoes}!`,
      color: "#0891b2",
      life: 1.3,
      vy: -35,
    });
    spawnParticles(g, p.pos.x, p.pos.y, "#a5f3fc", 24 + echoes * 6);
  } else if (id === "eco_loop") {
    s.cd = 25;
    s.cur = s.cd;
    applyEffect(p, {
      id: "eco_loop",
      kind: "buff",
      duration: 5,
      totalDuration: 5,
      stacks: 1,
      maxStacks: 1,
      label: "Loop Perpétuo",
      color: "#a5f3fc",
      icon: "♾️",
      tickDmg: p.maxHp * 0.04,
      tickInterval: 1,
    });
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 12,
      text: "♾️ LOOP ATIVO",
      color: "#a5f3fc",
      life: 1.4,
      vy: -35,
    });
  } else if (id === "sym_devour") {
    s.cd = 3;
    s.cur = s.cd;
    const r = 80;
    let devoured = false;
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        const isLow = e.hp / e.maxHp < 0.25;
        damageEnemy(g, e, p.atk() * (isLow ? 4.5 : 2.5));
        if (isLow || e.hp <= 0) {
          const kinds: EssenceKind[] = ["fire", "ice", "shadow", "blood"];
          const k = kinds[Math.floor(Math.random() * 4)]!;
          addEssence(p, k);
          const icon = k === "fire" ? "🔥" : k === "ice" ? "❄️" : k === "shadow" ? "🌑" : "🩸";
          g.floaters.push({
            x: p.pos.x,
            y: p.pos.y - 8,
            text: `+${icon} (${p.essences?.length}/${p.essenceMax})`,
            color: "#65a30d",
            life: 1.2,
            vy: -30,
          });
          devoured = true;
        }
      }
    }
    if (!devoured)
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: "sem essência",
        color: "#a3a3a3",
        life: 0.8,
        vy: -20,
      });
  } else if (id === "sym_mutate") {
    s.cd = 8;
    s.cur = s.cd;
    const k = consumeEssence(p);
    if (!k) {
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: "sem essência!",
        color: "#dc2626",
        life: 1,
        vy: -30,
      });
    } else {
      const presets: Record<EssenceKind, StatusEffect> = {
        fire: {
          id: "mut_fire",
          kind: "buff",
          duration: 10,
          totalDuration: 10,
          stacks: 1,
          maxStacks: 1,
          label: "Mutação: Chama",
          color: "#f97316",
          icon: "🔥",
          mod: { dmgMult: 1.4 },
        },
        ice: {
          id: "mut_ice",
          kind: "buff",
          duration: 10,
          totalDuration: 10,
          stacks: 1,
          maxStacks: 1,
          label: "Mutação: Gelo",
          color: "#38bdf8",
          icon: "❄️",
          mod: { defMult: 1.4 },
        },
        shadow: {
          id: "mut_shadow",
          kind: "buff",
          duration: 10,
          totalDuration: 10,
          stacks: 1,
          maxStacks: 1,
          label: "Mutação: Sombra",
          color: "#a855f7",
          icon: "🌑",
          mod: { lifesteal: 0.25 },
        },
        blood: {
          id: "mut_blood",
          kind: "buff",
          duration: 10,
          totalDuration: 10,
          stacks: 1,
          maxStacks: 1,
          label: "Mutação: Sangue",
          color: "#dc2626",
          icon: "🩸",
          mod: { maxHpBonus: Math.floor(p.maxHp * 0.3) },
        },
      };
      applyEffect(p, presets[k]);
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 12,
        text: `Mutação ${k}!`,
        color: presets[k].color,
        life: 1.3,
        vy: -35,
      });
    }
  } else if (id === "sym_swarm") {
    s.cd = 10;
    s.cur = s.cd;
    const dmg = Math.floor(p.atk() * 2.1 + p.attr.int * 2);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      g.projectiles.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: Math.cos(ang) * 6, y: Math.sin(ang) * 6 },
        life: 1.6,
        damage: dmg,
        from: "player",
      });
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#4d7c0f", 20);
  } else if (id === "sym_fusion") {
    s.cd = 30;
    s.cur = s.cd;
    const list = consumeAllEssences(p);
    const heal = Math.floor(p.maxHp * 0.15 * list.length);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 12,
      text: `+${heal} FUSÃO x${list.length}`,
      color: "#4c1d95",
      life: 1.4,
      vy: -35,
    });
    const r = 180;
    const dmgBase = p.atk() * 3.0 * (1 + list.length * 0.2);
    for (const e of [...g.enemies]) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < r * r) {
        damageEnemy(g, e, dmgBase);
        if (list.includes("fire"))
          applyEffect(e as unknown as import("./statusEffects").EffectHost, {
            id: "burn",
            kind: "burn",
            duration: 4,
            totalDuration: 4,
            stacks: 1,
            maxStacks: 5,
            label: "Queimadura",
            color: "#f97316",
            tickDmg: 8,
            tickInterval: 1,
          });
      }
    }
    spawnParticles(g, p.pos.x, p.pos.y, "#4c1d95", 40);
  }

  // Ecomante — Marcar Instante: grava a skill recém-lançada
  if (p.markedNextSkill && id !== "eco_mark" && id !== "eco_collapse") {
    queueEcho(p, {
      id: `mark-${id}-${g.time}`,
      abilityId: id,
      delay: 3.0,
      totalDelay: 3.0,
      power: p.markedNextSkill.power,
      targetX: p.pos.x + fx * 150,
      targetY: p.pos.y + fy * 150,
      color: "#22d3ee",
      from: "mark",
    });
    p.markedNextSkill = null;
  }
  // Loop Perpétuo: eco extra grátis por cast
  if (
    p.statusEffects?.some((e) => e.id === "eco_loop") &&
    id !== "eco_collapse" &&
    id !== "eco_loop"
  ) {
    queueEcho(p, {
      id: `loop-${id}-${g.time}`,
      abilityId: id,
      delay: 1.5,
      totalDelay: 1.5,
      power: 0.6,
      targetX: p.pos.x + fx * 150,
      targetY: p.pos.y + fy * 150,
      color: "#a5f3fc",
      from: "loop",
    });
  }

  // Apply talent cooldown reduction once, uniformly across every skill.
  if (s) {
    let cdScale = tb.cooldownMult;
    if (g.activeArena && g.arenaModifier === "TEMPESTADE ARCANA") {
      cdScale *= 0.5;
    }
    s.cd = s.cd * cdScale;
    s.cur = s.cd;
  }
  p.tempDmgMult = 1.0;
}

function basicAttack(g: GameState) {
  const p = g.player;
  if (p.attackCd > 0) return;
  const len = Math.hypot(p.facing.x, p.facing.y) || 1;
  const fx = p.facing.x / len,
    fy = p.facing.y / len;

  // === Coleta de madeira ===
  // No overworld, se houver uma árvore (kind 4) à frente do jogador, o ataque
  // básico corta a árvore e concede 1 unidade de madeira (necessária p/ barco).
  if (g.activeMap === g.world) {
    const tx = Math.floor((p.pos.x + fx * TILE * 0.9) / TILE);
    const ty = Math.floor((p.pos.y + fy * TILE * 0.9) / TILE);
    const tile = g.world.get(tx, ty);
    if (tile && tile.kind === 4) {
      g.world.tiles[g.world.idx(tx, ty)] = { kind: 0, biome: tile.biome };
      addWood(1);
      p.attackCd = 0.35;
      g.floaters.push({
        x: tx * TILE + TILE / 2,
        y: ty * TILE + TILE / 2,
        text: "+1 Madeira",
        color: "#8fd48f",
        life: 1.2,
        vy: -25,
      });
      logMsg(g, "Você coletou madeira (+1).", "#8fd48f");
      return;
    }
  }

  // Track combo timer
  p.comboTimer = 2.5; // combo resets if no attacks for 2.5s
  p.comboCount++;

  // 1. Archer (Arqueiro) - Focus Mechanics
  if (p.cls === "archer") {
    // Focus bonus: up to +50% extra damage
    const focusMult = 1.0 + (p.classResource / 100) * 0.5;
    const haste = (p.talents?.cap_archer_haste ?? 0) > 0 ? 0.65 : 1.0;
    p.attackCd = 0.18 * haste;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 14, y: fy * 14 },
      life: 1.2,
      damage: Math.floor((p.atk() + Math.floor(p.attr.agi * 0.6)) * focusMult),
      from: "player",
      kind: (p.talents?.cap_archer_pierce ?? 0) > 0 ? "piercing_arrow" : "arrow",
    });
    return;
  }

  // 2. Necromancer (Necromante) - Soul Mechanics
  if (p.cls === "necro") {
    p.attackCd = 0.35;
    p.classResource = Math.min(100, p.classResource + 6); // standard soul gain on strike
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 8, y: fy * 8 },
      life: 1.1,
      damage: p.atk() + Math.floor(p.attr.int * 0.6),
      from: "player",
      kind: "dark_bolt",
    });
    return;
  }

  // 3. Mage (Mago) - Mana Flow Mechanics
  if (p.cls === "magic") {
    p.attackCd = 0.28;
    p.classResource = Math.min(100, p.classResource + 10);
    if (p.classResource >= 100) {
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 12,
        text: "SOBRECARGA!",
        color: "#00ffff",
        life: 1,
        vy: -30,
      });
    }
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 10, y: fy * 10 },
      life: 0.8,
      damage: p.atk() + Math.floor(p.attr.int * 0.5),
      from: "player",
      kind: "magic_bolt",
    });
    return;
  }

  // 4. Paladin (Paladino) - Holy Light
  if (p.cls === "paladin") {
    p.attackCd = 0.24;
    p.classResource = Math.min(100, p.classResource + 15); // charges Holy Light
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 13, y: fy * 13 },
      life: 0.18,
      damage: p.atk() + Math.floor(p.attr.int * 0.3),
      from: "player",
      kind: "holy_swing",
    });
    return;
  }

  // 5. Druid (Druida) - Nature Grace
  if (p.cls === "druid") {
    p.attackCd = 0.25;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 11, y: fy * 11 },
      life: 0.9,
      damage: p.atk() + Math.floor(p.attr.int * 0.4),
      from: "player",
      kind: "green_leaf",
    });
    return;
  }

  // 6. Assassin (Assassino) - Combo points builder
  if (p.cls === "assassin") {
    p.attackCd = 0.16;
    p.classResource = Math.min(5, p.classResource + 1); // builds combo points (max 5)
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 14, y: fy * 14 },
      life: 0.16,
      damage: p.atk() + Math.floor(p.attr.agi * 0.5),
      from: "player",
      kind: "dagger_throw",
    });
    return;
  }

  // 7. Warlock (Bruxo) - Soul Shards
  if (p.cls === "warlock") {
    p.attackCd = 0.3;
    p.classResource = Math.min(100, p.classResource + 8);
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 9, y: fy * 9 },
      life: 1.0,
      damage: p.atk() + Math.floor(p.attr.int * 0.55),
      from: "player",
      kind: "shadow_bolt",
    });
    return;
  }

  // 8. Samurai (Samurai) - Stance & Multi-Slash Combo
  if (p.cls === "samurai") {
    p.classResource = Math.min(100, p.classResource + 15);
    if (p.classResource >= 100) {
      // Execute 3-hit swift strike!
      p.attackCd = 0.32;
      p.classResource = 0; // consume Postura
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: "SHINSOKU!",
        color: "#ffe040",
        life: 1,
        vy: -30,
      });
      for (let i = 0; i < 3; i++) {
        const offsetAng = (i - 1) * 0.15;
        const cos = Math.cos(offsetAng),
          sin = Math.sin(offsetAng);
        const rfx = fx * cos - fy * sin;
        const rfy = fx * sin + fy * cos;
        g.projectiles.push({
          pos: { x: p.pos.x, y: p.pos.y },
          vel: { x: rfx * 18, y: rfy * 18 },
          life: 0.16,
          damage: Math.floor((p.atk() + Math.floor(p.attr.str * 0.45)) * 0.85),
          from: "player",
          kind: "katana_swing",
        });
      }
    } else {
      p.attackCd = 0.18;
      g.projectiles.push({
        pos: { x: p.pos.x, y: p.pos.y },
        vel: { x: fx * 16, y: fy * 16 },
        life: 0.14,
        damage: p.atk() + Math.floor(p.attr.str * 0.4 + p.attr.agi * 0.2),
        from: "player",
        kind: "katana_swing",
      });
    }
    return;
  }

  // 9. Monk (Monge) - Chi charging
  if (p.cls === "monk") {
    p.attackCd = 0.15;
    p.classResource = Math.min(100, p.classResource + 10);
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 14, y: fy * 14 },
      life: 0.12,
      damage: p.atk() + Math.floor(p.attr.str * 0.3 + p.attr.agi * 0.2),
      from: "player",
      kind: "chi_punch",
    });
    return;
  }

  // 10. Bard (Bardo) - Musical chords builder
  if (p.cls === "bard") {
    p.attackCd = 0.26;
    p.classResource = Math.min(100, p.classResource + 15);
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 9.5, y: fy * 9.5 },
      life: 0.95,
      damage: p.atk() + Math.floor(p.attr.int * 0.4),
      from: "player",
      kind: "sonic_note",
    });
    return;
  }

  // 11. Gunslinger (Pistoleiro) - Bullet clip system
  if (p.cls === "gunslinger") {
    if (p.classResource <= 0) {
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 8,
        text: "RECARREGANDO!",
        color: "#ff4040",
        life: 0.8,
        vy: -25,
      });
      p.attackCd = 0.7; // brief reload freeze
      p.classResource = 6; // full clip reload
      return;
    }
    p.classResource--; // fire one bullet
    p.attackCd = 0.14;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 18, y: fy * 18 },
      life: 0.7,
      damage: p.atk() + Math.floor(p.attr.agi * 0.4),
      from: "player",
      kind: "bullet",
    });
    return;
  }

  // 12. Alchemist (Alquimista) - Corrosive Flask
  if (p.cls === "alchemist") {
    p.attackCd = 0.28;
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 10, y: fy * 10 },
      life: 0.8,
      damage: p.atk() + Math.floor(p.attr.int * 0.5),
      from: "player",
      kind: "flask",
    });
    return;
  }

  // 13. Vampire (Vampiro) - Blood generation & heal on basic
  if (p.cls === "vampire") {
    p.attackCd = 0.2;
    p.classResource = Math.min(100, p.classResource + 15); // blood pool
    const healAmt = Math.max(1, Math.floor(p.maxHp * 0.03));
    p.hp = Math.min(p.maxHp, p.hp + healAmt);
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 15, y: fy * 15 },
      life: 0.15,
      damage: p.atk() + Math.floor(p.attr.str * 0.45),
      from: "player",
      kind: "blood_slash",
    });
    return;
  }

  // 14. Reaper (Ceifador) - Death Energy
  if (p.cls === "reaper") {
    p.attackCd = 0.22;
    p.classResource = Math.min(100, p.classResource + 10);
    g.projectiles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: fx * 15, y: fy * 15 },
      life: 0.18,
      damage: p.atk() + Math.floor(p.attr.str * 0.5),
      from: "player",
      kind: "scythe_slash",
    });
    return;
  }

  // 15. Warrior (Guerreiro / Melee) - Fury Mechanics
  p.attackCd = 0.2;
  p.classResource = Math.min(100, p.classResource + 15); // generates Rage
  g.projectiles.push({
    pos: { x: p.pos.x, y: p.pos.y },
    vel: { x: fx * 15, y: fy * 15 },
    life: 0.15,
    damage: p.atk() + Math.floor(p.attr.str * 0.5),
    from: "player",
    kind: "sword_swing",
  });
}

// -------- Floor transitions --------
function snapshotFloor(g: GameState) {
  g.snapshots.set(floorKey(g), {
    enemies: g.enemies,
    loot: g.loot,
    projectiles: g.projectiles,
    spawnTimer: g.spawnTimer,
    bossTimer: g.bossTimer,
  });
}
function restoreFloor(g: GameState, key: string) {
  const snap = g.snapshots.get(key);
  if (snap) {
    g.enemies = snap.enemies;
    g.loot = snap.loot;
    g.projectiles = snap.projectiles;
    g.spawnTimer = snap.spawnTimer;
    g.bossTimer = snap.bossTimer;
  } else {
    g.enemies = [];
    g.loot = [];
    g.projectiles = [];
    g.spawnTimer = 0;
    g.bossTimer = 20;
  }
}

function getOrCreateFloor(g: GameState, biomeId: number, floor: number): CaveFloor {
  const key = `${biomeId}:${floor}`;
  let cave = g.caves.get(key);
  if (!cave) {
    cave = new CaveFloor(biomeId, g.world.seed * 31 + biomeId * 977 + floor * 104729, floor);
    g.caves.set(key, cave);
  }
  return cave;
}

// Descend: overworld -> 2, or floor N -> N+1. Endgame biomes (61..70) go to
// floor 11 (10 sub-floors); every other biome caps at floor 4 (3 sub-floors).
function biomeMaxFloor(biomeId: number): number {
  if (biomeId >= 4000) return 7; // novas ilhas 35..54: 6 sub-andares de profundidade (andares 2 a 7)
  if (biomeId >= 2000) return 14; // novas ilhas 15..34: 13 sub-andares de profundidade (andares 2 a 14)
  if (biomeId >= 601) return 6; // novas ilhas 5..14: 5 sub-andares de profundidade (andares 2 a 6)
  if (biomeId >= 501) return 13; // lendários/divinos: 12 sub-andares
  if (biomeId >= 61 && biomeId <= 70) return 11; // endgame: 10 sub-andares
  if (biomeId >= 71 && biomeId <= 80) return 6; // ocidentais: 5 sub-andares
  return 4;
}
function descend(g: GameState, biomeId: number) {
  snapshotFloor(g);
  const nextFloor = g.activeFloor === 1 ? 2 : g.activeFloor + 1;
  const cap = biomeMaxFloor(biomeId);
  if (nextFloor > cap) return;
  const cave = getOrCreateFloor(g, biomeId, nextFloor);
  g.activeMap = cave;
  g.activeCaveBiome = biomeId;
  g.activeFloor = nextFloor;
  addTrophies(g, 20, "Alcançou um novo andar!", "Reached a new floor!");
  g.player.pos.x = cave.spawn.x;
  g.player.pos.y = cave.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.2;
  const b = BIOMES.find((bb) => bb.id === biomeId);
  if (b) {
    const sub = nextFloor - 1;
    const label =
      nextFloor === 2
        ? `${b.caveTheme.label} (1º subsolo)`
        : nextFloor === 3
          ? `Masmorra Fria (2º subsolo)`
          : nextFloor === 4
            ? `Santuário de ${b.name} (3º subsolo)`
            : nextFloor === cap
              ? `Câmara Suprema de ${b.name} (${sub}º subsolo · FINAL)`
              : `Abismo Profundo de ${b.name} (${sub}º subsolo)`;
    logMsg(g, `Desceu para: ${label} de ${b.name}.`, "#f0c040");
  }
}

// Portal do Mundo Alternativo — entra no biome 81..90 (rotativo por uso).
function enterAltWorld(g: GameState) {
  const target = 81 + (g.altPortalIndex % 10);
  g.altPortalIndex = (g.altPortalIndex + 1) % 10;
  snapshotFloor(g);
  const cave = getOrCreateFloor(g, target, 2);
  g.activeMap = cave;
  g.activeCaveBiome = target;
  g.activeFloor = 2;
  g.player.pos.x = cave.spawn.x;
  g.player.pos.y = cave.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.6;
  const b = BIOMES.find((bb) => bb.id === target);
  addTrophies(g, 40, "Cruzou o Portal Alternativo!", "Crossed the Alt Portal!");
  logMsg(g, `Portal do Mundo Alternativo → ${b?.name ?? `biome ${target}`}`, "#ff80ff");
  logMsg(g, `Use o portal novamente para ir ao próximo Alt-biome (10 no total).`, "#c060ff");
}

// Portal do Labirinto do Abismo — entra no biome 150
export function enterAbismoLabyrinth(g: GameState) {
  const target = 150;
  snapshotFloor(g);
  const cave = getOrCreateFloor(g, target, 2);
  g.activeMap = cave;
  g.activeCaveBiome = target;
  g.activeFloor = 2;
  g.player.pos.x = cave.spawn.x;
  g.player.pos.y = cave.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.6;
  addTrophies(g, 45, "Adentrou o Labirinto do Abismo!", "Adentered the Abyss Labyrinth!");
  logMsg(g, `Portal do Abismo → Adentrou o Labirinto do Abismo!`, "#8020e0");
  logMsg(
    g,
    `Cuidado: A gravidade deste labirinto altera e puxa em direções variantes a cada 8 segundos!`,
    "#c080ff",
  );
}

// Portal da Fenda Cósmica — entra no biome 200
export function enterCosmicSingularity(g: GameState) {
  const target = 200;
  snapshotFloor(g);
  const cave = getOrCreateFloor(g, target, 2);
  g.activeMap = cave;
  g.activeCaveBiome = target;
  g.activeFloor = 2;
  g.player.pos.x = cave.spawn.x;
  g.player.pos.y = cave.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 2.0;
  addTrophies(g, 100, "Viajante do Tempo-Espaço!", "Space-Time Traveler!");
  logMsg(g, `🌌 Fenda Cósmica → Adentrou o Nexo da Singularidade Temporal!`, "#ffaa00");
  logMsg(g, `O tecido do tempo se estica aqui. O chefe Chronos aguarda o seu desafio!`, "#ffc040");
}

// Ascend: floor N -> N-1, floor 2 -> overworld
function ascend(g: GameState) {
  if (!g.activeCaveBiome) return;
  snapshotFloor(g);
  const biomeId = g.activeCaveBiome;
  const prevFloor = g.activeFloor - 1;
  if (prevFloor <= 1) {
    g.activeMap = g.world;
    g.activeCaveBiome = null;
    g.activeFloor = 1;
    const stair = g.world.stairs.find((s) => s.biome === biomeId);
    if (stair) {
      g.player.pos.x = stair.x;
      g.player.pos.y = stair.y;
    } else {
      g.player.pos.x = g.world.spawn.x;
      g.player.pos.y = g.world.spawn.y;
    }
    g.camera.x = g.player.pos.x;
    g.camera.y = g.player.pos.y;
    restoreFloor(g, "overworld");
    g.stairCd = 1.2;
    logMsg(g, "Voltou ao overworld.", "#8fcfff");
    return;
  }
  const cave = getOrCreateFloor(g, biomeId, prevFloor);
  g.activeMap = cave;
  g.activeFloor = prevFloor;
  // land on stair-down of the previous floor if present, else its spawn
  const downStair = cave.stairs.find((s) => s.kind === "down");
  if (downStair) {
    g.player.pos.x = downStair.x;
    g.player.pos.y = downStair.y;
  } else {
    g.player.pos.x = cave.spawn.x;
    g.player.pos.y = cave.spawn.y;
  }
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.2;
  logMsg(g, `Subiu para o ${prevFloor}º andar.`, "#8fcfff");
}

// -------- Grand Dungeon of Asterion (100 floors) --------
function getOrCreateGrandFloor(g: GameState, floor: number): GrandDungeonFloor {
  let f = g.grandFloors.get(floor);
  if (!f) {
    f = new GrandDungeonFloor(floor, g.world.seed * 7919 + floor * 15485863);
    g.grandFloors.set(floor, f);
  }
  return f;
}

// Enter grand dungeon from city (or go deeper)
function descendGrand(g: GameState) {
  snapshotFloor(g);
  const nextFloor = g.activeGrandFloor === 0 ? 1 : g.activeGrandFloor + 1;
  if (nextFloor > GRAND_MAX_FLOOR) {
    logMsg(g, "Você já está no fundo da Masmorra de Asterion.", "#f0c040");
    return;
  }
  const floor = getOrCreateGrandFloor(g, nextFloor);
  g.activeMap = floor;
  g.activeGrandFloor = nextFloor;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  addTrophies(g, 20, "Alcançou um novo andar da Masmorra!", "Reached a new dungeon floor!");
  g.player.pos.x = floor.spawn.x;
  g.player.pos.y = floor.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.4;
  const mul = difficultyMultiplier(nextFloor).toFixed(2);
  logMsg(
    g,
    `Desceu para o ${nextFloor}º andar da Masmorra de Asterion. Dificuldade x${mul}.`,
    "#f0b040",
  );
  if (nextFloor === GRAND_MAX_FLOOR)
    logMsg(g, "Você chegou ao 100º andar. A Câmara Final.", "#ff8060");
}

// Ascend grand: N -> N-1 or 1 -> city
function ascendGrand(g: GameState) {
  if (g.activeGrandFloor <= 0) return;
  snapshotFloor(g);
  const prev = g.activeGrandFloor - 1;
  if (prev <= 0) {
    // back to central city
    g.activeMap = g.world;
    g.activeGrandFloor = 0;
    // return to the grand stair spot in the city
    if (g.world.grandStair) {
      g.player.pos.x = g.world.grandStair.x;
      g.player.pos.y = g.world.grandStair.y + TILE * 2;
    } else {
      g.player.pos.x = g.world.spawn.x;
      g.player.pos.y = g.world.spawn.y;
    }
    g.camera.x = g.player.pos.x;
    g.camera.y = g.player.pos.y;
    restoreFloor(g, "overworld");
    g.stairCd = 1.4;
    logMsg(g, "Voltou à Cidade Central de Asterion.", "#8fcfff");
    return;
  }
  const floor = getOrCreateGrandFloor(g, prev);
  g.activeMap = floor;
  g.activeGrandFloor = prev;
  const down = floor.stairs.find((s) => s.kind === "down");
  if (down) {
    g.player.pos.x = down.x;
    g.player.pos.y = down.y;
  } else {
    g.player.pos.x = floor.spawn.x;
    g.player.pos.y = floor.spawn.y;
  }
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.4;
  logMsg(g, `Subiu para o ${prev}º andar da Masmorra.`, "#8fcfff");
}

// -------- Temple of Asterion transitions --------
function getOrCreateTempleFloor(g: GameState, floorNum: number): TempleFloor {
  if (!g.templeFloors) g.templeFloors = new Map();
  let f = g.templeFloors.get(floorNum);
  if (!f) {
    f = new TempleFloor(floorNum, g.world.seed + floorNum * 1234);
    g.templeFloors.set(floorNum, f);
  }
  return f;
}

function enterTemple(g: GameState) {
  snapshotFloor(g);
  const floor = getOrCreateTempleFloor(g, 1);
  g.activeMap = floor;
  g.activeTempleFloor = 1;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  g.activeGrandFloor = 0;
  g.player.pos.x = floor.spawn.x;
  g.player.pos.y = floor.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.4;
  logMsg(g, "Você entrou no sagrado Templo Eterno de Asterion! Andar 1.", "#ffd700");
}

function descendTemple(g: GameState) {
  snapshotFloor(g);
  const nextFloor = g.activeTempleFloor + 1;
  if (nextFloor > TEMPLE_MAX_FLOOR) {
    logMsg(g, "Você já alcançou o pico do Templo de Asterion.", "#ffd700");
    return;
  }
  const floor = getOrCreateTempleFloor(g, nextFloor);
  g.activeMap = floor;
  g.activeTempleFloor = nextFloor;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  g.activeGrandFloor = 0;
  g.player.pos.x = floor.spawn.x;
  g.player.pos.y = floor.spawn.y;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.4;
  const mul = templeDifficultyMultiplier(nextFloor).toFixed(2);
  logMsg(g, `Subiu para o ${nextFloor}º andar do Templo Eterno. Poder Divino x${mul}!`, "#ffd700");
  if (nextFloor === TEMPLE_MAX_FLOOR) {
    g.enemies = []; // Limpa inimigos comuns
    const mid = Math.floor(floor.size / 2);
    spawnTempleBossAt(g, mid * TILE + TILE/2, mid * TILE + TILE/2, "Serafim do Juízo Final");
    logMsg(g, "🔥 SANCUÁRIO SUPREMO: Serafim do Juízo Final despertou no altar sagrado!", "#ff3333");
  }
}

function ascendTemple(g: GameState) {
  snapshotFloor(g);
  const prev = g.activeTempleFloor - 1;
  if (prev <= 0) {
    g.activeMap = g.world;
    g.activeTempleFloor = 0;
    if (g.world.templeEntrance) {
      g.player.pos.x = g.world.templeEntrance.x;
      g.player.pos.y = g.world.templeEntrance.y + TILE * 2;
    } else {
      g.player.pos.x = g.world.spawn.x;
      g.player.pos.y = g.world.spawn.y;
    }
    g.camera.x = g.player.pos.x;
    g.camera.y = g.player.pos.y;
    restoreFloor(g, "overworld");
    g.stairCd = 1.4;
    logMsg(g, "Retornou aos portões do Templo Eterno em Asterion.", "#8fcfff");
    return;
  }
  const floor = getOrCreateTempleFloor(g, prev);
  g.activeMap = floor;
  g.activeTempleFloor = prev;
  const down = floor.stairs.find((s) => s.kind === "down");
  if (down) {
    g.player.pos.x = down.x;
    g.player.pos.y = down.y;
  } else {
    g.player.pos.x = floor.spawn.x;
    g.player.pos.y = floor.spawn.y;
  }
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  restoreFloor(g, floorKey(g));
  g.stairCd = 1.4;
  logMsg(g, `Desceu para o ${prev}º andar do Templo Eterno.`, "#8fcfff");
}

function spawnTempleBossAt(g: GameState, x: number, y: number, name: string) {
  const floor = g.activeTempleFloor || 25;
  const mul = templeDifficultyMultiplier(floor);
  const level = Math.max(1, 10 + floor * 12 + 25);
  const baseHp = 1500;
  const baseAtk = 50;
  const baseDef = 20;
  const lvlScale = 1 + Math.max(0, level - 1) * 0.08;
  const maxHp = Math.floor(baseHp * mul * 5 * lvlScale);
  
  const en: Enemy = {
    id: ++enemySeq,
    pos: { x, y },
    vel: { x: 0, y: 0 },
    hp: maxHp,
    maxHp,
    atk: Math.floor(baseAtk * mul * 3 * lvlScale),
    def: Math.floor(baseDef * mul * 2.5 * lvlScale),
    speed: 2.5,
    level,
    name,
    biome: 0,
    radius: 32,
    color: "#ffd700",
    isBoss: true,
    attackCd: 0,
    hitFlash: 0,
    modifiers: [
      { id: "colossal", name: "Colossal", color: "#a06030" },
      { id: "blindado", name: "Blindado", color: "#c0c0d0" },
      { id: "vampirico", name: "Vampírico", color: "#c02040" }
    ],
    isElite: true,
  };
  g.enemies.push(en);
}

// -------- Boss Rush Arena --------
function spawnArenaEnemy(g: GameState, boss: boolean) {
  if (!g.arena) return;
  const map = g.arena;
  const wave = g.arenaWave;
  const mul = waveMultiplier(wave);
  for (let tries = 0; tries < 30; tries++) {
    const tx = 3 + Math.floor(Math.random() * (map.size - 6));
    const ty = 3 + Math.floor(Math.random() * (map.size - 8));
    if (map.isBlocked(tx, ty)) continue;
    const x = tx * TILE + TILE / 2;
    const y = ty * TILE + TILE / 2;
    const dx = x - g.player.pos.x,
      dy = y - g.player.pos.y;
    if (dx * dx + dy * dy < 180 * 180) continue;
    const level = Math.max(1, Math.floor(wave * 1.2 + (boss ? 6 : 0)));
    const baseHp = boss ? 260 : 22;
    const baseAtk = boss ? 14 : 7;
    const baseDef = boss ? 5 : 2;
    let maxHp = Math.floor((baseHp * mul * 4) / 3);
    let speed = boss ? 1.6 : 1.9 + Math.random() * 0.5;
    if (g.arenaModifier === "CALMARIA DIVINA") {
      maxHp = Math.floor(maxHp * 1.4);
      speed = speed * 0.7;
    }
    const en: Enemy = {
      id: ++enemySeq,
      pos: { x, y },
      vel: { x: 0, y: 0 },
      hp: maxHp,
      maxHp,
      atk: Math.floor((baseAtk * mul * 4) / 2),
      def: Math.floor(baseDef * mul * 4),
      speed,
      level,
      name: arenaEnemyName(wave, boss),
      biome: 0,
      radius: boss ? 24 : 12,
      color: boss ? "#f04060" : ["#c8a060", "#8090a0", "#a08040", "#607080", "#b06040"][wave % 5],
      isBoss: boss,
      attackCd: 0,
      hitFlash: 0,
    };
    g.enemies.push(en);
    return;
  }
}

export const ARENA_MODIFIERS = [
  { name: "TERRA ARDENTE", desc: "Meteoros caem do teto da arena! Desvie do fogo.", color: "#ef4444" },
  { name: "FÚRIA SANGRENTA", desc: "Seu Dano Crítico é ampliado em 100%, mas inimigos batem 30% mais forte!", color: "#f97316" },
  { name: "TEMPESTADE ARCANA", desc: "Recarga de habilidades reduzida em 50%, mas custos de MP dobrados!", color: "#a855f7" },
  { name: "CALMARIA DIVINA", desc: "Inimigos movem-se 30% mais devagar, mas têm 40% mais vida máxima!", color: "#3b82f6" },
  { name: "SANGUE DRENANTE", desc: "Dreno constante de vida, mas com 15% de roubo de vida ativo!", color: "#ec4899" },
];

function startArenaWave(g: GameState, wave: number) {
  g.arenaWave = wave;
  g.arenaWaveActive = true;

  // Seleciona um modificador dinâmico
  const mod = ARENA_MODIFIERS[wave % ARENA_MODIFIERS.length];
  g.arenaModifier = mod.name;
  g.arenaModifierDesc = mod.desc;
  g.arenaModifierColor = mod.color;

  const boss = isBossWave(wave);
  const count = enemiesInWave(wave);
  for (let i = 0; i < count; i++) spawnArenaEnemy(g, false);
  if (boss) spawnArenaEnemy(g, true);
  logMsg(g, `Onda ${wave}${boss ? " — CAMPEÃO DA ARENA!" : ""} iniciada sob o efeito: [${mod.name}]`, mod.color);
}

// === Construção de Barco e Navegação para Ilha 2 ===
export function craftBoatAction(g: GameState) {
  const s = getOverlayState();
  if (s.hasBoat) {
    logMsg(g, "Você já possui um barco.", "#8fd48f");
    return;
  }
  if (s.wood < BOAT_WOOD_COST) {
    logMsg(
      g,
      `Madeira insuficiente. Precisa de ${BOAT_WOOD_COST} (você tem ${s.wood}).`,
      "#ff8060",
    );
    return;
  }
  if (craftBoat()) {
    logMsg(g, `Barco construído! (Pressione G na água para mergulhar)`, "#f0c040");
    g.floaters.push({
      x: g.player.pos.x,
      y: g.player.pos.y - 20,
      text: "⛵ BARCO CONSTRUÍDO",
      color: "#f0c040",
      life: 2,
      vy: -30,
    });
  }
}

export function getIslandDetails(islandId: number, size: number) {
  let cx = size * 0.5;
  let cy = size * 0.5;
  let radius = size * 0.05;
  let name = `Ilha ${islandId}`;
  let level = 1;

  if (islandId === 1) {
    cx = size * 0.48;
    cy = size * 0.42;
    radius = size * 0.11;
    name = "Asterion";
    level = 1;
  } else if (islandId === 2) {
    cx = size * 0.48;
    cy = size * 0.85;
    radius = size * 0.08;
    name = "Titãs";
    level = 100;
  } else if (islandId === 3) {
    cx = size * 0.14;
    cy = size * 0.42;
    radius = size * 0.08;
    name = "Abisso Subaquático";
    level = 20;
  } else if (islandId === 4) {
    cx = size * 0.84;
    cy = size * 0.42;
    radius = size * 0.08;
    name = "Ilha Primordial";
    level = 200;
  } else if (islandId >= 5 && islandId <= 14) {
    const coords: Record<number, { cx: number; cy: number; radius: number }> = {
      5: { cx: size * 0.48, cy: size * 0.15, radius: size * 0.08 },
      6: { cx: size * 0.18, cy: size * 0.18, radius: size * 0.06 },
      7: { cx: size * 0.80, cy: size * 0.18, radius: size * 0.06 },
      8: { cx: size * 0.18, cy: size * 0.82, radius: size * 0.07 },
      9: { cx: size * 0.80, cy: size * 0.82, radius: size * 0.07 },
      10: { cx: size * 0.65, cy: size * 0.22, radius: size * 0.06 },
      11: { cx: size * 0.32, cy: size * 0.75, radius: size * 0.06 },
      12: { cx: size * 0.32, cy: size * 0.18, radius: size * 0.06 },
      13: { cx: size * 0.82, cy: size * 0.64, radius: size * 0.06 },
      14: { cx: size * 0.12, cy: size * 0.64, radius: size * 0.06 },
    };
    const c = coords[islandId];
    cx = c?.cx ?? cx;
    cy = c?.cy ?? cy;
    radius = c?.radius ?? radius;
    name = `Ilha ${islandId} (Naxas)`;
    level = 200 + (islandId - 5) * 10;
  } else if (islandId >= 15 && islandId <= 34) {
    const angle = ((islandId - 15) / 20) * Math.PI * 2;
    const distCircle = size * 0.40;
    cx = size * 0.5 + Math.cos(angle) * distCircle;
    cy = size * 0.5 + Math.sin(angle) * distCircle;
    radius = size * 0.045;
    name = `Ilha ${islandId} (Limiar Sombrio)`;
    level = 300 + (islandId - 15) * 10;
  } else if (islandId >= 35 && islandId <= 54) {
    const angle = ((islandId - 35) / 20) * Math.PI * 2 + Math.PI / 20;
    const distCircle = size * 0.465;
    cx = size * 0.5 + Math.cos(angle) * distCircle;
    cy = size * 0.5 + Math.sin(angle) * distCircle;
    radius = size * 0.038;
    name = `Ilha ${islandId} (Mar Profundo)`;
    level = 500 + (islandId - 35) * 10;
  }

  return { cx, cy, radius, name, level };
}

export function sailToTargetIsland(g: GameState, islandId: number) {
  const s = getOverlayState();
  if (!s.hasBoat) {
    logMsg(g, "Você precisa construir um barco primeiro (50 de madeira).", "#ff8060");
    return;
  }
  if (g.activeMap !== g.world) {
    logMsg(g, "Você precisa estar no overworld para navegar.", "#ff8060");
    return;
  }

  const size = g.world.size;
  const px = g.player.pos.x / TILE;
  const py = g.player.pos.y / TILE;

  const target = getIslandDetails(islandId, size);

  // Calculate direction vector from target center to player's current position
  let dx = px - target.cx;
  let dy = py - target.cy;
  let dist = Math.hypot(dx, dy);

  let angle: number;
  if (dist < 1) {
    angle = Math.PI / 4; // default angle to south-east
  } else {
    angle = Math.atan2(dy, dx);
  }

  // Spawn on shore: slightly inside land radius (0.85 * radius) to ensure they land on grass/sand
  const spawnDist = target.radius * 0.85;
  const tx = target.cx + Math.cos(angle) * spawnDist;
  const ty = target.cy + Math.sin(angle) * spawnDist;

  const targetX = tx * TILE;
  const targetY = ty * TILE;

  setIsland(islandId);

  g.player.pos.x = targetX;
  g.player.pos.y = targetY;
  g.camera.x = targetX;
  g.camera.y = targetY;
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];
  g.spawnTimer = 0;
  g.bossTimer = 30;
  g.stairCd = 2;

  const lvl = target.level;
  const msg = `⛵ Você aportou no litoral de ${target.name}! Inimigos nível ${lvl}+.`;
  logMsg(g, msg, "#38bdf8");
}

export function sailToNewIsland(g: GameState) {
  const s = getOverlayState();
  if (!s.hasBoat) {
    logMsg(g, "Você precisa construir um barco primeiro (50 de madeira).", "#ff8060");
    return;
  }
  if (g.activeMap !== g.world) {
    logMsg(g, "Você precisa estar no overworld para navegar.", "#ff8060");
    return;
  }

  setOverlayState({ activeModal: "sailing" as any });
}

export function toggleDiveAction(g: GameState) {
  const p = g.player;
  if (g.activeMap !== g.world) {
    logMsg(g, "Você só pode mergulhar no oceano do overworld!", "#ff8060");
    return;
  }
  const curTile = tileAt(g, p.pos.x, p.pos.y);
  if (curTile && curTile.kind === 1) {
    const s = getOverlayState();
    if (s.hasBoat) {
      p.isUnderwater = !p.isUnderwater;
      if (p.isUnderwater) {
        logMsg(g, "Mergulhando no abismo submarino... 🫧", "#60a5fa");
        g.floaters.push({
          x: p.pos.x,
          y: p.pos.y - 20,
          text: "🫧 MERGULHANDO",
          color: "#60a5fa",
          life: 1.5,
          vy: -35,
        });
      } else {
        logMsg(g, "Retornando à superfície. ⛵", "#ffd060");
        g.floaters.push({
          x: p.pos.x,
          y: p.pos.y - 20,
          text: "⛵ SUPERFÍCIE",
          color: "#ffd060",
          life: 1.5,
          vy: -35,
        });
      }
    } else {
      logMsg(g, "Você precisa de um barco para navegar e mergulhar!", "#ff8060");
    }
  } else {
    logMsg(g, "Você só pode mergulhar quando estiver navegando na água!", "#ff8060");
  }
}

export function enterBossRush(g: GameState) {
  if (g.activeArena) return;
  if (g.activeCaveBiome || g.activeGrandFloor > 0) {
    logMsg(g, "Você precisa estar na cidade para entrar na Arena.", "#ff8060");
    return;
  }
  snapshotFloor(g);
  g.arenaCityReturn = { x: g.player.pos.x, y: g.player.pos.y };
  g.arena = new BossRushArena(Math.floor(Math.random() * 99999));
  g.activeMap = g.arena;
  g.activeArena = true;
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];
  g.player.pos.x = g.arena.spawn.x;
  g.player.pos.y = g.arena.spawn.y;
  g.player.hp = g.player.maxHp;
  g.player.mp = g.player.maxMp;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  g.stairCd = 1.4;
  g.arenaWave = 0;
  g.arenaWaveActive = false;
  g.arenaNextWaveIn = 2.5;
  logMsg(g, "Você entrou na Arena da Sobrevivência! As ondas nunca param.", "#f0b040");
}

export function exitBossRush(g: GameState) {
  if (!g.activeArena) return;
  const reached = g.arenaWave;
  if (reached > g.arenaBest) {
    g.arenaBest = reached;
    saveBossRushBest(reached);
    logMsg(g, `Novo recorde de Arena: onda ${reached}!`, "#f0b040");
  }
  g.arena = null;
  g.activeArena = false;
  g.activeMap = g.world;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  g.activeGrandFloor = 0;
  g.enemies = [];
  g.projectiles = [];
  restoreFloor(g, "overworld");
  if (g.arenaCityReturn) {
    g.player.pos.x = g.arenaCityReturn.x;
    g.player.pos.y = g.arenaCityReturn.y;
  } else {
    g.player.pos.x = g.world.spawn.x;
    g.player.pos.y = g.world.spawn.y;
  }
  g.arenaCityReturn = null;
  g.camera.x = g.player.pos.x;
  g.camera.y = g.player.pos.y;
  g.stairCd = 1.4;
  g.arenaWave = 0;
  g.arenaWaveActive = false;
  logMsg(g, "Você deixou a Arena. Voltou à Cidade Central.", "#8fcfff");
}

function tickArena(g: GameState, dt: number) {
  if (!g.activeArena) return;
  // Check exit stair
  if (g.stairCd <= 0) {
    const t = tileAt(g, g.player.pos.x, g.player.pos.y);
    if (t.kind === 7) {
      exitBossRush(g);
      return;
    }
  }

  // Efeitos ativos dos modificadores da arena
  if (g.arenaWaveActive) {
    if (g.arenaModifier === "TERRA ARDENTE") {
      if (!(g as any)._meteorTimer) (g as any)._meteorTimer = 0;
      (g as any)._meteorTimer += dt;
      if ((g as any)._meteorTimer >= 1.6) {
        (g as any)._meteorTimer = 0;
        // Cospe um círculo indicador no chão perto do jogador
        const rx = g.player.pos.x + (Math.random() - 0.5) * 180;
        const ry = g.player.pos.y + (Math.random() - 0.5) * 180;
        
        // Alerta visual de faísca vermelha rápida
        spawnParticles(g, rx, ry, "#ef4444", 8, { size: 1.8 });
        
        setTimeout(() => {
          if (g.activeArena && g.arenaWaveActive) {
            // Explosão real
            spawnParticles(g, rx, ry, "#f97316", 18, { size: 3.5 });
            const dx = g.player.pos.x - rx;
            const dy = g.player.pos.y - ry;
            if (dx * dx + dy * dy < 28 * 28) {
              g.player.hp = Math.max(1, g.player.hp - 18);
              logMsg(g, "💥 Você foi atingido por um METEORO DA ARENA!", "#ef4444");
              g.floaters.push({
                x: g.player.pos.x,
                y: g.player.pos.y - 12,
                text: "🔥 METEORO! -18",
                color: "#ef4444",
                life: 1.2,
                vy: -30
              });
            }
          }
        }, 900);
      }
    } else if (g.arenaModifier === "SANGUE DRENANTE") {
      if (!(g as any)._drainTimer) (g as any)._drainTimer = 0;
      (g as any)._drainTimer += dt;
      if ((g as any)._drainTimer >= 1.0) {
        (g as any)._drainTimer = 0;
        g.player.hp = Math.max(1, g.player.hp - 2);
        g.floaters.push({
          x: g.player.pos.x,
          y: g.player.pos.y - 8,
          text: "🩸 DRENO -2 HP",
          color: "#ec4899",
          life: 0.6,
          vy: -15
        });
      }
    }
  }

  if (!g.arenaWaveActive) {
    g.arenaNextWaveIn = Math.max(0, g.arenaNextWaveIn - dt);
    if (g.arenaNextWaveIn <= 0) {
      startArenaWave(g, g.arenaWave + 1);
    }
  } else {
    // Award XP per arena kill by looking at kills delta indirectly:
    // easier — check if no enemies remain, then advance wave.
    if (g.enemies.length === 0) {
      const gold = waveClearGold(g.arenaWave);
      g.player.gold += gold;
      // small XP burst per wave cleared
      g.player.gainXp(waveEnemyXp(g.arenaWave) * 2, (m, c) => logMsg(g, m, c));
      g.floaters.push({
        x: g.player.pos.x,
        y: g.player.pos.y - 12,
        text: `Onda ${g.arenaWave} — +${gold}g`,
        color: "#f0c060",
        life: 1.6,
        vy: -35,
      });
      if (g.arenaWave > g.arenaBest) {
        g.arenaBest = g.arenaWave;
        saveBossRushBest(g.arenaWave);
      }
      g.arenaWaveActive = false;
      g.arenaNextWaveIn = 3.5;
      logMsg(
        g,
        `Onda ${g.arenaWave} concluída! +${gold} ouro. Próxima onda em breve...`,
        "#f0b040",
      );
    }
  }
}
function openChestAt(g: GameState, tx: number, ty: number) {
  if (!inGrand(g)) return;
  const map = g.activeMap as GrandDungeonFloor;
  const ch = map.chests.find((c) => c.x === tx && c.y === ty && !c.opened);
  if (!ch) return;
  ch.opened = true;
  // Convert the tile to walkable
  map.tiles[map.idx(tx, ty)].kind = 0;
  const p = g.player;
  const floor = g.activeGrandFloor;
  const bonus = ch.secret ? 25 : 10;
  const rewards = ch.secret ? 4 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 2);
  const gold = Math.floor(50 * floor * (ch.secret ? 2.5 : 1) + Math.random() * 100 * floor);
  p.gold += gold;
  g.floaters.push({
    x: tx * TILE + TILE / 2,
    y: ty * TILE,
    text: `+${gold}g`,
    color: "#f0c060",
    life: 2,
    vy: -30,
  });
  logMsg(
    g,
    ch.secret
      ? `Baú SECRETO aberto! +${gold} ouro, ${rewards} itens.`
      : `Baú aberto! +${gold} ouro, ${rewards} itens.`,
    ch.secret ? "#c25ef0" : "#f0c040",
  );
  for (let i = 0; i < rewards; i++) {
    const kinds: Array<"weapon" | "armor" | "potion" | "material"> = [
      "weapon",
      "armor",
      "potion",
      "material",
    ];
    const kind =
      i === 0 && ch.secret
        ? Math.random() < 0.5
          ? "weapon"
          : "armor"
        : kinds[Math.floor(Math.random() * kinds.length)];
    const rarity = rollRarity(bonus + Math.min(50, floor));
    const tier = Math.max(1, Math.floor(floor / 6) + 1 + (ch.secret ? 2 : 0));
    const it = makeItem(kind, tier, rarity);
    const ang = (i / rewards) * Math.PI * 2;
    g.loot.push({
      pos: {
        x: tx * TILE + TILE / 2 + Math.cos(ang) * 24,
        y: ty * TILE + TILE / 2 + Math.sin(ang) * 24,
      },
      item: it,
      life: 90,
    });
  }
  // Baú secreto: chance extra de runa ancestral
  if (ch.secret) {
    const rune = rollAncientRune(floor + 20);
    if (rune) {
      p.runes.push(rune);
      const info = ANCIENT_RUNES[rune.runeId];
      logMsg(g, `Do baú secreto: ${info.name} (${runeTierLabel(rune.tier)})!`, info.color);
    }
  }
}

export function recalculateStats(g: GameState) {
  const bonuses = getAchievementBonuses(g);
  const p = g.player;
  const oldExtraHp = p.achievementBonuses?.extraHp ?? 0;
  const oldExtraMp = p.achievementBonuses?.extraMp ?? 0;
  const oldRuneHp = (p as any)._runeHpApplied ?? 0;
  const oldRuneMp = (p as any)._runeMpApplied ?? 0;

  p.achievementBonuses = bonuses;
  // Recompute runes bonuses aggregate
  p.recomputeRuneBonuses();
  const rb = p.runeBonuses;

  const hpDiff = bonuses.extraHp - oldExtraHp + (rb.maxHpBonus - oldRuneHp);
  const mpDiff = bonuses.extraMp - oldExtraMp + (rb.maxMpBonus - oldRuneMp);
  (p as any)._runeHpApplied = rb.maxHpBonus;
  (p as any)._runeMpApplied = rb.maxMpBonus;

  p.maxHp += hpDiff;
  p.hp = Math.min(p.maxHp, p.hp + Math.max(0, hpDiff));
  p.maxMp += mpDiff;
  p.mp = Math.min(p.maxMp, p.mp + Math.max(0, mpDiff));

  // Velocidade base * bônus de nível (+1% por nível) * multiplicador de runas (base 3.2)
  p.speed = 3.2 * (1 + Math.max(0, p.level - 1) * 0.01) * (rb.moveSpeedMult || 1);

  // Shield capacity calculation based on VIT, INT, and level
  const oldMaxShield = p.maxShield || 30;
  p.maxShield = Math.floor(30 + p.level * 3 + p.attr.vit * 1.5 + p.attr.int * 2.5);
  const shieldRatio = p.shield / oldMaxShield;
  p.shield = Math.round(p.maxShield * (isNaN(shieldRatio) ? 1 : shieldRatio));
}

// Diff the overlay's { hp, mp } bonus into the Player's maxHp / maxMp each
// frame. Only applies the delta, so live HP/MP aren't clobbered on re-equip.
function syncOverlayToPlayer(g: GameState) {
  const b = getOverlayCombatBonuses();
  const p = g.player;
  const hpDelta = b.hp - (p.overlayHpApplied || 0);
  const mpDelta = b.mp - (p.overlayMpApplied || 0);
  if (hpDelta !== 0) {
    p.maxHp += hpDelta;
    if (hpDelta > 0) p.hp += hpDelta;
    p.hp = Math.max(1, Math.min(p.maxHp, p.hp));
    p.overlayHpApplied = b.hp;
  }
  if (mpDelta !== 0) {
    p.maxMp += mpDelta;
    if (mpDelta > 0) p.mp += mpDelta;
    p.mp = Math.max(0, Math.min(p.maxMp, p.mp));
    p.overlayMpApplied = b.mp;
  }

  // Reflect the currently-selected pet in the game state so render/AI can use it.
  const overlay = getOverlayState();
  if (overlay.activePet !== (g.activePet?.id ?? null)) {
    if (!overlay.activePet) {
      g.activePet = null;
    } else {
      g.activePet = {
        id: overlay.activePet,
        pos: { x: p.pos.x - 30, y: p.pos.y - 30 },
        attackCd: 0,
      };
    }
  }
}

// Active pet AI: hovers a short distance behind the player, auto-fires a
// small projectile at the nearest enemy every ~1.5s.
function updateActivePet(g: GameState, dt: number) {
  const pet = g.activePet;
  if (!pet) return;
  const p = g.player;
  const petMeta = petById(pet.id);
  if (!petMeta) return;

  // Follow: move toward a spot offset from the player.
  const targetX = p.pos.x - 34;
  const targetY = p.pos.y - 20;
  const dx = targetX - pet.pos.x;
  const dy = targetY - pet.pos.y;
  const dist = Math.hypot(dx, dy) || 1;
  const followSpd = Math.min(dist, 220 * dt);
  pet.pos.x += (dx / dist) * followSpd;
  pet.pos.y += (dy / dist) * followSpd;

  pet.attackCd = Math.max(0, pet.attackCd - dt);

  // Attack: find nearest enemy within range
  const PET_RANGE = 260;
  let nearest: Enemy | null = null;
  let nearestSq = PET_RANGE * PET_RANGE;
  for (const e of g.enemies) {
    const ex = e.pos.x - pet.pos.x;
    const ey = e.pos.y - pet.pos.y;
    const dsq = ex * ex + ey * ey;
    if (dsq < nearestSq) {
      nearestSq = dsq;
      nearest = e;
    }
  }
  if (nearest && pet.attackCd <= 0) {
    const ex = nearest.pos.x - pet.pos.x;
    const ey = nearest.pos.y - pet.pos.y;
    const len = Math.hypot(ex, ey) || 1;
    const damage = Math.max(1, petMeta.attack + Math.floor(p.level * 0.5));
    g.projectiles.push({
      pos: { x: pet.pos.x, y: pet.pos.y },
      vel: { x: (ex / len) * 12, y: (ey / len) * 12 },
      life: 1.0,
      damage,
      from: "player",
      kind: "pet_bolt",
    });
    pet.attackCd = 1.5;
  }
}

function ensureTrainingDummy(g: GameState) {
  // Só existe no overworld (cidade central), não em masmorras/andares.
  if (g.activeCaveBiome != null || g.activeGrandFloor > 0 || g.activeArena) return;
  if (g.enemies.some((e) => e.isTrainingDummy)) return;
  const spawn = g.world.spawn;
  // Posição "2º andar da cidade" — um pequeno terraço logo ao norte da praça central.
  const x = spawn.x + 80;
  const y = spawn.y - 140;
  const maxHp = 9999;
  g.enemies.push({
    id: ++enemySeq,
    pos: { x, y },
    vel: { x: 0, y: 0 },
    hp: maxHp,
    maxHp,
    atk: 0,
    def: 0,
    speed: 0,
    level: 1,
    name: "Boneco de Treino",
    biome: 1,
    radius: 14,
    color: "#c8a866",
    isBoss: false,
    attackCd: 999,
    hitFlash: 0,
    isTrainingDummy: true,
  });
}

export function update(g: GameState, dt: number, input: Input, canvasW: number, canvasH: number) {
  if (g.paused) return;

  // Process a small buffer/grace-period for interaction presses (E/F or mobile INT button)
  if (g._ePressed) {
    (g as any)._ePressedTimer = 0.15; // Hold active for 150ms buffer
  }
  if ((g as any)._ePressedTimer !== undefined && (g as any)._ePressedTimer > 0) {
    g._ePressed = true;
    (g as any)._ePressedTimer -= dt;
  } else {
    g._ePressed = false;
  }

  if (g.hitstopTime && g.hitstopTime > 0) {
    g.hitstopTime -= dt;
    if (g.shakeTime && g.shakeTime > 0) {
      g.shakeTime = Math.max(0, g.shakeTime - dt);
    }
    return;
  }
  if (g.shakeTime && g.shakeTime > 0) {
    g.shakeTime = Math.max(0, g.shakeTime - dt);
  }
  g.time += dt;
  g.stairCd = Math.max(0, g.stairCd - dt);
  ensureTrainingDummy(g);
  updateAmbitiousSystems(g, dt);
  const p = g.player;

  // --- CLIMA FIXO (variação visual de clima removida a pedido) ---
  if (!g.weather) g.weather = "Ensolarado";
  // weatherTimer mantido para compatibilidade de saves antigos

  // --- CICLO DIA/NOITE ---
  {
    const t01 = (g.time / 180) % 1;
    g.isNight = t01 > 0.68 || t01 < 0.22;
  }

  // --- TIMER DE COMBO (expira se não matar dentro do prazo) ---
  if (g.comboCount > 0) {
    g.comboTimer -= dt;
    if (g.comboTimer <= 0) {
      g.comboCount = 0;
      g.comboTimer = 0;
    }
  }

  // --- INVASÃO ALEATÓRIA + MERCADOR ITINERANTE (overworld apenas) ---
  if (!g.activeCaveBiome && g.activeGrandFloor === 0 && !g.activeArena) {
    // Invasão
    if (g.invasionCd > 0) {
      g.invasionCd -= dt;
    } else if (g.invasionActive) {
      const stillHasInvaders = g.enemies.some((e) => (e as any)._invasor === true);
      if (!stillHasInvaders) {
        g.invasionActive = false;
        g.invasionTimer = 300 + Math.random() * 180;
        g.invasionCd = 90;
        logMsg(g, "⚔️ Invasão repelida! Glória a Asterion!", "#00ff80");
      }
    } else {
      g.invasionTimer -= dt;
      if (g.invasionTimer <= 0) {
        g.invasionActive = true;
        logMsg(g, "⚠️ INVASÃO! Uma horda sombria se aproxima!", "#ff3030");
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const dist = 320 + Math.random() * 160;
          spawnEnemyNear(g, p.pos.x + Math.cos(angle) * dist, p.pos.y + Math.sin(angle) * dist, i === 0);
          if (g.enemies.length > 0) {
            (g.enemies[g.enemies.length - 1] as any)._invasor = true;
          }
        }
      }
    }

    // Mercador Itinerante
    if (!g.merchantPos) {
      g.merchantTimer -= dt;
      if (g.merchantTimer <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 280 + Math.random() * 100;
        g.merchantPos = {
          x: p.pos.x + Math.cos(angle) * dist,
          y: p.pos.y + Math.sin(angle) * dist,
        };
        g.merchantTimer = 300 + Math.random() * 120;
        logMsg(g, "🛒 Mercador Itinerante apareceu! Aproxime-se e pressione [F].", "#00e5ff");
      }
    } else {
      const mdx = p.pos.x - g.merchantPos.x;
      const mdy = p.pos.y - g.merchantPos.y;
      if (Math.abs(mdx) <= 70 && Math.abs(mdy) <= 70 && g._ePressed) {
        const bonus = 75 + Math.floor(Math.random() * 125);
        p.gold += bonus;
        logMsg(g, `🛒 Mercador: "Especial para você!" +${bonus} ouro`, "#00e5ff");
        g.floaters.push({ x: p.pos.x, y: p.pos.y - 45, text: `+${bonus}💰 MERCADOR`, color: "#00e5ff", life: 2, vy: -20 });
        g.merchantPos = null;
        g._ePressed = false;
        (g as any)._ePressedTimer = 0;
      }
    }
  }

  // --- SOBREVIVÊNCIA SUBAQUÁTICA (O2 E PRESSÃO) ---
  const curTile = tileAt(g, p.pos.x, p.pos.y);
  p._floaterTimer = (p._floaterTimer || 0) - dt;

  if (p.isUnderwater) {
    if (curTile.kind !== 1) {
      p.isUnderwater = false;
      logMsg(g, "Você subiu para terra firme. ⛵", "#8fd48f");
    } else {
      // 1. Oxigênio
      const lungSkill = p.underwaterSkills?.lung ?? 0;
      const lungMod = 1 - Math.min(0.5, lungSkill * 0.05); // até 50% de redução
      p.maxOxygen = 100 + ((p.divingGearLevel?.oxygen ?? 1) - 1) * 50;
      p.oxygen = Math.max(0, p.oxygen - 6 * dt * lungMod);

      if (p.oxygen <= 0) {
        const o2Dmg = p.maxHp * 0.06 * dt;
        p.hp = Math.max(0, p.hp - o2Dmg);
        if (p._floaterTimer <= 0) {
          g.floaters.push({
            x: p.pos.x,
            y: p.pos.y - 20,
            text: "💀 SEM OXIGÊNIO!",
            color: "#ef4444",
            life: 1,
            vy: -25,
          });
        }
      }

      // 2. Pressão Abissal
      const bObj = BIOMES.find((b) => b.id === curTile.biome);
      const danger = bObj ? bObj.danger : 0;
      const requiredPressure = Math.max(0, Math.floor(danger * 1.5));
      const myMaxPressure = (p.divingGearLevel?.pressure ?? 1) * 30;

      if (myMaxPressure < requiredPressure) {
        const prResSkill = p.underwaterSkills?.pressureRes ?? 0;
        const prDmg =
          (requiredPressure - myMaxPressure) * 0.4 * dt * (1 - Math.min(0.8, prResSkill * 0.08));
        p.hp = Math.max(0, p.hp - prDmg);
        if (p._floaterTimer <= 0) {
          g.floaters.push({
            x: p.pos.x,
            y: p.pos.y - 35,
            text: "💥 PRESSÃO ALTA!",
            color: "#f97316",
            life: 1,
            vy: -20,
          });
        }
      }

      // 3. XP de Mergulho
      p.underwaterXp = (p.underwaterXp || 0) + 4 * dt;
      if (!p.underwaterXpNext) p.underwaterXpNext = 500;
      if (p.underwaterXp >= p.underwaterXpNext) {
        p.underwaterLevel = (p.underwaterLevel || 1) + 1;
        p.underwaterXp -= p.underwaterXpNext;
        p.underwaterXpNext = Math.floor(p.underwaterXpNext * 1.3);
        p.underwaterSkillPoints = (p.underwaterSkillPoints || 0) + 1;
        logMsg(
          g,
          `🎉 Sua Habilidade de Mergulho subiu para o Nível ${p.underwaterLevel}!`,
          "#60a5fa",
        );
        g.floaters.push({
          x: p.pos.x,
          y: p.pos.y - 45,
          text: `🌟 UP DE MERGULHO: Nível ${p.underwaterLevel}!`,
          color: "#60a5fa",
          life: 2,
          vy: -35,
        });
      }
    }
  } else {
    p.maxOxygen = 100 + ((p.divingGearLevel?.oxygen ?? 1) - 1) * 50;
    p.oxygen = Math.min(p.maxOxygen, p.oxygen + 35 * dt);
  }

  if (p._floaterTimer <= 0) {
    p._floaterTimer = 1.0;
  }

  // --- Onda 1: tick de status effects, DoT/regen, ecos temporais ---
  tickStatusEffects(p, dt, {
    onTickDmg: (host, amt) => {
      if (amt > 0) {
        // Dano puro (queimadura, sangramento). Ignora defesa; efeitos já são balanceados.
        const real = absorbShield(host, amt);
        p.hp = Math.max(0, p.hp - real);
        g.floaters.push({
          x: p.pos.x,
          y: p.pos.y - 20,
          text: `-${Math.round(real)}`,
          color: "#f97316",
          life: 0.8,
          vy: -30,
        });
      } else if (amt < 0) {
        const heal = Math.min(p.maxHp - p.hp, -amt);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        if (heal > 0)
          g.floaters.push({
            x: p.pos.x,
            y: p.pos.y - 20,
            text: `+${Math.round(heal)}`,
            color: "#22c55e",
            life: 0.8,
            vy: -30,
          });
      }
    },
    onEcho: (slot: EchoSlot) => {
      // Onda 2 vai consumir isto — por ora só loga para depurar.
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 30,
        text: `Eco ${slot.abilityId}!`,
        color: slot.color,
        life: 1.2,
        vy: -40,
      });
    },
  });
  // Marcador do Ecomante decai
  if (p.markedNextSkill) {
    p.markedNextSkill.expiresIn -= dt;
    if (p.markedNextSkill.expiresIn <= 0) p.markedNextSkill = null;
  }

  // --- Overlay sync: equipped items / active pet / battle-pass rewards ---
  syncOverlayToPlayer(g);
  updateActivePet(g, dt);
  const rewards = drainRewardQueue();
  for (const r of rewards) {
    if (r.kind === "gold") {
      p.gold += r.amount;
      if (r.amount > 0) {
        logMsg(g, `+${r.amount} ouro!`, "#facc15");
      } else if (r.amount < 0) {
        logMsg(g, `Gastou ${Math.abs(r.amount)} moedas de ouro na Loja!`, "#ef4444");
      }
    } else if (r.kind === "xp_boost") {
      p.gainXp(r.amount, (m, c) => logMsg(g, m, c));
    }
  }

  let mx = 0,
    my = 0;
  if (input.keys.has("w") || input.keys.has("arrowup")) my -= 1;
  if (input.keys.has("s") || input.keys.has("arrowdown")) my += 1;
  if (input.keys.has("a") || input.keys.has("arrowleft")) mx -= 1;
  if (input.keys.has("d") || input.keys.has("arrowright")) mx += 1;
  const running = input.keys.has("shift");
  const talentSpdMult = p.talentBonuses?.moveSpeedMult ?? 1;
  let uSpeedMult = 1.0;
  if (p.isUnderwater) {
    uSpeedMult = 0.6 + ((p.divingGearLevel?.fins ?? 1) - 1) * 0.1;
    if (uSpeedMult > 1.2) uSpeedMult = 1.2;
  }
  const spd = p.speed * talentSpdMult * (running ? 1.5 : 1) * 60 * dt * uSpeedMult;
  if (mx || my) {
    const l = Math.hypot(mx, my);
    moveEntity(g, p.pos, (mx / l) * spd, (my / l) * spd);
  }

  // --- Labirinto do Abismo Gravity Mechanics ---
  if (g.activeCaveBiome === 150) {
    const gravCycle = Math.floor(g.time / 8) % 4; // shifts every 8 seconds!
    let pullX = 0;
    let pullY = 0;
    let gravMessage = "";

    if (gravCycle === 0) {
      pullY = 1.6 * 60 * dt;
      gravMessage = "GRAVIDADE ALVO: SUL (PUXANDO PARA BAIXO)";
    } else if (gravCycle === 1) {
      pullY = -1.6 * 60 * dt;
      gravMessage = "GRAVIDADE ALVO: NORTE (PUXANDO PARA CIMA)";
    } else if (gravCycle === 2) {
      pullX = -1.6 * 60 * dt;
      gravMessage = "GRAVIDADE ALVO: OESTE (PUXANDO PARA ESQUERDA)";
    } else if (gravCycle === 3) {
      pullX = 1.6 * 60 * dt;
      gravMessage = "GRAVIDADE ALVO: LESTE (PUXANDO PARA DIREITA)";
    }

    if (pullX !== 0 || pullY !== 0) {
      moveEntity(g, p.pos, pullX, pullY);
    }

    if (Math.random() < 0.3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 20;
      g.particles.push({
        x: p.pos.x + Math.cos(angle) * radius,
        y: p.pos.y + Math.sin(angle) * radius,
        vx: -Math.cos(angle) * 25,
        vy: -Math.sin(angle) * 25,
        size: 1.5 + Math.random() * 2,
        color: gravCycle === 0 || gravCycle === 1 ? "#a855f7" : "#06b6d4",
        alpha: 0.8,
        life: 0.4,
        maxLife: 0.4,
      });
    }

    (g as any).gravityMessage = gravMessage;
  } else {
    (g as any).gravityMessage = "";
  }

  // --- CLASS UNIQUE RESOURCES PASSIVE UPDATES ---
  const movingState = !!(mx || my);
  if (p.cls === "archer") {
    if (!movingState) {
      p.classResource = Math.min(100, p.classResource + 35 * dt); // standing still charges Focus!
    } else {
      p.classResource = Math.max(0, p.classResource - 50 * dt); // moving drains Focus
    }
  } else if (p.cls === "vampire") {
    // Out-of-combat blood starvation
    let enemyClose = false;
    for (const e of g.enemies) {
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y;
      if (dx * dx + dy * dy < 200 * 200) {
        enemyClose = true;
        break;
      }
    }
    if (!enemyClose) {
      p.hp = Math.max(1, p.hp - 1.2 * dt); // slow hunger bleed
    }
  }

  // Record speed trail positions if running
  if (!(p as any).trail) (p as any).trail = [];
  if (running && (mx || my)) {
    const last = (p as any).trail[0];
    if (!last || Math.hypot(p.pos.x - last.x, p.pos.y - last.y) > 6) {
      (p as any).trail.unshift({ x: p.pos.x, y: p.pos.y });
      if ((p as any).trail.length > 5) (p as any).trail.pop();
    }
  } else {
    if ((p as any).trail.length > 0) (p as any).trail.pop();
  }

  const worldMx = input.mouse.x + g.camera.x - canvasW / 2;
  const worldMy = input.mouse.y + g.camera.y - canvasH / 2;
  p.facing.x = worldMx - p.pos.x;
  p.facing.y = worldMy - p.pos.y;

  // Auto-attack: aim and fire automatically at the nearest enemy once it gets close
  const AUTO_ATTACK_RANGE = 220;
  let nearestEnemy: Enemy | null = null;
  let nearestEnemyDistSq = Infinity;
  for (const e of g.enemies) {
    const dx = e.pos.x - p.pos.x,
      dy = e.pos.y - p.pos.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < nearestEnemyDistSq) {
      nearestEnemyDistSq = dSq;
      nearestEnemy = e;
    }
  }
  const enemyInAutoRange =
    nearestEnemy && nearestEnemyDistSq < AUTO_ATTACK_RANGE * AUTO_ATTACK_RANGE;
  if (enemyInAutoRange && nearestEnemy) {
    p.facing.x = nearestEnemy.pos.x - p.pos.x;
    p.facing.y = nearestEnemy.pos.y - p.pos.y;
    if (p.attackCd <= 0) basicAttack(g);
  }

  if (input.mouse.down) {
    // Try mining first (only consumes click if a vein is close)
    if (!tryMineAt(g, worldMx, worldMy)) basicAttack(g);
  }
  // Dispatch each hotkey to the ACTUAL skill bound to that key for the
  // player's current class (skills are defined per class in classSkills()).
  for (const key of ["1", "2", "3", "4"] as const) {
    if (input.keys.has(key)) {
      const sk = g.player.skills.find((s) => s.key === key);
      if (sk) useSkill(g, sk.id);
    }
  }

  // Mining veins + world events
  updateVeins(g, dt);
  tickEvents(g, dt);
  // Consume deferred vein-summoner spawns
  while (_pendingMonsterSpawns.length) {
    const sp = _pendingMonsterSpawns.shift()!;
    for (let i = 0; i < sp.count; i++) spawnEnemyNear(g, sp.x, sp.y, false, sp.ore);
  }
  // Blood moon multiplies dropped gold on the fly (loot handled elsewhere)
  void dropMultiplier;

  // check achievements and recalculate stats if any unlock triggers
  const newlyUnlocked = checkAchievements(g);
  if (
    newlyUnlocked ||
    g.time === 0 ||
    !g.player.achievementBonuses ||
    g.player.achievementBonuses.unlockedCount === 0
  ) {
    recalculateStats(g);
  }

  p.attackCd = Math.max(0, p.attackCd - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.hitFlash = Math.max(0, p.hitFlash - dt);

  // Shield recharge ticks and out-of-combat shield recovery
  p.shieldRechargeCd = Math.max(0, (p.shieldRechargeCd ?? 0) - dt * 60);
  if (p.shieldRechargeCd <= 0) {
    // Recharges 15% of max shield per second when out of combat
    const rechargeAmount = p.maxShield * 0.15 * dt;
    p.shield = Math.min(p.maxShield, p.shield + rechargeAmount);
  }

  const achBonus = p.achievementBonuses;
  const runeB = p.runeBonuses;
  p.mp = Math.min(p.maxMp, p.mp + dt * (2 + (p.attr.int + achBonus.intBonus) * 0.2));

  // Base HP regen + rune passive
  let finalHpRegen =
    0.5 + (p.attr.vit + achBonus.vitBonus) * 0.1 + achBonus.hpRegen + (runeB?.hpRegen ?? 0);
  let finalCdMult = runeB?.cooldownMult ?? 1;

  // --- CONDITIONAL ANCIENT RUNES PASSIVE TRIGGERS ---
  const hasRuneEquipped = (rid: string) => p.equippedRunes.some((r) => r?.runeId === rid);

  if (hasRuneEquipped("runa_sangue") && p.hp / p.maxHp < 0.35) {
    // Bloodlust: extra 2.5 HP regeneration and 20% temporary damage scaling
    finalHpRegen += 2.5;
    p.tempDmgMult = (p.tempDmgMult ?? 1.0) * 1.2;
    if (Math.random() < dt * 2) {
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 12,
        text: "FÚRIA DE SANGUE!",
        color: "#ff2020",
        life: 0.6,
        vy: -15,
      });
    }
  }
  if (hasRuneEquipped("runa_trovao") && p.mp >= p.maxMp) {
    // Lightning Charge: +25% player speed while fully charged
    p.speed *= 1.25;
  }
  if (hasRuneEquipped("runa_fogo") && p.comboCount >= 3) {
    // Ignite: extra damage scaling and faster attack recovery on high combos
    p.tempDmgMult = (p.tempDmgMult ?? 1.0) * 1.15;
  }
  if (hasRuneEquipped("runa_mente") && p.mp < p.maxMp * 0.25) {
    // Focus Surge: skills cooldown 30% faster when desperate for mana
    finalCdMult *= 0.7;
  }

  p.hp = Math.min(p.maxHp, p.hp + dt * finalHpRegen);
  for (const s of p.skills) s.cur = Math.max(0, s.cur - dt / finalCdMult);

  // --- Modificadores de inimigos: auras e efeitos passivos ---
  for (const e of g.enemies) {
    if (!e.modifiers || e.modifiers.length === 0) continue;
    const dx = e.pos.x - p.pos.x,
      dy = e.pos.y - p.pos.y;
    const dist2 = dx * dx + dy * dy;
    for (const m of e.modifiers) {
      if (m.id === "igneo" && dist2 < 90 * 90) {
        // aura de fogo: DoT ao redor
        const dmg = Math.max(1, Math.floor(e.atk * 0.15 * dt));
        if (p.invuln <= 0) {
          p.hp -= dmg;
          if (Math.random() < 0.4)
            g.floaters.push({
              x: p.pos.x,
              y: p.pos.y - 6,
              text: `${dmg}🔥`,
              color: "#ff6030",
              life: 0.6,
              vy: -20,
            });
        }
      } else if (m.id === "regenerador") {
        e.regenCd = (e.regenCd ?? 0) - dt;
        if ((e.regenCd ?? 0) <= 0) {
          e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.01);
          e.regenCd = 0.5;
        }
      } else if (m.id === "aterrador" && dist2 < 140 * 140) {
        // reduz efeito via invuln extra baixo — sinalizado apenas visualmente
        if (Math.random() < 0.02)
          g.floaters.push({
            x: p.pos.x,
            y: p.pos.y - 20,
            text: `Aterrado`,
            color: "#6020a0",
            life: 0.6,
            vy: -20,
          });
      } else if (m.id === "eletrizado") {
        e.boltCd = (e.boltCd ?? 2) - dt;
        if ((e.boltCd ?? 0) <= 0 && dist2 < 260 * 260) {
          g.projectiles.push({
            pos: { x: e.pos.x, y: e.pos.y },
            vel: { x: (-dx / Math.sqrt(dist2)) * 260, y: (-dy / Math.sqrt(dist2)) * 260 },
            life: 1.0,
            damage: Math.floor(e.atk * 0.8),
            from: "enemy",
            kind: "shock",
          });
          e.boltCd = 2.2;
        }
      }
    }
  }

  // --- ENVIRONMENTAL HAZARDS (Immersive gameplay mechanics per level/depth) ---
  const activeBiomeId =
    g.activeCaveBiome || (g.world ? tileAt(g, p.pos.x, p.pos.y)?.biome || 1 : 1);
  const floorDepth = g.activeFloor; // 1 = overworld, 2..6 = sub-floors (1 to 5)

  if (floorDepth > 1) {
    const hazardMult = 0.5 + (floorDepth - 1) * 0.5; // hazard scaling (1.0x to 3.0x)

    // 1. Radioactive Hazard (Biomes 32 & 52): green glow, drains health slightly unless high vit
    if (activeBiomeId === 32 || activeBiomeId === 52) {
      const radDmg = Math.max(0.1, 2.2 * hazardMult - p.attr.vit * 0.1) * dt;
      p.hp = Math.max(1, p.hp - radDmg);
      if (Math.random() < 0.18) {
        g.particles.push({
          x: p.pos.x + (Math.random() - 0.5) * 24,
          y: p.pos.y + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 12,
          vy: -15 - Math.random() * 20,
          size: 1.5 + Math.random() * 2.5,
          color: "#8ac040",
          alpha: 0.8,
          life: 0.6 + Math.random() * 0.4,
          maxLife: 1.0,
        });
      }
    }

    // 2. Extreme Frost (Biomes 6, 7, 52): icy slow, reduces player movement speed
    else if (activeBiomeId === 6 || activeBiomeId === 7 || activeBiomeId === 52) {
      const freezeSpdReduction = 0.08 * hazardMult; // speed penalty
      p.speed = Math.max(1.5, p.speed - freezeSpdReduction * dt);
      if (Math.random() < 0.15) {
        g.particles.push({
          x: p.pos.x + (Math.random() - 0.5) * 24,
          y: p.pos.y + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 8,
          size: 1 + Math.random() * 2,
          color: "#a8c8d8",
          alpha: 0.7,
          life: 0.5,
          maxLife: 0.5,
        });
      }
    }

    // 3. Scorching Heat (Biomes 10, 19, 40, 44, 55): orange flame, drains MP quickly
    else if (
      activeBiomeId === 10 ||
      activeBiomeId === 19 ||
      activeBiomeId === 40 ||
      activeBiomeId === 44 ||
      activeBiomeId === 55
    ) {
      const mpDrain = 1.6 * hazardMult * dt;
      p.mp = Math.max(0, p.mp - mpDrain);
      if (p.mp <= 0) {
        p.hp = Math.max(1, p.hp - 1.5 * hazardMult * dt);
      }
      if (Math.random() < 0.22) {
        g.particles.push({
          x: p.pos.x + (Math.random() - 0.5) * 20,
          y: p.pos.y + 12,
          vx: (Math.random() - 0.5) * 10,
          vy: -15 - Math.random() * 25,
          size: 1.5 + Math.random() * 3,
          color: "#ff6a1a",
          alpha: 0.9,
          life: 0.4 + Math.random() * 0.3,
          maxLife: 0.7,
        });
      }
    }

    // 4. Toxic Swamps (Biomes 5, 36, 58): purple spores, drains health, suppresses HP regeneration
    else if (activeBiomeId === 5 || activeBiomeId === 36 || activeBiomeId === 58) {
      const poisonDmg = 1.2 * hazardMult * dt;
      p.hp = Math.max(1, p.hp - poisonDmg);
      if (Math.random() < 0.15) {
        g.particles.push({
          x: p.pos.x + (Math.random() - 0.5) * 24,
          y: p.pos.y + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 8,
          vy: -8 - Math.random() * 12,
          size: 2 + Math.random() * 2.5,
          color: "#a880c0",
          alpha: 0.75,
          life: 0.8,
          maxLife: 0.8,
        });
      }
    }

    // 5. Magnetic Storms (Biomes 4, 35, 54, 59): copper sparkles, random slight drift in motion
    else if (
      activeBiomeId === 4 ||
      activeBiomeId === 35 ||
      activeBiomeId === 54 ||
      activeBiomeId === 59
    ) {
      const driftAngle = g.time * 4.5 + p.pos.x * 0.05;
      const driftSpd = 14 * hazardMult * dt;
      p.pos.x += Math.cos(driftAngle) * driftSpd;
      p.pos.y += Math.sin(driftAngle) * driftSpd;
      if (Math.random() < 0.18) {
        g.particles.push({
          x: p.pos.x + (Math.random() - 0.5) * 32,
          y: p.pos.y + (Math.random() - 0.5) * 32,
          vx: Math.cos(driftAngle) * 20,
          vy: Math.sin(driftAngle) * 20,
          size: 1 + Math.random() * 2,
          color: "#c88040",
          alpha: 0.85,
          life: 0.3,
          maxLife: 0.3,
        });
      }
    }

    // 6. Cosmic Blessing / Ethereal Grace (Biomes 14, 30, 50, 51, 60): stars, increases MP & HP regen, decreases skill CDs
    else if (
      activeBiomeId === 14 ||
      activeBiomeId === 30 ||
      activeBiomeId === 50 ||
      activeBiomeId === 51 ||
      activeBiomeId === 60
    ) {
      p.mp = Math.min(p.maxMp, p.mp + 2.8 * hazardMult * dt);
      p.hp = Math.min(p.maxHp, p.hp + 1.2 * hazardMult * dt);
      for (const s of p.skills) s.cur = Math.max(0, s.cur - 0.18 * hazardMult * dt);
      if (Math.random() < 0.28) {
        g.particles.push({
          x: p.pos.x + (Math.random() - 0.5) * 30,
          y: p.pos.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 4,
          vy: -6 - Math.random() * 10,
          size: 1 + Math.random() * 1.5,
          color: "#fff2c0",
          alpha: 0.95,
          life: 0.7,
          maxLife: 0.7,
        });
      }
    }
  }

  // discovered biome (overworld)
  if (!g.activeCaveBiome) {
    const t = tileAt(g, p.pos.x, p.pos.y);
    if (!g.discovered.has(t.biome) && t.biome > 0) {
      g.discovered.add(t.biome);
      const b = BIOMES.find((bb) => bb.id === t.biome);
      if (b) logMsg(g, `Nova região descoberta: ${b.name}`, "#5ea8ff");
    }
  }

  // staircase check
  if (g.stairCd <= 0) {
    const t = tileAt(g, p.pos.x, p.pos.y);
    if (t.kind === 21) {
      if (!g.activeCaveBiome && !inGrand(g) && !inTemple(g)) enterTemple(g);
    } else if (t.kind === 22) {
      if (!g.activeCaveBiome && !inGrand(g)) enterCelestialRoom(g);
    } else if (t.kind === 32) {
      exitCelestialRoom(g);
    } else if (t.kind >= 24 && t.kind <= 30) {
      enterContinent(g, t.kind - 23);
    } else if (t.kind === 31) {
      enterUnifiedBiomePortalRoom(g);
    } else if (t.kind === 33) {
      enterUnifiedBiomeDungeon(g, t.biome);
    } else if (t.kind === 16) {
      if (!inGrand(g)) descendGrand(g);
    } else if (t.kind === 17) {
      // Portal do Mundo Alternativo — cicla entre biomas 81..90.
      if (!g.activeCaveBiome && !inGrand(g)) enterAltWorld(g);
    } else if (t.kind === 19) {
      // Portal do Labirinto do Abismo — entra no biome 150.
      if (!g.activeCaveBiome && !inGrand(g)) enterAbismoLabyrinth(g);
    } else if (t.kind === 20) {
      // Portal da Fenda Cósmica — entra no biome 200.
      if (!g.activeCaveBiome && !inGrand(g)) enterCosmicSingularity(g);
    } else if (inGrand(g) && t.kind === 6) {
      descendGrand(g);
    } else if (inGrand(g) && t.kind === 7) {
      ascendGrand(g);
    } else if (inTemple(g) && t.kind === 6) {
      descendTemple(g);
    } else if (inTemple(g) && t.kind === 7) {
      ascendTemple(g);
    } else if (t.kind === 6) {
      const biome = g.activeCaveBiome ?? t.biome;
      if (g.activeFloor < biomeMaxFloor(biome)) descend(g, biome);
    } else if (t.kind === 7 && g.activeCaveBiome) {
      ascend(g);
    }
  }

  // NPC Ferreiro — se player adjacente ao tile 18 e apertar E, abre painel Ferreiro.
  if (!g.activeCaveBiome && !inGrand(g) && g.world.blacksmith) {
    const bs = g.world.blacksmith;
    const dx = p.pos.x - bs.x;
    const dy = p.pos.y - bs.y;
    const near = Math.abs(dx) <= TILE * 1.6 && Math.abs(dy) <= TILE * 1.6;
    if (near && g._ePressed) {
      g.panel = g.panel === "ferreiro" ? "none" : "ferreiro";
      g._ePressed = false;
      (g as any)._ePressedTimer = 0;
    }
  }

  // NPC Recrutador de Mercenários — se player adjacente ao tile 23 e apertar E, abre painel Mercenários.
  if (!g.activeCaveBiome && !inGrand(g) && g.world.recruiter) {
    const rc = g.world.recruiter;
    const dx = p.pos.x - rc.x;
    const dy = p.pos.y - rc.y;
    const near = Math.abs(dx) <= TILE * 1.6 && Math.abs(dy) <= TILE * 1.6;
    if (near && g._ePressed) {
      g.panel = g.panel === "mercenarios" ? "none" : "mercenarios";
      g._ePressed = false;
      (g as any)._ePressedTimer = 0;
    }
  }

  // chest interaction (grand dungeon)
  if (inGrand(g)) {
    const tx = Math.floor(p.pos.x / TILE),
      ty = Math.floor(p.pos.y / TILE);
    for (let oy = -1; oy <= 1; oy++)
      for (let ox = -1; ox <= 1; ox++) {
        const cx = tx + ox,
          cy = ty + oy;
        const tt = g.activeMap.get(cx, cy);
        if (tt.kind === 12) {
          const dx = (cx + 0.5) * TILE - p.pos.x,
            dy = (cy + 0.5) * TILE - p.pos.y;
          if (dx * dx + dy * dy < 40 * 40) openChestAt(g, cx, cy);
        }
      }
  }

  // spawns (no spawns in central city safe zone)
  const isTemple = inTemple(g);
  const inCity = !g.activeCaveBiome && !inGrand(g) && !inArena(g) && !isTemple;
  const distFromSpawn = inCity
    ? Math.hypot(p.pos.x - g.world.spawn.x, p.pos.y - g.world.spawn.y)
    : Infinity;
  const inSafeZone = inCity && distFromSpawn < TILE * 22;
  const enemyCap = isTemple ? 20 : inGrand(g) ? 16 : g.activeCaveBiome ? 12 : 18;
  if (!inArena(g)) {
    g.spawnTimer -= dt;
    const isApexFloor = isTemple && g.activeTempleFloor === TEMPLE_MAX_FLOOR;
    if (!inSafeZone && !isApexFloor && g.spawnTimer <= 0 && g.enemies.filter((e) => !e.isBoss).length < enemyCap) {
      spawnEnemyNear(g, p.pos.x, p.pos.y, false);
      g.spawnTimer = isTemple
        ? 0.4 + Math.random() * 0.4
        : inGrand(g)
          ? 0.6 + Math.random() * 0.8
          : g.activeCaveBiome
            ? 0.8 + Math.random() * 1.0
            : 1.2 + Math.random() * 1.5;
    }
    g.bossTimer -= dt;
    if (!inSafeZone && !isApexFloor && g.bossTimer <= 0) {
      if (g.enemies.filter((e) => e.isBoss).length < 2) spawnEnemyNear(g, p.pos.x, p.pos.y, true);
      g.bossTimer = isTemple
        ? 30 + Math.random() * 20
        : inGrand(g)
          ? 45 + Math.random() * 30
          : g.activeCaveBiome
            ? 60 + Math.random() * 30
            : 90 + Math.random() * 60;
    }
  } else {
    tickArena(g, dt);
  }

  // enemies AI
  for (const e of g.enemies) {
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.attackCd = Math.max(0, e.attackCd - dt);
    const dx = p.pos.x - e.pos.x,
      dy = p.pos.y - e.pos.y;
    const d = Math.hypot(dx, dy);
    const sight = e.isBoss ? 280 : 180;

    // --- BOSS TELEGRAPHED ATTACK CASTS ---
    if (e.isBoss && e.castTime !== undefined && e.castTime > 0) {
      e.castTime -= dt;
      if (e.castTime <= 0) {
        // Cast Finished! Execute the telegraphed impact!
        if (e.castType === "smash") {
          const dmgDist = Math.hypot(p.pos.x - e.pos.x, p.pos.y - e.pos.y);
          if (dmgDist < 120) {
            damagePlayer(g, Math.floor(e.atk * 1.65), e);
          }
          // Spawn massive shockwave particles!
          spawnParticles(g, e.pos.x, e.pos.y, "#ff4040", 45);
          g.hitstopTime = 0.15;
          g.shakeTime = 0.4;
          g.shakeIntensity = 6.0;
          g.floaters.push({
            x: e.pos.x,
            y: e.pos.y - 12,
            text: "GOLPE IMPACTANTE!",
            color: "#ff4040",
            life: 1.5,
            vy: -30,
          });
        } else if (e.castType === "eruption") {
          // Erupt under player!
          const pD = Math.hypot(p.pos.x - e.pos.x, p.pos.y - e.pos.y);
          if (pD < 180) {
            damagePlayer(g, Math.floor(e.atk * 1.8), e);
          }
          spawnParticles(g, p.pos.x, p.pos.y, "#ffaa00", 35);
          g.shakeTime = 0.3;
          g.shakeIntensity = 5.0;
          g.floaters.push({
            x: p.pos.x,
            y: p.pos.y - 12,
            text: "ERUPÇÃO ESPIRITUAL!",
            color: "#ffaa00",
            life: 1.2,
            vy: -25,
          });
        }
        e.castTime = 0;
        e.attackCd = 3.5 + Math.random() * 2; // cd before next action
      }
      continue; // Boss stays frozen in place during casting!
    }

    if (d < sight) {
      const s = e.speed * 60 * dt;
      if (d > 22) moveEntity(g, e.pos, (dx / d) * s, (dy / d) * s, e.radius);

      // Check if boss wants to start casting instead of simple basic attack
      if (e.isBoss && e.attackCd <= 0 && d < 140 && Math.random() < 0.45) {
        e.castType = Math.random() < 0.5 ? "smash" : "eruption";
        e.castMax = e.castType === "smash" ? 1.4 : 1.8;
        e.castTime = e.castMax;
        e.attackCd = 5.0; // high cd
        g.floaters.push({
          x: e.pos.x,
          y: e.pos.y - 20,
          text: e.castType === "smash" ? "🔥 CANALIZANDO ESMAGAR..." : "⚡ PREPARANDO ERUPÇÃO...",
          color: "#ff5000",
          life: 1.3,
          vy: -15,
        });
        continue;
      }

      if (d < 30 && e.attackCd <= 0) {
        e.attackCd = 0.8;
        damagePlayer(g, e.atk, e);
      }
    } else if (d > 900 && !e.isBoss) {
      g.enemies = g.enemies.filter((x) => x !== e);
    }
  }

  // minions (necromancer skeletons)
  if (p.minions.length) {
    for (const m of [...p.minions]) {
      m.life -= dt;
      m.attackCd = Math.max(0, m.attackCd - dt);
      if (m.life <= 0 || m.hp <= 0) {
        p.minions = p.minions.filter((x) => x !== m);
        continue;
      }
      // Find nearest enemy
      let best: Enemy | null = null;
      let bestD = 340;
      for (const e of g.enemies) {
        const dx = e.pos.x - m.pos.x,
          dy = e.pos.y - m.pos.y;
        const d = Math.hypot(dx, dy);
        if (d < bestD) {
          bestD = d;
          best = e;
        }
      }
      if (best) {
        const dx = best.pos.x - m.pos.x,
          dy = best.pos.y - m.pos.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > 20) moveEntity(g, m.pos, (dx / d) * 130 * dt, (dy / d) * 130 * dt, 8);
        if (d < 26 && m.attackCd <= 0) {
          m.attackCd = 0.7;
          damageEnemy(g, best, Math.floor(6 + p.attr.int * 1.2 + p.level));
        }
      } else {
        // follow player
        const dx = p.pos.x - m.pos.x,
          dy = p.pos.y - m.pos.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > 60) moveEntity(g, m.pos, (dx / d) * 100 * dt, (dy / d) * 100 * dt, 8);
      }
    }
  }

  // projectiles
  for (const pr of [...g.projectiles]) {
    pr.pos.x += pr.vel.x * 60 * dt;
    pr.pos.y += pr.vel.y * 60 * dt;
    pr.life -= dt;
    if (pr.life <= 0 || collides(g, pr.pos.x, pr.pos.y, 3)) {
      g.projectiles = g.projectiles.filter((x) => x !== pr);
      continue;
    }
    if (pr.from === "player") {
      for (const e of g.enemies) {
        const dd = Math.hypot(e.pos.x - pr.pos.x, e.pos.y - pr.pos.y);
        if (dd < e.radius + 4) {
          damageEnemy(g, e, pr.damage);
          // Apply class-specific hit reactions
          if (pr.kind === "holy_swing") {
            const healAmt = Math.max(1, Math.floor(4 + p.attr.int * 0.3));
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            g.floaters.push({
              x: p.pos.x,
              y: p.pos.y - 12,
              text: `+${healAmt}`,
              color: "#ffff80",
              life: 0.8,
              vy: -30,
            });
            spawnParticles(g, pr.pos.x, pr.pos.y, "#ffff80", 14, { gravity: 0.05, maxLife: 0.4 });
          } else if (pr.kind === "dark_bolt") {
            const healAmt = 2;
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            g.floaters.push({
              x: p.pos.x,
              y: p.pos.y - 12,
              text: `+${healAmt}`,
              color: "#4caf50",
              life: 0.8,
              vy: -30,
            });
            spawnParticles(g, pr.pos.x, pr.pos.y, "#a060ff", 14, { gravity: 0.02, maxLife: 0.5 });
          } else if (pr.kind === "magic_bolt") {
            spawnParticles(g, pr.pos.x, pr.pos.y, "#00bcd4", 18, {
              gravity: -0.01,
              maxLife: 0.6,
              grow: -2.0,
            });
          } else if (pr.kind === "sword_swing") {
            spawnParticles(g, pr.pos.x, pr.pos.y, "#e0e0e0", 12, { gravity: 0.06, maxLife: 0.3 });
          } else if (pr.kind === "arrow") {
            spawnParticles(g, pr.pos.x, pr.pos.y, "#a1887f", 8, { gravity: 0.08, maxLife: 0.35 });
          } else {
            spawnParticles(g, pr.pos.x, pr.pos.y, "#ff5722", 8, { gravity: 0.05, maxLife: 0.4 });
          }
          g.projectiles = g.projectiles.filter((x) => x !== pr);
          break;
        }
      }
    }
  }

  for (const f of [...g.floaters]) {
    f.life -= dt;
    f.y += f.vy * dt;
    if (f.life <= 0) g.floaters = g.floaters.filter((x) => x !== f);
  }

  // particles
  if (g.particles) {
    for (const pa of [...g.particles]) {
      pa.life -= dt;
      if (pa.life <= 0) {
        g.particles = g.particles.filter((x) => x !== pa);
        continue;
      }
      pa.x += pa.vx * 60 * dt;
      pa.y += pa.vy * 60 * dt;
      if (pa.gravity) pa.vy += pa.gravity * 60 * dt;
      if (pa.drag) {
        pa.vx *= Math.pow(pa.drag, 60 * dt);
        pa.vy *= Math.pow(pa.drag, 60 * dt);
      }
      if (pa.grow) pa.size = Math.max(0.1, pa.size + pa.grow * dt);
      pa.alpha = Math.max(0, pa.life / pa.maxLife);
    }
  }

  for (const l of [...g.loot]) {
    l.life -= dt;
    const dd = Math.hypot(l.pos.x - p.pos.x, l.pos.y - p.pos.y);
    if (dd < 24) {
      if (p.inventory.length < 32) {
        p.inventory.push(l.item);
        g.loot = g.loot.filter((x) => x !== l);
        logMsg(g, `Coletou ${l.item.name}`, l.item.color);
      }
    } else if (l.life <= 0) g.loot = g.loot.filter((x) => x !== l);
  }
  for (const lg of g.log) lg.life -= dt;
  g.log = g.log.filter((l) => l.life > 0);

  g.camera.x += (p.pos.x - g.camera.x) * Math.min(1, dt * 6);
  g.camera.y += (p.pos.y - g.camera.y) * Math.min(1, dt * 6);
}

export function useInventoryItem(g: GameState, idx: number) {
  const p = g.player;
  const it = p.inventory[idx];
  if (!it) return;
  if (it.kind === "potion") {
    p.hp = Math.min(p.maxHp, p.hp + it.power);
    g.floaters.push({
      x: p.pos.x,
      y: p.pos.y - 8,
      text: `+${it.power}`,
      color: "#60ff80",
      life: 1,
      vy: -30,
    });
    p.inventory.splice(idx, 1);
  } else if (it.kind === "weapon") {
    const cur = p.equipped.weapon;
    p.equipped.weapon = it;
    p.inventory.splice(idx, 1);
    if (cur) p.inventory.push(cur);
    logMsg(g, `Equipou ${it.name}`, it.color);
  } else if (it.kind === "armor") {
    const cur = p.equipped.armor;
    p.equipped.armor = it;
    p.inventory.splice(idx, 1);
    if (cur) p.inventory.push(cur);
    logMsg(g, `Equipou ${it.name}`, it.color);
  } else {
    const val = it.power * 2;
    p.gold += val;
    p.inventory.splice(idx, 1);
    logMsg(g, `Vendeu ${it.name} por ${val}g`, "#f0c060");
  }
}

export function allocAttr(g: GameState, k: "str" | "agi" | "int" | "vit") {
  const p = g.player;
  if (p.attrPoints <= 0) return;
  p.attr[k]++;
  p.attrPoints--;
  if (k === "vit") p.maxHp += 5;
  if (k === "int") p.maxMp += 3;
}

// ---- save / load ----
const SAVE_KEY = "eternal_realms_save_v2";
export function save(g: GameState) {
  const data = {
    seed: g.world.seed,
    player: {
      cls: g.player.cls,
      skin: g.player.skin,
      pos: g.player.pos,
      hp: g.player.hp,
      maxHp: g.player.maxHp,
      mp: g.player.mp,
      maxMp: g.player.maxMp,
      level: g.player.level,
      xp: g.player.xp,
      xpNext: g.player.xpNext,
      attr: g.player.attr,
      attrPoints: g.player.attrPoints,
      gold: g.player.gold,
      inventory: g.player.inventory,
      equipped: g.player.equipped,
      talents: g.player.talents || {},
      talentPoints: g.player.talentPoints || 0,
      divineAscensions: (g.player as any).divineAscensions || 0,
      divineEmbers: (g.player as any).divineEmbers || 0,
      discoveredRelics: (g.player as any).discoveredRelics || [],
    },
    kills: g.kills,
    bossKills: g.bossKills,
    discovered: Array.from(g.discovered),
    arenaBest: g.arenaBest,
    ambitious: g.ambitious,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}
export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const playerCls = data.player?.cls || "melee";
    const g = newGame(data.seed, playerCls);
    Object.assign(g.player, data.player);
    if (data.ambitious) {
      g.ambitious = data.ambitious;
    }
    if (!g.player.minions) g.player.minions = [];
    if (!g.player.materials) g.player.materials = {};
    if (!g.player.recipesKnown) g.player.recipesKnown = new Set();
    if (!g.player.talents) g.player.talents = {};
    if (typeof g.player.talentPoints !== "number") g.player.talentPoints = 0;
    g.player.skills = classSkills(g.player.cls);
    recomputeTalentBonuses(g);
    g.kills = data.kills;
    g.bossKills = data.bossKills;
    g.discovered = new Set(data.discovered);
    if (typeof data.arenaBest === "number") g.arenaBest = data.arenaBest;
    // Always respawn in the central city on load — the player keeps every
    // stat / item / talent but comes back to a safe spawn point.
    g.player.pos = { x: g.world.spawn.x, y: g.world.spawn.y };
    g.activeMap = g.world;
    g.activeCaveBiome = null;
    g.activeFloor = 1;
    g.activeGrandFloor = 0;
    g.enemies = [];
    g.projectiles = [];
    g.loot = [];
    g.floaters = [];
    g.activeArena = false;
    g.arena = null;
    g.arenaWave = 0;
    g.arenaWaveActive = false;
    g.camera = { x: g.player.pos.x, y: g.player.pos.y };
    // Full heal on return-to-city so the player isn't stuck at low HP.
    g.player.hp = g.player.maxHp;
    g.player.mp = g.player.maxMp;
    logMsg(g, "Bem-vindo de volta à Cidade Central de Asterion.", "#f0c060");
    return g;
  } catch {
    return null;
  }
}
export function wipeSave() {
  localStorage.removeItem(SAVE_KEY);
}
export function getIslandFromBiome(biomeId: number): number {
  if (biomeId <= 80) return 1;
  if (biomeId >= 201 && biomeId <= 250) return 2;
  if (biomeId >= 301 && biomeId <= 410) return 3;
  if (biomeId >= 501 && biomeId <= 599) return 4;
  if (biomeId >= 601 && biomeId <= 1599) {
    return Math.floor((biomeId - 100) / 100);
  }
  if (biomeId >= 2000 && biomeId < 4000) {
    return 15 + Math.floor((biomeId - 2000) / 100);
  }
  if (biomeId >= 4000) {
    return 35 + Math.floor((biomeId - 4000) / 100);
  }
  return 1;
}
export { BIOMES, RARITY_COLOR };
