// Crafting overview modal — shows every known recipe grouped by profession.
// The heavy crafting engine lives in src/game/crafting.ts and consumes the
// live GameState; this modal is a browseable catalog with material lists,
// rarity hints, and unlock levels so players can plan builds.

import { useMemo, useState } from "react";
import { RECIPES, BENCH_NAME, PROFESSION_BENCH } from "@/game/crafting";
import { PROFESSION_NAME } from "@/game/engine";
import {
  PixelPanel,
  PixelTitle,
  PixelButton,
  StatChip,
  PIXEL_FONT,
  PIXEL_GOLD,
} from "./ui/pixel";

const KIND_ICON: Record<string, string> = {
  weapon: "⚔",
  armor: "🛡",
  potion: "🧪",
  material: "💎",
};

const KIND_COLOR: Record<string, string> = {
  weapon: "#ef4444",
  armor: "#60a5fa",
  potion: "#a855f7",
  material: "#f5c04a",
};

export default function CraftingModal() {
  const professions = useMemo(() => {
    const set = new Set(RECIPES.map((r) => r.profession));
    return Array.from(set);
  }, []);
  const [prof, setProf] = useState<string>(professions[0]);
  const list = RECIPES.filter((r) => r.profession === prof && !r.hidden);

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8", display: "flex", flexDirection: "column", gap: 10 }}>
      <PixelPanel tone="stone">
        <PixelTitle size={12}>OFICINA DE CRAFTING</PixelTitle>
        <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 6, letterSpacing: 1, lineHeight: 1.7 }}>
          FORJE ARMAS, POÇÕES, MANTOS E GEMAS · ABRA A OFICINA DENTRO DO JOGO PARA EXECUTAR AS RECEITAS
        </div>
      </PixelPanel>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {professions.map((p) => (
          <PixelButton
            key={p}
            variant={prof === p ? "gold" : "ghost"}
            active={prof === p}
            size={8}
            onClick={() => setProf(p)}
          >
            {PROFESSION_NAME[p as keyof typeof PROFESSION_NAME]}
          </PixelButton>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          maxHeight: "58vh",
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {list.map((r) => (
          <PixelPanel key={r.id} tone="wood">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  border: `2px solid ${KIND_COLOR[r.produces.kind]}`,
                  boxShadow: "inset 0 0 0 2px #000",
                  background: `${KIND_COLOR[r.produces.kind]}22`,
                }}
              >
                {KIND_ICON[r.produces.kind]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <PixelTitle size={9} color={r.secret ? "#ec4899" : PIXEL_GOLD}>
                  {r.name.toUpperCase()}
                </PixelTitle>
                <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 3, letterSpacing: 1, textTransform: "uppercase" }}>
                  NVL {r.minLevel} · {BENCH_NAME[PROFESSION_BENCH[r.profession]]}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
              <StatChip icon="🎯" value={r.produces.basePower} color="#f5c04a" />
              {r.produces.slots ? <StatChip icon="◆" value={`${r.produces.slots}slt`} color="#a855f7" /> : null}
              <StatChip icon="✦" value={`${r.xp}xp`} color="#38bdf8" />
            </div>
            <div style={{ marginTop: 8, fontSize: 7, color: "#c9a86a", letterSpacing: 1, lineHeight: 1.7 }}>
              MATERIAIS:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {Object.entries(r.materials).map(([k, v]) => (
                <span
                  key={k}
                  style={{
                    fontFamily: PIXEL_FONT,
                    fontSize: 7,
                    color: "#e8d5a8",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid #6b4a2b",
                    padding: "3px 6px",
                  }}
                >
                  {v}× {k}
                </span>
              ))}
            </div>
            {r.secret && (
              <div style={{ marginTop: 6, fontSize: 7, color: "#ec4899", letterSpacing: 1 }}>
                ★ RECEITA SECRETA
              </div>
            )}
          </PixelPanel>
        ))}
      </div>
    </div>
  );
}