// Sistema de Runas Ancestrais
// Runas são drops ultra-raros (bosses e baús secretos da Grande Masmorra)
// que ocupam até 3 slots do jogador e concedem bônus passivos poderosos.

export type AncientRuneId =
  | "runa_fogo"
  | "runa_gelo"
  | "runa_trovao"
  | "runa_sangue"
  | "runa_ferro"
  | "runa_vento"
  | "runa_mente"
  | "runa_sombra"
  | "runa_luz"
  | "runa_terra"
  | "runa_tempo"
  | "runa_vazio";

export type AncientRuneTier = 1 | 2 | 3; // menor / maior / suprema

export type RuneBonuses = {
  dmgMult: number;       // multiplicador de dano
  defMult: number;       // multiplicador de defesa
  maxHpBonus: number;    // HP máximo adicional
  maxMpBonus: number;    // MP máximo adicional
  moveSpeedMult: number; // multiplicador de velocidade
  cooldownMult: number;  // multiplicador de cooldown de skills (menor = melhor)
  critBonus: number;     // chance crítica adicional (0..1)
  goldMult: number;      // multiplicador de ouro derrubado
  xpMult: number;        // multiplicador de XP ganho
  lifesteal: number;     // 0..1 do dano vira HP
  hpRegen: number;       // HP regenerado por segundo
  thorns: number;        // dano refletido ao atacante (fração do dano recebido)
  dropLuck: number;      // sorte de raridade extra em drops
};

export const RUNE_ZERO: RuneBonuses = {
  dmgMult: 1, defMult: 1, maxHpBonus: 0, maxMpBonus: 0,
  moveSpeedMult: 1, cooldownMult: 1, critBonus: 0,
  goldMult: 1, xpMult: 1, lifesteal: 0, hpRegen: 0, thorns: 0, dropLuck: 0,
};

export type AncientRune = {
  id: AncientRuneId;
  name: string;
  color: string;
  glyph: string;
  desc: string;
  // bônus por tier: [tier1, tier2, tier3]
  effects: [Partial<RuneBonuses>, Partial<RuneBonuses>, Partial<RuneBonuses>];
};

export const ANCIENT_RUNES: Record<AncientRuneId, AncientRune> = {
  runa_fogo: {
    id: "runa_fogo", name: "Runa do Fogo Ancestral", color: "#ff5030", glyph: "🜂",
    desc: "Dano ampliado e chamas queimam mais fundo.",
    effects: [{ dmgMult: 1.10 }, { dmgMult: 1.18, critBonus: 0.03 }, { dmgMult: 1.30, critBonus: 0.06 }],
  },
  runa_gelo: {
    id: "runa_gelo", name: "Runa do Gelo Perpétuo", color: "#80c0ff", glyph: "🜄",
    desc: "Defesa gelada e reflexo cortante contra atacantes.",
    effects: [{ defMult: 1.15, thorns: 0.05 }, { defMult: 1.25, thorns: 0.10 }, { defMult: 1.40, thorns: 0.18 }],
  },
  runa_trovao: {
    id: "runa_trovao", name: "Runa do Trovão", color: "#f0f060", glyph: "⚡",
    desc: "Velocidade sobre-humana e cooldowns menores.",
    effects: [{ moveSpeedMult: 1.10, cooldownMult: 0.92 }, { moveSpeedMult: 1.18, cooldownMult: 0.85 }, { moveSpeedMult: 1.30, cooldownMult: 0.75 }],
  },
  runa_sangue: {
    id: "runa_sangue", name: "Runa de Sangue", color: "#c02040", glyph: "🩸",
    desc: "Drena vida a cada golpe.",
    effects: [{ lifesteal: 0.05 }, { lifesteal: 0.10, maxHpBonus: 40 }, { lifesteal: 0.18, maxHpBonus: 100 }],
  },
  runa_ferro: {
    id: "runa_ferro", name: "Runa de Ferro", color: "#a0a0b0", glyph: "🛡",
    desc: "HP máximo aumentado e couraça grossa.",
    effects: [{ maxHpBonus: 60, defMult: 1.08 }, { maxHpBonus: 140, defMult: 1.15 }, { maxHpBonus: 280, defMult: 1.28 }],
  },
  runa_vento: {
    id: "runa_vento", name: "Runa do Vento", color: "#a0f0d0", glyph: "🍃",
    desc: "Corridas ligeiras e MP ampliado.",
    effects: [{ moveSpeedMult: 1.08, maxMpBonus: 30 }, { moveSpeedMult: 1.14, maxMpBonus: 70 }, { moveSpeedMult: 1.22, maxMpBonus: 140 }],
  },
  runa_mente: {
    id: "runa_mente", name: "Runa da Mente Astral", color: "#a060f0", glyph: "🧠",
    desc: "Mais XP e cooldowns reduzidos.",
    effects: [{ xpMult: 1.15, cooldownMult: 0.95 }, { xpMult: 1.30, cooldownMult: 0.88 }, { xpMult: 1.60, cooldownMult: 0.78 }],
  },
  runa_sombra: {
    id: "runa_sombra", name: "Runa da Sombra", color: "#4020a0", glyph: "☾",
    desc: "Golpes críticos das trevas.",
    effects: [{ critBonus: 0.05, dmgMult: 1.05 }, { critBonus: 0.10, dmgMult: 1.12 }, { critBonus: 0.18, dmgMult: 1.22 }],
  },
  runa_luz: {
    id: "runa_luz", name: "Runa da Luz Sagrada", color: "#fff0a0", glyph: "☀",
    desc: "Regeneração de vida e defesa sagrada.",
    effects: [{ hpRegen: 1, defMult: 1.05 }, { hpRegen: 2.5, defMult: 1.12 }, { hpRegen: 5, defMult: 1.22 }],
  },
  runa_terra: {
    id: "runa_terra", name: "Runa da Terra", color: "#8a6030", glyph: "⛰",
    desc: "Corpo resistente e reflexo de dano.",
    effects: [{ defMult: 1.12, maxHpBonus: 40 }, { defMult: 1.22, maxHpBonus: 100, thorns: 0.08 }, { defMult: 1.38, maxHpBonus: 220, thorns: 0.16 }],
  },
  runa_tempo: {
    id: "runa_tempo", name: "Runa do Tempo", color: "#c0ffff", glyph: "⧗",
    desc: "Cooldowns muito menores.",
    effects: [{ cooldownMult: 0.88 }, { cooldownMult: 0.78 }, { cooldownMult: 0.65 }],
  },
  runa_vazio: {
    id: "runa_vazio", name: "Runa do Vazio", color: "#603080", glyph: "◉",
    desc: "Sorte extrema em drops raros.",
    effects: [{ dropLuck: 10, goldMult: 1.15 }, { dropLuck: 25, goldMult: 1.30 }, { dropLuck: 60, goldMult: 1.60 }],
  },
};

