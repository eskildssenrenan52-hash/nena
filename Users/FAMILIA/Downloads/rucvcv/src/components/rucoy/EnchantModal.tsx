// Enchantment & Transmog hub. Lets the player:
//   1. Socket ancient runes into their currently-equipped weapon / armor
//      slot from the overlay inventory. A socketed rune contributes flat
//      combat bonuses via bridge.socketedBonuses(), but ONLY while that
//      item stays equipped — creating actual build decisions.
//   2. Choose a transmog appearance for the weapon and armor slot: any
//      owned item of the matching slot can be used as the visual, without
//      affecting stats.

import { useState } from "react";
import { ALL_ITEMS, type Item, RARITY_COLOR } from "@/rucoy/items";
import { useOverlayState } from "@/rucoy/store";
import {
  useSkillsStore,
  getActiveCharacter,
  socketRune,
  unsocketRune,
  setTransmog,
  maxSocketsForRarity,
} from "@/rucoy/skills";
import { useHostedGame, useHostedTick } from "@/game/host";
import { ANCIENT_RUNES, runeTierLabel, type OwnedRune } from "@/game/ancientRunes";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_BORDER, PixelPanel, PixelButton } from "./ui/pixel";

function itemById(id: string | undefined): Item | undefined {
  if (!id) return undefined;
  return ALL_ITEMS.find((i) => i.id === id);
}

