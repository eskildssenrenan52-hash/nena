// 100 hand-crafted, extremely ambitious mythic/legendary artifacts.
// Each has a unique name, lore-inspired identity, and colossal stats.
// Appended to the global item pool via items.ts.

import type { Item, ItemSlot, Rarity } from "./items";

type Seed = [string, ItemSlot, Rarity, number, number, number, number, number];

// [name, slot, rarity, level, attack, defense, hp, mp]
const AMBITIOUS: Seed[] = [
  // === Cosmic weapons (25) ===
  ["Sanguelua, Lâmina do Eclipse Eterno", "weapon", "mythic", 100, 420, 20, 180, 220],
  ["Ragnaröker, o Martelo do Fim dos Mundos", "weapon", "mythic", 100, 480, 40, 300, 60],
  ["Zephyros, Katana dos Ventos Cortantes", "weapon", "mythic", 100, 380, 15, 120, 260],
  ["Astralflame, Cajado da Nova Estelar", "weapon", "mythic", 100, 340, 10, 100, 500],
  ["Vazio-Uivante, Foice das Almas Perdidas", "weapon", "mythic", 100, 460, 25, 160, 280],
  ["Aurora Boreal, Arco dos Céus Congelados", "weapon", "mythic", 100, 400, 15, 140, 240],
  ["Ferrolar, Lança do Dragão Adormecido", "weapon", "mythic", 100, 450, 30, 200, 180],
  ["Silêncio Divino, Adaga do Deus Assassinado", "weapon", "mythic", 100, 520, 10, 90, 320],
  ["Coração de Titã, Maça do Colosso Primordial", "weapon", "mythic", 100, 500, 50, 400, 40],
  ["Prisma Infinito, Espada dos Mil Feitiços", "weapon", "mythic", 100, 380, 20, 200, 380],
  ["Devorador, Machado do Rei sem Rosto", "weapon", "mythic", 100, 510, 20, 220, 100],
  ["Nova Solar, Chicote de Luz Encarnada", "weapon", "mythic", 100, 390, 15, 150, 300],
  ["Chorareal, Espada que Chora Sangue", "weapon", "legendary", 95, 360, 20, 180, 140],
  ["Corvo-Sombra, Punhal do Ladrão de Deuses", "weapon", "legendary", 95, 340, 10, 100, 260],
  ["Fúria Anã, Machado de Guerra Colossal", "weapon", "legendary", 95, 400, 25, 240, 60],
  ["Sussurro Estelar, Arco dos Constelados", "weapon", "legendary", 95, 320, 15, 130, 220],
  ["Grimorion, Cajado do Arcano Proibido", "weapon", "legendary", 95, 280, 10, 100, 420],
  ["Retribuição, Espada do Juiz Cego", "weapon", "legendary", 95, 350, 30, 200, 180],
  ["Vento-do-Fim, Lâmina Curva do Deserto", "weapon", "legendary", 95, 330, 12, 140, 200],
  ["Golpeflorescer, Katana do Samurai Espírito", "weapon", "legendary", 95, 370, 15, 160, 240],
  ["Colheita Negra, Foice da Peste Perpétua", "weapon", "legendary", 95, 410, 20, 180, 200],
  ["Cetro Real, Mangual do Rei Imortal", "weapon", "legendary", 95, 390, 25, 220, 100],
  ["Presa Voraz, Adaga da Fera Interna", "weapon", "legendary", 95, 360, 10, 120, 180],
  ["Barragem, Balista Portátil dos Anões", "weapon", "legendary", 95, 430, 15, 200, 80],
  ["Alma-Gêmea, Katana Pareada do Duelista", "weapon", "legendary", 95, 380, 20, 160, 200],

  // === Divine armors (20) ===
  ["Coração-de-Aço, Peitoral do Guardião Eterno", "chest", "mythic", 100, 40, 480, 800, 80],
  ["Escamas de Bahamut, Peitoral do Dragão Ancestral", "chest", "mythic", 100, 60, 520, 900, 60],
  ["Manto Estelar, Peitoral do Astrônomo Cego", "chest", "mythic", 100, 30, 400, 600, 300],
  ["Templo Ambulante, Peitoral do Monge Iluminado", "chest", "mythic", 100, 50, 460, 750, 220],
  ["Perpétuo Inverno, Peitoral do Rei Gelado", "chest", "legendary", 95, 40, 420, 700, 180],
  ["Rugido do Leão, Peitoral do Campeão", "chest", "legendary", 95, 55, 440, 780, 100],
  ["Trevas Solidificadas, Peitoral do Void Cavaleiro", "chest", "legendary", 95, 45, 410, 680, 240],
  ["Aegis Solar, Peitoral do Herói do Amanhecer", "chest", "legendary", 95, 40, 430, 720, 200],
  ["Manoplas do Golem Rúnico", "gloves", "mythic", 100, 320, 180, 300, 220],
  ["Toque do Rei Meia-Noite", "gloves", "mythic", 100, 340, 160, 240, 280],
  ["Punhos de Cometa", "gloves", "legendary", 95, 280, 140, 200, 180],
  ["Grevas do Errante Astral", "legs", "mythic", 100, 60, 380, 520, 200],
  ["Perneiras do Titã Adormecido", "legs", "mythic", 100, 40, 420, 600, 100],
  ["Calças de Guerra do Deus da Batalha", "legs", "legendary", 95, 60, 340, 480, 160],
  ["Botas do Errante entre Mundos", "boots", "mythic", 100, 80, 260, 380, 260],
  ["Sandálias do Mensageiro Divino", "boots", "mythic", 100, 60, 240, 340, 320],
  ["Coturnos do Vento Furioso", "boots", "legendary", 95, 70, 220, 300, 200],
  ["Elmo do Rei Coroado nas Estrelas", "helm", "mythic", 100, 80, 380, 500, 340],
  ["Capuz da Sombra que Devora", "helm", "mythic", 100, 100, 340, 420, 400],
  ["Coroa do Imperador Fantasmagórico", "helm", "legendary", 95, 90, 320, 400, 280],

  // === Legendary shields (10) ===
  ["Baluarte de Éter, Escudo Impassível", "shield", "mythic", 100, 20, 560, 900, 120],
  ["Escudo do Sol Nascente", "shield", "mythic", 100, 40, 520, 820, 200],
  ["Baluarte do Anjo Caído", "shield", "mythic", 100, 60, 500, 780, 240],
  ["Muralha Ambulante do Rei Anão", "shield", "legendary", 95, 30, 480, 780, 80],
  ["Rodela do Duelista Estelar", "shield", "legendary", 95, 40, 420, 640, 200],
  ["Broquel do Cavaleiro sem Nome", "shield", "legendary", 95, 30, 440, 700, 140],
  ["Pavês do Comandante Antigo", "shield", "legendary", 95, 20, 500, 800, 60],
  ["Adarga Real dos Séculos", "shield", "legendary", 95, 40, 460, 700, 180],
  ["Escudo-Espelho do Ilusionista", "shield", "legendary", 95, 30, 400, 620, 260],
  ["Bastião de Aço Vivo", "shield", "legendary", 95, 20, 520, 820, 100],

  // === Accessories (25) ===
  ["Coração do Cosmos, Colar do Astrolabista", "necklace", "mythic", 100, 220, 100, 400, 500],
  ["Lágrima da Deusa Silenciosa, Colar Divino", "necklace", "mythic", 100, 180, 120, 380, 520],
  ["Amuleto do Tempo Estilhaçado", "necklace", "mythic", 100, 200, 100, 360, 480],
  ["Pingente do Sonho Lúcido", "necklace", "legendary", 95, 160, 80, 300, 400],
  ["Talismã do Andarilho Etéreo", "necklace", "legendary", 95, 180, 90, 320, 380],
  ["Colar do Rei Sem Coroa", "necklace", "legendary", 95, 200, 100, 340, 340],
  ["Gargantilha do Feiticeiro Proibido", "necklace", "legendary", 95, 170, 80, 280, 460],
  ["Selo Universal, Anel do Multiverso", "ring", "mythic", 100, 260, 120, 420, 460],
  ["Aliança de Estrelas Cadentes", "ring", "mythic", 100, 240, 100, 380, 480],
  ["Anel do Contrato Divino", "ring", "mythic", 100, 280, 130, 400, 400],
  ["Signete do Dragão Adormecido", "ring", "legendary", 95, 220, 100, 340, 300],
  ["Anel do Punho Titânico", "ring", "legendary", 95, 240, 90, 320, 260],
  ["Aro do Ceifador Estelar", "ring", "legendary", 95, 230, 100, 300, 340],
  ["Argola do Xamã Ancestral", "ring", "legendary", 95, 210, 110, 340, 320],
  ["Cinto do Bárbaro Coroado", "belt", "mythic", 100, 100, 260, 640, 160],
  ["Faixa do Monge Iluminado", "belt", "mythic", 100, 80, 240, 580, 320],
  ["Cinturão do Comandante Imortal", "belt", "legendary", 95, 90, 220, 520, 200],
  ["Bandoleira do Aventureiro Lendário", "belt", "legendary", 95, 100, 200, 480, 180],
  ["Correia do Guerreiro do Norte", "belt", "legendary", 95, 80, 240, 500, 140],
  ["Manto do Fim dos Tempos", "cape", "mythic", 100, 120, 260, 520, 380],
  ["Capa da Fênix Ressuscitada", "cape", "mythic", 100, 140, 240, 500, 340],
  ["Estola do Feiticeiro Cósmico", "cape", "mythic", 100, 100, 220, 460, 460],
  ["Véu da Noite Perpétua", "cape", "legendary", 95, 130, 220, 440, 300],
  ["Xaile do Andarilho Astral", "cape", "legendary", 95, 110, 200, 400, 360],
  ["Manto do Rei Corvo", "cape", "legendary", 95, 120, 240, 460, 260],

  // === Weapons Round 2 (20 more to reach exactly 100) ===
  ["Colossus, Espada Maior que Torres", "weapon", "mythic", 100, 540, 30, 260, 40],
  ["Estrela Cadente, Cajado do Meteoro", "weapon", "mythic", 100, 400, 20, 180, 480],
  ["Vento Vermelho, Katana do Duelista Sem Face", "weapon", "mythic", 100, 440, 15, 160, 240],
  ["Bênção de Ares, Espada do Deus da Guerra", "weapon", "mythic", 100, 490, 40, 300, 120],
  ["Mordida Voraz, Machado do Cão Infernal", "weapon", "mythic", 100, 470, 25, 220, 140],
  ["Chuva de Prata, Arco dos Céus Chorosos", "weapon", "mythic", 100, 420, 10, 160, 300],
  ["Ruína Real, Cajado do Rei Louco", "weapon", "mythic", 100, 380, 15, 180, 460],
  ["Ferrolar da Aurora, Lança do Sol", "weapon", "mythic", 100, 460, 25, 200, 200],
  ["Sussurro do Vazio, Adaga Envenenada", "weapon", "mythic", 100, 510, 10, 100, 280],
  ["Trovão Absoluto, Martelo do Deus dos Céus", "weapon", "mythic", 100, 500, 40, 320, 180],
  ["Escuridão Reunida, Espada do Cavaleiro Negro", "weapon", "legendary", 95, 400, 30, 240, 160],
  ["Bico do Falcão, Arco do Grande Caçador", "weapon", "legendary", 95, 360, 15, 160, 220],
  ["Fúria Contida, Punhos do Monge Silencioso", "weapon", "legendary", 95, 380, 40, 240, 240],
  ["Corte Perfeito, Katana do Mestre Cego", "weapon", "legendary", 95, 400, 20, 180, 220],
  ["Rajada Solar, Chakram do Andarilho", "weapon", "legendary", 95, 370, 20, 170, 240],
  ["Vórtice, Foice Circular do Ceifador", "weapon", "legendary", 95, 420, 25, 200, 180],
  ["Lâmina do Juramento Quebrado", "weapon", "legendary", 95, 390, 20, 180, 220],
  ["Pesadelo Cristalizado, Cajado do Sonhador", "weapon", "legendary", 95, 320, 15, 160, 400],
  ["Lança Solar do Herói Antigo", "weapon", "legendary", 95, 400, 30, 220, 180],
  ["Espada Sussurrante do Conselheiro Traidor", "weapon", "legendary", 95, 400, 20, 200, 220],
];

if (AMBITIOUS.length !== 100) {
  // Compile-time sanity: keep the promise of "100 ambitious things".
  throw new Error(`AMBITIOUS list must be exactly 100, got ${AMBITIOUS.length}`);
}

const SLOT_ICON_LOCAL: Record<ItemSlot, string> = {
  helm: "🪖", chest: "🥋", legs: "👖", boots: "🥾", gloves: "🧤",
  necklace: "📿", belt: "🎗️", ring: "💍", weapon: "⚔️", shield: "🛡️", cape: "🧣",
};

export const AMBITIOUS_ITEMS: Item[] = AMBITIOUS.map(([name, slot, rarity, level, attack, defense, hp, mp], i) => ({
  id: `ambitious-${i}`,
  name,
  slot,
  rarity,
  level,
  attack,
  defense,
  hp,
  mp,
  icon: SLOT_ICON_LOCAL[slot],
}));
