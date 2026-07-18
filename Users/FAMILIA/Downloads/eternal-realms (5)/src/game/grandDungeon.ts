// Grand Dungeon of Asterion — 100 floors of increasing difficulty (x1.2 per floor)
// Connected to the central city of Asterion via a special staircase.
//
// Tile kinds used (in addition to the base 0..7):
//   8  torch         (walkable, decorative light)
//   9  cracked wall  (blocking, visually cracked stone — hides secret rooms)
//  10  iron gate     (walkable, decorative doorway)
//  11  steel pillar  (blocking, decorative)
//  12  chest         (walkable trigger — opens on step)
//  13  building floor
//  14  building wall (blocking)
//  15  fountain      (blocking)
//  16  grand stair down (special — leads INTO the grand dungeon from the city)
//
// The dungeon is a labyrinth: many rooms of varying sizes, connected by
// twisting corridors, with iron gates at doorways, torches lining the walls,
// steel pillars in large chambers, cracked walls masking small secret rooms
// with chests that reward the player.

import { TILE, type PlayMap, type WorldTile, type Stair } from "./engine";

export const GRAND_MAX_FLOOR = 100;
export const DIFFICULTY_PER_FLOOR = 1.2;

// Names roughly grouped by dungeon depth. The full 100 floors reuse this
// pool with a floor-tier suffix so every floor introduces new fauna.
export const GRAND_ENEMIES: { pool: string[]; boss: string }[] = [
  { pool: ["Rato de Cripta", "Servo Enferrujado", "Aprendiz Sombrio", "Morcego Fétido"],           boss: "Guarda da Entrada" },
  { pool: ["Esqueleto Rachado", "Ladino do Portão", "Kobold de Ferro", "Aranha do Corredor"],       boss: "Executor Enferrujado" },
  { pool: ["Cavaleiro Caído", "Zumbi Blindado", "Sombra Menor", "Golem de Escombros"],              boss: "Carcereiro de Aço" },
  { pool: ["Espectro do Calabouço", "Bruxo das Grades", "Trol das Câmaras", "Duelista Ossuário"],   boss: "Duque de Ferro" },
  { pool: ["Necromante Menor", "Homúnculo de Cobre", "Verme das Paredes", "Aranha de Obsidiana"],   boss: "Mestre das Chaves" },
  { pool: ["Golem de Bronze", "Elemental do Portão", "Servo do Vazio", "Assombração de Ferro"],     boss: "Alquimista Trancado" },
  { pool: ["Vampiro do Corredor", "Cavaleiro Espectral", "Berserker Rachado", "Sacerdote Sombrio"], boss: "Baronesa da Cinza" },
  { pool: ["Golem de Aço", "Wyvern do Poço", "Xamã Corrompido", "Anão Amaldiçoado"],                boss: "Guardião Colossal" },
  { pool: ["Demônio Menor", "Titã de Ferro", "Necromante Ancião", "Serva do Abismo"],               boss: "Herald do Abismo" },
  { pool: ["Arauto Sombrio", "Cavaleiro do Vazio", "Elemental Primal", "Aberrante Antigo"],         boss: "Senhor do Fim" },
];

function tierFor(floor: number) {
  // 10 tiers across 100 floors
  return Math.min(9, Math.floor((floor - 1) / 10));
}

export function enemyNameForFloor(floor: number, boss: boolean) {
  const t = tierFor(floor);
  const tier = GRAND_ENEMIES[t];
  const suffix = floor <= 20 ? "" : floor <= 50 ? " Ancião" : floor <= 80 ? " Colossal" : " Cósmico";
  if (boss) return `${tier.boss}${suffix}`;
  const name = tier.pool[Math.floor(Math.random() * tier.pool.length)];
  return `${name}${suffix}`;
}

export function difficultyMultiplier(floor: number) {
  // 1.2^(floor-1)
  return Math.pow(DIFFICULTY_PER_FLOOR, Math.max(0, floor - 1));
}

// ============ Simple deterministic RNG ============
function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Room = { x: number; y: number; w: number; h: number; cx: number; cy: number; big: boolean };

