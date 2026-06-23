// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
//  EXTRA BIOMES
//  4 novos biomas adjacentes (2 andares cada) + 2 biomas SECRETOS (6 andares)
//  Cada bioma tem layout único, tamanho generoso e tema visual próprio.
// ─────────────────────────────────────────────────────────────────────────────
import type { GameMap, Tile, TileType, Monster, MonsterType, EliteTier } from './types'
import { createMonster, rollEliteTier } from './data'

const NON_WALKABLE: TileType[] = [
  'water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock',
  'house_wall', 'house_roof', 'fountain', 'lamp_post', 'market_stall', 'fence',
  'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent',
  'crystal_wall', 'ruin_wall', 'sky_void', 'cobweb',
  'abyss_wall', 'void',
  'pine_tree', 'snowy_peak', 'mountain_rock', 'ice_crystal_node',
  'ruin_pillar', 'vine_wall', 'sarcophagus', 'rune_stone', 'ancient_brazier',
]

function tile(type: TileType): Tile {
  return { type, walkable: !NON_WALKABLE.includes(type), transparent: true }
}

function blank(W: number, H: number, base: TileType): Tile[][] {
  const t: Tile[][] = []
  for (let y = 0; y < H; y++) {
    t[y] = []
    for (let x = 0; x < W; x++) t[y][x] = tile(base)
  }
  return t
}
function border(tiles: Tile[][], W: number, H: number, type: TileType) {
  for (let x = 0; x < W; x++) { tiles[0][x] = tile(type); tiles[H-1][x] = tile(type) }
  for (let y = 0; y < H; y++) { tiles[y][0] = tile(type); tiles[y][W-1] = tile(type) }
}
function rngOf(seed: number) {
  let r = seed >>> 0 || 1
  return () => { r = (r * 1664525 + 1013904223) >>> 0; return (r >>> 0) / 0xffffffff }
}
function ring(tiles: Tile[][], cx: number, cy: number, radius: number, type: TileType) {
  const H = tiles.length, W = tiles[0].length
  for (let a = 0; a < 360; a += 3) {
    const rad = (a * Math.PI) / 180
    const x = Math.round(cx + Math.cos(rad) * radius)
    const y = Math.round(cy + Math.sin(rad) * radius)
    if (x > 0 && y > 0 && x < W-1 && y < H-1) tiles[y][x] = tile(type)
  }
}
function disc(tiles: Tile[][], cx: number, cy: number, radius: number, type: TileType, prob = 1) {
  const H = tiles.length, W = tiles[0].length
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx*dx + dy*dy <= radius*radius) {
        const x = cx + dx, y = cy + dy
        if (x > 0 && y > 0 && x < W-1 && y < H-1 && Math.random() < prob) {
          tiles[y][x] = tile(type)
        }
      }
    }
  }
}
function path(tiles: Tile[][], x1: number, y1: number, x2: number, y2: number, type: TileType, w = 1) {
  const dx = x2 - x1, dy = y2 - y1
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  const H = tiles.length, W = tiles[0].length
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x1 + (dx * i) / steps)
    const y = Math.round(y1 + (dy * i) / steps)
    for (let ow = -w; ow <= w; ow++) for (let oh = -w; oh <= w; oh++) {
      const nx = x + ow, ny = y + oh
      if (nx > 0 && ny > 0 && nx < W-1 && ny < H-1) tiles[ny][nx] = tile(type)
    }
  }
}
function scatter(tiles: Tile[][], count: number, type: TileType, rand: () => number) {
  const H = tiles.length, W = tiles[0].length
  for (let i = 0; i < count; i++) {
    const x = 3 + Math.floor(rand() * (W - 6))
    const y = 3 + Math.floor(rand() * (H - 6))
    tiles[y][x] = tile(type)
  }
}
function placePortal(tiles: Tile[][], x: number, y: number, kind: TileType, padType: TileType = 'cobblestone') {
  const H = tiles.length, W = tiles[0].length
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const nx = x + dx, ny = y + dy
    if (nx > 0 && ny > 0 && nx < W-1 && ny < H-1) tiles[ny][nx] = tile(padType)
  }
  tiles[y][x] = tile(kind)
}
function spawnMonsters(
  tiles: Tile[][], rand: () => number, count: number, baseLvl: number, types: MonsterType[],
  eliteChance = 0.04, bossChance = 0,
): Monster[] {
  const out: Monster[] = []
  const H = tiles.length, W = tiles[0].length
  for (let i = 0; i < count; i++) {
    const x = 4 + Math.floor(rand() * (W - 8))
    const y = 4 + Math.floor(rand() * (H - 8))
    if (!tiles[y][x].walkable) continue
    const t = types[Math.floor(rand() * types.length)]
    const lvl = baseLvl + Math.floor(rand() * 5)
    const tier = rand() < eliteChance ? 'elite' : 'normal'
    out.push(createMonster(t, lvl, x*32, y*32, tier as EliteTier))
  }
  if (bossChance > 0 && Math.random() < bossChance) {
    out.push(createMonster(types[0], baseLvl + 10, Math.floor(W/2)*32, Math.floor(H/2)*32, 'boss'))
  }
  return out
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. BOSQUE DE CRISTAL (oeste da floresta) — 2 andares
//    Tema: floresta bioluminescente com cristais cravados no chão.
// ═══════════════════════════════════════════════════════════════════════════════
function genCrystGrove(floor: 1 | 2): GameMap {
  const W = 260, H = 260
  const rand = rngOf(1700 + floor * 91)
  const base: TileType = floor === 1 ? 'grass' : 'crystal_floor'
  const tiles = blank(W, H, base)

  // Noise-ish bioluminescent patches
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = (Math.sin(x * 0.12) + Math.cos(y * 0.11) + Math.sin((x+y) * 0.07) + 3) / 6
    if (floor === 1) {
      if (v < 0.18) tiles[y][x] = tile('dark_water')
      else if (v < 0.27) tiles[y][x] = tile('mossy_stone')
      else if (v > 0.78) tiles[y][x] = tile('tree')
      else if ((x*3+y) % 9 === 0) tiles[y][x] = tile('mushroom')
      else if ((x+y*3) % 14 === 0) tiles[y][x] = tile('flower')
    } else {
      if (v < 0.20) tiles[y][x] = tile('dark_crystal')
      else if (v > 0.82) tiles[y][x] = tile('crystal_wall')
      else if ((x*5+y) % 11 === 0) tiles[y][x] = tile('crystal')
      else if ((x+y) % 17 === 0) tiles[y][x] = tile('gem_node')
    }
  }
  border(tiles, W, H, floor === 1 ? 'tree' : 'crystal_wall')

  // Concentric ring of crystals (signature)
  const cx = W/2, cy = H/2
  for (let r = 30; r <= 90; r += 18) ring(tiles, cx, cy, r, floor === 1 ? 'crystal' : 'gem_node')
  // Glowing pools / shards scattered around
  for (let i = 0; i < 8; i++) {
    const px = 30 + Math.floor(rand() * (W-60)), py = 30 + Math.floor(rand() * (H-60))
    disc(tiles, px, py, 4, floor === 1 ? 'dark_water' : 'crystal', 0.7)
    tiles[py][px] = tile('gem_node')
  }

  // Paths
  path(tiles, 8, 8, Math.floor(cx), Math.floor(cy), floor === 1 ? 'dirt' : 'crystal_floor', 1)
  path(tiles, Math.floor(cx), Math.floor(cy), W-9, H-9, floor === 1 ? 'dirt' : 'crystal_floor', 1)

  // Spawn back portal top-left, forward portal bottom-right (floor 1)
  placePortal(tiles, 8, 8, 'portal', 'mossy_stone')
  if (floor === 1) placePortal(tiles, W-9, H-9, 'crystal_portal', 'crystal_floor')

  const pool: MonsterType[] = floor === 1 ? ['wolf','spider','treant'] : ['ghost','mage_enemy','spider','treant']
  const monsters = spawnMonsters(tiles, rand, 70 + floor*25, floor === 1 ? 5 : 14, pool, 0.05)
  if (floor === 2) monsters.push(createMonster('dragon', 30, Math.floor(cx)*32, Math.floor(cy)*32, 'boss'))

  return {
    id: `crystgrove${floor}`,
    name: `Bosque de Cristal — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 10*32, y: 10*32 }],
    ambience: 'forest', musicTheme: 'forest',
    minLevel: floor === 1 ? 4 : 12,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SAVANA DOURADA — 2 andares
//    Tema: pradaria âmbar com baobás. Andar 2 fica escorchado/vulcânico.
// ═══════════════════════════════════════════════════════════════════════════════
function genSavanna(floor: 1 | 2): GameMap {
  const W = 280, H = 280
  const rand = rngOf(2300 + floor * 113)
  const base: TileType = floor === 1 ? 'tall_grass' : 'ash'
  const tiles = blank(W, H, base)

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = (Math.sin(x*0.05) + Math.cos(y*0.06) + 2)/4
    if (floor === 1) {
      if (v < 0.22) tiles[y][x] = tile('sand')
      else if (v > 0.78) tiles[y][x] = tile('tree')
      else if ((x+y*4) % 23 === 0) tiles[y][x] = tile('rock')
      else if ((x*2+y) % 9 === 0) tiles[y][x] = tile('grass')
    } else {
      if (v < 0.22) tiles[y][x] = tile('lava')
      else if (v > 0.78) tiles[y][x] = tile('obsidian')
      else if ((x*3+y) % 17 === 0) tiles[y][x] = tile('volcanic_rock')
      else if ((x+y*2) % 11 === 0) tiles[y][x] = tile('magma_crust')
    }
  }
  border(tiles, W, H, floor === 1 ? 'rock' : 'obsidian')

  // Dry rivers (winding)
  const riverY = Math.floor(H * 0.35)
  for (let x = 5; x < W - 5; x++) {
    const wy = riverY + Math.round(Math.sin(x * 0.04) * 18)
    for (let w = -2; w <= 2; w++) {
      if (tiles[wy+w]) tiles[wy+w][x] = tile(floor === 1 ? 'water' : 'lava')
    }
    if (x % 14 === 0 && tiles[wy]) tiles[wy][x] = tile('bridge')
  }

  // Baobab clusters
  for (let i = 0; i < 18; i++) {
    const x = 20 + Math.floor(rand() * (W-40)), y = 20 + Math.floor(rand() * (H-40))
    disc(tiles, x, y, 3, floor === 1 ? 'tree' : 'volcanic_rock', 0.6)
  }

  path(tiles, 6, Math.floor(H/2), W-7, Math.floor(H/2), floor === 1 ? 'dirt' : 'magma_crust', 1)

  placePortal(tiles, 8, 8, 'portal', floor === 1 ? 'dirt' : 'magma_crust')
  if (floor === 1) placePortal(tiles, W-9, H-9, 'haunted_portal', 'sand')

  const pool: MonsterType[] = floor === 1 ? ['wolf','spider','orc','goblin'] : ['demon','troll','orc','witch']
  const monsters = spawnMonsters(tiles, rand, 90 + floor*30, floor === 1 ? 7 : 18, pool, 0.05)
  if (floor === 2) monsters.push(createMonster('dragon', 38, Math.floor(W/2)*32, Math.floor(H/2)*32, 'boss'))

  return {
    id: `savanna${floor}`,
    name: `Savana Dourada — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 10*32, y: 10*32 }],
    ambience: floor === 1 ? 'desert' : 'volcano', musicTheme: floor === 1 ? 'desert' : 'volcano',
    minLevel: floor === 1 ? 6 : 16,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ARQUIPÉLAGO MÍSTICO — 2 andares
