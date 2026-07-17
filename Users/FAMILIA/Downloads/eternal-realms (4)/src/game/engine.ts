// Eternal Realms - offline 2D action RPG engine
// Single-file game core. Rendered on a canvas, no external assets.
import { aggregateRuneBonuses, RUNE_ZERO, type OwnedRune, type RuneBonuses } from "./ancientRunes";
import { ISLAND2_BIOMES } from "./island2";
import { ISLAND3_BIOMES } from "./island3";
import { ISLAND4_BIOMES } from "./island4";
import { NEW_ISLANDS_BIOMES } from "./new_islands";

export type Biome = {
  id: number;
  name: string;
  color: string;
  accent: string;
  danger: number; // 1..30
  monsters: string[];
  boss: string;
  // Sub-floor (cave/dungeon) theme
  caveTheme: {
    label: string; // e.g. "Cripta", "Masmorra", "Gruta"
    floor: string;
    wall: string;
    accent: string;
    monsters: string[];
    boss: string;
  };
};

// Helper to derive cave theme quickly
function ct(
  label: string,
  floor: string,
  wall: string,
  accent: string,
  monsters: string[],
  boss: string,
) {
  return { label, floor, wall, accent, monsters, boss };
}

export const BIOMES: Biome[] = [
  {
    id: 1,
    name: "Planícies de Aurora",
    color: "#6fb85f",
    accent: "#3d7a3a",
    danger: 1,
    monsters: ["Lobo Cinzento", "Bandido", "Javali"],
    boss: "Alfa da Alvorada",
    caveTheme: ct(
      "Toca da Alvorada",
      "#3a3a2a",
      "#1a1a12",
      "#8fae60",
      ["Lobo Sombrio", "Rato Grande", "Salteador Oculto"],
      "Matriarca dos Lobos",
    ),
  },
  {
    id: 2,
    name: "Floresta Esmeralda",
    color: "#2f6a3a",
    accent: "#1e4a26",
    danger: 3,
    monsters: ["Aranha Gigante", "Treant Jovem", "Elfo Sombrio"],
    boss: "Guardião Esmeralda",
    caveTheme: ct(
      "Ninho da Floresta",
      "#1a2a1a",
      "#0a180a",
      "#4faf60",
      ["Aranha das Raízes", "Broto Corrompido", "Traça Verde"],
      "Aranha-Mãe Esmeralda",
    ),
  },
  {
    id: 3,
    name: "Deserto Escarlate",
    color: "#d09550",
    accent: "#8f5a2a",
    danger: 5,
    monsters: ["Escorpião Real", "Múmia", "Salteador"],
    boss: "Faraó Esquecido",
    caveTheme: ct(
      "Tumba do Faraó",
      "#3a2818",
      "#1a1008",
      "#c08a40",
      ["Múmia Antiga", "Escaravelho Ígneo", "Sacerdote Sepulto"],
      "Faraó Ressurgido",
    ),
  },
  {
    id: 4,
    name: "Montanhas de Ferro",
    color: "#8a8a92",
    accent: "#4a4a52",
    danger: 7,
    monsters: ["Golem de Pedra", "Ogro", "Anão Renegado"],
    boss: "Colosso de Ferro",
    caveTheme: ct(
      "Mina de Ferro",
      "#2a2a30",
      "#12121a",
      "#8090a0",
      ["Kobold Mineiro", "Golem Menor", "Aranha Metálica"],
      "Forjador Colossal",
    ),
  },
  {
    id: 5,
    name: "Pântano Sombrio",
    color: "#4a5a3a",
    accent: "#22331f",
    danger: 9,
    monsters: ["Zumbi Afogado", "Bruxa", "Serpente Venenosa"],
    boss: "Hidra do Pântano",
    caveTheme: ct(
      "Cripta do Lodo",
      "#1a2018",
      "#08100a",
      "#5a8040",
      ["Verme Podre", "Bruxa Menor", "Slime Tóxico"],
      "Hidra Enraizada",
    ),
  },
  {
    id: 6,
    name: "Tundra Boreal",
    color: "#c4d8dc",
    accent: "#7a9098",
    danger: 11,
    monsters: ["Urso Polar", "Lobo Gelado", "Espectro Ártico"],
    boss: "Imperador do Gelo",
    caveTheme: ct(
      "Caverna Congelada",
      "#2a3a40",
      "#12181c",
      "#a8c8d8",
      ["Espectro Ártico", "Aranha do Gelo", "Draugr"],
      "Rei do Permafrost",
    ),
  },
  {
    id: 7,
    name: "Cordilheira Glacial",
    color: "#a8c8d8",
    accent: "#5a7080",
    danger: 13,
    monsters: ["Grifo Gelado", "Yeti", "Arqueiro Boreal"],
    boss: "Dragão Boreal",
    caveTheme: ct(
      "Câmara do Dragão",
      "#20303a",
      "#0a1418",
      "#98b0c0",
      ["Filhote Draconiano", "Yeti Cavernícola", "Espírito Gelado"],
      "Dragão Ancestral",
    ),
  },
  {
    id: 8,
    name: "Selva Tropical",
    color: "#3d8a3a",
    accent: "#1f5020",
    danger: 6,
    monsters: ["Onça", "Naga", "Caçador de Cabeças"],
    boss: "Altar da Selva",
    caveTheme: ct(
      "Templo da Naga",
      "#1a2818",
      "#08140a",
      "#5aa060",
      ["Naga das Sombras", "Onça Espectral", "Ídolo Vivo"],
      "Sacerdotisa Naga",
    ),
  },
  {
    id: 9,
    name: "Floresta Carmesim",
    color: "#8a3a3a",
    accent: "#4a1010",
    danger: 14,
    monsters: ["Lobisomem", "Fada Rubra", "Cervo Sombrio"],
    boss: "Guardião Rubi",
    caveTheme: ct(
      "Covil Sangrento",
      "#2a1010",
      "#100404",
      "#c04040",
      ["Lobisomem Menor", "Vampiro Jovem", "Fada Corrompida"],
      "Alfa Escarlate",
    ),
  },
  {
    id: 10,
    name: "Vulcões de Obsidiana",
    color: "#5a2020",
    accent: "#2a0a0a",
    danger: 18,
    monsters: ["Elemental de Lava", "Demônio Menor", "Salamandra"],
    boss: "Titã de Obsidiana",
    caveTheme: ct(
      "Forja Vulcânica",
      "#2a0808",
      "#100404",
      "#e05020",
      ["Diabrete", "Elemental Ígneo", "Salamandra Fundida"],
      "Senhor do Magma",
    ),
  },
  {
    id: 11,
    name: "Costa Tempestuosa",
    color: "#8ab0c8",
    accent: "#3a5060",
    danger: 4,
    monsters: ["Corsário", "Kraken Jovem", "Homem-Peixe"],
    boss: "Almirante Fantasma",
    caveTheme: ct(
      "Gruta Marinha",
      "#1a2830",
      "#080f14",
      "#60a0c0",
      ["Homem-Peixe", "Marujo Afogado", "Polvo Menor"],
      "Capitão Naufragado",
    ),
  },
  {
    id: 12,
    name: "Arquipélago das Marés",
    color: "#5aa8c8",
    accent: "#204a60",
    danger: 8,
    monsters: ["Pirata", "Sereia Sombria", "Tubarão Colossal"],
    boss: "Leviatã das Marés",
    caveTheme: ct(
      "Fossa das Marés",
      "#0a1a24",
      "#040a10",
      "#4090b0",
      ["Sereia Sombria", "Anguíla Elétrica", "Casco Amaldiçoado"],
      "Leviatã Menor",
    ),
  },
  {
    id: 13,
    name: "Cavernas de Cristal",
    color: "#a89ad8",
    accent: "#4a3a80",
    danger: 10,
    monsters: ["Golem de Cristal", "Aranha de Ametista", "Minerador Louco"],
    boss: "Rainha de Cristal",
    caveTheme: ct(
      "Geoda Profunda",
      "#2a2040",
      "#100818",
      "#a880ff",
      ["Cristal Andante", "Larva de Ametista", "Ecoador"],
      "Coração de Cristal",
    ),
  },
  {
    id: 14,
    name: "Penhascos Celestiais",
    color: "#c8d8e8",
    accent: "#6a7a90",
    danger: 16,
    monsters: ["Águia Real", "Servo Angelical", "Gárgula"],
    boss: "Serafim Caído",
    caveTheme: ct(
      "Santuário Suspenso",
      "#2a303a",
      "#101418",
      "#c8d0e0",
      ["Gárgula Menor", "Coro Distorcido", "Anjo Menor"],
      "Herald Caído",
    ),
  },
  {
    id: 15,
    name: "Vale dos Ventos",
    color: "#a8c890",
    accent: "#5a7040",
    danger: 5,
    monsters: ["Elemental de Ar", "Wyvern Jovem", "Ladrão do Vento"],
    boss: "Roc Ancião",
    caveTheme: ct(
      "Câmara Sussurrante",
      "#20281c",
      "#0c100a",
      "#a0c088",
      ["Espírito Sibilante", "Morcego Cortante", "Assobio Vivo"],
      "Vórtice Ancião",
    ),
  },
  {
    id: 16,
    name: "Campos Dourados",
    color: "#e0c060",
    accent: "#907028",
    danger: 2,
    monsters: ["Espantalho Vivo", "Rato Gigante", "Camponês Amaldiçoado"],
    boss: "Ceifador Dourado",
    caveTheme: ct(
      "Adega Amaldiçoada",
      "#302818",
      "#100c08",
      "#d8b040",
      ["Rato Amaldiçoado", "Espantalho Menor", "Camponês Podre"],
      "Ceifador Menor",
    ),
  },
  {
    id: 17,
    name: "Ruínas Imperiais",
    color: "#a89078",
    accent: "#5a4830",
    danger: 12,
    monsters: ["Cavaleiro Fantasma", "Estátua Viva", "Legionário"],
    boss: "Imperador Espectral",
    caveTheme: ct(
      "Catacumbas Imperiais",
      "#28201a",
      "#100c08",
      "#c0a080",
      ["Legionário Espectral", "Escravo Amaldiçoado", "Estátua Menor"],
      "Senador Cadavérico",
    ),
  },
  {
    id: 18,
    name: "Reino Subterrâneo",
    color: "#605068",
    accent: "#2a2030",
    danger: 15,
    monsters: ["Anão Ancião", "Trol das Cavernas", "Dweller"],
    boss: "Rei das Profundezas",
    caveTheme: ct(
      "Profundezas do Trono",
      "#181420",
      "#080610",
      "#807090",
      ["Verme das Rochas", "Trol Menor", "Dweller Cego"],
      "Trono Fundo",
    ),
  },
  {
    id: 19,
    name: "Mar de Cinzas",
    color: "#706860",
    accent: "#302a24",
    danger: 17,
    monsters: ["Fenix Menor", "Cão Ígneo", "Espírito de Fumaça"],
    boss: "Fênix Ancestral",
    caveTheme: ct(
      "Cratera Fumegante",
      "#201814",
      "#0c0806",
      "#c0806a",
      ["Cão de Cinzas", "Salamandra Menor", "Espectro Fumaça"],
      "Fênix Menor",
    ),
  },
  {
    id: 20,
    name: "Bosque Luminescente",
    color: "#5a4a90",
    accent: "#2a1f4a",
    danger: 12,
    monsters: ["Fada Corrompida", "Cogumelo Andante", "Vagalume Gigante"],
    boss: "Rainha Bioluminescente",
    caveTheme: ct(
      "Micélio Profundo",
      "#141028",
      "#080418",
      "#a880f0",
      ["Cogumelo Explosivo", "Vagalume Sombrio", "Micomorfe"],
      "Rainha do Micélio",
    ),
  },
  {
    id: 21,
    name: "Ilha das Tempestades",
    color: "#4a5a80",
    accent: "#1a2440",
    danger: 19,
    monsters: ["Elemental de Raio", "Marinheiro Amaldiçoado", "Harpia"],
    boss: "Senhor das Tempestades",
    caveTheme: ct(
      "Câmara do Trovão",
      "#101828",
      "#060a14",
      "#80a0f0",
      ["Elemental Voltaico", "Harpia Menor", "Marujo Voltaico"],
      "Coração da Tempestade",
    ),
  },
  {
    id: 22,
    name: "Fortaleza Abandonada",
    color: "#585868",
    accent: "#282838",
    danger: 20,
    monsters: ["Cavaleiro Caído", "Necromante", "Lich Aprendiz"],
    boss: "Rei Caído",
    caveTheme: ct(
      "Masmorra do Rei",
      "#181820",
      "#080810",
      "#a0a0c0",
      ["Cavaleiro Esqueleto", "Aprendiz Lich", "Servo Necro"],
      "Príncipe Amaldiçoado",
    ),
  },
  {
    id: 23,
    name: "Cânion Rubro",
    color: "#c0603a",
    accent: "#7a3018",
    danger: 11,
    monsters: ["Basilisco", "Bandoleiro", "Escorpião Vermelho"],
    boss: "Wyrm do Cânion",
    caveTheme: ct(
      "Fenda do Wyrm",
      "#301810",
      "#100806",
      "#d0603a",
      ["Basilisco Jovem", "Escorpião Menor", "Bandoleiro Oculto"],
      "Wyrm Menor",
    ),
  },
  {
    id: 24,
    name: "Picos Celestes",
    color: "#d0dae8",
    accent: "#7080a0",
    danger: 21,
    monsters: ["Dragão Alado", "Monge Ancião", "Roc"],
    boss: "Deus dos Ventos",
    caveTheme: ct(
      "Câmara do Ventos",
      "#20282e",
      "#0c1014",
      "#c0d0e8",
      ["Monge Espectral", "Wyvern Jovem", "Roc Jovem"],
      "Ancião dos Ventos",
    ),
  },
  {
    id: 25,
    name: "Jardim Ancestral",
    color: "#80c080",
    accent: "#3a6a3a",
    danger: 14,
    monsters: ["Ninfa", "Espinho Vivo", "Guardião Floral"],
    boss: "Espírito Ancestral",
    caveTheme: ct(
      "Raízes Ancestrais",
      "#182818",
      "#080c08",
      "#80d080",
      ["Raiz Faminta", "Ninfa Menor", "Broto Espinhado"],
      "Coração Ancião",
    ),
  },
  {
    id: 26,
    name: "Cidade Perdida",
    color: "#98908a",
    accent: "#4a4038",
    danger: 16,
    monsters: ["Cidadão Amaldiçoado", "Cão de Guerra", "Ladrão Fantasma"],
    boss: "Prefeito Corrompido",
    caveTheme: ct(
      "Esgotos Perdidos",
      "#20201c",
      "#0c0c08",
      "#a89880",
      ["Rato Amaldiçoado", "Ladrão Espectral", "Cidadão Podre"],
      "Contramestre Espectral",
    ),
  },
  {
    id: 27,
    name: "Abismo Infinito",
    color: "#2a2038",
    accent: "#100818",
    danger: 24,
    monsters: ["Aberrante", "Tentáculo", "Devorador"],
    boss: "Coisa do Abismo",
    caveTheme: ct(
      "Fenda Impossível",
      "#100818",
      "#040208",
      "#6040a0",
      ["Tentáculo Menor", "Olho Flutuante", "Voraz Cego"],
      "Devorador Menor",
    ),
  },
  {
    id: 28,
    name: "Reino das Sombras",
    color: "#1a1a2a",
    accent: "#080810",
    danger: 26,
    monsters: ["Sombra", "Assassino Sombrio", "Umbra"],
    boss: "Rei das Sombras",
    caveTheme: ct(
      "Vazio Sombrio",
      "#080810",
      "#020208",
      "#4a4a6a",
      ["Sombra Vazia", "Assassino Umbra", "Eco Sombrio"],
      "Príncipe Sombrio",
    ),
  },
  {
    id: 29,
    name: "Plano Astral",
    color: "#5a3a90",
    accent: "#2a1a4a",
    danger: 28,
    monsters: ["Vigia Astral", "Estrela Caída", "Fragmento Cósmico"],
    boss: "Sentinela Cósmico",
    caveTheme: ct(
      "Nexo Astral",
      "#181028",
      "#080418",
      "#a080ff",
      ["Fragmento Menor", "Vigia Menor", "Eco Astral"],
      "Sentinela Menor",
    ),
  },
  {
    id: 30,
    name: "Trono dos Criadores",
    color: "#e0c078",
    accent: "#a08040",
    danger: 30,
    monsters: ["Anjo do Alvorecer", "Herald Divino", "Serafim"],
    boss: "O Criador",
    caveTheme: ct(
      "Câmara Divina",
      "#302818",
      "#100c08",
      "#f0d090",
      ["Herald Menor", "Serafim Menor", "Coro Divino"],
      "Arauto do Criador",
    ),
  },
  // ---- New biomes 31..40 ----
  {
    id: 31,
    name: "Deserto de Sal",
    color: "#e8e0c8",
    accent: "#a89870",
    danger: 6,
    monsters: ["Cristalino Salino", "Nômade Cego", "Escorpião Branco"],
    boss: "Rainha do Sal",
    caveTheme: ct(
      "Caverna Salina",
      "#302818",
      "#100c08",
      "#e8dcb0",
      ["Cristal Salino", "Verme das Salinas", "Espectro do Sal"],
      "Coração Salino",
    ),
  },
  {
    id: 32,
    name: "Terras Radioativas",
    color: "#8ac040",
    accent: "#4a6018",
    danger: 22,
    monsters: ["Mutante", "Ghoul Verde", "Cão Deformado"],
    boss: "Aberração Prima",
    caveTheme: ct(
      "Bunker Radioativo",
      "#18201a",
      "#080c08",
      "#a0ff40",
      ["Ghoul Menor", "Rato Mutante", "Servo Radioativo"],
      "Núcleo Vivo",
    ),
  },
  {
    id: 33,
    name: "Cemitério Fúnebre",
    color: "#5a5060",
    accent: "#2a2030",
    danger: 13,
    monsters: ["Esqueleto Guerreiro", "Cão Necrótico", "Necrofago"],
    boss: "Coveiro Eterno",
    caveTheme: ct(
      "Cripta Ossuária",
      "#181420",
      "#080610",
      "#c0b0d0",
      ["Esqueleto Menor", "Ghoul Sepulto", "Espectro Cadavérico"],
      "Lich Ancião",
    ),
  },
  {
    id: 34,
    name: "Ilhas Flutuantes",
    color: "#8ac0e0",
    accent: "#3a6080",
    danger: 15,
    monsters: ["Wyvern Menor", "Servo do Vento", "Piloto Aéreo"],
    boss: "Skywhale Ancião",
    caveTheme: ct(
      "Câmara Suspensa",
      "#182028",
      "#080c10",
      "#a0d0f0",
      ["Servo do Vento", "Espírito Nublado", "Djinn Menor"],
      "Djinn Ancião",
    ),
  },
  {
    id: 35,
    name: "Grutas de Mercúrio",
    color: "#b0b8c0",
    accent: "#5a6068",
    danger: 19,
    monsters: ["Elemental Líquido", "Espelho Vivo", "Alquimista Amaldiçoado"],
    boss: "Prisma do Mercúrio",
    caveTheme: ct(
      "Lago de Mercúrio",
      "#181820",
      "#080810",
      "#d0d8e0",
      ["Poça Líquida", "Espelho Menor", "Reflexo Sombrio"],
      "Titã do Mercúrio",
    ),
  },
  {
    id: 36,
    name: "Planalto Fúngico",
    color: "#a880c0",
    accent: "#4a2a60",
    danger: 10,
    monsters: ["Mycon", "Esporo Andante", "Guardião do Fungo"],
    boss: "Colônia-Mãe",
    caveTheme: ct(
      "Micélio das Sombras",
      "#181020",
      "#080418",
      "#c090e0",
      ["Esporo Explosivo", "Mycon Menor", "Sombra Fúngica"],
      "Rainha Fúngica",
    ),
  },
  {
    id: 37,
    name: "Ruínas Cristalinas",
    color: "#c0e0e8",
    accent: "#5080a0",
    danger: 17,
    monsters: ["Estátua de Prisma", "Guardião Ancião", "Vidro Vivo"],
    boss: "Arquiteto de Vidro",
    caveTheme: ct(
      "Sanctum de Vidro",
      "#182028",
      "#080c10",
      "#c0e8f0",
      ["Fragmento Andante", "Guardião Menor", "Prisma Sombrio"],
      "Sanctum Ancião",
    ),
  },
  {
    id: 38,
    name: "Vastidão Voraz",
    color: "#603838",
    accent: "#301818",
    danger: 23,
    monsters: ["Devorador Menor", "Boca Andante", "Tentáculo Faminto"],
    boss: "Fauces do Mundo",
    caveTheme: ct(
      "Estômago do Mundo",
      "#201010",
      "#0c0606",
      "#a04040",
      ["Órgão Vivo", "Verme Digestivo", "Ácido Andante"],
      "Fauces Menores",
    ),
  },
  {
    id: 39,
    name: "Bosque Espectral",
    color: "#3a5a5a",
    accent: "#182828",
    danger: 20,
    monsters: ["Assombração", "Cervo Espectral", "Wisp Sombrio"],
    boss: "Senhora dos Espectros",
    caveTheme: ct(
      "Cripta Espectral",
      "#141c1c",
      "#080e0e",
      "#80c0c0",
      ["Wisp Menor", "Aparição", "Servo Espectral"],
      "Espectro Ancestral",
    ),
  },
  {
    id: 40,
    name: "Núcleo do Mundo",
    color: "#c04010",
    accent: "#601808",
    danger: 30,
    monsters: ["Elemental Primal", "Coração de Magma", "Titã Menor"],
    boss: "Coração do Mundo",
    caveTheme: ct(
      "Câmara do Núcleo",
      "#200806",
      "#100404",
      "#ff6020",
      ["Chama Primal", "Servo do Núcleo", "Elemental Fundido"],
      "Núcleo Ancião",
    ),
  },
  // ---- New biomes 41..50 (each has 4 floors and a unique dungeon layout algorithm) ----
  {
    id: 41,
    name: "Deserto Cristalino",
    color: "#e0d8f0",
    accent: "#8070c0",
    danger: 8,
    monsters: ["Cristal Andante", "Miragem Sombria", "Escaravelho Cristal"],
    boss: "Prisma Errante",
    caveTheme: ct(
      "Labirinto Cristalino",
      "#20182a",
      "#0a0810",
      "#c0a0ff",
      ["Estilhaço Vivo", "Reflexo Sombrio", "Vidro Faminto"],
      "Coração Prismático",
    ),
  },
  {
    id: 42,
    name: "Savana Cinzenta",
    color: "#a8a06a",
    accent: "#5a5030",
    danger: 9,
    monsters: ["Hiena Sombria", "Xamã Cinza", "Leão Faminto"],
    boss: "Pantera Cinzenta",
    caveTheme: ct(
      "Termiteira Ancestral",
      "#282218",
      "#12100a",
      "#d8c880",
      ["Cupim Rainha", "Bicho da Cinza", "Xamã Menor"],
      "Rainha Cinzenta",
    ),
  },
  {
    id: 43,
    name: "Arquipélago Coral",
    color: "#f0a0b0",
    accent: "#a04060",
    danger: 12,
    monsters: ["Anêmona Predadora", "Náufrago", "Peixe-Espada"],
    boss: "Kraken Coralino",
    caveTheme: ct(
      "Recife Vivo",
      "#181828",
      "#08080f",
      "#ff90a0",
      ["Anêmona Menor", "Cavalo-Marinho Podre", "Estrela do Abismo"],
      "Coração de Coral",
    ),
  },
  {
    id: 44,
    name: "Terras Escaldadas",
    color: "#c07040",
    accent: "#603010",
    danger: 22,
    monsters: ["Salamandra Colossal", "Peregrino Ígneo", "Diabrete"],
    boss: "Titã da Cinza",
    caveTheme: ct(
      "Forja Ancestral",
      "#20100a",
      "#100604",
      "#ff8040",
      ["Ferreiro Amaldiçoado", "Bigorna Viva", "Chama Cativa"],
      "Deus Ferreiro",
    ),
  },
  {
    id: 45,
    name: "Bosque de Ébano",
    color: "#3a2a4a",
    accent: "#180a20",
    danger: 18,
    monsters: ["Lobo de Ébano", "Coruja Sombria", "Bruxo Ancião"],
    boss: "Rei do Ébano",
    caveTheme: ct(
      "Raízes de Ébano",
      "#100818",
      "#040208",
      "#8060c0",
      ["Raiz Sombria", "Coruja Espectral", "Bruxo Menor"],
      "Coração Sombrio",
    ),
  },
  {
    id: 46,
    name: "Terras Bioluminescentes",
    color: "#40c0a0",
    accent: "#106050",
    danger: 14,
    monsters: ["Água-Viva Voadora", "Espírito Luz", "Peixe Elétrico"],
    boss: "Meduzza Ancestral",
    caveTheme: ct(
      "Lagoa Luminosa",
      "#082018",
      "#04100c",
      "#60ffd0",
      ["Água-Viva Menor", "Enguia Elétrica", "Broto Luminoso"],
      "Rainha Luminosa",
    ),
  },
  {
    id: 47,
    name: "Planalto do Trovão",
    color: "#606080",
    accent: "#202040",
    danger: 19,
    monsters: ["Elemental Voltaico", "Xamã do Trovão", "Grifo Elétrico"],
    boss: "Roc do Relâmpago",
    caveTheme: ct(
      "Câmara Ressonante",
      "#101020",
      "#040410",
      "#a0a0ff",
      ["Faísca Viva", "Trovão Cativo", "Xamã Menor"],
      "Trovão Ancestral",
    ),
  },
  {
    id: 48,
    name: "Deserto de Vidro",
    color: "#e0f0f0",
    accent: "#8090a0",
    danger: 20,
    monsters: ["Escorpião de Vidro", "Nômade Refletido", "Espelho Vivo"],
    boss: "Espelho Fundido",
    caveTheme: ct(
      "Sala dos Espelhos",
      "#202028",
      "#080810",
      "#e0e8f0",
      ["Reflexo Menor", "Estilhaço Andante", "Sombra Espelhada"],
      "Prisma do Nada",
    ),
  },
  {
    id: 49,
    name: "Vazio Etéreo",
    color: "#4a2060",
    accent: "#20082a",
    danger: 27,
    monsters: ["Vigia Etéreo", "Ausência Viva", "Devorador de Estrelas"],
    boss: "Coração do Vazio",
    caveTheme: ct(
      "Fenda Etérea",
      "#100418",
      "#040208",
      "#a060ff",
      ["Sombra Etérea", "Vigia Menor", "Fragmento Vazio"],
      "Vazio Menor",
    ),
  },
  {
    id: 50,
    name: "Éden Perdido",
    color: "#b0f0a0",
    accent: "#40a040",
    danger: 30,
    monsters: ["Anjo Guardião", "Ninfa Ancestral", "Serafim Menor"],
    boss: "Guardião do Éden",
    caveTheme: ct(
      "Jardim Suspenso",
      "#182818",
      "#0c140c",
      "#c0ffb0",
      ["Flor Viva", "Ninfa Menor", "Serafim Menor"],
      "Coração do Éden",
    ),
  },
  // ---- New biomes 51..60 (with deep immersion and specialized designs) ----
  {
    id: 51,
    name: "Oásis Celestial",
    color: "#dcd4b0",
    accent: "#a89050",
    danger: 25,
    monsters: ["Fada de Areia", "Golem de Sal", "Víbora Divina"],
    boss: "Príncipe do Oásis",
    caveTheme: ct(
      "Santuário da Miragem",
      "#1a251a",
      "#050a05",
      "#e8c840",
      ["Miragem Viva", "Serpente Solar", "Gárgula de Areia"],
      "Guardião da Ilusão",
    ),
  },
  {
    id: 52,
    name: "Geleira de Piche",
    color: "#283438",
    accent: "#121a1e",
    danger: 22,
    monsters: ["Monstro de Alcatrão", "Mamute Gelado", "Draugr Escuro"],
    boss: "Abominável do Piche",
    caveTheme: ct(
      "Abismo de Piche",
      "#101018",
      "#040406",
      "#4a8a90",
      ["Morcego de Piche", "Espectro Congelado", "Slime de Óleo"],
      "Pesadelo do Alcatrão",
    ),
  },
  {
    id: 53,
    name: "Cemitério de Gigantes",
    color: "#6c665e",
    accent: "#3c3834",
    danger: 24,
    monsters: ["Esqueleto de Titã", "Abutre Carniceiro", "Cão de Ossos"],
    boss: "Ceifador de Gigantes",
    caveTheme: ct(
      "Mausoléu Gigante",
      "#1a1a1e",
      "#0a0a0c",
      "#d09090",
      ["Anão Zumbi", "Espectro Ancestral", "Verme de Ossos"],
      "Rei Esqueleto Titã",
    ),
  },
  {
    id: 54,
    name: "Selva de Cobre",
    color: "#b07c50",
    accent: "#784a28",
    danger: 16,
    monsters: ["Aranha de Bronze", "Macaco Mecânico", "Pantera de Latão"],
    boss: "Colosso Autômato",
    caveTheme: ct(
      "Fundição de Cobre",
      "#2a1e15",
      "#100a06",
      "#c88040",
      ["Engrenagem Viva", "Golem de Bronze", "Rato de Metal"],
      "O Forjador Mecânico",
    ),
  },
  {
    id: 55,
    name: "Mar de Sangue",
    color: "#902020",
    accent: "#4a0505",
    danger: 28,
    monsters: ["Lobo Sanguinolento", "Mosquito Gigante", "Vampiro Veloz"],
    boss: "Condessa de Sangue",
    caveTheme: ct(
      "Catedral Sanguínea",
      "#200505",
      "#0a0101",
      "#ff3333",
      ["Sombra de Sangue", "Dreno de Vida", "Múmia Sangrenta"],
      "Conde Drácula",
    ),
  },
  {
    id: 56,
    name: "Abismo Tempestuoso",
    color: "#304060",
    accent: "#121a30",
    danger: 26,
    monsters: ["Elemental de Tufão", "Arqueiro do Trovão", "Wyvern das Nuvens"],
    boss: "Dragão da Tempestade",
    caveTheme: ct(
      "Fenda do Relâmpago",
      "#0f1626",
      "#040810",
      "#50a0ff",
      ["Filhote Tempestuoso", "Espectro Elétrico", "Vento Cortante"],
      "Deus do Trovão",
    ),
  },
  {
    id: 57,
    name: "Vale das Sombras",
    color: "#1f1830",
    accent: "#0a0614",
    danger: 27,
    monsters: ["Sombra Errante", "Aranha Sombria", "Pantera Negra"],
    boss: "Senhor da Escuridão",
    caveTheme: ct(
      "Mausoléu das Sombras",
      "#0f0f14",
      "#030305",
      "#9050f0",
      ["Sombra Cega", "Espectro de Ébano", "Morcego Sombrio"],
      "Sombra do Caos",
    ),
  },
  {
    id: 58,
    name: "Ninho de Vespas",
    color: "#b89020",
    accent: "#68500c",
    danger: 15,
    monsters: ["Vespa Gigante", "Zangão Guerreiro", "Larva Ácida"],
    boss: "Rainha Vespa",
    caveTheme: ct(
      "Colmeia Profunda",
      "#2a2208",
      "#120f03",
      "#ffd000",
      ["Vespa Operária", "Broto Venenoso", "Slime Meloso"],
      "Vespa Imperatriz",
    ),
  },
  {
    id: 59,
    name: "Labirinto Mecânico",
    color: "#546470",
    accent: "#2a343a",
    danger: 23,
    monsters: ["Sentinela de Ferro", "Drone de Defesa", "Operário a Vapor"],
    boss: "Coração de Ferro",
    caveTheme: ct(
      "Nexo das Engrenagens",
      "#181c20",
      "#080c10",
      "#80c0ff",
      ["Engrenagem Veloz", "Torreta Laser", "Servo Mecânico"],
      "Núcleo Computacional",
    ),
  },
  {
    id: 60,
    name: "Dimensão Cósmica",
    color: "#201040",
    accent: "#0c041c",
    danger: 30,
    monsters: ["Vigia Cósmico", "Sombra Estelar", "Fragmento de Nebulosa"],
    boss: "Deus Estelar",
    caveTheme: ct(
      "Nexo Cósmico",
      "#120a24",
      "#05020d",
      "#ff80ff",
      ["Espectro Estelar", "Vigia do Caos", "Buraco Negro Menor"],
      "Singularidade Viva",
    ),
  },
  // ---- ENDGAME biomes 61..70 (danger 200+, 10 sub-floors each, unique generators) ----
  {
    id: 61,
    name: "Foraminas do Sol Negro",
    color: "#1a0a2a",
    accent: "#4a1080",
    danger: 205,
    monsters: ["Sacerdote do Eclipse", "Devorador de Sol", "Sombra Estelar"],
    boss: "Coração do Sol Negro",
    caveTheme: ct(
      "Câmara Eclipsada",
      "#0a0418",
      "#02010c",
      "#ffa040",
      ["Chama Negra", "Servo do Eclipse", "Oráculo Cego"],
      "Titã do Vazio Solar",
    ),
  },
  {
    id: 62,
    name: "Mar de Titânio Fundido",
    color: "#c0d8e8",
    accent: "#3050a0",
    danger: 210,
    monsters: ["Serpente de Titânio", "Guardião Fundido", "Colosso Líquido"],
    boss: "Leviatã de Titânio",
    caveTheme: ct(
      "Forja Abissal",
      "#101828",
      "#040814",
      "#a0d8ff",
      ["Enguia Metálica", "Espírito Fundido", "Golem Reforjado"],
      "Rei do Metal Vivo",
    ),
  },
  {
    id: 63,
    name: "Jardim das Estrelas Mortas",
    color: "#2a1848",
    accent: "#8040c0",
    danger: 215,
    monsters: ["Ninfa Nebular", "Flor Devoradora", "Semente Cósmica"],
    boss: "Rainha das Estrelas Mortas",
    caveTheme: ct(
      "Berçário Estelar",
      "#100820",
      "#040214",
      "#c090ff",
      ["Broto Astral", "Espinho Cósmico", "Pétala Faminta"],
      "Coração Nebular",
    ),
  },
  {
    id: 64,
    name: "Cripta dos Deuses",
    color: "#c8a848",
    accent: "#604818",
    danger: 220,
    monsters: ["Sacerdote Ancestral", "Deus Menor Caído", "Estátua Ígnea"],
    boss: "Trindade Esquecida",
    caveTheme: ct(
      "Ossuário Divino",
      "#20180a",
      "#0c0806",
      "#ffe080",
      ["Servo Divino", "Coro Cadavérico", "Estatua Ancestral"],
      "Deus Adormecido",
    ),
  },
  {
    id: 65,
    name: "Fenda do Tempo Reverso",
    color: "#40c0c0",
    accent: "#106060",
    danger: 225,
    monsters: ["Eco do Amanhã", "Fragmento Temporal", "Vigia do Tempo"],
    boss: "Ampulheta Viva",
    caveTheme: ct(
      "Câmara do Paradoxo",
      "#082020",
      "#041010",
      "#80ffff",
      ["Reflexo Futuro", "Passado Sombrio", "Loop Vivo"],
      "Cronomante Ancestral",
    ),
  },
  {
    id: 66,
    name: "Colisão de Realidades",
    color: "#f040a0",
    accent: "#802040",
    danger: 230,
    monsters: ["Fusão Impossível", "Membro Errante", "Cara sem Rosto"],
    boss: "Deus das Fusões",
    caveTheme: ct(
      "Nexo Fraturado",
      "#180818",
      "#080408",
      "#ff80c0",
      ["Fragmento Vivo", "Membro Andante", "Fenda Faminta"],
      "Coração Colapsado",
    ),
  },
  {
    id: 67,
    name: "Reator do Vazio",
    color: "#20e0c0",
    accent: "#106080",
    danger: 235,
    monsters: ["Núcleo Andante", "Emissão Corrompida", "Servo Voltaico"],
    boss: "Núcleo Ancestral",
    caveTheme: ct(
      "Câmara de Contenção",
      "#082028",
      "#041014",
      "#60ffe0",
      ["Cabo Vivo", "Fissão Menor", "Servo Metálico"],
      "Estabilizador Vivo",
    ),
  },
  {
    id: 68,
    name: "Vazio Entre Mundos",
    color: "#08000a",
    accent: "#3010a0",
    danger: 240,
    monsters: ["Ausência Andante", "Silêncio Vivo", "Peregrino Vazio"],
    boss: "O Que Não Existe",
    caveTheme: ct(
      "Ausência Absoluta",
      "#020006",
      "#000004",
      "#8040ff",
      ["Vazio Andante", "Ecos do Nada", "Silêncio Faminto"],
      "Anti-Deus",
    ),
  },
  {
    id: 69,
    name: "Sonho Perpétuo",
    color: "#ffa0c0",
    accent: "#804060",
    danger: 250,
    monsters: ["Pesadelo Ambulante", "Sonho Faminto", "Devorador de Sonhos"],
    boss: "Rainha dos Pesadelos",
    caveTheme: ct(
      "Câmara do Sonho",
      "#180814",
      "#0a040a",
      "#ffc0e0",
      ["Sonho Menor", "Pesadelo Aprendiz", "Ilusão Faminta"],
      "Dono do Sonho",
    ),
  },
  {
    id: 70,
    name: "Ápice do Cosmos",
    color: "#fff0c0",
    accent: "#a08040",
    danger: 260,
    monsters: ["Arauto Cósmico", "Serafim Estelar", "Sentinela do Ápice"],
    boss: "O Absoluto",
    caveTheme: ct(
      "Trono do Absoluto",
      "#20180a",
      "#0c0806",
      "#ffe090",
      ["Coro Absoluto", "Herald Absoluto", "Servo do Ápice"],
      "O Primeiro",
    ),
  },
  // ---- Biomas Ocidentais 71..80 (5 andares cada, temas únicos, entrada a oeste da cidade principal) ----
  {
    id: 71,
    name: "Ruínas Esquecidas",
    color: "#8a8676",
    accent: "#4a4638",
    danger: 6,
    monsters: ["Estátua Viva", "Cavaleiro Caído", "Espectro Ancestral"],
    boss: "Guardião Ancião",
    caveTheme: ct(
      "Ruínas Soterradas",
      "#2a2620",
      "#100c08",
      "#c8b088",
      ["Estátua Menor", "Fragmento Andante", "Aparição"],
      "Coração Ancião",
    ),
  },
  {
    id: 72,
    name: "Catacumbas de Cristal",
    color: "#a890d8",
    accent: "#4a3880",
    danger: 12,
    monsters: ["Cristal Andante", "Espírito Luz", "Guardião de Cristal"],
    boss: "Coração de Cristal",
    caveTheme: ct(
      "Geoda Perdida",
      "#20182a",
      "#0a0810",
      "#c0a0ff",
      ["Estilhaço Vivo", "Larva de Ametista", "Prisma Sombrio"],
      "Rainha de Cristal",
    ),
  },
  {
    id: 73,
    name: "Pântano Envenenado",
    color: "#5a7040",
    accent: "#2a3818",
    danger: 10,
    monsters: ["Zumbi Afogado", "Serpente Venenosa", "Bruxa Menor"],
    boss: "Hidra do Pântano",
    caveTheme: ct(
      "Fossa Tóxica",
      "#1a2010",
      "#080c08",
      "#80c040",
      ["Verme Podre", "Slime Tóxico", "Água-Viva Menor"],
      "Rainha Fúngica",
    ),
  },
  {
    id: 74,
    name: "Cidade Submersa",
    color: "#4a80a0",
    accent: "#1a3a58",
    danger: 14,
    monsters: ["Marujo Afogado", "Sereia Sombria", "Homem-Peixe"],
    boss: "Almirante Fantasma",
    caveTheme: ct(
      "Ruínas Submersas",
      "#0a1a24",
      "#040a10",
      "#60a0d0",
      ["Polvo Menor", "Casco Amaldiçoado", "Cavalo-Marinho Podre"],
      "Leviatã Menor",
    ),
  },
  {
    id: 75,
    name: "Deserto de Vidro Negro",
    color: "#302838",
    accent: "#100818",
    danger: 20,
    monsters: ["Escorpião de Vidro", "Nômade Refletido", "Espelho Vivo"],
    boss: "Espelho Fundido",
    caveTheme: ct(
      "Sala dos Cacos",
      "#141018",
      "#080410",
      "#c0b0d8",
      ["Reflexo Menor", "Estilhaço Andante", "Vidro Faminto"],
      "Prisma do Nada",
    ),
  },
  {
    id: 76,
    name: "Bosque dos Enforcados",
    color: "#3a2a2a",
    accent: "#181010",
    danger: 15,
    monsters: ["Assombração", "Cervo Espectral", "Wisp Sombrio"],
    boss: "Senhora dos Espectros",
    caveTheme: ct(
      "Câmara dos Sussurros",
      "#181414",
      "#080606",
      "#a08080",
      ["Wisp Menor", "Aparição", "Servo Espectral"],
      "Espectro Ancestral",
    ),
  },
  {
    id: 77,
    name: "Montanha Escaldante",
    color: "#c07040",
    accent: "#601810",
    danger: 18,
    monsters: ["Salamandra", "Peregrino Ígneo", "Cão Ígneo"],
    boss: "Senhor do Magma",
    caveTheme: ct(
      "Câmaras de Magma",
      "#20100a",
      "#100604",
      "#ff8040",
      ["Diabrete", "Salamandra Menor", "Chama Cativa"],
      "Coração de Magma",
    ),
  },
  {
    id: 78,
    name: "Biblioteca Perdida",
    color: "#7a5a3a",
    accent: "#3a2818",
    danger: 16,
    monsters: ["Alquimista Amaldiçoado", "Bruxo Ancião", "Aprendiz Lich"],
    boss: "Lich Ancião",
    caveTheme: ct(
      "Arquivo Selado",
      "#20180c",
      "#0c0806",
      "#e0c090",
      ["Aprendiz Lich", "Servo Necro", "Eco Sombrio"],
      "Coração Sombrio",
    ),
  },
  {
    id: 79,
    name: "Cripta de Marfim",
    color: "#e0d8c0",
    accent: "#8a7a58",
    danger: 17,
    monsters: ["Esqueleto Guerreiro", "Cavaleiro Esqueleto", "Cão de Ossos"],
    boss: "Ceifador de Gigantes",
    caveTheme: ct(
      "Ossuário Sagrado",
      "#28241a",
      "#12100a",
      "#f0e0b0",
      ["Esqueleto Menor", "Verme de Ossos", "Anão Zumbi"],
      "Rei Esqueleto Titã",
    ),
  },
  {
    id: 80,
    name: "Fenda Astral",
    color: "#4a2a80",
    accent: "#20104a",
    danger: 24,
    monsters: ["Vigia Astral", "Estrela Caída", "Fragmento Cósmico"],
    boss: "Sentinela Cósmico",
    caveTheme: ct(
      "Nexo Estelar",
      "#180830",
      "#080418",
      "#a080ff",
      ["Fragmento Menor", "Eco Astral", "Vigia Menor"],
      "Sentinela Menor",
    ),
  },
  {
    id: 150,
    name: "Labirinto do Abismo",
    color: "#25103a",
    accent: "#0c0214",
    danger: 120,
    monsters: ["Sombra do Abismo", "Gólem de Gravidade", "Eco do Vazio"],
    boss: "Singularidade Cósmica",
    caveTheme: ct(
      "Labirinto da Gravidade Reversa",
      "#140424",
      "#020008",
      "#8020e0",
      ["Estilhaço de Gravidade", "Sombra Flutuante", "Vigia do Abismo"],
      "Coração do Abismo",
    ),
  },
  {
    id: 200,
    name: "Nexo da Singularidade Temporal",
    color: "#ff8000",
    accent: "#3a0066",
    danger: 150,
    monsters: ["Sentinela do Tempo", "Eco do Vazio Temporal", "Fera Estelar"],
    boss: "Chronos, o Devorador de Éons",
    caveTheme: ct(
      "Cúpula das Estrelas Eternas",
      "#080418",
      "#02000c",
      "#ffaa00",
      ["Anomalia Temporal", "Espectro de Éon", "Vigia Estelar"],
      "Vórtice da Singularidade",
    ),
  },
  // ---- MUNDO ALTERNATIVO (Portal de Éter) — biomas 81..90, danger 100+, 10 subandares cada.
  // Acesso via portal na cidade central. Inimigos level 100+ com prefixo "Alt-".
  {
    id: 81,
    name: "Alt: Céu Invertido",
    color: "#f0c8ff",
    accent: "#8040c0",
    danger: 105,
    monsters: ["Alt-Anjo Reverso", "Alt-Nuvem Faminta", "Alt-Coro Espectral"],
    boss: "Alt-Deus Caído",
    caveTheme: ct(
      "Nuvens de Éter",
      "#180830",
      "#080418",
      "#ffb0ff",
      ["Alt-Serafim Menor", "Alt-Vento Vivo", "Alt-Ave de Sombra"],
      "Alt-Trono Invertido",
    ),
  },
  {
    id: 82,
    name: "Alt: Oceano de Éter",
    color: "#40e0e0",
    accent: "#0a4a4a",
    danger: 110,
    monsters: ["Alt-Leviatã Menor", "Alt-Kraken de Éter", "Alt-Sereia Vazia"],
    boss: "Alt-Rei do Oceano",
    caveTheme: ct(
      "Trincheira Etérica",
      "#082028",
      "#04101a",
      "#80ffff",
      ["Alt-Enguia Etérea", "Alt-Polvo Vazio", "Alt-Coral Faminto"],
      "Alt-Leviatã Titã",
    ),
  },
  {
    id: 83,
    name: "Alt: Deserto Cristalino",
    color: "#ffd0f0",
    accent: "#a0308a",
    danger: 115,
    monsters: ["Alt-Escaravelho Prisma", "Alt-Miragem Viva", "Alt-Nômade Fraturado"],
    boss: "Alt-Faraó de Vidro",
    caveTheme: ct(
      "Câmaras de Prisma",
      "#280820",
      "#100418",
      "#ffa0ff",
      ["Alt-Estilhaço Andante", "Alt-Reflexo Sombrio", "Alt-Vidro Faminto"],
      "Alt-Coração Prismático",
    ),
  },
  {
    id: 84,
    name: "Alt: Selva Sangrenta",
    color: "#c04060",
    accent: "#601020",
    danger: 120,
    monsters: ["Alt-Pantera Rubra", "Alt-Cipó Vampírico", "Alt-Xamã de Sangue"],
    boss: "Alt-Coração da Selva",
    caveTheme: ct(
      "Raízes Vermelhas",
      "#200808",
      "#100404",
      "#ff4060",
      ["Alt-Broto Sanguíneo", "Alt-Flor Faminta", "Alt-Cobra Vermelha"],
      "Alt-Serpente Ancestral",
    ),
  },
  {
    id: 85,
    name: "Alt: Montanhas de Ébano",
    color: "#2a1a3a",
    accent: "#0a0418",
    danger: 130,
    monsters: ["Alt-Golem Negro", "Alt-Corvo Titânico", "Alt-Cavaleiro Ébano"],
    boss: "Alt-Rei da Ébano",
    caveTheme: ct(
      "Minas de Obsidiana",
      "#100810",
      "#040208",
      "#8040c0",
      ["Alt-Aranha Obsidiana", "Alt-Anão Corrompido", "Alt-Servo Ébano"],
      "Alt-Titã de Ébano",
    ),
  },
  {
    id: 86,
    name: "Alt: Ninho de Wyrms",
    color: "#e08040",
    accent: "#8a3010",
    danger: 140,
    monsters: ["Alt-Wyvern Sangrento", "Alt-Filhote de Fogo", "Alt-Serpente Ígnea"],
    boss: "Alt-Dragão Ancião",
    caveTheme: ct(
      "Câmara Chocada",
      "#28100a",
      "#100604",
      "#ff9040",
      ["Alt-Wyrm Menor", "Alt-Ovo Vivo", "Alt-Chama Presa"],
      "Alt-Mãe Dragão",
    ),
  },
  {
    id: 87,
    name: "Alt: Necrópole Reversa",
    color: "#80c0a0",
    accent: "#204840",
    danger: 150,
    monsters: ["Alt-Ossada Verde", "Alt-Lich Reverso", "Alt-Anjo Necrótico"],
    boss: "Alt-Deus da Morte",
    caveTheme: ct(
      "Cripta Invertida",
      "#0a1a14",
      "#040c0a",
      "#80ffc0",
      ["Alt-Esqueleto Verde", "Alt-Espectro Necrose", "Alt-Ghoul Cristal"],
      "Alt-Rei-Lich Reverso",
    ),
  },
  {
    id: 88,
    name: "Alt: Fábrica Onírica",
    color: "#60a0ff",
    accent: "#204080",
    danger: 160,
    monsters: ["Alt-Sonhador Metálico", "Alt-Autômato de Sonho", "Alt-Servo Onírico"],
    boss: "Alt-Motor do Sonho",
    caveTheme: ct(
      "Linhas de Montagem",
      "#08182a",
      "#040814",
      "#a0c0ff",
      ["Alt-Engrenagem Onírica", "Alt-Braço Livre", "Alt-Torreta Cega"],
      "Alt-Coração da Fábrica",
    ),
  },
  {
    id: 89,
    name: "Alt: Vazio Rosado",
    color: "#ff80c0",
    accent: "#801040",
    danger: 180,
    monsters: ["Alt-Coração Vazio", "Alt-Amor Faminto", "Alt-Beijo Envenenado"],
    boss: "Alt-Rainha do Vazio",
    caveTheme: ct(
      "Câmara Rosada",
      "#200818",
      "#100408",
      "#ffb0d0",
      ["Alt-Pétala Faminta", "Alt-Sombra Rosada", "Alt-Espinho Doce"],
      "Alt-Amante Ancestral",
    ),
  },
  {
    id: 90,
    name: "Alt: Trono do Anti-Criador",
    color: "#ffe0a0",
    accent: "#a06010",
    danger: 220,
    monsters: ["Alt-Arauto Reverso", "Alt-Serafim Negativo", "Alt-Coro do Anti-Criador"],
    boss: "O Anti-Criador",
    caveTheme: ct(
      "Sanctum Invertido",
      "#20180a",
      "#0c0806",
      "#fff090",
      ["Alt-Herald Menor", "Alt-Servo Reverso", "Alt-Coro Invertido"],
      "Alt-Prece Viva",
    ),
  },
];

