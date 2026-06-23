import { memo } from 'react'
import type { StatusEffect } from '@/lib/game/types'

interface Props {
  effects: StatusEffect[] | undefined
  x?: number
  y?: number
}

function StatusEffectsHUD({ effects, x, y }: Props) {
  if (!effects || effects.length === 0) return null

  const content = (
    <div className="flex gap-0.5">
      {effects.map(e => (
        <div
          key={e.id}
          className="relative flex items-center justify-center rounded"
          style={{
            width: 16,
            height: 16,
            background: `${e.color}30`,
            border: `1px solid ${e.color}80`,
            fontSize: 10,
          }}
          title={`${e.name} (${e.duration} ticks)`}
        >
          {e.icon}
          <div
            className="absolute bottom-0 left-0 h-0.5"
            style={{
              width: `${Math.max(0, (e.duration / (e.tickInterval * 3)) * 100)}%`,
              background: e.color,
            }}
          />
        </div>
      ))}
    </div>
  )

  if (x !== undefined && y !== undefined) {
    return (
      <div
        className="absolute pointer-events-none"
        style={{ left: x, top: y, zIndex: 12 }}
      >
        {content}
      </div>
    )
  }

  return content
}

export default memo(StatusEffectsHUD) as unknown as typeof StatusEffectsHUD
