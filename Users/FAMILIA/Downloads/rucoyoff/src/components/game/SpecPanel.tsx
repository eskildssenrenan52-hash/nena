// @ts-nocheck
import { useState } from 'react'
import type { Player } from '@/lib/game/types'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'
import {
  SPECIALIZATIONS, SPEC_UNLOCK_LEVEL, getSpecsForClass, setActiveSpec,
  specPointsAvailable, investSpecPoint, resetSpec,
} from '@/lib/game/specializations'

interface Props {
  player: Player
  onClose: () => void
  onPlayerUpdate: (p: Player) => void
}

const ACCENT = '#7ab8ff'

export default function SpecPanel({ player, onClose, onPlayerUpdate }: Props) {
  const specs = getSpecsForClass(player.class)
  const activeId = player.specializations?.active[player.class] ?? specs[0]?.id
  const [selectedId, setSelectedId] = useState<string>(activeId ?? specs[0].id)
  const spec = specs.find(s => s.id === selectedId) ?? specs[0]
  const invested = player.specializations?.invested[spec.id] ?? {}
  const points = specPointsAvailable(player, spec.id)
  const unlocked = player.level >= SPEC_UNLOCK_LEVEL
  const [msg, setMsg] = useState('')

  const setActive = () => {
    const np = setActiveSpec(player, spec.id)
    if (np === player) { setMsg('Precisa de nível 30 e classe correta.'); return }
    onPlayerUpdate(np); setMsg(`Especialização "${spec.name}" ativada!`)
  }
  const invest = (nodeId: string) => {
    const np = investSpecPoint(player, spec.id, nodeId)
    if (np === player) { setMsg('Sem pontos ou pré-requisitos não cumpridos.'); return }
    onPlayerUpdate(np); setMsg('')
  }
  const reset = () => { onPlayerUpdate(resetSpec(player, spec.id)); setMsg('Talentos resetados.') }

  // Build grid by row
  const maxRow = spec.tree.reduce((m, n) => Math.max(m, n.row), 0)
  const maxCol = 5

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 760, maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'rgba(4,8,18,0.98)', border: `1.5px solid ${ACCENT}40`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 8px 48px ${ACCENT}30` }}>
        <ModalHeader title="✦ ESPECIALIZAÇÕES" accent={ACCENT} onClose={onClose} />

        {/* Spec selector */}
        <div style={{ padding: '10px 18px', background: 'rgba(8,14,30,0.7)', borderBottom: `1px solid ${ACCENT}30`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'monospace', fontSize: 11 }}>
          {specs.map(s => (
            <button key={s.id} onClick={() => setSelectedId(s.id)}
              style={{
                padding: '6px 12px', borderRadius: 6,
                background: selectedId === s.id ? `${s.color}20` : 'transparent',
                color: selectedId === s.id ? s.color : '#5a7090',
                border: `1px solid ${selectedId === s.id ? s.color : '#1c2a40'}`,
                cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
              }}>
              {s.icon} {s.name}
              {activeId === s.id && <span style={{ marginLeft: 6, color: '#80e060' }}>●</span>}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: ACCENT }}>Pontos: <b style={{ color: '#fff' }}>{points}</b></span>
          <button onClick={setActive} disabled={!unlocked || activeId === spec.id}
            style={{ padding: '6px 12px', borderRadius: 6, background: activeId === spec.id ? '#1a2c1a' : ACCENT, color: activeId === spec.id ? '#508060' : '#04101e', border: 'none', cursor: unlocked ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontWeight: 700, fontSize: 11 }}>
            {activeId === spec.id ? '✓ ATIVA' : 'Ativar'}
          </button>
          <button onClick={reset} style={{ padding: '6px 10px', borderRadius: 6, background: 'transparent', color: '#a04060', border: '1px solid #602030', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>
            Resetar
          </button>
        </div>

        <div style={{ padding: '6px 18px', color: spec.color, fontFamily: 'monospace', fontSize: 10, fontStyle: 'italic', borderBottom: '1px solid rgba(28,42,64,0.5)' }}>
          “{spec.flavor}”
        </div>

        {!unlocked && (
          <div style={{ padding: '8px 18px', background: 'rgba(40,28,8,0.5)', color: '#e0a040', fontFamily: 'monospace', fontSize: 11 }}>
            🔒 Desbloqueia no nível {SPEC_UNLOCK_LEVEL} (atual: {player.level})
          </div>
        )}
        {msg && <div style={{ padding: '6px 18px', color: ACCENT, fontFamily: 'monospace', fontSize: 11 }}>{msg}</div>}

        {/* Talent tree grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
          <Section label="ÁRVORE DE TALENTOS">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxCol}, 1fr)`, gap: 8 }}>
              {Array.from({ length: maxRow * maxCol }, (_, idx) => {
                const row = Math.floor(idx / maxCol) + 1
                const col = idx % maxCol
                const node = spec.tree.find(n => n.row === row && n.col === col)
                if (!node) return <div key={idx} />
                const owned = invested[node.id] ?? 0
                const maxed = owned >= node.maxRank
                const can = points >= node.cost && !maxed && unlocked
                return (
                  <div key={node.id} style={{
                    padding: 10, borderRadius: 8,
                    background: owned > 0 ? `${spec.color}15` : 'rgba(8,14,30,0.6)',
                    border: `1px solid ${maxed ? spec.color : owned > 0 ? spec.color + '60' : '#1c2a40'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{node.icon}</span>
                      <span style={{ color: maxed ? spec.color : '#a8c0e0', fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{node.name}</span>
                      <span style={{ marginLeft: 'auto', color: '#506080', fontSize: 10, fontFamily: 'monospace' }}>{owned}/{node.maxRank}</span>
                    </div>
                    <p style={{ color: '#5a7090', fontSize: 10, fontFamily: 'monospace', margin: '0 0 8px 0', lineHeight: 1.4 }}>{node.description}</p>
                    <button onClick={() => invest(node.id)} disabled={!can}
                      style={{ width: '100%', padding: '4px 8px', borderRadius: 5, background: can ? spec.color : '#10182a', color: can ? '#04101e' : '#3a4a6a', border: 'none', cursor: can ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontSize: 10, fontWeight: 700 }}>
                      {maxed ? 'MAX' : `Investir (${node.cost}p)`}
                    </button>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>

        <ModalFooter hint="✦ Cada nível acima de 30 dá 1 ponto · cada spec usa pontos próprios" />
      </div>
    </Overlay>
  )
}
