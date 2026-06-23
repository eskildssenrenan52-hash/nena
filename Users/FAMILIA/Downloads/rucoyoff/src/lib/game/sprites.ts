// @ts-nocheck
import type { CharacterClass, Direction, MonsterType, TileType, MinionType } from './types'

const S = 32 // tile size

// ─── Helpers ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function shadeColor(hex: string, factor: number) {
  const { r, g, b } = hexToRgb(hex)
  const nr = Math.min(255, Math.max(0, Math.round(r * factor)))
  const ng = Math.min(255, Math.max(0, Math.round(g * factor)))
  const nb = Math.min(255, Math.max(0, Math.round(b * factor)))
  return `rgb(${nr},${ng},${nb})`
}

// ─── Tile Renderer ─────────────────────────────────────────────────────────

export function drawTile(
  ctx: CanvasRenderingContext2D,
  type: TileType,
  x: number,
  y: number,
  tick: number = 0,
) {
  ctx.save()
  ctx.translate(x, y)

  switch (type) {
    case 'grass':
      drawGrassTile(ctx, tick)
      break
    case 'dirt':
      drawDirtTile(ctx)
      break
    case 'stone':
      drawStoneTile(ctx)
      break
    case 'water':
    case 'deepwater':
      drawWaterTile(ctx, tick, type === 'deepwater')
      break
    case 'sand':
      drawSandTile(ctx)
      break
    case 'lava':
      drawLavaTile(ctx, tick)
      break
    case 'wall':
      drawWallTile(ctx)
      break
    case 'floor':
    case 'dungeon_floor':
      drawDungeonFloor(ctx)
      break
    case 'dungeon_wall':
    case 'dungeon_brick':
      drawDungeonWall(ctx)
      break
    case 'road':
      drawRoadTile(ctx)
      break
    case 'snow':
      drawSnowTile(ctx)
      break
    case 'tree':
      drawTree(ctx)
      break
    case 'rock':
      drawRock(ctx)
      break
    case 'tall_grass':
      drawTallGrass(ctx, tick)
      break
    case 'flower':
      drawFlowerTile(ctx, tick)
      break
    case 'bridge':
      drawBridgeTile(ctx)
      break
    case 'portal':
      drawPortalTile(ctx, tick)
      break
    // ── City tiles ──
    case 'cobblestone':
      drawCobblestoneTile(ctx)
      break
    case 'house_wall':
      drawHouseWallTile(ctx)
      break
    case 'house_roof':
      drawHouseRoofTile(ctx)
      break
    case 'house_door':
      drawHouseDoorTile(ctx)
      break
    case 'fountain':
      drawFountainTile(ctx, tick)
      break
    case 'lamp_post':
      drawLampPostTile(ctx, tick)
      break
    case 'market_stall':
      drawMarketStallTile(ctx)
      break
    case 'fence':
      drawFenceTile(ctx)
      break
    case 'garden':
      drawGardenTile(ctx, tick)
      break
    case 'chest':
      drawChestTile(ctx)
      break
    // ── Tundra tiles ──
    case 'ice':
      drawIceTile(ctx, tick)
      break
    case 'frozen_tree':
      drawFrozenTree(ctx)
      break
    case 'ice_rock':
      drawIceRock(ctx)
      break
    case 'snow_rock':
      drawSnowRock(ctx)
      break
    // ── Volcano tiles ──
    case 'volcanic_rock':
      drawVolcanicRock(ctx)
      break
    case 'ash':
      drawAshTile(ctx)
      break
    case 'obsidian':
      drawObsidianTile(ctx)
      break
    case 'magma_crust':
      drawMagmaCrustTile(ctx, tick)
      break
    case 'volcanic_vent':
      drawVolcanicVent(ctx, tick)
      break
    // Abyss biome
    case 'void':
      ctx.fillStyle = '#020106'; ctx.fillRect(0,0,S,S)
      break
    case 'abyss_floor':
      ctx.fillStyle = '#0f0520'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#1a0a35'; ctx.fillRect(4,4,24,24)
      ctx.fillStyle = '#0a031a'; ctx.fillRect(0,0,3,3); ctx.fillRect(29,29,3,3)
      break
    case 'crystal':
      ctx.fillStyle = '#0f0520'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#4020a0'; ctx.fillRect(12,2,8,28)
      ctx.fillStyle = '#6040c0'; ctx.fillRect(14,4,4,24)
      ctx.fillStyle = '#8060e0'; ctx.fillRect(15,6,2,20)
      break
    case 'dark_crystal':
      ctx.fillStyle = '#04030c'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#200a40'; ctx.fillRect(11,1,10,30)
      ctx.fillStyle = '#100520'; ctx.fillRect(13,3,6,26)
      break
    case 'abyss_wall':
      ctx.fillStyle = '#060210'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#0a0418'; ctx.fillRect(2,2,28,28)
      break
    case 'soul_fire':
      ctx.fillStyle = '#0a0318'; ctx.fillRect(0,0,S,S)
      { const t = tick * 0.12; ctx.fillStyle = `rgba(${60+Math.sin(t)*20},0,${120+Math.sin(t*1.3)*40},0.9)`; ctx.fillRect(8,6,16,20) }
      { const t2 = tick * 0.09 + 1; ctx.fillStyle = `rgba(${140+Math.sin(t2)*30},0,${200+Math.sin(t2)*30},0.7)`; ctx.fillRect(11,8,10,14) }
      break
    // Deep Forest biome
    case 'ancient_bark':
      ctx.fillStyle = '#0d1f06'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#162810'; ctx.fillRect(2,0,28,32); ctx.fillRect(0,2,32,28)
      ctx.fillStyle = '#0a1b08'; ctx.fillRect(4,4,4,24); ctx.fillRect(24,4,4,24)
      break
    case 'mossy_stone':
      ctx.fillStyle = '#1a2215'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#253020'; ctx.fillRect(3,3,26,26)
      ctx.fillStyle = '#1e2c1a'; ctx.fillRect(6,6,20,20)
      break
    case 'dark_water':
      ctx.fillStyle = '#040e12'; ctx.fillRect(0,0,S,S)
      { const w = tick * 0.04; ctx.fillStyle = `rgba(10,25,30,${0.7+Math.sin(w)*0.2})`; ctx.fillRect(0,0,S,S/2) }
      break
    case 'mushroom':
      ctx.fillStyle = '#1a2218'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#6b2060'; ctx.beginPath(); ctx.arc(16,14,10,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#f0d0e0'; ctx.fillRect(14,14,4,14)
      ctx.fillStyle = '#8a3078'; ctx.beginPath(); ctx.arc(16,14,10,Math.PI,Math.PI*2); ctx.fill()
      break
    case 'root':
      ctx.fillStyle = '#111808'; ctx.fillRect(0,0,S,S)
      ctx.strokeStyle = '#2a2010'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(0,16); ctx.bezierCurveTo(8,8,24,24,32,16); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(16,0); ctx.bezierCurveTo(8,8,24,24,16,32); ctx.stroke()
      break
    case 'canopy':
      ctx.fillStyle = '#081208'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#0f2010'; ctx.fillRect(4,4,24,24)
      ctx.fillStyle = '#0a1a0a'; ctx.fillRect(8,8,16,16)
      break
    // ── Crystal Cave tiles ─────────────────────────────────────────────────
    case 'crystal_floor':
      ctx.fillStyle = '#060c1a'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#0d1830'; ctx.fillRect(2,2,28,28)
      ctx.fillStyle = '#162a44'; ctx.fillRect(6,6,4,4); ctx.fillRect(22,6,4,4); ctx.fillRect(14,20,4,4)
      break
    case 'crystal_wall':
      ctx.fillStyle = '#030810'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#0a1428'; ctx.fillRect(0,0,S,16); ctx.fillRect(0,16,16,S)
      ctx.fillStyle = '#04090e'; ctx.fillRect(16,16,S,S)
      break
    case 'gem_node':
      ctx.fillStyle = '#060c1a'; ctx.fillRect(0,0,S,S)
      { const t2 = tick * 0.08
        ctx.fillStyle = `rgba(${60+Math.sin(t2)*30},${120+Math.sin(t2*1.4)*40},${220+Math.sin(t2*0.9)*30},0.9)`
        ctx.beginPath(); ctx.arc(16,16,8,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = `rgba(160,210,255,0.5)`
        ctx.beginPath(); ctx.arc(13,13,3,0,Math.PI*2); ctx.fill() }
      break
    case 'crystal_portal':
      ctx.fillStyle = '#04060e'; ctx.fillRect(0,0,S,S)
      { const t2 = tick * 0.1
        ctx.fillStyle = `rgba(${40+Math.sin(t2)*20},${160+Math.sin(t2*1.2)*40},${220+Math.sin(t2*0.8)*30},0.85)`
        ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = 'rgba(200,240,255,0.7)'
        ctx.beginPath(); ctx.arc(16,16,5,0,Math.PI*2); ctx.fill() }
      break
    // ── Haunted Ruins tiles ────────────────────────────────────────────────
    case 'ruin_floor':
      ctx.fillStyle = '#100e0a'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#1a170f'; ctx.fillRect(1,1,14,14); ctx.fillRect(17,17,14,14)
      ctx.fillStyle = '#130f0a'; ctx.fillRect(17,1,14,14); ctx.fillRect(1,17,14,14)
      ctx.strokeStyle = '#0a0806'; ctx.lineWidth = 1
      ctx.strokeRect(0,0,S,S)
      break
    case 'ruin_wall':
      ctx.fillStyle = '#0a0806'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#161310'; ctx.fillRect(2,2,28,12); ctx.fillRect(2,16,28,14)
      ctx.fillStyle = '#0f0c09'; ctx.fillRect(0,14,32,2)
      break
    case 'cobweb':
      ctx.fillStyle = '#0d0b08'; ctx.fillRect(0,0,S,S)
      ctx.strokeStyle = 'rgba(200,195,185,0.35)'; ctx.lineWidth = 0.8
      for (let a = 0; a < 8; a++) {
        const ax = 16 + Math.cos(a * Math.PI/4) * 14
        const ay = 16 + Math.sin(a * Math.PI/4) * 14
        ctx.beginPath(); ctx.moveTo(16,16); ctx.lineTo(ax,ay); ctx.stroke()
      }
      for (let r = 4; r <= 14; r += 5) {
        ctx.beginPath(); ctx.arc(16,16,r,0,Math.PI*2); ctx.stroke()
      }
      break
    case 'haunted_portal':
      ctx.fillStyle = '#0a0608'; ctx.fillRect(0,0,S,S)
      { const t2 = tick * 0.07
        ctx.fillStyle = `rgba(${120+Math.sin(t2)*40},0,${60+Math.sin(t2*1.5)*30},0.8)`
        ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = 'rgba(255,100,120,0.6)'
        ctx.beginPath(); ctx.arc(16,16,5,0,Math.PI*2); ctx.fill() }
      break
    // ── Sky Realm tiles ───────────────────────────────────────────────────
    case 'cloud_floor':
      ctx.fillStyle = '#cce0f4'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#e8f4ff'; ctx.fillRect(2,2,28,22)
      ctx.fillStyle = '#ddeeff'; ctx.fillRect(4,6,24,12)
      break
    case 'sky_platform':
      ctx.fillStyle = '#a8c8e8'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#c0daf4'; ctx.fillRect(1,1,30,20)
      ctx.fillStyle = '#8ab0d0'; ctx.fillRect(0,24,32,8)
      break
    case 'sky_void':
      ctx.fillStyle = '#0a1428'; ctx.fillRect(0,0,S,S)
      { const t2 = tick * 0.003
        const star = (x: number, y: number, s: number) => { ctx.fillStyle = `rgba(200,220,255,${s})`; ctx.fillRect(x,y,1,1) }
        star(4,8,0.5+Math.sin(t2*3+1)*0.3)
        star(20,4,0.4+Math.sin(t2*2+2)*0.3)
        star(28,18,0.6+Math.sin(t2*4+3)*0.3)
        star(10,26,0.3+Math.sin(t2*5+4)*0.3) }
      break
    case 'sky_portal':
      ctx.fillStyle = '#0a1428'; ctx.fillRect(0,0,S,S)
      { const t2 = tick * 0.09
        ctx.fillStyle = `rgba(${200+Math.sin(t2)*40},${220+Math.sin(t2*1.2)*30},100,0.85)`
        ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,200,0.8)'
        ctx.beginPath(); ctx.arc(16,16,4,0,Math.PI*2); ctx.fill() }
      break
    default:
      if (drawSnowyMountainTile(ctx, type, tick)) break
      if (drawAncientRuinsTile(ctx, type, tick)) break
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, S, S)
  }
  ctx.restore()
}

function drawGrassTile(ctx: CanvasRenderingContext2D, tick: number) {
  // Base
  ctx.fillStyle = '#2d5a1b'
  ctx.fillRect(0, 0, S, S)
  // Variation patches
  ctx.fillStyle = '#357520'
  ctx.fillRect(2, 3, 8, 5); ctx.fillRect(18, 8, 7, 4)
  ctx.fillRect(10, 20, 9, 5); ctx.fillRect(25, 18, 6, 6)
  // Dark patches
  ctx.fillStyle = '#1e3e10'
  ctx.fillRect(5, 14, 5, 4); ctx.fillRect(22, 4, 4, 3)
  // Bright highlight
  ctx.fillStyle = '#4a9428'
  ctx.fillRect(1, 1, 3, 2); ctx.fillRect(15, 5, 3, 2)
  ctx.fillRect(27, 22, 3, 2); ctx.fillRect(8, 26, 3, 2)
  // Tiny details - grass blades
  ctx.fillStyle = '#5aaa30'
  for (let i = 0; i < 8; i++) {
    const bx = (i * 4 + 1) % 30
    const by = (i * 7 + 2) % 28
    ctx.fillRect(bx, by, 1, 2)
  }
}

function drawDirtTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#6b4c2a'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#7d5e38'
  ctx.fillRect(3, 4, 8, 4); ctx.fillRect(16, 12, 10, 5)
  ctx.fillRect(4, 22, 9, 5); ctx.fillRect(22, 2, 8, 4)
  ctx.fillStyle = '#5a3d1e'
  ctx.fillRect(6, 10, 5, 3); ctx.fillRect(20, 20, 6, 4)
  // Small stones
  ctx.fillStyle = '#8a8070'
  ctx.fillRect(12, 6, 2, 2); ctx.fillRect(26, 16, 3, 2)
  ctx.fillStyle = '#a09080'
  ctx.fillRect(13, 6, 1, 1)
}

function drawStoneTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#606060'
  ctx.fillRect(0, 0, S, S)
  // Stone blocks
  const blocks = [[0,0,15,11],[17,0,14,11],[0,13,10,11],[12,13,20,11],[0,25,32,6],[0,0,32,1],[0,11,32,1],[0,23,32,1],[0,31,32,1]]
  blocks.forEach(([bx,by,bw,bh]) => {
    ctx.fillStyle = '#707070'
    ctx.fillRect(bx+1, by+1, bw-1, bh-1)
    ctx.fillStyle = '#505050'
    ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by, 1, bh)
    ctx.fillStyle = '#808080'
    ctx.fillRect(bx+bw-1, by+1, 1, bh-1); ctx.fillRect(bx+1, by+bh-1, bw-1, 1)
  })
}

function drawWaterTile(ctx: CanvasRenderingContext2D, tick: number, deep: boolean) {
  const base = deep ? '#0a3060' : '#1a4a8a'
  const light = deep ? '#1040a0' : '#2060c0'
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)
  // Animated waves
  const wave = Math.sin(tick * 0.05) * 2
  ctx.fillStyle = light
  for (let r = 0; r < 4; r++) {
    const wy = (r * 8 + tick * 0.3 + wave) % 32
    ctx.fillRect(0, wy, 32, 2)
    ctx.fillRect(0, wy + 0.5, 32, 1)
  }
  // Sparkle
  ctx.fillStyle = deep ? '#3060c0' : '#60a0e0'
  const sx = ((tick * 2) % 30)
  const sy = ((tick * 1.3) % 28)
  ctx.fillRect(sx, sy, 2, 1)
  ctx.fillRect((sx+15)%30, (sy+10)%28, 2, 1)
  // Foam
  ctx.fillStyle = 'rgba(200,230,255,0.3)'
  ctx.fillRect(0, 0, 32, 1)
}

function drawSandTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#c8a050'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#d4ae60'
  ctx.fillRect(2, 3, 8, 5); ctx.fillRect(18, 8, 7, 4); ctx.fillRect(10, 20, 9, 5)
  ctx.fillStyle = '#b89040'
  ctx.fillRect(5, 14, 5, 4); ctx.fillRect(22, 4, 4, 3)
  // Ripples
  ctx.fillStyle = 'rgba(180,140,60,0.5)'
  ctx.fillRect(4, 8, 10, 1); ctx.fillRect(16, 20, 12, 1)
}

function drawLavaTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#3a0000'
  ctx.fillRect(0, 0, S, S)
  const lv = Math.sin(tick * 0.08) * 0.5 + 0.5
  ctx.fillStyle = `rgb(${180+Math.round(lv*60)},${Math.round(lv*60)},0)`
  for (let r = 0; r < 4; r++) {
    const wy = (r * 8 + tick * 0.5) % 32
    ctx.fillRect(0, wy, 32, 3)
  }
  ctx.fillStyle = '#ff8800'
  const bx = ((tick * 3) % 28)
  const by = ((tick * 2) % 28)
  ctx.fillRect(bx, by, 3, 2)
  ctx.fillRect((bx+14)%28, (by+8)%28, 2, 2)
  ctx.fillStyle = '#ffcc00'
  ctx.fillRect(bx+1, by, 1, 1)
}

function drawWallTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#3a3030'
  ctx.fillRect(0, 0, S, S)
  // Brick rows
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : 8
    for (let col = 0; col < 3; col++) {
      const bx = col * 11 + offset
      const by = row * 8
      ctx.fillStyle = '#4a3a38'
      ctx.fillRect(bx + 1, by + 1, 9, 6)
      ctx.fillStyle = '#2a2020'
      ctx.fillRect(bx, by, 10, 1); ctx.fillRect(bx, by, 1, 7)
      ctx.fillStyle = '#6a5555'
      ctx.fillRect(bx + 9, by + 1, 1, 6); ctx.fillRect(bx + 1, by + 6, 9, 1)
    }
  }
}

function drawDungeonFloor(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1e1a18'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#252220'
  ctx.fillRect(1, 1, 14, 14); ctx.fillRect(17, 1, 14, 14)
  ctx.fillRect(1, 17, 14, 14); ctx.fillRect(17, 17, 14, 14)
  ctx.fillStyle = '#1a1614'
  ctx.fillRect(0, 0, 32, 1); ctx.fillRect(0, 0, 1, 32)
  ctx.fillRect(16, 0, 1, 32); ctx.fillRect(0, 16, 32, 1)
}

function drawDungeonWall(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#151210'
  ctx.fillRect(0, 0, S, S)
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : 8
    for (let col = -1; col < 4; col++) {
      const bx = col * 11 + offset - 1
      const by = row * 8
      ctx.fillStyle = '#201c1a'
      ctx.fillRect(bx + 1, by + 1, 9, 6)
      ctx.fillStyle = '#100c0a'
      ctx.fillRect(bx, by, 11, 1); ctx.fillRect(bx, by, 1, 8)
    }
  }
}

function drawRoadTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#5a5048'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#6a6058'
  ctx.fillRect(0, 10, 32, 12)
  ctx.fillStyle = '#787060'
  ctx.fillRect(0, 12, 32, 8)
  ctx.fillStyle = '#4a4038'
  ctx.fillRect(0, 10, 32, 1); ctx.fillRect(0, 21, 32, 1)
}

function drawSnowTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#d0dce8'
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#e0ecf8'
  ctx.fillRect(2, 3, 8, 5); ctx.fillRect(18, 8, 7, 4)
  ctx.fillStyle = '#b8c8d8'
  ctx.fillRect(5, 14, 5, 4); ctx.fillRect(22, 4, 4, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillRect(1, 1, 3, 2); ctx.fillRect(15, 5, 3, 2)
}

function drawTree(ctx: CanvasRenderingContext2D) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(10, 26, 14, 4)
  // Trunk
  ctx.fillStyle = '#5a3a18'
  ctx.fillRect(13, 20, 6, 10)
  ctx.fillStyle = '#7a5028'
  ctx.fillRect(14, 20, 4, 10)
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(13, 20, 1, 10)
  // Foliage layers (bottom to top)
  ctx.fillStyle = '#1a4010'
  ctx.fillRect(4, 16, 24, 12)
  ctx.fillStyle = '#2a5a18'
  ctx.fillRect(6, 8, 20, 14)
  ctx.fillStyle = '#3a7020'
  ctx.fillRect(9, 2, 14, 12)
  // Highlights
  ctx.fillStyle = '#4a8828'
  ctx.fillRect(12, 4, 6, 5)
  ctx.fillRect(8, 10, 5, 4)
  // Dark edges
  ctx.fillStyle = '#0a2808'
  ctx.fillRect(4, 16, 1, 12); ctx.fillRect(27, 16, 1, 12)
  ctx.fillRect(6, 8, 1, 14); ctx.fillRect(25, 8, 1, 14)
}

function drawRock(ctx: CanvasRenderingContext2D) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(6, 26, 20, 4)
  // Main rock body
  ctx.fillStyle = '#606060'
  ctx.fillRect(4, 12, 24, 16)
  ctx.fillRect(8, 6, 16, 8)
  ctx.fillRect(10, 4, 12, 4)
  // Lighter top face
  ctx.fillStyle = '#808080'
  ctx.fillRect(9, 7, 14, 6)
  ctx.fillRect(11, 5, 10, 3)
  // Highlight
  ctx.fillStyle = '#a0a0a0'
  ctx.fillRect(12, 6, 4, 2)
  ctx.fillRect(10, 8, 3, 2)
  // Dark base
  ctx.fillStyle = '#404040'
  ctx.fillRect(4, 26, 24, 2)
  ctx.fillRect(4, 12, 1, 14); ctx.fillRect(27, 12, 1, 14)
  // Cracks
  ctx.fillStyle = '#303030'
  ctx.fillRect(14, 10, 1, 8)
  ctx.fillRect(18, 14, 1, 6)
}

function drawTallGrass(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#2d5a1b'
  ctx.fillRect(0, 0, S, S)
  const sway = Math.sin(tick * 0.04) * 1.5
  const blades = [4, 8, 12, 16, 20, 24, 28]
  blades.forEach((bx, i) => {
    const h = 14 + (i % 3) * 4
    const ox = sway * (i % 2 === 0 ? 1 : -1)
    ctx.fillStyle = '#4a8a28'
    ctx.fillRect(bx + ox, 32 - h, 2, h)
    ctx.fillStyle = '#5aaa30'
    ctx.fillRect(bx + ox, 32 - h, 1, h / 2)
    // Tip
    ctx.fillStyle = '#7acc40'
    ctx.fillRect(bx + ox, 32 - h, 2, 2)
  })
}

function drawFlowerTile(ctx: CanvasRenderingContext2D, tick: number) {
  drawGrassTile(ctx, tick)
  // Flowers
  const flowers = [[6, 10], [18, 6], [10, 22], [24, 18], [3, 26]]
  const colors = ['#ff6080', '#ffcc40', '#e060ff', '#40ccff', '#ff8040']
  flowers.forEach(([fx, fy], i) => {
    ctx.fillStyle = '#50a020'
    ctx.fillRect(fx + 1, fy + 2, 1, 4)
    ctx.fillStyle = colors[i]
    ctx.fillRect(fx, fy, 1, 1); ctx.fillRect(fx + 2, fy, 1, 1)
    ctx.fillRect(fx + 1, fy - 1, 1, 1); ctx.fillRect(fx + 1, fy + 1, 1, 1)
    ctx.fillStyle = '#ffff80'
    ctx.fillRect(fx + 1, fy, 1, 1)
  })
}

function drawBridgeTile(ctx: CanvasRenderingContext2D) {
  drawWaterTile(ctx, 0, false)
  ctx.fillStyle = '#8a6030'
  ctx.fillRect(2, 0, 4, 32); ctx.fillRect(14, 0, 4, 32); ctx.fillRect(26, 0, 4, 32)
  ctx.fillStyle = '#a07840'
  ctx.fillRect(3, 0, 2, 32); ctx.fillRect(15, 0, 2, 32); ctx.fillRect(27, 0, 2, 32)
  ctx.fillStyle = '#604820'
  ctx.fillRect(0, 6, 32, 3); ctx.fillRect(0, 14, 32, 3); ctx.fillRect(0, 22, 32, 3)
}

function drawPortalTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#0a0418'
  ctx.fillRect(0, 0, S, S)
  const a = tick * 0.06
  for (let r = 0; r < 4; r++) {
    const rad = 12 - r * 2.5
    const alpha = 0.3 + r * 0.15
    const hue = (200 + r * 30 + tick * 2) % 360
    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`
    const cx = 16 + Math.cos(a + r) * 2
    const cy = 16 + Math.sin(a + r) * 2
    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(180,120,255,0.9)'
  ctx.fillRect(15, 8, 2, 16)
  ctx.fillRect(8, 15, 16, 2)
}

// ─── City Tiles ──────────────────────────────────────────────────────────────

function drawCobblestoneTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#6a6258'
  ctx.fillRect(0, 0, S, S)
  // Irregular stones
  const stones = [
    [1, 1, 9, 7], [12, 1, 8, 8], [22, 2, 8, 6],
    [2, 10, 8, 8], [12, 11, 9, 7], [23, 10, 7, 8],
    [1, 20, 9, 10], [12, 20, 8, 9], [22, 19, 8, 10],
  ]
  for (const [sx, sy, sw, sh] of stones) {
    ctx.fillStyle = '#7d7468'
    ctx.fillRect(sx, sy, sw, sh)
    ctx.fillStyle = '#8c8378'
    ctx.fillRect(sx, sy, sw - 2, 2)
    ctx.fillStyle = '#5a5248'
    ctx.fillRect(sx, sy + sh - 1, sw, 1)
  }
}

function drawHouseWallTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#b89878'
  ctx.fillRect(0, 0, S, S)
  // Brick lines
  ctx.fillStyle = '#9a7a5a'
  for (let row = 0; row < 4; row++) {
    const oy = row * 8
    ctx.fillRect(0, oy + 7, S, 1)
    const offset = row % 2 === 0 ? 0 : 8
    for (let bx = offset; bx < S; bx += 16) ctx.fillRect(bx, oy, 1, 8)
  }
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(0, 0, S, 1)
}

function drawHouseRoofTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#8a3026'
  ctx.fillRect(0, 0, S, S)
  // Shingles
  for (let row = 0; row < 4; row++) {
    const oy = row * 8
    ctx.fillStyle = row % 2 === 0 ? '#9a3a2e' : '#7a2a20'
    for (let bx = (row % 2) * 8; bx < S; bx += 16) {
      ctx.fillRect(bx, oy, 14, 7)
      ctx.fillStyle = '#aa4a3a'
      ctx.fillRect(bx, oy, 14, 1)
      ctx.fillStyle = row % 2 === 0 ? '#9a3a2e' : '#7a2a20'
    }
  }
  ctx.fillStyle = '#5a1c14'
  for (let oy = 7; oy < S; oy += 8) ctx.fillRect(0, oy, S, 1)
}

function drawHouseDoorTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#b89878'
  ctx.fillRect(0, 0, S, S)
  // Door frame
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(6, 4, 20, 28)
  ctx.fillStyle = '#7a4a22'
  ctx.fillRect(8, 6, 16, 26)
  // Planks
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(13, 6, 1, 26); ctx.fillRect(18, 6, 1, 26)
  // Handle
  ctx.fillStyle = '#e0c040'
  ctx.fillRect(20, 18, 2, 2)
  // Arch top
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(8, 4, 16, 2)
}

function drawFountainTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#6a6258'
  ctx.fillRect(0, 0, S, S)
  // Stone basin
  ctx.fillStyle = '#9a9288'
  ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#7a7268'
  ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI * 2); ctx.stroke()
  // Water
  const wob = Math.sin(tick * 0.1) * 1
  ctx.fillStyle = '#2e6aae'
  ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#4a8ad0'
  ctx.beginPath(); ctx.arc(16, 16, 6 + wob, 0, Math.PI * 2); ctx.fill()
  // Center spout
  ctx.fillStyle = '#9a9288'
  ctx.fillRect(15, 12, 2, 8)
  // Droplets
  ctx.fillStyle = '#a0d0f0'
  const sp = (tick * 0.2) % 6
  ctx.fillRect(13 - sp * 0.5, 10 + sp, 1, 1)
  ctx.fillRect(19 + sp * 0.5, 10 + sp, 1, 1)
}

function drawLampPostTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#6a6258'
  ctx.fillRect(0, 0, S, S)
  // Post
  ctx.fillStyle = '#2a2620'
  ctx.fillRect(14, 8, 4, 22)
  ctx.fillStyle = '#3a352c'
  ctx.fillRect(14, 8, 1, 22)
  // Base
  ctx.fillStyle = '#1a1812'
  ctx.fillRect(11, 28, 10, 3)
  // Lantern
  const glow = 0.6 + Math.sin(tick * 0.15) * 0.2
  ctx.fillStyle = `rgba(255,200,80,${glow * 0.5})`
  ctx.beginPath(); ctx.arc(16, 7, 9, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2a2620'
  ctx.fillRect(11, 2, 10, 8)
  ctx.fillStyle = `rgba(255,210,110,${glow})`
  ctx.fillRect(13, 4, 6, 5)
  ctx.fillStyle = '#fff0c0'
  ctx.fillRect(14, 5, 2, 2)
}

function drawMarketStallTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#8a7048'
  ctx.fillRect(0, 0, S, S)
  // Counter
  ctx.fillStyle = '#6a4a28'
  ctx.fillRect(2, 18, 28, 12)
  ctx.fillStyle = '#7a5a34'
  ctx.fillRect(2, 18, 28, 2)
  // Striped awning
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c83830' : '#e8e0d0'
    ctx.fillRect(i * 6 + 1, 2, 6, 8)
  }
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(1, 10, 30, 2)
  // Posts
  ctx.fillStyle = '#4a3018'
  ctx.fillRect(2, 10, 2, 8); ctx.fillRect(28, 10, 2, 8)
  // Goods
  ctx.fillStyle = '#d04030'
  ctx.beginPath(); ctx.arc(8, 16, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#e0c040'
  ctx.beginPath(); ctx.arc(15, 16, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#40a050'
  ctx.beginPath(); ctx.arc(22, 16, 2, 0, Math.PI * 2); ctx.fill()
}

function drawFenceTile(ctx: CanvasRenderingContext2D) {
  // Grass base
  ctx.fillStyle = '#3a6a24'
  ctx.fillRect(0, 0, S, S)
  // Horizontal rails
  ctx.fillStyle = '#8a6038'
  ctx.fillRect(0, 12, S, 3)
  ctx.fillRect(0, 22, S, 3)
  // Posts
  ctx.fillStyle = '#6a4828'
  ctx.fillRect(4, 8, 4, 22)
  ctx.fillRect(24, 8, 4, 22)
  ctx.fillStyle = '#9a7048'
  ctx.fillRect(4, 8, 1, 22); ctx.fillRect(24, 8, 1, 22)
}

function drawGardenTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#3a6a24'
  ctx.fillRect(0, 0, S, S)
  // Tended soil patches
  ctx.fillStyle = '#5a4028'
  ctx.fillRect(4, 6, 10, 8); ctx.fillRect(18, 16, 10, 8)
  // Bushes
  ctx.fillStyle = '#2d5a1b'
  ctx.beginPath(); ctx.arc(9, 10, 5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(23, 20, 5, 0, Math.PI * 2); ctx.fill()
  // Flowers swaying
  const sway = Math.sin(tick * 0.1) * 1
  ctx.fillStyle = '#e060a0'
  ctx.fillRect(8 + sway, 7, 2, 2)
  ctx.fillStyle = '#f0d040'
  ctx.fillRect(22 + sway, 17, 2, 2)
  ctx.fillStyle = '#6090e0'
  ctx.fillRect(24 - sway, 22, 2, 2)
}

function drawChestTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#3a2a18'
  ctx.fillRect(0, 0, S, S)
  // Chest body
  ctx.fillStyle = '#7a4a22'
  ctx.fillRect(5, 14, 22, 14)
  ctx.fillStyle = '#8a5a2c'
  ctx.fillRect(5, 8, 22, 8)
  // Metal bands
  ctx.fillStyle = '#c0a040'
  ctx.fillRect(5, 15, 22, 2)
  ctx.fillRect(13, 8, 2, 20)
  ctx.fillRect(22, 8, 2, 20)
  // Lock
  ctx.fillStyle = '#e0c040'
  ctx.fillRect(14, 16, 4, 4)
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(15, 18, 2, 2)
}

// ─── Tundra Tiles ───────────────────────────────────────────────────────────────

function drawIceTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#6090c8'
  ctx.fillRect(0, 0, S, S)
  // Ice cracks
  ctx.fillStyle = '#80b0d8'
  ctx.fillRect(2, 5, 12, 2)
  ctx.fillRect(18, 15, 10, 2)
  ctx.fillRect(8, 22, 8, 2)
  // Highlight
  ctx.fillStyle = '#a0d0f0'
  ctx.fillRect(0, 0, 8, 2)
  ctx.fillRect(2, 2, 2, 6)
  // Shimmer effect
  const shimmer = Math.sin(tick * 0.1) * 0.3 + 0.7
  ctx.fillStyle = `rgba(200,240,255,${shimmer * 0.3})`
  ctx.fillRect(10, 8, 6, 4)
}

function drawFrozenTree(ctx: CanvasRenderingContext2D) {
  // Snow base
  ctx.fillStyle = '#d0dce8'
  ctx.fillRect(0, 0, S, S)
  // Trunk
  ctx.fillStyle = '#4a3830'
  ctx.fillRect(14, 20, 4, 10)
  // Frozen foliage
  ctx.fillStyle = '#a0c8d8'
  ctx.beginPath(); ctx.arc(16, 12, 10, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#b8d8e8'
  ctx.beginPath(); ctx.arc(12, 16, 6, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(20, 16, 6, 0, Math.PI * 2); ctx.fill()
  // Ice crystals
  ctx.fillStyle = '#e0f0ff'
  ctx.fillRect(10, 6, 2, 2)
  ctx.fillRect(20, 8, 2, 2)
  ctx.fillRect(14, 4, 2, 2)
}

function drawIceRock(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#7098b8'
  ctx.fillRect(0, 0, S, S)
  // Rock shape
  ctx.fillStyle = '#90b8d0'
  ctx.beginPath(); ctx.arc(10, 18, 8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(22, 16, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#6088a8'
  ctx.beginPath(); ctx.arc(16, 22, 7, 0, Math.PI * 2); ctx.fill()
  // Ice highlights
  ctx.fillStyle = '#c8e0f0'
  ctx.fillRect(8, 12, 3, 3)
  ctx.fillRect(20, 10, 2, 2)
}

function drawSnowRock(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#c8d4e0'
  ctx.fillRect(0, 0, S, S)
  // Rock covered in snow
  ctx.fillStyle = '#a0b8c8'
  ctx.beginPath(); ctx.arc(12, 16, 10, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(24, 20, 7, 0, Math.PI * 2); ctx.fill()
  // Snow patches on top
  ctx.fillStyle = '#e8f0f8'
  ctx.beginPath(); ctx.arc(12, 12, 6, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(24, 16, 4, 0, Math.PI * 2); ctx.fill()
}

// ─── Volcano Tiles ───────────────────────────────────────────────────────────────

function drawVolcanicRock(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#3a2820'
  ctx.fillRect(0, 0, S, S)
  // Rock formations
  ctx.fillStyle = '#4a3028'
  ctx.beginPath(); ctx.arc(10, 16, 9, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(24, 20, 7, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2a1810'
  ctx.beginPath(); ctx.arc(16, 22, 6, 0, Math.PI * 2); ctx.fill()
  // Magma veins
  ctx.fillStyle = '#6a2010'
  ctx.fillRect(6, 12, 4, 2)
  ctx.fillRect(18, 18, 3, 2)
  ctx.fillRect(12, 24, 2, 3)
}

function drawAshTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, S, S)
  // Ash patches
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(2, 3, 10, 6)
  ctx.fillRect(18, 12, 8, 5)
  ctx.fillRect(6, 20, 12, 4)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(14, 6, 6, 4)
  ctx.fillRect(4, 16, 8, 3)
  // Ash particles
  ctx.fillStyle = '#4a4a4a'
  for (let i = 0; i < 6; i++) {
    const ax = (i * 5 + 2) % 28
    const ay = (i * 7 + 4) % 26
    ctx.fillRect(ax, ay, 2, 2)
  }
}

function drawObsidianTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1a1a2a'
  ctx.fillRect(0, 0, S, S)
  // Obsidian shards
  ctx.fillStyle = '#2a2a3a'
  ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(14, 8); ctx.lineTo(10, 16); ctx.lineTo(4, 12); ctx.fill()
  ctx.beginPath(); ctx.moveTo(20, 6); ctx.lineTo(28, 12); ctx.lineTo(24, 20); ctx.lineTo(16, 14); ctx.fill()
  ctx.beginPath(); ctx.moveTo(12, 20); ctx.lineTo(20, 24); ctx.lineTo(14, 28); ctx.lineTo(6, 24); ctx.fill()
  // Glassy highlights
  ctx.fillStyle = '#3a3a4a'
  ctx.fillRect(9, 6, 2, 3)
  ctx.fillRect(22, 10, 2, 4)
}

function drawMagmaCrustTile(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#2a1810'
  ctx.fillRect(0, 0, S, S)
  // Cracked crust
  ctx.fillStyle = '#4a2818'
  ctx.fillRect(2, 2, 12, 10)
  ctx.fillRect(18, 6, 10, 12)
  ctx.fillRect(8, 18, 14, 10)
  // Glowing magma underneath
  const glow = Math.sin(tick * 0.08) * 0.4 + 0.6
  ctx.fillStyle = `rgba(200,80,20,${glow * 0.5})`
  ctx.fillRect(4, 4, 6, 6)
  ctx.fillRect(20, 8, 6, 8)
  ctx.fillRect(10, 20, 8, 6)
}

function drawVolcanicVent(ctx: CanvasRenderingContext2D, tick: number) {
  ctx.fillStyle = '#1a0800'
  ctx.fillRect(0, 0, S, S)
  // Vent opening
  ctx.fillStyle = '#3a1000'
  ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill()
  // Glowing magma
  const pulse = Math.sin(tick * 0.12) * 0.3 + 0.7
  ctx.fillStyle = `rgb(${200 + Math.round(pulse * 55)},${Math.round(pulse * 40)},0)`
  ctx.beginPath(); ctx.arc(16, 16, 6, 0, Math.PI * 2); ctx.fill()
  // Hot center
  ctx.fillStyle = '#ffcc00'
  ctx.beginPath(); ctx.arc(16, 16, 3, 0, Math.PI * 2); ctx.fill()
  // Smoke particles
  ctx.fillStyle = `rgba(80,80,80,${pulse * 0.4})`
  ctx.fillRect(12, 2, 3, 4)
  ctx.fillRect(18, 4, 2, 3)
  ctx.fillRect(14, 6, 2, 2)
}


// ─── Character Sprite Renderer ─────────────────────────────────────────────

export function drawCharacter(
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
  ctx.save()
  ctx.translate(x + 16 * scale, y + 16 * scale)
  if (direction === 'left') ctx.scale(-1, 1)
  ctx.translate(-16 * scale, -16 * scale)
  ctx.scale(scale, scale)

  // ── Skin system (Brawl Stars-like) ─────────────────────────────────────
  // 5 skins per class: same silhouette/pose, different cores + acessórios.
  const style = getSkinStyle(cls, skin)
  if (style.filter) {
    try { ctx.filter = style.filter } catch {}
  }
  // Aura/atrás do sprite (desenhada antes para ficar atrás)
  if (style.aura) drawSkinAura(ctx, style.aura, animFrame)

  switch (cls) {
    case 'knight': drawKnight(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'archer': drawArcher(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'mage':   drawMage(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'necromancer': drawNecromancer(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'paladin':   drawPaladin(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'berserker': drawBerserker(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'assassin':  drawAssassin(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'druid':     drawDruid(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'monk':      drawMonk(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'samurai':   drawSamurai(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'summoner':  drawSummoner(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'alchemist': drawAlchemist(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'chronomancer': drawChronomancer(ctx, direction, isMoving, isAttacking, animFrame); break
    case 'beastmaster':  drawBeastmaster(ctx, direction, isMoving, isAttacking, animFrame); break
  }

  // Limpar filtro antes de desenhar acessórios para que tenham cor própria
  if (style.filter) { try { ctx.filter = 'none' } catch {} }
  if (style.accessory) drawSkinAccessory(ctx, style.accessory, animFrame)
  ctx.restore()
}

// ── Skin presets ─────────────────────────────────────────────────────────
export const SKIN_COUNT = 5

type SkinAura = 'gold' | 'shadow' | 'fire' | 'ice' | 'nature' | 'arcane'
type SkinAccessory =
  | 'cape-red' | 'cape-blue' | 'cape-purple' | 'cape-gold'
  | 'halo' | 'crown' | 'horns' | 'mask' | 'mohawk'
  | 'pauldrons-gold' | 'pauldrons-bone' | 'leaf-crown'

interface SkinStyle {
  filter?: string
  aura?: SkinAura
  accessory?: SkinAccessory
}

// 5 skins per classe. skin 0 = base. As demais misturam hue + acessório.
const SKIN_PRESETS: Record<string, SkinStyle[]> = {
  knight: [
    {},
    { filter: 'hue-rotate(220deg) saturate(1.1)', accessory: 'cape-blue' },
    { filter: 'hue-rotate(0deg) saturate(0.4) brightness(0.85)', accessory: 'cape-purple', aura: 'shadow' },
    { filter: 'hue-rotate(40deg) saturate(1.6) brightness(1.15)', accessory: 'crown', aura: 'gold' },
    { filter: 'hue-rotate(120deg) saturate(1.3)', accessory: 'cape-red', aura: 'fire' },
  ],
  paladin: [
    {},
    { filter: 'hue-rotate(45deg) saturate(1.4) brightness(1.1)', accessory: 'halo', aura: 'gold' },
    { filter: 'hue-rotate(-30deg) saturate(0.7) brightness(0.9)', accessory: 'cape-purple', aura: 'shadow' },
    { filter: 'hue-rotate(180deg) saturate(1.2)', accessory: 'cape-blue', aura: 'ice' },
    { filter: 'hue-rotate(300deg) saturate(1.3)', accessory: 'pauldrons-gold', aura: 'arcane' },
  ],
  berserker: [
    {},
    { filter: 'hue-rotate(200deg) saturate(1.1)', accessory: 'mohawk', aura: 'ice' },
    { filter: 'hue-rotate(-20deg) saturate(1.5) brightness(1.1)', accessory: 'horns', aura: 'fire' },
    { filter: 'saturate(0.3) brightness(0.85)', accessory: 'pauldrons-bone', aura: 'shadow' },
    { filter: 'hue-rotate(80deg) saturate(1.3)', accessory: 'cape-gold', aura: 'nature' },
  ],
  samurai: [
    {},
    { filter: 'hue-rotate(90deg) saturate(1.2)', accessory: 'cape-gold' },
    { filter: 'hue-rotate(-90deg) saturate(0.8)', accessory: 'mask', aura: 'shadow' },
    { filter: 'hue-rotate(160deg) saturate(1.3)', accessory: 'cape-blue', aura: 'ice' },
    { filter: 'hue-rotate(20deg) saturate(1.4) brightness(1.1)', accessory: 'horns', aura: 'fire' },
  ],
  monk: [
    {},
    { filter: 'hue-rotate(180deg) saturate(1.1)', accessory: 'halo', aura: 'arcane' },
    { filter: 'hue-rotate(-60deg) saturate(1.4)', accessory: 'mask', aura: 'fire' },
    { filter: 'hue-rotate(120deg) saturate(1.2)', accessory: 'leaf-crown', aura: 'nature' },
    { filter: 'hue-rotate(40deg) saturate(1.5) brightness(1.1)', accessory: 'crown', aura: 'gold' },
  ],
  archer: [
    {},
    { filter: 'hue-rotate(300deg) saturate(1.2)', accessory: 'cape-purple' },
    { filter: 'hue-rotate(60deg) saturate(1.3) brightness(1.1)', accessory: 'leaf-crown', aura: 'nature' },
    { filter: 'saturate(0.3) brightness(0.85)', accessory: 'mask', aura: 'shadow' },
    { filter: 'hue-rotate(180deg) saturate(1.3)', accessory: 'cape-blue', aura: 'ice' },
  ],
  assassin: [
    {},
    { filter: 'hue-rotate(60deg) saturate(1.2)', accessory: 'mask', aura: 'arcane' },
    { filter: 'hue-rotate(-30deg) saturate(1.5)', accessory: 'cape-red', aura: 'fire' },
    { filter: 'hue-rotate(180deg) saturate(1.2) brightness(1.05)', accessory: 'cape-blue', aura: 'ice' },
    { filter: 'hue-rotate(140deg) saturate(0.8) brightness(0.9)', accessory: 'horns', aura: 'shadow' },
  ],
  mage: [
    {},
    { filter: 'hue-rotate(30deg) saturate(1.3)', accessory: 'crown', aura: 'gold' },
    { filter: 'hue-rotate(140deg) saturate(1.3)', accessory: 'leaf-crown', aura: 'nature' },
    { filter: 'hue-rotate(-80deg) saturate(0.7) brightness(0.85)', accessory: 'cape-purple', aura: 'shadow' },
    { filter: 'hue-rotate(200deg) saturate(1.4)', accessory: 'cape-blue', aura: 'ice' },
  ],
  druid: [
    {},
    { filter: 'hue-rotate(320deg) saturate(1.2)', accessory: 'leaf-crown', aura: 'arcane' },
    { filter: 'hue-rotate(40deg) saturate(1.4) brightness(1.1)', accessory: 'horns', aura: 'fire' },
    { filter: 'hue-rotate(180deg) saturate(1.1)', accessory: 'cape-blue', aura: 'ice' },
    { filter: 'saturate(0.4) brightness(0.85)', accessory: 'pauldrons-bone', aura: 'shadow' },
  ],
  necromancer: [
    {},
    { filter: 'hue-rotate(120deg) saturate(1.3)', accessory: 'leaf-crown', aura: 'nature' },
    { filter: 'hue-rotate(-20deg) saturate(1.5) brightness(1.1)', accessory: 'crown', aura: 'fire' },
    { filter: 'hue-rotate(60deg) saturate(1.3) brightness(1.1)', accessory: 'pauldrons-gold', aura: 'gold' },
    { filter: 'hue-rotate(200deg) saturate(1.2)', accessory: 'horns', aura: 'ice' },
  ],
  summoner: [
    {},
    { filter: 'hue-rotate(220deg) saturate(1.3)', accessory: 'cape-purple', aura: 'arcane' },
    { filter: 'hue-rotate(40deg) saturate(1.4) brightness(1.1)', accessory: 'halo', aura: 'gold' },
    { filter: 'hue-rotate(-60deg) saturate(0.8) brightness(0.9)', accessory: 'mask', aura: 'shadow' },
    { filter: 'hue-rotate(120deg) saturate(1.3)', accessory: 'leaf-crown', aura: 'nature' },
  ],
  alchemist: [
    {},
    { filter: 'hue-rotate(80deg) saturate(1.4)', accessory: 'leaf-crown', aura: 'nature' },
    { filter: 'hue-rotate(-30deg) saturate(1.5) brightness(1.1)', accessory: 'crown', aura: 'fire' },
    { filter: 'hue-rotate(180deg) saturate(1.2)', accessory: 'cape-blue', aura: 'ice' },
    { filter: 'hue-rotate(280deg) saturate(1.3)', accessory: 'mask', aura: 'arcane' },
  ],
  chronomancer: [
    {},
    { filter: 'hue-rotate(200deg) saturate(1.4)', accessory: 'crown', aura: 'arcane' },
    { filter: 'hue-rotate(40deg) saturate(1.3) brightness(1.1)', accessory: 'halo', aura: 'gold' },
    { filter: 'hue-rotate(-60deg) saturate(0.7) brightness(0.85)', accessory: 'cape-purple', aura: 'shadow' },
    { filter: 'hue-rotate(120deg) saturate(1.5)', accessory: 'cape-blue', aura: 'ice' },
  ],
  beastmaster: [
    {},
    { filter: 'hue-rotate(60deg) saturate(1.3)', accessory: 'leaf-crown', aura: 'nature' },
    { filter: 'hue-rotate(-30deg) saturate(1.5) brightness(1.1)', accessory: 'horns', aura: 'fire' },
    { filter: 'hue-rotate(180deg) saturate(1.2)', accessory: 'cape-blue', aura: 'ice' },
    { filter: 'saturate(0.4) brightness(0.85)', accessory: 'pauldrons-bone', aura: 'shadow' },
  ],
}

export function getSkinStyle(cls: CharacterClass, skin: number): SkinStyle {
  const list = SKIN_PRESETS[cls] ?? [{}]
  return list[Math.max(0, Math.min(list.length - 1, skin))] ?? {}
}

export const SKIN_NAMES: Record<CharacterClass, string[]> = {
  knight:      ['Guarda Real', 'Cruzado Azul', 'Cavaleiro Sombrio', 'Rei Dourado', 'Cavaleiro de Fogo'],
  paladin:     ['Templário', 'Justiceiro Dourado', 'Penitente Sombrio', 'Cruzado de Gelo', 'Arconte Arcano'],
  berserker:   ['Bárbaro do Norte', 'Viking de Gelo', 'Lorde da Carnificina', 'Caçador de Ossos', 'Druida Selvagem'],
  samurai:     ['Samurai Imperial', 'Ronin Dourado', 'Shinobi Sombrio', 'Lâmina de Gelo', 'Demônio Oni'],
  monk:        ['Monge da Montanha', 'Discípulo do Dragão', 'Mestre do Fogo', 'Eremita da Floresta', 'Sábio Iluminado'],
  archer:      ['Caçador da Mata', 'Patrulheiro Real', 'Elfo da Floresta', 'Espreitador Sombrio', 'Arqueiro Polar'],
  assassin:    ['Ladrão da Sombra', 'Espião Arcano', 'Lâmina Sangrenta', 'Assassino de Gelo', 'Demônio Noturno'],
  mage:        ['Arcanista', 'Mago do Sol', 'Druida Místico', 'Necromante Iniciado', 'Mago do Gelo'],
  druid:       ['Guardião do Bosque', 'Xamã Ancestral', 'Druida do Fogo', 'Druida do Gelo', 'Druida Sombrio'],
  necromancer: ['Lich Iniciado', 'Necro-Druida', 'Senhor das Chamas', 'Profeta Dourado', 'Lich do Gelo'],
  summoner:    ['Conjurador Arcano', 'Místico Sombrio', 'Oráculo Dourado', 'Eremita Espiritual', 'Druida Espectral'],
  alchemist:   ['Alquimista do Jade', 'Boticário da Natureza', 'Pirotécnico', 'Sábio do Gelo', 'Bruxo das Misturas'],
}

// ── Acessórios de skin ──────────────────────────────────────────────────
function drawSkinAura(ctx: CanvasRenderingContext2D, kind: SkinAura, frame: number) {
  const pulse = 0.5 + Math.sin(frame * 0.15) * 0.15
  const colors: Record<SkinAura, string> = {
    gold:   `rgba(255,210,80,${0.35 * pulse})`,
    shadow: `rgba(80,0,120,${0.45 * pulse})`,
    fire:   `rgba(255,90,30,${0.4 * pulse})`,
    ice:    `rgba(120,200,255,${0.4 * pulse})`,
    nature: `rgba(80,220,120,${0.35 * pulse})`,
    arcane: `rgba(180,120,255,${0.4 * pulse})`,
  }
  ctx.save()
  const g = ctx.createRadialGradient(16, 18, 4, 16, 18, 18)
  g.addColorStop(0, colors[kind])
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(-4, -4, 40, 40)
  ctx.restore()
}

function drawSkinAccessory(ctx: CanvasRenderingContext2D, kind: SkinAccessory, frame: number) {
  ctx.save()
  switch (kind) {
    case 'cape-red':    drawCape(ctx, '#a01818', '#600808'); break
    case 'cape-blue':   drawCape(ctx, '#2050b0', '#102060'); break
    case 'cape-purple': drawCape(ctx, '#601890', '#300848'); break
    case 'cape-gold':   drawCape(ctx, '#d8a020', '#7a5808'); break
    case 'halo': {
      ctx.strokeStyle = '#ffe070'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.ellipse(16, 3, 7, 2.2, 0, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(255,230,120,0.35)'
      ctx.beginPath(); ctx.ellipse(16, 3, 7, 2.2, 0, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'crown': {
      ctx.fillStyle = '#f0c040'
      ctx.fillRect(11, 3, 10, 2)
      ctx.fillRect(11, 1, 1, 2)
      ctx.fillRect(15, 0, 2, 3)
      ctx.fillRect(20, 1, 1, 2)
      ctx.fillStyle = '#ff3030'; ctx.fillRect(15, 1, 2, 1)
      break
    }
    case 'horns': {
      ctx.fillStyle = '#3a2010'
      ctx.beginPath(); ctx.moveTo(11, 5); ctx.lineTo(8, 1); ctx.lineTo(12, 3); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(21, 5); ctx.lineTo(24, 1); ctx.lineTo(20, 3); ctx.closePath(); ctx.fill()
      break
    }
    case 'mask': {
      ctx.fillStyle = 'rgba(15,15,20,0.85)'
      ctx.fillRect(10, 8, 12, 3)
      ctx.fillStyle = '#e02040'
      ctx.fillRect(12, 9, 2, 1); ctx.fillRect(18, 9, 2, 1)
      break
    }
    case 'mohawk': {
      ctx.fillStyle = '#e03030'
      ctx.fillRect(15, 0, 2, 5)
      ctx.fillRect(14, 1, 1, 3); ctx.fillRect(17, 1, 1, 3)
      break
    }
    case 'pauldrons-gold': {
      ctx.fillStyle = '#d8a020'
      ctx.fillRect(7, 13, 4, 3); ctx.fillRect(21, 13, 4, 3)
      ctx.fillStyle = '#7a5808'
      ctx.fillRect(7, 15, 4, 1); ctx.fillRect(21, 15, 4, 1)
      break
    }
    case 'pauldrons-bone': {
      ctx.fillStyle = '#e8e0c8'
      ctx.fillRect(7, 13, 4, 3); ctx.fillRect(21, 13, 4, 3)
      ctx.fillStyle = '#3a2010'
      ctx.fillRect(8, 14, 1, 1); ctx.fillRect(22, 14, 1, 1)
      break
    }
    case 'leaf-crown': {
      ctx.fillStyle = '#3aa84a'
      ctx.fillRect(10, 4, 2, 1); ctx.fillRect(13, 3, 2, 1)
      ctx.fillRect(17, 3, 2, 1); ctx.fillRect(20, 4, 2, 1)
      ctx.fillStyle = '#206030'
      ctx.fillRect(10, 5, 12, 1)
      break
    }
  }
  ctx.restore()
}

function drawCape(ctx: CanvasRenderingContext2D, color: string, shadow: string) {
  // Capa atrás dos ombros (vista de cima/costas levemente visível)
  ctx.fillStyle = shadow
  ctx.fillRect(10, 14, 12, 14)
  ctx.fillStyle = color
  ctx.fillRect(11, 14, 10, 12)
  ctx.fillRect(12, 26, 8, 2)
  // borda dourada/clara
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(11, 14, 10, 1)
}

function drawKnight(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const attackOffset = isAttacking ? Math.sin(frame * 0.8) * 4 : 0
  const oy = bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Boots
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(10, 24 + oy, 5, 6)
  ctx.fillRect(17, 24 + oy, 5, 6)
  ctx.fillStyle = '#3a2a1a'
  ctx.fillRect(10, 24 + oy, 5, 2)
  ctx.fillRect(17, 24 + oy, 5, 2)
  // Boot shine
  ctx.fillStyle = '#5a4030'
  ctx.fillRect(11, 24 + oy, 2, 1)

  // Legs (chainmail)
  ctx.fillStyle = '#708090'
  ctx.fillRect(11, 18 + oy, 4, 7)
  ctx.fillRect(17, 18 + oy, 4, 7)
  // Chainmail detail
  ctx.fillStyle = '#607080'
  for (let r = 0; r < 3; r++) {
    ctx.fillRect(11, 19 + r * 2 + oy, 4, 1)
    ctx.fillRect(17, 19 + r * 2 + oy, 4, 1)
  }

  // Plate chest armor
  ctx.fillStyle = '#c0c8d8'
  ctx.fillRect(9, 11 + oy, 14, 9)
  // Chest highlight
  ctx.fillStyle = '#e0e8f8'
  ctx.fillRect(11, 12 + oy, 4, 6)
  // Chest shadow
  ctx.fillStyle = '#9098a8'
  ctx.fillRect(9, 11 + oy, 1, 9)
  ctx.fillRect(22, 11 + oy, 1, 9)
  // Belt
  ctx.fillStyle = '#4a3020'
  ctx.fillRect(9, 19 + oy, 14, 2)
  ctx.fillStyle = '#c09020'
  ctx.fillRect(14, 19 + oy, 4, 2)
  // Gold trim
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(9, 11 + oy, 14, 1)
  ctx.fillRect(9, 18 + oy, 14, 1)

  // Pauldrons (shoulder plates)
  ctx.fillStyle = '#a8b0c0'
  ctx.fillRect(6, 11 + oy, 5, 4)
  ctx.fillRect(21, 11 + oy, 5, 4)
  ctx.fillStyle = '#c8d0e0'
  ctx.fillRect(7, 11 + oy, 3, 2)
  ctx.fillRect(22, 11 + oy, 3, 2)

  // Arms
  ctx.fillStyle = '#c0c8d8'
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillRect(6, 12 + oy + armSwing, 4, 6)
  ctx.fillRect(22, 12 + oy - armSwing, 4, 6)
  // Gauntlets
  ctx.fillStyle = '#9098a8'
  ctx.fillRect(6, 17 + oy + armSwing, 4, 3)
  ctx.fillRect(22, 17 + oy - armSwing, 4, 3)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 8 + oy, 4, 4)

  // Helmet
  ctx.fillStyle = '#b0b8c8'
  ctx.fillRect(9, 3 + oy, 14, 9)
  // Helmet highlight
  ctx.fillStyle = '#d0d8e8'
  ctx.fillRect(11, 4 + oy, 5, 4)
  // Helmet shadow
  ctx.fillStyle = '#8090a0'
  ctx.fillRect(9, 3 + oy, 1, 9)
  ctx.fillRect(22, 3 + oy, 1, 9)
  // Visor
  ctx.fillStyle = '#2a3040'
  ctx.fillRect(10, 7 + oy, 12, 4)
  // Visor slit
  ctx.fillStyle = '#405060'
  ctx.fillRect(11, 8 + oy, 4, 1)
  ctx.fillRect(17, 8 + oy, 4, 1)
  // Plume
  ctx.fillStyle = '#cc2020'
  ctx.fillRect(14, 1 + oy, 4, 4)
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(15, 0 + oy, 2, 4)
  // Gold crest
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(9, 3 + oy, 14, 1)
  ctx.fillRect(9, 11 + oy, 14, 1)

  // Sword (with attack animation)
  if (direction !== 'up') {
    ctx.fillStyle = '#808898'
    ctx.fillRect(24 + attackOffset, 12 + oy, 2, 14)
    ctx.fillStyle = '#a0a8b8'
    ctx.fillRect(24 + attackOffset, 12 + oy, 2, 10)
    // Crossguard
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(21 + attackOffset, 15 + oy, 8, 2)
    // Pommel
    ctx.fillStyle = '#c09020'
    ctx.fillRect(24 + attackOffset, 25 + oy, 2, 2)
    // Blade shine
    ctx.fillStyle = '#d0d8e8'
    ctx.fillRect(25 + attackOffset, 12 + oy, 1, 8)
  }

  // Shield (left side)
  if (direction !== 'up') {
    ctx.fillStyle = '#cc2020'
    ctx.fillRect(4, 12 + oy, 4, 9)
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(4, 14 + oy, 4, 2)
    ctx.fillStyle = '#aa1010'
    ctx.fillRect(4, 12 + oy, 1, 9)
    ctx.fillStyle = '#e04040'
    ctx.fillRect(5, 13 + oy, 2, 3)
  }
}

function drawArcher(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const drawPull = isAttacking ? Math.min(frame * 2, 10) : 0
  const oy = bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Boots (leather)
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(10, 24 + oy, 5, 6)
  ctx.fillRect(17, 24 + oy, 5, 6)
  ctx.fillStyle = '#5a3828'
  ctx.fillRect(10, 24 + oy, 5, 2)
  ctx.fillRect(17, 24 + oy, 5, 2)
  ctx.fillStyle = '#c09020'
  ctx.fillRect(10, 25 + oy, 5, 1)
  ctx.fillRect(17, 25 + oy, 5, 1)

  // Legs
  ctx.fillStyle = '#4a5a30'
  ctx.fillRect(11, 18 + oy, 4, 7)
  ctx.fillRect(17, 18 + oy, 4, 7)
  // Lace detail
  ctx.fillStyle = '#3a4a20'
  ctx.fillRect(12, 20 + oy, 2, 1); ctx.fillRect(18, 20 + oy, 2, 1)

  // Leather chest
  ctx.fillStyle = '#6a4820'
  ctx.fillRect(9, 11 + oy, 14, 9)
  ctx.fillStyle = '#8a6030'
  ctx.fillRect(11, 12 + oy, 5, 6)
  ctx.fillStyle = '#4a3018'
  ctx.fillRect(9, 11 + oy, 1, 9); ctx.fillRect(22, 11 + oy, 1, 9)
  // Quiver straps
  ctx.fillStyle = '#3a2810'
  ctx.fillRect(19, 10 + oy, 2, 10)
  // Belt
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(9, 19 + oy, 14, 2)
  ctx.fillStyle = '#c09020'
  ctx.fillRect(14, 19 + oy, 4, 2)

  // Quiver (on back)
  ctx.fillStyle = '#4a3018'
  ctx.fillRect(20, 9 + oy, 4, 12)
  ctx.fillStyle = '#6a5028'
  ctx.fillRect(21, 9 + oy, 2, 12)
  // Arrows in quiver
  ctx.fillStyle = '#80a030'
  ctx.fillRect(21, 8 + oy, 1, 5)
  ctx.fillStyle = '#c06020'
  ctx.fillRect(23, 7 + oy, 1, 6)
  ctx.fillStyle = '#e08040'
  ctx.fillRect(22, 6 + oy, 1, 7)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 8 + oy, 4, 4)

  // Arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#6a4820'
  ctx.fillRect(6, 12 + oy + armSwing, 4, 8)
  ctx.fillRect(22, 12 + oy - armSwing, 4, 8)
  // Bracers
  ctx.fillStyle = '#8a6030'
  ctx.fillRect(6, 16 + oy + armSwing, 4, 3)
  ctx.fillRect(22, 16 + oy - armSwing, 4, 3)

  // Hood
  ctx.fillStyle = '#3a4a20'
  ctx.fillRect(9, 3 + oy, 14, 9)
  ctx.fillStyle = '#4a5a28'
  ctx.fillRect(11, 4 + oy, 5, 5)
  ctx.fillStyle = '#2a3a18'
  ctx.fillRect(9, 3 + oy, 1, 9); ctx.fillRect(22, 3 + oy, 1, 9)
  // Face/skin
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(11, 6 + oy, 10, 7)
  ctx.fillStyle = '#b89878'
  ctx.fillRect(11, 11 + oy, 10, 2)
  // Eyes
  ctx.fillStyle = '#202020'
  ctx.fillRect(12, 7 + oy, 2, 2)
  ctx.fillRect(18, 7 + oy, 2, 2)
  // Eye shine
  ctx.fillStyle = '#6090d0'
  ctx.fillRect(12, 7 + oy, 1, 1)
  ctx.fillRect(18, 7 + oy, 1, 1)
  // Hood brim
  ctx.fillStyle = '#2a3a18'
  ctx.fillRect(9, 3 + oy, 14, 2)
  ctx.fillStyle = '#506028'
  ctx.fillRect(10, 3 + oy, 12, 1)

  // Bow (with draw animation)
  ctx.fillStyle = '#8a6030'
  ctx.fillRect(4, 6 + oy, 2, 20)
  ctx.fillStyle = '#a08040'
  ctx.fillRect(4, 6 + oy, 1, 20)
  // String
  ctx.strokeStyle = '#d4c080'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(5, 7 + oy)
  ctx.quadraticCurveTo(5 - drawPull, 16 + oy, 5, 25 + oy)
  ctx.stroke()

  // Arrow on bow
  if (isAttacking) {
    ctx.fillStyle = '#8a6030'
    ctx.fillRect(5 - drawPull, 15 + oy, 12, 1)
    ctx.fillStyle = '#c06020'
    ctx.fillRect(5 - drawPull, 14 + oy, 3, 3)
    ctx.fillStyle = '#a0c040'
    ctx.fillRect(15, 14 + oy, 2, 3)
  }
}

function drawMage(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const spellGlow = isAttacking ? Math.sin(frame * 0.3) * 0.5 + 0.5 : 0
  const oy = bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Spell glow effect
  if (isAttacking && spellGlow > 0.3) {
    ctx.fillStyle = `rgba(80,100,255,${spellGlow * 0.2})`
    ctx.beginPath(); ctx.ellipse(16, 16, 14, 14, 0, 0, Math.PI * 2); ctx.fill()
  }

  // Robe bottom
  ctx.fillStyle = '#1a0a3a'
  ctx.fillRect(8, 18 + oy, 16, 12)
  ctx.fillStyle = '#2a1a5a'
  ctx.fillRect(10, 19 + oy, 5, 10)
  // Robe star trim
  ctx.fillStyle = '#6040c0'
  ctx.fillRect(8, 18 + oy, 1, 12); ctx.fillRect(23, 18 + oy, 1, 12)
  ctx.fillStyle = '#8060e0'
  ctx.fillRect(9, 18 + oy, 14, 1)

  // Main robe body
  ctx.fillStyle = '#250d50'
  ctx.fillRect(9, 10 + oy, 14, 10)
  ctx.fillStyle = '#351570'
  ctx.fillRect(11, 11 + oy, 5, 8)
  ctx.fillStyle = '#180838'
  ctx.fillRect(9, 10 + oy, 1, 10); ctx.fillRect(22, 10 + oy, 1, 10)
  // Gold trim
  ctx.fillStyle = '#c09020'
  ctx.fillRect(9, 10 + oy, 14, 1)
  ctx.fillRect(9, 18 + oy, 14, 1)
  // Rune on chest
  ctx.fillStyle = '#8060e0'
  ctx.fillRect(14, 13 + oy, 4, 4)
  ctx.fillStyle = '#a080ff'
  ctx.fillRect(15, 14 + oy, 2, 2)
  ctx.fillStyle = '#c0a0ff'
  ctx.fillRect(15, 14 + oy, 1, 1)

  // Arms (flowing sleeves)
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#250d50'
  ctx.fillRect(5, 11 + oy + armSwing, 5, 9)
  ctx.fillRect(22, 11 + oy - armSwing, 5, 9)
  ctx.fillStyle = '#6040c0'
  ctx.fillRect(5, 18 + oy + armSwing, 5, 2)
  ctx.fillRect(22, 18 + oy - armSwing, 5, 2)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 7 + oy, 4, 4)

  // Hat
  ctx.fillStyle = '#200c48'
  ctx.fillRect(8, 3 + oy, 16, 8)
  ctx.fillStyle = '#300f60'
  ctx.fillRect(10, 4 + oy, 8, 6)
  ctx.fillStyle = '#180838'
  ctx.fillRect(8, 3 + oy, 1, 8); ctx.fillRect(23, 3 + oy, 1, 8)
  // Hat tip
  ctx.fillStyle = '#250d50'
  ctx.fillRect(12, 0 + oy, 8, 4)
  ctx.fillRect(14, -2 + oy, 6, 3)
  ctx.fillRect(15, -3 + oy, 4, 2)
  // Hat brim
  ctx.fillStyle = '#c09020'
  ctx.fillRect(6, 10 + oy, 20, 2)
  // Hat star decoration
  ctx.fillStyle = '#f0e070'
  ctx.fillRect(15, 4 + oy, 2, 1); ctx.fillRect(14, 5 + oy, 4, 1)
  ctx.fillRect(15, 6 + oy, 2, 1)

  // Face
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(10, 7 + oy, 12, 5)
  ctx.fillStyle = '#b89878'
  ctx.fillRect(10, 10 + oy, 12, 2)
  // Eyes (glowing)
  ctx.fillStyle = '#4060e0'
  ctx.fillRect(11, 7 + oy, 3, 2)
  ctx.fillRect(18, 7 + oy, 3, 2)
  ctx.fillStyle = '#80a0ff'
  ctx.fillRect(11, 7 + oy, 2, 1)
  ctx.fillRect(18, 7 + oy, 2, 1)
  // Beard
  ctx.fillStyle = '#9898b8'
  ctx.fillRect(11, 10 + oy, 10, 3)
  ctx.fillRect(12, 12 + oy, 8, 2)

  // Staff
  ctx.fillStyle = '#5a3a10'
  ctx.fillRect(26, 4 + oy, 2, 26)
  ctx.fillStyle = '#8a6030'
  ctx.fillRect(26, 4 + oy, 1, 26)
  // Staff orb
  const orbGlow = isAttacking ? spellGlow : 0.3
  ctx.fillStyle = `rgba(60,100,220,${orbGlow * 0.5 + 0.4})`
  ctx.beginPath(); ctx.arc(27, 4 + oy, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = `rgba(140,180,255,${orbGlow * 0.8 + 0.2})`
  ctx.beginPath(); ctx.arc(27, 4 + oy, 3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#e0f0ff'
  ctx.beginPath(); ctx.arc(26, 3 + oy, 1.5, 0, Math.PI * 2); ctx.fill()
  // Staff binding
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(25, 8 + oy, 4, 2)
  ctx.fillRect(25, 14 + oy, 4, 1)
}

function drawNecromancer(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const spellGlow = isAttacking ? Math.sin(frame * 0.3) * 0.5 + 0.5 : 0
  const oy = bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Necrotic aura
  const aura = 0.25 + Math.sin(frame * 0.12) * 0.1 + spellGlow * 0.3
  ctx.fillStyle = `rgba(120,40,180,${aura * 0.4})`
  ctx.beginPath(); ctx.ellipse(16, 18, 15, 16, 0, 0, Math.PI * 2); ctx.fill()

  // Robe bottom (dark green-black, tattered)
  ctx.fillStyle = '#0c1810'
  ctx.fillRect(8, 18 + oy, 16, 12)
  ctx.fillStyle = '#16281c'
  ctx.fillRect(10, 19 + oy, 6, 10)
  // Tattered hem
  ctx.fillStyle = '#0a140e'
  ctx.fillRect(8, 28 + oy, 3, 2); ctx.fillRect(13, 29 + oy, 3, 1); ctx.fillRect(20, 28 + oy, 3, 2)
  // Sickly green trim
  ctx.fillStyle = '#3aa05a'
  ctx.fillRect(8, 18 + oy, 16, 1)

  // Main robe body
  ctx.fillStyle = '#101e16'
  ctx.fillRect(9, 10 + oy, 14, 10)
  ctx.fillStyle = '#1a3024'
  ctx.fillRect(11, 11 + oy, 5, 8)
  ctx.fillStyle = '#070d0a'
  ctx.fillRect(9, 10 + oy, 1, 10); ctx.fillRect(22, 10 + oy, 1, 10)
  // Bone clasp on chest
  ctx.fillStyle = '#cfc9b0'
  ctx.fillRect(14, 12 + oy, 4, 2)
  ctx.fillStyle = '#9b40c0'
  ctx.fillRect(15, 14 + oy, 2, 3)
  ctx.fillStyle = `rgba(180,90,230,${0.5 + spellGlow * 0.5})`
  ctx.fillRect(15, 14 + oy, 2, 1)

  // Sleeves
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#101e16'
  ctx.fillRect(5, 11 + oy + armSwing, 5, 9)
  ctx.fillRect(22, 11 + oy - armSwing, 5, 9)
  ctx.fillStyle = '#070d0a'
  ctx.fillRect(5, 18 + oy + armSwing, 5, 2)
  ctx.fillRect(22, 18 + oy - armSwing, 5, 2)

  // Hood
  ctx.fillStyle = '#0c1810'
  ctx.fillRect(8, 2 + oy, 16, 12)
  ctx.fillStyle = '#16281c'
  ctx.fillRect(9, 3 + oy, 14, 4)
  ctx.fillStyle = '#070d0a'
  ctx.fillRect(8, 2 + oy, 1, 12); ctx.fillRect(23, 2 + oy, 1, 12)
  // Hood point
  ctx.fillStyle = '#0c1810'
  ctx.fillRect(12, -2 + oy, 8, 4)
  ctx.fillRect(14, -4 + oy, 5, 3)

  // Face shadow (void inside hood)
  ctx.fillStyle = '#04080a'
  ctx.fillRect(11, 7 + oy, 10, 6)
  // Glowing eyes
  const eyeGlow = 0.7 + Math.sin(frame * 0.2) * 0.3
  ctx.fillStyle = `rgba(150,60,220,${eyeGlow})`
  ctx.fillRect(12, 9 + oy, 3, 2)
  ctx.fillRect(17, 9 + oy, 3, 2)
  ctx.fillStyle = `rgba(210,140,255,${eyeGlow})`
  ctx.fillRect(13, 9 + oy, 1, 1)
  ctx.fillRect(18, 9 + oy, 1, 1)

  // Bone staff with skull
  ctx.fillStyle = '#d8d2bc'
  ctx.fillRect(26, 6 + oy, 2, 24)
  ctx.fillStyle = '#b8b2a0'
  ctx.fillRect(27, 6 + oy, 1, 24)
  // Skull on top
  ctx.fillStyle = '#e8e2d0'
  ctx.fillRect(24, 1 + oy, 6, 6)
  ctx.fillStyle = '#2a0a3a'
  ctx.fillRect(25, 3 + oy, 2, 2); ctx.fillRect(27, 3 + oy, 2, 2)
  // Skull glow
  const skullGlow = isAttacking ? spellGlow : 0.3 + Math.sin(frame * 0.15) * 0.15
  ctx.fillStyle = `rgba(150,60,220,${skullGlow * 0.6})`
  ctx.beginPath(); ctx.arc(27, 3 + oy, 6, 0, Math.PI * 2); ctx.fill()
}

// ─── Minion Sprites ──────────────────────────────────────────────────────────

export function drawMinion(
  ctx: CanvasRenderingContext2D,
  type: MinionType,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
  x: number,
  y: number,
  scale: number = 0.85,
) {
  ctx.save()
  ctx.translate(x + 16 * scale, y + 16 * scale)
  if (direction === 'left') ctx.scale(-1, 1)
  ctx.translate(-16 * scale, -16 * scale)
  ctx.scale(scale, scale)

  // Summon glow under every minion
  ctx.fillStyle = 'rgba(120,255,140,0.18)'
  ctx.beginPath(); ctx.ellipse(16, 28, 11, 4, 0, 0, Math.PI * 2); ctx.fill()

  switch (type) {
    case 'skeleton_minion': drawSkeletonMinion(ctx, isMoving, frame); break
    case 'zombie_minion':   drawZombieMinion(ctx, isMoving, frame); break
    case 'wraith_minion':   drawWraithMinion(ctx, frame); break
  }
  ctx.restore()
}

function drawSkeletonMinion(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 1.5 : 0
  const lSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  // Legs
  ctx.fillStyle = '#c8e0c0'
  ctx.fillRect(12, 22 + bob + lSwing, 3, 7)
  ctx.fillRect(17, 22 + bob - lSwing, 3, 7)
  // Ribs
  ctx.fillStyle = '#d8efd0'
  ctx.fillRect(11, 14 + bob, 10, 8)
  ctx.fillStyle = '#1a2418'
  for (let r = 0; r < 3; r++) ctx.fillRect(12, 15 + r * 2.5 + bob, 8, 1)
  // Arms with sword
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#c8e0c0'
  ctx.fillRect(7, 15 + bob + armSwing, 3, 7)
  ctx.fillRect(22, 15 + bob - armSwing, 3, 7)
  // Skull
  ctx.fillStyle = '#e0f5d8'
  ctx.fillRect(10, 6 + bob, 12, 10)
  ctx.fillStyle = '#16201a'
  ctx.fillRect(11, 9 + bob, 3, 3); ctx.fillRect(18, 9 + bob, 3, 3)
  ctx.fillStyle = '#80ff90'
  ctx.fillRect(12, 10 + bob, 1, 1); ctx.fillRect(19, 10 + bob, 1, 1)
  ctx.fillStyle = '#e0f5d8'
  for (let t = 0; t < 3; t++) ctx.fillRect(12 + t * 3, 14 + bob, 2, 2)
  // Sword
  ctx.fillStyle = '#9aa090'
  ctx.fillRect(25, 9 + bob, 2, 12)
  ctx.fillStyle = '#c8c4b0'
  ctx.fillRect(23, 11 + bob, 6, 2)
}

function drawZombieMinion(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.3) * 1.5 : 0
  const lSwing = isMoving ? Math.sin(frame * 0.3) * 2 : 0
  // Legs
  ctx.fillStyle = '#3a5a3a'
  ctx.fillRect(11, 22 + bob + lSwing, 4, 7)
  ctx.fillRect(17, 22 + bob - lSwing, 4, 7)
  // Body (rotting flesh)
  ctx.fillStyle = '#4a7048'
  ctx.fillRect(9, 12 + bob, 14, 11)
  ctx.fillStyle = '#5a8456'
  ctx.fillRect(11, 13 + bob, 6, 8)
  // Wounds
  ctx.fillStyle = '#2a1818'
  ctx.fillRect(13, 16 + bob, 3, 2); ctx.fillRect(18, 18 + bob, 2, 2)
  // Outstretched arms
  ctx.fillStyle = '#4a7048'
  ctx.fillRect(3, 13 + bob, 7, 4)
  ctx.fillRect(22, 13 + bob, 7, 4)
  ctx.fillStyle = '#5a8456'
  ctx.fillRect(3, 13 + bob, 3, 4); ctx.fillRect(26, 13 + bob, 3, 4)
  // Head
  ctx.fillStyle = '#5a8456'
  ctx.fillRect(11, 4 + bob, 10, 9)
  ctx.fillStyle = '#80ff90'
  ctx.fillRect(12, 7 + bob, 2, 2); ctx.fillRect(18, 7 + bob, 2, 2)
  ctx.fillStyle = '#2a1818'
  ctx.fillRect(13, 11 + bob, 6, 1)
}

function drawWraithMinion(ctx: CanvasRenderingContext2D, frame: number) {
  const float = Math.sin(frame * 0.1) * 2
  const oy = float
  const ghostAlpha = 0.55 + Math.sin(frame * 0.15) * 0.15
  ctx.globalAlpha = ghostAlpha
  // Spectral tail
  ctx.fillStyle = '#6020a0'
  ctx.beginPath()
  ctx.moveTo(10, 18 + oy)
  ctx.lineTo(22, 18 + oy)
  ctx.lineTo(20, 30 + oy)
  ctx.lineTo(16, 26 + oy)
  ctx.lineTo(12, 30 + oy)
  ctx.closePath(); ctx.fill()
  // Hooded body
  ctx.fillStyle = '#3a1060'
  ctx.fillRect(9, 6 + oy, 14, 14)
  ctx.fillStyle = '#50208a'
  ctx.fillRect(11, 7 + oy, 6, 10)
  // Void face
  ctx.fillStyle = '#0a0414'
  ctx.fillRect(11, 9 + oy, 10, 6)
  // Glowing eyes
  ctx.globalAlpha = ghostAlpha + 0.3
  ctx.fillStyle = '#c060ff'
  ctx.fillRect(12, 11 + oy, 3, 2); ctx.fillRect(17, 11 + oy, 3, 2)
  ctx.globalAlpha = 1
}

// ─── Projectile & Area Effect Renderers ───────────────────────────────────────

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  proj: { x: number; y: number; vx: number; vy: number; radius: number; color: string; type: string },
  tick: number,
) {
  const angle = Math.atan2(proj.vy, proj.vx)
  ctx.save()
  ctx.translate(proj.x, proj.y)
  ctx.rotate(angle)
  const r = proj.radius

  if (proj.type === 'arrow' || proj.type === 'bone') {
    // Trail
    ctx.fillStyle = proj.color + '60'
    ctx.fillRect(-r * 3, -1, r * 3, 2)
    // Shaft
    ctx.fillStyle = proj.type === 'bone' ? '#e8e2d0' : '#8a6030'
    ctx.fillRect(-r * 2, -1, r * 3, 2)
    // Head
    ctx.fillStyle = proj.color
    ctx.beginPath()
    ctx.moveTo(r * 2, 0); ctx.lineTo(r, -r); ctx.lineTo(r, r); ctx.closePath(); ctx.fill()
  } else {
    // Magical orb (fireball/frost/magic) with pulsing glow
    const pulse = 1 + Math.sin(tick * 0.4) * 0.15
    ctx.fillStyle = proj.color + '50'
    ctx.beginPath(); ctx.arc(0, 0, r * 2 * pulse, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = proj.color
    ctx.beginPath(); ctx.arc(0, 0, r * pulse, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.4, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

export function drawAreaEffect(
  ctx: CanvasRenderingContext2D,
  fx: { x: number; y: number; radius: number; maxRadius: number; life: number; maxLife: number; color: string; type: string },
) {
  const progress = 1 - fx.life / fx.maxLife
  const alpha = fx.life / fx.maxLife
  ctx.save()
  ctx.translate(fx.x, fx.y)

  if (fx.type === 'nova' || fx.type === 'frost' || fx.type === 'explosion') {
    const r = fx.radius
    // Outer ring
    ctx.globalAlpha = alpha * 0.8
    ctx.strokeStyle = fx.color
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke()
    // Inner fill
    ctx.globalAlpha = alpha * 0.25
    ctx.fillStyle = fx.color
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill()
    // Spark ring
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + progress * 2
      ctx.fillRect(Math.cos(a) * r - 1.5, Math.sin(a) * r - 1.5, 3, 3)
    }
  } else if (fx.type === 'whirlwind') {
    const r = fx.radius
    ctx.globalAlpha = alpha * 0.7
    ctx.strokeStyle = fx.color
    ctx.lineWidth = 4
    for (let s = 0; s < 3; s++) {
      ctx.beginPath()
      const start = progress * 8 + s * 2.1
      ctx.arc(0, 0, r * (0.5 + s * 0.25), start, start + 2)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

// ─── Monster Sprite Renderer (legacy stub — real impl below) ───────────────

function drawSlime(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bounce = isMoving ? Math.abs(Math.sin(frame * 0.5)) * 4 : 0
  const squish = isMoving ? 1 - bounce / 16 : 1
  ctx.save()
  ctx.translate(16, 20)
  ctx.scale(1 + bounce / 16, squish)
  ctx.translate(-16, -20)

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath(); ctx.ellipse(16, 29, 9, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Slime body
  ctx.fillStyle = '#20a040'
  ctx.beginPath(); ctx.ellipse(16, 20 - bounce, 11, 9, 0, 0, Math.PI * 2); ctx.fill()
  // Highlight
  ctx.fillStyle = '#40cc60'
  ctx.beginPath(); ctx.ellipse(13, 16 - bounce, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#80ee90'
  ctx.beginPath(); ctx.ellipse(12, 15 - bounce, 2, 2, 0, 0, Math.PI * 2); ctx.fill()
  // Dark underbelly
  ctx.fillStyle = '#108030'
  ctx.beginPath(); ctx.ellipse(16, 24 - bounce, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#20a040'
  ctx.beginPath(); ctx.ellipse(16, 22 - bounce, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
  // Eyes
  ctx.fillStyle = '#202020'
  ctx.beginPath(); ctx.ellipse(13, 17 - bounce, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(19, 17 - bounce, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(12.5, 16.5 - bounce, 0.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(18.5, 16.5 - bounce, 0.8, 0, Math.PI * 2); ctx.fill()
  // Drool
  if (isAttacking) {
    ctx.fillStyle = '#10c040'
    ctx.fillRect(15, 22 - bounce, 2, 4)
    ctx.fillStyle = '#30e060'
    ctx.fillRect(15, 24 - bounce, 2, 2)
  }
  // Bubbles
  ctx.fillStyle = 'rgba(80,220,120,0.6)'
  ctx.beginPath(); ctx.arc(10, 15 - bounce, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(22, 18 - bounce, 1, 0, Math.PI * 2); ctx.fill()

  ctx.restore()
}

function drawSkeleton(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const oy = bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Legs (bones)
  ctx.fillStyle = '#d8cfc0'
  const legSwing = isMoving ? Math.sin(frame * 0.4) * 4 : 0
  ctx.fillRect(11, 20 + oy, 3, 8)
  ctx.fillRect(18, 20 + oy, 3, 8)
  // Joints
  ctx.fillStyle = '#c0b8a8'
  ctx.fillRect(11, 24 + oy, 3, 2)
  ctx.fillRect(18, 24 + oy, 3, 2)
  ctx.fillStyle = '#e0d8c8'
  ctx.fillRect(12, 24 + oy, 1, 1)

  // Pelvis
  ctx.fillStyle = '#d8cfc0'
  ctx.fillRect(9, 17 + oy, 14, 5)
  ctx.fillStyle = '#b8b0a0'
  ctx.fillRect(9, 17 + oy, 14, 1)
  ctx.fillStyle = '#f0e8d8'
  ctx.fillRect(11, 18 + oy, 5, 2)

  // Spine
  ctx.fillStyle = '#d8cfc0'
  ctx.fillRect(14, 10 + oy, 4, 9)
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = '#b8b0a0'
    ctx.fillRect(13, 11 + s * 2 + oy, 6, 1)
    ctx.fillStyle = '#e0d8c8'
    ctx.fillRect(14, 11 + s * 2 + oy, 4, 1)
  }

  // Ribcage
  ctx.fillStyle = '#d0c8b8'
  ctx.fillRect(9, 10 + oy, 14, 8)
  // Ribs
  for (let r = 0; r < 3; r++) {
    ctx.fillStyle = '#e8e0d0'
    ctx.fillRect(9, 11 + r * 2.5 + oy, 14, 1)
    ctx.fillStyle = '#b8b0a0'
    ctx.fillRect(9, 11 + r * 2.5 + 0.5 + oy, 14, 0.5)
  }
  ctx.fillStyle = '#302820'
  ctx.fillRect(14, 11 + oy, 4, 6)

  // Arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 4 : 0
  ctx.fillStyle = '#d8cfc0'
  ctx.fillRect(6, 10 + oy + armSwing, 3, 8)
  ctx.fillRect(23, 10 + oy - armSwing, 3, 8)
  ctx.fillStyle = '#b8b0a0'
  ctx.fillRect(6, 14 + oy + armSwing, 3, 2)
  ctx.fillRect(23, 14 + oy - armSwing, 3, 2)
  // Hands
  ctx.fillStyle = '#c8c0b0'
  ctx.fillRect(5, 18 + oy + armSwing, 5, 4)
  ctx.fillRect(22, 18 + oy - armSwing, 5, 4)

  // Skull
  ctx.fillStyle = '#e8e0d0'
  ctx.fillRect(9, 2 + oy, 14, 10)
  ctx.fillStyle = '#f0e8d8'
  ctx.fillRect(11, 3 + oy, 10, 7)
  ctx.fillStyle = '#d0c8b8'
  ctx.fillRect(9, 2 + oy, 1, 10); ctx.fillRect(22, 2 + oy, 1, 10)
  // Jaw
  ctx.fillStyle = '#d8d0c0'
  ctx.fillRect(11, 9 + oy, 10, 4)
  ctx.fillStyle = '#302820'
  ctx.fillRect(12, 10 + oy, 2, 2)
  ctx.fillRect(16, 10 + oy, 3, 2)
  // Eye sockets
  ctx.fillStyle = '#101008'
  ctx.beginPath(); ctx.ellipse(12, 5 + oy, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(20, 5 + oy, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill()
  // Eye glow
  ctx.fillStyle = '#c04010'
  ctx.beginPath(); ctx.arc(12, 5 + oy, 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(20, 5 + oy, 1.2, 0, Math.PI * 2); ctx.fill()

  // Sword
  if (isAttacking) {
    ctx.fillStyle = '#909898'
    ctx.fillRect(25, 8 + oy, 2, 16)
    ctx.fillStyle = '#c8d0d8'
    ctx.fillRect(25, 8 + oy, 2, 10)
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(22, 13 + oy, 8, 2)
  } else {
    ctx.fillStyle = '#909898'
    ctx.fillRect(25, 12 + oy, 2, 14)
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(22, 15 + oy, 8, 2)
  }
}

function drawGoblin(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.5) * 2 : 0
  const oy = bob

  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath(); ctx.ellipse(16, 30, 6, 2, 0, 0, Math.PI * 2); ctx.fill()

  // Feet
  ctx.fillStyle = '#304a18'
  ctx.fillRect(10, 24 + oy, 4, 5)
  ctx.fillRect(18, 24 + oy, 4, 5)

  // Legs
  ctx.fillStyle = '#3a5820'
  ctx.fillRect(11, 18 + oy, 3, 7)
  ctx.fillRect(18, 18 + oy, 3, 7)
  // Ragged pants
  ctx.fillStyle = '#583020'
  ctx.fillRect(9, 16 + oy, 14, 5)
  ctx.fillStyle = '#402010'
  ctx.fillRect(9, 16 + oy, 14, 1)
  // Torn edge
  ctx.fillStyle = '#3a5820'
  ctx.fillRect(10, 20 + oy, 2, 1); ctx.fillRect(14, 21 + oy, 3, 1)
  ctx.fillRect(20, 20 + oy, 2, 1); ctx.fillRect(17, 21 + oy, 2, 1)

  // Body (hunched)
  ctx.fillStyle = '#3a5820'
  ctx.fillRect(9, 9 + oy, 14, 9)
  ctx.fillStyle = '#4a6828'
  ctx.fillRect(11, 10 + oy, 5, 6)
  ctx.fillStyle = '#2a4010'
  ctx.fillRect(9, 9 + oy, 1, 9); ctx.fillRect(22, 9 + oy, 1, 9)
  // Leather armor patches
  ctx.fillStyle = '#6a4020'
  ctx.fillRect(10, 11 + oy, 4, 4)
  ctx.fillRect(18, 11 + oy, 4, 4)

  // Arms (long)
  const armSwing = isMoving ? Math.sin(frame * 0.5) * 4 : 0
  ctx.fillStyle = '#3a5820'
  ctx.fillRect(5, 10 + oy + armSwing, 4, 10)
  ctx.fillRect(23, 10 + oy - armSwing, 4, 10)
  // Clawed hands
  ctx.fillStyle = '#2a4010'
  ctx.fillRect(4, 19 + oy + armSwing, 6, 4)
  ctx.fillRect(22, 19 + oy - armSwing, 6, 4)
  ctx.fillStyle = '#c0c0a0'
  ctx.fillRect(4, 22 + oy + armSwing, 1, 2)
  ctx.fillRect(6, 22 + oy + armSwing, 1, 2)
  ctx.fillRect(8, 22 + oy + armSwing, 1, 2)

  // Head (big ears, ugly)
  ctx.fillStyle = '#3a5820'
  ctx.fillRect(8, 2 + oy, 16, 9)
  // Big ears
  ctx.fillStyle = '#2a4010'
  ctx.fillRect(3, 3 + oy, 6, 4)
  ctx.fillRect(23, 3 + oy, 6, 4)
  ctx.fillStyle = '#ff8090'
  ctx.fillRect(4, 4 + oy, 4, 2)
  ctx.fillRect(24, 4 + oy, 4, 2)
  // Eyes (mean)
  ctx.fillStyle = '#ff4020'
  ctx.fillRect(9, 4 + oy, 4, 3)
  ctx.fillRect(19, 4 + oy, 4, 3)
  ctx.fillStyle = '#202010'
  ctx.fillRect(10, 5 + oy, 2, 2)
  ctx.fillRect(20, 5 + oy, 2, 2)
  // Nose
  ctx.fillStyle = '#2a4010'
  ctx.fillRect(14, 7 + oy, 4, 2)
  ctx.fillStyle = '#202010'
  ctx.fillRect(14, 8 + oy, 2, 1); ctx.fillRect(16, 8 + oy, 2, 1)
  // Teeth
  ctx.fillStyle = '#d8d0a0'
  ctx.fillRect(12, 9 + oy, 2, 2)
  ctx.fillRect(18, 9 + oy, 2, 2)
  // Cloak/hood
  ctx.fillStyle = '#402810'
  ctx.fillRect(7, 3 + oy, 3, 7)
  ctx.fillRect(22, 3 + oy, 3, 7)

  // Crude knife
  if (isAttacking) {
    ctx.fillStyle = '#909090'
    ctx.fillRect(27, 10 + oy, 2, 8)
    ctx.fillStyle = '#4a2810'
    ctx.fillRect(26, 9 + oy, 4, 3)
  }
}

function drawOrc(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.3) * 1.5 : 0
  const oy = bob

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath(); ctx.ellipse(16, 31, 12, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Massive boots
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(8, 24 + oy, 7, 6); ctx.fillRect(17, 24 + oy, 7, 6)
  ctx.fillStyle = '#2a1808'
  ctx.fillRect(8, 24 + oy, 7, 1); ctx.fillRect(17, 24 + oy, 7, 1)

  // Thick legs
  ctx.fillStyle = '#2a5a18'
  ctx.fillRect(9, 18 + oy, 6, 7); ctx.fillRect(17, 18 + oy, 6, 7)
  // Spiked kneepads
  ctx.fillStyle = '#606060'
  ctx.fillRect(9, 18 + oy, 6, 3); ctx.fillRect(17, 18 + oy, 6, 3)
  ctx.fillStyle = '#909090'
  ctx.fillRect(11, 17 + oy, 2, 2); ctx.fillRect(19, 17 + oy, 2, 2)

  // Huge torso
  ctx.fillStyle = '#2a5a18'
  ctx.fillRect(7, 9 + oy, 18, 11)
  ctx.fillStyle = '#3a6a28'
  ctx.fillRect(10, 10 + oy, 7, 8)
  ctx.fillStyle = '#1a4010'
  ctx.fillRect(7, 9 + oy, 1, 11); ctx.fillRect(24, 9 + oy, 1, 11)
  // Chest scar
  ctx.fillStyle = '#c04040'
  ctx.fillRect(14, 12 + oy, 5, 1)
  ctx.fillRect(16, 11 + oy, 1, 3)
  // Armor plates
  ctx.fillStyle = '#606868'
  ctx.fillRect(8, 9 + oy, 4, 4); ctx.fillRect(20, 9 + oy, 4, 4)
  ctx.fillStyle = '#808888'
  ctx.fillRect(9, 9 + oy, 2, 2); ctx.fillRect(21, 9 + oy, 2, 2)

  // Massive arms
  const armSwing = isMoving ? Math.sin(frame * 0.3) * 3 : 0
  ctx.fillStyle = '#2a5a18'
  ctx.fillRect(3, 9 + oy + armSwing, 5, 11)
  ctx.fillRect(24, 9 + oy - armSwing, 5, 11)
  // Fists
  ctx.fillStyle = '#1a4a10'
  ctx.fillRect(2, 19 + oy + armSwing, 7, 5)
  ctx.fillRect(23, 19 + oy - armSwing, 7, 5)
  // Knuckle spikes
  ctx.fillStyle = '#d0c080'
  ctx.fillRect(2, 18 + oy + armSwing, 1, 2)
  ctx.fillRect(4, 18 + oy + armSwing, 1, 2)
  ctx.fillRect(6, 18 + oy + armSwing, 1, 2)

  // Thick neck
  ctx.fillStyle = '#2a5a18'
  ctx.fillRect(13, 7 + oy, 6, 4)

  // Massive head
  ctx.fillStyle = '#3a6a28'
  ctx.fillRect(7, 0 + oy, 18, 9)
  ctx.fillStyle = '#4a7a38'
  ctx.fillRect(9, 1 + oy, 9, 6)
  ctx.fillStyle = '#2a5a18'
  ctx.fillRect(7, 0 + oy, 1, 9); ctx.fillRect(24, 0 + oy, 1, 9)
  // Eyes (red rage)
  ctx.fillStyle = '#ff2000'
  ctx.fillRect(8, 2 + oy, 5, 4)
  ctx.fillRect(19, 2 + oy, 5, 4)
  ctx.fillStyle = '#300000'
  ctx.fillRect(9, 3 + oy, 3, 3)
  ctx.fillRect(20, 3 + oy, 3, 3)
  ctx.fillStyle = '#ff8060'
  ctx.fillRect(9, 3 + oy, 1, 1)
  ctx.fillRect(20, 3 + oy, 1, 1)
  // Tusks
  ctx.fillStyle = '#e0d890'
  ctx.fillRect(10, 7 + oy, 3, 4)
  ctx.fillRect(19, 7 + oy, 3, 4)
  ctx.fillStyle = '#f0e8a0'
  ctx.fillRect(11, 7 + oy, 1, 4)
  ctx.fillRect(19, 7 + oy, 1, 4)
  // Nose ring
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(14, 5 + oy, 4, 1)
  // War paint
  ctx.fillStyle = '#c83020'
  ctx.fillRect(7, 3 + oy, 3, 1); ctx.fillRect(22, 3 + oy, 3, 1)
  // Horned helmet
  ctx.fillStyle = '#505858'
  ctx.fillRect(7, 0 + oy, 18, 3)
  ctx.fillStyle = '#d0c080'
  ctx.fillRect(6, 0 + oy, 3, 5)
  ctx.fillRect(23, 0 + oy, 3, 5)

  // Axe weapon
  if (!isAttacking) {
    ctx.fillStyle = '#4a4a4a'
    ctx.fillRect(27, 6 + oy, 3, 20)
    ctx.fillStyle = '#808080'
    ctx.fillRect(26, 4 + oy, 6, 7)
    ctx.fillStyle = '#a0a0a0'
    ctx.fillRect(26, 5 + oy, 5, 5)
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(27, 6 + oy, 3, 2)
  } else {
    ctx.fillStyle = '#4a4a4a'
    ctx.fillRect(20, 3 + oy, 3, 16)
    ctx.fillStyle = '#808080'
    ctx.fillRect(22, 2 + oy, 7, 6)
    ctx.fillStyle = '#a0a0a0'
    ctx.fillRect(23, 2 + oy, 6, 5)
  }
}

function drawWolf(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.abs(Math.sin(frame * 0.5)) * 2 : 0
  const oy = bob

  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath(); ctx.ellipse(16, 31, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Tail
  const tailWag = Math.sin(frame * 0.5) * 8
  ctx.fillStyle = '#808898'
  ctx.beginPath()
  ctx.moveTo(6, 18 + oy)
  ctx.quadraticCurveTo(0, 10 + tailWag + oy, 3, 4 + tailWag + oy)
  ctx.quadraticCurveTo(5, 2 + tailWag + oy, 6, 6 + tailWag + oy)
  ctx.quadraticCurveTo(4, 12 + tailWag + oy, 8, 18 + oy)
  ctx.fill()
  ctx.fillStyle = '#c0c8d0'
  ctx.fillRect(4, 3 + tailWag + oy, 2, 3)

  // Body
  ctx.fillStyle = '#606878'
  ctx.fillRect(8, 14 + oy, 18, 10)
  ctx.fillStyle = '#808898'
  ctx.fillRect(10, 14 + oy, 12, 8)
  ctx.fillStyle = '#c0c8d0'
  ctx.fillRect(11, 14 + oy, 8, 4)
  // Belly
  ctx.fillStyle = '#d0d8e0'
  ctx.fillRect(11, 20 + oy, 10, 4)

  // Legs
  const legSwing = isMoving ? Math.sin(frame * 0.5) * 4 : 0
  ctx.fillStyle = '#606878'
  ctx.fillRect(9, 22 + oy - legSwing, 4, 7)
  ctx.fillRect(20, 22 + oy + legSwing, 4, 7)
  ctx.fillRect(10, 22 + oy + legSwing, 4, 7)
  ctx.fillRect(19, 22 + oy - legSwing, 4, 7)
  // Paws
  ctx.fillStyle = '#484858'
  ctx.fillRect(8, 28 + oy - legSwing, 5, 3); ctx.fillRect(19, 28 + oy + legSwing, 5, 3)
  ctx.fillRect(9, 28 + oy + legSwing, 5, 3); ctx.fillRect(18, 28 + oy - legSwing, 5, 3)

  // Neck
  ctx.fillStyle = '#606878'
  ctx.fillRect(20, 10 + oy, 6, 6)
  ctx.fillStyle = '#808898'
  ctx.fillRect(21, 10 + oy, 4, 5)

  // Head
  ctx.fillStyle = '#606878'
  ctx.fillRect(20, 4 + oy, 12, 9)
  ctx.fillStyle = '#808898'
  ctx.fillRect(22, 5 + oy, 8, 7)
  // Snout
  ctx.fillStyle = '#484858'
  ctx.fillRect(29, 7 + oy, 4, 4)
  ctx.fillStyle = '#202020'
  ctx.fillRect(31, 9 + oy, 2, 2)
  // Nose
  ctx.fillStyle = '#101010'
  ctx.fillRect(30, 7 + oy, 3, 2)
  // Eyes
  ctx.fillStyle = '#f0b040'
  ctx.fillRect(22, 5 + oy, 3, 3)
  ctx.fillRect(27, 5 + oy, 3, 3)
  ctx.fillStyle = '#101010'
  ctx.fillRect(23, 6 + oy, 2, 2)
  ctx.fillRect(28, 6 + oy, 2, 2)
  // Ears
  ctx.fillStyle = '#484858'
  ctx.fillRect(21, 1 + oy, 3, 5)
  ctx.fillRect(27, 1 + oy, 3, 5)
  ctx.fillStyle = '#ff8090'
  ctx.fillRect(22, 2 + oy, 2, 3)
  ctx.fillRect(28, 2 + oy, 2, 3)
  // Teeth (when attacking)
  if (isAttacking) {
    ctx.fillStyle = '#f0f0e0'
    ctx.fillRect(29, 10 + oy, 1, 3)
    ctx.fillRect(31, 10 + oy, 1, 3)
    ctx.fillStyle = '#ff2020'
    ctx.fillRect(29, 10 + oy, 3, 2)
  }
}

function drawSpider(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.8) * 1 : 0
  const oy = bob

  // Legs (4 pairs, animated)
  const legWave = Math.sin(frame * 0.5) * 5
  const legPairs = [
    [3, 13, -legWave], [2, 17, -legWave * 0.5],
    [25, 13, legWave], [26, 17, legWave * 0.5]
  ]
  legPairs.forEach(([lx, ly, lw]) => {
    ctx.strokeStyle = '#1a0a20'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(lx, ly + oy)
    ctx.lineTo(lx - 3, ly - 6 + lw + oy)
    ctx.lineTo(lx - 6, ly - 2 + lw + oy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(32 - lx, ly + oy)
    ctx.lineTo(32 - lx + 3, ly - 6 - lw + oy)
    ctx.lineTo(32 - lx + 6, ly - 2 - lw + oy)
    ctx.stroke()
  })

  // Abdomen
  ctx.fillStyle = '#200a2a'
  ctx.beginPath(); ctx.ellipse(16, 22 + oy, 8, 7, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#300f40'
  ctx.beginPath(); ctx.ellipse(15, 20 + oy, 5, 5, 0, 0, Math.PI * 2); ctx.fill()
  // Red hourglass marking
  ctx.fillStyle = '#cc1010'
  ctx.fillRect(13, 20 + oy, 6, 2)
  ctx.fillRect(14, 19 + oy, 4, 4)
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(14, 20 + oy, 4, 2)

  // Body
  ctx.fillStyle = '#2a1238'
  ctx.beginPath(); ctx.ellipse(16, 13 + oy, 6, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#401858'
  ctx.beginPath(); ctx.ellipse(15, 12 + oy, 4, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Head
  ctx.fillStyle = '#1a0a28'
  ctx.beginPath(); ctx.ellipse(16, 6 + oy, 5, 4, 0, 0, Math.PI * 2); ctx.fill()
  // Eight eyes
  const eyePositions = [[11,4],[13,3],[15,3],[17,3],[19,3],[21,4],[13,6],[19,6]]
  eyePositions.forEach(([ex, ey]) => {
    ctx.fillStyle = '#e02020'
    ctx.beginPath(); ctx.arc(ex, ey + oy, 1, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ff6060'
    ctx.beginPath(); ctx.arc(ex - 0.3, ey - 0.3 + oy, 0.5, 0, Math.PI * 2); ctx.fill()
  })
  // Fangs
  ctx.fillStyle = '#e0e0d0'
  ctx.fillRect(14, 8 + oy, 2, 4)
  ctx.fillRect(16, 8 + oy, 2, 4)
  // Venom drip
  if (isAttacking) {
    ctx.fillStyle = '#60cc20'
    ctx.fillRect(14, 11 + oy, 1, 3)
    ctx.fillRect(17, 11 + oy, 1, 3)
  }
}

function drawZombie(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const lurch = isMoving ? Math.sin(frame * 0.3) * 3 : 0
  const oy = lurch

  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 31, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Dragging feet
  ctx.fillStyle = '#3a3028'
  ctx.fillRect(10, 24 + oy, 5, 6)
  ctx.fillRect(17, 24 + oy, 5, 6)
  // Exposed bone feet
  ctx.fillStyle = '#d0c8b0'
  ctx.fillRect(11, 27 + oy, 3, 3)
  ctx.fillRect(18, 27 + oy, 3, 3)

  // Ragged pants
  ctx.fillStyle = '#383028'
  ctx.fillRect(10, 18 + oy, 5, 7)
  ctx.fillRect(17, 18 + oy, 5, 7)
  ctx.fillStyle = '#504838'
  ctx.fillRect(11, 19 + oy, 3, 5)

  // Torn shirt / rotting torso
  ctx.fillStyle = '#485838'
  ctx.fillRect(9, 10 + oy, 14, 10)
  ctx.fillStyle = '#3a4a28'
  ctx.fillRect(9, 10 + oy, 1, 10); ctx.fillRect(22, 10 + oy, 1, 10)
  // Exposed ribs
  ctx.fillStyle = '#d0c8b0'
  ctx.fillRect(12, 12 + oy, 8, 1)
  ctx.fillRect(12, 14 + oy, 8, 1)
  ctx.fillRect(12, 16 + oy, 8, 1)
  ctx.fillStyle = '#485838'
  ctx.fillRect(14, 11 + oy, 4, 7)
  // Wounds
  ctx.fillStyle = '#800010'
  ctx.fillRect(14, 13 + oy, 4, 1)
  ctx.fillRect(11, 17 + oy, 3, 1)

  // Outstretched arms
  const armReach = isMoving ? Math.sin(frame * 0.3) * 2 + 4 : 0
  ctx.fillStyle = '#485838'
  ctx.fillRect(3 + armReach, 10 + oy, 6, 9)
  ctx.fillRect(23, 10 + oy, 6, 9)
  // Clawed hands
  ctx.fillStyle = '#2a3818'
  ctx.fillRect(1 + armReach, 17 + oy, 8, 5)
  ctx.fillStyle = '#d0c8b0'
  for (let f = 0; f < 4; f++) {
    ctx.fillRect(1 + f * 2 + armReach, 21 + oy, 1, 3)
  }

  // Neck
  ctx.fillStyle = '#485838'
  ctx.fillRect(14, 8 + oy, 4, 4)

  // Head (decomposed)
  ctx.fillStyle = '#607848'
  ctx.fillRect(8, 1 + oy, 16, 9)
  ctx.fillStyle = '#708858'
  ctx.fillRect(10, 2 + oy, 10, 6)
  ctx.fillStyle = '#485838'
  ctx.fillRect(8, 1 + oy, 1, 9); ctx.fillRect(23, 1 + oy, 1, 9)
  // Eyes (hollow with glow)
  ctx.fillStyle = '#101008'
  ctx.beginPath(); ctx.ellipse(12, 4 + oy, 2.5, 2.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(20, 4 + oy, 2.5, 2.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#20e020'
  ctx.beginPath(); ctx.arc(12, 4 + oy, 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(20, 4 + oy, 1.2, 0, Math.PI * 2); ctx.fill()
  // Mouth
  ctx.fillStyle = '#101008'
  ctx.fillRect(10, 7 + oy, 12, 3)
  ctx.fillStyle = '#d0c8b0'
  ctx.fillRect(11, 7 + oy, 2, 3)
  ctx.fillRect(14, 7 + oy, 2, 3)
  ctx.fillRect(17, 7 + oy, 2, 3)
  ctx.fillRect(20, 7 + oy, 2, 3)
  // Exposed skull bits
  ctx.fillStyle = '#d0c8b0'
  ctx.fillRect(8, 1 + oy, 4, 1)
  ctx.fillRect(20, 2 + oy, 3, 1)
}

function drawDemon(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const fireGlow = Math.sin(frame * 0.2) * 0.5 + 0.5
  const oy = bob

  // Fire aura
  ctx.fillStyle = `rgba(200,60,0,${fireGlow * 0.15})`
  ctx.beginPath(); ctx.ellipse(16, 16, 16, 16, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath(); ctx.ellipse(16, 31, 10, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Legs
  ctx.fillStyle = '#600010'
  ctx.fillRect(9, 20 + oy, 6, 9)
  ctx.fillRect(17, 20 + oy, 6, 9)
  // Hooves
  ctx.fillStyle = '#101010'
  ctx.fillRect(8, 27 + oy, 7, 4)
  ctx.fillRect(17, 27 + oy, 7, 4)
  ctx.fillStyle = '#303030'
  ctx.fillRect(8, 27 + oy, 7, 1); ctx.fillRect(17, 27 + oy, 7, 1)

  // Torso
  ctx.fillStyle = '#800020'
  ctx.fillRect(7, 9 + oy, 18, 13)
  ctx.fillStyle = '#a00030'
  ctx.fillRect(9, 10 + oy, 8, 10)
  ctx.fillStyle = '#600010'
  ctx.fillRect(7, 9 + oy, 1, 13); ctx.fillRect(24, 9 + oy, 1, 13)
  // Glowing runes
  ctx.fillStyle = `rgba(255,140,0,${0.5 + fireGlow * 0.5})`
  ctx.fillRect(12, 12 + oy, 8, 1); ctx.fillRect(12, 14 + oy, 8, 1)
  ctx.fillRect(14, 10 + oy, 4, 6)
  // Bone shoulder pads
  ctx.fillStyle = '#d0c8b0'
  ctx.fillRect(4, 8 + oy, 5, 6)
  ctx.fillRect(23, 8 + oy, 5, 6)
  ctx.fillStyle = '#f0e8d0'
  ctx.fillRect(5, 8 + oy, 3, 3); ctx.fillRect(24, 8 + oy, 3, 3)

  // Massive arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 4 : 0
  ctx.fillStyle = '#800020'
  ctx.fillRect(3, 9 + oy + armSwing, 5, 12)
  ctx.fillRect(24, 9 + oy - armSwing, 5, 12)
  // Claws
  ctx.fillStyle = '#d0a080'
  ctx.fillRect(2, 19 + oy + armSwing, 1, 4)
  ctx.fillRect(4, 20 + oy + armSwing, 1, 4)
  ctx.fillRect(6, 19 + oy + armSwing, 1, 4)
  ctx.fillRect(24, 19 + oy - armSwing, 1, 4)
  ctx.fillRect(26, 20 + oy - armSwing, 1, 4)
  ctx.fillRect(28, 19 + oy - armSwing, 1, 4)

  // Neck
  ctx.fillStyle = '#800020'
  ctx.fillRect(13, 7 + oy, 6, 4)

  // Head
  ctx.fillStyle = '#900020'
  ctx.fillRect(8, 0 + oy, 16, 9)
  ctx.fillStyle = '#b00028'
  ctx.fillRect(10, 1 + oy, 10, 6)
  ctx.fillStyle = '#700018'
  ctx.fillRect(8, 0 + oy, 1, 9); ctx.fillRect(23, 0 + oy, 1, 9)
  // Horns
  ctx.fillStyle = '#202020'
  ctx.fillRect(8, -4 + oy, 3, 6)
  ctx.fillRect(21, -4 + oy, 3, 6)
  ctx.fillStyle = '#404040'
  ctx.fillRect(9, -4 + oy, 1, 5)
  ctx.fillRect(22, -4 + oy, 1, 5)
  ctx.fillStyle = '#c0c0c0'
  ctx.fillRect(9, -4 + oy, 1, 2)
  ctx.fillRect(22, -4 + oy, 1, 2)
  // Eyes (burning)
  ctx.fillStyle = '#ff6000'
  ctx.fillRect(9, 2 + oy, 5, 3)
  ctx.fillRect(18, 2 + oy, 5, 3)
  ctx.fillStyle = '#ffcc00'
  ctx.fillRect(10, 2 + oy, 3, 2)
  ctx.fillRect(19, 2 + oy, 3, 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(10, 2 + oy, 1, 1)
  ctx.fillRect(19, 2 + oy, 1, 1)
  // Mouth (grinning, showing fangs)
  ctx.fillStyle = '#200010'
  ctx.fillRect(10, 6 + oy, 12, 3)
  ctx.fillStyle = '#e0d0b0'
  ctx.fillRect(11, 6 + oy, 2, 3)
  ctx.fillRect(15, 6 + oy, 2, 3)
  ctx.fillRect(19, 6 + oy, 2, 3)
  // Fire particles on head
  ctx.fillStyle = `rgba(255,120,0,${fireGlow * 0.8})`
  ctx.fillRect(11, -1 + oy, 2, 2)
  ctx.fillRect(19, 0 + oy, 2, 1)
}

function drawDragon(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = Math.sin(frame * 0.15) * 3
  const wingFlap = Math.sin(frame * 0.2) * 8
  const oy = bob
  const fireGlow = Math.sin(frame * 0.1) * 0.5 + 0.5

  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath(); ctx.ellipse(16, 32, 14, 4, 0, 0, Math.PI * 2); ctx.fill()

  // Wings (behind body)
  ctx.fillStyle = '#401010'
  ctx.beginPath()
  ctx.moveTo(8, 14 + oy); ctx.lineTo(-4, 2 - wingFlap + oy)
  ctx.lineTo(0, 14 + oy); ctx.lineTo(4, 10 + oy); ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#601818'
  ctx.beginPath()
  ctx.moveTo(8, 14 + oy); ctx.lineTo(-2, 0 - wingFlap + oy)
  ctx.lineTo(2, 12 + oy); ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#401010'
  ctx.beginPath()
  ctx.moveTo(24, 14 + oy); ctx.lineTo(36, 2 - wingFlap + oy)
  ctx.lineTo(32, 14 + oy); ctx.lineTo(28, 10 + oy); ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#601818'
  ctx.beginPath()
  ctx.moveTo(24, 14 + oy); ctx.lineTo(34, 0 - wingFlap + oy)
  ctx.lineTo(30, 12 + oy); ctx.closePath()
  ctx.fill()

  // Tail
  ctx.fillStyle = '#6a1818'
  ctx.fillRect(2, 24 + oy, 8, 5)
  ctx.fillRect(0, 27 + oy, 4, 3)
  ctx.fillStyle = '#d0a040'
  ctx.fillRect(1, 24 + oy, 2, 2); ctx.fillRect(4, 25 + oy, 2, 2); ctx.fillRect(7, 24 + oy, 2, 2)

  // Body
  ctx.fillStyle = '#6a1818'
  ctx.fillRect(7, 14 + oy, 18, 14)
  ctx.fillStyle = '#8a2020'
  ctx.fillRect(10, 15 + oy, 10, 10)
  ctx.fillStyle = '#501010'
  ctx.fillRect(7, 14 + oy, 1, 14); ctx.fillRect(24, 14 + oy, 1, 14)
  // Scales belly
  ctx.fillStyle = '#d0a040'
  ctx.fillRect(12, 16 + oy, 8, 10)
  ctx.fillStyle = '#e0b850'
  ctx.fillRect(13, 17 + oy, 6, 8)
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = '#c09030'
    ctx.fillRect(12, 16 + r * 2.5 + oy, 8, 1)
  }

  // Legs
  ctx.fillStyle = '#6a1818'
  ctx.fillRect(8, 24 + oy, 6, 7); ctx.fillRect(18, 24 + oy, 6, 7)
  // Claws
  ctx.fillStyle = '#d0a040'
  ctx.fillRect(6, 30 + oy, 3, 2); ctx.fillRect(10, 31 + oy, 3, 2)
  ctx.fillRect(17, 30 + oy, 3, 2); ctx.fillRect(21, 31 + oy, 3, 2)

  // Neck
  ctx.fillStyle = '#6a1818'
  ctx.fillRect(12, 7 + oy, 8, 9)
  ctx.fillStyle = '#8a2020'
  ctx.fillRect(13, 7 + oy, 6, 8)
  // Neck spines
  ctx.fillStyle = '#d0a040'
  ctx.fillRect(11, 6 + oy, 2, 4); ctx.fillRect(15, 4 + oy, 2, 5)
  ctx.fillRect(19, 6 + oy, 2, 4)

  // Head
  ctx.fillStyle = '#7a1818'
  ctx.fillRect(8, 0 + oy, 16, 10)
  ctx.fillStyle = '#9a2020'
  ctx.fillRect(10, 1 + oy, 10, 7)
  ctx.fillStyle = '#5a1010'
  ctx.fillRect(8, 0 + oy, 1, 10); ctx.fillRect(23, 0 + oy, 1, 10)
  // Horns
  ctx.fillStyle = '#d0a040'
  ctx.fillRect(9, -5 + oy, 3, 7)
  ctx.fillRect(20, -5 + oy, 3, 7)
  ctx.fillStyle = '#e0b850'
  ctx.fillRect(10, -5 + oy, 1, 6); ctx.fillRect(21, -5 + oy, 1, 6)
  // Eyes
  ctx.fillStyle = '#ff8800'
  ctx.fillRect(9, 2 + oy, 6, 4)
  ctx.fillRect(17, 2 + oy, 6, 4)
  ctx.fillStyle = '#ffcc00'
  ctx.fillRect(10, 2 + oy, 4, 3); ctx.fillRect(18, 2 + oy, 4, 3)
  ctx.fillStyle = '#101008'
  ctx.fillRect(11, 2 + oy, 2, 3); ctx.fillRect(19, 2 + oy, 2, 3)
  // Snout
  ctx.fillStyle = '#6a1818'
  ctx.fillRect(9, 6 + oy, 14, 5)
  ctx.fillStyle = '#101010'
  ctx.fillRect(10, 8 + oy, 3, 2); ctx.fillRect(19, 8 + oy, 3, 2)
  // Teeth
  ctx.fillStyle = '#f0e8d0'
  ctx.fillRect(11, 9 + oy, 2, 3)
  ctx.fillRect(15, 9 + oy, 2, 3)
  ctx.fillRect(19, 9 + oy, 2, 3)
  // Fire breath
  if (isAttacking) {
    for (let f = 0; f < 5; f++) {
      ctx.fillStyle = `rgba(${200+f*10},${100-f*20},0,${0.8 - f * 0.15})`
      ctx.beginPath()
      ctx.ellipse(23 + f * 4, 7 + oy, 2 + f, 1.5 + f * 0.5, 0.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = `rgba(255,220,60,${fireGlow * 0.9})`
    ctx.beginPath(); ctx.ellipse(22, 7 + oy, 3, 2, 0, 0, Math.PI * 2); ctx.fill()
  }
}

function drawTroll(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.25) * 2 : 0
  const oy = bob

  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath(); ctx.ellipse(16, 32, 13, 4, 0, 0, Math.PI * 2); ctx.fill()

  // Legs (huge)
  ctx.fillStyle = '#305828'
  ctx.fillRect(7, 20 + oy, 7, 10); ctx.fillRect(18, 20 + oy, 7, 10)
  // Toenails
  ctx.fillStyle = '#d0c880'
  ctx.fillRect(6, 29 + oy, 3, 2); ctx.fillRect(10, 30 + oy, 3, 2)
  ctx.fillRect(18, 29 + oy, 3, 2); ctx.fillRect(22, 30 + oy, 3, 2)

  // Massive body
  ctx.fillStyle = '#356028'
  ctx.fillRect(5, 9 + oy, 22, 13)
  ctx.fillStyle = '#456830'
  ctx.fillRect(7, 10 + oy, 14, 10)
  ctx.fillStyle = '#253818'
  ctx.fillRect(5, 9 + oy, 1, 13); ctx.fillRect(26, 9 + oy, 1, 13)
  // Warts
  ctx.fillStyle = '#203018'
  ctx.fillRect(8, 12 + oy, 3, 3); ctx.fillRect(21, 14 + oy, 3, 3)
  ctx.fillRect(15, 10 + oy, 2, 2)
  ctx.fillStyle = '#507040'
  ctx.fillRect(9, 13 + oy, 1, 1); ctx.fillRect(22, 15 + oy, 1, 1)

  // Arms (enormous, ground-dragging)
  const armSwing = isMoving ? Math.sin(frame * 0.25) * 3 : 0
  ctx.fillStyle = '#305828'
  ctx.fillRect(0, 9 + oy + armSwing, 6, 14)
  ctx.fillRect(26, 9 + oy - armSwing, 6, 14)
  // Club/fist
  ctx.fillStyle = '#253018'
  ctx.fillRect(-1, 22 + oy + armSwing, 8, 6)
  ctx.fillRect(25, 22 + oy - armSwing, 8, 6)
  // Nails
  ctx.fillStyle = '#d0c880'
  for (let n = 0; n < 3; n++) {
    ctx.fillRect(n * 2, 27 + oy + armSwing, 2, 3)
    ctx.fillRect(26 + n * 2, 27 + oy - armSwing, 2, 3)
  }

  // Neck
  ctx.fillStyle = '#305828'
  ctx.fillRect(12, 6 + oy, 8, 5)

  // HUGE head
  ctx.fillStyle = '#3a6230'
  ctx.fillRect(6, -1 + oy, 20, 10)
  ctx.fillStyle = '#4a7238'
  ctx.fillRect(8, 0 + oy, 14, 7)
  ctx.fillStyle = '#2a5020'
  ctx.fillRect(6, -1 + oy, 1, 10); ctx.fillRect(25, -1 + oy, 1, 10)
  // Nose (bulbous)
  ctx.fillStyle = '#305828'
  ctx.fillRect(13, 4 + oy, 6, 4)
  ctx.fillStyle = '#203018'
  ctx.fillRect(13, 6 + oy, 2, 2); ctx.fillRect(17, 6 + oy, 2, 2)
  // Eyes (dull)
  ctx.fillStyle = '#f0a010'
  ctx.fillRect(7, 1 + oy, 6, 4)
  ctx.fillRect(19, 1 + oy, 6, 4)
  ctx.fillStyle = '#202010'
  ctx.fillRect(9, 2 + oy, 3, 3); ctx.fillRect(20, 2 + oy, 3, 3)
  ctx.fillStyle = '#e0e040'
  ctx.fillRect(9, 2 + oy, 1, 1); ctx.fillRect(20, 2 + oy, 1, 1)
  // Mouth (gaping, with tusks)
  ctx.fillStyle = '#201810'
  ctx.fillRect(9, 6 + oy, 14, 4)
  ctx.fillStyle = '#e0d890'
  ctx.fillRect(10, 6 + oy, 3, 4)
  ctx.fillRect(19, 6 + oy, 3, 4)
  // Mossy hair on head
  ctx.fillStyle = '#205018'
  ctx.fillRect(6, -1 + oy, 4, 2); ctx.fillRect(12, -2 + oy, 3, 2)
  ctx.fillRect(18, -1 + oy, 4, 2); ctx.fillRect(23, -2 + oy, 3, 2)
}

function drawWitch(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const magicGlow = Math.sin(frame * 0.15) * 0.5 + 0.5
  const oy = bob

  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 31, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Robe (floor-length)
  ctx.fillStyle = '#1a0a28'
  ctx.fillRect(8, 16 + oy, 16, 14)
  ctx.fillStyle = '#280f38'
  ctx.fillRect(10, 17 + oy, 6, 12)
  ctx.fillStyle = '#100818'
  ctx.fillRect(8, 16 + oy, 1, 14); ctx.fillRect(23, 16 + oy, 1, 14)
  // Hem magic runes
  ctx.fillStyle = `rgba(100,50,200,${0.4 + magicGlow * 0.4})`
  ctx.fillRect(8, 28 + oy, 16, 1)
  ctx.fillRect(9, 29 + oy, 14, 1)

  // Body
  ctx.fillStyle = '#1a0a28'
  ctx.fillRect(9, 9 + oy, 14, 9)
  ctx.fillStyle = '#8040c0'
  ctx.fillRect(9, 9 + oy, 14, 1); ctx.fillRect(9, 17 + oy, 14, 1)
  // Potion belt
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(9, 16 + oy, 14, 2)
  ctx.fillStyle = '#60a020'
  ctx.fillRect(14, 16 + oy, 2, 2)
  ctx.fillStyle = '#2060e0'
  ctx.fillRect(17, 16 + oy, 2, 2)
  ctx.fillStyle = '#e06020'
  ctx.fillRect(11, 16 + oy, 2, 2)

  // Arms (flowing)
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 4 : 0
  ctx.fillStyle = '#1a0a28'
  ctx.fillRect(4, 10 + oy + armSwing, 5, 8)
  ctx.fillRect(23, 10 + oy - armSwing, 5, 8)
  // Gloved hands
  ctx.fillStyle = '#200a30'
  ctx.fillRect(3, 17 + oy + armSwing, 7, 4)
  ctx.fillRect(22, 17 + oy - armSwing, 7, 4)
  // Magic orb in hand
  if (isAttacking) {
    ctx.fillStyle = `rgba(120,60,220,${0.6 + magicGlow * 0.4})`
    ctx.beginPath(); ctx.arc(4, 18 + oy + armSwing, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(180,120,255,0.9)`
    ctx.beginPath(); ctx.arc(4, 18 + oy + armSwing, 2, 0, Math.PI * 2); ctx.fill()
  }

  // Neck
  ctx.fillStyle = '#c0988a'
  ctx.fillRect(14, 7 + oy, 4, 4)

  // Pointed hat
  ctx.fillStyle = '#10082a'
  ctx.fillRect(8, 3 + oy, 16, 6)
  ctx.fillStyle = '#180b38'
  ctx.fillRect(10, 4 + oy, 8, 4)
  // Hat tip (very pointy)
  ctx.fillStyle = '#10082a'
  ctx.fillRect(12, 0 + oy, 8, 4)
  ctx.fillRect(14, -3 + oy, 6, 4)
  ctx.fillRect(15, -5 + oy, 4, 3)
  ctx.fillRect(16, -7 + oy, 2, 3)
  // Hat band
  ctx.fillStyle = '#8040c0'
  ctx.fillRect(8, 8 + oy, 16, 2)
  ctx.fillStyle = `rgba(150,80,255,${0.4 + magicGlow * 0.5})`
  ctx.fillRect(9, 8 + oy, 14, 1)
  // Buckle
  ctx.fillStyle = '#c09020'
  ctx.fillRect(14, 8 + oy, 4, 2)
  // Stars on hat
  ctx.fillStyle = '#d0c050'
  ctx.fillRect(18, 1 + oy, 2, 1); ctx.fillRect(17, 0 + oy, 4, 1)
  ctx.fillRect(18, -1 + oy, 2, 1)
  ctx.fillRect(10, 5 + oy, 1, 1); ctx.fillRect(9, 4 + oy, 3, 1); ctx.fillRect(10, 3 + oy, 1, 1)

  // Old face
  ctx.fillStyle = '#c0988a'
  ctx.fillRect(10, 7 + oy, 12, 5)
  ctx.fillStyle = '#a08070'
  ctx.fillRect(10, 10 + oy, 12, 2)
  // Nose (hooked)
  ctx.fillStyle = '#b08878'
  ctx.fillRect(15, 9 + oy, 4, 2)
  ctx.fillRect(18, 10 + oy, 2, 2)
  // Eyes (glowing)
  ctx.fillStyle = '#ff8000'
  ctx.fillRect(10, 7 + oy, 4, 3)
  ctx.fillRect(18, 7 + oy, 4, 3)
  ctx.fillStyle = '#ffcc40'
  ctx.fillRect(11, 8 + oy, 2, 2); ctx.fillRect(19, 8 + oy, 2, 2)
  ctx.fillStyle = '#101008'
  ctx.fillRect(11, 8 + oy, 1, 1); ctx.fillRect(19, 8 + oy, 1, 1)
  // Warts
  ctx.fillStyle = '#805848'
  ctx.fillRect(13, 9 + oy, 2, 2)
  // Broom
  ctx.fillStyle = '#8a6020'
  ctx.fillRect(25, 4 + oy, 2, 22)
  ctx.fillStyle = '#c09030'
  ctx.fillRect(25, 4 + oy, 1, 22)
  ctx.fillStyle = '#c8a060'
  for (let b = 0; b < 5; b++) {
    ctx.fillRect(24 + (b % 2), 23 + b + oy, 3, 1)
  }
}

