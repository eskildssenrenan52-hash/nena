import { useState, type DragEvent } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { useHostedGame, useHostedTick, bumpVersion } from "@/game/host";
import {
  ANCIENT_RUNES,
  MAX_EQUIPPED_RUNES,
  runeTierLabel,
  type OwnedRune,
  type AncientRuneTier,
} from "@/game/ancientRunes";
import { recalculateStats, logMsg } from "@/game/game";
import {
  PIXEL_FONT,
  PIXEL_GOLD,
  PIXEL_BORDER,
  PixelPanel,
  PixelButton,
} from "./ui/pixel";

// Colors for each tier of rune (Menor / Maior / Suprema).
const TIER_GLOW: Record<AncientRuneTier, string> = {
  1: "#8b8b9d",
  2: "#5ea8ff",
  3: "#f0b040",
};

function bonusList(rune: OwnedRune): string[] {
  const info = ANCIENT_RUNES[rune.runeId];
  if (!info) return [];
  const eff = info.effects[rune.tier - 1] ?? {};
  const out: string[] = [];
  const pct = (n: number) => `${((n - 1) * 100).toFixed(0)}%`;
  const pctAdd = (n: number) => `${(n * 100).toFixed(0)}%`;
  if (eff.dmgMult != null) out.push(`+${pct(eff.dmgMult)} dano`);
  if (eff.defMult != null) out.push(`+${pct(eff.defMult)} defesa`);
  if (eff.moveSpeedMult != null) out.push(`+${pct(eff.moveSpeedMult)} velocidade`);
  if (eff.cooldownMult != null) out.push(`-${((1 - eff.cooldownMult) * 100).toFixed(0)}% cooldown`);
  if (eff.goldMult != null) out.push(`+${pct(eff.goldMult)} ouro`);
  if (eff.xpMult != null) out.push(`+${pct(eff.xpMult)} XP`);
  if (eff.maxHpBonus != null) out.push(`+${eff.maxHpBonus} HP máx`);
  if (eff.maxMpBonus != null) out.push(`+${eff.maxMpBonus} MP máx`);
  if (eff.critBonus != null) out.push(`+${pctAdd(eff.critBonus)} crítico`);
  if (eff.lifesteal != null) out.push(`+${pctAdd(eff.lifesteal)} roubo de vida`);
  if (eff.hpRegen != null) out.push(`+${eff.hpRegen}/s regen HP`);
  if (eff.thorns != null) out.push(`+${pctAdd(eff.thorns)} espinhos`);
  if (eff.dropLuck != null) out.push(`+${eff.dropLuck} sorte`);
  return out;
}

// A single rune tile — supports drag start/drop.
function RuneChip({
  rune,
  size = 68,
  onDragStart,
  onClick,
  glow,
}: {
  rune: OwnedRune;
  size?: number;
  onDragStart?: (e: DragEvent) => void;
  onClick?: () => void;
  glow?: boolean;
}) {
  const info = ANCIENT_RUNES[rune.runeId];
  if (!info) return null;
  const tierColor = TIER_GLOW[rune.tier];
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={onClick}
      title={`${info.name} (${runeTierLabel(rune.tier)})`}
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        position: "relative",
        background: `radial-gradient(circle at 30% 25%, ${info.color}44 0%, #000 70%)`,
        border: `2px solid ${tierColor}`,
        boxShadow: glow
          ? `inset 0 0 0 2px #000, 0 0 14px ${info.color}aa, 0 0 26px ${tierColor}55`
          : `inset 0 0 0 2px #000, 0 0 6px ${info.color}66`,
        imageRendering: "pixelated",
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontSize: size * 0.42,
          color: info.color,
          textShadow: `0 0 8px ${info.color}, 0 0 2px #fff`,
          lineHeight: 1,
        }}
      >
        {info.glyph}
      </span>
      <span
        style={{
          position: "absolute",
          bottom: 2,
          right: 3,
          fontFamily: PIXEL_FONT,
          fontSize: 7,
          color: tierColor,
          textShadow: "1px 1px 0 #000",
        }}
      >
        T{rune.tier}
      </span>
    </div>
  );
}

