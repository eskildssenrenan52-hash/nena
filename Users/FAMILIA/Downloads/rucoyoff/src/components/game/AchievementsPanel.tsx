import type { GameState } from '@/lib/game/types'
import { ACHIEVEMENTS, TIER_COLORS } from '@/lib/game/achievements'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'

interface Props {
  gameState: GameState
  onClose: () => void
}

export default function AchievementsPanel({ gameState, onClose }: Props) {
  if (!gameState.player) return null
  const unlockedIds: string[] = gameState.player._achievements ?? []
  const unlocked = ACHIEVEMENTS.filter(a =>  unlockedIds.includes(a.id))
  const locked   = ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id))
  const pct      = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 560, maxHeight: '82vh', display: 'flex', flexDirection: 'column', background: 'rgba(6,8,18,0.98)', border: '1.5px solid rgba(60,30,100,0.6)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}>
        <ModalHeader title="CONQUISTAS" subtitle={`${unlocked.length} / ${ACHIEVEMENTS.length}  (${pct}%)`} accent="#c080ff" onClose={onClose} />

        {/* Progress bar */}
        <div style={{ padding: '8px 16px', background: 'rgba(8,6,16,0.8)', borderBottom: '1px solid rgba(40,20,70,0.5)' }}>
          <div style={{ background: 'rgba(10,6,20,0.9)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#6020b0,#c040ff)', transition: 'width 0.4s', boxShadow: '0 0 6px #c040ff40' }} />
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '14px 16px', flex: 1 }}>
          {unlocked.length > 0 && (
            <Section label={`DESBLOQUEADAS  (${unlocked.length})`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {unlocked.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(20,12,36,0.7)', borderRadius: 8, padding: '9px 11px', border: `1px solid ${TIER_COLORS[a.tier]}28` }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: TIER_COLORS[a.tier], fontWeight: 700, fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase' }}>{a.title}</div>
                      <div style={{ color: '#3a3550', fontSize: 10, marginTop: 1 }}>{a.description}</div>
                      <div style={{ color: '#806010', fontSize: 9, fontFamily: 'monospace', marginTop: 2 }}>+{a.rewardGold}g</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {locked.length > 0 && (
            <Section label={`BLOQUEADAS  (${locked.length})`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {locked.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(8,8,14,0.5)', borderRadius: 8, padding: '8px 11px', border: '1px solid rgba(24,20,36,0.5)', opacity: 0.55 }}>
                    <span style={{ fontSize: 22, filter: 'grayscale(1) opacity(0.3)', flexShrink: 0 }}>{a.icon}</span>
                    <div>
                      <div style={{ color: '#28243a', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>???</div>
                      <div style={{ color: '#201c2c', fontSize: 10, marginTop: 1 }}>{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <ModalFooter hint="[A] fechar" />
      </div>
    </Overlay>
  )
}
