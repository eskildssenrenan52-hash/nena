import type { Biome } from "./engine";

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

export const NEW_ISLANDS_BIOMES: Biome[] = [];

// Configurations for the 10 new islands (Islands 5 to 14)
const islandsConfig = [
  {
    num: 5,
    startId: 601,
    name: "Jade Phoenix",
    dangerStart: 250,
    monsters: [
      "Fênix de Jade",
      "Guerreiro de Jade",
      "Víbora Esmeralda",
      "Espírito de Vento",
      "Ancião do Vento",
      "Guardião de Jade",
    ],
    bosses: [
      "Fênix Divina de Jade",
      "Imperador Qin Corrompido",
      "Coração Esmeralda",
      "Gólem de Jade Ancestral",
    ],
    colors: ["#2d5a27", "#1e4a1a", "#1a3e16", "#3f6a39"],
    accents: ["#0f2e0f", "#081a08", "#122a12"],
    caveFloors: ["#0a180d", "#0e2012"],
    caveWalls: ["#030804", "#050b06"],
    caveAccents: ["#40a060", "#50c080"],
  },
  {
    num: 6,
    startId: 701,
    name: "Frost Silver",
    dangerStart: 300,
    monsters: [
      "Espectro de Prata",
      "Golem de Gelo",
      "Lobo de Gelo Titânico",
      "Gargula Glacial",
      "Anão Prateado",
      "Xamã Rúnico",
    ],
    bosses: [
      "Lich de Prata Cósmico",
      "Imperador do Gelo Sombrio",
      "Coração Congelado",
      "Titã de Cristal de Gelo",
    ],
    colors: ["#d0e8f0", "#a0c8d8", "#b0d0e0", "#8fa8b8"],
    accents: ["#405868", "#304850", "#203038"],
    caveFloors: ["#141c22", "#101820"],
    caveWalls: ["#080a0e", "#040608"],
    caveAccents: ["#80c0f0", "#a0e0ff"],
  },
  {
    num: 7,
    startId: 801,
    name: "Solar Dragon",
    dangerStart: 350,
    monsters: [
      "Serpente Solar",
      "Escaravelho de Ouro",
      "Múmia Cósmica",
      "Gólem Solar",
      "Sacerdote do Sol",
      "Cão Solar",
    ],
    bosses: [
      "Faraó Solar de Asterion",
      "Serafim Solar",
      "Dragão Solar Supremo",
      "Colosso Solar de Ouro",
    ],
    colors: ["#ffd700", "#ffaa00", "#ff8c00", "#e5c158"],
    accents: ["#663c00", "#552000", "#441000"],
    caveFloors: ["#261a08", "#221100"],
    caveWalls: ["#0e0802", "#0c0400"],
    caveAccents: ["#ffa500", "#ff8c00"],
  },
  {
    num: 8,
    startId: 901,
    name: "Blood Serpent",
    dangerStart: 400,
    monsters: [
      "Sanguessuga Gigante",
      "Zumbi Sanguinolento",
      "Lobisomem de Sangue",
      "Fada de Sangue",
      "Vampiro de Elite",
      "Gárgula de Sangue",
    ],
    bosses: [
      "Conde de Sangue Carmesim",
      "Coração Sanguinário",
      "Grande Hidra Carmesim",
      "Víbora de Sangue Suprema",
    ],
    colors: ["#8b0000", "#a52a2a", "#b22222", "#4a0000"],
    accents: ["#3a0000", "#2a0000", "#1a0000"],
    caveFloors: ["#1a0404", "#150202"],
    caveWalls: ["#080000", "#050000"],
    caveAccents: ["#ff3333", "#ff0000"],
  },
  {
    num: 9,
    startId: 1001,
    name: "Astral Abyss",
    dangerStart: 450,
    monsters: [
      "Eco do Abismo",
      "Plasma Astral",
      "Tejedor de Estrelas",
      "Fera de Vácuo",
      "Andarilho Estelar",
      "Sombra Cósmica",
    ],
    bosses: [
      "Lorde do Caos Cósmico",
      "Vórtice do Abismo",
      "Olho Cósmico Sagrado",
      "Faraó Estelar Ancião",
    ],
    colors: ["#483d8b", "#4b0082", "#191970", "#3a1a5a"],
    accents: ["#10082a", "#0d0420", "#090118"],
    caveFloors: ["#0b0314", "#08010f"],
    caveWalls: ["#040108", "#020004"],
    caveAccents: ["#9400d3", "#ba55d3"],
  },
  {
    num: 10,
    startId: 1101,
    name: "Siren Archipelago",
    dangerStart: 500,
    monsters: [
      "Sereia Cantora",
      "Caranguejo Hidro",
      "Tratador de Recifes",
      "Tubarão Abissal",
      "Peixe Lanterna",
      "Açoite do Oceano",
    ],
    bosses: [
      "Leviatã da Ilha Cantora",
      "Rainha Sereia do Mar do Sul",
      "Ondina de Plasma",
      "Kraken Abissal de Ouro",
    ],
    colors: ["#20b2aa", "#008b8b", "#008080", "#00ced1"],
    accents: ["#004d4d", "#003333", "#001a1a"],
    caveFloors: ["#05181a", "#021014"],
    caveWalls: ["#01080a", "#000406"],
    caveAccents: ["#48d1cc", "#00ffff"],
  },
  {
    num: 11,
    startId: 1201,
    name: "Sacred Profane",
    dangerStart: 550,
    monsters: [
      "Querubim Divino",
      "Inquisidor do Caos",
      "Demônio Caído",
      "Anjo Sombrio",
      "Gárgula de Éter",
      "Harpia do Éden",
    ],
    bosses: [
      "Serafim Sombrio Renegado",
      "Rei do Trono Profano",
      "Estátua do Arcanjo",
      "Juiz de Asterion Corrompido",
    ],
    colors: ["#4a2f50", "#d8b4f8", "#ffe4e1", "#2e1a47"],
    accents: ["#1d002a", "#301934", "#1a0f1d"],
    caveFloors: ["#15091a", "#0f0412"],
    caveWalls: ["#08020e", "#05010a"],
    caveAccents: ["#da70d6", "#dda0dd"],
  },
  {
    num: 12,
    startId: 1301,
    name: "Spiral Shell",
    dangerStart: 600,
    monsters: [
      "Amolita do Abismo",
      "Aranha Nautilo",
      "Sereia das Profundezas",
      "Molusco Flamejante",
      "Xamã da Maré",
      "Verme de Concha",
    ],
    bosses: [
      "Coração do Coral Primordial",
      "Imperatriz Amolita Suprema",
      "Leviatã em Espiral",
      "Kraken Sombrio das Conchas",
    ],
    colors: ["#b0c4de", "#4682b4", "#5f9ea0", "#778899"],
    accents: ["#2c3e50", "#1f2c39", "#111b24"],
    caveFloors: ["#0e161c", "#0a1014"],
    caveWalls: ["#04080a", "#020406"],
    caveAccents: ["#87cefa", "#b0e0e6"],
  },
  {
    num: 13,
    startId: 1401,
    name: "Cosmic Infinity",
    dangerStart: 650,
    monsters: [
      "Espectro do Tempo",
      "Anomalia Cíclica",
      "Vigia Temporal",
      "Servo do Paradoxo",
      "Tejedor do Infinito",
      "Plasma Eterno",
    ],
    bosses: [
      "Guardião do Infinito Supremo",
      "Fênix do Loop Temporal",
      "Relógio Cósmico Divino",
      "Balrog do Espaço-Tempo",
    ],
    colors: ["#2f4f4f", "#1a2421", "#334c44", "#121a18"],
    accents: ["#08100e", "#050807", "#010302"],
    caveFloors: ["#040c0a", "#020806"],
    caveWalls: ["#010403", "#000201"],
    caveAccents: ["#3cb371", "#2e8b57"],
  },
  {
    num: 14,
    startId: 1501,
    name: "Void Maw",
    dangerStart: 700,
    monsters: [
      "Fera do Vazio Supremo",
      "Plasma da Destruição",
      "Sombra de Oblivion",
      "Golem de Matéria Escura",
      "Servo da Aniquilação",
      "Vigia de Trígono",
    ],
    bosses: [
      "Aethes, o Caos Primordial",
      "Olho de Oblivion Divino",
      "Colosso do Vazio Infinito",
      "Ceifador do Vazio Supremo",
    ],
    colors: ["#2e2d2d", "#1a1a1a", "#0f0f0f", "#3a3a3a"],
    accents: ["#080808", "#030303", "#000000"],
    caveFloors: ["#050505", "#020202"],
    caveWalls: ["#010101", "#000000"],
    caveAccents: ["#ff003c", "#d10000"],
  },
];

