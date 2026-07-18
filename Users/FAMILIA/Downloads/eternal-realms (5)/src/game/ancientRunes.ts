// Sistema de Runas Ancestrais Dinâmico e Complexo
// Composto por mais de 100 Runas Únicas (105 no total) resultantes da fusão
// de 15 Elementos e 7 Focos específicos, cada uma com sinergia única.

export type AncientRuneId = string;
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
  element: string;
  focus: string;
  effects: [Partial<RuneBonuses>, Partial<RuneBonuses>, Partial<RuneBonuses>];
};

// 15 Elementos Únicos
export const RUNIC_ELEMENTS = [
  { id: "fogo", name: "Fogo", color: "#ff5522", glyph: "🜂", desc: "Força destrutiva ampliada." },
  { id: "gelo", name: "Gelo", color: "#33b0ff", glyph: "🜄", desc: "Couraça gélida de alta mitigação." },
  { id: "trovao", name: "Trovão", color: "#ffea00", glyph: "⚡", desc: "Aceleração sobrecarregada." },
  { id: "sangue", name: "Sangue", color: "#e11d48", glyph: "🩸", desc: "Vampirismo e drenagem profunda." },
  { id: "luz", name: "Luz", color: "#fbbf24", glyph: "☀", desc: "Luz sagrada de cura e vigor." },
  { id: "sombra", name: "Sombra", color: "#a855f7", glyph: "☾", desc: "Sombra letal e golpes críticos." },
  { id: "terra", name: "Terra", color: "#b45309", glyph: "⛰", desc: "Resistência sísmica inquebrável." },
  { id: "vento", name: "Vento", color: "#4ade80", glyph: "🍃", desc: "Correntes de vento ágeis." },
  { id: "tempo", name: "Tempo", color: "#22d3ee", glyph: "⧗", desc: "Manipulação temporal de cooldowns." },
  { id: "vazio", name: "Vazio", color: "#ec4899", glyph: "◉", desc: "Magnetismo de espólios cósmicos." },
  { id: "ordem", name: "Ordem", color: "#6366f1", glyph: "⚖", desc: "Harmonia ideal e sabedoria." },
  { id: "caos", name: "Caos", color: "#dc2626", glyph: "👹", desc: "Potencial caótico devastador." },
  { id: "cosmos", name: "Cosmos", color: "#14b8a6", glyph: "🌌", desc: "Poder estelar do infinito." },
  { id: "alma", name: "Alma", color: "#3b82f6", glyph: "👻", desc: "Espiritualismo vital de dreno." },
  { id: "morte", name: "Morte", color: "#64748b", glyph: "💀", desc: "Necrose fatal e murchar." }
];

// 7 Focos Únicos
export const RUNIC_FOCUSES = [
  { id: "soldado", name: "do Soldado", desc: "Garante ampliação de dano e ataque." },
  { id: "guardiao", name: "do Guardião", desc: "Garante defesa aprimorada e HP." },
  { id: "assassino", name: "do Assassino", desc: "Aumenta o índice crítico." },
  { id: "nomade", name: "do Nômade", desc: "Aumenta a velocidade de corrida." },
  { id: "alquimista", name: "do Alquimista", desc: "Amplifica ouro e sorte de drops." },
  { id: "sabio", name: "do Sábio", desc: "Amplifica o ganho de experiência." },
  { id: "vampiro", name: "do Vampiro", desc: "Concede roubo de vida e regeneração." }
];

// Construção de 105 Runas Únicas
export const ANCIENT_RUNES: Record<AncientRuneId, AncientRune> = {};

