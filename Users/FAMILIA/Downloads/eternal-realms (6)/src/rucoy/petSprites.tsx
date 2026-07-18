// Pet sprite sheet mapping (33 pets × 32px cells in a 12×N grid).
// The sheet lives at /sprites/pets/pets_sheet.png and is loaded once.

/// <reference types="vite/client" />

import * as React from "react";
import { PETS } from "./pets";

const BASE_URL = import.meta.env.BASE_URL || "/";
const prefix = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";
export const PET_SHEET_URL = (typeof window !== "undefined" ? window.location.origin : "") + prefix + "sprites/pets/pets_sheet.png";
export const PET_CELL = 96; // source cell size in the generated sheet (1152/12)
export const PET_COLS = 12;

export function petIndex(petId: string): number {
  const i = PETS.findIndex((p) => p.id === petId);
  return i < 0 ? 0 : i;
}

export function petSheetCoords(petId: string): { sx: number; sy: number } {
  const i = petIndex(petId);
  const col = i % PET_COLS;
  const row = Math.floor(i / PET_COLS);
  return { sx: col * PET_CELL, sy: row * PET_CELL };
}

// -------- Canvas image loader (single shared HTMLImageElement) --------
let img: HTMLImageElement | null = null;
let loaded = false;
export function petSheetImage(): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  if (!img) {
    img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { loaded = true; };
    img.src = PET_SHEET_URL;
  }
  return (loaded && img && img.complete && img.naturalWidth > 0) ? img : null;
}

// -------- React <PetSprite/> — CSS background approach so we can pixelate --------
import { CSSProperties } from "react";

export function PetSprite({
  petId,
  size = 48,
  className,
  style,
}: {
  petId: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { sx, sy } = petSheetCoords(petId);
  const scale = size / PET_CELL;
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${PET_SHEET_URL})`,
        backgroundPosition: `-${sx * scale}px -${sy * scale}px`,
        backgroundSize: `${PET_COLS * PET_CELL * scale}px auto`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}