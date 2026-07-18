// Class talent tree system.
// Each class has 2 branches, each branch has 3 talent nodes with up to 3 ranks.
// Ranks are unlocked with talent points earned per level up.
// Bonuses are aggregated into a TalentBonuses object applied in combat/skill code.

import type { PlayerClass } from "./engine";

export type TalentEffectKey =
  | "dmgMult"          // additive per rank, applied as (1 + sum)
  | "cooldownReduce"   // additive per rank, applied as (1 - sum), min 0.4
  | "mpCostReduce"     // additive per rank, applied as (1 - sum), min 0.3
  | "moveSpeedMult"    // additive per rank, applied as (1 + sum)
  | "healMult"         // additive per rank, applied as (1 + sum)
  | "aoeRadiusMult"    // additive per rank, applied as (1 + sum)
  | "critChance"       // additive per rank, chance 0..1
  | "maxHpBonus"       // flat per rank
  | "maxMpBonus";      // flat per rank

export interface TalentNode {
  id: string;
  name: string;
  desc: string;
  maxRank: number;
  effect: Partial<Record<TalentEffectKey, number>>; // per rank
  requires?: string; // optional prerequisite node id (rank >= 1)
}

export interface TalentBranch {
  id: string;
  name: string;
  color: string;
  nodes: TalentNode[]; // 3 nodes, top to bottom
}

export interface ClassTalentTree {
  cls: PlayerClass;
  branches: [TalentBranch, TalentBranch]; // exactly 2 branches
}

export interface TalentBonuses {
  dmgMult: number;
  cooldownMult: number;
  mpCostMult: number;
  moveSpeedMult: number;
  healMult: number;
  aoeRadiusMult: number;
  critChance: number;
  maxHpBonus: number;
  maxMpBonus: number;
}

export function emptyBonuses(): TalentBonuses {
  return {
    dmgMult: 1,
    cooldownMult: 1,
    mpCostMult: 1,
    moveSpeedMult: 1,
    healMult: 1,
    aoeRadiusMult: 1,
    critChance: 0,
    maxHpBonus: 0,
    maxMpBonus: 0,
  };
}

// Helper to keep tree definitions concise
function node(
  id: string,
  name: string,
  desc: string,
  effect: Partial<Record<TalentEffectKey, number>>,
  maxRank = 3,
  requires?: string,
): TalentNode {
  return { id, name, desc, maxRank, effect, requires };
}

// -------- Class trees --------
// Every class has:
//  - Branch A: offensive / burst (dmgMult, critChance)
//  - Branch B: utility / AoE (cooldownReduce, aoeRadiusMult, moveSpeed, healMult, mpCostReduce)
// Names / flavour are class-specific so builds feel distinct.

const A = (id: string, name: string, cls: string) => `${cls}_a_${id}_${name}`; // unused helper (kept for readability)
void A;

function offBranch(cls: string, name: string, color: string, node1: TalentNode, node2: TalentNode, node3: TalentNode, capstone?: TalentNode): TalentBranch {
  const nodes = [node1, node2, node3];
  if (capstone) nodes.push(capstone);
  return { id: `${cls}_off`, name, color, nodes };
}
function utilBranch(cls: string, name: string, color: string, node1: TalentNode, node2: TalentNode, node3: TalentNode, capstone?: TalentNode): TalentBranch {
  const nodes = [node1, node2, node3];
  if (capstone) nodes.push(capstone);
  return { id: `${cls}_util`, name, color, nodes };
}

// Standard building blocks reused (with class-specific names)
function nDmg(id: string, name: string, desc: string) {
  return node(id, name, desc, { dmgMult: 0.10 });
}
function nCrit(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { critChance: 0.08, dmgMult: 0.05 }, 3, req);
}
function nBurst(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { dmgMult: 0.20 }, 3, req);
}
function nCd(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { cooldownReduce: 0.08 }, 3, req);
}
function nAoe(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { aoeRadiusMult: 0.12, dmgMult: 0.05 }, 3, req);
}
function nSpeed(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { moveSpeedMult: 0.10, cooldownReduce: 0.04 }, 3, req);
}
function nMp(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { mpCostReduce: 0.10, maxMpBonus: 8 }, 3, req);
}
function nHeal(id: string, name: string, desc: string, req?: string) {
  return node(id, name, desc, { healMult: 0.15, maxHpBonus: 15 }, 3, req);
}
function nCapstone(id: string, name: string, desc: string, effect: Partial<Record<TalentEffectKey, number>>, req: string) {
  return node(id, name, desc, effect, 1, req);
}

