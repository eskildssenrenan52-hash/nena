// Pixel-art UI primitives used by every Rucoy overlay modal.
// - PixelPanel: dark wood-and-gold framed container with hard drop shadow.
// - PixelButton: 3 variants, chunky pixel-style borders.
// - PixelTitle: "Press Start 2P" heading with gold gradient.
// - RarityBadge / StatChip / SlotFrame: reusable atoms.
// Everything uses inline styles so no Tailwind config change is needed.

import { type CSSProperties, type ReactNode } from "react";

export const PIXEL_FONT = '"Press Start 2P", ui-monospace, monospace';
export const PIXEL_GOLD = "#f5c04a";
export const PIXEL_GOLD_DARK = "#a06b1c";
export const PIXEL_WOOD = "#241612";
export const PIXEL_WOOD_LIGHT = "#3a251a";
export const PIXEL_BORDER = "#6b4a2b";

export function PixelPanel({
  children,
  className,
  style,
  padded = true,
  tone = "wood",
}: {
  key?: any;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padded?: boolean;
  tone?: "wood" | "stone" | "parchment";
}) {
  const bg =
    tone === "stone"
      ? "linear-gradient(180deg,#2a2f3a 0%, #171a22 100%)"
      : tone === "parchment"
        ? "linear-gradient(180deg,#3a2a18 0%, #241612 100%)"
        : `linear-gradient(180deg,${PIXEL_WOOD_LIGHT} 0%, ${PIXEL_WOOD} 100%)`;
  return (
    <div
      className={className}
      style={{
        background: bg,
        border: `2px solid ${PIXEL_BORDER}`,
        boxShadow: `inset 0 0 0 1.5px ${PIXEL_GOLD_DARK}, inset 0 0 0 3px #120a08, 0 4px 0 #000, 0 6px 16px rgba(0,0,0,0.55)`,
        borderRadius: 4,
        imageRendering: "pixelated",
        padding: padded ? 8 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PixelTitle({
  children,
  size = 12,
  color = PIXEL_GOLD,
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: size,
        letterSpacing: 1,
        color,
        textShadow: "2px 2px 0 #000, 2px 0 0 #000, 0 2px 0 #000",
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type Variant = "gold" | "green" | "red" | "blue" | "ghost";
const VARIANT_BG: Record<Variant, string> = {
  gold: "linear-gradient(180deg,#f5c04a 0%, #a86a12 100%)",
  green: "linear-gradient(180deg,#4ade80 0%, #166534 100%)",
  red: "linear-gradient(180deg,#f87171 0%, #7f1d1d 100%)",
  blue: "linear-gradient(180deg,#60a5fa 0%, #1e3a8a 100%)",
  ghost: "linear-gradient(180deg,#3a251a 0%, #241612 100%)",
};
const VARIANT_FG: Record<Variant, string> = {
  gold: "#2a1300",
  green: "#052e16",
  red: "#3f0000",
  blue: "#0b1a44",
  ghost: PIXEL_GOLD,
};

export function PixelButton({
  children,
  variant = "gold",
  onClick,
  disabled,
  active,
  size = 8,
  style,
  title,
}: {
  key?: any;
  children: ReactNode;
  variant?: Variant;
  onClick?: (e: any) => void;
  disabled?: boolean;
  active?: boolean;
  size?: number;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: size,
        color: VARIANT_FG[variant],
        background: VARIANT_BG[variant],
        border: `1.5px solid ${active ? "#fff" : "#120a08"}`,
        boxShadow: disabled
          ? "none"
          : `inset 0 -2px 0 rgba(0,0,0,0.4), inset 0 1.5px 0 rgba(255,255,255,0.25), 0 2px 0 #000`,
        padding: "4px 8px",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        imageRendering: "pixelated",
        transition: "transform 60ms",
        transform: active ? "translateY(1.5px)" : "translateY(0)",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(2px)"; }}
      onMouseUp={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(0)"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
    </button>
  );
}

const RARITY_TINT: Record<string, { border: string; bg: string }> = {
  common: { border: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  comum: { border: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  raro: { border: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
  rare: { border: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
  epico: { border: "#a855f7", bg: "rgba(168,85,247,0.18)" },
  epic: { border: "#a855f7", bg: "rgba(168,85,247,0.18)" },
  lendario: { border: "#f59e0b", bg: "rgba(245,158,11,0.18)" },
  legendary: { border: "#f59e0b", bg: "rgba(245,158,11,0.18)" },
  mitico: { border: "#ec4899", bg: "rgba(236,72,153,0.2)" },
  mythic: { border: "#ec4899", bg: "rgba(236,72,153,0.2)" },
};

export function SlotFrame({
  children,
  size = 56,
  rarity,
  onClick,
  active,
  title,
  disabled,
}: {
  key?: any;
  children: ReactNode;
  size?: number;
  rarity?: string;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  disabled?: boolean;
}) {
  const tint = (rarity && RARITY_TINT[rarity]) || { border: "#5a3a20", bg: "rgba(0,0,0,0.4)" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: size,
        height: size,
        border: `2px solid ${active ? PIXEL_GOLD : tint.border}`,
        background: tint.bg,
        boxShadow: active
          ? `inset 0 0 0 2px #000, 0 0 0 2px ${PIXEL_GOLD}66`
          : "inset 0 0 0 2px #000",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        imageRendering: "pixelated",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

export function RarityBadge({ rarity }: { rarity: string }) {
  const t = RARITY_TINT[rarity] || RARITY_TINT.comum;
  return (
    <span
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: 7,
        color: t.border,
        border: `1px solid ${t.border}`,
        padding: "2px 4px",
        letterSpacing: 1,
        textTransform: "uppercase",
        background: t.bg,
      }}
    >
      {rarity}
    </span>
  );
}

export function StatChip({
  icon,
  value,
  color,
}: {
  icon: string;
  value: number | string;
  color: string;
}) {
  return (
    <span
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: 8,
        color,
        background: "rgba(0,0,0,0.55)",
        border: `1px solid ${color}66`,
        padding: "3px 6px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span style={{ fontFamily: "sans-serif", fontSize: 11 }}>{icon}</span>
      <span>{value}</span>
    </span>
  );
}

// Progress bar (chunked pixel bar).
export function PixelBar({
  value,
  max,
  color = PIXEL_GOLD,
  height = 12,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div
      style={{
        height,
        background: "#0a0906",
        border: "2px solid #120a08",
        boxShadow: `inset 0 0 0 1px ${PIXEL_BORDER}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
          borderRight: pct > 0 && pct < 100 ? `2px solid #000` : undefined,
          boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.25)`,
        }}
      />
    </div>
  );
}