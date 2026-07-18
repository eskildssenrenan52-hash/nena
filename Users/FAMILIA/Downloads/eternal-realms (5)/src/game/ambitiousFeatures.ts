// Eternal Realms: 10 Extremely Ambitious Systems (Sistemas Divinos)
// Hooked seamlessly into game loops, rendering, and UI.

import { TILE, type Enemy, type WorldTile, type Vec } from "./engine";
import { type GameState } from "./game";

function logMsg(g: GameState, text: string, color = "#fff") {
  g.log.unshift({ text, color, life: 6 });
  if (g.log.length > 8) g.log.pop();
}

// ---------------- TYPE DEFINITIONS & SCHEMAS ----------------

export interface Pet {
  id: string;
  name: string;
  type: "egg" | "fire" | "ice" | "lightning" | "healing";
  level: number;
  xp: number;
  maxXp: number;
  rarity: "Comum" | "Raro" | "Épico" | "Lendário" | "Divino";
  active: boolean;
  color: string;
}

export interface Mercenary {
  id: string;
  name: string;
  role: "Mago" | "Sacerdote" | "Tanque";
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  pos: { x: number; y: number };
  active: boolean;
  color: string;
  attackCd: number;
  cost?: number;
  reqLevel?: number;
  description?: string;
}

export const MERCENARY_CATALOG = [
  { id: "merc_eldrin", name: "Eldrin, o Mago de Runas", role: "Mago", level: 1, hp: 300, maxHp: 300, atk: 45, def: 10, color: "#60a5fa", cost: 5000, reqLevel: 10, description: "Conjura projéteis arcanos rápidos para fustigar alvos de longe." },
  { id: "merc_vaelen", name: "Vaelen, Sacerdote da Luz", role: "Sacerdote", level: 1, hp: 250, maxHp: 250, atk: 25, def: 8, color: "#fef08a", cost: 8000, reqLevel: 20, description: "Abençoa o jogador restaurando o HP periodicamente." },
  { id: "merc_boran", name: "Boran, o Defensor de Ferro", role: "Tanque", level: 1, hp: 600, maxHp: 600, atk: 30, def: 35, color: "#9ca3af", cost: 12000, reqLevel: 30, description: "Atrai os monstros e absorve grandes quantidades de castigo." },
  { id: "merc_zephyrus", name: "Zephyrus, o Arauto do Vento", role: "Mago", level: 1, hp: 350, maxHp: 350, atk: 50, def: 15, color: "#34d399", cost: 25000, reqLevel: 50, description: "Sopros velozes de vento cortante fustigando as frestas." },
  { id: "merc_gorgon", name: "Gorgon, o Golem de Rocha", role: "Tanque", level: 1, hp: 800, maxHp: 800, atk: 40, def: 50, color: "#b45309", cost: 40000, reqLevel: 75, description: "Corpo feito de pedras mágicas imunes a golpes superficiais." },
  { id: "merc_ignis", name: "Ignis, o Devastador", role: "Mago", level: 1, hp: 400, maxHp: 400, atk: 80, def: 12, color: "#f97316", cost: 60000, reqLevel: 100, description: "Magias destrutivas explosivas de altíssimo poder destrutivo." },
  { id: "merc_balthazar", name: "Balthazar, o Sacerdote das Sombras", role: "Sacerdote", level: 1, hp: 450, maxHp: 450, atk: 45, def: 18, color: "#c084fc", cost: 90000, reqLevel: 150, description: "Curas sombrias de alta potência e suporte de longo alcance." },
  { id: "merc_lyra", name: "Lyra, a Tece-Sonhos", role: "Sacerdote", level: 1, hp: 500, maxHp: 500, atk: 35, def: 20, color: "#f472b6", cost: 130000, reqLevel: 200, description: "Projeta orbes de luz celestial revigorante em massa." },
  { id: "merc_ragnar", name: "Ragnar, o Lorde Rúnico", role: "Tanque", level: 1, hp: 1200, maxHp: 1200, atk: 60, def: 55, color: "#10b981", cost: 180000, reqLevel: 250, description: "Utiliza antigas proteções rúnicas para mitigar golpes fatais." },
  { id: "merc_elara", name: "Elara, a Sentinela Estelar", role: "Mago", level: 1, hp: 600, maxHp: 600, atk: 100, def: 25, color: "#22d3ee", cost: 240000, reqLevel: 300, description: "Ataca com cometas estelares brilhantes extremamente precisos." },
  { id: "merc_malakor", name: "Malakor, o General Sombrio", role: "Tanque", level: 1, hp: 1600, maxHp: 1600, atk: 75, def: 70, color: "#6366f1", cost: 320000, reqLevel: 400, description: "Comanda trevas protetoras. Resistência excepcional." },
  { id: "merc_aurora", name: "Aurora, a Sacerdotisa Eterna", role: "Sacerdote", level: 1, hp: 750, maxHp: 750, atk: 55, def: 30, color: "#a7f3d0", cost: 420000, reqLevel: 500, description: "Cura em grande escala invocando a Alvorada dos Deuses." },
  { id: "merc_tiamat", name: "Tiamat, a Cria do Vulcão", role: "Mago", level: 1, hp: 850, maxHp: 850, atk: 150, def: 35, color: "#ef4444", cost: 550000, reqLevel: 600, description: "Lança labaredas concentradas que aniquilam as defesas inimigas." },
  { id: "merc_solaris", name: "Solaris, o Arauto da Fusão", role: "Mago", level: 1, hp: 1000, maxHp: 1000, atk: 180, def: 40, color: "#fbbf24", cost: 750000, reqLevel: 750, description: "Utiliza energia nuclear cósmica para explodir inimigos." },
  { id: "merc_oblivion", name: "Oblivion, a Alma do Vazio", role: "Sacerdote", level: 1, hp: 1100, maxHp: 1100, atk: 90, def: 45, color: "#db2777", cost: 1000000, reqLevel: 900, description: "Regeneração implacável e dreno contínuo das dimensões de vácuo." },
  { id: "merc_titan", name: "Titan, o Gigante Ancestral", role: "Tanque", level: 1, hp: 3000, maxHp: 3000, atk: 110, def: 100, color: "#475569", cost: 1500000, reqLevel: 1050, description: "Colosso milenar inabalável, a barreira definitiva." },
  { id: "merc_astralis", name: "Astralis, a Entidade Sideral", role: "Mago", level: 1, hp: 1300, maxHp: 1300, atk: 240, def: 50, color: "#06b6d4", cost: 2000000, reqLevel: 1200, description: "Dispara pulsares estelares mágicos de altíssimo impacto físico." },
  { id: "merc_necro", name: "Necro, o Sacerdote da Ceifa", role: "Sacerdote", level: 1, hp: 1400, maxHp: 1400, atk: 120, def: 60, color: "#14b8a6", cost: 2500000, reqLevel: 1350, description: "Suga a força vital dos monstros para restaurar o portador." },
  { id: "merc_fenix", name: "Fênix, o Guardião de Fogo", role: "Tanque", level: 1, hp: 3500, maxHp: 3500, atk: 150, def: 130, color: "#ea580c", cost: 3000000, reqLevel: 1500, description: "Renasce das cinzas bloqueando golpes fatais com chamas protetoras." },
  { id: "merc_void_emperor", name: "Kael'Thas, o Imperador do Vazio", role: "Mago", level: 1, hp: 1800, maxHp: 1800, atk: 320, def: 70, color: "#8b5cf6", cost: 4000000, reqLevel: 1650, description: "Chama fendas gravitacionais que estilhaçam exércitos de monstros." },
  { id: "merc_seraphim", name: "Serafim, o Arconte Celestial", role: "Sacerdote", level: 1, hp: 2000, maxHp: 2000, atk: 180, def: 90, color: "#fef08a", cost: 5000000, reqLevel: 1800, description: "Luz absoluta divina que cura e abençoa com proteção contínua." },
  { id: "merc_chronos", name: "Chronos, o Senhor da Eternidade", role: "Tanque", level: 1, hp: 6000, maxHp: 6000, atk: 250, def: 200, color: "#ec4899", cost: 10000000, reqLevel: 2000, description: "Manipula o espaço-tempo para repelir e nulificar todos os impactos sofridos." }
] as const;

