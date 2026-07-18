// 30+ unlockable pets with unique attributes, roles and visuals.

export type PetRole = "attack" | "defense" | "support" | "utility" | "hybrid";

export interface Pet {
  id: string;
  name: string;
  icon: string;
  role: PetRole;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  attack: number;
  defense: number;
  hp: number;
  ability: string;
  unlockLevel: number;
  color: string;
}

export const PETS: Pet[] = [
  { id: "pet-1",  name: "Filhote de Dragão", icon: "🐉", role: "attack",  rarity: "epic",      attack: 24, defense: 8,  hp: 60,  ability: "Sopro flamejante a cada 8s", unlockLevel: 5,  color: "#ef4444" },
  { id: "pet-2",  name: "Lobo Espectral",    icon: "🐺", role: "attack",  rarity: "rare",      attack: 18, defense: 6,  hp: 45,  ability: "Uivo aumenta ataque em 10%", unlockLevel: 3,  color: "#94a3b8" },
  { id: "pet-3",  name: "Coruja Sábia",      icon: "🦉", role: "utility", rarity: "rare",      attack: 4,  defense: 4,  hp: 30,  ability: "+15% EXP em combate",         unlockLevel: 4,  color: "#a78bfa" },
  { id: "pet-4",  name: "Fênix Renascida",   icon: "🔥", role: "support", rarity: "legendary", attack: 14, defense: 10, hp: 70,  ability: "Revive 1x a cada 5 min",      unlockLevel: 15, color: "#fb923c" },
  { id: "pet-5",  name: "Gato Sombrio",      icon: "🐈‍⬛", role: "attack",  rarity: "common",    attack: 8,  defense: 2,  hp: 20,  ability: "Chance de critico +5%",       unlockLevel: 1,  color: "#111827" },
  { id: "pet-6",  name: "Golem de Pedra",    icon: "🗿", role: "defense", rarity: "epic",      attack: 6,  defense: 24, hp: 120, ability: "Absorve 8% do dano recebido", unlockLevel: 10, color: "#78716c" },
  { id: "pet-7",  name: "Slime Dourado",     icon: "🟡", role: "utility", rarity: "rare",      attack: 2,  defense: 4,  hp: 25,  ability: "+20% ouro coletado",          unlockLevel: 6,  color: "#facc15" },
  { id: "pet-8",  name: "Espírito da Mata",  icon: "🌿", role: "support", rarity: "rare",      attack: 6,  defense: 8,  hp: 45,  ability: "Cura 1% HP a cada 3s",        unlockLevel: 7,  color: "#22c55e" },
  { id: "pet-9",  name: "Águia Real",        icon: "🦅", role: "attack",  rarity: "rare",      attack: 16, defense: 4,  hp: 35,  ability: "Visão: revela inimigos",      unlockLevel: 8,  color: "#eab308" },
  { id: "pet-10", name: "Tartaruga Ancestral",icon: "🐢", role: "defense", rarity: "epic",     attack: 4,  defense: 20, hp: 100, ability: "Reduz dano físico em 12%",    unlockLevel: 12, color: "#0d9488" },
  { id: "pet-11", name: "Serpente do Vazio", icon: "🐍", role: "attack",  rarity: "epic",      attack: 22, defense: 4,  hp: 40,  ability: "Envenena por 5s",             unlockLevel: 14, color: "#84cc16" },
  { id: "pet-12", name: "Unicórnio",         icon: "🦄", role: "support", rarity: "legendary", attack: 10, defense: 12, hp: 80,  ability: "+15% cura recebida",          unlockLevel: 20, color: "#e9d5ff" },
  { id: "pet-13", name: "Raposa de Fogo",    icon: "🦊", role: "attack",  rarity: "rare",      attack: 14, defense: 5,  hp: 35,  ability: "Rastro de chamas ao mover",   unlockLevel: 9,  color: "#f97316" },
  { id: "pet-14", name: "Urso Polar",        icon: "🐻‍❄️", role: "defense", rarity: "epic",    attack: 12, defense: 18, hp: 95,  ability: "Congela inimigos por 1s",     unlockLevel: 16, color: "#bae6fd" },
  { id: "pet-15", name: "Kraken Bebê",       icon: "🐙", role: "attack",  rarity: "epic",      attack: 20, defense: 8,  hp: 55,  ability: "Ataca 3 alvos ao mesmo tempo",unlockLevel: 18, color: "#7c3aed" },
  { id: "pet-16", name: "Coelho da Sorte",   icon: "🐇", role: "utility", rarity: "common",    attack: 3,  defense: 3,  hp: 22,  ability: "+8% drop de itens raros",     unlockLevel: 2,  color: "#fecaca" },
  { id: "pet-17", name: "Escorpião Blindado",icon: "🦂", role: "attack",  rarity: "rare",      attack: 17, defense: 9,  hp: 40,  ability: "Perfura 20% da defesa",       unlockLevel: 11, color: "#a3a3a3" },
  { id: "pet-18", name: "Panda Guerreiro",   icon: "🐼", role: "hybrid",  rarity: "epic",      attack: 15, defense: 15, hp: 70,  ability: "Equilíbrio: sem penalidades", unlockLevel: 17, color: "#f5f5f5" },
  { id: "pet-19", name: "Golfinho Etéreo",   icon: "🐬", role: "support", rarity: "rare",      attack: 6,  defense: 6,  hp: 40,  ability: "+10% regen de MP",            unlockLevel: 13, color: "#38bdf8" },
  { id: "pet-20", name: "Aranha Rainha",     icon: "🕷️", role: "attack",  rarity: "legendary", attack: 26, defense: 6,  hp: 50,  ability: "Teias reduzem velocidade",    unlockLevel: 22, color: "#6d28d9" },
  { id: "pet-21", name: "Grifo Alado",       icon: "🦁", role: "hybrid",  rarity: "legendary", attack: 20, defense: 14, hp: 80,  ability: "Voo: esquiva 15%",            unlockLevel: 25, color: "#fbbf24" },
  { id: "pet-22", name: "Cristal Vivo",      icon: "💎", role: "defense", rarity: "epic",      attack: 4,  defense: 22, hp: 90,  ability: "Reflete 5% do dano",          unlockLevel: 19, color: "#67e8f9" },
  { id: "pet-23", name: "Morcego Vampiro",   icon: "🦇", role: "attack",  rarity: "rare",      attack: 14, defense: 4,  hp: 32,  ability: "Rouba 5% de vida",            unlockLevel: 10, color: "#57534e" },
  { id: "pet-24", name: "Cavalo Sombrio",    icon: "🐎", role: "utility", rarity: "epic",      attack: 10, defense: 10, hp: 55,  ability: "+20% velocidade de movimento",unlockLevel: 21, color: "#1f2937" },
  { id: "pet-25", name: "Águia Celeste",     icon: "🕊️", role: "support", rarity: "legendary", attack: 12, defense: 8,  hp: 60,  ability: "Buff de crítico ao grupo",    unlockLevel: 23, color: "#e5e7eb" },
  { id: "pet-26", name: "Rinoceronte de Guerra",icon:"🦏", role: "defense", rarity: "epic",   attack: 16, defense: 22, hp: 110, ability: "Investida com stun",          unlockLevel: 24, color: "#78716c" },
  { id: "pet-27", name: "Cão Guardião",      icon: "🐕", role: "defense", rarity: "common",    attack: 6,  defense: 8,  hp: 40,  ability: "Aggro em inimigos próximos",  unlockLevel: 1,  color: "#a16207" },
  { id: "pet-28", name: "Papagaio Tagarela", icon: "🦜", role: "utility", rarity: "common",    attack: 4,  defense: 3,  hp: 25,  ability: "+5% chance de dupla loot",    unlockLevel: 2,  color: "#22d3ee" },
  { id: "pet-29", name: "Leão Solar",        icon: "🦁", role: "attack",  rarity: "legendary", attack: 24, defense: 12, hp: 75,  ability: "Rugido reduz defesa inimiga", unlockLevel: 26, color: "#f59e0b" },
  { id: "pet-30", name: "Cthulhu Miniatura", icon: "👁️", role: "hybrid",  rarity: "mythic",    attack: 30, defense: 18, hp: 100, ability: "Insanidade: caos aleatório",  unlockLevel: 40, color: "#8b5cf6" },
  { id: "pet-31", name: "Anjo Guardião",     icon: "😇", role: "support", rarity: "mythic",    attack: 18, defense: 20, hp: 120, ability: "Escudo divino a cada 30s",    unlockLevel: 45, color: "#fde68a" },
  { id: "pet-32", name: "Demônio de Bolso",  icon: "😈", role: "attack",  rarity: "mythic",    attack: 34, defense: 10, hp: 80,  ability: "Chamas do inferno em área",   unlockLevel: 50, color: "#dc2626" },
  { id: "pet-33", name: "Ovo Misterioso",    icon: "🥚", role: "utility", rarity: "rare",      attack: 2,  defense: 2,  hp: 15,  ability: "Chocará algo especial...",    unlockLevel: 30, color: "#fef3c7" },
];

export const PET_ROLE_COLOR: Record<PetRole, string> = {
  attack: "#ef4444",
  defense: "#3b82f6",
  support: "#22c55e",
  utility: "#eab308",
  hybrid: "#a855f7",
};
