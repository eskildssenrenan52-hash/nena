import {
  TILE,
  BIOMES,
  CLASS_INFO,
  PROFESSION_LIST,
  PROFESSION_NAME,
  CLASS_SKINS,
  type Enemy,
} from "./engine";
import type { GameState } from "./game";
import { getEnemySprite, getSpriteBySlug, slugify } from "./sprites";
import { ORES, PICKAXE_TIERS, miningStats } from "./mining";
import { RECIPES, canCraftRecipe, PROFESSION_BENCH, BENCH_NAME } from "./crafting";
import { ACHIEVEMENTS } from "./achievements";

import { petById } from "@/rucoy/bridge";
import { petSheetImage, petSheetCoords, PET_CELL } from "@/rucoy/petSprites";

function drawActivePet(ctx: CanvasRenderingContext2D, g: GameState, camX: number, camY: number) {
  const pet = g.activePet;
  if (!pet) return;
  const meta = petById(pet.id);
  if (!meta) return;
  const sx = pet.pos.x - camX;
  const sy = pet.pos.y - camY;
  const t = g.time;
  const bob = Math.sin(t * 3 + pet.pos.x * 0.02) * 3;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 14, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // aura tinted by role color
  const grad = ctx.createRadialGradient(sx, sy + bob, 4, sx, sy + bob, 26);
  grad.addColorStop(0, meta.color + "aa");
  grad.addColorStop(1, meta.color + "00");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(sx, sy + bob, 26, 0, Math.PI * 2);
  ctx.fill();

  // Pixel-art sprite from the shared pet sheet, if loaded. Emoji fallback
  // otherwise so the pet remains visible while the image warms up.
  const img = petSheetImage();
  const size = 40;
  if (img) {
    const { sx: cx, sy: cy } = petSheetCoords(pet.id);
    const prev = (ctx as any).imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, cx, cy, PET_CELL, PET_CELL, sx - size / 2, sy + bob - size / 2, size, size);
    ctx.imageSmoothingEnabled = prev;
  } else {
    ctx.font = "26px \"Apple Color Emoji\", \"Segoe UI Emoji\", sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(meta.icon, sx, sy + bob);
    ctx.textBaseline = "alphabetic";
  }

  // name tag
  ctx.font = "bold 9px monospace";
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillText(meta.name, sx + 1, sy - 20 + 1);
  ctx.fillStyle = "#fff";
  ctx.fillText(meta.name, sx, sy - 20);
}

const BIOME_COLOR: Record<number, { base: string; accent: string }> = {};
for (const b of BIOMES) BIOME_COLOR[b.id] = { base: b.color, accent: b.accent };

function caveTint(biomeId: number) {
  const b = BIOMES.find((bb) => bb.id === biomeId);
  return b
    ? b.caveTheme
    : { floor: "#222", wall: "#111", accent: "#666", label: "Caverna", monsters: [], boss: "" };
}

// --------- utilities ---------
function hashXY(x: number, y: number, s = 0) {
  let h = (x * 374761393) ^ (y * 668265263) ^ (s * 2147483647);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}
function shade(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + amt)))
      .toString(16)
      .padStart(2, "0");
  return "#" + f(r) + f(g) + f(b);
}
function mix(hex1: string, hex2: string, t: number): string {
  const p = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(hex1);
  const [r2, g2, b2] = p(hex2);
  const f = (a: number, b: number) =>
    Math.round(a + (b - a) * t)
      .toString(16)
      .padStart(2, "0");
  return "#" + f(r1, r2) + f(g1, g2) + f(b1, b2);
}

function getBlendedBiomeColor(
  g: GameState,
  x: number,
  y: number,
  currentBiomeId: number,
): { base: string; accent: string } {
  const selfColor = BIOME_COLOR[currentBiomeId] || { base: "#4a8a3a", accent: "#2a5a2a" };
  if (!g.activeMap) return selfColor;

  const neighbors = [
    g.activeMap.get(x - 1, y)?.biome,
    g.activeMap.get(x + 1, y)?.biome,
    g.activeMap.get(x, y - 1)?.biome,
    g.activeMap.get(x, y + 1)?.biome,
  ];

  let blendCount = 1;
  let blendedBase = selfColor.base;
  let blendedAccent = selfColor.accent;

  for (const nb of neighbors) {
    if (nb !== undefined && nb !== currentBiomeId) {
      const nbCol = BIOME_COLOR[nb];
      if (nbCol) {
        blendedBase = mix(blendedBase, nbCol.base, 1 / (blendCount + 1));
        blendedAccent = mix(blendedAccent, nbCol.accent, 1 / (blendCount + 1));
        blendCount++;
      }
    }
  }

  return { base: blendedBase, accent: blendedAccent };
}

