import { useEffect, useMemo, useRef, useState } from "react";
import { startGame, type GameController, type UiState } from "./engine";
import { CLASSES, BIOMES, DUNGEON_BIOMES, MONSTERS, ABILITIES, ACHIEVEMENTS, type ClassId, type SkillId } from "./config";
import { OVERWORLD_SIZE, WORLD_CENTERS, worldBiomeAt } from "./world";
import {
  EQUIP_SLOTS, SLOT_LABEL, BIOME_SETS, GEMS, GEM_LABEL, GEM_COLOR,
  RARITY_NAMES, RARITY_COLORS, GEMS_PER_UPGRADE, gemForUpgrade, itemStats,
  EQUIP_SHEET_URLS, GEMS_URL, type EquipSlot, type EquipItem,
} from "./equipment";

import portraitMage from "@/assets/portrait-mage.png";
import portraitArcher from "@/assets/portrait-archer.png";
import portraitWarrior from "@/assets/portrait-warrior.png";
import enemyBogToad from "@/assets/enemy-bog_toad.png";
import enemyMarshWitch from "@/assets/enemy-marsh_witch.png";
import enemyVineBeast from "@/assets/enemy-vine_beast.png";
import enemyJungleSerpent from "@/assets/enemy-jungle_serpent.png";
import enemySkySprite from "@/assets/enemy-sky_sprite.png";
import enemyStormEagle from "@/assets/enemy-storm_eagle.png";
import enemyVoidStalker from "@/assets/enemy-void_stalker.png";
import enemyShadowHound from "@/assets/enemy-shadow_hound.png";
import enemyAbyssSlime from "@/assets/enemy-abyss_slime.png";
import enemyBoneKnight from "@/assets/enemy-bone_knight.png";
import enemyShardWidow from "@/assets/enemy-shard_widow.png";
import enemyCogSentinel from "@/assets/enemy-cog_sentinel.png";
import enemyLanternMaw from "@/assets/enemy-lantern_maw.png";
import enemyCinderFiend from "@/assets/enemy-cinder_fiend.png";
import enemySporeWalker from "@/assets/enemy-spore_walker.png";

const CLASS_ORDER: ClassId[] = ["melee", "paladin", "berserker", "assassin", "archer", "mage", "elementalist", "necromancer"];
const PORTRAIT_BY_CLASS: Record<ClassId, string> = {
  melee: portraitWarrior, paladin: portraitWarrior, berserker: portraitWarrior,
  assassin: portraitArcher, archer: portraitArcher,
  mage: portraitMage, elementalist: portraitMage, necromancer: portraitMage,
};
const portraitFor = (c: ClassId): string => PORTRAIT_BY_CLASS[c];
const SKILL_ORDER: SkillId[] = ["defense", "melee", "archer", "mage"];
const SKILL_LABEL: Record<SkillId, string> = {
  defense: "Defesa", melee: "Ataque Corpo-a-Corpo", archer: "Ataque à Distância", mage: "Magia",
};
const SKILL_COLOR: Record<SkillId, string> = {
  defense: "#38bdf8", melee: "#f59e0b", archer: "#22c55e", mage: "#a78bfa",
};
const ENEMY_PORTRAIT: Record<string, string> = {
  bog_toad: enemyBogToad, marsh_witch: enemyMarshWitch,
  vine_beast: enemyVineBeast, jungle_serpent: enemyJungleSerpent,
  sky_sprite: enemySkySprite, storm_eagle: enemyStormEagle,
  void_stalker: enemyVoidStalker, shadow_hound: enemyShadowHound,
  abyss_slime: enemyAbyssSlime, bone_knight: enemyBoneKnight,
  spore_walker: enemySporeWalker, cog_sentinel: enemyCogSentinel,
  lantern_maw: enemyLanternMaw, cinder_fiend: enemyCinderFiend,
  shard_widow: enemyShardWidow,
};
const BESTIARY_BIOMES: (keyof typeof BIOMES)[] = [
  "swamp", "jungle", "sky", "abyss",
  "mycelium", "clockwork", "abyss_sea", "emberlands", "shardveil",
];

function useWorldMapImage(size = 320) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const sx = OVERWORLD_SIZE.w / size;
    const sy = OVERWORLD_SIZE.h / size;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const b = worldBiomeAt(Math.floor(x * sx), Math.floor(y * sy));
        ctx.fillStyle = BIOMES[b].mapColor;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const img = ctx.getImageData(0, 0, size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      d[i]     = Math.max(0, Math.min(255, d[i]     + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);
    const grad = ctx.createRadialGradient(size/2, size/2, size*0.15, size/2, size/2, size*0.55);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    setUrl(c.toDataURL());
  }, [size]);
  return url;
}