export interface Enchantment {
  type: "lifesteal" | "crit" | "fire_aura" | "speed" | "gold_boost";
  value: number;
  level: number;
}

export interface SalvageShip {
  id: string;
  name: string;
  status: "idle" | "sailing" | "ready";
  timer: number; // seconds remaining
  duration: number; // total trip duration
  rewards?: string[];
}

export interface DimensionalRift {
  active: boolean;
  timer: number;
  maxTimer: number;
  modifier: "dano_duplo" | "cura_reduzida" | "furia_veloz";
  mobsKilled: number;
  mobsRequired: number;
  rewardClaimed: boolean;
  savedMap?: any; // To return the player
  savedPos?: Vec;
}

export interface WorldBoss {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  pos: Vec;
  color: string;
  active: boolean;
  spawnTimer: number; // count down to boss arrival
  laserAngle: number;
  attacks: Array<{ x: number; y: number; type: "aoe" | "laser" | "bullet"; radius: number }>;
}

export interface AmbitiousState {
  // 1. Divine Ascension
  ascensionCount: number;
  divineEmbers: number;
  
  // 2. World Bosses
  worldBoss: WorldBoss;

  // 3. Pets Breeding
  pets: Pet[];
  petFood: number;

  // 4. Mercenaries
  mercenaries: Mercenary[];

