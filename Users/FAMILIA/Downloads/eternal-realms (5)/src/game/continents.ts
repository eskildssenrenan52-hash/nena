import { TILE, type PlayMap, type WorldTile, type Stair, type Biome } from "./engine";
import { BIOMES } from "./engine";
import { type GameState } from "./game";

// ==========================================
// 1. PROCEDURAL BIOME GENERATOR FOR CONTINENTS 2-7
// ==========================================

const MONSTER_PREFIXES = ["Guardião", "Vorme", "Golem", "Invasor", "Espectro", "Besta", "Elemental", "Sentinela", "Devorador", "Arconte", "Titã", "Sombra"];
const MONSTER_SUFFIXES = ["de Plasma", "de Éter", "de Antimatéria", "do Caos", "da Fenda", "do Vazio", "Cromático", "Astral", "de Obsidiana", "Luminoso", "Fúngico"];
const BIOME_NOUNS = ["Ermo", "Val", "Planalto", "Garganta", "Pântano", "Santuário", "Oásis", "Cume", "Bosque", "Geleira", "Deserto", "Ruínas", "Canyon", "Selva", "Montanha", "Fresta"];
const BIOME_PREFIXES = ["Gélido", "Vulcânico", "Vazio", "Abissal", "Celestial", "Místico", "Sobrenatural", "Radioativo", "Cristalino", "Cromático", "Vento", "Luz", "Caótico", "Esmeralda", "Ancestral"];
const BIOME_SUFFIXES = ["de Asterion", "dos Deuses", "do Esquecimento", "das Almas", "do Horizonte", "do Infinito", "da Ruína", "da Alvorada", "do Crepúsculo", "da Tempestade", "da Fenda", "dos Espíritos"];

// Dynamic cache of procedurally generated biomes to ensure perfect memory optimization
const biomeCache = new Map<number, Biome>();

export function getContinentBiome(biomeId: number): Biome {
  if (biomeId <= 115) {
    return BIOMES.find((b) => b.id === biomeId) || BIOMES[0];
  }
  if (biomeCache.has(biomeId)) {
    return biomeCache.get(biomeId)!;
  }

  // Deterministic seed generation based on biome ID
  const seed = biomeId * 104729;
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const cIdx = Math.floor((biomeId - 116) / 20) + 2; // Continent 2 to 7
  const bIdx = (biomeId - 116) % 20 + 1;

  // Generate unique flavorful name
  const noun = BIOME_NOUNS[Math.floor(rand(seed) * BIOME_NOUNS.length)];
  const prefix = BIOME_PREFIXES[Math.floor(rand(seed + 1) * BIOME_PREFIXES.length)];
  const suffix = BIOME_SUFFIXES[Math.floor(rand(seed + 2) * BIOME_SUFFIXES.length)];
  const name = `${noun} ${prefix} ${suffix} (C${cIdx})`;

  // Generate distinctive HSL colors
  const hue = Math.floor((biomeId * 137.5) % 360);
  const color = `hsl(${hue}, 75%, 45%)`;
  const accent = `hsl(${hue}, 85%, 25%)`;

  // Scale danger/levels appropriately for Continents 2-7
  // Continent 2: level 400+, Continent 3: level 600+, etc.
  const baseDanger = 400 + (cIdx - 2) * 200 + bIdx * 8;

  // Monsters
  const m1 = `${MONSTER_PREFIXES[Math.floor(rand(seed + 3) * MONSTER_PREFIXES.length)]} ${MONSTER_SUFFIXES[Math.floor(rand(seed + 4) * MONSTER_SUFFIXES.length)]}`;
  const m2 = `${MONSTER_PREFIXES[Math.floor(rand(seed + 5) * MONSTER_PREFIXES.length)]} ${MONSTER_SUFFIXES[Math.floor(rand(seed + 6) * MONSTER_SUFFIXES.length)]}`;
  const m3 = `${MONSTER_PREFIXES[Math.floor(rand(seed + 7) * MONSTER_PREFIXES.length)]} ${MONSTER_SUFFIXES[Math.floor(rand(seed + 8) * MONSTER_SUFFIXES.length)]}`;
  const boss = `Imperador ${MONSTER_PREFIXES[Math.floor(rand(seed + 9) * MONSTER_PREFIXES.length)]} de Éter`;

  const b: Biome = {
    id: biomeId,
    name,
    color,
    accent,
    danger: baseDanger,
    monsters: [m1, m2, m3],
    boss,
    caveTheme: {
      label: "Abismo",
      floor: `hsl(${hue}, 40%, 15%)`,
      wall: `hsl(${hue}, 50%, 8%)`,
      accent: `hsl(${hue}, 80%, 30%)`,
      monsters: [`Espectro ${m1}`, `Invasor ${m2}`, `Vorme ${m3}`],
      boss: `Aniquilador ${boss}`
    }
  };

  biomeCache.set(biomeId, b);
  return b;
}

