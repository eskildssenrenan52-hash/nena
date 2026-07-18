// Crafting system: professions (1..999), benches, recipes, quality tiers,
// failure/success chances, enchanting, gem sockets, item evolution.

import type { GameState } from "./game";
import type { Item, Profession, ItemQuality, Enchant } from "./engine";
import { QUALITY_MULT, RARITY_COLOR, PROFESSION_NAME } from "./engine";
import type { OreKind } from "./mining";
import { ORES } from "./mining";

export type Bench = "forja" | "bigorna" | "mesa_alquimia" | "mesa_arcana" | "laboratorio" | "mesa_gemas";
export const BENCH_NAME: Record<Bench, string> = {
  forja: "Forja", bigorna: "Bigorna", mesa_alquimia: "Mesa de Alquimia",
  mesa_arcana: "Mesa Arcana", laboratorio: "Laboratório", mesa_gemas: "Mesa de Gemas",
};
export const PROFESSION_BENCH: Record<Profession, Bench> = {
  ferreiro: "forja", alquimista: "mesa_alquimia", joalheiro: "mesa_gemas",
  engenheiro: "laboratorio", encantador: "mesa_arcana", carpinteiro: "bigorna",
  cozinheiro: "mesa_alquimia", tecelao: "bigorna",
};

export type Recipe = {
  id: string;
  name: string;
  profession: Profession;
  minLevel: number;
  materials: Partial<Record<OreKind, number>>;
  produces: { kind: "weapon" | "armor" | "potion" | "material"; basePower: number; slots?: number };
  xp: number;
  discoverGold?: number; // cost to buy the recipe (if not otherwise unlocked)
  secret?: boolean;
  hidden?: boolean;
};