// Append Island 2 and Island 3 biomes statically
for (const b of ISLAND2_BIOMES) {
  if (!BIOMES.some((x) => x.id === b.id)) {
    BIOMES.push(b);
  }
}
for (const b of ISLAND3_BIOMES) {
  if (!BIOMES.some((x) => x.id === b.id)) {
    BIOMES.push(b);
  }
}
for (const b of ISLAND4_BIOMES) {
  if (!BIOMES.some((x) => x.id === b.id)) {
    BIOMES.push(b);
  }
}
for (const b of NEW_ISLANDS_BIOMES) {
  if (!BIOMES.some((x) => x.id === b.id)) {
    BIOMES.push(b);
  }
}

export type Rarity = "comum" | "incomum" | "raro" | "épico" | "lendário";
export const RARITY_COLOR: Record<Rarity, string> = {
  comum: "#c8c8c8",
  incomum: "#5ecf5e",
  raro: "#5ea8ff",
  épico: "#c25ef0",
  lendário: "#f0b040",
};
const RARITY_MULT: Record<Rarity, number> = {
  comum: 1,
  incomum: 1.4,
  raro: 1.9,
  épico: 2.6,
  lendário: 3.6,
};

export type Item = {
  id: string;
  name: string;
  kind: "weapon" | "armor" | "potion" | "material";
  rarity: Rarity;
  power: number;
  icon: string;
  color: string;
  // Optional metadata (see ExtItem below for the full crafting/pickaxe/enchant/gem set).
  quality?: "comum" | "bom" | "excelente" | "perfeito" | "obra-prima" | "lendario" | "divino";
  enchant?:
    | "fogo"
    | "gelo"
    | "veneno"
    | "luz"
    | "sombra"
    | "raio"
    | "sangramento"
    | "vampirismo"
    | "critico"
    | "velocidade"
    | "mana"
    | "hp";
  gems?: string[];
  slots?: number;
  evolution?: number;
  isPickaxe?: boolean;
  pickaxeTier?: number;
};

