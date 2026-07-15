// Item sprite sheet: 22 columns × 50 rows, 48px cells.
// Cols are grouped in pairs per slot: [helm, chest, belt, ring, legs, gloves, boots, necklace, sword, bow, staff].
// Each slot has 2 variants per row × 50 rows = 100 sprites.

import { CSSProperties } from "react";
import type { ItemSlot } from "./items";

export const ITEM_SHEET_URL = "/sprites/items/items_sheet.png";
export const ITEM_CELL = 48;
export const ITEM_COLS = 22;
export const ITEM_ROWS = 50;

// Base column (of the 11 pair columns) for each slot.
// weapons: sword pairs are used for melee weapons; bow/staff variants are picked
// deterministically per item id based on weapon name hint below.
const SLOT_TO_PAIR: Record<ItemSlot, number | number[]> = {
  helm: 0,
  chest: 1,
  belt: 2,
  ring: 3,
  legs: 4,
  gloves: 5,
  boots: 6,
  necklace: 7,
  weapon: [8, 9, 10], // sword / bow / staff
  shield: 1,          // reuse chest column visual for shields (no dedicated column)
  cape: 7,            // reuse necklace column visual for capes
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function itemSheetCoords(itemId: string, slot: ItemSlot, name?: string): { sx: number; sy: number } {
  const h = hashStr(itemId);
  const row = h % ITEM_ROWS;
  let pair: number;
  const map = SLOT_TO_PAIR[slot];
  if (Array.isArray(map)) {
    // weapon: pick sword/bow/staff based on name hints
    const n = (name ?? "").toLowerCase();
    if (n.includes("arco")) pair = map[1];
    else if (n.includes("cajado") || n.includes("cetro")) pair = map[2];
    else pair = map[0];
  } else {
    pair = map;
  }
  const subCol = (h >> 8) & 1; // 0 or 1 within the pair
  const col = pair * 2 + subCol;
  return { sx: col * ITEM_CELL, sy: row * ITEM_CELL };
}

export function ItemSprite({
  itemId,
  slot,
  name,
  size = 40,
  className,
  style,
}: {
  itemId: string;
  slot: ItemSlot;
  name?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { sx, sy } = itemSheetCoords(itemId, slot, name);
  const scale = size / ITEM_CELL;
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${ITEM_SHEET_URL})`,
        backgroundPosition: `-${sx * scale}px -${sy * scale}px`,
        backgroundSize: `${ITEM_COLS * ITEM_CELL * scale}px ${ITEM_ROWS * ITEM_CELL * scale}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}