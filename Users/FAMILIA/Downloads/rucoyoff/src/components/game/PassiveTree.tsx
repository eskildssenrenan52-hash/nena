import type { Player } from '@/lib/game/types'
import { PASSIVES, getUnlockedPassives } from '@/lib/game/passives'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'

const CLASS_COLORS: Record<string, string> = {
  knight: '#d0a030', archer: '#40c060', mage: '#4080ff', necromancer: '#c040ff',
  paladin: '#f0d878', berserker: '#c83030', assassin: '#a0a0c0', druid: '#3aa84a',
}

interface Props {
  player: Player
  onClose: () => void
}

export default function PassiveTree({ player, onClose }: Props) {
  const unlocked = getUnlockedPassives(player)
  const upcoming = PASSIVES
    .filter(p => (!p.cls || p.cls === player.class) && player.level < p.level)
    .sort((a, b) => a.level - b.level)
    .slice(0, 8)

  const bonusSummary: Record<string, number> = {}
  for (const p of unlocked) {
    bonusSummary[p.stat] = (bonusSummary[p.stat] ?? 0) + p.value
  }

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'rgba(6,8,18,0.98)', border: '1.5px solid rgba(30,50,90,0.7)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}>
        <ModalHeader title="PASSIVAS" subtitle={`${unlocked.length} ativas  ·  Lv ${player.level}`} accent="#60a8ff" onClose={onClose} />

        <div style={{ overflowY: 'auto', padding: '14px 16px', flex: 1 }}>
          {/* Bonus summary row */}
          {Object.keys(bonusSummary).length > 0 && (
            <div style={{ background: 'rgba(10,16,32,0.7)', border: '1px solid rgba(30,48,80,0.5)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
              {Object.entries(bonusSummary).map(([stat, val]) => (
                <span key={stat} style={{ fontSize: 10, fontFamily: 'monospace', color: '#4080c0' }}>
                  <span style={{ color: '#2a4060' }}>{stat}:</span> +{typeof val === 'number' && val < 1 ? `${(val*100).toFixed(0)}%` : val}
                </span>
              ))}
            </div>
          )}

          {unlocked.length > 0 && (
            <Section label={`ATIVAS  (${unlocked.length})`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 4 }}>
                {unlocked.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 9, alignItems: 'center', background: 'rgba(8,20,12,0.7)', borderRadius: 8, padding: '8px 11px', border: `1px solid ${p.cls ? CLASS_COLORS[p.cls] : '#204030'}28` }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                    <div>
                      <div style={{ color: p.cls ? CLASS_COLORS[p.cls] : '#40b060', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }}>{p.name}</div>
                      <div style={{ color: '#2a5038', fontSize: 10, marginTop: 1 }}>{p.description}</div>
                      <div style={{ color: '#1e3828', fontSize: 8, fontFamily: 'monospace', marginTop: 2 }}>Nv {p.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {upcoming.length > 0 && (
            <Section label="PRÓXIMAS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {upcoming.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(8,10,20,0.5)', borderRadius: 7, padding: '6px 11px', border: '1px solid rgba(18,24,42,0.6)', opacity: 0.65 }}>
                    <span style={{ fontSize: 16, filter: 'grayscale(0.5)' }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#304260', fontWeight: 700, fontSize: 11, fontFamily: 'monospace' }}>{p.name}</span>
                      <span style={{ color: '#202c40', fontSize: 10, marginLeft: 8 }}>{p.description}</span>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#2a3a5a', fontSize: 9, fontFamily: 'monospace' }}>Lv {p.level}</div>
                      {p.cls && <div style={{ color: CLASS_COLORS[p.cls] + '60', fontSize: 8, fontFamily: 'monospace' }}>{p.cls}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {unlocked.length === 0 && upcoming.length === 0 && (
            <div style={{ color: '#2a3a4a', textAlign: 'center', padding: '32px 0', fontFamily: 'monospace' }}>Suba de nível para desbloquear passivas.</div>
          )}
        </div>

        <ModalFooter hint="[P] fechar  ·  Passivas aplicadas automaticamente ao subir de nível" />
      </div>
    </Overlay>
  )
}
