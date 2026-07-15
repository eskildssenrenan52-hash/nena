// 1000 procedurally-generated items across 11 slot types.
// Deterministic (seeded) so the same list is produced across reloads.

export type ItemSlot =
  | "helm"
  | "chest"
  | "legs"
  | "boots"
  | "gloves"
  | "necklace"
  | "belt"
  | "ring"
  | "weapon"
  | "shield"
  | "cape";

export const SLOT_LABEL: Record<ItemSlot, string> = {
  helm: "Elmo",
  chest: "Peitoral",
  legs: "Calça",
  boots: "Botas",
  gloves: "Luvas",
  necklace: "Colar",
  belt: "Cinto",
  ring: "Anel",
  weapon: "Arma",
  shield: "Escudo",
  cape: "Capa",
};

export const SLOT_ICON: Record<ItemSlot, string> = {
  helm: "🪖",
  chest: "🥋",
  legs: "👖",
  boots: "🥾",
  gloves: "🧤",
  necklace: "📿",
  belt: "🎗️",
  ring: "💍",
  weapon: "⚔️",
  shield: "🛡️",
  cape: "🧣",
};

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9ca3af",
  uncommon: "#4ade80",
  rare: "#38bdf8",
  epic: "#a78bfa",
  legendary: "#facc15",
  mythic: "#f472b6",
};

export const RARITY_BG: Record<Rarity, string> = {
  common: "rgba(156,163,175,0.15)",
  uncommon: "rgba(74,222,128,0.15)",
  rare: "rgba(56,189,248,0.15)",
  epic: "rgba(167,139,250,0.18)",
  legendary: "rgba(250,204,21,0.18)",
  mythic: "rgba(244,114,182,0.20)",
};

export interface Item {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: Rarity;
  level: number;
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  icon: string;
}

const PREFIXES = [
  "Antigo", "Sombrio", "Divino", "Espectral", "Rúnico", "Ígneo", "Gélido", "Voraz",
  "Silente", "Feroz", "Áureo", "Etéreo", "Astral", "Selvagem", "Sagrado", "Corrupto",
  "Cristalino", "Abissal", "Solar", "Lunar", "Ocaso", "Vazio", "Titânico", "Régio",
  "Vil", "Nômade", "Tempestuoso", "Marfim", "Obsidiano", "Verdejante",
];

const SUFFIXES_BY_SLOT: Record<ItemSlot, string[]> = {
  helm: ["do Dragão", "do Titã", "do Corvo", "do Sábio", "da Guerra", "do Vento"],
  chest: ["da Muralha", "do Colosso", "do Guardião", "das Escamas", "da Aurora"],
  legs: ["do Andarilho", "da Fera", "do Caçador", "do Explorador", "da Tempestade"],
  boots: ["do Vento", "da Fúria", "do Ladino", "do Peregrino", "da Sombra"],
  gloves: ["do Punho", "do Ferreiro", "do Assassino", "do Mago", "da Presa"],
  necklace: ["dos Astros", "do Oráculo", "da Sabedoria", "da Verdade", "do Feiticeiro"],
  belt: ["do Titã", "do Bárbaro", "do Errante", "do Comandante", "da Coragem"],
  ring: ["do Poder", "da Chama", "do Gelo", "da Vida", "do Mana"],
  weapon: ["do Trovão", "da Ruína", "do Carrasco", "do Ceifador", "da Aurora"],
  shield: ["do Baluarte", "do Sentinela", "do Colosso", "da Muralha", "do Bastião"],
  cape: ["do Vento", "da Noite", "do Fênix", "do Corvo", "da Aurora"],
};

const BASE_NAMES: Record<ItemSlot, string[]> = {
  helm: ["Elmo", "Capacete", "Coroa", "Capuz", "Tiara"],
  chest: ["Peitoral", "Cota", "Armadura", "Manto", "Traje"],
  legs: ["Calça", "Grevas", "Perneiras", "Saias", "Bragas"],
  boots: ["Botas", "Sandálias", "Coturnos", "Sapatos", "Pisos"],
  gloves: ["Luvas", "Manoplas", "Punhos", "Braceletes", "Braçadeiras"],
  necklace: ["Colar", "Amuleto", "Pingente", "Talismã", "Gargantilha"],
  belt: ["Cinto", "Faixa", "Cinturão", "Correia", "Bandoleira"],
  ring: ["Anel", "Aro", "Selo", "Signete", "Argola"],
  weapon: ["Espada", "Machado", "Lança", "Adaga", "Cajado", "Arco", "Martelo", "Foice"],
  shield: ["Escudo", "Broquel", "Pavês", "Rodela", "Adarga"],
  cape: ["Capa", "Manto", "Xaile", "Estola", "Véu"],
};

