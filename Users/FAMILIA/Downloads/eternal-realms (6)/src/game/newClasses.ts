// 20 novas classes com metadata, atributos base, 4 habilidades únicas cada
// e paletas de 5 skins exclusivas cada. Sprites em public/sprites/organized/.

export type NewClassId =
  | "berserker" | "spellblade" | "shaman" | "templar" | "corsair"
  | "pyromancer" | "cryomancer" | "stormcaller" | "geomancer" | "chronomancer"
  | "beastmaster" | "runesmith" | "gladiator" | "sorcerer" | "warden"
  | "duelist" | "hexblade" | "seer" | "trickster" | "voidknight"
  | "echomancer" | "symbiote";

export interface AbilityData {
  name: string;
  kind: "slash" | "projectile" | "aoe" | "buff" | "dash" | "heal";
  cost: number;
  cd: number;
  dmgMult: number;
  color: string;
  desc: string;
}

export interface ClassStatSeed {
  hp: number; mp: number; str: number; agi: number; int: number; vit: number;
}

export interface NewClassDef {
  id: NewClassId;
  label: string;
  color: string;
  accent: string;
  description: string;
  stats: ClassStatSeed;
  weapon: string;
  role: "melee" | "distance" | "magic" | "hybrid";
  abilities: [AbilityData, AbilityData, AbilityData, AbilityData];
  /** Cores usadas para gerar sprite base + 5 skins. */
  palette: {
    skin: string;
    hair: string;
    outfit: string;   // cor principal da roupa/armadura
    accent: string;   // detalhes
    weapon: string;   // cor da arma
  };
  skins: Array<{ label: string; outfit: string; accent: string; weapon: string; hair?: string }>;
}

const A = (n: string, kind: AbilityData["kind"], cost: number, cd: number, dmg: number, color: string, desc: string): AbilityData =>
  ({ name: n, kind, cost, cd, dmgMult: dmg, color, desc });

