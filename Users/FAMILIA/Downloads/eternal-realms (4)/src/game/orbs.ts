// Orb system: rare crystals that upgrade item quality up to Divino.
// Orbs drop with a very small chance from monsters and mining.
// Each quality tier requires 10 orbs of the matching orb rarity.

import type { GameState } from "./game";
import type { ExtItem, ItemQuality } from "./engine";
import { QUALITY_MULT } from "./engine";

export type OrbRarity =
  | "comum"
  | "raro"
  | "epico"
  | "mitico"
  | "lendario"
  | "divino";

export const ORB_ORDER: OrbRarity[] = [
  "comum",
  "raro",
  "epico",
  "mitico",
  "lendario",
  "divino",
];

export const ORB_NAME: Record<OrbRarity, string> = {
  comum: "Orb Comum",
  raro: "Orb Raro",
  epico: "Orb Épico",
  mitico: "Orb Mítico",
  lendario: "Orb Lendário",
  divino: "Orb Divino",
};

export const ORB_COLOR: Record<OrbRarity, string> = {
  comum: "#c8c8c8",
  raro: "#5ea8ff",
  epico: "#c25ef0",
  mitico: "#ff60d0",
  lendario: "#f0b040",
  divino: "#fff080",
};

// Drop chance (total) per source. Distributed across rarities exponentially:
// each higher tier is ~1/6 the odds of the previous. Divino is sub-1% by far.
// Base chances shown as "chance of any orb":
//   Monster common:  0.60%
//   Elite monster:   3.00%
//   Boss monster:   12.00%
//   Mining vein:     1.20%
// Given an orb drop, the distribution across rarities is:
//   comum 60% · raro 22% · epico 12% · mitico 4.5% · lendario 1.2% · divino 0.3%
const ORB_DIST: [OrbRarity, number][] = [
  ["comum", 0.6],
  ["raro", 0.22],
  ["epico", 0.12],
  ["mitico", 0.045],
  ["lendario", 0.012],
  ["divino", 0.003],
];

function pickOrbRarity(luck = 0): OrbRarity {
  // luck slightly biases toward better tiers.
  const r = Math.random();
  let cum = 0;
  const bias = Math.min(0.05, luck / 400);
  const shifted: [OrbRarity, number][] = ORB_DIST.map(([k, w], i) => [
    k,
    w * (1 + (i - 2) * bias),
  ]);
  const total = shifted.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of shifted) {
    cum += w / total;
    if (r <= cum) return k;
  }
  return "comum";
}

export function rollOrbDrop(
  source: "monster" | "elite" | "boss" | "mining",
  luck = 0,
): OrbRarity | null {
  const base =
    source === "boss"
      ? 0.12
      : source === "elite"
        ? 0.03
        : source === "mining"
          ? 0.012
          : 0.006;
  const chance = base * (1 + luck / 100);
  if (Math.random() >= chance) return null;
  return pickOrbRarity(luck);
}

export function getOrbs(g: GameState): Record<OrbRarity, number> {
  const p = g.player as unknown as { orbs?: Record<OrbRarity, number> };
  if (!p.orbs) {
    p.orbs = { comum: 0, raro: 0, epico: 0, mitico: 0, lendario: 0, divino: 0 };
  }
  return p.orbs;
}

export function giveOrb(g: GameState, rarity: OrbRarity, count = 1) {
  const orbs = getOrbs(g);
  orbs[rarity] = (orbs[rarity] ?? 0) + count;
}

// Quality tier progression. Each orb rarity upgrades the item to the matching
// tier at cost of 10 orbs (or 1 divino for divino).
export const QUALITY_ORDER: ItemQuality[] = [
  "comum",
  "bom",
  "excelente",
  "perfeito",
  "obra-prima",
  "lendario",
  "divino",
];

// Which orb is required to jump FROM currentQuality to the next tier.
export function orbForNextTier(current: ItemQuality): OrbRarity | null {
  const cur = QUALITY_ORDER.indexOf(current);
  if (cur < 0 || cur >= QUALITY_ORDER.length - 1) return null;
  // Mapping: comum→bom needs comum, bom→excelente needs raro, ...
  const map: OrbRarity[] = [
    "comum",
    "raro",
    "epico",
    "mitico",
    "lendario",
    "divino",
  ];
  return map[cur];
}

export function nextQuality(current: ItemQuality): ItemQuality | null {
  const cur = QUALITY_ORDER.indexOf(current);
  if (cur < 0 || cur >= QUALITY_ORDER.length - 1) return null;
  return QUALITY_ORDER[cur + 1];
}

export function orbCostForNext(current: ItemQuality): number {
  const orb = orbForNextTier(current);
  if (!orb) return 0;
  // Divino requires just 1; everything else requires 10.
  return orb === "divino" ? 1 : 10;
}

// Attempts to upgrade the equipped item one quality tier.
// Returns a human-readable message.
export function upgradeItemQuality(
  g: GameState,
  slot: "weapon" | "armor",
): { ok: boolean; msg: string; color: string } {
  const p = g.player;
  const it = p.equipped[slot] as ExtItem | undefined;
  if (!it)
    return {
      ok: false,
      msg: `Nenhum item equipado em ${slot === "weapon" ? "arma" : "armadura"}.`,
      color: "#ff9060",
    };
  const cur = (it.quality as ItemQuality) ?? "comum";
  const nxt = nextQuality(cur);
  if (!nxt)
    return {
      ok: false,
      msg: `${it.name} já é DIVINO — máximo atingido.`,
      color: "#fff080",
    };
  const orb = orbForNextTier(cur)!;
  const cost = orbCostForNext(cur);
  const orbs = getOrbs(g);
  if ((orbs[orb] ?? 0) < cost)
    return {
      ok: false,
      msg: `Precisa de ${cost}x ${ORB_NAME[orb]} (tem ${orbs[orb] ?? 0}).`,
      color: ORB_COLOR[orb],
    };
  orbs[orb] -= cost;
  it.quality = nxt;
  // Boost item power to match new quality tier.
  const oldMult = QUALITY_MULT[cur];
  const newMult = QUALITY_MULT[nxt];
  it.power = Math.round((it.power / oldMult) * newMult);
  return {
    ok: true,
    msg: `${it.name} melhorado para ${nxt.toUpperCase()}!`,
    color: nxt === "divino" ? "#fff080" : "#5ecf5e",
  };
}
