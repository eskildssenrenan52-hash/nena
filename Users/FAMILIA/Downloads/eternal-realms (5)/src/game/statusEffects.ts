// Onda 1 — Núcleo do sistema de efeitos.
//
// Espinha dorsal para buffs, DoT, escudos, ecos, essências e auras.
// Todas as novas mecânicas (Ecomante, Simbionte, afixos, eventos etc.)
// se plugam aqui em vez de espalhar lógica por engine.ts / game.ts.
//
// Deliberadamente framework-agnóstico: recebe `host` genérico (o Player)
// e não importa nada de engine.ts para evitar dependência circular.

export type EffectId = string;

export type EffectKind =
  | "buff"      // multiplicador de stat por tempo
  | "dot"       // dano/cura por tick
  | "shield"    // absorve dano
  | "echo"      // habilidade que re-executa depois de X segundos
  | "aura"      // efeito passivo por área (tick espacial)
  | "stun"      // impede ação
  | "silence"   // impede skills mágicas
  | "slow"      // reduz movimento
  | "burn"      // dot elemental fogo
  | "chill"     // dot elemental gelo + slow
  | "bleed"     // dot físico
  | "regen";    // cura por tick

export type EssenceKind = "fire" | "ice" | "shadow" | "blood";

export interface StatModifier {
  dmgMult?: number;      // multiplica dano de saída
  defMult?: number;      // multiplica defesa
  speedMult?: number;    // multiplica movimento
  lifesteal?: number;    // 0..1
  maxHpBonus?: number;   // aditivo temporário em maxHp
  healMult?: number;
  critBonus?: number;
}

export interface StatusEffect {
  id: EffectId;                 // ex: "echomancer-loop"
  kind: EffectKind;
  duration: number;             // segundos restantes (Infinity = permanente até removido)
  totalDuration: number;        // duração original — usado para UI de progresso
  stacks: number;               // stack atual
  maxStacks: number;
  source?: string;              // id da skill/classe que aplicou
  color: string;                // cor pra UI/particle
  icon?: string;                // emoji ou glyph
  label: string;                // nome curto pra tooltip
  // Multiplicadores enquanto o buff estiver ativo
  mod?: StatModifier;
  // Dano por segundo (positivo dano, negativo cura). Usado por dot/regen/burn/bleed/chill.
  tickDmg?: number;
  tickInterval?: number;        // default 1s
  _tickAcc?: number;            // interno
  // Escudo absorve HP
  shieldHp?: number;
  // Callback ao expirar (ex: colapso do Loop Perpétuo)
  onExpire?: (host: unknown) => void;
  // Callback a cada tick após aplicar tickDmg (opcional)
  onTick?: (host: unknown, dt: number) => void;
}

export interface EchoSlot {
  id: string;                   // identificador do eco
  abilityId: string;            // referência à skill que será re-executada
  delay: number;                // tempo restante até disparar
  totalDelay: number;
  power: number;                // multiplicador de dano (ex: 0.7)
  targetX?: number;
  targetY?: number;
  color: string;
  from: "mark" | "loop" | "paradox";
}

export interface EffectHost {
  hp: number;
  maxHp: number;
  statusEffects?: StatusEffect[];
  echoQueue?: EchoSlot[];
  essences?: EssenceKind[];      // stack ordenado (últimas 5)
  essenceMax?: number;
}

// ---------- Ciclo de vida ----------

/** Aplica ou faz merge de um efeito (stacks somam se mesmo id). */
export function applyEffect(host: EffectHost, eff: StatusEffect): void {
  if (!host.statusEffects) host.statusEffects = [];
  const existing = host.statusEffects.find((e) => e.id === eff.id);
  if (existing) {
    existing.stacks = Math.min(existing.maxStacks, existing.stacks + eff.stacks);
    existing.duration = Math.max(existing.duration, eff.duration);
    existing.totalDuration = Math.max(existing.totalDuration, eff.totalDuration);
    if (eff.shieldHp) existing.shieldHp = (existing.shieldHp ?? 0) + eff.shieldHp;
    return;
  }
  host.statusEffects.push({ ...eff, _tickAcc: 0 });
}

export function removeEffect(host: EffectHost, id: EffectId): void {
  if (!host.statusEffects) return;
  const i = host.statusEffects.findIndex((e) => e.id === id);
  if (i >= 0) {
    const [gone] = host.statusEffects.splice(i, 1);
    gone?.onExpire?.(host);
  }
}

export function hasEffect(host: EffectHost, id: EffectId): boolean {
  return !!host.statusEffects?.some((e) => e.id === id);
}

export function getEffect(host: EffectHost, id: EffectId): StatusEffect | undefined {
  return host.statusEffects?.find((e) => e.id === id);
}

/** Absorve dano nos escudos primeiro. Retorna dano restante. */
export function absorbShield(host: EffectHost, dmg: number): number {
  if (!host.statusEffects || dmg <= 0) return dmg;
  let remaining = dmg;
  for (const e of host.statusEffects) {
    if (e.kind !== "shield" || !e.shieldHp) continue;
    const absorbed = Math.min(remaining, e.shieldHp);
    e.shieldHp -= absorbed;
    remaining -= absorbed;
    if (remaining <= 0) break;
  }
  // limpa escudos zerados
  host.statusEffects = host.statusEffects.filter((e) => e.kind !== "shield" || (e.shieldHp ?? 0) > 0);
  return remaining;
}

// ---------- Agregação de multiplicadores ----------

