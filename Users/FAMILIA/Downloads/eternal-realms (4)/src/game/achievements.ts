import { type GameState } from "./game";

export type Achievement = {
  id: string;
  name: string;
  category: "combate" | "chefes" | "riqueza" | "mineracao" | "nivel" | "magia" | "exploracao" | "forja" | "alquimia" | "sobrevivencia";
  desc: string;
  bonusDesc: string;
  check: (g: GameState) => boolean;
};

// Generate 100 achievements programmatically with highly thematic names and clear requirements.
export const ACHIEVEMENTS: Achievement[] = [];

// Category 1: Senda da Espada (Combat - Kills)
const combatTiers = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const combatNames = [
  "Iniciado da Espada",
  "Combatente Ávido",
  "Veterano de Asterion",
  "Ceifador de Monstros",
  "Gladiador das Planícies",
  "Algoz do Subsolo",
  "Sombra de Sangue",
  "Campeão Celestial",
  "Lenda da Batalha",
  "Deus da Guerra de Asterion"
];
combatTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `combat_${idx + 1}`,
    name: combatNames[idx],
    category: "combate",
    desc: `Derrote ${tier} inimigos no total.`,
    bonusDesc: `+${idx + 1}% de Dano Físico e Mágico`,
    check: (g) => g.kills >= tier
  });
});

// Category 2: Caçador de Titãs (Boss Kills)
const bossTiers = [1, 2, 5, 8, 12, 18, 25, 40, 60, 100];
const bossNames = [
  "Matador de Gigantes",
  "Desafiador do Caos",
  "Rastreador de Feras",
  "Ruína dos Líderes",
  "Aniquilador de Titãs",
  "Flagelo dos Anciões",
  "Soberano dos Chefes",
  "Ceifador de Dragões",
  "Executor de Semideuses",
  "Eterno Conquistador de Reis"
];
bossTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `boss_${idx + 1}`,
    name: bossNames[idx],
    category: "chefes",
    desc: `Derrote ${tier} chefes de bioma ou dungeon.`,
    bonusDesc: `+${idx + 1} STR e +${idx + 1} VIT`,
    check: (g) => g.bossKills >= tier
  });
});

// Category 3: Senhor do Ouro (Wealth - Gold)
const goldTiers = [100, 500, 1500, 5000, 12000, 30000, 75000, 150000, 400000, 1000000];
const goldNames = [
  "Mendigo Sortudo",
  "Bolsa Cheia",
  "Mercador Viajante",
  "Negociante de Asterion",
  "Burguês de Elite",
  "Magnata do Subsolo",
  "Cofre Imperial",
  "Tesouro de Dragão",
  "Toque de Midas",
  "Soberano da Economia"
];
goldTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `gold_${idx + 1}`,
    name: goldNames[idx],
    category: "riqueza",
    desc: `Possua ${tier} moedas de ouro simultaneamente.`,
    bonusDesc: `+${idx + 1}% de Chance de Drop Crítico`,
    check: (g) => g.player.gold >= tier
  });
});

// Category 4: Mestre Escavador (Mining level)
const miningTiers = [2, 5, 10, 15, 20, 28, 38, 50, 70, 100];
const miningNames = [
  "Cavadela Inicial",
  "Garimpeiro de Cobre",
  "Quebrador de Rochas",
  "Explorador de Veios",
  "Pico de Aço",
  "Geólogo do Abismo",
  "Mestre das Gemas",
  "Forjador de Cristais",
  "Escavador das Estrelas",
  "Arquiteto Telúrico Celestial"
];
miningTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `mining_${idx + 1}`,
    name: miningNames[idx],
    category: "mineracao",
    desc: `Alcance o nível ${tier} de Mineração.`,
    bonusDesc: `+${(idx + 1) * 2}% de Velocidade de Mineração`,
    check: (g) => g.player.miningLevel >= tier
  });
});