export const CLASS_TALENTS: Record<PlayerClass, ClassTalentTree> = {
  melee: {
    cls: "melee",
    branches: [
      offBranch("melee", "Berserker", "#ff6040",
        nDmg("power", "Fúria Bruta", "+10% dano por ponto."),
        nBurst("execute", "Golpe Executor", "+20% dano por ponto (requer Fúria Bruta).", "power"),
        nCrit("wrath", "Ira Escarlate", "+8% chance crítica e +5% dano por ponto.", "execute"),
        nCapstone("cap_melee_bleed", "Sifão de Sangue", "Ataques críticos causam 100% de dano extra como Sangramento por 3s.", { critChance: 0.05, dmgMult: 0.15 }, "wrath"),
      ),
      utilBranch("melee", "Sentinela", "#60c0ff",
        node("iron", "Pele de Ferro", "+15 HP máximo e +5% redução de recarga por ponto.", { maxHpBonus: 15, cooldownReduce: 0.05 }),
        nAoe("whirl", "Rodopio Amplo", "AoE do Golpe Giratório +12% e +5% dano por ponto.", "iron"),
        nSpeed("charge", "Passo do Titã", "+10% velocidade e -4% recarga por ponto.", "whirl"),
        nCapstone("cap_melee_shield", "Bastião Indomável", "Ao usar investida (Dash), gera um escudo equivalente a 25% do HP máximo.", { maxHpBonus: 30 }, "charge"),
      ),
    ],
  },
  magic: {
    cls: "magic",
    branches: [
      offBranch("magic", "Sniper Arcano", "#ffb040",
        node("focus", "Foco Arcano", "+10% dano e +8 MP por ponto.", { dmgMult: 0.10, maxMpBonus: 8 }),
        nBurst("bolt", "Raio Perfurante", "+20% dano por ponto (requer Foco Arcano).", "focus"),
        nCrit("empower", "Empoderamento Arcano", "+8% crítico e +5% dano por ponto.", "bolt"),
        nCapstone("cap_magic_echo", "Eco Arcano", "Bola de Fogo agora dispara uma esfera secundária com 60% de dano.", { dmgMult: 0.15 }, "empower"),
      ),
      utilBranch("magic", "Feiticeiro do Caos", "#c060ff",
        nMp("efficiency", "Eficiência Arcana", "-10% custo de MP por ponto."),
        nAoe("nova", "Nova Explosiva", "AoE da Bola de Fogo +12% por ponto.", "efficiency"),
        nCd("celerity", "Celeridade", "-8% recarga por ponto.", "nova"),
        nCapstone("cap_magic_overload", "Sobrecarga Elemental", "Reduz recarga em 15% adicionais se o seu MP estiver acima de 80%.", { cooldownReduce: 0.10 }, "celerity"),
      ),
    ],
  },
  paladin: {
    cls: "paladin",
    branches: [
      offBranch("paladin", "Templário", "#ffd060",
        nDmg("smite", "Golpe Sagrado", "+10% dano por ponto."),
        nBurst("zeal", "Zelo Divino", "+20% dano por ponto.", "smite"),
        nCrit("judge", "Julgamento", "+8% crítico e +5% dano por ponto.", "zeal"),
        nCapstone("cap_paladin_smite_aoe", "Julgamento Sagrado", "Golpes críticos geram uma explosão de dano sagrado em área.", { critChance: 0.05, dmgMult: 0.15 }, "judge"),
      ),
      utilBranch("paladin", "Guardião", "#8fdaff",
        nHeal("bless", "Bênção Renovada", "+15% cura e +15 HP por ponto."),
        node("ward", "Escudo Sagrado", "+15 HP máx e -5% recarga por ponto.", { maxHpBonus: 15, cooldownReduce: 0.05 }),
        nAoe("aura", "Aura Sagrada", "AoE +12% e +5% dano por ponto.", "ward"),
        nCapstone("cap_paladin_phoenix", "Anjo da Guarda", "Ao sofrer dano fatal, fica invulnerável por 2s e recupera 30% do HP (CD: 60s).", { maxHpBonus: 30 }, "aura"),
      ),
    ],
  },
  necro: {
    cls: "necro",
    branches: [
      offBranch("necro", "Lich", "#a060ff",
        node("drain", "Dreno Profundo", "+15% cura e +10% dano por ponto.", { healMult: 0.15, dmgMult: 0.10 }),
        nBurst("void", "Feitiço do Vazio", "+20% dano por ponto.", "drain"),
        nCrit("death", "Marca da Morte", "+8% crítico e +5% dano por ponto.", "void"),
        nCapstone("cap_necro_grim", "Colheita Sombria", "Abater inimigos recupera 5% do HP máximo e concede +10% de dano por 5s.", { dmgMult: 0.15 }, "death"),
      ),
      utilBranch("necro", "Mestre dos Ossos", "#60ff80",
        nMp("phylactery", "Filactério", "-10% custo de MP e +8 MP por ponto."),
        node("horde", "Horda Fiel", "+15% cura e -8% recarga por ponto.", { healMult: 0.15, cooldownReduce: 0.08 }, 3, "phylactery"),
        nAoe("plague", "Praga Ampliada", "AoE +12% por ponto.", "horde"),
        nCapstone("cap_necro_horde", "Legião Profana", "Aumenta o limite máximo de esqueletos ativos em +2.", { maxMpBonus: 20 }, "plague"),
      ),
    ],
  },
  archer: {
    cls: "archer",
    branches: [
      offBranch("archer", "Sniper", "#ffb040",
        node("aim", "Mira Precisa", "+10% dano e +8% crítico por ponto.", { dmgMult: 0.10, critChance: 0.08 }),
        nBurst("headshot", "Tiro Certeiro", "+20% dano por ponto (Sniper puro).", "aim"),
        nCrit("deadeye", "Olho de Águia", "+8% crítico e +5% dano por ponto.", "headshot"),
        nCapstone("cap_archer_pierce", "Flecha Perfurante", "Seus ataques básicos agora atravessam e atingem inimigos adicionais.", { critChance: 0.05, dmgMult: 0.15 }, "deadeye"),
      ),
      utilBranch("archer", "Chuva de Flechas", "#60c0ff",
        nCd("volley", "Salva Contínua", "-8% recarga por ponto (Chuva de Flechas mais frequente)."),
        nAoe("rain", "Chuva Densa", "AoE +12% e +5% dano por ponto.", "volley"),
        nSpeed("agile", "Passo do Vento", "+10% velocidade e -4% recarga por ponto.", "rain"),
        nCapstone("cap_archer_haste", "Arco do Vento", "Sua velocidade de ataque básico com arco é aumentada em 35%.", { moveSpeedMult: 0.10 }, "agile"),
      ),
    ],
  },
  druid: {
    cls: "druid",
    branches: [
      offBranch("druid", "Fúria Selvagem", "#ff8060",
        nDmg("wild", "Fúria Selvagem", "+10% dano por ponto."),
        nBurst("quake", "Terremoto Épico", "+20% dano por ponto.", "wild"),
        nCrit("primal", "Instinto Primal", "+8% crítico e +5% dano por ponto.", "quake"),
        nCapstone("cap_druid_flora", "Fúria da Terra", "Terremoto agora enraíza os inimigos por 1.5s e causa 50% de dano extra.", { critChance: 0.05, dmgMult: 0.15 }, "primal"),
      ),
      utilBranch("druid", "Guardião Natural", "#60ff80",
        nHeal("bloom", "Florescer", "+15% cura e +15 HP por ponto."),
        nAoe("grove", "Bosque Ancião", "AoE +12% por ponto.", "bloom"),
        nCd("cycle", "Ciclo Natural", "-8% recarga por ponto.", "grove"),
        nCapstone("cap_druid_life", "Bênção de Gaia", "Todas as suas habilidades de cura aumentam sua regeneração de MP em 50%.", { healMult: 0.20 }, "cycle"),
      ),
    ],
  },
  assassin: {
    cls: "assassin",
    branches: [
      offBranch("assassin", "Executor", "#ff4060",
        node("edge", "Fio Envenenado", "+10% dano e +8% crítico por ponto.", { dmgMult: 0.10, critChance: 0.08 }),
        nBurst("finish", "Golpe Final", "+20% dano por ponto.", "edge"),
        nCrit("shadow", "Olho da Sombra", "+8% crítico e +5% dano por ponto.", "finish"),
        nCapstone("cap_assassin_lethal", "Golpe de Misericórdia", "Seus ataques em inimigos abaixo de 40% de vida causam 80% de dano extra.", { critChance: 0.10 }, "shadow"),
      ),
      utilBranch("assassin", "Fantasma", "#8fdaff",
        nSpeed("blur", "Borrão", "+10% velocidade e -4% recarga por ponto."),
        nAoe("fan", "Leque Ampliado", "AoE (shuriken) +12% e +5% dano por ponto.", "blur"),
        nCd("dance", "Dança das Sombras", "-8% recarga por ponto.", "fan"),
        nCapstone("cap_assassin_vanish", "Reflexo Fantasma", "Sua Investida de Sombra (Dash) deixa uma cortina de fumaça que cega inimigos.", { cooldownReduce: 0.10 }, "dance"),
      ),
    ],
  },
  warlock: {
    cls: "warlock",
    branches: [
      offBranch("warlock", "Cataclisma", "#a040ff",
        nDmg("dark", "Poder Sombrio", "+10% dano por ponto."),
        nBurst("chaos", "Caos Amplificado", "+20% dano por ponto.", "dark"),
        nCrit("doom", "Presságio", "+8% crítico e +5% dano por ponto.", "chaos"),
        nCapstone("cap_warlock_soul", "Dreno de Almas", "Cada conjuração de Caos drena MP do inimigo e acumula poder de feitiço.", { dmgMult: 0.15 }, "doom"),
      ),
      utilBranch("warlock", "Corruptor", "#60ff80",
        nMp("pact", "Pacto Insano", "-10% MP e +8 MP por ponto."),
        nAoe("corrupt", "Corrupção Ampla", "AoE +12% por ponto.", "pact"),
        nCd("hex", "Feitiço Rápido", "-8% recarga por ponto.", "corrupt"),
        nCapstone("cap_warlock_plague", "Praga Incurável", "Sua Corrupção dura o dobro e reduz a defesa de inimigos próximos.", { cooldownReduce: 0.10 }, "hex"),
      ),
    ],
  },
  samurai: {
    cls: "samurai",
    branches: [
      offBranch("samurai", "Bushido", "#ff6040",
        nDmg("edge", "Fio Perfeito", "+10% dano por ponto."),
        nBurst("iai", "Iaijutsu Supremo", "+20% dano por ponto.", "edge"),
        nCrit("kensei", "Kensei", "+8% crítico e +5% dano por ponto.", "iai"),
        nCapstone("cap_samurai_bleed", "Corte do Vento Sangrento", "Iaijutsu agora causa sangramento de 150% do dano por 4 segundos.", { critChance: 0.05, dmgMult: 0.15 }, "kensei"),
      ),
      utilBranch("samurai", "Ronin Ágil", "#60c0ff",
        nSpeed("wind", "Passo do Vento", "+10% velocidade e -4% recarga por ponto."),
        nAoe("cyclone", "Vento Cortante Ampliado", "AoE +12% por ponto.", "wind"),
        nCd("focus", "Foco Puro", "-8% recarga por ponto.", "cyclone"),
        nCapstone("cap_samurai_counter", "Zantetsuken", "Ao usar Iaijutsu, você tem 30% de chance de resetar seu cooldown instantaneamente.", { cooldownReduce: 0.10 }, "focus"),
      ),
    ],
  },
  monk: {
    cls: "monk",
    branches: [
      offBranch("monk", "Punho de Ferro", "#ffb040",
        nDmg("fist", "Punho Marcial", "+10% dano por ponto."),
        nBurst("dragon", "Chute Dragão", "+20% dano por ponto.", "fist"),
        nCrit("chi", "Chi Focado", "+8% crítico e +5% dano por ponto.", "dragon"),
        nCapstone("cap_monk_strike", "Palma das Sete Estrelas", "Seus punhos básicos de Chi causam dano extra em área de cone.", { dmgMult: 0.15 }, "chi"),
      ),
      utilBranch("monk", "Mestre Zen", "#8fdaff",
        nHeal("zen", "Meditação Zen", "+15% cura e +15 HP por ponto."),
        nAoe("aura", "Aura de Chi", "AoE +12% por ponto.", "zen"),
        nSpeed("flow", "Fluxo Constante", "+10% velocidade e -4% recarga por ponto.", "aura"),
        nCapstone("cap_monk_shield", "Escudo Transcendental", "Seu escudo protetor de Chi absorve 50% de dano adicional.", { maxHpBonus: 30 }, "flow"),
      ),
    ],
  },
  bard: {
    cls: "bard",
    branches: [
      offBranch("bard", "Rapsodista", "#ff8060",
        nDmg("crescendo", "Crescendo", "+10% dano por ponto."),
        nBurst("finale", "Grande Finale", "+20% dano por ponto.", "crescendo"),
        nCrit("aria", "Ária Perfeita", "+8% crítico e +5% dano por ponto.", "finale"),
        nCapstone("cap_bard_note", "Sinfonia do Caos", "Ataques de notas musicais ricocheteiam entre até 3 inimigos próximos.", { dmgMult: 0.15 }, "aria"),
      ),
      utilBranch("bard", "Menestrel", "#60ff80",
        nHeal("harmony", "Harmonia Sublime", "+15% cura e +15 HP por ponto."),
        nMp("muse", "Musa Constante", "-10% MP e +8 MP por ponto.", "harmony"),
        nSpeed("tempo", "Tempo Elevado", "+10% velocidade e -4% recarga por ponto.", "muse"),
        nCapstone("cap_bard_inspire", "Hino Heroico", "Suas melodias aumentam a velocidade e dano de todos os seus minions em 25%.", { moveSpeedMult: 0.12 }, "tempo"),
      ),
    ],
  },
  gunslinger: {
    cls: "gunslinger",
    branches: [
      offBranch("gunslinger", "Franco-Atirador", "#ffb040",
        node("aim", "Mira de Ferro", "+10% dano e +8% crítico por ponto.", { dmgMult: 0.10, critChance: 0.08 }),
        nBurst("magnum", "Magnum Devastador", "+20% dano por ponto.", "aim"),
        nCrit("headshot", "Cabeça na Mira", "+8% crítico e +5% dano por ponto.", "magnum"),
        nCapstone("cap_gunslinger_shrapnel", "Munição de Estilhaços", "Balas básicas explodem no impacto, causando 30% de dano em área.", { critChance: 0.05, dmgMult: 0.15 }, "headshot"),
      ),
      utilBranch("gunslinger", "Metralhador", "#60c0ff",
        nCd("rapid", "Recarga Rápida", "-8% recarga por ponto."),
        nAoe("spread", "Dispersão Larga", "AoE +12% por ponto.", "rapid"),
        nSpeed("gunkata", "Gunkata", "+10% velocidade e -4% recarga por ponto.", "spread"),
        nCapstone("cap_gunslinger_barrage", "Barragem de Metralha", "Ao usar Recarga Rápida, dobra a velocidade dos projéteis por 3s.", { moveSpeedMult: 0.10 }, "gunkata"),
      ),
    ],
  },
  alchemist: {
    cls: "alchemist",
    branches: [
      offBranch("alchemist", "Bombardeiro", "#ff8040",
        nDmg("toxic", "Composto Tóxico", "+10% dano por ponto."),
        nBurst("napalm", "Napalm Alquímico", "+20% dano por ponto.", "toxic"),
        nAoe("radius", "Fórmula Ampliada", "AoE +12% e +5% dano por ponto.", "napalm"),
        nCapstone("cap_alchemist_acid", "Ácido Corrosivo", "Suas poções reduzem a armadura do alvo, aumentando o dano sofrido em 25%.", { dmgMult: 0.15 }, "radius"),
      ),
      utilBranch("alchemist", "Boticário", "#60ff80",
        nHeal("elixir", "Elixir Restaurador", "+15% cura e +15 HP por ponto."),
        nMp("distill", "Destilação Pura", "-10% MP e +8 MP por ponto.", "elixir"),
        nCd("catalyst", "Catalisador", "-8% recarga por ponto.", "distill"),
        nCapstone("cap_alchemist_philosopher", "Pedra Filosofal", "Dobra a eficácia de todos os buffs de regeneração e poções.", { healMult: 0.20 }, "catalyst"),
      ),
    ],
  },
  vampire: {
    cls: "vampire",
    branches: [
      offBranch("vampire", "Predador", "#ff4060",
        nDmg("thirst", "Sede Insaciável", "+10% dano por ponto."),
        nBurst("bite", "Mordida Fatal", "+20% dano por ponto.", "thirst"),
        nCrit("dread", "Presença Aterradora", "+8% crítico e +5% dano por ponto.", "bite"),
        nCapstone("cap_vampire_blood", "Fúria de Sangue", "Aumenta seu dano em 1% para cada 2% de HP perdido.", { dmgMult: 0.15 }, "dread"),
      ),
      utilBranch("vampire", "Nobre Imortal", "#a060ff",
        nHeal("regen", "Regeneração Sanguínea", "+15% cura e +15 HP por ponto."),
        node("dark", "Corpo Sombrio", "+15 HP máx e -5% recarga por ponto.", { maxHpBonus: 15, cooldownReduce: 0.05 }, 3, "regen"),
        nAoe("bats", "Enxame de Morcegos", "AoE +12% por ponto.", "dark"),
        nCapstone("cap_vampire_mist", "Forma de Névoa", "Ao atingir menos de 25% de HP, entra em forma de névoa ficando invulnerável por 3s.", { maxHpBonus: 30 }, "bats"),
      ),
    ],
  },
  reaper: {
    cls: "reaper",
    branches: [
      offBranch("reaper", "Ceifador Puro", "#a060ff",
        nDmg("scythe", "Foice Afiada", "+10% dano por ponto."),
        nBurst("harvest", "Colheita Sombria", "+20% dano por ponto.", "scythe"),
        nCrit("reap", "Ceifa Final", "+8% crítico e +5% dano por ponto.", "harvest"),
        nCapstone("cap_reaper_harvest", "Ceifador de Almas", "Inimigos derrotados por você concedem +15% de velocidade de ataque por 5s.", { critChance: 0.05, dmgMult: 0.15 }, "reap"),
      ),
      utilBranch("reaper", "Mestre das Almas", "#60ff80",
        nHeal("soul", "Dreno de Alma", "+15% cura e +15 HP por ponto."),
        nAoe("aura", "Aura da Morte", "AoE +12% por ponto.", "soul"),
        nCd("swift", "Passo Espectral", "-8% recarga por ponto.", "aura"),
        nCapstone("cap_reaper_shadow", "Aura de Decrepitude", "Sua Aura da Morte agora também desacelera os inimigos próximos em 30%.", { cooldownReduce: 0.10 }, "swift"),
      ),
    ],
  },
  ecomancer: {
    cls: "ecomancer",
    branches: [
      offBranch("ecomancer", "Paradoxo Ofensivo", "#22d3ee",
        nDmg("resonance", "Ressonância", "+10% dano por ponto."),
        nBurst("echo_burst", "Explosão em Eco", "+20% dano por ponto.", "resonance"),
        nCrit("time_slip", "Deslize Temporal", "+8% crítico e +5% dano por ponto.", "echo_burst"),
        nCapstone("cap_eco_loop", "Loop Infinito", "Ecos causam +30% de dano e duram 1s a mais.", { critChance: 0.05, dmgMult: 0.15 }, "time_slip"),
      ),
      utilBranch("ecomancer", "Fluxo Temporal", "#a5f3fc",
        node("stability", "Estabilidade", "+8 MP e +10 HP por ponto.", { maxMpBonus: 8, maxHpBonus: 10 }),
        nAoe("collapse", "Colapso Amplo", "AoE +12% por ponto.", "stability"),
        nCd("rewind", "Rebobinar", "-8% recarga por ponto.", "collapse"),
        nCapstone("cap_eco_mark", "Marcador Perpétuo", "Marcar Instante custa 0 MP e não tem recarga.", { cooldownReduce: 0.20 }, "rewind"),
      ),
    ],
  },
  symbiote: {
    cls: "symbiote",
    branches: [
      offBranch("symbiote", "Voracidade", "#65a30d",
        nDmg("hunger", "Fome Insaciável", "+10% dano por ponto."),
        nBurst("consume", "Consumir", "+20% dano por ponto.", "hunger"),
        nCrit("mutation", "Mutação Selvagem", "+8% crítico e +5% dano por ponto.", "consume"),
        nCapstone("cap_symb_fusion", "Fusão Perpétua", "Fusão Aberrante cura +50% e não consome todas essências.", { critChance: 0.05, dmgMult: 0.15 }, "mutation"),
      ),
      utilBranch("symbiote", "Regeneração", "#4c1d95",
        nHeal("bio", "Bio-Regeneração", "+15% cura e +15 HP por ponto."),
        nAoe("swarm", "Enxame Ampliado", "AoE +12% por ponto.", "bio"),
        nCd("adapt", "Adaptação", "-8% recarga por ponto.", "swarm"),
        nCapstone("cap_symb_essence", "Reserva Extra", "Estoque máximo de essências vai de 5 para 8.", { maxHpBonus: 30 }, "adapt"),
      ),
    ],
  },
};

