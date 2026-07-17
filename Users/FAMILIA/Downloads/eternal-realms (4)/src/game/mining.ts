// Mining system: biome ores, veins, pickaxes and mining skill (level 1..999).
// Integrated with the main game loop: veins are entities living on the active map
// and are damaged when the player clicks close to them while facing them.

import { TILE, type Vec } from "./engine";
import type { GameState } from "./game";
import { rollOrbDrop, giveOrb, ORB_NAME, ORB_COLOR } from "./orbs";

export type OreKind =
  // Floresta
  | "pedra" | "cobre" | "ferro_enferrujado" | "madeira_antiga" | "resina" | "cristal_verde"
  // Deserto
  | "quartzo" | "ouro" | "arenito" | "obsidiana_negra" | "vidro_vulcanico"
  // Gelo
  | "gelo_eterno" | "safira" | "cristal_congelado" | "prata" | "diamante_azul"
  // Vulcão
  | "mithril" | "titanio" | "adamantita" | "lava_solidificada" | "rubi_flamejante"
  // Sombrio
  | "ebano" | "cristal_sombrio" | "onix" | "alma_corrompida" | "minerio_abissal"
  // Meteoros (evento)
  | "estelarium" | "cristal_meteorico";

export type Ore = {
  id: OreKind;
  name: string;
  color: string;
  hp: number;         // vein HP per unit
  level: number;      // required mining level (below this = penalty)
  xp: number;         // per drop
  gold: number;       // sell value per unit
  respawnSec: number; // time after depletion until next vein can spawn
  gem?: boolean;      // usable in socketing
  rare?: boolean;
};