//    Tema: ilhas conectadas por pontes; andar 2 são ilhas FLUTUANTES no céu.
// ═══════════════════════════════════════════════════════════════════════════════
function genArchipel(floor: 1 | 2): GameMap {
  const W = 280, H = 280
  const rand = rngOf(3100 + floor * 71)
  const ocean: TileType = floor === 1 ? 'deepwater' : 'sky_void'
  const tiles = blank(W, H, ocean)

  // Generate islands of varying sizes
  const islands: { x: number; y: number; r: number }[] = []
  const ISLAND_COUNT = 18 + floor * 4
  for (let i = 0; i < ISLAND_COUNT; i++) {
    let x = 0, y = 0, r = 8 + Math.floor(rand() * 18)
    for (let a = 0; a < 50; a++) {
      x = r + Math.floor(rand() * (W - r*2))
      y = r + Math.floor(rand() * (H - r*2))
      let ok = true
      for (const isl of islands) {
        const d = Math.hypot(x - isl.x, y - isl.y)
        if (d < isl.r + r + 4) { ok = false; break }
      }
      if (ok) break
    }
    islands.push({ x, y, r })
    const surface: TileType = floor === 1 ? 'sand' : 'cloud_floor'
    const inner: TileType = floor === 1 ? 'grass' : 'sky_platform'
    disc(tiles, x, y, r, surface, 1)
    disc(tiles, x, y, Math.max(2, r - 3), inner, 0.9)
    if (floor === 1) {
      // Beach trees + flowers
      for (let k = 0; k < 6; k++) {
        const ang = rand() * Math.PI * 2
        const tx = Math.round(x + Math.cos(ang) * (r - 2))
        const ty = Math.round(y + Math.sin(ang) * (r - 2))
        if (tiles[ty]?.[tx]) tiles[ty][tx] = tile(rand() < 0.5 ? 'tree' : 'flower')
      }
    } else {
      for (let k = 0; k < 5; k++) {
        const ang = rand() * Math.PI * 2
        const tx = Math.round(x + Math.cos(ang) * (r - 1))
        const ty = Math.round(y + Math.sin(ang) * (r - 1))
        if (tiles[ty]?.[tx]) tiles[ty][tx] = tile('crystal')
      }
    }
  }

  // Connect with bridges
  for (let i = 1; i < islands.length; i++) {
    const a = islands[i-1], b = islands[i]
    path(tiles, a.x, a.y, b.x, b.y, floor === 1 ? 'bridge' : 'cloud_floor', 0)
  }

  border(tiles, W, H, floor === 1 ? 'rock' : 'sky_void')

  // Spawn on first island, portal on last
  const first = islands[0], last = islands[islands.length - 1]
  placePortal(tiles, first.x, first.y, 'portal', floor === 1 ? 'sand' : 'cloud_floor')
  if (floor === 1) placePortal(tiles, last.x, last.y, 'sky_portal', 'sand')

  const pool: MonsterType[] = floor === 1 ? ['spider','goblin','wolf','witch'] : ['mage_enemy','ghost','demon','dragon']
  const monsters: Monster[] = []
  const baseLvl = floor === 1 ? 10 : 22
  for (const isl of islands.slice(1)) {
    for (let k = 0; k < 3 + Math.floor(rand()*3); k++) {
      const ang = rand() * Math.PI * 2
      const rr = rand() * (isl.r - 2)
      const mx = Math.round(isl.x + Math.cos(ang) * rr)
      const my = Math.round(isl.y + Math.sin(ang) * rr)
      if (!tiles[my]?.[mx]?.walkable) continue
      const t = pool[Math.floor(rand() * pool.length)]
      const lvl = baseLvl + Math.floor(rand() * 5)
      monsters.push(createMonster(t, lvl, mx*32, my*32, rand() < 0.05 ? 'elite' : 'normal'))
    }
  }
  if (floor === 2) monsters.push(createMonster('dragon', 45, last.x*32, last.y*32, 'boss'))

  return {
    id: `archipel${floor}`,
    name: `Arquipélago Místico — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: first.x*32, y: first.y*32 }],
    ambience: floor === 1 ? 'forest' : 'sky', musicTheme: floor === 1 ? 'forest' : 'sky',
    minLevel: baseLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. VALE ESQUECIDO — 2 andares
//    Tema: canyon de pedra com névoa; andar 2 vira cripta antiga.
// ═══════════════════════════════════════════════════════════════════════════════
function genVale(floor: 1 | 2): GameMap {
  const W = 260, H = 260
  const rand = rngOf(4400 + floor * 83)
  const base: TileType = floor === 1 ? 'mossy_stone' : 'ancient_tile'
  const tiles = blank(W, H, base)

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - W/2, dy = y - H/2
    const r = Math.sqrt(dx*dx + dy*dy)
    const noise = Math.sin(x*0.1) + Math.cos(y*0.09)
    if (floor === 1) {
      // valley walls form a spiral of cliffs
      if (r > Math.min(W,H)/2 - 8 + noise*3) tiles[y][x] = tile('rock')
      else if ((x+y) % 19 === 0) tiles[y][x] = tile('tree')
      else if ((x*3+y*2) % 23 === 0) tiles[y][x] = tile('rune_stone')
      else if ((x+y*5) % 31 === 0) tiles[y][x] = tile('ancient_brazier')
      else if ((x*7+y) % 47 === 0) tiles[y][x] = tile('dark_water')
    } else {
      if (r > Math.min(W,H)/2 - 8 + noise*3) tiles[y][x] = tile('ruin_wall')
      else if ((x+y) % 21 === 0) tiles[y][x] = tile('ruin_pillar')
      else if ((x*5+y) % 27 === 0) tiles[y][x] = tile('sarcophagus')
      else if ((x+y*4) % 33 === 0) tiles[y][x] = tile('cobweb')
      else if ((x*3+y*5) % 41 === 0) tiles[y][x] = tile('rune_stone')
    }
  }
  border(tiles, W, H, floor === 1 ? 'rock' : 'ruin_wall')

  // Spiral path through the valley
  const cx = W/2, cy = H/2
  for (let a = 0; a < Math.PI * 6; a += 0.04) {
    const rr = 12 + (a / (Math.PI * 6)) * (Math.min(W,H)/2 - 18)
    const x = Math.round(cx + Math.cos(a) * rr)
    const y = Math.round(cy + Math.sin(a) * rr)
    if (tiles[y]?.[x]) tiles[y][x] = tile(floor === 1 ? 'dirt' : 'ruin_floor')
  }
  // Central altar
  disc(tiles, Math.floor(cx), Math.floor(cy), 5, floor === 1 ? 'stone' : 'ancient_tile', 1)
  tiles[Math.floor(cy)][Math.floor(cx)] = tile(floor === 1 ? 'fountain' : 'sarcophagus')

  placePortal(tiles, 8, 8, 'portal', floor === 1 ? 'dirt' : 'ruin_floor')
  if (floor === 1) placePortal(tiles, W-9, H-9, 'haunted_portal', 'dirt')

  const pool: MonsterType[] = floor === 1 ? ['skeleton','wolf','spider','goblin','treant'] : ['ghost','vampire','witch','mage_enemy','demon']
  const baseLvl = floor === 1 ? 8 : 20
  const monsters = spawnMonsters(tiles, rand, 70 + floor*30, baseLvl, pool, 0.06)
  if (floor === 2) monsters.push(createMonster('vampire', 36, Math.floor(cx)*32, Math.floor(cy)*32, 'boss'))

  return {
    id: `vale${floor}`,
    name: `Vale Esquecido — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 10*32, y: 10*32 }],
    ambience: floor === 1 ? 'forest' : 'dungeon', musicTheme: floor === 1 ? 'forest' : 'dungeon',
    minLevel: baseLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SECRETO: FENDA ESTELAR — 6 andares
