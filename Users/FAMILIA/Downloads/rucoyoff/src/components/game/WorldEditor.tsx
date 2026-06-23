import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import type { GameMap, TileType, MonsterType, EditorState, EditorTool, Tile, Vec2 } from '@/lib/game/types'
import { drawTile } from '@/lib/game/sprites'
import { createMonster } from '@/lib/game/data'

const TILE = 32
const MAX_HISTORY = 40

// ─── Tile catalog ─────────────────────────────────────────────────────────

const TILE_GROUPS: { label: string; tiles: { type: TileType; label: string; color: string }[] }[] = [
  {
    label: 'Terreno',
    tiles: [
      { type: 'grass',      label: 'Grama',    color: '#2d5a1b' },
      { type: 'dirt',       label: 'Terra',    color: '#6b4c2a' },
      { type: 'stone',      label: 'Pedra',    color: '#606060' },
      { type: 'sand',       label: 'Areia',    color: '#c8a050' },
      { type: 'snow',       label: 'Neve',     color: '#d0dce8' },
      { type: 'road',       label: 'Estrada',  color: '#5a5048' },
      { type: 'bridge',     label: 'Ponte',    color: '#8a6030' },
      { type: 'cobblestone',label: 'Calçada',  color: '#7a7060' },
    ],
  },
  {
    label: 'Água / Fogo',
    tiles: [
      { type: 'water',      label: 'Água',     color: '#1a4a8a' },
      { type: 'deepwater',  label: 'Profundo', color: '#0a3060' },
      { type: 'lava',       label: 'Lava',     color: '#8a0000' },
    ],
  },
  {
    label: 'Objetos',
    tiles: [
      { type: 'tree',       label: 'Árvore',     color: '#2a5a18' },
      { type: 'rock',       label: 'Rocha',      color: '#505050' },
      { type: 'tall_grass', label: 'Capim Alto', color: '#4a8a28' },
      { type: 'flower',     label: 'Flor',       color: '#e060a0' },
      { type: 'portal',     label: 'Portal',     color: '#6020c0' },
      { type: 'chest',      label: 'Baú',        color: '#a07020' },
      { type: 'fountain',   label: 'Fonte',      color: '#5090c0' },
      { type: 'lamp_post',  label: 'Poste',      color: '#8a7030' },
      { type: 'fence',      label: 'Cerca',      color: '#6b4c2a' },
      { type: 'garden',     label: 'Jardim',     color: '#3a7028' },
    ],
  },
  {
    label: 'Construção',
    tiles: [
      { type: 'wall',         label: 'Parede',     color: '#3a3030' },
      { type: 'floor',        label: 'Piso',       color: '#252220' },
      { type: 'house_wall',   label: 'Casa Pared.',color: '#807060' },
      { type: 'house_roof',   label: 'Telhado',    color: '#9a3020' },
      { type: 'house_door',   label: 'Porta',      color: '#5a3010' },
      { type: 'market_stall', label: 'Barraca',    color: '#c08030' },
    ],
  },
  {
    label: 'Masmorra',
    tiles: [
      { type: 'dungeon_floor', label: 'Piso M.',    color: '#1e1a18' },
      { type: 'dungeon_wall',  label: 'Muro M.',    color: '#151210' },
      { type: 'dungeon_brick', label: 'Tijolo M.',  color: '#201c1a' },
    ],
  },
  {
    label: 'Tundra',
    tiles: [
      { type: 'ice',          label: 'Gelo',        color: '#80c0e8' },
      { type: 'frozen_tree',  label: 'Árv. Cong.',  color: '#a0c8d8' },
      { type: 'ice_rock',     label: 'Rocha Gelo',  color: '#90b8d0' },
      { type: 'snow_rock',    label: 'Rocha Neve', color: '#c8d8e0' },
    ],
  },
  {
    label: 'Vulcão',
    tiles: [
      { type: 'volcanic_rock', label: 'Rocha Vulc.', color: '#4a3028' },
      { type: 'ash',            label: 'Cinza',       color: '#3a3a3a' },
      { type: 'obsidian',       label: 'Obsidiana',   color: '#1a1a2a' },
      { type: 'magma_crust',    label: 'Crosta Mag.', color: '#6a2010' },
      { type: 'volcanic_vent',  label: 'Boca Vulc.',  color: '#8a1000' },
    ],
  },
]