  // 5. Weather
  weather: "limpo" | "chuva_acida" | "tempestade" | "nevasca" | "blood_moon";
  weatherTimer: number; // changes every 120s

  // 6. Ultimate Skill
  ultimateGauge: number; // 0 to 100
  ultimateMax: number;

  // 7. Rune smithing
  runicShards: number;
  enchantments: Record<string, Enchantment>; // item type to active enchantment

  // 8. Salvage Fleet
  salvageShips: SalvageShip[];

  // 9. Dimensional Rifts
  rift: DimensionalRift;

  // 10. Codex and Titles
  killsCodex: Record<string, number>;
  activeTitle: string;

  // 100x Refinement systems: Gear, Relics & Custom Perks
  mercenaryGear?: {
    tank?: string; // e.g. "Égide de Asterion"
    mage?: string; // e.g. "Cetro do Caos"
    priest?: string; // e.g. "Cálice Divino"
  };
  discoveredRelics?: string[]; // e.g. ["🧭 Bússola do Destino", ...]
}

// ---------------- INITIALIZER ----------------

export function initAmbitiousState(): AmbitiousState {
  return {
    ascensionCount: 0,
    divineEmbers: 0,
    worldBoss: {
      name: "Malkor, o Titã da Fornalha",
      hp: 100000,
      maxHp: 100000,
      atk: 180,
      def: 60,
      pos: { x: 0, y: 0 },
      color: "#ff3300",
      active: false,
      spawnTimer: 180, // spawns automatically every 180 seconds or can be summoned
      laserAngle: 0,
      attacks: [],
    },
    pets: [
      { id: "p1", name: "Ovo de Draguinho", type: "egg", level: 1, xp: 0, maxXp: 100, rarity: "Raro", active: false, color: "#f87171" }
    ],
    petFood: 5,
    mercenaries: [
      { id: "merc_eldrin", name: "Eldrin, o Mago de Runas", role: "Mago", level: 1, xp: 0, maxXp: 150, hp: 300, maxHp: 300, atk: 45, def: 10, pos: { x: 0, y: 0 }, active: false, color: "#60a5fa", attackCd: 0, cost: 5000, reqLevel: 10, description: "Conjura projéteis arcanos rápidos para fustigar alvos de longe." },
      ...MERCENARY_CATALOG.slice(1).map(m => ({
        id: m.id,
        name: m.name,
        role: m.role as "Mago" | "Sacerdote" | "Tanque",
        level: 1,
        xp: 0,
        maxXp: 150,
        hp: 0,
        maxHp: 0,
        atk: m.atk,
        def: m.def,
        pos: { x: 0, y: 0 },
        active: false,
        color: m.color,
        attackCd: 0,
        cost: m.cost,
        reqLevel: m.reqLevel,
        description: m.description
      }))
    ],
    weather: "limpo",
    weatherTimer: 90,
    ultimateGauge: 0,
    ultimateMax: 100,
    runicShards: 15,
    enchantments: {},
    salvageShips: [
      { id: "ship1", name: "Caravela Sideral", status: "idle", timer: 0, duration: 60 },
      { id: "ship2", name: "Caçador de Pérolas", status: "idle", timer: 0, duration: 90 },
      { id: "ship3", name: "Sonda Abissal", status: "idle", timer: 0, duration: 120 }
    ],
    rift: {
      active: false,
      timer: 0,
      maxTimer: 45,
      modifier: "dano_duplo",
      mobsKilled: 0,
      mobsRequired: 15,
      rewardClaimed: false
    },
    killsCodex: {},
    activeTitle: "Nenhum",
    mercenaryGear: {
      tank: undefined,
      mage: undefined,
      priest: undefined,
    },
    discoveredRelics: [],
  };
}

// ---------------- GAME SYSTEMS LOGIC ----------------