// 40 unique adjectives to ensure high variation in biome naming!
const adjectives = [
  "Abissal",
  "Ancestral",
  "Místico",
  "Nebuloso",
  "Proibido",
  "Amaldiçoado",
  "Sagrado",
  "Profano",
  "Primordial",
  "Sombrio",
  "Crematório",
  "Glacial",
  "Infernal",
  "Celestial",
  "Caótico",
  "Radiante",
  "Espectral",
  "Cristalino",
  "Dourado",
  "Sanguinário",
  "Eterno",
  "Fantasgórico",
  "Sibilante",
  "Voltaico",
  "Esmagador",
  "Ruinoso",
  "Oculto",
  "Profundo",
  "Devastador",
  "Cósmico",
  "Gótico",
  "Titânico",
  "Vulcânico",
  "Lendário",
  "Elemental",
  "Monstruoso",
  "Subterrâneo",
  "Solar",
  "Marinho",
  "Paradoxal"
];

for (const config of islandsConfig) {
  for (let i = 0; i < 30; i++) {
    const id = config.startId + i;
    const adj = adjectives[i % adjectives.length];

    const color = config.colors[i % config.colors.length];
    const accent = config.accents[i % config.accents.length];
    const floorColor = config.caveFloors[i % config.caveFloors.length];
    const wallColor = config.caveWalls[i % config.caveWalls.length];
    const caveAccent = config.caveAccents[i % config.caveAccents.length];

    const danger = config.dangerStart + i * 2;

    const monsters = [
      config.monsters[i % config.monsters.length],
      config.monsters[(i + 1) % config.monsters.length],
      config.monsters[(i + 2) % config.monsters.length],
    ];

    const boss = config.bosses[i % config.bosses.length];

    const name = `Ilha ${config.num}: ${config.name} ${adj}`;
    const caveLabel = `Subsolo de ${config.name} ${adj}`;

    NEW_ISLANDS_BIOMES.push({
      id,
      name,
      color,
      accent,
      danger,
      monsters,
      boss,
      caveTheme: ct(
        caveLabel,
        floorColor,
        wallColor,
        caveAccent,
        [
          `Mula de ${config.name} ${adj}`,
          `Servo de ${config.name} ${adj}`,
          `Xamã de ${config.name} ${adj}`,
        ],
        `Sombra de ${boss}`,
      ),
    });
  }
}