export const NEW_CLASSES: NewClassDef[] = [
  {
    id: "berserker", label: "Berserker", color: "#e11d48", accent: "#fca5a5",
    description: "Guerreiro enfurecido — troca defesa por dano brutal.",
    stats: { hp: 140, mp: 30, str: 14, agi: 8, int: 4, vit: 10 },
    weapon: "Machado Duplo", role: "melee",
    abilities: [
      A("Fúria Rubra",   "buff",       15, 12, 1.0, "#dc2626", "Aumenta dano em 40% por 6s."),
      A("Rasgo Sangrento","slash",     10, 3,  2.4, "#b91c1c", "Golpe em arco que sangra."),
      A("Baque Terreno", "aoe",        25, 9,  2.0, "#f59e0b", "Onda de choque ao redor."),
      A("Investida Selvagem","dash",   20, 8,  2.6, "#ef4444", "Corrida com impacto pesado."),
    ],
    palette: { skin:"#f4c9a1", hair:"#7a1e1e", outfit:"#7f1d1d", accent:"#facc15", weapon:"#94a3b8" },
    skins: [
      { label:"Sangue Antigo",   outfit:"#7f1d1d", accent:"#facc15", weapon:"#94a3b8" },
      { label:"Tribal Selvagem", outfit:"#78350f", accent:"#f97316", weapon:"#a3a3a3", hair:"#292524" },
      { label:"Carmesim Real",   outfit:"#be123c", accent:"#fde047", weapon:"#e5e7eb" },
      { label:"Cinzas de Guerra",outfit:"#3f3f46", accent:"#dc2626", weapon:"#64748b" },
      { label:"Fera Escarlate",  outfit:"#450a0a", accent:"#f43f5e", weapon:"#78716c", hair:"#f97316" },
    ],
  },
  {
    id: "spellblade", label: "Espadachim Arcano", color: "#8b5cf6", accent: "#c4b5fd",
    description: "Espada e magia — combos rápidos com feitiços de lâmina.",
    stats: { hp: 100, mp: 80, str: 9, agi: 11, int: 11, vit: 7 },
    weapon: "Espada Rúnica", role: "hybrid",
    abilities: [
      A("Corte Arcano",  "slash",      12, 3, 2.2, "#8b5cf6", "Lâmina imbuída com arcano."),
      A("Lâmina Miragem","projectile", 18, 5, 1.8, "#a78bfa", "Projétil de lâmina de éter."),
      A("Passo Fásico",  "dash",       15, 7, 1.4, "#c4b5fd", "Teleporte curto que corta."),
      A("Runa de Poder", "buff",       25, 15,1.0, "#7c3aed", "+30% dano mágico por 8s."),
    ],
    palette: { skin:"#f0c6a0", hair:"#4c1d95", outfit:"#4c1d95", accent:"#c4b5fd", weapon:"#a78bfa" },
    skins: [
      { label:"Éter Puro",       outfit:"#4c1d95", accent:"#c4b5fd", weapon:"#a78bfa" },
      { label:"Prisma Noturno",  outfit:"#1e1b4b", accent:"#818cf8", weapon:"#6366f1" },
      { label:"Alva Astral",     outfit:"#e0e7ff", accent:"#8b5cf6", weapon:"#c4b5fd" },
      { label:"Vórtice Mágico",  outfit:"#312e81", accent:"#f0abfc", weapon:"#d946ef" },
      { label:"Feitiço Escarlate",outfit:"#701a75", accent:"#f472b6", weapon:"#ec4899" },
    ],
  },
  {
    id: "shaman", label: "Xamã", color: "#10b981", accent: "#6ee7b7",
    description: "Invoca espíritos elementais e cura aliados.",
    stats: { hp: 95, mp: 90, str: 6, agi: 8, int: 12, vit: 9 },
    weapon: "Totem Ancestral", role: "magic",
    abilities: [
      A("Cura Espiritual","heal",     20, 4, 1.6, "#22c55e", "Restaura HP considerável."),
      A("Rajada Elemental","projectile",15,3,1.7,"#10b981", "Espírito bola de energia."),
      A("Círculo Totêmico","aoe",     30, 10,2.0,"#84cc16", "Área que dano contínuo."),
      A("Elo Ancestral", "buff",       25, 20,1.0,"#14b8a6", "Regenera HP/MP por 10s."),
    ],
    palette: { skin:"#d4a373", hair:"#065f46", outfit:"#064e3b", accent:"#84cc16", weapon:"#a3a3a3" },
    skins: [
      { label:"Floresta Antiga", outfit:"#064e3b", accent:"#84cc16", weapon:"#a16207" },
      { label:"Águas Sagradas",  outfit:"#0e7490", accent:"#67e8f9", weapon:"#a3a3a3" },
      { label:"Cinzas Sagradas", outfit:"#44403c", accent:"#f97316", weapon:"#78716c" },
      { label:"Tempestade Verde",outfit:"#052e16", accent:"#4ade80", weapon:"#facc15" },
      { label:"Sol Tribal",      outfit:"#78350f", accent:"#fbbf24", weapon:"#f59e0b" },
    ],
  },
  {
    id: "templar", label: "Templário", color: "#f59e0b", accent: "#fde68a",
    description: "Sagrado — mistura dano radiante e proteção.",
    stats: { hp: 130, mp: 60, str: 11, agi: 6, int: 9, vit: 12 },
    weapon: "Espada Longa Sagrada", role: "melee",
    abilities: [
      A("Golpe Radiante","slash",      12, 3, 2.3, "#fbbf24", "Corte que emite luz."),
      A("Escudo Divino","buff",        20, 12,1.0, "#facc15", "Absorve dano por 6s."),
      A("Julgamento",    "aoe",        30, 10,2.4, "#fde047", "Coluna de luz cai."),
      A("Cura Sagrada",  "heal",       25, 8, 1.8, "#fef3c7", "Cura moderada."),
    ],
    palette: { skin:"#f4c9a1", hair:"#facc15", outfit:"#f3f4f6", accent:"#fbbf24", weapon:"#e5e7eb" },
    skins: [
      { label:"Alva Sagrada",    outfit:"#f3f4f6", accent:"#fbbf24", weapon:"#e5e7eb" },
      { label:"Ordem Dourada",   outfit:"#fbbf24", accent:"#f3f4f6", weapon:"#f59e0b" },
      { label:"Cruzado do Sol",  outfit:"#fef08a", accent:"#dc2626", weapon:"#facc15" },
      { label:"Vestal Sombria",  outfit:"#1f2937", accent:"#fde047", weapon:"#e5e7eb" },
      { label:"Justiça Real",    outfit:"#7c2d12", accent:"#fde68a", weapon:"#facc15" },
    ],
  },
  {
    id: "corsair", label: "Corsário", color: "#0284c7", accent: "#7dd3fc",
    description: "Pirata ágil com pistolas e sabres.",
    stats: { hp: 105, mp: 45, str: 9, agi: 13, int: 6, vit: 8 },
    weapon: "Sabre & Pistola", role: "hybrid",
    abilities: [
      A("Corte de Sabre","slash",      10, 2, 1.8, "#0ea5e9", "Golpe ágil."),
      A("Tiro Certeiro", "projectile", 12, 3, 2.0, "#38bdf8", "Bala precisa."),
      A("Bomba de Fumaça","aoe",       18, 8, 1.2, "#94a3b8", "Área que cega inimigos."),
      A("Passo do Vento","dash",       15, 6, 1.5, "#7dd3fc", "Recua rapidamente."),
    ],
    palette: { skin:"#e8b088", hair:"#292524", outfit:"#0c4a6e", accent:"#fbbf24", weapon:"#94a3b8" },
    skins: [
      { label:"Mar Aberto",      outfit:"#0c4a6e", accent:"#fbbf24", weapon:"#94a3b8" },
      { label:"Caçador de Tesouro",outfit:"#78350f", accent:"#facc15", weapon:"#a3a3a3" },
      { label:"Bandeira Negra",  outfit:"#111827", accent:"#dc2626", weapon:"#4b5563" },
      { label:"Almirante Real",  outfit:"#1e40af", accent:"#f8fafc", weapon:"#e5e7eb" },
      { label:"Cripta Molhada",  outfit:"#134e4a", accent:"#a3e635", weapon:"#a3a3a3" },
    ],
  },
  {
    id: "pyromancer", label: "Piromante", color: "#dc2626", accent: "#f97316",
    description: "Domina o fogo — DoT e explosões.",
    stats: { hp: 85, mp: 100, str: 4, agi: 8, int: 14, vit: 6 },
    weapon: "Cajado Ígneo", role: "magic",
    abilities: [
      A("Dardo Ígneo",   "projectile", 10, 2, 1.9, "#f97316", "Míssil de fogo."),
      A("Nova de Chamas","aoe",        28, 8, 2.5, "#dc2626", "Explosão ao redor."),
      A("Muralha Ardente","buff",      25, 15,1.0, "#ea580c", "Queima quem te acerta."),
      A("Meteoro",       "aoe",        45, 20,3.5, "#fbbf24", "Cai em local mirado."),
    ],
    palette: { skin:"#f4c9a1", hair:"#dc2626", outfit:"#7f1d1d", accent:"#fb923c", weapon:"#78350f" },
    skins: [
      { label:"Chama Antiga",    outfit:"#7f1d1d", accent:"#fb923c", weapon:"#78350f" },
      { label:"Fênix Renascida", outfit:"#b45309", accent:"#fef08a", weapon:"#dc2626" },
      { label:"Lava Viva",       outfit:"#292524", accent:"#f97316", weapon:"#dc2626" },
      { label:"Solar Divino",    outfit:"#fbbf24", accent:"#dc2626", weapon:"#f97316" },
      { label:"Brasa Sombria",   outfit:"#1c1917", accent:"#dc2626", weapon:"#7f1d1d" },
    ],
  },
  {
    id: "cryomancer", label: "Criomante", color: "#0ea5e9", accent: "#bae6fd",
    description: "Mestre do gelo — controla e congela inimigos.",
    stats: { hp: 90, mp: 100, str: 4, agi: 7, int: 14, vit: 7 },
    weapon: "Bastão de Gelo", role: "magic",
    abilities: [
      A("Lança de Gelo", "projectile", 12, 2, 2.1, "#0ea5e9", "Perfura e desacelera."),
      A("Ventania Glacial","aoe",      25, 8, 2.0, "#7dd3fc", "Cone de gelo."),
      A("Armadura Gélida","buff",      20, 15,1.0, "#bae6fd", "Reduz dano recebido."),
      A("Prisão de Gelo","aoe",        35, 15,1.5, "#38bdf8", "Congela em área."),
    ],
    palette: { skin:"#e0f2fe", hair:"#0284c7", outfit:"#0c4a6e", accent:"#bae6fd", weapon:"#e0f2fe" },
    skins: [
      { label:"Permafrost",      outfit:"#0c4a6e", accent:"#bae6fd", weapon:"#e0f2fe" },
      { label:"Alva Boreal",     outfit:"#f0f9ff", accent:"#0ea5e9", weapon:"#38bdf8" },
      { label:"Aurora Congelada",outfit:"#1e3a8a", accent:"#c4b5fd", weapon:"#a5f3fc" },
      { label:"Cristal Puro",    outfit:"#67e8f9", accent:"#f0f9ff", weapon:"#e0f2fe" },
      { label:"Noite Gelada",    outfit:"#0f172a", accent:"#38bdf8", weapon:"#7dd3fc" },
    ],
  },
  {
    id: "stormcaller", label: "Invocador da Tempestade", color: "#facc15", accent: "#fde047",
    description: "Comanda raios e ventos elétricos.",
    stats: { hp: 88, mp: 95, str: 5, agi: 10, int: 13, vit: 6 },
    weapon: "Cajado Voltaico", role: "magic",
    abilities: [
      A("Raio",          "projectile", 12, 2, 2.2, "#facc15", "Cai um raio."),
      A("Corrente Elétrica","aoe",     28, 8, 2.4, "#fde047", "Salta entre inimigos."),
      A("Passo Trovão",  "dash",       18, 6, 1.6, "#eab308", "Teleporta em raio."),
      A("Tempestade",    "aoe",        45, 25,3.2, "#a3a3a3", "Nuvem tempestuosa."),
    ],
    palette: { skin:"#f4c9a1", hair:"#facc15", outfit:"#1e3a8a", accent:"#fde047", weapon:"#eab308" },
    skins: [
      { label:"Céu Aberto",      outfit:"#1e3a8a", accent:"#fde047", weapon:"#eab308" },
      { label:"Tempestade Negra",outfit:"#111827", accent:"#facc15", weapon:"#a3a3a3" },
      { label:"Zéfiro Real",     outfit:"#e0f2fe", accent:"#facc15", weapon:"#0ea5e9" },
      { label:"Voltaico",        outfit:"#7c3aed", accent:"#fde047", weapon:"#a78bfa" },
      { label:"Furacão",         outfit:"#374151", accent:"#67e8f9", weapon:"#facc15" },
    ],
  },
  {
    id: "geomancer", label: "Geomante", color: "#78716c", accent: "#a8a29e",
    description: "Terra e pedra — tanky e forte em AoE.",
    stats: { hp: 130, mp: 70, str: 10, agi: 5, int: 11, vit: 13 },
    weapon: "Cajado de Pedra", role: "magic",
    abilities: [
      A("Rocha Errante", "projectile", 15, 3, 2.3, "#a8a29e", "Pedra que atinge."),
      A("Muralha de Pedra","buff",     25, 15,1.0, "#78716c", "Escudo tanky."),
      A("Terremoto",     "aoe",        35, 12,2.8, "#57534e", "Área ao redor."),
      A("Espinhos de Cristal","aoe",   30, 10,2.2, "#c084fc", "Cristais brotam."),
    ],
    palette: { skin:"#d6a374", hair:"#57534e", outfit:"#44403c", accent:"#c084fc", weapon:"#78716c" },
    skins: [
      { label:"Montanha Viva",   outfit:"#44403c", accent:"#c084fc", weapon:"#78716c" },
      { label:"Deserto Antigo",  outfit:"#a16207", accent:"#fde68a", weapon:"#78350f" },
      { label:"Cristal Ametista",outfit:"#4c1d95", accent:"#c084fc", weapon:"#a78bfa" },
      { label:"Obsidiana",       outfit:"#1c1917", accent:"#a3a3a3", weapon:"#525252" },
      { label:"Jade Ancestral",  outfit:"#166534", accent:"#86efac", weapon:"#22c55e" },
    ],
  },
  {
    id: "chronomancer", label: "Cronomante", color: "#7dd3fc", accent: "#e0f2fe",
    description: "Manipula o tempo — controle e utilidade.",
    stats: { hp: 90, mp: 110, str: 4, agi: 9, int: 15, vit: 6 },
    weapon: "Ampulheta Rúnica", role: "magic",
    abilities: [
      A("Fenda Temporal","projectile", 15, 3, 2.0, "#7dd3fc", "Míssil temporal."),
      A("Desacelerar",   "aoe",        20, 10,1.0, "#a5f3fc", "Área lenta inimigos."),
      A("Rebobinar",     "heal",       35, 30,1.0, "#e0f2fe", "Restaura HP e MP."),
      A("Parada Temporal","buff",      50, 45,1.0, "#f0f9ff", "Congela tudo brevemente."),
    ],
    palette: { skin:"#f0c6a0", hair:"#e0f2fe", outfit:"#1e3a8a", accent:"#7dd3fc", weapon:"#facc15" },
    skins: [
      { label:"Aurora Temporal", outfit:"#1e3a8a", accent:"#7dd3fc", weapon:"#facc15" },
      { label:"Ampulheta Dourada",outfit:"#facc15", accent:"#7dd3fc", weapon:"#f59e0b" },
      { label:"Vórtice Cósmico", outfit:"#1e1b4b", accent:"#c4b5fd", weapon:"#a78bfa" },
      { label:"Cronoluz",        outfit:"#f0f9ff", accent:"#0ea5e9", weapon:"#38bdf8" },
      { label:"Eco do Tempo",    outfit:"#0f172a", accent:"#f472b6", weapon:"#c084fc" },
    ],
  },
  {
    id: "beastmaster", label: "Mestre das Feras", color: "#a16207", accent: "#facc15",
    description: "Domador — luta com pet feroz.",
    stats: { hp: 115, mp: 55, str: 10, agi: 11, int: 6, vit: 10 },
    weapon: "Lança & Chicote", role: "melee",
    abilities: [
      A("Chicote Feroz", "slash",      10, 2, 1.9, "#a16207", "Ataque em arco."),
      A("Chamado Selvagem","buff",     25, 20,1.0, "#f59e0b", "Fera aparece 12s."),
      A("Lança Certeira","projectile", 15, 4, 2.2, "#facc15", "Lança arremessada."),
      A("Investida Bestial","dash",    20, 8, 2.4, "#78350f", "Ataque com fera."),
    ],
    palette: { skin:"#d4a373", hair:"#78350f", outfit:"#78350f", accent:"#facc15", weapon:"#a16207" },
    skins: [
      { label:"Caçador Selvagem",outfit:"#78350f", accent:"#facc15", weapon:"#a16207" },
      { label:"Domador Tigre",   outfit:"#f97316", accent:"#111827", weapon:"#a16207" },
      { label:"Lobos do Norte",  outfit:"#374151", accent:"#e5e7eb", weapon:"#71717a" },
      { label:"Panteã Verde",    outfit:"#166534", accent:"#facc15", weapon:"#78350f" },
      { label:"Águia Real",      outfit:"#7c2d12", accent:"#facc15", weapon:"#f59e0b" },
    ],
  },
  {
    id: "runesmith", label: "Ferreiro Rúnico", color: "#c084fc", accent: "#f0abfc",
    description: "Cria runas de combate e martela inimigos.",
    stats: { hp: 125, mp: 70, str: 11, agi: 6, int: 11, vit: 11 },
    weapon: "Martelo Rúnico", role: "hybrid",
    abilities: [
      A("Batida Rúnica", "slash",      12, 3, 2.1, "#c084fc", "Martelada rúnica."),
      A("Selo Explosivo","aoe",        22, 8, 2.4, "#f0abfc", "Runa detona."),
      A("Runa Curativa", "heal",       25, 10,1.5, "#e9d5ff", "Cura área."),
      A("Aura Rúnica",   "buff",       30, 20,1.0, "#a855f7", "+20% atk aliados."),
    ],
    palette: { skin:"#d4a373", hair:"#a855f7", outfit:"#581c87", accent:"#f0abfc", weapon:"#a3a3a3" },
    skins: [
      { label:"Runas Antigas",   outfit:"#581c87", accent:"#f0abfc", weapon:"#a3a3a3" },
      { label:"Forja Dourada",   outfit:"#a16207", accent:"#c084fc", weapon:"#facc15" },
      { label:"Cinzas Rúnicas",  outfit:"#292524", accent:"#c084fc", weapon:"#a855f7" },
      { label:"Selo Sagrado",    outfit:"#f0f9ff", accent:"#c084fc", weapon:"#e0e7ff" },
      { label:"Rubi Rúnico",     outfit:"#7f1d1d", accent:"#f472b6", weapon:"#dc2626" },
    ],
  },
  {
    id: "gladiator", label: "Gladiador", color: "#facc15", accent: "#fde68a",
    description: "Campeão da arena — combos e stance change.",
    stats: { hp: 135, mp: 40, str: 13, agi: 10, int: 4, vit: 11 },
    weapon: "Tridente & Rede", role: "melee",
    abilities: [
      A("Trituração",    "slash",      12, 3, 2.3, "#facc15", "Combo em 3 golpes."),
      A("Rede de Ferro", "projectile", 18, 8, 1.4, "#a3a3a3", "Prende inimigo."),
      A("Grito de Guerra","buff",      20, 15,1.0, "#dc2626", "+25% atk 8s."),
      A("Dança do Coliseu","aoe",      30, 12,2.5, "#f59e0b", "Rodopio letal."),
    ],
    palette: { skin:"#e8b088", hair:"#7c2d12", outfit:"#a16207", accent:"#facc15", weapon:"#a3a3a3" },
    skins: [
      { label:"Areia Dourada",   outfit:"#a16207", accent:"#facc15", weapon:"#a3a3a3" },
      { label:"Coliseu Sangrento",outfit:"#7f1d1d", accent:"#fde68a", weapon:"#d4d4d8" },
      { label:"Bárbaro do Norte",outfit:"#292524", accent:"#a3a3a3", weapon:"#d4d4d8" },
      { label:"Vestal Vermelha", outfit:"#f3f4f6", accent:"#dc2626", weapon:"#facc15" },
      { label:"Campeão Real",    outfit:"#1e3a8a", accent:"#facc15", weapon:"#e5e7eb" },
    ],
  },
  {
    id: "sorcerer", label: "Feiticeiro", color: "#d946ef", accent: "#f0abfc",
    description: "Magia caótica pura — dano alto, imprevisível.",
    stats: { hp: 82, mp: 115, str: 3, agi: 7, int: 16, vit: 5 },
    weapon: "Cajado Prismático", role: "magic",
    abilities: [
      A("Bola Arcana",   "projectile", 10, 2, 2.0, "#d946ef", "Projétil arcano."),
      A("Explosão Caótica","aoe",      30, 10,3.0, "#f0abfc", "Detona ao redor."),
      A("Escudo Manipular","buff",     25, 18,1.0, "#c026d3", "Absorve mágica."),
      A("Missil Arcano", "projectile", 40, 12,4.0, "#a21caf", "Míssil massivo."),
    ],
    palette: { skin:"#f0c6a0", hair:"#a21caf", outfit:"#701a75", accent:"#f0abfc", weapon:"#d946ef" },
    skins: [
      { label:"Caos Prismático", outfit:"#701a75", accent:"#f0abfc", weapon:"#d946ef" },
      { label:"Estrela Escura",  outfit:"#1e1b4b", accent:"#c084fc", weapon:"#7c3aed" },
      { label:"Nébula",          outfit:"#4c1d95", accent:"#f472b6", weapon:"#a855f7" },
      { label:"Fogo Fátuo",      outfit:"#166534", accent:"#4ade80", weapon:"#84cc16" },
      { label:"Vazio Rosa",      outfit:"#831843", accent:"#f472b6", weapon:"#ec4899" },
    ],
  },
  {
    id: "warden", label: "Guardião da Mata", color: "#4d7c0f", accent: "#84cc16",
    description: "Ranger de floresta — flechas envenenadas e armadilhas.",
    stats: { hp: 110, mp: 65, str: 8, agi: 13, int: 8, vit: 9 },
    weapon: "Arco Verdejante", role: "distance",
    abilities: [
      A("Flecha Venenosa","projectile",12, 2, 1.9, "#84cc16", "Envenena DoT."),
      A("Chuva de Flechas","aoe",      28, 10,2.2, "#4d7c0f", "Área de flechas."),
      A("Armadilha Vegetal","aoe",     22, 12,1.6, "#22c55e", "Prende inimigos."),
      A("Passo Silvestre","dash",      15, 7, 1.5, "#166534", "Recua em raízes."),
    ],
    palette: { skin:"#d4a373", hair:"#166534", outfit:"#166534", accent:"#84cc16", weapon:"#78350f" },
    skins: [
      { label:"Floresta Antiga", outfit:"#166534", accent:"#84cc16", weapon:"#78350f" },
      { label:"Musgo Ancestral", outfit:"#365314", accent:"#a3e635", weapon:"#a16207" },
      { label:"Outono Dourado",  outfit:"#a16207", accent:"#facc15", weapon:"#78350f" },
      { label:"Espírito da Mata",outfit:"#f0fdf4", accent:"#22c55e", weapon:"#a3a3a3" },
      { label:"Vento da Selva",  outfit:"#052e16", accent:"#4ade80", weapon:"#78350f" },
    ],
  },
  {
    id: "duelist", label: "Duelista", color: "#e11d48", accent: "#fda4af",
    description: "Rapieira ágil — precisão e paradas perfeitas.",
    stats: { hp: 95, mp: 50, str: 8, agi: 15, int: 6, vit: 7 },
    weapon: "Rapieira", role: "melee",
    abilities: [
      A("Estocada",      "slash",      10, 2, 2.1, "#e11d48", "Golpe rápido."),
      A("Parada Perfeita","buff",      18, 10,1.0, "#fda4af", "Contra-ataca 4s."),
      A("Riposte",       "slash",      20, 5, 2.8, "#be123c", "Contra-ataque brutal."),
      A("Salto Elegante","dash",       15, 6, 1.8, "#fecdd3", "Salto com corte."),
    ],
    palette: { skin:"#f4c9a1", hair:"#1c1917", outfit:"#7f1d1d", accent:"#f3f4f6", weapon:"#e5e7eb" },
    skins: [
      { label:"Nobre Rubro",     outfit:"#7f1d1d", accent:"#f3f4f6", weapon:"#e5e7eb" },
      { label:"Máscara Negra",   outfit:"#111827", accent:"#dc2626", weapon:"#a3a3a3" },
      { label:"Cortesão Real",   outfit:"#1e40af", accent:"#facc15", weapon:"#e5e7eb" },
      { label:"Rosa Sombria",    outfit:"#500724", accent:"#fda4af", weapon:"#a3a3a3" },
      { label:"Fantasma Elegante",outfit:"#f3f4f6", accent:"#7c3aed", weapon:"#c4b5fd" },
    ],
  },
  {
    id: "hexblade", label: "Espada Maldita", color: "#7c3aed", accent: "#a855f7",
    description: "Pacto sombrio — vida por poder maldito.",
    stats: { hp: 100, mp: 85, str: 10, agi: 8, int: 12, vit: 7 },
    weapon: "Lâmina Amaldiçoada", role: "hybrid",
    abilities: [
      A("Corte Maldito", "slash",      12, 3, 2.3, "#7c3aed", "Golpe drena HP."),
      A("Maldição Sombria","projectile",18,5, 2.2, "#a855f7", "Perseguidor."),
      A("Pacto de Sangue","buff",      25, 15,1.0, "#7f1d1d", "Troca HP por atk."),
      A("Colheita Sombria","aoe",      35, 15,2.6, "#3b0764", "Drena todos ao redor."),
    ],
    palette: { skin:"#e0c9b0", hair:"#1e1b4b", outfit:"#3b0764", accent:"#a855f7", weapon:"#7c3aed" },
    skins: [
      { label:"Pacto Antigo",    outfit:"#3b0764", accent:"#a855f7", weapon:"#7c3aed" },
      { label:"Sombra Escarlate",outfit:"#450a0a", accent:"#f43f5e", weapon:"#7c3aed" },
      { label:"Anjo Caído",      outfit:"#111827", accent:"#f8fafc", weapon:"#c4b5fd" },
      { label:"Vazio",           outfit:"#0f172a", accent:"#a855f7", weapon:"#7c3aed" },
      { label:"Sangue Maldito",  outfit:"#7f1d1d", accent:"#7c3aed", weapon:"#a855f7" },
    ],
  },
  {
    id: "seer", label: "Vidente", color: "#38bdf8", accent: "#7dd3fc",
    description: "Adivinha o futuro — buffs, debuffs e previsões.",
    stats: { hp: 88, mp: 105, str: 4, agi: 8, int: 14, vit: 7 },
    weapon: "Orbe Adivinhador", role: "magic",
    abilities: [
      A("Olho Astral",   "projectile", 12, 3, 1.9, "#38bdf8", "Perseguidor cego."),
      A("Presságio",     "buff",       20, 15,1.0, "#67e8f9", "Evita próximo hit."),
      A("Visão Fatal",   "aoe",        30, 12,2.5, "#7dd3fc", "Marca inimigos."),
      A("Estrela Cadente","projectile",35, 15,3.3, "#f0f9ff", "Meteoro estelar."),
    ],
    palette: { skin:"#f4c9a1", hair:"#e0f2fe", outfit:"#1e3a8a", accent:"#7dd3fc", weapon:"#facc15" },
    skins: [
      { label:"Constelação",     outfit:"#1e3a8a", accent:"#7dd3fc", weapon:"#facc15" },
      { label:"Olho Prateado",   outfit:"#f0f9ff", accent:"#0ea5e9", weapon:"#e5e7eb" },
      { label:"Céu Rosado",      outfit:"#831843", accent:"#fda4af", weapon:"#f472b6" },
      { label:"Lua Negra",       outfit:"#0f172a", accent:"#c084fc", weapon:"#a78bfa" },
      { label:"Aurora Verde",    outfit:"#064e3b", accent:"#4ade80", weapon:"#a3e635" },
    ],
  },
  {
    id: "trickster", label: "Trapaceiro", color: "#22c55e", accent: "#86efac",
    description: "Ilusões e adagas — controle e mobilidade.",
    stats: { hp: 92, mp: 70, str: 7, agi: 14, int: 10, vit: 6 },
    weapon: "Adagas & Cartas", role: "hybrid",
    abilities: [
      A("Carta Explosiva","projectile",12, 3, 2.0, "#22c55e", "Carta detona."),
      A("Miragem",       "buff",       20, 12,1.0, "#86efac", "Cria clone."),
      A("Baralho Letal", "aoe",        25, 9, 2.3, "#4ade80", "Cartas em leque."),
      A("Passo Ilusório","dash",       15, 5, 1.6, "#a3e635", "Teleporte curto."),
    ],
    palette: { skin:"#f0c6a0", hair:"#166534", outfit:"#166534", accent:"#facc15", weapon:"#e5e7eb" },
    skins: [
      { label:"Bufão Real",      outfit:"#166534", accent:"#facc15", weapon:"#e5e7eb" },
      { label:"Máscara Púrpura", outfit:"#4c1d95", accent:"#f0abfc", weapon:"#a3a3a3" },
      { label:"Carteador Sombrio",outfit:"#0f172a", accent:"#dc2626", weapon:"#a3a3a3" },
      { label:"Trapaça Dourada", outfit:"#a16207", accent:"#facc15", weapon:"#e5e7eb" },
      { label:"Ilusionista",     outfit:"#f3f4f6", accent:"#22c55e", weapon:"#a3a3a3" },
    ],
  },
  {
    id: "voidknight", label: "Cavaleiro do Vazio", color: "#1e1b4b", accent: "#a78bfa",
    description: "Cavaleiro sombrio do vazio — teleporte e devastação.",
    stats: { hp: 125, mp: 80, str: 12, agi: 8, int: 10, vit: 12 },
    weapon: "Espada do Vazio", role: "hybrid",
    abilities: [
      A("Corte do Vazio","slash",      12, 3, 2.4, "#1e1b4b", "Golpe sombrio."),
      A("Fenda do Vazio","dash",       20, 8, 2.2, "#a78bfa", "Teleporte cortante."),
      A("Colapso",       "aoe",        35, 14,2.9, "#7c3aed", "Implosão devastadora."),
      A("Armadura Sombria","buff",     25, 20,1.0, "#3b0764", "Ganha DR + refl."),
    ],
    palette: { skin:"#d0b090", hair:"#0f172a", outfit:"#0f172a", accent:"#a78bfa", weapon:"#4c1d95" },
    skins: [
      { label:"Cavaleiro Sombrio",outfit:"#0f172a", accent:"#a78bfa", weapon:"#4c1d95" },
      { label:"Estrela Nula",    outfit:"#1e1b4b", accent:"#c4b5fd", weapon:"#7c3aed" },
      { label:"Cripta Real",     outfit:"#312e81", accent:"#f0abfc", weapon:"#a855f7" },
      { label:"Eclipse",         outfit:"#020617", accent:"#facc15", weapon:"#a855f7" },
      { label:"Alva Sombria",    outfit:"#e0e7ff", accent:"#1e1b4b", weapon:"#4c1d95" },
    ],
  },
  {
    id: "echomancer", label: "Ecomante do Paradoxo", color: "#22d3ee", accent: "#a5f3fc",
    description: "Grava suas próprias ações como ecos temporais. Combos se repetem sozinhos — se você souber orquestrar o loop.",
    stats: { hp: 92, mp: 120, str: 5, agi: 10, int: 15, vit: 6 },
    weapon: "Diapasão Temporal", role: "magic",
    abilities: [
      A("Marcar Instante",   "buff",       15, 6,  1.0, "#22d3ee", "Grava a próxima skill. Após 3s ela se re-executa a 70% de dano no mesmo alvo."),
      A("Ecoar Paradoxo",    "projectile", 20, 5,  1.9, "#67e8f9", "Míssil que se bifurca em 2 ecos espelhados que retornam 1s depois de ângulos opostos."),
      A("Colapso de Linha",  "aoe",        30, 12, 1.6, "#0891b2", "Detona TODOS os ecos ativos ao mesmo tempo. +40% de dano por eco consumido (até 5)."),
      A("Loop Perpétuo",     "buff",       45, 25, 1.0, "#a5f3fc", "Por 5s toda skill lançada gera um eco-fantasma extra. Drena 4% HP/s — insustentável se abusar."),
    ],
    palette: { skin:"#e8d5b7", hair:"#e0f2fe", outfit:"#0e7490", accent:"#a5f3fc", weapon:"#facc15" },
    skins: [
      { label:"Paradoxo Prima",    outfit:"#0e7490", accent:"#a5f3fc", weapon:"#facc15" },
      { label:"Linha Fantasma",    outfit:"#f0f9ff", accent:"#22d3ee", weapon:"#e0f2fe", hair:"#7dd3fc" },
      { label:"Eco Sombrio",       outfit:"#0f172a", accent:"#67e8f9", weapon:"#a78bfa" },
      { label:"Ressonância Áurea", outfit:"#a16207", accent:"#a5f3fc", weapon:"#fbbf24" },
      { label:"Fratura Rosa",      outfit:"#831843", accent:"#f0abfc", weapon:"#f472b6", hair:"#f9a8d4" },
    ],
  },
  {
    id: "symbiote", label: "Simbionte Voraz", color: "#65a30d", accent: "#4c1d95",
    description: "Devora essências de inimigos abatidos (Chama, Gelo, Sombra, Sangue). Cada essência estocada muda o que suas skills fazem.",
    stats: { hp: 115, mp: 75, str: 11, agi: 9, int: 10, vit: 10 },
    weapon: "Simbiote Vivente", role: "hybrid",
    abilities: [
      A("Devorar Essência",  "slash",      12, 3,  2.5, "#65a30d", "Executa alvos abaixo de 25% HP e absorve 1 essência do tipo do inimigo (máx. 5)."),
      A("Mutação Reativa",   "buff",       18, 8,  1.0, "#84cc16", "Consome 1 essência: Chama=+40% atk, Gelo=+40% def, Sombra=25% lifesteal, Sangue=+30% HP máx (10s)."),
      A("Enxame Parasita",   "aoe",        28, 10, 2.1, "#4d7c0f", "Libera parasitas que perseguem inimigos. Cada abate divide o parasita em 2 (cascata com essências Sombra)."),
      A("Fusão Aberrante",   "heal",       50, 30, 3.0, "#4c1d95", "Consome TODAS essências. Cura 15% HP por essência e libera pulso combinado (dano/CC/escudo/DoT) por tipo."),
    ],
    palette: { skin:"#a3b18a", hair:"#3f6212", outfit:"#365314", accent:"#4c1d95", weapon:"#7c3aed" },
    skins: [
      { label:"Verde Primordial",     outfit:"#365314", accent:"#4c1d95", weapon:"#7c3aed" },
      { label:"Simbionte Escarlate",  outfit:"#7f1d1d", accent:"#22c55e", weapon:"#dc2626", hair:"#450a0a" },
      { label:"Praga Bioluminescente",outfit:"#052e16", accent:"#22d3ee", weapon:"#a5f3fc", hair:"#4ade80" },
      { label:"Casulo Dourado",       outfit:"#a16207", accent:"#65a30d", weapon:"#facc15" },
      { label:"Aberração Vazia",      outfit:"#0f172a", accent:"#a855f7", weapon:"#4c1d95", hair:"#1e1b4b" },
    ],
  },
];

export const NEW_CLASS_BY_ID: Record<NewClassId, NewClassDef> =
  Object.fromEntries(NEW_CLASSES.map((c) => [c.id, c])) as Record<NewClassId, NewClassDef>;
