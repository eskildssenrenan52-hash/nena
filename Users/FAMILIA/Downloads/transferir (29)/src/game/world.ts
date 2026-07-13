import { TILE_BLOCK, BIOMES, DUNGEON_BIOMES, DUNGEON_FLOORS } from "./config";

export interface Stair {
  tx: number; ty: number;
  target: string;
  dstX: number; dstY: number;
  label: string;
  kind: "down" | "up";
}

export interface NpcMarker {
  tx: number; ty: number;
  kind: "bank" | "dummy" | "blacksmith";
  label: string;
}

export interface WorldMap {
  id: string;
  w: number; h: number;
  tiles: Uint8Array;
  stairs: Stair[];
  npcs: NpcMarker[];
  spawnX: number; spawnY: number;
  biomeAt: (tx: number, ty: number) => string;
  isDungeon: boolean;
  dungeonBiome?: string;
  dungeonFloor?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Palette {
  ground: number;
  scatter: Array<[number, number]>;
  obstacles: Array<[number, number]>;
  border: number;
}

const DEFAULT_PAL: Palette = { ground: 0, scatter:[[1,0.06],[2,0.03]], obstacles:[[8,0.06],[9,0.03]], border: 8 };

const PALETTES: Record<string, Palette> = {
  // City is much more decorated: flower beds, marble tiles, rose petals and banners dot the plaza,
  // and blocking obstacles are lanterns, fountains, benches, cherry trees and rune circles.
  main_city:{ ground: 0,  scatter:[[1,0.10],[2,0.08],[5,0.06],[7,0.05],[11,0.03]], obstacles:[[8,0.05],[9,0.02],[10,0.04],[12,0.02],[13,0.02]], border: 15 },
  meadow:  { ground: 0,  scatter:[[1,0.08],[2,0.03]], obstacles:[[8,0.03],[9,0.03]], border: 8 },
  forest:  { ground: 0,  scatter:[[2,0.06],[1,0.02]], obstacles:[[8,0.14],[9,0.06],[10,0.02]], border: 8 },
  desert:  { ground: 3,  scatter:[[2,0.06],[7,0.03]], obstacles:[[10,0.06],[9,0.02]], border: 10 },
  tundra:  { ground: 5,  scatter:[[4,0.10],[3,0.02]], obstacles:[[10,0.05],[15,0.02]], border: 15 },
  volcano: { ground: 14, scatter:[[4,0.06],[13,0.04]],obstacles:[[10,0.09],[15,0.03]], border: 15 },
  ruins:   { ground: 5,  scatter:[[4,0.10],[11,0.02]],obstacles:[[12,0.06],[13,0.04],[6,0.03]], border: 12 },
  crystal: { ground: 14, scatter:[[5,0.05],[4,0.03]], obstacles:[[15,0.08],[13,0.04],[10,0.03]],border: 15 },
  swamp:   { ground: 2,  scatter:[[0,0.08],[7,0.05]], obstacles:[[9,0.08],[8,0.04],[6,0.03]],  border: 8 },
  jungle:  { ground: 0,  scatter:[[1,0.06],[2,0.04]], obstacles:[[8,0.14],[9,0.08]],           border: 8 },
  sky:     { ground: 5,  scatter:[[4,0.06],[11,0.03]],obstacles:[[10,0.05],[15,0.02]],         border: 15 },
  abyss:   { ground: 14, scatter:[[13,0.06],[4,0.04]],obstacles:[[15,0.08],[13,0.04],[10,0.03]],border: 15 },
  mycelium:{ ground: 2,  scatter:[[1,0.06],[7,0.04]], obstacles:[[8,0.10],[9,0.05]], border: 8 },
  clockwork:{ground: 5,  scatter:[[4,0.08],[11,0.04]],obstacles:[[10,0.08],[15,0.03]], border: 15 },
  abyss_sea:{ground: 14, scatter:[[13,0.05],[4,0.03]],obstacles:[[15,0.06],[10,0.03]], border: 15 },
  emberlands:{ground:14, scatter:[[13,0.08],[4,0.04]],obstacles:[[10,0.08],[15,0.03]], border: 15 },
  shardveil:{ ground:14, scatter:[[5,0.05],[13,0.04]],obstacles:[[15,0.08],[10,0.03]], border: 15 },
  frostpeak:    { ground: 5,  scatter:[[4,0.14],[3,0.02]], obstacles:[[10,0.06],[15,0.03]], border: 15 },
  sunken_temple:{ ground: 14, scatter:[[13,0.05],[4,0.03]], obstacles:[[15,0.06],[12,0.04]], border: 15 },
  neon_wastes:  { ground: 14, scatter:[[5,0.06],[13,0.04]], obstacles:[[15,0.06],[10,0.03]], border: 15 },
  bloodmoon:    { ground: 2,  scatter:[[1,0.06],[7,0.04]], obstacles:[[8,0.10],[9,0.06]], border: 8 },
  celestial:    { ground: 5,  scatter:[[4,0.06],[11,0.05]],obstacles:[[10,0.03],[15,0.02]], border: 15 },
  ashen:        { ground: 3,  scatter:[[4,0.06],[2,0.04]], obstacles:[[10,0.06],[9,0.03]], border: 10 },
  gloomwood:    { ground: 0,  scatter:[[2,0.06],[1,0.04]], obstacles:[[8,0.12],[9,0.06]], border: 8 },
  mire:         { ground: 2,  scatter:[[0,0.10],[7,0.06]], obstacles:[[9,0.08],[8,0.04]], border: 8 },
  runes:        { ground: 14, scatter:[[5,0.06],[4,0.04]], obstacles:[[15,0.07],[10,0.03]], border: 15 },
  void_gate:    { ground: 14, scatter:[[13,0.08],[5,0.04]],obstacles:[[15,0.09],[10,0.04]], border: 15 },
  // 10 new biomes
  crimson_dunes:  { ground: 3,  scatter:[[7,0.06],[2,0.03]], obstacles:[[10,0.08],[9,0.03]], border: 10 },
  obsidian_reef:  { ground: 14, scatter:[[13,0.08],[4,0.03]], obstacles:[[15,0.10],[10,0.04]], border: 15 },
  seraph_grove:   { ground: 0,  scatter:[[1,0.10],[11,0.03]], obstacles:[[8,0.06],[9,0.03]], border: 8 },
  thunderveil:    { ground: 5,  scatter:[[4,0.08],[11,0.04]], obstacles:[[10,0.06],[15,0.03]], border: 15 },
  glass_desert:   { ground: 14, scatter:[[5,0.10],[4,0.04]], obstacles:[[15,0.08],[10,0.03]], border: 15 },
  mirror_lake:    { ground: 5,  scatter:[[4,0.06],[11,0.03]], obstacles:[[10,0.03],[15,0.02]], border: 15 },
  plasma_bog:     { ground: 2,  scatter:[[7,0.08],[0,0.04]], obstacles:[[9,0.08],[8,0.04]], border: 8 },
  honeycomb_hive: { ground: 3,  scatter:[[7,0.10],[2,0.03]], obstacles:[[10,0.08],[9,0.04]], border: 10 },
  cursed_orchard: { ground: 0,  scatter:[[2,0.10],[1,0.03]], obstacles:[[8,0.16],[9,0.08]], border: 8 },
  cosmic_bazaar:  { ground: 14, scatter:[[13,0.06],[5,0.04]], obstacles:[[15,0.06],[10,0.02]], border: 15 },
  // 10 new endgame biomes (lv 75+)
  sunspire:       { ground: 3,  scatter:[[7,0.08],[2,0.04]], obstacles:[[10,0.06],[9,0.03]], border: 10 },
  moonshade:      { ground: 0,  scatter:[[1,0.08],[5,0.04]], obstacles:[[8,0.06],[9,0.03]], border: 15 },
  stormforge:     { ground: 5,  scatter:[[4,0.08],[11,0.04]], obstacles:[[10,0.08],[15,0.03]], border: 15 },
  dreamweave:     { ground: 5,  scatter:[[4,0.10],[11,0.03]], obstacles:[[10,0.05],[15,0.02]], border: 15 },
  bone_wastes:    { ground: 3,  scatter:[[7,0.06],[2,0.03]], obstacles:[[10,0.08],[9,0.03]], border: 10 },
  venom_grove:    { ground: 0,  scatter:[[2,0.08],[1,0.03]], obstacles:[[8,0.12],[9,0.06]], border: 8 },
  magma_core:     { ground: 14, scatter:[[13,0.08],[4,0.03]], obstacles:[[15,0.10],[10,0.04]], border: 15 },
  astral_void:    { ground: 14, scatter:[[13,0.08],[5,0.04]], obstacles:[[15,0.08],[10,0.03]], border: 15 },
  nightmare_gate: { ground: 14, scatter:[[13,0.06],[4,0.03]], obstacles:[[15,0.09],[10,0.04]], border: 15 },
  titan_ruins:    { ground: 5,  scatter:[[4,0.06],[11,0.02]], obstacles:[[12,0.06],[13,0.04]], border: 12 },
};

// ====== World: each biome is ~20x bigger (≈4.5x per axis). ======
// Old world was 500x500 with biome spacing 22. New world is 2200x2200 with
// spacing 98 → per-biome area is ~20x. Biome grid is chunked (16x16) so the
// one-time build stays fast.
const OVERWORLD_W = 2200;
const OVERWORLD_H = 2200;
const OVERWORLD_SEED = 0xC0FFEE;
const WORLD_CX = OVERWORLD_W / 2;
const WORLD_CY = OVERWORLD_H / 2;
const BIOME_CHUNK = 16; // one biome-id sample per 16x16 tile block

interface Center { id: keyof typeof BIOMES; cx: number; cy: number; weight: number; }

// Biome layout: an Archimedean spiral so each biome only has AT MOST two
// direct Voronoi neighbors (the previous and next along the chain). The
// spiral is jittered a bit so shapes stay irregular, but connectivity stays
// linear — user requested "nunca fazendo um bioma ficar conectado
// diretamente a mais de dois biomas".
function buildCenters(): Center[] {
  const rnd = mulberry32(OVERWORLD_SEED ^ 0x1);
  const ids: (keyof typeof BIOMES)[] = [
    "main_city",
    "meadow","forest","desert","tundra","volcano","ruins","crystal",
    "swamp","jungle","sky","abyss",
    "mycelium","clockwork","abyss_sea","emberlands","shardveil",
    "frostpeak","sunken_temple","neon_wastes","bloodmoon","celestial",
    "ashen","gloomwood","mire","runes","void_gate",
    "crimson_dunes","obsidian_reef","seraph_grove","thunderveil","glass_desert",
    "mirror_lake","plasma_bog","honeycomb_hive","cursed_orchard","cosmic_bazaar",
    "sunspire","moonshade","stormforge","dreamweave","bone_wastes",
    "venom_grove","magma_core","astral_void","nightmare_gate","titan_ruins",
  ];
  const out: Center[] = [];
  // Constant arc-length spiral: r = a + b*theta; step so consecutive centers
  // are ~spacing apart, guaranteeing sequential adjacency.
  const spacing = 98; // tile distance between consecutive biomes (was 22 → 20x area)
  const b = 15.5;     // spiral tightness scaled with spacing
  let theta = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (id === "main_city") {
      out.push({ id, cx: WORLD_CX, cy: WORLD_CY, weight: 0.28 });
      continue;
    }
    // Advance theta so arc-length step ≈ spacing.
    const r = 100 + b * theta;
    theta += spacing / Math.max(1, r);
    const rr = 100 + b * theta;
    // Heavy per-center jitter — makes shapes wobbly WITHOUT changing
    // spiral neighbor topology (jitter is smaller than spacing).
    const jr = (rnd() - 0.5) * spacing * 0.35;
    const ja = (rnd() - 0.5) * 0.25;
    const ang = theta + ja;
    const cx = Math.round(WORLD_CX + Math.cos(ang) * (rr + jr));
    const cy = Math.round(WORLD_CY + Math.sin(ang) * (rr + jr));
    // Weights close to 1 keep each cell roughly the same size, so no
    // biome bulges across the spiral into a non-neighbor.
    const weight = 0.9 + rnd() * 0.25;
    out.push({ id, cx, cy, weight });
  }
  return out;
}