// Helper to resolve any biome ID in the game
export function getBiomeById(biomeId: number, g?: GameState): Biome {
  return getContinentBiome(biomeId);
}

// ==========================================
// 2. CELESTIAL PORTAL CHAMBER (SALAS DOS PORTAIS)
// ==========================================

export class CelestialPortalRoom implements PlayMap {
  size = 25;
  seed = 777;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number };
  readonly isCave = true;
  readonly biomeId = -10; // Special biome ID for Celestial Room

  constructor() {
    this.size = 25;
    this.tiles = new Array(this.size * this.size);
    this.spawn = { x: 12 * TILE + TILE / 2, y: 16 * TILE + TILE / 2 };
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
    return t === 2 || t === 14 || t === 11 || t === 15;
  }

  private generate() {
    // Fill with gorgeous dark purple cosmic paved tiles (kind 13)
    for (let i = 0; i < this.size * this.size; i++) {
      this.tiles[i] = { kind: 13, biome: 0 };
    }

    // Outer thick celestial walls (kind 14)
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const distToCenter = Math.hypot(x - 12, y - 12);
        if (x < 2 || y < 2 || x >= this.size - 2 || y >= this.size - 2 || distToCenter > 11) {
          this.tiles[this.idx(x, y)] = { kind: 14, biome: 0 };
        }
      }
    }

    // Colonnade pillars (kind 11) and Torches (kind 8) in circular arrangement
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      const px = Math.round(12 + Math.cos(angle) * 8);
      const py = Math.round(12 + Math.sin(angle) * 8);
      if (this.inBounds(px, py) && this.get(px, py).kind === 13) {
        this.tiles[this.idx(px, py)].kind = 11;
        // place torch nearby
        const tx = Math.round(12 + Math.cos(angle) * 7);
        const ty = Math.round(12 + Math.sin(angle) * 7);
        if (this.inBounds(tx, ty) && this.get(tx, ty).kind === 13) {
          this.tiles[this.idx(tx, ty)].kind = 8;
        }
      }
    }

    // Sacred center fountain (kind 15)
    this.tiles[this.idx(12, 12)] = { kind: 15, biome: 0 };

    // Place 7 Continents Portals (kind 24..30) in a beautiful arch at the top
    // Portal kind 24: Continent 1, kind 25: Continent 2, ... up to 30: Continent 7
    const portals = [
      { x: 5, y: 7, kind: 24, dest: 1 },
      { x: 7, y: 5, kind: 25, dest: 2 },
      { x: 9, y: 4, kind: 26, dest: 3 },
      { x: 12, y: 3, kind: 27, dest: 4 },
      { x: 15, y: 4, kind: 28, dest: 5 },
      { x: 17, y: 5, kind: 29, dest: 6 },
      { x: 19, y: 7, kind: 30, dest: 7 }
    ];

    portals.forEach((p) => {
      if (this.inBounds(p.x, p.y)) {
        this.tiles[this.idx(p.x, p.y)] = { kind: p.kind, biome: p.dest };
        // Surrounding pillars to frame the portal beautifully
        if (this.inBounds(p.x - 1, p.y)) this.tiles[this.idx(p.x - 1, p.y)].kind = 11;
        if (this.inBounds(p.x + 1, p.y)) this.tiles[this.idx(p.x + 1, p.y)].kind = 11;
      }
    });

    // Portal to Unified Biome Portal Room (kind 31) at the center bottom
    this.tiles[this.idx(12, 20)] = { kind: 31, biome: 999 };
    if (this.inBounds(11, 20)) this.tiles[this.idx(11, 20)].kind = 11;
    if (this.inBounds(13, 20)) this.tiles[this.idx(13, 20)].kind = 11;

    // Return to main Asterion city portal (kind 32)
    this.tiles[this.idx(12, 22)] = { kind: 32, biome: 0 };
  }
}