// ─── DEFINIÇÃO DINÂMICA DAS 20 NOVAS ILHAS (15 A 34) ───
const islands15_34Config = [
  { num: 15, name: "Valyria Astral", dangerStart: 250, colors: ["#1e1b4b", "#311042"], accents: ["#120e2e"], caveFloors: ["#0b0826"], caveWalls: ["#050314"], caveAccents: ["#818cf8"], monsters: ["Espírito Astral", "Guerreiro Estelar", "Vigia do Vácuo"], bosses: ["Astraea, Imperatriz das Estrelas", "Cometa Ancião", "Colosso Estelar", "Serafim do Limbo"] },
  { num: 16, name: "Névoa Profunda", dangerStart: 270, colors: ["#111827", "#1f2937"], accents: ["#030712"], caveFloors: ["#090d16"], caveWalls: ["#02040a"], caveAccents: ["#9ca3af"], monsters: ["Aparição Sombria", "Ladrão de Almas", "Limo Nebuloso"], bosses: ["Gloomshade, o Devorador de Luz", "Espectro Ancestral", "Cão Sombrio", "Coração das Trevas"] },
  { num: 17, name: "Magma Ancestral", dangerStart: 290, colors: ["#7f1d1d", "#991b1b"], accents: ["#450a0a"], caveFloors: ["#2d0505"], caveWalls: ["#180000"], caveAccents: ["#ef4444"], monsters: ["Salamandra de Fogo", "Gólem de Lava", "Elemental Ígneo"], bosses: ["Ignis, o Colosso Vulcânico", "Fênix Flamejante", "Cria de Lava Titânica", "Soberano do Magma"] },
  { num: 18, name: "Éter Divino", dangerStart: 310, colors: ["#065f46", "#047857"], accents: ["#022c22"], caveFloors: ["#02221c"], caveWalls: ["#00110d"], caveAccents: ["#34d399"], monsters: ["Anjo Decaído", "Valkíria de Éter", "Guardião Divino"], bosses: ["Aurelius, o Purificador Cósmico", "Serafim Eterno", "Ancião do Templo", "Colosso Divino"] },
  { num: 19, name: "Templo Caótico", dangerStart: 330, colors: ["#581c87", "#6b21a8"], accents: ["#3b0764"], caveFloors: ["#230046"], caveWalls: ["#100022"], caveAccents: ["#a855f7"], monsters: ["Cultista Rúnico", "Demônio do Limbo", "Gárgula de Pedra"], bosses: ["Malakar, o Lorde da Discórdia", "Heraldo do Caos", "Servo Corrompido", "Lich Vermelho"] },
  { num: 20, name: "Ruínas Radiantes", dangerStart: 350, colors: ["#b45309", "#d97706"], accents: ["#78350f"], caveFloors: ["#4d1d05"], caveWalls: ["#2d0d00"], caveAccents: ["#fbbf24"], monsters: ["Soldado Autômato", "Sentinela de Bronze", "Feiticeiro das Ruínas"], bosses: ["Omega-9, a Forja Viva", "Imperador Autômato", "Gólem de Latão", "Sentinela Titânica"] },
  { num: 21, name: "Deserto Sombrio", dangerStart: 370, colors: ["#422006", "#713f12"], accents: ["#1c1917"], caveFloors: ["#291a0c"], caveWalls: ["#110802"], caveAccents: ["#eab308"], monsters: ["Escaravelho de Areia", "Múmia Sombria", "Serpente do Deserto"], bosses: ["Faraó Anúbis Ressurgido", "Escaravelho de Ouro Divino", "Imperador das Areias", "Cobra Solar Gigante"] },
  { num: 22, name: "Mares Eternos", dangerStart: 390, colors: ["#1e3a8a", "#1d4ed8"], accents: ["#172554"], caveFloors: ["#0c1a40"], caveWalls: ["#030920"], caveAccents: ["#3b82f6"], monsters: ["Tritão Guerreiro", "Naga Corrompida", "Elemental de Água"], bosses: ["Tritão Imperador Poseidon", "Leviatã das Marés", "Kraken Abissal", "Sereia Rainha"] },
  { num: 23, name: "Vulcão Primordial", dangerStart: 410, colors: ["#991b1b", "#b91c1c"], accents: ["#450a0a"], caveFloors: ["#2d0505"], caveWalls: ["#130101"], caveAccents: ["#f97316"], monsters: ["Cão Infernal", "Cria de Lava", "Wyvern de Fogo"], bosses: ["Ragnarok, o Dragão Ancestral", "Cão Ígneo de Duas Cabeças", "Elemental de Cinzas", "Fênix do Sol"] },
  { num: 24, name: "Abismo do Tempo", dangerStart: 430, colors: ["#312e81", "#3730a3"], accents: ["#1e1b4b"], caveFloors: ["#14113c"], caveWalls: ["#0a0720"], caveAccents: ["#a78bfa"], monsters: ["Espectro Temporal", "Cronófago Insaciável", "Paradoxo Vivo"], bosses: ["Chronos, o Guardião das Eras", "Ceifador do Tempo", "Anomalia Causal", "Espectro Ancestral"] },
  { num: 25, name: "Santuário Sagrado", dangerStart: 450, colors: ["#0f766e", "#115e59"], accents: ["#134e4a"], caveFloors: ["#0b3a37"], caveWalls: ["#032220"], caveAccents: ["#2dd4bf"], monsters: ["Serafim Sombrio", "Templário Abençoado", "Besta da Luz"], bosses: ["Luminis, o Arcanjo Supremo", "Inquisidor do Santuário", "Paladino Eterno", "Serafim da Luz"] },
  { num: 26, name: "Fortaleza de Ébano", dangerStart: 470, colors: ["#18181b", "#27272a"], accents: ["#09090b"], caveFloors: ["#111115"], caveWalls: ["#050508"], caveAccents: ["#a1a1aa"], monsters: ["Guerreiro de Ferro", "Cavaleiro Sombrio", "Gárgula de Obsidiana"], bosses: ["Gorgoroth, o Destruidor", "Cavaleiro de Ébano", "Titã de Ferro", "Lorde Ceifador"] },
  { num: 27, name: "Coração de Cristal", dangerStart: 490, colors: ["#831843", "#9d174d"], accents: ["#500724"], caveFloors: ["#3a0218"], caveWalls: ["#1e000a"], caveAccents: ["#ec4899"], monsters: ["Golem de Cristal", "Morcego de Rubi", "Escaravelho de Quartzo"], bosses: ["Amethysta, a Rainha de Cristal", "Golem de Esmeralda", "Dragão de Safira", "Soberano de Cristal"] },
  { num: 28, name: "Labirinto Cósmico", dangerStart: 510, colors: ["#1e1b4b", "#4c1d95"], accents: ["#120e2e"], caveFloors: ["#1d1145"], caveWalls: ["#0a0320"], caveAccents: ["#8b5cf6"], monsters: ["Aparição Cósmica", "Gólem Estelar", "Lobo do Éter"], bosses: ["Cosmus, o Arquiteto das Estrelas", "Nébula Sombria", "Lorde Cósmico", "Aparição do Limbo"] },
  { num: 29, name: "Picos Celestiais", dangerStart: 530, colors: ["#0369a1", "#0284c7"], accents: ["#0c4a6e"], caveFloors: ["#083754"], caveWalls: ["#021b2d"], caveAccents: ["#38bdf8"], monsters: ["Harpa Celestial", "Grifo de Tempestade", "Yeti das Neves"], bosses: ["Zephyrus, o Senhor dos Ventos", "Yeti Titânico", "Grifo de Ouro", "Espectro Glacial"] },
  { num: 30, name: "Oásis do Vazio", dangerStart: 550, colors: ["#022c22", "#064e3b"], accents: ["#022c22"], caveFloors: ["#02211a"], caveWalls: ["#000e0b"], caveAccents: ["#10b981"], monsters: ["Besta de Areia", "Vigia do Oásis", "Sombra do Deserto"], bosses: ["Xerxes, o Sultão Corrompido", "Xamã do Deserto", "Espírito da Tempestade", "Cão das Ruínas"] },
  { num: 31, name: "Garganta Vulcânica", dangerStart: 570, colors: ["#7f1d1d", "#991b1b"], accents: ["#450a0a"], caveFloors: ["#2d0505"], caveWalls: ["#180000"], caveAccents: ["#ef4444"], monsters: ["Escaravelho Ígneo", "Aranha de Lava", "Golem de Cinzas"], bosses: ["Vulcanus, o Núcleo Fundido", "Aranha de Obsidiana", "Golem de Lava Gigante", "Imperador do Fogo"] },
  { num: 32, name: "Selva Amaldiçoada", dangerStart: 590, colors: ["#14532d", "#166534"], accents: ["#052e16"], caveFloors: ["#0c2a13"], caveWalls: ["#041408"], caveAccents: ["#22c55e"], monsters: ["Planta Carnívora", "Tigre-de-Bengala Sombrio", "Cobra Amaldiçoada"], bosses: ["Kahn, a Besta da Selva", "Pantera Espiritual", "Víbora Real", "Planta Mutante Titânica"] },
  { num: 33, name: "Pântano Profano", dangerStart: 610, colors: ["#3f6212", "#4d7c0f"], accents: ["#1a2e05"], caveFloors: ["#1a240c"], caveWalls: ["#0d1404"], caveAccents: ["#84cc16"], monsters: ["Crocodilo do Lodo", "Besta Fúngica", "Bruxa do Pântano"], bosses: ["Lurker, o Terror do Pântano", "Rainha Fúngica", "Bruxa Sombria do Lodo", "Crocodilo Primitivo"] },
  { num: 34, name: "Domínio de Oblivion", dangerStart: 630, colors: ["#111827", "#1f2937"], accents: ["#030712"], caveFloors: ["#090d16"], caveWalls: ["#02040a"], caveAccents: ["#ef4444"], monsters: ["Sombra de Oblivion", "Golem de Matéria Escura", "Servo da Aniquilação"], bosses: ["Aethes, o Caos Primordial", "Lorde de Oblivion", "Vigia de Trígono Supremo", "Ceifador da Morte"] },
];

