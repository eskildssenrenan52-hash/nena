// Skills, characters (multi-save), overall player level, gear enchantments
// (rune sockets on weapon/armor) and fishing state. Persists to
// localStorage independently from the canvas game save so switching classes
// / characters keeps every character's progress intact.

import { useEffect, useState } from "react";

export type SkillKey = "melee" | "distance" | "magic" | "defense" | "mining" | "fishing";
export type ClassId =
  | "warrior" | "mage" | "rogue" | "cleric" | "ranger"
  | "berserker" | "spellblade" | "shaman" | "templar" | "corsair"
  | "pyromancer" | "cryomancer" | "stormcaller" | "geomancer" | "chronomancer"
  | "beastmaster" | "runesmith" | "gladiator" | "sorcerer" | "warden"
  | "duelist" | "hexblade" | "seer" | "trickster" | "voidknight"
  | "echomancer" | "symbiote";

export const SKILL_META: Record<SkillKey, { label: string; color: string; icon: string; desc: string }> = {
  melee:    { label: "Corpo-a-Corpo", color: "#ef4444", icon: "⚔", desc: "Sobe golpeando inimigos com armas corpo-a-corpo." },
  distance: { label: "Distância",     color: "#a855f7", icon: "🏹", desc: "Sobe usando armas à distância como arcos." },
  magic:    { label: "Magia",         color: "#3b82f6", icon: "✦", desc: "Sobe conjurando feitiços em inimigos." },
  defense:  { label: "Defesa",        color: "#60a5fa", icon: "🛡", desc: "Sobe quando você é atingido por inimigos." },
  mining:   { label: "Mineração",     color: "#a3a3a3", icon: "⛏", desc: "Sobe quebrando veios de minério." },
  fishing:  { label: "Pesca",         color: "#22d3ee", icon: "🎣", desc: "Sobe pescando em beiras de rio nos biomas." },
};

export const CLASS_META: Record<ClassId, { label: string; color: string }> = {
  warrior: { label: "Guerreiro", color: "#ef4444" },
  mage:    { label: "Mago",      color: "#3b82f6" },
  rogue:   { label: "Ladino",    color: "#10b981" },
  cleric:  { label: "Clérigo",   color: "#f97316" },
  ranger:  { label: "Arqueiro",  color: "#a855f7" },
  berserker:    { label: "Berserker",       color: "#e11d48" },
  spellblade:   { label: "Espadachim Arcano", color: "#8b5cf6" },
  shaman:       { label: "Xamã",            color: "#10b981" },
  templar:      { label: "Templário",       color: "#f59e0b" },
  corsair:      { label: "Corsário",        color: "#0284c7" },
  pyromancer:   { label: "Piromante",       color: "#dc2626" },
  cryomancer:   { label: "Criomante",       color: "#0ea5e9" },
  stormcaller:  { label: "Invocador Tempestade", color: "#facc15" },
  geomancer:    { label: "Geomante",        color: "#78716c" },
  chronomancer: { label: "Cronomante",      color: "#7dd3fc" },
  beastmaster:  { label: "Mestre das Feras", color: "#a16207" },
  runesmith:    { label: "Ferreiro Rúnico", color: "#c084fc" },
  gladiator:    { label: "Gladiador",       color: "#facc15" },
  sorcerer:     { label: "Feiticeiro",      color: "#d946ef" },
  warden:       { label: "Guardião da Mata", color: "#4d7c0f" },
  duelist:      { label: "Duelista",        color: "#e11d48" },
  hexblade:     { label: "Espada Maldita",  color: "#7c3aed" },
  seer:         { label: "Vidente",         color: "#38bdf8" },
  trickster:    { label: "Trapaceiro",      color: "#22c55e" },
  voidknight:   { label: "Cav. do Vazio",   color: "#1e1b4b" },
  echomancer:   { label: "Ecomante do Paradoxo", color: "#22d3ee" },
  symbiote:     { label: "Simbionte Voraz", color: "#65a30d" },
};

export interface SkillProgress { level: number; xp: number; }