// ==========================================
// 3. UNIFIED BIOME PORTAL ROOM
// ==========================================

export class UnifiedBiomePortalRoom implements PlayMap {
  size = 50;
  seed = 888;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number };
  readonly isCave = true;
  readonly biomeId = -20; // Special biome ID

  constructor() {
    this.tiles = new Array(this.size * this.size);
    this.spawn = { x: 25 * TILE + TILE / 2, y: 42 * TILE + TILE / 2 };
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
    return t === 2 || t === 14 || t === 11 || t === 15;
  }

  private generate() {
    // Fill floor
    for (let i = 0; i < this.size * this.size; i++) {
      this.tiles[i] = { kind: 13, biome: 0 };
    }

    // Outer walls
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (x < 2 || y < 2 || x >= this.size - 2 || y >= this.size - 2) {
          this.tiles[this.idx(x, y)] = { kind: 14, biome: 0 };
        }
      }
    }

    // Layout all 235 biomes in an ultra-clean organized grid (10 columns, 24 rows)
    const columns = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44];
    let biomeCounter = 1;

    for (let row = 0; row < 24; row++) {
      const y = 4 + row * 1.6;
      const py = Math.floor(y);
      if (py >= this.size - 4) break;

      columns.forEach((px) => {
        if (biomeCounter <= 235) {
          this.tiles[this.idx(px, py)] = { kind: 33, biome: biomeCounter }; // Special Biome Dungeon Portal
          // Place decorative steel pillar next to it
          if (this.inBounds(px - 1, py)) this.tiles[this.idx(px - 1, py)].kind = 11;
          
          biomeCounter++;
        }
      });
    }

    // Return to Celestial Portal Room (kind 31) at the bottom spawn area
    this.tiles[this.idx(25, 45)] = { kind: 31, biome: 0 };
    if (this.inBounds(24, 45)) this.tiles[this.idx(24, 45)].kind = 11;
    if (this.inBounds(26, 45)) this.tiles[this.idx(26, 45)].kind = 11;
  }
}

// ==========================================
// 4. UNIFIED BIOME MASSIVE DUNGEON (3X ENEMIES)
// ==========================================