export function computeMods(host: EffectHost): Required<StatModifier> {
  const base: Required<StatModifier> = {
    dmgMult: 1, defMult: 1, speedMult: 1, lifesteal: 0,
    maxHpBonus: 0, healMult: 1, critBonus: 0,
  };
  if (!host.statusEffects) return base;
  for (const e of host.statusEffects) {
    if (!e.mod) continue;
    const s = e.stacks || 1;
    if (e.mod.dmgMult !== undefined) base.dmgMult *= 1 + (e.mod.dmgMult - 1) * s;
    if (e.mod.defMult !== undefined) base.defMult *= 1 + (e.mod.defMult - 1) * s;
    if (e.mod.speedMult !== undefined) base.speedMult *= 1 + (e.mod.speedMult - 1) * s;
    if (e.mod.healMult !== undefined) base.healMult *= 1 + (e.mod.healMult - 1) * s;
    if (e.mod.lifesteal) base.lifesteal += e.mod.lifesteal * s;
    if (e.mod.maxHpBonus) base.maxHpBonus += e.mod.maxHpBonus * s;
    if (e.mod.critBonus) base.critBonus += e.mod.critBonus * s;
  }
  return base;
}

// ---------- Tick principal ----------

/**
 * Avança todos os efeitos. Chame 1x por frame com dt em segundos.
 * `onEcho(slot)` é disparado quando um EchoSlot vence — quem consome
 * (game.ts) executa a habilidade re-gravada.
 */
export function tickStatusEffects(
  host: EffectHost,
  dt: number,
  callbacks?: {
    onEcho?: (slot: EchoSlot) => void;
    onTickDmg?: (host: EffectHost, amount: number, eff: StatusEffect) => void;
  },
): void {
  // Buffs / DoT / regen / escudos
  if (host.statusEffects) {
    for (const e of host.statusEffects) {
      e.duration -= dt;
      if (e.tickDmg !== undefined) {
        e._tickAcc = (e._tickAcc ?? 0) + dt;
        const interval = e.tickInterval ?? 1;
        while (e._tickAcc >= interval) {
          e._tickAcc -= interval;
          const amt = e.tickDmg * (e.stacks || 1);
          if (amt !== 0) callbacks?.onTickDmg?.(host, amt, e);
        }
      }
      e.onTick?.(host, dt);
    }
    // Expira
    const expired = host.statusEffects.filter((e) => e.duration <= 0);
    for (const e of expired) e.onExpire?.(host);
    host.statusEffects = host.statusEffects.filter((e) => e.duration > 0);
  }
  // Ecos temporais
  if (host.echoQueue && host.echoQueue.length) {
    const ready: EchoSlot[] = [];
    for (const s of host.echoQueue) {
      s.delay -= dt;
      if (s.delay <= 0) ready.push(s);
    }
    if (ready.length) {
      host.echoQueue = host.echoQueue.filter((s) => s.delay > 0);
      for (const s of ready) callbacks?.onEcho?.(s);
    }
  }
}

// ---------- Essências (Simbionte) ----------

export function addEssence(host: EffectHost, kind: EssenceKind): void {
  if (!host.essences) host.essences = [];
  const max = host.essenceMax ?? 5;
  host.essences.push(kind);
  while (host.essences.length > max) host.essences.shift();
}

export function consumeEssence(host: EffectHost, kind?: EssenceKind): EssenceKind | null {
  if (!host.essences?.length) return null;
  if (!kind) return host.essences.pop() ?? null;
  const i = host.essences.lastIndexOf(kind);
  if (i < 0) return null;
  return host.essences.splice(i, 1)[0] ?? null;
}

export function consumeAllEssences(host: EffectHost): EssenceKind[] {
  const list = host.essences ?? [];
  host.essences = [];
  return list;
}

// ---------- Ecos (Ecomante) ----------

export function queueEcho(host: EffectHost, slot: EchoSlot): void {
  if (!host.echoQueue) host.echoQueue = [];
  host.echoQueue.push(slot);
}

export function detonateAllEchoes(host: EffectHost): EchoSlot[] {
  const list = host.echoQueue ?? [];
  host.echoQueue = [];
  return list;
}

// ---------- Presets de efeitos comuns ----------

export const EFFECT_PRESETS = {
  burn: (dur = 4, dmgPerSec = 8): StatusEffect => ({
    id: "burn", kind: "burn", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 5, label: "Queimadura", color: "#f97316", icon: "🔥",
    tickDmg: dmgPerSec, tickInterval: 1,
  }),
  chill: (dur = 3, dmgPerSec = 4): StatusEffect => ({
    id: "chill", kind: "chill", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 3, label: "Congelamento", color: "#38bdf8", icon: "❄️",
    tickDmg: dmgPerSec, tickInterval: 1, mod: { speedMult: 0.6 },
  }),
  bleed: (dur = 5, dmgPerSec = 6): StatusEffect => ({
    id: "bleed", kind: "bleed", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 5, label: "Sangramento", color: "#dc2626", icon: "🩸",
    tickDmg: dmgPerSec, tickInterval: 1,
  }),
  regen: (dur = 6, healPerSec = 12): StatusEffect => ({
    id: "regen", kind: "regen", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 3, label: "Regeneração", color: "#22c55e", icon: "💚",
    tickDmg: -healPerSec, tickInterval: 1,
  }),
  shield: (hp: number, dur = 10): StatusEffect => ({
    id: "shield", kind: "shield", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 1, label: "Escudo", color: "#a5f3fc", icon: "🛡️",
    shieldHp: hp,
  }),
  stun: (dur = 1.5): StatusEffect => ({
    id: "stun", kind: "stun", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 1, label: "Atordoado", color: "#facc15", icon: "💫",
  }),
  silence: (dur = 3): StatusEffect => ({
    id: "silence", kind: "silence", duration: dur, totalDuration: dur,
    stacks: 1, maxStacks: 1, label: "Silenciado", color: "#a855f7", icon: "🚫",
  }),
};
