import { useState } from "react";
import { Heart, Zap, Brain, Swords, Plus } from "lucide-react";
import { useHostedGame, useHostedTick, bumpVersion } from "@/game/host";
import { allocAttr, recalculateStats } from "@/game/game";
import {
  PIXEL_FONT,
  PIXEL_GOLD,
  PIXEL_BORDER,
  PixelPanel,
  PixelButton,
  PixelBar,
} from "./ui/pixel";
import SkillsTab from "./SkillsTab";

type AttrKey = "str" | "agi" | "int" | "vit";

const ATTR_META: Record<
  AttrKey,
  { label: string; short: string; color: string; icon: typeof Swords; desc: string }
> = {
  str: {
    label: "Força",
    short: "STR",
    color: "#ff6b4a",
    icon: Swords,
    desc: "Aumenta o dano de ataque físico e o poder de habilidades corpo-a-corpo.",
  },
  agi: {
    label: "Agilidade",
    short: "AGI",
    color: "#4ade80",
    icon: Zap,
    desc: "Aumenta o dano de habilidades ágeis (arqueiros, ladinos) e mobilidade.",
  },
  int: {
    label: "Inteligência",
    short: "INT",
    color: "#60a5fa",
    icon: Brain,
    desc: "Aumenta MP máximo, poder de feitiços mágicos e cura.",
  },
  vit: {
    label: "Vitalidade",
    short: "VIT",
    color: "#f472b6",
    icon: Heart,
    desc: "Aumenta HP máximo (+5 por ponto) e defesa base.",
  },
};

function AttrRow({
  k,
  value,
  canSpend,
  onAlloc,
}: {
  k: AttrKey;
  value: number;
  canSpend: boolean;
  onAlloc: () => void;
}) {
  const m = ATTR_META[k];
  const Icon = m.icon;
  // Visual bar caps at 100 just for display; users can allocate infinitely.
  const cap = Math.max(50, Math.ceil(value / 50) * 50);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 10,
        background: "rgba(0,0,0,0.5)",
        border: `2px solid ${m.color}55`,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle, ${m.color}44 0%, #000 80%)`,
          border: `2px solid ${m.color}`,
        }}
      >
        <Icon size={26} color={m.color} strokeWidth={2.4} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              color: m.color,
              fontSize: 10,
              letterSpacing: 2,
            }}
          >
            {m.label.toUpperCase()}
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 14,
              letterSpacing: 1,
              textShadow: `0 0 6px ${m.color}`,
            }}
          >
            {value}
          </span>
        </div>
        <PixelBar value={value} max={cap} color={m.color} height={8} />
        <div
          style={{
            fontSize: 7,
            color: "#c0b090",
            marginTop: 5,
            lineHeight: 1.5,
            letterSpacing: 0.5,
          }}
        >
          {m.desc}
        </div>
      </div>
      <PixelButton
        variant={canSpend ? "gold" : "ghost"}
        disabled={!canSpend}
        onClick={onAlloc}
        size={9}
        style={{ padding: "8px 10px", minWidth: 46 }}
        title="Investir 1 ponto"
      >
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Plus size={12} strokeWidth={3} />1
        </span>
      </PixelButton>
    </div>
  );
}

