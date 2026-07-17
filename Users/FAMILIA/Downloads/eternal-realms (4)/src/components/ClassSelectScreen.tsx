import * as React from "react";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CLASS_SKINS, type PlayerClass } from "@/game/engine";
import bg from "@/assets/class-select-bg.jpg";
import { Heart, Zap, Swords, Shield, Sparkles, Activity, Wand2, Award, ChevronRight, CornerDownRight } from "lucide-react";

// Hi-res Cyber-Arcano portraits (skin index 5)
import cyberMelee from "@/assets/cyber/skin-melee-5.png";
import cyberMagic from "@/assets/cyber/skin-magic-5.png";
import cyberPaladin from "@/assets/cyber/skin-paladin-5.png";
import cyberNecro from "@/assets/cyber/skin-necro-5.png";
import cyberArcher from "@/assets/cyber/skin-archer-5.png";
import cyberDruid from "@/assets/cyber/skin-druid-5.png";
import cyberAssassin from "@/assets/cyber/skin-assassin-5.png";
import cyberWarlock from "@/assets/cyber/skin-warlock-5.png";
import cyberSamurai from "@/assets/cyber/skin-samurai-5.png";
import cyberMonk from "@/assets/cyber/skin-monk-5.png";
import cyberBard from "@/assets/cyber/skin-bard-5.png";
import cyberGunslinger from "@/assets/cyber/skin-gunslinger-5.png";
import cyberAlchemist from "@/assets/cyber/skin-alchemist-5.png";
import cyberVampire from "@/assets/cyber/skin-vampire-5.png";
import cyberReaper from "@/assets/cyber/skin-reaper-5.png";
import cyberEcomancer from "@/assets/cyber/skin-ecomancer-5.png";
import cyberSymbiote from "@/assets/cyber/skin-symbiote-5.png";

const CYBER_PORTRAITS: Record<PlayerClass, string> = {
  melee: cyberMelee,
  magic: cyberMagic,
  paladin: cyberPaladin,
  necro: cyberNecro,
  archer: cyberArcher,
  druid: cyberDruid,
  assassin: cyberAssassin,
  warlock: cyberWarlock,
  samurai: cyberSamurai,
  monk: cyberMonk,
  bard: cyberBard,
  gunslinger: cyberGunslinger,
  alchemist: cyberAlchemist,
  vampire: cyberVampire,
  reaper: cyberReaper,
  ecomancer: cyberEcomancer,
  symbiote: cyberSymbiote,
};

export type ClassInfo = {
  id: PlayerClass;
  name: string;
  role: string;
  tagline: string;
  lore: string;
  accent: string; // hex
  stats: { hp: number; mp: number; str: number; agi: number; int: number; vit: number };
  weapon: string;
  attackStyle: string;
  passive: { name: string; desc: string };
  skills: { name: string; key: string; cost: number; desc: string }[];
};

