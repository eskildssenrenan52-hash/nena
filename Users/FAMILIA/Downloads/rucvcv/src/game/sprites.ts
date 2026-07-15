// Sprite loader: 32x32 PNGs for every enemy name, served from /sprites/<slug>.png

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getEnemySlug(name: string): string {
  const lower = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Bosses first
  if (lower.includes("patriarca") || lower.includes("senhor da lama")) return "boss_patriarca_nox";
  if (lower.includes("arbitro") || lower.includes("divino") || lower.includes("alvorecer") || lower.includes("serafim") || lower.includes("anjo")) return "boss_arbitro_ceu";
  if (lower.includes("caos") || lower.includes("demonio") || lower.includes("diabrete") || lower.includes("magma") || lower.includes("tita")) return "boss_caos_encarnado";
  if (lower.includes("colosso") || lower.includes("ironclad") || lower.includes("forjador") || lower.includes("maquina")) return "boss_colosso_encouracado";
  if (lower.includes("criador") || lower.includes("devorador do sol") || lower.includes("sentinela")) return "boss_devorador_sol";
  if (lower.includes("guardiao de")) return "golem_gema";
  if (lower.includes("silvestre") || lower.includes("floral") || lower.includes("ancestral") || lower.includes("guardiao")) return "boss_guardia_silvestre";
  if (lower.includes("cristal") || lower.includes("bioluminescente") || lower.includes("micelio")) return "boss_imperatriz_cristal";
  if (lower.includes("fogo") || lower.includes("magma") || lower.includes("obsidiana")) return "boss_senhor_fogo";
  if (lower.includes("inverno") || lower.includes("permafrost") || lower.includes("gelo") || lower.includes("lich") || lower.includes("boreal")) return "boss_soberano_inverno";
  if (lower.includes("abisso") || lower.includes("profundezas") || lower.includes("lorde")) return "boss_terror_abismo";

  // Monsters
  if (lower.includes("agua viva") || lower.includes("polvo") || lower.includes("kraken") || lower.includes("tentaculo") || lower.includes("devorador") || lower.includes("coisa")) return "agua_viva_abissal";
  if (lower.includes("aparicao") || lower.includes("espirito de fumaca") || lower.includes("eco sombrio") || lower.includes("sombra")) return "aparicao_poeira";
  if (lower.includes("aranha") || lower.includes("larva")) return "aranha_pedra";
  if (lower.includes("basilisco") || lower.includes("salamandra") || lower.includes("lagarto")) return "basilisco_deserto";
  if (lower.includes("yeti") || lower.includes("trol")) return "batedor_yeti";
  if (lower.includes("besouro") || lower.includes("broto") || lower.includes("traca")) return "besouro_cristal";
  if (lower.includes("bruxa") || lower.includes("naga")) return "bruxa_pantano";
  if (lower.includes("cavaleiro") || lower.includes("soldado") || lower.includes("legionario") || lower.includes("pirata") || lower.includes("corsario") || lower.includes("bandido") || lower.includes("salteador") || lower.includes("ladrao")) return "cavaleiro_caos";
  if (lower.includes("diabrete") || lower.includes("fada")) return "diabrete_lava";
  if (lower.includes("draco") || lower.includes("dragao") || lower.includes("draconiano")) return "draco_fogo";
  if (lower.includes("gelo") || lower.includes("glacial") || lower.includes("gelido") || lower.includes("artico") || lower.includes("zefiro") || lower.includes("ar") || lower.includes("lava") || lower.includes("raio") || lower.includes("voltaico") || lower.includes("liquido") || lower.includes("elemental")) return "elemental_gelo";
  if (lower.includes("ent") || lower.includes("treant") || lower.includes("raiz") || lower.includes("espinho")) return "ent_corrompido";
  if (lower.includes("escorpiao")) return "escorpiao_areia";
  if (lower.includes("espectro") || lower.includes("vigia")) return "espectro_vazio";
  if (lower.includes("vento") || lower.includes("djinn") || lower.includes("vortice")) return "espirito_zefiro";
  if (lower.includes("espreitador") || lower.includes("verme")) return "espreitador_pantano";
  if (lower.includes("esqueleto")) return "esqueleto_cinzas";
  if (lower.includes("fenda") || lower.includes("estrela") || lower.includes("fragmento")) return "fenda_caos";
  if (lower.includes("gargula") || lower.includes("estatua")) return "gargula_estilhaco";
  if (lower.includes("monge")) return "gargula_tempestade";
  if (lower.includes("goblin") || lower.includes("ogro") || lower.includes("anao")) return "goblin_floresta";
  if (lower.includes("golem")) return "golem_gema";
  if (lower.includes("lobo") || lower.includes("matriarca") || lower.includes("alfa") || lower.includes("cao") || lower.includes("onca") || lower.includes("javali")) return "lobo_gelido";
  if (lower.includes("minerador") || lower.includes("zumbi") || lower.includes("necrofago") || lower.includes("campones") || lower.includes("necromante") || lower.includes("aprendiz")) return "minerador_mortovivo";
  if (lower.includes("morcego") || lower.includes("rato") || lower.includes("vagalume")) return "morcego_caverna";
  if (lower.includes("peixe") || lower.includes("sereia")) return "peixe_lanterna";
  if (lower.includes("ninfa")) return "sereia_assassina";
  if (lower.includes("slime de esporos") || lower.includes("slime toxico")) return "slime_esporos";
  if (lower.includes("slime")) return "slime_lama";
  if (lower.includes("valquiria") || lower.includes("harpia") || lower.includes("aguia") || lower.includes("roc") || lower.includes("wyvern") || lower.includes("grifo")) return "valquiria_nuvem";

  // Fallback to slugified name
  return slugify(name).replace(/-/g, "_");
}