// A hand-tuned catalogue. Not exhaustive but covers every profession with a
// progression from novice to master and hooks for secret recipes.
export const RECIPES: Recipe[] = [
  // Ferreiro
  { id: "espada_ferro",       name: "Espada de Ferro",       profession: "ferreiro", minLevel: 1,  materials: { ferro_enferrujado: 3, madeira_antiga: 1 }, produces: { kind: "weapon", basePower: 24, slots: 1 }, xp: 30 },
  { id: "machado_cobre",      name: "Machado de Cobre",      profession: "ferreiro", minLevel: 3,  materials: { cobre: 4, madeira_antiga: 1 }, produces: { kind: "weapon", basePower: 20, slots: 1 }, xp: 24 },
  { id: "espada_mithril",     name: "Espada de Mithril",     profession: "ferreiro", minLevel: 50, materials: { mithril: 5, safira: 1 },        produces: { kind: "weapon", basePower: 120, slots: 2 }, xp: 200 },
  { id: "lamina_adamantita",  name: "Lâmina de Adamantita",  profession: "ferreiro", minLevel: 120,materials: { adamantita: 4, rubi_flamejante: 2, titanio: 2 }, produces: { kind: "weapon", basePower: 260, slots: 3 }, xp: 640 },
  { id: "espada_eclipse",     name: "Espada do Eclipse",     profession: "ferreiro", minLevel: 200,materials: { cristal_sombrio: 3, rubi_flamejante: 2, adamantita: 3 }, produces: { kind: "weapon", basePower: 520, slots: 4 }, xp: 1400, secret: true, hidden: true },
  // Ferreiro armors
  { id: "peito_ferro",        name: "Peitoral de Ferro",     profession: "ferreiro", minLevel: 5,  materials: { ferro_enferrujado: 5 }, produces: { kind: "armor", basePower: 20, slots: 1 }, xp: 30 },
  { id: "peito_mithril",      name: "Peitoral de Mithril",   profession: "ferreiro", minLevel: 60, materials: { mithril: 6, prata: 2 }, produces: { kind: "armor", basePower: 110, slots: 2 }, xp: 210 },
  // Carpinteiro (bows / staffs / handles)
  { id: "arco_longo",         name: "Arco Longo",            profession: "carpinteiro", minLevel: 1,  materials: { madeira_antiga: 4, resina: 2 }, produces: { kind: "weapon", basePower: 22, slots: 1 }, xp: 30 },
  { id: "cajado_carvalho",    name: "Cajado de Carvalho",    profession: "carpinteiro", minLevel: 4,  materials: { madeira_antiga: 3, cristal_verde: 1 }, produces: { kind: "weapon", basePower: 26, slots: 1 }, xp: 32 },
  { id: "arco_ebano",         name: "Arco de Ébano",         profession: "carpinteiro", minLevel: 60, materials: { ebano: 4, resina: 2, prata: 1 }, produces: { kind: "weapon", basePower: 130, slots: 2 }, xp: 220 },
  // Alquimista (potions)
  { id: "pocao_menor",        name: "Poção Menor de Cura",   profession: "alquimista", minLevel: 1, materials: { cristal_verde: 1, resina: 1 }, produces: { kind: "potion", basePower: 40 }, xp: 20 },
  { id: "pocao_media",        name: "Poção de Cura",         profession: "alquimista", minLevel: 20, materials: { cristal_verde: 2, prata: 1 }, produces: { kind: "potion", basePower: 90 }, xp: 60 },
  { id: "pocao_maior",        name: "Poção Maior",           profession: "alquimista", minLevel: 60, materials: { safira: 1, prata: 2, cristal_verde: 3 }, produces: { kind: "potion", basePower: 200 }, xp: 160 },
  { id: "elixir_divino",      name: "Elixir Divino",         profession: "alquimista", minLevel: 200,materials: { alma_corrompida: 2, safira: 2, rubi_flamejante: 2 }, produces: { kind: "potion", basePower: 600 }, xp: 900, secret: true, hidden: true },
  // Joalheiro (gemas polidas)
  { id: "gema_safira",        name: "Safira Lapidada",       profession: "joalheiro", minLevel: 30, materials: { safira: 1, quartzo: 2 }, produces: { kind: "material", basePower: 15 }, xp: 50 },
  { id: "gema_rubi",          name: "Rubi Lapidado",         profession: "joalheiro", minLevel: 70, materials: { rubi_flamejante: 1, ouro: 1 }, produces: { kind: "material", basePower: 30 }, xp: 120 },
  { id: "gema_diamante",      name: "Diamante Talhado",      profession: "joalheiro", minLevel: 130,materials: { diamante_azul: 1, safira: 1 }, produces: { kind: "material", basePower: 60 }, xp: 260 },
  // Engenheiro (bombs / gadgets)
  { id: "bomba_ferro",        name: "Bomba de Ferro",        profession: "engenheiro", minLevel: 10, materials: { ferro_enferrujado: 2, resina: 2 }, produces: { kind: "weapon", basePower: 40 }, xp: 40 },
  { id: "torreta_titanio",    name: "Torreta de Titânio",    profession: "engenheiro", minLevel: 100,materials: { titanio: 5, mithril: 2, cristal_verde: 3 }, produces: { kind: "weapon", basePower: 260, slots: 2 }, xp: 500 },
  // Encantador
  { id: "runa_fogo",          name: "Runa de Fogo",          profession: "encantador", minLevel: 20, materials: { rubi_flamejante: 1, cristal_verde: 2 }, produces: { kind: "material", basePower: 12 }, xp: 60 },
  { id: "runa_gelo",          name: "Runa de Gelo",          profession: "encantador", minLevel: 25, materials: { cristal_congelado: 1, safira: 1 }, produces: { kind: "material", basePower: 12 }, xp: 70 },
  { id: "runa_sombra",        name: "Runa de Sombra",        profession: "encantador", minLevel: 80, materials: { cristal_sombrio: 2, onix: 1 }, produces: { kind: "material", basePower: 20 }, xp: 180 },
  // Cozinheiro (buffs)
  { id: "banquete_forca",     name: "Banquete da Força",     profession: "cozinheiro", minLevel: 15, materials: { madeira_antiga: 1, cristal_verde: 1, resina: 1 }, produces: { kind: "potion", basePower: 70 }, xp: 45 },
  { id: "banquete_divino",    name: "Banquete Divino",       profession: "cozinheiro", minLevel: 140,materials: { ouro: 2, safira: 1, rubi_flamejante: 1 }, produces: { kind: "potion", basePower: 320 }, xp: 400 },
  // Tecelão (mantos / armaduras leves)
  { id: "manto_iniciado",     name: "Manto do Iniciado",     profession: "tecelao", minLevel: 1,  materials: { resina: 2, madeira_antiga: 1 }, produces: { kind: "armor", basePower: 14 }, xp: 20 },
  { id: "manto_arcano",       name: "Manto Arcano",          profession: "tecelao", minLevel: 40, materials: { safira: 1, cristal_verde: 3, prata: 1 }, produces: { kind: "armor", basePower: 80, slots: 2 }, xp: 130 },
  { id: "manto_abissal",      name: "Manto Abissal",         profession: "tecelao", minLevel: 180,materials: { minerio_abissal: 2, cristal_sombrio: 3, alma_corrompida: 1 }, produces: { kind: "armor", basePower: 320, slots: 3 }, xp: 900, secret: true, hidden: true },
];