for (const config of islands15_34Config) {
  // Cada ilha do 15 ao 34 tem exatamente 10 biomas
  for (let i = 0; i < 10; i++) {
    const id = 2000 + (config.num - 15) * 100 + i;
    const adj = adjectives[i % adjectives.length];

    const color = config.colors[i % config.colors.length];
    const accent = config.accents[i % config.accents.length];
    const floorColor = config.caveFloors[i % config.caveFloors.length];
    const wallColor = config.caveWalls[i % config.caveWalls.length];
    const caveAccent = config.caveAccents[i % config.caveAccents.length];

    const danger = config.dangerStart + i * 2;

    const monsters = [
      config.monsters[i % config.monsters.length],
      config.monsters[(i + 1) % config.monsters.length],
      config.monsters[(i + 2) % config.monsters.length],
    ];

    const boss = config.bosses[i % config.bosses.length];

    const name = `Ilha ${config.num}: ${config.name} ${adj}`;
    const caveLabel = `Subsolo de ${config.name} ${adj}`;

    NEW_ISLANDS_BIOMES.push({
      id,
      name,
      color,
      accent,
      danger,
      monsters,
      boss,
      caveTheme: ct(
        caveLabel,
        floorColor,
        wallColor,
        caveAccent,
        [
          `Mula de ${config.name} ${adj}`,
          `Servo de ${config.name} ${adj}`,
          `Xamã de ${config.name} ${adj}`,
        ],
        `Sombra de ${boss}`,
      ),
    });
  }
}