export default function EnchantModal() {
  useSkillsStore();
  useHostedTick(400);
  const overlay = useOverlayState();
  const g = useHostedGame();
  const c = getActiveCharacter();
  const [pickerSlot, setPickerSlot] = useState<"weapon" | "armor" | null>(null);
  const [transmogPicker, setTransmogPicker] = useState<"weapon" | "armor" | null>(null);

  const equippedItems: { slot: "weapon" | "armor"; item: Item | undefined }[] = [
    { slot: "weapon", item: itemById(overlay.equipped.weapon) },
    // Chest is the primary "armor" slot in the overlay's SLOT_ORDER.
    { slot: "armor", item: itemById(overlay.equipped.chest) },
  ];

  const ownedRunes: OwnedRune[] = g?.player?.runes ?? [];
  // A rune is available to socket if it's not already socketed anywhere.
  const socketedUids = new Set<string>();
  for (const list of Object.values(c.sockets)) for (const uid of list) socketedUids.add(uid);
  const freeRunes = ownedRunes.filter((r) => !socketedUids.has(r.uid));

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10 }}>
      <PixelPanel tone="parchment" style={{ marginBottom: 12 }}>
        <div style={{ color: PIXEL_GOLD, letterSpacing: 2, fontSize: 10, marginBottom: 6 }}>
          ENCANTAMENTO DE EQUIPAMENTO
        </div>
        <div style={{ fontSize: 8, color: "#c9a86a", letterSpacing: 1, lineHeight: 1.6 }}>
          Sockets ligam runas diretamente à arma/armadura. O bônus só se aplica enquanto o item estiver equipado.
        </div>
      </PixelPanel>

      {equippedItems.map(({ slot, item }) => {
        if (!item) {
          return (
            <PixelPanel key={slot} tone="wood" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 4 }}>
                {slot === "weapon" ? "ARMA" : "ARMADURA"}
              </div>
              <div style={{ fontSize: 8, color: "#c9a86a", letterSpacing: 1 }}>
                Nenhum item equipado neste slot no inventário.
              </div>
            </PixelPanel>
          );
        }
        const cap = maxSocketsForRarity(item.rarity);
        const socketList = c.sockets[item.id] || [];
        const transmogId = c.transmog[slot];
        const transmogItem = itemById(transmogId ?? undefined);
        return (
          <PixelPanel key={slot} tone="wood" style={{ marginBottom: 10, boxShadow: `inset 0 0 0 2px ${RARITY_COLOR[item.rarity]}, inset 0 0 0 4px #120a08, 0 4px 0 #000` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, background: `${RARITY_COLOR[item.rarity]}22`, border: `2px solid ${RARITY_COLOR[item.rarity]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {slot === "weapon" ? "⚔️" : "🛡️"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: RARITY_COLOR[item.rarity], fontSize: 9, letterSpacing: 1 }}>
                  {(slot === "weapon" ? "ARMA · " : "ARMADURA · ") + item.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 3 }}>
                  Sockets {socketList.length}/{cap} · rarity {item.rarity}
                </div>
              </div>
            </div>

            {/* Sockets row */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {Array.from({ length: cap }).map((_, i) => {
                const uid = socketList[i];
                const rune = uid ? ownedRunes.find((r) => r.uid === uid) : undefined;
                const info = rune ? ANCIENT_RUNES[rune.runeId] : null;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (uid) unsocketRune(item.id, uid);
                      else setPickerSlot(slot);
                    }}
                    style={{
                      width: 54,
                      height: 54,
                      background: info ? `${info.color}22` : "rgba(0,0,0,0.5)",
                      border: `2px dashed ${info ? info.color : PIXEL_BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      textAlign: "center",
                      fontSize: 8,
                      color: info?.color ?? "#7a5a3a",
                      letterSpacing: 1,
                    }}
                    title={info ? `${info.name} ${runeTierLabel(rune!.tier)} — clique para remover` : "Slot vazio"}
                  >
                    {info ? <><div style={{ fontSize: 18 }}>◈</div><div style={{ fontSize: 6 }}>T{rune!.tier}</div></> : "+"}
                  </div>
                );
              })}
            </div>

            {/* Transmog row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderTop: `1px dashed ${PIXEL_BORDER}`, paddingTop: 8 }}>
              <div style={{ flex: 1, fontSize: 8, color: "#c9a86a", letterSpacing: 1 }}>
                Transmog: <span style={{ color: "#fff" }}>{transmogItem ? transmogItem.name : "aparência original"}</span>
              </div>
              <PixelButton size={8} variant="ghost" onClick={() => setTransmog(slot, null)} style={{ padding: "4px 8px" }}>
                Padrão
              </PixelButton>
              <PixelButton size={8} variant="gold" onClick={() => setTransmogPicker(slot)} style={{ padding: "4px 8px" }}>
                Escolher
              </PixelButton>
            </div>
          </PixelPanel>
        );
      })}

      {/* Rune picker overlay */}
      {pickerSlot && (
        <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 2 }}>
              ESCOLHA UMA RUNA · {pickerSlot.toUpperCase()}
            </span>
            <button onClick={() => setPickerSlot(null)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontFamily: PIXEL_FONT, fontSize: 10 }}>✕</button>
          </div>
          {freeRunes.length === 0 ? (
            <div style={{ fontSize: 8, color: "#c9a86a" }}>Sem runas livres. Derrote chefes ou desencaixe.</div>
          ) : (
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
              {freeRunes.map((r) => {
                const info = ANCIENT_RUNES[r.runeId];
                const item = pickerSlot === "weapon" ? itemById(overlay.equipped.weapon) : itemById(overlay.equipped.chest);
                if (!item) return null;
                return (
                  <button
                    key={r.uid}
                    onClick={() => {
                      const list = c.sockets[item.id] || [];
                      if (list.length >= maxSocketsForRarity(item.rarity)) return;
                      socketRune(item.id, r.uid);
                      setPickerSlot(null);
                    }}
                    style={{
                      padding: 6,
                      background: `${info.color}22`,
                      border: `2px solid ${info.color}`,
                      color: "#fff",
                      fontFamily: PIXEL_FONT,
                      fontSize: 8,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ color: info.color, marginBottom: 2 }}>{info.name}</div>
                    <div style={{ fontSize: 7, color: "#c9a86a" }}>{runeTierLabel(r.tier)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </PixelPanel>
      )}

      {/* Transmog picker */}
      {transmogPicker && (
        <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 2 }}>
              ESCOLHA APARÊNCIA · {transmogPicker.toUpperCase()}
            </span>
            <button onClick={() => setTransmogPicker(null)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontFamily: PIXEL_FONT, fontSize: 10 }}>✕</button>
          </div>
          <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
            {overlay.inventory
              .map((id) => itemById(id))
              .filter((it): it is Item => !!it && (transmogPicker === "weapon" ? it.slot === "weapon" : it.slot === "chest"))
              .map((it) => (
                <button
                  key={it.id}
                  onClick={() => { setTransmog(transmogPicker, it.id); setTransmogPicker(null); }}
                  style={{
                    padding: 6,
                    background: `${RARITY_COLOR[it.rarity]}22`,
                    border: `2px solid ${RARITY_COLOR[it.rarity]}`,
                    color: "#fff",
                    fontFamily: PIXEL_FONT,
                    fontSize: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: RARITY_COLOR[it.rarity], marginBottom: 2 }}>{it.name}</div>
                  <div style={{ fontSize: 7, color: "#c9a86a" }}>{it.rarity}</div>
                </button>
              ))}
          </div>
        </PixelPanel>
      )}
    </div>
  );
}