const ALL_TILES = TILE_GROUPS.flatMap(g => g.tiles)

const MONSTER_LIST: { type: MonsterType; label: string; color: string }[] = [
  { type: 'slime', label: 'Slime', color: '#40a040' },
  { type: 'goblin', label: 'Goblin', color: '#80a030' },
  { type: 'skeleton', label: 'Esqueleto', color: '#c0b890' },
  { type: 'zombie', label: 'Zumbi', color: '#607040' },
  { type: 'wolf', label: 'Lobo', color: '#808068' },
  { type: 'spider', label: 'Aranha', color: '#604840' },
  { type: 'orc', label: 'Orc', color: '#508030' },
  { type: 'witch', label: 'Bruxa', color: '#804090' },
  { type: 'troll', label: 'Troll', color: '#506040' },
  { type: 'demon', label: 'Demônio', color: '#c02020' },
  { type: 'knight_enemy', label: 'Cav. Trevas', color: '#406080' },
  { type: 'archer_enemy', label: 'Arq. Sombrio', color: '#406050' },
  { type: 'mage_enemy', label: 'Mago Sombrio', color: '#5030a0' },
  { type: 'dragon', label: 'Dragão', color: '#c04020' },
]

const UNWALKABLE: TileType[] = ['water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock', 'house_wall', 'house_roof', 'fence', 'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent']

function makeTile(type: TileType): Tile {
  return { type, walkable: !UNWALKABLE.includes(type), transparent: true }
}

function cloneTiles(tiles: Tile[][]): Tile[][] {
  return tiles.map(row => row.map(t => ({ ...t })))
}

// ─── Editor Tools ──────────────────────────────────────────────────────────

type ExtendedTool = EditorTool | 'line' | 'rect' | 'rect_fill' | 'circle'

const TOOLS: { id: ExtendedTool; label: string; icon: string; hotkey: string; desc: string }[] = [
  { id: 'paint',      label: 'Pincel',    icon: '✎', hotkey: 'B', desc: 'Pintar tile (clique e arraste)' },
  { id: 'erase',      label: 'Borracha',  icon: '⌫', hotkey: 'E', desc: 'Substitui por grama' },
  { id: 'fill',       label: 'Balde',     icon: '⬛', hotkey: 'G', desc: 'Flood fill' },
  { id: 'line',       label: 'Linha',     icon: '╱',  hotkey: 'L', desc: 'Arraste para desenhar uma linha' },
  { id: 'rect',       label: 'Retân.',    icon: '▢',  hotkey: 'R', desc: 'Retângulo (contorno)' },
  { id: 'rect_fill',  label: 'Retân. ▣',  icon: '▣',  hotkey: 'F', desc: 'Retângulo preenchido' },
  { id: 'circle',     label: 'Círculo',   icon: '○',  hotkey: 'O', desc: 'Círculo preenchido' },
  { id: 'eyedropper', label: 'Conta-gotas', icon: '◉', hotkey: 'I', desc: 'Pegar tile do mapa' },
  { id: 'spawn',      label: 'Spawn',     icon: '★',  hotkey: 'S', desc: 'Marca ponto de respawn' },
  { id: 'monster',    label: 'Monstro',   icon: '👹', hotkey: 'M', desc: 'Coloca monstro (Shift+click para remover)' },
  { id: 'select',     label: 'Seleção',   icon: '⛶',  hotkey: 'V', desc: 'Selecionar região (Ctrl+C copia, Ctrl+V cola)' },
]

interface Props {
  map: GameMap
  editorState: EditorState
  onEditorStateChange: (s: EditorState) => void
  onMapChange: (m: GameMap) => void
  onClose: () => void
}

// ─── Drawing helpers ───────────────────────────────────────────────────────

function plotLine(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  const pts: Vec2[] = []
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
  let err = dx + dy, x = x0, y = y0
  while (true) {
    pts.push({ x, y })
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }
  }
  return pts
}

function plotRect(x0: number, y0: number, x1: number, y1: number, filled: boolean): Vec2[] {
  const pts: Vec2[] = []
  const ax = Math.min(x0, x1), bx = Math.max(x0, x1)
  const ay = Math.min(y0, y1), by = Math.max(y0, y1)
  for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) {
    if (filled || x === ax || x === bx || y === ay || y === by) pts.push({ x, y })
  }
  return pts
}