// A drop target for the 3 equipped slots. Handles drag-over highlight,
// drop from inventory (equip), or shift-click to unequip.
function EquipSlot({
  index,
  rune,
  onEquip,
  onUnequip,
  onSwap,
}: {
  index: number;
  rune: OwnedRune | null;
  onEquip: (uid: string) => void;
  onUnequip: () => void;
  onSwap: (fromSlot: number) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const data = e.dataTransfer.getData("text/plain");
        if (!data) return;
        if (data.startsWith("slot:")) onSwap(parseInt(data.slice(5), 10));
        else onEquip(data);
      }}
      style={{
        position: "relative",
        width: 92,
        height: 92,
        border: `3px dashed ${hover ? PIXEL_GOLD : PIXEL_BORDER}`,
        background: hover
          ? "radial-gradient(circle, rgba(245,192,74,0.18) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 120ms",
        imageRendering: "pixelated",
      }}
    >
      {rune ? (
        <>
          <RuneChip
            rune={rune}
            size={72}
            glow
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", `slot:${index}`);
            }}
          />
          <button
            aria-label="Desequipar"
            onClick={onUnequip}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              background: "linear-gradient(180deg,#f87171,#7f1d1d)",
              border: "2px solid #120a08",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Trash2 size={12} />
          </button>
        </>
      ) : (
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: 8,
            color: "#7a5a3a",
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          SLOT {index + 1}
          <div style={{ marginTop: 6, opacity: 0.6 }}>arraste</div>
        </div>
      )}
    </div>
  );
}

