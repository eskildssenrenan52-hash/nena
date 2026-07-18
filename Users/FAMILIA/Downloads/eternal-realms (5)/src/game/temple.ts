// Templo Eterno de Asterion — 25 floors of highly structured, square, majestic challenges
// Located right next to the central city of Asterion.
//
// Every floor is a perfect square sanctuary filled with detailed symmetries,
// colonnades of steel pillars, sacred fountains, and glowing holy torches.
// A final boss, "Serafim do Juízo Final", guards the apex of the temple at Floor 25.

import { TILE, type PlayMap, type WorldTile, type Stair } from "./engine";

export const TEMPLE_MAX_FLOOR = 25;
export const TEMPLE_DIFFICULTY_MULTIPLIER = 1.35; // 1.35x difficulty per floor

export const TEMPLE_ENEMIES: { pool: string[]; boss: string }[] = [
  { pool: ["Novato do Templo", "Adepto de Luz", "Guarda Sagrado Menor"], boss: "Inquisidor Iniciante" }, // Floors 1-5
  { pool: ["Sacerdote Menor", "Inquisidor de Bronze", "Cavaleiro Sideral"], boss: "Templário de Ferro" }, // Floors 6-10
  { pool: ["Xamã da Fé", "Vigilante das Estátuas", "Gladiador de Ouro"], boss: "Bispo da Purificação" }, // Floors 11-15
  { pool: ["Sacerdote de Platina", "Pretoriano Sagrado", "Arconte da Luz"], boss: "Sumo Sacerdote Solar" }, // Floors 16-20
  { pool: ["Canalizador Cósmico", "Serafim de Éter", "Aniquilador Celestino"], boss: "Avatar de Asterion" }, // Floors 21-24
  { pool: ["Avatar de Asterion", "Serafim do Juízo Final", "Guarda do Altar"], boss: "Serafim do Juízo Final" }, // Floor 25
];

export function templeEnemyNameForFloor(floor: number, boss: boolean) {
  const tier = Math.min(5, Math.floor((floor - 1) / 5));
  const pool = TEMPLE_ENEMIES[tier];
  if (boss) return pool.boss;
  return pool.pool[Math.floor(Math.random() * pool.pool.length)];
}

export function templeDifficultyMultiplier(floor: number) {
  return Math.pow(TEMPLE_DIFFICULTY_MULTIPLIER, Math.max(0, floor - 1));
}