export function updateAmbitiousSystems(g: GameState, dt: number) {
  // Ensure state exists
  if (!g.ambitious) {
    g.ambitious = initAmbitiousState();
  }
  const s = g.ambitious;
  const p = g.player;

  // Sync active title
  if (s.activeTitle && s.activeTitle !== "Nenhum") {
    (g as any).playerTitle = s.activeTitle;
  }

  // --- 1. Weather Cycles ---
  s.weatherTimer -= dt;
  if (s.weatherTimer <= 0) {
    const list: AmbitiousState["weather"][] = ["limpo", "chuva_acida", "tempestade", "nevasca", "blood_moon"];
    s.weather = list[Math.floor(Math.random() * list.length)];
    s.weatherTimer = 120; // 2 minutes

    // Log messages with gorgeous colors
    if (s.weather === "chuva_acida") {
      logMsg(g, "⛈️ CLIMA: Uma Chuva Ácida começou! Sua defesa corporal foi reduzida temporariamente.", "#e11d48");
    } else if (s.weather === "tempestade") {
      logMsg(g, "⚡ CLIMA: Uma tempestade violenta estourou! Raios atingem os campos de batalha.", "#06b6d4");
    } else if (s.weather === "nevasca") {
      logMsg(g, "❄️ CLIMA: Uma terrível Nevasca de Asterion reduz o ritmo de todas as criaturas.", "#93c5fd");
    } else if (s.weather === "blood_moon") {
      logMsg(g, "🩸 CLIMA: A Lua de Sangue ascendeu! Inimigos estão enfurecidos, mas os espólios são duplicados!", "#ef4444");
    } else {
      logMsg(g, "☀️ CLIMA: O céu abriu. Ventos suaves sopram sobre as terras de Asterion.", "#34d399");
    }
  }

  // Weather active debuffs / effects
  if (s.weather === "chuva_acida") {
    // reduce speed slightly or shield decay simulation
  } else if (s.weather === "tempestade") {
    // Random lightning strike near player
    if (Math.random() < 0.015) {
      const strikeX = p.pos.x + (Math.random() - 0.5) * 300;
      const strikeY = p.pos.y + (Math.random() - 0.5) * 300;
      
      // Spawn floating indicator and spark particles
      g.floaters.push({
        x: strikeX,
        y: strikeY,
        text: "⚡ RAIO DIVINO!",
        color: "#67e8f9",
        life: 1.2,
        vy: -15,
      });

      // Damage player if too close
      const dist = Math.hypot(p.pos.x - strikeX, p.pos.y - strikeY);
      if (dist < 45) {
        const dmg = Math.floor(5 + p.maxHp * 0.05);
        p.hp = Math.max(1, p.hp - dmg);
        g.shakeTime = 0.4;
        g.shakeIntensity = 8;
        logMsg(g, `⚡ Você foi atingido por um raio e sofreu ${dmg} de dano!`, "#f43f5e");
      }

      // Damage enemies if hit
      for (const en of g.enemies) {
        const dEnemy = Math.hypot(en.pos.x - strikeX, en.pos.y - strikeY);
        if (dEnemy < 50) {
          en.hp = Math.max(0, en.hp - Math.floor(en.maxHp * 0.15 + 10));
          en.hitFlash = 0.3;
        }
      }
    }
  }

  // --- 2. Ultimate Skill Gauge charging ---
  // Keep slowly passive charging
  if (s.ultimateGauge < s.ultimateMax) {
    s.ultimateGauge = Math.min(s.ultimateMax, s.ultimateGauge + dt * 1.5);
  }

  // --- 3. World Boss Spawn / Active Ticks ---
  if (!s.worldBoss.active) {
    s.worldBoss.spawnTimer -= dt;
    if (s.worldBoss.spawnTimer <= 0) {
      triggerWorldBoss(g);
    }
  } else {
    // Tick world boss logic
    const wb = s.worldBoss;
    wb.laserAngle += dt * 0.8;

    // Bullet hell attacks inside the same map
    if (Math.random() < 0.03) {
      // Spawn a dynamic attack circle
      const targetX = p.pos.x + (Math.random() - 0.5) * 200;
      const targetY = p.pos.y + (Math.random() - 0.5) * 200;
      wb.attacks.push({
        x: targetX,
        y: targetY,
        type: Math.random() > 0.4 ? "aoe" : "laser",
        radius: 40 + Math.random() * 40,
      });
    }

    // Tick and resolve attacks
    for (let i = wb.attacks.length - 1; i >= 0; i--) {
      const att = wb.attacks[i];
      // Tick damage on target coordinates
      const dist = Math.hypot(p.pos.x - att.x, p.pos.y - att.y);
      if (dist < att.radius) {
        const dmg = Math.floor(15 + p.maxHp * 0.08);
        p.hp = Math.max(1, p.hp - dmg);
        g.shakeTime = 0.3;
        g.shakeIntensity = 6;
        g.floaters.push({ x: p.pos.x, y: p.pos.y, text: `-${dmg}`, color: "#f43f5e", life: 1.0, vy: -20 });
      }
      wb.attacks.splice(i, 1);
    }

    // Check world boss HP. If it dies, trigger rewards!
    if (wb.hp <= 0) {
      wb.active = false;
      wb.spawnTimer = 240; // 4 minutes until next boss
      logMsg(g, `👑 VITÓRIA DIVINA: ${wb.name} foi expurgado! Todos receberam Fragmentos Rúnicos e Cinzas Divinas!`, "#f59e0b");
      s.runicShards += 12;
      s.divineEmbers += 3;
      p.gold += 5000;
      
      // Spawn nice items
      g.floaters.push({
        x: p.pos.x,
        y: p.pos.y - 30,
        text: "✨ TESOURO DE TITÃ!",
        color: "#ffd700",
        life: 2.0,
        vy: -25
      });
    }
  }

  // --- 4. Pet Actions & Attacks ---
  const activePet = s.pets.find((pt) => pt.active);
  if (activePet && activePet.type !== "egg") {
    // Keep pet following right behind the player
    // In game loop, we can draw the pet adjacent to the player.
    // Periodic pet effects:
    if (Math.random() < 0.02) {
      if (activePet.type === "healing") {
        const heal = Math.floor(10 + activePet.level * 4);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        g.floaters.push({
          x: p.pos.x + 12,
          y: p.pos.y - 12,
          text: `💚 +${heal}`,
          color: "#4ade80",
          life: 1.0,
          vy: -20,
        });
      } else if (activePet.type === "fire" || activePet.type === "lightning" || activePet.type === "ice") {
        // Strike nearest enemy
        let nearest: Enemy | null = null;
        let minDist = 250;
        for (const e of g.enemies) {
          const d = Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y);
          if (d < minDist && e.hp > 0) {
            minDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          const petDmg = Math.floor((15 + activePet.level * 6) * (activePet.rarity === "Divino" ? 3 : activePet.rarity === "Lendário" ? 2.2 : 1.5));
          nearest.hp = Math.max(0, nearest.hp - petDmg);
          nearest.hitFlash = 0.2;
          
          g.floaters.push({
            x: nearest.pos.x,
            y: nearest.pos.y - 10,
            text: `💥 ${petDmg} (${activePet.name})`,
            color: activePet.type === "fire" ? "#f97316" : activePet.type === "lightning" ? "#a855f7" : "#38bdf8",
            life: 1.0,
            vy: -25,
          });

          // Feed pet XP
          activePet.xp += 5;
          if (activePet.xp >= activePet.maxXp) {
            activePet.level += 1;
            activePet.xp = 0;
            activePet.maxXp = Math.floor(activePet.maxXp * 1.3);
            logMsg(g, `🐾 PET UP: ${activePet.name} subiu para o Nível ${activePet.level}!`, "#38bdf8");
          }
        }
      }
    }
  }

  // Local helper for glorious particle visual feedback without circular dependencies
  function spawnAmbitiousParticles(
    game: GameState,
    x: number,
    y: number,
    color: string,
    count = 10,
    options: any = {}
  ) {
    if (!game.particles) game.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      const life = options.maxLife ?? 0.3 + Math.random() * 0.4;
      game.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: options.size ?? 1.6 + Math.random() * 2.4,
        life,
        maxLife: life,
        gravity: options.gravity ?? 0,
        opacity: 1
      } as any);
    }
  }

  // --- 5. Mercenaries Follow & Combat Logic ---
  for (const m of s.mercenaries) {
    if (!m.active) continue;
    
    // Follow smooth interpolation or instant tracking if too far or on separate maps
    const distToPlayer = Math.hypot(p.pos.x - m.pos.x, p.pos.y - m.pos.y);
    if (distToPlayer > 350) {
      m.pos.x = p.pos.x;
      m.pos.y = p.pos.y;
    } else if (distToPlayer > 60) {
      const angle = Math.atan2(p.pos.y - m.pos.y, p.pos.x - m.pos.x);
      m.pos.x += Math.cos(angle) * 3.5;
      m.pos.y += Math.sin(angle) * 3.5;
    }

    // Shielding player (absorb damage)
    if (m.hp < m.maxHp && Math.random() < 0.05) {
      m.hp = Math.min(m.maxHp, m.hp + Math.floor(4 + m.level * 1.5)); // passive regen
    }

    // Attack Target
    m.attackCd -= dt;
    if (m.attackCd <= 0) {
      let nearest: Enemy | null = null;
      let minDist = 220; // Expanded attack range
      for (const e of g.enemies) {
        const d = Math.hypot(e.pos.x - m.pos.x, e.pos.y - m.pos.y);
        if (d < minDist && e.hp > 0) {
          minDist = d;
          nearest = e;
        }
      }

      if (nearest) {
        m.attackCd = m.role === "Mago" ? 1.4 : m.role === "Sacerdote" ? 1.7 : 1.1;
        if (m.role === "Sacerdote") {
          // Heal the player
          const baseHeal = Math.floor(18 + m.level * 4.5);
          p.hp = Math.min(p.maxHp, p.hp + baseHeal);
          // Also heal the priest mercenary!
          m.hp = Math.min(m.maxHp, m.hp + Math.floor(baseHeal * 0.5));

          g.floaters.push({ x: p.pos.x, y: p.pos.y - 12, text: `💚 +${baseHeal}`, color: "#4ade80", life: 1.0, vy: -20 });
          spawnAmbitiousParticles(g, p.pos.x, p.pos.y, "#4ade80", 6, { size: 1.8 });

          // Emergency Divine Shield!
          if (p.hp < p.maxHp * 0.4 && (!p.shield || p.shield < p.maxShield * 0.5)) {
            const shieldAmt = Math.floor(p.maxShield * 0.3 + m.level * 6);
            p.shield = Math.min(p.maxShield, (p.shield || 0) + shieldAmt);
            g.floaters.push({
              x: p.pos.x,
              y: p.pos.y - 25,
              text: `✨ ESCUDO SAGRADO +${shieldAmt}`,
              color: "#fef08a",
              life: 1.5,
              vy: -15
            });
            spawnAmbitiousParticles(g, p.pos.x, p.pos.y, "#fbbf24", 8, { size: 2.2 });
            logMsg(g, `✨ Sacerdote ${m.name} invocou uma Barreira Sagrada para proteger você!`, "#fef08a");
          }
        } else if (m.role === "Mago") {
          // Deal massive Area-Of-Effect (AOE) magical splash damage
          const baseDmg = Math.floor((m.atk * 1.4) - nearest.def * 0.15);
          const finalDmg = Math.max(1, baseDmg);

          // Splash to nearby enemies (within 75px of the main target)
          let splashed = 0;
          for (const e of g.enemies) {
            const distToTarget = Math.hypot(e.pos.x - nearest.pos.x, e.pos.y - nearest.pos.y);
            if (distToTarget <= 75 && e.hp > 0) {
              const splDmg = e === nearest ? finalDmg : Math.floor(finalDmg * 0.65);
              e.hp = Math.max(0, e.hp - splDmg);
              e.hitFlash = 0.2;
              splashed++;

              g.floaters.push({
                x: e.pos.x,
                y: e.pos.y - 15,
                text: `🔮 ${splDmg}`,
                color: m.color,
                life: 1.0,
                vy: -22
              });
              spawnAmbitiousParticles(g, e.pos.x, e.pos.y, m.color, 4, { size: 1.5 });
            }
          }

          if (splashed > 1) {
            g.floaters.push({
              x: nearest.pos.x,
              y: nearest.pos.y - 32,
              text: "💥 IMPACTO ARCANO!",
              color: m.color,
              life: 1.2,
              vy: -12
            });
          }

          // Gain mercenary XP
          m.xp += 5;
          if (m.xp >= m.maxXp) {
            m.level += 1;
            m.xp = 0;
            m.maxXp = Math.floor(m.maxXp * 1.35);
            m.maxHp += 50;
            m.hp = m.maxHp;
            m.atk += 10;
            m.def += 5;
            logMsg(g, `🛡️ EVOLUÇÃO: ${m.name} atingiu o Nível ${m.level}!`, m.color);
            spawnAmbitiousParticles(g, m.pos.x, m.pos.y, m.color, 15, { size: 3.0 });
          }
        } else if (m.role === "Tanque") {
          // Standard physical swipe
          const baseDmg = Math.floor((m.atk * 1.25) - nearest.def * 0.2);
          const finalDmg = Math.max(1, baseDmg);
          nearest.hp = Math.max(0, nearest.hp - finalDmg);
          nearest.hitFlash = 0.2;

          g.floaters.push({
            x: nearest.pos.x,
            y: nearest.pos.y - 15,
            text: `⚔️ ${finalDmg}`,
            color: m.color,
            life: 1.0,
            vy: -22
          });
          spawnAmbitiousParticles(g, nearest.pos.x, nearest.pos.y, m.color, 4, { size: 1.5 });

          // Gain mercenary XP
          m.xp += 5;
          if (m.xp >= m.maxXp) {
            m.level += 1;
            m.xp = 0;
            m.maxXp = Math.floor(m.maxXp * 1.35);
            m.maxHp += 80;
            m.hp = m.maxHp;
            m.atk += 8;
            m.def += 8;
            logMsg(g, `🛡️ EVOLUÇÃO: ${m.name} atingiu o Nível ${m.level}!`, m.color);
            spawnAmbitiousParticles(g, m.pos.x, m.pos.y, m.color, 15, { size: 3.0 });
          }
        }
      }
    }
  }

  // --- 6. Automated Salvage Ships Ticks ---
  for (const ship of s.salvageShips) {
    if (ship.status === "sailing") {
      ship.timer -= dt;
      if (ship.timer <= 0) {
        ship.status = "ready";
        ship.timer = 0;
        
        // Randomly roll salvage loot box contents
        const rareMaterials = ["Pérola Gigante", "Madrepérola Sideral", "Madeira Sagrada", "Fragmento Rúnico de Ouro", "Cinza de Titã"];
        const rolled: string[] = [];
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          rolled.push(rareMaterials[Math.floor(Math.random() * rareMaterials.length)]);
        }
        ship.rewards = rolled;
        logMsg(g, `🚢 FROTA: A embarcação "${ship.name}" retornou ao porto com tesouros exóticos!`, "#10b981");
      }
    }
  }

  // --- 7. Dimensional Rifts Ticks ---
  if (s.rift.active) {
    s.rift.timer -= dt;
    if (s.rift.timer <= 0) {
      failRift(g);
    }
  }
}

