import type { GameState } from '@/lib/game/types'
import { getActiveQuests } from '@/lib/game/quests'

/* ── Shared modal tokens ──────────────────────────────────────────────────── */
const M = {
  bg:      'rgba(6,8,18,0.98)',
  border:  '1.5px solid rgba(40,56,100,0.7)',
  hdr:     'rgba(8,10,22,0.98)',
  hdrBdr:  '1px solid rgba(30,42,80,0.7)',
  shadow:  '0 8px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(40,56,100,0.2)',
  sLabel:  { color: '#3a5070', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em' } as React.CSSProperties,
  foot:    { color: '#2a3850', fontSize: 9, fontFamily: 'monospace' } as React.CSSProperties,
}

/* ── Type badge colours ─────────────────────────────────────────────────── */
const TYPE_COLORS: Record<string, string> = {
  kill: '#e05050', collect: '#d0a020', reach_level: '#4090e0',
  explore: '#40c070', boss: '#d040d0',
}
const TYPE_LABELS: Record<string, string> = {
  kill: 'Matar', collect: 'Coletar', reach_level: 'Nível', explore: 'Explorar', boss: 'Chefe',
}

interface Props {
  gameState: GameState
  onClose: () => void
}

export default function QuestPanel({ gameState, onClose }: Props) {
  if (!gameState.player) return null
  const quests  = getActiveQuests(gameState.player)
  const active  = quests.filter(q => !q.completed)
  const done    = quests.filter(q =>  q.completed)

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 520, maxHeight: '78vh', display: 'flex', flexDirection: 'column', background: M.bg, border: M.border, borderRadius: 12, overflow: 'hidden', boxShadow: M.shadow }}>
        {/* Header */}
        <ModalHeader title="MISSÕES" subtitle={`${done.length} / ${quests.length} completas`} accent="#d0a030" onClose={onClose} />

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '14px 16px', flex: 1 }}>
          {active.length > 0 && (
            <Section label="EM ANDAMENTO">
              {active.map(q => {
                const pct = Math.min(1, q.currentCount / q.targetCount)
                const ac  = TYPE_COLORS[q.type] ?? '#4080c0'
                return (
                  <div key={q.id} style={{ background: 'rgba(12,16,32,0.8)', borderRadius: 8, padding: '10px 13px', marginBottom: 8, border: '1px solid rgba(36,48,80,0.6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ color: '#d8cca8', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>{q.title}</span>
                        <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: ac + '18', color: ac, border: `1px solid ${ac}40`, fontFamily: 'monospace' }}>{TYPE_LABELS[q.type]}</span>
                      </div>
                      <span style={{ color: '#b09020', fontSize: 10, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>+{q.rewardGold}g  +{q.rewardXp}xp</span>
                    </div>
                    <p style={{ color: '#5a7090', fontSize: 11, margin: '0 0 8px' }}>{q.description}</p>
                    {/* Progress bar */}
                    <div style={{ background: 'rgba(6,8,16,0.9)', borderRadius: 6, height: 7, overflow: 'hidden', marginBottom: 3 }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 6, background: pct >= 1 ? 'linear-gradient(90deg,#208040,#30c060)' : `linear-gradient(90deg,${ac}90,${ac})`, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#3a5060', fontSize: 9, fontFamily: 'monospace' }}>{q.currentCount} / {q.targetCount}</span>
                      {q.location && <span style={{ color: '#2a4050', fontSize: 9, fontFamily: 'monospace' }}>📍 {q.location}</span>}
                    </div>
                  </div>
                )
              })}
            </Section>
          )}
          {done.length > 0 && (
            <Section label="CONCLUÍDAS">
              {done.map(q => (
                <div key={q.id} style={{ background: 'rgba(8,18,10,0.5)', borderRadius: 7, padding: '7px 13px', marginBottom: 5, border: '1px solid rgba(24,48,26,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#2a6034', fontFamily: 'monospace', fontSize: 11 }}>✓  {q.title}</span>
                  <span style={{ color: '#1e4028', fontSize: 9, fontFamily: 'monospace' }}>+{q.rewardGold}g</span>
                </div>
              ))}
            </Section>
          )}
          {quests.length === 0 && <EmptyState text="Nenhuma missão disponível." />}
        </div>

        <ModalFooter hint="[Q] fechar" />
      </div>
    </Overlay>
  )
}

/* ── Shared sub-components (used across panels) ─────────────────────────── */

export function Overlay({ children, onBgClick }: { children: React.ReactNode; onBgClick: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onBgClick() }}
      style={{
        position: 'absolute', inset: 0, zIndex: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </div>
  )
}

export function ModalHeader({
  title, subtitle, accent = '#80a8d8', onClose,
}: { title: string; subtitle?: string; accent?: string; onClose: () => void }) {
  return (
    <div style={{ padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: M.hdr, borderBottom: M.hdrBdr }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ color: accent, fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>{title}</span>
        {subtitle && <span style={{ color: '#3a5070', fontSize: 10, fontFamily: 'monospace' }}>{subtitle}</span>}
      </div>
      <button
        onClick={onClose}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#5a6a7a', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 8px', transition: 'color 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#c0c8d0' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a6a7a' }}
      >×</button>
    </div>
  )
}

export function ModalFooter({ hint }: { hint: string }) {
  return (
    <div style={{ padding: '7px 16px', borderTop: '1px solid rgba(24,32,56,0.7)', ...M.foot }}>
      {hint}
    </div>
  )
}

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ ...M.sLabel, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <div style={{ color: '#2a3a4a', textAlign: 'center', padding: '32px 0', fontFamily: 'monospace', fontSize: 11 }}>{text}</div>
}

/* Re-export React so shared components work */
import React from 'react'