// Ore catalogue. Values chosen so a fresh player mines Pedra quickly and
// Adamantita takes proper effort.
export const ORES: Record<OreKind, Ore> = {
  pedra:              { id:"pedra",              name:"Pedra",              color:"#a0a0a8", hp: 50,    level: 1,   xp: 3,   gold: 1,   respawnSec: 40 },
  cobre:              { id:"cobre",              name:"Cobre",              color:"#c67848", hp: 90,    level: 5,   xp: 6,   gold: 3,   respawnSec: 55 },
  ferro_enferrujado:  { id:"ferro_enferrujado",  name:"Ferro Enferrujado",  color:"#8a6a4a", hp: 180,   level: 15,  xp: 10,  gold: 6,   respawnSec: 80 },
  madeira_antiga:     { id:"madeira_antiga",     name:"Madeira Antiga",     color:"#6a4028", hp: 60,    level: 3,   xp: 4,   gold: 2,   respawnSec: 45 },
  resina:             { id:"resina",             name:"Resina",             color:"#e0a040", hp: 45,    level: 8,   xp: 5,   gold: 3,   respawnSec: 60 },
  cristal_verde:      { id:"cristal_verde",      name:"Cristal Verde",      color:"#60d080", hp: 220,   level: 22,  xp: 14,  gold: 12,  respawnSec: 110, gem: true },

  quartzo:            { id:"quartzo",            name:"Quartzo",            color:"#e0d8d0", hp: 100,   level: 6,   xp: 7,   gold: 4,   respawnSec: 60 },
  ouro:               { id:"ouro",               name:"Ouro",               color:"#f0c040", hp: 500,   level: 45,  xp: 40,  gold: 60,  respawnSec: 150 },
  arenito:            { id:"arenito",            name:"Arenito",            color:"#d8b880", hp: 70,    level: 4,   xp: 4,   gold: 2,   respawnSec: 50 },
  obsidiana_negra:    { id:"obsidiana_negra",    name:"Obsidiana Negra",    color:"#302838", hp: 700,   level: 60,  xp: 55,  gold: 90,  respawnSec: 180 },
  vidro_vulcanico:    { id:"vidro_vulcanico",    name:"Vidro Vulcânico",    color:"#603868", hp: 320,   level: 35,  xp: 25,  gold: 30,  respawnSec: 130 },

  gelo_eterno:        { id:"gelo_eterno",        name:"Gelo Eterno",        color:"#c0e8f8", hp: 260,   level: 30,  xp: 20,  gold: 20,  respawnSec: 120 },
  safira:             { id:"safira",             name:"Safira",             color:"#4080ff", hp: 600,   level: 55,  xp: 70,  gold: 130, respawnSec: 180, gem: true },
  cristal_congelado:  { id:"cristal_congelado",  name:"Cristal Congelado",  color:"#a0e0f0", hp: 380,   level: 40,  xp: 30,  gold: 45,  respawnSec: 150, gem: true },
  prata:              { id:"prata",              name:"Prata",              color:"#d8d8e8", hp: 350,   level: 32,  xp: 26,  gold: 40,  respawnSec: 140 },
  diamante_azul:      { id:"diamante_azul",      name:"Diamante Azul",      color:"#80c0ff", hp: 1400,  level: 110, xp: 220, gold: 480, respawnSec: 260, gem: true, rare: true },

  mithril:            { id:"mithril",            name:"Mithril",            color:"#c8e0ff", hp: 1200,  level: 90,  xp: 180, gold: 260, respawnSec: 240 },
  titanio:            { id:"titanio",            name:"Titânio",            color:"#a0a8b8", hp: 2200,  level: 120, xp: 320, gold: 380, respawnSec: 280 },
  adamantita:         { id:"adamantita",         name:"Adamantita",         color:"#ff4060", hp: 4000,  level: 150, xp: 520, gold: 720, respawnSec: 340, rare: true },
  lava_solidificada:  { id:"lava_solidificada",  name:"Lava Solidificada",  color:"#c04010", hp: 500,   level: 50,  xp: 45,  gold: 55,  respawnSec: 170 },
  rubi_flamejante:    { id:"rubi_flamejante",    name:"Rubi Flamejante",    color:"#ff5040", hp: 900,   level: 80,  xp: 120, gold: 220, respawnSec: 220, gem: true, rare: true },

  ebano:              { id:"ebano",              name:"Ébano",              color:"#302028", hp: 800,   level: 70,  xp: 90,  gold: 140, respawnSec: 200 },
  cristal_sombrio:    { id:"cristal_sombrio",    name:"Cristal Sombrio",    color:"#7040c0", hp: 1400,  level: 100, xp: 220, gold: 340, respawnSec: 260, gem: true, rare: true },
  onix:               { id:"onix",               name:"Ônix",               color:"#101018", hp: 1000,  level: 85,  xp: 150, gold: 240, respawnSec: 240, gem: true },
  alma_corrompida:    { id:"alma_corrompida",    name:"Alma Corrompida",    color:"#5028a0", hp: 1800,  level: 130, xp: 340, gold: 560, respawnSec: 300, rare: true },
  minerio_abissal:    { id:"minerio_abissal",    name:"Minério Abissal",    color:"#180820", hp: 5000,  level: 170, xp: 720, gold: 980, respawnSec: 380, rare: true },

  estelarium:         { id:"estelarium",         name:"Estelarium",         color:"#e0e0ff", hp: 300,   level: 1,   xp: 90,  gold: 200, respawnSec: 9999, rare: true },
  cristal_meteorico:  { id:"cristal_meteorico",  name:"Cristal Meteórico",  color:"#a0c0ff", hp: 600,   level: 1,   xp: 220, gold: 450, respawnSec: 9999, rare: true, gem: true },
};