//    Requer "Chave Estelar". Tema: vazio cósmico com cristais luminosos.
// ═══════════════════════════════════════════════════════════════════════════════
function genStellar(floor: number): GameMap {
  const W = 240 + floor * 20, H = 240 + floor * 20
  const rand = rngOf(7700 + floor * 191)
  const tiles = blank(W, H, 'void')

  // Cosmic platforms in fractal-like pattern
  const cx = W/2, cy = H/2
  // Concentric rings of platforms
  for (let layer = 0; layer < 6 + floor; layer++) {
    const r = 14 + layer * 14
    const platCount = 6 + layer * 2
    for (let i = 0; i < platCount; i++) {
      const ang = (i / platCount) * Math.PI * 2 + layer * 0.3
      const x = Math.round(cx + Math.cos(ang) * r)
      const y = Math.round(cy + Math.sin(ang) * r)
      disc(tiles, x, y, 3 + Math.floor(rand()*3), 'cloud_floor', 1)
      if ((i + layer) % 3 === 0) tiles[y]?.[x] && (tiles[y][x] = tile('crystal'))
      if ((i + layer) % 5 === 0) tiles[y]?.[x] && (tiles[y][x] = tile('soul_fire'))
    }
  }
  // Central nexus
  disc(tiles, Math.floor(cx), Math.floor(cy), 6 + floor, 'crystal_floor', 1)
  ring(tiles, cx, cy, 6 + floor, 'crystal_wall')
  // Stardust trails (bridges of light between rings)
  for (let i = 0; i < 12; i++) {
    const ang = rand() * Math.PI * 2
    const len = 50 + Math.floor(rand()*60)
    path(tiles, Math.floor(cx), Math.floor(cy),
      Math.round(cx + Math.cos(ang)*len), Math.round(cy + Math.sin(ang)*len),
      'sky_platform', 0)
  }
  // Scattered gem nodes & soul fires
  scatter(tiles, 35 + floor * 8, 'gem_node', rand)
  scatter(tiles, 20 + floor * 5, 'soul_fire', rand)
  scatter(tiles, 15, 'dark_crystal', rand)

  border(tiles, W, H, 'sky_void')

  // Spawn portal at one edge of central ring
  placePortal(tiles, Math.floor(cx) - 8, Math.floor(cy), 'portal', 'crystal_floor')
  if (floor < 6) {
    placePortal(tiles, Math.floor(cx) + 8, Math.floor(cy), 'sky_portal', 'crystal_floor')
  }

  const pool: MonsterType[] = floor <= 2
    ? ['ghost','witch','mage_enemy','spider']
    : floor <= 4
    ? ['ghost','vampire','demon','mage_enemy','knight_enemy']
    : ['demon','dragon','vampire','knight_enemy','mage_enemy']
  const baseLvl = 25 + floor * 8
  const monsters = spawnMonsters(tiles, rand, 80 + floor * 20, baseLvl, pool, 0.08 + floor*0.01)
  // Floor-specific boss
  if (floor === 3) monsters.push(createMonster('demon', baseLvl + 8, Math.floor(cx)*32, (Math.floor(cy)-10)*32, 'boss'))
  if (floor === 6) {
    monsters.push(createMonster('dragon', baseLvl + 15, Math.floor(cx)*32, Math.floor(cy)*32, 'boss'))
    monsters.push(createMonster('demon', baseLvl + 10, (Math.floor(cx)+12)*32, Math.floor(cy)*32, 'boss'))
  }

  return {
    id: `stellar${floor}`,
    name: `★ Fenda Estelar — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: (Math.floor(cx) - 8)*32, y: (Math.floor(cy) + 3)*32 }],
    ambience: 'sky', musicTheme: 'sky',
    minLevel: baseLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SECRETO: JARDIM ETERNO — 6 andares
//    Requer "Semente Primordial". Tema: jardim selvagem gigante e ancestral.
// ═══════════════════════════════════════════════════════════════════════════════
function genEden(floor: number): GameMap {
  const W = 260 + floor * 20, H = 260 + floor * 20
  const rand = rngOf(8800 + floor * 173)
  const tiles = blank(W, H, 'tall_grass')

  // Lush canopy noise
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = (Math.sin(x*0.06 + floor) + Math.cos(y*0.07 - floor) + Math.sin((x+y)*0.04) + 3)/6
    if (v < 0.20) tiles[y][x] = tile('dark_water')
    else if (v < 0.30) tiles[y][x] = tile('flower')
    else if (v > 0.80) tiles[y][x] = tile('ancient_bark')
    else if ((x+y) % 13 === 0) tiles[y][x] = tile('mushroom')
    else if ((x*3+y) % 17 === 0) tiles[y][x] = tile('garden')
    else if ((x+y*5) % 19 === 0) tiles[y][x] = tile('root')
  }
  // Massive ancient trees (tree of life)
  const trees = 4 + floor
  for (let i = 0; i < trees; i++) {
    const x = 30 + Math.floor(rand() * (W-60)), y = 30 + Math.floor(rand() * (H-60))
    disc(tiles, x, y, 6 + Math.floor(rand()*4), 'ancient_bark', 0.9)
    ring(tiles, x, y, 10, 'flower')
    disc(tiles, x, y, 3, 'canopy', 1)
  }
  // Pools of life
  for (let i = 0; i < 6 + floor; i++) {
    const x = 20 + Math.floor(rand() * (W-40)), y = 20 + Math.floor(rand() * (H-40))
    disc(tiles, x, y, 4, 'dark_water', 0.9)
    tiles[y][x] = tile('mushroom')
  }
  // Vine corridors
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(rand()*W), y1 = Math.floor(rand()*H)
    const x2 = Math.floor(rand()*W), y2 = Math.floor(rand()*H)
    path(tiles, x1, y1, x2, y2, 'garden', 1)
  }
  border(tiles, W, H, 'ancient_bark')

  // Sacred clearing in the middle
  const cx = W/2, cy = H/2
  disc(tiles, Math.floor(cx), Math.floor(cy), 8, 'garden', 1)
  ring(tiles, cx, cy, 8, 'mushroom')
  tiles[Math.floor(cy)][Math.floor(cx)] = tile('fountain')

  placePortal(tiles, 8, 8, 'portal', 'garden')
  if (floor < 6) placePortal(tiles, W-9, H-9, 'crystal_portal', 'garden')

  const pool: MonsterType[] = floor <= 2
    ? ['treant','spider','wolf','witch']
    : floor <= 4
    ? ['treant','witch','demon','spider','dragon']
    : ['dragon','demon','treant','vampire','witch']
  const baseLvl = 28 + floor * 8
  const monsters = spawnMonsters(tiles, rand, 90 + floor * 22, baseLvl, pool, 0.07 + floor*0.01)
  if (floor === 3) monsters.push(createMonster('treant', baseLvl + 8, Math.floor(cx)*32, (Math.floor(cy)-12)*32, 'boss'))
  if (floor === 6) {
    monsters.push(createMonster('treant', baseLvl + 18, Math.floor(cx)*32, Math.floor(cy)*32, 'boss'))
    monsters.push(createMonster('dragon', baseLvl + 12, (Math.floor(cx)+15)*32, Math.floor(cy)*32, 'boss'))
  }

  return {
    id: `eden${floor}`,
    name: `❀ Jardim Eterno — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: 10*32, y: 10*32 }],
    ambience: 'forest', musicTheme: 'forest',
    minLevel: baseLvl,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPATCHER
// ═══════════════════════════════════════════════════════════════════════════════
export function generateExtraMap(id: string): GameMap | null {
  if (id === 'crystgrove1') return genCrystGrove(1)
  if (id === 'crystgrove2') return genCrystGrove(2)
  if (id === 'savanna1')    return genSavanna(1)
  if (id === 'savanna2')    return genSavanna(2)
  if (id === 'archipel1')   return genArchipel(1)
  if (id === 'archipel2')   return genArchipel(2)
  if (id === 'vale1')       return genVale(1)
  if (id === 'vale2')       return genVale(2)
  for (let f = 1; f <= 6; f++) {
    if (id === `stellar${f}`) return genStellar(f)
    if (id === `eden${f}`)    return genEden(f)
  }
  return null
}

// Lista de novos biomas para UI
export const EXTRA_BIOMES = [
  // 4 normais (cada com 2 andares)
  { id: 'crystgrove1', name: 'Bosque de Cristal',  minLvl: 4,  icon: '🔮', description: 'Floresta bioluminescente a oeste' },
  { id: 'crystgrove2', name: 'B.Cristal · A2',     minLvl: 12, icon: '💎', description: 'Câmara cristalina profunda' },
  { id: 'savanna1',    name: 'Savana Dourada',     minLvl: 6,  icon: '🌾', description: 'Pradaria âmbar do sul' },
  { id: 'savanna2',    name: 'Savana · A2',        minLvl: 16, icon: '🔥', description: 'Savana escorchada' },
  { id: 'archipel1',   name: 'Arquipélago',        minLvl: 10, icon: '🏝', description: 'Ilhas conectadas por pontes' },
  { id: 'archipel2',   name: 'Arquipélago · A2',   minLvl: 22, icon: '☁',  description: 'Ilhas flutuantes celestes' },
  { id: 'vale1',       name: 'Vale Esquecido',     minLvl: 8,  icon: '🗿', description: 'Canyon de pedra antiga' },
  { id: 'vale2',       name: 'Vale · A2',          minLvl: 20, icon: '⚱',  description: 'Cripta ancestral profunda' },
  // 2 secretos (6 andares cada)
  { id: 'stellar1',    name: '★ Fenda Estelar 1',  minLvl: 33, icon: '✦', description: 'SECRETO · requer Chave Estelar' },
  { id: 'eden1',       name: '❀ Jardim Eterno 1',  minLvl: 36, icon: '🌺', description: 'SECRETO · requer Semente Primordial' },
] as const