export default function AttributesModal() {
  const g = useHostedGame();
  useHostedTick(300);
  const [tab, setTab] = useState<"attrs" | "skills">("attrs");

  if (!g) {
    return (
      <div style={{ fontFamily: PIXEL_FONT, color: PIXEL_GOLD, fontSize: 10 }}>
        Carregando atributos…
      </div>
    );
  }
  const p = g.player;
  const doAlloc = (k: AttrKey) => {
    if (p.attrPoints <= 0) return;
    allocAttr(g, k);
    recalculateStats(g);
    bumpVersion();
  };

  const attrKeys: AttrKey[] = ["str", "agi", "int", "vit"];

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {(["attrs", "skills"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "8px 6px",
              fontFamily: PIXEL_FONT,
              fontSize: 9,
              letterSpacing: 1.5,
              cursor: "pointer",
              background: tab === t ? `linear-gradient(180deg, ${PIXEL_GOLD} 0%, #a06b1c 100%)` : "rgba(0,0,0,0.4)",
              color: tab === t ? "#120a08" : PIXEL_GOLD,
              border: `2px solid ${PIXEL_BORDER}`,
              boxShadow: tab === t ? "inset 0 0 0 1.5px #fff, inset 0 0 0 3px #120a08" : "inset 0 0 0 1.5px #120a08",
              textTransform: "uppercase",
            }}
          >
            {t === "attrs" ? "Atributos" : "Skills"}
          </button>
        ))}
      </div>

      {tab === "skills" ? <SkillsTab /> : (
      <>

      <PixelPanel tone="parchment" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <SummaryStat label="NÍVEL" value={p.level} color={PIXEL_GOLD} />
          <SummaryStat
            label="PONTOS"
            value={p.attrPoints}
            color={p.attrPoints > 0 ? "#4ade80" : "#94a3b8"}
            pulse={p.attrPoints > 0}
          />
          <SummaryStat label="ATAQUE" value={p.atk()} color="#ff6b4a" />
          <SummaryStat label="DEFESA" value={p.def()} color="#60a5fa" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div
              style={{
                fontSize: 8,
                color: "#f87171",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              HP {Math.round(p.hp)} / {p.maxHp}
            </div>
            <PixelBar value={p.hp} max={p.maxHp} color="#ef4444" height={10} />
          </div>
          <div>
            <div
              style={{
                fontSize: 8,
                color: "#60a5fa",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              MP {Math.round(p.mp)} / {p.maxMp}
            </div>
            <PixelBar value={p.mp} max={p.maxMp} color="#3b82f6" height={10} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              fontSize: 8,
              color: PIXEL_GOLD,
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            XP {Math.floor(p.xp)} / {p.xpNext}
          </div>
          <PixelBar value={p.xp} max={p.xpNext} color={PIXEL_GOLD} height={8} />
        </div>
      </PixelPanel>

      {/* Attribute rows */}
      <PixelPanel tone="wood">
        <div
          style={{
            color: PIXEL_GOLD,
            letterSpacing: 2,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>DISTRIBUIR ATRIBUTOS</span>
          {p.attrPoints > 0 && (
            <span
              style={{
                background: "#4ade80",
                color: "#052e16",
                padding: "3px 8px",
                fontSize: 9,
                letterSpacing: 1,
                animation: "pulse 1.6s infinite",
              }}
            >
              +{p.attrPoints} DISPONÍVEIS
            </span>
          )}
        </div>
        {attrKeys.map((k) => (
          <AttrRow
            key={k}
            k={k}
            value={p.attr[k]}
            canSpend={p.attrPoints > 0}
            onAlloc={() => doAlloc(k)}
          />
        ))}
        <div
          style={{
            fontSize: 7,
            opacity: 0.55,
            textAlign: "center",
            marginTop: 8,
            letterSpacing: 1,
            borderTop: `1px dashed ${PIXEL_BORDER}`,
            paddingTop: 8,
          }}
        >
          Ganhe 5 pontos ao subir de nível. Investimentos são permanentes.
        </div>
      </PixelPanel>
      </>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  color,
  pulse,
}: {
  label: string;
  value: number | string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        border: `2px solid ${color}55`,
        padding: "8px 10px",
        textAlign: "center",
        animation: pulse ? "pulse 1.6s infinite" : undefined,
      }}
    >
      <div style={{ fontSize: 7, color: "#a8987a", letterSpacing: 2 }}>{label}</div>
      <div
        style={{
          fontSize: 16,
          color,
          marginTop: 4,
          textShadow: `0 0 6px ${color}`,
        }}
      >
        {value}
      </div>
    </div>
  );
}