// ─── Monster Sprite Dispatcher ──────────────────────────────────────────────

export function drawMonster(
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
  ctx.save()
  ctx.translate(x + 16 * scale, y + 16 * scale)
  if (direction === 'left') ctx.scale(-1, 1)
  ctx.translate(-16 * scale, -16 * scale)
  ctx.scale(scale, scale)

  switch (type) {
    case 'slime':        drawSlimeMonster(ctx, animFrame); break
    case 'skeleton':     drawSkeletonMonster(ctx, isMoving, animFrame); break
    case 'goblin':       drawGoblinMonster(ctx, isMoving, isAttacking, animFrame); break
    case 'orc':          drawOrcMonster(ctx, isMoving, animFrame); break
    case 'wolf':         drawWolfMonster(ctx, isMoving, animFrame); break
    case 'spider':       drawSpiderMonster(ctx, animFrame); break
    case 'zombie':       drawZombieMonster(ctx, isMoving, animFrame); break
    case 'demon':        drawDemonMonster(ctx, isMoving, isAttacking, animFrame); break
    case 'dragon':       drawDragonMonster(ctx, animFrame); break
    case 'troll':        drawTrollMonster(ctx, isMoving, animFrame); break
    case 'witch':        drawWitchMonster(ctx, isMoving, animFrame); break
    case 'knight_enemy': drawDarkKnightMonster(ctx, isMoving, isAttacking, animFrame); break
    case 'archer_enemy': drawDarkArcherMonster(ctx, isMoving, animFrame); break
    case 'mage_enemy':   drawDarkMageMonster(ctx, isMoving, animFrame); break
    case 'ghost':        drawGhostMonster(ctx, isMoving, animFrame); break
    case 'vampire':      drawVampireMonster(ctx, isMoving, animFrame); break
    case 'treant':       drawTreantMonster(ctx, isMoving, animFrame); break
  }

  ctx.restore()
}

function drawGhostMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, animFrame: number) {
  const bob = isMoving ? Math.sin(animFrame * 0.25) * 2 : 0
  ctx.globalAlpha = 0.75
  ctx.fillStyle = '#c0d8ff'
  ctx.beginPath(); ctx.ellipse(16, 14 + bob, 10, 12, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#a0c0e0'
  ctx.fillRect(6, 22 + bob, 20, 10)
  // Wavy bottom
  ctx.fillStyle = '#8090c0'
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(7 + i * 5, 32 + bob + Math.sin(animFrame * 0.2 + i) * 2, 3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = '#0a1a3a'; ctx.fillRect(11, 10 + bob, 4, 5); ctx.fillRect(17, 10 + bob, 4, 5)
  ctx.globalAlpha = 1
}

function drawVampireMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, animFrame: number) {
  const walk = isMoving ? Math.sin(animFrame * 0.3) * 2 : 0
  ctx.fillStyle = '#1a0a2a'; ctx.fillRect(10, 16, 12, 14)
  ctx.fillStyle = '#e0c8b0'; ctx.beginPath(); ctx.arc(16, 10, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2a0a0a'; ctx.beginPath()
  ctx.moveTo(8, 0); ctx.lineTo(12, 10); ctx.lineTo(16, 4)
  ctx.lineTo(20, 10); ctx.lineTo(24, 0); ctx.fill()
  ctx.fillStyle = '#ff1a1a'; ctx.fillRect(13, 12, 2, 3); ctx.fillRect(17, 12, 2, 3)
  ctx.fillStyle = '#800000'; ctx.fillRect(12, 15, 8, 2)
  ctx.fillStyle = '#3a0a4a'
  ctx.fillRect(4 + walk, 22, 8, 4); ctx.fillRect(20 - walk, 22, 8, 4)
}

function drawTreantMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, animFrame: number) {
  const sway = isMoving ? Math.sin(animFrame * 0.15) * 3 : 0
  ctx.fillStyle = '#2d1a0a'; ctx.fillRect(12, 14, 8, 16)
  ctx.fillStyle = '#3d2510'; ctx.fillRect(8 + sway, 8, 16, 14)
  ctx.fillStyle = '#1a3a10'
  ctx.beginPath(); ctx.moveTo(16 + sway, 0); ctx.lineTo(6, 14); ctx.lineTo(26, 14); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#143010'
  ctx.beginPath(); ctx.moveTo(16 + sway, 3); ctx.lineTo(4, 16); ctx.lineTo(28, 16); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#ff3000'; ctx.fillRect(10 + sway, 10, 4, 4); ctx.fillRect(18 + sway, 10, 4, 4)
  ctx.fillStyle = '#1f1006'; ctx.fillRect(6 - sway, 24, 6, 8); ctx.fillRect(20 + sway, 24, 6, 8)
}

// ─── Monster Drawings ────────────────────────────────────────────────────────

function drawSlimeMonster(ctx: CanvasRenderingContext2D, frame: number) {
  const bounce = Math.abs(Math.sin(frame * 0.08)) * 4
  const squish = 1 + bounce * 0.05
  // Body
  ctx.fillStyle = '#40cc60'
  ctx.beginPath()
  ctx.ellipse(16, 22 - bounce * 0.3, 12 * squish, 10 / squish, 0, 0, Math.PI * 2)
  ctx.fill()
  // Inner body
  ctx.fillStyle = '#60ee80'
  ctx.beginPath()
  ctx.ellipse(14, 20 - bounce * 0.3, 6, 5, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.ellipse(12, 18 - bounce * 0.3, 3, 2, -0.4, 0, Math.PI * 2)
  ctx.fill()
  // Eyes
  ctx.fillStyle = '#102010'
  ctx.fillRect(12, 19 - bounce * 0.3, 3, 3)
  ctx.fillRect(19, 19 - bounce * 0.3, 3, 3)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(12, 19 - bounce * 0.3, 1, 1)
  ctx.fillRect(19, 19 - bounce * 0.3, 1, 1)
  // Drip
  ctx.fillStyle = '#30aa50'
  ctx.fillRect(22, 24 - bounce * 0.3, 2, 4)
  ctx.fillRect(10, 26 - bounce * 0.3, 2, 3)
}

function drawSkeletonMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  // Legs
  const lSwing = isMoving ? Math.sin(frame * 0.4) * 4 : 0
  ctx.fillStyle = '#d4d0c8'
  ctx.fillRect(11, 21 + bob + lSwing, 4, 8)
  ctx.fillRect(17, 21 + bob - lSwing, 4, 8)
  // Knee joints
  ctx.fillStyle = '#b8b4aa'
  ctx.fillRect(12, 25 + bob + lSwing, 2, 2)
  ctx.fillRect(18, 25 + bob - lSwing, 2, 2)
  // Ribs
  ctx.fillStyle = '#dedad2'
  ctx.fillRect(10, 13 + bob, 12, 9)
  for (let r = 0; r < 3; r++) {
    ctx.fillStyle = '#2a2820'
    ctx.fillRect(11, 14 + r * 3 + bob, 10, 1)
  }
  // Spine
  ctx.fillStyle = '#c8c4bc'
  ctx.fillRect(15, 13 + bob, 2, 9)
  // Arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 4 : 0
  ctx.fillStyle = '#d4d0c8'
  ctx.fillRect(6, 14 + bob + armSwing, 4, 8)
  ctx.fillRect(22, 14 + bob - armSwing, 4, 8)
  // Boney hands
  ctx.fillStyle = '#dedad2'
  ctx.fillRect(5, 21 + bob + armSwing, 5, 3)
  ctx.fillRect(22, 21 + bob - armSwing, 5, 3)
  // Skull
  ctx.fillStyle = '#eeead8'
  ctx.fillRect(9, 4 + bob, 14, 12)
  ctx.fillRect(10, 3 + bob, 12, 2)
  ctx.fillRect(10, 15 + bob, 12, 2)
  // Dark jaw
  ctx.fillStyle = '#c8c4b0'
  ctx.fillRect(10, 11 + bob, 12, 5)
  // Eye sockets
  ctx.fillStyle = '#201e18'
  ctx.fillRect(10, 7 + bob, 4, 4)
  ctx.fillRect(18, 7 + bob, 4, 4)
  // Glowing eyes
  ctx.fillStyle = '#ff4000'
  ctx.fillRect(11, 8 + bob, 2, 2)
  ctx.fillRect(19, 8 + bob, 2, 2)
  // Teeth
  ctx.fillStyle = '#eeead8'
  for (let t = 0; t < 4; t++) ctx.fillRect(11 + t * 3, 14 + bob, 2, 3)
  ctx.fillStyle = '#c8c4b0'
  for (let t = 0; t < 4; t++) ctx.fillRect(11 + t * 3, 16 + bob, 2, 1)
  // Sword
  ctx.fillStyle = '#a0a090'
  ctx.fillRect(26, 10 + bob, 2, 14)
  ctx.fillStyle = '#c8c4b0'
  ctx.fillRect(23, 13 + bob, 8, 2)
}

function drawGoblinMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.5) * 2 : 0
  const atk = isAttacking ? 3 : 0
  // Legs
  ctx.fillStyle = '#5a7030'
  ctx.fillRect(11, 22 + bob, 4, 7)
  ctx.fillRect(17, 22 + bob, 4, 7)
  // Body
  ctx.fillStyle = '#6a8040'
  ctx.fillRect(9, 14 + bob, 14, 9)
  ctx.fillStyle = '#506030'
  ctx.fillRect(9, 14 + bob, 1, 9); ctx.fillRect(22, 14 + bob, 1, 9)
  // Leather vest
  ctx.fillStyle = '#4a3010'
  ctx.fillRect(10, 15 + bob, 12, 7)
  ctx.fillStyle = '#6a5020'
  ctx.fillRect(12, 16 + bob, 8, 5)
  // Arms
  ctx.fillStyle = '#6a8040'
  ctx.fillRect(5, 14 + bob, 5, 9)
  ctx.fillRect(22, 14 + bob, 5, 9)
  // Claws
  ctx.fillStyle = '#c0b080'
  ctx.fillRect(4, 22 + bob, 2, 3); ctx.fillRect(6, 22 + bob, 2, 3); ctx.fillRect(8, 22 + bob, 2, 3)
  ctx.fillRect(22, 22 + bob, 2, 3); ctx.fillRect(24, 22 + bob, 2, 3); ctx.fillRect(26, 22 + bob, 2, 3)
  // Neck
  ctx.fillStyle = '#6a8040'
  ctx.fillRect(14, 10 + bob, 4, 5)
  // Big head
  ctx.fillStyle = '#6a8040'
  ctx.fillRect(8, 3 + bob, 16, 10)
  ctx.fillStyle = '#5a7030'
  ctx.fillRect(8, 3 + bob, 1, 10); ctx.fillRect(23, 3 + bob, 1, 10)
  // Big ears
  ctx.fillStyle = '#6a8040'
  ctx.fillRect(4, 5 + bob, 5, 5)
  ctx.fillRect(23, 5 + bob, 5, 5)
  ctx.fillStyle = '#c06060'
  ctx.fillRect(5, 6 + bob, 3, 3)
  ctx.fillRect(24, 6 + bob, 3, 3)
  // Eyes
  ctx.fillStyle = '#ff8000'
  ctx.fillRect(10, 6 + bob, 4, 3)
  ctx.fillRect(18, 6 + bob, 4, 3)
  ctx.fillStyle = '#ffcc00'
  ctx.fillRect(11, 7 + bob, 2, 2); ctx.fillRect(19, 7 + bob, 2, 2)
  // Nose
  ctx.fillStyle = '#507030'
  ctx.fillRect(14, 9 + bob, 4, 2)
  ctx.fillRect(13, 10 + bob, 2, 2); ctx.fillRect(17, 10 + bob, 2, 2)
  // Pointy teeth
  ctx.fillStyle = '#eeead8'
  ctx.fillRect(11, 11 + bob, 2, 3); ctx.fillRect(19, 11 + bob, 2, 3)
  ctx.fillRect(14, 11 + bob, 2, 2); ctx.fillRect(16, 11 + bob, 2, 2)
  // Club
  ctx.fillStyle = '#6a4020'
  ctx.fillRect(26 + atk, 8 + bob, 3, 14)
  ctx.fillStyle = '#8a5030'
  ctx.fillRect(24 + atk, 6 + bob, 6, 5)
  ctx.fillStyle = '#504020'
  ctx.fillRect(25 + atk, 7 + bob, 1, 3)
}

function drawOrcMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.35) * 2 : 0
  // Massive legs
  ctx.fillStyle = '#405530'
  ctx.fillRect(9, 22 + bob, 6, 8)
  ctx.fillRect(17, 22 + bob, 6, 8)
  // Iron boots
  ctx.fillStyle = '#708090'
  ctx.fillRect(8, 27 + bob, 8, 3)
  ctx.fillRect(16, 27 + bob, 8, 3)
  // Huge body
  ctx.fillStyle = '#4a6038'
  ctx.fillRect(7, 12 + bob, 18, 11)
  // Armor plates
  ctx.fillStyle = '#707880'
  ctx.fillRect(8, 13 + bob, 16, 9)
  ctx.fillStyle = '#505860'
  ctx.fillRect(8, 13 + bob, 1, 9); ctx.fillRect(23, 13 + bob, 1, 9)
  ctx.fillStyle = '#909aa0'
  ctx.fillRect(9, 14 + bob, 6, 4); ctx.fillRect(17, 14 + bob, 6, 4)
  // Spiked pauldrons
  ctx.fillStyle = '#606870'
  ctx.fillRect(3, 11 + bob, 7, 6)
  ctx.fillRect(22, 11 + bob, 7, 6)
  ctx.fillStyle = '#c0c8d0'
  ctx.fillRect(4, 10 + bob, 2, 3); ctx.fillRect(7, 9 + bob, 2, 4)
  ctx.fillRect(24, 10 + bob, 2, 3); ctx.fillRect(27, 9 + bob, 2, 4)
  // Arms
  ctx.fillStyle = '#4a6038'
  ctx.fillRect(3, 13 + bob, 6, 10)
  ctx.fillRect(23, 13 + bob, 6, 10)
  // Fists
  ctx.fillStyle = '#506040'
  ctx.fillRect(2, 21 + bob, 7, 5); ctx.fillRect(23, 21 + bob, 7, 5)
  ctx.fillStyle = '#c0b080'
  for (let k = 0; k < 4; k++) {
    ctx.fillRect(3 + k * 2, 20 + bob, 1, 3)
    ctx.fillRect(24 + k * 2, 20 + bob, 1, 3)
  }
  // Neck
  ctx.fillStyle = '#4a6038'
  ctx.fillRect(13, 8 + bob, 6, 5)
  // Big ugly head
  ctx.fillStyle = '#4a6038'
  ctx.fillRect(8, 2 + bob, 16, 9)
  ctx.fillStyle = '#3a5028'
  ctx.fillRect(8, 2 + bob, 1, 9); ctx.fillRect(23, 2 + bob, 1, 9)
  // Brow ridge
  ctx.fillStyle = '#3a5028'
  ctx.fillRect(8, 6 + bob, 16, 2)
  // Eyes (beady red)
  ctx.fillStyle = '#cc2020'
  ctx.fillRect(10, 4 + bob, 3, 3); ctx.fillRect(19, 4 + bob, 3, 3)
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(11, 5 + bob, 1, 1); ctx.fillRect(20, 5 + bob, 1, 1)
  // Tusks
  ctx.fillStyle = '#ece8d8'
  ctx.fillRect(11, 9 + bob, 2, 4); ctx.fillRect(19, 9 + bob, 2, 4)
  ctx.fillStyle = '#c8c4a8'
  ctx.fillRect(12, 9 + bob, 1, 3); ctx.fillRect(20, 9 + bob, 1, 3)
  // Axe
  ctx.fillStyle = '#8a6020'
  ctx.fillRect(26, 6 + bob, 2, 18)
  ctx.fillStyle = '#808890'
  ctx.fillRect(24, 4 + bob, 8, 8)
  ctx.fillStyle = '#a0a8b0'
  ctx.fillRect(25, 5 + bob, 6, 5)
  ctx.fillStyle = '#c0c8d0'
  ctx.fillRect(26, 5 + bob, 3, 2)
}

function drawWolfMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.abs(Math.sin(frame * 0.5)) * 3 : 0
  // Back legs
  ctx.fillStyle = '#787060'
  ctx.fillRect(6, 20 + bob, 5, 10)
  ctx.fillRect(21, 20 + bob, 5, 10)
  // Paws
  ctx.fillStyle = '#908878'
  ctx.fillRect(5, 28 + bob, 6, 3); ctx.fillRect(20, 28 + bob, 6, 3)
  // Body (elongated)
  ctx.fillStyle = '#888078'
  ctx.fillRect(5, 14 + bob, 22, 10)
  // Back
  ctx.fillStyle = '#706860'
  ctx.fillRect(5, 14 + bob, 22, 3)
  // Belly
  ctx.fillStyle = '#a09888'
  ctx.fillRect(8, 20 + bob, 16, 4)
  // Front legs
  const legSwing = isMoving ? Math.sin(frame * 0.5) * 5 : 0
  ctx.fillStyle = '#787060'
  ctx.fillRect(8, 21 + bob + legSwing, 4, 9)
  ctx.fillRect(20, 21 + bob - legSwing, 4, 9)
  ctx.fillStyle = '#908878'
  ctx.fillRect(7, 28 + bob + legSwing, 5, 3); ctx.fillRect(19, 28 + bob - legSwing, 5, 3)
  // Claws
  ctx.fillStyle = '#202018'
  for (let c = 0; c < 3; c++) {
    ctx.fillRect(7 + c * 2, 30 + bob + legSwing, 1, 2)
    ctx.fillRect(19 + c * 2, 30 + bob - legSwing, 1, 2)
  }
  // Neck
  ctx.fillStyle = '#888078'
  ctx.fillRect(22, 10 + bob, 7, 7)
  // Head (wolf shape)
  ctx.fillStyle = '#888078'
  ctx.fillRect(22, 4 + bob, 8, 9)
  ctx.fillStyle = '#706860'
  ctx.fillRect(22, 4 + bob, 8, 3)
  // Snout
  ctx.fillStyle = '#989090'
  ctx.fillRect(27, 9 + bob, 5, 5)
  ctx.fillStyle = '#202018'
  ctx.fillRect(30, 8 + bob, 2, 2)
  // Eyes
  ctx.fillStyle = '#ffaa00'
  ctx.fillRect(23, 6 + bob, 3, 3)
  ctx.fillStyle = '#202010'
  ctx.fillRect(24, 7 + bob, 1, 1)
  // Ears
  ctx.fillStyle = '#706860'
  ctx.fillRect(22, 1 + bob, 3, 5)
  ctx.fillRect(26, 0 + bob, 3, 5)
  ctx.fillStyle = '#c06060'
  ctx.fillRect(23, 2 + bob, 1, 3); ctx.fillRect(27, 1 + bob, 1, 3)
  // Teeth
  ctx.fillStyle = '#f0ece0'
  ctx.fillRect(28, 12 + bob, 2, 3)
  ctx.fillRect(30, 12 + bob, 2, 3)
  // Tail
  ctx.fillStyle = '#888078'
  ctx.fillRect(1, 12 + bob, 6, 4)
  ctx.fillRect(0, 9 + bob, 3, 5)
  ctx.fillStyle = '#f0ece0'
  ctx.fillRect(0, 9 + bob, 2, 3)
}