function AmbientOverlay({ biomeId }: { biomeId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    interface P { x: number; y: number; vx: number; vy: number; r: number; hue: string; phase: number; speed: number; }
    const config = ((): { count: number; palette: string[]; speed: number; size: number; blend: GlobalCompositeOperation } => {
      switch (biomeId) {
        case "meadow":    return { count: 55, palette: ["#fef08a","#fde68a","#facc15"], speed: 0.35, size: 1.6, blend: "lighter" };
        case "forest":    return { count: 65, palette: ["#a3e635","#4ade80","#bef264"], speed: 0.3,  size: 1.6, blend: "lighter" };
        case "swamp":     return { count: 50, palette: ["#65a30d","#84cc16","#bef264"], speed: 0.25, size: 1.8, blend: "lighter" };
        case "jungle":    return { count: 70, palette: ["#22c55e","#a3e635","#facc15"], speed: 0.32, size: 1.6, blend: "lighter" };
        case "desert":    return { count: 30, palette: ["#fde68a","#fbbf24","#f59e0b"], speed: 0.55, size: 1.3, blend: "lighter" };
        case "tundra":    return { count: 80, palette: ["#e0f2fe","#bae6fd","#ffffff"], speed: 0.2,  size: 1.6, blend: "lighter" };
        case "volcano":   return { count: 60, palette: ["#f97316","#dc2626","#facc15"], speed: 0.6,  size: 1.4, blend: "lighter" };
        case "ruins":     return { count: 45, palette: ["#14b8a6","#67e8f9","#a5f3fc"], speed: 0.28, size: 1.7, blend: "lighter" };
        case "crystal":   return { count: 90, palette: ["#c084fc","#e879f9","#f0abfc"], speed: 0.3,  size: 1.8, blend: "lighter" };
        case "sky":       return { count: 85, palette: ["#fef3c7","#fde68a","#e0e7ff"], speed: 0.35, size: 1.8, blend: "lighter" };
        case "abyss":     return { count: 60, palette: ["#8b5cf6","#a78bfa","#c4b5fd"], speed: 0.28, size: 1.9, blend: "lighter" };
        case "mycelium":  return { count: 70, palette: ["#dc2626","#f59e0b","#facc15"], speed: 0.3,  size: 1.7, blend: "lighter" };
        case "clockwork": return { count: 50, palette: ["#f59e0b","#fbbf24","#facc15"], speed: 0.5,  size: 1.4, blend: "lighter" };
        case "abyss_sea": return { count: 75, palette: ["#22d3ee","#67e8f9","#a5f3fc"], speed: 0.22, size: 1.8, blend: "lighter" };
        case "emberlands":return { count: 80, palette: ["#f97316","#dc2626","#facc15"], speed: 0.6,  size: 1.6, blend: "lighter" };
        case "shardveil": return { count: 95, palette: ["#a78bfa","#c084fc","#f0abfc"], speed: 0.28, size: 1.9, blend: "lighter" };
        default:          return { count: 40, palette: ["#fef3c7"], speed: 0.35, size: 1.5, blend: "lighter" };
      }
    })();

    const parts: P[] = Array.from({ length: config.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed - 0.05,
      r: config.size + Math.random() * config.size,
      hue: config.palette[Math.floor(Math.random() * config.palette.length)],
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 16.67; last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = config.blend;
      for (const p of parts) {
        p.phase += 0.02 * p.speed * dt;
        p.x += p.vx * dt + Math.sin(p.phase) * 0.15;
        p.y += p.vy * dt + Math.cos(p.phase * 0.7) * 0.15;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        const alpha = 0.35 + Math.sin(p.phase * 2) * 0.35;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, p.hue);
        g.addColorStop(0.4, p.hue + "80");
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = alpha * 0.55;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.hue;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [biomeId]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />;
}
// ============================================================
// EquipmentModal – tabbed modal showing 10 gear slots, inventory, gems
// and a forge tab to upgrade equipped items with gems.
// ============================================================
function EquipmentIcon({ item, size = 40 }: { item: EquipItem; size?: number }) {
  const set = BIOME_SETS.find(s => s.id === item.setId) ?? BIOME_SETS[0];
  const sheetUrl = EQUIP_SHEET_URLS[set.sheet];
  const col = EQUIP_SLOTS.indexOf(item.slot);
  // The generated sheets are 10 cols x 5 rows on a 1376x768 image, each cell
  // 137.6x153.6. We render as a scaled background clipped to a size×size box.
  const cellW = 1376 / 10;
  const cellH = 768 / 5;
  const bgSize = `${(1376 / cellW) * size}px ${(768 / cellH) * size}px`;
  const bgPos = `-${col * size}px -${set.row * size}px`;
  return (
    <div
      className="rounded"
      style={{
        width: size, height: size,
        backgroundImage: `url(${sheetUrl})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPos,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        boxShadow: `0 0 8px ${RARITY_COLORS[item.rarity]}66`,
      }}
    />
  );
}
function GemIcon({ gem, size = 20 }: { gem: (typeof GEMS)[number]; size?: number }) {
  const idx = GEMS.indexOf(gem);
  // gems.png is 1280x512 with 4 columns of ~320x512 gem art. Use whole cell.
  const cellW = 1280 / 4;
  const bgSize = `${(1280 / cellW) * size}px auto`;
  const bgPos = `-${idx * size}px 0`;
  return (
    <div style={{
      width: size, height: size,
      backgroundImage: `url(${GEMS_URL})`,
      backgroundSize: bgSize,
      backgroundPosition: bgPos,
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
    }} />
  );
}
function EquipmentModal(props: {
  ui: UiState;
  tab: "gear" | "forge";
  setTab: (t: "gear" | "forge") => void;
  onClose: () => void;
  onEquip: (uid: number) => void;
  onUnequip: (slot: EquipSlot) => void;
  onDiscard: (uid: number) => void;
  onUpgrade: (slot: EquipSlot) => { ok: boolean; msg: string };
}) {
  const { ui, tab, setTab, onClose, onEquip, onUnequip, onDiscard, onUpgrade } = props;
  const p = ui.player;
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot>("helmet");
  const [flash, setFlash] = useState<string>("");
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(""), 2200); return () => clearTimeout(t); }, [flash]);

  const totals = useMemo(() => {
    let d = 0, h = 0, df = 0;
    for (const s of EQUIP_SLOTS) {
      const it = p.equipped[s]; if (!it) continue;
      const st = itemStats(it); d += st.dmg; h += st.hp; df += st.def;
    }
    return { d, h, df };
  }, [p.equipped]);

  const filteredInv = p.inventory.filter(i => i.slot === selectedSlot);
  const equippedItem = p.equipped[selectedSlot];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in"
         onPointerDown={onClose}>
      <div className="relative w-[96%] max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black shadow-[0_40px_100px_-10px_rgba(0,0,0,0.9)] font-mono"
           onPointerDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-orange-300/80">Armazém do Herói</div>
            <div className="text-xl font-bold text-white">Equipamento</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md bg-white/5 p-1">
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setTab("gear"); }}
                className={`rounded px-3 py-1 text-xs font-bold ${tab === "gear" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}>Slots</button>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setTab("forge"); }}
                className={`rounded px-3 py-1 text-xs font-bold ${tab === "forge" ? "bg-orange-500/30 text-orange-200" : "text-white/50 hover:text-white"}`}>Ferreiro 🔨</button>
            </div>
            <button type="button" onPointerDown={(e) => { e.preventDefault(); onClose(); }}
              className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr] overflow-y-auto" style={{ maxHeight: "calc(92vh - 60px)" }}>
          {/* Left: 10 slots grid */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-orange-300/80">10 Slots de Equipamento</div>
            <div className="grid grid-cols-2 gap-2">
              {EQUIP_SLOTS.map((s) => {
                const it = p.equipped[s];
                const active = s === selectedSlot;
                return (
                  <button key={s} type="button"
                    onPointerDown={(e) => { e.preventDefault(); setSelectedSlot(s); }}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left transition ${
                      active ? "border-orange-400 bg-orange-500/10" : "border-white/10 bg-black/30 hover:border-white/30"
                    }`}>
                    <div className="flex h-11 w-11 items-center justify-center rounded bg-black/50">
                      {it ? <EquipmentIcon item={it} size={40} />
                          : <span className="text-[10px] text-white/30">vazio</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-white truncate">{SLOT_LABEL[s]}</div>
                      {it ? (
                        <div className="truncate text-[9px]" style={{ color: RARITY_COLORS[it.rarity] }}>
                          {RARITY_NAMES[it.rarity]} · Lv {it.level}
                        </div>
                      ) : (
                        <div className="text-[9px] text-white/30">—</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Total bonuses */}
            <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-2 text-[10px]">
              <div className="mb-1 font-bold text-white/80">Bônus Total</div>
              <div className="flex justify-between text-white/70"><span>Dano</span><span className="text-red-300 font-bold">+{totals.d}</span></div>
              <div className="flex justify-between text-white/70"><span>HP Máx</span><span className="text-emerald-300 font-bold">+{totals.h}</span></div>
              <div className="flex justify-between text-white/70"><span>Defesa</span><span className="text-sky-300 font-bold">+{totals.df.toFixed(1)}</span></div>
            </div>
            {/* Gems */}
            <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-2">
              <div className="mb-1 text-[10px] font-bold text-white/80">Jóias</div>
              <div className="grid grid-cols-2 gap-1">
                {GEMS.map((g) => (
                  <div key={g} className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-1 text-[10px]">
                    <GemIcon gem={g} size={16} />
                    <span style={{ color: GEM_COLOR[g] }} className="font-bold">{p.gems[g] ?? 0}</span>
                    <span className="ml-auto text-[8px] text-white/40">{GEM_LABEL[g].split(" ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: dynamic panel */}
          {tab === "gear" ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-orange-300/80">{SLOT_LABEL[selectedSlot]}</div>
                <div className="text-[10px] text-white/40">{filteredInv.length} no inventário</div>
              </div>
              {/* Equipped detail */}
              {equippedItem ? (
                <div className="mb-3 flex items-center gap-3 rounded-lg border p-3"
                     style={{ borderColor: RARITY_COLORS[equippedItem.rarity] + "88",
                              background: `linear-gradient(135deg, ${RARITY_COLORS[equippedItem.rarity]}22, transparent)` }}>
                  <EquipmentIcon item={equippedItem} size={56} />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{SLOT_LABEL[equippedItem.slot]}</div>
                    <div className="text-[11px]" style={{ color: RARITY_COLORS[equippedItem.rarity] }}>
                      {RARITY_NAMES[equippedItem.rarity]} · {BIOME_SETS.find(s => s.id === equippedItem.setId)?.name} · Lv {equippedItem.level}
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-white/70">
                      <span>Dano +{itemStats(equippedItem).dmg}</span>
                      <span>HP +{itemStats(equippedItem).hp}</span>
                      <span>Def +{itemStats(equippedItem).def.toFixed(1)}</span>
                    </div>
                  </div>
                  <button type="button"
                    onPointerDown={(e) => { e.preventDefault(); onUnequip(equippedItem.slot); }}
                    className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/20">Desequipar</button>
                </div>
              ) : (
                <div className="mb-3 rounded-lg border border-dashed border-white/15 p-3 text-center text-[11px] text-white/40">
                  Nenhum {SLOT_LABEL[selectedSlot].toLowerCase()} equipado.
                </div>
              )}
              {/* Inventory list */}
              <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1.5">Inventário — {SLOT_LABEL[selectedSlot]}</div>
              {filteredInv.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[11px] text-white/40">
                  Você não tem itens deste tipo. Inimigos têm 1% de chance de dropar equipamento.
                </div>
              ) : (
                <div className="grid gap-1.5" style={{ maxHeight: 320, overflowY: "auto" }}>
                  {filteredInv.map((it) => (
                    <div key={it.uid} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2"
                         style={{ borderColor: RARITY_COLORS[it.rarity] + "55" }}>
                      <EquipmentIcon item={it} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white">
                          {BIOME_SETS.find(s => s.id === it.setId)?.name}
                          <span className="ml-1 text-[9px]" style={{ color: RARITY_COLORS[it.rarity] }}>{RARITY_NAMES[it.rarity]}</span>
                        </div>
                        <div className="text-[9px] text-white/50">
                          +{itemStats(it).dmg} dmg · +{itemStats(it).hp} hp · +{itemStats(it).def.toFixed(1)} def · Lv {it.level}
                        </div>
                      </div>
                      <button type="button" onPointerDown={(e) => { e.preventDefault(); onEquip(it.uid); }}
                        className="rounded bg-emerald-600/70 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500">Equipar</button>
                      <button type="button" onPointerDown={(e) => { e.preventDefault(); onDiscard(it.uid); }}
                        className="rounded bg-red-600/40 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-500/60">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-orange-500/25 bg-gradient-to-br from-orange-950/30 to-black p-4">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-orange-300/80">Ferreiro de Rimhold</div>
              <div className="mb-3 text-[11px] text-white/70">
                Cada raridade requer <b>{GEMS_PER_UPGRADE}</b> jóias da cor correspondente:
                <span className="ml-1 text-emerald-300">Verde</span> →{" "}
                <span className="text-sky-300">Azul</span> →{" "}
                <span className="text-purple-300">Roxa</span> →{" "}
                <span className="text-amber-300">Amarela</span>
              </div>
              {flash && <div className="mb-2 rounded bg-black/40 px-2 py-1 text-[10px] text-amber-300">{flash}</div>}
              <div className="grid gap-2">
                {EQUIP_SLOTS.map((s) => {
                  const it = p.equipped[s];
                  if (!it) {
                    return (
                      <div key={s} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2 opacity-50">
                        <div className="h-9 w-9 rounded bg-black/40" />
                        <div className="flex-1 text-[11px] text-white/50">{SLOT_LABEL[s]} — vazio</div>
                      </div>
                    );
                  }
                  const nextRarity = it.rarity < 4 ? (it.rarity + 1) : null;
                  const gem = gemForUpgrade(it.rarity);
                  const have = gem ? (p.gems[gem] ?? 0) : 0;
                  const canUpgrade = gem !== null && have >= GEMS_PER_UPGRADE;
                  return (
                    <div key={s} className="flex items-center gap-2 rounded-lg border p-2"
                         style={{ borderColor: RARITY_COLORS[it.rarity] + "55" }}>
                      <EquipmentIcon item={it} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{SLOT_LABEL[s]}</div>
                        <div className="text-[10px]" style={{ color: RARITY_COLORS[it.rarity] }}>
                          {RARITY_NAMES[it.rarity]}{nextRarity !== null && <span className="text-white/40"> → <span style={{ color: RARITY_COLORS[nextRarity] }}>{RARITY_NAMES[nextRarity]}</span></span>}
                        </div>
                      </div>
                      {gem && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <GemIcon gem={gem} size={16} />
                          <span className={have >= GEMS_PER_UPGRADE ? "text-emerald-300" : "text-red-300"}>
                            {have}/{GEMS_PER_UPGRADE}
                          </span>
                        </div>
                      )}
                      <button type="button" disabled={!canUpgrade}
                        onPointerDown={(e) => { e.preventDefault(); if (!canUpgrade) return; const r = onUpgrade(s); setFlash(r.msg); }}
                        className={`rounded px-2 py-1 text-[10px] font-bold ${canUpgrade ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-white/5 text-white/30 cursor-not-allowed"}`}>
                        {it.rarity >= 4 ? "Máximo" : "Melhorar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GameCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<GameController | null>(null);
  const [ui, setUi] = useState<UiState | null>(null);
  const [showSkills, setShowSkills] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showAch, setShowAch] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [showEquip, setShowEquip] = useState(false);
  const [equipTab, setEquipTab] = useState<"gear" | "forge">("gear");

  useEffect(() => {
    let disposed = false;
    let ctrl: GameController | null = null;
    if (!mountRef.current) return;
    startGame(mountRef.current).then((c) => {
      if (disposed) { c.destroy(); return; }
      ctrl = c;
      controllerRef.current = c;
      c.onUiChange((u) => setUi(u));
      c.onForgeOpen(() => { setShowEquip(true); setEquipTab("forge"); });
    });

    const keys = new Set<string>();
    const updateInput = () => {
      if (!controllerRef.current) return;
      let x = 0, y = 0;
      if (keys.has("ArrowLeft") || keys.has("KeyA")) x = -1;
      else if (keys.has("ArrowRight") || keys.has("KeyD")) x = 1;
      if (keys.has("ArrowUp") || keys.has("KeyW")) y = -1;
      else if (keys.has("ArrowDown") || keys.has("KeyS")) y = 1;
      controllerRef.current.setInput(x || y ? { x, y } : null);
    };
    const onDown = (e: KeyboardEvent) => {
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
      if (e.code === "Space") { controllerRef.current?.attack(); return; }
      if (e.code === "KeyH") { controllerRef.current?.heal(); return; }
      if (e.code === "KeyK") { setShowSkills((s) => !s); return; }
      if (e.code === "KeyM") { setShowMap((s) => !s); return; }
      if (e.code === "KeyB") { setShowBestiary((s) => !s); return; }
      if (e.code === "KeyJ") { setShowAch((s) => !s); return; }
      if (e.code === "KeyL") { setShowAbilities((s) => !s); return; }
      if (e.code === "KeyQ") { controllerRef.current?.useAbility(0); return; }
      if (e.code === "KeyE") { controllerRef.current?.useAbility(1); return; }
      if (e.code === "KeyR") { controllerRef.current?.useAbility(2); return; }
      if (e.code === "KeyF") { controllerRef.current?.useAbility(3); return; }
      if (e.code === "KeyI") { setShowEquip((s) => !s); return; }
      if (e.code === "Digit1") { controllerRef.current?.setClass("melee"); return; }
      if (e.code === "Digit2") { controllerRef.current?.setClass("archer"); return; }
      if (e.code === "Digit3") { controllerRef.current?.setClass("mage"); return; }
      keys.add(e.code); updateInput();
    };
    const onUp = (e: KeyboardEvent) => { keys.delete(e.code); updateInput(); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      disposed = true;
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      ctrl?.destroy();
      controllerRef.current = null;
    };
  }, []);

  const joyRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = joyRef.current;
    if (!el) return;
    let active = false, cx = 0, cy = 0;
    const send = (dx: number, dy: number) => {
      const dead = 18; let ix = 0, iy = 0;
      if (Math.abs(dx) > dead || Math.abs(dy) > dead) {
        if (Math.abs(dx) > Math.abs(dy)) ix = Math.sign(dx);
        else iy = Math.sign(dy);
      }
      controllerRef.current?.setInput(ix || iy ? { x: ix, y: iy } : null);
    };
    const onStart = (e: PointerEvent) => {
      active = true;
      const rect = el.getBoundingClientRect();
      cx = rect.left + rect.width / 2; cy = rect.top + rect.height / 2;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const clamp = 40;
      setKnob({ x: Math.max(-clamp, Math.min(clamp, dx)), y: Math.max(-clamp, Math.min(clamp, dy)) });
      send(dx, dy);
    };
    const onEnd = () => { active = false; setKnob({ x: 0, y: 0 }); controllerRef.current?.setInput(null); };
    el.addEventListener("pointerdown", onStart);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    return () => {
      el.removeEventListener("pointerdown", onStart);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
    };
  }, []);

  const p = ui?.player;
  const worldImage = useWorldMapImage(320);

  const currentBiomeId =
    ui ? (Object.keys(BIOMES).find((k) => BIOMES[k].name === ui.biome) ?? "meadow") : "meadow";
  const ambientTint = BIOMES[currentBiomeId]?.bg ?? "#000000";

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black text-white select-none">
      <div ref={mountRef} className="absolute inset-0" style={{ imageRendering: "pixelated" }} />

      <div className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{ background: `radial-gradient(ellipse at center, transparent 45%, ${ambientTint} 100%)`, opacity: 0.85 }} />
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ background: `radial-gradient(ellipse at center, ${ambientTint}00 50%, ${ambientTint}88 100%)` }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 3px)" }} />

      <AmbientOverlay biomeId={currentBiomeId} />

      {p && (
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-lg border border-white/10 bg-black/70 px-3 py-2 font-mono text-xs shadow-2xl backdrop-blur-md">
          <div className="text-amber-200 tracking-widest uppercase">Rimhold</div>
          {ui?.location && <div className="text-emerald-300">{ui.location}</div>}
          <div>Lv {p.level} · XP {p.xp}/{p.xpNext}</div>
          <div className="text-red-300">HP {p.hp}/{p.maxHp}</div>
          <div className="text-yellow-300">Gold {p.gold} · Kills {p.kills}</div>
          <div className="text-sky-300">
            Classe: <span style={{ color: `#${CLASSES[p.cls].color.toString(16).padStart(6,"0")}` }}>
              {CLASSES[p.cls].name}
            </span>
          </div>
          {/* Tan bar */}
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[9px] text-amber-400/80">☀ Bronze {p.tan}/10</span>
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded bg-white/10">
            <div className="h-full transition-all"
                 style={{ width: `${p.tanXp}%`, background: "linear-gradient(90deg,#fde68a,#b45309)", boxShadow: "0 0 6px #f59e0b" }} />
          </div>
        </div>
      )}

      {ui && (
        <div className="pointer-events-none absolute right-3 top-3 max-w-xs rounded-lg border border-white/10 bg-black/70 px-3 py-2 font-mono text-[10px] leading-tight shadow-2xl backdrop-blur-md">
          {ui.log.map((l, i) => <div key={i} className="opacity-90">{l}</div>)}
        </div>
      )}

      {p && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/60 p-1 backdrop-blur-md">
          <button type="button"
            onPointerDown={(e) => { e.preventDefault(); setShowClassPicker(true); }}
            className="flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/20"
            style={{ boxShadow: `0 0 12px #${CLASSES[p.cls].color.toString(16).padStart(6,"0")}66, inset 0 0 0 1px #${CLASSES[p.cls].color.toString(16).padStart(6,"0")}` }}>
            <img src={portraitFor(p.cls)} alt="" className="h-5 w-5 rounded-sm object-cover" />
            <span style={{ color: `#${CLASSES[p.cls].color.toString(16).padStart(6,"0")}` }}>{CLASSES[p.cls].name}</span>
            <span className="text-white/50">▾</span>
          </button>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowAbilities(true); }}
            className="ml-1 rounded bg-fuchsia-600/80 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-fuchsia-500">Habilidades (L)</button>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowSkills(true); }}
            className="ml-1 rounded bg-indigo-600/80 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-indigo-500">Skills (K)</button>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowMap(true); }}
            className="rounded bg-emerald-600/80 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-emerald-500">Mapa (M)</button>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowBestiary(true); }}
            className="rounded bg-rose-600/80 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-rose-500">Bestiário (B)</button>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowEquip(true); setEquipTab("gear"); }}
            className="rounded bg-orange-600/80 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-orange-500">Equipamento (I)</button>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowAch(true); }}
            className="rounded bg-amber-600/80 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-amber-500">Conquistas (J)</button>
        </div>
      )}

      {/* ============ CLASS PICKER MODAL ============ */}
      {p && showClassPicker && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in"
             onPointerDown={() => setShowClassPicker(false)}>
          <div className="relative w-[96%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-6 font-mono shadow-[0_40px_100px_-10px_rgba(0,0,0,0.9)]"
               onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">Panteão de Rimhold</div>
                <div className="text-2xl font-bold text-white">Escolha sua Classe</div>
                <div className="text-[10px] text-white/50">8 arquétipos únicos · cada um com 4 habilidades exclusivas</div>
              </div>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowClassPicker(false); }}
                      className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CLASS_ORDER.map((c) => {
                const def = CLASSES[c];
                const hex = "#" + def.color.toString(16).padStart(6, "0");
                const active = p.cls === c;
                return (
                  <button key={c} type="button"
                    onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.setClass(c); setShowClassPicker(false); }}
                    className={`group relative flex flex-col items-center overflow-hidden rounded-xl border-2 p-3 text-left transition ${
                      active ? "border-white bg-white/10" : "border-white/10 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.08]"
                    }`}
                    style={{ boxShadow: active ? `0 0 24px ${hex}88, inset 0 0 20px ${hex}22` : `inset 0 0 12px ${hex}11` }}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                         style={{ background: `radial-gradient(circle at 50% 20%, ${hex}, transparent 65%)` }} />
                    <img src={portraitFor(c)} alt=""
                         className="relative h-20 w-20 rounded-lg border border-white/20 object-cover"
                         style={{ boxShadow: `0 0 18px ${hex}77`, filter: `hue-rotate(0deg) saturate(1.1)` }} />
                    <div className="relative mt-2 text-center">
                      <div className="text-sm font-bold" style={{ color: hex, textShadow: `0 0 8px ${hex}66` }}>{def.name}</div>
                      <div className="mt-1 text-[9px] leading-tight text-white/60">{def.tagline}</div>
                    </div>
                    <div className="relative mt-2 flex w-full flex-wrap justify-center gap-1">
                      {ABILITIES[c].map((a) => (
                        <span key={a.id} className="rounded bg-black/40 px-1.5 py-0.5 text-[8px] text-white/70" title={a.desc}>
                          <span style={{ color: hex }}>{a.key}</span> {a.name}
                        </span>
                      ))}
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-black">ATIVA</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ ABILITIES BAR (4 slots, may be empty) ============ */}
      {p && ui && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-black/70 p-1.5 backdrop-blur-md shadow-2xl">
          {[0, 1, 2, 3].map((i) => {
            const a = ui.abilities[i];
            if (!a) {
              return (
                <button key={`empty-${i}`} type="button" title="Slot vazio — abra Habilidades"
                  onPointerDown={(e) => { e.preventDefault(); setShowAbilities(true); }}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-white/25 bg-black/40 font-mono text-[10px] text-white/40 hover:bg-white/10">
                  +
                </button>
              );
            }
            const ready = p.cooldowns[a.id] ?? 0;
            const remain = Math.max(0, ready - ui.now);
            const pct = 1 - Math.min(1, remain / a.cooldownMs);
            const isReady = remain <= 0;
            const hex = "#" + a.color.toString(16).padStart(6, "0");
            return (
              <button key={a.id} type="button" title={`${a.name}\n${a.desc}`}
                onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.useAbility(i as 0|1|2|3); }}
                className={`relative flex h-7 w-7 flex-col items-center justify-center overflow-hidden rounded-md border font-mono text-[8px] font-bold transition ${
                  isReady ? "border-white/30 bg-white/10 hover:bg-white/20 text-white" : "border-white/10 bg-black/60 text-white/50"
                }`}
                style={isReady ? { boxShadow: `0 0 6px ${hex}88, inset 0 0 6px ${hex}33` } : undefined}>
                {!isReady && (
                  <div className="absolute inset-0 bg-black/70" style={{ clipPath: `inset(0 0 ${pct * 100}% 0)` }} />
                )}
                <div className="text-[9px] leading-none" style={{ color: isReady ? hex : "#a1a1aa" }}>{i + 1}</div>
                {!isReady && <div className="absolute bottom-0 text-[7px] leading-none text-white/70">{(remain/1000).toFixed(0)}</div>}
              </button>
            );
          })}
        </div>
      )}

      {/* ============ ABILITIES MANAGEMENT MODAL ============ */}
      {p && ui && showAbilities && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in"
             onPointerDown={() => setShowAbilities(false)}>
          <div className="relative w-[96%] max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-5 font-mono shadow-2xl"
               onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-300/80">Grimório</div>
                <div className="text-xl font-bold text-white">Habilidades — {CLASSES[p.cls].name}</div>
                <div className="text-[10px] text-white/50">Compre com ouro e equipe até 4 nos slots · <span className="text-yellow-300">{p.gold}g</span></div>
              </div>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowAbilities(false); }}
                      className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
            </div>

            {/* Current loadout */}
            <div className="mb-4">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-amber-300/80">Loadout Ativo (4 slots)</div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => {
                  const a = ui.abilities[i];
                  return (
                    <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                      <div className="text-[9px] text-white/40 mb-1">Slot {i + 1}</div>
                      {a ? (
                        <>
                          <div className="text-[11px] font-bold text-white truncate" style={{ color: "#" + a.color.toString(16).padStart(6, "0") }}>{a.name}</div>
                          <button type="button" onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.equipAbility(i as 0|1|2|3, null); }}
                                  className="mt-1 rounded bg-red-600/60 px-2 py-0.5 text-[9px] text-white hover:bg-red-500">Remover</button>
                        </>
                      ) : (
                        <div className="text-[10px] text-white/40 italic py-1">vazio</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All 6 abilities */}
            <div className="mb-2 text-[10px] uppercase tracking-widest text-amber-300/80">Habilidades da Classe (6 disponíveis)</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ui.abilityPool.map((a) => {
                const owned = ui.ownedAbilityIds.includes(a.id);
                const equipped = ui.abilities.some((s) => s?.id === a.id);
                const hex = "#" + a.color.toString(16).padStart(6, "0");
                const canBuy = !owned && p.gold >= a.cost;
                return (
                  <div key={a.id} className={`rounded-lg border p-2.5 ${equipped ? "border-emerald-400/60 bg-emerald-500/10" : owned ? "border-white/20 bg-white/5" : "border-white/10 bg-black/40 opacity-90"}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white" style={{ color: hex }}>{a.name}</span>
                      <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white/70">CD {(a.cooldownMs/1000).toFixed(0)}s</span>
                    </div>
                    <div className="mt-1 text-[10px] leading-tight text-white/70">{a.desc}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {!owned && (
                        <button type="button" disabled={!canBuy}
                                onPointerDown={(e) => { e.preventDefault(); if (canBuy) controllerRef.current?.buyAbility(a.id); }}
                                className={`flex-1 rounded px-2 py-1 text-[10px] font-bold ${canBuy ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
                          Comprar · {a.cost}g
                        </button>
                      )}
                      {owned && !equipped && (
                        <>
                          <span className="text-[9px] text-emerald-300 mr-1">✓ possui</span>
                          {[0, 1, 2, 3].map((i) => (
                            <button key={i} type="button"
                                    onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.equipAbility(i as 0|1|2|3, a.id); }}
                                    className="rounded bg-indigo-500/70 px-2 py-1 text-[9px] font-bold text-white hover:bg-indigo-400">
                              → S{i + 1}
                            </button>
                          ))}
                        </>
                      )}
                      {equipped && (
                        <span className="flex-1 rounded bg-emerald-600/50 px-2 py-1 text-center text-[10px] font-bold text-white">Equipada</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ SKILLS MODAL ============ */}
      {p && showSkills && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
             onPointerDown={() => setShowSkills(false)}>
          <div className="relative w-[92%] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-5 font-mono shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]"
               onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <img src={portraitFor(p.cls)} alt="" className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                   style={{ boxShadow: `0 0 20px #${CLASSES[p.cls].color.toString(16).padStart(6,"0")}55` }} />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-amber-300/80">Personagem</div>
                <div className="text-lg font-bold text-white">{CLASSES[p.cls].name}</div>
                <div className="text-[10px] text-white/50">Ficha de Habilidades</div>
              </div>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowSkills(false); }}
                      className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Nível Geral</span>
                <span className="text-amber-300 font-bold">Lv {p.level}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                     style={{ width: `${Math.min(100, (p.xp / p.xpNext) * 100)}%` }} />
              </div>
              <div className="mt-1 text-[10px] text-white/50">XP {p.xp}/{p.xpNext} · HP {p.hp}/{p.maxHp} · Gold {p.gold}</div>
            </div>

            <div className="grid gap-2.5">
              {SKILL_ORDER.map((s) => {
                const lvl = p.skills[s], xp = p.skillXp[s], next = p.skillXpNext[s];
                const pct = Math.min(100, (xp / next) * 100);
                return (
                  <div key={s} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SKILL_COLOR[s], boxShadow: `0 0 8px ${SKILL_COLOR[s]}` }} />
                        <span className="text-white">{SKILL_LABEL[s]}</span>
                      </span>
                      <span className="font-bold" style={{ color: SKILL_COLOR[s] }}>Lv {lvl}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-white/10">
                      <div className="h-full" style={{ width: `${pct}%`, background: SKILL_COLOR[s], boxShadow: `0 0 8px ${SKILL_COLOR[s]}` }} />
                    </div>
                    <div className="mt-1 text-[10px] text-white/50">{xp}/{next} XP para o próximo nível</div>
                  </div>
                );
              })}
            </div>

            {/* Abilities list */}
            <div className="mt-4">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-amber-300/80">Habilidades Especiais</div>
              <div className="grid grid-cols-2 gap-2">
                {ABILITIES[p.cls].map((a) => {
                  const hex = "#" + a.color.toString(16).padStart(6, "0");
                  return (
                    <div key={a.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{a.name}</span>
                        <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold" style={{ color: hex }}>{a.key}</span>
                      </div>
                      <div className="mt-1 text-[9px] text-white/60">{a.desc}</div>
                      <div className="mt-1 text-[9px]" style={{ color: hex }}>CD {(a.cooldownMs/1000).toFixed(0)}s</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ WORLD MAP MODAL ============ */}
      {ui && showMap && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
             onPointerDown={() => setShowMap(false)}>
          <div className="relative w-[94%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-5 font-mono shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)]"
               onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300/80">Cartografia de Rimhold</div>
                <div className="text-xl font-bold text-white">Mapa Mundi</div>
              </div>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowMap(false); }}
                      className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
            </div>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-amber-900/50 bg-[radial-gradient(circle,#3a2a1a_0%,#0a0705_100%)] p-2 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]">
                <div className="relative h-full w-full overflow-hidden rounded-lg" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)" }}>
                  {worldImage && (
                    <img src={worldImage} alt="Mapa mundi" className="absolute inset-0 h-full w-full" style={{ imageRendering: "pixelated" }} />
                  )}
                  <svg className="absolute right-2 top-2 h-12 w-12 opacity-60" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#fbbf24" strokeWidth="1" />
                    <path d="M20 2 L23 20 L20 38 L17 20 Z" fill="#fbbf24" opacity="0.9" />
                    <path d="M2 20 L20 17 L38 20 L20 23 Z" fill="#fbbf24" opacity="0.5" />
                    <text x="20" y="10" textAnchor="middle" fontSize="6" fill="#0a0705" fontWeight="bold">N</text>
                  </svg>
                  {WORLD_CENTERS.map((c) => {
                    const x = (c.cx / OVERWORLD_SIZE.w) * 100;
                    const y = (c.cy / OVERWORLD_SIZE.h) * 100;
                    const isHub = c.id === "meadow";
                    const bColor = BIOMES[c.id].mapColor;
                    return (
                      <div key={c.id} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                        <div className="relative">
                          <div className="absolute inset-0 -m-2 rounded-full animate-pulse"
                               style={{ background: `radial-gradient(circle, ${bColor}88, transparent 70%)` }} />
                          <div className={`relative h-3 w-3 rounded-full border ${isHub ? "border-amber-200" : "border-black/50"}`}
                               style={{ background: bColor, boxShadow: `0 0 8px ${bColor}` }} />
                        </div>
                        <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[8px] text-white opacity-0 group-hover:opacity-100 transition">
                          {BIOMES[c.id].name}
                        </div>
                      </div>
                    );
                  })}
                  {ui.mapId === "__overworld__" && (
                    <div className="absolute -translate-x-1/2 -translate-y-1/2"
                         style={{ left: `${(ui.playerTx / OVERWORLD_SIZE.w) * 100}%`, top: `${(ui.playerTy / OVERWORLD_SIZE.h) * 100}%` }}>
                      <div className="relative">
                        <div className="absolute inset-0 -m-3 animate-ping rounded-full bg-rose-500/50" />
                        <div className="relative h-4 w-4 rounded-full border-2 border-white bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="max-h-[440px] overflow-y-auto pr-1">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">Biomas & Andares · clique para viajar</div>
                <div className="flex flex-col gap-2">
                  <button type="button"
                          onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.teleport("__overworld__"); setShowMap(false); }}
                          className="group flex items-center justify-between rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent px-3 py-2.5 text-left text-xs hover:border-amber-400/50 hover:from-amber-500/20">
                    <span className="flex items-center gap-3">
                      <span className="inline-block h-4 w-4 rounded-sm shadow-lg" style={{ background: BIOMES.meadow.mapColor, boxShadow: `0 0 10px ${BIOMES.meadow.mapColor}` }} />
                      <span>
                        <span className="block text-white font-semibold">Prado de Rimhold</span>
                        <span className="block text-[9px] text-white/50">Hub central seguro</span>
                      </span>
                    </span>
                    <span className="text-amber-300 group-hover:translate-x-0.5 transition">→</span>
                  </button>

                  {DUNGEON_BIOMES.map((bid) => {
                    const b = BIOMES[bid];
                    return (
                      <div key={bid} className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent">
                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span className="inline-block h-4 w-4 shrink-0 rounded-sm shadow-lg" style={{ background: b.mapColor, boxShadow: `0 0 10px ${b.mapColor}88` }} />
                            <span className="min-w-0">
                              <span className="block truncate text-white font-semibold">{b.name}</span>
                              <span className="block truncate text-[9px] text-white/50">{b.dungeonName} · Tier {b.tier}</span>
                            </span>
                          </span>
                        </div>
                        <div className="flex gap-1 border-t border-white/5 bg-black/30 p-1.5">
                          {[1, 2, 3, 4, 5].map((f) => {
                            const target = `dungeon:${bid}:${f}`;
                            const active = ui.mapId === target;
                            return (
                              <button key={f} type="button"
                                      onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.teleport(target); setShowMap(false); }}
                                      className={`flex-1 rounded px-2 py-1.5 text-[10px] font-bold transition ${
                                        active ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                                               : "bg-white/5 text-white/80 hover:bg-white/15"
                                      }`}>
                                Andar {f}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-white/50">
              Você está em: <span className="text-emerald-300">{ui.location}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============ BESTIARY MODAL ============ */}
      {showBestiary && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
             onPointerDown={() => setShowBestiary(false)}>
          <div className="relative w-[94%] max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-5 font-mono shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)]"
               onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-rose-300/80">Compêndio</div>
                <div className="text-xl font-bold text-white">Bestiário de Rimhold</div>
              </div>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowBestiary(false); }}
                      className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
            </div>

            {BESTIARY_BIOMES.map((bid) => {
              const b = BIOMES[bid];
              const enemies = b.spawns.map(s => s.monster).filter(id => ENEMY_PORTRAIT[id]);
              if (enemies.length === 0) return null;
              return (
                <div key={bid} className="mb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: b.mapColor, boxShadow: `0 0 8px ${b.mapColor}` }} />
                    <span className="text-sm font-bold text-white">{b.name}</span>
                    <span className="text-[10px] text-white/40">· Tier {b.tier}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {enemies.map((eid) => {
                      const m = MONSTERS[eid];
                      return (
                        <div key={eid} className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                          <img src={ENEMY_PORTRAIT[eid]} alt={m.name} loading="lazy" width={64} height={64}
                               className="h-16 w-16 rounded border border-white/10 object-cover"
                               style={{ boxShadow: m.tint ? `0 0 12px #${m.tint.toString(16).padStart(6,"0")}66` : undefined }} />
                          <div className="min-w-0 flex-1 text-[10px]">
                            <div className="truncate font-bold text-white">{m.name}</div>
                            <div className="text-red-300">HP {m.baseHp}</div>
                            <div className="text-amber-300">DMG {m.baseDamage}</div>
                            <div className="text-emerald-300">XP {m.baseXp}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="mb-2">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: BIOMES.ruins.mapColor }} />
                <span className="text-sm font-bold text-white">Ruínas Submersas</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                  <img src={ENEMY_PORTRAIT.bone_knight} alt={MONSTERS.bone_knight.name} loading="lazy" width={64} height={64}
                       className="h-16 w-16 rounded border border-white/10 object-cover" />
                  <div className="min-w-0 flex-1 text-[10px]">
                    <div className="truncate font-bold text-white">{MONSTERS.bone_knight.name}</div>
                    <div className="text-red-300">HP {MONSTERS.bone_knight.baseHp}</div>
                    <div className="text-amber-300">DMG {MONSTERS.bone_knight.baseDamage}</div>
                    <div className="text-emerald-300">XP {MONSTERS.bone_knight.baseXp}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ACHIEVEMENTS MODAL ============ */}
      {p && showAch && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
             onPointerDown={() => setShowAch(false)}>
          <div className="relative w-[94%] max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-amber-500/25 bg-gradient-to-b from-neutral-900 to-neutral-950 p-5 font-mono shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)]"
               onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">Rimhold</div>
                <div className="text-xl font-bold text-white">Conquistas</div>
                <div className="text-[10px] text-white/50">{p.achievements.length}/{ACHIEVEMENTS.length} desbloqueadas</div>
              </div>
              <button type="button" onPointerDown={(e) => { e.preventDefault(); setShowAch(false); }}
                      className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20">Fechar</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ACHIEVEMENTS.map((a) => {
                const done = p.achievements.includes(a.id);
                const cur = a.metric === "kills" ? p.kills
                  : a.metric === "biomesVisited" ? p.biomesVisited.length
                  : a.metric === "level" ? p.level
                  : a.metric === "gold" ? p.gold
                  : a.metric === "abilitiesUsed" ? p.abilitiesUsed
                  : p.tan;
                const pct = Math.min(100, (cur / a.target) * 100);
                return (
                  <div key={a.id} className={`rounded-lg border p-2.5 ${done ? "border-amber-500/50 bg-amber-500/10" : "border-white/10 bg-white/5"}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={done ? "text-amber-300 font-bold" : "text-white font-bold"}>
                        {done ? "🏆 " : ""}{a.name}
                      </span>
                      <span className="text-[9px] text-emerald-300">+{a.reward}g</span>
                    </div>
                    <div className="mt-1 text-[10px] text-white/60">{a.desc}</div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-white/10">
                      <div className="h-full transition-all" style={{
                        width: `${pct}%`,
                        background: done ? "linear-gradient(90deg,#facc15,#f59e0b)" : "#38bdf8",
                        boxShadow: done ? "0 0 8px #f59e0b" : "0 0 6px #38bdf8",
                      }} />
                    </div>
                    <div className="mt-0.5 text-right text-[9px] text-white/40">{Math.min(cur, a.target)}/{a.target}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* ============ EQUIPMENT + FORGE MODAL ============ */}
      {p && ui && showEquip && (
        <EquipmentModal
          ui={ui}
          tab={equipTab}
          setTab={setEquipTab}
          onClose={() => setShowEquip(false)}
          onEquip={(uid) => controllerRef.current?.equipItem(uid)}
          onUnequip={(slot) => controllerRef.current?.unequipItem(slot)}
          onDiscard={(uid) => controllerRef.current?.discardItem(uid)}
          onUpgrade={(slot) => controllerRef.current?.upgradeEquipped(slot) ?? { ok: false, msg: "" }}
        />
      )}


      <div ref={joyRef}
           className="absolute bottom-8 left-8 h-32 w-32 touch-none rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-lg"
             style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
      </div>

      <div className="absolute bottom-12 right-8 flex flex-col items-end gap-3">
        <button type="button" onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.heal(); }}
                className="h-14 w-14 touch-none rounded-full border border-emerald-300/60 bg-emerald-500/70 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95">
          CURA
        </button>
        <button type="button" onPointerDown={(e) => { e.preventDefault(); controllerRef.current?.attack(); }}
                className="h-20 w-20 touch-none rounded-full border border-red-300/60 bg-red-500/70 font-mono text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] active:scale-95">
          ATK
        </button>
      </div>
    </div>
  );
}