export class UnifiedBiomeDungeon implements PlayMap {
  size = 80; // Enormous size
  seed: number;
  biomeId: number;
  floor: number;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number };
  readonly isCave = true;
  readonly isUnifiedDungeon = true;

  constructor(biomeId: number, floor: number, seed: number) {
    this.biomeId = biomeId;
    this.floor = floor;
    this.seed = seed * 43 + biomeId * 101 + floor * 773;
    this.tiles = new Array(this.size * this.size);
    this.spawn = { x: 40 * TILE + TILE / 2, y: 40 * TILE + TILE / 2 };
    this.generate();
  }

  idx(x: number, y: number) { return y * this.size + x; }
  inBounds(x: number, y: number) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }

  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 2, biome: this.biomeId };
    return this.tiles[this.idx(x, y)];
  }

  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 2 || t === 14 || t === 11 || t === 15;
  }

  private generate() {
    const s = this.size;
    const mid = Math.floor(s / 2);

    // Initial fill with walls
    for (let i = 0; i < s * s; i++) {
      this.tiles[i] = { kind: 2, biome: this.biomeId };
    }

    // Carve structured chambers procedurally (fast & clean)
    const roomSize = 10;
    const steps = 14;

    const carveRoom = (cx: number, cy: number) => {
      const r = Math.floor(roomSize / 2);
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          const px = cx + x;
          const py = cy + y;
          if (this.inBounds(px, py)) {
            this.tiles[this.idx(px, py)] = { kind: 0, biome: this.biomeId };
          }
        }
      }
    };

    // Center spawn chamber
    carveRoom(mid, mid);

    // Create 4 symmetrical outer wings
    const centers = [
      { x: mid - 20, y: mid - 20 },
      { x: mid + 20, y: mid - 20 },
      { x: mid - 20, y: mid + 20 },
      { x: mid + 20, y: mid + 20 },
      { x: mid, y: mid - 30 },
      { x: mid, y: mid + 30 },
      { x: mid - 30, y: mid },
      { x: mid + 30, y: mid }
    ];

    centers.forEach((c) => {
      carveRoom(c.x, c.y);
      // Carve corridors back to center
      const startX = Math.min(mid, c.x);
      const endX = Math.max(mid, c.x);
      for (let x = startX; x <= endX; x++) {
        if (this.inBounds(x, c.y)) this.tiles[this.idx(x, c.y)] = { kind: 0, biome: this.biomeId };
        if (this.inBounds(x, mid)) this.tiles[this.idx(x, mid)] = { kind: 0, biome: this.biomeId };
      }
      const startY = Math.min(mid, c.y);
      const endY = Math.max(mid, c.y);
      for (let y = startY; y <= endY; y++) {
        if (this.inBounds(c.x, y)) this.tiles[this.idx(c.x, y)] = { kind: 0, biome: this.biomeId };
        if (this.inBounds(mid, y)) this.tiles[this.idx(mid, y)] = { kind: 0, biome: this.biomeId };
      }
    });

    // Symmetrical decorations (Torches kind 8, Steel pillars kind 11, Chests kind 12)
    centers.forEach((c) => {
      if (this.inBounds(c.x + 3, c.y + 3)) this.tiles[this.idx(c.x + 3, c.y + 3)] = { kind: 11, biome: this.biomeId };
      if (this.inBounds(c.x - 3, c.y - 3)) this.tiles[this.idx(c.x - 3, c.y - 3)] = { kind: 11, biome: this.biomeId };
      if (this.inBounds(c.x + 2, c.y - 2)) this.tiles[this.idx(c.x + 2, c.y - 2)] = { kind: 8, biome: this.biomeId };
      if (this.inBounds(c.x - 2, c.y + 2)) this.tiles[this.idx(c.x - 2, c.y + 2)] = { kind: 12, biome: this.biomeId }; // Lots of chests!
    });

    // Staircase setup (kind 7 goes back to unified portal, kind 6 descends deeper up to floor 5)
    this.tiles[this.idx(mid - 3, mid - 3)] = { kind: 7, biome: this.biomeId };
    this.stairs.push({ x: (mid - 3) * TILE + TILE / 2, y: (mid - 3) * TILE + TILE / 2, biome: this.biomeId, kind: "up" });

    this.tiles[this.idx(mid + 3, mid + 3)] = { kind: 6, biome: this.biomeId };
    this.stairs.push({ x: (mid + 3) * TILE + TILE / 2, y: (mid + 3) * TILE + TILE / 2, biome: this.biomeId, kind: "down" });
  }
}

// ==========================================
// 5. CONTINENT WORLD OVERWORLD (COVERS CONTINENTS 2-7)
// ==========================================