// Central catalog. Mirrors classSkills() in game.ts and BASE_CLASSES in engine.ts.
export const CLASS_INFO: ClassInfo[] = [
  {
    id: "melee", name: "Guerreiro", role: "Tanque / DPS Corpo-a-Corpo",
    tagline: "Corte amplo, guarda de ferro. Muralha viva do reino.",
    lore: "Veterano das guerras de Aurora. Cada golpe acumula Fúria — a 100% libera dano devastador.",
    accent: "#ff5a3a",
    stats: { hp: 130, mp: 30, str: 9, agi: 4, int: 3, vit: 8 },
    weapon: "Espada Larga", attackStyle: "Cortes horizontais em cone com alcance médio.",
    passive: { name: "Fúria Contida", desc: "Cada ataque enche a Fúria. A 100%, a próxima skill causa +50% de dano." },
    skills: [
      { name: "Corte Amplo", key: "1", cost: 10, desc: "Golpe em cone à frente." },
      { name: "Guarda de Ferro", key: "2", cost: 12, desc: "Invulnerável por 1.5s." },
      { name: "Golpe Giratório", key: "3", cost: 15, desc: "Dano em área ao redor." },
      { name: "Investida", key: "4", cost: 5, desc: "Impulso rápido na direção mirada." },
    ],
  },
  {
    id: "magic", name: "Mago", role: "Canhão de Vidro Arcano",
    tagline: "Raio Arcano, Bola de Fogo. Dano puro em INT.",
    lore: "Mestre do Fluxo. Ao atingir 100% de Fluxo, a próxima magia custa 0 mana e causa dano dobrado.",
    accent: "#3aa8ff",
    stats: { hp: 80, mp: 90, str: 3, agi: 4, int: 10, vit: 4 },
    weapon: "Cajado Arcano", attackStyle: "Projéteis mágicos rápidos de longo alcance.",
    passive: { name: "Fluxo Arcano", desc: "Cada spell enche o Fluxo. A 100%, o próximo custa 0 MP e causa 2× dano." },
    skills: [
      { name: "Raio Arcano", key: "1", cost: 12, desc: "Projétil rápido de alto alcance." },
      { name: "Bola de Fogo", key: "2", cost: 22, desc: "Explosão em grande área." },
      { name: "Cura Menor", key: "3", cost: 15, desc: "Restaura HP instantaneamente." },
      { name: "Piscar", key: "4", cost: 8, desc: "Teleporte curto na direção." },
    ],
  },
  {
    id: "paladin", name: "Paladino", role: "Suporte / Bruto Sagrado",
    tagline: "Golpe Sagrado cura ao acertar. Equilíbrio absoluto.",
    lore: "Cruzado da luz de Aurora. Combina golpes de força com bênçãos que restauram vitalidade.",
    accent: "#f5c542",
    stats: { hp: 110, mp: 60, str: 7, agi: 5, int: 6, vit: 7 },
    weapon: "Martelo Sagrado", attackStyle: "Golpes de área com energia santa.",
    passive: { name: "Aura Divina", desc: "Ao usar skills, cura levemente aliados próximos." },
    skills: [
      { name: "Golpe Sagrado", key: "1", cost: 18, desc: "Dano sagrado + cura em quem acertar." },
      { name: "Bênção", key: "2", cost: 15, desc: "Restaura HP em burst." },
      { name: "Golpe Giratório", key: "3", cost: 10, desc: "Dano em área ao redor." },
      { name: "Avanço Sagrado", key: "4", cost: 5, desc: "Investida com dano na chegada." },
    ],
  },
  {
    id: "necro", name: "Necromante", role: "Invocador / DoT Sombrio",
    tagline: "Dreno de Vida + esqueletos invocados.",
    lore: "Guardião dos ritos proibidos. Rouba vida e ergue mortos como escudos.",
    accent: "#8a5aff",
    stats: { hp: 90, mp: 100, str: 3, agi: 5, int: 11, vit: 5 },
    weapon: "Cetro de Ossos", attackStyle: "Projéteis sombrios que drenam HP.",
    passive: { name: "Colheita das Almas", desc: "Inimigos abatidos recuperam MP e chance de reduzir CDs." },
    skills: [
      { name: "Dreno de Vida", key: "1", cost: 12, desc: "Projétil que cura você." },
      { name: "Invocar Esqueleto", key: "2", cost: 25, desc: "Convoca esqueleto aliado por 20s." },
      { name: "Raio Sombrio", key: "3", cost: 10, desc: "Projétil arcano das trevas." },
      { name: "Sangria Reversa", key: "4", cost: 18, desc: "Cura súbita alimentada por almas." },
    ],
  },
  {
    id: "archer", name: "Arqueiro", role: "DPS à Distância",
    tagline: "Flechas velozes de longo alcance + chuva de flechas.",
    lore: "Sentinela das florestas. Vê o inimigo antes de ele te ver.",
    accent: "#4ee08a",
    stats: { hp: 95, mp: 45, str: 5, agi: 11, int: 4, vit: 5 },
    weapon: "Arco Longo", attackStyle: "Flechas rápidas, precisas, alcance máximo.",
    passive: { name: "Olhos de Águia", desc: "+15% dano em alvos distantes." },
    skills: [
      { name: "Tiro Rápido", key: "1", cost: 6, desc: "Flecha veloz de alcance máximo." },
      { name: "Chuva de Flechas", key: "2", cost: 20, desc: "Flechas caem numa área." },
      { name: "Salto Ágil", key: "3", cost: 5, desc: "Impulso rápido e leve." },
      { name: "Bandagem", key: "4", cost: 12, desc: "Cura de campo instantânea." },
    ],
  },
  {
    id: "druid", name: "Druida", role: "Suporte / Controle da Natureza",
    tagline: "Espinhos, terremotos e regeneração telúrica.",
    lore: "Voz da mãe-floresta. Controla o campo com raízes e sacode a terra.",
    accent: "#63c96a",
    stats: { hp: 115, mp: 65, str: 5, agi: 5, int: 7, vit: 7 },
    weapon: "Cajado da Vida", attackStyle: "Espinhos de curta distância + magia de terra.",
    passive: { name: "Renovação", desc: "Regenera 1% HP/s constantemente fora de combate." },
    skills: [
      { name: "Enredar", key: "1", cost: 10, desc: "Espinhos imobilizam alvos." },
      { name: "Casca de Ferro", key: "2", cost: 15, desc: "Aumenta DEF por 3.5s." },
      { name: "Rejuvenescer", key: "3", cost: 12, desc: "Regenera HP rapidamente." },
      { name: "Terremoto", key: "4", cost: 25, desc: "Tremor causa AoE massivo." },
    ],
  },
  {
    id: "assassin", name: "Assassino", role: "Burst Furtivo",
    tagline: "Críticos, fumaça e teleporte com dano.",
    lore: "Sombra afiada de Asterion. Acumula Combo Points a cada golpe — libera-os num executor devastador.",
    accent: "#ff4d7d",
    stats: { hp: 90, mp: 40, str: 5, agi: 12, int: 4, vit: 4 },
    weapon: "Adagas Gêmeas", attackStyle: "Adagas rápidas, altíssimo crítico.",
    passive: { name: "Combo Points", desc: "Cada ataque gera 1 ponto (máx. 5). Skills consomem tudo: +40% dano por ponto." },
    skills: [
      { name: "Apunhalar", key: "1", cost: 12, desc: "Golpe de alto crítico." },
      { name: "Fumaça Noturna", key: "2", cost: 10, desc: "Velocidade + evasão temporária." },
      { name: "Leque Shuriken", key: "3", cost: 8, desc: "Lança 3 projéteis em leque." },
      { name: "Passo Sombrio", key: "4", cost: 15, desc: "Teleporte curto que causa dano." },
    ],
  },
  {
    id: "warlock", name: "Bruxo", role: "DoT / Debuff Caótico",
    tagline: "Maldições, dreno de alma e pactos negros.",
    lore: "Traficante de pactos com entidades abissais. Se alimenta da agonia alheia.",
    accent: "#a020ff",
    stats: { hp: 85, mp: 95, str: 3, agi: 5, int: 12, vit: 4 },
    weapon: "Grimório Amaldiçoado", attackStyle: "Feitiços de agonia contínua e explosão corrupta.",
    passive: { name: "Contrato Negro", desc: "Cada inimigo com Dreno de Almas cura você por segundo." },
    skills: [
      { name: "Dreno de Almas", key: "1", cost: 10, desc: "Agonia contínua no alvo." },
      { name: "Seta do Caos", key: "2", cost: 20, desc: "Projétil devastador." },
      { name: "Explosão Corrupta", key: "3", cost: 15, desc: "AoE que dreno HP." },
      { name: "Pacto Negro", key: "4", cost: 18, desc: "Defesa infernal temporária." },
    ],
  },
  {
    id: "samurai", name: "Samurai", role: "DPS Preciso",
    tagline: "Cortes ultra velozes e contra-ataques perfeitos.",
    lore: "Ronin de honra quebrada. Um único golpe pode selar destinos.",
    accent: "#e6486a",
    stats: { hp: 105, mp: 45, str: 8, agi: 8, int: 4, vit: 6 },
    weapon: "Katana", attackStyle: "Cortes rapidíssimos com alcance médio.",
    passive: { name: "Bushidō", desc: "Ao ficar abaixo de 30% HP, ganha +30% velocidade de ataque." },
    skills: [
      { name: "Iaijutsu", key: "1", cost: 12, desc: "Investida cortante devastadora." },
      { name: "Bloqueio Perfeito", key: "2", cost: 10, desc: "Contra-ataque ao ser atingido." },
      { name: "Foco Interior", key: "3", cost: 15, desc: "Aumenta ATK por 3s." },
      { name: "Corte de Vento", key: "4", cost: 8, desc: "Projétil de lâmina de vento." },
    ],
  },
  {
    id: "monk", name: "Monge", role: "Bruto Ágil / Autocura",
    tagline: "Socos espirituais, escudos de Chi, meditação zen.",
    lore: "Discípulo do templo da alvorada. Corpo é arma; espírito é escudo.",
    accent: "#ffa347",
    stats: { hp: 110, mp: 55, str: 6, agi: 6, int: 5, vit: 6 },
    weapon: "Punhos & Manoplas", attackStyle: "Combos corpo-a-corpo velocíssimos.",
    passive: { name: "Chi Fluente", desc: "Ataques básicos recuperam MP em pequena quantia." },
    skills: [
      { name: "Punhos da Fúria", key: "1", cost: 10, desc: "Combo rápido em CaC." },
      { name: "Barreira de Chi", key: "2", cost: 12, desc: "Escudo que restaura MP." },
      { name: "Chute do Dragão", key: "3", cost: 15, desc: "Golpe forte que empurra." },
      { name: "Meditação Zen", key: "4", cost: 20, desc: "Cura profunda imóvel." },
    ],
  },
  {
    id: "bard", name: "Bardo", role: "Suporte / Buffs",
    tagline: "Melodias sonoras, buffs de velocidade e cura.",
    lore: "A canção é sua arma; a harmonia, seu escudo.",
    accent: "#f0a5ff",
    stats: { hp: 100, mp: 70, str: 4, agi: 8, int: 8, vit: 5 },
    weapon: "Alaúde Encantado", attackStyle: "Ondas sônicas em cone.",
    passive: { name: "Refrão", desc: "Skills consecutivas ficam 20% mais poderosas." },
    skills: [
      { name: "Sonata Sônica", key: "1", cost: 10, desc: "Ondas musicais de choque." },
      { name: "Ritmo Acelerado", key: "2", cost: 8, desc: "Grande aumento de velocidade." },
      { name: "Melodia Protetora", key: "3", cost: 14, desc: "Debuff em inimigos ao redor." },
      { name: "Acorde Harmônico", key: "4", cost: 18, desc: "Cura HP + MP simultaneamente." },
    ],
  },
  {
    id: "gunslinger", name: "Pistoleiro", role: "DPS Sustentado à Distância",
    tagline: "Armas de fogo rápidas e granadas.",
    lore: "Anti-herói pragmático de Asterion. Recarrega mais rápido do que hesita.",
    accent: "#c084ff",
    stats: { hp: 95, mp: 45, str: 4, agi: 12, int: 5, vit: 5 },
    weapon: "Pistolas Duplas", attackStyle: "Disparos velozes, alcance longo.",
    passive: { name: "Recarga Rápida", desc: "Skills têm 20% menos cooldown." },
    skills: [
      { name: "Tempestade de Balas", key: "1", cost: 12, desc: "Cone de fuzilaria rápida." },
      { name: "Granada Explosiva", key: "2", cost: 15, desc: "Explosão massiva em área." },
      { name: "Salto de Recuo", key: "3", cost: 8, desc: "Recua atirando." },
      { name: "Tiro de Precisão", key: "4", cost: 18, desc: "Disparo perfurante longo." },
    ],
  },
  {
    id: "alchemist", name: "Alquimista", role: "Zoner / Mutagênico",
    tagline: "Ácido, elixires mutagênicos e homúnculo.",
    lore: "Ex-cientista imperial que descobriu formulas proibidas.",
    accent: "#40e0d0",
    stats: { hp: 100, mp: 75, str: 4, agi: 5, int: 9, vit: 6 },
    weapon: "Frascos Alquímicos", attackStyle: "Bombas em arco e poças persistentes.",
    passive: { name: "Reagentes Ativos", desc: "Bombas deixam poças que continuam causando dano." },
    skills: [
      { name: "Bomba de Ácido", key: "1", cost: 10, desc: "Lança poça corrosiva." },
      { name: "Elixir de Mutagênio", key: "2", cost: 15, desc: "Super buffs de ATK/DEF." },
      { name: "Criar Homúnculo", key: "3", cost: 20, desc: "Invoca ajudante explosivo." },
      { name: "Transmutar Ouro", key: "4", cost: 12, desc: "Dano + ganho extra de ouro." },
    ],
  },
  {
    id: "vampire", name: "Vampiro", role: "Sustain / Lifesteal",
    tagline: "Skills custam HP em vez de MP. Cura no cara.",
    lore: "Nobre da noite eterna. Cada gota derramada volta em três.",
    accent: "#e5344f",
    stats: { hp: 120, mp: 50, str: 8, agi: 6, int: 5, vit: 8 },
    weapon: "Presas & Relíquia", attackStyle: "Toque de sangue com dreno vital.",
    passive: { name: "Poço de Sangue", desc: "Skills custam HP. Cada golpe cura % dano causado." },
    skills: [
      { name: "Mordida Sombria", key: "1", cost: 10, desc: "Dano alto que cura HP." },
      { name: "Nuvem de Morcegos", key: "2", cost: 15, desc: "Morcegos em área." },
      { name: "Forma de Névoa", key: "3", cost: 12, desc: "Invencível e veloz." },
      { name: "Erupção de Sangue", key: "4", cost: 18, desc: "Poça de dano em área." },
    ],
  },
  {
    id: "reaper", name: "Ceifador", role: "Executor Sombrio",
    tagline: "Foice, drenos de alma e aura da morte.",
    lore: "Anda entre vivos e mortos. Sua foice não deixa nada para trás.",
    accent: "#7dffb1",
    stats: { hp: 100, mp: 60, str: 8, agi: 5, int: 8, vit: 6 },
    weapon: "Foice Ancestral", attackStyle: "Golpes curvos amplos com puxão.",
    passive: { name: "Manto Vital", desc: "Executa alvos abaixo de 15% HP e recupera HP no abate." },
    skills: [
      { name: "Corte da Foice", key: "1", cost: 12, desc: "Ataque curvo de atração." },
      { name: "Ceifar Alma", key: "2", cost: 14, desc: "Execução; cura ao abater." },
      { name: "Manto da Morte", key: "3", cost: 15, desc: "Escudo de absorção vital." },
      { name: "Puxão Sombrio", key: "4", cost: 10, desc: "Puxa e reduz velocidade." },
    ],
  },
  {
    id: "ecomancer", name: "Ecomante", role: "Manipulação Temporal",
    tagline: "Grava ações como ecos temporais. Loop de combos.",
    lore: "Marca instantes, colapsa linhas, entra em loop perpétuo. Cada segundo joga contra o inimigo.",
    accent: "#00e5ff",
    stats: { hp: 92, mp: 120, str: 4, agi: 8, int: 12, vit: 5 },
    weapon: "Diapasão Temporal", attackStyle: "Projéteis rítmicos com eco a 1-3s de atraso.",
    passive: { name: "Eco Latente", desc: "Skills marcadas se re-executam sozinhas a 70% do dano." },
    skills: [
      { name: "Marcar Instante", key: "1", cost: 15, desc: "Grava a próxima skill; re-executa em 3s a 70% dano." },
      { name: "Ecoar Paradoxo", key: "2", cost: 20, desc: "2 projéteis + 2 ecos-espelho 1s depois." },
      { name: "Colapso de Linha", key: "3", cost: 30, desc: "Detona TODOS ecos ativos (+40% por eco)." },
      { name: "Loop Perpétuo", key: "4", cost: 45, desc: "5s: toda skill gera eco extra. Drena 4% HP/s." },
    ],
  },
  {
    id: "symbiote", name: "Simbionte", role: "Adaptativo / Executor",
    tagline: "Devora essências e muta suas skills a cada consumo.",
    lore: "Um ser híbrido de mil hospedeiros. Cada essência absorvida reprograma seu combate.",
    accent: "#59ff8c",
    stats: { hp: 115, mp: 75, str: 9, agi: 6, int: 5, vit: 8 },
    weapon: "Tentáculos Parasitas", attackStyle: "Ataques corpo-a-corpo mutáveis por essência.",
    passive: { name: "Essências Absorvidas", desc: "Estoca até 5 essências (Chama/Gelo/Sombra/Sangue) que mutam suas skills." },
    skills: [
      { name: "Devorar Essência", key: "1", cost: 12, desc: "Executa <25% HP e absorve 1 essência (máx. 5)." },
      { name: "Mutação Reativa", key: "2", cost: 18, desc: "Consome 1 essência: buff dinâmico 10s." },
      { name: "Enxame Parasita", key: "3", cost: 28, desc: "Parasitas perseguem em área." },
      { name: "Fusão Aberrante", key: "4", cost: 50, desc: "Consome todas: cura 15%/essência + pulso combinado." },
    ],
  },
];