// ─── DEFINIÇÃO DINÂMICA DAS 20 NOVAS ILHAS AFASTADAS (35 A 54) ───
// Cada ilha tem exatamente 40 biomas com nível/perigo mínimo 300.
const islands35_54Config = [
  { num: 35, name: "Atlântida Perdida", dangerStart: 300, colors: ["#0284c7", "#0369a1"], accents: ["#0c4a6e"], caveFloors: ["#083754"], caveWalls: ["#021b2d"], caveAccents: ["#38bdf8"], monsters: ["Guardião de Atlântida", "Naga das Profundezas", "Tridentino Sombrio"], bosses: ["Atlas, o Rei dos Mares", "Tritão de Coral Divino", "Elemental de Maremoto", "Sereia Imperatriz"] },
  { num: 36, name: "Forja Vulcânica", dangerStart: 320, colors: ["#991b1b", "#7f1d1d"], accents: ["#450a0a"], caveFloors: ["#2d0505"], caveWalls: ["#180000"], caveAccents: ["#f97316"], monsters: ["Escaravelho de Fogo", "Gólem de Metal", "Salamandra de Elite"], bosses: ["Ignis, o Senhor da Forja", "Elemental de Ferro Fundido", "Cão Sombrio Ígneo", "Wyvern Vulcânico"] },
  { num: 37, name: "Valhala dos Mortos", dangerStart: 340, colors: ["#4a044e", "#3b0764"], accents: ["#1e002e"], caveFloors: ["#14001a"], caveWalls: ["#0a000d"], caveAccents: ["#d946ef"], monsters: ["Guerreiro Morto", "Valquíria Sombria", "Cavaleiro do Limbo"], bosses: ["Odin Corrompido", "Lich de Valhala", "Coração Espectral", "Gárgula de Ébano"] },
  { num: 38, name: "Oasis Celestial", dangerStart: 360, colors: ["#0d9488", "#0f766e"], accents: ["#115e59"], caveFloors: ["#134e4a"], caveWalls: ["#0b3a37"], caveAccents: ["#2dd4bf"], monsters: ["Querubim Divino", "Sentinela de Esmeralda", "Falcoaria Sagrada"], bosses: ["Luminis, o Arcanjo Divino", "Espectro Radiante", "Colosso do Oásis", "Escaravelho de Ouro Supremo"] },
  { num: 39, name: "Fronteira Rúnica", dangerStart: 380, colors: ["#1e1b4b", "#2e1065"], accents: ["#120e2e"], caveFloors: ["#0f051d"], caveWalls: ["#080110"], caveAccents: ["#a855f7"], monsters: ["Xamã Rúnico", "Vigia de Runas", "Pedra Viva"], bosses: ["Runeheart, o Titã de Pedra", "Mago Rúnico Supremo", "Colosso do Templo", "Lorde da Discórdia"] },
  { num: 40, name: "Ninho dos Dragões", dangerStart: 400, colors: ["#7f1d1d", "#991b1b"], accents: ["#450a0a"], caveFloors: ["#2d0505"], caveWalls: ["#180000"], caveAccents: ["#ef4444"], monsters: ["Cria de Dragão", "Wyvern de Sangue", "Escaravelho de Fogo"], bosses: ["Tiamat, a Rainha dos Dragões", "Dragão Cósmico de Fogo", "Grande Serpente Sanguínea", "Wyvern Titânico"] },
  { num: 41, name: "Pântano do Terror", dangerStart: 420, colors: ["#166534", "#14532d"], accents: ["#052e16"], caveFloors: ["#0a2512"], caveWalls: ["#030f06"], caveAccents: ["#4ade80"], monsters: ["Crocodilo Mutante", "Besta de Lodo", "Bruxa da Floresta"], bosses: ["Lurker das Profundezas", "Crocodilo Primitivo Gigante", "Bruxa de Lodo Suprema", "Rainha Fúngica Sombria"] },
  { num: 42, name: "Labirinto Glacial", dangerStart: 440, colors: ["#0369a1", "#0284c7"], accents: ["#0c4a6e"], caveFloors: ["#083754"], caveWalls: ["#021b2d"], caveAccents: ["#38bdf8"], monsters: ["Golem de Gelo", "Espectro Congelado", "Lobo de Neve"], bosses: ["Yeti Titânico do Norte", "Lich Glacial de Prata", "Coração do Inverno", "Rei do Gelo Sombrio"] },
  { num: 43, name: "Cume dos Ventos", dangerStart: 460, colors: ["#475569", "#334155"], accents: ["#1e293b"], caveFloors: ["#151c2c"], caveWalls: ["#0b0f19"], caveAccents: ["#94a3b8"], monsters: ["Espírito de Vento", "Harpia Veloz", "Sentinela de Bronze"], bosses: ["Zephyrus, o Senhor da Tempestade", "Fênix Cósmica de Vento", "Grifo de Ouro Titânico", "Gargula Glacial"] },
  { num: 44, name: "Estepes de Ébano", dangerStart: 480, colors: ["#18181b", "#27272a"], accents: ["#09090b"], caveFloors: ["#111115"], caveWalls: ["#050508"], caveAccents: ["#f43f5e"], monsters: ["Cavaleiro de Ébano", "Pantera Sombria", "Vigia de Pedra"], bosses: ["Gorgoroth, o Ceifador", "Cavaleiro do Caos", "Lorde de Obsidiana", "Golem de Matéria Escura"] },
  { num: 45, name: "Minas de Cristal", dangerStart: 500, colors: ["#831843", "#9d174d"], accents: ["#500724"], caveFloors: ["#3a0218"], caveWalls: ["#1e000a"], caveAccents: ["#f472b6"], monsters: ["Golem de Cristal", "Morcego Rúnico", "Escaravelho Sombrio"], bosses: ["Amethysta, a Rainha das Minas", "Soberano de Esmeralda", "Dragão de Cristal Supremo", "Golem de Rubi de Elite"] },
  { num: 46, name: "Oceano Profundo", dangerStart: 520, colors: ["#1e3a8a", "#1d4ed8"], accents: ["#172554"], caveFloors: ["#0c1a40"], caveWalls: ["#030920"], caveAccents: ["#60a5fa"], monsters: ["Tubarão das Trevas", "Lula Gigante", "Sereia Cantora"], bosses: ["Leviatã Primitivo", "Kraken das Profundezas", "Ondina de Plasma", "Rei Tritão do Abismo"] },
  { num: 47, name: "Catacumbas Ocultas", dangerStart: 540, colors: ["#1c1917", "#292524"], accents: ["#0c0a09"], caveFloors: ["#14110f"], caveWalls: ["#080706"], caveAccents: ["#eab308"], monsters: ["Múmia Anciã", "Zumbi Corrompido", "Morcego de Elite"], bosses: ["Faraó Anúbis Ressurgido", "Múmia Cósmica Sagrada", "Sacerdote das Catacumbas", "Escaravelho de Ouro Divino"] },
  { num: 48, name: "Jardins do Éden", dangerStart: 560, colors: ["#15803d", "#166534"], accents: ["#14532d"], caveFloors: ["#0a2f14"], caveWalls: ["#05180a"], caveAccents: ["#4ade80"], monsters: ["Planta Carnívora Gigante", "Fada de Éter", "Lobo de Esmeralda"], bosses: ["Gaia, a Mãe Natureza", "Planta Mutante de Elite", "Pantera Espiritual Sagrada", "Coração Esmeralda Divino"] },
  { num: 49, name: "Deserto de Cinzas", dangerStart: 580, colors: ["#292524", "#44403c"], accents: ["#1c1917"], caveFloors: ["#1c140e"], caveWalls: ["#0e0a07"], caveAccents: ["#f97316"], monsters: ["Escaravelho de Areia", "Golem de Cinzas", "Serpente Solar"], bosses: ["Cobra Solar de Ouro", "Imperador das Areias Mortas", "Serafim Solar de Asterion", "Sultão Corrompido das Cinzas"] },
  { num: 50, name: "Vale dos Espectros", dangerStart: 600, colors: ["#312e81", "#3730a3"], accents: ["#1e1b4b"], caveFloors: ["#14113c"], caveWalls: ["#0a0720"], caveAccents: ["#c084fc"], monsters: ["Aparição Sombria", "Ladrão de Almas de Elite", "Sombra Cósmica"], bosses: ["Gloomshade, o Devorador de Almas", "Espectro Cósmico Sagrado", "Lorde Ceifador", "Cão Sombrio das Sombras"] },
  { num: 51, name: "Forte de Ferro", dangerStart: 620, colors: ["#334155", "#475569"], accents: ["#1e293b"], caveFloors: ["#151c2c"], caveWalls: ["#0b0f19"], caveAccents: ["#64748b"], monsters: ["Guerreiro de Ferro", "Autômato Defensor", "Sentinela de Latão"], bosses: ["Omega-9, a Forja Viva Suprema", "Titã de Ferro Divino", "Sentinela Autômata de Elite", "Imperador Autômato Corrompido"] },
  { num: 52, name: "Platô dos Deuses", dangerStart: 640, colors: ["#115e59", "#134e4a"], accents: ["#115e59"], caveFloors: ["#0c3b37"], caveWalls: ["#041d1b"], caveAccents: ["#14b8a6"], monsters: ["Querubim Divino", "Anjo Decaído Corrompido", "Besta da Luz"], bosses: ["Aurelius, o Purificador Cósmico Supremo", "Serafim da Luz Divina", "Paladino Eterno Corrompido", "Inquisidor do Templo Sagrado"] },
  { num: 53, name: "Vórtice Temporal", dangerStart: 660, colors: ["#311042", "#4a044e"], accents: ["#1d002a"], caveFloors: ["#150522"], caveWalls: ["#0b0114"], caveAccents: ["#d946ef"], monsters: ["Espectro do Tempo", "Cronófago Insaciável", "Paradoxo Vivo"], bosses: ["Chronos, o Senhor do Tempo Supremo", "Ceifador do Tempo Cósmico", "Anomalia Temporal Divina", "Espectro Ancestral do Loop"] },
  { num: 54, name: "Coração de Asterion", dangerStart: 680, colors: ["#111827", "#1f2937"], accents: ["#030712"], caveFloors: ["#090d16"], caveWalls: ["#02040a"], caveAccents: ["#f43f5e"], monsters: ["Sombra do Vazio", "Golem de Matéria Escura", "Servo da Aniquilação"], bosses: ["Aethes, o Caos Primordial Divino", "Ceifador do Vazio Cósmico", "Colosso de Oblivion", "Vigia de Trígono de Elite"] }
];