type Entry = { img: HTMLImageElement | null; failed: boolean };
const cache = new Map<string, Entry>();

function enemySlugCandidates(name: string): string[] {
  const mapped = getEnemySlug(name);
  const raw = slugify(name);
  const rawUnderscore = raw.replace(/-/g, "_");
  const stripped = raw
    .replace(/-anciao$/, "")
    .replace(/-colossal$/, "")
    .replace(/-cosmico$/, "")
    .replace(/-/g, "_");

  return Array.from(new Set([mapped, rawUnderscore, stripped, raw]));
}

function getAttemptsForSlug(slug: string): string[] {
  // 1. Skins, e.g. skin-melee-0
  if (slug.startsWith("skin-")) {
    return [
      `/sprites/${slug}.png`,
      `/sprites/organized/skins/${slug}.svg`,
    ];
  }

  // 2. Class IDs
  const classesList = [
    "melee", "magic", "paladin", "necro", "archer",
    "druid", "assassin", "warlock", "samurai", "monk",
    "bard", "gunslinger", "alchemist", "vampire", "reaper"
  ];
  if (classesList.includes(slug)) {
    return [
      `/sprites/${slug}.png`,
      `/sprites/organized/classes/${slug}.svg`,
    ];
  }

  // 3. Enemies
  const normalized = slug.toLowerCase().trim();
  const slugDashed = normalized.replace(/_/g, "-");
  const slugUnderscored = normalized.replace(/-/g, "_");
  
  return [
    `/sprites/${slugDashed}.png`,
    `/sprites/${slugUnderscored}.png`,
    `/sprites/organized/enemies/${slugDashed}.png`,
    `/sprites/enemies/${slugDashed}.png`,
    `/sprites/organized/enemies/${slugDashed}.svg`,
    `/sprites/organized/enemies/${slugUnderscored}.svg`,
    `/sprites/enemies/${slugDashed}.svg`,
    `/sprites/enemies/${slugUnderscored}.svg`,
    `/sprites/${slugDashed}.svg`,
  ];
}

function loadFirstAvailableSprite(candidates: string[]): HTMLImageElement | null {
  const key = candidates.join("|");
  let e = cache.get(key);
  if (!e) {
    const img = new Image();
    e = { img, failed: false };
    cache.set(key, e);

    const attempts = Array.from(new Set(candidates.flatMap(getAttemptsForSlug)));
    let idx = 0;
    img.onerror = () => {
      idx += 1;
      if (idx < attempts.length) {
        img.src = attempts[idx]!;
      } else {
        const entry = cache.get(key);
        if (entry) {
          entry.img = null;
          entry.failed = true;
        }
      }
    };
    img.src = attempts[idx]!;
  }

  if (e.failed || !e.img) return null;
  return e.img.complete && e.img.naturalWidth > 0 ? e.img : null;
}

export function getEnemySprite(name: string): HTMLImageElement | null {
  return loadFirstAvailableSprite(enemySlugCandidates(name));
}

export function getSpriteBySlug(slug: string): HTMLImageElement | null {
  return loadFirstAvailableSprite([slug]);
}

