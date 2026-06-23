// @ts-nocheck
import { useEffect, useRef, useCallback } from 'react'
import type { GameState } from '@/lib/game/types'
import { drawTile, drawProjectile, drawAreaEffect } from '@/lib/game/sprites'
import {
  drawCharacterCached as drawCharacter,
  drawMonsterCached as drawMonster,
  drawMinionCached as drawMinion,
} from '@/lib/game/spriteCache'

const TILE = 32
const CHUNK_TILES = 20 // 20x20 = 640x640px per chunk (larger chunks = fewer draw calls)
const CHUNK_PX = CHUNK_TILES * TILE

// Tile types that animate every frame — must be drawn on top of the static cache
const ANIMATED_TILES = new Set([
  'water', 'deepwater', 'lava', 'dark_water',
  'soul_fire', 'portal',
])

interface Props {
  gameState: GameState
  onCanvasClick: (worldX: number, worldY: number) => void
}

interface ChunkCacheEntry {
  canvas: HTMLCanvasElement
  /** Tiles inside this chunk that animate, [tx, ty, type] */
  animated: Array<[number, number, string]>
}

export default function GameCanvas({ gameState, onCanvasClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  // Cache static tile layer per map, sliced into chunks
  const chunkCacheRef = useRef<{ mapId: string | null; chunks: Map<string, ChunkCacheEntry> }>({
    mapId: null,
    chunks: new Map(),
  })

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let ctx = ctxRef.current
    if (!ctx) {
      // alpha:false dá ~2x boost de blit; desabilitar smoothing evita reamostragem
      ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D | null
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      ctxRef.current = ctx
    }

    const { currentMap, player, camera, tick, damageNumbers, particles, minions, projectiles, areaEffects } = gameState
    if (!currentMap || !player) return

    // Reset chunk cache when map changes
    const cache = chunkCacheRef.current
    if (cache.mapId !== currentMap.id) {
      cache.mapId = currentMap.id
      cache.chunks.clear()
    }

    // Clear
    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(-camera.x, -camera.y)

    // ── Render visible tile chunks (with caching) ──
    const startCX = Math.max(0, Math.floor(camera.x / CHUNK_PX))
    const startCY = Math.max(0, Math.floor(camera.y / CHUNK_PX))
    const endCX = Math.min(Math.ceil(currentMap.width / CHUNK_TILES), Math.ceil((camera.x + canvas.width) / CHUNK_PX))
    const endCY = Math.min(Math.ceil(currentMap.height / CHUNK_TILES), Math.ceil((camera.y + canvas.height) / CHUNK_PX))

    // Orçamento: no máx. 4 chunks novos por frame (≈4ms). Os restantes
    // ficam pendentes; nesse frame desenhamos só um fundo escuro no lugar.
    // Isso elimina o "freeze" inicial ao entrar em mapas enormes.
    let chunksBuiltThisFrame = 0
    const CHUNK_BUDGET = 4

    for (let cy = startCY; cy < endCY; cy++) {
      for (let cx = startCX; cx < endCX; cx++) {
        const key = `${cx},${cy}`
        let entry = cache.chunks.get(key)
        if (!entry) {
          if (chunksBuiltThisFrame >= CHUNK_BUDGET) {
            // placeholder até o chunk ser construído num frame futuro
            ctx.fillStyle = '#0a0e16'
            ctx.fillRect(cx * CHUNK_PX, cy * CHUNK_PX, CHUNK_PX, CHUNK_PX)
            continue
          }
          entry = buildChunk(currentMap, cx, cy)
          cache.chunks.set(key, entry)
          chunksBuiltThisFrame++
        }
        // Blit cached static layer
        ctx.drawImage(entry.canvas, cx * CHUNK_PX, cy * CHUNK_PX)
        // Redraw animated tiles on top with current tick
        if (entry.animated.length > 0) {
          for (const [tx, ty, type] of entry.animated) {
            drawTile(ctx, type, tx * TILE, ty * TILE, tick)
          }
        }
      }
    }

    // Pré-construir 1 chunk vizinho fora-de-tela (prefetch) para suavizar pan
    if (chunksBuiltThisFrame < CHUNK_BUDGET) {
      const pCX = endCX, pCY = startCY
      const pkey = `${pCX},${pCY}`
      if (pCX < Math.ceil(currentMap.width / CHUNK_TILES) && !cache.chunks.has(pkey)) {
        cache.chunks.set(pkey, buildChunk(currentMap, pCX, pCY))
      }
    }

    // ── Visible-rect culling helpers ──
    const viewL = camera.x - 48
    const viewR = camera.x + canvas.width + 48
    const viewT = camera.y - 48
    const viewB = camera.y + canvas.height + 48

    // ── Monsters ──
    const visibleMonsters: typeof currentMap.monsters = []
    for (const monster of currentMap.monsters) {
      if (monster.isDead && monster.deathTimer <= 0) continue
      const mx = monster.position.x
      const my = monster.position.y
      if (mx + 32 < viewL || mx > viewR || my + 32 < viewT || my > viewB) continue
      visibleMonsters.push(monster)
    }
    visibleMonsters.sort((a, b) => a.position.y - b.position.y)

    for (const monster of visibleMonsters) {
      const mx = monster.position.x
      const my = monster.position.y
      const alpha = monster.isDead ? Math.max(0, monster.deathTimer / 80) : 1
      ctx.globalAlpha = alpha
      drawMonster(ctx, monster.type, monster.direction, monster.isMoving, monster.isAttacking, monster.animFrame, mx, my, 1)

      if (!monster.isDead && monster.hp < monster.maxHp) {
        const barW = 32, barH = 4, bx = mx, by = my - 10
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2)
        ctx.fillStyle = '#3a0000'; ctx.fillRect(bx, by, barW, barH)
        ctx.fillStyle = '#e03030'; ctx.fillRect(bx, by, Math.round(barW * (monster.hp / monster.maxHp)), barH)
      }

      // Always show level above monster
      if (!monster.isDead) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)'
        ctx.fillRect(mx - 20, my - 26, 72, 14)
        ctx.fillStyle = '#e8d9b5'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`Lv${monster.level}`, mx + 16, my - 15)
        ctx.textAlign = 'left'
      }

      if (monster.statusEffects && monster.statusEffects.length > 0 && !monster.isDead) {
        const ew = 14
        const tw = monster.statusEffects.length * ew
        let ex = mx + 16 - tw / 2
        const ey = my - 34
        for (const effect of monster.statusEffects) {
          ctx.fillStyle = `${effect.color}40`; ctx.fillRect(ex, ey, ew - 2, ew - 2)
          ctx.strokeStyle = `${effect.color}80`; ctx.lineWidth = 1; ctx.strokeRect(ex, ey, ew - 2, ew - 2)
          ctx.fillStyle = effect.color
          ctx.font = '8px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(effect.icon, ex + (ew - 2) / 2, ey + 9)
          ex += ew
        }
        ctx.textAlign = 'left'
      }
      ctx.globalAlpha = 1
    }

    // ── Minions ──
    for (const minion of minions) {
      const mx = minion.position.x, my = minion.position.y
      if (mx + 32 < viewL || mx > viewR || my + 32 < viewT || my > viewB) continue
      ctx.globalAlpha = minion.lifespan < 120 ? Math.max(0.3, (minion.lifespan % 30) / 30) : 1
      drawMinion(ctx, minion.type, minion.direction, minion.isMoving, minion.isAttacking, minion.animFrame, mx, my, 0.85)
      ctx.globalAlpha = 1
      if (minion.hp < minion.maxHp) {
        const barW = 24
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(mx + 2, my - 6, barW + 2, 4)
        ctx.fillStyle = '#80ff90'; ctx.fillRect(mx + 3, my - 5, Math.round(barW * (minion.hp / minion.maxHp)), 2)
      }
    }

    // ── Player ──
    const px = player.position.x, py = player.position.y
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath(); ctx.ellipse(px + 16, py + 30, 10, 4, 0, 0, Math.PI * 2); ctx.fill()
    drawCharacter(ctx, player.class, player.direction, player.isMoving, player.isAttacking, tick, px, py, 1, player.skin ?? 0)

    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(px - 14, py - 20, 60, 13)
    ctx.fillStyle = '#f0c040'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(player.name, px + 16, py - 9)
    ctx.textAlign = 'left'

    // ── Area effects, projectiles, particles ──
    for (const fx of areaEffects) drawAreaEffect(ctx, fx)

    for (const proj of projectiles) {
      if (proj.x + 32 < viewL || proj.x > viewR || proj.y + 32 < viewT || proj.y > viewB) continue
      drawProjectile(ctx, proj, tick)
    }

    for (const p of particles) {
      const lifeRatio = p.life / p.maxLife
      ctx.globalAlpha = lifeRatio
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1

    // ── Damage numbers ──
    for (const d of damageNumbers) {
      const lifeRatio = d.timer / 60
      const floatY = (1 - lifeRatio) * 30
      ctx.globalAlpha = lifeRatio
      let color = '#ffffff', fontSize = 13
      if (d.type === 'crit') { color = '#ffcc00'; fontSize = 17 }
      else if (d.type === 'magic') { color = '#80a0ff' }
      else if (d.type === 'heal') { color = '#40ff80'; fontSize = 14 }
      else if (d.type === 'physical') { color = '#ff6060' }
      ctx.font = `bold ${fontSize}px monospace`
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 3
      ctx.textAlign = 'center'
      const text = d.type === 'crit' ? `CRIT! ${d.value}` : `${d.value}`
      ctx.strokeText(text, d.x, d.y - floatY)
      ctx.fillStyle = color
      ctx.fillText(text, d.x, d.y - floatY)
      ctx.textAlign = 'left'
    }
    ctx.globalAlpha = 1

    ctx.restore()

    // ── Weather overlay ──
    const weather = (gameState as any)._weather ?? 'none'
    const wIntensity = (gameState as any)._weatherIntensity ?? 0.5
    if (weather !== 'none') {
      const seed = gameState.tick ?? 0
      if (weather === 'rain' || weather === 'storm') {
        ctx.save()
        ctx.strokeStyle = weather === 'storm' ? 'rgba(180,200,255,0.35)' : 'rgba(120,160,255,0.25)'
        ctx.lineWidth = 1
        const count = Math.floor(50 * wIntensity)
        for (let i = 0; i < count; i++) {
          const h = Math.sin(seed * 0.017 + i * 2.399) * 0.5 + 0.5
          const h2 = Math.sin(seed * 0.013 + i * 1.618) * 0.5 + 0.5
          const rx = h * canvas.width
          const ry = ((h2 + seed * 0.04 * (1 + i * 0.01)) % 1) * canvas.height
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 2, ry + 10); ctx.stroke()
        }
        ctx.restore()
      } else if (weather === 'snow') {
        ctx.save()
        ctx.fillStyle = 'rgba(220,230,255,0.55)'
        const count = Math.floor(40 * wIntensity)
        for (let i = 0; i < count; i++) {
          const h = Math.sin(seed * 0.011 + i * 2.399) * 0.5 + 0.5
          const h2 = Math.sin(seed * 0.007 + i * 1.618) * 0.5 + 0.5
          const rx = h * canvas.width
          const ry = ((h2 + seed * 0.02 * (1 + i * 0.01)) % 1) * canvas.height
          ctx.fillRect(rx, ry, 2, 2)
        }
        ctx.restore()
      } else if (weather === 'fog') {
        ctx.save()
        ctx.fillStyle = `rgba(180,190,210,${0.12 * wIntensity})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
    }

    // ── Time of day tint ──
    const tod = (gameState as any)._timeOfDay ?? 7200
    const hour = (tod / 14400) * 24
    let nightAlpha = 0
    if (hour < 5) nightAlpha = 0.45
    else if (hour < 8) nightAlpha = 0.45 - ((hour - 5) / 3) * 0.45
    else if (hour >= 18 && hour < 21) nightAlpha = ((hour - 18) / 3) * 0.45
    else if (hour >= 21) nightAlpha = 0.45
    if (nightAlpha > 0) {
      ctx.fillStyle = `rgba(10,10,40,${nightAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    if (hour >= 5.5 && hour < 8.5) {
      ctx.fillStyle = `rgba(255,120,40,${0.12 * Math.sin(((hour - 5.5) / 3) * Math.PI)})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // ── Map name overlay (first 3s) ──
    if (tick < 180) {
      const fade = Math.min(1, tick / 40) * (1 - Math.max(0, (tick - 140) / 40))
      ctx.globalAlpha = fade
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      const tw = 300
      ctx.fillRect(canvas.width / 2 - tw / 2, canvas.height / 2 - 32, tw, 52)
      ctx.fillStyle = '#f0c040'
      ctx.font = 'bold 20px serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentMap.name, canvas.width / 2, canvas.height / 2 - 6)
      ctx.fillStyle = '#8090b0'
      ctx.font = '12px monospace'
      ctx.fillText(`Lv. ${player.level} — ${player.name}`, canvas.width / 2, canvas.height / 2 + 16)
      ctx.textAlign = 'left'
      ctx.globalAlpha = 1
    }

    const lvlFlash = (gameState as any)._levelUpFlash ?? 0
    if (lvlFlash > 0) {
      const a = Math.min(0.45, lvlFlash / 30)
      ctx.fillStyle = `rgba(80,200,255,${a})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = `rgba(255,255,200,${Math.min(1, lvlFlash / 20)})`
      ctx.font = 'bold 26px serif'
      ctx.textAlign = 'center'
      ctx.fillText(`⭐ NÍVEL ${player.level}!`, canvas.width / 2, canvas.height / 2 + 9)
      ctx.textAlign = 'left'
    }
  }, [gameState])

  useEffect(() => { render() }, [render])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    onCanvasClick(cx + gameState.camera.x, cy + gameState.camera.y)
  }, [gameState.camera, onCanvasClick])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const wx = cx + gameState.camera.x
    const wy = cy + gameState.camera.y
    const { currentMap } = gameState
    if (currentMap) {
      const hovered = currentMap.monsters.find((m: any) => {
        if (m.isDead) return false
        return wx >= m.position.x && wx <= m.position.x + 32 && wy >= m.position.y && wy <= m.position.y + 32
      })
      canvas.style.cursor = hovered ? 'crosshair' : 'default'
    }
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={540}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="block w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

/** Pre-render a chunk of static tiles to an offscreen canvas */
function buildChunk(map: any, cx: number, cy: number): ChunkCacheEntry {
  const canvas = document.createElement('canvas')
  canvas.width = CHUNK_PX
  canvas.height = CHUNK_PX
  const ctx = canvas.getContext('2d')!
  const animated: Array<[number, number, string]> = []

  const startTX = cx * CHUNK_TILES
  const startTY = cy * CHUNK_TILES
  const endTX = Math.min(map.width, startTX + CHUNK_TILES)
  const endTY = Math.min(map.height, startTY + CHUNK_TILES)

  for (let ty = startTY; ty < endTY; ty++) {
    for (let tx = startTX; tx < endTX; tx++) {
      const tile = map.tiles[ty]?.[tx]
      if (!tile) continue
      const localX = (tx - startTX) * TILE
      const localY = (ty - startTY) * TILE
      // Draw the static frame (tick=0) into the chunk canvas
      drawTile(ctx, tile.type, localX, localY, 0)
      if (ANIMATED_TILES.has(tile.type)) {
        animated.push([tx, ty, tile.type])
      }
    }
  }

  return { canvas, animated }
}
