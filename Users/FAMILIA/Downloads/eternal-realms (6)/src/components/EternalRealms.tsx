import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  newGame,
  update,
  save,
  load,
  hasSave,
  wipeSave,
  logMsg,
  useInventoryItem,
  allocAttr,
  allocTalent,
  respecTalents,
  enterBossRush,
  exitBossRush,
  craftBoatAction,
  sailToNewIsland,
  getIslandDetails,
  sailToTargetIsland,
  type GameState,
} from "@/game/game";
import { render, drawPlayer } from "@/game/render";
import { craft } from "@/game/crafting";
import { makePickaxe, PICKAXE_TIERS } from "@/game/mining";
import {
  triggerDivineAscension,
  castUltimateSkill,
  feedActivePet,
  triggerWorldBoss,
  triggerDimensionalRift,
  claimRiftReward,
  MERCENARY_CATALOG,
  buyAscensionPerk,
  synthesizeHybridPet,
  buyPetEgg,
} from "@/game/ambitiousFeatures";
import { PROFESSION_LIST, CLASS_SKINS, BIOMES, type PlayerClass } from "@/game/engine";
import { CLASS_TALENTS, nodePrereqMet } from "@/game/talents";
import dragonBg from "@/assets/menu-bg.jpg";
import RucoySideBar from "./rucoy/RucoySideBar";
import TrophyNotification from "./rucoy/TrophyNotification";
import { setActiveGame } from "@/game/host";
import { setOverlayState, useOverlayState } from "@/rucoy/store";
import ClassSelectScreen from "./ClassSelectScreen";

type Cls = PlayerClass;

function MenuBackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      vy: number;
      vx: number;
      alpha: number;
      color: string;
    }
    const list: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h + h,
      size: 0.6 + Math.random() * 3.2,
      vy: -0.4 - Math.random() * 1.6,
      vx: -0.4 + Math.random() * 0.8,
      alpha: 0.25 + Math.random() * 0.75,
      color: Math.random() > 0.75 ? "#fff2c0" : Math.random() > 0.4 ? "#ffb040" : "#ff6a1a",
    }));

    let anim = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of list) {
        p.y += p.vy;
        p.x += p.vx + Math.sin((p.y + p.x) * 0.005) * 0.3;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.4, p.color + "80");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      anim = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(anim);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

function PlayerSelectPreview({ cls, skin }: { cls: string; skin: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let anim = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 10;
      const time = frame / 60;

      // Draw beautiful magic circle rotating on the ground
      ctx.save();
      ctx.translate(cx, cy + 18);
      ctx.scale(2.2, 0.7);
      ctx.strokeStyle = "rgba(240, 176, 64, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(time * 0.6);
      ctx.strokeStyle = "rgba(240, 192, 64, 0.6)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Create mock player object
      const mockPlayer = {
        cls: cls as any,
        skin: skin,
        hitFlash: 0,
        facing: { x: 0, y: 1 },
        equipped: {
          weapon: { power: 10 },
          armor: { power: 5 },
        },
        inventory: [],
      };

      drawPlayer(ctx, mockPlayer as any, cx, cy, time);

      frame++;
      anim = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(anim);
    };
  }, [cls, skin]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 bg-neutral-950/95 border-2 border-amber-500/50 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(240,176,64,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,176,64,0.08)_0%,transparent_70%)] pointer-events-none" />
        <canvas
          ref={canvasRef}
          width={128}
          height={128}
          style={{ imageRendering: "pixelated", width: 128, height: 128 }}
        />
      </div>
    </div>
  );
}