function drawSpiderMonster(ctx: CanvasRenderingContext2D, frame: number) {
  const legWave = Math.sin(frame * 0.15) * 3
  // Legs (4 pairs)
  const legPositions = [4, 8, 22, 26]
  legPositions.forEach((lx, i) => {
    const side = i < 2 ? -1 : 1
    const ly = 16 + Math.sin(frame * 0.15 + i) * 2
    ctx.strokeStyle = '#2a2010'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(16, 20)
    ctx.quadraticCurveTo(lx + side * 4, ly, lx, ly + 8)
    ctx.stroke()
  })
  // Abdomen
  ctx.fillStyle = '#2a2010'
  ctx.beginPath()
  ctx.ellipse(12, 22, 10, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#403020'
  ctx.beginPath()
  ctx.ellipse(10, 20, 6, 5, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // Red stripes
  ctx.fillStyle = '#cc2020'
  ctx.fillRect(6, 21, 12, 2)
  ctx.fillRect(5, 24, 14, 1)
  // Thorax
  ctx.fillStyle = '#302418'
  ctx.beginPath()
  ctx.ellipse(20, 18, 7, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#484030'
  ctx.beginPath()
  ctx.ellipse(19, 17, 4, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // 8 eyes
  const eyePos = [[17,14],[20,13],[23,14],[16,17],[24,17]]
  eyePos.forEach(([ex, ey]) => {
    ctx.fillStyle = '#ff2000'
    ctx.fillRect(ex, ey, 2, 2)
    ctx.fillStyle = '#ff8060'
    ctx.fillRect(ex, ey, 1, 1)
  })
  // Fangs
  ctx.fillStyle = '#c0b080'
  ctx.fillRect(18, 21, 2, 4)
  ctx.fillRect(21, 21, 2, 4)
  ctx.fillStyle = '#806040'
  ctx.fillRect(18, 24, 2, 1); ctx.fillRect(21, 24, 2, 1)
}

function drawZombieMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.3) * 2 : 0
  const sway = isMoving ? Math.sin(frame * 0.15) * 3 : 0
  // Legs (shambling)
  ctx.fillStyle = '#3a4020'
  ctx.fillRect(11, 22 + bob, 4, 8)
  ctx.fillRect(17, 22 + bob, 4, 8)
  // Torn clothes
  ctx.fillStyle = '#404838'
  ctx.fillRect(9, 13 + bob, 14, 10)
  ctx.fillStyle = '#303828'
  ctx.fillRect(9, 13 + bob, 1, 10); ctx.fillRect(22, 13 + bob, 1, 10)
  // Wounds / torn bits
  ctx.fillStyle = '#8a1010'
  ctx.fillRect(12, 15 + bob, 3, 2); ctx.fillRect(17, 18 + bob, 2, 3)
  // Arms (outstretched)
  ctx.fillStyle = '#4a5038'
  ctx.fillRect(2, 12 + bob + sway, 8, 5)
  ctx.fillRect(22, 12 + bob - sway, 8, 5)
  // Rotten hands
  ctx.fillStyle = '#3a4028'
  ctx.fillRect(0, 14 + bob + sway, 4, 4)
  ctx.fillRect(28, 14 + bob - sway, 4, 4)
  ctx.fillStyle = '#c0b080'
  for (let f = 0; f < 3; f++) {
    ctx.fillRect(0 + f * 2, 13 + bob + sway, 1, 4)
    ctx.fillRect(28 + f * 2, 13 + bob - sway, 1, 4)
  }
  // Neck
  ctx.fillStyle = '#4a5038'
  ctx.fillRect(14, 9 + bob, 4, 5)
  // Rotten head
  ctx.fillStyle = '#606850'
  ctx.fillRect(9, 2 + bob, 14, 10)
  ctx.fillStyle = '#505840'
  ctx.fillRect(9, 2 + bob, 1, 10); ctx.fillRect(22, 2 + bob, 1, 10)
  // Exposed skull top
  ctx.fillStyle = '#d8d4c0'
  ctx.fillRect(11, 1 + bob, 10, 4)
  // Sunken eyes
  ctx.fillStyle = '#1a1810'
  ctx.fillRect(10, 6 + bob, 5, 4)
  ctx.fillRect(17, 6 + bob, 5, 4)
  ctx.fillStyle = '#ffcc00'
  ctx.fillRect(12, 7 + bob, 2, 2); ctx.fillRect(19, 7 + bob, 2, 2)
  // Rotting mouth
  ctx.fillStyle = '#1a1810'
  ctx.fillRect(11, 10 + bob, 10, 3)
  ctx.fillStyle = '#d8d4c0'
  for (let t = 0; t < 4; t++) ctx.fillRect(12 + t * 3, 9 + bob, 1, 4)
}

function drawDemonMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const glowPulse = Math.sin(frame * 0.12) * 0.5 + 0.5
  // Aura
  ctx.fillStyle = `rgba(180,0,0,${0.08 + glowPulse * 0.08})`
  ctx.beginPath(); ctx.arc(16, 16, 20, 0, Math.PI * 2); ctx.fill()
  // Hooves
  ctx.fillStyle = '#1a1010'
  ctx.fillRect(9, 27 + bob, 7, 5)
  ctx.fillRect(16, 27 + bob, 7, 5)
  // Legs
  ctx.fillStyle = '#6a0a0a'
  ctx.fillRect(10, 20 + bob, 5, 8)
  ctx.fillRect(17, 20 + bob, 5, 8)
  // Body
  ctx.fillStyle = '#8a1010'
  ctx.fillRect(7, 11 + bob, 18, 10)
  ctx.fillStyle = '#600808'
  ctx.fillRect(7, 11 + bob, 1, 10); ctx.fillRect(24, 11 + bob, 1, 10)
  // Chest runes
  ctx.fillStyle = `rgba(255,80,0,${0.6 + glowPulse * 0.4})`
  ctx.fillRect(10, 13 + bob, 3, 3); ctx.fillRect(16, 14 + bob, 3, 2); ctx.fillRect(21, 12 + bob, 2, 4)
  // Spiky pauldrons
  ctx.fillStyle = '#6a0a0a'
  ctx.fillRect(3, 10 + bob, 6, 7)
  ctx.fillRect(23, 10 + bob, 6, 7)
  ctx.fillStyle = '#c02020'
  ctx.fillRect(4, 7 + bob, 2, 5); ctx.fillRect(7, 8 + bob, 2, 4)
  ctx.fillRect(23, 7 + bob, 2, 5); ctx.fillRect(26, 8 + bob, 2, 4)
  // Arms
  ctx.fillStyle = '#7a1010'
  ctx.fillRect(2, 12 + bob, 6, 10)
  ctx.fillRect(24, 12 + bob, 6, 10)
  // Claws
  ctx.fillStyle = '#c01010'
  ctx.fillRect(1, 20 + bob, 7, 4)
  ctx.fillRect(24, 20 + bob, 7, 4)
  ctx.fillStyle = '#d4a020'
  for (let c = 0; c < 4; c++) {
    ctx.fillRect(1 + c * 2, 19 + bob, 1, 4)
    ctx.fillRect(24 + c * 2, 19 + bob, 1, 4)
  }
  // Wings (folded)
  ctx.fillStyle = '#400000'
  ctx.fillRect(0, 8 + bob, 8, 14)
  ctx.fillRect(24, 8 + bob, 8, 14)
  ctx.fillStyle = '#300000'
  for (let w = 0; w < 5; w++) {
    ctx.fillRect(0, 9 + w * 3 + bob, 8, 1)
    ctx.fillRect(24, 9 + w * 3 + bob, 8, 1)
  }
  // Neck
  ctx.fillStyle = '#7a1010'
  ctx.fillRect(13, 7 + bob, 6, 5)
  // Horned head
  ctx.fillStyle = '#8a1010'
  ctx.fillRect(9, 1 + bob, 14, 9)
  // Horns
  ctx.fillStyle = '#c8a020'
  ctx.fillRect(9, -5 + bob, 3, 8); ctx.fillRect(20, -5 + bob, 3, 8)
  ctx.fillRect(8, -3 + bob, 2, 5); ctx.fillRect(22, -3 + bob, 2, 5)
  ctx.fillStyle = '#ffcc40'
  ctx.fillRect(10, -5 + bob, 1, 6); ctx.fillRect(21, -5 + bob, 1, 6)
  // Eyes
  ctx.fillStyle = '#ff4000'
  ctx.fillRect(10, 3 + bob, 5, 4)
  ctx.fillRect(17, 3 + bob, 5, 4)
  ctx.fillStyle = `rgba(255,120,0,${0.7 + glowPulse * 0.3})`
  ctx.fillRect(11, 4 + bob, 3, 2); ctx.fillRect(18, 4 + bob, 3, 2)
  // Fangs
  ctx.fillStyle = '#ffe0a0'
  ctx.fillRect(11, 8 + bob, 2, 4); ctx.fillRect(19, 8 + bob, 2, 4)
  ctx.fillRect(14, 8 + bob, 2, 3)
}

function drawDragonMonster(ctx: CanvasRenderingContext2D, frame: number) {
  const breath = Math.sin(frame * 0.1) * 2
  const wingFlap = Math.sin(frame * 0.08) * 6
  // Tail
  ctx.fillStyle = '#1a4a10'
  ctx.fillRect(0, 20, 8, 6)
  ctx.fillRect(2, 18, 5, 4)
  ctx.fillRect(4, 15, 4, 5)
  // Back legs
  ctx.fillStyle = '#2a6018'
  ctx.fillRect(8, 22, 7, 9)
  ctx.fillRect(18, 22, 7, 9)
  // Clawed feet
  ctx.fillStyle = '#c8a020'
  ctx.fillRect(6, 29, 3, 3); ctx.fillRect(9, 30, 3, 3)
  ctx.fillRect(17, 29, 3, 3); ctx.fillRect(20, 30, 3, 3)
  // Body (massive)
  ctx.fillStyle = '#2a6018'
  ctx.fillRect(5, 13, 22, 12)
  ctx.fillStyle = '#206010'
  ctx.fillRect(5, 13, 1, 12); ctx.fillRect(26, 13, 1, 12)
  // Belly scales (lighter)
  ctx.fillStyle = '#80a860'
  ctx.fillRect(9, 17, 14, 8)
  for (let s = 0; s < 5; s++) {
    ctx.fillStyle = '#609040'
    ctx.fillRect(9 + s * 3, 17, 2, 8)
  }
  // Wings
  ctx.fillStyle = '#1a3a10'
  ctx.fillRect(-2, 8 + wingFlap * 0.5, 10, 10)
  ctx.fillRect(24, 8 + wingFlap * 0.5, 10, 10)
  ctx.fillStyle = '#304820'
  ctx.fillRect(0, 9 + wingFlap * 0.5, 6, 7)
  ctx.fillRect(26, 9 + wingFlap * 0.5, 6, 7)
  // Wing membrane lines
  for (let w = 0; w < 4; w++) {
    ctx.fillStyle = '#1a3010'
    ctx.fillRect(-2 + w * 3, 8 + wingFlap * 0.5, 1, 10)
    ctx.fillRect(24 + w * 3, 8 + wingFlap * 0.5, 1, 10)
  }
  // Front arms
  ctx.fillStyle = '#2a6018'
  ctx.fillRect(7, 15, 5, 9)
  ctx.fillRect(20, 15, 5, 9)
  ctx.fillStyle = '#c8a020'
  for (let c = 0; c < 3; c++) {
    ctx.fillRect(6 + c * 2, 22, 1, 4)
    ctx.fillRect(21 + c * 2, 22, 1, 4)
  }
  // Neck
  ctx.fillStyle = '#2a6018'
  ctx.fillRect(12, 7, 8, 8)
  // Ridge spines
  ctx.fillStyle = '#c8a020'
  for (let r = 0; r < 3; r++) {
    ctx.fillRect(14 + r * 2, 4 + r, 2, 6)
  }
  // Big head
  ctx.fillStyle = '#2a6018'
  ctx.fillRect(8, 1, 18, 9)
  ctx.fillStyle = '#1a4a10'
  ctx.fillRect(8, 1, 1, 9); ctx.fillRect(25, 1, 1, 9)
  // Brow horns
  ctx.fillStyle = '#c8a020'
  ctx.fillRect(9, -2, 3, 5); ctx.fillRect(22, -2, 3, 5)
  ctx.fillStyle = '#ffcc40'
  ctx.fillRect(10, -2, 1, 4); ctx.fillRect(23, -2, 1, 4)
  // Snout
  ctx.fillStyle = '#307018'
  ctx.fillRect(22, 6, 10, 6)
  // Nostrils
  ctx.fillStyle = '#102808'
  ctx.fillRect(23, 7, 2, 2); ctx.fillRect(27, 7, 2, 2)
  // Eyes
  ctx.fillStyle = '#ff8000'
  ctx.fillRect(10, 3, 5, 5); ctx.fillRect(17, 3, 5, 5)
  ctx.fillStyle = '#ffcc40'
  ctx.fillRect(11, 4, 3, 3); ctx.fillRect(18, 4, 3, 3)
  ctx.fillStyle = '#101008'
  ctx.fillRect(12, 5, 2, 2); ctx.fillRect(19, 5, 2, 2)
  // Fire breath
  if (breath > 0) {
    for (let f = 0; f < 5; f++) {
      ctx.fillStyle = `rgba(255,${100 + f * 30},0,${0.6 - f * 0.1})`
      ctx.beginPath()
      ctx.ellipse(28 + f * 5, 9 + breath, 4 - f * 0.3, 3, 0.3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // Teeth
  ctx.fillStyle = '#f0ece0'
  for (let t = 0; t < 4; t++) ctx.fillRect(23 + t * 2, 10, 1, 3)
}

function drawTrollMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.3) * 3 : 0
  // Huge feet
  ctx.fillStyle = '#405838'
  ctx.fillRect(7, 28 + bob, 9, 4); ctx.fillRect(16, 28 + bob, 9, 4)
  // Thick legs
  ctx.fillStyle = '#507040'
  ctx.fillRect(8, 20 + bob, 8, 9); ctx.fillRect(16, 20 + bob, 8, 9)
  // Massive body
  ctx.fillStyle = '#608050'
  ctx.fillRect(4, 10 + bob, 24, 12)
  ctx.fillStyle = '#507040'
  ctx.fillRect(4, 10 + bob, 1, 12); ctx.fillRect(27, 10 + bob, 1, 12)
  // Mossy patches
  ctx.fillStyle = '#406030'
  ctx.fillRect(6, 12 + bob, 4, 4); ctx.fillRect(18, 15 + bob, 5, 3)
  ctx.fillRect(13, 11 + bob, 3, 5)
  // Huge arms
  ctx.fillStyle = '#507040'
  ctx.fillRect(0, 10 + bob, 6, 12)
  ctx.fillRect(26, 10 + bob, 6, 12)
  // Rock club
  ctx.fillStyle = '#707070'
  ctx.fillRect(26, 4 + bob, 5, 8)
  ctx.fillStyle = '#909090'
  ctx.fillRect(27, 5 + bob, 3, 6)
  ctx.fillRect(25, 2 + bob, 9, 4)
  // Fists
  ctx.fillStyle = '#607050'
  ctx.fillRect(0, 20 + bob, 6, 5); ctx.fillRect(26, 20 + bob, 6, 5)
  // Neck
  ctx.fillStyle = '#608050'
  ctx.fillRect(12, 6 + bob, 8, 5)
  // Boulder-like head
  ctx.fillStyle = '#608050'
  ctx.fillRect(7, -1 + bob, 18, 10)
  ctx.fillStyle = '#507040'
  ctx.fillRect(7, -1 + bob, 1, 10); ctx.fillRect(24, -1 + bob, 1, 10)
  // Mossy hair
  ctx.fillStyle = '#406030'
  ctx.fillRect(7, -1 + bob, 18, 2)
  ctx.fillRect(7, -3 + bob, 4, 4); ctx.fillRect(14, -4 + bob, 4, 5); ctx.fillRect(22, -3 + bob, 4, 4)
  // Tiny eyes
  ctx.fillStyle = '#cc2020'
  ctx.fillRect(10, 2 + bob, 3, 3); ctx.fillRect(19, 2 + bob, 3, 3)
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(11, 3 + bob, 1, 1); ctx.fillRect(20, 3 + bob, 1, 1)
  // Big flat nose
  ctx.fillStyle = '#406030'
  ctx.fillRect(13, 5 + bob, 6, 3)
  ctx.fillStyle = '#1a2010'
  ctx.fillRect(14, 6 + bob, 2, 2); ctx.fillRect(17, 6 + bob, 2, 2)
  // Ugly mouth
  ctx.fillStyle = '#202818'
  ctx.fillRect(9, 7 + bob, 14, 3)
  ctx.fillStyle = '#c0b880'
  ctx.fillRect(11, 6 + bob, 2, 4); ctx.fillRect(15, 6 + bob, 2, 4); ctx.fillRect(19, 6 + bob, 2, 4)
}

function drawWitchMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const glowPulse = Math.sin(frame * 0.1) * 0.5 + 0.5
  // Robe bottom
  ctx.fillStyle = '#1a0a2a'
  ctx.fillRect(6, 18 + bob, 20, 14)
  ctx.fillStyle = '#280a3a'
  ctx.fillRect(8, 19 + bob, 16, 12)
  // Stars on robe
  ctx.fillStyle = `rgba(180,140,255,${0.3 + glowPulse * 0.4})`
  ctx.fillRect(9, 22 + bob, 1, 1); ctx.fillRect(13, 25 + bob, 1, 1); ctx.fillRect(18, 21 + bob, 1, 1)
  ctx.fillRect(22, 26 + bob, 1, 1); ctx.fillRect(16, 28 + bob, 1, 1)
  // Body
  ctx.fillStyle = '#1a0a2a'
  ctx.fillRect(9, 12 + bob, 14, 7)
  ctx.fillStyle = '#280a3a'
  ctx.fillRect(10, 13 + bob, 12, 5)
  // Arms
  ctx.fillStyle = '#1a0a2a'
  ctx.fillRect(4, 12 + bob, 6, 8)
  ctx.fillRect(22, 12 + bob, 6, 8)
  // Wrinkled hands
  ctx.fillStyle = '#a08070'
  ctx.fillRect(3, 19 + bob, 6, 4)
  ctx.fillRect(23, 19 + bob, 6, 4)
  ctx.fillStyle = '#8a6858'
  for (let f = 0; f < 3; f++) {
    ctx.fillRect(4 + f * 2, 18 + bob, 1, 4)
    ctx.fillRect(24 + f * 2, 18 + bob, 1, 4)
  }
  // Spell orb
  ctx.fillStyle = `rgba(150,80,255,${0.5 + glowPulse * 0.5})`
  ctx.beginPath(); ctx.arc(26, 20 + bob, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = `rgba(200,160,255,${glowPulse})`
  ctx.beginPath(); ctx.arc(25, 19 + bob, 2, 0, Math.PI * 2); ctx.fill()
  // Neck
  ctx.fillStyle = '#b09080'
  ctx.fillRect(14, 8 + bob, 4, 5)
  // Face (old woman)
  ctx.fillStyle = '#b09080'
  ctx.fillRect(9, 4 + bob, 14, 9)
  ctx.fillStyle = '#a08070'
  ctx.fillRect(9, 4 + bob, 1, 9); ctx.fillRect(22, 4 + bob, 1, 9)
  // Wrinkles
  ctx.fillStyle = '#906858'
  ctx.fillRect(10, 9 + bob, 3, 1); ctx.fillRect(19, 9 + bob, 3, 1)
  ctx.fillRect(11, 7 + bob, 2, 1); ctx.fillRect(19, 7 + bob, 2, 1)
  // Hooked nose
  ctx.fillStyle = '#c0a090'
  ctx.fillRect(14, 8 + bob, 4, 3)
  ctx.fillRect(17, 10 + bob, 4, 2)
  // Eyes (glowing)
  ctx.fillStyle = '#ff8000'
  ctx.fillRect(10, 5 + bob, 4, 3)
  ctx.fillRect(18, 5 + bob, 4, 3)
  ctx.fillStyle = `rgba(255,180,0,${0.7 + glowPulse * 0.3})`
  ctx.fillRect(11, 6 + bob, 2, 2); ctx.fillRect(19, 6 + bob, 2, 2)
  // Green warts
  ctx.fillStyle = '#508030'
  ctx.fillRect(13, 8 + bob, 2, 2); ctx.fillRect(20, 6 + bob, 2, 2)
  // Pointy hat
  ctx.fillStyle = '#1a0a2a'
  ctx.fillRect(7, -1 + bob, 18, 7)
  ctx.fillRect(10, -4 + bob, 12, 4)
  ctx.fillRect(12, -7 + bob, 8, 4)
  ctx.fillRect(14, -9 + bob, 4, 3)
  ctx.fillRect(15, -10 + bob, 2, 2)
  ctx.fillStyle = '#8040c0'
  ctx.fillRect(7, 5 + bob, 18, 2)
  ctx.fillStyle = '#c09020'
  ctx.fillRect(14, 5 + bob, 4, 2)
}

function drawDarkKnightMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const atkOffset = isAttacking ? 4 : 0
  // Boots (black)
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(10, 24 + bob, 5, 6); ctx.fillRect(17, 24 + bob, 5, 6)
  ctx.fillStyle = '#202020'
  ctx.fillRect(10, 24 + bob, 5, 2); ctx.fillRect(17, 24 + bob, 5, 2)
  // Legs
  ctx.fillStyle = '#303840'
  ctx.fillRect(11, 18 + bob, 4, 7); ctx.fillRect(17, 18 + bob, 4, 7)
  // Dark plate armor
  ctx.fillStyle = '#202830'
  ctx.fillRect(9, 11 + bob, 14, 9)
  ctx.fillStyle = '#304048'
  ctx.fillRect(11, 12 + bob, 4, 6)
  ctx.fillStyle = '#101820'
  ctx.fillRect(9, 11 + bob, 1, 9); ctx.fillRect(22, 11 + bob, 1, 9)
  // Red trim
  ctx.fillStyle = '#aa1010'
  ctx.fillRect(9, 11 + bob, 14, 1); ctx.fillRect(9, 18 + bob, 14, 1)
  // Belt skull buckle
  ctx.fillStyle = '#282020'
  ctx.fillRect(9, 19 + bob, 14, 2)
  ctx.fillStyle = '#e0d0b0'
  ctx.fillRect(14, 19 + bob, 4, 2)
  ctx.fillStyle = '#101010'
  ctx.fillRect(15, 19 + bob, 1, 1); ctx.fillRect(17, 19 + bob, 1, 1)
  // Pauldrons (spiky)
  ctx.fillStyle = '#181e24'
  ctx.fillRect(5, 10 + bob, 6, 6)
  ctx.fillRect(21, 10 + bob, 6, 6)
  ctx.fillStyle = '#aa1010'
  ctx.fillRect(6, 8 + bob, 2, 4); ctx.fillRect(9, 7 + bob, 2, 5)
  ctx.fillRect(21, 8 + bob, 2, 4); ctx.fillRect(24, 7 + bob, 2, 5)
  // Arms
  ctx.fillStyle = '#202830'
  ctx.fillRect(5, 12 + bob, 5, 8)
  ctx.fillRect(22, 12 + bob, 5, 8)
  // Gauntlets
  ctx.fillStyle = '#181e24'
  ctx.fillRect(5, 18 + bob, 5, 4)
  ctx.fillRect(22, 18 + bob, 5, 4)
  // Neck
  ctx.fillStyle = '#3a3032'
  ctx.fillRect(14, 8 + bob, 4, 4)
  // Black helmet
  ctx.fillStyle = '#181e24'
  ctx.fillRect(9, 3 + bob, 14, 9)
  ctx.fillStyle = '#222c34'
  ctx.fillRect(11, 4 + bob, 5, 4)
  ctx.fillStyle = '#101820'
  ctx.fillRect(9, 3 + bob, 1, 9); ctx.fillRect(22, 3 + bob, 1, 9)
  // Visor (glowing red slit)
  ctx.fillStyle = '#100808'
  ctx.fillRect(10, 7 + bob, 12, 4)
  ctx.fillStyle = '#cc1010'
  ctx.fillRect(11, 8 + bob, 4, 1); ctx.fillRect(17, 8 + bob, 4, 1)
  ctx.fillStyle = '#ff2020'
  ctx.fillRect(12, 8 + bob, 2, 1); ctx.fillRect(18, 8 + bob, 2, 1)
  // Red plume
  ctx.fillStyle = '#880808'
  ctx.fillRect(14, 1 + bob, 4, 4)
  ctx.fillStyle = '#cc1010'
  ctx.fillRect(15, 0 + bob, 2, 4)
  // Red trim
  ctx.fillStyle = '#aa1010'
  ctx.fillRect(9, 3 + bob, 14, 1)
  // Dark sword
  ctx.fillStyle = '#303030'
  ctx.fillRect(24 + atkOffset, 10 + bob, 2, 16)
  ctx.fillStyle = '#404040'
  ctx.fillRect(24 + atkOffset, 10 + bob, 2, 10)
  ctx.fillStyle = '#aa1010'
  ctx.fillRect(21 + atkOffset, 14 + bob, 8, 2)
  ctx.fillStyle = '#880808'
  ctx.fillRect(25 + atkOffset, 10 + bob, 1, 8)
  // Shield (black with red cross)
  ctx.fillStyle = '#181010'
  ctx.fillRect(4, 12 + bob, 4, 10)
  ctx.fillStyle = '#cc1010'
  ctx.fillRect(5, 13 + bob, 2, 8)
  ctx.fillRect(4, 16 + bob, 4, 2)
}

function drawDarkArcherMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.45) * 2 : 0
  // Dark hood archer - compact, fast look
  // Boots
  ctx.fillStyle = '#180a00'
  ctx.fillRect(10, 24 + bob, 5, 6); ctx.fillRect(17, 24 + bob, 5, 6)
  // Legs
  ctx.fillStyle = '#202818'
  ctx.fillRect(11, 18 + bob, 4, 7); ctx.fillRect(17, 18 + bob, 4, 7)
  // Dark leather chest
  ctx.fillStyle = '#282010'
  ctx.fillRect(9, 11 + bob, 14, 9)
  ctx.fillStyle = '#382818'
  ctx.fillRect(11, 12 + bob, 5, 6)
  ctx.fillStyle = '#181008'
  ctx.fillRect(9, 11 + bob, 1, 9); ctx.fillRect(22, 11 + bob, 1, 9)
  // Quiver
  ctx.fillStyle = '#201808'
  ctx.fillRect(20, 9 + bob, 4, 12)
  ctx.fillStyle = '#402010'
  ctx.fillRect(21, 9 + bob, 2, 12)
  ctx.fillStyle = '#60a020'
  ctx.fillRect(21, 8 + bob, 1, 5)
  ctx.fillStyle = '#c06020'
  ctx.fillRect(23, 7 + bob, 1, 6)
  // Arms
  ctx.fillStyle = '#282010'
  ctx.fillRect(5, 12 + bob, 5, 9); ctx.fillRect(22, 12 + bob, 5, 9)
  // Bracers (dark)
  ctx.fillStyle = '#181008'
  ctx.fillRect(5, 17 + bob, 5, 3); ctx.fillRect(22, 17 + bob, 5, 3)
  // Neck
  ctx.fillStyle = '#b09080'
  ctx.fillRect(14, 8 + bob, 4, 4)
  // Dark hood
  ctx.fillStyle = '#181008'
  ctx.fillRect(9, 3 + bob, 14, 9)
  ctx.fillStyle = '#201810'
  ctx.fillRect(10, 4 + bob, 5, 5)
  // Face (shadowed)
  ctx.fillStyle = '#907868'
  ctx.fillRect(11, 7 + bob, 10, 5)
  ctx.fillStyle = '#ffaa00'
  ctx.fillRect(12, 7 + bob, 2, 2); ctx.fillRect(18, 7 + bob, 2, 2)
  ctx.fillStyle = '#101008'
  ctx.fillRect(12, 7 + bob, 1, 1); ctx.fillRect(18, 7 + bob, 1, 1)
  // Dark bow
  ctx.fillStyle = '#3a2810'
  ctx.fillRect(4, 6 + bob, 2, 20)
  ctx.fillStyle = '#604020'
  ctx.fillRect(4, 6 + bob, 1, 20)
  ctx.strokeStyle = '#807040'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(5, 7 + bob); ctx.lineTo(5, 25 + bob)
  ctx.stroke()
}

function drawDarkMageMonster(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const glowPulse = Math.sin(frame * 0.12) * 0.5 + 0.5
  // Dark robe
  ctx.fillStyle = '#080418'
  ctx.fillRect(6, 18 + bob, 20, 14)
  ctx.fillStyle = '#100820'
  ctx.fillRect(8, 19 + bob, 16, 12)
  // Arcane runes on robe (red)
  ctx.fillStyle = `rgba(180,20,20,${0.4 + glowPulse * 0.5})`
  ctx.fillRect(10, 22 + bob, 2, 2); ctx.fillRect(14, 26 + bob, 2, 1); ctx.fillRect(19, 23 + bob, 2, 2)
  ctx.fillRect(17, 28 + bob, 1, 1); ctx.fillRect(12, 29 + bob, 1, 1)
  // Body
  ctx.fillStyle = '#080418'
  ctx.fillRect(9, 12 + bob, 14, 7)
  // Arms
  ctx.fillStyle = '#080418'
  ctx.fillRect(4, 12 + bob, 6, 8); ctx.fillRect(22, 12 + bob, 6, 8)
  // Skull staff
  ctx.fillStyle = '#5a4020'
  ctx.fillRect(25, 4 + bob, 2, 24)
  ctx.fillStyle = '#c8b880'
  ctx.fillRect(23, 2 + bob, 6, 6)
  ctx.fillStyle = '#e0d8b0'
  ctx.fillRect(24, 3 + bob, 4, 4)
  ctx.fillStyle = '#201808'
  ctx.fillRect(24, 4 + bob, 1, 2); ctx.fillRect(27, 4 + bob, 1, 2)
  ctx.fillStyle = `rgba(180,20,20,${0.6 + glowPulse * 0.4})`
  ctx.fillRect(24, 4 + bob, 4, 2)
  // Pale hands
  ctx.fillStyle = '#c0b0a0'
  ctx.fillRect(3, 19 + bob, 6, 4); ctx.fillRect(23, 19 + bob, 6, 4)
  // Neck
  ctx.fillStyle = '#a09080'
  ctx.fillRect(14, 8 + bob, 4, 5)
  // Shadowed face / hood
  ctx.fillStyle = '#080418'
  ctx.fillRect(9, 2 + bob, 14, 11)
  ctx.fillStyle = '#100820'
  ctx.fillRect(10, 3 + bob, 12, 8)
  // Glowing eyes (red)
  ctx.fillStyle = `rgba(255,0,0,${0.7 + glowPulse * 0.3})`
  ctx.fillRect(11, 6 + bob, 4, 3); ctx.fillRect(17, 6 + bob, 4, 3)
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(12, 7 + bob, 2, 1); ctx.fillRect(18, 7 + bob, 2, 1)
  // Tall dark hood point
  ctx.fillStyle = '#080418'
  ctx.fillRect(10, -1 + bob, 12, 4)
  ctx.fillRect(12, -4 + bob, 8, 4)
  ctx.fillRect(14, -6 + bob, 4, 3)
  ctx.fillRect(15, -7 + bob, 2, 2)
  // Red trim
  ctx.fillStyle = '#880808'
  ctx.fillRect(9, 2 + bob, 14, 1)
}

// ─── New Class Sprites (unique per class) ──────────────────────────────────