let itemSeq = 0;
export function makeItem(kind: Item["kind"], tier: number, rarity: Rarity): Item {
  itemSeq++;
  const baseNames = {
    weapon: ["Espada", "Machado", "Lança", "Adaga", "Cajado", "Arco", "Martelo", "Foice"],
    armor: ["Elmo", "Peitoral", "Grevas", "Manto", "Escudo", "Botas", "Braçadeiras"],
    potion: ["Poção Menor", "Poção", "Poção Maior", "Elixir", "Néctar"],
    material: ["Minério", "Erva", "Couro", "Osso", "Cristal", "Essência", "Escama"],
  };
  const suffix = [
    "de Ferro",
    "do Vento",
    "das Sombras",
    "da Aurora",
    "do Trovão",
    "do Vazio",
    "Rúnico",
    "Ancestral",
    "do Dragão",
    "Estelar",
  ];
  const n = baseNames[kind][Math.floor(Math.random() * baseNames[kind].length)];
  const s =
    kind === "material"
      ? ""
      : " " + suffix[Math.min(suffix.length - 1, tier - 1 + Math.floor(Math.random() * 3))];
  const power = Math.round((5 + tier * 4) * RARITY_MULT[rarity] * (kind === "potion" ? 3 : 1));
  const glyph = kind === "weapon" ? "⚔" : kind === "armor" ? "🛡" : kind === "potion" ? "🧪" : "◈";
  return {
    id: `it_${itemSeq}`,
    name: `${n}${s}`,
    kind,
    rarity,
    power,
    icon: glyph,
    color: RARITY_COLOR[rarity],
  };
}

// Drop rarity: quanto maior a raridade, MUITO menor a chance.
// Curva bem mais dura — chances de topo ficam extremamente baixas.
// Lendário ~0.02%, Épico ~0.3%, Raro ~2%, Incomum ~10%, Comum ~87%.
export function rollRarity(luck = 0): Rarity {
  // luck reduz o valor sorteado (empurra para raridades melhores), com peso reduzido.
  const r = Math.random() * 10000 - luck * 3;
  if (r > 9998) return "lendário"; // 0.02%
  if (r > 9970) return "épico"; // ~0.28%
  if (r > 9800) return "raro"; // ~1.7%
  if (r > 8800) return "incomum"; // ~10%
  return "comum";
}

// Gate secundário de raridade: cada raridade tem uma chance individual de
// realmente cair no chão. Isso amplifica o efeito "quanto mais raro, menor
// a chance de drop" acima do sorteio de raridade.
const RARITY_DROP_GATE: Record<Rarity, number> = {
  comum: 1,
  incomum: 0.5,
  raro: 0.2,
  épico: 0.06,
  lendário: 0.015,
};
export function shouldDropRarity(rarity: Rarity): boolean {
  return Math.random() < RARITY_DROP_GATE[rarity];
}

// -------- World generation --------
export const TILE = 32;
export const CHUNK = 32;
export const WORLD_CHUNKS = 120; // 120x32 = 3840 tiles per side, making each biome exactly 20x larger in area (120/27)^2 ≈ 20x

// Tile kinds:
// 0 grass, 1 water, 2 mountain/wall, 3 sand, 4 tree, 5 city, 6 stair-down, 7 stair-up
// Extended (dungeon + central city):
// 8 torch, 9 cracked stone wall (blocking), 10 iron gate (walkable),
// 11 steel pillar (blocking), 12 chest, 13 building floor,
// 14 building wall (blocking), 15 fountain (blocking),
// 16 grand-dungeon stair down (special — from central city into the 100-floor dungeon)
// 17 alt-world portal (walkable — teleporta para biomas 81..90)
// 18 blacksmith NPC (blocking — interação com E abre painel Ferreiro)
export type TileKind = number;

export type WorldTile = { kind: TileKind; biome: number };
export type City = { name: string; x: number; y: number; biome: number };
export type Stair = { x: number; y: number; biome: number; kind: "down" | "up" };

function hash2(x: number, y: number, seed: number) {
  let h = x * 374761393 + y * 668265263 + seed * 2147483647;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}
function smoothNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function fbm(x: number, y: number, seed: number, oct = 4) {
  let s = 0,
    amp = 1,
    freq = 1,
    norm = 0;
  for (let i = 0; i < oct; i++) {
    s += smoothNoise(x * freq, y * freq, seed + i * 101) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return s / norm;
}

const CITY_NAMES = [
  "Aurora",
  "Elvengarde",
  "Solmara",
  "Ferrondh",
  "Murkholme",
  "Nivalis",
  "Skyreach",
  "Verdanor",
  "Sanguemera",
  "Emberforge",
  "Portstorm",
  "Marésia",
  "Cristallum",
  "Aetheris",
  "Ventaria",
  "Trigal",
  "Imperia",
  "Undralar",
  "Cinderfall",
  "Lumenglade",
  "Fulminis",
  "Vanheim",
  "Cânios",
  "Kaelstone",
  "Verdanthal",
  "Perdisia",
  "Voidhaven",
  "Umbralis",
  "Astraeon",
  "Zenithar",
  "Saltmere",
  "Radgrad",
  "Ossuária",
  "Aeronis",
  "Mercúria",
  "Fungara",
  "Prismath",
  "Voracis",
  "Espectra",
  "Corvath",
  "Oasília",
  "Pichemar",
  "Titanópolis",
  "Bronzevile",
  "Sanguínia",
  "Tempestólio",
  "Valebene",
  "Zumbivila",
  "Engrené",
  "Cosmópolis",
  "Miragem",
  "Ninho-Vespa",
  "Mecanóvia",
  "Estelar",
  "Éden",
  "Nébula",
  "Vulcano",
  "Gelópolis",
  "Alvorada",
  "Fúngica",
];

// Common interface for any playable map
export interface PlayMap {
  size: number;
  seed: number;
  isBlocked(x: number, y: number): boolean;
  get(x: number, y: number): WorldTile;
  readonly stairs: Stair[];
  readonly isCave: boolean;
  readonly biomeId: number; // for caves; 0 for overworld
  readonly spawn: { x: number; y: number };
}

export class World implements PlayMap {
  size: number;
  seed: number;
  tiles: WorldTile[];
  biomeSeeds: { x: number; y: number; biome: number }[] = [];
  cities: City[] = [];
  stairs: Stair[] = [];
  spawn: { x: number; y: number } = { x: 0, y: 0 };
  readonly isCave = false;
  readonly biomeId = 0;
  // Ilha do mundo (1 = ilha original, 2 = ilha nova com biomas nv 100+).
  island: 1 | 2 = 1;
  // Conjunto de biomas usado por generate(). Se null, usa BIOMES padrão.
  biomeSet: Biome[] | null = null;
  constructor(seed = 1337, opts?: { biomeSet?: Biome[]; island?: 1 | 2 }) {
    this.seed = seed;
    this.size = WORLD_CHUNKS * CHUNK;
    this.tiles = new Array(this.size * this.size);
    if (opts?.biomeSet) this.biomeSet = opts.biomeSet;
    if (opts?.island) this.island = opts.island;
    this.generate();
  }
  idx(x: number, y: number) {
    return y * this.size + x;
  }
  inBounds(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }
  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 1, biome: 0 };
    return this.tiles[this.idx(x, y)];
  }
  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 1 || t === 2 || t === 4 || t === 9 || t === 11 || t === 14 || t === 15 || t === 18;
  }
  grandStair: { x: number; y: number } | null = null;
  altPortal: { x: number; y: number } | null = null;
  abPortal: { x: number; y: number } | null = null;
  cosmicPortal: { x: number; y: number } | null = null;
  blacksmith: { x: number; y: number } | null = null;
  centralCity: { x: number; y: number; radius: number } | null = null;
  private landMask(x: number, y: number) {
    const s = this.size;
    const scaleFactor = s / 864;
    const distort = fbm(x / (60 * scaleFactor), y / (60 * scaleFactor), this.seed + 999, 4) * 0.55;

    // Island 1 (Central): Center (s*0.48, s*0.42), radius s/5.2
    const dx1 = (x - s * 0.48) / (s / 5.2);
    const dy1 = (y - s * 0.42) / (s / 5.2);
    const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const m1 = Math.max(0, Math.min(1, 1 - dist1 + distort - 0.22));

    // Island 2 (Titan - South): Center (s*0.48, s*0.85), radius s/6.0
    const dx2 = (x - s * 0.48) / (s / 6.0);
    const dy2 = (y - s * 0.85) / (s / 6.0);
    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const m2 = Math.max(0, Math.min(1, 1 - dist2 + distort - 0.26));

    // Island 3 (Abyss - West): Center (s*0.14, s*0.42), radius s/5.8
    const dx3 = (x - s * 0.14) / (s / 5.8);
    const dy3 = (y - s * 0.42) / (s / 5.8);
    const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
    const m3 = Math.max(0, Math.min(1, 1 - dist3 + distort - 0.26));

    // Island 4 (Celestial/Chaos - East): Center (s*0.84, s*0.42), radius s/5.8
    const dx4 = (x - s * 0.84) / (s / 5.8);
    const dy4 = (y - s * 0.42) / (s / 5.8);
    const dist4 = Math.sqrt(dx4 * dx4 + dy4 * dy4);
    const m4 = Math.max(0, Math.min(1, 1 - dist4 + distort - 0.26));

    // Island 5 (Crescent Island - North): Crescent shape
    const dx5 = (x - s * 0.48) / (s / 9.0);
    const dy5 = (y - s * 0.15) / (s / 9.0);
    const dist5_outer = Math.sqrt(dx5 * dx5 + dy5 * dy5);
    const dx5_in = (x - s * 0.51) / (s / 11.0);
    const dy5_in = (y - s * 0.16) / (s / 11.0);
    const dist5_inner = Math.sqrt(dx5_in * dx5_in + dy5_in * dy5_in);
    const m5 = dist5_outer <= 1.0 ? Math.max(0, Math.min(1, 1 - dist5_outer + distort - 0.2)) * (dist5_inner > 0.85 ? 1 : 0) : 0;

    // Island 6 (Donut / Ring Island - Northwest): Donut shape
    const dx6 = (x - s * 0.18) / (s / 9.5);
    const dy6 = (y - s * 0.18) / (s / 9.5);
    const dist6 = Math.sqrt(dx6 * dx6 + dy6 * dy6);
    const m6 = Math.max(0, Math.min(1, 1 - Math.abs(dist6 - 0.7) * 3.3 + distort - 0.22));

    // Island 7 (Star Island - Northeast): 5-pointed Star shape
    const dx7 = x - s * 0.80;
    const dy7 = y - s * 0.18;
    const theta7 = Math.atan2(dy7, dx7);
    const starRadius7 = (s / 9.5) * (1.0 + 0.38 * Math.sin(5 * theta7));
    const dist7 = Math.sqrt(dx7 * dx7 + dy7 * dy7) / starRadius7;
    const m7 = Math.max(0, Math.min(1, 1 - dist7 + distort - 0.25));

    // Island 8 (Thin Serpent Island - Southwest): Thin serpent shape
    const dx8 = x - s * 0.18;
    const dy8 = y - s * 0.82;
    const serpent_y = s * 0.82 + (s / 10.0) * 0.3 * Math.sin(dx8 / (s / 15.0));
    const dist_to_curve8 = Math.abs(y - serpent_y);
    const dist8 = Math.sqrt(dx8 * dx8 + dy8 * dy8) / (s / 8.5);
    const m8 = dist8 <= 1.0 ? Math.max(0, Math.min(1, 1 - dist_to_curve8 / (s / 40.0) + distort - 0.2)) * (1.0 - dist8) : 0;

    // Island 9 (Astral Abyss - Southeast): Cross/X shape
    const dx9 = Math.abs(x - s * 0.80);
    const dy9 = Math.abs(y - s * 0.82);
    const dist_to_axis9 = Math.min(Math.abs(dx9 - dy9), dx9, dy9);
    const dist9 = Math.sqrt(dx9 * dx9 + dy9 * dy9) / (s / 8.5);
    const m9 = dist9 <= 1.0 ? Math.max(0, Math.min(1, 1 - dist_to_axis9 / (s / 45.0) + distort - 0.2)) * (1.0 - dist9) : 0;

    // Island 10 (Siren Archipelago - North-Northeast): Cluster of islands
    const cx10 = s * 0.65, cy10 = s * 0.22, r10 = s / 9.0;
    const centers10 = [
      { x: cx10 - r10 * 0.4, y: cy10 - r10 * 0.4 },
      { x: cx10 + r10 * 0.4, y: cy10 - r10 * 0.4 },
      { x: cx10 - r10 * 0.4, y: cy10 + r10 * 0.4 },
      { x: cx10 + r10 * 0.4, y: cy10 + r10 * 0.4 },
      { x: cx10, y: cy10 }
    ];
    let m10 = 0;
    for (const c of centers10) {
      const d = Math.sqrt((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y)) / (r10 * 0.35);
      const mVal = Math.max(0, Math.min(1, 1 - d + distort - 0.2));
      if (mVal > m10) m10 = mVal;
    }

    // Island 11 (Heart Island - South-Southwest): Heart shape
    const dx11 = (x - s * 0.32) / (s / 9.0);
    const dy11 = (y - s * 0.75) / (s / 9.0);
    const theta11 = Math.atan2(dy11, dx11);
    const heartRadius11 = 1.0 * (1.0 - Math.sin(theta11)) * 0.65;
    const dist11 = Math.sqrt(dx11 * dx11 + dy11 * dy11) / heartRadius11;
    const m11 = Math.max(0, Math.min(1, 1 - dist11 + distort - 0.25));

    // Island 12 (Spiral / Shell Island - North-Northwest): Spiral shell shape
    const dx12 = x - s * 0.32;
    const dy12 = y - s * 0.18;
    const dist12_center = Math.sqrt(dx12 * dx12 + dy12 * dy12);
    const theta12 = Math.atan2(dy12, dx12) + Math.PI;
    const spiralRadius12 = (s / 9.0) * (0.25 + 0.75 * (theta12 / (2 * Math.PI)));
    const m12 = dist12_center <= s / 9.0 ? Math.max(0, Math.min(1, 1 - Math.abs(dist12_center - spiralRadius12) / (s / 30.0) + distort - 0.22)) * (1.0 - dist12_center / (s / 9.0)) : 0;

    // Island 13 (Double-Ring / Infinity Island - East-Southeast): Overlapping double-ring
    const cx13_1 = s * 0.82 - (s / 9.0) * 0.45;
    const cx13_2 = s * 0.82 + (s / 9.0) * 0.45;
    const cy13 = s * 0.64;
    const d13_1 = Math.sqrt((x - cx13_1) * (x - cx13_1) + (y - cy13) * (y - cy13)) / ((s / 9.0) * 0.55);
    const d13_2 = Math.sqrt((x - cx13_2) * (x - cx13_2) + (y - cy13) * (y - cy13)) / ((s / 9.0) * 0.55);
    const m13 = Math.max(
      Math.max(0, Math.min(1, 1 - d13_1 + distort - 0.22)),
      Math.max(0, Math.min(1, 1 - d13_2 + distort - 0.22))
    );

    // Island 14 (Void Maw / Triangle Fortress - West-Northwest): Triangle fortress
    const dx14 = x - s * 0.12;
    const dy14 = y - s * 0.64;
    const dist14_center = Math.sqrt(dx14 * dx14 + dy14 * dy14);
    const is_inside14 = dy14 <= (s / 9.0) * 0.5 && dy14 >= -(s / 9.0) * 0.7 && Math.abs(dx14) <= ((s / 9.0) * 0.6 - dy14 * 0.5);
    const m14 = is_inside14 ? Math.max(0, Math.min(1, 1 - dist14_center / (s / 9.0) + distort - 0.22)) : 0;

    let maxM = Math.max(m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14);
    for (let isld = 15; isld <= 34; isld++) {
      const angle = ((isld - 15) / 20) * Math.PI * 2;
      const distCircle = s * 0.40;
      const cx = s * 0.5 + Math.cos(angle) * distCircle;
      const cy = s * 0.5 + Math.sin(angle) * distCircle;
      const radius = s * 0.045;
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mVal = Math.max(0, Math.min(1, 1 - dist + distort - 0.22));
      if (mVal > maxM) maxM = mVal;
    }
    for (let isld = 35; isld <= 54; isld++) {
      const angle = ((isld - 35) / 20) * Math.PI * 2 + Math.PI / 20;
      const distCircle = s * 0.465;
      const cx = s * 0.5 + Math.cos(angle) * distCircle;
      const cy = s * 0.5 + Math.sin(angle) * distCircle;
      const radius = s * 0.038;
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mVal = Math.max(0, Math.min(1, 1 - dist + distort - 0.22));
      if (mVal > maxM) maxM = mVal;
    }
    return maxM;
  }
  generate() {
    const s = this.size;

    // Gather all biomes by id
    const island1Biomes = BIOMES.map((b) => b.id).filter((id) => id <= 80);
    const island2Biomes = BIOMES.map((b) => b.id).filter((id) => id >= 201 && id <= 250);
    const island3Biomes = BIOMES.map((b) => b.id).filter((id) => id >= 301 && id <= 410);
    const island4Biomes = BIOMES.map((b) => b.id).filter((id) => id >= 501 && id <= 599);

    // Dynamic list for islands 5 to 54
    const newIslandsBiomesMap: Record<number, number[]> = {};
    for (let isld = 5; isld <= 54; isld++) {
      if (isld <= 14) {
        const start = 100 + isld * 100; // e.g. 600 for island 5, 700 for 6
        newIslandsBiomesMap[isld] = BIOMES.map((b) => b.id).filter((id) => id >= start + 1 && id <= start + 30);
      } else if (isld <= 34) {
        const start = 2000 + (isld - 15) * 100;
        newIslandsBiomesMap[isld] = BIOMES.map((b) => b.id).filter((id) => id >= start && id <= start + 9);
      } else {
        const start = 4000 + (isld - 35) * 100;
        newIslandsBiomesMap[isld] = BIOMES.map((b) => b.id).filter((id) => id >= start && id <= start + 39);
      }
    }

    // Place seeds for Island 1 (Central)
    const cx1 = s * 0.48,
      cy1 = s * 0.42,
      r1 = s * 0.15;
    for (let i = 0; i < island1Biomes.length; i++) {
      const theta = i * 2.39996; // Golden angle
      const rad = r1 * Math.sqrt((i + 0.5) / island1Biomes.length);
      const x = cx1 + Math.cos(theta) * rad;
      const y = cy1 + Math.sin(theta) * rad;
      this.biomeSeeds.push({ x, y, biome: island1Biomes[i] });
    }

    // Place seeds for Island 2 (South)
    const cx2 = s * 0.48,
      cy2 = s * 0.85,
      r2 = s * 0.11;
    for (let i = 0; i < island2Biomes.length; i++) {
      const theta = i * 2.39996;
      const rad = r2 * Math.sqrt((i + 0.5) / island2Biomes.length);
      const x = cx2 + Math.cos(theta) * rad;
      const y = cy2 + Math.sin(theta) * rad;
      this.biomeSeeds.push({ x, y, biome: island2Biomes[i] });
    }

    // Place seeds for Island 3 (West)
    const cx3 = s * 0.14,
      cy3 = s * 0.42,
      r3 = s * 0.12;
    for (let i = 0; i < island3Biomes.length; i++) {
      const theta = i * 2.39996;
      const rad = r3 * Math.sqrt((i + 0.5) / island3Biomes.length);
      const x = cx3 + Math.cos(theta) * rad;
      const y = cy3 + Math.sin(theta) * rad;
      this.biomeSeeds.push({ x, y, biome: island3Biomes[i] });
    }

    // Place seeds for Island 4 (East)
    const cx4 = s * 0.84,
      cy4 = s * 0.42,
      r4 = s * 0.12;
    for (let i = 0; i < island4Biomes.length; i++) {
      const theta = i * 2.39996;
      const rad = r4 * Math.sqrt((i + 0.5) / island4Biomes.length);
      const x = cx4 + Math.cos(theta) * rad;
      const y = cy4 + Math.sin(theta) * rad;
      this.biomeSeeds.push({ x, y, biome: island4Biomes[i] });
    }

    // Config for islands 5 to 54 seeding centers
    const isldsCenters: Record<number, { cx: number; cy: number; radius: number }> = {
      5: { cx: s * 0.48, cy: s * 0.15, radius: s * 0.08 },
      6: { cx: s * 0.18, cy: s * 0.18, radius: s * 0.06 },
      7: { cx: s * 0.80, cy: s * 0.18, radius: s * 0.06 },
      8: { cx: s * 0.18, cy: s * 0.82, radius: s * 0.07 },
      9: { cx: s * 0.80, cy: s * 0.82, radius: s * 0.07 },
      10: { cx: s * 0.65, cy: s * 0.22, radius: s * 0.06 },
      11: { cx: s * 0.32, cy: s * 0.75, radius: s * 0.06 },
      12: { cx: s * 0.32, cy: s * 0.18, radius: s * 0.06 },
      13: { cx: s * 0.82, cy: s * 0.64, radius: s * 0.06 },
      14: { cx: s * 0.12, cy: s * 0.64, radius: s * 0.06 },
    };
    for (let isld = 15; isld <= 34; isld++) {
      const angle = ((isld - 15) / 20) * Math.PI * 2;
      const distCircle = s * 0.40;
      isldsCenters[isld] = {
        cx: s * 0.5 + Math.cos(angle) * distCircle,
        cy: s * 0.5 + Math.sin(angle) * distCircle,
        radius: s * 0.045,
      };
    }
    for (let isld = 35; isld <= 54; isld++) {
      const angle = ((isld - 35) / 20) * Math.PI * 2 + Math.PI / 20;
      const distCircle = s * 0.465;
      isldsCenters[isld] = {
        cx: s * 0.5 + Math.cos(angle) * distCircle,
        cy: s * 0.5 + Math.sin(angle) * distCircle,
        radius: s * 0.038,
      };
    }

    for (let isld = 5; isld <= 54; isld++) {
      const bList = newIslandsBiomesMap[isld];
      const cent = isldsCenters[isld];
      if (!bList || !cent) continue;
      for (let i = 0; i < bList.length; i++) {
        const theta = i * 2.39996;
        const rad = cent.radius * Math.sqrt((i + 0.5) / bList.length);
        const x = cent.cx + Math.cos(theta) * rad;
        const y = cent.cy + Math.sin(theta) * rad;
        this.biomeSeeds.push({ x, y, biome: bList[i] });
      }
    }
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const mask = this.landMask(x, y);
        if (mask < 0.15) {
          this.tiles[this.idx(x, y)] = { kind: 1, biome: 0 };
          continue;
        }
        const scaleFactor = s / 864;
        const wx =
          x +
          (fbm(x / (22 * scaleFactor), y / (22 * scaleFactor), this.seed + 33, 3) - 0.5) *
            (24 * scaleFactor);
        const wy =
          y +
          (fbm(x / (22 * scaleFactor), y / (22 * scaleFactor), this.seed + 44, 3) - 0.5) *
            (24 * scaleFactor);
        let bestD = Infinity,
          bestBiome = 1;
        for (const seed of this.biomeSeeds) {
          const dx = seed.x - wx,
            dy = seed.y - wy;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            bestBiome = seed.biome;
          }
        }
        let kind: TileKind = 0;
        const biome = bestBiome;
        if (biome === 3 || biome === 23 || biome === 19 || biome === 31) kind = 3;
        if (
          (biome === 4 ||
            biome === 7 ||
            biome === 14 ||
            biome === 24 ||
            biome === 10 ||
            biome === 18 ||
            biome === 22 ||
            biome === 27 ||
            biome === 37 ||
            biome === 40) &&
          hash2(x, y, this.seed + 61) > 0.72
        )
          kind = 2;
        if (
          (biome === 2 ||
            biome === 8 ||
            biome === 9 ||
            biome === 20 ||
            biome === 25 ||
            biome === 39) &&
          hash2(x, y, this.seed + 62) > 0.76
        )
          kind = 4;
        if ((biome === 5 || biome === 20 || biome === 33) && hash2(x, y, this.seed + 63) > 0.94)
          kind = 1;
        if (
          (biome === 11 || biome === 12 || biome === 21 || biome === 34) &&
          hash2(x, y, this.seed + 64) > 0.55
        )
          kind = 1;
        if (mask < 0.22 && hash2(x, y, this.seed + 65) > 0.4) kind = 3;
        this.tiles[this.idx(x, y)] = { kind, biome };
      }
    }
    // cities + staircases per biome
    for (let i = 0; i < this.biomeSeeds.length; i++) {
      const s0 = this.biomeSeeds[i];
      const cx = Math.floor(s0.x),
        cy = Math.floor(s0.y);
      for (let yy = -3; yy <= 3; yy++)
        for (let xx = -3; xx <= 3; xx++) {
          if (this.inBounds(cx + xx, cy + yy)) {
            const t = this.tiles[this.idx(cx + xx, cy + yy)];
            if (t.kind !== 1) t.kind = 0;
          }
        }
      if (this.inBounds(cx, cy)) this.tiles[this.idx(cx, cy)].kind = 5;
      this.cities.push({
        name: CITY_NAMES[i] ?? `Cidade ${i + 1}`,
        x: s0.x * TILE,
        y: s0.y * TILE,
        biome: s0.biome,
      });
      // place staircase down offset from city — sempre em local alcançável a partir da cidade
      const offsets: Array<[number, number]> = [
        [5, 0],
        [-5, 0],
        [0, 5],
        [0, -5],
        [4, 4],
        [-4, 4],
        [4, -4],
        [-4, -4],
        [6, 0],
        [-6, 0],
        [0, 6],
        [0, -6],
      ];
      for (const [ox, oy] of offsets) {
        const sxT = cx + ox,
          syT = cy + oy;
        if (!this.inBounds(sxT, syT)) continue;
        const t = this.tiles[this.idx(sxT, syT)];
        if (t.kind === 5) continue;
        // Esvazia um patch 3x3 ao redor da escada (nunca sobre água/cidade)
        for (let yy = -1; yy <= 1; yy++)
          for (let xx = -1; xx <= 1; xx++) {
            if (this.inBounds(sxT + xx, syT + yy)) {
              const tt = this.tiles[this.idx(sxT + xx, syT + yy)];
              if (tt.kind !== 5) tt.kind = 0;
            }
          }
        // Cava um corredor 3-tiles de largura entre a praça da cidade e a escada,
        // garantindo que o jogador SEMPRE consiga alcançá-la.
        const stepX = Math.sign(sxT - cx),
          stepY = Math.sign(syT - cy);
        let px = cx,
          py = cy;
        const carve = (x: number, y: number) => {
          for (let yy = -1; yy <= 1; yy++)
            for (let xx = -1; xx <= 1; xx++) {
              const nx = x + xx,
                ny = y + yy;
              if (!this.inBounds(nx, ny)) continue;
              const tt = this.tiles[this.idx(nx, ny)];
              if (tt.kind !== 5 && tt.kind !== 6) tt.kind = 0;
            }
        };
        while (px !== sxT || py !== syT) {
          if (px !== sxT) px += stepX;
          carve(px, py);
          if (py !== syT) py += stepY;
          carve(px, py);
        }
        t.kind = 6;
        this.stairs.push({
          x: sxT * TILE + TILE / 2,
          y: syT * TILE + TILE / 2,
          biome: s0.biome,
          kind: "down",
        });
        break;
      }
    }
    const capital = this.cities.find((c) => c.biome === 1) ?? this.cities[0];
    this.spawn = { x: capital.x, y: capital.y };
    const sxT = Math.floor(capital.x / TILE),
      syT = Math.floor(capital.y / TILE);
    for (let yy = -5; yy <= 5; yy++)
      for (let xx = -5; xx <= 5; xx++) {
        if (this.inBounds(sxT + xx, syT + yy)) {
          const t = this.tiles[this.idx(sxT + xx, syT + yy)];
          if (t.kind !== 5 && t.kind !== 6) t.kind = 0;
        }
      }
    // ============ Central City of Asterion ============
    // Overwrites the capital tile with a proper walled city, complete with
    // buildings, torches, a central fountain, and a special GRAND staircase
    // that leads into the 100-floor Dungeon of Asterion.
    this.buildCentralCity(sxT, syT);
  }

  private buildCentralCity(cx: number, cy: number) {
    const R = 14; // city radius (in tiles)
    this.centralCity = { x: cx, y: cy, radius: R };
    // Plaza floor + outer wall ring
    for (let yy = -R; yy <= R; yy++) {
      for (let xx = -R; xx <= R; xx++) {
        const x = cx + xx,
          y = cy + yy;
        if (!this.inBounds(x, y)) continue;
        const d = Math.max(Math.abs(xx), Math.abs(yy));
        const t = this.tiles[this.idx(x, y)];
        if (d === R) {
          t.kind = 14; // stone wall ring
          t.biome = 1;
        } else if (d < R) {
          t.kind = 13; // paved city floor
          t.biome = 1;
        }
      }
    }
    // Four gate openings
    for (const [gx, gy] of [
      [cx + R, cy],
      [cx - R, cy],
      [cx, cy + R],
      [cx, cy - R],
    ] as [number, number][]) {
      if (this.inBounds(gx, gy)) this.tiles[this.idx(gx, gy)].kind = 10;
      if (this.inBounds(gx, gy - 1)) this.tiles[this.idx(gx, gy - 1)].kind = 10;
      if (this.inBounds(gx, gy + 1)) this.tiles[this.idx(gx, gy + 1)].kind = 10;
    }
    // Corner towers (steel pillars)
    for (const [dx, dy] of [
      [-R, -R],
      [R, -R],
      [-R, R],
      [R, R],
    ] as [number, number][]) {
      const x = cx + dx,
        y = cy + dy;
      if (this.inBounds(x, y)) this.tiles[this.idx(x, y)].kind = 11;
    }
    // Wall torches on the ring
    for (let yy = -R; yy <= R; yy += 3) {
      const sides: Array<[number, number]> = [
        [cx - R + 1, cy + yy],
        [cx + R - 1, cy + yy],
      ];
      for (const [tx, ty] of sides) {
        if (this.inBounds(tx, ty) && this.tiles[this.idx(tx, ty)].kind === 13) {
          this.tiles[this.idx(tx, ty)].kind = 8;
        }
      }
    }
    for (let xx = -R; xx <= R; xx += 3) {
      const sides: Array<[number, number]> = [
        [cx + xx, cy - R + 1],
        [cx + xx, cy + R - 1],
      ];
      for (const [tx, ty] of sides) {
        if (this.inBounds(tx, ty) && this.tiles[this.idx(tx, ty)].kind === 13) {
          this.tiles[this.idx(tx, ty)].kind = 8;
        }
      }
    }
    // Central fountain (3x3 with fountain in the middle)
    for (let yy = -1; yy <= 1; yy++)
      for (let xx = -1; xx <= 1; xx++) {
        if (this.inBounds(cx + xx, cy + yy)) this.tiles[this.idx(cx + xx, cy + yy)].kind = 13;
      }
    if (this.inBounds(cx, cy)) this.tiles[this.idx(cx, cy)].kind = 15;
    // Buildings: a few 3x3 building blocks in the quadrants
    const buildings: Array<[number, number]> = [
      [cx - 8, cy - 7],
      [cx + 5, cy - 7],
      [cx - 8, cy + 5],
      [cx + 5, cy + 5],
      [cx - 10, cy - 2],
      [cx + 7, cy - 2],
    ];
    for (const [bx, by] of buildings) {
      for (let yy = 0; yy < 4; yy++)
        for (let xx = 0; xx < 4; xx++) {
          const x = bx + xx,
            y = by + yy;
          if (!this.inBounds(x, y)) continue;
          if (xx === 0 || yy === 0 || xx === 3 || yy === 3) {
            this.tiles[this.idx(x, y)].kind = 14;
          } else {
            this.tiles[this.idx(x, y)].kind = 13;
          }
        }
      // door
      if (this.inBounds(bx + 1, by + 3)) this.tiles[this.idx(bx + 1, by + 3)].kind = 13;
      // torch near door
      if (this.inBounds(bx - 1, by + 3)) this.tiles[this.idx(bx - 1, by + 3)].kind = 8;
    }
    // Grand dungeon staircase — north of the fountain, prominent
    const gsx = cx,
      gsy = cy - 5;
    if (this.inBounds(gsx, gsy)) this.tiles[this.idx(gsx, gsy)].kind = 16;
    // Frame the grand stair with steel pillars
    if (this.inBounds(gsx - 1, gsy)) this.tiles[this.idx(gsx - 1, gsy)].kind = 11;
    if (this.inBounds(gsx + 1, gsy)) this.tiles[this.idx(gsx + 1, gsy)].kind = 11;
    if (this.inBounds(gsx - 1, gsy - 1)) this.tiles[this.idx(gsx - 1, gsy - 1)].kind = 8;
    if (this.inBounds(gsx + 1, gsy - 1)) this.tiles[this.idx(gsx + 1, gsy - 1)].kind = 8;
    this.grandStair = { x: gsx * TILE + TILE / 2, y: gsy * TILE + TILE / 2 };
    // Portal do Mundo Alternativo — sul da fonte, oposto à Grand Stair
    const apx = cx,
      apy = cy + 5;
    if (this.inBounds(apx, apy)) this.tiles[this.idx(apx, apy)].kind = 17;
    if (this.inBounds(apx - 1, apy)) this.tiles[this.idx(apx - 1, apy)].kind = 11;
    if (this.inBounds(apx + 1, apy)) this.tiles[this.idx(apx + 1, apy)].kind = 11;
    if (this.inBounds(apx - 1, apy + 1)) this.tiles[this.idx(apx - 1, apy + 1)].kind = 8;
    if (this.inBounds(apx + 1, apy + 1)) this.tiles[this.idx(apx + 1, apy + 1)].kind = 8;
    this.altPortal = { x: apx * TILE + TILE / 2, y: apy * TILE + TILE / 2 };

    // Portal do Labirinto do Abismo (kind 19) — leste/oeste do portal alternativo para simetria
    const abx = cx + 3,
      aby = cy + 5;
    if (this.inBounds(abx, aby)) this.tiles[this.idx(abx, aby)].kind = 19;
    if (this.inBounds(abx - 1, aby)) this.tiles[this.idx(abx - 1, aby)].kind = 11;
    if (this.inBounds(abx + 1, aby)) this.tiles[this.idx(abx + 1, aby)].kind = 11;
    this.abPortal = { x: abx * TILE + TILE / 2, y: aby * TILE + TILE / 2 };

    // Portal da Fenda Cósmica (kind 20) — simétrico a oeste
    const csx_portal = cx - 3,
      csy_portal = cy + 5;
    if (this.inBounds(csx_portal, csy_portal)) this.tiles[this.idx(csx_portal, csy_portal)].kind = 20;
    if (this.inBounds(csx_portal - 1, csy_portal)) this.tiles[this.idx(csx_portal - 1, csy_portal)].kind = 11;
    if (this.inBounds(csx_portal + 1, csy_portal)) this.tiles[this.idx(csx_portal + 1, csy_portal)].kind = 11;
    this.cosmicPortal = { x: csx_portal * TILE + TILE / 2, y: csy_portal * TILE + TILE / 2 };
    // NPC Ferreiro — dentro do prédio nordeste (cx+5..cx+8, cy-7..cy-4)
    const bsx = cx + 6,
      bsy = cy - 5;
    if (this.inBounds(bsx, bsy)) this.tiles[this.idx(bsx, bsy)].kind = 18;
    this.blacksmith = { x: bsx * TILE + TILE / 2, y: bsy * TILE + TILE / 2 };
    // Spawn is now the plaza, just south of the fountain (deslocado p/ oeste p/ não colidir com portal)
    this.spawn = { x: (cx - 3) * TILE + TILE / 2, y: (cy + 3) * TILE + TILE / 2 };
  }
}

// -------- Sub-floor generator (floors 2, 3, 4 per biome) --------
// Floor 2: cavern (cellular automata)
// Floor 3: sprawling dungeon of rooms and corridors
// Floor 4: huge biome-themed sanctum, reorganized but reminiscent of the surface
export class CaveFloor implements PlayMap {
  size: number;
  seed: number;
  floor: number; // 2, 3 or 4
  tiles: WorldTile[];
  stairs: Stair[] = [];
  spawn: { x: number; y: number } = { x: 0, y: 0 };
  readonly isCave = true;
  readonly biomeId: number;

