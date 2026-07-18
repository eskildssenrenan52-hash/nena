// Bridge between the React overlay state (inventory / equipped items / active
// pet / battle-pass claims / character skills / gear sockets) and the canvas
// game state (Player stats, gold, active pet AI).

import { ALL_ITEMS, type Item } from "./items";
import { PETS, type Pet } from "./pets";
import { getOverlayState, setOverlayState } from "./store";
import { BATTLE_PASS } from "./battlePass";
import {
  getActiveCharacter,
  grantSkillXp,
  grantActiveClassXp,
  grantPlayerXp,
  type SkillKey,
} from "./skills";
import { ANCIENT_RUNES } from "@/game/ancientRunes";
import { getActiveGame } from "@/game/host";

export interface CombatBonuses {
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  petAttack: number;
  petDefense: number;
  petHp: number;
  speedBonus?: number;
  critBonus?: number;
  xpBonus?: number;
  goldBonus?: number;
  lifeStealBonus?: number;
}

let itemIndex: Map<string, Item> | null = null;
function itemById(id: string) {
  if (!itemIndex) itemIndex = new Map(ALL_ITEMS.map((i) => [i.id, i]));
  return itemIndex.get(id);
}

let petIndex: Map<string, Pet> | null = null;
export function petById(id: string) {
  if (!petIndex) petIndex = new Map(PETS.map((p) => [p.id, p]));
  return petIndex.get(id);
}

// Sum the flat combat bonuses of runes socketed into currently-equipped items.
// Uses the active character's socket map + the game player's owned rune list.
function socketedBonuses(equipped: Record<string, string | undefined>) {
  const c = getActiveCharacter();
  const g = getActiveGame();
  if (!g) return { attack: 0, defense: 0, hp: 0, mp: 0 };
  const owned = new Map(g.player.runes.map((r) => [r.uid, r]));
  let attack = 0, defense = 0, hp = 0, mp = 0;
  for (const itemId of Object.values(equipped)) {
    if (!itemId) continue;
    const uids = c.sockets[itemId] || [];
    for (const uid of uids) {
      const r = owned.get(uid);
      if (!r) continue;
      const info = ANCIENT_RUNES[r.runeId];
      const eff = info.effects[r.tier - 1] ?? {};
      // Convert some rune effects into flat combat bonuses for the equipped item.
      if (eff.maxHpBonus) hp += Math.floor(eff.maxHpBonus / 2);
      if (eff.maxMpBonus) mp += Math.floor(eff.maxMpBonus / 2);
      if (eff.dmgMult) attack += Math.floor((eff.dmgMult - 1) * 20);
      if (eff.defMult) defense += Math.floor((eff.defMult - 1) * 20);
    }
  }
  return { attack, defense, hp, mp };
}

export function getOverlayCombatBonuses(): CombatBonuses {
  const s = getOverlayState();
  let attack = 0, defense = 0, hp = 0, mp = 0;
  
  let speedBonus = 0;
  let critBonus = 0;
  let xpBonus = 0;
  let goldBonus = 0;
  let lifeStealBonus = 0;

  let ch: any = null;
  try {
    ch = getActiveCharacter();
  } catch { /* skills store not ready */ }

  for (const [slot, id] of Object.entries(s.equipped)) {
    if (!id) continue;
    const it = itemById(id);
    if (!it) continue;
    attack += Math.floor(it.attack / 12);
    defense += Math.floor(it.defense / 12);
    hp += Math.floor(it.hp / 12);
    mp += Math.floor(it.mp / 12);

    if (ch) {
      // Add +1 to +20 enchants
      const enchantLvl = ch.enchants[id] || 0;
      if (enchantLvl > 0) {
        if (slot === "weapon") {
          attack += enchantLvl * 15;
        } else {
          defense += enchantLvl * 15;
          hp += enchantLvl * 40;
        }
      }

      // Add rerolled properties
      const rr = ch.rerolledStats[id];
      if (rr) {
        if (rr.speed) speedBonus += rr.speed;
        if (rr.crit) critBonus += rr.crit;
        if (rr.xp) xpBonus += rr.xp;
        if (rr.gold) goldBonus += rr.gold;
        if (rr.lifeSteal) lifeStealBonus += rr.lifeSteal;
      }
    }
  }
  const sock = socketedBonuses(s.equipped);
  attack += Math.floor(sock.attack / 3);
  defense += Math.floor(sock.defense / 3);
  hp += Math.floor(sock.hp / 3);
  mp += Math.floor(sock.mp / 3);
  // Defense skill grants flat mitigation — rewards being hit across all classes.
  if (ch) {
    defense += ch.skills.defense.level;
  }
  let petAttack = 0, petDefense = 0, petHp = 0;
  if (s.activePet) {
    const p = petById(s.activePet);
    if (p) { petAttack = p.attack; petDefense = p.defense; petHp = p.hp; }
  }
  return {
    attack,
    defense: defense + Math.floor(petDefense * 0.5),
    hp: hp + Math.floor(petHp * 0.5),
    mp,
    petAttack, petDefense, petHp,
    speedBonus,
    critBonus,
    xpBonus,
    goldBonus,
    lifeStealBonus,
  };
}