// Which ores can appear per biome id (matches BIOMES ids in engine.ts).
// Biomes without an explicit entry fall back to a small generic pool.
export const BIOME_ORES: Record<number, OreKind[]> = {
  // Forest-like biomes
  1: ["pedra","madeira_antiga","cobre","resina"],
  2: ["pedra","madeira_antiga","cobre","ferro_enferrujado","resina","cristal_verde"],
  8: ["pedra","madeira_antiga","cobre","cristal_verde","resina"],
  25:["pedra","madeira_antiga","cristal_verde","resina"],
  // Desert-like
  3: ["arenito","quartzo","ouro","obsidiana_negra","vidro_vulcanico"],
  23:["arenito","quartzo","obsidiana_negra"],
  31:["arenito","quartzo","prata"],
  // Ice / tundra
  6: ["pedra","gelo_eterno","cristal_congelado","prata"],
  7: ["gelo_eterno","safira","cristal_congelado","diamante_azul","prata"],
  24:["gelo_eterno","cristal_congelado","diamante_azul"],
  // Volcano / fire
  10:["lava_solidificada","obsidiana_negra","rubi_flamejante","mithril","titanio","adamantita"],
  19:["lava_solidificada","obsidiana_negra","rubi_flamejante"],
  40:["mithril","titanio","adamantita","rubi_flamejante","lava_solidificada"],
  // Mountains / iron / caves
  4: ["pedra","cobre","ferro_enferrujado","mithril","titanio","prata"],
  13:["quartzo","safira","cristal_congelado","diamante_azul","cristal_sombrio"],
  18:["pedra","ferro_enferrujado","mithril","onix","ebano"],
  // Dark / shadow / abyss
  22:["ebano","cristal_sombrio","onix","alma_corrompida"],
  27:["cristal_sombrio","onix","alma_corrompida","minerio_abissal"],
  28:["cristal_sombrio","onix","alma_corrompida","minerio_abissal"],
  38:["ebano","alma_corrompida","minerio_abissal"],
  39:["ebano","cristal_sombrio","onix"],
  // Biomas ocidentais 71..80 (5 andares cada)
  71:["pedra","cobre","ferro_enferrujado","quartzo"],                    // Ruínas Esquecidas
  72:["cristal_verde","cristal_congelado","cristal_sombrio","safira"],   // Catacumbas de Cristal
  73:["pedra","madeira_antiga","resina","cristal_verde"],                // Pântano Envenenado
  74:["pedra","quartzo","safira","prata"],                               // Cidade Submersa
  75:["obsidiana_negra","vidro_vulcanico","onix","ebano"],               // Deserto de Vidro Negro
  76:["madeira_antiga","ebano","cristal_sombrio","onix"],                // Bosque dos Enforcados
  77:["lava_solidificada","obsidiana_negra","rubi_flamejante","mithril"],// Montanha Escaldante
  78:["madeira_antiga","cristal_sombrio","onix","alma_corrompida"],      // Biblioteca Perdida
  79:["pedra","prata","diamante_azul","ouro"],                           // Cripta de Marfim
  80:["cristal_sombrio","alma_corrompida","minerio_abissal","estelarium"], // Fenda Astral
  // Fallback for anything else: small mixed pool
};
function biomeOres(biome: number): OreKind[] {
  return BIOME_ORES[biome] ?? ["pedra","cobre","quartzo","ferro_enferrujado"];
}

export type VeinKind = "normal" | "runner" | "exploder" | "teleporter" | "summoner";

export type Vein = {
  id: number;
  pos: Vec;
  ore: OreKind;
  hp: number;
  maxHp: number;
  remaining: number;   // ore units left to drop
  kind: VeinKind;
  vel?: Vec;
  cooldown: number;    // reused for movement / teleport / summon timer
  life: number;        // seconds before despawning if untouched
  hitFlash: number;
  biome: number;
};

let veinSeq = 0;

function pickOreForBiome(biome: number, miningLevel: number): OreKind {
  const pool = biomeOres(biome).slice();
  // Weight favouring ores near the player's level while keeping variety.
  const weighted: { ore: OreKind; w: number }[] = pool.map((o) => {
    const meta = ORES[o];
    const gap = Math.abs(meta.level - Math.min(miningLevel, meta.level + 40));
    const w = meta.rare ? 1 : Math.max(0.4, 10 / (1 + gap));
    return { ore: o, w };
  });
  const total = weighted.reduce((a,b)=>a+b.w,0);
  let r = Math.random() * total;
  for (const w of weighted) { r -= w.w; if (r <= 0) return w.ore; }
  return weighted[0].ore;
}

function pickVeinKind(ore: OreKind): VeinKind {
  const meta = ORES[ore];
  const r = Math.random();
  if (meta.rare) {
    if (r < 0.35) return "teleporter";
    if (r < 0.55) return "summoner";
    if (r < 0.70) return "exploder";
    return "runner";
  }
  if (r < 0.85) return "normal";
  if (r < 0.90) return "runner";
  if (r < 0.94) return "exploder";
  if (r < 0.97) return "teleporter";
  return "summoner";
}

// Public API called by game.ts

export function initMining(g: GameState) {
  if (!g.veins) g.veins = [];
  if (g.oreRespawn === undefined) g.oreRespawn = 0;
}

function isBlockedTile(g: GameState, tx: number, ty: number): boolean {
  return g.activeMap.isBlocked(tx, ty);
}

export function spawnVeinNear(g: GameState, cx: number, cy: number, forceOre?: OreKind, forceKind?: VeinKind) {
  const biome = biomeAt(g, cx, cy);
  const ore = forceOre ?? pickOreForBiome(biome, g.player.miningLevel);
  const kind = forceKind ?? pickVeinKind(ore);
  const meta = ORES[ore];
  for (let attempt = 0; attempt < 30; attempt++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 140 + Math.random() * 320;
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist;
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (tx < 2 || ty < 2 || tx >= g.activeMap.size - 2 || ty >= g.activeMap.size - 2) continue;
    if (isBlockedTile(g, tx, ty)) continue;
    const drops = 8 + Math.floor(Math.random() * 23);
    g.veins.push({
      id: ++veinSeq,
      pos: { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 },
      ore, kind,
      hp: meta.hp, maxHp: meta.hp,
      remaining: drops,
      cooldown: 0, life: 180 + Math.random() * 120,
      hitFlash: 0, biome,
    });
    return;
  }
}