  constructor(biomeId: number, seed: number, floor = 2) {
    this.biomeId = biomeId;
    this.seed = seed;
    this.floor = floor;
    // Andares 3x maiores por lado (~9x área) para biomas subterrâneos amplos.
    // Endgame biomes (61..70) go up to floor 11 (10 sub-floors) with sizes
    // clamped between 224..416 so the abyss keeps growing without wrecking perf.
    if (biomeId >= 501) {
      // Island 4 biomes: 12 sub-floors (floor 2..13). Massive and beautiful.
      this.size = Math.min(480, 240 + (floor - 2) * 20);
    } else if (biomeId >= 61 && biomeId <= 70) {
      this.size = Math.min(416, 224 + (floor - 2) * 24);
    } else if (biomeId >= 71 && biomeId <= 80) {
      // Biomas ocidentais: 5 subandares (floor 2..6), cada um maior que o anterior.
      this.size = Math.min(384, 200 + (floor - 2) * 36);
    } else if (biomeId >= 81 && biomeId <= 90) {
      // Mundo Alternativo: 10 subandares (floor 2..11), grande escala.
      this.size = Math.min(448, 240 + (floor - 2) * 22);
    } else {
      this.size = floor === 2 ? 192 : floor === 3 ? 288 : floor === 4 ? 336 : 384;
    }
    this.tiles = new Array(this.size * this.size);
    // Biomes 41..50 each get a UNIQUE organization algorithm applied to all
    // three sub-floors — different from every other biome, and from each other.
    if (biomeId >= 501) this.generateLegendaryQuantumBiome(biomeId, floor);
    else if (biomeId >= 41 && biomeId <= 50) this.generateCustomBiome(biomeId);
    else if (biomeId >= 61 && biomeId <= 70) this.generateEndgameBiome(biomeId, floor);
    else {
      const layoutType = (biomeId + floor) % 5;
      if (layoutType === 0) this.generateCave();
      else if (layoutType === 1) this.generateLabyrinth();
      else if (layoutType === 2) this.generateDungeon();
      else if (layoutType === 3) this.generateRiverCave();
      else this.generateDeepBiome();
    }
  }
  idx(x: number, y: number) {
    return y * this.size + x;
  }
  inBounds(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }
  get(x: number, y: number): WorldTile {
    if (!this.inBounds(x, y)) return { kind: 2, biome: this.biomeId };
    return this.tiles[this.idx(x, y)];
  }
  isBlocked(x: number, y: number) {
    const t = this.get(x, y).kind;
    return t === 2 || t === 1 || t === 4 || t === 9 || t === 11 || t === 14 || t === 15;
  }
  private rng(x: number, y: number) {
    return hash2(x, y, this.seed);
  }

  private placeStair(x: number, y: number, kind: "up" | "down") {
    this.tiles[this.idx(x, y)] = { kind: (kind === "up" ? 7 : 6) as TileKind, biome: this.biomeId };
    this.stairs.push({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, biome: this.biomeId, kind });
  }