export default function EternalRealms() {
  const state = useOverlayState();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const inputRef = useRef({
    keys: new Set<string>(),
    mouse: { x: 0, y: 0, down: false, downOnce: false },
  });
  // Mobile joystick state
  const moveJoyRef = useRef<{ active: boolean; cx: number; cy: number; dx: number; dy: number }>({
    active: false,
    cx: 0,
    cy: 0,
    dx: 0,
    dy: 0,
  });
  const aimJoyRef = useRef<{ active: boolean; cx: number; cy: number; dx: number; dy: number }>({
    active: false,
    cx: 0,
    cy: 0,
    dx: 0,
    dy: 0,
  });
  const [menu, setMenu] = useState<"main" | "class" | "playing">("main");
  const [selectedSubClass, setSelectedSubClass] = useState<string>("");
  const [ascensionLvl, setAscensionLvl] = useState<number>(1);
  const [isWorldLoading, setIsWorldLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedClass, setSelectedClass] = useState<Cls>("melee");
  const [selectedSkin, setSelectedSkin] = useState<number>(0);
  const [savedExists, setSavedExists] = useState(false);
  const [activeBiomeId, setActiveBiomeId] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeBiomeName, setActiveBiomeName] = useState<string>("Planícies de Aurora");
  const [isMobile, setIsMobile] = useState(false);
  const [autoFireUi, setAutoFireUi] = useState(true);
  const [showTalents, setShowTalents] = useState(false);
  const [showAmbitious, setShowAmbitious] = useState(false);
  // Force re-render tick to update HUD values (arena wave, talent points, etc.)
  const [, forceHudTick] = useState(0);
  useEffect(() => {
    if (menu !== "playing") return;
    const id = window.setInterval(() => forceHudTick((n) => (n + 1) & 0xffff), 300);
    return () => window.clearInterval(id);
  }, [menu]);

  useEffect(() => {
    setSavedExists(hasSave());
  }, [menu]);

  useEffect(() => {
    if (!state.isSailingLoading || state.sailingTargetIsland === undefined || state.sailingTargetIsland === null) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4; // Reaches 100% in 2.5 seconds
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Execute actual teleport
        const targetId = state.sailingTargetIsland!;
        const gInstance = stateRef.current;
        if (gInstance) {
          sailToTargetIsland(gInstance, targetId);
        }
        
        // Clear loading state after a slight delay for a smooth transition
        setTimeout(() => {
          setOverlayState({
            isSailingLoading: false,
            sailingLoadingProgress: 0,
            sailingTargetIsland: null,
          });
        }, 500);
      }
      
      setOverlayState({
        sailingLoadingProgress: progress
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.isSailingLoading, state.sailingTargetIsland]);
  useEffect(() => {
    setIsMobile(
      typeof window !== "undefined" &&
        (window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 900),
    );
  }, [menu]);

  useEffect(() => {
    if (menu !== "playing") return;
    // Expose the running GameState to React modals (Runes / Attributes /
    // Talents) that live outside the canvas RAF loop.
    setActiveGame(stateRef.current);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const openPanel = (which: GameState["panel"]) => {
      const g = stateRef.current!;
      g.panel = g.panel === which ? "none" : which;
    };

    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      inputRef.current.keys.add(k);
      const g = stateRef.current!;
      if (k === "i") {
        openPanel("inventory");
        e.preventDefault();
      } else if (k === "c") {
        openPanel("stats");
        e.preventDefault();
      } else if (k === "v") {
        openPanel("achievements");
        e.preventDefault();
      } else if (k === "h") {
        openPanel("help");
        e.preventDefault();
      } else if (k === "m") {
        openPanel("map");
        e.preventDefault();
      } else if (k === "b") {
        openPanel("crafting");
        e.preventDefault();
      } else if (k === "n") {
        openPanel("mining");
        e.preventDefault();
      } else if (k === "j") {
        openPanel("ferreiro");
        e.preventDefault();
      } else if (k === "g") {
        openPanel("bestiario");
        e.preventDefault();
      } else if (k === "e" || k === "f") {
        // E ou F — interação com NPCs / Mercador. game.ts consome esta flag no tick.
        (g as unknown as { _ePressed?: boolean })._ePressed = true;
        e.preventDefault();
      } else if (k === "r") {
        castUltimateSkill(g);
        e.preventDefault();
      } else if (k === "p") {
        g.paused = !g.paused;
        e.preventDefault();
      } else if (k === "t") {
        setShowTalents((v) => !v);
        e.preventDefault();
      } else if (k === "y") {
        setShowAmbitious((v) => !v);
        e.preventDefault();
      } else if (k === "[" || k === "-") {
        const oldZoom = g.zoom || 1.0;
        const newZoom = Math.max(0.6, oldZoom - 0.1);
        g.zoom = Number(newZoom.toFixed(2));
        setZoom(g.zoom);
        e.preventDefault();
      } else if (k === "]" || k === "=" || k === "+") {
        const oldZoom = g.zoom || 1.0;
        const newZoom = Math.min(2.5, oldZoom + 0.1);
        g.zoom = Number(newZoom.toFixed(2));
        setZoom(g.zoom);
        e.preventDefault();
      } else if (k === "escape") {
        g.panel = "none";
        setShowTalents(false);
        setShowAmbitious(false);
      } else if (e.key === "F5") {
        save(g);
        logMsg(g, "Jogo salvo.", "#5ea8ff");
        e.preventDefault();
      } else if (e.key === "F9") {
        const ng = load();
        if (ng) {
          stateRef.current = ng;
          logMsg(ng, "Jogo carregado.", "#5ea8ff");
        }
        e.preventDefault();
      } else if (e.key === "F10") {
        wipeSave();
        logMsg(g, "Save apagado.", "#ff8060");
        e.preventDefault();
      } else if (e.key === "F6") {
        craftBoatAction(g);
        e.preventDefault();
      } else if (e.key === "F7") {
        sailToNewIsland(g);
        e.preventDefault();
      }
    };
    const ku = (e: KeyboardEvent) => inputRef.current.keys.delete(e.key.toLowerCase());
    const mm = (e: MouseEvent) => {
      inputRef.current.mouse.x = e.clientX;
      inputRef.current.mouse.y = e.clientY;

      const g = stateRef.current!;
      if (g && g.panel === "map" && (g as any)._mapDragging) {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const lastX = (g as any)._mapDragLastX;
        const lastY = (g as any)._mapDragLastY;
        if (lastX !== undefined && lastY !== undefined) {
          const dx = cx - lastX;
          const dy = cy - lastY;
          const mapRect = (g as any)._mapRect;
          const zoom = (g as any).mapZoom || 1.0;
          if (mapRect && zoom > 1.0) {
            const sz = g.world.size;
            const deltaTilesX = dx / ((mapRect.size / sz) * zoom);
            const deltaTilesY = dy / ((mapRect.size / sz) * zoom);
            (g as any).mapCenterX = ((g as any).mapCenterX ?? g.player.pos.x / 32) - deltaTilesX;
            (g as any).mapCenterY = ((g as any).mapCenterY ?? g.player.pos.y / 32) - deltaTilesY;
          }
        }
        (g as any)._mapDragLastX = cx;
        (g as any)._mapDragLastY = cy;
      }
    };

    const hitRect = (cx: number, cy: number, r: [number, number, number, number]) =>
      cx >= r[0] && cx <= r[0] + r[2] && cy >= r[1] && cy <= r[1] + r[3];

    const handleClick = (cx: number, cy: number): boolean => {
      const g = stateRef.current!;
      if (g.panel === "none") return false;
      // Tab bar (present on every open panel)
      const tabs = (
        g as unknown as {
          _tabs?: Array<{ id: GameState["panel"]; rect: [number, number, number, number] }>;
        }
      )._tabs;
      if (tabs)
        for (const t of tabs)
          if (hitRect(cx, cy, t.rect)) {
            g.panel = t.id;
            return true;
          }
      if (g.panel === "inventory") {
        const grid = (
          g as unknown as { _invGrid?: { x: number; y: number; cellW: number; cellH: number } }
        )._invGrid;
        if (grid) {
          const col = Math.floor((cx - grid.x) / grid.cellW);
          const row = Math.floor((cy - grid.y) / grid.cellH);
          if (col >= 0 && col < 8 && row >= 0 && row < 4) {
            useInventoryItem(g, row * 8 + col);
            return true;
          }
        }
      } else if (g.panel === "stats") {
        const grid = (
          g as unknown as {
            _statsGrid?: {
              rows: Array<{
                k: "str" | "agi" | "int" | "vit";
                rect: [number, number, number, number];
              }>;
            };
          }
        )._statsGrid;
        if (grid)
          for (const r of grid.rows)
            if (hitRect(cx, cy, r.rect)) {
              allocAttr(g, r.k);
              return true;
            }
        const skinGrid = (
          g as unknown as {
            _skinGrid?: {
              prev: [number, number, number, number];
              next: [number, number, number, number];
            };
          }
        )._skinGrid;
        if (skinGrid) {
          if (hitRect(cx, cy, skinGrid.prev)) {
            g.player.skin = (g.player.skin + 4) % 5;
            return true;
          }
          if (hitRect(cx, cy, skinGrid.next)) {
            g.player.skin = (g.player.skin + 1) % 5;
            return true;
          }
        }
      } else if (g.panel === "mining") {
        const grid = (
          g as unknown as {
            _mineGrid?: Array<{ tier: number; rect: [number, number, number, number] }>;
          }
        )._mineGrid;
        if (grid)
          for (const r of grid)
            if (hitRect(cx, cy, r.rect)) {
              const cur = g.player.equipped.pickaxe;
              g.player.equipped.pickaxe = makePickaxe(r.tier);
              if (cur) g.player.inventory.push(cur);
              const t = PICKAXE_TIERS.find((p) => p.tier === r.tier);
              if (t) logMsg(g, `Equipou ${t.name}.`, "#8fcfff");
              return true;
            }
      } else if (g.panel === "crafting") {
        const profs = (
          g as unknown as {
            _craftProfs?: Array<{ id: string; rect: [number, number, number, number] }>;
          }
        )._craftProfs;
        if (profs)
          for (const r of profs)
            if (hitRect(cx, cy, r.rect)) {
              g.craftingTab = r.id;
              return true;
            }
        const recs = (
          g as unknown as {
            _craftHits?: Array<{ id: string; rect: [number, number, number, number] }>;
          }
        )._craftHits;
        if (recs)
          for (const r of recs)
            if (hitRect(cx, cy, r.rect)) {
              craft(g, r.id, (m, c) => logMsg(g, m, c ?? "#fff"));
              return true;
            }
      } else if (g.panel === "ferreiro") {
        const fh = (
          g as unknown as {
            _ferreiroHits?: Array<{ slot: string; rect: [number, number, number, number] }>;
          }
        )._ferreiroHits;
        if (fh)
          for (const r of fh)
            if (hitRect(cx, cy, r.rect)) {
              if (r.slot === "weapon" || r.slot === "armor") {
                import("@/game/orbs").then((m) => {
                  const res = m.upgradeItemQuality(g, r.slot as "weapon" | "armor");
                  logMsg(g, res.msg, res.color);
                });
              } else if (r.slot === "boat") {
                import("@/game/game").then((m) => m.craftBoatAction(g));
              } else if (r.slot === "up_oxygen") {
                const cost = g.player.divingGearLevel.oxygen * 10;
                if ((g.player.ancientRelics || 0) >= cost) {
                  g.player.ancientRelics -= cost;
                  g.player.divingGearLevel.oxygen++;
                  g.player.maxOxygen = 100 + (g.player.divingGearLevel.oxygen - 1) * 50;
                  g.player.oxygen = g.player.maxOxygen;
                  logMsg(
                    g,
                    `💥 Tanque de Oxigênio aprimorado para Nível ${g.player.divingGearLevel.oxygen}!`,
                    "#60a5fa",
                  );
                  g.floaters.push({
                    x: g.player.pos.x,
                    y: g.player.pos.y - 20,
                    text: "🫧 O2 TANK UP!",
                    color: "#60a5fa",
                    life: 1.5,
                    vy: -30,
                  });
                } else {
                  logMsg(
                    g,
                    `Relíquias insuficientes. Custo: ${cost} (você tem ${g.player.ancientRelics || 0}).`,
                    "#ff8060",
                  );
                }
              } else if (r.slot === "up_pressure") {
                const cost = g.player.divingGearLevel.pressure * 10;
                if ((g.player.ancientRelics || 0) >= cost) {
                  g.player.ancientRelics -= cost;
                  g.player.divingGearLevel.pressure++;
                  logMsg(
                    g,
                    `💥 Regulador de Pressão aprimorado para Nível ${g.player.divingGearLevel.pressure}!`,
                    "#c060ff",
                  );
                  g.floaters.push({
                    x: g.player.pos.x,
                    y: g.player.pos.y - 20,
                    text: "💥 PRESSÃO UP!",
                    color: "#c060ff",
                    life: 1.5,
                    vy: -30,
                  });
                } else {
                  logMsg(
                    g,
                    `Relíquias insuficientes. Custo: ${cost} (você tem ${g.player.ancientRelics || 0}).`,
                    "#ff8060",
                  );
                }
              } else if (r.slot === "up_fins") {
                const cost = g.player.divingGearLevel.fins * 10;
                if ((g.player.ancientRelics || 0) >= cost) {
                  g.player.ancientRelics -= cost;
                  g.player.divingGearLevel.fins++;
                  logMsg(
                    g,
                    `💥 Nadadeiras aprimoradas para Nível ${g.player.divingGearLevel.fins}!`,
                    "#ffd060",
                  );
                  g.floaters.push({
                    x: g.player.pos.x,
                    y: g.player.pos.y - 20,
                    text: "🏊 NADADEIRAS UP!",
                    color: "#ffd060",
                    life: 1.5,
                    vy: -30,
                  });
                } else {
                  logMsg(
                    g,
                    `Relíquias insuficientes. Custo: ${cost} (você tem ${g.player.ancientRelics || 0}).`,
                    "#ff8060",
                  );
                }
              }
              return true;
            }
      } else if (g.panel === "bestiario") {
        const hits = (g as any)._bestiaryHits;
        if (hits) {
          for (const h of hits) {
            if (hitRect(cx, cy, h.rect)) {
              (g as any)._selectedBestiaryMonster = h.name;
              return true;
            }
          }
        }
      } else if (g.panel === "achievements") {
        const hits = g._achPageHits;
        if (hits) {
          if (hitRect(cx, cy, hits.prev)) {
            g._achPage = Math.max(1, (g._achPage || 1) - 1);
            return true;
          }
          if (hitRect(cx, cy, hits.next)) {
            g._achPage = Math.min(5, (g._achPage || 1) + 1);
            return true;
          }
        }
      } else if (g.panel === "map") {
        const hits = (g as any)._mapZoomHits;
        if (hits) {
          if (hitRect(cx, cy, hits.zoomIn)) {
            const oldZoom = (g as any).mapZoom || 1.0;
            const newZoom = Math.min(5.0, oldZoom + 0.5);
            (g as any).mapZoom = newZoom;
            if (newZoom === 1.0) {
              (g as any).mapCenterX = g.player.pos.x / 32;
              (g as any).mapCenterY = g.player.pos.y / 32;
            }
            return true;
          }
          if (hitRect(cx, cy, hits.zoomOut)) {
            const oldZoom = (g as any).mapZoom || 1.0;
            const newZoom = Math.max(1.0, oldZoom - 0.5);
            (g as any).mapZoom = newZoom;
            if (newZoom === 1.0) {
              (g as any).mapCenterX = g.player.pos.x / 32;
              (g as any).mapCenterY = g.player.pos.y / 32;
            }
            return true;
          }
        }
      }
      return false;
    };

    const md = (e: MouseEvent) => {
      inputRef.current.mouse.down = true;
      inputRef.current.mouse.downOnce = true;

      const g = stateRef.current!;
      if (g && g.panel === "map") {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        // Check if we hit zoom buttons first
        const hits = (g as any)._mapZoomHits;
        let hitButton = false;
        if (hits) {
          if (hitRect(cx, cy, hits.zoomIn) || hitRect(cx, cy, hits.zoomOut)) {
            hitButton = true;
          }
        }

        if (!hitButton) {
          const mapRect = (g as any)._mapRect;
          if (
            mapRect &&
            cx >= mapRect.x &&
            cx <= mapRect.x + mapRect.size &&
            cy >= mapRect.y &&
            cy <= mapRect.y + mapRect.size
          ) {
            (g as any)._mapDragging = true;
            (g as any)._mapDragLastX = cx;
            (g as any)._mapDragLastY = cy;
          }
        }
      }

      handleClick(e.clientX, e.clientY);
    };
    const mu = () => {
      inputRef.current.mouse.down = false;
      const g = stateRef.current!;
      if (g) {
        (g as any)._mapDragging = false;
      }
    };
    const handleWheel = (e: WheelEvent) => {
      const g = stateRef.current!;
      if (!g) return;
      if (g.panel === "map") {
        const mapRect = (g as any)._mapRect;
        if (mapRect) {
          const rect = canvas.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          if (
            mx >= mapRect.x &&
            mx <= mapRect.x + mapRect.size &&
            my >= mapRect.y &&
            my <= mapRect.y + mapRect.size
          ) {
            const sz = g.world.size;
            const zoomVal = (g as any).mapZoom || 1.0;
            const centerX = (g as any).mapCenterX ?? g.player.pos.x / 32;
            const centerY = (g as any).mapCenterY ?? g.player.pos.y / 32;

            const toWorldX = (sx: number) => {
              return (
                centerX + (sx - mapRect.x - mapRect.size / 2) / ((mapRect.size / sz) * zoomVal)
              );
            };
            const toWorldY = (sy: number) => {
              return (
                centerY + (sy - mapRect.y - mapRect.size / 2) / ((mapRect.size / sz) * zoomVal)
              );
            };

            const mouseWorldX = toWorldX(mx);
            const mouseWorldY = toWorldY(my);

            const oldZoom = zoomVal;
            let newZoom = oldZoom;
            if (e.deltaY < 0) {
              newZoom = Math.min(5.0, oldZoom + 0.5);
            } else {
              newZoom = Math.max(1.0, oldZoom - 0.5);
            }

            if (newZoom !== oldZoom) {
              (g as any).mapZoom = newZoom;
              if (newZoom > 1.0) {
                (g as any).mapCenterX =
                  mouseWorldX -
                  (mx - mapRect.x - mapRect.size / 2) / ((mapRect.size / sz) * newZoom);
                (g as any).mapCenterY =
                  mouseWorldY -
                  (my - mapRect.y - mapRect.size / 2) / ((mapRect.size / sz) * newZoom);
              } else {
                (g as any).mapCenterX = g.player.pos.x / 32;
                (g as any).mapCenterY = g.player.pos.y / 32;
              }
            }
            e.preventDefault();
          }
        }
      } else {
        // Main game world zoom
        e.preventDefault();
        const oldZoom = g.zoom || 1.0;
        let newZoom = oldZoom;
        if (e.deltaY < 0) {
          newZoom = Math.min(2.5, oldZoom + 0.1);
        } else {
          newZoom = Math.max(0.6, oldZoom - 0.1);
        }
        newZoom = Number(newZoom.toFixed(2));
        if (newZoom !== oldZoom) {
          g.zoom = newZoom;
          setZoom(newZoom);
        }
      }
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    canvas.addEventListener("mousemove", mm);
    canvas.addEventListener("mousedown", md);
    canvas.addEventListener("mouseup", mu);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Touch handling: 2 joysticks on left/right halves
    const activeTouch = { move: -1, aim: -1 };
    const onTouchStart = (e: TouchEvent) => {
      const g = stateRef.current!;
      for (const t of Array.from(e.changedTouches)) {
        if (g && g.panel === "map") {
          const rect = canvas.getBoundingClientRect();
          const cx = t.clientX - rect.left;
          const cy = t.clientY - rect.top;
          const mapRect = (g as any)._mapRect;
          if (
            mapRect &&
            cx >= mapRect.x &&
            cx <= mapRect.x + mapRect.size &&
            cy >= mapRect.y &&
            cy <= mapRect.y + mapRect.size
          ) {
            // Check buttons
            const hits = (g as any)._mapZoomHits;
            let hitButton = false;
            if (hits) {
              if (hitRect(cx, cy, hits.zoomIn) || hitRect(cx, cy, hits.zoomOut)) {
                hitButton = true;
              }
            }
            if (!hitButton) {
              (g as any)._mapDragging = true;
              (g as any)._mapDragLastX = cx;
              (g as any)._mapDragLastY = cy;
              (g as any)._mapTouchId = t.identifier;
              continue;
            }
          }
        }
        if (t.clientX < window.innerWidth / 2 && !moveJoyRef.current.active) {
          moveJoyRef.current = { active: true, cx: t.clientX, cy: t.clientY, dx: 0, dy: 0 };
          activeTouch.move = t.identifier;
        } else if (!aimJoyRef.current.active) {
          aimJoyRef.current = { active: true, cx: t.clientX, cy: t.clientY, dx: 0, dy: 0 };
          activeTouch.aim = t.identifier;
          // If panel is open, treat as click
          if (stateRef.current?.panel !== "none") handleClick(t.clientX, t.clientY);
        }
      }
      e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      const g = stateRef.current!;
      if (g && g.panel === "map" && (g as any)._mapDragging) {
        for (const t of Array.from(e.changedTouches)) {
          if (t.identifier === (g as any)._mapTouchId) {
            const rect = canvas.getBoundingClientRect();
            const cx = t.clientX - rect.left;
            const cy = t.clientY - rect.top;
            const lastX = (g as any)._mapDragLastX;
            const lastY = (g as any)._mapDragLastY;
            if (lastX !== undefined && lastY !== undefined) {
              const dx = cx - lastX;
              const dy = cy - lastY;
              const mapRect = (g as any)._mapRect;
              const zoom = (g as any).mapZoom || 1.0;
              if (mapRect && zoom > 1.0) {
                const sz = g.world.size;
                const deltaTilesX = dx / ((mapRect.size / sz) * zoom);
                const deltaTilesY = dy / ((mapRect.size / sz) * zoom);
                (g as any).mapCenterX =
                  ((g as any).mapCenterX ?? g.player.pos.x / 32) - deltaTilesX;
                (g as any).mapCenterY =
                  ((g as any).mapCenterY ?? g.player.pos.y / 32) - deltaTilesY;
              }
            }
            (g as any)._mapDragLastX = cx;
            (g as any)._mapDragLastY = cy;
          }
        }
      }
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === activeTouch.move) {
          const dx = t.clientX - moveJoyRef.current.cx;
          const dy = t.clientY - moveJoyRef.current.cy;
          const m = Math.min(50, Math.hypot(dx, dy));
          const nrm = Math.hypot(dx, dy) || 1;
          moveJoyRef.current.dx = (dx / nrm) * m;
          moveJoyRef.current.dy = (dy / nrm) * m;
        } else if (t.identifier === activeTouch.aim) {
          const dx = t.clientX - aimJoyRef.current.cx;
          const dy = t.clientY - aimJoyRef.current.cy;
          aimJoyRef.current.dx = dx;
          aimJoyRef.current.dy = dy;
        }
      }
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const g = stateRef.current!;
      for (const t of Array.from(e.changedTouches)) {
        if (g && (g as any)._mapTouchId === t.identifier) {
          (g as any)._mapDragging = false;
          (g as any)._mapTouchId = undefined;
        }
        if (t.identifier === activeTouch.move) {
          moveJoyRef.current.active = false;
          moveJoyRef.current.dx = 0;
          moveJoyRef.current.dy = 0;
          activeTouch.move = -1;
        }
        if (t.identifier === activeTouch.aim) {
          aimJoyRef.current.active = false;
          aimJoyRef.current.dx = 0;
          aimJoyRef.current.dy = 0;
          activeTouch.aim = -1;
        }
      }
      e.preventDefault();
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = stateRef.current!;
      // Inject virtual keys/mouse from joysticks
      const mj = moveJoyRef.current;
      const inp = inputRef.current;
      // Clear directional keys first
      inp.keys.delete("w");
      inp.keys.delete("a");
      inp.keys.delete("s");
      inp.keys.delete("d");
      if (mj.active) {
        if (mj.dy < -12) inp.keys.add("w");
        if (mj.dy > 12) inp.keys.add("s");
        if (mj.dx < -12) inp.keys.add("a");
        if (mj.dx > 12) inp.keys.add("d");
      }
      const aj = aimJoyRef.current;
      if (aj.active) {
        // Point mouse in aim-joystick direction relative to player center on screen
        inp.mouse.x = canvas.width / 2 + aj.dx;
        inp.mouse.y = canvas.height / 2 + aj.dy;
        if (Math.hypot(aj.dx, aj.dy) > 20) inp.mouse.down = true;
      } else if (autoFireUi) {
        inp.mouse.down = true;
      } else if (g.panel !== "none") {
        // don't auto-attack while panel open
        inp.mouse.down = false;
      }
      update(g, dt, inp, canvas.width, canvas.height);

      // Detect current biome ID
      let biomeId = 1;
      let bName = "Planícies de Aurora";
      if (g.activeGrandFloor && g.activeGrandFloor > 0) {
        biomeId = 100; // Grand Dungeon special virtual biome
        bName = `Masmorra de Asterion (${g.activeGrandFloor}º andar)`;
      } else {
        biomeId =
          g.activeCaveBiome ||
          g.activeMap.get?.(Math.floor(g.player.pos.x / 32), Math.floor(g.player.pos.y / 32))
            ?.biome ||
          1;
        const b = BIOMES.find((bb) => bb.id === biomeId) || BIOMES[0];
        bName = g.activeCaveBiome ? b.caveTheme.label : b.name;
      }

      // Check if biome changed to trigger music change and React re-render
      const stateObj = g as any;
      if (stateObj._lastBiomeId !== biomeId) {
        stateObj._lastBiomeId = biomeId;
        setActiveBiomeId(biomeId);
        setActiveBiomeName(bName);
      }

      render(ctx, g, canvas.width, canvas.height);
      inp.mouse.downOnce = false;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Aggressive autosave: every 3s + on tab hide + before unload.
    const autosave = window.setInterval(() => {
      if (stateRef.current) save(stateRef.current);
    }, 3000);
    const onVis = () => {
      if (document.visibilityState === "hidden" && stateRef.current) save(stateRef.current);
    };
    const onBeforeUnload = () => {
      if (stateRef.current) save(stateRef.current);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onBeforeUnload);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(autosave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onBeforeUnload);
      if (stateRef.current) save(stateRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      if (canvas) {
        canvas.removeEventListener("mousemove", mm);
        canvas.removeEventListener("mousedown", md);
        canvas.removeEventListener("mouseup", mu);
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
        canvas.removeEventListener("touchcancel", onTouchEnd);
      }
    };
  }, [menu, autoFireUi]);

  if (menu === "main") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden"
      >
        <div
          className="absolute inset-0 er-hero-bg"
          style={{ backgroundImage: `url(${dragonBg})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.97)_100%)] z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-0" />
        <div className="er-lightning" />
        <MenuBackgroundParticles />

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 opacity-80">
          <span className="h-px w-24 bg-gradient-to-r from-transparent to-amber-500/60" />
          <span className="er-subtitle text-[10px] tracking-[0.6em]">ASTERION · MMXXVI</span>
          <span className="h-px w-24 bg-gradient-to-l from-transparent to-amber-500/60" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          className="relative z-10 text-center px-10 py-16 max-w-xl w-full mx-4 er-panel rounded-md"
        >
          <div className="er-corner-tr" />
          <div className="er-corner-bl" />

          <div className="relative mx-auto mb-5 flex items-center justify-center w-28 h-28 bg-zinc-950/80 border border-amber-500/30 rounded-full shadow-[0_0_20px_rgba(240,192,64,0.25)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,192,64,0.15)_0%,transparent_70%)] animate-pulse" />
            <img
              src={`${import.meta.env.BASE_URL || "/"}sprites/o-absoluto.png`}
              alt="Crest"
              style={{ imageRendering: "pixelated" }}
              className="w-20 h-20 object-contain filter drop-shadow-[0_0_12px_rgba(240,192,64,0.45)] relative z-10"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = `${import.meta.env.BASE_URL || "/"}sprites/deus-das-fusoes.png`;
              }}
            />
          </div>

          <h1 className="er-title text-5xl md:text-7xl mb-3 relative leading-none">
            ETERNAL
            <br />
            REALMS
          </h1>
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/70" />
            <p className="er-subtitle text-[10px] md:text-xs">Crônicas de Asterion</p>
            <span className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/70" />
          </div>

          <div className="flex flex-col gap-4 items-center relative z-10">
            <button onClick={() => setMenu("class")} className="er-btn w-72">
              NOVO JOGO
            </button>
            <button
              disabled={!savedExists}
              onClick={() => {
                const g = load();
                if (g) {
                  stateRef.current = g;
                  setMenu("playing");
                }
              }}
              className="er-btn-ghost w-72"
            >
              CONTINUAR
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] tracking-[0.35em] text-emerald-300/80 uppercase">
            <span className="er-pulse-dot" />
            Salvamento automático ativo
          </div>

          {savedExists && (
            <button
              onClick={() => {
                if (confirm("Apagar permanentemente o save? Esta ação não pode ser desfeita.")) {
                  wipeSave();
                  setSavedExists(false);
                }
              }}
              className="mt-4 text-[9px] tracking-[0.4em] text-amber-100/25 hover:text-red-400/80 transition-colors uppercase"
            >
              Apagar save
            </button>
          )}

          <div
            className="mt-10 text-[10px] text-amber-100/50 max-w-sm mx-auto leading-relaxed border-t border-amber-500/20 pt-6 font-mono tracking-wider"
            style={{ textShadow: "0 1px 0 #000" }}
          >
            WASD mover · mouse ataca (ou minera) · 1-4 skills · I inv · C atrib · B craft · N miner.
            · M mapa
          </div>
        </motion.div>

        <div className="absolute bottom-4 right-6 z-20 er-subtitle text-[9px] opacity-40">
          v · ETERNAL
        </div>
      </motion.div>
    );
  }

  if (menu === "class") {
    return (
      <ClassSelectScreen
        selectedClass={selectedClass}
        selectedSkin={selectedSkin}
        onSelectClass={(c) => {
          setSelectedClass(c);
          setSelectedSkin(0);
        }}
        onSelectSkin={(i) => setSelectedSkin(i)}
        onBack={() => setMenu("main")}
        onStart={(sub, asc) => {
          setSelectedSubClass(sub);
          setAscensionLvl(asc);
          setIsWorldLoading(true);
          setLoadingProgress(0);
          
          let pVal = 0;
          const interval = setInterval(() => {
            pVal += 4;
            setLoadingProgress(pVal);
            if (pVal >= 100) {
              clearInterval(interval);
              const g = newGame(undefined, selectedClass);
              g.player.skin = selectedSkin;
              g.player.subClass = sub;
              g.player.ascensionLvl = asc;
              stateRef.current = g;
              setMenu("playing");
              setIsWorldLoading(false);
            }
          }, 100);
        }}
      />
    );
  }

  if (isWorldLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 font-mono text-white select-none">
        {/* Background ambient star/space dots */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-black to-zinc-950 pointer-events-none" />

        {/* Outer glowing frame */}
        <div className="relative p-8 rounded-lg border border-amber-500/30 bg-black/80 max-w-lg w-full mx-4 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-center flex flex-col items-center">
          {/* Pulsing/Rotating Runes */}
          <div className="w-16 h-16 rounded-full border border-dashed border-amber-500/60 flex items-center justify-center animate-spin mb-6" style={{ animationDuration: "12s" }}>
            <span className="text-xl text-amber-400">✵</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-[0.25em] text-amber-400 mb-2">
            CONSTRUINDO O MUNDO
          </h2>
          <p className="text-xs text-neutral-400 mb-8 tracking-wider font-sans">
            Sincronizando as Linhas Temporais de Asterion...
          </p>

          {/* Progress Bar Container */}
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 mb-6">
            <div 
              className="h-3 rounded-sm bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 transition-all duration-100 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          {/* Tips */}
          <div className="text-[10px] uppercase text-zinc-500 max-w-sm leading-relaxed border-t border-zinc-900 pt-4 w-full">
            <span className="text-amber-500/80 font-bold block mb-1">Dica de Sobrevivência</span>
            {loadingProgress < 35 && "Inimigos de Elite brilham em roxo e são 2x mais fortes, com recompensas raras!"}
            {loadingProgress >= 35 && loadingProgress < 70 && "Especializações de classe dão +30% de bônus em Atributos de Combate!"}
            {loadingProgress >= 70 && "Domine a sua arma especial e use seus pontos de atributos na aba de Atributos!"}
          </div>
        </div>
      </div>
    );
  }

  const g = stateRef.current;
  const amb = g?.ambitious;
  const player = g?.player;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-screen h-screen overflow-hidden bg-black relative"
    >
      <canvas ref={canvasRef} className="block cursor-crosshair" />
      <button
        onClick={() => {
          if (stateRef.current) save(stateRef.current);
          setMenu("main");
        }}
        className="fixed top-2 left-2 z-10 opacity-40 hover:opacity-100 text-xs bg-black/70 text-white px-2 py-1"
      >
        menu
      </button>

      {/* Zoom Controller */}
      <div
        className="fixed z-10 flex items-center gap-1.5 select-none"
        style={{
          left: "max(0.5rem, env(safe-area-inset-left))",
          top: "2.5rem",
          transform: "scale(0.55)",
          transformOrigin: "top left",
        }}
      >
        <button
          onClick={() => {
            const g = stateRef.current;
            if (!g) return;
            const oldZoom = g.zoom || 1.0;
            const newZoom = Math.max(0.6, oldZoom - 0.1);
            g.zoom = Number(newZoom.toFixed(2));
            setZoom(g.zoom);
          }}
          className="w-8 h-8 rounded border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-white font-extrabold flex items-center justify-center text-sm shadow-md active:scale-95 transition-transform cursor-pointer"
          title="Diminuir Zoom ([ / -)"
        >
          -
        </button>
        <div className="px-2 py-1.5 rounded border border-zinc-800 bg-zinc-950/90 text-zinc-300 font-mono text-[10px] min-w-[50px] text-center shadow-md">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => {
            const g = stateRef.current;
            if (!g) return;
            const oldZoom = g.zoom || 1.0;
            const newZoom = Math.min(2.5, oldZoom + 0.1);
            g.zoom = Number(newZoom.toFixed(2));
            setZoom(g.zoom);
          }}
          className="w-8 h-8 rounded border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-white font-extrabold flex items-center justify-center text-sm shadow-md active:scale-95 transition-transform cursor-pointer"
          title="Aumentar Zoom (] / +)"
        >
          +
        </button>
        <button
          onClick={() => {
            const g = stateRef.current;
            if (!g) return;
            g.zoom = 1.0;
            setZoom(1.0);
          }}
          className="px-1.5 h-8 rounded border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white font-mono text-[9px] flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
          title="Resetar Zoom"
        >
          Reset
        </button>
      </div>

      {/* Extras: Talent tree button + Boss Rush entry + Boss Rush HUD */}
      <ExtrasOverlay
        stateRef={stateRef}
        showTalents={showTalents}
        setShowTalents={setShowTalents}
        showAmbitious={showAmbitious}
        setShowAmbitious={setShowAmbitious}
      />

      {/* 🔮 BARRA DA HABILIDADE SUPREMA (ULTIMATE) - Sleek, compact capsule at top-center */}
      <div 
        className="fixed z-20 flex items-center gap-2 pointer-events-auto bg-black/90 border border-purple-500/40 px-2.5 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.8),_0_0_10px_rgba(168,85,247,0.15)] backdrop-blur-md transition-all duration-300 hover:border-purple-400/65"
        style={{ 
          top: "calc(8px + env(safe-area-inset-top, 0px))", 
          left: "50%", 
          transform: "translateX(-50%) scale(0.85)", 
          transformOrigin: "top center",
          minWidth: "190px"
        }}
      >
        <div className="flex flex-col text-[8.5px] font-mono text-purple-300 font-black leading-tight select-none">
          <span className="tracking-wide text-purple-200">🔮 SUPREMO</span>
          <span className="text-[6.5px] text-purple-400/85">Atalho [R]</span>
        </div>
        <div className="w-20 bg-neutral-900 border border-neutral-800 h-2.5 rounded-full overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300 relative"
            style={{ width: `${Math.min(100, (stateRef.current?.ambitious?.ultimateGauge ?? 0))}%` }}
          >
            {/* Pulsing light effect inside the gauge */}
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-[7.5px] font-mono text-white font-black drop-shadow-md">
            {Math.round(stateRef.current?.ambitious?.ultimateGauge ?? 0)}%
          </div>
        </div>
        <button
          onClick={() => {
            const g = stateRef.current;
            if (g) castUltimateSkill(g);
          }}
          disabled={(stateRef.current?.ambitious?.ultimateGauge ?? 0) < 100}
          className={`px-2.5 py-0.5 text-[8.5px] font-mono font-black rounded-full tracking-wider uppercase transition-all duration-200 active:scale-95 ${
            (stateRef.current?.ambitious?.ultimateGauge ?? 0) >= 100
              ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-[0_0_8px_#a855f7] animate-pulse"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/30"
          }`}
        >
          {(stateRef.current?.ambitious?.ultimateGauge ?? 0) >= 100 ? "💥 ATIVAR" : "Carregando"}
        </button>
      </div>

      {/* Mobile HUD: panel buttons + skill abilities + fire */}
      {isMobile && (
        <MobileHud
          stateRef={stateRef}
          inputRef={inputRef}
          autoFireUi={autoFireUi}
          setAutoFireUi={setAutoFireUi}
          moveJoyRef={moveJoyRef}
          aimJoyRef={aimJoyRef}
        />
      )}
      <RucoySideBar playerLevel={stateRef.current?.player?.level ?? 1} />
      <TrophyNotification />
    </motion.div>
  );
}

// tiny overlay that shows the joysticks where the user is touching
function JoystickHUD({
  moveRef,
  aimRef,
}: {
  moveRef: React.MutableRefObject<{
    active: boolean;
    cx: number;
    cy: number;
    dx: number;
    dy: number;
  }>;
  aimRef: React.MutableRefObject<{
    active: boolean;
    cx: number;
    cy: number;
    dx: number;
    dy: number;
  }>;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    let r = 0;
    const tick = () => {
      force((x) => (x + 1) & 0xff);
      r = requestAnimationFrame(tick);
    };
    r = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r);
  }, []);
  const dot = (cx: number, cy: number, dx: number, dy: number, key: string) => (
    <div
      key={key}
      className="pointer-events-none fixed z-10"
      style={{ left: cx - 60, top: cy - 60, width: 120, height: 120 }}
    >
      <div className="w-full h-full rounded-full border-2 border-amber-300/60 bg-black/30" />
      <div
        className="absolute rounded-full bg-amber-300/70 border-2 border-amber-100"
        style={{
          width: 44,
          height: 44,
          left: 60 - 22 + Math.max(-40, Math.min(40, dx)),
          top: 60 - 22 + Math.max(-40, Math.min(40, dy)),
        }}
      />
    </div>
  );
  return (
    <>
      {moveRef.current.active &&
        dot(moveRef.current.cx, moveRef.current.cy, moveRef.current.dx, moveRef.current.dy, "m")}
      {aimRef.current.active &&
        dot(
          aimRef.current.cx,
          aimRef.current.cy,
          Math.max(-40, Math.min(40, aimRef.current.dx * 0.4)),
          Math.max(-40, Math.min(40, aimRef.current.dy * 0.4)),
          "a",
        )}
    </>
  );
}

// --------------------- Mobile HUD (skills next to health + panel buttons + fire) ---------------------
type JoyRef = React.MutableRefObject<{
  active: boolean;
  cx: number;
  cy: number;
  dx: number;
  dy: number;
}>;

function MobileHud({
  stateRef,
  inputRef,
  autoFireUi,
  setAutoFireUi,
  moveJoyRef,
  aimJoyRef,
}: {
  stateRef: React.MutableRefObject<GameState | null>;
  inputRef: React.MutableRefObject<{
    keys: Set<string>;
    mouse: { x: number; y: number; down: boolean; downOnce: boolean };
  }>;
  autoFireUi: boolean;
  setAutoFireUi: (fn: (v: boolean) => boolean) => void;
  moveJoyRef: JoyRef;
  aimJoyRef: JoyRef;
}) {
  const state = useOverlayState();
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((x) => (x + 1) & 0xffff), 200);
    return () => window.clearInterval(id);
  }, []);

  const g = stateRef.current;
  const skills = g?.player?.skills ?? [];

  const skillHold = (key: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      inputRef.current.keys.add(key);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      inputRef.current.keys.delete(key);
    },
    onMouseDown: () => inputRef.current.keys.add(key),
    onMouseUp: () => inputRef.current.keys.delete(key),
    onMouseLeave: () => inputRef.current.keys.delete(key),
  });

  return (
    <>
      {/* Skill hotkeys 1..4 — placed next to the health HUD on canvas (top-left, right of HP panel ~x=300) */}
      <div
        className="fixed z-30 flex gap-1.5 pointer-events-auto"
        style={{
          top: "calc(11px + env(safe-area-inset-top, 0px))",
          left: 160, // since HP panel is scaled to 50%, we can position hotkeys closer to top-left! This is awesome!
          maxWidth: "calc(100vw - 180px)",
          flexWrap: "wrap",
          alignItems: "center",
          transform: "scale(0.55)",
          transformOrigin: "top left",
        }}
      >
        {/* Unified Profile Button */}
        <button
          onClick={() => setOverlayState({ activeModal: "profile" })}
          aria-label="Perfil"
          className="relative flex flex-col items-center justify-center rounded-lg overflow-hidden select-none active:scale-95 transition-transform cursor-pointer"
          style={{
            width: 42,
            height: 42,
            background: "linear-gradient(180deg, #e64980 0%, #b82250 100%)",
            border: "1.5px solid #f5c04a",
            boxShadow:
              "0 0 10px rgba(245,192,74,0.35), inset 0 1px 0 rgba(255,255,255,0.3), 0 1.5px 4px rgba(0,0,0,0.5)",
          }}
        >
          <span
            style={{
              fontFamily: '"Press Start 2P", ui-monospace, monospace',
              fontSize: 6.5,
              color: "#fff",
              textShadow: "1px 1px 0 #000",
              fontWeight: "bold",
              letterSpacing: 0.2,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            PERFIL
          </span>
        </button>

        {["1", "2", "3", "4"].map((n, i) => {
          const sk = skills[i];
          const cdReady = !sk || sk.cur <= 0.05;
          const pct = sk ? Math.max(0, Math.min(1, 1 - sk.cur / (sk.cd || 1))) : 1;
          const notEnoughMp = !!(
            sk &&
            g &&
            g.player.mp < ((sk as unknown as { cost?: number }).cost ?? 0)
          );
          const label = sk?.name?.slice(0, 6) ?? `Skill ${n}`;
          return (
            <button
              key={n}
              {...skillHold(n)}
              aria-label={label}
              className="relative flex flex-col items-center justify-center rounded-lg overflow-hidden select-none active:scale-95 transition-transform"
              style={{
                width: 42,
                height: 42,
                background: cdReady
                  ? "linear-gradient(180deg, rgba(64,32,16,0.9), rgba(24,12,6,0.9))"
                  : "linear-gradient(180deg, rgba(20,20,20,0.9), rgba(6,6,6,0.9))",
                border: `1.5px solid ${cdReady ? "#f5c04a" : "#3a2418"}`,
                boxShadow: cdReady
                  ? "0 0 10px rgba(245,192,74,0.35), inset 0 1px 0 rgba(255,220,140,0.35)"
                  : "0 1.5px 4px rgba(0,0,0,0.5)",
                opacity: sk ? 1 : 0.55,
              }}
            >
              {!cdReady && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `conic-gradient(rgba(0,0,0,0.75) ${pct * 360}deg, transparent 0deg)`,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: '"Press Start 2P", ui-monospace, monospace',
                  fontSize: 11,
                  color: cdReady ? "#ffe089" : "#8a6a3a",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                {n}
              </span>
              <span
                style={{
                  fontSize: 5.5,
                  letterSpacing: 0.2,
                  color: notEnoughMp ? "#ff8a6a" : cdReady ? "#f5c04a" : "#7a5a30",
                  fontFamily: "ui-monospace, monospace",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginTop: 0.5,
                  maxWidth: 36,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </span>
              {sk && !cdReady && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: 2,
                    fontSize: 7,
                    color: "#fff",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 800,
                    textShadow: "1px 1px 0 #000",
                  }}
                >
                  {sk.cur.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Removed FIRE / AUTO button to simplify UI */}

      {/* Botão INTERAGIR (F/E) — ativa NPCs e Mercador */}
      <button
        onTouchStart={(ev) => {
          ev.preventDefault();
          const g = stateRef.current;
          if (g) (g as unknown as { _ePressed?: boolean })._ePressed = true;
        }}
        onMouseDown={() => {
          const g = stateRef.current;
          if (g) (g as unknown as { _ePressed?: boolean })._ePressed = true;
        }}
        className="fixed z-30 pointer-events-auto select-none active:scale-90 transition-transform"
        style={{
          bottom: 110,
          right: 22,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #d97706 0%, #78350f 100%)",
          border: "2px solid #fbbf24",
          boxShadow:
            "0 0 10px rgba(251,191,36,0.45), inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 5px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          cursor: "pointer",
          transform: "scale(0.55)",
          transformOrigin: "bottom right",
        }}
        aria-label="Interagir [F]"
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>💬</span>
        <span
          style={{
            fontFamily: '"Press Start 2P", ui-monospace, monospace',
            fontSize: 3.5,
            color: "#fff",
            textShadow: "1px 1px 0 #000",
            letterSpacing: 0.2,
            lineHeight: 1,
          }}
        >
          INT
        </span>
      </button>

      {/* Botão NAVEGAR (F7) — ativado se tiver barco e no overworld */}
      {state.hasBoat && stateRef.current && stateRef.current.activeMap === stateRef.current.world && (
        <button
          onClick={() => {
            const g = stateRef.current;
            if (g) sailToNewIsland(g);
          }}
          className="fixed z-30 pointer-events-auto select-none active:scale-90 transition-transform"
          style={{
            bottom: 80,
            right: 22,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)",
            border: "2px solid #60a5fa",
            boxShadow:
              "0 0 10px rgba(96,165,250,0.45), inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 5px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            cursor: "pointer",
            transform: "scale(0.55)",
            transformOrigin: "bottom right",
          }}
          aria-label="Navegar [F7]"
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>⛵</span>
          <span
            style={{
              fontFamily: '"Press Start 2P", ui-monospace, monospace',
              fontSize: 3.2,
              color: "#fff",
              textShadow: "1px 1px 0 #000",
              letterSpacing: 0.1,
              lineHeight: 1,
            }}
          >
            NAV
          </span>
        </button>
      )}

      {/* Joystick indicators */}
      <JoystickHUD moveRef={moveJoyRef} aimRef={aimJoyRef} />

      {/* EXTREMELY BEAUTIFUL SAILING LOADING SCREEN */}
      {state.isSailingLoading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{
            background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)",
            transition: "opacity 0.3s ease-out",
          }}
        >
          {/* Ambient space dust backdrops */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none" />

          {/* Golden Floating Compass Frame */}
          <div className="relative mb-8 p-1 select-none animate-bounce" style={{ animationDuration: "3s" }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 90,
                height: 90,
                background: "linear-gradient(135deg, #241612 0%, #120a08 100%)",
                border: "4px double #f5c04a",
                boxShadow: "0 0 35px rgba(245, 192, 74, 0.4), inset 0 0 15px rgba(0,0,0,0.85)",
              }}
            >
              {/* Pulsing Ship Icon */}
              <span className="text-4xl animate-pulse">⛵</span>
            </div>
            
            {/* Pulsing compass letters */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#f5c04a] font-bold">N</div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#f5c04a] font-bold">S</div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-[8px] font-mono text-[#f5c04a] font-bold">L</div>
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 text-[8px] font-mono text-[#f5c04a] font-bold">O</div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-md select-none">
            <h3
              style={{
                fontFamily: '"Press Start 2P", ui-monospace, monospace',
                fontSize: 10,
                color: "#f5c04a",
                textShadow: "2px 2px 0 #000, 0 0 10px rgba(245,192,74,0.45)",
                letterSpacing: 1.2,
                lineHeight: 1.5,
              }}
              className="animate-pulse"
            >
              CORTANDO AS ONDAS...
            </h3>
            
            <p
              style={{
                fontFamily: '"Press Start 2P", ui-monospace, monospace',
                fontSize: 6,
                color: "#9ca3af",
                marginTop: 10,
                letterSpacing: 0.5,
              }}
            >
              Velejando para: {stateRef.current && getIslandDetails(state.sailingTargetIsland || 1, stateRef.current.world.size).name.toUpperCase()}
            </p>
          </div>

          {/* Progress Bar Frame */}
          <div
            className="w-full max-w-xs mt-8 p-1"
            style={{
              background: "#120a08",
              border: "2px solid #6b4a2b",
              borderRadius: 6,
              boxShadow: "0 4px 10px rgba(0,0,0,0.85)",
            }}
          >
            {/* The actual progress fill */}
            <div
              className="h-3 rounded transition-all duration-100 ease-out flex items-center justify-end pr-1.5 overflow-hidden"
              style={{
                width: `${state.sailingLoadingProgress || 0}%`,
                background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #38bdf8 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 10px rgba(56,189,248,0.6)",
              }}
            >
              {/* Percentage label */}
              <span className="text-[7px] text-white font-bold select-none font-mono">
                {Math.round(state.sailingLoadingProgress || 0)}%
              </span>
            </div>
          </div>

          {/* Beautiful Tips Box */}
          <div
            className="mt-10 w-full max-w-md p-4 text-center"
            style={{
              background: "linear-gradient(180deg, #241612 0%, #120a08 100%)",
              border: "1.5px dashed #f5c04a",
              borderRadius: 8,
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.6)",
            }}
          >
            <span
              style={{
                fontFamily: '"Press Start 2P", ui-monospace, monospace',
                fontSize: 6.5,
                color: "#f5c04a",
                textShadow: "1px 1px 0 #000",
                display: "block",
                marginBottom: 8,
                letterSpacing: 0.8,
              }}
            >
              💡 CONSELHO DE MARUJO
            </span>
            <p
              className="text-[#e8d5a8] leading-relaxed select-text"
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                lineHeight: 1.45,
              }}
            >
              "{state.sailingLoadingTip}"
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// re-export types to silence unused import warnings in prod bundles
export type { GameState };
// suppress unused import lint
void PROFESSION_LIST;

// --------------------- Extras: Talents + Boss Rush ---------------------

function ExtrasOverlay({
  stateRef,
  showTalents,
  setShowTalents,
  showAmbitious,
  setShowAmbitious,
}: {
  stateRef: React.MutableRefObject<GameState | null>;
  showTalents: boolean;
  setShowTalents: (v: boolean | ((v: boolean) => boolean)) => void;
  showAmbitious: boolean;
  setShowAmbitious: (v: boolean | ((v: boolean) => boolean)) => void;
}) {
  // Re-render on tick — parent already forces a tick every 300ms.
  const g = stateRef.current;
  if (!g) return null;

  const [tick, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  const [synthParent1, setSynthParent1] = useState<string>("");
  const [synthParent2, setSynthParent2] = useState<string>("");

  const p = g.player;
  const player = g.player;
  const amb = g.ambitious;
  const [ambitiousTab, setAmbitiousTab] = useState<"ascension" | "boss" | "pets" | "mercenaries" | "enchant" | "fleet" | "rift" | "codex">("ascension");

  const [hudMinimized, setHudMinimized] = useState(false);
  const [talentsMinimized, setTalentsMinimized] = useState(false);
  const [ambitiousMinimized, setAmbitiousMinimized] = useState(false);

  // Synchronize player with active relics and ascensions
  if (amb) {
    if (!amb.discoveredRelics) amb.discoveredRelics = [];
    (p as any).discoveredRelics = amb.discoveredRelics;
    (p as any).divineAscensions = amb.ascensionCount;
  }

  useEffect(() => {
    if (g && g.panel === "mercenarios") {
      setAmbitiousTab("mercenaries");
      setShowAmbitious(true);
      setShowTalents(false);
      setAmbitiousMinimized(false);
      g.panel = "none";
    }
  }, [g?.panel]);

  const inArena = g.activeArena;
  const inCity = !g.activeCaveBiome && g.activeGrandFloor === 0 && !inArena;
  const tree = CLASS_TALENTS[p.cls];

  return (
    <>
      {/* Stack extras buttons on the LEFT side, below the game HUD panel */}
      <div className="fixed z-20 flex flex-col gap-1.5 items-start" style={{ top: 220, left: 8 }}>
        {hudMinimized ? (
          <button
            onClick={() => setHudMinimized(false)}
            className="text-[9px] font-mono font-black tracking-wider px-2 py-1 border border-purple-500 bg-black/90 text-purple-300 hover:bg-purple-950/40 rounded shadow-[0_0_8px_rgba(168,85,247,0.4)] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Expandir Menu de Sistemas"
          >
            ⚙️ ATALHOS ➕
          </button>
        ) : (
          <>
            <button
              onClick={() => setHudMinimized(true)}
              className="w-full text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 border border-zinc-700/60 bg-zinc-950/90 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 text-center cursor-pointer mb-1 transition-all active:scale-95"
              title="Minimizar botões HUD"
            >
              MINIMIZAR ➖
            </button>
            {!showTalents && (
              <button
                onClick={() => {
                  setShowTalents(true);
                  setShowAmbitious(false);
                  setTalentsMinimized(false);
                }}
                className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 border border-amber-500/60 bg-black/80 text-amber-200 hover:bg-amber-900/40 text-left cursor-pointer flex items-center justify-between"
                title="Árvore de Talentos (T)"
              >
                <span>[T] TALENTOS</span>
                {p.talentPoints > 0 && (
                  <span className="ml-2 inline-block bg-amber-500 text-black text-[9px] px-1 py-[0.5px] rounded font-black">
                    +{p.talentPoints}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setShowAmbitious((v) => !v);
                setShowTalents(false);
                setAmbitiousMinimized(false);
              }}
              className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 border border-purple-500/60 bg-black/80 text-purple-200 hover:bg-purple-900/45 text-left flex items-center justify-between cursor-pointer"
              title="Sistemas Divinos & Ambições (Y)"
            >
              <span>[Y] DIVINDADE</span>
              {p.level >= 100 && (
                <span className="ml-2 inline-block bg-purple-500 text-black text-[8px] px-1 font-black rounded animate-pulse">
                  ASCENDER
                </span>
              )}
            </button>
            <button
              onClick={() => {
                const g = stateRef.current;
                if (g) g.panel = g.panel === "bestiario" ? "none" : "bestiario";
              }}
              className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 border border-cyan-600/60 bg-black/80 text-cyan-200 hover:bg-cyan-900/30 text-left cursor-pointer"
              title="Bestiário — enciclopédia de inimigos (G)"
            >
              [G] BESTIÁRIO
            </button>
            {inCity && (
              <button
                onClick={() => stateRef.current && enterBossRush(stateRef.current)}
                className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 border border-red-500/70 bg-black/80 text-red-200 hover:bg-red-900/50 text-left cursor-pointer"
                title="Arena da Sobrevivência (Boss Rush)"
              >
                ⚔ ARENA
                <div className="text-[8px] tracking-normal text-red-300/80 mt-0.5 font-normal">
                  recorde: onda {g.arenaBest}
                </div>
              </button>
            )}
          </>
        )}
      </div>

      {/* Boss Rush HUD (100x mais refinado) — visible only inside the arena */}
      {inArena && (
        <div
          className="fixed z-20 pointer-events-none text-center flex flex-col items-center gap-2"
          style={{ top: 12, left: "50%", transform: "translateX(-50%)" }}
        >
          <div
            className="inline-block px-5 py-3 border-2 border-red-600 bg-neutral-950/95 text-red-200 font-mono rounded"
            style={{ 
              boxShadow: "0 0 30px rgba(220,38,38,0.4), inset 0 0 10px rgba(0,0,0,0.8)",
              minWidth: "260px"
            }}
          >
            <div className="text-[10px] tracking-[0.5em] text-red-400 font-black">
              ⚔️ COLISEU DA SOBREVIVÊNCIA ⚔️
            </div>
            
            <div className="text-3xl font-black text-amber-400 mt-1 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              ONDA {g.arenaWave || 0}
            </div>

            {/* Barra de Progresso de Sobreviventes */}
            {g.arenaWaveActive && g.enemies.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[8px] text-zinc-400 mb-0.5 font-bold tracking-wider">
                  <span>GLADIADORES RESTANTES</span>
                  <span className="text-red-400 font-black">{g.enemies.length}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (g.enemies.length / 14) * 100)}%`, boxShadow: "0 0 8px #ef4444" }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-[8px] tracking-widest text-zinc-400 mt-2 border-t border-neutral-800 pt-1.5 font-bold">
              <span>RECORDE: ONDA {g.arenaBest}</span>
              <span className="text-zinc-500">·</span>
              <span>ESTADO: {g.arenaWaveActive ? "COMBATE" : "PREPARAÇÃO"}</span>
            </div>

            {!g.arenaWaveActive && g.arenaWave > 0 && (
              <div className="text-[9px] tracking-widest text-emerald-400 font-bold mt-1.5 animate-pulse">
                PRÓXIMA ONDA EM {Math.max(0, g.arenaNextWaveIn).toFixed(1)}s
              </div>
            )}
          </div>

          {/* BADGE DO MODIFICADOR ATIVO */}
          {g.arenaModifier && g.arenaWaveActive && (
            <div 
              className="px-4 py-2 border-2 bg-black/95 rounded shadow-lg pointer-events-auto flex flex-col items-center gap-0.5 animate-fade-in"
              style={{ 
                borderColor: g.arenaModifierColor || "#e4e4e7",
                boxShadow: `0 0 16px ${(g.arenaModifierColor || "#e4e4e7")}44`
              }}
            >
              <span 
                className="text-[11px] font-black tracking-widest"
                style={{ color: g.arenaModifierColor }}
              >
                ◈ EFEITO: {g.arenaModifier} ◈
              </span>
              <span className="text-[8px] text-zinc-300 font-mono text-center max-w-[280px] leading-relaxed">
                {g.arenaModifierDesc}
              </span>
            </div>
          )}

          <div className="mt-1 pointer-events-auto">
            <button
              onClick={() => stateRef.current && exitBossRush(stateRef.current)}
              className="text-[9px] font-mono font-bold tracking-wider px-3 py-1 border border-amber-600/60 bg-black/80 text-amber-200 hover:bg-amber-900/40 rounded transition-transform active:scale-95 cursor-pointer"
            >
              🚪 RETIRAR-SE DA ARENA
            </button>
          </div>
        </div>
      )}

      {/* Talent panel modal (100x mais refinado - Árvore Visual Sombria) */}
      {showTalents && !talentsMinimized && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={() => setShowTalents(false)}
        >
          <div
            className="relative max-w-4xl w-[min(95vw,940px)] bg-neutral-950 border-2 border-amber-600/60 p-6 font-mono text-amber-100 rounded-lg flex flex-col md:flex-row gap-6 max-h-[92vh] overflow-hidden"
            style={{ 
              boxShadow: "0 0 50px rgba(180,83,9,0.35), inset 0 0 20px rgba(0,0,0,0.9)",
              backgroundImage: "radial-gradient(circle at center, #1c0f05 0%, #0a0502 100%)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CORPO DA ÁRVORE ESQUERDA (ÁREA VISUAL) */}
            <div className="flex-1 flex flex-col min-h-[460px] md:min-h-[540px] relative overflow-hidden bg-black/60 border border-amber-900/30 rounded p-4 select-none">
              
              {/* CABEÇALHO DA ÁRVORE */}
              <div className="flex justify-between items-start mb-2 z-10">
                <div>
                  <div className="text-[10px] tracking-[0.4em] text-amber-400/80 font-bold">
                    HERANÇA DE PODER
                  </div>
                  <div className="text-lg font-bold tracking-widest text-white">
                    {p.cls.toUpperCase()} — Nível {p.level}
                  </div>
                </div>
                <div className="text-right bg-amber-950/40 border border-amber-500/20 px-3 py-1 rounded">
                  <div className="text-[9px] tracking-widest text-amber-400/70 font-semibold">
                    PONTOS ATIVOS
                  </div>
                  <div className="text-2xl font-bold text-amber-300">{p.talentPoints}</div>
                </div>
              </div>

              {/* RENDERIZADOR DA ÁRVORE DE TALENTOS VISUAL EM SVG */}
              <div className="flex-1 relative min-h-[380px] w-full flex items-center justify-center">
                
                {/* SVG PARA LINHAS DE CONEXÃO / GALHOS DA ÁRVORE */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="trunkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#1e0f08" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#45220f" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#7c3f12" stopOpacity="0.7" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* 1. Raízes da Árvore no Fundo */}
                  <path d="M 50% 100% C 45% 95%, 40% 95%, 35% 100% M 50% 100% C 50% 94%, 48% 92%, 45% 96% M 50% 100% C 55% 95%, 60% 95%, 65% 100%" stroke="#45220f" strokeWidth="4" fill="none" opacity="0.6"/>

                  {/* 2. Tronco Central Principal */}
                  <line x1="50%" y1="100%" x2="50%" y2="80%" stroke="url(#trunkGrad)" strokeWidth="12" strokeLinecap="round" />
                  <line x1="50%" y1="80%" x2="50%" y2="50%" stroke="url(#trunkGrad)" strokeWidth="8" strokeLinecap="round" />

                  {/* 3. Conexões dos Galhos (Esquerda vs Direita) */}
                  {/* Esquerda: offBranch (#ff6040) */}
                  {tree.branches[0].nodes[0] && (
                    <path d="M 50% 80% Q 30% 75%, 25% 72%" stroke={(p.talents?.[tree.branches[0].nodes[0].id] ?? 0) > 0 ? "#ff6040" : "#4b2210"} strokeWidth="3" fill="none" filter={(p.talents?.[tree.branches[0].nodes[0].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                  {tree.branches[0].nodes[0] && tree.branches[0].nodes[1] && (
                    <path d="M 25% 72% C 25% 62%, 25% 58%, 25% 52%" stroke={(p.talents?.[tree.branches[0].nodes[1].id] ?? 0) > 0 ? "#ff6040" : "#2a221a"} strokeWidth="2.5" fill="none" filter={(p.talents?.[tree.branches[0].nodes[1].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                  {tree.branches[0].nodes[1] && tree.branches[0].nodes[2] && (
                    <path d="M 25% 52% C 25% 42%, 25% 38%, 25% 32%" stroke={(p.talents?.[tree.branches[0].nodes[2].id] ?? 0) > 0 ? "#ff6040" : "#2a221a"} strokeWidth="2.5" fill="none" filter={(p.talents?.[tree.branches[0].nodes[2].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                  {tree.branches[0].nodes[2] && tree.branches[0].nodes[3] && (
                    <path d="M 25% 32% C 25% 22%, 35% 18%, 38% 12%" stroke={(p.talents?.[tree.branches[0].nodes[3].id] ?? 0) > 0 ? "#ff6040" : "#2a221a"} strokeWidth="2.5" strokeDasharray="3,3" fill="none" filter={(p.talents?.[tree.branches[0].nodes[3].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}

                  {/* Direita: utilBranch (#38bdf8) */}
                  {tree.branches[1].nodes[0] && (
                    <path d="M 50% 80% Q 70% 75%, 75% 72%" stroke={(p.talents?.[tree.branches[1].nodes[0].id] ?? 0) > 0 ? "#38bdf8" : "#1a3a4b"} strokeWidth="3" fill="none" filter={(p.talents?.[tree.branches[1].nodes[0].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                  {tree.branches[1].nodes[0] && tree.branches[1].nodes[1] && (
                    <path d="M 75% 72% C 75% 62%, 75% 58%, 75% 52%" stroke={(p.talents?.[tree.branches[1].nodes[1].id] ?? 0) > 0 ? "#38bdf8" : "#2a221a"} strokeWidth="2.5" fill="none" filter={(p.talents?.[tree.branches[1].nodes[1].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                  {tree.branches[1].nodes[1] && tree.branches[1].nodes[2] && (
                    <path d="M 75% 52% C 75% 42%, 75% 38%, 75% 32%" stroke={(p.talents?.[tree.branches[1].nodes[2].id] ?? 0) > 0 ? "#38bdf8" : "#2a221a"} strokeWidth="2.5" fill="none" filter={(p.talents?.[tree.branches[1].nodes[2].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                  {tree.branches[1].nodes[2] && tree.branches[1].nodes[3] && (
                    <path d="M 75% 32% C 75% 22%, 65% 18%, 62% 12%" stroke={(p.talents?.[tree.branches[1].nodes[3].id] ?? 0) > 0 ? "#38bdf8" : "#2a221a"} strokeWidth="2.5" strokeDasharray="3,3" fill="none" filter={(p.talents?.[tree.branches[1].nodes[3].id] ?? 0) > 0 ? "url(#glow)" : ""} />
                  )}
                </svg>

                {/* NOMES DAS RAMIFICAÇÕES */}
                <div className="absolute left-[12%] bottom-[25%] text-[9px] font-bold text-amber-500/70 uppercase select-none tracking-widest text-center">
                  🍂 {tree.branches[0].name}<br/>(ATAQUE)
                </div>
                <div className="absolute right-[12%] bottom-[25%] text-[9px] font-bold text-sky-400/70 uppercase select-none tracking-widest text-center">
                  🛡️ {tree.branches[1].name}<br/>(UTILIDADE)
                </div>

                {/* 4. RENDERIZANDO OS BOTÕES DE NODE FISICAMENTE COMO FRUTOS OU FOLHAS DA ÁRVORE */}
                <div className="absolute inset-0 z-10">
                  {/* RAMO ESQUERDO */}
                  {tree.branches[0].nodes.map((n, idx) => {
                    const rank = p.talents?.[n.id] ?? 0;
                    const locked = !nodePrereqMet(p.cls, n.id, p.talents || {});
                    const maxed = rank >= n.maxRank;
                    const canAlloc = p.talentPoints > 0 && !locked && !maxed;

                    // Mapeamento de posições verticais (idx 0..3)
                    const leftCoords = [
                      { left: "25%", top: "72%" },
                      { left: "25%", top: "52%" },
                      { left: "25%", top: "32%" },
                      { left: "38%", top: "12%" }, // Capstone convergente
                    ];
                    const pos = leftCoords[idx];

                    return (
                      <div
                        key={n.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: pos.left, top: pos.top }}
                      >
                        <button
                          disabled={!canAlloc}
                          onClick={() => {
                            if (stateRef.current && allocTalent(stateRef.current, n.id)) {
                              if (stateRef.current) save(stateRef.current);
                            }
                          }}
                          className={`w-12 h-12 rounded-full border-2 font-bold flex flex-col items-center justify-center transition-all ${
                            maxed
                              ? "border-emerald-400 bg-emerald-950 text-emerald-200 shadow-md shadow-emerald-500/30"
                              : canAlloc
                                ? "border-amber-400 bg-amber-950/80 text-amber-100 hover:scale-110 cursor-pointer shadow-lg shadow-amber-500/40"
                                : locked
                                  ? "border-neutral-800 bg-neutral-900/90 text-neutral-600 cursor-not-allowed opacity-50"
                                  : "border-amber-900/60 bg-amber-950/20 text-amber-600/70 hover:scale-105 cursor-pointer"
                          }`}
                          style={{
                            boxShadow: canAlloc ? "0 0 14px #ff6040" : (rank > 0 ? "0 0 8px #ff604088" : "")
                          }}
                        >
                          <span className="text-sm font-black mt-0.5">{rank}</span>
                          <span className="text-[7px] font-normal opacity-60">/{n.maxRank}</span>
                        </button>
                        <div className="text-[8px] max-w-[85px] text-center mt-1 text-amber-200/90 font-bold truncate">
                          {n.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* RAMO DIREITO */}
                  {tree.branches[1].nodes.map((n, idx) => {
                    const rank = p.talents?.[n.id] ?? 0;
                    const locked = !nodePrereqMet(p.cls, n.id, p.talents || {});
                    const maxed = rank >= n.maxRank;
                    const canAlloc = p.talentPoints > 0 && !locked && !maxed;

                    const rightCoords = [
                      { left: "75%", top: "72%" },
                      { left: "75%", top: "52%" },
                      { left: "75%", top: "32%" },
                      { left: "62%", top: "12%" }, // Capstone convergente direito
                    ];
                    const pos = rightCoords[idx];

                    return (
                      <div
                        key={n.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: pos.left, top: pos.top }}
                      >
                        <button
                          disabled={!canAlloc}
                          onClick={() => {
                            if (stateRef.current && allocTalent(stateRef.current, n.id)) {
                              if (stateRef.current) save(stateRef.current);
                            }
                          }}
                          className={`w-12 h-12 rounded-full border-2 font-bold flex flex-col items-center justify-center transition-all ${
                            maxed
                              ? "border-emerald-400 bg-emerald-950 text-emerald-200 shadow-md shadow-emerald-500/30"
                              : canAlloc
                                ? "border-sky-400 bg-sky-950/80 text-sky-100 hover:scale-110 cursor-pointer shadow-lg shadow-sky-500/40"
                                : locked
                                  ? "border-neutral-800 bg-neutral-900/90 text-neutral-600 cursor-not-allowed opacity-50"
                                  : "border-sky-950/60 bg-sky-950/20 text-sky-600/70 hover:scale-105 cursor-pointer"
                          }`}
                          style={{
                            boxShadow: canAlloc ? "0 0 14px #38bdf8" : (rank > 0 ? "0 0 8px #38bdf888" : "")
                          }}
                        >
                          <span className="text-sm font-black mt-0.5">{rank}</span>
                          <span className="text-[7px] font-normal opacity-60">/{n.maxRank}</span>
                        </button>
                        <div className="text-[8px] max-w-[85px] text-center mt-1 text-sky-200/90 font-bold truncate">
                          {n.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RAÍZ DA ESSÊNCIA (PAINEL DE ATRIBUTOS BASE NA BASE DA ÁRVORE) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-neutral-900/95 border border-amber-800/40 px-3 py-1.5 rounded flex gap-4 text-[9px] text-center shadow-lg">
                  <div>
                    <div className="text-red-400 font-bold">❤️ HP BASE</div>
                    <div className="text-white font-mono">{p.maxHp}</div>
                  </div>
                  <div className="border-r border-amber-900/30"></div>
                  <div>
                    <div className="text-blue-400 font-bold">✨ MP BASE</div>
                    <div className="text-white font-mono">{p.maxMp}</div>
                  </div>
                  <div className="border-r border-amber-900/30"></div>
                  <div>
                    <div className="text-amber-400 font-bold">⚔️ ATK</div>
                    <div className="text-white font-mono">+{p.atk()}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* PAINEL DIREITO: LIVRO DETALHADO DO TALENTO E REQUISITOS (NOVO) */}
            <div className="w-full md:w-[280px] bg-neutral-900/95 border border-amber-700/40 p-4 rounded flex flex-col justify-between max-h-[540px] overflow-auto">
              <div>
                <div className="text-[10px] tracking-[0.2em] text-amber-500/80 font-bold border-b border-amber-700/30 pb-1 mb-3 text-center">
                  🔍 CODEX DO DESTINO
                </div>

                {/* EXIBIÇÃO DE DETALHES DE UM TALENTO */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-amber-200/60 text-center italic">
                    Escolha um fruto ativo acima para investir seus pontos.
                  </div>

                  {/* LISTA RÁPIDA DE TALENTOS COMPACTA PARA SELEÇÃO / INSPEÇÃO */}
                  <div className="flex flex-col gap-2 mt-2">
                    {tree.branches.flatMap(b => b.nodes).map(n => {
                      const rank = p.talents?.[n.id] ?? 0;
                      const locked = !nodePrereqMet(p.cls, n.id, p.talents || {});
                      return (
                        <div 
                          key={n.id}
                          className={`p-2 border border-amber-900/20 rounded ${locked ? "bg-black/25 opacity-45" : "bg-black/50 hover:border-amber-500/50 transition-colors"}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-amber-200">{n.name}</span>
                            <span className="text-[10px] font-bold text-amber-400">{rank}/{n.maxRank}</span>
                          </div>
                          <p className="text-[10px] text-amber-100/70 mt-1 leading-snug">{n.desc}</p>
                          {n.requires && (
                            <span className="text-[8px] text-amber-400/50 block mt-1">
                              Requer: {tree.branches.flatMap(b => b.nodes).find(x => x.id === n.requires)?.name} (Nvl 1)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* BOTÕES DE SUPORTE E RESET */}
              <div className="mt-4 pt-3 border-t border-amber-700/30 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (!stateRef.current) return;
                    if (
                      confirm("Redistribuir todos os talentos? Você receberá seus pontos de volta.")
                    ) {
                      respecTalents(stateRef.current);
                      if (stateRef.current) save(stateRef.current);
                    }
                  }}
                  className="w-full text-[10px] py-2 border border-red-600/50 bg-red-950/30 text-red-200 hover:bg-red-900/60 tracking-widest text-center font-bold cursor-pointer transition-all active:scale-95"
                >
                  🔄 REINICIAR ARVORE (RESPEC)
                </button>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setTalentsMinimized(true)}
                    className="flex-1 text-[10px] py-2 border border-amber-500/40 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40 tracking-widest text-center font-bold uppercase transition-all cursor-pointer rounded"
                  >
                    ➖ Minimizar
                  </button>
                  <button
                    onClick={() => setShowTalents(false)}
                    className="flex-1 text-[10px] py-2 border border-amber-600/50 bg-amber-950/60 text-amber-200 hover:bg-amber-800/60 tracking-widest text-center font-bold uppercase cursor-pointer rounded"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {showAmbitious && !ambitiousMinimized && g && amb && player && (
        <div
          className="fixed inset-0 z-35 flex items-center justify-center bg-black/85 backdrop-blur-md font-mono"
          onClick={() => setShowAmbitious(false)}
        >
          <div
            className="relative max-w-5xl w-[min(95vw,1000px)] bg-neutral-950 border-2 border-purple-600/60 p-6 font-mono text-purple-100 rounded-lg flex flex-col md:flex-row gap-6 max-h-[92vh] overflow-hidden shadow-2xl"
            style={{ 
              boxShadow: "0 0 50px rgba(124,58,237,0.35), inset 0 0 20px rgba(0,0,0,0.9)",
              backgroundImage: "radial-gradient(circle at center, #170d24 0%, #07030a 100%)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* SIDEBAR TABS */}
            <div className="w-full md:w-[240px] flex flex-col gap-1 border-r border-purple-900/30 pr-4 overflow-y-auto">
              <div className="text-[11px] font-bold tracking-[0.2em] text-purple-400 mb-2 pb-1 border-b border-purple-900/30 text-center uppercase">
                🌌 SISTEMAS DIVINOS
              </div>
              
              <button
                onClick={() => setAmbitiousTab("ascension")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "ascension"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                ✨ ASCENSÃO CELESTIAL
              </button>

              <button
                onClick={() => setAmbitiousTab("boss")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "boss"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                👑 BOSS DO MUNDO (MALKOR)
              </button>

              <button
                onClick={() => setAmbitiousTab("pets")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "pets"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                🐾 CRIADOURO DE PETS
              </button>

              <button
                onClick={() => setAmbitiousTab("mercenaries")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "mercenaries"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                🛡️ CONTRATO MERCENÁRIO
              </button>

              <button
                onClick={() => setAmbitiousTab("enchant")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "enchant"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                🔮 ENCANTAMENTO DE RUNAS
              </button>

              <button
                onClick={() => setAmbitiousTab("fleet")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "fleet"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                🚢 MARINHA DE RESGATE
              </button>

              <button
                onClick={() => setAmbitiousTab("rift")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "rift"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                🌀 FENDAS DIMENSIONAIS
              </button>

              <button
                onClick={() => setAmbitiousTab("codex")}
                className={`text-left text-[11px] font-bold px-3 py-2 border rounded transition-all duration-150 cursor-pointer ${
                  ambitiousTab === "codex"
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_8px_#a855f7]"
                    : "bg-black/40 text-purple-300 border-purple-900/40 hover:bg-purple-950/20"
                }`}
              >
                📜 CÓDICE & TÍTULOS
              </button>

              <div className="mt-auto pt-4 flex flex-col gap-2">
                <div className="bg-black/60 border border-purple-900/30 p-2 rounded text-[10px] text-purple-300/95 leading-relaxed text-center">
                  <div>🔥 EMBERS: <span className="font-bold text-amber-400">{amb.divineEmbers}</span></div>
                  <div className="mt-1">💰 OURO: <span className="font-bold text-yellow-500">{player.gold}</span></div>
                  <div className="mt-1">✨ ASCENSÕES: <span className="font-bold text-purple-400">{amb.ascensionCount}</span></div>
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => setAmbitiousMinimized(true)}
                    className="flex-1 text-[10px] py-1.5 border border-purple-500/50 bg-purple-950/20 hover:bg-purple-900/40 text-purple-200 font-bold uppercase transition-all cursor-pointer rounded"
                  >
                    Minimizar
                  </button>
                  <button
                    onClick={() => setShowAmbitious(false)}
                    className="flex-1 text-[10px] py-1.5 border border-purple-600/50 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-bold uppercase transition-all cursor-pointer rounded"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-[580px] pr-1">
              
              {/* --- TAB 1: ASCENSION --- */}
              {ambitiousTab === "ascension" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    ✨ ASCENSÃO CELESTIAL (REBIRTH DE ELITE)
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Sua jornada em Asterion atingiu proporções cósmicas! A Ascensão Celestial permite que você resete seu personagem do nível 100 de volta ao nível 1 em troca de poder supremo.
                  </p>
                  
                  <div className="bg-purple-950/25 border border-purple-700/30 p-3.5 rounded-lg">
                    <div className="text-xs font-bold text-purple-400 mb-2">🎁 BÔNUS DE ASCENSÃO DIVINA:</div>
                    <ul className="list-disc pl-5 text-[11px] text-purple-100/95 space-y-1.5 leading-relaxed">
                      <li>Bônus permanente de <span className="text-green-400 font-bold">+20% ATK</span> por nível de ascensão (Atual: <span className="text-green-400 font-black">+{amb.ascensionCount * 20}%</span>)</li>
                      <li>Bônus permanente de <span className="text-green-400 font-bold">+20% DEF</span> por nível de ascensão (Atual: <span className="text-green-400 font-black">+{amb.ascensionCount * 20}%</span>)</li>
                      <li>Receba <span className="text-amber-400 font-bold">300 Embers Divinas</span> para forjar encantamentos rúnicos.</li>
                      <li>Mantém todas as suas moedas de ouro, equipamentos, runas e talentos investidos!</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-black/50 p-3 border border-purple-900/20 rounded">
                    <div className="text-center p-2">
                      <div className="text-[10px] text-purple-400/80 font-bold">NÍVEL ATUAL</div>
                      <div className={`text-2xl font-black ${player.level >= 100 ? "text-green-400" : "text-red-400 animate-pulse"}`}>
                        {player.level}/100
                      </div>
                    </div>
                    <div className="text-center p-2 border-l border-purple-900/20">
                      <div className="text-[10px] text-purple-400/80 font-bold">ASCENSÕES TOTAIS</div>
                      <div className="text-2xl font-black text-amber-400">
                        {amb.ascensionCount}
                      </div>
                    </div>
                  </div>

                  {/* --- ÁRVORE DE PERKS DE ASCENSÃO CELESTIAL --- */}
                  <div className="bg-black/35 border border-purple-900/40 rounded-lg p-3.5 mt-2 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-purple-900/30 pb-2">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        🌳 ÁRVORE DE TALENTOS DIVINOS
                      </div>
                      <div className="text-[10px] font-black text-amber-400 flex items-center gap-1 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded">
                        🔥 Cinzas: {amb.divineEmbers || 0}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { key: "garras", name: "Garras Divinas", desc: "+5% Dano Crítico por nv", icon: "⚔️" },
                        { key: "casca", name: "Casca de Titã", desc: "+5% Defesa por nv", icon: "🛡️" },
                        { key: "fluxo", name: "Fluxo Sideral", desc: "+3% Velocidade por nv", icon: "⚡" },
                        { key: "furia", name: "Fúria Recorrente", desc: "+10% Recarga Ult por nv", icon: "🔥" }
                      ].map(perk => {
                        const lvl = amb.ascensionPerks?.[perk.key as "garras"|"casca"|"fluxo"|"furia"] || 0;
                        const cost = lvl + 1;
                        const canUpgrade = lvl < 5 && (amb.divineEmbers || 0) >= cost;
                        return (
                          <div key={perk.key} className="bg-purple-950/15 border border-purple-900/30 p-2 rounded flex flex-col justify-between gap-2.5">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] font-bold text-purple-200">{perk.icon} {perk.name}</span>
                                <span className="text-[10px] font-black text-amber-400 bg-amber-950/20 px-1 rounded">{lvl}/5</span>
                              </div>
                              <p className="text-[9px] text-purple-300/80 leading-tight mt-1">{perk.desc}</p>
                            </div>

                            <button
                              onClick={() => {
                                buyAscensionPerk(g, perk.key as any);
                                forceUpdate();
                                save(g);
                              }}
                              disabled={!canUpgrade}
                              className={`w-full py-1 text-[9px] font-bold border rounded uppercase transition-all ${
                                lvl >= 5
                                  ? "bg-emerald-950/25 border-emerald-900/40 text-emerald-400 cursor-default"
                                  : canUpgrade
                                    ? "bg-amber-600/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30 cursor-pointer"
                                    : "bg-neutral-900/40 border-neutral-800 text-neutral-500 cursor-not-allowed"
                              }`}
                            >
                              {lvl >= 5 ? "MÁXIMO" : `MELHORAR (${cost} 🔥)`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (confirm("Você tem certeza de que deseja realizar a Ascensão Celestial? Seu nível retornará para 1, mas você herdará o poder dos deuses!")) {
                          triggerDivineAscension(g);
                          save(g);
                        }
                      }}
                      disabled={player.level < 100}
                      className={`w-full py-3 border-2 font-bold tracking-widest text-center text-xs rounded uppercase transition-all duration-200 active:scale-95 ${
                        player.level >= 100
                          ? "bg-purple-600 border-purple-400 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      {player.level >= 100 ? "✨ ASCENDER À DIVINDADE ✨" : "🚨 REQUER NÍVEL 100 PARA ASCENDER 🚨"}
                    </button>
                    {player.level < 100 && (
                      <span className="text-[10px] text-red-400/70 mt-2">
                        Ganhe XP lutando em cavernas profundas para atingir o nível 100!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB 2: WORLD BOSS --- */}
              {ambitiousTab === "boss" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    👑 BOSS DO MUNDO: MALKOR, O DEVORADOR DE ÉTER
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Malkor é um titã ancestral de puro vácuo que invade a capital principal. Seus lasers estilhaçam os heróis descuidados, mas suas cinzas rendem tesouros lendários e minérios sagrados.
                  </p>

                  <div className="bg-black/50 border border-purple-900/30 p-4 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-purple-400">STATUS DO BOSS DE MUNDO:</div>
                      {amb.worldBoss?.active ? (
                        <div className="text-red-400 font-bold text-xs mt-1 animate-pulse">
                          🔴 MALKOR ESTÁ ATIVO NA CAPITAL!
                        </div>
                      ) : (
                        <div className="text-green-400 font-bold text-xs mt-1">
                          🟢 Dormente (Próximo surto em {Math.round(amb.worldBossTimer)}s)
                        </div>
                      )}
                    </div>
                    {amb.worldBoss?.active && (
                      <div className="text-right">
                        <div className="text-[9px] text-purple-400">VIDA DO BOSS:</div>
                        <div className="text-sm font-black text-red-500 font-mono">
                          {Math.round(amb.worldBoss.hp)} / {amb.worldBoss.maxHp}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-950/20 border border-purple-700/30 p-3 rounded text-[11px] text-purple-100/95 leading-relaxed">
                    <span className="font-bold text-amber-400">Drops de Malkor:</span> Garante toneladas de Ouro, Embers Divinas, Ração Mística e o prestigiado título de <span className="text-red-400 font-bold">"Exterminador de Malkor"</span> (+15% ATK/DEF).
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => {
                        if (amb.divineEmbers < 100) {
                          alert("Você não possui Embers Divinas suficientes (Requer 100).");
                          return;
                        }
                        triggerWorldBoss(g);
                        save(g);
                      }}
                      disabled={amb.worldBoss?.active}
                      className={`w-full py-2.5 border font-bold text-[11px] tracking-wider text-center rounded uppercase transition-colors ${
                        !amb.worldBoss?.active && amb.divineEmbers >= 100
                          ? "bg-amber-600 border-amber-400 text-white hover:bg-amber-500 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      {amb.worldBoss?.active 
                        ? "Malkor já está à solta na Capital!" 
                        : `FORÇAR SURGIMENTO DE MALKOR (-100 Embers Divinas)`}
                    </button>
                    <p className="text-[10px] text-purple-400/70 text-center mt-2">
                      Malkor surge ao lado da grande estátua de Asterion na Capital Principal. Prepare sua melhor estratégia!
                    </p>
                  </div>
                </div>
              )}

              {/* --- TAB 3: PETS --- */}
              {ambitiousTab === "pets" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    🐾 CRIADOURO DE PETS MÍSTICOS
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Seus pets auxiliam você concedendo bônus mágicos contínuos. Eles evoluem ao devorar monstros ou ao serem alimentados com ração.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {amb.pets?.map((pet: any) => {
                      let desc = "";
                      let icon = "🐾";
                      if (pet.type === "egg") { desc = "Choque alimentando ou em combate!"; icon = "🥚"; }
                      else if (pet.type === "fire") { desc = "+15% Dano de Ataque"; icon = "🔥"; }
                      else if (pet.type === "ice") { desc = "+15% Defesa Geral"; icon = "❄️"; }
                      else if (pet.type === "lightning") { desc = "+15% Velocidade"; icon = "⚡"; }
                      else if (pet.type === "healing") { desc = "+30 Regeneração HP/seg"; icon = "🧚"; }
                      else if (pet.type === "hybrid") {
                        const hType = pet.hybridType || "fire_ice";
                        if (hType === "fire_ice") { desc = "Fogo Glacial: Dano de fogo + lentidão de gelo"; icon = "🔥❄️"; }
                        else if (hType === "lightning_healing") { desc = "Choque Curativo: Corrente elétrica + auto-cura"; icon = "⚡🧚"; }
                        else if (hType === "fire_lightning") { desc = "Trovoada Explosiva: Ataques explosivos massivos"; icon = "🔥⚡"; }
                        else if (hType === "ice_healing") { desc = "Jade Anciã: Regeneração de HP + Escudos de gelo"; icon = "❄️🧚"; }
                      }

                      const active = pet.active;
                      const maxVal = pet.nextLvlXp || pet.maxXp || 100;
                      const progress = Math.min(100, (pet.xp / maxVal) * 100);

                      return (
                        <div 
                          key={pet.id} 
                          onClick={() => {
                            // Toggle active
                            amb.pets.forEach((p: any) => p.active = false);
                            pet.active = !active;
                            logMsg(g, pet.active ? `Pet ${pet.name} ativado!` : `Pet desativado.`, "#c084fc");
                            save(g);
                            forceUpdate();
                          }}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-150 relative ${
                            active 
                              ? "bg-purple-950/45 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]" 
                              : "bg-black/50 border-purple-900/30 hover:border-purple-600/40"
                          }`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">
                              ATIVO
                            </span>
                          )}
                          <div className="flex gap-3 items-center">
                            <span className="text-2xl">{icon}</span>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-purple-200">{pet.name}</div>
                              <div className="text-[9px] text-purple-400 mt-0.5 font-bold uppercase">{pet.rarity} • Nível {pet.level}</div>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-purple-200/70 mt-2 italic">
                            Efeito: <span className="text-green-400 font-bold">{desc}</span>
                          </div>

                          <div className="mt-2.5">
                            <div className="flex justify-between text-[8px] text-purple-400/90 font-bold mb-1">
                              <span>EXPERIÊNCIA (XP)</span>
                              <span>{Math.round(pet.xp)}/{maxVal}</span>
                            </div>
                            <div className="w-full bg-neutral-900 h-1.5 rounded overflow-hidden">
                              <div className="bg-purple-500 h-full" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ADQUIRIR NOVO OVO DE PET */}
                  <div className="bg-black/45 border border-purple-900/40 rounded-lg p-3.5 mt-1 flex flex-col gap-2.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 border-b border-purple-900/20 pb-2">
                      🥚 MERCADO DE OVOS MÍSTICOS
                    </div>
                    <p className="text-[10px] text-purple-300/80 leading-relaxed">
                      Adquira novos ovos místicas de pets para chocar ou para usar como ingrediente em mutações raras no Altar.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => {
                          const ok = buyPetEgg(g, "gold");
                          if (ok) {
                            forceUpdate();
                            save(g);
                          } else {
                            alert("Ouro insuficiente para comprar o ovo (Custo: 15.000 Ouro)!");
                          }
                        }}
                        className="bg-amber-950/20 hover:bg-amber-900/35 border border-amber-500/30 text-amber-300 hover:text-amber-100 py-2 rounded text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                      >
                        <span>COMPRAR COM OURO</span>
                        <span className="text-[9px] text-amber-400 font-black">🪙 15.000g</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const ok = buyPetEgg(g, "embers");
                          if (ok) {
                            forceUpdate();
                            save(g);
                          } else {
                            alert("Cinzas Divinas insuficientes para comprar o ovo (Custo: 5 Cinzas 🔥)!");
                          }
                        }}
                        className="bg-purple-950/20 hover:bg-purple-900/35 border border-purple-500/30 text-purple-300 hover:text-purple-100 py-2 rounded text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                      >
                        <span>COMPRAR COM CINZAS</span>
                        <span className="text-[9px] text-purple-400 font-black">🔥 5 Cinzas</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/60 border border-purple-900/30 p-3 rounded-lg flex justify-between items-center mt-3">
                    <div>
                      <div className="text-xs font-bold text-purple-400">RAÇÃO MÍSTICA DISPONÍVEL:</div>
                      <div className="text-sm font-black text-amber-400 mt-1">🌾 {amb.petFood} unidades</div>
                    </div>
                    <button
                      onClick={() => {
                        const activePet = amb.pets.find((p: any) => p.active);
                        if (!activePet) {
                          alert("Selecione um Pet Ativo primeiro clicando em um cartão de pet.");
                          return;
                        }
                        if (amb.petFood <= 0) {
                          alert("Você não possui Ração Mística (pode ser adquirida via frotas ou rifts).");
                          return;
                        }
                        feedActivePet(g);
                        save(g);
                      }}
                      disabled={amb.petFood <= 0}
                      className={`px-4 py-2 border font-bold text-[10px] tracking-wider rounded uppercase cursor-pointer ${
                        amb.petFood > 0
                          ? "bg-purple-600 border-purple-400 hover:bg-purple-500 text-white"
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      Alimentar Pet (+25 XP)
                    </button>
                  </div>

                  {/* --- ALTAR DE MUTAÇÃO DE MASCOTES --- */}
                  <div className="bg-black/45 border border-purple-800/40 rounded-lg p-3.5 mt-3 flex flex-col gap-3">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 border-b border-purple-900/30 pb-2">
                      🧪 ALTAR DE SÍNTESE E MUTAÇÃO (BETA)
                    </div>
                    <p className="text-[10px] text-purple-300/80 leading-relaxed">
                      Combine dois mascotes diferentes de **Nível 5 ou superior** para transmutar um novo **Mascote Híbrido Mutante** com habilidades elementais duplas! *Os pais originais serão sacrificados.*
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[9px] font-bold text-purple-400 block mb-1">MASC. PROVENIENTE 1:</label>
                        <select
                          value={synthParent1}
                          onChange={(e) => setSynthParent1(e.target.value)}
                          className="w-full bg-black/60 border border-purple-900/40 rounded p-1.5 text-xs text-purple-200 outline-none"
                        >
                          <option value="">-- Selecionar --</option>
                          {amb.pets?.filter((p: any) => p.level >= 5 && p.type !== "hybrid" && p.id !== synthParent2).map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Nv {p.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-purple-400 block mb-1">MASC. PROVENIENTE 2:</label>
                        <select
                          value={synthParent2}
                          onChange={(e) => setSynthParent2(e.target.value)}
                          className="w-full bg-black/60 border border-purple-900/40 rounded p-1.5 text-xs text-purple-200 outline-none"
                        >
                          <option value="">-- Selecionar --</option>
                          {amb.pets?.filter((p: any) => p.level >= 5 && p.type !== "hybrid" && p.id !== synthParent1).map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Nv {p.level})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* PREVISÃO DE RESULTADO DA MUTAÇÃO */}
                    {(() => {
                      const p1Obj = amb.pets?.find((pt: any) => pt.id === synthParent1);
                      const p2Obj = amb.pets?.find((pt: any) => pt.id === synthParent2);
                      if (!p1Obj || !p2Obj) return null;
                      const types = [p1Obj.type, p2Obj.type];
                      
                      let resName = "Quimera Elemental (Épico)";
                      let resDesc = "Um elemental versátil com poderes caóticos mutáveis.";
                      let resIcon = "🧬";

                      if (types.includes("fire") && types.includes("ice")) {
                        resName = "Dragão Glacial (Épico/Lendário)";
                        resDesc = "Ataques mesclam chamas ardentes e temperaturas subzero, retardando inimigos e causando dano devastador.";
                        resIcon = "🔥❄️";
                      } else if (types.includes("lightning") && types.includes("healing")) {
                        resName = "Espírito da Tempestade Curadora (Épico/Lendário)";
                        resDesc = "Sincroniza descargas elétricas em cadeia nos monstros enquanto cura continuamente as feridas do mestre.";
                        resIcon = "⚡🧚";
                      } else if (types.includes("fire") && types.includes("lightning")) {
                        resName = "Fênix do Trovão (Épico/Lendário)";
                        resDesc = "Libera trovoadas explosivas altamente destrutivas no inimigo mais próximo.";
                        resIcon = "🔥⚡";
                      } else if (types.includes("ice") && types.includes("healing")) {
                        resName = "Tartaruga de Jade Anciã (Épico/Lendário)";
                        resDesc = "Provê restauração vital e solidifica escudos defensivos ao redor do mestre.";
                        resIcon = "❄️🧚";
                      }

                      return (
                        <div className="bg-purple-950/20 border border-purple-800/40 p-2.5 rounded text-[10px] flex flex-col gap-1 animate-pulse">
                          <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wide">🧙‍♂️ PREVISÃO DA TRANSMUTAÇÃO:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{resIcon}</span>
                            <div>
                              <div className="font-bold text-purple-200 text-xs">{resName}</div>
                              <p className="text-[9px] text-purple-300/80 leading-snug mt-0.5">{resDesc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <button
                      onClick={() => {
                        if (!synthParent1 || !synthParent2) {
                          alert("Por favor, selecione ambos os mascotes de nível 5+ para sintetização!");
                          return;
                        }
                        if (confirm("Você tem certeza de que deseja fundir estes mascotes? Eles serão consumidos permanentemente para gerar um novo híbrido nível 1!")) {
                          const ok = synthesizeHybridPet(g, synthParent1, synthParent2);
                          if (ok) {
                            setSynthParent1("");
                            setSynthParent2("");
                            forceUpdate();
                            save(g);
                          }
                        }
                      }}
                      disabled={!synthParent1 || !synthParent2}
                      className={`w-full py-2 border font-bold text-[10px] tracking-wider rounded uppercase cursor-pointer transition-all duration-150 ${
                        synthParent1 && synthParent2
                          ? "bg-amber-600 border-amber-400 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      🧪 INICIAR TRANSFORMAÇÃO DE MUTANTE 🧪
                    </button>
                  </div>
                </div>
              )}

              {/* --- TAB 4: MERCENARIES --- */}
              {ambitiousTab === "mercenaries" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300 flex justify-between items-center">
                    <span>🛡️ CONTRATO DE MERCENÁRIOS DE ELITE</span>
                    <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded text-purple-400 font-mono">
                      {amb.mercenaries?.filter((x: any) => x.hp > 0).length || 1} / 22 CONTRATADOS
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Contrate e convoque os guerreiros mais destemidos do continente de Asterion. Você pode manter múltiplos contratados, mas apenas **1 mercenário ativo** pode lutar ao seu lado por vez. Eles atacam monstros de forma autônoma!
                  </p>

                  <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                    {amb.mercenaries?.map((m: any) => {
                      const icon = m.role === "Mago" ? "🔮" : m.role === "Sacerdote" ? "✨" : "🛡️";
                      const bought = m.hp > 0;
                      const active = m.active;
                      const tmpl = MERCENARY_CATALOG.find((x: any) => x.id === m.id);
                      const cost = m.cost || tmpl?.cost || 1500;
                      const reqLevel = m.reqLevel || tmpl?.reqLevel || 1;
                      const description = m.description || tmpl?.description || "Ajudante valoroso em batalhas.";
                      const isLevelLocked = player.level < reqLevel;
                      const isGoldLocked = player.gold < cost;

                      return (
                        <div 
                          key={m.id}
                          className={`p-3 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${
                            active
                              ? "bg-purple-950/35 border-purple-400 shadow-[0_0_12px_#a855f722]"
                              : bought
                                ? "bg-black/45 border-purple-900/40 hover:border-purple-800/60"
                                : "bg-neutral-950/20 border-neutral-900 text-neutral-400"
                          }`}
                        >
                          <div className="flex gap-3 items-center flex-1">
                            <span className={`text-xl p-2.5 rounded border ${
                              active 
                                ? "bg-purple-900/50 border-purple-400" 
                                : bought 
                                  ? "bg-purple-950/40 border-purple-900/40 text-purple-300" 
                                  : "bg-neutral-900/60 border-neutral-800 text-neutral-500"
                            }`}>{icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className={`text-xs font-bold ${active ? "text-purple-300" : bought ? "text-purple-100" : "text-neutral-400"}`}>
                                  {m.name}
                                </div>
                                {!bought && (
                                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-900/40">
                                    Nvl {reqLevel}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-purple-400/90 font-bold uppercase mt-0.5 flex items-center gap-2">
                                <span>Classe: {m.role}</span>
                                {bought && <span className="text-purple-600">•</span>}
                                {bought && <span className="text-purple-300 font-mono">Nvl {m.level}</span>}
                              </div>
                              <div className="text-[9px] text-purple-300/75 mt-1 leading-relaxed italic max-w-md">
                                {description}
                              </div>
                              {bought && (
                                <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] text-purple-400">
                                  <span>❤️ HP: {m.maxHp}</span>
                                  <span>⚔️ ATK: {m.atk}</span>
                                  <span>🛡️ DEF: {m.def}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full md:w-auto flex md:flex-col items-end gap-2 shrink-0 self-stretch md:self-auto justify-between md:justify-center">
                            {bought ? (
                              <button
                                onClick={() => {
                                  const wasActive = m.active;
                                  amb.mercenaries.forEach((x: any) => x.active = false);
                                  m.active = !wasActive;
                                  logMsg(g, m.active ? `${m.name} convocado para o combate!` : `${m.name} retornou à taberna.`, m.color);
                                  save(g);
                                }}
                                className={`w-full md:w-32 py-1.5 border font-bold text-[9px] tracking-wider rounded uppercase cursor-pointer transition-all ${
                                  active
                                    ? "bg-red-950/40 border-red-500 hover:bg-red-900/40 text-red-200"
                                    : "bg-purple-600 border-purple-400 hover:bg-purple-500 text-white"
                                }`}
                              >
                                {active ? "DISPENSAR" : "CONVOCAR"}
                              </button>
                            ) : (
                              <div className="w-full md:w-auto flex flex-col gap-1 items-stretch md:items-end">
                                <button
                                  disabled={isLevelLocked || isGoldLocked}
                                  onClick={() => {
                                    if (player.level < reqLevel) {
                                      alert(`Você precisa ter nível ${reqLevel} para recrutar este herói.`);
                                      return;
                                    }
                                    if (player.gold < cost) {
                                      alert(`Você não possui Ouro suficiente (Requer ${cost.toLocaleString()}💰).`);
                                      return;
                                    }
                                    player.gold -= cost;
                                    const startingHp = tmpl?.maxHp || 300;
                                    m.hp = m.maxHp = startingHp;
                                    m.level = 1;
                                    m.atk = tmpl?.atk || 45;
                                    m.def = tmpl?.def || 10;
                                    logMsg(g, `Mercenário ${m.name} contratado com sucesso!`, m.color);
                                    save(g);
                                  }}
                                  className={`w-full md:w-36 py-1.5 border font-bold text-[9px] tracking-wider rounded uppercase cursor-pointer transition-all ${
                                    isLevelLocked || isGoldLocked
                                      ? "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
                                      : "border-amber-500 bg-amber-950/45 hover:bg-amber-800 text-amber-200"
                                  }`}
                                >
                                  RECRUTAR ({cost.toLocaleString()}💰)
                                </button>
                                {isLevelLocked && (
                                  <div className="text-[8px] text-red-400 font-bold uppercase tracking-wider text-right">
                                    ⚠️ Requer nível {reqLevel}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- TAB 5: ENCHANT --- */}
              {ambitiousTab === "enchant" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    🔮 ESTAÇÃO DE ENCANTAMENTO DE RUNAS
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Injete o power das Embers Divinas diretamente nas suas engrenagens. Os encantamentos rúnicos conferem efeitos utilitários colossais passivos ao seu herói.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* ARMOR ENCHANTMENT */}
                    <div className="p-4 border border-purple-900/40 bg-black/50 rounded-lg flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-purple-300 border-b border-purple-900/30 pb-1 mb-2">
                          🛡️ ENCANTAMENTO DE ARMADURA
                        </div>
                        <div className="text-[11px] text-purple-400 font-bold mb-1">Encantamento Atual:</div>
                        <div className="text-sm font-black text-white font-mono bg-purple-950/40 px-2 py-1 rounded inline-block">
                          {amb.enchantments?.armor || "Nenhum"}
                        </div>
                        <p className="text-[10px] text-purple-300/80 mt-3 leading-relaxed">
                          Role um encantamento defensivo lendário para sua armadura!
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (amb.divineEmbers < 50) {
                            alert("Você não possui Embers Divinas suficientes (Requer 50).");
                            return;
                          }
                          amb.divineEmbers -= 50;
                          const pool = [
                            "Iron Shell (+15% DEF)",
                            "Thorn Mail (+15% Reflect)",
                            "Holy Blessing (+20% Heal Rec)",
                            "Shadow Cloak (+10% Dodge)"
                          ];
                          const rolled = pool[Math.floor(Math.random() * pool.length)];
                          amb.enchantments.armor = rolled;
                          logMsg(g, `Armadura encantada com: ${rolled}!`, "#c084fc");
                          save(g);
                        }}
                        className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] border border-purple-400 rounded uppercase tracking-wider cursor-pointer"
                      >
                        ENCANTAR ARMADURA (50 Embers)
                      </button>
                    </div>

                    {/* WEAPON ENCHANTMENT */}
                    <div className="p-4 border border-purple-900/40 bg-black/50 rounded-lg flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-purple-300 border-b border-purple-900/30 pb-1 mb-2">
                          ⚔️ ENCANTAMENTO DE ARMA
                        </div>
                        <div className="text-[11px] text-purple-400 font-bold mb-1">Encantamento Atual:</div>
                        <div className="text-sm font-black text-white font-mono bg-purple-950/40 px-2 py-1 rounded inline-block">
                          {amb.enchantments?.weapon || "Nenhum"}
                        </div>
                        <p className="text-[10px] text-purple-300/80 mt-3 leading-relaxed">
                          Role um encantamento ofensivo ultra poderoso para suas armas de combate!
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (amb.divineEmbers < 50) {
                            alert("Você não possui Embers Divinas suficientes (Requer 50).");
                            return;
                          }
                          amb.divineEmbers -= 50;
                          const pool = [
                            "Holy Fire (+12% ATK)",
                            "Lifesteal (+8% Vamp)",
                            "Shadow Strike (+15% Crit)",
                            "Frost Touch (Freeze enemy speed)"
                          ];
                          const rolled = pool[Math.floor(Math.random() * pool.length)];
                          amb.enchantments.weapon = rolled;
                          logMsg(g, `Arma encantada com: ${rolled}!`, "#c084fc");
                          save(g);
                        }}
                        className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] border border-purple-400 rounded uppercase tracking-wider cursor-pointer"
                      >
                        ENCANTAR ARMA (50 Embers)
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* --- TAB 6: FLEET --- */}
              {ambitiousTab === "fleet" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    🚢 MARINHA DE RESGATE E EXPEDIÇÃO MARÍTIMA
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Envie seus caravels em expedições distantes para coletar rações raras, minérios raros e embers rúnicas de terras esquecidas.
                  </p>

                  <div className="flex flex-col gap-3">
                    {amb.sailingCaravels?.map((caravel: any) => {
                      const busy = caravel.timer > 0;
                      
                      return (
                        <div key={caravel.id} className="p-3.5 border border-purple-900/40 bg-black/50 rounded-lg">
                          <div className="flex justify-between items-center border-b border-purple-900/20 pb-1.5 mb-2">
                            <span className="text-xs font-bold text-purple-200">🚢 Caravela #{caravel.id} ({caravel.name})</span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${busy ? "bg-amber-600 text-white animate-pulse" : "bg-green-600 text-white"}`}>
                              {busy ? `Navegando...` : "Ancorada no Porto"}
                            </span>
                          </div>

                          {busy ? (
                            <div className="mt-2 text-center p-2">
                              <div className="text-xs text-purple-400 font-bold mb-1">Retorno previsto em: {Math.round(caravel.timer)}s</div>
                              <div className="w-full bg-neutral-900 h-2 rounded overflow-hidden">
                                <div className="bg-amber-500 h-full animate-pulse" style={{ width: `${(1 - caravel.timer / 60) * 100}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="text-[10px] text-purple-400 font-bold">
                                Escolha uma expedição:
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => {
                                    if (player.gold < 300) {
                                      alert("Você não possui ouro suficiente!");
                                      return;
                                    }
                                    player.gold -= 300;
                                    caravel.timer = 40; // 40 seconds
                                    caravel.expeditionType = "short";
                                    logMsg(g, `Caravela #${caravel.id} partiu rumo ao Recife de Coral!`, "#e9d5ff");
                                    save(g);
                                  }}
                                  className="px-3 py-1 bg-purple-900/50 hover:bg-purple-800 text-[9px] font-bold border border-purple-500 rounded text-purple-200 cursor-pointer"
                                >
                                  Recife Coral (-300💰, 40s)
                                </button>
                                <button
                                  onClick={() => {
                                    if (player.gold < 1000) {
                                      alert("Você não possui ouro suficiente!");
                                      return;
                                    }
                                    player.gold -= 1000;
                                    caravel.timer = 100; // 100 seconds
                                    caravel.expeditionType = "long";
                                    logMsg(g, `Caravela #${caravel.id} partiu rumo ao Triângulo de Cinzas!`, "#e9d5ff");
                                    save(g);
                                  }}
                                  className="px-3 py-1 bg-purple-900/50 hover:bg-purple-800 text-[9px] font-bold border border-purple-500 rounded text-purple-200 cursor-pointer"
                                >
                                  Triângulo Cinzas (-1000💰, 100s)
                                </button>
                              </div>
                            </div>
                          )}

                          {caravel.timer <= 0 && caravel.expeditionType && (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  const type = caravel.expeditionType;
                                  caravel.expeditionType = "";
                                  if (type === "short") {
                                    player.gold += 600;
                                    amb.petFood += 1;
                                    logMsg(g, `Caravela retornou! +600💰 e +1 Ração Mística!`, "#a855f7");
                                  } else {
                                    player.gold += 2000;
                                    amb.divineEmbers += 25;
                                    logMsg(g, `Caravela retornou! +2000💰 e +25 Embers Divinas!`, "#a855f7");
                                  }

                                  // Refinement system: Maritime Relic Discovery
                                  const relicsList = ["🧭 Bússola do Destino", "🔱 Tridente de Netuno", "🐚 Pérola de Éter"];
                                  if (!amb.discoveredRelics) amb.discoveredRelics = [];
                                  if (Math.random() < 0.35) {
                                    const missing = relicsList.filter(r => !amb.discoveredRelics.includes(r));
                                    if (missing.length > 0) {
                                      const found = missing[Math.floor(Math.random() * missing.length)];
                                      amb.discoveredRelics.push(found);
                                      (player as any).discoveredRelics = amb.discoveredRelics;
                                      logMsg(g, `🎁 RELÍQUIA ENCONTRADA: Sua carruagem náutica resgatou o artefato lendário: ${found}!`, "#fbbf24");
                                    }
                                  }

                                  save(g);
                                }}
                                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[10px] rounded uppercase shadow-[0_0_10px_rgba(234,179,8,0.4)] cursor-pointer"
                              >
                                🎁 COLETAR RECOMPENSAS
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- TAB 7: RIFT --- */}
              {ambitiousTab === "rift" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    🌀 FENDAS DIMENSIONAIS DO BEYOND
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Eventos de ruptura na realidade! Quando uma fenda surge, um portal misterioso aparece no mapa. Derrote monstros dentro da zona de influência da fenda para selá-la.
                  </p>

                  <div className="bg-black/50 border border-purple-900/40 p-4 rounded-lg">
                    <div className="text-xs font-bold text-purple-400 mb-1">ESTADO DA FENDA DIMENSIONAL:</div>
                    {amb.riftActive ? (
                      <div>
                        <div className="text-red-400 font-bold text-xs mt-1 animate-pulse">
                          🔴 UMA FENDA ESTÁ ABERTA NA COORDENADA ({Math.round(amb.riftPos?.x)}, {Math.round(amb.riftPos?.y)})!
                        </div>
                        <div className="text-[11px] text-purple-300 mt-2">
                          Progresso de Selamento: <span className="font-bold text-white">{amb.riftKillsProgress} / {amb.riftKillsNeeded}</span> monstros derrotados.
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold mt-1.5 uppercase">
                          Modificador Ativo: ⚠️ Dano de monstros duplicado!
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-green-400 font-bold text-xs mt-1">
                          🟢 Estável (Próxima abertura natural em {Math.round(amb.riftTimer)}s)
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {amb.riftActive ? (
                      <button
                        onClick={() => {
                          if (amb.riftPos) {
                            player.pos.x = amb.riftPos.x;
                            player.pos.y = amb.riftPos.y + 40;
                            logMsg(g, `Teletransportado para as coordenadas da Fenda!`, "#38bdf8");
                            setShowAmbitious(false);
                          }
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs border border-indigo-400 rounded uppercase tracking-wider cursor-pointer"
                      >
                        🌀 TELETRANSPORTAR PARA A FENDA IMEDIATAMENTE
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (player.gold < 3000) {
                            alert("Você não possui Ouro suficiente (Requer 3000💰).");
                            return;
                          }
                          player.gold -= 3000;
                          triggerDimensionalRift(g);
                          save(g);
                        }}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs border border-purple-400 rounded uppercase tracking-wider cursor-pointer"
                      >
                        ABRIR FENDA ARTIFICIAL (-3000💰)
                      </button>
                    )}

                    {amb.riftActive && amb.riftKillsProgress >= amb.riftKillsNeeded && (
                      <button
                        onClick={() => {
                          claimRiftReward(g);
                          save(g);
                        }}
                        className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded uppercase shadow-[0_0_15px_rgba(234,179,8,0.5)] cursor-pointer"
                      >
                        🎁 RECLAMAR RECOMPENSA DE FENDA SELADA (+75 Embers)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB 8: CODEX --- */}
              {ambitiousTab === "codex" && (
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold border-b border-purple-900/30 pb-1 text-purple-300">
                    📜 CÓDICE E TÍTULOS DE ASTERION
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Seu recorde de assassinatos de monstros de elite e biomas destrava títulos honorários imponentes. Equipe um título para exibi-lo acima de sua cabeça na preview!
                  </p>

                  <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-2">
                    {[
                      { id: "Aventureiro", name: "✦ Aventureiro ✦", req: "Padrão", bonus: "Nenhum", condition: () => true },
                      { id: "Mestre das Lâminas", name: "✦ Mestre das Lâminas ✦", req: "Matar 25 monstros", bonus: "+5% ATK", condition: () => g.kills >= 25 },
                      { id: "Arquimago Divino", name: "✦ Arquimago Divino ✦", req: "Matar 50 monstros", bonus: "+10% ATK", condition: () => g.kills >= 50 },
                      { id: "Exterminador de Malkor", name: "✦ Exterminador de Malkor ✦", req: "Derrotar Malkor", bonus: "+15% ATK & +15% DEF", condition: () => amb.ascensionCount >= 1 || g.kills >= 100 },
                      { id: "Divindade Suprema", name: "✦ Divindade Suprema ✦", req: "Realizar uma Ascensão", bonus: "+25% ATK & +25% DEF", condition: () => amb.ascensionCount >= 1 },
                    ].map((title) => {
                      const unlocked = title.condition();
                      const equipped = amb.activeTitle === title.id;

                      return (
                        <div 
                          key={title.id}
                          className={`p-3 border rounded flex justify-between items-center ${
                            equipped 
                              ? "bg-purple-950/45 border-purple-400" 
                              : unlocked 
                                ? "bg-black/50 border-purple-900/30" 
                                : "bg-neutral-900/30 border-neutral-900/40 opacity-55"
                          }`}
                        >
                          <div>
                            <div className={`text-xs font-bold ${equipped ? "text-amber-400" : "text-purple-200"}`}>
                              {title.name}
                            </div>
                            <div className="text-[9px] text-purple-400 font-medium mt-0.5">
                              Requisito: {title.req}
                            </div>
                            <div className="text-[10px] text-green-400 font-bold mt-1">
                              Bônus: {title.bonus}
                            </div>
                          </div>

                          <div>
                            {equipped ? (
                              <span className="text-[9px] font-bold text-amber-400 tracking-wider font-mono">EQUIPADO</span>
                            ) : unlocked ? (
                              <button
                                onClick={() => {
                                  amb.activeTitle = title.id;
                                  g.playerTitle = title.id;
                                  logMsg(g, `Título equipado: ${title.id}!`, "#fbbf24");
                                  save(g);
                                }}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] rounded uppercase cursor-pointer"
                              >
                                Equipar
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-red-500">BLOQUEADO</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Minimized Talents Floater Panel */}
      {showTalents && talentsMinimized && (
        <div
          className="fixed bottom-4 right-4 z-40 p-3 bg-neutral-950/95 border border-amber-500/60 rounded-lg shadow-2xl flex flex-col gap-2 w-64 pointer-events-auto font-mono text-amber-100"
          style={{
            boxShadow: "0 0 20px rgba(180,83,9,0.4), inset 0 0 10px rgba(0,0,0,0.8)",
            backgroundImage: "radial-gradient(circle at center, #1c0f05 0%, #0a0502 100%)"
          }}
        >
          <div className="flex justify-between items-center border-b border-amber-900/40 pb-1.5">
            <span className="text-[10px] font-black tracking-wider text-amber-400 flex items-center gap-1">
              <span>🍁 TALENTOS</span>
              <span className="text-[9px] text-amber-500/80">({p.cls.toUpperCase()})</span>
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTalentsMinimized(false)}
                className="px-1.5 py-0.5 text-[9px] bg-amber-900/40 border border-amber-500/40 hover:bg-amber-800 text-amber-200 rounded cursor-pointer transition-all active:scale-95 font-bold"
                title="Restaurar Árvore"
              >
                ⛶ EXPANDIR
              </button>
              <button
                onClick={() => {
                  setShowTalents(false);
                  setTalentsMinimized(false);
                }}
                className="px-1.5 py-0.5 text-[9px] bg-red-950/55 border border-red-500/40 hover:bg-red-900 text-red-200 rounded cursor-pointer font-bold"
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="text-[10px] flex justify-between items-center bg-black/40 p-1.5 border border-amber-900/20 rounded">
            <span className="text-amber-200/80">Pontos Disponíveis:</span>
            <span className="font-black text-amber-300 text-xs animate-pulse bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20">{p.talentPoints}</span>
          </div>
          <button
            onClick={() => {
              if (confirm("Redistribuir todos os talentos? Você receberá seus pontos de volta.")) {
                respecTalents(g);
                save(g);
              }
            }}
            className="w-full text-[8.5px] py-1 border border-red-800/40 bg-red-950/20 hover:bg-red-900/30 text-red-300 font-bold uppercase transition-all rounded cursor-pointer"
          >
            🔄 Resetar Árvore (Respec)
          </button>
        </div>
      )}

      {/* Minimized Divine Altar (Ambitious) Floater Panel */}
      {showAmbitious && ambitiousMinimized && g && amb && player && (
        <div
          className="fixed bottom-4 left-4 z-40 p-3 bg-neutral-950/95 border border-purple-500/60 rounded-lg shadow-2xl flex flex-col gap-2 w-64 pointer-events-auto font-mono text-purple-100"
          style={{
            boxShadow: "0 0 20px rgba(124,58,237,0.4), inset 0 0 10px rgba(0,0,0,0.8)",
            backgroundImage: "radial-gradient(circle at center, #170d24 0%, #07030a 100%)"
          }}
        >
          <div className="flex justify-between items-center border-b border-purple-900/40 pb-1.5">
            <span className="text-[10px] font-black tracking-wider text-purple-400 flex items-center gap-1 animate-pulse">
              <span>🌌 DIVINDADE</span>
              <span className="text-[8.5px] text-purple-500">({ambitiousTab.toUpperCase()})</span>
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setAmbitiousMinimized(false)}
                className="px-1.5 py-0.5 text-[9px] bg-purple-900/40 border border-purple-500/40 hover:bg-purple-800 text-purple-200 rounded cursor-pointer transition-all active:scale-95 font-bold"
                title="Restaurar Altar"
              >
                ⛶ EXPANDIR
              </button>
              <button
                onClick={() => {
                  setShowAmbitious(false);
                  setAmbitiousMinimized(false);
                }}
                className="px-1.5 py-0.5 text-[9px] bg-red-950/55 border border-red-500/40 hover:bg-red-900 text-red-200 rounded cursor-pointer font-bold"
                title="Fechar Altar"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Quick display of currencies */}
          <div className="grid grid-cols-2 gap-1 text-[9px] bg-black/40 p-1.5 border border-purple-900/20 rounded">
            <div>🔥 Embers: <span className="font-bold text-amber-400">{amb.divineEmbers}</span></div>
            <div>🌾 Ração: <span className="font-bold text-amber-400">{amb.petFood}</span></div>
          </div>

          {/* Quick tab switch or custom tab shortcut buttons */}
          <div className="flex gap-1 border-t border-purple-900/20 pt-1.5 overflow-x-auto select-none no-scrollbar">
            {["ascension", "pets", "fleet", "rift"].map((tb) => (
              <button
                key={tb}
                onClick={() => setAmbitiousTab(tb as any)}
                className={`px-1.5 py-0.5 text-[8px] font-bold rounded border uppercase cursor-pointer transition-colors ${
                  ambitiousTab === tb
                    ? "bg-purple-600 text-white border-purple-400"
                    : "bg-black/50 text-purple-300 border-purple-900/40 hover:bg-purple-900/20"
                }`}
              >
                {tb}
              </button>
            ))}
          </div>

          {/* Quick interactive action depending on the tab! */}
          <div className="mt-1">
            {ambitiousTab === "pets" && (
              <button
                onClick={() => {
                  const activePet = amb.pets.find((p: any) => p.active);
                  if (!activePet) {
                    alert("Selecione um Pet Ativo primeiro (abra a tela cheia do Altar)!");
                    return;
                  }
                  if (amb.petFood <= 0) {
                    alert("Ração mística insuficiente!");
                    return;
                  }
                  feedActivePet(g);
                  save(g);
                }}
                className="w-full text-[9px] py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded border border-purple-400 uppercase cursor-pointer transition-all active:scale-95"
              >
                🌾 Alimentar Pet Ativo (+25 XP)
              </button>
            )}

            {ambitiousTab === "ascension" && (
              <button
                onClick={() => {
                  if (player.level < 100) {
                    alert("Requer Nível 100!");
                    return;
                  }
                  if (confirm("Você tem certeza de que deseja realizar a Ascensão Celestial? Seu nível retornará para 1!")) {
                    triggerDivineAscension(g);
                    save(g);
                  }
                }}
                disabled={player.level < 100}
                className={`w-full text-[9px] py-1 rounded border font-bold uppercase transition-all active:scale-95 ${
                  player.level >= 100
                    ? "bg-purple-600 border-purple-400 text-white hover:bg-purple-500 cursor-pointer"
                    : "bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed"
                }`}
              >
                {player.level >= 100 ? "✨ Realizar Ascensão" : "🔒 Requer Nível 100"}
              </button>
            )}

            {ambitiousTab === "fleet" && (
              <div className="text-[9px] text-purple-300/80 italic text-center py-0.5 font-sans bg-black/20 rounded p-1 border border-purple-900/20">
                🚢 Expedições em progresso. Acesse a aba completa para gerenciar.
              </div>
            )}

            {ambitiousTab === "rift" && (
              <div className="text-[9px] text-purple-300/80 italic text-center py-0.5 font-sans bg-black/20 rounded p-1 border border-purple-900/20">
                🌀 Acesse a aba completa para entrar nas fendas ativas.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
