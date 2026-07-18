// World events: Tempestade de Meteoros, Lua Vermelha, Terremoto.
// The scheduler picks a random event roughly every few minutes when idle.

import { TILE } from "./engine";
import type { GameState } from "./game";
import { spawnVeinNear } from "./mining";

export type EventKind = "meteor" | "bloodMoon" | "earthquake";

export type ActiveEvent = {
  kind: EventKind;
  life: number;
  totalLife: number;
  data?: { meteorCd?: number };
};

export function initEvents(g: GameState) {
  g.activeEvent = null;
  g.eventCd = 90 + Math.random() * 120;
  g.meteorTimer = 0;
  g.meteors = [];
}

export function triggerEvent(g: GameState, kind: EventKind) {
  const totalLife = kind === "meteor" ? 300 : kind === "bloodMoon" ? 240 : 8;
  g.activeEvent = { kind, life: totalLife, totalLife, data: { meteorCd: 0 } };
  const msg = kind === "meteor" ? "☄ Tempestade de Meteoros! Corra até os cristais caídos."
    : kind === "bloodMoon" ? "🌑 Lua Vermelha! Todos os drops triplicados."
    : "🌍 Terremoto! Cavernas se abrem, cuidado!";
  const color = kind === "meteor" ? "#ff9040" : kind === "bloodMoon" ? "#ff4060" : "#c8a060";
  g.log.unshift({ text: msg, color, life: 10 });
}

export function tickEvents(g: GameState, dt: number) {
  if (g.activeEvent) {
    g.activeEvent.life -= dt;
    if (g.activeEvent.kind === "meteor") {
      const d = g.activeEvent.data!;
      d.meteorCd = (d.meteorCd ?? 0) - dt;
      if (d.meteorCd <= 0) {
        d.meteorCd = 3 + Math.random() * 4;
        // Drop a meteor near the player: schedule a falling projectile.
        const ang = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 400;
        const tx = g.player.pos.x + Math.cos(ang) * dist;
        const ty = g.player.pos.y + Math.sin(ang) * dist;
        g.meteors.push({ x: tx, y: ty - 400, vx: 0, vy: 480, life: 1.6 });
      }
    }
    if (g.activeEvent.kind === "earthquake") {
      // brief camera shake handled in render via activeEvent.life
      if (Math.random() < dt * 0.6) {
        // occasionally spawn an extra vein or two nearby ("caverna aberta")
        spawnVeinNear(g, g.player.pos.x, g.player.pos.y);
      }
    }
    if (g.activeEvent.life <= 0) {
      g.log.unshift({ text: "Evento terminou.", color: "#c0c0c0", life: 6 });
      g.activeEvent = null;
      g.eventCd = 180 + Math.random() * 240;
    }
  } else {
    g.eventCd -= dt;
    if (g.eventCd <= 0) {
      const r = Math.random();
      const kind: EventKind = r < 0.4 ? "meteor" : r < 0.8 ? "bloodMoon" : "earthquake";
      triggerEvent(g, kind);
    }
  }
  // Meteors update
  for (const m of [...g.meteors]) {
    m.life -= dt;
    m.y += m.vy * dt;
    if (m.life <= 0) {
      // impact: spawn a rare meteoric vein
      const tx = Math.floor(m.x / TILE), ty = Math.floor(m.y / TILE);
      if (tx > 2 && ty > 2 && tx < g.activeMap.size - 2 && ty < g.activeMap.size - 2 && !g.activeMap.isBlocked(tx, ty)) {
        spawnVeinNear(g, m.x, m.y, Math.random() < 0.5 ? "cristal_meteorico" : "estelarium", "normal");
        g.floaters.push({ x: m.x, y: m.y, text: "💥 Meteoro!", color: "#ff9040", life: 1.5, vy: -20 });
      }
      // Pushing gorgeous fire explosion particles to g.particles!
      if (!g.particles) g.particles = [];
      for (let i = 0; i < 35; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 6;
        g.particles.push({
          x: m.x,
          y: m.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 2.5,
          color: Math.random() < 0.6 ? "#ff5722" : Math.random() < 0.5 ? "#ff9800" : "#ffeb3b",
          size: 2.5 + Math.random() * 3.5,
          life: 0.45 + Math.random() * 0.4,
          maxLife: 0.8,
          alpha: 1,
          grow: -1.8,
          gravity: 0.05,
          drag: 0.95,
        });
      }
      g.meteors = g.meteors.filter(x => x !== m);
    }
  }
}

// Blood moon multiplier (used by drop/mining code)
export function dropMultiplier(g: GameState): number {
  return g.activeEvent?.kind === "bloodMoon" ? 3 : 1;
}
