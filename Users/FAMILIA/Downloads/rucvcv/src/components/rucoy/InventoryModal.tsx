import { useMemo, useState } from "react";
import {
  ALL_ITEMS,
  RARITY_COLOR,
  SLOT_ICON,
  SLOT_LABEL,
  SLOT_ORDER,
  type Item,
  type ItemSlot,
} from "@/rucoy/items";
import { equipItem, unequipSlot, sellItem, itemSellPrice, useOverlayState } from "@/rucoy/store";
import { ItemSprite } from "@/rucoy/itemSprites";
import {
  PixelPanel,
  PixelTitle,
  PixelButton,
  SlotFrame,
  RarityBadge,
  StatChip,
  PIXEL_FONT,
  PIXEL_GOLD,
} from "./ui/pixel";

export default function InventoryModal() {
  const state = useOverlayState();
  const [filter, setFilter] = useState<ItemSlot | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const equipped = useMemo(
    () => Object.entries(state.equipped) as [ItemSlot, string][],
    [state.equipped],
  );

  const inventoryItems = useMemo(() => {
    const items = state.inventory
      .map((id) => ALL_ITEMS.find((i) => i.id === id))
      .filter((x): x is Item => !!x);
    return filter === "all" ? items : items.filter((i) => i.slot === filter);
  }, [state.inventory, filter]);

  const selectedItem = selected ? ALL_ITEMS.find((i) => i.id === selected) : null;

  const stats = useMemo(() => {
    let atk = 0,
      def = 0,
      hp = 0,
      mp = 0;
    for (const [, id] of equipped) {
      const it = ALL_ITEMS.find((i) => i.id === id);
      if (!it) continue;
      atk += it.attack;
      def += it.defense;
      hp += it.hp;
      mp += it.mp;
    }
    return { atk, def, hp, mp };
  }, [equipped]);

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Equipment paperdoll */}
        <PixelPanel tone="stone" style={{ width: "100%", maxWidth: 300 }}>
          <PixelTitle size={10} style={{ marginBottom: 10 }}>EQUIPAMENTO</PixelTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {SLOT_ORDER.map((slot) => {
              const id = state.equipped[slot];
              const it = id ? ALL_ITEMS.find((i) => i.id === id) : undefined;
              return (
                <SlotFrame
                  key={slot}
                  size={68}
                  rarity={it?.rarity}
                  active={!!it}
                  onClick={() => it && unequipSlot(slot)}
                  title={it ? `${it.name} (clique p/ remover)` : SLOT_LABEL[slot]}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {it ? (
                      <ItemSprite itemId={it.id} slot={it.slot} name={it.name} size={40} />
                    ) : (
                      <span style={{ fontSize: 22, opacity: 0.35 }}>{SLOT_ICON[slot]}</span>
                    )}
                    <span
                      style={{
                        fontFamily: PIXEL_FONT,
                        fontSize: 6,
                        color: it ? RARITY_COLOR[it.rarity] : "#8a6a4a",
                        letterSpacing: 1,
                      }}
                    >
                      {SLOT_LABEL[slot].slice(0, 5).toUpperCase()}
                    </span>
                  </div>
                </SlotFrame>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
            <StatChip icon="⚔" value={stats.atk} color="#ef4444" />
            <StatChip icon="🛡" value={stats.def} color="#60a5fa" />
            <StatChip icon="♥" value={stats.hp} color="#22c55e" />
            <StatChip icon="✦" value={stats.mp} color="#c084fc" />
          </div>
        </PixelPanel>

        {/* Item grid */}
        <PixelPanel tone="wood" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <PixelTitle size={10}>ITENS ({inventoryItems.length})</PixelTitle>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ItemSlot | "all")}
              style={{
                fontFamily: PIXEL_FONT,
                fontSize: 8,
                background: "#120a08",
                color: PIXEL_GOLD,
                border: `2px solid #6b4a2b`,
                padding: "5px 8px",
                letterSpacing: 1,
              }}
            >
              <option value="all">TODOS</option>
              {SLOT_ORDER.map((s) => (
                <option key={s} value={s}>{SLOT_LABEL[s].toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gap: 6,
              gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))",
              maxHeight: "44vh",
              overflowY: "auto",
              background: "#0a0906",
              padding: 8,
              border: "2px solid #120a08",
              boxShadow: "inset 0 0 0 1px #6b4a2b",
            }}
          >
            {inventoryItems.map((it) => {
              const isEquipped = state.equipped[it.slot] === it.id;
              const sel = selected === it.id;
              return (
                <SlotFrame
                  key={it.id}
                  size={56}
                  rarity={it.rarity}
                  active={sel}
                  onClick={() => setSelected(it.id)}
                  title={it.name}
                >
                  <ItemSprite itemId={it.id} slot={it.slot} name={it.name} size={44} />
                  <span
                    style={{
                      position: "absolute",
                      top: 1,
                      left: 3,
                      fontFamily: PIXEL_FONT,
                      fontSize: 7,
                      color: RARITY_COLOR[it.rarity],
                      textShadow: "1px 1px 0 #000",
                    }}
                  >
                    {it.level}
                  </span>
                  {isEquipped && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -4,
                        fontFamily: PIXEL_FONT,
                        fontSize: 7,
                        color: "#000",
                        background: "#4ade80",
                        padding: "1px 3px",
                        border: "1px solid #000",
                      }}
                    >
                      E
                    </span>
                  )}
                </SlotFrame>
              );
            })}
            {inventoryItems.length === 0 && (
              <div style={{ gridColumn: "1 / -1", padding: "40px 0", textAlign: "center", fontSize: 9, color: "#8a6a4a" }}>
                NENHUM ITEM DESTE TIPO
              </div>
            )}
          </div>

          {selectedItem && (
            <PixelPanel
              tone="parchment"
              style={{
                marginTop: 12,
                borderColor: RARITY_COLOR[selectedItem.rarity],
                boxShadow: `inset 0 0 0 2px ${RARITY_COLOR[selectedItem.rarity]}, inset 0 0 0 4px #120a08, 0 6px 0 #000`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <ItemSprite itemId={selectedItem.id} slot={selectedItem.slot} name={selectedItem.name} size={64} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <PixelTitle size={11} color={RARITY_COLOR[selectedItem.rarity]}>
                    {selectedItem.name.toUpperCase()}
                  </PixelTitle>
                  <div style={{ fontSize: 7, color: "#c9a86a", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>
                    NVL {selectedItem.level} · {SLOT_LABEL[selectedItem.slot]}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    <RarityBadge rarity={selectedItem.rarity} />
                    <StatChip icon="⚔" value={selectedItem.attack} color="#ef4444" />
                    <StatChip icon="🛡" value={selectedItem.defense} color="#60a5fa" />
                    <StatChip icon="♥" value={selectedItem.hp} color="#22c55e" />
                    <StatChip icon="✦" value={selectedItem.mp} color="#c084fc" />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <PixelButton variant="gold" size={9} onClick={() => equipItem(selectedItem.id)}>
                    Equipar
                  </PixelButton>
                  <PixelButton
                    variant="red"
                    size={9}
                    onClick={() => {
                      sellItem(selectedItem.id);
                      setSelected(null);
                    }}
                    title={`Vender por ${itemSellPrice(selectedItem)} ouro`}
                  >
                    Vender · {itemSellPrice(selectedItem)}g
                  </PixelButton>
                </div>
              </div>
            </PixelPanel>
          )}
        </PixelPanel>
      </div>
    </div>
  );
}