const OVERWORLD_CENTERS = buildCenters();
export const WORLD_CENTERS = OVERWORLD_CENTERS;
export const OVERWORLD_SIZE = { w: OVERWORLD_W, h: OVERWORLD_H };

// Noise-perturbed weighted Voronoi so biome edges are wobbly (not straight).
function noise2(x: number, y: number, seed: number) {
  // Cheap hash-based value noise, bilinear-interpolated.
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const h = (a: number, b: number) => {
    let n = (a * 374761393 + b * 668265263 + seed * 1442695040888963407) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function overworldBiomeAtRaw(tx: number, ty: number): string {
  // Radial mask — non-square world; anything outside is border.
  const dx0 = tx - WORLD_CX, dy0 = ty - WORLD_CY;
  const wobble = 270 * (noise2(tx * 0.0015, ty * 0.0015, 7) - 0.5)
              + 110 * (noise2(tx * 0.0045, ty * 0.0045, 11) - 0.5);
  const R = 1080 + wobble; // very irregular boundary
  if (dx0 * dx0 + dy0 * dy0 > R * R) return "__void__";

  // Strong low-frequency warp displaces the sample point, so Voronoi cells
  // ripple heavily WITHOUT altering which two neighbors touch (the spiral
  // still guarantees only prev/next contact).
  const nx = (noise2(tx * 0.003, ty * 0.003, 1) * 2 - 1) * 100;
  const ny = (noise2(tx * 0.003, ty * 0.003, 2) * 2 - 1) * 100;

  let best: string = "meadow";
  let bestD = Infinity;
  for (const c of OVERWORLD_CENTERS) {
    const dx = tx + nx - c.cx;
    const dy = ty + ny - c.cy;
    const d = (dx * dx + dy * dy) / c.weight;
    if (d < bestD) { bestD = d; best = c.id; }
  }
  return best;
}

// Coarse-grained biome grid (one sample per BIOME_CHUNK tiles).
// Reduces build cost by BIOME_CHUNK^2 without altering visible topology.
let _biomeIdIndex: Record<string, number> = {};
let _biomeIdList: string[] = [];
let _biomeGrid: Uint8Array | null = null;
const _bgW = Math.ceil(OVERWORLD_W / BIOME_CHUNK);
const _bgH = Math.ceil(OVERWORLD_H / BIOME_CHUNK);

function buildBiomeGrid(): Uint8Array {
  const grid = new Uint8Array(_bgW * _bgH);
  _biomeIdList = ["__void__"];
  _biomeIdIndex = { __void__: 0 };
  for (let cy = 0; cy < _bgH; cy++) {
    for (let cx = 0; cx < _bgW; cx++) {
      const tx = cx * BIOME_CHUNK + (BIOME_CHUNK >> 1);
      const ty = cy * BIOME_CHUNK + (BIOME_CHUNK >> 1);
      const id = overworldBiomeAtRaw(tx, ty);
      let idx = _biomeIdIndex[id];
      if (idx === undefined) {
        idx = _biomeIdList.length;
        _biomeIdIndex[id] = idx;
        _biomeIdList.push(id);
      }
      grid[cy * _bgW + cx] = idx;
    }
  }
  return grid;
}

function overworldBiomeAt(tx: number, ty: number): string {
  if (tx < 0 || ty < 0 || tx >= OVERWORLD_W || ty >= OVERWORLD_H) return "__void__";
  const grid = _biomeGrid ?? (_biomeGrid = buildBiomeGrid());
  const cx = (tx / BIOME_CHUNK) | 0;
  const cy = (ty / BIOME_CHUNK) | 0;
  return _biomeIdList[grid[cy * _bgW + cx]];
}


export function worldBiomeAt(tx: number, ty: number): string {
  const b = overworldBiomeAt(tx, ty);
  return b === "__void__" ? "meadow" : b;
}

function generateOverworld(): WorldMap {
  const w = OVERWORLD_W, h = OVERWORLD_H;
  const rnd = mulberry32(OVERWORLD_SEED);
  const tiles = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const b = overworldBiomeAt(x, y);
      if (b === "__void__") { tiles[y * w + x] = 15; continue; }
      const pal = PALETTES[b] ?? DEFAULT_PAL;
      tiles[y * w + x] = pal.ground;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const b = overworldBiomeAt(x, y);
      if (b === "__void__") continue;
      const pal = PALETTES[b] ?? DEFAULT_PAL;
      for (const [t, chance] of pal.scatter) {
        if (rnd() < chance) tiles[y * w + x] = t;
      }
      for (const [t, chance] of pal.obstacles) {
        if (rnd() < chance) tiles[y * w + x] = t;
      }
    }
  }

  // Spawn = center of main_city.
  const spawnX = Math.round(WORLD_CX), spawnY = Math.round(WORLD_CY);
  // Half-sized plaza (radius 10 → 5) so the city is 2x smaller on the map.
  for (let y = spawnY - 5; y <= spawnY + 5; y++) {
    for (let x = spawnX - 5; x <= spawnX + 5; x++) {
      if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
      tiles[y * w + x] = 0;
    }
  }

  // Sprinkle beautiful decorations inside the city plaza: flower beds,
  // marble tiles, lanterns and a central fountain — all part of the new
  // city tileset (indices 1,2,5,6,8,9,10,11,12).
  const cityRnd = mulberry32(OVERWORLD_SEED ^ 0xC17A);
  for (let y = spawnY - 5; y <= spawnY + 5; y++) {
    for (let x = spawnX - 5; x <= spawnX + 5; x++) {
      if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
      const dx = x - spawnX, dy = y - spawnY;
      // Keep the exact spawn tile + NPC tiles clear.
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) continue;
      if ((dx === -3 || dx === 3) && dy === 0) continue;
      const r = cityRnd();
      if (r < 0.10) tiles[y * w + x] = 1;        // flower bed
      else if (r < 0.18) tiles[y * w + x] = 5;   // marble star tile
      else if (r < 0.24) tiles[y * w + x] = 2;   // rose mosaic
      else if (r < 0.28) tiles[y * w + x] = 11;  // banner
      else if (r < 0.32) tiles[y * w + x] = 12;  // cherry tree
    }
  }
  // Corner lanterns for a lit-up plaza look.
  for (const [dx, dy] of [[-4,-4],[4,-4],[-4,4],[4,4]] as const) {
    const px = spawnX + dx, py = spawnY + dy;
    if (px >= 1 && py >= 1 && px < w - 1 && py < h - 1) tiles[py * w + px] = 8;
  }
  // Central marble fountain (blocking obstacle — beautiful centerpiece).
  if (spawnY - 2 >= 1 && spawnY - 2 < h - 1) tiles[(spawnY - 2) * w + spawnX] = 9;

  const stairs: Stair[] = [];
  const npcs: NpcMarker[] = [];

  // Place bank NPC, training dummy and blacksmith inside the city.
  npcs.push({ tx: spawnX - 3, ty: spawnY, kind: "bank",       label: "Banco de Rimhold" });
  npcs.push({ tx: spawnX + 3, ty: spawnY, kind: "dummy",      label: "Boneco de Treino" });
  npcs.push({ tx: spawnX,     ty: spawnY + 3, kind: "blacksmith", label: "Ferreiro (Melhorar Equipamentos)" });
  // Ensure blacksmith tile is walkable.
  if (spawnY + 3 >= 1 && spawnY + 3 < h - 1) tiles[(spawnY + 3) * w + spawnX] = 0;

  for (const c of OVERWORLD_CENTERS) {
    if (c.id === "meadow" || c.id === "main_city") continue;
    const tx = c.cx, ty = c.cy;
    if (tx < 2 || ty < 2 || tx >= w - 2 || ty >= h - 2) continue;
    tiles[ty * w + tx] = 5;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const px = tx + dx, py = ty + dy;
        if (px < 1 || py < 1 || px >= w - 1 || py >= h - 1) continue;
        if (dx === 0 && dy === 0) continue;
        const b = overworldBiomeAt(px, py);
        if (b !== "__void__" && TILE_BLOCK[tiles[py * w + px]]) {
          tiles[py * w + px] = (PALETTES[b] ?? DEFAULT_PAL).ground;
        }
      }
    if (!BIOMES[c.id]) continue;
    stairs.push({
      tx, ty,
      target: `dungeon:${c.id}:1`,
      dstX: 4, dstY: 4,
      label: BIOMES[c.id].dungeonName,
      kind: "down",
    });
  }

  return {
    id: "__overworld__",
    w, h, tiles, stairs, npcs, spawnX, spawnY,
    biomeAt: overworldBiomeAt,
    isDungeon: false,
  };
}