// -------- Skill hooks (called from the canvas game loop) --------

// Called when the player kills an enemy. Awards XP to the active class,
// the general "player" level, and the weapon skill matching the class.
export function onEnemyKilled(cls: string, level: number, isBoss: boolean) {
  const skill: SkillKey =
    cls === "magic" || cls === "mage" ? "magic"
    : cls === "ranger" || cls === "ranged" || cls === "rogue" ? "distance"
    : "melee";
  const base = level * (isBoss ? 20 : 4);
  grantSkillXp(skill, base);
  grantActiveClassXp(base);
  // General player level is intentionally slower (1/4).
  grantPlayerXp(Math.max(1, Math.floor(base / 4)));
}

// Called when the player is hit by an enemy attack (before mitigation).
export function onPlayerHit(dmg: number) {
  grantSkillXp("defense", Math.max(2, Math.floor(dmg * 0.6)));
}

export function onMiningTick(oreLevel: number) {
  grantSkillXp("mining", 4 + oreLevel);
}

// -------- Reward queue --------

export type QueuedReward =
  | { kind: "gold"; amount: number }
  | { kind: "gem"; amount: number }
  | { kind: "item"; rarity: "rare" | "epic" | "legendary" | "mythic" }
  | { kind: "pet"; petId?: string }
  | { kind: "skin"; label: string }
  | { kind: "xp_boost"; amount: number }
  | { kind: "chest"; amount: number };

const rewardQueue: QueuedReward[] = [];
export function enqueueReward(r: QueuedReward) { rewardQueue.push(r); }
export function drainRewardQueue(): QueuedReward[] {
  const out = rewardQueue.slice();
  rewardQueue.length = 0;
  return out;
}

function randomItemIdOfRarity(rarity: string): string | null {
  const pool = ALL_ITEMS.filter((i) => i.rarity === rarity);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export function claimAndQueuePassReward(level: number, premium: boolean) {
  const s = getOverlayState();
  const claimedList = premium ? s.claimedPremium : s.claimedFree;
  if (claimedList.includes(level)) return;
  const tier = BATTLE_PASS.find((t) => t.level === level);
  if (!tier) return;
  const reward = premium ? tier.premium : tier.free;
  if (premium && !s.hasPremium) return;
  const key = premium ? "claimedPremium" : "claimedFree";
  setOverlayState((cs) => ({ ...cs, [key]: [...cs[key], level] } as typeof cs));
  switch (reward.kind) {
    case "gold": enqueueReward({ kind: "gold", amount: reward.amount ?? 0 }); break;
    case "gem":  setOverlayState((cs) => ({ ...cs, gems: cs.gems + (reward.amount ?? 0) })); break;
    case "item": {
      const rarity = premium ? (level >= 60 ? "legendary" : "epic") : "rare";
      const id = randomItemIdOfRarity(rarity);
      if (id) setOverlayState((cs) => ({ ...cs, inventory: [...cs.inventory, id] }));
      break;
    }
    case "pet": {
      const locked = PETS.find((p) => !s.unlockedPets.includes(p.id));
      const petId = locked?.id ?? "pet-30";
      setOverlayState((cs) => cs.unlockedPets.includes(petId) ? cs : { ...cs, unlockedPets: [...cs.unlockedPets, petId] });
      break;
    }
    case "chest": {
      const count = reward.amount ?? 1;
      const ids: string[] = [];
      for (let i = 0; i < count; i++) { const id = randomItemIdOfRarity("rare"); if (id) ids.push(id); }
      if (ids.length) setOverlayState((cs) => ({ ...cs, inventory: [...cs.inventory, ...ids] }));
      enqueueReward({ kind: "gold", amount: 200 * count });
      break;
    }
    case "skin": setOverlayState((cs) => ({ ...cs, gems: cs.gems + 150 })); break;
    default: break;
  }
}
