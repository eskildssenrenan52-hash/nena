import { memo } from 'react'
import type { GameState } from '@/lib/game/types'

interface Props { gameState: GameState }

function streakColor(n: number): string {
  if (n >= 20) return '#ff00ff'
  if (n >= 15) return '#ff4000'
  if (n >= 10) return '#ff8000'
  if (n >= 7)  return '#ffcc00'
  return '#80ff40'
}
function streakLabel(n: number): string {
  if (n >= 20) return '☠ LENDÁRIO'
  if (n >= 15) return '🔥 DOMINADOR'
  if (n >= 10) return '⚡ DEVASTADOR'
  if (n >= 7)  return '💥 IMPARÁVEL'
  return '⚔ KILL STREAK'
}

function BossBar({ gameState }: Props) {
  const boss   = gameState.currentMap?.monsters.find(m => m.elite === 'boss' && !m.isDead)
  const streak = gameState._killStreak ?? 0
  if (!boss && streak < 3) return null

  return (
    <div style={{
      position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
      zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
      pointerEvents: 'none',
    }}>
      {boss && (
        <div style={{
          width: 360, background: 'rgba(6,4,12,0.96)', borderRadius: 9,
          border: '1.5px solid rgba(120,16,28,0.8)', padding: '8px 13px',
          boxShadow: '0 4px 28px rgba(180,20,36,0.28)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: '#e03050', fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>
              ☠  {boss.name}
            </span>
            <span style={{ color: '#6a3040', fontFamily: 'monospace', fontSize: 9 }}>
              Nv {boss.level}  ·  CHEFE
            </span>
          </div>
          <div style={{ background: '#110608', borderRadius: 5, height: 10, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`, height: '100%', borderRadius: 5,
              background: 'linear-gradient(90deg,#7a0010,#c01030,#e02040)',
              transition: 'width 0.12s',
              boxShadow: '0 0 6px rgba(220,30,50,0.4)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span style={{ color: '#5a2030', fontFamily: 'monospace', fontSize: 9 }}>{boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}</span>
            <span style={{ color: '#5a2030', fontFamily: 'monospace', fontSize: 9 }}>{Math.round((boss.hp / boss.maxHp) * 100)}%</span>
          </div>
        </div>
      )}
      {streak >= 3 && (
        <div style={{
          background: 'rgba(6,4,12,0.94)', borderRadius: 20, padding: '4px 18px',
          border: `1.5px solid ${streakColor(streak)}50`,
          boxShadow: `0 0 14px ${streakColor(streak)}30`,
        }}>
          <span style={{ color: streakColor(streak), fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>
            {streakLabel(streak)}  ×{streak}
          </span>
        </div>
      )}
    </div>
  )
}

export default memo(BossBar) as unknown as typeof BossBar