export type OwnedRune = {
  runeId: AncientRuneId;
  tier: AncientRuneTier;
  uid: string;
};

export const MAX_EQUIPPED_RUNES = 3;

// Concede uma runa aleatória proporcional à dificuldade (andar da masmorra
// ou nível do chefe). Retorna null se não passar no gate de raridade.
export function rollAncientRune(power: number): OwnedRune | null {
  // Chances baseline muito baixas — runas são reliquias.
  // power ~ 0..100 (grand floor) ou nível/10
  const chance = 0.03 + Math.min(0.12, power * 0.002);
  if (Math.random() > chance) return null;
  const ids = Object.keys(ANCIENT_RUNES) as AncientRuneId[];
  const runeId = ids[Math.floor(Math.random() * ids.length)];
  // Tier: quanto mais fundo, mais chance de tier alto (raríssimo mesmo assim)
  const r = Math.random() * 100;
  let tier: AncientRuneTier = 1;
  if (r < Math.min(35, power * 0.4)) tier = 2;
  if (r < Math.min(6, power * 0.08)) tier = 3;
  return { runeId, tier, uid: `rune_${Date.now()}_${Math.floor(Math.random() * 100000)}` };
}

export function aggregateRuneBonuses(equipped: OwnedRune[]): RuneBonuses {
  const acc: RuneBonuses = { ...RUNE_ZERO };
  for (const r of equipped) {
    const rune = ANCIENT_RUNES[r.runeId];
    if (!rune) continue;
    const eff = rune.effects[r.tier - 1] ?? {};
    // multiplicadores acumulam multiplicativamente para dmg/def/speed;
    // aditivos para HP/MP/regen/crit/etc.
    if (eff.dmgMult != null) acc.dmgMult *= eff.dmgMult;
    if (eff.defMult != null) acc.defMult *= eff.defMult;
    if (eff.moveSpeedMult != null) acc.moveSpeedMult *= eff.moveSpeedMult;
    if (eff.cooldownMult != null) acc.cooldownMult *= eff.cooldownMult;
    if (eff.goldMult != null) acc.goldMult *= eff.goldMult;
    if (eff.xpMult != null) acc.xpMult *= eff.xpMult;
    if (eff.maxHpBonus != null) acc.maxHpBonus += eff.maxHpBonus;
    if (eff.maxMpBonus != null) acc.maxMpBonus += eff.maxMpBonus;
    if (eff.critBonus != null) acc.critBonus += eff.critBonus;
    if (eff.lifesteal != null) acc.lifesteal += eff.lifesteal;
    if (eff.hpRegen != null) acc.hpRegen += eff.hpRegen;
    if (eff.thorns != null) acc.thorns += eff.thorns;
    if (eff.dropLuck != null) acc.dropLuck += eff.dropLuck;
  }
  return acc;
}

export function runeTierLabel(tier: AncientRuneTier): string {
  return tier === 1 ? "Menor" : tier === 2 ? "Maior" : "Suprema";
}
