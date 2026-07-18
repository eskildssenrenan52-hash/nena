// Brawl Stars-style battle pass. Rewards every 10 levels (10, 20, ..., 100).

export type RewardKind = "gold" | "gem" | "item" | "pet" | "xp_boost" | "chest" | "skin";

export interface PassReward {
  level: number;
  free: { kind: RewardKind; label: string; amount?: number; icon: string };
  premium: { kind: RewardKind; label: string; amount?: number; icon: string };
}

export const BATTLE_PASS: PassReward[] = Array.from({ length: 10 }, (_, i) => {
  const level = (i + 1) * 10;
  const tier = i + 1;
  return {
    level,
    free: {
      kind: i % 2 === 0 ? "gold" : "chest",
      label: i % 2 === 0 ? `${500 * tier} Ouro` : `Baú comum x${tier}`,
      amount: i % 2 === 0 ? 500 * tier : tier,
      icon: i % 2 === 0 ? "🪙" : "📦",
    },
    premium:
      tier === 10
        ? { kind: "pet", label: "Pet Mítico Exclusivo", icon: "🐉" }
        : tier % 3 === 0
          ? { kind: "skin", label: `Skin Épica Tier ${tier}`, icon: "👗" }
          : tier % 2 === 0
            ? { kind: "item", label: `Item Lendário Tier ${tier}`, icon: "⚔️" }
            : { kind: "gem", label: `${100 * tier} Gemas`, amount: 100 * tier, icon: "💎" },
  };
});

export const PASS_SEASON = {
  name: "Temporada 1: Aurora Eterna",
  endsIn: "28 dias",
};
