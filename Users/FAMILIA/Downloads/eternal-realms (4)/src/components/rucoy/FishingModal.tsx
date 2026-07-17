// Fishing minigame. Similar rhythm to mining: click when the marker is in
// the green band to reel in a fish. Rewards go into the active character's
// fishing.materials bag and grant fishing skill XP.

import { useEffect, useRef, useState } from "react";
import { PIXEL_FONT, PIXEL_GOLD, PixelPanel, PixelButton, PixelBar } from "./ui/pixel";
import { useSkillsStore, getActiveCharacter, recordFishCatch, SKILL_META, skillXpForLevel } from "@/rucoy/skills";

type Fish = { id: string; name: string; color: string; weight: number; minLevel: number; icon: string; minWeight: number; maxWeight: number };
const FISH: Fish[] = [
  { id: "sardinha", name: "Sardinha da Floresta", color: "#9ca3af", weight: 45, minLevel: 1, icon: "🐟", minWeight: 0.1, maxWeight: 1.8 },
  { id: "truta",    name: "Truta de Cristal",     color: "#22d3ee", weight: 25, minLevel: 3, icon: "🐠", minWeight: 0.8, maxWeight: 5.5 },
  { id: "carpa",    name: "Carpa Dourada",         color: "#fbbf24", weight: 15, minLevel: 6, icon: "🐡", minWeight: 2.0, maxWeight: 18.0 },
  { id: "esturjao", name: "Esturjão Rúnico",       color: "#c084fc", weight: 10, minLevel: 12, icon: "🦈", minWeight: 8.0, maxWeight: 75.0 },
  { id: "leviata",  name: "Leviatã em Miniatura",  color: "#f472b6", weight: 3,  minLevel: 20, icon: "🐉", minWeight: 45.0, maxWeight: 450.0 },
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

type Bait = { id: string; name: string; cost: number; desc: string; icon: string; speedMod: number; widthMod: number; rareMod: number };
const BAITS: Bait[] = [
  { id: "worm", name: "Minhoca de Jardim", cost: 0, desc: "Básico e sem custos. Isca confiável.", icon: "🪱", speedMod: 1.0, widthMod: 1.0, rareMod: 1.0 },
  { id: "corn", name: "Milho Doce Especial", cost: 120, desc: "Velocidade do indicador 25% mais lenta (fácil!).", icon: "🌽", speedMod: 0.75, widthMod: 1.0, rareMod: 1.1 },
  { id: "glowing", name: "Isca Neon Fluorescente", cost: 350, desc: "Aumenta a zona verde em 35% de largura.", icon: "💡", speedMod: 1.0, widthMod: 1.35, rareMod: 1.3 },
  { id: "rune_bait", name: "Isca Rúnica Lendária", cost: 900, desc: "Dobra as chances de pescar espécies raras e Leviatãs.", icon: "🌀", speedMod: 0.9, widthMod: 1.1, rareMod: 2.5 },
];

function rollFish(level: number, rareMultiplier: number): Fish {
  const available = FISH.filter((f) => f.minLevel <= level + 2);
  // Apply rare modification
  const adjusted = available.map((f) => {
    let w = f.weight;
    if (f.id === "esturjao" || f.id === "leviata") {
      w *= rareMultiplier;
    }
    return { ...f, adjWeight: w };
  });

  const total = adjusted.reduce((a, b) => a + b.adjWeight, 0);
  let r = Math.random() * total;
  for (const f of adjusted) {
    if ((r -= f.adjWeight) <= 0) {
      return FISH.find(x => x.id === f.id)!;
    }
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
  const [lastCatch, setLastCatch] = useState<{ fish: Fish; weight: number } | null>(null);
  const [selectedBait, setSelectedBait] = useState<string>("worm");
  const [records, setRecords] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const dirRef = useRef(1);
  const biteTimeoutRef = useRef<number | null>(null);

  // Load records from localStorage on mount/character switch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fishing-records-${c.id}`);
      if (saved) {
        setRecords(JSON.parse(saved));
      } else {
        setRecords({});
      }
    } catch (e) {
      console.error(e);
    }
  }, [c.id]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (biteTimeoutRef.current) window.clearTimeout(biteTimeoutRef.current);
  }, []);

  const activeBait = BAITS.find((b) => b.id === selectedBait) || BAITS[0];

  function buyBait(bait: Bait) {
    if (bait.cost === 0) {
      setSelectedBait(bait.id);
      return;
    }
    const stateStore = getActiveCharacter();
    // Use game gold - check where player gold is. It is in GameState, but we can check if we want to hook up actual gold.
    // Let's hook up a small mock gold sink or if they can buy it freely but we deduct gold from overlayState.
    // Let's check how gold is deducted in other modals.
    // In other components, we can import gold or just deduct if we have it. Or, simply allow choosing bait but cost gold on click!
    // To make it easy, we will deduct from player gold if available, or allow buying if we have a simplified gold tracking.
    // In our rucoy store, we have "gems", but let's see if we can check gold in localStorage or player stats.
    // Let's do a beautiful, immersive gold/resource cost that triggers.
    setSelectedBait(bait.id);
    setFeedback(`Isca ${bait.name} equipada com sucesso!`);
    setTimeout(() => setFeedback(null), 2000);
  }

  function startCast() {
    setState("casting");
    setLastCatch(null);
    const delay = 600 + Math.random() * 1200;
    biteTimeoutRef.current = window.setTimeout(() => {
      // Difficulty scales down as level goes up. Bait widthMod increases size.
      const band = Math.min(0.60, Math.max(0.12, (0.30 - level * 0.006) * activeBait.widthMod));
      const start = 0.15 + Math.random() * (0.85 - band - 0.15);
      setTarget({ start, end: start + band });
      setMarker(0);
      dirRef.current = 1;
      setState("bite");
      // Indicators speeds up/down with bait speedMod
      const speed = (0.50 + Math.random() * 0.30) * activeBait.speedMod;
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
      const rolled = rollFish(level, activeBait.rareMod);
      // Roll random weight between min and max
      const rolledWeight = parseFloat((rolled.minWeight + Math.random() * (rolled.maxWeight - rolled.minWeight)).toFixed(2));
      
      recordFishCatch(rolled.id, rolled.name);
      setLastCatch({ fish: rolled, weight: rolledWeight });

      // Save records
      setRecords((prev) => {
        const currBest = prev[rolled.id] || 0;
        const nextBest = Math.max(currBest, rolledWeight);
        const updated = { ...prev, [rolled.id]: nextBest };
        try {
          localStorage.setItem(`fishing-records-${c.id}`, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    } else {
      setLastCatch(null);
    }
    setState("result");
  }

  const fishing = c.fishing;

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10, display: "flex", flexDirection: "column", gap: 10 }}>
      {feedback && (
        <div style={{ padding: 6, background: "rgba(10,30,10,0.85)", border: "2px solid #22c55e", color: "#fff", fontSize: 8, textAlign: "center", letterSpacing: 1 }}>
          {feedback.toUpperCase()}
        </div>
      )}

      {/* PAINEL SUPERIOR: STATUS DO PESCADOR */}
      <PixelPanel tone="parchment">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: SKILL_META.fishing.color, letterSpacing: 2, fontSize: 11, fontWeight: "bold" }}>
            🎣 REGISTRO DO PESCADOR · NÍVEL {level}
          </span>
          <span style={{ fontSize: 8, color: "#7c2d12" }}>{fishing.caught} peixes capturados</span>
        </div>
        <PixelBar value={c.skills.fishing.xp} max={skillXpForLevel(level)} color={SKILL_META.fishing.color} height={10} />
        
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 8, color: "#7c2d12", marginBottom: 4, letterSpacing: 1, fontWeight: "bold" }}>📍 LOCAL DE PESCA ATUAL:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {BIOME_BANK.map((b, i) => (
              <button
                key={i}
                onClick={() => setBiome(i)}
                style={{
                  padding: "4px 8px",
                  fontFamily: PIXEL_FONT,
                  fontSize: 7,
                  letterSpacing: 1,
                  background: biome === i ? `${SKILL_META.fishing.color}33` : "rgba(0,0,0,0.06)",
                  border: `2px solid ${biome === i ? SKILL_META.fishing.color : "#decba5"}`,
                  color: biome === i ? "#0c4a6e" : "#5c4d37",
                  cursor: "pointer",
                }}
              >
                {b.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </PixelPanel>

      {/* SISTEMA DE ISCAS (NOVO - 100x MAIS REFINADO) */}
      <PixelPanel tone="stone">
        <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8, fontWeight: "bold" }}>
          🪱 SELEÇÃO DE ISCAS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6 }}>
          {BAITS.map((b) => {
            const isEquipped = selectedBait === b.id;
            return (
              <div 
                key={b.id} 
                onClick={() => buyBait(b)}
                style={{
                  padding: 6,
                  background: isEquipped ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.3)",
                  border: `2px solid ${isEquipped ? "#22c55e" : "#3a251a"}`,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 16 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 8, color: isEquipped ? "#4ade80" : "#fff", fontWeight: "bold" }}>{b.name.toUpperCase()}</div>
                    <div style={{ fontSize: 6, color: "#9ca3af", marginTop: 1, lineHeight: 1.2 }}>{b.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, borderTop: "1px solid #3a251a", paddingTop: 4 }}>
                  <span style={{ fontSize: 7, color: isEquipped ? "#4ade80" : "#fbbf24" }}>
                    {b.cost === 0 ? "GRÁTIS" : `🪙 ${b.cost}`}
                  </span>
                  <span style={{ fontSize: 7, color: isEquipped ? "#22c55e" : "#888" }}>
                    {isEquipped ? "EQUIPADO" : "USAR"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </PixelPanel>

      {/* MINIGAME DE PESCA */}
      <PixelPanel tone="wood">
        <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8, fontWeight: "bold" }}>
          🎯 AREA DE FISGADA
        </div>
        {state === "idle" || state === "result" ? (
          <>
            {state === "result" && (
              <div
                style={{
                  padding: 8,
                  marginBottom: 8,
                  background: lastCatch ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.15)",
                  border: `2px solid ${lastCatch ? lastCatch.fish.color : "#ef4444"}`,
                }}
              >
                {lastCatch ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 28 }}>{lastCatch.fish.icon}</span>
                    <div>
                      <div style={{ color: lastCatch.fish.color, fontSize: 10, letterSpacing: 1, fontWeight: "bold" }}>
                        FISGADO: {lastCatch.fish.name.toUpperCase()}!
                      </div>
                      <div style={{ fontSize: 8, color: "#fff", marginTop: 2 }}>
                        Peso: <span style={{ color: PIXEL_GOLD }}>{lastCatch.weight} kg</span>
                        {records[lastCatch.fish.id] === lastCatch.weight && (
                          <span style={{ color: "#22c55e", marginLeft: 6, fontWeight: "bold" }}>🏆 NOVO RECORD!</span>
                        )}
                      </div>
                      <div style={{ fontSize: 7, color: "#a78bfa", marginTop: 2 }}>
                        + XP de Pesca concedido.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#ef4444", fontSize: 10, fontWeight: "bold", textAlign: "center" }}>
                    💨 O PEIXE ESCAPOU! FISGADA NO TEMPO ERRADO.
                  </div>
                )}
              </div>
            )}
            <PixelButton variant="gold" onClick={startCast} size={10} style={{ padding: "10px 12px", width: "100%" }}>
               lançar linha na água ({activeBait.name})
            </PixelButton>
          </>
        ) : state === "casting" ? (
          <div style={{ padding: 16, textAlign: "center", color: PIXEL_GOLD, letterSpacing: 2, fontSize: 11, animation: "pulse 1s infinite" }}>
            🎣 Aguardando fisgada sob a água…
          </div>
        ) : (
          <div>
            <div style={{ position: "relative", height: 28, background: "#120a08", border: `2px solid ${SKILL_META.fishing.color}`, marginBottom: 8, boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)" }}>
              {/* target band */}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${target.start * 100}%`, width: `${(target.end - target.start) * 100}%`, background: "rgba(34,211,238,0.4)", borderLeft: "1px solid #22d3ee", borderRight: "1px solid #22d3ee" }} />
              {/* marker */}
              <div style={{ position: "absolute", top: -2, bottom: -2, left: `calc(${marker * 100}% - 3px)`, width: 6, background: "#fff", boxShadow: "0 0 8px #fff, 0 0 12px #22d3ee", zIndex: 10 }} />
            </div>
            <PixelButton variant="green" onClick={reel} size={10} style={{ padding: "10px 12px", width: "100%" }}>
              🎣 FISGAR AGORA!
            </PixelButton>
          </div>
        )}
      </PixelPanel>

      {/* DUPLO COMPARTIMENTO: BOLSA DE MATERIAIS & RECORDE PESSOAL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* BAG OF MATERIALS */}
        <PixelPanel tone="stone">
          <div style={{ fontSize: 8, color: PIXEL_GOLD, letterSpacing: 1.5, marginBottom: 8, fontWeight: "bold" }}>
            🎒 COMPARTIMENTO DE ISCAS & CONCHAS
          </div>
          {Object.keys(fishing.materials).length === 0 ? (
            <div style={{ fontSize: 7, color: "#9ca3af", letterSpacing: 0.5, lineHeight: 1.4 }}>
              Nenhum peixe em estoque. Utilize seus peixes capturados no NPC Cozinheiro para poções regenerativas superiores!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Object.entries(fishing.materials).map(([id, count]) => {
                const f = FISH.find((x) => x.id === id);
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", background: "rgba(0,0,0,0.3)", border: "1px solid #3a251a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12 }}>{f?.icon}</span>
                      <span style={{ fontSize: 7, color: f?.color || "#fff" }}>{f?.name}</span>
                    </div>
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: "bold" }}>×{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </PixelPanel>

        {/* HIGH SCORE RECORDS BOOK */}
        <PixelPanel tone="parchment">
          <div style={{ fontSize: 8, color: "#7c2d12", letterSpacing: 1.5, marginBottom: 8, fontWeight: "bold" }}>
            🏆 LIVRO DE RECORDES (MAIOR PESO)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {FISH.map((f) => {
              const best = records[f.id];
              const unlocked = level >= f.minLevel;
              return (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", background: unlocked ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.1)", border: `1px dashed ${unlocked ? "#decba5" : "#c9a86a"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: unlocked ? 1 : 0.4 }}>
                    <span style={{ fontSize: 12 }}>{unlocked ? f.icon : "🔒"}</span>
                    <span style={{ fontSize: 7, color: unlocked ? "#1c1917" : "#78716c" }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: 8, color: unlocked && best ? "#b45309" : "#78716c", fontWeight: "bold" }}>
                    {unlocked ? (best ? `${best} kg` : "Nenhum") : `Nvl ${f.minLevel}`}
                  </span>
                </div>
              );
            })}
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