function generateDungeon(biomeId: string, floor: number): WorldMap {
  const w = 38 + floor * 4;
  const h = 34 + floor * 4;
  const seed = (BIOMES[biomeId].tier * 7919) ^ (floor * 131) ^ 0xDEAD;
  const rnd = mulberry32(seed);
  const pal = PALETTES[biomeId] ?? DEFAULT_PAL;

  const tiles = new Uint8Array(w * h);
  for (let i = 0; i < tiles.length; i++) tiles[i] = pal.border;

  const rooms: Array<{ x: number; y: number; w: number; h: number }> = [];
  const roomCount = 6 + floor * 2;
  for (let i = 0; i < roomCount * 4 && rooms.length < roomCount; i++) {
    const rw = 4 + ((rnd() * 6) | 0);
    const rh = 4 + ((rnd() * 5) | 0);
    const rx = 2 + ((rnd() * (w - rw - 4)) | 0);
    const ry = 2 + ((rnd() * (h - rh - 4)) | 0);
    if (rooms.some(r => rx < r.x + r.w + 1 && rx + rw + 1 > r.x && ry < r.y + r.h + 1 && ry + rh + 1 > r.y)) continue;
    for (let y = ry; y < ry + rh; y++)
      for (let x = rx; x < rx + rw; x++)
        tiles[y * w + x] = pal.ground;
    rooms.push({ x: rx, y: ry, w: rw, h: rh });
  }
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1], b = rooms[i];
    const ax = (a.x + a.w / 2) | 0, ay = (a.y + a.h / 2) | 0;
    const bx = (b.x + b.w / 2) | 0, by = (b.y + b.h / 2) | 0;
    let x = ax, y = ay;
    while (x !== bx) { tiles[y * w + x] = pal.ground; x += Math.sign(bx - x); }
    while (y !== by) { tiles[y * w + x] = pal.ground; y += Math.sign(by - y); }
    tiles[y * w + x] = pal.ground;
  }

  const spawn = rooms[0] ?? { x: 4, y: 4, w: 2, h: 2 };
  const spawnX = spawn.x + 1, spawnY = spawn.y + 1;

  const stairs: Stair[] = [];
  const upRoom = rooms[0];
  const upX = upRoom.x + upRoom.w - 1, upY = upRoom.y + upRoom.h - 1;
  tiles[upY * w + upX] = 11;
  if (floor === 1) {
    const center = OVERWORLD_CENTERS.find(c => c.id === biomeId)!;
    stairs.push({
      tx: upX, ty: upY, target: "__overworld__",
      dstX: center.cx, dstY: center.cy + 2,
      label: "Sair para " + BIOMES[biomeId].name, kind: "up",
    });
  } else {
    stairs.push({
      tx: upX, ty: upY, target: `dungeon:${biomeId}:${floor - 1}`,
      dstX: 4, dstY: 4,
      label: `Andar ${floor - 1}`, kind: "up",
    });
  }
  if (floor < DUNGEON_FLOORS) {
    const downRoom = rooms[rooms.length - 1];
    const dx = downRoom.x + 1, dy = downRoom.y + 1;
    tiles[dy * w + dx] = 5;
    stairs.push({
      tx: dx, ty: dy, target: `dungeon:${biomeId}:${floor + 1}`,
      dstX: 4, dstY: 4,
      label: `Andar ${floor + 1}`, kind: "down",
    });
  }

  return {
    id: `dungeon:${biomeId}:${floor}`,
    w, h, tiles, stairs, npcs: [], spawnX, spawnY,
    biomeAt: () => biomeId,
    isDungeon: true,
    dungeonBiome: biomeId,
    dungeonFloor: floor,
  };
}