export class ContinentWorld implements PlayMap {
  size = 864; // Huge overworld, same as Continent 1
  seed: number;
  continentId: number;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number };
  readonly isCave = false;
  readonly biomeId = 0;

  constructor(continentId: number, seed: number) {
    this.continentId = continentId;
    this.seed = seed * 19 + continentId * 104729;
    this.tiles = new Array(this.size * this.size);
    // Town spawns at the exact center island
    this.spawn = { x: 432 * TILE + TILE / 2, y: 432 * TILE + TILE / 2 };
    this.generate();
  }

  idx(x: number, y: number) { return y * this.size + x; }
  inBounds(x: number, y: number) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }

  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 1, biome: 0 }; // Sea boundaries
    return this.tiles[this.idx(x, y)];
  }

  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 1 || t === 2 || t === 4 || t === 11 || t === 14 || t === 15;
  }

  private generate() {
    const s = this.size;

    // Fill completely with deep animated ocean water (kind 1)
    for (let i = 0; i < s * s; i++) {
      this.tiles[i] = { kind: 1, biome: 0 };
    }

    // 10 islands coordinates well-separated by channels of deep ocean
    const islandCenters = [
      { x: 160, y: 160, r: 85 },
      { x: 432, y: 160, r: 95 },
      { x: 700, y: 160, r: 85 },
      { x: 160, y: 432, r: 95 },
      { x: 432, y: 432, r: 110 }, // Central safe town plaza island!
      { x: 700, y: 432, r: 95 },
      { x: 160, y: 700, r: 85 },
      { x: 432, y: 700, r: 95 },
      { x: 700, y: 700, r: 85 },
      { x: 500, y: 300, r: 80 }
    ];

    const startBiome = 116 + (this.continentId - 2) * 20;

    // Procedural generation of each island
    islandCenters.forEach((isl, i) => {
      const b1 = startBiome + (i * 2) % 20;
      const b2 = startBiome + (i * 2 + 1) % 20;

      for (let dy = -isl.r - 20; dy <= isl.r + 20; dy++) {
        for (let dx = -isl.r - 20; dx <= isl.r + 20; dx++) {
          const px = isl.x + dx;
          const py = isl.y + dy;
          if (!this.inBounds(px, py)) continue;

          // Add organic wave/noise distortion to the borders
          const noise = Math.sin(px * 0.08) * 6 + Math.cos(py * 0.08) * 6;
          const dist = Math.hypot(dx, dy) + noise;

          if (dist < isl.r) {
            // Determine biome layout (horizontal split)
            const b = dx < 0 ? b1 : b2;
            
            // Land types: standard grass (0) or mountains (2) at the core
            let kind = 0;
            if (dist < isl.r * 0.35 && dist > isl.r * 0.25) {
              kind = 4; // Tree wall barrier
            } else if (dist < isl.r * 0.2) {
              kind = 2; // Mountain cores
            }

            this.tiles[this.idx(px, py)] = { kind, biome: b };
          }
        }
      }

      // Safe town plaza on the Central Island
      if (i === 4) {
        const cx = isl.x;
        const cy = isl.y;
        
        // Pave a large 15x15 town plaza (kind 13)
        for (let dy = -8; dy <= 8; dy++) {
          for (let dx = -8; dx <= 8; dx++) {
            if (this.inBounds(cx + dx, cy + dy)) {
              this.tiles[this.idx(cx + dx, cy + dy)] = { kind: 13, biome: 0 };
            }
          }
        }

        // Return portal (kind 32) at the town center to go back to Celestial Room
        this.tiles[this.idx(cx, cy)] = { kind: 32, biome: 0 };
        if (this.inBounds(cx - 1, cy)) this.tiles[this.idx(cx - 1, cy)].kind = 11;
        if (this.inBounds(cx + 1, cy)) this.tiles[this.idx(cx + 1, cy)].kind = 11;
      } else {
        // Place a staircase down (kind 6) to caves in the center of other islands
        const cx = isl.x;
        const cy = isl.y;
        if (this.inBounds(cx, cy)) {
          this.tiles[this.idx(cx, cy)] = { kind: 6, biome: b1 };
          this.stairs.push({ x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2, biome: b1, kind: "down" });
        }
      }
    });
  }
}

// ==========================================
// 6. CORE TRANSITION MECHANICS & GATE RESOLVERS
// ==========================================