function biomeAt(g: GameState, wx: number, wy: number): number {
  if (g.activeCaveBiome) return g.activeCaveBiome;
  const t = g.activeMap.get(Math.floor(wx / TILE), Math.floor(wy / TILE));
  return t.biome || 1;
}

function spawnMiningParticles(g: GameState, x: number, y: number, color: string, count = 12) {
  if (!g.particles) g.particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 4;
    const life = 0.35 + Math.random() * 0.4;
    g.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      color,
      size: 1.4 + Math.random() * 2.5,
      life,
      maxLife: life,
      alpha: 1,
      grow: -1.6,
      gravity: 0.08,
      drag: 0.95,
    });
  }
}

// Attempt to mine at world position (called on player click).
// Returns true if a vein was hit (so the caller can skip a normal attack).
export function tryMineAt(g: GameState, wx: number, wy: number): boolean {
  if (!g.veins || g.veins.length === 0) return false;
  const p = g.player;
  const pick = p.equipped.pickaxe;
  const tier = pick?.pickaxeTier ?? 0;
  // Even without a pickaxe you can mine Pedra with bare hands, slowly.
  const bareHands = tier === 0;
  // Find nearest vein close enough to the click OR to the player.
  let best: Vein | null = null;
  let bestD = Infinity;
  for (const v of g.veins) {
    const dxc = v.pos.x - wx, dyc = v.pos.y - wy;
    const dc = Math.hypot(dxc, dyc);
    if (dc > 34) continue;
    const dxp = v.pos.x - p.pos.x, dyp = v.pos.y - p.pos.y;
    const dp = Math.hypot(dxp, dyp);
    if (dp > 80) continue;
    if (dp < bestD) { bestD = dp; best = v; }
  }
  if (!best) return false;
  if (p.attackCd > 0) return true; // absorb click while on cd
  const meta = ORES[best.ore];
  if (bareHands && meta.level > 3) return true;
  // Compute damage
  const stats = miningStats(p.miningLevel);
  // Balance: mineração ~10x mais demorada (dano dividido por 10)
  const baseDmg = (25 + (tier * 18) + Math.floor(p.attr.str * 1.6) + p.miningLevel * 2) / 10;
  const speedMult = 0.9 + stats.speed * 0.9;
  let dmg = Math.floor(baseDmg * speedMult);
  if (Math.random() < stats.crit) dmg *= 4;
  best.hp -= dmg;
  best.hitFlash = 0.18;
  spawnMiningParticles(g, best.pos.x, best.pos.y, meta.color, 12);
  p.attackCd = Math.max(0.08, 0.32 - stats.speed * 0.24);
  // Runner reacts by fleeing
  if (best.kind === "runner") {
    const dx = best.pos.x - p.pos.x, dy = best.pos.y - p.pos.y;
    const d = Math.hypot(dx, dy) || 1;
    best.vel = { x: dx / d * 60, y: dy / d * 60 };
    best.cooldown = 1.6;
  }
  if (best.hp <= 0) breakVein(g, best);
  return true;
}