  // -------- Floor 2: cellular-automata cavern --------
  private generateCave() {
    const s = this.size;
    let map: number[] = new Array(s * s);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const border = x < 2 || y < 2 || x >= s - 2 || y >= s - 2;
        map[y * s + x] = border ? 1 : this.rng(x, y) < 0.45 ? 1 : 0;
      }
    }
    for (let step = 0; step < 5; step++) {
      const next = new Array<number>(s * s);
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          let walls = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx,
                ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= s || ny >= s) {
                walls++;
                continue;
              }
              walls += map[ny * s + nx];
            }
          next[y * s + x] = walls >= 5 ? 1 : walls <= 3 ? 0 : map[y * s + x];
        }
      }
      map = next;
    }
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const w = map[y * s + x];
        this.tiles[this.idx(x, y)] = { kind: (w ? 2 : 0) as TileKind, biome: this.biomeId };
      }
    }
    const up = this.findOpen(Math.floor(s / 2), Math.floor(s / 2), map);
    if (!up) return;
    this.spawn = { x: up.x * TILE + TILE / 2, y: up.y * TILE + TILE / 2 };
    this.placeStair(up.x, up.y, "up");
    // stair-down: BFS a partir do spawn e escolhe o tile aberto mais distante
    // que seja REALMENTE alcançável (evita colocar em cavernas isoladas atrás de paredes).
    const distArr = new Int32Array(s * s);
    for (let i = 0; i < distArr.length; i++) distArr[i] = -1;
    const queue: number[] = [up.y * s + up.x];
    let qHead = 0;
    distArr[up.y * s + up.x] = 0;
    let best = up,
      bestD = 0;
    while (qHead < queue.length) {
      const cur = queue[qHead++];
      const cx = cur % s,
        cy = (cur - cx) / s;
      const d = distArr[cur];
      if (d > bestD) {
        bestD = d;
        best = { x: cx, y: cy };
      }
      const neigh: Array<[number, number]> = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dx, dy] of neigh) {
        const nx = cx + dx,
          ny = cy + dy;
        if (nx < 1 || ny < 1 || nx >= s - 1 || ny >= s - 1) continue;
        const ni = ny * s + nx;
        if (distArr[ni] !== -1) continue;
        if (map[ni] !== 0) continue;
        distArr[ni] = d + 1;
        queue.push(ni);
      }
    }
    if (bestD > 0) {
      for (let yy = -1; yy <= 1; yy++)
        for (let xx = -1; xx <= 1; xx++) {
          if (this.inBounds(best.x + xx, best.y + yy)) {
            this.tiles[this.idx(best.x + xx, best.y + yy)] = {
              kind: 0 as TileKind,
              biome: this.biomeId,
            };
          }
        }
      this.placeStair(best.x, best.y, "down");
    }
  }

  // -------- Floor 3: dungeon of rooms + corridors --------
  private generateDungeon() {
    const s = this.size;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        this.tiles[this.idx(x, y)] = { kind: 2 as TileKind, biome: this.biomeId };
      }
    }
    type Room = { x: number; y: number; w: number; h: number; cx: number; cy: number };
    const rooms: Room[] = [];
    // Escala com o tamanho da masmorra (antes: 80 salas para size 96)
    const roomTries = Math.floor(80 * (s / 96) * (s / 96));
    for (let i = 0; i < roomTries; i++) {
      const w = 6 + Math.floor(this.rng(i, 1) * 10);
      const h = 5 + Math.floor(this.rng(i, 2) * 9);
      const x = 2 + Math.floor(this.rng(i, 3) * (s - w - 4));
      const y = 2 + Math.floor(this.rng(i, 4) * (s - h - 4));
      const overlap = rooms.some(
        (r) => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y,
      );
      if (overlap) continue;
      rooms.push({ x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2) });
    }
    for (const r of rooms) {
      for (let y = r.y; y < r.y + r.h; y++) {
        for (let x = r.x; x < r.x + r.w; x++) {
          this.tiles[this.idx(x, y)] = { kind: 0 as TileKind, biome: this.biomeId };
        }
      }
    }
    const carveCorridor = (a: Room, b: Room) => {
      const x0 = Math.min(a.cx, b.cx),
        x1 = Math.max(a.cx, b.cx);
      for (let x = x0; x <= x1; x++) {
        this.tiles[this.idx(x, a.cy)] = { kind: 0 as TileKind, biome: this.biomeId };
        if (a.cy + 1 < s)
          this.tiles[this.idx(x, a.cy + 1)] = { kind: 0 as TileKind, biome: this.biomeId };
      }
      const y0 = Math.min(a.cy, b.cy),
        y1 = Math.max(a.cy, b.cy);
      for (let y = y0; y <= y1; y++) {
        this.tiles[this.idx(b.cx, y)] = { kind: 0 as TileKind, biome: this.biomeId };
        if (b.cx + 1 < s)
          this.tiles[this.idx(b.cx + 1, y)] = { kind: 0 as TileKind, biome: this.biomeId };
      }
    };
    for (let i = 1; i < rooms.length; i++) {
      carveCorridor(rooms[i - 1], rooms[i]);
      if (this.rng(i, 77) > 0.6 && i > 2) {
        const j = Math.floor(this.rng(i, 88) * (i - 1));
        carveCorridor(rooms[j], rooms[i]);
      }
    }
    for (const r of rooms) {
      if (r.w >= 9 && r.h >= 7) {
        const pxs = [r.x + 2, r.x + r.w - 3];
        const pys = [r.y + 2, r.y + r.h - 3];
        for (const px of pxs)
          for (const py of pys) {
            this.tiles[this.idx(px, py)] = { kind: 2 as TileKind, biome: this.biomeId };
          }
      }
    }
    if (rooms.length < 2) {
      const cx = Math.floor(s / 2),
        cy = Math.floor(s / 2);
      for (let y = cy - 3; y <= cy + 3; y++)
        for (let x = cx - 3; x <= cx + 3; x++) {
          this.tiles[this.idx(x, y)] = { kind: 0 as TileKind, biome: this.biomeId };
        }
      this.spawn = { x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2 };
      this.placeStair(cx, cy, "up");
      this.placeStair(cx + 2, cy, "down");
      return;
    }
    let a = rooms[0],
      b = rooms[1],
      bestD = 0;
    for (const r1 of rooms)
      for (const r2 of rooms) {
        const d = (r1.cx - r2.cx) ** 2 + (r1.cy - r2.cy) ** 2;
        if (d > bestD) {
          bestD = d;
          a = r1;
          b = r2;
        }
      }
    this.spawn = { x: a.cx * TILE + TILE / 2, y: a.cy * TILE + TILE / 2 };
    this.placeStair(a.cx, a.cy, "up");
    this.placeStair(b.cx, b.cy, "down");
  }

  // -------- Floor 4: huge biome-themed sanctum, reorganized --------
  private generateDeepBiome() {
    const s = this.size;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const border = x < 2 || y < 2 || x >= s - 2 || y >= s - 2;
        this.tiles[this.idx(x, y)] = { kind: (border ? 2 : 0) as TileKind, biome: this.biomeId };
      }
    }
    const cx = s / 2,
      cy = s / 2;
    const b = BIOMES.find((bb) => bb.id === this.biomeId);
    const usesTree = !!b && [2, 8, 9, 20, 25, 39, 15, 36].includes(b.id);
    const usesWater = !!b && [5, 11, 12, 21, 34].includes(b.id);
    const usesSand = !!b && [3, 23, 19, 31].includes(b.id);
    const obstacle: TileKind = usesTree ? 4 : usesWater ? 1 : 2;
    const soft: TileKind | null = usesSand ? 3 : null;

    for (let y = 2; y < s - 2; y++) {
      for (let x = 2; x < s - 2; x++) {
        const dx = x - cx,
          dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const ring = fbm(x / 10, y / 10, this.seed + 7, 4);
        const inBand =
          (d > s * 0.15 && d < s * 0.2) ||
          (d > s * 0.28 && d < s * 0.33) ||
          (d > s * 0.4 && d < s * 0.45);
        if (inBand && ring > 0.35) {
          this.tiles[this.idx(x, y)] = { kind: obstacle, biome: this.biomeId };
        } else if (soft && ring > 0.66) {
          this.tiles[this.idx(x, y)] = { kind: soft, biome: this.biomeId };
        } else if (!inBand && ring > 0.78) {
          this.tiles[this.idx(x, y)] = { kind: obstacle, biome: this.biomeId };
        }
      }
    }
    const sanctum = 6;
    for (let y = -sanctum; y <= sanctum; y++)
      for (let x = -sanctum; x <= sanctum; x++) {
        const xx = Math.floor(cx + x),
          yy = Math.floor(cy + y);
        if (this.inBounds(xx, yy))
          this.tiles[this.idx(xx, yy)] = { kind: 0 as TileKind, biome: this.biomeId };
      }
    const carveRay = (ax: number, ay: number) => {
      const len = s / 2 - 3;
      for (let i = 0; i < len; i++) {
        for (let w = -1; w <= 1; w++) {
          const x = Math.floor(cx + ax * i + (ax === 0 ? w : 0));
          const y = Math.floor(cy + ay * i + (ay === 0 ? w : 0));
          if (this.inBounds(x, y))
            this.tiles[this.idx(x, y)] = { kind: 0 as TileKind, biome: this.biomeId };
        }
      }
    };
    carveRay(1, 0);
    carveRay(-1, 0);
    carveRay(0, 1);
    carveRay(0, -1);
    const scx = Math.floor(cx),
      scy = Math.floor(cy);
    this.spawn = { x: scx * TILE + TILE / 2, y: scy * TILE + TILE / 2 };
    this.placeStair(scx, scy, "up");
  }

  private generateAbyssalBiome() {
    const s = this.size;
    const cx = Math.floor(s / 2),
      cy = Math.floor(s / 2);
    // Fill with base floor kind
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const border = x < 3 || y < 3 || x >= s - 3 || y >= s - 3;
        this.tiles[this.idx(x, y)] = { kind: (border ? 2 : 0) as TileKind, biome: this.biomeId };
      }
    }

    const b = BIOMES.find((bb) => bb.id === this.biomeId);
    // Choose liquid based on biome: volcanos get lava, boreal/mountains get water/abyss
    const liquidKind: TileKind = 1; // 1 is animated water / lava depending on biome color

    // Draw a majestic circular canyon with concentric bridges
    const rInner = Math.floor(s * 0.15);
    const rOuter = Math.floor(s * 0.25);

    for (let y = 3; y < s - 3; y++) {
      for (let x = 3; x < s - 3; x++) {
        const dx = x - cx,
          dy = y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist >= rInner && dist <= rOuter) {
          // Four main bridges (cardinal axes) are walkable (kind 0)
          const onBridge =
            (Math.abs(dx) <= 3 && Math.abs(dy) <= rOuter + 2) ||
            (Math.abs(dy) <= 3 && Math.abs(dx) <= rOuter + 2);
          if (!onBridge) {
            this.tiles[this.idx(x, y)] = { kind: liquidKind, biome: this.biomeId };
          }
        }
        // Scatter ancient obsidian monuments on the outer rim
        if (dist > rOuter + 5 && hash2(x, y, this.seed + 9) > 0.86) {
          this.tiles[this.idx(x, y)] = { kind: 2, biome: this.biomeId }; // Solid blocking wall
        }
      }
    }

    // Place a circle of glowing torches around the inner sanctuary
    const torchDist = rInner - 2;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const tx = Math.round(cx + Math.cos(angle) * torchDist);
      const ty = Math.round(cy + Math.sin(angle) * torchDist);
      if (this.inBounds(tx, ty) && this.tiles[this.idx(tx, ty)].kind === 0) {
        this.tiles[this.idx(tx, ty)].kind = 8; // Torch
      }
    }

    // Altar room at the center
    const altarRadius = 4;
    for (let y = -altarRadius; y <= altarRadius; y++) {
      for (let x = -altarRadius; x <= altarRadius; x++) {
        const ax = cx + x,
          ay = cy + y;
        if (this.inBounds(ax, ay)) {
          this.tiles[this.idx(ax, ay)] = { kind: 0 as TileKind, biome: this.biomeId };
          // Corner columns
          if (Math.abs(x) === altarRadius && Math.abs(y) === altarRadius) {
            this.tiles[this.idx(ax, ay)] = { kind: 11 as TileKind, biome: this.biomeId }; // Steel/stone pillar
          }
        }
      }
    }

    // Spawn point (outside of central arena, south entrance)
    this.spawn = { x: cx * TILE + TILE / 2, y: (cy + rOuter + 10) * TILE + TILE / 2 };
    this.placeStair(cx, cy + rOuter + 10, "up");

    // Altar center: Place a giant reward chest (12)
    this.tiles[this.idx(cx, cy)] = { kind: 12 as TileKind, biome: this.biomeId };
  }

  private generateLabyrinth() {
    const s = this.size;
    // Fill with walls
    for (let i = 0; i < s * s; i++) {
      this.tiles[i] = { kind: 2 as TileKind, biome: this.biomeId };
    }

    // Carve a maze with a grid of pathways
    const visited = new Uint8Array(s * s);
    const stack: { x: number; y: number }[] = [];
    const startX = 3,
      startY = 3;

    // We carve 2x2 cells with 2-tile thick walls for spacious battle zones
    const carve = (x: number, y: number) => {
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          if (this.inBounds(x + dx, y + dy)) {
            this.tiles[this.idx(x + dx, y + dy)] = { kind: 0, biome: this.biomeId };
          }
        }
      }
    };

    stack.push({ x: startX, y: startY });
    visited[startY * s + startX] = 1;
    carve(startX, startY);

    let tries = 0;
    while (stack.length > 0 && tries < 15000) {
      tries++;
      const current = stack[stack.length - 1];
      const neighbors: { x: number; y: number; px: number; py: number }[] = [];
      const dirs = [
        { dx: 4, dy: 0, px: 2, py: 0 },
        { dx: -4, dy: 0, px: -2, py: 0 },
        { dx: 0, dy: 4, px: 0, py: 2 },
        { dx: 0, dy: -4, px: 0, py: -2 },
      ];

      for (const d of dirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        if (nx > 2 && ny > 2 && nx < s - 3 && ny < s - 3) {
          if (!visited[ny * s + nx]) {
            neighbors.push({ x: nx, y: ny, px: current.x + d.px, py: current.y + d.py });
          }
        }
      }

      if (neighbors.length > 0) {
        const nextIdx =
          Math.floor(hash2(current.x, current.y, this.seed + tries) * neighbors.length) %
          neighbors.length;
        const next = neighbors[nextIdx];
        visited[next.y * s + next.x] = 1;
        carve(next.px, next.py);
        carve(next.x, next.y);
        stack.push({ x: next.x, y: next.y });
      } else {
        stack.pop();
      }
    }

    // Add optional shortcuts & loop connections for comfortable RPG layouts
    for (let y = 3; y < s - 3; y += 4) {
      for (let x = 3; x < s - 3; x += 4) {
        if (hash2(x, y, this.seed + 100) < 0.28) {
          for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 3; dx++) {
              if (this.inBounds(x + dx, y + dy)) {
                this.tiles[this.idx(x + dx, y + dy)] = { kind: 0, biome: this.biomeId };
              }
            }
          }
        }
      }
    }

    // Place 2-4 rare chests guarded by elites
    const chestCount = 2 + Math.floor(hash2(1, 2, this.seed) * 3);
    for (let i = 0; i < chestCount; i++) {
      const cx = 5 + Math.floor(hash2(i, 4, this.seed) * (s - 10));
      const cy = 5 + Math.floor(hash2(i, 5, this.seed) * (s - 10));
      if (this.tiles[this.idx(cx, cy)].kind === 0) {
        this.tiles[this.idx(cx, cy)] = { kind: 12, biome: this.biomeId }; // Chest
      }
    }

    const spawnX = 3,
      spawnY = 3;
    const exitX = s - 5,
      exitY = s - 5;

    // Clear paths around spawn and exit
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (this.inBounds(spawnX + dx, spawnY + dy))
          this.tiles[this.idx(spawnX + dx, spawnY + dy)] = { kind: 0, biome: this.biomeId };
        if (this.inBounds(exitX + dx, exitY + dy))
          this.tiles[this.idx(exitX + dx, exitY + dy)] = { kind: 0, biome: this.biomeId };
      }
    }

    this.spawn = { x: spawnX * TILE + TILE / 2, y: spawnY * TILE + TILE / 2 };
    this.placeStair(spawnX, spawnY, "up");
    this.placeStair(exitX, exitY, "down");
  }

  private generateRiverCave() {
    const s = this.size;
    let map: number[] = new Array(s * s);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const border = x < 2 || y < 2 || x >= s - 2 || y >= s - 2;
        map[y * s + x] = border ? 1 : this.rng(x, y) < 0.45 ? 1 : 0;
      }
    }
    for (let step = 0; step < 4; step++) {
      const next = new Array<number>(s * s);
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          let walls = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx,
                ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= s || ny >= s) {
                walls++;
                continue;
              }
              walls += map[ny * s + nx];
            }
          next[y * s + x] = walls >= 5 ? 1 : walls <= 3 ? 0 : map[y * s + x];
        }
      }
      map = next;
    }

    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const w = map[y * s + x];
        this.tiles[this.idx(x, y)] = { kind: (w ? 2 : 0) as TileKind, biome: this.biomeId };
      }
    }

    // Winding river cut horizontally or vertically cutting map in half
    const riverWidth = 5;
    const riverCenter = Math.floor(s / 2);
    const bridgeY1 = Math.floor(s * 0.25);
    const bridgeY2 = Math.floor(s * 0.75);

    for (let y = 2; y < s - 2; y++) {
      const offset = Math.sin(y * 0.08 + this.seed) * 8 + Math.cos(y * 0.03) * 4;
      const rx = Math.floor(riverCenter + offset);
      const isBridge = Math.abs(y - bridgeY1) <= 1 || Math.abs(y - bridgeY2) <= 1;

      for (let x = rx - Math.floor(riverWidth / 2); x <= rx + Math.floor(riverWidth / 2); x++) {
        if (this.inBounds(x, y)) {
          if (isBridge) {
            this.tiles[this.idx(x, y)] = { kind: 0, biome: this.biomeId };
          } else {
            this.tiles[this.idx(x, y)] = { kind: 1, biome: this.biomeId }; // River of water/lava
          }
        }
      }
      if (isBridge) {
        for (let x = rx - 6; x <= rx + 6; x++) {
          if (this.inBounds(x, y)) {
            this.tiles[this.idx(x, y)] = { kind: 0, biome: this.biomeId };
          }
        }
      }
    }

    // Place secret chests in secluded left/right areas
    const chestCount = 2;
    const cPositions = [
      { cx: Math.floor(s * 0.15), cy: Math.floor(s * 0.3) },
      { cx: Math.floor(s * 0.85), cy: Math.floor(s * 0.7) },
    ];
    for (const pos of cPositions) {
      const actual = this.findOpen(pos.cx, pos.cy, map);
      if (actual) {
        this.tiles[this.idx(actual.x, actual.y)] = { kind: 12, biome: this.biomeId };
      }
    }

    const up = this.findOpen(Math.floor(s * 0.25), Math.floor(s / 2), map);
    const down = this.findOpen(Math.floor(s * 0.75), Math.floor(s / 2), map);

    if (up && down) {
      this.spawn = { x: up.x * TILE + TILE / 2, y: up.y * TILE + TILE / 2 };
      this.placeStair(up.x, up.y, "up");
      this.placeStair(down.x, down.y, "down");
    } else {
      const uy = Math.floor(s / 2),
        ux = Math.floor(s * 0.2);
      const dy = Math.floor(s / 2),
        dx = Math.floor(s * 0.8);
      for (let yy = -1; yy <= 1; yy++) {
        for (let xx = -1; xx <= 1; xx++) {
          if (this.inBounds(ux + xx, uy + yy))
            this.tiles[this.idx(ux + xx, uy + yy)] = { kind: 0, biome: this.biomeId };
          if (this.inBounds(dx + xx, dy + yy))
            this.tiles[this.idx(dx + xx, dy + yy)] = { kind: 0, biome: this.biomeId };
        }
      }
      this.spawn = { x: ux * TILE + TILE / 2, y: uy * TILE + TILE / 2 };
      this.placeStair(ux, uy, "up");
      this.placeStair(dx, dy, "down");
    }
  }

  private findOpen(cx: number, cy: number, map: number[]): { x: number; y: number } | null {
    const s = this.size;
    for (let r = 0; r < s; r++) {
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx,
            y = cy + dy;
          if (x < 1 || y < 1 || x >= s - 1 || y >= s - 1) continue;
          if (map[y * s + x] === 0) return { x, y };
        }
    }
    return null;
  }

  // -------- Custom per-biome generators (biomes 41..50) --------
  // Each new biome uses one exclusive layout algorithm applied to all three
  // sub-floors — the floor size differs (192 / 288 / 336) so the same rule
  // organises the space at three scales.
  private generateCustomBiome(biomeId: number) {
    const s = this.size;
    // Start solid (wall). Border stays wall.
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++)
        this.tiles[this.idx(x, y)] = { kind: 2 as TileKind, biome: this.biomeId };
    const open = (x: number, y: number) => {
      if (x < 1 || y < 1 || x >= s - 1 || y >= s - 1) return;
      this.tiles[this.idx(x, y)].kind = 0;
    };
    const disk = (cx: number, cy: number, r: number) => {
      const r2 = r * r;
      for (let y = Math.max(1, cy - r); y <= Math.min(s - 2, cy + r); y++)
        for (let x = Math.max(1, cx - r); x <= Math.min(s - 2, cx + r); x++)
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) open(x, y);
    };
    const rect = (x0: number, y0: number, w: number, h: number) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) open(x, y);
    };
    const line = (x0: number, y0: number, x1: number, y1: number, thick = 1) => {
      const dx = x1 - x0,
        dy = y1 - y0;
      const steps = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
      for (let i = 0; i <= steps; i++) {
        const cx = Math.round(x0 + (dx * i) / steps);
        const cy = Math.round(y0 + (dy * i) / steps);
        for (let ty = -thick; ty <= thick; ty++)
          for (let tx = -thick; tx <= thick; tx++) open(cx + tx, cy + ty);
      }
    };
    const cx = Math.floor(s / 2),
      cy = Math.floor(s / 2);
    let downX = cx + 6,
      downY = cy;

    switch (biomeId) {
      case 41: {
        // Concentric rings + 8 radial spokes (Deserto Cristalino).
        const rings = [
          Math.floor(s * 0.1),
          Math.floor(s * 0.22),
          Math.floor(s * 0.34),
          Math.floor(s * 0.44),
        ];
        for (const R of rings) {
          const steps = R * 8;
          for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            open(Math.round(cx + Math.cos(a) * R), Math.round(cy + Math.sin(a) * R));
            open(Math.round(cx + Math.cos(a) * R) + 1, Math.round(cy + Math.sin(a) * R));
          }
        }
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          line(
            cx,
            cy,
            Math.round(cx + Math.cos(a) * (s * 0.46)),
            Math.round(cy + Math.sin(a) * (s * 0.46)),
            1,
          );
        }
        disk(cx, cy, 5);
        downX = Math.round(cx + Math.cos(Math.PI / 3) * rings[rings.length - 1]);
        downY = Math.round(cy + Math.sin(Math.PI / 3) * rings[rings.length - 1]);
        break;
      }
      case 42: {
        // Grid districts: wide boulevards carving a checkerboard (Savana Cinzenta).
        const cell = Math.floor(s / 8);
        for (let i = 0; i <= 8; i++) {
          line(1, i * cell, s - 2, i * cell, 2);
          line(i * cell, 1, i * cell, s - 2, 2);
        }
        // Open half the "blocks" as plazas.
        for (let gy = 0; gy < 8; gy++)
          for (let gx = 0; gx < 8; gx++) {
            if (((gx + gy) & 1) === 0) rect(gx * cell + 3, gy * cell + 3, cell - 4, cell - 4);
          }
        downX = s - cell;
        downY = s - cell;
        break;
      }
      case 43: {
        // Single spiral arm (Arquipélago Coral).
        const turns = 4;
        const maxR = s * 0.45;
        const steps = Math.floor(maxR * Math.PI * 2 * turns);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const R = t * maxR;
          const a = t * turns * Math.PI * 2;
          const x = Math.round(cx + Math.cos(a) * R);
          const y = Math.round(cy + Math.sin(a) * R);
          disk(x, y, 2);
        }
        disk(cx, cy, 4);
        downX = Math.round(cx + Math.cos(turns * Math.PI * 2) * maxR);
        downY = Math.round(cy + Math.sin(turns * Math.PI * 2) * maxR);
        break;
      }
      case 44: {
        // Diamond-tiled rooms (Terras Escaldadas).
        const step = Math.floor(s / 7);
        for (let gy = 0; gy < 8; gy++) {
          for (let gx = 0; gx < 8; gx++) {
            const rx = gx * step + (gy & 1 ? Math.floor(step / 2) : 0) + 4;
            const ry = gy * Math.floor(step * 0.75) + 4;
            if (rx > s - 5 || ry > s - 5) continue;
            const r = Math.floor(step / 2) - 1;
            // Diamond
            for (let dy = -r; dy <= r; dy++) {
              const w = r - Math.abs(dy);
              for (let dx = -w; dx <= w; dx++) open(rx + dx, ry + dy);
            }
          }
        }
        // Diagonal connecting alleys.
        for (let i = 0; i < s; i += 2) {
          open(i, i);
          open(s - 1 - i, i);
        }
        downX = s - 8;
        downY = s - 8;
        break;
      }
      case 45: {
        // Fractal binary space partition / branching corridors (Bosque de Ébano).
        type R = { x: number; y: number; w: number; h: number };
        const rooms: R[] = [];
        const split = (r: R, depth: number) => {
          if (depth === 0 || r.w < 12 || r.h < 12) {
            const pad = 2;
            rooms.push({ x: r.x + pad, y: r.y + pad, w: r.w - pad * 2, h: r.h - pad * 2 });
            return;
          }
          const horiz = r.w < r.h ? true : r.w > r.h ? false : this.rng(r.x, r.y) > 0.5;
          if (horiz) {
            const cut = Math.floor(r.h * (0.35 + this.rng(r.x, r.y + 1) * 0.3));
            split({ x: r.x, y: r.y, w: r.w, h: cut }, depth - 1);
            split({ x: r.x, y: r.y + cut, w: r.w, h: r.h - cut }, depth - 1);
          } else {
            const cut = Math.floor(r.w * (0.35 + this.rng(r.x + 1, r.y) * 0.3));
            split({ x: r.x, y: r.y, w: cut, h: r.h }, depth - 1);
            split({ x: r.x + cut, y: r.y, w: r.w - cut, h: r.h }, depth - 1);
          }
        };
        split({ x: 2, y: 2, w: s - 4, h: s - 4 }, 5);
        for (const r of rooms) rect(r.x, r.y, r.w, r.h);
        for (let i = 1; i < rooms.length; i++) {
          const a = rooms[i - 1],
            b = rooms[i];
          line(
            a.x + Math.floor(a.w / 2),
            a.y + Math.floor(a.h / 2),
            b.x + Math.floor(b.w / 2),
            b.y + Math.floor(b.h / 2),
            1,
          );
        }
        const last = rooms[rooms.length - 1];
        downX = last.x + Math.floor(last.w / 2);
        downY = last.y + Math.floor(last.h / 2);
        break;
      }
      case 46: {
        // Meandering rivers of open space (Terras Bioluminescentes).
        for (let k = 0; k < 6; k++) {
          let x = 4 + Math.floor(this.rng(k, 1) * (s - 8));
          let y = 4;
          while (y < s - 4) {
            disk(x, y, 3);
            const dir = (this.rng(x, y) - 0.5) * 4;
            x = Math.max(4, Math.min(s - 5, x + Math.round(dir)));
            y += 1;
          }
        }
        // Circular islands of open ground.
        for (let k = 0; k < 12; k++) {
          const ix = 6 + Math.floor(this.rng(k, 5) * (s - 12));
          const iy = 6 + Math.floor(this.rng(k, 6) * (s - 12));
          disk(ix, iy, 4);
        }
        downX = s - 6;
        downY = s - 6;
        break;
      }
      case 47: {
        // Honeycomb / hex cells (Planalto do Trovão).
        const R = Math.floor(s / 14);
        const dx = Math.floor(R * 1.8),
          dy = Math.floor(R * 1.55);
        for (let gy = 0; gy * dy < s; gy++) {
          for (let gx = 0; gx * dx < s; gx++) {
            const hx = gx * dx + (gy & 1 ? Math.floor(dx / 2) : 0) + 4;
            const hy = gy * dy + 4;
            if (hx > s - 5 || hy > s - 5) continue;
            disk(hx, hy, R - 1);
          }
        }
        // Cross connectors so the hex cells link up.
        for (let i = 4; i < s - 4; i += Math.max(2, dy)) line(4, i, s - 4, i, 1);
        downX = s - 8;
        downY = s - 8;
        break;
      }
      case 48: {
        // 4-way mirrored symmetric dungeon (Deserto de Vidro).
        const rooms = 14;
        const q: Array<[number, number, number]> = [];
        for (let i = 0; i < rooms; i++) {
          const x = 3 + Math.floor(this.rng(i, 1) * (s / 2 - 8));
          const y = 3 + Math.floor(this.rng(i, 2) * (s / 2 - 8));
          const r = 3 + Math.floor(this.rng(i, 3) * 3);
          q.push([x, y, r]);
        }
        for (const [x, y, r] of q) {
          disk(x, y, r);
          disk(s - 1 - x, y, r);
          disk(x, s - 1 - y, r);
          disk(s - 1 - x, s - 1 - y, r);
        }
        // Cross of connectors.
        line(cx, 2, cx, s - 3, 1);
        line(2, cy, s - 3, cy, 1);
        disk(cx, cy, 5);
        downX = 6;
        downY = 6;
        break;
      }
      case 49: {
        // Voronoi rooms — random seed points, each cell open, walls at boundaries (Vazio Etéreo).
        const seeds: Array<[number, number]> = [];
        const N = 24;
        for (let i = 0; i < N; i++) {
          seeds.push([
            3 + Math.floor(this.rng(i, 1) * (s - 6)),
            3 + Math.floor(this.rng(i, 2) * (s - 6)),
          ]);
        }
        const owner = new Int32Array(s * s);
        for (let y = 1; y < s - 1; y++) {
          for (let x = 1; x < s - 1; x++) {
            let bi = 0,
              bd = Infinity;
            for (let i = 0; i < N; i++) {
              const dx = seeds[i][0] - x,
                dy = seeds[i][1] - y;
              const d = dx * dx + dy * dy;
              if (d < bd) {
                bd = d;
                bi = i;
              }
            }
            owner[y * s + x] = bi;
          }
        }
        // Open a cell if any neighbour shares the same owner (interior).
        for (let y = 2; y < s - 2; y++) {
          for (let x = 2; x < s - 2; x++) {
            const me = owner[y * s + x];
            const boundary =
              owner[y * s + (x + 1)] !== me ||
              owner[y * s + (x - 1)] !== me ||
              owner[(y + 1) * s + x] !== me ||
              owner[(y - 1) * s + x] !== me;
            if (!boundary) open(x, y);
          }
        }
        // Connect every seed to its two nearest neighbours.
        for (let i = 0; i < N; i++) {
          const dists = seeds
            .map((p, j) => ({ j, d: (p[0] - seeds[i][0]) ** 2 + (p[1] - seeds[i][1]) ** 2 }))
            .filter((o) => o.j !== i);
          dists.sort((a, b) => a.d - b.d);
          for (let k = 0; k < 2 && k < dists.length; k++) {
            const j = dists[k].j;
            line(seeds[i][0], seeds[i][1], seeds[j][0], seeds[j][1], 1);
          }
        }
        downX = seeds[N - 1][0];
        downY = seeds[N - 1][1];
        break;
      }
      case 50: {
        // Nested concentric boxes with rotating doorways (Éden Perdido).
        const layers = 7;
        for (let L = 1; L <= layers; L++) {
          const pad = 3 + L * Math.floor(s / (layers * 3));
          if (pad * 2 >= s - 4) break;
          // Carve the ring corridor of this box.
          rect(pad, pad, s - pad * 2, 1);
          rect(pad, s - pad - 1, s - pad * 2, 1);
          rect(pad, pad, 1, s - pad * 2);
          rect(s - pad - 1, pad, 1, s - pad * 2);
          // Doorway on one side, rotated by layer.
          const side = L % 4;
          if (side === 0) rect(cx - 2, pad, 4, 1);
          else if (side === 1) rect(s - pad - 1, cy - 2, 1, 4);
          else if (side === 2) rect(cx - 2, s - pad - 1, 4, 1);
          else rect(pad, cy - 2, 1, 4);
        }
        disk(cx, cy, 4);
        downX = cx;
        downY = cy - 3;
        break;
      }
    }

    // Ensure spawn area is open, place stairs.
    disk(cx, cy, 3);
    this.spawn = { x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2 };
    this.placeStair(cx, cy, "up");
    if (this.floor < 6) {
      // Clamp downstair location and make sure surroundings are walkable.
      downX = Math.max(2, Math.min(s - 3, downX));
      downY = Math.max(2, Math.min(s - 3, downY));
      disk(downX, downY, 2);
      this.placeStair(downX, downY, "down");
    } else {
      downX = Math.max(2, Math.min(s - 3, downX));
      downY = Math.max(2, Math.min(s - 3, downY));
      this.tiles[this.idx(downX, downY)] = { kind: 12 as TileKind, biome: this.biomeId };
    }
  }

  // -------- ENDGAME biomes 61..70 (10 floors each, spectacular layouts) --------
  // Each biome + floor combo produces a distinctive cathedral-like layout by
  // combining a base algorithm (chosen from biomeId) with a floor-dependent
  // twist. Torches (kind 8), pillars (kind 11) and chest (kind 12) light the
  // way. Every 3rd floor spawns a "shrine" ring for atmosphere.
  private generateEndgameBiome(biomeId: number, floor: number) {
    const s = this.size;
    // Start fully walled — carve openings.
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++)
        this.tiles[this.idx(x, y)] = { kind: 2 as TileKind, biome: this.biomeId };
    const open = (x: number, y: number, kind: TileKind = 0) => {
      if (x < 1 || y < 1 || x >= s - 1 || y >= s - 1) return;
      this.tiles[this.idx(x, y)] = { kind, biome: this.biomeId };
    };
    const disk = (cx: number, cy: number, r: number, kind: TileKind = 0) => {
      const r2 = r * r;
      for (let y = Math.max(1, cy - r); y <= Math.min(s - 2, cy + r); y++)
        for (let x = Math.max(1, cx - r); x <= Math.min(s - 2, cx + r); x++)
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) open(x, y, kind);
    };
    const line = (x0: number, y0: number, x1: number, y1: number, thick = 1) => {
      const dx = x1 - x0,
        dy = y1 - y0;
      const steps = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
      for (let i = 0; i <= steps; i++) {
        const cxi = Math.round(x0 + (dx * i) / steps);
        const cyi = Math.round(y0 + (dy * i) / steps);
        for (let ty = -thick; ty <= thick; ty++)
          for (let tx = -thick; tx <= thick; tx++) open(cxi + tx, cyi + ty);
      }
    };
    const cx = Math.floor(s / 2),
      cy = Math.floor(s / 2);

    // Style index deterministically drawn from biome + floor so floors look distinct.
    const style = ((biomeId - 61) * 3 + floor) % 6;

    if (style === 0) {
      // Radial mandala: 12 spokes + 3 rings.
      const rings = [Math.floor(s * 0.14), Math.floor(s * 0.26), Math.floor(s * 0.38)];
      for (const R of rings) {
        const steps = R * 6;
        for (let i = 0; i < steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          open(Math.round(cx + Math.cos(a) * R), Math.round(cy + Math.sin(a) * R));
          open(Math.round(cx + Math.cos(a) * R) + 1, Math.round(cy + Math.sin(a) * R));
        }
      }
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        line(
          cx,
          cy,
          Math.round(cx + Math.cos(a) * (s * 0.42)),
          Math.round(cy + Math.sin(a) * (s * 0.42)),
          1,
        );
      }
      disk(cx, cy, 6);
    } else if (style === 1) {
      // Nine-chamber grid connected by cross corridors.
      const cellW = Math.floor(s / 3.4);
      for (let ry = 0; ry < 3; ry++)
        for (let rx = 0; rx < 3; rx++) {
          const ox = Math.floor(s * 0.16) + rx * cellW;
          const oy = Math.floor(s * 0.16) + ry * cellW;
          const rw = Math.floor(cellW * 0.7),
            rh = Math.floor(cellW * 0.7);
          for (let y = oy; y < oy + rh; y++) for (let x = ox; x < ox + rw; x++) open(x, y);
        }
      for (let ry = 0; ry < 3; ry++)
        line(
          Math.floor(s * 0.2),
          Math.floor(s * 0.24) + ry * cellW,
          Math.floor(s * 0.8),
          Math.floor(s * 0.24) + ry * cellW,
          1,
        );
      for (let rx = 0; rx < 3; rx++)
        line(
          Math.floor(s * 0.24) + rx * cellW,
          Math.floor(s * 0.2),
          Math.floor(s * 0.24) + rx * cellW,
          Math.floor(s * 0.8),
          1,
        );
    } else if (style === 2) {
      // Twin spiral galaxies converging on the center.
      for (let arm = 0; arm < 2; arm++) {
        for (let t = 0; t < 220; t += 1) {
          const a = t * 0.18 + arm * Math.PI;
          const r = 4 + t * 0.35;
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r);
          disk(x, y, 2);
        }
      }
      disk(cx, cy, 8);
    } else if (style === 3) {
      // Cathedral nave: a wide central hall with side chapels.
      const halfW = Math.floor(s * 0.08);
      for (let y = Math.floor(s * 0.15); y < s - Math.floor(s * 0.15); y++)
        for (let x = cx - halfW; x <= cx + halfW; x++) open(x, y);
      for (let k = 0; k < 6; k++) {
        const oy = Math.floor(s * 0.2) + k * Math.floor(s * 0.11);
        const w = Math.floor(s * 0.14),
          h = Math.floor(s * 0.09);
        for (let y = oy; y < oy + h; y++)
          for (let x = cx - halfW - w; x <= cx - halfW; x++) open(x, y);
        for (let y = oy; y < oy + h; y++)
          for (let x = cx + halfW; x <= cx + halfW + w; x++) open(x, y);
      }
    } else if (style === 4) {
      // Interlocking hex rooms across the map.
      const cell = Math.floor(s / 8);
      for (let ry = 0; ry < 8; ry++)
        for (let rx = 0; rx < 8; rx++) {
          const ox = rx * cell + Math.floor(cell / 2) + (ry % 2 ? Math.floor(cell / 2) : 0);
          const oy = ry * cell + Math.floor(cell / 2);
          disk(ox, oy, Math.floor(cell * 0.38));
        }
      for (let ry = 0; ry < 8; ry++)
        line(0, ry * cell + Math.floor(cell / 2), s - 1, ry * cell + Math.floor(cell / 2), 0);
    } else {
      // Fractured labyrinth: many short corridors radiating from many nodes.
      const nodes = 32;
      const pts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < nodes; i++) {
        const a = (i / nodes) * Math.PI * 2;
        const r = Math.floor(s * (0.15 + (0.3 * (i % 3)) / 2));
        pts.push({ x: Math.round(cx + Math.cos(a) * r), y: Math.round(cy + Math.sin(a) * r) });
      }
      for (const p of pts) disk(p.x, p.y, 4);
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b1 = pts[(i + 1) % pts.length];
        const b2 = pts[(i + 5) % pts.length];
        line(a.x, a.y, b1.x, b1.y, 1);
        if (i % 3 === 0) line(a.x, a.y, b2.x, b2.y, 1);
      }
      disk(cx, cy, 5);
    }

    // Shrine ring every 3rd floor: 8 torches + 4 pillars around the center.
    if (floor % 3 === 0) {
      const R = 5;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const tx = Math.round(cx + Math.cos(a) * R);
        const ty = Math.round(cy + Math.sin(a) * R);
        if (this.inBounds(tx, ty) && this.tiles[this.idx(tx, ty)].kind === 0) {
          this.tiles[this.idx(tx, ty)] = { kind: 8 as TileKind, biome: this.biomeId };
        }
      }
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 8;
        const tx = Math.round(cx + Math.cos(a) * (R + 3));
        const ty = Math.round(cy + Math.sin(a) * (R + 3));
        if (this.inBounds(tx, ty) && this.tiles[this.idx(tx, ty)].kind === 0) {
          this.tiles[this.idx(tx, ty)] = { kind: 11 as TileKind, biome: this.biomeId };
        }
      }
    }

    // Spawn + stair-up at center.
    this.spawn = { x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2 };
    this.placeStair(cx, cy, "up");

    // Stair-down or final treasure chest at floor 11.
    if (floor < 11) {
      // Pick a far walkable point.
      let bestX = cx + 8,
        bestY = cy;
      let bestD = 0;
      for (let tries = 0; tries < 400; tries++) {
        const rx = 3 + Math.floor(this.rng(tries, 21) * (s - 6));
        const ry = 3 + Math.floor(this.rng(tries, 22) * (s - 6));
        if (this.tiles[this.idx(rx, ry)].kind !== 0) continue;
        const d = (rx - cx) * (rx - cx) + (ry - cy) * (ry - cy);
        if (d > bestD) {
          bestD = d;
          bestX = rx;
          bestY = ry;
        }
      }
      // Ensure walkable pocket around the stair.
      for (let yy = -1; yy <= 1; yy++)
        for (let xx = -1; xx <= 1; xx++) {
          const ax = bestX + xx,
            ay = bestY + yy;
          if (this.inBounds(ax, ay))
            this.tiles[this.idx(ax, ay)] = { kind: 0 as TileKind, biome: this.biomeId };
        }
      this.placeStair(bestX, bestY, "down");
    } else {
      // Grand treasure chest at floor 11.
      this.tiles[this.idx(cx + 1, cy)] = { kind: 12 as TileKind, biome: this.biomeId };
    }
  }

  private generateLegendaryQuantumBiome(biomeId: number, floor: number) {
    const s = this.size;
    // Start fully walled — carve openings.
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        this.tiles[this.idx(x, y)] = { kind: 2 as TileKind, biome: this.biomeId };
      }
    }
    const open = (x: number, y: number, kind: TileKind = 0) => {
      if (x < 1 || y < 1 || x >= s - 1 || y >= s - 1) return;
      this.tiles[this.idx(x, y)] = { kind, biome: this.biomeId };
    };
    const disk = (cx: number, cy: number, r: number, kind: TileKind = 0) => {
      const r2 = r * r;
      for (let y = Math.max(1, cy - r); y <= Math.min(s - 2, cy + r); y++) {
        for (let x = Math.max(1, cx - r); x <= Math.min(s - 2, cx + r); x++) {
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) {
            open(x, y, kind);
          }
        }
      }
    };
    const line = (x0: number, y0: number, x1: number, y1: number, thick = 1) => {
      const dx = x1 - x0,
        dy = y1 - y0;
      const steps = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
      for (let i = 0; i <= steps; i++) {
        const cxi = Math.round(x0 + (dx * i) / steps);
        const cyi = Math.round(y0 + (dy * i) / steps);
        for (let ty = -thick; ty <= thick; ty++) {
          for (let tx = -thick; tx <= thick; tx++) {
            open(cxi + tx, cyi + ty);
          }
        }
      }
    };
    const cx = Math.floor(s / 2),
      cy = Math.floor(s / 2);

    const style = ((biomeId - 501) * 3 + floor) % 4;

    if (style === 0) {
      // 1. Cosmic Spiral Galaxy: spirals radiating from the center, connected by radial spokes
      for (let arm = 0; arm < 3; arm++) {
        for (let t = 0; t < 300; t++) {
          const a = t * 0.12 + (arm * Math.PI * 2) / 3;
          const r = 5 + t * 0.45;
          const px = Math.round(cx + Math.cos(a) * r);
          const py = Math.round(cy + Math.sin(a) * r);
          disk(px, py, 3);
        }
      }
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        line(
          cx,
          cy,
          Math.round(cx + Math.cos(a) * (s * 0.45)),
          Math.round(cy + Math.sin(a) * (s * 0.45)),
          1,
        );
      }
      disk(cx, cy, 10);
    } else if (style === 1) {
      // 2. Quantum Wave Grid: mesh of sine/cosine wave canals and intersecting rooms
      for (let i = Math.floor(s * 0.1); i < s * 0.9; i += 24) {
        // Horizontal wave
        for (let x = Math.floor(s * 0.1); x < s * 0.9; x++) {
          const y = Math.round(i + Math.sin(x * 0.15) * 4);
          disk(x, y, 2);
        }
        // Vertical wave
        for (let y = Math.floor(s * 0.1); y < s * 0.9; y++) {
          const x = Math.round(i + Math.cos(y * 0.15) * 4);
          disk(x, y, 2);
        }
      }
      // Add custom circular intersection nodes/rooms
      for (let y = Math.floor(s * 0.2); y < s * 0.8; y += 48) {
        for (let x = Math.floor(s * 0.2); x < s * 0.8; x += 48) {
          disk(x, y, 6);
        }
      }
      disk(cx, cy, 8);
    } else if (style === 2) {
      // 3. Bento Concentric Squares/Chambers
      const rings = [Math.floor(s * 0.15), Math.floor(s * 0.28), Math.floor(s * 0.4)];
      for (const r of rings) {
        // Draw square chambers
        for (let x = cx - r; x <= cx + r; x++) {
          disk(x, cy - r, 3);
          disk(x, cy + r, 3);
        }
        for (let y = cy - r; y <= cy + r; y++) {
          disk(cx - r, y, 3);
          disk(cx + r, y, 3);
        }
      }
      // Draw massive connectors
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        line(
          cx,
          cy,
          Math.round(cx + Math.cos(a) * (s * 0.44)),
          Math.round(cy + Math.sin(a) * (s * 0.44)),
          2,
        );
      }
      disk(cx, cy, 12);
    } else {
      // 4. Hexagonal Star Citadel
      const rad = Math.floor(s * 0.35);
      disk(cx, cy, 14); // Central citadel
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const hx = Math.round(cx + Math.cos(a) * rad);
        const hy = Math.round(cy + Math.sin(a) * rad);
        disk(hx, hy, 10); // Satellite citadel
        line(cx, cy, hx, hy, 2); // Connective beam

        // Connect satellites together in a hexagon ring
        const nextA = ((k + 1) / 6) * Math.PI * 2;
        const nhx = Math.round(cx + Math.cos(nextA) * rad);
        const nhy = Math.round(cy + Math.sin(nextA) * rad);
        line(hx, hy, nhx, nhy, 1);
      }
    }

    // Add unique lighting: 12 cosmic torches/crystals surrounding the center area
    const lightRad = 8;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const lx = Math.round(cx + Math.cos(a) * lightRad);
      const ly = Math.round(cy + Math.sin(a) * lightRad);
      if (this.inBounds(lx, ly) && this.tiles[this.idx(lx, ly)].kind === 0) {
        this.tiles[this.idx(lx, ly)] = { kind: 8 as TileKind, biome: this.biomeId }; // Torch / glowing crystal
      }
    }

    // Spawn + stair-up at center.
    this.spawn = { x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2 };
    this.placeStair(cx, cy, "up");

    // Stair-down or grand reward chest at floor 13
    if (floor < 13) {
      let bestX = cx + 12,
        bestY = cy;
      let bestD = 0;
      for (let tries = 0; tries < 500; tries++) {
        const rx = 3 + Math.floor(this.rng(tries, 77) * (s - 6));
        const ry = 3 + Math.floor(this.rng(tries, 78) * (s - 6));
        if (this.tiles[this.idx(rx, ry)].kind !== 0) continue;
        const d = (rx - cx) * (rx - cx) + (ry - cy) * (ry - cy);
        if (d > bestD) {
          bestD = d;
          bestX = rx;
          bestY = ry;
        }
      }
      // Clear a safe path around the staircase down
      for (let yy = -1; yy <= 1; yy++) {
        for (let xx = -1; xx <= 1; xx++) {
          const ax = bestX + xx,
            ay = bestY + yy;
          if (this.inBounds(ax, ay)) {
            this.tiles[this.idx(ax, ay)] = { kind: 0 as TileKind, biome: this.biomeId };
          }
        }
      }
      this.placeStair(bestX, bestY, "down");
    } else {
      // Ultimate Grand Chest at floor 13!
      this.tiles[this.idx(cx + 1, cy)] = { kind: 12 as TileKind, biome: this.biomeId };
    }
  }
}

