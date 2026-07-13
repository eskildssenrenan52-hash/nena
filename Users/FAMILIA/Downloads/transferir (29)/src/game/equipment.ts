// Equipment system for Rimhold.
// 10 slots, per-biome themed sets, rarity levels upgradeable at the blacksmith.

import { BIOMES } from "./config";
import equipSheet1Url from "@/assets/equipment-sheet-1.png";
import equipSheet2Url from "@/assets/equipment-sheet-2.png";
import gemsUrl from "@/assets/gems.png";

export type EquipSlot =
  | "helmet" | "chest" | "pants" | "boots"
  | "gloveL" | "gloveR" | "belt"
  | "ring" | "necklace" | "rune";

export const EQUIP_SLOTS: EquipSlot[] = [
  "helmet","chest","pants","boots",
  "gloveL","gloveR","belt","ring","necklace","rune",
];

export const SLOT_LABEL: Record<EquipSlot,string> = {
  helmet:"Capacete", chest:"Peitoral", pants:"Calça", boots:"Botas",
  gloveL:"Luva Esq.", gloveR:"Luva Dir.", belt:"Cinto",
  ring:"Anel", necklace:"Colar", rune:"Runa",
};

// Rarity 0..4 = Comum, Incomum, Raro, Épico, Lendário.
// Upgrading rarity N -> N+1 costs 20 gems of the matching color.
export type Rarity = 0 | 1 | 2 | 3 | 4;
export const RARITY_NAMES = ["Comum","Incomum","Raro","Épico","Lendário"] as const;
export const RARITY_COLORS = ["#94a3b8","#4ade80","#38bdf8","#a855f7","#fbbf24"] as const;
export const RARITY_GLOW   = ["#1e293b","#14532d","#164e63","#4c1d95","#78350f"] as const;

// Gem type per rarity upgrade path:
//   Comum   -> Incomum : green gem
//   Incomum -> Raro    : blue gem
//   Raro    -> Épico   : purple gem
//   Épico   -> Lendário: yellow gem
export type Gem = "green" | "blue" | "purple" | "yellow";
export const GEMS: Gem[] = ["green","blue","purple","yellow"];
export const GEM_LABEL: Record<Gem,string> = {
  green:"Jóia Verde", blue:"Jóia Azul", purple:"Jóia Roxa", yellow:"Jóia Amarela",
};
export const GEM_COLOR: Record<Gem,string> = {
  green:"#22c55e", blue:"#3b82f6", purple:"#a855f7", yellow:"#facc15",
};
// Drop chance per kill.
export const GEM_DROP: Record<Gem,number> = {
  green: 0.05, blue: 0.02, purple: 0.01, yellow: 0.0025,
};
export const GEMS_PER_UPGRADE = 20;
export function gemForUpgrade(fromRarity: Rarity): Gem | null {
  if (fromRarity >= 4) return null;
  return GEMS[fromRarity];
}

// Equipment drop chance from any hostile monster kill.
export const EQUIP_DROP_CHANCE = 0.01;

// 10 "biome sets" packaged into 2 sprite sheets (5 rows each).
// Each biome sets tag: id + display name + which sheet + which row (0..4).
export interface BiomeSet {
  id: string;
  name: string;
  sheet: 0 | 1;   // which of the two sheets
  row: number;    // 0..4 row inside sheet
  color: string;  // theme accent color
}
export const BIOME_SETS: BiomeSet[] = [
  { id:"nature",   name:"Selvático",   sheet:0, row:0, color:"#22c55e" },
  { id:"desert",   name:"Areia Real",  sheet:0, row:1, color:"#f59e0b" },
  { id:"frost",    name:"Gelo Eterno", sheet:0, row:2, color:"#60a5fa" },
  { id:"volcanic", name:"Cinza-Magma", sheet:0, row:3, color:"#dc2626" },
  { id:"void",     name:"Vazio",       sheet:0, row:4, color:"#7c3aed" },
  { id:"deep",     name:"Abissal",     sheet:1, row:0, color:"#0d9488" },
  { id:"prism",    name:"Prismático",  sheet:1, row:1, color:"#c084fc" },
  { id:"celest",   name:"Celestial",   sheet:1, row:2, color:"#fef3c7" },
  { id:"clock",    name:"Engrenagem",  sheet:1, row:3, color:"#b45309" },
  { id:"dream",    name:"Onírico",     sheet:1, row:4, color:"#ec4899" },
];