function breakVein(g: GameState, v: Vein) {
  const p = g.player;
  const meta = ORES[v.ore];
  const stats = miningStats(p.miningLevel);
  spawnMiningParticles(g, v.pos.x, v.pos.y, meta.color, 36);
  // Massively boosted drops: base 2, chance for x2/x3/x5 bonanza
  let drops = 2;
  if (Math.random() < stats.tripleChance) drops = 5;
  else if (Math.random() < stats.doubleChance) drops = 3;
  // Bonus multiplier proportional to mining level (up to +100%)
  drops = Math.max(1, Math.round(drops * (1 + p.miningLevel / 500)));
  giveOre(g, v.ore, drops);
  const xpGain = Math.ceil(meta.xp * drops * 1.5);
  p.gainMiningXp(xpGain, (m, c) => g.log.unshift({ text: m, color: c ?? "#fff", life: 6 }));
  g.floaters.push({ x: v.pos.x, y: v.pos.y - 10, text: `+${drops} ${meta.name}`, color: meta.color, life: 1.4, vy: -30 });
  // Gem drops much more likely + often two gems
  if (Math.random() < stats.gemChance) {
    const gemCount = Math.random() < 0.35 ? 2 : 1;
    giveOre(g, meta.gem ? v.ore : "cristal_verde", gemCount);
    g.floaters.push({ x: v.pos.x, y: v.pos.y - 22, text: `+${gemCount} Gema`, color: "#a0f0ff", life: 1.2, vy: -30 });
  }
  // Rare bonus ore chance
  if (Math.random() < stats.rareChance) {
    giveOre(g, v.ore, 3);
    g.floaters.push({ x: v.pos.x, y: v.pos.y - 34, text: `+3 BÔNUS`, color: "#f0b040", life: 1.4, vy: -30 });
  }
  // ---- Orb drop from mining (very rare) ----
  {
    const orb = rollOrbDrop("mining", p.miningLevel);
    if (orb) {
      giveOrb(g, orb, 1);
      g.log.unshift({ text: `Encontrou ${ORB_NAME[orb]} no veio!`, color: ORB_COLOR[orb], life: 6 });
      g.floaters.push({ x: v.pos.x, y: v.pos.y - 46, text: `◈ ${ORB_NAME[orb]}`, color: ORB_COLOR[orb], life: 2.5, vy: -25 });
    }
  }
  // ---- Ancient Relic drop from underwater mining ----
  if (p.isUnderwater) {
    const relicCount = Math.floor(Math.random() * 3) + 1;
    p.ancientRelics = (p.ancientRelics || 0) + relicCount;
    g.floaters.push({ x: v.pos.x, y: v.pos.y - 58, text: `+${relicCount} Relíquia Ancestral 🏺`, color: "#a8dadc", life: 1.8, vy: -30 });
    g.log.unshift({ text: `🏺 Encontrou ${relicCount}x Relíquia Ancestral ao minerar sob a água!`, color: "#a8dadc", life: 6 });
  }
  v.remaining -= drops;
  if (v.remaining <= 0) {
    if (v.kind === "exploder") {
      const R = 100;
      for (const e of [...g.enemies]) {
        const dx = e.pos.x - v.pos.x, dy = e.pos.y - v.pos.y;
        if (dx*dx+dy*dy < R*R) { e.hp -= 60; e.hitFlash = 0.15; }
      }
      const px = p.pos.x - v.pos.x, py = p.pos.y - v.pos.y;
      if (px*px+py*py < R*R) { p.hp = Math.max(1, p.hp - 20); p.hitFlash = 0.2; }
      g.floaters.push({ x: v.pos.x, y: v.pos.y, text: "BOOM!", color: "#ff8040", life: 1.2, vy: -20 });
    }
    if (v.kind === "summoner") {
      g.floaters.push({ x: v.pos.x, y: v.pos.y - 6, text: "Monstros!", color: "#ff6060", life: 1.4, vy: -20 });
      _pendingMonsterSpawns.push({ x: v.pos.x, y: v.pos.y, count: 2, ore: v.ore });
    }
    if (v.kind === "teleporter") {
      spawnVeinNear(g, p.pos.x, p.pos.y, v.ore, "teleporter");
    }
    g.veins = g.veins.filter(x => x !== v);
    // Much faster respawn
    g.oreRespawn = Math.min(g.oreRespawn, meta.respawnSec * 0.15);
    return;
  }
  v.hp = v.maxHp;
}

// Deferred monster spawn requests (consumed by game.ts loop)
export const _pendingMonsterSpawns: { x: number; y: number; count: number; ore?: OreKind }[] = [];

export function giveOre(g: GameState, ore: OreKind, count: number) {
  const p = g.player;
  p.materials[ore] = (p.materials[ore] ?? 0) + count;
}