// -------- Entities --------
export type Vec = { x: number; y: number };

export type EnemyModifierId =
  | "igneo" // aura de fogo: causa DoT ao redor
  | "congelante" // desacelera o jogador ao acertar
  | "blindado" // +def massivo
  | "vampirico" // cura ao acertar o jogador
  | "rapido" // +speed
  | "colossal" // +HP muito maior
  | "cristalizado" // reflete parte do dano recebido
  | "aterrador" // reduz atk do jogador enquanto perto
  | "eletrizado" // solta raios em intervalos
  | "regenerador"; // regenera HP com o tempo

export type EnemyModifier = {
  id: EnemyModifierId;
  name: string;
  color: string;
};

export type Enemy = {
  id: number;
  pos: Vec;
  vel: Vec;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  level: number;
  name: string;
  biome: number;
  radius: number;
  color: string;
  isBoss: boolean;
  attackCd: number;
  hitFlash: number;
  // Elite / champion modifiers (roll on spawn). Elites são mais fortes e
  // dão drops melhores.
  modifiers?: EnemyModifier[];
  isElite?: boolean;
  isPurpleElite?: boolean;
  isMiningGuardian?: boolean;
  guardianOre?: string;
  isTrainingDummy?: boolean;
  // Timers internos usados por modificadores
  auraCd?: number;
  boltCd?: number;
  regenCd?: number;
  castTime?: number;
  castMax?: number;
  castType?: "smash" | "charge" | "eruption";
};

export const ENEMY_MODIFIERS: Record<EnemyModifierId, EnemyModifier> = {
  igneo: { id: "igneo", name: "Ígneo", color: "#ff6030" },
  congelante: { id: "congelante", name: "Congelante", color: "#60c0ff" },
  blindado: { id: "blindado", name: "Blindado", color: "#c0c0d0" },
  vampirico: { id: "vampirico", name: "Vampírico", color: "#c02040" },
  rapido: { id: "rapido", name: "Rápido", color: "#f0f060" },
  colossal: { id: "colossal", name: "Colossal", color: "#a06030" },
  cristalizado: { id: "cristalizado", name: "Cristalizado", color: "#a0e0ff" },
  aterrador: { id: "aterrador", name: "Aterrador", color: "#6020a0" },
  eletrizado: { id: "eletrizado", name: "Eletrizado", color: "#80e0ff" },
  regenerador: { id: "regenerador", name: "Regenerador", color: "#60f090" },
};

export function rollEnemyModifiers(
  isBoss: boolean,
  floor: number,
  biomeId?: number,
): EnemyModifier[] {
  // Chefes sempre têm 2 modificadores. Elites normais rolam raro.
  const ids = Object.keys(ENEMY_MODIFIERS) as EnemyModifierId[];
  const pool = [...ids];

  if (biomeId) {
    if ([10, 19, 40, 44, 55].includes(biomeId)) {
      pool.push("igneo", "igneo", "igneo"); // Favor volcanic fire
    } else if ([6, 7, 52].includes(biomeId)) {
      pool.push("congelante", "congelante", "congelante"); // Favor ice freeze
    } else if ([3, 4, 35, 54].includes(biomeId)) {
      pool.push("blindado", "colossal", "blindado", "colossal"); // Favor armored / colossal
    } else if ([5, 36, 58].includes(biomeId)) {
      pool.push("regenerador", "vampirico", "regenerador", "vampirico"); // Favor swamps regen / drain
    } else if ([14, 29, 30, 50, 60].includes(biomeId)) {
      pool.push("cristalizado", "eletrizado", "cristalizado", "eletrizado"); // Favor magical crystal / lightning
    }
  }

  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  const uniqueSelected: EnemyModifier[] = [];
  for (const id of shuffled) {
    if (!uniqueSelected.some((m) => m.id === id)) {
      uniqueSelected.push(ENEMY_MODIFIERS[id]);
      if (isBoss && uniqueSelected.length === 2) break;
      if (!isBoss && uniqueSelected.length === 2) break; // Collect enough candidates
    }
  }

  if (isBoss) {
    return uniqueSelected.slice(0, 2);
  }

  // 12% base + até +18% em andares altos = elite. Elites ganham 1-2 modificadores.
  const elitePct = 0.12 + Math.min(0.18, floor * 0.006);
  if (Math.random() > elitePct) return [];
  const count = Math.random() < 0.25 ? 2 : 1;
  return uniqueSelected.slice(0, count);
}

export type FloatingText = {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
};
export type Loot = { pos: Vec; item: Item; life: number };
export type Projectile = {
  pos: Vec;
  vel: Vec;
  life: number;
  damage: number;
  from: "player" | "enemy";
  kind?: string;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  grow?: number;
  gravity?: number;
  drag?: number;
};

export type Skill = {
  id: string;
  name: string;
  cost: number;
  cd: number;
  cur: number;
  desc: string;
  key: string;
};

export type PlayerClass =
  | "melee"
  | "magic"
  | "paladin"
  | "necro"
  | "archer"
  | "druid"
  | "assassin"
  | "warlock"
  | "samurai"
  | "monk"
  | "bard"
  | "gunslinger"
  | "alchemist"
  | "vampire"
  | "reaper"
  | "ecomancer"
  | "symbiote";
export const CLASS_INFO: Record<
  PlayerClass,
  {
    name: string;
    sprite: string;
    desc: string;
    base: { str: number; agi: number; int: number; vit: number; hp: number; mp: number };
  }
> = {
  melee: {
    name: "Guerreiro",
    sprite: "guerreiro",
    desc: "Combate corpo-a-corpo. Alto STR/VIT.",
    base: { str: 9, agi: 6, int: 3, vit: 8, hp: 130, mp: 30 },
  },
  magic: {
    name: "Mago",
    sprite: "mago",
    desc: "Magias arcanas. Alto INT.",
    base: { str: 3, agi: 5, int: 10, vit: 4, hp: 80, mp: 90 },
  },
  paladin: {
    name: "Paladino",
    sprite: "paladino",
    desc: "Guerreiro sagrado. Equilibrado.",
    base: { str: 7, agi: 4, int: 6, vit: 7, hp: 110, mp: 60 },
  },
  necro: {
    name: "Necromante",
    sprite: "necromante",
    desc: "Invoca aliados e drena vida. Alto INT.",
    base: { str: 3, agi: 4, int: 11, vit: 5, hp: 90, mp: 100 },
  },
  archer: {
    name: "Arqueiro",
    sprite: "arqueiro",
    desc: "Flechas rápidas de longo alcance. Alto AGI.",
    base: { str: 5, agi: 11, int: 4, vit: 5, hp: 95, mp: 45 },
  },
  druid: {
    name: "Druida",
    sprite: "guardiao-esmeralda",
    desc: "Magias da natureza e cura telúrica. Alto VIT/INT.",
    base: { str: 5, agi: 5, int: 7, vit: 7, hp: 115, mp: 65 },
  },
  assassin: {
    name: "Assassino",
    sprite: "assassino-sombrio",
    desc: "Ataques críticos furtivos e fumaça evasiva. Alto AGI.",
    base: { str: 6, agi: 12, int: 3, vit: 4, hp: 90, mp: 40 },
  },
  warlock: {
    name: "Bruxo",
    sprite: "bruxa",
    desc: "Maldições e drenos de alma das trevas. Alto INT.",
    base: { str: 3, agi: 4, int: 12, vit: 4, hp: 85, mp: 95 },
  },
  samurai: {
    name: "Samurai",
    sprite: "guerreiro",
    desc: "Cortes ultra velozes e contra-ataques precisos. Alto STR/AGI.",
    base: { str: 8, agi: 8, int: 3, vit: 5, hp: 105, mp: 45 },
  },
  monk: {
    name: "Monge",
    sprite: "anjo-do-alvorecer",
    desc: "Combate desarmado espiritual e escudos de Chi. Equilibrado.",
    base: { str: 6, agi: 6, int: 6, vit: 6, hp: 110, mp: 55 },
  },
  bard: {
    name: "Bardo",
    sprite: "bandoleiro",
    desc: "Melodias sonoras, buffs de velocidade e cura. Alto AGI/INT.",
    base: { str: 4, agi: 8, int: 8, vit: 4, hp: 100, mp: 70 },
  },
  gunslinger: {
    name: "Pistoleiro",
    sprite: "bandido",
    desc: "Armas de fogo de recarga rápida e granadas. Alto AGI.",
    base: { str: 5, agi: 12, int: 3, vit: 4, hp: 95, mp: 45 },
  },
  alchemist: {
    name: "Alquimista",
    sprite: "alquimista-amaldicoado",
    desc: "Poções de ácido, elixires mutagênicos e homúnculos. Alto INT.",
    base: { str: 4, agi: 5, int: 9, vit: 6, hp: 100, mp: 75 },
  },
  vampire: {
    name: "Vampiro",
    sprite: "assassino-sombrio",
    desc: "Dreno de sangue, morcegos e fúria noturna. Alto VIT/STR.",
    base: { str: 8, agi: 5, int: 4, vit: 8, hp: 120, mp: 50 },
  },
  reaper: {
    name: "Ceifador",
    sprite: "cavaleiro-fantasma",
    desc: "Foice de longo alcance, drenos de alma e aura da morte. Alto STR/INT.",
    base: { str: 8, agi: 4, int: 8, vit: 5, hp: 100, mp: 60 },
  },
  ecomancer: {
    name: "Ecomante",
    sprite: "echomancer",
    desc: "Grava ações como ecos temporais. Loop de combos que se auto-repetem.",
    base: { str: 4, agi: 8, int: 12, vit: 5, hp: 92, mp: 120 },
  },
  symbiote: {
    name: "Simbionte",
    sprite: "symbiote",
    desc: "Devora essências (Chama/Gelo/Sombra/Sangue) que mutam suas skills.",
    base: { str: 9, agi: 7, int: 8, vit: 8, hp: 115, mp: 75 },
  },
};

// Profession catalogue (mirrors src/game/crafting.ts)
export type Profession =
  | "ferreiro"
  | "alquimista"
  | "joalheiro"
  | "engenheiro"
  | "encantador"
  | "carpinteiro"
  | "cozinheiro"
  | "tecelao";
export const PROFESSION_LIST: Profession[] = [
  "ferreiro",
  "alquimista",
  "joalheiro",
  "engenheiro",
  "encantador",
  "carpinteiro",
  "cozinheiro",
  "tecelao",
];
export const PROFESSION_NAME: Record<Profession, string> = {
  ferreiro: "Ferreiro",
  alquimista: "Alquimista",
  joalheiro: "Joalheiro",
  engenheiro: "Engenheiro",
  encantador: "Encantador",
  carpinteiro: "Carpinteiro",
  cozinheiro: "Cozinheiro",
  tecelao: "Tecelão",
};

export type Minion = {
  pos: Vec;
  vel: Vec;
  target: number | null;
  hp: number;
  maxHp: number;
  life: number;
  kind: "skeleton";
  attackCd: number;
};

// Lazy accessor for overlay (equipped items + active pet) combat bonuses.
// Deferred to break the circular import risk between engine <-> rucoy/bridge
// (bridge imports from ./items which imports nothing here, but this keeps
// engine.ts side-effect free at module load).
type _OverlayCombat = {
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  petAttack: number;
  petDefense: number;
  petHp: number;
};
let _overlayBonusesFn: () => _OverlayCombat = () => ({
  attack: 0,
  defense: 0,
  hp: 0,
  mp: 0,
  petAttack: 0,
  petDefense: 0,
  petHp: 0,
});
function _overlayBonusesLazy(): _OverlayCombat {
  return _overlayBonusesFn();
}
export function _setOverlayBonusesProvider(fn: () => _OverlayCombat) {
  _overlayBonusesFn = fn;
}

export class Player {
  cls: PlayerClass = "melee";
  subClass?: string; // Subclass specialization (e.g. Muralha de Ferro, Mago Temporal, etc.)
  ascensionLvl = 1; // Ascension level (from 1 to 10) that can be upgraded
  skin = 0; // skin index 0..4
  pos: Vec = { x: 0, y: 0 };
  vel: Vec = { x: 0, y: 0 };
  speed = 3.2;
  hp = 100;
  maxHp = 100;
  mp = 50;
  maxMp = 50;
  shield = 30;
  maxShield = 30;
  shieldRechargeCd = 0;
  level = 1;
  xp = 0;
  xpNext = 1000;
  attr = { str: 5, agi: 5, int: 5, vit: 5 };
  attrPoints = 0;
  gold = 0;
  facing: Vec = { x: 1, y: 0 };
  attackCd = 0;
  invuln = 0;
  hitFlash = 0;
  // Applied HP/MP bonus from currently-equipped overlay items (see rucoy/bridge).
  // Tracked so we can diff maxHp/maxMp when the loadout changes each frame.
  overlayHpApplied = 0;
  overlayMpApplied = 0;
  inventory: Item[] = [];
  equipped: { weapon?: Item; armor?: Item; pickaxe?: Item } = {};
  // Orb inventory (see src/game/orbs.ts). Kept optional-shape so legacy saves still load.
  orbs: {
    comum: number;
    raro: number;
    epico: number;
    mitico: number;
    lendario: number;
    divino: number;
  } = { comum: 0, raro: 0, epico: 0, mitico: 0, lendario: 0, divino: 0 };
  // Mining progression
  miningLevel = 1;
  miningXp = 0;
  miningXpNext = 1200; // 30x mais difícil de subir de nível de mineração
  // Crafting progression
  professions: Record<Profession, { level: number; xp: number; xpNext: number }> = {
    ferreiro: { level: 1, xp: 0, xpNext: 60 },
    alquimista: { level: 1, xp: 0, xpNext: 60 },
    joalheiro: { level: 1, xp: 0, xpNext: 60 },
    engenheiro: { level: 1, xp: 0, xpNext: 60 },
    encantador: { level: 1, xp: 0, xpNext: 60 },
    carpinteiro: { level: 1, xp: 0, xpNext: 60 },
    cozinheiro: { level: 1, xp: 0, xpNext: 60 },
    tecelao: { level: 1, xp: 0, xpNext: 60 },
  };
  // Materials store: oreId/materialId -> count (kept out of the 32-slot bag)
  materials: Record<string, number> = {};
  // Discovered recipe ids
  recipesKnown: Set<string> = new Set();
  // Active companions (necromancer skeletons, etc.)
  minions: Minion[] = [];
  skills: Skill[] = [
    {
      id: "slash",
      name: "Golpe Giratório",
      cost: 8,
      cd: 0,
      cur: 0,
      desc: "Dano em área ao redor",
      key: "1",
    },
    { id: "bolt", name: "Raio Arcano", cost: 12, cd: 0, cur: 0, desc: "Projétil rápido", key: "2" },
    { id: "heal", name: "Cura Menor", cost: 15, cd: 0, cur: 0, desc: "Restaura HP", key: "3" },
    { id: "dash", name: "Investida", cost: 5, cd: 0, cur: 0, desc: "Impulso na direção", key: "4" },
  ];
  // Class unique resources & combos
  classResource = 0;
  classResourceMax = 100;
  comboCount = 0;
  comboTimer = 0;
  tempDmgMult = 1.0;
  // --- Onda 1: núcleo de status effects (ver src/game/statusEffects.ts) ---
  statusEffects: import("./statusEffects").StatusEffect[] = [];
  echoQueue: import("./statusEffects").EchoSlot[] = [];
  essences: import("./statusEffects").EssenceKind[] = [];
  essenceMax = 5;
  /** Grava a próxima skill lançada (Ecomante — Marcar Instante). */
  markedNextSkill: { power: number; expiresIn: number } | null = null;