// ---------------- DYNAMIC TRIGGER HELPERS ----------------

export function triggerWorldBoss(g: GameState) {
  if (!g.ambitious) g.ambitious = initAmbitiousState();
  const s = g.ambitious;
  
  // Choose coordinates near the player
  const p = g.player;
  s.worldBoss.pos.x = p.pos.x + 200;
  s.worldBoss.pos.y = p.pos.y - 150;
  
  s.worldBoss.hp = s.worldBoss.maxHp;
  s.worldBoss.active = true;
  s.worldBoss.attacks = [];

  logMsg(g, "🚨 ALERTA GERAL: O Titã Malkor, o Titã da Fornalha despertou!", "#ef4444");
  g.shakeTime = 1.5;
  g.shakeIntensity = 12;
}

export function feedActivePet(g: GameState) {
  const s = g.ambitious;
  if (!s) return;
  const activePet = s.pets.find((pt) => pt.active);
  if (!activePet) {
    logMsg(g, "Você não tem nenhum pet ativo para alimentar.", "#ef4444");
    return;
  }
  if (s.petFood <= 0) {
    logMsg(g, "Ração de pet insuficiente. Compre mais!", "#ef4444");
    return;
  }

  s.petFood -= 1;
  
  if (activePet.type === "egg") {
    activePet.xp += 20;
    logMsg(g, `🐾 Você alimentou o ovo! Progresso de incubação: ${activePet.xp}/${activePet.maxXp}`, "#f59e0b");
    if (activePet.xp >= activePet.maxXp) {
      // Hatch!
      const types: Pet["type"][] = ["fire", "ice", "lightning", "healing"];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      activePet.type = chosenType;
      activePet.level = 1;
      activePet.xp = 0;
      activePet.maxXp = 120;
      activePet.name = chosenType === "fire" ? "Draguinho Vulcânico" : chosenType === "ice" ? "Raposa Sideral de Gelo" : chosenType === "lightning" ? "Espectro de Tempestade" : "Fada Curadora da Floresta";
      logMsg(g, `🎉 O ovo eclodiu em um lindo ${activePet.name}!`, "#10b981");
    }
  } else {
    activePet.xp += 25;
    logMsg(g, `🐾 Você alimentou ${activePet.name}! +25 XP.`, "#10b981");
    if (activePet.xp >= activePet.maxXp) {
      activePet.level += 1;
      activePet.xp = 0;
      activePet.maxXp = Math.floor(activePet.maxXp * 1.35);
      logMsg(g, `🐾 PET UP: ${activePet.name} subiu para o Nível ${activePet.level}!`, "#38bdf8");
    }
  }
}