export function updateVeins(g: GameState, dt: number) {
  if (!g.veins) return;
  const p = g.player;
  for (const v of g.veins) {
    v.hitFlash = Math.max(0, v.hitFlash - dt);
    v.life -= dt;
    v.cooldown = Math.max(0, v.cooldown - dt);
    if (v.kind === "runner" && v.vel && v.cooldown > 0) {
      const nx = v.pos.x + v.vel.x * dt;
      const ny = v.pos.y + v.vel.y * dt;
      const tx = Math.floor(nx / TILE), ty = Math.floor(ny / TILE);
      if (!g.activeMap.isBlocked(tx, ty)) { v.pos.x = nx; v.pos.y = ny; }
      else v.cooldown = 0;
    }
    if (v.kind === "teleporter" && v.cooldown <= 0) {
      const dx = p.pos.x - v.pos.x, dy = p.pos.y - v.pos.y;
      if (dx*dx+dy*dy < 90*90 && Math.random() < 0.6) {
        // teleport away
        const ang = Math.random() * Math.PI * 2;
        const dist = 260 + Math.random() * 200;
        const nx = v.pos.x + Math.cos(ang) * dist;
        const ny = v.pos.y + Math.sin(ang) * dist;
        const tx = Math.floor(nx / TILE), ty = Math.floor(ny / TILE);
        if (tx > 2 && ty > 2 && tx < g.activeMap.size - 2 && ty < g.activeMap.size - 2 && !g.activeMap.isBlocked(tx, ty)) {
          v.pos.x = nx; v.pos.y = ny;
          g.floaters.push({ x: v.pos.x, y: v.pos.y - 8, text: "*puf*", color: "#a080ff", life: 0.9, vy: -20 });
        }
        v.cooldown = 4;
      } else v.cooldown = 1.5;
    }
  }
  g.veins = g.veins.filter(v => v.life > 0);
  // Ambient respawn
  g.oreRespawn -= dt;
  const targetVeins = Math.min(60, 12 + Math.floor(p.miningLevel / 8));
  if (g.veins.length < targetVeins && g.oreRespawn <= 0) {
    spawnVeinNear(g, p.pos.x, p.pos.y);
    g.oreRespawn = 0.8 + Math.random() * 1.6;
  }
}

export type MiningStats = {
  speed: number;         // 0..1 (multiplier factor)
  crit: number;          // 0..1
  doubleChance: number;  // 0..1
  tripleChance: number;  // 0..1
  gemChance: number;     // 0..1
  rareChance: number;    // 0..1
  mapChance: number;     // 0..1 (secret map drops — used elsewhere)
  chestChance: number;   // 0..1
};

export function miningStats(level: number): MiningStats {
  const t = Math.min(1, level / 999);
  // Overhauled: much higher baselines and scaling
  return {
    speed:        0.45 + t * 0.55,
    crit:         0.15 + t * 0.45,
    doubleChance: 0.30 + t * 0.55,
    tripleChance: 0.15 + t * 0.45,
    gemChance:    0.20 + t * 0.55,
    rareChance:   0.08 + t * 0.32,
    mapChance:    0.05 + t * 0.25,
    chestChance:  0.06 + t * 0.30,
  };
}

// ---- Pickaxe items --------------------------------------------------------
export const PICKAXE_TIERS: { tier: number; name: string; power: number; color: string; miningLevel: number }[] = [
  { tier: 1,  name: "Picareta de Madeira",  power: 4,   color: "#8a6a4a", miningLevel: 1   },
  { tier: 2,  name: "Picareta de Pedra",    power: 8,   color: "#909096", miningLevel: 10  },
  { tier: 3,  name: "Picareta de Ferro",    power: 14,  color: "#c8c8d0", miningLevel: 25  },
  { tier: 4,  name: "Picareta de Aço",      power: 22,  color: "#a0b0c0", miningLevel: 45  },
  { tier: 5,  name: "Picareta de Mithril",  power: 34,  color: "#c8e0ff", miningLevel: 70  },
  { tier: 6,  name: "Picareta de Titânio",  power: 52,  color: "#a0a8b8", miningLevel: 110 },
  { tier: 7,  name: "Picareta de Adamantita", power: 80, color: "#ff4060", miningLevel: 160 },
  { tier: 8,  name: "Picareta Lendária",    power: 130, color: "#f0b040", miningLevel: 240 },
  { tier: 9,  name: "Picareta Divina",      power: 210, color: "#fff080", miningLevel: 400 },
  { tier: 10, name: "Picareta do Criador",  power: 340, color: "#ffffff", miningLevel: 700 },
];

let pickSeq = 0;
export function makePickaxe(tier: number) {
  const t = PICKAXE_TIERS.find(p => p.tier === tier) ?? PICKAXE_TIERS[0];
  pickSeq++;
  return {
    id: `pick_${pickSeq}`,
    name: t.name,
    kind: "weapon" as const,
    rarity: "raro" as const,
    power: t.power,
    icon: "⛏",
    color: t.color,
    isPickaxe: true,
    pickaxeTier: t.tier,
  };
}