const QUALITY_ORDER: ItemQuality[] = ["comum","bom","excelente","perfeito","obra-prima","lendario","divino"];

function rollQuality(profLevel: number, minLevel: number): ItemQuality {
  const gap = profLevel - minLevel;
  // Overhauled: skill scales much faster and biases toward high tiers
  const skill = Math.min(1, Math.max(0, (gap + 20) / 60));
  const base = 1.2 + skill * 4.5;
  const jitter = (Math.random() - 0.3) * 1.4;
  let idx = Math.round(base + jitter);
  if (idx < 0) idx = 0;
  if (idx > QUALITY_ORDER.length - 1) idx = QUALITY_ORDER.length - 1;
  return QUALITY_ORDER[idx];
}

function successChance(profLevel: number, minLevel: number): number {
  const gap = profLevel - minLevel;
  // Overhauled: high floor, quickly hits cap
  const base = 0.85 + gap * 0.03;
  return Math.max(0.55, Math.min(0.995, base));
}

let cSeq = 0;
function craftedItem(rec: Recipe, quality: ItemQuality): Item {
  cSeq++;
  const mult = QUALITY_MULT[quality];
  const power = Math.max(1, Math.round(rec.produces.basePower * mult));
  const color = quality === "divino" ? "#fff080" : quality === "lendario" ? "#f0b040"
    : quality === "obra-prima" ? "#ff8060" : quality === "perfeito" ? "#c25ef0"
    : quality === "excelente" ? "#5ea8ff" : quality === "bom" ? "#5ecf5e" : "#c8c8c8";
  const rarity = quality === "divino" || quality === "lendario" ? "lendário"
    : quality === "obra-prima" ? "épico"
    : quality === "perfeito" ? "raro"
    : quality === "excelente" ? "raro" : "comum";
  return {
    id: `c_${cSeq}`,
    name: rec.name,
    kind: rec.produces.kind,
    rarity,
    power,
    icon: rec.produces.kind === "weapon" ? "⚔" : rec.produces.kind === "armor" ? "🛡" : rec.produces.kind === "potion" ? "🧪" : "◈",
    color,
    quality,
    slots: rec.produces.slots ?? 0,
    gems: [],
    evolution: 0,
  };
}

export function canCraftRecipe(g: GameState, recipeId: string): { ok: boolean; reason?: string; recipe?: Recipe } {
  const rec = RECIPES.find(r => r.id === recipeId);
  if (!rec) return { ok: false, reason: "receita desconhecida" };
  const prof = g.player.professions[rec.profession];
  if (prof.level < rec.minLevel) return { ok: false, reason: `${PROFESSION_NAME[rec.profession]} ${rec.minLevel}+ necessário`, recipe: rec };
  for (const [ore, need] of Object.entries(rec.materials)) {
    const have = g.player.materials[ore] ?? 0;
    if (have < (need as number)) return { ok: false, reason: `faltam materiais`, recipe: rec };
  }
  return { ok: true, recipe: rec };
}