export const SUBCLASSES: Record<PlayerClass, { name: string; bonus: string; desc: string }[]> = {
  melee: [
    { name: "Muralha de Ferro", bonus: "+30% Defesa", desc: "Escudo inquebrável e resistência absoluta contra ataques físicos." },
    { name: "Carrasco Sangrento", bonus: "+30% Ataque", desc: "Dano de fúria aumentado e chance de infligir sangramento." }
  ],
  magic: [
    { name: "Defensor Arcano", bonus: "+30% Defesa", desc: "Cria uma barreira mágica que absorve dano elemental." },
    { name: "Mago do Caos", bonus: "+30% Ataque", desc: "Magias desestabilizadas causam explosões arcanas de área." }
  ],
  paladin: [
    { name: "Bastião Divino", bonus: "+30% Defesa", desc: "Consagra o solo para reduzir o dano recebido por aliados." },
    { name: "Inquisidor", bonus: "+30% Ataque", desc: "Pune inimigos com chamas divinas adicionais em cada golpe." }
  ],
  necro: [
    { name: "Mestre de Runas", bonus: "+30% Defesa", desc: "Runas espirituais que mitigam dano e restauram escudo." },
    { name: "Ceifador do Medo", bonus: "+30% Ataque", desc: "Invocações herdam mais força e causam dano de podridão." }
  ],
  archer: [
    { name: "Guardião da Vida", bonus: "+30% Defesa", desc: "Movimentação evasiva aprimorada para evitar golpes mortais." },
    { name: "Franco-Atirador", bonus: "+30% Ataque", desc: "Flechas perfurantes causam dano crítico massivo de longe." }
  ],
  druid: [
    { name: "Arauto da Luz", bonus: "+30% Defesa", desc: "Massa corporal de casca de árvore que reduz o dano sofrido." },
    { name: "Estrategista Elemental", bonus: "+30% Ataque", desc: "Manipula raízes espinhosas para sangrar e punir inimigos." }
  ],
  assassin: [
    { name: "Sombra Evasiva", bonus: "+30% Defesa", desc: "Desaparece em fumaça para esquivar de ataques iminentes." },
    { name: "Lâmina Sombria", bonus: "+30% Ataque", desc: "Cortes rápidos pelas costas causam dano duplicado." }
  ],
  warlock: [
    { name: "Feiticeiro Rúnico", bonus: "+30% Defesa", desc: "Barreira rúnica que drena a força do atacante." },
    { name: "Lorde Demônio", bonus: "+30% Ataque", desc: "Chamas do abismo queimam as almas dos adversários continuamente." }
  ],
  samurai: [
    { name: "Sacerdote das Almas", bonus: "+30% Defesa", desc: "Postura defensiva inabalável que bloqueia e contra-ataca." },
    { name: "Ronin Desgarrado", bonus: "+30% Ataque", desc: "Aura de foco espiritual que ignora a armadura do inimigo." }
  ],
  monk: [
    { name: "Protetor do Vento", bonus: "+30% Defesa", desc: "Redireciona ataques à distância com redemoinhos de Chi." },
    { name: "Mestre do Punho", bonus: "+30% Ataque", desc: "Combos devastadores de punho geram ondas de choque." }
  ],
  bard: [
    { name: "Doutor da Peste", bonus: "+30% Defesa", desc: "Melodias protetivas que curam e removem efeitos negativos." },
    { name: "Voz da Tempestade", bonus: "+30% Ataque", desc: "Notas de choque elétrico encadeiam danos entre inimigos." }
  ],
  gunslinger: [
    { name: "Barreira Sagrada", bonus: "+30% Defesa", desc: "Gera um escudo de força mecânico de alta tecnologia." },
    { name: "Pistoleiro Errante", bonus: "+30% Ataque", desc: "Sobrecarga de pólvora faz tiros explodirem em fogo." }
  ],
  alchemist: [
    { name: "Ecomante de Pedra", bonus: "+30% Defesa", desc: "Elixires fortificantes de pedra aumentam drasticamente a armadura." },
    { name: "Cria do Abismo", bonus: "+30% Ataque", desc: "Reagentes altamente instáveis que causam reações em cadeia." }
  ],
  vampire: [
    { name: "Casca Blindada", bonus: "+30% Defesa", desc: "Endurece o sangue coagulado para criar armadura sob a pele." },
    { name: "Devorador", bonus: "+30% Ataque", desc: "Mordidas de banquete drenam ainda mais vida e fúria." }
  ],
  reaper: [
    { name: "Lorde da Cinza", bonus: "+30% Defesa", desc: "Aura cinzenta que reduz o ímpeto e ataque dos inimigos." },
    { name: "Sombrio", bonus: "+30% Ataque", desc: "Foice imbuída em energias mortais que aumentam o dano puro." }
  ],
  ecomancer: [
    { name: "Ecomante de Pedra", bonus: "+30% Defesa", desc: "Pele pétrea regenerativa ativa durante anomalias temporais." },
    { name: "Teclador Temporal", bonus: "+30% Ataque", desc: "Acelera as linhas de eco para disparos rítmicos mais rápidos." }
  ],
  symbiote: [
    { name: "Casca Blindada", bonus: "+30% Defesa", desc: "Mutação de carapaça espessa que absorve impactos." },
    { name: "Devorador", bonus: "+30% Ataque", desc: "Tentáculos maiores para dilacerar e devorar mais rápido." }
  ]
};

