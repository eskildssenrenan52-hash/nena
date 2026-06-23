import { memo } from 'react'
import type { Player } from '@/lib/game/types'
import { getAbilityDef } from '@/lib/game/abilities'

interface Props {
  player: Player
  onCast: (slot: number) => void
}

const HOTKEYS = ['1', '2', '3', '4']

function AbilityBar({ player, onCast }: Props) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-auto"
      style={{ bottom: 10, zIndex: 15, display: 'flex', gap: 6 }}
    >
      {player.abilities.map((ab, idx) => {
        const def = getAbilityDef(ab.id)
        if (!def) return null
        const locked = player.level < def.unlockLevel
        const cdPct = def.cooldown > 0 ? Math.min(1, ab.currentCooldown / def.cooldown) : 0
        const noMana = player.mp < def.manaCost
        const ready = !locked && ab.currentCooldown <= 0 && !noMana
        const click = () => { if (ready) onCast(idx) }

        return (
          <button
            key={ab.id}
            onClick={click}
            disabled={!ready}
            title={`${def.name}\n${def.description}\nMana: ${def.manaCost} • CD: ${(def.cooldown / 60).toFixed(1)}s${locked ? `\nDesbloqueia Nv.${def.unlockLevel}` : ''}`}
            style={{
              position: 'relative',
              width: 56, height: 56,
              borderRadius: 6,
              border: `2px solid ${ready ? def.color : '#2a3060'}`,
              background: 'rgba(8,10,18,0.92)',
              color: ready ? def.color : '#5a6080',
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: 18,
              cursor: ready ? 'pointer' : 'not-allowed',
              boxShadow: ready ? `0 0 12px ${def.color}55, inset 0 0 8px ${def.color}22` : 'none',
              opacity: locked ? 0.4 : 1,
              overflow: 'hidden',
              transition: 'border-color .15s, box-shadow .15s',
            }}
          >
            {/* icon text */}
            <div style={{ marginTop: 4 }}>{def.icon}</div>
            {/* hotkey */}
            <div style={{ position: 'absolute', top: 1, left: 3, fontSize: 9, color: '#8a9ab0' }}>
              {HOTKEYS[idx]}
            </div>
            {/* mana cost */}
            <div style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 9, color: noMana ? '#ff6060' : '#60a0ff' }}>
              {def.manaCost}
            </div>
            {/* cooldown overlay */}
            {ab.currentCooldown > 0 && !locked && (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: `rgba(0,0,0,0.65)`,
                  clipPath: `inset(0 0 ${(1 - cdPct) * 100}% 0)`,
                  pointerEvents: 'none',
                  fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {(ab.currentCooldown / 60).toFixed(1)}
              </div>
            )}
            {/* lock */}
            {locked && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#5a6080', background: 'rgba(0,0,0,0.45)',
              }}>
                🔒
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default memo(AbilityBar) as unknown as typeof AbilityBar