export function craft(g: GameState, recipeId: string, log: (m: string, c?: string) => void): boolean {
  const check = canCraftRecipe(g, recipeId);
  if (!check.ok || !check.recipe) { log(check.reason ?? "não pode fabricar", "#ff8060"); return false; }
  const rec = check.recipe;
  const prof = g.player.professions[rec.profession];
  // Consume mats up-front — failures only waste 15%, crit success may refund
  const chance = successChance(prof.level, rec.minLevel);
  const success = Math.random() < chance;
  const critFail = !success && Math.random() < 0.15;
  const critSuccess = success && Math.random() < 0.25;
  const refund = critSuccess && Math.random() < 0.4;
  for (const [ore, need] of Object.entries(rec.materials)) {
    let spend = need as number;
    if (!success) spend = critFail ? Math.ceil((need as number) * 0.35) : Math.ceil((need as number) * 0.15);
    else if (refund) spend = Math.max(1, Math.floor((need as number) * 0.5));
    g.player.materials[ore] = (g.player.materials[ore] ?? 0) - spend;
    if (g.player.materials[ore] < 0) g.player.materials[ore] = 0;
  }
  if (!success) {
    log(`Falha ao fabricar ${rec.name} (materiais parciais preservados).`, "#ff8060");
    g.player.gainProfessionXp(rec.profession, Math.floor(rec.xp * 0.8), log);
    return false;
  }
  // Crit success: bumps quality by up to 3 tiers and may output an extra item
  const baseQ = rollQuality(prof.level, rec.minLevel);
  const quality = critSuccess
    ? QUALITY_ORDER[Math.min(QUALITY_ORDER.length - 1, QUALITY_ORDER.indexOf(baseQ) + 3)]
    : baseQ;
  const it = craftedItem(rec, quality);
  if (g.player.inventory.length < 32) g.player.inventory.push(it);
  else log("Inventário cheio!", "#ff8060");
  // Bonus duplicate on lucky crit
  if (critSuccess && Math.random() < 0.35 && g.player.inventory.length < 32) {
    const bonus = craftedItem(rec, baseQ);
    g.player.inventory.push(bonus);
    log(`Bônus: uma cópia extra de ${bonus.name}!`, "#f0b040");
  }
  g.player.gainProfessionXp(rec.profession, Math.floor(rec.xp * 1.8), log);
  log(`Fabricou ${it.name} (${quality})${critSuccess ? " ✨" : ""}${refund ? " ♻" : ""}`, it.color);
  maybeDiscoverSecret(g, rec, log);
  return true;
}

function maybeDiscoverSecret(g: GameState, made: Recipe, log: (m: string, c?: string) => void) {
  for (const rec of RECIPES) {
    if (!rec.secret || !rec.hidden) continue;
    if (g.player.recipesKnown.has(rec.id)) continue;
    // Overlap threshold: at least half of the secret's materials were used
    const secretMats = Object.keys(rec.materials) as OreKind[];
    const madeMats = Object.keys(made.materials) as OreKind[];
    const overlap = secretMats.filter(m => madeMats.includes(m)).length;
    if (overlap >= Math.max(2, Math.floor(secretMats.length / 2))) {
      if (Math.random() < 0.15) {
        g.player.recipesKnown.add(rec.id);
        log(`Receita secreta descoberta: ${rec.name}!`, "#c25ef0");
      }
    }
  }
}

// ----- Enchant / gem / evolution -----
const ENCHANT_LIST: Enchant[] = ["fogo","gelo","veneno","luz","sombra","raio","sangramento","vampirismo","critico","velocidade","mana","hp"];

export function enchantItem(g: GameState, invIdx: number, log: (m: string, c?: string) => void): boolean {
  const it = g.player.inventory[invIdx];
  if (!it || (it.kind !== "weapon" && it.kind !== "armor")) { log("Só arma ou armadura pode ser encantada.", "#ff8060"); return false; }
  const need = (g.player.materials["cristal_verde"] ?? 0);
  if (need < 2) { log("Faltam 2 Cristais Verdes para encantar.", "#ff8060"); return false; }
  g.player.materials["cristal_verde"] -= 2;
  const prof = g.player.professions.encantador;
  const success = Math.random() < 0.85 + prof.level * 0.002;
  if (!success) { log(`Encantamento falhou em ${it.name}.`, "#ff8060"); return false; }
  
  const el = ENCHANT_LIST[Math.floor(Math.random() * ENCHANT_LIST.length)];
  it.enchant = el;
  
  // Scaling power based on profession level!
  const mult = 1.45 + prof.level * 0.015;
  it.power = Math.floor(it.power * mult) + 15 + Math.floor(prof.level * 1.5);
  
  // Custom Quality increase chance
  const qualRoll = Math.random();
  if (qualRoll > 0.95) {
    it.quality = "obra-prima";
    it.power = Math.floor(it.power * 1.15);
    log(`✨ CRIAÇÃO PERFEITA! ${it.name} virou uma Obra-Prima!`, "#ffd700");
  } else if (qualRoll > 0.82) {
    it.quality = "excelente";
    it.power = Math.floor(it.power * 1.08);
    log(`✨ Encantamento Excelente em ${it.name}!`, "#a8e0ff");
  } else {
    it.quality = "bom";
  }

  log(`Sucesso! ${it.name} agora possui encantamento de ${el.toUpperCase()} (+${it.power} poder total).`, "#c25ef0");
  g.player.gainProfessionXp("encantador", 120, log);
  return true;
}