  // Talent tree state (see src/game/talents.ts). Ranks per node id.
  talents: Record<string, number> = {};
  talentPoints = 0;
  // Aggregated talent bonuses (recomputed via recomputeTalentBonuses in game.ts on change)
  talentBonuses = {
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
  // Persistent achievements statistics and multipliers
  achievementBonuses = {
    unlockedCount: 0,
    dmgMult: 1.0,
    strBonus: 0,
    vitBonus: 0,
    intBonus: 0,
    agiBonus: 0,
    critBonus: 0,
    miningSpeedMult: 1.0,
    extraHp: 0,
    extraMp: 0,
    defMult: 1.0,
    potionBonus: 1.0,
    hpRegen: 0,
  };
  // ---- Underwater & Diving Mechanics ----
  isUnderwater = false;
  oxygen = 100;
  maxOxygen = 100;
  divingGearLevel = { oxygen: 1, pressure: 1, fins: 1 };
  underwaterSkills = { lung: 0, pressureRes: 0, tideNav: 0, currentForce: 0 };
  underwaterLevel = 1;
  underwaterXp = 0;
  underwaterXpNext = 500;
  ancientRelics = 0;
  _floaterTimer = 0;
  underwaterSkillPoints = 0;

  // ---- Ancient Runes ----
  runes: OwnedRune[] = []; // inventário de runas
  equippedRunes: (OwnedRune | null)[] = [null, null, null]; // 3 slots
  runeBonuses: RuneBonuses = { ...RUNE_ZERO };
  recomputeRuneBonuses() {
    const eq = this.equippedRunes.filter((r): r is OwnedRune => !!r);
    this.runeBonuses = aggregateRuneBonuses(eq);
  }
  getEquippedSet(): string | null {
    const wName = this.equipped.weapon?.name;
    const aName = this.equipped.armor?.name;
    if (!wName || !aName) return null;
    const sets = [
      "de Ferro",
      "do Vento",
      "das Sombras",
      "da Aurora",
      "do Trovão",
      "do Vazio",
      "Rúnico",
      "Ancestral",
      "do Dragão",
      "Estelar",
    ];
    for (const s of sets) {
      if (wName.includes(s) && aName.includes(s)) {
        return s;
      }
    }
    return null;
  }
  atk() {
    const wpn = Math.floor((this.equipped.weapon?.power ?? 0) / 4);
    let baseAtk = Math.floor(
      (this.attr.str + this.achievementBonuses.strBonus) * 2 + wpn + this.level,
    );

    // Item Set Bonuses
    const activeSet = this.getEquippedSet();
    if (activeSet === "Ancestral") baseAtk = Math.floor(baseAtk * 1.15);
    if (activeSet === "Estelar") baseAtk = Math.floor(baseAtk * 1.15);

    const overlay = _overlayBonusesLazy();
    let total = Math.floor(
      baseAtk *
        this.achievementBonuses.dmgMult *
        (this.talentBonuses?.dmgMult ?? 1) *
        (this.runeBonuses?.dmgMult ?? 1),
    );

    // Sub-class ATK boost (30%)
    const atkSubs = ["Carrasco Sangrento", "Mago do Caos", "Inquisidor", "Ceifador do Medo", "Franco-Atirador", "Estrategista Elemental", "Lâmina Sombria", "Lorde Demônio", "Ronin Desgarrado", "Mestre do Punho", "Voz da Tempestade", "Pistoleiro Errante", "Sombrio", "Cria do Abismo", "Teclador Temporal", "Devorador"];
    if (this.subClass && atkSubs.includes(this.subClass)) {
      total = Math.floor(total * 1.30);
    }

    // Ascension multiplier (15% per level above 1)
    if (this.ascensionLvl && this.ascensionLvl > 1) {
      total = Math.floor(total * (1 + (this.ascensionLvl - 1) * 0.15));
    }

    return total + overlay.attack;
  }
  def() {
    const arm = Math.floor((this.equipped.armor?.power ?? 0) / 4);
    let baseDef = Math.floor((this.attr.vit + this.achievementBonuses.vitBonus) * 1.5 + arm);

    // Item Set Bonuses
    const activeSet = this.getEquippedSet();
    if (activeSet === "Ancestral") baseDef = Math.floor(baseDef * 1.15);
    if (activeSet === "de Ferro") baseDef += 25;
    if (activeSet === "Estelar") baseDef = Math.floor(baseDef * 1.15);

    const overlay = _overlayBonusesLazy();
    let totalDef = Math.floor(baseDef * this.achievementBonuses.defMult * (this.runeBonuses?.defMult ?? 1));

    // Sub-class DEF boost (30%)
    const defSubs = ["Muralha de Ferro", "Guardião da Luz", "Defensor Arcano", "Mestre de Runas", "Bastião Divino", "Guardião da Vida", "Arauto da Luz", "Feiticeiro Rúnico", "Sombra Evasiva", "Sacerdote das Almas", "Protetor do Vento", "Doutor da Peste", "Barreira Sagrada", "Ecomante de Pedra", "Casca Blindada"];
    if (this.subClass && defSubs.includes(this.subClass)) {
      totalDef = Math.floor(totalDef * 1.30);
    }

    // Ascension multiplier (15% per level above 1)
    if (this.ascensionLvl && this.ascensionLvl > 1) {
      totalDef = Math.floor(totalDef * (1 + (this.ascensionLvl - 1) * 0.15));
    }

    return totalDef + overlay.defense;
  }
  gainXp(amount: number, log: (m: string, c?: string) => void) {
    // 2x easier leveling: doubled XP + softer curve growth
    const mult = this.runeBonuses?.xpMult ?? 1;
    this.xp += amount * 2 * mult;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.attrPoints += 5;
      this.talentPoints += 1;
      this.xpNext = Math.floor(this.xpNext * 1.22 + 250);
      this.maxHp += 15;
      this.hp = this.maxHp;
      this.maxMp += 5;
      this.mp = this.maxMp;
      log(
        `Subiu para o nível ${this.level}! +5 pontos de atributo, +1 ponto de talento.`,
        "#f0b040",
      );
    }
  }
  gainMiningXp(amount: number, log: (m: string, c?: string) => void) {
    // Mining overhaul: 3x XP + softer curve
    this.miningXp += amount * 3;
    while (this.miningXp >= this.miningXpNext && this.miningLevel < 999) {
      this.miningXp -= this.miningXpNext;
      this.miningLevel++;
      // Curva 30x maior (multiplicador base ajustado para manter progressão exponencial)
      this.miningXpNext = Math.floor(this.miningXpNext * 1.08 + 240);
      log(`Mineração subiu para nível ${this.miningLevel}!`, "#8fcfff");
    }
  }
  gainProfessionXp(prof: Profession, amount: number, log: (m: string, c?: string) => void) {
    const p = this.professions[prof];
    // Crafting overhaul: 3x profession XP + softer curve
    p.xp += amount * 3;
    while (p.xp >= p.xpNext && p.level < 999) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = Math.floor(p.xpNext * 1.1 + 15);
      log(`${PROFESSION_NAME[prof]} subiu para nível ${p.level}!`, "#f0b040");
    }
  }
}

// Extended item metadata for the crafting/enchant/gem system.
// Kept optional so legacy items keep working.
export type Enchant =
  | "fogo"
  | "gelo"
  | "veneno"
  | "luz"
  | "sombra"
  | "raio"
  | "sangramento"
  | "vampirismo"
  | "critico"
  | "velocidade"
  | "mana"
  | "hp";
export const ENCHANT_COLOR: Record<Enchant, string> = {
  fogo: "#ff7040",
  gelo: "#7fd8ff",
  veneno: "#80e060",
  luz: "#fff0a0",
  sombra: "#a060ff",
  raio: "#ffe040",
  sangramento: "#ff4060",
  vampirismo: "#c04070",
  critico: "#ff9040",
  velocidade: "#80ffe0",
  mana: "#6080ff",
  hp: "#60ff80",
};
export type ItemQuality =
  | "comum"
  | "bom"
  | "excelente"
  | "perfeito"
  | "obra-prima"
  | "lendario"
  | "divino";
export const QUALITY_MULT: Record<ItemQuality, number> = {
  comum: 1,
  bom: 1.15,
  excelente: 1.35,
  perfeito: 1.6,
  "obra-prima": 1.95,
  lendario: 2.5,
  divino: 3.2,
};
export const QUALITY_COLOR: Record<ItemQuality, string> = {
  comum: "#c8c8c8",
  bom: "#5ecf5e",
  excelente: "#5ea8ff",
  perfeito: "#c25ef0",
  "obra-prima": "#ff8060",
  lendario: "#f0b040",
  divino: "#fff080",
};
export type ExtItem = Item & {
  quality?: ItemQuality;
  enchant?: Enchant;
  gems?: string[]; // gem ids socketed
  slots?: number; // gem slots
  evolution?: number; // +0..+6 (Suprema/Mítica/Lendária/Divina)
  isPickaxe?: boolean;
  pickaxeTier?: number; // 1..10
  isCraftable?: boolean;
};

export type SkinInfo = {
  name: string;
  description: string;
};

export const CLASS_SKINS: Record<PlayerClass, SkinInfo[]> = {
  melee: [
    { name: "Guerreiro Clássico", description: "Armadura de ferro clássica com capa vermelha." },
    {
      name: "Berserker de Lava",
      description: "Forjado no fogo vulcânico. Libera fumaça e brasas.",
    },
    {
      name: "Sombra do Vazio",
      description: "Armadura negra com detalhes em roxo neon e capa estelar.",
    },
    {
      name: "Cavaleiro Celestial",
      description: "Armadura de ouro polido brilhante e auréola de luz.",
    },
    {
      name: "Cyber Mecha v5",
      description: "Armadura futurista de liga de titânio com energia ciano e faíscas.",
    },
    {
      name: "Cyber-Arcano",
      description: "Armadura holográfica ciano-magenta com runas neon e cristais de dados.",
    },
  ],
  magic: [
    { name: "Mago Arcano", description: "Manto tradicional azul com runas douradas de pura mana." },
    {
      name: "Lorde da Tempestade",
      description: "Manto azul-escuro crepitando com eletricidade estática.",
    },
    {
      name: "Mestre Piroclástico",
      description: "Túnica de cinzas com brasas flutuantes e olhos de lava.",
    },
    {
      name: "Invocador Estelar",
      description: "Manto cósmico com constelações móveis e poeira estelar.",
    },
    {
      name: "Tejedor do Tempo",
      description: "Engrenagens de bronze giram atrás de sua cabeça ritmicamente.",
    },
    {
      name: "Cyber-Arcano",
      description: "Robes holográficos com HUD arcano e cajado de luz neon.",
    },
  ],
  paladin: [
    {
      name: "Paladino Sagrado",
      description: "Placa prateada polida com o emblema do Sol dourado.",
    },
    {
      name: "Campeão do Crepúsculo",
      description: "Armadura índigo-escura com runas de luar que brilham na noite.",
    },
    {
      name: "Guardião Esmeralda",
      description: "Feito de casca de árvore viva com pétalas verdes flutuantes.",
    },
    {
      name: "Fênix Vitoriosa",
      description: "Ombreiras de asas flamejantes e halo solar radiante.",
    },
    {
      name: "Defensor de Ébano",
      description: "Armadura de mármore negro com asas de pura energia branca.",
    },
    {
      name: "Cyber-Arcano",
      description: "Placas cromadas holográficas com cruz de energia dourado-neon.",
    },
  ],
  necro: [
    {
      name: "Necromante Sombrio",
      description: "Manto púrpura clássico e máscara de crânio assustadora.",
    },
    {
      name: "Lich Glacial",
      description: "Ossos congelados emitindo uma névoa cyan de frio eterno.",
    },
    {
      name: "Ceifador de Almas",
      description: "Capa cinza rasgada cercada por almas verdes flutuantes.",
    },
    {
      name: "Vampiro Sanguinário",
      description: "Armadura carmesim elegante cercada por esferas de sangue vivo.",
    },
    {
      name: "Necrogolem Tóxico",
      description: "Chassi de cobre com cilindros de lodo verde fluorescente.",
    },
    {
      name: "Cyber-Arcano",
      description: "Crânio holográfico neon com almas-dados verde-magenta em órbita.",
    },
  ],
  archer: [
    {
      name: "Arqueiro da Floresta",
      description: "Traje de couro folhado verde perfeito para camuflagem.",
    },
    {
      name: "Sentinela da Noite",
      description: "Couro negro e roxo com olhos de felino brilhantes.",
    },
    { name: "Falcão do Sol", description: "Manto de penas douradas e arco flamejante." },
    {
      name: "Arqueiro Fantasma",
      description: "Corpo translúcido de ectoplasma ciano com rastro fantasmagórico.",
    },
    {
      name: "Atirador Estelar",
      description: "Arco de safira estelar que atira flechas que deixam rastro de meteoro.",
    },
    {
      name: "Cyber-Arcano",
      description: "Arco de energia neon com flechas de dados holográficos ciano-rosa.",
    },
  ],
  druid: [
    {
      name: "Guardião de Esmeralda",
      description: "Armadura de cipó e ametista viva brilhando com sementes de vida.",
    },
    {
      name: "Treant Jovem",
      description: "Corpo feito de pura casca de carvalho antigo com olhos de pura luz esmeralda.",
    },
    {
      name: "Aranha de Raízes",
      description: "Simbiose com a rainha aracnídea das raízes profundas de Asterion.",
    },
    {
      name: "Broto Corrompido",
      description: "Uma planta selvagem das profundezas que brilha com lodo purpúreo.",
    },
    {
      name: "Espírito Divino",
      description: "Pura energia telúrica da terra com folhas flutuando ao redor.",
    },
    {
      name: "Cyber-Arcano",
      description: "Bio-planta neon com veias holográficas verdes e flores de luz.",
    },
  ],
  assassin: [
    {
      name: "Assassino das Sombras",
      description: "Manto de seda da noite e adagas banhadas em veneno lunar.",
    },
    {
      name: "Lorde dos Ladrões",
      description: "Visual clássico de bandido elegante com capa vermelha e máscara.",
    },
    {
      name: "Ninja de Elite",
      description: "Traje ninja de couro cinza furtivo, emanando pequenas fumaças escuras.",
    },
    {
      name: "Duque do Deserto",
      description: "Bandoleiro com lenço e armadura leve de escamas de escorpião real.",
    },
    {
      name: "Elfo Renegado",
      description: "Orelhas pontudas, olhos ciano brilhantes e armadura de aço negro.",
    },
    {
      name: "Cyber-Arcano",
      description: "Capuz holográfico com máscara neon e adagas de laser magenta.",
    },
  ],
  warlock: [
    {
      name: "Mago Herege",
      description: "Toga rasgada crepitando com chamas do purgatório e runas proibidas.",
    },
    {
      name: "Alquimista do Caos",
      description: "Máscara de peste preta, cinto de frascos tóxicos e fumaça roxa.",
    },
    {
      name: "Inquisidor Sepulto",
      description: "Armadura de ossos antigos e correntes enferrujadas.",
    },
    {
      name: "Aberrante Sombrio",
      description: "O próprio caos encarnado com tentáculos de sombras virtuais.",
    },
    {
      name: "Sombra Abissal",
      description: "Um ser sem rosto composto por fumaça roxo-escura crepitante.",
    },
    {
      name: "Cyber-Arcano",
      description: "Manto de código roxo-neon corrupto com olho de dados abissais.",
    },
  ],
  samurai: [
    {
      name: "Ronin sem Mestre",
      description: "Quimono rasgado, chapéu de palha tradicional e katana afiada.",
    },
    {
      name: "Guerreiro Celestial",
      description: "Armadura samurai de prata com detalhes em asas de anjo solar.",
    },
    {
      name: "General Caído",
      description: "Armadura corrompida com máscara de demônio (Oni) vermelha assustadora.",
    },
    {
      name: "Espadachim do Sol",
      description: "Armadura dourada radiante com faíscas de luz divina solar.",
    },
    {
      name: "Anão com Katana",
      description: "Visual robusto com barba longa, armadura rústica e duas espadas cruzadas.",
    },
    {
      name: "Cyber-Arcano",
      description: "Armadura samurai neon com katana de plasma magenta e HUD holográfico.",
    },
  ],
  monk: [
    {
      name: "Monge da Alvorada",
      description: "Visual tradicional de robes laranjas com braceletes de ouro puro.",
    },
    {
      name: "Asceta de Jade",
      description: "Contas de oração gigantes de jade e punhos emitindo névoa verde.",
    },
    {
      name: "Faraó de Ouro",
      description: "Coroa de ouro real e robes brancos de linho fino egípcio.",
    },
    {
      name: "Guerreiro do Chi",
      description: "Tatuagens brilhantes pelo corpo todo reagindo a cada ataque.",
    },
    {
      name: "Mestre Espiritual",
      description: "Robes azul-claros com um halo circular de energia flutuando atrás.",
    },
    {
      name: "Cyber-Arcano",
      description: "Robes holográficos com tatuagens neon reativas e halo de circuito.",
    },
  ],
  bard: [
    {
      name: "Menestrel Errante",
      description: "Traje festivo verde e amarelo, penas no chapéu e alaúde mágico.",
    },
    {
      name: "Arqueiro Lírico",
      description: "Armadura leve azulada com detalhes de harpa banhada a prata.",
    },
    {
      name: "Sinfonista Cósmico",
      description: "Visual galáctico com notas musicais luminosas orbitando o corpo.",
    },
    {
      name: "Rapsodista Sombrio",
      description: "Visual gótico com violoncelo de osso e aura de lamento.",
    },
    {
      name: "Trovador Divino",
      description: "Manto branco angelical com auréola tocando música sacra divina.",
    },
    {
      name: "Cyber-Arcano",
      description: "Traje neon com sintetizador holográfico e ondas sonoras coloridas.",
    },
  ],
  gunslinger: [
    {
      name: "Pistoleiro de Asterion",
      description: "Sobretudo marrom clássico, chapéu de caubói e coldres duplos.",
    },
    {
      name: "Bandoleiro de Aço",
      description: "Armadura de placas leves com fardas militares cinzas futuristas.",
    },
    {
      name: "Atirador Renegado",
      description: "Visual fora da lei com máscara de caveira e poncho esfarrapado.",
    },
    {
      name: "Xerife Estelar",
      description: "Estrela brilhante no peito e óculos de proteção tecnológica neon.",
    },
    {
      name: "Caçador Cibernético",
      description: "Visor holográfico vermelho e braço mecânico de titânio.",
    },
    {
      name: "Cyber-Arcano",
      description: "Sobretudo neon-magenta com pistolas de plasma e HUD holográfico.",
    },
  ],
  alchemist: [
    {
      name: "Alquimista de Asterion",
      description: "Robes com avental de couro cheio de bolsos e óculos de cientista.",
    },
    {
      name: "Cientista Mutante",
      description: "Pele esverdeada e tubos borbulhantes de lodo verde nas costas.",
    },
    {
      name: "Vidreiro Imperial",
      description: "Armadura leve feita de frascos e vidros cristalinos indestrutíveis.",
    },
    {
      name: "Homúnculo de Cobre",
      description: "Ser mecânico feito de cobre e engrenagens movidas a fogo alquímico.",
    },
    {
      name: "Mineiro Químico",
      description: "Capacete com lanterna acesa e picareta de esmeralda viva.",
    },
    {
      name: "Cyber-Arcano",
      description: "Frascos holográficos neon com reagentes de luz e visor de dados.",
    },
  ],
  vampire: [
    {
      name: "Conde Sangrento",
      description: "Manto negro com gola alta vermelha e dentes caninos salientes.",
    },
    {
      name: "Guerreiro da Noite",
      description: "Armadura de placas pretas refinadas com detalhes de sangue brilhante.",
    },
    {
      name: "Múmia Vampírica",
      description: "Enfaixado em tiras de linho carmesim exalando névoa de sangue.",
    },
    {
      name: "Lobo de Sangue",
      description: "Visual híbrido de lobo sombrio com olhos vermelhos furiosos.",
    },
    {
      name: "Sombra Sedenta",
      description: "Ectoplasma translúcido vermelho-sangue que flutua elegantemente.",
    },
    {
      name: "Cyber-Arcano",
      description: "Manto neon-magenta com cristais de sangue holográficos flutuantes.",
    },
  ],
  reaper: [
    {
      name: "Ceifador de Almas",
      description: "Manto rasgado cinza escuro, capuz cobrindo o rosto e foice gigante.",
    },
    {
      name: "Almirante Fantasma",
      description: "Uniforme naval desgastado, chapéu de capitão pirata e aura ciano.",
    },
    {
      name: "Faraó Ressurgido",
      description: "Máscara mortuária egípcia e cetros da morte cruzados.",
    },
    {
      name: "Guerreiro Espectral",
      description: "Armadura de ossos flutuantes envolta por almas penadas gritando.",
    },
    {
      name: "Lich da Foice",
      description: "Olhos cyan flutuantes sob um capuz de espinhos glaciais.",
    },
    {
      name: "Cyber-Arcano",
      description: "Manto holográfico com foice de plasma neon e almas de dados verdes.",
    },
  ],
  ecomancer: [
    {
      name: "Paradoxo Prima",
      description: "Robes ciano com diapasão temporal dourado. Ecos visíveis pulsam ao redor.",
    },
    {
      name: "Linha Fantasma",
      description: "Robes brancos etéreos com clones translúcidos flutuando de forma sincronizada.",
    },
    {
      name: "Eco Sombrio",
      description: "Robes negros com ecos violeta e olhos brilhando com paradoxo puro.",
    },
    {
      name: "Ressonância Áurea",
      description: "Robes dourados com anéis giratórios de energia cristalina.",
    },
    {
      name: "Fratura Rosa",
      description: "Robes rosa-magenta com fraturas holográficas mostrando linhas do tempo.",
    },
    {
      name: "Cyber-Arcano",
      description: "Robes neon ciano-magenta com HUD de linha do tempo e ecos digitais.",
    },
  ],
  symbiote: [
    {
      name: "Verde Primordial",
      description: "Corpo simbiótico verde com veias violeta pulsando with essências.",
    },
    {
      name: "Simbionte Escarlate",
      description: "Pele carmesim com filamentos verdes que absorvem tudo.",
    },
    {
      name: "Praga Bioluminescente",
      description: "Verde-abissal com brilho ciano — parasitas iluminam a noite.",
    },
    {
      name: "Casulo Dourado",
      description: "Simbionte dourado que estoca essências como joias vivas.",
    },
    { name: "Aberração Vazia", description: "Corpo sombrio com tentáculos de vazio puro." },
    {
      name: "Cyber-Arcano",
      description: "Bio-simbionte neon com essências holográficas e olho de código verde.",
    },
  ],
};

// Dynamically append the 7th skin (index 6, Celestial Astral) for all classes
for (const cls of Object.keys(CLASS_SKINS) as PlayerClass[]) {
  if (CLASS_SKINS[cls]) {
    CLASS_SKINS[cls].push({
      name: "Celestial Astral",
      description: "Soberano Cósmico trajando armadura de galáxias espirais e estrelas pulsantes criada por IA.",
    });
    CLASS_SKINS[cls].push({
      name: "Eclipse Eterno",
      description: "Soberano do Crepúsculo trajando uma armadura de vácuo estelar com uma coroa de chamas solares negras procedurais e transparentes.",
    });
  }
}

// Extra biomes registered statically above