// Map any biome id to a set id (by theme).
export const BIOME_TO_SET: Record<string, string> = {
  meadow:"nature", forest:"nature", jungle:"nature", swamp:"nature",
  seraph_grove:"nature", venom_grove:"nature", cursed_orchard:"nature", mire:"nature",
  desert:"desert", crimson_dunes:"desert", honeycomb_hive:"desert",
  bone_wastes:"desert", ashen:"desert", glass_desert:"desert",
  tundra:"frost", frostpeak:"frost", moonshade:"frost", mirror_lake:"frost",
  volcano:"volcanic", emberlands:"volcanic", magma_core:"volcanic",
  bloodmoon:"volcanic", stormforge:"volcanic",
  abyss:"void", void_gate:"void", astral_void:"void", nightmare_gate:"void",
  gloomwood:"void", cosmic_bazaar:"void",
  ruins:"deep", abyss_sea:"deep", sunken_temple:"deep", obsidian_reef:"deep", plasma_bog:"deep",
  crystal:"prism", shardveil:"prism", runes:"prism", titan_ruins:"prism",
  sky:"celest", celestial:"celest", sunspire:"celest", thunderveil:"celest", neon_wastes:"celest",
  mycelium:"clock", clockwork:"clock",
  dreamweave:"dream",
  main_city:"nature",
};
export function setForBiome(biomeId: string): BiomeSet {
  const sid = BIOME_TO_SET[biomeId] ?? "nature";
  return BIOME_SETS.find(s => s.id === sid) ?? BIOME_SETS[0];
}

export interface EquipItem {
  uid: number;
  slot: EquipSlot;
  setId: string;      // BiomeSet.id
  rarity: Rarity;
  level: number;      // monster level at drop; scales stats
}

// Small stat bonuses – deliberately restrained so equipment does not
// trivialize the game. Values are ADDED across all equipped items.
export function itemStats(it: EquipItem): { dmg: number; hp: number; def: number } {
  // Slot weight: rings/necklace lighter, armor heavier.
  const heavySlots: EquipSlot[] = ["chest","helmet","pants"];
  const light: EquipSlot[] = ["ring","necklace","rune"];
  const w = heavySlots.includes(it.slot) ? 1.4
          : light.includes(it.slot)     ? 0.7 : 1.0;
  const r = it.rarity;
  return {
    dmg: Math.round((0.5 + r * 0.6) * w),        // 0.5 -> 3.5 per item
    hp:  Math.round((2   + r * 2)   * w),        // 2   -> 14 per item
    def: Math.round((0.4 + r * 0.5) * w * 100)/100,
  };
}

export function equipmentBonuses(equipped: Partial<Record<EquipSlot, EquipItem>>) {
  let dmg = 0, hp = 0, def = 0;
  for (const s of EQUIP_SLOTS) {
    const it = equipped[s];
    if (!it) continue;
    const st = itemStats(it);
    dmg += st.dmg; hp += st.hp; def += st.def;
  }
  return { dmg, hp, def };
}

// URLs for asset importers in the engine.
export const EQUIP_SHEET_URLS = [equipSheet1Url, equipSheet2Url] as const;
export const GEMS_URL = gemsUrl;

// ---- Item factory ----
let ITEM_UID = 1;
export function makeDropItem(biomeId: string, monsterLevel: number, rnd = Math.random): EquipItem {
  const set = setForBiome(biomeId);
  const slot = EQUIP_SLOTS[Math.floor(rnd() * EQUIP_SLOTS.length)];
  // Higher biome tier = tiny chance of dropping already-uncommon gear.
  const tier = BIOMES[biomeId]?.tier ?? 1;
  let rarity: Rarity = 0;
  const roll = rnd();
  if (tier >= 60 && roll < 0.05) rarity = 2;
  else if (tier >= 30 && roll < 0.10) rarity = 1;
  else if (tier >= 15 && roll < 0.06) rarity = 1;
  return { uid: ITEM_UID++, slot, setId: set.id, rarity, level: monsterLevel };
}

export function itemDisplayName(it: EquipItem): string {
  const set = BIOME_SETS.find(s => s.id === it.setId) ?? BIOME_SETS[0];
  return `${SLOT_LABEL[it.slot]} ${set.name}`;
}