export function triggerDivineAscension(g: GameState) {
  const s = g.ambitious;
  const p = g.player;
  if (!s) return;

  if (p.level < 100) {
    logMsg(g, "Você precisa alcançar o Nível 100 para ascender aos céus.", "#ef4444");
    return;
  }

  s.ascensionCount += 1;
  s.divineEmbers += 10;
  (p as any).divineAscensions = s.ascensionCount;
  
  // Reset character stats but gain huge permanent status multiplier!
  p.level = 1;
  p.xp = 0;
  p.xpNext = 1000;
  p.attr.str = 10;
  p.attr.agi = 10;
  p.attr.int = 10;
  p.attr.vit = 10;
  p.hp = p.maxHp;
  
  logMsg(g, `🌌 ASCENSÃO CELESTIAL: Você ascendeu à Divindade! Nível ${s.ascensionCount} de Ascensão! +20% poder permanente!`, "#ffd700");
  g.shakeTime = 1.8;
  g.shakeIntensity = 15;
}

export function castUltimateSkill(g: GameState) {
  const s = g.ambitious;
  const p = g.player;
  if (!s || s.ultimateGauge < s.ultimateMax) {
    logMsg(g, "Habilidade Suprema não está carregada!", "#ef4444");
    return;
  }

  s.ultimateGauge = 0;
  g.shakeTime = 1.2;
  g.shakeIntensity = 14;

  const ultimateNames: Record<string, string> = {
    melee: "⚡ CHUVA DE ESPADAS CELESTIAIS",
    range: "🏹 CHUVA DE METEOROS SIDERAIS",
    mage: "🔥 ERUPÇÃO CÓSMICA DO VAZIO",
    priest: "☀️ JULGAMENTO DA LUZ INFINITA",
  };

  const name = ultimateNames[p.cls] || "🌀 IMPACTO DIMENSIONAL";
  logMsg(g, `🔥 ATIVADO: ${name}! Dano massivo a todas as criaturas!`, "#f59e0b");

  // Wipe out / damage all visible enemies
  for (const en of g.enemies) {
    const dmg = Math.floor(p.level * 45 + 150 * (s.ascensionCount * 0.2 + 1));
    en.hp = Math.max(0, en.hp - dmg);
    en.hitFlash = 0.4;
    g.floaters.push({
      x: en.pos.x,
      y: en.pos.y - 15,
      text: `💥 ${dmg}!`,
      color: "#f59e0b",
      life: 1.4,
      vy: -25,
    });
  }
}