function drawPaladin(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const attackOffset = isAttacking ? Math.sin(frame * 0.8) * 4 : 0
  const oy = bob
  const holy = 0.55 + Math.sin(frame * 0.12) * 0.15

  // Holy aura
  ctx.fillStyle = `rgba(255,230,140,${0.18 * holy})`
  ctx.beginPath(); ctx.ellipse(16, 18, 15, 15, 0, 0, Math.PI * 2); ctx.fill()
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Boots (white-gold)
  ctx.fillStyle = '#d8d2b8'
  ctx.fillRect(10, 24 + oy, 5, 6); ctx.fillRect(17, 24 + oy, 5, 6)
  ctx.fillStyle = '#f0e8c0'
  ctx.fillRect(10, 24 + oy, 5, 2); ctx.fillRect(17, 24 + oy, 5, 2)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(10, 28 + oy, 5, 1); ctx.fillRect(17, 28 + oy, 5, 1)

  // Legs (white tabard)
  ctx.fillStyle = '#f0ecd8'
  ctx.fillRect(11, 18 + oy, 4, 7); ctx.fillRect(17, 18 + oy, 4, 7)

  // Holy chest plate (ivory)
  ctx.fillStyle = '#f0ecd8'
  ctx.fillRect(9, 11 + oy, 14, 9)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(11, 12 + oy, 4, 6)
  ctx.fillStyle = '#b8b098'
  ctx.fillRect(9, 11 + oy, 1, 9); ctx.fillRect(22, 11 + oy, 1, 9)
  // Sun cross emblem
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(15, 13 + oy, 2, 6); ctx.fillRect(13, 15 + oy, 6, 2)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(15, 13 + oy, 2, 1); ctx.fillRect(13, 15 + oy, 1, 2)
  // Gold trim
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(9, 11 + oy, 14, 1); ctx.fillRect(9, 19 + oy, 14, 1)

  // Pauldrons (gold)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(6, 11 + oy, 5, 4); ctx.fillRect(21, 11 + oy, 5, 4)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(7, 11 + oy, 3, 2); ctx.fillRect(22, 11 + oy, 3, 2)

  // Arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#f0ecd8'
  ctx.fillRect(6, 12 + oy + armSwing, 4, 6); ctx.fillRect(22, 12 + oy - armSwing, 4, 6)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(6, 17 + oy + armSwing, 4, 3); ctx.fillRect(22, 17 + oy - armSwing, 4, 3)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 8 + oy, 4, 4)

  // Winged helmet
  ctx.fillStyle = '#e8e0c0'
  ctx.fillRect(9, 3 + oy, 14, 9)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(11, 4 + oy, 5, 4)
  ctx.fillStyle = '#a89870'
  ctx.fillRect(9, 3 + oy, 1, 9); ctx.fillRect(22, 3 + oy, 1, 9)
  // Visor
  ctx.fillStyle = '#403020'
  ctx.fillRect(10, 8 + oy, 12, 3)
  ctx.fillStyle = `rgba(255,220,120,${holy})`
  ctx.fillRect(11, 9 + oy, 4, 1); ctx.fillRect(17, 9 + oy, 4, 1)
  // Wings on helmet sides
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(4, 4 + oy, 5, 2); ctx.fillRect(23, 4 + oy, 5, 2)
  ctx.fillRect(5, 6 + oy, 3, 1); ctx.fillRect(24, 6 + oy, 3, 1)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(4, 4 + oy, 5, 1); ctx.fillRect(23, 4 + oy, 5, 1)
  // Gold halo above helmet
  ctx.strokeStyle = `rgba(255,220,120,${0.6 + holy * 0.4})`
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(16, 0 + oy, 5, 0, Math.PI * 2); ctx.stroke()

  // Warhammer
  if (direction !== 'up') {
    ctx.fillStyle = '#6a4828'
    ctx.fillRect(24 + attackOffset, 12 + oy, 2, 14)
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(22 + attackOffset, 9 + oy, 6, 5)
    ctx.fillStyle = '#ffe070'
    ctx.fillRect(22 + attackOffset, 9 + oy, 6, 1)
    ctx.fillRect(22 + attackOffset, 10 + oy, 1, 4)
  }
  // Round holy shield
  if (direction !== 'up') {
    ctx.fillStyle = '#d4a030'
    ctx.beginPath(); ctx.arc(6, 16 + oy, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f0ecd8'
    ctx.beginPath(); ctx.arc(6, 16 + oy, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(5, 14 + oy, 2, 5); ctx.fillRect(4, 15 + oy, 4, 2)
  }
}

function drawBerserker(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.45) * 2 : 0
  const rage = isAttacking ? Math.sin(frame * 0.9) * 5 : 0
  const oy = bob

  // Rage aura
  if (isAttacking) {
    ctx.fillStyle = `rgba(220,40,40,${0.25 + Math.sin(frame * 0.4) * 0.1})`
    ctx.beginPath(); ctx.ellipse(16, 18, 15, 15, 0, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Bare furred boots
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(10, 24 + oy, 5, 6); ctx.fillRect(17, 24 + oy, 5, 6)
  ctx.fillStyle = '#6a4828'
  ctx.fillRect(10, 24 + oy, 5, 2); ctx.fillRect(17, 24 + oy, 5, 2)
  // Fur trim
  ctx.fillStyle = '#a08868'
  ctx.fillRect(9, 23 + oy, 7, 1); ctx.fillRect(16, 23 + oy, 7, 1)

  // Bare muscular legs
  ctx.fillStyle = '#c8a080'
  ctx.fillRect(11, 18 + oy, 4, 7); ctx.fillRect(17, 18 + oy, 4, 7)
  ctx.fillStyle = '#a88060'
  ctx.fillRect(11, 21 + oy, 4, 1); ctx.fillRect(17, 21 + oy, 4, 1)
  // Fur loincloth
  ctx.fillStyle = '#3a2818'
  ctx.fillRect(10, 17 + oy, 12, 4)
  ctx.fillStyle = '#5a4028'
  ctx.fillRect(11, 17 + oy, 10, 1)

  // Bare chest with warpaint
  ctx.fillStyle = '#c8a080'
  ctx.fillRect(9, 11 + oy, 14, 7)
  ctx.fillStyle = '#a88060'
  ctx.fillRect(10, 14 + oy, 12, 1); ctx.fillRect(10, 17 + oy, 12, 1)
  // Pecs definition
  ctx.fillStyle = '#b89070'
  ctx.fillRect(11, 12 + oy, 4, 3); ctx.fillRect(17, 12 + oy, 4, 3)
  // Red warpaint stripes
  ctx.fillStyle = '#aa1010'
  ctx.fillRect(12, 12 + oy, 2, 5); ctx.fillRect(18, 12 + oy, 2, 5)
  ctx.fillRect(14, 13 + oy, 4, 1)

  // Pauldron (single, spiked)
  ctx.fillStyle = '#403020'
  ctx.fillRect(6, 11 + oy, 5, 4); ctx.fillRect(21, 11 + oy, 5, 4)
  ctx.fillStyle = '#808080'
  ctx.fillRect(5, 9 + oy, 2, 3); ctx.fillRect(8, 8 + oy, 2, 4); ctx.fillRect(25, 9 + oy, 2, 3); ctx.fillRect(22, 8 + oy, 2, 4)

  // Bulky arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#c8a080'
  ctx.fillRect(5, 12 + oy + armSwing, 5, 8); ctx.fillRect(22, 12 + oy - armSwing, 5, 8)
  ctx.fillStyle = '#a88060'
  ctx.fillRect(5, 16 + oy + armSwing, 5, 1); ctx.fillRect(22, 16 + oy - armSwing, 5, 1)
  // Arm bands
  ctx.fillStyle = '#6a4828'
  ctx.fillRect(5, 14 + oy + armSwing, 5, 1); ctx.fillRect(22, 14 + oy - armSwing, 5, 1)

  // Neck/face
  ctx.fillStyle = '#c8a080'
  ctx.fillRect(13, 7 + oy, 6, 5)
  // War paint on face
  ctx.fillStyle = '#aa1010'
  ctx.fillRect(13, 8 + oy, 6, 1)
  // Eyes (rageful)
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(13, 9 + oy, 2, 2); ctx.fillRect(17, 9 + oy, 2, 2)

  // Wild hair / mohawk
  ctx.fillStyle = '#3a1808'
  ctx.fillRect(11, 4 + oy, 10, 4)
  ctx.fillStyle = '#5a2810'
  ctx.fillRect(13, 5 + oy, 6, 2)
  // Mohawk spikes
  ctx.fillStyle = '#3a1808'
  ctx.fillRect(13, 1 + oy, 2, 4); ctx.fillRect(16, 0 + oy, 2, 5); ctx.fillRect(19, 2 + oy, 2, 4)
  // Beard
  ctx.fillStyle = '#3a1808'
  ctx.fillRect(13, 10 + oy, 6, 3); ctx.fillRect(14, 12 + oy, 4, 2)

  // Two-handed great axe (right side)
  if (direction !== 'up') {
    ctx.fillStyle = '#5a3818'
    ctx.fillRect(26 + rage, 6 + oy, 2, 24)
    ctx.fillStyle = '#808080'
    // Axe blade
    ctx.fillRect(24 + rage, 5 + oy, 8, 8)
    ctx.fillStyle = '#a8a8a8'
    ctx.fillRect(24 + rage, 5 + oy, 8, 2)
    ctx.fillStyle = '#606060'
    ctx.fillRect(24 + rage, 11 + oy, 8, 2)
    // Blood drip
    if (isAttacking) {
      ctx.fillStyle = '#a00000'
      ctx.fillRect(25 + rage, 13 + oy, 1, 3); ctx.fillRect(29 + rage, 13 + oy, 1, 2)
    }
  }
}

function drawAssassin(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.5) * 2 : 0
  const slash = isAttacking ? Math.sin(frame * 1.0) * 5 : 0
  const oy = bob

  // Stealthy fade shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath(); ctx.ellipse(16, 30, 6, 2, 0, 0, Math.PI * 2); ctx.fill()

  // Boots
  ctx.fillStyle = '#0a0a18'
  ctx.fillRect(10, 24 + oy, 5, 6); ctx.fillRect(17, 24 + oy, 5, 6)
  ctx.fillStyle = '#1a1a30'
  ctx.fillRect(10, 24 + oy, 5, 2); ctx.fillRect(17, 24 + oy, 5, 2)
  ctx.fillStyle = '#5a2080'
  ctx.fillRect(10, 28 + oy, 5, 1); ctx.fillRect(17, 28 + oy, 5, 1)

  // Tight legs
  ctx.fillStyle = '#181828'
  ctx.fillRect(11, 18 + oy, 4, 7); ctx.fillRect(17, 18 + oy, 4, 7)
  // Throwing knife strap
  ctx.fillStyle = '#3a2050'
  ctx.fillRect(11, 21 + oy, 4, 1); ctx.fillRect(17, 21 + oy, 4, 1)

  // Chest (dark leather)
  ctx.fillStyle = '#1a1a2a'
  ctx.fillRect(9, 11 + oy, 14, 9)
  ctx.fillStyle = '#2a2a3a'
  ctx.fillRect(11, 12 + oy, 4, 6)
  ctx.fillStyle = '#0a0a18'
  ctx.fillRect(9, 11 + oy, 1, 9); ctx.fillRect(22, 11 + oy, 1, 9)
  // Crossed straps
  ctx.fillStyle = '#3a2050'
  ctx.fillRect(10, 11 + oy, 12, 1)
  ctx.fillStyle = '#5a2080'
  ctx.fillRect(15, 13 + oy, 2, 5)
  // Belt with throwing knives
  ctx.fillStyle = '#3a2050'
  ctx.fillRect(9, 19 + oy, 14, 2)
  ctx.fillStyle = '#a8a8c0'
  ctx.fillRect(10, 20 + oy, 1, 1); ctx.fillRect(13, 20 + oy, 1, 1); ctx.fillRect(19, 20 + oy, 1, 1); ctx.fillRect(22, 20 + oy, 1, 1)

  // Slim arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#181828'
  ctx.fillRect(6, 12 + oy + armSwing, 4, 7); ctx.fillRect(22, 12 + oy - armSwing, 4, 7)
  // Wrist guards
  ctx.fillStyle = '#5a2080'
  ctx.fillRect(6, 17 + oy + armSwing, 4, 2); ctx.fillRect(22, 17 + oy - armSwing, 4, 2)
  // Gloves
  ctx.fillStyle = '#0a0a18'
  ctx.fillRect(6, 18 + oy + armSwing, 4, 2); ctx.fillRect(22, 18 + oy - armSwing, 4, 2)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 8 + oy, 4, 3)

  // Hood
  ctx.fillStyle = '#0c0c1a'
  ctx.fillRect(8, 3 + oy, 16, 10)
  ctx.fillStyle = '#1a1a2c'
  ctx.fillRect(10, 4 + oy, 12, 4)
  ctx.fillStyle = '#050510'
  ctx.fillRect(8, 3 + oy, 1, 10); ctx.fillRect(23, 3 + oy, 1, 10)
  // Hood point
  ctx.fillStyle = '#0c0c1a'
  ctx.fillRect(12, 0 + oy, 8, 4); ctx.fillRect(14, -2 + oy, 5, 2)

  // Face (with purple mask)
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(11, 7 + oy, 10, 6)
  // Mask covering nose/mouth
  ctx.fillStyle = '#5a2080'
  ctx.fillRect(11, 10 + oy, 10, 3)
  ctx.fillStyle = '#7a30a0'
  ctx.fillRect(11, 10 + oy, 10, 1)
  // Glowing purple eyes
  ctx.fillStyle = '#c060ff'
  ctx.fillRect(12, 8 + oy, 3, 2); ctx.fillRect(17, 8 + oy, 3, 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(13, 8 + oy, 1, 1); ctx.fillRect(18, 8 + oy, 1, 1)

  // Twin daggers
  if (direction !== 'up') {
    // Right dagger
    ctx.fillStyle = '#c0c0d0'
    ctx.fillRect(24 + slash, 14 + oy, 2, 8)
    ctx.fillStyle = '#e0e0f0'
    ctx.fillRect(24 + slash, 14 + oy, 1, 8)
    ctx.fillStyle = '#5a2080'
    ctx.fillRect(23 + slash, 21 + oy, 4, 2)
    // Left dagger
    ctx.fillStyle = '#c0c0d0'
    ctx.fillRect(6 - slash, 14 + oy, 2, 8)
    ctx.fillStyle = '#e0e0f0'
    ctx.fillRect(6 - slash, 14 + oy, 1, 8)
    ctx.fillStyle = '#5a2080'
    ctx.fillRect(5 - slash, 21 + oy, 4, 2)
    // Slash effect
    if (isAttacking) {
      ctx.strokeStyle = `rgba(180,80,220,${0.6 + Math.sin(frame * 0.5) * 0.3})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(26 + slash, 18 + oy, 4, -0.7, 0.7); ctx.stroke()
    }
  }
}

function drawDruid(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const natureGlow = isAttacking ? Math.sin(frame * 0.3) * 0.5 + 0.5 : 0.2
  const oy = bob

  // Nature aura
  ctx.fillStyle = `rgba(80,200,100,${0.12 + natureGlow * 0.15})`
  ctx.beginPath(); ctx.ellipse(16, 18, 14, 14, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Robe bottom (forest green with leaf trim)
  ctx.fillStyle = '#1a3818'
  ctx.fillRect(8, 18 + oy, 16, 12)
  ctx.fillStyle = '#284828'
  ctx.fillRect(10, 19 + oy, 5, 10)
  ctx.fillStyle = '#60a040'
  ctx.fillRect(8, 18 + oy, 16, 1)
  // Leaf hem
  ctx.fillStyle = '#80c060'
  ctx.fillRect(9, 28 + oy, 2, 2); ctx.fillRect(14, 28 + oy, 2, 2); ctx.fillRect(20, 28 + oy, 2, 2)

  // Main robe body
  ctx.fillStyle = '#244018'
  ctx.fillRect(9, 10 + oy, 14, 10)
  ctx.fillStyle = '#345028'
  ctx.fillRect(11, 11 + oy, 5, 8)
  ctx.fillStyle = '#143010'
  ctx.fillRect(9, 10 + oy, 1, 10); ctx.fillRect(22, 10 + oy, 1, 10)
  // Wood/bark sash
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(9, 18 + oy, 14, 2)
  // Acorn emblem
  ctx.fillStyle = '#8a5828'
  ctx.fillRect(14, 13 + oy, 4, 4)
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(14, 13 + oy, 4, 1)
  ctx.fillStyle = '#a87838'
  ctx.fillRect(15, 14 + oy, 1, 1)

  // Sleeves
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#244018'
  ctx.fillRect(5, 11 + oy + armSwing, 5, 9); ctx.fillRect(22, 11 + oy - armSwing, 5, 9)
  ctx.fillStyle = '#60a040'
  ctx.fillRect(5, 18 + oy + armSwing, 5, 1); ctx.fillRect(22, 18 + oy - armSwing, 5, 1)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 7 + oy, 4, 4)

  // Face
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(10, 5 + oy, 12, 6)
  ctx.fillStyle = '#b89878'
  ctx.fillRect(10, 9 + oy, 12, 2)
  // Eyes (green nature)
  ctx.fillStyle = '#308820'
  ctx.fillRect(12, 7 + oy, 2, 2); ctx.fillRect(18, 7 + oy, 2, 2)
  ctx.fillStyle = '#80f060'
  ctx.fillRect(12, 7 + oy, 1, 1); ctx.fillRect(18, 7 + oy, 1, 1)
  // Beard (mossy)
  ctx.fillStyle = '#506840'
  ctx.fillRect(11, 10 + oy, 10, 3); ctx.fillRect(12, 12 + oy, 8, 2)
  // Leaves in beard
  ctx.fillStyle = '#80c040'
  ctx.fillRect(13, 11 + oy, 1, 1); ctx.fillRect(18, 12 + oy, 1, 1)

  // Antler headdress
  ctx.fillStyle = '#8a5828'
  ctx.fillRect(8, 4 + oy, 3, 1); ctx.fillRect(21, 4 + oy, 3, 1)
  ctx.fillRect(7, 2 + oy, 2, 3); ctx.fillRect(23, 2 + oy, 2, 3)
  ctx.fillRect(5, 0 + oy, 2, 3); ctx.fillRect(25, 0 + oy, 2, 3)
  ctx.fillRect(9, 0 + oy, 1, 3); ctx.fillRect(22, 0 + oy, 1, 3)
  // Bone circlet
  ctx.fillStyle = '#d8d2bc'
  ctx.fillRect(10, 4 + oy, 12, 1)
  ctx.fillStyle = '#80c040'
  ctx.fillRect(15, 3 + oy, 2, 1)

  // Living wood staff with leaves
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(26, 4 + oy, 2, 26)
  ctx.fillStyle = '#7a4828'
  ctx.fillRect(26, 4 + oy, 1, 26)
  // Twigs
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(28, 10 + oy, 3, 1); ctx.fillRect(24, 16 + oy, 2, 1)
  // Leaves bunch on top
  ctx.fillStyle = '#60a040'
  ctx.fillRect(23, 1 + oy, 4, 4); ctx.fillRect(27, 0 + oy, 3, 3); ctx.fillRect(25, -1 + oy, 3, 2)
  ctx.fillStyle = `rgba(140,240,100,${0.6 + natureGlow * 0.4})`
  ctx.fillRect(25, 1 + oy, 3, 2)
  // Glowing seed
  ctx.fillStyle = `rgba(220,255,180,${natureGlow})`
  ctx.beginPath(); ctx.arc(26, 2 + oy, 1.5, 0, Math.PI * 2); ctx.fill()
}

function drawMonk(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.45) * 2 : 0
  const chi = isAttacking ? 0.5 + Math.sin(frame * 0.6) * 0.4 : 0.2 + Math.sin(frame * 0.1) * 0.1
  const punch = isAttacking ? Math.sin(frame * 1.2) * 5 : 0
  const oy = bob

  // Chi aura
  ctx.fillStyle = `rgba(255,160,40,${0.12 + chi * 0.15})`
  ctx.beginPath(); ctx.ellipse(16, 18, 14, 14, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()

  // Bare feet / sandals
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(10, 26 + oy, 5, 4); ctx.fillRect(17, 26 + oy, 5, 4)
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(10, 28 + oy, 5, 2); ctx.fillRect(17, 28 + oy, 5, 2)
  ctx.fillStyle = '#3a2010'
  ctx.fillRect(12, 25 + oy, 1, 3); ctx.fillRect(19, 25 + oy, 1, 3)

  // Bare lower legs
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(11, 22 + oy, 4, 4); ctx.fillRect(17, 22 + oy, 4, 4)

  // Orange robe wrapped
  ctx.fillStyle = '#c84818'
  ctx.fillRect(8, 14 + oy, 16, 10)
  ctx.fillStyle = '#e86838'
  ctx.fillRect(10, 15 + oy, 6, 8)
  ctx.fillStyle = '#a03808'
  ctx.fillRect(8, 14 + oy, 1, 10); ctx.fillRect(23, 14 + oy, 1, 10)
  // Yellow trim
  ctx.fillStyle = '#f0c040'
  ctx.fillRect(8, 14 + oy, 16, 1); ctx.fillRect(8, 23 + oy, 16, 1)
  // Diagonal sash
  ctx.fillStyle = '#f0c040'
  ctx.fillRect(9, 16 + oy, 14, 2)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(9, 16 + oy, 14, 1)

  // Bare arms (muscular)
  const armSwing = isMoving ? Math.sin(frame * 0.45) * 3 : 0
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(5 - punch, 14 + oy + armSwing, 5, 8)
  ctx.fillRect(22 + punch, 14 + oy - armSwing, 5, 8)
  ctx.fillStyle = '#b89878'
  ctx.fillRect(5 - punch, 18 + oy + armSwing, 5, 1)
  ctx.fillRect(22 + punch, 18 + oy - armSwing, 5, 1)
  // Wrist wraps (white)
  ctx.fillStyle = '#e8e0c0'
  ctx.fillRect(5 - punch, 20 + oy + armSwing, 5, 2)
  ctx.fillRect(22 + punch, 20 + oy - armSwing, 5, 2)

  // Glowing fists
  if (direction !== 'up') {
    ctx.fillStyle = `rgba(255,180,60,${0.4 + chi * 0.5})`
    ctx.beginPath(); ctx.arc(7 - punch, 23 + oy, 4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(25 + punch, 23 + oy, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(255,240,160,${chi})`
    ctx.beginPath(); ctx.arc(7 - punch, 23 + oy, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(25 + punch, 23 + oy, 2, 0, Math.PI * 2); ctx.fill()
    // Fist
    ctx.fillStyle = '#c8a888'
    ctx.fillRect(5 - punch, 22 + oy, 4, 3); ctx.fillRect(23 + punch, 22 + oy, 4, 3)
  }

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 8 + oy, 4, 4)
  // Prayer beads necklace
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(12, 11 + oy, 1, 1); ctx.fillRect(14, 12 + oy, 1, 1); ctx.fillRect(16, 12 + oy, 1, 1); ctx.fillRect(18, 12 + oy, 1, 1); ctx.fillRect(19, 11 + oy, 1, 1)

  // Bald head
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(10, 3 + oy, 12, 9)
  ctx.fillStyle = '#b89878'
  ctx.fillRect(10, 10 + oy, 12, 2)
  // Head shine
  ctx.fillStyle = '#e0c8a8'
  ctx.fillRect(11, 3 + oy, 6, 2)
  // Ear
  ctx.fillStyle = '#b89878'
  ctx.fillRect(9, 7 + oy, 1, 3); ctx.fillRect(22, 7 + oy, 1, 3)
  // Forehead dots (tattoos)
  ctx.fillStyle = '#4020c0'
  ctx.fillRect(13, 5 + oy, 1, 1); ctx.fillRect(15, 4 + oy, 1, 1); ctx.fillRect(17, 4 + oy, 1, 1); ctx.fillRect(19, 5 + oy, 1, 1)
  // Eyes (closed/meditative)
  ctx.fillStyle = '#3a2818'
  ctx.fillRect(12, 8 + oy, 3, 1); ctx.fillRect(17, 8 + oy, 3, 1)
  // Calm mouth
  ctx.fillStyle = '#8a5848'
  ctx.fillRect(14, 11 + oy, 4, 1)
}

function drawSamurai(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const slash = isAttacking ? Math.sin(frame * 0.8) * 6 : 0
  const oy = bob

  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Boots (tabi)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(10, 24 + oy, 5, 6); ctx.fillRect(17, 24 + oy, 5, 6)
  ctx.fillStyle = '#e8e0c0'
  ctx.fillRect(10, 28 + oy, 5, 2); ctx.fillRect(17, 28 + oy, 5, 2)

  // Lamellar leg armor (red lacquer)
  ctx.fillStyle = '#8a1010'
  ctx.fillRect(11, 18 + oy, 4, 7); ctx.fillRect(17, 18 + oy, 4, 7)
  ctx.fillStyle = '#1a1a1a'
  for (let r = 0; r < 3; r++) {
    ctx.fillRect(11, 19 + r * 2 + oy, 4, 1); ctx.fillRect(17, 19 + r * 2 + oy, 4, 1)
  }
  // Gold rivets
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(12, 21 + oy, 1, 1); ctx.fillRect(18, 21 + oy, 1, 1)

  // Lamellar chest plate
  ctx.fillStyle = '#a01818'
  ctx.fillRect(9, 11 + oy, 14, 9)
  ctx.fillStyle = '#c02828'
  ctx.fillRect(11, 12 + oy, 4, 6)
  ctx.fillStyle = '#600808'
  ctx.fillRect(9, 11 + oy, 1, 9); ctx.fillRect(22, 11 + oy, 1, 9)
  // Black lacing rows
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(9, 13 + oy, 14, 1); ctx.fillRect(9, 15 + oy, 14, 1); ctx.fillRect(9, 17 + oy, 14, 1)
  // Gold mon (family crest) circle
  ctx.fillStyle = '#d4a030'
  ctx.beginPath(); ctx.arc(16, 15 + oy, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(15, 14 + oy, 2, 1)
  // Obi belt
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(9, 19 + oy, 14, 2)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(9, 20 + oy, 14, 1)

  // Sode (shoulder guards)
  ctx.fillStyle = '#8a1010'
  ctx.fillRect(5, 11 + oy, 6, 6); ctx.fillRect(21, 11 + oy, 6, 6)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(5, 13 + oy, 6, 1); ctx.fillRect(5, 15 + oy, 6, 1)
  ctx.fillRect(21, 13 + oy, 6, 1); ctx.fillRect(21, 15 + oy, 6, 1)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(5, 11 + oy, 6, 1); ctx.fillRect(21, 11 + oy, 6, 1)

  // Arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(6, 17 + oy + armSwing, 4, 5); ctx.fillRect(22, 17 + oy - armSwing, 4, 5)
  // Kote (forearm guards)
  ctx.fillStyle = '#404040'
  ctx.fillRect(6, 19 + oy + armSwing, 4, 3); ctx.fillRect(22, 19 + oy - armSwing, 4, 3)
  ctx.fillStyle = '#606060'
  ctx.fillRect(6, 19 + oy + armSwing, 1, 3); ctx.fillRect(25, 19 + oy - armSwing, 1, 3)

  // Neck
  ctx.fillStyle = '#c8a888'
  ctx.fillRect(14, 9 + oy, 4, 3)

  // Kabuto helmet (horned)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(8, 3 + oy, 16, 9)
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(10, 4 + oy, 12, 6)
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(8, 3 + oy, 1, 9); ctx.fillRect(23, 3 + oy, 1, 9)
  // Neck guard (shikoro)
  ctx.fillStyle = '#8a1010'
  ctx.fillRect(7, 9 + oy, 18, 3)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(7, 10 + oy, 18, 1)
  // Golden crest (maedate)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(14, 1 + oy, 4, 3); ctx.fillRect(15, 0 + oy, 2, 1)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(15, 1 + oy, 2, 1)
  // Demonic horns
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(6, 1 + oy, 2, 4); ctx.fillRect(4, 0 + oy, 2, 3); ctx.fillRect(24, 1 + oy, 2, 4); ctx.fillRect(26, 0 + oy, 2, 3)

  // Menpo (demon face mask)
  ctx.fillStyle = '#403028'
  ctx.fillRect(10, 7 + oy, 12, 4)
  ctx.fillStyle = '#605040'
  ctx.fillRect(11, 7 + oy, 10, 1)
  // Red mouth slit (snarling)
  ctx.fillStyle = '#a01010'
  ctx.fillRect(13, 10 + oy, 6, 1)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(13, 10 + oy, 1, 1); ctx.fillRect(15, 10 + oy, 1, 1); ctx.fillRect(17, 10 + oy, 1, 1)
  // Glowing eyes through visor
  ctx.fillStyle = '#ff4040'
  ctx.fillRect(12, 6 + oy, 3, 2); ctx.fillRect(17, 6 + oy, 3, 2)
  ctx.fillStyle = '#ffa0a0'
  ctx.fillRect(13, 6 + oy, 1, 1); ctx.fillRect(18, 6 + oy, 1, 1)

  // Katana (curved sheath then unsheathed when attacking)
  if (direction !== 'up') {
    if (isAttacking) {
      // Drawn blade with slash
      ctx.fillStyle = '#e8e8f0'
      ctx.fillRect(24 + slash, 10 + oy, 2, 16)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(24 + slash, 10 + oy, 1, 16)
      // Tsuba (guard)
      ctx.fillStyle = '#d4a030'
      ctx.fillRect(22 + slash, 25 + oy, 6, 2)
      // Tsuka (handle)
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(24 + slash, 26 + oy, 2, 4)
      // Motion arc
      ctx.strokeStyle = `rgba(220,240,255,${0.5 + Math.sin(frame * 0.3) * 0.3})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(26 + slash, 16 + oy, 6, -1.0, 0.5); ctx.stroke()
    } else {
      // Sheathed katana on hip
      ctx.fillStyle = '#1a1a3a'
      ctx.fillRect(2, 19 + oy, 8, 2)
      ctx.fillStyle = '#2a2a5a'
      ctx.fillRect(2, 19 + oy, 8, 1)
      ctx.fillStyle = '#d4a030'
      ctx.fillRect(9, 19 + oy, 2, 2)
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(11, 19 + oy, 3, 2)
    }
  }
}

// ── Summoner ───────────────────────────────────────────────────────────────
function drawSummoner(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : Math.sin(frame * 0.08) * 0.8
  const float = Math.sin(frame * 0.06) * 1.2
  const oy = bob + float

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.32)'
  ctx.beginPath(); ctx.ellipse(16, 30, 9, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Floating glyph circle under feet
  const glow = 0.4 + Math.sin(frame * 0.12) * 0.2
  ctx.strokeStyle = `rgba(150,200,255,${glow})`
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(16, 30, 7, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = `rgba(200,160,255,${glow * 0.6})`
  for (let i = 0; i < 3; i++) {
    const a = frame * 0.04 + i * (Math.PI * 2 / 3)
    ctx.beginPath()
    ctx.moveTo(16 + Math.cos(a) * 4, 30 + Math.sin(a) * 2)
    ctx.lineTo(16 + Math.cos(a) * 7, 30 + Math.sin(a) * 3)
    ctx.stroke()
  }

  // Long ceremonial robe (dark indigo with starfield)
  ctx.fillStyle = '#1a1840'
  ctx.fillRect(7, 17 + oy, 18, 13)
  ctx.fillStyle = '#251f60'
  ctx.fillRect(8, 18 + oy, 16, 11)
  ctx.fillStyle = '#0e0a28'
  ctx.fillRect(7, 28 + oy, 18, 2)
  // Star embroidery
  ctx.fillStyle = '#c0d0ff'
  ctx.fillRect(11, 21 + oy, 1, 1); ctx.fillRect(19, 23 + oy, 1, 1); ctx.fillRect(14, 25 + oy, 1, 1); ctx.fillRect(20, 19 + oy, 1, 1)
  // Gold sash
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(7, 19 + oy, 18, 1)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(7, 19 + oy, 18, 1)

  // Inner shirt collar
  ctx.fillStyle = '#3a3070'
  ctx.fillRect(12, 13 + oy, 8, 5)
  ctx.fillStyle = '#5040a0'
  ctx.fillRect(13, 14 + oy, 6, 3)

  // Shoulders / mantle
  ctx.fillStyle = '#100828'
  ctx.fillRect(5, 14 + oy, 22, 4)
  ctx.fillStyle = '#251a55'
  ctx.fillRect(5, 14 + oy, 22, 1)
  // Gold clasp at chest (skull pendant)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(15, 17 + oy, 2, 2)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(15, 17 + oy, 1, 1)

  // Arms (sleeves wide at wrist)
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  ctx.fillStyle = '#1a1840'
  ctx.fillRect(4, 16 + oy + armSwing, 4, 6); ctx.fillRect(24, 16 + oy - armSwing, 4, 6)
  ctx.fillStyle = '#251f60'
  ctx.fillRect(3, 20 + oy + armSwing, 5, 3); ctx.fillRect(24, 20 + oy - armSwing, 5, 3)
  // Skin hands
  ctx.fillStyle = '#d8b890'
  ctx.fillRect(4, 22 + oy + armSwing, 3, 2); ctx.fillRect(25, 22 + oy - armSwing, 3, 2)

  // Head — pale, ascetic
  ctx.fillStyle = '#e8d4b0'
  ctx.fillRect(11, 5 + oy, 10, 9)
  ctx.fillStyle = '#c0a888'
  ctx.fillRect(11, 12 + oy, 10, 1)
  // Hooded cowl
  ctx.fillStyle = '#0a0420'
  ctx.fillRect(9, 3 + oy, 14, 6)
  ctx.fillStyle = '#1a1248'
  ctx.fillRect(10, 3 + oy, 12, 4)
  ctx.fillStyle = '#070218'
  ctx.fillRect(9, 3 + oy, 1, 6); ctx.fillRect(22, 3 + oy, 1, 6)
  // Shadow under hood (hides eyes mystery)
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(11, 7 + oy, 10, 3)
  // Glowing eyes
  ctx.fillStyle = '#80e8ff'
  ctx.fillRect(13, 8 + oy, 2, 1); ctx.fillRect(17, 8 + oy, 2, 1)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(13, 8 + oy, 1, 1); ctx.fillRect(17, 8 + oy, 1, 1)
  // Crown of stars
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(10, 2 + oy, 12, 1)
  ctx.fillStyle = '#ffe070'
  ctx.fillRect(11, 1 + oy, 1, 1); ctx.fillRect(15, 0 + oy, 1, 1); ctx.fillRect(19, 1 + oy, 1, 1)

  // Staff with orbiting orb (right hand)
  if (direction !== 'up') {
    const staffSwing = isAttacking ? Math.sin(frame * 0.7) * 4 : 0
    // Shaft
    ctx.fillStyle = '#3a2615'
    ctx.fillRect(26 + staffSwing, 4 + oy, 2, 24)
    ctx.fillStyle = '#5a3a22'
    ctx.fillRect(26 + staffSwing, 4 + oy, 1, 24)
    // Top fork
    ctx.fillStyle = '#d4a030'
    ctx.fillRect(25 + staffSwing, 2 + oy, 4, 2)
    ctx.fillRect(24 + staffSwing, 0 + oy, 2, 3); ctx.fillRect(28 + staffSwing, 0 + oy, 2, 3)
    // Floating orb (animated)
    const orbX = 27 + staffSwing + Math.cos(frame * 0.15) * 1.5
    const orbY = -1 + oy + Math.sin(frame * 0.15) * 1.5
    const orbGlow = 0.7 + Math.sin(frame * 0.2) * 0.25
    ctx.fillStyle = `rgba(140,200,255,${orbGlow})`
    ctx.beginPath(); ctx.arc(orbX, orbY, 3.2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(220,240,255,${orbGlow})`
    ctx.beginPath(); ctx.arc(orbX - 0.6, orbY - 0.6, 1.2, 0, Math.PI * 2); ctx.fill()
    // Aura ring during attack
    if (isAttacking) {
      ctx.strokeStyle = `rgba(160,210,255,${0.6 + Math.sin(frame * 0.4) * 0.3})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(orbX, orbY, 6 + Math.sin(frame * 0.3) * 2, 0, Math.PI * 2); ctx.stroke()
    }
  }

  // Floating spirit wisp companion (always present, behind)
  const wispX = 4 + Math.sin(frame * 0.08) * 2
  const wispY = 10 + oy + Math.cos(frame * 0.1) * 2
  ctx.fillStyle = 'rgba(160,210,255,0.55)'
  ctx.beginPath(); ctx.arc(wispX, wispY, 2.4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(230,240,255,0.85)'
  ctx.beginPath(); ctx.arc(wispX - 0.4, wispY - 0.4, 1, 0, Math.PI * 2); ctx.fill()
}

// ── Alchemist ──────────────────────────────────────────────────────────────
function drawAlchemist(
  ctx: CanvasRenderingContext2D,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  frame: number,
) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const oy = bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2); ctx.fill()

  // Leather boots
  ctx.fillStyle = '#3a2410'
  ctx.fillRect(10, 25 + oy, 5, 5); ctx.fillRect(17, 25 + oy, 5, 5)
  ctx.fillStyle = '#5a3818'
  ctx.fillRect(10, 25 + oy, 5, 1); ctx.fillRect(17, 25 + oy, 5, 1)
  // Brass buckles
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(12, 27 + oy, 1, 1); ctx.fillRect(19, 27 + oy, 1, 1)

  // Pants (dark green/brown)
  ctx.fillStyle = '#2a3a18'
  ctx.fillRect(11, 19 + oy, 4, 7); ctx.fillRect(17, 19 + oy, 4, 7)
  ctx.fillStyle = '#3a4a22'
  ctx.fillRect(11, 19 + oy, 4, 1); ctx.fillRect(17, 19 + oy, 4, 1)

  // Apron / long coat (mossy green leather)
  ctx.fillStyle = '#1f4020'
  ctx.fillRect(8, 11 + oy, 16, 14)
  ctx.fillStyle = '#2e5e2e'
  ctx.fillRect(9, 12 + oy, 14, 12)
  ctx.fillStyle = '#0f2810'
  ctx.fillRect(8, 11 + oy, 1, 14); ctx.fillRect(23, 11 + oy, 1, 14)
  // Apron seams
  ctx.fillStyle = '#163818'
  ctx.fillRect(15, 12 + oy, 1, 12); ctx.fillRect(16, 12 + oy, 1, 12)

  // Belt of vials (tiny colored bottles)
  ctx.fillStyle = '#1a1208'
  ctx.fillRect(8, 20 + oy, 16, 2)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(15, 20 + oy, 2, 2)
  // Vials: red, green, blue, yellow
  const vialColors = ['#c83030', '#40c060', '#4090e0', '#e0c040']
  for (let i = 0; i < 4; i++) {
    const vx = 9 + i * 4
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(vx, 17 + oy, 2, 3)
    ctx.fillStyle = vialColors[i]
    ctx.fillRect(vx, 18 + oy, 2, 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(vx, 17 + oy, 1, 1)
  }

  // Shoulders
  ctx.fillStyle = '#1f4020'
  ctx.fillRect(5, 11 + oy, 5, 5); ctx.fillRect(22, 11 + oy, 5, 5)
  ctx.fillStyle = '#3a6e3a'
  ctx.fillRect(5, 11 + oy, 5, 1); ctx.fillRect(22, 11 + oy, 5, 1)

  // Arms — sleeves
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#2e5e2e'
  ctx.fillRect(5, 16 + oy + armSwing, 5, 5); ctx.fillRect(22, 16 + oy - armSwing, 5, 5)
  // Gloves
  ctx.fillStyle = '#2a1808'
  ctx.fillRect(5, 21 + oy + armSwing, 5, 2); ctx.fillRect(22, 21 + oy - armSwing, 5, 2)

  // Neck
  ctx.fillStyle = '#d8b890'
  ctx.fillRect(14, 9 + oy, 4, 3)

  // Head
  ctx.fillStyle = '#e8d4b0'
  ctx.fillRect(10, 3 + oy, 12, 9)
  ctx.fillStyle = '#c0a888'
  ctx.fillRect(10, 11 + oy, 12, 1)
  // Wild messy hair (chemist style)
  ctx.fillStyle = '#3a2a18'
  ctx.fillRect(9, 2 + oy, 14, 4)
  ctx.fillStyle = '#5a4028'
  ctx.fillRect(10, 2 + oy, 12, 2)
  // Loose strands
  ctx.fillRect(8, 4 + oy, 1, 3); ctx.fillRect(23, 4 + oy, 1, 3)

  // Brass goggles on forehead
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(10, 5 + oy, 12, 3)
  ctx.fillStyle = '#d4a030'
  ctx.fillRect(10, 5 + oy, 12, 1)
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(11, 6 + oy, 4, 2); ctx.fillRect(17, 6 + oy, 4, 2)
  // Goggle glass shimmer
  ctx.fillStyle = '#80e0ff'
  ctx.fillRect(12, 7 + oy, 2, 1); ctx.fillRect(18, 7 + oy, 2, 1)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(12, 7 + oy, 1, 1); ctx.fillRect(18, 7 + oy, 1, 1)

  // Eyes (below goggles when not wearing)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(12, 9 + oy, 2, 1); ctx.fillRect(18, 9 + oy, 2, 1)
  // Smirk
  ctx.fillStyle = '#5a3018'
  ctx.fillRect(14, 11 + oy, 4, 1)

  // Held vial (bubbling potion in right hand)
  if (direction !== 'up') {
    const swing = isAttacking ? Math.sin(frame * 0.9) * 5 : 0
    // Bottle
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(25 + swing, 16 + oy, 4, 7)
    // Liquid (animated bubbles)
    const liquidColor = isAttacking ? '#ff6020' : '#40c060'
    ctx.fillStyle = liquidColor
    ctx.fillRect(26 + swing, 18 + oy, 2, 4)
    // Cork
    ctx.fillStyle = '#8a5a30'
    ctx.fillRect(26 + swing, 15 + oy, 2, 2)
    // Bubbles
    const b1 = (frame * 0.3) % 4
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillRect(26 + swing, 21 - b1 + oy, 1, 1)
    ctx.fillRect(27 + swing, 22 - ((frame * 0.4) % 5) + oy, 1, 1)
    // Glow when attacking (about to throw)
    if (isAttacking) {
      ctx.strokeStyle = `rgba(255,160,80,${0.5 + Math.sin(frame * 0.4) * 0.3})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(27 + swing, 19 + oy, 6, 0, Math.PI * 2); ctx.stroke()
    }
  }
}

// ── Snowy Mountain & Ancient Ruins tile drawings ───────────────────────────
export function drawSnowyMountainTile(ctx: CanvasRenderingContext2D, type: TileType, tick: number) {
  switch (type) {
    case 'pine_tree':
      ctx.fillStyle = '#dceaf0'; ctx.fillRect(0,0,S,S)
      // Trunk
      ctx.fillStyle = '#3a2410'; ctx.fillRect(14, 22, 4, 10)
      ctx.fillStyle = '#5a3818'; ctx.fillRect(14, 22, 1, 10)
      // Pine layers (triangular)
      ctx.fillStyle = '#0e3a1a'
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(4, 14); ctx.lineTo(28, 14); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#175024'
      ctx.beginPath(); ctx.moveTo(16, 4); ctx.lineTo(6, 18); ctx.lineTo(26, 18); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#1e6830'
      ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(8, 22); ctx.lineTo(24, 22); ctx.closePath(); ctx.fill()
      // Snow on tips
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(15, 1, 2, 1); ctx.fillRect(7, 13, 4, 1); ctx.fillRect(21, 13, 4, 1)
      ctx.fillRect(9, 17, 3, 1); ctx.fillRect(20, 17, 3, 1)
      ctx.fillRect(11, 21, 3, 1); ctx.fillRect(18, 21, 3, 1)
      break
    case 'snowy_peak':
      ctx.fillStyle = '#7a8aa0'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#9aaac0'
      ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(16, 4); ctx.lineTo(32, 32); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#bcccd8'
      ctx.beginPath(); ctx.moveTo(8, 32); ctx.lineTo(16, 12); ctx.lineTo(24, 32); ctx.closePath(); ctx.fill()
      // Snow cap
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.moveTo(12, 16); ctx.lineTo(16, 4); ctx.lineTo(20, 16); ctx.lineTo(18, 14); ctx.lineTo(16, 10); ctx.lineTo(14, 14); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#5a6a80'
      ctx.fillRect(2, 30, 28, 2)
      break
    case 'mountain_rock':
      ctx.fillStyle = '#d8e2ee'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#6a7280'
      ctx.fillRect(4, 10, 24, 18)
      ctx.fillStyle = '#8a92a0'
      ctx.fillRect(6, 12, 20, 14)
      ctx.fillStyle = '#4a5260'
      ctx.fillRect(4, 26, 24, 2)
      // Snow on top
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(4, 10, 24, 3); ctx.fillRect(8, 8, 16, 2); ctx.fillRect(12, 6, 8, 2)
      // Cracks
      ctx.fillStyle = '#3a424e'
      ctx.fillRect(12, 14, 1, 8); ctx.fillRect(18, 16, 1, 6)
      break
    case 'frost_grass':
      ctx.fillStyle = '#cad8e2'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#dde8f0'; ctx.fillRect(2, 2, 28, 28)
      // Tufts of frozen grass
      ctx.fillStyle = '#88a0a8'
      for (let i = 0; i < 6; i++) {
        const gx = (i * 7 + 3) % 28
        const gy = ((i * 11) + 4) % 26
        ctx.fillRect(gx, gy, 1, 3)
        ctx.fillRect(gx + 1, gy + 1, 1, 2)
      }
      // Sparkles
      const sp = (Math.sin(tick * 0.1) + 1) * 0.5
      ctx.fillStyle = `rgba(255,255,255,${0.5 + sp * 0.4})`
      ctx.fillRect(10, 8, 1, 1); ctx.fillRect(22, 18, 1, 1); ctx.fillRect(6, 24, 1, 1)
      break
    case 'snow_path':
      ctx.fillStyle = '#b8c4d0'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#a0acc0'; ctx.fillRect(2, 2, 28, 28)
      ctx.fillStyle = '#7a8aa0'
      ctx.fillRect(6, 8, 4, 2); ctx.fillRect(18, 14, 5, 3); ctx.fillRect(10, 22, 6, 2)
      // Footprints / texture
      ctx.fillStyle = '#909eb4'
      ctx.fillRect(14, 4, 3, 2); ctx.fillRect(20, 20, 3, 2)
      break
    case 'mountain_portal':
      ctx.fillStyle = '#b8c4d0'; ctx.fillRect(0,0,S,S)
      { const t = tick * 0.1
        ctx.fillStyle = `rgba(${140+Math.sin(t)*40},${200+Math.sin(t*1.2)*30},${230+Math.sin(t*0.8)*20},0.85)`
        ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = 'rgba(240,250,255,0.8)'
        ctx.beginPath(); ctx.arc(16,16,5,0,Math.PI*2); ctx.fill() }
      // Snowflake outline
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1
      for (let a = 0; a < 6; a++) {
        const ang = a * Math.PI / 3
        ctx.beginPath()
        ctx.moveTo(16, 16); ctx.lineTo(16 + Math.cos(ang) * 10, 16 + Math.sin(ang) * 10)
        ctx.stroke()
      }
      break
    case 'ice_crystal_node':
      ctx.fillStyle = '#cad8e2'; ctx.fillRect(0,0,S,S)
      { const t = tick * 0.08
        ctx.fillStyle = `rgba(${120+Math.sin(t)*40},${200+Math.sin(t*1.4)*30},${240+Math.sin(t*0.9)*20},0.85)`
        ctx.beginPath(); ctx.moveTo(16, 4); ctx.lineTo(24, 16); ctx.lineTo(16, 28); ctx.lineTo(8, 16); ctx.closePath(); ctx.fill()
        ctx.fillStyle = 'rgba(220,240,255,0.7)'
        ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(20, 16); ctx.lineTo(16, 24); ctx.lineTo(12, 16); ctx.closePath(); ctx.fill() }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(15, 10, 2, 4)
      break
    case 'frozen_campfire':
      ctx.fillStyle = '#b8c4d0'; ctx.fillRect(0,0,S,S)
      // Stones in circle
      ctx.fillStyle = '#5a6270'
      ctx.fillRect(6, 18, 4, 3); ctx.fillRect(22, 18, 4, 3); ctx.fillRect(14, 22, 4, 3); ctx.fillRect(12, 12, 3, 3); ctx.fillRect(18, 12, 3, 3)
      // Frozen logs (ice blue)
      ctx.fillStyle = '#a0c8d8'
      ctx.fillRect(8, 16, 16, 3); ctx.fillRect(12, 19, 8, 3)
      // Crystal flame frozen mid-air
      const flick = Math.sin(tick * 0.15) * 0.3 + 0.7
      ctx.fillStyle = `rgba(160,220,255,${flick})`
      ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(20, 14); ctx.lineTo(16, 18); ctx.lineTo(12, 14); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(15, 10, 2, 2)
      break
    default: return false
  }
  return true
}

export function drawAncientRuinsTile(ctx: CanvasRenderingContext2D, type: TileType, tick: number) {
  switch (type) {
    case 'ruin_pillar':
      ctx.fillStyle = '#2a2620'; ctx.fillRect(0,0,S,S)
      // Base
      ctx.fillStyle = '#6a6258'; ctx.fillRect(6, 26, 20, 5)
      ctx.fillStyle = '#4a4238'; ctx.fillRect(6, 30, 20, 1)
      // Column
      ctx.fillStyle = '#8a7e6a'; ctx.fillRect(11, 4, 10, 22)
      ctx.fillStyle = '#a89a82'; ctx.fillRect(11, 4, 2, 22); ctx.fillRect(19, 4, 2, 22)
      ctx.fillStyle = '#5a5040'; ctx.fillRect(14, 4, 4, 22)
      // Fluting (vertical grooves)
      ctx.fillStyle = '#3a3428'
      ctx.fillRect(13, 6, 1, 18); ctx.fillRect(15, 6, 1, 18); ctx.fillRect(17, 6, 1, 18)
      // Capital
      ctx.fillStyle = '#a89a82'; ctx.fillRect(8, 2, 16, 3)
      ctx.fillStyle = '#c8b890'; ctx.fillRect(8, 2, 16, 1)
      // Cracks
      ctx.fillStyle = '#2a2418'
      ctx.fillRect(15, 12, 1, 6); ctx.fillRect(16, 18, 2, 4)
      break
    case 'broken_tile':
      ctx.fillStyle = '#1a1610'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#3a3428'; ctx.fillRect(2, 2, 14, 14); ctx.fillRect(18, 18, 12, 12)
      ctx.fillStyle = '#4a4030'; ctx.fillRect(18, 2, 12, 14); ctx.fillRect(2, 18, 14, 10)
      // Cracks (chasm)
      ctx.fillStyle = '#080604'
      ctx.fillRect(16, 0, 2, 32); ctx.fillRect(0, 16, 32, 2)
      // Missing chunks
      ctx.fillStyle = '#080604'
      ctx.fillRect(5, 22, 4, 3); ctx.fillRect(24, 6, 3, 4)
      // Moss accents
      ctx.fillStyle = '#3a5024'
      ctx.fillRect(8, 8, 2, 1); ctx.fillRect(22, 26, 3, 1)
      break
    case 'vine_wall':
      ctx.fillStyle = '#1f1a14'; ctx.fillRect(0,0,S,S)
      // Stone wall
      ctx.fillStyle = '#4a4030'; ctx.fillRect(0, 0, S, 18)
      ctx.fillStyle = '#3a3024'; ctx.fillRect(0, 8, 16, 1); ctx.fillRect(16, 16, 16, 1)
      ctx.fillStyle = '#5a4e3a'; ctx.fillRect(2, 2, 12, 6); ctx.fillRect(18, 10, 12, 6); ctx.fillRect(2, 10, 12, 6); ctx.fillRect(18, 2, 12, 6)
      // Vines dripping down (animated sway)
      const sway = Math.sin(tick * 0.05) * 1
      ctx.fillStyle = '#1a3a14'
      ctx.fillRect(5 + sway, 0, 1, 22); ctx.fillRect(14, 0, 1, 28); ctx.fillRect(22 - sway, 0, 1, 24); ctx.fillRect(28, 0, 1, 18)
      ctx.fillStyle = '#2a5a1e'
      ctx.fillRect(5 + sway, 0, 1, 12); ctx.fillRect(14, 0, 1, 14); ctx.fillRect(22 - sway, 0, 1, 10)
      // Leaves
      ctx.fillStyle = '#3a7028'
      ctx.fillRect(4 + sway, 14, 3, 2); ctx.fillRect(13, 18, 3, 2); ctx.fillRect(21 - sway, 12, 3, 2); ctx.fillRect(27, 10, 3, 2)
      break
    case 'sarcophagus':
      ctx.fillStyle = '#1a1612'; ctx.fillRect(0,0,S,S)
      // Stone box
      ctx.fillStyle = '#5a5040'; ctx.fillRect(4, 8, 24, 20)
      ctx.fillStyle = '#7a6e58'; ctx.fillRect(4, 8, 24, 2)
      ctx.fillStyle = '#3a3224'; ctx.fillRect(4, 26, 24, 2)
      // Lid carving (face/symbol)
      ctx.fillStyle = '#3a3224'
      ctx.fillRect(12, 12, 8, 12)
      ctx.fillStyle = '#d4a030'
      // Ankh-like glyph
      ctx.fillRect(15, 13, 2, 8)
      ctx.fillRect(13, 16, 6, 2)
      ctx.beginPath(); ctx.arc(16, 12, 2, 0, Math.PI * 2); ctx.fill()
      // Glowing seam (cursed)
      const glow = 0.4 + Math.sin(tick * 0.08) * 0.3
      ctx.fillStyle = `rgba(180,80,200,${glow})`
      ctx.fillRect(4, 18, 24, 1)
      // Corner damage
      ctx.fillStyle = '#1a1612'
      ctx.fillRect(4, 8, 3, 2); ctx.fillRect(26, 26, 2, 2)
      break
    case 'ancient_tile':
      ctx.fillStyle = '#2a2418'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#4a4030'; ctx.fillRect(1, 1, 30, 30)
      ctx.fillStyle = '#5a4e38'; ctx.fillRect(3, 3, 26, 26)
      // Mosaic pattern
      ctx.fillStyle = '#8a6e3a'
      ctx.fillRect(6, 6, 4, 4); ctx.fillRect(22, 6, 4, 4); ctx.fillRect(6, 22, 4, 4); ctx.fillRect(22, 22, 4, 4)
      ctx.fillStyle = '#d4a030'
      ctx.fillRect(14, 14, 4, 4)
      ctx.fillStyle = '#ffe070'
      ctx.fillRect(15, 15, 2, 2)
      // Cross lines
      ctx.fillStyle = '#3a3024'
      ctx.fillRect(0, 16, 32, 1); ctx.fillRect(16, 0, 1, 32)
      break
    case 'ruins_portal':
      ctx.fillStyle = '#1a1612'; ctx.fillRect(0,0,S,S)
      // Stone arch frame
      ctx.fillStyle = '#5a5040'
      ctx.fillRect(2, 4, 4, 28); ctx.fillRect(26, 4, 4, 28); ctx.fillRect(2, 4, 28, 4)
      ctx.fillStyle = '#7a6e58'
      ctx.fillRect(2, 4, 4, 1); ctx.fillRect(26, 4, 4, 1)
      // Portal energy
      { const t = tick * 0.09
        ctx.fillStyle = `rgba(${200+Math.sin(t)*30},${160+Math.sin(t*1.2)*30},${80+Math.sin(t*0.8)*20},0.85)`
        ctx.beginPath(); ctx.arc(16,18,10,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = 'rgba(255,230,160,0.75)'
        ctx.beginPath(); ctx.arc(16,18,4,0,Math.PI*2); ctx.fill() }
      // Glowing runes around frame
      const rg = 0.5 + Math.sin(tick * 0.12) * 0.3
      ctx.fillStyle = `rgba(255,200,100,${rg})`
      ctx.fillRect(3, 14, 2, 1); ctx.fillRect(27, 14, 2, 1); ctx.fillRect(14, 5, 4, 1)
      break
    case 'rune_stone':
      ctx.fillStyle = '#2a2418'; ctx.fillRect(0,0,S,S)
      ctx.fillStyle = '#3a342a'; ctx.fillRect(6, 4, 20, 26)
      ctx.fillStyle = '#5a4e3a'; ctx.fillRect(6, 4, 20, 2)
      ctx.fillStyle = '#1a1612'; ctx.fillRect(6, 28, 20, 2)
      // Glowing runes
      const rg2 = 0.4 + Math.sin(tick * 0.1) * 0.3
      ctx.fillStyle = `rgba(140,200,255,${rg2})`
      // Rune 1
      ctx.fillRect(10, 8, 2, 6); ctx.fillRect(12, 8, 4, 2); ctx.fillRect(12, 12, 4, 2)
      // Rune 2
      ctx.fillRect(18, 16, 2, 6); ctx.fillRect(20, 16, 3, 2); ctx.fillRect(20, 20, 3, 2)
      // Rune 3
      ctx.fillRect(11, 22, 8, 2); ctx.fillRect(14, 24, 2, 2)
      break
    case 'ancient_brazier':
      ctx.fillStyle = '#1a1612'; ctx.fillRect(0,0,S,S)
      // Pedestal
      ctx.fillStyle = '#5a5040'; ctx.fillRect(10, 20, 12, 10)
      ctx.fillStyle = '#3a3024'; ctx.fillRect(10, 28, 12, 2)
      ctx.fillStyle = '#7a6e58'; ctx.fillRect(10, 20, 12, 1)
      // Bowl
      ctx.fillStyle = '#4a4030'; ctx.fillRect(8, 16, 16, 5)
      ctx.fillStyle = '#6a5e48'; ctx.fillRect(8, 16, 16, 1)
      // Eternal flame (cyan-purple cursed fire)
      const flick = Math.sin(tick * 0.2) * 2
      ctx.fillStyle = '#8040c0'
      ctx.beginPath(); ctx.moveTo(12, 16); ctx.lineTo(16, 4 + flick); ctx.lineTo(20, 16); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#c080ff'
      ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(16, 6 + flick); ctx.lineTo(18, 14); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(15, 9 + flick, 2, 3)
      break
    default: return false
  }
  return true
}


// ─── Chronomancer ──────────────────────────────────────────────────────────
function drawChronomancer(ctx: CanvasRenderingContext2D, direction: Direction, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const glow = isAttacking ? Math.sin(frame * 0.3) * 0.5 + 0.5 : 0
  const oy = bob
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()
  // temporal aura — clock ring rotating
  const ring = 0.3 + Math.sin(frame * 0.1) * 0.1 + glow * 0.3
  ctx.fillStyle = `rgba(120,180,255,${ring * 0.25})`
  ctx.beginPath(); ctx.ellipse(16, 18, 16, 16, 0, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = `rgba(180,220,255,${0.4 + glow * 0.5})`
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + frame * 0.02
    const x1 = 16 + Math.cos(a) * 14, y1 = 18 + Math.sin(a) * 14
    const x2 = 16 + Math.cos(a) * 12, y2 = 18 + Math.sin(a) * 12
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }
  // robe
  ctx.fillStyle = '#0d1840'; ctx.fillRect(8, 18 + oy, 16, 12)
  ctx.fillStyle = '#1a2a70'; ctx.fillRect(10, 19 + oy, 5, 10)
  ctx.fillStyle = '#3060c0'; ctx.fillRect(8, 18 + oy, 1, 12); ctx.fillRect(23, 18 + oy, 1, 12)
  // body
  ctx.fillStyle = '#142a60'; ctx.fillRect(9, 10 + oy, 14, 10)
  ctx.fillStyle = '#2050b0'; ctx.fillRect(11, 11 + oy, 5, 8)
  // chest hourglass
  ctx.fillStyle = '#80d0ff'; ctx.fillRect(14, 13 + oy, 4, 1); ctx.fillRect(15, 14 + oy, 2, 1)
  ctx.fillRect(15, 15 + oy, 2, 1); ctx.fillRect(14, 16 + oy, 4, 1)
  // sleeves
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#0d1840'; ctx.fillRect(5, 11 + oy + armSwing, 5, 9); ctx.fillRect(22, 11 + oy - armSwing, 5, 9)
  ctx.fillStyle = '#3060c0'; ctx.fillRect(5, 18 + oy + armSwing, 5, 2); ctx.fillRect(22, 18 + oy - armSwing, 5, 2)
  // neck/face
  ctx.fillStyle = '#c8a888'; ctx.fillRect(14, 7 + oy, 4, 4); ctx.fillRect(10, 7 + oy, 12, 5)
  // glowing cyan eyes
  ctx.fillStyle = '#a0f0ff'; ctx.fillRect(11, 7 + oy, 3, 2); ctx.fillRect(18, 7 + oy, 3, 2)
  ctx.fillStyle = '#ffffff'; ctx.fillRect(11, 7 + oy, 2, 1); ctx.fillRect(18, 7 + oy, 2, 1)
  // hood
  ctx.fillStyle = '#08113a'; ctx.fillRect(8, 3 + oy, 16, 7)
  ctx.fillStyle = '#142a60'; ctx.fillRect(10, 4 + oy, 12, 5)
  ctx.fillStyle = '#3060c0'; ctx.fillRect(9, 4 + oy, 14, 1)
  // floating clock above head
  const tx = 16 + Math.sin(frame * 0.08) * 1.5
  ctx.fillStyle = `rgba(160,210,255,${0.7 + glow * 0.3})`
  ctx.beginPath(); ctx.arc(tx, -2 + oy, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1
  const handA = frame * 0.15
  ctx.beginPath(); ctx.moveTo(tx, -2 + oy); ctx.lineTo(tx + Math.cos(handA) * 2.5, -2 + oy + Math.sin(handA) * 2.5); ctx.stroke()
  // crystal staff
  ctx.fillStyle = '#2a4a90'; ctx.fillRect(26, 4 + oy, 2, 26)
  ctx.fillStyle = `rgba(140,200,255,${0.5 + glow * 0.5})`
  ctx.beginPath(); ctx.moveTo(27, -1 + oy); ctx.lineTo(31, 4 + oy); ctx.lineTo(27, 9 + oy); ctx.lineTo(23, 4 + oy); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#e0f0ff'
  ctx.beginPath(); ctx.arc(27, 4 + oy, 1.5, 0, Math.PI * 2); ctx.fill()
}

// ─── Beastmaster ───────────────────────────────────────────────────────────
function drawBeastmaster(ctx: CanvasRenderingContext2D, direction: Direction, isMoving: boolean, isAttacking: boolean, frame: number) {
  const bob = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  const oy = bob
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(16, 30, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill()
  // boots
  ctx.fillStyle = '#3a2010'; ctx.fillRect(11, 28 + oy, 4, 3); ctx.fillRect(17, 28 + oy, 4, 3)
  ctx.fillStyle = '#5a3818'; ctx.fillRect(11, 28 + oy, 4, 1); ctx.fillRect(17, 28 + oy, 4, 1)
  // pants - fur leather
  ctx.fillStyle = '#5a3818'; ctx.fillRect(10, 20 + oy, 12, 9)
  ctx.fillStyle = '#7a5028'; ctx.fillRect(11, 21 + oy, 4, 7)
  ctx.fillStyle = '#3a2010'; ctx.fillRect(10, 28 + oy, 12, 1)
  // belt with claw
  ctx.fillStyle = '#2a1808'; ctx.fillRect(10, 19 + oy, 12, 2)
  ctx.fillStyle = '#d4a030'; ctx.fillRect(15, 19 + oy, 2, 2)
  ctx.fillStyle = '#fff0a0'; ctx.fillRect(15, 19 + oy, 1, 1)
  // tunic
  ctx.fillStyle = '#3a5020'; ctx.fillRect(9, 11 + oy, 14, 9)
  ctx.fillStyle = '#5a7030'; ctx.fillRect(11, 12 + oy, 4, 7)
  // fur trim
  ctx.fillStyle = '#a08060'; ctx.fillRect(8, 11 + oy, 16, 2)
  for (let i = 0; i < 8; i++) ctx.fillRect(9 + i * 2, 11 + oy, 1, 3)
  // arms
  const armSwing = isMoving ? Math.sin(frame * 0.4) * 3 : 0
  ctx.fillStyle = '#3a5020'; ctx.fillRect(5, 12 + oy + armSwing, 5, 8); ctx.fillRect(22, 12 + oy - armSwing, 5, 8)
  ctx.fillStyle = '#a08060'; ctx.fillRect(5, 19 + oy + armSwing, 5, 1); ctx.fillRect(22, 19 + oy - armSwing, 5, 1)
  // hands
  ctx.fillStyle = '#c8a888'; ctx.fillRect(5, 20 + oy + armSwing, 5, 3); ctx.fillRect(22, 20 + oy - armSwing, 5, 3)
  // neck/face
  ctx.fillStyle = '#c8a888'; ctx.fillRect(14, 8 + oy, 4, 4); ctx.fillRect(10, 4 + oy, 12, 7)
  ctx.fillStyle = '#b89878'; ctx.fillRect(10, 10 + oy, 12, 2)
  // war paint stripes
  ctx.fillStyle = '#c02020'; ctx.fillRect(11, 9 + oy, 3, 1); ctx.fillRect(18, 9 + oy, 3, 1)
  // eyes - amber
  ctx.fillStyle = '#ffa040'; ctx.fillRect(11, 7 + oy, 3, 2); ctx.fillRect(18, 7 + oy, 3, 2)
  ctx.fillStyle = '#ffe080'; ctx.fillRect(11, 7 + oy, 2, 1); ctx.fillRect(18, 7 + oy, 2, 1)
  // wild hair / fur hood with ears
  ctx.fillStyle = '#5a3818'; ctx.fillRect(9, 2 + oy, 14, 5)
  ctx.fillStyle = '#7a5028'; ctx.fillRect(10, 3 + oy, 12, 3)
  // ears
  ctx.fillStyle = '#5a3818'
  ctx.beginPath(); ctx.moveTo(8, 4 + oy); ctx.lineTo(10, 0 + oy); ctx.lineTo(12, 4 + oy); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(20, 4 + oy); ctx.lineTo(22, 0 + oy); ctx.lineTo(24, 4 + oy); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#c08060'
  ctx.beginPath(); ctx.moveTo(9, 4 + oy); ctx.lineTo(10, 2 + oy); ctx.lineTo(11, 4 + oy); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(21, 4 + oy); ctx.lineTo(22, 2 + oy); ctx.lineTo(23, 4 + oy); ctx.closePath(); ctx.fill()
  // bow on back
  ctx.strokeStyle = '#5a3818'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(2, 16 + oy, 9, -Math.PI / 2, Math.PI / 2); ctx.stroke()
  ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.moveTo(2, 7 + oy); ctx.lineTo(2, 25 + oy); ctx.stroke()
  // spirit wolf companion (small) — beside player
  if (isAttacking || (frame % 120) < 60) {
    const wx = 28, wy = 22 + oy
    ctx.fillStyle = 'rgba(180,220,255,0.6)'
    ctx.fillRect(wx, wy, 6, 4)
    ctx.fillRect(wx + 5, wy - 2, 3, 3)
    ctx.fillStyle = '#80f0ff'; ctx.fillRect(wx + 6, wy - 1, 1, 1)
    ctx.fillStyle = 'rgba(180,220,255,0.6)'; ctx.fillRect(wx + 1, wy + 4, 1, 2); ctx.fillRect(wx + 4, wy + 4, 1, 2)
  }
}