export function enterCelestialRoom(g: GameState) {
  g.activeCelestialPortalRoom = true;
  g.activeUnifiedBiomePortalRoom = false;
  g.activeUnifiedBiomeDungeon = null;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  g.activeGrandFloor = 0;
  g.activeTempleFloor = 0;

  const room = new CelestialPortalRoom();
  g.activeMap = room;
  g.player.pos = { x: room.spawn.x, y: room.spawn.y };
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];

  logMsg(g, "🌌 Você entrou na Câmara Portal Celestial!", "#a855f7");
}

export function enterUnifiedBiomePortalRoom(g: GameState) {
  g.activeCelestialPortalRoom = false;
  g.activeUnifiedBiomePortalRoom = true;
  g.activeUnifiedBiomeDungeon = null;
  g.activeCaveBiome = null;
  g.activeFloor = 1;

  const room = new UnifiedBiomePortalRoom();
  g.activeMap = room;
  g.player.pos = { x: room.spawn.x, y: room.spawn.y };
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];

  logMsg(g, "🔮 Você entrou no Portal de Biomas Unificado!", "#22d3ee");
}

export function enterUnifiedBiomeDungeon(g: GameState, biomeId: number, floor = 1) {
  g.activeCelestialPortalRoom = false;
  g.activeUnifiedBiomePortalRoom = false;
  g.activeUnifiedBiomeDungeon = biomeId;
  g.activeCaveBiome = biomeId;
  g.activeFloor = floor;

  const dung = new UnifiedBiomeDungeon(biomeId, floor, g.world.seed);
  g.activeMap = dung;
  g.player.pos = { x: dung.spawn.x, y: dung.spawn.y };
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];

  const b = getContinentBiome(biomeId);
  logMsg(g, `⚔️ DUNGEON DE BIOMA ATIVADA: ${b.name} (Andar ${floor})! 3x mais inimigos e drops rúnicos elevados!`, "#ef4444");
}

export function enterContinent(g: GameState, continentId: number) {
  // Gate check
  const levelReq = 1 + (continentId - 1) * 400; // Continent 2 req Level 400, C3 req Level 800, etc.
  if (g.player.level < levelReq) {
    logMsg(g, `⚠️ ACESSO NEGADO: Você precisa alcançar o Nível ${levelReq} para entrar no Continente ${continentId}!`, "#ef4444");
    return;
  }

  g.activeCelestialPortalRoom = false;
  g.activeUnifiedBiomePortalRoom = false;
  g.activeUnifiedBiomeDungeon = null;
  g.activeCaveBiome = null;
  g.activeFloor = 1;
  g.currentContinentId = continentId;

  // Load procedurally generated overworld for that continent
  const contWorld = new ContinentWorld(continentId, g.world.seed);
  g.activeMap = contWorld;
  g.player.pos = { x: contWorld.spawn.x, y: contWorld.spawn.y };
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];

  logMsg(g, `🌍 Teletransportado para o Continente ${continentId}: Mares Profundos!`, "#10b981");
}

export function exitCelestialRoom(g: GameState) {
  g.activeCelestialPortalRoom = false;
  g.activeUnifiedBiomePortalRoom = false;
  g.activeUnifiedBiomeDungeon = null;
  g.activeCaveBiome = null;
  g.activeFloor = 1;

  // Teleport back to the spawn plaza of the current continent
  if (g.currentContinentId && g.currentContinentId > 1) {
    const contWorld = new ContinentWorld(g.currentContinentId, g.world.seed);
    g.activeMap = contWorld;
    g.player.pos = { x: contWorld.spawn.x, y: contWorld.spawn.y };
  } else {
    g.activeMap = g.world;
    g.player.pos = { x: g.world.spawn.x, y: g.world.spawn.y };
  }
  g.enemies = [];
  g.loot = [];
  g.projectiles = [];

  logMsg(g, "Retornou para a cidade principal.", "#10b981");
}

function logMsg(g: GameState, text: string, color = "#fff") {
  g.log.unshift({ text, color, life: 6 });
  if (g.log.length > 8) g.log.pop();
}
