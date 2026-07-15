// Fishing minigame. Similar rhythm to mining: click when the marker is in
// the green band to reel in a fish. Rewards go into the active character's
// fishing.materials bag and grant fishing skill XP.

import { useEffect, useRef, useState } from "react";
import { PIXEL_FONT, PIXEL_GOLD, PixelPanel, PixelButton, PixelBar } from "./ui/pixel";
import { useSkillsStore, getActiveCharacter, recordFishCatch, SKILL_META, skillXpForLevel } from "@/rucoy/skills";

type Fish = { id: string; name: string; color: string; weight: number; minLevel: number };
const FISH: Fish[] = [
  { id: "sardinha", name: "Sardinha da Floresta", color: "#a3a3a3", weight: 45, minLevel: 1 },
  { id: "truta",    name: "Truta de Cristal",     color: "#22d3ee", weight: 25, minLevel: 3 },
  { id: "carpa",    name: "Carpa Dourada",         color: "#facc15", weight: 15, minLevel: 6 },
  { id: "esturjao", name: "Esturjão Rúnico",       color: "#a78bfa", weight: 10, minLevel: 12 },
  { id: "leviata",  name: "Leviatã em Miniatura",  color: "#f472b6", weight: 3,  minLevel: 20 },
];

const BIOME_BANK = [
  "Foz da Floresta dos Murmúrios",
  "Lago Cristalino",
  "Oásis do Deserto Ardente",
  "Rio Congelado da Tundra",
  "Charco do Pântano Sombrio",
  "Fonte Termal da Mina",
  "Poça de Lava do Vulcão",
  "Cascata Celestial",
  "Abismo Marinho",
  "Rio do Caos",
];

function rollFish(level: number): Fish {
  const available = FISH.filter((f) => f.minLevel <= level + 2);
  const total = available.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for (const f of available) {
    if ((r -= f.weight) <= 0) return f;
  }
  return available[0];
}

export default function FishingModal() {
  useSkillsStore();
  const c = getActiveCharacter();
  const level = c.skills.fishing.level;
  const [biome, setBiome] = useState(0);
  const [state, setState] = useState<"idle" | "casting" | "bite" | "reeling" | "result">("idle");
  const [marker, setMarker] = useState(0); // 0..1
  const [target, setTarget] = useState({ start: 0.35, end: 0.55 });
  const [lastCatch, setLastCatch] = useState<Fish | null>(null);
  const rafRef = useRef<number | null>(null);
  const dirRef = useRef(1);
  const biteTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (biteTimeoutRef.current) window.clearTimeout(biteTimeoutRef.current);
  }, []);

  function startCast() {
    setState("casting");
    setLastCatch(null);
    const delay = 800 + Math.random() * 1600;
    biteTimeoutRef.current = window.setTimeout(() => {
      // Difficulty scales down as level goes up.
      const band = Math.max(0.10, 0.30 - level * 0.008);
      const start = 0.15 + Math.random() * (0.85 - band - 0.15);
      setTarget({ start, end: start + band });
      setMarker(0);
      dirRef.current = 1;
      setState("bite");
      const speed = 0.55 + Math.random() * 0.35; // per second
      let last = performance.now();
      const tick = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        setMarker((m) => {
          let n = m + dirRef.current * speed * dt;
          if (n >= 1) { n = 1; dirRef.current = -1; }
          if (n <= 0) { n = 0; dirRef.current = 1; }
          return n;
        });
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
  }

  function reel() {
    if (state !== "bite") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState("reeling");
    const hit = marker >= target.start && marker <= target.end;
    if (hit) {
      const fish = rollFish(level);
      recordFishCatch(fish.id, fish.name);
      setLastCatch(fish);
    } else {
      setLastCatch(null);
    }
    setState("result");
  }

  const fishing = c.fishing;

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10 }}>
      <PixelPanel tone="parchment" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: SKILL_META.fishing.color, letterSpacing: 2, fontSize: 10 }}>
            🎣 PESCA · NÍVEL {level}
          </span>
          <span style={{ fontSize: 8, color: "#c9a86a" }}>{fishing.caught} peixes</span>
        </div>
        <PixelBar value={c.skills.fishing.xp} max={skillXpForLevel(level)} color={SKILL_META.fishing.color} height={8} />
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {BIOME_BANK.map((b, i) => (
            <button
              key={i}
              onClick={() => setBiome(i)}
              style={{
                padding: "4px 8px",
                fontFamily: PIXEL_FONT,
                fontSize: 8,
                letterSpacing: 1,
                background: biome === i ? `${SKILL_META.fishing.color}44` : "rgba(0,0,0,0.4)",
                border: `2px solid ${biome === i ? SKILL_META.fishing.color : "#3a251a"}`,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </PixelPanel>

      <PixelPanel tone="wood" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8 }}>
          MINIGAME
        </div>
        {state === "idle" || state === "result" ? (
          <>
            {state === "result" && (
              <div
                style={{
                  padding: 8,
                  marginBottom: 8,
                  background: lastCatch ? `${lastCatch.color}22` : "rgba(239,68,68,0.15)",
                  border: `2px solid ${lastCatch ? lastCatch.color : "#ef4444"}`,
                }}
              >
                {lastCatch ? (
                  <>
                    <div style={{ color: lastCatch.color, fontSize: 10, letterSpacing: 1 }}>
                      +1 {lastCatch.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 8, color: "#c9a86a", marginTop: 3 }}>
                      Ganhou XP de pesca!
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#ef4444", fontSize: 10 }}>O peixe escapou!</div>
                )}
              </div>
            )}
            <PixelButton variant="gold" onClick={startCast} size={10} style={{ padding: "10px 12px", width: "100%" }}>
              Lançar Linha
            </PixelButton>
          </>
        ) : state === "casting" ? (
          <div style={{ padding: 12, textAlign: "center", color: PIXEL_GOLD, letterSpacing: 2 }}>
            Aguardando fisgada…
          </div>
        ) : (
          <div>
            <div style={{ position: "relative", height: 26, background: "#120a08", border: `2px solid ${SKILL_META.fishing.color}`, marginBottom: 8 }}>
              {/* target band */}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${target.start * 100}%`, width: `${(target.end - target.start) * 100}%`, background: `${SKILL_META.fishing.color}66` }} />
              {/* marker */}
              <div style={{ position: "absolute", top: -2, bottom: -2, left: `calc(${marker * 100}% - 2px)`, width: 4, background: "#fff", boxShadow: "0 0 6px #fff" }} />
            </div>
            <PixelButton variant="gold" onClick={reel} size={10} style={{ padding: "10px 12px", width: "100%" }}>
              FISGAR!
            </PixelButton>
          </div>
        )}
      </PixelPanel>

      {/* Bag of caught materials */}
      <PixelPanel tone="stone">
        <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8 }}>
          BOLSA DE PESCA
        </div>
        {Object.keys(fishing.materials).length === 0 ? (
          <div style={{ fontSize: 8, color: "#c9a86a", letterSpacing: 1 }}>
            Nenhum peixe capturado ainda. Ideal para culinária e poções.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 4, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            {Object.entries(fishing.materials).map(([id, count]) => {
              const f = FISH.find((x) => x.id === id);
              return (
                <div key={id} style={{ padding: 6, background: "rgba(0,0,0,0.4)", border: `2px solid ${f?.color || "#3a251a"}` }}>
                  <div style={{ fontSize: 8, color: f?.color || "#fff", letterSpacing: 1 }}>{f?.name || id}</div>
                  <div style={{ fontSize: 10, color: "#fff", marginTop: 2 }}>×{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </PixelPanel>
    </div>
  );
}