export function triggerDimensionalRift(g: GameState) {
  const s = g.ambitious;
  if (!s) return;

  s.rift.active = true;
  s.rift.timer = s.rift.maxTimer;
  s.rift.mobsKilled = 0;
  s.rift.mobsRequired = 12 + Math.floor(Math.random() * 6);
  s.rift.rewardClaimed = false;

  // Save current player coordinates
  s.rift.savedPos = { x: g.player.pos.x, y: g.player.pos.y };

  logMsg(g, "🌌 FENDA DE CAOS: Você entrou em uma fenda interdimensional instável! Elimine as ameaças rapidamente!", "#a855f7");
  g.shakeTime = 1.0;
  g.shakeIntensity = 8;
}

function failRift(g: GameState) {
  const s = g.ambitious!;
  s.rift.active = false;
  logMsg(g, "🌌 FENDA DE CAOS: A fenda colapsou e você foi expulso de volta para a realidade.", "#ef4444");
  if (s.rift.savedPos) {
    g.player.pos.x = s.rift.savedPos.x;
    g.player.pos.y = s.rift.savedPos.y;
  }
}

export function claimRiftReward(g: GameState) {
  const s = g.ambitious!;
  if (!s.rift.active || s.rift.mobsKilled < s.rift.mobsRequired) return;
  
  s.rift.active = false;
  s.runicShards += 15;
  g.player.gold += 3000;
  logMsg(g, "🌌 FENDA DE CAOS: Fenda selada com sucesso! Você recebeu 15 Fragmentos Rúnicos!", "#10b981");
}