RUNIC_ELEMENTS.forEach((el) => {
  RUNIC_FOCUSES.forEach((fo) => {
    const runeId = `runa_${el.id}_${fo.id}`;
    const name = `Runa de ${el.name} ${fo.name}`;

    // Construção dos efeitos para tiers 1, 2, 3
    const effects: [Partial<RuneBonuses>, Partial<RuneBonuses>, Partial<RuneBonuses>] = [{}, {}, {}];

    for (let t = 0; t < 3; t++) {
      const mul = t === 0 ? 1.0 : t === 1 ? 1.8 : 3.0;
      const eff: Partial<RuneBonuses> = {};

      // Atribuição de efeitos baseados no Elemento
      if (el.id === "fogo") { eff.dmgMult = 1.06 + t * 0.06; }
      else if (el.id === "gelo") { eff.defMult = 1.08 + t * 0.08; eff.thorns = 0.04 * mul; }
      else if (el.id === "trovao") { eff.moveSpeedMult = 1.05 + t * 0.05; eff.cooldownMult = 0.96 - t * 0.04; }
      else if (el.id === "sangue") { eff.lifesteal = 0.03 * mul; eff.maxHpBonus = 20 * mul; }
      else if (el.id === "luz") { eff.hpRegen = 0.8 * mul; eff.maxHpBonus = 30 * mul; }
      else if (el.id === "sombra") { eff.critBonus = 0.03 + t * 0.03; eff.dmgMult = 1.03 + t * 0.03; }
      else if (el.id === "terra") { eff.defMult = 1.06 + t * 0.06; eff.maxHpBonus = 40 * mul; }
      else if (el.id === "vento") { eff.moveSpeedMult = 1.06 + t * 0.05; eff.maxMpBonus = 25 * mul; }
      else if (el.id === "tempo") { eff.cooldownMult = 0.94 - t * 0.05; }
      else if (el.id === "vazio") { eff.dropLuck = 8 * mul; eff.goldMult = 1.08 + t * 0.08; }
      else if (el.id === "ordem") { eff.xpMult = 1.08 + t * 0.08; eff.defMult = 1.04 + t * 0.03; }
      else if (el.id === "caos") { eff.dmgMult = 1.08 + t * 0.08; eff.critBonus = 0.02 + t * 0.03; }
      else if (el.id === "cosmos") { eff.dmgMult = 1.03 + t * 0.03; eff.defMult = 1.03 + t * 0.03; eff.moveSpeedMult = 1.03 + t * 0.02; }
      else if (el.id === "alma") { eff.lifesteal = 0.02 * mul; eff.maxMpBonus = 35 * mul; }
      else if (el.id === "morte") { eff.dmgMult = 1.05 + t * 0.05; eff.hpRegen = -0.2 * mul; eff.lifesteal = 0.04 * mul; }

      // Atribuição de efeitos baseados no Foco
      if (fo.id === "soldado") { eff.dmgMult = (eff.dmgMult || 1) + 0.03 * mul; }
      else if (fo.id === "guardiao") { eff.defMult = (eff.defMult || 1) + 0.03 * mul; eff.maxHpBonus = (eff.maxHpBonus || 0) + 15 * mul; }
      else if (fo.id === "assassino") { eff.critBonus = (eff.critBonus || 0) + 0.02 * mul; }
      else if (fo.id === "nomade") { eff.moveSpeedMult = (eff.moveSpeedMult || 1) + 0.03 * mul; }
      else if (fo.id === "alquimista") { eff.goldMult = (eff.goldMult || 1) + 0.06 * mul; eff.dropLuck = (eff.dropLuck || 0) + 4 * mul; }
      else if (fo.id === "sabio") { eff.xpMult = (eff.xpMult || 1) + 0.06 * mul; }
      else if (fo.id === "vampiro") { eff.lifesteal = (eff.lifesteal || 0) + 0.02 * mul; eff.hpRegen = (eff.hpRegen || 0) + 0.4 * mul; }

      effects[t] = eff;
    }

    ANCIENT_RUNES[runeId] = {
      id: runeId,
      name,
      color: el.color,
      glyph: el.glyph,
      desc: `${el.desc} ${fo.desc}`,
      element: el.id,
      focus: fo.id,
      effects
    };
  });
});

export interface OwnedRune {
  runeId: AncientRuneId;
  tier: AncientRuneTier;
  uid: string;
}

// O player pode equipar até no MÁXIMO 2 runas (desafio para maior planejamento de builds!)
export const MAX_EQUIPPED_RUNES = 2;

// Rolar runa extremamente rara
export function rollAncientRune(power: number): OwnedRune | null {
  // Chance reduzida em 3x comparado ao original para torná-las verdadeiramente lendárias!
  const chance = 0.01 + Math.min(0.04, power * 0.0006);
  if (Math.random() > chance) return null;

  const ids = Object.keys(ANCIENT_RUNES) as AncientRuneId[];
  const runeId = ids[Math.floor(Math.random() * ids.length)];

  // Decisão de Tier baseada no poder do andar/chefe
  const r = Math.random() * 100;
  let tier: AncientRuneTier = 1;
  if (r < Math.min(30, power * 0.3)) tier = 2;
  if (r < Math.min(5, power * 0.05)) tier = 3;

  return {
    runeId,
    tier,
    uid: `rune_${Date.now()}_${Math.floor(Math.random() * 100000)}`
  };
}

