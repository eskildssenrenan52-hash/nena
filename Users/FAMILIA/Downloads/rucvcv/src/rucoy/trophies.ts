import { getOverlayState, setOverlayState } from "./store";
import { type GameState } from "@/game/game";

export interface TrophyMilestone {
  trophies: number;
  rewardType: "gold" | "gems" | "chest" | "skin" | "pet";
  rewardAmount: number;
  rewardNamePt: string;
  rewardNameEn: string;
}

// 1. Translation dictionary for the entire Trophy System, Customization & Shop (pt/en)
export const TROPHY_TRANSLATIONS = {
  pt: {
    trophies: "Troféus",
    unlocked: "Desbloqueado",
    claimed: "Coletado",
    claim: "Coletar",
    locked: "Bloqueado",
    progress: "Progresso",
    trophyRoad: "Caminho de Troféus",
    customization: "Customização",
    virtualStore: "Loja Virtual",
    categories: "Categorias",
    equipped: "Equipado",
    equip: "Equipar",
    buy: "Comprar",
    noCoins: "Ouro insuficiente!",
    noGems: "Gemas insuficientes!",
    successBuy: "Adquirido com sucesso!",
    milestoneReward: "Recompensa de Marco!",
    congrats: "Parabéns!",
    obtained: "Você obteve:",
    gainedTrophies: "Ganhou troféus!",
    newFloorTrophy: "Alcançou um novo andar!",
    defeatTrophy: "Derrotou um oponente!",
    normalEnemy: "Monstro comum",
    eliteEnemy: "Monstro de elite",
    bossEnemy: "Chefe de bioma",
    activeEffects: "Efeitos Ativos",
    customOptions: "Customizações",
    language: "Idioma",
    stats: "Estatísticas",
  },
  en: {
    trophies: "Trophies",
    unlocked: "Unlocked",
    claimed: "Claimed",
    claim: "Claim",
    locked: "Locked",
    progress: "Progress",
    trophyRoad: "Trophy Road",
    customization: "Customization",
    virtualStore: "Virtual Shop",
    categories: "Categories",
    equipped: "Equipped",
    equip: "Equip",
    buy: "Buy",
    noCoins: "Not enough gold!",
    noGems: "Not enough gems!",
    successBuy: "Successfully purchased!",
    milestoneReward: "Milestone Reward!",
    congrats: "Congratulations!",
    obtained: "You obtained:",
    gainedTrophies: "Gained trophies!",
    newFloorTrophy: "Reached a new floor!",
    defeatTrophy: "Defeated an opponent!",
    normalEnemy: "Common monster",
    eliteEnemy: "Elite monster",
    bossEnemy: "Biome boss",
    activeEffects: "Active Effects",
    customOptions: "Customizations",
    language: "Language",
    stats: "Stats",
  }
};

// 2. Generate 2000 milestones programmatically from 50 to 100,000 trophies
export function getTrophyMilestones(): TrophyMilestone[] {
  const list: TrophyMilestone[] = [];
  for (let t = 50; t <= 100000; t += 50) {
    let rewardType: TrophyMilestone["rewardType"] = "gold";
    let rewardAmount = 100;
    let rewardNamePt = "";
    let rewardNameEn = "";

    const level = t / 50;
    if (t === 50) {
      rewardType = "skin";
      rewardAmount = 1;
      rewardNamePt = "Título: Novato Incansável";
      rewardNameEn = "Title: Tireless Rookie";
    } else if (t === 500) {
      rewardType = "pet";
      rewardAmount = 1;
      rewardNamePt = "Pet: Mini Titan";
      rewardNameEn = "Pet: Mini Titan";
    } else if (t === 1000) {
      rewardType = "skin";
      rewardAmount = 1;
      rewardNamePt = "Efeito de Rastro: Rastro de Fogo";
      rewardNameEn = "Trail Effect: Fire Trail";
    } else if (t === 5000) {
      rewardType = "pet";
      rewardAmount = 1;
      rewardNamePt = "Pet: Sentinela Dourado";
      rewardNameEn = "Pet: Golden Sentinel";
    } else if (t === 10000) {
      rewardType = "skin";
      rewardAmount = 1;
      rewardNamePt = "Título: Lenda Imperial";
      rewardNameEn = "Title: Imperial Legend";
    } else if (t === 50000) {
      rewardType = "skin";
      rewardAmount = 1;
      rewardNamePt = "Aura do Pet: Aura Cósmica";
      rewardNameEn = "Pet Aura: Cosmic Aura";
    } else if (t === 100000) {
      rewardType = "skin";
      rewardAmount = 1;
      rewardNamePt = "Título: Semideus Divino de Asterion";
      rewardNameEn = "Title: Divine Demigod of Asterion";
    } else if (level % 10 === 0) {
      // Major milestones
      rewardType = "gems";
      rewardAmount = 25 + Math.floor(level / 2);
      rewardNamePt = `${rewardAmount} Gemas`;
      rewardNameEn = `${rewardAmount} Gems`;
    } else if (level % 5 === 0) {
      rewardType = "chest";
      rewardAmount = 1 + Math.floor(level / 50);
      rewardNamePt = `Baú de Recompensa (x${rewardAmount})`;
      rewardNameEn = `Reward Chest (x${rewardAmount})`;
    } else {
      rewardType = "gold";
      rewardAmount = 200 + level * 20;
      rewardNamePt = `${rewardAmount} Moedas de Ouro`;
      rewardNameEn = `${rewardAmount} Gold Coins`;
    }

    list.push({
      trophies: t,
      rewardType,
      rewardAmount,
      rewardNamePt,
      rewardNameEn,
    });
  }
  return list;
}

// 3. Enemy trophy multipliers definition
export function getEnemyTrophyValue(enemyName: string, isBoss: boolean): number {
  if (isBoss) return 40; // Biome boss
  const lower = enemyName.toLowerCase();
  if (lower.includes("wyvern") || lower.includes("yeti") || lower.includes("vortice") || lower.includes("vigia-do-caos")) {
    return 8; // High tier
  }
  if (lower.includes("xama") || lower.includes("blindado") || lower.includes("anciao") || lower.includes("guerreiro")) {
    return 4; // Mid-tier
  }
  return 2; // Basic enemies
}

// 4. Trigger award with callbacks and storage
export function addTrophies(g: GameState, amount: number, reasonPt: string, reasonEn: string) {
  const currentOverlay = getOverlayState();
  const nextTrophies = currentOverlay.trophies + amount;
  
  // Save in local storage via our overlay store
  setOverlayState({ trophies: nextTrophies });

  // Floating text inside game canvas for real-time visual tracking
  g.floaters.push({
    x: g.player.pos.x,
    y: g.player.pos.y - 42,
    text: `+${amount} 🏆`,
    color: "#ffca28",
    life: 2.0,
    vy: -28,
  });

  // Dispatch global custom event for the React notification
  if (typeof window !== "undefined") {
    const event = new CustomEvent("trophy-gained", {
      detail: {
        amount,
        reasonPt,
        reasonEn,
        currentTrophies: nextTrophies,
      },
    });
    window.dispatchEvent(event);
  }
}