export default function RunesModal() {
  const g = useHostedGame();
  useHostedTick(300);

  if (!g) {
    return (
      <div style={{ fontFamily: PIXEL_FONT, color: PIXEL_GOLD, fontSize: 10 }}>
        Carregando runas…
      </div>
    );
  }

  const p = g.player;
  const equipped: (OwnedRune | null)[] =
    p.equippedRunes && p.equippedRunes.length === MAX_EQUIPPED_RUNES
      ? p.equippedRunes
      : [null, null, null];
  const equippedUids = new Set(
    equipped.filter((r): r is OwnedRune => !!r).map((r) => r.uid),
  );
  const inventoryRunes = (p.runes || []).filter((r) => !equippedUids.has(r.uid));

  const applyChange = () => {
    p.recomputeRuneBonuses();
    recalculateStats(g);
    bumpVersion();
  };
  const equipToSlot = (uid: string, slot: number) => {
    const rune = (p.runes || []).find((r) => r.uid === uid);
    if (!rune) return;
    // If already equipped in a different slot, swap.
    const existingSlot = equipped.findIndex((r) => r?.uid === uid);
    const displaced = equipped[slot];
    if (existingSlot >= 0) {
      p.equippedRunes[existingSlot] = displaced;
    }
    p.equippedRunes[slot] = rune;
    applyChange();
    logMsg(g, `Runa equipada no slot ${slot + 1}.`, ANCIENT_RUNES[rune.runeId]?.color ?? "#fff");
  };
  const unequipSlot = (slot: number) => {
    if (!p.equippedRunes[slot]) return;
    p.equippedRunes[slot] = null;
    applyChange();
    logMsg(g, `Runa do slot ${slot + 1} removida.`, "#c0a068");
  };
  const swapSlots = (a: number, b: number) => {
    if (a === b) return;
    const tmp = p.equippedRunes[a];
    p.equippedRunes[a] = p.equippedRunes[b];
    p.equippedRunes[b] = tmp;
    applyChange();
  };
  const autoEquip = (uid: string) => {
    // Prefer empty slot; otherwise slot 0.
    const empty = equipped.findIndex((r) => r == null);
    equipToSlot(uid, empty >= 0 ? empty : 0);
  };

  // Aggregate active bonuses summary.
  const rb = p.runeBonuses;
  const summary: string[] = [];
  const pct = (n: number) => `${Math.round((n - 1) * 100)}%`;
  const pctAdd = (n: number) => `${Math.round(n * 100)}%`;
  if (rb.dmgMult !== 1) summary.push(`Dano ${pct(rb.dmgMult)}`);
  if (rb.defMult !== 1) summary.push(`Def ${pct(rb.defMult)}`);
  if (rb.moveSpeedMult !== 1) summary.push(`Vel ${pct(rb.moveSpeedMult)}`);
  if (rb.cooldownMult !== 1) summary.push(`CD ${Math.round((rb.cooldownMult - 1) * 100)}%`);
  if (rb.maxHpBonus) summary.push(`+${rb.maxHpBonus} HP`);
  if (rb.maxMpBonus) summary.push(`+${rb.maxMpBonus} MP`);
  if (rb.critBonus) summary.push(`Crit +${pctAdd(rb.critBonus)}`);
  if (rb.lifesteal) summary.push(`Lifesteal ${pctAdd(rb.lifesteal)}`);
  if (rb.hpRegen) summary.push(`Regen ${rb.hpRegen.toFixed(1)}/s`);
  if (rb.xpMult !== 1) summary.push(`XP ${pct(rb.xpMult)}`);
  if (rb.goldMult !== 1) summary.push(`Ouro ${pct(rb.goldMult)}`);
  if (rb.dropLuck) summary.push(`Sorte +${rb.dropLuck}`);
  if (rb.thorns) summary.push(`Espinhos ${pctAdd(rb.thorns)}`);

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10 }}>
      {/* Equipped panel */}
      <PixelPanel tone="parchment" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} color={PIXEL_GOLD} />
            <span style={{ color: PIXEL_GOLD, letterSpacing: 2 }}>RUNAS EQUIPADAS</span>
          </div>
          <span style={{ fontSize: 8, opacity: 0.7 }}>
            {equipped.filter((r) => r).length}/{MAX_EQUIPPED_RUNES}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {equipped.map((rune, i) => (
            <EquipSlot
              key={i}
              index={i}
              rune={rune}
              onEquip={(uid) => equipToSlot(uid, i)}
              onUnequip={() => unequipSlot(i)}
              onSwap={(from) => swapSlots(from, i)}
            />
          ))}
        </div>
        {summary.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "center",
              borderTop: `2px dashed ${PIXEL_BORDER}`,
              paddingTop: 8,
            }}
          >
            {summary.map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 8,
                  color: PIXEL_GOLD,
                  background: "rgba(0,0,0,0.55)",
                  border: `1px solid ${PIXEL_GOLD}66`,
                  padding: "3px 6px",
                  letterSpacing: 1,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </PixelPanel>

      {/* Inventory panel */}
      <PixelPanel tone="wood">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ color: PIXEL_GOLD, letterSpacing: 2 }}>INVENTÁRIO DE RUNAS</span>
          <span style={{ fontSize: 8, opacity: 0.7 }}>{inventoryRunes.length} disponíveis</span>
        </div>
        {inventoryRunes.length === 0 ? (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
              fontSize: 9,
              opacity: 0.65,
              lineHeight: 1.8,
            }}
          >
            Nenhuma runa em posse.
            <br />
            Derrote chefes e elites para obter <span style={{ color: PIXEL_GOLD }}>runas ancestrais</span>.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            {inventoryRunes.map((rune) => {
              const info = ANCIENT_RUNES[rune.runeId];
              if (!info) return null;
              const bonuses = bonusList(rune);
              return (
                <div
                  key={rune.uid}
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    border: `2px solid ${info.color}55`,
                    padding: 8,
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <RuneChip
                    rune={rune}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", rune.uid)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 9,
                        color: info.color,
                        letterSpacing: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {info.name}
                    </div>
                    <div
                      style={{
                        fontSize: 7,
                        color: TIER_GLOW[rune.tier],
                        marginTop: 3,
                        letterSpacing: 1,
                      }}
                    >
                      {runeTierLabel(rune.tier)}
                    </div>
                    <div
                      style={{
                        marginTop: 5,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                      }}
                    >
                      {bonuses.slice(0, 3).map((b, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 7,
                            color: "#c8b898",
                            border: "1px solid #5a4028",
                            padding: "1px 3px",
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <PixelButton
                        variant="gold"
                        size={8}
                        onClick={() => autoEquip(rune.uid)}
                        style={{ padding: "4px 8px" }}
                      >
                        Equipar
                      </PixelButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div
          style={{
            marginTop: 12,
            fontSize: 7,
            opacity: 0.55,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Arraste uma runa até um slot para equipar. Arraste entre slots para trocar.
        </div>
      </PixelPanel>
    </div>
  );
}
