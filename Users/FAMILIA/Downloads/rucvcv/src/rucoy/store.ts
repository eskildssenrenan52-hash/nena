// Local persistent state for the Rucoy-style overlay (inventory, equipment,
// unlocked pets, claimed pass tiers). Independent from the canvas game state.

import { useEffect, useState } from "react";
import { ALL_ITEMS, type Item, type ItemSlot, SLOT_ORDER } from "./items";
import { PETS } from "./pets";

const KEY = "rucoy-overlay-v1";

export interface CustomizationState {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  helmetStyle: string;
  helmetColor: string;
  armorStyle: string;
  armorColor: string;
  weaponStyle: string;
  shieldStyle: string;
  capeStyle: string;
  capeColor: string;
  trailEffect: string;
  attackAnimation: string;
  title: string;
  badge: string;
  petAura: string;
  victoryPose: string;
  walkSound: string;
  deathAnimation: string;
}

export interface OverlayState {
  inventory: string[];              // item ids
  equipped: Partial<Record<ItemSlot, string>>; // slot -> item id
  unlockedPets: string[];           // pet ids
  activePet: string | null;
  claimedFree: number[];            // pass levels claimed (free)
  claimedPremium: number[];         // pass levels claimed (premium)
  hasPremium: boolean;
  gems: number;
  trophies: number;
  claimedTrophyMilestones: number[];
  customization: CustomizationState;
  unlockedCustomizations: string[];
  language: "pt" | "en";
  activeModal: string | null;
}

const DEFAULT: OverlayState = (() => {
  // Give the player a nice starter kit: 1 item per slot + a few extras.
  const starter: string[] = [];
  for (const slot of SLOT_ORDER) {
    const list = ALL_ITEMS.filter((i) => i.slot === slot).slice(0, 3);
    for (const it of list) starter.push(it.id);
  }
  return {
    inventory: starter,
    equipped: {},
    unlockedPets: [PETS[0].id, PETS[4].id, PETS[26].id],
    activePet: PETS[0].id,
    claimedFree: [],
    claimedPremium: [],
    hasPremium: false,
    gems: 250,
    trophies: 0,
    claimedTrophyMilestones: [],
    customization: {
      skinColor: "Pele Padrão",
      hairStyle: "Curto",
      hairColor: "Castanho",
      eyeColor: "Azul",
      helmetStyle: "Nenhum",
      helmetColor: "Padrão",
      armorStyle: "Nenhum",
      armorColor: "Padrão",
      weaponStyle: "Nenhum",
      shieldStyle: "Nenhum",
      capeStyle: "Nenhuma",
      capeColor: "Padrão",
      trailEffect: "Nenhum",
      attackAnimation: "Corte Rápido",
      title: "Recruta de Asterion",
      badge: "Iniciante",
      petAura: "Nenhuma",
      victoryPose: "Heroica",
      walkSound: "Armadura Leve",
      deathAnimation: "Desvanecer Cósmico",
    },
    unlockedCustomizations: [
      "skinColor_Pele Padrão",
      "hairStyle_Curto",
      "hairColor_Castanho",
      "eyeColor_Azul",
      "helmetStyle_Nenhum",
      "helmetColor_Padrão",
      "armorStyle_Nenhum",
      "armorColor_Padrão",
      "weaponStyle_Nenhum",
      "shieldStyle_Nenhum",
      "capeStyle_Nenhuma",
      "capeColor_Padrão",
      "trailEffect_Nenhum",
      "attackAnimation_Corte Rápido",
      "title_Recruta de Asterion",
      "badge_Iniciante",
      "petAura_Nenhuma",
      "victoryPose_Heroica",
      "walkSound_Armadura Leve",
      "deathAnimation_Desvanecer Cósmico",
    ],
    language: "pt",
    activeModal: null,
  };
})();

function load(): OverlayState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...parsed,
      customization: { ...DEFAULT.customization, ...(parsed.customization || {}) },
      unlockedCustomizations: parsed.unlockedCustomizations || DEFAULT.unlockedCustomizations,
      activeModal: null,
    };
  } catch {
    return DEFAULT;
  }
}

function save(s: OverlayState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

type Listener = (s: OverlayState) => void;
const listeners = new Set<Listener>();
let current: OverlayState = load();

export function getOverlayState() {
  return current;
}
export function setOverlayState(patch: Partial<OverlayState> | ((s: OverlayState) => OverlayState)) {
  current = typeof patch === "function" ? patch(current) : { ...current, ...patch };
  save(current);
  for (const l of listeners) l(current);
}

export function useOverlayState() {
  const [s, set] = useState(DEFAULT);
  useEffect(() => {
    set(current);
    const l: Listener = (n) => set(n);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}

export function equipItem(itemId: string) {
  const it: Item | undefined = ALL_ITEMS.find((x) => x.id === itemId);
  if (!it) return;
  setOverlayState((s) => ({
    ...s,
    equipped: { ...s.equipped, [it.slot]: itemId },
  }));
}

export function unequipSlot(slot: ItemSlot) {
  setOverlayState((s) => {
    const next = { ...s.equipped };
    delete next[slot];
    return { ...s, equipped: next };
  });
}

// Sell price for an item, in gold.
// Weighted by rarity and level, scales with total stat power.
const RARITY_MULT: Record<Item["rarity"], number> = {
  common: 1,
  uncommon: 2,
  rare: 4,
  epic: 9,
  legendary: 20,
  mythic: 45,
};
export function itemSellPrice(it: Item): number {
  const power = it.attack + it.defense + Math.floor(it.hp / 4) + Math.floor(it.mp / 4);
  return Math.max(5, Math.floor((5 + it.level * 2 + power) * RARITY_MULT[it.rarity]));
}

// Sell an item from the inventory. Enqueues gold for the game loop to
// hand to the live Player. If the item is currently equipped, unequip it
// from that slot first. Returns the price paid, or 0 if it didn't exist.
import { enqueueReward } from "./bridge";
export function sellItem(itemId: string): number {
  const it: Item | undefined = ALL_ITEMS.find((x) => x.id === itemId);
  if (!it) return 0;
  const price = itemSellPrice(it);
  setOverlayState((s) => {
    const idx = s.inventory.indexOf(itemId);
    if (idx < 0) return s;
    const inventory = [...s.inventory];
    inventory.splice(idx, 1);
    const equipped = { ...s.equipped };
    if (equipped[it.slot] === itemId) delete equipped[it.slot];
    return { ...s, inventory, equipped };
  });
  enqueueReward({ kind: "gold", amount: price });
  return price;
}

export function setActivePet(id: string | null) {
  setOverlayState((s) => ({ ...s, activePet: id }));
}

export function claimPassReward(level: number, premium: boolean) {
  setOverlayState((s) => {
    const key = premium ? "claimedPremium" : "claimedFree";
    if (s[key].includes(level)) return s;
    return { ...s, [key]: [...s[key], level] } as OverlayState;
  });
}