for (const config of islands35_54Config) {
  // Cada uma das 20 novas ilhas tem exatamente 40 biomas com nível/perigo mínimo 300
  for (let i = 0; i < 40; i++) {
    const id = 4000 + (config.num - 35) * 100 + i;
    const adj = adjectives[i % adjectives.length];

    const color = config.colors[i % config.colors.length];
    const accent = config.accents[i % config.accents.length];
    const floorColor = config.caveFloors[i % config.caveFloors.length];
    const wallColor = config.caveWalls[i % config.caveWalls.length];
    const caveAccent = config.caveAccents[i % config.caveAccents.length];

    const danger = config.dangerStart + i * 2;

    const monsters = [
      config.monsters[i % config.monsters.length],
      config.monsters[(i + 1) % config.monsters.length],
      config.monsters[(i + 2) % config.monsters.length],
    ];

    const boss = config.bosses[i % config.bosses.length];

    const name = `Ilha ${config.num}: ${config.name} ${adj}`;
    const caveLabel = `Subsolo de ${config.name} ${adj}`;

    NEW_ISLANDS_BIOMES.push({
      id,
      name,
      color,
      accent,
      danger,
      monsters,
      boss,
      caveTheme: ct(
        caveLabel,
        floorColor,
        wallColor,
        caveAccent,
        [
          `Mula de ${config.name} ${adj}`,
          `Servo de ${config.name} ${adj}`,
          `Xamã de ${config.name} ${adj}`,
        ],
        `Sombra de ${boss}`,
      ),
    });
  }
}