const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

// Deterministic pseudo-random from string.
function seedRand(seed: string) {
  let s = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    s ^= seed.charCodeAt(i);
    s = Math.imul(s, 16777619) >>> 0;
  }
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^= s >>> 16) >>> 0) / 4294967296;
  };
}

function rollRarity(r: () => number, level: number): Rarity {
  const roll = r() * 100;
  const bias = level / 100; // slightly better as level rises
  if (roll < 3 + bias * 2) return "mythic";
  if (roll < 10 + bias * 4) return "legendary";
  if (roll < 22 + bias * 6) return "epic";
  if (roll < 42) return "rare";
  if (roll < 68) return "uncommon";
  return "common";
}

function makeItem(index: number, slot: ItemSlot): Item {
  const r = seedRand(`item-${slot}-${index}`);
  const level = 1 + Math.floor(r() * 100);
  const rarity = rollRarity(r, level);
  const rIdx = RARITY_ORDER.indexOf(rarity) + 1;
  const prefix = PREFIXES[Math.floor(r() * PREFIXES.length)];
  const base = BASE_NAMES[slot][Math.floor(r() * BASE_NAMES[slot].length)];
  const suffix = SUFFIXES_BY_SLOT[slot][Math.floor(r() * SUFFIXES_BY_SLOT[slot].length)];

  const power = Math.round((level * (0.8 + rIdx * 0.35) + rIdx * 3) * (0.7 + r() * 0.6));
  const isOffensive =
    slot === "weapon" || slot === "ring" || slot === "gloves" || slot === "necklace";
  const isDefensive =
    slot === "chest" || slot === "legs" || slot === "helm" || slot === "shield" || slot === "boots";

  // Stats de armas/armaduras foram nerfados 3x (dividido por 3, arredondado pra baixo, mínimo 1).
  const nerf = (v: number) => Math.max(1, Math.floor(v / 3));
  const attack = nerf(isOffensive ? power + Math.round(r() * rIdx * 4) : Math.round(power * 0.15));
  const defense = nerf(isDefensive ? power + Math.round(r() * rIdx * 4) : Math.round(power * 0.15));
  const hp = nerf(Math.round(power * (rIdx * 0.6 + r() * 1.5)));
  const mp = nerf(Math.round(power * (rIdx * 0.4 + r() * 1.2)));

  return {
    id: `${slot}-${index}`,
    name: `${prefix} ${base} ${suffix}`.trim(),
    slot,
    rarity,
    level,
    attack,
    defense,
    hp,
    mp,
    icon: SLOT_ICON[slot],
  };
}

// Distribution: 1000 items total across 11 slots.
// Weapons get more (heroes love weapons). Everything else roughly balanced.
const DISTRIBUTION: Record<ItemSlot, number> = {
  weapon: 180,
  helm: 90,
  chest: 90,
  legs: 90,
  boots: 90,
  gloves: 90,
  shield: 90,
  necklace: 80,
  belt: 80,
  ring: 80,
  cape: 40,
};

function generateAll(): Item[] {
  const list: Item[] = [];
  (Object.keys(DISTRIBUTION) as ItemSlot[]).forEach((slot) => {
    for (let i = 0; i < DISTRIBUTION[slot]; i++) list.push(makeItem(i, slot));
  });
  return list;
}

export const ALL_ITEMS: Item[] = generateAll();
export const ITEMS_BY_SLOT: Record<ItemSlot, Item[]> = ALL_ITEMS.reduce(
  (acc, it) => {
    (acc[it.slot] ||= []).push(it);
    return acc;
  },
  {} as Record<ItemSlot, Item[]>,
);

export const SLOT_ORDER: ItemSlot[] = [
  "helm",
  "necklace",
  "chest",
  "cape",
  "gloves",
  "weapon",
  "shield",
  "ring",
  "belt",
  "legs",
  "boots",
];
