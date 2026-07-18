// Module-level "host" for the running game so React modals (Runes,
// Attributes, etc.) that live OUTSIDE the canvas loop can read player
// state reactively and dispatch mutations.
//
// EternalRealms sets the current GameState on mount / load and pokes
// bumpVersion() every frame; consumers subscribe via useHostedGame().
import { useEffect, useSyncExternalStore } from "react";
import type { GameState } from "./game";

let current: GameState | null = null;
let version = 0;
const listeners = new Set<() => void>();

export function setActiveGame(g: GameState | null) {
  current = g;
  version++;
  for (const l of listeners) l();
}
export function getActiveGame(): GameState | null {
  return current;
}
export function bumpVersion() {
  version++;
  for (const l of listeners) l();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  return version;
}

// Hook: re-renders on setActiveGame + every bumpVersion() tick.
// Consumers should call bumpVersion() from a slow interval so the UI
// tracks live player state (HP, attrPoints, runes) without joining the
// 60fps loop.
export function useHostedGame(): GameState | null {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return current;
}

// Auto-refresh every N ms while mounted. Useful in modals that show
// live values (attrPoints, HP, etc.) without wiring into the RAF loop.
export function useHostedTick(intervalMs = 250) {
  useEffect(() => {
    const id = window.setInterval(() => bumpVersion(), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
}