function plotCircle(cx: number, cy: number, r: number): Vec2[] {
  const pts: Vec2[] = []
  const r2 = r * r
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    if (x * x + y * y <= r2) pts.push({ x: cx + x, y: cy + y })
  }
  return pts
}

function floodFill(tiles: Tile[][], x: number, y: number, target: TileType, replacement: TileType): Vec2[] {
  if (target === replacement) return []
  const w = tiles[0]?.length ?? 0
  const h = tiles.length
  const visited: Vec2[] = []
  const stack: Vec2[] = [{ x, y }]
  while (stack.length) {
    const p = stack.pop()!
    if (p.x < 0 || p.y < 0 || p.x >= w || p.y >= h) continue
    if (tiles[p.y][p.x].type !== target) continue
    if (visited.some(v => v.x === p.x && v.y === p.y)) continue
    visited.push(p)
    if (visited.length > 8000) break
    stack.push({ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 })
  }
  return visited
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function WorldEditor({ map, editorState, onEditorStateChange, onMapChange, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Vec2>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<Vec2>({ x: 0, y: 0 })
  const panOrigin = useRef<Vec2>({ x: 0, y: 0 })

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Vec2 | null>(null)
  const [hoverTile, setHoverTile] = useState<Vec2 | null>(null)

  // Clipboard for select tool
  const clipboardRef = useRef<{ tiles: Tile[][]; w: number; h: number } | null>(null)

  const st = editorState
  const update = (patch: Partial<EditorState>) => onEditorStateChange({ ...st, ...patch })

  // ── History (undo/redo) ──────────────────────────────────────────────────

  const pushHistory = useCallback((tiles: Tile[][]) => {
    const truncated = st.history.slice(0, st.historyIndex + 1)
    truncated.push(cloneTiles(tiles))
    if (truncated.length > MAX_HISTORY) truncated.shift()
    onEditorStateChange({ ...st, history: truncated, historyIndex: truncated.length - 1 })
  }, [st, onEditorStateChange])

  const undo = useCallback(() => {
    if (st.historyIndex <= 0) return
    const idx = st.historyIndex - 1
    const tiles = cloneTiles(st.history[idx])
    onMapChange({ ...map, tiles })
    onEditorStateChange({ ...st, historyIndex: idx })
  }, [st, map, onMapChange, onEditorStateChange])

  const redo = useCallback(() => {
    if (st.historyIndex >= st.history.length - 1) return
    const idx = st.historyIndex + 1
    const tiles = cloneTiles(st.history[idx])
    onMapChange({ ...map, tiles })
    onEditorStateChange({ ...st, historyIndex: idx })
  }, [st, map, onMapChange, onEditorStateChange])

  // ── Apply paint to a list of cells ──────────────────────────────────────

  const applyCells = useCallback((cells: Vec2[], tileType: TileType, snapshot = true) => {
    if (cells.length === 0) return
    const tiles = cloneTiles(map.tiles)
    let changed = false
    for (const { x, y } of cells) {
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
      if (tiles[y][x].type !== tileType) {
        tiles[y][x] = makeTile(tileType)
        changed = true
      }
    }
    if (!changed) return
    onMapChange({ ...map, tiles })
    if (snapshot) pushHistory(tiles)
  }, [map, onMapChange, pushHistory])

  const brushCells = (cx: number, cy: number): Vec2[] => {
    const r = Math.max(0, st.brushSize - 1)
    if (r === 0) return [{ x: cx, y: cy }]
    return plotCircle(cx, cy, r)
  }

  // ── Render canvas ────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const w = container.clientWidth - 280 - 220 // sidebars
    const h = container.clientHeight - 50 // header
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    const startX = Math.max(0, Math.floor(-pan.x / zoom / TILE))
    const startY = Math.max(0, Math.floor(-pan.y / zoom / TILE))
    const endX = Math.min(map.width, Math.ceil((canvas.width - pan.x) / zoom / TILE) + 1)
    const endY = Math.min(map.height, Math.ceil((canvas.height - pan.y) / zoom / TILE) + 1)

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = map.tiles[ty]?.[tx]
        if (!tile) continue
        drawTile(ctx, tile.type, tx * TILE, ty * TILE, 0)
        if (st.showCollisions && !tile.walkable) {
          ctx.fillStyle = 'rgba(255,0,0,0.25)'
          ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE)
        }
      }
    }

    // Grid
    if (st.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1 / zoom
      for (let tx = startX; tx <= endX; tx++) {
        ctx.beginPath()
        ctx.moveTo(tx * TILE, startY * TILE)
        ctx.lineTo(tx * TILE, endY * TILE)
        ctx.stroke()
      }
      for (let ty = startY; ty <= endY; ty++) {
        ctx.beginPath()
        ctx.moveTo(startX * TILE, ty * TILE)
        ctx.lineTo(endX * TILE, ty * TILE)
        ctx.stroke()
      }
    }

    // Monsters
    if (st.showMonsters) {
      for (const m of map.monsters) {
        const info = MONSTER_LIST.find(x => x.type === m.type)
        ctx.fillStyle = info?.color ?? '#c02020'
        ctx.globalAlpha = 0.8
        ctx.fillRect(m.position.x, m.position.y, 32, 32)
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.strokeRect(m.position.x, m.position.y, 32, 32)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(`L${m.level}`, m.position.x + 2, m.position.y + 12)
      }
    }

    // Spawn points
    if (st.showSpawns) {
      for (const sp of map.spawnPoints) {
        ctx.fillStyle = 'rgba(64, 255, 128, 0.7)'
        ctx.beginPath()
        ctx.arc(sp.x + 16, sp.y + 16, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('★', sp.x + 16, sp.y + 21)
        ctx.textAlign = 'left'
      }
    }

    // Hover preview
    if (hoverTile && !isPanning) {
      const preview: Vec2[] =
        st.activeTool === 'paint' || st.activeTool === 'erase'
          ? brushCells(hoverTile.x, hoverTile.y)
          : (isDrawing && drawStart && (st.activeTool === 'line'))
              ? plotLine(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y)
          : (isDrawing && drawStart && (st.activeTool === 'rect'))
              ? plotRect(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y, false)
          : (isDrawing && drawStart && (st.activeTool === 'rect_fill'))
              ? plotRect(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y, true)
          : (isDrawing && drawStart && (st.activeTool === 'circle'))
              ? plotCircle(drawStart.x, drawStart.y, Math.round(Math.hypot(hoverTile.x - drawStart.x, hoverTile.y - drawStart.y)))
          : (isDrawing && drawStart && (st.activeTool === 'select'))
              ? plotRect(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y, false)
          : [hoverTile]

      ctx.fillStyle = st.activeTool === 'select' ? 'rgba(64,200,255,0.35)' : 'rgba(255,255,255,0.25)'
      ctx.strokeStyle = st.activeTool === 'select' ? '#40c8ff' : '#ffffff'
      ctx.lineWidth = 1 / zoom
      for (const c of preview) {
        if (c.x < 0 || c.y < 0 || c.x >= map.width || c.y >= map.height) continue
        ctx.fillRect(c.x * TILE, c.y * TILE, TILE, TILE)
      }
    }

    // Persistent selection
    if (st.selectionStart && st.selectionEnd) {
      const ax = Math.min(st.selectionStart.x, st.selectionEnd.x)
      const bx = Math.max(st.selectionStart.x, st.selectionEnd.x)
      const ay = Math.min(st.selectionStart.y, st.selectionEnd.y)
      const by = Math.max(st.selectionStart.y, st.selectionEnd.y)
      ctx.strokeStyle = '#40c8ff'
      ctx.lineWidth = 2 / zoom
      ctx.setLineDash([6 / zoom, 4 / zoom])
      ctx.strokeRect(ax * TILE, ay * TILE, (bx - ax + 1) * TILE, (by - ay + 1) * TILE)
      ctx.setLineDash([])
    }

    ctx.restore()
  }, [map, st, pan, zoom, hoverTile, isPanning, isDrawing, drawStart])

  useEffect(() => { render() }, [render])

  // Resize on container resize
  useEffect(() => {
    const ro = new ResizeObserver(() => render())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [render])

  // Snapshot initial state once
  useEffect(() => {
    if (st.history.length === 0) {
      onEditorStateChange({ ...st, history: [cloneTiles(map.tiles)], historyIndex: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pointer math ─────────────────────────────────────────────────────────

  const toTile = (e: React.MouseEvent<HTMLCanvasElement>): Vec2 => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const px = (e.clientX - rect.left - pan.x) / zoom
    const py = (e.clientY - rect.top - pan.y) / zoom
    return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) }
  }

  // ── Pointer events ───────────────────────────────────────────────────────

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
      panOrigin.current = { ...pan }
      e.preventDefault()
      return
    }
    if (e.button !== 0) return
    const t = toTile(e)
    if (t.x < 0 || t.y < 0 || t.x >= map.width || t.y >= map.height) return

    const tool = st.activeTool as ExtendedTool

    if (tool === 'eyedropper') {
      const tile = map.tiles[t.y][t.x]
      update({ selectedTile: tile.type, activeTool: 'paint' })
      return
    }

    if (tool === 'spawn') {
      onMapChange({ ...map, spawnPoints: [...map.spawnPoints, { x: t.x * TILE, y: t.y * TILE }] })
      return
    }

    if (tool === 'monster') {
      if (e.shiftKey) {
        onMapChange({
          ...map,
          monsters: map.monsters.filter(m => !(Math.floor(m.position.x / TILE) === t.x && Math.floor(m.position.y / TILE) === t.y)),
        })
      } else {
        const mob = createMonster(st.selectedMonsterType, st.selectedMonsterLevel, t.x * TILE, t.y * TILE)
        onMapChange({ ...map, monsters: [...map.monsters, mob] })
      }
      return
    }

    if (tool === 'fill') {
      const target = map.tiles[t.y][t.x].type
      const cells = floodFill(map.tiles, t.x, t.y, target, st.selectedTile)
      applyCells(cells, st.selectedTile)
      return
    }

    if (tool === 'paint' || tool === 'erase') {
      const tileType = tool === 'erase' ? 'grass' : st.selectedTile
      setIsDrawing(true)
      setDrawStart(t)
      applyCells(brushCells(t.x, t.y), tileType, false)
      return
    }

    if (tool === 'line' || tool === 'rect' || tool === 'rect_fill' || tool === 'circle' || tool === 'select') {
      setIsDrawing(true)
      setDrawStart(t)
      if (tool === 'select') update({ selectionStart: t, selectionEnd: t })
      return
    }
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: panOrigin.current.x + (e.clientX - panStart.current.x),
        y: panOrigin.current.y + (e.clientY - panStart.current.y),
      })
      return
    }
    const t = toTile(e)
    setHoverTile(t)

    if (!isDrawing || !drawStart) return
    const tool = st.activeTool as ExtendedTool
    if (tool === 'paint' || tool === 'erase') {
      const tileType = tool === 'erase' ? 'grass' : st.selectedTile
      // draw a line from previous to current to avoid gaps
      const cells: Vec2[] = []
      for (const p of plotLine(drawStart.x, drawStart.y, t.x, t.y)) {
        for (const c of brushCells(p.x, p.y)) cells.push(c)
      }
      applyCells(cells, tileType, false)
      setDrawStart(t)
    }
    if (tool === 'select') update({ selectionEnd: t })
  }

  const handleUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) { setIsPanning(false); return }
    if (!isDrawing || !drawStart) return
    const t = toTile(e)
    const tool = st.activeTool as ExtendedTool

    if (tool === 'paint' || tool === 'erase') {
      // commit history once at the end of stroke
      pushHistory(map.tiles)
    } else if (tool === 'line') {
      applyCells(plotLine(drawStart.x, drawStart.y, t.x, t.y), st.selectedTile)
    } else if (tool === 'rect') {
      applyCells(plotRect(drawStart.x, drawStart.y, t.x, t.y, false), st.selectedTile)
    } else if (tool === 'rect_fill') {
      applyCells(plotRect(drawStart.x, drawStart.y, t.x, t.y, true), st.selectedTile)
    } else if (tool === 'circle') {
      const r = Math.round(Math.hypot(t.x - drawStart.x, t.y - drawStart.y))
      applyCells(plotCircle(drawStart.x, drawStart.y, r), st.selectedTile)
    }
    setIsDrawing(false)
    setDrawStart(null)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const next = Math.min(4, Math.max(0.25, zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)))
    const ratio = next / zoom
    setPan({ x: mx - (mx - pan.x) * ratio, y: my - (my - pan.y) * ratio })
    setZoom(next)
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const k = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); return }
      if ((e.ctrlKey || e.metaKey) && k === 'c' && st.selectionStart && st.selectionEnd) {
        const ax = Math.min(st.selectionStart.x, st.selectionEnd.x)
        const bx = Math.max(st.selectionStart.x, st.selectionEnd.x)
        const ay = Math.min(st.selectionStart.y, st.selectionEnd.y)
        const by = Math.max(st.selectionStart.y, st.selectionEnd.y)
        const grid: Tile[][] = []
        for (let y = ay; y <= by; y++) {
          const row: Tile[] = []
          for (let x = ax; x <= bx; x++) row.push({ ...map.tiles[y][x] })
          grid.push(row)
        }
        clipboardRef.current = { tiles: grid, w: bx - ax + 1, h: by - ay + 1 }
        return
      }
      if ((e.ctrlKey || e.metaKey) && k === 'v' && clipboardRef.current && hoverTile) {
        const cb = clipboardRef.current
        const tiles = cloneTiles(map.tiles)
        for (let y = 0; y < cb.h; y++) for (let x = 0; x < cb.w; x++) {
          const tx = hoverTile.x + x, ty = hoverTile.y + y
          if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) continue
          tiles[ty][tx] = { ...cb.tiles[y][x] }
        }
        onMapChange({ ...map, tiles })
        pushHistory(tiles)
        return
      }
      if (e.key === 'Escape') { onClose(); return }
      const tool = TOOLS.find(t => t.hotkey.toLowerCase() === k)
      if (tool) update({ activeTool: tool.id as EditorTool })
      if (k === '[') update({ brushSize: Math.max(1, st.brushSize - 1) })
      if (k === ']') update({ brushSize: Math.min(10, st.brushSize + 1) })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [st, map, hoverTile, undo, redo, onMapChange, pushHistory, onClose])

  // ── Export / Import / Resize ────────────────────────────────────────────

  const exportMap = () => {
    const data = JSON.stringify({
      id: map.id, name: map.name, width: map.width, height: map.height,
      tiles: map.tiles.map(row => row.map(t => t.type)),
      monsters: map.monsters.map(m => ({ type: m.type, level: m.level, position: m.position })),
      spawnPoints: map.spawnPoints,
    }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${map.id}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const importMap = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const tiles: Tile[][] = data.tiles.map((row: TileType[]) => row.map((t: TileType) => makeTile(t)))
        const monsters = (data.monsters || []).map((m: { type: MonsterType; level: number; position: Vec2 }) =>
          createMonster(m.type, m.level, m.position.x, m.position.y))
        onMapChange({ ...map, name: data.name ?? map.name, width: data.width, height: data.height, tiles, monsters, spawnPoints: data.spawnPoints ?? [] })
        pushHistory(tiles)
      } catch (err) { alert('JSON inválido: ' + (err as Error).message) }
    }
    reader.readAsText(file)
  }

  const resizeMap = (newW: number, newH: number) => {
    const tiles: Tile[][] = []
    for (let y = 0; y < newH; y++) {
      const row: Tile[] = []
      for (let x = 0; x < newW; x++) {
        row.push(map.tiles[y]?.[x] ? { ...map.tiles[y][x] } : makeTile('grass'))
      }
      tiles.push(row)
    }
    onMapChange({ ...map, width: newW, height: newH, tiles })
    pushHistory(tiles)
  }

  const clearSelection = () => update({ selectionStart: null, selectionEnd: null })

  const fillSelection = () => {
    if (!st.selectionStart || !st.selectionEnd) return
    const cells = plotRect(st.selectionStart.x, st.selectionStart.y, st.selectionEnd.x, st.selectionEnd.y, true)
    applyCells(cells, st.selectedTile)
  }

  // ── Render UI ────────────────────────────────────────────────────────────

  const selectedTileInfo = useMemo(() => ALL_TILES.find(t => t.type === st.selectedTile), [st.selectedTile])

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ background: '#06070b', color: '#c8c0b0', fontFamily: 'monospace', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: 50, display: 'flex', alignItems: 'center', padding: '0 12px', background: 'rgba(10,14,22,0.95)', borderBottom: '2px solid #2a3860', gap: 10 }}>
        <span style={{ fontWeight: 800, color: '#c9952a', letterSpacing: 2, fontSize: 13 }}>⚒ EDITOR DE MUNDO</span>
        <input
          value={map.name}
          onChange={(e) => onMapChange({ ...map, name: e.target.value })}
          style={{ marginLeft: 10, background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '4px 8px', fontSize: 12, borderRadius: 3, width: 180 }}
        />
        <span style={{ color: '#5a7a9a', fontSize: 11 }}>{map.width}×{map.height}</span>

        <div style={{ flex: 1 }} />

        <button onClick={undo} disabled={st.historyIndex <= 0} title="Desfazer (Ctrl+Z)" style={btnStyle(st.historyIndex > 0)}>↶ Desfazer</button>
        <button onClick={redo} disabled={st.historyIndex >= st.history.length - 1} title="Refazer (Ctrl+Y)" style={btnStyle(st.historyIndex < st.history.length - 1)}>↷ Refazer</button>
        <button onClick={exportMap} title="Baixar mapa em JSON" style={btnStyle(true)}>↓ Exportar</button>
        <label style={{ ...btnStyle(true), cursor: 'pointer' }}>
          ↑ Importar
          <input type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importMap(e.target.files[0])} />
        </label>
        <button onClick={onClose} style={{ ...btnStyle(true), borderColor: '#8a1010', color: '#ff8060' }}>✕ Fechar (Esc)</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar: tools + tile palette */}
        <div style={{ width: 280, overflow: 'auto', background: 'rgba(8,10,18,0.95)', borderRight: '2px solid #2a3860', padding: 10 }}>
          <SectionLabel>FERRAMENTAS</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 12 }}>
            {TOOLS.map(t => (
              <button
                key={t.id}
                onClick={() => update({ activeTool: t.id as EditorTool })}
                title={`${t.label} [${t.hotkey}] — ${t.desc}`}
                style={{
                  aspectRatio: '1', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: st.activeTool === t.id ? '#1a2a4a' : '#0a0e16',
                  border: `1px solid ${st.activeTool === t.id ? '#c9952a' : '#2a3860'}`,
                  color: st.activeTool === t.id ? '#f0c040' : '#8a9ab0',
                  borderRadius: 4, cursor: 'pointer', fontSize: 16,
                  position: 'relative',
                }}
              >
                <span>{t.icon}</span>
                <span style={{ position: 'absolute', bottom: 1, right: 2, fontSize: 8, opacity: 0.6 }}>{t.hotkey}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#8a9ab0' }}>Pincel:</span>
            <input type="range" min={1} max={10} value={st.brushSize} onChange={(e) => update({ brushSize: +e.target.value })} style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: '#f0c040', width: 22, textAlign: 'right' }}>{st.brushSize}</span>
          </div>

          <SectionLabel>TILES — {selectedTileInfo?.label ?? st.selectedTile}</SectionLabel>
          {TILE_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: '#5a7a9a', marginBottom: 4, letterSpacing: 1 }}>{group.label.toUpperCase()}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
                {group.tiles.map(t => (
                  <button
                    key={t.type}
                    onClick={() => update({ selectedTile: t.type, activeTool: st.activeTool === 'eyedropper' ? 'paint' : st.activeTool })}
                    title={t.label}
                    style={{
                      aspectRatio: '1',
                      background: t.color,
                      border: `2px solid ${st.selectedTile === t.type ? '#f0c040' : '#000'}`,
                      boxShadow: st.selectedTile === t.type ? '0 0 6px rgba(240,192,64,0.6)' : 'none',
                      cursor: 'pointer',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleDown}
            onMouseMove={handleMove}
            onMouseUp={handleUp}
            onMouseLeave={() => { setIsDrawing(false); setIsPanning(false); setHoverTile(null) }}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
            style={{ display: 'block', cursor: isPanning ? 'grabbing' : 'crosshair' }}
          />
          {/* Zoom indicator */}
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', fontSize: 11, borderRadius: 3 }}>
            Zoom: {(zoom * 100).toFixed(0)}% • Roda do mouse para zoom • Alt/Meio para pan
            {hoverTile && <span style={{ marginLeft: 10, color: '#f0c040' }}>({hoverTile.x}, {hoverTile.y})</span>}
          </div>
        </div>

        {/* Right sidebar: layers + monsters + map ops */}
        <div style={{ width: 220, overflow: 'auto', background: 'rgba(8,10,18,0.95)', borderLeft: '2px solid #2a3860', padding: 10 }}>
          <SectionLabel>CAMADAS</SectionLabel>
          <Toggle label="Grid" value={st.showGrid} onChange={(v) => update({ showGrid: v })} />
          <Toggle label="Colisões" value={st.showCollisions} onChange={(v) => update({ showCollisions: v })} />
          <Toggle label="Monstros" value={st.showMonsters} onChange={(v) => update({ showMonsters: v })} />
          <Toggle label="Spawns" value={st.showSpawns} onChange={(v) => update({ showSpawns: v })} />

          <SectionLabel>MAPA</SectionLabel>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <NumInput label="L" value={map.width} onChange={(v) => resizeMap(v, map.height)} />
            <NumInput label="A" value={map.height} onChange={(v) => resizeMap(map.width, v)} />
          </div>
          <button onClick={() => {
            const tiles = Array.from({ length: map.height }, () => Array.from({ length: map.width }, () => makeTile('grass')))
            onMapChange({ ...map, tiles })
            pushHistory(tiles)
          }} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Limpar (grama)</button>
          <button onClick={() => onMapChange({ ...map, monsters: [] })} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Remover Monstros</button>
          <button onClick={() => onMapChange({ ...map, spawnPoints: [] })} style={{ ...btnStyle(true), width: '100%' }}>Remover Spawns</button>

          {(st.selectionStart && st.selectionEnd) && (
            <>
              <SectionLabel>SELEÇÃO</SectionLabel>
              <button onClick={fillSelection} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Preencher</button>
              <button onClick={clearSelection} style={{ ...btnStyle(true), width: '100%' }}>Limpar Seleção</button>
              <div style={{ fontSize: 10, color: '#5a7a9a', marginTop: 6 }}>Ctrl+C copia • Ctrl+V cola no cursor</div>
            </>
          )}

          <SectionLabel>MONSTROS</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#8a9ab0' }}>Nv:</span>
            <input type="number" min={1} max={50} value={st.selectedMonsterLevel} onChange={(e) => update({ selectedMonsterLevel: Math.max(1, +e.target.value) })}
              style={{ width: 50, background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '2px 4px', fontSize: 11, borderRadius: 2 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            {MONSTER_LIST.map(m => (
              <button key={m.type}
                onClick={() => update({ selectedMonsterType: m.type, activeTool: 'monster' })}
                title={m.label}
                style={{
                  background: st.selectedMonsterType === m.type ? '#1a2a4a' : '#0a0e16',
                  border: `1px solid ${st.selectedMonsterType === m.type ? m.color : '#2a3860'}`,
                  color: '#c8c0b0', fontSize: 10, padding: '4px 2px', cursor: 'pointer', borderRadius: 2,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                <span style={{ width: 10, height: 10, background: m.color, borderRadius: 2 }} />
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid #1a2540', borderRadius: 3, fontSize: 10, lineHeight: 1.5, color: '#5a7a9a' }}>
            <div style={{ color: '#c9952a', marginBottom: 4 }}>ATALHOS</div>
            B/E/G • L/R/F/O • I/S/M/V<br />
            [ ] = pincel ± • Ctrl+Z/Y<br />
            Ctrl+C/V • Alt+drag pan<br />
            Roda = zoom • Esc fecha
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Small UI bits ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, color: '#c9952a', letterSpacing: 2, marginTop: 10, marginBottom: 6, borderBottom: '1px solid #2a3860', paddingBottom: 3 }}>{children}</div>
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '3px 0', cursor: 'pointer', color: '#c8c0b0' }}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color: '#8a9ab0' }}>{label}</span>
      <input type="number" min={8} max={200} value={value}
        onChange={(e) => onChange(Math.max(8, Math.min(200, +e.target.value || 8)))}
        style={{ flex: 1, background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '2px 4px', fontSize: 11, borderRadius: 2, width: '100%' }} />
    </label>
  )
}

function btnStyle(enabled: boolean): React.CSSProperties {
  return {
    background: '#0a0e16',
    border: `1px solid ${enabled ? '#2a3860' : '#1a2030'}`,
    color: enabled ? '#e8d9b5' : '#3a4050',
    padding: '4px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    borderRadius: 3,
    cursor: enabled ? 'pointer' : 'not-allowed',
    letterSpacing: 0.5,
  }
}