export interface SavedCharacter {
  id: string;
  name: string;
  createdAt: number;
  // Level per class; player can switch active class freely.
  classLevels: Record<ClassId, SkillProgress>;
  activeClass: ClassId;
  // Overall player level (kill-fed, slower curve). "General" level.
  playerLevel: number;
  playerXp: number;
  // Individual skill progress.
  skills: Record<SkillKey, SkillProgress>;
  // Gear enchantment sockets: itemId -> array of ancient rune ids (from
  // p.runes / equippedRunes). When the item is equipped, socketed rune
  // bonuses apply — creating build decisions on which slot to enchant.
  sockets: Record<string, string[]>; // itemId -> ownedRuneId[]
  // Transmog: itemId of the appearance to render for weapon/armor slot.
  transmog: { weapon: string | null; armor: string | null };
  // Fishing progress: total fish caught, cook materials owned.
  fishing: { caught: number; materials: Record<string, number>; unlockedBaits: string[] };
  // Skin selecionada por classe (0..4, ou -1 = usa sprite base sem skin).
  classSkin: Partial<Record<ClassId, number>>;
  // +1 to +20 Enchant levels: itemId -> level
  enchants: Record<string, number>;
  // Rerolled extra stats: itemId -> StatRoll
  rerolledStats: Record<string, { speed?: number; crit?: number; xp?: number; gold?: number; lifeSteal?: number }>;
}

// XP curves.
// Skill: xp needed for next level (Runescape-flavored soft curve).
export function skillXpForLevel(level: number): number {
  // Return XP required to go from `level` to `level+1`.
  return Math.floor(50 * Math.pow(1.12, Math.max(0, level - 1)));
}
// Class: same curve as before ish, slightly slower than skill.
export function classXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.14, Math.max(0, level - 1)));
}
// Overall player level: intentionally slower — matches "demora mais para subir".
export function playerXpForLevel(level: number): number {
  return Math.floor(500 * Math.pow(1.18, Math.max(0, level - 1)));
}

const emptySkill = (): SkillProgress => ({ level: 1, xp: 0 });
const emptyClassMap = (): Record<ClassId, SkillProgress> => {
  const ids = Object.keys(CLASS_META) as ClassId[];
  const out = {} as Record<ClassId, SkillProgress>;
  for (const k of ids) out[k] = emptySkill();
  return out;
};
const emptySkillsMap = (): Record<SkillKey, SkillProgress> => ({
  melee: emptySkill(),
  distance: emptySkill(),
  magic: emptySkill(),
  defense: emptySkill(),
  mining: emptySkill(),
  fishing: emptySkill(),
});

