import { uid } from './utils'

export interface ComboSystem {
  count: number
  timer: number
  maxCombo: number
  lastHitTime: number
  multiplier: number
}

const COMBO_TIMEOUT = 180 // 3 seconds at 60fps
const MAX_MULTIPLIER = 3.0

export function createCombo(): ComboSystem {
  return { count: 0, timer: 0, maxCombo: 0, lastHitTime: 0, multiplier: 1 }
}

export function addHit(combo: ComboSystem, tick: number): ComboSystem {
  const newCount = combo.count + 1
  const newMax = Math.max(combo.maxCombo, newCount)
  const multiplier = Math.min(MAX_MULTIPLIER, 1 + (newCount * 0.05))
  return {
    count: newCount,
    timer: COMBO_TIMEOUT,
    maxCombo: newMax,
    lastHitTime: tick,
    multiplier,
  }
}

export function updateCombo(combo: ComboSystem): ComboSystem {
  if (combo.timer <= 0) {
    return { ...combo, count: 0, timer: 0, multiplier: 1 }
  }
  return { ...combo, timer: combo.timer - 1 }
}

export function getComboMessage(combo: number): { text: string; color: string } | null {
  if (combo >= 50) return { text: 'GODLIKE!', color: '#ff00ff' }
  if (combo >= 40) return { text: 'UNSTOPPABLE!', color: '#ff0080' }
  if (combo >= 30) return { text: 'RAMPAGE!', color: '#ff4040' }
  if (combo >= 20) return { text: 'DOMINATING!', color: '#ff8040' }
  if (combo >= 15) return { text: 'MASSACRE!', color: '#ffaa00' }
  if (combo >= 10) return { text: 'KILLING SPREE!', color: '#ffff00' }
  if (combo >= 5) return { text: 'ON FIRE!', color: '#40ff40' }
  return null
}