export class GrandDungeonFloor implements PlayMap {
  size: number;
  seed: number;
  floor: number;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number } = { x: 0, y: 0 };
  readonly isCave = true;
  readonly biomeId = 0;
  readonly isGrand = true;
  readonly chests: { x: number; y: number; secret: boolean; opened: boolean }[] = [];
  torches: { x: number; y: number }[] = [];

  constructor(floor: number, seed: number) {
    this.floor = floor;
    this.seed = seed;
    // Floors get progressively larger; every floor is still "huge".
    this.size = Math.min(260, 160 + Math.floor(floor / 4) * 4);
    this.tiles = new Array(this.size * this.size);
    this.generate();
  }

  idx(x: number, y: number) { return y * this.size + x; }
  inBounds(x: number, y: number) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }
  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 2, biome: 0 };
    return this.tiles[this.idx(x, y)];
  }
  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 2 || t === 9 || t === 11 || t === 14 || t === 15;
  }

  private setTile(x: number, y: number, kind: number) {
    if (!this.inBounds(x, y)) return;
    this.tiles[this.idx(x, y)].kind = kind;
  }

  private generate() {
    const s = this.size;
    const rnd = mulberry32(this.seed);

    // Fill entirely with stone wall (mix of plain 2 and cracked 9)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const cracked = rnd() < 0.18 ? 9 : 2;
        this.tiles[y * s + x] = { kind: cracked, biome: 0 };
      }
    }

    // Place rooms
    const rooms: Room[] = [];
    const roomTarget = 22 + Math.floor(s / 8);
    let tries = 0;
    while (rooms.length < roomTarget && tries < 800) {
      tries++;
      const big = rnd() < 0.25;
      const w = big ? 12 + Math.floor(rnd() * 10) : 6 + Math.floor(rnd() * 6);
      const h = big ? 10 + Math.floor(rnd() * 8) : 5 + Math.floor(rnd() * 6);
      const x = 3 + Math.floor(rnd() * (s - w - 6));
      const y = 3 + Math.floor(rnd() * (s - h - 6));
      const overlap = rooms.some(r => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y);
      if (overlap) continue;
      rooms.push({ x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2), big });
    }

    // Carve rooms as walkable floor (0) and put walls around them
    for (const r of rooms) {
      for (let y = r.y; y < r.y + r.h; y++) {
        for (let x = r.x; x < r.x + r.w; x++) {
          this.setTile(x, y, 0);
        }
      }
      // Steel pillars in big rooms
      if (r.big) {
        const px1 = r.x + 2, py1 = r.y + 2;
        const px2 = r.x + r.w - 3, py2 = r.y + r.h - 3;
        this.setTile(px1, py1, 11);
        this.setTile(px2, py1, 11);
        this.setTile(px1, py2, 11);
        this.setTile(px2, py2, 11);
      }
      // Torches on inner walls (place torch tile just inside room next to wall)
      for (let x = r.x; x < r.x + r.w; x++) {
        if (rnd() < 0.14) { this.setTile(x, r.y, 8); this.torches.push({ x, y: r.y }); }
        if (rnd() < 0.14) { this.setTile(x, r.y + r.h - 1, 8); this.torches.push({ x, y: r.y + r.h - 1 }); }
      }
      for (let y = r.y; y < r.y + r.h; y++) {
        if (rnd() < 0.14) { this.setTile(r.x, y, 8); this.torches.push({ x: r.x, y }); }
        if (rnd() < 0.14) { this.setTile(r.x + r.w - 1, y, 8); this.torches.push({ x: r.x + r.w - 1, y }); }
      }
    }

    // Connect rooms with corridors — MST-like: link each to nearest unlinked, plus extra loops
    const linked = new Set<number>();
    linked.add(0);
    while (linked.size < rooms.length) {
      let bestA = -1, bestB = -1, bestD = Infinity;
      for (const a of linked) {
        for (let b = 0; b < rooms.length; b++) {
          if (linked.has(b)) continue;
          const dx = rooms[a].cx - rooms[b].cx, dy = rooms[a].cy - rooms[b].cy;
          const d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; bestA = a; bestB = b; }
        }
      }
      if (bestA < 0) break;
      this.carveCorridor(rooms[bestA], rooms[bestB], rnd);
      linked.add(bestB);
    }
    // Extra loops to make it labyrinthine
    for (let i = 0; i < Math.floor(rooms.length * 0.35); i++) {
      const a = Math.floor(rnd() * rooms.length);
      const b = Math.floor(rnd() * rooms.length);
      if (a !== b) this.carveCorridor(rooms[a], rooms[b], rnd);
    }

    // Iron gates at some room entrances (find corridor tiles adjacent to room borders)
    for (const r of rooms) {
      const edges: [number, number][] = [];
      const scan = (x: number, y: number) => {
        if (!this.inBounds(x, y)) return;
        if (this.tiles[this.idx(x, y)].kind === 0) edges.push([x, y]);
      };
      for (let x = r.x - 1; x <= r.x + r.w; x++) { scan(x, r.y - 1); scan(x, r.y + r.h); }
      for (let y = r.y - 1; y <= r.y + r.h; y++) { scan(r.x - 1, y); scan(r.x + r.w, y); }
      if (edges.length && rnd() < 0.55) {
        const [gx, gy] = edges[Math.floor(rnd() * edges.length)];
        this.setTile(gx, gy, 10);
      }
    }

    // Secret rooms (hidden behind cracked walls) with chests
    const secretCount = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < secretCount; i++) {
      this.placeSecretRoom(rnd);
    }

    // Also drop 1-2 regular visible chests in random rooms
    const visibleChests = 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < visibleChests; i++) {
      const r = rooms[Math.floor(rnd() * rooms.length)];
      const cx = r.x + 1 + Math.floor(rnd() * (r.w - 2));
      const cy = r.y + 1 + Math.floor(rnd() * (r.h - 2));
      if (this.tiles[this.idx(cx, cy)].kind === 0) {
        this.setTile(cx, cy, 12);
        this.chests.push({ x: cx, y: cy, secret: false, opened: false });
      }
    }

    // Stair placement: spawn at first room, down-stair at farthest room
    const spawnR = rooms[0];
    this.spawn = { x: spawnR.cx * TILE + TILE / 2, y: spawnR.cy * TILE + TILE / 2 };
    // Stair up (back to previous floor / city)
    this.setTile(spawnR.cx, spawnR.cy, 7);
    this.stairs.push({ x: spawnR.cx * TILE + TILE / 2, y: spawnR.cy * TILE + TILE / 2, biome: 0, kind: "up" });
    // Farthest room
    let far = spawnR, best = 0;
    for (const r of rooms) {
      const d = (r.cx - spawnR.cx) ** 2 + (r.cy - spawnR.cy) ** 2;
      if (d > best) { best = d; far = r; }
    }
    // Only place stair-down if not the last floor
    if (this.floor < GRAND_MAX_FLOOR) {
      this.setTile(far.cx, far.cy, 6);
      this.stairs.push({ x: far.cx * TILE + TILE / 2, y: far.cy * TILE + TILE / 2, biome: 0, kind: "down" });
    } else {
      // Final floor — put a chest with legendary reward at the throne
      this.setTile(far.cx, far.cy, 12);
      this.chests.push({ x: far.cx, y: far.cy, secret: false, opened: false });
    }
  }

  private carveCorridor(a: Room, b: Room, rnd: () => number) {
    const zig = rnd() < 0.5;
    if (zig) {
      const x0 = Math.min(a.cx, b.cx), x1 = Math.max(a.cx, b.cx);
      for (let x = x0; x <= x1; x++) { this.setTile(x, a.cy, 0); this.setTile(x, a.cy + 1, 0); }
      const y0 = Math.min(a.cy, b.cy), y1 = Math.max(a.cy, b.cy);
      for (let y = y0; y <= y1; y++) { this.setTile(b.cx, y, 0); this.setTile(b.cx + 1, y, 0); }
    } else {
      const y0 = Math.min(a.cy, b.cy), y1 = Math.max(a.cy, b.cy);
      for (let y = y0; y <= y1; y++) { this.setTile(a.cx, y, 0); this.setTile(a.cx + 1, y, 0); }
      const x0 = Math.min(a.cx, b.cx), x1 = Math.max(a.cx, b.cx);
      for (let x = x0; x <= x1; x++) { this.setTile(x, b.cy, 0); this.setTile(x, b.cy + 1, 0); }
    }
  }

  private placeSecretRoom(rnd: () => number) {
    const s = this.size;
    // Find a walkable tile adjacent to a wall we can hollow into
    for (let tries = 0; tries < 200; tries++) {
      const x = 4 + Math.floor(rnd() * (s - 12));
      const y = 4 + Math.floor(rnd() * (s - 12));
      if (this.tiles[this.idx(x, y)].kind !== 0) continue;
      // 4 possible dig directions
      const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const [dx, dy] = dirs[Math.floor(rnd() * 4)];
      // Wall for 1 tile, then a 4x4 hollow
      const wx = x + dx, wy = y + dy;
      const rx = wx + dx, ry = wy + dy;
      const rw = 4, rh = 4;
      const rx0 = dx > 0 ? rx : dx < 0 ? rx - rw + 1 : rx - 1;
      const ry0 = dy > 0 ? ry : dy < 0 ? ry - rh + 1 : ry - 1;
      // Check room area is currently wall
      let ok = true;
      for (let yy = ry0; yy < ry0 + rh && ok; yy++)
        for (let xx = rx0; xx < rx0 + rw && ok; xx++) {
          if (!this.inBounds(xx, yy)) { ok = false; break; }
          const k = this.tiles[this.idx(xx, yy)].kind;
          if (k === 0 || k === 8 || k === 10) ok = false;
        }
      if (!ok) continue;
      // Carve room, mark entry as CRACKED wall (breakable-looking secret)
      for (let yy = ry0; yy < ry0 + rh; yy++)
        for (let xx = rx0; xx < rx0 + rw; xx++) this.setTile(xx, yy, 0);
      this.setTile(wx, wy, 9); // secret cracked wall entrance
      // Chest in center
      const cx = rx0 + Math.floor(rw / 2), cy = ry0 + Math.floor(rh / 2);
      this.setTile(cx, cy, 12);
      this.chests.push({ x: cx, y: cy, secret: true, opened: false });
      // Torches at corners
      this.setTile(rx0, ry0, 8);
      this.setTile(rx0 + rw - 1, ry0 + rh - 1, 8);
      return;
    }
  }
}
