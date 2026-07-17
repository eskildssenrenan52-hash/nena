import { useState } from "react";
import { CLASSES_DATA } from "@/utils/gameData";
import type { PlayerClass } from "@/types";
import { PixelPanel, PixelTitle, StatChip, PixelButton, PIXEL_FONT, PIXEL_GOLD } from "./ui/pixel";
import {
  useSkillsStore,
  createCharacter,
  deleteCharacter,
  switchCharacter,
  switchActiveClass,
  renameActive,
  CLASS_META,
  type ClassId,
} from "@/rucoy/skills";

export default function ClassesModal() {
  const store = useSkillsStore();
  const active = store.characters.find((c) => c.id === store.activeCharacterId) ?? store.characters[0];
  const classes = Object.entries(CLASSES_DATA) as [PlayerClass, typeof CLASSES_DATA[PlayerClass]][];
  const [newName, setNewName] = useState("");
  const [newCls, setNewCls] = useState<ClassId>("warrior");

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8" }}>
      {/* Saved characters */}
      <PixelPanel tone="stone" style={{ marginBottom: 12 }}>
        <div style={{ color: PIXEL_GOLD, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
          PERSONAGENS SALVOS
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {store.characters.map((c) => {
            const meta = CLASS_META[c.activeClass];
            const isActive = c.id === active.id;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 8,
                  background: isActive ? `${meta.color}22` : "rgba(0,0,0,0.4)",
                  border: `2px solid ${isActive ? meta.color : "#3a251a"}`,
                }}
              >
                <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: `${meta.color}33`, border: `2px solid ${meta.color}` }}>
                  {meta.label[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 10, letterSpacing: 1 }}>{c.name}</div>
                  <div style={{ color: meta.color, fontSize: 8, letterSpacing: 1 }}>
                    {meta.label} · CLASSE {c.classLevels[c.activeClass].level} · GERAL {c.playerLevel}
                  </div>
                </div>
                {!isActive && (
                  <PixelButton size={8} variant="gold" onClick={() => switchCharacter(c.id)} style={{ padding: "5px 8px" }}>
                    Usar
                  </PixelButton>
                )}
                {store.characters.length > 1 && (
                  <PixelButton size={8} variant="ghost" onClick={() => {
                    if (confirm(`Excluir ${c.name}? Esta ação não pode ser desfeita.`)) deleteCharacter(c.id);
                  }} style={{ padding: "5px 8px" }}>
                    ✕
                  </PixelButton>
                )}
              </div>
            );
          })}
        </div>
        {/* New character */}
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value.slice(0, 20))}
            placeholder="Nome do novo herói"
            style={{
              flex: "1 1 140px",
              minWidth: 0,
              background: "rgba(0,0,0,0.6)",
              border: `2px solid #3a251a`,
              color: "#fff",
              padding: "6px 8px",
              fontFamily: PIXEL_FONT,
              fontSize: 9,
              letterSpacing: 1,
            }}
          />
          <select
            value={newCls}
            onChange={(e) => setNewCls(e.target.value as ClassId)}
            style={{
              background: "rgba(0,0,0,0.6)",
              border: `2px solid #3a251a`,
              color: "#fff",
              padding: "6px 8px",
              fontFamily: PIXEL_FONT,
              fontSize: 9,
              letterSpacing: 1,
            }}
          >
            {(Object.keys(CLASS_META) as ClassId[]).map((k) => (
              <option key={k} value={k}>{CLASS_META[k].label}</option>
            ))}
          </select>
          <PixelButton size={9} variant="gold" onClick={() => {
            createCharacter(newName.trim() || "Novo Herói", newCls);
            setNewName("");
          }} style={{ padding: "6px 10px" }}>
            + Novo Save
          </PixelButton>
        </div>
        <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 6, letterSpacing: 1 }}>
          Cada save mantém progresso independente. Jogo novo = save separado.
        </div>
      </PixelPanel>

      {/* Class switcher for active character */}
      <PixelPanel tone="parchment" style={{ marginBottom: 12 }}>
        <div style={{ color: PIXEL_GOLD, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
          TROCAR CLASSE ATIVA · {active.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 8, color: "#c9a86a", marginBottom: 8, letterSpacing: 1 }}>
          O nível de cada classe é mantido individualmente. Você pode alternar quando quiser.
        </div>
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
          {(Object.keys(CLASS_META) as ClassId[]).map((k) => {
            const meta = CLASS_META[k];
            const p = active.classLevels[k];
            const isActive = k === active.activeClass;
            return (
              <button
                key={k}
                onClick={() => switchActiveClass(k)}
                style={{
                  padding: 8,
                  background: isActive ? `${meta.color}44` : "rgba(0,0,0,0.4)",
                  border: `2px solid ${isActive ? meta.color : "#3a251a"}`,
                  color: "#fff",
                  fontFamily: PIXEL_FONT,
                  fontSize: 9,
                  letterSpacing: 1,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ color: meta.color, marginBottom: 3 }}>{meta.label.toUpperCase()}</div>
                <div style={{ fontSize: 8, color: "#c9a86a" }}>Nível {p.level} · {Math.floor(p.xp)} XP</div>
              </button>
            );
          })}
        </div>
      </PixelPanel>

      {/* Class references */}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {classes.map(([id, cfg]) => (
          <PixelPanel key={id} tone="wood" style={{ boxShadow: `inset 0 0 0 2px ${cfg.color}, inset 0 0 0 4px #120a08, 0 6px 0 #000` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PIXEL_FONT, fontSize: 18, color: cfg.color, background: `${cfg.color}22`, border: `2px solid ${cfg.color}`, boxShadow: "inset 0 0 0 2px #000" }}>
                {cfg.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <PixelTitle size={11} color={cfg.color}>{cfg.name.toUpperCase()}</PixelTitle>
                <div style={{ fontSize: 7, color: "#c9a86a", letterSpacing: 1, marginTop: 3, textTransform: "uppercase" }}>{id}</div>
              </div>
            </div>
            <p style={{ fontSize: 8, color: "#c9a86a", lineHeight: 1.7, marginBottom: 8, fontFamily: "ui-sans-serif, system-ui" }}>{cfg.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <StatChip icon="♥" value={cfg.baseHp} color="#22c55e" />
              <StatChip icon="✦" value={cfg.baseMp} color="#a78bfa" />
              <StatChip icon="⚔" value={cfg.baseAttack} color="#f87171" />
              <StatChip icon="🛡" value={cfg.baseDefense} color="#60a5fa" />
            </div>
          </PixelPanel>
        ))}
      </div>

      {/* Rename */}
      <PixelPanel tone="stone" style={{ marginTop: 12 }}>
        <div style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>
          RENOMEAR PERSONAGEM ATIVO
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            defaultValue={active.name}
            key={active.id}
            onBlur={(e) => renameActive(e.target.value.trim() || active.name)}
            style={{ flex: 1, background: "rgba(0,0,0,0.6)", border: `2px solid #3a251a`, color: "#fff", padding: "6px 8px", fontFamily: PIXEL_FONT, fontSize: 9, letterSpacing: 1 }}
          />
        </div>
      </PixelPanel>
    </div>
  );
}