// --------- tile drawing helpers ---------
function drawGrassTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  x: number,
  y: number,
  time: number,
  blendedColor?: { base: string; accent: string },
) {
  const b = blendedColor || BIOME_COLOR[biomeId] || { base: "#4a8a3a", accent: "#2a5a2a" };
  // Gradient base for rich depth
  const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE);
  grad.addColorStop(0, shade(b.base, 14));
  grad.addColorStop(0.5, b.base);
  grad.addColorStop(1, shade(b.base, -16));
  ctx.fillStyle = grad;
  ctx.fillRect(sx, sy, TILE, TILE);

  // Subtle natural grid-break noise texture
  const h1 = hashXY(x, y, 7);
  if (h1 > 0.5) {
    ctx.fillStyle = shade(b.accent, -10);
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.ellipse(
      sx + 6 + h1 * 20,
      sy + 6 + hashXY(x, y, 8) * 20,
      7 + h1 * 5,
      3.5 + h1 * 2.5,
      h1 * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Dual-layered swaying grass blades with smooth Bezier curves
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    const hh = hashXY(x, y, 20 + i);
    if (hh < 0.4) continue;
    const bx = sx + hh * TILE;
    const by = sy + hashXY(x, y, 30 + i) * TILE;
    const len = 4 + hashXY(x, y, 40 + i) * 6;
    const sway = Math.sin(time * 1.8 + hh * 12) * (1.5 + len * 0.15);

    ctx.strokeStyle = i % 2 === 0 ? shade(b.accent, -18) : shade(b.base, -24);
    ctx.beginPath();
    ctx.moveTo(bx, by + 3);
    ctx.bezierCurveTo(
      bx + sway * 0.4,
      by + 1,
      bx + sway * 0.8,
      by - len * 0.5,
      bx + sway,
      by - len,
    );
    ctx.stroke();
  }

  // Multi-petal wildflower with stems and details
  const fh = hashXY(x, y, 55);
  if (fh > 0.9) {
    const palette = ["#ff70a6", "#ffb400", "#ffd6ff", "#00f5d4", "#ff477e", "#f3c68f"];
    const col = palette[Math.floor(fh * 1000) % palette.length];
    const fx = sx + 8 + hashXY(x, y, 56) * 16;
    const fy = sy + 8 + hashXY(x, y, 57) * 16;

    // stem
    ctx.strokeStyle = shade(b.base, -35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 5);
    ctx.lineTo(fx, fy + 1);
    ctx.stroke();

    // petals
    ctx.fillStyle = col;
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2 + time * 0.3;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(ang) * 2.2, fy + Math.sin(ang) * 2.2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // center bud
    ctx.fillStyle = "#fff7a3";
    ctx.beginPath();
    ctx.arc(fx, fy, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highly-detailed textured stones catching highlights
  const ph = hashXY(x, y, 88);
  if (ph > 0.92) {
    const stX = sx + 5 + ph * 22;
    const stY = sy + 5 + hashXY(x, y, 89) * 22;
    const stSize = 1.8 + ph * 1.6;

    // base shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(stX, stY + 1.5, stSize + 0.5, stSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // stone body
    ctx.fillStyle = ph > 0.96 ? "#7d7a85" : "#5d5c64";
    ctx.beginPath();
    ctx.ellipse(stX, stY, stSize, stSize * 0.7, ph * Math.PI, 0, Math.PI * 2);
    ctx.fill();

    // stone highlight
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(stX - stSize * 0.3, stY - stSize * 0.2, stSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fantasy Biome-Specific Environmental Particles (Fireflies, Embers, Spores, Icy Sparkles)
  const isAmbientBiome = [8, 20, 19, 29, 13, 10, 32, 6, 7, 9, 5].includes(biomeId);
  if (isAmbientBiome) {
    const pHash = hashXY(x, y, 99);
    if (pHash > 0.93) {
      const cycle = (time * 1.5 + pHash * 20) % (Math.PI * 2);
      const intensity = Math.max(0, Math.sin(cycle));
      if (intensity > 0.05) {
        const fx = sx + 6 + hashXY(x, y, 100) * 20 + Math.sin(time * 0.8 + pHash * 5) * 4;
        const fy =
          sy +
          6 +
          hashXY(x, y, 101) * 20 +
          Math.cos(time * 0.7 + pHash * 3) * 4 -
          ((time * 2) % 10);

        ctx.save();
        const glowRad = 3.5 + intensity * 4.5;
        const glowGrd = ctx.createRadialGradient(fx, fy, 0.2, fx, fy, glowRad);
        
        let c1 = "rgba(235, 255, 120, " + intensity + ")";
        let c2 = "rgba(100, 255, 120, " + intensity * 0.3 + ")";
        let core = "#fff";

        if (biomeId === 29 || biomeId === 13) { // Astral / Crystal
          c1 = "rgba(180, 100, 255, " + intensity + ")";
          c2 = "rgba(100, 210, 255, " + intensity * 0.45 + ")";
          core = "#eef5ff";
        } else if (biomeId === 10) { // Volcano
          c1 = "rgba(255, 110, 40, " + intensity + ")";
          c2 = "rgba(255, 40, 0, " + intensity * 0.35 + ")";
          core = "#ffe6d5";
        } else if (biomeId === 32) { // Radioactive
          c1 = "rgba(140, 255, 40, " + intensity + ")";
          c2 = "rgba(40, 180, 20, " + intensity * 0.3 + ")";
          core = "#eaffdf";
        } else if (biomeId === 6 || biomeId === 7) { // Frost/Glacial
          c1 = "rgba(160, 235, 255, " + intensity + ")";
          c2 = "rgba(220, 250, 255, " + intensity * 0.25 + ")";
          core = "#ffffff";
        } else if (biomeId === 9) { // Crimson Forest
          c1 = "rgba(255, 40, 80, " + intensity + ")";
          c2 = "rgba(180, 10, 50, " + intensity * 0.3 + ")";
          core = "#ffe6ec";
        } else if (biomeId === 5) { // Swamp wisps
          c1 = "rgba(140, 220, 180, " + intensity + ")";
          c2 = "rgba(80, 150, 120, " + intensity * 0.25 + ")";
          core = "#d0fffa";
        }

        glowGrd.addColorStop(0, c1);
        glowGrd.addColorStop(0.4, c2);
        glowGrd.addColorStop(1, "rgba(0,0,0,0)");
        
        ctx.fillStyle = glowGrd;
        ctx.beginPath();
        ctx.arc(fx, fy, glowRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(fx, fy, 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

function drawWaterTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
  time: number,
) {
  // Rich deep water gradient
  const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE);
  grad.addColorStop(0, "#215082");
  grad.addColorStop(0.5, "#153d68");
  grad.addColorStop(1, "#0d2b4f");
  ctx.fillStyle = grad;
  ctx.fillRect(sx, sy, TILE, TILE);

  // Layered moving wave flows
  ctx.lineWidth = 1.2;
  const flowSpeed = time * 1.5;
  const localPhase = x * 7.3 + y * 11.9;

  // Wave 1 - Primary current
  ctx.strokeStyle = "rgba(100, 185, 255, 0.22)";
  const off1 = Math.sin(flowSpeed + localPhase) * 3;
  ctx.beginPath();
  ctx.moveTo(sx, sy + 8 + off1);
  ctx.bezierCurveTo(sx + 8, sy + 5 + off1, sx + 18, sy + 11 + off1, sx + TILE, sy + 7 + off1);
  ctx.stroke();

  // Wave 2 - Secondary soft ripples
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  const off2 = Math.cos(flowSpeed * 0.8 + localPhase * 0.7) * 2.5;
  ctx.beginPath();
  ctx.moveTo(sx, sy + 20 + off2);
  ctx.bezierCurveTo(sx + 10, sy + 23 + off2, sx + 22, sy + 17 + off2, sx + TILE, sy + 21 + off2);
  ctx.stroke();

  // Foam patches near shore mock-ups
  const foamHash = hashXY(x, y, 92);
  if (foamHash > 0.84) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx + TILE / 2, sy + TILE / 2, 6 + Math.sin(time + localPhase) * 2, 0, Math.PI, true);
    ctx.stroke();
  }

  // Sparkling animated refraction light beams
  const sparkleHash = hashXY(x, y, 3);
  if (sparkleHash > 0.8) {
    const sparkleCycle = 0.5 + 0.5 * Math.sin(time * 3.5 + (x * 13 + y * 17));
    if (sparkleCycle > 0.2) {
      const spX = sx + 5 + hashXY(x, y, 4) * 22;
      const spY = sy + 5 + hashXY(x, y, 5) * 22;
      const alpha = sparkleCycle * 0.5;

      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = "#8ec5fc";
      ctx.shadowBlur = 4;

      // Starburst sparkle shape
      ctx.beginPath();
      ctx.moveTo(spX, spY - 3);
      ctx.lineTo(spX + 0.8, spY - 0.8);
      ctx.lineTo(spX + 3, spY);
      ctx.lineTo(spX + 0.8, spY + 0.8);
      ctx.lineTo(spX, spY + 3);
      ctx.lineTo(spX - 0.8, spY + 0.8);
      ctx.lineTo(spX - 3, spY);
      ctx.lineTo(spX - 0.8, spY - 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawSandTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  x: number,
  y: number,
  blendedColor?: { base: string; accent: string },
) {
  const base =
    blendedColor?.base || (biomeId === 31 ? "#e8e0c8" : biomeId === 23 ? "#c88054" : "#d09550");
  const grad = ctx.createLinearGradient(sx, sy, sx + TILE, sy + TILE);
  grad.addColorStop(0, shade(base, 18));
  grad.addColorStop(0.5, base);
  grad.addColorStop(1, shade(base, -14));
  ctx.fillStyle = grad;
  ctx.fillRect(sx, sy, TILE, TILE);

  // Soft flowing wind-swept dune crest lines
  ctx.strokeStyle = shade(base, -18);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    const yy = sy + 4 + i * 8 + hashXY(x, y, 10 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(sx, yy);
    ctx.bezierCurveTo(
      sx + 10,
      yy - 3 + Math.sin(i) * 2,
      sx + 22,
      yy + 3 - Math.cos(i) * 2,
      sx + TILE,
      yy,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Shimmering quartz sand grains reflecting light
  const sandHash = hashXY(x, y, 77);
  if (sandHash > 0.85) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let s = 0; s < 3; s++) {
      const sx_pt = sx + 4 + hashXY(x, y, 78 + s) * 24;
      const sy_pt = sy + 4 + hashXY(x, y, 82 + s) * 24;
      ctx.fillRect(sx_pt, sy_pt, 1, 1);
    }
  }

  // Small smooth desert stones with light and shadow
  if (hashXY(x, y, 44) > 0.9) {
    const stX = sx + 8 + hashXY(x, y, 45) * 16;
    const stY = sy + 8 + hashXY(x, y, 46) * 16;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(stX, stY + 1.2, 2.2, 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = shade(base, -32);
    ctx.beginPath();
    ctx.arc(stX, stY, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = shade(base, 25);
    ctx.beginPath();
    ctx.arc(stX - 0.5, stY - 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountainTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  x: number,
  y: number,
  blendedColor?: { base: string; accent: string },
) {
  // Ground background with gradual biome blending
  const b = blendedColor || BIOME_COLOR[biomeId] || { base: "#4a8a3a", accent: "#2a5a2a" };
  const groundGrad = ctx.createLinearGradient(sx, sy, sx, sy + TILE);
  groundGrad.addColorStop(0, shade(b.base, -6));
  groundGrad.addColorStop(1, shade(b.base, -20));
  ctx.fillStyle = groundGrad;
  ctx.fillRect(sx, sy, TILE, TILE);

  // Determinate noise hash for organic rock variations
  const h = hashXY(x, y, 60);
  const isSnow = biomeId === 6 || biomeId === 7 || biomeId === 24;
  const isVolcano = biomeId === 10 || biomeId === 40 || biomeId === 19;

  // Custom theme-based palette
  const rockLight = isVolcano ? "#7a2b20" : isSnow ? "#a1adb8" : "#83838c";
  const rockDark = isVolcano ? "#3a0c0c" : isSnow ? "#454b52" : "#36363d";

  // 1. Cast directional 3D shadow stretching bottom-right
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(sx + 21, sy + 30, 13, 5, Math.PI * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 2. Back mountain peak (Atmospheric depth)
  ctx.fillStyle = rockDark;
  ctx.beginPath();
  ctx.moveTo(sx + 1, sy + 28);
  ctx.lineTo(sx + 14 + h * 4, sy + 5);
  ctx.lineTo(sx + 28, sy + 28);
  ctx.closePath();
  ctx.fill();

  // 3. Front mountain peak - Left Shadowed Face
  ctx.fillStyle = shade(rockLight, -22);
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy + 28);
  ctx.lineTo(sx + 16, sy + 9);
  ctx.lineTo(sx + 16, sy + 28);
  ctx.closePath();
  ctx.fill();

  // 4. Front mountain peak - Right Lit Face
  ctx.fillStyle = shade(rockLight, 18);
  ctx.beginPath();
  ctx.moveTo(sx + 16, sy + 9);
  ctx.lineTo(sx + 27, sy + 28);
  ctx.lineTo(sx + 16, sy + 28);
  ctx.closePath();
  ctx.fill();

  // 5. Rocky cracks & geological fissures for high texture detail
  ctx.strokeStyle = rockDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Crack left
  ctx.moveTo(sx + 16, sy + 9);
  ctx.lineTo(sx + 11, sy + 18);
  ctx.lineTo(sx + 13, sy + 24);
  // Crack right
  ctx.moveTo(sx + 16, sy + 14);
  ctx.lineTo(sx + 21, sy + 21);
  ctx.stroke();

  // 6. Volcanic pulsing molten cracks / magma chamber veins
  if (isVolcano) {
    const lavaPulse = 0.5 + 0.5 * Math.sin(x * 1.5 + y * 2.3);
    ctx.strokeStyle = `rgba(255, ${Math.floor(80 + lavaPulse * 120)}, 20, 0.95)`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(sx + 16, sy + 12);
    ctx.lineTo(sx + 14, sy + 18);
    ctx.lineTo(sx + 18, sy + 25);
    ctx.stroke();

    // Hot magma glow point
    ctx.fillStyle = "rgba(255, 60, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(sx + 14, sy + 18, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. High-altitude Snow Cap on Snowy Mountains
  if (isSnow) {
    // Left snow cap (shadowed)
    ctx.fillStyle = "#cedbe3";
    ctx.beginPath();
    ctx.moveTo(sx + 16, sy + 9);
    ctx.lineTo(sx + 11, sy + 15);
    ctx.lineTo(sx + 14, sy + 14);
    ctx.lineTo(sx + 16, sy + 17);
    ctx.closePath();
    ctx.fill();

    // Right snow cap (bright lit)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(sx + 16, sy + 9);
    ctx.lineTo(sx + 16, sy + 17);
    ctx.lineTo(sx + 18, sy + 14);
    ctx.lineTo(sx + 21, sy + 15);
    ctx.closePath();
    ctx.fill();
  }

  // 8. Visual crisp dark rim outlines
  ctx.strokeStyle = shade(rockDark, -15);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy + 28);
  ctx.lineTo(sx + 16, sy + 9);
  ctx.lineTo(sx + 27, sy + 28);
  ctx.stroke();
}

function drawTreeTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  x: number,
  y: number,
  time: number,
  blendedColor?: { base: string; accent: string },
) {
  // Ground under tree with smooth biome blending
  const b = blendedColor || BIOME_COLOR[biomeId] || { base: "#4a8a3a", accent: "#2a5a2a" };
  ctx.fillStyle = shade(b.base, -14);
  ctx.fillRect(sx, sy, TILE, TILE);

  // Swaying animation (wind effect)
  const sway = Math.sin(time * 1.3 + (x * 3.7 + y * 2.9)) * 1.6;

  // Cast directional 3D shadows stretching bottom-right
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  // base trunk shadow
  ctx.ellipse(sx + 15, sy + 28, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // stretched canopy shadow
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath();
  ctx.ellipse(sx + 21 + sway * 0.4, sy + 32, 12, 4.5, Math.PI * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 1. Highly-detailed wooden trunk with roots and bark grain
  const trunkCol = biomeId === 9 ? "#4d1c12" : biomeId === 8 ? "#3e2912" : "#3b2111";
  ctx.fillStyle = trunkCol;

  // Draw trunk base shape
  ctx.beginPath();
  ctx.moveTo(sx + 13, sy + 28);
  ctx.lineTo(sx + 14 + sway * 0.15, sy + 16);
  ctx.lineTo(sx + 18 + sway * 0.15, sy + 16);
  ctx.lineTo(sx + 19, sy + 28);
  // root flare
  ctx.quadraticCurveTo(sx + 21, sy + 29, sx + 22, sy + 29.5);
  ctx.lineTo(sx + 10, sy + 29.5);
  ctx.quadraticCurveTo(sx + 11, sy + 29, sx + 13, sy + 28);
  ctx.closePath();
  ctx.fill();

  // Bark grain lines
  ctx.strokeStyle = shade(trunkCol, -20);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + 15, sy + 17);
  ctx.lineTo(sx + 14.5, sy + 26);
  ctx.moveTo(sx + 17, sy + 18);
  ctx.lineTo(sx + 17.5, sy + 25);
  ctx.stroke();

  // Dark outline of the trunk for crispness
  ctx.strokeStyle = "#170a05";
  ctx.beginPath();
  ctx.moveTo(sx + 14 + sway * 0.15, sy + 16);
  ctx.lineTo(sx + 13, sy + 28);
  ctx.moveTo(sx + 18 + sway * 0.15, sy + 16);
  ctx.lineTo(sx + 19, sy + 28);
  ctx.stroke();

  // Foliage palette depending on biome ID
  let foliage = "#2a6635",
    foliageHi = "#55a15c",
    foliageDark = "#164420";
  if (biomeId === 8) {
    foliage = "#1a632a";
    foliageHi = "#4bb05e";
    foliageDark = "#0a3a14";
  } else if (biomeId === 9) {
    foliage = "#8a2a4b";
    foliageHi = "#e04e6c";
    foliageDark = "#4d1025";
  } else if (biomeId === 20) {
    foliage = "#4f3fa1";
    foliageHi = "#a87fff";
    foliageDark = "#251a66";
  } else if (biomeId === 25) {
    foliage = "#3ea34e";
    foliageHi = "#a0ffa0";
    foliageDark = "#1a5b25";
  } else if (biomeId === 39) {
    foliage = "#253f3f";
    foliageHi = "#669999";
    foliageDark = "#122424";
  } else if (biomeId === 6 || biomeId === 7 || biomeId === 24) {
    foliage = "#345555";
    foliageHi = "#afdada";
    foliageDark = "#1a3333";
  }

  // 2. Layered Volumetric Leaf Canopy
  const cx = sx + 16 + sway;
  const cy = sy + 13;

  // Shadow/deep foliage base layer
  ctx.fillStyle = foliageDark;
  ctx.beginPath();
  ctx.arc(cx, cy + 1, 13.5, 0, Math.PI * 2);
  ctx.fill();

  // Mid-tone core foliage blobs (overlapping circles)
  ctx.fillStyle = foliage;
  ctx.beginPath();
  ctx.arc(cx - 5, cy + 1, 9, 0, Math.PI * 2); // Left blob
  ctx.arc(cx + 5, cy + 1, 9, 0, Math.PI * 2); // Right blob
  ctx.arc(cx, cy - 4, 9, 0, Math.PI * 2); // Top blob
  ctx.closePath();
  ctx.fill();

  // Highlighter tops (Sunlit leaf clumps)
  ctx.fillStyle = foliageHi;
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 2, 5.5, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 2, 5.5, 0, Math.PI * 2);
  ctx.arc(cx, cy - 6, 5.5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // 3. Special fantasy bioluminescent fruit/berries or glowing spores
  if (biomeId === 20) {
    ctx.save();
    ctx.fillStyle = "#fffa9c";
    ctx.shadowColor = "#fffa9c";
    ctx.shadowBlur = 4;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3 + x + y);

    // Fruit 1
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 2, 1.8 + pulse * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Fruit 2
    ctx.beginPath();
    ctx.arc(cx - 5, cy + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Small floating spore particle
    if (pulse > 0.6) {
      ctx.fillStyle = "rgba(168, 127, 255, 0.7)";
      ctx.fillRect(cx - 8 + pulse * 4, cy - 10 - pulse * 3, 1.5, 1.5);
    }
    ctx.restore();
  } else if (biomeId === 9) {
    // Autumn cherry/apple red buds
    ctx.fillStyle = "#ff3355";
    ctx.beginPath();
    ctx.arc(cx + 5, cy + 1, 1.5, 0, Math.PI * 2);
    ctx.arc(cx - 4, cy + 4, 1.4, 0, Math.PI * 2);
    ctx.arc(cx, cy - 3, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// -------- Mid-biome landmark constructions --------
// Rare 1-tile buildings/ruins placed deterministically inside biomes so the
// overworld feels populated with ancient structures, wells, watchtowers and
// standing-stone circles instead of empty grass.
function drawBiomeConstruction(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  x: number,
  y: number,
  time: number,
) {
  const cx = sx + 16;
  const cy = sy + 16;
  const pick = Math.floor(hashXY(x, y, 777) * 6);

  // ground base shadow
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const isDesert = biomeId === 3 || biomeId === 31;
  const isSnow = biomeId === 6 || biomeId === 7;
  const isVolcano = biomeId === 10 || biomeId === 40;
  const stone = isDesert ? "#c9a86a" : isSnow ? "#c8d4dc" : isVolcano ? "#3a1a12" : "#7a746a";
  const stoneLight = shade(stone, 20);
  const stoneDark = shade(stone, -22);

  if (pick === 0) {
    // Ancient stone ruin — 3 broken columns on a slab
    ctx.fillStyle = stoneDark;
    ctx.fillRect(cx - 12, cy + 6, 24, 4);
    ctx.fillStyle = stone;
    ctx.fillRect(cx - 12, cy + 5, 24, 2);
    for (let i = 0; i < 3; i++) {
      const px = cx - 8 + i * 8;
      const ph = 10 + ((i + Math.floor(hashXY(x, y, 800 + i) * 3)) % 3) * 3;
      ctx.fillStyle = stone;
      ctx.fillRect(px - 2, cy + 5 - ph, 4, ph);
      ctx.fillStyle = stoneLight;
      ctx.fillRect(px - 2, cy + 5 - ph, 1, ph);
      ctx.fillStyle = stoneDark;
      ctx.fillRect(px + 1, cy + 5 - ph, 1, ph);
      // broken cap
      ctx.fillStyle = stoneLight;
      ctx.fillRect(px - 3, cy + 5 - ph, 6, 1.5);
    }
  } else if (pick === 1) {
    // Stone well with wooden roof
    ctx.fillStyle = stone;
    ctx.fillRect(cx - 6, cy - 1, 12, 8);
    ctx.fillStyle = stoneDark;
    ctx.fillRect(cx - 6, cy - 1, 12, 1);
    ctx.fillStyle = "#0a0608";
    ctx.fillRect(cx - 5, cy, 10, 2);
    // pillars
    ctx.fillStyle = "#4a2a14";
    ctx.fillRect(cx - 7, cy - 10, 2, 10);
    ctx.fillRect(cx + 5, cy - 10, 2, 10);
    // roof
    ctx.fillStyle = "#5a3018";
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 10);
    ctx.lineTo(cx, cy - 15);
    ctx.lineTo(cx + 9, cy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7a4028";
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 10);
    ctx.lineTo(cx, cy - 14);
    ctx.lineTo(cx + 9, cy - 10);
    ctx.closePath();
    ctx.stroke();
    // rope + bucket
    ctx.strokeStyle = "#3a2410";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy - 2);
    ctx.stroke();
  } else if (pick === 2) {
    // Stone watchtower (tall) with battlements + torch flame
    ctx.fillStyle = stoneDark;
    ctx.fillRect(cx - 7, cy - 4, 14, 12);
    ctx.fillStyle = stone;
    ctx.fillRect(cx - 6, cy - 14, 12, 12);
    // brick lines
    ctx.strokeStyle = stoneDark;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 12 + i * 3);
      ctx.lineTo(cx + 6, cy - 12 + i * 3);
      ctx.stroke();
    }
    // door
    ctx.fillStyle = "#1a0a08";
    ctx.fillRect(cx - 2, cy + 1, 4, 7);
    // battlements
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = stone;
      ctx.fillRect(cx - 6 + i * 5, cy - 17, 3, 3);
    }
    // window
    ctx.fillStyle = "#ffdd55";
    ctx.fillRect(cx - 1.5, cy - 10, 3, 3);
    // torch flame flicker
    const fl = 0.5 + Math.sin(time * 8 + x + y) * 0.5;
    ctx.fillStyle = `rgba(255,160,60,${0.6 + fl * 0.3})`;
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 12, 2 + fl, 0, Math.PI * 2);
    ctx.fill();
  } else if (pick === 3) {
    // Small stone cottage with door + smoking chimney
    ctx.fillStyle = stone;
    ctx.fillRect(cx - 9, cy - 3, 18, 11);
    ctx.fillStyle = stoneDark;
    ctx.fillRect(cx - 9, cy + 7, 18, 1);
    // roof
    ctx.fillStyle = isSnow ? "#e8f1f8" : "#6a2818";
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 2);
    ctx.lineTo(cx, cy - 12);
    ctx.lineTo(cx + 11, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shade(isSnow ? "#e8f1f8" : "#6a2818", -18);
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 2);
    ctx.lineTo(cx + 11, cy - 2);
    ctx.lineTo(cx + 11, cy - 1);
    ctx.lineTo(cx - 11, cy - 1);
    ctx.closePath();
    ctx.fill();
    // door
    ctx.fillStyle = "#2a1408";
    ctx.fillRect(cx - 2, cy + 1, 4, 7);
    ctx.fillStyle = "#f5c04a";
    ctx.fillRect(cx + 1, cy + 4, 0.7, 0.7);
    // window
    ctx.fillStyle = "#ffdd55";
    ctx.fillRect(cx - 7, cy, 3, 3);
    ctx.fillRect(cx + 4, cy, 3, 3);
    // chimney smoke
    ctx.fillStyle = stoneDark;
    ctx.fillRect(cx + 4, cy - 12, 2.5, 4);
    const puff = (time * 30) % 20;
    ctx.fillStyle = "rgba(220,220,220,0.5)";
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 14 - puff * 0.4, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 17 - puff * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pick === 4) {
    // Menhir / standing stone circle
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const mx = cx + Math.cos(ang) * 10;
      const my = cy + 4 + Math.sin(ang) * 5;
      const mh = 8 + ((i * 3) % 4);
      ctx.fillStyle = stoneDark;
      ctx.fillRect(mx - 2, my - mh, 4, mh);
      ctx.fillStyle = stone;
      ctx.fillRect(mx - 2, my - mh, 2, mh);
    }
    // glyph glow at center
    const g = 0.4 + Math.sin(time * 2 + x + y) * 0.3;
    ctx.fillStyle = `rgba(140,90,255,${g})`;
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(200,180,255,0.9)";
    ctx.fillRect(cx - 0.5, cy + 2.5, 1, 1);
  } else {
    // Shrine with pedestal + glowing crystal / statue head
    ctx.fillStyle = stoneDark;
    ctx.fillRect(cx - 8, cy + 4, 16, 5);
    ctx.fillStyle = stone;
    ctx.fillRect(cx - 7, cy + 3, 14, 2);
    ctx.fillRect(cx - 5, cy - 1, 10, 5);
    ctx.fillStyle = stoneLight;
    ctx.fillRect(cx - 5, cy - 1, 10, 1);
    // statue bust
    ctx.fillStyle = stone;
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = stoneDark;
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 5, 0.6, 0, Math.PI * 2);
    ctx.arc(cx + 1, cy - 5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // aura glow
    const a = 0.35 + Math.sin(time * 1.8 + x) * 0.25;
    const grd = ctx.createRadialGradient(cx, cy - 5, 1, cx, cy - 5, 14);
    grd.addColorStop(0, `rgba(255,220,120,${a})`);
    grd.addColorStop(1, "rgba(255,220,120,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Decorative object drawn on empty ground tiles (deterministic per tile)

function drawDecor(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  x: number,
  y: number,
  time: number,
  blendedColor?: { base: string; accent: string },
) {
  const h = hashXY(x, y, 111);

  // ✨ Rare mid-biome CONSTRUCTIONS (ruins, wells, watchtowers, shrines, cottages,
  // menhir circles). Placed sparsely (~1.5% of grass tiles) and drawn instead of
  // small decor so they read as landmarks. Never spawn on the main city tiles.
  const bh = hashXY(x, y, 555);
  if (bh > 0.985) {
    drawBiomeConstruction(ctx, sx, sy, biomeId, x, y, time);
    return;
  }

  if (h < 0.86) return; // rarity
  const kind = Math.floor(hashXY(x, y, 222) * 6);
  const fx = sx + 6 + hashXY(x, y, 333) * 20;
  const fy = sy + 6 + hashXY(x, y, 444) * 20;

  // Ground cast shadow
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(fx, fy + 4, 5.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (kind === 0) {
    // 1. Luxuriant detailed shrub/bush with highlights
    const bushCol =
      biomeId === 9
        ? "#5a2030"
        : biomeId === 20
          ? "#4a3080"
          : biomeId === 3 || biomeId === 31
            ? "#7a6030"
            : "#255c20";

    // Base dark layer
    ctx.fillStyle = shade(bushCol, -16);
    ctx.beginPath();
    ctx.arc(fx, fy + 0.5, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Leaf cluster blobs
    ctx.fillStyle = bushCol;
    ctx.beginPath();
    ctx.arc(fx - 2, fy - 1, 2.8, 0, Math.PI * 2);
    ctx.arc(fx + 2, fy - 1, 2.8, 0, Math.PI * 2);
    ctx.arc(fx, fy - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Glossy leaf highlights
    ctx.fillStyle = shade(bushCol, 26);
    ctx.beginPath();
    ctx.arc(fx - 1.5, fy - 2, 1.2, 0, Math.PI * 2);
    ctx.arc(fx + 1, fy - 3, 1, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 1) {
    // 2. Faceted mossy stone piles
    // Big rock
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.ellipse(fx - 1, fy + 1, 4, 2.8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#71717a";
    ctx.beginPath();
    ctx.ellipse(fx - 1, fy, 3.5, 2.3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Rock facet reflection
    ctx.fillStyle = "#a1a1aa";
    ctx.beginPath();
    ctx.ellipse(fx - 2, fy - 1, 1.5, 1, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Small adjacent rock
    ctx.fillStyle = "#3e3e42";
    ctx.beginPath();
    ctx.arc(fx + 2.8, fy + 1.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5d5d61";
    ctx.beginPath();
    ctx.arc(fx + 2.8, fy + 1.1, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Cute green moss patch
    if (biomeId === 8 || biomeId === 25) {
      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.arc(fx - 0.5, fy - 1.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 2) {
    // 3. Spotted fairy forest mushroom
    const shroomCol = biomeId === 20 ? "#cc5df2" : biomeId === 36 ? "#906be0" : "#d93636";

    // Mushroom stem/stalk
    ctx.fillStyle = "#e5dfd3";
    ctx.beginPath();
    ctx.moveTo(fx - 1, fy + 3);
    ctx.lineTo(fx - 0.7, fy - 1);
    ctx.lineTo(fx + 0.7, fy - 1);
    ctx.lineTo(fx + 1, fy + 3);
    ctx.closePath();
    ctx.fill();

    // Gill shadows under cap
    ctx.fillStyle = "#b5ae9f";
    ctx.beginPath();
    ctx.ellipse(fx, fy - 1, 3, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red/Purple cap dome
    ctx.fillStyle = shroomCol;
    ctx.beginPath();
    ctx.arc(fx, fy - 1.5, 3.4, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Mushroom white spots
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(fx - 1.2, fy - 3, 0.6, 0, Math.PI * 2);
    ctx.arc(fx + 1.2, fy - 2.5, 0.5, 0, Math.PI * 2);
    ctx.arc(fx, fy - 4, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Bioluminescent ambient fog
    if (biomeId === 20 || biomeId === 36) {
      ctx.save();
      const glowStr = 0.35 + Math.sin(time * 2.5 + x + y) * 0.25;
      const shg = ctx.createRadialGradient(fx, fy - 2.5, 0.5, fx, fy - 2.5, 6);
      shg.addColorStop(0, `rgba(200, 100, 255, ${glowStr})`);
      shg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shg;
      ctx.beginPath();
      ctx.arc(fx, fy - 2.5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (kind === 3) {
    // 4. Crystalline Shards OR Detailed fallen logs
    if (biomeId === 13 || biomeId === 37 || biomeId === 6 || biomeId === 7) {
      const cCol = biomeId === 13 ? "#ccaaff" : biomeId === 37 ? "#9de8f5" : "#badeff";

      // Crystal Shard (Spiky polygon faces)
      ctx.fillStyle = shade(cCol, -34);
      ctx.beginPath();
      ctx.moveTo(fx, fy - 7);
      ctx.lineTo(fx + 3.2, fy + 1);
      ctx.lineTo(fx - 3.2, fy + 1);
      ctx.closePath();
      ctx.fill();

      // Front shiny facet
      ctx.fillStyle = cCol;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 7);
      ctx.lineTo(fx + 2, fy);
      ctx.lineTo(fx, fy + 1);
      ctx.closePath();
      ctx.fill();

      // Specular highlight line
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(fx, fy - 7);
      ctx.lineTo(fx + 0.6, fy - 2);
      ctx.lineTo(fx, fy);
      ctx.closePath();
      ctx.fill();
    } else {
      // Detailed fallen forest log
      const logCol = "#522f16";
      ctx.fillStyle = logCol;
      ctx.fillRect(fx - 4.5, fy - 1, 9, 3.2);

      ctx.strokeStyle = shade(logCol, -24);
      ctx.lineWidth = 1;
      ctx.strokeRect(fx - 4.5, fy - 1, 9, 3.2);

      // Wood rings on log ends
      ctx.fillStyle = "#8a5830";
      ctx.beginPath();
      ctx.ellipse(fx - 4.5, fy + 0.6, 1.2, 1.6, 0, 0, Math.PI * 2);
      ctx.ellipse(fx + 4.5, fy + 0.6, 1.2, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leaf sprout
      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.ellipse(fx, fy - 2.5, 1.2, 2.2, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 4) {
    // 5. Spooky dungeon skull OR Realistic tall fern tuft
    if (biomeId === 27 || biomeId === 28 || biomeId === 33 || biomeId === 38) {
      // High-detail human skeleton skull
      ctx.fillStyle = "#eee7cc";
      ctx.beginPath();
      // Cranium
      ctx.arc(fx, fy - 1, 2.8, 0, Math.PI * 2);
      ctx.fill();
      // Jaw
      ctx.fillRect(fx - 1.5, fy + 1, 3, 1.8);

      // Eye cavities
      ctx.fillStyle = "#1e1a15";
      ctx.beginPath();
      ctx.arc(fx - 1, fy - 0.7, 0.7, 0, Math.PI * 2);
      ctx.arc(fx + 1, fy - 0.7, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Nose cavity
      ctx.fillRect(fx - 0.3, fy + 0.2, 0.6, 0.6);
    } else {
      // Dense tall fern/grass blades swaying
      const cc = BIOME_COLOR[biomeId]?.accent ?? "#255225";
      ctx.strokeStyle = shade(cc, -12);
      ctx.lineWidth = 1.2;
      for (let i = -3; i <= 3; i += 1.5) {
        const swayAmt = Math.sin(time * 2 + i + x) * 1.1;
        ctx.beginPath();
        ctx.moveTo(fx + i, fy + 3);
        ctx.quadraticCurveTo(fx + i * 0.8 + swayAmt * 0.4, fy - 1, fx + i * 0.4 + swayAmt, fy - 4);
        ctx.stroke();
      }
    }
  } else {
    // 6. Dungeon wall torch with fire particles OR Wildflower clump
    if (biomeId === 17 || biomeId === 22 || biomeId === 26 || biomeId === 33) {
      // Iron torch bracket
      ctx.fillStyle = "#2c2d30";
      ctx.fillRect(fx - 1, fy - 1, 2, 5);
      ctx.fillStyle = "#ffd55e";
      ctx.fillRect(fx - 1.5, fy - 2.5, 3, 1.5);

      // Fire flame pulsing
      const fl = 0.55 + Math.sin(time * 9 + (x + y)) * 0.45;
      const fy_torch = fy - 3.5;

      // Fire glow halo
      ctx.save();
      const fireGlow = ctx.createRadialGradient(fx, fy_torch, 0.5, fx, fy_torch, 5 + fl * 4);
      fireGlow.addColorStop(0, "rgba(255, 140, 20, 0.9)");
      fireGlow.addColorStop(0.5, "rgba(255, 50, 0, 0.35)");
      fireGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fireGlow;
      ctx.beginPath();
      ctx.arc(fx, fy_torch, 5 + fl * 4, 0, Math.PI * 2);
      ctx.fill();

      // White-hot core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(fx, fy_torch + 0.5, 1 + fl * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Exquisite high-density flower clump
      const palette = ["#ff9ec4", "#ffe57f", "#e6a3ff", "#a0ffff", "#ff7a5c", "#bc96ff"];
      const col = palette[Math.floor(h * 1000) % palette.length];

      for (let i = 0; i < 3; i++) {
        const fx_fl = fx + (i - 1) * 3;
        const fy_fl = fy + (i % 2) * 1.5 - 1;

        // stem
        ctx.strokeStyle = "#1b4d1b";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx_fl, fy_fl + 4);
        ctx.lineTo(fx_fl, fy_fl + 1);
        ctx.stroke();

        // petals
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(fx_fl, fy_fl, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // yellow core center
        ctx.fillStyle = "#ffdd55";
        ctx.fillRect(fx_fl - 0.4, fy_fl - 0.4, 0.8, 0.8);
      }
    }
  }
}

// Detailed city (renders in place of grass on kind === 5)
function drawCity(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  biomeId: number,
  time: number,
) {
  // stone base
  const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE);
  grad.addColorStop(0, "#c8b490");
  grad.addColorStop(1, "#8a7458");
  ctx.fillStyle = grad;
  ctx.fillRect(sx + 2, sy + 8, TILE - 4, TILE - 10);
  ctx.strokeStyle = "#4a3020";
  ctx.lineWidth = 1;
  ctx.strokeRect(sx + 2, sy + 8, TILE - 4, TILE - 10);
  // battlements
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#c8b490";
    ctx.fillRect(sx + 3 + i * 7, sy + 5, 5, 4);
    ctx.strokeRect(sx + 3 + i * 7, sy + 5, 5, 4);
  }
  // tower
  ctx.fillStyle = "#a89078";
  ctx.fillRect(sx + 12, sy + 2, 8, 10);
  ctx.strokeRect(sx + 12, sy + 2, 8, 10);
  // roof
  ctx.fillStyle = "#7a2818";
  ctx.beginPath();
  ctx.moveTo(sx + 10, sy + 3);
  ctx.lineTo(sx + 16, sy - 3);
  ctx.lineTo(sx + 22, sy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a0a08";
  ctx.stroke();
  // flag
  const wave = Math.sin(time * 4) * 1.5;
  ctx.strokeStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(sx + 16, sy - 3);
  ctx.lineTo(sx + 16, sy - 10);
  ctx.stroke();
  const fCol = BIOME_COLOR[biomeId]?.accent ?? "#5aa8e0";
  ctx.fillStyle = fCol;
  ctx.beginPath();
  ctx.moveTo(sx + 16, sy - 10);
  ctx.lineTo(sx + 22 + wave, sy - 8);
  ctx.lineTo(sx + 16, sy - 6);
  ctx.closePath();
  ctx.fill();
  // door
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(sx + 14, sy + 20, 4, 8);
  // windows glow
  const glow = 0.6 + Math.sin(time * 2) * 0.15;
  ctx.fillStyle = `rgba(240,200,120,${glow})`;
  ctx.fillRect(sx + 7, sy + 14, 3, 3);
  ctx.fillRect(sx + 22, sy + 14, 3, 3);
  ctx.fillStyle = `rgba(240,220,140,${glow})`;
  ctx.fillRect(sx + 14, sy + 5, 4, 4);
}

// Ornate stair
function drawStair(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  kind: number,
  time: number,
) {
  const pulse = 0.55 + Math.sin(time * 4) * 0.35;
  // ground halo
  const grd = ctx.createRadialGradient(sx + 16, sy + 16, 4, sx + 16, sy + 16, 24);
  grd.addColorStop(0, `rgba(240,208,64,${0.85 * pulse})`);
  grd.addColorStop(1, "rgba(240,208,64,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(sx - 8, sy - 8, TILE + 16, TILE + 16);
  // stone frame with beveled edge
  ctx.fillStyle = "#2a1c10";
  ctx.fillRect(sx + 3, sy + 3, 26, 26);
  ctx.fillStyle = "#4a3624";
  ctx.fillRect(sx + 4, sy + 4, 24, 24);
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(sx + 5, sy + 5, 22, 2); // top shadow
  // stepped descent
  ctx.fillStyle = "#100804";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(sx + 6 + i * 2, sy + 6 + i * 3, 20 - i * 4, 2);
  }
  // rune arrow
  ctx.fillStyle = `rgba(255,240,120,${0.85 + pulse * 0.15})`;
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(kind === 6 ? "▼" : "▲", sx + 16, sy + 22);
  ctx.textBaseline = "alphabetic";
  // ornate corners
  ctx.strokeStyle = `rgba(240,208,64,${0.7 + pulse * 0.3})`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 3, sy + 3, 26, 26);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#f0d040";
  ctx.beginPath();
  ctx.moveTo(sx + 3, sy + 8);
  ctx.lineTo(sx + 3, sy + 3);
  ctx.lineTo(sx + 8, sy + 3);
  ctx.moveTo(sx + 24, sy + 3);
  ctx.lineTo(sx + 29, sy + 3);
  ctx.lineTo(sx + 29, sy + 8);
  ctx.moveTo(sx + 3, sy + 24);
  ctx.lineTo(sx + 3, sy + 29);
  ctx.lineTo(sx + 8, sy + 29);
  ctx.moveTo(sx + 24, sy + 29);
  ctx.lineTo(sx + 29, sy + 29);
  ctx.lineTo(sx + 29, sy + 24);
  ctx.stroke();
}

// ---------- City tile (kinds 8..16) rendered over grass ----------
function drawCityFloor(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
) {
  // paved cobblestones — warm sandy palette
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = "#b39c74";
  ctx.fillRect(sx, sy + 15, 32, 2);
  ctx.fillRect(sx + 15, sy, 2, 32);
  const h = hashXY(x, y, 3);
  ctx.fillStyle = `rgba(90,70,40,${0.15 + h * 0.15})`;
  ctx.fillRect(sx + 2, sy + 2, 12, 12);
  ctx.fillRect(sx + 18, sy + 18, 12, 12);
  ctx.fillStyle = `rgba(255,240,200,${0.1 + h * 0.1})`;
  ctx.fillRect(sx + 18, sy + 2, 12, 12);
  ctx.fillRect(sx + 2, sy + 18, 12, 12);
}
function drawTorch(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
  time: number,
  warm = true,
) {
  // sconce
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(sx + 14, sy + 12, 4, 14);
  ctx.fillStyle = "#5a3820";
  ctx.fillRect(sx + 13, sy + 10, 6, 3);
  const fl = 0.6 + Math.sin(time * 8 + x * 1.7 + y) * 0.4;
  const glow = ctx.createRadialGradient(sx + 16, sy + 8, 1, sx + 16, sy + 8, 22);
  glow.addColorStop(
    0,
    warm ? `rgba(255,220,120,${0.55 + fl * 0.3})` : `rgba(160,200,255,${0.55 + fl * 0.3})`,
  );
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - 4, sy - 8, 40, 32);
  ctx.fillStyle = warm ? `rgba(255,160,60,${0.9})` : `rgba(120,180,255,0.9)`;
  ctx.beginPath();
  ctx.ellipse(sx + 16, sy + 8, 3 + fl, 5 + fl, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8c0";
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 8, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
function drawIronGate(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = "#40444c";
  ctx.fillRect(sx + 2, sy + 6, 3, 20);
  ctx.fillRect(sx + 27, sy + 6, 3, 20);
  ctx.fillRect(sx + 2, sy + 4, 28, 3);
  ctx.fillRect(sx + 2, sy + 26, 28, 3);
  ctx.strokeStyle = "#20242a";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const gx = sx + 6 + i * 5;
    ctx.strokeRect(gx, sy + 7, 3, 18);
  }
  ctx.fillStyle = "#e0d090";
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 2, 0, Math.PI * 2);
  ctx.fill();
}
function drawSteelPillar(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  const g = ctx.createLinearGradient(sx, sy, sx + 32, sy);
  g.addColorStop(0, "#3a4048");
  g.addColorStop(0.5, "#7a828e");
  g.addColorStop(1, "#3a4048");
  ctx.fillStyle = g;
  ctx.fillRect(sx + 6, sy + 2, 20, 28);
  ctx.fillStyle = "#20242a";
  ctx.fillRect(sx + 4, sy, 24, 4);
  ctx.fillRect(sx + 4, sy + 28, 24, 4);
  ctx.fillStyle = "#a0a8b4";
  ctx.fillRect(sx + 8, sy + 6, 2, 22);
  ctx.strokeStyle = "#20242a";
  ctx.strokeRect(sx + 6, sy + 2, 20, 28);
}
function drawChest(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  time: number,
  secret = false,
) {
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(sx + 16, sy + 28, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  const wood = secret ? "#5a2a70" : "#6b3c1c";
  const wood2 = secret ? "#7a3a90" : "#8a5028";
  ctx.fillStyle = wood;
  ctx.fillRect(sx + 5, sy + 12, 22, 15);
  ctx.fillStyle = wood2;
  ctx.fillRect(sx + 5, sy + 8, 22, 6);
  ctx.strokeStyle = "#2a1810";
  ctx.strokeRect(sx + 5, sy + 8, 22, 19);
  // bands
  ctx.fillStyle = secret ? "#f0c840" : "#c0a040";
  ctx.fillRect(sx + 5, sy + 13, 22, 2);
  ctx.fillRect(sx + 14, sy + 8, 4, 19);
  // lock
  ctx.fillStyle = "#f0d060";
  ctx.fillRect(sx + 15, sy + 16, 2, 4);
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 15, 2, 0, Math.PI * 2);
  ctx.fill();
  // aura
  const aura = ctx.createRadialGradient(sx + 16, sy + 16, 2, sx + 16, sy + 16, 20);
  aura.addColorStop(
    0,
    secret ? `rgba(200,90,255,${0.35 * pulse})` : `rgba(255,210,80,${0.3 * pulse})`,
  );
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(sx - 4, sy - 4, 40, 40);
}
function drawFountain(ctx: CanvasRenderingContext2D, sx: number, sy: number, time: number) {
  ctx.fillStyle = "#8a95a8";
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3b7fbf";
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6cb2f0";
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;
  const r = 4 + Math.sin(time * 3) * 1.5;
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#c0d8f0";
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 2, 0, Math.PI * 2);
  ctx.fill();
}
function drawCityWall(ctx: CanvasRenderingContext2D, sx: number, sy: number, x: number, y: number) {
  ctx.fillStyle = "#7a746a";
  ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = "#5a544a";
  ctx.fillRect(sx, sy + 15, 32, 2);
  ctx.fillRect(sx + 15, sy, 2, 32);
  const h = hashXY(x, y, 5);
  ctx.fillStyle = `rgba(30,26,20,${0.3 + h * 0.2})`;
  ctx.fillRect(sx + 2, sy + 2, 12, 12);
  ctx.fillRect(sx + 18, sy + 18, 12, 12);
  ctx.fillStyle = `rgba(200,190,170,${0.2})`;
  ctx.fillRect(sx + 18, sy + 2, 12, 12);
  ctx.fillRect(sx + 2, sy + 18, 12, 12);
  ctx.strokeStyle = "#2a2620";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(sx, sy, 32, 32);
}
function drawGrandStair(ctx: CanvasRenderingContext2D, sx: number, sy: number, time: number) {
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  // stone base
  ctx.fillStyle = "#5a5450";
  ctx.fillRect(sx + 2, sy + 2, 28, 28);
  // dark stairwell
  const grad = ctx.createRadialGradient(sx + 16, sy + 16, 2, sx + 16, sy + 16, 16);
  grad.addColorStop(0, "#000");
  grad.addColorStop(1, "#20140a");
  ctx.fillStyle = grad;
  ctx.fillRect(sx + 5, sy + 5, 22, 22);
  // gold rim
  ctx.strokeStyle = `rgba(255,210,80,${0.8 + pulse * 0.2})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 4, sy + 4, 24, 24);
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 1;
  ctx.strokeRect(sx + 2, sy + 2, 28, 28);
  // arrow
  ctx.fillStyle = `rgba(255,220,120,${0.9 * pulse + 0.1})`;
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("▼", sx + 16, sy + 17);
  ctx.textBaseline = "alphabetic";
  // glow halo
  const glow = ctx.createRadialGradient(sx + 16, sy + 16, 4, sx + 16, sy + 16, 28);
  glow.addColorStop(0, `rgba(255,210,80,${0.25 * pulse})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - 8, sy - 8, 48, 48);
}
function drawCityTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  kind: number,
  x: number,
  y: number,
  time: number,
) {
  drawCityFloor(ctx, sx, sy, x, y);
  if (kind === 8) drawTorch(ctx, sx, sy, x, y, time);
  else if (kind === 10) drawIronGate(ctx, sx, sy);
  else if (kind === 11) drawSteelPillar(ctx, sx, sy);
  else if (kind === 12) drawChest(ctx, sx, sy, time, false);
  else if (kind === 13) {
    /* just paved floor */
  } else if (kind === 14) drawCityWall(ctx, sx, sy, x, y);
  else if (kind === 15) drawFountain(ctx, sx, sy, time);
  else if (kind === 16) drawGrandStair(ctx, sx, sy, time);
}

// ---------- Grand Dungeon tile rendering ----------
function drawCrackedWall(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
  floor: number,
) {
  const base = floor > 66 ? "#3a2030" : floor > 33 ? "#2a2830" : "#3c3830";
  const lite = floor > 66 ? "#5a3050" : floor > 33 ? "#484858" : "#5c5648";
  ctx.fillStyle = base;
  ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = lite;
  ctx.fillRect(sx, sy + 15, 32, 2);
  ctx.fillRect(sx + 15, sy, 2, 32);
  const h = hashXY(x, y, 11);
  ctx.fillStyle = `rgba(0,0,0,${0.35 + h * 0.2})`;
  ctx.fillRect(sx + 2, sy + 2, 12, 12);
  ctx.fillRect(sx + 18, sy + 18, 12, 12);
  // cracks
  ctx.strokeStyle = `rgba(0,0,0,0.6)`;
  ctx.lineWidth = 1;
  const cx = sx + 4 + hashXY(x, y, 1) * 22;
  const cy = sy + 4 + hashXY(x, y, 2) * 22;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 6 * (hashXY(x, y, 4) - 0.5) * 2, cy + 8);
  ctx.lineTo(cx + 10 * (hashXY(x, y, 6) - 0.5) * 2, cy + 14);
  ctx.stroke();
}
function drawPlainWall(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
  floor: number,
) {
  const base = floor > 66 ? "#2a1828" : floor > 33 ? "#232028" : "#302c26";
  const lite = floor > 66 ? "#402840" : floor > 33 ? "#3a3846" : "#4a463c";
  ctx.fillStyle = base;
  ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = lite;
  ctx.fillRect(sx, sy + 15, 32, 2);
  ctx.fillRect(sx + 15, sy, 2, 32);
  const h = hashXY(x, y, 13);
  ctx.fillStyle = `rgba(0,0,0,${0.3 + h * 0.15})`;
  ctx.fillRect(sx + 2, sy + 2, 12, 12);
  ctx.fillRect(sx + 18, sy + 18, 12, 12);
}
function drawDungeonFloor(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
  floor: number,
) {
  const base = floor > 66 ? "#181018" : floor > 33 ? "#1a1a22" : "#20201c";
  ctx.fillStyle = base;
  ctx.fillRect(sx, sy, 32, 32);
  const h = hashXY(x, y, 17);
  if (h > 0.7) {
    ctx.fillStyle = `rgba(255,255,255,${(h - 0.7) * 0.08})`;
    ctx.fillRect(sx + 4, sy + 4, 24, 24);
  }
  // occasional cracks
  if (hashXY(x, y, 19) > 0.9) {
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 6, sy + 10);
    ctx.lineTo(sx + 14, sy + 16);
    ctx.lineTo(sx + 22, sy + 14);
    ctx.stroke();
  }
}
function drawDungeonTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  kind: number,
  x: number,
  y: number,
  time: number,
  floor: number,
) {
  if (kind === 2) {
    drawPlainWall(ctx, sx, sy, x, y, floor);
    return;
  }
  if (kind === 9) {
    drawCrackedWall(ctx, sx, sy, x, y, floor);
    return;
  }
  if (kind === 14) {
    drawPlainWall(ctx, sx, sy, x, y, floor);
    return;
  }
  drawDungeonFloor(ctx, sx, sy, x, y, floor);
  if (kind === 8) drawTorch(ctx, sx, sy, x, y, time, floor <= 66);
  else if (kind === 10) drawIronGate(ctx, sx, sy);
  else if (kind === 11) drawSteelPillar(ctx, sx, sy);
  else if (kind === 12) drawChest(ctx, sx, sy, time, false);
  else if (kind === 6 || kind === 7) drawStair(ctx, sx, sy, kind, time);
}

// --------- enemy classification & sprites ---------
type EnemyCategory =
  | "wolf"
  | "spider"
  | "skeleton"
  | "zombie"
  | "slime"
  | "dragon"
  | "wyvern"
  | "fae"
  | "demon"
  | "angel"
  | "fire"
  | "ice"
  | "electric"
  | "wind"
  | "golem"
  | "crystal"
  | "aberration"
  | "phoenix"
  | "aquatic"
  | "scorpion"
  | "bat"
  | "worm"
  | "rat"
  | "insect"
  | "boar"
  | "bear"
  | "eagle"
  | "mushroom"
  | "plant"
  | "ghost"
  | "knight"
  | "mage"
  | "bandit"
  | "cultist"
  | "orc"
  | "mummy"
  | "beholder"
  | "tentacle"
  | "generic";

function classify(name: string): EnemyCategory {
  const n = name.toLowerCase();
  const has = (...s: string[]) => s.some((x) => n.includes(x));
  if (has("lobo", "lobis")) return "wolf";
  if (has("aranha")) return "spider";
  if (has("esqueleto", "esquele", "lich", "cadavé", "necroman", "coveiro", "necrofago"))
    return "skeleton";
  if (has("zumbi", "ghoul", "podre", "afogado", "draugr", "sepulto")) return "zombie";
  if (has("múmia", "mumia", "faraó", "farao", "escrava amaldiç", "escaravelho")) return "mummy";
  if (has("slime", "poça", "poca", "lodo", "ácido", "acido")) return "slime";
  if (has("dragão", "dragao", "wyrm", "basilisco", "draconi")) return "dragon";
  if (has("wyvern")) return "wyvern";
  if (has("fada", "ninfa", "vagalume", "biolumines", "wisp", "espírito sibil", "espirito sibil"))
    return "fae";
  if (has("demônio", "demonio", "diabrete")) return "demon";
  if (has("anjo", "serafim", "herald", "coro", "arauto", "criador", "divin")) return "angel";
  if (has("fenix", "fênix", "phoenix")) return "phoenix";
  if (
    has(
      "salaman",
      "chama",
      "ígneo",
      "igneo",
      "magma",
      "lava",
      "fundido",
      "fumaça",
      "fumaca",
      "cinzas",
      "primal",
    )
  )
    return "fire";
  if (
    has("boreal", "árti", "arti", "yeti", "urso polar", "permafrost", "gelo", "congela", "iceberg")
  )
    return "ice";
  if (has("voltai", "raio", "tempesta", "trovão", "trovao")) return "electric";
  if (
    has(
      "vento",
      "ar ",
      " ar",
      "vórtice",
      "vortice",
      "djinn",
      "aéreo",
      "aereo",
      "sibil",
      "servo do vento",
      "roc",
      "piloto",
    )
  )
    return "wind";
  if (has("golem", "colosso", "titã", "tita", "estátua", "estatua")) return "golem";
  if (has("cristal", "prisma", "vidro", "ametista", "espelho")) return "crystal";
  if (
    has(
      "aberran",
      "aberraç",
      "voraz",
      "fauces",
      "boca",
      "órgão",
      "orgao",
      "coração do mundo",
      "coracao do mundo",
      "coração de mag",
      "coracao de mag",
      "devorador",
    )
  )
    return "aberration";
  if (has("tentácul", "tentacul")) return "tentacle";
  if (has("olho flutuan", "sentinela cós", "sentinela cos", "vigia astral")) return "beholder";
  if (
    has(
      "kraken",
      "polvo",
      "sereia",
      "peixe",
      "tubarão",
      "tubarao",
      "anguí",
      "angui",
      "naga",
      "marujo",
      "corsário",
      "corsario",
      "pirata",
      "capitão",
      "capitao",
      "almirante",
      "leviatã",
      "leviata",
      "skywhale",
    )
  )
    return "aquatic";
  if (has("escorpião", "escorpiao")) return "scorpion";
  if (has("morcego")) return "bat";
  if (has("verme", "larva")) return "worm";
  if (has("rato")) return "rat";
  if (has("traça", "traca", "vagalume gigante", "espo")) return "insect";
  if (has("javali")) return "boar";
  if (has("urso")) return "bear";
  if (has("águia", "aguia", "grifo", "harpia")) return "eagle";
  if (has("cogumelo", "mycon", "micomorfe")) return "mushroom";
  if (
    has(
      "treant",
      "broto",
      "espinho",
      "raiz",
      "guardião floral",
      "guardiao floral",
      "guardião do fungo",
      "guardiao do fungo",
      "espantalho",
      "ídolo",
      "idolo",
    )
  )
    return "plant";
  if (
    has(
      "sombra",
      "assombra",
      "espectro",
      "espectral",
      "fantasma",
      "umbra",
      "aparição",
      "aparicao",
      "assombraç",
      "eco",
    )
  )
    return "ghost";
  if (has("cavaleiro", "legioná", "legiona", "monge", "guardião ancião", "guardiao anciao"))
    return "knight";
  if (has("bruxa", "necromante", "sacerdot", "alquimist", "elfo sombri", "vampiro")) return "mage";
  if (
    has(
      "bandido",
      "salteador",
      "bandoleir",
      "nôma",
      "noma",
      "ladrão",
      "ladrao",
      "caçador",
      "cacador",
      "assassino",
      "arqueiro",
      "corsário jov",
      "minerador",
      "camponês",
      "campones",
      "cidadão",
      "cidadao",
      "contramestre",
      "prefeito",
      "marinheiro amaldi",
    )
  )
    return "bandit";
  if (has("kobold", "anão", "anao")) return "orc";
  if (has("ogro", "trol")) return "orc";
  if (has("cão", "cao ", "cao", " cão")) return "wolf";
  return "generic";
}

function drawBossAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  time: number,
) {
  const pulse = 0.6 + Math.sin(time * 3) * 0.3;
  const grd = ctx.createRadialGradient(x, y, r, x, y, r * 2.4);
  grd.addColorStop(0, `rgba(240,60,80,${0.35 * pulse})`);
  grd.addColorStop(1, "rgba(240,60,80,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
  ctx.fill();
  // rotating rune circle
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(time * 0.8);
  ctx.strokeStyle = `rgba(255,180,60,${0.5 + pulse * 0.3})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, (i / 6) * Math.PI * 2, (i / 6) * Math.PI * 2 + 0.4);
    ctx.stroke();
  }
  ctx.restore();
  // crown
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r - 4);
  ctx.lineTo(x - r * 0.4, y - r - 10);
  ctx.lineTo(x - r * 0.15, y - r - 5);
  ctx.lineTo(x, y - r - 12);
  ctx.lineTo(x + r * 0.15, y - r - 5);
  ctx.lineTo(x + r * 0.4, y - r - 10);
  ctx.lineTo(x + r * 0.6, y - r - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a5010";
  ctx.stroke();
  // gems
  ctx.fillStyle = "#f04060";
  ctx.beginPath();
  ctx.arc(x, y - r - 9, 1.5, 0, Math.PI * 2);
  ctx.fill();
  void color;
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, sx: number, sy: number, time: number) {
  const r = e.radius;
  const col = e.hitFlash > 0 ? "#fff" : e.color;
  const dark = shade(col, -35);
  const light = shade(col, 30);
  const cat = classify(e.name);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + r, r, r / 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  if (e.isBoss) drawBossAura(ctx, sx, sy, r, col, time);

  const bob = Math.sin(time * 3 + e.id) * 1.2;

  // Try AI-generated 32x32 sprite first
  const sprite = getEnemySprite(e.name);
  if (sprite) {
    const scale = (r * 2.4) / 32; // fit sprite to enemy radius
    const size = 32 * scale;
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    if (e.isBoss) {
      ctx.shadowColor = col || "#ef4444";
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 4;
    }
    if (e.hitFlash > 0) {
      ctx.filter = "brightness(3) saturate(0)";
      ctx.drawImage(sprite, sx - size / 2, sy - size / 2 + bob, size, size);
    } else {
      ctx.drawImage(sprite, sx - size / 2, sy - size / 2 + bob, size, size);
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = prev;
    void col;
    void dark;
    void light;
    void cat;
    return;
  }

  switch (cat) {
    case "wolf": {
      // body
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, r, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      // back highlight
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 1, r * 0.9, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx + r * 0.7, sy - r * 0.2, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      // snout
      ctx.fillStyle = shade(col, -20);
      ctx.beginPath();
      ctx.moveTo(sx + r * 1.1, sy - r * 0.2);
      ctx.lineTo(sx + r * 1.5, sy);
      ctx.lineTo(sx + r * 1.1, sy + r * 0.1);
      ctx.closePath();
      ctx.fill();
      // ears
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.5, sy - r * 0.7);
      ctx.lineTo(sx + r * 0.7, sy - r * 1.1);
      ctx.lineTo(sx + r * 0.9, sy - r * 0.6);
      ctx.closePath();
      ctx.fill();
      // eye
      ctx.fillStyle = "#f0e040";
      ctx.beginPath();
      ctx.arc(sx + r * 0.85, sy - r * 0.25, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(sx + r * 0.85 - 0.3, sy - r * 0.25 - 0.3, 0.8, 1.4);
      // fang
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(sx + r * 1.3, sy + r * 0.05);
      ctx.lineTo(sx + r * 1.35, sy + r * 0.25);
      ctx.lineTo(sx + r * 1.25, sy + r * 0.15);
      ctx.closePath();
      ctx.fill();
      // legs
      ctx.fillStyle = dark;
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(sx - r * 0.8 + i * r * 0.5, sy + r * 0.5, r * 0.2, r * 0.5);
      }
      break;
    }
    case "spider": {
      // legs
      ctx.strokeStyle = dark;
      ctx.lineWidth = 2;
      const legOff = Math.sin(time * 6 + e.id) * 2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI - Math.PI * 0.15;
        ctx.beginPath();
        ctx.moveTo(sx - Math.cos(a) * r * 0.4, sy);
        ctx.lineTo(sx - Math.cos(a) * r * 1.4, sy - Math.sin(a) * r * 1.2 + legOff);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * r * 0.4, sy);
        ctx.lineTo(sx + Math.cos(a) * r * 1.4, sy - Math.sin(a) * r * 1.2 - legOff);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      // abdomen
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.2, r * 0.9, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx + r * 0.2, sy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // eyes cluster
      ctx.fillStyle = "#ff4060";
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
          sx - r * 0.3 + (i % 2) * r * 0.4,
          sy - r * 0.1 + Math.floor(i / 2) * r * 0.2,
          1.4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // marking
      ctx.strokeStyle = light;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.4, sy + r * 0.5);
      ctx.lineTo(sx, sy + r * 0.15);
      ctx.lineTo(sx + r * 0.4, sy + r * 0.5);
      ctx.stroke();
      break;
    }
    case "skeleton": {
      // ribcage body
      ctx.fillStyle = "#e8e0c8";
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.3, r * 0.55, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8a806a";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(sx - r * 0.5, sy + r * 0.05 + i * r * 0.2);
        ctx.lineTo(sx + r * 0.5, sy + r * 0.05 + i * r * 0.2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(sx, sy - r * 0.3);
      ctx.lineTo(sx, sy + r * 0.7);
      ctx.stroke();
      // skull
      ctx.fillStyle = "#f0e8d0";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.6, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      // eye sockets
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.22, sy - r * 0.65, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.22, sy - r * 0.65, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // glowing eyes
      ctx.fillStyle = e.isBoss ? "#ff4060" : "#40e0ff";
      ctx.beginPath();
      ctx.arc(sx - r * 0.22, sy - r * 0.65, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.22, sy - r * 0.65, 1.1, 0, Math.PI * 2);
      ctx.fill();
      // teeth
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.28, sy - r * 0.35, r * 0.56, 1);
      for (let i = 0; i < 5; i++) ctx.fillRect(sx - r * 0.24 + i * r * 0.12, sy - r * 0.32, 1, 2);
      // sword
      ctx.strokeStyle = "#c0c0d0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.7, sy);
      ctx.lineTo(sx + r * 1.4, sy - r * 0.6);
      ctx.stroke();
      ctx.strokeStyle = "#8a5010";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.6, sy + r * 0.1);
      ctx.lineTo(sx + r * 0.8, sy - r * 0.1);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
    case "zombie":
    case "mummy": {
      // body
      ctx.fillStyle = cat === "mummy" ? "#c8b890" : shade(col, -20);
      ctx.fillRect(sx - r * 0.6, sy - r * 0.3, r * 1.2, r * 1.2);
      // head
      ctx.fillStyle = cat === "mummy" ? "#e0d0a8" : shade(col, 10);
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.7, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      // bandage lines
      if (cat === "mummy") {
        ctx.strokeStyle = "#8a7050";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const yy = sy - r * 0.3 + i * r * 0.24;
          ctx.beginPath();
          ctx.moveTo(sx - r * 0.6, yy);
          ctx.lineTo(sx + r * 0.6, yy + (i % 2 ? 1 : -1) * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(sx, sy - r * 0.7, r * 0.55, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      // eye
      ctx.fillStyle = "#ff2020";
      ctx.beginPath();
      ctx.arc(sx - r * 0.15, sy - r * 0.75, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.15, sy - r * 0.75, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // mouth
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.2, sy - r * 0.5, r * 0.4, 1);
      ctx.fillStyle = "#5a1010";
      ctx.fillRect(sx - r * 0.15, sy - r * 0.5, r * 0.06, 3);
      // arms outstretched
      ctx.fillStyle = shade(col, -20);
      ctx.fillRect(sx - r * 1.1, sy - r * 0.15, r * 0.5, r * 0.25);
      ctx.fillRect(sx + r * 0.6, sy - r * 0.15, r * 0.5, r * 0.25);
      break;
    }
    case "slime": {
      const wob = Math.sin(time * 5 + e.id) * r * 0.08;
      ctx.fillStyle = shade(col, -20);
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.3, r + wob, r * 0.7 - wob, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.9, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      // shine
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(sx - r * 0.3, sy - r * 0.35, r * 0.3, r * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.25, sy - r * 0.05, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.25, sy - r * 0.05, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx - r * 0.28, sy - r * 0.1, 0.8, 0.8);
      ctx.fillRect(sx + r * 0.22, sy - r * 0.1, 0.8, 0.8);
      break;
    }
    case "dragon":
    case "wyvern": {
      // wings
      const flap = Math.sin(time * 4 + e.id) * 0.4;
      ctx.fillStyle = shade(col, -30);
      ctx.beginPath();
      ctx.moveTo(sx, sy - r * 0.2);
      ctx.quadraticCurveTo(sx - r * 1.4, sy - r * 1.2 + flap * r, sx - r * 1.6, sy + r * 0.2);
      ctx.quadraticCurveTo(sx - r * 0.8, sy - r * 0.1, sx, sy - r * 0.2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx, sy - r * 0.2);
      ctx.quadraticCurveTo(sx + r * 1.4, sy - r * 1.2 + flap * r, sx + r * 1.6, sy + r * 0.2);
      ctx.quadraticCurveTo(sx + r * 0.8, sy - r * 0.1, sx, sy - r * 0.2);
      ctx.fill();
      // body
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.1, r * 0.75, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      // scales
      ctx.fillStyle = shade(col, 20);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let j = 0; j < 3; j++) {
          ctx.arc(sx - r * 0.4 + j * r * 0.4, sy - r * 0.1 + i * r * 0.25, r * 0.12, Math.PI, 0);
        }
        ctx.fill();
      }
      // head
      ctx.fillStyle = shade(col, -10);
      ctx.beginPath();
      ctx.ellipse(sx, sy - r * 0.7, r * 0.55, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // horns
      ctx.fillStyle = "#f0d090";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.3, sy - r * 0.9);
      ctx.lineTo(sx - r * 0.4, sy - r * 1.3);
      ctx.lineTo(sx - r * 0.15, sy - r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.3, sy - r * 0.9);
      ctx.lineTo(sx + r * 0.4, sy - r * 1.3);
      ctx.lineTo(sx + r * 0.15, sy - r * 0.85);
      ctx.closePath();
      ctx.fill();
      // eyes
      ctx.fillStyle = "#f0e040";
      ctx.beginPath();
      ctx.arc(sx - r * 0.2, sy - r * 0.72, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.2, sy - r * 0.72, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.22, sy - r * 0.75, 0.6, 1.5);
      ctx.fillRect(sx + r * 0.18, sy - r * 0.75, 0.6, 1.5);
      // tail
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy + r * 0.9);
      ctx.quadraticCurveTo(sx + r * 0.8, sy + r * 1.2, sx + r * 1.2, sy + r * 0.6);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
    case "fae": {
      // glow aura
      const pulse = 0.6 + Math.sin(time * 4 + e.id) * 0.35;
      const grd = ctx.createRadialGradient(sx, sy, 2, sx, sy, r * 2);
      grd.addColorStop(0, `rgba(255,240,180,${0.6 * pulse})`);
      grd.addColorStop(1, "rgba(255,240,180,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 2, 0, Math.PI * 2);
      ctx.fill();
      // body
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(sx, sy + bob, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      // wings
      ctx.fillStyle = `rgba(255,255,255,0.65)`;
      const wf = Math.sin(time * 10 + e.id) * 0.3;
      ctx.beginPath();
      ctx.ellipse(sx - r * 0.7, sy - r * 0.2, r * 0.5, r * 0.25, -0.5 + wf, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + r * 0.7, sy - r * 0.2, r * 0.5, r * 0.25, 0.5 - wf, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.18, sy - r * 0.1 + bob, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.18, sy - r * 0.1 + bob, 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "demon": {
      // body
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.3, r * 0.85, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.7, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      // horns
      ctx.fillStyle = "#1a0808";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.6, sy - r * 0.5);
      ctx.lineTo(sx - r * 0.9, sy - r * 1.2);
      ctx.lineTo(sx - r * 0.35, sy - r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.6, sy - r * 0.5);
      ctx.lineTo(sx + r * 0.9, sy - r * 1.2);
      ctx.lineTo(sx + r * 0.35, sy - r * 0.7);
      ctx.closePath();
      ctx.fill();
      // face
      ctx.fillStyle = "#ff4020";
      ctx.beginPath();
      ctx.arc(sx - r * 0.25, sy - r * 0.15, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.25, sy - r * 0.15, 2, 0, Math.PI * 2);
      ctx.fill();
      // grin
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy + r * 0.15, r * 0.35, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.lineWidth = 1;
      // fangs
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.15, sy + r * 0.3);
      ctx.lineTo(sx - r * 0.1, sy + r * 0.5);
      ctx.lineTo(sx - r * 0.05, sy + r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.05, sy + r * 0.3);
      ctx.lineTo(sx + r * 0.1, sy + r * 0.5);
      ctx.lineTo(sx + r * 0.15, sy + r * 0.3);
      ctx.closePath();
      ctx.fill();
      // bat wings
      ctx.fillStyle = shade(col, -35);
      const flap = Math.sin(time * 5 + e.id) * 0.4;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.5, sy);
      ctx.quadraticCurveTo(sx - r * 1.5, sy - r * 0.5 + flap * r, sx - r * 1.3, sy + r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.5, sy);
      ctx.quadraticCurveTo(sx + r * 1.5, sy - r * 0.5 + flap * r, sx + r * 1.3, sy + r * 0.4);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "angel": {
      // wings
      ctx.fillStyle = "rgba(240,240,255,0.9)";
      ctx.beginPath();
      ctx.ellipse(sx - r * 0.9, sy - r * 0.2, r * 0.8, r * 0.4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + r * 0.9, sy - r * 0.2, r * 0.8, r * 0.4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // robe
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.5, sy + r);
      ctx.lineTo(sx - r * 0.35, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.35, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.5, sy + r);
      ctx.closePath();
      ctx.fill();
      // head
      ctx.fillStyle = "#f0d0a8";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.4, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // halo
      const pulse = 0.7 + Math.sin(time * 3) * 0.2;
      ctx.strokeStyle = `rgba(255,220,120,${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx, sy - r * 0.85, r * 0.4, r * 0.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      // eyes shine
      ctx.fillStyle = "#ffff80";
      ctx.fillRect(sx - r * 0.18, sy - r * 0.45, 3, 1.5);
      ctx.fillRect(sx + r * 0.08, sy - r * 0.45, 3, 1.5);
      // sword
      ctx.strokeStyle = "#e0e8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.4, sy);
      ctx.lineTo(sx + r * 1.1, sy - r * 0.9);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
    case "phoenix":
    case "fire": {
      // flame body
      const fl = 0.7 + Math.sin(time * 8 + e.id) * 0.25;
      const grd = ctx.createRadialGradient(sx, sy, 2, sx, sy, r * 1.3);
      grd.addColorStop(0, "#ffff80");
      grd.addColorStop(0.4, "#ff8020");
      grd.addColorStop(1, "rgba(200,20,20,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      // core body
      ctx.fillStyle = "#ff5020";
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.7, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb040";
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.1, r * 0.45, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx - r * 0.2, sy - r * 0.1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.2, sy - r * 0.1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.22, sy - r * 0.13, 0.9, 1);
      ctx.fillRect(sx + r * 0.15, sy - r * 0.13, 0.9, 1);
      // flame tongues on top
      ctx.fillStyle = `rgba(255,200,80,${fl})`;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const bx = sx - r * 0.4 + i * r * 0.4;
        ctx.moveTo(bx - 2, sy - r * 0.6);
        ctx.quadraticCurveTo(bx, sy - r * 1.4 - fl * 4, bx + 2, sy - r * 0.6);
        ctx.fill();
      }
      // phoenix wings
      if (cat === "phoenix") {
        ctx.fillStyle = "#ff6030";
        const flap = Math.sin(time * 5 + e.id) * 0.3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx - r * 1.4, sy - r + flap * r, sx - r * 1.2, sy + r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + r * 1.4, sy - r + flap * r, sx + r * 1.2, sy + r * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "ice": {
      // frost aura
      ctx.fillStyle = "rgba(180,220,255,0.35)";
      ctx.beginPath();
      ctx.arc(sx, sy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      // crystal body
      ctx.fillStyle = "#8ac0d8";
      ctx.beginPath();
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx + r * 0.9, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.7, sy + r * 0.9);
      ctx.lineTo(sx - r * 0.7, sy + r * 0.9);
      ctx.lineTo(sx - r * 0.9, sy - r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e0f0ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx, sy + r * 0.9);
      ctx.moveTo(sx - r * 0.9, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.9, sy - r * 0.2);
      ctx.stroke();
      // shine
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.2, sy - r * 0.7);
      ctx.lineTo(sx - r * 0.1, sy - r * 0.1);
      ctx.lineTo(sx + r * 0.15, sy - r * 0.5);
      ctx.closePath();
      ctx.fill();
      // eyes
      ctx.fillStyle = "#0060a0";
      ctx.beginPath();
      ctx.arc(sx - r * 0.2, sy + r * 0.1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.2, sy + r * 0.1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // snowflakes
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let i = 0; i < 3; i++) {
        const a = time + i * 2.1 + e.id;
        ctx.fillRect(sx + Math.cos(a) * r * 1.2 - 0.6, sy + Math.sin(a) * r * 1.2 - 0.6, 1.2, 1.2);
      }
      break;
    }
    case "electric": {
      // body
      ctx.fillStyle = "#e0e0ff";
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8080ff";
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      // lightning arcs
      ctx.strokeStyle = "#f0f0ff";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + time * 3;
        const x1 = sx + Math.cos(a) * r * 0.8,
          y1 = sy + Math.sin(a) * r * 0.8;
        const x2 = sx + Math.cos(a) * r * 1.5,
          y2 = sy + Math.sin(a) * r * 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
          x1 * 0.6 + x2 * 0.4 + (hashXY(i, e.id, 1) - 0.5) * 3,
          y1 * 0.6 + y2 * 0.4 + (hashXY(i, e.id, 2) - 0.5) * 3,
        );
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      // eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.2, sy - r * 0.1, 2, 2);
      ctx.fillRect(sx + r * 0.05, sy - r * 0.1, 2, 2);
      break;
    }
    case "wind": {
      // swirling body
      const rot = time * 4;
      ctx.strokeStyle = shade(col, 30);
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.7 - i * 3, rot + i * 1.2, rot + i * 1.2 + Math.PI * 1.4);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      // core
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx - r * 0.1, sy - r * 0.15, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.1, sy - r * 0.15, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "golem": {
      // body chunks
      ctx.fillStyle = dark;
      ctx.fillRect(sx - r * 0.9, sy - r * 0.5, r * 1.8, r * 1.4);
      ctx.fillStyle = col;
      ctx.fillRect(sx - r * 0.8, sy - r * 0.4, r * 1.6, r * 1.2);
      // cracks
      ctx.strokeStyle = shade(col, -35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.3, sy - r * 0.4);
      ctx.lineTo(sx - r * 0.1, sy);
      ctx.lineTo(sx - r * 0.4, sy + r * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.5, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.3, sy + r * 0.2);
      ctx.stroke();
      // head
      ctx.fillStyle = dark;
      ctx.fillRect(sx - r * 0.45, sy - r * 0.95, r * 0.9, r * 0.5);
      ctx.fillStyle = col;
      ctx.fillRect(sx - r * 0.4, sy - r * 0.9, r * 0.8, r * 0.4);
      // eyes glow
      ctx.fillStyle = "#ff8040";
      ctx.fillRect(sx - r * 0.25, sy - r * 0.75, 4, 3);
      ctx.fillRect(sx + r * 0.05, sy - r * 0.75, 4, 3);
      ctx.fillStyle = "rgba(255,200,120,0.5)";
      ctx.fillRect(sx - r * 0.3, sy - r * 0.8, 5, 5);
      ctx.fillRect(sx, sy - r * 0.8, 5, 5);
      // shoulder plates
      ctx.fillStyle = shade(col, 25);
      ctx.beginPath();
      ctx.arc(sx - r * 0.85, sy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.85, sy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "crystal": {
      // faceted body
      ctx.fillStyle = shade(col, -25);
      ctx.beginPath();
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx + r * 0.9, sy - r * 0.3);
      ctx.lineTo(sx + r * 0.55, sy + r * 0.9);
      ctx.lineTo(sx - r * 0.55, sy + r * 0.9);
      ctx.lineTo(sx - r * 0.9, sy - r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx + r * 0.35, sy - r * 0.3);
      ctx.lineTo(sx, sy + r * 0.9);
      ctx.lineTo(sx - r * 0.35, sy - r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx - r * 0.1, sy);
      ctx.lineTo(sx + r * 0.1, sy - r * 0.6);
      ctx.closePath();
      ctx.fill();
      // inner eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx, sy + r * 0.1, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8040ff";
      ctx.beginPath();
      ctx.arc(sx, sy + r * 0.1, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      // glowing edges
      ctx.strokeStyle = light;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx + r * 0.9, sy - r * 0.3);
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx - r * 0.9, sy - r * 0.3);
      ctx.stroke();
      break;
    }
    case "aberration":
    case "beholder":
    case "tentacle": {
      // pulsing horror
      const pulse = 0.6 + Math.sin(time * 3 + e.id) * 0.2;
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx, sy, r * (0.9 + pulse * 0.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      // giant central eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8040ff";
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // veins
      ctx.strokeStyle = shade(col, -50);
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * r * 0.55, sy + Math.sin(a) * r * 0.55);
        ctx.lineTo(sx + Math.cos(a) * r * 0.9, sy + Math.sin(a) * r * 0.9);
        ctx.stroke();
      }
      // tentacles
      ctx.strokeStyle = dark;
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + time * 0.5;
        const wig = Math.sin(time * 4 + i) * 0.4;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * r * 0.9, sy + Math.sin(a) * r * 0.9);
        ctx.quadraticCurveTo(
          sx + Math.cos(a + wig) * r * 1.4,
          sy + Math.sin(a + wig) * r * 1.4,
          sx + Math.cos(a + wig * 2) * r * 1.8,
          sy + Math.sin(a + wig * 2) * r * 1.8,
        );
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      // small eyes
      ctx.fillStyle = "#ff4060";
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.arc(sx + Math.cos(a) * r * 0.6, sy + Math.sin(a) * r * 0.6, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "aquatic": {
      // fish/sea body
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.1, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      // belly
      ctx.fillStyle = shade(col, 30);
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.3, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      // fins
      ctx.fillStyle = dark;
      const flap = Math.sin(time * 6 + e.id) * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.9, sy);
      ctx.lineTo(sx - r * 1.4, sy - r * 0.4 + flap * r);
      ctx.lineTo(sx - r * 1.4, sy + r * 0.4 + flap * r);
      ctx.closePath();
      ctx.fill();
      // dorsal
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.2, sy - r * 0.5);
      ctx.lineTo(sx + r * 0.1, sy - r * 1);
      ctx.lineTo(sx + r * 0.4, sy - r * 0.5);
      ctx.closePath();
      ctx.fill();
      // eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx + r * 0.55, sy - r * 0.15, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx + r * 0.55, sy - r * 0.15, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // gill
      ctx.strokeStyle = shade(col, -20);
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.25, sy - r * 0.15);
      ctx.lineTo(sx + r * 0.25, sy + r * 0.2);
      ctx.stroke();
      // scales
      ctx.strokeStyle = shade(col, 20);
      for (let i = 0; i < 3; i++)
        ctx.strokeRect(sx - r * 0.2 + i * r * 0.2, sy - r * 0.1, r * 0.16, r * 0.16);
      break;
    }
    case "scorpion": {
      // body segments
      ctx.fillStyle = dark;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(
          sx - r * 0.6 + i * r * 0.3,
          sy + i * r * 0.05,
          r * 0.28,
          r * 0.22,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = col;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(
          sx - r * 0.6 + i * r * 0.3,
          sy + i * r * 0.05 - 1,
          r * 0.22,
          r * 0.17,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // claws
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx - r * 1.1, sy - r * 0.3, r * 0.4, r * 0.22, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + r * 1.1, sy - r * 0.3, r * 0.4, r * 0.22, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(sx - r * 1.4, sy - r * 0.5);
      ctx.lineTo(sx - r * 1.25, sy - r * 0.15);
      ctx.lineTo(sx - r * 1.1, sy - r * 0.4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 1.4, sy - r * 0.5);
      ctx.lineTo(sx + r * 1.25, sy - r * 0.15);
      ctx.lineTo(sx + r * 1.1, sy - r * 0.4);
      ctx.fill();
      // tail curl
      ctx.strokeStyle = dark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.6, sy + r * 0.2);
      ctx.quadraticCurveTo(sx + r * 1.4, sy - r * 0.6, sx + r * 0.8, sy - r * 1.1);
      ctx.stroke();
      ctx.lineWidth = 1;
      // stinger
      ctx.fillStyle = "#f0c020";
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.75, sy - r * 1.1);
      ctx.lineTo(sx + r * 0.9, sy - r * 1.4);
      ctx.lineTo(sx + r, sy - r * 1.05);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "bat": {
      const flap = Math.sin(time * 10 + e.id) * 0.4;
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx - r * 1.5, sy - r + flap * r, sx - r * 1.6, sy + r * 0.3);
      ctx.quadraticCurveTo(sx - r * 0.9, sy + r * 0.1, sx - r * 0.5, sy + r * 0.4);
      ctx.lineTo(sx, sy + r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + r * 1.5, sy - r + flap * r, sx + r * 1.6, sy + r * 0.3);
      ctx.quadraticCurveTo(sx + r * 0.9, sy + r * 0.1, sx + r * 0.5, sy + r * 0.4);
      ctx.lineTo(sx, sy + r * 0.4);
      ctx.closePath();
      ctx.fill();
      // body
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.15, r * 0.4, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      // ears
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.25, sy - r * 0.2);
      ctx.lineTo(sx - r * 0.35, sy - r * 0.5);
      ctx.lineTo(sx - r * 0.12, sy - r * 0.25);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.25, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.35, sy - r * 0.5);
      ctx.lineTo(sx + r * 0.12, sy - r * 0.25);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#ff4060";
      ctx.beginPath();
      ctx.arc(sx - r * 0.15, sy - r * 0.05, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.15, sy - r * 0.05, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "worm": {
      // segmented worm
      ctx.fillStyle = dark;
      for (let i = 0; i < 5; i++) {
        const off = Math.sin(time * 3 + i * 0.7 + e.id) * 3;
        ctx.beginPath();
        ctx.ellipse(sx - r * 0.8 + i * r * 0.4, sy + off, r * 0.35, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = col;
      for (let i = 0; i < 5; i++) {
        const off = Math.sin(time * 3 + i * 0.7 + e.id) * 3;
        ctx.beginPath();
        ctx.ellipse(sx - r * 0.8 + i * r * 0.4, sy - 1 + off, r * 0.3, r * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // head with mandibles
      const hOff = Math.sin(time * 3 + 4 * 0.7 + e.id) * 3;
      ctx.fillStyle = shade(col, 20);
      ctx.beginPath();
      ctx.arc(sx + r * 0.8, sy + hOff, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(sx + r * 1, sy + hOff - r * 0.3);
      ctx.lineTo(sx + r * 1.3, sy + hOff);
      ctx.lineTo(sx + r * 1, sy + hOff + r * 0.3);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#f0e040";
      ctx.beginPath();
      ctx.arc(sx + r * 0.7, sy + hOff - r * 0.15, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.7, sy + hOff + r * 0.15, 1.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "rat": {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 1, r * 0.85, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx + r * 0.7, sy - r * 0.15, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      // ears
      ctx.fillStyle = "#f0a0a0";
      ctx.beginPath();
      ctx.arc(sx + r * 0.55, sy - r * 0.55, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.9, sy - r * 0.55, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // eye
      ctx.fillStyle = "#ff2020";
      ctx.beginPath();
      ctx.arc(sx + r * 0.85, sy - r * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // nose
      ctx.fillStyle = "#f0a0a0";
      ctx.beginPath();
      ctx.arc(sx + r * 1.15, sy - r * 0.05, 1.3, 0, Math.PI * 2);
      ctx.fill();
      // tail
      ctx.strokeStyle = "#f0a080";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.9, sy + r * 0.1);
      ctx.quadraticCurveTo(sx - r * 1.6, sy - r * 0.4, sx - r * 1.4, sy - r * 0.9);
      ctx.stroke();
      ctx.lineWidth = 1;
      // teeth
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + r * 1.05, sy + r * 0.05, 1.4, 1.6);
      break;
    }
    case "insect": {
      // beetle
      const flap = Math.sin(time * 15 + e.id) * r * 0.15;
      // wings
      ctx.fillStyle = "rgba(200,220,255,0.4)";
      ctx.beginPath();
      ctx.ellipse(sx - r * 0.4, sy - r * 0.2 - flap, r * 0.6, r * 0.35, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + r * 0.4, sy - r * 0.2 - flap, r * 0.6, r * 0.35, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // shell
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.85, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dark;
      ctx.beginPath();
      ctx.moveTo(sx, sy - r * 0.7);
      ctx.lineTo(sx, sy + r * 0.7);
      ctx.stroke();
      // head
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.75, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#f0e040";
      ctx.beginPath();
      ctx.arc(sx - r * 0.15, sy - r * 0.75, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.15, sy - r * 0.75, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // antennae
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.1, sy - r);
      ctx.lineTo(sx - r * 0.3, sy - r * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.1, sy - r);
      ctx.lineTo(sx + r * 0.3, sy - r * 1.3);
      ctx.stroke();
      break;
    }
    case "boar": {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 1.1, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 1, r * 0.95, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      // bristles
      ctx.strokeStyle = "#1a0f08";
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(sx + i * 3, sy - r * 0.55);
        ctx.lineTo(sx + i * 3 - 1, sy - r * 0.85);
        ctx.stroke();
      }
      // head
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx + r * 0.85, sy, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // snout
      ctx.fillStyle = "#3a2010";
      ctx.beginPath();
      ctx.ellipse(sx + r * 1.25, sy + r * 0.1, r * 0.25, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx + r * 1.35, sy + r * 0.05, 0.9, 0, Math.PI * 2);
      ctx.fill();
      // tusks
      ctx.fillStyle = "#f0e0c0";
      ctx.beginPath();
      ctx.moveTo(sx + r * 1.15, sy + r * 0.15);
      ctx.lineTo(sx + r * 1.3, sy - r * 0.05);
      ctx.lineTo(sx + r * 1.1, sy + r * 0.05);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#ff4040";
      ctx.beginPath();
      ctx.arc(sx + r * 0.8, sy - r * 0.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
      // legs
      ctx.fillStyle = dark;
      for (let i = 0; i < 4; i++)
        ctx.fillRect(sx - r * 0.7 + i * r * 0.45, sy + r * 0.5, r * 0.15, r * 0.4);
      break;
    }
    case "bear": {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 1, r * 1.05, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.9, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.7, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.65, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      // ears
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(sx - r * 0.4, sy - r * 1.05, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.4, sy - r * 1.05, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // snout
      ctx.fillStyle = "#3a2010";
      ctx.beginPath();
      ctx.ellipse(sx, sy - r * 0.45, r * 0.22, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.2, sy - r * 0.75, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.2, sy - r * 0.75, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // claws
      ctx.fillStyle = "#f0e0c0";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(sx - r * 0.9 + i * 3, sy + r * 0.75);
        ctx.lineTo(sx - r * 0.9 + i * 3, sy + r * 0.9);
        ctx.lineTo(sx - r * 0.9 + i * 3 + 1.5, sy + r * 0.75);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + r * 0.7 + i * 3, sy + r * 0.75);
        ctx.lineTo(sx + r * 0.7 + i * 3, sy + r * 0.9);
        ctx.lineTo(sx + r * 0.7 + i * 3 + 1.5, sy + r * 0.75);
        ctx.fill();
      }
      break;
    }
    case "eagle": {
      const flap = Math.sin(time * 4 + e.id) * 0.5;
      // wings
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx - r * 1.6, sy - r * 0.5 + flap * r, sx - r * 1.8, sy + r * 0.1);
      ctx.quadraticCurveTo(sx - r, sy + r * 0.2, sx - r * 0.2, sy - r * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + r * 1.6, sy - r * 0.5 + flap * r, sx + r * 1.8, sy + r * 0.1);
      ctx.quadraticCurveTo(sx + r, sy + r * 0.2, sx + r * 0.2, sy - r * 0.1);
      ctx.fill();
      // body
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.2, r * 0.5, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = "#f0f0e8";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.4, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // beak
      ctx.fillStyle = "#f0b040";
      ctx.beginPath();
      ctx.moveTo(sx, sy - r * 0.3);
      ctx.lineTo(sx + r * 0.35, sy - r * 0.2);
      ctx.lineTo(sx, sy - r * 0.1);
      ctx.fill();
      // eye
      ctx.fillStyle = "#f0d040";
      ctx.beginPath();
      ctx.arc(sx - r * 0.1, sy - r * 0.42, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.1, sy - r * 0.42, 0.9, 0, Math.PI * 2);
      ctx.fill();
      // talons
      ctx.strokeStyle = "#f0b040";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.15, sy + r * 0.7);
      ctx.lineTo(sx - r * 0.15, sy + r * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.15, sy + r * 0.7);
      ctx.lineTo(sx + r * 0.15, sy + r * 0.95);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
    case "mushroom": {
      // stem
      ctx.fillStyle = "#e0d0a0";
      ctx.fillRect(sx - r * 0.25, sy - r * 0.1, r * 0.5, r);
      ctx.strokeStyle = "#8a7050";
      ctx.strokeRect(sx - r * 0.25, sy - r * 0.1, r * 0.5, r);
      // cap
      ctx.fillStyle = shade(col, -20);
      ctx.beginPath();
      ctx.ellipse(sx, sy - r * 0.3, r, r * 0.6, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx, sy - r * 0.4, r * 0.9, r * 0.5, 0, Math.PI, 0);
      ctx.fill();
      // spots
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx - r * 0.4, sy - r * 0.5, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.35, sy - r * 0.6, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.75, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      // eyes on stem
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.1, sy + r * 0.15, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.1, sy + r * 0.15, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // spore glow
      ctx.fillStyle = `rgba(200,120,240,${0.4 + Math.sin(time * 3 + e.id) * 0.2})`;
      for (let i = 0; i < 3; i++) {
        const a = time + i * 2;
        ctx.beginPath();
        ctx.arc(
          sx + Math.cos(a) * r * 0.8,
          sy - r * 0.5 + Math.sin(a) * r * 0.3,
          1.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      break;
    }
    case "plant": {
      // trunk
      ctx.fillStyle = "#3a2010";
      ctx.fillRect(sx - r * 0.3, sy - r * 0.2, r * 0.6, r * 1.1);
      ctx.strokeStyle = "#1a0f06";
      ctx.strokeRect(sx - r * 0.3, sy - r * 0.2, r * 0.6, r * 1.1);
      // face on trunk
      ctx.fillStyle = "#f0e040";
      ctx.beginPath();
      ctx.arc(sx - r * 0.12, sy + r * 0.3, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.12, sy + r * 0.3, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.14, sy + r * 0.28, 0.6, 1.3);
      ctx.fillRect(sx + r * 0.1, sy + r * 0.28, 0.6, 1.3);
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx, sy + r * 0.55, r * 0.18, 0.1, Math.PI - 0.1);
      ctx.stroke();
      // foliage
      ctx.fillStyle = shade(col, -20);
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.4, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx - r * 0.3, sy - r * 0.5, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.3, sy - r * 0.45, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.75, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      // arms (branches)
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.3, sy + r * 0.2);
      ctx.lineTo(sx - r * 0.8, sy + r * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.3, sy + r * 0.2);
      ctx.lineTo(sx + r * 0.8, sy + r * 0.1);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
    case "ghost": {
      // ethereal body
      const bob2 = Math.sin(time * 2 + e.id) * 3;
      ctx.globalAlpha = 0.85;
      const grd = ctx.createRadialGradient(sx, sy + bob2, r * 0.2, sx, sy + bob2, r * 1.1);
      grd.addColorStop(0, shade(col, 40));
      grd.addColorStop(1, "rgba(60,60,100,0.05)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(sx - r, sy + r + bob2);
      ctx.quadraticCurveTo(sx - r, sy - r + bob2, sx, sy - r + bob2);
      ctx.quadraticCurveTo(sx + r, sy - r + bob2, sx + r, sy + r + bob2);
      // wavy bottom
      ctx.quadraticCurveTo(sx + r * 0.5, sy + r * 0.7 + bob2, sx, sy + r + bob2);
      ctx.quadraticCurveTo(sx - r * 0.5, sy + r * 0.7 + bob2, sx - r, sy + r + bob2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // eyes glowing
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(sx - r * 0.25, sy - r * 0.2 + bob2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.25, sy - r * 0.2 + bob2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.isBoss ? "#ff4060" : "#80e0ff";
      ctx.beginPath();
      ctx.arc(sx - r * 0.25, sy - r * 0.2 + bob2, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.25, sy - r * 0.2 + bob2, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      // mouth
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(sx, sy + r * 0.15 + bob2, r * 0.15, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "knight": {
      // armor body
      ctx.fillStyle = "#7080a0";
      ctx.fillRect(sx - r * 0.55, sy - r * 0.3, r * 1.1, r * 1.2);
      ctx.fillStyle = "#9aa8c0";
      ctx.fillRect(sx - r * 0.5, sy - r * 0.25, r * 1.0, r * 0.7);
      // shoulder pads
      ctx.fillStyle = "#5a6a8a";
      ctx.beginPath();
      ctx.ellipse(sx - r * 0.7, sy - r * 0.2, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + r * 0.7, sy - r * 0.2, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      // helmet
      ctx.fillStyle = "#5a6a8a";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.7, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.3, sy - r * 0.75, r * 0.6, r * 0.15);
      ctx.fillStyle = e.isBoss ? "#ff4060" : "#80e0ff";
      ctx.fillRect(sx - r * 0.22, sy - r * 0.72, r * 0.15, r * 0.08);
      ctx.fillRect(sx + r * 0.07, sy - r * 0.72, r * 0.15, r * 0.08);
      // plume
      ctx.fillStyle = "#c04040";
      ctx.beginPath();
      ctx.moveTo(sx, sy - r * 1.2);
      ctx.lineTo(sx + r * 0.3, sy - r * 0.8);
      ctx.lineTo(sx - r * 0.3, sy - r * 0.8);
      ctx.fill();
      // sword
      ctx.strokeStyle = "#e0e8f0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.6, sy + r * 0.2);
      ctx.lineTo(sx + r * 1.3, sy - r * 0.7);
      ctx.stroke();
      ctx.strokeStyle = "#8a5010";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.5, sy + r * 0.3);
      ctx.lineTo(sx + r * 0.7, sy + r * 0.1);
      ctx.stroke();
      // shield
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(sx - r * 0.7, sy + r * 0.3, r * 0.35, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f0d040";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.7, sy - r * 0.1);
      ctx.lineTo(sx - r * 0.7, sy + r * 0.7);
      ctx.moveTo(sx - r * 0.95, sy + r * 0.3);
      ctx.lineTo(sx - r * 0.45, sy + r * 0.3);
      ctx.stroke();
      break;
    }
    case "mage": {
      // robe
      ctx.fillStyle = shade(col, -30);
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.7, sy + r);
      ctx.lineTo(sx - r * 0.4, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.4, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.7, sy + r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.5, sy + r);
      ctx.lineTo(sx - r * 0.3, sy);
      ctx.lineTo(sx + r * 0.3, sy);
      ctx.lineTo(sx + r * 0.5, sy + r);
      ctx.closePath();
      ctx.fill();
      // hood shadow face
      ctx.fillStyle = shade(col, -40);
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.4, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // hat/hood point
      ctx.fillStyle = shade(col, -30);
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.4, sy - r * 0.3);
      ctx.lineTo(sx, sy - r * 1.3);
      ctx.lineTo(sx + r * 0.4, sy - r * 0.3);
      ctx.fill();
      // eyes
      ctx.fillStyle = e.isBoss ? "#ff2040" : "#80e0ff";
      ctx.fillRect(sx - r * 0.2, sy - r * 0.42, 3, 2);
      ctx.fillRect(sx + r * 0.05, sy - r * 0.42, 3, 2);
      // staff with glow orb
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.6, sy - r * 0.8);
      ctx.lineTo(sx + r * 0.7, sy + r * 0.8);
      ctx.stroke();
      const pulse = 0.6 + Math.sin(time * 3 + e.id) * 0.3;
      const grd = ctx.createRadialGradient(
        sx + r * 0.6,
        sy - r * 0.9,
        1,
        sx + r * 0.6,
        sy - r * 0.9,
        r * 0.6,
      );
      grd.addColorStop(0, "#fff");
      grd.addColorStop(0.4, col);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(sx + r * 0.6, sy - r * 0.9, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx + r * 0.6, sy - r * 0.9, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "orc": {
      // stocky humanoid
      ctx.fillStyle = "#3a5a3a";
      ctx.fillRect(sx - r * 0.7, sy - r * 0.2, r * 1.4, r * 1.2);
      ctx.fillStyle = "#5a7a4a";
      ctx.fillRect(sx - r * 0.6, sy - r * 0.15, r * 1.2, r * 0.6);
      // head
      ctx.fillStyle = "#5a7a4a";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.6, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // tusks
      ctx.fillStyle = "#f0e0c0";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.2, sy - r * 0.4);
      ctx.lineTo(sx - r * 0.22, sy - r * 0.2);
      ctx.lineTo(sx - r * 0.1, sy - r * 0.4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.1, sy - r * 0.4);
      ctx.lineTo(sx + r * 0.22, sy - r * 0.2);
      ctx.lineTo(sx + r * 0.2, sy - r * 0.4);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#ff4040";
      ctx.beginPath();
      ctx.arc(sx - r * 0.18, sy - r * 0.65, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + r * 0.18, sy - r * 0.65, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // eyebrows
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.3, sy - r * 0.8);
      ctx.lineTo(sx - r * 0.05, sy - r * 0.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.3, sy - r * 0.8);
      ctx.lineTo(sx + r * 0.05, sy - r * 0.75);
      ctx.stroke();
      ctx.lineWidth = 1;
      // club
      ctx.fillStyle = "#5a3010";
      ctx.fillRect(sx + r * 0.7, sy - r * 0.5, r * 0.3, r * 0.9);
      ctx.strokeStyle = "#2a1408";
      ctx.strokeRect(sx + r * 0.7, sy - r * 0.5, r * 0.3, r * 0.9);
      // spikes
      ctx.fillStyle = "#8a8a94";
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(sx + r * 0.7, sy - r * 0.3 + i * r * 0.3);
        ctx.lineTo(sx + r * 0.55, sy - r * 0.2 + i * r * 0.3);
        ctx.lineTo(sx + r * 0.7, sy - r * 0.1 + i * r * 0.3);
        ctx.fill();
      }
      break;
    }
    case "bandit":
    default: {
      // human-ish
      ctx.fillStyle = shade(col, -25);
      ctx.fillRect(sx - r * 0.5, sy - r * 0.2, r, r * 1.1);
      ctx.fillStyle = col;
      ctx.fillRect(sx - r * 0.45, sy - r * 0.15, r * 0.9, r * 0.55);
      // head
      ctx.fillStyle = "#d09060";
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.55, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // hair/hood
      ctx.fillStyle = shade(col, -40);
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.7, r * 0.4, Math.PI + 0.3, -0.3);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(sx - r * 0.18, sy - r * 0.55, 2, 2);
      ctx.fillRect(sx + r * 0.05, sy - r * 0.55, 2, 2);
      // mask/scarf
      ctx.fillStyle = shade(col, -50);
      ctx.fillRect(sx - r * 0.28, sy - r * 0.4, r * 0.55, r * 0.15);
      // weapon (dagger)
      ctx.strokeStyle = "#c0c0d0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.55, sy + r * 0.1);
      ctx.lineTo(sx + r * 1.0, sy - r * 0.3);
      ctx.stroke();
      ctx.strokeStyle = "#5a3010";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + r * 0.5, sy + r * 0.2);
      ctx.lineTo(sx + r * 0.6, sy + r * 0.05);
      ctx.stroke();
      ctx.lineWidth = 1;
      break;
    }
  }

  // hit flash overlay
  if (e.hitFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.7, e.hitFlash * 2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLoot(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  iconChar: string,
  color: string,
  time: number,
) {
  const pulse = 4 + Math.sin(time * 5) * 2;
  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 8, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // aura
  const grd = ctx.createRadialGradient(sx, sy, 2, sx, sy, 14 + pulse);
  grd.addColorStop(0, color);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(sx, sy, 14 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // container based on icon
  const bob = Math.sin(time * 3) * 2;
  if (iconChar === "⚔") {
    // sword
    ctx.strokeStyle = "#e0e8f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy + 6 + bob);
    ctx.lineTo(sx + 6, sy - 6 + bob);
    ctx.stroke();
    ctx.strokeStyle = "#8a5010";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 7, sy + 8 + bob);
    ctx.lineTo(sx - 4, sy + 5 + bob);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx - 6, sy + 6 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconChar === "🛡") {
    // shield
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 7 + bob);
    ctx.lineTo(sx + 6, sy - 4 + bob);
    ctx.lineTo(sx + 5, sy + 5 + bob);
    ctx.lineTo(sx, sy + 8 + bob);
    ctx.lineTo(sx - 5, sy + 5 + bob);
    ctx.lineTo(sx - 6, sy - 4 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f0d040";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#f0d040";
    ctx.fillRect(sx - 0.5, sy - 4 + bob, 1, 9);
    ctx.fillRect(sx - 4, sy - 0.5 + bob, 9, 1);
  } else if (iconChar === "🧪" || iconChar === "❤") {
    // potion
    ctx.fillStyle = "#3a2010";
    ctx.fillRect(sx - 3, sy - 8 + bob, 6, 3);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 5 + bob);
    ctx.lineTo(sx + 5, sy - 5 + bob);
    ctx.lineTo(sx + 6, sy + 8 + bob);
    ctx.lineTo(sx - 6, sy + 8 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(sx - 3, sy + bob, 1, 5);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - 3, sy - 8 + bob, 6, 3);
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 5 + bob);
    ctx.lineTo(sx + 5, sy - 5 + bob);
    ctx.lineTo(sx + 6, sy + 8 + bob);
    ctx.lineTo(sx - 6, sy + 8 + bob);
    ctx.closePath();
    ctx.stroke();
  } else {
    // gem/coin
    ctx.fillStyle = shade(color, -30);
    ctx.beginPath();
    ctx.arc(sx, sy + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy + bob, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(sx - 1.5, sy - 1.5 + bob, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // sparkles
  for (let i = 0; i < 3; i++) {
    const a = time * 2 + i * 2.1;
    const sp = 8 + Math.sin(a) * 4;
    const sxs = sx + Math.cos(a) * sp,
      sys = sy + Math.sin(a) * sp;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(sxs - 0.8, sys - 0.8, 1.6, 1.6);
  }
}

function drawProjectile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  fromPlayer: boolean,
  time: number,
) {
  const core = fromPlayer ? "#8ecfff" : "#ff8060";
  // outer glow
  const grd = ctx.createRadialGradient(sx, sy, 1, sx, sy, 10);
  grd.addColorStop(0, core);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(sx, sy, 10, 0, Math.PI * 2);
  ctx.fill();
  // core
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(sx, sy, 4, 0, Math.PI * 2);
  ctx.fill();
  // white center
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // trail sparkles
  for (let i = 0; i < 2; i++) {
    const a = time * 20 + i * 3;
    ctx.fillStyle = `rgba(255,255,255,${0.5 - i * 0.2})`;
    ctx.fillRect(sx + Math.cos(a) * 3, sy + Math.sin(a) * 3, 1.2, 1.2);
  }
}

export function getSkinSlug(cls: string, skinIdx: number): string {
  // AI-generated skin sprites (skin-<cls>-<idx>.png in /public/sprites).
  // Todas as 15 classes × 5 variantes têm PNG dedicado.
  const CLASSES = [
    "melee","magic","paladin","necro","archer",
    "druid","assassin","warlock","samurai","monk",
    "bard","gunslinger","alchemist","vampire","reaper",
  ];
  const key = CLASSES.includes(cls) ? cls : "melee";
  const idx = Math.max(0, Math.min(4, skinIdx | 0));
  return `skin-${key}-${idx}`;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: import("./engine").Player,
  psx: number,
  psy: number,
  time: number,
) {
  const bob = Math.sin(time * 6) * 1.1;
  const isAlt = p.skin > 0;
  const skinIdx = p.skin ?? 0;
  const cls = p.cls;
  const fx = p.facing.x,
    fy = p.facing.y;
  const isFlashing = p.hitFlash > 0;

  const skinSlug = getSkinSlug(p.cls, p.skin ?? 0);
  const sprite = getSpriteBySlug(skinSlug);

  // Draw Speed Sprint Ghost Trails
  if ((p as any).trail && (p as any).trail.length > 0) {
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    const trailArr = (p as any).trail as { x: number; y: number }[];
    const size = 32;
    for (let i = 0; i < trailArr.length; i++) {
      const pos = trailArr[i];
      const gsx = psx + (pos.x - p.pos.x);
      const gsy = psy + (pos.y - p.pos.y);
      const alpha = 0.4 * (1 - i / trailArr.length);
      ctx.save();
      ctx.globalAlpha = alpha;
      // Beautiful glowing cyan tint for sprinting trail
      ctx.filter = "brightness(1.5) hue-rotate(180deg) saturate(1.5)";
      if (sprite) {
        ctx.drawImage(
          sprite,
          gsx - size / 2,
          gsy - size / 2 + Math.sin((time - i * 0.1) * 6) * 1.1,
          size,
          size,
        );
      }
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

  if (sprite) {
    // Shadow with pulsing size based on bobbing
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(psx, psy + 14, 13 - bob * 0.5, 4.5 - bob * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    const size = 32;
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    if (skinIdx > 0) {
      // Premium skins get an extraordinary colored magical aura!
      const colors = ["", "#ff4500", "#aa00ff", "#ffd700", "#00e5ff"];
      ctx.shadowColor = colors[skinIdx % colors.length] || "#ffd700";
      ctx.shadowBlur = 8;
    } else {
      // Default skin gets a clean, subtle magical yellow-amber glow
      ctx.shadowColor = "rgba(240, 176, 64, 0.45)";
      ctx.shadowBlur = 4;
    }

    if (p.hitFlash > 0) {
      ctx.filter = "brightness(3) saturate(0)";
      ctx.drawImage(sprite, psx - size / 2, psy - size / 2 + bob, size, size);
    } else {
      ctx.drawImage(sprite, psx - size / 2, psy - size / 2 + bob, size, size);
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = prev;

    // Draw active weapon pointing in vector direction
    ctx.save();
    const weaponLength = 16;
    const wx = psx + fx * 10;
    const wy = psy + fy * 10 + bob;
    const wex = psx + fx * (10 + weaponLength);
    const wey = psy + fy * (10 + weaponLength) + bob;
    ctx.lineWidth = 2.5;
    if (cls === "melee") {
      if (skinIdx === 1) {
        ctx.strokeStyle = "#ff4500";
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wex, wey);
        ctx.stroke();
        ctx.strokeStyle = "#ffea00";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + fx * 3, wy + fy * 3);
        ctx.lineTo(wex, wey);
        ctx.stroke();
      } else if (skinIdx === 2) {
        ctx.strokeStyle = "#aa00ff";
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wex, wey);
        ctx.stroke();
      } else if (skinIdx === 3) {
        ctx.strokeStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wex, wey);
        ctx.stroke();
      } else if (skinIdx === 4) {
        ctx.strokeStyle = "#00e5ff";
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wex, wey);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#b0c4de";
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wex, wey);
        ctx.stroke();
      }
    } else if (cls === "magic") {
      ctx.strokeStyle = "#5c4033";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx, wy + 4);
      ctx.lineTo(wex, wey - 4);
      ctx.stroke();
      let gemCol = "#00b4d8";
      if (skinIdx === 1) gemCol = "#ffea00";
      else if (skinIdx === 2) gemCol = "#ff4500";
      else if (skinIdx === 3) gemCol = "#d000f0";
      else if (skinIdx === 4) gemCol = "#b07c2a";
      ctx.fillStyle = gemCol;
      ctx.beginPath();
      ctx.arc(wex, wey - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (cls === "paladin") {
      ctx.strokeStyle = "#8a9ba8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wex, wey);
      ctx.stroke();
      ctx.fillStyle = "#f0c040";
      ctx.beginPath();
      ctx.arc(wex, wey, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (cls === "necro") {
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx, wy + 5);
      ctx.lineTo(wex, wey - 5);
      ctx.stroke();
      ctx.strokeStyle = skinIdx === 1 ? "#70e0f0" : skinIdx === 3 ? "#e60000" : "#a3a3a3";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(wex, wey - 5);
      ctx.quadraticCurveTo(wex - fx * 10, wey - 12, wex - fx * 14, wey - 8);
      ctx.stroke();
    } else if (cls === "archer") {
      ctx.strokeStyle = "#8b5a2b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wx + fx * 6, wy + fy * 6, 6, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(wx, wy - 3);
      ctx.lineTo(wx, wy + 9);
      ctx.stroke();
    }
    ctx.restore();

    // Orbit particles
    if (!p.hitFlash) {
      const orbitRadius = 14 + Math.sin(time * 3) * 2;
      const numOrbs = skinIdx === 0 ? 1 : 3;
      let orbColor = "";
      if (cls === "melee" && skinIdx === 1) orbColor = "#ff4500";
      else if (cls === "melee" && skinIdx === 2) orbColor = "#bf00ff";
      else if (cls === "magic" && skinIdx === 0) orbColor = "#00d2ff";
      else if (cls === "magic" && skinIdx === 1) orbColor = "#ffee00";
      else if (cls === "magic" && skinIdx === 2) orbColor = "#ff5500";
      else if (cls === "magic" && skinIdx === 3) orbColor = "#d000f0";
      else if (cls === "paladin" && skinIdx === 2) orbColor = "#4caf50";
      else if (cls === "necro" && skinIdx === 2) orbColor = "#5cd65c";
      else if (cls === "necro" && skinIdx === 3) orbColor = "#ff1a1a";
      else if (cls === "necro" && skinIdx === 4) orbColor = "#39ff14";
      else if (cls === "archer" && skinIdx === 4) orbColor = "#00e5ff";
      if (orbColor) {
        for (let o = 0; o < numOrbs; o++) {
          const angle = time * 3.5 + (o * Math.PI * 2) / numOrbs;
          const ox = psx + Math.cos(angle) * orbitRadius;
          const oy = psy - 4 + Math.sin(angle) * orbitRadius + bob;
          const radGrd = ctx.createRadialGradient(ox, oy, 0.5, ox, oy, 5);
          radGrd.addColorStop(0, orbColor);
          radGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = radGrd;
          ctx.beginPath();
          ctx.arc(ox, oy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ox, oy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    return;
  }

  // Shadow with pulsing size based on bobbing
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(psx, psy + 14, 13 - bob * 0.5, 4.5 - bob * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw procedural background accessories (wings, halos, thrusters, gears)
  ctx.save();
  if (isFlashing) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
  }

  // 1. BACK ACCESSORIES (Wings, Capes, Thrusters, Gears)
  if (cls === "melee") {
    if (skinIdx === 0) {
      // Classic Red Cape with sway
      const capeSway = Math.sin(time * 3.5) * 3.5;
      ctx.fillStyle = isFlashing ? "#fff" : "#9e1a1a";
      ctx.beginPath();
      ctx.moveTo(psx - 7, psy - 6);
      ctx.lineTo(psx + 7, psy - 6);
      ctx.lineTo(psx + 10 + capeSway, psy + 12 + bob);
      ctx.lineTo(psx - 10 + capeSway, psy + 12 + bob);
      ctx.closePath();
      ctx.fill();
    } else if (skinIdx === 1) {
      // Lava Cape with pulsing core
      const glow = Math.abs(Math.sin(time * 5)) * 40;
      ctx.fillStyle = `rgb(${200 + glow}, ${80 + glow / 2}, 0)`;
      ctx.beginPath();
      ctx.moveTo(psx - 7, psy - 6);
      ctx.lineTo(psx + 7, psy - 6);
      ctx.lineTo(psx + 12, psy + 14 + bob);
      ctx.lineTo(psx - 12, psy + 14 + bob);
      ctx.closePath();
      ctx.fill();
    } else if (skinIdx === 2) {
      // Void Shadow Cape
      ctx.fillStyle = "#1e003b";
      ctx.beginPath();
      ctx.moveTo(psx - 7, psy - 6);
      ctx.lineTo(psx + 7, psy - 6);
      ctx.lineTo(psx + 11 + Math.sin(time * 2) * 4, psy + 13 + bob);
      ctx.lineTo(psx - 11 - Math.sin(time * 2) * 4, psy + 13 + bob);
      ctx.closePath();
      ctx.fill();
    } else if (skinIdx === 3) {
      // Golden Angel Wings
      const wingFlap = Math.sin(time * 7) * 8;
      ctx.fillStyle = "#ffe680";
      ctx.strokeStyle = "#e0a010";
      ctx.lineWidth = 1.5;
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(psx - 4, psy - 4 + bob);
      ctx.quadraticCurveTo(psx - 24, psy - 18 + wingFlap, psx - 28, psy - 4 + wingFlap);
      ctx.quadraticCurveTo(psx - 16, psy + 4, psx - 4, psy + bob);
      ctx.fill();
      ctx.stroke();
      // Right Wing
      ctx.beginPath();
      ctx.moveTo(psx + 4, psy - 4 + bob);
      ctx.quadraticCurveTo(psx + 24, psy - 18 + wingFlap, psx + 28, psy - 4 + wingFlap);
      ctx.quadraticCurveTo(psx + 16, psy + 4, psx + 4, psy + bob);
      ctx.fill();
      ctx.stroke();
    } else if (skinIdx === 4) {
      // Cyber Jetpack Thrusters with fire
      ctx.fillStyle = "#474a51";
      ctx.fillRect(psx - 9, psy - 6 + bob, 4, 10);
      ctx.fillRect(psx + 5, psy - 6 + bob, 4, 10);
      // flame particles
      const flameH = 8 + Math.random() * 8;
      const grad = ctx.createLinearGradient(psx, psy, psx, psy + 15);
      grad.addColorStop(0, "#00ffff");
      grad.addColorStop(1, "rgba(0,100,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(psx - 9, psy + 4 + bob, 4, flameH);
      ctx.fillRect(psx + 5, psy + 4 + bob, 4, flameH);
    }
  } else if (cls === "magic") {
    if (skinIdx === 4) {
      // Time Weaver Rotating Gears behind back
      ctx.strokeStyle = "#b07c2a";
      ctx.lineWidth = 2;
      ctx.save();
      ctx.translate(psx, psy - 8 + bob);
      ctx.rotate(time * 2);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      for (let g = 0; g < 8; g++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-2, -19, 4, 4);
      }
      ctx.restore();
    }
  } else if (cls === "paladin") {
    if (skinIdx === 3) {
      // Phoenix Wings of Fire
      const flap = Math.sin(time * 8) * 10;
      const grad = ctx.createRadialGradient(psx, psy, 2, psx, psy, 25);
      grad.addColorStop(0, "#ff4500");
      grad.addColorStop(0.5, "#ff8c00");
      grad.addColorStop(1, "rgba(255,0,0,0)");
      ctx.fillStyle = grad;
      // Left flame wing
      ctx.beginPath();
      ctx.moveTo(psx - 4, psy + bob);
      ctx.lineTo(psx - 26, psy - 12 + flap);
      ctx.lineTo(psx - 20, psy + 8 + flap);
      ctx.closePath();
      ctx.fill();
      // Right flame wing
      ctx.beginPath();
      ctx.moveTo(psx + 4, psy + bob);
      ctx.lineTo(psx + 26, psy - 12 + flap);
      ctx.lineTo(psx + 20, psy + 8 + flap);
      ctx.closePath();
      ctx.fill();
    } else if (skinIdx === 4) {
      // Ebano Holy Light Wings
      const flap = Math.sin(time * 5) * 6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(psx - 4, psy + bob);
      ctx.lineTo(psx - 28, psy - 16 + flap);
      ctx.lineTo(psx - 16, psy + 12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(psx + 4, psy + bob);
      ctx.lineTo(psx + 28, psy - 16 + flap);
      ctx.lineTo(psx + 16, psy + 12);
      ctx.closePath();
      ctx.fill();
    }
  } else if (cls === "necro") {
    if (skinIdx === 3) {
      // Bat wings for Vampire
      const wingAnim = Math.sin(time * 6) * 5;
      ctx.fillStyle = "#300808";
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 1;
      // Left Bat Wing
      ctx.beginPath();
      ctx.moveTo(psx - 3, psy + bob);
      ctx.lineTo(psx - 24, psy - 8 + wingAnim);
      ctx.lineTo(psx - 16, psy + 6 + wingAnim);
      ctx.lineTo(psx - 10, psy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right Bat Wing
      ctx.beginPath();
      ctx.moveTo(psx + 3, psy + bob);
      ctx.lineTo(psx + 24, psy - 8 + wingAnim);
      ctx.lineTo(psx + 16, psy + 6 + wingAnim);
      ctx.lineTo(psx + 10, psy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // 2. LEGS
  ctx.fillStyle = isFlashing ? "#fff" : "#1a120c";
  if (cls === "magic" || cls === "necro") {
    // Robes hiding legs mostly, draw robe skirt base
    ctx.fillStyle = isFlashing
      ? "#fff"
      : cls === "magic"
        ? skinIdx === 0
          ? "#112c54"
          : skinIdx === 1
            ? "#0a3c5c"
            : skinIdx === 2
              ? "#3a1203"
              : skinIdx === 3
                ? "#1c0d38"
                : "#57411b"
        : skinIdx === 0
          ? "#24002e"
          : skinIdx === 1
            ? "#092429"
            : skinIdx === 2
              ? "#262b24"
              : skinIdx === 3
                ? "#420404"
                : "#211a03";
    ctx.fillRect(psx - 7, psy + 6 + bob, 14, 8);
  } else {
    // Normal warrior/paladin/archer legs
    ctx.fillStyle = isFlashing ? "#fff" : "#302217";
    ctx.fillRect(psx - 5, psy + 6 + bob, 3.5, 7);
    ctx.fillRect(psx + 1.5, psy + 6 + bob, 3.5, 7);
    ctx.fillStyle = isFlashing ? "#fff" : "#111";
    ctx.fillRect(psx - 6, psy + 12 + bob, 5, 2.5);
    ctx.fillRect(psx + 1, psy + 12 + bob, 5, 2.5);
  }

  // 3. TORSO (Armor / Robes)
  let torsoColor = "#5a6a80";
  let detailColor = "#3a4a60";
  if (cls === "melee") {
    if (skinIdx === 0) {
      torsoColor = "#738290";
      detailColor = "#415a77";
    } else if (skinIdx === 1) {
      torsoColor = "#ff4500";
      detailColor = "#1a0500";
    } else if (skinIdx === 2) {
      torsoColor = "#1c012b";
      detailColor = "#d300c5";
    } else if (skinIdx === 3) {
      torsoColor = "#ffd700";
      detailColor = "#b8860b";
    } else if (skinIdx === 4) {
      torsoColor = "#3a3f4d";
      detailColor = "#00e5ff";
    }
  } else if (cls === "magic") {
    if (skinIdx === 0) {
      torsoColor = "#1e3f66";
      detailColor = "#f0a040";
    } else if (skinIdx === 1) {
      torsoColor = "#0f4c5c";
      detailColor = "#e36414";
    } else if (skinIdx === 2) {
      torsoColor = "#9e2a2b";
      detailColor = "#ff7b00";
    } else if (skinIdx === 3) {
      torsoColor = "#3d0c5a";
      detailColor = "#ff007f";
    } else if (skinIdx === 4) {
      torsoColor = "#cd7f32";
      detailColor = "#5c4033";
    }
  } else if (cls === "paladin") {
    if (skinIdx === 0) {
      torsoColor = "#e6e6fa";
      detailColor = "#f0c040";
    } else if (skinIdx === 1) {
      torsoColor = "#1d3557";
      detailColor = "#a8dadc";
    } else if (skinIdx === 2) {
      torsoColor = "#2d6a4f";
      detailColor = "#40916c";
    } else if (skinIdx === 3) {
      torsoColor = "#e63946";
      detailColor = "#fcbf49";
    } else if (skinIdx === 4) {
      torsoColor = "#1c1c1c";
      detailColor = "#ffffff";
    }
  } else if (cls === "necro") {
    if (skinIdx === 0) {
      torsoColor = "#3c096c";
      detailColor = "#9d4edd";
    } else if (skinIdx === 1) {
      torsoColor = "#008080";
      detailColor = "#e0fbfc";
    } else if (skinIdx === 2) {
      torsoColor = "#4f5d75";
      detailColor = "#2d3142";
    } else if (skinIdx === 3) {
      torsoColor = "#660708";
      detailColor = "#a71d31";
    } else if (skinIdx === 4) {
      torsoColor = "#a3b18a";
      detailColor = "#3a5f0b";
    }
  } else if (cls === "archer") {
    if (skinIdx === 0) {
      torsoColor = "#31572c";
      detailColor = "#4f772d";
    } else if (skinIdx === 1) {
      torsoColor = "#240046";
      detailColor = "#7b2cbf";
    } else if (skinIdx === 2) {
      torsoColor = "#e85d04";
      detailColor = "#ffb703";
    } else if (skinIdx === 3) {
      torsoColor = "rgba(0,180,216,0.6)";
      detailColor = "#90e0ef";
    } else if (skinIdx === 4) {
      torsoColor = "#03045e";
      detailColor = "#00b4d8";
    }
  }

  ctx.fillStyle = isFlashing ? "#fff" : torsoColor;
  ctx.fillRect(psx - 8, psy - 8 + bob, 16, 15);
  ctx.strokeStyle = isFlashing ? "#fff" : detailColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(psx - 8, psy - 8 + bob, 16, 15);

  // Chest details (Runes, Glowing insignias)
  if (isAlt && !isFlashing) {
    ctx.strokeStyle = detailColor;
    ctx.beginPath();
    ctx.moveTo(psx, psy - 6 + bob);
    ctx.lineTo(psx, psy + 4 + bob);
    ctx.stroke();
    // Tiny core gem
    ctx.fillStyle = detailColor;
    ctx.beginPath();
    ctx.arc(psx, psy - 1 + bob, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. SHOULDERS & PAULDRONS
  ctx.fillStyle = isFlashing ? "#fff" : detailColor;
  ctx.beginPath();
  ctx.arc(psx - 9, psy - 4 + bob, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(psx + 9, psy - 4 + bob, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. HEAD & FACE
  let skinColor = "#e8c39e";
  if (cls === "necro" && skinIdx === 1)
    skinColor = "#c0e8f0"; // icy lich
  else if (cls === "archer" && skinIdx === 3) skinColor = "rgba(144,224,239,0.7)"; // phantom

  ctx.fillStyle = isFlashing ? "#fff" : skinColor;
  ctx.beginPath();
  ctx.arc(psx, psy - 14 + bob, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Draw custom Hair/Visor/Hood
  if (cls === "melee") {
    if (skinIdx === 0) {
      // Classic helmet with iron visor
      ctx.fillStyle = isFlashing ? "#fff" : "#8a9ba8";
      ctx.fillRect(psx - 5, psy - 19 + bob, 10, 5);
      ctx.fillStyle = "#a30000"; // Red crest
      ctx.fillRect(psx - 1, psy - 23 + bob, 3, 5);
    } else if (skinIdx === 1) {
      // Fire horns
      ctx.fillStyle = "#ff5500";
      ctx.beginPath();
      ctx.moveTo(psx - 4, psy - 18 + bob);
      ctx.lineTo(psx - 9, psy - 22 + bob);
      ctx.lineTo(psx - 2, psy - 17 + bob);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(psx + 4, psy - 18 + bob);
      ctx.lineTo(psx + 9, psy - 22 + bob);
      ctx.lineTo(psx + 2, psy - 17 + bob);
      ctx.fill();
    } else if (skinIdx === 2) {
      // Void crown
      ctx.fillStyle = "#3d0c5a";
      ctx.beginPath();
      ctx.moveTo(psx - 6, psy - 16 + bob);
      ctx.lineTo(psx - 4, psy - 21 + bob);
      ctx.lineTo(psx, psy - 17 + bob);
      ctx.lineTo(psx + 4, psy - 21 + bob);
      ctx.lineTo(psx + 6, psy - 16 + bob);
      ctx.fill();
    } else if (skinIdx === 3) {
      // Golden Halo
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(psx, psy - 23 + bob, 6, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (skinIdx === 4) {
      // Cyber Neon Visor
      ctx.fillStyle = "#2d2f36";
      ctx.fillRect(psx - 5, psy - 18 + bob, 10, 6);
      ctx.fillStyle = "#00e5ff"; // neon cyan visor line
      ctx.fillRect(psx - 4, psy - 16 + bob, 8, 2);
    }
  } else if (cls === "magic") {
    // Magic Hoods
    const hoodCol = torsoColor;
    ctx.fillStyle = isFlashing ? "#fff" : hoodCol;
    ctx.beginPath();
    ctx.arc(psx, psy - 15 + bob, 7.5, Math.PI, 0);
    ctx.fill();
    if (skinIdx === 1) {
      // Lightning visor glow
      ctx.fillStyle = "#ffeb3b";
      ctx.fillRect(psx - 3, psy - 15 + bob, 6, 2);
    } else if (skinIdx === 3) {
      // Galaxy Star hat
      ctx.fillStyle = "#2a085c";
      ctx.beginPath();
      ctx.moveTo(psx - 8, psy - 17 + bob);
      ctx.lineTo(psx, psy - 27 + bob);
      ctx.lineTo(psx + 8, psy - 17 + bob);
      ctx.closePath();
      ctx.fill();
    }
  } else if (cls === "necro") {
    if (skinIdx === 0) {
      // Skull mask
      ctx.fillStyle = isFlashing ? "#fff" : "#ffeedd";
      ctx.beginPath();
      ctx.arc(psx, psy - 13 + bob, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(psx - 2.5, psy - 14 + bob, 1.5, 1.5);
      ctx.fillRect(psx + 1, psy - 14 + bob, 1.5, 1.5);
    } else if (skinIdx === 2) {
      // Ragged grey hood
      ctx.fillStyle = "#4a4a4a";
      ctx.beginPath();
      ctx.arc(psx, psy - 15 + bob, 8, Math.PI, 0);
      ctx.fill();
    } else {
      ctx.fillStyle = "#2d233c";
      ctx.beginPath();
      ctx.arc(psx, psy - 16 + bob, 7, Math.PI, 0);
      ctx.fill();
    }
  } else {
    // Standard hair / hoods
    ctx.fillStyle = "#3e2723";
    ctx.beginPath();
    ctx.arc(psx, psy - 15 + bob, 7, Math.PI, 0);
    ctx.fill();
  }

  // Draw eyes (except for full visors)
  if (
    !(cls === "melee" && (skinIdx === 4 || skinIdx === 0)) &&
    !(cls === "magic" && skinIdx === 1)
  ) {
    ctx.fillStyle =
      cls === "necro" ? "#00ff00" : cls === "paladin" && skinIdx === 3 ? "#ff9800" : "#000000";
    ctx.fillRect(psx - 2.5, psy - 14 + bob, 1.3, 1.6);
    ctx.fillRect(psx + 1.2, psy - 14 + bob, 1.3, 1.6);
  }

  // 6. DYNAMIC WEAPONS & SHIELDS (pointing in facing vector direction)
  const weaponLength = 16;
  const wx = psx + fx * 10;
  const wy = psy + fy * 10 + bob;
  const wex = psx + fx * (10 + weaponLength);
  const wey = psy + fy * (10 + weaponLength) + bob;

  ctx.lineWidth = 2.5;
  if (cls === "melee") {
    // Sword drawing
    if (skinIdx === 1) {
      // Magma blade
      ctx.strokeStyle = "#ff4500";
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wex, wey);
      ctx.stroke();
      ctx.strokeStyle = "#ffea00";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + fx * 3, wy + fy * 3);
      ctx.lineTo(wex, wey);
      ctx.stroke();
    } else if (skinIdx === 2) {
      // Void slash blade
      ctx.strokeStyle = "#aa00ff";
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wex, wey);
      ctx.stroke();
    } else if (skinIdx === 3) {
      // Holy golden claymore
      ctx.strokeStyle = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wex, wey);
      ctx.stroke();
    } else if (skinIdx === 4) {
      // Neon plasma katana
      ctx.strokeStyle = "#00e5ff";
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wex, wey);
      ctx.stroke();
    } else {
      // Classic steel sword
      ctx.strokeStyle = "#b0c4de";
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wex, wey);
      ctx.stroke();
    }
  } else if (cls === "magic") {
    // Mage staff with glowing gem at top
    ctx.strokeStyle = "#5c4033"; // wooden shaft
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, wy + 4);
    ctx.lineTo(wex, wey - 4);
    ctx.stroke();
    // Gem color
    let gemCol = "#00b4d8";
    if (skinIdx === 1) gemCol = "#ffea00";
    else if (skinIdx === 2) gemCol = "#ff4500";
    else if (skinIdx === 3) gemCol = "#d000f0";
    else if (skinIdx === 4) gemCol = "#b07c2a";
    ctx.fillStyle = gemCol;
    ctx.beginPath();
    ctx.arc(wex, wey - 4, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (cls === "paladin") {
    // Holy mace & Shield
    ctx.strokeStyle = "#8a9ba8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wex, wey);
    ctx.stroke();
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(wex, wey, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (cls === "necro") {
    // Scythe of death
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, wy + 5);
    ctx.lineTo(wex, wey - 5);
    ctx.stroke();
    // blade
    ctx.strokeStyle = skinIdx === 1 ? "#70e0f0" : skinIdx === 3 ? "#e60000" : "#a3a3a3";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(wex, wey - 5);
    ctx.quadraticCurveTo(wex - fx * 10, wey - 12, wex - fx * 14, wey - 8);
    ctx.stroke();
  } else if (cls === "archer") {
    // Bow drawing
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 1.5;
    // Curved bow arcs
    ctx.beginPath();
    ctx.arc(wx + fx * 6, wy + fy * 6, 6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    // string
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(wx, wy - 3);
    ctx.lineTo(wx, wy + 9);
    ctx.stroke();
  }

  // 7. ORBITING EMITTING SKIN PARTICLES & GLOWS (Procedural beauty effect)
  if (!isFlashing) {
    const orbitRadius = 14 + Math.sin(time * 3) * 2;
    const numOrbs = skinIdx === 0 ? 1 : 3;
    let orbColor = "";

    if (cls === "melee" && skinIdx === 1)
      orbColor = "#ff4500"; // lava fireballs
    else if (cls === "melee" && skinIdx === 2)
      orbColor = "#bf00ff"; // void sparks
    else if (cls === "magic" && skinIdx === 0)
      orbColor = "#00d2ff"; // mana crystals
    else if (cls === "magic" && skinIdx === 1)
      orbColor = "#ffee00"; // lightning arcs
    else if (cls === "magic" && skinIdx === 2)
      orbColor = "#ff5500"; // fire embers
    else if (cls === "magic" && skinIdx === 3)
      orbColor = "#d000f0"; // stellar sparkles
    else if (cls === "paladin" && skinIdx === 2)
      orbColor = "#4caf50"; // forest leaves
    else if (cls === "necro" && skinIdx === 2)
      orbColor = "#5cd65c"; // green souls
    else if (cls === "necro" && skinIdx === 3)
      orbColor = "#ff1a1a"; // blood beads
    else if (cls === "necro" && skinIdx === 4)
      orbColor = "#39ff14"; // toxic waste bubbles
    else if (cls === "archer" && skinIdx === 4) orbColor = "#00e5ff"; // meteor stardust

    if (orbColor) {
      for (let o = 0; o < numOrbs; o++) {
        const angle = time * 3.5 + (o * Math.PI * 2) / numOrbs;
        const ox = psx + Math.cos(angle) * orbitRadius;
        const oy = psy - 4 + Math.sin(angle) * orbitRadius + bob;
        // Draw orbital particle glow
        const radGrd = ctx.createRadialGradient(ox, oy, 0.5, ox, oy, 5);
        radGrd.addColorStop(0, orbColor);
        radGrd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(ox, oy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ox, oy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// -------- Real-time Dynamic Lighting, Shadows and Particle Helpers --------
let lightCanvas: HTMLCanvasElement | null = null;
let lightCtx: CanvasRenderingContext2D | null = null;

function drawDynamicObstacleShadows(
  ctx: CanvasRenderingContext2D,
  g: GameState,
  w: number,
  h: number,
  camX: number,
  camY: number,
) {
  const tileStartX = Math.max(0, Math.floor(camX / TILE) - 1);
  const tileStartY = Math.max(0, Math.floor(camY / TILE) - 1);
  const tileEndX = Math.min(g.activeMap.size - 1, Math.floor((camX + w) / TILE) + 1);
  const tileEndY = Math.min(g.activeMap.size - 1, Math.floor((camY + h) / TILE) + 1);

  const px = g.player.pos.x;
  const py = g.player.pos.y;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";

  for (let ty = tileStartY; ty <= tileEndY; ty++) {
    for (let tx = tileStartX; tx <= tileEndX; tx++) {
      const tile = g.activeMap.get(tx, ty);
      // Kind 2 = Wall, Kind 11 = Column, Kind 14 = Fence, Kind 15 = Pillar
      if (tile.kind === 2 || tile.kind === 11 || tile.kind === 14 || tile.kind === 15) {
        const cx = tx * TILE + TILE / 2;
        const cy = ty * TILE + TILE / 2;

        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist > 320) continue;

        // Calculate slanted shadow projection vector stretching away from player
        const shadowLength = Math.min(26, (320 - dist) * 0.1);
        if (shadowLength <= 2) continue;

        const sdx = (dx / dist) * shadowLength;
        const sdy = (dy / dist) * shadowLength;

        const sx = tx * TILE - camX;
        const sy = ty * TILE - camY;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + TILE, sy);
        ctx.lineTo(sx + TILE + sdx, sy + TILE + sdy);
        ctx.lineTo(sx + sdx, sy + TILE + sdy);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, g: GameState, camX: number, camY: number) {
  if (!g.particles || g.particles.length === 0) return;
  ctx.save();
  for (const p of g.particles) {
    const sx = p.x - camX;
    const sy = p.y - camY;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLightingOverlay(
  ctx: CanvasRenderingContext2D,
  g: GameState,
  w: number,
  h: number,
  camX: number,
  camY: number,
) {
  if (!lightCanvas) {
    lightCanvas = document.createElement("canvas");
    lightCtx = lightCanvas.getContext("2d");
  }
  if (lightCanvas.width !== w || lightCanvas.height !== h) {
    lightCanvas.width = w;
    lightCanvas.height = h;
  }

  const lctx = lightCtx!;
  lctx.clearRect(0, 0, w, h);

  const inCave = !!g.activeCaveBiome;
  const inGrand = g.activeGrandFloor > 0;
  const floor = g.activeFloor;

  let baseDarkness = 0.15;
  if (inCave) {
    baseDarkness = floor === 2 ? 0.65 : floor === 3 ? 0.76 : floor === 4 ? 0.84 : 0.9;
  } else if (inGrand) {
    baseDarkness = 0.82;
  } else {
    const t01 = (g.time / 180) % 1;
    const cosVal = Math.cos(t01 * Math.PI * 2);
    baseDarkness = 0.1 + ((cosVal + 1) / 2) * 0.72;
  }

  const isBloodMoon = g.activeEvent?.kind === "bloodMoon";

  // Biome-aware color grading for ambient light
  let activeBiomeId = 1;
  if (inCave) {
    activeBiomeId = g.activeCaveBiome!;
  } else if (!inGrand) {
    const pTileX = Math.floor(g.player.pos.x / TILE);
    const pTileY = Math.floor(g.player.pos.y / TILE);
    const tile = g.activeMap.get(pTileX, pTileY);
    activeBiomeId = tile ? tile.biome : 1;
  }

  if (isBloodMoon) {
    lctx.fillStyle = `rgba(35, 3, 5, ${Math.max(baseDarkness, 0.75)})`;
  } else if (inCave || inGrand) {
    // Custom deep dark tint for specific cave types
    let cr = 10, cg = 12, cb = 18;
    if (activeBiomeId === 10) { // Vulcões de Obsidiana -> Fiery cave tint
      cr = 28; cg = 10; cb = 6;
    } else if (activeBiomeId === 20 || activeBiomeId === 13) { // Bioluminescente / Cristal -> Sapphire cave tint
      cr = 6; cg = 8; cb = 26;
    } else if (activeBiomeId === 6 || activeBiomeId === 7) { // Tundra / Glacial -> Frosty cave tint
      cr = 8; cg = 22; cb = 28;
    } else if (activeBiomeId === 32) { // Radioactive -> Mutated green cave tint
      cr = 12; cg = 24; cb = 8;
    }
    lctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${baseDarkness})`;
  } else {
    const t01 = (g.time / 180) % 1;
    const mixVal = (v1: number, v2: number, f: number) => v1 + (v2 - v1) * f;
    let r = 10,
      gColor = 12,
      bColor = 18;
    if (t01 < 0.22) {
      // Midnight to sunrise golden dawn transition
      const f = t01 / 0.22;
      r = mixVal(10, 210, f);
      gColor = mixVal(14, 95, f);
      bColor = mixVal(28, 28, f);
    } else if (t01 < 0.32) {
      // Sunrise gold to bright morning blue-grey
      const f = (t01 - 0.22) / 0.1;
      r = mixVal(210, 10, f);
      gColor = mixVal(95, 12, f);
      bColor = mixVal(28, 18, f);
    } else if (t01 < 0.68) {
      // broad daylight
      r = 10;
      gColor = 12;
      bColor = 18;
    } else if (t01 < 0.78) {
      // Late afternoon to majestic violet-purple sunset/twilight
      const f = (t01 - 0.68) / 0.1;
      r = mixVal(10, 155, f);
      gColor = mixVal(12, 36, f);
      bColor = mixVal(18, 180, f);
    } else if (t01 < 0.88) {
      // Twilight fading into deep midnight dark blue-black
      const f = (t01 - 0.78) / 0.1;
      r = mixVal(155, 10, f);
      gColor = mixVal(36, 14, f);
      bColor = mixVal(180, 28, f);
    } else {
      // Nighttime
      r = 10;
      gColor = 14;
      bColor = 28;
    }

    // Apply Biome Color Grading to the daytime / nighttime ambient values
    if (activeBiomeId === 10) { // Obsidiana -> Fiery orange warmth
      r = r * 0.65 + 245 * 0.35;
      gColor = gColor * 0.65 + 75 * 0.35;
      bColor = bColor * 0.65 + 10 * 0.35;
    } else if (activeBiomeId === 20 || activeBiomeId === 13) { // Bioluminescente / Cristal -> Mystic purple-blue
      r = r * 0.7 + 100 * 0.3;
      gColor = gColor * 0.7 + 55 * 0.3;
      bColor = bColor * 0.7 + 250 * 0.3;
    } else if (activeBiomeId === 9) { // Floresta Carmesim -> Blood red autumn
      r = r * 0.68 + 215 * 0.32;
      gColor = gColor * 0.68 + 20 * 0.32;
      bColor = bColor * 0.68 + 25 * 0.32;
    } else if (activeBiomeId === 6 || activeBiomeId === 7) { // Tundra / Glacial -> Arctic cold blue tint
      r = r * 0.72 + 130 * 0.28;
      gColor = gColor * 0.72 + 215 * 0.28;
      bColor = bColor * 0.72 + 255 * 0.28;
    } else if (activeBiomeId === 32) { // Radioactive -> Nuclear lime-green
      r = r * 0.68 + 55 * 0.32;
      gColor = gColor * 0.68 + 235 * 0.32;
      bColor = bColor * 0.68 + 15 * 0.32;
    } else if (activeBiomeId === 5) { // Pântano -> Murky decay green
      r = r * 0.75 + 50 * 0.25;
      gColor = gColor * 0.75 + 130 * 0.25;
      bColor = bColor * 0.75 + 60 * 0.25;
    } else if (activeBiomeId === 29) { // Plano Astral -> Cosmic nebula violet
      r = r * 0.6 + 145 * 0.4;
      gColor = gColor * 0.6 + 15 * 0.4;
      bColor = bColor * 0.6 + 225 * 0.4;
    } else if (activeBiomeId === 3 || activeBiomeId === 31) { // Desert -> Warm golden bleach
      r = r * 0.8 + 240 * 0.2;
      gColor = gColor * 0.8 + 195 * 0.2;
      bColor = bColor * 0.8 + 115 * 0.2;
    }

    lctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(gColor)}, ${Math.round(bColor)}, ${baseDarkness})`;
  }
  lctx.fillRect(0, 0, w, h);

  // Cut out light source gradients
  lctx.save();
  lctx.globalCompositeOperation = "destination-out";

  // 1. Player light source (with dynamic flicker breathing)
  const px = g.player.pos.x - camX;
  const py = g.player.pos.y - camY;
  const pRadius = 145 + Math.sin(g.time * 4.5) * 8;
  const pGrad = lctx.createRadialGradient(px, py, 12, px, py, pRadius);
  pGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  pGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.75)");
  pGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  lctx.fillStyle = pGrad;
  lctx.beginPath();
  lctx.arc(px, py, pRadius, 0, Math.PI * 2);
  lctx.fill();

  // 2. Torches, glowing crystals, or lava pools in viewport
  const tileStartX = Math.max(0, Math.floor(camX / TILE) - 1);
  const tileStartY = Math.max(0, Math.floor(camY / TILE) - 1);
  const tileEndX = Math.min(g.activeMap.size - 1, Math.floor((camX + w) / TILE) + 1);
  const tileEndY = Math.min(g.activeMap.size - 1, Math.floor((camY + h) / TILE) + 1);

  for (let ty = tileStartY; ty <= tileEndY; ty++) {
    for (let tx = tileStartX; tx <= tileEndX; tx++) {
      const tile = g.activeMap.get(tx, ty);
      // Torches (8), or special dungeon torch emitters, or ore veins
      if (tile.kind === 8 || (inCave && hashXY(tx, ty, 999) > 0.94)) {
        const sx = tx * TILE + TILE / 2 - camX;
        const sy = ty * TILE + TILE / 2 - camY;
        const tRadius = 78 + Math.sin(g.time * 12 + tx * 23 + ty * 17) * 9;
        const tGrad = lctx.createRadialGradient(sx, sy, 4, sx, sy, tRadius);
        tGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        tGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.6)");
        tGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        lctx.fillStyle = tGrad;
        lctx.beginPath();
        lctx.arc(sx, sy, tRadius, 0, Math.PI * 2);
        lctx.fill();
      }
    }
  }

  // 3. Projectile light cutouts
  for (const pr of g.projectiles) {
    const sx = pr.pos.x - camX;
    const sy = pr.pos.y - camY;
    const size = pr.kind ? 55 : 38;
    const prGrad = lctx.createRadialGradient(sx, sy, 3, sx, sy, size);
    prGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    prGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    lctx.fillStyle = prGrad;
    lctx.beginPath();
    lctx.arc(sx, sy, size, 0, Math.PI * 2);
    lctx.fill();
  }

  // 4. Meteors
  if (g.meteors) {
    for (const m of g.meteors) {
      const sx = m.x - camX;
      const sy = m.y - camY;
      const mRadius = 130;
      const mGrad = lctx.createRadialGradient(sx, sy, 12, sx, sy, mRadius);
      mGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      mGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      lctx.fillStyle = mGrad;
      lctx.beginPath();
      lctx.arc(sx, sy, mRadius, 0, Math.PI * 2);
      lctx.fill();
    }
  }

  lctx.restore();

  // High contrast colored glow overlay (Screen Mode)
  lctx.save();
  lctx.globalCompositeOperation = "screen";

  // Player warm halo
  const pFlare = lctx.createRadialGradient(px, py, 4, px, py, pRadius * 0.7);
  pFlare.addColorStop(0, "rgba(255, 205, 110, 0.24)");
  pFlare.addColorStop(0.5, "rgba(255, 125, 45, 0.09)");
  pFlare.addColorStop(1, "rgba(255, 125, 45, 0)");
  lctx.fillStyle = pFlare;
  lctx.beginPath();
  lctx.arc(px, py, pRadius * 0.7, 0, Math.PI * 2);
  lctx.fill();

  // Torch flares
  for (let ty = tileStartY; ty <= tileEndY; ty++) {
    for (let tx = tileStartX; tx <= tileEndX; tx++) {
      const tile = g.activeMap.get(tx, ty);
      if (tile.kind === 8 || (inCave && hashXY(tx, ty, 999) > 0.94)) {
        const sx = tx * TILE + TILE / 2 - camX;
        const sy = ty * TILE + TILE / 2 - camY;
        const tRadius = 78 + Math.sin(g.time * 12 + tx * 23 + ty * 17) * 9;
        const tFlare = lctx.createRadialGradient(sx, sy, 2, sx, sy, tRadius * 0.75);
        tFlare.addColorStop(0, "rgba(255, 165, 45, 0.38)");
        tFlare.addColorStop(0.4, "rgba(255, 85, 15, 0.14)");
        tFlare.addColorStop(1, "rgba(255, 85, 15, 0)");
        lctx.fillStyle = tFlare;
        lctx.beginPath();
        lctx.arc(sx, sy, tRadius * 0.75, 0, Math.PI * 2);
        lctx.fill();
      }
    }
  }

  // Projectile colorful flares
  for (const pr of g.projectiles) {
    const sx = pr.pos.x - camX;
    const sy = pr.pos.y - camY;
    const size = pr.kind ? 55 : 38;
    let colorStart = "rgba(255, 115, 55, 0.45)";
    let colorEnd = "rgba(255, 75, 15, 0)";
    if (pr.kind === "magic_bolt") {
      colorStart = "rgba(0, 200, 235, 0.5)";
      colorEnd = "rgba(0, 115, 235, 0)";
    } else if (pr.kind === "dark_bolt") {
      colorStart = "rgba(175, 110, 255, 0.45)";
      colorEnd = "rgba(90, 15, 235, 0)";
    } else if (pr.kind === "holy_swing") {
      colorStart = "rgba(255, 240, 140, 0.4)";
      colorEnd = "rgba(255, 180, 45, 0)";
    }

    const prFlare = lctx.createRadialGradient(sx, sy, 3, sx, sy, size * 0.85);
    prFlare.addColorStop(0, colorStart);
    prFlare.addColorStop(1, colorEnd);
    lctx.fillStyle = prFlare;
    lctx.beginPath();
    lctx.arc(sx, sy, size * 0.85, 0, Math.PI * 2);
    lctx.fill();
  }

  lctx.restore();

  ctx.drawImage(lightCanvas, 0, 0);
}

// --- Ambient Weather Particle System ---
interface WeatherParticle {
  id: number;
  x: number; // screen space X
  y: number; // screen space Y
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
  wobbleSeed: number;
  wobbleSpeed: number;
  type: "ember" | "snowflake" | "raindrop" | "spore" | "wisp" | "petal";
  angle?: number;
}

const weatherParticles: WeatherParticle[] = [];
let weatherParticleIdSeq = 0;

function getBiomeWeatherType(biomeId: number, name: string, caveLabel: string): "ember" | "snowflake" | "raindrop" | "spore" | "wisp" | "petal" {
  const lowerName = (name + " " + caveLabel).toLowerCase();
  
  if (
    lowerName.includes("vulc") || 
    lowerName.includes("obsidiana") || 
    lowerName.includes("cinza") || 
    lowerName.includes("escald") || 
    lowerName.includes("forja") || 
    lowerName.includes("fogo") || 
    lowerName.includes("magma") || 
    lowerName.includes("núcleo") || 
    lowerName.includes("cânion") || 
    lowerName.includes("piche") || 
    biomeId === 10 || biomeId === 19 || biomeId === 40 || biomeId === 52
  ) {
    return "ember";
  }
  
  if (
    lowerName.includes("gelo") || 
    lowerName.includes("boreal") || 
    lowerName.includes("glacial") || 
    lowerName.includes("congel") || 
    lowerName.includes("tundra") || 
    lowerName.includes("yeti") || 
    lowerName.includes("permafrost") ||
    biomeId === 6 || biomeId === 7 || biomeId === 24
  ) {
    return "snowflake";
  }
  
  if (
    lowerName.includes("tempest") || 
    lowerName.includes("mar") || 
    lowerName.includes("marinho") || 
    lowerName.includes("água") || 
    lowerName.includes("maré") || 
    lowerName.includes("fossa") || 
    lowerName.includes("recife") || 
    lowerName.includes("chuva") || 
    lowerName.includes("lagoa") || 
    biomeId === 11 || biomeId === 12 || biomeId === 21 || biomeId === 43 || biomeId === 46 || biomeId === 47 || biomeId === 56
  ) {
    return "raindrop";
  }
  
  if (
    lowerName.includes("sombra") || 
    lowerName.includes("abismo") || 
    lowerName.includes("astral") || 
    lowerName.includes("cósmic") || 
    lowerName.includes("vazio") || 
    lowerName.includes("cripta") || 
    lowerName.includes("cemitério") || 
    lowerName.includes("fúnebre") || 
    lowerName.includes("espectral") || 
    lowerName.includes("morto") || 
    lowerName.includes("radioativ") || 
    lowerName.includes("bunker") || 
    lowerName.includes("cristal") || 
    lowerName.includes("geoda") || 
    lowerName.includes("tumba") || 
    lowerName.includes("catacumba") || 
    lowerName.includes("masmorra") || 
    biomeId === 13 || biomeId === 17 || biomeId === 22 || biomeId === 27 || biomeId === 28 || biomeId === 29 || biomeId === 60 || biomeId === 99
  ) {
    return "wisp";
  }

  if (
    lowerName.includes("floresta") ||
    lowerName.includes("outono") ||
    lowerName.includes("bosque") ||
    lowerName.includes("jardim") ||
    lowerName.includes("aurora") ||
    lowerName.includes("planície") ||
    lowerName.includes("verde") ||
    biomeId === 1 || biomeId === 8 || biomeId === 9 || biomeId === 25
  ) {
    return "petal";
  }
  
  return "spore";
}

function updateAndDrawAmbientWeather(
  ctx: CanvasRenderingContext2D,
  g: GameState,
  w: number,
  h: number,
  camX: number,
  camY: number
) {
  const inCave = !!g.activeCaveBiome;
  const inGrand = g.activeGrandFloor > 0;
  let activeBiomeId = 1;
  let activeBiomeName = "Planícies de Aurora";
  let caveLabel = "";

  if (inCave) {
    activeBiomeId = g.activeCaveBiome!;
    const b = BIOMES.find(bb => bb.id === activeBiomeId);
    if (b) {
      activeBiomeName = b.name;
      caveLabel = b.caveTheme.label;
    } else {
      activeBiomeName = "Caverna";
      caveLabel = "Caverna";
    }
  } else if (inGrand) {
    activeBiomeId = 99; // Grand dungeon
    activeBiomeName = "Câmara do Vazio";
    caveLabel = "Masmorra";
  } else if (g.activeMap) {
    const pTileX = Math.floor(g.player.pos.x / TILE);
    const pTileY = Math.floor(g.player.pos.y / TILE);
    const tile = g.activeMap.get(pTileX, pTileY);
    activeBiomeId = tile ? tile.biome : 1;
    const b = BIOMES.find(bb => bb.id === activeBiomeId);
    if (b) {
      activeBiomeName = b.name;
    }
  }

  const weatherType = getBiomeWeatherType(activeBiomeId, activeBiomeName, caveLabel);

  // 2. Adjust target particle count depending on weather type
  let targetCount = 35;
  if (weatherType === "raindrop") targetCount = 100;
  if (weatherType === "snowflake") targetCount = 60;
  if (weatherType === "wisp") targetCount = 20;
  if (weatherType === "petal") targetCount = 40;

  // 3. Remove expired particles or wrong-type particles
  for (let i = weatherParticles.length - 1; i >= 0; i--) {
    const p = weatherParticles[i];
    p.life--;
    
    if (p.type === "ember") {
      p.x += p.vx + Math.sin(g.time * p.wobbleSpeed + p.wobbleSeed) * 0.4;
      p.y += p.vy;
      p.alpha = (p.life / p.maxLife) * (0.6 + Math.sin(g.time * 8 + p.wobbleSeed) * 0.4);
    } else if (p.type === "snowflake") {
      p.x += p.vx + Math.sin(g.time * p.wobbleSpeed + p.wobbleSeed) * 0.5;
      p.y += p.vy;
      p.alpha = p.life / p.maxLife;
    } else if (p.type === "raindrop") {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = p.life / p.maxLife;
    } else if (p.type === "spore") {
      p.x += p.vx + Math.sin(g.time * p.wobbleSpeed + p.wobbleSeed) * 0.8;
      p.y += p.vy + Math.cos(g.time * p.wobbleSpeed * 0.5 + p.wobbleSeed) * 0.2;
      p.alpha = (p.life / p.maxLife) * (0.5 + Math.sin(g.time * 4 + p.wobbleSeed) * 0.5);
    } else if (p.type === "wisp") {
      p.x += p.vx + Math.sin(g.time * p.wobbleSpeed + p.wobbleSeed) * 1.2;
      p.y += p.vy + Math.cos(g.time * p.wobbleSpeed + p.wobbleSeed) * 0.6;
      p.alpha = (p.life / p.maxLife) * (0.4 + Math.sin(g.time * 3 + p.wobbleSeed) * 0.4);
    } else if (p.type === "petal") {
      p.x += p.vx + Math.sin(g.time * p.wobbleSpeed + p.wobbleSeed) * 0.5;
      p.y += p.vy;
      p.alpha = p.life / p.maxLife;
      if (p.angle !== undefined) {
        p.angle += 0.02 + Math.sin(p.wobbleSeed) * 0.015;
      }
    }

    const outPadding = 40;
    if (
      p.life <= 0 || 
      p.x < -outPadding || p.x > w + outPadding || 
      p.y < -outPadding || p.y > h + outPadding
    ) {
      weatherParticles.splice(i, 1);
    }
  }

  // 4. Spawn new particles up to target count
  const matchingParticles = weatherParticles.filter(p => p.type === weatherType);
  if (matchingParticles.length < targetCount) {
    const toSpawn = Math.min(4, targetCount - matchingParticles.length);
    for (let i = 0; i < toSpawn; i++) {
      const isInitial = weatherParticles.length === 0;
      let px = Math.random() * w;
      let py = Math.random() * h;

      if (!isInitial) {
        if (weatherType === "ember") {
          px = Math.random() * w;
          py = h + 10;
        } else if (weatherType === "snowflake") {
          if (Math.random() < 0.6) {
            px = Math.random() * w;
            py = -10;
          } else {
            px = -10;
            py = Math.random() * h;
          }
        } else if (weatherType === "raindrop") {
          if (Math.random() < 0.7) {
            px = Math.random() * w;
            py = -20;
          } else {
            px = -20;
            py = Math.random() * h;
          }
        } else {
          if (Math.random() < 0.5) {
            px = Math.random() < 0.5 ? -10 : w + 10;
            py = Math.random() * h;
          } else {
            px = Math.random() * w;
            py = Math.random() < 0.5 ? -10 : h + 10;
          }
        }
      }

      let vx = 0;
      let vy = 0;
      let size = 2;
      let maxLife = 100 + Math.random() * 200;
      let color = "rgba(255,255,255,1)";

      if (weatherType === "ember") {
        vx = (Math.random() - 0.5) * 0.3;
        vy = -0.5 - Math.random() * 0.8;
        size = 1.2 + Math.random() * 1.8;
        maxLife = 120 + Math.random() * 150;
        const rVal = 230 + Math.floor(Math.random() * 25);
        const gVal = 80 + Math.floor(Math.random() * 120);
        const bVal = 20 + Math.floor(Math.random() * 30);
        color = `rgb(${rVal}, ${gVal}, ${bVal})`;
      } else if (weatherType === "snowflake") {
        vx = 0.2 + Math.random() * 0.5;
        vy = 0.4 + Math.random() * 0.7;
        size = 1.5 + Math.random() * 2.5;
        maxLife = 180 + Math.random() * 200;
        const cVal = 230 + Math.floor(Math.random() * 25);
        color = `rgb(${cVal}, ${cVal + 15}, 255)`;
      } else if (weatherType === "raindrop") {
        vx = 2.5 + Math.random() * 1.5;
        vy = 7.0 + Math.random() * 4.0;
        size = 0.8 + Math.random() * 0.8;
        maxLife = 50 + Math.random() * 40;
        color = "rgba(160, 210, 255, 0.45)";
      } else if (weatherType === "spore") {
        vx = (Math.random() - 0.5) * 0.4;
        vy = (Math.random() - 0.5) * 0.15;
        size = 1.5 + Math.random() * 1.5;
        maxLife = 200 + Math.random() * 250;
        if (activeBiomeId === 16 || activeBiomeId === 3 || activeBiomeId === 31) {
          color = `rgb(255, ${200 + Math.floor(Math.random() * 55)}, 50)`;
        } else {
          color = `rgb(${100 + Math.floor(Math.random() * 120)}, 255, ${60 + Math.floor(Math.random() * 60)})`;
        }
      } else if (weatherType === "wisp") {
        vx = (Math.random() - 0.5) * 0.3;
        vy = (Math.random() - 0.5) * 0.3;
        size = 2.0 + Math.random() * 2.5;
        maxLife = 150 + Math.random() * 180;
        if (activeBiomeId === 32) {
          color = "rgb(100, 255, 50)";
        } else if (activeBiomeId === 55) {
          color = "rgb(255, 20, 20)";
        } else if (Math.random() < 0.5) {
          color = "rgb(170, 80, 255)";
        } else {
          color = "rgb(0, 220, 255)";
        }
      } else if (weatherType === "petal") {
        vx = -0.6 - Math.random() * 0.8;
        vy = 0.5 + Math.random() * 0.8;
        size = 2.0 + Math.random() * 2.5;
        maxLife = 140 + Math.random() * 120;
        if (activeBiomeId === 9 || activeBiomeId === 8) {
          const seed = Math.random();
          if (seed < 0.4) {
            color = `rgb(${190 + Math.floor(Math.random() * 50)}, 70, 30)`;
          } else if (seed < 0.8) {
            color = `rgb(${210 + Math.floor(Math.random() * 45)}, ${140 + Math.floor(Math.random() * 50)}, 40)`;
          } else {
            color = `rgb(${150 + Math.floor(Math.random() * 30)}, 90, 40)`;
          }
        } else {
          color = `rgb(255, ${170 + Math.floor(Math.random() * 40)}, ${185 + Math.floor(Math.random() * 40)})`;
        }
      }

      weatherParticles.push({
        id: ++weatherParticleIdSeq,
        x: px,
        y: py,
        vx,
        vy,
        size,
        alpha: 0,
        color,
        maxLife,
        life: maxLife,
        wobbleSeed: Math.random() * 100,
        wobbleSpeed: 0.02 + Math.random() * 0.05,
        type: weatherType,
        angle: weatherType === "petal" ? Math.random() * Math.PI * 2 : undefined,
      });
    }
  }

  ctx.save();
  for (const p of weatherParticles) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.type === "raindrop") {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5);
      ctx.stroke();
    } else if (p.type === "petal") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle || 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === "wisp") {
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "ember") {
      ctx.shadowBlur = 4;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Stormy Lightning Flash Event (10,000x better dynamic atmospheric effect!)
  if (weatherType === "raindrop") {
    if (Math.sin(g.time * 0.4) * Math.cos(g.time * 2.2) > 0.985 && Math.random() < 0.22) {
      ctx.save();
      ctx.fillStyle = `rgba(240, 248, 255, ${0.45 + Math.random() * 0.45})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  // 1. Passing cloud shadows overlay (only during day on non-caves)
  if (!inCave && !inGrand) {
    const t01 = (g.time / 180) % 1;
    if (t01 > 0.22 && t01 < 0.78) { // Only during broad day
      ctx.save();
      ctx.globalAlpha = 0.05 * (1 - (Math.abs(Math.cos(t01 * Math.PI * 2)) * 0.7)); // Subtly fade according to daylight
      ctx.fillStyle = "#1e293b";
      const cloudSpeed = g.time * 0.25;
      for (let i = 0; i < 4; i++) {
        const cx = ((cloudSpeed + i * w * 0.35) % (w * 1.6)) - w * 0.3;
        const cy = (h * 0.15 + Math.sin(g.time * 0.005 + i * 2) * h * 0.15 + i * h * 0.22) % h;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 140 + i * 20, 60 + i * 10, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Cinematic Golden Godrays / Sunbeams (Extraordinary overworld polish!)
  if (!inCave && !inGrand) {
    const t01 = (g.time / 180) % 1;
    if (t01 > 0.22 && t01 < 0.78) { // Only during daytime
      ctx.save();
      const sunFactor = Math.sin((t01 - 0.22) / (0.78 - 0.22) * Math.PI);
      ctx.globalAlpha = 0.12 * sunFactor;
      const rayCount = 5;
      const raySpeed = g.time * 0.015;
      for (let i = 0; i < rayCount; i++) {
        const angle = Math.PI * 0.23 + Math.sin(raySpeed + i * 2.2) * 0.025;
        const width = 50 + Math.sin(raySpeed * 1.2 + i * 1.5) * 15;
        const startX = -120 + i * (w / (rayCount - 1)) + Math.cos(raySpeed * 0.6 + i) * 40;
        ctx.fillStyle = "rgba(255, 248, 195, 0.25)";
        ctx.beginPath();
        ctx.moveTo(startX, -40);
        ctx.lineTo(startX + width, -40);
        ctx.lineTo(startX + width + h * Math.tan(angle), h + 40);
        ctx.lineTo(startX + h * Math.tan(angle), h + 40);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Gorgeous Floating Volumetric Clouds and Ambient Fog
  ctx.save();
  const cloudTime = g.time * 0.18;
  let fogCol = "rgba(255, 255, 255, 0.04)";
  if (inCave) {
    if (activeBiomeId === 10) fogCol = "rgba(239, 68, 68, 0.05)";
    else if (activeBiomeId === 20 || activeBiomeId === 13) fogCol = "rgba(100, 180, 255, 0.06)";
    else if (activeBiomeId === 32) fogCol = "rgba(132, 204, 22, 0.05)";
    else fogCol = "rgba(150, 150, 165, 0.035)";
  } else if (inGrand) {
    fogCol = "rgba(147, 51, 234, 0.045)";
  } else {
    if (activeBiomeId === 5) fogCol = "rgba(74, 90, 58, 0.08)";
    else if (activeBiomeId === 9) fogCol = "rgba(160, 45, 45, 0.07)";
    else if (activeBiomeId === 10 || activeBiomeId === 40) fogCol = "rgba(239, 90, 25, 0.06)";
    else if (activeBiomeId === 32) fogCol = "rgba(132, 204, 22, 0.07)";
    else if (activeBiomeId === 6 || activeBiomeId === 7) fogCol = "rgba(170, 225, 255, 0.06)";
    else if (activeBiomeId === 49 || activeBiomeId === 60) fogCol = "rgba(150, 80, 240, 0.065)";
    else {
      const t01 = (g.time / 180) % 1;
      if (t01 < 0.22 || t01 > 0.78) {
        fogCol = "rgba(35, 45, 75, 0.06)";
      } else if (t01 < 0.35) {
        fogCol = "rgba(251, 150, 70, 0.055)";
      } else {
        fogCol = "rgba(255, 255, 255, 0.035)";
      }
    }
  }

  // Skip large purple/ambient fog blobs entirely inside the Grand Dungeon —
  // they were rendering as 3 giant purple ellipses that cluttered the view.
  if (!inGrand) {
    for (let i = 0; i < 4; i++) {
      const cloudSeed = i * 27.8;
      const speedMult = 0.35 + (i % 3) * 0.25;
      const cx = ((cloudTime * speedMult + i * w * 0.38) % (w * 1.5)) - w * 0.25;
      const cy = (h * 0.22 + Math.sin(g.time * 0.015 + cloudSeed) * h * 0.15 + i * h * 0.18) % h;
      const rx = 160 + i * 45;
      const ry = 80 + i * 22;

      const fogGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, rx);
      fogGrad.addColorStop(0, fogCol);
      fogGrad.addColorStop(0.4, fogCol.replace(/[\d\.]+\)$/, "0.45)"));
      fogGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fogGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0.12 + i * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // ✨ Animated aurora shader band — a subtle sweeping wave of colored light
  // that adds an alive, magical shimmer over every biome without obscuring gameplay.
  {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const auroraHue = inGrand
      ? "rgba(120, 90, 255, 0.10)"
      : inCave
        ? "rgba(90, 200, 255, 0.07)"
        : activeBiomeId === 10
          ? "rgba(255, 120, 40, 0.09)"
          : activeBiomeId === 32
            ? "rgba(140, 255, 70, 0.09)"
            : activeBiomeId === 6 || activeBiomeId === 7
              ? "rgba(160, 220, 255, 0.10)"
              : "rgba(180, 220, 255, 0.06)";
    const t = g.time * 0.6;
    for (let i = 0; i < 3; i++) {
      const yBase = h * (0.2 + i * 0.28) + Math.sin(t + i * 1.7) * 24;
      const grd = ctx.createLinearGradient(0, yBase - 40, 0, yBase + 40);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(0.5, auroraHue);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= w; x += 24) {
        const yy = yBase + Math.sin(x * 0.012 + t * (1 + i * 0.3) + i) * 14;
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(w, yBase + 40);
      ctx.lineTo(0, yBase + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Heat Haze Distortion / Glow for Volcanoes of Obsidiana (10)
  if (activeBiomeId === 10 && !inCave) {
    ctx.save();
    ctx.fillStyle = `rgba(239, 68, 68, ${0.02 + Math.sin(g.time * 2.5) * 0.012})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 3. Toxic Pulse Glow for Radioactive Lands (32)
  if (activeBiomeId === 32 && !inCave) {
    ctx.save();
    ctx.fillStyle = `rgba(132, 204, 22, ${0.015 + Math.sin(g.time * 1.8) * 0.008})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 4. Eerie Mist for Pântano Sombrio (5) or Crimson Forest (9)
  if ((activeBiomeId === 5 || activeBiomeId === 9) && !inCave) {
    ctx.save();
    const mistColor = activeBiomeId === 5 ? "rgba(74, 90, 58, 0.04)" : "rgba(138, 58, 58, 0.03)";
    ctx.fillStyle = mistColor;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }
}

// -------- main render --------
export function render(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  let camX = g.camera.x - w / 2;
  let camY = g.camera.y - h / 2;
  if (g.shakeTime && g.shakeTime > 0 && g.shakeIntensity) {
    camX += (Math.random() - 0.5) * g.shakeIntensity * 2;
    camY += (Math.random() - 0.5) * g.shakeIntensity * 2;
  }
  const inCave = !!g.activeCaveBiome;
  const inGrand = g.activeGrandFloor > 0;
  const biomeLook = (!inCave && !inGrand) || g.activeFloor === 4;
  const cave = inCave ? caveTint(g.activeCaveBiome!) : null;

  const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
  const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
  const x1 = Math.min(g.activeMap.size, Math.ceil((camX + w) / TILE) + 1);
  const y1 = Math.min(g.activeMap.size, Math.ceil((camY + h) / TILE) + 1);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const t = g.activeMap.get(x, y);
      const sx = x * TILE - camX,
        sy = y * TILE - camY;
      if (inGrand) {
        drawDungeonTile(ctx, sx, sy, t.kind, x, y, g.time, g.activeGrandFloor);
      } else if (biomeLook) {
        const blendedCol = getBlendedBiomeColor(g, x, y, t.biome);
        if (t.kind === 1) drawWaterTile(ctx, sx, sy, x, y, g.time);
        else if (t.kind === 3) drawSandTile(ctx, sx, sy, t.biome, x, y, blendedCol);
        else if (t.kind === 2) drawMountainTile(ctx, sx, sy, t.biome, x, y);
        else if (t.kind === 4) drawTreeTile(ctx, sx, sy, t.biome, x, y, g.time, blendedCol);
        else if (t.kind === 5) {
          drawGrassTile(ctx, sx, sy, t.biome, x, y, g.time, blendedCol);
          drawCity(ctx, sx, sy, t.biome, g.time);
        } else if (t.kind === 6 || t.kind === 7) {
          drawGrassTile(ctx, sx, sy, t.biome, x, y, g.time, blendedCol);
          drawStair(ctx, sx, sy, t.kind, g.time);
        } else if (t.kind >= 8 && t.kind <= 16) drawCityTile(ctx, sx, sy, t.kind, x, y, g.time);
        else {
          drawGrassTile(ctx, sx, sy, t.biome, x, y, g.time, blendedCol);
          drawDecor(ctx, sx, sy, t.biome, x, y, g.time, blendedCol);
        }
      } else {
        // cave rendering — floor + wall + accents
        const floor = cave!.floor;
        const wall = cave!.wall;
        const grad = ctx.createRadialGradient(sx + 16, sy + 16, 2, sx + 16, sy + 16, 22);
        grad.addColorStop(0, shade(floor, 10));
        grad.addColorStop(1, shade(floor, -8));
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE, TILE);
        // cracks in floor
        if (hashXY(x, y, 7) > 0.85) {
          ctx.strokeStyle = shade(floor, -25);
          ctx.lineWidth = 1;
          const cx = sx + 4 + hashXY(x, y, 1) * 24,
            cy = sy + 4 + hashXY(x, y, 2) * 24;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + 6, cy + 4);
          ctx.lineTo(cx + 3, cy + 9);
          ctx.stroke();
        }
        if (t.kind === 2) {
          ctx.fillStyle = shade(wall, -15);
          ctx.beginPath();
          ctx.moveTo(sx + 4, sy + 30);
          ctx.lineTo(sx + 16, sy + 4);
          ctx.lineTo(sx + 28, sy + 30);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = wall;
          ctx.beginPath();
          ctx.moveTo(sx + 8, sy + 30);
          ctx.lineTo(sx + 16, sy + 10);
          ctx.lineTo(sx + 24, sy + 30);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = cave!.accent;
          ctx.globalAlpha = 0.4;
          ctx.fillRect(sx + 15, sy + 8, 3, 6);
          ctx.globalAlpha = 1;
          ctx.fillStyle = shade(cave!.accent, -10);
          ctx.fillRect(sx + 12, sy + 6, 1, 4);
          ctx.fillRect(sx + 20, sy + 8, 1, 3);
        } else if (t.kind === 6 || t.kind === 7) {
          drawStair(ctx, sx, sy, t.kind, g.time);
        } else if (hashXY(x, y, 999) > 0.94) {
          const kind = Math.floor(hashXY(x, y, 998) * 3);
          if (kind === 0) {
            ctx.fillStyle = shade(wall, 10);
            ctx.beginPath();
            ctx.moveTo(sx + 12, sy + 24);
            ctx.lineTo(sx + 16, sy + 14);
            ctx.lineTo(sx + 20, sy + 24);
            ctx.closePath();
            ctx.fill();
          } else if (kind === 1) {
            ctx.fillStyle = "#e0d8c0";
            ctx.fillRect(sx + 10, sy + 18, 12, 2);
            ctx.beginPath();
            ctx.arc(sx + 10, sy + 19, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx + 22, sy + 19, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "#3a2010";
            ctx.fillRect(sx + 15, sy + 14, 2, 10);
            const fl = 0.6 + Math.sin(g.time * 8 + x + y) * 0.35;
            ctx.fillStyle = `rgba(255,180,60,${0.5 + fl * 0.3})`;
            ctx.beginPath();
            ctx.arc(sx + 16, sy + 12, 4 + fl, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff8c0";
            ctx.beginPath();
            ctx.arc(sx + 16, sy + 12, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // Draw real-time slanted obstacle shadows stretching from player
  drawDynamicObstacleShadows(ctx, g, w, h, camX, camY);

  // city labels (overworld only)
  if (!inCave && !inGrand) {
    for (const c of g.world.cities) {
      const sx = c.x - camX,
        sy = c.y - camY;
      if (sx < -80 || sy < -40 || sx > w + 80 || sy > h + 40) continue;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(sx - 42, sy - 46, 84, 14);
      ctx.strokeStyle = "#f0c040";
      ctx.strokeRect(sx - 42, sy - 46, 84, 14);
      ctx.fillStyle = "#f0e0a0";
      ctx.fillText(c.name, sx, sy - 36);
    }
  }

  // loot
  for (const l of g.loot) {
    const sx = l.pos.x - camX,
      sy = l.pos.y - camY;
    drawLoot(ctx, sx, sy, l.item.icon, l.item.color, g.time);
  }

  // veins (mining nodes)
  if (g.veins) {
    for (const v of g.veins) {
      const sx = v.pos.x - camX,
        sy = v.pos.y - camY;
      if (sx < -40 || sy < -40 || sx > w + 40 || sy > h + 40) continue;
      drawVein(ctx, v, sx, sy, g.time);
    }
  }

  // necromancer minions
  if (g.player.minions && g.player.minions.length) {
    for (const m of g.player.minions) {
      const sx = m.pos.x - camX,
        sy = m.pos.y - camY;
      if (sx < -40 || sy < -40 || sx > w + 40 || sy > h + 40) continue;
      drawSkeleton(ctx, sx, sy, g.time, m.hp / m.maxHp);
    }
  }

  // enemies
  for (const e of g.enemies) {
    const sx = e.pos.x - camX,
      sy = e.pos.y - camY;
    if (sx < -60 || sy < -60 || sx > w + 60 || sy > h + 60) continue;

    // --- DRAW TELEGRAPHED BOSS ATTACK WARNINGS ---
    if (e.isBoss && e.castTime !== undefined && e.castTime > 0 && e.castMax !== undefined) {
      const pct = 1 - e.castTime / e.castMax;
      ctx.save();
      if (e.castType === "smash") {
        // Circular ground warning centered on Boss
        ctx.beginPath();
        ctx.arc(sx, sy, 120, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 64, 64, ${0.15 + pct * 0.18})`;
        ctx.fill();
        ctx.lineWidth = 3.0;
        ctx.strokeStyle = `rgba(240, 64, 64, ${0.45 + pct * 0.45})`;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        
        // Inner expanding shockwave line
        ctx.beginPath();
        ctx.arc(sx, sy, 120 * pct, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240, 64, 64, 0.22)";
        ctx.fill();
      } else if (e.castType === "eruption") {
        // Targeted warning centered on player
        const psx = g.player.pos.x - camX;
        const psy = g.player.pos.y - camY;
        ctx.beginPath();
        ctx.arc(psx, psy, 90, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 150, 0, ${0.12 + pct * 0.20})`;
        ctx.fill();
        ctx.lineWidth = 3.0;
        ctx.strokeStyle = `rgba(245, 150, 0, ${0.5 + pct * 0.5})`;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        // Inner expanding shockwave line
        ctx.beginPath();
        ctx.arc(psx, psy, 90 * pct, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 150, 0, 0.18)";
        ctx.fill();
      }
      ctx.restore();
    }

    drawEnemy(ctx, e, sx, sy, g.time);

    // hp bar setup
    const bw = e.radius * 2 + (e.isBoss ? 20 : 4),
      bh = e.isBoss ? 6 : 4;
    const bx = sx - bw / 2,
      by = sy - e.radius - 14;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

    // Smooth damage prediction calculation
    const trailKey = `_trailHp_${e.id}`;
    if ((e as any)[trailKey] === undefined) (e as any)[trailKey] = e.hp / e.maxHp;
    if ((e as any)[trailKey] > e.hp / e.maxHp) {
      (e as any)[trailKey] = Math.max(e.hp / e.maxHp, (e as any)[trailKey] - 0.45 * 0.016);
    } else {
      (e as any)[trailKey] = e.hp / e.maxHp;
    }

    // Draw the trailing prediction block first (coral/lighter red background)
    if ((e as any)[trailKey] > e.hp / e.maxHp) {
      ctx.fillStyle = e.isBoss ? "rgba(255, 120, 120, 0.75)" : "rgba(255, 180, 180, 0.7)";
      ctx.fillRect(bx, by, bw * (e as any)[trailKey], bh);
    }

    const hpGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
    if (e.isBoss) {
      hpGrad.addColorStop(0, "#ff2040");
      hpGrad.addColorStop(1, "#c00020");
    } else {
      hpGrad.addColorStop(0, "#40e060");
      hpGrad.addColorStop(1, "#20a040");
    }
    ctx.fillStyle = hpGrad;
    ctx.fillRect(bx, by, (bw * e.hp) / e.maxHp, bh);
    if (e.isBoss) {
      ctx.fillStyle = "#f0b040";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(e.name, sx, sy - e.radius - 18);
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Lv${e.level}`, sx, sy - e.radius - 18);
    }
  }

  // projectiles
  for (const pr of g.projectiles) {
    const sx = pr.pos.x - camX,
      sy = pr.pos.y - camY;
    drawProjectile(ctx, sx, sy, pr.from === "player", g.time);
  }

  // player
  const p = g.player;
  drawPlayer(ctx, p, p.pos.x - camX, p.pos.y - camY, g.time);

  // active pet (rendered right after the player so it draws on top of ground
  // but underneath UI overlays)
  if (g.activePet) {
    drawActivePet(ctx, g, camX, camY);
  }

  ctx.textAlign = "center";
  ctx.font = "bold 12px monospace";
  for (const f of g.floaters) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillText(f.text, f.x - camX + 1, f.y - camY + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x - camX, f.y - camY);
  }

  // falling meteors (event)
  if (g.meteors && g.meteors.length) {
    for (const m of g.meteors) {
      const sx = m.x - camX,
        sy = m.y - camY;
      // fire trail
      ctx.fillStyle = "rgba(255,140,60,0.5)";
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        ctx.fillRect(sx - 3 + Math.sin(g.time * 20 + i) * 2, sy - i * 14, 6 - t * 5, 4);
      }
      // meteor body
      ctx.fillStyle = "#ff6030";
      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff080";
      ctx.beginPath();
      ctx.arc(sx - 2, sy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // particles
  drawParticles(ctx, g, camX, camY);

  // Real-time Dynamic Lighting Overlay (replaces old static day/night/vignette)
  drawLightingOverlay(ctx, g, w, h, camX, camY);

  // Ambient Weather Effects (falling embers, shifting mist/spores, snow, rain, cosmic wisps)
  updateAndDrawAmbientWeather(ctx, g, w, h, camX, camY);

  // --- Beautiful Cinematic Vignette overlay ---
  const vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.78);
  vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  vigGrad.addColorStop(1, "rgba(4, 5, 10, 0.65)");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, w, h);

  if (g.activeEvent?.kind === "bloodMoon") {
    ctx.save();
    // blood moon sky element
    ctx.fillStyle = "#ff4060";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(w - 80, 90, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#a01020";
    ctx.beginPath();
    ctx.arc(w - 70, 82, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 92, 100, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (g.activeEvent?.kind === "earthquake") {
    const sh = Math.sin(g.time * 40) * 3;
    ctx.fillStyle = "rgba(120,80,20,0.15)";
    ctx.fillRect(sh, sh, w, h);
  }

  drawHUD(ctx, g, w, h);
  if (g.panel === "inventory") drawInventory(ctx, g, w, h);
  else if (g.panel === "stats") drawStats(ctx, g, w, h);
  else if (g.panel === "help") drawHelp(ctx, g, w, h);
  else if (g.panel === "map") drawWorldMap(ctx, g, w, h);
  else if (g.panel === "mining") drawMining(ctx, g, w, h);
  else if (g.panel === "crafting") drawCrafting(ctx, g, w, h);
  else if (g.panel === "achievements") drawAchievements(ctx, g, w, h);
  if (g.paused) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", w / 2, h / 2);
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const p = g.player;
  const dt = 0.016; // approximate frame delta

  // Expanded HUD Box for the new Class-Specific Resource Bar!
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(10, 10, 280, 128);
  ctx.strokeStyle = "#f0c040";
  ctx.strokeRect(10, 10, 280, 128);
  ctx.strokeStyle = "#222";
  ctx.strokeRect(11, 11, 278, 126);

  ctx.textAlign = "left";
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#f0e0a0";
  ctx.fillText(`Nível ${p.level}`, 20, 28);
  ctx.fillStyle = "#f0c040";
  ctx.fillText(`${p.gold}g`, 220, 28);

  // Player HP Damage prediction trail calculations
  if ((p as any).trailHp === undefined) (p as any).trailHp = p.hp / p.maxHp;
  if ((p as any).trailHp > p.hp / p.maxHp) {
    (p as any).trailHp = Math.max(p.hp / p.maxHp, (p as any).trailHp - 0.40 * dt);
  } else {
    (p as any).trailHp = p.hp / p.maxHp;
  }

  drawBar(
    ctx,
    20,
    34,
    260,
    11,
    p.hp / p.maxHp,
    "#c03030",
    "#3a0a0a",
    `HP ${Math.ceil(p.hp)}/${p.maxHp}`,
    (p as any).trailHp
  );
  drawBar(
    ctx,
    20,
    48,
    260,
    8,
    p.shield / (p.maxShield || 30),
    "#06b6d4",
    "#083344",
    `ESCUDO ${Math.ceil(p.shield)}/${p.maxShield}`,
  );
  drawBar(
    ctx,
    20,
    58,
    260,
    10,
    p.mp / p.maxMp,
    "#3060c0",
    "#0a1a3a",
    `MP ${Math.floor(p.mp)}/${p.maxMp}`,
  );

  // --- Dynamic Class Unique Resource Bar ---
  let resName = "FÚRIA";
  let resColor = "#f97316";
  let resBg = "#431407";
  let resVal = p.classResource || 0;
  let resMax = p.classResourceMax || 100;

  if (p.cls === "archer") {
    resName = "FOCO";
    resColor = "#10b981";
    resBg = "#064e3b";
  } else if (p.cls === "magic") {
    resName = "FLUXO";
    resColor = "#06b6d4";
    resBg = "#083344";
  } else if (p.cls === "vampire") {
    resName = "SANGUE";
    resColor = "#e11d48";
    resBg = "#4c0519";
  } else if (p.cls === "samurai") {
    resName = "POSTURA";
    resColor = "#eab308";
    resBg = "#451a03";
  } else if (p.cls === "monk") {
    resName = "CHI";
    resColor = "#a855f7";
    resBg = "#3b0764";
  } else if (p.cls === "gunslinger") {
    resName = "BALAS";
    resColor = "#94a3b8";
    resBg = "#1e293b";
    resMax = 6;
  } else if (p.cls === "assassin") {
    resName = "COMBO";
    resColor = "#ec4899";
    resBg = "#500724";
    resMax = 5;
  } else if (p.cls === "reaper") {
    resName = "MORTE";
    resColor = "#6366f1";
    resBg = "#1e1b4b";
  }

  drawBar(
    ctx,
    20,
    70,
    260,
    10,
    resVal / resMax,
    resColor,
    resBg,
    `${resName} ${Math.floor(resVal)}/${resMax}`
  );

  // XP Bar (shifted down)
  drawBar(ctx, 20, 83, 260, 6, p.xp / p.xpNext, "#f0b040", "#3a2a08", ``);

  ctx.font = "11px monospace";
  ctx.fillStyle = "#ccc";
  ctx.fillText(`XP ${p.xp}/${p.xpNext}   ATK ${p.atk()}   DEF ${p.def()}`, 20, 102);
  let regionName = "—";
  if (g.activeCaveBiome) {
    const b = BIOMES.find((bb) => bb.id === g.activeCaveBiome!);
    if (b) regionName = b.caveTheme.label;
  } else {
    const t = g.activeMap.get(Math.floor(p.pos.x / TILE), Math.floor(p.pos.y / TILE));
    const b = BIOMES.find((bb) => bb.id === t.biome);
    if (b) regionName = b.name;
  }
  ctx.fillText(
    `Região: ${regionName}   Inimigos: ${g.enemies.length}   Kills: ${g.kills}`,
    20,
    116,
  );

  // skill bar bottom
  const sw = 56,
    gap = 6,
    total = p.skills.length * sw + (p.skills.length - 1) * gap;
  const sx0 = w / 2 - total / 2;
  for (let i = 0; i < p.skills.length; i++) {
    const s = p.skills[i];
    const x = sx0 + i * (sw + gap);
    const y = h - 66;
    const g2 = ctx.createLinearGradient(x, y, x, y + 56);
    g2.addColorStop(0, "rgba(40,40,60,0.9)");
    g2.addColorStop(1, "rgba(10,10,20,0.9)");
    ctx.fillStyle = g2;
    ctx.fillRect(x, y, sw, 56);
    ctx.strokeStyle = "#f0c040";
    ctx.strokeRect(x, y, sw, 56);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(s.key, x + sw / 2, y + 24);
    ctx.font = "9px monospace";
    ctx.fillText(s.name, x + sw / 2, y + 38);
    ctx.fillStyle = "#8ecfff";
    ctx.fillText(`${s.cost}mp`, x + sw / 2, y + 50);
    if (s.cur > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(x, y + 56 - (s.cur / s.cd) * 56, sw, (s.cur / s.cd) * 56);
    }
  }

  let ly = h - 76;
  ctx.font = "12px monospace";
  ctx.textAlign = "left";
  for (const l of g.log) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.6, l.life / 6)})`;
    ctx.fillRect(10, ly - 12, 460, 16);
    ctx.fillStyle = l.color;
    ctx.globalAlpha = Math.min(1, l.life / 3);
    ctx.fillText(l.text, 14, ly);
    ctx.globalAlpha = 1;
    ly -= 18;
  }

  ctx.font = "11px monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "#aaa";
  ctx.fillText("M=Mapa  I=Inventário  C=Atributos  H=Ajuda  P=Pausa  F5=Salvar", w - 12, 22);

  drawMinimap(ctx, g, w - 170, 36, 160, 160);
}

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  color: string,
  bg: string,
  label: string,
  trailRatio?: number,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);

  // Draw smooth damage-trailing overlay (lighter red / coral)
  if (trailRatio !== undefined && trailRatio > ratio) {
    ctx.fillStyle = "rgba(255, 100, 100, 0.7)";
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, trailRatio)), h);
  }

  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, shade(color, 25));
  grd.addColorStop(1, shade(color, -15));
  ctx.fillStyle = grd;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
  // shine
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), Math.max(1, h / 3));
  ctx.strokeStyle = "#000";
  ctx.strokeRect(x, y, w, h);
  if (label) {
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2 + 1, y + h - 2);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x + w / 2, y + h - 3);
  }
}

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  g: GameState,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.strokeStyle = "#f0c040";
  ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
  const map = g.activeMap;
  const sz = map.size;
  const inCave = !!g.activeCaveBiome;
  const cave = inCave ? caveTint(g.activeCaveBiome!) : null;
  const img = ctx.getImageData(x, y, w, h);
  const parseHex = (c: string): [number, number, number] => [
    parseInt(c.slice(1, 3), 16),
    parseInt(c.slice(3, 5), 16),
    parseInt(c.slice(5, 7), 16),
  ];
  const caveFloorC: [number, number, number] | null = cave ? parseHex(cave.floor) : null;
  const caveWallC: [number, number, number] | null = cave ? parseHex(cave.wall) : null;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const wx = Math.floor((px / w) * sz);
      const wy = Math.floor((py / h) * sz);
      const t = map.get(wx, wy);
      let col: [number, number, number] = [80, 80, 80];
      if (inCave && g.activeFloor !== 4) {
        col = t.kind === 2 ? caveWallC! : caveFloorC!;
      } else if (inCave && g.activeFloor === 4) {
        const b = BIOMES.find((bb) => bb.id === g.activeCaveBiome!);
        if (t.kind === 2) col = [90, 90, 100];
        else if (t.kind === 1) col = [30, 60, 120];
        else if (b) col = parseHex(b.color);
      } else {
        if (t.kind === 1) col = [30, 60, 120];
        else if (t.kind === 2) col = [90, 90, 100];
        else {
          const b = BIOMES.find((bb) => bb.id === t.biome);
          if (b) col = parseHex(b.color);
        }
      }
      const idx = (py * w + px) * 4;
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, x, y);

  const pulse = 0.5 + Math.sin(g.time * 4) * 0.5;
  for (const s of map.stairs) {
    const sx = x + (s.x / TILE / sz) * w;
    const sy = y + (s.y / TILE / sz) * h;
    ctx.save();
    ctx.globalAlpha = 0.35 + pulse * 0.35;
    ctx.fillStyle = "#f0d040";
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff060";
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const p = g.player;
  const pxm = x + (p.pos.x / TILE / sz) * w;
  const pym = y + (p.pos.y / TILE / sz) * h;
  ctx.fillStyle = "#fff";
  ctx.fillRect(pxm - 2, pym - 2, 4, 4);

  ctx.fillStyle = "#f0d040";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "left";
  ctx.fillText(inCave ? `${g.activeFloor}º ANDAR` : "OVERWORLD", x, y + h + 12);
}

// ===== Pixel-art modal shell (matches reference RPG UI) =====
type PanelId = "inventory" | "stats" | "help" | "map" | "mining" | "crafting" | "achievements";
type TabHit = { id: PanelId; rect: [number, number, number, number] };

function drawPixelFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // outer dim
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(x + 6, y + 6, w, h);
  // outer black border
  ctx.fillStyle = "#0a0806";
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  // gold outer frame
  ctx.fillStyle = "#8a5a1a";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = "#f0c040";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = "#8a5a1a";
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  // inner dark panel
  ctx.fillStyle = "#1a120a";
  ctx.fillRect(x, y, w, h);
  // top highlight / bottom shadow for bevel
  ctx.fillStyle = "rgba(240,192,64,0.18)";
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x, y + h - 2, w, 2);
}

function drawTabs(
  ctx: CanvasRenderingContext2D,
  g: GameState,
  x: number,
  y: number,
  w: number,
  active: PanelId,
) {
  const tabs: { id: PanelId; label: string }[] = [
    { id: "stats", label: "STATS" },
    { id: "inventory", label: "INVENT." },
    { id: "mining", label: "MINER." },
    { id: "crafting", label: "CRAFT" },
    { id: "achievements", label: "AMBIC." },
    { id: "help", label: "AJUDA" },
    { id: "map", label: "MAPA" },
  ];
  const tw = Math.floor(w / tabs.length);
  const th = 30;
  const hits: TabHit[] = [];
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  tabs.forEach((t, i) => {
    const tx = x + i * tw;
    const isActive = t.id === active;
    // base
    ctx.fillStyle = isActive ? "#f0c040" : "#2a1c10";
    ctx.fillRect(tx, y, tw - 2, th);
    // top bevel
    ctx.fillStyle = isActive ? "#fff0a0" : "#4a3420";
    ctx.fillRect(tx, y, tw - 2, 2);
    // bottom shadow
    ctx.fillStyle = isActive ? "#a8781c" : "#0a0604";
    ctx.fillRect(tx, y + th - 2, tw - 2, 2);
    // border
    ctx.strokeStyle = "#0a0604";
    ctx.strokeRect(tx + 0.5, y + 0.5, tw - 3, th - 1);
    // label
    ctx.fillStyle = isActive ? "#1a0a04" : "#c8a878";
    ctx.fillText(t.label, tx + (tw - 2) / 2, y + th / 2 + 1);
    hits.push({ id: t.id, rect: [tx, y, tw - 2, th] });
  });
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  (g as unknown as { _tabs?: TabHit[] })._tabs = hits;
}

function drawSlot(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  // outer dark
  ctx.fillStyle = "#0a0604";
  ctx.fillRect(x, y, s, s);
  // tan cell
  ctx.fillStyle = "#6a4a2a";
  ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
  ctx.fillStyle = "#8a6438";
  ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
  // top highlight
  ctx.fillStyle = "#b08858";
  ctx.fillRect(x + 2, y + 2, s - 4, 1);
  ctx.fillRect(x + 2, y + 2, 1, s - 4);
  // bottom shadow
  ctx.fillStyle = "#3a2410";
  ctx.fillRect(x + 2, y + s - 3, s - 4, 1);
  ctx.fillRect(x + s - 3, y + 2, 1, s - 4);
}

function drawInventory(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const bw = 560,
    bh = 400;
  const x = w / 2 - bw / 2,
    y = h / 2 - bh / 2;
  drawPixelFrame(ctx, x, y, bw, bh);
  drawTabs(ctx, g, x + 8, y + 8, bw - 16, "inventory");

  const p = g.player;
  // equipped strip
  const eqY = y + 52;
  ctx.fillStyle = "#c8a878";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("EQUIPADOS", x + 16, eqY + 12);
  drawSlot(ctx, x + 16, eqY + 20, 40);
  drawSlot(ctx, x + 62, eqY + 20, 40);
  if (p.equipped.weapon) {
    ctx.fillStyle = p.equipped.weapon.color;
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.equipped.weapon.icon, x + 36, eqY + 47);
  }
  if (p.equipped.armor) {
    ctx.fillStyle = p.equipped.armor.color;
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.equipped.armor.icon, x + 82, eqY + 47);
  }
  ctx.textAlign = "left";
  ctx.font = "10px monospace";
  ctx.fillStyle = "#f0e0a0";
  ctx.fillText(
    p.equipped.weapon ? `${p.equipped.weapon.name} +${p.equipped.weapon.power}` : "sem arma",
    x + 112,
    eqY + 32,
  );
  ctx.fillText(
    p.equipped.armor ? `${p.equipped.armor.name} +${p.equipped.armor.power}` : "sem armadura",
    x + 112,
    eqY + 50,
  );
  ctx.fillStyle = "#c8a878";
  ctx.font = "9px monospace";
  ctx.fillText("clique num item para usar/equipar/vender  •  I fecha", x + 16, y + bh - 12);

  // grid
  const cols = 8,
    rows = 4;
  const slot = 44;
  const gridW = cols * (slot + 2) - 2;
  const gx = x + (bw - gridW) / 2;
  const gy = eqY + 72;
  const grid = { x: gx, y: gy, cellW: slot + 2, cellH: slot + 2 };
  (g as unknown as { _invGrid?: typeof grid })._invGrid = grid;
  for (let i = 0; i < cols * rows; i++) {
    const cx = gx + (i % cols) * (slot + 2);
    const cy = gy + Math.floor(i / cols) * (slot + 2);
    drawSlot(ctx, cx, cy, slot);
    const it = p.inventory[i];
    if (it) {
      // rarity glow
      ctx.fillStyle = it.color + "40";
      ctx.fillRect(cx + 3, cy + 3, slot - 6, slot - 6);
      // icon
      ctx.fillStyle = it.color;
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(it.icon, cx + slot / 2, cy + slot / 2);
      // power badge bottom-right
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.fillRect(cx + slot - 16, cy + slot - 12, 14, 10);
      ctx.fillStyle = "#f0e0a0";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`+${it.power}`, cx + slot - 3, cy + slot - 4);
    }
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawStats(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const bw = 480,
    bh = 400;
  const x = w / 2 - bw / 2,
    y = h / 2 - bh / 2;
  drawPixelFrame(ctx, x, y, bw, bh);
  drawTabs(ctx, g, x + 8, y + 8, bw - 16, "stats");

  const p = g.player;
  const startY = y + 60;
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#f0c040";
  ctx.textAlign = "left";
  ctx.fillText(
    `Nv ${p.level}   HP ${Math.round(p.hp)}/${p.maxHp}   MP ${Math.round(p.mp)}/${p.maxMp}`,
    x + 20,
    startY,
  );
  ctx.font = "10px monospace";
  ctx.fillStyle = "#c8a878";
  ctx.fillText(`Pontos disponíveis: ${p.attrPoints}    •    C fecha`, x + 20, startY + 18);

  const rows: Array<["str" | "agi" | "int" | "vit", string, string]> = [
    ["str", "FOR", "Força — dano corpo-a-corpo"],
    ["agi", "AGI", "Agilidade — reservada"],
    ["int", "INT", "Inteligência — MP e magia"],
    ["vit", "VIT", "Vitalidade — HP e defesa"],
  ];
  const grid = {
    x,
    y,
    rows: [] as Array<{ k: "str" | "agi" | "int" | "vit"; rect: [number, number, number, number] }>,
  };
  rows.forEach((r, i) => {
    const yy = startY + 44 + i * 56;
    // row bg
    ctx.fillStyle = "#0f0906";
    ctx.fillRect(x + 16, yy - 4, bw - 32, 46);
    ctx.strokeStyle = "#3a2410";
    ctx.strokeRect(x + 16, yy - 4, bw - 32, 46);
    // stat chip
    ctx.fillStyle = "#f0c040";
    ctx.fillRect(x + 22, yy + 2, 38, 32);
    ctx.fillStyle = "#8a5a1a";
    ctx.fillRect(x + 22, yy + 30, 38, 4);
    ctx.fillStyle = "#1a0a04";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(r[1], x + 41, yy + 15);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    // value
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px monospace";
    ctx.fillText(String(p.attr[r[0]]), x + 72, yy + 26);
    // desc
    ctx.fillStyle = "#c8a878";
    ctx.font = "10px monospace";
    ctx.fillText(r[2], x + 108, yy + 26);
    // + button
    const bx = x + bw - 60,
      by = yy + 4,
      bwB = 40,
      bhB = 30;
    const active = p.attrPoints > 0;
    ctx.fillStyle = "#0a0604";
    ctx.fillRect(bx - 1, by - 1, bwB + 2, bhB + 2);
    ctx.fillStyle = active ? "#3a8a3a" : "#3a2410";
    ctx.fillRect(bx, by, bwB, bhB);
    ctx.fillStyle = active ? "#7ad078" : "#5a3a20";
    ctx.fillRect(bx, by, bwB, 3);
    ctx.fillStyle = active ? "#1a4a1a" : "#1a0a04";
    ctx.fillRect(bx, by + bhB - 3, bwB, 3);
    ctx.fillStyle = active ? "#fff" : "#8a6438";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", bx + bwB / 2, by + bhB / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    grid.rows.push({ k: r[0], rect: [bx, by, bwB, bhB] });
  });
  (g as unknown as { _statsGrid?: typeof grid })._statsGrid = grid;

  // Skins Selector at the bottom of the Stats Panel
  const skinY = startY + 268;
  ctx.fillStyle = "#1a120a";
  ctx.fillRect(x + 16, skinY, bw - 32, 54);
  ctx.strokeStyle = "#8a5a1a";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 16, skinY, bw - 32, 54);

  const skinsList = CLASS_SKINS[p.cls] || [];
  const activeSkinIndex = p.skin ?? 0;
  const activeSkin = skinsList[activeSkinIndex] || { name: "Skin Clássica", description: "" };

  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("SKIN DA CLASSE:", x + 26, skinY + 16);

  // Left button
  const prevRect: [number, number, number, number] = [x + 24, skinY + 24, 28, 22];
  ctx.fillStyle = "#0a0604";
  ctx.fillRect(prevRect[0] - 1, prevRect[1] - 1, prevRect[2] + 2, prevRect[3] + 2);
  ctx.fillStyle = "#2a1c10";
  ctx.fillRect(prevRect[0], prevRect[1], prevRect[2], prevRect[3]);
  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("<", prevRect[0] + prevRect[2] / 2, prevRect[1] + prevRect[3] / 2);

  // Active skin name
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(activeSkin.name, x + bw / 2, skinY + 20);

  // Description
  ctx.fillStyle = "#a89078";
  ctx.font = "9px monospace";
  ctx.fillText(activeSkin.description, x + bw / 2, skinY + 38);

  // Right button
  const nextRect: [number, number, number, number] = [x + bw - 52, skinY + 24, 28, 22];
  ctx.fillStyle = "#0a0604";
  ctx.fillRect(nextRect[0] - 1, nextRect[1] - 1, nextRect[2] + 2, nextRect[3] + 2);
  ctx.fillStyle = "#2a1c10";
  ctx.fillRect(nextRect[0], nextRect[1], nextRect[2], nextRect[3]);
  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 12px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(">", nextRect[0] + nextRect[2] / 2, nextRect[1] + nextRect[3] / 2);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // Bind hit rects
  (
    g as unknown as {
      _skinGrid?: {
        prev: [number, number, number, number];
        next: [number, number, number, number];
      };
    }
  )._skinGrid = {
    prev: prevRect,
    next: nextRect,
  };
}

function drawHelp(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const bw = 600,
    bh = 400;
  const x = w / 2 - bw / 2,
    y = h / 2 - bh / 2;
  drawPixelFrame(ctx, x, y, bw, bh);
  drawTabs(ctx, g, x + 8, y + 8, bw - 16, "help");

  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#f0c040";
  ctx.textAlign = "left";
  ctx.fillText("CONTROLES", x + 20, y + 66);
  ctx.font = "12px monospace";
  ctx.fillStyle = "#e8d8a8";
  const lines = [
    "WASD / setas — mover           Shift — correr",
    "Mouse — mirar                  Clique — atacar",
    "1 Golpe Giratório   2 Raio Arcano   3 Cura   4 Investida",
    "I Inventário   C Atributos   H Ajuda   P Pausar   M Mapa",
    "F5 Salvar   F9 Carregar   F10 Apagar save",
    "",
    "Explore Asterion: 40 biomas procedurais.",
    "Cada bioma tem uma ESCADA ▼ (amarela no mapa)",
    "que leva a masmorras com chefes e loot raro.",
    "Pise na ESCADA ▲ para voltar ao overworld.",
  ];
  lines.forEach((l, i) => ctx.fillText(l, x + 20, y + 92 + i * 22));
}

function drawAchievements(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const bw = 600, bh = 400;
  const x = w / 2 - bw / 2, y = h / 2 - bh / 2;
  drawPixelFrame(ctx, x, y, bw, bh);
  drawTabs(ctx, g, x + 8, y + 8, bw - 16, "achievements");

  const page = g._achPage || 1;
  const p = g.player;
  const unlocked = (p as unknown as { unlockedAchievements?: Set<string> }).unlockedAchievements || new Set<string>();

  // Title & overall stats
  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "left";
  ctx.fillText("AMBIÇÕES E CONQUISTAS DE ASTERION", x + 16, y + 58);

  ctx.fillStyle = "#fff";
  ctx.font = "10px monospace";
  const unlCount = unlocked.size;
  const pct = Math.floor((unlCount / ACHIEVEMENTS.length) * 100);
  ctx.fillText(`Desbloqueado: ${unlCount}/${ACHIEVEMENTS.length} (${pct}%)`, x + 16, y + 71);

  // Draw passive buffs list in miniature
  ctx.fillStyle = "#8fcfff";
  ctx.font = "bold 9px monospace";
  const bonuses = p.achievementBonuses || {
    dmgMult: 1.0, strBonus: 0, vitBonus: 0, intBonus: 0, agiBonus: 0,
    critBonus: 0, miningSpeedMult: 1.0, extraHp: 0, extraMp: 0,
    defMult: 1.0, potionBonus: 1.0, hpRegen: 0
  };
  const bText = `Bônus Ativos: ` +
    `Dano +${Math.round((bonuses.dmgMult - 1) * 100)}% | ` +
    `Def +${Math.round((bonuses.defMult - 1) * 100)}% | ` +
    `STR +${bonuses.strBonus} | ` +
    `VIT +${bonuses.vitBonus} | ` +
    `INT +${bonuses.intBonus} | ` +
    `AGI +${bonuses.agiBonus} | ` +
    `Crítico +${bonuses.critBonus}% | ` +
    `Miner. +${Math.round((bonuses.miningSpeedMult - 1) * 100)}% | ` +
    `HP/s +${bonuses.hpRegen.toFixed(1)} | ` +
    `HP +${bonuses.extraHp} | ` +
    `MP +${bonuses.extraMp} | ` +
    `Poc. +${Math.round((bonuses.potionBonus - 1) * 100)}%`;
  
  ctx.fillText(bText.slice(0, 114), x + 16, y + 84);

  // Pagination bounds
  const achievementsPerPage = 16;
  const pageCount = 7;
  const perPage = 16;
  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, ACHIEVEMENTS.length);
  const pageAch = ACHIEVEMENTS.slice(startIndex, endIndex);

  // Let's draw achievements for this page
  const colW = 280;
  const colH = 25;
  const colXOffset = 286;
  
  pageAch.forEach((ach, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const ax = x + 16 + col * colXOffset;
    const ay = y + 100 + row * colH;

    const isUnlocked = unlocked.has(ach.id);

    // Box border & background
    ctx.fillStyle = isUnlocked ? "rgba(240, 192, 64, 0.08)" : "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(ax, ay, colW - 6, colH - 4);
    ctx.strokeStyle = isUnlocked ? "#f0c040" : "#4a3420";
    ctx.lineWidth = 1;
    ctx.strokeRect(ax, ay, colW - 6, colH - 4);

    // Left indicator icon/status
    ctx.fillStyle = isUnlocked ? "#f0c040" : "#7c5c44";
    ctx.font = "bold 9px monospace";
    ctx.fillText(isUnlocked ? "✔" : "🔒", ax + 6, ay + 13);

    // Achievement Name & Description
    ctx.fillStyle = isUnlocked ? "#fff" : "#8c7460";
    ctx.font = "bold 9px monospace";
    ctx.fillText(ach.name.slice(0, 26), ax + 18, ay + 13);

    ctx.fillStyle = isUnlocked ? "#d8c0a8" : "#6c5440";
    ctx.font = "8px monospace";
    ctx.fillText(ach.desc.slice(0, 40), ax + 132, ay + 13);
  });

  // Draw paginator buttons at the bottom
  const prevBtn: [number, number, number, number] = [x + 16, y + 368, 80, 22];
  const nextBtn: [number, number, number, number] = [x + bw - 96, y + 368, 80, 22];

  // Prev
  ctx.fillStyle = "#0a0604";
  ctx.fillRect(prevBtn[0] - 1, prevBtn[1] - 1, prevBtn[2] + 2, prevBtn[3] + 2);
  ctx.fillStyle = page > 1 ? "#2a1c10" : "#140e0a";
  ctx.fillRect(prevBtn[0], prevBtn[1], prevBtn[2], prevBtn[3]);
  ctx.fillStyle = page > 1 ? "#f0c040" : "#543c2c";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ANTERIOR", prevBtn[0] + prevBtn[2] / 2, prevBtn[1] + 14);

  // Next
  ctx.fillStyle = "#0a0604";
  ctx.fillRect(nextBtn[0] - 1, nextBtn[1] - 1, nextBtn[2] + 2, nextBtn[3] + 2);
  ctx.fillStyle = page < pageCount ? "#2a1c10" : "#140e0a";
  ctx.fillRect(nextBtn[0], nextBtn[1], nextBtn[2], nextBtn[3]);
  ctx.fillStyle = page < pageCount ? "#f0c040" : "#543c2c";
  ctx.fillText("PRÓXIMA", nextBtn[0] + nextBtn[2] / 2, nextBtn[1] + 14);

  // Page text
  ctx.fillStyle = "#c8a878";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`PÁGINA ${page} DE ${pageCount}`, x + bw / 2, y + 382);

  // Store click hits
  g._achPageHits = {
    prev: prevBtn,
    next: nextBtn,
  };
}

// -------------------------------------------------------------------------
// MAPA MÚNDI — versão nova (v2): renderizado uma única vez em offscreen
// canvas, com sombreamento de costa, névoa de guerra real, bússola,
// escala, grade, rota até a escada mais próxima e legenda paginada.
// -------------------------------------------------------------------------

type WorldMapCache = {
  base: HTMLCanvasElement; // terreno + costas + grade (não muda)
  size: number;            // g.world.size no momento do cache
  w: number;               // largura em px
  h: number;               // altura em px
};
const mapCache: WeakMap<GameState, WorldMapCache> = new WeakMap();

function buildWorldMapBase(g: GameState, mapW: number, mapH: number): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = mapW;
  off.height = mapH;
  const octx = off.getContext("2d")!;
  const sz = g.world.size;

  // 1) terreno base — pixel por pixel via ImageData
  const img = octx.createImageData(mapW, mapH);
  const kindColor = (t: any): [number, number, number] => {
    if (t.kind === 1) return [30, 60, 110];       // água
    if (t.kind === 2) return [130, 130, 140];     // montanha
    if (t.kind === 3) return [210, 170, 90];      // areia
    if (t.kind === 4) return [40, 90, 50];        // floresta
    if (t.kind === 5) return [240, 220, 120];     // capital/estrada
    if (t.kind === 6) return [240, 210, 60];      // escada
    const b = BIOMES.find((bb) => bb.id === t.biome);
    if (b) {
      const c = b.color;
      return [
        parseInt(c.slice(1, 3), 16),
        parseInt(c.slice(3, 5), 16),
        parseInt(c.slice(5, 7), 16),
      ];
    }
    return [90, 90, 90];
  };

  for (let py = 0; py < mapH; py++) {
    for (let px = 0; px < mapW; px++) {
      const wx = Math.floor((px / mapW) * sz);
      const wy = Math.floor((py / mapH) * sz);
      const t = g.world.get(wx, wy);
      let [r, gr, b] = kindColor(t);

      // sombreamento diagonal barato (pseudo-relevo)
      const shadeSeed = ((wx * 73856093) ^ (wy * 19349663)) >>> 0;
      const shade = ((shadeSeed % 17) - 8) / 32; // -0.25..+0.25
      r = Math.max(0, Math.min(255, r + r * shade));
      gr = Math.max(0, Math.min(255, gr + gr * shade));
      b = Math.max(0, Math.min(255, b + b * shade));

      const idx = (py * mapW + px) * 4;
      img.data[idx] = r;
      img.data[idx + 1] = gr;
      img.data[idx + 2] = b;
      img.data[idx + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);

  // 2) contornos de costa: onde tile é água e vizinho não é (ou vice-versa)
  octx.fillStyle = "rgba(0,0,0,0.55)";
  for (let py = 1; py < mapH - 1; py += 1) {
    for (let px = 1; px < mapW - 1; px += 1) {
      const wx = Math.floor((px / mapW) * sz);
      const wy = Math.floor((py / mapH) * sz);
      const here = g.world.get(wx, wy);
      const isWaterHere = here.kind === 1;
      const nx = Math.floor(((px + 1) / mapW) * sz);
      const ny = Math.floor(((py + 1) / mapH) * sz);
      const right = g.world.get(nx, wy);
      const down = g.world.get(wx, ny);
      if (isWaterHere !== (right.kind === 1) || isWaterHere !== (down.kind === 1)) {
        octx.fillRect(px, py, 1, 1);
      }
    }
  }

  // 3) grade sutil a cada 10% do mapa
  octx.strokeStyle = "rgba(240, 224, 160, 0.09)";
  octx.lineWidth = 1;
  for (let i = 1; i < 10; i++) {
    octx.beginPath();
    octx.moveTo((mapW * i) / 10, 0);
    octx.lineTo((mapW * i) / 10, mapH);
    octx.stroke();
    octx.beginPath();
    octx.moveTo(0, (mapH * i) / 10);
    octx.lineTo(mapW, (mapH * i) / 10);
    octx.stroke();
  }

  return off;
}

function drawCityIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, known: boolean) {
  ctx.save();
  ctx.translate(cx, cy);
  const c = known ? "#f0c040" : "#3a3a3a";
  const e = known ? "#3a2a08" : "#111";
  // base
  ctx.fillStyle = c;
  ctx.fillRect(-4, -1, 8, 5);
  // ameias
  ctx.fillRect(-4, -3, 2, 2);
  ctx.fillRect(-1, -3, 2, 2);
  ctx.fillRect(2, -3, 2, 2);
  // borda
  ctx.strokeStyle = e;
  ctx.lineWidth = 1;
  ctx.strokeRect(-4, -1, 8, 5);
  ctx.restore();
}

function drawStairIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, pulse: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = 0.35 + pulse * 0.35;
  ctx.fillStyle = "#f0d040";
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // seta pra baixo (▼)
  ctx.fillStyle = "#fff8a0";
  ctx.beginPath();
  ctx.moveTo(-3, -2);
  ctx.lineTo(3, -2);
  ctx.lineTo(0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a2a08";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(15,10,5,0.85)";
  ctx.strokeStyle = "#c8a878";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // rosa dos ventos
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.moveTo(0, -r + 3);
  ctx.lineTo(3, 0);
  ctx.lineTo(0, r - 3);
  ctx.lineTo(-3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0e0a0";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -r + 8);
  ctx.fillText("S", 0, r - 8);
  ctx.fillText("O", -r + 8, 0);
  ctx.fillText("L", r - 8, 0);
  ctx.restore();
}

function drawScaleBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, worldTiles: number) {
  const halfKm = Math.round(worldTiles / 4); // rótulo estilizado
  ctx.save();
  ctx.strokeStyle = "#c8a878";
  ctx.fillStyle = "#c8a878";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, 5);
  ctx.fillRect(x, y, w / 2, 5);
  ctx.fillStyle = "#f0e0a0";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText("0", x - 2, y + 16);
  ctx.textAlign = "right";
  ctx.fillText(`${halfKm * 2} lg`, x + w + 2, y + 16);
  ctx.restore();
}

function nearestKnownStair(g: GameState) {
  const px = g.player.pos.x;
  const py = g.player.pos.y;
  let best: any = null;
  let bestD = Infinity;
  for (const s of g.world.stairs) {
    if (!g.discovered.has(s.biome)) continue;
    const dx = s.x - px;
    const dy = s.y - py;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

function drawWorldMap(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  // fundo — pergaminho escurecido
  ctx.fillStyle = "rgba(4,3,2,0.96)";
  ctx.fillRect(0, 0, w, h);

  drawTabs(ctx, g, w / 2 - 300, 10, 600, "map");

  // título
  ctx.fillStyle = "#f0e0a0";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.fillText("✦  ASTERION — Mapa Múndi  ✦", w / 2, 66);
  ctx.font = "11px monospace";
  ctx.fillStyle = "#a8946a";
  ctx.fillText(
    "M / Esc para fechar   •   ▼ escadas   •   ⌂ capitais   •   névoa = inexplorado",
    w / 2,
    86,
  );

  // geometria — mapa quadrado + coluna lateral pra legenda
  const isNarrow = w < 780;
  const sideW = isNarrow ? 0 : 240;
  const margin = isNarrow ? 16 : 40;
  const availH = h - 110 - margin;
  const availW = w - margin * 2 - sideW - (isNarrow ? 0 : 20);
  const mapSize = Math.min(availW, availH);
  const mx = isNarrow ? (w - mapSize) / 2 : margin + (availW - mapSize) / 2;
  const my = 108;

  // moldura decorada
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(mx - 8, my - 8, mapSize + 16, mapSize + 16);
  ctx.strokeStyle = "#8a6a30";
  ctx.lineWidth = 2;
  ctx.strokeRect(mx - 8, my - 8, mapSize + 16, mapSize + 16);
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 1;
  ctx.strokeRect(mx - 4, my - 4, mapSize + 8, mapSize + 8);
  // cantos ornamentais
  for (const [cx, cy] of [
    [mx - 8, my - 8],
    [mx + mapSize + 8, my - 8],
    [mx - 8, my + mapSize + 8],
    [mx + mapSize + 8, my + mapSize + 8],
  ] as const) {
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2a08";
    ctx.beginPath();
    ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // base cacheada (terreno + costas + grade)
  let cache = mapCache.get(g);
  if (!cache || cache.w !== mapSize || cache.h !== mapSize || cache.size !== g.world.size) {
    cache = {
      base: buildWorldMapBase(g, mapSize, mapSize),
      size: g.world.size,
      w: mapSize,
      h: mapSize,
    };
    mapCache.set(g, cache);
  }
  ctx.drawImage(cache.base, mx, my);

  // clip da área do mapa
  ctx.save();
  ctx.beginPath();
  ctx.rect(mx, my, mapSize, mapSize);
  ctx.clip();

  // névoa de guerra — escurece biomas não descobertos
  const sz = g.world.size;
  const cellPx = mapSize / sz;
  const step = Math.max(2, Math.floor(cellPx * 4)); // amostra grosseira p/ performance
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let py = 0; py < mapSize; py += step) {
    for (let px = 0; px < mapSize; px += step) {
      const wx = Math.floor((px / mapSize) * sz);
      const wy = Math.floor((py / mapSize) * sz);
      const t = g.world.get(wx, wy);
      const biomeId = t.biome ?? 0;
      if (biomeId > 0 && !g.discovered.has(biomeId)) {
        ctx.fillRect(px + mx, py + my, step, step);
      }
    }
  }

  // rota até a escada mais próxima conhecida
  const target = nearestKnownStair(g);
  if (target) {
    const pxm = mx + (g.player.pos.x / TILE / sz) * mapSize;
    const pym = my + (g.player.pos.y / TILE / sz) * mapSize;
    const txm = mx + (target.x / TILE / sz) * mapSize;
    const tym = my + (target.y / TILE / sz) * mapSize;
    ctx.save();
    ctx.strokeStyle = "rgba(240, 208, 64, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -((g.time * 20) % 8);
    ctx.beginPath();
    ctx.moveTo(pxm, pym);
    ctx.lineTo(txm, tym);
    ctx.stroke();
    ctx.restore();
  }

  // cidades
  for (const c of g.world.cities) {
    const cx = mx + (c.x / TILE / sz) * mapSize;
    const cy = my + (c.y / TILE / sz) * mapSize;
    const known = g.discovered.has(c.biome);
    drawCityIcon(ctx, cx, cy, known);
    if (known) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.name, cx + 1, cy - 6);
      ctx.fillStyle = "#f0e0a0";
      ctx.fillText(c.name, cx, cy - 7);
    }
  }

  // escadas
  const pulse = 0.5 + Math.sin(g.time * 4) * 0.5;
  for (const s of g.world.stairs) {
    if (!g.discovered.has(s.biome)) continue;
    const cx = mx + (s.x / TILE / sz) * mapSize;
    const cy = my + (s.y / TILE / sz) * mapSize;
    drawStairIcon(ctx, cx, cy, pulse);
  }

  // jogador — halo + marcador
  const pxm = mx + (g.player.pos.x / TILE / sz) * mapSize;
  const pym = my + (g.player.pos.y / TILE / sz) * mapSize;
  ctx.save();
  ctx.globalAlpha = 0.35 + pulse * 0.3;
  ctx.fillStyle = "#00ff90";
  ctx.beginPath();
  ctx.arc(pxm, pym, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#00ff90";
  ctx.beginPath();
  ctx.arc(pxm, pym, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.restore(); // fim do clip

  // bússola + escala no canto inferior direito do mapa
  drawCompass(ctx, mx + mapSize - 22, my + mapSize - 22, 16);
  drawScaleBar(ctx, mx + 8, my + mapSize - 14, 90, g.world.size);

  // coordenadas do jogador (canto sup. esq. do mapa)
  ctx.textAlign = "left";
  ctx.font = "10px monospace";
  ctx.fillStyle = "#f0e0a0";
  const pt = g.world.get(
    Math.floor(g.player.pos.x / TILE),
    Math.floor(g.player.pos.y / TILE),
  );
  const bHere = BIOMES.find((bb) => bb.id === pt.biome);
  ctx.fillText(
    `POS  X:${Math.floor(g.player.pos.x / TILE)}  Y:${Math.floor(g.player.pos.y / TILE)}`,
    mx + 8,
    my + 14,
  );
  if (bHere && g.discovered.has(bHere.id)) {
    ctx.fillStyle = bHere.color;
    ctx.fillRect(mx + 8, my + 22, 8, 8);
    ctx.fillStyle = "#f0e0a0";
    ctx.fillText(bHere.name, mx + 22, my + 29);
  }

  // ------------------- LEGENDA LATERAL (desktop) -------------------
  if (!isNarrow) {
    const lx = mx + mapSize + 20;
    const ly = my - 4;
    const lw = sideW;
    const lh = mapSize + 12;

    // painel
    ctx.fillStyle = "rgba(15,10,5,0.9)";
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = "#8a6a30";
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, lw, lh);

    const discovered = BIOMES.filter((b) => g.discovered.has(b.id)).length;
    ctx.fillStyle = "#f0e0a0";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Biomas descobertos`, lx + 10, ly + 18);
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#f0c040";
    ctx.fillText(`${discovered} / ${BIOMES.length}`, lx + 10, ly + 40);

    // barra de progresso
    const pw = lw - 20;
    ctx.fillStyle = "#2a1f10";
    ctx.fillRect(lx + 10, ly + 48, pw, 5);
    ctx.fillStyle = "#f0c040";
    ctx.fillRect(lx + 10, ly + 48, (pw * discovered) / BIOMES.length, 5);

    // lista scroll-livre limitada às primeiras N que couberem
    ctx.font = "10px monospace";
    const rowH = 13;
    const listTop = ly + 68;
    const maxRows = Math.floor((lh - 76) / rowH);
    const list = BIOMES.slice(0, maxRows);
    list.forEach((b, i) => {
      const row = listTop + i * rowH;
      const known = g.discovered.has(b.id);
      // cor
      ctx.fillStyle = b.color;
      ctx.fillRect(lx + 10, row - 8, 9, 9);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(lx + 10, row - 8, 9, 9);
      // nome
      ctx.fillStyle = known ? "#f0e0a0" : "#5a5040";
      ctx.textAlign = "left";
      const name = known ? b.name : "???";
      const trimmed = name.length > 20 ? name.slice(0, 19) + "…" : name;
      ctx.fillText(`${String(b.id).padStart(2, "0")} ${trimmed}`, lx + 24, row);
      // perigo (numérico + colorido)
      const danger = b.danger;
      const dc =
        danger <= 5 ? "#5aa85a" :
        danger <= 12 ? "#e0c060" :
        danger <= 20 ? "#e08040" : "#e04040";
      ctx.textAlign = "right";
      ctx.fillStyle = known ? dc : "#3a3428";
      ctx.fillText(`Lv ${danger}`, lx + lw - 10, row);
    });

    if (BIOMES.length > maxRows) {
      ctx.fillStyle = "#a8946a";
      ctx.textAlign = "center";
      ctx.font = "9px monospace";
      ctx.fillText(`+${BIOMES.length - maxRows} biomas além do horizonte…`, lx + lw / 2, ly + lh - 10);
    }
  }
}

// -------------------------------------------------------------------------
// Vein / Skeleton / Mining panel / Crafting panel
// -------------------------------------------------------------------------

type VeinLike = {
  pos: { x: number; y: number };
  ore: keyof typeof ORES;
  kind: string;
  hp: number;
  maxHp: number;
  hitFlash: number;
};

function drawVein(
  ctx: CanvasRenderingContext2D,
  v: VeinLike,
  sx: number,
  sy: number,
  time: number,
) {
  const meta = ORES[v.ore];
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 14, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // base rock
  const rockCol = "#3a3a44";
  ctx.fillStyle = rockCol;
  ctx.fillRect(sx - 12, sy - 10, 24, 20);
  ctx.fillStyle = shade(rockCol, 12);
  ctx.fillRect(sx - 12, sy - 10, 24, 2);
  ctx.fillStyle = shade(rockCol, -18);
  ctx.fillRect(sx - 12, sy + 8, 24, 2);
  // ore crystals
  const flash = v.hitFlash > 0 ? "#fff" : meta.color;
  ctx.fillStyle = flash;
  ctx.beginPath();
  ctx.moveTo(sx - 6, sy + 6);
  ctx.lineTo(sx - 8, sy - 2);
  ctx.lineTo(sx - 4, sy - 6);
  ctx.lineTo(sx + 0, sy - 2);
  ctx.lineTo(sx - 2, sy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx + 3, sy + 6);
  ctx.lineTo(sx + 2, sy - 4);
  ctx.lineTo(sx + 6, sy - 8);
  ctx.lineTo(sx + 9, sy - 3);
  ctx.lineTo(sx + 8, sy + 6);
  ctx.closePath();
  ctx.fill();
  // sparkle
  const twk = 0.5 + Math.sin(time * 4 + sx * 0.1) * 0.5;
  ctx.fillStyle = `rgba(255,255,255,${0.4 + twk * 0.4})`;
  ctx.fillRect(sx - 5, sy - 4, 1.5, 1.5);
  ctx.fillRect(sx + 5, sy - 5, 1.5, 1.5);
  // kind ornaments
  if (v.kind === "runner") {
    ctx.strokeStyle = "#80ffe0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx, sy, 16 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (v.kind === "exploder") {
    ctx.fillStyle = "#ff8040";
    ctx.beginPath();
    ctx.arc(sx, sy - 12, 2 + Math.sin(time * 6) * 1, 0, Math.PI * 2);
    ctx.fill();
  } else if (v.kind === "teleporter") {
    ctx.strokeStyle = "#a080ff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const rr = 8 + i * 4 + Math.sin(time * 3 + i) * 2;
      ctx.beginPath();
      ctx.arc(sx, sy, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (v.kind === "summoner") {
    ctx.fillStyle = "#ff4060";
    ctx.beginPath();
    ctx.arc(sx - 6, sy - 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + 6, sy - 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // HP bar
  if (v.hp < v.maxHp) {
    const bw = 22;
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(sx - bw / 2 - 1, sy - 16, bw + 2, 4);
    ctx.fillStyle = meta.color;
    ctx.fillRect(sx - bw / 2, sy - 15, (bw * v.hp) / v.maxHp, 2);
  }
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  time: number,
  hpRatio: number,
) {
  const bob = Math.sin(time * 6) * 0.6;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  ctx.fillStyle = "#e8e0c8";
  ctx.fillRect(sx - 4, sy - 4 + bob, 8, 10);
  // ribs
  ctx.fillStyle = "#a89880";
  ctx.fillRect(sx - 4, sy - 2 + bob, 8, 1);
  ctx.fillRect(sx - 4, sy + 1 + bob, 8, 1);
  // skull
  ctx.fillStyle = "#f0e8d0";
  ctx.beginPath();
  ctx.arc(sx, sy - 8 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  // eyes glow (necromancer purple)
  ctx.fillStyle = "#c060ff";
  ctx.fillRect(sx - 2.5, sy - 9 + bob, 1.5, 1.5);
  ctx.fillRect(sx + 1, sy - 9 + bob, 1.5, 1.5);
  // legs
  ctx.fillStyle = "#e8e0c8";
  ctx.fillRect(sx - 3, sy + 6 + bob, 2, 6);
  ctx.fillRect(sx + 1, sy + 6 + bob, 2, 6);
  // arm bone/sword
  ctx.strokeStyle = "#c8c0a8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy + bob);
  ctx.lineTo(sx + 12, sy - 4 + bob);
  ctx.stroke();
  // hp bar
  if (hpRatio < 1) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(sx - 8, sy - 18, 16, 3);
    ctx.fillStyle = "#a060ff";
    ctx.fillRect(sx - 8, sy - 18, 16 * hpRatio, 3);
  }
}

// ---- Mining panel ----
function drawMining(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const bw = 640,
    bh = 460;
  const x = w / 2 - bw / 2,
    y = h / 2 - bh / 2;
  drawPixelFrame(ctx, x, y, bw, bh);
  drawTabs(ctx, g, x + 8, y + 8, bw - 16, "mining");
  const p = g.player;
  const stats = miningStats(p.miningLevel);

  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    `Mineração  Nv ${p.miningLevel}  (${p.miningXp}/${p.miningXpNext} XP)`,
    x + 20,
    y + 66,
  );
  const pick = p.equipped.pickaxe;
  ctx.font = "11px monospace";
  ctx.fillStyle = "#e8d8a8";
  ctx.fillText(`Picareta: ${pick?.name ?? "(sem)"}   +${pick?.power ?? 0} poder`, x + 20, y + 84);
  ctx.fillStyle = "#c8a878";
  ctx.font = "10px monospace";
  ctx.fillText(
    `Velocidade ${(stats.speed * 100) | 0}%  •  Crítico ${(stats.crit * 100) | 0}%  •  Duplo ${(stats.doubleChance * 100) | 0}%  •  Triplo ${(stats.tripleChance * 100) | 0}%  •  Gema ${(stats.gemChance * 100) | 0}%`,
    x + 20,
    y + 100,
  );

  // Pickaxe upgrade list
  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 12px monospace";
  ctx.fillText("PICARETAS (por nível de mineração)", x + 20, y + 128);
  const rows = PICKAXE_TIERS;
  const rowH = 22;
  const listX = x + 20,
    listY = y + 138;
  const hits: Array<{ tier: number; rect: [number, number, number, number] }> = [];
  rows.forEach((r, i) => {
    const ry = listY + i * rowH;
    const unlocked = p.miningLevel >= r.miningLevel;
    const equipped = pick?.pickaxeTier === r.tier;
    ctx.fillStyle = equipped ? "#3a5a2a" : unlocked ? "#1a1408" : "#0f0906";
    ctx.fillRect(listX, ry, 300, rowH - 2);
    ctx.strokeStyle = "#3a2410";
    ctx.strokeRect(listX + 0.5, ry + 0.5, 300, rowH - 3);
    ctx.fillStyle = r.color;
    ctx.font = "bold 11px monospace";
    ctx.fillText(`⛏ ${r.name}`, listX + 8, ry + 15);
    ctx.fillStyle = unlocked ? "#e8d8a8" : "#6a5a3a";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Nv ${r.miningLevel}+  +${r.power}`, listX + 292, ry + 15);
    ctx.textAlign = "left";
    if (unlocked && !equipped) hits.push({ tier: r.tier, rect: [listX, ry, 300, rowH - 2] });
  });

  // Materials owned
  const matsX = x + 340;
  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 12px monospace";
  ctx.fillText("MATERIAIS", matsX, y + 128);
  const owned = Object.entries(p.materials).filter(([, n]) => n > 0);
  ctx.font = "10px monospace";
  owned.slice(0, 16).forEach(([ore, n], i) => {
    const meta = ORES[ore as keyof typeof ORES];
    const oy = y + 142 + i * 15;
    if (meta) {
      ctx.fillStyle = meta.color;
      ctx.fillRect(matsX, oy - 8, 6, 8);
      ctx.fillStyle = "#e8d8a8";
      ctx.fillText(`${meta.name}`, matsX + 12, oy);
    } else {
      ctx.fillStyle = "#e8d8a8";
      ctx.fillText(ore, matsX + 12, oy);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.fillText(String(n), matsX + 268, oy);
    ctx.textAlign = "left";
  });
  if (owned.length === 0) {
    ctx.fillStyle = "#6a5a3a";
    ctx.fillText("(nenhum — minere veios no mapa)", matsX, y + 148);
  }

  ctx.fillStyle = "#c8a878";
  ctx.font = "9px monospace";
  ctx.fillText("clique numa picareta liberada para equipar  •  N fecha", x + 16, y + bh - 12);

  (g as unknown as { _mineGrid?: typeof hits })._mineGrid = hits;
}

// ---- Crafting panel ----
function drawCrafting(ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) {
  const bw = 720,
    bh = 480;
  const x = w / 2 - bw / 2,
    y = h / 2 - bh / 2;
  drawPixelFrame(ctx, x, y, bw, bh);
  drawTabs(ctx, g, x + 8, y + 8, bw - 16, "crafting");
  const p = g.player;

  // Profession tabs
  const profs = PROFESSION_LIST;
  const pw = Math.floor((bw - 40) / profs.length);
  const profHits: Array<{ id: string; rect: [number, number, number, number] }> = [];
  profs.forEach((pr, i) => {
    const px = x + 20 + i * pw;
    const active = g.craftingTab === pr;
    ctx.fillStyle = active ? "#f0c040" : "#2a1c10";
    ctx.fillRect(px, y + 54, pw - 2, 24);
    ctx.fillStyle = active ? "#1a0a04" : "#c8a878";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lvl = p.professions[pr].level;
    ctx.fillText(`${PROFESSION_NAME[pr]} ${lvl}`, px + pw / 2, y + 66);
    profHits.push({ id: pr, rect: [px, y + 54, pw - 2, 24] });
  });
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const activeProf = g.craftingTab as (typeof profs)[number];
  const profState = p.professions[activeProf];
  ctx.fillStyle = "#e8d8a8";
  ctx.font = "10px monospace";
  ctx.fillText(
    `Bancada: ${BENCH_NAME[PROFESSION_BENCH[activeProf]]}  •  XP ${profState.xp}/${profState.xpNext}`,
    x + 20,
    y + 96,
  );

  // Recipe list
  const recs = RECIPES.filter(
    (r) => r.profession === activeProf && (!r.hidden || p.recipesKnown.has(r.id)),
  );
  const rowH = 30;
  const listX = x + 20,
    listY = y + 110;
  const rowW = bw - 40;
  const hits: Array<{ id: string; rect: [number, number, number, number] }> = [];
  recs.slice(0, 11).forEach((r, i) => {
    const ry = listY + i * rowH;
    const chk = canCraftRecipe(g, r.id);
    const ok = chk.ok;
    ctx.fillStyle = ok ? "#1a2a12" : "#1a1408";
    ctx.fillRect(listX, ry, rowW, rowH - 3);
    ctx.strokeStyle = "#3a2410";
    ctx.strokeRect(listX + 0.5, ry + 0.5, rowW - 1, rowH - 4);
    ctx.fillStyle = ok ? "#a0f090" : "#e8d8a8";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${r.secret ? "✦ " : ""}${r.name}`, listX + 8, ry + 13);
    ctx.fillStyle = "#c8a878";
    ctx.font = "10px monospace";
    const matsStr = Object.entries(r.materials)
      .map(([o, n]) => {
        const have = p.materials[o] ?? 0;
        const meta = ORES[o as keyof typeof ORES];
        return `${meta?.name ?? o} ${have}/${n}`;
      })
      .join("  •  ");
    ctx.fillText(`Nv ${r.minLevel}+   ${matsStr}`, listX + 8, ry + 24);
    // craft button
    const bx = listX + rowW - 84,
      by = ry + 4,
      bwB = 78,
      bhB = 20;
    ctx.fillStyle = "#0a0604";
    ctx.fillRect(bx - 1, by - 1, bwB + 2, bhB + 2);
    ctx.fillStyle = ok ? "#3a8a3a" : "#3a2410";
    ctx.fillRect(bx, by, bwB, bhB);
    ctx.fillStyle = ok ? "#fff" : "#8a6438";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ok ? "FABRICAR" : (chk.reason ?? "—"), bx + bwB / 2, by + bhB / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    if (ok) hits.push({ id: r.id, rect: [bx, by, bwB, bhB] });
  });

  ctx.fillStyle = "#c8a878";
  ctx.font = "9px monospace";
  ctx.fillText(
    "clique num profissão para trocar  •  FABRICAR para produzir  •  B fecha",
    x + 16,
    y + bh - 12,
  );

  (g as unknown as { _craftHits?: typeof hits; _craftProfs?: typeof profHits })._craftHits = hits;
  (g as unknown as { _craftHits?: typeof hits; _craftProfs?: typeof profHits })._craftProfs =
    profHits;
}
