// @ts-nocheck
// Sprite caching layer — pre-renders character/monster/minion sprites to
// offscreen canvases keyed by (type, direction, isMoving, isAttacking,
// animation-bucket, skin). Massive perf win vs running dozens of fillRects
// per entity every single frame.

import {
  drawCharacter as drawCharacterRaw,
  drawMonster as drawMonsterRaw,
  drawMinion as drawMinionRaw,
} from './sprites'
import type { CharacterClass, Direction, MonsterType, MinionType } from './types'

const PAD = 10 // extra room around 32px sprite for weapons / plumes / horns
const TILE = 32
const CACHE_PX = TILE + PAD * 2 // 52

// 8 animation buckets per state — visually indistinguishable from per-frame
// at typical game speed, but slashes cache size by ~16x.
const BUCKETS = 8
const BUCKET_STEP = 3 // frame increment per bucket (must match render expectations)

const MAX_ENTRIES = 8192 // Increased cache size for better performance

function makeOffscreen(scale: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.ceil(CACHE_PX * scale)
  c.height = Math.ceil(CACHE_PX * scale)
  const cx = c.getContext('2d')!
  cx.imageSmoothingEnabled = false
  return c
}

function evict(map: Map<string, HTMLCanvasElement>) {
  if (map.size <= MAX_ENTRIES) return
  // More aggressive eviction (20%) for better memory management
  const drop = Math.ceil(MAX_ENTRIES * 0.2)
  const it = map.keys()
  for (let i = 0; i < drop; i++) {
    const k = it.next().value
    if (k === undefined) break
    map.delete(k)
  }
}

// ─── Character ─────────────────────────────────────────────────────────────

const charCache = new Map<string, HTMLCanvasElement>()

export function drawCharacterCached(
  ctx: CanvasRenderingContext2D,
  cls: CharacterClass,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  animFrame: number,
  x: number,
  y: number,
  scale: number = 1,
  skin: number = 0,
) {
  const bucket = Math.floor(animFrame / BUCKET_STEP) % BUCKETS
  const movKey = isMoving ? 1 : 0
  const atkKey = isAttacking ? 1 : 0
  // Frame bucketing is irrelevant when neither moving nor attacking → idle
  const effBucket = movKey || atkKey ? bucket : 0
  const key = `${cls}|${direction}|${movKey}|${atkKey}|${effBucket}|${skin}|${scale}`

  let cv = charCache.get(key)
  if (!cv) {
    cv = makeOffscreen(scale)
    const cx = cv.getContext('2d')!
    // Render at offset PAD so weapons/plumes that overflow 0..32 stay in bounds.
    drawCharacterRaw(
      cx,
      cls,
      direction,
      isMoving,
      isAttacking,
      effBucket * BUCKET_STEP,
      PAD,
      PAD,
      scale,
      skin,
    )
    charCache.set(key, cv)
    evict(charCache)
  }
  ctx.drawImage(cv, x - PAD * scale, y - PAD * scale)
}

// ─── Monster ──────────────────────────────────────────────────────────────

const monCache = new Map<string, HTMLCanvasElement>()

export function drawMonsterCached(
  ctx: CanvasRenderingContext2D,
  type: MonsterType,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  animFrame: number,
  x: number,
  y: number,
  scale: number = 1,
) {
  const bucket = Math.floor(animFrame / BUCKET_STEP) % BUCKETS
  const movKey = isMoving ? 1 : 0
  const atkKey = isAttacking ? 1 : 0
  const effBucket = movKey || atkKey ? bucket : 0
  const key = `${type}|${direction}|${movKey}|${atkKey}|${effBucket}|${scale}`

  let cv = monCache.get(key)
  if (!cv) {
    cv = makeOffscreen(scale)
    const cx = cv.getContext('2d')!
    drawMonsterRaw(
      cx,
      type,
      direction,
      isMoving,
      isAttacking,
      effBucket * BUCKET_STEP,
      PAD,
      PAD,
      scale,
    )
    monCache.set(key, cv)
    evict(monCache)
  }
  ctx.drawImage(cv, x - PAD * scale, y - PAD * scale)
}

// ─── Minion ───────────────────────────────────────────────────────────────

const minCache = new Map<string, HTMLCanvasElement>()

export function drawMinionCached(
  ctx: CanvasRenderingContext2D,
  type: MinionType,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  animFrame: number,
  x: number,
  y: number,
  scale: number = 0.85,
) {
  const bucket = Math.floor(animFrame / BUCKET_STEP) % BUCKETS
  const movKey = isMoving ? 1 : 0
  const atkKey = isAttacking ? 1 : 0
  const effBucket = movKey || atkKey ? bucket : 0
  const key = `${type}|${direction}|${movKey}|${atkKey}|${effBucket}|${scale}`

  let cv = minCache.get(key)
  if (!cv) {
    cv = makeOffscreen(scale)
    const cx = cv.getContext('2d')!
    drawMinionRaw(
      cx,
      type,
      direction,
      isMoving,
      isAttacking,
      effBucket * BUCKET_STEP,
      PAD,
      PAD,
      scale,
    )
    minCache.set(key, cv)
    evict(minCache)
  }
  ctx.drawImage(cv, x - PAD * scale, y - PAD * scale)
}

export function clearSpriteCaches() {
  charCache.clear()
  monCache.clear()
  minCache.clear()
}