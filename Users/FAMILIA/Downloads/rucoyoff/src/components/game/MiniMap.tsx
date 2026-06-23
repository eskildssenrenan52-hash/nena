import { useRef, useEffect, memo } from 'react'
import type { GameState } from '@/lib/game/types'

interface Props {
  gameState: GameState
  onToggleWorldMap?: () => void
}

function MiniMapImpl({ gameState, onToggleWorldMap }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const baseCacheRef = useRef<{ mapId: string | null; canvas: HTMLCanvasElement | null }>({ mapId: null, canvas: null })
  const { player, currentMap, _weather, _timeOfDay, _killStreak } = gameState
  if (!player || !currentMap) return null

  const size = 160
  const mapW = currentMap.width
  const mapH = currentMap.height

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = canvas.width / mapW
    const scaleY = canvas.height / mapH

    // Cache da camada estática (tiles) por mapa — só recalcula quando troca de mapa.
    let base = baseCacheRef.current
    if (base.mapId !== currentMap.id || !base.canvas) {
      const bc = document.createElement('canvas')
      bc.width = canvas.width
      bc.height = canvas.height
      const bctx = bc.getContext('2d')!
      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const tile = currentMap.tiles[y]?.[x]
          if (!tile) continue
          const color = TILE_COLORS[tile.type] || '#1a1a2e'
          bctx.fillStyle = color
          bctx.fillRect(x * scaleX, y * scaleY, scaleX + 0.5, scaleY + 0.5)
        }
      }
      base = { mapId: currentMap.id, canvas: bc }
      baseCacheRef.current = base
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(base.canvas!, 0, 0)

    for (const m of currentMap.monsters) {
      if (m.isDead) continue
      const mx = Math.floor((m.position.x + 16) / 32)
      const my = Math.floor((m.position.y + 16) / 32)
      ctx.fillStyle = MONSTER_COLORS[m.elite] || '#ff4444'
      ctx.fillRect(mx * scaleX, my * scaleY, scaleX + 1, scaleY + 1)
    }

    const px = Math.floor((player.position.x + 16) / 32)
    const py = Math.floor((player.position.y + 16) / 32)

    // Player dot with glow
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 4
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(px * scaleX - 1, py * scaleY - 1, scaleX + 3, scaleY + 3)
    ctx.shadowBlur = 0
    // Throttle: redesenhamos overlay a cada ~6 frames (10 Hz suficiente para minimapa).
  }, [Math.floor((gameState.tick ?? 0) / 6), currentMap.id, mapW, mapH])

  // Time of day label
  const tod = _timeOfDay ?? 0
  const hour = Math.floor((tod / 14400) * 24)
  const timeLabel = `${hour.toString().padStart(2, '0')}:00`
  const isDawn = hour >= 5 && hour < 8
  const isDay = hour >= 8 && hour < 18
  const isDusk = hour >= 18 && hour < 21
  const timeColor = isDay ? '#f0d060' : (isDawn || isDusk) ? '#ff8040' : '#4060d0'

  const weatherIcon = { rain: '🌧', snow: '❄', fog: '🌫', storm: '⚡', none: '' }[_weather ?? 'none']
  const streak = _killStreak ?? 0

  return (
    <div
      className="absolute bottom-4 right-4 rounded-lg overflow-visible"
      style={{
        width: size,
        zIndex: 50,
        border: '2px solid rgba(42,74,138,0.7)',
        background: 'rgba(4,6,14,0.97)',
        boxShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 8px rgba(30,60,120,0.5)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onToggleWorldMap}
      title="Clique para abrir o Mapa Mundi [M]"
    >
      {/* Status bar above minimap */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px', background: 'rgba(0,0,0,0.5)', fontSize: 9, fontFamily: 'monospace' }}>
        <span style={{ color: timeColor }}>{timeLabel}</span>
        <span style={{ color: '#80a0c0' }}>{weatherIcon || '☀'}</span>
        {streak >= 3 && <span style={{ color: '#ff8040', fontWeight: 'bold' }}>{streak}x</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={Math.min(mapW, 160)}
        height={Math.min(mapH, 160)}
        style={{ width: '100%', height: size, display: 'block' }}
      />
      <div
        className="text-center text-[8px] font-bold py-0.5"
        style={{ background: 'rgba(0,0,0,0.75)', color: '#8a9ab0', fontFamily: 'monospace', letterSpacing: '0.03em' }}
      >
        {currentMap.name} · [M]
      </div>
    </div>
  )
}

const MiniMap = memo(MiniMapImpl, (prev, next) => {
  // Re-render só quando algo visível no minimapa muda
  const a = prev.gameState, b = next.gameState
  if (a.currentMap !== b.currentMap) return false
  if (a.player?.position.x !== b.player?.position.x) return false
  if (a.player?.position.y !== b.player?.position.y) return false
  if (a._weather !== b._weather) return false
  if (a._killStreak !== b._killStreak) return false
  if (Math.floor((a.tick ?? 0) / 6) !== Math.floor((b.tick ?? 0) / 6)) return false
  if (Math.floor((a._timeOfDay ?? 0) / 600) !== Math.floor((b._timeOfDay ?? 0) / 600)) return false
  return true
})
export default MiniMap

const TILE_COLORS: Record<string, string> = {
  grass: '#1a3a1a', dirt: '#2a3a2a', stone: '#3a3a3a',
  water: '#0a2a4a', deepwater: '#051a2a', sand: '#3a3a2a',
  snow: '#2a2a3a', lava: '#4a0a0a', wall: '#2a2a2a',
  floor: '#2a2a3a', tree: '#0a3a0a', rock: '#3a3a2a',
  chest: '#4a3a0a', portal: '#4a4a00',
  dungeon_floor: '#1a1a2a', dungeon_wall: '#2a2a2a', dungeon_brick: '#1a1a1a',
  road: '#2a2a3a', bridge: '#3a2a2a', tall_grass: '#1a3a1a',
  flower: '#2a3a1a', cobblestone: '#2a2a3a', house_wall: '#3a2a1a',
  house_roof: '#2a2a3a', house_door: '#1a1a2a', fountain: '#0a2a4a',
  lamp_post: '#3a3a0a', market_stall: '#3a3a0a', fence: '#2a2a1a',
  garden: '#0a3a0a', ice: '#1a2a3a', frozen_tree: '#0a2a3a',
  ice_rock: '#2a2a3a', snow_rock: '#2a2a3a', volcanic_rock: '#2a1a1a',
  ash: '#1a1a1a', obsidian: '#0a0a0a', magma_crust: '#2a0a0a', volcanic_vent: '#1a0a0a',
  // Abyss
  void: '#000000', abyss_floor: '#100518', crystal: '#1a0a3a', dark_crystal: '#0a0520',
  abyss_wall: '#08030f', soul_fire: '#300a50',
  // Deep Forest
  ancient_bark: '#0a2a0a', mossy_stone: '#1a2a1a', dark_water: '#051215',
  mushroom: '#2a1a2a', root: '#1a1a0a', canopy: '#051a05',
}

const MONSTER_COLORS: Record<string, string> = {
  normal: '#ff4444', elite: '#ff8800', champion: '#ff00ff', boss: '#ff0000',
}