function skinSpriteUrl(cls: PlayerClass, idx: number, hi: Record<PlayerClass, string>): string {
  if (idx === 5) return hi[cls];
  if (idx === 7) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64'><circle cx='32' cy='32' r='22' fill='none' stroke='%23ffd700' stroke-width='2' stroke-dasharray='4,2'/><circle cx='32' cy='32' r='14' fill='%23090215' stroke='%23ff4500' stroke-width='3'/><path d='M8 32h6M50 32h6M32 8v6M32 50v6' stroke='%23ff4500' stroke-width='3' stroke-linecap='round'/><circle cx='32' cy='32' r='8' fill='%23ff4500' opacity='0.35'/></svg>";
  }
  const base = import.meta.env.BASE_URL || "/";
  const prefix = base.endsWith("/") ? base : base + "/";
  return `${prefix}sprites/skin-${cls}-${idx}.png`;
}

export type ClassSelectScreenProps = {
  selectedClass: PlayerClass;
  selectedSkin: number;
  onSelectClass: (c: PlayerClass) => void;
  onSelectSkin: (i: number) => void;
  onBack: () => void;
  onStart: (subClass: string, ascensionLvl: number) => void;
};

export default function ClassSelectScreen({
  selectedClass,
  selectedSkin,
  onSelectClass,
  onSelectSkin,
  onBack,
  onStart,
}: ClassSelectScreenProps) {
  const [subClass, setSubClass] = React.useState<string>("");
  const [ascension, setAscension] = React.useState<number>(1);

  React.useEffect(() => {
    const list = SUBCLASSES[selectedClass];
    if (list && list.length > 0) {
      setSubClass(list[0].name);
    }
  }, [selectedClass]);

  const info = useMemo(
    () => CLASS_INFO.find((c) => c.id === selectedClass) ?? CLASS_INFO[0],
    [selectedClass],
  );
  const skins = CLASS_SKINS[selectedClass] || [];
  const portrait = skinSpriteUrl(selectedClass, selectedSkin, CYBER_PORTRAITS);
  const isPixel = selectedSkin !== 5 && selectedSkin !== 6;
  const accent = info.accent;

  // Map class IDs to beautiful corresponding Lucide icons
  const getClassIcon = (classId: PlayerClass) => {
    switch (classId) {
      case "melee": return <Swords className="w-4 h-4 text-rose-500 animate-pulse" />;
      case "magic": return <Wand2 className="w-4 h-4 text-sky-400" />;
      case "paladin": return <Shield className="w-4 h-4 text-amber-400" />;
      case "necro": return <Activity className="w-4 h-4 text-purple-400" />;
      case "archer": return <Activity className="w-4 h-4 text-green-400" />;
      case "druid": return <Activity className="w-4 h-4 text-emerald-500" />;
      case "assassin": return <Swords className="w-4 h-4 text-pink-500" />;
      case "warlock": return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case "samurai": return <Swords className="w-4 h-4 text-red-500" />;
      case "monk": return <Shield className="w-4 h-4 text-orange-400" />;
      case "bard": return <Sparkles className="w-4 h-4 text-pink-300" />;
      case "gunslinger": return <Swords className="w-4 h-4 text-purple-300" />;
      case "alchemist": return <Sparkles className="w-4 h-4 text-teal-400" />;
      case "vampire": return <Heart className="w-4 h-4 text-rose-600" />;
      case "reaper": return <Swords className="w-4 h-4 text-emerald-300" />;
      case "ecomancer": return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case "symbiote": return <Activity className="w-4 h-4 text-lime-400" />;
      default: return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  // List animations variants
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="cs-root font-sans"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Background layers */}
      <div className="cs-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="cs-vignette" />
      <div className="cs-grid-overlay" />

      <div className="cs-shell">
        {/* Header */}
        <header className="cs-header">
          <div className="cs-header-line" />
          <h1 className="cs-title">
            <span className="cs-title-dim">✦</span>
            <span>ESCOLHA SEU HERÓI</span>
            <span className="cs-title-dim">✦</span>
          </h1>
          <p className="cs-subtitle">
            17 classes lendárias · 7 skins exclusivas · Uma jornada eterna
          </p>
          <div className="cs-header-line" />
        </header>

        {/* Main two-column layout */}
        <div className="cs-main">
          {/* LEFT: class list with own scroll */}
          <aside className="cs-left">
            <div className="cs-panel-head">
              <span className="cs-panel-kicker">01 · CLASSES</span>
              <span className="cs-count">{CLASS_INFO.length}</span>
            </div>
            <motion.div 
              className="cs-classlist"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {CLASS_INFO.map((c) => {
                const active = c.id === selectedClass;
                return (
                  <motion.button
                    variants={itemVariants}
                    key={c.id}
                    onClick={() => onSelectClass(c.id)}
                    className={`cs-classcard${active ? " is-active" : ""}`}
                    style={active ? { ["--card-accent" as string]: c.accent } : undefined}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="cs-classcard-icon">
                      <img
                        src={`${import.meta.env.BASE_URL || "/"}sprites/skin-${c.id}-0.png`}
                        alt=""
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.visibility = "hidden";
                        }}
                      />
                    </div>
                    <div className="cs-classcard-body">
                      <div className="flex items-center gap-1.5">
                        {getClassIcon(c.id)}
                        <span className="cs-classcard-name">{c.name}</span>
                      </div>
                      <div className="cs-classcard-role">{c.role}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? "text-[var(--card-accent)]" : "text-neutral-600"}`} />
                  </motion.button>
                );
              })}
            </motion.div>
          </aside>

          {/* RIGHT: detail column with own scroll */}
          <section className="cs-right">
            <AnimatePresence mode="wait">
              <motion.div 
                className="cs-detail" 
                key={info.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {/* Portrait row */}
                <div className="cs-portrait-row">
                  <div className="cs-portrait">
                    <div className="cs-portrait-ring" />
                    <img
                      src={portrait}
                      alt={info.name}
                      style={{ imageRendering: isPixel ? "pixelated" : "auto" }}
                      className={`cs-portrait-img ${selectedSkin === 6 ? "is-celestial" : ""}`}
                      onError={(e) => {
                        e.currentTarget.style.opacity = "0";
                      }}
                    />
                  </div>
                  <div className="cs-portrait-meta">
                    <div className="cs-role-tag flex items-center gap-1">
                      {getClassIcon(info.id)}
                      <span>{info.role}</span>
                    </div>
                    <h2 className="cs-hero-name">{info.name}</h2>
                    <p className="cs-hero-tag">{info.tagline}</p>
                    <p className="cs-hero-lore">{info.lore}</p>
                  </div>
                </div>

                {/* Skins strip */}
                <div className="cs-section">
                  <div className="cs-section-head">
                    <span className="cs-section-num">02</span>
                    <span className="cs-section-title">SKINS EXCLUSIVAS</span>
                    <span className="cs-section-line" />
                  </div>
                  <div className="cs-skinrow">
                    {skins.map((sk, idx) => {
                      const active = idx === selectedSkin;
                      const isCyber = idx === 5;
                      const isCelestial = idx === 6;
                      const isEclipse = idx === 7;
                      let badgeText = "";
                      if (isCyber) badgeText = "CYBER";
                      if (isCelestial) badgeText = "ASTRAL";
                      if (isEclipse) badgeText = "ECLIPSE";

                      return (
                        <button
                          key={idx}
                          onClick={() => onSelectSkin(idx)}
                          className={`cs-skincard${active ? " is-active" : ""}${isCyber ? " is-cyber" : ""}${isCelestial ? " is-celestial" : ""}${isEclipse ? " is-eclipse" : ""}`}
                        >
                          <div className={`cs-skin-thumb ${isCelestial ? "is-celestial" : ""}${isEclipse ? "is-eclipse" : ""}`}>
                            <img
                              src={skinSpriteUrl(selectedClass, idx, CYBER_PORTRAITS)}
                              alt={sk.name}
                              style={{ imageRendering: (idx === 5 || idx === 6 || idx === 7) ? "auto" : "pixelated" }}
                              onError={(e) => {
                                e.currentTarget.style.opacity = "0";
                              }}
                            />
                          </div>
                          <div className="cs-skin-name">{sk.name}</div>
                          {badgeText && (
                            <span className={`cs-skin-badge ${isCelestial ? "bg-gradient-to-r from-purple-500 to-sky-400 !text-white" : ""} ${isEclipse ? "bg-gradient-to-r from-amber-600 to-red-600 !text-white" : ""}`}>
                              {badgeText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="cs-skin-desc">{skins[selectedSkin]?.description}</p>
                </div>

                {/* Stats */}
                <div className="cs-section">
                  <div className="cs-section-head">
                    <span className="cs-section-num">03</span>
                    <span className="cs-section-title">ATRIBUTOS INICIAIS</span>
                    <span className="cs-section-line" />
                  </div>
                  <div className="cs-stats-grid">
                    <StatBar label="HP" value={info.stats.hp} max={140} color="#22c55e" icon={<Heart className="w-3.5 h-3.5 text-green-500" />} />
                    <StatBar label="MP" value={info.stats.mp} max={120} color="#3b82f6" icon={<Zap className="w-3.5 h-3.5 text-blue-500" />} />
                    <StatBar label="STR" value={info.stats.str} max={12} color="#ef4444" icon={<Swords className="w-3.5 h-3.5 text-red-500" />} />
                    <StatBar label="AGI" value={info.stats.agi} max={12} color="#eab308" icon={<Activity className="w-3.5 h-3.5 text-yellow-500" />} />
                    <StatBar label="INT" value={info.stats.int} max={12} color="#a855f7" icon={<Sparkles className="w-3.5 h-3.5 text-purple-500" />} />
                    <StatBar label="VIT" value={info.stats.vit} max={12} color="#14b8a6" icon={<Shield className="w-3.5 h-3.5 text-teal-500" />} />
                  </div>
                </div>

                {/* Weapon / attack */}
                <div className="cs-section">
                  <div className="cs-section-head">
                    <span className="cs-section-num">04</span>
                    <span className="cs-section-title">ARMA & ATAQUE BASE</span>
                    <span className="cs-section-line" />
                  </div>
                  <div className="cs-weapon">
                    <div>
                      <div className="cs-weapon-kicker">ARMA</div>
                      <div className="cs-weapon-name">{info.weapon}</div>
                    </div>
                    <div className="cs-weapon-sep" />
                    <div>
                      <div className="cs-weapon-kicker">ESTILO DE ATAQUE</div>
                      <div className="cs-weapon-desc">{info.attackStyle}</div>
                    </div>
                  </div>
                  <div className="cs-passive">
                    <div className="cs-passive-kicker flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>PASSIVA · {info.passive.name.toUpperCase()}</span>
                    </div>
                    <div className="cs-passive-desc">{info.passive.desc}</div>
                  </div>
                </div>

                {/* Skills */}
                <div className="cs-section">
                  <div className="cs-section-head">
                    <span className="cs-section-num">05</span>
                    <span className="cs-section-title">HABILIDADES</span>
                    <span className="cs-section-line" />
                  </div>
                  <div className="cs-skills">
                    {info.skills.map((s) => (
                      <div key={s.key} className="cs-skill">
                        <div className="cs-skill-key">{s.key}</div>
                        <div className="cs-skill-body">
                          <div className="cs-skill-head">
                            <span className="cs-skill-name">{s.name}</span>
                            <span className="cs-skill-cost">{s.cost} MP</span>
                          </div>
                          <div className="cs-skill-desc flex items-start gap-1">
                            <CornerDownRight className="w-3 h-3 text-neutral-600 mt-1 flex-shrink-0" />
                            <span>{s.desc}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Especialização (Subclasses) */}
                <div className="cs-section">
                  <div className="cs-section-head">
                    <span className="cs-section-num">06</span>
                    <span className="cs-section-title">ESPECIALIZAÇÃO</span>
                    <span className="cs-section-line" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {(SUBCLASSES[selectedClass] || []).map((sub) => {
                      const active = sub.name === subClass;
                      return (
                        <button
                          key={sub.name}
                          onClick={() => setSubClass(sub.name)}
                          className={`p-3 rounded border text-left transition-all relative ${
                            active
                              ? "bg-amber-500/10 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white font-mono">{sub.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold tracking-wider font-mono">
                              {sub.bonus}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">{sub.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ascensão (Class Ascension Level) */}
                <div className="cs-section">
                  <div className="cs-section-head">
                    <span className="cs-section-num">07</span>
                    <span className="cs-section-title">NÍVEL DE ASCENSÃO</span>
                    <span className="cs-section-line" />
                  </div>
                  <div className="mt-3 bg-neutral-900/40 border border-neutral-900 p-4 rounded flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <span>ASCENSÃO {ascension}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            BÔNUS: +{(ascension - 1) * 15}% ATK / DEF
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                          Multiplica seu ATK e DEF globais por 1.15x a cada nível de ascensão selecionado!
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setAscension(num)}
                          className={`flex-1 py-1.5 text-xs font-bold font-mono rounded border transition-all ${
                            ascension === num
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                              : "bg-neutral-950/80 border-neutral-900 text-neutral-400 hover:bg-neutral-900"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="cs-spacer" />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>

        {/* Footer actions */}
        <footer className="cs-footer">
          <button onClick={onBack} className="cs-btn cs-btn-ghost">
            ← VOLTAR
          </button>
          <div className="cs-footer-info">
            <span className="cs-footer-label">Selecionado</span>
            <span className="cs-footer-value text-right">
              {info.name} · {skins[selectedSkin]?.name ?? "—"} <br />
              <span className="text-[10px] text-amber-400">{subClass} · Ascensão {ascension}</span>
            </span>
          </div>
          <button onClick={() => onStart(subClass, ascension)} className="cs-btn cs-btn-primary">
            COMEÇAR JORNADA →
          </button>
        </footer>
      </div>
    </motion.div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon?: React.ReactNode;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="cs-stat">
      <div className="cs-stat-row flex items-center justify-between">
        <span className="cs-stat-label flex items-center gap-1">
          {icon}
          <span>{label}</span>
        </span>
        <span className="cs-stat-value">{value}</span>
      </div>
      <div className="cs-stat-track">
        <motion.div 
          className="cs-stat-fill" 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }} 
        />
      </div>
    </div>
  );
}