export function makeCharacter(name: string, cls: ClassId): SavedCharacter {
  return {
    id: `char-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    name: name || "Herói",
    createdAt: Date.now(),
    classLevels: emptyClassMap(),
    activeClass: cls,
    playerLevel: 1,
    playerXp: 0,
    skills: emptySkillsMap(),
    sockets: {},
    transmog: { weapon: null, armor: null },
    fishing: { caught: 0, materials: {}, unlockedBaits: ["worm"] },
    classSkin: {},
    enchants: {},
    rerolledStats: {},
  };
}

// -------- Persistent state --------

const KEY = "rucoy-skills-v1";

interface Store {
  characters: SavedCharacter[];
  activeCharacterId: string;
}

function makeDefault(): Store {
  const first = makeCharacter("Aventureiro", "warrior");
  return { characters: [first], activeCharacterId: first.id };
}

function load(): Store {
  if (typeof window === "undefined") return makeDefault();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return makeDefault();
    const parsed = JSON.parse(raw) as Store;
    // Migrate: fill missing skills/classes on old saves.
    for (const c of parsed.characters) {
      c.classLevels = { ...emptyClassMap(), ...(c.classLevels || {}) };
      c.skills      = { ...emptySkillsMap(), ...(c.skills || {}) };
      c.sockets     = c.sockets || {};
      c.transmog    = c.transmog || { weapon: null, armor: null };
      c.fishing     = c.fishing || { caught: 0, materials: {}, unlockedBaits: ["worm"] };
      c.classSkin   = c.classSkin || {};
      c.enchants    = c.enchants || {};
      c.rerolledStats = c.rerolledStats || {};
    }
    if (!parsed.characters.length) return makeDefault();
    if (!parsed.characters.find((c) => c.id === parsed.activeCharacterId)) {
      parsed.activeCharacterId = parsed.characters[0].id;
    }
    return parsed;
  } catch { return makeDefault(); }
}

function save(s: Store) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

let current: Store = load();
type Listener = (s: Store) => void;
const listeners = new Set<Listener>();

export function getSkillsStore(): Store { return current; }
export function setSkillsStore(patch: Partial<Store> | ((s: Store) => Store)) {
  current = typeof patch === "function" ? patch(current) : { ...current, ...patch };
  save(current);
  for (const l of listeners) l(current);
}

export function useSkillsStore(): Store {
  const [s, setS] = useState<Store>(current);
  useEffect(() => {
    setS(current);
    const l: Listener = (n) => setS(n);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return s;
}

export function getActiveCharacter(): SavedCharacter {
  const s = current;
  return s.characters.find((c) => c.id === s.activeCharacterId) ?? s.characters[0];
}

function updateActive(mut: (c: SavedCharacter) => SavedCharacter) {
  setSkillsStore((s) => ({
    ...s,
    characters: s.characters.map((c) => (c.id === s.activeCharacterId ? mut(c) : c)),
  }));
}

// -------- Character operations --------

export function createCharacter(name: string, cls: ClassId, activate = true) {
  const c = makeCharacter(name, cls);
  setSkillsStore((s) => ({
    characters: [...s.characters, c],
    activeCharacterId: activate ? c.id : s.activeCharacterId,
  }));
  return c;
}
export function deleteCharacter(id: string) {
  setSkillsStore((s) => {
    const remaining = s.characters.filter((c) => c.id !== id);
    const list = remaining.length ? remaining : [makeCharacter("Aventureiro", "warrior")];
    const active = list.some((c) => c.id === s.activeCharacterId) ? s.activeCharacterId : list[0].id;
    return { characters: list, activeCharacterId: active };
  });
}
export function setClassSkin(cls: ClassId, skin: number) {
  updateActive((c) => ({ ...c, classSkin: { ...c.classSkin, [cls]: skin } }));
}
export function switchCharacter(id: string) {
  setSkillsStore((s) => ({ ...s, activeCharacterId: id }));
}
export function switchActiveClass(cls: ClassId) {
  updateActive((c) => ({ ...c, activeClass: cls }));
}
export function renameActive(name: string) {
  updateActive((c) => ({ ...c, name }));
}

// -------- XP grants (called from the game via bridge) --------

function grantXpTo(prog: SkillProgress, amount: number, curve: (l: number) => number): SkillProgress {
  let level = prog.level;
  let xp = prog.xp + amount;
  while (xp >= curve(level)) {
    xp -= curve(level);
    level += 1;
    if (level > 99) { level = 99; xp = 0; break; }
  }
  return { level, xp };
}

export function grantSkillXp(skill: SkillKey, amount: number) {
  updateActive((c) => ({ ...c, skills: { ...c.skills, [skill]: grantXpTo(c.skills[skill], amount, skillXpForLevel) } }));
}
export function grantActiveClassXp(amount: number) {
  updateActive((c) => {
    const cur = c.classLevels[c.activeClass];
    return { ...c, classLevels: { ...c.classLevels, [c.activeClass]: grantXpTo(cur, amount, classXpForLevel) } };
  });
}
export function grantPlayerXp(amount: number) {
  updateActive((c) => {
    let level = c.playerLevel;
    let xp = c.playerXp + amount;
    while (xp >= playerXpForLevel(level)) {
      xp -= playerXpForLevel(level);
      level += 1;
      if (level > 200) { level = 200; xp = 0; break; }
    }
    return { ...c, playerLevel: level, playerXp: xp };
  });
}

// -------- Gear sockets --------

// Max sockets per item, driven by rarity of the underlying item.
export function maxSocketsForRarity(rarity: string): number {
  return ({ common: 1, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 } as Record<string, number>)[rarity] ?? 1;
}
export function socketRune(itemId: string, runeInstanceId: string): boolean {
  const c = getActiveCharacter();
  const existing = c.sockets[itemId] || [];
  if (existing.includes(runeInstanceId)) return false;
  updateActive((cc) => ({ ...cc, sockets: { ...cc.sockets, [itemId]: [...(cc.sockets[itemId] || []), runeInstanceId] } }));
  return true;
}
export function unsocketRune(itemId: string, runeInstanceId: string) {
  updateActive((cc) => ({
    ...cc,
    sockets: { ...cc.sockets, [itemId]: (cc.sockets[itemId] || []).filter((r) => r !== runeInstanceId) },
  }));
}

// -------- Transmog --------

export function setTransmog(slot: "weapon" | "armor", itemId: string | null) {
  updateActive((cc) => ({ ...cc, transmog: { ...cc.transmog, [slot]: itemId } }));
}

// -------- Fishing --------

export function recordFishCatch(materialId: string, materialName: string) {
  updateActive((c) => {
    const mats = { ...c.fishing.materials };
    mats[materialId] = (mats[materialId] || 0) + 1;
    return { ...c, fishing: { ...c.fishing, caught: c.fishing.caught + 1, materials: mats } };
  });
  grantSkillXp("fishing", 12 + Math.floor(Math.random() * 8));
}

// -------- Blacksmith/Upgrading (+1..+20) & Rerolling --------

export function getUpgradeSuccessRate(currentLevel: number, useLuckGems: boolean): number {
  if (currentLevel >= 20) return 0;
  // Standard success rates
  let baseRate = 100;
  if (currentLevel >= 15) baseRate = 25;
  else if (currentLevel >= 10) baseRate = 45;
  else if (currentLevel >= 5) baseRate = 70;
  
  if (useLuckGems) {
    baseRate = Math.min(100, baseRate + 25);
  }
  return baseRate;
}

export function getUpgradeGoldCost(currentLevel: number): number {
  return Math.floor(1000 * Math.pow(1.35, currentLevel));
}

export function upgradeItemEnchant(itemId: string, useLuckGems: boolean): { success: boolean; newLevel: number; message: string } {
  const c = getActiveCharacter();
  const currentLevel = c.enchants[itemId] || 0;
  if (currentLevel >= 20) {
    return { success: false, newLevel: currentLevel, message: "Já está no nível máximo (+20)!" };
  }
  
  const rate = getUpgradeSuccessRate(currentLevel, useLuckGems);
  const roll = Math.random() * 100;
  const success = roll <= rate;
  
  let nextLevel = currentLevel;
  let msg = "";
  
  if (success) {
    nextLevel = currentLevel + 1;
    msg = `SUCESSO! O item foi aprimorado para +${nextLevel}! 🎉`;
  } else {
    // If fail: high-stakes drop! If level > 10, drop by 1, otherwise stays same.
    if (currentLevel > 10) {
      nextLevel = currentLevel - 1;
      msg = `FALHA! O encantamento quebrou e regrediu para +${nextLevel}. 💔`;
    } else {
      msg = `FALHA! O encantamento falhou, mas o item foi protegido e se manteve em +${currentLevel}.`;
    }
  }
  
  updateActive((cc) => {
    const enchs = { ...cc.enchants };
    enchs[itemId] = nextLevel;
    return { ...cc, enchants: enchs };
  });
  
  return { success, newLevel: nextLevel, message: msg };
}

export function rerollItemStats(itemId: string, rarity: string): { success: boolean; message: string } {
  // Rare gets 1 stat, Epic gets 2 stats, Legendary/Mythic gets 3 stats.
  let numStats = 1;
  if (rarity === "epic") numStats = 2;
  else if (rarity === "legendary" || rarity === "mythic") numStats = 3;
  
  const stats: { speed?: number; crit?: number; xp?: number; gold?: number; lifeSteal?: number } = {};
  
  // Choose random stats
  const statPool: ("speed" | "crit" | "xp" | "gold" | "lifeSteal")[] = ["speed", "crit", "xp", "gold", "lifeSteal"];
  
  for (let i = 0; i < numStats; i++) {
    const choice = statPool[Math.floor(Math.random() * statPool.length)];
    if (choice === "speed") {
      stats.speed = Math.floor(5 + Math.random() * 16); // +5 to +20
    } else if (choice === "crit") {
      stats.crit = Math.floor(1 + Math.random() * 8); // +1% to +8%
    } else if (choice === "xp") {
      stats.xp = Math.floor(3 + Math.random() * 13); // +3% to +15%
    } else if (choice === "gold") {
      stats.gold = Math.floor(5 + Math.random() * 26); // +5% to +30%
    } else if (choice === "lifeSteal") {
      stats.lifeSteal = Math.floor(1 + Math.random() * 5); // +1% to +5%
    }
  }
  
  updateActive((cc) => {
    const rStats = { ...cc.rerolledStats };
    rStats[itemId] = stats;
    return { ...cc, rerolledStats: rStats };
  });
  
  return { success: true, message: "Atributos re-rolados com sucesso! ⚡" };
}
