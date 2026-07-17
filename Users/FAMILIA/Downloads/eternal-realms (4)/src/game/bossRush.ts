// Boss Rush Arena — endless survival mode accessed from the central city.
// A single enclosed arena with waves of increasingly difficult enemies.
// Local leaderboard: highest wave reached.

import { TILE, type PlayMap, type WorldTile, type Stair } from "./engine";

const ARENA_KEY = "eternal-realms.bossRush.best";

export function loadBossRushBest(): number {
  try {
    const v = localStorage.getItem(ARENA_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch { return 0; }
}

export function saveBossRushBest(wave: number) {
  try {
    const cur = loadBossRushBest();
    if (wave > cur) localStorage.setItem(ARENA_KEY, String(wave));
  } catch { /* noop */ }
}

/**
 * Arena tile map. Simple square walled room with decorative pillars.
 * A single "exit" stair at the south spawn returns the player to the city.
 */
export class BossRushArena implements PlayMap {
  size = 30;
  seed: number;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number } = { x: 0, y: 0 };
  readonly isCave = true;
  readonly biomeId = 0;
  readonly isArena = true;

  constructor(seed = 1) {
    this.seed = seed;
    this.tiles = new Array(this.size * this.size);
    this.generate();
  }

  idx(x: number, y: number) { return y * this.size + x; }
  inBounds(x: number, y: number) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }
  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 14, biome: 0 };
    return this.tiles[this.idx(x, y)];
  }
  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 14 || t === 11 || t === 15;
  }

  private setTile(x: number, y: number, kind: number) {
    if (!this.inBounds(x, y)) return;
    this.tiles[this.idx(x, y)].kind = kind;
  }

  private generate() {
    const s = this.size;
    // Fill with polished arena floor (13 = building floor)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        this.tiles[y * s + x] = { kind: 13, biome: 0 };
      }
    }
    // Outer wall
    for (let x = 0; x < s; x++) {
      this.setTile(x, 0, 14);
      this.setTile(x, s - 1, 14);
    }
    for (let y = 0; y < s; y++) {
      this.setTile(0, y, 14);
      this.setTile(s - 1, y, 14);
    }
    // Decorative pillars in a symmetric pattern
    const pillars: Array<[number, number]> = [
      [6, 6], [23, 6], [6, 23], [23, 23],
      [14, 8], [15, 8], [14, 21], [15, 21],
    ];
    for (const [px, py] of pillars) this.setTile(px, py, 11);
    // Torches around the arena
    const torches: Array<[number, number]> = [
      [4, 4], [25, 4], [4, 25], [25, 25],
      [14, 4], [15, 4], [14, 25], [15, 25],
    ];
    for (const [tx, ty] of torches) this.setTile(tx, ty, 8);
    // Central fountain (blocking) as visual anchor
    this.setTile(14, 14, 15);
    this.setTile(15, 14, 15);
    this.setTile(14, 15, 15);
    this.setTile(15, 15, 15);

    // Exit stair-up at south center (returns to city)
    const ex = Math.floor(s / 2), ey = s - 3;
    this.setTile(ex, ey, 7);
    this.stairs.push({ x: ex * TILE + TILE / 2, y: ey * TILE + TILE / 2, biome: 0, kind: "up" });

    // Spawn just above the exit
    this.spawn = { x: ex * TILE + TILE / 2, y: (ey - 2) * TILE + TILE / 2 };
  }
}

/** Compute enemy count for a given wave. */
export function enemiesInWave(wave: number): number {
  return Math.min(14, 3 + Math.floor(wave / 2));
}

/** True if this wave should include a boss. */
export function isBossWave(wave: number): boolean {
  return wave > 0 && wave % 5 === 0;
}

/** Difficulty multiplier for wave N (HP / ATK scaling). */
export function waveMultiplier(wave: number): number {
  return Math.pow(1.14, Math.max(0, wave - 1));
}

/** Wave gold bonus awarded when clearing a wave. */
export function waveClearGold(wave: number): number {
  return 20 * wave + (isBossWave(wave) ? 100 * (wave / 5) : 0);
}

/** XP awarded per enemy in wave N. */
export function waveEnemyXp(wave: number): number {
  return 15 + wave * 6;
}

/** A themed enemy name for the arena at wave N. */
export function arenaEnemyName(wave: number, boss: boolean): string {
  const pool = [
    "Gladiador", "Retiário", "Bestiário", "Campeão",
    "Guardião da Arena", "Mercenário Sombrio", "Cavaleiro Renegado",
    "Executor Mascarado", "Duelista Fantasma", "Assassino da Arena",
  ];
  const suffix = wave <= 5 ? "" : wave <= 15 ? " Veterano" : wave <= 30 ? " Ancião" : " Lendário";
  if (boss) return `Campeão da Arena${suffix} (Onda ${wave})`;
  return `${pool[Math.floor(Math.random() * pool.length)]}${suffix}`;
}