export type SynergyDetail = {
  name: string;
  desc: string;
  effects: Partial<RuneBonuses>;
};

// Calcula as sinergias ativas entre as runas equipadas (máx 2)
export function getActiveSynergies(equipped: OwnedRune[]): SynergyDetail[] {
  if (equipped.length < 2) return [];
  const r1 = ANCIENT_RUNES[equipped[0].runeId];
  const r2 = ANCIENT_RUNES[equipped[1].runeId];
  if (!r1 || !r2) return [];

  const list: SynergyDetail[] = [];

  // Sinergia 1: Mesmo Elemento
  if (r1.element === r2.element) {
    const el = RUNIC_ELEMENTS.find((e) => e.id === r1.element);
    list.push({
      name: `Ressonância de ${el?.name || "Elementos"}`,
      desc: "Ambas as runas vibram na mesma frequência elementar! Concede imenso bônus de dano e velocidade.",
      effects: { dmgMult: 1.15, moveSpeedMult: 1.08 }
    });
  }

  // Sinergia 2: Mesmo Foco
  if (r1.focus === r2.focus) {
    const fo = RUNIC_FOCUSES.find((f) => f.id === r1.focus);
    list.push({
      name: `Foco Supremo: ${fo?.name || "Foco"}`,
      desc: "Alinhamento perfeito de intenção e foco! Concede bônus robusto de defesa, ouro e HP.",
      effects: { defMult: 1.10, goldMult: 1.12, maxHpBonus: 50 }
    });
  }

  // Sinergias Híbridas Especiais
  const pair = [r1.element, r2.element].sort().join("+");
  if (pair === "fogo+gelo") {
    list.push({
      name: "Fusão Termodinâmica",
      desc: "Calor extremo e frio absoluto se anulam gerando energia pura! +12% de Crítico e +10% de Roubo de Vida.",
      effects: { critBonus: 0.12, lifesteal: 0.10 }
    });
  } else if (pair === "luz+sombra") {
    list.push({
      name: "Dualidade Crepuscular",
      desc: "O equilíbrio perfeito entre luz e trevas! +6 de Regeneração de HP, +15% de Dano e +15% de Defesa.",
      effects: { hpRegen: 6.0, dmgMult: 1.15, defMult: 1.15 }
    });
  } else if (pair === "cosmos+tempo") {
    list.push({
      name: "Eternidade Sideral",
      desc: "A distorção infinita do tempo no vácuo estelar! -20% Cooldown de Habilidades e +25% de Experiência.",
      effects: { cooldownMult: 0.80, xpMult: 1.25 }
    });
  } else if (pair === "caos+ordem") {
    list.push({
      name: "Equilíbrio Cósmico",
      desc: "A flutuação quântica atinge estabilidade divina! +10% de amplificação para TODOS os atributos fundamentais.",
      effects: { dmgMult: 1.10, defMult: 1.10, moveSpeedMult: 1.05, maxHpBonus: 60 }
    });
  } else if (pair === "alma+morte") {
    list.push({
      name: "Pacto de Necromancia",
      desc: "Vínculo espiritual eterno com o mundo dos mortos! +15% de Roubo de Vida e dano de espinhos agressivo.",
      effects: { lifesteal: 0.15, thorns: 0.15 }
    });
  }

  return list;
}

export function aggregateRuneBonuses(equipped: OwnedRune[]): RuneBonuses {
  const acc: RuneBonuses = { ...RUNE_ZERO };

  // 1. Somar atributos das runas equipadas
  for (const r of equipped) {
    const rune = ANCIENT_RUNES[r.runeId];
    if (!rune) continue;
    const eff = rune.effects[r.tier - 1] ?? {};

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

  // 2. Aplicar bônus de Sinergias Ativas
  const synergies = getActiveSynergies(equipped);
  for (const syn of synergies) {
    const eff = syn.effects;
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
