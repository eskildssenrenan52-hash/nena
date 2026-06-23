// @ts-nocheck
import { useState } from 'react'
import type { Player } from '@/lib/game/types'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'
import {
  PRESTIGE_TREE, canPrestige, prestigeRequirement, performPrestige,
  investPrestigePoint, resetPrestigePoints, getActiveTitle,
} from '@/lib/game/prestigeSystem'

interface Props {
  player: Player
  onClose: () => void
  onPlayerUpdate: (p: Player) => void
}

const ACCENT = '#d8a534'

export default function PrestigePanel({ player, onClose, onPlayerUpdate }: Props) {
  const [msg, setMsg] = useState<string>('')
  const info = player.prestige?.byClass[player.class]
  const rank = info?.rank ?? 0
  const points = info?.totalPoints ?? 0
  const title = getActiveTitle(player)
  const canDo = canPrestige(player)
  const need = prestigeRequirement(rank)

  const grouped: Record<string, typeof PRESTIGE_TREE> = {
    'Combate': PRESTIGE_TREE.slice(0, 3),
    'Vitalidade': PRESTIGE_TREE.slice(3, 6),
    'Magia & Mobilidade': PRESTIGE_TREE.slice(6, 9),
    'Bônus Globais': PRESTIGE_TREE.slice(9, 12),
    'Keystones': PRESTIGE_TREE.slice(12),
  }

  const doPrestige = () => {
    if (!canDo) { setMsg(`Precisa de nível ${need} para prestigiar.`); return }
    const np = performPrestige(player)
    onPlayerUpdate(np)
    setMsg(`★ Prestígio ${np.prestige?.byClass[np.class].rank} alcançado!`)
  }
  const invest = (nodeId: string) => {
    const np = investPrestigePoint(player, nodeId)
    if (np === player) { setMsg('Sem pontos ou rank máximo atingido.'); return }
    onPlayerUpdate(np); setMsg('')
  }
  const reset = () => {
    const np = resetPrestigePoints(player)
    onPlayerUpdate(np); setMsg('Pontos resetados.')
  }

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 720, maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'rgba(8,6,2,0.98)', border: `1.5px solid ${ACCENT}40`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 8px 48px ${ACCENT}30` }}>
        <ModalHeader title="★ PRESTÍGIO  ·  ASCENSÃO ETERNA" accent={ACCENT} onClose={onClose} />

        {/* Status bar */}
        <div style={{ padding: '10px 18px', background: 'rgba(40,28,8,0.5)', borderBottom: `1px solid ${ACCENT}30`, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
          <span style={{ color: ACCENT }}>Classe: <b style={{ color: '#fff' }}>{player.class}</b></span>
          <span style={{ color: ACCENT }}>Rank: <b style={{ color: '#fff' }}>{rank}</b> / 10</span>
          <span style={{ color: ACCENT }}>Pontos: <b style={{ color: '#fff' }}>{points}</b></span>
          {title && <span style={{ color: '#ffe070' }}>“{title}”</span>}
          <span style={{ marginLeft: 'auto', color: canDo ? '#80e060' : '#806040' }}>
            Próximo: nv {need} {canDo ? '✓' : `(${player.level}/${need})`}
          </span>
          <button onClick={doPrestige} disabled={!canDo}
            style={{ padding: '6px 14px', borderRadius: 6, background: canDo ? `${ACCENT}` : '#332815', color: canDo ? '#1a1004' : '#665030', border: 'none', cursor: canDo ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontWeight: 700, fontSize: 11 }}>
            ★ PRESTIGIAR
          </button>
          <button onClick={reset} style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', color: '#a06040', border: '1px solid #604020', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>
            Resetar
          </button>
        </div>

        {msg && (
          <div style={{ padding: '6px 18px', background: 'rgba(30,20,4,0.9)', color: ACCENT, fontFamily: 'monospace', fontSize: 11 }}>{msg}</div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          {Object.entries(grouped).map(([label, nodes]) => (
            <Section key={label} label={label}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
                {nodes.map(node => {
                  const owned = info?.spent[node.id] ?? 0
                  const maxed = owned >= node.maxRank
                  const can = (points >= node.cost) && !maxed
                  return (
                    <div key={node.id} style={{
                      padding: 10, borderRadius: 8,
                      background: owned > 0 ? `${ACCENT}10` : 'rgba(18,12,4,0.6)',
                      border: `1px solid ${maxed ? ACCENT : owned > 0 ? ACCENT + '60' : '#332010'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>{node.icon}</span>
                        <span style={{ color: maxed ? ACCENT : '#d8c8a0', fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{node.name}</span>
                        <span style={{ marginLeft: 'auto', color: '#a08040', fontSize: 10, fontFamily: 'monospace' }}>{owned}/{node.maxRank}</span>
                      </div>
                      <p style={{ color: '#86755a', fontSize: 10, fontFamily: 'monospace', margin: '0 0 8px 0', lineHeight: 1.4 }}>{node.description}</p>
                      <button onClick={() => invest(node.id)} disabled={!can}
                        style={{ width: '100%', padding: '5px 8px', borderRadius: 5, background: can ? `${ACCENT}` : '#221810', color: can ? '#1a1004' : '#554030', border: 'none', cursor: can ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontSize: 10, fontWeight: 700 }}>
                        {maxed ? 'MAX' : `Investir (${node.cost}p)`}
                      </button>
                    </div>
                  )
                })}
              </div>
            </Section>
          ))}
        </div>

        <ModalFooter hint="★ Prestigie ao nv 50 (depois 60, 70...) — ganha pontos eternos." />
      </div>
    </Overlay>
  )
}