// Category 5: Coração de Dragão (Character level)
const levelTiers = [2, 5, 10, 15, 20, 28, 38, 50, 75, 100];
const levelNames = [
  "Primeiro Passo",
  "Iniciado de Asterion",
  "Aventureiro Promissor",
  "Herói Local",
  "Força Emergente",
  "Campeão do Continente",
  "Lenda Viva",
  "Ascensão Divina",
  "Semideus Desperto",
  "O Eterno de Asterion"
];
levelTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `level_${idx + 1}`,
    name: levelNames[idx],
    category: "nivel",
    desc: `Alcance o nível ${tier} de personagem.`,
    bonusDesc: `+${(idx + 1) * 5} HP Máximo`,
    check: (g) => g.player.level >= tier
  });
});

// Category 6: Mente Cósmica (Intelligence Attribute / Magic)
const intTiers = [6, 10, 15, 22, 30, 42, 56, 75, 100, 150];
const intNames = [
  "Brilho da Mente",
  "Foco Intelectual",
  "Erudito de Runas",
  "Canalizador de Mana",
  "Mago da Academia",
  "Sábio do Trovão",
  "Arquimago Supremo",
  "Mente Infinitesimal",
  "Avatar do Conhecimento",
  "Olho do Cosmos Eterno"
];
intTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `magic_${idx + 1}`,
    name: intNames[idx],
    category: "magia",
    desc: `Alcance ${tier} de Inteligência (INT).`,
    bonusDesc: `+${(idx + 1) * 3} MP Máximo`,
    check: (g) => g.player.attr.int >= tier
  });
});

// Category 7: Explorador do Abismo (Grand Dungeon floors)
const dFloorTiers = [2, 5, 10, 15, 25, 38, 50, 70, 90, 100];
const dFloorNames = [
  "Passos na Entrada",
  "Invasor de Masmorra",
  "Caminhante do Escuro",
  "Sobrevivente do Labirinto",
  "Desafiador do Abismo",
  "Conquistador das Criptas",
  "Lenda da Escuridão",
  "Desbravador do Infinito",
  "Portador da Luz no Vazio",
  "Conquistador Celestial de Asterion"
];
dFloorTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `explore_${idx + 1}`,
    name: dFloorNames[idx],
    category: "exploracao",
    desc: `Alcance o andar ${tier} da Masmorra de 100 andares.`,
    bonusDesc: `+${idx + 1} em Todos os Atributos`,
    check: (g) => g.activeGrandFloor >= tier
  });
});

// Category 8: Forjador Eterno (Ferreiro level)
const forgeTiers = [2, 3, 5, 8, 11, 15, 20, 25, 30, 40];
const forgeNames = [
  "Batedor de Metal",
  "Aprendiz de Bigorna",
  "Temperador de Aço",
  "Forjador Rúnico",
  "Mestre das Armaduras",
  "Ferreiro da Guilda",
  "Artefato Perfeito",
  "Forja Imperial",
  "Mito da Siderurgia",
  "Vulcão da Criação de Asterion"
];
forgeTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `forge_${idx + 1}`,
    name: forgeNames[idx],
    category: "forja",
    desc: `Alcance o nível ${tier} de Ferreiro.`,
    bonusDesc: `+${idx + 1}% de Defesa de Armadura`,
    check: (g) => (g.player.professions.ferreiro?.level ?? 1) >= tier
  });
});

// Category 9: Grande Alquimista (Alchemist level)
const alchTiers = [2, 3, 5, 8, 11, 15, 20, 25, 30, 40];
const alchNames = [
  "Mistura Simples",
  "Destilador Iniciante",
  "Catalisador de Ervas",
  "Transmutador de Éter",
  "Elixir de Vitalidade",
  "Mestre de Filtros",
  "Fórmula Secreta",
  "Sábio das Poções",
  "Pedra Filosofal",
  "Criador de Milagres"
];
alchTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `alch_${idx + 1}`,
    name: alchNames[idx],
    category: "alquimia",
    desc: `Alcance o nível ${tier} de Alquimista.`,
    bonusDesc: `+${(idx + 1) * 2}% de Eficácia das Poções`,
    check: (g) => (g.player.professions.alquimista?.level ?? 1) >= tier
  });
});