// ---------------- WEATHER PARTICLE RENDERER OVERLAYS ----------------

export function drawWeatherOverlay(ctx: CanvasRenderingContext2D, s: AmbitiousState, w: number, h: number, time: number) {
  if (s.weather === "limpo") return;

  ctx.save();
  if (s.weather === "nevasca") {
    // Falling snow flakes
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 40; i++) {
      const sx = (Math.sin(time * 0.5 + i * 200) * 0.5 + 0.5) * w;
      const sy = ((time * 60 + i * 40) % h);
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (s.weather === "chuva_acida") {
    // Slanted neon-green rain lines
    ctx.strokeStyle = "rgba(132, 204, 22, 0.3)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 35; i++) {
      const rx = (i * 35) % w;
      const ry = (time * 280 + i * 80) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 16);
      ctx.stroke();
    }
  } else if (s.weather === "tempestade") {
    // Dark flashing storm lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.0;
    for (let i = 0; i < 50; i++) {
      const rx = (i * 24) % w;
      const ry = (time * 450 + i * 60) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 5, ry + 22);
      ctx.stroke();
    }
    // Random background lightning flash
    if (Math.sin(time * 30) > 0.96) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, w, h);
    }
  } else if (s.weather === "blood_moon") {
    // Red ambient fog filter
    const pulse = 0.05 + Math.sin(time * 1.5) * 0.02;
    ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}