export class TempleFloor implements PlayMap {
  size: number;
  seed: number;
  floor: number;
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number } = { x: 0, y: 0 };
  readonly isCave = true;
  readonly isTemple = true;
  readonly biomeId = 0; // Distinct from regular cave biomes

  constructor(floor: number, seed: number) {
    this.floor = floor;
    this.seed = seed;
    // Temple is a majestic square sanctuary. Size is perfectly square: 48x48.
    this.size = 48;
    this.tiles = new Array(this.size * this.size);
    this.generate();
  }

  idx(x: number, y: number) { return y * this.size + x; }
  inBounds(x: number, y: number) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }
  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 14, biome: 0 }; // Stone building wall outer boundary
    return this.tiles[this.idx(x, y)];
  }

  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 2 || t === 14 || t === 11 || t === 15; // standard block list
  }

  private setTile(x: number, y: number, kind: number) {
    if (!this.inBounds(x, y)) return;
    this.tiles[this.idx(x, y)].kind = kind;
  }

  private generate() {
    const s = this.size;
    const mid = Math.floor(s / 2);

    // Fill entirely with marble tiled floors (kind 13)
    for (let i = 0; i < s * s; i++) {
      this.tiles[i] = { kind: 13, biome: 0 };
    }

    // Outer thick walls (double layer for grand aesthetic blockiness)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        if (x < 2 || y < 2 || x >= s - 2 || y >= s - 2) {
          this.tiles[this.idx(x, y)].kind = 14; // heavy stone wall
        }
      }
    }

    // Construct beautiful symmetry: Colonnades, Garden of Eden in the center, and symmetrical corner chambers
    // Let's divide into 4 elegant corner chambers (size 10x10) and a grand central dome.
    const chamberSize = 12;

    // Build walls for corner chambers
    const drawChamber = (bx: number, by: number) => {
      for (let y = 0; y < chamberSize; y++) {
        for (let x = 0; x < chamberSize; x++) {
          const px = bx + x;
          const py = by + y;
          const isEdge = x === 0 || y === 0 || x === chamberSize - 1 || y === chamberSize - 1;
          if (isEdge) {
            // Leave gate openings in the middle of chamber walls
            const isGate = (x === Math.floor(chamberSize / 2) && y === chamberSize - 1) ||
                           (x === Math.floor(chamberSize / 2) && y === 0) ||
                           (y === Math.floor(chamberSize / 2) && x === chamberSize - 1) ||
                           (y === Math.floor(chamberSize / 2) && x === 0);
            if (isGate) {
              this.setTile(px, py, 10); // Iron Gate
            } else {
              this.setTile(px, py, 14); // Stone wall
            }
          }
        }
      }
    };

    // Draw 4 corner chambers
    drawChamber(4, 4);
    drawChamber(s - 4 - chamberSize, 4);
    drawChamber(4, s - 4 - chamberSize);
    drawChamber(s - 4 - chamberSize, s - 4 - chamberSize);

    // Decorate the central plaza (Grand Dome) with a symmetrical layout
    // Central fountain surrounded by Steel Pillars (kind 11) and Torches (kind 8)
    this.setTile(mid, mid, 15); // Sacred central fountain
    this.setTile(mid - 1, mid, 13);
    this.setTile(mid + 1, mid, 13);
    this.setTile(mid, mid - 1, 13);
    this.setTile(mid, mid + 1, 13);

    // Pillars around the central fountain (ring of steel pillars)
    const offsets = [-3, 3];
    for (const ox of offsets) {
      for (const oy of offsets) {
        this.setTile(mid + ox, mid + oy, 11); // Steel pillar
        this.setTile(mid + ox + Math.sign(ox), mid + oy, 8); // Torch
      }
    }

    // Build majestic corridors lined with torches (kind 8)
    for (let i = 4; i < s - 4; i += 4) {
      if (this.get(i, mid).kind === 13) this.setTile(i, mid - 1, 8);
      if (this.get(mid, i).kind === 13) this.setTile(mid - 1, i, 8);
    }

    // Spawn point: In the center of the southwest chamber
    const spawnX = 4 + Math.floor(chamberSize / 2);
    const spawnY = s - 4 - Math.floor(chamberSize / 2);
    this.spawn = { x: spawnX * TILE + TILE / 2, y: spawnY * TILE + TILE / 2 };

    // Setup Staircases
    // Staircase UP (kind 7): Center of northwest chamber
    const upX = 4 + Math.floor(chamberSize / 2);
    const upY = 4 + Math.floor(chamberSize / 2);
    this.tiles[this.idx(upX, upY)].kind = 7;
    this.stairs.push({ x: upX * TILE + TILE / 2, y: upY * TILE + TILE / 2, biome: 0, kind: "up" });

    // Staircase DOWN (kind 6): Center of southeast chamber
    const downX = s - 4 - Math.floor(chamberSize / 2);
    const downY = s - 4 - Math.floor(chamberSize / 2);
    this.tiles[this.idx(downX, downY)].kind = 6;
    this.stairs.push({ x: downX * TILE + TILE / 2, y: downY * TILE + TILE / 2, biome: 0, kind: "down" });

    // Symmetrical chests for rewarding detailed exploration!
    // Southwest and Northeast chambers get treasure chests
    const chest1X = s - 4 - Math.floor(chamberSize / 2);
    const chest1Y = 4 + Math.floor(chamberSize / 2);
    this.setTile(chest1X, chest1Y, 12); // Chest

    // Let's add extra chests in Floor 25 (boss room) or rare sacred rooms
    if (this.floor === 25) {
      // Symmetrical chests surrounding the final boss arena
      this.setTile(mid - 5, mid - 5, 12);
      this.setTile(mid + 5, mid - 5, 12);
      this.setTile(mid - 5, mid + 5, 12);
      this.setTile(mid + 5, mid + 5, 12);
    }
  }
}