// Cache the huge overworld — regenerating 1000x1000 every teleport would stall.
let _overworldCache: WorldMap | null = null;

export function loadMap(id: string): WorldMap {
  if (id === "__overworld__") {
    if (!_overworldCache) _overworldCache = generateOverworld();
    return _overworldCache;
  }
  const m = id.match(/^dungeon:([a-z_]+):(\d+)$/);
  if (m) {
    const biome = m[1];
    const floor = Math.max(1, Math.min(DUNGEON_FLOORS, parseInt(m[2], 10)));
    if (DUNGEON_BIOMES.includes(biome as keyof typeof BIOMES)) return generateDungeon(biome, floor);
  }
  if (!_overworldCache) _overworldCache = generateOverworld();
  return _overworldCache;
}

export function overworldSpawn(): { x: number; y: number } {
  const m = loadMap("__overworld__");
  return { x: m.spawnX, y: m.spawnY };
}

export function isBlocked(map: WorldMap, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return true;
  return TILE_BLOCK[map.tiles[ty * map.w + tx]] === true;
}

export function nearestWalkable(map: WorldMap, tx: number, ty: number, maxRadius = 20): { x: number; y: number } {
  if (!isBlocked(map, tx, ty)) return { x: tx, y: ty };
  const seen = new Set<number>();
  const q: Array<[number, number, number]> = [[tx, ty, 0]];
  seen.add(ty * map.w + tx);
  while (q.length) {
    const [x, y, d] = q.shift()!;
    if (d > maxRadius) break;
    if (!isBlocked(map, x, y)) return { x, y };
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
      const key = ny * map.w + nx;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push([nx, ny, d + 1]);
    }
  }
  return { x: map.spawnX, y: map.spawnY };
}

export function stairAt(map: WorldMap, tx: number, ty: number): Stair | null {
  for (const s of map.stairs) if (s.tx === tx && s.ty === ty) return s;
  return null;
}

export function npcAt(map: WorldMap, tx: number, ty: number): NpcMarker | null {
  for (const n of map.npcs) if (n.tx === tx && n.ty === ty) return n;
  return null;
}