// -------- Public helpers --------

export function getTree(cls: PlayerClass): ClassTalentTree {
  return CLASS_TALENTS[cls];
}

export function talentNode(cls: PlayerClass, nodeId: string): TalentNode | null {
  const tree = CLASS_TALENTS[cls];
  for (const b of tree.branches) for (const n of b.nodes) if (n.id === nodeId) return n;
  return null;
}

/** True if the prerequisite (if any) already has at least 1 rank invested. */
export function nodePrereqMet(cls: PlayerClass, nodeId: string, ranks: Record<string, number>): boolean {
  const n = talentNode(cls, nodeId);
  if (!n || !n.requires) return true;
  return (ranks[n.requires] ?? 0) >= 1;
}

export function computeBonuses(cls: PlayerClass, ranks: Record<string, number>): TalentBonuses {
  const b = emptyBonuses();
  const tree = CLASS_TALENTS[cls];
  const acc = {
    dmgAdd: 0, cdReduce: 0, mpReduce: 0, moveAdd: 0, healAdd: 0, aoeAdd: 0,
    crit: 0, hp: 0, mp: 0,
  };
  for (const branch of tree.branches) {
    for (const n of branch.nodes) {
      const r = ranks[n.id] ?? 0;
      if (r <= 0) continue;
      const e = n.effect;
      if (e.dmgMult) acc.dmgAdd += e.dmgMult * r;
      if (e.cooldownReduce) acc.cdReduce += e.cooldownReduce * r;
      if (e.mpCostReduce) acc.mpReduce += e.mpCostReduce * r;
      if (e.moveSpeedMult) acc.moveAdd += e.moveSpeedMult * r;
      if (e.healMult) acc.healAdd += e.healMult * r;
      if (e.aoeRadiusMult) acc.aoeAdd += e.aoeRadiusMult * r;
      if (e.critChance) acc.crit += e.critChance * r;
      if (e.maxHpBonus) acc.hp += e.maxHpBonus * r;
      if (e.maxMpBonus) acc.mp += e.maxMpBonus * r;
    }
  }
  b.dmgMult = 1 + acc.dmgAdd;
  b.cooldownMult = Math.max(0.4, 1 - acc.cdReduce);
  b.mpCostMult = Math.max(0.3, 1 - acc.mpReduce);
  b.moveSpeedMult = 1 + acc.moveAdd;
  b.healMult = 1 + acc.healAdd;
  b.aoeRadiusMult = 1 + acc.aoeAdd;
  b.critChance = Math.min(0.75, acc.crit);
  b.maxHpBonus = acc.hp;
  b.maxMpBonus = acc.mp;
  return b;
}

export function totalRanks(ranks: Record<string, number>): number {
  let t = 0;
  for (const k of Object.keys(ranks)) t += ranks[k] || 0;
  return t;
}

/** Total talent points earned across career (1 per level, first at level 2). */
export function pointsEarnedByLevel(level: number): number {
  return Math.max(0, level - 1);
}