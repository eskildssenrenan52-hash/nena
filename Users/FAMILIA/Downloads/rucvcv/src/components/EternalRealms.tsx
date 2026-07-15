import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
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
  type GameState,
} from "@/game/game";
import { render, drawPlayer } from "@/game/render";
import { craft } from "@/game/crafting";
import { makePickaxe, PICKAXE_TIERS } from "@/game/mining";
import { PROFESSION_LIST, CLASS_SKINS, BIOMES, type PlayerClass } from "@/game/engine";
import { CLASS_TALENTS, nodePrereqMet } from "@/game/talents";
import dragonBg from "@/assets/menu-bg.jpg";
import RucoySideBar from "./rucoy/RucoySideBar";
import TrophyNotification from "./rucoy/TrophyNotification";
import { setActiveGame } from "@/game/host";
import { setOverlayState } from "@/rucoy/store";

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
  const [selectedClass, setSelectedClass] = useState<Cls>("melee");
  const [selectedSkin, setSelectedSkin] = useState<number>(0);
  const [savedExists, setSavedExists] = useState(false);
  const [activeBiomeId, setActiveBiomeId] = useState<number>(1);
  const [activeBiomeName, setActiveBiomeName] = useState<string>("Planícies de Aurora");
  const [isMobile, setIsMobile] = useState(false);
  const [autoFireUi, setAutoFireUi] = useState(true);
  const [showTalents, setShowTalents] = useState(false);
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
      } else if (k === "p") {
        g.paused = !g.paused;
        e.preventDefault();
      } else if (k === "t") {
        setShowTalents((v) => !v);
        e.preventDefault();
      } else if (k === "escape") {
        g.panel = "none";
        setShowTalents(false);
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
      }
    };
    const ku = (e: KeyboardEvent) => inputRef.current.keys.delete(e.key.toLowerCase());
    const mm = (e: MouseEvent) => {
      inputRef.current.mouse.x = e.clientX;
      inputRef.current.mouse.y = e.clientY;
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
      }
      return false;
    };

    const md = (e: MouseEvent) => {
      inputRef.current.mouse.down = true;
      inputRef.current.mouse.downOnce = true;
      handleClick(e.clientX, e.clientY);
    };
    const mu = () => {
      inputRef.current.mouse.down = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    canvas.addEventListener("mousemove", mm);
    canvas.addEventListener("mousedown", md);
    canvas.addEventListener("mouseup", mu);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Touch handling: 2 joysticks on left/right halves
    const activeTouch = { move: -1, aim: -1 };
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
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
      for (const t of Array.from(e.changedTouches)) {
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
              src="/sprites/o-absoluto.png"
              alt="Crest"
              style={{ imageRendering: "pixelated" }}
              className="w-20 h-20 object-contain filter drop-shadow-[0_0_12px_rgba(240,192,64,0.45)] relative z-10"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "/sprites/deus-das-fusoes.png";
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
    const classes: { id: Cls; name: string; slug: string; desc: string; stats: string }[] = [
      {
        id: "melee",
        name: "Guerreiro",
        slug: "guerreiro",
        desc: "Corte amplo, guarda de ferro. Alto STR/VIT.",
        stats: "STR 9 · VIT 8 · HP 130 · MP 30",
      },
      {
        id: "magic",
        name: "Mago",
        slug: "mago",
        desc: "Raio Arcano, Bola de Fogo. Alto INT.",
        stats: "INT 10 · HP 80 · MP 90",
      },
      {
        id: "paladin",
        name: "Paladino",
        slug: "paladino",
        desc: "Golpe Sagrado cura ao acertar. Equilibrado.",
        stats: "STR 7 · INT 6 · HP 110 · MP 60",
      },
      {
        id: "necro",
        name: "Necromante",
        slug: "necromante",
        desc: "Dreno de Vida + Invocar Esqueleto. Alto INT.",
        stats: "INT 11 · HP 90 · MP 100",
      },
      {
        id: "archer",
        name: "Arqueiro",
        slug: "arqueiro",
        desc: "Flechas longas rápidas + Chuva de Flechas.",
        stats: "AGI 11 · HP 95 · MP 45",
      },
      {
        id: "druid",
        name: "Druida",
        slug: "guardiao-esmeralda",
        desc: "Magias da natureza e cura telúrica. Alto VIT/INT.",
        stats: "VIT 7 · INT 7 · HP 115 · MP 65",
      },
      {
        id: "assassin",
        name: "Assassino",
        slug: "assassino-sombrio",
        desc: "Críticos furtivos e fumaça evasiva. Alto AGI.",
        stats: "AGI 12 · HP 90 · MP 40",
      },
      {
        id: "warlock",
        name: "Bruxo",
        slug: "bruxa",
        desc: "Maldições e drenos de alma das trevas. Alto INT.",
        stats: "INT 12 · HP 85 · MP 95",
      },
      {
        id: "samurai",
        name: "Samurai",
        slug: "guerreiro",
        desc: "Cortes ultra velozes e contra-ataques. Alto STR/AGI.",
        stats: "STR 8 · AGI 8 · HP 105 · MP 45",
      },
      {
        id: "monk",
        name: "Monge",
        slug: "anjo-do-alvorecer",
        desc: "Socos espirituais e escudos de Chi. Equilibrado.",
        stats: "STR 6 · AGI 6 · HP 110 · MP 55",
      },
      {
        id: "bard",
        name: "Bardo",
        slug: "bandoleiro",
        desc: "Melodias sonoras, buffs de velocidade e cura.",
        stats: "AGI 8 · INT 8 · HP 100 · MP 70",
      },
      {
        id: "gunslinger",
        name: "Pistoleiro",
        slug: "bandido",
        desc: "Armas de fogo rápidas e granadas. Alto AGI.",
        stats: "AGI 12 · HP 95 · MP 45",
      },
      {
        id: "alchemist",
        name: "Alquimista",
        slug: "alquimista-amaldicoado",
        desc: "Ácido, elixires mutagênicos e homúnculo. Alto INT.",
        stats: "INT 9 · VIT 6 · HP 100 · MP 75",
      },
      {
        id: "vampire",
        name: "Vampiro",
        slug: "assassino-sombrio",
        desc: "Dreno de sangue, morcegos e névoa. Alto VIT/STR.",
        stats: "STR 8 · VIT 8 · HP 120 · MP 50",
      },
      {
        id: "reaper",
        name: "Ceifador",
        slug: "cavaleiro-fantasma",
        desc: "Foice, drenos de alma e aura da morte. Alto STR/INT.",
        stats: "STR 8 · INT 8 · HP 100 · MP 60",
      },
    ];
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen w-full flex items-center justify-center font-mono px-6 py-10 relative overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${dragonBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(0.9) contrast(1.05) brightness(0.55)",
            transform: "scale(1.05)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.95)_100%)] z-0" />
        <MenuBackgroundParticles />
        <div className="max-w-6xl w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="relative er-panel rounded-md p-6"
          >
            <div className="er-corner-tr" />
            <div className="er-corner-bl" />
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-amber-500/70" />
                <h2 className="er-title text-2xl md:text-3xl">ESCOLHA SUA CLASSE</h2>
                <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-amber-500/70" />
              </div>
            </div>

            <div
              className="max-h-[42vh] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#f0c040 #1a120a" }}
            >
              {classes.map((c) => {
                const active = selectedClass === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClass(c.id);
                      setSelectedSkin(0);
                    }}
                    className="p-5 text-left transition-transform hover:-translate-y-0.5"
                    style={{
                      background: active ? "#8a6438" : "#2a1c10",
                      boxShadow: active
                        ? "inset 0 2px 0 #b08858, inset 0 -2px 0 #3a2410, 0 0 0 2px #f0c040, 0 0 0 4px #0a0604"
                        : "inset 0 2px 0 #4a3420, inset 0 -2px 0 #0a0604, 0 0 0 2px #0a0604",
                    }}
                  >
                    <div
                      className="mx-auto mb-3 flex items-center justify-center"
                      style={{
                        width: 112,
                        height: 112,
                        background: "#0f0906",
                        boxShadow: "inset 0 0 0 2px #3a2410",
                      }}
                    >
                      <img
                        src={active ? `/sprites/skin-${c.id}-${selectedSkin}.png` : `/sprites/${c.id}.png`}
                        alt={c.name}
                        style={{ imageRendering: "pixelated", width: 96, height: 96, objectFit: "contain" }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes(".svg")) {
                            target.src = active
                              ? `/sprites/organized/skins/skin-${c.id}-${selectedSkin}.svg`
                              : `/sprites/organized/classes/${c.id}.svg`;
                          } else {
                            target.style.visibility = "hidden";
                          }
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.visibility = "visible";
                        }}
                      />
                    </div>
                    <div
                      className="text-lg font-bold tracking-[0.25em] text-center"
                      style={{ color: active ? "#fff0a0" : "#f0c040" }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="text-[11px] mt-2 text-center leading-relaxed"
                      style={{ color: active ? "#f0e0c0" : "#c8a878" }}
                    >
                      {c.desc}
                    </div>
                    <div
                      className="text-[10px] mt-2 text-center"
                      style={{ color: active ? "#e8d8a8" : "#8a6438" }}
                    >
                      {c.stats}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Character Animated Preview */}
            <div className="my-6 flex flex-col items-center gap-1.5 bg-black/30 p-4 border border-amber-500/15 rounded">
              <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest font-mono">Visualização ao Vivo do Herói</span>
              <PlayerSelectPreview cls={selectedClass} skin={selectedSkin} />
            </div>

            {/* Premium Skin Selector Grid */}
            <div className="mt-6 p-4 border border-dashed border-amber-500/40 rounded bg-black/40">
              <h3 className="text-center text-amber-400 font-bold tracking-[0.2em] mb-3 text-xs">
                ESCOLHA SUA SKIN EXCLUSIVA
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {(CLASS_SKINS[selectedClass] || []).map((skin, idx) => {
                  const active = selectedSkin === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSkin(idx)}
                      className="p-3 text-left transition-all border rounded text-xs flex flex-col justify-between h-32 hover:border-amber-500/70"
                      style={{
                        background: active ? "rgba(138, 100, 56, 0.4)" : "rgba(15, 9, 6, 0.8)",
                        borderColor: active ? "#f0c040" : "#2a1c10",
                        boxShadow: active ? "0 0 10px rgba(240, 192, 64, 0.25)" : "none",
                      }}
                    >
                      <div className="font-bold text-amber-300 flex justify-between w-full">
                        <span>{skin.name}</span>
                        {active && <span className="text-[10px] text-green-400 font-mono">✓</span>}
                      </div>
                      <div className="flex gap-2 items-center w-full mt-2">
                        <img
                          src={`/sprites/skin-${selectedClass}-${idx}.png`}
                          alt={skin.name}
                          style={{ imageRendering: "pixelated" }}
                          className="w-10 h-10 object-contain bg-black/50 p-0.5 rounded border border-amber-500/20"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.src.includes(".svg")) {
                              target.src = `/sprites/organized/skins/skin-${selectedClass}-${idx}.svg`;
                            } else {
                              target.style.display = "none";
                            }
                          }}
                        />
                        <div className="text-[10px] text-neutral-400 leading-normal line-clamp-3 flex-1 font-mono">
                          {skin.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => setMenu("main")}
                className="px-6 py-2 tracking-[0.3em] text-sm font-bold"
                style={{
                  background: "#2a1c10",
                  color: "#c8a878",
                  boxShadow: "inset 0 2px 0 #4a3420, inset 0 -2px 0 #0a0604, 0 0 0 2px #0a0604",
                }}
              >
                VOLTAR
              </button>
              <button
                onClick={() => {
                  const g = newGame(undefined, selectedClass);
                  g.player.skin = selectedSkin;
                  stateRef.current = g;
                  setMenu("playing");
                }}
                className="px-8 py-2 tracking-[0.3em] text-sm font-bold"
                style={{
                  background: "#f0c040",
                  color: "#1a0a04",
                  boxShadow: "inset 0 2px 0 #fff0a0, inset 0 -2px 0 #8a5a1a, 0 0 0 2px #0a0604",
                }}
              >
                COMEÇAR
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

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

      {/* Extras: Talent tree button + Boss Rush entry + Boss Rush HUD */}
      <ExtrasOverlay
        stateRef={stateRef}
        showTalents={showTalents}
        setShowTalents={setShowTalents}
      />

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
          left: 300,
          maxWidth: "calc(100vw - 320px)",
          flexWrap: "wrap",
          alignItems: "center",
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
            boxShadow: "0 0 10px rgba(245,192,74,0.35), inset 0 1px 0 rgba(255,255,255,0.3), 0 1.5px 4px rgba(0,0,0,0.5)",
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

      {/* Joystick indicators */}
      <JoystickHUD moveRef={moveJoyRef} aimRef={aimJoyRef} />
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
}: {
  stateRef: React.MutableRefObject<GameState | null>;
  showTalents: boolean;
  setShowTalents: (v: boolean | ((v: boolean) => boolean)) => void;
}) {
  // Re-render on tick — parent already forces a tick every 300ms.
  const g = stateRef.current;
  if (!g) return null;

  const p = g.player;
  const inArena = g.activeArena;
  const inCity = !g.activeCaveBiome && g.activeGrandFloor === 0 && !inArena;
  const tree = CLASS_TALENTS[p.cls];

  return (
    <>
      {/* Stack extras buttons on the LEFT side, below the game HUD panel */}
      <div className="fixed z-20 flex flex-col gap-2" style={{ top: 220, left: 8 }}>
        {!showTalents && (
          <button
            onClick={() => setShowTalents(true)}
            className="text-[11px] font-mono font-bold tracking-widest px-3 py-1.5 border border-amber-500/60 bg-black/80 text-amber-200 hover:bg-amber-900/40 text-left"
            title="Árvore de Talentos (T)"
          >
            [T] TALENTOS
            {p.talentPoints > 0 && (
              <span className="ml-2 inline-block bg-amber-500 text-black text-[10px] px-1.5 py-[1px] rounded">
                +{p.talentPoints}
              </span>
            )}
          </button>
        )}
        {inCity && (
          <button
            onClick={() => stateRef.current && enterBossRush(stateRef.current)}
            className="text-[11px] font-mono font-bold tracking-widest px-3 py-1.5 border border-red-500/70 bg-black/80 text-red-200 hover:bg-red-900/50 text-left"
            title="Arena da Sobrevivência (Boss Rush)"
          >
            ⚔ ARENA
            <div className="text-[9px] tracking-normal text-red-300/80 mt-0.5 font-normal">
              recorde: onda {g.arenaBest}
            </div>
          </button>
        )}
      </div>

      {/* Boss Rush HUD — visible only inside the arena */}
      {inArena && (
        <div
          className="fixed z-20 pointer-events-none text-center"
          style={{ top: 12, left: "50%", transform: "translateX(-50%)" }}
        >
          <div
            className="inline-block px-4 py-2 border border-red-500/70 bg-black/80 text-red-200 font-mono"
            style={{ boxShadow: "0 0 24px rgba(240,64,80,0.35)" }}
          >
            <div className="text-[10px] tracking-[0.4em] text-red-300/80">ARENA</div>
            <div className="text-2xl font-bold text-amber-200 mt-0.5">ONDA {g.arenaWave || 0}</div>
            <div className="text-[10px] tracking-widest text-red-200/80 mt-1">
              recorde: {g.arenaBest} · inimigos: {g.enemies.length}
            </div>
            {!g.arenaWaveActive && g.arenaWave > 0 && (
              <div className="text-[10px] tracking-widest text-emerald-300/90 mt-1">
                próxima onda em {Math.max(0, g.arenaNextWaveIn).toFixed(1)}s
              </div>
            )}
          </div>
          <div className="mt-2 pointer-events-auto">
            <button
              onClick={() => stateRef.current && exitBossRush(stateRef.current)}
              className="text-[10px] font-mono font-bold tracking-widest px-3 py-1 border border-amber-500/60 bg-black/70 text-amber-200 hover:bg-amber-900/40"
            >
              SAIR DA ARENA
            </button>
          </div>
        </div>
      )}

      {/* Talent panel modal */}
      {showTalents && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70"
          onClick={() => setShowTalents(false)}
        >
          <div
            className="relative max-w-3xl w-[min(92vw,880px)] max-h-[86vh] overflow-auto bg-neutral-950 border-2 border-amber-500/60 p-5 font-mono text-amber-100"
            style={{ boxShadow: "0 0 40px rgba(240,176,64,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2">
              <div>
                <div className="text-[10px] tracking-[0.5em] text-amber-300/70">
                  ÁRVORE DE TALENTOS
                </div>
                <div className="text-xl font-bold tracking-widest">
                  {p.cls.toUpperCase()} — Nível {p.level}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-widest text-amber-300/70">
                  PONTOS DISPONÍVEIS
                </div>
                <div className="text-3xl font-bold text-amber-300">{p.talentPoints}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tree.branches.map((branch) => (
                <div
                  key={branch.id}
                  className="border border-amber-500/25 p-3 bg-black/40"
                  style={{ boxShadow: `inset 0 0 40px ${branch.color}22` }}
                >
                  <div
                    className="text-sm font-bold tracking-[0.3em] mb-3 pb-1 border-b"
                    style={{ color: branch.color, borderColor: `${branch.color}55` }}
                  >
                    {branch.name.toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-3">
                    {branch.nodes.map((n) => {
                      const rank = p.talents?.[n.id] ?? 0;
                      const locked = !nodePrereqMet(p.cls, n.id, p.talents || {});
                      const maxed = rank >= n.maxRank;
                      const canAlloc = p.talentPoints > 0 && !locked && !maxed;
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 p-2 border ${
                            locked ? "border-neutral-700 opacity-50" : "border-amber-500/25"
                          } bg-neutral-900/60`}
                        >
                          <button
                            disabled={!canAlloc}
                            onClick={() => {
                              if (stateRef.current && allocTalent(stateRef.current, n.id)) {
                                if (stateRef.current) save(stateRef.current);
                              }
                            }}
                            className={`shrink-0 w-14 h-14 flex flex-col items-center justify-center border-2 font-bold text-lg ${
                              maxed
                                ? "border-emerald-500/70 bg-emerald-900/40 text-emerald-200"
                                : canAlloc
                                  ? "border-amber-500/70 bg-amber-900/40 text-amber-100 hover:bg-amber-800/60 cursor-pointer"
                                  : "border-neutral-700 bg-neutral-900 text-neutral-500 cursor-not-allowed"
                            }`}
                            style={{
                              boxShadow: canAlloc ? `0 0 12px ${branch.color}66` : undefined,
                            }}
                            title={
                              canAlloc
                                ? "Investir 1 ponto"
                                : maxed
                                  ? "Máximo atingido"
                                  : locked
                                    ? "Requisito não atendido"
                                    : "Sem pontos"
                            }
                          >
                            <div>{rank}</div>
                            <div className="text-[9px] font-normal opacity-70">/{n.maxRank}</div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-amber-200">{n.name}</div>
                            <div className="text-[11px] text-amber-100/70 mt-0.5 leading-snug">
                              {n.desc}
                            </div>
                            {n.requires && (
                              <div className="text-[10px] text-amber-300/50 mt-0.5">
                                requer:{" "}
                                {
                                  tree.branches
                                    .flatMap((b) => b.nodes)
                                    .find((x) => x.id === n.requires)?.name
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-500/30">
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
                className="text-[11px] px-3 py-1.5 border border-red-500/60 bg-black/60 text-red-200 hover:bg-red-900/40 tracking-widest"
              >
                RESET (respec)
              </button>
              <div className="text-[10px] text-amber-100/50 tracking-widest">
                pressione T ou ESC para fechar
              </div>
              <button
                onClick={() => setShowTalents(false)}
                className="text-[11px] px-3 py-1.5 border border-amber-500/60 bg-black/60 text-amber-200 hover:bg-amber-900/40 tracking-widest"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