export function socketGem(g: GameState, invIdx: number, gemOre: OreKind, log: (m: string, c?: string) => void): boolean {
  const it = g.player.inventory[invIdx];
  if (!it) return false;
  
  // Enrich: auto-generate slots if not present so players can socket rare items!
  if (it.slots === undefined) {
    it.slots = it.rarity === "lendário" ? 3 : it.rarity === "épico" ? 2 : 1;
  }
  
  if (it.slots <= (it.gems?.length ?? 0)) { log("Sem slot livre nesta peça.", "#ff8060"); return false; }
  const have = g.player.materials[gemOre] ?? 0;
  if (have < 1) { log("Sem gema no inventário de materiais.", "#ff8060"); return false; }
  const meta = ORES[gemOre];
  if (!meta.gem) { log("Este material não é uma gema de encaixe.", "#ff8060"); return false; }
  
  g.player.materials[gemOre]--;
  it.gems = it.gems ?? [];
  it.gems.push(gemOre);
  
  // Rich stat/power increases based on specific socketed gem!
  let bonusPower = Math.max(12, Math.floor(meta.xp * 1.8));
  if (gemOre === "safira") {
    bonusPower += 20; // bonus intelligence scale
    log(`💎 Gema de Safira adicionou bônus de Inteligência e Fluxo!`, "#4080ff");
  } else if (gemOre === "rubi_flamejante") {
    bonusPower += 35; // fire damage power
    log(`🔥 Rubi Flamejante adicionou bônus massivo de Força e Impacto!`, "#ff5040");
  } else if (gemOre === "cristal_sombrio") {
    bonusPower += 30; // shadow agility
    log(`🌌 Cristal Sombrio adicionou bônus de Destreza e Sombra!`, "#7040c0");
  } else if (gemOre === "diamante_azul") {
    bonusPower += 50; // ultimate tanking gem
    log(`🛡️ Diamante Azul adicionou Defesa Suprema e Saúde Estelar!`, "#80c0ff");
  }

  it.power += bonusPower;
  it.color = RARITY_COLOR[it.rarity];
  log(`Encaixou com sucesso ${meta.name} em ${it.name} (+${bonusPower} Poder).`, meta.color);
  g.player.gainProfessionXp("joalheiro", 90, log);
  return true;
}

export function evolveItem(g: GameState, invIdx: number, log: (m: string, c?: string) => void): boolean {
  const it = g.player.inventory[invIdx];
  if (!it || (it.kind !== "weapon" && it.kind !== "armor")) { log("Só arma/armadura pode evoluir.", "#ff8060"); return false; }
  const ev = (it.evolution ?? 0);
  const cost = 3 + ev * 3;
  const needOre: OreKind = ev < 2 ? "ferro_enferrujado" : ev < 4 ? "mithril" : ev < 6 ? "adamantita" : "minerio_abissal";
  const have = g.player.materials[needOre] ?? 0;
  if (have < cost) { log(`Faltam ${cost} ${ORES[needOre].name} para evoluir para o próximo nível.`, "#ff8060"); return false; }
  g.player.materials[needOre] -= cost;
  
  const success = Math.random() < 0.95 - ev * 0.03;
  if (!success) { 
    log(`Evolução falhou. Parte dos materiais foi preservada.`, "#ff8060"); 
    g.player.materials[needOre] += Math.floor(cost * 0.5); 
    return false; 
  }
  
  it.evolution = ev + 1;
  const label = it.evolution <= 2 ? "+".repeat(it.evolution)
    : it.evolution === 3 ? " Suprema"
    : it.evolution === 4 ? " Mítica"
    : it.evolution === 5 ? " Lendária"
    : " Divina";
  const baseName = it.name.replace(/\+.*$| Suprema$| Mítica$| Lendária$| Divina$/, "");
  it.name = `${baseName}${label}`;
  
  // Power scales massively with each evolution stage
  const scaleMult = 1.55 + (it.evolution * 0.05);
  it.power = Math.floor(it.power * scaleMult) + 18 + (it.evolution * 10);
  
  log(`⚡ EVOLUÇÃO SUCESSO! ${it.name} atingiu novo patamar de poder (+${it.power} total).`, "#f0b040");
  return true;
}

export { PROFESSION_NAME };
