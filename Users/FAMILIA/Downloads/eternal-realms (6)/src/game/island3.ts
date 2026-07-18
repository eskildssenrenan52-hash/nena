// Island 3 — 110 novos biomas abissais e de exploração submarina.
// Começam no nível 20 e escalam até o nível 120+.
// Cada um conta com 3 sub-andares de caverna de profundidade.

import type { Biome } from "./engine";

function ct(label: string, floor: string, wall: string, accent: string, monsters: string[], boss: string) {
  return { label, floor, wall, accent, monsters, boss };
}

// Prefixes and suffixes to generate exactly 110 unique biomes with high variety
const PREFIXES = [
  "Abismo de", "Fenda de", "Fossa de", "Labirinto de", "Trincheira de",
  "Gruta de", "Coral de", "Templo Submerso de", "Ruínas de", "Gruta de",
  "Vazio de", "Recife de", "Profundezas de", "Cemitério de Navios de", "Santuário de"
];

const NAMES = [
  "Poseidon", "Cthulhu", "Netuno", "Atlantis", "Leviathan", "Kraken", "Sirena",
  "Aegir", "Tiamat", "Njord", "Oceano", "Coral Negro", "Gruta Azul", "Mar Profundo",
  "Anfibios", "Tritão", "Algas Gigantes", "Pérolas Negras", "Correntes Fortes",
  "Sereias", "Marujo Perdido", "Tubarão Branco", "Lula Gigante", "Medusas Brilhantes",
  "Cascos de Ferro", "Vento Marinho", "Sombra das Ondas", "Rei do Mar", "Rainha Abissal"
];

const MONSTERS_POOL = [
  ["Peixe-Abissal", "Medusa Elétrica", "Enguia das Sombras"],
  ["Tritão Caçador", "Sereia Sombria", "Guerreiro de Coral"],
  ["Caranguejo Gigante", "Anêmona Assassina", "Estrela Vampira"],
  ["Guardião Afogado", "Espectro das Marés", "Pirata Fantasma"],
  ["Tubarão de Bronze", "Lula de Piche", "Cascudo Abissal"],
  ["Salamandra Marinha", "Broto de Coral", "Vigia do Abismo"]
];

const CAVE_MONSTERS_POOL = [
  ["Larva Aquática", "Verme da Fossa", "Caranguejo Cego"],
  ["Peixe Lanterna", "Anêmona de Gruta", "Espírito das Profundezas"],
  ["Esmagador de Coral", "Enguia Cega", "Espectro do Vazio"],
  ["Sereia Espectral", "Aranha Marinha", "Sentinela de Pedra"]
];

const COLORS = [
  "#0b1d3a", "#05224e", "#0a3663", "#0c4b75", "#0d5c75",
  "#0a4b5c", "#05303c", "#081f2c", "#031722", "#0b2b3c",
  "#052c30", "#083e40", "#0e4a4d", "#0c524d", "#124b3f"
];

const ACCENTS = [
  "#020617", "#030712", "#020813", "#010b18", "#010f22",
  "#02131e", "#01161d", "#011b24", "#02202c", "#012635"
];

export const ISLAND3_BIOMES: Biome[] = [];

// Generate exactly 110 biomes starting at ID 301
for (let i = 0; i < 110; i++) {
  const pIdx = i % PREFIXES.length;
  const nIdx = (i + Math.floor(i / PREFIXES.length)) % NAMES.length;
  const mIdx = i % MONSTERS_POOL.length;
  const cmIdx = (i + 1) % CAVE_MONSTERS_POOL.length;
  
  const pName = PREFIXES[pIdx];
  const sName = NAMES[nIdx];
  const name = `${pName} ${sName}`;
  
  // Danger level starting from 20 up to 110+
  const danger = 20 + Math.floor(i * 0.85);
  const color = COLORS[i % COLORS.length];
  const accent = ACCENTS[i % ACCENTS.length];
  
  const monsters = MONSTERS_POOL[mIdx];
  const boss = `Imperador ${sName}`;
  
  const caveTheme = ct(
    `Fossa Secreta de ${sName}`,
    ACCENTS[(i + 3) % ACCENTS.length],
    "#020617",
    color,
    CAVE_MONSTERS_POOL[cmIdx],
    `Devorador de ${sName}`
  );
  
  ISLAND3_BIOMES.push({
    id: 301 + i,
    name,
    color,
    accent,
    danger,
    monsters,
    boss,
    caveTheme
  });
}


