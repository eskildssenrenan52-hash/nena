import { useState } from 'react'
import type { GameState } from '@/lib/game/types'

interface Props {
  gameState: GameState
  onToggleDevMode: () => void
  onTeleportClick: () => void
  onGiveMoney: () => void
  onGiveXP: () => void
  onGiveItem: () => void
  onKillAll: () => void
  onSetHP: (pct: number) => void
  onSetMP: (pct: number) => void
  onChangeMap: (mapId: string) => void
}

const MAPS = [
  { id: 'city',       label: 'Cidade'   },
  { id: 'forest',     label: 'Floresta' },
  { id: 'deepforest', label: 'F.Antiga' },
  { id: 'dungeon',    label: 'Masmorra' },
  { id: 'tundra',     label: 'Tundra'   },
  { id: 'desert',     label: 'Deserto'  },
  { id: 'swamp',      label: 'Pântano'  },
  { id: 'volcano',    label: 'Vulcão'   },
  { id: 'abyss',      label: 'Abismo'   },
]

export default function DevPanel({
  gameState, onToggleDevMode, onTeleportClick,
  onGiveMoney, onGiveXP, onGiveItem, onKillAll,
  onSetHP, onSetMP, onChangeMap,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const hour = gameState._timeOfDay !== undefined ? Math.floor((gameState._timeOfDay / 14400) * 24) : 0

  const P = { fontSize: 11, fontFamily: 'monospace' }
  const BtnBase: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, cursor: 'pointer', padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: '#fff', transition: 'opacity 0.15s' }

  return (
    <div style={{
      position: 'absolute', top: 56, left: 8, zIndex: 200,
      background: 'rgba(8,4,18,0.97)', border: '1.5px solid rgba(120,40,200,0.5)',
      borderRadius: 10, padding: '8px 12px', minWidth: 220,
      boxShadow: '0 4px 32px rgba(120,40,200,0.25)',
      fontFamily: 'monospace',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 8 }}>
        <span style={{ color: '#e060ff', fontWeight: 700, fontSize: 12 }}>⚙ DEV MODE</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => setCollapsed(c => !c)} style={{ ...BtnBase, background: '#3a1860' }}>{collapsed ? '▼' : '▲'}</button>
          <button onClick={onToggleDevMode}             style={{ ...BtnBase, background: '#601020' }}>OFF</button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Status */}
          <div style={{ ...P, color: '#5080b0', marginBottom: 8, fontSize: 10, lineHeight: 1.5 }}>
            Lv {gameState.player?.level}  ·  HP {gameState.player?.hp}/{gameState.player?.stats.maxHp}<br/>
            Gold: {gameState.player?.gold?.toLocaleString()}  ·  {gameState.currentMap?.id}  ·  {hour}h
          </div>

          {/* Action grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
            {[
              { label: '+ Ouro',      bg: '#6a5010', cb: onGiveMoney },
              { label: '+ XP ×10',   bg: '#104870', cb: onGiveXP    },
              { label: '+ Item Lend.',bg: '#501870', cb: onGiveItem  },
              { label: 'Matar Tudo', bg: '#601010', cb: onKillAll   },
              { label: 'HP 100%',    bg: '#105030', cb: () => onSetHP(1)   },
              { label: 'HP 10%',     bg: '#503010', cb: () => onSetHP(0.1) },
              { label: 'MP 100%',    bg: '#102060', cb: () => onSetMP(1)   },
              { label: 'MP 0%',      bg: '#201830', cb: () => onSetMP(0)   },
            ].map(b => (
              <button key={b.label} onClick={b.cb} style={{ ...BtnBase, background: b.bg }}>{b.label}</button>
            ))}
          </div>

          {/* Teleport */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={onTeleportClick}
              style={{ ...BtnBase, width: '100%', background: '#3a1060', padding: '5px 8px', textAlign: 'center' }}
            >
              🎯 Teleporte (clique no canvas)
            </button>
          </div>

          {/* Map grid */}
          <div style={{ color: '#5040a0', fontSize: 9, marginBottom: 5 }}>VIAJAR PARA:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {MAPS.map(m => (
              <button
                key={m.id}
                onClick={() => onChangeMap(m.id)}
                style={{
                  ...BtnBase, fontSize: 9, padding: '3px 4px', textAlign: 'center',
                  background: gameState.currentMap?.id === m.id ? '#3a1870' : '#12102a',
                  border: gameState.currentMap?.id === m.id ? '1px solid #8040e0' : '1px solid rgba(60,40,120,0.4)',
                  color: gameState.currentMap?.id === m.id ? '#c090ff' : '#6050a0',
                }}
              >{m.label}</button>
            ))}
          </div>

          <div style={{ color: '#3a2050', fontSize: 9, marginTop: 8 }}>Imortalidade ativa  ·  F9 para fechar</div>
        </>
      )}
    </div>
  )
}