// Category 10: Lenda da Sobrevivência (Vitality Attribute / HP)
const vitTiers = [10, 15, 22, 30, 40, 52, 66, 82, 100, 130];
const vitNames = [
  "Casca Dura",
  "Fôlego de Ferro",
  "Resistência de Pedra",
  "Sangue de Touro",
  "Escudo de Carne",
  "Inabalável",
  "Indestrutível",
  "Coração de Carvalho",
  "Fortaleza Viva",
  "Imortalidade Terrestre"
];
vitTiers.forEach((tier, idx) => {
  ACHIEVEMENTS.push({
    id: `surv_${idx + 1}`,
    name: vitNames[idx],
    category: "sobrevivencia",
    desc: `Alcance ${tier} de Vitalidade (VIT).`,
    bonusDesc: `+${(idx + 1) * 0.25} HP Regenerado por Segundo`,
    check: (g) => g.player.attr.vit >= tier
  });
});

// Calculate passive stat bonuses dynamically from unlocked achievements
export function getAchievementBonuses(g: GameState) {
  let dmgMult = 1.0;
  let strBonus = 0;
  let vitBonus = 0;
  let critBonus = 0;
  let miningSpeedMult = 1.0;
  let extraHp = 0;
  let extraMp = 0;
  let allStatsBonus = 0;
  let defMult = 1.0;
  let potionBonus = 1.0;
  let hpRegen = 0;

  let unlockedCount = 0;

  for (const ach of ACHIEVEMENTS) {
    if (ach.check(g)) {
      unlockedCount++;
      const idx = parseInt(ach.id.split("_")[1]) - 1; // 0..9

      if (ach.category === "combate") {
        dmgMult += (idx + 1) * 0.01;
      } else if (ach.category === "chefes") {
        strBonus += idx + 1;
        vitBonus += idx + 1;
      } else if (ach.category === "riqueza") {
        critBonus += idx + 1;
      } else if (ach.category === "mineracao") {
        miningSpeedMult += (idx + 1) * 0.02;
      } else if (ach.category === "nivel") {
        extraHp += (idx + 1) * 5;
      } else if (ach.category === "magia") {
        extraMp += (idx + 1) * 3;
      } else if (ach.category === "exploracao") {
        allStatsBonus += idx + 1;
      } else if (ach.category === "forja") {
        defMult += (idx + 1) * 0.01;
      } else if (ach.category === "alquimia") {
        potionBonus += (idx + 1) * 0.02;
      } else if (ach.category === "sobrevivencia") {
        hpRegen += (idx + 1) * 0.25;
      }
    }
  }

  return {
    unlockedCount,
    dmgMult,
    strBonus: strBonus + allStatsBonus,
    vitBonus: vitBonus + allStatsBonus,
    intBonus: allStatsBonus,
    agiBonus: allStatsBonus,
    critBonus,
    miningSpeedMult,
    extraHp,
    extraMp,
    defMult,
    potionBonus,
    hpRegen
  };
}

// Global variable to keep track of unlocked states so we don't spam notifications
const notifiedAchievements: Record<string, boolean> = {};

export function checkAchievements(g: GameState) {
  let newlyUnlocked = false;
  for (const ach of ACHIEVEMENTS) {
    if (ach.check(g) && !notifiedAchievements[ach.id]) {
      notifiedAchievements[ach.id] = true;
      newlyUnlocked = true;
      // Floater banner
      g.floaters.push({
        x: g.player.pos.x,
        y: g.player.pos.y - 36,
        text: `★ AMBIÇÃO CONQUISTADA: ${ach.name} ★`,
        color: "#f0c040",
        life: 3.5,
        vy: -24
      });
      // Add a beautifully colored message to log chat!
      g.log.unshift({
        text: `[CONQUISTA] Desbloqueou: "${ach.name}" (${ach.desc})! Bônus: ${ach.bonusDesc}`,
        color: "#ffc83b",
        life: 15
      });
      if (g.log.length > 8) g.log.pop();
    }
  }
  return newlyUnlocked;
}
