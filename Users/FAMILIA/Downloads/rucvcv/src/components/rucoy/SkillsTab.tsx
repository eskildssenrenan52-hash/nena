// Skills page — shown as a tab inside AttributesModal, matching the
// "same panel as attributes but different page" pattern from the reference
// screenshot. Displays every skill's level + XP bar, plus the class levels
// for the active character and the overall player level.

import {
  useSkillsStore,
  getActiveCharacter,
  SKILL_META,
  CLASS_META,
  skillXpForLevel,
  classXpForLevel,
  playerXpForLevel,
  type SkillKey,
  type ClassId,
} from "@/rucoy/skills";
import { PIXEL_FONT, PIXEL_GOLD, PixelPanel, PixelBar } from "./ui/pixel";

function Row({
  label,
  color,
  level,
  xp,
  xpNeeded,
  icon,
}: {
  label: string;
  color: string;
  level: number;
  xp: number;
  xpNeeded: number;
  icon: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 8,
        background: "rgba(0,0,0,0.5)",
        border: `2px solid ${color}55`,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          background: `radial-gradient(circle, ${color}44 0%, #000 80%)`,
          border: `2px solid ${color}`,
        }}
      >
        <span>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ color, fontSize: 9, letterSpacing: 1.5 }}>{label.toUpperCase()}</span>
          <span style={{ color: "#fff", fontSize: 12, textShadow: `0 0 6px ${color}` }}>{level}</span>
        </div>
        <PixelBar value={xp} max={xpNeeded} color={color} height={7} />
        <div style={{ fontSize: 7, color: "#c0b090", marginTop: 3, letterSpacing: 0.5 }}>
          {Math.floor(xp)} / {xpNeeded} XP
        </div>
      </div>
    </div>
  );
}

export default function SkillsTab() {
  useSkillsStore(); // subscribe
  const c = getActiveCharacter();
  const skillKeys = Object.keys(SKILL_META) as SkillKey[];
  const classKeys = Object.keys(CLASS_META) as ClassId[];

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10 }}>
      {/* General player level */}
      <PixelPanel tone="parchment" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: PIXEL_GOLD, letterSpacing: 2, fontSize: 10 }}>NÍVEL GERAL</span>
          <span style={{ color: "#fff", fontSize: 16, textShadow: `0 0 6px ${PIXEL_GOLD}` }}>
            {c.playerLevel}
          </span>
        </div>
        <PixelBar value={c.playerXp} max={playerXpForLevel(c.playerLevel)} color={PIXEL_GOLD} height={10} />
        <div style={{ fontSize: 7, color: "#c0b090", marginTop: 4, letterSpacing: 0.5 }}>
          {Math.floor(c.playerXp)} / {playerXpForLevel(c.playerLevel)} XP · sobe matando inimigos
        </div>
      </PixelPanel>

      {/* Skills */}
      <PixelPanel tone="wood" style={{ marginBottom: 10 }}>
        <div style={{ color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8, fontSize: 10 }}>SKILLS</div>
        {skillKeys.map((k) => {
          const meta = SKILL_META[k];
          const p = c.skills[k];
          return (
            <Row
              key={k}
              label={meta.label}
              color={meta.color}
              icon={meta.icon}
              level={p.level}
              xp={p.xp}
              xpNeeded={skillXpForLevel(p.level)}
            />
          );
        })}
      </PixelPanel>

      {/* Class levels */}
      <PixelPanel tone="stone">
        <div style={{ color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8, fontSize: 10 }}>NÍVEIS DE CLASSE</div>
        {classKeys.map((k) => {
          const meta = CLASS_META[k];
          const p = c.classLevels[k];
          return (
            <Row
              key={k}
              label={meta.label + (k === c.activeClass ? " · Ativa" : "")}
              color={meta.color}
              icon="⚔"
              level={p.level}
              xp={p.xp}
              xpNeeded={classXpForLevel(p.level)}
            />
          );
        })}
      </PixelPanel>
    </div>
  );
}
